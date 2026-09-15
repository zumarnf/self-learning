import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  references,
  table,
  terms,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 7, all six lessons. The final chapter of the entire curriculum.
 *
 * Everything here is about the period after "it works" — which is where software spends almost all
 * of its life. Lesson 7.6 closes the curriculum with the checklist the whole track has been
 * building toward.
 */
export const lessons: LessonDraft[] = [
  written(
    'monitoring-uptime',
    'Monitoring & Uptime Check',
    16,
    'Mengetahui aplikasimu mati sebelum penggunamu memberi tahu.',
    [
      p(
        'Tanpa pemantauan, cara kamu mengetahui aplikasimu mati adalah lewat laporan pengguna — dan itu berarti ia sudah mati cukup lama untuk mengganggu seseorang sampai ia repot-repot melapor.',
      ),

      terms(
        {
          term: 'monitoring',
          meaning:
            'Pengumpulan dan pengamatan ukuran kesehatan sistem secara terus-menerus. Bedanya dengan sekadar mencatat, monitoring dirancang untuk menjawab pertanyaan yang sudah kamu tahu akan ditanyakan, misalnya berapa laju error sekarang.',
        },
        {
          term: 'uptime monitoring',
          meaning:
            'Pemeriksaan berkala dari luar yang memastikan layananmu masih membalas. Penting justru karena datang dari luar, sehingga ikut menangkap kegagalan DNS, sertifikat kedaluwarsa, dan jaringan, yang tidak terlihat oleh pemantauan di dalam mesinmu sendiri.',
        },
        {
          term: 'four golden signals',
          meaning:
            'Empat ukuran yang dirumuskan Google SRE sebagai titik awal pemantauan layanan, yaitu latensi, lalu lintas, error, dan tingkat kepenuhan sumber daya. Dipilih karena empat ini menangkap sebagian besar masalah nyata tanpa membanjiri dengan grafik.',
        },
        {
          term: 'latensi persentil',
          meaning:
            'Waktu tanggap yang dilaporkan sebagai persentil, misalnya p50, p95, dan p99, bukan sebagai rata-rata. Rata-rata menyembunyikan ekor yang lambat, padahal p99 itulah yang dirasakan sebagian pengguna dan biasanya justru pengguna yang datanya paling banyak.',
        },
        {
          term: 'SLI, SLO, dan SLA',
          meaning:
            'Tiga tingkat yang sering tertukar. *SLI* adalah ukuran yang dipilih, misalnya persentase permintaan yang berhasil. *SLO* adalah target internal atas ukuran itu. *SLA* adalah janji ke pelanggan yang punya konsekuensi bila dilanggar, dan biasanya ditetapkan lebih longgar daripada SLO.',
        },
        {
          term: 'error budget',
          meaning:
            'Sisa kegagalan yang masih boleh terjadi menurut SLO. Bila SLO-nya 99,9 persen sebulan, anggarannya sekitar 43 menit. Gunanya mengubah perdebatan "rilis atau stabilkan" menjadi angka yang bisa diperiksa bersama.',
        },
        {
          term: 'alert fatigue',
          meaning:
            'Melemahnya tanggapan orang terhadap peringatan karena terlalu sering menyala untuk hal yang tidak perlu ditindaklanjuti. Akibatnya bukan hanya peringatan palsu diabaikan, melainkan peringatan sungguhan ikut diabaikan bersamanya.',
        },
        {
          term: 'heartbeat',
          meaning:
            'Sinyal berkala yang dikirim sebuah pekerjaan untuk menyatakan dirinya masih berjalan, dipantau dengan cara terbalik, yaitu yang memicu peringatan justru **tidak datangnya** sinyal. Dipakai untuk pekerjaan terjadwal, yang kegagalannya diam dan tidak terlihat pengguna.',
        },
      ),

      h2('Uptime check dari luar'),
      code(
        'text',
        `
        Layanan pemantau  ->  https://app.contoh.com/health/ready
                              setiap 60 detik, dari beberapa lokasi

        Gagal 2 kali berturut-turut -> kirim peringatan
        `,
      ),
      p(
        'Tiga angka di diagram ini masing-masing hasil kompromi. Interval **60 detik** menentukan seberapa cepat gangguan terdeteksi — memperpendeknya mempercepat deteksi tetapi menambah beban dan biaya. Syarat **2 kali gagal berturut-turut** menyaring gangguan jaringan sesaat; tanpa itu, satu paket yang hilang sudah cukup membangunkan orang di tengah malam.',
      ),
      p(
        'Gabungan keduanya berarti alert datang paling lambat sekitar dua menit setelah aplikasi benar-benar mati — angka yang perlu kamu ketahui, karena itulah batas bawah "berapa lama gangguan bisa berlangsung tanpa ada yang tahu". Bagian **"dari beberapa lokasi"** menutup kesalahan diagnosis yang berbeda: kegagalan yang hanya terlihat dari satu wilayah biasanya masalah jaringan di sana, bukan aplikasimu.',
      ),
      callout(
        'tip',
        'Pemantauan harus dari LUAR infrastrukturmu',
        'Pemantauan yang berjalan di server yang sama tidak akan memberi tahu apa pun saat server itu mati. Ia juga tidak melihat masalah DNS, sertifikat kedaluwarsa, atau firewall yang salah konfigurasi — tiga hal yang sepenuhnya tidak terlihat dari dalam.',
      ),

      h2('Yang dipantau'),
      table(
        ['Yang diperiksa', 'Kenapa'],
        [
          ['Halaman utama merespons', 'Gangguan total'],
          ['`/health/ready`', 'Aplikasi siap, termasuk dependensinya'],
          ['Satu alur kritis end-to-end', 'Bisa hidup tapi tidak berguna'],
          ['Sertifikat TLS', 'Kedaluwarsa = situs tidak bisa dibuka sama sekali'],
          ['Kedaluwarsa domain', 'Gangguan paling memalukan yang ada'],
        ],
      ),
      callout(
        'danger',
        'Health check yang hanya memeriksa "server merespons" menyembunyikan gangguan',
        'Aplikasi bisa menjawab `200` di halaman depan sementara login rusak, atau database putus sehingga setiap aksi gagal. Pantau juga satu **alur nyata** seperti masuk, muat data, dan simpan sesuatu, bukan hanya ketersediaan port.',
      ),

      h2('Metrik yang benar-benar berguna'),
      table(
        ['Metrik', 'Ambang yang layak diberi alert'],
        [
          ['Tingkat error 5xx', '> 1% selama 5 menit'],
          ['Latensi p95', '> 2× baseline'],
          ['Latensi p99', 'Untuk melihat pengalaman terburuk'],
          ['Pemakaian pool koneksi DB', '> 80% — akan menggantung'],
          ['Panjang antrean job', 'Tumbuh terus tanpa turun'],
          ['Disk', '> 85% — disk penuh menjatuhkan semuanya'],
          ['Memori', 'Naik terus tanpa turun = kebocoran'],
        ],
      ),
      callout(
        'warning',
        'Rata-rata menyembunyikan pengalaman terburuk',
        'Latensi rata-rata 200ms terdengar baik — sampai kamu tahu p99-nya 8 detik, yang berarti satu dari seratus permintaan sangat lambat. Kalau pengguna melakukan seratus permintaan per sesi, hampir semua orang mengalaminya. Pantau persentil, bukan rata-rata.',
      ),

      h2('Alert yang tidak melelahkan'),
      ol(
        'Beri ambang yang masuk akal — satu error `5xx` itu normal.',
        'Kelompokkan peristiwa serupa, jangan satu alert per kejadian.',
        'Setiap alert harus punya tindakan yang jelas; kalau tidak ada, jangan buat alertnya.',
        'Bedakan mana yang membangunkan orang dan mana yang cukup dibaca besok pagi.',
        'Tinjau berkala dan matikan yang selalu palsu.',
      ),
      callout(
        'danger',
        'Alert yang terlalu berisik lebih buruk daripada tidak ada alert',
        'Orang yang menerima lima puluh alert palsu per hari akan mengabaikan yang kelima puluh satu — dan itu yang sungguhan. Kelelahan alert adalah cara paling umum sistem pemantauan yang mahal menjadi tidak berguna.',
      ),

      h2('Uji bahwa pemantauannya bekerja'),
      code(
        'bash',
        `
        # Matikan aplikasi sengaja, di jam sepi
        pm2 stop api

        # Apakah alertnya benar-benar datang? Berapa lama?
        # Lalu nyalakan lagi
        pm2 start api
        `,
      ),
      p(
        'Latihan ini terasa berlebihan sampai kamu melakukannya sekali dan alertnya **tidak datang**. Yang diuji bukan aplikasinya — melainkan seluruh rantai di belakangnya: aturan ambang, integrasi ke saluran notifikasi, kunci API yang mungkin sudah kedaluwarsa, dan nomor telepon yang mungkin milik orang yang sudah pindah tim.',
      ),
      p(
        'Frasa "di jam sepi" bukan basa-basi, sebab ini sengaja membuat gangguan singkat, jadi lakukan saat dampaknya paling kecil. Ada dua hal yang perlu dicatat, yaitu apakah alertnya datang dan **berapa lama**. Angka kedua itu yang menjadi dasar realistis untuk menjanjikan waktu respons, sebab menebaknya tanpa pernah mengukur hampir selalu menghasilkan angka yang terlalu optimistis.',
      ),
      callout(
        'tip',
        'Pemantauan yang tidak pernah diuji biasanya tidak bekerja',
        'Aturan alert bisa salah tulis, saluran notifikasi bisa berubah, dan kunci integrasi bisa kedaluwarsa — semuanya tanpa gejala sampai kamu benar-benar membutuhkannya. Uji jalurnya secara berkala, sama seperti menguji cadangan.',
      ),

      h2('Halaman status'),
      p(
        'Untuk layanan yang dipakai orang lain, halaman status mengurangi beban dukungan secara signifikan. Yang penting: ia harus di-**host terpisah** dari aplikasimu — halaman status yang ikut mati saat aplikasi mati tidak berguna.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Pemantauan yang berguna menjawab pertanyaan yang berbeda dari "apakah servernya menyala". Server yang menyala dan menjawab 500 untuk setiap permintaan tetap berstatus hidup menurut ping.',
      ),
      code(
        'text',
        `
        Tiga tingkat pemeriksaan, dari yang paling lemah:

          1. PING          mesinnya membalas paket
             -> tidak membuktikan apa pun tentang aplikasimu

          2. HTTP 200      aplikasinya menjawab
             -> tidak membuktikan basis datanya hidup

          3. ALUR NYATA    satu jalur pemakaian dijalankan sungguhan
             -> inilah yang benar-benar menjawab "apakah bisa dipakai"

        Yang ketiga jauh lebih mahal dan jauh lebih berguna. Untuk
        sebagian besar aplikasi, satu alur cukup: masuk, baca satu
        data milik akun uji, dan periksa isinya.
        `,
      ),
      p(
        'Selisih antara liveness dan readiness sudah bisa dilihat dari percobaan container, dan bentuknya konkret.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Docker 29.8.0, aplikasi yang
        membutuhkan 3 detik untuk siap:

          t+1s  health=starting  /healthz=000   <- belum menerima koneksi
          t+2s  health=starting  /healthz=503
          t+3s  health=starting  /healthz=503
          t+4s  health=healthy   /healthz=200

        Selama tiga detik pertama prosesnya BERJALAN dan aplikasinya
        BELUM SIAP. Pemantauan yang hanya memeriksa apakah prosesnya
        ada akan menyatakan semuanya baik-baik saja.
        `,
      ),
      p(
        'Yang dipantau juga harus dipilih, sebab memantau segalanya menghasilkan kebisingan yang membuat alarm sungguhan tenggelam.',
      ),
      table(
        ['Yang dipantau', 'Ambang yang masuk akal', 'Artinya bila terlampaui'],
        [
          [
            'Ketersediaan endpoint utama',
            'gagal 2 kali berturut-turut',
            'Ada yang benar-benar mati',
          ],
          ['Tingkat error 5xx', '> 1% selama 5 menit', 'Ada yang rusak, belum tentu total'],
          ['Latensi p95', '> 3 kali patokan biasanya', 'Melambat, sering tanda basis data'],
          ['Sertifikat TLS', '< 30 hari sebelum kedaluwarsa', 'Akan mati total pada tanggal itu'],
          ['Ruang disk', '> 85% terpakai', 'Akan berhenti menulis, termasuk log'],
          [
            'Job antrean tertunda',
            'antrean tumbuh 30 menit berturut-turut',
            'Pekerjanya mati atau terlalu lambat',
          ],
        ],
      ),
      p(
        'Baris keempat pantas ditegaskan karena ia penyebab pemadaman total yang paling mudah dicegah. Sertifikat yang kedaluwarsa membuat seluruh situs tidak bisa diakses, dan satu alarm tiga puluh hari sebelumnya sudah cukup.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan curl 8.5.0 terhadap situs uji:

          expired.badssl.com
            curl: (60) SSL certificate problem: certificate has expired

        Dan yang dilihat pengunjung:
          NET::ERR_CERT_DATE_INVALID

        Yang dipantau seharusnya TANGGAL KEDALUWARSA-nya, bukan
        apakah proses pembaruannya berjalan. Proses yang berjalan
        tanpa berhasil tetap terlihat sehat.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pemantauan punya dua arah, dan keduanya berakhir sama, yaitu tidak ada yang datang saat dibutuhkan.',
      ),
      code(
        'text',
        `
        ARAH PERTAMA — terlalu banyak alarm

          03:14  CPU di atas 80%
          03:15  CPU di atas 80%
          03:17  latensi naik
          03:18  CPU di atas 80%
          ...

        Setelah dua minggu, semua orang membisukan salurannya.
        Pemadaman sungguhan pada minggu ketiga tidak dilihat siapa pun.

        Yang menutupnya:
          - alarm pada GEJALA yang dirasakan pengguna, bukan pada
            metrik mesin
          - ambang yang menuntut durasi, bukan satu kali lewat
          - pengelompokan: sepuluh kejadian sejenis menjadi satu alarm

        ARAH KEDUA — tidak ada alarm sama sekali

          Pemantauannya ada, dasbornya bagus, dan tidak ada satu pun
          yang membangunkan orang. Dasbor yang tidak dilihat bukan
          deteksi, melainkan arsip.
        `,
      ),
      p(
        'Ada juga kegagalan yang khas pada pemantauannya sendiri, dan gejalanya adalah keheningan yang disalahartikan sebagai kabar baik.',
      ),
      code(
        'text',
        `
        1. Pemantau berjalan di dalam jaringan yang sama

           Bila ia dipasang di server yang sama, mati bersamaan
           dengan yang dipantaunya. Pantau dari LUAR.

        2. Alarm dikirim lewat jalur yang ikut mati

           Notifikasi lewat surel yang server surelnya ada di
           infrastruktur yang sama. Pakai jalur yang terpisah.

        3. Pemantau memakai cache

           Memeriksa halaman yang disajikan CDN berarti memeriksa
           CDN, bukan aplikasimu. Pakai endpoint yang bertanda
           Cache-Control: no-store.

        4. Healthcheck-nya sendiri yang membebani

           interval 1 detik dengan pemeriksaan yang menjalankan
           query agregasi berarti satu query berat setiap detik per
           instance.
        `,
      ),
      p(
        'Satu kesalahan lagi menyangkut isi endpoint kesehatannya, dan akibatnya keamanan, bukan ketersediaan.',
      ),
      code(
        'text',
        `
          GET /healthz
          {"ok":true,"versi":"2.4.1","db":"postgres://app:rahasia@db:5432",
           "commit":"a1b2c3d","env":{"NODE_ENV":"production",...}}

        Endpoint ini biasanya TIDAK dilindungi, sebab pemantau harus
        bisa memanggilnya tanpa kredensial. Ia tidak boleh memuat apa
        pun selain status. Rincian diagnostik ditaruh di endpoint
        terpisah yang memerlukan autentikasi.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemantauan mudah dipasang dan sulit dibuat berguna, dan selisihnya terletak pada apa yang dipilih untuk membangunkan orang.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memantau dengan ping saja',
            'Kalau mesinnya hidup, aplikasinya hidup',
            'Server yang menjawab 500 untuk semua permintaan tetap membalas ping',
          ],
          [
            'Memeriksa hanya `HTTP 200`',
            'Aplikasinya kan menjawab',
            'Diukur, `/healthz` menjawab 503 selama tiga detik pertama. Dan 200 tidak membuktikan basis datanya hidup',
          ],
          [
            'Memasang alarm untuk setiap metrik mesin',
            'Biar tidak ada yang terlewat',
            'Alarm menjadi kebisingan, semua orang membisukannya, dan pemadaman sungguhan tidak terlihat',
          ],
          [
            'Memantau dari dalam jaringan yang sama',
            'Lebih dekat, lebih akurat',
            'Pemantaunya mati bersamaan dengan yang dipantau. Keheningannya disalahartikan sebagai baik-baik saja',
          ],
          [
            'Memantau proses pembaruan sertifikat',
            'Yang penting prosesnya jalan',
            'Proses yang berjalan tanpa berhasil tetap terlihat sehat. Pantau TANGGAL KEDALUWARSA-nya',
          ],
          [
            'Menaruh rincian konfigurasi di `/healthz`',
            'Biar gampang mendiagnosis',
            'Endpoint itu biasanya tidak dilindungi. Ia hanya boleh memuat status',
          ],
        ],
      ),
      p(
        'Cara menguji apakah pemantauanmu benar-benar bekerja hanya perlu satu percobaan yang sengaja, dan pantas dijadwalkan sekali. Matikan satu dependency di lingkungan yang bukan produksi, lalu ukur berapa lama sampai ada notifikasi yang benar-benar sampai ke telepon seseorang. Angka itu adalah waktu deteksimu yang sesungguhnya, dan ia hampir selalu jauh lebih lama daripada yang diperkirakan sebelum dicoba.',
      ),
      references(
        {
          label: 'Monitoring Distributed Systems',
          href: 'https://sre.google/sre-book/monitoring-distributed-systems/',
          source: 'Google SRE Book',
          note: 'Sumber primer empat sinyal emas dan alasan memilih justru keempatnya',
        },
        {
          label: 'Service Level Objectives',
          href: 'https://sre.google/sre-book/service-level-objectives/',
          source: 'Google SRE Book',
          note: 'Pemisahan tegas SLI, SLO, dan SLA beserta cara menurunkan error budget',
        },
        {
          label: 'Overview',
          href: 'https://prometheus.io/docs/introduction/overview/',
          source: 'Prometheus Docs',
          note: 'Model data dan cara pengambilan ukuran pada satu sistem pemantauan nyata',
        },
        {
          label: 'Alerting on SLOs',
          href: 'https://sre.google/workbook/alerting-on-slos/',
          source: 'Google SRE Workbook',
          note: 'Cara menyusun peringatan yang menyala hanya saat memang perlu ditindaklanjuti',
        },
      ),
    ],
  ),

  written(
    'error-tracking',
    'Error Tracking',
    18,
    'Mengumpulkan kegagalan sungguhan, dari pengguna sungguhan.',
    [
      p(
        'Log memberi tahu apa yang terjadi kalau kamu tahu di mana mencarinya. Error tracking **mendatangi** kamu: mengelompokkan kegagalan yang sama, menghitungnya, dan memberi tahu saat ada yang baru.',
      ),

      terms(
        {
          term: 'error tracking',
          meaning:
            'Pengumpulan otomatis error yang terjadi di aplikasi beserta konteksnya, lalu mengelompokkan yang serupa supaya bisa diurutkan berdasarkan dampak. Bedanya dengan membaca log, di sini yang sama digabungkan sehingga seribu kejadian tampil sebagai satu masalah dengan hitungan seribu.',
        },
        {
          term: 'stack trace',
          meaning:
            'Jejak urutan pemanggilan fungsi saat error terjadi. Di produksi jejaknya menunjuk kode yang sudah diperkecil, sehingga perlu source map supaya kembali menunjuk baris aslinya.',
        },
        {
          term: 'unhandled rejection',
          meaning:
            'Promise yang ditolak tanpa ada yang menangkapnya. Di Node.js keadaan ini secara bawaan menghentikan proses, sehingga ia bukan sekadar pesan peringatan melainkan penyebab matinya layanan.',
        },
        {
          term: 'uncaught exception',
          meaning:
            'Error yang lolos sampai ke puncak tanpa tertangkap. Menangkapnya secara global hanya pantas dipakai untuk mencatat lalu keluar dengan tertib, sebab melanjutkan proses sesudahnya berarti berjalan dengan keadaan yang tidak lagi bisa dipercaya.',
        },
        {
          term: 'window error event',
          meaning:
            'Peristiwa di peramban yang menyala saat ada error JavaScript yang tidak tertangkap, dipakai untuk melaporkan error sisi klien. Pasangannya untuk promise adalah peristiwa `unhandledrejection`.',
        },
        {
          term: 'breadcrumb',
          meaning:
            'Jejak peristiwa kecil sebelum error terjadi, misalnya halaman yang dibuka dan tombol yang ditekan. Yang membuatnya berharga, ia menjawab pertanyaan "apa yang dilakukan pengguna sampai ini terjadi" yang tidak terjawab stack trace.',
        },
        {
          term: 'grouping atau fingerprinting',
          meaning:
            'Penggabungan error yang dianggap sama menjadi satu masalah. Bila aturannya terlalu longgar masalah berbeda tercampur, bila terlalu ketat satu masalah pecah menjadi ratusan entri, dan keduanya sama-sama membuat urutan dampaknya menyesatkan.',
        },
        {
          term: 'PII',
          meaning:
            'Singkatan *Personally Identifiable Information*, data yang bisa mengidentifikasi seseorang. Laporan error gampang ikut membawanya lewat isi formulir atau parameter alamat, sehingga penyaringan harus dipasang sebelum laporan dikirim, bukan sesudah.',
        },
      ),

      h2('Menyiapkan'),
      code(
        'ts',
        `
        import * as Sentry from '@sentry/nextjs';

        Sentry.init({
          dsn: process.env.SENTRY_DSN,
          environment: process.env.NODE_ENV,

          // Rilis dikaitkan ke commit -> tahu deploy mana yang memperkenalkannya
          release: process.env.VERCEL_GIT_COMMIT_SHA,

          // Ambil sebagian saja pada trafik tinggi
          tracesSampleRate: 0.1,

          // WAJIB: buang data sensitif SEBELUM dikirim keluar
          beforeSend(event) {
            if (event.request?.headers) {
              delete event.request.headers.authorization;
              delete event.request.headers.cookie;
            }
            delete event.request?.data;   // body bisa memuat apa saja
            return event;
          },

          // Abaikan yang bukan bug kita
          ignoreErrors: [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            'AbortError',
          ],
        });
        `,
      ),
      p(
        '`release: process.env.VERCEL_GIT_COMMIT_SHA` adalah baris yang paling sering dilewati padahal paling berguna saat panik. Dengan setiap error tertandai SHA commit-nya, pertanyaan "kapan ini mulai muncul" berubah dari penelusuran log menjadi satu tampilan grafik — dan error yang lonjakannya persis di satu rilis hampir selalu disebabkan rilis itu.',
      ),
      p(
        '`tracesSampleRate: 0.1` merekam **10%** permintaan untuk pelacakan performa, bukan semuanya. Ini murni soal biaya dan beban: merekam seluruh trafik pada aplikasi ramai menghabiskan kuota dan menambah latensi, sementara 10% sudah cukup untuk melihat pola. Perhatikan ini hanya berlaku untuk trace performa — **error** tetap dikirim seluruhnya.',
      ),
      p(
        'Fungsi `beforeSend` adalah satu-satunya tempat kamu mengendalikan apa yang keluar dari servermu. Ia menghapus header `authorization` (yang memuat token) dan `cookie` (yang memuat sesi), lalu membuang `event.request?.data` — body permintaan, yang bisa berisi password, nomor kartu, atau data pribadi apa pun. Menghapus body sepenuhnya memang mengurangi konteks saat mendiagnosis; itu pertukaran yang disengaja, dan `requestId` di bagian berikutnya yang menggantikan konteks tersebut secara aman.',
      ),
      p(
        '`ignoreErrors` menyaring kebisingan yang bukan bug aplikasimu. `ResizeObserver loop limit exceeded` adalah peringatan browser yang tidak berdampak pada pengguna; `AbortError` muncul saat pengguna berpindah halaman sebelum permintaan selesai. Membiarkan keduanya masuk berarti bug sungguhan tenggelam di antara ribuan kejadian normal.',
      ),
      callout(
        'danger',
        'Error tracking mengirim data aplikasimu ke pihak ketiga',
        'Body permintaan, header, dan konteks pengguna semuanya bisa memuat data pribadi atau kredensial. `beforeSend` bukan opsional — ia satu-satunya tempat kamu mengendalikan apa yang benar-benar keluar. Perlakukan seperti log: jangan pernah mengirim seluruh body.',
      ),

      h2('Konteks yang berguna'),
      code(
        'ts',
        `
        // ID saja — jangan email, jangan nama
        Sentry.setUser({ id: String(pengguna.id) });

        Sentry.setTag('fitur', 'ekspor');

        // requestId menghubungkan error ini ke log server
        Sentry.setContext('permintaan', { requestId: req.id, rute: '/api/ekspor' });
        `,
      ),
      p(
        '`setUser({ id: String(pengguna.id) })` sengaja hanya mengirim ID, dan komentarnya menegaskannya. ID sudah cukup untuk menjawab pertanyaan yang penting, yaitu berapa banyak pengguna berbeda yang terkena dan apakah ini terjadi pada satu orang saja, sementara email dan nama adalah data pribadi yang tidak menambah kemampuan diagnosis apa pun. Kalau kamu perlu menghubungi orangnya, ID itu bisa kamu cocokkan sendiri di databasemu.',
      ),
      p(
        "`setTag('fitur', 'ekspor')` menambahkan label yang bisa disaring dan diagregasi — berbeda dari `setContext`, yang menyimpan data rinci untuk dibaca saat membuka satu error. Aturan praktisnya: **tag** untuk hal yang ingin kamu kelompokkan (fitur, tenant, versi klien), **context** untuk detail yang hanya berguna setelah kamu masuk ke kejadian tertentu.",
      ),
      p(
        'Baris `requestId` yang mengikat semuanya. ID yang sama dicetak di log server, dikirim ke error tracker, dan dikembalikan ke pengguna dalam respons error — sehingga laporan "saya dapat error dengan kode 7f3a2b" bisa langsung ditelusuri ke satu permintaan spesifik, lengkap dengan stack trace dan seluruh baris lognya.',
      ),
      callout(
        'tip',
        '`requestId` adalah penghubung yang paling berharga',
        'Dengan id yang sama muncul di error tracker, log server, dan respons ke pengguna, satu pencarian menemukan ketiganya. Tanpa itu, kamu menebak dari perkiraan waktu — dan pada trafik tinggi itu mustahil.',
      ),

      h2('Yang layak dikirim dan yang tidak'),
      table(
        ['Kirim', 'Jangan'],
        [
          ['Bug tak terduga (`5xx`)', 'Kegagalan validasi (`422`) — itu normal'],
          ['Kegagalan dependensi', 'Permintaan yang dibatalkan pengguna'],
          ['Error tak tertangkap', 'Error dari ekstensi browser'],
          ['Kegagalan job antrean', 'Error jaringan pengguna'],
        ],
      ),
      callout(
        'warning',
        'Mengirim setiap `4xx` membuat error tracker jadi tidak berguna',
        'Validasi yang gagal adalah bagian normal dari kontrak API. Membanjirinya ke error tracker menenggelamkan bug sungguhan di antara ribuan kejadian yang memang seharusnya terjadi.',
      ),

      h2('Source map'),
      code(
        'bash',
        `
        # Tanpa source map, stack trace produksi tidak terbaca:
        #   at t (main-a1b2c3.js:1:48291)
        #
        # Dengan source map:
        #   at prosesEkspor (src/services/ekspor.ts:42:12)
        `,
      ),
      p(
        'Dua baris itu adalah error yang **sama persis**, ditampilkan sebelum dan sesudah source map diterapkan. Yang pertama menunjuk `main-a1b2c3.js:1:48291` — satu baris raksasa hasil minifikasi, dengan nama fungsi yang sudah dipendekkan menjadi `t`. Informasi itu praktis tidak bisa dipakai: kamu tahu ada yang gagal, tetapi tidak tahu di berkas mana.',
      ),
      p(
        'Source map adalah berkas pemetaan yang menerjemahkan posisi di kode terminifikasi kembali ke posisi di kode sumber — sehingga `at t (main-a1b2c3.js:1:48291)` menjadi `at prosesEkspor (src/services/ekspor.ts:42:12)`. Peringatan berikut menyebut syaratnya: unggah berkas itu ke error tracker saat build, lalu **hapus dari artefak yang di-deploy**, karena menyajikannya dari server publik sama saja membagikan seluruh kode sumbermu.',
      ),
      callout(
        'danger',
        'Unggah source map ke error tracker — jangan sajikan dari server publik',
        'Source map memperlihatkan seluruh kode sumbermu, termasuk komentar dan nama variabel internal. Unggah saat build supaya error tracker bisa memakainya, lalu **hapus dari artefak yang di-deploy**.',
      ),

      h2('Triase'),
      ol(
        '**Berapa banyak pengguna terkena?** Satu orang atau seribu.',
        '**Apakah baru?** Error baru setelah deploy hampir selalu berhubungan dengannya.',
        '**Apakah meningkat?** Yang naik cepat lebih mendesak daripada yang stabil.',
        '**Apakah menghalangi?** Fitur rusak total atau sekadar mengganggu.',
      ),

      h2('Setelah diperbaiki'),
      code(
        'ts',
        `
        // Tandai selesai di rilis tertentu. Kalau ia muncul lagi
        // di rilis yang lebih baru, tracker membukanya kembali —
        // dan kamu tahu perbaikannya tidak bertahan.
        `,
      ),
      p(
        'Menandai error sebagai selesai **pada rilis tertentu** berbeda dari sekadar menutupnya. Tracker menyimpan nomor rilis itu, lalu memantau: kalau error yang sama muncul lagi di rilis yang lebih baru, ia dibuka kembali secara otomatis dan ditandai sebagai regresi.',
      ),
      p(
        'Itu menutup kegagalan yang sangat mudah terjadi — perbaikan yang tidak bertahan. Tanpa mekanisme ini, error yang kembali muncul terlihat sebagai kejadian baru di antara ratusan lainnya, dan tidak ada yang menyadari bahwa masalah ini pernah dinyatakan selesai. Kaitannya langsung dengan `release` di konfigurasi awal: tanpa rilis yang tercatat, tracker tidak punya dasar untuk membedakan "muncul lagi" dari "belum pernah beres".',
      ),
      callout(
        'tip',
        'Regresi yang terbuka kembali adalah sinyal penting',
        'Bug yang kembali berarti perbaikannya menyembuhkan gejala, bukan penyebab — atau tidak ada tes yang menjaganya. Keduanya menuntut tindakan yang berbeda dari sekadar memperbaikinya lagi.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Error tracking menjawab pertanyaan yang tidak bisa dijawab log biasa, yaitu berapa banyak pengguna yang terkena satu masalah yang sama, dan sejak kapan.',
      ),
      code(
        'text',
        `
        Log biasa memberi ini:

          2026-09-14T08:31:02Z ERROR TypeError: Cannot read properties
          of undefined (reading 'nama') at /app/src/profil.tsx:42

        Diulang 4.000 kali dalam sehari, dan tidak ada yang tahu
        bahwa itu satu masalah yang sama.

        Error tracking memberi ini:

          TypeError: Cannot read properties of undefined (reading 'nama')
            pertama terlihat : 3 jam lalu, rilis 2.4.1
            kejadian         : 4.021
            pengguna terkena : 312
            peramban         : Chrome 149 (87%), Safari 18 (13%)
            jalur            : /profil/[id]  (100%)
            rilis            : 2.4.1 (100%), 2.4.0 (0%)

        Baris terakhir itu yang menyelesaikan penelusuran: masalahnya
        lahir bersama rilis 2.4.1.
        `,
        {
          caption:
            'Yang dibeli bukan pencatatannya melainkan pengelompokan, penghitungan, dan kaitannya ke rilis.',
        },
      ),
      p(
        'Supaya pengelompokannya bekerja, pesan error harus stabil, dan ini yang paling sering merusaknya.',
      ),
      code(
        'ts',
        `
        // SALAH: setiap kejadian menjadi kelompok yang BERBEDA,
        // sebab pesannya memuat nilai yang selalu lain.
        throw new Error(\`Gagal memuat pengguna \${id} pada \${Date.now()}\`);

        // BENAR: pesannya tetap, nilainya masuk ke konteks.
        throw new GagalMuat('Gagal memuat pengguna', {
          cause: e,
          konteks: { penggunaId: id },
        });

        // Dan sertakan sebab aslinya. Tanpa cause, jejak yang
        // sebenarnya hilang dan yang tersisa hanya pesan pembungkusnya.
        `,
      ),
      p(
        'Bagian yang paling sering keliru dalam pemasangannya adalah apa yang ikut terkirim, sebab laporan error biasanya memuat seluruh konteks permintaan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0, pola "kirim semuanya":

          {"jalur":"/v1/masuk",
           "headers":{"authorization":"Bearer eyJhbGciOiJIUzI1NiJ9...",
                      "cookie":"sesi=s%3Aabc123"},
           "body":{"surel":"ana@contoh.id","sandi":"RahasiaSaya123!",
                   "kartu":"4111111111111111"}}

        Sesudah redaksi berbasis daftar kunci:

          {"jalur":"/v1/masuk",
           "headers":{"authorization":"[DIREDAKSI]","cookie":"[DIREDAKSI]"},
           "body":{"surel":"ana@contoh.id","sandi":"[DIREDAKSI]",
                   "kartu":"[DIREDAKSI]"}}
        `,
      ),
      code(
        'text',
        `
        Dan batas redaksi itu, juga diukur:

          masuk  : {"catatan":"sandinya RahasiaSaya123!",
                    "metadata":{"Authorization":"Bearer abc"},
                    "q":"password=xyz"}

          keluar : {"catatan":"sandinya RahasiaSaya123!",
                    "metadata":{"Authorization":"[DIREDAKSI]"},
                    "q":"password=xyz"}

        Kunci berhuruf besar TERTANGKAP. Rahasia di dalam TEKS BEBAS
        lolos sepenuhnya.

        Redaksi mengurangi paparan. Ia tidak menjaminnya, dan itu
        alasan keputusan pertamanya bukan "bagaimana meredaksi"
        melainkan "apakah ini perlu dikirim sama sekali".
        `,
        {
          caption:
            'Laporan error dikirim ke layanan pihak ketiga. Apa pun yang ikut di dalamnya keluar dari infrastrukturmu.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu kelas error yang tidak pernah sampai ke pelacak bila penanganannya tidak dipasang khusus, dan justru itu yang paling sering menjadi bug diam.',
      ),
      code(
        'text',
        `
        1. Penolakan promise yang tidak ditangani

           Node 26 mengakhiri proses secara bawaan, dan itu perilaku
           yang benar. Yang salah adalah mematikannya:

             process.on('unhandledRejection', () => {});   // BAHAYA

           Baris itu membuat kegagalan hilang tanpa jejak. Yang benar:
           catat, laporkan, lalu keluar dengan rapi.

        2. Error di dalam penangan peristiwa

           emitter.on('data', () => { throw new Error('x'); });

           Lemparan di dalam penangan tidak tertangkap try/catch di
           sekitarnya. Ia naik sebagai uncaughtException.

        3. Error di komponen klien

           Tanpa error boundary, satu komponen yang gagal merender
           membuat SELURUH pohon hilang dan layar menjadi kosong.
           Tanpa pelacak di sisi klien, tidak ada yang tahu.

        4. Error yang tertangkap lalu didiamkan

           try { ... } catch { /* biarkan */ }

           Ini yang paling berbahaya dari keempatnya, sebab ia
           mengubah kegagalan yang keras menjadi kerusakan data
           yang senyap.
        `,
      ),
      p(
        'Sisi lain dari pemasangannya adalah membedakan mana yang memang error dan mana yang bagian normal dari kontrak.',
      ),
      code(
        'text',
        `
        BUKAN error, jangan dilaporkan sebagai error:

          400 dan 422 karena masukan tidak valid
          401 karena token kedaluwarsa
          404 untuk sumber daya yang memang tidak ada
          409 karena konflik yang memang mungkin terjadi
          AbortError karena pengguna berpindah halaman

        MEMANG error:
          500, kegagalan dependency, pelanggaran invarian yang
          "tidak mungkin terjadi"

        Mencampur keduanya membuat jumlah errornya besar dan tidak
        berarti apa-apa, lalu semua orang berhenti melihatnya.
        `,
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang khas pada aplikasi dengan banyak pengguna:

          Peristiwa error dikirim tanpa pembatasan.

          Satu bug pada halaman yang ramai menghasilkan puluhan ribu
          laporan identik dalam hitungan menit, menghabiskan kuota
          langganan, dan menutupi error lain yang lebih penting.

          Yang menutupnya: pengambilan sampel untuk error bervolume
          tinggi, dan pembatasan laju di sisi klien.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Error tracking mudah dipasang dalam lima menit, dan yang menentukan apakah ia berguna terjadi sesudahnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyertakan nilai berubah di dalam pesan error',
            'Biar konteksnya jelas',
            'Setiap kejadian menjadi kelompok berbeda. Pesan tetap, nilainya masuk ke konteks',
          ],
          [
            'Mengirim seluruh badan permintaan sebagai konteks',
            'Biar lengkap saat mendiagnosis',
            'Diukur, sandi, token, cookie, dan nomor kartu ikut keluar ke layanan pihak ketiga',
          ],
          [
            'Menganggap redaksi berbasis kunci sudah menjamin',
            'Semua kunci rahasia sudah terdaftar',
            'Diukur, rahasia di dalam teks bebas lolos. Redaksi mengurangi paparan, bukan menjaminnya',
          ],
          [
            'Membisukan `unhandledRejection`',
            'Biar prosesnya tidak mati',
            'Kegagalan hilang tanpa jejak. Catat, laporkan, lalu keluar dengan rapi',
          ],
          [
            'Melaporkan 4xx sebagai error',
            'Statusnya kan error',
            'Jumlahnya membengkak dan tidak berarti apa-apa. Error yang penting tenggelam',
          ],
          [
            'Menangkap error lalu mendiamkannya',
            'Supaya tidak mengganggu pengguna',
            'Itu mengubah kegagalan keras menjadi kerusakan data senyap. Tangani, atau biarkan naik',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan terus terang bahwa tidak ada layanan error tracking yang dipasang dalam penyusunan materi ini, sebab semuanya memerlukan akun. Yang **dijalankan sungguhan** adalah perilaku redaksi beserta batasnya, dan bentuk log terstruktur yang menutup penyisipan baris palsu. Kemampuan pengelompokan dan penghitungan pengguna terkena dijelaskan mengikuti cara kerja umum layanan-layanan itu, dan ditandai sebagai tidak dieksekusi.',
      ),
      references(
        {
          label: 'Window: error event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event',
          source: 'MDN',
          note: 'Peristiwa yang dipakai menangkap error tak tertangkap di peramban',
        },
        {
          label: 'Window: unhandledrejection event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event',
          source: 'MDN',
          note: 'Pasangannya untuk promise yang ditolak tanpa penangan',
        },
        {
          label: 'process: uncaughtException',
          href: 'https://nodejs.org/api/process.html#event-uncaughtexception',
          source: 'Node.js Docs',
          note: 'Peringatan resmi kenapa melanjutkan proses sesudahnya tidak aman',
        },
        {
          label: 'Observability primer',
          href: 'https://opentelemetry.io/docs/concepts/observability-primer/',
          source: 'OpenTelemetry Docs',
          note: 'Hubungan error, log, metrik, dan trace sebagai satu gambaran',
        },
      ),
    ],
  ),

  written(
    'logging-terpusat',
    'Logging Terpusat & Correlation ID',
    18,
    'Log yang bisa dicari, dan yang selamat dari instance yang dibuang.',
    [
      terms(
        {
          term: 'structured logging',
          meaning:
            'Menulis log sebagai data berbentuk tetap, biasanya JSON dengan field bernama, bukan kalimat bebas. Bedanya terasa saat mencari, sebab field bisa disaring dan dijumlahkan, sementara kalimat hanya bisa dicocokkan teksnya.',
        },
        {
          term: 'log level',
          meaning:
            'Tingkat kepentingan sebuah baris log, dari `debug`, `info`, `warn`, sampai `error`. Gunanya menyaring, sehingga produksi bisa menyimpan yang penting saja tanpa kehilangan kemampuan menyalakan yang detail saat menelusuri masalah.',
        },
        {
          term: 'correlation id',
          meaning:
            'Penanda unik yang ikut di seluruh baris log satu permintaan, bahkan lintas layanan. Tanpa ini, log dari banyak permintaan yang berjalan bersamaan saling berselang-seling dan tidak bisa dipisahkan lagi.',
        },
        {
          term: 'stdout sebagai aliran',
          meaning:
            'Prinsip Twelve-Factor bahwa aplikasi cukup menulis log ke keluaran standar tanpa mengurus berkas, rotasi, atau pengiriman. Lingkungan yang menjalankannya yang menangkap dan meneruskan, sehingga aplikasi yang sama bekerja di laptop maupun di container.',
        },
        {
          term: 'log aggregation',
          meaning:
            'Pengumpulan log dari banyak instance ke satu tempat yang bisa dicari. Penting karena instance bisa mati kapan saja, dan log yang hanya ada di mesin yang sudah hilang tidak bisa dibaca lagi justru saat paling dibutuhkan.',
        },
        {
          term: 'retention',
          meaning:
            'Berapa lama log disimpan sebelum dibuang. Selalu kompromi antara biaya dan kemampuan menelusuri kejadian lama, dan angkanya perlu ditetapkan sadar sebab masalah sering baru disadari berhari-hari sesudahnya.',
        },
        {
          term: 'redaction',
          meaning:
            'Penyensoran nilai sensitif sebelum log ditulis, misalnya token, kata sandi, dan data pribadi. Dipasang di lapisan penulis log supaya berlaku otomatis, sebab mengandalkan setiap pemanggil untuk ingat menyensor pasti bocor cepat atau lambat.',
        },
        {
          term: 'sampling',
          meaning:
            'Menyimpan sebagian saja dari peristiwa yang sangat sering terjadi, untuk menekan biaya dan kebisingan. Perlu hati-hati pada error, sebab kejadian yang jarang justru yang paling ingin kamu lihat utuh.',
        },
      ),

      h2('Kenapa terpusat'),
      table(
        ['Masalah log lokal', 'Akibat'],
        [
          ['Hilang saat instance diganti', 'Tidak ada jejak untuk diselidiki'],
          ['Tersebar di banyak server', 'Harus SSH ke satu per satu'],
          ['Tidak bisa dicari lintas layanan', 'Tidak bisa merangkai satu permintaan'],
          ['Bisa dihapus penyerang', 'Jejak serangan lenyap'],
          ['Memenuhi disk', 'Disk penuh menjatuhkan aplikasi'],
        ],
      ),
      callout(
        'danger',
        'Log yang hanya ada di instance yang dibobol tidak berguna',
        'Penyerang yang menguasai satu instance bisa menghapus jejaknya. Log harus dikirim keluar segera setelah ditulis, ke tempat yang instance itu tidak punya izin menghapusnya.',
      ),

      h2('Aplikasi menulis ke stdout'),
      code(
        'js',
        `
        // Jangan mengelola berkas log dan rotasinya sendiri.
        // Tulis ke stdout; biarkan lingkungan yang mengumpulkan.
        log.info({ reqId, method, url, status, durasiMs }, 'permintaan selesai');
        `,
      ),
      code(
        'text',
        `
        Aplikasi (stdout)  ->  Kolektor  ->  Penyimpanan  ->  Antarmuka pencarian
                               (Vector,       (Loki, ES,      (Grafana, Kibana)
                                Fluent Bit)    CloudWatch)
        `,
      ),
      p(
        'Pemanggilan `log.info` di potongan pertama mengoper **objek** sebagai argumen pertama dan pesannya sebagai argumen kedua. Urutan itu bukan gaya penulisan: field seperti `reqId`, `status`, dan `durasiMs` menjadi kolom yang bisa disaring dan dihitung, sementara teks `\'permintaan selesai\'` hanya label untuk dibaca manusia. Perbandingan di bagian "Log terstruktur" di bawah menunjukkan selisih nilainya.',
      ),
      p(
        'Diagram di potongan kedua menjelaskan kenapa aplikasi cukup menulis ke `stdout`. Setiap kotak punya satu tugas: **kolektor** membaca keluaran proses dan mengirimnya keluar, **penyimpanan** mengindeksnya agar bisa dicari, dan **antarmuka** yang kamu buka saat menyelidiki. Aplikasi tidak perlu tahu satu pun dari ketiganya.',
      ),
      p(
        'Konsekuensi praktisnya: berpindah dari CloudWatch ke Loki tidak menyentuh satu baris pun kode aplikasi — yang berubah hanya konfigurasi kolektor. Dan karena log dikirim keluar segera setelah ditulis, ia selamat meski instance-nya dibuang atau dikuasai penyerang.',
      ),

      h2('Correlation ID'),
      code(
        'js',
        `
        export function pencatatPermintaan(req, res, next) {
          // Hormati id dari hulu supaya trace lintas layanan tersambung
          req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
          res.setHeader('X-Request-Id', req.id);

          req.log = log.child({ reqId: req.id });
          next();
        }
        `,
      ),
      code(
        'js',
        `
        // Teruskan saat memanggil layanan lain
        await fetch(urlLayananLain, {
          headers: { 'X-Request-Id': req.id },
        });
        `,
      ),
      p(
        "Baris `req.headers['x-request-id'] ?? crypto.randomUUID()` adalah inti pola ini. Operator `??` berarti pakai ID yang sudah dibawa permintaan kalau ada, lalu buat yang baru kalau tidak ada. Layanan pertama yang disentuh permintaan menciptakan ID-nya, lalu layanan berikutnya **mewarisi** ID yang sama, dan itulah yang membuat satu perjalanan bisa dirangkai melintasi beberapa sistem.",
      ),
      p(
        "`res.setHeader('X-Request-Id', req.id)` mengirim ID itu kembali ke pemanggil, sehingga ia muncul di panel Network browser dan bisa disebutkan pengguna saat melapor. `log.child({ reqId: req.id })` membuat logger turunan yang **otomatis** menyertakan field itu di setiap baris — tanpa kamu perlu mengoper `reqId` ke setiap fungsi yang mencatat sesuatu.",
      ),
      p(
        'Potongan kedua menutup rantainya. Panggilan keluar yang tidak meneruskan `X-Request-Id` memutus jejak tepat di batas antar-layanan: layanan tujuan membuat ID baru, dan hubungannya dengan permintaan asal hilang. Terapkan hal yang sama pada job yang dimasukkan ke antrean — simpan `reqId` di payload job, supaya kegagalan yang terjadi jauh kemudian tetap bisa ditelusuri ke permintaan yang memicunya.',
      ),
      callout(
        'tip',
        'Satu id yang melintasi frontend, API, dan worker mengubah investigasi',
        'Tanpa itu, menelusuri satu permintaan berarti mencocokkan waktu antar tiga sistem — dan pada trafik tinggi itu tidak mungkin. Dengan itu, satu pencarian menemukan seluruh perjalanannya.',
      ),

      h2('Log terstruktur'),
      compare(
        {
          title: 'Teks bebas',
          lang: 'text',
          code: `
          Pengguna 42 gagal ekspor:
            timeout setelah 30s

          Tidak bisa disaring per pengguna.
          Tidak bisa dihitung.
          Tidak bisa dibuat grafiknya.
          `,
          notes: ['Hanya berguna dibaca manusia satu per satu'],
        },
        {
          title: 'Terstruktur',
          lang: 'json',
          code: `
          {"level":50,"time":1754...,
           "reqId":"a1b2","userId":"42",
           "aksi":"ekspor","durasiMs":30000,
           "err":{"type":"TimeoutError"},
           "msg":"ekspor gagal"}
          `,
          notes: ['Bisa disaring, dihitung, dan diberi alert'],
        },
      ),
      p(
        'Kedua kolom memuat **informasi yang sama**: pengguna 42, aksi ekspor, gagal karena timeout setelah 30 detik. Yang berbeda adalah apakah mesin bisa memahaminya. Kolom kiri hanya bisa dicari dengan pencocokan teks — dan pencarian teks gagal begitu formatnya sedikit berubah, misalnya "Pengguna 42" ditulis "user 42" di tempat lain.',
      ),
      p(
        'Di kolom kanan, tiap potongan informasi menjadi field bernama. Karena `durasiMs` adalah **angka**, kamu bisa bertanya "berapa banyak ekspor yang melebihi 10 detik minggu ini" dan mendapat jawaban; karena `userId` adalah field tersendiri, kamu bisa menyaring seluruh aktivitas satu pengguna. Field `level: 50` adalah konvensi pino untuk `error` — angka, bukan teks, supaya bisa dibandingkan dengan `>=` seperti di contoh pencarian di akhir sub-bab ini.',
      ),
      p(
        'Yang perlu digarisbawahi: log terstruktur **tidak lebih sulit ditulis**. Perbedaannya hanya mengoper objek alih-alih merangkai string, dan hasilnya berubah dari catatan yang dibaca satu per satu menjadi data yang bisa diberi alert.',
      ),

      h2('Yang tidak boleh dicatat'),
      code(
        'js',
        `
        redact: {
          paths: [
            'req.headers.authorization', 'req.headers.cookie',
            'password', '*.password', '*.kataSandi',
            'token', '*.token', '*.refreshToken',
            '*.nomorKtp', '*.kartuKredit',
          ],
          censor: '[DISENSOR]',
        },
        `,
      ),
      p(
        'Perhatikan hampir setiap entri ditulis dua kali, yaitu `password` dan `*.password`, serta `token` dan `*.token`. Jalur tanpa bintang hanya cocok di tingkat teratas objek, sedangkan `*.password` cocok satu tingkat lebih dalam seperti `body.password` atau `pengguna.password`. Melewatkan varian berbintang adalah kesalahan paling umum, karena data sensitif biasanya bersarang di dalam objek, bukan berdiri sendiri.',
      ),
      p(
        "Dua baris pertama menyensor header `authorization` dan `cookie`, yang keduanya memuat kredensial aktif — bocornya berarti sesi yang bisa langsung dipakai orang lain. Baris terakhir (`*.nomorKtp`, `*.kartuKredit`) menyensor data pribadi yang kebocorannya membawa konsekuensi hukum, bukan sekadar teknis. `censor: '[DISENSOR]'` mengganti nilainya sambil **mempertahankan** field-nya, sehingga kamu tetap tahu bahwa field itu ada saat mendiagnosis.",
      ),
      p(
        'Yang perlu disadari: daftar ini adalah **allow-by-default** — apa pun yang tidak disebut akan tercatat apa adanya. Itu sebabnya peringatan berikut menyebutnya jaring pengaman, bukan solusi. Aturan utamanya tetap mencatat field yang kamu pilih satu per satu, bukan menumpahkan seluruh request body lalu berharap daftar sensor ini lengkap.',
      ),
      callout(
        'danger',
        'Log terpusat memperbesar dampak kebocoran',
        'Ia diakses lebih banyak orang, disimpan bertahun-tahun, dan sering dikirim ke layanan pihak ketiga. Data pribadi yang masuk ke sana menyebar jauh lebih luas daripada yang ada di database. `redact` adalah jaring pengaman — aturan utamanya tetap: jangan pernah mencatat seluruh request body.',
      ),

      h2('Retensi'),
      table(
        ['Jenis', 'Simpan'],
        [
          ['Log aplikasi', '30–90 hari'],
          ['**Log keamanan**', '**1 tahun+**'],
          ['Audit log', 'Sesuai kewajiban'],
          ['Log berisi PII', 'Sesingkat mungkin'],
        ],
      ),
      p(
        'Rata-rata waktu penemuan pembobolan diukur dalam bulan. Retensi tujuh hari berarti saat kamu akhirnya tahu, jejaknya sudah lama hilang.',
      ),

      h2('Pencarian yang sering dipakai'),
      code(
        'text',
        `
        reqId = "a1b2c3d4"                    satu permintaan, seluruh perjalanannya
        level >= 50 AND rute = "/api/ekspor"  semua error di satu endpoint
        userId = "42" AND waktu > -1h         apa yang dilakukan pengguna ini
        peristiwa = "otorisasi_ditolak"       pola serangan
        durasiMs > 5000                       permintaan yang lambat
        `,
      ),
      p(
        'Lima kueri ini adalah alasan seluruh disiplin di sub-bab ini sepadan. Baris pertama memakai `reqId` dari bagian correlation ID — satu nilai, dan seluruh perjalanan permintaan itu muncul lintas layanan. Baris kedua memakai `level >= 50`, yang hanya mungkin karena level dicatat sebagai **angka**; dengan teks bebas, "error" dan "ERROR" sudah menjadi dua hal berbeda.',
      ),
      p(
        'Dua baris terakhir menunjukkan pemakaian yang berbeda sifatnya. `peristiwa = "otorisasi_ditolak"` mencari **pola serangan** — lonjakan penolakan otorisasi dari satu akun berarti seseorang sedang mencoba menyentuh data yang bukan miliknya, dan itu layak diberi alert, bukan sekadar dicari sesekali. `durasiMs > 5000` menemukan permintaan lambat tanpa menunggu ada yang mengeluh.',
      ),
      p(
        'Perhatikan setiap kueri di atas menyaring berdasarkan **field**, bukan mencari teks. Itu yang membedakan log yang bisa dioperasikan dari arsip yang hanya bisa dibaca — dan itu ditentukan sejak baris `log.info` ditulis, bukan saat kamu membutuhkannya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Satu permintaan pengguna melewati beberapa lapisan, dan tanpa penanda yang sama di setiap lapisan, yang tersisa adalah beberapa baris log yang tidak bisa disambungkan.',
      ),
      code(
        'text',
        `
        Tanpa penanda korelasi:

          [gateway] 08:31:02.114  POST /v1/pesanan  201  340ms
          [api]     08:31:02.118  membuat pesanan
          [api]     08:31:02.301  memanggil layanan bayar
          [bayar]   08:31:02.310  memproses
          [bayar]   08:31:02.440  GAGAL: kartu ditolak
          [api]     08:31:02.450  pesanan dibatalkan

        Pada sistem yang melayani 50 permintaan per detik, keenam
        baris itu tersebar di antara ribuan baris lain, dan tidak ada
        cara memastikan bahwa keenamnya milik permintaan yang sama.

        Dengan penanda korelasi, satu penyaringan menyelesaikannya:

          jejak=req_ezj2c4in
        `,
      ),
      code(
        'ts',
        `
        // Penanda dibuat di pintu masuk, atau diterima bila sudah ada.
        app.use((req, res, next) => {
          const jejak = req.headers['x-request-id'] ?? crypto.randomUUID();
          penyimpananKonteks.run({ jejak }, () => {
            res.setHeader('X-Request-Id', String(jejak));   // klien ikut tahu
            next();
          });
        });

        // Diteruskan ke SETIAP panggilan keluar.
        fetch(url, { headers: { 'X-Request-Id': konteks().jejak } });

        // Dan ikut ke setiap baris log, tanpa harus dioper manual.
        log.info({ peristiwa: 'pesanan.dibuat', pesananId: p.id });
        `,
        {
          caption:
            'Menyertakannya di header respons membuat keluhan pengguna bisa langsung dicari: mereka punya nomornya.',
        },
      ),
      p(
        'Bentuk log-nya sendiri menentukan apakah ia bisa dicari, dan selisih antara teks dan JSON bukan soal selera.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0.

        BURUK : {"level":"error","pesan":"Gagal menyimpan"}
        BURUK : {"level":"warn","pesan":"Akses ditolak"}

        BAIK  : {"level":"warn","peristiwa":"otorisasi.ditolak",
                 "aktor":{"id":1,"peran":"user"},
                 "aksi":"faktur.baca",
                 "sasaran":{"jenis":"faktur","id":102},
                 "ip":"203.0.113.7","jejak":"req_ezj2c4in",
                 "waktu":"2026-09-14T08:31:02.114Z"}

        Hanya yang terakhir bisa menjawab pertanyaan yang sebenarnya
        diajukan saat insiden: siapa mencoba apa, terhadap apa, kapan,
        dari mana, dan BERAPA KALI.
        `,
      ),
      p('Log terstruktur juga menutup satu kelas serangan yang tidak terlihat sampai diukur.'),
      code(
        'text',
        `
        Nama yang dikirim pengguna berisi baris baru.

        Log digabung dengan string:
          {"level":"info","nama":"ana"}
          {"level":"info","peristiwa":"otorisasi.diberikan","aktor":{"id":9,"peran":"admin"}"}

        Pembaca log melihat DUA baris, dan yang kedua mengaku
        memberikan hak admin. Baris itu tidak pernah terjadi.

        Log dengan JSON.stringify:
          {"level":"info","nama":"ana\\"}\\n{\\"level\\":\\"info\\"...}

        Baris barunya ikut di-escape menjadi \\n. Tetap SATU baris.
        `,
        { caption: 'Log terstruktur bukan sekadar lebih rapi. Ia menutup penyisipan baris palsu.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Masalah pada logging terpusat jarang berupa error, dan lebih sering berupa log yang ada dan tidak bisa dipakai.',
      ),
      code(
        'text',
        `
        1. Waktu antar layanan tidak sinkron

           [api]   08:31:02.118  memanggil layanan bayar
           [bayar] 08:31:01.940  memproses

           Layanan bayar tampak memproses SEBELUM dipanggil. Jam
           kedua mesin berbeda. Tanpa waktu yang seragam, menyusun
           urutan kejadian lintas layanan mustahil.

           Menutupnya: seluruh mesin memakai UTC dan jam tersinkron,
           dan waktu dicatat dalam format ISO 8601 dengan zona.

        2. Log hilang saat container mati

           Log ditulis ke berkas di dalam container. Container dibuat
           ulang, berkasnya ikut hilang.
           Menutupnya: tulis ke stdout, biarkan platform mengumpulkan.

        3. Log memenuhi disk

           no space left on device

           Dan ketika disk penuh, basis data pun berhenti menulis.
           Satu masalah logging menjadi pemadaman.
           Menutupnya: rotasi, batas retensi, dan alarm pada
           pemakaian disk di atas 85%.

        4. Biaya membengkak tanpa disadari

           Log level debug yang tertinggal aktif di produksi
           menghasilkan ratusan kali lebih banyak baris. Tagihannya
           baru terlihat di akhir bulan.
        `,
      ),
      p(
        'Kelas kedua berupa log yang tidak boleh ada di sana sama sekali, dan sekali terkirim ia sudah keluar dari kendalimu.',
      ),
      code(
        'text',
        `
        Yang tidak boleh masuk log terpusat:

          sandi, token, cookie sesi, kunci API
          nomor kartu, nomor identitas, data kesehatan
          isi pesan pribadi
          seluruh badan permintaan tanpa penyaringan

        Log terpusat biasanya:
          - disimpan berbulan-bulan
          - bisa dibaca lebih banyak orang daripada basis datamu
          - disalin ke layanan pihak ketiga
          - ikut ke cadangan

        Karena itu redaksi dipasang di tempat log DIBUAT, bukan di
        tempat log dibaca.
        `,
      ),
      code(
        'text',
        `
        Dan batas redaksinya, diukur sungguhan:

          masuk  : {"catatan":"sandinya RahasiaSaya123!",
                    "metadata":{"Authorization":"Bearer abc"},
                    "q":"password=xyz"}

          keluar : {"catatan":"sandinya RahasiaSaya123!",
                    "metadata":{"Authorization":"[DIREDAKSI]"},
                    "q":"password=xyz"}

        Kunci berhuruf besar tertangkap karena dicek dalam huruf
        kecil. Rahasia di dalam teks bebas lolos.

        Redaksi mengurangi paparan. Ia tidak menjaminnya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Logging adalah pekerjaan yang terasa selesai begitu barisnya muncul, dan nilainya baru diuji pada hari ada yang perlu dicari.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis log sebagai teks yang digabung',
            'Lebih enak dibaca manusia',
            'Diukur, masukan berisi baris baru menyisipkan baris palsu yang mengaku memberi hak admin',
          ],
          [
            'Mencatat `"Gagal menyimpan"` tanpa konteks',
            'Kejadiannya sudah tercatat',
            'Tidak bisa menjawab siapa, terhadap apa, dan berapa kali. Baris itu tidak bisa dipakai menyelidiki',
          ],
          [
            'Tidak memakai penanda korelasi',
            'Waktunya kan berdekatan',
            'Pada 50 permintaan per detik, kedekatan waktu tidak membuktikan apa pun',
          ],
          [
            'Menulis log ke berkas di dalam container',
            'Biar rapi',
            'Log ikut hilang saat container dibuat ulang. Tulis ke stdout',
          ],
          [
            'Mencatat seluruh badan permintaan',
            'Biar lengkap kalau perlu debug',
            'Diukur, sandi, token, dan nomor kartu ikut ke berkas yang dibaca banyak orang dan disimpan berbulan-bulan',
          ],
          [
            'Membiarkan level `debug` aktif di produksi',
            'Biar informasinya lengkap',
            'Ratusan kali lebih banyak baris. Disk penuh, biaya membengkak, dan yang penting tenggelam',
          ],
        ],
      ),
      p(
        'Cara menguji apakah logging-mu berguna hanya perlu satu latihan. Ambil satu keluhan pengguna yang nyata, misalnya "pesanan saya gagal tadi sore", lalu coba temukan kejadiannya memakai log yang ada sekarang. Bila kamu bisa menemukan permintaan yang tepat, menelusuri seluruh lapisan yang dilaluinya, dan melihat di lapisan mana ia gagal, logging-mu bekerja. Bila tidak, yang perlu diperbaiki bukan alat pengumpulnya melainkan apa yang ditulis di setiap barisnya.',
      ),
      references(
        {
          label: 'Logs — Treat logs as event streams',
          href: 'https://12factor.net/logs',
          source: 'Twelve-Factor App',
          note: 'Kenapa aplikasi sebaiknya tidak mengurus berkas log sendiri',
        },
        {
          label: 'Logs',
          href: 'https://opentelemetry.io/docs/concepts/signals/logs/',
          source: 'OpenTelemetry Docs',
          note: 'Bentuk log terstruktur dan hubungannya dengan sinyal lain',
        },
        {
          label: 'Traces',
          href: 'https://opentelemetry.io/docs/concepts/signals/traces/',
          source: 'OpenTelemetry Docs',
          note: 'Cara satu permintaan dirangkai lintas layanan, pelengkap correlation id',
        },
        {
          label: 'docker logs',
          href: 'https://docs.docker.com/engine/reference/commandline/logs/',
          source: 'Docker Docs',
          note: 'Cara keluaran standar container ditangkap lingkungan yang menjalankannya',
        },
      ),
    ],
  ),

  written(
    'analytics-web-vitals',
    'Analytics & Core Web Vitals di Produksi',
    18,
    'Mengukur pengalaman pengguna sungguhan, bukan skor di laptopmu.',
    [
      terms(
        {
          term: 'Core Web Vitals',
          meaning:
            'Tiga ukuran pengalaman pengguna yang ditetapkan sebagai patokan, yaitu LCP untuk kecepatan tampil, INP untuk ketanggapan, dan CLS untuk kestabilan tata letak. Dipilih karena ketiganya mewakili hal yang benar-benar dirasakan, bukan angka teknis yang tidak terasa.',
        },
        {
          term: 'LCP',
          meaning:
            'Singkatan *Largest Contentful Paint*, waktu sampai elemen isi terbesar tampil. Ambang baiknya di bawah 2,5 detik. Biasanya berupa gambar utama atau blok teks besar, sehingga yang memperbaikinya adalah mempercepat elemen itu, bukan halaman secara umum.',
        },
        {
          term: 'INP',
          meaning:
            'Singkatan *Interaction to Next Paint*, waktu dari pengguna berinteraksi sampai layar benar-benar berubah. Ambang baiknya di bawah 200 milidetik. Menggantikan FID karena mengukur seluruh interaksi, bukan hanya yang pertama.',
        },
        {
          term: 'CLS',
          meaning:
            'Singkatan *Cumulative Layout Shift*, ukuran seberapa banyak isi berpindah sendiri saat halaman dimuat. Ambang baiknya di bawah 0,1. Penyebab terbesarnya gambar dan iklan tanpa ukuran yang dipesan lebih dulu.',
        },
        {
          term: 'field data (RUM)',
          meaning:
            'Ukuran yang dikumpulkan dari pengunjung sungguhan di perangkat dan jaringan mereka. Disebut juga *Real User Monitoring*. Inilah angka yang menentukan, sebab ia mencakup ponsel lambat dan jaringan buruk.',
        },
        {
          term: 'lab data',
          meaning:
            'Ukuran dari pengujian terkendali di satu mesin dengan setelan tetap, misalnya Lighthouse. Berguna untuk membandingkan sebelum dan sesudah perubahan, tetapi tidak mewakili keragaman perangkat pengunjung sungguhan.',
        },
        {
          term: 'p75',
          meaning:
            'Persentil ke-75, yaitu nilai yang lebih baik daripada yang dialami seperempat pengunjung terburuk. Dipakai sebagai patokan Core Web Vitals karena rata-rata terlalu memaafkan ekor yang lambat.',
        },
        {
          term: 'analytics tanpa cookie',
          meaning:
            'Pengukuran kunjungan yang tidak menyimpan penanda tetap di peramban pengunjung, sehingga tidak membutuhkan persetujuan cookie di banyak yurisdiksi. Menukar kemampuan menelusuri satu orang lintas kunjungan dengan kesederhanaan dan privasi.',
        },
      ),

      h2('Lab vs field'),
      table(
        ['', 'Lab (Lighthouse)', 'Field (pengguna sungguhan)'],
        [
          ['Diukur di', 'Mesin terkendali', 'Perangkat pengguna'],
          ['Berguna untuk', 'Membandingkan perubahan', '**Kebenaran**'],
          ['Kelemahan', 'Tidak mencerminkan pengguna nyata', 'Butuh trafik'],
        ],
      ),
      callout(
        'warning',
        'Skor Lighthouse 100 di laptopmu tidak berarti apa-apa bagi pengguna',
        'Laptopmu punya CPU cepat dan koneksi kantor. Pengguna sungguhan memakai ponsel menengah di jaringan seluler. Data lapangan sering menunjukkan angka yang jauh berbeda — dan angka itulah yang menentukan pengalaman sebenarnya.',
      ),

      h2('Tiga metrik inti'),
      table(
        ['Metrik', 'Mengukur', 'Baik'],
        [
          ['**LCP**', 'Kapan konten utama terlihat', '< 2,5 detik'],
          ['**INP**', 'Seberapa cepat merespons interaksi', '< 200 ms'],
          ['**CLS**', 'Seberapa banyak tata letak melompat', '< 0,1'],
        ],
      ),

      h2('Mengumpulkan dari pengguna sungguhan'),
      code(
        'tsx',
        `
        'use client';
        import { useReportWebVitals } from 'next/web-vitals';

        export function LaporWebVitals() {
          useReportWebVitals((metrik) => {
            navigator.sendBeacon?.('/api/vitals', JSON.stringify({
              nama: metrik.name,
              nilai: metrik.value,
              rating: metrik.rating,
              rute: window.location.pathname,
            }));
          });

          return null;
        }
        `,
      ),
      p(
        "Komponen ini mengembalikan `null` — ia tidak menggambar apa pun. Keberadaannya semata untuk memasang hook `useReportWebVitals`, yang dipanggil browser setiap kali sebuah metrik selesai diukur. Karena itu ia butuh `'use client'`: pengukuran hanya bisa terjadi di perangkat pengguna, bukan di server.",
      ),
      p(
        'Empat field yang dikirim dipilih dengan hemat. `nama` dan `nilai` adalah datanya, `rating` adalah penilaian bawaan Chrome berupa `good`, `needs-improvement`, atau `poor` sehingga kamu tidak perlu menghafal ambangnya, sedangkan `rute` yang membuat data ini bisa ditindaklanjuti. Tanpa tahu halaman mana yang lambat, angka LCP rata-rata situs tidak memberi tahu apa yang harus diperbaiki.',
      ),
      p(
        'Tanda tanya di `navigator.sendBeacon?.` menangani browser yang tidak mendukungnya: pemanggilannya dilewati alih-alih melempar error. Peringatan berikut menjelaskan kenapa `sendBeacon` yang dipakai dan bukan `fetch` — metrik seperti INP dan CLS baru final saat halaman ditinggalkan, tepat ketika browser boleh membatalkan permintaan biasa yang belum selesai.',
      ),
      callout(
        'tip',
        'Pakai `sendBeacon`, bukan `fetch`',
        'Metrik sering dikirim saat halaman sedang ditutup, dan browser boleh membatalkan `fetch` yang belum selesai pada saat itu. `sendBeacon` dijamin terkirim — ia dirancang persis untuk kasus ini.',
      ),

      h2('Lihat distribusinya, bukan rata-ratanya'),
      code(
        'text',
        `
        Rata-rata LCP: 1,8 detik      -> terlihat baik

        p50: 1,2 detik
        p75: 2,1 detik
        p95: 6,4 detik                -> 5% pengguna menunggu 6 detik
        p99: 14 detik                 -> dan sebagian menunggu 14
        `,
      ),
      p(
        'Google memakai **p75** untuk menilai — artinya seperempat penggunamu yang paling lambat ikut menentukan. Rata-rata menyembunyikan justru kelompok yang paling perlu diperbaiki.',
      ),

      h2('Penyebab yang paling sering'),
      table(
        ['Metrik', 'Penyebab umum', 'Perbaikan'],
        [
          ['LCP buruk', 'Gambar besar tanpa optimasi', '`next/image`, `priority` pada elemen LCP'],
          ['LCP buruk', 'Font memblokir render', '`next/font` dengan `display: swap`'],
          ['INP buruk', 'JavaScript berat di thread utama', 'Kurangi bundle, `useDeferredValue`'],
          ['**CLS buruk**', '**Gambar tanpa dimensi**', 'Selalu set `width`/`height`'],
          ['CLS buruk', 'Konten yang disisipkan di atas', 'Pesan ruangnya lebih dulu'],
        ],
      ),
      callout(
        'danger',
        'Gambar tanpa `width`/`height` adalah penyebab CLS nomor satu',
        'Browser tidak tahu berapa ruang yang harus disiapkan, jadi teks di bawahnya melompat begitu gambarnya dimuat. Ini juga alasan skeleton harus setinggi isi aslinya — fallback kecil yang digantikan konten besar punya efek yang sama.',
      ),

      h2('Analytics yang menghormati privasi'),
      code(
        'ts',
        `
        // Yang benar-benar berguna, tanpa melacak individu
        {
          rute: '/kelas/frontend-basic',
          referer: 'google.com',
          negara: 'ID',
          jenisPerangkat: 'mobile',
          // TIDAK: alamat IP, id pengguna, sidik jari perangkat
        }
        `,
      ),
      p(
        'Empat field yang dikumpulkan cukup untuk menjawab hampir semua pertanyaan yang benar-benar kamu ajukan. `rute` memberi tahu halaman mana yang populer, `referer` menunjukkan dari mana orang datang, sedangkan `negara` dan `jenisPerangkat` menjawab untuk siapa kamu sebaiknya mengoptimalkan. Perhatikan `negara`, bukan kota maupun koordinat, sudah cukup untuk keputusan seperti "perlukah CDN di Asia Tenggara".',
      ),
      p(
        'Tiga hal di baris komentar terakhir adalah yang mengubah analitik menjadi pelacakan individu. Alamat IP adalah data pribadi di banyak yurisdiksi, ID pengguna menghubungkan setiap kunjungan ke orang tertentu, sedangkan sidik jari perangkat mengikuti orang yang sama meski ia menghapus cookie. Ketiganya jarang menjawab pertanyaan yang tidak bisa dijawab data agregat, dan data yang tidak kamu kumpulkan tidak bisa bocor, tidak perlu dijaga, dan tidak menuntut banner persetujuan.',
      ),
      callout(
        'tip',
        'Kumpulkan yang menjawab pertanyaan, bukan semua yang bisa dikumpulkan',
        'Analytics yang menghormati privasi seperti Plausible atau Umami memberi hampir semua yang benar-benar dipakai seperti halaman populer, sumber trafik, dan tingkat pentalan, tanpa cookie dan tanpa melacak individu. Data yang tidak kamu kumpulkan tidak bisa bocor, dan tidak menuntut banner persetujuan.',
      ),

      h2('Anggaran performa'),
      code(
        'yaml',
        `
        - name: Lighthouse CI
          uses: treosh/lighthouse-ci-action@v11
          with:
            urls: https://app.contoh.com
            budgetPath: ./budget.json
        `,
      ),
      code(
        'json',
        `
        [{
          "path": "/*",
          "resourceSizes": [
            { "resourceType": "script", "budget": 150 },
            { "resourceType": "total", "budget": 500 }
          ]
        }]
        `,
      ),
      p(
        'Anggaran yang menggagalkan CI mengubah performa dari sesuatu yang diperiksa sesekali menjadi sesuatu yang tidak bisa memburuk tanpa disadari.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Core Web Vitals mengukur apa yang dirasakan pengguna, bukan apa yang terjadi di server. Selisih itu penting, sebab server yang cepat tetap bisa menghasilkan halaman yang terasa lambat.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di Chrome 149 terhadap build produksi
        project ini, dilayani dari mesin lokal:

          Beranda
            TTFB 12 ms   FCP 244 ms   LCP 332 ms   CLS 0
            86 sumber, 577,6 KB

          Halaman pelajaran terbesar (487,8 KB HTML)
            TTFB 13 ms   FCP 232 ms   LCP 232 ms   CLS 0
            67 sumber, 545,6 KB
            unduh HTML 6 ms, 56,1 KB DI KABEL

          Roadmap
            TTFB  6 ms   FCP 144 ms   LCP 144 ms   CLS 0

        Ambang "baik": LCP < 2.500 ms, CLS < 0,1, INP < 200 ms.
        `,
        {
          caption:
            'TTFB di sini mencerminkan jaringan lokal tanpa latensi. Di internet sungguhan, jarak ke server ikut menentukan.',
        },
      ),
      p(
        'Baris 487,8 KB menjadi 56,1 KB itu layak diperhatikan tersendiri. Kompresinya 8,7 kali, dan itulah sebabnya ukuran HTML jarang menjadi masalah sementara ukuran JavaScript hampir selalu menjadi masalah.',
      ),
      table(
        ['Metrik', 'Mengukur apa', 'Penyebab paling sering bila buruk'],
        [
          [
            'LCP',
            'Kapan isi terbesar terlihat',
            'Gambar hero besar, font yang memblokir, data diambil di klien',
          ],
          [
            'INP',
            'Seberapa cepat halaman menanggapi interaksi',
            'JavaScript yang memblokir utas utama',
          ],
          [
            'CLS',
            'Seberapa banyak tata letak bergeser',
            'Media tanpa ukuran, iklan, banner yang muncul belakangan',
          ],
          ['TTFB', 'Kapan byte pertama tiba', 'Server lambat, jarak ke server, tidak ada cache'],
          ['FCP', 'Kapan sesuatu pertama terlihat', 'CSS dan font yang memblokir render'],
        ],
      ),
      p(
        'Baris CLS punya penyebab yang paling mudah dibuktikan, dan selisihnya bisa diukur dengan satu perubahan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di Chrome 149. Gambar yang sama, waktu tiba
        yang sama (sengaja dilambatkan 1,2 detik):

          img TANPA width/height    CLS = 0,0302   LCP = 76 ms
          img DENGAN width/height   CLS = 0        LCP = 76 ms

        Yang berbeda hanya apakah peramban tahu berapa ruang yang
        harus disediakan sebelum gambarnya tiba.
        `,
        { caption: 'Satu atribut, dan seluruh pergeseran tata letaknya hilang.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Yang paling sering keliru pada pengukuran performa bukan angkanya melainkan cara mengambilnya.',
      ),
      code(
        'text',
        `
        1. Mengukur di laptop pengembang

           Mesin cepat, jaringan cepat, cache sudah panas. Angkanya
           selalu bagus, dan tidak mewakili siapa pun.

           Yang mewakili: data lapangan dari pengguna sungguhan,
           dikumpulkan dengan library web-vitals dan dikirim ke
           endpoint milikmu.

        2. Melihat rata-rata

           Rata-rata LCP 1,2 detik bisa berarti 90% pengguna di
           0,8 detik dan 10% di 5 detik. Yang 10% itu yang pergi.
           Pakai persentil 75 atau 95, bukan rata-rata.

        3. Mengukur sekali lalu menyimpulkan

           Panggilan pertama ke fungsi tanpa keadaan jauh lebih
           lambat karena cold start. Ukur beberapa kali, dan pisahkan
           yang pertama.

        4. Membandingkan angka yang tidak sebanding

           Halaman yang di-cache CDN melawan halaman dinamis,
           atau sesi dengan cache panas melawan kunjungan pertama.
        `,
      ),
      p(
        'Pada sisi implementasinya, ada beberapa pola yang secara khusus merusak masing-masing metrik.',
      ),
      code(
        'ts',
        `
        // MERUSAK LCP: data diambil setelah halaman dirender.
        'use client';
        useEffect(() => { ambilArtikel().then(setArtikel); }, []);
        // Peramban baru bisa menampilkan isinya setelah: unduh HTML,
        // unduh JS, jalankan JS, panggil API, tunggu jawaban, render.
        // Diukur pada project ini: 506 halaman dirender SAAT BUILD,
        // sehingga isinya sudah ada di HTML sejak byte pertama.

        // MERUSAK CLS: ukuran tidak diketahui sampai isinya tiba.
        <img src={url} />                              // buruk
        <img src={url} width={600} height={300} />     // baik
        <div style={{ aspectRatio: '16/9' }}>...</div> // baik

        // MERUSAK INP: pekerjaan berat di utas utama saat interaksi.
        onChange={(e) => {
          const hasil = saring(daftar100Ribu, e.target.value);  // memblokir
          setHasil(hasil);
        }}
        // Perbaikannya: tunda, batasi jumlah, atau pindahkan ke
        // Web Worker.
        `,
      ),
      code(
        'text',
        `
        FONT adalah penyebab LCP dan CLS sekaligus, dan pola yang
        menutupnya sudah baku:

          font-display: swap     tampilkan font cadangan dulu,
                                 tukar ketika font utama tiba
          preload untuk font yang dipakai di bagian atas halaman
          samakan metrik font cadangan dengan font utama, supaya
          pertukarannya tidak menggeser tata letak

        Tanpa swap, teks tidak terlihat sama sekali sampai fontnya
        tiba, dan LCP ikut menunggu.
        `,
      ),
      p(
        'Satu hal terakhir menyangkut analitik itu sendiri, dan sering luput karena ia dipasang untuk mengukur, bukan untuk memperlambat.',
      ),
      code(
        'text',
        `
        Skrip analitik pihak ketiga:
          - menambah permintaan jaringan
          - menjalankan JavaScript di utas utama
          - kadang memblokir render bila dimuat di bagian kepala
            tanpa atribut async atau defer

        Dan dari sisi keamanan, ia berjalan di origin halamanmu
        dengan akses penuh ke DOM. Bila CDN-nya dibajak, skrip apa
        pun berjalan di halamanmu.

        Menutupnya: atribut integrity pada skrip pihak ketiga, dan
        connect-src pada CSP yang membatasi ke mana data boleh dikirim.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Performa mudah diukur dengan cara yang menghasilkan angka bagus dan tidak berarti apa-apa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengukur di laptop sendiri dengan jaringan cepat',
            'Ini kan pengukuran nyata',
            'Angkanya selalu bagus dan tidak mewakili pengguna mana pun. Kumpulkan data lapangan',
          ],
          [
            'Melihat rata-rata',
            'Itu angka ringkasannya',
            'Rata-rata menyembunyikan ekor yang buruk. Pakai persentil 75 atau 95',
          ],
          [
            'Mengambil data di `useEffect` untuk halaman publik',
            'Itu cara yang biasa di React',
            'LCP menunggu seluruh rantai unduh, jalankan, panggil, render. Render di server',
          ],
          [
            'Tidak memberi `width` dan `height` pada gambar',
            'Kan sudah diatur CSS',
            'Diukur, CLS 0,0302 melawan 0. Peramban tidak tahu ruangnya sebelum gambarnya tiba',
          ],
          [
            'Memuat font tanpa `font-display`',
            'Biar fontnya yang benar yang tampil',
            'Teks tidak terlihat sampai fontnya tiba, dan LCP ikut menunggu',
          ],
          [
            'Memasang skrip analitik di kepala tanpa `async`',
            'Biar terpasang sedini mungkin',
            'Ia memblokir render. Dan tanpa `integrity`, CDN yang dibajak menjalankan kode apa pun di halamanmu',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan apa yang diukur dan apa yang tidak. Angka LCP, CLS, FCP, dan TTFB di atas **dijalankan sungguhan** di Chrome 149 terhadap build produksi project ini, dan dilayani dari mesin lokal sehingga TTFB-nya tidak mewakili internet. Selisih CLS antara gambar dengan dan tanpa ukuran juga diukur sungguhan. Yang **tidak dijalankan** adalah pengumpulan data lapangan dari pengguna nyata, sebab itu menuntut aplikasi yang benar-benar dipakai orang.',
      ),
      references(
        {
          label: 'Web Vitals',
          href: 'https://web.dev/articles/vitals',
          source: 'web.dev',
          note: 'Definisi resmi ketiga ukuran beserta ambangnya',
        },
        {
          label: 'Largest Contentful Paint (LCP)',
          href: 'https://web.dev/articles/lcp',
          source: 'web.dev',
          note: 'Elemen apa yang dihitung dan cara menemukannya di halamanmu',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Cara skornya dihitung, yang menjelaskan kenapa memesan ruang menolong',
        },
        {
          label: 'Lighthouse overview',
          href: 'https://developer.chrome.com/docs/lighthouse/overview',
          source: 'Chrome for Developers',
          note: 'Alat pengukuran terkendali beserta batas keterwakilannya',
        },
        {
          label: 'Speed Insights',
          href: 'https://vercel.com/docs/speed-insights',
          source: 'Vercel Docs',
          note: 'Contoh pengumpulan ukuran dari pengunjung sungguhan',
        },
      ),
    ],
  ),

  written(
    'backup-restore',
    'Backup & Restore Database',
    18,
    'Cadangan yang tidak pernah diuji bukan cadangan — ia asumsi.',
    [
      p(
        'Ini sub-bab yang paling mudah ditunda dan paling mahal kalau ditunda. Server yang mati bisa dinyalakan lagi; data yang hilang tidak bisa dikembalikan.',
      ),

      terms(
        {
          term: 'backup',
          meaning:
            'Salinan data yang disimpan terpisah supaya bisa dikembalikan bila yang asli rusak atau terhapus. Nilainya nol sampai pemulihannya pernah benar-benar diuji, sebab cadangan yang tidak pernah dicoba dipulihkan belum terbukti bisa dipulihkan.',
        },
        {
          term: 'restore',
          meaning:
            'Proses mengembalikan data dari cadangan. Ia yang sebenarnya kamu beli saat membuat cadangan, dan lamanya proses ini yang menentukan berapa lama layanan mati saat bencana terjadi.',
        },
        {
          term: 'RPO',
          meaning:
            'Singkatan *Recovery Point Objective*, berapa banyak data yang boleh hilang, diukur dalam satuan waktu. Cadangan harian berarti RPO sampai 24 jam, yaitu perubahan sejak cadangan terakhir hilang.',
        },
        {
          term: 'RTO',
          meaning:
            'Singkatan *Recovery Time Objective*, berapa lama layanan boleh mati sebelum pulih. Dua angka ini yang menentukan bentuk strategi cadanganmu, dan menetapkannya lebih dulu jauh lebih murah daripada menemukannya saat sedang terjadi.',
        },
        {
          term: 'full, incremental, differential',
          meaning:
            'Tiga jenis cadangan. *Full* menyalin semuanya. *Incremental* hanya menyalin perubahan sejak cadangan apa pun yang terakhir, hemat tetapi pemulihannya membutuhkan seluruh rantai. *Differential* menyalin perubahan sejak full terakhir, lebih besar tetapi pemulihannya cukup dua berkas.',
        },
        {
          term: 'point-in-time recovery (PITR)',
          meaning:
            'Kemampuan memulihkan basis data ke satu detik tertentu, bukan hanya ke titik cadangan. Bekerja dengan menyimpan cadangan dasar ditambah catatan seluruh perubahan sesudahnya. Inilah yang menyelamatkan dari perintah hapus yang salah, sebab kamu bisa berhenti tepat sebelum perintah itu.',
        },
        {
          term: 'aturan 3-2-1',
          meaning:
            'Panduan sederhana yaitu tiga salinan data, di dua jenis media berbeda, dengan satu salinan di lokasi terpisah. Yang dijaga bukan kerusakan disk melainkan kejadian yang menghapus semuanya sekaligus, termasuk kesalahan manusia dan ransomware.',
        },
        {
          term: 'uji pemulihan',
          meaning:
            'Latihan mengembalikan cadangan ke lingkungan terpisah lalu memeriksa datanya benar. Dijadwalkan berkala, sebab cadangan bisa diam-diam berhenti berjalan atau menghasilkan berkas rusak tanpa ada yang menyadarinya sampai dibutuhkan.',
        },
      ),

      h2('Aturan 3-2-1'),
      code(
        'text',
        `
        3 salinan data
        2 media penyimpanan berbeda
        1 salinan di lokasi terpisah
        `,
      ),
      p(
        'Tiga angka itu masing-masing menutup jenis kegagalan yang berbeda, dan itulah kenapa ketiganya diperlukan sekaligus. **3 salinan** melindungi dari kerusakan berkas — satu dump yang ternyata korup tidak membuatmu kehilangan segalanya. **2 media berbeda** melindungi dari kegagalan sistemik: disk yang sama, dibeli bersamaan, cenderung rusak dalam rentang waktu yang berdekatan.',
      ),
      p(
        '**1 salinan di lokasi terpisah** yang paling sering diabaikan, dan yang paling menentukan pada skenario terburuk. Ia menjawab kejadian yang mengenai seluruh lokasi sekaligus: server terhapus, akun cloud dibekukan, atau ransomware yang mengenkripsi setiap berkas yang bisa dijangkau mesin itu. Perhatikan bahwa data asli ikut dihitung sebagai salah satu dari tiga salinan — jadi aturan ini menuntut dua cadangan, bukan tiga.',
      ),
      callout(
        'danger',
        'Cadangan di server yang sama bukan cadangan',
        'Ia tidak menolong saat disk rusak, saat server terhapus, atau saat ransomware mengenkripsi seluruh mesin. Setidaknya satu salinan harus berada di tempat yang tidak bisa disentuh oleh apa pun yang mengenai server utama.',
      ),

      h2('Jenis cadangan'),
      table(
        ['Jenis', 'Isinya', 'Pemulihan'],
        [
          ['Logical (`pg_dump`)', 'Perintah SQL', 'Lambat, portabel antar versi'],
          ['Physical (snapshot)', 'Berkas data', 'Cepat, terikat versi'],
          ['**PITR**', 'Base + WAL', 'Ke titik waktu mana pun'],
        ],
      ),
      callout(
        'tip',
        'PITR adalah yang benar-benar menolong pada kesalahan manusia',
        'Snapshot harian tidak menolong saat seseorang menjalankan `DELETE` tanpa `WHERE` pada pukul 14:30 — kamu kehilangan setengah hari. Point-in-time recovery bisa memulihkan ke 14:29. Sebagian besar database terkelola menyediakannya.',
      ),

      h2('Cadangan otomatis'),
      code(
        'bash',
        `
        #!/usr/bin/env bash
        set -euo pipefail

        TANGGAL=$(date +%F-%H%M)
        BERKAS="/tmp/cadangan-$TANGGAL.sql.gz"

        pg_dump "$DATABASE_URL" --no-owner --no-acl | gzip > "$BERKAS"

        # Verifikasi tidak kosong SEBELUM diunggah
        UKURAN=$(stat -c%s "$BERKAS")
        if [ "$UKURAN" -lt 1024 ]; then
          echo "Cadangan terlalu kecil ($UKURAN byte) — kemungkinan gagal"
          exit 1
        fi

        # Enkripsi sebelum keluar dari server
        gpg --encrypt --recipient cadangan@contoh.com "$BERKAS"

        aws s3 cp "$BERKAS.gpg" "s3://cadangan/db/$TANGGAL.sql.gz.gpg"

        rm -f "$BERKAS" "$BERKAS.gpg"

        # Ping heartbeat — kalau ping berhenti datang, kamu diberi tahu
        curl -fsS "$HEARTBEAT_URL" > /dev/null
        `,
        { filename: 'cadangan.sh' },
      ),
      p(
        'Flag `--no-owner --no-acl` pada `pg_dump` menghilangkan kepemilikan dan hak akses dari berkas dump. Itu penting saat memulihkan: tanpanya, pemulihan ke server lain gagal karena nama pengguna database di sana berbeda — dan kegagalan itu baru kamu temukan tepat ketika sedang membutuhkannya.',
      ),
      p(
        'Blok pemeriksaan `UKURAN` adalah pengaman terhadap kegagalan paling berbahaya: cadangan yang "berhasil" tetapi kosong. `pg_dump` yang gagal karena kredensial salah tetap menghasilkan berkas — berisi pesan error beberapa ratus byte. Ambang 1024 byte menangkapnya, dan `exit 1` menghentikan skrip sebelum berkas kosong itu menimpa cadangan yang baik di penyimpanan.',
      ),
      p(
        'Urutan tiga langkah berikutnya juga disengaja: `gpg --encrypt` dijalankan **sebelum** `aws s3 cp`, sehingga yang meninggalkan server sudah dalam keadaan terenkripsi. Kalau bucket-nya kelak salah konfigurasi, yang terekspos adalah berkas yang tidak bisa dibaca. `rm -f` di bawahnya membersihkan kedua berkas sementara dari `/tmp` — salinan lengkap database yang tertinggal di disk server adalah kebocoran yang menunggu terjadi.',
      ),
      p(
        'Baris terakhir memakai pola yang berbeda dari semua pemantauan lain di sub-bab ini: yang dipantau adalah **ketiadaan** sinyal. Skrip yang selesai dengan sukses mengirim ping; kalau ping berhenti datang, layanan pemantau yang memberi tahu. Karena `set -euo pipefail` di baris kedua menghentikan skrip pada kegagalan mana pun, baris ini hanya tercapai kalau seluruh proses benar-benar berhasil.',
      ),
      callout(
        'danger',
        'Cadangan berisi seluruh data penggunamu — enkripsi sebelum ia keluar dari server',
        'Berkas dump yang tersimpan di bucket adalah salinan lengkap database, dalam bentuk yang bisa dibaca langsung. Kalau bucket-nya salah konfigurasi, seluruh data pengguna terekspos sekaligus — tanpa perlu menembus aplikasimu sama sekali.',
      ),

      h2('Uji pemulihannya'),
      code(
        'bash',
        `
        # INI bagian yang paling sering dilewati, dan yang paling menentukan.
        createdb uji_pulih

        aws s3 cp s3://cadangan/db/2026-08-02-0300.sql.gz.gpg - \\
          | gpg --decrypt | gunzip | psql uji_pulih

        # Verifikasi datanya benar-benar ada dan masuk akal
        psql uji_pulih -c "SELECT count(*) FROM pengguna;"
        psql uji_pulih -c "SELECT max(dibuat_pada) FROM artikel;"

        dropdb uji_pulih
        `,
      ),
      p(
        'Rantai pipa di baris kedua membalik persis urutan skrip cadangan tadi: `aws s3 cp … -` mengalirkan berkas ke keluaran standar (tanda `-` di ujung), lalu `gpg --decrypt | gunzip | psql` mendekripsi, membuka kompresi, dan memulihkannya. Karena semuanya lewat pipa, tidak ada salinan dump yang tertinggal di disk mesin tempat kamu mengujinya.',
      ),
      p(
        'Dua kueri verifikasi menanyakan hal yang berbeda dan keduanya perlu. `count(*) FROM pengguna` menjawab "apakah datanya lengkap" — bandingkan dengan jumlah di produksi. `max(dibuat_pada) FROM artikel` menjawab "apakah datanya **baru**": nilai yang tertinggal tiga minggu berarti cadangan otomatismu sebenarnya sudah lama berhenti berjalan, kegagalan yang tidak terlihat dari jumlah baris saja.',
      ),
      p(
        'Perhatikan seluruh pengujian dilakukan di database `uji_pulih` yang dibuat khusus lalu dihapus dengan `dropdb`. Memulihkan cadangan ke database yang sedang dipakai adalah cara mengubah latihan menjadi insiden — dan `dropdb` di akhir menjaga agar salinan data produksi tidak tertinggal di mesin pengujian.',
      ),
      callout(
        'danger',
        'Cadangan yang tidak pernah dipulihkan hanyalah berkas',
        'Ia bisa kosong, terpotong, memakai versi yang tidak kompatibel, atau tidak memuat tabel yang ditambahkan bulan lalu — dan semuanya baru ketahuan pada hari kamu benar-benar membutuhkannya. Jadwalkan uji pemulihan **bulanan**, dan catat berapa lama prosesnya.',
      ),

      h2('RPO dan RTO'),
      code(
        'text',
        `
        RPO (Recovery Point Objective)
          Berapa banyak data yang boleh hilang?
          Cadangan harian    -> sampai 24 jam data hilang
          PITR               -> hitungan detik

        RTO (Recovery Time Objective)
          Berapa lama boleh mati?
          Ini yang menentukan apakah kamu butuh replika siaga.
        `,
      ),
      p(
        'Tentukan keduanya **sebelum** ada insiden. Keduanya menentukan berapa yang layak kamu belanjakan — dan tanpa angkanya, keputusan itu diimprovisasi saat panik.',
      ),

      h2('Yang juga perlu dicadangkan'),
      ol(
        'Database — yang paling jelas.',
        '**Berkas unggahan pengguna** — sering terlupa karena ada di storage terpisah.',
        'Rahasia dan kunci enkripsi — `APP_KEY` yang hilang berarti data terenkripsi tidak bisa dibaca lagi.',
        'Konfigurasi infrastruktur — idealnya sudah ada sebagai kode di repositori.',
      ),
      callout(
        'danger',
        'Kunci enkripsi harus dicadangkan **terpisah** dari data',
        'Menyimpan `APP_KEY` di dalam dump database yang terenkripsi dengan kunci itu adalah lingkaran yang tidak bisa dibuka. Simpan kunci di secrets manager, dengan cadangannya sendiri.',
      ),

      h2('Pantau cadangannya'),
      code(
        'bash',
        `
        # Pemantauan berbasis heartbeat: yang dipantau adalah
        # KETIADAAN sinyal. Kalau ping tidak datang dalam 25 jam,
        # layanan pemantau yang memberi tahu kamu.
        curl -fsS "https://heartbeat.contoh.com/cadangan-harian"
        `,
      ),
      p(
        'Angka **25 jam** di komentar adalah pilihan yang disengaja: satu jam lebih longgar dari jadwal harian. Toleransi itu mencegah alert palsu saat cadangan tertunda sebentar karena beban server, tetapi tetap cukup ketat untuk memberi tahu kamu sebelum kehilangan dua siklus cadangan berturut-turut.',
      ),
      p(
        'Yang membedakan pola ini dari pemantauan lain adalah ia mendeteksi kegagalan yang **tidak menghasilkan apa-apa**. Cron yang mati, kredensial yang kedaluwarsa, atau disk yang penuh membuat skrip berhenti berjalan sama sekali, sehingga tidak ada error yang tercatat karena tidak ada yang berjalan untuk mencatatnya. Pemantauan biasa menunggu sinyal buruk, sedangkan heartbeat menunggu sinyal baik, lalu berbunyi saat sinyal itu tidak datang.',
      ),
      callout(
        'warning',
        'Cadangan yang berhenti berjalan tidak menimbulkan error apa pun',
        'Cron mati, kredensial kedaluwarsa, atau disk penuh — dan cadangan berhenti diam-diam. Tidak ada yang tahu sampai seseorang membutuhkannya. Pemantauan heartbeat adalah satu-satunya cara mendeteksi sesuatu yang gagal dengan cara **tidak terjadi**.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Cadangan adalah satu-satunya pekerjaan operasional yang nilainya nol sampai satu hari nilainya menjadi segalanya. Dan yang menentukan bukan keberadaan berkasnya melainkan apakah ia pernah dipulihkan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan PostgreSQL 16.15, 5.000 pelanggan
        dan 50.000 pesanan:

          pg_dump -F p (SQL teks)              2,6 MB    57 ms
          pg_dump -F c (custom, terkompresi)   552 KB    84 ms
          pg_dump -F d (direktori, -j 2)       560 KB    87 ms

        Format custom hampir lima kali lebih kecil, dan ia
        satu-satunya yang bisa dipulihkan SEBAGIAN: satu tabel saja,
        atau tanpa indeks, atau dengan urutan yang diatur.
        `,
        { caption: 'Format teks hanya bisa dijalankan utuh dari awal sampai akhir.' },
      ),
      p(
        'Yang jauh lebih penting daripada waktu pencadangannya adalah waktu pemulihannya, sebab itulah lama pemadaman yang akan kamu alami.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, skenario lengkap:

          1. DELETE FROM pesanan          -> pesanan sekarang = 0
          2. pg_restore --data-only       -> 286 ms
             pesanan sesudah restore      -> 50000

          Dan pemulihan penuh ke basis data BARU:
             pg_restore                   -> 123 ms
             pelanggan=5000  pesanan=50000
        `,
      ),
      p(
        'Yang paling sering tidak diperiksa bukan datanya melainkan aturan yang menjaganya, dan itu bisa diuji.',
      ),
      code(
        'text',
        `
        Diuji pada basis data hasil pemulihan:

          INSERT INTO pesanan (pelanggan_id, total) VALUES (1, -500);
            ERROR: violates check constraint "pesanan_total_check"

          INSERT INTO pesanan (pelanggan_id, total) VALUES (999999, 100);
            ERROR: violates foreign key constraint
                   "pesanan_pelanggan_id_fkey"

          SELECT last_value FROM pesanan_id_seq;   -> 50002

        Ketiganya pulih dengan benar. Itu bukan sesuatu yang boleh
        diasumsikan: pemulihan yang kehilangan constraint akan
        menerima data rusak tanpa satu pun keluhan, dan sequence yang
        tidak ikut pulih membuat setiap INSERT berikutnya bentrok.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu jebakan pemulihan yang perilakunya berbeda tergantung bentuk tabelnya, dan selisihnya diukur.',
      ),
      code(
        'text',
        `
        pg_restore --data-only dijalankan ke tabel yang MASIH BERISI:

        TABEL DENGAN PRIMARY KEY:
          pg_restore: error: COPY failed for table "pesanan":
          ERROR: duplicate key value violates unique constraint
                 "pesanan_pkey"
          DETAIL: Key (id)=(1) already exists.
          pg_restore: warning: errors ignored on restore: 1

          jumlah baris sesudahnya: 50000    <- TIDAK berlipat

        TABEL TANPA PRIMARY KEY:
          sebelum = 1000
          sesudah = 2000                    <- BERLIPAT, TANPA satu
                                               pun pesan error

        Yang menyelamatkan pada kasus pertama bukan pg_restore,
        melainkan constraint-nya. Pada tabel tanpa kunci, tidak ada
        yang menghentikannya.
        `,
        {
          caption:
            'Perhatikan juga baris "errors ignored on restore": pg_restore melanjutkan meski ada yang gagal.',
        },
      ),
      p(
        'Baris terakhir itu penting. `pg_restore` secara bawaan **melanjutkan** meski sebagian gagal, sehingga pemulihan yang "selesai" bisa saja tidak lengkap.',
      ),
      code(
        'text',
        `
          pg_restore --exit-on-error   berhenti pada kegagalan pertama
          pg_restore --single-transaction  semua atau tidak sama sekali

        Untuk pemulihan darurat, keduanya jauh lebih aman daripada
        bawaan, sebab pemulihan setengah jadi yang dikira lengkap
        adalah keadaan yang paling sulit diperbaiki.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN LAIN yang khas:

          pg_dump: error: server version: 17.2; pg_dump version: 16.15
          pg_dump: error: aborting because of server version mismatch

            -> pg_dump harus SAMA ATAU LEBIH BARU daripada servernya.
               Ini pemeriksaan yang bekerja, bukan gangguan.

          pg_restore: error: could not execute query: ERROR: role "app"
          does not exist

            -> kepemilikan objek merujuk peran yang tidak ada di
               server tujuan. Pakai --no-owner --no-privileges saat
               memulihkan ke tempat lain.

          out of memory

            -> memulihkan dengan -j terlalu besar pada mesin kecil.
               Kurangi jumlah job paralelnya.
        `,
      ),
      p(
        'Dan kelas kegagalan yang paling mahal tidak menghasilkan pesan apa pun, yaitu cadangan yang ternyata tidak ada isinya.',
      ),
      code(
        'text',
        `
        Cara sebuah cadangan menjadi tidak berguna tanpa diketahui:

          - skrip cron gagal berminggu-minggu; tidak ada yang memantau
            APAKAH ia berhasil, hanya memantau bahwa ia dijadwalkan
          - disk cadangan penuh; berkas terakhir terpotong di tengah
          - kredensial cadangan dirotasi; skripnya tidak diperbarui
          - cadangan disimpan di server yang SAMA dengan basis datanya
          - ukurannya mengecil drastis, dan tidak ada yang memeriksanya

        Yang menutup semuanya satu hal: pantau HASIL, bukan proses.
          - ukuran berkas cadangan terakhir, dan bandingkan dengan
            yang sebelumnya
          - umur berkas cadangan terakhir
          - dan yang paling menentukan: pemulihan otomatis berkala
            ke basis data uji, lalu hitung jumlah barisnya
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Cadangan adalah pekerjaan yang paling mudah dianggap selesai, sebab tidak ada yang memberi tahu bila ia gagal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan cadangan tanpa pernah memulihkannya',
            'Berkasnya ada dan ukurannya wajar',
            'Diuji, pemulihan penuh selesai 123 ms. Cadangan yang belum pernah dicoba bukan cadangan',
          ],
          [
            'Memulihkan `--data-only` ke tabel yang masih berisi',
            'Datanya kan ditimpa',
            'Diuji, tabel tanpa primary key berlipat dari 1.000 menjadi 2.000 tanpa satu pun error',
          ],
          [
            'Menganggap `pg_restore` yang selesai berarti lengkap',
            'Tidak ada error di layar',
            'Diuji, ia melanjutkan meski gagal, dan hanya mencatat "errors ignored on restore"',
          ],
          [
            'Menyimpan cadangan di server yang sama',
            'Praktis dan cepat',
            'Kegagalan disk menghapus keduanya sekaligus. Simpan di tempat yang terpisah',
          ],
          [
            'Memantau bahwa job cadangan terjadwal',
            'Jadwalnya kan sudah dipasang',
            'Job yang berjalan dan gagal tetap terlihat terjadwal. Pantau ukuran dan umur berkas hasilnya',
          ],
          [
            'Tidak memeriksa constraint sesudah pemulihan',
            'Datanya kan sudah masuk',
            'Diuji, `CHECK`, foreign key, dan sequence memang pulih. Itu harus dibuktikan, bukan diasumsikan',
          ],
        ],
      ),
      p(
        'Dua angka yang pantas ditulis di dokumen operasional dan diuji sekali setiap beberapa bulan adalah berapa banyak data yang boleh hilang dan berapa lama boleh mati. Angka pertama menentukan seberapa sering cadangan diambil, dan angka kedua menentukan bentuk pemulihannya. Menjawab keduanya dengan latihan yang benar-benar dijalankan jauh lebih berharga daripada menambah frekuensi pencadangan yang tidak pernah dicoba.',
      ),
      references(
        {
          label: 'Backup and Restore',
          href: 'https://www.postgresql.org/docs/current/backup.html',
          source: 'PostgreSQL Docs',
          note: 'Tiga pendekatan pencadangan beserta kelebihan dan batas masing-masing',
        },
        {
          label: 'Continuous Archiving and Point-in-Time Recovery',
          href: 'https://www.postgresql.org/docs/current/continuous-archiving.html',
          source: 'PostgreSQL Docs',
          note: 'Mekanisme yang memungkinkan pemulihan ke satu detik tertentu',
        },
        {
          label: 'pg_dump',
          href: 'https://www.postgresql.org/docs/current/app-pgdump.html',
          source: 'PostgreSQL Docs',
          note: 'Perintah cadangan logis beserta pilihan format keluarannya',
        },
      ),
    ],
  ),

  written(
    'checklist-deploy',
    'Checklist Pra-Deploy & Pasca-Deploy',
    19,
    'Penutup jalur rilis, yaitu apa yang harus benar sebelum dan sesudah kata rilis.',
    [
      p(
        'Ini sub-bab penutup jalur membangun dan merilis. Isinya bukan hal baru, melainkan pengumpulan gerbang yang sudah dibangun sepanjang enam kategori sebelumnya menjadi satu daftar yang benar-benar dijalankan. Sesudah ini tersisa dua kategori lagi. [System Design](/kelas/system-design/fondasi-sistem) membahas apa yang terjadi ketika aplikasi yang sudah rilis ini mulai ramai, lalu [Prompt Engineering](/kelas/prompt-engineering/fondasi-prompt) membahas cara bekerja bersama coding agent yang ikut menulis kode ini.',
      ),

      terms(
        {
          term: 'checklist rilis',
          meaning:
            'Daftar hal yang diperiksa sebelum, saat, dan sesudah rilis. Nilainya bukan pada kelengkapannya melainkan pada benar-benar dijalankannya, sebab butir yang dicentang tanpa dijalankan justru memberi rasa aman palsu.',
        },
        {
          term: 'bukti, bukan klaim',
          meaning:
            'Aturan bahwa sebuah butir baru boleh dicentang setelah perintahnya dijalankan dan keluarannya dibaca. Kalimat "seharusnya lulus" dan "tadi sudah lulus" bukan verifikasi, dan inilah butir yang paling sering dilanggar diam-diam.',
        },
        {
          term: 'exit code',
          meaning:
            'Angka yang dikembalikan perintah saat selesai, nol berarti lulus. Perlu dibaca terpisah dari selesainya perintah, sebab perintah yang berjalan sampai habis tetap bisa mengembalikan kode gagal.',
        },
        {
          term: 'pre-deployment check',
          meaning:
            'Pemeriksaan sebelum rilis, mencakup build, lint, type-check, test, konfigurasi lengkap di lingkungan sasaran, dan migrasi yang sudah diuji pada volume data yang realistis.',
        },
        {
          term: 'post-deployment verification',
          meaning:
            'Pemeriksaan sesudah rilis, yaitu health check membalas, perilaku yang baru diubah benar-benar bekerja di lingkungan itu, serta laju error dan latensi dibandingkan terhadap keadaan sebelum rilis, bukan sekadar dilihat sekilas.',
        },
        {
          term: 'rencana rollback',
          meaning:
            'Keputusan yang diambil sebelum rilis, mencakup perintah apa yang membatalkan, berapa lama, apa yang tidak bisa dibatalkan, ambang apa yang memicu keputusan itu, dan siapa yang memutuskan.',
        },
        {
          term: 'smoke test',
          meaning:
            'Pemeriksaan singkat atas jalur paling penting sesudah rilis, misalnya halaman utama membalas dan login berhasil. Alarm cepat, bukan pengganti test lengkap.',
        },
        {
          term: 'change freeze',
          meaning:
            'Jeda yang disepakati untuk tidak merilis pada waktu tertentu, misalnya menjelang libur panjang. Alasannya bukan bahwa rilisnya lebih berbahaya, melainkan bahwa orang yang bisa memperbaikinya sedang tidak ada.',
        },
      ),

      h2('Aturan yang mendasari semuanya'),
      callout(
        'danger',
        'Klaim tanpa keluaran perintah bukan verifikasi',
        '"Seharusnya lulus", "tadi sudah jalan", dan "kelihatannya baik" bukan bukti. Setiap baris di daftar ini punya perintah yang menghasilkan keluaran — jalankan, lalu **baca** hasilnya. Ini aturan yang sama yang dipakai membangun website yang sedang kamu baca.',
      ),

      h2('Pra-deploy: kualitas'),
      code(
        'bash',
        `
        npm run lint
        npm run type-check
        npm run format:check
        npm run test
        npm run build

        npm run start          # jalankan versi PRODUKSI secara lokal
        `,
      ),
      p(
        'Urutan lima perintah pertama bukan selera — ia disusun dari yang **paling cepat gagal**. `lint` selesai dalam hitungan detik, `build` bisa memakan menit. Menjalankan yang cepat lebih dulu berarti kesalahan ketik tidak perlu menunggu build selesai untuk memberitahumu.',
      ),
      p(
        'Perhatikan `format:check` (bukan `format`) yang dipakai di sini. Bedanya: `format` **mengubah** berkas, `format:check` hanya melaporkan yang tidak sesuai lalu gagal. Di gerbang pra-deploy kamu ingin yang kedua — perintah yang diam-diam memperbaiki sesuatu berarti ada perubahan yang belum ter-commit saat kamu mengira semuanya sudah bersih.',
      ),
      p(
        'Baris terakhir berdiri terpisah karena ia menguji hal yang berbeda dari lima di atasnya. Kelimanya memeriksa **kode**; `npm run start` menjalankan artefak produksi yang baru dibangun dan membiarkanmu membukanya di browser. Di situlah hydration mismatch, variabel environment yang hilang, dan impor yang salah huruf besar-kecil muncul — tidak satu pun tertangkap oleh lint, type-check, maupun tes.',
      ),

      h2('Pra-deploy: keamanan'),
      code(
        'bash',
        `
        npm audit --production --audit-level=high
        gitleaks detect --source . --no-git

        # Tidak ada rahasia di artefak
        grep -rE "sk_live|AKIA|-----BEGIN|postgresql://" .next/static/ dist/ 2>/dev/null \\
          && echo "RAHASIA DI ARTEFAK — hentikan" || echo "bersih"

        # Header keamanan, pada server yang BENAR-BENAR berjalan
        curl -sI http://localhost:3000 | grep -iE \\
          "content-security-policy|strict-transport|x-content-type|referrer-policy|x-powered-by"
        `,
      ),
      p(
        'Empat pemeriksaan ini menutup empat jalur kebocoran yang berbeda. `npm audit --production --audit-level=high` memeriksa dependency yang benar-benar ikut ke produksi, dengan ambang tinggi supaya tidak merah setiap minggu karena hal yang tidak bisa ditindaklanjuti. `gitleaks detect --no-git` memindai berkas di direktori kerja — termasuk `.env` lokal yang mungkin belum diabaikan.',
      ),
      p(
        'Pemeriksaan ketiga menyisir **artefak build**, bukan kode sumber. Bedanya penting: rahasia bisa masuk ke bundle lewat variabel berawalan publik atau impor yang tidak sengaja, tanpa pernah tertulis di kode. `2>/dev/null` membuang pesan error untuk direktori yang tidak ada (project Next.js tidak punya `dist/`, dan sebaliknya), sehingga hasilnya tetap terbaca.',
      ),
      p(
        'Pemeriksaan terakhir menjalankan `curl -sI` terhadap server yang **sedang berjalan** — bukan membaca `next.config.ts`. Empat header pertama yang dicari harus ada; yang kelima, `x-powered-by`, justru harus **tidak** ada, karena ia mengumumkan teknologi dan versi yang kamu pakai kepada pemindai otomatis. Header yang tertulis rapi di konfigurasi tetapi tidak muncul di keluaran ini berarti ia tidak berlaku.',
      ),

      h2('Pra-deploy: konfigurasi'),
      ol(
        'Setiap variabel yang dibaca saat boot **ada** di lingkungan tujuan.',
        'Ketiadaan variabel menggagalkan start dengan pesan jelas — bukan gagal misterius nanti.',
        'Tidak ada rahasia asli di belakang prefiks publik.',
        'Nilainya berbeda per lingkungan; produksi tidak memakai kredensial pengembangan.',
        'Rahasia yang baru dirotasi sudah diperbarui di semua tempat yang memakainya.',
      ),

      h2('Pra-deploy: database'),
      ol(
        'Ada cadangan yang **baru**, dan pemulihannya pernah diuji.',
        'Migrasi sudah dijalankan pada volume data yang realistis, bukan tabel kosong.',
        'Migrasi destruktif dipisah ke rilisnya sendiri (expand–migrate–contract).',
        'Backfill besar berjalan sebagai job, bukan di dalam migrasi.',
        '`down()` sudah benar-benar diuji dengan rollback.',
      ),

      h2('Pra-deploy: rencana rollback'),
      callout(
        'warning',
        'Empat pertanyaan yang harus punya jawaban sebelum menekan deploy',
        '**(1)** Perintah apa untuk kembali, dan berapa lama? **(2)** Apa yang tidak bisa dibatalkan? **(3)** Sinyal apa yang memicu rollback — sebutkan angkanya? **(4)** Siapa yang memutuskan? Rencana yang disusun saat sesuatu sudah terbakar bukan rencana.',
      ),

      h2('Pasca-deploy'),
      code(
        'bash',
        `
        # 1. Aplikasi benar-benar hidup
        curl -fsS https://app.contoh.com/health/ready | jq

        # 2. Perilaku yang BARU DIUBAH benar-benar bekerja
        #    (bukan sekadar halaman depan terbuka)

        # 3. Bandingkan dengan sebelum deploy — bukan "kelihatannya normal"
        #    - tingkat error 5xx
        #    - latensi p95
        #    - panjang antrean job

        # 4. Log tidak menampilkan jenis error baru
        `,
      ),
      p(
        'Empat langkah ini menaik dari yang paling mudah ke yang paling sering dilewati. Langkah 1 membuktikan aplikasinya hidup, dan hanya itu — pipeline yang hijau tidak membuktikan apa pun tentang aplikasi yang berjalan. Langkah 2 yang sebenarnya menjawab "apakah deploy ini berhasil": **perilaku yang baru kamu ubah** harus dicoba, karena halaman depan yang terbuka normal juga terjadi pada deploy yang gagal separuh.',
      ),
      p(
        'Langkah 3 menekankan kata **dibandingkan**. "Kelihatannya normal" tidak berarti apa-apa tanpa angka sebelum deploy sebagai pembanding: tingkat error 5xx yang naik dari 0,1% ke 0,8% masih terlihat kecil di layar, tetapi itu delapan kali lipat. Panjang antrean job masuk daftar karena ia satu-satunya yang menunjukkan pekerja antrean berhenti bekerja — gejalanya tidak muncul di metrik HTTP mana pun.',
      ),
      p(
        'Langkah 4 mencari **jenis** error baru, bukan jumlahnya. Aplikasi yang sehat pun selalu punya error di lognya; yang menandakan masalah adalah pesan yang belum pernah ada sebelum deploy ini. Daftar berikut menerjemahkan keempat langkah tersebut menjadi enam pemeriksaan konkret.',
      ),
      ol(
        'Health check hijau, dari **luar** infrastruktur.',
        'Alur kritis diuji manual sekali — masuk, muat, simpan.',
        'Metrik dibandingkan dengan baseline sebelum deploy.',
        'Pekerja antrean sudah dimulai ulang dan memproses job.',
        'Tugas terjadwal masih berjalan.',
        'Tidak ada lonjakan di error tracker.',
      ),
      callout(
        'danger',
        'Pekerja antrean yang lupa di-restart adalah kegagalan pasca-deploy paling umum',
        'Ia memuat kode **sekali** saat dijalankan. Setelah deploy, ia masih menjalankan kode lama — sehingga perbaikan yang sudah di-deploy tetap gagal dengan cara yang persis sama. Gejalanya sangat membingungkan karena kodenya jelas sudah benar.',
      ),

      h2('Laporkan dengan jujur'),
      callout(
        'warning',
        'Apa pun yang gagal atau dilewati dilaporkan apa adanya',
        'Langkah yang tidak bisa dijalankan, entah karena layanan mati, variabel kurang, atau waktu habis, disebutkan **eksplisit** alih-alih dibulatkan menjadi "selesai". Ini prinsip yang sama yang berlaku untuk seluruh pekerjaan teknis, yaitu bedakan yang **diverifikasi** dari yang **diasumsikan**.',
      ),

      divider,

      h2('Penutup'),
      p(
        'Kamu sudah sampai di ujung kurikulum: dari variabel JavaScript pertama sampai rencana rollback. Yang paling berharga dari seluruh jalur ini bukan daftar teknologinya — ia akan berganti. Yang bertahan adalah tiga kebiasaan yang muncul berulang di setiap kategori:',
      ),
      ol(
        '**Verifikasi, jangan berasumsi.** Jalankan perintahnya, baca keluarannya.',
        '**Uji jalur yang tidak bahagia.** Yang gagal di produksi hampir tidak pernah jalur sukses.',
        '**Aturan yang dijaga mesin bertahan; yang dijaga ingatan tidak.** Setiap kali kamu menemukan aturan penting, tanyakan bagaimana membuatnya gagal secara otomatis saat dilanggar.',
      ),
      p(
        'Website yang sedang kamu baca dibangun dengan ketiganya. Batas bundle klien, kemandirian build dari jaringan, dan kesegaran tanggal materi semuanya dijaga tes — bukan karena penulisnya disiplin, tapi karena disiplin saja tidak pernah cukup.',
      ),

      divider,

      checklist(
        'dep7-praktik',
        'Checklist rilis — jalankan, jangan sekadar dibaca',
        'Lint, type-check, format, test, dan build semuanya dijalankan dan hijau',
        '`npm run start` dijalankan lokal, dan aplikasinya benar-benar dibuka',
        'Audit dependency produksi bersih untuk kerentanan tinggi',
        'Secret scanner dijalankan dan tidak menemukan apa pun',
        'Tidak ada rahasia di artefak build maupun bundle klien',
        'Header keamanan diverifikasi dengan `curl -I` pada server yang berjalan',
        '`X-Powered-By` dan header pengungkap teknologi lain tidak ada',
        'Mode debug mati; endpoint internal dan dashboard dilindungi',
        'Semua variabel environment ada, tervalidasi, dan berbeda per lingkungan',
        'Ada cadangan database yang baru, dan pemulihannya pernah diuji',
        'Migrasi diuji pada volume data realistis; yang destruktif dipisah',
        'Rencana rollback punya jawaban untuk keempat pertanyaannya',
        'Setelah deploy: health check hijau dari luar infrastruktur',
        'Setelah deploy: alur kritis diuji manual sekali',
        'Setelah deploy: metrik dibandingkan dengan baseline, bukan dilihat sekilas',
        'Setelah deploy: pekerja antrean dimulai ulang dan memproses job',
        'Apa pun yang gagal atau dilewati dilaporkan eksplisit',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Checklist yang hanya dibaca tidak menghasilkan apa pun. Yang berguna adalah checklist yang **dijalankan**, sehingga setiap butirnya menghasilkan keluaran yang bisa dilihat orang lain, bukan pendapat.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini, bagian yang bisa diotomatiskan:

          format:check     3.691 ms   exit=1
          lint             6.021 ms   exit=0
          type-check       2.403 ms   exit=0
          test             7.184 ms   exit=0
          build           64.834 ms   exit=0

        Perhatikan baris pertama. Satu berkas test yang TIDAK disentuh
        dalam pekerjaan ini ternyata belum sesuai format. Artinya
        pemeriksaan itu memang belum pernah dijalankan otomatis di
        project ini, dan penyimpangannya baru terlihat ketika
        seseorang menjalankannya.
        `,
        {
          caption:
            'Pemeriksaan yang tidak dijalankan mesin akan menyimpang, dan penyimpangannya ditemukan secara kebetulan.',
        },
      ),
      p(
        'Untuk sisi keamanan, bentuk yang paling murah adalah skrip `curl` yang menghasilkan keluaran seragam, dan hasilnya juga sudah diukur.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan dengan curl 8.5.0 terhadap dua versi
        aplikasi yang sama, sebelum dan sesudah diperbaiki:

        == SEBELUM
          TEMUAN IDOR faktur orang lain           harap=404 dapat=200
          TEMUAN pesan login seragam              harap=sama dapat=beda
          TEMUAN pembatasan laju login            harap=429 dapat=404
          TEMUAN 500 tanpa stack trace            harap=bersih dapat=bocor
          TEMUAN /metrics tertutup                harap=404 dapat=200
          TEMUAN header content-security-policy   harap=ada dapat=tiada
          TEMUAN header strict-transport-security harap=ada dapat=tiada
          TEMUAN header x-content-type-options    harap=ada dapat=tiada
          TEMUAN header referrer-policy           harap=ada dapat=tiada
          TEMUAN X-Powered-By disembunyikan       harap=tiada dapat=ada
          -> temuan: 10

        == SESUDAH
          (sepuluh baris AMAN)
          -> temuan: 0
        `,
      ),
      p(
        'Ada satu detail pada hasil itu yang mengajarkan cara membacanya. Butir pembatasan laju menerima `404`, bukan `429`, dan itu **bukan** karena pembatasannya bekerja. Servernya memang tidak punya pembatasan sama sekali, dan `404` yang muncul justru kebocoran enumerasi dari butir lain yang menampakkan dirinya lagi. Kolom `dapat=` yang menjelaskan, bukan jumlah temuannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Checklist juga bisa gagal karena alasan yang tidak ada hubungannya dengan apa yang diperiksa, dan mengenali bedanya menghemat banyak waktu.',
      ),
      code(
        'text',
        `
        curl: (7) Failed to connect to 127.0.0.1 port 3991
          -> servernya belum jalan. Bukan temuan.

        curl: (28) Operation timed out after 30001 milliseconds
          -> server hidup tapi menggantung. Periksa terpisah sebagai
             masalah ketersediaan.

        TEMUAN IDOR faktur orang lain  harap=404 dapat=401
          -> permintaannya ditolak SEBELUM sampai ke pemeriksaan
             kepemilikan. Autentikasi ujimu yang salah, bukan
             otorisasinya yang benar. Pemeriksaan ini belum
             membuktikan apa pun.
        `,
        {
          caption:
            'Yang terakhir paling berbahaya: hasil yang terlihat aman padahal pemeriksaannya tidak pernah sampai ke sasaran.',
        },
      ),
      code(
        'bash',
        `
        # Karena itu setiap pemeriksaan negatif perlu pasangan positifnya.
        periksa "pemilik sah BISA membaca" 200 \\
          "$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Pengguna: 1' "$BASE/v1/faktur/101")"

        periksa "bukan pemilik TIDAK bisa" 404 \\
          "$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Pengguna: 1' "$BASE/v1/faktur/102")"
        `,
      ),
      p(
        'Bagian pasca-deploy sering hanya berisi "periksa apakah situsnya jalan", dan itu terlalu longgar untuk menangkap kegagalan yang paling sering.',
      ),
      code(
        'text',
        `
        PASCA-DEPLOY, yang benar-benar perlu diperiksa:

        1. Versi yang berjalan memang yang baru
             curl -sI https://app.contoh.id | grep -i x-app-version
           Tanpa penanda ini, pertanyaan "yang mana yang jalan"
           tidak punya jawaban yang bisa diperiksa.

        2. Perilaku yang BERUBAH memang berubah
           Bukan "situsnya jalan", melainkan alur yang tadi diperbaiki.

        3. Tingkat error dibandingkan dengan SEBELUM rilis
           Bukan "terlihat wajar". Bandingkan dengan angka patokan.

        4. Job latar memakai kode baru
           Pada Laravel: queue:restart. Tanpa itu, pekerja tetap
           menjalankan kode lama berjam-jam.

        5. Tidak ada KELAS error baru di log
           Bukan jumlahnya, melainkan jenisnya. Satu error baru
           dengan volume kecil sering lebih penting daripada
           kenaikan error yang sudah dikenal.
        `,
      ),
      p(
        'Bagian yang tidak bisa diotomatiskan juga harus ditulis terbuka, alih-alih dibiarkan seolah tercakup oleh yang otomatis.',
      ),
      code(
        'text',
        `
        Diperiksa dengan perintah lain:
          npm audit                      kerentanan dependency
          git log -p | grep -i secret    rahasia di riwayat versi
          grep -r "process.env" src/     konfigurasi yang dibaca tersebar
          grep -rl "..." .next/static    data yang bocor ke bundel klien

        Diperiksa dengan peramban sungguhan:
          apakah CSP benar-benar memblokir skrip inline
          apakah halaman bisa dibingkai situs lain
          apakah cookie sesi benar-benar terpasang di staging

        Diperiksa dengan MEMBACA KODE:
          apakah query daftar menyaring di WHERE, bukan di memori
          apakah id sesi diregenerasi sesudah login
          apakah ada cek-lalu-tulis yang bisa berlomba
          apakah migrasi ini aman bila kode lama dan baru berjalan
          bersamaan selama sepuluh menit
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan terbesar pada tahap ini bukan melewatkan satu butir, melainkan salah memahami apa yang dibuktikan oleh checklist yang hijau.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menandai butir tanpa menjalankan perintahnya',
            'Sudah diperiksa waktu menulis kodenya',
            'Klaim tanpa keluaran perintah bukan verifikasi. Diukur, `format:check` gagal pada berkas lama',
          ],
          [
            'Hanya menulis pemeriksaan yang harus DITOLAK',
            'Yang diuji kan pertahanannya',
            'Permintaan yang ditolak sejak autentikasi terlihat sama dengan otorisasi yang bekerja',
          ],
          [
            'Menghitung jumlah temuan tanpa membaca isinya',
            'Angkanya sudah nol',
            'Diukur, satu kelemahan muncul di dua butir berbeda. Kolom `dapat=` yang menjelaskan',
          ],
          [
            'Memeriksa "apakah situsnya jalan" sesudah deploy',
            'Kalau jalan berarti berhasil',
            'Versi lama juga membuat situsnya jalan. Periksa penanda versi dan perilaku yang berubah',
          ],
          [
            'Menyembunyikan butir yang tidak bisa diotomatiskan',
            'Biar checklistnya terlihat penuh',
            'Itu memberi kesan cakupannya lengkap. Tulis daftar keduanya secara terbuka',
          ],
          [
            'Menganggap checklist hijau berarti aman',
            'Semua butir sudah lolos',
            'Checklist menguji apa yang ditulis di dalamnya. Perlombaan dan logika bisnis tidak terlihat oleh `curl`',
          ],
        ],
      ),
      p(
        'Baris terakhir menentukan cara membaca seluruh kategori ini. Perlombaan penukaran kupon yang menghasilkan sisa `-1`, total pesanan negatif dari jumlah `-1000`, dan `__destruct` yang berjalan meski `unserialize` gagal semuanya terjadi di aplikasi yang akan melewati checklist ini tanpa satu pun temuan. Checklist adalah lantai, bukan langit-langit, dan gunanya memastikan kesalahan yang **sudah dikenali** tidak terulang, bukan memastikan tidak ada kesalahan lain.',
      ),
      references(
        {
          label: 'Release engineering',
          href: 'https://sre.google/sre-book/release-engineering/',
          source: 'Google SRE Book',
          note: 'Prinsip rilis yang bisa diulang, dan kenapa prosesnya harus otomatis',
        },
        {
          label: 'Monitoring Distributed Systems',
          href: 'https://sre.google/sre-book/monitoring-distributed-systems/',
          source: 'Google SRE Book',
          note: 'Ukuran yang dipakai membandingkan keadaan sesudah rilis terhadap sebelumnya',
        },
        {
          label: 'Managing environments for deployment',
          href: 'https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments',
          source: 'GitHub Docs',
          note: 'Gerbang persetujuan dan riwayat deploy sebagai bagian dari prosedur rilis',
        },
      ),
    ],
  ),
];
