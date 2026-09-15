import {
  callout,
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
 * Architecture Design — Chapter 3, seven lessons.
 *
 * What happens after a boundary exists. Every lesson here assumes the reader already decided to
 * separate something; none of them argues for separating more.
 *
 * The chapter is ordered by what breaks first in practice: the sync/async choice decides what
 * happens when the other side is slow, the contract decides whether releases stay independent,
 * and only then do events, data ownership, and consistency become answerable.
 */
export const lessons: LessonDraft[] = [
  written(
    'sinkron-atau-asinkron',
    'Sinkron atau Asinkron',
    21,
    'Pilihan yang menentukan apa yang terjadi ketika lawan bicara sedang bermasalah.',
    [
      p(
        'Ada dua cara meminta tolong kepada orang lain, dan kamu memakai keduanya setiap hari tanpa memikirkannya.',
      ),
      p(
        'Cara pertama, kamu menelepon dan menunggu di telepon sampai orangnya menjawab. Kamu tidak bisa mengerjakan hal lain selama menunggu, dan kalau orangnya tidak mengangkat, urusanmu gagal saat itu juga.',
      ),
      p(
        'Cara kedua, kamu mengirim pesan lalu melanjutkan pekerjaanmu. Kalau orangnya sedang sibuk, pesannya tetap tersimpan dan dibaca nanti. Kamu tidak tahu kapan selesai, tetapi kamu juga tidak berhenti bekerja karenanya.',
      ),
      p(
        'Kedua cara itu punya nama di dunia perangkat lunak, yaitu **sinkron** untuk yang menunggu dan **asinkron** untuk yang menitipkan. Dan memilih di antara keduanya adalah keputusan arsitektur yang menentukan apa yang terjadi ketika bagian yang dipanggil sedang lambat, sedang mati, atau sedang penuh.',
      ),
      p(
        'Contoh nyatanya di aplikasi toko. Kalau modul pesanan mengirim email konfirmasi sambil menunggu selesai, maka penyedia email yang sedang lambat membuat pembeli ikut menunggu di halaman checkout, padahal ia tidak peduli emailnya sudah terkirim atau belum. Kalau modul pesanan menitipkan perintah kirim email ke antrean lalu langsung menjawab, penyedia email yang lambat tidak dirasakan pembeli sama sekali.',
      ),

      terms(
        {
          term: 'synchronous (sinkron)',
          meaning:
            'Pola ketika pemanggil menunggu sampai jawaban datang sebelum melanjutkan. Dibaca "sinkron", artinya sewaktu atau bersamaan. Ini cara menelepon lalu menunggu di telepon. Bentuk paling umumnya adalah `await fetch(...)` yang menunggu respons HTTP. Kelebihannya jawabannya langsung tersedia sehingga kamu bisa memutuskan berdasarkan jawaban itu. Kekurangannya nasib pemanggil terikat pada nasib yang dipanggil, yaitu kalau yang dipanggil lambat, pemanggil ikut lambat.',
        },
        {
          term: 'asynchronous (asinkron)',
          meaning:
            'Pola ketika pemanggil menitipkan pekerjaan lalu melanjutkan hidupnya tanpa menunggu hasil. Dibaca "asinkron", artinya tidak sewaktu. Ini cara mengirim pesan lalu melanjutkan pekerjaan. Bentuk paling umumnya adalah menaruh pesan di antrean seperti `antrean.tambah(...)`. Perlu ditegaskan supaya tidak tertukar, kata asinkron di sini **berbeda** dari `async` dan `await` di JavaScript. `await fetch()` tetap termasuk sinkron dalam pengertian arsitektur, karena kode berikutnya tetap menunggu jawabannya.',
        },
        {
          term: 'temporal coupling (keterikatan waktu)',
          meaning:
            'Keadaan ketika dua bagian harus hidup pada waktu yang sama agar pekerjaan bisa selesai. Panggilan sinkron menciptakan keterikatan ini, karena pemanggil gagal kalau yang dipanggil sedang mati. Antrean memutusnya, karena pesan tetap tersimpan sampai penerimanya hidup kembali. Bandingkan dengan menelepon dan mengirim pesan. Telepon menuntut keduanya hadir pada detik yang sama. Pesan tidak, dan itulah sebabnya pesan tetap sampai meskipun penerimanya sedang tidur.',
        },
        {
          term: 'backpressure',
          meaning:
            'Mekanisme yang menahan laju masuknya pekerjaan ketika penerimanya sudah kewalahan. Dibaca "bekpresyer", artinya tekanan balik. Analoginya antrean di loket. Kalau petugasnya hanya sanggup melayani sepuluh orang per jam sementara yang datang lima puluh, yang terjadi bukan petugasnya meledak, melainkan antreannya memanjang. Antrean memberi bentuk backpressure yang alami, karena pekerjaan menumpuk di tempat yang aman yaitu antrean, alih-alih menumpuk sebagai sambungan yang menggantung dan menghabiskan memori layananmu.',
        },
        {
          term: 'fire and forget',
          meaning:
            'Mengirim pesan lalu sama sekali tidak peduli hasilnya. Dibaca "faier en forget", artinya tembak lalu lupakan. Bentuk ini berbahaya kalau dipakai untuk pekerjaan yang penting, karena kegagalan tidak akan pernah diketahui siapa pun. Contoh nyatanya, memanggil `kirimEmail(...)` tanpa `await` dan tanpa `catch`. Kalau pengirimannya gagal, tidak ada error yang muncul di mana pun, tidak ada yang tercatat, dan pembeli tidak pernah menerima konfirmasinya. Untuk pekerjaan penting, yang benar adalah antrean dengan percobaan ulang dan tempat penampungan bagi yang tetap gagal.',
        },
        {
          term: 'request-reply',
          meaning:
            'Pola ketika sebuah permintaan dikirim lewat pesan dan jawabannya juga dikirim lewat pesan, biasanya ke antrean balasan yang sudah ditentukan. Dibaca "rikuest riplai". Bentuk campuran ini jarang dibutuhkan di aplikasi web biasa, dan biasanya lebih sederhana memakai polling terhadap status pekerjaan.',
        },
        {
          term: 'cascading failure',
          meaning:
            'Kegagalan yang merambat dari satu bagian ke bagian lain sampai seluruh sistem ikut jatuh. Dibaca "keskeiding feilyur", artinya kegagalan beruntun seperti air terjun bertingkat. Cara merambatnya begini. Layanan C melambat, sehingga layanan B yang memanggilnya ikut menahan sambungan, sehingga sambungan B habis, sehingga layanan A yang memanggil B ikut gagal. Rantai panggilan sinkron adalah jalur perambatan yang paling umum, dan sub-bab [titik kegagalan tunggal](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal) sudah membahas cara memutusnya.',
        },
      ),

      h2('Pertanyaan yang menentukan'),
      p(
        'Ada satu pertanyaan yang hampir selalu cukup untuk memilih, dan pertanyaan itu bukan tentang performa. Pertanyaannya adalah **apakah pemanggil benar-benar butuh hasilnya sekarang untuk bisa melanjutkan**.',
      ),
      table(
        ['Situasi', 'Butuh hasil sekarang?', 'Pilihan'],
        [
          [
            'Menampilkan detail pesanan yang butuh nama produk',
            'Ya. Halaman tidak bisa dirender tanpa itu',
            'Sinkron',
          ],
          [
            'Memeriksa stok sebelum pesanan dibuat',
            'Ya. Keputusan berikutnya bergantung padanya',
            'Sinkron',
          ],
          [
            'Mengirim email konfirmasi setelah pesanan dibuat',
            'Tidak. Pembeli tidak menunggu emailnya sampai',
            'Asinkron',
          ],
          [
            'Membuat berkas PDF invoice',
            'Tidak. Bisa disediakan beberapa detik kemudian',
            'Asinkron',
          ],
          [
            'Memperbarui angka statistik penjualan',
            'Tidak. Selisih beberapa detik tidak merugikan siapa pun',
            'Asinkron',
          ],
          [
            'Memotong saldo saat pembelian',
            'Ya. Sisa saldo menentukan boleh tidaknya transaksi',
            'Sinkron',
          ],
        ],
        'Perhatikan bahwa alasannya selalu tentang alur keputusan, bukan tentang cepat atau lambat.',
      ),
      p(
        'Kesalahan yang paling sering adalah menjawab pertanyaan itu dengan kebiasaan, bukan dengan kebutuhan. Karena rute HTTP sudah `async` dan memanggil sesuatu terasa mudah, hampir semua hal dikerjakan di dalam permintaan. Akibatnya halaman checkout ikut lambat setiap kali penyedia email sedang bermasalah, padahal pembeli tidak pernah peduli emailnya sudah terkirim atau belum saat ia menekan tombol.',
      ),

      h2('Yang berubah saat sesuatu bermasalah'),
      p(
        'Perbedaan sesungguhnya baru terlihat ketika ada yang salah. Tabel berikut membandingkan keduanya pada empat keadaan buruk yang pasti terjadi cepat atau lambat.',
      ),
      table(
        ['Keadaan', 'Sinkron', 'Asinkron lewat antrean'],
        [
          [
            'Penerima mati total',
            'Pemanggil gagal seketika. Pengguna melihat error',
            'Pesan menunggu di antrean. Pengguna tidak merasakan apa-apa',
          ],
          [
            'Penerima sangat lambat',
            'Sambungan pemanggil tertahan dan bisa habis, lalu kegagalan merambat',
            'Antrean menumpuk. Pemanggil sama sekali tidak terpengaruh',
          ],
          [
            'Lonjakan permintaan mendadak',
            'Penerima kewalahan dan mulai menolak',
            'Antrean menyerap lonjakan, penerima bekerja sesuai kemampuannya',
          ],
          [
            'Penerima dirilis ulang',
            'Ada jeda ketika permintaan gagal',
            'Pesan menunggu, dikerjakan setelah penerima hidup kembali',
          ],
        ],
        'Kolom kanan bukan berarti lebih baik. Ia berarti kegagalannya berpindah tempat, dari pengguna ke antrean.',
      ),
      callout(
        'warning',
        'Asinkron memindahkan masalah, bukan menghapusnya',
        'Antrean yang menumpuk tetap masalah, hanya saja ia menjadi masalah yang punya waktu untuk ditangani. Karena itu panjang antrean wajib dipantau dan diberi alert. Antrean yang tumbuh terus tanpa ada yang tahu berujung pada email konfirmasi yang sampai dua hari kemudian, dan itu lebih buruk daripada gagal seketika.',
      ),

      h2('Bentuk sinkron yang bertanggung jawab'),
      p(
        'Kalau jawabannya memang sinkron, ada tiga hal yang tidak boleh dilewatkan. Ketiganya sudah kamu pelajari di kategori sebelumnya, dan di sini ketiganya berubah dari saran menjadi kewajiban.',
      ),
      code(
        'ts',
        `
        // Panggilan sinkron ke bagian lain, dengan tiga pengaman wajib.

        const BATAS_WAKTU_MS = 800;

        export async function ambilRingkasanProduk(
          idProduk: string,
        ): Promise<RingkasanProduk | null> {
          // 1. Timeout. Tanpa ini, satu penerima yang lambat menahan sambungan tanpa batas.
          const pembatal = AbortSignal.timeout(BATAS_WAKTU_MS);

          try {
            const respons = await fetch(\`\${ALAMAT_KATALOG}/produk/\${idProduk}\`, {
              signal: pembatal,
              headers: { 'x-id-korelasi': idKorelasiSaatIni() },
            });

            if (respons.status === 404) return null;
            if (!respons.ok) throw new Error(\`katalog menjawab \${respons.status}\`);

            // 2. Validasi. Respons dari luar adalah input tak tepercaya.
            return SkemaRingkasanProduk.parse(await respons.json());
          } catch (galat) {
            metrik.tambah('katalog.gagal');

            // 3. Keputusan sadar saat gagal. Di sini: menyerah, karena nama produk
            //    memang wajib ada. Untuk data pelengkap, kembalikan nilai cadangan.
            throw new GagalMenghubungiKatalog({ cause: galat });
          }
        }
        `,
        {
          filename: 'src/pesanan/klien-katalog.ts',
          caption:
            'Header `x-id-korelasi` yang diteruskan adalah yang membuat satu permintaan bisa ditelusuri lintas bagian.',
        },
      ),
      p(
        'Poin ketiga adalah yang paling sering dilewati. Setiap panggilan ke luar butuh **keputusan sadar tentang apa yang terjadi ketika ia gagal**, dan keputusan itu berbeda-beda. Nama produk yang gagal diambil berarti halaman detail pesanan memang tidak bisa ditampilkan. Daftar rekomendasi yang gagal diambil sebaiknya menghasilkan halaman tanpa rekomendasi, bukan halaman error.',
      ),
      compare(
        {
          title: 'Gagal berarti seluruh halaman gagal',
          lang: 'ts',
          code: `
            const [pesanan, produk, rekomendasi] = await Promise.all([
              ambilPesanan(id),
              ambilProduk(idProduk),
              ambilRekomendasi(idPembeli),
            ]);

            // Promise.all menolak begitu SATU gagal.
            // Layanan rekomendasi yang mati menjatuhkan seluruh halaman pesanan.
          `,
          notes: [
            'Ketersediaan halaman menjadi hasil perkalian ketersediaan tiga layanan',
            'Bagian yang paling tidak penting punya kuasa menjatuhkan yang penting',
          ],
        },
        {
          title: 'Gagal berarti bagian itu saja yang kosong',
          lang: 'ts',
          code: `
            const [pesanan, produk] = await Promise.all([
              ambilPesanan(id),
              ambilProduk(idProduk),
            ]);

            // Yang boleh gagal dipisahkan, dengan nilai cadangan yang jelas.
            const rekomendasi = await ambilRekomendasi(idPembeli).catch(() => {
              metrik.tambah('rekomendasi.dilewati');
              return [];
            });
          `,
          notes: [
            'Ketersediaan halaman hanya bergantung pada yang benar-benar wajib',
            'Kegagalan tetap tercatat sebagai metrik, bukan hilang diam-diam',
          ],
        },
      ),

      h2('Bentuk asinkron yang bertanggung jawab'),
      p(
        'Kalau jawabannya asinkron, ada empat hal yang wajib ada. Sub-bab [antrean pesan](/kelas/system-design/blok-penyusun/antrean-pesan) sudah membahas mekanismenya, jadi di sini fokusnya pada apa yang membuat sebuah pemakaian antrean layak disebut selesai.',
      ),
      ol(
        '**Pengerjaan yang aman diulang.** Antrean menjamin pesan sampai minimal sekali, bukan tepat sekali. Pekerja harus menghasilkan keadaan yang sama meskipun dijalankan dua kali.',
        '**Retry dengan jeda yang membesar.** Mengulang seketika saat penerima sedang bermasalah hanya menambah beban. Jeda yang membesar memberi waktu pulih.',
        '**Tujuan akhir untuk yang gagal terus.** Pesan yang gagal berkali-kali dipindahkan ke dead letter, dan ada orang yang benar-benar melihatnya.',
        '**Pemantauan panjang antrean.** Antrean yang tumbuh terus adalah gangguan yang berjalan lambat, dan tanpa alert ia baru ketahuan dari keluhan pengguna.',
      ),
      code(
        'ts',
        `
        // Pekerja yang aman diulang, memakai penanda sekali pakai.
        // Menjalankan pesan yang sama dua kali menghasilkan satu email, bukan dua.

        export async function kerjakanKirimEmail(pekerjaan: { idPesanan: string }) {
          const kunci = \`email-konfirmasi:\${pekerjaan.idPesanan}\`;

          // SET dengan NX hanya berhasil kalau kuncinya belum ada.
          const pertamaKali = await redis.set(kunci, '1', { NX: true, EX: 60 * 60 * 24 });
          if (!pertamaKali) {
            metrik.tambah('email.dilewati_karena_duplikat');
            return;
          }

          await pengirimEmail.kirim(await susunEmailKonfirmasi(pekerjaan.idPesanan));
        }
        `,
        {
          filename: 'src/notifikasi/pekerja-email.ts',
          caption:
            'Tanpa penanda ini, pekerja yang mati setelah mengirim tetapi sebelum menyatakan selesai akan mengirim ulang.',
        },
      ),

      h2('Pola campuran yang paling berguna'),
      p(
        'Banyak alur nyata tidak sepenuhnya sinkron maupun asinkron. Bentuk campuran yang paling sering dipakai adalah **menjawab cepat lalu mengerjakan di belakang**, dan bentuk ini sudah dibahas dari sisi kontrak API di sub-bab [operasi panjang](/kelas/backend-intermediate/desain-api/operasi-panjang).',
      ),
      steps(
        {
          title: 'Terima dan validasi seketika',
          body: 'Bagian yang harus benar sekarang dikerjakan sinkron, misalnya memeriksa hak akses, memvalidasi bentuk masukan, dan memastikan datanya masuk akal. Kalau ada yang salah, pengguna tahu saat itu juga.',
        },
        {
          title: 'Simpan niatnya, lalu jawab',
          body: 'Simpan permintaan sebagai baris berstatus `menunggu` lalu jawab dengan 202 beserta alamat untuk memeriksa perkembangannya. Sampai titik ini semuanya masih cepat dan tidak bergantung pada layanan mana pun.',
        },
        {
          title: 'Kerjakan di belakang',
          body: 'Pekerja mengambil pekerjaan dari antrean, mengerjakannya, lalu memperbarui status baris tadi. Kegagalan di sini diulang, dan yang tetap gagal berakhir di dead letter dengan status yang bisa dilihat pengguna.',
        },
        {
          title: 'Beri tahu atau biarkan ditanya',
          body: 'Klien bisa memeriksa berkala ke alamat status, atau diberi tahu lewat sambungan realtime. Yang penting statusnya selalu bisa dilihat, sehingga pengguna tidak menebak-nebak.',
        },
      ),
      callout(
        'tip',
        'Menyimpan niat sebelum menjawab adalah bagian yang tidak boleh dilewati',
        'Menjawab 202 lalu baru menaruh pesan di antrean menyisakan celah, yaitu kalau proses mati di antara keduanya, pengguna sudah diberi tahu bahwa permintaannya diterima padahal tidak ada jejaknya. Menyimpan barisnya lebih dulu di database yang sama dengan transaksi utama menutup celah itu, dan sub-bab 3.5 membahas polanya secara lengkap.',
      ),

      h2('Rangkuman'),
      ul(
        'Pertanyaan penentunya adalah apakah pemanggil benar-benar butuh hasilnya sekarang untuk melanjutkan.',
        'Sinkron mengikat nasib pemanggil pada nasib yang dipanggil, asinkron memutus keterikatan itu.',
        'Asinkron memindahkan masalah ke antrean, sehingga panjang antrean wajib dipantau dan diberi alert.',
        'Panggilan sinkron wajib punya timeout, validasi respons, dan keputusan sadar saat gagal.',
        'Pemakaian antrean baru selesai kalau pengerjanya aman diulang, punya retry berjeda, punya dead letter, dan dipantau.',
        'Pola campuran yang paling berguna adalah validasi sinkron, simpan niatnya, jawab 202, lalu kerjakan di belakang.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Pilihan antara sinkron dan asinkron menentukan dua hal sekaligus, yaitu apakah pemanggil menunggu dan apa yang terjadi ketika yang dipanggil sedang mati.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada Node 26.5.0, 1 pekerjaan berat
        ditambah 5 permintaan ringan yang datang bersamaan:

          pekerjaan berat SINKRON  : permintaan ringan 73,9 - 74,6 ms
          pekerjaan berat ASINKRON : permintaan ringan  6,1 -  7,5 ms

        Permintaan yang sama sekali tidak berhubungan dengan
        pekerjaan berat itu tetap ikut menunggu.
        `,
      ),
      p(
        'Biaya panggilan sinkron lintas proses juga bisa diukur, dan ia berlipat mengikuti jumlah hop.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di mesin ini:

          pemanggilan fungsi di dalam proses  puluhan nanodetik
          HTTP round trip ke 127.0.0.1        1,69 ms
          HTTP round trip ke internet         p50 70,04 ms
                                              p99 362,72 ms

        Dan dihitung, latensi ekor yang berlipat:
          bila p99 tiap layanan 1%, peluang setidaknya satu kena
          ekor pada 10 layanan berantai adalah 1 - 0,99^10 = 9,6%

        Hampir 1 dari 10 permintaan merasakan latensi ekor, meski
        tiap layanannya hanya 1%.
        `,
        {
          caption:
            'Itulah kenapa mengurangi JUMLAH panggilan sering lebih berpengaruh daripada mempercepat masing-masing.',
        },
      ),
      p(
        'Yang membedakan keduanya secara mendasar bukan kecepatan melainkan apa yang dituntut dari pemanggil.',
      ),
      table(
        ['', 'Sinkron', 'Asinkron lewat antrean'],
        [
          ['Pemanggil menunggu', 'Ya', 'Tidak'],
          ['Bila yang dipanggil mati', 'Pemanggil ikut gagal', 'Pesan menunggu, dikerjakan nanti'],
          ['Jawabannya', 'Hasil sesungguhnya', 'Tanda terima, hasilnya menyusul'],
          ['Urutan', 'Terjamin', 'Tidak terjamin'],
          ['Dijalankan berapa kali', 'Sekali', 'PALING SEDIKIT sekali'],
          [
            'Cocok untuk',
            'Pengguna butuh jawabannya sekarang',
            'Pekerjaan yang boleh selesai kemudian',
          ],
        ],
      ),
      p(
        'Baris kelima itu yang menentukan cara menulis kodenya, dan ia sering baru disadari setelah data ganda muncul.',
      ),
      code(
        'ts',
        `
        // Pengiriman dijamin PALING SEDIKIT sekali, sebab pekerja
        // bisa mati SESUDAH bekerja dan SEBELUM menandai selesai.
        // Karena itu handler harus idempoten.
        async function kirimSurelPesanan(pesan: { pesananId: number }) {
          const baru = await db.surelTerkirim
            .create({ data: { pesananId: pesan.pesananId, jenis: 'konfirmasi' } })
            .then(() => true)
            .catch(() => false);          // pelanggaran UNIQUE = sudah pernah

          if (!baru) return;
          await penyediaEmail.kirim(...);
        }

        // Diuji di bab Desain API dengan bentuk yang sama:
        //   satu kunci, dikirim BERSAMAAN lima kali
        //   -> 201, 201, 201, 201, 201
        //   -> pembayaran yang benar-benar lahir: 1
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Panggilan sinkron punya satu kegagalan yang paling merusak, yaitu ketika ia dipakai untuk sesuatu yang tidak menuntut jawaban seketika.',
      ),
      code(
        'text',
        `
        Bentuknya:

          POST /v1/pesanan
            -> panggil layanan pembayaran     (menunggu)
            -> panggil layanan pengiriman     (menunggu)
            -> panggil layanan notifikasi     (menunggu)
            -> panggil layanan analitik       (menunggu)
            -> jawab 201

        Empat panggilan berantai. Dihitung dari angka yang diukur:
          4 x 70 ms = 280 ms pada p50
          dan p99-nya ditentukan yang PALING LAMBAT di antara keempatnya

        Dan lebih buruk: bila layanan ANALITIK mati, pesanan
        pelanggan GAGAL — padahal analitik tidak ada hubungannya
        dengan apakah pesanannya sah.
        `,
        {
          caption:
            'Ketergantungan sinkron mengubah kegagalan komponen yang tidak penting menjadi kegagalan alur yang penting.',
        },
      ),
      p('Kegagalan berikutnya berupa mekanisme pemulihan yang justru memperburuk.'),
      code(
        'text',
        `
        Layanan hilir melambat.
        Semua pemanggil mengulang.
        Beban ke hilir naik dua kali lipat, justru saat ia paling
        tidak sanggup.
        Ia makin melambat, dan pengulangan makin banyak.

        Yang wajib ada:
          BATAS WAKTU pada setiap panggilan keluar
          BACKOFF yang membesar DENGAN komponen acak
          PEMUTUS SIRKUIT yang berhenti mencoba setelah sekian
            kegagalan berturut-turut
          PERILAKU DEGRADASI: apa yang dijawab saat sirkuitnya terbuka

        Jeda tetap membuat semua pemanggil mencoba pada detik yang
        sama persis, dan itu memperburuk, bukan memperbaiki.
        `,
      ),
      p(
        'Pada sisi asinkron, kegagalannya berbeda bentuk dan yang pertama tidak berupa error sama sekali.',
      ),
      code(
        'text',
        `
        1. Antrean tumbuh dan tidak pernah turun

           panjang antrean: 200 -> 1.400 -> 8.900 -> 41.000

           Yang harus dipantau bukan panjangnya melainkan UMUR PESAN
           TERTUA. Antrean pendek yang pesan tertuanya sudah menunggu
           empat jam berarti ada yang macet.

        2. Urutan yang diasumsikan padahal tidak dijamin

           pesan A: "ubah nama menjadi Ana"
           pesan B: "ubah nama menjadi Budi"
           Dengan beberapa pekerja paralel, B bisa selesai lebih dulu.
           Hasil akhirnya "Ana", padahal yang terakhir diminta "Budi".

        3. Pesan membawa SALINAN data yang sudah basi

           pesan dibuat  : {"pesananId": 42, "total": 150000}
           pekerja jalan : 3 jam kemudian
           kenyataannya  : pesanan 42 sudah dibatalkan

           Kirim ID, dan baca keadaan TERBARU saat dijalankan.

        4. Pengulangan tanpa batas

           Kegagalan permanen tidak akan pernah berhasil. Pasang
           batas, backoff, dead letter, DAN alarm pada dead letter.
           Dead letter yang tidak pernah dilihat sama dengan
           menghapus pekerjaan itu diam-diam.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pilihan ini sering diambil dari kebiasaan, dan akibatnya baru terasa pada hari salah satu komponen melambat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil semuanya secara sinkron',
            'Lebih sederhana dan langsung dapat hasilnya',
            'Diukur, 4 panggilan berantai membayar 280 ms pada p50, dan kegagalan analitik menggagalkan pesanan',
          ],
          [
            'Memanggil tanpa batas waktu',
            'Biasanya cepat',
            'Satu hilir yang menggantung menahan seluruh permintaan, dan koneksinya habis',
          ],
          [
            'Mengulang tanpa backoff dan pemutus sirkuit',
            'Nanti juga berhasil',
            'Beban naik dua kali lipat saat hilirnya paling lemah. Pakai backoff acak yang membesar',
          ],
          [
            'Menulis handler antrean yang tidak idempoten',
            'Kan hanya dikirim sekali',
            'Pengiriman dijamin PALING SEDIKIT sekali. Pekerja yang mati sesudah bekerja membuatnya diulang',
          ],
          [
            'Mengandalkan urutan pesan',
            'Masuknya kan berurutan',
            'Beberapa pekerja paralel menyelesaikannya dengan urutan berbeda. Pakai partisi atau nomor versi',
          ],
          [
            'Memantau panjang antrean saja',
            'Itu metriknya',
            'Umur pesan tertua jauh lebih mewakili pengalaman orang yang menunggu hasilnya',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang memisahkan keduanya dengan cukup tepat, dan ia diajukan dari sudut pandang pengguna, bukan dari sudut pandang sistem. Apakah pengguna perlu melihat hasilnya sebelum ia bisa melanjutkan? Bila ya, panggilannya sinkron dan harus cepat. Bila tidak, memaksakannya sinkron berarti mengikat nasib alur yang penting pada komponen yang sebenarnya tidak menentukan apa pun.',
      ),
      references(
        {
          label: 'Designing interservice communication',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/interservice-communication',
          source: 'Microsoft',
          note: 'Perbandingan sinkron dan asinkron beserta akibatnya pada ketersediaan.',
        },
        {
          label: 'Queue-Based Load Leveling pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling',
          source: 'Microsoft',
          note: 'Cara antrean menyerap lonjakan sehingga penerima bekerja pada laju yang sanggup ia tangani.',
        },
        {
          label: 'Jobs',
          href: 'https://docs.bullmq.io/guide/jobs',
          source: 'BullMQ',
          note: 'Retry, backoff, dan dead letter pada antrean yang dipakai kurikulum ini.',
        },
      ),
    ],
  ),

  written(
    'kontrak-antar-bagian',
    'Kontrak yang Tidak Merusak Pemakainya',
    21,
    'Aturan penambahan dan penghapusan yang membuat kemandirian rilis benar-benar ada.',
    [
      p(
        'Bayangkan kamu berlangganan katering harian. Kesepakatannya sederhana, yaitu setiap hari kamu menerima kotak berisi nasi, lauk, dan sayur, diantar sebelum jam dua belas.',
      ),
      p(
        'Selama kesepakatan itu dipegang, pihak katering bebas melakukan apa saja di dapurnya. Ganti kompor, ganti juru masak, pindah lokasi dapur, semuanya tidak perlu memberi tahu kamu. Kalau suatu hari mereka menambahkan buah di dalam kotak, kamu juga tidak terganggu, karena nasi, lauk, dan sayurnya tetap ada.',
      ),
      p(
        'Yang mengganggu adalah kalau mereka tiba-tiba berhenti mengirim sayur, atau mengganti kotak menjadi bungkus daun yang tidak muat di tasmu. Itu bukan perubahan di dapur, itu **perubahan kesepakatan**, dan kesepakatan tidak boleh berubah sepihak.',
      ),
      p(
        'Hubungan antar bagian aplikasi bekerja persis begitu, dan kesepakatannya disebut **kontrak**. Kontrak adalah janji tentang bentuk data yang dipertukarkan dua bagian. Selama janji itu dipegang, keduanya bebas berubah sebebas-bebasnya di dalam. Begitu janji itu dilanggar, keduanya terpaksa dirilis bersamaan, dan seluruh alasan memisahkan mereka lenyap.',
      ),
      p(
        'Sub-bab 2.5 menyebut distributed monolith sebagai bentuk gagal yang paling sering, dan menyebut pembedanya bukan teknologi melainkan kontrak. Sub-bab ini membuka kalimat itu.',
      ),

      terms(
        {
          term: 'contract (kontrak)',
          meaning:
            'Kesepakatan tentang bentuk data dan perilaku yang dipertukarkan dua bagian, misalnya bentuk badan permintaan, bentuk respons, dan arti tiap kode status. Dibaca "kontrak". Kontrak bisa berupa tipe TypeScript bersama, berkas OpenAPI, atau skema pesan antrean.',
        },
        {
          term: 'breaking change (perubahan yang merusak)',
          meaning:
            'Perubahan kontrak yang membuat pemakai lama berhenti bekerja, misalnya menghapus field, mengganti namanya, mempersempit nilai yang diizinkan, atau mengubah arti sebuah kode status. Dibaca "breiking ceinj", artinya perubahan yang mematahkan. Dalam analogi katering, ini berhenti mengirim sayur. Cara mengenalinya cepat, tanyakan apakah pemakai lama yang tidak mengubah apa pun akan tetap bekerja. Kalau tidak, itu perubahan yang merusak. Sub-bab [versioning](/kelas/backend-intermediate/desain-api/versioning) membahas cara menanganinya di API publik.',
        },
        {
          term: 'backward compatible (kompatibel mundur)',
          meaning:
            'Sifat perubahan yang tetap bisa dipakai pemakai versi lama tanpa mereka mengubah apa pun. Dibaca "bekword kompatibel". Menambah field opsional biasanya kompatibel mundur, menghapus field tidak.',
        },
        {
          term: 'forward compatible (kompatibel maju)',
          meaning:
            'Sifat pemakai yang tetap bekerja ketika pengirim menambahkan sesuatu yang belum ia kenal. Dibaca "forward kompatibel", artinya kompatibel ke depan. Bedanya dengan kompatibel mundur perlu diperhatikan karena keduanya sering tertukar. Kompatibel mundur adalah tanggung jawab **pengirim**, yaitu jangan menghapus yang lama. Kompatibel maju adalah tanggung jawab **pemakai**, yaitu jangan menolak yang baru. Dalam analogi katering, ini sikap kamu yang tidak marah ketika ada buah tambahan di kotak.',
        },
        {
          term: 'tolerant reader',
          meaning:
            'Pemakai kontrak yang hanya membaca field yang benar-benar ia butuhkan dan mengabaikan sisanya. Dibaca "toleran rider", artinya pembaca yang toleran. Wujud konkretnya di kode Zod adalah **tidak memakai** `.strict()`, sehingga field asing dilewati begitu saja alih-alih memicu error. Inilah satu kebiasaan yang paling banyak mencegah distributed monolith, karena ia membuat penambahan field berhenti menjadi peristiwa yang butuh koordinasi lintas tim.',
        },
        {
          term: 'consumer-driven contract test',
          meaning:
            'Test yang ditulis dari sudut pandang pemakai, berisi bentuk minimum yang ia butuhkan, lalu dijalankan terhadap penyedia. Dibaca "konsyumer driven kontrak test", artinya test kontrak yang ditentukan pemakainya. Idenya dibalik dari test biasa, dan pembalikan itulah nilainya. Alih-alih penyedia menebak apa yang dibutuhkan pemakainya, pemakainya sendiri yang menuliskan kebutuhan minimumnya, lalu penyedia menjalankan tulisan itu sebagai test. Akibatnya penyedia tahu perubahannya merusak sebelum dirilis, bukan setelah ada yang mengeluh.',
        },
        {
          term: 'schema evolution',
          meaning:
            'Aturan tentang perubahan apa yang boleh dilakukan pada sebuah skema tanpa merusak pemakainya. Dibaca "skima evolusyen". Aturan ini berlaku sama untuk respons API, pesan antrean, dan bentuk data yang disimpan.',
        },
      ),

      h2('Aturan yang membuat penambahan berhenti menakutkan'),
      p(
        'Ada dua aturan yang kalau dipegang keduanya, penambahan field berhenti menjadi peristiwa yang butuh koordinasi. Keduanya harus dipegang bersamaan, karena masing-masing sendirian tidak cukup.',
      ),
      table(
        ['Aturan', 'Dipegang oleh', 'Isinya'],
        [
          [
            'Hanya menambah, tidak pernah mengubah arti',
            'Pengirim',
            'Field baru selalu opsional. Field lama tidak pernah dihapus, diganti nama, atau diubah artinya tanpa proses khusus',
          ],
          [
            'Abaikan yang tidak dikenal',
            'Pemakai',
            'Baca hanya field yang dibutuhkan. Field asing tidak menyebabkan kegagalan',
          ],
        ],
        'Tanpa aturan kedua, aturan pertama pun tidak menolong, karena penambahan tetap merusak pemakainya.',
      ),
      compare(
        {
          title: 'Pemakai yang kaku',
          lang: 'ts',
          code: `
            const SkemaProduk = z
              .object({
                id: z.string(),
                nama: z.string(),
                hargaRupiah: z.number(),
              })
              .strict();          // <- menolak field yang tidak dikenal

            const produk = SkemaProduk.parse(await respons.json());

            // Penyedia menambah field "kategori" -> parse melempar error.
            // Penambahan yang tidak merusak siapa pun berubah menjadi insiden.
          `,
          notes: [
            'Setiap penambahan di penyedia memaksa pemakai ikut dirilis',
            'Inilah cara distributed monolith terbentuk tanpa disadari',
          ],
        },
        {
          title: 'Tolerant reader',
          lang: 'ts',
          code: `
            const SkemaProduk = z.object({
              id: z.string(),
              nama: z.string(),
              hargaRupiah: z.number(),
            });                   // <- field asing diabaikan, bukan ditolak

            const produk = SkemaProduk.parse(await respons.json());

            // Penyedia menambah field apa pun -> pemakai tidak terpengaruh.
            // Yang tetap dijaga: tiga field ini WAJIB ada dan bertipe benar.
          `,
          notes: [
            'Validasi tetap ketat untuk yang dibutuhkan',
            'Penambahan di penyedia berhenti menjadi peristiwa',
          ],
        },
      ),
      callout(
        'info',
        'Toleran bukan berarti longgar',
        'Perhatikan bahwa kolom kanan tetap memvalidasi. Yang berubah hanya sikap terhadap field yang **tidak dibutuhkan**. Field yang dibutuhkan tetap wajib ada dan tetap diperiksa tipenya, sesuai aturan [validasi input](/kelas/keamanan-fullstack/data-rahasia-jejak/validasi-input) yang mengikat untuk semua data dari luar.',
      ),

      h2('Perubahan yang aman dan yang tidak'),
      p(
        'Tabel berikut berlaku sama untuk respons API, pesan antrean, dan bentuk data yang disimpan. Menghafalnya menghemat banyak waktu.',
      ),
      table(
        ['Perubahan', 'Aman?', 'Catatan'],
        [
          ['Menambah field opsional', 'Aman', 'Selama pemakainya toleran'],
          [
            'Menambah nilai baru pada sebuah enum',
            'Hati-hati',
            'Aman kalau pemakai punya cabang bawaan untuk nilai yang tidak dikenal. Tidak aman kalau ia memakai pencocokan yang harus lengkap',
          ],
          ['Menambah endpoint baru', 'Aman', 'Tidak ada pemakai lama yang terpengaruh'],
          [
            'Membuat field wajib menjadi opsional pada respons',
            'Merusak',
            'Pemakai mengandalkan keberadaannya',
          ],
          [
            'Membuat field opsional menjadi wajib pada permintaan',
            'Merusak',
            'Pemakai lama tidak mengirimkannya',
          ],
          [
            'Mengganti nama field',
            'Merusak',
            'Lakukan sebagai tambah baru lalu hapus lama, bukan satu langkah',
          ],
          [
            'Mempersempit tipe, misalnya string menjadi enum',
            'Merusak',
            'Nilai yang tadinya diterima kini ditolak',
          ],
          [
            'Melonggarkan tipe pada respons',
            'Merusak',
            'Pemakai memvalidasi dengan tipe lama yang lebih sempit',
          ],
          [
            'Mengubah arti field tanpa mengubah namanya',
            'Paling berbahaya',
            'Tidak ada alat yang bisa menangkapnya. Selalu pakai nama baru',
          ],
        ],
        'Baris terakhir paling berbahaya karena semuanya tetap berjalan, hanya hasilnya yang salah.',
      ),
      p(
        'Baris terakhir pantas diberi contoh supaya jelas. Field `total` yang tadinya berarti harga sebelum pajak lalu diubah menjadi harga sesudah pajak tidak akan membuat satu pun test gagal, tidak akan membuat satu pun error muncul, dan akan membuat laporan keuangan salah selama berbulan-bulan. Kalau artinya berubah, namanya harus berubah.',
      ),

      h2('Menghapus sesuatu dengan selamat'),
      p(
        'Menghapus field atau endpoint adalah kebutuhan yang wajar, dan ia bisa dilakukan tanpa merusak siapa pun asalkan dipecah menjadi beberapa rilis. Polanya sama dengan expand dan contract pada migrasi database.',
      ),
      steps(
        {
          title: 'Rilis 1 — tambahkan yang baru',
          body: 'Field baru ditambahkan berdampingan dengan yang lama. Keduanya diisi. Tidak ada pemakai yang terganggu karena yang lama masih ada.',
        },
        {
          title: 'Rilis 2 — pindahkan pemakainya',
          body: 'Setiap pemakai diubah memakai field baru, satu per satu, pada jadwalnya masing-masing. Inilah bagian yang butuh kemandirian rilis, dan inilah alasan kontrak yang benar penting.',
        },
        {
          title: 'Amati sampai yakin tidak ada yang memakai',
          body: 'Tambahkan metrik yang menghitung berapa kali field lama masih dibaca atau endpoint lama masih dipanggil. Tunggu sampai angkanya nol selama beberapa minggu. Menebak tidak cukup, karena selalu ada pemakai yang terlupakan.',
        },
        {
          title: 'Rilis 3 — hapus yang lama',
          body: 'Baru sekarang field lama dihapus. Karena angkanya sudah nol, penghapusan ini tidak merusak siapa pun.',
        },
      ),
      code(
        'ts',
        `
        // Rilis 1 dan 2: keduanya ada, pemakaian yang lama dihitung.

        export function susunResponsPesanan(pesanan: Pesanan) {
          return {
            id: pesanan.id,

            // Lama. Akan dihapus di rilis 3. Artinya sebelum pajak.
            total: pesanan.subtotalRupiah,

            // Baru. Nama diperjelas karena artinya memang berbeda.
            subtotalSebelumPajakRupiah: pesanan.subtotalRupiah,
            totalSetelahPajakRupiah: pesanan.subtotalRupiah + pesanan.pajakRupiah,
          };
        }

        // Middleware yang menghitung siapa yang masih membaca bentuk lama,
        // berdasarkan header yang dikirim klien. Angka inilah yang menentukan
        // kapan rilis 3 boleh dijalankan.
        export function catatPemakaianBentukLama(req: Request) {
          if (req.header('x-versi-klien-pesanan') === undefined) {
            metrik.tambah('pesanan.respons_bentuk_lama', {
              klien: req.header('user-agent') ?? 'tidak-dikenal',
            });
          }
        }
        `,
        {
          caption:
            'Menghapus tanpa mengukur adalah menebak. Metrik ini yang mengubah tebakan menjadi keputusan.',
        },
      ),

      h2('Menuliskan kontrak supaya bisa diperiksa mesin'),
      p(
        'Kontrak yang hanya hidup di kepala akan berbeda antara dua orang. Ada tiga bentuk penulisan, dan pilihannya bergantung pada seberapa jauh kedua pihak terpisah.',
      ),
      table(
        ['Bentuk', 'Cocok ketika', 'Diperiksa oleh'],
        [
          [
            'Tipe TypeScript yang dipakai bersama',
            'Kedua pihak dalam satu repositori, misalnya modul dalam satu aplikasi',
            'Compiler, saat build',
          ],
          [
            'Skema Zod yang diekspor dari pintu masuk modul',
            'Kedua pihak dalam satu repositori, tetapi datanya melewati batas kepercayaan',
            'Compiler dan pemeriksaan saat berjalan',
          ],
          [
            'Berkas OpenAPI atau skema pesan',
            'Kedua pihak terpisah repositori atau terpisah tim',
            'Alat pembuat klien dan contract test',
          ],
        ],
        'Sub-bab [OpenAPI](/kelas/backend-intermediate/desain-api/openapi) sudah membahas bentuk ketiga secara rinci.',
      ),
      code(
        'ts',
        `
        // Contract test dari sudut pandang pemakai.
        // Berisi bentuk MINIMUM yang dibutuhkan modul pesanan dari modul katalog.
        // Kalau katalog mengubah sesuatu yang merusak, test ini merah sebelum rilis.

        import { describe, expect, it } from 'vitest';
        import { ambilRingkasanProduk } from '@/katalog';

        describe('kontrak katalog untuk modul pesanan', () => {
          it('menyediakan id, nama, dan harga untuk produk yang ada', async () => {
            const produk = await ambilRingkasanProduk('produk-uji');

            expect(produk).not.toBeNull();
            expect(typeof produk?.id).toBe('string');
            expect(typeof produk?.nama).toBe('string');
            expect(typeof produk?.hargaRupiah).toBe('number');
          });

          it('menjawab null untuk produk yang tidak ada, bukan melempar error', async () => {
            expect(await ambilRingkasanProduk('tidak-ada')).toBeNull();
          });
        });
        `,
        {
          filename: 'src/test/kontrak-katalog.test.ts',
          caption:
            'Test kedua menjaga perilaku, bukan hanya bentuk. Perilaku juga bagian dari kontrak.',
        },
      ),
      p(
        'Test kedua di atas menunjukkan hal yang sering terlupakan. Kontrak bukan hanya tentang bentuk data, melainkan juga tentang **perilaku**. Mengubah "mengembalikan null kalau tidak ada" menjadi "melempar error kalau tidak ada" adalah perubahan yang merusak, meskipun tidak ada satu pun field yang berubah.',
      ),

      h2('Rangkuman'),
      ul(
        'Kontrak yang dipegang adalah yang membuat kemandirian rilis benar-benar ada.',
        'Dua aturan wajib dipegang bersamaan yaitu pengirim hanya menambah, dan pemakai mengabaikan yang tidak dikenal.',
        'Toleran bukan berarti longgar. Field yang dibutuhkan tetap wajib ada dan tetap diperiksa tipenya.',
        'Mengubah arti field tanpa mengubah namanya adalah perubahan paling berbahaya, karena tidak ada alat yang bisa menangkapnya.',
        'Penghapusan dilakukan bertahap, dan waktunya ditentukan metrik pemakaian, bukan tebakan.',
        'Kontrak mencakup perilaku, bukan hanya bentuk data.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Kontrak antar bagian adalah janji tentang bentuk, dan yang menentukan bukan bentuknya melainkan apa yang terjadi ketika ia berubah.',
      ),
      code(
        'text',
        `
        Perubahan yang AMAN, sebab pemakai lama mengabaikannya:

          menambah field ke respons
          menambah endpoint baru
          menambah nilai enum yang hanya muncul untuk data baru
          menambah parameter OPSIONAL

        Perubahan yang MEMUTUS, sebab pemakai lama rusak:

          menghapus field dari respons
          mengganti nama field
          mengubah tipe field
          memperketat validasi yang tadinya longgar
          mengubah arti sebuah nilai tanpa mengubah namanya

        Yang terakhir paling berbahaya, sebab tidak ada satu pun
        alat yang bisa mendeteksinya.
        `,
      ),
      p(
        'Baris "mengubah tipe field" pantas dibaca bersama hasil pengukuran, sebab ia menunjukkan kenapa pengujian sering memberi rasa aman yang keliru.',
      ),
      code(
        'text',
        `
        Diuji sungguhan di bab Desain API: mengubah tipe id dari
        angka menjadi string.

          Hasil pengujian dengan klien uji: AMAN, tidak ada yang rusak.

        Dan itu MENYESATKAN. Klien ujinya terlalu sederhana — ia
        hanya meneruskan id tanpa melakukan apa pun terhadapnya.

        Klien sungguhan yang membandingkan id === 42, atau memakainya
        sebagai kunci angka, rusak SEKETIKA.

        "Tidak merusak klien uji saya" bukan bukti bahwa sebuah
        perubahan aman.
        `,
        {
          caption:
            'Yang membuktikan sebuah perubahan aman adalah kontrak yang diperiksa, bukan klien yang kebetulan tidak rusak.',
        },
      ),
      p(
        'Untuk memeriksanya di dalam satu proses, tipe membantu dan punya batas yang perlu diketahui.',
      ),
      code(
        'ts',
        `
        // Diukur di bab Desain API: yang berikut ini LOLOS tsc 5.9.3
        // tanpa satu pun error.
        type ResponsPublik = { id: number; nama: string };
        const dariDb = { id: 1, nama: 'Ana', sandiHash: '$2y$12$...' };
        const a: ResponsPublik = dariDb;          // LOLOS

        JSON.stringify(a);
        // -> {"id":1,"nama":"Ana","sandiHash":"$2y$12$..."}

        // Pemeriksaan properti berlebih hanya berlaku pada object
        // LITERAL. Tipe adalah janji saat kompilasi, bukan penyaring
        // saat runtime.

        // Yang benar-benar memeriksa bentuk keluaran:
        const ResponsPublik = z.object({ id: z.number(), nama: z.string() }).strict();
        return Response.json(ResponsPublik.parse(dariDb));   // menolak field asing
        `,
      ),
      p(
        'Untuk kontrak lintas proses, penegakannya harus dijalankan, dan bentuk yang paling murah adalah satu skrip yang menguji keduanya.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan di bab Integrasi, satu skrip audit yang
        sama terhadap dua backend dengan kontrak yang diklaim identik:

          == Backend A (Node)
            12 pemeriksaan, 12 LULUS

          == Backend B (PHP)
            10 LULUS, 2 GAGAL
              tulis pendek -> pesan field   harap="minimal 3 karakter" dapat=""
              tulis sah    -> status        harap=201 dapat=500

        Kontraknya terlihat sama di kode, dan TIDAK sama saat
        dijalankan. Penyebabnya mb_strlen() yang tidak ada karena
        ekstensi mbstring tidak terpasang.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan kontrak punya sifat yang membuatnya mahal, yaitu munculnya di sisi pemakai, bukan di sisi yang mengubahnya.',
      ),
      code(
        'text',
        `
        Yang dilihat pemakai ketika field dihapus:

          TypeError: Cannot read properties of undefined (reading 'split')

        Pesannya tidak menyebut API, tidak menyebut versi, dan tidak
        menyebut field mana yang hilang.

        Dan yang dilihat pemakai ketika servernya gagal total,
        diukur sungguhan di bab Integrasi:

          status       = 500
          content_type = text/html; charset=UTF-8
          size         = 0                      <- badannya KOSONG
          dan header CORS-nya TETAP ADA

          di sisi klien:
            r.ok = false | r.status = 500
            SyntaxError: Unexpected end of JSON input

        Pesan itu menyebut JSON. Penyebabnya ekstensi PHP yang tidak
        terpasang.
        `,
      ),
      p(
        'Karena itu klien yang baik membaca respons sebagai teks lebih dulu, dan melaporkan apa adanya bila ia bukan JSON.',
      ),
      code(
        'ts',
        `
        async function baca<T>(r: Response, skema: ZodType<T>): Promise<T> {
          const teks = await r.text();

          if (!r.ok) {
            const tipe = r.headers.get('content-type') ?? '';
            if (tipe.includes('json')) throw new GagalApi(JSON.parse(teks), r.status);
            // Badan kosong atau HTML: laporkan apa adanya.
            throw new GagalApi(
              { title: 'Server gagal', status: r.status, detail: teks.slice(0, 200) || '(badan kosong)' },
              r.status,
            );
          }

          return skema.parse(JSON.parse(teks));
        }
        `,
        {
          caption:
            'Potongan teks.slice(0, 200) itu yang mengubah "Unexpected end of JSON input" menjadi petunjuk nyata.',
        },
      ),
      p(
        'Kesalahan berikutnya menyangkut cara mengubah kontrak, dan bentuk yang aman punya nama yang sama dengan bentuk migrasi basis data.',
      ),
      code(
        'text',
        `
        EXPAND - MIGRATE - CONTRACT untuk kontrak API:

          RILIS 1 — EXPAND
            tambahkan field BARU, pertahankan yang lama
            respons memuat keduanya

          RILIS 2 — MIGRATE
            pemakai dipindahkan ke field baru, satu per satu
            pantau siapa yang masih memakai yang lama

          RILIS 3 — CONTRACT
            baru setelah tidak ada lagi yang memakainya, hapus

        Langkah 2 menuntut kemampuan MELIHAT siapa yang masih
        memakai field lama, dan itu harus dipasang sebelum rilis 1.

        Tanpa itu, langkah 3 diambil dengan menebak — dan diukur di
        bab Deployment, tebakan yang salah menghasilkan
        "column does not exist" yang tidak bisa di-rollback.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kontrak sering dianggap selesai begitu disepakati, padahal seluruh pekerjaannya justru terjadi saat ia berubah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengubah tipe field karena "nilainya sama"',
            'Isinya kan tidak berubah',
            'Diuji, klien uji sederhana tidak rusak sementara klien yang membandingkan `id === 42` rusak seketika',
          ],
          [
            'Mengandalkan tipe untuk menjaga bentuk keluaran',
            'TypeScript kan memeriksanya',
            'Diukur, `const a: ResponsPublik = dariDb` LOLOS tsc dan `sandiHash` tetap ikut ke respons',
          ],
          [
            'Menyimpulkan kontraknya sama dari membaca kode',
            'Rutenya kan sama',
            'Diukur, 2 dari 12 pemeriksaan gagal hanya di satu backend. Jalankan skrip yang sama ke keduanya',
          ],
          [
            'Menghapus field lama bersamaan dengan menambah yang baru',
            'Satu perubahan, satu rilis',
            'Pemakai lama rusak seketika. Pakai expand-migrate-contract',
          ],
          [
            'Menghapus field lama tanpa tahu siapa yang memakainya',
            'Sudah lama tidak dipakai',
            'Pasang pencatatan pemakaian SEBELUM rilis expand, atau langkah contract diambil dengan menebak',
          ],
          [
            'Memanggil `.json()` tanpa memeriksa `content-type`',
            'API-nya kan mengirim JSON',
            'Diukur, error fatal server mengirim badan kosong bertipe HTML. Pesannya menyesatkan sepenuhnya',
          ],
        ],
      ),
      p(
        'Cara paling murah membuktikan sebuah kontrak nyata adalah menulis satu skrip yang mengujinya dari luar, lalu menjalankannya terhadap setiap implementasi yang mengaku memenuhinya. Skrip itu tidak perlu canggih. Dua belas baris `curl` sudah cukup menemukan dua ketidaksesuaian yang tidak terlihat dari membaca kode mana pun.',
      ),
      references(
        {
          label: 'API design for microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design',
          source: 'Microsoft',
          note: 'Termasuk pembahasan kompatibilitas mundur dan kenapa ia menentukan kemandirian rilis.',
        },
        {
          label: 'RESTful web API design',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
          source: 'Microsoft',
          note: 'Aturan bentuk respons dan cara mengembangkannya tanpa merusak pemakai lama.',
        },
        {
          label: 'OpenAPI Specification',
          href: 'https://spec.openapis.org/oas/latest.html',
          source: 'OpenAPI Initiative',
          note: 'Bentuk resmi untuk menuliskan kontrak yang bisa diperiksa mesin.',
        },
      ),
    ],
  ),

  written(
    'event-driven',
    'Arsitektur Berbasis Event',
    23,
    'Membalik arah pengetahuan, supaya penambahan fitur berhenti menyentuh kode lama.',
    [
      p('Bayangkan sebuah kantor dengan pengumuman ulang tahun. Ada dua cara mengurusnya.'),
      p(
        'Cara pertama, orang yang berulang tahun menelepon satu per satu, yaitu menelepon bagian keuangan minta uang kue, menelepon resepsionis minta dipesankan ruangan, menelepon HRD minta dicatat. Kalau nanti ada kebiasaan baru misalnya foto bersama, ia harus menambah satu telepon lagi. Daftar teleponnya terus memanjang, dan ia harus tahu semua orang yang perlu dihubungi.',
      ),
      p(
        'Cara kedua, ia cukup menempel satu pengumuman di papan, "hari ini saya ulang tahun". Selesai. Siapa pun yang berkepentingan membacanya sendiri dan bertindak sendiri. Kalau nanti ada kebiasaan foto bersama, orang yang mengurus foto tinggal ikut membaca papan itu, **tanpa si pemilik ulang tahun perlu tahu apa pun**.',
      ),
      p(
        'Cara kedua itulah **arsitektur berbasis event**. Sampai sini setiap komunikasi yang dibahas selalu berbentuk cara pertama, yaitu ada yang meminta dan ada yang diminta, dan si peminta harus tahu siapa yang ia minta. Event membalik arah itu.',
      ),
      p(
        'Pada bentuk berbasis event, sebuah bagian hanya **mengumumkan bahwa sesuatu sudah terjadi**, lalu selesai. Ia tidak tahu siapa yang mendengarkan, tidak tahu berapa banyak, dan tidak tahu apa yang mereka lakukan. Perubahan arah ini punya satu akibat yang sangat berharga, yaitu menambah kelakuan baru berhenti berarti menyentuh kode lama.',
      ),

      terms(
        {
          term: 'event (peristiwa)',
          meaning:
            'Pemberitahuan bahwa sesuatu **sudah terjadi**, dinamai dengan kata kerja bentuk lampau, misalnya `PesananDibayar` atau `PenggunaMendaftar`. Dibaca "ivent". Ini isi pengumuman di papan tadi. Cara mengenalinya paling mudah lewat namanya, yaitu event selalu bisa dibaca sebagai kalimat berita tentang masa lalu. "Pesanan sudah dibayar" adalah berita. "Kirim email" bukan berita, itu suruhan, dan suruhan bukan event.',
        },
        {
          term: 'command (perintah)',
          meaning:
            'Permintaan agar sesuatu dikerjakan, dinamai dengan kata kerja perintah, misalnya `KirimEmailKonfirmasi`. Dibaca "komand". Ini cara pertama tadi, yaitu menelepon orang tertentu. Perintah punya satu penerima yang jelas dan bisa ditolak, sedangkan event punya nol sampai banyak pendengar dan tidak bisa ditolak karena ia hanya menyatakan yang sudah terjadi. Kamu bisa menolak permintaan tolong, tetapi kamu tidak bisa menolak kenyataan bahwa hari ini seseorang berulang tahun.',
        },
        {
          term: 'publisher dan subscriber',
          meaning:
            'Pemancar dan pendengar. Dibaca "pablisyer" dan "sabskraiber", artinya penerbit dan pelanggan, persis seperti hubungan koran dan pembacanya. Penerbit mencetak tanpa tahu siapa saja yang membeli, dan pembaca berlangganan tanpa perlu izin penerbit. Yang paling penting untuk diperhatikan, keduanya **tidak pernah saling mengimpor** di kode. Modul notifikasi mengimpor tipe event dari modul pesanan, tetapi modul pesanan tidak pernah tahu modul notifikasi ada.',
        },
        {
          term: 'event notification',
          meaning:
            'Bentuk paling ringan, yaitu event hanya membawa identitas dan sedikit keterangan, lalu pendengar mengambil sendiri detail yang ia butuhkan. Dibaca "ivent notifikeisyen". Dalam analogi papan pengumuman, isinya cuma "pesanan nomor 812 sudah dibayar", sehingga siapa pun yang butuh detail harus mencarinya sendiri. Kelebihannya pesannya kecil dan tidak cepat basi karena isinya sedikit, kekurangannya pendengar tetap harus memanggil balik pemancar sehingga ikatannya belum benar-benar lepas.',
        },
        {
          term: 'event-carried state transfer',
          meaning:
            'Bentuk yang membawa cukup data di dalam event sehingga pendengar tidak perlu memanggil balik siapa pun. Dibaca "ivent karid steit transfer", artinya event yang membawa serta keadaannya. Isi pengumumannya menjadi "pesanan nomor 812 sudah dibayar, oleh pembeli Budi, senilai 250 ribu, berisi dua barang ini". Kelebihannya pendengar benar-benar mandiri. Kekurangannya pesannya lebih besar, dan isinya adalah **potret pada detik itu**, bukan keadaan terkini, sehingga kalau kemudian datanya berubah pendengar tidak tahu.',
        },
        {
          term: 'event sourcing',
          meaning:
            'Bentuk paling jauh, yaitu deretan event **menjadi** sumber kebenaran, dan keadaan sekarang dihitung dengan memutar ulang seluruh event. Dibaca "ivent sorsing". Sangat kuat untuk kebutuhan audit dan penelusuran, sekaligus jauh lebih rumit sehingga jarang sepadan untuk aplikasi biasa.',
        },
        {
          term: 'choreography dan orchestration',
          meaning:
            'Dua cara mengatur alur yang melibatkan beberapa bagian. Nama keduanya diambil dari dunia seni pertunjukan dan analoginya memang tepat. **Choreography** seperti tarian yang sudah dihafal, yaitu tiap penari tahu kapan bergerak dengan melihat gerakan penari lain, dan tidak ada yang memimpin di panggung. **Orchestration** seperti orkestra, yaitu ada dirigen di depan yang memberi aba-aba kepada tiap pemain. Choreography lebih longgar ikatannya tetapi alurnya tersebar sehingga sulit ditelusuri. Orchestration lebih mudah dibaca karena alurnya di satu tempat, tetapi tempat itu jadi tahu segalanya.',
        },
        {
          term: 'eventual consistency',
          meaning:
            'Keadaan ketika data di berbagai tempat pada akhirnya sama, tetapi ada jeda saat sebagian sudah diperbarui dan sebagian belum. Dibaca "ivencyual konsistensi", artinya konsisten pada akhirnya. Kata "pada akhirnya" itu yang penting, karena ia berjanji datanya akan sama, tetapi tidak berjanji kapan. Contoh yang kamu alami sehari-hari, jumlah suka pada sebuah unggahan yang tampil berbeda antara halaman daftar dan halaman detail selama beberapa detik. Ini harga bawaan dari bentuk berbasis event, dan sub-bab [konsistensi](/kelas/system-design/skala-data/konsistensi) sudah membahas kapan ia boleh diterima.',
        },
      ),

      h2('Masalah yang diselesaikan'),
      p(
        'Gagasannya paling jelas dilihat dari masalah yang berulang. Sebuah aplikasi punya satu fungsi menyelesaikan pembayaran, lalu seiring waktu makin banyak hal yang harus terjadi sesudahnya.',
      ),
      compare(
        {
          title: 'Pemanggilan langsung',
          lang: 'ts',
          code: `
            export async function selesaikanPembayaran(idPesanan: string) {
              await penyimpanan.tandaiDibayar(idPesanan);

              // Setiap kebutuhan baru menambah baris DI SINI.
              await email.kirimKonfirmasi(idPesanan);
              await gudang.buatPerintahKirim(idPesanan);
              await poin.tambahkan(idPesanan);
              await statistik.catatPenjualan(idPesanan);
              await afiliasi.hitungKomisi(idPesanan);
            }
          `,
          notes: [
            'Fungsi ini tahu lima hal yang bukan urusannya',
            'Menambah kebutuhan keenam berarti menyentuh kode pembayaran',
            'Kegagalan salah satunya menggagalkan pembayaran yang sudah berhasil',
          ],
        },
        {
          title: 'Mengumumkan peristiwa',
          lang: 'ts',
          code: `
            export async function selesaikanPembayaran(idPesanan: string) {
              await penyimpanan.tandaiDibayar(idPesanan);

              // Satu baris, selamanya. Yang peduli mendaftar sendiri.
              await bus.pancarkan({
                jenis: 'PesananDibayar',
                idPesanan,
                terjadiPada: new Date().toISOString(),
              });
            }
          `,
          notes: [
            'Fungsi ini hanya tahu urusannya sendiri',
            'Kebutuhan keenam ditambahkan tanpa menyentuh berkas ini',
            'Kegagalan pendengar tidak membatalkan pembayaran',
          ],
        },
      ),
      p(
        'Perhatikan poin ketiga di kedua kolom, karena itu perbedaan yang paling sering diremehkan. Di kolom kiri, kalau `afiliasi.hitungKomisi` melempar error, seluruh fungsi gagal padahal pembayarannya sudah tercatat. Di kolom kanan, kegagalan menghitung komisi adalah masalah modul afiliasi yang bisa diulang, dan pembayarannya tetap sah.',
      ),
      callout(
        'warning',
        'Kelonggaran ini ada harganya, dan harganya nyata',
        'Kolom kanan lebih sulit dibaca dalam satu hal penting, yaitu tidak ada satu tempat pun yang memberi tahu apa saja yang terjadi setelah pembayaran. Untuk mengetahuinya kamu harus mencari seluruh pendengar `PesananDibayar`. Sub-bab ini akan menutup dengan cara mengurangi rasa sakit itu, tetapi ia tidak pernah hilang sepenuhnya.',
      ),

      h2('Event bukan perintah yang disamarkan'),
      p(
        'Kesalahan paling umum saat mulai memakai event adalah mengirim perintah tetapi menamainya event. Bedanya terlihat dari namanya, dan akibatnya besar.',
      ),
      table(
        ['', 'Event', 'Perintah'],
        [
          [
            'Namanya',
            '`PesananDibayar`, kata kerja lampau',
            '`KirimEmailKonfirmasi`, kata kerja perintah',
          ],
          ['Artinya', 'Fakta yang sudah terjadi', 'Permintaan agar sesuatu terjadi'],
          [
            'Penerimanya',
            'Nol sampai banyak, pemancar tidak tahu',
            'Tepat satu, pengirim tahu siapa',
          ],
          ['Bisa ditolak?', 'Tidak. Ia sudah terjadi', 'Bisa. Penerima boleh menolak'],
          [
            'Pemancar tahu akibatnya?',
            'Tidak, dan itu memang tujuannya',
            'Ya, ia meminta akibat tertentu',
          ],
          [
            'Kalau tidak ada penerima',
            'Wajar. Berarti belum ada yang peduli',
            'Bug. Ada pekerjaan yang tidak dikerjakan',
          ],
        ],
        'Event bernama `KirimEmail` adalah perintah yang menyamar, dan ia mengembalikan coupling yang tadinya ingin dilepas.',
      ),
      p(
        'Uji cepatnya begini. Kalau kamu bisa memancarkan pesan itu dan tidak ada satu pun pendengar, lalu keadaan itu **wajar saja**, ia event. Kalau tidak adanya pendengar berarti ada pekerjaan yang tidak dikerjakan, ia perintah, dan perintah lebih baik dikirim ke tujuan yang jelas.',
      ),

      h2('Tiga tingkat isi event'),
      p(
        'Setelah namanya benar, pertanyaan berikutnya adalah seberapa banyak data yang dibawa. Ada tiga tingkat, dan pilihannya punya akibat yang berbeda.',
      ),
      code(
        'ts',
        `
        // Tingkat 1 — notifikasi. Paling kecil, pendengar mengambil sendiri.
        type PesananDibayarRingan = {
          jenis: 'PesananDibayar';
          idPesanan: string;
          terjadiPada: string;
        };

        // Tingkat 2 — membawa keadaan. Pendengar tidak perlu memanggil balik.
        type PesananDibayarBerisi = {
          jenis: 'PesananDibayar';
          idPesanan: string;
          idPembeli: string;
          totalRupiah: number;
          barang: { idProduk: string; nama: string; jumlah: number; hargaSatuan: number }[];
          terjadiPada: string;
        };

        // Tingkat 3 — event sourcing. Deretan event ADALAH sumber kebenarannya,
        // dan keadaan sekarang dihitung dengan memutar ulang semuanya.
        // Jarang sepadan untuk aplikasi biasa, disebut di sini supaya kamu mengenalinya.
        `,
        {
          caption:
            'Tingkat 2 adalah pilihan yang paling sering tepat untuk komunikasi antar bagian.',
        },
      ),
      table(
        ['Tingkat', 'Kelebihan', 'Kekurangan', 'Pilih ketika'],
        [
          [
            'Notifikasi',
            'Pesan kecil, tidak mudah basi, tidak membocorkan banyak data',
            'Pendengar tetap harus memanggil balik, sehingga coupling tidak benar-benar lepas',
            'Pendengar berada dekat dan pemanggilan baliknya murah',
          ],
          [
            'Membawa keadaan',
            'Pendengar mandiri penuh, tidak ada panggilan balik',
            'Pesan lebih besar, isinya potret saat itu, dan perubahan bentuknya menyentuh semua pendengar',
            'Pendengar terpisah jauh, atau data yang dibawa memang fakta historis',
          ],
          [
            'Event sourcing',
            'Riwayat lengkap, bisa memutar ulang, audit sempurna',
            'Jauh lebih rumit, perubahan bentuk event lama sulit, butuh snapshot',
            'Kebutuhan audit atau penelusuran memang menjadi alasan utama sistemnya ada',
          ],
        ],
        'Naik tingkat hanya kalau keluhan yang sesuai benar-benar muncul.',
      ),

      h2('Wujud di dalam satu aplikasi'),
      p(
        'Bentuk berbasis event tidak menuntut Kafka, RabbitMQ, atau layanan terpisah. Di dalam satu aplikasi, bus sederhana sudah memberi hampir seluruh manfaat kelonggaran ikatannya.',
      ),
      code(
        'ts',
        `
        // src/bersama/bus.ts
        type Pendengar<T> = (event: T) => Promise<void>;

        const pendengar = new Map<string, Pendengar<never>[]>();

        export function dengarkan<T extends { jenis: string }>(
          jenis: T['jenis'],
          fn: Pendengar<T>,
        ) {
          const daftar = pendengar.get(jenis) ?? [];
          daftar.push(fn as Pendengar<never>);
          pendengar.set(jenis, daftar);
        }

        export async function pancarkan<T extends { jenis: string }>(event: T) {
          for (const fn of pendengar.get(event.jenis) ?? []) {
            // Pendengar dijalankan lewat antrean, bukan langsung, supaya kegagalan
            // salah satunya tidak menggagalkan pemancar dan bisa diulang.
            await antrean.tambah('tangani-event', { event, namaPendengar: fn.name });
          }
        }
        `,
        {
          filename: 'src/bersama/bus.ts',
          caption:
            'Menjalankan pendengar lewat antrean adalah bagian yang membuat kelonggaran ikatannya nyata.',
        },
      ),
      p(
        'Baris tentang antrean itu bukan hiasan. Kalau pendengar dipanggil langsung di dalam `pancarkan`, kamu hanya memindahkan daftar panggilan dari satu fungsi ke satu map, dan kegagalan salah satu pendengar tetap menggagalkan pemancar. Manfaat sesungguhnya baru muncul ketika pendengar berjalan terpisah dan kegagalannya bisa diulang sendiri.',
      ),
      code(
        'ts',
        `
        // src/notifikasi/pendengar.ts
        // Modul notifikasi mendaftar sendiri. Modul pembayaran tidak tahu berkas ini ada.

        import { dengarkan } from '@/bersama/bus';
        import type { PesananDibayar } from '@/pesanan';

        dengarkan<PesananDibayar>('PesananDibayar', async (event) => {
          await kirimEmailKonfirmasi(event.idPesanan);
        });
        `,
        {
          filename: 'src/notifikasi/pendengar.ts',
          caption:
            'Arah impornya searah, yaitu notifikasi tahu tentang pesanan. Pesanan tidak pernah tahu tentang notifikasi.',
        },
      ),

      h2('Menutup kelemahan terbesarnya'),
      p(
        'Kelemahan bentuk ini nyata, yaitu alur menjadi tersebar dan sulit dilihat sebagai satu kesatuan. Ada empat kebiasaan yang menutup sebagian besar rasa sakit itu, dan keempatnya murah.',
      ),
      ol(
        '**Satu daftar event di satu tempat.** Semua jenis event beserta artinya ditulis di satu berkas, sehingga ada satu tempat untuk melihat kosakata sistem.',
        '**Sertakan id korelasi di setiap event.** Dengan begitu seluruh akibat dari satu permintaan bisa dikumpulkan kembali di log, meskipun terjadi di waktu dan proses yang berbeda.',
        '**Tulis di dokumentasi siapa mendengarkan apa.** Satu tabel sederhana yang diperbarui bersama kode jauh lebih berharga daripada mencari pemanggil di seluruh repositori.',
        '**Jangan pakai event untuk alur yang harus urut dan harus berhasil semua.** Alur seperti itu lebih baik dipimpin satu pihak, dan sub-bab berikutnya membahas polanya.',
      ),
      code(
        'ts',
        `
        // src/bersama/daftar-event.ts
        // Kosakata sistem. Satu tempat untuk melihat apa saja yang bisa terjadi.

        export type EventSistem =
          /** Pembeli menyelesaikan pembayaran. Dipancarkan modul pembayaran. */
          | { jenis: 'PesananDibayar'; idPesanan: string; idPembeli: string; totalRupiah: number; idKorelasi: string; terjadiPada: string }
          /** Pesanan dibatalkan sebelum dibayar. Dipancarkan modul pesanan. */
          | { jenis: 'PesananDibatalkan'; idPesanan: string; alasan: string; idKorelasi: string; terjadiPada: string }
          /** Pengguna baru selesai mendaftar dan emailnya sudah terverifikasi. */
          | { jenis: 'PenggunaTerverifikasi'; idPengguna: string; idKorelasi: string; terjadiPada: string };
        `,
        {
          filename: 'src/bersama/daftar-event.ts',
          caption:
            'Komentar di atas tiap event menyebutkan siapa pemancarnya, karena itu yang paling sulit dicari nanti.',
        },
      ),

      h2('Rangkuman'),
      ul(
        'Event membalik arah pengetahuan, sehingga menambah kelakuan baru berhenti menyentuh kode lama.',
        'Event menyatakan fakta yang sudah terjadi. Kalau tidak adanya pendengar berarti ada pekerjaan yang terlewat, itu perintah, bukan event.',
        'Tiga tingkat isinya yaitu notifikasi, membawa keadaan, dan event sourcing. Tingkat kedua paling sering tepat.',
        'Bentuk ini tidak menuntut teknologi khusus. Bus sederhana di dalam satu aplikasi sudah memberi hampir seluruh manfaatnya.',
        'Pendengar dijalankan lewat antrean, supaya kegagalannya tidak menggagalkan pemancar dan bisa diulang.',
        'Kelemahannya adalah alur yang tersebar. Ditutup dengan daftar event terpusat, id korelasi, dan dokumentasi pendengar.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Arsitektur berbasis event membalik arah ketergantungan. Pengirim tidak lagi tahu siapa yang mendengarkan, dan itu yang dibeli maupun yang dibayar.',
      ),
      code(
        'text',
        `
        SEBELUM, pemanggilan langsung:
          buatPesanan()
            -> layananPembayaran.tagih()
            -> layananPengiriman.jadwalkan()
            -> layananNotifikasi.kirim()
            -> layananAnalitik.catat()

          Modul pesanan tahu keempat modul itu.
          Menambah satu penerima berarti mengubah modul pesanan.
          Dan bila ANALITIK mati, pesanan pelanggan GAGAL.

        SESUDAH, event:
          buatPesanan()
            -> terbitkan PesananDibuat

          Modul pesanan tidak tahu siapa yang mendengarkan.
          Menambah penerima tidak menyentuh modul pesanan sama sekali.
        `,
        { caption: 'Itulah pembalikan arahnya: penerima yang tahu pengirim, bukan sebaliknya.' },
      ),
      p(
        'Yang dibayar bisa diukur, dan yang pertama adalah bahwa kegagalan satu penerima tidak lagi terlihat oleh pengirim.',
      ),
      code(
        'text',
        `
        Diuji sungguhan di bab Laravel Lanjutan dengan PHP 8.3.6,
        tiga pendengar untuk satu peristiwa:

          TANPA isolasi, pendengar kedua melempar:
            hanya "surel" yang berjalan
            "audit" dan "perbaruiIndeks" TIDAK PERNAH dijalankan

          DENGAN isolasi per pendengar:
            "surel" dan "audit" berjalan
            hanya "perbaruiIndeks" yang gagal

        Tanpa isolasi, satu pendengar yang gagal menghentikan sisanya,
        dan catatan audit tidak pernah ditulis.
        `,
      ),
      p(
        'Biaya kedua menyangkut penjaminan pengiriman, dan ia menentukan cara menulis setiap pendengar.',
      ),
      code(
        'ts',
        `
        // Event dikirim PALING SEDIKIT sekali. Pendengar yang mati
        // sesudah bekerja dan sebelum menandai selesai akan dijalankan
        // ulang.
        async function padaPesananDibuat(e: { pesananId: number }) {
          // Kunci unik menolak pemrosesan kedua.
          const baru = await db.eventDiproses
            .create({ data: { event: 'PesananDibuat', pesananId: e.pesananId, pendengar: 'surel' } })
            .then(() => true)
            .catch(() => false);

          if (!baru) return;
          await kirimSurel(e.pesananId);
        }

        // Diuji di bab Desain API dengan bentuk yang sama:
        //   satu kunci, lima permintaan bersamaan -> satu hasil
        `,
      ),
      p(
        'Dan biaya ketiga bersifat penerbitan, yaitu bahwa menulis ke basis data dan menerbitkan event adalah dua penulisan yang bisa terpisah.',
      ),
      code(
        'text',
        `
        Bentuk yang RENTAN:

          BEGIN;
            INSERT INTO pesanan ...;
          COMMIT;
          terbitkan PesananDibuat;      <- di luar transaksi

        Bila proses mati di antara COMMIT dan terbitkan, pesanannya
        ada dan eventnya tidak pernah terbit. Tidak ada yang tahu.

        Bentuk sebaliknya juga rentan:
          terbitkan lebih dulu, lalu COMMIT gagal
          -> event tentang pesanan yang tidak pernah ada

        Yang menutupnya: KOTAK KELUAR TRANSAKSIONAL.
          BEGIN;
            INSERT INTO pesanan ...;
            INSERT INTO kotak_keluar (event, muatan) VALUES (...);
          COMMIT;
          -- proses terpisah membaca kotak_keluar dan menerbitkannya

        Dengan begitu keduanya atomik, sebab keduanya satu transaksi.
        `,
        {
          caption:
            'Diuji di bab Konsistensi: transaksi basis data TIDAK mencakup panggilan jaringan.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pada arsitektur event punya sifat yang khas, yaitu tidak ada yang melaporkannya.',
      ),
      code(
        'text',
        `
        1. Event terbit, tidak ada yang mendengarkan

           Nama event diubah, atau pendengar lupa didaftarkan.
           Pengirim tidak tahu, sebab ia memang tidak pernah tahu
           siapa yang mendengarkan.

           Gejalanya: "notifikasinya tidak terkirim sejak Selasa",
           dilaporkan pengguna, bukan oleh sistem.

        2. Pendengar gagal diam-diam

           try { await kerjakan(e); } catch { /* abaikan */ }

           Event dianggap selesai, dan pekerjaannya tidak pernah
           terjadi.

        3. Urutan yang diasumsikan padahal tidak dijamin

           PesananDibuat lalu PesananDibatalkan.
           Dengan beberapa pekerja paralel, yang kedua bisa diproses
           lebih dulu, dan pembatalan atas pesanan yang belum ada
           akan gagal — lalu pesanannya tetap aktif.

        4. Event membawa salinan data yang sudah basi

           {"pesananId": 42, "total": 150000}
           Diproses 3 jam kemudian; pesanan 42 sudah dibatalkan.
           Kirim ID, baca keadaan TERBARU.
        `,
      ),
      p(
        'Kegagalan kelima adalah yang paling sulit diperbaiki kemudian, yaitu event yang bentuknya mengikuti implementasi pengirimnya.',
      ),
      code(
        'text',
        `
        Event yang BOCOR:
          {"pesanan_row": { ...seluruh kolom tabel pesanan... }}

        Setiap perubahan skema tabel pesanan kini memutus seluruh
        pendengar. Kontraknya menjadi tabel, bukan peristiwa.

        Event yang BENAR ditulis sebagai FAKTA yang sudah terjadi:
          {
            "event": "PesananDibuat",
            "versi": 1,
            "pesananId": 42,
            "pelangganId": 7,
            "waktu": "2026-09-14T08:31:02.114Z"
          }

        Field yang dimuat hanya yang memang bagian dari fakta itu,
        bukan seluruh isi barisnya.

        Dan "versi" di situ yang membuatnya bisa berevolusi dengan
        expand-migrate-contract, sama seperti kontrak API.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEENAM: tidak ada cara melihat apa yang terjadi.

        Di pemanggilan langsung, satu jejak tumpukan menunjukkan
        seluruh rantainya.
        Di arsitektur event, rantainya terputus di setiap batas.

        Yang menutupnya: penanda korelasi yang ikut di dalam SETIAP
        event, dan ikut ke setiap baris log pendengarnya.

          {"event":"PesananDibuat","jejak":"req_ezj2c4in", ...}

        Tanpa itu, pertanyaan "kenapa surel ini terkirim" tidak
        punya jawaban yang bisa ditelusuri.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Event membeli kelonggaran antar bagian dan menuntut disiplin yang tidak dibutuhkan pemanggilan langsung.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis pendengar yang tidak idempoten',
            'Event-nya kan sekali terbit',
            'Pengiriman dijamin PALING SEDIKIT sekali. Pendengar yang mati sesudah bekerja akan diulang',
          ],
          [
            'Menerbitkan event di luar transaksi',
            'Setelah commit kan sudah pasti',
            'Proses yang mati di antaranya membuat pesanan ada tanpa event. Pakai kotak keluar transaksional',
          ],
          [
            'Menjalankan semua pendengar dalam satu jalur',
            'Lebih sederhana',
            'Diuji, satu pendengar yang gagal menghentikan sisanya, dan audit tidak pernah ditulis',
          ],
          [
            'Memasukkan seluruh baris tabel ke dalam event',
            'Biar pendengar tidak perlu query',
            'Kontraknya menjadi skema tabel. Setiap perubahan kolom memutus seluruh pendengar',
          ],
          [
            'Mengandalkan urutan event',
            'Terbitnya kan berurutan',
            'Pekerja paralel memprosesnya dengan urutan berbeda. Pakai partisi per entitas atau nomor versi',
          ],
          [
            'Tidak menyertakan penanda korelasi',
            'Event-nya kan sudah punya id',
            'Rantainya terputus di setiap batas. Pertanyaan "kenapa ini terjadi" tidak bisa ditelusuri',
          ],
        ],
      ),
      p(
        'Ada satu ujian yang cukup andal untuk menilai apakah sebuah event dirancang dengan benar, dan ia tidak memerlukan alat. Bacalah namanya dan isinya, lalu tanyakan apakah ia menggambarkan sesuatu yang **sudah terjadi di dunia nyata** atau menggambarkan sesuatu yang **terjadi di dalam basis datamu**. Event yang benar bisa dipahami oleh orang yang tidak pernah melihat skemamu, dan itu pula yang membuatnya bisa bertahan ketika skemanya berubah.',
      ),
      references(
        {
          label: 'Event-driven architecture style',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven',
          source: 'Microsoft',
          note: 'Perbandingan model notifikasi dan model yang membawa keadaan, beserta kapan masing-masing tepat.',
        },
        {
          label: 'Publisher-Subscriber pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/publisher-subscriber',
          source: 'Microsoft',
          note: 'Bentuk dasar pemancar dan pendengar beserta hal yang harus diputuskan saat memakainya.',
        },
        {
          label: 'Event Sourcing pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing',
          source: 'Microsoft',
          note: 'Tingkat ketiga dijelaskan lengkap, termasuk kerumitan yang membuatnya jarang sepadan.',
        },
      ),
    ],
  ),

  written(
    'kepemilikan-data',
    'Kepemilikan Data dan Salinannya',
    22,
    'Satu pemilik per data, dan cara hidup dengan salinan yang tidak selalu terkini.',
    [
      p(
        'Bayangkan sebuah kantor yang punya satu lemari arsip bersama. Semua orang boleh membuka lacinya, mengambil berkas, mengubah isinya, dan mengembalikannya. Awalnya praktis sekali, karena tidak perlu izin siapa pun.',
      ),
      p(
        'Enam bulan kemudian, ada angka yang salah di sebuah berkas. Pertanyaan pertama yang muncul adalah siapa yang mengubahnya, dan jawabannya tidak ada. Pertanyaan kedua, bolehkah kita mengganti format berkasnya supaya lebih rapi, dan jawabannya juga tidak ada, karena tidak ada yang tahu siapa saja yang sudah terbiasa dengan format lama.',
      ),
      p(
        'Kantor yang sehat menyelesaikan ini dengan cara sederhana, yaitu **tiap lemari punya penanggung jawab**. Orang lain tetap boleh meminta isinya, hanya saja lewat orangnya, bukan dengan membuka laci sendiri.',
      ),
      p(
        'Aturan yang sama persis berlaku untuk data, dan ia sudah disebut berkali-kali di kategori ini. Sekarang waktunya dibongkar tuntas. Bunyinya, **setiap data punya tepat satu pemilik, dan hanya pemiliknya yang boleh menulisnya**.',
      ),
      p(
        'Aturan sesederhana itu ternyata yang paling sering dilanggar, karena melanggarnya selalu lebih cepat. Menulis query langsung ke tabel milik modul lain memakan dua menit, sedangkan meminta pemiliknya menyediakan fungsi resmi bisa memakan dua hari. Sub-bab ini menjelaskan kenapa dua hari itu sepadan, dan bagaimana hidup dengan konsekuensinya.',
      ),

      terms(
        {
          term: 'data ownership (kepemilikan data)',
          meaning:
            'Kejelasan tentang bagian mana yang berhak menulis sebuah data dan bertanggung jawab menjaga kebenarannya. Dibaca "deita onersyip". Pemilik boleh mengubah bentuk penyimpanannya kapan saja tanpa memberi tahu siapa pun, dan justru kebebasan itulah yang dibeli oleh aturan ini.',
        },
        {
          term: 'source of truth (sumber kebenaran)',
          meaning:
            'Tempat yang jawabannya dianggap benar ketika beberapa tempat menyimpan hal yang sama tetapi berbeda isi. Dibaca "sors of trut", artinya sumber kebenaran. Kenapa ini perlu ditetapkan di depan. Karena saat dua tempat berbeda isi, pertanyaannya bukan "mana yang benar" melainkan "mana yang **kita sepakati** benar". Tanpa kesepakatan itu, setiap ketidakcocokan berubah menjadi penyelidikan. Dengan kesepakatan itu, salinan yang berbeda otomatis dianggap salah dan tinggal dibangun ulang dari sumbernya.',
        },
        {
          term: 'read model (model baca)',
          meaning:
            'Salinan data yang disusun khusus untuk dibaca, biasanya sudah digabungkan dan diratakan supaya query-nya cepat. Dibaca "rid model". Analoginya seperti ringkasan rapat, yaitu ia disusun dari notulen lengkap supaya lebih cepat dibaca, tetapi kalau isinya berbeda dari notulen, yang salah pasti ringkasannya. Sifat itu yang membuat read model aman, yaitu ia **turunan**, sehingga kalau ia rusak jawabannya selalu membangun ulang dari sumbernya, bukan memperbaikinya satu per satu.',
        },
        {
          term: 'replikasi data',
          meaning:
            'Menyalin data dari pemiliknya ke tempat lain supaya bisa dibaca tanpa memanggil pemiliknya. Berbeda dari replikasi database di sub-bab [replikasi](/kelas/system-design/skala-data/replikasi) yang menyalin apa adanya, replikasi antar bagian biasanya menyalin **sebagian** dan dalam bentuk yang berbeda.',
        },
        {
          term: 'foreign key lintas batas',
          meaning:
            'Relasi database yang menghubungkan tabel milik dua bagian berbeda, misalnya `pesanan.id_produk` yang menunjuk ke `katalog.produk`. Kelihatan seperti jaring pengaman karena database akan menolak data yang tidak nyambung. Harganya, ia mengunci kedua bagian dalam satu database selamanya, karena tidak ada database yang bisa menegakkan relasi ke tabel yang berada di mesin lain. Karena itu batas modul yang serius biasanya menyimpan `id_produk` sebagai kolom biasa tanpa relasi, dan menerima bahwa pemeriksaannya pindah ke kode.',
        },
        {
          term: 'staleness (kebasian)',
          meaning:
            'Selisih waktu antara perubahan di sumber dan perubahan di salinan. Dibaca "steilnes". Setiap salinan pasti punya kebasian, dan itu bukan cacat yang bisa diperbaiki melainkan sifat yang harus diterima. Pekerjaan perancang bukan menghilangkannya melainkan memutuskan **berapa besar yang masih boleh** untuk tiap jenis data. Nama produk yang basi lima menit tidak merugikan siapa pun. Stok barang yang basi lima menit membuat kamu menjual barang yang sudah habis.',
        },
      ),

      h2('Kenapa pemilik tunggal itu wajib'),
      p(
        'Alasan yang paling sering disebut adalah kerapian, dan itu alasan yang lemah. Ada tiga alasan yang jauh lebih kuat dan langsung terasa akibatnya.',
      ),
      steps(
        {
          title: 'Pemilik kehilangan kebebasan mengubah bentuknya',
          body: 'Begitu ada modul lain yang membaca tabelmu langsung, nama kolom dan tipenya berubah menjadi kontrak publik tanpa pernah kamu setujui. Menambah kolom masih aman, tetapi mengganti nama, memecah tabel, atau mengubah satuan berubah menjadi negosiasi lintas tim.',
        },
        {
          title: 'Aturan bisnis bisa dilewati tanpa terlihat',
          body: 'Kalau modul pesanan menulis langsung ke tabel saldo, seluruh aturan yang dijaga modul saldo terlewati. Pemeriksaan saldo minimum, pencatatan riwayat, dan batas penarikan tidak berjalan. Kegagalan seperti ini tidak memunculkan error apa pun, hanya data yang perlahan menjadi salah.',
        },
        {
          title: 'Pemisahan nanti menjadi mustahil tanpa membongkar semuanya',
          body: 'Sub-bab 2.6 menyebut kepemilikan data sebagai langkah yang paling menentukan. Kalau lima modul membaca satu tabel, memindahkan tabel itu berarti mengubah lima modul sekaligus, dan itulah alasan banyak rencana pemecahan berhenti di tengah jalan.',
        },
      ),
      callout(
        'warning',
        'Alasan kedua adalah yang paling berbahaya',
        'Kehilangan kebebasan mengubah bentuk terasa sebagai gangguan. Aturan bisnis yang terlewat terasa sebagai **data yang salah tanpa ada yang tahu penyebabnya**. Saldo yang tidak cocok, stok yang minus, dan status yang mustahil hampir selalu berakar pada satu penulis tidak resmi yang terlupakan.',
      ),

      h2('Kalau butuh data milik orang lain'),
      p(
        'Kebutuhan membaca data milik bagian lain itu wajar dan sering. Ada empat cara sah, dan urutannya dari yang paling sederhana.',
      ),
      table(
        ['Cara', 'Kesegaran data', 'Beban pemilik', 'Cocok untuk'],
        [
          [
            'Panggil pemiliknya saat dibutuhkan',
            'Selalu terkini',
            'Setiap pembacaan menjadi beban pemilik',
            'Data yang jarang dibaca dan harus terkini, misalnya saldo saat transaksi',
          ],
          [
            'Panggil lalu simpan sebentar di cache',
            'Basi sebesar TTL',
            'Jauh berkurang',
            'Data yang sering dibaca dan jarang berubah, misalnya nama dan foto profil',
          ],
          [
            'Simpan salinan yang diperbarui lewat event',
            'Basi sebesar jeda pemrosesan event',
            'Nyaris nol saat membaca',
            'Data yang sangat sering dibaca, misalnya nama produk di daftar pesanan',
          ],
          [
            'Simpan sebagai fakta historis',
            'Sengaja tidak pernah berubah',
            'Nol',
            'Nilai yang berlaku pada suatu peristiwa, misalnya harga saat pembelian',
          ],
        ],
        'Baris keempat bukan salinan. Ia data baru yang kebetulan nilainya diambil dari tempat lain.',
      ),
      p(
        'Baris keempat pantas ditegaskan karena ia sering dikira duplikasi yang malas. Harga yang berlaku saat pembelian **bukan salinan harga produk**. Ia fakta milik pesanan yang memang harus tetap sama meskipun katalog menaikkan harga besok. Bedanya bukan teknis melainkan makna, dan menyadarinya menghilangkan banyak perdebatan.',
      ),

      h2('Menjaga salinan lewat event'),
      p(
        'Cara ketiga adalah yang paling sering dipakai untuk data yang dibaca sangat sering. Wujudnya sederhana, yaitu pemilik memancarkan event saat datanya berubah, dan pemakai memperbarui salinannya.',
      ),
      code(
        'sql',
        `
        -- Modul pesanan menyimpan salinan kecil data produk yang ia butuhkan.
        -- Hanya field yang benar-benar dipakai, bukan seluruh baris produk.

        CREATE TABLE pesanan.salinan_produk (
          id_produk      uuid PRIMARY KEY,
          nama           text NOT NULL,
          gambar_utama   text,
          -- Dipakai untuk mendeteksi event yang datang terlambat atau tidak urut.
          versi_sumber   bigint NOT NULL,
          disalin_pada   timestamptz NOT NULL DEFAULT now()
        );
        `,
        {
          filename: 'migrations/012-salinan-produk.sql',
          caption:
            'Kolom `versi_sumber` adalah yang membedakan salinan yang benar dari salinan yang kacau.',
        },
      ),
      code(
        'ts',
        `
        import { dengarkan } from '@/bersama/bus';

        dengarkan<ProdukDiperbarui>('ProdukDiperbarui', async (event) => {
          await db.query(
            \`INSERT INTO pesanan.salinan_produk (id_produk, nama, gambar_utama, versi_sumber)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id_produk) DO UPDATE
               SET nama = EXCLUDED.nama,
                   gambar_utama = EXCLUDED.gambar_utama,
                   versi_sumber = EXCLUDED.versi_sumber,
                   disalin_pada = now()
             -- Event yang datang terlambat punya versi lebih kecil dan diabaikan.
             WHERE pesanan.salinan_produk.versi_sumber < EXCLUDED.versi_sumber\`,
            [event.idProduk, event.nama, event.gambarUtama, event.versi],
          );
        });
        `,
        {
          filename: 'src/pesanan/pendengar-produk.ts',
          caption:
            'Klausa `WHERE` di akhir membuat pendengar ini aman diulang sekaligus tahan terhadap urutan yang kacau.',
        },
      ),
      p(
        'Klausa terakhir itu menyelesaikan dua masalah sekaligus yang sering baru ketahuan di produksi. Antrean menjamin pesan sampai minimal sekali tetapi **tidak menjamin urutannya**, sehingga event versi 5 bisa saja tiba setelah versi 6. Tanpa perbandingan versi, salinanmu akan mundur ke nilai lama tanpa ada yang tahu.',
      ),
      callout(
        'tip',
        'Salin sesedikit mungkin',
        'Godaan terbesar adalah menyalin seluruh baris supaya nanti tidak perlu menambah kolom lagi. Justru sebaliknya yang benar. Setiap field yang kamu salin adalah field yang harus kamu jaga tetap benar, dan field yang tidak kamu salin tidak pernah bisa salah. Salin yang benar-benar ditampilkan atau dipakai memutuskan, tidak lebih.',
      ),

      h2('Rekonsiliasi, karena salinan pasti menyimpang'),
      p(
        'Semua cara di atas punya satu sifat yang sama, yaitu **salinan pasti menyimpang cepat atau lambat**. Event bisa hilang, pendengar bisa mati saat memproses, dan pernah ada saat ketika kode pendengarnya salah. Yang membedakan sistem sehat dari sistem yang diam-diam salah adalah adanya pemeriksaan berkala.',
      ),
      code(
        'sql',
        `
        -- Dijalankan terjadwal, misalnya sekali sehari di jam sepi.
        -- Hasil tidak kosong berarti ada salinan yang menyimpang dari sumbernya.

        SELECT
          s.id_produk,
          s.nama          AS nama_di_salinan,
          k.nama          AS nama_di_sumber,
          s.versi_sumber  AS versi_di_salinan,
          k.versi         AS versi_di_sumber
        FROM pesanan.salinan_produk s
        JOIN katalog.produk k ON k.id = s.id_produk
        WHERE s.versi_sumber < k.versi
        LIMIT 100;
        `,
        {
          caption:
            'Query ini melintasi batas modul, dan itu sah karena ia pekerjaan pemeliharaan, bukan jalur aplikasi.',
        },
      ),
      p(
        'Query itu memang membaca dua schema sekaligus, dan itu terlihat melanggar aturan yang baru saja ditegakkan. Perbedaannya penting, yaitu ia **bukan bagian dari jalur permintaan** melainkan pekerjaan pemeliharaan yang dijalankan terjadwal. Kalau nanti kedua bagian benar-benar terpisah menjadi dua layanan, pemeriksaan ini berubah bentuk menjadi perbandingan lewat API atau perbandingan ekspor berkala.',
      ),
      p(
        'Yang penting bukan bentuk query-nya melainkan tiga hal berikut. Ada yang **memeriksa** secara berkala, ada **alert** kalau selisihnya melewati ambang, dan ada **cara memperbaiki** yaitu membangun ulang salinan dari sumbernya. Salinan yang tidak punya cara dibangun ulang adalah salinan yang berubah menjadi sumber kebenaran tanpa pernah diputuskan.',
      ),

      h2('Batas yang memotong data yang wajib konsisten'),
      p(
        'Ada satu keadaan ketika jawaban yang benar bukan menyalin, melainkan **mengakui bahwa batasnya salah**. Keadaan itu adalah ketika dua data harus benar bersamaan dalam satu waktu.',
      ),
      table(
        ['Contoh', 'Boleh basi?', 'Kesimpulan'],
        [
          [
            'Nama produk yang ditampilkan di daftar pesanan',
            'Boleh basi beberapa detik atau menit',
            'Salin. Tidak ada yang dirugikan',
          ],
          [
            'Stok tersedia saat pembeli menekan tombol beli',
            'Tidak boleh',
            'Jangan salin. Panggil pemiliknya, dan biarkan ia yang memutuskan',
          ],
          [
            'Saldo saat penarikan dana',
            'Tidak boleh',
            'Jangan salin. Kalau ini sering terjadi lintas batas, batasnya salah',
          ],
          ['Jumlah pengikut yang ditampilkan di profil', 'Boleh basi', 'Salin atau hitung berkala'],
          [
            'Hak akses saat memeriksa boleh tidaknya sebuah aksi',
            'Tidak boleh',
            'Jangan salin. Sub-bab [hak seminimal mungkin](/kelas/keamanan-fullstack/identitas-kewenangan/hak-seminimal-mungkin) mengikat di sini',
          ],
        ],
        'Baris ketiga adalah sinyal batas yang salah, bukan masalah teknis yang perlu dicarikan pola.',
      ),
      p(
        'Kalau kamu menemukan dirinya sering butuh konsistensi seketika lintas batas, jangan mencari pola yang lebih canggih. Kembalilah ke sub-bab 2.4, karena data yang wajib konsisten bersama sebaiknya berada di sisi batas yang sama. Menggabungkan dua modul yang ternyata satu jauh lebih murah daripada membangun mesin konsistensi terdistribusi.',
      ),

      h2('Rangkuman'),
      ul(
        'Setiap data punya tepat satu pemilik, dan hanya pemiliknya yang boleh menulis.',
        'Alasan terkuatnya bukan kerapian, melainkan kebebasan mengubah bentuk, aturan bisnis yang tidak terlewati, dan kemungkinan memisahkan nanti.',
        'Empat cara sah membaca data milik orang lain yaitu panggil, cache, salin lewat event, dan simpan sebagai fakta historis.',
        'Fakta historis bukan salinan. Harga saat pembelian memang milik pesanan, bukan milik katalog.',
        'Salinan pasti menyimpang, sehingga wajib ada pemeriksaan berkala, alert, dan cara membangun ulang.',
        'Kebutuhan konsistensi seketika lintas batas adalah sinyal batasnya salah, bukan sinyal butuh pola yang lebih canggih.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Kepemilikan data adalah aturan bahwa setiap data punya satu pemilik yang berhak mengubahnya. Tanpa aturan itu, batas modul apa pun hanya berlaku di kode dan tidak berlaku di tempat datanya berada.',
      ),
      code(
        'text',
        `
        Batas yang ADA di kode dan TIDAK ADA di data:

          modul/pesanan dan modul/katalog terpisah rapi
          dan keduanya membaca tabel produk secara LANGSUNG

        Batas itu fiktif, dan tandanya tidak muncul di graf impor
        sama sekali. Fitness function berbasis impor tidak akan
        menemukannya.

        Yang menemukannya: memeriksa nama tabel yang disentuh tiap
        modul. Tabel yang disentuh dua modul adalah batas yang bocor.

        Diukur pada project ini sebagai pembanding, graf impornya
        bisa ditelusuri sepenuhnya:
          116 berkas, 337 sisi, dan satu pelanggaran arah ditemukan
          src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

        Pelanggaran seperti itu TERLIHAT. Pelanggaran kepemilikan
        data tidak.
        `,
        {
          caption:
            'Itulah kenapa kepemilikan data harus diperiksa dengan cara yang berbeda dari kepemilikan kode.',
        },
      ),
      p(
        'Akibatnya baru terasa penuh ketika pemecahan dipertimbangkan, dan biayanya bisa dihitung.',
      ),
      code(
        'text',
        `
        Bila modul berbagi tabel:
          memecahnya berarti memecah basis datanya, dan setiap JOIN
          lintas modul harus ditulis ulang sebagai panggilan jaringan

          Diukur:
            pemanggilan fungsi   puluhan nanodetik
            loopback             1,69 ms
            internet             p50 70,04 ms, p99 362,72 ms

          Dan JOIN yang tadinya satu query menjadi N+1 lewat jaringan.

        Bila modul sudah berbicara lewat pintu masuknya:
          pemecahannya berarti mengganti pemanggilan fungsi menjadi
          panggilan jaringan DI SATU TEMPAT
        `,
      ),
      p(
        'Ketika data memang dibutuhkan di beberapa tempat, bentuk yang benar adalah salinan yang jelas siapa pemiliknya.',
      ),
      code(
        'text',
        `
        Tiga bentuk, dan pertukarannya:

        1. TANYAKAN ke pemiliknya setiap kali
           + selalu terbaru
           - membayar round trip tiap kali; diukur 1,69 ms sampai 70 ms
           - pemilik yang mati menjatuhkan pemanggilnya

        2. SALIN yang dibutuhkan, perbarui lewat event
           + tidak ada panggilan saat membaca
           - salinannya bisa basi, dan itu harus diterima
           - butuh mekanisme pendamaian

        3. SALIN yang TIDAK BERUBAH pada saat kejadian
           + tidak pernah basi, sebab memang tidak boleh berubah
           - hanya berlaku untuk data yang bersifat catatan sejarah

        Bentuk ketiga sering yang paling tepat dan paling jarang
        dipakai.
        `,
      ),
      code(
        'ts',
        `
        // Bentuk 3: harga pada saat pesanan dibuat BUKAN salinan
        // basi dari katalog. Ia fakta sejarah yang memang harus tetap.
        interface BarisPesanan {
          produkId: string;
          namaSaatDipesan: string;      // disalin SENGAJA
          hargaSaatDipesan: number;     // disalin SENGAJA
          jumlah: number;
        }

        // Bila harga produk naik besok, faktur kemarin TIDAK boleh
        // ikut berubah. Menyimpan referensi ke katalog justru SALAH
        // di sini — bukan optimasi, melainkan kekeliruan domain.
        `,
        { caption: 'Sebagian denormalisasi bukan optimasi melainkan pemodelan yang benar.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan kepemilikan data punya bentuk yang sangat khas, dan yang pertama adalah salinan yang menyimpang.',
      ),
      code(
        'text',
        `
        Diuji sungguhan pada PostgreSQL 16.15, penghitung yang
        disimpan terpisah dari sumbernya:

          penghitung  = 3
          sebenarnya  = 4        <- sudah menyimpang

          -- 2 baris dihapus TANPA memperbarui penghitung --

          penghitung  = 3
          sebenarnya  = 2        <- menyimpang ke arah sebaliknya

        Satu jalur penghapusan yang lupa memperbarui sudah cukup,
        dan tidak ada satu pun error yang muncul.

        Jalur yang bisa mengubah data tanpa lewat kodemu:
          ON DELETE CASCADE
          skrip migrasi dan backfill
          perbaikan data lewat konsol
          jalur kode lain yang lupa
          pemulihan cadangan sebagian
        `,
      ),
      p('Karena itu setiap salinan menuntut dua hal, dan yang kedua hampir selalu ditunda.'),
      code(
        'sql',
        `
        -- 1. Diperbarui di tempat yang sama dengan perubahannya,
        --    atau lewat trigger supaya jalur apa pun ikut terhitung.

        -- 2. Ada yang MENDAMAIKANNYA berkala, dan melaporkan selisihnya.
        SELECT a.id, a.jumlah_komentar, count(k.id) AS sebenarnya
        FROM artikel a LEFT JOIN komentar k ON k.artikel_id = a.id
        GROUP BY a.id, a.jumlah_komentar
        HAVING a.jumlah_komentar <> count(k.id);
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEDUA: dua pemilik untuk satu data.

          Modul A menulis kolom status.
          Modul B juga menulis kolom status, dengan aturan berbeda.

        Hasilnya bergantung pada siapa yang menulis terakhir, dan
        itu berubah-ubah. Tidak ada yang bisa menjelaskan kenapa
        statusnya kadang begini dan kadang begitu.

        Yang menutupnya: satu pemilik per data, dan yang lain
        MEMINTA perubahan lewat pintu masuk pemiliknya — sehingga
        seluruh aturannya berada di satu tempat.

        Diuji di bab Skala Data, bentuk pertentangannya juga terukur:
          2.000 UPDATE ke BARIS YANG SAMA  : 459 ms
          2.000 UPDATE ke baris BERBEDA    :  29 ms
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: salinan yang dianggap sumber kebenaran.

          Laporan dibuat dari salinan yang diperbarui lewat event.
          Satu event hilang. Laporannya salah, dan tidak ada yang
          tahu sampai ada yang membandingkannya dengan sumbernya.

        Aturan yang menutupnya:
          - sumber kebenaran HANYA satu, dan ia milik pemiliknya
          - salinan boleh dipakai untuk membaca, TIDAK untuk
            memutuskan hal yang tidak bisa dibatalkan
          - keputusan uang dan keputusan otorisasi dibaca dari sumber

        Diuji di bab Skala Data: saat beban tulis besar, 8 dari 8
        pembacaan dari replika sesudah penulisan GAGAL menemukan
        datanya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kepemilikan data adalah aturan yang paling mudah dilanggar sebab pelanggarannya tidak terlihat di kode.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membiarkan dua modul membaca tabel yang sama',
            'Basis datanya kan satu',
            'Batasnya fiktif dan tidak muncul di graf impor. Periksa tabel yang disentuh tiap modul',
          ],
          [
            'Membiarkan dua modul MENULIS kolom yang sama',
            'Keduanya kan butuh mengubahnya',
            'Hasilnya bergantung siapa yang menulis terakhir. Satu pemilik, dan yang lain meminta lewat pintu masuknya',
          ],
          [
            'Menyalin data tanpa mekanisme pendamaian',
            'Event-nya kan selalu terbit',
            'Diuji, satu penghapusan yang lewat jalur lain membuat salinan menyimpang tanpa satu pun error',
          ],
          [
            'Memutuskan hal penting dari salinan',
            'Isinya kan sama',
            'Diuji, 8 dari 8 pembacaan dari replika gagal saat beban tulis. Baca dari sumber untuk keputusan penting',
          ],
          [
            'Menyimpan referensi ke katalog di baris faktur',
            'Biar tidak duplikat',
            'Harga yang naik besok mengubah faktur kemarin. Sebagian salinan adalah pemodelan yang benar',
          ],
          [
            'Menunda memisahkan data sampai saat pemecahan',
            'Nanti sekalian',
            'Diukur, JOIN yang tadinya satu query menjadi N+1 lewat jaringan dengan biaya 1,69 ms sampai 70 ms per hop',
          ],
        ],
      ),
      p(
        'Pemeriksaan yang paling berguna di sub-bab ini tidak melihat kode sama sekali. Buat daftar setiap tabel, lalu tulis modul mana yang MEMBACA dan modul mana yang MENULIS masing-masing. Tabel dengan lebih dari satu penulis adalah batas yang sudah bocor hari ini, dan tabel yang dibaca banyak modul adalah tempat pemecahan nanti akan paling mahal.',
      ),
      references(
        {
          label: 'Data considerations for microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/data-considerations',
          source: 'Microsoft',
          note: 'Kepemilikan data, salinan, dan akibatnya pada konsistensi.',
        },
        {
          label: 'Materialized View pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view',
          source: 'Microsoft',
          note: 'Bentuk resmi dari salinan yang disusun khusus untuk dibaca, beserta cara membangunnya ulang.',
        },
        {
          label: 'Microservices on AWS',
          href: 'https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/microservices-on-aws.html',
          source: 'Amazon Web Services',
          note: 'Bagian database per service dan akibatnya pada cara membaca data milik layanan lain.',
        },
      ),
    ],
  ),

  written(
    'konsistensi-lintas-bagian',
    'Konsistensi Lintas Bagian',
    22,
    'Apa yang menggantikan transaksi database begitu data tidak lagi berada di satu tempat.',
    [
      p(
        'Bayangkan kamu memesan tiket konser di loket. Petugas mengurangi kursi yang tersedia, menerima uangmu, lalu mencetak tiketnya. Tiga langkah, satu petugas, satu meja.',
      ),
      p(
        'Kalau printernya macet di langkah ketiga, petugas itu bisa langsung membatalkan semuanya di tempat, yaitu mengembalikan uangmu dan mengembalikan kursinya. Kamu pulang tanpa kehilangan apa-apa. Itulah yang dilakukan **transaksi database**, dan sub-bab [transaksi ACID](/kelas/backend-basic/database-sql-dasar/transaksi-acid) sudah mengajarkannya.',
      ),
      p(
        'Sekarang bayangkan ketiga langkah itu dikerjakan tiga kantor berbeda di tiga kota. Kantor kursi sudah mengurangi stoknya, kantor keuangan sudah menerima uangmu, lalu kantor percetakan mengabari bahwa tiketnya gagal dicetak.',
      ),
      p(
        'Sekarang tidak ada satu orang pun yang bisa membatalkan semuanya sekaligus. Yang bisa dilakukan hanya **menelepon balik satu per satu** dan meminta masing-masing membatalkan bagiannya sendiri. Dan selama telepon itu berlangsung, kursimu memang sudah berkurang di sistem mereka.',
      ),
      p(
        'Itulah yang terjadi begitu data terpisah. Tidak ada `BEGIN` yang menjangkau dua database, dan tidak ada `ROLLBACK` yang bisa membatalkan sesuatu yang sudah terjadi di layanan lain. Sub-bab ini membahas apa yang menggantikannya, dan yang lebih penting, membahas kapan sebaiknya kamu **tidak** perlu penggantinya sama sekali.',
      ),

      terms(
        {
          term: 'atomicity (keutuhan)',
          meaning:
            'Sifat sekumpulan penulisan yang berhasil semua atau gagal semua, tanpa keadaan tengah yang tersisa. Dibaca "atomisiti", dari kata atom yang berarti tidak bisa dibelah. Kata kuncinya "tanpa keadaan tengah", yaitu tidak ada satu momen pun ketika orang lain bisa melihat separuh pekerjaan. Ini yang diberikan transaksi database, dan ini pula yang hilang begitu penulisan tersebar ke lebih dari satu tempat.',
        },
        {
          term: 'saga',
          meaning:
            'Rangkaian langkah yang masing-masing punya transaksi sendiri, ditambah langkah pembatal untuk tiap langkah yang sudah terlanjur berhasil. Dibaca "saga", diambil dari kata saga yang berarti kisah panjang berbabak. Namanya cocok, karena ia memang cerita berbabak yang tiap babaknya punya cara sendiri untuk dibatalkan. Yang penting dipahami, saga **tidak** memberi keutuhan seperti transaksi. Ia memberi sesuatu yang lebih lemah tetapi masih berguna, yaitu jaminan bahwa keadaan akhirnya masuk akal, meskipun di tengah jalan sempat terlihat aneh.',
        },
        {
          term: 'compensating transaction (transaksi pembatal)',
          meaning:
            'Langkah yang membatalkan akibat sebuah langkah yang sudah berhasil, misalnya mengembalikan stok yang sudah dikurangi. Dibaca "kompenseiting transaksyen", artinya transaksi pengimbang. Bedanya dengan rollback penting sekali dan sering disalahpahami. **Rollback** membuat seolah tidak pernah terjadi apa-apa, tidak ada jejak sama sekali. **Pembatal** adalah langkah baru yang meniadakan akibatnya, dan jejaknya tetap ada. Analoginya bukan menghapus tulisan pakai penghapus, melainkan menulis baris koreksi di bawahnya, persis seperti pembukuan.',
        },
        {
          term: 'transactional outbox',
          meaning:
            'Pola menyimpan pesan yang akan dikirim ke dalam tabel di database yang sama dengan perubahan datanya, sehingga keduanya masuk satu transaksi. Dibaca "transaksyonal autboks", artinya kotak keluar yang ikut transaksi. Analoginya kotak surat keluar di meja kerja. Kamu tidak langsung berlari ke kantor pos setiap menulis surat, melainkan menaruhnya di kotak keluar bersamaan dengan mengarsipkan salinannya. Nanti ada petugas yang mengambil seluruh isi kotak lalu mengirimkannya. Kalau kamu pingsan setelah menaruh surat, suratnya tetap terkirim, karena ia sudah ada di kotak.',
        },
        {
          term: 'dual write problem',
          meaning:
            'Masalah ketika sebuah operasi harus menulis ke dua tempat yang tidak bisa satu transaksi, misalnya database dan antrean. Dibaca "dual rait problem", artinya masalah penulisan ganda. Bentuk masalahnya begini. Kamu menulis `await db.simpan()` lalu `await antrean.kirim()`. Kalau proses mati **tepat di antara kedua baris itu**, datanya tersimpan tetapi tidak ada yang tahu. Celahnya memang cuma beberapa milidetik, tetapi pada aplikasi yang memproses ribuan transaksi per hari, celah beberapa milidetik itu pasti kena cepat atau lambat.',
        },
        {
          term: 'idempoten',
          meaning:
            'Sifat operasi yang menghasilkan keadaan sama meskipun dijalankan berkali-kali. Dibaca "idempoten". Contoh yang idempoten, `status = "dibayar"` yang dijalankan lima kali tetap menghasilkan satu status dibayar. Contoh yang **tidak** idempoten, `saldo = saldo + 100000` yang dijalankan lima kali menambah lima ratus ribu. Sifat ini wajib untuk setiap langkah saga dan setiap pengerja antrean, karena antrean menjamin pesan sampai **minimal sekali**, bukan tepat sekali, sehingga pengerjaan ulang adalah kepastian bukan kemungkinan.',
        },
        {
          term: 'orchestration saga',
          meaning:
            'Bentuk saga yang alurnya dipegang satu pihak yang menyuruh langkah demi langkah dan tahu cara membatalkan tiap langkah. Dibaca "orkestreisyen saga". Lebih mudah dibaca dan ditelusuri, tetapi pengetahuan alurnya terpusat di satu tempat.',
        },
        {
          term: 'choreography saga',
          meaning:
            'Bentuk saga yang tiap langkahnya bereaksi terhadap event dari langkah sebelumnya, tanpa ada yang memimpin. Dibaca "koreografi saga". Lebih longgar ikatannya, tetapi tidak ada satu tempat pun yang memperlihatkan alur utuhnya, sehingga sulit ditelusuri saat bermasalah.',
        },
      ),

      h2('Langkah nol, yaitu memeriksa apakah ini benar-benar dibutuhkan'),
      p(
        'Sebelum membangun apa pun, satu pertanyaan wajib dijawab lebih dulu karena jawabannya sering menghemat berminggu-minggu pekerjaan. Pertanyaannya, **apakah kedua data ini memang harus berada di sisi batas yang berbeda**.',
      ),
      ol(
        'Kalau dua data harus konsisten seketika dan selalu berubah bersamaan, mereka pantas berada di satu batas. Menyatukannya jauh lebih murah daripada membangun saga.',
        'Kalau salah satunya boleh menyusul beberapa detik kemudian, kamu tidak butuh saga. Cukup event ditambah pengerja yang aman diulang.',
        'Saga baru benar-benar dibutuhkan ketika ada beberapa langkah yang **bisa gagal di tengah** dan gagalnya menuntut pembatalan langkah sebelumnya.',
      ),
      callout(
        'tip',
        'Sebagian besar alur tidak butuh saga',
        'Mengirim email setelah pesanan dibayar tidak butuh saga, karena kegagalan mengirim email tidak menuntut pembatalan pembayaran. Cukup antrean dengan retry. Saga dibutuhkan pada alur seperti memesan tiket yang mengurangi kursi, memotong saldo, lalu menerbitkan tiket, tempat kegagalan di langkah ketiga menuntut pengembalian di langkah pertama dan kedua.',
      ),

      h2('Masalah penulisan ganda, dan outbox yang menutupnya'),
      p(
        'Bahkan sebelum saga, ada masalah yang lebih mendasar dan jauh lebih sering terjadi. Masalahnya muncul setiap kali sebuah operasi harus menyimpan data **dan** mengirim pesan.',
      ),
      compare(
        {
          title: 'Penulisan ganda, ada celah',
          lang: 'ts',
          code: `
            await db.pesanan.update({
              where: { id },
              data: { status: 'dibayar' },
            });

            // Kalau proses mati DI SINI, pesanan sudah dibayar
            // tetapi tidak ada satu pun pendengar yang tahu.
            // Email tidak terkirim, poin tidak bertambah, selamanya.
            await bus.pancarkan({ jenis: 'PesananDibayar', idPesanan: id });
          `,
          notes: [
            'Dua tulisan ke dua tempat berbeda, tanpa transaksi bersama',
            'Celahnya kecil tetapi pasti kena kalau jumlah transaksinya banyak',
            'Kegagalannya diam, tidak ada error di mana pun',
          ],
        },
        {
          title: 'Outbox, satu transaksi',
          lang: 'ts',
          code: `
            await db.$transaction(async (tx) => {
              await tx.pesanan.update({
                where: { id },
                data: { status: 'dibayar' },
              });

              // Masuk transaksi yang SAMA. Keduanya berhasil atau keduanya gagal.
              await tx.outbox.create({
                data: {
                  jenis: 'PesananDibayar',
                  muatan: { idPesanan: id },
                  status: 'menunggu',
                },
              });
            });
          `,
          notes: [
            'Tidak ada celah. Status dan niat mengirim tersimpan bersama',
            'Pengiriman sesungguhnya dikerjakan proses terpisah',
            'Kalau pengiriman gagal, barisnya masih ada dan bisa diulang',
          ],
        },
      ),
      code(
        'sql',
        `
        CREATE TABLE outbox (
          id            bigserial PRIMARY KEY,
          jenis         text NOT NULL,
          muatan        jsonb NOT NULL,
          status        text NOT NULL DEFAULT 'menunggu',
          percobaan     int NOT NULL DEFAULT 0,
          dibuat_pada   timestamptz NOT NULL DEFAULT now(),
          terkirim_pada timestamptz
        );

        -- Index parsial, hanya baris yang belum terkirim yang perlu dicari cepat.
        CREATE INDEX outbox_menunggu ON outbox (id) WHERE status = 'menunggu';
        `,
        {
          filename: 'migrations/020-outbox.sql',
          caption:
            'Index parsial menjaga pencarian tetap cepat meskipun tabelnya menyimpan jutaan baris terkirim.',
        },
      ),
      code(
        'ts',
        `
        // Proses terpisah yang membaca outbox lalu benar-benar mengirim.
        // FOR UPDATE SKIP LOCKED membuat beberapa salinan pengirim bisa berjalan
        // bersamaan tanpa mengambil baris yang sama.

        export async function kirimIsiOutbox() {
          await db.$transaction(async (tx) => {
            const antre = await tx.$queryRaw\`
              SELECT id, jenis, muatan FROM outbox
              WHERE status = 'menunggu'
              ORDER BY id
              LIMIT 50
              FOR UPDATE SKIP LOCKED\`;

            for (const baris of antre) {
              try {
                await bus.pancarkanSungguhan({ jenis: baris.jenis, ...baris.muatan });
                await tx.$executeRaw\`
                  UPDATE outbox
                  SET status = 'terkirim', terkirim_pada = now()
                  WHERE id = \${baris.id}\`;
              } catch {
                await tx.$executeRaw\`
                  UPDATE outbox SET percobaan = percobaan + 1 WHERE id = \${baris.id}\`;
              }
            }
          });
        }
        `,
        {
          filename: 'src/bersama/pengirim-outbox.ts',
          caption:
            'Pengirim ini boleh mengirim satu pesan dua kali. Itu sebabnya pendengarnya wajib aman diulang.',
        },
      ),
      callout(
        'info',
        'Outbox memberi jaminan minimal sekali, bukan tepat sekali',
        'Kalau pengirim mati setelah memancarkan tetapi sebelum menandai terkirim, pesan itu akan dikirim lagi. Itu bukan cacat yang bisa diperbaiki, melainkan sifat yang harus diterima. Karena itu setiap pendengar wajib idempoten, persis seperti pekerja antrean di sub-bab 3.1.',
      ),

      h2('Saga, dan langkah pembatal yang menyertainya'),
      p(
        'Saga dipakai ketika ada beberapa langkah berurutan yang masing-masing menulis ke tempat berbeda, dan kegagalan di tengah menuntut pembatalan yang sudah terlanjur berhasil.',
      ),
      code(
        'text',
        `
        Alur maju                          Langkah pembatalnya
        ------------------------------     -------------------------------------
        1. Kurangi stok                    Kembalikan stok
        2. Potong saldo                    Kembalikan saldo
        3. Terbitkan tiket                 Batalkan tiket
        4. Kirim email                     (tidak ada, dan memang tidak perlu)

        Kalau langkah 3 gagal:
          jalankan pembatal 2, lalu pembatal 1, lalu selesai dengan status "gagal".

        Kalau langkah 4 gagal:
          TIDAK ada pembatalan. Cukup diulang, karena email yang terlambat
          jauh lebih baik daripada tiket yang dibatalkan.
        `,
        {
          caption:
            'Menentukan langkah mana yang tidak butuh pembatal sama pentingnya dengan menulis pembatalnya.',
        },
      ),
      p(
        'Kolom kanan menunjukkan hal yang paling sering dilupakan. Menulis alur majunya mudah, dan hampir semua orang berhenti di situ. Yang membuat saga benar-benar bekerja adalah **langkah pembatal yang ditulis sungguhan dan diuji sungguhan**, termasuk diuji pada keadaan ketika pembatalnya sendiri gagal.',
      ),
      code(
        'ts',
        `
        type LangkahSaga = {
          nama: string;
          maju: () => Promise<void>;
          batal: () => Promise<void>;
        };

        export async function jalankanSaga(langkah: LangkahSaga[], idKorelasi: string) {
          const sudahBerhasil: LangkahSaga[] = [];

          try {
            for (const satu of langkah) {
              await satu.maju();
              sudahBerhasil.push(satu);
            }
          } catch (galat) {
            log.warn({ idKorelasi, galat }, 'saga gagal, mulai membatalkan');

            // Dibatalkan terbalik, dari yang terakhir berhasil.
            for (const satu of sudahBerhasil.reverse()) {
              try {
                await satu.batal();
              } catch (galatBatal) {
                // Pembatalan yang gagal TIDAK boleh hilang. Ia butuh campur tangan orang.
                log.error({ idKorelasi, langkah: satu.nama, galatBatal }, 'pembatalan gagal');
                await antrean.tambah('saga-perlu-diperiksa-manusia', {
                  idKorelasi,
                  langkah: satu.nama,
                });
              }
            }
            throw galat;
          }
        }
        `,
        {
          filename: 'src/bersama/saga.ts',
          caption:
            'Blok terdalam adalah bagian yang paling sering hilang, padahal justru di situ data bisa tertinggal salah.',
        },
      ),

      h2('Keadaan tengah yang terlihat orang lain'),
      p(
        'Ada satu perbedaan mendasar antara saga dan transaksi yang wajib dipahami sebelum memakainya. Transaksi menyembunyikan keadaan tengah, sedangkan saga tidak bisa.',
      ),
      table(
        ['', 'Transaksi database', 'Saga'],
        [
          [
            'Keadaan tengah',
            'Tidak pernah terlihat siapa pun di luar transaksi',
            'Terlihat. Stok sudah berkurang sementara tiket belum ada',
          ],
          [
            'Pembatalan',
            'Rollback, dan seolah tidak pernah terjadi',
            'Langkah baru yang meniadakan akibat, dan jejaknya tetap ada',
          ],
          [
            'Akibat bagi pengguna',
            'Tidak ada',
            'Pengguna bisa melihat stok berkurang lalu kembali beberapa detik kemudian',
          ],
          [
            'Yang harus dirancang',
            'Tidak ada, database yang mengurus',
            'Status antara yang jujur, misalnya `sedang-diproses`, supaya keadaan tengah bisa dijelaskan',
          ],
        ],
        'Baris terakhir adalah pekerjaan perancangan yang tidak bisa didelegasikan ke alat mana pun.',
      ),
      p(
        'Baris terakhir punya wujud yang sangat praktis. Pesanan dalam saga sebaiknya tidak melompat dari `baru` langsung ke `selesai`. Ia melewati `sedang-diproses`, dan status itu ditampilkan apa adanya kepada pengguna. Dengan begitu, keadaan tengah berhenti menjadi kebohongan dan berubah menjadi informasi.',
      ),

      h2('Memilih bentuk saga'),
      table(
        ['', 'Orchestration', 'Choreography'],
        [
          [
            'Alurnya dipegang',
            'Satu pihak yang memimpin',
            'Tersebar, tiap langkah bereaksi pada event',
          ],
          ['Membaca alur utuh', 'Mudah, ada di satu berkas', 'Sulit, harus mengumpulkan pendengar'],
          [
            'Menambah langkah',
            'Menyentuh pemimpinnya',
            'Menambah pendengar baru tanpa menyentuh yang lama',
          ],
          [
            'Ikatan antar bagian',
            'Pemimpin tahu semua langkah',
            'Tiap bagian hanya tahu event yang ia pedulikan',
          ],
          [
            'Menelusuri saat gagal',
            'Mudah, statusnya ada di satu tempat',
            'Sulit, butuh trace yang rapi',
          ],
          [
            'Cocok untuk',
            'Alur yang punya urutan wajib dan butuh pembatalan',
            'Reaksi yang berdiri sendiri dan tidak saling bergantung',
          ],
        ],
        'Untuk alur bertransaksi yang butuh pembatalan, orchestration hampir selalu pilihan yang lebih tepat.',
      ),
      callout(
        'warning',
        'Choreography untuk alur bertransaksi sulit diselamatkan',
        'Ketika sebuah alur enam langkah dirangkai lewat event tanpa pemimpin, tidak ada satu tempat pun yang tahu sebuah pesanan sedang berada di langkah keberapa. Saat ada yang tersangkut, menemukannya berarti menyusun ulang kronologi dari log beberapa layanan. Pilih choreography untuk reaksi yang berdiri sendiri, dan pilih orchestration begitu ada urutan yang wajib.',
      ),

      h2('Rangkuman'),
      ul(
        'Transaksi database hilang begitu data tidak lagi berada di satu tempat.',
        'Langkah nol adalah memeriksa apakah kedua data itu memang harus terpisah. Menyatukan lebih murah daripada membangun saga.',
        'Masalah penulisan ganda ditutup outbox, yaitu menyimpan niat mengirim di transaksi yang sama dengan perubahan datanya.',
        'Outbox memberi jaminan minimal sekali, sehingga pendengarnya wajib aman diulang.',
        'Saga adalah rangkaian langkah beserta pembatalnya. Menulis pembatal dan mengujinya adalah bagian yang paling sering dilewati.',
        'Saga membuat keadaan tengah terlihat, sehingga status antara harus dirancang jujur dan ditampilkan apa adanya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Konsistensi lintas bagian adalah pertanyaan tentang apa yang terjadi ketika satu perubahan harus tercermin di beberapa tempat, dan salah satunya gagal.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan replika streaming PostgreSQL 16.15:

        SAAT SISTEM DIAM:
          tulis lalu baca dari replika seketika
          5 dari 5 BERHASIL

        SAAT ADA BEBAN TULIS BESAR:
          8 dari 8 GAGAL, replika tertinggal sampai 11 MB
          jeda replay memuncak di 202 ms

        Sesudah beban selesai, keduanya sama: 1.300.000 baris.

        Itulah arti "akhirnya" — ia datang, dan waktunya tidak
        dijanjikan.
        `,
        {
          caption:
            'Bug ini lolos seluruh pengujian di lingkungan sepi, dan muncul persis saat sistem sedang ramai.',
        },
      ),
      p(
        'Untuk perubahan yang menyentuh beberapa bagian, ada satu kesalahan yang harus ditutup lebih dulu sebelum membicarakan pola apa pun.',
      ),
      code(
        'ts',
        `
        // TIDAK ATOMIK, meski terlihat begitu.
        await db.transaction(async (t) => {
          await t.saldo.kurangi(penggunaId, 100_000);
          await layananPembayaran.tagih(penggunaId, 100_000);   // JARINGAN
        });

        // Transaksi basis data TIDAK mencakup panggilan jaringan.
        // Bila panggilannya berhasil dan COMMIT-nya gagal, uangnya
        // sudah berpindah dan catatannya tidak ada.

        // BENAR: tulis NIATNYA di dalam transaksi, kerjakan di luar.
        await db.transaction(async (t) => {
          await t.saldo.kurangi(penggunaId, 100_000);
          await t.kotakKeluar.create({ data: { jenis: 'tagih', penggunaId, jumlah: 100_000 } });
        });
        // Proses terpisah membaca kotak keluar dan memanggil
        // layanan pembayaran, dengan kunci idempotensi.
        `,
      ),
      p('Kunci idempotensi itu bagian yang menutup pengulangan, dan bentuknya sudah diukur.'),
      code(
        'text',
        `
        Diuji sungguhan di bab Desain API:

          Satu kunci, dikirim BERSAMAAN lima kali:
            ke-1: 201 {"id":2,...}
            ke-2: 201 {"id":2,...,"diulang":true}
            ke-3: 201 {"id":2,...,"diulang":true}
            ke-4: 201 {"id":2,...,"diulang":true}
            ke-5: 201 {"id":2,...,"diulang":true}

          Jumlah pembayaran yang benar-benar lahir: 1

        Dan sebagai pembanding, tanpa kunci:
          POST dua kali dengan badan IDENTIK -> 201, 201 -> DUA data
        `,
      ),
      p(
        'Untuk urutan langkah yang panjang, bentuk yang lazim adalah saga, yaitu rangkaian langkah yang masing-masing punya pembatalnya.',
      ),
      code(
        'text',
        `
          langkah 1: kurangi stok        pembatal: kembalikan stok
          langkah 2: tagih pembayaran    pembatal: kembalikan dana
          langkah 3: jadwalkan kirim     pembatal: batalkan jadwal

        Bila langkah 3 gagal, jalankan pembatal 2 lalu pembatal 1.

        Yang perlu diterima sejak awal:
          - ada jendela ketika keadaannya SETENGAH JADI, dan itu
            harus terlihat di antarmuka
          - pembatalnya juga bisa gagal, dan itu butuh alarm
          - sebagian langkah TIDAK bisa dibatalkan: surel yang sudah
            terkirim, webhook yang sudah dikirim ke sistem lain

        Karena itu langkah yang tidak bisa dibatalkan ditaruh
        PALING AKHIR.
        `,
        {
          caption:
            'Aturan itu sederhana dan sering dilewatkan: kirim surel sesudah semuanya pasti, bukan di tengah.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Keadaan setengah jadi adalah bentuk kegagalan yang paling mahal, sebab ia tidak menghasilkan error dan tidak terlihat sampai ada yang membandingkan.',
      ),
      code(
        'text',
        `
        Bentuk yang khas:

          stok berkurang, pembayaran gagal
            -> barang hilang dari katalog tanpa ada yang membelinya

          pembayaran berhasil, pesanan tidak tercatat
            -> pelanggan tertagih tanpa pesanan

          berkas terunggah, metadata gagal ditulis
            -> berkas yatim, memakan ruang selamanya

          metadata tertulis, berkas gagal diunggah
            -> baris yang menunjuk berkas tidak ada, setiap
               pembacaannya 404

        Dua yang terakhir sudah diukur di bab Unggah Berkas, dan
        penutupnya berupa urutan: tulis ke lokasi sementara, catat
        metadata di transaksi, lalu PINDAHKAN berkasnya, plus satu
        tugas berkala yang membersihkan yang tidak pernah dipindah.
        `,
      ),
      p(
        'Kegagalan kedua berupa pendamaian yang tidak pernah dipasang, sehingga penyimpangan tumbuh tanpa ada yang tahu.',
      ),
      code(
        'text',
        `
        Diuji sungguhan pada PostgreSQL 16.15:

          penghitung  = 3
          sebenarnya  = 4
          -- 2 baris dihapus tanpa memperbarui penghitung --
          penghitung  = 3
          sebenarnya  = 2

        Satu jalur yang lupa sudah cukup, dan tidak ada error apa pun.

        Setiap keadaan yang disimpan di dua tempat menuntut satu
        query pembanding yang dijalankan berkala:

          SELECT a.id, a.jumlah_komentar, count(k.id) AS sebenarnya
          FROM artikel a LEFT JOIN komentar k ON k.artikel_id = a.id
          GROUP BY a.id, a.jumlah_komentar
          HAVING a.jumlah_komentar <> count(k.id);

        Query itu yang membedakan salinan yang dijaga dari salinan
        yang perlahan menjadi fiksi.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: memutuskan hal penting dari sumber yang
        konsisten akhir.

        Diuji, saat beban tulis besar: 8 dari 8 pembacaan dari
        replika sesudah penulisan GAGAL menemukan datanya.

        Yang HARUS dibaca dari sumber, bukan dari salinan:
          saldo dan pembayaran
          stok saat checkout
          hak akses dan peran

        Baris ketiga sering dilupakan, dan akibatnya berupa lubang
        keamanan: peran yang baru dicabut dan masih terbaca dari
        replika berarti akses yang seharusnya hilang masih berlaku.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEEMPAT: pembatal yang tidak idempoten.

          Langkah 3 gagal. Pembatal 2 dijalankan: kembalikan dana.
          Pembatal 2 gagal di tengah. Ia diulang.
          Dana dikembalikan DUA KALI.

        Pembatal juga dijalankan lewat antrean, dan pengiriman antrean
        dijamin PALING SEDIKIT sekali. Ia harus idempoten persis
        seperti langkah majunya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Konsistensi lintas bagian adalah tempat asumsi yang benar pada satu basis data berhenti berlaku, dan tidak ada yang memberi tahu kapan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil layanan luar di dalam transaksi',
            'Biar atomik',
            'Transaksi tidak mencakup panggilan jaringan. Uang berpindah tanpa catatannya tersimpan',
          ],
          [
            'Menyediakan tombol coba lagi tanpa kunci idempotensi',
            'Kan cuma mengulang',
            'Diuji, dua `POST` identik melahirkan dua data. Dengan satu kunci, lima permintaan -> satu hasil',
          ],
          [
            'Menaruh langkah yang tidak bisa dibatalkan di tengah',
            'Urutannya kan logis',
            'Surel yang sudah terkirim tidak bisa ditarik. Taruh paling akhir, setelah semuanya pasti',
          ],
          [
            'Tidak memasang pendamaian berkala',
            'Kodenya kan sudah benar',
            'Diuji, satu jalur yang lupa membuat penghitung menyimpang tanpa satu pun error',
          ],
          [
            'Membaca hak akses dari replika',
            'Itu kan cuma pembacaan',
            'Peran yang baru dicabut masih terbaca. Akses yang seharusnya hilang masih berlaku',
          ],
          [
            'Menulis pembatal yang tidak idempoten',
            'Pembatal kan dijalankan sekali',
            'Ia juga lewat antrean, dan pengiriman dijamin paling sedikit sekali. Dana bisa kembali dua kali',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang memaksa seluruh isi sub-bab ini terlihat, dan ia pantas diajukan pada setiap alur yang menyentuh lebih dari satu tempat. Bila proses ini mati tepat di tengah, keadaan apa yang tertinggal, dan siapa yang akan menyadarinya? Bila jawabannya adalah bahwa tidak ada yang akan menyadarinya, pendamaian berkala bukan kemewahan melainkan satu-satunya cara kerusakan itu ditemukan sebelum pelanggan yang menemukannya.',
      ),
      references(
        {
          label: 'Saga design pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/saga',
          source: 'Microsoft',
          note: 'Bentuk orchestration dan choreography beserta kapan masing-masing dipilih.',
        },
        {
          label: 'Compensating Transaction pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction',
          source: 'Microsoft',
          note: 'Kenapa pembatalan bukan rollback, dan apa yang harus dirancang karenanya.',
        },
        {
          label: 'Transactional Outbox pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-outbox-cosmos',
          source: 'Microsoft',
          note: 'Pola outbox dijelaskan lengkap dengan proses pengirim terpisahnya.',
        },
      ),
    ],
  ),

  written(
    'cqrs',
    'CQRS dan Pemisahan Baca-Tulis',
    19,
    'Memisahkan jalan menulis dari jalan membaca, dan kapan pemisahan itu berlebihan.',
    [
      p(
        'Pikirkan bagaimana sebuah toko menyimpan catatannya. Ada buku besar tempat setiap transaksi dicatat satu per satu dengan rapi dan lengkap, karena buku itulah yang dipakai kalau ada sengketa. Ada juga papan ringkasan di dinding yang menunjukkan penjualan hari ini, dan papan itu tidak mencatat apa-apa, ia hanya menampilkan angka yang sudah dihitung.',
      ),
      p(
        'Tidak ada pemilik toko yang waras yang memaksa pelanggan membaca buku besar untuk tahu jam buka toko. Dan tidak ada juga yang mencatat transaksi di papan dinding. Keduanya punya bentuk berbeda karena tujuannya berbeda.',
      ),
      p(
        'Ketegangan yang sama muncul di hampir semua aplikasi yang tumbuh. Bentuk data yang enak untuk **menulis** dan bentuk data yang enak untuk **membaca** ternyata berbeda, dan makin lama makin berbeda.',
      ),
      p(
        'Menulis butuh bentuk yang terpecah rapi supaya aturannya mudah dijaga dan tidak ada data yang bertentangan, mirip buku besar. Membaca butuh bentuk yang sudah digabungkan dan diratakan supaya satu halaman cukup satu query, mirip papan ringkasan. **CQRS** adalah nama untuk keputusan berhenti memaksakan satu bentuk melayani keduanya.',
      ),

      terms(
        {
          term: 'CQRS',
          meaning:
            'Singkatan dari Command Query Responsibility Segregation, dibaca "si-kyu-ar-es". Diterjemahkan kata per kata, pemisahan tanggung jawab antara perintah dan pertanyaan. Artinya memisahkan bagian yang **mengubah** data dari bagian yang **membaca** data. Yang sering menakutkan pemula adalah namanya, padahal isinya bertingkat, dan tingkat pertamanya cuma berarti jangan menulis satu fungsi yang sekaligus mengubah dan mengembalikan data.',
        },
        {
          term: 'command (perintah)',
          meaning:
            'Operasi yang **mengubah** keadaan dan tidak mengembalikan data, misalnya `batalkanPesanan`. Dibaca "komand". Ia boleh mengembalikan penanda berhasil atau gagal, tetapi bukan data untuk ditampilkan.',
        },
        {
          term: 'query (kueri)',
          meaning:
            'Operasi yang **membaca** keadaan dan tidak mengubah apa pun, misalnya `ambilRingkasanPesanan`. Dibaca "kueri". Query yang diam-diam mengubah sesuatu adalah sumber bug yang sangat sulit ditemukan, karena tidak ada yang menduga membaca bisa mengubah. Contoh nyatanya, fungsi `ambilPesanan()` yang diam-diam menandai pesanan sebagai sudah dilihat. Suatu hari halaman admin memanggilnya untuk keperluan lain, dan tiba-tiba ratusan pesanan berubah status tanpa ada yang tahu penyebabnya.',
        },
        {
          term: 'write model dan read model',
          meaning:
            'Dua bentuk data yang berbeda untuk kebutuhan yang berbeda. Write model ternormalisasi dan menjaga aturan. Read model sudah digabungkan dan diratakan sesuai tampilan yang dibutuhkan. Read model selalu turunan, sehingga ia bisa dibangun ulang kapan saja dari write model.',
        },
        {
          term: 'projection (proyeksi)',
          meaning:
            'Proses membangun read model dari write model atau dari deretan event. Dibaca "projeksyen". Namanya diambil dari proyektor, yaitu satu sumber yang diproyeksikan menjadi tampilan di tempat lain. Sifat terpentingnya, proyeksi selalu bisa **diulang dari nol**. Kalau read model-mu ternyata salah, kamu tidak memperbaikinya baris per baris, melainkan menghapus semuanya lalu memproyeksikan ulang dari sumbernya.',
        },
        {
          term: 'materialized view',
          meaning:
            'Tabel hasil query yang disimpan sungguhan, bukan dihitung ulang tiap kali dibaca. Dibaca "materialaisd viu", artinya tampilan yang diwujudkan. Bedanya dengan `VIEW` biasa perlu diperhatikan. `VIEW` biasa hanyalah query yang diberi nama, sehingga tiap kali dibaca ia menjalankan query aslinya lagi. `MATERIALIZED VIEW` benar-benar menyimpan hasilnya sebagai tabel, sehingga membacanya secepat membaca tabel biasa, dengan harga isinya baru diperbarui saat kamu menyuruhnya menyegarkan diri.',
        },
      ),

      h2('Empat tingkat, dari yang hampir gratis'),
      p(
        'CQRS sering dibayangkan sebagai satu bentuk besar dengan dua database dan event bus di antaranya. Kenyataannya ia punya tingkatan, dan tiga tingkat pertama sangat murah.',
      ),
      table(
        ['Tingkat', 'Wujudnya', 'Biaya', 'Kapan naik ke sini'],
        [
          [
            '1. Pisahkan fungsinya',
            'Fungsi yang mengubah dan fungsi yang membaca dipisah, meski satu tabel',
            'Nyaris nol',
            'Selalu. Ini kebersihan dasar, bukan pola',
          ],
          [
            '2. Pisahkan bentuk datanya',
            'Bentuk untuk menulis dan bentuk untuk respons dibedakan',
            'Satu fungsi penerjemah',
            'Begitu respons mulai berbeda jauh dari bentuk tabel',
          ],
          [
            '3. Pisahkan tabel bacanya',
            'Tabel ringkasan atau materialized view yang diperbarui berkala',
            'Satu tabel dan satu proses penyegar',
            'Begitu query tampilan mulai berat karena banyak join',
          ],
          [
            '4. Pisahkan penyimpanannya',
            'Penyimpanan baca terpisah, diperbarui lewat event',
            'Tinggi. Ada kebasian, ada rekonsiliasi, ada dua tempat dirawat',
            'Ketika beban baca jauh melampaui tulis dan tingkat tiga sudah tidak cukup',
          ],
        ],
        'Sebagian besar aplikasi berhenti di tingkat dua atau tiga, dan itu sudah menyelesaikan keluhannya.',
      ),
      callout(
        'tip',
        'Tingkat satu bukan CQRS, dan itu tidak apa-apa',
        'Memisahkan fungsi yang mengubah dari fungsi yang membaca terlalu sederhana untuk pantas disebut pola. Ia disebut di sini karena banyak keluhan yang dikira butuh CQRS ternyata selesai hanya dengan disiplin ini, ditambah nama fungsi yang jujur tentang apakah ia mengubah sesuatu atau tidak.',
      ),

      h2('Tingkat dua, memisahkan bentuk'),
      p(
        'Ini tingkat yang paling sering memberi manfaat terbesar dengan biaya terkecil, dan ia juga menutup satu celah keamanan yang sudah kamu kenal.',
      ),
      code(
        'ts',
        `
        // Bentuk untuk MENULIS. Hanya field yang memang boleh dikirim klien.
        // Inilah yang mencegah mass assignment, sesuai aturan validasi input.
        export const PerintahBuatPesanan = z.object({
          idProduk: z.string().uuid(),
          jumlah: z.number().int().positive().max(100),
          catatan: z.string().max(500).optional(),
        });

        // Bentuk untuk MEMBACA. Disusun mengikuti kebutuhan tampilan,
        // bukan mengikuti bentuk tabel.
        export type RingkasanPesanan = {
          id: string;
          namaProduk: string;
          gambarProduk: string | null;
          jumlah: number;
          totalRupiah: number;
          statusTerbaca: 'Menunggu pembayaran' | 'Diproses' | 'Dikirim' | 'Selesai';
          bisaDibatalkan: boolean;
        };
        `,
        {
          caption:
            'Field `bisaDibatalkan` dihitung di server, sehingga aturannya tidak perlu ditulis ulang di klien.',
        },
      ),
      p(
        'Field terakhir layak diperhatikan. Aturan boleh tidaknya membatalkan hidup di satu tempat, yaitu server, lalu hasilnya dikirim sebagai jawaban siap pakai. Klien tinggal menampilkan atau menyembunyikan tombol. Kalau aturannya berubah, tidak ada satu pun klien yang perlu ikut dirilis, dan tidak ada risiko klien dan server berbeda pendapat.',
      ),

      h2('Tingkat tiga, tabel baca yang disegarkan'),
      p(
        'Ketika sebuah halaman butuh menggabungkan lima tabel dan dibuka ribuan kali sehari, menyimpan hasil gabungannya sering jauh lebih murah daripada mengulang gabungan itu terus-menerus.',
      ),
      code(
        'sql',
        `
        -- Bentuk paling murah, tanpa mengubah satu baris pun kode aplikasi.
        CREATE MATERIALIZED VIEW ringkasan_penjualan_harian AS
        SELECT
          date_trunc('day', p.dibayar_pada)     AS hari,
          pr.kategori                            AS kategori,
          count(*)                               AS jumlah_pesanan,
          sum(p.total_rupiah)                    AS total_rupiah
        FROM pesanan p
        JOIN pesanan_barang pb ON pb.id_pesanan = p.id
        JOIN produk pr ON pr.id = pb.id_produk
        WHERE p.status = 'dibayar'
        GROUP BY 1, 2;

        -- Index unik dibutuhkan supaya penyegaran bisa berjalan CONCURRENTLY,
        -- yaitu tanpa mengunci pembacaan selama penyegaran berlangsung.
        CREATE UNIQUE INDEX ON ringkasan_penjualan_harian (hari, kategori);

        -- Dijalankan terjadwal, misalnya tiap sepuluh menit.
        REFRESH MATERIALIZED VIEW CONCURRENTLY ringkasan_penjualan_harian;
        `,
        {
          filename: 'migrations/025-ringkasan-penjualan.sql',
          caption:
            'Tanpa index unik, penyegaran mengunci tabelnya dan halaman laporan ikut berhenti selama proses berjalan.',
        },
      ),
      p(
        'Bentuk ini punya sifat yang enak, yaitu ia **turunan murni**. Kalau isinya ternyata salah karena ada bug, jawabannya adalah menyegarkannya ulang, bukan memperbaiki datanya satu per satu. Sifat itu berlaku untuk semua read model, dan sifat itulah yang membuatnya jauh lebih aman daripada denormalisasi yang dijaga manual.',
      ),

      h2('Tingkat empat, dan harga yang menyertainya'),
      p(
        'Tingkat terakhir memisahkan penyimpanan bacanya sungguhan, biasanya karena beban baca jauh melampaui apa yang sanggup dilayani penyimpanan tulisnya, atau karena bentuk bacanya butuh mesin yang berbeda misalnya mesin pencarian teks.',
      ),
      table(
        ['Yang didapat', 'Yang dibayar'],
        [
          [
            'Baca dan tulis diskalakan sendiri-sendiri',
            'Ada dua penyimpanan yang harus dirawat, dicadangkan, dan dipantau',
          ],
          [
            'Bentuk baca bebas, tidak terikat bentuk tulis',
            'Data baca selalu tertinggal beberapa saat dari data tulis',
          ],
          [
            'Bisa memakai mesin yang cocok untuk tiap kebutuhan',
            'Butuh rekonsiliasi berkala karena proyeksi bisa tertinggal atau gagal',
          ],
          [
            'Query berat tidak lagi membebani jalur tulis',
            'Alur data menjadi lebih panjang dan lebih sulit ditelusuri',
          ],
        ],
        'Kolom kanan adalah biaya harian, sedangkan kolom kiri baru terasa kalau bebannya memang sebesar itu.',
      ),
      callout(
        'warning',
        'Kebasian di tingkat empat akan terlihat pengguna',
        'Pengguna yang baru saja mengubah namanya lalu menyegarkan halaman dan masih melihat nama lama akan menyimpulkan aplikasinya rusak. Penanganan yang biasa dipakai adalah menampilkan hasil dari jalur tulis untuk beberapa detik sesudah pengguna itu sendiri menulis, persis seperti penanganan replication lag di sub-bab [replikasi](/kelas/system-design/skala-data/replikasi).',
      ),

      h2('Kapan CQRS justru merugikan'),
      p(
        'Karena CQRS terdengar seperti praktik terbaik, ia sering dipasang di tempat yang tidak membutuhkannya. Tiga keadaan berikut adalah tanda bahwa tingkat tiga dan empat sebaiknya dihindari.',
      ),
      ol(
        'Beban bacanya tidak besar dan query-nya tidak berat. Kamu menambah satu tempat yang bisa salah tanpa membeli apa pun.',
        'Datanya wajib terkini setiap saat, misalnya saldo dan stok saat transaksi. Read model yang basi justru berbahaya di sini.',
        'Bentuk baca dan bentuk tulisnya nyaris sama. Kalau read model-mu hanyalah salinan tabel yang sama, ia murni biaya.',
      ),
      p(
        'Ada satu aturan praktis yang cukup jujur. Kalau kamu belum bisa menyebutkan **angka** yang menunjukkan query bacamu bermasalah, kamu belum butuh tingkat tiga. Sub-bab [estimasi kasar](/kelas/system-design/fondasi-sistem/estimasi-kasar) menyediakan cara mendapatkan angka itu.',
      ),

      h2('Rangkuman'),
      ul(
        'CQRS berangkat dari kenyataan bahwa bentuk yang enak untuk menulis berbeda dari bentuk yang enak untuk membaca.',
        'Ia punya empat tingkat, dan tiga tingkat pertama sangat murah.',
        'Tingkat dua yaitu memisahkan bentuk data memberi manfaat terbesar dengan biaya terkecil, sekaligus menutup celah mass assignment.',
        'Read model selalu turunan, sehingga kalau ia salah jawabannya adalah membangun ulang, bukan memperbaiki satu per satu.',
        'Tingkat empat membawa kebasian yang akan terlihat pengguna, dan butuh penanganan khusus untuk penulis itu sendiri.',
        'Kalau belum bisa menyebutkan angka yang menunjukkan query bacamu bermasalah, kamu belum butuh tingkat tiga.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'CQRS memisahkan jalur baca dari jalur tulis. Yang membuatnya berbayar bukan pemisahannya melainkan bahwa keduanya memang punya kebutuhan yang berbeda, dan selisih itu bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada PostgreSQL 16.15, 200.000 artikel
        dan 1.000.000 komentar:

          JALUR BACA, sepuluh artikel paling banyak dikomentari
            dihitung dari tabel komentar    468,922 ms
            dibaca dari kolom yang disiapkan  0,068 ms

          JALUR TULIS, biaya menyiapkan kolom itu
            INSERT saja                    0,0090 ms/operasi
            INSERT + UPDATE penghitung     0,2825 ms/operasi

        Baca ~6.900 kali lebih cepat, tulis ~31 kali lebih lambat.

        Itulah CQRS dalam bentuk paling sederhana: model baca yang
        disiapkan terpisah dari model tulis.
        `,
        {
          caption:
            'Sebagian besar penerapan CQRS yang berguna tidak memerlukan satu pun komponen tambahan.',
        },
      ),
      p(
        'Perlu dibedakan tiga tingkat yang sering disebut dengan nama yang sama, sebab biayanya sangat berbeda.',
      ),
      table(
        ['Tingkat', 'Yang dipisahkan', 'Biayanya'],
        [
          [
            'Pemisahan model',
            'Bentuk data untuk baca dan untuk tulis, di basis data yang sama',
            'Hampir nol. Hanya dua tipe dan dua query',
          ],
          [
            'Pemisahan penyimpanan',
            'Tabel atau indeks khusus baca, diperbarui dari jalur tulis',
            'Konsistensi akhir, dan pendamaian',
          ],
          [
            'Pemisahan sistem',
            'Basis data terpisah, diperbarui lewat event',
            'Seluruh biaya sistem terdistribusi',
          ],
        ],
      ),
      p(
        'Tingkat pertama hampir selalu benar dan hampir tidak pernah disebut CQRS, padahal ia yang paling sering menyelesaikan masalahnya.',
      ),
      code(
        'ts',
        `
        // Model TULIS: lengkap, punya aturan, dan dijaga invariannya.
        interface Pesanan {
          id: PesananId;
          pelangganId: PelangganId;
          baris: BarisPesanan[];
          status: StatusPesanan;
          // ... dua puluh field lain
        }

        // Model BACA untuk halaman daftar: hanya yang ditampilkan.
        interface RingkasanPesanan {
          id: string;
          nomor: string;
          namaPelanggan: string;
          total: number;
          status: string;
        }

        // Query-nya menghasilkan bentuk kedua secara langsung,
        // bukan memuat bentuk pertama lalu membuangnya.
        // Diukur di bab Skala Data, JOIN berindeks untuk 20 baris
        // selesai dalam 0,736 ms.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Biaya CQRS muncul pada tingkat kedua dan ketiga, dan yang pertama adalah bahwa model bacanya bisa tertinggal.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan replika streaming PostgreSQL 16.15,
        sebagai bentuk paling sederhana dari model baca terpisah:

          saat sistem DIAM  : 5 dari 5 pembacaan sesudah penulisan BERHASIL
          saat beban BESAR  : 8 dari 8 GAGAL, tertinggal 11 MB

        Yang dilihat pengguna:
          "Sudah saya simpan, tapi belum muncul di daftar"

        Dan bila permintaan berikutnya mendarat di replika yang
        berbeda jedanya:
          "Tadi ada, sekarang hilang, lalu ada lagi"

        Yang menutupnya: tempelkan pembaca ke sumber selama beberapa
        detik sesudah ia menulis.
        `,
      ),
      p(
        'Kegagalan kedua adalah model baca yang menyimpang tanpa ada yang tahu, dan itu bisa dibuktikan.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          penghitung  = 3
          sebenarnya  = 4
          -- 2 baris dihapus tanpa memperbarui penghitung --
          penghitung  = 3
          sebenarnya  = 2

        Jalur yang bisa mengubah data tanpa lewat jalur tulismu:
          ON DELETE CASCADE
          skrip migrasi dan backfill
          perbaikan data lewat konsol
          jalur kode lain yang lupa
          pemulihan cadangan sebagian

        Karena itu setiap model baca yang disimpan terpisah menuntut:
          1. diperbarui di tempat yang sama dengan perubahannya,
             atau lewat trigger
          2. query PEMBANDING yang dijalankan berkala dan melaporkan
             selisihnya
        `,
        {
          caption:
            'Langkah kedua yang membedakan model baca yang dijaga dari model baca yang perlahan menjadi fiksi.',
        },
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: membangun kembali model baca ternyata
        tidak mungkin.

        Bila model baca dibangun dari EVENT, ia bisa dibangun ulang
        dari nol dengan memutar ulang seluruh event.

        Bila ia dibangun dari perubahan bertahap tanpa catatan
        sumbernya, ia TIDAK bisa dibangun ulang — dan begitu ia
        menyimpang, satu-satunya jalan adalah memperbaikinya
        sepotong demi sepotong.

        Pertanyaan yang menentukan, dan pantas dijawab sebelum
        memilih bentuknya:
          "Bila model baca ini hilang seluruhnya, berapa lama
           membangunnya kembali, dan dari apa?"
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEEMPAT: memakai CQRS untuk sesuatu yang tidak
        memerlukannya.

        Diukur di bab Skala Data pada tabel yang sama:

          halaman daftar 20 artikel + nama penulis + jumlah komentar
            JOIN + subquery COUNT      0,963 ms
            JOIN + LEFT JOIN LATERAL   0,736 ms

        Di bawah satu milidetik, dengan indeks yang benar, tanpa
        pemisahan model baca sama sekali.

        Yang mahal bukan JOIN-nya melainkan AGREGASI atas seluruh
        tabel — dan itu yang 468,922 ms.

        Memisahkan model baca untuk query yang sudah 0,736 ms
        berarti membayar konsistensi akhir tanpa membeli apa pun.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'CQRS punya nama yang terdengar besar, dan itu membuat bentuk terberatnya sering dipilih untuk masalah yang bisa diselesaikan bentuk teringannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai basis data terpisah sejak awal',
            'Katanya itu CQRS yang sesungguhnya',
            'Seluruh biaya sistem terdistribusi dibayar. Pemisahan MODEL sering sudah cukup',
          ],
          [
            'Memisahkan model baca untuk query yang sudah cepat',
            'Biar konsisten polanya',
            'Diukur, JOIN berindeks untuk 20 baris 0,736 ms. Konsistensi akhir dibayar tanpa membeli apa pun',
          ],
          [
            'Tidak memasang query pembanding',
            'Jalur tulisnya kan sudah benar',
            'Diuji, satu jalur yang lupa membuat model baca menyimpang tanpa satu pun error',
          ],
          [
            'Membangun model baca yang tidak bisa dibangun ulang',
            'Ia kan selalu diperbarui',
            'Begitu menyimpang, satu-satunya jalan adalah memperbaikinya sepotong demi sepotong',
          ],
          [
            'Tidak menunjukkan jeda di antarmuka',
            'Jedanya kan sebentar',
            'Diuji, saat beban besar 8 dari 8 pembacaan gagal. Pengguna melihat data yang baru ia tulis hilang',
          ],
          [
            'Menganggap CQRS menuntut event sourcing',
            'Keduanya kan sering disebut bersama',
            'Keduanya terpisah. Kolom denormalisasi yang diperbarui trigger sudah merupakan CQRS',
          ],
        ],
      ),
      p(
        'Bentuk CQRS yang paling sering benar juga yang paling jarang disebut dengan namanya, yaitu memakai bentuk data yang berbeda untuk membaca dan untuk menulis di dalam satu basis data yang sama. Ia tidak menambah satu pun komponen, tidak menimbulkan konsistensi akhir, dan menyelesaikan sebagian besar alasan orang tertarik pada CQRS sejak awal.',
      ),
      references(
        {
          label: 'CQRS pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs',
          source: 'Microsoft',
          note: 'Bentuk lengkapnya beserta peringatan bahwa ia sering dipakai di tempat yang tidak membutuhkannya.',
        },
        {
          label: 'Materialized View pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view',
          source: 'Microsoft',
          note: 'Bentuk read model paling murah beserta cara menjaganya tetap benar.',
        },
        {
          label: 'CREATE MATERIALIZED VIEW',
          href: 'https://www.postgresql.org/docs/current/sql-creatematerializedview.html',
          source: 'PostgreSQL',
          note: 'Sintaks resmi beserta syarat penyegaran CONCURRENTLY yang dipakai di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'gerbang-dan-bff',
    'Gerbang API dan Backend for Frontend',
    20,
    'Satu pintu depan untuk banyak bagian, dan kapan pintu itu perlu dibuat lebih dari satu.',
    [
      p(
        'Bayangkan sebuah kantor besar berisi dua puluh bagian. Ada dua cara mengatur tamu yang datang.',
      ),
      p(
        'Cara pertama, tamu dibiarkan masuk lewat pintu mana saja dan mencari sendiri bagian yang ia tuju. Untuk kantor berisi dua bagian ini masih masuk akal. Untuk dua puluh bagian, tamu harus hafal denah, tiap bagian harus memeriksa identitas sendiri-sendiri, dan kalau ada bagian yang pindah ruangan semua tamu harus diberi tahu.',
      ),
      p(
        'Cara kedua, ada satu **resepsionis** di depan. Tamu selalu datang ke sana, identitasnya diperiksa sekali, lalu ia diantar ke bagian yang tepat. Kalau ada bagian yang pindah ruangan, hanya resepsionis yang perlu tahu.',
      ),
      p(
        'Resepsionis itulah yang disebut **gerbang API**. Begitu sebuah sistem punya beberapa bagian yang bisa dipanggil dari luar, muncul pertanyaan sederhana yang berakibat panjang, yaitu klien memanggil ke mana.',
      ),
      p(
        'Membiarkan klien memanggil langsung ke masing-masing bagian terdengar paling sederhana, dan untuk dua atau tiga bagian ia memang cukup. Begitu jumlahnya bertambah, muncul serangkaian masalah yang semuanya berakar pada satu hal, yaitu klien jadi tahu terlalu banyak tentang susunan dalam sistemmu.',
      ),

      terms(
        {
          term: 'API gateway (gerbang API)',
          meaning:
            'Satu pintu masuk di depan beberapa layanan, yang meneruskan permintaan ke tujuan yang benar. Dibaca "ei-pi-ai geitwei". Ini resepsionis tadi. Selain meneruskan, ia biasanya juga mengurus hal yang berlaku sama untuk semua tamu, yaitu memeriksa identitas, membatasi berapa banyak permintaan boleh masuk, dan mencatat siapa datang kapan. Perhatikan kesamaan seluruh tugas itu, yaitu **tidak satu pun butuh tahu urusan bisnisnya**, persis seperti resepsionis yang tidak perlu tahu isi rapat yang akan dihadiri tamunya.',
        },
        {
          term: 'reverse proxy',
          meaning:
            'Perangkat lunak yang menerima permintaan lalu meneruskannya ke server di belakangnya. Dibaca "rivers proksi". Sub-bab [reverse proxy](/kelas/deployment/fondasi-deployment/reverse-proxy) sudah membahasnya lewat Nginx. Bedanya dengan gerbang API begini. Reverse proxy meneruskan berdasarkan **alamat saja**, misalnya semua yang diawali `/api` dikirim ke port 3001. Gerbang API ikut membaca **isi permintaannya**, misalnya membaca token untuk tahu siapa penggunanya lalu memutuskan apakah ia boleh lewat.',
        },
        {
          term: 'backend for frontend (BFF)',
          meaning:
            'Lapisan backend yang dibuat khusus untuk satu jenis klien, misalnya satu untuk web dan satu untuk aplikasi mobile. Disingkat BFF, dibaca "bi-ef-ef", artinya backend untuk frontend. Kalau gerbang API adalah resepsionis yang melayani semua tamu dengan cara sama, BFF adalah **asisten pribadi** yang tahu persis kebiasaan satu orang tertentu. Bedanya dengan gerbang, BFF boleh menyusun respons dengan bentuk berbeda-beda sesuai kebutuhan kliennya sendiri.',
        },
        {
          term: 'gateway aggregation',
          meaning:
            'Pola ketika gerbang menggabungkan beberapa panggilan ke belakang menjadi satu jawaban untuk klien. Dibaca "geitwei agregeisyen", artinya penggabungan di gerbang. Contohnya, halaman detail pesanan butuh data dari tiga layanan. Tanpa penggabungan, aplikasi mobile mengirim tiga permintaan berurutan. Dengan penggabungan, ia mengirim satu, dan gerbang yang menghubungi ketiganya. Berguna sekali untuk klien mobile karena tiap perjalanan bolak-balik di jaringan seluler bisa memakan ratusan milidetik, dan berbahaya kalau berlebihan karena gerbang perlahan jadi memegang logika bisnis.',
        },
        {
          term: 'chatty client',
          meaning:
            'Klien yang harus melakukan banyak sekali permintaan untuk menyusun satu tampilan. Dibaca "ceti klaien", artinya klien yang cerewet karena ia bicara terlalu sering. Contohnya halaman yang mengambil daftar pesanan, lalu untuk tiap pesanan mengambil detail produknya satu per satu, sehingga satu halaman menghasilkan dua puluh satu permintaan. Masalahnya paling terasa di jaringan seluler, tempat setiap perjalanan bolak-balik menambah ratusan milidetik, sehingga dua puluh satu permintaan berarti halaman terasa berat meskipun servernya cepat.',
        },
        {
          term: 'service mesh',
          meaning:
            'Lapisan yang mengurus komunikasi antar layanan di dalam sistem, termasuk enkripsi, percobaan ulang, dan penelusuran, tanpa kode aplikasi ikut mengurusnya. Dibaca "servis mesy", artinya jaring layanan. Kalau gerbang API mengurus lalu lintas dari **luar ke dalam**, service mesh mengurus lalu lintas **antar layanan di dalam**. Disebut di sini semata supaya kamu mengenali namanya kalau bertemu. Untuk sistem berisi dua sampai lima layanan ia jelas berlebihan, karena biaya menjalankannya lebih besar daripada masalah yang ia selesaikan.',
        },
      ),

      h2('Masalah tanpa pintu depan'),
      p(
        'Membiarkan klien memanggil langsung ke setiap bagian menimbulkan lima masalah, dan kelimanya muncul bersamaan begitu jumlah bagian bertambah.',
      ),
      table(
        ['Masalah', 'Wujudnya di klien'],
        [
          [
            'Klien tahu susunan dalam sistemmu',
            'Alamat tiap layanan tertulis di kode klien, sehingga memindahkan sesuatu berarti merilis ulang klien',
          ],
          [
            'Autentikasi diperiksa di banyak tempat',
            'Tiap layanan mengurusnya sendiri, dan satu yang lupa cukup untuk membuka celah',
          ],
          [
            'CORS harus diatur di tiap layanan',
            'Setiap layanan punya daftar origin sendiri yang bisa berbeda dan bisa terlupa',
          ],
          [
            'Terlalu banyak perjalanan jaringan',
            'Satu halaman butuh enam permintaan berurutan, dan di jaringan seluler itu terasa lambat',
          ],
          [
            'Pembatasan laju tidak menyeluruh',
            'Tiap layanan membatasi sendiri, sehingga tidak ada yang tahu total permintaan satu pengguna',
          ],
        ],
        'Kelimanya diselesaikan satu pintu depan, dan itulah alasan gerbang API ada.',
      ),

      h2('Apa yang pantas dikerjakan gerbang'),
      p(
        'Gerbang bisa mengerjakan banyak hal, dan justru itu bahayanya. Ada garis yang perlu dijaga supaya ia tidak perlahan berubah menjadi tempat logika bisnis menumpuk.',
      ),
      compare(
        {
          title: 'Pantas dikerjakan gerbang',
          lang: 'text',
          code: `
            - Memeriksa token dan menolak yang tidak sah
            - Meneruskan identitas pengguna ke belakang
            - Membatasi laju per pengguna dan per alamat IP
            - Mengakhiri TLS dan menyeragamkan header keamanan
            - Menyusun id korelasi untuk penelusuran
            - Menerapkan kebijakan CORS di satu tempat
            - Meneruskan ke tujuan berdasarkan pola alamat
            - Mencatat akses dan mengukur waktu tanggap
          `,
          notes: [
            'Semuanya berlaku sama untuk semua permintaan',
            'Tidak satu pun butuh tahu arti bisnis permintaannya',
          ],
        },
        {
          title: 'TIDAK pantas dikerjakan gerbang',
          lang: 'text',
          code: `
            - Memeriksa apakah pengguna berhak atas satu pesanan tertentu
            - Menghitung harga, diskon, atau pajak
            - Memutuskan boleh tidaknya sebuah pesanan dibatalkan
            - Mengubah bentuk data karena satu klien memintanya
            - Menyimpan sesuatu ke database
          `,
          notes: [
            'Semuanya butuh tahu arti bisnisnya',
            'Menaruhnya di gerbang membuat gerbang berubah jadi titik pusat yang mengikat semuanya',
          ],
        },
      ),
      callout(
        'warning',
        'Otorisasi kasar boleh, otorisasi halus tidak',
        'Gerbang boleh menolak permintaan tanpa token yang sah, dan boleh menolak pengguna biasa yang menyentuh alamat khusus admin. Yang tidak boleh dipindahkan ke gerbang adalah pemeriksaan apakah pengguna ini berhak atas **data yang ini**, karena itu butuh membaca datanya. Aturan [otorisasi di lapisan data](/kelas/backend-basic/auth-dasar/idor) tetap mengikat, dan gerbang tidak pernah menggantikannya.',
      ),

      h2('Backend for frontend'),
      p(
        'Satu gerbang untuk semua klien mulai terasa sempit ketika kebutuhan tiap klien benar-benar berbeda. Aplikasi mobile butuh respons kecil dan sedikit perjalanan. Halaman web butuh data lebih lengkap. Dasbor internal butuh bentuk yang lain lagi.',
      ),
      code(
        'text',
        `
        Satu gerbang untuk semua              Backend for frontend

        web  ─┐                              web    ──> bff-web    ─┐
        mobile┼──> gerbang ──> layanan        mobile ──> bff-mobile ─┼──> layanan
        admin ─┘                              admin  ──> bff-admin  ─┘

        Respons harus melayani ketiganya      Tiap BFF menyusun respons
        sekaligus, sehingga menjadi           persis sesuai kebutuhan
        kompromi yang tidak pas               kliennya sendiri
        untuk siapa pun
        `,
        {
          caption:
            'BFF dimiliki oleh tim yang membangun kliennya, sehingga perubahan tampilan tidak perlu menunggu tim layanan.',
        },
      ),
      p(
        'Kalimat di caption itu adalah alasan sesungguhnya BFF ada. Bukan soal bentuk respons, melainkan soal **siapa yang boleh mengubahnya**. Ketika tim mobile butuh satu field tambahan di layar beranda, ia mengubah BFF-nya sendiri dan merilis. Tanpa BFF, permintaan itu masuk antrean tim layanan dan menunggu jadwal mereka.',
      ),
      table(
        ['Pakai gerbang tunggal ketika', 'Pakai BFF ketika'],
        [
          [
            'Kliennya satu atau kebutuhannya mirip',
            'Beberapa klien dengan kebutuhan data yang jelas berbeda',
          ],
          [
            'Bentuk respons yang sama cocok untuk semua',
            'Satu bentuk respons selalu menjadi kompromi yang tidak pas',
          ],
          [
            'Tim klien dan tim layanan sama atau sangat dekat',
            'Tim klien perlu bisa mengubah bentuk respons tanpa menunggu tim layanan',
          ],
          [
            'Perjalanan jaringan tidak menjadi masalah',
            'Klien seluler yang tiap perjalanannya mahal',
          ],
        ],
        'BFF menambah satu komponen yang harus dirawat per klien, jadi jangan dipakai kalau kliennya cuma satu.',
      ),

      h2('Wujud paling sederhana di stack kurikulum ini'),
      p(
        'Kamu sebenarnya sudah memakai bentuk BFF tanpa menyebutnya begitu. Route handler dan Server Component di Next.js menjalankan peran yang persis sama, yaitu lapisan milik frontend yang menyusun data sesuai kebutuhan tampilannya.',
      ),
      code(
        'tsx',
        `
        // app/pesanan/[id]/page.tsx
        // Server Component ini adalah BFF dalam bentuk paling ringan.
        // Ia menggabungkan beberapa sumber, memilih field yang dipakai,
        // dan menyusun bentuk yang persis dibutuhkan halaman ini.

        export default async function HalamanPesanan({
          params,
        }: {
          params: Promise<{ id: string }>;
        }) {
          const { id } = await params;

          const [pesanan, pengiriman] = await Promise.all([
            ambilPesanan(id),
            ambilStatusPengiriman(id),
          ]);

          // Yang boleh gagal dipisahkan, sesuai pola di sub-bab 3.1.
          const rekomendasi = await ambilRekomendasi(pesanan.idPembeli).catch(() => []);

          return (
            <RincianPesanan
              pesanan={pesanan}
              pengiriman={pengiriman}
              rekomendasi={rekomendasi}
            />
          );
        }
        `,
        {
          filename: 'app/pesanan/[id]/page.tsx',
          caption:
            'Klien menerima satu jawaban yang sudah jadi, bukan tiga permintaan yang harus ia rangkai sendiri.',
        },
      ),
      p(
        'Bentuk ini memberi manfaat utama BFF tanpa menambah satu pun komponen baru untuk dirawat. Untuk sebagian besar aplikasi, ini sudah cukup, dan BFF sebagai layanan terpisah baru masuk akal ketika ada klien lain di luar aplikasi web ini yang kebutuhannya benar-benar berbeda.',
      ),

      h2('Bahaya yang perlu diawasi'),
      ol(
        '**Gerbang menjadi titik kegagalan tunggal.** Semua permintaan lewat sana, sehingga ia wajib digandakan dan wajib punya health check. Sub-bab [titik kegagalan tunggal](/kelas/system-design/keandalan-studi-kasus/titik-kegagalan-tunggal) berlaku penuh di sini.',
        '**Gerbang menjadi tempat menumpuk logika.** Dimulai dari satu penyesuaian kecil untuk satu klien, dan setahun kemudian gerbang berisi aturan bisnis yang tidak dimiliki siapa pun.',
        '**Gerbang menjadi penghambat rilis.** Kalau setiap penambahan endpoint butuh perubahan di gerbang yang dimiliki tim lain, kamu baru saja mengembalikan masalah saling menunggu yang ingin dihilangkan.',
        '**Logika yang sama disalin ke tiap BFF.** Tiga BFF yang masing-masing menghitung total harga dengan caranya sendiri akan berbeda hasilnya. Perhitungan itu milik layanan, bukan milik BFF.',
      ),

      h2('Rangkuman'),
      ul(
        'Tanpa pintu depan, klien jadi tahu susunan dalam sistemmu dan setiap urusan lintas permintaan tersebar.',
        'Gerbang pantas mengurus hal yang berlaku sama untuk semua permintaan, dan tidak pantas mengurus arti bisnisnya.',
        'Otorisasi kasar boleh di gerbang, otorisasi atas data tertentu tetap di lapisan data.',
        'BFF ada bukan karena bentuk respons, melainkan karena siapa yang boleh mengubahnya.',
        'Server Component dan route handler Next.js sudah menjalankan peran BFF dalam bentuk paling ringan.',
        'Awasi empat bahaya yaitu titik kegagalan tunggal, logika menumpuk, penghambat rilis, dan logika yang disalin ke tiap BFF.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Gerbang API dan BFF menyelesaikan masalah yang berbeda meski keduanya duduk di depan sistem. Gerbang mengurus hal yang sama untuk semua klien, sementara BFF mengurus hal yang berbeda per jenis klien.',
      ),
      table(
        ['', 'Gerbang API', 'Backend for Frontend'],
        [
          ['Berapa banyak', 'Satu untuk semua klien', 'Satu per jenis klien'],
          ['Yang dikerjakan', 'Hal lintas potong yang seragam', 'Perakitan data khusus klien itu'],
          [
            'Contoh tugas',
            'TLS, pembatasan laju, autentikasi, log',
            'Menggabungkan beberapa panggilan menjadi satu',
          ],
          ['Siapa pemiliknya', 'Tim platform', 'Tim yang memiliki klien itu'],
          ['Berisi logika bisnis', 'Tidak boleh', 'Sedikit, hanya perakitan'],
        ],
      ),
      p(
        'Alasan BFF ada bisa dihitung dari angka latensi, dan itu yang membuatnya berbeda dari sekadar lapisan tambahan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di mesin ini:
          HTTP round trip ke 127.0.0.1     1,69 ms
          HTTP round trip ke internet      p50 70,04 ms, p99 362,72 ms

        Satu halaman mobile yang memerlukan data dari 5 layanan:

          TANPA BFF, klien memanggil sendiri:
            5 x 70,04 ms = 350 ms bila BERURUTAN
            ~70-100 ms bila paralel, DAN klien harus menulis
            logika perakitannya sendiri

          DENGAN BFF, satu panggilan dari klien:
            1 x 70,04 ms (klien ke BFF)
            + 5 x 1,69 ms (BFF ke layanan, di jaringan yang sama)
            ~78 ms, dan klien hanya menerima bentuk yang sudah jadi

        Selisihnya bukan hanya waktu, melainkan juga bahwa perakitan
        pindah ke tempat yang jaringannya cepat.
        `,
        {
          caption:
            'Nilai BFF terbesar berada pada klien dengan jaringan lambat, yaitu aplikasi mobile.',
        },
      ),
      p(
        'Dan dihitung untuk latensi ekor, manfaatnya bahkan lebih besar daripada yang terlihat dari angka p50.',
      ),
      code(
        'text',
        `
        Dihitung, bila p99 tiap panggilan 1%:

          5 panggilan dari klien lewat internet:
            peluang setidaknya satu kena ekor = 1 - 0,99^5 = 4,9%
            dan ekornya p99 362,72 ms

          1 panggilan dari klien + 5 dari BFF di jaringan yang sama:
            ekor internetnya hanya dari SATU panggilan
            ekor internal jauh lebih kecil

        Mengurangi JUMLAH panggilan lewat jaringan lambat adalah
        salah satu perbaikan latensi yang paling besar yang bisa
        dilakukan tanpa mengubah satu pun layanan.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang paling sering pada keduanya adalah berubah menjadi tempat penampungan logika, dan ia terjadi secara bertahap.',
      ),
      code(
        'text',
        `
        Bagaimana gerbang menjadi objek dewa:

          bulan 1 : hanya meneruskan, plus pembatasan laju
          bulan 3 : "kecil saja, tambahkan penggabungan dua endpoint"
          bulan 6 : "sekalian filter hasilnya di sini"
          bulan 9 : aturan bisnis ada di gerbang, dan tidak ada yang
                    tahu batasnya di mana

        Akibatnya:
          - setiap tim harus mengubah gerbang untuk fiturnya
          - gerbang menjadi titik koordinasi yang menghambat semua
          - dan diukur sebagai pola umum, fan-in tinggi DITAMBAH
            sering berubah adalah tanda objek dewa

        Diukur pada project ini sebagai pembanding yang SEHAT:
          src/lib/curriculum/authoring.ts
            fan-in 58, dan hanya berubah 4 kali, secara ADITIF
        `,
      ),
      p('Kegagalan kedua menyangkut ketersediaan, dan ia bisa dihitung.'),
      code(
        'text',
        `
        Gerbang adalah komponen BERANTAI: bila ia mati, semuanya mati.

        Dihitung sungguhan:
           1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
           2 komponen @ 99,9% -> 99,8001%   ( 17,5 jam/tahun)
          10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)

        Menambah gerbang menambah satu komponen berantai di depan
        SELURUH sistem.

        Karena itu gerbang harus:
          - punya salinan paralel (2 salinan @ 99% -> 99,99%)
          - sesederhana mungkin, sebab setiap logika di dalamnya
            adalah tempat baru yang bisa gagal
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: BFF yang berlipat tanpa batas.

          bff-web, bff-mobile, bff-admin, bff-mitra, bff-tv...

        Setiap BFF adalah layanan yang harus dirilis, dipantau,
        diamankan, dan dijaga kontraknya.

        Dan yang sering terjadi: kode perakitan yang sama disalin
        ke setiap BFF, lalu menyimpang satu per satu.

        Yang menutupnya: pustaka bersama untuk perakitan, dan BFF
        hanya untuk klien yang kebutuhannya BENAR-BENAR berbeda.
        Dua klien dengan kebutuhan yang mirip berbagi satu BFF.
        `,
      ),
      p('Kegagalan keempat bersifat keamanan, dan ia yang paling berbahaya dari semuanya.'),
      code(
        'text',
        `
        Gerbang memeriksa autentikasi, lalu meneruskan ke layanan
        di belakangnya. Layanan di belakang berhenti memeriksa,
        sebab "gerbang sudah memeriksanya".

        Yang terjadi:
          - satu SSRF di layanan mana pun, atau satu pod yang
            dikuasai, memberi akses penuh ke seluruh layanan
          - posisi jaringan menjadi otorisasi, dan itu persis yang
            dilarang zero trust

        Aturan yang mengikat, dari bab Keamanan:
          setiap layanan memeriksa SENDIRI siapa pemanggilnya,
          termasuk untuk lalu lintas internal

        Gerbang menyaring, dan ia tidak menggantikan pemeriksaan
        di setiap tujuan.
        `,
        {
          caption:
            'Diukur di bab Keamanan Fullstack: WebSocket lintas origin BERHASIL tanpa satu pun header CORS — perimeter tidak pernah cukup.',
        },
      ),
      code(
        'text',
        `
        KEGAGALAN KELIMA: BFF yang menyembunyikan kegagalan hilir.

          BFF memanggil 5 layanan. Satu gagal.
          Bila BFF menjawab 500, seluruh halaman kosong meski
          4 dari 5 bagiannya baik-baik saja.

        Yang lebih baik: jawab SEBAGIAN, dan nyatakan bagian mana
        yang tidak tersedia.

          {
            "profil": { ... },
            "pesanan": { ... },
            "rekomendasi": null,
            "tidakTersedia": ["rekomendasi"]
          }

        Kemampuan menjawab sebagian adalah keputusan RANCANGAN, dan
        ia harus ada sejak awal di bentuk responsnya — menambahkannya
        kemudian berarti mengubah kontrak untuk semua klien.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Gerbang dan BFF mudah ditambahkan dan sulit dikecilkan kembali, sebab keduanya cepat menjadi tempat yang nyaman untuk menaruh apa saja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh logika bisnis di gerbang',
            'Cuma sedikit, dan praktis',
            'Gerbang menjadi titik koordinasi yang harus diubah setiap tim untuk setiap fitur',
          ],
          [
            'Menambah gerbang tanpa salinan paralel',
            'Ia kan sederhana',
            'Dihitung, ia komponen berantai di depan semuanya. 2 komponen @ 99,9% -> 17,5 jam/tahun',
          ],
          [
            'Menghentikan pemeriksaan otorisasi di layanan belakang',
            'Gerbang sudah memeriksanya',
            'Posisi jaringan menjadi otorisasi. Satu SSRF memberi akses penuh ke seluruh layanan',
          ],
          [
            'Membuat BFF untuk setiap klien',
            'Tiap klien kan berbeda',
            'Kode perakitan yang sama disalin lalu menyimpang. Satu BFF untuk klien dengan kebutuhan mirip',
          ],
          [
            'Menjawab 500 saat satu hilir gagal',
            'Datanya kan tidak lengkap',
            'Halaman kosong meski 4 dari 5 bagiannya baik. Rancang respons sebagian sejak awal',
          ],
          [
            'Menambah BFF untuk klien dengan jaringan cepat',
            'Biar seragam',
            'Diukur, manfaatnya berasal dari mengurangi panggilan lewat jaringan LAMBAT. Di loopback, selisihnya kecil',
          ],
        ],
      ),
      p(
        'Uji yang cukup andal untuk menilai apakah sebuah gerbang atau BFF masih pada tempatnya adalah uji penghapusan. Bila lapisan itu dihapus dan isinya dipindahkan ke klien atau ke layanan, apakah kerumitannya hilang atau menyebar? Gerbang yang hanya meneruskan kehilangan alasan ada, dan BFF yang menggabungkan lima panggilan lewat jaringan lambat menjadi satu jelas menanggung beban nyata.',
      ),
      references(
        {
          label: 'API gateways in microservices',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway',
          source: 'Microsoft',
          note: 'Peran gerbang beserta batas yang menjaganya tidak berubah menjadi tempat logika menumpuk.',
        },
        {
          label: 'Backends for Frontends pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends',
          source: 'Microsoft',
          note: 'Kapan satu backend per jenis klien lebih baik daripada satu backend untuk semua.',
        },
        {
          label: 'Gateway Aggregation pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation',
          source: 'Microsoft',
          note: 'Menggabungkan beberapa panggilan menjadi satu jawaban, beserta batas pemakaiannya.',
        },
      ),
    ],
  ),
];
