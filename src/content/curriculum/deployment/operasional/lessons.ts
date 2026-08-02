import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  table,
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
    10,
    'Mengetahui aplikasimu mati sebelum penggunamu memberi tahu.',
    [
      p(
        'Tanpa pemantauan, cara kamu mengetahui aplikasimu mati adalah lewat laporan pengguna — dan itu berarti ia sudah mati cukup lama untuk mengganggu seseorang sampai ia repot-repot melapor.',
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
        'Aplikasi bisa menjawab `200` di halaman depan sementara login rusak, atau database putus sehingga setiap aksi gagal. Pantau juga satu **alur nyata** — masuk, muat data, simpan sesuatu — bukan hanya ketersediaan port.',
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
      callout(
        'tip',
        'Pemantauan yang tidak pernah diuji biasanya tidak bekerja',
        'Aturan alert bisa salah tulis, saluran notifikasi bisa berubah, dan kunci integrasi bisa kedaluwarsa — semuanya tanpa gejala sampai kamu benar-benar membutuhkannya. Uji jalurnya secara berkala, sama seperti menguji cadangan.',
      ),

      h2('Halaman status'),
      p(
        'Untuk layanan yang dipakai orang lain, halaman status mengurangi beban dukungan secara signifikan. Yang penting: ia harus di-**host terpisah** dari aplikasimu — halaman status yang ikut mati saat aplikasi mati tidak berguna.',
      ),
    ],
  ),

  written(
    'error-tracking',
    'Error Tracking',
    11,
    'Mengumpulkan kegagalan sungguhan, dari pengguna sungguhan.',
    [
      p(
        'Log memberi tahu apa yang terjadi kalau kamu tahu di mana mencarinya. Error tracking **mendatangi** kamu: mengelompokkan kegagalan yang sama, menghitungnya, dan memberi tahu saat ada yang baru.',
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
      callout(
        'tip',
        'Regresi yang terbuka kembali adalah sinyal penting',
        'Bug yang kembali berarti perbaikannya menyembuhkan gejala, bukan penyebab — atau tidak ada tes yang menjaganya. Keduanya menuntut tindakan yang berbeda dari sekadar memperbaikinya lagi.',
      ),
    ],
  ),

  written(
    'logging-terpusat',
    'Logging Terpusat & Correlation ID',
    11,
    'Log yang bisa dicari, dan yang selamat dari instance yang dibuang.',
    [
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
    ],
  ),

  written(
    'analytics-web-vitals',
    'Analytics & Core Web Vitals di Produksi',
    11,
    'Mengukur pengalaman pengguna sungguhan, bukan skor di laptopmu.',
    [
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
      callout(
        'tip',
        'Kumpulkan yang menjawab pertanyaan, bukan semua yang bisa dikumpulkan',
        'Analytics yang menghormati privasi seperti Plausible atau Umami memberi hampir semua yang benar-benar dipakai — halaman populer, sumber trafik, tingkat pentalan — tanpa cookie dan tanpa melacak individu. Data yang tidak kamu kumpulkan tidak bisa bocor, dan tidak menuntut banner persetujuan.',
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
    ],
  ),

  written(
    'backup-restore',
    'Backup & Restore Database',
    12,
    'Cadangan yang tidak pernah diuji bukan cadangan — ia asumsi.',
    [
      p(
        'Ini sub-bab yang paling mudah ditunda dan paling mahal kalau ditunda. Server yang mati bisa dinyalakan lagi; data yang hilang tidak bisa dikembalikan.',
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
      callout(
        'warning',
        'Cadangan yang berhenti berjalan tidak menimbulkan error apa pun',
        'Cron mati, kredensial kedaluwarsa, atau disk penuh — dan cadangan berhenti diam-diam. Tidak ada yang tahu sampai seseorang membutuhkannya. Pemantauan heartbeat adalah satu-satunya cara mendeteksi sesuatu yang gagal dengan cara **tidak terjadi**.',
      ),
    ],
  ),

  written(
    'checklist-deploy',
    'Checklist Pra-Deploy & Pasca-Deploy',
    11,
    'Penutup kurikulum: yang harus benar sebelum dan sesudah kata "rilis".',
    [
      p(
        'Ini sub-bab terakhir dari 330 sub-bab. Isinya bukan hal baru — ia mengumpulkan gerbang yang sudah dibangun sepanjang jalur belajar ini menjadi satu daftar yang benar-benar dijalankan.',
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
        'Langkah yang tidak bisa dijalankan — karena layanan mati, variabel kurang, atau waktu habis — disebutkan **eksplisit**, bukan dibulatkan menjadi "selesai". Ini prinsip yang sama yang berlaku untuk seluruh pekerjaan teknis: bedakan yang **diverifikasi** dari yang **diasumsikan**.',
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
        'Pemindai rahasia dijalankan dan tidak menemukan apa pun',
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
    ],
  ),
];
