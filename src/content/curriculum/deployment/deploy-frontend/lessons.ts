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
 * Deployment — Chapter 3, all six lessons.
 *
 * Next.js 16 to production. Provider-specific steps are marked as such, and the underlying
 * mechanics are always explained first — a reader who only learns one provider's dashboard cannot
 * move, and cannot diagnose anything the dashboard does not show.
 */
export const lessons: LessonDraft[] = [
  written(
    'build-produksi',
    'Build Produksi & Analisis Bundle',
    18,
    'Membaca keluaran build, bukan sekadar menunggunya selesai.',
    [
      terms(
        {
          term: 'build produksi',
          meaning:
            'Proses membangun aplikasi dengan optimasi penuh untuk dipakai pengguna sungguhan, berbeda dari mode pengembangan yang mengutamakan kecepatan umpan balik. Yang berubah antara lain kode diperkecil, pemeriksaan khusus pengembangan dibuang, dan halaman yang bisa dibuat lebih awal ikut dibuat.',
        },
        {
          term: 'minification',
          meaning:
            'Memperkecil ukuran berkas dengan membuang spasi, komentar, dan memendekkan nama variabel lokal, tanpa mengubah perilakunya. Dibaca "minifikeisyen".',
        },
        {
          term: 'source map',
          meaning:
            'Berkas pendamping yang memetakan kode yang sudah diperkecil kembali ke kode sumber aslinya, supaya jejak error tetap terbaca. Perlu keputusan sadar di produksi, sebab menerbitkannya membuat kode sumbermu bisa dibaca siapa pun.',
        },
        {
          term: 'code splitting',
          meaning:
            'Memecah bundel menjadi beberapa potongan yang dimuat sesuai kebutuhan, bukan satu berkas besar di muka. Halaman pertama jadi lebih ringan, dengan konsekuensi ada permintaan tambahan saat pengguna berpindah.',
        },
        {
          term: 'static generation',
          meaning:
            'Pembuatan HTML sebuah halaman pada saat build, sehingga permintaan pengguna dilayani berkas yang sudah jadi. Paling cepat, dengan syarat isinya boleh membeku sampai build berikutnya.',
        },
        {
          term: 'server-side rendering (SSR)',
          meaning:
            'Pembuatan HTML pada saat permintaan datang, sehingga isinya selalu segar. Harganya waktu tunggu dan beban server pada tiap permintaan.',
        },
        {
          term: 'bundle size',
          meaning:
            'Ukuran total berkas JavaScript yang harus diunduh dan diurai peramban sebelum halaman bisa dipakai. Ia berpengaruh dua kali, yaitu pada waktu unduh dan pada waktu pemrosesan di perangkat, dan yang kedua justru lebih terasa di ponsel kelas menengah.',
        },
        {
          term: 'tree shaking',
          meaning:
            'Pembuangan kode yang tidak pernah dipakai saat build. Hanya bekerja bila impornya statis dan pustakanya menyediakan bentuk modul yang bisa dianalisis, jadi mengimpor satu fungsi dari pustaka yang tidak mendukungnya tetap menyeret seluruh isinya.',
        },
      ),

      code(
        'bash',
        `
        npm run build
        npm run start        # jalankan versi produksi secara LOKAL dulu
        `,
      ),
      p(
        'Dua perintah ini melakukan hal yang sangat berbeda meski sering diucapkan sebagai satu langkah. `npm run build` menghasilkan artefak — kode yang sudah dikompilasi, dipecah menjadi chunk, dan diminifikasi ke dalam `.next/`. `npm run start` menjalankan artefak itu; ia **tidak** membangun apa pun, sehingga menjalankannya tanpa build lebih dulu hanya akan menyajikan hasil build yang lama.',
      ),
      p(
        'Menjalankan pasangan ini di laptop sebelum deploy adalah cara termurah menangkap bug yang hanya ada di produksi. Yang paling sering muncul: hydration mismatch (HTML dari server berbeda dengan render pertama di klien), variabel environment yang ternyata hanya ada di berkas `.env.local`, dan impor yang salah huruf besar-kecil — yang lolos di macOS atau Windows tetapi gagal di server Linux yang membedakannya.',
      ),
      callout(
        'danger',
        '`npm run dev` bukan bukti apa pun',
        'Mode development memakai konfigurasi, penanganan error, dan optimasi yang berbeda. Bug yang hanya muncul di produksi adalah kategori tersendiri: hydration mismatch, variabel environment yang hilang, dan perbedaan huruf besar-kecil pada nama berkas. Selalu jalankan `npm run start` sekali sebelum deploy.',
      ),

      h2('Membaca keluarannya'),
      code(
        'text',
        `
        Route (app)                          Size  First Load JS
        ┌ ○ /                              1.2 kB         105 kB
        ├ ● /kelas/[category]/[chapter]     2.8 kB         112 kB
        ├ ƒ /api/artikel                      0 B            0 B
        └ ○ /pengaturan                     3.1 kB         108 kB

        + First Load JS shared by all                      98 kB

        ○  (Static)   prerendered as static content
        ●  (SSG)      prerendered using generateStaticParams
        ƒ  (Dynamic)  server-rendered on demand
        `,
      ),
      p(
        'Simbol di depan tiap rute adalah informasi terpenting di tabel ini. `○` berarti halaman dibangun sekali saat build dan disajikan sebagai berkas statis; `●` berarti sama, tetapi daftar halamannya dihasilkan `generateStaticParams` — itulah yang dipakai `/kelas/[category]/[chapter]`. `ƒ` berarti halaman di-render ulang **setiap permintaan** di server, yang wajar untuk `/api/artikel` tetapi menjadi tanda bahaya kalau muncul di halaman yang isinya sebenarnya tetap.',
      ),
      p(
        'Dua kolom angkanya juga tidak sama artinya. **Size** adalah JavaScript milik rute itu sendiri — 3,1 kB untuk `/pengaturan`. **First Load JS** adalah total yang harus diunduh pembaca sebelum halaman itu bisa dipakai, yaitu ukuran rute ditambah 98 kB bundle bersama yang tercantum di baris `shared by all`. Karena itu `/` yang hanya 1,2 kB tetap menuntut 105 kB: hampir seluruhnya bundle bersama, dan di situlah penghematan biasanya paling besar.',
      ),
      p(
        'Yang membuat keluaran ini layak dibaca tiap kali build adalah kemampuannya menangkap perubahan yang tidak menimbulkan gejala. Empat pola berikut adalah yang paling sering muncul.',
      ),
      ol(
        '**Rute yang seharusnya statis tapi bertanda `ƒ`** — ada yang memaksanya dinamis, biasanya `cookies()` atau `headers()` di layout yang jauh di atasnya.',
        '**First Load JS yang melonjak di satu rute** — hampir selalu satu impor yang menarik sesuatu besar.',
        '**Jumlah rute yang dihasilkan** — kalau `generateStaticParams` salah, angkanya jauh dari harapan.',
        '**Shared JS yang membesar** — sesuatu masuk ke bundle bersama padahal hanya dipakai satu halaman.',
      ),
      callout(
        'tip',
        'Website yang sedang kamu baca memakai keluaran ini sebagai alat audit',
        'Setiap penambahan materi diikuti pemeriksaan: apakah 377 rute masih semuanya `○`/`●`, dan apakah ukuran chunk berubah. Materi bertambah dari 122 ke 292 sub-bab tanpa satu byte pun masuk ke bundle pembaca — itu terlihat dari sini.',
      ),

      h2('Menemukan yang membengkak'),
      code(
        'bash',
        `
        npm install --save-dev @next/bundle-analyzer
        ANALYZE=true npm run build
        `,
      ),
      code(
        'ts',
        `
        // next.config.ts
        import withBundleAnalyzer from '@next/bundle-analyzer';

        export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })({
          reactStrictMode: true,
          poweredByHeader: false,
        });
        `,
      ),
      p(
        'Analyzer dipasang sebagai **pembungkus** konfigurasi, bukan sebagai perintah terpisah: `withBundleAnalyzer({...})(konfigurasiAsli)`. Bentuk fungsi-mengembalikan-fungsi itu yang membuat konfigurasi Next.js aslimu (`reactStrictMode`, `poweredByHeader`) tetap utuh — analyzer hanya menyisipkan langkah tambahan ke dalam proses build.',
      ),
      p(
        "`enabled: process.env.ANALYZE === 'true'` adalah sakelarnya, dan itulah alasan perintahnya ditulis `ANALYZE=true npm run build`. Tanpa variabel itu, build berjalan normal tanpa beban tambahan; dengan variabel itu, Next.js membuka laporan HTML interaktif yang menampilkan tiap modul sebagai kotak seluas ukurannya. Kotak besar yang tidak kamu kenali adalah tempat mencari terlebih dahulu.",
      ),

      h2('Penyebab bundle membengkak'),
      table(
        ['Penyebab', 'Perbaikan'],
        [
          ['Library berat di Client Component', 'Pindahkan ke Server Component'],
          ['Impor barrel (`index.ts`) yang luas', 'Impor langsung dari modulnya'],
          ['Data besar diimpor komponen klien', 'Bangun proyeksi di server, oper sebagai prop'],
          ['Widget berat selalu dimuat', '`next/dynamic` dengan `ssr: false`'],
          ['Moment.js, lodash penuh', '`date-fns`, fungsi native, impor per fungsi'],
          ['Ikon diimpor seluruh paketnya', 'Impor ikon satu per satu'],
        ],
      ),
      code(
        'ts',
        `
        // Menarik seluruh paket
        import { debounce } from 'lodash';

        // Hanya yang dipakai
        import debounce from 'lodash/debounce';

        // Atau tulis sendiri — sering hanya lima baris
        `,
      ),
      p(
        "Kedua baris impor itu menghasilkan fungsi `debounce` yang sama, tetapi jalur modulnya berbeda. `from 'lodash'` menunjuk berkas indeks yang mengekspor **ratusan** fungsi, dan bundler yang tidak bisa menghilangkan sisanya, sebab lodash versi CommonJS memang sulit di-tree-shake, ikut menyertakan semuanya. `from 'lodash/debounce'` menunjuk satu berkas, sehingga tidak ada sisa yang bisa terbawa.",
      ),
      p(
        'Pola yang sama berlaku untuk **impor barrel** yang disebut di tabel di atas: `index.ts` yang mengekspor ulang seluruh isi folder membuat satu impor kecil berpotensi menarik seluruh tetangganya. Sebelum memasang paket untuk sesuatu yang sederhana, periksa dulu apakah padanannya sudah ada di JavaScript modern — `debounce` sendiri memang beberapa baris saja, dan nol byte dependency.',
      ),
      callout(
        'danger',
        'Kebocoran bundle tidak menimbulkan gejala apa pun',
        'Tidak ada error, tidak ada peringatan, halamannya berfungsi normal — hanya makin mahal untuk pembaca, dan tumbuh setiap kali data bertambah. Website ini pernah mengalaminya: satu komponen klien mengimpor kurikulum, dan seluruh prosa setiap sub-bab ikut ke browser. Perbaikannya dikunci **tes**, bukan disiplin.',
      ),

      h2('Lazy-load yang berbayar'),
      code(
        'tsx',
        `
        import dynamic from 'next/dynamic';

        // Editor kode ratusan KB, tidak semua pembaca membukanya
        const Playground = dynamic(() => import('@/components/playground'), {
          loading: () => <SkeletonPlayground />,
          ssr: false,
        });
        `,
      ),
      p(
        '`dynamic()` mengubah impor biasa menjadi impor yang baru dijalankan saat komponennya benar-benar dirender. Akibatnya kode Playground pindah ke chunk terpisah yang tidak ikut diunduh saat halaman dibuka — pembaca yang tidak pernah membuka playground tidak pernah membayar ratusan KB itu.',
      ),
      p(
        'Dua opsi di dalamnya menutup dua akibat sampingannya. `loading: () => <SkeletonPlayground />` mengisi ruang selama chunk-nya diunduh, sehingga tata letak tidak melompat saat komponennya muncul. `ssr: false` mematikan render di server — perlu untuk komponen yang menyentuh `window` atau `document`, yang tidak ada di server dan akan menggagalkan build kalau dipaksa dirender di sana. Tabel berikut membatasi kapan teknik ini sepadan.',
      ),
      table(
        ['Layak', 'Tidak layak'],
        [
          ['Editor, grafik, peta, 3D', 'Tombol, kartu, komponen kecil'],
          ['Isi modal yang jarang dibuka', 'Apa pun di layar pertama'],
          ['Library > 50 KB', 'Library kecil — biaya muatnya lebih besar'],
        ],
      ),

      h2('Sebelum deploy'),
      code(
        'bash',
        `
        npm run build
        npm run start

        # Periksa header di server yang BENAR-BENAR berjalan
        curl -sI http://localhost:3000 | grep -iE "content-security-policy|x-powered-by"

        # Pastikan tidak ada rahasia di artefak
        grep -rE "sk_live|AKIA|-----BEGIN" .next/static/ && echo "RAHASIA DI BUNDLE"
        `,
      ),
      p(
        'Dua pemeriksaan terakhir sengaja dijalankan terhadap server yang **benar-benar berjalan**, bukan terhadap berkas konfigurasi. `curl -sI` hanya mengambil header responsnya (`-I`) tanpa mencetak progres (`-s`), lalu `grep -i` mencari dua hal: apakah `content-security-policy` benar-benar terkirim, dan apakah `x-powered-by` sudah hilang. Header yang tertulis rapi di `next.config.ts` tetapi tidak muncul di sini berarti ia tidak berlaku.',
      ),
      p(
        'Perintah `grep -rE` terakhir menyisir `.next/static/`, yaitu direktori yang seluruh isinya dikirim ke browser, untuk pola kunci Stripe (`sk_live`), kunci AWS (`AKIA`), dan kunci privat (`-----BEGIN`). Pemeriksaan ini paling berharga persis ketika ia tidak menemukan apa-apa, dan ia adalah versi lokal dari langkah yang sudah dipasang di pipeline CI pada bab sebelumnya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Build produksi mengubah kode sumber menjadi sesuatu yang bentuknya sangat berbeda, dan mengetahui apa yang dihasilkannya adalah satu-satunya cara menilai apakah halamanmu berat atau ringan.',
      ),
      code(
        'text',
        `
        Diperiksa sungguhan pada keluaran build project ini:

          berkas JavaScript klien : 30 berkas
          total JS klien          : 1.823,4 KB
          chunk terbesar          :   653,4 KB
          lima terbesar           : 653,4 / 222,2 / 169,0 / 146,9 / 140,7 KB

          halaman HTML dihasilkan : 506 berkas, 108,1 MB
          halaman terbesar        : 487,8 KB
        `,
        {
          caption:
            'Angka 108,1 MB itu ada di server, bukan di peramban. Yang diunduh pengunjung jauh lebih kecil.',
        },
      ),
      p(
        'Selisih antara ukuran di disk dan ukuran yang benar-benar diunduh adalah kompresi, dan besarnya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur di Chrome 149 terhadap build produksi ini:

          halaman terbesar, 487,8 KB di disk
            -> 56,1 KB di kabel

        Delapan koma tujuh kali lebih kecil. Itulah sebabnya ukuran
        berkas HTML jarang menjadi masalah, dan ukuran JavaScript
        hampir selalu menjadi masalah: HTML terkompresi dengan sangat
        baik, sementara JavaScript harus diurai dan dijalankan setelah
        didekompresi.
        `,
      ),
      p(
        'Pertanyaan yang paling menentukan bukan berapa besar totalnya melainkan **apa yang ikut ke sisi klien**, dan itu bisa diperiksa langsung.',
      ),
      code(
        'text',
        `
        Diperiksa pada build ini:

          string materi kurikulum di .next/static (KLIEN)  : 0 berkas
          string materi kurikulum di .next/server (SERVER) : 1.250 berkas

        Ratusan megabyte isi pelajaran ada di sisi server, dan tidak
        satu byte pun diunduh peramban sebagai data. Yang sampai ke
        peramban hanyalah HTML hasil rendernya.

        Cara memeriksanya di project mana pun:
          grep -rl "kata-yang-dicari" .next/static | wc -l
        `,
        {
          caption:
            'Satu perintah itu menjawab pertanyaan "apakah data ini bocor ke bundel klien" dengan pasti.',
        },
      ),
      p(
        'Untuk menemukan apa yang membuat sebuah bundel besar, alat yang tepat adalah penganalisis bundel, dan cara membacanya punya satu aturan.',
      ),
      code(
        'text',
        `
        Yang perlu dicari di peta bundel, berurutan:

          1. pustaka yang ikut UTUH padahal dipakai satu fungsinya
          2. pustaka yang ada DUA versi berbeda sekaligus
          3. data statis besar yang di-import langsung
          4. berkas lokal dan zona waktu yang ikut semuanya
          5. ikon yang di-import satu per satu dari paket besar

        Nomor 2 sering mengejutkan. Periksa dengan:
          npm ls <nama-paket>
        Bila muncul di beberapa tempat dengan versi berbeda, keduanya
        ikut ke bundel.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Build produksi menemukan kesalahan yang tidak pernah muncul saat pengembangan, dan itu memang tujuannya.',
      ),
      code(
        'text',
        `
        1. Jalan di dev, gagal di build

           ReferenceError: window is not defined
           ReferenceError: document is not defined
           ReferenceError: localStorage is not defined

           Kode itu berjalan di SERVER saat prarender. Server tidak
           punya window. Perbaikan: pindahkan ke dalam useEffect,
           atau tandai komponennya sebagai komponen klien.

        2. Type error yang tidak terlihat di dev

           Server pengembangan sering melewati pemeriksaan tipe demi
           kecepatan. Build menjalankannya penuh.
           Diukur pada project ini: type-check sendirian 2.403 ms —
           murah untuk dijalankan sebelum build 64.834 ms.

        3. Import yang tidak terpakai menjadi error

           Di dev hanya peringatan, di build bisa menggagalkan.
           Ini perilaku yang benar: bundel produksi tidak boleh
           membawa apa yang tidak dipakai.
        `,
      ),
      p(
        'Kelas kedua adalah build yang berhasil dengan hasil yang buruk, dan ini yang tidak menghasilkan pesan apa pun.',
      ),
      code(
        'text',
        `
        Pola yang membuat bundel membengkak tanpa satu pun peringatan:

          import _ from 'lodash';
          const hasil = _.groupBy(data, 'kategori');
            -> seluruh lodash ikut

          import { groupBy } from 'lodash-es';
            -> hanya yang dipakai, bila bundler bisa tree-shake

          import moment from 'moment';
          moment().format('DD MMMM YYYY');
            -> moment beserta SELURUH berkas lokalnya
            -> ganti dengan Intl.DateTimeFormat bawaan peramban

          import * as Icons from 'paket-ikon';
          <Icons.Panah />
            -> seluruh paket ikon ikut. Import satu per satu.
        `,
      ),
      p(
        'Ada juga kegagalan build yang penyebabnya bukan kode sama sekali, dan bentuknya khas pada mesin dengan memori terbatas.',
      ),
      code(
        'text',
        `
        Ditemukan sungguhan pada project ini:

          Beberapa halaman melebihi batas waktu prarender 60 detik,
          termasuk halaman yang tidak diubah sama sekali.

        Yang diukur lebih dulu, sebelum menuduh halamannya:
          penyorotan kode seluruh 427 halaman : 5.785 ms total
          rata-rata per halaman               :    14 ms
          halaman yang GAGAL                  :    30 ms

        Halaman yang gagal TIDAK lambat. Yang diukur berikutnya:
          CPU 4, swap 0, memori tersisa ~1,1 GB
          Next menjalankan 3 worker, ditambah basis data, peramban,
          dan editor yang sudah berjalan
          load average saat gagal: 12,84 pada mesin 4 CPU

        Satu perubahan, satu variabel:
          CIRCLE_NODE_TOTAL=2 npm run build
          -> EXIT=0, 506 halaman, 15,9 detik
        `,
        {
          caption:
            'Pesan timeout menyebut waktu. Waktu bisa habis karena pekerjaannya berat, atau karena mesinnya berebut.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Build produksi adalah tahap yang paling sering diperlakukan sebagai formalitas, dan hasilnyalah yang benar-benar dipakai orang.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menilai berat halaman dari ukuran berkas HTML',
            'Itu yang paling besar',
            'Diukur, 487,8 KB menjadi 56,1 KB setelah kompresi. Yang menentukan adalah JavaScript',
          ],
          [
            'Mengimpor pustaka secara utuh untuk satu fungsi',
            'Toh yang dipakai cuma satu',
            'Seluruh pustakanya ikut bila tidak bisa di-tree-shake. Tidak ada peringatan apa pun',
          ],
          [
            'Menganggap data yang dipakai merender ikut ke klien',
            'Kan dipakai di komponen',
            'Diperiksa, 0 berkas di `.next/static` memuat isi materi. Server Component menahannya di server',
          ],
          [
            'Menjalankan `build` sebelum `type-check`',
            'Build kan sudah memeriksa tipe',
            'Diukur, type-check 2,4 detik melawan build 64,8 detik. Jalankan yang murah lebih dulu',
          ],
          [
            'Menyimpulkan halamannya lambat dari pesan timeout',
            'Pesannya menyebut waktu',
            'Diukur, halaman yang gagal hanya 30 ms. Penyebabnya memori mesin, bukan halamannya',
          ],
          [
            'Tidak pernah melihat isi bundel',
            'Yang penting build-nya berhasil',
            'Bundel membengkak diam-diam. Jalankan penganalisis bundel sekali setiap beberapa rilis',
          ],
        ],
      ),
      p(
        'Satu kebiasaan murah menutup sebagian besar baris di tabel itu, yaitu mencatat ukuran bundel di setiap rilis dan membandingkannya. Kenaikan lima kilobyte tidak berarti apa-apa, dan kenaikan tiga ratus kilobyte pada satu rilis selalu punya sebab yang bisa ditemukan pada hari itu juga. Menemukannya enam bulan kemudian, setelah dua puluh rilis, jauh lebih mahal.',
      ),
      references(
        {
          label: 'Deploying',
          href: 'https://nextjs.org/docs/app/getting-started/deploying',
          source: 'Next.js Docs',
          note: 'Apa yang dihasilkan build produksi dan pilihan cara menjalankannya',
        },
        {
          label: 'next CLI',
          href: 'https://nextjs.org/docs/app/api-reference/cli/next',
          source: 'Next.js Docs',
          note: 'Beda perintah membangun dan menjalankan, beserta opsi keduanya',
        },
        {
          label: 'Build, release, run',
          href: 'https://12factor.net/build-release-run',
          source: 'Twelve-Factor App',
          note: 'Kenapa artefak dibangun sekali lalu dipromosikan, bukan dibangun ulang per lingkungan',
        },
      ),
    ],
  ),

  written(
    'deploy-vercel',
    'Deploy ke Vercel',
    16,
    'Jalur termudah untuk Next.js, beserta yang perlu kamu ketahui.',
    [
      p(
        'Vercel dibuat oleh tim yang sama dengan Next.js, jadi fitur baru selalu didukung lebih dulu di sana. Untuk sebagian besar project Next.js ia pilihan yang paling sedikit gesekan — dengan catatan yang perlu disadari sejak awal.',
      ),

      terms(
        {
          term: 'platform terkelola',
          meaning:
            'Layanan yang menangani server, penskalaan, sertifikat, dan jaringan pengiriman untukmu, sehingga yang kamu urus tinggal kodenya. Harganya kendali yang lebih sedikit dan keterikatan pada cara kerja penyedianya.',
        },
        {
          term: 'Git integration',
          meaning:
            'Sambungan antara repository dan platform hosting, sehingga tiap push memicu build dan deploy tanpa perintah manual. Inilah yang membuat branch utama selalu mencerminkan apa yang sedang tayang.',
        },
        {
          term: 'production deployment',
          meaning:
            'Hasil deploy yang dipasangkan ke domain utama dan dilihat pengguna. Di platform berbasis Git, biasanya berasal dari branch utama.',
        },
        {
          term: 'preview deployment',
          meaning:
            'Hasil deploy per pull request dengan alamat sendiri yang berumur pendek, dipakai untuk meninjau perubahan sebelum digabungkan. Menggantikan kebutuhan staging permanen pada banyak project.',
        },
        {
          term: 'immutable deployment',
          meaning:
            'Sifat tiap hasil deploy yang tetap ada dan bisa diakses lewat alamat uniknya sendiri meski sudah tidak menjadi versi produksi. Inilah yang membuat rollback berarti mengarahkan domain ke deploy lama, bukan membangun ulang kode lama.',
        },
        {
          term: 'build command',
          meaning:
            'Perintah yang dijalankan platform untuk membangun projectmu, misalnya `npm run build`. Dideteksi otomatis pada framework yang dikenal, dan bisa ditimpa bila projectmu tidak mengikuti bentuk bawaan.',
        },
        {
          term: 'environment per lingkungan',
          meaning:
            'Pemisahan nilai variabel antara production, preview, dan development di platform. Yang sering keliru adalah menyamakan ketiganya, sehingga preview menulis ke basis data produksi.',
        },
        {
          term: 'edge network',
          meaning:
            'Jaringan server yang tersebar di banyak lokasi, menyajikan isi dari titik yang paling dekat dengan pengunjung. Yang dipersingkat bukan kecepatan jaringannya melainkan jarak tempuhnya, dan itu paling terasa pada permintaan pertama.',
        },
      ),

      h2('Langkahnya'),
      steps(
        {
          title: '1. Hubungkan repositori',
          body: 'Vercel mendeteksi Next.js otomatis. Perintah build dan direktori keluaran tidak perlu diatur.',
        },
        {
          title: '2. Isi environment variable',
          body: 'Per lingkungan: Production, Preview, Development. Nilai yang berbeda per lingkungan — terutama URL API dan kredensial.',
        },
        {
          title: '3. Deploy pertama',
          body: 'Setiap push ke branch utama men-deploy ke produksi; setiap PR mendapat preview deployment sendiri.',
        },
        {
          title: '4. Pasang domain',
          body: 'Tambahkan domain, arahkan DNS, sertifikat HTTPS diurus otomatis.',
        },
      ),

      h2('Preview deployment'),
      code(
        'text',
        `
        main            -> https://app.contoh.com
        PR #42          -> https://app-git-fitur-ekspor-tim.vercel.app
        commit a1b2c3d  -> https://app-a1b2c3d-tim.vercel.app
        `,
      ),
      p(
        'Tiga baris itu adalah tiga jenis URL dengan umur berbeda. Baris pertama adalah domain produksi yang selalu menunjuk deployment terkini. Baris kedua adalah URL **per branch** — ia berpindah mengikuti commit terbaru di branch itu, sehingga tautan di komentar PR selalu menampilkan versi terakhir.',
      ),
      p(
        'Baris ketiga yang paling sering terlupa: setiap commit juga mendapat URL permanennya sendiri (`app-a1b2c3d-tim`). Itu berarti setiap versi yang pernah dibangun tetap bisa dibuka selamanya — sangat berguna untuk membandingkan "sebelum dan sesudah", dan sekaligus alasan peringatan berikut. Deployment lama yang memuat data sungguhan tetap terjangkau meski PR-nya sudah lama ditutup.',
      ),
      callout(
        'danger',
        'Preview deployment bisa terjangkau publik',
        'URL-nya sulit ditebak, tapi "sulit ditebak" bukan kontrol akses — ia muncul di komentar PR, di log, dan di header `Referer`. Kalau preview memakai data sungguhan, nyalakan **Deployment Protection**. Lebih baik lagi: preview memakai database terpisah dengan data yang disamarkan.',
      ),

      h2('Environment variable'),
      code(
        'bash',
        `
        vercel env add DATABASE_URL production
        vercel env add NEXT_PUBLIC_API_URL production
        vercel env pull .env.local        # tarik ke lokal untuk pengembangan
        `,
      ),
      p(
        'Kata `production` di ujung dua perintah pertama adalah **targetnya**, dan ia wajib disebut karena Vercel menyimpan nilai terpisah untuk Production, Preview, dan Development. Menambahkan variabel tanpa memikirkan target adalah cara paling umum sebuah preview deployment tanpa sengaja menunjuk database produksi.',
      ),
      p(
        'Perhatikan dua nama variabel di sana punya sifat yang berlawanan. `DATABASE_URL` hanya dibaca di server dan tidak pernah sampai ke browser. `NEXT_PUBLIC_API_URL`, karena awalan `NEXT_PUBLIC_`, **ditanam ke dalam bundle** saat build dan bisa dibaca siapa pun yang membuka halamanmu, jadi jangan pernah menaruh rahasia di belakang awalan itu. `vercel env pull` menarik nilai-nilai tersebut ke `.env.local` supaya pengembangan lokal memakai konfigurasi yang sama, dan berkas itu harus ada di `.gitignore`.',
      ),
      callout(
        'warning',
        'Mengubah `NEXT_PUBLIC_*` menuntut build ulang',
        'Nilainya ditanam ke bundle saat build. Mengubahnya di dasbor **tidak** mengubah aplikasi yang sudah berjalan — kamu harus men-deploy ulang. Ini konsekuensi langsung dari perbedaan build-time dan runtime di sub-bab 1.2.',
      ),

      h2('Yang perlu disadari'),
      table(
        ['Hal', 'Catatan'],
        [
          ['Batas waktu fungsi', '10 detik di paket gratis, bisa dinaikkan berbayar'],
          ['Sistem berkas', '**Read-only** kecuali `/tmp` — tidak ada penyimpanan permanen'],
          ['Cold start', 'Permintaan pertama setelah idle lebih lambat'],
          ['Koneksi database', 'Serverless membuka banyak koneksi — perlu connection pooler'],
          ['Pekerjaan latar', 'Tidak ada proses yang hidup terus — pakai layanan antrean terpisah'],
          ['Harga', 'Berdasarkan pemakaian; trafik tinggi bisa mahal'],
        ],
      ),
      callout(
        'danger',
        'Koneksi database adalah jebakan serverless yang paling sering',
        'Setiap instance fungsi membuka koneksinya sendiri. Pada trafik tinggi, ratusan instance berarti ratusan koneksi — dan Postgres kehabisan slot, lalu **seluruh** aplikasi gagal, termasuk yang tidak ada hubungannya. Pakai connection pooler seperti PgBouncer, Supabase Pooler, atau Prisma Accelerate.',
      ),
      code(
        'bash',
        `
        # Postgres di serverless: pakai URL pooler, bukan koneksi langsung
        DATABASE_URL="postgresql://...@pooler.contoh.com:6543/app?pgbouncer=true"
        DIRECT_URL="postgresql://...@db.contoh.com:5432/app"   # untuk migrasi
        `,
      ),
      p(
        'Dua URL untuk satu database yang sama, dan bedanya ada pada porta serta host. `DATABASE_URL` menunjuk **pooler** di porta `6543` — satu perantara yang memegang sedikit koneksi sungguhan ke Postgres, lalu membagikannya bergantian ke ratusan instance fungsi. Itulah yang mencegah Postgres kehabisan slot koneksi saat trafik melonjak.',
      ),
      p(
        '`DIRECT_URL` menunjuk database langsung di porta `5432`, dan ia tetap diperlukan karena **migrasi** tidak bisa lewat pooler. Perintah seperti `CREATE INDEX` atau perubahan skema butuh satu sesi yang stabil dari awal sampai akhir, sedangkan pooler dalam mode transaksi bisa memindahkan perintahmu ke koneksi lain di tengah jalan. Parameter `?pgbouncer=true` di URL pertama memberi tahu Prisma untuk mematikan prepared statement, yang juga tidak cocok dengan mode itu.',
      ),

      h2('Kapan Vercel bukan pilihan terbaik'),
      ul(
        'Butuh proses yang hidup terus — WebSocket, pekerja antrean.',
        'Butuh sistem berkas yang bisa ditulis.',
        'Trafik sangat tinggi dengan anggaran terbatas.',
        'Ada kewajiban menyimpan data di wilayah tertentu.',
        'Backend dan frontend ingin di-deploy sebagai satu kesatuan.',
      ),

      h2('Rollback'),
      code(
        'bash',
        `
        vercel rollback                          # ke deployment sebelumnya
        vercel promote <url-deployment>          # promosikan deployment tertentu
        `,
      ),
      p(
        'Keduanya cepat karena tidak ada yang dibangun ulang. Setiap deployment sudah tersimpan utuh sebagai artefak beserta URL permanennya — yang berubah hanyalah **ke mana domain produksi menunjuk**. Itu sebabnya rollback frontend biasanya selesai dalam hitungan detik, bukan selama proses build.',
      ),
      p(
        'Bedanya: `vercel rollback` mundur satu langkah ke deployment sebelumnya, sedangkan `vercel promote <url>` menunjuk deployment **mana pun** yang pernah ada. Yang kedua lebih tepat saat masalahnya baru ketahuan beberapa rilis kemudian, karena "sebelumnya" ternyata juga sudah membawa bug yang sama.',
      ),
      callout(
        'tip',
        'Rollback frontend itu instan — rollback database tidak',
        'Vercel menyimpan setiap deployment, jadi kembali ke versi sebelumnya hanya soal menunjuk yang mana. Yang **tidak** bisa dibatalkan begitu saja adalah migrasi database yang sudah berjalan. Itulah alasan pola expand–migrate–contract di sub-bab 4.4.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Yang membuat platform seperti Vercel berbeda dari server biasa bukan kemudahan mengunggahnya melainkan apa yang terjadi pada setiap jenis halaman. Satu aplikasi Next.js menghasilkan beberapa jenis keluaran sekaligus, dan masing-masing dilayani dengan cara yang berbeda.',
      ),
      code(
        'text',
        `
        Keluaran build project ini, dibaca dari laporannya:

          ○ (Static)  dirender saat build, disajikan dari CDN
          ● (SSG)     dirender saat build dari generateStaticParams
          ƒ (Dynamic) dirender saat permintaan tiba

        Dan jumlahnya, diukur:
          506 halaman dihasilkan saat build
          termasuk 440 halaman pelajaran dari generateStaticParams

        Halaman-halaman itu tidak memanggil server saat dibuka. Ia
        sudah berupa berkas HTML jadi.
        `,
      ),
      p('Akibatnya terlihat pada waktu tanggapan, dan itu bisa diukur di peramban sungguhan.'),
      code(
        'text',
        `
        Diukur di Chrome 149 terhadap build produksi ini, dilayani
        dari mesin lokal:

          Beranda
            TTFB 12 ms   FCP 244 ms   LCP 332 ms   CLS 0
          Halaman pelajaran terbesar (487,8 KB HTML)
            TTFB 13 ms   FCP 232 ms   LCP 232 ms   CLS 0
          Roadmap
            TTFB  6 ms   FCP 144 ms   LCP 144 ms   CLS 0

        Ambang "baik" untuk LCP adalah di bawah 2.500 ms, dan untuk
        CLS di bawah 0,1. Ketiganya jauh di bawah ambang itu.
        `,
        {
          caption:
            'Angka ini dari jaringan lokal tanpa latensi. Di internet sungguhan, TTFB-nya ditentukan jarak ke CDN terdekat.',
        },
      ),
      p(
        'Bagian terakhir itu yang menjelaskan nilai sebenarnya dari CDN. Halaman statis yang sudah jadi bisa disalin ke banyak lokasi, sehingga pengunjung mengambilnya dari tempat terdekat, bukan dari satu server di satu benua.',
      ),
      table(
        ['Jenis', 'Dirender kapan', 'Dilayani dari', 'Berubah bila'],
        [
          ['Static', 'Saat build', 'CDN', 'Build ulang'],
          [
            'SSG + revalidate',
            'Saat build, diperbarui berkala',
            'CDN',
            'Setelah masa revalidate lewat',
          ],
          ['Dynamic', 'Setiap permintaan', 'Fungsi server', 'Setiap kali'],
          ['Client-only', 'Di peramban', 'CDN untuk kerangkanya', 'Setiap kali komponennya jalan'],
        ],
      ),
      p(
        'Memilih di antara keempatnya adalah keputusan produk, bukan keputusan teknis, dan pertanyaannya selalu sama, yaitu seberapa basi isi halaman ini masih boleh dilihat pengunjung.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang paling sering pada platform seperti ini terjadi saat build, bukan saat berjalan, dan penyebabnya hampir selalu perbedaan lingkungan.',
      ),
      code(
        'text',
        `
        1. Jalan di lokal, gagal saat build di platform

           Error: Cannot find module './Header'

           Mesin build memakai Linux yang membedakan huruf besar kecil.
           Berkasnya bernama header.tsx.

        2. Variabel environment tidak ada saat build

           Error: Environment variable DATABASE_URL is not defined
           saat "Collecting page data"

           Halaman statis dirender SAAT BUILD, jadi variabel yang
           dipakainya harus tersedia di lingkungan BUILD, bukan hanya
           di runtime. Bila itu rahasia produksi, biasanya yang salah
           adalah halamannya yang seharusnya tidak statis.

        3. Build berhasil, halamannya kosong

           Data diambil di dalam useEffect, dan saat prarender tidak
           ada yang menjalankannya. HTML yang dihasilkan kosong, lalu
           terisi setelah JavaScript berjalan.
           Akibatnya: LCP buruk, dan mesin pencari melihat halaman kosong.
        `,
      ),
      p(
        'Kelas kedua berupa halaman yang bekerja dengan benar dan menampilkan data yang basi, dan ini yang paling membingungkan karena tidak ada yang salah secara teknis.',
      ),
      code(
        'text',
        `
        "Datanya sudah saya ubah, halamannya masih yang lama"

        Tiga kemungkinan, dan ketiganya berbeda penanganannya:

          a. Halamannya STATIS, dirender saat build
             -> harus build ulang, atau pakai revalidate

          b. Halamannya punya revalidate: 3600
             -> ia akan diperbarui dalam satu jam. Untuk segera,
                panggil revalidatePath atau revalidateTag

          c. CDN masih menyimpan salinan lama
             -> periksa header respons:
                  curl -sI https://app.contoh.id/ | grep -i 'cache\\|age'
                Header age menunjukkan berapa detik salinan itu
                sudah tersimpan
        `,
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang khas fungsi server tanpa keadaan:

          "Kadang cepat, kadang tiga detik"

          Fungsi yang lama tidak dipanggil harus dinyalakan lagi dari
          nol. Namanya cold start. Yang memperburuknya:
            - bundel fungsi yang besar
            - koneksi basis data yang dibuka ulang setiap kali
            - inisialisasi berat di tingkat modul

          Yang meringankannya: pakai pooling koneksi yang memang
          dirancang untuk lingkungan tanpa keadaan, dan jaga bundel
          fungsinya tetap kecil.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Platform yang mengurus banyak hal sekaligus membuat batas tanggung jawabnya kabur, dan di situlah kesalahannya berkumpul.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengambil data di `useEffect` untuk halaman publik',
            'Itu cara yang biasa di React',
            'Saat prarender tidak ada yang menjalankannya. HTML-nya kosong, LCP buruk, mesin pencari melihat halaman kosong',
          ],
          [
            'Menaruh rahasia di variabel ber-awalan publik',
            'Supaya bisa dipakai di komponen',
            'Awalan itu menandai nilai yang ditanam ke bundel klien. Ia bukan rahasia lagi',
          ],
          [
            'Mengubah variabel environment lalu me-redeploy saja',
            'Nilainya kan sudah diganti',
            'Nilai yang ditanam saat build butuh BUILD ULANG, bukan sekadar penyebaran ulang',
          ],
          [
            'Menganggap halaman selalu dirender saat diminta',
            'Kan aplikasinya dinamis',
            'Diukur, 506 halaman project ini dirender saat build. Perubahan data tidak terlihat tanpa revalidate',
          ],
          [
            'Memakai `revalidate` sangat kecil untuk semua halaman',
            'Biar selalu segar',
            'Itu menghapus manfaat CDN dan memindahkan bebannya ke fungsi server. Pilih per halaman',
          ],
          [
            'Menyimpulkan lambatnya dari satu pengukuran',
            'Sudah dicoba dan lambat',
            'Cold start membuat panggilan pertama jauh lebih lambat. Ukur beberapa kali, dan pisahkan yang pertama',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan terus terang bahwa penyebaran ke platform itu sendiri **tidak dijalankan** dalam penyusunan materi ini, sebab memerlukan akun penyedia. Yang **dijalankan sungguhan** adalah build produksinya, penghitungan 506 halaman yang dihasilkan, dan pengukuran Core Web Vitals di Chrome 149 terhadap hasil build itu yang dilayani dari mesin lokal. Angka TTFB di situ mencerminkan jaringan lokal, dan itu dinyatakan apa adanya alih-alih disajikan seolah berasal dari internet.',
      ),
      references(
        {
          label: 'Preview Deployments',
          href: 'https://vercel.com/docs/deployments/preview-deployments',
          source: 'Vercel Docs',
          note: 'Alur deploy per pull request beserta alamat uniknya',
        },
        {
          label: 'Environment Variables',
          href: 'https://vercel.com/docs/projects/environment-variables',
          source: 'Vercel Docs',
          note: 'Pemisahan nilai antara production, preview, dan development',
        },
        {
          label: 'Vercel CLI',
          href: 'https://vercel.com/docs/cli',
          source: 'Vercel Docs',
          note: 'Cara melakukan hal yang sama dari baris perintah, berguna untuk memahami mekanismenya',
        },
        {
          label: 'Deploying',
          href: 'https://nextjs.org/docs/app/getting-started/deploying',
          source: 'Next.js Docs',
          note: 'Pilihan selain platform terkelola, sebagai pembanding',
        },
      ),
    ],
  ),

  written(
    'alternatif-hosting',
    'Alternatif: Netlify, Cloudflare Pages, self-host',
    19,
    'Pilihan lain, dan trade-off yang sebenarnya.',
    [
      terms(
        {
          term: 'self-hosting',
          meaning:
            'Menjalankan aplikasi di server yang kamu kelola sendiri, entah mesin virtual sewaan atau mesin fisik. Memberi kendali penuh, dengan konsekuensi kamu juga yang mengurus pembaruan sistem, sertifikat, pemantauan, dan pemulihan saat gagal.',
        },
        {
          term: 'VPS',
          meaning:
            'Singkatan *Virtual Private Server*, mesin virtual sewaan dengan sistem operasi penuh yang kamu kendalikan. Dibaca huruf per huruf. Titik tengah antara hosting bersama dan mesin fisik sendiri.',
        },
        {
          term: 'static hosting',
          meaning:
            'Menyajikan berkas HTML, CSS, dan JavaScript yang sudah jadi tanpa proses server apa pun. Paling murah dan paling tahan beban, dengan syarat aplikasimu memang tidak butuh pemrosesan di server saat permintaan datang.',
        },
        {
          term: 'standalone output',
          meaning:
            'Mode build yang menghasilkan folder berisi aplikasi beserta dependensi yang benar-benar dipakai saja, supaya bisa dijalankan tanpa memasang seluruh `node_modules`. Berguna untuk image container yang kecil.',
        },
        {
          term: 'process manager',
          meaning:
            'Program yang menjaga aplikasimu tetap hidup, menyalakannya kembali bila mati, dan menjalankannya otomatis saat mesin menyala. Contohnya systemd dan PM2. Tanpa ini, satu kegagalan berarti aplikasi mati sampai ada yang menyadarinya.',
        },
        {
          term: 'vendor lock-in',
          meaning:
            'Keterikatan pada satu penyedia karena kamu memakai fitur yang tidak ada padanannya di tempat lain. Bukan selalu buruk, tetapi perlu keputusan sadar, sebab biaya pindahnya baru terasa ketika kamu sudah ingin pindah.',
        },
        {
          term: 'cold start',
          meaning:
            'Jeda tambahan saat sebuah fungsi atau container harus dinyalakan lebih dulu karena sedang tidak ada yang berjalan. Muncul pada model penagihan per pemakaian yang mematikan proses saat sepi.',
        },
        {
          term: 'egress',
          meaning:
            'Lalu lintas data yang keluar dari penyedia menuju pengguna. Sering menjadi komponen biaya yang tidak diperkirakan, terutama untuk situs yang menyajikan gambar atau video besar.',
        },
      ),

      h2('Perbandingan'),
      table(
        ['', 'Vercel', 'Cloudflare', 'Netlify', 'Self-host'],
        [
          ['Dukungan Next.js', 'Terbaik', 'Baik', 'Baik', 'Penuh'],
          ['Runtime', 'Node + Edge', 'Workers', 'Node + Edge', 'Node penuh'],
          ['Proses hidup terus', 'Tidak', 'Tidak', 'Tidak', '**Ya**'],
          ['Sistem berkas', '`/tmp` saja', 'Tidak ada', '`/tmp` saja', '**Penuh**'],
          ['Biaya trafik tinggi', 'Mahal', '**Murah**', 'Sedang', 'Tetap'],
          ['Kendali', 'Rendah', 'Rendah', 'Rendah', '**Penuh**'],
          ['Beban operasional', 'Nol', 'Nol', 'Nol', '**Kamu**'],
        ],
      ),

      h2('Cloudflare Pages / Workers'),
      code(
        'bash',
        `
        npm install --save-dev @opennextjs/cloudflare
        npx opennextjs-cloudflare build
        npx wrangler deploy
        `,
      ),
      p(
        'Adaptor `@opennextjs/cloudflare` ada karena Next.js tidak berjalan begitu saja di Workers. Perintah `opennextjs-cloudflare build` mengambil hasil build Next.js yang biasa lalu **membungkusnya ulang** ke bentuk yang dimengerti runtime Workers; `wrangler deploy` yang kemudian mengunggahnya. Lapisan tambahan ini juga alasan fitur Next.js terbaru kadang butuh waktu sebelum didukung di sini.',
      ),
      callout(
        'warning',
        'Workers bukan Node.js',
        'Ia berjalan di runtime berbasis V8 dengan API mirip browser. Modul Node seperti `fs`, `net`, dan `child_process` tidak ada, dan sebagian paket npm yang bergantung padanya tidak akan berjalan. Periksa dependency-mu sebelum memilih jalur ini.',
      ),

      h2('Self-host dengan Node'),
      code(
        'bash',
        `
        # Di server
        git clone <repo> /var/www/app && cd /var/www/app
        npm ci
        npm run build

        # Jalankan dengan manajer proses supaya otomatis menyala ulang
        pm2 start npm --name app -- start
        pm2 save
        pm2 startup
        `,
      ),
      code(
        'text',
        `
        # Nginx di depannya
        server {
            listen 443 ssl http2;
            server_name app.contoh.com;

            location /_next/static/ {
                alias /var/www/app/.next/static/;
                expires 1y;
                add_header Cache-Control "public, immutable";
            }

            location / {
                proxy_pass http://127.0.0.1:3000;
                proxy_set_header Host $host;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
            }
        }
        `,
      ),
      p(
        'Tiga perintah `pm2` di potongan pertama menyelesaikan tiga masalah berbeda. `pm2 start` menjalankan aplikasi dan menyalakannya kembali kalau prosesnya mati. `pm2 save` menyimpan daftar proses yang sedang berjalan; `pm2 startup` memasang layanan systemd yang memulihkan daftar itu **setelah server reboot**. Tanpa dua perintah terakhir, aplikasimu tidak menyala lagi setelah server dimulai ulang — dan itu biasanya baru ketahuan pada saat yang paling tidak menyenangkan.',
      ),
      p(
        'Di konfigurasi Nginx, blok `location /_next/static/` sengaja diletakkan **di atas** `location /`. Nginx menyajikan berkas statis itu langsung dari disk tanpa melewati Node sama sekali — jauh lebih cepat, dan aman diberi `expires 1y` karena nama berkasnya mengandung hash yang berubah setiap build. Itulah arti `immutable`: berkas dengan nama itu tidak akan pernah berubah isinya.',
      ),
      p(
        'Tiga baris `proxy_set_header` menjaga informasi yang hilang begitu permintaan melewati proxy. Tanpa `X-Forwarded-Proto $scheme`, aplikasi Next.js di belakang Nginx melihat permintaan datang sebagai HTTP biasa — sehingga redirect yang ia bentuk bisa mengarah ke `http://`, dan cookie bertanda `Secure` tidak terkirim. `X-Forwarded-For` membawa IP asli pengunjung, yang dibutuhkan untuk rate limiting dan log; tanpanya, semua permintaan terlihat berasal dari `127.0.0.1`.',
      ),

      h2('Output `standalone`'),
      code(
        'ts',
        `
        // next.config.ts — hanya menyertakan dependency yang benar-benar dipakai
        export default { output: 'standalone' };
        `,
      ),
      code(
        'bash',
        `
        # Hasilnya jauh lebih kecil — berguna untuk container
        node .next/standalone/server.js
        `,
      ),
      p(
        "`output: 'standalone'` menyuruh Next.js menelusuri impor yang benar-benar dipakai lalu menyalin **hanya** berkas itu ke `.next/standalone/`, lengkap dengan `server.js` kecil yang menjalankannya. Hasilnya: `node_modules` tidak perlu ikut dikirim sama sekali, dan image container yang tadinya ratusan MB bisa turun drastis.",
      ),
      p(
        'Ini persis mekanisme di balik Dockerfile Node pada bab Docker, yang tahap runtime-nya hanya menyalin `.next/standalone`, `.next/static`, dan `public`. Perhatikan perintah menjalankannya juga berubah: bukan `npm run start` lagi, melainkan `node .next/standalone/server.js` — karena skrip npm dan seluruh `node_modules` yang ia butuhkan memang tidak ikut.',
      ),

      h2('Ekspor statis'),
      code(
        'ts',
        `
        export default { output: 'export' };
        `,
      ),
      p(
        'Satu baris ini mengubah `npm run build` menjadi penghasil **berkas HTML biasa** di direktori `out/`, tanpa server Node sama sekali. Hasilnya bisa diunggah ke penyimpanan statis mana pun seperti GitHub Pages, S3, atau Cloudflare Pages, dan biayanya mendekati nol karena tidak ada proses yang perlu hidup.',
      ),
      p(
        'Harga yang dibayar disebut di peringatan berikut, dan ia besar, sebab semua yang membutuhkan server saat permintaan datang ikut hilang. Aturan sederhananya, kalau setiap pengunjung melihat isi yang sama dan tidak ada yang perlu login, ekspor statis adalah pilihan termurah, sedangkan begitu ada satu halaman yang isinya bergantung pada siapa yang membukanya, jalur ini tertutup.',
      ),
      callout(
        'warning',
        'Ekspor statis mematikan banyak fitur',
        'Tidak ada Route Handler, tidak ada Server Action, tidak ada middleware, tidak ada ISR, dan `next/image` butuh loader kustom. Ia cocok untuk situs yang benar-benar statis seperti dokumentasi, blog, dan landing page, tetapi tidak cocok untuk aplikasi.',
      ),

      h2('Yang sering diremehkan pada self-host'),
      ul(
        'Sertifikat TLS beserta pembaruannya.',
        'Pembaruan keamanan sistem operasi.',
        'Pemantauan, alert, dan rotasi log.',
        'Cadangan dan **uji pemulihannya**.',
        'Deploy tanpa downtime.',
        'Pertahanan DDoS.',
      ),
      callout(
        'tip',
        'Hitung biayanya dalam waktu, bukan hanya uang',
        'VPS seharga lima dolar per bulan terlihat jauh lebih murah daripada PaaS — sampai kamu menghitung jam yang habis untuk memelihara semua di daftar itu. Untuk project belajar, self-host sangat berharga sebagai pengalaman. Untuk sesuatu yang harus tetap hidup, hitung dulu siapa yang akan bangun jam tiga pagi.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Memilih tempat hosting untuk frontend jarang ditentukan oleh harga atau kecepatan, sebab pada skala kecil ketiganya nyaris sama. Yang menentukan adalah **apa yang dibutuhkan aplikasimu selain berkas statis**.',
      ),
      code(
        'text',
        `
        Pertanyaan yang memisahkan pilihannya:

          1. Apakah ada halaman yang dirender saat permintaan tiba?
             TIDAK -> hosting statis apa pun cukup
             YA    -> butuh runtime server

          2. Runtime apa yang dibutuhkan halaman dinamis itu?
             Node penuh        -> Vercel, Netlify, VPS, container
             Edge runtime      -> Cloudflare, Vercel Edge
             tidak ada Node    -> hosting statis + API terpisah

          3. Apakah ada API route yang perlu akses basis data?
             YA -> perhatikan dari mana koneksinya dibuka dan
                   berapa banyak koneksi yang bisa terbuka sekaligus

          4. Berapa lama proses terlama yang boleh berjalan?
             Batas fungsi tanpa keadaan biasanya puluhan detik saja.
        `,
        {
          caption:
            'Pertanyaan keempat yang paling sering menjadi penghalang, dan paling jarang ditanyakan di awal.',
        },
      ),
      p(
        'Edge runtime pantas dijelaskan tersendiri, sebab ia sering disangka Node yang lebih cepat padahal ia lingkungan yang berbeda.',
      ),
      code(
        'text',
        `
        Yang TIDAK ada di edge runtime:

          modul Node: fs, net, child_process, crypto versi Node
          driver basis data yang memakai soket TCP mentah
          Buffer pada sebagian implementasi
          dependency native apa pun

        Yang ADA:
          fetch, Request, Response, URL, TextEncoder
          Web Crypto (crypto.subtle)
          kedekatan dengan pengunjung, jadi latensinya kecil

        Gejala saat batas itu ditabrak:
          Module not found: Can't resolve 'fs'
          Error: The edge runtime does not support Node.js 'crypto' module
        `,
      ),
      p(
        'Untuk self-host, yang perlu disiapkan sendiri adalah hal-hal yang pada platform terkelola sudah ada tanpa diminta.',
      ),
      code(
        'text',
        `
        Yang HARUS disiapkan sendiri saat self-host:

          TLS beserta pembaruan otomatisnya
          reverse proxy dan konfigurasi header teruskan
          pengelola proses supaya aplikasinya menyala lagi setelah mati
          pengumpulan log
          pemantauan dan alarm
          cadangan, beserta pemulihannya yang benar-benar dicoba
          pembaruan keamanan sistem operasi
          CDN, bila pengunjungnya tersebar

        Tidak ada yang sulit satu per satu. Yang sering diremehkan
        adalah bahwa kedelapannya harus tetap benar selama bertahun-tahun.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Berpindah platform hampir selalu memunculkan kegagalan yang penyebabnya sama, yaitu asumsi yang benar di tempat lama dan tidak berlaku di tempat baru.',
      ),
      code(
        'text',
        `
        1. Berkas yang ditulis aplikasi hilang

           Fungsi tanpa keadaan tidak punya disk yang bertahan.
           Berkas yang ditulis ke /tmp hilang, dan permintaan berikutnya
           bisa mendarat di instance yang sama sekali lain.
           Perbaikan: object storage, bukan disk lokal.

        2. Koneksi basis data habis

           error: sorry, too many clients already
           Error: Timeout acquiring a connection from the pool

           Setiap instance fungsi membuka pool sendiri. Sepuluh instance
           dengan pool 10 berarti 100 koneksi, dan basis data terkelola
           kecil sering hanya mengizinkan 20 sampai 100.
           Perbaikan: pooler yang memang untuk lingkungan tanpa keadaan,
           dan ukuran pool 1 per instance.

        3. Proses panjang terpotong di tengah

           Task timed out after 10.01 seconds
           FUNCTION_INVOCATION_TIMEOUT

           Ekspor laporan, pengolahan gambar, dan panggilan pihak
           ketiga yang lambat tidak boleh berada di jalur permintaan.
           Perbaikan: antrean, dan kontrak 202 yang bisa dipantau —
           bentuknya sudah diukur di bab Desain API.

        4. Sesi hilang secara acak

           Sesi disimpan di memori instance. Permintaan berikutnya
           mendarat di instance lain yang tidak tahu apa-apa.
        `,
      ),
      p('Ada juga kelas kegagalan yang khas hosting statis murni, dan gejalanya sangat spesifik.'),
      code(
        'text',
        `
        "Halaman utamanya jalan, halaman lain 404 kalau di-refresh"

        Aplikasi satu halaman menangani rutenya di peramban. Server
        statis tidak tahu apa-apa tentang /produk/42 dan menjawab 404.

        Yang menutupnya: aturan fallback yang mengirim semua jalur
        yang tidak cocok ke index.html.

          Netlify  (_redirects)  : /*  /index.html  200
          Cloudflare Pages       : berkas _redirects yang sama
          nginx                  : try_files $uri $uri/ /index.html;

        Perhatikan status 200 pada aturan Netlify. Bila ditulis 301,
        alamatnya BERUBAH di peramban dan status rutenya hilang.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang sering saat pindah:

          - jalur aset salah karena base path berbeda
            Gejala: halamannya muncul tanpa gaya sama sekali, dan
            konsol penuh 404 untuk berkas .css dan .js

          - fungsi serverless memakai versi Node yang berbeda
            Periksa versi yang didukung, jangan mengandalkan bawaan

          - variabel environment tidak ikut terbawa
            Setiap platform punya tempatnya sendiri. Tidak ada yang
            memindahkannya untukmu, dan gejalanya adalah nilai kosong
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memilih hosting sering diputuskan dari perbandingan fitur di halaman pemasaran, dan yang menentukan justru batas-batas yang jarang ditulis di sana.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis berkas ke disk lokal di lingkungan tanpa keadaan',
            'Disknya kan ada',
            'Berkasnya hilang, dan permintaan berikutnya bisa mendarat di instance lain. Pakai object storage',
          ],
          [
            'Memakai ukuran pool basis data seperti di satu server',
            'Angkanya kan sudah teruji',
            'Setiap instance membuka pool sendiri. Sepuluh instance dengan pool 10 berarti 100 koneksi',
          ],
          [
            'Menjalankan proses panjang di dalam permintaan',
            'Toh cuma beberapa detik',
            'Batas fungsi tanpa keadaan biasanya puluhan detik. Pindahkan ke antrean dengan kontrak 202',
          ],
          [
            'Memakai edge runtime tanpa memeriksa batasnya',
            'Katanya lebih cepat',
            "Modul Node tidak ada di sana. Gejalanya `Can't resolve 'fs'` saat build, bukan saat berjalan",
          ],
          [
            'Memakai status 301 untuk aturan fallback SPA',
            'Sama saja dengan pengalihan',
            'Alamatnya berubah di peramban dan status rutenya hilang. Harus 200',
          ],
          [
            'Memilih self-host karena lebih murah',
            'Servernya cuma beberapa dolar',
            'TLS, proses, log, pemantauan, cadangan, dan pembaruan harus tetap benar selama bertahun-tahun',
          ],
        ],
      ),
      p(
        'Perlu dinyatakan terus terang bahwa penyebaran ke Netlify, Cloudflare Pages, maupun VPS **tidak dijalankan** dalam penyusunan materi ini, sebab ketiganya memerlukan akun penyedia. Yang **dijalankan sungguhan** adalah mekanisme di bawahnya, yaitu perilaku header teruskan di belakang reverse proxy, batas ukuran badan permintaan, dan biaya operasi migrasi. Batas-batas platform yang disebut di atas berasal dari dokumentasi masing-masing dan ditulis sebagai bentuk umum, bukan sebagai angka yang diukur di sini.',
      ),
      references(
        {
          label: 'Self-hosting',
          href: 'https://nextjs.org/docs/app/guides/self-hosting',
          source: 'Next.js Docs',
          note: 'Apa saja yang harus kamu sediakan sendiri bila tidak memakai platform terkelola',
        },
        {
          label: 'What is a container?',
          href: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/',
          source: 'Docker Docs',
          note: 'Bentuk pemaketan yang membuat aplikasi bisa dipindah antar penyedia',
        },
        {
          label: 'ngx_http_proxy_module',
          href: 'https://nginx.org/en/docs/http/ngx_http_proxy_module.html',
          source: 'Nginx Docs',
          note: 'Lapisan yang harus kamu pasang sendiri di depan aplikasi saat self-hosting',
        },
      ),
    ],
  ),

  written(
    'env-nextjs-produksi',
    'Environment Variable di Produksi',
    17,
    'Nilai yang berbeda per lingkungan, dan batas yang tidak boleh dilanggar.',
    [
      terms(
        {
          term: 'NEXT_PUBLIC_',
          meaning:
            'Awalan nama variabel di Next.js yang menandai nilainya boleh ikut terkirim ke peramban. Nilai di balik awalan ini **tertanam saat build** dan terbaca siapa pun yang membuka bundel, sehingga rahasia tidak boleh memakainya.',
        },
        {
          term: 'inlining',
          meaning:
            'Penanaman nilai variabel langsung ke dalam kode hasil build, menggantikan pembacaan variabelnya. Akibat pentingnya, nilai yang tertanam tidak berubah saat runtime, jadi mengubahnya di dasbor hosting tidak berpengaruh sampai aplikasi dibangun ulang.',
        },
        {
          term: 'server-only variable',
          meaning:
            'Variabel tanpa awalan publik, yang hanya terbaca di kode yang berjalan di server. Mencoba membacanya di komponen klien menghasilkan `undefined`, bukan error, dan diamnya itulah yang membuat kesalahan ini sulit terlihat.',
        },
        {
          term: 'runtime config',
          meaning:
            'Nilai yang dibaca saat aplikasi berjalan, bukan saat dibangun, sehingga bisa berbeda per lingkungan tanpa membangun ulang. Untuk Next.js, ini berarti membacanya di kode server, bukan lewat variabel berawalan publik.',
        },
        {
          term: 'urutan pemuatan .env',
          meaning:
            'Aturan berkas mana menimpa mana, misalnya `.env.production.local` mengalahkan `.env.production`, yang mengalahkan `.env`. Menghafal urutannya kurang penting dibanding menyadari bahwa satu nilai bisa datang dari berkas yang tidak sedang kamu buka.',
        },
        {
          term: 'validasi konfigurasi',
          meaning:
            'Memeriksa seluruh variabel yang dibutuhkan pada saat boot dengan skema, lalu menolak menyala bila ada yang kurang atau bentuknya salah. Mengubah kegagalan yang muncul acak di tengah pemakaian menjadi satu pesan jelas di awal.',
        },
        {
          term: 'build-time secret leak',
          meaning:
            'Bocornya rahasia karena ikut tertanam ke bundel peramban, biasanya karena diberi awalan publik agar "bisa dibaca komponen klien". Sekali ter-deploy, nilainya harus dianggap bocor dan diganti, bukan sekadar dihapus dari kode.',
        },
      ),

      h2('Dua jenis'),
      code(
        'bash',
        `
        # Server saja — TIDAK ikut ke browser
        DATABASE_URL="postgresql://..."
        JWT_SECRET="..."

        # IKUT ke bundle browser — bisa dibaca siapa pun
        NEXT_PUBLIC_API_URL="https://api.contoh.com"
        NEXT_PUBLIC_SITE_URL="https://app.contoh.com"
        `,
      ),
      p(
        'Yang memisahkan dua kelompok itu hanyalah **awalan nama**, dan Next.js memperlakukannya secara mekanis: setiap variabel yang namanya dimulai `NEXT_PUBLIC_` nilainya disalin ke dalam JavaScript yang dikirim ke browser saat build. Tidak ada pengecualian, tidak ada pengaturan tambahan — namanya sendiri yang menentukan.',
      ),
      p(
        'Perhatikan apa yang ada di masing-masing kelompok. `DATABASE_URL` dan `JWT_SECRET` adalah kredensial yang cukup untuk mengambil alih seluruh sistem, dan keduanya hanya dibaca kode yang berjalan di server. `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_SITE_URL` adalah alamat yang memang **sudah** terlihat di panel Network browser, sehingga menaruhnya di bundle tidak menambah informasi apa pun bagi penyerang. Aturannya sederhana, kalau nilainya tidak apa-apa dipampang di halaman depan situsmu, ia boleh publik.',
      ),
      callout(
        'danger',
        '`NEXT_PUBLIC_` berarti publik, tanpa pengecualian',
        'Nilainya ditanam ke JavaScript yang diunduh browser dan bisa dibaca dengan membuka DevTools. Kesalahan ini biasanya terjadi saat seseorang mendapat `undefined` di Client Component lalu "memperbaikinya" dengan menambahkan prefiks — yang justru mengubah rahasia menjadi publik.',
      ),

      h2('Urutan pembacaan berkas'),
      code(
        'text',
        `
        .env.local              paling tinggi (kecuali saat test) — GITIGNORE
        .env.production         saat NODE_ENV=production
        .env.development        saat NODE_ENV=development
        .env                    default untuk semua
        `,
      ),
      code(
        'text',
        `
        .env
        .env.local
        .env.*.local
        `,
        { filename: '.gitignore' },
      ),
      p(
        'Urutan di potongan pertama dibaca dari atas ke bawah sebagai **prioritas**: nilai di `.env.local` menang atas `.env.production`, yang menang atas `.env`. Polanya bisa dimanfaatkan — taruh nilai bawaan yang aman dibagikan di `.env` (yang ikut ter-commit), lalu timpa dengan nilai asli di `.env.local` yang hanya ada di mesinmu.',
      ),
      p(
        'Pengecualian "kecuali saat test" ada karena berkas tes seharusnya berjalan dengan konfigurasi yang sama di mana pun; kalau `.env.local` ikut dibaca, hasil tes di laptopmu bisa berbeda dari hasil tes di CI. Perhatikan pula `.env.production` **bukan** tempat menyimpan rahasia produksi — ia ikut ter-commit kecuali kamu mengabaikannya, dan rahasia produksi seharusnya disuntikkan platform saat deploy.',
      ),
      p(
        'Tiga baris di `.gitignore` menutup ketiga bentuk berkas lokal sekaligus. Pola `.env.*.local` yang terakhir yang paling mudah terlupa: ia menangkap `.env.production.local` dan `.env.development.local` — berkas yang justru paling mungkin memuat kredensial sungguhan.',
      ),

      h2('Validasi saat boot'),
      code(
        'ts',
        `
        // src/env.ts
        import { z } from 'zod';

        const Server = z.object({
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32),
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        const Klien = z.object({
          NEXT_PUBLIC_API_URL: z.string().url(),
        });

        // Variabel publik harus dirujuk SATU PER SATU.
        // Next.js mengganti teks 'process.env.NEXT_PUBLIC_X' saat build —
        // ia tidak bisa mengganti 'process.env' secara utuh.
        const klien = Klien.safeParse({
          NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
        });

        if (!klien.success) throw new Error('Konfigurasi publik tidak valid');

        export const envKlien = klien.data;

        // Server: hanya diurai di server
        export const envServer =
          typeof window === 'undefined' ? Server.parse(process.env) : (null as never);
        `,
      ),
      p(
        'Skema `Server` tidak sekadar memeriksa keberadaan variabel, ia memeriksa **bentuknya**: `z.string().url()` menolak `DATABASE_URL` yang salah ketik, `z.string().min(32)` menolak `JWT_SECRET` yang terlalu pendek untuk aman, dan `z.enum([...])` menolak `NODE_ENV` yang bernilai di luar tiga pilihan itu. Kegagalannya terjadi saat aplikasi menyala — bukan saat permintaan pertama yang kebetulan menyentuh database, jam dua pagi.',
      ),
      p(
        'Bagian `klien` ditulis dengan cara yang terlihat bertele-tele karena menyebut `NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL` satu per satu, dan komentarnya menjelaskan alasannya. Next.js melakukan **substitusi teks** saat build, sebab ia mencari string `process.env.NEXT_PUBLIC_API_URL` di kode dan menggantinya dengan nilainya. Menulis `Klien.parse(process.env)` tidak memberi teks untuk dicari, sehingga di browser objek itu kosong.',
      ),
      p(
        "Baris terakhir memakai `typeof window === 'undefined'` sebagai penjaga, sehingga hanya di server, tempat `window` tidak ada, skema `Server` benar-benar diurai. Ini membuat kode yang tidak sengaja mengimpor `envServer` dari komponen klien tidak akan mencoba membaca `DATABASE_URL` di browser. Ia pengaman lapis pertama, sedangkan lapis yang lebih tegas berupa `server-only` dibahas tepat di bawah.",
      ),
      callout(
        'warning',
        '`process.env` tidak bisa disebar di kode klien',
        'Menulis `Klien.parse(process.env)` akan gagal di browser karena Next.js hanya mengganti referensi **eksplisit** ke setiap variabel. Ini penyebab error "NEXT_PUBLIC_X is undefined" yang membingungkan — nilainya ada saat build, tapi tidak pernah ikut ke bundle karena tidak pernah dirujuk langsung.',
      ),

      h2('Menjaga batas server'),
      code(
        'bash',
        `
        npm install server-only
        `,
      ),
      code(
        'ts',
        `
        // src/lib/db.ts
        import 'server-only';   // build GAGAL kalau berkas ini terimpor komponen klien

        export const db = buatKoneksi(process.env.DATABASE_URL!);
        `,
      ),
      p(
        'Paket `server-only` tidak berisi logika apa pun — ia hanya berisi modul yang **sengaja dibuat gagal** kalau di-bundle untuk browser. Menuliskan `import \'server-only\'` di puncak sebuah berkas mengubah aturan tak tertulis "jangan impor ini dari klien" menjadi kegagalan build yang menyebut nama berkas pelanggarnya.',
      ),
      p(
        "Yang membuatnya berharga adalah **kapan** ia menangkap kesalahan. Tanpa penjaga ini, mengimpor `db.ts` dari sebuah Client Component tidak menimbulkan gejala saat menulis kode; masalahnya baru muncul sebagai kredensial yang ikut ke bundle, atau sebagai error runtime yang membingungkan di browser. Pasang `import 'server-only'` di setiap modul yang menyentuh database, kunci API, atau berkas sistem.",
      ),

      h2('Memeriksa tidak ada yang bocor'),
      code(
        'bash',
        `
        npm run build

        # Cari nilai rahasia di bundle klien
        grep -rE "postgresql://|sk_live|AKIA|-----BEGIN" .next/static/ \\
          && echo "RAHASIA DI BUNDLE — hentikan deploy" || echo "bersih"

        # Lihat semua NEXT_PUBLIC_ yang benar-benar ikut
        grep -rhoE "NEXT_PUBLIC_[A-Z_]+" .next/static/ | sort -u
        `,
      ),
      p(
        'Pemeriksaan pertama mencari nilai yang **tidak boleh ada**: connection string, kunci Stripe, kunci AWS, kunci privat. Rantai `&& … || …` di ujungnya membuat hasilnya terbaca sekali lihat — `grep` yang menemukan sesuatu menjalankan cabang kiri ("hentikan deploy"), yang tidak menemukan apa-apa menjalankan cabang kanan ("bersih").',
      ),
      p(
        'Pemeriksaan kedua menjawab pertanyaan yang berbeda: **apa saja** yang sebenarnya ikut ke bundle. `-o` mencetak hanya bagian yang cocok (bukan seluruh baris), `-h` menyembunyikan nama berkasnya, dan `sort -u` menyisakan daftar unik. Hasilnya adalah daftar nama variabel publik yang benar-benar terpakai — dan kalau ada nama yang membuatmu berpikir "kenapa ini publik?", itulah temuan yang dicari.',
      ),
      callout(
        'tip',
        'Jadikan pemeriksaan ini langkah CI',
        'Satu baris `grep` yang menggagalkan build jauh lebih murah daripada menemukan kredensial database di bundle produksi lewat laporan orang lain.',
      ),

      h2('Nilai berbeda per lingkungan'),
      table(
        ['Variabel', 'Development', 'Preview', 'Production'],
        [
          ['`NEXT_PUBLIC_API_URL`', '`localhost:8000`', 'API staging', 'API produksi'],
          ['`DATABASE_URL`', 'DB lokal', 'DB staging', 'DB produksi'],
          ['`NODE_ENV`', '`development`', '`production`', '`production`'],
        ],
      ),
      callout(
        'danger',
        'Preview tidak boleh menunjuk database produksi',
        'Preview deployment dibuat otomatis dari setiap PR — termasuk PR yang belum direview. Kode di dalamnya bisa apa saja. Menunjuknya ke database produksi berarti setiap PR punya akses tulis penuh ke data sungguhan.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Variabel environment di Next.js punya dua perilaku yang sangat berbeda, dan hampir semua kebingungan berasal dari memperlakukannya sebagai satu hal.',
      ),
      code(
        'text',
        `
        DITANAM SAAT BUILD:
          process.env.NEXT_PUBLIC_APA_PUN
          -> nilainya disalin ke dalam berkas JavaScript yang diunduh
             peramban
          -> mengubahnya menuntut BUILD ULANG, bukan restart
          -> bukan rahasia, tanpa pengecualian

        DIBACA SAAT RUNTIME:
          process.env.APA_PUN_TANPA_AWALAN, di kode server
          -> dibaca oleh proses server saat berjalan
          -> mengubahnya cukup restart
          -> tidak pernah sampai ke peramban
        `,
      ),
      p(
        'Kalimat "bukan rahasia" di atas bukan peringatan teoretis. Apa pun yang masuk ke kode klien terbaca sebagai teks biasa, dan itu bisa diperiksa pada project ini sendiri.',
      ),
      code(
        'text',
        `
        Diperiksa pada keluaran build produksi project ini:

          jumlah berkas JavaScript klien : 30
          string dari isi materi yang terbaca di dalamnya: ada

        Cara memeriksanya untuk nilai apa pun:
          grep -rl "nilai-yang-dicari" .next/static

        Bila keluarannya menyebut berkas, nilai itu ada di bundel
        klien, dan tidak ada konfigurasi apa pun yang akan
        menyembunyikannya dari pengunjung.
        `,
        {
          caption:
            'Satu perintah itu menjawab pertanyaan "apakah nilai ini bocor" dengan pasti, tanpa menebak.',
        },
      ),
      p('Konsekuensi praktisnya menentukan cara sebuah fitur dirancang.'),
      code(
        'ts',
        `
        // SALAH: kunci API dipakai langsung dari komponen klien.
        'use client';
        const kunci = process.env.NEXT_PUBLIC_CUACA_API_KEY;   // BOCOR
        const r = await fetch(\`https://api.cuaca.id/?key=\${kunci}\`);

        // BENAR: pekerjaannya yang pindah ke server, bukan nilainya
        // yang pindah ke klien.
        // app/api/cuaca/route.ts
        export async function GET(req: Request) {
          const kota = new URL(req.url).searchParams.get('kota');
          const r = await fetch(
            \`https://api.cuaca.id/?key=\${process.env.CUACA_API_KEY}&kota=\${kota}\`,
          );
          return Response.json(await r.json());
        }
        // Klien memanggil /api/cuaca?kota=..., dan kuncinya tidak
        // pernah meninggalkan server.
        `,
      ),
      p(
        'Urutan pembacaan berkas `.env` juga sering menjadi sumber kejutan, sebab yang lebih spesifik menang atas yang lebih umum.',
      ),
      code(
        'text',
        `
        Urutan prioritas, dari yang paling menang:

          1. variabel yang sudah ada di lingkungan proses
          2. .env.<mode>.local      (.env.production.local)
          3. .env.local             TIDAK dibaca saat mode test
          4. .env.<mode>            (.env.production)
          5. .env

        Yang masuk repositori: .env.example saja.
        Yang git-ignored       : .env, .env.local, .env.*.local

        Jebakan yang khas: .env.local ada di mesin pengembang dan
        menimpa .env, sehingga nilai yang dipakai di laptop berbeda
        dari yang dipakai siapa pun di CI, dan tidak ada yang tahu.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Gejala yang paling sering dilaporkan adalah nilai yang tidak mau berubah, dan penyebabnya bergantung pada jenis variabelnya.',
      ),
      code(
        'text',
        `
        1. "Sudah diubah di dasbor, halamannya tetap lama"

           Nilai NEXT_PUBLIC_ ditanam ke bundel saat build. Menyebarkan
           ulang berkas yang sama tidak mengubah apa pun. Yang
           diperlukan BUILD ULANG.

        2. "undefined di komponen klien"

           Variabel tanpa awalan NEXT_PUBLIC_ memang tidak dikirim ke
           peramban. Ini perilaku yang BENAR, bukan bug.

        3. "Build gagal: Environment variable is not defined"

           Error: Environment variable DATABASE_URL is not defined
           saat "Collecting page data"

           Halaman statis dirender SAAT BUILD. Variabel yang dipakainya
           harus ada di lingkungan build.

           Perbaikan yang SALAH: memberikan kredensial produksi ke
           lingkungan build.
           Perbaikan yang BENAR: halaman itu seharusnya tidak dirender
           saat build. Tandai dinamis, atau pisahkan bagian yang butuh
           data ke dalam batas Suspense.
        `,
      ),
      p(
        'Kelas kedua adalah nilai yang terbaca dan salah, dan ini yang tidak menghasilkan error sama sekali.',
      ),
      code(
        'text',
        `
        SEMUA VARIABEL ADALAH STRING:

          process.env.DEBUG          -> "false"
          Boolean(process.env.DEBUG) -> true      <- string tak kosong

          process.env.PORT           -> "3000"
          process.env.PORT + 1       -> "30001"   <- penggabungan

        NILAI BAWAAN KE ARAH YANG SALAH:

          const aman = process.env.WAJIB_HTTPS === 'true';
          // salah ketik di produksi -> false. TERBUKA.

          const aman = process.env.WAJIB_HTTPS !== 'false';
          // salah ketik di produksi -> true. AMAN.

        Nilai yang hilang harus jatuh ke pilihan PALING KETAT.
        `,
      ),
      code(
        'ts',
        `
        // Gerbang yang menutup keduanya sekaligus: divalidasi dan
        // diubah tipenya SEKALI, saat boot.
        const SkemaEnv = z.object({
          DATABASE_URL: z.string().url(),
          SESSION_SECRET: z.string().min(32),
          WAJIB_HTTPS: z.coerce.boolean().default(true),
          NEXT_PUBLIC_SITE_URL: z.string().url(),
        });

        const hasil = SkemaEnv.safeParse(process.env);
        if (!hasil.success) {
          console.error('Konfigurasi tidak valid, proses dihentikan:');
          for (const [k, v] of Object.entries(hasil.error.flatten().fieldErrors)) {
            console.error(\`  \${k} : \${v?.join(', ')}\`);
          }
          process.exit(1);
        }
        export const env = Object.freeze(hasil.data);
        `,
      ),
      p(
        'Yang menentukan di potongan ini adalah `process.exit(1)`. Tanpa baris itu konfigurasi yang salah hanya tercetak sebagai peringatan lalu aplikasi tetap menyala, dan kegagalannya muncul belakangan sebagai error yang tidak menyebut variabel mana yang bermasalah. Menghentikan proses saat boot memindahkan kegagalan ke tempat yang pesannya masih menyebutkan sebabnya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Awalan `NEXT_PUBLIC_` adalah satu-satunya bagian sistem ini yang namanya sudah memberi tahu apa yang terjadi, dan tetap paling sering disalahpahami.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memberi awalan `NEXT_PUBLIC_` agar nilainya terbaca di komponen',
            'Biar tidak `undefined` lagi',
            'Awalan itu MENGIRIMKANNYA ke peramban. Pindahkan pekerjaannya ke server, bukan nilainya ke klien',
          ],
          [
            'Mengubah nilai `NEXT_PUBLIC_` lalu menyebarkan ulang saja',
            'Variabelnya kan sudah diganti',
            'Nilainya ditanam saat build. Yang diperlukan build ulang',
          ],
          [
            'Memberi kredensial produksi ke lingkungan build',
            'Build-nya membutuhkan',
            'Halaman itu seharusnya tidak dirender saat build. Perbaiki rendernya, jangan perluas paparan rahasianya',
          ],
          [
            'Memakai nilai environment tanpa mengubah tipenya',
            'Nilainya kan sudah benar',
            'Semuanya string. `Boolean("false")` bernilai `true`',
          ],
          [
            'Menulis bawaan ke arah yang permisif',
            'Biar tidak merepotkan saat pengembangan',
            'Satu salah ketik di produksi mematikan pengamanan tanpa satu pun error',
          ],
          [
            'Mengandalkan `.env.local` yang hanya ada di laptop',
            'Di sini jalan kok',
            'Ia menimpa `.env` dan tidak ada di CI maupun produksi. Nilai yang dipakai berbeda tanpa ada yang tahu',
          ],
        ],
      ),
      p(
        'Satu kebiasaan menutup hampir semuanya, yaitu memperlakukan `.env.example` sebagai daftar yang wajib lengkap dan wajib benar. Setiap variabel yang dibaca aplikasi ada di sana, dengan satu baris penjelasan dan nilai contoh yang jelas palsu, dan berkas itu diperbarui pada commit yang sama dengan kode yang mulai membacanya. Dengan begitu, variabel yang terlupa dipasang ketahuan sebelum aplikasinya dijalankan, bukan sesudah.',
      ),
      references(
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js Docs',
          note: 'Urutan pemuatan berkas dan aturan tegas soal awalan publik',
        },
        {
          label: 'Config — Store config in the environment',
          href: 'https://12factor.net/config',
          source: 'Twelve-Factor App',
          note: 'Kenapa konfigurasi dipisahkan dari kode sejak awal',
        },
        {
          label: 'Environment Variables',
          href: 'https://vercel.com/docs/projects/environment-variables',
          source: 'Vercel Docs',
          note: 'Cara nilai diserahkan per lingkungan pada platform terkelola',
        },
      ),
    ],
  ),

  written(
    'domain-https-fe',
    'Custom Domain & HTTPS',
    16,
    'Menghubungkan nama ke aplikasi yang sudah berjalan.',
    [
      terms(
        {
          term: 'custom domain',
          meaning:
            'Domain milikmu sendiri yang diarahkan ke hosting, menggantikan alamat bawaan yang diberikan penyedia. Dihubungkan lewat catatan DNS berupa `A` atau `CNAME`.',
        },
        {
          term: 'apex domain',
          meaning:
            'Domain tanpa subdomain, misalnya `contoh.com`. Disebut juga *root* atau *naked domain*. Punya batasan teknis, yaitu tidak bisa memakai `CNAME` biasa, sehingga penyedia menyediakan cara lain seperti `ALIAS` atau alamat IP tetap.',
        },
        {
          term: 'subdomain',
          meaning:
            'Nama di depan domain utama, misalnya `www.contoh.com` atau `app.contoh.com`. Lebih lentur karena boleh memakai `CNAME`, sehingga alamat di baliknya bisa berubah tanpa kamu ubah apa pun.',
        },
        {
          term: 'redirect kanonik',
          meaning:
            'Pengalihan tetap dari satu bentuk alamat ke bentuk yang dipilih sebagai resmi, misalnya dari `contoh.com` ke `www.contoh.com`. Menghindari isi yang sama tersedia di dua alamat, yang membingungkan mesin pencari dan memecah cache.',
        },
        {
          term: 'sertifikat otomatis',
          meaning:
            'Penerbitan dan perpanjangan sertifikat TLS yang diurus platform tanpa campur tanganmu. Yang perlu kamu pastikan hanyalah catatan DNS-nya sudah benar, sebab penerbitannya memverifikasi bahwa kamu memang menguasai domain itu.',
        },
        {
          term: 'HSTS',
          meaning:
            'Header yang memerintahkan peramban selalu memakai `https` untuk domain ini selama `max-age` yang disebutkan. Perlu hati-hati, sebab nilainya tersimpan di peramban pengunjung, jadi menyetel masa berlaku panjang sebelum `https` benar-benar stabil akan mengunci pengunjung dari situsmu sendiri.',
        },
        {
          term: 'mixed content',
          meaning:
            'Halaman `https` yang memuat sumber daya lewat `http`. Peramban memblokir sebagian besar di antaranya, sehingga gambar atau skrip tidak muncul tanpa error yang jelas di halaman.',
        },
        {
          term: 'HTTP ke HTTPS redirect',
          meaning:
            'Pengalihan otomatis pengunjung yang datang lewat `http` ke `https`. Menutup kunjungan pertama, sementara HSTS menutup kunjungan berikutnya.',
        },
      ),

      h2('Menunjuk domain'),
      code(
        'text',
        `
        # Root domain — CNAME tidak boleh di root, jadi pakai A (atau ALIAS)
        contoh.com.       A      76.76.21.21

        # Subdomain — CNAME
        www.contoh.com.   CNAME  cname.vercel-dns.com.
        app.contoh.com.   CNAME  cname.vercel-dns.com.
        `,
      ),
      p(
        'Perbedaan mendasar dua jenis record ini: `A` menunjuk **alamat IP**, `CNAME` menunjuk **nama lain**. Karena itu baris pertama harus mencantumkan angka `76.76.21.21` yang bisa berubah kalau penyedia mengganti infrastrukturnya, sementara `CNAME` ke `cname.vercel-dns.com.` tetap benar meski IP di belakangnya berpindah.',
      ),
      p(
        'Perhatikan titik di ujung setiap nama (`contoh.com.`, `cname.vercel-dns.com.`). Titik itu menandakan nama **absolut**; tanpanya, sebagian penyedia DNS menambahkan nama zona di belakangnya sehingga `cname.vercel-dns.com` diam-diam menjadi `cname.vercel-dns.com.contoh.com` — dan domainmu tidak pernah terhubung, dengan gejala yang sulit ditelusuri.',
      ),
      callout(
        'info',
        'Kenapa root domain tidak boleh CNAME',
        'Spesifikasi DNS melarangnya karena root domain juga harus punya record lain (`MX`, `TXT`) yang tidak bisa hidup berdampingan dengan CNAME. Sebagian penyedia menyediakan `ALIAS` atau `ANAME` yang berperilaku seperti CNAME tapi sah di root.',
      ),

      h2('Pilih satu bentuk kanonis'),
      code(
        'ts',
        `
        // next.config.ts — arahkan www ke non-www (atau sebaliknya)
        async redirects() {
          return [{
            source: '/:path*',
            has: [{ type: 'host', value: 'www.contoh.com' }],
            destination: 'https://contoh.com/:path*',
            permanent: true,
          }];
        }
        `,
      ),
      p(
        'Blok `has` yang membuat aturan ini bekerja secara selektif. Ia menyaring berdasarkan `host` — hanya permintaan yang datang ke `www.contoh.com` yang dialihkan, sedangkan yang sudah di `contoh.com` dibiarkan. Tanpa penyaring itu, aturannya akan mengalihkan permintaan ke dirinya sendiri dan menghasilkan perulangan redirect tak berujung.',
      ),
      p(
        'Pola `/:path*` di `source` dan `destination` menyalin **seluruh** jalur beserta segmennya, sehingga `www.contoh.com/kelas/react/hooks` mendarat di `contoh.com/kelas/react/hooks` dan bukan di beranda. `permanent: true` menerbitkan status `308` — pemberitahuan kepada mesin pencari dan browser bahwa perpindahan ini tetap, sehingga tautan lama diteruskan bobot SEO-nya. Pakai `false` (status `307`) selama masih ragu, karena redirect permanen ikut disimpan browser dan sulit ditarik kembali.',
      ),
      callout(
        'warning',
        'Dua bentuk yang sama-sama hidup memecah SEO dan cookie',
        'Mesin pencari melihatnya sebagai dua situs dengan konten duplikat. Lebih praktis lagi: cookie yang disetel di `contoh.com` tidak ikut terkirim ke `www.contoh.com`, sehingga pengguna tampak logout saat berpindah antar keduanya.',
      ),

      h2('HTTPS'),
      p(
        'Semua platform modern menerbitkan dan memperbarui sertifikat otomatis setelah DNS mengarah dengan benar. Untuk self-host, Certbot atau Caddy mengurusnya.',
      ),
      code(
        'bash',
        `
        # Verifikasi
        curl -sI https://contoh.com | head -1
        curl -sI http://contoh.com | grep -i location    # harus 301 ke https

        echo | openssl s_client -connect contoh.com:443 -servername contoh.com 2>/dev/null \\
          | openssl x509 -noout -dates
        `,
      ),
      p(
        'Dua `curl` pertama memeriksa dua hal berbeda. `curl -sI https://...  | head -1` menampilkan baris status untuk memastikan HTTPS-nya menjawab sama sekali; `curl -sI http://... | grep -i location` memastikan versi HTTP-nya **mengalihkan** ke HTTPS, bukan melayani situs apa adanya tanpa enkripsi. Situs yang bisa diakses lewat kedua protokol tanpa pengalihan adalah situs yang sebagian pengunjungnya tetap tidak terenkripsi.',
      ),
      p(
        "Perintah `openssl` terakhir menjawab pertanyaan yang tidak terlihat dari browser: **kapan sertifikatnya kedaluwarsa**. `s_client -connect` membuka koneksi TLS, `-servername` mengirim nama domain lewat SNI (wajib karena satu IP biasanya melayani banyak domain), lalu `x509 -noout -dates` mencetak tanggal `notBefore` dan `notAfter`. Sertifikat Let's Encrypt berumur 90 hari dan biasanya diperbarui otomatis — perintah ini yang membuktikan pembaruannya memang berjalan.",
      ),

      h2('HSTS'),
      code(
        'ts',
        `
        async headers() {
          return [{
            source: '/:path*',
            headers: [{
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            }],
          }];
        }
        `,
      ),
      p(
        'Header `Strict-Transport-Security` memberi tahu browser: "untuk domain ini, **jangan pernah** pakai HTTP lagi". Setelah menerimanya sekali, browser mengubah sendiri setiap tautan `http://` ke `https://` sebelum permintaan dikirim — sehingga tidak ada lagi permintaan tak terenkripsi yang bisa disadap atau dibelokkan, bahkan pada kunjungan pertama di jaringan yang tidak dipercaya.',
      ),
      p(
        'Angka `31536000` adalah satu tahun dalam detik, dan itulah yang membuat header ini sulit dibatalkan: browser mengingatnya selama itu, dan mematikan header tidak menghapus yang sudah tersimpan. `includeSubDomains` memperluasnya ke **semua** subdomain — termasuk yang belum kamu buat, sehingga subdomain internal yang nanti dipasang tanpa sertifikat akan langsung tidak bisa dibuka. Mulai dari `max-age=300` selama beberapa hari, naikkan setelah yakin seluruh subdomain sudah HTTPS.',
      ),
      callout(
        'danger',
        'HSTS sulit dibatalkan; `preload` hampir permanen',
        'Setelah browser menyimpannya, ia menolak koneksi HTTP ke domainmu selama masa berlakunya — mematikan header tidak menolong. Menambahkan domain ke daftar `preload` browser bahkan lebih sulit dibatalkan, dan `includeSubDomains` berlaku untuk **semua** subdomain, termasuk yang belum ada. Mulai dari `max-age` kecil.',
      ),

      h2('Subdomain untuk frontend dan backend'),
      code(
        'text',
        `
        app.contoh.com    -> frontend
        api.contoh.com    -> backend

        Cookie dengan domain=.contoh.com bisa dipakai keduanya.
        `,
      ),
      p(
        'Ini yang membuat autentikasi berbasis cookie tetap mungkin tanpa `SameSite=None` — bahasan lengkapnya di Backend Intermediate 4.3.',
      ),

      h2('Setelah domain aktif'),
      ol(
        'Verifikasi HTTP mengalihkan ke HTTPS.',
        'Verifikasi bentuk non-kanonis mengalihkan ke yang kanonis.',
        'Perbarui `NEXT_PUBLIC_SITE_URL` dan URL di metadata Open Graph.',
        'Perbarui allow-list CORS di backend.',
        'Perbarui `redirect_uri` di penyedia OAuth.',
        'Pasang pemantauan kedaluwarsa sertifikat — 30 hari sebelumnya.',
      ),
      callout(
        'warning',
        'Poin 4 dan 5 sering terlupa sampai ada yang melapor',
        'Domain baru berarti origin baru. CORS akan menolaknya, dan login OAuth akan gagal dengan `redirect_uri_mismatch` — keduanya baru ketahuan saat ada pengguna yang mencobanya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Memasang domain sendiri beserta HTTPS kini hampir selalu otomatis, dan yang tetap perlu dipahami adalah apa yang terjadi di baliknya, sebab di situlah kegagalannya muncul.',
      ),
      code(
        'text',
        `
        Tiga hal yang harus benar, berurutan:

          1. DNS      nama menunjuk ke penyedia hosting
          2. VERIFIKASI  penyedia membuktikan kamu menguasai domain itu
          3. SERTIFIKAT  diterbitkan, dan diperbarui otomatis sesudahnya

        Langkah 2 yang paling sering gagal, dan gejalanya hampir
        selalu dibaca sebagai masalah langkah 1.
        `,
      ),
      p(
        'Cara memeriksa langkah pertama tidak memerlukan alat khusus, dan hasilnya bisa dibaca langsung.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan dig terhadap domain publik:

          A      104.20.23.154 172.66.147.243
          AAAA   2606:4700:10::ac42:93f3
          NS     elliott.ns.cloudflare.com. hera.ns.cloudflare.com.

          example.com.    152   IN   A   104.20.23.154
                          ^^^ TTL: berapa detik jawaban ini boleh disimpan

        Dan aturan apex yang sering menjadi penghalang:

          www.github.com.   238   IN   CNAME   github.com.
          github.com.        29   IN   A       20.205.243.166

        Subdomain boleh CNAME. Apex TIDAK BISA, sebab ia harus memuat
        rekaman NS dan SOA, dan CNAME melarang rekaman lain hidup
        berdampingan. Penyedia modern menyiasatinya dengan ALIAS
        atau ANAME.
        `,
      ),
      p(
        'Untuk langkah ketiga, yang diverifikasi peramban ada tiga hal sekaligus, dan mengetahui ketiganya membuat pesan errornya langsung bisa dibaca.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan curl 8.5.0:

          TLSv1.3 (IN), TLS handshake, Certificate (11):
          TLSv1.3 (IN), TLS handshake, CERT verify (15):
          SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384 / X25519

        Yang diperiksa:
          1. ditandatangani oleh CA yang dipercaya
          2. BELUM kedaluwarsa
          3. NAMA di sertifikatnya cocok dengan yang dihubungi
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ketiga pemeriksaan itu punya pesan errornya masing-masing, dan semuanya bisa dilihat terhadap situs uji yang memang disediakan untuk itu.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan curl 8.5.0:

          expired.badssl.com
            curl: (60) SSL certificate problem: certificate has expired

          wrong.host.badssl.com
            curl: (60) SSL: no alternative certificate subject name
                  matches target host name 'wrong.host.badssl.com'

          self-signed.badssl.com
            curl: (60) SSL certificate problem: self-signed certificate

          untrusted-root.badssl.com
            curl: (60) SSL certificate problem: self-signed certificate
                  in certificate chain

        Dan keempatnya dengan verifikasi dimatikan (-k): 200, 200, 200, 200.
        `,
        {
          caption:
            'Empat masalah berbeda, satu jalan pintas yang sama, dan jalan pintas itu membuang seluruh manfaatnya.',
        },
      ),
      p(
        'Yang dilihat pengunjung berbeda dari yang dilihat `curl`, dan itu perlu dikenali sebab merekalah yang melaporkannya.',
      ),
      code(
        'text',
        `
        Di peramban:

          NET::ERR_CERT_DATE_INVALID          sertifikat kedaluwarsa
          NET::ERR_CERT_COMMON_NAME_INVALID   nama tidak cocok
          NET::ERR_CERT_AUTHORITY_INVALID     CA tidak dipercaya
          DNS_PROBE_FINISHED_NXDOMAIN         namanya tidak ada
          ERR_TOO_MANY_REDIRECTS              perulangan pengalihan

        Yang terakhir sering muncul saat memasang domain di belakang
        proxy: proxy mengalihkan http ke https, aplikasi mengira
        koneksinya http (karena tidak membaca X-Forwarded-Proto) lalu
        mengalihkannya lagi, dan seterusnya.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN YANG KHAS SAAT MEMASANG DOMAIN:

        1. Verifikasi tidak pernah selesai

           Penyedia meminta rekaman TXT atau CNAME khusus. Sering
           gagal karena:
             - ditulis dengan nama domain di belakangnya, padahal
               penyedia DNS sudah menambahkannya sendiri
               (_acme-challenge.contoh.id.contoh.id)
             - proxy penyedia DNS menyembunyikan rekamannya
             - TTL lama masih berlaku

        2. Sertifikat hanya untuk satu nama

           contoh.id dan www.contoh.id adalah DUA nama. Keduanya
           harus ada di sertifikat, dan keduanya harus punya rekaman DNS.

        3. Pembaruan otomatis gagal diam-diam

           Berhasil berbulan-bulan, lalu kedaluwarsa. Sering karena
           pengalihan http ke https yang dipasang sendiri memblokir
           tantangan HTTP-01 yang memang datang lewat http.
           Yang menutupnya: pantau TANGGAL KEDALUWARSA-nya, jangan
           mengandalkan bahwa pembaruannya berjalan.

        4. HSTS dipasang terlalu cepat

           Peramban MENYIMPAN kebijakan itu. Bila TLS-nya belum benar,
           pengunjung yang sudah menerimanya tidak bisa turun ke http
           untuk memperbaikinya. Uji dengan max-age kecil dulu.
        `,
      ),
      p(
        'Poin ketiga pantas ditegaskan karena ia penyebab pemadaman yang paling mudah dicegah. Sertifikat yang kedaluwarsa membuat seluruh situs tidak bisa diakses, dan satu alarm yang berbunyi tiga puluh hari sebelumnya sudah cukup menutupnya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memasang domain terasa seperti pekerjaan sekali jadi, dan bagian yang perlu dijaga justru yang berjalan diam-diam sesudahnya.',
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
            'Memasang `CNAME` di apex domain',
            'Sama saja dengan subdomain',
            'Apex harus memuat NS dan SOA. Pakai `A`, atau `ALIAS` bila penyedianya menyediakannya',
          ],
          [
            'Menerbitkan sertifikat hanya untuk `contoh.id`',
            'Domainnya kan satu',
            '`www.contoh.id` adalah nama yang berbeda. Keduanya harus ada di sertifikat dan di DNS',
          ],
          [
            'Mengandalkan pembaruan sertifikat berjalan sendiri',
            'Kan sudah otomatis',
            'Ia bisa gagal diam-diam berbulan-bulan. Pantau tanggal kedaluwarsanya, jangan pantau prosesnya',
          ],
          [
            'Memasang HSTS panjang sejak awal',
            'Katanya praktik yang baik',
            'Peramban menyimpannya. Bila TLS-nya bermasalah, pengunjung tidak bisa turun ke http. Uji dengan nilai kecil dulu',
          ],
          [
            'Memakai `-k` saat menguji dengan `curl`',
            'Biar errornya hilang dulu',
            'Diukur, keempat sertifikat bermasalah menjawab 200 dengan `-k`. Yang diperiksa jadi tidak ada',
          ],
        ],
      ),
      p(
        'Urutan pemeriksaan yang menutup hampir semua penelusuran di area ini ada tiga langkah, dan urutannya menentukan. Pertama pastikan namanya menunjuk ke tempat yang benar dengan `dig`, lalu pastikan ada yang menjawab di sana dengan `curl -I`, lalu terakhir periksa sertifikatnya dengan `curl -v`. Memulai dari langkah ketiga ketika langkah pertama belum benar hanya menghasilkan pesan yang menyesatkan.',
      ),
      references(
        {
          label: 'Domains',
          href: 'https://vercel.com/docs/domains',
          source: 'Vercel Docs',
          note: 'Langkah menghubungkan apex domain dan subdomain beserta perbedaannya',
        },
        {
          label: 'Strict-Transport-Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
          source: 'MDN',
          note: 'Arti tiap direktif dan peringatan soal `preload` yang sulit ditarik',
        },
        {
          label: 'Transport Layer Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security',
          source: 'MDN',
          note: 'Apa yang dijamin sertifikat, dan apa yang tetap perlu kamu jaga sendiri',
        },
      ),
    ],
  ),

  written(
    'caching-cdn-produksi',
    'Caching, CDN & Revalidation di Produksi',
    19,
    'Menyajikan cepat tanpa menyajikan yang basi.',
    [
      terms(
        {
          term: 'CDN',
          meaning:
            'Singkatan *Content Delivery Network*, jaringan server yang menyimpan salinan isi situsmu di banyak lokasi dan menyajikannya dari yang terdekat dengan pengunjung. Mengurangi waktu tempuh sekaligus beban server asalmu.',
        },
        {
          term: 'Cache-Control',
          meaning:
            'Header HTTP yang menentukan siapa boleh menyimpan sebuah respons dan berapa lama. Direktif yang paling sering dipakai adalah `max-age` untuk peramban, `s-maxage` untuk cache bersama seperti CDN, dan `no-store` untuk isi yang tidak boleh disimpan sama sekali.',
        },
        {
          term: 'immutable',
          meaning:
            'Direktif yang menyatakan isi sebuah alamat tidak akan pernah berubah, sehingga peramban tidak perlu memeriksanya lagi selama masa berlakunya. Aman dipakai untuk berkas yang namanya memuat hash isi.',
        },
        {
          term: 'fingerprinting',
          meaning:
            'Menyisipkan hash isi ke dalam nama berkas, misalnya `app.4f3a9c.js`. Membuat berkas baru selalu punya alamat baru, sehingga cache lama tidak perlu dihapus dan berkas lama tidak pernah tersaji keliru.',
        },
        {
          term: 'stale-while-revalidate',
          meaning:
            'Direktif yang mengizinkan cache menyajikan salinan yang sudah kedaluwarsa sambil mengambil versi barunya di belakang layar. Pengunjung mendapat jawaban cepat, dan kesegarannya menyusul pada permintaan berikutnya.',
        },
        {
          term: 'ETag',
          meaning:
            'Penanda versi sebuah respons yang dikirim server. Peramban mengirimkannya kembali pada permintaan berikutnya, dan bila isinya belum berubah server menjawab `304 Not Modified` tanpa mengirim ulang isinya.',
        },
        {
          term: 'cache invalidation',
          meaning:
            'Membatalkan salinan yang tersimpan supaya versi baru tersaji. Sulit justru karena kamu harus tahu **semua** tempat salinannya berada, dan fingerprinting menghindarkan sebagian besar masalah ini dengan tidak pernah menimpa alamat lama.',
        },
        {
          term: 'cache hit ratio',
          meaning:
            'Perbandingan permintaan yang dijawab dari cache terhadap total permintaan. Angka inilah yang menunjukkan apakah aturan cache-mu benar-benar bekerja, dan nilai rendah biasanya berarti ada header yang membuat respons dianggap unik per pengunjung.',
        },
      ),

      h2('Lapisan cache'),
      code(
        'text',
        `
        Browser  ->  CDN  ->  Cache Next.js  ->  Aplikasi  ->  Database
           │         │            │
           │         │            └── halaman statis, hasil fetch
           │         └── aset & halaman statis di tepi jaringan
           └── memori dan disk browser
        `,
      ),
      p(
        'Setiap lapisan punya aturannya sendiri, dan yang paling sering salah adalah aturan lapisan pertama.',
      ),

      h2('Aset statis'),
      code(
        'text',
        `
        # Nama berkas memuat hash isinya -> aman di-cache selamanya
        /_next/static/chunks/main-a1b2c3.js
        Cache-Control: public, max-age=31536000, immutable
        `,
      ),
      p(
        'Karena isi berubah berarti nama berubah, tidak pernah ada kebutuhan menghapus cache-nya. Ini pola yang membuat invalidasi menjadi tidak relevan — jauh lebih andal daripada berusaha menghapus entri di banyak CDN.',
      ),

      h2('Halaman'),
      code(
        'ts',
        `
        // Statis penuh — dibuat sekali saat build
        export const dynamic = 'force-static';

        // ISR — statis yang menyegarkan diri
        export const revalidate = 3600;

        // Selalu dinamis
        export const dynamic = 'force-dynamic';
        `,
      ),
      code(
        'ts',
        `
        // Per pemanggilan fetch
        fetch(url, { next: { revalidate: 60 } });
        fetch(url, { next: { tags: ['artikel'] } });
        fetch(url, { cache: 'no-store' });
        `,
      ),
      p(
        'Tiga baris di potongan pertama adalah pengaturan **setingkat rute**, dan ketiganya saling meniadakan sehingga hanya satu yang boleh dipakai per berkas. `force-static` membangun halaman sekali saat build lalu tidak pernah lagi, `revalidate = 3600` membangunnya ulang di latar belakang paling cepat sejam sekali sebagai ISR, sedangkan `force-dynamic` melewati cache sepenuhnya dan merender di setiap permintaan.',
      ),
      p(
        "Potongan kedua bekerja **setingkat pemanggilan**, yang lebih halus dan biasanya itulah yang kamu butuhkan. `next: { revalidate: 60 }` menetapkan umur cache untuk satu permintaan data saja, `next: { tags: ['artikel'] }` memberinya label sehingga bisa dibuang berdasarkan peristiwa alih-alih waktu, sedangkan `cache: 'no-store'` mematikan cache untuk data yang harus selalu segar, misalnya saldo atau notifikasi.",
      ),
      p(
        'Perbedaan `revalidate` dan `tags` layak dipahami sejak awal karena keduanya menjawab pertanyaan berbeda. `revalidate` cocok untuk data yang berubah tak terduga tetapi boleh terlambat sedikit — kamu memilih seberapa basi yang bisa diterima. `tags` cocok saat kamu **tahu persis kapan** datanya berubah, karena kamu sendiri yang mengubahnya; pemakaiannya ada di potongan berikutnya.',
      ),
      callout(
        'warning',
        'Default `fetch` berubah di Next.js 15',
        'Di versi 13–14 ia di-cache secara default, dan banyak orang kaget menemukan datanya basi. Sejak 15, default-nya **tidak** di-cache. Tutorial lama yang menyebut "fetch otomatis di-cache" sudah tidak berlaku.',
      ),

      h2('Revalidasi atas permintaan'),
      code(
        'ts',
        `
        'use server';
        import { revalidatePath, revalidateTag } from 'next/cache';

        export async function terbitkanArtikel(id: string) {
          await api.terbitkan(id);

          revalidateTag('artikel');           // semua fetch bertag 'artikel'
          revalidatePath('/artikel');         // satu rute
          revalidatePath('/', 'layout');      // rute itu dan seluruh turunannya
        }
        `,
      ),
      code(
        'ts',
        `
        // Webhook dari CMS — WAJIB diverifikasi
        export async function POST(req: Request) {
          const tandaTangan = req.headers.get('x-signature');
          const mentah = await req.text();

          if (!verifikasiHmac(mentah, tandaTangan, process.env.WEBHOOK_SECRET!)) {
            return new Response('Tidak sah', { status: 401 });
          }

          revalidateTag('artikel');
          return Response.json({ ok: true });
        }
        `,
      ),
      p(
        "Tiga baris revalidasi di potongan pertama punya jangkauan yang menaik. `revalidateTag('artikel')` membuang setiap hasil `fetch` yang diberi tag itu, di rute mana pun ia dipakai — inilah pasangan dari `next: { tags: [...] }` di atas. `revalidatePath('/artikel')` membuang satu rute. `revalidatePath('/', 'layout')` yang paling luas: argumen kedua `'layout'` membuatnya berlaku untuk rute itu **beserta seluruh turunannya**, jadi praktis membuang hampir semua cache halaman.",
      ),
      p(
        'Perhatikan urutannya: `await api.terbitkan(id)` selesai lebih dulu, baru cache dibuang. Membalik urutan itu menciptakan balapan — cache dibuang, permintaan berikutnya mengambil data yang **belum** berubah, lalu menyimpannya kembali sebagai versi baru yang tetap basi.',
      ),
      p(
        'Di potongan kedua, yang menentukan keamanannya adalah `await req.text()` sebelum verifikasi. Tanda tangan HMAC dihitung dari **byte mentah** yang dikirim pengirim; kalau body sudah diurai menjadi JSON lalu dirangkai ulang, perbedaan spasi atau urutan kunci sudah cukup membuat tanda tangannya tidak cocok. Fungsi `verifikasiHmac` juga wajib memakai perbandingan waktu-konstan agar penyerang tidak bisa menebak tanda tangan dari selisih waktu respons.',
      ),
      callout(
        'danger',
        'Endpoint revalidasi tanpa verifikasi adalah jalur penolakan layanan',
        'Siapa pun yang tahu URL-nya bisa memaksa seluruh cache-mu dibuang berulang kali — dan setiap pembuangan berarti semua permintaan berikutnya menembus ke database. "URL-nya sulit ditebak" bukan kontrol akses.',
      ),

      h2('Cache untuk data privat'),
      code(
        'ts',
        `
        // Data privat TIDAK BOLEH tersimpan di CDN atau proxy bersama
        export async function GET() {
          const data = await ambilDataPengguna();

          return Response.json(data, {
            headers: {
              'Cache-Control': 'private, no-store',
              Vary: 'Authorization',
            },
          });
        }
        `,
      ),
      p(
        'Dua header itu menutup dua celah berbeda. `Cache-Control: private, no-store` menyatakan dua hal: `private` melarang cache **bersama** (CDN, proxy perusahaan) menyimpannya, sementara `no-store` melarang penyimpanan sama sekali — termasuk di disk browser pengguna itu sendiri.',
      ),
      p(
        '`Vary: Authorization` menjawab masalah yang lebih halus, sebab ia memberi tahu cache bahwa isi respons **bergantung** pada nilai header `Authorization`, sehingga jawaban untuk satu token tidak boleh dipakai untuk token lain. Tanpa itu, cache menganggap semua permintaan ke URL yang sama setara, dan itulah mekanisme persis di balik insiden "pengguna A melihat data pengguna B". Untuk data privat, pasang keduanya dan jangan mengandalkan satu saja.',
      ),
      callout(
        'danger',
        'Melewatkan `Vary` bisa menyajikan data orang lain',
        'Kalau respons bergantung pada `Authorization` tapi cache tidak diberi tahu, proxy bersama bisa menyimpan jawaban milik Ana lalu menyajikannya kepada Budi. Untuk data privat, pasangkan `private` dengan `no-store` — dan ingat bahwa `no-cache` **tidak** berarti "jangan simpan".',
      ),

      h2('Memeriksa apa yang benar-benar terjadi'),
      code(
        'bash',
        `
        curl -sI https://contoh.com/artikel/belajar-api | grep -iE \\
          "cache-control|x-vercel-cache|age|cf-cache-status|etag"

        # HIT  = disajikan dari cache
        # MISS = diambil dari asal
        # STALE = disajikan basi sambil disegarkan
        `,
      ),
      p(
        'Perintah ini menjawab pertanyaan yang tidak bisa dijawab kode: apakah aturan cache yang kamu tulis **benar-benar berlaku**. `curl -sI` mengambil hanya headernya, lalu `grep -iE` menyaring lima yang menentukan — `cache-control` (aturan yang kamu kirim), `x-vercel-cache` atau `cf-cache-status` (keputusan CDN-nya), `age` (sudah berapa detik salinan ini tersimpan), dan `etag` (penanda versi isi).',
      ),
      p(
        'Cara membacanya, `MISS` pada permintaan pertama itu normal, tetapi `MISS` yang **selalu** muncul berarti ada yang membatalkan cache, biasanya cookie yang ikut terkirim atau header `Cache-Control` yang lebih ketat dari yang kamu kira. Nilai `age` yang tidak pernah bertambah adalah gejala yang sama. `STALE` justru pertanda sehat pada ISR, sebab pengunjung mendapat halaman lama seketika sementara versi barunya dibangun di latar belakang.',
      ),

      h2('Kesalahan yang mahal'),
      table(
        ['Kesalahan', 'Akibat'],
        [
          ['Data privat di-cache publik', '**Data pengguna disajikan ke orang lain**'],
          ['`no-cache` dikira "jangan simpan"', 'Data sensitif tersimpan di proxy'],
          ['Tanpa `Vary`', 'Respons tertukar antar pengguna'],
          ['TTL terlalu panjang untuk data yang berubah', 'Pengguna melihat data lama'],
          ['Semua `no-store`', 'Kehilangan seluruh manfaat cache'],
        ],
      ),
      callout(
        'tip',
        'Kalau ragu, `no-store`',
        'Kesalahan menyajikan data privat ke orang lain jauh lebih mahal daripada kesalahan tidak memakai cache. Mulai dari `no-store`, lalu longgarkan hanya pada endpoint yang kamu yakin memang publik.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Caching adalah satu-satunya optimasi yang bisa memperbaiki kecepatan seratus kali lipat dan sekaligus menampilkan data yang salah kepada pengguna. Karena itu pertanyaannya bukan "apakah di-cache" melainkan "berapa lama isi ini boleh basi, dan siapa yang boleh melihatnya".',
      ),
      code(
        'text',
        `
        Empat tempat yang menyimpan salinan, dan masing-masing punya
        aturannya sendiri:

          peramban pengunjung    Cache-Control
          CDN                    Cache-Control + s-maxage
          cache framework        revalidate, tag
          basis data / aplikasi  cache buatan sendiri

        Yang paling sering menjadi masalah bukan yang pertama atau
        keempat, melainkan yang kedua: salinan di CDN dilihat SEMUA
        pengunjung, dan memperbaikinya menuntut pembatalan eksplisit.
        `,
      ),
      p(
        'Nilai header yang menentukan perlu dibaca satu per satu, sebab namanya mirip dan artinya jauh berbeda.',
      ),
      table(
        ['Nilai', 'Artinya', 'Dipakai untuk'],
        [
          ['`no-store`', 'Jangan simpan sama sekali, di mana pun', 'Halaman berisi data pribadi'],
          [
            '`no-cache`',
            'Boleh disimpan, WAJIB divalidasi ulang sebelum dipakai',
            'HTML yang sering berubah',
          ],
          [
            '`max-age=60`',
            'Peramban boleh memakainya 60 detik tanpa bertanya',
            'Aset yang berubah sesekali',
          ],
          [
            '`s-maxage=3600`',
            'CDN boleh 1 jam; peramban ikut `max-age`',
            'Halaman publik yang sama untuk semua',
          ],
          [
            '`stale-while-revalidate=60`',
            'Sajikan yang basi, perbarui di latar',
            'Menghilangkan jeda saat cache habis',
          ],
          [
            '`immutable`',
            'Tidak akan pernah berubah, jangan pernah tanya',
            'Berkas bernama dengan hash isinya',
          ],
        ],
      ),
      p(
        'Baris terakhir itu yang membuat aset statis bisa di-cache selamanya tanpa risiko, dan syaratnya ada pada nama berkasnya.',
      ),
      code(
        'text',
        `
        Diperiksa pada build produksi project ini:

          .next/static/chunks/0a9thuh7-d55c.js
          .next/static/chunks/25o46h8mdjlrg.js
          .next/static/vSWvY79vbpK8BjI4thMoG/_buildManifest.js

        Nama berkasnya memuat penanda yang berubah bila isinya berubah.
        Karena itu aturannya bisa sangat agresif:

          /_next/static/*  -> Cache-Control: public, max-age=31536000, immutable
          halaman HTML     -> Cache-Control: no-cache  (validasi tiap kali)

        HTML tidak boleh di-cache lama, sebab ia yang memuat NAMA
        berkas statis yang baru. Bila HTML-nya basi, pengunjung tetap
        memuat berkas lama meski yang baru sudah tersedia.
        `,
        {
          caption:
            'Kombinasi itu yang membuat rilis berlaku seketika sekaligus asetnya tidak pernah diunduh dua kali.',
        },
      ),
      p(
        'Pada Next.js, pembatalan cache punya dua bentuk, dan memilihnya bergantung pada seberapa tepat sasaran yang dibutuhkan.',
      ),
      code(
        'ts',
        `
        // Berbasis waktu: sederhana, dan selalu ada jendela basi.
        export const revalidate = 3600;      // detik

        // Berbasis peristiwa: tepat sasaran, berlaku segera.
        import { revalidatePath, revalidateTag } from 'next/cache';

        export async function simpanArtikel(data: FormData) {
          'use server';
          const artikel = await db.artikel.update({ ... });

          revalidatePath(\`/artikel/\${artikel.slug}\`);   // satu halaman
          revalidateTag('daftar-artikel');               // semua yang bertanda itu
        }

        // Tag dipasang saat data diambil:
        const r = await fetch(url, { next: { tags: ['daftar-artikel'] } });
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan cache tidak menghasilkan error. Ia menghasilkan data yang salah, dan itu jauh lebih sulit diketahui.',
      ),
      code(
        'text',
        `
        1. "Sudah saya ubah, halamannya masih yang lama"

           Periksa dari luar ke dalam:

             curl -sI https://app.contoh.id/artikel/satu | grep -iE 'cache|age|x-'

           Header age menunjukkan berapa detik salinan itu sudah
           tersimpan di CDN. Bila age terus bertambah dan isinya tidak
           berubah, yang perlu dibatalkan adalah cache CDN, bukan
           cache framework.

        2. Halaman pribadi tersaji ke pengunjung lain

           INI YANG PALING BERBAHAYA. Penyebabnya hampir selalu sama:
           halaman yang isinya bergantung pada cookie di-cache tanpa
           Cache-Control: private atau tanpa Vary yang benar.

           Satu pengunjung membuka /dasbor, CDN menyimpannya, dan
           pengunjung berikutnya menerima salinan dasbor orang lain.

           Yang menutupnya:
             halaman berisi data pribadi -> Cache-Control: private, no-store
             dan JANGAN pernah dirender statis

        3. Cache CDN menyajikan jawaban origin yang salah

           Lupa Vary: Origin pada respons CORS. Salinan untuk satu
           origin disajikan ke origin lain, dan peramban menolaknya.
           Gejalanya: gagal untuk sebagian pengguna, berhasil untuk
           yang lain, berubah-ubah.
        `,
      ),
      p(
        'Kelas kedua justru berupa cache yang tidak pernah kena, sehingga manfaatnya nol dan tidak ada yang menyadarinya.',
      ),
      code(
        'text',
        `
        Sebab yang paling sering:

          - URL mengandung parameter yang selalu berbeda
            ?utm_source=... membuat setiap kunjungan menjadi kunci
            cache yang berbeda
          - Set-Cookie ada di respons
            Banyak CDN menolak menyimpan respons yang memasang cookie
          - Cache-Control: no-store terpasang di seluruh respons
            karena middleware memasangnya tanpa pandang bulu
          - Vary terlalu luas
            Vary: User-Agent berarti satu salinan per jenis peramban

        Cara memeriksanya, dan ini yang paling langsung:
          curl -sI <url> | grep -iE 'cf-cache-status|x-vercel-cache|age'
          Jalankan DUA KALI. Yang kedua seharusnya HIT.
        `,
        {
          caption:
            'Menjalankan dua kali adalah pemeriksaan paling murah yang ada, dan paling jarang dilakukan.',
        },
      ),
      p(
        'Ada satu kegagalan lagi yang khas pada cache di sisi aplikasi, dan bentuknya sudah diukur di bab lain.',
      ),
      code(
        'text',
        `
        Diukur di bab Desain API: 50 permintaan bersamaan untuk satu
        kunci cache yang baru saja kedaluwarsa.

          tanpa penggabungan : 50 perhitungan
          dengan penggabungan:  1 perhitungan

        Waktu dindingnya hampir sama, yaitu 122 melawan 121 ms.
        Yang dihemat adalah BEBAN, bukan latensi — dan itu yang
        menentukan apakah basis datamu bertahan saat lonjakan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Caching memberi hasil yang terlihat bagus dengan cepat, dan kesalahannya baru terlihat ketika seseorang melihat data yang bukan miliknya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang `max-age` panjang pada halaman HTML',
            'Biar cepat',
            'HTML memuat nama berkas statis yang baru. HTML basi membuat rilis tidak pernah sampai ke pengunjung',
          ],
          [
            'Meng-cache halaman yang isinya bergantung cookie',
            'Halamannya kan sama',
            'Satu pengunjung menyimpannya di CDN, pengunjung lain menerima salinan dasbor orang lain',
          ],
          [
            'Memakai `no-cache` untuk berarti "jangan simpan"',
            'Namanya juga no-cache',
            '`no-cache` berarti boleh disimpan tapi wajib divalidasi. Yang berarti jangan simpan adalah `no-store`',
          ],
          [
            'Lupa `Vary: Origin` pada respons CORS',
            'Cuma header cache',
            'Salinan untuk satu origin disajikan ke origin lain. Gagalnya berubah-ubah dan sangat sulit ditelusuri',
          ],
          [
            'Memakai `revalidate` sangat kecil untuk semua halaman',
            'Biar selalu segar',
            'Itu menghapus manfaat cache dan memindahkan bebannya ke server. Pakai pembatalan berbasis peristiwa',
          ],
          [
            'Menganggap cache bekerja tanpa memeriksanya',
            'Headernya sudah dipasang',
            'Jalankan `curl -sI` dua kali dan baca status cache-nya. Yang kedua seharusnya HIT',
          ],
        ],
      ),
      p(
        'Satu aturan menutup baris paling berbahaya di tabel itu, dan ia layak dijadikan kebiasaan tetap. Setiap respons yang isinya bergantung pada siapa yang meminta harus menyatakan itu secara eksplisit dengan `Cache-Control: private, no-store`, dan tidak boleh pernah dirender sebagai halaman statis. Kecepatan yang didapat dari meng-cache halaman pribadi tidak pernah sebanding dengan satu kejadian seorang pengguna melihat data pengguna lain.',
      ),
      references(
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN',
          note: 'Seluruh direktif beserta beda `max-age` dan `s-maxage`',
        },
        {
          label: 'HTTP caching',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching',
          source: 'MDN',
          note: 'Gambaran utuh cara peramban dan cache bersama memutuskan menyimpan',
        },
        {
          label: 'Caching',
          href: 'https://vercel.com/docs/edge-network/caching',
          source: 'Vercel Docs',
          note: 'Penerapan aturan itu pada satu CDN nyata',
        },
        {
          label: 'Caching in Next.js',
          href: 'https://nextjs.org/docs/app/guides/caching',
          source: 'Next.js Docs',
          note: 'Lapisan cache milik framework yang duduk di atas cache HTTP',
        },
      ),
    ],
  ),
];
