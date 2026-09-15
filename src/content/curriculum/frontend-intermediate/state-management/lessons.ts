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
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Intermediate — Chapter 5, all eleven lessons.
 *
 * The chapter is built around one claim: most "state management problems" are really
 * classification problems. Lesson 1 establishes the five categories and every later lesson is
 * an answer to one of them, so the tool comparisons never float free of the question they solve.
 *
 * Library APIs shown here target the versions declared in the chapter's `stackVersions`.
 */
export const lessons: LessonDraft[] = [
  written(
    'peta-kategori-state',
    'Peta Kategori State',
    19,
    'Lima jenis state yang sering disamakan padahal butuh perlakuan berbeda.',
    [
      p(
        'Hampir semua kebingungan soal "state management" berasal dari satu kesalahan yang sama: memperlakukan semua data seolah sejenis. Padahal data di sebuah aplikasi punya asal, pemilik, dan mode gagal yang berbeda-beda. Salah kategori berarti salah alat — dan alat yang salah terasa berat bukan karena library-nya buruk, melainkan karena ia sedang dipaksa mengerjakan tugas yang bukan miliknya.',
      ),

      terms(
        {
          term: 'state',
          meaning:
            'Data yang bisa berubah dan yang perubahannya harus tercermin di layar. Kata kuncinya "berubah" — nilai yang tidak pernah berubah bukan state, ia konstanta. Dan nilai yang bisa **dihitung** dari state lain juga bukan state; itu derived value, dan menyimpannya adalah awal dari data yang tidak sinkron.',
        },
        {
          term: 'state management',
          meaning:
            'Payung untuk seluruh keputusan soal "data ini disimpan di mana, siapa yang boleh mengubahnya, dan siapa yang perlu tahu saat ia berubah". Klaim seluruh bab ini: sebagian besar "masalah state management" sebenarnya **masalah pengklasifikasian** — salah kategori berarti salah alat.',
        },
        {
          term: 'client state',
          meaning:
            'Data yang **dimiliki browser**: tema gelap/terang, sidebar terbuka, isi keranjang belanja. Tidak ada versi "benar" di tempat lain — yang ada di layar itulah kebenarannya. Karena itu ia tidak perlu disinkronkan dengan siapa pun.',
        },
        {
          term: 'server state',
          meaning:
            'Data yang **dimiliki server**: daftar produk, profil pengguna, notifikasi. Yang ada di browser cuma **salinan** yang bisa basi kapan saja. Sifat inilah yang membuatnya butuh alat berbeda — ia punya mode gagal (permintaan gagal), umur (kapan dianggap basi), dan bisa diminta beberapa komponen sekaligus.',
        },
        {
          term: 'URL state',
          meaning:
            'State yang tersimpan di alamat halaman — filter, urutan, nomor halaman, kata kunci. Ujinya satu kalimat: **apakah ini harus bisa dibagikan lewat tautan?** Kalau ya, tempatnya di URL. Filter yang hilang saat halaman di-refresh adalah bug, bukan fitur.',
        },
        {
          term: 'form state',
          meaning:
            'Nilai tiap field, pesan error validasi, dan status pengiriman sebuah formulir. Ia punya siklus hidup sendiri yang pendek dan aturan sendiri (kapan divalidasi, kapan error ditampilkan), jadi memaksanya ke store global hampir selalu memperumit.',
        },
        {
          term: 'staleness',
          meaning:
            'Keadaan ketika salinan data di browser sudah tidak sama dengan yang di server. Konsep ini **hanya ada** pada server state — dan itulah satu perbedaan paling tajam yang membuat menyalin data server ke store global jadi mahal.',
        },
        {
          term: 'deduplikasi permintaan',
          meaning:
            'Menggabungkan beberapa permintaan identik yang terjadi berbarengan menjadi satu. Tanpa itu, tiga komponen yang sama-sama butuh `/api/produk` menembak API tiga kali. Alat server state melakukannya otomatis lewat query key; store global tidak.',
        },
        {
          term: 'invalidasi',
          meaning:
            'Menandai data cache sebagai tidak berlaku lagi agar diambil ulang — biasanya setelah kamu mengubah sesuatu. Contoh: setelah menambah produk, daftar produk harus diinvalidasi. Menulis ini dengan tangan di store global berarti kamu harus ingat setiap tempat yang terpengaruh.',
        },
      ),

      h2('Lima kategori'),
      table(
        ['Kategori', 'Contoh', 'Siapa pemiliknya', 'Alat yang tepat'],
        [
          [
            'Lokal',
            'Input terbuka/tertutup, teks yang sedang diketik',
            'Satu komponen',
            '`useState`, `useReducer`',
          ],
          [
            'Client global',
            'Tema, sidebar terbuka, keranjang belanja',
            'Aplikasi',
            'Context, Zustand, Redux, Jotai',
          ],
          [
            'Server',
            'Daftar produk, profil pengguna, notifikasi',
            '**Server**',
            'TanStack Query, SWR, RTK Query',
          ],
          [
            'URL',
            'Filter, sort, halaman ke berapa, kata kunci',
            'Alamat halaman',
            '`searchParams`, `nuqs`',
          ],
          [
            'Form',
            'Nilai field, error validasi, status submit',
            'Satu formulir',
            'React Hook Form, form state bawaan',
          ],
        ],
        'Kategori menentukan alat. Urutannya juga urutan seberapa sering orang salah memilih.',
      ),

      h2('Pertanyaan yang memisahkan kategori'),
      ol(
        '**Siapa source of truth-nya?** Kalau jawabannya "server", ini server state — bukan client state, seberapa pun ia terlihat seperti data biasa.',
        '**Apakah harus bisa dibagikan lewat tautan?** Kalau ya, tempatnya di URL. Filter yang hilang saat halaman di-refresh adalah bug, bukan fitur.',
        '**Berapa komponen yang benar-benar membacanya?** Kalau satu, ia lokal. State global dengan satu pembaca adalah biaya tanpa manfaat.',
        '**Apakah ia bisa dihitung dari state lain?** Kalau ya, ia bukan state sama sekali — hitung saat render.',
      ),

      h2('Kesalahan yang paling mahal'),
      p(
        'Menyalin data server ke store global. Kelihatannya rapi: satu tempat untuk semua data. Yang sebenarnya terjadi adalah kamu baru saja berjanji akan menulis ulang caching, deduplikasi permintaan, refetch saat window kembali fokus, invalidasi setelah mutasi, penanganan `loading`/`error` per permintaan, dan pembatalan permintaan yang sudah usang — dengan tangan, tanpa dibayar.',
      ),
      compare(
        {
          title: 'Server state di store global',
          lang: 'ts',
          code: `
          const useStore = create((set) => ({
            produk: [],
            loading: false,
            error: null,
            async ambilProduk() {
              set({ loading: true, error: null });
              try {
                const res = await fetch('/api/produk');
                set({ produk: await res.json(), loading: false });
              } catch (e) {
                set({ error: e, loading: false });
              }
            },
          }));
          `,
          notes: [
            'Dua komponen yang memanggil ini serentak akan menembak API dua kali',
            'Tidak ada staleness: data tetap dipakai walau sudah satu jam',
            'Setiap entitas baru berarti menyalin seluruh blok ini lagi',
          ],
        },
        {
          title: 'Server state di alat yang memang untuk itu',
          lang: 'ts',
          code: `
          const { data, isPending, error } = useQuery({
            queryKey: ['produk'],
            queryFn: () => fetch('/api/produk').then((r) => r.json()),
          });
          `,
          notes: [
            'Dua komponen dengan query key sama berbagi satu permintaan',
            'Staleness, refetch, dan pembatalan sudah menjadi bawaan',
            'Entitas baru = satu `useQuery` lagi, bukan blok baru',
          ],
        },
      ),
      p(
        'Perbandingan panjang-pendek di sini menyesatkan kalau dibaca sebagai "yang kanan lebih ringkas". Yang sebenarnya berbeda adalah **apa yang sudah tersedia**. Kolom kiri bukan kode yang buruk, sebab ia benar untuk apa yang ia tulis. Masalahnya ada pada tiga catatan di bawahnya, yang semuanya tentang hal yang **tidak ditulis**. Dua komponen yang memanggil `ambilProduk` bersamaan akan menembak API dua kali karena tidak ada deduplikasi. Data yang sudah satu jam tetap dipakai karena tidak ada konsep staleness. Dan begitu ada entitas kedua seperti pesanan, pengguna, atau ulasan, seluruh blok `loading`/`error`/`try-catch` itu disalin lagi, dengan peluang baru untuk berbeda satu sama lain. Kolom kanan tidak menghilangkan pekerjaan itu, melainkan hanya memindahkannya ke alat yang memang dirancang untuk menanggungnya.',
      ),

      h2('Kategori bukan hierarki'),
      p(
        'Satu halaman biasanya memakai keempat atau kelima kategori sekaligus, dan itu normal. Halaman daftar produk yang sehat terlihat begini: kata kunci dan filter di **URL**, daftar produknya dari **TanStack Query**, keranjang di **Zustand**, dan status dropdown filter yang sedang terbuka cukup `useState` **lokal**.',
      ),
      callout(
        'tip',
        'Cara memakai bab ini',
        'Sepuluh sub-bab berikutnya adalah jawaban untuk kategori-kategori di atas. Kalau kamu sedang bingung memilih library, kembali ke tabel ini dulu — pertanyaannya hampir selalu "ini kategori apa", bukan "library mana yang terbaik".',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim memasang Redux di minggu pertama karena aplikasinya akan besar. Enam bulan kemudian, store berisi dua puluh tiga potongan dan sembilan belas di antaranya adalah data dari server yang disalin ke sana lalu harus disegarkan manual. Tim kedua tidak memasang apa pun, dan setelah enam bulan punya lima belas komponen yang meneruskan props tujuh tingkat. Keduanya salah, dan keduanya berasal dari keputusan yang sama, yaitu memilih alat sebelum tahu jenis state yang dihadapi.',
      ),
      p(
        'Yang menentukan pilihan bukan besarnya aplikasi melainkan **jenis state**-nya. Ada lima jenis, dan masing-masing punya jawaban yang berbeda.',
      ),
      table(
        ['Jenis state', 'Contoh', 'Tempatnya', 'Kenapa'],
        [
          [
            'Lokal komponen',
            'Dialog terbuka, tab aktif, isi kotak input',
            '`useState`',
            'Hanya satu komponen yang membacanya',
          ],
          [
            'Dibagi beberapa komponen',
            'Filter yang dipakai sidebar dan daftar',
            'Angkat ke induk bersama',
            'Cukup satu sumber kebenaran di induk terdekat',
          ],
          [
            'Global dan jarang berubah',
            'Tema, bahasa, pengguna yang masuk',
            'Context',
            'Sedikit perubahan, jadi penggambaran ulang menyeluruh tidak terasa',
          ],
          [
            'Global dan sering berubah',
            'Keranjang, papan kolaboratif, notifikasi',
            'Pustaka store',
            'Butuh pemilihan bagian supaya tidak semua ikut digambar ulang',
          ],
          [
            'Data dari server',
            'Daftar produk, detail pesanan, profil',
            'Pustaka pengambil data',
            'Punya cache, kesegaran, dan penanganan gagal sendiri',
          ],
          [
            'Bisa dibagikan lewat tautan',
            'Kata pencarian, halaman keberapa, urutan',
            'Alamat halaman',
            'Harus bertahan setelah muat ulang dan bisa dibagikan',
          ],
        ],
        'Enam baris, dan hanya dua di antaranya membutuhkan pustaka tambahan.',
      ),
      p(
        'Baris kelima adalah yang paling sering salah tempat, dan itu penyebab store dua puluh tiga potongan pada cerita di awal. Data dari server bukan state biasa. Ia punya salinan asli di tempat lain, bisa basi, bisa gagal dimuat, dan bisa diminta ulang. Menyimpannya di store global berarti kamu menulis sendiri seluruh cache, penandaan basi, dan penyegaran yang sudah disediakan pustaka pengambil data.',
      ),
      p(
        'Baris terakhir adalah yang paling sering dilupakan sama sekali. Filter dan nomor halaman yang disimpan di `useState` akan hilang saat halaman dimuat ulang, tidak bisa dibagikan lewat tautan, dan tidak mengikuti tombol kembali. Alamat halaman adalah tempat penyimpanan yang sudah tersedia dan sudah dipahami setiap pengguna, dan mengabaikannya berarti membangun ulang sesuatu yang sudah ada.',
      ),
      code(
        'text',
        `
        Urutan bertanya yang jarang keliru:

        1. Bisakah nilai ini DIHITUNG dari yang sudah ada?
           -> Kalau ya, ia bukan state sama sekali. Hitung saat render.

        2. Apakah ia berasal dari server?
           -> Kalau ya, pakai pustaka pengambil data. Jangan salin ke store.

        3. Apakah pengguna perlu bisa membagikannya lewat tautan?
           -> Kalau ya, tempatnya alamat halaman.

        4. Apakah lebih dari satu komponen membacanya?
           -> Kalau tidak, useState di komponen itu. Selesai.

        5. Apakah keduanya bersebelahan di pohon?
           -> Kalau ya, angkat ke induk bersama. Selesai.

        6. Seberapa sering ia berubah?
           -> Jarang: Context. Sering dan dibaca banyak: pustaka store.
        `,
        { caption: 'Empat pertanyaan pertama menutup sebagian besar kebutuhan.' },
      ),
      p(
        'Yang layak diperhatikan dari urutan itu, pustaka baru muncul di langkah keenam. Lima langkah sebelumnya diselesaikan dengan hal yang sudah ada di React dan di peramban. Ini bukan sikap anti-pustaka melainkan urutan yang mencegah kamu membayar biaya perawatan untuk kemampuan yang tidak kamu butuhkan.',
      ),
      callout(
        'warning',
        'Setiap pustaka state adalah kontrak jangka panjang',
        'Ia menambah satu API yang harus dipelajari setiap orang baru, satu dependensi yang harus diikuti versinya, dan satu cara berpikir yang menyebar ke seluruh kode. Biaya itu sepadan kalau kebutuhannya nyata. Memasangnya karena aplikasinya akan besar adalah menebak, dan tebakan itu sering salah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Salah menempatkan state jarang melempar error. Empat gejala berikut adalah cara mengenalinya, dan yang pertama diukur dengan React 19 sungguhan.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19: satu nilai berubah di Context.

        CONTEXT — setelah menaikkan a:
          ctx-A render
          ctx-B render (hanya baca b)     <- ikut, padahal b tidak berubah
        `,
        { caption: 'Diukur sungguhan. Seluruh pembaca Context ikut digambar ulang.' },
      ),
      p(
        'Komponen `ctx-B` hanya membaca `b` dan tidak pernah menyentuh `a`, dan ia tetap digambar ulang. Ini bukan bug melainkan cara kerja Context, yaitu seluruh pembacanya diberi tahu saat nilainya berubah tanpa cara memilih bagian. Untuk tema yang berubah sekali sehari itu tidak masalah. Untuk keranjang yang berubah tiap klik dan dibaca lima puluh komponen, itu penyebab kelambatan.',
      ),
      code(
        'text',
        `
        # Data produk disimpan di store global.
        # Pengguna membuka halaman lain lalu kembali.

        # Daftar produk masih menampilkan data dari lima menit lalu.
        # Tidak ada yang memberi tahu bahwa datanya sudah basi.
        `,
        { caption: 'Data server disimpan sebagai state global.' },
      ),
      p(
        'Tidak ada error, dan datanya salah tanpa satu pun tanda. Store global tidak punya konsep kesegaran, sehingga kamu harus menulis sendiri kapan data dianggap basi, kapan disegarkan, dan apa yang terjadi kalau penyegarannya gagal. Ketiganya adalah kemampuan bawaan pustaka pengambil data, dan menulisnya sendiri berarti membangun ulang pustaka itu sepotong demi sepotong.',
      ),
      code(
        'text',
        `
        # Pengguna menyetel filter, lalu menyalin alamat halaman
        # dan mengirimkannya ke rekan.

        # Rekan membuka tautan itu dan melihat daftar tanpa filter.
        `,
        { caption: 'Filter disimpan di `useState`, bukan di alamat halaman.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah kegunaannya. Gejala lain dari penyebab yang sama, yaitu memuat ulang halaman mengembalikan filter ke bawaan, dan tombol kembali tidak mengembalikan filter sebelumnya. Ketiganya selesai sekaligus dengan memindahkan nilainya ke parameter alamat.',
      ),
      code(
        'text',
        `
        <Halaman filter={filter}>
          <Isi filter={filter}>
            <Panel filter={filter}>
              <Kartu filter={filter}>
                <Tombol filter={filter} />

        # Tiga komponen di tengah tidak memakainya sama sekali.
        `,
        { caption: 'Props diteruskan lewat komponen yang tidak membutuhkannya.' },
      ),
      p(
        'Ini gejala yang sering dipakai sebagai alasan memasang pustaka state, padahal jalan keluarnya sering lebih sederhana. Komposisi lewat `children` menyelesaikan sebagian besar kasusnya, sebab elemen bisa dibuat di tempat datanya tersedia lalu dikirim ke bawah. Pustaka baru diperlukan kalau nilainya dibutuhkan di banyak cabang yang berbeda.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Komponen digambar ulang untuk nilai yang tidak ia baca',
            'Context tidak punya pemilihan bagian',
            'Pisahkan konteksnya, atau pakai pustaka store untuk state yang sering berubah',
          ],
          [
            'Data basi tanpa ada yang memberi tahu',
            'Data server disimpan sebagai state global',
            'Pakai pustaka pengambil data yang punya cache dan kesegaran',
          ],
          [
            'Tautan yang dibagikan tidak membawa filter',
            'Filter disimpan di `useState`',
            'Pindahkan ke parameter alamat halaman',
          ],
          [
            'Props diteruskan lima tingkat tanpa dipakai',
            'Jarak antara pemilik dan pemakai terlalu jauh',
            'Coba komposisi lewat `children` lebih dulu, baru Context',
          ],
          [
            'Store berisi puluhan potongan yang sebagian besar data server',
            'Pustaka dipasang sebelum jenis statenya dipetakan',
            'Pindahkan data server ke pustaka pengambil data',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di bawah bukan soal salah memakai alat, melainkan soal memilih alat sebelum tahu masalahnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang pustaka state di minggu pertama',
            'Aplikasinya akan besar',
            'Sebagian besar isinya ternyata data server yang butuh alat berbeda. Petakan jenis statenya dulu',
          ],
          [
            'Menyimpan data server di store global',
            'Semua state di satu tempat',
            'Kamu menulis sendiri cache, kesegaran, dan penyegaran yang sudah disediakan pustaka pengambil data',
          ],
          [
            'Memakai Context untuk state yang berubah tiap detik',
            'Ia sudah bawaan React',
            'Seluruh pembacanya digambar ulang tiap perubahan, dan itu terukur',
          ],
          [
            'Menghindari pustaka sama sekali karena ingin sederhana',
            'Lebih sedikit dependensi lebih baik',
            'Props tujuh tingkat dan cache yang ditulis sendiri jauh lebih mahal dirawat daripada satu pustaka',
          ],
          [
            'Menyimpan nilai yang bisa dihitung',
            'Supaya tidak dihitung ulang',
            'Dua sumber kebenaran yang harus dijaga sinkron. Ini berlaku di store global juga, bukan hanya di `useState`',
          ],
          [
            'Melupakan alamat halaman sebagai tempat penyimpanan',
            'Ia kan bukan state',
            'Ia satu-satunya tempat yang bertahan setelah muat ulang dan bisa dibagikan, dan tidak butuh pustaka apa pun',
          ],
        ],
      ),
      p(
        'Baris keempat perlu ditegaskan supaya sikapnya seimbang. Menghindari pustaka bukan tujuan. Kalau kamu menemukan diri menulis cache dengan penandaan basi, penghapusan otomatis, dan penggabungan permintaan, kamu sedang menulis ulang pustaka pengambil data dengan lebih sedikit pengujian. Pada titik itu, memasangnya justru pilihan yang lebih hemat.',
      ),
      callout(
        'info',
        'Sepuluh sub-bab berikutnya adalah jawaban untuk kategori di atas',
        'Kalau kamu sudah tahu jenis state yang dihadapi, bacalah sub-bab yang sesuai dan lewati sisanya. Kalau belum, urutan bertanya di studi kasus adalah tempat memulai. Yang tidak dianjurkan adalah membaca seluruhnya lalu memilih yang namanya paling sering disebut.',
      ),
      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Panduan resmi React soal memilih tempat menyimpan state sebelum memilih library.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip yang mendasari tabel kategori di atas, termasuk larangan menduplikasi state.',
        },
        {
          label: 'Why TanStack Query?',
          href: 'https://tanstack.com/query/latest/docs/framework/react/overview',
          source: 'TanStack Query',
          note: 'Alasan resmi kenapa server state butuh alat sendiri, bukan store global.',
        },
        {
          label: 'searchParams',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional',
          source: 'Next.js',
          note: 'Cara membaca state yang tersimpan di URL pada App Router.',
        },
      ),
    ],
  ),

  written(
    'belum-butuh-library',
    'Kapan Kamu Belum Butuh Library',
    18,
    'Sebagian besar aplikasi kecil tidak membutuhkannya.',
    [
      p(
        'Sebelum menambah dependency, ada dua teknik bawaan React yang menyelesaikan mayoritas kasus: **mengangkat state** dan **komposisi**. Keduanya gratis, tidak menambah ukuran bundle, dan tidak perlu dipelajari orang lain yang membaca kodemu.',
      ),

      terms(
        {
          term: 'dependency',
          meaning:
            'Paket pihak ketiga yang project-mu ikut pasang dan andalkan. Setiap dependency adalah **kontrak jangka panjang**: satu lagi API untuk dipelajari, satu lagi cara debug, satu lagi sumber "kenapa komponen ini re-render", dan satu lagi yang harus ikut di-update.',
        },
        {
          term: 'lifting state up',
          meaning:
            'Memindahkan state ke komponen **induk terdekat** yang memuat semua komponen yang membutuhkannya. Ini bukan solusi kelas dua — ini solusi **default**, dan React memang dirancang untuk ini. Baru setelah induk terdekatnya jadi terlalu tinggi, alat lain layak dipertimbangkan.',
        },
        {
          term: 'sibling component',
          meaning:
            'Dua komponen yang berada di bawah induk yang sama. Mereka tidak bisa saling bicara langsung — komunikasi harus lewat induknya. Itu bukan keterbatasan React, melainkan konsekuensi aliran data satu arah yang membuat asal-usul sebuah nilai selalu bisa dilacak.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Dibaca "prop driling", artinya **mengebor props**. Sebuah nilai dioper turun melewati beberapa lapisan komponen yang sendirinya tidak memakainya — mereka cuma jadi kurir. Ini alasan paling umum orang lari ke library global, padahal sering kali obatnya bukan library.',
        },
        {
          term: 'komposisi',
          meaning:
            'Menyusun antarmuka dengan mengoper **elemen** (`<Header user={user} />`), bukan **data** (`user={user}`). Bedanya besar: komponen pembungkus tidak perlu tahu apa pun tentang data yang lewat, karena elemennya sudah dibuat di tempat datanya tersedia.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus berisi apa pun yang kamu tulis di antara tag pembuka dan penutup sebuah komponen. Ia adalah bentuk komposisi paling sederhana — dan sekaligus alat paling ampuh melawan prop drilling, karena isinya dibuat oleh pemanggil, bukan oleh komponennya.',
        },
        {
          term: 'bundle',
          meaning:
            'Berkas JavaScript hasil penggabungan seluruh kode aplikasimu yang harus diunduh browser. Setiap library yang ditambahkan membesarkannya, dan setiap kilobyte tambahan berarti halaman lebih lambat bisa dipakai — terutama di jaringan lambat dan perangkat murah.',
        },
        {
          term: 'unmount',
          meaning:
            'Saat React mencabut sebuah komponen dari layar. Seluruh state di dalamnya ikut hilang. Kalau sebuah nilai **harus bertahan** melewati unmount, misalnya isi keranjang saat pengguna berpindah halaman, itu salah satu tanda sah bahwa state-nya perlu tempat di luar komponen.',
        },
      ),

      h2('Mengangkat state (lifting state up)'),
      p(
        'Kalau dua sibling component butuh data yang sama, pindahkan datanya ke induk terdekat yang memuat keduanya. Itu saja. Ini bukan solusi kelas dua — ini solusi default, dan React memang dirancang untuk ini.',
      ),
      code(
        'tsx',
        `
        function Halaman() {
          // Satu source of truth, di induk terdekat yang memuat kedua anak.
          const [terpilih, setTerpilih] = useState<string | null>(null);

          return (
            <>
              <DaftarProduk terpilih={terpilih} onPilih={setTerpilih} />
              <DetailProduk id={terpilih} />
            </>
          );
        }
        `,
      ),
      p(
        'Perhatikan `terpilih` hidup di `Halaman` dan bukan di salah satu anaknya, dan itu **satu-satunya** keputusan yang dibuat di sini. Dari situ arahnya mengikuti pola data-turun-perubahan-naik: `DaftarProduk` menerima nilainya untuk menandai mana yang aktif, dan menerima `onPilih` untuk memberi tahu ketika pengguna memilih yang lain. `DetailProduk` hanya menerima nilainya, karena ia tidak pernah mengubah pilihan. Yang layak digarisbawahi adalah apa yang **tidak** ada, sebab tidak ada context, tidak ada store, dan tidak ada library. Untuk dua sibling component, mengangkat state ke induk terdekat memang jawaban yang lengkap, dan menjangkau lebih jauh dari itu sebelum ada masalah nyata hanya menambah lapisan tanpa menambah kemampuan.',
      ),

      h2('Komposisi: obat untuk prop drilling'),
      p(
        'Alasan orang lari ke library global biasanya bukan "state-nya rumit", tapi "props-nya harus lewat lima lapisan". Sering kali itu bisa diselesaikan tanpa state global sama sekali — dengan mengoper **elemen**, bukan **data**.',
      ),
      compare(
        {
          title: 'Prop drilling',
          lang: 'tsx',
          code: `
          <Layout user={user}>
            {/* Layout tidak memakai user, */}
            {/* ia cuma meneruskannya */}
          </Layout>

          function Layout({ user, children }) {
            return (
              <div>
                <Header user={user} />
                {children}
              </div>
            );
          }
          `,
          notes: ['`Layout` dipaksa tahu soal `user` padahal tidak memakainya'],
        },
        {
          title: 'Komposisi',
          lang: 'tsx',
          code: `
          <Layout header={<Header user={user} />}>
            <Konten />
          </Layout>

          function Layout({ header, children }) {
            return (
              <div>
                {header}
                {children}
              </div>
            );
          }
          `,
          notes: [
            '`Layout` tidak tahu apa pun soal `user`',
            'Elemennya dibuat di tempat datanya sudah ada',
          ],
        },
      ),
      p(
        'Teknik ini dibahas lebih dalam di Bab 6. Yang penting sekarang: prop drilling sepanjang **dua atau tiga** lapisan bukan masalah yang layak dibayar dengan sebuah library.',
      ),

      h2('Kapan tanda-tandanya berubah'),
      p('Barulah pertimbangkan alat tambahan ketika muncul salah satu dari ini:'),
      ul(
        'Data yang sama dibutuhkan di **cabang pohon yang berjauhan** — misalnya sidebar dan modal di ujung lain aplikasi.',
        'Induk yang harus menampung state jadi **terlalu tinggi**, sehingga perubahan kecil melakukan re-render setengah halaman.',
        'Kamu mulai **menyalin state yang sama** ke dua tempat dan menyinkronkannya dengan tangan.',
        'State-nya perlu **bertahan** melewati unmount komponen yang memakainya.',
      ),
      callout(
        'warning',
        'Biaya yang tidak kelihatan di awal',
        'Setiap library state adalah kontrak jangka panjang: satu lagi API untuk dipelajari, satu lagi cara debug, satu lagi sumber "kenapa komponen ini re-render". Untuk aplikasi belajar atau proyek kecil, `useState` plus komposisi hampir selalu pilihan yang lebih dewasa — bukan yang lebih malas.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Sebuah aplikasi dasbor memasang pustaka state karena ada tiga komponen yang perlu berbagi filter tanggal. Setelah dipasang, muncul satu store, satu berkas potongan, satu berkas selektor, dan satu berkas aksi. Total empat berkas baru untuk berbagi satu object berisi dua tanggal. Ketiga komponen itu ternyata bersebelahan di pohon, dan mengangkat state ke induknya menyelesaikannya dalam enam baris.',
      ),
      p(
        'Sebelum memasang apa pun, ada tiga jalan yang sudah tersedia di React dan sering cukup. Ketiganya dibahas di kategori ini dan layak dicoba berurutan.',
      ),
      compare(
        {
          title: 'Dengan pustaka store',
          lang: 'tsx',
          code: `
          // src/store/filter.ts
          export const useFilter = buatStore((set) => ({
            dari: null,
            sampai: null,
            setRentang: (dari, sampai) => set({ dari, sampai }),
          }));

          // Tiga komponen memakainya:
          function PilihTanggal() {
            const setRentang = useFilter((s) => s.setRentang);
            // ...
          }
          function Ringkasan() {
            const dari = useFilter((s) => s.dari);
            // ...
          }
          `,
          notes: ['Satu dependensi, satu API baru, empat berkas'],
        },
        {
          title: 'Mengangkat ke induk bersama',
          lang: 'tsx',
          code: `
          function PanelDasbor() {
            const [rentang, setRentang] = useState<Rentang>({ dari: null, sampai: null });

            return (
              <>
                <PilihTanggal nilai={rentang} onUbah={setRentang} />
                <Ringkasan rentang={rentang} />
                <Grafik rentang={rentang} />
              </>
            );
          }
          `,
          notes: ['Nol dependensi, enam baris, dan alur datanya terlihat langsung'],
        },
      ),
      p(
        'Kolom kanan bukan sekadar lebih pendek. Alur datanya terlihat sepenuhnya di satu tempat, sehingga siapa pun yang membaca `PanelDasbor` langsung tahu siapa yang memiliki `rentang` dan siapa yang mengubahnya. Pada versi store, informasi itu tersebar dan harus dikumpulkan dari beberapa berkas.',
      ),
      code(
        'tsx',
        `
        // Jalan kedua: komposisi, untuk props yang harus melewati banyak tingkat.
        // BURUK: 'pengguna' diteruskan lima tingkat, tiga di antaranya tidak memakainya.
        <Halaman pengguna={pengguna}>
          <Isi pengguna={pengguna}>
            <Panel pengguna={pengguna}>
              <Kartu pengguna={pengguna}>
                <Avatar pengguna={pengguna} />

        // BAIK: buat elemennya di tempat datanya tersedia, kirim sebagai children.
        <Halaman>
          <Isi>
            <Panel>
              <Kartu>
                <Avatar pengguna={pengguna} />   {/* dibuat di sini, bukan diteruskan */}
              </Kartu>
            </Panel>
          </Isi>
        </Halaman>
        `,
        { caption: 'Komposisi menyelesaikan sebagian besar kasus props berantai.' },
      ),
      p(
        'Ini jalan keluar yang paling sering dilewatkan padahal paling sederhana. Karena elemen React hanya object seperti dibahas di Bab 6 Frontend Basic, ia bisa dibuat di tempat datanya tersedia lalu dikirim ke bawah sebagai `children`. Tiga komponen di tengah tidak perlu tahu apa pun tentang `pengguna`, dan tidak ada satu pun dependensi baru.',
      ),
      p(
        'Jalan ketiga adalah alamat halaman, dan ia sering menyelesaikan lebih banyak daripada yang diduga. Filter, urutan, nomor halaman, dan tab yang aktif semuanya lebih tepat di sana. Selain menghapus kebutuhan state global, ia sekaligus membuat tautannya bisa dibagikan dan tombol kembali bekerja tanpa satu baris kode tambahan.',
      ),
      code(
        'text',
        `
        Tanda bahwa kamu MEMANG butuh pustaka:

        - Nilainya dibaca di cabang pohon yang berjauhan, bukan bersebelahan
        - Nilainya berubah sering DAN dibaca banyak komponen
        - Komposisi sudah dicoba dan bentuknya justru jadi lebih rumit
        - Ada beberapa komponen yang perlu mengubahnya dari tempat berbeda

        Tanda bahwa kamu BELUM butuh:

        - Yang berbagi hanya dua atau tiga komponen bersebelahan
        - Nilainya berasal dari server
        - Nilainya bisa dibagikan lewat tautan
        - Kamu belum mencoba mengangkat state ke induk bersama
        `,
        { caption: 'Daftar kedua jauh lebih sering benar daripada yang pertama.' },
      ),
      callout(
        'tip',
        'Coba berurutan, dan berhenti begitu satu berhasil',
        'Angkat ke induk bersama lebih dulu. Kalau jaraknya terlalu jauh, coba komposisi. Kalau nilainya layak dibagikan lewat tautan, pindahkan ke alamat. Kalau ketiganya sudah dicoba dan bentuknya justru lebih rumit, barulah pustaka. Urutan itu memastikan kamu membayar biaya perawatan hanya untuk kemampuan yang benar-benar dibutuhkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Memaksakan jalan tanpa pustaka punya gejalanya sendiri, dan mengenalinya menentukan kapan berhenti mencoba.',
      ),
      code(
        'text',
        `
        function PanelDasbor() {
          const [rentang, setRentang] = useState(...);
          const [filter, setFilter] = useState(...);
          const [urut, setUrut] = useState(...);
          const [terpilih, setTerpilih] = useState(...);
          // ...delapan state lagi

          return <Isi rentang={rentang} setRentang={setRentang} filter={filter} ... />;
        }

        # Induk menjadi tempat penampungan state, dan propsnya belasan.
        `,
        { caption: 'Mengangkat state terlalu banyak ke satu induk.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa komponen induk yang tidak melakukan apa pun selain memegang state dan meneruskannya. Ini tanda bahwa mengangkat sudah mencapai batasnya. Ada dua jalan keluar, yaitu mengelompokkan state yang berhubungan dengan `useReducer`, atau memindahkan sebagiannya ke Context atau pustaka.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19: mengetik satu huruf di kotak pencarian
        # yang statenya berada di komponen halaman.

        # Seluruh isi halaman digambar ulang, termasuk grafik berat
        # yang tidak ada hubungannya dengan pencarian.
        `,
        { caption: 'State diangkat lebih tinggi daripada yang dibutuhkan.' },
      ),
      p(
        'React menggambar ulang komponen tempat state berubah beserta seluruh keturunannya. Mengangkat ke induk yang terlalu tinggi berarti seluruh saudara ikut terkena. Turunkan sampai induk bersama yang **sesungguhnya**, yaitu komponen terdekat yang memiliki seluruh pembacanya, dan jangan lebih tinggi dari itu.',
      ),
      code(
        'text',
        `
        <Halaman>
          <Isi>{(a) => <Panel>{(b) => <Kartu>{(c) => ...}</Kartu>}</Panel>}</Isi>
        </Halaman>

        # Komposisi dipaksakan, dan bentuknya justru lebih sulit dibaca
        # daripada meneruskan props.
        `,
        { caption: 'Komposisi yang dipaksakan sampai bersarang berlapis.' },
      ),
      p(
        'Komposisi punya batasnya. Kalau menyelesaikan props berantai berarti membuat tiga lapis fungsi bersarang di JSX, ia sudah tidak menolong. Ini justru tanda yang jelas bahwa Context atau pustaka adalah jawaban yang tepat, sebab keduanya menembus kedalaman berapa pun tanpa mengubah bentuk kode di antaranya.',
      ),
      code(
        'text',
        `
        # Empat komponen di cabang yang berjauhan perlu mengubah keranjang.
        # Solusinya: variabel modul.

        let keranjang = [];
        export function tambah(b) { keranjang.push(b); }

        # Tidak ada error. Tampilan tidak pernah berubah,
        # dan dua instance halaman saling mengganggu.
        `,
        { caption: 'Variabel modul dipakai sebagai jalan pintas state global.' },
      ),
      p(
        'Ini jalan pintas yang paling sering diambil saat pustaka dihindari, dan ia rusak dalam dua cara sekaligus. Mengubahnya tidak memicu penggambaran ulang sehingga tampilan tidak ikut berubah, dan ia dibagi seluruh instance sehingga dua halaman yang terbuka bersamaan saling menimpa. Kalau kamu sampai di sini, pustaka store memang jawabannya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Induk hanya memegang state dan meneruskan belasan props',
            'Terlalu banyak state diangkat ke satu tempat',
            'Kelompokkan dengan `useReducer`, atau pindahkan sebagian ke Context',
          ],
          [
            'Seluruh halaman digambar ulang untuk perubahan kecil',
            'State diangkat lebih tinggi daripada yang dibutuhkan',
            'Turunkan ke induk bersama terdekat',
          ],
          [
            'Komposisi menghasilkan fungsi bersarang berlapis',
            'Komposisi dipaksakan melewati batasnya',
            'Ini tanda Context atau pustaka memang diperlukan',
          ],
          [
            'Tampilan tidak berubah, dan dua halaman saling mengganggu',
            'Variabel modul dipakai sebagai state global',
            'Pakai pustaka store yang memicu penggambaran ulang',
          ],
          [
            'Props diteruskan lima tingkat tanpa dipakai di tengah',
            'Belum mencoba komposisi',
            'Buat elemennya di tempat datanya tersedia, kirim sebagai `children`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Keputusan memasang atau tidak memasang pustaka sering diambil sebagai soal selera, padahal ia punya jawaban yang bisa diperiksa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang pustaka untuk berbagi antara dua komponen bersebelahan',
            'Supaya tidak perlu meneruskan props',
            'Mengangkat ke induk bersama menyelesaikannya dalam beberapa baris tanpa dependensi',
          ],
          [
            'Tidak pernah mencoba komposisi',
            'Props berantai kan memang butuh state global',
            'Komposisi menyelesaikan sebagian besar kasusnya, dan tidak butuh apa pun',
          ],
          [
            'Memakai variabel modul sebagai jalan pintas',
            'Paling cepat dan bekerja',
            'Tidak memicu penggambaran ulang, dan dibagi seluruh instance',
          ],
          [
            'Mengangkat seluruh state ke komponen paling atas',
            'Supaya bisa dijangkau semua',
            'Setiap perubahan menggambar ulang seluruh pohon, dan induknya menjadi penampungan',
          ],
          [
            'Memaksakan komposisi sampai bersarang berlapis',
            'Katanya komposisi lebih baik',
            'Bentuknya justru lebih sulit dibaca. Itu tanda pustaka memang diperlukan',
          ],
          [
            'Menunda memasang pustaka padahal tandanya sudah jelas',
            'Ingin tetap sederhana',
            'Cache dan langganan yang ditulis sendiri jauh lebih mahal dirawat daripada satu pustaka',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah sisi lain dari sikap yang sama, dan sama merugikannya. Menghindari pustaka bukan tujuan. Kalau kamu sudah mencoba ketiga jalan di atas dan bentuknya justru lebih rumit, memasang pustaka adalah keputusan yang benar. Yang salah hanya memasangnya sebelum ketiganya dicoba.',
      ),
      callout(
        'info',
        'Aturan tiga berlaku untuk pustaka juga',
        'Pola yang sama dengan abstraksi di Bab 2 Frontend Basic. Jangan memasang pustaka untuk satu kebutuhan. Tunggu sampai ada dua atau tiga tempat yang benar-benar membutuhkannya, sebab pada titik itu bentuk kebutuhannya sudah terlihat dan pilihan pustakanya jauh lebih mudah diputuskan.',
      ),
      references(
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Teknik mengangkat state ke induk terdekat, langkah demi langkah.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Termasuk `children` sebagai bentuk komposisi paling sederhana.',
        },
        {
          label: 'Passing Data Deeply with Context — coba alternatifnya dulu',
          href: 'https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context',
          source: 'React',
          note: 'Dua alternatif resmi yang dianjurkan React sebelum menambah Context, apalagi library.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Langkah menentukan di mana sebuah state seharusnya hidup.',
        },
      ),
    ],
  ),

  written(
    'context-api',
    'Context API & Jebakan Re-render',
    21,
    'Alat yang benar untuk masalah yang salah.',
    [
      p(
        'Context adalah mekanisme bawaan React untuk mengirim nilai ke bawah pohon tanpa mengoper props satu per satu. Ia sering disebut "state management bawaan React" — dan di situlah salah pahamnya dimulai. **Context bukan store.** Ia adalah alat distribusi, bukan alat penyimpanan atau optimasi.',
      ),

      terms(
        {
          term: 'Context',
          meaning:
            'Mekanisme bawaan React untuk mengirim nilai ke seluruh komponen di bawahnya tanpa mengoper props satu per satu. Kalimat kunci sub-bab ini adalah **Context bukan store.** Ia alat **distribusi** yang mengurus bagaimana nilai sampai ke bawah, bukan alat penyimpanan dan bukan alat optimasi.',
        },
        {
          term: 'store',
          meaning:
            'Tempat penyimpanan state yang hidup di luar pohon komponen, biasanya dengan kemampuan memilih bagian tertentu saja (selector). Bedanya dengan Context tegas: store menyimpan **dan** menyalurkan secara selektif; Context hanya menyalurkan, seluruhnya, ke semua konsumen.',
        },
        {
          term: 'consumer',
          meaning:
            'Komponen yang memanggil `useContext` untuk membaca sebuah context. Sifat penting yang mengejutkan banyak orang: **setiap** konsumen di-render ulang saat nilai context berubah — tanpa peduli bagian mana dari nilai itu yang sebenarnya ia pakai.',
        },
        {
          term: 'selector',
          meaning:
            'Fungsi yang memilih **sepotong** dari sebuah store, misalnya `(s) => s.keranjang.jumlah`. Komponen hanya di-render ulang kalau potongan itu yang berubah. Context **tidak punya** ini — dan ketiadaannya persis yang membuat orang kecewa pada Context untuk data yang sering berubah.',
        },
        {
          term: 're-render',
          meaning:
            'React menjalankan ulang fungsi komponen untuk menghitung tampilan barunya. Ini tidak selalu mahal — yang mahal adalah **jumlahnya** ketika seluruh halaman ikut, padahal yang berubah cuma satu angka di pojok.',
        },
        {
          term: 'objek literal',
          meaning:
            'Objek yang ditulis langsung di tempat, seperti `{ tema, ganti }`. Setiap render Provider membuatnya **baru** — isinya sama persis tapi identitasnya berbeda menurut `Object.is`. Akibatnya semua konsumen dianggap menerima nilai baru meski tidak ada yang benar-benar berubah.',
        },
        {
          term: 'hook pembungkus',
          meaning:
            'Fungsi seperti `useTema()` yang membungkus `useContext` beserta pengecekan `null`-nya. Ia memberi tiga hal sekaligus: fail loudly dengan pesan jelas kalau Provider lupa dipasang, tipe yang sudah bukan `null`, dan satu tempat kalau implementasinya berubah nanti.',
        },
        {
          term: 'useCallback',
          meaning:
            'Hook yang menjaga identitas sebuah fungsi tetap sama antar render. Di contoh bawah ia dipakai supaya fungsi `ganti` tidak berubah tiap render — sehingga komponen yang hanya butuh "cara mengubah" tidak ikut dirender saat nilainya berubah.',
        },
      ),

      h2('Bentuk dasar'),
      code(
        'tsx',
        `
        import { createContext, useContext, useState } from 'react';

        type Tema = 'terang' | 'gelap';
        type NilaiTema = { tema: Tema; ganti: () => void };

        // null sebagai nilai awal + pengecekan di hook = ketahuan kalau lupa memasang Provider.
        const KonteksTema = createContext<NilaiTema | null>(null);

        export function PenyediaTema({ children }: { children: React.ReactNode }) {
          const [tema, setTema] = useState<Tema>('terang');
          const ganti = () => setTema((t) => (t === 'terang' ? 'gelap' : 'terang'));

          return <KonteksTema value={{ tema, ganti }}>{children}</KonteksTema>;
        }

        export function useTema() {
          const nilai = useContext(KonteksTema);
          if (nilai === null) {
            throw new Error('useTema harus dipakai di dalam <PenyediaTema>');
          }
          return nilai;
        }
        `,
        { filename: 'src/context/tema.tsx' },
      ),
      p(
        'Berkas ini mengekspor **dua** hal dan menyembunyikan satu. Yang diekspor adalah `PenyediaTema` untuk dipasang di dekat akar aplikasi, dan `useTema()` untuk dipakai komponen mana pun di bawahnya. Yang sengaja **tidak** diekspor adalah `KonteksTema` itu sendiri, dan itu keputusan yang menentukan. Perhatikan `createContext` diberi nilai awal `null` dan bukan objek tema bawaan, sebab dengan begitu komponen yang dipakai tanpa Provider mendapat `null`, dan `useTema` bisa melemparkan error dengan pesan yang menyebutkan persis apa yang kurang. Kalau nilai awalnya diisi objek yang tampak masuk akal, kesalahan lupa memasang Provider akan lolos diam-diam dan muncul sebagai tema yang tidak pernah berubah, dan itu jauh lebih sulit dilacak daripada error yang berteriak.',
      ),
      callout(
        'info',
        'React 19: `<Context>` langsung sebagai Provider',
        'Sejak React 19 kamu bisa menulis `<KonteksTema value={...}>` tanpa `.Provider`. Bentuk lama `<KonteksTema.Provider>` masih bekerja, jadi kode lama tidak rusak — tapi untuk kode baru pakai bentuk pendeknya.',
      ),

      h2('Kenapa hook pembungkus itu wajib'),
      p(
        'Mengekspor `KonteksTema` mentah-mentah memaksa setiap pemakai menulis `useContext` **dan** mengecek `null` sendiri. Membungkusnya jadi `useTema()` memberi tiga hal sekaligus: pengecekan Provider yang fail loudly dengan pesan jelas, tipe yang sudah bukan `null`, dan satu tempat kalau implementasinya berubah nanti.',
      ),

      h2('Jebakannya: satu perubahan, semua konsumen re-render'),
      p(
        'Inilah bagian yang membuat orang kecewa pada Context. Setiap konsumen `useContext` akan **selalu** di-render ulang saat nilai context berubah — tanpa peduli bagian mana yang ia pakai. Tidak ada selector, tidak ada perbandingan sebagian.',
      ),
      code(
        'tsx',
        `
        // Context berisi tema DAN pengguna DAN keranjang.
        // Satu ketikan yang mengubah keranjang akan melakukan re-render
        // setiap komponen yang cuma membaca tema.
        <KonteksApp value={{ tema, pengguna, keranjang }}>
        `,
      ),
      p(
        'Ditambah satu jebakan kedua yang lebih halus: objek literal `{ tema, ganti }` adalah objek **baru** di setiap render Provider. Jadi meski isinya sama persis, semua konsumen tetap dianggap menerima nilai baru.',
      ),

      h2('Dua obatnya'),
      steps(
        {
          title: 'Pecah menjadi beberapa context',
          body: 'Pisahkan berdasarkan frekuensi perubahan. Tema yang berubah sekali sehari tidak boleh sepaket dengan keranjang yang berubah tiap klik. Ini obat yang paling efektif dan paling sering dilupakan.',
        },
        {
          title: 'Pisahkan nilai dari fungsi pengubah',
          body: 'Fungsi pengubah biasanya stabil selamanya. Menaruhnya di context terpisah membuat komponen yang hanya butuh "cara mengubah" tidak ikut render saat nilainya berubah.',
        },
      ),
      code(
        'tsx',
        `
        const KonteksNilai = createContext<Tema>('terang');
        const KonteksAksi = createContext<(() => void) | null>(null);

        export function PenyediaTema({ children }) {
          const [tema, setTema] = useState<Tema>('terang');

          // Pengubah didefinisikan dengan bentuk fungsi, jadi ia tidak
          // pernah bergantung pada nilai 'tema' dan tidak perlu ikut berubah.
          const ganti = useCallback(() => {
            setTema((t) => (t === 'terang' ? 'gelap' : 'terang'));
          }, []);

          return (
            <KonteksAksi value={ganti}>
              <KonteksNilai value={tema}>{children}</KonteksNilai>
            </KonteksAksi>
          );
        }
        `,
      ),
      p(
        "Perhatikan susunan bersarangnya, dengan `KonteksAksi` di luar dan `KonteksNilai` di dalam. Urutan itu disengaja meski secara fungsional keduanya setara, sebab yang jarang berubah ditaruh di luar, yang sering berubah di dalam, sehingga struktur kodenya sendiri mencerminkan frekuensi perubahannya. Kunci teknisnya ada pada `useCallback` dengan array dependensi **kosong**, dan itu hanya mungkin karena `setTema` dipanggil dengan bentuk fungsi `(t) => ...`. Kalau ditulis `setTema(tema === 'terang' ? 'gelap' : 'terang')`, fungsi `ganti` akan bergantung pada nilai `tema` dan harus dibuat ulang setiap kali temanya berubah, sehingga seluruh pemisahan ini jadi sia-sia. Hasil akhirnya, komponen yang hanya memanggil `useContext(KonteksAksi)` untuk mendapat tombol pengubah **tidak pernah** ikut dirender saat temanya berganti.",
      ),
      callout(
        'tip',
        'React Compiler mengubah nuansanya, bukan aturannya',
        'Dengan React Compiler aktif, memoization nilai context sering ditangani otomatis sehingga `useMemo` manual tidak lagi perlu. Yang **tidak** hilang adalah sifat dasarnya: semua konsumen tetap ikut render saat nilai context benar-benar berubah. Memecah context tetap jadi solusi struktural, bukan solusi memoization.',
      ),

      h2('Kapan Context adalah pilihan yang benar'),
      table(
        ['Cocok', 'Tidak cocok'],
        [
          ['Tema terang/gelap', 'Isi keranjang yang sering berubah'],
          ['Bahasa aktif', 'Teks yang sedang diketik'],
          ['Data pengguna yang sudah login', 'Data server yang perlu cache & refetch'],
          ['Konfigurasi yang dibaca sekali', 'Posisi scroll atau state animasi'],
        ],
        'Polanya sederhana: jarang berubah, banyak pembaca.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tema terang dan gelap disimpan di Context yang dibaca lima puluh komponen. Setelah dipasang, mengetik satu huruf di kotak pencarian membuat seluruh halaman berkedip. Penyebabnya bukan pencariannya melainkan nilai Context yang berupa object literal, sehingga setiap render penyedianya membuat object baru dan seluruh pembacanya menganggap nilainya berubah.',
      ),
      p(
        'Berikut perilakunya, diukur dengan React 19 sungguhan. Dua komponen membaca Context yang sama, dan hanya satu yang memakai nilai yang berubah.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19: menaikkan 'a' di dalam Context.

        CONTEXT — setelah menaikkan a:
          ctx-A render
          ctx-B render (hanya baca b)     <- ikut, padahal b tidak berubah

        # Bandingkan dengan store berbasis selektor:
        STORE + SELECTOR — setelah menaikkan a:
          store-A render                  <- hanya ini
        `,
        { caption: 'Diukur sungguhan. Inilah batas Context yang paling menentukan.' },
      ),
      p(
        'Context tidak punya cara memilih bagian. Setiap komponen yang memanggil `useContext` diberi tahu saat nilainya berubah, tanpa peduli bagian mana yang benar-benar ia baca. Untuk tema yang berubah sekali sehari, itu tidak masalah sama sekali. Untuk keranjang yang berubah tiap klik dan dibaca lima puluh komponen, itu penyebab kelambatan yang terukur.',
      ),
      code(
        'tsx',
        `
        // Pola tiga bagian untuk setiap Context.
        // 1. Konteksnya sendiri, bawaan null, dan TIDAK diekspor.
        const KonteksTema = createContext<IsiTema | null>(null);

        // 2. Penyedianya, dengan nilai yang dibungkus useMemo.
        export function PenyediaTema({ children }: { children: ReactNode }) {
          const [tema, setTema] = useState<'terang' | 'gelap'>('terang');

          // Tanpa useMemo, object baru tiap render dan seluruh pembaca
          // digambar ulang walaupun tema tidak berubah.
          // setTema dari useState sudah stabil, jadi tidak perlu di dependensi.
          const nilai = useMemo(() => ({ tema, setTema }), [tema]);

          return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
        }

        // 3. Fungsi pembaca dengan penjaga.
        export function pakaiTema() {
          const konteks = useContext(KonteksTema);
          if (!konteks) throw new Error('pakaiTema harus dipakai di dalam <PenyediaTema>');
          return konteks;
        }
        `,
        { filename: 'src/tema/PenyediaTema.tsx' },
      ),
      p(
        'Ketiga bagian itu menutup kesalahan yang paling sering sekaligus. Bawaan `null` membuat pemakaian tanpa penyedia gagal dengan jelas alih-alih bekerja dengan nilai palsu. `useMemo` mencegah penggambaran ulang menyeluruh. Dan fungsi pembaca dengan penjaga mengubah `Cannot read properties of null` menjadi pesan yang menyebut penyedianya.',
      ),
      code(
        'tsx',
        `
        // Memisahkan data dari aksi: pembaca aksi tidak ikut digambar ulang.
        const KonteksPengguna = createContext<Pengguna | null>(null);
        const KonteksAksi = createContext<AksiAuth | null>(null);

        export function PenyediaAuth({ children }: { children: ReactNode }) {
          const [pengguna, setPengguna] = useState<Pengguna | null>(null);

          // Aksi tidak pernah berubah, jadi dependensinya kosong.
          const aksi = useMemo(() => ({
            keluar: () => { hapusSesi(); setPengguna(null); },
          }), []);

          return (
            <KonteksAksi.Provider value={aksi}>
              <KonteksPengguna.Provider value={pengguna}>
                {children}
              </KonteksPengguna.Provider>
            </KonteksAksi.Provider>
          );
        }
        `,
        { caption: 'Tombol Keluar hanya membaca aksi, jadi tidak ikut saat pengguna berubah.' },
      ),
      p(
        'Pemisahan ini adalah pengoptimalan yang sering menentukan pada aplikasi besar, dan ia tidak butuh pustaka apa pun. Tombol Keluar di bilah navigasi hanya butuh fungsinya, dan tanpa pemisahan ia akan digambar ulang setiap kali data pengguna disegarkan. Dengan pemisahan, ia membaca konteks yang nilainya tidak pernah berubah.',
      ),
      p(
        'Yang perlu jujur disebut, pemisahan ini punya batasnya. Untuk dua atau tiga bagian ia masuk akal, dan untuk sepuluh bagian kamu akan punya sepuluh penyedia bersarang. Pada titik itu, pustaka store yang mendukung pemilihan bagian jauh lebih tepat sebab satu store bisa dibaca sebagian tanpa membuat penyedia terpisah.',
      ),
      callout(
        'warning',
        'Context bukan pengganti pustaka state',
        'Ia menyelesaikan masalah **props berantai**, yaitu menyalurkan nilai ke kedalaman berapa pun tanpa melewatkannya satu per satu. Ia tidak menyelesaikan masalah **penggambaran ulang selektif**. Untuk nilai yang jarang berubah, Context sudah cukup. Untuk yang sering berubah dan dibaca banyak, pemilihan bagian adalah kebutuhan nyata.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        # Diukur: seluruh pembaca Context digambar ulang.
        ctx-A render
        ctx-B render (hanya baca b)

        # Tidak ada error. Halaman terasa berat.
        `,
        { caption: 'Diukur sungguhan. Nilai Context berupa object literal.' },
      ),
      p(
        'Cara menemukannya adalah menyalakan Highlight updates di React DevTools. Kalau seluruh halaman berkedip untuk perubahan yang hanya menyentuh satu bagian, periksa nilai Contextnya. Perbaikan pertamanya `useMemo`, dan kalau setelah itu masih terasa berat, berarti nilainya memang berubah terlalu sering untuk Context.',
      ),
      code(
        'text',
        `
        const C = createContext(undefined);
        function K() { const v = useContext(C); return <div>{String(v)}</div>; }

        # Diuji: dirender sebagai <div>undefined</div>. TIDAK melempar.
        `,
        { caption: 'Diuji sungguhan. Konteks tanpa penyedia mengembalikan nilai bawaan.' },
      ),
      p(
        'Inilah kenapa penjaga di fungsi pembaca penting. Tanpa penyedia, nilainya adalah bawaan yang diberikan saat `createContext` dan komponennya tetap dirender. Error baru muncul jauh kemudian saat ada yang menulis `konteks.tema`, dengan pesan yang tidak menyebut konteks sama sekali.',
      ),
      code(
        'text',
        `
        const C = createContext({ tema: 'terang', setTema: () => {} });

        # Komponen yang LUPA dibungkus penyedia tetap berjalan,
        # dengan setter yang tidak melakukan apa-apa.
        # Tombol ganti tema diam tanpa satu pun error.
        `,
        { caption: 'Nilai bawaan yang terlihat sah menyembunyikan bug.' },
      ),
      p(
        'Ini diambil dengan niat baik dan hasilnya menyembunyikan kesalahan. Memberi bawaan yang berfungsi membuat komponen tanpa penyedia tetap tampil normal, dan gejalanya berupa tombol yang tidak berfungsi tanpa penjelasan. Pakai `null` sebagai bawaan, dan biarkan penjaga yang berteriak.',
      ),
      code(
        'text',
        `
        <PenyediaA>
          <PenyediaB>
            <PenyediaC>
              <PenyediaD>
                <PenyediaE>

        # Lima penyedia bersarang. Menambah satu nilai global
        # berarti menambah satu lapisan lagi.
        `,
        { caption: 'Pemisahan Context yang sudah melewati batas kewajarannya.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah keterbacaannya. Setiap nilai global baru menambah satu lapisan di akar aplikasi, dan urutannya kadang penting sehingga tidak bebas diatur. Pada titik ini, satu store yang bisa dibaca sebagian menyelesaikan hal yang sama tanpa lapisan tambahan.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Seluruh halaman digambar ulang untuk perubahan kecil',
            'Nilai Context berupa object literal baru tiap render',
            'Bungkus dengan `useMemo`',
          ],
          [
            'Nilai Context `undefined` tanpa error',
            'Tidak ada penyedia, dan bawaannya `undefined`',
            'Tulis penjaga di fungsi pembaca',
          ],
          [
            'Tombol diam tanpa satu pun error',
            'Bawaan Context berupa nilai yang terlihat sah',
            'Pakai `null` sebagai bawaan',
          ],
          [
            'Lima penyedia bersarang di akar aplikasi',
            'Pemisahan Context sudah melewati batasnya',
            'Pindahkan ke satu store yang mendukung pemilihan bagian',
          ],
          [
            'Masih berat setelah `useMemo` ditambahkan',
            'Nilainya memang berubah terlalu sering untuk Context',
            'Pakai pustaka store dengan selektor',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Context sering dipakai sebagai pengganti pustaka state, dan sebagian besar kesalahan di bawah berasal dari harapan yang tidak sesuai kemampuannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memberikan object literal sebagai nilai Context',
            'Nilainya kan sama',
            'Rujukannya baru tiap render, sehingga seluruh pembaca digambar ulang. Ini terukur',
          ],
          [
            'Memakai Context untuk state yang berubah tiap detik',
            'Ia sudah bawaan React',
            'Tidak ada pemilihan bagian, sehingga seluruh pembaca ikut. Pakai store dengan selektor',
          ],
          [
            'Memberi nilai bawaan yang berfungsi',
            'Supaya tidak `undefined`',
            'Komponen tanpa penyedia jadi bekerja dengan nilai palsu, dan bugnya tersembunyi',
          ],
          [
            'Tidak menulis penjaga di fungsi pembaca',
            'Penyedianya kan selalu ada',
            'Sampai ada yang memakainya di luar, dan pesan errornya tidak menyebut penyedia',
          ],
          [
            'Menaruh seluruh state aplikasi di satu Context',
            'Satu tempat untuk semuanya',
            'Setiap perubahan apa pun menggambar ulang seluruh pembacanya',
          ],
          [
            'Memakai Context untuk dua komponen bersebelahan',
            'Supaya tidak perlu meneruskan props',
            'Mengangkat ke induk bersama lebih sederhana dan alur datanya lebih terlihat',
          ],
        ],
      ),
      p(
        'Baris kedua adalah keputusan yang paling menentukan, dan sekarang kamu punya angkanya. Pengukuran di studi kasus menunjukkan Context menggambar ulang seluruh pembacanya sedangkan store berselektor hanya yang relevan. Untuk lima pembaca, selisihnya tidak terasa. Untuk lima puluh pembaca dengan perubahan tiap klik, selisihnya adalah perbedaan antara halaman yang terasa ringan dan yang terasa berat.',
      ),
      callout(
        'tip',
        'Context tetap pilihan yang tepat untuk tiga hal ini',
        'Tema dan preferensi tampilan, identitas pengguna yang sedang masuk, dan nilai konfigurasi seperti bahasa atau zona waktu. Ketiganya jarang berubah, dibaca di banyak tempat, dan tidak butuh pemilihan bagian. Untuk ketiganya, memasang pustaka justru berlebihan.',
      ),
      references(
        {
          label: 'useContext',
          href: 'https://react.dev/reference/react/useContext',
          source: 'React',
          note: 'Termasuk bagian "optimizing re-renders when passing objects and functions".',
        },
        {
          label: 'createContext',
          href: 'https://react.dev/reference/react/createContext',
          source: 'React',
          note: 'Bentuk `<Konteks value=...>` tanpa `.Provider` sejak React 19.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Daftar resmi kasus pemakaian Context yang tepat — semuanya "jarang berubah, banyak pembaca".',
        },
        {
          label: 'useCallback',
          href: 'https://react.dev/reference/react/useCallback',
          source: 'React',
          note: 'Menjaga identitas fungsi pengubah tetap stabil saat dipisah ke context sendiri.',
        },
      ),
    ],
  ),

  written('zustand', 'Zustand', 20, 'Store global yang ringan.', [
    p(
      'Zustand adalah store global tanpa Provider, tanpa boilerplate, dan dengan satu kemampuan penting yang tidak dimiliki Context: **selector**. Komponen bisa berlangganan hanya pada potongan state yang benar-benar ia baca, sehingga perubahan di bagian lain tidak ikut melakukan re-render.',
    ),

    terms(
      {
        term: 'Zustand',
        meaning:
          'Bahasa Jerman untuk **keadaan** (*state*), dibaca "tsu-shtand". Library store global buatan tim Poimandres. Tiga sifat yang membedakannya: tidak butuh Provider, tidak butuh boilerplate, dan punya **selector** — kemampuan yang tidak dimiliki Context.',
      },
      {
        term: 'create',
        meaning:
          'Fungsi utama Zustand untuk membuat sebuah store. Ia mengembalikan **hook** yang bisa langsung dipakai di komponen mana pun. Itu sebabnya tidak ada Provider yang harus dipasang di root — store-nya cuma modul biasa yang di-import.',
      },
      {
        term: 'set',
        meaning:
          'Fungsi yang diberikan Zustand ke dalam definisi store-mu untuk mengubah state. Ia menerima objek berisi field yang ingin diubah, atau sebuah fungsi `(state) => perubahan` kalau nilai barunya dihitung dari nilai lama — pola yang sama persis dengan setter `useState`.',
      },
      {
        term: 'selector',
        meaning:
          'Fungsi yang memilih **sepotong** state: `useKeranjang((s) => s.items.length)`. Komponen hanya di-render ulang kalau potongan itu yang berubah. Inilah bagian yang membuat Zustand cepat — dan melewatkannya berarti membuang keunggulan utamanya.',
      },
      {
        term: 's',
        meaning:
          'Sekadar singkatan dari *state* pada selector `(s) => s.items.length`. Namanya bebas — `(state) => state.items.length` sama benarnya. Nama pendek lazim dipakai karena selector hampir selalu satu ekspresi pendek.',
      },
      {
        term: 'useShallow',
        meaning:
          'Pembungkus dari `zustand/react/shallow` yang membandingkan hasil selector **per properti**, bukan per referensi. Dipakai saat kamu memang butuh beberapa nilai sekaligus — tanpanya, selector yang mengembalikan objek baru akan selalu dianggap berubah dan bisa memicu render tanpa henti.',
      },
      {
        term: 'Omit',
        meaning:
          'Utility type TypeScript. `Omit<Item, \'jumlah\'>` berarti "tipe `Item`, tapi tanpa properti `jumlah`". Dipakai di sini karena `jumlah` diisi oleh store-nya sendiri, jadi pemanggil tidak perlu dan tidak boleh menentukannya.',
      },
      {
        term: 'getState',
        meaning:
          'Metode pada store untuk membaca nilai sekarang **tanpa berlangganan**. Karena ia tidak memicu render, ia aman dipakai di luar komponen — di dalam event handler, fungsi utilitas, atau kode non-React. Sesuatu yang tidak mungkin dilakukan dengan Context.',
      },
      {
        term: 'middleware',
        meaning:
          'Lapisan yang membungkus store untuk menambah kemampuan tanpa mengubah kodenya. Zustand punya beberapa bawaan; yang paling sering dipakai adalah `persist`, yang menyimpan isi store ke `localStorage` secara otomatis.',
      },
    ),

    h2('Membuat store'),
    code(
      'ts',
      `
        import { create } from 'zustand';

        type Item = { id: string; nama: string; harga: number; jumlah: number };

        type Keranjang = {
          items: Item[];
          tambah: (item: Omit<Item, 'jumlah'>) => void;
          hapus: (id: string) => void;
          kosongkan: () => void;
        };

        export const useKeranjang = create<Keranjang>((set) => ({
          items: [],

          tambah: (item) =>
            set((state) => {
              const ada = state.items.find((i) => i.id === item.id);
              if (ada) {
                return {
                  items: state.items.map((i) =>
                    i.id === item.id ? { ...i, jumlah: i.jumlah + 1 } : i,
                  ),
                };
              }
              return { items: [...state.items, { ...item, jumlah: 1 }] };
            }),

          hapus: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

          kosongkan: () => set({ items: [] }),
        }));
        `,
      { filename: 'src/store/keranjang.ts' },
    ),
    p(
      '`create<Keranjang>((set) => ({...}))` menerima satu fungsi yang menerima `set` sebagai argumen, dan mengembalikan **objek state awal** beserta seluruh fungsi yang boleh mengubahnya, sehingga `items`, `tambah`, `hapus`, dan `kosongkan` semuanya didefinisikan dalam satu tempat. `set` bekerja mirip `setState` versi `useState`, dengan satu perbedaan penting, yaitu hasil yang dikembalikan **digabung (merge)** ke state yang sudah ada alih-alih menggantikannya seluruhnya. Itulah mengapa `kosongkan: () => set({ items: [] })` cukup menyebut `items` saja tanpa perlu menuliskan ulang `tambah`, `hapus`, dan fungsi lainnya. Di dalam `tambah`, `set` dipanggil dengan bentuk fungsi `(state) => {...}` justru karena hasilnya perlu dihitung dari `state.items` yang sekarang, dan itu pola yang sama dengan bentuk updater `setJumlah((n) => n + 1)` yang sudah kamu kenal dari `useState`.',
    ),

    h2('Selector: bagian yang membuatnya cepat'),
    compare(
      {
        title: 'Tanpa selector — boros',
        lang: 'tsx',
        code: `
          function JumlahItem() {
            // Mengambil SELURUH state.
            const { items } = useKeranjang();
            return <span>{items.length}</span>;
          }
          `,
        notes: ['Re-render setiap kali apa pun di store berubah'],
      },
      {
        title: 'Dengan selector — hemat',
        lang: 'tsx',
        code: `
          function JumlahItem() {
            // Berlangganan hanya pada angkanya.
            const jumlah = useKeranjang((s) => s.items.length);
            return <span>{jumlah}</span>;
          }
          `,
        notes: ['Re-render hanya kalau angkanya benar-benar berubah'],
      },
    ),

    h2('Jebakan selector yang mengembalikan objek'),
    p(
      'Zustand membandingkan hasil selector dengan `Object.is`. Selector yang membuat objek atau array **baru** setiap kali akan selalu dianggap berubah — dan komponennya re-render terus, bahkan bisa masuk loop tak berujung.',
    ),
    code(
      'tsx',
      `
        // SALAH: objek baru setiap render -> selalu dianggap berubah
        const { tambah, hapus } = useKeranjang((s) => ({ tambah: s.tambah, hapus: s.hapus }));

        // BENAR (1): ambil satu per satu
        const tambah = useKeranjang((s) => s.tambah);
        const hapus = useKeranjang((s) => s.hapus);

        // BENAR (2): pakai useShallow kalau memang butuh beberapa sekaligus
        import { useShallow } from 'zustand/react/shallow';
        const { tambah, hapus } = useKeranjang(useShallow((s) => ({ tambah: s.tambah, hapus: s.hapus })));
        `,
    ),

    h2('Mengakses store di luar komponen'),
    p(
      'Karena store bukan Context, ia bisa dibaca dari mana saja — termasuk di dalam event handler, fungsi utilitas, atau kode non-React.',
    ),
    code(
      'ts',
      `
        // Membaca nilai sekarang tanpa berlangganan (tidak memicu render).
        const jumlahSekarang = useKeranjang.getState().items.length;

        // Mengubah dari luar komponen.
        useKeranjang.getState().kosongkan();
        `,
    ),

    h2('Menyimpan ke localStorage'),
    code(
      'ts',
      `
        import { persist } from 'zustand/middleware';

        export const useKeranjang = create<Keranjang>()(
          persist(
            (set) => ({ /* ...seperti di atas... */ }),
            {
              name: 'keranjang',
              // Simpan datanya saja — fungsi tidak perlu (dan tidak bisa) diserialisasi.
              partialize: (state) => ({ items: state.items }),
            },
          ),
        );
        `,
    ),
    callout(
      'warning',
      'Persist + SSR = ketidakcocokan hidrasi',
      'Di Next.js, server tidak punya `localStorage`, jadi render pertama selalu memakai state kosong sementara browser langsung punya isinya. Perbedaan itu memicu hydration mismatch. Polanya sama seperti yang dipakai website ini sendiri: tampilkan skeleton sampai store selesai terhidrasi, jangan langsung menampilkan datanya.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Keranjang belanja dipindahkan dari Context ke Zustand karena setiap penambahan barang membuat seluruh halaman berkedip. Setelah dipindahkan, kedipannya hilang di sebagian tempat dan tetap ada di bilah navigasi. Penyebabnya satu baris, yaitu bilah navigasi membaca seluruh store alih-alih memilih bagian yang ia butuhkan.',
    ),
    p(
      'Keunggulan store dibanding Context adalah **pemilihan bagian**, dan keunggulan itu hilang begitu selektornya salah. Berikut perbandingannya, diukur dengan React 19 sungguhan memakai store berbasis `useSyncExternalStore` yang mekanismenya sama.',
    ),
    code(
      'text',
      `
        # Diukur dengan React 19: satu nilai berubah, dua komponen membaca.

        CONTEXT — setelah menaikkan a:
          ctx-A render
          ctx-B render (hanya baca b)     <- ikut, padahal tidak relevan

        STORE + SELECTOR — setelah menaikkan a:
          store-A render                  <- hanya ini
        `,
      { caption: 'Diukur sungguhan. Pemilihan bagian yang membuat selisihnya.' },
    ),
    code(
      'tsx',
      `
        import { create } from 'zustand';

        type Keranjang = {
          barang: Barang[];
          tambah: (b: Barang) => void;
          hapus: (id: string) => void;
        };

        export const useKeranjang = create<Keranjang>((set) => ({
          barang: [],

          // set menerima fungsi yang mengembalikan BAGIAN yang berubah.
          // Zustand menggabungkannya, jadi tidak perlu menyebar seluruh state.
          tambah: (b) => set((s) => ({ barang: [...s.barang, b] })),
          hapus: (id) => set((s) => ({ barang: s.barang.filter((x) => x.id !== id) })),
        }));
        `,
      { filename: 'src/store/keranjang.ts' },
    ),
    code(
      'tsx',
      `
        // SALAH: membaca seluruh store. Digambar ulang untuk perubahan apa pun.
        function BilahNavigasi() {
          const store = useKeranjang();
          return <span>{store.barang.length}</span>;
        }

        // BENAR: pilih hanya yang dibaca. Hanya digambar ulang saat itu berubah.
        function BilahNavigasi() {
          const jumlah = useKeranjang((s) => s.barang.length);
          return <span>{jumlah}</span>;
        }

        // JEBAKAN: selektor yang mengembalikan object BARU tiap panggilan.
        function Ringkasan() {
          // Object baru tiap kali, jadi perbandingannya selalu berbeda.
          const { barang, total } = useKeranjang((s) => ({
            barang: s.barang,
            total: hitungTotal(s.barang),
          }));
        }
        `,
      { caption: 'Selektor yang mengembalikan object baru membatalkan seluruh manfaatnya.' },
    ),
    p(
      'Jebakan ketiga adalah yang paling sering dan paling sulit dilihat, sebab kodenya terlihat rapi. Store membandingkan hasil selektor dengan `Object.is`, dan object literal baru selalu berbeda dari yang lama. Akibatnya komponennya digambar ulang pada setiap perubahan store apa pun, persis seperti membaca seluruh store. Seluruh biaya selektor dibayar dan nol penghematan.',
    ),
    p(
      'Ada dua jalan keluar. Pertama, panggil selektor terpisah untuk tiap nilai, yaitu satu untuk `barang` dan satu untuk `total`. Kedua, pakai pembanding khusus yang membandingkan isi alih-alih rujukan, dan pustaka biasanya menyediakannya. Yang pertama lebih sederhana dan hampir selalu cukup.',
    ),
    p(
      'Yang perlu ditegaskan, `hitungTotal(s.barang)` di dalam selektor juga bermasalah di luar soal identitas. Selektor dipanggil pada setiap perubahan store, sehingga perhitungan di dalamnya berjalan jauh lebih sering daripada yang diduga. Pilih data mentahnya di selektor, lalu hitung turunannya di komponen seperti dibahas di bab tentang state.',
    ),
    callout(
      'warning',
      'Pantangan mutasi tetap berlaku penuh di dalam store',
      'Menulis `s.barang.push(b)` di dalam `set` mengubah array di tempat, sehingga rujukannya tidak berubah dan pembaca yang memilih `barang` tidak ikut diberi tahu. Gejalanya berupa data yang bertambah kalau dicetak tapi layar diam. Buat array baru dengan spread, persis seperti di `useState`.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering saat berpindah ke store. Dua yang pertama diukur dengan React 19 sungguhan, dan dua sisanya berupa gejala yang perlu kamu kenali sendiri.',
    ),
    code(
      'text',
      `
        const store = useKeranjang();      // membaca seluruh store

        # Komponen digambar ulang untuk perubahan APA PUN di store,
        # termasuk bagian yang tidak ia baca. Tidak ada error.
        `,
      { caption: 'Seluruh manfaat pemilihan bagian hilang.' },
    ),
    p(
      'Ini persis perilaku Context yang diukur di studi kasus, yaitu seluruh pembaca ikut digambar ulang. Kalau kamu memindahkan state ke store lalu tidak merasakan perbedaan apa pun, hal pertama yang diperiksa adalah apakah selektornya benar-benar memilih. Membaca seluruh store berarti membayar biaya pustaka tanpa mendapat keunggulannya.',
    ),
    code(
      'text',
      `
        const { a, b } = useKeranjang((s) => ({ a: s.a, b: s.b }));

        # Object baru tiap panggilan selektor.
        # Digambar ulang pada setiap perubahan store, sama seperti membaca semuanya.
        `,
      { caption: 'Selektor mengembalikan object literal.' },
    ),
    p(
      'Perbandingan hasil selektor memakai `Object.is`, dan ini konsekuensi yang sama dengan dependensi efek dan nilai Context yang sudah dibahas berulang di kategori ini. Polanya selalu sama, yaitu object literal baru selalu berbeda. Panggil selektor terpisah untuk tiap nilai, atau pakai pembanding isi yang disediakan pustaka.',
    ),
    code(
      'text',
      `
        tambah: (b) => set((s) => { s.barang.push(b); return s; }),

        # Tidak ada error. Data bertambah kalau dicetak,
        # dan tampilan tidak pernah berubah.
        `,
      { caption: 'Array diubah di tempat lalu state yang sama dikembalikan.' },
    ),
    p(
      'Pantangan mutasi dari Bab 1 Frontend Basic berlaku penuh di sini, dan di store gejalanya lebih membingungkan sebab sebagian komponen bisa saja ikut diperbarui karena alasan lain. Yang benar adalah mengembalikan bagian yang berubah sebagai nilai baru, yaitu `{ barang: [...s.barang, b] }`. Sebagian pustaka menyediakan mode yang memperbolehkan penulisan seperti mengubah di tempat, dan itu tetap menghasilkan salinan baru di baliknya.',
    ),
    code(
      'text',
      `
        # Store dengan penyimpanan ke localStorage, dirender di server:

        # Diuji: localStorage di server
        # ERR :: Cannot read properties of undefined (reading 'getItem')

        # Dan kalau dijaga, HTML server berbeda dari klien:
        Warning: Text content did not match. Server: "0" Client: "3"
        `,
      { caption: 'Diuji sungguhan. Server tidak punya `localStorage`.' },
    ),
    p(
      'Ini jebakan yang khas saat store yang menyimpan isinya ke penyimpanan peramban dipakai di Next.js. Server merender dengan keadaan awal kosong, klien memuat dari penyimpanan dan mendapat isi yang berbeda, dan React melaporkan ketidakcocokan. Jalan keluarnya menunda pembacaan penyimpanan sampai komponennya terpasang, sehingga render pertama di kedua sisi sama-sama memakai nilai awal.',
    ),
    table(
      ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Tidak ada perbedaan setelah pindah ke store',
          'Seluruh store dibaca tanpa selektor',
          'Pilih hanya nilai yang dibaca komponen itu',
        ],
        [
          'Selektor dipakai dan tetap digambar ulang terus',
          'Selektor mengembalikan object literal baru',
          'Panggil selektor terpisah per nilai, atau pakai pembanding isi',
        ],
        [
          'Data bertambah tapi layar diam',
          'State diubah di tempat di dalam `set`',
          'Kembalikan nilai baru, bukan yang sama',
        ],
        [
          '`Text content did not match`',
          'Store memuat dari penyimpanan yang tidak ada di server',
          'Tunda pembacaan penyimpanan sampai komponennya terpasang',
        ],
        [
          'Perhitungan berat berjalan sangat sering',
          'Turunan dihitung di dalam selektor',
          'Pilih data mentahnya, hitung turunannya di komponen',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Berpindah ke store menyelesaikan satu masalah dan membawa kelas kesalahannya sendiri, dan sebagian besarnya berkaitan dengan selektor.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Membaca seluruh store tanpa selektor',
          'Lebih pendek ditulis',
          'Kehilangan seluruh keunggulan store. Perilakunya sama dengan Context',
        ],
        [
          'Selektor mengembalikan object berisi beberapa nilai',
          'Sekali panggil dapat semuanya',
          'Object baru tiap panggilan, sehingga perbandingannya selalu berbeda',
        ],
        [
          'Menghitung nilai turunan di dalam selektor',
          'Supaya komponennya bersih',
          'Selektor dipanggil pada setiap perubahan store. Hitung di komponen',
        ],
        [
          'Mengubah state di tempat di dalam `set`',
          'Lebih pendek daripada menyebar',
          'Rujukannya tidak berubah, sehingga pembaca tidak diberi tahu',
        ],
        [
          'Memindahkan data server ke store',
          'Semua state di satu tempat',
          'Kamu menulis sendiri cache dan kesegaran yang sudah disediakan pustaka pengambil data',
        ],
        [
          'Membuat satu store raksasa untuk seluruh aplikasi',
          'Satu tempat lebih mudah dicari',
          'Menjadi ratusan baris dan sulit diuji. Pecah per domain, misalnya keranjang dan preferensi terpisah',
        ],
      ],
    ),
    p(
      'Baris kelima adalah kesalahan yang paling mahal dan paling sering, dan ia sudah dibahas di Sub-bab 8.1. Data dari server punya kebutuhan yang berbeda, yaitu cache, penandaan basi, penyegaran otomatis, dan penanganan gagal. Store global tidak menyediakan satu pun dari itu, sehingga menyimpannya di sana berarti kamu yang menulisnya, dengan lebih sedikit pengujian daripada pustaka yang sudah ada.',
    ),
    callout(
      'info',
      'Bab ini tidak memasang pustaka apa pun ke project',
      'Website ini tidak memakai pustaka state, sehingga contoh Zustand di sini ditulis mengikuti dokumentasi resminya dan tidak dijalankan di sini. Yang **diukur sungguhan** adalah perilaku React yang mendasarinya, yaitu perbandingan `Object.is` pada hasil selektor dan perbedaan penggambaran ulang antara Context dan store berselektor. Untuk API terbaru pustakanya, buka dokumentasi resmi di bagian rujukan.',
    ),
    references(
      {
        label: 'Zustand — Introduction',
        href: 'https://zustand.docs.pmnd.rs/getting-started/introduction',
        source: 'Zustand',
        note: 'Dokumentasi resmi Zustand, termasuk bentuk `create` dan pemakaian dasarnya.',
      },
      {
        label: 'Prevent rerenders with useShallow',
        href: 'https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow',
        source: 'Zustand',
        note: 'Jalan keluar resmi untuk selector yang mengembalikan objek atau array.',
      },
      {
        label: 'persist middleware',
        href: 'https://zustand.docs.pmnd.rs/integrations/persisting-store-data',
        source: 'Zustand',
        note: 'Opsi `name` dan `partialize` yang dipakai contoh penyimpanan ke `localStorage`.',
      },
      {
        label: 'Omit<Type, Keys>',
        href: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys',
        source: 'TypeScript',
        note: 'Utility type yang membuat pemanggil tidak perlu mengisi field `jumlah`.',
      },
    ),
  ]),

  written('redux-toolkit', 'Redux Toolkit', 21, 'Redux modern, jauh dari boilerplate versi lama.', [
    p(
      'Reputasi Redux sebagai "banyak boilerplate" berasal dari cara lama menulisnya: konstanta action, action creator, dan reducer `switch` yang panjang, semuanya ditulis tangan di file terpisah. **Redux Toolkit (RTK)** adalah cara resmi menulis Redux sekarang, dan ia menghapus hampir semua itu.',
    ),

    terms(
      {
        term: 'Redux',
        meaning:
          'Library state global tertua dan paling berpengaruh di ekosistem React. Reputasinya "banyak boilerplate" berasal dari **cara lama** menulisnya: konstanta action, action creator, dan reducer `switch` panjang, semuanya ditulis tangan di file terpisah.',
      },
      {
        term: 'boilerplate',
        meaning:
          'Dibaca "boilerpleit", artinya **kode pengulangan** — potongan yang harus ditulis berulang kali tanpa membawa makna baru. Namanya dari pelat baja cetakan yang dipakai berkali-kali di percetakan lama. Menghapusnya adalah alasan utama Redux Toolkit ada.',
      },
      {
        term: 'Redux Toolkit (RTK)',
        meaning:
          'Cara **resmi** menulis Redux sekarang. Bukan library saingan — ini yang direkomendasikan tim Redux sendiri. Kalau kamu menemukan tutorial Redux yang menulis konstanta action dengan tangan, tutorial itu mengajarkan cara yang sudah ditinggalkan.',
      },
      {
        term: 'slice',
        meaning:
          'Dibaca "slais", artinya **irisan**. Satu potongan state beserta seluruh reducer dan action-nya dalam satu berkas. `createSlice` menghasilkan ketiganya sekaligus, yaitu reducer, action creator, dan tipenya, jadi tidak ada yang bisa lupa disinkronkan.',
      },
      {
        term: 'payload',
        meaning:
          'Data yang dibawa sebuah action. Pada `PayloadAction<string>`, artinya "action ini membawa satu string". Namanya dari istilah pengiriman: payload yang dibawa, dipisahkan dari label pengirimannya (`type`).',
      },
      {
        term: 'Immer',
        meaning:
          'Library yang membuat `state.items.push()` di dalam `createSlice` **boleh** ditulis. Yang kamu ubah sebenarnya objek **draft**; Immer mencatat perubahannya lalu menghasilkan objek baru yang immutable. Aturan "jangan memutasi state" tetap berlaku — hanya kodenya jadi enak dibaca. Ini **hanya** berlaku di dalam `createSlice`, bukan di komponen.',
      },
      {
        term: 'configureStore',
        meaning:
          'Fungsi RTK untuk merakit store dari beberapa slice sekaligus. Ia juga memasang DevTools dan middleware standar secara otomatis — bagian yang di Redux lama harus disiapkan sendiri.',
      },
      {
        term: 'dispatch',
        meaning:
          'Fungsi untuk **mengirim** sebuah action ke store. Namanya berarti "mengirimkan/menugaskan". Komponen tidak pernah mengubah state langsung; ia mengirim action, dan reducer yang memutuskan hasilnya.',
      },
      {
        term: 'ReturnType<typeof …>',
        meaning:
          'Trik TypeScript untuk **menurunkan** tipe dari kode yang sudah ada, alih-alih menuliskannya lagi. `RootState` diambil dari bentuk store yang sebenarnya — jadi ia tidak bisa basi saat slice baru ditambahkan.',
      },
    ),

    h2('Slice: reducer, action, dan tipe sekaligus'),
    code(
      'ts',
      `
        import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

        type Item = { id: string; nama: string; jumlah: number };
        type KeranjangState = { items: Item[] };

        const initialState: KeranjangState = { items: [] };

        const keranjangSlice = createSlice({
          name: 'keranjang',
          initialState,
          reducers: {
            // Terlihat seperti mutasi, tapi bukan — lihat catatan di bawah.
            tambah(state, action: PayloadAction<Omit<Item, 'jumlah'>>) {
              const ada = state.items.find((i) => i.id === action.payload.id);
              if (ada) {
                ada.jumlah += 1;
              } else {
                state.items.push({ ...action.payload, jumlah: 1 });
              }
            },
            hapus(state, action: PayloadAction<string>) {
              state.items = state.items.filter((i) => i.id !== action.payload);
            },
          },
        });

        export const { tambah, hapus } = keranjangSlice.actions;
        export default keranjangSlice.reducer;
        `,
      { filename: 'src/store/keranjang-slice.ts' },
    ),
    callout(
      'info',
      'Kenapa `state.items.push()` boleh di sini',
      'RTK membungkus reducer dengan **Immer**. Yang kamu ubah sebenarnya adalah objek draft; Immer mencatat perubahannya lalu menghasilkan objek baru yang immutable. Jadi aturan "jangan pernah memutasi state" tetap berlaku — Immer hanya membuat kodenya jauh lebih enak dibaca. Aturan ini **hanya** berlaku di dalam `createSlice`, bukan di komponen.',
    ),

    h2('Menyusun store dan tipe-tipenya'),
    code(
      'ts',
      `
        import { configureStore } from '@reduxjs/toolkit';
        import keranjangReducer from './keranjang-slice';

        export const store = configureStore({
          reducer: { keranjang: keranjangReducer },
        });

        // Tipe diturunkan dari store, bukan ditulis tangan — jadi ia tidak bisa basi.
        export type RootState = ReturnType<typeof store.getState>;
        export type AppDispatch = typeof store.dispatch;
        `,
      { filename: 'src/store/index.ts' },
    ),
    code(
      'ts',
      `
        import { useDispatch, useSelector } from 'react-redux';
        import type { AppDispatch, RootState } from './index';

        // Bungkus sekali supaya tidak perlu menulis tipe di setiap pemakaian.
        export const useAppDispatch = () => useDispatch<AppDispatch>();
        export const useAppSelector = useSelector.withTypes<RootState>();
        `,
      { filename: 'src/store/hooks.ts' },
    ),

    h2('Memakainya di komponen'),
    code(
      'tsx',
      `
        function TombolTambah({ produk }: { produk: { id: string; nama: string } }) {
          const dispatch = useAppDispatch();
          return <button onClick={() => dispatch(tambah(produk))}>Tambah</button>;
        }

        function JumlahItem() {
          // Selector, sama prinsipnya dengan Zustand: ambil sesempit mungkin.
          const jumlah = useAppSelector((s) => s.keranjang.items.length);
          return <span>{jumlah}</span>;
        }
        `,
    ),

    h2('Redux vs Zustand — jujur soal trade-off'),
    table(
      ['Aspek', 'Redux Toolkit', 'Zustand'],
      [
        ['Kode untuk store sederhana', 'Lebih panjang', 'Lebih pendek'],
        ['Provider di root', 'Wajib', 'Tidak perlu'],
        ['DevTools & time-travel', 'Sangat matang', 'Ada, lebih sederhana'],
        ['Middleware & konvensi tim', 'Kuat dan terstandar', 'Bebas, kamu yang atur'],
        ['Ukuran bundle', 'Lebih besar', 'Lebih kecil'],
        [
          'Cocok untuk',
          'Tim besar, alur state rumit, audit riwayat aksi',
          'Kebanyakan aplikasi menengah',
        ],
      ],
    ),
    p(
      'Redux masih pilihan tepat ketika **jejak perubahan** itu penting: aplikasi finansial, dasbor operasional, atau tim besar yang butuh satu konvensi yang tidak bisa ditawar. Untuk aplikasi menengah dengan sedikit client state, Zustand biasanya memberi manfaat yang sama dengan biaya lebih rendah.',
    ),
    callout(
      'warning',
      'RTK Query ada, tapi jangan pakai Redux biasa untuk data server',
      'Kalau kamu sudah memakai Redux, gunakan **RTK Query** untuk data server — bukan slice biasa dengan `createAsyncThunk` yang mengisi array. Alasannya sama seperti di sub-bab pertama: menyalin data server ke store berarti membangun ulang cache dan invalidasi dengan tangan.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Aplikasi lama memakai Redux dengan pola lama, yaitu berkas terpisah untuk tipe aksi, pembuat aksi, reducer, dan penghubung komponen. Menambah satu field ke state berarti menyunting empat berkas. Setelah dipindahkan ke Redux Toolkit, keempatnya menjadi satu berkas dan menambah field menjadi satu baris.',
    ),
    p(
      'Redux Toolkit adalah cara resmi memakai Redux hari ini, dan sebagian besar keluhan tentang Redux berasal dari pola lama yang sudah tidak dianjurkan.',
    ),
    compare(
      {
        title: 'Redux pola lama',
        lang: 'ts',
        code: `
          // actionTypes.ts
          export const TAMBAH = 'keranjang/TAMBAH';

          // actions.ts
          export const tambah = (b) => ({ type: TAMBAH, payload: b });

          // reducer.ts
          export function keranjang(state = { barang: [] }, aksi) {
            switch (aksi.type) {
              case TAMBAH:
                // WAJIB menyalin manual di setiap cabang.
                return { ...state, barang: [...state.barang, aksi.payload] };
              default:
                return state;
            }
          }
          `,
        notes: ['Tiga berkas untuk satu aksi', 'Penyalinan manual di tiap cabang'],
      },
      {
        title: 'Redux Toolkit',
        lang: 'ts',
        code: `
          // keranjangSlice.ts — satu berkas untuk semuanya.
          import { createSlice } from '@reduxjs/toolkit';

          const keranjangSlice = createSlice({
            name: 'keranjang',
            initialState: { barang: [] as Barang[] },
            reducers: {
              // Terlihat seperti mengubah di tempat, dan sebenarnya TIDAK.
              // Immer di baliknya menghasilkan salinan baru.
              tambah(state, aksi: PayloadAction<Barang>) {
                state.barang.push(aksi.payload);
              },
              hapus(state, aksi: PayloadAction<string>) {
                state.barang = state.barang.filter((b) => b.id !== aksi.payload);
              },
            },
          });

          export const { tambah, hapus } = keranjangSlice.actions;
          export default keranjangSlice.reducer;
          `,
        notes: ['Satu berkas, tipe aksi dibuat otomatis', 'Immer mengurus penyalinannya'],
      },
    ),
    p(
      'Bagian yang paling mengejutkan bagi yang datang dari pola lama adalah `state.barang.push(...)` di dalam reducer. Ini terlihat melanggar pantangan mutasi yang ditegakkan di seluruh kategori ini, dan sebenarnya tidak. Redux Toolkit memakai Immer yang memberi kamu object draf, mencatat perubahan yang kamu tulis, lalu menghasilkan salinan baru di baliknya. State aslinya tidak pernah tersentuh.',
    ),
    p(
      'Yang perlu diwaspadai, kelonggaran itu **hanya berlaku di dalam reducer** yang dibuat `createSlice` dan di dalam `createReducer`. Di luar keduanya, misalnya di dalam selektor, di dalam komponen, atau di dalam fungsi bantu yang menerima state, pantangan mutasi berlaku penuh seperti biasa. Menulis `state.barang.push(...)` di sana benar-benar mengubah state dan menimbulkan bug yang sulit ditelusuri.',
    ),
    code(
      'ts',
      `
        // Selektor: dipanggil pada setiap perubahan store apa pun.
        // Selektor sederhana tidak perlu apa-apa.
        export const pilihBarang = (s: RootState) => s.keranjang.barang;

        // Selektor yang MENGHITUNG perlu disimpan hasilnya,
        // kalau tidak ia menghasilkan array baru tiap panggilan.
        export const pilihBarangTerpilih = createSelector(
          [pilihBarang],
          (barang) => barang.filter((b) => b.terpilih),   // array BARU tiap panggilan
        );

        // Tanpa createSelector, komponen yang memakainya
        // digambar ulang pada setiap perubahan store.
        `,
      { caption: 'Selektor yang menghasilkan nilai baru wajib disimpan hasilnya.' },
    ),
    p(
      'Ini masalah yang sama persis dengan selektor Zustand di sub-bab sebelumnya, dan dengan dependensi efek, dan dengan nilai Context. Polanya selalu satu, yaitu perbandingan memakai `Object.is` sehingga array atau object baru selalu dianggap berbeda. `createSelector` menyimpan hasilnya dan mengembalikan rujukan yang sama selama masukannya tidak berubah.',
    ),
    p(
      'Kapan Redux Toolkit lebih tepat daripada pustaka yang lebih ringan bisa diringkas. Ia menang saat aplikasinya besar dengan banyak tim, saat kamu butuh perkakas pengembangan yang bisa memutar ulang aksi satu per satu, saat aturan perubahannya rumit dan layak diuji terpisah, atau saat sudah ada kode Redux lama yang harus dirawat. Untuk aplikasi kecil dengan satu atau dua nilai global, ia berlebihan.',
    ),
    callout(
      'tip',
      'Perkakas pengembangannya adalah alasan tersendiri',
      'Redux DevTools menampilkan setiap aksi beserta keadaan sebelum dan sesudahnya, dan memungkinkan memutar ulang urutan aksi untuk mereproduksi bug. Untuk alur yang rumit seperti checkout bertahap, kemampuan itu sering lebih berharga daripada selisih ukuran pustaka.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering, dan sebagian besarnya berakar pada perbandingan rujukan yang sudah berulang kali muncul di kategori ini.',
    ),
    code(
      'text',
      `
        const barangTerpilih = useSelector((s) => s.keranjang.barang.filter((b) => b.terpilih));

        # Array baru tiap panggilan selektor.
        # Komponen digambar ulang pada SETIAP perubahan store apa pun.
        `,
      { caption: 'Selektor menghasilkan array baru tanpa penyimpanan hasil.' },
    ),
    p(
      'Tidak ada error, dan gejalanya berupa komponen yang digambar ulang jauh lebih sering daripada yang masuk akal. Cara menemukannya adalah menyalakan Highlight updates di React DevTools lalu memicu perubahan di bagian store yang sama sekali tidak berhubungan. Kalau komponennya ikut berkedip, selektornya menghasilkan nilai baru. Bungkus dengan `createSelector`.',
    ),
    code(
      'text',
      `
        // Di luar createSlice, misalnya di komponen:
        const barang = useSelector(pilihBarang);
        barang.push(baru);

        TypeError: Cannot add property 0, object is not extensible
        `,
      { caption: 'State Redux dibekukan di mode pengembangan.' },
    ),
    p(
      'Redux Toolkit membekukan state di mode pengembangan justru untuk menangkap kesalahan ini. Kelonggaran menulis seperti mengubah di tempat hanya berlaku di dalam reducer yang dibuat `createSlice`, dan di luar itu state benar-benar tidak boleh disentuh. Pesan errornya cukup jelas, dan tanpa pembekuan itu kesalahan ini akan menjadi bug senyap.',
    ),
    code(
      'text',
      `
        reducers: {
          tambah(state, aksi) {
            state.barang.push(aksi.payload);
            return { ...state, jumlah: state.barang.length };   // sekaligus return
          },
        }

        # Mencampur mengubah draf DAN mengembalikan nilai baru.
        `,
      { caption: 'Immer tidak bisa menerima keduanya sekaligus.' },
    ),
    p(
      'Reducer Immer boleh mengubah draf **atau** mengembalikan nilai baru, dan tidak boleh keduanya dalam satu cabang. Mencampurnya membuat perubahan pada draf diabaikan atau menghasilkan perilaku yang tidak terduga. Pilih satu gaya per cabang, dan biasanya mengubah draf yang lebih pendek.',
    ),
    code(
      'text',
      `
        # Data produk dari server disimpan sebagai potongan Redux.
        # Pengguna berpindah halaman lalu kembali.

        # Daftar masih menampilkan data lima menit lalu.
        # Tidak ada yang menandai bahwa datanya basi.
        `,
      { caption: 'Data server disimpan sebagai state global biasa.' },
    ),
    p(
      'Ini kesalahan penempatan yang sudah dibahas di Sub-bab 8.1, dan di Redux ia sangat sering sebab store terasa seperti tempat semua data. Redux Toolkit menyediakan RTK Query khusus untuk data server, dengan cache dan penandaan basi bawaan. Memakai potongan biasa untuk data server berarti melewatkan alat yang sudah ada di paket yang sama.',
    ),
    table(
      ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Komponen digambar ulang untuk perubahan yang tidak relevan',
          'Selektor menghasilkan array atau object baru',
          'Bungkus dengan `createSelector`',
        ],
        [
          '`object is not extensible`',
          'State diubah di luar reducer',
          'Kelonggaran Immer hanya di dalam `createSlice`',
        ],
        [
          'Perubahan di reducer diabaikan',
          'Mencampur mengubah draf dan mengembalikan nilai baru',
          'Pilih satu gaya per cabang',
        ],
        [
          'Data server basi tanpa tanda',
          'Data server disimpan sebagai potongan biasa',
          'Pakai RTK Query, atau pustaka pengambil data lain',
        ],
        [
          'Menambah satu field menyentuh empat berkas',
          'Masih memakai pola Redux lama',
          'Pindah ke `createSlice`',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Sebagian besar keluhan tentang Redux berasal dari pola lama atau dari memakainya untuk hal yang bukan tugasnya.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Memakai pola Redux lama dengan berkas terpisah',
          'Itu yang ada di tutorial lama',
          'Menambah satu field menyentuh empat berkas. `createSlice` menggabungkannya',
        ],
        [
          'Mengira boleh mengubah state di mana saja',
          'Di reducer kan boleh',
          'Kelonggaran Immer hanya di dalam `createSlice` dan `createReducer`. Di luar itu state dibekukan',
        ],
        [
          'Menulis selektor yang menghitung tanpa `createSelector`',
          'Selektornya kan sederhana',
          'Ia menghasilkan nilai baru tiap panggilan, sehingga pembacanya digambar ulang terus',
        ],
        [
          'Menyimpan data server sebagai potongan biasa',
          'Store kan tempat semua data',
          'Kamu menulis sendiri cache dan kesegaran. RTK Query sudah menyediakannya di paket yang sama',
        ],
        [
          'Memakai Redux untuk aplikasi dengan dua nilai global',
          'Ia paling matang',
          'Kematangan itu berharga pada aplikasi besar. Untuk dua nilai, Context atau pustaka ringan lebih hemat',
        ],
        [
          'Menyimpan nilai turunan di dalam state',
          'Supaya tidak dihitung ulang',
          'Dua sumber kebenaran yang harus dijaga di tiap reducer. Pakai selektor yang menghitung',
        ],
      ],
    ),
    p(
      'Baris kedua layak ditegaskan karena kelonggaran Immer adalah satu-satunya tempat di seluruh kategori ini yang memperbolehkan penulisan seperti mengubah di tempat. Batasnya tegas, yaitu di dalam reducer yang dibuat Redux Toolkit. Membawanya keluar dari sana, misalnya ke fungsi bantu yang menerima state, menghasilkan mutasi sungguhan yang ditangkap pembekuan di mode pengembangan dan lolos di produksi.',
    ),
    callout(
      'info',
      'Contoh di sub-bab ini tidak dijalankan di project ini',
      'Website ini tidak memakai Redux, sehingga kode di atas ditulis mengikuti dokumentasi resmi Redux Toolkit dan tidak dieksekusi di sini. Yang **diukur sungguhan** adalah perilaku React yang mendasarinya, yaitu perbandingan `Object.is` yang membuat selektor tanpa penyimpanan hasil menggambar ulang pembacanya. Untuk API terbaru, buka rujukan resmi di bawah.',
    ),
    references(
      {
        label: 'Redux Toolkit — Getting Started',
        href: 'https://redux-toolkit.js.org/introduction/getting-started',
        source: 'Redux Toolkit',
        note: 'Cara resmi menulis Redux sekarang, menggantikan pola konstanta action buatan tangan.',
      },
      {
        label: 'createSlice',
        href: 'https://redux-toolkit.js.org/api/createSlice',
        source: 'Redux Toolkit',
        note: 'Menghasilkan reducer, action creator, dan tipenya sekaligus dari satu definisi.',
      },
      {
        label: 'Redux Style Guide',
        href: 'https://redux.js.org/style-guide/',
        source: 'Redux',
        note: 'Konvensi resmi, termasuk kenapa mutasi hanya boleh di dalam reducer yang dibungkus Immer.',
      },
      {
        label: 'RTK Query — Overview',
        href: 'https://redux-toolkit.js.org/rtk-query/overview',
        source: 'Redux Toolkit',
        note: 'Alat server state milik Redux sendiri, pengganti slice + `createAsyncThunk` untuk data API.',
      },
    ),
  ]),

  written(
    'jotai',
    'Jotai (pendekatan atomic)',
    18,
    'State sebagai atom-atom kecil yang saling menurunkan.',
    [
      p(
        'Redux dan Zustand memakai model **satu store besar**: kamu menyimpan semuanya di satu objek lalu memilih potongannya dengan selector. Jotai membalik arahnya — state dipecah menjadi **atom** kecil yang berdiri sendiri, dan yang besar dirakit dari yang kecil.',
      ),

      terms(
        {
          term: 'Jotai',
          meaning:
            'Bahasa Jepang untuk **keadaan** (状態), dibaca "jo-tai". Library dari tim yang sama dengan Zustand (Poimandres). Bedanya arah: Zustand memakai satu store besar yang dipotong dengan selector, Jotai memecah state jadi banyak potongan kecil yang dirakit dari bawah.',
        },
        {
          term: 'atom',
          meaning:
            'Satu potongan state terkecil yang berdiri sendiri. Namanya dari kimia — bagian terkecil yang masih punya identitas. Sebuah atom bisa berisi nilai biasa, atau berisi **rumus** yang membaca atom lain. Yang kedua itulah kekuatan utama Jotai.',
        },
        {
          term: 'model atomic',
          meaning:
            'Pendekatan "bangun dari bawah": kamu mendefinisikan potongan-potongan kecil, lalu yang besar muncul sebagai turunannya. Lawannya model store tunggal, yang mendefinisikan satu objek besar lalu memotongnya dengan selector.',
        },
        {
          term: 'useAtom',
          meaning:
            'Hook yang mengembalikan `[nilai, setter]` — bentuknya sengaja dibuat semirip mungkin dengan `useState`, supaya perpindahannya terasa alami. Ia berlangganan **dan** bisa menulis.',
        },
        {
          term: 'useAtomValue',
          meaning:
            'Hanya **membaca** sebuah atom. Dipakai di komponen yang menampilkan nilainya tapi tidak pernah mengubahnya — lebih jelas maksudnya daripada mengambil `[nilai]` dan membuang setter-nya.',
        },
        {
          term: 'useSetAtom',
          meaning:
            'Hanya **menulis**, tanpa berlangganan. Ini keunggulan yang paling terasa: tombol reset yang tidak pernah menampilkan angkanya jadi **tidak pernah** di-render ulang — sesuatu yang butuh usaha ekstra untuk dicapai dengan Context.',
        },
        {
          term: 'derived atom',
          meaning:
            'Atom yang nilainya **dihitung** dari atom lain: `atom((get) => get(itemsAtom).length)`. Ia ikut terbarui otomatis, tanpa `useEffect`, dan tanpa risiko dua source of truth — karena nilainya memang tidak pernah disimpan.',
        },
        {
          term: 'get',
          meaning:
            'Fungsi yang diberikan Jotai ke dalam rumus sebuah derived atom untuk membaca atom lain. Selain membaca, ia juga **mendaftarkan ketergantungan**: Jotai jadi tahu atom mana yang harus dihitung ulang saat sumbernya berubah.',
        },
        {
          term: 'read-write atom',
          meaning:
            'Atom turunan yang juga bisa **ditulis** — argumen keduanya menerjemahkan tulisan itu kembali ke atom sumbernya. Berguna untuk membuat "pintu masuk" yang nyaman, misalnya `itemPertamaAtom` yang menulis ke `itemsAtom`.',
        },
      ),

      h2('Atom dasar'),
      code(
        'ts',
        `
        import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

        export const hitunganAtom = atom(0);
        export const namaAtom = atom('');
        `,
      ),
      code(
        'tsx',
        `
        function Penghitung() {
          const [hitungan, setHitungan] = useAtom(hitunganAtom);
          return <button onClick={() => setHitungan((n) => n + 1)}>{hitungan}</button>;
        }

        // Hanya membaca -> tidak ikut render saat setter berubah
        function Tampilan() {
          const hitungan = useAtomValue(hitunganAtom);
          return <p>{hitungan}</p>;
        }

        // Hanya menulis -> TIDAK re-render saat nilainya berubah
        function TombolReset() {
          const set = useSetAtom(hitunganAtom);
          return <button onClick={() => set(0)}>Reset</button>;
        }
        `,
      ),
      p(
        'Ketiga komponen membaca **atom yang sama**, tetapi memakai hook yang berbeda, dan pilihan hook itulah yang menentukan siapa ikut dirender. `useAtom` memberi keduanya, nilai dan setter, seperti `useState`. `useAtomValue` hanya berlangganan nilainya. Yang paling menarik adalah `useSetAtom`, sebab ia memberi kemampuan **mengubah tanpa berlangganan**, sehingga `TombolReset` tidak pernah di-render ulang berapa kali pun angkanya berubah. Bandingkan dengan Context, di mana setiap konsumen ikut dirender tanpa peduli bagian mana yang ia pakai, sebab di sana pemisahan seperti ini harus dicapai dengan memecah context menjadi dua, seperti yang dilakukan di sub-bab sebelumnya. Di Jotai pemisahan itu sudah menjadi bagian dari API-nya.',
      ),
      callout(
        'tip',
        'Keunggulan yang paling terasa',
        '`useSetAtom` memberi komponen kemampuan mengubah tanpa berlangganan. Tombol reset yang tidak pernah menampilkan angkanya jadi tidak pernah re-render — sesuatu yang butuh usaha ekstra untuk dicapai dengan Context.',
      ),

      h2('Derived atom: yang bisa dihitung, jangan disimpan'),
      p(
        'Ini kekuatan utama Jotai. Derived value didefinisikan sebagai atom yang membaca atom lain, dan ia otomatis ikut terbarui — tanpa `useEffect`, tanpa risiko dua source of truth.',
      ),
      code(
        'ts',
        `
        export const itemsAtom = atom<Item[]>([]);

        // Read-only, dihitung dari itemsAtom.
        export const totalHargaAtom = atom((get) =>
          get(itemsAtom).reduce((jumlah, i) => jumlah + i.harga * i.jumlah, 0),
        );

        export const jumlahItemAtom = atom((get) => get(itemsAtom).length);

        // Bisa dibaca DAN ditulis: tulisannya diterjemahkan ke atom sumber.
        export const itemPertamaAtom = atom(
          (get) => get(itemsAtom)[0] ?? null,
          (get, set, baru: Item) => {
            const semua = get(itemsAtom);
            set(itemsAtom, [baru, ...semua.slice(1)]);
          },
        );
        `,
      ),
      p(
        'Perhatikan `totalHargaAtom` dan `jumlahItemAtom` **tidak menyimpan apa pun**, sebab keduanya berupa fungsi yang menghitung dari `itemsAtom` lewat `get`. Itu yang membuatnya mustahil tidak sinkron, karena tidak ada salinan yang bisa basi, karena tidak ada salinan. Bandingkan dengan menyimpan `totalHarga` sebagai state terpisah lalu menjaganya dengan `useEffect`, yang persis anti-pattern derived value dari sub-bab kesalahan `useEffect`, dan di sini masalahnya hilang di tingkat rancangan. `itemPertamaAtom` menunjukkan bentuk yang lebih jauh, sebab argumen pertama membacanya sedangkan argumen kedua **menerjemahkan penulisan kembali ke atom sumber**. Jadi komponen bisa menulis ke `itemPertamaAtom` seolah ia state biasa, sementara yang sebenarnya berubah tetap `itemsAtom`, sehingga satu source of truth tetap terjaga meski cara mengaksesnya beragam.',
      ),

      h2('Kapan Jotai lebih cocok'),
      ul(
        'State-nya banyak dan **saling bergantung** — form kompleks, editor, kanvas, konfigurasi bercabang.',
        'Kamu ingin derived value yang **tidak mungkin** tidak sinkron, karena ia memang tidak disimpan.',
        'Kamu sudah nyaman dengan `useState` — API Jotai memang sengaja dibuat semirip mungkin.',
      ),
      p(
        'Sebaliknya, kalau state globalmu sedikit dan datar (tema, sesi, keranjang), model store tunggal Zustand biasanya lebih mudah dilacak. Membaca satu store lebih cepat daripada mengejar rantai atom yang tersebar di banyak file.',
      ),

      h2('Ringkasan tiga pendekatan'),
      table(
        ['', 'Redux Toolkit', 'Zustand', 'Jotai'],
        [
          ['Model', 'Satu store + aksi', 'Satu store + selector', 'Banyak atom kecil'],
          ['Derived value', 'Selector (dengan memo)', 'Selector', 'Derived atom (bawaan)'],
          ['Provider', 'Wajib', 'Tidak perlu', 'Opsional'],
          [
            'Paling kuat saat',
            'Action trail & tim besar',
            'State global datar',
            'State saling bergantung',
          ],
        ],
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Editor formulir punya empat puluh field yang tersebar di enam bagian. Disimpan sebagai satu object di store, mengetik di satu field membuat seluruh bagian digambar ulang sebab selektornya membaca object yang sama. Dipecah menjadi empat puluh potongan store terpisah, berkas storenya menjadi tiga ratus baris dan sulit dibaca.',
      ),
      p(
        'Jotai membalik arah penyusunannya. Alih-alih satu store besar yang dipecah dengan selektor, ia dimulai dari potongan-potongan kecil yang digabungkan saat dibutuhkan.',
      ),
      code(
        'tsx',
        `
        import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

        // Setiap nilai adalah atom sendiri. Sekecil apa pun.
        export const namaAtom = atom('');
        export const emailAtom = atom('');
        export const teleponAtom = atom('');

        // Atom turunan: dihitung dari atom lain, tidak menyimpan apa pun.
        // Ia diperbarui otomatis saat sumbernya berubah.
        export const bolehKirimAtom = atom(
          (baca) => baca(namaAtom).trim() !== '' && baca(emailAtom).includes('@'),
        );
        `,
        { filename: 'src/form/atom.ts' },
      ),
      code(
        'tsx',
        `
        // Komponen hanya berlangganan ke atom yang ia pakai.
        function KolomNama() {
          const [nama, setNama] = useAtom(namaAtom);
          return <input value={nama} onChange={(e) => setNama(e.currentTarget.value)} />;
        }

        // Hanya membaca: tidak ikut digambar ulang saat atom LAIN berubah.
        function TombolKirim() {
          const boleh = useAtomValue(bolehKirimAtom);
          return <button disabled={!boleh}>Kirim</button>;
        }

        // Hanya menulis: TIDAK digambar ulang sama sekali saat nilainya berubah.
        function TombolBersihkan() {
          const setNama = useSetAtom(namaAtom);
          return <button onClick={() => setNama('')}>Bersihkan</button>;
        }
        `,
        { caption: '`useSetAtom` untuk komponen yang hanya menulis, bukan membaca.' },
      ),
      p(
        'Pembedaan tiga hook itu yang sering dilewatkan dan paling berpengaruh. `useAtom` berlangganan sekaligus menyediakan setter, sehingga komponennya digambar ulang saat nilainya berubah. `useAtomValue` hanya berlangganan. Dan `useSetAtom` hanya menyediakan setter **tanpa berlangganan sama sekali**, sehingga tombol yang hanya menulis tidak pernah digambar ulang oleh perubahan itu.',
      ),
      p(
        'Atom turunan seperti `bolehKirimAtom` adalah penerapan langsung aturan nilai turunan dari bab tentang state. Ia tidak menyimpan apa pun melainkan dihitung dari atom lain, sehingga mustahil tidak sinkron. Bedanya dengan menghitung di komponen, perhitungannya hanya berjalan saat sumbernya berubah dan hasilnya dibagi seluruh pembacanya.',
      ),
      p(
        'Kapan pendekatan ini lebih tepat bisa diringkas. Jotai menang saat state-nya banyak dan berpotongan dengan cara yang sulit diprediksi, misalnya editor, papan gambar, atau formulir sangat panjang. Ia kurang menang saat state-nya sedikit dan hubungannya jelas, sebab satu store dengan beberapa selektor lebih mudah dibaca daripada dua puluh atom yang tersebar.',
      ),
      callout(
        'warning',
        'Atom yang dibuat di dalam komponen dibuat ulang tiap render',
        'Bentuk `const a = atom(0)` di dalam badan komponen menghasilkan atom baru pada tiap render, sehingga nilainya tidak pernah bertahan. Definisikan atom di tingkat modul. Kalau kamu memang butuh atom per instance, ada pola khusus untuk itu dan ia bukan sekadar memindahkan pemanggilannya ke dalam komponen.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan seluruhnya berakar pada aturan React yang sudah dibahas di kategori ini.',
      ),
      code(
        'text',
        `
        function Kolom() {
          const namaAtom = atom('');        // dibuat DI DALAM komponen
          const [nama, setNama] = useAtom(namaAtom);
          return <input value={nama} onChange={(e) => setNama(e.target.value)} />;
        }

        # Atom baru tiap render. Ketikan hilang setiap kali.
        `,
        { caption: 'Atom didefinisikan di dalam badan komponen.' },
      ),
      p(
        'Gejalanya khas dan mudah dikenali, yaitu kotak input yang tidak bisa diketik sama sekali sebab nilainya kembali kosong pada tiap render. Ini bentuk yang sama dengan mendefinisikan komponen di dalam komponen dari bab sebelumnya, dan penyebabnya sama, yaitu identitas yang berubah tiap render. Definisikan atom di tingkat modul.',
      ),
      code(
        'text',
        `
        const [barang, setBarang] = useAtom(barangAtom);
        barang.push(baru);
        setBarang(barang);

        # Tidak ada error. Tampilan tidak berubah.
        `,
        { caption: 'Array diubah di tempat lalu diserahkan kembali.' },
      ),
      p(
        'Pantangan mutasi berlaku penuh di sini, sama seperti di `useState` dan di store lain. Perbandingannya memakai `Object.is`, dan array yang sama persis dianggap tidak berubah. Ini sudah muncul berkali-kali di kategori ini, dan polanya selalu sama, yaitu buat nilai baru dengan spread.',
      ),
      code(
        'text',
        `
        function TombolBersihkan() {
          const [nama, setNama] = useAtom(namaAtom);   // useAtom, bukan useSetAtom
          return <button onClick={() => setNama('')}>Bersihkan</button>;
        }

        # Tombol digambar ulang pada SETIAP ketikan,
        # padahal ia tidak menampilkan nilainya sama sekali.
        `,
        { caption: 'Berlangganan padahal hanya butuh menulis.' },
      ),
      p(
        'Tidak ada error, dan pemborosannya tidak terlihat. `useAtom` berlangganan ke atomnya, sehingga komponennya digambar ulang setiap kali nilainya berubah walaupun ia tidak memakainya. Untuk tombol yang hanya menulis, `useSetAtom` menghilangkan langganan itu sepenuhnya. Ini pembedaan kecil yang dampaknya nyata pada formulir panjang.',
      ),
      code(
        'text',
        `
        # Atom dengan penyimpanan ke localStorage, dirender di server:

        # Diuji: localStorage di server
        # ERR :: Cannot read properties of undefined (reading 'getItem')
        `,
        { caption: 'Diuji sungguhan. Server tidak punya penyimpanan peramban.' },
      ),
      p(
        'Ini jebakan yang sama dengan store lain yang menyimpan isinya, dan gejalanya sama, yaitu ketidakcocokan hidrasi kalau pembacaannya dijaga atau error kalau tidak. Jalan keluarnya menunda pembacaan penyimpanan sampai komponennya terpasang, sehingga render pertama di server dan di klien sama-sama memakai nilai awal.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Kotak input tidak bisa diketik',
            'Atom dibuat di dalam badan komponen',
            'Definisikan atom di tingkat modul',
          ],
          [
            'Tampilan tidak berubah setelah setter dipanggil',
            'Nilai diubah di tempat lalu diserahkan kembali',
            'Buat nilai baru dengan spread',
          ],
          [
            'Komponen yang hanya menulis ikut digambar ulang',
            '`useAtom` dipakai, seharusnya `useSetAtom`',
            'Pakai `useSetAtom` untuk yang hanya menulis',
          ],
          [
            'Error atau ketidakcocokan hidrasi saat dirender di server',
            'Atom memuat dari penyimpanan yang tidak ada di server',
            'Tunda pembacaannya sampai komponennya terpasang',
          ],
          [
            'Nilai turunan tidak sinkron',
            'Turunan disimpan sebagai atom biasa, bukan atom turunan',
            'Pakai atom yang dihitung dari atom lain',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pendekatan berbasis atom mengubah cara menyusun state, dan sebagian besar kesalahan berasal dari membawa kebiasaan store tunggal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat satu atom besar berisi seluruh state',
            'Seperti store yang sudah dikenal',
            'Kehilangan seluruh keunggulannya. Setiap perubahan menggambar ulang seluruh pembacanya',
          ],
          [
            'Mendefinisikan atom di dalam komponen',
            'Supaya dekat dengan pemakainya',
            'Atom baru tiap render, sehingga nilainya tidak pernah bertahan',
          ],
          [
            'Memakai `useAtom` untuk komponen yang hanya menulis',
            'Satu hook untuk semuanya',
            'Ia berlangganan tanpa perlu. Pakai `useSetAtom`',
          ],
          [
            'Menyimpan nilai turunan sebagai atom biasa',
            'Supaya tidak dihitung ulang',
            'Dua sumber kebenaran yang harus dijaga sinkron. Pakai atom turunan',
          ],
          [
            'Menyimpan data server sebagai atom',
            'Semua state di satu pendekatan',
            'Data server butuh cache dan kesegaran. Pakai pustaka pengambil data',
          ],
          [
            'Memakai pendekatan atom untuk dua nilai global',
            'Katanya lebih ringan',
            'Untuk dua nilai, Context sudah cukup dan tanpa dependensi',
          ],
        ],
      ),
      p(
        'Baris pertama menghapus seluruh alasan memakai pendekatan ini. Keunggulannya justru pada potongan yang kecil dan berlangganan yang tepat sasaran, dan menyatukan semuanya menjadi satu atom mengembalikan perilakunya menjadi seperti Context. Kalau kamu menemukan diri membuat satu atom berisi sepuluh field, pecah menjadi sepuluh atom.',
      ),
      callout(
        'info',
        'Contoh di sub-bab ini tidak dijalankan di project ini',
        'Website ini tidak memakai Jotai, sehingga kode di atas ditulis mengikuti dokumentasi resminya dan tidak dieksekusi di sini. Yang **diukur sungguhan** adalah perilaku React yang mendasarinya, yaitu perbandingan `Object.is`, identitas yang berubah tiap render, dan ketiadaan `localStorage` di server. Untuk API terbaru, buka rujukan resmi di bawah.',
      ),
      references(
        {
          label: 'Jotai — Introduction',
          href: 'https://jotai.org/docs/introduction',
          source: 'Jotai',
          note: 'Model atomic dan alasan API-nya sengaja dibuat mirip `useState`.',
        },
        {
          label: 'atom()',
          href: 'https://jotai.org/docs/core/atom',
          source: 'Jotai',
          note: 'Bentuk atom biasa, derived atom, dan atom yang bisa dibaca sekaligus ditulis.',
        },
        {
          label: 'useAtom / useAtomValue / useSetAtom',
          href: 'https://jotai.org/docs/core/use-atom',
          source: 'Jotai',
          note: 'Tiga hook dengan perilaku langganan yang berbeda — dasar optimasi di sub-bab ini.',
        },
        {
          label: 'Comparison with other libraries',
          href: 'https://jotai.org/docs/basics/comparison',
          source: 'Jotai',
          note: 'Perbandingan resmi Jotai dengan Redux, Zustand, dan Recoil.',
        },
      ),
    ],
  ),

  written(
    'tanstack-query',
    'Server State dengan TanStack Query',
    25,
    'Data server bukan state biasa — ia punya cache, staleness, dan mode gagal sendiri.',
    [
      p(
        'Ini sub-bab terpenting di bab ini. Data server berbeda secara mendasar dari client state: kamu **bukan pemiliknya**. Server bisa mengubahnya kapan saja tanpa memberitahu, salinan di browsermu bisa basi kapan saja, dan permintaan untuk mengambilnya bisa gagal, lambat, atau datang tidak sesuai urutan.',
      ),

      terms(
        {
          term: 'TanStack Query',
          meaning:
            'Library khusus **server state**, dulu bernama React Query. "TanStack" adalah nama kumpulan tool dari Tanner Linsley. Ia bukan store — ia **cache** yang tahu cara mengambil ulang, membatalkan, dan menyegarkan data yang bukan milikmu.',
        },
        {
          term: 'cache',
          meaning:
            'Dibaca "kesh", artinya **simpanan sementara**. Data yang sudah pernah diambil disimpan supaya pindah halaman lalu kembali tidak menembak API lagi. Bedanya dengan store: cache tahu **umur** isinya, dan tahu kapan isinya perlu diperbarui.',
        },
        {
          term: 'useQuery',
          meaning:
            'Hook untuk **membaca** data server. Ia mengembalikan objek berisi `data`, `isPending`, `isError`, dan seterusnya. Kamu tidak memanggilnya untuk "mengambil data sekali" — kamu mendeklarasikan "komponen ini butuh data ini", dan library yang mengurus kapan mengambilnya.',
        },
        {
          term: 'queryKey',
          meaning:
            'Array yang menjadi **identitas** sebuah entri cache. Aturan tunggal yang mencegah hampir semua bug cache: **kalau sebuah nilai dipakai di `queryFn`, ia harus ada di `queryKey`.** Kalau tidak, kamu akan menampilkan data milik parameter lain.',
        },
        {
          term: 'queryFn',
          meaning:
            'Singkatan *query function*. Fungsi yang benar-benar mengambil datanya, biasanya memanggil `fetch`. Ia harus **melempar error** saat gagal — dan itu tidak otomatis, karena `fetch` tidak melempar apa pun untuk status 4xx/5xx.',
        },
        {
          term: 'isPending',
          meaning:
            'Bernilai `true` selama belum ada data sama sekali di cache untuk key ini. Memeriksanya lebih dulu bukan cuma soal tampilan: setelah `isPending` dan `isError` ditangani, TypeScript tahu `data` pasti ada — tanpa `!` dan tanpa optional chaining.',
        },
        {
          term: 'staleTime',
          meaning:
            'Berapa lama data dianggap **masih segar**. Selama itu tidak ada pengambilan ulang otomatis. Defaultnya `0` alias langsung basi, dan itu agresif serta sering mengagetkan. Untuk data yang jarang berubah, naikkan ke beberapa menit.',
        },
        {
          term: 'gcTime',
          meaning:
            'Singkatan *garbage collection time*. Berapa lama entri cache disimpan **setelah tidak ada komponen yang memakainya**, sebelum dibuang dari memori. Sering tertukar dengan `staleTime`: `staleTime` soal kapan **diambil ulang**, `gcTime` soal kapan **dihapus**.',
        },
        {
          term: 'refetch',
          meaning:
            'Mengambil ulang data yang sudah pernah diambil. TanStack Query memicunya sendiri pada beberapa peristiwa: window kembali difokuskan, koneksi pulih, komponen dipasang ulang, atau `queryKey` berubah.',
        },
        {
          term: 'mutation (mutasi)',
          meaning:
            'Operasi yang **mengubah** data di server — tambah, ubah, hapus. Ditangani `useMutation`, bukan `useQuery`. Setelah mutasi berhasil, data terkait harus diinvalidasi supaya daftar yang tampil ikut segar.',
        },
      ),

      h2('Yang sebenarnya kamu tulis ulang tanpa sadar'),
      p(
        'Setiap kali data server disimpan di `useState` + `useEffect`, ini daftar yang jadi tanggunganmu:',
      ),
      ul(
        'Cache — supaya pindah halaman lalu kembali tidak menembak API lagi',
        'Deduplikasi — dua komponen yang butuh data sama tidak boleh mengirim dua permintaan',
        'Staleness — kapan data dianggap perlu diambil ulang',
        'Refetch — saat window kembali fokus, saat koneksi pulih, saat argumennya berubah',
        'Pembatalan — respons lama yang datang terlambat tidak boleh menimpa yang baru (race condition)',
        'Status `loading` / `error` / `success` per permintaan',
        'Invalidasi setelah mutasi — daftar harus segar setelah sebuah item ditambah',
      ),
      callout(
        'danger',
        'Race condition adalah bug paling sering di pola manual',
        'Ketik "a" lalu cepat ketik "ab". Permintaan untuk "a" berangkat duluan tapi bisa **tiba belakangan**, lalu menimpa hasil "ab". Layarmu menampilkan hasil untuk kata kunci yang sudah tidak diketik lagi. Ini nyaris tidak pernah muncul di localhost yang cepat, dan muncul terus di jaringan pengguna sungguhan.',
      ),

      h2('`useQuery`'),
      code(
        'tsx',
        `
        import { useQuery } from '@tanstack/react-query';

        async function ambilProduk(): Promise<Produk[]> {
          const res = await fetch('/api/produk');
          // fetch TIDAK melempar error untuk status 4xx/5xx — kamu harus mengeceknya sendiri.
          if (!res.ok) throw new Error('Gagal memuat produk');
          return res.json();
        }

        export function DaftarProduk() {
          const { data, isPending, isError, error } = useQuery({
            queryKey: ['produk'],
            queryFn: ambilProduk,
          });

          if (isPending) return <SkeletonDaftar />;
          if (isError) return <PesanGagal pesan={error.message} onCoba={() => refetch()} />;

          return (
            <ul>
              {data.map((p) => (
                <li key={p.id}>{p.nama}</li>
              ))}
            </ul>
          );
        }
        `,
      ),
      p(
        'Perhatikan urutan pengecekannya. Setelah `isPending` dan `isError` ditangani lebih dulu, TypeScript tahu `data` pasti ada di baris terakhir — tanpa `!` dan tanpa optional chaining.',
      ),

      h2('Query key adalah identitas cache'),
      p(
        'Query key menentukan entri cache mana yang dipakai. Semua nilai yang memengaruhi hasil **harus** masuk ke dalamnya — kalau tidak, kamu akan menampilkan data milik parameter lain.',
      ),
      code(
        'ts',
        `
        // Daftar semua produk
        useQuery({ queryKey: ['produk'], queryFn: ambilProduk });

        // Satu produk — id masuk ke key
        useQuery({ queryKey: ['produk', id], queryFn: () => ambilProduk(id) });

        // Berfilter — SEMUA argumen masuk ke key
        useQuery({
          queryKey: ['produk', { kategori, urutan, halaman }],
          queryFn: () => ambilProduk({ kategori, urutan, halaman }),
        });
        `,
      ),
      p(
        "Ketiga contoh menunjukkan satu pola yang meningkat kerumitannya, yaitu key berupa **array** dengan tiap elemen menyempitkan cakupan cache-nya. `['produk']` untuk daftar penuh, `['produk', id]` untuk satu produk, dan bentuk ketiga menaruh seluruh parameter dalam objek. Perhatikan kesesuaian antara `queryKey` dan `queryFn` di tiap contoh, sebab apa yang muncul di key adalah persis apa yang dipakai fungsinya. Melanggar itu menghasilkan bug yang khas. Kalau `halaman` dipakai di `queryFn` tetapi lupa dimasukkan ke key, semua halaman berbagi satu entri cache, sehingga berpindah ke halaman 2 menampilkan data halaman 1. Sisi baiknya disebut di kotak berikut, sebab key yang berubah otomatis memicu pengambilan baru, kamu tidak perlu menulis `useEffect` untuk memuat ulang saat filter berganti.",
      ),
      callout(
        'tip',
        'Kalau ia dipakai di `queryFn`, ia harus ada di `queryKey`',
        'Itu satu aturan yang mencegah hampir semua bug cache. Query key juga otomatis menjadi mekanisme refetch: begitu `halaman` berubah, key-nya berubah, dan TanStack Query mengambil data baru tanpa kamu menulis `useEffect` apa pun.',
      ),

      h2('`staleTime` vs `gcTime` — dua hal yang sering tertukar'),
      table(
        ['', '`staleTime`', '`gcTime`'],
        [
          ['Mengatur', 'Kapan data dianggap **basi**', 'Kapan data **dibuang** dari memori'],
          ['Default', '`0` — langsung basi', '5 menit'],
          ['Selama itu', 'Tidak ada refetch otomatis', 'Data masih ada untuk ditampilkan instan'],
          ['Setelah lewat', 'Refetch saat ada pemicu (fokus, mount)', 'Entri cache dihapus'],
        ],
      ),
      code(
        'ts',
        `
        useQuery({
          queryKey: ['produk'],
          queryFn: ambilProduk,
          staleTime: 5 * 60 * 1000, // 5 menit dianggap segar
          gcTime: 30 * 60 * 1000,   // simpan 30 menit walau tidak dipakai
        });
        `,
      ),
      p(
        '`staleTime: 0` yang jadi default itu agresif dan sering mengagetkan. Untuk data yang jarang berubah seperti kategori, profil, dan pengaturan, naikkan ke beberapa menit. Untuk data yang harus selalu terbaru seperti stok atau harga, biarkan kecil.',
      ),

      h2('Mutasi dan invalidasi'),
      code(
        'tsx',
        `
        import { useMutation, useQueryClient } from '@tanstack/react-query';

        function TombolTambahProduk() {
          const queryClient = useQueryClient();

          const { mutate, isPending } = useMutation({
            mutationFn: (baru: ProdukBaru) =>
              fetch('/api/produk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(baru),
              }).then((r) => {
                if (!r.ok) throw new Error('Gagal menyimpan');
                return r.json();
              }),

            // Setelah berhasil, tandai cache 'produk' basi -> otomatis diambil ulang.
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['produk'] });
            },
          });

          // isPending juga mencegah klik ganda.
          return (
            <button disabled={isPending} onClick={() => mutate({ nama: 'Baru' })}>
              {isPending ? 'Menyimpan…' : 'Tambah'}
            </button>
          );
        }
        `,
      ),
      p(
        "`invalidateQueries` cocok dengan **awalan** key. `{ queryKey: ['produk'] }` akan membatalkan `['produk']`, `['produk', 1]`, dan `['produk', { kategori: 'buku' }]` sekaligus. Karena itu susun key dari yang umum ke yang khusus.",
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar pesanan mengambil datanya dengan `useEffect` lalu menyimpannya di store global. Setelah dipakai, empat masalah muncul berurutan. Berpindah halaman lalu kembali menampilkan data lima menit lalu tanpa tanda apa pun. Dua komponen yang butuh data sama mengirim dua permintaan. Membuka tab lain lalu kembali tidak menyegarkan apa pun. Dan tidak ada satu tempat pun yang menangani kegagalan secara seragam.',
      ),
      p(
        'Keempatnya adalah kemampuan bawaan pustaka pengambil data. Yang dibedakan bukan cara memanggil server melainkan bahwa data server punya **sifat yang berbeda** dari state biasa.',
      ),
      table(
        ['Sifat data server', 'Yang harus diurus', 'Disediakan pustaka?'],
        [
          ['Punya salinan asli di tempat lain', 'Kapan dianggap basi', '**Ya**'],
          ['Bisa diminta beberapa komponen', 'Penggabungan permintaan yang sama', '**Ya**'],
          ['Bisa berubah tanpa kamu tahu', 'Penyegaran saat tab kembali aktif', '**Ya**'],
          ['Bisa gagal dimuat', 'Pengulangan dan penanganan gagal', '**Ya**'],
          ['Bisa sedang dimuat ulang', 'Membedakan muat pertama dari muat ulang', '**Ya**'],
        ],
        'Lima hal yang harus kamu tulis sendiri kalau memakai `useEffect` dan store.',
      ),
      code(
        'tsx',
        `
        import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

        function DaftarPesanan({ filter }: { filter: Filter }) {
          // queryKey adalah identitas data. Filter IKUT di dalamnya,
          // supaya tiap kombinasi filter punya cache sendiri.
          const { data, isPending, isError, error, isFetching } = useQuery({
            queryKey: ['pesanan', filter],
            queryFn: ({ signal }) => ambilPesanan(filter, signal),   // signal untuk pembatalan
            staleTime: 30_000,      // dianggap segar selama 30 detik
          });

          if (isPending) return <Skeleton baris={5} />;
          if (isError) return <PesanGagal galat={error} />;
          if (data.length === 0) return <Kosong adaFilter={filter.cari !== ''} />;

          // isFetching membedakan muat ulang dari muat pertama.
          return (
            <div aria-busy={isFetching}>
              <Tabel data={data} />
            </div>
          );
        }
        `,
        { filename: 'src/pesanan/DaftarPesanan.tsx' },
      ),
      p(
        'Bagian `queryKey` adalah yang paling menentukan dan paling sering salah. Ia adalah **identitas** data, bukan sekadar nama. Karena `filter` ikut di dalamnya, mengganti filter berarti kunci yang berbeda sehingga cache-nya terpisah dan permintaan barunya otomatis dikirim. Kalau `filter` lupa disertakan, mengganti filter tidak akan memicu apa pun dan data lama terus ditampilkan.',
      ),
      p(
        'Parameter `signal` yang diteruskan ke fungsi pengambil adalah pembatalan yang sudah dibahas di Bab 3 Frontend Basic. Pustaka menyediakannya secara otomatis dan membatalkannya saat kuncinya berubah atau komponennya dilepas. Meneruskannya ke `fetch` berarti permintaan yang sudah tidak relevan benar-benar dihentikan, bukan sekadar hasilnya diabaikan.',
      ),
      p(
        'Perbedaan `isPending` dan `isFetching` menutup masalah kedipan dari Bab 5 Frontend Basic. Yang pertama berarti belum ada data sama sekali sehingga skeleton pantas ditampilkan. Yang kedua berarti sedang mengambil ulang sementara data lama masih ada, dan di situ menampilkan skeleton justru membuat layar berkedip. Menandainya dengan `aria-busy` sudah cukup.',
      ),
      code(
        'tsx',
        `
        // Mengubah data: mutation, lalu tandai cache yang terpengaruh sebagai basi.
        function TombolBatalkan({ id }: { id: string }) {
          const klien = useQueryClient();

          const { mutate, isPending } = useMutation({
            mutationFn: () => batalkanPesanan(id),
            onSuccess: () => {
              // Bukan menyetel data manual, melainkan menandai basi.
              // Pustaka yang memutuskan kapan mengambil ulang.
              klien.invalidateQueries({ queryKey: ['pesanan'] });
            },
          });

          return (
            <button onClick={() => mutate()} disabled={isPending}>
              {isPending ? 'Membatalkan…' : 'Batalkan'}
            </button>
          );
        }
        `,
        { caption: 'Menandai basi, bukan menyetel data secara manual.' },
      ),
      callout(
        'warning',
        'Jangan menyalin data query ke state lain',
        'Menulis `useEffect(() => setBarang(data), [data])` mengembalikan seluruh masalah yang pustakanya selesaikan, yaitu salinan yang bisa basi dan tidak ikut disegarkan. Pakai `data` langsung dari query. Kalau kamu butuh mengubahnya untuk tampilan, hitung saat render seperti nilai turunan biasa.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        useQuery({ queryKey: ['pesanan'], queryFn: () => ambilPesanan(filter) });

        # Filter tidak ikut di queryKey.
        # Mengganti filter tidak memicu permintaan baru.
        # Data lama terus ditampilkan.
        `,
        { caption: 'Kunci tidak memuat seluruh nilai yang mempengaruhi hasilnya.' },
      ),
      p(
        'Ini kesalahan nomor satu, dan tidak ada error sama sekali. Kunci adalah identitas, sehingga seluruh nilai yang mengubah hasilnya wajib ikut di dalamnya. Aturan praktisnya, apa pun yang dipakai di dalam `queryFn` harus muncul di `queryKey`, persis seperti aturan dependensi pada `useEffect`.',
      ),
      code(
        'text',
        `
        useQuery({
          queryKey: ['pesanan', { cari, urut }],   // object literal baru tiap render
          queryFn: ...,
        });

        # Kunci berubah tiap render, sehingga permintaan dikirim terus.
        `,
        { caption: 'Kunci berisi object yang identitasnya berubah.' },
      ),
      p(
        "Sebagian pustaka membandingkan kunci secara mendalam sehingga bentuk ini aman, dan sebagian lain tidak. Yang selalu aman adalah menyusun kunci dari nilai primitif, yaitu `['pesanan', cari, urut]`. Kalau kamu memang perlu object, pastikan ia stabil lewat `useMemo`. Ini konsekuensi yang sama dengan dependensi efek dan hasil selektor yang sudah berulang di kategori ini.",
      ),
      code(
        'text',
        `
        const { data } = useQuery({ ... });
        useEffect(() => { setBarang(data); }, [data]);

        # Salinan di state lokal yang tidak ikut disegarkan.
        # Seluruh keunggulan cache hilang.
        `,
        { caption: 'Data query disalin ke state.' },
      ),
      p(
        'Ini mengembalikan seluruh masalah yang pustakanya selesaikan. Salinan di state tidak tahu apa-apa tentang kesegaran, tidak ikut disegarkan saat tab kembali aktif, dan tidak ikut diperbarui saat cache-nya ditandai basi. Aturan lint React Compiler di project ini juga menandai pola menyetel state di dalam efek seperti ini sebagai error.',
      ),
      code(
        'text',
        `
        const { data } = useQuery({ ... });
        return <div>{data.length}</div>;

        TypeError: Cannot read properties of undefined (reading 'length')
        `,
        { caption: 'Data dibaca sebelum keadaan memuat diperiksa.' },
      ),
      p(
        'Pada render pertama `data` bernilai `undefined` sebab permintaannya belum selesai. Periksa `isPending` lebih dulu, dan periksa `isError` sebelum memeriksa kekosongan. Urutannya sama dengan empat keadaan tampilan dari bab tentang state, yaitu memuat, gagal, kosong, lalu sukses. Dengan TypeScript, tipe `data` memang menyertakan `undefined` sehingga kesalahan ini ditolak sebelum dijalankan.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Mengganti filter tidak memuat data baru',
            'Filter tidak ikut di `queryKey`',
            'Sertakan seluruh nilai yang dipakai `queryFn`',
          ],
          [
            'Permintaan dikirim terus tanpa henti',
            'Kunci berisi object yang identitasnya berubah',
            'Susun kunci dari nilai primitif, atau stabilkan dengan `useMemo`',
          ],
          [
            'Data tidak ikut disegarkan',
            'Data query disalin ke state lokal',
            'Pakai `data` langsung dari query',
          ],
          [
            '`Cannot read properties of undefined`',
            'Data dibaca sebelum keadaan memuat diperiksa',
            'Periksa `isPending` dan `isError` lebih dulu',
          ],
          [
            'Layar berkedip saat filter diganti',
            '`isPending` dan `isFetching` tidak dibedakan',
            'Skeleton hanya untuk `isPending`, `aria-busy` untuk `isFetching`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pustaka pengambil data menyelesaikan banyak hal sekaligus, dan sebagian besar kesalahan berasal dari tetap menulis sendiri hal yang sudah ia sediakan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyalin data query ke state atau store',
            'Supaya bisa diubah',
            'Salinan tidak ikut disegarkan. Pakai data langsung, dan hitung turunannya saat render',
          ],
          [
            'Melupakan sebagian nilai di `queryKey`',
            'Kuncinya sudah menyebut nama datanya',
            'Kunci adalah identitas. Apa pun yang dipakai `queryFn` harus ada di sana',
          ],
          [
            'Memakai `useEffect` untuk mengambil data di samping pustaka',
            'Untuk kasus khusus saja',
            'Kasus itu kehilangan seluruh cache, pembatalan, dan penanganan gagal yang seragam',
          ],
          [
            'Tidak membedakan muat pertama dari muat ulang',
            'Keduanya sama-sama memuat',
            'Skeleton pada muat ulang membuat layar berkedip dan terasa lebih lambat',
          ],
          [
            'Menyetel data cache secara manual setelah mutation',
            'Supaya langsung terlihat',
            'Menandai basi lebih aman sebab pustaka yang memutuskan kapan mengambil ulang. Setel manual hanya untuk pembaruan optimistis',
          ],
          [
            'Memakai `staleTime` nol untuk semua query',
            'Supaya selalu segar',
            'Setiap komponen yang dipasang memicu permintaan baru. Sesuaikan dengan seberapa cepat datanya benar-benar berubah',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering dan paling merusak, sebab ia mengembalikan seluruh masalah yang pustakanya selesaikan sambil tetap membayar biayanya. Kalau kamu menemukan `useEffect` yang menyalin `data` ke state, hapus keduanya dan pakai `data` langsung. Kalau kamu butuh bentuk yang berbeda untuk tampilan, hitung saat render.',
      ),
      callout(
        'info',
        'Contoh di sub-bab ini tidak dijalankan di project ini',
        'Website ini tidak memakai TanStack Query, sehingga kode di atas ditulis mengikuti dokumentasi resminya dan tidak dieksekusi di sini. Yang **diukur sungguhan** adalah perilaku React yang mendasarinya. Di App Router, sebagian kebutuhan ini juga bisa diselesaikan Server Component tanpa pustaka tambahan, dan itu dibahas di bab Next.js.',
      ),
      references(
        {
          label: 'TanStack Query — Overview',
          href: 'https://tanstack.com/query/latest/docs/framework/react/overview',
          source: 'TanStack Query',
          note: 'Daftar resmi hal yang harus kamu tulis sendiri kalau tidak memakai alat server state.',
        },
        {
          label: 'Query Keys',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys',
          source: 'TanStack Query',
          note: 'Aturan "kalau dipakai di queryFn, ia harus ada di queryKey", beserta pencocokan awalan.',
        },
        {
          label: 'Caching — staleTime vs gcTime',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/caching',
          source: 'TanStack Query',
          note: 'Dua opsi yang paling sering tertukar, dijelaskan dengan garis waktunya.',
        },
        {
          label: 'Query Invalidation',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation',
          source: 'TanStack Query',
          note: 'Menyegarkan daftar setelah mutasi berhasil, tanpa menulis refetch manual.',
        },
      ),
    ],
  ),

  written(
    'optimistic-update',
    'Optimistic Update',
    21,
    'Menampilkan hasil sebelum server mengonfirmasi.',
    [
      p(
        'Optimistic update berarti mengubah tampilan **seolah** operasinya sudah berhasil, sebelum server menjawab. Kalau ternyata gagal, perubahannya dibatalkan. Ini yang membuat tombol suka, centang todo, dan tombol simpan terasa seketika padahal jaringannya tidak.',
      ),

      terms(
        {
          term: 'optimistic update',
          meaning:
            'Mengubah tampilan **seolah** operasinya sudah berhasil, sebelum server menjawab. "Optimis" karena kamu bertaruh permintaannya akan sukses. Ini yang membuat tombol suka, centang todo, dan tombol simpan terasa seketika padahal jaringannya tidak.',
        },
        {
          term: 'rollback',
          meaning:
            'Mengembalikan tampilan ke keadaan sebelum perubahan optimistik, ketika ternyata gagal. Tanpa rollback yang benar, kegagalan meninggalkan layar yang berbohong — pengguna yakin datanya tersimpan padahal tidak.',
        },
        {
          term: 'queryClient',
          meaning:
            'Objek pusat TanStack Query yang memegang seluruh cache. Ia yang dipakai untuk membaca (`getQueryData`), menulis (`setQueryData`), membatalkan (`cancelQueries`), dan menandai basi (`invalidateQueries`) dari luar sebuah `useQuery`.',
        },
        {
          term: 'onMutate',
          meaning:
            'Callback yang berjalan **sebelum** mutasinya dikirim. Di sinilah perubahan optimistik dilakukan. Nilai yang ia kembalikan menjadi `context` yang diterima `onError` — itulah cara snapshot lama sampai ke tempat pembatalan.',
        },
        {
          term: 'cancelQueries',
          meaning:
            'Menghentikan pengambilan data yang sedang berjalan untuk key tertentu. Sering dilewati, dan akibatnya halus: refetch yang berangkat sebelum mutasi bisa tiba **setelah** kamu mengubah cache lalu menimpanya dengan data lama — tampilan berkedip ke keadaan sebelumnya lalu benar lagi.',
        },
        {
          term: 'snapshot',
          meaning:
            'Salinan isi cache **pada saat sebelum** diubah, diambil dengan `getQueryData`. Ia disimpan hanya untuk satu keperluan: dikembalikan persis seperti semula kalau mutasinya gagal.',
        },
        {
          term: 'setQueryData',
          meaning:
            'Menulis langsung ke cache tanpa memanggil server. Inilah mekanisme yang membuat perubahan optimistik langsung terlihat. Bentuk fungsinya, yaitu `(lama) => baru`, memastikan kamu bekerja dari isi cache terkini.',
        },
        {
          term: 'onSettled',
          meaning:
            'Callback yang berjalan **apa pun hasilnya** — berhasil maupun gagal. Di sini cache diinvalidasi agar tampilan akhirnya selaras dengan kebenaran server. Perlu karena tebakan optimistikmu hampir selalu tidak lengkap: server mungkin mengisi `updatedAt` atau menghitung ulang total.',
        },
        {
          term: 'context',
          meaning:
            'Bukan React Context. Di TanStack Query, ini sekadar nilai yang dikembalikan `onMutate` dan diteruskan ke `onError`/`onSettled` — jalur pribadi untuk menitipkan snapshot antar-callback dalam satu mutasi.',
        },
      ),

      h2('Pola lengkapnya'),
      code(
        'tsx',
        `
        const queryClient = useQueryClient();

        const { mutate } = useMutation({
          mutationFn: (id: string) => fetch(\`/api/todo/\${id}/selesai\`, { method: 'POST' }),

          async onMutate(id) {
            // 1. Hentikan refetch yang sedang jalan supaya tidak menimpa perubahan optimistik.
            await queryClient.cancelQueries({ queryKey: ['todo'] });

            // 2. Simpan snapshot untuk dikembalikan kalau gagal.
            const sebelumnya = queryClient.getQueryData<Todo[]>(['todo']);

            // 3. Ubah cache sekarang juga.
            queryClient.setQueryData<Todo[]>(['todo'], (lama) =>
              lama?.map((t) => (t.id === id ? { ...t, selesai: true } : t)),
            );

            // 4. Kembalikan konteks -> diterima onError.
            return { sebelumnya };
          },

          onError(_error, _id, context) {
            // 5. Gagal: kembalikan persis seperti semula.
            if (context?.sebelumnya) {
              queryClient.setQueryData(['todo'], context.sebelumnya);
            }
          },

          onSettled() {
            // 6. Berhasil atau gagal, selaraskan lagi dengan server.
            queryClient.invalidateQueries({ queryKey: ['todo'] });
          },
        });
        `,
      ),
      p(
        'Enam langkah bernomor itu sebenarnya tiga pasang tanggung jawab. Langkah 1–3 di `onMutate` menyiapkan perubahan optimistik dengan menghentikan refetch yang sedang jalan, **menyimpan salinan keadaan sekarang**, lalu mengubah cache seolah servernya sudah setuju. Langkah 4–5 adalah jalur pembatalannya, sebab nilai yang di-`return` dari `onMutate` diteruskan ke `onError` sebagai `context`, dan di situlah snapshot tadi dipakai untuk memulihkan keadaan persis seperti semula. Langkah 6 di `onSettled` menutupnya untuk kedua hasil. Perhatikan `setQueryData` dipanggil dengan **bentuk fungsi** `(lama) => ...` dan bukan nilai langsung, sebab itu memastikan perubahannya dihitung dari isi cache terkini, aturan yang sama dengan `setState` bentuk fungsi. Dan `?.` pada `lama?.map` diperlukan karena cache bisa saja masih kosong saat mutasi dipicu.',
      ),
      callout(
        'warning',
        'Langkah 1 bukan formalitas',
        '`cancelQueries` sering dilewati, dan akibatnya halus: sebuah refetch yang sudah berangkat sebelum mutasi bisa tiba **setelah** kamu mengubah cache, lalu menimpanya dengan data lama. Tampilan berkedip kembali ke keadaan sebelumnya lalu benar lagi — bug yang sangat membingungkan untuk dilacak.',
      ),

      h2('Kenapa `onSettled` tetap perlu'),
      p(
        'Tebakan optimistikmu hampir selalu tidak lengkap. Server mungkin mengisi `updatedAt`, menghitung ulang total, atau menolak sebagian. `invalidateQueries` di `onSettled` memastikan yang akhirnya tampil adalah kebenaran server, bukan tebakan browser.',
      ),

      h2('Kapan optimistic update berbahaya'),
      table(
        ['Aman', 'Berbahaya'],
        [
          ['Suka / bookmark', 'Pembayaran dan transaksi keuangan'],
          ['Centang todo', 'Pemesanan dengan stok terbatas'],
          ['Ubah judul catatan', 'Booking kursi atau jadwal'],
          ['Tandai sudah dibaca', 'Operasi yang tidak bisa dibatalkan (kirim email)'],
        ],
      ),
      p(
        'Aturannya: optimistic update cocok kalau kegagalan itu **jarang, murah, dan bisa dibatalkan tanpa merugikan**. Untuk hal yang menyangkut uang atau sumber daya terbatas, tampilkan status "memproses" yang jujur. Memberi tahu pengguna bahwa pesanannya berhasil lalu menariknya kembali jauh lebih buruk daripada menunggu satu detik.',
      ),

      h2('Alternatif yang lebih murah: feedback sedang berjalan'),
      p(
        'Kadang kamu tidak butuh optimistic update sama sekali — cukup buat penantiannya terbaca. Tombol yang berubah jadi `disabled` dengan teks "Menyimpan…" sudah menghilangkan sebagian besar rasa lambat, dan tidak punya risiko pembatalan sama sekali.',
      ),
      callout(
        'tip',
        'Kaitan dengan aturan formulir',
        'Apa pun pilihanmu, tombol submit harus dinonaktifkan selama permintaan berjalan. Itu mencegah kiriman ganda — dan di sisi server, operasi yang penting tetap harus idempoten, karena penjagaan di sisi klien tidak pernah cukup.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tombol centang pada daftar tugas memanggil server lalu memperbarui tampilan. Di jaringan kantor terasa seketika. Di jaringan seluler, pengguna mencentang lalu menunggu delapan ratus milidetik sebelum centangnya muncul, sehingga sebagian mencentang dua kali. Setelah diberi pembaruan optimistis, muncul masalah baru, yaitu saat server menolak, centangnya tetap tercentang sebab tidak ada yang mengembalikannya.',
      ),
      p('Pembaruan optimistis punya tiga bagian, dan bagian ketiga yang paling sering hilang.'),
      code(
        'text',
        `
        Tiga bagian yang WAJIB ada:

        1. Tampilkan hasil yang diharapkan sebelum server menjawab
        2. Kirim permintaannya
        3. KEMBALIKAN keadaan kalau gagal, DAN beri tahu penggunanya

        Bagian ketiga sering hanya setengah dikerjakan, yaitu keadaannya
        dikembalikan tanpa satu pun pesan. Dari sudut pandang pengguna,
        tombolnya berkedip lalu tidak melakukan apa-apa.
        `,
        {
          caption:
            'Mengembalikan keadaan tanpa memberi tahu sama buruknya dengan tidak mengembalikan.',
        },
      ),
      code(
        'tsx',
        `
        // Dengan useOptimistic: pengembalian diurus React.
        'use client';

        function TombolCentang({ tugas, ubahAksi }: Props) {
          const [selesaiTampil, setOptimistis] = useOptimistic(
            tugas.selesai,
            (_sekarang, baru: boolean) => baru,
          );

          async function tangani() {
            setOptimistis(!tugas.selesai);
            const hasil = await ubahAksi(tugas.id, !tugas.selesai);
            // Kalau gagal, nilai optimistis DIBUANG otomatis
            // dan tampilannya kembali ke nilai sungguhan.
            if (!hasil.berhasil) tampilkanBanner(hasil.pesan);
          }

          return (
            <form action={tangani}>
              <button type="submit" aria-pressed={selesaiTampil}>
                {selesaiTampil ? 'Selesai' : 'Belum'}
              </button>
            </form>
          );
        }
        `,
        { filename: 'src/tugas/TombolCentang.tsx' },
      ),
      p(
        'Yang membedakan `useOptimistic` dari menyimpan salinan sendiri adalah pengembaliannya **otomatis**. Begitu aksinya selesai, nilai optimistisnya dibuang dan React memakai nilai sungguhan dari props. Kalau aksinya gagal, nilai sungguhan tidak berubah sehingga tampilannya kembali tanpa satu baris kode pengembalian. Yang tetap harus kamu tulis hanya pesannya.',
      ),
      code(
        'tsx',
        `
        // Dengan pustaka pengambil data: simpan keadaan lama, kembalikan kalau gagal.
        const { mutate } = useMutation({
          mutationFn: ({ id, selesai }) => ubahTugas(id, selesai),

          onMutate: async ({ id, selesai }) => {
            // Hentikan pengambilan yang sedang berjalan supaya tidak menimpa.
            await klien.cancelQueries({ queryKey: ['tugas'] });

            const sebelumnya = klien.getQueryData(['tugas']);
            klien.setQueryData(['tugas'], (lama) =>
              lama.map((t) => (t.id === id ? { ...t, selesai } : t)),
            );

            // Dikembalikan supaya bisa dipakai onError.
            return { sebelumnya };
          },

          onError: (galat, _variabel, konteks) => {
            klien.setQueryData(['tugas'], konteks.sebelumnya);   // kembalikan
            tampilkanBanner('Gagal mengubah tugas');             // DAN beri tahu
          },

          onSettled: () => {
            klien.invalidateQueries({ queryKey: ['tugas'] });    // selaraskan lagi
          },
        });
        `,
        { caption: 'Empat tahap, dan `onSettled` yang memastikan akhirnya selaras.' },
      ),
      p(
        'Baris `cancelQueries` di awal sering dilewatkan dan penting. Kalau ada pengambilan yang sedang berjalan, hasilnya bisa tiba setelah perubahan optimistis dan menimpanya dengan data lama dari server. Membatalkannya lebih dulu menutup celah itu. Ini race condition yang sama dengan yang dibahas di Bab 3 Frontend Basic, muncul dalam bentuk yang lebih halus.',
      ),
      p(
        'Tahap `onSettled` yang berjalan pada keberhasilan maupun kegagalan memastikan keadaan akhirnya selalu selaras dengan server. Tanpa itu, keberhasilan yang datanya sedikit berbeda dari dugaan optimistis akan meninggalkan tampilan yang salah. Menandai basi jauh lebih aman daripada mengandalkan tebakan optimistis sebagai kebenaran akhir.',
      ),
      callout(
        'danger',
        'Optimistis hanya untuk aksi yang hampir selalu berhasil',
        'Menampilkan berhasil lalu menariknya kembali jauh lebih membingungkan daripada menunggu sebentar. Pakai untuk centang, suka, dan hapus dari daftar. Jangan pakai untuk pembayaran, pengiriman pesanan, atau apa pun yang kegagalannya punya akibat nyata bagi pengguna.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering, dan seluruhnya hanya muncul saat servernya menolak atau saat jaringannya lambat.',
      ),
      code(
        'text',
        `
        setOptimistis(true);
        await kirim();
        # tidak ada penanganan kalau gagal

        # Server menolak. Centangnya tetap tercentang,
        # dan pengguna mengira perubahannya tersimpan.
        `,
        { caption: 'Keadaan tidak dikembalikan pada kegagalan.' },
      ),
      p(
        'Ini kegagalan paling merugikan sebab pengguna yakin perubahannya tersimpan padahal tidak. Ia baru menyadarinya saat memuat ulang halaman dan menemukan keadaan lama. Dengan `useOptimistic`, pengembaliannya otomatis. Dengan pendekatan manual, `onError` yang mengembalikannya, dan melupakannya berarti bug ini.',
      ),
      code(
        'text',
        `
        onError: (galat, v, konteks) => {
          klien.setQueryData(['tugas'], konteks.sebelumnya);
        }
        # dikembalikan, tanpa satu pun pesan

        # Centang berkedip lalu kembali. Pengguna menekan lagi.
        `,
        { caption: 'Keadaan dikembalikan tanpa memberi tahu penggunanya.' },
      ),
      p(
        'Dari sudut pandang pengguna, tombolnya berkedip lalu tidak melakukan apa-apa, dan reaksi wajarnya adalah menekan lagi. Setelah beberapa kali, ia menyimpulkan aplikasinya rusak. Pengembalian keadaan **wajib** dipasangkan dengan pesan yang menjelaskan kenapa, dan itu satu baris yang sering terlewat.',
      ),
      code(
        'text',
        `
        onMutate: ({ id, selesai }) => {
          const sebelumnya = klien.getQueryData(['tugas']);
          klien.setQueryData(['tugas'], ...);
          return { sebelumnya };
        }
        # tanpa cancelQueries

        # Pengambilan yang sedang berjalan selesai setelah perubahan optimistis
        # dan menimpanya dengan data lama dari server.
        `,
        { caption: 'Pengambilan yang sedang berjalan tidak dibatalkan.' },
      ),
      p(
        'Gejalanya berupa perubahan optimistis yang muncul lalu hilang sendiri tanpa ada kegagalan apa pun. Penyebabnya permintaan yang sudah melayang sebelum perubahan dibuat, dan hasilnya tiba belakangan lalu menimpa. Membatalkannya lebih dulu di `onMutate` menutup celah itu.',
      ),
      code(
        'text',
        `
        const [tampil, setOptimistis] = useOptimistic(nilai);
        <button onClick={() => setOptimistis(true)}>Centang</button>

        Warning: An optimistic state update occurred outside a transition or
        action. To fix, move the update to an action, or wrap with startTransition.
        `,
        { caption: 'Perubahan optimistis dipakai di luar Action atau transisi.' },
      ),
      p(
        'Nilai optimistis hanya berarti selama ada aksi yang sedang berjalan, sebab React membuangnya begitu aksinya selesai. Di luar aksi, tidak ada titik akhir yang jelas sehingga nilainya bisa tertinggal selamanya. Pakai `<form action={...}>`, atau bungkus dengan `startTransition`.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Perubahan tetap terlihat padahal server menolak',
            'Keadaan tidak dikembalikan pada kegagalan',
            'Pakai `useOptimistic`, atau kembalikan di `onError`',
          ],
          [
            'Tombol berkedip lalu tidak melakukan apa-apa',
            'Keadaan dikembalikan tanpa pesan',
            'Selalu pasangkan pengembalian dengan pesan yang menjelaskan',
          ],
          [
            'Perubahan optimistis hilang sendiri tanpa kegagalan',
            'Pengambilan yang sedang berjalan menimpanya',
            'Batalkan pengambilan lebih dulu di `onMutate`',
          ],
          [
            '`optimistic state update occurred outside a transition or action`',
            'Dipakai di luar Action',
            'Pakai `<form action={...}>` atau `startTransition`',
          ],
          [
            'Tampilan tidak selaras dengan server setelah berhasil',
            'Tidak ada penyelarasan akhir',
            'Tandai basi di `onSettled`, yang berjalan pada kedua hasil',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pembaruan optimistis membuat aplikasi terasa cepat dan sekaligus membuka kelas bug yang hanya muncul saat gagal, yaitu keadaan yang paling jarang diuji.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak menulis jalur pengembalian',
            'Servernya kan hampir selalu berhasil',
            'Saat gagal, pengguna yakin perubahannya tersimpan padahal tidak',
          ],
          [
            'Mengembalikan keadaan tanpa memberi tahu',
            'Tampilannya sudah benar lagi',
            'Pengguna melihat kedipan tanpa penjelasan dan menekan lagi',
          ],
          [
            'Memakai optimistis untuk pembayaran',
            'Supaya terasa cepat',
            'Menampilkan berhasil lalu menariknya kembali jauh lebih membingungkan daripada menunggu',
          ],
          [
            'Lupa membatalkan pengambilan yang sedang berjalan',
            'Perubahannya kan sudah dibuat',
            'Hasil lama tiba belakangan dan menimpa perubahan optimistis',
          ],
          [
            'Menganggap tebakan optimistis sebagai kebenaran akhir',
            'Servernya menerima perubahannya',
            'Server bisa mengubah nilainya, misalnya menambah stempel waktu. Selaraskan lagi setelah selesai',
          ],
          [
            'Menguji hanya jalur berhasil',
            'Itu yang biasa terjadi',
            'Seluruh bug di sub-bab ini hanya muncul saat gagal. Matikan servernya lalu coba',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah kebiasaan yang menemukan seluruh masalah di sub-bab ini dalam dua menit. Matikan server pengembangan, lalu picu aksinya. Perhatikan apakah tampilannya kembali, apakah ada pesan, dan apakah pengguna punya cara mencoba lagi. Tiga pemeriksaan itu adalah satu-satunya cara memastikan jalur pengembalian benar-benar bekerja.',
      ),
      callout(
        'info',
        'React 19 menyediakan `useOptimistic` tanpa pustaka tambahan',
        'Untuk aksi sederhana seperti centang dan suka, `useOptimistic` bersama Action sudah cukup dan pengembaliannya otomatis. Pendekatan manual lewat pustaka pengambil data lebih tepat saat kamu perlu mengubah cache yang dibaca banyak komponen sekaligus. Keduanya bisa hidup berdampingan.',
      ),
      references(
        {
          label: 'Optimistic Updates',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
          source: 'TanStack Query',
          note: 'Pola resmi `onMutate` → `onError` → `onSettled`, persis urutan yang dipakai di atas.',
        },
        {
          label: 'useMutation',
          href: 'https://tanstack.com/query/latest/docs/framework/react/reference/useMutation',
          source: 'TanStack Query',
          note: 'Seluruh callback mutasi beserta nilai `context` yang mengalir di antaranya.',
        },
        {
          label: 'QueryClient — cancelQueries & setQueryData',
          href: 'https://tanstack.com/query/latest/docs/reference/QueryClient',
          source: 'TanStack Query',
          note: 'Dua metode yang membuat perubahan optimistik tidak tertimpa refetch yang sedang jalan.',
        },
        {
          label: 'useOptimistic',
          href: 'https://react.dev/reference/react/useOptimistic',
          source: 'React',
          note: 'Alternatif bawaan React 19 untuk kasus yang lebih sederhana, tanpa cache.',
        },
      ),
    ],
  ),

  written('url-state', 'URL sebagai State', 21, 'State yang harus bisa dibagikan lewat tautan.', [
    p(
      'Ada satu kategori state yang hampir selalu ditaruh di tempat yang salah: **apa yang sedang dilihat pengguna**. Filter, urutan, kata kunci, halaman ke berapa, tab yang aktif. Semua itu disimpan di `useState`, dan akibatnya baru terasa saat pengguna menekan refresh — semuanya kembali ke awal.',
    ),

    terms(
      {
        term: 'query string',
        meaning:
          'Bagian URL setelah tanda `?`, berisi pasangan `nama=nilai` dipisah `&` — misalnya `?kategori=buku&halaman=2`. Inilah tempat state yang harus bisa dibagikan lewat tautan disimpan.',
      },
      {
        term: 'searchParams',
        meaning:
          'Nama Next.js untuk isi query string yang sudah diurai. Di Client Component ia dibaca dengan hook `useSearchParams`, sedangkan di Server Component ia datang sebagai prop halaman. Sifat pentingnya adalah **read-only**, sehingga untuk mengubahnya kamu menyalinnya dulu.',
      },
      {
        term: 'URLSearchParams',
        meaning:
          'Kelas bawaan browser untuk membaca dan menyusun query string, dengan metode `get`, `set`, `delete`, dan `toString`. Ia bukan milik Next.js — ini API web standar, jadi pengetahuannya terpakai di mana pun.',
      },
      {
        term: 'useRouter',
        meaning:
          'Hook Next.js yang memberi kamu `push` dan `replace` untuk berpindah alamat dari kode. Di App Router ia diimpor dari `next/navigation`, **bukan** `next/router` — yang terakhir milik Pages Router yang lama.',
      },
      {
        term: 'push vs replace',
        meaning:
          '`push` **menambah** entri riwayat, sehingga tombol kembali mengembalikan keadaan sebelumnya. `replace` **mengganti** entri sekarang. Aturannya: ganti filter → `push`; mengetik di kotak pencarian → `replace`, kalau tidak setiap huruf jadi satu entri riwayat.',
      },
      {
        term: 'usePathname',
        meaning:
          'Hook Next.js yang mengembalikan bagian alamat **tanpa** query string — misalnya `/produk`. Dipakai untuk menyusun ulang URL lengkap: `${pathname}?${params.toString()}`.',
      },
      {
        term: 'riwayat (history)',
        meaning:
          'Tumpukan alamat yang pernah dikunjungi, yang dijelajahi tombol maju/mundur browser. Menambahkan entri untuk hal yang tidak dilakukan pengguna secara sadar, misalnya penyesuaian URL saat muat awal, membuat tombol kembali terasa rusak.',
      },
      {
        term: 'debounce',
        meaning:
          'Menunggu jeda setelah ketikan terakhir sebelum bertindak. Di sini ia dipakai sebelum **menulis ke URL** — dan inilah satu-satunya kasus di bab ini di mana menyimpan salinan lokal itu benar: input harus responsif tiap ketikan, URL cukup menyusul.',
      },
    ),

    h2('Tanda bahwa state itu milik URL'),
    p('Tanyakan tiga hal. Kalau ada satu saja yang "ya", tempatnya di URL:'),
    ol(
      'Kalau pengguna menyalin alamat halaman dan mengirimkannya, haruskah penerimanya melihat hal yang sama?',
      'Kalau ia menekan refresh, haruskah tampilannya bertahan?',
      'Kalau ia menekan tombol kembali, haruskah ia kembali ke keadaan sebelumnya?',
    ),
    p(
      'Filter produk lolos ketiganya. Status dropdown yang sedang terbuka tidak lolos satu pun — itu memang state lokal.',
    ),

    h2('Di Next.js App Router'),
    code(
      'tsx',
      `
        'use client';

        import { usePathname, useRouter, useSearchParams } from 'next/navigation';

        export function FilterKategori() {
          const router = useRouter();
          const pathname = usePathname();
          const searchParams = useSearchParams();

          const kategori = searchParams.get('kategori') ?? 'semua';

          function ubah(nilai: string) {
            // Salin dulu — searchParams bersifat read-only.
            const params = new URLSearchParams(searchParams);

            if (nilai === 'semua') {
              params.delete('kategori');
            } else {
              params.set('kategori', nilai);
            }
            // Filter berubah -> kembali ke halaman 1, kalau tidak hasilnya membingungkan.
            params.delete('halaman');

            router.push(\`\${pathname}?\${params.toString()}\`);
          }

          return (
            <select value={kategori} onChange={(e) => ubah(e.target.value)}>
              <option value="semua">Semua</option>
              <option value="buku">Buku</option>
            </select>
          );
        }
        `,
    ),
    p(
      'Perhatikan: tidak ada `useState` sama sekali. Nilainya dibaca langsung dari URL, jadi tidak mungkin tidak sinkron. Inilah keuntungan terbesarnya — satu source of truth, bukan dua yang harus disamakan.',
    ),

    h2('`push` atau `replace`?'),
    table(
      ['Aksi', 'Metode', 'Alasan'],
      [
        [
          'Ganti filter atau halaman',
          '`router.push`',
          'Tombol kembali harus mengembalikan filter sebelumnya',
        ],
        [
          'Mengetik di kotak pencarian',
          '`router.replace`',
          'Kalau `push`, setiap huruf jadi satu entri riwayat',
        ],
        [
          'Menyesuaikan URL saat muat awal',
          '`router.replace`',
          'Jangan menambah riwayat yang tidak dibuat pengguna',
        ],
      ],
    ),

    h2('Pencarian: debounce sebelum menulis ke URL'),
    code(
      'tsx',
      `
        const [teks, setTeks] = useState(searchParams.get('q') ?? '');

        useEffect(() => {
          const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            teks ? params.set('q', teks) : params.delete('q');
            router.replace(\`\${pathname}?\${params.toString()}\`);
          }, 300);

          return () => clearTimeout(timer);
        }, [teks, pathname, router, searchParams]);
        `,
    ),
    p(
      'Ini satu-satunya kasus di mana menyimpan salinan lokal itu benar: input harus terasa responsif tiap ketikan, sementara URL cukup menyusul setelah pengguna berhenti mengetik.',
    ),

    h2('Membaca di Server Component'),
    code(
      'tsx',
      `
        // Tidak perlu 'use client' — filternya sudah ada sebelum halaman dirender.
        export default async function HalamanProduk({
          searchParams,
        }: {
          searchParams: Promise<{ kategori?: string; halaman?: string }>;
        }) {
          const { kategori, halaman } = await searchParams;
          const produk = await ambilProduk({ kategori, halaman: Number(halaman ?? 1) });

          return <DaftarProduk produk={produk} />;
        }
        `,
    ),
    callout(
      'info',
      '`searchParams` adalah Promise di Next.js 15+',
      'Sejak Next.js 15, `params` dan `searchParams` harus di-`await`. Kode lama yang membacanya langsung akan gagal type-check. Ini juga alasan komponen yang memakainya perlu `async`.',
    ),
    callout(
      'warning',
      'URL itu publik',
      'Apa pun yang kamu taruh di query string akan muncul di riwayat browser, log server, dan header `Referer` saat pengguna mengeklik tautan keluar. Jangan pernah menaruh token, id sesi, atau data pribadi di sana.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Panel admin punya filter status, rentang tanggal, kata pencarian, urutan, dan nomor halaman. Kelimanya disimpan di `useState`. Tim dukungan meminta pengguna mengirimkan tautan ke daftar yang bermasalah, dan ternyata mustahil sebab alamat halamannya selalu sama. Setelah dipindahkan ke alamat, tiga masalah lain ikut selesai tanpa satu baris kode tambahan.',
    ),
    p(
      'Alamat halaman adalah tempat penyimpanan yang sudah tersedia, sudah dipahami setiap pengguna, dan sudah terhubung dengan tombol kembali. Empat kemampuan berikut didapat sekaligus.',
    ),
    table(
      ['Kemampuan', 'Dengan `useState`', 'Dengan alamat halaman'],
      [
        ['Tautan bisa dibagikan', 'Tidak', '**Ya**'],
        ['Bertahan setelah muat ulang', 'Tidak', '**Ya**'],
        ['Tombol kembali mengembalikan keadaan', 'Tidak', '**Ya**'],
        ['Bisa dibuka di tab baru', 'Tidak', '**Ya**'],
        ['Perlu kode tambahan', 'Tidak', 'Sedikit, untuk membaca dan menulis'],
      ],
      'Empat kemampuan pertama gratis begitu nilainya pindah ke alamat.',
    ),
    code(
      'tsx',
      `
        'use client';
        import { useRouter, useSearchParams, usePathname } from 'next/navigation';

        export function PanelPesanan() {
          const params = useSearchParams();
          const router = useRouter();
          const jalur = usePathname();

          // DIBACA dari alamat, bukan disimpan. Satu sumber kebenaran.
          const status = params.get('status') ?? '';
          const urut = bacaUrut(params.get('urut'));            // divalidasi, lihat di bawah
          const halaman = Math.max(1, Number(params.get('halaman') ?? '1') || 1);

          // Kotak pencarian tetap state lokal supaya ketikan terasa seketika.
          const cariAlamat = params.get('q') ?? '';
          const [ketikan, setKetikan] = useState(cariAlamat);

          function perbarui(bagian: Record<string, string | null>, ganti = true) {
            const baru = new URLSearchParams(params);
            for (const [kunci, nilai] of Object.entries(bagian)) {
              if (nilai === null || nilai === '') baru.delete(kunci);
              else baru.set(kunci, nilai);
            }
            const kueri = baru.toString();
            // replace supaya riwayat tidak penuh untuk perubahan filter.
            router[ganti ? 'replace' : 'push'](kueri ? \`\${jalur}?\${kueri}\` : jalur, {
              scroll: false,
            });
          }

          // Alamat diperbarui setelah pengguna berhenti mengetik.
          useEffect(() => {
            if (ketikan === cariAlamat) return;
            const timer = setTimeout(
              () => perbarui({ q: ketikan || null, halaman: null }),   // reset halaman
              400,
            );
            return () => clearTimeout(timer);
          }, [ketikan, cariAlamat]);

          return (
            <>
              <input value={ketikan} onChange={(e) => setKetikan(e.currentTarget.value)} />
              <PilihStatus nilai={status} onUbah={(s) => perbarui({ status: s, halaman: null })} />
              <Hasil status={status} cari={cariAlamat} urut={urut} halaman={halaman} />
            </>
          );
        }
        `,
      { filename: 'src/admin/PanelPesanan.tsx' },
    ),
    p(
      'Kotak pencarian tetap memakai state lokal, dan itu keputusan yang disengaja. Memperbarui alamat pada tiap huruf akan memenuhi riwayat peramban sehingga tombol kembali harus ditekan dua puluh kali, dan setiap perubahan alamat memicu navigasi yang lebih mahal daripada perubahan state. Alamat diperbarui setelah pengguna berhenti mengetik, memakai debounce dari Bab 1 Frontend Basic.',
    ),
    p(
      'Baris `halaman: null` pada tiap penangan filter menutup bug yang sangat sering. Kalau pengguna berada di halaman lima lalu mengganti status, hasil status baru mungkin hanya punya satu halaman sehingga daftarnya kosong. Mereset halaman setiap kali filter berubah adalah aturan yang berlaku di hampir semua daftar berpaginasi, dan menuliskannya di satu fungsi membuatnya tidak mungkin terlewat.',
    ),
    code(
      'tsx',
      `
        // Nilai dari alamat adalah MASUKAN DARI LUAR. Validasi seperti data server.
        const URUT_SAH = ['terbaru', 'terlama', 'termahal'] as const;
        type Urut = (typeof URUT_SAH)[number];

        function bacaUrut(mentah: string | null): Urut {
          return URUT_SAH.includes(mentah as Urut) ? (mentah as Urut) : 'terbaru';
        }
        `,
      { caption: 'Siapa pun bisa mengetik apa saja di bilah alamat.' },
    ),
    p(
      'Ini penerapan aturan dari Bab 6 Frontend Basic, yaitu tipe TypeScript hilang saat build sehingga data dari luar tetap harus diperiksa saat berjalan. Alamat halaman adalah data dari luar, sama seperti respons server. Tautan lama yang beredar juga bisa memuat nilai yang sudah tidak didukung, dan tanpa validasi ia menghasilkan kelas CSS yang tidak ada atau pemanggilan API yang gagal.',
    ),
    callout(
      'warning',
      'Jangan menyimpan seluruh state di alamat',
      'Alamat untuk hal yang layak dibagikan, yaitu filter, urutan, halaman, dan tab. Bukan untuk baris mana yang sedang disorot, dialog mana yang terbuka, atau posisi gulir. Alamat yang penuh dengan hal yang tidak berarti bagi orang lain justru menyulitkan, dan tiap perubahannya memicu navigasi.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering, dan seluruhnya hanya muncul saat halaman dimuat ulang atau tautannya dibuka langsung.',
    ),
    code(
      'text',
      `
        onChange={(e) => perbarui({ q: e.target.value })}

        # Pengguna mengetik 'kaos polos'. Sepuluh entri riwayat.
        # Tombol kembali harus ditekan sepuluh kali.
        `,
      { caption: 'Alamat diperbarui pada tiap ketikan tanpa `replace`.' },
    ),
    p(
      'Setiap pemanggilan yang menambah entri riwayat membuat tombol kembali harus ditekan sekali lagi. Ada dua perbaikan yang dipakai bersama, yaitu menunda pembaruan sampai pengguna berhenti mengetik, dan memakai `replace` supaya entri yang ada digantikan. Untuk perubahan yang memang berarti navigasi, misalnya berpindah halaman, `push` justru yang tepat.',
    ),
    code(
      'text',
      `
        const halaman = Number(params.get('halaman'));
        const mulai = (halaman - 1) * 20;

        # Alamat tanpa parameter halaman: Number(null) = 0
        # mulai = -20, dan daftarnya kosong. Tidak ada error.
        `,
      { caption: '`Number(null)` bernilai nol, bukan `NaN`.' },
    ),
    p(
      "Ini jebakan coercion dari Bab 1 Frontend Basic yang muncul di tempat yang tidak diduga. Method `get` mengembalikan `null` untuk parameter yang tidak ada, dan `Number(null)` bernilai nol. Bentuk yang aman memakai `?? '1'` untuk bawaan, `|| 1` untuk menangkap `NaN`, dan `Math.max` untuk menjaga batas bawahnya.",
    ),
    code(
      'text',
      `
        const [cari, setCari] = useState(params.get('q') ?? '');

        # Pengguna menekan tombol kembali. Alamat berubah,
        # dan kotak pencarian tetap menampilkan kata lama.
        `,
      { caption: 'Nilai alamat disalin ke state.' },
    ),
    p(
      'Ini kesalahan menyalin props ke state dari bab tentang state, muncul kembali dengan alamat sebagai sumbernya. Argumen `useState` hanya dibaca sekali, sehingga perubahan alamat dari tombol kembali tidak pernah sampai. Baca langsung dari alamat sebagai sumber kebenaran, dan pakai state lokal hanya untuk ketikan yang belum sempat dikirim ke alamat.',
    ),
    code(
      'text',
      `
        # Alamat: ?urut=xyz
        <div className={\`daftar daftar-\${urut}\`} />

        # class="daftar daftar-xyz". Tidak ada gaya yang menempel.
        # Tidak ada error.
        `,
      { caption: 'Nilai dari alamat dipakai tanpa divalidasi.' },
    ),
    p(
      'Siapa pun bisa mengetik apa saja di bilah alamat, dan tautan lama bisa memuat nilai yang sudah tidak didukung. Tanpa pemeriksaan terhadap daftar nilai yang sah, akibatnya bisa berupa gaya yang hilang, pemanggilan API yang gagal, atau pada kasus terburuk nilai yang disisipkan ke tempat yang berbahaya. Perlakukan alamat sebagai masukan yang tidak dipercaya.',
    ),
    table(
      ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          'Tombol kembali harus ditekan berkali-kali',
          'Tiap ketikan menambah entri riwayat',
          'Tunda dengan debounce, dan pakai `replace`',
        ],
        [
          'Daftar kosong padahal datanya ada',
          '`Number(null)` bernilai nol, sehingga indeksnya negatif',
          'Beri bawaan dengan `??`, tangkap `NaN`, batasi dengan `Math.max`',
        ],
        [
          'Kotak pencarian tidak mengikuti tombol kembali',
          'Nilai alamat disalin ke state',
          'Baca langsung dari alamat sebagai sumber kebenaran',
        ],
        [
          'Gaya atau perilaku hilang untuk nilai tertentu',
          'Nilai dari alamat tidak divalidasi',
          'Cocokkan terhadap daftar nilai yang sah, dengan bawaan',
        ],
        [
          'Daftar kosong setelah mengganti filter',
          'Nomor halaman tidak direset',
          'Reset halaman setiap kali filter berubah',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Alamat halaman sering dilupakan sebagai tempat penyimpanan, dan saat dipakai ia sering dipakai berlebihan.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Menyimpan filter dan halaman di `useState`',
          'Itu kan state',
          'Tautan tidak bisa dibagikan, muat ulang mengosongkan pilihan, dan tombol kembali tidak bekerja',
        ],
        [
          'Memperbarui alamat pada tiap ketikan',
          'Supaya selalu sinkron',
          'Riwayat penuh dan tiap perubahan memicu navigasi. Tunda dan pakai `replace`',
        ],
        [
          'Memercayai nilai dari alamat',
          'Kita sendiri yang menulisnya',
          'Siapa pun bisa mengetik apa saja, dan tautan lama bisa memuat nilai usang',
        ],
        [
          'Menyimpan seluruh state di alamat',
          'Supaya semuanya bisa dibagikan',
          'Alamat penuh hal yang tidak berarti bagi orang lain, dan tiap perubahan memicu navigasi',
        ],
        [
          'Melupakan reset halaman saat filter berubah',
          'Halamannya kan tidak disentuh',
          'Hasil filter baru bisa lebih pendek, dan pengguna melihat daftar kosong',
        ],
        [
          'Menguji hanya dengan mengklik, tidak dengan memuat ulang',
          'Alurnya kan sama',
          'Seluruh masalah di sub-bab ini hanya muncul saat halaman dimuat ulang atau tautannya dibuka langsung',
        ],
      ],
    ),
    p(
      'Baris terakhir adalah kebiasaan yang menemukan sebagian besar masalah di sub-bab ini dalam satu menit. Setelah menyetel filter, salin alamatnya lalu buka di tab baru. Kalau halamannya tidak menampilkan keadaan yang sama, ada nilai yang seharusnya berada di alamat tapi tersimpan di state. Uji juga tombol kembali setelah beberapa perubahan.',
    ),
    callout(
      'info',
      'Ada pustaka yang menyederhanakan pembacaan dan penulisan ini',
      'Pustaka seperti nuqs menyediakan hook yang membaca dan menulis parameter alamat dengan tipe yang benar, termasuk validasi dan nilai bawaan. Untuk panel dengan lima filter, ia menghemat banyak baris. Yang penting dipahami lebih dulu adalah bentuk manualnya, sebab seluruh jebakan di sub-bab ini tetap berlaku di balik pustaka mana pun.',
    ),
    references(
      {
        label: 'useSearchParams',
        href: 'https://nextjs.org/docs/app/api-reference/functions/use-search-params',
        source: 'Next.js',
        note: 'Membaca query string di Client Component, beserta sifat read-only-nya.',
      },
      {
        label: 'searchParams pada page',
        href: 'https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional',
        source: 'Next.js',
        note: 'Bentuk Promise sejak Next.js 15 yang harus di-`await` di Server Component.',
      },
      {
        label: 'useRouter — push & replace',
        href: 'https://nextjs.org/docs/app/api-reference/functions/use-router',
        source: 'Next.js',
        note: 'Dua metode navigasi dan pengaruhnya terhadap riwayat browser.',
      },
      {
        label: 'URLSearchParams',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
        source: 'MDN Web Docs',
        note: 'API web standar yang dipakai menyusun ulang query string — bukan milik Next.js.',
      },
    ),
  ]),

  written(
    'kriteria-memilih',
    'Kriteria Memilih & Anti-pattern',
    19,
    'Cara memutuskan tanpa mengikuti tren.',
    [
      p(
        'Pertanyaan "library state management mana yang terbaik" tidak punya jawaban, karena ia melewatkan langkah sebelumnya: menentukan kategori. Sub-bab ini merangkum keputusannya menjadi alur yang bisa kamu jalankan tanpa harus mengikuti perdebatan siapa pun.',
      ),

      terms(
        {
          term: 'anti-pattern (anti-pattern)',
          meaning:
            'Solusi yang **tampak** masuk akal dan sering dipakai, tapi konsisten menghasilkan masalah. Bedanya dengan sekadar "kode jelek": anti-pattern punya daya tarik — ada alasan orang terus memilihnya, dan itulah kenapa ia perlu dinamai.',
        },
        {
          term: 'alur keputusan',
          meaning:
            'Urutan pertanyaan yang dijawab satu per satu sampai berhenti di satu jawaban. Nilainya, ia menggantikan "library mana yang terbaik" yang merupakan pertanyaan tanpa jawaban, dengan rangkaian pertanyaan yang masing-masing punya jawaban pasti.',
        },
        {
          term: 'SWR',
          meaning:
            'Library server state buatan Vercel, alternatif TanStack Query. Namanya singkatan **stale-while-revalidate** — "tampilkan yang basi sambil memvalidasi ulang", strategi cache yang juga ada di standar HTTP.',
        },
        {
          term: 'RTK Query',
          meaning:
            'Bagian Redux Toolkit yang menangani server state. Dipakai kalau project-mu **sudah** memakai Redux — bukan alasan untuk mulai memakai Redux. Fungsinya sejajar dengan TanStack Query.',
        },
        {
          term: '`useEffect` penyalin',
          meaning:
            'Anti-pattern paling halus di daftar ini adalah Effect yang tugasnya cuma menyalin props ke state. Akibatnya ada dua, yaitu **dua source of truth** untuk satu nilai, dan satu render terbuang dengan nilai lama setiap kali props berubah, yang terlihat sebagai flicker.',
        },
        {
          term: 'state global',
          meaning:
            'State yang bisa dibaca komponen mana pun. Godaannya besar ("biar gampang"), biayanya tidak kelihatan di awal: semua re-render jadi saling terkait, dan menjawab "kenapa komponen ini render" berubah dari mudah jadi penyelidikan.',
        },
        {
          term: 'action trail',
          meaning:
            'Catatan berurutan setiap perubahan state beserta pemicunya. Ini keunggulan Redux yang paling nyata dan paling sering diabaikan — ia berharga di aplikasi finansial, dasbor operasional, atau tim besar yang perlu menelusuri "kenapa nilainya jadi begini".',
        },
        {
          term: 'turunkan sedekat mungkin',
          meaning:
            'Kebalikan dari mengangkat state. Aturan penutup bab ini: simpan state **serendah mungkin** di pohon, sedekat mungkin dengan yang membacanya. Global adalah pilihan terakhir, bukan titik awal.',
        },
      ),

      h2('Alur keputusan'),
      steps(
        {
          title: 'Apakah source of truth-nya server?',
          body: 'Kalau ya, berhenti di sini. Pakai TanStack Query (atau SWR / RTK Query). Jangan lanjut ke pertanyaan berikutnya — data server bukan urusan store global.',
        },
        {
          title: 'Apakah ia harus bisa dibagikan lewat tautan atau bertahan saat refresh?',
          body: 'Kalau ya, tempatnya di URL lewat `searchParams`.',
        },
        {
          title: 'Apakah ia bisa dihitung dari state lain?',
          body: 'Kalau ya, ia bukan state. Hitung saat render, jangan simpan.',
        },
        {
          title: 'Berapa komponen yang membacanya?',
          body: 'Satu komponen dan anak-anaknya -> `useState` di sana. Dua bersaudara -> angkat ke induk terdekat.',
        },
        {
          title: 'Tersebar jauh, tapi jarang berubah?',
          body: 'Context sudah cukup. Tema, bahasa, sesi pengguna.',
        },
        {
          title: 'Tersebar jauh dan sering berubah?',
          body: 'Baru di sini library global. Zustand untuk kebanyakan kasus, Jotai kalau state-nya saling bergantung, Redux Toolkit kalau tim besar atau action trail penting.',
        },
      ),

      h2('Anti-pattern yang paling sering muncul'),
      table(
        ['Anti-pattern', 'Kenapa merugikan', 'Gantinya'],
        [
          [
            'Data server disalin ke store global',
            'Cache, dedup, refetch, dan invalidasi jadi tanggunganmu',
            'TanStack Query / RTK Query',
          ],
          [
            'Derived value disimpan sebagai state',
            'Dua source of truth yang pasti akan tidak sinkron',
            'Hitung saat render, atau derived atom',
          ],
          [
            '`useEffect` untuk menyalin props ke state',
            'Satu render ekstra, dan nilai lama sempat tampil',
            'Pakai props langsung, atau `key` untuk mereset',
          ],
          [
            'Semua state ditaruh global "biar gampang"',
            'Semua re-render jadi saling terkait, sulit dilacak',
            'Turunkan sedekat mungkin dengan pembacanya',
          ],
          [
            'Filter & paginasi di `useState`',
            'Hilang saat refresh, tidak bisa dibagikan',
            '`searchParams`',
          ],
          [
            'Dua library global sekaligus',
            'Dua model mental, dua cara debug, batasnya kabur',
            'Pilih satu untuk client state',
          ],
        ],
      ),

      h2('Anti-pattern yang paling halus: `useEffect` penyalin'),
      compare(
        {
          title: 'Salah',
          lang: 'tsx',
          code: `
          function Profil({ user }) {
            const [nama, setNama] = useState(user.nama);

            // Render dulu dengan nama lama,
            // baru diperbaiki -> ada flicker.
            useEffect(() => {
              setNama(user.nama);
            }, [user.nama]);

            return <h1>{nama}</h1>;
          }
          `,
          notes: [
            'Dua source of truth untuk satu nilai',
            'Satu render terbuang setiap kali props berubah',
          ],
        },
        {
          title: 'Benar',
          lang: 'tsx',
          code: `
          function Profil({ user }) {
            // Tidak perlu state sama sekali.
            return <h1>{user.nama}</h1>;
          }

          // Kalau memang perlu state yang bisa diedit,
          // reset dengan key — bukan dengan Effect.
          <FormProfil key={user.id} user={user} />
          `,
          notes: [
            'Satu source of truth',
            '`key` yang berubah membuat React memasang ulang komponennya',
          ],
        },
      ),
      p(
        'Pola ini disebut "paling halus" karena ia **terlihat bertanggung jawab**, sebab ada state dan ada Effect yang menjaganya tetap sinkron sehingga semuanya tampak rapi. Yang tersembunyi adalah dua biayanya. Pertama, ada dua source of truth untuk satu nilai, yaitu `user.nama` dari props dan `nama` di state, dan keduanya hanya cocok karena ada Effect yang merawatnya. Kedua, karena Effect berjalan **setelah** render, selalu ada satu render yang menampilkan nama lama bersama `user` yang baru, dan itu flicker yang singkat tetapi nyata. Kolom kanan menawarkan dua koreksi bergantung kebutuhan, sama seperti di Bab 3. Kalau nilainya cuma ditampilkan, tidak butuh state sama sekali, sedangkan kalau perlu diedit, `key` yang mereset seluruh komponen jauh lebih aman daripada Effect yang mereset field satu per satu.',
      ),
      callout(
        'danger',
        'React Compiler menolak pola ini',
        'Di project yang mengaktifkan React Compiler, termasuk website yang sedang kamu baca ini, `setState` di dalam Effect adalah **error lint** dan bukan peringatan. Itu disengaja, sebab polanya hampir selalu menandakan state yang seharusnya tidak ada. Perbaiki strukturnya, jangan matikan aturannya.',
      ),

      h2('Ukuran yang sebenarnya penting'),
      p(
        'Saat memilih, jangan bandingkan library berdasarkan popularitas atau jumlah bintang. Bandingkan berdasarkan: berapa banyak konsep baru yang harus dipelajari orang lain di timmu, seberapa mudah melacak "kenapa komponen ini re-render", dan seberapa jelas batas tanggung jawabnya terhadap data server.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim harus memutuskan alat state untuk aplikasi baru. Diskusi berjalan dua jam dan berakhir pada pustaka yang namanya paling sering disebut di internet. Enam bulan kemudian, delapan puluh persen isi store ternyata data server, dan alat yang dipilih tidak punya satu pun kemampuan cache. Diskusinya salah bukan karena kesimpulannya melainkan karena pertanyaannya, yaitu alat mana yang terbaik alih-alih jenis state apa yang kami punya.',
      ),
      p(
        'Berikut kriteria yang bisa diperiksa, bukan diperdebatkan. Urutannya penting sebab pertanyaan pertama menyingkirkan sebagian besar kandidat.',
      ),
      table(
        ['Pertanyaan', 'Kalau ya', 'Kalau tidak'],
        [
          [
            'Datanya berasal dari server?',
            '**Pustaka pengambil data.** Bukan store',
            'Lanjut ke pertanyaan berikutnya',
          ],
          ['Layak dibagikan lewat tautan?', '**Alamat halaman.** Tanpa pustaka', 'Lanjut'],
          ['Hanya satu komponen yang membaca?', '**`useState`.** Selesai', 'Lanjut'],
          ['Pembacanya bersebelahan di pohon?', '**Angkat ke induk bersama.** Selesai', 'Lanjut'],
          ['Berubahnya jarang, misalnya tema?', '**Context.** Sudah bawaan React', 'Lanjut'],
          ['Sisanya', '**Pustaka store.** Barulah di sini', '—'],
        ],
        'Pustaka store hanya muncul di baris terakhir, dan itu memang seharusnya.',
      ),
      p(
        'Kalau kamu sampai di baris terakhir, barulah membandingkan pustaka masuk akal. Tabel di bawah membandingkan yang sudah dibahas di bab ini, dan yang perlu dipegang, tidak ada yang terbaik secara mutlak. Yang ada adalah yang paling cocok untuk bentuk kebutuhanmu.',
      ),
      table(
        ['Kebutuhan', 'Pilihan yang biasanya cocok', 'Alasannya'],
        [
          [
            'Beberapa nilai global, tim kecil',
            'Zustand atau sejenisnya',
            'API kecil, sedikit yang perlu dipelajari, selektor bawaan',
          ],
          [
            'State banyak dan saling berpotongan',
            'Jotai atau sejenisnya',
            'Potongan kecil dengan langganan tepat sasaran',
          ],
          [
            'Aplikasi besar, banyak tim, aturan rumit',
            'Redux Toolkit',
            'Perkakas pengembangan, pola yang seragam, mudah diuji',
          ],
          [
            'Sebagian besar data server',
            'TanStack Query atau RTK Query',
            'Cache, kesegaran, dan penanganan gagal bawaan',
          ],
          [
            'Filter dan paginasi',
            'Alamat halaman',
            'Bisa dibagikan, bertahan, dan tanpa dependensi',
          ],
        ],
        'Sebagian besar aplikasi memakai lebih dari satu baris di tabel ini.',
      ),
      p(
        'Kalimat terakhir itu yang paling sering luput. Pilihan ini bukan satu lawan satu. Aplikasi yang sehat biasanya memakai alamat halaman untuk filter, pustaka pengambil data untuk data server, Context untuk tema, dan `useState` untuk sisanya, dengan pustaka store hanya untuk satu atau dua hal yang benar-benar global dan sering berubah. Memaksakan satu alat untuk semuanya adalah sumber sebagian besar masalah di bab ini.',
      ),
      code(
        'text',
        `
        Yang layak dipertimbangkan sebelum memilih pustaka:

        - Berapa orang yang akan menyentuh kode ini, dan berapa lama umurnya?
        - Apakah pustakanya masih dirawat aktif? Kapan rilis terakhirnya?
        - Berapa ukurannya di bundel klien?
        - Apakah ia bekerja dengan Server Component kalau kamu memakai App Router?
        - Apakah tim sudah mengenal salah satunya?

        Pertanyaan terakhir sering lebih menentukan daripada yang lain.
        Pustaka yang sudah dikenal tim biasanya menang atas yang secara
        teknis sedikit lebih baik.
        `,
        { caption: 'Kriteria teknis penting, dan bukan satu-satunya.' },
      ),
      callout(
        'tip',
        'Keputusan ini bisa diubah, dan biayanya tidak seragam',
        'Berpindah dari `useState` ke pustaka relatif murah sebab pemakaiannya terbatas. Berpindah antar-pustaka store lebih mahal sebab APInya menyebar. Berpindah dari store ke pustaka pengambil data untuk data server justru sering menghapus lebih banyak kode daripada yang ditambahkan. Kalau ragu, mulai dari yang paling sedikit menyebar.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Salah memilih jarang melempar error. Empat gejala berikut adalah cara mengenali bahwa pilihannya sudah tidak cocok lagi.',
      ),
      code(
        'text',
        `
        $ grep -c "createSlice\\|create(" src/store/*.ts
        23

        # Dua puluh tiga potongan store.
        # Sembilan belas di antaranya berisi data dari server.
        `,
        { caption: 'Store dipakai untuk data yang bukan tugasnya.' },
      ),
      p(
        'Cara memeriksanya cepat, yaitu buka store lalu hitung berapa potongan yang isinya berasal dari server. Kalau lebih dari separuh, kamu sedang menulis ulang pustaka pengambil data sepotong demi sepotong, dengan lebih sedikit pengujian. Memindahkannya biasanya justru **menghapus** kode, sebab cache dan penyegaran yang ditulis tangan ikut hilang.',
      ),
      code(
        'text',
        `
        # Diukur dengan React 19: satu nilai berubah di Context.
        ctx-A render
        ctx-B render (hanya baca b)

        # Halaman terasa berat setiap kali keranjang berubah.
        `,
        { caption: 'Diukur sungguhan. Context dipakai untuk state yang sering berubah.' },
      ),
      p(
        'Ini gejala yang paling jelas bahwa Context sudah melewati batasnya. Cara memastikannya adalah menyalakan Highlight updates di React DevTools, lalu memicu perubahan. Kalau seluruh halaman berkedip untuk perubahan yang hanya relevan bagi satu bagian, pemilihan bagian memang dibutuhkan dan Context tidak menyediakannya.',
      ),
      code(
        'text',
        `
        # Pengguna melaporkan: "tautan yang saya kirim tidak menampilkan
        # daftar yang sama".

        # Filter disimpan di store, bukan di alamat.
        `,
        { caption: 'Nilai yang layak dibagikan disimpan di tempat yang tidak bisa dibagikan.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah kegunaannya. Gejala lain dari penyebab yang sama, yaitu memuat ulang halaman mengembalikan filter ke bawaan dan tombol kembali tidak bekerja. Ketiganya selesai sekaligus dengan memindahkan nilainya ke parameter alamat, dan itu justru mengurangi kode di store.',
      ),
      code(
        'text',
        `
        # Orang baru bergabung. Butuh dua minggu untuk paham
        # kenapa ada empat cara menyimpan state di aplikasi yang sama.

        # useState, Context, Zustand, dan Redux semuanya dipakai.
        `,
        { caption: 'Terlalu banyak pendekatan hidup berdampingan tanpa aturan.' },
      ),
      p(
        'Memakai beberapa alat sesuai jenis state adalah hal yang benar, dan yang salah adalah memakai beberapa alat untuk **jenis yang sama** tanpa aturan. Kalau ada dua pustaka store yang sama-sama memegang state global, salah satunya adalah sisa keputusan lama yang belum diselesaikan. Tuliskan aturannya di dokumentasi project, dan selesaikan perpindahannya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Sebagian besar store berisi data server',
            'Store dipakai untuk jenis state yang bukan tugasnya',
            'Pindahkan ke pustaka pengambil data',
          ],
          [
            'Seluruh halaman berkedip untuk perubahan kecil',
            'Context dipakai untuk state yang sering berubah',
            'Pindahkan ke store dengan pemilihan bagian',
          ],
          [
            'Tautan tidak membawa keadaan yang sama',
            'Nilai yang layak dibagikan disimpan di store',
            'Pindahkan ke parameter alamat',
          ],
          [
            'Dua pustaka store hidup berdampingan',
            'Keputusan lama belum diselesaikan',
            'Pilih satu, tuliskan aturannya, selesaikan perpindahannya',
          ],
          [
            'Orang baru butuh berminggu-minggu memahami alur data',
            'Tidak ada aturan tertulis tentang apa disimpan di mana',
            'Tulis satu halaman yang memetakan jenis state ke tempatnya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memilih alat state adalah keputusan yang sering diambil sebagai soal selera, padahal ia punya kriteria yang bisa diperiksa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih pustaka sebelum memetakan jenis state',
            'Perlu diputuskan di awal',
            'Sebagian besar isinya ternyata data server yang butuh alat berbeda',
          ],
          [
            'Memilih yang namanya paling sering disebut',
            'Populer berarti teruji',
            'Populer untuk kebutuhan orang lain, belum tentu untuk kebutuhanmu. Periksa kriterianya',
          ],
          [
            'Memaksakan satu alat untuk semua jenis state',
            'Supaya seragam',
            'Tiap jenis punya kebutuhan berbeda. Aplikasi yang sehat memakai beberapa alat sesuai jenisnya',
          ],
          [
            'Memakai beberapa pustaka untuk jenis yang sama',
            'Masing-masing punya kelebihan',
            'Orang baru harus mempelajari semuanya. Pilih satu per jenis, dan tuliskan aturannya',
          ],
          [
            'Menunda keputusan sampai aplikasinya besar',
            'Nanti kalau sudah perlu',
            'Memindahkan state yang tersebar jauh lebih mahal. Petakan jenisnya sejak awal, walau alatnya menyusul',
          ],
          [
            'Mengabaikan apa yang sudah dikenal tim',
            'Yang penting yang terbaik secara teknis',
            'Pustaka yang sudah dikenal biasanya menang atas yang sedikit lebih baik tapi asing bagi semua orang',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah kesalahan yang paling sering dan paling mudah dihindari. Tidak ada aturan yang mengharuskan seluruh state memakai satu alat. Aplikasi yang sehat biasanya memakai empat sekaligus, yaitu `useState` untuk lokal, alamat untuk yang dibagikan, pustaka pengambil data untuk data server, dan satu pustaka store untuk sisanya. Yang perlu seragam adalah **aturannya**, bukan alatnya.',
      ),
      callout(
        'info',
        'Tuliskan aturannya, satu halaman sudah cukup',
        'Satu berkas di dokumentasi project yang memetakan jenis state ke tempatnya menghemat berminggu-minggu bagi setiap orang baru. Isinya cukup lima baris, yaitu data server di mana, filter di mana, tema di mana, state lokal di mana, dan sisanya di mana. Tanpa itu, tiap orang memutuskan sendiri dan aplikasinya lambat laun memakai keempatnya untuk hal yang sama.',
      ),
      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Urutan pertanyaan resmi React yang menjadi kerangka alur keputusan di atas.',
        },
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Sumber untuk dua anti-pattern terhalus: derived value disimpan, dan Effect penyalin props.',
        },
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Alasan `setState` di dalam Effect menjadi error lint, bukan sekadar peringatan.',
        },
        {
          label: 'RTK Query — Comparison',
          href: 'https://redux-toolkit.js.org/rtk-query/comparison',
          source: 'Redux Toolkit',
          note: 'Perbandingan resmi RTK Query dengan TanStack Query dan SWR.',
        },
      ),
    ],
  ),

  written(
    'praktik-migrasi-state',
    'Praktik: Pindahkan state ke tempat yang benar',
    20,
    'Merapikan aplikasi yang menyimpan semuanya di satu tempat.',
    [
      p(
        'Latihan ini memakai bentuk yang akan sering kamu temui di kode nyata: satu komponen halaman yang menyimpan **semuanya** di `useState`. Kodenya bekerja, tidak ada error, dan justru itu yang membuatnya bertahan lama. Tugasmu membongkarnya menjadi empat kategori.',
      ),

      terms(
        {
          term: 'migrasi state',
          meaning:
            'Memindahkan data yang sudah ada ke tempat yang lebih tepat, tanpa mengubah apa yang dilihat pengguna. Sifat penting latihan ini: kode awalnya **bekerja** dan tidak ada error — dan justru itu yang membuatnya bertahan lama tanpa ada yang membenahi.',
        },
        {
          term: 'race condition',
          meaning:
            'Dua permintaan berangkat, dan yang berangkat duluan bisa tiba belakangan lalu menimpa hasil yang lebih baru. Di kode awal, mengganti kategori dua kali dengan cepat cukup untuk memicunya. Ia nyaris tidak pernah muncul di localhost — dan muncul terus di jaringan pengguna sungguhan.',
        },
        {
          term: 'derived value yang disimpan',
          meaning:
            'Cacat paling halus di kode awal: `totalHarga` disimpan sebagai state kedua padahal bisa dihitung dari `keranjang`. Dua source of truth seperti ini **pasti** akan tidak sinkron suatu saat — pertanyaannya kapan, bukan apakah.',
        },
        {
          term: 'persist',
          meaning:
            'Middleware Zustand yang menyimpan isi store ke `localStorage` secara otomatis, sehingga isinya bertahan antar halaman **dan** antar sesi. Ia yang menyelesaikan cacat "keranjang hilang saat pindah halaman".',
        },
        {
          term: 'skeleton',
          meaning:
            'Kerangka abu-abu berbentuk konten yang akan muncul, ditampilkan selama data belum siap. Fungsinya bukan hiasan: ia **memesan ruang** sehingga tata letak tidak melompat saat isinya tiba.',
        },
        {
          term: 'hydration (hidrasi)',
          meaning:
            'Proses React "menghidupkan" HTML yang sudah dikirim server dengan menyambungkannya ke kode di browser. Selama data dari `localStorage` belum ikut terpasang, tampilkan skeleton — kalau langsung menampilkan datanya, server dan browser berbeda dan hidrasinya gagal.',
        },
        {
          term: 'staleTime: 60_000',
          meaning:
            'Enam puluh ribu milidetik = satu menit. Garis bawah di angka (`60_000`) adalah pemisah ribuan JavaScript — murni untuk keterbacaan, tidak mengubah nilainya sedikit pun.',
        },
        {
          term: 'refactor',
          meaning:
            'Mengubah struktur kode tanpa mengubah perilakunya. Ukuran keberhasilan latihan ini bukan jumlah baris yang menyusut, melainkan bahwa **enam cacat hilang** — bukan karena ditambal, melainkan karena setiap data akhirnya berada di tempat yang memang dirancang untuknya.',
        },
      ),

      h2('Titik awal'),
      code(
        'tsx',
        `
        'use client';

        export function HalamanProduk() {
          // Server state
          const [produk, setProduk] = useState<Produk[]>([]);
          const [memuat, setMemuat] = useState(true);
          const [gagal, setGagal] = useState<string | null>(null);

          // URL state
          const [kategori, setKategori] = useState('semua');
          const [urutan, setUrutan] = useState('terbaru');
          const [halaman, setHalaman] = useState(1);

          // Client global state
          const [keranjang, setKeranjang] = useState<Item[]>([]);

          // Derived value yang malah disimpan
          const [totalHarga, setTotalHarga] = useState(0);

          // Lokal — ini satu-satunya yang sudah benar
          const [filterTerbuka, setFilterTerbuka] = useState(false);

          useEffect(() => {
            setMemuat(true);
            fetch(\`/api/produk?kategori=\${kategori}&urutan=\${urutan}&halaman=\${halaman}\`)
              .then((r) => r.json())
              .then((d) => { setProduk(d); setMemuat(false); })
              .catch((e) => { setGagal(e.message); setMemuat(false); });
          }, [kategori, urutan, halaman]);

          useEffect(() => {
            setTotalHarga(keranjang.reduce((n, i) => n + i.harga * i.jumlah, 0));
          }, [keranjang]);

          // ...
        }
        `,
      ),
      p(
        'Komponen ini **berfungsi**, dan itu penting disadari sebelum membongkarnya. Tidak ada error dan tidak ada yang jelas-jelas salah tulis, sebab ia jenis kode yang lolos review dan berjalan bertahun-tahun. Yang keliru bukan barisnya melainkan **penempatannya**, sebab tujuh `useState` di sana menampung empat kategori data yang sifatnya sangat berbeda, dan semuanya diperlakukan sama. Komentar yang sudah dituliskan di kode menandai pembagiannya. `produk`/`memuat`/`gagal` adalah data server yang butuh cache dan pembatalan, `kategori`/`urutan`/`halaman` adalah keadaan yang seharusnya bisa dibagikan lewat tautan, `keranjang` perlu bertahan melewati perpindahan halaman, sedangkan `totalHarga` sebenarnya bukan state sama sekali. Hanya `filterTerbuka` yang memang milik komponen ini. Enam cacat di bawah semuanya lahir dari satu kesalahan itu.',
      ),

      h2('Cacat yang ada di kode itu'),
      ol(
        '**Race condition.** Ganti kategori dua kali dengan cepat, dan respons pertama bisa tiba belakangan lalu menimpa yang benar.',
        '**Filter hilang saat refresh** dan tidak bisa dibagikan lewat tautan.',
        '**`totalHarga` adalah state kedua** untuk nilai yang sudah bisa dihitung — pasti akan tidak sinkron suatu saat.',
        '**Keranjang hilang** begitu pengguna pindah halaman.',
        '**Tidak ada cache.** Kembali ke kategori yang sama berarti menembak API lagi.',
        '**`setState` di dalam Effect** — ditolak React Compiler.',
      ),

      h2('Langkah refactor'),
      steps(
        {
          title: '1. Pindahkan data server ke TanStack Query',
          body: 'Hapus `produk`, `memuat`, `gagal`, dan Effect pengambil datanya. Ganti dengan satu `useQuery` yang query key-nya memuat kategori, urutan, dan halaman. Race condition dan cache selesai sekaligus.',
        },
        {
          title: '2. Pindahkan filter ke URL',
          body: 'Hapus `kategori`, `urutan`, `halaman` dari `useState`. Baca dari `useSearchParams`, tulis dengan `router.push`. Ingat mengembalikan `halaman` ke 1 setiap kali filter berubah.',
        },
        {
          title: '3. Hapus derived value',
          body: 'Hapus `totalHarga` beserta Effect-nya. Hitung saat render — atau jadikan bagian dari store keranjang sebagai fungsi, bukan sebagai state tersimpan.',
        },
        {
          title: '4. Pindahkan keranjang ke store global',
          body: 'Buat store Zustand dengan `persist`, supaya isinya bertahan antar halaman dan antar sesi. Ingat pola skeleton sampai terhidrasi kalau memakai SSR.',
        },
        {
          title: '5. Biarkan yang lokal tetap lokal',
          body: '`filterTerbuka` tidak perlu dipindah ke mana-mana. Memindahkannya ke store global justru langkah mundur.',
        },
      ),

      h2('Bentuk akhirnya'),
      code(
        'tsx',
        `
        'use client';

        export function HalamanProduk() {
          const searchParams = useSearchParams();
          const kategori = searchParams.get('kategori') ?? 'semua';
          const urutan = searchParams.get('urutan') ?? 'terbaru';
          const halaman = Number(searchParams.get('halaman') ?? 1);

          const { data, isPending, isError, error } = useQuery({
            queryKey: ['produk', { kategori, urutan, halaman }],
            queryFn: () => ambilProduk({ kategori, urutan, halaman }),
            staleTime: 60_000,
          });

          const totalHarga = useKeranjang((s) =>
            s.items.reduce((n, i) => n + i.harga * i.jumlah, 0),
          );

          const [filterTerbuka, setFilterTerbuka] = useState(false);

          if (isPending) return <SkeletonDaftar />;
          if (isError) return <PesanGagal pesan={error.message} />;

          return <DaftarProduk produk={data} total={totalHarga} />;
        }
        `,
      ),
      p(
        'Sepuluh `useState` dan dua `useEffect` menyusut menjadi satu `useState`, satu query, dan satu selector. Yang lebih penting daripada jumlah barisnya: enam cacat di daftar tadi hilang semua — bukan karena ditambal, melainkan karena setiap data akhirnya berada di tempat yang memang dirancang untuknya.',
      ),

      divider,

      checklist(
        'fi5-praktik',
        'Checklist praktik bab ini',
        'Daftar semua state di satu halamanmu, lalu beri label kategorinya masing-masing',
        'Pindahkan satu data server dari `useState` + `useEffect` ke `useQuery`',
        'Pastikan semua argumen yang dipakai `queryFn` juga ada di `queryKey`',
        'Pindahkan filter dan paginasi ke `searchParams`, dan reset halaman saat filter berubah',
        'Hapus setiap state yang sebenarnya bisa dihitung dari state lain',
        'Cari `useEffect` yang isinya hanya `setState`, lalu hilangkan penyebabnya',
        'Uji dengan jaringan dilambatkan (throttle) untuk memastikan tidak ada race condition',
        'Uji tombol kembali dan refresh — filter harus bertahan',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi punya store Redux dengan dua puluh tiga potongan, dan sembilan belas di antaranya berisi data server. Tim memutuskan memindahkan yang sembilan belas ke pustaka pengambil data. Percobaan pertama memindahkan seluruhnya dalam satu perubahan, dan aplikasinya rusak selama tiga hari sebab tidak ada satu titik pun yang bisa dijalankan.',
      ),
      p(
        'Perpindahan state yang berhasil hampir selalu bertahap, dan yang menentukan bukan teknisnya melainkan **urutan langkahnya**.',
      ),
      steps(
        {
          title: 'Petakan dulu, jangan sentuh kode',
          body: 'Buat daftar seluruh potongan store beserta jenis statenya. Data server, nilai yang layak dibagikan lewat tautan, state global sungguhan, atau state yang sebenarnya lokal. Daftar ini biasanya sudah menunjukkan bahwa sebagian besarnya bukan state global sama sekali.',
        },
        {
          title: 'Mulai dari yang paling sedikit pemakainya',
          body: 'Cari potongan yang hanya dibaca satu atau dua komponen. Itu yang paling murah dipindahkan dan paling cepat memberi keyakinan bahwa polanya bekerja. Jangan mulai dari yang dibaca dua puluh tempat.',
        },
        {
          title: 'Pindahkan satu potongan, jalankan seluruh check',
          body: 'Tulis pengganti di sebelahnya, pindahkan pemakainya, lalu hapus yang lama. Jalankan `npm run lint`, `npx tsc --noEmit`, dan test sebelum menyentuh potongan berikutnya. Tiap langkah harus menghasilkan keadaan yang bisa dijalankan.',
        },
        {
          title: 'Hapus yang lama sebelum lanjut',
          body: 'Jangan menumpuk potongan lama yang sudah tidak dipakai. Cari rujukannya dengan `grep -rn "namaPotongan" src/`, dan kalau kosong hapus berkasnya. Membiarkannya berarti orang berikutnya tidak tahu mana yang benar.',
        },
        {
          title: 'Ulangi sampai habis, lalu cabut dependensinya',
          body: 'Setelah seluruh potongan pindah, hapus pustaka lamanya dari `package.json`. Kalau masih ada satu potongan tersisa, pertanyakan apakah ia memang butuh pustaka itu atau bisa diselesaikan Context.',
        },
      ),
      code(
        'tsx',
        `
        // Langkah 3 dalam praktik: pengganti ditulis DI SEBELAH yang lama.

        // Lama, masih ada dan masih dipakai halaman lain.
        export const pilihPesanan = (s: RootState) => s.pesanan.daftar;

        // Baru, dipakai satu halaman dulu untuk menguji polanya.
        export function usePesanan(filter: Filter) {
          return useQuery({
            queryKey: ['pesanan', filter.status, filter.cari],
            queryFn: ({ signal }) => ambilPesanan(filter, signal),
            staleTime: 30_000,
          });
        }
        `,
        { caption: 'Keduanya hidup berdampingan selama perpindahan berjalan.' },
      ),
      p(
        'Menulis pengganti di sebelah yang lama terasa seperti membuat duplikat, dan itu justru yang membuat perpindahannya aman. Selama keduanya ada, tiap halaman bisa dipindahkan sendiri-sendiri dan aplikasinya tetap jalan di setiap titik. Yang menjadi utang adalah membiarkan keduanya hidup berbulan-bulan, jadi selesaikan lalu hapus yang lama.',
      ),
      p(
        'Yang perlu diwaspadai selama perpindahan adalah **dua sumber kebenaran**. Kalau satu halaman membaca dari store lama dan halaman lain dari pustaka baru, keduanya bisa menampilkan data yang berbeda. Pindahkan seluruh pembaca satu potongan sekaligus, bukan setengah-setengah, dan jangan pernah menyalin data dari yang baru ke yang lama supaya keduanya sinkron.',
      ),
      callout(
        'warning',
        'Jangan menggabungkan perpindahan dengan perbaikan bug',
        'Kalau ada yang rusak setelah perubahan, kamu perlu tahu apakah karena perpindahannya atau karena perbaikannya. Pindahkan bentuknya lebih dulu sampai seluruh check hijau, baru perbaiki bugnya sebagai perubahan berikutnya. Urutan itu juga membuat tinjauan kodenya jauh lebih mudah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering selama perpindahan, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        # Halaman A membaca dari store lama.
        # Halaman B membaca dari pustaka baru.
        # Pengguna mengubah data di B lalu berpindah ke A.

        # A menampilkan data lama. Tidak ada error.
        `,
        { caption: 'Dua sumber kebenaran hidup bersamaan.' },
      ),
      p(
        'Ini risiko terbesar dari perpindahan bertahap, dan pencegahannya satu aturan, yaitu pindahkan seluruh pembaca satu potongan sekaligus. Kalau sebuah potongan dibaca lima komponen, kelimanya pindah dalam satu perubahan. Yang boleh bertahap adalah antar-potongan, bukan di dalam satu potongan.',
      ),
      code(
        'text',
        `
        $ npm run build
        Module not found: Can't resolve './store/pesananSlice'

        # Potongan lama dihapus, dan masih ada satu berkas yang mengimpornya.
        `,
        { caption: 'Rujukan tertinggal setelah potongan lama dihapus.' },
      ),
      p(
        'Ini justru kegagalan yang diinginkan, sebab ia tertangkap saat membangun bukan saat berjalan. Cara mencegahnya lebih awal adalah mencari seluruh rujukan sebelum menghapus, dengan `grep -rn "pesananSlice" src/`. Kalau hasilnya kosong, penghapusannya aman. Melewatkan langkah itu berarti build yang gagal di akhir.',
      ),
      code(
        'text',
        `
        const { data } = usePesanan(filter);
        useEffect(() => { dispatch(setPesanan(data)); }, [data]);

        # Data dari pustaka baru disalin ke store lama supaya sinkron.
        # Seluruh keunggulan cache hilang, dan ada dua salinan.
        `,
        { caption: 'Jembatan sementara yang justru mengembalikan masalah aslinya.' },
      ),
      p(
        'Ini jalan pintas yang sering diambil supaya kode lama tidak perlu disentuh, dan ia mengembalikan seluruh masalah yang perpindahannya selesaikan. Salinan di store tidak ikut disegarkan, dan sekarang ada dua tempat yang bisa berbeda. Aturan lint React Compiler di project ini juga menandai pola menyetel state di dalam efek seperti ini sebagai error. Pindahkan pembacanya, jangan menjembatani.',
      ),
      code(
        'text',
        `
        # Perpindahan selesai. Seluruh check hijau.
        # Dua minggu kemudian: "kenapa daftar tidak menyegarkan
        # setelah saya mengubah data di tab lain?"

        # Perilaku itu ada di kode lama dan tidak ikut dipindahkan.
        `,
        { caption: 'Perilaku yang tidak tertulis di mana pun ikut hilang.' },
      ),
      p(
        'Ini risiko yang paling sulit dicegah, yaitu ada perilaku yang tidak tertulis di tipe, tidak tertulis di dokumentasi, dan hanya diketahui dari kodenya. Cara menguranginya adalah membaca potongan lama sampai habis sebelum menulis penggantinya, dan menuliskan daftar perilakunya sebagai catatan. Kalau ada test, jalankan test lama terhadap kode baru.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Dua halaman menampilkan data berbeda',
            'Satu potongan dibaca dari dua sumber',
            'Pindahkan seluruh pembaca satu potongan sekaligus',
          ],
          [
            '`Module not found` setelah menghapus',
            'Masih ada rujukan tertinggal',
            'Cari dengan `grep` sebelum menghapus',
          ],
          [
            'Cache tidak bekerja setelah pindah',
            'Data disalin dari pustaka baru ke store lama',
            'Pindahkan pembacanya, jangan menjembatani',
          ],
          [
            'Perilaku hilang tanpa disadari',
            'Ada perilaku yang tidak tertulis di mana pun',
            'Baca kode lama sampai habis, dan jalankan test lamanya',
          ],
          [
            'Aplikasi rusak berhari-hari di tengah perpindahan',
            'Seluruh potongan dipindahkan sekaligus',
            'Satu potongan per perubahan, dan jalankan check tiap kali',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini tentang mengubah kode yang sudah dipakai, dan sebagian besar kesalahan berasal dari mengubah terlalu banyak sekaligus.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memindahkan seluruh store dalam satu perubahan',
            'Sekalian selesai',
            'Aplikasinya rusak berhari-hari, dan tidak ada titik aman untuk berhenti',
          ],
          [
            'Menjembatani data baru ke store lama',
            'Supaya kode lama tidak perlu disentuh',
            'Mengembalikan seluruh masalah yang perpindahannya selesaikan, plus dua salinan',
          ],
          [
            'Memindahkan setengah pembaca satu potongan',
            'Bertahap kan lebih aman',
            'Dua sumber kebenaran yang bisa berbeda. Bertahap antar-potongan, bukan di dalamnya',
          ],
          [
            'Menghapus yang lama tanpa memeriksa rujukan',
            'Semua sudah dipindahkan',
            'Selalu ada satu yang terlewat. Cari dengan `grep` lebih dulu',
          ],
          [
            'Menggabungkan perpindahan dengan perbaikan bug',
            'Sekalian dibereskan',
            'Kalau ada yang rusak, ada dua tersangka. Pisahkan menjadi dua perubahan',
          ],
          [
            'Tidak memetakan jenis state sebelum memindahkan',
            'Tujuannya kan sudah jelas',
            'Sebagian potongan ternyata tidak butuh pustaka sama sekali, dan memindahkannya ke pustaka lain hanya memindahkan masalah',
          ],
        ],
      ),
      p(
        'Baris terakhir sering menghemat lebih banyak pekerjaan daripada seluruh langkah lainnya. Saat memetakan dua puluh tiga potongan, biasanya beberapa di antaranya ternyata hanya dibaca satu komponen dan bisa langsung menjadi `useState`, dan beberapa lagi ternyata filter yang tempatnya di alamat halaman. Keduanya dipindahkan tanpa menyentuh pustaka mana pun, dan itu pengurangan bersih.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'Jenis state menentukan alatnya, bukan sebaliknya. Data server punya kebutuhan tersendiri dan bukan state biasa. Context menyelesaikan props berantai, bukan penggambaran ulang selektif. Nilai yang layak dibagikan tempatnya di alamat halaman. Bab berikutnya membahas Next.js App Router, dan di sana sebagian kebutuhan data server diselesaikan Server Component tanpa pustaka sama sekali.',
      ),
      references(
        {
          label: 'Managing State',
          href: 'https://react.dev/learn/managing-state',
          source: 'React',
          note: 'Kerangka pengkategorian yang dipakai membongkar komponen di latihan ini.',
        },
        {
          label: 'Query Keys',
          href: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-keys',
          source: 'TanStack Query',
          note: 'Langkah 1 — memasukkan kategori, urutan, dan halaman ke query key sekaligus menyelesaikan race condition.',
        },
        {
          label: 'useSearchParams',
          href: 'https://nextjs.org/docs/app/api-reference/functions/use-search-params',
          source: 'Next.js',
          note: 'Langkah 2 — memindahkan filter dan paginasi dari `useState` ke URL.',
        },
        {
          label: 'persist middleware',
          href: 'https://zustand.docs.pmnd.rs/integrations/persisting-store-data',
          source: 'Zustand',
          note: 'Langkah 4 — membuat isi keranjang bertahan antar halaman dan antar sesi.',
        },
      ),
    ],
  ),
];
