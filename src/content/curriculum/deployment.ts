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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  reviewedAt: '2026-08-02',
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
  order: 5,
  title: 'Deployment',
  tagline: 'Dari laptop ke internet',
  description:
    'Bab penutup kurikulum. Kode yang tidak pernah dipakai orang lain belum selesai — di sini kamu membawanya keluar, mengotomatiskan rilisnya, dan menjaganya tetap hidup setelah itu.',
  chapters: [fondasi, git, deployFe, deployBe, docker, cicd, setelahRilis],
});
