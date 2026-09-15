import {
  callout,
  code,
  h2,
  ol,
  p,
  references,
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 6, all six lessons.
 *
 * GitHub Actions as the concrete example, but the reasoning is portable. Lesson 6.6 (rollback) is
 * placed last on purpose: it is the one that must be decided *before* the first deploy, and the one
 * most teams only think about while something is already burning.
 */
export const lessons: LessonDraft[] = [
  written(
    'konsep-ci-cd',
    'Konsep CI vs CD',
    15,
    'Dua hal berbeda yang sering disebut satu napas.',
    [
      terms(
        {
          term: 'Continuous Integration (CI)',
          meaning:
            'Kebiasaan menggabungkan perubahan ke branch bersama sesering mungkin, disertai pemeriksaan otomatis pada tiap penggabungan. Yang ia jawab adalah pertanyaan "apakah kode ini sehat". Nilainya berasal dari seringnya, sebab menggabungkan perubahan kecil tiap hari jauh lebih murah daripada menggabungkan perubahan besar sebulan sekali.',
        },
        {
          term: 'Continuous Delivery',
          meaning:
            'Kelanjutan CI yang memastikan tiap perubahan yang lulus pemeriksaan **siap** dirilis kapan saja, dengan langkah rilis terakhir masih ditekan manusia. Yang dijamin adalah kesiapannya, bukan otomatis terkirimnya.',
        },
        {
          term: 'Continuous Deployment',
          meaning:
            'Bentuk yang lebih jauh, tiap perubahan yang lulus pemeriksaan **langsung** dirilis ke produksi tanpa persetujuan manual. Menuntut kepercayaan tinggi pada pemeriksaan otomatis dan rencana rollback yang benar-benar bekerja.',
        },
        {
          term: 'pipeline',
          meaning:
            'Rangkaian tahap otomatis yang dijalani sebuah perubahan, misalnya pasang dependensi, lint, type-check, test, build, lalu deploy. Tiap tahap bisa meluluskan atau menggagalkan, dan tahap berikutnya hanya berjalan bila yang sebelumnya lulus.',
        },
        {
          term: 'build agent atau runner',
          meaning:
            'Mesin yang menjalankan tahap-tahap pipeline. Bisa disediakan layanan CI, bisa juga mesin milikmu sendiri yang didaftarkan. Lingkungannya harus cukup mirip produksi supaya hasil pemeriksaannya berarti.',
        },
        {
          term: 'fail fast',
          meaning:
            'Menyusun tahap dari yang paling cepat dan paling sering gagal lebih dulu, misalnya lint sebelum test, dan test sebelum build. Menghemat waktu tunggu, sebab kegagalan yang murah ditemukan lebih awal.',
        },
        {
          term: 'flaky test',
          meaning:
            'Test yang kadang lulus dan kadang gagal tanpa perubahan kode apa pun, biasanya karena bergantung pada waktu, urutan, atau sumber daya bersama. Bahayanya bukan pada kegagalannya melainkan pada kebiasaan yang ia bentuk, yaitu menjalankan ulang pipeline sampai hijau, yang membuat kegagalan sungguhan ikut diabaikan.',
        },
        {
          term: 'merge gate',
          meaning:
            'Pemeriksaan yang wajib hijau sebelum penggabungan diizinkan. Inilah yang mengubah kesepakatan "seharusnya dijalankan" menjadi sesuatu yang tidak bisa dilewati karena lupa.',
        },
      ),

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
          ['< 5 menit', 'Orang menunggu — feedback terasa langsung'],
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
      h2('Studi kasus di project nyata'),
      p(
        'Nilai CI bukan pada otomatisasinya melainkan pada **kapan** sebuah kesalahan ditemukan. Selisih itu bisa diukur, dan angkanya menjelaskan seluruh alasan memasangnya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          format:check     3.691 ms
          lint             6.021 ms
          type-check       2.403 ms
          test             7.184 ms
          build           64.834 ms

        Empat pemeriksaan pertama selesai dalam 19,3 detik.
        Build-nya sendiri 64,8 detik — lebih lama daripada keempatnya
        digabung, lebih dari tiga kali lipat.
        `,
        { caption: 'Angka itu yang menentukan urutan langkah di pipeline, bukan selera.' },
      ),
      p(
        'Kesimpulannya langsung. Bila ada kesalahan tipe, tidak ada gunanya menunggu 64 detik untuk build sebelum mengetahuinya. Pipeline disusun supaya yang **paling cepat gagal** berjalan **paling awal**.',
      ),
      code(
        'text',
        `
        URUTAN YANG SALAH — gagal diketahui setelah 85 detik:
          build (64,8s) -> test (7,2s) -> lint (6,0s) -> type-check (2,4s)

        URUTAN YANG BENAR — kesalahan tipe diketahui setelah 2,4 detik:
          type-check (2,4s) -> format (3,7s) -> lint (6,0s)
            -> test (7,2s) -> build (64,8s)

        Dan bila keempat pemeriksaan pertama dijalankan PARALEL,
        umpan baliknya kira-kira selama yang terlama di antaranya,
        yaitu sekitar 7 detik, bukan 19,3.
        `,
      ),
      p(
        'Perbedaan CI dan CD sendiri terletak pada siapa yang menekan tombolnya, dan keputusan itu bergantung pada satu hal yang sangat konkret.',
      ),
      table(
        ['', 'Continuous Delivery', 'Continuous Deployment'],
        [
          ['Setelah CI hijau', 'Artefak siap, menunggu persetujuan', 'Langsung ke produksi'],
          ['Yang menekan tombol', 'Manusia', 'Pipeline'],
          ['Syarat agar aman', 'Ada yang benar-benar meninjau', 'Test yang benar-benar bisa merah'],
          [
            'Cocok saat',
            'Rilis jarang, akibat kegagalan besar',
            'Rilis sering, rollback cepat, pemantauan ada',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah syarat yang sering diabaikan. Deployment otomatis hanya sebaik test yang mendahuluinya, dan test yang tidak pernah merah tidak memberi jaminan apa pun.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan CI yang paling merusak bukan pipeline yang merah melainkan pipeline yang hijau padahal tidak seharusnya.',
      ),
      code(
        'text',
        `
        1. Langkah gagal tapi pipeline tetap hijau

           - run: npm run lint || true
           - run: npm test
             continue-on-error: true

           Keduanya membuat kegagalan tidak menghentikan apa pun.
           Biasanya ditambahkan "sementara" saat sedang terburu-buru,
           lalu tidak pernah dicabut.

        2. Test yang tidak pernah gagal

           it('harus menolak input tidak valid', () => {
             const hasil = validasi({});
             // lupa menulis expect-nya
           });

           Test ini SELALU lulus. Ia menambah angka jumlah test,
           dan tidak menguji apa pun.

        3. Pemeriksaan berjalan di kode yang salah

           Workflow yang dipicu pull_request_target berjalan pada kode
           BRANCH TUJUAN, bukan kode dari PR-nya. Perubahan yang
           dikirim tidak pernah diperiksa.
        `,
      ),
      p(
        'Kegagalan kedua berupa pipeline yang merah tanpa ada yang salah pada kodenya, dan ini yang perlahan membuat orang berhenti memercayainya.',
      ),
      code(
        'text',
        `
        Penyebab merah palsu yang paling sering:

          - test bergantung pada waktu atau urutan
          - test memakai basis data bersama yang isinya saling menimpa
          - test memanggil layanan luar yang kadang lambat
          - versi dependency berubah karena rentangnya terlalu longgar
          - mesin CI lebih lambat daripada laptop, timeout terlampaui

        Biaya sesungguhnya bukan waktunya melainkan kebiasaan yang
        lahir: orang mulai menjalankan ulang pipeline tanpa membaca
        errornya. Setelah itu, pipeline merah yang SUNGGUHAN pun
        ikut dijalankan ulang.
        `,
        {
          caption:
            'Test yang kadang merah lebih buruk daripada tidak ada test, sebab ia melatih tim mengabaikan alarm.',
        },
      ),
      p(
        'Satu lagi yang khas terjadi pada project ini sendiri saat pipeline dijalankan, dan pantas dicatat apa adanya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          format:check     exit=1

        Satu berkas test yang TIDAK disentuh dalam pekerjaan ini
        ternyata belum sesuai format prettier. Artinya pemeriksaan
        format memang belum pernah hijau, dan tidak ada yang
        menyadarinya karena ia tidak dijalankan di CI.

        Pelajarannya: pemeriksaan yang tidak dijalankan otomatis
        akan menyimpang, dan penyimpangan itu baru terlihat ketika
        seseorang menjalankannya secara kebetulan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p('CI mudah dipasang dan mudah dipasang dengan cara yang membuatnya tidak berarti.'),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh `build` sebagai langkah pertama',
            'Itu yang paling penting',
            'Diukur, build 64,8 detik sementara type-check 2,4 detik. Kesalahan tipe baru ketahuan 27 kali lebih lambat',
          ],
          [
            'Menambahkan `|| true` atau `continue-on-error`',
            'Sementara saja, biar tidak menghambat',
            'Pipeline menjadi hijau selamanya. "Sementara" itu hampir tidak pernah dicabut',
          ],
          [
            'Menjalankan ulang pipeline yang merah tanpa membaca errornya',
            'Biasanya lolos kalau diulang',
            'Itu melatih tim mengabaikan alarm. Perbaiki test yang tidak stabil, jangan biasakan mengulang',
          ],
          [
            'Menjalankan pemeriksaan hanya di lokal',
            'Saya selalu menjalankannya sebelum push',
            'Diukur pada project ini, `format:check` gagal pada berkas yang sudah lama ada. Tanpa CI, penyimpangan tidak terlihat',
          ],
          [
            'Membiarkan CI berjalan sepuluh menit',
            'Yang penting lengkap',
            'Umpan balik yang lambat membuat orang berpindah ke pekerjaan lain. Paralelkan, dan cache dependency',
          ],
          [
            'Menganggap CI hijau berarti aman di-deploy',
            'Semua test lulus',
            'CI menguji apa yang ditulis di dalamnya. Test tanpa `expect` juga lulus',
          ],
        ],
      ),
      p(
        'Cara menguji apakah CI-mu benar-benar bekerja hanya perlu satu percobaan yang sengaja, yaitu merusak sesuatu dan memastikan pipeline-nya merah. Ubah satu tipe menjadi salah, hapus satu `await`, atau balik satu `expect`, lalu kirim sebagai pull request. Bila pipeline tetap hijau, yang kamu miliki bukan jaring pengaman melainkan hiasan, dan jauh lebih baik mengetahuinya sekarang daripada pada rilis yang membawa bug ke produksi.',
      ),
      references(
        {
          label: 'About continuous integration',
          href: 'https://docs.github.com/en/actions/concepts/overview/continuous-integration',
          source: 'GitHub Docs',
          note: 'Definisi CI beserta apa yang sebenarnya dijanjikannya',
        },
        {
          label: 'Release engineering',
          href: 'https://sre.google/sre-book/release-engineering/',
          source: 'Google SRE Book',
          note: 'Prinsip rilis yang bisa diulang dan konsisten, dari pihak yang menjalankannya pada skala besar',
        },
        {
          label: 'Build, release, run',
          href: 'https://12factor.net/build-release-run',
          source: 'Twelve-Factor App',
          note: 'Pemisahan tahap yang menjadi dasar bentuk pipeline',
        },
      ),
    ],
  ),

  written(
    'github-actions',
    'GitHub Actions: workflow, job, step',
    17,
    'Struktur, dan bagian yang menentukan keamanannya.',
    [
      terms(
        {
          term: 'workflow',
          meaning:
            'Berkas YAML di `.github/workflows/` yang mendeskripsikan otomatisasi, mulai dari apa yang memicunya sampai pekerjaan apa yang dijalankan. Satu repository boleh punya banyak workflow yang berjalan sendiri-sendiri.',
        },
        {
          term: 'event (pemicu)',
          meaning:
            'Peristiwa yang menjalankan workflow, ditulis di kunci `on`, misalnya `push`, `pull_request`, `schedule` untuk jadwal, dan `workflow_dispatch` untuk dijalankan manual dari antarmuka.',
        },
        {
          term: 'job',
          meaning:
            'Satu kelompok langkah yang berjalan di satu runner. Antar-job berjalan paralel secara bawaan, dan urutannya diatur dengan `needs`. Karena tiap job dapat runner sendiri, berkas hasil satu job tidak otomatis terlihat oleh job lain.',
        },
        {
          term: 'step',
          meaning:
            'Satu langkah di dalam job, berupa perintah shell lewat `run` atau pemanggilan action lewat `uses`. Langkah dijalankan berurutan dalam satu runner yang sama.',
        },
        {
          term: 'action',
          meaning:
            'Satuan yang bisa dipakai ulang dan dipanggil dengan `uses`, misalnya `actions/checkout`. Menyematkan versinya penting, dan menyematkan ke hash commit lebih aman daripada ke tag, sebab tag bisa dipindahkan pemiliknya.',
        },
        {
          term: 'runner',
          meaning:
            'Mesin yang menjalankan job. GitHub menyediakan runner terkelola dengan sistem operasi pilihan, dan kamu juga bisa mendaftarkan mesin sendiri untuk kebutuhan khusus.',
        },
        {
          term: 'matrix',
          meaning:
            'Cara menjalankan job yang sama pada beberapa kombinasi nilai sekaligus, misalnya tiga versi Node. Berguna untuk menguji kompatibilitas, dengan biaya waktu yang berlipat sesuai jumlah kombinasinya.',
        },
        {
          term: 'artifact',
          meaning:
            'Berkas hasil sebuah job yang disimpan supaya bisa diunduh atau dipakai job lain. Inilah cara memindahkan hasil build dari job yang membangun ke job yang merilis, sehingga yang dirilis benar-benar benda yang sama dengan yang diuji.',
        },
        {
          term: 'cache',
          meaning:
            'Penyimpanan hasil antara seperti folder dependensi supaya job berikutnya tidak mengunduh ulang. Berbeda dari artifact, cache adalah optimasi yang boleh meleset, sehingga pipeline tetap harus benar meski cache-nya kosong.',
        },
      ),

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
      p(
        'Blok `on:` menentukan kapan workflow berjalan, dan di sini ada **dua** pemicu dengan tujuan berbeda. `pull_request` menjalankan pemeriksaan sebelum kode masuk — itu gerbangnya. `push: branches: [main]` menjalankannya sekali lagi **setelah** merge, karena hasil merge bisa berbeda dari PR-nya sendiri: dua PR yang masing-masing hijau bisa saling merusak begitu digabung.',
      ),
      p(
        'Struktur `jobs → periksa → steps` adalah tiga lapis yang perlu dibedakan. Satu **job** berjalan di mesin virtual sendiri (`runs-on: ubuntu-latest`) yang bersih setiap kali; **step** di dalamnya berjalan berurutan di mesin yang sama, sehingga hasil `npm ci` bisa dipakai oleh `npm run lint` di bawahnya. Job yang berbeda tidak berbagi apa pun kecuali kamu mengaturnya secara eksplisit.',
      ),
      p(
        "Dua baris di `actions/setup-node` layak diperhatikan. `node-version-file: '.nvmrc'` mengambil versi Node dari berkas yang sama dengan yang dipakai laptopmu — sehingga CI tidak diam-diam menguji di versi lain. `cache: npm` menyimpan direktori cache npm antar-jalan, dan itu biasanya memangkas `npm ci` dari puluhan detik menjadi beberapa detik saja.",
      ),
      p(
        '`timeout-minutes: 15` adalah pengaman terhadap job yang menggantung. Tanpanya, tes yang menunggu koneksi yang tidak pernah datang bisa berjalan sampai batas bawaan GitHub selama enam jam sambil memakan kuota. Urutan lima `run` di bawahnya juga disengaja, sebab yang paling cepat gagal diletakkan paling atas, sehingga feedback-nya datang lebih awal.',
      ),
      callout(
        'danger',
        'Setel `permissions` secara eksplisit',
        'Tanpa itu, `GITHUB_TOKEN` bisa punya izin tulis ke repositori. Satu action pihak ketiga yang berbahaya, atau satu dependency yang dibajak, bisa memakainya untuk mendorong commit. Mulai dari `contents: read`, dan tambahkan hanya yang benar-benar dibutuhkan per job.',
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
      p(
        'Job tanpa `needs` berjalan **bersamaan**. `lint` dan `test` di atas dimulai pada saat yang sama di dua mesin terpisah, sehingga total waktunya adalah yang terlama di antara keduanya, bukan jumlahnya. Untuk pipeline yang lint-nya 1 menit dan tes-nya 4 menit, ini menghemat satu menit penuh di setiap push.',
      ),
      p(
        '`needs: [lint, test]` pada job `build` membalik aturan itu, sebab ia menunggu **keduanya** selesai dan lulus. Kalau salah satu gagal, `build` tidak dijalankan sama sekali, dan itu memang yang diinginkan karena membangun artefak dari kode yang tesnya merah hanya membuang menit runner. Perhatikan `needs` juga yang membentuk urutan, sebab tanpa itu ketiganya akan berjalan serentak dan `build` bisa selesai lebih dulu daripada tesnya.',
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
      p(
        'Perbedaan dua baris itu adalah perbedaan antara **nama** dan **isi**. `@v1` adalah tag Git — sebuah label yang pemiliknya bisa arahkan ulang ke commit mana pun kapan saja, tanpa memberitahu siapa-siapa. `@8ade135…` adalah SHA commit, yaitu hash dari isinya; mengubah satu karakter kode menghasilkan SHA yang berbeda, sehingga kode yang kamu jalankan besok pasti sama dengan yang kamu periksa hari ini.',
      ),
      p(
        'Komentar `# v1.2.0` di ujung baris bukan hiasan — deretan hash itu tidak terbaca manusia, dan tanpa komentar kamu tidak akan tahu versi mana yang sedang dipakai saat hendak memperbaruinya. Praktik ini terutama untuk action **pihak ketiga**; untuk action resmi seperti `actions/checkout@v4` yang dikelola GitHub sendiri, memakai tag umumnya masih diterima, meskipun menyematkan SHA tetap lebih ketat.',
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
      p(
        'Bedanya dengan `pull_request` biasa terletak pada **konteks siapa** workflow itu berjalan. `pull_request` menjalankan workflow dari sudut pandang PR: tanpa akses ke rahasia repositori, dan dengan token yang hanya bisa membaca. `pull_request_target` menjalankannya dari sudut pandang repositori tujuan — **dengan** seluruh rahasia yang kamu simpan di sana.',
      ),
      p(
        'Itu masih aman selama workflow-nya hanya menjalankan kode dari branch utama. Yang membuatnya berbahaya adalah kombinasi dengan langkah checkout yang mengambil kode PR lewat `ref: github.event.pull_request.head.sha`, sebab sejak saat itu skrip yang ditulis orang asing berjalan di lingkungan yang memegang token deploy dan kunci registry-mu. Ia ada karena kadang benar-benar dibutuhkan, misalnya untuk memberi label PR dari fork, tetapi kalau kamu tidak bisa menjelaskan kenapa membutuhkannya, jawabannya `pull_request`.',
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
      p(
        "`key` adalah identitas cache, dan bagian `hashFiles('**/package-lock.json')` di dalamnya membuatnya berubah otomatis setiap kali daftar dependency berubah. Itulah mekanisme yang mencegah cache basi, sebab lockfile baru berarti kunci baru, kunci baru berarti cache lama tidak dipakai. Menyusun kunci dari sesuatu yang tidak mencerminkan isinya, misalnya tanggal, adalah cara paling umum membuat cache yang salah dipulihkan.",
      ),
      p(
        '`restore-keys` adalah jalan mundurnya. Saat kunci persisnya belum ada (dependency baru saja berubah), Actions mencari cache terbaru yang **awalannya** cocok dengan `${runner.os}-build-` dan memulihkannya sebagai titik awal. Hasilnya, npm hanya perlu mengunduh paket yang benar-benar baru alih-alih semuanya. Perhatikan dua `path` yang di-cache, yaitu `~/.npm` untuk unduhan paket dan `.next/cache` untuk hasil kompilasi Next.js, dan keduanya artefak yang bisa dibuat ulang, bukan berkas yang bisa memuat kredensial.',
      ),
      callout(
        'warning',
        'Jangan pernah men-cache sesuatu yang bisa memuat rahasia',
        'Cache bisa dipulihkan oleh workflow lain di repositori yang sama, termasuk dari PR fork pada konfigurasi tertentu. Cache dependency dan artefak build — jangan cache berkas konfigurasi atau direktori yang bisa berisi kredensial.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Struktur GitHub Actions punya empat tingkat, dan memahami batas antar tingkat menjelaskan hampir semua perilakunya, termasuk hal-hal yang tampak aneh.',
      ),
      code(
        'text',
        `
        workflow   satu berkas .yaml, punya pemicu
          job      berjalan di MESIN SENDIRI, paralel secara bawaan
            step   berurutan di dalam job, berbagi mesin yang sama
              run / uses

        Yang paling sering mengejutkan: dua job TIDAK berbagi apa pun.
        Berkas yang dibuat di job A tidak ada di job B, dan direktori
        kerjanya bahkan bukan mesin yang sama.
        `,
        {
          caption:
            'Karena itu hasil build harus dikirim antar job lewat artifact atau cache, bukan sekadar ditulis ke disk.',
        },
      ),
      code(
        'text',
        `
        name: Pemeriksaan

        on:
          push:
            branches: [main]
          pull_request:

        # Batalkan jalannya yang lama bila ada push baru ke PR yang sama.
        concurrency:
          group: \${{ github.workflow }}-\${{ github.ref }}
          cancel-in-progress: true

        jobs:
          periksa:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4

              - uses: actions/setup-node@v4
                with:
                  node-version: '26'
                  cache: 'npm'          # cache ~/.npm, bukan node_modules

              - run: npm ci             # BUKAN npm install
              - run: npm run type-check
              - run: npm run format:check
              - run: npm run lint
              - run: npm test
        `,
      ),
      p(
        'Blok `concurrency` itu sering dilewatkan dan berbayar besar. Tanpa itu, lima kali push ke satu pull request menjalankan lima pipeline sekaligus, dan empat di antaranya sudah tidak relevan.',
      ),
      p('Urutan langkah di dalam `periksa` mengikuti angka yang sudah diukur pada project ini.'),
      code(
        'text',
        `
        Diukur sungguhan:
          type-check       2.403 ms   <- paling cepat gagal, paling awal
          format:check     3.691 ms
          lint             6.021 ms
          test             7.184 ms
          build           64.834 ms   <- paling mahal, paling akhir

        Dan bila keempatnya dipisah menjadi job yang berbeda, keduanya
        berjalan PARALEL di mesin masing-masing, sehingga waktu total
        mendekati yang terlama, bukan jumlahnya.

        Harganya: setiap job mengulang checkout dan npm ci. Untuk
        pemeriksaan yang masing-masing hanya beberapa detik, memisahnya
        justru bisa lebih lambat.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan GitHub Actions yang paling sering tidak berhubungan dengan kode melainkan dengan asumsi tentang mesinnya.',
      ),
      code(
        'text',
        `
        1. Berkas dari job sebelumnya tidak ada

           Error: ENOENT: no such file or directory, open 'dist/server.js'

           Job berbeda = mesin berbeda. Kirim lewat artifact:

             - uses: actions/upload-artifact@v4
               with: { name: hasil-build, path: dist/ }
             # di job berikutnya:
             - uses: actions/download-artifact@v4
               with: { name: hasil-build, path: dist/ }

        2. npm ci gagal

           npm error \`npm ci\` can only install packages when your
           package.json and package-lock.json are in sync

           Lockfile tidak ikut diperbarui saat dependency berubah.
           Perbaikan: jalankan npm install di lokal, commit lockfile-nya.
           JANGAN mengganti npm ci menjadi npm install di CI — itu
           membuang jaminan bahwa versinya persis sama.

        3. Permission denied saat menjalankan skrip

           /bin/sh: ./skrip.sh: Permission denied

           Bit eksekusi tidak ikut tersimpan. Perbaikan:
             git update-index --chmod=+x skrip.sh
           atau jalankan dengan: bash skrip.sh
        `,
      ),
      p(
        'Kelas kedua berupa langkah yang tampak berjalan padahal tidak melakukan apa-apa, dan ini yang paling sulit terlihat.',
      ),
      code(
        'text',
        `
        Cache yang tidak pernah kena:

          - uses: actions/cache@v4
            with:
              path: node_modules
              key: node-modules

          Kuncinya TETAP, jadi cache pertama akan dipakai selamanya —
          termasuk setelah dependency berubah.

          Yang benar: kunci ikut isi lockfile.
            key: \${{ runner.os }}-npm-\${{ hashFiles('**/package-lock.json') }}

        Dan untuk npm, meng-cache node_modules langsung lebih rapuh
        daripada meng-cache ~/.npm, sebab isinya bergantung pada
        platform dan versi Node.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang gejalanya menyesatkan:

          Error: Process completed with exit code 1.
            -> pesan umum. Yang menentukan ada di keluaran langkahnya,
               beberapa baris di atas. Bacalah ke atas, bukan ke bawah.

          The job running on runner has exceeded the maximum execution time
            -> ada yang menggantung. Sering karena test menunggu input,
               atau server dev dijalankan tanpa dijalankan di latar.

          Version 26 of Node.js is not available
            -> versi yang belum ada di runner. Periksa versi yang
               benar-benar didukung, jangan menebak.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Berkas workflow mudah disalin dari internet, dan kesalahannya hampir selalu berupa menyalin tanpa memahami batas antar tingkatnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengharapkan berkas dari job sebelumnya tersedia',
            'Kan satu workflow',
            'Setiap job berjalan di mesin sendiri. Kirim lewat artifact, atau gabungkan ke satu job',
          ],
          [
            'Mengganti `npm ci` menjadi `npm install` saat gagal',
            'Biar pipeline-nya jalan lagi',
            'Itu membuang jaminan versi yang persis. Perbaiki lockfile-nya, jangan longgarkan pemeriksaannya',
          ],
          [
            'Memakai kunci cache yang tetap',
            'Cache-nya kan selalu terpakai',
            'Cache pertama dipakai selamanya, termasuk setelah dependency berubah. Kunci harus ikut isi lockfile',
          ],
          [
            'Tidak memasang `concurrency`',
            'Setiap push memang perlu diperiksa',
            'Lima push menjalankan lima pipeline sekaligus, empat di antaranya sudah tidak relevan',
          ],
          [
            'Menaruh `build` sebelum pemeriksaan cepat',
            'Build yang paling penting',
            'Diukur, build 64,8 detik melawan type-check 2,4 detik. Umpan baliknya jadi 27 kali lebih lambat',
          ],
          [
            'Membaca pesan error terakhir saja',
            'Itu kan kesimpulannya',
            '`Process completed with exit code 1` tidak menjelaskan apa pun. Penyebabnya beberapa baris di ATAS',
          ],
        ],
      ),
      p(
        'Contoh workflow di sub-bab ini **tidak dijalankan** dalam penyusunan materi, sebab menjalankannya menuntut repositori GitHub beserta runner-nya, dan itu di luar jangkauan mesin tempat materi ini disiapkan. Yang dijalankan sungguhan adalah perintah yang ada di dalamnya, yaitu `format:check`, `lint`, `type-check`, `test`, dan `build` pada project ini, beserta waktunya masing-masing. Angka-angka itulah yang dipakai untuk menyusun urutan langkahnya, dan angka itu berlaku di mana pun pipeline-nya dijalankan.',
      ),
      references(
        {
          label: 'Workflow syntax for GitHub Actions',
          href: 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax',
          source: 'GitHub Docs',
          note: 'Rujukan seluruh kunci YAML beserta bentuk nilainya',
        },
        {
          label: 'Store and share data',
          href: 'https://docs.github.com/en/actions/tutorials/store-and-share-data',
          source: 'GitHub Docs',
          note: 'Beda artifact dan cache, serta cara memindahkan hasil antar-job',
        },
        {
          label: 'About continuous integration',
          href: 'https://docs.github.com/en/actions/concepts/overview/continuous-integration',
          source: 'GitHub Docs',
          note: 'Tempat workflow di dalam gagasan CI secara keseluruhan',
        },
      ),
    ],
  ),

  written(
    'pipeline-pemeriksaan',
    'Pipeline: lint → type-check → test → build',
    19,
    'Gerbang yang membuat "selesai" punya arti.',
    [
      terms(
        {
          term: 'lint',
          meaning:
            'Pemeriksaan pola kode yang menandai hal yang secara teknis sah tetapi bermasalah, misalnya variabel yang tidak dipakai atau `await` yang terlupa. Berbeda dari formatter yang mengurus tampilan, lint mengurus isi.',
        },
        {
          term: 'formatter',
          meaning:
            'Alat yang menulis ulang kode ke bentuk baku, misalnya Prettier. Karena keluarannya benar menurut definisi, kode tidak boleh diformat dengan tangan melawannya, dan perubahan format sebaiknya tidak dicampur ke dalam diff perubahan nyata.',
        },
        {
          term: 'type-check',
          meaning:
            'Pemeriksaan kecocokan tipe tanpa menghasilkan berkas keluaran, di TypeScript dijalankan dengan `tsc --noEmit`. Menangkap kelas kesalahan yang tidak terlihat lint dan tidak selalu tersentuh test.',
        },
        {
          term: 'unit test',
          meaning:
            'Test yang menguji satu potongan logika secara terpisah. Cepat dan banyak, dipakai untuk menutup banyak kasus termasuk yang jarang terjadi.',
        },
        {
          term: 'integration test',
          meaning:
            'Test yang menjalankan beberapa bagian bersama lewat antarmuka publiknya, sehingga menangkap kesalahan yang hanya muncul saat bagian-bagian itu bertemu. Lebih lambat dan lebih sedikit, tetapi lebih dekat dengan perilaku sungguhan.',
        },
        {
          term: 'exit code',
          meaning:
            'Angka yang dikembalikan sebuah perintah saat selesai, nol berarti berhasil dan bukan nol berarti gagal. Inilah yang dibaca CI untuk memutuskan lulus atau tidak, jadi perintah yang selesai belum tentu perintah yang lulus.',
        },
        {
          term: 'required status check',
          meaning:
            'Pemeriksaan yang wajib hijau sebelum tombol gabung bisa ditekan. Tanpa ditandai wajib, pemeriksaan tetap berjalan tetapi kegagalannya bisa diabaikan siapa saja.',
        },
        {
          term: 'pemeriksaan yang tidak pernah dijalankan',
          meaning:
            'Perintah yang ada di `package.json` tetapi tidak pernah masuk pipeline mana pun. Bahayanya halus, sebab penyimpangan menumpuk diam-diam dan baru terlihat ketika suatu hari ada yang menjalankannya, dan pada saat itu penyebabnya sudah bercampur dengan banyak perubahan lain.',
        },
      ),

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
      p(
        'Empat job di sini dibagi menurut **jenis kegagalan**, bukan sekadar dipecah agar rapi. `kualitas`, `test`, dan `keamanan` berjalan bersamaan karena tidak saling bergantung; `build` menunggu ketiganya lewat `needs`. Efek sampingnya berguna: saat pipeline merah, nama job yang gagal sudah memberi tahu kategori masalahnya sebelum kamu membuka log.',
      ),
      p(
        'Job `keamanan` memakai `fetch-depth: 0` pada checkout, dan itu bukan detail sepele. Bawaannya GitHub hanya mengambil satu commit terakhir; `gitleaks` perlu **seluruh riwayat** untuk menemukan rahasia yang pernah ter-commit lalu dihapus — yang justru kasus paling berbahaya, karena rahasianya masih bisa diambil dari commit lama meski tidak terlihat di kode sekarang.',
      ),
      p(
        '`npm audit --production --audit-level=high` sengaja dibatasi dua kali. `--production` mengabaikan devDependency, yang tidak ikut ke server sehingga kerentanannya tidak terjangkau penyerang; `--audit-level=high` membuat hanya kerentanan tinggi dan kritis yang menggagalkan build. Tanpa dua batasan itu, job ini akan merah hampir setiap minggu karena hal yang tidak bisa ditindaklanjuti — dan pipeline yang selalu merah palsu berhenti dibaca orang.',
      ),
      p(
        'Langkah terakhir di job `build` adalah jaring pengaman yang jarang dipasang orang: satu `grep -rqE` mencari pola rahasia (`sk_live` untuk kunci Stripe, `AKIA` untuk kunci AWS, `-----BEGIN` untuk kunci privat, `postgresql://` untuk connection string) di dalam `.next/static/` — direktori yang isinya dikirim ke browser setiap pengunjung. `exit 1` menggagalkan build kalau ada yang cocok.',
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
      p(
        'Tes ini tidak memeriksa apa yang aplikasi **lakukan**, melainkan bagaimana ia **disusun**. `imporRuntime(f)` menelusuri impor tiap berkas Client Component, `terlarang` menandai modul yang tidak boleh sampai ke browser, dan `expect(pelanggar).toEqual([])` menuntut daftarnya kosong. Kalau ada yang melanggar, pesan gagalnya langsung menyebut nama berkasnya.',
      ),
      p(
        'Yang membuat pola ini layak dipakai adalah jenis pelanggaran yang ia tangkap, yaitu pelanggaran yang **tidak terlihat**. Mengimpor data besar ke Client Component tidak merusak apa pun, sebab halaman tetap terbuka dan tes lain tetap hijau, hanya bundle yang dikirim ke pembaca membengkak diam-diam. Tanpa tes seperti ini, tidak ada momen ketika seseorang diberi tahu bahwa batasnya baru saja dilewati.',
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
      p(
        'Baris kedua adalah yang menghubungkan seluruh sub-bab ini dengan kenyataan. Nama `kualitas`, `test`, `keamanan`, `build` di sana adalah nama **job** dari workflow di atas — GitHub mencocokkannya persis, sehingga job yang kamu ganti namanya di workflow harus ikut diperbarui di sini, atau pemeriksaannya diam-diam berhenti diwajibkan.',
      ),
      p(
        '"Wajib branch up-to-date sebelum merge" menutup celah yang halus: PR-mu bisa hijau terhadap `main` seperti sepuluh hari lalu, sementara `main` sudah berubah sejak itu. Aturan ini memaksa PR diperbarui dan diuji ulang terhadap kondisi terkini — yang menangkap konflik semantik yang tidak muncul sebagai konflik merge.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Urutan pemeriksaan bukan soal kerapian melainkan soal berapa lama seseorang menunggu untuk tahu bahwa ia salah. Pada project ini, angkanya sudah diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, masing-masing dijalankan sendiri:

          type-check       2.403 ms   exit=0
          format:check     3.691 ms   exit=1
          lint             6.021 ms   exit=0
          test             7.184 ms   exit=0
          build           64.834 ms   exit=0

        Empat yang pertama : 19,3 detik
        Build sendirian     : 64,8 detik

        Build memakan 77% dari total waktu pipeline, dan ia satu-satunya
        langkah yang TIDAK menemukan kesalahan baru — semua yang bisa
        ditangkapnya sudah ditangkap type-check lebih dulu.
        `,
        { caption: 'Itulah dasar aturannya: yang paling cepat gagal berjalan paling awal.' },
      ),
      p(
        'Masing-masing langkah menjawab pertanyaan yang berbeda, dan mengetahui bedanya mencegah pekerjaan ganda.',
      ),
      table(
        ['Langkah', 'Pertanyaannya', 'Yang TIDAK dijawabnya'],
        [
          [
            '`format:check`',
            'Apakah bentuk tulisannya seragam?',
            'Apakah kodenya benar. Formatter tidak pernah membaca makna',
          ],
          [
            '`lint`',
            'Apakah ada pola yang diketahui bermasalah?',
            'Apakah logikanya benar. Lint tidak menjalankan kodenya',
          ],
          [
            '`type-check`',
            'Apakah tipenya konsisten di seluruh berkas?',
            'Apakah nilainya benar saat berjalan. Tipe adalah janji, bukan pemeriksaan',
          ],
          [
            '`test`',
            'Apakah perilakunya sesuai yang diharapkan?',
            'Perilaku yang tidak ditulis testnya',
          ],
          [
            '`build`',
            'Apakah ia bisa dibungkus menjadi artefak?',
            'Apakah artefaknya benar. Build yang berhasil bukan jaminan',
          ],
        ],
      ),
      p(
        'Baris ketiga pantas ditegaskan dengan bukti. Pada bab Desain API sudah diukur bahwa `const a: ResponsPublik = dariDb` lolos `tsc` tanpa satu pun error, dan `JSON.stringify(a)` tetap mengeluarkan `sandiHash`. Pemeriksaan tipe membantu, dan ia tidak pernah menjadi kontrol keamanan.',
      ),
      code(
        'text',
        `
        Bentuk pipeline yang mengikuti angka di atas:

          tahap 1 (paralel, ~7 detik)
            type-check
            format:check
            lint
            test

          tahap 2 (hanya bila tahap 1 hijau, ~65 detik)
            build
            unggah artefak

          tahap 3 (hanya di branch utama)
            deploy

        Tahap 2 tidak pernah dijalankan bila tahap 1 merah, dan itu
        menghemat 65 detik pada setiap kegagalan.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pemeriksaan yang sama bisa memberi hasil berbeda di lokal dan di CI, dan penyebabnya selalu berupa sesuatu yang berbeda antara kedua lingkungan.',
      ),
      code(
        'text',
        `
        1. Lulus di lokal, gagal di CI

           Error: Cannot find module './Header'

           macOS dan Windows tidak membedakan huruf besar kecil,
           Linux membedakan. Berkasnya bernama header.tsx.

        2. Lulus di lokal, gagal di CI — versi berbeda

           Kode berjalan dengan Node 26 di laptop, runner memakai
           Node 20. Fitur yang dipakai belum ada di sana.
           Perbaikan: sebutkan versinya di berkas workflow DAN di
           field engines pada package.json.

        3. Lulus di CI, gagal di lokal

           Sering karena node_modules lokal sudah basi. Jalankan
           npm ci di lokal untuk menyamakannya dengan CI.

        4. Kadang lulus, kadang gagal

           Test bergantung pada urutan, waktu, atau basis data bersama.
           Ini yang paling merusak, sebab ia melatih orang mengabaikan
           pipeline merah.
        `,
      ),
      p(
        'Kelas kedua berupa pemeriksaan yang berjalan dan tidak memeriksa apa pun, dan bentuknya sangat spesifik.',
      ),
      code(
        'text',
        `
        LINT yang tidak membaca berkas yang dimaksud:

          npm run lint
          > eslint src/

          Berkas di luar src/ tidak diperiksa sama sekali. Skrip lokal,
          berkas konfigurasi, dan berkas test bisa saja tidak tersentuh
          tanpa ada yang menyadarinya.

        TYPE-CHECK yang melewati berkas:

          tsconfig.json dengan "exclude": ["**/*.test.ts"]
          -> kesalahan tipe di berkas test tidak pernah terlihat

        TEST yang tidak menjalankan apa pun:

          No test files found, exiting with code 0

          Nol test yang lulus TETAP bernilai exit 0. Pipeline hijau,
          dan tidak satu pun test berjalan.
        `,
        {
          caption:
            'Yang terakhir paling sering terjadi setelah pola berkas test diubah dan konfigurasinya lupa ikut diubah.',
        },
      ),
      p(
        'Pada project ini sendiri, satu pemeriksaan memang ditemukan merah saat diukur, dan itu dilaporkan apa adanya.',
      ),
      code(
        'text',
        `
        format:check     exit=1

          [warn] src/test/sidebar-nav.test.tsx
          [warn] Code style issues found in 1 file.

        Berkas itu terakhir diubah pada commit yang jauh lebih lama
        dan tidak disentuh dalam pekerjaan ini. Artinya pemeriksaan
        format memang belum pernah dijalankan otomatis di project ini.

        Pelajarannya berlaku umum: pemeriksaan yang tidak dijalankan
        otomatis akan menyimpang, dan penyimpangannya baru terlihat
        ketika seseorang menjalankannya secara kebetulan.

        CATATAN LANJUTAN: penyimpangan ini akhirnya diperbaiki
        sebagai perubahan terpisah, jadi perintah yang sama sekarang
        memberi exit=0. Itu justru menegaskan pelajarannya — yang
        memperbaikinya bukan kesadaran siapa pun, melainkan satu
        perintah yang akhirnya dijalankan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menyusun pipeline terasa seperti pekerjaan konfigurasi, dan akibat kesalahannya terasa setiap hari oleh setiap orang di tim.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjalankan `build` sebelum pemeriksaan cepat',
            'Build yang paling menentukan',
            'Diukur, build 64,8 detik melawan type-check 2,4 detik. Umpan baliknya 27 kali lebih lambat',
          ],
          [
            'Menjalankan semua langkah berurutan',
            'Lebih mudah dibaca',
            'Empat pemeriksaan yang bisa paralel memakan 19,3 detik berurutan, sekitar 7 detik bila paralel',
          ],
          [
            'Menganggap `type-check` hijau berarti aman',
            'Tipenya kan sudah benar',
            'Diukur di bab Desain API, tipe yang lolos `tsc` tetap membocorkan `sandiHash` di respons',
          ],
          [
            'Membatasi lint hanya ke satu direktori',
            'Yang penting kode aplikasinya',
            'Skrip, konfigurasi, dan berkas test tidak pernah diperiksa. Penyimpangannya tumbuh diam-diam',
          ],
          [
            'Mengabaikan "No test files found"',
            'Exit code-nya kan 0',
            'Nol test yang berjalan tetap menghasilkan pipeline hijau. Pasang ambang minimal jumlah test',
          ],
          [
            'Menjalankan pemeriksaan hanya di lokal',
            'Saya selalu memeriksanya sebelum push',
            'Diukur pada project ini, `format:check` gagal pada berkas lama. Tanpa CI, tidak ada yang tahu',
          ],
        ],
      ),
      p(
        'Ada satu aturan yang menutup sebagian besar baris di tabel itu, yaitu setiap pemeriksaan yang dianggap penting harus dijalankan oleh mesin, dengan perintah yang sama persis dengan yang dijalankan orang di lokal. Perintah yang berbeda antara keduanya berarti ada dua kebenaran yang berbeda, dan cepat atau lambat keduanya akan menyimpang sampai salah satunya berhenti dipercaya.',
      ),
      references(
        {
          label: 'ESLint command line interface',
          href: 'https://eslint.org/docs/latest/use/command-line-interface',
          source: 'ESLint Docs',
          note: 'Opsi perintah beserta arti kode keluarnya',
        },
        {
          label: 'Prettier CLI',
          href: 'https://prettier.io/docs/cli',
          source: 'Prettier Docs',
          note: 'Beda `--check` yang memeriksa dan `--write` yang menulis ulang',
        },
        {
          label: 'Vitest CLI',
          href: 'https://vitest.dev/guide/cli',
          source: 'Vitest Docs',
          note: 'Mode sekali jalan yang dipakai di CI, berbeda dari mode tunggu perubahan',
        },
        {
          label: 'Workflow syntax for GitHub Actions',
          href: 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax',
          source: 'GitHub Docs',
          note: 'Cara menyusun tahap pemeriksaan beserta urutan dan ketergantungannya',
        },
      ),
    ],
  ),

  written(
    'deploy-otomatis',
    'Deploy Otomatis & Preview Deployment',
    17,
    'Dari merge ke produksi, dengan gerbang yang tepat.',
    [
      terms(
        {
          term: 'deployment environment',
          meaning:
            'Lingkungan sasaran yang didefinisikan di layanan CI, lengkap dengan variabel, rahasia, dan aturan siapa yang boleh merilis ke sana. Memisahkan rahasia produksi dari pipeline yang berjalan untuk pull request mana pun.',
        },
        {
          term: 'approval gate',
          meaning:
            'Titik di pipeline yang berhenti menunggu persetujuan manusia sebelum melanjutkan. Dipakai di depan produksi supaya rilis tetap keputusan orang, bukan akibat otomatis dari sebuah penggabungan.',
        },
        {
          term: 'promotion',
          meaning:
            'Memindahkan artefak yang **sama** dari satu lingkungan ke lingkungan berikutnya, misalnya dari staging ke produksi. Lawannya adalah membangun ulang per lingkungan, yang membuat yang diuji bukan benda yang sama dengan yang dirilis.',
        },
        {
          term: 'blue-green deployment',
          meaning:
            'Menyiapkan lingkungan kedua yang lengkap berisi versi baru, lalu mengalihkan lalu lintas ke sana sekaligus. Rollback berarti mengalihkan kembali, sehingga sangat cepat, dengan biaya menjalankan dua lingkungan penuh.',
        },
        {
          term: 'canary release',
          meaning:
            'Mengalirkan sebagian kecil lalu lintas ke versi baru lebih dulu, lalu memperbesarnya bila sehat. Membatasi jumlah pengguna yang terkena bila ada yang salah, dan menuntut pemantauan yang cukup peka untuk menyadarinya.',
        },
        {
          term: 'rolling update',
          meaning:
            'Mengganti instance satu per satu sampai semuanya memakai versi baru. Tidak butuh kapasitas ganda, dengan konsekuensi dua versi hidup bersamaan selama proses berjalan, sehingga skema basis data harus melayani keduanya.',
        },
        {
          term: 'smoke test',
          meaning:
            'Pemeriksaan singkat sesudah rilis yang memastikan jalur paling penting masih bekerja, misalnya halaman utama membalas dan login berhasil. Bukan pengganti test lengkap, melainkan alarm cepat bahwa rilisnya perlu dibatalkan.',
        },
        {
          term: 'OIDC',
          meaning:
            'Singkatan *OpenID Connect*, cara pipeline membuktikan identitasnya ke penyedia cloud lewat token berumur sangat pendek, tanpa menyimpan kunci akses jangka panjang sebagai rahasia. Menghilangkan rahasia yang paling berbahaya bila bocor.',
        },
      ),

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
      p(
        'Blok `environment:` bukan sekadar label. Ia mengaitkan job ini dengan lingkungan `production` yang punya pengaturannya sendiri di repositori — rahasia terpisah dari lingkungan lain, batasan branch mana yang boleh memakainya, dan opsi menuntut persetujuan manusia sebelum job berjalan. Nilai `url:` membuat tautan ke aplikasi muncul langsung di antarmuka GitHub setelah deploy selesai.',
      ),
      p(
        'Langkah "Verifikasi" adalah bagian yang paling sering hilang dari pipeline deploy. Ia mengulang `curl -fsS .../health/ready` sampai sepuluh kali dengan jeda 5 detik — total sekitar 50 detik toleransi untuk aplikasi menyala. Flag `-f` pada curl yang membuat ini bekerja: tanpanya, curl mengembalikan sukses meski server menjawab `503`, sehingga pemeriksaannya selalu lulus dan tidak menjaga apa pun.',
      ),
      p(
        'Perhatikan `exit 0` berada **di dalam** perulangan dan `exit 1` di luarnya. Artinya: satu jawaban sehat langsung menghentikan seluruh langkah dengan status sukses, sedangkan perulangan yang habis tanpa satu pun jawaban sehat jatuh ke `exit 1` dan menggagalkan job. Job yang merah inilah sinyal yang kamu butuhkan untuk memutuskan rollback — pola yang dibahas di sub-bab terakhir bab ini.',
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
      p(
        'Preview deployment adalah salinan aplikasi yang dibangun otomatis dari **setiap PR**, dengan URL sendiri. Nilainya: reviewer bisa mengklik dan mencoba perubahannya, bukan hanya membaca diff — dan perbedaan antara "kelihatannya benar di kode" dan "ternyata tombolnya tidak muncul di layar sempit" sering baru ketahuan di situ.',
      ),
      p(
        'Perhatikan URL-nya diturunkan dari **nama branch** (`app-git-fitur-ekspor`), bukan dari nomor PR. Konsekuensinya dua: URL-nya bisa ditebak, dan ia berubah kalau branch-nya diganti nama. Keduanya jadi alasan dua peringatan berikut — preview harus diperlakukan sebagai lingkungan yang bisa diakses orang luar, bukan sebagai ruang privat.',
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
      p(
        'Kata kuncinya `reload`, bukan `restart`. `restart` mematikan semua proses lalu menyalakannya kembali — ada jeda beberapa detik ketika tidak ada yang melayani permintaan. `reload` mengganti proses **satu per satu**: satu instance dimatikan dengan `SIGTERM` dan digantikan yang baru, baru berpindah ke instance berikutnya, sehingga selalu ada yang siap menjawab.',
      ),
      p(
        'Itu juga yang membuat penanganan sinyal dari sub-bab Docker menjadi syarat, bukan pelengkap. Instance yang tidak menutup diri dengan rapi saat menerima `SIGTERM` akan memutus permintaan yang sedang diproses — dan pengguna melihatnya sebagai error acak yang muncul persis saat deploy. Peringatan berikut menambahkan syarat kedua: selama peralihan, versi lama dan baru berjalan bersamaan.',
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
      p(
        'Baris `if: failure()` adalah inti langkah ini. Bawaannya, sebuah step dilewati begitu ada step sebelumnya yang gagal, sedangkan `failure()` membalik aturan itu sehingga langkah ini justru **hanya** berjalan ketika ada yang gagal. Padanannya yang lain adalah `success()`, `cancelled()`, dan `always()`, dan yang terakhir berjalan apa pun hasilnya, berguna untuk membersihkan sumber daya.',
      ),
      p(
        'URL webhook diambil dari `secrets.WEBHOOK_URL` dan dioper lewat `env`, bukan ditulis langsung di perintah. Alasannya bukan kerapian: URL webhook Slack atau Discord adalah kredensial — siapa pun yang memilikinya bisa mengirim pesan ke saluranmu. Menaruhnya di rahasia juga membuat GitHub menyensornya kalau ia sampai tercetak di log.',
      ),
      callout(
        'tip',
        'Beri tahu kegagalan, jangan setiap keberhasilan',
        'Notifikasi sukses yang datang sepuluh kali sehari akan diabaikan — dan yang gagal ikut terlewat bersamanya. Kelelahan notifikasi punya pola yang sama persis dengan alert fatigue.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Deploy otomatis mengubah rilis dari peristiwa yang direncanakan menjadi kejadian biasa, dan itu mengubah sifat risikonya. Rilis yang jarang berisi banyak perubahan sekaligus, sehingga ketika ada yang rusak, tidak ada yang tahu bagian mana.',
      ),
      code(
        'text',
        `
        Aritmetika yang menjelaskan kenapa rilis sering lebih aman:

          rilis tiap 6 minggu  -> 200 perubahan per rilis
            ada yang rusak     -> 200 tersangka
            rollback           -> membatalkan 200 perubahan sekaligus

          rilis tiap hari      -> 5 perubahan per rilis
            ada yang rusak     -> 5 tersangka
            rollback           -> membatalkan 5 perubahan

        Frekuensinya naik, dan ukuran setiap risikonya turun jauh
        lebih cepat daripada kenaikan frekuensinya.
        `,
        { caption: 'Syaratnya satu: rollback harus benar-benar cepat dan benar-benar dicoba.' },
      ),
      p(
        'Preview deployment adalah bentuk yang paling berbayar untuk tim kecil, sebab ia menjawab pertanyaan yang tidak bisa dijawab oleh test mana pun.',
      ),
      code(
        'text',
        `
        Yang bisa dijawab test otomatis:
          apakah fungsinya mengembalikan nilai yang benar
          apakah endpoint-nya menjawab status yang benar
          apakah komponennya merender teks yang diharapkan

        Yang HANYA bisa dijawab dengan membukanya:
          apakah tata letaknya masuk akal di layar sempit
          apakah alurnya terasa wajar
          apakah teksnya dimengerti orang yang bukan penulisnya
          apakah keadaan kosong dan keadaan error terlihat benar

        Preview per pull request memberi satu URL untuk pertanyaan
        kelompok kedua, tanpa memelihara lingkungan permanen.
        `,
      ),
      p(
        'Bentuk pipeline yang lazim memisahkan tiga hal yang sering dicampur menjadi satu, dan memisahkannya membuat rollback jauh lebih sederhana.',
      ),
      code(
        'text',
        `
        1. BUILD      menghasilkan artefak, sekali saja
        2. RELEASE    menandai artefak itu dengan versi
        3. DEPLOY     mengarahkan lalu lintas ke artefak itu

        Kesalahan yang sering: membangun ULANG saat deploy ke setiap
        lingkungan. Artinya artefak yang diuji di staging BUKAN artefak
        yang berjalan di produksi, meski kodenya sama.

        Bangun sekali, promosikan artefak yang sama:
          commit -> build -> artefak sha-a1b2c3d
                              -> deploy ke staging
                              -> (diuji)
                              -> deploy ke produksi, artefak YANG SAMA
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan deploy otomatis punya beberapa bentuk yang khas, dan yang paling merugikan tidak berupa deploy yang gagal melainkan deploy yang berhasil dengan artefak yang salah.',
      ),
      code(
        'text',
        `
        1. Deploy berhasil, yang berjalan versi lama

           Penyebab paling sering: cache di CDN atau di penyeimbang
           beban masih menyajikan yang lama.
           Periksa dengan membandingkan penanda versi:

             curl -sI https://app.contoh.id | grep -i 'x-app-version'

           Sertakan commit hash sebagai header respons atau di
           endpoint /versi, supaya pertanyaan "yang mana yang jalan"
           punya jawaban yang bisa diperiksa.

        2. Deploy berhasil, aplikasinya error total

           Sering karena variabel environment baru yang dipakai kode
           baru belum dipasang di lingkungan tujuan.
           Yang menutupnya: validasi konfigurasi saat boot, sehingga
           proses menolak menyala dan deploy-nya dinyatakan gagal
           alih-alih menyala setengah jalan.

        3. Deploy berhasil, sebagian pengguna error

           Dua versi berjalan bersamaan selama peralihan. Kode lama
           dan kode baru harus bisa hidup berdampingan — itulah alasan
           expand-contract pada migrasi basis data.
        `,
      ),
      p('Kasus ketiga adalah yang paling sering diremehkan, dan bentuknya bisa diukur.'),
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

        Rollback kodenya berhasil, dan aplikasinya tetap rusak, sebab
        basis datanya tidak ikut kembali. Inilah kenapa migrasi yang
        menghapus atau mengganti nama tidak boleh dirilis bersamaan
        dengan kode yang membutuhkannya.
        `,
        {
          caption:
            'Rollback kode tidak pernah membatalkan migrasi. Bentuk skemanya yang harus dirancang agar rollback tetap aman.',
        },
      ),
      code(
        'text',
        `
        KEGAGALAN LAIN yang khas:

          - deploy berjalan dari branch yang salah
            Pastikan pemicunya menyebut branch secara eksplisit,
            dan deploy produksi TIDAK dipicu oleh pull_request.

          - dua deploy berjalan bersamaan
            Yang lebih lambat selesai belakangan, dan versinyalah yang
            akhirnya berjalan — meski ia yang lebih lama.
            Pakai concurrency dengan cancel-in-progress: false untuk
            deploy, supaya antre, bukan dibatalkan.

          - deploy dinyatakan berhasil sebelum aplikasinya siap
            Pipeline menunggu "container started", bukan "healthy".
            Tunggu healthcheck, dan diukur di bab Docker: selisih
            keduanya bisa beberapa detik penuh.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Otomatisasi deploy memindahkan keputusan dari manusia ke pipeline, dan setiap asumsi yang tidak ditulis menjadi kesalahan yang berulang.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membangun ulang artefak saat deploy ke tiap lingkungan',
            'Kodenya kan sama',
            'Artefak yang diuji di staging bukan yang berjalan di produksi. Bangun sekali, promosikan',
          ],
          [
            'Merilis migrasi dan kode yang membutuhkannya bersamaan',
            'Keduanya kan satu perubahan',
            'Diuji, rollback kode menghasilkan `column does not exist`. Pakai expand-contract',
          ],
          [
            'Menyatakan deploy berhasil saat container dimulai',
            'Prosesnya kan sudah jalan',
            'Diukur di bab Docker, statusnya `starting` selama beberapa detik. Tunggu sampai `healthy`',
          ],
          [
            'Tidak menyertakan penanda versi di respons',
            'Toh bisa dilihat di dasbor',
            'Saat ada yang aneh, pertanyaan pertama selalu "versi mana yang jalan". Jawabannya harus bisa di-`curl`',
          ],
          [
            'Membiarkan dua deploy berjalan bersamaan',
            'Keduanya kan akan selesai',
            'Yang selesai belakangan yang berlaku, meski ia versi yang lebih lama',
          ],
          [
            'Memasang deploy otomatis sebelum rollback dicoba',
            'Rollback kan tinggal deploy versi lama',
            'Rollback yang belum pernah dicoba bukan rencana. Cobalah sekali, di luar keadaan darurat',
          ],
        ],
      ),
      p(
        'Isi sub-bab ini menyangkut platform yang tidak terpasang di mesin tempat materi ini disiapkan, jadi perlu dinyatakan terus terang mana yang diukur. Yang **dijalankan sungguhan** adalah kegagalan rollback setelah migrasi `RENAME` pada PostgreSQL 16.15, dan selisih antara status `starting` dan `healthy` pada Docker 29.8.0. Yang **tidak dijalankan** adalah pipeline deploy-nya sendiri beserta preview deployment, sebab keduanya memerlukan akun penyedia. Bentuk dan alasannya dijelaskan, angkanya tidak dikarang.',
      ),
      references(
        {
          label: 'Managing environments for deployment',
          href: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments',
          source: 'GitHub Docs',
          note: 'Aturan perlindungan lingkungan termasuk peninjau yang wajib menyetujui',
        },
        {
          label: 'OpenID Connect in cloud providers',
          href: 'https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers',
          source: 'GitHub Docs',
          note: 'Mengganti kunci akses jangka panjang dengan token berumur pendek',
        },
        {
          label: 'Release engineering',
          href: 'https://sre.google/sre-book/release-engineering/',
          source: 'Google SRE Book',
          note: 'Kenapa rilis bertahap lebih disukai daripada pergantian sekaligus',
        },
      ),
    ],
  ),

  written(
    'secret-ci',
    'Secret di CI',
    17,
    'Kredensial yang berjalan di mesin yang tidak kamu pegang.',
    [
      terms(
        {
          term: 'secret di CI',
          meaning:
            'Nilai sensitif yang disimpan terenkripsi di layanan CI dan diserahkan ke pipeline sebagai variabel lingkungan saat dibutuhkan. Tidak pernah ikut tertulis di berkas workflow, sebab berkas itu ada di repository yang bisa dibaca.',
        },
        {
          term: 'masking',
          meaning:
            'Penyensoran otomatis nilai rahasia bila kebetulan tercetak ke log, biasanya diganti tanda bintang. Berguna tetapi tidak bisa diandalkan penuh, sebab nilai yang diubah bentuknya lebih dulu, misalnya dipotong atau di-encode base64, tidak lagi dikenali dan tercetak apa adanya.',
        },
        {
          term: 'scope rahasia',
          meaning:
            'Batas sejauh mana sebuah rahasia bisa diakses, apakah seluruh organisasi, satu repository, atau hanya satu lingkungan. Membatasi rahasia produksi ke lingkungan produksi saja menutup pipeline pull request dari menyentuhnya.',
        },
        {
          term: 'pull_request_target',
          meaning:
            'Pemicu workflow yang berjalan dengan konteks repository asal, sehingga punya akses rahasia, tetapi diminta oleh pull request yang bisa datang dari siapa saja. Kombinasi itu berbahaya bila workflow-nya menjalankan kode dari pull request tersebut.',
        },
        {
          term: 'OIDC',
          meaning:
            'Cara pipeline membuktikan identitasnya ke penyedia cloud lewat token berumur sangat pendek, sehingga tidak ada kunci akses jangka panjang yang perlu disimpan. Bentuk terbaik dari prinsip "rahasia yang tidak ada tidak bisa bocor".',
        },
        {
          term: 'rotasi',
          meaning:
            'Mengganti rahasia dengan nilai baru secara berkala dan segera sesudah dicurigai bocor. Supaya mungkin, rahasianya harus dibaca dari satu tempat, bukan disalin ke banyak berkas workflow.',
        },
        {
          term: 'least privilege untuk token',
          meaning:
            'Memberi token pipeline hanya izin yang benar-benar dipakai, misalnya izin membaca kode saja untuk pipeline pemeriksaan. Token serba bisa yang dipakai semua workflow adalah satu kunci yang membuka segalanya bila bocor.',
        },
        {
          term: 'dependency pinning',
          meaning:
            'Menyematkan action dan dependensi ke versi atau hash tertentu. Menutup jalur serangan rantai pasok, yaitu pemilik sebuah action memindahkan tag ke kode baru yang berbahaya, dan pipeline-mu menjalankannya tanpa perubahan apa pun di repositorimu.',
        },
      ),

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
      p(
        'Sintaks `${{ secrets.NAMA }}` mengambil nilai yang tersimpan di pengaturan repositori dan menyuntikkannya sebagai variabel lingkungan — hanya untuk step itu, dan hanya selama ia berjalan. Yang tersimpan di berkas workflow (yang ikut ter-commit dan bisa dibaca siapa pun) hanyalah **namanya**; nilainya tidak pernah muncul di repositori.',
      ),
      p(
        'Perhatikan rahasianya dioper lewat blok `env:`, bukan dirangkai ke dalam perintah seperti `./deploy.sh --token=...`. Bedanya nyata: argumen perintah terlihat di daftar proses mesin runner dan lebih mudah tercetak ke log, sementara variabel lingkungan hanya terbaca oleh proses yang menerimanya. Tabel berikut menunjukkan bahwa rahasia yang sama bisa disimpan di tiga tingkat, dengan jangkauan yang berbeda.',
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
      p(
        'Penyensoran GitHub bekerja dengan cara yang sangat sederhana: ia mencari **teks yang persis sama** dengan nilai rahasiamu di aliran log, lalu menggantinya dengan `***`. Baris pertama tersensor karena nilainya dicetak apa adanya. Baris kedua lolos karena `base64` mengubah bentuknya — yang tercetak bukan lagi nilai yang dicari penyensor, tetapi tetap bisa didekode siapa pun dalam sekejap.',
      ),
      p(
        'Baris ketiga adalah jebakan yang paling sering menimpa orang saat mendiagnosis masalah. Flag `-v` menyuruh curl mencetak seluruh header permintaan, termasuk `Authorization: Bearer …` — dan karena token muncul utuh di sana, ia sebenarnya **akan** tersensor. Bahayanya justru di sisi sebaliknya: banyak API mengembalikan token atau kunci sesi di respons, dan nilai-nilai itu tidak terdaftar sebagai rahasia sehingga tercetak apa adanya. Ganti `-v` dengan `-sS` begitu diagnosis selesai.',
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
      p(
        '`permissions` muncul dua kali di sini, dan itu disengaja. Yang di tingkat atas berlaku sebagai bawaan untuk semua job; yang di dalam `deploy` **menimpa**-nya untuk job itu saja. Polanya: setel serendah mungkin di atas, lalu naikkan hanya di job yang benar-benar memerlukannya.',
      ),
      p(
        '`id-token: write` terdengar seperti izin menulis yang berbahaya, padahal ia hanya memberi job hak **meminta** token identitas OIDC untuk dirinya sendiri — bukan hak menulis ke repositori. Itulah izin yang dibutuhkan pola di bawah, dan komentarnya menegaskan agar tidak dipasang kalau OIDC tidak dipakai.',
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
      p(
        'Yang paling penting dari potongan ini adalah **apa yang tidak ada di dalamnya**: tidak ada `aws-access-key-id`, tidak ada `aws-secret-access-key`, tidak ada rujukan ke `secrets` sama sekali. Yang tertulis hanya `role-to-assume` — ARN sebuah peran IAM, yang bukan rahasia dan boleh terbaca siapa pun.',
      ),
      p(
        'Mekanismenya: GitHub menerbitkan token identitas yang menyatakan "job ini berasal dari repositori X, branch Y", dan AWS sudah dikonfigurasi untuk mempercayai pernyataan itu dari GitHub. AWS lalu menukarnya dengan kredensial sementara yang berumur menit. Konsekuensi praktisnya besar — tidak ada kunci yang bisa bocor dari pengaturan repositori, dan pembatasan "hanya branch `main` yang boleh memakai peran ini" ditegakkan di sisi AWS, bukan sekadar diharapkan dari sisi workflow.',
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
          body: 'Secret scanner di pre-commit dan CI, dan izin yang lebih sempit.',
        },
      ),
      callout(
        'warning',
        'Menghapus log tidak membatalkan kebocoran',
        'Log workflow bisa sudah diunduh, ter-cache, atau terindeks. Sama seperti rahasia yang ter-commit ke git: satu-satunya perbaikan yang benar adalah rotasi.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Rahasia di CI punya sifat yang berbeda dari rahasia di server, yaitu ia melewati lebih banyak tangan. Ia dibaca oleh runner, muncul di lingkungan proses, bisa ikut ke log, dan pada repositori publik bisa disentuh oleh kode dari pull request orang asing.',
      ),
      p('Yang paling sering membocorkannya bukan serangan melainkan perintah yang biasa.'),
      code(
        'text',
        `
        Jalur kebocoran yang khas di CI:

          - run: echo "DB=$DATABASE_URL"        <- langsung ke log
          - run: env                            <- SELURUH environment
          - run: npm config list                <- token registry
          - run: docker build --build-arg TOKEN=$TOKEN .
                 ^ build-arg tersimpan di RIWAYAT IMAGE, permanen
          - run: curl -H "Authorization: Bearer $TOKEN" ... -v
                 ^ -v mencetak header permintaan

        Dan yang paling halus: pesan error dari alat yang menyertakan
        connection string lengkap di dalamnya.
        `,
        {
          caption:
            'GitHub menyamarkan nilai rahasia yang ia kenali di log, dan penyamaran itu gagal bila nilainya diubah bentuk lebih dulu.',
        },
      ),
      code(
        'text',
        `
        Penyamaran gagal untuk nilai yang sudah diolah:

          echo $TOKEN            -> ***
          echo $TOKEN | base64   -> dGhpcy1pcy1yYWhhc2lh   <- TIDAK disamarkan
          echo "$TOKEN" | cut -c1-10  -> potongan, TIDAK dikenali

        Karena itu jangan mengandalkan penyamaran otomatis. Aturannya
        tetap: jangan pernah mencetak nilai rahasia dengan cara apa pun.
        `,
      ),
      p(
        'Bentuk yang benar membatasi tiga hal sekaligus, yaitu siapa yang bisa membacanya, berapa lama ia berlaku, dan apa yang bisa dilakukannya.',
      ),
      code(
        'text',
        `
        jobs:
          deploy:
            runs-on: ubuntu-latest
            # Environment memberi dua hal: rahasia yang terpisah,
            # dan gerbang persetujuan bila reviewer diwajibkan.
            environment: production
            permissions:
              contents: read        # sekecil mungkin
              id-token: write       # untuk OIDC
            steps:
              - uses: actions/checkout@v4

              # Lebih baik daripada menyimpan kunci jangka panjang:
              # tukar identitas workflow menjadi kredensial SEMENTARA.
              - uses: aws-actions/configure-aws-credentials@v4
                with:
                  role-to-assume: arn:aws:iam::123456789012:role/deploy-app
                  aws-region: ap-southeast-1
        `,
      ),
      p(
        'Pendekatan terakhir itu yang paling berpengaruh. Dengan OIDC, tidak ada kunci jangka panjang yang perlu disimpan sama sekali, sehingga tidak ada yang bisa bocor dan tidak ada yang perlu dirotasi.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan rahasia di CI jarang berupa pesan yang menyebut rahasia, dan itulah yang membuatnya memakan waktu.',
      ),
      code(
        'text',
        `
        1. Rahasianya kosong tanpa peringatan

           Error: connect ECONNREFUSED 127.0.0.1:5432
           error: password authentication failed for user ""

           Variabel yang tidak ada menjadi string kosong, bukan error.
           Penyebab paling sering:
             - salah tulis nama rahasianya
             - rahasia disimpan di level repositori, sementara job-nya
               memakai environment yang punya daftar sendiri
             - workflow dipicu dari fork, dan fork TIDAK menerima
               rahasia repositori (ini perilaku yang benar)

        2. Rahasia tidak sampai ke langkah yang membutuhkannya

           - run: npm run deploy
             env:
               TOKEN: \${{ secrets.DEPLOY_TOKEN }}

           Blok env itu berlaku untuk SATU langkah. Langkah berikutnya
           tidak melihatnya.

        3. Permission denied pada operasi yang seharusnya boleh

           Error: Resource not accessible by integration

           Token bawaan workflow punya izin terbatas. Tambahkan izin
           yang MEMANG dibutuhkan di blok permissions, satu per satu.
        `,
      ),
      p(
        'Kelas kedua jauh lebih serius, yaitu rahasia yang benar-benar bocor. Yang menentukan adalah apa yang dilakukan sesudahnya.',
      ),
      code(
        'text',
        `
        Urutan yang benar saat menyadari rahasia CI bocor:

          1. ROTASI dulu. Terbitkan nilai baru, matikan yang lama.
             Ini satu-satunya langkah yang benar-benar menutup.
          2. Pasang nilai barunya.
          3. Periksa log akses penyedia layanan: apakah kredensial itu
             sempat dipakai dari tempat yang tidak dikenal.
          4. Baru bereskan jejaknya — hapus log, bereskan riwayat.

        Melakukan 4 tanpa 1 memberi rasa aman tanpa keamanan apa pun.
        Dan diuji di bab Rahasia: nilai yang pernah masuk riwayat git
        tetap terbaca meski commit-nya sudah dihapus.
        `,
      ),
      code(
        'text',
        `
        JEBAKAN KHUSUS REPOSITORI PUBLIK:

          on: pull_request_target

        Pemicu ini menjalankan workflow dengan AKSES PENUH ke rahasia
        repositori, dan bila dipadukan dengan checkout kode dari PR,
        kode orang asing berjalan dengan rahasiamu.

          # BAHAYA
          on: pull_request_target
          steps:
            - uses: actions/checkout@v4
              with:
                ref: \${{ github.event.pull_request.head.sha }}
            - run: npm ci && npm test     # skrip dari PR ikut berjalan

        Untuk memeriksa pull request dari luar, pakai on: pull_request
        yang memang TIDAK menerima rahasia.
        `,
        {
          caption:
            'Ini salah satu jalur pengambilalihan repositori yang paling sering dilaporkan, dan bentuknya terlihat wajar.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Rahasia di CI terasa aman karena disimpan di kotak yang bertuliskan rahasia, dan yang menentukan adalah apa yang terjadi sesudah ia keluar dari kotak itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mencetak variabel untuk memastikan terbaca',
            'Biar tahu nilainya sampai',
            'Nilainya masuk log. Penyamaran otomatis gagal bila nilainya sudah di-`base64` atau dipotong',
          ],
          [
            'Memakai `--build-arg` untuk mengirim token ke Docker',
            'Cuma dipakai saat build',
            'Nilainya tersimpan permanen di riwayat image. Pakai mount rahasia saat build',
          ],
          [
            'Memakai satu token untuk semua pipeline',
            'Lebih gampang dikelola',
            'Satu kebocoran membuka semuanya, dan rotasinya mematikan seluruh pipeline sekaligus',
          ],
          [
            'Memakai kredensial jangka panjang untuk deploy',
            'Itu yang ada di dokumentasi',
            'OIDC menukar identitas workflow menjadi kredensial sementara. Tidak ada yang disimpan, tidak ada yang bocor',
          ],
          [
            'Memakai `pull_request_target` supaya PR dari fork bisa diperiksa',
            'Biar pipeline-nya jalan untuk kontributor luar',
            'Pemicu itu memberi rahasia repositori ke kode dari PR. Pakai `pull_request`',
          ],
          [
            'Menghapus log setelah rahasia bocor',
            'Jejaknya sudah hilang',
            'Rotasi dulu. Log bisa sudah disalin, dan yang pernah masuk riwayat git tetap terbaca',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan terus terang bahwa contoh workflow di sub-bab ini **tidak dijalankan**, sebab menjalankannya memerlukan repositori GitHub beserta runner-nya. Yang **dijalankan sungguhan** adalah mekanisme di bawahnya, yaitu bahwa kredensial yang pernah masuk riwayat git tetap terbaca sesudah berkasnya dikeluarkan, dan bahwa berkas yang disalin ke dalam image tersimpan di lapisannya meski dihapus pada lapisan berikutnya. Kedua sifat itulah yang membuat aturan di tabel di atas berlaku, dan keduanya tidak bergantung pada platform CI yang dipakai.',
      ),
      references(
        {
          label: 'Using secrets in GitHub Actions',
          href: 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets',
          source: 'GitHub Docs',
          note: 'Cara menyimpan, membatasi, dan memakai rahasia beserta batas penyensoran log',
        },
        {
          label: 'OpenID Connect in cloud providers',
          href: 'https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers',
          source: 'GitHub Docs',
          note: 'Menghapus kebutuhan menyimpan kunci akses jangka panjang',
        },
        {
          label: 'Secrets',
          href: 'https://kubernetes.io/docs/concepts/configuration/secret/',
          source: 'Kubernetes Docs',
          note: 'Pembanding cara rahasia diserahkan di lingkungan orkestrasi',
        },
        {
          label: 'Config — Store config in the environment',
          href: 'https://12factor.net/config',
          source: 'Twelve-Factor App',
          note: 'Dasar pemisahan konfigurasi dan rahasia dari kode',
        },
      ),
    ],
  ),

  written(
    'rollback',
    'Rollback: direncanakan sebelum rilis',
    18,
    'Keputusan yang harus diambil saat tenang, bukan saat panik.',
    [
      p(
        'Rollback bukan tanda kegagalan — ia bagian normal dari merilis. Yang membuatnya mahal adalah merencanakannya **saat** sesuatu sudah terbakar.',
      ),

      terms(
        {
          term: 'rollback',
          meaning:
            'Mengembalikan layanan ke versi sebelumnya yang diketahui sehat. Yang menentukan cepat tidaknya adalah keputusan yang diambil sebelum rilis, bukan kecekatan saat kejadian.',
        },
        {
          term: 'roll forward',
          meaning:
            'Memperbaiki masalah dengan merilis versi baru, bukan kembali ke versi lama. Dipilih ketika kembali justru tidak aman, misalnya karena migrasi basis data sudah berjalan dan versi lama tidak mengenali skema barunya.',
        },
        {
          term: 'git revert',
          meaning:
            'Membuat commit baru yang membatalkan perubahan commit tertentu, tanpa menghapus riwayat. Aman dipakai pada branch bersama, berbeda dari `reset` yang menulis ulang riwayat.',
        },
        {
          term: 'rollback budget',
          meaning:
            'Jendela waktu ketika membatalkan rilis masih aman. Menyempit begitu ada tindakan yang tidak bisa ditarik, misalnya migrasi yang membuang kolom, surel yang terkirim, atau pembayaran yang diproses.',
        },
        {
          term: 'ambang rollback',
          meaning:
            'Batas terukur yang disepakati sebelumnya sebagai tanda rilis harus dibatalkan, misalnya laju error melewati angka tertentu atau health check gagal berturut-turut. Menetapkannya di awal membuat keputusan tidak diimprovisasi saat sedang panik.',
        },
        {
          term: 'idempoten',
          meaning:
            'Sifat operasi yang memberi hasil sama meski dijalankan berulang. Penting untuk langkah rollback, sebab prosedur pemulihan sering dijalankan dua kali oleh orang yang berbeda saat keadaan sedang kacau.',
        },
        {
          term: 'post-mortem',
          meaning:
            'Catatan sesudah insiden yang menjelaskan apa yang terjadi, kenapa, dan apa yang akan mencegahnya terulang. Ditulis tanpa mencari siapa yang salah, sebab begitu ia berubah menjadi pencarian kesalahan orang, laporan berikutnya akan datang terlambat atau tidak datang sama sekali.',
        },
        {
          term: 'immutable release',
          meaning:
            'Rilis yang artefaknya tidak pernah diubah sesudah dibuat, dan tiap rilis tersimpan sendiri. Inilah yang membuat rollback berarti mengarahkan lalu lintas ke artefak lama, bukan membangun ulang kode lama yang hasilnya belum tentu sama.',
        },
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
      p(
        'Empat baris itu bukan alternatif yang setara — masing-masing milik platform berbeda, dan yang berlaku untukmu adalah satu di antaranya. Yang penting bukan menghafal keempatnya, melainkan **mengetahui yang mana milikmu dan sudah pernah menjalankannya**. Perintah rollback yang baru pertama kali diketik saat produksi bermasalah adalah perintah yang belum kamu tahu apakah berhasil.',
      ),
      p(
        'Perhatikan `./deploy.sh <sha-sebelumnya>` menuntut satu hal yang harus disiapkan lebih dulu: kamu harus **tahu** SHA yang sedang berjalan sebelum deploy terakhir. Itulah gunanya mencatat SHA di setiap deploy — tanpa catatan itu, langkah pertama saat panik justru menjadi menelusuri riwayat git untuk menebak versi mana yang tadinya baik.',
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
      p(
        "Argumen kedua pada `fitur.aktif('editor-baru', pengguna)` yang membuat pola ini lebih dari sekadar sakelar hidup-mati. Karena keputusannya diambil **per pengguna**, fitur bisa dinyalakan untuk 1% dulu, lalu 10%, lalu semua — dan kalau ada yang salah, ia dimatikan tanpa menyentuh deploy sama sekali.",
      ),
      p(
        'Perbedaannya dengan rollback biasa adalah waktu dan cakupan. Rollback deployment mengembalikan **seluruh** rilis, termasuk perbaikan lain yang ikut di dalamnya, dan butuh waktu sepanjang proses deploy. Mematikan bendera hanya mencabut satu fitur, berlaku dalam hitungan detik. Harganya sudah disebut di bab sebelumnya: tiap bendera melipatgandakan jalur kode yang harus diuji, jadi ia dipasang untuk perubahan berisiko dan dihapus begitu fiturnya permanen.',
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
      p(
        'Baris **Dampak** ditulis dalam angka yang bisa dibandingkan seperti 8 menit dan sekitar 2% permintaan, bukan "sempat error sebentar". Itu yang memungkinkan insiden ini ditimbang terhadap insiden lain nanti, dan yang membuat keputusan seperti menurunkan ambang alert punya dasar.',
      ),
      p(
        'Baris **Penyebab** tidak berhenti pada "migrasi gagal". Ia menyebut mekanismenya (`NOT NULL` ditambahkan ke kolom yang masih punya baris `NULL`) **dan** alasan hal itu tidak terdeteksi lebih awal: staging punya data lebih sedikit dan tidak punya baris lama. Kedua bagian itu diperlukan — yang pertama menjelaskan apa yang rusak, yang kedua menjelaskan kenapa pengaman yang ada tidak menangkapnya.',
      ),
      p(
        'Perhatikan hubungan langsung antara baris **Kenapa lolos CI** ("tes berjalan pada database kosong") dan butir pertama di bagian **Perubahan** ("tes migrasi dijalankan pada salinan data realistis"). Itu bentuk catatan pasca-insiden yang berguna: setiap celah yang ditemukan punya satu perubahan konkret yang menutupnya. Selisih 90 detik di baris **Deteksi** juga informasi tersendiri — ia mengukur seberapa cepat sistem pemantauanmu bekerja, terpisah dari seberapa cepat masalahnya diperbaiki.',
      ),
      callout(
        'tip',
        'Catatan pasca-insiden mencari penyebab sistem, bukan orang',
        'Pertanyaannya bukan "siapa yang salah" melainkan "kenapa sistem kita mengizinkannya lolos". Kolom "kenapa lolos CI" biasanya yang paling berharga — di situlah perbaikan yang mencegah pengulangan berada.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Rollback adalah satu-satunya bagian rilis yang harus diputuskan **sebelum** dibutuhkan, sebab pada saat ia dibutuhkan tidak ada waktu untuk memikirkannya.',
      ),
      p('Empat pertanyaan yang harus punya jawaban tertulis sebelum deploy pertama.'),
      code(
        'text',
        `
        1. PERINTAHNYA APA, dan berapa lama?
           Bukan "deploy versi lama", melainkan perintah yang bisa
           disalin dan ditempel. Dengan angka waktunya.

        2. APA YANG TIDAK BISA DIBATALKAN?
           migrasi yang sudah diterapkan
           surel yang sudah terkirim
           pembayaran yang sudah ditagihkan
           webhook yang sudah dikirim ke sistem lain
           berkas yang sudah dihapus

        3. APA SINYALNYA?
           Ambang yang ditetapkan SEBELUM, bukan perasaan saat kejadian.
             tingkat error 5xx > 2% selama 3 menit
             p95 latensi > 3 kali patokan sebelum rilis
             healthcheck gagal di lebih dari separuh instance

        4. SIAPA YANG MEMUTUSKAN?
           Satu nama. Dalam keadaan panik, keputusan bersama adalah
           keputusan yang tertunda.
        `,
        { caption: 'Daftar nomor 2 adalah yang menentukan bentuk seluruh rencananya.' },
      ),
      p('Yang paling sering membuat rollback gagal adalah basis data, dan bentuknya bisa diukur.'),
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
        Basis data tidak ikut mundur.
        `,
      ),
      p(
        'Jalan keluarnya bukan membuat migrasi bisa dibatalkan, melainkan membuat setiap rilis **tidak memerlukan** pembatalan migrasi. Bentuknya disebut expand-contract, dan ia memecah satu perubahan menjadi beberapa rilis.',
      ),
      code(
        'text',
        `
        Mengganti nama kolom, dengan rollback yang selalu aman:

          RILIS 1 — EXPAND
            tambah kolom baru "nama", biarkan "nama_lengkap" ada
            kode menulis ke KEDUANYA, membaca dari yang lama
            rollback aman: kolom baru diabaikan kode lama

          RILIS 2 — BACKFILL
            isi kolom baru dari yang lama, dalam batch terpisah
            bukan bagian dari langkah deploy

          RILIS 3 — SWITCH
            kode membaca dari "nama", masih menulis ke keduanya
            rollback aman: kolom lama masih terisi

          RILIS 4 — CONTRACT
            kode berhenti menulis ke "nama_lengkap"
            baru setelah itu kolom lama dihapus

        Empat rilis untuk satu perubahan terasa berlebihan, sampai
        rilis yang salah terjadi di antara salah satunya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Biaya setiap operasi migrasi juga bagian dari rencana rollback, sebab operasi yang mengunci tabel membuat rilis menjadi pemadaman.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada PostgreSQL 16.15, tabel 300.000 baris:

          ADD COLUMN tanpa default                    7 ms
          ADD COLUMN + DEFAULT konstan                7 ms   <- metadata saja
          ADD COLUMN + DEFAULT volatile             316 ms   <- menulis ulang
          ALTER COLUMN TYPE                         288 ms   <- menulis ulang
          CREATE INDEX                              384 ms   <- MENGUNCI penulisan
          CREATE INDEX CONCURRENTLY                 419 ms   <- tidak mengunci

        Dua baris pertama sama cepatnya, dan itu melawan dugaan umum:
        sejak PostgreSQL 11, menambah kolom dengan DEFAULT yang tetap
        hanya mengubah metadata dan TIDAK menulis ulang tabelnya.

        Baris kelima dan keenam selisihnya hanya 35 ms di sini, dan
        pada tabel puluhan juta baris selisihnya adalah antara
        "penulisan terhenti beberapa menit" dan "tidak ada yang terganggu".
        `,
        {
          caption:
            'Angka-angka ini kecil karena tabelnya kecil. Yang penting bukan angkanya melainkan operasi mana yang menulis ulang dan mengunci.',
        },
      ),
      p('Kegagalan rollback punya beberapa bentuk lain yang perlu dikenali sebelum terjadi.'),
      code(
        'text',
        `
        1. Versi lama tidak ada lagi

           Artefak lama sudah dihapus untuk menghemat ruang, atau tag
           image lama ditimpa karena memakai tag "latest".
           Menutupnya: simpan artefak per commit hash, jangan pernah
           menimpa tag yang sudah pernah di-deploy.

        2. Rollback berhasil, cache masih menyajikan yang baru

           CDN dan penyeimbang beban tidak ikut tahu. Sertakan langkah
           pembatalan cache dalam prosedur rollback-nya.

        3. Rollback berhasil, data yang terlanjur ditulis tidak cocok

           Kode baru sempat menulis dengan bentuk baru selama sepuluh
           menit. Kode lama tidak bisa membacanya.
           Inilah kenapa rilis 1 pada expand-contract menulis ke KEDUA
           kolom, bukan hanya ke yang baru.

        4. Rollback tidak pernah dicoba

           Yang paling sering. Prosedurnya ada di dokumen, belum pernah
           dijalankan satu kali pun, dan percobaan pertamanya terjadi
           saat produksi sedang bermasalah.
        `,
      ),
      p(
        'Ada juga pilihan yang sering lebih baik daripada rollback, dan menyadari keberadaannya mengubah cara sebuah fitur dirancang.',
      ),
      code(
        'text',
        `
          ROLLBACK     kembalikan seluruh versi ke yang sebelumnya
                       -> membatalkan SEMUA perubahan di rilis itu

          ROLL FORWARD perbaiki, rilis lagi
                       -> lebih cepat bila perbaikannya jelas dan kecil

          SAKLAR FITUR matikan satu fitur tanpa menyentuh versi
                       -> paling cepat, paling terarah, dan satu-satunya
                          yang tidak membatalkan pekerjaan orang lain
                          yang ikut di rilis yang sama

        Saklar fitur mengubah "rilis" dan "menyalakan" menjadi dua
        peristiwa yang terpisah, dan itu menghapus sebagian besar
        alasan melakukan rollback.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Rollback adalah bagian rilis yang paling mudah ditunda, sebab manfaatnya baru terasa pada hari yang paling tidak diinginkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menganggap rollback cukup dengan deploy versi lama',
            'Kodenya kan kembali',
            'Diuji, `column "nama_lengkap" does not exist`. Basis data tidak ikut mundur',
          ],
          [
            'Merilis migrasi penghapusan bersama kode yang membutuhkannya',
            'Satu perubahan, satu rilis',
            'Tidak ada jendela rollback yang aman. Pakai expand-contract, meski butuh beberapa rilis',
          ],
          [
            'Memakai tag `latest` untuk image produksi',
            'Selalu yang terbaru',
            'Versi lama tertimpa. Tidak ada yang bisa dikembalikan. Pakai tag berisi commit hash',
          ],
          [
            'Menjalankan `CREATE INDEX` tanpa `CONCURRENTLY`',
            'Cuma menambah indeks',
            'Diukur, ia mengunci penulisan. Pada tabel besar itu berarti pemadaman selama indeksnya dibangun',
          ],
          [
            'Menetapkan ambang rollback saat kejadian',
            'Nanti dilihat situasinya',
            'Dalam keadaan panik, ambangnya selalu bergeser. Tetapkan angkanya sebelum rilis',
          ],
          [
            'Tidak pernah mencoba rollback',
            'Prosedurnya kan sudah ditulis',
            'Percobaan pertamanya terjadi saat produksi bermasalah. Coba sekali, di luar keadaan darurat',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan apa yang diukur dan apa yang tidak. Yang **dijalankan sungguhan** pada sub-bab ini adalah kegagalan rollback sesudah migrasi `RENAME` dan biaya tiap operasi migrasi, keduanya pada PostgreSQL 16.15 dengan tabel 300.000 baris. Yang **tidak dijalankan** adalah prosedur rollback pada platform hosting mana pun, sebab itu memerlukan akun penyedia. Bentuk dan alasannya dijelaskan, dan angka yang disebut hanya yang benar-benar terukur.',
      ),
      references(
        {
          label: 'git-revert',
          href: 'https://git-scm.com/docs/git-revert',
          source: 'Git',
          note: 'Membatalkan perubahan dengan commit baru, aman untuk branch bersama',
        },
        {
          label: 'Release engineering',
          href: 'https://sre.google/sre-book/release-engineering/',
          source: 'Google SRE Book',
          note: 'Kenapa rilis harus bisa diulang dan dibatalkan sebagai syarat, bukan tambahan',
        },
        {
          label: 'Managing environments for deployment',
          href: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments',
          source: 'GitHub Docs',
          note: 'Riwayat deploy per lingkungan yang menjadi dasar memilih versi tujuan',
        },
      ),
    ],
  ),
];
