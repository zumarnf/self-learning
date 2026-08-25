import {
  callout,
  checklist,
  code,
  compare,
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
 * System Design — Chapter 4, eight lessons.
 *
 * Two halves. The first four lessons are the reliability delta on top of the Deployment
 * category: what that chapter did not cover because it is a design decision rather than a
 * tooling one — redundancy analysis, golden signals and SLO, autoscaling limits, RPO/RTO.
 *
 * The last four apply all three previous chapters to concrete systems, ending with the
 * reader designing one themselves.
 */
export const lessons: LessonDraft[] = [
  written(
    'titik-kegagalan-tunggal',
    'Single Point of Failure dan Redundansi',
    12,
    'Menemukan bagian yang matinya menjatuhkan semuanya, lalu memutuskan mana yang layak digandakan.',
    [
      p(
        'Tiga bab sebelumnya membangun sebuah susunan. Bab ini bertanya apa yang terjadi ketika bagian-bagiannya mati, karena semuanya pasti mati pada satu titik. Mesin rusak, disk penuh, sertifikat kedaluwarsa, penyedia awan mengalami gangguan, dan seseorang menjalankan perintah yang salah.',
      ),
      p(
        'Perbedaan antara sistem yang tangguh dan sistem yang rapuh bukan pada seberapa jarang bagiannya gagal, melainkan pada **berapa banyak yang ikut jatuh** ketika satu bagian gagal.',
      ),

      terms(
        {
          term: 'single point of failure (SPOF)',
          meaning:
            'Komponen yang matinya membuat seluruh sistem atau seluruh sebuah fungsi ikut mati. Disingkat SPOF. Menemukannya dilakukan dengan satu pertanyaan yang diajukan ke setiap kotak pada diagram, yaitu apa yang terjadi bila kotak ini mati sekarang.',
        },
        {
          term: 'blast radius',
          meaning:
            'Seberapa luas akibat sebuah kegagalan. Dibaca "blast reidius". Tujuan perancangan yang tangguh bukan menghilangkan kegagalan, melainkan memperkecil blast radiusnya sehingga satu bagian yang mati hanya menonaktifkan satu fungsi, bukan seluruh aplikasi.',
        },
        {
          term: 'graceful degradation',
          meaning:
            'Kemampuan sistem tetap melayani fungsi utamanya dengan mutu yang berkurang ketika sebagian komponennya bermasalah. Contohnya halaman yang tetap tampil tanpa bagian rekomendasi ketika layanan rekomendasi mati, alih-alih menampilkan halaman error.',
        },
        {
          term: 'circuit breaker',
          meaning:
            'Pola yang berhenti memanggil sebuah ketergantungan setelah ia gagal berkali-kali, lalu mencobanya lagi sesekali. Namanya diambil dari sekring listrik. Tujuannya mencegah pemanggil ikut tumbang karena menunggu ketergantungan yang sudah pasti gagal.',
        },
        {
          term: 'cascading failure',
          meaning:
            'Kegagalan yang merambat dari satu komponen ke komponen lain sampai seluruh sistem jatuh. Pola khasnya, satu layanan melambat, pemanggilnya menumpuk menunggu, kehabisan sambungan, lalu ikut melambat, dan seterusnya ke atas.',
        },
        {
          term: 'timeout',
          meaning:
            'Batas berapa lama sebuah panggilan boleh menunggu sebelum menyerah. Panggilan tanpa timeout adalah salah satu penyebab cascading failure yang paling umum, karena ketergantungan yang menggantung akan menahan sumber daya pemanggilnya sampai habis.',
        },
        {
          term: 'bulkhead',
          meaning:
            'Pemisahan sumber daya agar satu bagian yang kewalahan tidak menghabiskan sumber daya bagian lain. Namanya diambil dari sekat kedap air pada kapal. Contohnya connection pool terpisah per ketergantungan, sehingga satu ketergantungan yang lambat tidak menghabiskan seluruh sambungan.',
        },
      ),

      h2('Menemukan single point of failure'),
      p(
        'Caranya sederhana dan bisa dikerjakan dalam setengah jam. Ambil diagram susunanmu, lalu tanyakan satu pertanyaan yang sama ke setiap kotak.',
      ),
      table(
        ['Komponen', 'Bila mati sekarang', 'SPOF?', 'Jawaban yang wajar'],
        [
          [
            'DNS',
            'Nama domain tidak bisa diterjemahkan',
            'Ya',
            'Pakai penyedia dengan beberapa nameserver',
          ],
          [
            'CDN',
            'Aset dan halaman melambat atau gagal',
            'Sebagian',
            'Bisa dilewati ke origin, dengan beban lebih berat',
          ],
          [
            'Load balancer',
            'Tidak ada permintaan yang masuk',
            '**Ya**',
            'Pakai yang terkelola, atau sepasang dengan IP mengambang',
          ],
          [
            'Server aplikasi',
            'Kapasitas berkurang',
            'Tidak, bila lebih dari satu',
            'Minimal dua, tersebar di zona berbeda',
          ],
          [
            'Redis',
            'Tergantung pemakaiannya',
            'Bisa ya bisa tidak',
            'Cache boleh gagal, sesi tidak',
          ],
          [
            'Database leader',
            'Tidak ada penulisan yang bisa masuk',
            '**Ya**',
            'Follower dengan perpindahan otomatis',
          ],
          [
            'Object storage',
            'Gambar tidak tampil',
            'Sebagian',
            'Biasanya sudah berlipat di dalam layanannya',
          ],
          [
            'Antrean',
            'Pekerjaan latar berhenti',
            'Sebagian',
            'Permintaan tetap dilayani, pekerjaan tertunda',
          ],
          [
            'Worker',
            'Antrean menumpuk',
            'Tidak, bila lebih dari satu',
            'Minimal dua per jenis pekerjaan',
          ],
        ],
      ),
      p(
        'Baris Redis layak dibahas tersendiri karena jawabannya bergantung sepenuhnya pada bagaimana kamu memakainya. Kalau Redis hanya menyimpan cache dan kodemu menanganinya seperti pada sub-bab [lapisan cache](/kelas/system-design/blok-penyusun/lapisan-cache), matinya berarti lambat. Kalau Redis juga menyimpan sesi seperti pada sub-bab [server stateless](/kelas/system-design/blok-penyusun/server-stateless), matinya berarti semua orang keluar.',
      ),
      callout(
        'tip',
        'Satu instance Redis bisa berperan sebagai dua komponen dengan kebutuhan berbeda',
        'Cache boleh hilang, sesi dan antrean tidak. Memisahkan keduanya ke instance berbeda membuat kamu bisa memperlakukan masing-masing sesuai sifatnya, yaitu cache boleh dimatikan kapan saja untuk pemeliharaan, sedangkan yang menyimpan sesi butuh replika dan pencadangan.',
      ),

      h2('Memutuskan mana yang layak digandakan'),
      p(
        'Menggandakan semuanya berarti melipatgandakan biaya dan kerumitan. Keputusannya diambil dengan menimbang akibat matinya terhadap biaya cadangannya.',
      ),
      table(
        ['Akibat bila mati', 'Contoh', 'Redundansi yang sepadan'],
        [
          [
            'Kehilangan pendapatan langsung',
            'Checkout, pembayaran',
            'Penuh, termasuk perpindahan otomatis',
          ],
          ['Pengguna tidak bisa masuk', 'Login, sesi', 'Penuh'],
          [
            'Konten tidak bisa dibaca',
            'Halaman artikel',
            'Beberapa mesin, plus CDN sebagai penahan',
          ],
          [
            'Fitur sekunder mati',
            'Rekomendasi, statistik',
            'Tidak perlu, cukup graceful degradation',
          ],
          ['Pekerjaan latar tertunda', 'Email, laporan', 'Cukup worker lebih dari satu'],
        ],
      ),
      p(
        'Baris keempat adalah keputusan yang sering terlewat, yaitu ada komponen yang **sengaja** dibiarkan tanpa cadangan karena matinya memang tidak penting. Yang wajib dipastikan pada komponen seperti itu adalah matinya tidak menjatuhkan yang lain.',
      ),

      h2('Graceful degradation, tulisnya di kode'),
      compare(
        {
          title: 'Rapuh, semuanya ikut jatuh',
          lang: 'js',
          code: `
            app.get('/produk/:id', async (req, res) => {
              const produk = await db.produk.cari(req.params.id);
              const rekomendasi = await layananRekomendasi.untuk(produk.id);
              const ulasan = await layananUlasan.untuk(produk.id);

              res.render('produk', { produk, rekomendasi, ulasan });
            });
          `,
          notes: [
            'Layanan rekomendasi mati berarti halaman produk mati',
            'Tidak ada timeout, jadi yang lambat menahan semuanya',
            'Tiga panggilan berurutan, latensinya dijumlahkan',
          ],
        },
        {
          title: 'Tangguh, yang inti tetap tampil',
          lang: 'js',
          code: `
            const BATAS_MS = 500;

            function denganBatasWaktu(janji, batasMs, cadangan) {
              return Promise.race([
                janji,
                new Promise((resolve) => setTimeout(() => resolve(cadangan), batasMs)),
              ]).catch(() => cadangan);
            }

            app.get('/produk/:id', async (req, res) => {
              // Inti: gagal di sini memang harus menggagalkan halaman.
              const produk = await db.produk.cari(req.params.id);
              if (produk === null) return res.status(404).render('404');

              // Pelengkap: dipanggil serentak, boleh gagal, punya nilai cadangan.
              const [rekomendasi, ulasan] = await Promise.all([
                denganBatasWaktu(layananRekomendasi.untuk(produk.id), BATAS_MS, []),
                denganBatasWaktu(layananUlasan.untuk(produk.id), BATAS_MS, null),
              ]);

              res.render('produk', { produk, rekomendasi, ulasan });
            });
          `,
          notes: [
            'Halaman tetap tampil tanpa rekomendasi',
            'Timeout 500 ms membatasi kerugian latensi',
            'Dipanggil serentak, bukan berurutan',
            'Template harus siap menerima array kosong dan null',
          ],
        },
      ),
      p(
        'Catatan terakhir pada panel kanan adalah bagian yang paling sering menggagalkan pola ini. Kalau templatemu memanggil `ulasan.rata` tanpa memeriksa, mengembalikan `null` justru menghasilkan error yang sama dengan yang ingin dihindari. Graceful degradation harus diselesaikan sampai ke tampilan, bukan hanya di pengambilan datanya.',
      ),
      p(
        'Bentuk ini menyambung langsung ke sub-bab [empat keadaan UI](/kelas/frontend-intermediate/state-dan-event-handler/empat-keadaan-ui). Bagian rekomendasi yang gagal punya empty state-nya sendiri, dan keadaan itu harus dirancang, bukan dibiarkan menjadi ruang kosong tanpa keterangan.',
      ),

      h2('Cascading failure dan cara memutusnya'),
      p(
        'Bentuk kegagalan paling merusak bukan komponen yang mati, melainkan komponen yang **melambat**. Komponen yang mati memberi jawaban gagal dengan cepat, sedangkan komponen yang lambat menahan sumber daya pemanggilnya sampai habis.',
      ),
      code(
        'text',
        `
        ANATOMI KEGAGALAN BERUNTUN

        1. Layanan pembayaran melambat dari 100 ms menjadi 30 detik.
        2. Setiap permintaan checkout menahan satu sambungan selama 30 detik.
        3. Connection pool aplikasi habis.
        4. Permintaan LAIN yang tidak ada hubungannya dengan checkout ikut menunggu.
        5. Health check ikut menunggu, lalu gagal.
        6. Load balancer mengeluarkan mesin itu.
        7. Bebannya pindah ke mesin lain, yang lalu mengalami hal yang sama.
        8. Seluruh armada jatuh karena satu ketergantungan yang lambat.
        `,
      ),
      p(
        'Empat pertahanan memutus rantai itu, dan yang pertama sudah menutup sebagian besar kasusnya.',
      ),
      table(
        ['Pertahanan', 'Memutus di langkah', 'Bagaimana'],
        [
          ['Timeout', '2', 'Panggilan menyerah setelah beberapa detik, bukan 30'],
          ['Bulkhead', '4', 'Connection pool terpisah per ketergantungan'],
          ['Circuit breaker', '2', 'Berhenti memanggil sama sekali setelah gagal berkali-kali'],
          ['Kesehatan yang dangkal', '5', 'Liveness tidak memeriksa ketergantungan luar'],
        ],
      ),
      code(
        'js',
        `
        // Circuit breaker sederhana dengan tiga keadaan.
        class PemutusArus {
          #gagalBerturut = 0;
          #terbukaSampai = 0;

          constructor({ ambangGagal = 5, jedaTerbukaMs = 30_000 } = {}) {
            this.ambangGagal = ambangGagal;
            this.jedaTerbukaMs = jedaTerbukaMs;
          }

          get terbuka() {
            return Date.now() < this.#terbukaSampai;
          }

          async panggil(fungsi, cadangan) {
            // TERBUKA: jangan panggil sama sekali, langsung pakai cadangan.
            if (this.terbuka) {
              metrics.increment('pemutus.dilewati');
              return cadangan;
            }

            try {
              const hasil = await fungsi();
              this.#gagalBerturut = 0; // TERTUTUP kembali
              return hasil;
            } catch (err) {
              this.#gagalBerturut++;
              if (this.#gagalBerturut >= this.ambangGagal) {
                this.#terbukaSampai = Date.now() + this.jedaTerbukaMs;
                logger.error(
                  { gagal: this.#gagalBerturut },
                  'circuit breaker terbuka, berhenti memanggil sementara',
                );
              }
              return cadangan;
            }
          }
        }

        const pemutusRekomendasi = new PemutusArus();

        const rekomendasi = await pemutusRekomendasi.panggil(
          () => layananRekomendasi.untuk(produk.id),
          [],
        );
        `,
        {
          caption:
            'Ketika terbuka, panggilannya tidak dilakukan sama sekali, sehingga tidak ada sumber daya yang tertahan.',
        },
      ),
      p(
        'Nilai sesungguhnya circuit breaker ada pada keadaan terbukanya. Timeout tetap membuat setiap permintaan menunggu selama batas itu, sedangkan circuit breaker yang terbuka membuat permintaan **tidak menunggu sama sekali**. Pada beban tinggi, selisih antara menunggu dua detik dan tidak menunggu adalah selisih antara tumbang dan bertahan.',
      ),

      h2('Correlated failure'),
      p(
        'Perhitungan di sub-bab [ketersediaan dan angka sembilan](/kelas/system-design/fondasi-sistem/ketersediaan-dan-sla) menunjukkan dua salinan sejajar menaikkan ketersediaan secara dramatis. Perhitungan itu punya satu syarat, yaitu kegagalannya tidak berkorelasi. Dalam kenyataan, banyak kegagalan justru berkorelasi.',
      ),
      table(
        ['Penyebab berkorelasi', 'Kenapa redundansi tidak menolong', 'Yang mengurangi'],
        [
          [
            'Semua mesin di satu zona',
            'Zona itu padam, semuanya ikut padam',
            'Sebarkan ke beberapa zona ketersediaan',
          ],
          [
            'Semua menerima versi yang sama',
            'Versi cacat merusak semuanya sekaligus',
            'Rilis bertahap dengan kanari',
          ],
          [
            'Sertifikat kedaluwarsa',
            'Semua mesin memakai sertifikat yang sama',
            'Perpanjangan otomatis, plus alert jauh hari',
          ],
          [
            'Kehabisan disk karena log',
            'Semua mesin menulis log dengan laju sama',
            'Rotasi log dan alert pada sisa disk',
          ],
          [
            'Bug kehabisan memori',
            'Semua salinan punya bug yang sama',
            'Batas memori, mulai ulang otomatis, alert',
          ],
          [
            'Ketergantungan pihak ketiga',
            'Semua mesin memanggil layanan yang sama',
            'Circuit breaker dan jalur cadangan',
          ],
        ],
      ),
      p(
        'Baris kedua adalah alasan rilis kanari ada, dan itu menyambung ke sub-bab [rollback](/kelas/deployment/ci-cd/rollback). Mengirim versi baru ke semua mesin sekaligus mengubah setiap bug menjadi pemadaman total, sedangkan mengirimnya ke lima persen lebih dulu mengubah bug yang sama menjadi lima persen pengguna yang terganggu selama beberapa menit.',
      ),
      callout(
        'danger',
        'Zona ketersediaan yang sama adalah SPOF yang tidak terlihat di diagram',
        'Tiga mesin aplikasi terlihat seperti redundansi tiga kali lipat. Bila ketiganya berada di zona yang sama, ketiganya punya satu sumber listrik, satu jaringan, dan satu gedung. Periksa penempatannya, bukan hanya jumlahnya, dan sebarkan minimal ke dua zona.',
      ),

      h2('Menguji bahwa redundansinya benar-benar bekerja'),
      p(
        'Redundansi yang tidak pernah diuji hampir selalu gagal ketika pertama kali dibutuhkan, biasanya karena satu detail yang tidak terpikir, misalnya alamat leader yang ternyata ditulis mati di berkas konfigurasi.',
      ),
      ol(
        '**Matikan satu mesin aplikasi saat ada lalu lintas.** Pastikan tidak ada permintaan yang terpotong, dan pastikan itu berkat draining pada sub-bab load balancer.',
        '**Matikan Redis cache.** Sistem harus melambat, bukan mati. Kalau mati, cachenya belum opsional.',
        '**Lakukan perpindahan database secara terencana.** Catat berapa lama benar-benar butuh waktu, dan bandingkan dengan RTO yang kamu janjikan.',
        '**Hentikan seluruh worker selama satu jam.** Antrean harus menumpuk lalu terkejar, bukan kehilangan pekerjaan.',
        '**Buat layanan pihak ketiga menjawab lambat.** Ini yang paling sering luput diuji, dan yang paling sering menjatuhkan sistem sungguhan.',
      ),
      p(
        'Kelima uji itu dijalankan di lingkungan staging seperti yang dibahas di sub-bab [dev, staging, dan produksi](/kelas/deployment/fondasi-deployment/dev-staging-prod). Menjalankannya di produksi adalah praktik yang sah dan punya namanya sendiri, dan itu sebaiknya baru dilakukan setelah kelimanya lulus di staging beberapa kali.',
      ),

      references(
        {
          label: 'Site Reliability Engineering: Addressing Cascading Failures',
          href: 'https://sre.google/sre-book/addressing-cascading-failures/',
          source: 'Google SRE',
          note: 'Anatomi lengkap cascading failure beserta seluruh pertahanannya.',
        },
        {
          label: 'Kubernetes: Pod Topology Spread Constraints',
          href: 'https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/',
          source: 'Kubernetes',
          note: 'Mekanisme yang memastikan salinan tersebar ke zona berbeda.',
        },
        {
          label: 'Nginx: proxy_next_upstream',
          href: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_next_upstream',
          source: 'Nginx',
          note: 'Percobaan ke server lain ketika satu upstream gagal.',
        },
        {
          label: 'PostgreSQL: Failover',
          href: 'https://www.postgresql.org/docs/current/warm-standby-failover.html',
          source: 'PostgreSQL',
          note: 'Langkah resmi mengangkat follower menjadi leader.',
        },
      ),
    ],
  ),

  written(
    'golden-signal-slo',
    'Golden Signal, SLO, dan Error Budget',
    12,
    'Empat angka yang cukup untuk mengetahui sistem sehat atau tidak, dan cara memakainya.',
    [
      p(
        'Kategori Deployment sudah memasang perkakas pemantauan, pelacakan error, dan log terpusat. Sub-bab ini menjawab pertanyaan yang tidak dijawab di sana, yaitu dari sekian banyak angka yang bisa diukur, **angka mana yang benar-benar perlu dilihat** dan pada angka berapa seseorang harus dibangunkan.',
      ),
      p(
        'Jawabannya jauh lebih sedikit daripada yang biasanya dipasang. Empat angka per layanan sudah cukup untuk mengetahui ada masalah, dan sisanya berguna untuk mencari tahu masalahnya di mana.',
      ),

      terms(
        {
          term: 'empat golden signal',
          meaning:
            'Empat besaran yang bila dipantau bersama cukup untuk mengetahui sebuah layanan sehat atau tidak, yaitu latensi, lalu lintas, kesalahan, dan kejenuhan. Berasal dari praktik rekayasa keandalan di Google, dan dipakai luas karena empat angka jauh lebih mungkin benar-benar dilihat daripada empat puluh.',
        },
        {
          term: 'latency (latensi)',
          meaning:
            'Lama sebuah permintaan dilayani, dilaporkan sebagai persentil. Satu catatan penting, yaitu latensi permintaan yang **gagal** harus dipisahkan dari yang berhasil, karena kegagalan yang sangat cepat bisa membuat angka keseluruhan terlihat membaik padahal keadaannya memburuk.',
        },
        {
          term: 'traffic (lalu lintas)',
          meaning:
            'Banyaknya permintaan per satuan waktu, biasanya QPS. Berguna bukan hanya untuk kapasitas, tetapi juga sebagai penanda masalah, karena lalu lintas yang tiba-tiba nol biasanya berarti ada yang rusak di depan sistemmu.',
        },
        {
          term: 'errors',
          meaning:
            'Bagian permintaan yang gagal. Perlu mencakup kegagalan yang tidak terlihat sebagai kode status, misalnya permintaan yang menjawab 200 tetapi isinya salah, atau yang melewati timeout di sisi klien.',
        },
        {
          term: 'saturation',
          meaning:
            'Seberapa penuh sumber daya yang paling terbatas, misalnya memori, sambungan basis data, atau kedalaman antrean. Dibaca "seturasyen". Ini satu-satunya golden signal yang bersifat **meramalkan**, karena kejenuhan naik lebih dulu sebelum latensi dan kesalahan ikut naik.',
        },
        {
          term: 'metrics, logs, dan traces',
          meaning:
            'Tiga bentuk data pengamatan. Metrik adalah angka sepanjang waktu, murah disimpan, dan menjawab "apakah ada masalah". Log adalah catatan peristiwa, dan menjawab "apa yang terjadi". Jejak adalah perjalanan satu permintaan melintasi komponen, dan menjawab "di mana waktunya habis".',
        },
        {
          term: 'alert on symptoms',
          meaning:
            'Prinsip membangunkan orang berdasarkan hal yang dirasakan pengguna, bukan berdasarkan penyebab yang dicurigai. Prosesor 90 persen bukan gejala karena pengguna tidak merasakannya. Latensi P99 di atas dua detik adalah gejala.',
        },
        {
          term: 'alert fatigue',
          meaning:
            'Keadaan ketika alert terlalu sering muncul sehingga tidak lagi diperhatikan. Sistem dengan lima puluh alert yang sering berbunyi palsu justru lebih buruk daripada sistem dengan lima alert yang selalu berarti, karena alert yang diabaikan sama saja dengan tidak ada alert.',
        },
      ),

      h2('Empat angka per layanan'),
      table(
        ['Sinyal', 'Yang diukur', 'Contoh ambang alert'],
        [
          [
            'Latensi',
            'P50, P95, P99 untuk yang berhasil dan yang gagal terpisah',
            'P99 di atas 2 detik selama 5 menit',
          ],
          [
            'Lalu lintas',
            'Permintaan per detik per endpoint',
            'Turun di bawah 20 persen dari biasanya',
          ],
          [
            'Kesalahan',
            'Persentase 5xx, dan timeout di sisi klien',
            'Di atas 1 persen selama 5 menit',
          ],
          [
            'Kejenuhan',
            'Memori, sambungan basis data, kedalaman antrean',
            'Sambungan di atas 80 persen selama 10 menit',
          ],
        ],
      ),
      p(
        'Baris kedua sering dianggap tidak perlu diberi alert, padahal lalu lintas yang **turun** adalah sinyal masalah yang sangat kuat. Kalau QPS mendadak menjadi nol, sistemmu mungkin terlihat sangat sehat dari dalam, karena memang tidak ada yang perlu dikerjakan. Masalahnya berada di DNS, di load balancer, atau di CDN, dan tidak ada satu pun angka internal yang akan memberitahumu.',
      ),
      code(
        'js',
        `
        // Instrumentasi empat sinyal pada satu middleware Express.
        import { Counter, Histogram, Gauge } from 'prom-client';

        const durasi = new Histogram({
          name: 'http_request_duration_seconds',
          help: 'Lama permintaan HTTP dalam detik',
          labelNames: ['metode', 'rute', 'status'],
          // Bucket dipilih agar mencakup rentang yang benar-benar terjadi.
          buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        });

        const sambunganDipakai = new Gauge({
          name: 'db_pool_connections_used',
          help: 'Sambungan basis data yang sedang dipakai',
        });

        app.use((req, res, next) => {
          const selesai = durasi.startTimer();
          res.on('finish', () => {
            // req.route.path, bukan req.path: /produk/:id bukan /produk/12345.
            // Tanpa ini, jumlah label meledak dan Prometheus ikut kewalahan.
            const rute = req.route?.path ?? 'tidak_dikenal';
            selesai({ metode: req.method, rute, status: res.statusCode });
          });
          next();
        });

        setInterval(() => {
          sambunganDipakai.set(pool.totalCount - pool.idleCount);
        }, 5_000).unref();
        `,
        {
          caption:
            'Satu histogram sudah memberi latensi, lalu lintas, dan kesalahan sekaligus, karena statusnya menjadi label.',
        },
      ),
      callout(
        'danger',
        'Label dengan nilai tak terbatas akan merusak sistem pemantauanmu',
        'Memakai `req.path` alih-alih `req.route.path` berarti setiap id produk menjadi deret metrik tersendiri. Sejuta produk berarti sejuta deret, dan sistem pemantauannya akan kehabisan memori. Aturannya, label hanya boleh berisi nilai yang jumlahnya terbatas dan diketahui, yaitu nama rute, metode, dan kode status. Id, alamat email, dan alamat IP tidak boleh menjadi label.',
      ),

      h2('Dari sinyal menjadi SLO'),
      p(
        'Empat sinyal memberi tahu keadaan sekarang. SLO mengubahnya menjadi target yang bisa dinilai lulus atau tidak, dan istilahnya sudah diperkenalkan di sub-bab [kebutuhan fungsional dan non-fungsional](/kelas/system-design/fondasi-sistem/kebutuhan-fungsional-nonfungsional).',
      ),
      steps(
        {
          title: 'Pilih SLI, yaitu apa yang diukur',
          body: 'Contohnya persentase permintaan yang menjawab bukan 5xx dalam waktu di bawah 500 milidetik. Perhatikan definisinya menggabungkan kebenaran dan kecepatan, karena permintaan yang benar tetapi sangat lambat tetap gagal bagi pengguna.',
        },
        {
          title: 'Tetapkan SLO, yaitu targetnya',
          body: 'Contohnya 99,9 persen dalam periode 30 hari bergulir. Pilih angka yang bisa dicapai susunan yang kamu punya, bukan angka yang terdengar meyakinkan.',
        },
        {
          title: 'Hitung error budget',
          body: 'Selisih antara seratus persen dan SLO, dikalikan periodenya. SLO 99,9 persen berarti sekitar 43 menit per bulan.',
        },
        {
          title: 'Beri alert berdasarkan laju pemakaian jatah',
          body: 'Bukan berdasarkan pelanggaran sesaat. Ini bagian yang membedakan pemantauan yang berguna dari pemantauan yang berisik.',
        },
      ),
      p(
        'Langkah keempat layak dijelaskan karena ia mengubah cara alert dipasang. Alert yang berbunyi setiap kali laju kesalahan melewati satu persen akan berbunyi terus untuk lonjakan sesaat yang pulih sendiri. Alert atas laju pemakaian jatah bertanya hal yang berbeda, yaitu **seberapa cepat jatah bulanan ini sedang habis**.',
      ),
      code(
        'text',
        `
        SLO 99,9 persen per 30 hari  ->  jatah kesalahan 0,1 persen

        Laju pemakaian = laju kesalahan sekarang / 0,001

        Laju 1   : jatah habis tepat dalam 30 hari. Normal.
        Laju 14,4: jatah habis dalam ~2 hari.  Bangunkan orang.
        Laju 6   : jatah habis dalam ~5 hari.  Buat tiket, jangan bangunkan.
        Laju 0,5 : jatah terpakai separuh. Aman, boleh merilis dengan agresif.
        `,
      ),
      code(
        'yaml',
        `
        groups:
          - name: slo-api
            rules:
              # Cepat: 2 persen jatah habis dalam 1 jam. Bangunkan.
              - alert: JatahErrorHabisCepat
                expr: |
                  (
                    sum(rate(http_request_duration_seconds_count{status=~"5.."}[1h]))
                    / sum(rate(http_request_duration_seconds_count[1h]))
                  ) > (14.4 * 0.001)
                for: 2m
                labels:
                  severity: page
                annotations:
                  summary: "Jatah error habis 14x lebih cepat dari seharusnya"
                  runbook: "https://wiki.internal/runbook/api-error-rate"

              # Lambat: pemakaian tinggi tapi tidak mendesak. Buat tiket.
              - alert: JatahErrorHabisPelan
                expr: |
                  (
                    sum(rate(http_request_duration_seconds_count{status=~"5.."}[6h]))
                    / sum(rate(http_request_duration_seconds_count[6h]))
                  ) > (6 * 0.001)
                for: 15m
                labels:
                  severity: ticket
        `,
        {
          filename: 'alerts.yml',
          caption: 'Dua tingkat kecepatan pemakaian, dua tingkat tanggapan.',
        },
      ),
      p(
        'Bidang `runbook` pada alert pertama bukan hiasan. Orang yang dibangunkan pukul tiga pagi butuh langkah yang bisa diikuti, bukan sekadar pemberitahuan bahwa ada masalah. Alert tanpa runbook akan berujung pada seseorang yang membuka dasbor sambil mengantuk dan menebak.',
      ),

      h2('Memakai error budget sebagai keputusan'),
      p(
        'Gagasan yang mengubah cara tim bekerja, yaitu jatah kesalahan itu **boleh dibelanjakan**. Selama masih ada jatah, merilis dengan agresif adalah keputusan yang rasional, karena risiko yang diambil masih terbayar.',
      ),
      table(
        ['Sisa jatah', 'Yang boleh dilakukan', 'Yang tidak'],
        [
          ['Di atas 50 persen', 'Rilis normal, eksperimen, migrasi besar', ''],
          [
            '20 sampai 50 persen',
            'Rilis normal dengan kanari lebih lama',
            'Migrasi besar yang berisiko',
          ],
          ['Di bawah 20 persen', 'Perbaikan bug dan pekerjaan keandalan', 'Fitur baru'],
          ['Habis', 'Hanya perbaikan keandalan', 'Semua rilis fitur, sampai periode berikutnya'],
        ],
      ),
      p(
        'Kerangka ini menghilangkan perdebatan yang biasanya tidak berujung antara pihak yang ingin cepat merilis dan pihak yang ingin aman, karena keduanya sekarang membaca angka yang sama. Perdebatannya berpindah dari selera menjadi data.',
      ),
      callout(
        'warning',
        'SLO yang tidak pernah dilanggar biasanya terlalu longgar',
        'Kalau jatah kesalahanmu tidak pernah terpakai sama sekali selama enam bulan, itu bukan tanda keunggulan melainkan tanda targetnya terlalu rendah, atau tanda kamu terlalu berhati-hati sampai merugikan kecepatan pengembangan. SLO yang sehat sesekali tertekan, dan sesekali membuat tim menunda rilis.',
      ),

      h2('Log dan jejak, untuk mencari tahu di mana'),
      p(
        'Metrik memberi tahu ada masalah. Log dan jejak memberi tahu masalahnya di mana, dan keduanya hanya berguna bila punya satu hal yang sama, yaitu penanda yang menghubungkan seluruh catatan dari satu permintaan.',
      ),
      code(
        'js',
        `
        import { randomUUID } from 'node:crypto';
        import { AsyncLocalStorage } from 'node:async_hooks';

        const konteks = new AsyncLocalStorage();

        app.use((req, res, next) => {
          // Hormati penanda dari hulu bila ada, agar jejaknya menyambung.
          const traceId = req.get('x-trace-id') ?? randomUUID();
          res.setHeader('x-trace-id', traceId);
          konteks.run({ traceId }, next);
        });

        // Semua log otomatis membawa penandanya.
        function catat(level, pesan, data = {}) {
          const { traceId } = konteks.getStore() ?? {};
          logger[level]({ traceId, ...data }, pesan);
        }

        // Diteruskan ke setiap panggilan keluar, sehingga jejaknya utuh lintas layanan.
        async function panggilLayananLain(alamat, opsi = {}) {
          const { traceId } = konteks.getStore() ?? {};
          return fetch(alamat, {
            ...opsi,
            headers: { ...opsi.headers, 'x-trace-id': traceId },
          });
        }
        `,
        {
          caption:
            'Tanpa penanda ini, mencari penyebab sebuah permintaan lambat berarti membaca log secara manual.',
        },
      ),
      p(
        'Penerusan penanda ke panggilan keluar adalah bagian yang paling sering terlewat, dan justru bagian itulah yang membuat jejak berguna pada sistem dengan lebih dari satu layanan. Bila penandanya berhenti di batas layanan, kamu punya dua kumpulan log yang tidak bisa dihubungkan.',
      ),
      p(
        'Untuk mengukur di mana waktu sebuah permintaan habis, jejak terdistribusi menambahkan satu lapis lagi di atas ini. Standar terbukanya adalah OpenTelemetry, dan library untuk Node.js maupun PHP tersedia resmi. Untuk aplikasi dengan satu layanan, penanda pada log sudah menjawab sebagian besar kebutuhan, dan jejak penuh baru sepadan ketika permintaan melintasi beberapa layanan.',
      ),

      h2('Berapa banyak alert yang wajar'),
      p(
        'Jawabannya jauh lebih sedikit daripada yang biasanya dipasang. Aturan yang bisa dipakai, yaitu setiap alert yang bisa membangunkan orang harus memenuhi tiga syarat sekaligus.',
      ),
      ol(
        '**Ada pengguna yang benar-benar terdampak sekarang**, bukan sekadar angka internal yang tinggi',
        '**Ada tindakan yang bisa diambil sekarang juga**, bukan sesuatu yang hanya bisa dikerjakan besok pagi',
        '**Tidak akan pulih sendiri dalam beberapa menit**, sehingga membangunkan orang memang lebih baik daripada menunggu',
      ),
      table(
        ['Alert', 'Lolos tiga syarat?', 'Sebaiknya'],
        [
          [
            'Prosesor di atas 90 persen',
            'Tidak, pengguna belum tentu terdampak',
            'Jadikan dasbor, bukan alert',
          ],
          ['Laju 5xx di atas 5 persen', 'Ya', 'Bangunkan'],
          [
            'Disk sisa 10 persen',
            'Ya, karena penuh berarti mati total',
            'Bangunkan, tetapi jauh sebelum penuh',
          ],
          [
            'Satu pekerjaan antrean gagal',
            'Tidak, akan dicoba ulang',
            'Alert bila DLQ bertambah cepat',
          ],
          ['Keterlambatan replika di atas 30 detik', 'Ya, pembacaan menjadi salah', 'Bangunkan'],
          [
            'Sertifikat kedaluwarsa dalam 7 hari',
            'Tidak mendesak malam ini',
            'Buat tiket, bangunkan bila tinggal 1 hari',
          ],
        ],
      ),

      references(
        {
          label: 'Monitoring Distributed Systems',
          href: 'https://sre.google/sre-book/monitoring-distributed-systems/',
          source: 'Google SRE',
          note: 'Sumber asli empat golden signal beserta alasan memilih hanya empat.',
        },
        {
          label: 'Alerting on SLOs',
          href: 'https://sre.google/workbook/alerting-on-slos/',
          source: 'Google SRE',
          note: 'Alert atas laju pemakaian jatah, termasuk angka 14,4 dan 6 yang dipakai di sub-bab ini.',
        },
        {
          label: 'Prometheus: Alerting Rules',
          href: 'https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/',
          source: 'Prometheus',
          note: 'Bentuk berkas aturan alert yang dicontohkan di sub-bab ini.',
        },
        {
          label: 'Prometheus: Instrumentation best practices',
          href: 'https://prometheus.io/docs/practices/instrumentation/',
          source: 'Prometheus',
          note: 'Termasuk peringatan resmi soal label dengan nilai tak terbatas.',
        },
        {
          label: 'OpenTelemetry: JavaScript',
          href: 'https://opentelemetry.io/docs/languages/js/',
          source: 'OpenTelemetry',
          note: 'Standar terbuka untuk jejak terdistribusi pada Node.js.',
        },
      ),
    ],
  ),
  written(
    'autoscaling',
    'Autoscaling dan Batasnya',
    12,
    'Menambah dan mengurangi mesin otomatis, beserta tiga hal yang tidak bisa diskalakan begitu saja.',
    [
      p(
        'Penskalaan otomatis menjanjikan hal yang menarik, yaitu kapasitas mengikuti beban dengan sendirinya sehingga tidak ada mesin yang menganggur dan tidak ada lonjakan yang tidak tertampung. Janji itu benar untuk sebagian komponen dan menyesatkan untuk sebagian lain.',
      ),
      p(
        'Sub-bab ini membahas apa yang bisa diskalakan otomatis, ukuran apa yang benar untuk memicunya, dan tiga hal yang justru menjadi lebih buruk ketika mesin di depannya bertambah.',
      ),

      terms(
        {
          term: 'autoscaling',
          meaning:
            'Menambah atau mengurangi jumlah salinan sebuah komponen secara otomatis berdasarkan ukuran tertentu. Dibaca "otoskeiling". Ada dua bentuk, yaitu menambah jumlah salinan yang disebut horizontal, dan memperbesar salinan yang ada yang disebut vertikal.',
        },
        {
          term: 'scale-up dan scale-down threshold',
          meaning:
            'Dua angka yang memicu penambahan dan pengurangan salinan. Keduanya sengaja dibuat berjauhan, misalnya naik di 70 persen dan turun di 30 persen, agar sistem tidak terus-menerus naik turun di sekitar satu angka.',
        },
        {
          term: 'flapping',
          meaning:
            'Keadaan ketika sistem terus menambah lalu mengurangi salinan dalam waktu singkat. Dibaca "fleping". Disebabkan ambang naik dan turun yang terlalu berdekatan atau cooldown yang terlalu pendek, dan akibatnya beban justru bertambah karena setiap salinan baru butuh waktu untuk siap.',
        },
        {
          term: 'cooldown',
          meaning:
            'Waktu tunggu sesudah satu tindakan penskalaan sebelum tindakan berikutnya boleh diambil. Tujuannya memberi kesempatan bagi tindakan sebelumnya untuk berpengaruh sebelum sistem menilai ulang.',
        },
        {
          term: 'warm-up',
          meaning:
            'Lama waktu sejak sebuah salinan baru dimulai sampai benar-benar siap melayani, yaitu setelah proses hidup, sambungan terbentuk, dan cache di dalam prosesnya terisi. Angka ini menentukan seberapa cepat autoscaling bisa menjawab lonjakan, dan sering jauh lebih lama daripada yang diduga.',
        },
        {
          term: 'scheduled scaling',
          meaning:
            'Menambah kapasitas sebelum lonjakan yang sudah diketahui waktunya, misalnya sebelum jam sibuk atau sebelum kampanye penjualan. Sering kali jauh lebih efektif daripada penskalaan reaktif, karena kapasitasnya sudah siap ketika lonjakannya datang.',
        },
      ),

      h2('Apa yang bisa dan tidak bisa diskalakan otomatis'),
      table(
        ['Komponen', 'Bisa otomatis?', 'Catatan'],
        [
          ['Server aplikasi stateless', 'Ya', 'Kasus paling ideal, asalkan benar-benar stateless'],
          [
            'Worker antrean',
            'Ya',
            'Bahkan bisa turun sampai nol untuk antrean yang jarang terpakai',
          ],
          [
            'Simpul cache',
            'Terbatas',
            'Menambah simpul memindahkan kunci, jadi pakai consistent hashing',
          ],
          ['Replika baca basis data', 'Terbatas', 'Butuh waktu lama untuk menyalin data awal'],
          [
            'Leader basis data',
            '**Tidak**',
            'Hanya boleh ada satu, dan mengubahnya adalah perpindahan',
          ],
          [
            'Layanan sambungan realtime',
            'Terbatas',
            'Menambah simpul tidak memindahkan sambungan yang sudah ada',
          ],
        ],
      ),
      p(
        'Baris keempat sering mengejutkan. Menambah replika baca berarti menyalin seluruh basis data ke mesin baru lebih dulu, dan untuk basis data berukuran ratusan gigabita itu bisa memakan puluhan menit sampai jam. Lonjakan lalu lintas tidak akan menunggu selama itu, sehingga replika baca sebaiknya disediakan lebih dulu, bukan ditambahkan saat dibutuhkan.',
      ),

      h2('Memilih ukuran pemicu'),
      p(
        'Prosesor adalah ukuran bawaan pada hampir semua layanan, dan prosesor sering bukan ukuran yang benar. Yang benar adalah ukuran yang paling dekat dengan apa yang sebenarnya menjadi batas.',
      ),
      table(
        ['Jenis beban', 'Ukuran yang tepat', 'Kenapa bukan prosesor'],
        [
          ['Pemrosesan berat', 'Prosesor', 'Di sini prosesor memang benar'],
          [
            'Banyak menunggu jaringan',
            'Jumlah permintaan berjalan bersamaan',
            'Prosesor rendah padahal sudah penuh menunggu',
          ],
          [
            'Worker antrean',
            'Kedalaman antrean atau usia pesan tertua',
            'Worker menganggur saat antrean kosong',
          ],
          [
            'Sambungan realtime',
            'Jumlah sambungan terbuka per salinan',
            'Sambungan menganggur hampir tidak memakan prosesor',
          ],
          [
            'Terbatas memori',
            'Pemakaian memori',
            'Kehabisan memori terjadi saat prosesor masih rendah',
          ],
        ],
      ),
      p(
        'Baris kedua adalah kasus yang paling sering salah disetel pada aplikasi Node.js dan PHP yang banyak memanggil layanan luar. Prosesornya bertahan di dua puluh persen sementara setiap salinan sudah menahan ratusan permintaan yang sedang menunggu jawaban, dan autoscaling berbasis prosesor tidak akan pernah menambah kapasitas sampai sistemnya tersendat.',
      ),
      code(
        'yaml',
        `
        apiVersion: autoscaling/v2
        kind: HorizontalPodAutoscaler
        metadata:
          name: worker-antrean
        spec:
          scaleTargetRef:
            apiVersion: apps/v1
            kind: Deployment
            name: worker-antrean
          minReplicas: 1
          maxReplicas: 30
          metrics:
            # Ukuran yang benar untuk worker: berapa banyak yang menunggu,
            # bukan berapa sibuk prosesornya.
            - type: External
              external:
                metric:
                  name: bullmq_queue_waiting
                  selector:
                    matchLabels:
                      queue: pengolahan-gambar
                target:
                  type: AverageValue
                  averageValue: "50"   # sasaran 50 pesan menunggu per worker
          behavior:
            scaleUp:
              stabilizationWindowSeconds: 30    # naik cepat
              policies:
                - type: Percent
                  value: 100
                  periodSeconds: 60
            scaleDown:
              stabilizationWindowSeconds: 300   # turun pelan
              policies:
                - type: Percent
                  value: 25
                  periodSeconds: 60
        `,
        {
          filename: 'hpa-worker.yaml',
          caption: 'Naik cepat dan turun pelan adalah bentuk yang hampir selalu benar.',
        },
      ),
      p(
        'Ketidaksimetrisan pada bagian `behavior` itu disengaja. Terlambat menambah kapasitas berarti pengguna menunggu, sedangkan terlalu cepat mengurangi kapasitas berarti kamu kembali kekurangan beberapa menit kemudian. Karena kerugiannya tidak setara, tanggapannya juga tidak boleh setara.',
      ),
      callout(
        'warning',
        'Selalu tetapkan batas maksimum',
        'Tanpa `maxReplicas`, sebuah bug yang menghasilkan pesan tanpa henti atau serangan yang membanjiri sistem akan membuat penskalaan berjalan tanpa batas, dan yang habis pertama kali biasanya bukan kapasitasnya melainkan anggarannya. Batas maksimum juga melindungi basis data, karena seratus salinan aplikasi akan mencoba membuka sambungan seratus kali lipat.',
      ),

      h2('Warm-up menentukan seberapa berguna autoscaling'),
      p(
        'Autoscaling menjawab lonjakan hanya bila salinan barunya siap sebelum lonjakannya berlalu. Perhitungan berikut sering mengubah kesimpulan.',
      ),
      code(
        'text',
        `
        Deteksi beban tinggi           30 detik  (selang pengumpulan metrik)
        Keputusan menambah salinan     15 detik
        Mengambil image container      45 detik
        Proses mulai dan siap          20 detik
        Sambungan basis data terbentuk 10 detik
        Cache di dalam proses terisi   60 detik
        --------------------------------------
        Total                        ~3 menit

        Lonjakan yang berlangsung 2 menit sudah berlalu sebelum kapasitasnya siap.
        `,
      ),
      p('Ada tiga jawaban, dan ketiganya bisa dipakai bersama.'),
      ol(
        '**Sediakan kelebihan kapasitas tetap.** Jalankan dengan pemakaian sekitar 50 sampai 60 persen sehingga ada ruang untuk lonjakan mendadak.',
        '**Pakai scheduled scaling untuk lonjakan yang bisa diramalkan.** Kampanye penjualan, jam sibuk harian, dan pengiriman pemberitahuan massal semuanya diketahui waktunya.',
        '**Perpendek warm-up.** Image container yang lebih kecil, pemuatan yang ditunda, dan pemanasan cache yang berjalan sebelum menyatakan siap.',
      ),
      p(
        'Angka enam puluh detik pada baris pemanasan cache di atas menyambung ke sub-bab [ketika cache justru jadi masalah](/kelas/system-design/blok-penyusun/masalah-cache). Salinan baru yang langsung menerima lalu lintas dengan cold cache akan menekan basis data, dan menekan basis data justru pada saat sistem sedang kewalahan adalah cara yang efektif untuk memperburuk keadaan.',
      ),

      h2('Tiga hal yang memburuk ketika salinan bertambah'),
      p(
        'Ini bagian terpenting sub-bab ini. Menambah mesin aplikasi tidak selalu menambah kapasitas total, karena ada tiga hal yang justru menerima tekanan lebih besar.',
      ),
      h2('Pertama, sambungan basis data'),
      code(
        'text',
        `
        10 salinan x 20 sambungan  = 200 sambungan
        50 salinan x 20 sambungan  = 1.000 sambungan

        Batas max_connections PostgreSQL: 100 sampai 500 pada susunan yang lazim.

        Basis data menolak sambungan baru, dan seluruh salinan gagal sekaligus.
        `,
      ),
      p(
        'Jawabannya adalah pooler seperti yang dibahas di sub-bab [naik kelas atau menambah mesin](/kelas/system-design/skala-data/naik-kelas-atau-menambah-mesin), atau memperkecil ukuran kolam per salinan. Yang jelas, `maxReplicas` harus dipilih dengan mengingat batas sambungan basis datanya, bukan hanya kapasitas prosesornya.',
      ),
      h2('Kedua, layanan pihak ketiga'),
      p(
        'Menggandakan salinan berarti menggandakan laju panggilan ke layanan luar, dan layanan luar biasanya punya batas laju. Autoscaling yang tidak menyadari batas itu akan mengubah lonjakan lalu lintas menjadi banjir kode 429 dari mitramu.',
      ),
      h2('Ketiga, cache di dalam proses'),
      p(
        'Cache dalam memori proses yang dibahas di sub-bab masalah cache menjadi kurang efektif seiring bertambahnya salinan, karena tiap salinan mengisi cachenya sendiri dari nol. Dengan lima salinan, satu hot key diambil lima kali. Dengan lima puluh salinan, ia diambil lima puluh kali.',
      ),
      callout(
        'tip',
        'Skalakan seluruh lapisan, bukan hanya yang paling terlihat',
        'Menambah kapasitas aplikasi tanpa memeriksa basis data, cache, dan ketergantungan luar hanya memindahkan bottleneck-nya satu lapisan ke dalam, dan lapisan yang lebih dalam biasanya jauh lebih sulit diperbesar dengan cepat. Sebelum menaikkan `maxReplicas`, hitung apa yang terjadi pada setiap lapisan di belakangnya pada angka maksimum itu.',
      ),

      h2('Turun sampai nol'),
      p(
        'Untuk worker antrean, penskalaan sampai nol salinan adalah pilihan yang menarik karena antrean yang jarang terpakai tidak perlu membayar mesin yang menganggur. Ada satu syarat penting, yaitu ukuran pemicunya harus berasal dari luar salinan itu sendiri.',
      ),
      code(
        'text',
        `
        BENAR
        Ukuran: kedalaman antrean, dibaca dari Redis oleh pengumpul metrik.
        Nol worker -> antrean bertambah -> ukuran naik -> worker dinyalakan.

        SALAH
        Ukuran: prosesor worker.
        Nol worker -> tidak ada prosesor untuk diukur -> tidak pernah menyala lagi.
        `,
      ),
      p(
        'Untuk server aplikasi yang melayani pengguna, turun sampai nol hampir selalu keputusan yang salah, karena permintaan pertama sesudahnya harus menunggu seluruh warm-up. Yang wajar adalah minimal dua salinan, sesuai alasan redundansi pada sub-bab [single point of failure](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal).',
      ),

      h2('Ringkasan pengaturan yang wajar'),
      table(
        ['Pengaturan', 'Nilai yang wajar', 'Alasan'],
        [
          [
            'Minimum salinan',
            '2 untuk aplikasi, 0 boleh untuk worker',
            'Redundansi, kecuali bila menunggu boleh',
          ],
          [
            'Maksimum salinan',
            'Dihitung dari batas lapisan di belakangnya',
            'Melindungi basis data dan anggaran',
          ],
          ['Sasaran pemakaian', '50 sampai 70 persen', 'Menyisakan ruang untuk warm-up'],
          ['Jendela naik', '30 sampai 60 detik', 'Menjawab lonjakan dengan cepat'],
          ['Jendela turun', '300 detik atau lebih', 'Mencegah ayunan'],
          ['Langkah naik', 'Sampai 100 persen per menit', 'Bisa menggandakan cepat bila perlu'],
          ['Langkah turun', '10 sampai 25 persen per menit', 'Turun perlahan dan aman'],
        ],
      ),

      references(
        {
          label: 'Kubernetes: Horizontal Pod Autoscaling',
          href: 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/',
          source: 'Kubernetes',
          note: 'Termasuk bagian `behavior` yang mengatur kecepatan naik dan turun.',
        },
        {
          label: 'Kubernetes: Resource Metrics Pipeline',
          href: 'https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/',
          source: 'Kubernetes',
          note: 'Dari mana ukuran pemicu berasal, termasuk metrik di luar prosesor.',
        },
        {
          label: 'PostgreSQL: Connection Settings',
          href: 'https://www.postgresql.org/docs/current/runtime-config-connection.html',
          source: 'PostgreSQL',
          note: 'Batas `max_connections` yang membatasi jumlah maksimum salinan aplikasi.',
        },
        {
          label: 'Site Reliability Engineering: Handling Overload',
          href: 'https://sre.google/sre-book/handling-overload/',
          source: 'Google SRE',
          note: 'Apa yang harus dilakukan ketika menambah kapasitas bukan jawabannya.',
        },
      ),
    ],
  ),

  written(
    'pemulihan-bencana',
    'RPO, RTO, dan Redundansi Antar-Wilayah',
    12,
    'Dua angka yang menentukan strategi cadangan, dan pertanyaan apakah butuh wilayah kedua.',
    [
      p(
        'Sub-bab [backup dan restore](/kelas/deployment/setelah-rilis/backup-restore) sudah membahas cara mencadangkan dan cara memulihkan. Sub-bab ini menjawab pertanyaan yang mendahului keduanya, yaitu **seberapa sering** harus mencadangkan dan **seberapa cepat** harus bisa pulih.',
      ),
      p(
        'Kedua pertanyaan itu punya jawaban berupa angka, dan angka itulah yang menentukan strategi mana yang pantas dibayar. Tanpa keduanya, keputusan pencadangan diambil berdasarkan perasaan, dan perasaan cenderung terlalu longgar sampai terjadi kejadian pertama.',
      ),

      terms(
        {
          term: 'RPO (recovery point objective)',
          meaning:
            'Berapa banyak data yang boleh hilang, dinyatakan dalam satuan waktu. Dibaca "ar-pi-o". RPO satu jam berarti kehilangan sampai satu jam data terakhir masih bisa diterima, dan itu berarti pencadangan harus terjadi setidaknya tiap jam.',
        },
        {
          term: 'RTO (recovery time objective)',
          meaning:
            'Berapa lama sistem boleh mati sebelum pulih, dinyatakan dalam satuan waktu. Dibaca "ar-ti-o". RTO lima belas menit berarti seluruh proses pemulihan, mulai dari menyadari sampai melayani lagi, harus selesai dalam lima belas menit.',
        },
        {
          term: 'point-in-time recovery (PITR)',
          meaning:
            'Kemampuan memulihkan basis data ke keadaannya pada detik tertentu, bukan hanya ke waktu pencadangan terakhir. Disingkat PITR. Bekerja dengan memulihkan cadangan penuh lalu menerapkan WAL sampai titik yang diinginkan, dan inilah yang menurunkan RPO menjadi hitungan detik.',
        },
        {
          term: 'active-passive',
          meaning:
            'Susunan dengan satu wilayah yang melayani seluruh lalu lintas dan satu wilayah cadangan yang menunggu. Lebih sederhana karena hanya ada satu tempat penulisan, dan perpindahannya butuh waktu.',
        },
        {
          term: 'active-active',
          meaning:
            'Susunan dengan beberapa wilayah yang sama-sama melayani lalu lintas. Memberi latensi rendah bagi pengguna di mana pun dan menghilangkan kebutuhan perpindahan, dengan harga sinkronisasi data dan konflik tulis yang harus diselesaikan.',
        },
        {
          term: 'pilot light dan warm standby',
          meaning:
            'Dua tingkat kesiapan wilayah cadangan. Pilot light berarti hanya bagian intinya yang hidup, misalnya basis data yang menerima replikasi, sedangkan sisanya dinyalakan saat dibutuhkan. Warm standby berarti seluruh susunan hidup dalam ukuran kecil dan tinggal diperbesar.',
        },
        {
          term: 'recovery drill',
          meaning:
            'Latihan memulihkan sungguhan dari cadangan, dijalankan berkala. Cadangan yang belum pernah dipulihkan bukan cadangan melainkan asumsi, dan asumsi itu gagal pada saat yang paling tidak tepat.',
        },
      ),

      h2('Menetapkan dua angkanya'),
      p(
        'Keduanya ditetapkan per jenis data, bukan sekali untuk seluruh sistem, karena kerugian kehilangan data sangat berbeda antar jenis.',
      ),
      table(
        ['Data', 'RPO yang wajar', 'RTO yang wajar', 'Alasan'],
        [
          [
            'Transaksi pembayaran',
            'Nol sampai beberapa detik',
            '15 menit',
            'Kehilangan berarti uang dan sengketa',
          ],
          [
            'Akun dan pesanan',
            'Beberapa menit',
            '1 jam',
            'Bisa dipulihkan sebagian dari catatan lain',
          ],
          ['Konten buatan pengguna', '1 jam', '4 jam', 'Menyakitkan, dan tidak berakibat hukum'],
          ['Berkas unggahan', '24 jam', '24 jam', 'Biasanya sudah berlipat di object storage'],
          ['Cache', 'Tak terbatas', 'Nol', 'Boleh hilang seluruhnya, dibangun ulang sendiri'],
          ['Data analitik', '24 jam', '1 minggu', 'Bisa dihitung ulang dari sumbernya'],
        ],
      ),
      p(
        'Baris pertama layak diperhatikan. RPO nol tidak berarti mustahil, melainkan berarti replikasi sinkron pada sub-bab [replikasi](/kelas/system-design/skala-data/replikasi) harus dipakai, karena hanya bentuk itu yang menjamin penulisan sudah ada di lebih dari satu tempat sebelum dinyatakan berhasil.',
      ),

      h2('Empat strategi dan harganya'),
      table(
        ['Strategi', 'RPO', 'RTO', 'Biaya', 'Bagaimana'],
        [
          [
            'Cadangan dan pulihkan',
            'Jam',
            'Jam',
            'Rendah',
            'Cadangan berkala ke object storage, pulihkan saat dibutuhkan',
          ],
          [
            'Pilot light',
            'Menit',
            'Puluhan menit',
            'Menengah',
            'Basis data cadangan menerima replikasi, sisanya menyusul',
          ],
          ['Warm standby', 'Detik', 'Menit', 'Tinggi', 'Seluruh susunan hidup dalam ukuran kecil'],
          [
            'Active-active',
            'Mendekati nol',
            'Mendekati nol',
            'Sangat tinggi',
            'Semua wilayah melayani, tidak ada perpindahan',
          ],
        ],
      ),
      p(
        'Untuk sebagian besar aplikasi, baris pertama atau kedua adalah pilihan yang tepat. Melompat ke baris keempat karena terdengar paling aman berarti membayar biaya berkali-kali lipat sekaligus menerima seluruh kerumitan konflik tulis, dan kerumitan itu sendiri adalah sumber kegagalan baru.',
      ),

      h2('Menurunkan RPO tanpa mengganti strategi'),
      p(
        'Pencadangan penuh tiap hari memberi RPO dua puluh empat jam, dan itu biasanya terlalu longgar. Point-in-time recovery menurunkannya menjadi hitungan detik tanpa mengubah bentuk susunannya sama sekali.',
      ),
      code(
        'text',
        `
        TANPA PITR
        Cadangan penuh tiap hari pukul 02.00.
        Kerusakan pukul 17.00 -> kehilangan 15 jam.

        DENGAN PITR
        Cadangan penuh tiap hari pukul 02.00.
        WAL dikirim terus-menerus ke object storage.
        Kerusakan pukul 17.00 -> pulihkan cadangan 02.00,
        lalu terapkan WAL sampai 16.59.58 -> kehilangan beberapa detik.
        `,
      ),
      p(
        'Manfaat lain PITR yang sering luput adalah kemampuan memulihkan ke titik **sebelum** sebuah kesalahan manusia. Perintah `DELETE` tanpa `WHERE` yang dijalankan pukul 14.32 bisa dijawab dengan memulihkan ke pukul 14.31, dan tanpa PITR jawaban satu-satunya adalah kembali ke cadangan semalam.',
      ),
      code(
        'text',
        `
        # Pengarsipan WAL yang membuat PITR mungkin.
        archive_mode = on
        archive_command = 'aws s3 cp %p s3://cadangan-wal/%f'
        archive_timeout = 60      # paksa berpindah berkas tiap menit
        wal_level = replica
        `,
        {
          filename: 'postgresql.conf',
          caption: 'Nilai archive_timeout inilah yang menentukan batas bawah RPO-mu.',
        },
      ),
      callout(
        'danger',
        'Cadangan yang tidak pernah diuji bukan cadangan',
        'Kegagalan yang paling sering ditemukan saat keadaan darurat bukan ketiadaan cadangan, melainkan cadangan yang ternyata rusak, tidak lengkap, atau tidak bisa dibaca versi basis data yang sekarang. Jadwalkan pemulihan sungguhan ke lingkungan terpisah setidaknya sebulan sekali, dan catat berapa lama benar-benar butuh waktu. Angka itulah RTO-mu yang sebenarnya, bukan angka yang kamu tuliskan di dokumen.',
      ),

      h2('Aturan tiga dua satu'),
      p(
        'Aturan lama yang tetap berlaku, yaitu tiga salinan, pada dua jenis media atau dua tempat berbeda, dengan satu di antaranya berada di lokasi terpisah.',
      ),
      table(
        ['Salinan', 'Di mana', 'Melindungi dari'],
        [
          ['Basis data utama', 'Wilayah utama', 'Tidak ada, ini yang dilindungi'],
          ['Replika', 'Zona lain di wilayah yang sama', 'Kerusakan mesin dan zona'],
          [
            'Cadangan',
            'Object storage di wilayah lain',
            'Kerusakan seluruh wilayah, dan kesalahan manusia',
          ],
        ],
      ),
      p(
        'Kolom kanan pada baris ketiga menyebut dua hal, dan yang kedua lebih sering terjadi. Replika **tidak** melindungi dari kesalahan manusia, karena perintah `DELETE` yang salah akan ikut tersalin ke seluruh replika dalam hitungan milidetik. Hanya cadangan yang bisa dikembalikan ke titik sebelum kesalahannya.',
      ),
      p(
        'Cadangan juga harus terlindung dari penghapusan. Kredensial yang bocor dan bisa menghapus cadangan berarti cadangannya ikut hilang bersama datanya, dan itu skenario yang benar-benar terjadi pada beberapa insiden nyata. Aktifkan penguncian objek atau kebijakan penyimpanan yang tidak bisa dibatalkan oleh kredensial aplikasi.',
      ),

      h2('Apakah butuh wilayah kedua'),
      p(
        'Pertanyaan ini punya jawaban yang jauh lebih sering "tidak" daripada yang diduga. Empat pertanyaan berikut membantu memutuskannya.',
      ),
      ol(
        '**Berapa kerugian per jam bila seluruh wilayah padam?** Kalikan dengan peluangnya, yaitu kejadian yang biasanya beberapa jam per tahun.',
        '**Apakah ada kewajiban hukum yang mengharuskan data berada di wilayah tertentu?** Bila ya, itu keputusan yang sudah diambil untukmu.',
        '**Apakah penggunamu tersebar di beberapa benua?** Bila ya, wilayah kedua memberi manfaat latensi harian, bukan hanya perlindungan bencana.',
        '**Apakah timmu sanggup mengoperasikannya?** Dua wilayah berarti dua kali lipat pekerjaan pemantauan, rilis, dan penelusuran masalah.',
      ),
      p(
        'Bagi sebagian besar aplikasi, jawaban yang seimbang adalah satu wilayah dengan beberapa zona ketersediaan, ditambah cadangan yang tersimpan di wilayah lain. Susunan itu tahan terhadap kerusakan mesin dan zona, dan tetap bisa pulih dari kerusakan wilayah dalam hitungan jam.',
      ),
      compare(
        {
          title: 'Active-passive',
          lang: 'text',
          code: `
            WILAYAH A (aktif)          WILAYAH B (pasif)
            aplikasi x3                aplikasi x0
            basis data leader  --WAL-> basis data follower
            cache                      cache kosong

            Perpindahan:
            1. Putuskan wilayah A benar-benar hilang
            2. Angkat follower B menjadi leader
            3. Nyalakan aplikasi di B
            4. Arahkan DNS ke B
            Perkiraan: 15 sampai 45 menit
          `,
          notes: [
            'Satu tempat penulisan, tidak ada konflik',
            'Biaya wilayah pasif jauh lebih kecil',
            'Perpindahan butuh waktu dan harus dilatih',
          ],
        },
        {
          title: 'Active-active',
          lang: 'text',
          code: `
            WILAYAH A (aktif)          WILAYAH B (aktif)
            aplikasi x3                aplikasi x3
            basis data <--replikasi dua arah--> basis data
            cache                      cache

            Perpindahan:
            1. Tidak ada. Lalu lintas dialihkan otomatis.
            Perkiraan: hitungan detik
          `,
          notes: [
            'Latensi rendah untuk pengguna di kedua wilayah',
            'Konflik tulis harus diselesaikan',
            'Biaya penuh di kedua wilayah',
            'Jauh lebih rumit dioperasikan',
          ],
        },
      ),

      h2('Rencana pemulihan yang benar-benar bisa dijalankan'),
      p(
        'Dokumen rencana pemulihan berguna hanya bila bisa diikuti orang yang sedang panik pada pukul tiga pagi. Ciri dokumen seperti itu adalah berisi perintah yang bisa disalin, bukan penjelasan.',
      ),
      code(
        'text',
        `
        PEMULIHAN: BASIS DATA UTAMA HILANG

        PRASYARAT
        - Akses ke bucket cadangan: s3://cadangan-db-prod
        - Kredensial di 1Password, entri "DB Recovery"
        - Saluran koordinasi: #insiden

        LANGKAH
        1. Umumkan di #insiden. Sebutkan waktu mulai.
        2. Pastikan leader lama benar-benar tidak menerima tulis:
             <perintah pemutus jaringan atau pemadaman>
        3. Cari cadangan terbaru:
             aws s3 ls s3://cadangan-db-prod/base/ | tail -5
        4. Pulihkan ke instance baru:
             <perintah lengkap yang bisa disalin>
        5. Terapkan WAL sampai titik yang diinginkan:
             recovery_target_time = '2026-08-25 14:31:00'
        6. Verifikasi sebelum mengalihkan lalu lintas:
             SELECT count(*) FROM pesanan WHERE dibuat_pada > now() - interval '1 hour';
             Bandingkan dengan angka dari pemantauan sebelum insiden.
        7. Arahkan aplikasi ke instance baru:
             <perintah pembaruan konfigurasi>
        8. Nyalakan lalu lintas bertahap: 10 persen, lalu 50, lalu 100.
        9. Umumkan pulih. Catat waktu selesai.

        SESUDAHNYA
        - Tulis post-mortem dalam 48 jam.
        - Hitung RTO nyata dan bandingkan dengan target.
        `,
      ),
      p(
        'Langkah keenam adalah yang paling sering hilang dari rencana pemulihan dan yang paling menentukan. Mengalihkan lalu lintas ke basis data yang ternyata dipulihkan ke titik yang salah berarti kamu baru saja menambahkan kehilangan data kedua di atas yang pertama.',
      ),

      references(
        {
          label: 'PostgreSQL: Continuous Archiving and Point-in-Time Recovery',
          href: 'https://www.postgresql.org/docs/current/continuous-archiving.html',
          source: 'PostgreSQL',
          note: 'Cara resmi menurunkan RPO menjadi hitungan detik.',
        },
        {
          label: 'PostgreSQL: Recovery Target Settings',
          href: 'https://www.postgresql.org/docs/current/runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET',
          source: 'PostgreSQL',
          note: 'Pengaturan `recovery_target_time` yang dipakai pada rencana pemulihan.',
        },
        {
          label: 'Kubernetes: Multiple Zones',
          href: 'https://kubernetes.io/docs/setup/best-practices/multiple-zones/',
          source: 'Kubernetes',
          note: 'Menyebarkan salinan ke beberapa zona sebelum memikirkan wilayah kedua.',
        },
        {
          label: 'Site Reliability Engineering: Data Integrity',
          href: 'https://sre.google/sre-book/data-integrity/',
          source: 'Google SRE',
          note: 'Alasan resmi kenapa replika tidak melindungi dari kesalahan manusia.',
        },
      ),
    ],
  ),
  written(
    'studi-kasus-pemendek-url',
    'Studi Kasus: Pemendek Alamat',
    14,
    'Proses empat langkah dijalankan penuh pada sistem yang kecil tetapi lengkap.',
    [
      p(
        'Empat sub-bab berikutnya memakai seluruh isi tiga bab sebelumnya. Yang pertama ini sengaja mengambil sistem yang kecil, karena tujuannya memperlihatkan **prosesnya** dengan jelas, bukan memamerkan kerumitan.',
      ),
      p(
        'Ikuti urutan empat langkah dari sub-bab [proses empat langkah](/kelas/system-design/fondasi-sistem/proses-empat-langkah). Perhatikan bagaimana angka pada langkah satu menentukan hampir seluruh keputusan sesudahnya.',
      ),

      terms(
        {
          term: 'base62',
          meaning:
            'Cara menuliskan angka memakai 62 lambang, yaitu 0 sampai 9, a sampai z, dan A sampai Z. Dibaca "beis enam dua". Dipakai untuk memendekkan angka menjadi teks pendek yang aman diletakkan di alamat, karena tidak memakai lambang yang perlu di-encode.',
        },
        {
          term: 'redirect 301 dan 302',
          meaning:
            'Dua kode status HTTP untuk mengalihkan pengunjung. Kode 301 berarti permanen sehingga browser menyimpannya dan tidak bertanya lagi. Kode 302 berarti sementara sehingga browser bertanya setiap kali. Pilihan di antara keduanya menentukan apakah kamu bisa menghitung klik.',
        },
        {
          term: 'collision',
          meaning:
            'Keadaan ketika dua masukan berbeda menghasilkan kode pendek yang sama. Terjadi bila kode dibuat dari hash. Harus ditangani, karena tabrakan yang diabaikan berarti satu alamat menimpa alamat orang lain.',
        },
        {
          term: 'power law',
          meaning:
            'Pola sebaran ketika sebagian sangat kecil dari populasi menguasai sebagian sangat besar dari kejadian. Pada pemendek alamat, beberapa ratus alamat biasanya menguasai sebagian besar kunjungan, dan pola itulah yang membuat cache sangat efektif.',
        },
      ),

      h2('Langkah 1, pahami dan batasi'),
      code(
        'text',
        `
        KEBUTUHAN FUNGSIONAL
        1. Kirim alamat panjang, terima alamat pendek.
        2. Membuka alamat pendek mengalihkan ke alamat aslinya.
        3. Pemilik bisa melihat jumlah klik.

        DI LUAR CAKUPAN
        - Alamat pendek pilihan sendiri
        - Masa berlaku dan penghapusan
        - Statistik rinci per negara dan perangkat

        KEBUTUHAN NON-FUNGSIONAL
        DAU                     100 juta
        Alamat dibuat per orang     0,1 per hari
        Pengalihan per orang        5 per hari
        Latensi pengalihan        < 50 ms pada P99
        Ketersediaan              99,99 persen untuk pengalihan
                                  99,9 persen untuk pembuatan
        Konsistensi               pengalihan boleh basi beberapa detik
                                  jumlah klik boleh basi satu menit
        Retention               10 tahun
        `,
      ),
      p(
        'Perhatikan dua target ketersediaan yang berbeda. Pengalihan diberi target lebih tinggi karena alamat yang sudah tersebar di mana-mana akan rusak bila layanannya mati, sedangkan gagal membuat alamat baru cukup dicoba lagi beberapa menit kemudian. Perbedaan ini akan berpengaruh pada langkah dua.',
      ),
      code(
        'text',
        `
        ESTIMASI

        TULIS  100jt x 0,1 / 86.400 = ~116 QPS,   puncak 5x = ~580 QPS
        BACA   100jt x 5   / 86.400 = ~5.800 QPS, puncak 5x = ~29.000 QPS
        Perbandingan baca:tulis = 50 : 1

        PENYIMPANAN
        Alamat baru per hari  = 10 juta
        Ukuran satu baris     = kode 7 + alamat 200 + metadata 50 = ~257, bulatkan 300 bita
        Per hari              = 10jt x 300 = 3 GB
        Per tahun             = ~1,1 TB
        10 tahun              = ~11 TB
        Faktor replikasi 3    = ~33 TB

        BANDWIDTH
        Keluar = 29.000 QPS x 500 bita = ~14,5 MB/detik. Kecil.

        CACHE
        Power law: 20 persen alamat melayani 80 persen kunjungan.
        Alamat aktif diperkirakan 100 juta -> panas 20 juta x 300 bita = 6 GB.
        Muat di satu instance Redis berukuran wajar.
        `,
      ),
      p(
        'Tiga kesimpulan langsung muncul dari angka-angka itu. Bacanya lima puluh kali tulisnya sehingga cache akan sangat efektif. Penyimpanannya tiga puluh tiga terabita sehingga satu mesin tidak cukup dan pembagian data akan dibutuhkan. Bandwidthnya kecil sehingga jaringan bukan masalah sama sekali.',
      ),

      h2('Langkah 2, high-level design'),
      code(
        'text',
        `
        Pembuatan (116 QPS)                 Pengalihan (29.000 QPS puncak)
        Klien                               Klien
          | POST /api/v1/urls                 | GET /{kode}
          v                                   v
        Load Balancer                       Load Balancer
          v                                   v
        Layanan Pembuat  x3                 Layanan Pengalih  x8
          |                                   |
          | terbitkan id                      +--> Cache Redis  (hit ~95%)
          v                                   |         |
        Penerbit ID (rentang)                 |         | miss
          |                                   |         v
          v                                   +--> Penyimpanan KV (di-shard)
        Penyimpanan KV                        |
                                              +--> Antrean klik --> Worker --> penghitung
        `,
      ),
      p(
        'Dua jalur sengaja dipisahkan menjadi dua kelompok layanan. Alasannya bukan kesukaan pada layanan kecil, melainkan angka pada langkah satu, yaitu bebannya berbeda dua ratus lima puluh kali lipat dan target ketersediaannya berbeda. Memisahkan keduanya berarti lonjakan pembuatan tidak pernah mengganggu pengalihan, dan keduanya bisa diperbesar sendiri-sendiri.',
      ),
      code(
        'text',
        `
        KONTRAK API

        POST /api/v1/urls
          Body    { "url": "https://contoh.com/artikel/panjang" }
          201     { "kode": "aB3xY9z", "pendek": "https://s.id/aB3xY9z" }
          400     alamat tidak sah
          429     melewati batas laju

        GET /{kode}
          302     Location: <alamat asli>
          404     kode tidak dikenal

        GET /api/v1/urls/{kode}/stats
          200     { "kode": "aB3xY9z", "klik": 48210, "dibuatPada": "..." }
          403     bukan milikmu
        `,
      ),
      code(
        'sql',
        `
        -- Model datanya sesederhana ini, dan itu memang inti sistemnya.
        CREATE TABLE alamat (
          kode        VARCHAR(7)  PRIMARY KEY,
          url_asli    TEXT        NOT NULL,
          pemilik_id  BIGINT,
          dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT now(),
          klik        BIGINT      NOT NULL DEFAULT 0
        );

        -- Untuk halaman "alamat milik saya".
        CREATE INDEX alamat_pemilik_idx ON alamat (pemilik_id, dibuat_pada DESC);
        `,
      ),
      p(
        'Pertanyaan pilihan penyimpanan dijawab langsung oleh pola aksesnya. Sembilan puluh sembilan persen operasinya adalah mengambil satu baris berdasarkan kunci utamanya, dan itu adalah bentuk yang paling cocok untuk penyimpanan key-value seperti yang dibahas di sub-bab [memilih SQL atau NoSQL](/kelas/system-design/skala-data/sql-atau-nosql). Tabel di atas ditulis sebagai SQL karena bentuknya paling mudah dibaca, dan pada skala tiga puluh tiga terabita penyimpanan key-value yang bisa di-shard adalah pilihan yang lebih tepat.',
      ),

      h2('Langkah 3, menyelam pada dua hal yang menentukan'),
      h2('Selam pertama, menerbitkan kode'),
      p(
        'Ini keputusan paling menarik pada sistem ini, karena kodenya harus unik secara global sementara pembuatnya berjalan di beberapa mesin sekaligus.',
      ),
      table(
        ['Pilihan', 'Cara kerja', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Hash dari alamatnya',
            'Ambil beberapa karakter pertama dari hash',
            'Alamat sama menghasilkan kode sama',
            'Bisa bertabrakan, dan penanganannya butuh pembacaan tambahan',
          ],
          [
            'Acak lalu periksa',
            'Buat 7 karakter acak, periksa sudah dipakai atau belum',
            'Sederhana',
            'Butuh pembacaan tiap pembuatan, dan memburuk saat penuh',
          ],
          [
            'Penghitung tunggal',
            'Angka menaik lalu diubah ke base62',
            'Dijamin unik, tanpa pemeriksaan',
            'Satu titik kegagalan, dan kodenya bisa ditebak berurutan',
          ],
          [
            '**Rentang per mesin**',
            'Tiap mesin mengambil jatah sejuta angka',
            'Tanpa koordinasi per pembuatan',
            'Ada lompatan angka bila mesin mati',
          ],
        ],
      ),
      p('Pilihan keempat menang, dan alasannya bisa ditunjukkan dengan angka.'),
      code(
        'js',
        `
        const HURUF = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

        function keBase62(angka) {
          if (angka === 0) return '0';
          let hasil = '';
          let sisa = angka;
          while (sisa > 0) {
            hasil = HURUF[sisa % 62n === undefined ? 0 : Number(sisa % 62n)] + hasil;
            sisa = sisa / 62n;
          }
          return hasil;
        }

        class PenerbitKode {
          #berikutnya = 0n;
          #batas = 0n;
          static UKURAN_JATAH = 1_000_000n;

          async ambil() {
            if (this.#berikutnya >= this.#batas) await this.#ambilJatahBaru();
            const angka = this.#berikutnya;
            this.#berikutnya += 1n;
            return keBase62(angka).padStart(7, '0');
          }

          // Satu operasi atomik. Tiap mesin mendapat rentang yang tidak beririsan.
          async #ambilJatahBaru() {
            const batasBaru = BigInt(
              await redis.incrby('penerbit:alamat', Number(PenerbitKode.UKURAN_JATAH)),
            );
            this.#berikutnya = batasBaru - PenerbitKode.UKURAN_JATAH;
            this.#batas = batasBaru;
            logger.info(
              { dari: String(this.#berikutnya), sampai: String(this.#batas) },
              'jatah kode baru diambil',
            );
          }
        }
        `,
        {
          caption:
            'Satu panggilan Redis melayani sejuta pembuatan kode, sehingga penerbitnya tidak pernah menjadi bottleneck.',
        },
      ),
      code(
        'text',
        `
        KAPASITAS
        62^7 = ~3,5 triliun kemungkinan kode
        Pada 10 juta per hari, habis dalam ~950 tahun.

        BEBAN PENERBIT
        1 panggilan Redis per 1 juta kode
        Pada 116 QPS pembuatan: 1 panggilan tiap ~2,4 jam per mesin.

        KERUGIAN
        Mesin mati di tengah jatah -> sisa jatahnya hilang.
        Kehilangan 1 juta dari 3,5 triliun tidak berarti apa-apa.
        `,
      ),
      p(
        'Bagian kerugian di atas adalah contoh pertukaran yang layak diterima secara terbuka. Kode yang berlompatan memang terlihat tidak rapi, dan kerapian itu tidak punya nilai apa pun di sini sementara ketiadaan koordinasi punya nilai yang sangat besar.',
      ),
      h2('Selam kedua, jalur pengalihan'),
      p(
        'Jalur ini menanggung dua puluh sembilan ribu permintaan per detik, dan targetnya lima puluh milidetik pada P99. Seluruh perancangannya bertumpu pada satu kenyataan, yaitu sebaran kunjungan mengikuti power law.',
      ),
      code(
        'js',
        `
        const TTL_DETIK = 86_400;
        const TTL_KOSONG_DETIK = 300;
        const PENANDA_KOSONG = '\\u0000tidak-ada';

        app.get('/:kode', async (req, res) => {
          const { kode } = req.params;
          if (!/^[0-9a-zA-Z]{1,7}$/.test(kode)) return res.status(404).render('404');

          const kunci = 'url:v1:' + kode;
          let url = null;

          // Cache boleh gagal. Kegagalannya tidak boleh menjatuhkan pengalihan.
          try {
            const tersimpan = await redis.get(kunci);
            if (tersimpan === PENANDA_KOSONG) return res.status(404).render('404');
            if (tersimpan !== null) url = tersimpan;
          } catch (err) {
            metrics.increment('cache.error');
          }

          if (url === null) {
            const baris = await penyimpanan.ambil(kode);
            if (baris === null) {
              // Simpan ketiadaan, agar pemindaian kode acak tidak menembus ke penyimpanan.
              redis.set(kunci, PENANDA_KOSONG, 'EX', TTL_KOSONG_DETIK).catch(() => {});
              return res.status(404).render('404');
            }
            url = baris.url_asli;
            redis.set(kunci, url, 'EX', TTL_DETIK).catch(() => {});
          }

          // Alihkan LEBIH DULU. Pencatatan klik tidak boleh menambah latensi.
          res.redirect(302, url);

          // Sesudah respons terkirim, catat kliknya tanpa menunggu.
          antreanKlik
            .add('klik', { kode, waktu: Date.now() }, { removeOnComplete: true })
            .catch((err) => logger.warn({ err, kode }, 'gagal mencatat klik'));
        });
        `,
        {
          caption:
            'Urutan res.redirect sebelum pencatatan klik adalah keputusan desain, bukan gaya penulisan.',
        },
      ),
      p(
        'Tiga keputusan pada potongan itu layak disebut. Pertama, pengalihan dikirim sebelum klik dicatat, sehingga antrean yang lambat tidak pernah menambah latensi bagi pengunjung. Kedua, penyimpanan ketiadaan menutup cache penetration yang dibahas di sub-bab [ketika cache justru jadi masalah](/kelas/system-design/blok-penyusun/masalah-cache). Ketiga, kegagalan Redis hanya membuat permintaan itu menyentuh penyimpanan, bukan gagal.',
      ),
      p('Keputusan 301 atau 302 layak dibahas tersendiri karena akibatnya besar.'),
      table(
        ['', '301 permanen', '302 sementara'],
        [
          ['Browser menyimpan?', 'Ya, sering selamanya', 'Tidak'],
          ['Kunjungan berikutnya', 'Tidak menyentuh servermu', 'Menyentuh servermu'],
          ['Jumlah klik', '**Tidak bisa dihitung** setelah yang pertama', 'Terhitung semuanya'],
          ['Beban server', 'Jauh lebih ringan', 'Penuh'],
          ['Bisa mengubah tujuan?', 'Praktis tidak, karena tersimpan di browser', 'Ya'],
        ],
      ),
      p(
        'Karena kebutuhan fungsional ketiga menuntut penghitungan klik, jawabannya adalah 302. Ini contoh langsung bagaimana satu butir pada daftar kebutuhan menentukan sebuah kode status, dan sekaligus menentukan bahwa bebannya akan jauh lebih besar.',
      ),

      h2('Langkah 4, tutup dengan jujur'),
      code(
        'text',
        `
        RINGKASAN
        Pembuatan menerbitkan kode base62 dari rentang angka yang diambil per mesin,
        lalu menyimpannya ke penyimpanan key-value yang di-shard menurut kodenya.
        Pengalihan dilayani cache dengan hit ratio sekitar 95 persen, dan pencatatan
        klik berjalan asinkron lewat antrean.

        PERTUKARAN YANG DITERIMA
        - Kode berlompatan bila sebuah mesin mati. Diterima, ruangnya 3,5 triliun.
        - Jumlah klik tertinggal sampai satu menit. Sudah dinyatakan di langkah 1.
        - Memakai 302 sehingga beban jauh lebih besar daripada 301. Ditukar dengan
          kemampuan menghitung klik, yang merupakan kebutuhan fungsional.
        - Alamat pendek tidak bisa dipilih sendiri, sehingga tidak perlu memeriksa
          tabrakan maupun menyaring kata terlarang.

        LEHER BOTOL BERIKUTNYA
        - Cache miss pada 5 persen dari 29.000 QPS = ~1.450 QPS ke penyimpanan.
          Aman untuk sekarang. Menjadi masalah bila hit ratio turun di bawah 85 persen.
        - Antrean klik pada 29.000 pesan per detik. Perlu dipantau kedalamannya.

        PERBAIKAN YANG DIRENCANAKAN
        - Gabungkan klik di memori proses lalu kirim per detik, bukan per klik.
          Pemicu: kedalaman antrean klik bertahan di atas 100.000.
        - Sajikan pengalihan dari edge untuk kode yang paling panas.
          Pemicu: hit ratio cache turun, atau latensi P99 melewati 50 ms.

        YANG BELUM DIBAHAS
        - Penyaringan alamat berbahaya sebelum pengalihan.
        - Batas laju pembuatan per akun. Dibahas di sub-bab berikutnya.
        `,
      ),
      callout(
        'tip',
        'Perhatikan berapa banyak keputusan yang datang langsung dari angka',
        'Cache dipilih karena perbandingan 50 banding 1. Pembagian data dipilih karena 33 terabita. Kode 302 dipilih karena kebutuhan menghitung klik. Rentang per mesin dipilih karena 3,5 triliun kemungkinan membuat kerugian lompatan menjadi tidak berarti. Tidak satu pun keputusan itu diambil karena selera, dan itulah tanda desain yang bisa diperiksa orang lain.',
      ),

      references(
        {
          label: '301 Moved Permanently',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/301',
          source: 'MDN',
          note: 'Termasuk catatan bahwa browser menyimpan pengalihan ini secara agresif.',
        },
        {
          label: '302 Found',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302',
          source: 'MDN',
          note: 'Bentuk pengalihan yang dipilih pada studi kasus ini.',
        },
        {
          label: 'Redis: INCRBY',
          href: 'https://redis.io/docs/latest/commands/incrby/',
          source: 'Redis',
          note: 'Operasi atomik yang dipakai penerbit rentang kode.',
        },
        {
          label: 'RFC 9110: Redirection 3xx',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-redirection-3xx',
          source: 'RFC Editor',
          note: 'Definisi resmi seluruh kode pengalihan.',
        },
      ),
    ],
  ),

  written(
    'studi-kasus-pembatas-laju',
    'Studi Kasus: Rate Limiter',
    13,
    'Empat algoritma, satu penyimpanan bersama, dan satu masalah atomisitas.',
    [
      p(
        'Kamu sudah memasang rate limiter pada endpoint login di sub-bab [rate limit login](/kelas/backend-basic/auth-dasar/rate-limit-login). Studi kasus ini membangunnya sebagai komponen tersendiri yang melayani seluruh API, dan sepanjang jalan menjawab tiga pertanyaan yang tidak dijawab di sana, yaitu algoritma apa yang dipakai, di mana hitungannya disimpan, dan bagaimana ia tetap benar ketika ada delapan mesin aplikasi.',
      ),

      terms(
        {
          term: 'rate limiter',
          meaning:
            'Komponen yang membatasi berapa banyak permintaan boleh diterima dari satu pihak dalam satu rentang waktu. Melindungi dari penyalahgunaan, dari klien yang salah tulis, dan dari beban yang tidak wajar. Kelebihan permintaan dijawab dengan kode 429.',
        },
        {
          term: 'token bucket',
          meaning:
            'Algoritma yang membayangkan sebuah ember berisi token. Tiap permintaan mengambil satu token, dan ember diisi ulang dengan laju tetap. Sifat khasnya, ia mengizinkan ledakan sesaat sebesar isi ember, lalu melambat mengikuti laju pengisian.',
        },
        {
          term: 'fixed window',
          meaning:
            'Menghitung permintaan per potongan waktu yang tetap, misalnya per menit kalender. Paling sederhana, dan punya cacat pada batas jendela karena dua kali lipat jatah bisa lolos di sekitar pergantian menit.',
        },
        {
          term: 'sliding window',
          meaning:
            'Menghitung permintaan dalam rentang waktu yang bergerak mengikuti sekarang, bukan potongan tetap. Menutup cacat fixed window. Ada dua bentuk, yaitu mencatat setiap stempel waktu yang sangat tepat tetapi boros memori, dan menghitung berbobot dari dua jendela yang hampir setepat itu dengan memori sangat kecil.',
        },
        {
          term: 'kode 429',
          meaning:
            'Kode status HTTP yang berarti terlalu banyak permintaan. Dibaca "empat dua sembilan". Sebaiknya selalu disertai header `Retry-After` agar klien tahu kapan boleh mencoba lagi, karena tanpa itu klien yang naif akan mencoba ulang seketika dan memperparah keadaan.',
        },
        {
          term: 'atomic (atomik)',
          meaning:
            'Sifat operasi yang berjalan utuh tanpa bisa disela operasi lain. Ini syarat mutlak rate limiter yang benar, karena membaca lalu menulis sebagai dua langkah terpisah memungkinkan beberapa permintaan sama-sama melihat hitungan lama.',
        },
      ),

      h2('Langkah 1, kebutuhan'),
      code(
        'text',
        `
        FUNGSIONAL
        1. Batasi permintaan per kunci API dan per alamat IP.
        2. Batas berbeda per kelompok endpoint.
        3. Jawab 429 dengan header yang memberi tahu sisa jatah.

        NON-FUNGSIONAL
        Tambahan latensi   < 5 ms pada P99
        Ketepatan          boleh meleset sedikit, tidak boleh meleset besar
        Ketersediaan       pembatas mati TIDAK boleh menjatuhkan API
        Skala              8 mesin aplikasi, total puncak 30.000 QPS

        DI LUAR CAKUPAN
        - Batas dinamis yang berubah sendiri mengikuti beban
        - Kuota harian dan penagihan
        `,
      ),
      p(
        'Baris ketersediaan pada daftar itu menentukan sebuah keputusan besar di langkah tiga. Rate limiter berada di jalur setiap permintaan, sehingga ia adalah kandidat single point of failure yang sempurna. Menyatakan sejak awal bahwa matinya tidak boleh menjatuhkan API akan memaksa jawaban tertentu nanti.',
      ),

      h2('Langkah 2, memilih algoritma'),
      table(
        ['Algoritma', 'Memori per kunci', 'Ketepatan', 'Izinkan ledakan?', 'Cacatnya'],
        [
          [
            'Fixed window',
            '1 angka',
            'Rendah',
            'Ya, tidak sengaja',
            '2x jatah lolos di batas jendela',
          ],
          [
            'Sliding window dengan catatan',
            'N stempel waktu',
            'Sempurna',
            'Tidak',
            'Boros memori pada batas besar',
          ],
          [
            '**Sliding window berbobot**',
            '2 angka',
            'Tinggi',
            'Tidak',
            'Sedikit meleset, dan biasanya tidak berarti',
          ],
          [
            '**Token bucket**',
            '2 angka',
            'Tinggi',
            'Ya, terkendali',
            'Perlu memikirkan ukuran embernya',
          ],
        ],
      ),
      p('Cacat fixed window layak dilihat konkret, karena ia yang membuat orang beralih.'),
      code(
        'text',
        `
        Batas 100 permintaan per menit, fixed window per menit kalender.

        10:00:59  100 permintaan  -> semuanya lolos (jendela menit 10:00)
        10:01:00  100 permintaan  -> semuanya lolos (jendela menit 10:01)

        Dalam rentang 1 detik, 200 permintaan lolos.
        Batas yang tertulis 100 per menit, kenyataannya 200 per detik.
        `,
      ),
      p(
        'Dua algoritma yang terpilih dipakai untuk keperluan berbeda. Token bucket cocok untuk API umum karena ia mengizinkan klien mengirim beberapa permintaan sekaligus lalu melambat, dan itu sesuai dengan cara klien nyata bekerja. Sliding window berbobot cocok untuk endpoint sensitif seperti login, karena di sana ledakan justru yang ingin dicegah.',
      ),

      h2('Langkah 3, membangunnya dengan benar'),
      h2('Kenapa harus atomik'),
      compare(
        {
          title: 'Salah, ada celah di antara dua langkah',
          lang: 'js',
          code: `
            const sekarang = await redis.get(kunci);
            const jumlah = Number(sekarang ?? 0);

            if (jumlah >= BATAS) return tolak();

            await redis.incr(kunci);
            await redis.expire(kunci, JENDELA_DETIK);
            return izinkan();
          `,
          notes: [
            'Delapan mesin bisa sama-sama membaca 99',
            'Delapan-duanya menyimpulkan masih boleh',
            'Delapan permintaan lolos padahal jatahnya satu',
            '`expire` terpisah bisa gagal, kuncinya menjadi abadi',
          ],
        },
        {
          title: 'Benar, satu operasi utuh',
          lang: 'js',
          code: `
            const SKRIP = \`
              local jumlah = redis.call('INCR', KEYS[1])
              if jumlah == 1 then
                redis.call('EXPIRE', KEYS[1], ARGV[2])
              end
              if jumlah > tonumber(ARGV[1]) then
                return {0, redis.call('TTL', KEYS[1])}
              end
              return {1, tonumber(ARGV[1]) - jumlah}
            \`;

            const [boleh, sisa] = await redis.eval(
              SKRIP, 1, kunci, String(BATAS), String(JENDELA_DETIK),
            );
          `,
          notes: [
            'Seluruh skrip berjalan tanpa bisa disela',
            '`EXPIRE` dipasang hanya pada penambahan pertama',
            'Mengembalikan sisa jatah sekaligus',
          ],
        },
      ),
      p(
        'Redis menjalankan skrip Lua secara utuh tanpa bisa disela perintah lain, dan sifat itulah yang membuat rate limiter terdistribusi mungkin dibangun. Tanpa keutuhan itu, delapan mesin yang bertanya bersamaan akan sama-sama mendapat jawaban lama.',
      ),
      h2('Token bucket yang lengkap'),
      code(
        'js',
        `
        // Token bucket: isi ulang berdasarkan waktu yang berlalu, bukan timer.
        const SKRIP_EMBER = \`
          local kunci      = KEYS[1]
          local kapasitas  = tonumber(ARGV[1])
          local laju       = tonumber(ARGV[2])   -- token per detik
          local sekarang   = tonumber(ARGV[3])   -- detik pecahan
          local diminta    = tonumber(ARGV[4])

          local data     = redis.call('HMGET', kunci, 'token', 'terakhir')
          local token    = tonumber(data[1])
          local terakhir = tonumber(data[2])

          if token == nil then
            token    = kapasitas
            terakhir = sekarang
          end

          -- Isi ulang sesuai waktu yang berlalu sejak pemanggilan terakhir.
          local berlalu = math.max(0, sekarang - terakhir)
          token = math.min(kapasitas, token + berlalu * laju)

          local boleh = 0
          if token >= diminta then
            token = token - diminta
            boleh = 1
          end

          -- TTL dua kali waktu pengisian penuh: kunci yang tidak dipakai hilang sendiri.
          local ttl = math.ceil(kapasitas / laju * 2)
          redis.call('HSET', kunci, 'token', token, 'terakhir', sekarang)
          redis.call('EXPIRE', kunci, ttl)

          -- Berapa detik lagi sampai ada satu token.
          local tunggu = 0
          if boleh == 0 then
            tunggu = math.ceil((diminta - token) / laju)
          end

          return {boleh, math.floor(token), tunggu}
        \`;

        async function periksaBatas(kunci, kapasitas, lajuPerDetik) {
          const sekarang = Date.now() / 1000;
          const [boleh, sisa, tunggu] = await redis.eval(
            SKRIP_EMBER, 1, kunci,
            String(kapasitas), String(lajuPerDetik), String(sekarang), '1',
          );
          return { boleh: boleh === 1, sisa, tunggu };
        }
        `,
        {
          caption:
            'Pengisian ulang dihitung dari selisih waktu, sehingga tidak ada proses latar yang perlu berjalan.',
        },
      ),
      p(
        'Sifat yang membuat token bucket elegan ada pada baris pengisian ulang. Tidak ada timer, tidak ada pekerjaan berkala, dan tidak ada apa pun yang berjalan ketika sebuah kunci sedang tidak dipakai. Seluruh keadaan ember dihitung ulang dari dua angka pada saat ia ditanya, dan itu berarti sepuluh juta kunci yang menganggur tidak memakan sumber daya sama sekali selain memorinya.',
      ),
      h2('Middleware beserta headernya'),
      code(
        'js',
        `
        const ATURAN = {
          'auth':  { kapasitas: 5,    laju: 5 / 60 },      // 5 per menit
          'tulis': { kapasitas: 60,   laju: 1 },           // 60 per menit, ledakan 60
          'baca':  { kapasitas: 1000, laju: 1000 / 60 },
        };

        function pembatasLaju(kelompok) {
          const { kapasitas, laju } = ATURAN[kelompok];

          return async function (req, res, next) {
            const identitas = req.apiKey ?? req.ip;
            const kunci = 'batas:' + kelompok + ':' + identitas;

            let hasil;
            try {
              hasil = await periksaBatas(kunci, kapasitas, laju);
            } catch (err) {
              // GAGAL TERBUKA: pembatas mati tidak boleh menjatuhkan API.
              // Keputusan ini diambil di langkah 1 dan dicatat di langkah 4.
              metrics.increment('pembatas.error');
              logger.error({ err, kelompok }, 'rate limiter tidak terjangkau, permintaan diizinkan');
              return next();
            }

            res.setHeader('RateLimit-Limit', String(kapasitas));
            res.setHeader('RateLimit-Remaining', String(hasil.sisa));

            if (!hasil.boleh) {
              res.setHeader('Retry-After', String(hasil.tunggu));
              metrics.increment('pembatas.tolak', { kelompok });
              return res.status(429).json({
                type: 'https://api.contoh.com/errors/rate-limit',
                title: 'Terlalu banyak permintaan',
                status: 429,
                detail: 'Batas ' + kapasitas + ' permintaan terlampaui. Coba lagi dalam ' + hasil.tunggu + ' detik.',
              });
            }

            next();
          };
        }

        app.post('/api/v1/login', pembatasLaju('auth'), tanganiLogin);
        app.post('/api/v1/urls',  pembatasLaju('tulis'), tanganiBuatUrl);
        app.get('/api/v1/urls',   pembatasLaju('baca'),  tanganiDaftarUrl);
        `,
      ),
      p(
        'Bentuk badan respons 429 di atas mengikuti format error yang sudah dipakai di sub-bab [bentuk error](/kelas/backend-intermediate/desain-api/bentuk-error). Header `Retry-After` adalah bagian yang paling sering dilupakan dan paling berguna, karena tanpanya klien yang naif akan mencoba ulang seketika dan justru memperbesar beban yang sedang kamu batasi.',
      ),

      h2('Keputusan tersulit, gagal terbuka atau gagal tertutup'),
      p(
        'Ketika Redis tidak terjangkau, rate limiter tidak bisa memutuskan. Ada dua sikap, dan keduanya salah dengan cara yang berbeda.',
      ),
      table(
        ['Sikap', 'Artinya', 'Risikonya', 'Cocok untuk'],
        [
          [
            'Gagal terbuka',
            'Izinkan semua permintaan',
            'Tidak ada perlindungan selama Redis mati',
            'API umum, dan itu pilihan pada studi kasus ini',
          ],
          [
            'Gagal tertutup',
            'Tolak semua permintaan',
            'Pemadaman total karena satu komponen pendukung',
            'Endpoint yang penyalahgunaannya sangat merugikan',
          ],
        ],
      ),
      p(
        'Pilihan pada studi kasus ini adalah gagal terbuka, dan pilihan itu berasal langsung dari baris ketersediaan pada langkah satu. Perlu dicatat sikap ini bertentangan dengan aturan umum keamanan yang menyatakan kegagalan harus menutup, dan pertentangan itu diselesaikan dengan membedakan jenis endpointnya.',
      ),
      code(
        'js',
        `
        // Jalan tengah: batas cadangan di memori proses ketika Redis mati.
        // Tidak setepat batas bersama, dan jauh lebih baik daripada tanpa batas.
        const cadanganLokal = new Map();

        function periksaCadanganLokal(identitas, batasPerMesin) {
          const sekarang = Math.floor(Date.now() / 60_000);
          const kunci = identitas + ':' + sekarang;
          const jumlah = (cadanganLokal.get(kunci) ?? 0) + 1;
          cadanganLokal.set(kunci, jumlah);

          // Bersihkan kunci menit sebelumnya agar Map tidak tumbuh selamanya.
          if (cadanganLokal.size > 100_000) {
            for (const k of cadanganLokal.keys()) {
              if (!k.endsWith(':' + sekarang)) cadanganLokal.delete(k);
            }
          }

          return jumlah <= batasPerMesin;
        }
        `,
        {
          caption:
            'Batas per mesin dikalikan jumlah mesin, jadi longgar, tetapi tetap menahan penyalahgunaan yang paling kasar.',
        },
      ),
      p(
        'Untuk endpoint autentikasi, sikapnya dibalik. Kegagalan pembatas pada endpoint login lebih baik menolak permintaan daripada membuka pintu penebakan password tanpa batas, dan itu sesuai aturan pada sub-bab [menahan penebakan](/kelas/keamanan-fullstack/identitas-kewenangan/menahan-penebakan).',
      ),

      h2('Langkah 4, tutup'),
      code(
        'text',
        `
        PERTUKARAN YANG DITERIMA
        - Gagal terbuka untuk API umum. Selama Redis mati, tidak ada batas bersama.
          Diredam batas cadangan per mesin.
        - Gagal tertutup untuk endpoint auth. Login tidak bisa dipakai selama Redis
          mati, dan itu lebih baik daripada penebakan tanpa batas.
        - Token bucket mengizinkan ledakan sebesar kapasitas. Disengaja, karena klien
          nyata memang mengirim beberapa permintaan sekaligus.
        - Batas per kunci API, bukan per pengguna akhir. Satu kunci yang dipakai
          banyak pengguna berbagi jatah yang sama.

        LEHER BOTOL BERIKUTNYA
        - Satu panggilan Redis per permintaan. Pada 30.000 QPS, itu 30.000 operasi
          per detik, masih di bawah kapasitas satu instance.
          Bila melewati 80.000, bagi kuncinya ke beberapa instance dengan hash ring.

        PERBAIKAN YANG DIRENCANAKAN
        - Pindahkan pembatas ke lapisan proxy agar permintaan yang ditolak tidak
          pernah menyentuh aplikasi sama sekali.
          Pemicu: laju penolakan melewati 5 persen dari total permintaan.
        `,
      ),
      callout(
        'tip',
        'Pantau laju penolakan, bukan hanya laju permintaan',
        'Penolakan yang tiba-tiba melonjak berarti salah satu dari tiga hal, yaitu ada penyalahgunaan, ada klien yang salah tulis dan mencoba ulang tanpa henti, atau batasmu terlalu ketat untuk pemakaian yang wajar. Ketiganya perlu tindakan, dan ketiganya tidak akan terlihat bila yang dipantau hanya jumlah permintaan yang berhasil.',
      ),

      references(
        {
          label: '429 Too Many Requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
          source: 'MDN',
          note: 'Kode status beserta anjuran menyertakan `Retry-After`.',
        },
        {
          label: 'Retry-After',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After',
          source: 'MDN',
          note: 'Dua bentuk nilai yang diterima, yaitu jumlah detik atau tanggal.',
        },
        {
          label: 'Redis: EVAL',
          href: 'https://redis.io/docs/latest/commands/eval/',
          source: 'Redis',
          note: 'Jaminan bahwa skrip Lua berjalan utuh tanpa bisa disela.',
        },
        {
          label: 'RFC 6585: Additional HTTP Status Codes',
          href: 'https://www.rfc-editor.org/rfc/rfc6585.html#section-4',
          source: 'RFC Editor',
          note: 'Definisi asli kode 429.',
        },
      ),
    ],
  ),
  written(
    'studi-kasus-linimasa',
    'Studi Kasus: Linimasa',
    15,
    'Satu pertukaran yang menentukan segalanya, dan satu celebrity problem yang tidak bisa dihindari.',
    [
      p(
        'Studi kasus terakhir adalah yang paling menarik karena seluruh sistemnya berputar pada satu keputusan tunggal. Keputusan itu tidak punya jawaban yang benar untuk semua kasus, dan jawabannya berubah menurut satu angka, yaitu berapa banyak pengikut yang dimiliki sebuah akun.',
      ),
      p(
        'Sistem ini juga memaksa hampir setiap teknik pada tiga bab sebelumnya dipakai sekaligus, yaitu cache, antrean, sharding, denormalisasi, penanganan hot key, dan konsistensi akhir.',
      ),

      terms(
        {
          term: 'feed (linimasa)',
          meaning:
            'Daftar tulisan dari akun-akun yang diikuti seseorang, diurutkan menurut waktu atau menurut peringkat. Setiap orang melihat linimasa yang berbeda, dan itulah yang membuat sistem ini jauh lebih sulit daripada halaman yang sama untuk semua orang.',
        },
        {
          term: 'fanout',
          meaning:
            'Penyebaran satu tulisan ke banyak penerima. Dibaca "fenaut". Ada dua waktu untuk melakukannya, yaitu saat menulis atau saat membaca, dan pilihan itu adalah inti seluruh studi kasus ini.',
        },
        {
          term: 'fanout saat tulis (push)',
          meaning:
            'Ketika seseorang memposting, tulisannya langsung dimasukkan ke linimasa setiap pengikutnya yang sudah disiapkan sebelumnya. Membaca menjadi sangat murah karena linimasanya sudah jadi, dan menulis menjadi mahal sebanding jumlah pengikut.',
        },
        {
          term: 'fanout saat baca (pull)',
          meaning:
            'Ketika seseorang membuka linimasa, sistem mengambil tulisan terbaru dari semua akun yang ia ikuti lalu menggabungkannya saat itu juga. Menulis menjadi sangat murah, dan membaca menjadi mahal sebanding jumlah akun yang diikuti.',
        },
        {
          term: 'sorted set',
          meaning:
            'Struktur data Redis yang menyimpan anggota beserta nilai skor, dan selalu menjaganya terurut menurut skor itu. Dibaca "sorted set". Sangat cocok untuk linimasa karena stempel waktu bisa dipakai sebagai skor, sehingga mengambil lima puluh terbaru menjadi satu operasi.',
        },
        {
          term: 'write amplification',
          meaning:
            'Keadaan ketika satu tindakan pengguna menghasilkan sangat banyak operasi tulis di dalam sistem. Memposting satu tulisan yang harus dimasukkan ke sepuluh juta linimasa adalah sepuluh juta operasi tulis dari satu tindakan.',
        },
        {
          term: 'cursor pagination',
          meaning:
            'Cara membagi daftar panjang dengan penunjuk ke posisi terakhir, bukan dengan nomor halaman. Sudah dibahas di sub-bab [paginasi](/kelas/backend-intermediate/desain-api/paginasi). Wajib untuk linimasa, karena daftar yang isinya terus bertambah membuat nomor halaman kehilangan makna.',
        },
      ),

      h2('Langkah 1, kebutuhan dan angka'),
      code(
        'text',
        `
        FUNGSIONAL
        1. Pengguna memposting tulisan.
        2. Pengguna mengikuti akun lain.
        3. Pengguna membuka linimasa berisi tulisan akun yang diikutinya,
           terurut dari yang terbaru.

        DI LUAR CAKUPAN
        - Peringkat berbasis algoritma. Urutan murni menurut waktu.
        - Balasan berulir, pesan langsung, cerita singkat.

        NON-FUNGSIONAL
        DAU                       50 juta
        Posting per orang         0,5 per hari
        Buka linimasa per orang   10 per hari
        Rata-rata mengikuti       200 akun
        Rata-rata pengikut        200 akun
        Akun besar                1 persen punya > 100.000 pengikut
        Latensi buka linimasa     < 200 ms pada P95
        Konsistensi               tulisan boleh muncul terlambat 5 detik
        `,
      ),
      code(
        'text',
        `
        ESTIMASI

        TULIS  50jt x 0,5 / 86.400 = ~290 QPS,   puncak 3x = ~870 QPS
        BACA   50jt x 10  / 86.400 = ~5.800 QPS, puncak 3x = ~17.400 QPS

        PENGUATAN TULIS bila fanout saat tulis
        290 posting/detik x 200 pengikut rata-rata = ~58.000 penulisan/detik
        Puncak = ~174.000 penulisan/detik

        SATU AKUN DENGAN 10 JUTA PENGIKUT
        1 posting = 10 juta penulisan.
        Bila ia memposting 10 kali sehari = 100 juta penulisan dari SATU orang.

        PENYIMPANAN LINIMASA SIAP PAKAI
        50 juta pengguna x 1.000 entri x 16 bita = ~800 GB
        `,
      ),
      p(
        'Dua angka pada blok itu menentukan seluruh sisa desainnya. Angka lima puluh delapan ribu penulisan per detik masih bisa ditangani, dan angka sepuluh juta penulisan dari satu posting tidak. Itulah yang membuat jawabannya tidak bisa seragam untuk semua akun.',
      ),

      h2('Langkah 2, pertukaran yang menentukan'),
      table(
        ['', 'Fanout saat tulis', 'Fanout saat baca'],
        [
          ['Saat memposting', 'Tulis ke N linimasa pengikut', 'Tulis satu baris saja'],
          [
            'Saat membaca',
            'Ambil satu daftar yang sudah jadi',
            'Ambil dari 200 akun lalu gabungkan',
          ],
          [
            'Latensi baca',
            '**Sangat rendah**, satu operasi',
            'Tinggi, ratusan operasi lalu diurutkan',
          ],
          ['Latensi tulis', 'Tinggi untuk akun besar', '**Sangat rendah**'],
          ['Penyimpanan', 'Besar, linimasa disimpan per orang', 'Kecil, tulisan disimpan sekali'],
          ['Pengguna tidak aktif', 'Boros, linimasanya disiapkan sia-sia', 'Nol biaya'],
          ['Akun 10 juta pengikut', '**Mustahil**', 'Tidak masalah'],
        ],
      ),
      p(
        'Baris terakhir menutup pilihan murni saat tulis, dan baris ketiga menutup pilihan murni saat baca pada beban tujuh belas ribu pembacaan per detik. Karena itu jawabannya adalah gabungan keduanya, dengan pemisah berupa jumlah pengikut.',
      ),
      code(
        'text',
        `
        ATURAN GABUNGAN

        Akun dengan < 100.000 pengikut  -> fanout saat tulis
          99 persen akun. Penulisannya murah, dan pengikutnya menikmati baca cepat.

        Akun dengan >= 100.000 pengikut -> fanout saat baca
          1 persen akun. Tidak menyebarkan apa pun. Tulisannya diambil dan
          digabungkan saat pengikutnya membuka linimasa.

        Membuka linimasa berarti:
          1. Ambil linimasa siap pakai dari Redis        (satu operasi)
          2. Ambil tulisan terbaru dari akun besar yang diikuti  (biasanya 0 sampai 5)
          3. Gabungkan keduanya, urutkan, potong 50
        `,
      ),
      p(
        'Langkah kedua tetap murah karena jumlah akun besar yang diikuti seseorang biasanya sangat sedikit. Seseorang mungkin mengikuti dua ratus akun, dan dari dua ratus itu biasanya hanya beberapa yang tergolong besar. Menggabungkan satu daftar siap pakai dengan lima daftar kecil masih jauh di bawah anggaran dua ratus milidetik.',
      ),

      h2('Langkah 3, menyelam'),
      h2('Struktur data linimasa'),
      code(
        'js',
        `
        // Satu sorted set per pengguna. Skornya stempel waktu, jadi selalu terurut.
        // Kunci: linimasa:{penggunaId}
        // Anggota: tulisanId, Skor: waktu dalam milidetik

        const BATAS_ENTRI = 1000;

        async function sisipkanKeLinimasa(penggunaId, tulisanId, waktuMs) {
          const kunci = 'linimasa:' + penggunaId;
          const pipeline = redis.pipeline();
          pipeline.zadd(kunci, waktuMs, tulisanId);
          // Potong agar tidak tumbuh selamanya. Simpan 1000 terbaru saja.
          pipeline.zremrangebyrank(kunci, 0, -(BATAS_ENTRI + 1));
          pipeline.expire(kunci, 60 * 60 * 24 * 30); // 30 hari tidak dibuka, hapus
          await pipeline.exec();
        }

        async function ambilLinimasa(penggunaId, sebelumMs, batas = 50) {
          const kunci = 'linimasa:' + penggunaId;
          // REV + BYSCORE: ambil yang skornya lebih kecil dari kursor, terbaru dulu.
          return redis.zrange(
            kunci, '(' + sebelumMs, '-inf',
            'BYSCORE', 'REV', 'LIMIT', 0, batas,
          );
        }
        `,
        {
          caption:
            'Baris expire adalah yang menghemat paling banyak: linimasa pengguna tidak aktif hilang sendiri.',
        },
      ),
      p(
        'Batas seribu entri pada baris pemotongan adalah keputusan yang perlu dijelaskan. Hampir tidak ada yang menggulir linimasa lebih dari beberapa ratus entri, sehingga menyimpan lebih banyak berarti membayar penyimpanan untuk sesuatu yang tidak dibaca. Bila ada yang benar-benar menggulir melewati seribu, sistem bisa jatuh ke pembacaan langsung dari basis data, dan itu kasus yang sangat jarang sehingga kelambatannya bisa diterima.',
      ),
      h2('Jalur memposting'),
      code(
        'js',
        `
        const AMBANG_AKUN_BESAR = 100_000;

        app.post('/api/v1/tulisan', pembatasLaju('tulis'), async (req, res) => {
          const { isi } = SkemaTulisan.parse(req.body);
          const penulisId = req.session.penggunaId;

          // 1. Simpan tulisannya. Ini source of truth-nya.
          const tulisan = await db.tulisan.buat({ penulisId, isi });

          // 2. Jawab SEKARANG. Penyebaran tidak boleh menahan respons.
          res.status(201).json(tulisan);

          // 3. Putuskan cara menyebarkannya.
          const jumlahPengikut = await db.pengikut.hitung(penulisId);

          if (jumlahPengikut < AMBANG_AKUN_BESAR) {
            await antrean.add('sebar-linimasa', {
              tulisanId: tulisan.id,
              penulisId,
              waktuMs: tulisan.dibuatPada.getTime(),
            });
          } else {
            // Akun besar tidak menyebarkan apa pun. Cukup segarkan daftar
            // tulisan terbarunya, yang akan diambil pengikutnya saat membaca.
            await redis.zadd(
              'tulisan-terbaru:' + penulisId,
              tulisan.dibuatPada.getTime(),
              tulisan.id,
            );
            await redis.zremrangebyrank('tulisan-terbaru:' + penulisId, 0, -101);
          }
        });
        `,
      ),
      p(
        'Urutan pada potongan itu disengaja. Respons dikirim pada langkah kedua, sebelum keputusan penyebaran diambil, sehingga waktu tanggap memposting tidak pernah bergantung pada jumlah pengikut. Seorang pengguna dengan lima pengikut dan seorang dengan lima juta pengikut mendapat pengalaman memposting yang sama persis.',
      ),
      h2('Worker penyebaran'),
      code(
        'js',
        `
        worker.process('sebar-linimasa', async (job) => {
          const { tulisanId, penulisId, waktuMs } = job.data;
          const UKURAN_BATCH = 1000;
          let kursor = 0;

          for (;;) {
            const pengikut = await db.pengikut.ambilBatch(penulisId, kursor, UKURAN_BATCH);
            if (pengikut.length === 0) break;

            // Satu pipeline per batch, bukan satu perintah per pengikut.
            const pipeline = redis.pipeline();
            for (const p of pengikut) {
              const kunci = 'linimasa:' + p.pengikutId;
              pipeline.zadd(kunci, waktuMs, tulisanId);
              pipeline.zremrangebyrank(kunci, 0, -1001);
            }
            await pipeline.exec();

            kursor = pengikut[pengikut.length - 1].pengikutId;

            // Beri napas agar penyebaran akun besar tidak memonopoli Redis.
            await new Promise((resolve) => setImmediate(resolve));
          }
        });
        `,
        {
          caption:
            'Pipeline mengubah seribu perjalanan jaringan menjadi satu, dan itu selisih beberapa detik menjadi beberapa milidetik.',
        },
      ),
      p(
        'Perhatikan pekerjaan ini idempoten dengan sendirinya. Perintah `zadd` yang dijalankan dua kali dengan anggota dan skor yang sama menghasilkan keadaan yang persis sama, sehingga jaminan at-least-once dari antrean yang dibahas di sub-bab [antrean pesan](/kelas/system-design/blok-penyusun/antrean-pesan) tidak menimbulkan masalah apa pun di sini. Ini contoh rancangan yang membuat idempotensi menjadi gratis alih-alih harus ditambahkan.',
      ),
      h2('Jalur membaca'),
      code(
        'js',
        `
        app.get('/api/v1/linimasa', async (req, res) => {
          const penggunaId = req.session.penggunaId;
          const sebelum = Number(req.query.sebelum ?? Date.now());
          const batas = Math.min(Number(req.query.batas ?? 50), 100);

          // Dua sumber diambil serentak, bukan berurutan.
          const [dariLinimasa, akunBesar] = await Promise.all([
            ambilLinimasa(penggunaId, sebelum, batas),
            db.pengikut.akunBesarYangDiikuti(penggunaId), // biasanya 0 sampai 5
          ]);

          const dariAkunBesar = await Promise.all(
            akunBesar.map((akun) =>
              redis.zrange(
                'tulisan-terbaru:' + akun.id, '(' + sebelum, '-inf',
                'BYSCORE', 'REV', 'LIMIT', 0, batas,
              ),
            ),
          );

          // Gabungkan, urutkan, potong.
          const semuaId = [...dariLinimasa, ...dariAkunBesar.flat()];
          const tulisan = await ambilTulisanBanyak(semuaId); // satu MGET
          tulisan.sort((a, b) => b.waktuMs - a.waktuMs);
          const hasil = tulisan.slice(0, batas);

          res.json({
            data: hasil,
            berikutnya: hasil.length === batas
              ? String(hasil[hasil.length - 1].waktuMs)
              : null,
          });
        });
        `,
      ),
      code(
        'text',
        `
        ANGGARAN LATENSI

        ZRANGE linimasa siap pakai                     ~1 ms
        Query akun besar yang diikuti (dari cache)     ~1 ms
        ZRANGE untuk 5 akun besar, serentak            ~2 ms
        MGET isi tulisan untuk ~100 id                 ~3 ms
        Urutkan dan potong di aplikasi                 ~1 ms
        Serialisasi JSON                               ~5 ms
        --------------------------------------------------
        Total di server                               ~13 ms

        Anggaran P95 sebesar 200 ms terpakai kurang dari sepersepuluhnya.
        Sisanya untuk jaringan pengguna, dan itu memang bagian terbesar.
        `,
      ),

      h2('Celebrity problem yang tersisa'),
      p(
        'Aturan gabungan sudah menyelesaikan write amplification, dan masih ada satu hotspot yang tersisa. Kunci `tulisan-terbaru:` milik akun dengan sepuluh juta pengikut akan dibaca sangat sering, dan seluruh pembacaan itu jatuh ke satu simpul Redis.',
      ),
      p(
        'Jawabannya adalah cache dua tingkat dari sub-bab [ketika cache justru jadi masalah](/kelas/system-design/blok-penyusun/masalah-cache), yaitu menyimpan daftar tulisan terbaru akun besar di memori proses selama beberapa detik.',
      ),
      code(
        'js',
        `
        const cacheAkunBesar = new Map(); // akunId -> { daftar, kedaluwarsa }
        const TTL_LOKAL_MS = 3_000;

        async function tulisanTerbaruAkunBesar(akunId, sebelum, batas) {
          const tersimpan = cacheAkunBesar.get(akunId);
          if (tersimpan !== undefined && tersimpan.kedaluwarsa > Date.now()) {
            return tersimpan.daftar.filter((t) => t.waktuMs < sebelum).slice(0, batas);
          }

          const daftar = await ambilDariRedis(akunId);
          cacheAkunBesar.set(akunId, { daftar, kedaluwarsa: Date.now() + TTL_LOKAL_MS });
          return daftar.filter((t) => t.waktuMs < sebelum).slice(0, batas);
        }
        `,
      ),
      p(
        'Tiga detik keterlambatan tambahan masih jauh di dalam batas lima detik yang dinyatakan pada langkah satu, dan tiga detik itu menghilangkan hampir seluruh pembacaan berulang ke satu simpul yang panas.',
      ),

      h2('Empat hal yang mudah luput'),
      ul(
        '**Mengikuti akun baru.** Linimasa yang sudah jadi tidak memuat tulisan lama akun yang baru diikuti. Pilihannya menyisipkan tulisan lamanya secara mundur, atau membiarkan linimasa terisi secara alami mulai dari posting berikutnya. Pilihan kedua jauh lebih murah dan hampir tidak dikeluhkan siapa pun.',
        '**Berhenti mengikuti.** Membersihkan tulisan akun itu dari linimasa semua orang mahal. Alternatifnya menyaring saat membaca, dan itu cukup karena entri lama akan terdorong keluar sendiri oleh pemotongan seribu entri.',
        '**Menghapus tulisan.** Idnya masih ada di jutaan linimasa. Jangan hapus dari semuanya, cukup lewati saat isi tulisannya ternyata tidak ada lagi.',
        '**Pengguna yang sangat lama tidak aktif.** Linimasanya sudah kedaluwarsa dan hilang. Saat ia kembali, bangun ulang dengan fanout saat baca sekali, lalu simpan hasilnya.',
      ),
      p(
        'Keempatnya punya pola yang sama, yaitu jawaban yang benar hampir selalu **menyaring saat membaca** alih-alih **memperbaiki saat menulis**. Alasannya, pembacaan sudah menyentuh datanya sedangkan perbaikan saat menulis harus menyentuh jutaan baris.',
      ),

      h2('Langkah 4, tutup'),
      code(
        'text',
        `
        PERTUKARAN YANG DITERIMA
        - Tulisan muncul terlambat sampai 5 detik. Dinyatakan di langkah 1.
        - Linimasa dibatasi 1.000 entri. Menggulir lebih jauh jatuh ke basis data
          dan menjadi lambat. Diterima karena sangat jarang.
        - Mengikuti akun baru tidak menyisipkan tulisan lamanya.
        - Linimasa pengguna tidak aktif 30 hari dihapus, dan dibangun ulang saat kembali.

        LEHER BOTOL BERIKUTNYA
        - Penulisan fanout pada 174.000 per detik saat puncak. Satu instance Redis
          tidak cukup. Bagi kunci linimasa ke beberapa instance dengan hash ring.
        - Query jumlah pengikut pada setiap posting. Ganti dengan counter cache.

        PERBAIKAN YANG DIRENCANAKAN
        - Turunkan ambang akun besar dari 100.000 bila penulisan fanout mendekati batas.
          Pemicu: penulisan Redis melewati 70 persen kapasitas.
        - Sisipkan tulisan lama saat mengikuti akun baru, bila banyak yang meminta.
        `,
      ),
      callout(
        'tip',
        'Satu ambang mengubah seluruh sifat sistem',
        'Angka 100.000 pada studi kasus ini bukan sekadar pengaturan. Menurunkannya berarti lebih banyak akun ditangani saat baca sehingga beban tulis berkurang dan beban baca bertambah. Menaikkannya berarti sebaliknya. Satu angka itu adalah tuas utama yang menyeimbangkan seluruh sistem, dan mengetahui tuas mana yang seperti itu adalah bagian penting dari memahami sebuah desain.',
      ),

      references(
        {
          label: 'Redis: Sorted sets',
          href: 'https://redis.io/docs/latest/develop/data-types/sorted-sets/',
          source: 'Redis',
          note: 'Struktur yang menjadi dasar seluruh penyimpanan linimasa di sub-bab ini.',
        },
        {
          label: 'Redis: ZRANGE',
          href: 'https://redis.io/docs/latest/commands/zrange/',
          source: 'Redis',
          note: 'Opsi BYSCORE, REV, dan LIMIT yang dipakai untuk paginasi kursor.',
        },
        {
          label: 'Redis: Pipelining',
          href: 'https://redis.io/docs/latest/develop/use/pipelining/',
          source: 'Redis',
          note: 'Alasan pipeline mengubah seribu perjalanan jaringan menjadi satu.',
        },
        {
          label: 'Cassandra: Time series data model',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/data_modeling/data_modeling_rdbms.html',
          source: 'Apache Cassandra',
          note: 'Model penyimpanan yang lazim dipakai untuk tulisan itu sendiri pada skala ini.',
        },
      ),
    ],
  ),

  written(
    'praktik-rancang-sendiri',
    'Praktik: Rancang Sistemmu Sendiri',
    14,
    'Kerangka kerja, daftar periksa, dan tiga latihan dengan tingkat kesulitan menaik.',
    [
      p(
        'Sub-bab penutup kategori ini tidak memperkenalkan konsep baru. Isinya adalah cara memakai seluruh isi empat bab sebelumnya pada sistem yang kamu pilih sendiri, beserta daftar periksa yang bisa dipakai untuk menilai hasilnya.',
      ),
      p(
        'Kemampuan yang sedang dilatih di sini bukan menghafal susunan, melainkan **mengubah kebutuhan menjadi angka, lalu mengubah angka menjadi keputusan yang bisa dijelaskan**. Susunan yang bagus tanpa alasan yang bisa disebutkan tidak lebih baik daripada tebakan yang kebetulan benar.',
      ),

      terms(
        {
          term: 'design checklist',
          meaning:
            'Daftar pertanyaan yang dijalankan pada sebuah desain untuk menemukan yang terlewat. Berguna justru karena yang terlewat biasanya bukan hal yang sulit, melainkan hal yang tidak terpikir sama sekali, dan daftar periksa menutup celah itu jauh lebih andal daripada mengandalkan ingatan.',
        },
        {
          term: 'design review',
          meaning:
            'Membacakan desain kepada orang lain lalu menerima pertanyaannya. Hampir selalu menemukan asumsi yang tidak disadari penulisnya, karena penulis sudah terlalu dekat dengan gagasannya sendiri untuk melihat lubangnya.',
        },
      ),

      h2('Kerangka satu halaman'),
      p(
        'Salin kerangka berikut dan isi untuk sistem yang kamu rancang. Bentuknya sama dengan yang dibahas di sub-bab [menulis dokumen desain](/kelas/system-design/fondasi-sistem/menulis-dokumen-desain), dengan penambahan bagian kesembilan yang khusus untuk latihan ini.',
      ),
      code(
        'text',
        `
        DESAIN: <nama sistem>
        Penulis: <nama>   Tanggal: <tanggal>   Status: latihan

        1. MASALAH
        <Apa yang belum bisa dilakukan hari ini, dan siapa yang dirugikan.>

        2. CAKUPAN
        Dikerjakan      : <3 sampai 5 butir>
        Tidak dikerjakan: <3 sampai 5 butir, dan ini sama pentingnya>

        3. ANGKA
        DAU                  <angka>   <sumber atau tandai tebakan>
        Aksi baca per orang  <angka>
        Aksi tulis per orang <angka>
        QPS baca rata-rata   <hitung>  = DAU x baca / 86.400
        QPS baca puncak      <hitung>  = rata-rata x faktor puncak
        QPS tulis puncak     <hitung>
        Perbandingan b:t     <hitung>
        Ukuran satu catatan  <hitung>  jumlah kolom + 40 persen
        Penyimpanan setahun  <hitung>
        Bandwidth keluar     <hitung>
        Target latensi       <angka>   P95 dan P99
        Target ketersediaan  <angka>   boleh berbeda per fungsi
        Konsistensi          <per jenis data, bukan satu jawaban>

        4. DESAIN
        <Diagram dengan panah berlabel.>
        <3 sampai 5 endpoint inti.>
        <Skema entitas utama beserta indexnya.>

        5. KEPUTUSAN PENTING
        <2 sampai 3 keputusan tersulit.>
        <Setiap keputusan: tabel pembanding, lalu pilihan beserta alasannya
         yang merujuk angka di bagian 3.>

        6. ALTERNATIF YANG DITOLAK
        <Apa yang dipertimbangkan dan kenapa tidak dipilih.>

        7. RISIKO DAN PERTUKARAN
        <Yang diterima secara sadar, beserta akibatnya bagi pengguna.>

        8. RENCANA BERIKUTNYA
        <Bottleneck berikutnya, beserta pemicu terukurnya.>

        9. KEGAGALAN
        <Untuk setiap komponen: apa yang terjadi bila ia mati sekarang.>
        <Mana yang boleh mati tanpa menjatuhkan fungsi utama.>
        `,
      ),

      h2('Daftar periksa'),
      p(
        'Jalankan daftar berikut pada desainmu. Setiap butir yang tidak bisa dijawab menunjukkan bagian yang belum selesai dipikirkan, bukan bagian yang tidak penting.',
      ),
      checklist(
        'system-design/daftar-periksa-desain',
        'Daftar periksa desain sistem',
        'Kebutuhan fungsional ditulis dalam 3 sampai 5 butir yang konkret',
        'Daftar di luar cakupan ditulis, bukan dibiarkan kosong',
        'DAU, QPS puncak, dan penyimpanan setahun sudah dihitung, bukan ditaksir',
        'Setiap angka diberi label sumbernya atau ditandai sebagai tebakan',
        'Perbandingan baca dan tulis sudah dihitung, karena ia menentukan arah desain',
        'Target latensi ditulis sebagai persentil, bukan rata-rata',
        'Target ketersediaan ditetapkan per fungsi, bukan satu angka untuk semuanya',
        'Kebutuhan konsistensi diputuskan per jenis data',
        'Diagram punya label pada setiap panah, termasuk mana yang asinkron',
        'Kontrak API inti ditulis lengkap dengan kode statusnya',
        'Model data menyertakan index untuk setiap pertanyaan yang pasti muncul',
        'Minimal dua keputusan disajikan dengan pembanding, bukan pilihan tunggal',
        'Setiap alasan keputusan merujuk angka pada bagian estimasi',
        'Alternatif yang ditolak dicatat beserta alasannya',
        'Setiap komponen sudah ditanyai apa yang terjadi bila ia mati',
        'Cache dan komponen pendukung lain bisa gagal tanpa menjatuhkan fungsi utama',
        'Pekerjaan yang berjalan di antrean aman bila dijalankan lebih dari sekali',
        'Setiap panggilan keluar punya timeout',
        'Ada rencana pemantauan berisi empat golden signal',
        'Bottleneck berikutnya disebutkan beserta pemicu terukurnya',
        'Pertukaran yang diterima ditulis terbuka beserta akibatnya bagi pengguna',
      ),

      h2('Latihan 1, papan peringkat'),
      p('Tingkat mudah. Sistem kecil dengan satu keputusan yang menarik.'),
      code(
        'text',
        `
        KEBUTUHAN
        - Pemain menyelesaikan permainan dan mengirim skornya.
        - Halaman papan peringkat menampilkan 100 pemain teratas.
        - Setiap pemain bisa melihat peringkatnya sendiri, berapa pun posisinya.

        ANGKA
        DAU                   2 juta
        Permainan per orang   5 per hari
        Buka papan per orang  3 per hari
        Peringkat harus segar dalam beberapa detik

        PERTANYAAN YANG HARUS DIJAWAB DESAINMU
        1. Hitung QPS tulis dan QPS baca.
        2. "Peringkat saya" pada 50 juta pemain: kenapa COUNT tidak bisa dipakai?
        3. Struktur data apa yang membuat kedua operasi murah sekaligus?
        4. Papan peringkat harian, mingguan, dan sepanjang masa: berapa struktur
           yang dibutuhkan, dan kapan yang harian dibuang?
        5. Apa yang terjadi bila penyimpanannya mati? Boleh hilang atau tidak?
        `,
      ),
      p(
        'Petunjuk untuk pertanyaan ketiga, sorted set Redis punya operasi yang mengembalikan peringkat sebuah anggota tanpa menghitung apa pun. Petunjuk untuk pertanyaan kelima, papan peringkat sepanjang masa biasanya tidak boleh hilang, dan itu berarti Redis di sini bukan cache melainkan penyimpanan utama, dengan konsekuensi pencadangan dan replikasi yang menyertainya.',
      ),

      h2('Latihan 2, sistem pemberitahuan'),
      p('Tingkat menengah. Beberapa saluran, kegagalan pihak ketiga, dan pilihan pengguna.'),
      code(
        'text',
        `
        KEBUTUHAN
        - Kirim pemberitahuan lewat push, SMS, dan email.
        - Pengguna memilih saluran mana yang aktif dan jam berapa boleh dikirim.
        - Pengiriman yang gagal dicoba ulang.
        - Tidak boleh mengirim pemberitahuan yang sama dua kali.

        ANGKA
        DAU                       10 juta
        Pemberitahuan per orang   8 per hari
        Lonjakan siaran           5 juta pemberitahuan dalam 5 menit
        Push berhasil sekitar     95 persen
        SMS lebih lambat          rata-rata 2 detik per pengiriman

        PERTANYAAN YANG HARUS DIJAWAB DESAINMU
        1. Hitung QPS rata-rata, lalu hitung QPS saat siaran 5 juta dalam 5 menit.
           Berapa selisihnya, dan apa artinya bagi rancanganmu?
        2. Satu antrean untuk semua saluran, atau satu antrean per saluran? Kenapa?
        3. Penyedia SMS mati selama satu jam. Apa yang terjadi pada antrean push?
        4. Bagaimana memastikan satu pemberitahuan tidak terkirim dua kali,
           padahal antrean menjamin at-least-once?
        5. Pemberitahuan mendesak seperti reset password bercampur dengan siaran
           pemasaran. Bagaimana yang mendesak tidak tertahan di belakang antrean?
        6. Jam tenang pengguna sedang berlaku. Tunda, atau buang?
        `,
      ),
      p(
        'Pertanyaan kelima adalah inti latihan ini. Jawaban yang memisahkan antrean menurut **prioritas**, bukan hanya menurut saluran, adalah jawaban yang sudah memahami masalah sesungguhnya. Lima juta pemberitahuan pemasaran yang menumpuk di depan satu email reset password adalah kegagalan yang nyata dan sering terjadi.',
      ),

      h2('Latihan 3, unggah dan pemutaran video'),
      p('Tingkat sulit. Berkas besar, pemrosesan berat, dan bandwidth yang mendominasi.'),
      code(
        'text',
        `
        KEBUTUHAN
        - Pengguna mengunggah video sampai 2 GB.
        - Video diubah ke beberapa mutu, yaitu 360p, 720p, dan 1080p.
        - Pemutaran lancar, bisa melompat ke posisi mana pun.
        - Pengunggah melihat kemajuan pemrosesan.

        ANGKA
        DAU                    5 juta
        Unggah per hari        50.000 video
        Rata-rata ukuran       200 MB
        Tayangan per hari      20 juta
        Rata-rata ditonton     5 menit
        Laju bit 720p          sekitar 2,5 Mbps

        PERTANYAAN YANG HARUS DIJAWAB DESAINMU
        1. Hitung penyimpanan per hari, sebelum dan sesudah tiga mutu.
        2. Hitung bandwidth keluar saat puncak. Apa kesimpulan yang langsung muncul
           dari angka itu?
        3. Unggahan 2 GB lewat satu permintaan HTTP: kenapa itu rancangan yang buruk,
           dan apa gantinya?
        4. Pengubahan mutu memakan waktu menit sampai jam. Bagaimana pengunggah
           mengetahui kemajuannya tanpa terus bertanya ke server?
        5. Melompat ke menit ke-30 tanpa mengunduh 30 menit pertama: apa yang
           dibutuhkan agar itu mungkin?
        6. Satu video mendadak sangat populer. Apa yang menjadi bottleneck?
        7. Pengubahan mutu gagal di tengah untuk video 2 GB. Apa yang terjadi
           saat dicoba ulang?
        `,
      ),
      p(
        'Pertanyaan kedua akan menghasilkan angka yang sangat besar, dan angka itu langsung menutup sebagian besar pilihan rancangan. Pertanyaan ketujuh adalah tempat idempotensi pada sub-bab [antrean pesan](/kelas/system-design/blok-penyusun/antrean-pesan) menjadi sangat konkret, karena mengulang pengubahan mutu dari awal untuk berkas dua gigabita adalah pemborosan yang sangat besar bila pekerjaannya tidak dipecah menjadi bagian-bagian yang bisa dilanjutkan.',
      ),

      h2('Menilai desainmu sendiri'),
      table(
        ['Tingkat', 'Ciri-cirinya'],
        [
          ['Belum memadai', 'Langsung menggambar komponen, tanpa angka, tanpa alasan'],
          [
            'Dasar',
            'Ada kebutuhan dan diagram, angka masih ditaksir, satu pilihan tanpa pembanding',
          ],
          ['Cukup', 'Angka dihitung, keputusan punya pembanding, kegagalan sebagian dipikirkan'],
          [
            'Baik',
            'Setiap keputusan merujuk angka, pertukaran ditulis terbuka, bottleneck berikutnya diketahui',
          ],
          [
            'Sangat baik',
            'Semua di atas, ditambah alternatif yang ditolak, pemicu terukur, dan pengakuan jujur atas yang belum dibahas',
          ],
        ],
      ),
      p(
        'Perbedaan antara tingkat "cukup" dan "baik" hampir seluruhnya terletak pada satu hal, yaitu apakah alasan sebuah keputusan bisa ditelusuri ke angka pada bagian estimasi. Desain yang memilih cache "karena bacanya banyak" berada di tingkat cukup, sedangkan desain yang memilih cache "karena perbandingan baca dan tulisnya lima puluh banding satu dan sepuluh kunci teratas menguasai enam puluh persen permintaan" berada di tingkat baik.',
      ),

      h2('Menutup kategori ini'),
      p(
        'Empat bab kategori ini berjalan dari kosakata sampai penerapan. Bab 1 memberi cara mengubah kebutuhan menjadi angka. Bab 2 memberi katalog blok beserta pemicu pemasangannya. Bab 3 menelusuri jalan keluar lapisan data dalam urutan yang benar. Bab 4 menambahkan apa yang dibutuhkan agar susunan itu bertahan hidup, lalu memakai semuanya pada sistem nyata.',
      ),
      p(
        'Satu gagasan menghubungkan seluruhnya, dan gagasan itu layak dibawa keluar dari kategori ini. **Setiap keputusan desain adalah pertukaran, dan tugasmu bukan menghindari harganya melainkan mengetahui harganya lalu memutuskan apakah sepadan.**',
      ),
      p(
        'Gagasan turunannya sama pentingnya, yaitu hampir semua sistem yang akan kamu bangun **tidak membutuhkan sebagian besar isi kategori ini**. Mengetahui bahwa satu server dengan index yang benar sudah cukup adalah penerapan desain sistem yang sama sahnya dengan merancang susunan berlapis, dan biasanya jauh lebih berharga bagi orang yang akan merawatnya sesudahmu.',
      ),

      references(
        {
          label: 'Site Reliability Engineering: Simplicity',
          href: 'https://sre.google/sre-book/simplicity/',
          source: 'Google SRE',
          note: 'Alasan resmi menahan diri dari kerumitan yang belum dibutuhkan.',
        },
        {
          label: 'Redis: Sorted sets',
          href: 'https://redis.io/docs/latest/develop/data-types/sorted-sets/',
          source: 'Redis',
          note: 'Struktur yang menjawab latihan pertama, termasuk operasi peringkat.',
        },
        {
          label: 'BullMQ: Prioritized jobs',
          href: 'https://docs.bullmq.io/guide/jobs/prioritized',
          source: 'BullMQ',
          note: 'Bahan untuk pertanyaan prioritas pada latihan kedua.',
        },
        {
          label: 'MDN: Range requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests',
          source: 'MDN',
          note: 'Mekanisme yang membuat melompat ke tengah video menjadi mungkin.',
        },
        {
          label: 'The Twelve-Factor App',
          href: 'https://12factor.net/',
          source: '12factor',
          note: 'Syarat dasar agar sistem hasil rancanganmu bisa dijalankan berganda.',
        },
      ),
    ],
  ),
];
