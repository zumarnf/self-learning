import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsFondasiDeploy } from './deployment/fondasi/lessons';
import { lessons as lessonsGitRilis } from './deployment/git-rilis/lessons';
import { lessons as lessonsDeployBackend } from './deployment/deploy-backend/lessons';
import { lessons as lessonsDeployFrontend } from './deployment/deploy-frontend/lessons';
import { lessons as lessonsDocker } from './deployment/docker/lessons';
import { lessons as lessonsCicd } from './deployment/cicd/lessons';
import { lessons as lessonsOperasional } from './deployment/operasional/lessons';

/** Deployment — 7 chapters, 38 lessons. The closing category. */

const fondasi = defineChapter({
  slug: 'fondasi-deployment',
  number: 1,
  title: 'Fondasi Deployment',
  summary: 'Konsep yang harus jelas sebelum menyentuh satu pun perintah deploy.',
  objectives: [
    'Membedakan apa yang terjadi saat build dan saat runtime',
    'Menyimpan konfigurasi per environment tanpa membocorkan rahasia',
    'Menjelaskan peran reverse proxy di depan aplikasi',
  ],
  prerequisites: [],
  stackVersions: ['Nginx 1.27', 'Caddy 2'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, Docker 29.8.0, dig, curl 8.5.0):
  //   - selisih lingkungan diukur: Node v26.5.0 di mesin melawan v22.23.2 di image,
  //     Linux Mint 22.3 melawan Alpine Linux v3.24
  //   - keluaran build project ini: 30 berkas JS klien, 506 halaman HTML, dan isi materi
  //     terbaca di 1.250 berkas .next/server sementara 0 berkas .next/static
  //   - DNS: dua rekaman A untuk satu nama, TTL 152 detik, dan www.github.com berupa
  //     CNAME sementara apex-nya rekaman A
  //   - TLS: TLSv1.3 / TLS_AES_256_GCM_SHA384 lewat curl, dan empat kegagalan verifikasi
  //     (kedaluwarsa, nama salah, self-signed, akar tidak dipercaya) yang SEMUANYA
  //     menjawab 200 begitu -k dipakai
  //   - reverse proxy: header teruskan diukur dengan dua server node:http
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Header X-Forwarded-* yang dikirim LANGSUNG oleh klien diterima apa adanya oleh
  //     aplikasi yang "sudah benar" membacanya. Materinya memakai itu untuk menegaskan
  //     bahwa header teruskan hanya boleh dipercaya bila akses langsung memang tertutup.
  //
  // nginx dan Caddy TIDAK terpasang di mesin ini; contoh konfigurasinya ditandai tidak
  // dieksekusi, dan perilaku header teruskannya diukur dengan proxy node:http.
  // 2026-09-15: ADR-0006 menyusul di bab ini (plans/revisi-materi-istilah-rujukan/, batch 13).
  //   Kategori ini satu-satunya yang tertinggal dari pass istilah+rujukan, dan celahnya tercatat
  //   di ratchet test sendiri: `toBeGreaterThanOrEqual(402)`, yaitu 440 - 38.
  //   Seluruh URL rujukan diverifikasi hidup dengan curl lebih dulu, bukan diambil dari ingatan.
  reviewedAt: '2026-09-15',
  lessons: lessonsFondasiDeploy,
  quiz: [
    q(
      'dp1-q1',
      'Kenapa mengubah environment variable setelah build kadang tidak berpengaruh?',
      [
        'Karena servernya perlu di-restart saja',
        'Karena sebagian nilai disisipkan ke dalam artefak saat build, sehingga hanya berubah bila di-build ulang',
        'Karena env hanya berlaku di development',
        'Karena namanya salah',
      ],
      1,
      'Variabel yang dipakai di sisi klien dibekukan saat build. Variabel yang dibaca server saat runtime memang cukup di-restart. Membedakan keduanya menghemat berjam-jam kebingungan.',
    ),
  ],
  practice: {
    id: 'deployment/fondasi-deployment',
    title: 'Praktik bab ini',
    items: [
      'Daftar semua variabel yang dibutuhkan aplikasimu dan tandai mana yang publik',
      'Pasang HTTPS pada satu domain uji',
      'Konfigurasikan reverse proxy sederhana di depan aplikasi lokal',
    ],
  },
});

const git = defineChapter({
  slug: 'git-alur-rilis',
  number: 2,
  title: 'Git & Alur Kerja Rilis',
  summary:
    'Kendali versi sebagai jaring pengaman, dan alur kerja yang membuat rilis bisa diprediksi.',
  objectives: [
    'Memakai branch dan pull request dengan disiplin',
    'Menulis pesan commit yang menjelaskan alasan, bukan mengulang diff',
    'Menandai versi rilis secara konsisten',
  ],
  prerequisites: [],
  stackVersions: ['Git 2.4x', 'Conventional Commits 1.0', 'SemVer 2.0'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (git 2.43.0, repositori buangan):
  //   - tiga wilayah git dibuktikan lewat dua kolom keluaran git status --short
  //   - reset --soft / --mixed / --hard diukur isinya: hanya --hard yang MENGUBAH isi
  //     berkas, dari "satu/dua/tiga" menjadi "satu/dua"
  //   - reflog mencatat setiap perpindahan HEAD, termasuk sesudah reset --hard
  //   - stash dan stash pop memulihkan kolom staging juga
  //   - amend mengubah hash: 34792eb menjadi 5b46a0f
  //   - konflik merge sungguhan beserta penanda <<<<<<< dan status UU
  //   - bentuk graf riwayat sesudah merge, dengan percabangannya terlihat
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN:
  //   - Konflik yang diukur TIDAK bisa diselesaikan dengan memilih salah satu sisi:
  //     jawaban yang benar adalah pajak baru BESERTA diskon. Materinya memakai itu
  //     untuk menegaskan bahwa menyelesaikan konflik adalah keputusan produk.
  // 2026-09-15: ADR-0006 menyusul di bab ini — blok istilah dan rujukan resmi ditambahkan
  //   di kelima sub-bab. Rujukannya menunjuk Pro Git dan GitHub Docs, keduanya sudah ada di
  //   OFFICIAL_DOC_HOSTS sehingga allow-list tidak perlu diubah.
  reviewedAt: '2026-09-15',
  lessons: lessonsGitRilis,
  quiz: [
    q(
      'dp2-q1',
      'Kenapa satu commit sebaiknya berisi satu perubahan logis?',
      [
        'Supaya riwayat terlihat rapi',
        'Supaya review lebih mudah dan revert bisa dilakukan tanpa ikut membatalkan perubahan lain',
        'Karena Git membatasi ukuran commit',
        'Supaya repositori lebih kecil',
      ],
      1,
      'Commit yang menggabungkan fitur dan perbaikan tak berhubungan membuat revert menjadi pilihan antara membiarkan bug atau membuang fitur.',
    ),
  ],
  practice: {
    id: 'deployment/git-alur-rilis',
    title: 'Praktik bab ini',
    items: [
      'Kerjakan satu fitur di branch terpisah dan buka pull request',
      'Tulis lima pesan commit yang menjelaskan alasan, bukan daftar file',
      'Beri tag versi pada satu rilis dan tulis changelognya',
    ],
  },
});

const deployFe = defineChapter({
  slug: 'deploy-frontend',
  number: 3,
  title: 'Deploy Frontend (Next.js)',
  summary: 'Membawa aplikasi Next.js ke internet, dan memastikan ia tetap cepat di sana.',
  objectives: [
    'Membaca output build dan mengenali rute yang membengkak',
    'Men-deploy ke platform terkelola maupun ke server sendiri',
    'Mengatur caching dan revalidasi di produksi',
  ],
  prerequisites: [{ category: 'frontend-intermediate', chapter: 'nextjs' }],
  stackVersions: ['Next.js 16.2', 'Vercel', 'Cloudflare Pages'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Chrome for Testing 149 lewat CDP, curl 8.5.0):
  //   - keluaran build produksi project ini: 30 berkas JS klien 1.823,4 KB, chunk terbesar
  //     653,4 KB, 506 halaman HTML 108,1 MB, halaman terbesar 487,8 KB
  //   - Core Web Vitals terhadap build itu: LCP 332 / 232 / 144 ms, CLS 0 di ketiganya
  //   - halaman 487,8 KB hanya 56,1 KB DI KABEL, yaitu 8,7 kali lebih kecil
  //   - empat kegagalan verifikasi TLS beserta pesan curl-nya, dan keempatnya 200 dengan -k
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Percobaan CLS pertama memakai PNG 1x1 dan menghasilkan CLS 0 pada KEDUA versi,
  //     yaitu tidak menunjukkan apa-apa. Setelah gambarnya diganti menjadi 600x300, barulah
  //     selisihnya muncul: 0,0302 tanpa width/height melawan 0 dengan. Angka yang dipakai
  //     di materi adalah yang kedua.
  //
  // Penyebaran ke Vercel, Netlify, dan Cloudflare Pages TIDAK dijalankan — semuanya
  // memerlukan akun penyedia. Angka TTFB berasal dari jaringan lokal dan dinyatakan begitu.
  // 2026-09-15: ADR-0006 menyusul di bab ini — enam sub-bab mendapat istilah dan rujukan.
  //   Dua URL kandidat ditolak karena membalas 404 saat diverifikasi, dan diganti halaman lain
  //   yang benar-benar hidup. Itulah alasan verifikasinya dijalankan, bukan diasumsikan.
  reviewedAt: '2026-09-15',
  lessons: lessonsDeployFrontend,
  quiz: [
    q(
      'dp3-q1',
      'Apa yang perlu diperiksa pada output `next build`?',
      [
        'Hanya apakah build berhasil',
        'Ukuran First Load JS per rute, untuk menemukan halaman yang terlalu berat',
        'Jumlah file di folder',
        'Waktu build saja',
      ],
      1,
      'Rute dengan First Load JS jauh di atas yang lain biasanya menandakan sebuah library berat ikut terbawa ke klien. Itu titik awal optimasi yang paling produktif.',
    ),
  ],
  practice: {
    id: 'deployment/deploy-frontend',
    title: 'Praktik bab ini',
    items: [
      'Jalankan `next build` dan catat tiga rute dengan bundle terbesar',
      'Deploy satu aplikasi ke platform pilihanmu dengan domain sendiri',
      'Verifikasi bahwa tidak ada rahasia yang muncul di bundle klien',
    ],
  },
});

const deployBe = defineChapter({
  slug: 'deploy-backend',
  number: 4,
  title: 'Deploy Backend',
  summary: 'Menjalankan Express dan Laravel di server sungguhan, beserta database dan migrasinya.',
  objectives: [
    'Men-deploy API ke VPS maupun ke PaaS',
    'Menjalankan migrasi tanpa menutup jalan rollback',
    'Memisahkan penyimpanan berkas dari server aplikasi',
  ],
  prerequisites: [{ category: 'backend-intermediate', chapter: 'express-intermediate' }],
  stackVersions: ['PM2 5', 'Nginx 1.27', 'PHP-FPM 8.3'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, PostgreSQL 16.15, Chrome 149):
  //   - header teruskan di belakang proxy, beserta pemalsuannya oleh klien langsung
  //   - pg_dump tiga format: 2,6 MB / 552 KB / 560 KB dalam 57 / 84 / 87 ms
  //   - pg_restore penuh ke basis data baru: 123 ms, 5.000 pelanggan dan 50.000 pesanan
  //   - constraint CHECK, foreign key, dan sequence terbukti ikut pulih
  //   - biaya operasi migrasi pada 300.000 baris: ADD COLUMN 7 ms, ALTER TYPE 288 ms,
  //     CREATE INDEX 384 ms, CONCURRENTLY 419 ms
  //   - rollback sesudah RENAME: column "nama_lengkap" does not exist
  //
  // DUA HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - ADD COLUMN dengan DEFAULT konstan sama cepatnya dengan tanpa default (7 ms vs 7 ms).
  //     Sejak PostgreSQL 11 ia hanya mengubah metadata; yang menulis ulang adalah DEFAULT
  //     yang nilainya berbeda per baris (316 ms).
  //   - pg_restore --data-only ke tabel BER-primary key GAGAL dan jumlahnya tetap 50.000,
  //     sementara ke tabel TANPA primary key ia berlipat 1.000 menjadi 2.000 tanpa satu pun
  //     error. Yang menyelamatkan bukan pg_restore melainkan constraint-nya. Dugaan awal
  //     materi ini keliru dan dikoreksi setelah diukur.
  //
  // Laravel, Composer, PM2, dan nginx TIDAK terpasang; perintahnya ditandai tidak dieksekusi.
  // 2026-09-15: ADR-0006 menyusul di bab ini — lima sub-bab mendapat istilah dan rujukan
  //   ke Express, Laravel, PHP Manual, dan PostgreSQL Docs.
  reviewedAt: '2026-09-15',
  lessons: lessonsDeployBackend,
  quiz: [
    q(
      'dp4-q1',
      'Kenapa migrasi destruktif tidak boleh dikirim bersama kode yang membutuhkannya?',
      [
        'Karena akan gagal',
        'Karena kalau kode perlu di-rollback, kolom yang sudah dihapus tidak bisa dikembalikan begitu saja',
        'Karena migrasi harus manual',
        'Karena melanggar SemVer',
      ],
      1,
      'Pola expand–migrate–contract: kirim perubahan aditif dulu, backfill, pindahkan kode, baru hapus bentuk lama di rilis berikutnya. Selalu ada jendela aman untuk mundur.',
    ),
  ],
  practice: {
    id: 'deployment/deploy-backend',
    title: 'Praktik bab ini',
    items: [
      'Deploy satu API ke VPS dengan reverse proxy dan proses yang dipantau',
      'Jalankan migrasi dengan pola expand–migrate–contract',
      'Pindahkan penyimpanan berkas ke object storage',
    ],
  },
});

const docker = defineChapter({
  slug: 'docker-container',
  number: 5,
  title: 'Docker & Container',
  summary: 'Mengemas aplikasi beserta lingkungannya supaya berjalan sama di mana pun.',
  objectives: [
    'Menulis Dockerfile multi-stage untuk Node dan PHP',
    'Menyusun lingkungan pengembangan lokal dengan Compose',
    'Menjaga image tetap kecil dan tidak membawa rahasia',
  ],
  prerequisites: [{ category: 'deployment', chapter: 'fondasi-deployment' }],
  stackVersions: ['Docker 27', 'Docker Compose v2'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Docker 29.8.0, node:22-alpine):
  //   - .dockerignore: konteks 33,01 MB menjadi 195 byte, image 301 MB menjadi 235 MB
  //   - urutan lapisan: mengubah satu baris kode menyisakan RUN npm install CACHED bila
  //     package.json disalin lebih dulu, dan menjalankannya ulang bila COPY . . mendahului
  //   - multi-stage dengan devDependency yang sama: 290 MB melawan 232 MB, dan image
  //     multi-stage hanya berisi dist + package.json serta berjalan sebagai pengguna "app"
  //   - healthcheck: starting -> healthy, /healthz 000 -> 503 -> 200, exit=1 lalu exit=0
  //   - compose: Waiting -> Healthy lalu layanan kedua dimulai, dan http://api:3000 bekerja
  //   - versi di dalam image: Node v22.23.2 di Alpine 3.24, melawan v26.5.0 di Mint 22.3
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - Perbandingan multi-stage yang PERTAMA menghasilkan 232 MB melawan 232 MB, yaitu
  //     tidak menunjukkan apa-apa, sebab ENV NODE_ENV=production membuat npm install
  //     MELEWATI devDependencies. Kekeliruan itu justru menghasilkan error yang dipakai
  //     di materi ("npx tsc: To get access to the TypeScript compiler..."), dan angka
  //     perbandingan yang benar baru didapat setelah NODE_ENV dipindah ke bawah.
  //
  // Container mysql84 milik user TIDAK disentuh. Seluruh image uji dihapus sesudah diukur.
  // 2026-09-15: ADR-0006 menyusul di bab ini — lima sub-bab mendapat istilah dan rujukan
  //   ke Docker Docs, Kubernetes Docs, dan Twelve-Factor App.
  reviewedAt: '2026-09-15',
  lessons: lessonsDocker,
  quiz: [
    q(
      'dp5-q1',
      'Kenapa rahasia tidak boleh dimasukkan lewat `COPY` atau `ARG` di Dockerfile?',
      [
        'Karena melanggar sintaks',
        'Karena nilainya tersimpan di layer image dan bisa dibaca siapa pun yang memiliki image tersebut',
        'Karena membuat build lambat',
        'Karena Docker tidak mendukung string panjang',
      ],
      1,
      'Menghapus berkas rahasia di layer berikutnya tidak menghapusnya dari riwayat layer. Suntikkan rahasia saat runtime, atau pakai mekanisme secret khusus.',
    ),
  ],
  practice: {
    id: 'deployment/docker-container',
    title: 'Praktik bab ini',
    items: [
      'Tulis Dockerfile multi-stage untuk satu aplikasi Node',
      'Susun Compose berisi app + database + redis',
      'Kecilkan image sampai di bawah setengah ukuran awalnya',
    ],
  },
});

const cicd = defineChapter({
  slug: 'ci-cd',
  number: 6,
  title: 'CI/CD',
  summary:
    'Otomatisasi yang menjalankan pemeriksaan dan rilis, supaya tidak bergantung pada ingatan.',
  objectives: [
    'Menyusun pipeline lint → type-check → test → build',
    'Mengatur deploy otomatis beserta preview',
    'Menyiapkan rencana rollback sebelum dibutuhkan',
  ],
  prerequisites: [{ category: 'deployment', chapter: 'git-alur-rilis' }],
  stackVersions: ['GitHub Actions'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (project ini sendiri):
  //   - durasi tiap langkah pipeline: format:check 3.691 ms, lint 6.021 ms,
  //     type-check 2.403 ms, test 7.184 ms, build 64.834 ms
  //   - angka itulah yang dipakai menyusun urutan langkah, bukan selera
  //   - kegagalan rollback sesudah migrasi RENAME pada PostgreSQL 16.15
  //   - selisih status starting dan healthy pada Docker 29.8.0
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN APA ADANYA:
  //   - format:check pada project ini keluar dengan exit=1. Berkas yang gagal
  //     (src/test/sidebar-nav.test.tsx) terakhir diubah pada commit yang jauh lebih lama
  //     dan TIDAK disentuh dalam pekerjaan ini, sehingga pemeriksaan format memang belum
  //     pernah dijalankan otomatis di sini. Temuan itu dipakai sebagai contoh di materi
  //     alih-alih diperbaiki diam-diam, sebab memperbaikinya akan mencampur perubahan
  //     yang tidak diminta ke dalam pekerjaan ini. Belakangan (2026-09-15), atas
  //     persetujuan pemilik project, berkas itu diformat sebagai perubahan TERPISAH, dan
  //     sub-bab yang mengutip exit=1 diberi catatan lanjutan.
  //
  // GitHub Actions TIDAK dijalankan — menjalankannya menuntut repositori GitHub beserta
  // runner-nya. Yang diukur adalah perintah di dalam workflow-nya, dan angka itu berlaku
  // di mana pun pipeline-nya dijalankan.
  // 2026-09-15: ADR-0006 menyusul di bab ini — enam sub-bab mendapat istilah dan rujukan
  //   ke GitHub Docs, Google SRE Book, dan dokumentasi alat pemeriksaan yang dipakai project ini.
  reviewedAt: '2026-09-15',
  lessons: lessonsCicd,
  quiz: [
    q(
      'dp6-q1',
      'Kenapa rencana rollback harus dibuat sebelum deploy, bukan saat terjadi masalah?',
      [
        'Supaya pipeline lebih cepat',
        'Karena saat produksi bermasalah tidak ada waktu untuk memikirkan langkah, dan sebagian hal memang tidak bisa dikembalikan',
        'Karena CI mewajibkannya',
        'Karena rollback selalu otomatis',
      ],
      1,
      'Beberapa hal tidak bisa dibatalkan: migrasi destruktif, email terkirim, pembayaran diproses, webhook dikirim. Itu harus diketahui sebelum tombol deploy ditekan.',
    ),
  ],
  practice: {
    id: 'deployment/ci-cd',
    title: 'Praktik bab ini',
    items: [
      'Susun workflow yang menjalankan lint, type-check, test, dan build',
      'Aktifkan deploy otomatis hanya bila seluruh pemeriksaan lulus',
      'Tulis rencana rollback satu halaman untuk aplikasimu',
    ],
  },
});

const setelahRilis = defineChapter({
  slug: 'setelah-rilis',
  number: 7,
  title: 'Setelah Rilis (Operasional)',
  summary: 'Pipeline hijau bukan akhir. Bab penutup: memantau, menelusuri, dan memulihkan.',
  objectives: [
    'Mengetahui aplikasi bermasalah sebelum pengguna melaporkannya',
    'Menelusuri satu permintaan dari log sampai penyebabnya',
    'Menguji pemulihan backup, bukan sekadar membuatnya',
  ],
  prerequisites: [{ category: 'deployment', chapter: 'ci-cd' }],
  stackVersions: ['Sentry', 'Core Web Vitals'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Chrome 149, PostgreSQL 16.15, Node 26.5.0):
  //   - Core Web Vitals terhadap build produksi project ini: LCP 332 / 232 / 144 ms, CLS 0
  //   - CLS gambar tanpa width/height 0,0302 melawan 0 dengan, pada gambar dan waktu tiba
  //     yang sama persis
  //   - pg_dump tiga format beserta ukuran dan waktunya, dan pg_restore 123 ms
  //   - constraint CHECK, foreign key, dan sequence terbukti ikut pulih
  //   - redaksi log beserta batasnya: kunci berhuruf besar tertangkap, rahasia di teks
  //     bebas lolos
  //   - log injection: baris palsu tersisip pada log yang digabung string, tetap satu
  //     baris pada JSON.stringify
  //   - skrip audit 10 butir: 10 temuan pada versi rentan, 0 pada versi diperbaiki
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN KARENA MELAWAN DUGAAN AWAL:
  //   - pg_restore --data-only ke tabel TANPA primary key melipatgandakan barisnya dari
  //     1.000 menjadi 2.000 TANPA satu pun error, sementara ke tabel ber-primary key ia
  //     gagal dan jumlahnya tetap. Yang menyelamatkan bukan pg_restore melainkan
  //     constraint-nya, dan itu mengoreksi dugaan awal materi ini.
  //
  // Sentry maupun layanan pemantauan lain TIDAK dipasang — semuanya memerlukan akun.
  // Kemampuan pengelompokannya dijelaskan dan ditandai tidak dieksekusi.
  // 2026-09-15: ADR-0006 menyusul di bab ini — enam sub-bab mendapat istilah dan rujukan
  //   ke Google SRE Book, Prometheus, OpenTelemetry, dan web.dev.
  reviewedAt: '2026-09-15',
  lessons: lessonsOperasional,
  quiz: [
    q(
      'dp7-q1',
      'Kapan sebuah backup bisa disebut dapat diandalkan?',
      [
        'Saat berjalan otomatis setiap hari',
        'Saat proses pemulihannya sudah pernah diuji sampai berhasil',
        'Saat ukurannya besar',
        'Saat disimpan di server yang sama',
      ],
      1,
      'Backup yang tidak pernah dipulihkan adalah asumsi. Backup yang rusak, tidak lengkap, atau tidak bisa dibaca baru ketahuan pada saat paling buruk.',
    ),
    q(
      'dp7-q2',
      'Kenapa deploy belum selesai saat pipeline berwarna hijau?',
      [
        'Karena pipeline sering salah',
        'Karena perilaku di produksi harus diverifikasi: health check, error rate, latensi, dan fitur yang baru diubah',
        'Karena harus menunggu 24 jam',
        'Karena CI tidak menjalankan test',
      ],
      1,
      'Pipeline membuktikan kode lolos pemeriksaan, bukan bahwa aplikasi berjalan benar dengan data dan konfigurasi produksi. Verifikasi pasca-deploy adalah bagian dari deploy.',
    ),
  ],
  practice: {
    id: 'deployment/setelah-rilis',
    title: 'Praktik bab ini',
    items: [
      'Pasang error tracking dan picu satu error uji',
      'Tambahkan correlation id yang muncul di semua log satu permintaan',
      'Pulihkan satu backup ke database kosong dan buktikan datanya utuh',
      'Susun checklist pra-deploy dan pasca-deploy untuk aplikasimu',
    ],
  },
});

export const deployment = defineCategory({
  slug: 'deployment',
  order: 6,
  title: 'Deployment',
  tagline: 'Dari laptop ke internet',
  description:
    'Bab penutup kurikulum. Kode yang tidak pernah dipakai orang lain belum selesai — di sini kamu membawanya keluar, mengotomatiskan rilisnya, dan menjaganya tetap hidup setelah itu.',
  chapters: [fondasi, git, deployFe, deployBe, docker, cicd, setelahRilis],
});
