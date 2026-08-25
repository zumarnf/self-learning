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
 * Keamanan Fullstack — Chapter 3, six lessons.
 *
 * Input validation, SQL injection, file upload, secrets, and audit logging, closed by one
 * practice lesson that walks a single comment feature through every layer of this category.
 *
 * The four patterns here are the ones whose failures are silent: nothing errors, nothing looks
 * wrong, and the gap is only visible to someone who goes looking. That is why the closing
 * lesson is an audit rather than a build.
 */
export const lessons: LessonDraft[] = [
  written(
    'validasi-input',
    'Validasi Input sebagai Gerbang',
    13,
    'Kontrol paling hulu, yang membuat sebagian besar kontrol lain benar-benar bekerja.',
    [
      p(
        'Validasi input adalah kontrol paling hulu di seluruh kategori ini. Data yang lolos di sini akan berubah menjadi injeksi, XSS, atau kehabisan sumber daya di lapisan berikutnya. Membetulkannya di sini jauh lebih murah daripada menambal akibatnya satu per satu di hilir.',
      ),
      p(
        'Kalau kamu sudah membaca sub-bab [Validasi dengan Zod](/kelas/backend-basic/nodejs-express-basic/validasi-zod), kamu sudah tahu cara menulis skemanya. Yang dibahas di sini adalah keputusan di sekelilingnya, yaitu di mana gerbangnya dipasang, apa yang harus ditolak, dan bentuk kesalahan yang membuat gerbang terlihat ada padahal terbuka.',
      ),

      terms(
        {
          term: 'validasi',
          meaning:
            'Memastikan sebuah nilai memenuhi bentuk yang diharapkan sebelum dipakai, misalnya bertipe string, panjangnya wajar, dan isinya sesuai pola. Berbeda dari sanitasi yang mengubah nilainya. Validasi menolak, sanitasi membersihkan, dan menolak hampir selalu lebih aman.',
        },
        {
          term: 'schema (skema)',
          meaning:
            'Deskripsi bentuk data yang ditulis sekali lalu dipakai untuk memeriksa setiap masukan. Di TypeScript biasanya memakai Zod, di PHP memakai aturan Validator Laravel. Keuntungan skema dibanding rangkaian `if` adalah ia bisa dibaca sekilas dan tidak mungkin lupa memeriksa satu field.',
        },
        {
          term: 'allow-list dan blocklist',
          meaning:
            'Allow-list menyebut apa yang **boleh**, blocklist menyebut apa yang **dilarang**. Allow-list selalu lebih aman karena daftar hal buruk tidak pernah lengkap. Setiap kali kamu menulis daftar karakter berbahaya, kamu sedang bertaruh bahwa kamu lebih kreatif daripada semua penyerang di masa depan.',
        },
        {
          term: 'normalisasi',
          meaning:
            'Menyeragamkan bentuk sebuah nilai sebelum diperiksa, misalnya menghapus spasi di tepi, menyamakan huruf besar kecil, atau menyatukan bentuk Unicode yang berbeda. Wajib dilakukan **sebelum** validasi, kalau tidak, dua teks yang sebenarnya sama bisa lolos atau tertolak secara berbeda.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Kerentanan yang lahir ketika seluruh body permintaan diteruskan mentah ke fungsi penyimpanan. Field yang tidak kamu maksudkan ikut tersimpan, misalnya `peran: "admin"` atau `saldo: 999999`. Bukan soal isi field, melainkan soal **field mana saja yang boleh ditulis klien**.',
        },
        {
          term: '`.strict()`',
          meaning:
            'Opsi Zod yang membuat skema **menolak** field yang tidak dikenal, bukan sekadar membuangnya diam-diam. Keduanya sama-sama aman, tetapi menolak menghasilkan sinyal yang bisa dicatat, sedangkan membuang membuat percobaan penyisipan berlalu tanpa jejak.',
        },
        {
          term: 'ReDoS',
          meaning:
            'Singkatan dari **Regular Expression Denial of Service**. Pola tertentu bisa membutuhkan waktu yang tumbuh sangat cepat pada masukan yang dirancang khusus, sehingga satu permintaan bisa menyibukkan satu inti prosesor selama bermenit-menit. Dicegah dengan membatasi panjang masukan sebelum pola dijalankan.',
        },
        {
          term: '`422 Unprocessable Content`',
          meaning:
            'Status HTTP untuk permintaan yang bentuknya benar tetapi isinya gagal validasi. Berbeda dari `400` yang berarti permintaannya sendiri rusak. Membedakan keduanya membantu klien memahami apakah ia harus memperbaiki data atau memperbaiki cara mengirim.',
        },
      ),

      h2('Di mana gerbangnya dipasang'),
      p(
        'Validasi bukan hanya untuk form. Setiap tempat data masuk dari luar trust boundary adalah gerbang yang perlu dijaga.',
      ),
      table(
        ['Sumber masukan', 'Sering divalidasi?', 'Risiko bila dilewatkan'],
        [
          ['Body permintaan', 'Ya', 'Semua kelas serangan yang dibahas kategori ini'],
          [
            'Query dan path parameter',
            'Sering tidak',
            'Id yang bukan angka, urutan kolom yang disisipkan, batas paginasi yang tak terbatas',
          ],
          ['Header permintaan', 'Jarang', 'Nilai yang masuk ke log atau ke query tanpa diperiksa'],
          [
            'Payload webhook',
            'Jarang, karena dianggap dari mitra tepercaya',
            'Siapa pun bisa memanggil endpoint webhook-mu bila tanda tangannya tidak diperiksa',
          ],
          [
            'Respons API pihak ketiga',
            'Hampir tidak pernah',
            'Bentuk respons berubah lalu merusak logikamu, atau isinya berbahaya',
          ],
        ],
      ),
      p(
        'Baris terakhir paling sering ditolak saat pertama kali dibaca, karena rasanya berlebihan memvalidasi jawaban dari layanan yang kamu pilih sendiri. Kenyataannya, respons pihak ketiga tetap datang dari luar prosesmu. Ia bisa berubah bentuk karena pembaruan API, bisa kosong karena gangguan, dan bisa dipalsukan bila lalu lintasnya berhasil disadap.',
      ),
      p(
        'Contoh yang sering terjadi begini. Layanan pembayaran mengembalikan `{"status":"paid","amount":150000}`, lalu kodemu menuliskan `if (respons.status === "paid")`. Beberapa bulan kemudian layanan itu menambahkan status baru bernama `paid_partially`, dan karena kamu membandingkan dengan tanda sama dengan, pembayaran sebagian tidak akan pernah cocok. Aplikasimu diam saja tanpa error, dan pesanannya menggantung tanpa penjelasan.',
      ),
      p(
        'Bentuk yang lebih berbahaya terjadi bila respons itu ikut dipakai untuk mengambil keputusan izin atau untuk menampilkan sesuatu ke halaman. Nilai teks yang datang dari pihak ketiga dan langsung dirender adalah jalur XSS yang sama persis dengan komentar pengguna, hanya sumbernya terasa lebih terhormat. Skema yang memeriksa bentuk **dan** nilainya menutup keduanya sekaligus.',
      ),
      p(
        'Baris keempat punya bahaya khusus. Endpoint webhook biasanya dibuat tanpa autentikasi karena mitra memang tidak punya sesi di aplikasimu, dan orang menganggap alamatnya cukup rahasia. Alamatnya bukan rahasia, jadi setiap webhook wajib memverifikasi tanda tangan yang dikirim mitranya sebelum isinya dipercaya.',
      ),

      h2('Skema yang menolak, bukan yang membersihkan'),
      code(
        'ts',
        `
        import { z } from 'zod';

        export const SkemaKomentar = z
          .object({
            isi: z.string().trim().min(1).max(2000),
            artikelId: z.string().uuid(),
            balasanUntuk: z.string().uuid().optional(),
          })
          .strict();

        export const SkemaDaftarKomentar = z.object({
          halaman: z.coerce.number().int().min(1).max(1000).default(1),
          perHalaman: z.coerce.number().int().min(1).max(100).default(20),
          urut: z.enum(['terbaru', 'terlama', 'terpopuler']).default('terbaru'),
        });
        `,
        { filename: 'server/skema-komentar.ts' },
      ),
      p(
        'Panggilan `.strict()` di skema pertama menutup mass assignment sekaligus memberi sinyal. Permintaan yang menyelipkan `penulisId` atau `disetujui` tidak akan diam-diam dibuang, melainkan ditolak dengan `422` yang tercatat di log. Perbedaan antara membuang dan menolak adalah perbedaan antara tidak tahu ada yang mencoba dan tahu persis kapan percobaannya terjadi.',
      ),
      code(
        'text',
        `
        Yang dikirim penyerang:
        { "isi": "halo", "artikelId": "...", "penulisId": "1", "disetujui": true }

        Tanpa .strict()  -> Zod membuang dua field terakhir, permintaan berhasil, log bersih.
        Dengan .strict() -> ditolak 422, log memuat: field tak dikenal penulisId, disetujui
        `,
      ),
      p(
        'Dua baris hasil di bawah itu sama-sama aman bagi datanya, sebab pada kedua kasus `penulisId` dan `disetujui` tidak pernah tersimpan. Yang berbeda adalah apa yang kamu ketahui sesudahnya. Pada baris pertama tidak ada satu pun jejak bahwa seseorang mencoba, sedangkan pada baris kedua kamu punya nama field yang dicobanya, waktu percobaannya, dan alamat IP pengirimnya.',
      ),
      p(
        'Informasi itu bernilai justru karena percobaan semacam ini jarang berdiri sendiri. Seseorang yang mengirim `penulisId` biasanya sedang memetakan bentuk API-mu, dan percobaan berikutnya akan menyasar endpoint lain. Menolak sekaligus mencatat mengubah satu permintaan yang gagal menjadi peringatan dini.',
      ),
      p(
        'Batas `.max(2000)` pada `isi` bukan soal kerapian tampilan. Tanpa batas atas, satu permintaan bisa membawa komentar berukuran puluhan megabita yang harus disimpan, dibaca ulang, dan dikirim ke setiap pembaca halaman itu. Batas ukuran adalah pertahanan pertama terhadap penyalahgunaan sumber daya.',
      ),
      p(
        'Hitungannya cepat terasa. Tanpa batas atas, seribu permintaan berisi komentar sepuluh megabita menghasilkan sepuluh gigabita tulisan ke database dalam beberapa menit. Setiap komentar itu juga ikut dibaca dan dikirim ulang setiap kali halaman artikelnya dibuka, sehingga satu penyerang bisa membuat halaman biasa menjadi sangat lambat bagi semua orang.',
      ),
      p(
        'Batas ini juga perlu ditegakkan di lapisan yang lebih luar. Pada Express, `express.json({ limit: "100kb" })` menolak body berlebih sebelum ia diurai menjadi objek, dan penolakan itu jauh lebih murah daripada mengurai sepuluh megabita JSON lalu membuangnya di tahap validasi. Dua batas pada dua lapis yang berbeda memang disengaja.',
      ),
      p(
        'Pada skema kedua, `.max(100)` di `perHalaman` menutup masalah yang mirip di sisi baca. Tanpa batas atas, permintaan `?perHalaman=1000000` memaksa database membaca satu juta baris dan server menyusun respons raksasa. Nilai `.default(20)` memastikan permintaan tanpa parameter tetap punya batas yang wajar.',
      ),
      p(
        'Pemakaian `z.enum` pada `urut` adalah allow-list dalam bentuk paling sederhana. Nilai apa pun di luar tiga pilihan itu ditolak, sehingga nilai yang lolos dijamin salah satu dari ketiganya. Jaminan itulah yang membuat pemetaan ke nama kolom di sub-bab berikutnya aman dilakukan.',
      ),

      h2('Mass assignment, dan bentuk yang menutupnya'),
      compare(
        {
          title: 'Rentan',
          lang: 'ts',
          code: `
          app.post('/api/komentar', async (req, res) => {
            const komentar = await db.komentar.create({
              data: { ...req.body, penulisId: req.session.penggunaId },
            });
            res.json(komentar);
          });
          `,
          notes: [
            'Sebaran body mentah membawa field apa pun yang dikirim klien.',
            'Field seperti disetujui atau dibuatPada bisa ikut diisi.',
            'Aman hari ini, bocor besok saat kolom baru ditambahkan.',
          ],
        },
        {
          title: 'Aman',
          lang: 'ts',
          code: `
          app.post('/api/komentar', async (req, res) => {
            const data = SkemaKomentar.parse(req.body);
            const komentar = await db.komentar.create({
              data: {
                isi: data.isi,
                artikelId: data.artikelId,
                balasanUntuk: data.balasanUntuk,
                penulisId: req.session.penggunaId,
              },
              select: { id: true, isi: true, dibuatPada: true },
            });
            res.json(komentar);
          });
          `,
          notes: [
            'Field disebut satu per satu, jadi tidak ada yang bisa menyelinap.',
            'Identitas tetap datang dari sesi.',
            'select membatasi kolom yang keluar di respons.',
          ],
        },
      ),
      p(
        'Catatan ketiga di kolom kiri adalah bagian yang paling berbahaya, yaitu bentuk itu bisa aman hari ini dan bocor bulan depan tanpa satu baris pun berubah. Ketika seseorang menambahkan kolom `disetujui` lewat migrasi, endpoint yang menyebar body mentah langsung mengizinkan klien mengisinya. Kerentanan lahir dari perubahan di berkas yang sama sekali berbeda.',
      ),
      p(
        'Urutan kejadiannya biasanya begini. Endpoint ditulis pada bulan pertama ketika tabel komentar hanya punya kolom `isi`, `artikelId`, dan `penulisId`, sehingga bentuk sebaran body memang tidak menimbulkan masalah apa pun. Pada bulan kelima seseorang menambahkan kolom `disetujui` untuk fitur moderasi, lewat migrasi yang sama sekali tidak menyentuh berkas endpoint itu.',
      ),
      p(
        'Sejak migrasi itu diterapkan, endpoint lama diam-diam mengizinkan klien mengisi `disetujui`. Tidak ada satu baris kode pun yang berubah di berkas itu, tidak ada tinjauan kode yang melihatnya, dan tidak ada tes yang gagal. Inilah kenapa bentuk sebaran body disebut kerentanan yang menunggu, bukan sekadar gaya penulisan yang kurang rapi.',
      ),
      p(
        'Bagian `select` di kolom kanan menutup arah sebaliknya, yaitu kebocoran keluar. Tanpa `select`, respons akan memuat setiap kolom tabel itu, termasuk kolom internal seperti alamat IP penulis atau skor penyaringan spam. Menyebut kolom yang keluar sama pentingnya dengan menyebut kolom yang masuk.',
      ),

      h2('Normalisasi lebih dulu, baru validasi'),
      code(
        'ts',
        `
        const SkemaPendaftaran = z.object({
          email: z
            .string()
            .trim()
            .toLowerCase()
            .email()
            .max(254),
          nama: z
            .string()
            .trim()
            .transform((teks) => teks.normalize('NFKC'))
            .pipe(z.string().min(1).max(80)),
        });
        `,
      ),
      p(
        'Urutan `.trim().toLowerCase().email()` menentukan hasilnya. Kalau `.email()` dijalankan lebih dulu, alamat dengan spasi di depan akan ditolak padahal sebenarnya sah, dan huruf besar kecil yang berbeda akan menghasilkan dua akun untuk orang yang sama. Membersihkan bentuknya dulu membuat pemeriksaannya menilai hal yang benar.',
      ),
      p(
        'Panggilan `normalize("NFKC")` menangani sesuatu yang tidak terlihat mata. Unicode punya beberapa cara menuliskan huruf yang tampak identik, misalnya huruf berbentuk lebar yang dipakai di sebagian keyboard. Tanpa normalisasi, dua nama yang terlihat persis sama di layar bisa tersimpan sebagai dua nilai berbeda, dan perbedaan itu bisa dipakai untuk menyamar sebagai orang lain.',
      ),
      p(
        'Contohnya begini. Unicode punya bentuk huruf lebar yang dipakai di sebagian keyboard Asia Timur, sehingga nama yang ditulis dengan huruf lebar akan tampil hampir identik dengan huruf biasa di banyak jenis huruf. Tanpa normalisasi, keduanya tersimpan sebagai dua nilai berbeda, dan pemeriksaan nama sudah dipakai akan menjawab bahwa nama itu masih tersedia.',
      ),
      p(
        'Akibatnya seseorang bisa mendaftar dengan nama yang di layar terlihat sama persis dengan nama moderator, lalu dipercaya orang lain di kolom komentar. Bentuk `NFKC` menyatukan varian-varian itu menjadi satu bentuk baku sebelum diperiksa, sehingga pendaftaran keduanya bertabrakan di pemeriksaan keunikan sebagaimana mestinya.',
      ),
      p(
        'Batas `.max(254)` pada email mengikuti panjang maksimal alamat email menurut standarnya. Angka ini juga menjaga dari ReDoS, sebab pemeriksaan pola apa pun yang dijalankan sesudahnya hanya bekerja pada teks yang panjangnya sudah dibatasi.',
      ),
      callout(
        'warning',
        'Batasi panjang sebelum menjalankan pola',
        'Pola yang terlihat sederhana bisa memakan waktu yang tumbuh sangat cepat pada masukan yang dirancang khusus. Selama panjang masukannya dibatasi lebih dulu, waktu terburuknya ikut terbatas. Urutannya selalu batasi ukuran, baru jalankan pola.',
      ),

      h2('Pesan error yang membantu tanpa membocorkan'),
      code(
        'ts',
        `
        export function tanganiValidasi(err, req, res, next) {
          if (err instanceof z.ZodError) {
            return res.status(422).json({
              pesan: 'Data yang dikirim tidak sesuai',
              kesalahan: err.issues.map((satu) => ({
                field: satu.path.join('.'),
                sebab: satu.message,
              })),
            });
          }

          // Kesalahan lain tidak pernah dikirim apa adanya ke klien.
          catatKesalahan(err, { jalur: req.path, korelasiId: req.korelasiId });
          res.status(500).json({
            pesan: 'Terjadi kesalahan di server',
            korelasiId: req.korelasiId,
          });
        }
        `,
      ),
      p(
        'Cabang pertama boleh detail karena kesalahannya memang berasal dari data yang dikirim klien, dan klien memerlukan detail itu untuk memperbaikinya. Yang dikirim hanyalah nama field dan sebabnya, tanpa menyertakan nilai yang dikirim, sehingga data pribadi tidak ikut terpantul kembali.',
      ),
      p(
        'Cabang kedua sengaja tidak informatif bagi klien. Pesan kesalahan bawaan sering memuat nama tabel, potongan query, jalur berkas, atau versi library, dan semuanya berguna bagi penyerang untuk menyusun langkah berikutnya. Detailnya tetap ada, hanya tempatnya di log server.',
      ),
      p(
        'Nilai `korelasiId` menjembatani keduanya. Pengguna yang melapor cukup menyebut kode itu, lalu kamu bisa menemukan baris log yang tepat beserta seluruh konteksnya. Klien mendapat sesuatu yang berguna tanpa mendapat sesuatu yang berbahaya.',
      ),

      references(
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan allow-list dipilih dan urutan normalisasi sebelum validasi.',
        },
        {
          label: 'Mass Assignment Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Bentuk kerentanan ini di berbagai framework beserta cara menutupnya.',
        },
        {
          label: 'Zod: Objects',
          href: 'https://zod.dev/api?id=objects',
          source: 'Zod',
          note: 'Perbedaan perilaku bawaan dengan `.strict()` terhadap field tak dikenal.',
        },
        {
          label: '422 Unprocessable Content',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422',
          source: 'MDN',
          note: 'Kapan memakai `422` dan bedanya dengan `400`.',
        },
      ),
    ],
  ),

  written(
    'sql-injection-rantai',
    'SQL Injection dari Form sampai Database',
    14,
    'Satu rantai lengkap, dan tiga tempat berbeda untuk memutusnya.',
    [
      p(
        'SQL injection sudah dibahas dua kali di kurikulum ini, yaitu di sub-bab [SQL Injection](/kelas/backend-basic/database-sql-dasar/sql-injection) dari sisi database dan di sub-bab [Injection](/kelas/backend-intermediate/keamanan-backend/injection) dari sisi kategori OWASP. Sub-bab ini melihatnya sebagai **rantai**, yaitu satu perjalanan dari kolom pencarian di browser sampai baris yang dieksekusi database.',
      ),
      p(
        'Cara pandang rantai berguna karena ia menunjukkan sesuatu yang tidak terlihat pada pembahasan per bagian, yaitu ada tiga tempat berbeda untuk memutusnya, dan ketiganya tetap layak dipasang meski satu saja sudah cukup secara teori.',
      ),

      terms(
        {
          term: 'prepared statement',
          meaning:
            'Query yang dikirim ke database dalam dua bagian terpisah, yaitu perintahnya lebih dulu, lalu nilainya menyusul. Database menyusun rencana eksekusinya berdasarkan perintah saja, sehingga isi nilai tidak mungkin lagi berubah menjadi bagian perintah. Inilah pertahanan intinya.',
        },
        {
          term: 'bind parameter',
          meaning:
            'Nilai yang dikirim terpisah untuk mengisi penanda posisi di query, misalnya `$1` di PostgreSQL atau `?` di MySQL dan Laravel. Disebut bind karena nilainya diikat ke slot yang sudah disediakan, bukan disisipkan ke dalam teks query.',
        },
        {
          term: 'identifier',
          meaning:
            'Nama tabel, nama kolom, atau arah pengurutan. Bagian ini **tidak bisa** diparameterkan, karena database sudah harus mengetahuinya untuk menyusun rencana eksekusi sebelum slot nilai diisi. Karena itu identifier ditangani dengan allow-list milikmu sendiri.',
        },
        {
          term: 'escape hatch ORM',
          meaning:
            'Fungsi di ORM yang menjalankan SQL mentah, misalnya `$queryRawUnsafe` di Prisma atau `whereRaw` di Laravel. Ada karena sesekali memang dibutuhkan, dan menjadi sumber kerentanan karena orang memakainya di tengah berkas yang seluruh isinya sudah aman.',
        },
        {
          term: 'blind injection',
          meaning:
            'Injeksi yang hasilnya tidak ditampilkan di halaman. Penyerang menyimpulkan isi data dari perbedaan perilaku, misalnya halaman kosong versus halaman berisi, atau respons cepat versus respons yang tertunda beberapa detik. Lambat, tetapi otomatis dan tetap berhasil.',
        },
        {
          term: 'kerusakan yang terbatas',
          meaning:
            'Gagasan bahwa injeksi yang lolos tetap tidak bisa melakukan hal terburuk, karena kredensial database yang dipakai aplikasi memang tidak punya hak untuk itu. Bentuk konkretnya ada di sub-bab [Hak Seminimal Mungkin](/kelas/keamanan-fullstack/identitas-kewenangan/hak-seminimal-mungkin).',
        },
      ),

      h2('Rantainya'),
      steps(
        {
          title: 'Browser mengirim nilai',
          body: 'Kolom pencarian mengirim `?q=laptop&urut=harga&arah=asc`. Semua nilai di sini sepenuhnya dikendalikan pengirim, termasuk yang tidak muncul di antarmuka.',
        },
        {
          title: 'Server menerima tanpa memeriksa',
          body: 'Nilai diambil langsung dari `req.query` lalu dipakai apa adanya. Di titik inilah gerbang pertama seharusnya berdiri, yaitu skema validasi dari sub-bab sebelumnya.',
        },
        {
          title: 'Query dirangkai sebagai teks',
          body: 'Nilai digabungkan ke dalam string SQL. Di titik ini, data dan perintah sudah bercampur menjadi satu teks, dan tidak ada lagi cara membedakan keduanya.',
        },
        {
          title: 'Database mengeksekusi',
          body: 'Database menerima satu teks utuh dan menjalankan seluruh isinya, termasuk bagian yang berasal dari pengirim. Database tidak punya cara mengetahui bagian mana yang tadinya data.',
        },
      ),
      p(
        'Langkah ketiga adalah tempat kerentanannya benar-benar lahir. Sesudah teks tergabung, tidak ada satu pun perkakas yang bisa memisahkannya kembali, termasuk database yang menerimanya. Karena itu pertahanan yang benar bekerja **sebelum** langkah ini, bukan sesudahnya.',
      ),
      code(
        'sql',
        `
        -- Yang dimaksudkan penulis kode
        SELECT id, nama, harga FROM produk
        WHERE nama ILIKE '%laptop%'
        ORDER BY harga asc LIMIT 20

        -- Yang benar-benar diterima database, dengan q = %' OR 1=1 --
        SELECT id, nama, harga FROM produk
        WHERE nama ILIKE '%%' OR 1=1 --%'
        ORDER BY harga asc LIMIT 20
        `,
      ),
      p(
        'Bandingkan kedua bentuk itu baris per baris. Pada bentuk kedua, tanda kutip yang dikirim pengirim menutup string pencarian lebih awal, `OR 1=1` menambahkan syarat yang selalu benar, dan dua tanda hubung mengubah sisa barisnya menjadi komentar sehingga tanda kutip yang menggantung tidak menimbulkan error sintaks.',
      ),
      p(
        'Perhatikan database sama sekali tidak melakukan kesalahan di sini. Ia menerima satu teks SQL yang sintaksnya benar dan menjalankannya persis seperti yang tertulis. Tidak ada informasi apa pun di dalam teks itu yang menandai bagian mana tadinya berasal dari pengirim, sehingga tidak ada cara bagi database untuk menolaknya.',
      ),
      p(
        'Ini juga alasan penyaringan karakter selalu kalah. Penyaringan berusaha membersihkan teks sebelum digabungkan, sehingga ia harus menebak semua bentuk berbahaya yang mungkin ada. Parameterisasi menghapus penggabungannya sama sekali, sehingga tidak ada yang perlu ditebak.',
      ),

      h2('Kode yang rentan, dan kenapa'),
      code(
        'ts',
        `
        // RENTAN pada dua tempat sekaligus.
        app.get('/api/produk', async (req, res) => {
          const { q, urut, arah } = req.query;

          const hasil = await db.$queryRawUnsafe(\`
            SELECT id, nama, harga FROM produk
            WHERE nama ILIKE '%\${q}%'
            ORDER BY \${urut} \${arah}
            LIMIT 20
          \`);

          res.json(hasil);
        });
        `,
      ),
      p(
        'Tempat pertama ada pada nilai `q` yang digabungkan ke dalam teks query di bagian `ILIKE`. Nilai `q` yang berisi tanda kutip tunggal diikuti `OR 1=1 --` akan menutup string lebih awal, menambahkan syarat yang selalu benar, lalu mengomentari sisa query. Hasilnya seluruh isi tabel terkirim, bukan hanya baris yang cocok dengan pencarian.',
      ),
      p(
        'Tempat kedua ada pada bagian `ORDER BY`, tempat nilai `urut` dan `arah` ikut dirangkai sebagai teks. Yang ini tidak bisa diselesaikan dengan parameter, karena keduanya adalah identifier dan identifier memang tidak bisa diparameterkan. Karena itu banyak orang yang sudah memakai prepared statement untuk nilai tetap merangkai bagian pengurutan dengan string, lalu meninggalkan celah tanpa menyadarinya.',
      ),
      p(
        'Nama fungsi `$queryRawUnsafe` sudah memuat peringatannya, dan itu keputusan penamaan yang bagus. Setiap kemunculan kata `Unsafe` di codebase bisa dicari dalam satu perintah, dan setiap kemunculannya adalah tempat yang wajib ditinjau seseorang.',
      ),

      h2('Memutus rantainya di tiga tempat'),
      code(
        'ts',
        `
        // Gerbang 1: validasi, nilai di luar daftar tidak pernah masuk.
        const SkemaCari = z.object({
          q: z.string().trim().max(100).default(''),
          urut: z.enum(['nama', 'harga', 'terbaru']).default('terbaru'),
          arah: z.enum(['naik', 'turun']).default('turun'),
        });

        // Gerbang 2a: identifier dipetakan lewat objek MILIKMU.
        const KOLOM = { nama: 'nama', harga: 'harga', terbaru: 'dibuat_pada' } as const;
        const ARAH = { naik: 'ASC', turun: 'DESC' } as const;

        app.get('/api/produk', async (req, res) => {
          const { q, urut, arah } = SkemaCari.parse(req.query);

          const kolom = KOLOM[urut];
          const arahSql = ARAH[arah];

          // Gerbang 2b: nilai lewat parameter, bukan penggabungan teks.
          const hasil = await db.$queryRaw\`
            SELECT id, nama, harga FROM produk
            WHERE nama ILIKE \${'%' + q + '%'}
            ORDER BY \${Prisma.raw(kolom)} \${Prisma.raw(arahSql)}
            LIMIT 20
          \`;

          res.json(hasil);
        });
        `,
        { filename: 'server/produk.ts' },
      ),
      p(
        'Gerbang pertama membuat dua gerbang berikutnya lebih mudah dijaga. Sesudah `SkemaCari.parse`, nilai `urut` dijamin salah satu dari tiga kata, jadi pencarian `KOLOM[urut]` tidak mungkin menghasilkan nilai tak terduga. Validasi dan pemetaan bekerja berpasangan, dan masing-masing menutup celah yang berbeda.',
      ),
      p(
        'Perhatikan arah aliran pada `KOLOM[urut]`, karena di situlah letak keamanannya. Nilai dari klien dipakai sebagai **kunci pencarian**, dan yang masuk ke query adalah **nilai dari objek milikmu**. Tidak ada satu karakter pun dari klien yang pernah menyentuh teks query, sehingga tidak ada yang perlu dibersihkan.',
      ),
      p(
        'Telusuri dengan nilai serangan yang nyata. Kirim `?urut=harga; DROP TABLE produk--` dan pencarian `KOLOM["harga; DROP TABLE produk--"]` menghasilkan `undefined`, karena kunci itu memang tidak ada di objek yang kamu tulis. Skema Zod bahkan sudah menolaknya satu langkah lebih awal, sebab nilai itu bukan salah satu dari tiga kata yang diizinkan `z.enum`.',
      ),
      p(
        'Perhatikan tidak ada satu pun karakter yang dihapus, diganti, atau di-escape sepanjang jalur itu. Nilai berbahaya tadi tidak pernah dibersihkan, ia hanya tidak pernah dipakai. Perbedaan antara membersihkan dan tidak memakai adalah perbedaan antara pertahanan yang bisa tertinggal dan pertahanan yang tidak bergantung pada daftar apa pun.',
      ),
      p(
        'Perhatikan juga `terbaru` dipetakan ke nama kolom `dibuat_pada`. Pemetaan ini memberi manfaat tambahan di luar keamanan, yaitu nama kolom database tidak lagi bocor ke antarmuka publik API-mu, sehingga kamu bisa mengganti nama kolom tanpa memutus klien.',
      ),
      p(
        'Bentuk `` $queryRaw`...` `` tanpa tanda kurung adalah tagged template, dan bentuk itu yang membuat Prisma memparameterkan nilainya. Menuliskannya dengan tanda kurung di sekeliling template mengubah artinya sepenuhnya, sebab string sudah tergabung sebelum Prisma melihatnya. Satu pasang kurung memisahkan aman dan rentan.',
      ),
      p(
        'Fungsi `Prisma.raw` dipakai khusus untuk dua identifier tadi, dan ia memang tidak memberi perlindungan apa pun. Perlindungannya sudah diberikan `KOLOM` dan `ARAH` di atasnya. Menuliskannya secara eksplisit membuat pembaca berikutnya tahu bahwa bagian ini disengaja dan sudah dipikirkan, bukan kelalaian.',
      ),

      h2('Bentuk yang sama di Laravel'),
      code(
        'php',
        `
        $urut = ['nama' => 'nama', 'harga' => 'harga', 'terbaru' => 'created_at'];
        $arah = ['naik' => 'asc', 'turun' => 'desc'];

        $kolom = $urut[$request->query('urut')] ?? 'created_at';
        $arahSql = $arah[$request->query('arah')] ?? 'desc';

        // AMAN: nilai lewat binding, identifier lewat allow-list.
        $produk = DB::table('produk')
            ->where('nama', 'ilike', '%' . $request->query('q', '') . '%')
            ->orderBy($kolom, $arahSql)
            ->limit(20)
            ->get();
        `,
      ),
      p(
        'Query builder Laravel mengikat nilai `where` sebagai parameter secara otomatis, jadi bagian pencarian sudah aman tanpa usaha tambahan. Yang tetap menjadi tanggung jawabmu adalah `orderBy`, dan potongan ini menanganinya dengan pemetaan yang sama seperti versi TypeScript.',
      ),
      p(
        'Operator `??` di kedua baris pemetaan mengembalikan nilai bawaan ketika kunci tidak ditemukan. Kirim `?urut=harga; DROP TABLE produk--` dan pencariannya menghasilkan null, sehingga yang dipakai adalah `created_at`. Tidak ada penyaringan karakter, dan memang tidak diperlukan.',
      ),

      h2('Lapis terakhir, ketika semuanya gagal'),
      p(
        'Dua gerbang di atas menutup celahnya. Lapis ketiga tidak mencegah injeksi, melainkan menentukan seberapa parah akibatnya bila suatu hari ada endpoint baru yang lupa dijaga.',
      ),
      table(
        ['Lapis', 'Menutup apa', 'Yang tersisa bila lapis ini satu-satunya'],
        [
          [
            'Validasi skema',
            'Bentuk dan nilai yang tidak masuk akal',
            'Nilai sah yang tetap dirangkai sebagai teks masih berbahaya',
          ],
          [
            'Parameterisasi dan allow-list identifier',
            'Data yang berubah menjadi perintah',
            'Sudah cukup, tetapi bergantung pada tiap endpoint menerapkannya',
          ],
          [
            'Hak database minimum',
            'Kerusakan terburuk',
            'Injeksi tetap bisa membaca data yang boleh dibaca aplikasi',
          ],
          [
            'Pemantauan',
            'Ketidaktahuan',
            'Tidak mencegah apa pun, tetapi memberitahumu lebih awal',
          ],
        ],
      ),
      p(
        'Baris kedua adalah pertahanan yang sebenarnya, dan kolom terakhirnya menjelaskan kenapa baris lain tetap dibutuhkan. Parameterisasi berlaku per query, sehingga jaminannya hanya sekuat kedisiplinan setiap orang yang menulis query berikutnya. Baris ketiga tidak bergantung pada kedisiplinan siapa pun.',
      ),
      p(
        'Cara membaca tabel itu adalah dengan membayangkan satu lapis dihapus satu per satu. Hapus validasi, dan parameterisasi masih menahan injeksi meski nilai anehnya kini sampai ke database. Hapus parameterisasi, dan hak database minimum masih membatasi kerusakan pada tabel yang boleh disentuh aplikasi. Hapus keduanya, dan yang tersisa hanyalah pemantauan yang memberitahumu sesudah kejadian.',
      ),
      p(
        'Latihan membayangkan itu juga berguna untuk memutuskan apa yang dikerjakan lebih dulu ketika waktumu terbatas. Lapis yang paling banyak mengurangi risiko per jam kerja adalah parameterisasi, sedangkan lapis yang paling murah dipasang sekali lalu berlaku selamanya adalah hak database minimum. Keduanya layak didahulukan dibanding menulis aturan pemindaian yang rumit.',
      ),
      callout(
        'tip',
        'Cara mencari kerentanan ini di kodemu sendiri',
        'Cari kata `Unsafe`, `whereRaw`, `DB::select`, `query(` yang diikuti backtick, dan setiap penggabungan string di dekat kata `SELECT`. Perintah `grep` sederhana biasanya menemukan seluruh titik yang perlu ditinjau dalam hitungan detik, dan daftar itu jauh lebih pendek daripada yang dibayangkan orang.',
      ),

      references(
        {
          label: 'SQL Injection Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk cara menangani identifier yang tidak bisa diparameterkan.',
        },
        {
          label: 'Query Builder: Ordering',
          href: 'https://laravel.com/docs/12.x/queries#ordering-grouping-limit-and-offset',
          source: 'Laravel',
          note: 'Perilaku `orderBy` dan bagian mana yang tidak diikat sebagai parameter.',
        },
        {
          label: 'Raw queries',
          href: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries',
          source: 'Prisma',
          note: 'Perbedaan tagged template `$queryRaw` dengan `$queryRawUnsafe`.',
        },
        {
          label: 'PREPARE',
          href: 'https://www.postgresql.org/docs/current/sql-prepare.html',
          source: 'PostgreSQL',
          note: 'Cara database memisahkan rencana eksekusi dari nilai yang menyusul.',
        },
      ),
    ],
  ),

  written(
    'upload-berkas',
    'Upload Berkas yang Tidak Bisa Dieksekusi',
    12,
    'Satu-satunya fitur yang membiarkan pengguna menaruh berkas di servermu.',
    [
      p(
        'Upload berkas adalah satu-satunya fitur yang secara sengaja mengizinkan orang lain menaruh berkas di infrastrukturmu. Karena itu ia layak diperlakukan berbeda dari endpoint lain, dan tiga keputusan yang diambil di sini menentukan apakah fitur ini aman atau menjadi pintu masuk.',
      ),
      p(
        'Ketiganya adalah apa yang diterima, dengan nama apa disimpan, dan di mana diletakkan. Sisi frontend fitur ini sudah dibahas di sub-bab [Upload dari Frontend](/kelas/backend-intermediate/menyambung-frontend-backend/upload-frontend), sedangkan di sini kita membahas sisi yang menerima.',
      ),

      terms(
        {
          term: 'magic byte',
          meaning:
            'Beberapa byte pertama sebuah berkas yang menandai jenisnya sesungguhnya. Berkas PNG selalu diawali pola byte yang sama, begitu juga JPEG dan PDF. Disebut juga file signature. Inilah satu-satunya penanda jenis berkas yang tidak dikendalikan pengirim.',
        },
        {
          term: '`Content-Type` dari klien',
          meaning:
            'Header yang menyatakan jenis berkas menurut **pengirim**. Sepenuhnya dikendalikan pengirim, jadi berkas skrip berbahaya bisa mengaku sebagai `image/png` tanpa hambatan apa pun. Berguna sebagai petunjuk, tidak pernah sebagai bukti.',
        },
        {
          term: 'webroot',
          meaning:
            'Direktori yang isinya disajikan langsung oleh server web ke publik. Berkas yang berada di dalamnya bisa diakses lewat URL, dan pada server tertentu berkas berekstensi tertentu di sana akan **dieksekusi**. Karena itu unggahan tidak pernah boleh mendarat di sini.',
        },
        {
          term: 'path traversal',
          meaning:
            'Menaiki direktori dengan `../` untuk menulis atau membaca berkas di luar folder yang dimaksud. Nama berkas `../../var/www/html/kaget.php` adalah serangan lengkapnya bila nama dari klien dipakai apa adanya sebagai jalur penyimpanan.',
        },
        {
          term: 'object storage',
          meaning:
            'Layanan penyimpanan berkas terpisah dari server aplikasi, misalnya S3 atau padanannya. Dianjurkan karena berkas di sana tidak pernah berada di sistem berkas yang bisa dieksekusi server web, sekaligus memudahkan penskalaan.',
        },
        {
          term: '`Content-Disposition`',
          meaning:
            'Header respons yang menentukan apakah browser menampilkan berkas atau mengunduhnya. Nilai `attachment` memaksa unduhan, sehingga berkas HTML berbahaya sekalipun tidak dirender di origin situsmu.',
        },
        {
          term: 're-encode',
          meaning:
            'Membaca ulang berkas lalu menulisnya kembali dari nol, misalnya mengubah gambar unggahan menjadi berkas baru dengan library pengolah gambar. Proses ini membuang data tersembunyi yang diselipkan di dalam berkas, termasuk kode yang dititipkan di metadata.',
        },
        {
          term: 'presigned URL',
          meaning:
            'Alamat berbatas waktu yang mengizinkan satu operasi tertentu pada object storage, misalnya mengunggah satu berkas selama lima menit. Dipakai supaya berkas besar tidak perlu melewati server aplikasimu sama sekali.',
        },
      ),

      h2('Kenapa Content-Type tidak bisa dipercaya'),
      code(
        'bash',
        `
        # Berkas berisi PHP, dikirim sebagai gambar.
        curl -X POST https://app.toko.com/api/unggah \\
          -F 'berkas=@kaget.php;type=image/png;filename=foto.png'
        `,
      ),
      p(
        'Bagian `type=image/png` di perintah itu ditentukan sepenuhnya oleh pengirim, dan begitu juga `filename=foto.png`. Keduanya hanyalah teks di dalam permintaan HTTP, jadi keduanya berada di luar trust boundary. Validasi yang hanya membaca kedua nilai itu memeriksa pernyataan penyerang tentang dirinya sendiri.',
      ),
      code(
        'text',
        `
        Yang diklaim pengirim          Yang sebenarnya ada di berkas
        -----------------------        -----------------------------
        filename: foto.png             <?php system($_GET['c']); ?>
        type: image/png                (tidak ada satu pun magic byte PNG)

        Magic byte yang benar untuk beberapa jenis:
        PNG   89 50 4E 47 0D 0A 1A 0A
        JPEG  FF D8 FF
        PDF   25 50 44 46          (terbaca sebagai %PDF)
        GIF   47 49 46 38          (terbaca sebagai GIF8)
        `,
      ),
      p(
        'Tabel byte di bagian bawah menjelaskan kenapa pemeriksaan isi tidak bisa ditipu semudah pemeriksaan nama. Berkas PNG yang sah **selalu** diawali delapan byte itu, dan urutannya ditentukan format PNG sendiri, bukan oleh pengirim. Berkas PHP yang diawali tag pembuka tidak akan pernah cocok dengan pola mana pun di daftar yang kamu izinkan.',
      ),
      p(
        'Ada satu varian yang perlu diketahui, yaitu berkas polyglot yang sengaja dibuat sah sebagai dua format sekaligus, misalnya gambar GIF yang bagian ekornya berisi kode PHP. Berkas seperti itu lolos pemeriksaan magic byte karena awalnya memang GIF yang benar. Yang menutupnya adalah dua kontrol berikutnya, yaitu menyimpannya di luar webroot dan menulis ulang gambarnya dari nol.',
      ),
      code(
        'ts',
        `
        import { fileTypeFromBuffer } from 'file-type';

        const JENIS_DIIZINKAN = new Map([
          ['image/png', 'png'],
          ['image/jpeg', 'jpg'],
          ['image/webp', 'webp'],
          ['application/pdf', 'pdf'],
        ]);

        export async function periksaBerkas(isi: Buffer, batasByte = 5 * 1024 * 1024) {
          if (isi.length === 0) throw new BerkasDitolak('Berkas kosong');
          if (isi.length > batasByte) throw new BerkasDitolak('Berkas terlalu besar');

          // Dibaca dari ISI berkas, bukan dari header atau nama.
          const jenis = await fileTypeFromBuffer(isi);
          if (!jenis || !JENIS_DIIZINKAN.has(jenis.mime)) {
            throw new BerkasDitolak('Jenis berkas tidak didukung');
          }

          return { mime: jenis.mime, ekstensi: JENIS_DIIZINKAN.get(jenis.mime) };
        }
        `,
        { filename: 'server/periksa-berkas.ts' },
      ),
      p(
        'Fungsi `fileTypeFromBuffer` membaca beberapa byte pertama isi berkas lalu mencocokkannya dengan pola yang dikenal. Berkas PHP yang diberi nama `foto.png` dan header `image/png` tetap gagal di sini, karena isinya tidak diawali pola PNG. Inilah pemeriksaan yang benar-benar memeriksa berkasnya.',
      ),
      p(
        'Perlu diingat bahwa pemeriksaan ini menjawab pertanyaan jenis berkas, bukan pertanyaan apakah berkasnya aman. Berkas PDF yang magic byte-nya benar tetap bisa memuat JavaScript, dan berkas gambar yang sah tetap bisa dirancang untuk memicu kerentanan di library pengolah gambar. Karena itu daftar yang diizinkan sebaiknya sesempit yang benar-benar dibutuhkan fiturmu.',
      ),
      p(
        'Kalau yang kamu terima memang hanya foto profil, tidak ada alasan mengizinkan PDF di daftar itu. Setiap jenis tambahan membawa serta seluruh permukaan serangan library yang memprosesnya, dan permukaan itu bertambah tanpa memberi manfaat apa pun bila fiturnya tidak membutuhkannya.',
      ),
      p(
        'Perhatikan ekstensi yang dipakai nanti diambil dari `JENIS_DIIZINKAN`, bukan dari nama yang dikirim klien. Bentuk ini menutup seluruh kelas serangan yang bermain di ekstensi, termasuk nama ganda seperti `foto.png.php` dan karakter tersembunyi di tengah nama.',
      ),
      p(
        'Pemeriksaan `isi.length > batasByte` sengaja diletakkan sebelum pembacaan jenis. Membaca dan memproses berkas berukuran besar menghabiskan memori, jadi menolak lebih dulu berdasarkan ukuran adalah urutan yang benar. Batas ini juga harus ditegakkan di lapisan server web supaya berkas raksasa ditolak sebelum sampai ke kodemu.',
      ),
      callout(
        'danger',
        'Daftar ekstensi yang dilarang tidak akan pernah lengkap',
        'Melarang `.php`, `.jsp`, dan `.exe` terlihat masuk akal sampai kamu menemukan `.phtml`, `.php5`, `.phar`, dan varian lain yang tetap dieksekusi server tertentu. Sebutkan jenis yang boleh, tolak semua sisanya, dan tentukan sendiri ekstensi yang dipakai saat menyimpan.',
      ),

      h2('Nama berkas dibuat server, bukan diterima dari klien'),
      code(
        'ts',
        `
        import crypto from 'node:crypto';
        import path from 'node:path';

        const AKAR_UNGGAHAN = path.resolve('/var/data/unggahan');

        export async function simpanUnggahan(isi: Buffer, penggunaId: string) {
          const { mime, ekstensi } = await periksaBerkas(isi);

          // Nama sepenuhnya dihasilkan server, nama asli tidak dipakai sama sekali.
          const nama = \`\${crypto.randomUUID()}.\${ekstensi}\`;
          const tujuan = path.join(AKAR_UNGGAHAN, nama);

          await fs.writeFile(tujuan, isi);

          // Nama asli boleh disimpan sebagai data, bukan sebagai jalur.
          return db.berkas.create({
            data: { nama, mime, ukuran: isi.length, pemilikId: penggunaId },
          });
        }
        `,
      ),
      p(
        'Baris yang membentuk `nama` menutup dua serangan sekaligus tanpa satu pun pemeriksaan tambahan. Path traversal menjadi mustahil karena nama dari klien tidak pernah menyentuh jalur, dan penimpaan berkas orang lain menjadi mustahil karena nilai acaknya praktis tidak akan pernah berulang.',
      ),
      p(
        'Komentar terakhir menandai pembedaan yang penting. Nama asli berkas tetap berguna untuk ditampilkan kepada pengguna, jadi ia disimpan sebagai kolom biasa di database. Yang tidak boleh adalah memakainya sebagai bagian dari jalur berkas, karena di situlah ia berubah dari data menjadi perintah bagi sistem berkas.',
      ),
      p(
        'Nilai `AKAR_UNGGAHAN` menunjuk `/var/data/unggahan`, yaitu di luar direktori yang disajikan server web. Dengan begitu, seandainya sebuah berkas berbahaya lolos setiap pemeriksaan di atas, tidak ada URL apa pun yang bisa memintanya dieksekusi.',
      ),

      h2('Menyajikannya kembali'),
      code(
        'ts',
        `
        app.get('/berkas/:id', async (req, res) => {
          const berkas = await db.berkas.findUnique({ where: { id: req.params.id } });
          if (!berkas) return res.status(404).end();

          // Otorisasi di lapisan data, bukan sekadar menyembunyikan tautannya.
          if (!(await bolehMengakses(req.session.penggunaId, berkas))) {
            return res.status(404).end();
          }

          res.setHeader('Content-Type', berkas.mime);
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Content-Disposition', \`attachment; filename="\${amankanNama(berkas.namaAsli)}"\`);
          res.sendFile(path.join(AKAR_UNGGAHAN, berkas.nama));
        });
        `,
      ),
      p(
        'Kombinasi `nosniff` dan `Content-Disposition: attachment` adalah pasangan yang menutup jalur eksekusi terakhir. Tanpa `nosniff`, browser bisa menebak sendiri jenis berkasnya dan memperlakukannya sebagai HTML. Tanpa `attachment`, berkas HTML yang lolos akan dirender di origin situsmu, dan skrip di dalamnya berjalan sebagai bagian sah dari aplikasimu.',
      ),
      p(
        'Bayangkan berkas HTML yang lolos setiap pemeriksaan sebelumnya, misalnya karena daftar izinmu sempat memuat `text/html` untuk keperluan lain. Tanpa `Content-Disposition: attachment`, membuka alamat berkas itu akan merender halamannya di origin situsmu, dan skrip di dalamnya bisa membaca cookie yang tidak bertanda `HttpOnly` lalu memanggil API-mu atas nama korban.',
      ),
      p(
        'Dengan `attachment`, alamat yang sama memicu unduhan alih-alih rendering. Berkasnya tetap tersimpan di komputer korban, tetapi ia tidak pernah dijalankan di dalam origin situsmu, sehingga kerugiannya berhenti di situ. Cara paling kuat tetap menyajikan unggahan dari domain terpisah, sebab domain terpisah berarti origin terpisah dan cookie situsmu tidak ikut ke sana sama sekali.',
      ),
      p(
        'Perhatikan cabang tidak berhak menjawab `404`, bukan `403`. Untuk berkas, keberadaan sebuah id sudah merupakan informasi, sehingga menjawab bahwa berkas itu ada tetapi tidak boleh diakses justru membocorkan sesuatu. Menjawab seolah tidak ada menutup jalur penelusuran itu.',
      ),
      p(
        'Fungsi `amankanNama` membuang tanda kutip dan karakter kendali dari nama asli sebelum dimasukkan ke header. Tanpa itu, nama berkas yang memuat tanda kutip bisa memecah struktur header dan menyisipkan header tambahan, yaitu bentuk injeksi yang sasarannya bukan SQL melainkan HTTP.',
      ),

      h2('Ringkas'),
      ol(
        'Batasi ukuran di server web dan di aplikasi, sebelum berkasnya diproses.',
        'Periksa jenis dari isi berkas, bukan dari header maupun ekstensi.',
        'Sebutkan jenis yang boleh, jangan menyusun daftar yang dilarang.',
        'Hasilkan nama berkas di server, dan simpan nama asli sebagai data biasa.',
        'Letakkan berkas di luar webroot, atau pakai object storage.',
        'Sajikan dengan `nosniff` dan `Content-Disposition: attachment`.',
        'Tulis ulang gambar dari nol atau pindai berkas bila risikonya tinggi.',
        'Periksa hak akses saat berkas diminta, bukan hanya saat diunggah.',
      ),
      p(
        'Poin terakhir sering terlewat karena perhatian tercurah ke sisi unggah. Padahal berkas yang tersimpan aman tetapi bisa diminta siapa saja lewat id yang dinaikkan satu per satu adalah bentuk IDOR yang sepenuhnya utuh, dan berkasnya justru sering memuat dokumen paling sensitif di aplikasi.',
      ),

      references(
        {
          label: 'File Upload Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar lengkap kontrol upload, termasuk alasan menolak daftar ekstensi terlarang.',
        },
        {
          label: 'Content-Disposition',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition',
          source: 'MDN',
          note: 'Perbedaan `inline` dan `attachment` beserta aturan penulisan nama berkas.',
        },
        {
          label: 'MIME types (IANA media types)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types',
          source: 'MDN',
          note: 'Kenapa jenis media yang dinyatakan klien tidak bisa dijadikan dasar keputusan.',
        },
      ),
    ],
  ),

  written(
    'rahasia-konfigurasi',
    'Rahasia dan Konfigurasi',
    12,
    'Yang tidak boleh ada di kode, dan yang tidak boleh sampai ke browser.',
    [
      p(
        'Rahasia yang tertulis di kode akan ikut ke seluruh riwayat git, ke setiap salinan repositori, dan ke setiap image yang dibangun darinya. Sekali tersebar, menghapus commitnya tidak menutup kebocorannya. Sub-bab [Rahasia dan Konfigurasi](/kelas/backend-intermediate/keamanan-backend/rahasia-konfigurasi) membahas aturan dasarnya, dan di sini kita membahas tiga hal yang paling sering salah dalam praktik.',
      ),
      p(
        'Ketiganya adalah memuat konfigurasi dengan cara yang fail loudly saat ada yang kurang, memisahkan nilai publik dari rahasia, dan merancang rotasi supaya bisa dilakukan tanpa mengubah kode.',
      ),

      terms(
        {
          term: 'rahasia (secret)',
          meaning:
            'Nilai yang memberi kewenangan kepada pemegangnya, misalnya kunci API, password database, kunci penandatangan token, dan token OAuth. Ciri khasnya, siapa pun yang memegangnya bisa bertindak sebagai aplikasimu, sehingga kerahasiaannya adalah satu-satunya yang melindunginya.',
        },
        {
          term: 'environment variable',
          meaning:
            'Nilai yang disuntikkan sistem operasi atau platform ke proses saat ia dijalankan. Tidak ikut tersimpan di kode, sehingga cocok untuk rahasia selama platformnya yang menyuntikkan saat deploy, bukan berkas teks yang ikut dikemas ke dalam image.',
        },
        {
          term: 'vault',
          meaning:
            'Layanan khusus penyimpan rahasia yang mengatur siapa boleh membaca apa, mencatat setiap akses, dan mendukung rotasi terjadwal. Lebih dianjurkan untuk produksi daripada berkas environment, karena ia menjawab pertanyaan siapa yang membaca rahasia ini dan kapan.',
        },
        {
          term: 'prefix publik',
          meaning:
            'Awalan nama variabel yang menandai nilainya boleh ikut ke browser, misalnya `NEXT_PUBLIC_` di Next.js dan `VITE_` di Vite. Nilai di belakang prefix ini **tertanam di bundel JavaScript** saat build, jadi ia bisa dibaca siapa pun yang membuka situsmu.',
        },
        {
          term: 'rotasi',
          meaning:
            'Mengganti rahasia dengan nilai baru secara berkala, dan segera setelah dicurigai bocor. Rotasi hanya benar-benar bisa dijalankan bila aplikasi membaca nilainya saat boot atau per permintaan, bukan menyalinnya ke tempat lain lalu menyimpannya selamanya.',
        },
        {
          term: 'secret scanning',
          meaning:
            'Pemindaian otomatis yang mencari pola rahasia di dalam kode dan riwayat commit. Layak dipasang sebagai gerbang sebelum commit diterima, karena mencegah satu commit jauh lebih murah daripada merotasi rahasia yang sudah tersebar.',
        },
        {
          term: '`.env.example`',
          meaning:
            'Berkas contoh yang ikut di-commit, berisi **nama** setiap variabel dengan nilai kosong atau contoh yang jelas palsu. Gunanya memberi tahu orang berikutnya variabel apa saja yang dibutuhkan, tanpa membocorkan satu pun nilainya.',
        },
      ),

      h2('Memuat konfigurasi sekali, dan fail loudly'),
      code(
        'ts',
        `
        import { z } from 'zod';

        const SkemaEnv = z.object({
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32),
          SESSION_SECRET: z.string().min(32),
          CORS_ORIGINS: z.string().min(1),
          NODE_ENV: z.enum(['development', 'test', 'production']),
          SMTP_PASSWORD: z.string().min(1),
        });

        const hasil = SkemaEnv.safeParse(process.env);

        if (!hasil.success) {
          // Menyebut NAMA variabel yang bermasalah, tidak pernah nilainya.
          const kurang = hasil.error.issues.map((satu) => satu.path.join('.'));
          throw new Error(\`Konfigurasi tidak lengkap: \${kurang.join(', ')}\`);
        }

        export const env = Object.freeze(hasil.data);
        `,
        { filename: 'server/env.ts' },
      ),
      p(
        'Pemeriksaan ini berjalan saat modul dimuat, yaitu sebelum server menerima satu permintaan pun. Bentuk ini disengaja, karena aplikasi yang berhasil menyala dengan konfigurasi kurang akan gagal jauh kemudian di jalur yang tidak terduga, dan menelusurinya kembali ke variabel yang hilang bisa memakan waktu berjam-jam.',
      ),
      p(
        'Bandingkan dengan aplikasi yang tidak punya pemeriksaan ini. Ia menyala normal, halaman utamanya terbuka, dan semuanya terlihat baik. Kegagalan baru muncul ketika seseorang mencoba masuk, karena di situlah `JWT_SECRET` pertama kali dibaca. Pada sebagian library, nilai `undefined` bahkan tidak melempar error melainkan diperlakukan sebagai kunci kosong, sehingga token apa pun dianggap sah.',
      ),
      p(
        'Bentuk kegagalan seperti itu paling mahal ditelusuri karena gejalanya jauh dari sebabnya. Yang terlihat adalah masalah autentikasi, sedangkan sebabnya ada di berkas konfigurasi yang tidak pernah dibuka siapa pun hari itu. Menolak menyala dengan pesan yang menyebut nama variabelnya mengubah penelusuran berjam-jam menjadi bacaan satu baris.',
      ),
      p(
        'Baris yang menyusun `kurang` hanya mengambil `path`, yaitu nama variabelnya, dan tidak pernah menyertakan nilainya. Pesan kesalahan sering berakhir di log yang dibaca banyak orang atau di layanan pelacakan error pihak ketiga, jadi menyertakan nilai rahasia di dalamnya sama saja dengan membocorkannya lewat jalur yang tidak kamu sadari.',
      ),
      p(
        'Batas `.min(32)` pada kedua kunci menutup kesalahan yang tidak terlihat seperti kesalahan, yaitu rahasia yang terlalu pendek. Kunci penandatangan sepanjang delapan karakter secara teknis bekerja, tidak menimbulkan error apa pun, dan bisa ditebak dengan pencarian menyeluruh dalam waktu yang wajar.',
      ),
      p(
        'Panggilan `Object.freeze` membuat nilai konfigurasi tidak bisa diubah setelah dimuat. Ini menjaga dari kode lain yang menimpanya di tengah jalan, sengaja maupun tidak, sehingga nilai yang dipakai di menit keseratus sama dengan yang diperiksa saat boot.',
      ),

      h2('Yang boleh sampai ke browser'),
      table(
        ['Nilai', 'Boleh publik?', 'Alasan'],
        [
          ['Alamat dasar API', 'Ya', 'Browser memang harus tahu ke mana mengirim permintaan'],
          ['Kunci publik pembayaran', 'Ya', 'Memang dirancang untuk dipakai di sisi klien'],
          ['Kode analitik', 'Ya', 'Tidak memberi kewenangan apa pun'],
          ['Kunci rahasia pembayaran', 'Tidak', 'Memberi kewenangan penuh atas akun pembayaranmu'],
          ['Password database', 'Tidak', 'Memberi akses langsung ke seluruh data'],
          [
            'Kunci penandatangan token',
            'Tidak',
            'Siapa pun yang memegangnya bisa membuat token palsu',
          ],
        ],
      ),
      p(
        'Pertanyaan yang memisahkan kedua kelompok itu hanya satu, yaitu apakah nilai ini memberi **kewenangan** kepada pemegangnya. Alamat API dan kode analitik tidak memberi kewenangan apa pun, sebab mengetahuinya tidak membuat siapa pun bisa melakukan hal yang tadinya tidak bisa. Kunci rahasia pembayaran memberi kewenangan penuh, sehingga siapa pun yang membacanya bisa bertindak sebagai bisnismu.',
      ),
      p(
        'Kunci publik pembayaran adalah kasus yang paling sering meresahkan orang, dan namanya sendiri sudah menjawab. Ia memang dirancang untuk dibaca semua orang, dan yang bisa dilakukan pemegangnya hanyalah memulai transaksi yang tetap harus diselesaikan lewat kunci rahasia di servermu. Ragu adalah reaksi yang sehat, dan cara menyelesaikannya adalah membaca dokumentasi layanan itu, bukan menebak dari namanya.',
      ),
      code(
        'bash',
        `
        # Ikut ke bundel browser, bisa dibaca siapa pun yang membuka situs.
        NEXT_PUBLIC_API_URL=https://api.toko.com
        NEXT_PUBLIC_PAYMENT_PUBLIC_KEY=pk_live_...

        # Hanya ada di server.
        DATABASE_URL=postgresql://...
        PAYMENT_SECRET_KEY=sk_live_...
        JWT_SECRET=...
        `,
        { filename: '.env.production' },
      ),
      p(
        'Perbedaan kedua kelompok ini bukan soal kebiasaan penamaan, melainkan soal ke mana nilainya benar-benar pergi. Nilai berawalan `NEXT_PUBLIC_` **disalin ke dalam berkas JavaScript** saat build, jadi ia sudah tertulis di dalam berkas yang diunduh setiap pengunjung. Tidak ada cara menyembunyikannya lagi sesudah itu.',
      ),
      p(
        'Kesalahan yang paling sering terjadi adalah menambahkan prefix itu untuk menyelesaikan error saat pengembangan. Nilai yang tadinya hanya ada di server tidak terbaca di komponen klien, lalu prefix ditambahkan supaya berhenti error, dan rahasianya ikut terbit ke publik pada build berikutnya. Perbaikan yang benar adalah memindahkan pemakaiannya ke server, bukan memindahkan rahasianya ke klien.',
      ),
      code(
        'diff',
        `
        - // Komponen klien memanggil API pembayaran langsung, butuh kunci rahasia.
        - const kunci = process.env.NEXT_PUBLIC_PAYMENT_SECRET_KEY;
        - await fetch('https://pembayaran.com/charge', { headers: { Authorization: kunci } });

        + // Komponen klien memanggil API MILIKMU, kunci rahasia tetap di server.
        + await fetch('/api/pembayaran/charge', { method: 'POST', body });
        `,
      ),
      p(
        'Baris yang dihapus adalah bentuk yang lahir dari niat menyederhanakan, yaitu memanggil layanan pembayaran langsung dari browser supaya tidak perlu menulis endpoint sendiri. Harga penyederhanaan itu adalah kunci rahasia yang kini tertulis di dalam berkas JavaScript yang bisa diunduh siapa saja.',
      ),
      p(
        'Bentuk penggantinya menambah satu endpoint di servermu, dan endpoint itulah yang memegang kunci rahasianya. Pekerjaan tambahannya kecil, dan sebagai imbalannya kamu memperoleh tempat untuk memeriksa izin, membatasi laju, dan mencatat peristiwanya. Ketiganya tidak mungkin dilakukan bila browser berbicara langsung ke layanan pembayaran.',
      ),
      p(
        'Perhatikan `pk_live_` dan `sk_live_` pada contoh pembayaran. Banyak layanan sengaja memberi awalan berbeda antara kunci publik dan kunci rahasia justru supaya kekeliruan ini mudah terlihat saat ditinjau. Manfaatkan pola itu ketika membaca kode orang lain.',
      ),
      callout(
        'danger',
        'Cara memeriksanya dalam satu menit',
        'Jalankan build produksi, lalu cari potongan rahasiamu di dalam folder hasil build. Kalau ia ditemukan, ia sudah publik. Pemeriksaan ini jauh lebih meyakinkan daripada membaca ulang kode dan berharap tidak ada yang terlewat.',
      ),

      h2('Rahasia yang pernah ter-commit'),
      steps(
        {
          title: 'Rotasi lebih dulu, jangan menulis ulang riwayat dulu',
          body: 'Terbitkan nilai baru dan cabut yang lama. Ini satu-satunya langkah yang benar-benar menutup kebocoran, dan ia harus dilakukan pertama karena setiap menit penundaan adalah menit ketika nilai lama masih berlaku.',
        },
        {
          title: 'Anggap sudah tersebar',
          body: 'Repositori sudah di-clone orang lain, sudah di-fork, sudah masuk cache layanan pencarian kode, dan sudah dipindai bot yang memang mencari pola rahasia. Menghapus commitnya tidak menarik kembali satu pun salinan itu.',
        },
        {
          title: 'Baru bersihkan riwayat bila perlu',
          body: 'Menulis ulang riwayat berguna supaya rahasia lama tidak terus muncul di pemindaian, tetapi ia bukan penutup kebocoran. Jangan pernah menukar urutan langkah ini dengan langkah pertama.',
        },
        {
          title: 'Pasang pemindai sebagai gerbang',
          body: 'Tambahkan secret scanning di pipeline dan di hook sebelum commit. Mencegah satu commit jauh lebih murah daripada merotasi rahasia produksi di tengah malam.',
        },
      ),
      p(
        'Urutan ini sering dibalik karena menghapus commit terasa seperti menyelesaikan masalah, sementara rotasi terasa merepotkan. Kenyataannya, hanya rotasi yang mengubah keadaan. Riwayat yang bersih dengan rahasia yang masih berlaku adalah kebocoran yang kini lebih sulit ditemukan sendiri.',
      ),
      p(
        'Yang membuat urutan itu penting adalah kecepatan pemindai otomatis. Ada bot yang terus memantau commit publik dan mencari pola kunci layanan populer, dan jarak antara sebuah kunci ter-push dengan kunci itu dicoba biasanya diukur dalam **menit**, bukan hari. Waktu yang kamu habiskan untuk menulis ulang riwayat adalah waktu ketika kunci lama masih berlaku penuh.',
      ),
      p(
        'Karena itu banyak layanan besar kini memindai repositori publik atas nama pelanggannya lalu menonaktifkan kunci yang bocor secara otomatis. Bantuan itu bagus, tetapi ia hanya menutupi kunci layanan yang ikut program tersebut. Kunci internal, password database, dan kunci penandatangan tokenmu sendiri tidak ada yang memindainya selain kamu.',
      ),

      h2('Merancang rotasi supaya benar-benar bisa dilakukan'),
      ul(
        '**Baca rahasia saat boot atau per permintaan**, jangan menyalinnya ke variabel global yang hidup selamanya. Nilai yang tidak pernah dibaca ulang menuntut penerapan ulang aplikasi untuk setiap rotasi.',
        '**Dukung dua kunci sekaligus untuk sementara.** Saat merotasi kunci penandatangan, terima kunci lama dan baru selama masa peralihan, supaya token yang sudah terbit tidak seketika ditolak.',
        '**Beri nama versi pada kunci.** Menyimpan penanda versi bersama data yang ditandatangani membuat kamu tahu kunci mana yang dipakai tanpa harus menebak.',
        '**Catat kapan terakhir dirotasi.** Tanpa catatan, tidak akan ada yang tahu bahwa sebuah kunci sudah dipakai selama tiga tahun.',
        '**Pisahkan rahasia per lingkungan.** Kunci pengembangan yang bisa menyentuh produksi menghapus manfaat pemisahan lingkungan itu sendiri.',
      ),
      p(
        'Poin kedua adalah yang paling sering dilupakan sampai rotasi pertama benar-benar dijalankan. Mengganti kunci penandatangan tanpa masa peralihan akan membuat setiap sesi aktif tertolak seketika, dan seluruh penggunamu terlempar keluar bersamaan. Mendukung dua kunci mengubah rotasi dari kejadian besar menjadi kegiatan rutin.',
      ),

      references(
        {
          label: 'Secrets Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Perbandingan environment variable dengan vault, beserta anjuran rotasi.',
        },
        {
          label: 'III. Config',
          href: 'https://12factor.net/config',
          source: 'The Twelve-Factor App',
          note: 'Alasan konfigurasi dipisahkan dari kode dan disuntikkan lingkungan.',
        },
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js',
          note: 'Menyebut langsung bahwa nilai `NEXT_PUBLIC_` tertanam di bundel browser.',
        },
        {
          label: 'Configuration',
          href: 'https://laravel.com/docs/12.x/configuration',
          source: 'Laravel',
          note: 'Cara membaca konfigurasi dan kenapa `env()` tidak dipakai di luar berkas config.',
        },
      ),
    ],
  ),

  written(
    'audit-logging',
    'Audit Logging',
    12,
    'Tanpa jejak, sebuah insiden tidak bisa dijawab sama sekali.',
    [
      p(
        'Semua kontrol di kategori ini berusaha mencegah sesuatu terjadi. Audit logging bekerja pada pertanyaan yang berbeda, yaitu apa yang bisa kamu jawab **sesudah** sesuatu terjadi. Tanpa jejak, pertanyaan paling dasar dari sebuah insiden tidak punya jawaban, yaitu data apa yang diakses, sejauh mana, dan sejak kapan.',
      ),
      p(
        'Ada manfaat kedua yang jarang disebut. Audit log adalah satu-satunya cara membuktikan bahwa kontrol lain di kategori ini benar-benar bekerja. Rate limit yang tidak pernah tercatat memicu penolakan bisa saja tidak pernah aktif, dan tidak ada yang akan tahu.',
      ),

      terms(
        {
          term: 'audit log',
          meaning:
            'Catatan peristiwa yang berarti secara keamanan, bukan catatan teknis untuk mencari bug. Isinya menjawab siapa melakukan apa terhadap objek mana dan kapan. Berbeda dari log aplikasi biasa yang isinya lebih banyak soal jalannya program.',
        },
        {
          term: 'empat unsur wajib',
          meaning:
            'Aktor, aksi, objek sasaran, dan waktu. Sebuah catatan yang kehilangan salah satunya biasanya tidak bisa dipakai saat dibutuhkan. Catatan "penghapusan gagal" tanpa menyebut siapa dan apa yang dihapus tidak menolong siapa pun.',
        },
        {
          term: 'correlation id',
          meaning:
            'Nilai unik yang dibuat saat sebuah permintaan masuk lalu dibawa ke setiap baris log yang lahir dari permintaan itu. Gunanya menyatukan puluhan baris terpisah menjadi satu cerita utuh, termasuk baris yang ditulis layanan lain.',
        },
        {
          term: 'structured logging',
          meaning:
            'Menulis log sebagai data berstruktur, biasanya JSON, bukan sebagai kalimat bebas. Perbedaannya terasa saat mencari, karena mesin bisa menyaring berdasarkan field alih-alih mencocokkan teks yang bentuknya berubah-ubah.',
        },
        {
          term: 'redaction (redaksi)',
          meaning:
            'Menghapus atau menyamarkan bagian sensitif sebelum sesuatu ditulis ke log, misalnya mengganti isi password dengan tanda bintang. Harus dilakukan otomatis di satu tempat, karena mengandalkan setiap penulis kode untuk mengingatnya pasti gagal suatu hari.',
        },
        {
          term: 'append-only',
          meaning:
            'Penyimpanan yang hanya bisa ditambahi, tidak bisa diubah maupun dihapus. Penting untuk audit log, sebab penyerang yang berhasil masuk akan berusaha menghapus jejaknya, dan jejak yang bisa dihapus tidak bisa dijadikan bukti.',
        },
        {
          term: 'log injection',
          meaning:
            'Menyisipkan baris baru ke dalam log lewat nilai yang mengandung karakter pindah baris. Penyerang bisa mengarang entri palsu yang terlihat sah, sehingga penyelidikan sesudahnya justru tersesat mengikuti jejak buatan.',
        },
        {
          term: 'alert',
          meaning:
            'Aturan yang memicu pemberitahuan ketika pola tertentu muncul di log. Tanpa alert, log hanyalah arsip. Perlu diingat bahwa alert yang tidak pernah diuji biasanya tidak bekerja, sama seperti cadangan yang tidak pernah dipulihkan.',
        },
      ),

      h2('Peristiwa yang wajib dicatat'),
      table(
        ['Peristiwa', 'Kenapa penting', 'Yang dicari nanti'],
        [
          [
            'Login berhasil dan gagal',
            'Dasar seluruh penyelidikan akun',
            'Keberhasilan sesudah banyak kegagalan',
          ],
          [
            'Penolakan otorisasi',
            'Tanda seseorang mencoba melewati batas',
            'Lonjakan penolakan dari satu akun',
          ],
          [
            'Ganti password, email, dan pengaturan MFA',
            'Langkah baku pengambilalihan akun',
            'Perubahan yang terjadi tepat sesudah login dari lokasi baru',
          ],
          ['Pemakaian ulang refresh token', 'Bukti kuat token dicuri', 'Kemunculannya sama sekali'],
          [
            'Aksi admin',
            'Kewenangan terbesar, dampak terbesar',
            'Aksi di luar jam kerja atau di luar kebiasaan',
          ],
          [
            'Ekspor data massal',
            'Bentuk paling umum dari pencurian data',
            'Volume yang jauh di atas kebiasaan akun itu',
          ],
          [
            'Perubahan izin dan peran',
            'Bagaimana hak menumpuk diam-diam',
            'Kenaikan hak yang tidak ada tiketnya',
          ],
        ],
      ),
      p(
        'Kolom terakhir baris pertama menyebut pola yang paling sering terlewat, yaitu **keberhasilan sesudah banyak kegagalan**. Banyak tim hanya mencatat kegagalan dengan alasan keberhasilan adalah hal normal. Padahal justru perpindahan dari gagal berulang menjadi berhasil itulah yang menandakan tebakan penyerang akhirnya tepat, dan pola itu hanya terlihat kalau keduanya tercatat.',
      ),
      code(
        'text',
        `
        # Pola yang hanya terlihat kalau keberhasilan ikut dicatat.
        21:04:11  login.gagal    email=korban@x.com  ip=203.0.113.9
        21:04:13  login.gagal    email=korban@x.com  ip=203.0.113.9
        ... 47 baris serupa ...
        21:09:52  login.gagal    email=korban@x.com  ip=203.0.113.9
        21:09:55  login.berhasil email=korban@x.com  ip=203.0.113.9   <-- ini sinyalnya
        21:10:02  email.diganti  email=korban@x.com  ip=203.0.113.9
        `,
      ),
      p(
        'Baris bertanda panah adalah satu-satunya baris yang benar-benar berarti di seluruh potongan itu, dan ia tidak akan pernah ada bila kamu hanya mencatat kegagalan. Empat puluh sembilan kegagalan berturut-turut hanyalah gangguan yang gagal, sedangkan kegagalan yang berakhir dengan keberhasilan adalah akun yang baru saja jatuh.',
      ),
      p(
        'Baris terakhir menunjukkan kenapa perubahan pengaturan akun juga masuk daftar wajib catat. Penggantian email tujuh detik sesudah login yang mencurigakan adalah langkah baku pengambilalihan, sebab penyerang ingin memutus jalur pemulihan korban sebelum korban sadar. Tiga jenis peristiwa yang berbeda baru bercerita ketika ketiganya ada di satu tempat.',
      ),
      p(
        'Baris keempat layak diperlakukan berbeda dari yang lain. Pemakaian ulang refresh token hampir tidak punya penjelasan yang tidak berbahaya, sehingga kemunculannya sendiri sudah cukup menjadi alasan memberi peringatan, tanpa perlu menunggu pola atau ambang tertentu.',
      ),

      h2('Menulisnya di satu tempat'),
      code(
        'ts',
        `
        const FIELD_SENSITIF = new Set([
          'password', 'kataSandi', 'token', 'refreshToken',
          'authorization', 'cookie', 'secret', 'apiKey', 'nomorKartu',
        ]);

        function redaksi(nilai: unknown): unknown {
          if (nilai === null || typeof nilai !== 'object') return nilai;
          if (Array.isArray(nilai)) return nilai.map(redaksi);

          return Object.fromEntries(
            Object.entries(nilai).map(([kunci, isi]) =>
              FIELD_SENSITIF.has(kunci) ? [kunci, '[disamarkan]'] : [kunci, redaksi(isi)],
            ),
          );
        }

        export function catatPeristiwa(
          aksi: string,
          konteks: Record<string, unknown>,
          req?: Request,
        ) {
          logger.info({
            jenis: 'audit',
            aksi,                                   // apa
            aktor: req?.session?.penggunaId ?? 'anonim', // siapa
            waktu: new Date().toISOString(),        // kapan
            ip: req?.ip,
            korelasiId: req?.korelasiId,
            ...redaksi(konteks) as object,          // objek sasaran dan detailnya
          });
        }
        `,
        { filename: 'server/audit.ts' },
      ),
      p(
        'Fungsi `redaksi` dijalankan otomatis pada setiap pemanggilan, dan bentuk itu yang membuatnya bisa diandalkan. Kalau penyamaran diserahkan kepada pemanggil, cepat atau lambat akan ada satu tempat yang lupa, dan satu tempat itu cukup untuk menaruh password pengguna di log yang dibaca banyak orang.',
      ),
      code(
        'text',
        `
        catatPeristiwa('login.gagal', {
          email: 'orang@x.com',
          password: 'rahasiaku123',
          meta: { token: 'eyJhbGciOi...', perangkat: 'iPhone' },
        });

        # Yang benar-benar tertulis di log:
        { "jenis":"audit", "aksi":"login.gagal", "aktor":"anonim",
          "email":"orang@x.com", "password":"[disamarkan]",
          "meta": { "token":"[disamarkan]", "perangkat":"iPhone" } }
        `,
      ),
      p(
        'Perhatikan `meta.token` ikut tersamarkan meski ia berada satu lapis lebih dalam. Itulah gunanya `redaksi` memanggil dirinya sendiri, sebab data sensitif jarang berada rapi di lapisan teratas. Nilai `perangkat` yang tidak sensitif tetap lolos apa adanya, sehingga log tetap berguna untuk menyelidiki.',
      ),
      p(
        'Perhatikan juga pemanggil sama sekali tidak perlu tahu field mana yang sensitif. Ia menulis konteks apa adanya, dan penyamaran terjadi di satu tempat yang bisa ditinjau sekali lalu dipercaya seterusnya. Daftar `FIELD_SENSITIF` menjadi satu-satunya berkas yang perlu diperbarui ketika muncul nama field rahasia yang baru.',
      ),
      p(
        'Perhatikan `redaksi` memanggil dirinya sendiri untuk objek di dalam objek. Data sensitif sering berada beberapa lapis di dalam, misalnya di dalam body permintaan yang bersarang, dan penyamaran yang hanya memeriksa lapisan teratas akan melewatkannya.',
      ),
      p(
        'Empat unsur wajib muncul sebagai `aksi`, `aktor`, `waktu`, dan konteks yang menyebut objek sasarannya. Nilai `aktor` sengaja jatuh ke `anonim` alih-alih dibiarkan kosong, karena percobaan yang dilakukan tanpa login juga perlu tercatat, dan justru itulah percobaan yang paling menarik saat diselidiki.',
      ),
      p(
        'Nilai `korelasiId` yang ikut di setiap baris memungkinkan seluruh jejak satu permintaan disatukan kembali. Tanpa itu, sebuah insiden hanya terlihat sebagai baris-baris terpisah yang kebetulan berdekatan waktunya, dan menyusunnya kembali menjadi cerita utuh menjadi pekerjaan menebak.',
      ),

      h2('Yang tidak boleh masuk log'),
      table(
        ['Jangan dicatat', 'Kenapa'],
        [
          [
            'Password, bahkan yang salah',
            'Password yang salah sering hanya salah ketik dari password yang benar',
          ],
          [
            'Token, cookie, dan header otorisasi',
            'Log yang bocor berubah menjadi daftar sesi yang bisa langsung dipakai',
          ],
          [
            'Nomor kartu dan data pembayaran',
            'Melanggar aturan kepatuhan sekaligus menambah nilai bagi pencuri log',
          ],
          [
            'Seluruh body permintaan apa adanya',
            'Cara paling umum semua hal di atas masuk tanpa disengaja',
          ],
          [
            'Data pribadi yang tidak diperlukan',
            'Log ikut tersalin ke banyak tempat dan bertahan lama',
          ],
        ],
      ),
      p(
        'Baris pertama sering diperdebatkan dengan alasan password yang salah bukan password yang benar. Kenyataannya, orang mengetik password yang hampir benar, sehingga log kegagalan berisi daftar tebakan yang sangat dekat dengan aslinya. Daftar itu jauh lebih berharga bagi penyerang daripada yang dibayangkan.',
      ),
      p(
        'Baris keempat adalah pintu masuk yang membuat baris lain terjadi. Mencatat seluruh body untuk memudahkan penelusuran terasa praktis pada minggu pertama, lalu ikut membawa password, token, dan data pribadi selamanya sesudahnya. Kalau kamu memang perlu isi permintaan, catat field yang kamu butuhkan saja.',
      ),

      h2('Log injection'),
      code(
        'ts',
        `
        // RENTAN: nilai dari pengguna langsung digabung ke teks log.
        logger.info(\`Login gagal untuk \${email}\`);

        // email = "korban@x.com\\n2026-08-24 INFO Login berhasil untuk admin@x.com"
        // -> muncul entri palsu yang terlihat sah

        // AMAN: nilai menjadi field, bukan bagian dari teks.
        logger.info({ jenis: 'audit', aksi: 'login.gagal', email });
        `,
      ),
      p(
        'Bentuk rentan di atas memperlakukan log seperti kalimat, sehingga karakter pindah baris di dalam nilai bisa memulai baris baru yang terlihat seperti entri sungguhan. Penyelidik yang membaca log itu kemudian mengikuti jejak yang sepenuhnya dikarang penyerang.',
      ),
      p(
        'Bentuk aman menyelesaikannya dengan cara yang sama seperti parameterisasi menyelesaikan SQL injection, yaitu memisahkan struktur dari nilai. Nilai `email` menjadi isi sebuah field di dalam JSON, dan karakter pindah baris di dalamnya akan dikodekan sehingga tidak pernah bisa memecah strukturnya.',
      ),

      h2('Dari log menjadi deteksi'),
      p(
        'Log yang tidak pernah dibaca bukan deteksi, melainkan arsip. Yang mengubahnya menjadi deteksi adalah sejumlah kecil aturan yang benar-benar mengirim pemberitahuan kepada orang yang bisa bertindak.',
      ),
      ol(
        'Kirimkan log ke tempat terpusat, supaya jejaknya tetap ada meski instance yang dibobol dihapus.',
        'Buat aturan alert untuk pola yang paling berarti, mulai dari lima sampai sepuluh aturan saja.',
        'Uji tiap aturan dengan sengaja memicunya, lalu pastikan pemberitahuannya benar-benar diterima seseorang.',
        'Tinjau alert yang sering berbunyi tanpa arti, lalu perbaiki ambangnya, karena alert yang diabaikan sama saja dengan tidak ada.',
        'Catat kapan terakhir kali jalur alert terbukti bekerja.',
      ),
      p(
        'Langkah ketiga adalah yang paling sering dilewati, dan ia yang menentukan apakah sisanya nyata. Aturan alert bisa salah menulis nama field, saluran notifikasi bisa diarsipkan, dan kunci integrasi bisa kedaluwarsa. Semuanya diam tanpa gejala sampai hari kamu benar-benar membutuhkannya, dan hari itu bukan waktu yang tepat untuk menemukan bahwa alertnya tidak pernah bekerja.',
      ),
      p(
        'Cara mengujinya tidak perlu rumit. Untuk aturan kegagalan login beruntun, jalankan skrip yang mengirim tiga puluh permintaan login yang salah ke sebuah akun uji, lalu tunggu pemberitahuannya. Untuk aturan pemakaian ulang refresh token, panggil endpoint refresh dua kali dengan token yang sama. Keduanya selesai dalam hitungan menit.',
      ),
      p(
        'Jalankan pengujian itu di lingkungan staging bila memicu tiga puluh kegagalan di produksi akan mengunci akun sungguhan atau membanjiri saluran tim. Catat tanggal terakhir tiap aturan terbukti bekerja, karena catatan itulah yang membedakan pemantauan yang hidup dari kumpulan aturan yang tidak ada lagi yang berani menyentuhnya.',
      ),
      callout(
        'tip',
        'Mulai dari lima aturan, jangan lima puluh',
        'Lima aturan yang benar-benar dibaca jauh lebih berguna daripada lima puluh aturan yang membanjiri saluran sampai semua orang berhenti memperhatikannya. Mulailah dari kegagalan login beruntun, lonjakan penolakan otorisasi, pemakaian ulang refresh token, ekspor data massal, dan aksi admin di luar jam kerja.',
      ),

      references(
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Isi minimum satu catatan log dan daftar yang tidak boleh masuk ke dalamnya.',
        },
        {
          label: 'Logging Vocabulary Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Penamaan peristiwa keamanan yang konsisten sehingga bisa dicari lintas layanan.',
        },
        {
          label: 'A09:2021 — Security Logging and Monitoring Failures',
          href: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
          source: 'OWASP',
          note: 'Peristiwa yang wajib dicatat beserta pola yang layak diberi alert.',
        },
      ),
    ],
  ),

  written(
    'praktik-audit-fitur',
    'Praktik: Menelusuri Satu Fitur dari Ujung ke Ujung',
    15,
    'Dua puluh sub-bab dipakai sekaligus pada satu fitur komentar.',
    [
      p(
        'Sub-bab penutup ini tidak memperkenalkan hal baru. Isinya adalah satu fitur komentar yang ditelusuri lapis demi lapis, memakai setiap kontrol yang sudah dibahas di kategori ini. Tujuannya menunjukkan bahwa kontrol-kontrol itu bukan daftar terpisah, melainkan lapisan yang bertumpuk pada satu jalur permintaan yang sama.',
      ),
      p(
        'Fiturnya sengaja dipilih yang paling biasa, yaitu pengguna menulis komentar di sebuah artikel, komentar itu tersimpan, lalu tampil kepada pembaca lain. Justru fitur sebiasa inilah yang menyentuh hampir seluruh kontrol yang ada.',
      ),

      terms(
        {
          term: 'audit fitur',
          meaning:
            'Menelusuri satu fitur dari titik masuk sampai titik keluar sambil menanyakan kontrol apa yang seharusnya ada di tiap lapis. Berbeda dari memindai seluruh codebase sekaligus, karena kedalamannya lebih terjaga dan hasilnya bisa ditindaklanjuti dalam satu sesi kerja.',
        },
        {
          term: 'jalur permintaan',
          meaning:
            'Urutan lapisan yang dilewati satu permintaan, yaitu browser, jaringan, server web, middleware, handler, lapisan data, database, lalu kembali sebagai respons. Setiap lapisan punya kontrol yang hanya bisa dipasang di sana.',
        },
        {
          term: 'defense in depth pada satu fitur',
          meaning:
            'Bentuk konkret defense in depth, yaitu ketika satu fitur dijaga beberapa kontrol yang berbeda sifatnya. Kalau validasi terlewat, parameterisasi masih menahan. Kalau escaping terlewat, CSP masih menahan.',
        },
      ),

      h2('Fitur yang diaudit'),
      code(
        'text',
        `
        Pengguna menulis komentar di sebuah artikel.

        POST /api/artikel/:artikelId/komentar   { isi }
        GET  /api/artikel/:artikelId/komentar   ?halaman=1

        Aturan yang berlaku:
        - Hanya pengguna yang sudah masuk boleh berkomentar.
        - Komentar hanya boleh di artikel yang boleh dibaca pengguna itu.
        - Penulis boleh menghapus komentarnya sendiri.
        - Moderator boleh menghapus komentar siapa pun.
        `,
      ),
      p(
        'Empat aturan di bagian bawah terlihat sederhana dan itulah masalahnya. Aturan yang mudah dinyatakan dalam bahasa manusia sering tidak ditegakkan di kode, karena semua orang menganggapnya sudah jelas. Audit ini pada dasarnya adalah memeriksa apakah setiap kalimat di atas benar-benar punya kode yang menegakkannya.',
      ),

      h2('Lapis demi lapis'),
      table(
        ['Lapis', 'Pertanyaan yang diajukan', 'Sub-bab'],
        [
          [
            'Browser',
            'Apakah komentar ditampilkan dengan escaping, dan apakah ada sink berbahaya?',
            '1.3, 1.4',
          ],
          ['Jaringan', 'Apakah seluruh ruas memakai TLS, dan apakah HSTS terpasang?', '1.7'],
          ['CORS', 'Apakah origin dibatasi daftar persis, dan tidak dipantulkan?', '1.2'],
          ['Cookie', 'Apakah sesi memakai HttpOnly, Secure, dan SameSite?', '1.5'],
          ['Header', 'Apakah CSP, nosniff, dan frame-ancestors terpasang?', '1.4, 1.6'],
          ['Autentikasi', 'Apakah identitas datang dari sesi server, bukan dari body?', '1.1, 2.3'],
          ['Rate limit', 'Apakah pengiriman komentar dibatasi per akun?', '2.2'],
          ['Validasi', 'Apakah skema menolak field tak dikenal dan membatasi ukuran?', '3.1'],
          ['Otorisasi', 'Apakah kepemilikan diperiksa di lapisan data, bukan di UI?', '2.7'],
          ['Query', 'Apakah nilai diparameterkan dan identifier lewat allow-list?', '3.2'],
          ['Database', 'Apakah kredensial aplikasi tanpa hak mengubah struktur?', '2.7'],
          [
            'Respons',
            'Apakah kolom yang keluar dibatasi, dan error tidak membocorkan detail?',
            '3.1',
          ],
          ['Jejak', 'Apakah penolakan dan penghapusan tercatat?', '3.5'],
        ],
      ),
      p(
        'Perhatikan baris Otorisasi dan baris Respons, karena keduanya adalah tempat kebocoran paling sering ditemukan pada audit nyata. Keduanya tidak menghasilkan error apa pun ketika salah, sehingga tidak ada tes fungsional yang akan menangkapnya. Fitur berjalan sempurna sambil membocorkan data.',
      ),
      p(
        'Bentuk kegagalan baris Otorisasi biasanya begini. Tombol hapus disembunyikan di antarmuka untuk komentar milik orang lain, sehingga fiturnya terasa benar ketika dicoba lewat halaman. Endpoint di belakangnya tidak pernah memeriksa kepemilikan, dan siapa pun yang memanggilnya langsung bisa menghapus komentar siapa saja. Tidak ada error, tidak ada log yang aneh, dan tidak ada tes yang gagal.',
      ),
      p(
        'Bentuk kegagalan baris Respons lebih halus lagi. Endpoint daftar komentar mengembalikan seluruh baris apa adanya, sehingga kolom internal seperti alamat IP penulis ikut terkirim ke setiap pembaca. Antarmuka tidak menampilkannya, jadi tidak ada yang menyadarinya sampai seseorang membuka tab Network dan melihat data yang seharusnya tidak pernah keluar dari server.',
      ),
      p(
        'Kesamaan kedua bentuk itulah yang membuat audit ini perlu dilakukan dengan sengaja. Keduanya tidak menghasilkan gejala, tidak muncul di pemantauan, dan tidak ditangkap tes fungsional yang menguji apakah fiturnya bekerja. Satu-satunya cara menemukannya adalah menanyakan pertanyaannya secara khusus.',
      ),

      h2('Endpoint yang sudah lengkap'),
      code(
        'ts',
        `
        app.post(
          '/api/artikel/:artikelId/komentar',
          wajibMasuk,                    // autentikasi, lapis 6
          batasiKomentar,                // rate limit, lapis 7
          async (req, res) => {
            // Lapis 8: validasi. Field tak dikenal ditolak, ukuran dibatasi.
            const { isi } = SkemaKomentar.parse(req.body);
            const { artikelId } = SkemaParamArtikel.parse(req.params);

            // Lapis 9: otorisasi di lapisan data, bukan sekadar menyembunyikan tombol.
            const artikel = await db.artikel.findFirst({
              where: { id: artikelId, ...filterArtikelTerlihat(req.session.penggunaId) },
              select: { id: true, komentarDitutup: true },
            });
            if (!artikel) return res.status(404).json({ pesan: 'Artikel tidak ditemukan' });
            if (artikel.komentarDitutup) {
              return res.status(409).json({ pesan: 'Komentar ditutup untuk artikel ini' });
            }

            // Lapis 10: field disebut satu per satu, identitas dari sesi.
            const komentar = await db.komentar.create({
              data: {
                isi,
                artikelId: artikel.id,
                penulisId: req.session.penggunaId,
              },
              select: { id: true, isi: true, dibuatPada: true },
            });

            // Lapis 13: jejak.
            catatPeristiwa('komentar.dibuat', { komentarId: komentar.id, artikelId }, req);

            res.status(201).json(komentar);
          },
        );
        `,
        { filename: 'server/komentar.ts' },
      ),
      p(
        'Panggilan `filterArtikelTerlihat` adalah bentuk konkret otorisasi di lapisan data. Ia menambahkan syarat ke dalam query itu sendiri, sehingga artikel yang tidak boleh dibaca pengguna ini **tidak akan pernah terambil**. Bandingkan dengan mengambil artikel dulu lalu memeriksa izinnya sesudahnya, yang memberi kesempatan seseorang lupa menulis pemeriksaannya.',
      ),
      code(
        'ts',
        `
        // Syarat kepemilikan dan visibilitas ditulis sekali, dipakai di setiap query.
        export function filterArtikelTerlihat(penggunaId: string) {
          return {
            OR: [
              { status: 'terbit' },
              { penulisId: penggunaId },          // draf miliknya sendiri
              { kolaborator: { some: { penggunaId } } },
            ],
          };
        }
        `,
      ),
      p(
        'Mengangkatnya menjadi satu fungsi memberi manfaat yang tidak terlihat pada satu endpoint saja. Aturan visibilitas artikel biasanya dipakai di banyak tempat, yaitu halaman daftar, halaman detail, endpoint komentar, endpoint pencarian, dan ekspor. Menuliskannya berulang di lima tempat berarti lima kesempatan untuk lupa satu cabang.',
      ),
      p(
        'Bentuk ini juga membuat perubahan aturan menjadi satu suntingan. Ketika nanti ditambahkan konsep artikel terjadwal yang belum boleh dibaca siapa pun kecuali penulisnya, kamu mengubah satu fungsi dan seluruh endpoint ikut benar. Pada bentuk yang tersebar, perubahan yang sama menuntut kamu menemukan setiap tempatnya lebih dulu, dan tempat yang terlewat menjadi kebocoran.',
      ),
      p(
        'Cabang artikel tidak ditemukan menjawab `404`, sama untuk artikel yang memang tidak ada maupun artikel yang ada tetapi tidak boleh diakses. Membedakan keduanya menjadi `404` dan `403` akan memberi tahu penyerang bahwa artikel dengan id itu memang ada, dan pengetahuan itu sudah merupakan kebocoran.',
      ),
      p(
        'Bagian `select` muncul dua kali, dan keduanya membatasi kolom yang keluar. Pada query artikel ia mencegah data artikel yang tidak diperlukan ikut terbawa ke memori, dan pada `create` ia mencegah kolom internal seperti alamat IP penulis atau skor penyaringan spam ikut terkirim ke klien.',
      ),
      p(
        'Perhatikan `artikelId: artikel.id` memakai nilai dari hasil query, bukan langsung dari parameter URL. Perbedaannya terlihat sepele karena keduanya bernilai sama, tetapi bentuk ini memastikan komentar hanya bisa menempel pada artikel yang sudah lolos pemeriksaan izin di baris sebelumnya.',
      ),

      h2('Sisi hapus, tempat dua aturan bertemu'),
      code(
        'ts',
        `
        app.delete('/api/komentar/:id', wajibMasuk, async (req, res) => {
          const { id } = SkemaParamId.parse(req.params);

          const komentar = await db.komentar.findUnique({
            where: { id },
            select: { id: true, penulisId: true, artikelId: true },
          });
          if (!komentar) return res.status(404).json({ pesan: 'Komentar tidak ditemukan' });

          const penulisSendiri = komentar.penulisId === req.session.penggunaId;
          const moderator = await punyaPeran(req.session.penggunaId, 'moderator');

          if (!penulisSendiri && !moderator) {
            catatPeristiwa('komentar.hapus-ditolak', { komentarId: id }, req);
            return res.status(404).json({ pesan: 'Komentar tidak ditemukan' });
          }

          await db.komentar.delete({ where: { id } });
          catatPeristiwa(
            'komentar.dihapus',
            { komentarId: id, olehModerator: !penulisSendiri && moderator },
            req,
          );

          res.status(204).end();
        });
        `,
      ),
      p(
        'Dua aturan izin dari daftar di awal bertemu di sini, dan keduanya dinyatakan sebagai dua nilai boolean yang terpisah lalu digabungkan di satu tempat. Bentuk ini membuat aturannya bisa dibaca sekali lihat, dan menambah aturan ketiga di kemudian hari tidak menuntut penulisan ulang.',
      ),
      p(
        'Penolakan dicatat lewat `catatPeristiwa` sebelum respons dikirim. Satu penolakan adalah kejadian biasa, misalnya seseorang menekan tombol dari halaman yang sudah basi. Puluhan penolakan dari satu akun dalam waktu singkat adalah seseorang yang sedang mencoba id satu per satu, dan pola itu hanya terlihat kalau penolakannya tercatat.',
      ),
      p(
        'Nilai `olehModerator` disimpan di jejaknya supaya pertanyaan yang muncul kemudian bisa dijawab tanpa menebak. Ketika seorang penulis melapor bahwa komentarnya hilang, catatan ini langsung membedakan antara ia menghapusnya sendiri, moderator yang menghapusnya, atau sesuatu yang lain.',
      ),

      h2('Daftar periksa yang benar-benar dijalankan'),
      p(
        'Pakai daftar ini pada satu fitur, bukan pada seluruh aplikasi sekaligus. Satu fitur yang diperiksa tuntas jauh lebih berguna daripada seluruh aplikasi yang diperiksa sekilas.',
      ),
      checklist(
        'keamanan-fullstack/audit-fitur',
        'Audit satu fitur dari ujung ke ujung',
        'Identitas diambil dari sesi server, tidak pernah dari body atau query',
        'Setiap masukan lewat skema yang menolak field tak dikenal dan membatasi ukuran',
        'Otorisasi ditegakkan di lapisan data, dan jalur yang seharusnya ditolak sudah diuji',
        'Query memakai parameter, dan identifier dipetakan lewat allow-list',
        'Kredensial database aplikasi tidak punya hak mengubah struktur',
        'Kolom yang keluar di respons dibatasi secara eksplisit',
        'Pesan error untuk klien generik, detailnya hanya di log server',
        'Keluaran ditampilkan dengan escaping, dan tidak ada sink HTML mentah',
        'CSP, nosniff, frame-ancestors, dan HSTS terpasang serta terverifikasi dengan curl',
        'Cookie sesi memakai HttpOnly, Secure, dan SameSite',
        'CORS memakai daftar origin persis yang dibaca dari environment',
        'Endpoint sensitif dibatasi lajunya per akun dan per IP',
        'Tidak ada rahasia di kode maupun di bundel browser',
        'Peristiwa keamanan tercatat dengan aktor, aksi, objek, dan waktu',
        'Minimal satu tes membuktikan jalur yang seharusnya ditolak memang ditolak',
      ),
      p(
        'Butir terakhir adalah yang mengikat semuanya. Kontrol keamanan tidak menimbulkan gejala apa pun ketika ia hilang, sehingga satu-satunya bukti bahwa ia ada adalah tes yang mencoba menembusnya lalu gagal. Tanpa tes itu, seluruh daftar di atas hanyalah niat.',
      ),
      code(
        'ts',
        `
        it('menolak penghapusan komentar milik orang lain', async () => {
          const a = await buatPengguna();
          const b = await buatPengguna();
          const komentar = await buatKomentar({ penulisId: b.id });

          const respons = await sebagai(a).delete(\`/api/komentar/\${komentar.id}\`);

          expect(respons.status).toBe(404);
          // Yang paling penting: pastikan datanya MEMANG masih ada.
          expect(await db.komentar.findUnique({ where: { id: komentar.id } })).not.toBeNull();
        });
        `,
      ),
      p(
        'Baris terakhir tes itu yang membedakannya dari tes yang terlihat benar tetapi tidak membuktikan apa-apa. Memeriksa status `404` saja belum cukup, sebab endpoint bisa saja menghapus datanya lebih dulu lalu mengembalikan `404` karena alasan lain. Memeriksa datanya masih ada adalah pemeriksaan atas akibat sesungguhnya, bukan atas kode status.',
      ),
      p(
        'Tes seperti ini memakan waktu sekitar lima menit untuk ditulis dan akan berjaga selama fitur itu hidup. Ketika enam bulan lagi seseorang menyederhanakan handler hapus dan tidak sengaja membuang pemeriksaan kepemilikannya, tes inilah yang menyala merah sebelum perubahan itu sampai ke produksi.',
      ),
      callout(
        'tip',
        'Cara memakai kategori ini seterusnya',
        'Setiap kali kamu membangun fitur baru, buka tabel lapis demi lapis di sub-bab ini lalu jawab tiga belas pertanyaannya. Sebagian besar akan terjawab dalam hitungan detik karena kontrolnya sudah terpasang di lapisan bersama. Yang tersisa biasanya satu atau dua pertanyaan, dan justru di situlah kerentanan berikutnya biasanya bersembunyi.',
      ),

      references(
        {
          label: 'Application Security Verification Standard',
          href: 'https://owasp.org/www-project-application-security-verification-standard/',
          source: 'OWASP',
          note: 'Daftar periksa keamanan yang jauh lebih rinci, untuk dipakai ketika daftar di sub-bab ini sudah terlalu ringkas.',
        },
        {
          label: 'OWASP Top 10',
          href: 'https://owasp.org/Top10/',
          source: 'OWASP',
          note: 'Sepuluh kategori risiko yang menjadi kerangka bab keamanan backend di kategori sebelumnya.',
        },
        {
          label: 'Web Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security',
          source: 'MDN',
          note: 'Pintu masuk dokumentasi keamanan web, berguna sebagai rujukan harian.',
        },
      ),
    ],
  ),
];
