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
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Intermediate — Chapter 2, all eleven lessons.
 *
 * Written against React 19.2. Deliberately leans on Frontend Basic: `map`/`key`, closures,
 * immutability, and the DOM work from chapter 4 all reappear here with their names attached.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-react',
    'Kenapa React: masalah apa yang sebenarnya dipecahkan',
    20,
    'Melihat React sebagai jawaban atas kode DOM manual yang kamu tulis sendiri di Frontend Basic.',
    [
      p(
        'Di Bab 4 Frontend Basic kamu membangun To-Do List dengan DOM murni. Ia bekerja. Bab ini menjelaskan kenapa pendekatan itu berhenti bekerja saat aplikasi membesar — memakai kodemu sendiri sebagai bukti.',
      ),

      terms(
        {
          term: 'React',
          meaning:
            'Library untuk membangun tampilan yang **menghitung ulang seluruh gambaran** setiap kali datanya berubah, lalu menerapkan perbedaannya ke layar. Namanya sendiri menjelaskan gagasannya: tampilan **bereaksi** terhadap data. Bukan framework lengkap — routing, pengambilan data, dan lainnya datang dari luar.',
        },
        {
          term: 'sinkronisasi manual',
          meaning:
            'Masalah utama yang dipecahkan React, dan kamu sudah merasakannya sendiri di Bab 4 Frontend Basic. Setiap tempat baru yang menampilkan sepotong data menambah satu pembaruan yang **harus diingat**. Satu yang terlewat menghasilkan tampilan yang tidak cocok dengan datanya — bug yang sangat sulit dilacak justru karena **datanya benar**.',
        },
        {
          term: 'UI = f(state)',
          meaning:
            'Rumus yang merangkum seluruh React, yaitu **tampilan adalah hasil perhitungan dari keadaan**. Kamu tidak lagi memerintahkan "ubah teks ini, aktifkan tombol itu", melainkan menulis "kalau keadaannya begini, tampilannya begini", lalu React yang mengurus sisanya.',
        },
        {
          term: 'state',
          meaning:
            'Terjemahannya **keadaan**. Data yang bisa berubah dan menentukan tampilan saat ini. Perubahannya adalah **satu-satunya pemicu** React menggambar ulang — dan itulah sebabnya mengubah variabel biasa tidak membuat apa pun bergerak di layar.',
        },
        {
          term: 'source of truth',
          meaning:
            'Terjemahan dari *source of truth*. Tempat resmi sebuah data disimpan. Di DOM manual sering ada dua, yaitu variabel di JavaScript **dan** teks di layar, dan keduanya bisa berselisih. Di React hanya ada satu, yaitu state, dan layar selalu turunan darinya.',
        },
        {
          term: 'komponen',
          meaning:
            'Fungsi yang mengembalikan gambaran tampilan. Satuan penyusun aplikasi React, dan satuan yang bisa dipakai ulang, diuji, serta dipindahkan sendiri-sendiri.',
        },
        {
          term: 'library vs framework',
          meaning:
            'Pembedaan yang menjelaskan banyak hal: **library** kamu panggil, **framework** yang memanggil kodemu. React sengaja memilih menjadi library tampilan saja — akibatnya kamu punya kebebasan memilih sisanya, sekaligus beban harus memilihnya sendiri.',
        },
        {
          term: 'ekosistem',
          meaning:
            'Kumpulan library di sekitar React yang mengisi apa yang tidak ia sediakan: routing, pengambilan data, manajemen state, formulir. Ini kekuatan sekaligus kerumitannya — dan sebagian besar Frontend Intermediate ini justru membahas cara memilih di antaranya.',
        },
      ),

      h2('Masalah 1: sinkronisasi manual'),
      code(
        'js',
        `
        // Satu perubahan data harus diikuti beberapa pembaruan DOM
        function toggleSelesai(id) {
          daftar = daftar.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t));

          // Dan sekarang JANGAN LUPA:
          perbaruiBaris(id);          // centang dan coretan
          perbaruiRingkasan();        // "3 dari 5 selesai"
          perbaruiFilter();           // jumlah di tiap tab
          perbaruiTombolHapusSemua(); // aktif/nonaktif
        }
        `,
      ),
      p(
        'Setiap tempat baru yang menampilkan data itu menambah satu baris yang **harus diingat**. Satu yang terlewat menghasilkan tampilan yang tidak cocok dengan datanya — bug yang sangat sulit dilacak karena datanya benar.',
      ),
      code(
        'jsx',
        `
        // React: ubah data, tampilan menyusul. Tidak ada daftar yang harus diingat.
        setDaftar((d) => d.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t)));
        `,
      ),
      p(
        'Bandingkan baris ini dengan versi sebelumnya, karena **isi `map`-nya sama persis** dan yang hilang adalah keempat pemanggilan `perbarui...` di bawahnya. Itu bukan penghematan tulisan, melainkan perubahan siapa yang bertanggung jawab. Pada versi manual, kamu yang harus mengingat setiap tempat yang menampilkan data itu, dan daftar yang harus diingat tumbuh setiap kali ada bagian layar baru. Pada React, ringkasan, filter, dan tombol semuanya **dihitung ulang dari `daftar`** saat merender, jadi tidak ada yang bisa terlewat karena tidak ada yang perlu diingat. Inilah arti kalimat di komentar, bahwa kamu mengubah data lalu tampilan menyusul. Sisa bab ini pada dasarnya menjelaskan bagaimana React menepati janji itu tanpa membuat halaman jadi lambat.',
      ),

      h2('Masalah 2: membangun ulang merusak keadaan'),
      code(
        'js',
        `
        // Pola Bab 4
        wadah.replaceChildren();
        for (const t of daftar) wadah.append(buatBaris(t));

        // Setiap re-render menghapus:
        //   fokus keyboard · teks yang sedang diketik · posisi scroll · animasi berjalan
        `,
      ),
      p(
        'React menerima deskripsi tampilan yang baru, **membandingkannya** dengan yang lama, lalu hanya mengubah bagian yang benar-benar berbeda. Input yang sedang diketik tidak ikut dibuat ulang.',
      ),

      h2('Masalah 3: tidak ada satuan yang bisa dipakai ulang'),
      code(
        'js',
        `
        // Struktur, style, dan perilaku tersebar di tiga tempat berbeda
        // index.html  -> markup
        // style.css   -> tampilan
        // app.js      -> perilaku
        //
        // Memindahkan "kartu produk" ke halaman lain berarti menyalin dari tiga berkas
        // dan berharap tidak ada yang tertinggal.
        `,
      ),
      code(
        'jsx',
        `
        // Satu berkas berisi ketiganya, dan bisa dipindahkan utuh
        export function KartuProduk({ produk, onBeli }) {
          return (
            <article className="rounded-lg border border-border p-4">
              <h3>{produk.nama}</h3>
              <button onClick={() => onBeli(produk.id)}>Beli</button>
            </article>
          );
        }
        `,
      ),
      p(
        'Perhatikan ketiga hal yang tadi tersebar di tiga berkas kini berada dalam satu fungsi, dengan **strukturnya** ada di JSX, **tampilannya** di `className`, dan **perilakunya** di `onClick`. Karena semuanya menyatu, memindahkan kartu produk ini ke halaman lain berarti memindahkan satu berkas, tanpa potongan CSS yang tertinggal dan tanpa listener yang lupa dipasang. Perhatikan juga `onBeli` diterima sebagai prop alih-alih ditulis di dalam, sebab komponen ini tahu **bagaimana menampilkan** kartu produk tapi tidak tahu apa yang terjadi saat tombolnya ditekan. Justru ketidaktahuan itu yang membuatnya bisa dipakai ulang di keranjang, di halaman pencarian, maupun di daftar rekomendasi dengan perilaku yang berbeda-beda.',
      ),

      h2('Yang React TIDAK selesaikan'),
      ul(
        'Ia tidak membuat aplikasimu cepat dengan sendirinya — pembaruan yang salah tetap lambat.',
        'Ia tidak mengurus pengambilan data, routing, atau form. Semuanya library terpisah.',
        'Ia tidak menghapus kebutuhan paham DOM, CSS, dan asinkron.',
        'Ia menambah ukuran bundle dan satu lapisan yang harus dipelajari.',
      ),
      callout(
        'info',
        'Kapan React berlebihan',
        'Halaman statis, blog, dan landing page tidak membutuhkannya. Kalau tampilanmu jarang berubah setelah dimuat, HTML dan sedikit JavaScript adalah jawaban yang lebih tepat — lebih cepat, lebih sedikit yang bisa rusak.',
      ),

      h2('Tiga gagasan intinya'),
      ol(
        '**Deklaratif** — kamu menggambarkan hasil untuk sebuah keadaan; React yang mengurus perpindahannya.',
        '**Komponen** — satuan yang membawa struktur, tampilan, dan perilaku sekaligus.',
        '**Aliran data satu arah** — data turun lewat props, perubahan naik lewat callback. Itu yang membuat bug bisa ditelusuri ke sumbernya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Di Bab 4 Frontend Basic kamu menulis fungsi `sinkronkan` yang membandingkan daftar tugas dengan elemen di layar lalu mengubah yang berbeda saja. Fungsinya empat puluh baris, butuh `Map` id ke elemen, dan harus mengurus tiga hal terpisah, yaitu menghapus yang hilang, menambah yang baru, dan memperbarui yang berubah. Itu untuk satu daftar sederhana. Bayangkan halaman yang punya lima daftar sekaligus dengan filter yang saling mempengaruhi.',
      ),
      p(
        'React tidak memperkenalkan gagasan baru di sini. Ia mengambil alih pekerjaan yang persis sama, dan yang tersisa untuk kamu tulis hanya bagian yang menyatakan bentuk akhirnya.',
      ),
      compare(
        {
          title: 'Yang kamu tulis sendiri di Bab 4',
          lang: 'js',
          code: `
          const elemenTugas = new Map();

          function sinkronkan(daftar) {
            const idSekarang = new Set(daftar.map((t) => t.id));

            for (const [id, el] of elemenTugas) {
              if (!idSekarang.has(id)) {
                el.remove();
                elemenTugas.delete(id);
              }
            }

            const frag = document.createDocumentFragment();
            for (const tugas of daftar) {
              const ada = elemenTugas.get(tugas.id);
              if (!ada) {
                const li = buatBaris(tugas);
                elemenTugas.set(tugas.id, li);
                frag.append(li);
                continue;
              }
              const judulEl = ada.querySelector('.judul');
              if (judulEl.textContent !== tugas.judul) {
                judulEl.textContent = tugas.judul;
              }
              ada.classList.toggle('selesai', tugas.selesai);
            }
            if (frag.childElementCount > 0) daftarEl.append(frag);
          }
          `,
          notes: ['Empat puluh baris yang mengurus PERBEDAAN, bukan mengurus tampilan'],
        },
        {
          title: 'Yang kamu tulis dengan React',
          lang: 'tsx',
          code: `
          function DaftarTugas({ tugas }: { tugas: Tugas[] }) {
            return (
              <ul>
                {tugas.map((t) => (
                  <li key={t.id} className={t.selesai ? 'selesai' : undefined}>
                    <span className="judul">{t.judul}</span>
                  </li>
                ))}
              </ul>
            );
          }
          `,
          notes: [
            'Sepuluh baris yang mengurus BENTUK AKHIR, bukan perbedaannya',
            '`key={t.id}` adalah `Map` id ke elemen yang tadi kamu tulis sendiri',
          ],
        },
      ),
      p(
        'Perhatikan `key={t.id}` di kolom kanan, sebab ia bukan formalitas melainkan padanan langsung dari `Map` yang kamu buat sendiri. React memakainya untuk mencocokkan elemen lama dengan elemen baru, persis seperti `elemenTugas.get(tugas.id)` di kolom kiri. Karena itu memakai indeks array sebagai `key` sama saja dengan memakai posisi sebagai kunci `Map`, dan akibatnya identik, yaitu keadaan berpindah ke baris yang salah.',
      ),
      p(
        'Pemeriksaan `if (judulEl.textContent !== tugas.judul)` di kolom kiri juga punya padanan, yaitu React melakukan perbandingan yang sama sebelum menyentuh DOM. Itu sebabnya menulis ulang seluruh JSX pada tiap perubahan tidak berarti seluruh DOM dibangun ulang. Yang dibangun ulang hanya deskripsinya, dan deskripsi itu hanya object biasa seperti dibahas di Bab 6 Frontend Basic.',
      ),
      p(
        'Yang perlu jujur disebut, React bukan tanpa biaya. Ia menambah sekitar seratus kilobyte ke bundel, menambah satu lapisan yang harus dipahami saat menelusuri bug, dan mengharuskan alat pembangun. Untuk halaman yang isinya tidak pernah berubah setelah dimuat, seluruh biaya itu tidak terbayar. React menang justru saat tampilan sering berubah mengikuti data, dan semakin banyak keadaan yang saling mempengaruhi, semakin besar selisihnya.',
      ),
      callout(
        'info',
        'Nama resmi dari yang kamu tulis sendiri di Bab 4',
        'Membandingkan deskripsi lama dengan deskripsi baru lalu mengubah selisihnya saja disebut rekonsiliasi. `Map` id ke elemen disebut `key`. Object deskripsi yang belum menyentuh DOM disebut elemen React. Ketiganya sudah kamu tulis dengan tangan, dan yang berubah di sini hanya namanya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 sungguhan, dan seluruhnya muncul pada hari pertama memakai React.',
      ),
      code(
        'text',
        `
        <ul>{tugas.map((t) => <li>{t.judul}</li>)}</ul>

        Warning: Each child in a list should have a unique "key" prop.
        Check the top-level render call using <li>.
        `,
        { caption: 'Peringatan, bukan error, sehingga halamannya tetap terlihat benar.' },
      ),
      p(
        'Karena hanya peringatan, ia sangat mudah diabaikan dan akibatnya baru muncul saat daftarnya berubah. Ingat padanannya di Bab 4, yaitu tanpa `Map` id ke elemen, kamu terpaksa mencocokkan berdasarkan posisi. Menghapus baris pertama membuat seluruh baris di bawahnya dianggap berubah isinya, dan isian kotak input di dalamnya ikut berpindah. Perlakukan peringatan ini sebagai kesalahan yang wajib diperbaiki.',
      ),
      code(
        'text',
        `
        // Dipanggil di luar komponen
        useState(0);

        Warning: Invalid hook call. Hooks can only be called inside of the
        body of a function component.

        TypeError: Cannot read properties of null (reading 'useState')
        `,
        { caption: 'Peringatan menjelaskan, dan error yang menyertainya menghentikan.' },
      ),
      p(
        'Dua pesan muncul bersamaan, dan yang menjelaskan adalah yang pertama. Pesan kedua hanya akibatnya, yaitu React tidak punya komponen yang sedang dirender sehingga penampung hooknya `null`. Selain memanggil hook di luar komponen, penyebab lain yang sering adalah ada dua salinan React di `node_modules`, dan peringatan aslinya memang menyebutkan kemungkinan itu.',
      ),
      code(
        'text',
        `
        <div style="color: red" />

        Error: The \`style\` prop expects a mapping from style properties to
        values, not a string. For example, style={{marginRight: spacing + 'em'}}
        when using JSX.
        `,
        { caption: 'Pesan yang bahkan menyertakan contoh perbaikannya.' },
      ),
      p(
        'Ini termasuk pesan error React yang paling menolong, sebab ia menyebutkan bentuk yang benar lengkap dengan contoh. Sudah dibahas di Bab 6 Frontend Basic dari sisi tipe, dan di sini ia muncul sebagai error saat berjalan pada project tanpa TypeScript. Perhatikan React melempar alih-alih mengabaikan, dan itu pilihan yang baik sebab kesalahan ini selalu berarti bug.',
      ),
      code(
        'text',
        `
        <img alt="x">teks</img>

        Error: img is a self-closing tag and must neither have \`children\`
        nor use \`dangerouslySetInnerHTML\`.
        `,
        { caption: 'Elemen yang tidak boleh punya anak menolak diberi anak.' },
      ),
      p(
        'Elemen seperti `img`, `input`, `br`, dan `hr` tidak bisa punya anak menurut HTML, dan React menegakkannya alih-alih membiarkan peramban memperbaikinya diam-diam. Kalau kamu bermaksud memberi teks pengganti untuk gambar, yang dibutuhkan atribut `alt`, bukan anak. Sikap tegas React di sini justru menghemat waktu, sebab HTML yang tidak sah biasanya menghasilkan tata letak yang aneh tanpa penjelasan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Each child in a list should have a unique "key" prop`',
            'Elemen hasil `map` tidak diberi `key`',
            'Beri `key` berisi id sungguhan, bukan indeks',
          ],
          [
            '`Invalid hook call`',
            'Hook dipanggil di luar komponen, atau ada dua salinan React',
            'Panggil di badan komponen, dan periksa `npm ls react`',
          ],
          [
            '`The \\`style\\` prop expects a mapping ... not a string`',
            'Gaya inline ditulis sebagai teks CSS',
            'Tulis sebagai object dengan nama bergaya huruf kapital di tengah',
          ],
          [
            '`img is a self-closing tag`',
            'Elemen tanpa anak diberi anak',
            'Pakai atribut yang sesuai, misalnya `alt` untuk gambar',
          ],
          [
            'Komponen tidak pernah dipanggil dan tag asing muncul',
            'Nama komponen berhuruf kecil',
            'Awali nama komponen dengan huruf besar',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hari-hari pertama memakai React hampir selalu diisi kesalahan yang berasal dari membawa kebiasaan DOM langsung. Baris di bawah adalah yang paling sering.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyentuh DOM langsung dengan `document.querySelector` di dalam komponen',
            'Itu cara yang sudah dikuasai dari Bab 4',
            'React akan menimpanya pada render berikutnya, dan keduanya berebut mengatur elemen yang sama. Ubah datanya, biarkan React yang menggambar',
          ],
          [
            'Memakai indeks array sebagai `key`',
            'Indeksnya unik dan sudah tersedia',
            'Sama dengan memakai posisi sebagai kunci pencocokan. Keadaan berpindah ke baris salah saat ada yang dihapus',
          ],
          [
            'Mengira React membuat aplikasi otomatis lebih cepat',
            'Ada virtual DOM yang katanya cepat',
            'Rekonsiliasi menambah pekerjaan, bukan mengurangi. Yang React berikan adalah kemudahan menulis, bukan kecepatan',
          ],
          [
            'Memakai React untuk halaman yang isinya tidak pernah berubah',
            'Semua project modern memakainya',
            'Seratus kilobyte dan satu lapisan tambahan untuk keuntungan nol. HTML dengan sedikit JavaScript lebih tepat',
          ],
          [
            'Menganggap komponen harus kecil sekecil mungkin',
            'Semakin kecil semakin baik',
            'Komponen yang panjang tapi kohesif lebih mudah dibaca daripada lima komponen dangkal yang harus dibuka bergantian. Pecah berdasarkan tanggung jawab',
          ],
          [
            'Belajar React tanpa memahami closure dan pantangan mutasi',
            'React punya cara sendiri',
            'Hampir seluruh kebingungan tentang state berakar di kedua hal itu. Bab 1 Frontend Basic bukan prasyarat formalitas',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering dibuat orang yang sudah mahir DOM, dan justru karena mereka mahir. Menyentuh DOM langsung dari dalam komponen menciptakan dua pihak yang sama-sama merasa berwenang mengatur elemen itu, dan yang menang bergantung pada urutan yang tidak kamu kendalikan. Aturan yang menutupnya satu kalimat, yaitu ubah datanya dan biarkan React yang menggambar.',
      ),
      callout(
        'tip',
        'Cara membaca ulang Bab 4 Frontend Basic sekarang',
        'Buka kembali praktik todo di sana dan cocokkan tiap bagiannya dengan padanannya di React. `Map` id ke elemen menjadi `key`. Fungsi `sinkronkan` menjadi rekonsiliasi. Pemeriksaan sebelum menulis menjadi perbandingan internal React. Lima menit mencocokkan itu membuat sisa kategori ini terasa seperti penamaan, bukan seperti hal baru.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Sinkronisasi manual antara data dan DOM adalah sumber bug yang tumbuh seiring aplikasi.',
        'React membandingkan deskripsi lama dan baru, sehingga keadaan DOM tidak ikut hancur.',
        'Komponen menyatukan struktur, tampilan, dan perilaku dalam satu satuan.',
        'React tidak mengurus data, routing, maupun form — semuanya terpisah.',
      ),
      references(
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Pergeseran dari sinkronisasi manual ke tampilan sebagai hasil perhitungan dari state.',
        },
        {
          label: 'Describing the UI',
          href: 'https://react.dev/learn/describing-the-ui',
          source: 'React',
          note: 'Titik masuk resmi React — komponen sebagai satuan penyusun aplikasi.',
        },
        {
          label: 'Reacting to Input with State',
          href: 'https://react.dev/learn/reacting-to-input-with-state',
          source: 'React',
          note: 'Perbandingan langsung pendekatan imperatif dan deklaratif memakai contoh formulir.',
        },
        {
          label: 'React — Home',
          href: 'https://react.dev/',
          source: 'React',
          note: 'Menegaskan cakupan React sebagai library tampilan, bukan framework lengkap.',
        },
      ),
    ],
  ),

  written(
    'setup-project',
    'Menyiapkan Project: Vite vs Next.js',
    20,
    'Dua titik awal dan konsekuensinya — dipilih dari kebutuhan, bukan dari popularitas.',
    [
      terms(
        {
          term: 'Vite',
          meaning:
            'Dibaca "vit" (dari bahasa Prancis, artinya *cepat*). Alat build yang menjalankan server pengembangan hampir seketika dan hanya memproses berkas yang benar-benar kamu buka. Untuk **belajar React murni**, ini pilihan yang tepat: konsep yang harus dipelajari sedikit, dan tidak ada lapisan server yang mengaburkan apa yang sebenarnya terjadi.',
        },
        {
          term: 'Next.js',
          meaning:
            'Framework React yang menambahkan routing, rendering di server, dan optimasi bawaan. Kuat, tapi membawa **banyak konsep sekaligus** — Server Component, pemetaan rute lewat folder, strategi caching. Pilih ini kalau kamu memang butuh SEO atau kode server, bukan karena ia paling sering disebut orang.',
        },
        {
          term: 'SPA',
          meaning:
            'Singkatan *Single Page Application*. Satu dokumen HTML dimuat sekali, lalu isinya diganti dari JavaScript tanpa berpindah halaman. Ini yang dihasilkan Vite secara bawaan.',
        },
        {
          term: 'SSR',
          meaning:
            'Singkatan *Server-Side Rendering*, terjemahannya **penggambaran di sisi server**. HTML dibuat di server lalu dikirim jadi ke browser. Manfaatnya dua: mesin pencari langsung melihat isinya, dan pengguna melihat sesuatu lebih cepat tanpa menunggu JavaScript diunduh.',
        },
        {
          term: 'CSR',
          meaning:
            'Singkatan *Client-Side Rendering* — HTML awalnya nyaris kosong, dan seluruh isi digambar JavaScript di browser. Konsekuensinya: mesin pencari dan pratinjau tautan media sosial sering hanya melihat halaman kosong.',
        },
        {
          term: 'SEO',
          meaning:
            'Singkatan *Search Engine Optimization*. Disebut di sini karena ia **satu-satunya alasan teknis paling kuat** untuk memilih Next.js di awal. Kalau aplikasimu berada di balik login, isinya memang tidak untuk dicari — dan SSR-nya jadi tidak terpakai.',
        },
        {
          term: 'HMR',
          meaning:
            'Singkatan *Hot Module Replacement*, terjemahannya **penggantian modul panas**. Kemampuan mengganti kode yang sedang berjalan **tanpa memuat ulang halaman**, sehingga state-mu tidak hilang saat menyimpan berkas. Ini yang membuat pengembangan terasa langsung.',
        },
        {
          term: 'bundler',
          meaning:
            'Alat yang menggabungkan banyak berkas modul menjadi sedikit berkas siap kirim. Vite memakai esbuild dan Rollup; Next.js memakai Turbopack. Kamu jarang menyentuhnya langsung — tapi berguna tahu siapa yang bekerja saat build terasa lambat.',
        },
        {
          term: 'boilerplate',
          meaning:
            'Terjemahannya **kode kerangka** — berkas dan konfigurasi awal yang selalu ada di project baru. Semakin banyak boilerplate, semakin banyak yang harus dipahami sebelum kamu sempat menulis baris pertama yang benar-benar milikmu.',
        },
      ),

      h2('Memilih'),
      table(
        ['Kebutuhan', 'Vite', 'Next.js'],
        [
          ['Belajar React murni', '**Ya**', 'Terlalu banyak konsep sekaligus'],
          ['Dashboard di balik login', '**Ya**', 'Boleh, tapi SSR-nya tidak terpakai'],
          ['Butuh SEO / dibagikan publik', 'Tidak', '**Ya**'],
          ['Butuh kode server', 'Tidak', '**Ya**'],
          ['Waktu mulai dev server', '**Sangat cepat**', 'Cepat'],
          ['Konsep yang harus dipelajari', 'Sedikit', 'Banyak'],
        ],
      ),
      callout(
        'tip',
        'Untuk belajar Bab 2 ini, pakai Vite',
        'Next.js membawa Server Component, routing berbasis berkas, dan strategi caching sekaligus. Mempelajari React **dan** ketiganya bersamaan membuat sulit membedakan mana yang React dan mana yang Next. Next.js dibahas tuntas di Bab 8.',
      ),

      h2('Vite'),
      code(
        'bash',
        `
        npm create vite@latest aplikasi-saya -- --template react-ts
        cd aplikasi-saya
        npm install
        npm run dev
        `,
      ),
      p(
        'Perhatikan tanda `--` sebelum `--template` di baris pertama, karena ia memisahkan argumen milik `npm` dari argumen yang diteruskan ke `create-vite`, dan melewatkannya membuat template diabaikan sehingga kamu mendapat pilihan interaktif. Template `react-ts` dipilih alih-alih `react` karena seluruh materi ini memakai TypeScript sesuai Bab 6, sebab memilih yang tanpa `-ts` berarti mengonversinya belakangan, yang sudah kamu tahu lebih mahal. Tiga baris berikutnya adalah urutan yang selalu sama untuk project Node mana pun, yaitu masuk ke foldernya, pasang dependensinya, lalu jalankan server pengembangannya. `npm run dev` menyalakan server yang memuat ulang halaman otomatis setiap kali berkas disimpan.',
      ),
      code(
        'text',
        `
        src/
        ├── main.tsx        # titik masuk — menempelkan React ke DOM
        ├── App.tsx         # komponen akar
        ├── components/     # buat sendiri
        └── index.css
        `,
      ),
      code(
        'tsx',
        `
        import { StrictMode } from 'react';
        import { createRoot } from 'react-dom/client';
        import App from './App.tsx';
        import './index.css';

        createRoot(document.getElementById('root')!).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
        `,
        { filename: 'src/main.tsx' },
      ),
      p(
        "Berkas ini adalah **satu-satunya tempat** React bertemu DOM, dan setelah ini kamu praktis tidak akan menyentuh DOM lagi sepanjang bab. `document.getElementById('root')` mengambil satu `<div>` kosong dari `index.html`, lalu `createRoot(...)` menyerahkan elemen itu ke React sebagai wilayah yang ia kelola, dan `.render(<App />)` menyuruhnya menggambar. Tanda seru pada `getElementById('root')!` adalah **non-null assertion** TypeScript yang berkata \"aku tahu ini tidak `null`\", dan di sini sah karena elemennya memang ditulis di `index.html`. Perhatikan `<App />` dibungkus `<StrictMode>`, yang tidak menghasilkan apa pun di layar melainkan menyalakan pemeriksaan tambahan selama pengembangan, dan efeknya dijelaskan di kotak berikut serta sering mengejutkan kalau tidak tahu.",
      ),
      callout(
        'warning',
        'StrictMode memanggil komponenmu dua kali — sengaja',
        'Hanya saat development. Tujuannya membongkar efek samping yang tersembunyi: kalau komponenmu rusak karena dipanggil dua kali, ia memang punya bug yang cepat atau lambat akan muncul. Jangan matikan StrictMode untuk "memperbaiki" ini — perbaiki penyebabnya.',
      ),

      h2('Struktur folder yang tidak menyusahkan nanti'),
      code(
        'text',
        `
        src/
        ├── components/
        │   ├── ui/            # primitif tanpa logika bisnis: Button, Card
        │   └── tugas/         # komponen khusus fitur
        ├── hooks/
        ├── lib/               # pure function — bisa diuji tanpa React
        ├── types/
        └── App.tsx
        `,
      ),
      p(
        'Pemisahan yang paling menentukan di sini adalah `components/ui/` dan `components/tugas/`. Isi `ui/` adalah primitif yang **tidak tahu apa-apa tentang aplikasimu**, sebab sebuah `Button` tidak peduli ia dipakai untuk menyimpan tugas atau membatalkan pesanan, sehingga bisa dipakai ulang di mana saja dan diganti tampilannya tanpa menyentuh logika. Isi `tugas/` sebaliknya memang terikat pada satu fitur. Folder `lib/` menyimpan pure function seperti modul `todo.js` dari Bab 1, dan komentarnya menyebut manfaat nyatanya, yaitu karena tidak menyentuh React sama sekali, isinya bisa diuji tanpa merender apa pun. Perhatikan struktur ini disebut "yang tidak menyusahkan nanti" alih-alih yang terbaik, dan kotak di bawahnya menjelaskan kapan ia harus ditinggalkan.',
      ),
      callout(
        'info',
        'Kelompokkan per fitur, bukan per jenis berkas',
        'Folder `components/`, `hooks/`, `utils/` yang berisi semua fitur bercampur terlihat rapi saat kecil, tapi mengerjakan satu fitur berarti membuka lima folder berbeda. Setelah aplikasi tumbuh, kelompokkan per fitur — semua yang berubah bersama, disimpan bersama.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tiga orang di tim memulai project React di hari yang sama. Yang pertama memakai perintah pembuat resmi dan langsung menulis komponen. Yang kedua menyusun konfigurasinya sendiri karena ingin memahami tiap bagiannya, dan menghabiskan dua hari untuk itu. Yang ketiga menyalin konfigurasi dari project lain yang berumur tiga tahun, dan seminggu kemudian bertemu error yang tidak bisa ia telusuri karena setengah konfigurasinya sudah usang.',
      ),
      p(
        'Yang perlu diputuskan sebelum mengetik perintah bukan alat mana yang paling canggih, melainkan tiga hal yang menentukan bentuk projectnya sepanjang umurnya.',
      ),
      table(
        ['Pertanyaan', 'Kalau jawabannya ya', 'Kalau jawabannya tidak'],
        [
          [
            'Butuh halaman yang dirender di server?',
            'Next.js atau kerangka kerja sejenis',
            'Vite dengan React saja sudah cukup',
          ],
          [
            'Butuh alamat halaman yang berbeda-beda?',
            'Kerangka kerja, atau tambahkan pustaka rute',
            'Satu halaman tanpa rute, jauh lebih sederhana',
          ],
          [
            'Butuh terbaca mesin pencari?',
            'Wajib dirender di server',
            'Aplikasi di sisi klien saja sudah cukup',
          ],
        ],
        'Ketiganya soal kebutuhan, bukan soal selera alat.',
      ),
      code(
        'bash',
        `
        # Aplikasi sisi klien saja. Paling cepat disiapkan, paling sedikit yang perlu dipahami.
        npm create vite@latest toko -- --template react-ts
        cd toko && npm install && npm run dev

        # Aplikasi dengan rute dan render di server. Ini yang dipakai website ini.
        npx create-next-app@latest toko --typescript --app --eslint
        cd toko && npm run dev
        `,
        { caption: 'Keduanya menyiapkan TypeScript, alat pembangun, dan server pengembangan.' },
      ),
      p(
        'Kata kunci `--template react-ts` dan `--typescript` bukan tambahan opsional. Menyiapkan TypeScript di awal jauh lebih murah daripada menambahkannya nanti, seperti dibahas di Bab 6 Frontend Basic. Kalau kamu memutuskan tidak memakainya, itu keputusan yang sah asal diambil sadar, bukan karena perintahnya lebih panjang.',
      ),
      code(
        'text',
        `
        Isi folder yang perlu kamu kenali, dan yang tidak perlu disentuh:

        src/                 <- seluruh kode yang kamu tulis
          main.tsx           <- titik masuk, memasang React ke satu elemen
          App.tsx            <- komponen paling atas
        public/              <- berkas yang disalin apa adanya, tanpa diproses
        index.html           <- satu-satunya HTML, berisi elemen tempat React dipasang
        vite.config.ts       <- konfigurasi alat pembangun
        tsconfig.json        <- konfigurasi TypeScript
        package.json         <- daftar dependency dan perintah
        node_modules/        <- JANGAN disentuh, dan jangan ikut di git
        dist/                <- hasil build, JANGAN ikut di git
        `,
        { caption: 'Yang paling sering salah paham adalah beda `public/` dan `src/`.' },
      ),
      p(
        'Perbedaan `public/` dan `src/` menentukan cara mengacu berkas dan sering keliru. Berkas di `public/` disalin apa adanya tanpa diproses, dan diacu dengan alamat mutlak seperti `/logo.svg`. Berkas gambar di dalam `src/` diproses alat pembangun, diberi nama berisi sidik jari isinya untuk keperluan cache, dan diacu lewat `import`. Menaruh gambar di `public/` berarti melewatkan pengoptimalan dan penanganan cache itu.',
      ),
      code(
        'tsx',
        `
        // main.tsx — titik masuk, dan satu-satunya tempat React menyentuh DOM langsung.
        import { StrictMode } from 'react';
        import { createRoot } from 'react-dom/client';
        import App from './App.tsx';
        import './index.css';

        const wadah = document.getElementById('root');
        if (!wadah) throw new Error('Elemen #root tidak ada di index.html');

        createRoot(wadah).render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
        `,
        { filename: 'src/main.tsx' },
      ),
      p(
        'Pemeriksaan `if (!wadah) throw` menggantikan tanda seru yang biasa ditulis di berkas bawaan. Ini penerapan langsung aturan dari Bab 6, yaitu tanda seru adalah janji tanpa pemeriksaan. Kalau elemen `#root` benar-benar hilang dari `index.html`, pesan yang menyebut nama elemennya jauh lebih menolong daripada `Cannot read properties of null`.',
      ),
      p(
        '`StrictMode` sengaja membuat React menjalankan komponen dua kali di mode pengembangan. Itu bukan bug dan bukan pemborosan, melainkan cara menemukan efek samping yang seharusnya tidak ada. Komponen yang benar akan berperilaku sama dijalankan berapa kali pun. Kalau ada yang rusak karenanya, yang rusak adalah komponenmu, dan mematikan `StrictMode` hanya menyembunyikannya sampai muncul di produksi dengan cara yang lebih sulit ditelusuri.',
      ),
      callout(
        'danger',
        'Jangan menyalin konfigurasi dari project lama tanpa memeriksanya',
        'Ekosistem React berubah cepat, dan konfigurasi berumur tiga tahun bisa memuat opsi yang sudah dihapus, mode JSX lama yang mewajibkan impor React, atau plugin yang tidak lagi dirawat. Perintah pembuat resmi selalu menghasilkan konfigurasi yang cocok dengan versi terbaru, dan itu titik awal yang jauh lebih aman.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan saat penyiapan punya sifat khas, yaitu ia terjadi sebelum satu baris kodemu sempat berjalan sehingga jejaknya menunjuk ke berkas yang tidak kamu tulis.',
      ),
      code(
        'text',
        `
        Uncaught Error: Target container is not a DOM element.
        `,
        { caption: 'Elemen tempat React dipasang tidak ditemukan.' },
      ),
      p(
        'Dua penyebabnya, yaitu `index.html` tidak punya elemen dengan id yang dicari, atau skripnya berjalan sebelum elemen itu dibaca. Penyebab kedua tidak terjadi pada penyiapan bawaan karena skrip modulnya berperilaku seperti `defer`, seperti dibahas di Bab 4 Frontend Basic. Kalau kamu memasang React ke halaman yang sudah ada, periksa urutan tag skripnya.',
      ),
      code(
        'text',
        `
        Warning: Invalid hook call. Hooks can only be called inside of the
        body of a function component. This could happen for one of the
        following reasons:
        1. You might have mismatching versions of React and the renderer
        `,
        { caption: 'Sering berarti ada dua salinan React di `node_modules`.' },
      ),
      p(
        'Alasan nomor satu yang disebut pesannya adalah yang paling sering terjadi saat penyiapan, terutama kalau kamu memakai pustaka lokal yang punya `node_modules` sendiri. Periksa dengan `npm ls react`, dan kalau muncul lebih dari satu versi, itulah penyebabnya. Jalan keluarnya berbeda per alat, dan untuk npm biasanya lewat `overrides` di `package.json`.',
      ),
      code(
        'text',
        `
        $ npm run dev
        Error: Cannot find module '@rollup/rollup-linux-x64-gnu'
        `,
        { caption: 'Paket biner khusus sistem tidak ikut terpasang.' },
      ),
      p(
        'Ini kegagalan yang muncul saat `package-lock.json` dibuat di sistem yang berbeda, misalnya rekan memakai macOS dan kamu memakai Linux. Paket biner untuk tiap sistem berbeda, dan lockfile bisa hanya memuat satu di antaranya. Jalan keluarnya menghapus `node_modules` beserta lockfile lalu memasang ulang, dan sesudahnya lockfile yang baru memuat keduanya.',
      ),
      code(
        'text',
        `
        $ npm run dev
        Port 5173 is in use, trying another one...
        `,
        { caption: 'Bukan error, dan alamatnya berubah tanpa kamu sadari.' },
      ),
      p(
        'Ini pesan yang mudah terlewat dan menyebabkan kebingungan yang tidak perlu. Server pengembangan berpindah port, sedangkan tab peramban yang masih terbuka menunjuk port lama yang dipakai proses lain. Yang kamu lihat adalah versi lama aplikasimu, dan perubahan kode seolah tidak berpengaruh. Selalu baca alamat yang dicetak di terminal, bukan mengandalkan tab yang sudah terbuka.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Target container is not a DOM element`',
            'Elemen tempat React dipasang tidak ada',
            'Periksa id di `index.html`, dan urutan tag skripnya',
          ],
          [
            '`Invalid hook call` tepat setelah penyiapan',
            'Ada dua salinan React di `node_modules`',
            'Periksa `npm ls react`, lalu satukan versinya',
          ],
          [
            "`Cannot find module '@rollup/rollup-...'`",
            'Lockfile dibuat di sistem yang berbeda',
            'Hapus `node_modules` dan lockfile, lalu pasang ulang',
          ],
          [
            'Perubahan kode tidak terlihat di peramban',
            'Server pindah port, dan tab lama menunjuk port lama',
            'Buka alamat yang dicetak terminal',
          ],
          [
            'Gambar dari `src/` tidak muncul',
            'Diacu dengan alamat teks, bukan lewat `import`',
            'Impor berkasnya, atau pindahkan ke `public/`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penyiapan adalah tempat keputusan yang dampaknya paling lama terasa, dan sebagian besar kesalahan di bawah baru terasa berbulan-bulan kemudian.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyusun konfigurasi sendiri dari nol untuk belajar',
            'Supaya paham tiap bagiannya',
            'Menghabiskan hari-hari pertama untuk hal yang jarang perlu disentuh lagi. Pakai pembuat resmi, dan pelajari konfigurasinya saat benar-benar butuh mengubah sesuatu',
          ],
          [
            'Mematikan `StrictMode` karena efeknya berjalan dua kali',
            'Supaya perilakunya seperti produksi',
            'Ia sengaja menemukan efek samping yang seharusnya tidak ada. Yang rusak adalah komponenmu, dan produksi akan menemukannya dengan cara yang lebih mahal',
          ],
          [
            'Menaruh semua gambar di `public/`',
            'Alamatnya lebih mudah ditulis',
            'Melewatkan pengoptimalan dan sidik jari cache. Impor dari `src/` untuk aset yang dipakai komponen',
          ],
          [
            'Menyalin konfigurasi dari project lama',
            'Sudah terbukti bekerja di sana',
            'Bisa memuat opsi yang sudah dihapus dan mode JSX lama. Mulai dari pembuat resmi',
          ],
          [
            'Memasang pustaka rute, state, dan UI di hari pertama',
            'Nanti pasti butuh',
            'Sebagian besar tidak pernah dipakai, dan tiap satunya kontrak jangka panjang. Pasang saat kebutuhannya nyata',
          ],
          [
            'Memakai kerangka kerja lengkap untuk satu halaman tanpa rute',
            'Lebih lengkap lebih baik',
            'Menambah konsep yang harus dipahami tanpa manfaat. Vite dengan React saja lebih sederhana',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan karena ia keputusan yang sering diambil di minggu pertama dan akibatnya baru terasa jauh kemudian. Efek yang berjalan dua kali menandakan ada sesuatu yang tidak bisa dijalankan ulang dengan aman, misalnya pendaftaran yang tidak melepas atau permintaan yang tidak dibatalkan. Keduanya adalah bug sungguhan yang akan muncul di produksi saat pengguna berpindah halaman dengan cepat.',
      ),
      callout(
        'tip',
        'Empat perintah yang layak dihafal sejak hari pertama',
        '`npm run dev` untuk server pengembangan, `npm run build` untuk memastikan bisa dibangun, `npm run lint` untuk menangkap kesalahan pola, dan `npx tsc --noEmit` untuk memeriksa tipe tanpa membangun. Menjalankan keempatnya sebelum menyerahkan pekerjaan menutup sebagian besar kejutan, dan itu persis disiplin verifikasi yang dipakai project ini.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Vite untuk belajar dan aplikasi di balik login; Next.js kalau butuh SEO atau kode server.',
        'StrictMode memanggil komponen dua kali di development untuk membongkar efek samping.',
        'Jangan matikan StrictMode — perbaiki penyebabnya.',
        'Kelompokkan berkas per fitur begitu aplikasi tumbuh.',
      ),
      references(
        {
          label: 'Getting Started',
          href: 'https://vite.dev/guide/',
          source: 'Vite',
          note: 'Membuat project React dengan satu perintah, tanpa konfigurasi awal.',
        },
        {
          label: 'Installation',
          href: 'https://nextjs.org/docs/app/getting-started/installation',
          source: 'Next.js',
          note: 'Titik awal Next.js beserta struktur folder App Router yang dihasilkannya.',
        },
        {
          label: '<StrictMode>',
          href: 'https://react.dev/reference/react/StrictMode',
          source: 'React',
          note: 'Menjelaskan kenapa komponen dipanggil dua kali di development dan kenapa itu berguna.',
        },
        {
          label: 'Start a New React Project',
          href: 'https://react.dev/learn/start-a-new-react-project',
          source: 'React',
          note: 'Anjuran resmi React sendiri dalam memilih titik awal sebuah project.',
        },
        {
          label: 'Hot Module Replacement',
          href: 'https://vite.dev/guide/features#hot-module-replacement',
          source: 'Vite',
          note: 'Mekanisme yang membuat perubahan kode terlihat tanpa kehilangan state.',
        },
      ),
    ],
  ),

  written(
    'komponen-pertama',
    'Komponen Pertama & Cara React Merender',
    21,
    'Fungsi yang mengembalikan tampilan — dan apa yang terjadi saat ia dipanggil.',
    [
      terms(
        {
          term: 'komponen',
          meaning:
            'Fungsi JavaScript biasa yang **mengembalikan gambaran tampilan**. Dua aturan yang membedakannya dari fungsi lain: namanya **wajib diawali huruf besar**, dan ia dipakai seperti tag — `<Sapaan />`, bukan `Sapaan()`. Huruf besar itulah yang membuat JSX menerjemahkannya sebagai komponen alih-alih elemen HTML.',
        },
        {
          term: 'render',
          meaning:
            'Terjemahannya **menggambar**. Di React kata ini punya arti yang sangat spesifik: **React memanggil fungsi komponenmu** untuk mendapat gambaran tampilan terbaru. Perhatikan bahwa memanggil bukan berarti mengubah layar — perubahan layar baru terjadi pada tahap berikutnya.',
        },
        {
          term: 'commit',
          meaning:
            'Tahap **setelah** render, ketika React benar-benar menyentuh DOM. Pembagian dua tahap inilah yang membuat React efisien: ia menghitung dulu apa yang perlu berubah, baru menerapkannya sekaligus, bukan sedikit demi sedikit sambil menghitung.',
        },
        {
          term: 'render pertama',
          meaning:
            'Terjemahan dari *initial render* — saat komponen digambar untuk pertama kalinya. Berbeda dari **re-render**, yaitu penggambaran ulang yang terjadi setelah state atau props berubah. Pembedaan ini akan penting sekali saat membahas `useEffect` di bab berikutnya.',
        },
        {
          term: 'pure function',
          meaning:
            'Syarat yang **diwajibkan React** untuk komponen: hasilnya hanya bergantung pada props dan state, dan ia tidak mengubah apa pun di luar dirinya selama render. Bukan anjuran gaya — React berhak memanggil komponenmu berkali-kali, jadi komponen yang tidak murni menghasilkan perilaku yang tidak bisa ditebak.',
        },
        {
          term: 'efek samping',
          meaning:
            'Terjemahan dari *side effect*. Apa pun yang menyentuh dunia di luar komponen: mengubah variabel global, menulis ke `localStorage`, mengirim permintaan jaringan. **Dilarang terjadi selama render** — tempatnya di event handler atau di dalam `useEffect`.',
        },
        {
          term: 'root',
          meaning:
            'Terjemahannya **akar**. Titik tempat React menempelkan seluruh aplikasinya ke DOM, dibuat dengan `createRoot(document.getElementById("root"))`. Ini satu-satunya tempat React dan DOM asli bertemu langsung.',
        },
        {
          term: 'top-down',
          meaning:
            'Terjemahannya **dari atas ke bawah**. Arah render React: sebuah komponen yang digambar ulang akan menyebabkan anak-anaknya ikut dipanggil ulang. Ini yang membuat perilakunya bisa ditebak — dan sekaligus yang membuat penempatan state menjadi keputusan yang berpengaruh.',
        },
      ),

      h2('Komponen adalah fungsi'),
      code(
        'tsx',
        `
        export function Sapaan() {
          return <h1>Halo</h1>;
        }

        // Dipakai seperti tag
        <Sapaan />
        `,
      ),
      p(
        'Tidak ada kelas, tidak ada pendaftaran, dan tidak ada API khusus, sebab sebuah komponen React **hanyalah fungsi JavaScript biasa** yang mengembalikan JSX. Yang membuatnya "komponen" cuma dua hal, yaitu namanya diawali huruf besar dan ia mengembalikan sesuatu yang bisa dirender. Baris terakhir menunjukkan cara memakainya, dan sekarang alasannya sudah kamu ketahui dari Bab 6. `<Sapaan />` dikompilasi menjadi pemanggilan dengan **referensi variabel** `Sapaan` sebagai argumen pertama, sedangkan huruf kecil akan dikirim sebagai string nama tag. Perlu ditegaskan kamu **tidak pernah memanggil** `Sapaan()` sendiri, karena React yang memanggilnya kapan pun ia merasa perlu, dan kebebasan itulah yang menuntut aturan-aturan di tabel berikut.',
      ),
      table(
        ['Aturan', 'Kenapa'],
        [
          ['Nama diawali **huruf besar**', '`<sapaan />` dikira tag HTML tak dikenal'],
          ['Mengembalikan JSX, `null`, string, atau angka', '`undefined` menyebabkan error'],
          ['**Murni** — masukan sama, keluaran sama', 'React boleh memanggilnya kapan saja'],
          [
            'Tidak mengubah apa pun di luar dirinya saat render',
            'Efek samping punya tempatnya sendiri',
          ],
        ],
      ),

      h2('Kemurnian bukan formalitas'),
      code(
        'tsx',
        `
        // SALAH: mengubah sesuatu di luar dirinya saat render
        let hitungan = 0;
        function Buruk() {
          hitungan++;                          // efek samping saat render
          document.title = 'Halo';             // menyentuh dunia luar
          return <p>{hitungan}</p>;
        }

        // BENAR: hanya menghitung dan mengembalikan
        function Baik({ hitungan }) {
          return <p>{hitungan}</p>;
        }
        `,
      ),
      p(
        "Dua baris di dalam `Buruk` melanggar kemurnian dengan cara yang berbeda. `hitungan++` mengubah variabel **di luar** fungsi, sehingga memanggil komponen ini dua kali menghasilkan angka yang berbeda meski propsnya sama, dan React memang berhak memanggilnya dua kali seperti yang StrictMode lakukan. `document.title = 'Halo'` menyentuh dunia luar saat render, padahal render seharusnya hanya **menghitung deskripsi tampilan** alih-alih mengubah apa pun. Versi `Baik` memperbaikinya dengan cara yang mungkin mengejutkan karena sederhana, yaitu nilainya **diterima sebagai prop** alih-alih disimpan sendiri. Itu pola yang akan berulang sepanjang bab, sebab kalau sebuah komponen tergoda mengubah sesuatu untuk mengingat keadaan, biasanya keadaan itu memang milik orang lain, entah props dari induk atau state yang dibahas di bab berikutnya.",
      ),
      callout(
        'warning',
        'Kenapa React menuntut kemurnian',
        'React berhak memanggil komponenmu **lebih dari sekali**, menundanya, atau membatalkannya di tengah jalan — itulah dasar `useTransition` dan Suspense. Komponen yang punya efek samping saat render menghasilkan hasil berbeda tiap kali dipanggil, dan bug seperti itu muncul acak. StrictMode memanggil dua kali justru untuk membongkarnya lebih awal.',
      ),

      h2('Apa yang terjadi saat render'),
      ol(
        '**Memicu** — render pertama, atau `setState` dipanggil.',
        '**Render** — React memanggil fungsi komponenmu. Hasilnya objek deskripsi, bukan DOM.',
        '**Rekonsiliasi** — React membandingkan deskripsi baru dengan yang lama.',
        '**Commit** — hanya perbedaannya yang diterapkan ke DOM sungguhan.',
        '**Paint** — browser menggambar.',
      ),
      code(
        'tsx',
        `
        function Kartu({ judul }) {
          console.log('render:', judul);    // tercetak setiap render
          return <h3>{judul}</h3>;
        }
        `,
        {
          caption: 'Menaruh log di badan komponen adalah cara tercepat melihat kapan ia dirender.',
        },
      ),
      p(
        'Trik sederhana ini menghubungkan kelima langkah di atas dengan sesuatu yang bisa kamu lihat sendiri. `console.log` di badan komponen berjalan pada langkah **Render**, jadi tiap baris yang tercetak berarti React memanggil fungsimu sekali. Cobalah, dan dua hal akan terlihat. Pertama, di bawah StrictMode tiap render tercetak **dua kali**, persis seperti yang dijelaskan di sub-bab sebelumnya. Kedua, dan yang lebih penting, log bisa muncul tanpa satu piksel pun berubah di layar, karena langkah Rekonsiliasi mendapati hasilnya sama sehingga langkah Commit tidak punya apa-apa untuk diterapkan. Kesalahpahaman inilah yang dikoreksi kotak berikut, bahwa "di-render ulang" tidak berarti "digambar ulang", dan menyamakan keduanya adalah sumber optimasi prematur yang paling umum di React.',
      ),
      callout(
        'info',
        'Render tidak berarti DOM berubah',
        'React bisa memanggil komponenmu, mendapati hasilnya sama persis, lalu **tidak menyentuh DOM sama sekali**. "Re-render" jauh lebih murah daripada yang dibayangkan banyak orang — dan itu sebabnya optimasi prematur di React sering menyelesaikan masalah yang tidak ada.',
      ),

      h2('Menyusun komponen'),
      code(
        'tsx',
        `
        function Halaman() {
          return (
            <main>
              <Header />
              <DaftarProduk />
              <Footer />
            </main>
          );
        }
        `,
      ),
      p(
        'Pohon komponen inilah yang React telusuri saat merender: dari akar ke bawah, berhenti di cabang yang tidak berubah.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail pesanan berisi kepala halaman, ringkasan pembeli, daftar barang, rincian biaya, dan bilah aksi. Ditulis sebagai satu komponen, panjangnya tiga ratus baris dan setiap perubahan kecil menuntut menggulir mencari bagian yang tepat. Ditulis sebagai lima belas komponen kecil, kamu harus membuka enam berkas untuk memahami satu layar. Keduanya sama-sama menyulitkan, dan keduanya berasal dari memecah berdasarkan ukuran.',
      ),
      p(
        'Yang menentukan bukan panjangnya melainkan **alasan berubahnya**. Bagian yang selalu berubah bersama tetap satu, dan bagian yang berubah karena alasan berbeda dipisah.',
      ),
      code(
        'tsx',
        `
        // Satu berkas, empat komponen. Tiga di antaranya tidak diekspor,
        // sebab hanya dipakai di halaman ini.
        export function HalamanPesanan({ pesanan }: { pesanan: Pesanan }) {
          return (
            <main>
              <KepalaPesanan pesanan={pesanan} />
              <DaftarBarang barang={pesanan.barang} />
              <RincianBiaya pesanan={pesanan} />
            </main>
          );
        }

        function KepalaPesanan({ pesanan }: { pesanan: Pesanan }) {
          return (
            <header>
              <h1>Pesanan {pesanan.nomor}</h1>
              <Lencana status={pesanan.status} />
              <time dateTime={pesanan.padaIso}>{formatTanggal(pesanan.padaIso)}</time>
            </header>
          );
        }

        function DaftarBarang({ barang }: { barang: Barang[] }) {
          if (barang.length === 0) return <p>Tidak ada barang</p>;
          return (
            <ul>
              {barang.map((b) => (
                <li key={b.id}>
                  {b.nama} × {b.jumlah} — {formatRupiah(b.hargaSen * b.jumlah)}
                </li>
              ))}
            </ul>
          );
        }

        function RincianBiaya({ pesanan }: { pesanan: Pesanan }) {
          const subtotal = pesanan.barang.reduce((j, b) => j + b.hargaSen * b.jumlah, 0);
          return (
            <dl>
              <dt>Subtotal</dt><dd>{formatRupiah(subtotal)}</dd>
              <dt>Ongkir</dt><dd>{formatRupiah(pesanan.ongkirSen)}</dd>
              <dt>Total</dt><dd>{formatRupiah(subtotal + pesanan.ongkirSen)}</dd>
            </dl>
          );
        }
        `,
        { filename: 'src/pesanan/HalamanPesanan.tsx' },
      ),
      p(
        'Tiga komponen di bawah tidak diekspor, dan itu keputusan yang disengaja. Selama ia hanya dipakai di halaman ini, menaruhnya di berkas yang sama membuat seluruh layar bisa dibaca tanpa berpindah berkas, sekaligus tetap memberi nama pada tiap bagiannya. Kalau nanti `Lencana` dipakai halaman lain, barulah ia pindah ke berkas sendiri. Pindahkan saat pemakai kedua benar-benar ada, bukan sebelum itu.',
      ),
      p(
        'Perhatikan `DaftarBarang` menerima `barang` saja, bukan seluruh `pesanan`. Ini pembedaan yang berpengaruh besar. Komponen yang hanya menerima yang ia butuhkan lebih mudah diuji, lebih mudah dipakai ulang, dan tidak ikut digambar ulang saat bagian pesanan yang lain berubah. Sebaliknya `RincianBiaya` memang menerima seluruh `pesanan` karena ia butuh dua bagian yang berbeda darinya.',
      ),
      p(
        'Nama komponen memakai kata benda, bukan kata kerja, dan itu bukan sekadar gaya. Komponen adalah **sesuatu** yang ditampilkan, bukan tindakan. Nama seperti `RenderBarang` atau `TampilkanBiaya` menyiratkan pemanggilan fungsi, padahal yang kamu tulis di JSX adalah deskripsi bentuk. Penamaan yang tepat membuat JSX terbaca seperti susunan benda, dan itu memang yang ia gambarkan.',
      ),
      callout(
        'tip',
        'Pertanyaan yang memutuskan apakah sesuatu layak jadi komponen sendiri',
        'Tanyakan apakah bagian ini punya alasan berubah yang berbeda dari sekitarnya, dan apakah ia sudah dipakai di tempat kedua. Kalau salah satunya ya, pisahkan. Kalau keduanya tidak, biarkan menyatu walaupun panjang. Ini bentuk lain dari uji penghapusan yang dibahas di Bab 2 Frontend Basic.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React sungguhan, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        function kartu() { return <div>x</div>; }
        <kartu />

        // Hasil: <kartu></kartu>
        // Komponennya tidak pernah dipanggil, dan tidak ada error.
        `,
        { caption: 'Nama berhuruf kecil dianggap tag HTML.' },
      ),
      p(
        'Sudah dibahas di Bab 6 Frontend Basic dan muncul lagi di sini karena inilah tempatnya paling sering terjadi, yaitu saat orang baru mulai memecah halaman menjadi komponen. Tidak ada error, tidak ada peringatan, dan yang terlihat hanya bagian halaman yang kosong. Kebiasaan mengawali seluruh nama komponen dengan huruf besar menutup seluruh kelas bug ini.',
      ),
      code(
        'text',
        `
        function Kartu() {}
        <Kartu />

        // Tidak ada error. Tidak ada yang dirender.
        `,
        { caption: 'Komponen yang tidak mengembalikan apa pun sah dan menghasilkan kekosongan.' },
      ),
      p(
        'Komponen yang mengembalikan `undefined` diperbolehkan sejak React 18 dan diperlakukan sama dengan mengembalikan `null`, yaitu tidak merender apa pun. Karena itu `return` yang hilang tidak lagi melempar, dan gejalanya hanya bagian halaman yang kosong. Penyebab yang paling sering adalah titik koma otomatis setelah `return`, seperti dibahas di Bab 6.',
      ),
      code(
        'text',
        `
        function Kartu() {
          const [buka, setBuka] = useState(false);
          if (!buka) return null;
          const [pilih, setPilih] = useState(null);   // hook setelah return
        }

        Warning: React has detected a change in the order of Hooks called by Kartu.
        `,
        { caption: 'Hook dipanggil setelah `return` lebih awal.' },
      ),
      p(
        'Ini pelanggaran aturan hook yang paling sering muncul justru saat memecah komponen, sebab `return null` untuk kasus kosong terasa alami ditaruh di tengah. React menyimpan state berdasarkan urutan pemanggilan hook, sehingga jumlah hook yang berbeda antar-render merusak pencocokannya. Seluruh hook harus dipanggil sebelum `return` mana pun, dan pembahasan lengkapnya ada di Bab 7.',
      ),
      code(
        'text',
        `
        <div>{<Kartu />}</div>

        // Bekerja, dan kurung kurawalnya tidak diperlukan.
        `,
        { caption: 'Bukan error, hanya kebiasaan yang menandakan kesalahpahaman.' },
      ),
      p(
        'Kurung kurawal dipakai untuk menyisipkan **ekspresi JavaScript** ke dalam JSX. Elemen JSX sudah berupa ekspresi, jadi membungkusnya lagi tidak menambah apa pun. Kalau kamu menemukan diri menulis ini, biasanya itu tanda model mentalnya masih menganggap JSX sebagai teks yang perlu ditandai. Ia justru sebaliknya, yaitu JSX adalah nilai, dan kurung kurawal dipakai untuk masuk ke JavaScript dari dalamnya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tag asing muncul dan komponen tidak berjalan',
            'Nama komponen berhuruf kecil',
            'Awali dengan huruf besar',
          ],
          [
            'Bagian halaman kosong tanpa error',
            'Komponen tidak mengembalikan apa pun',
            'Periksa `return`, terutama titik koma otomatis setelahnya',
          ],
          [
            '`change in the order of Hooks called by ...`',
            'Hook dipanggil setelah `return` lebih awal',
            'Panggil seluruh hook sebelum `return` mana pun',
          ],
          [
            'Komponen digambar ulang padahal datanya tidak berubah',
            'Ia menerima seluruh object padahal hanya butuh satu field',
            'Kirim field yang dibutuhkan saja',
          ],
          [
            'Satu berkas berisi lima belas komponen yang tidak berhubungan',
            'Dipecah berdasarkan ukuran, bukan alasan berubah',
            'Satukan yang selalu berubah bersama',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memecah halaman menjadi komponen adalah keputusan struktur, dan sebagian besar kesalahan di bawah berasal dari memakai ukuran sebagai patokannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memecah komponen begitu melewati lima puluh baris',
            'Komponen kecil katanya lebih baik',
            'Lima komponen dangkal yang harus dibuka bergantian lebih sulit dipahami daripada satu yang panjang tapi kohesif. Pecah berdasarkan alasan berubah',
          ],
          [
            'Membuat satu berkas untuk setiap komponen sekecil apa pun',
            'Lebih rapi dan seragam',
            'Komponen yang hanya dipakai di satu halaman lebih enak berada di berkas yang sama. Pindahkan saat pemakai kedua benar-benar ada',
          ],
          [
            'Mengirim seluruh object padahal hanya butuh satu field',
            'Lebih fleksibel kalau butuh yang lain nanti',
            'Komponennya jadi terikat pada bentuk data, lebih sulit diuji, dan ikut digambar ulang saat field lain berubah',
          ],
          [
            'Menamai komponen dengan kata kerja',
            'Ia kan fungsi yang menghasilkan sesuatu',
            'Komponen adalah benda yang ditampilkan, bukan tindakan. `RincianBiaya`, bukan `TampilkanBiaya`',
          ],
          [
            'Mendefinisikan komponen di dalam komponen lain',
            'Supaya bisa mengakses variabel induknya',
            'Ia dibuat ulang tiap render, sehingga React menganggapnya komponen yang berbeda dan membuang seluruh state di dalamnya. Definisikan di luar, dan kirim lewat props',
          ],
          [
            'Menyebar props dengan tiga titik supaya tidak repot',
            'Semua prop jadi lolos otomatis',
            'Tidak ada yang tahu prop apa saja yang sebenarnya dipakai, dan field asing ikut terkirim ke DOM. Sebut yang dibutuhkan',
          ],
        ],
      ),
      p(
        'Baris kelima adalah kesalahan yang paling merusak dan paling sulit dikenali dari gejalanya. Komponen yang didefinisikan di dalam komponen lain adalah fungsi baru pada tiap render, dan React membandingkan jenis komponen berdasarkan identitas fungsinya. Karena identitasnya selalu berubah, React membongkar seluruh pohonnya lalu membangunnya lagi, sehingga state di dalamnya hilang dan fokus keyboard lepas pada tiap ketikan.',
      ),
      callout(
        'info',
        'Komponen adalah fungsi, dan itu berlaku sepenuhnya',
        'Seluruh yang kamu pelajari tentang fungsi di Bab 1 Frontend Basic berlaku, yaitu nama yang mengungkap maksud, parameter yang sedikit, dan tidak ada efek samping tersembunyi. Yang membedakan komponen dari fungsi biasa hanya dua hal, yaitu ia mengembalikan deskripsi tampilan dan namanya diawali huruf besar.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Komponen adalah fungsi yang mengembalikan deskripsi tampilan.',
        'Nama wajib huruf besar; mengembalikan `undefined` adalah error.',
        'Komponen harus murni — React boleh memanggilnya berkali-kali.',
        'Render menghasilkan objek deskripsi; commit yang menyentuh DOM.',
        'Re-render tidak selalu berarti DOM berubah.',
      ),
      references(
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Aturan penamaan huruf besar dan kenapa komponen dipakai seperti tag.',
        },
        {
          label: 'Render and Commit',
          href: 'https://react.dev/learn/render-and-commit',
          source: 'React',
          note: 'Pembagian dua tahap yang menjelaskan kenapa re-render tidak selalu mengubah DOM.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Syarat kemurnian yang diwajibkan React, beserta apa yang terjadi kalau dilanggar.',
        },
        {
          label: 'createRoot',
          href: 'https://react.dev/reference/react-dom/client/createRoot',
          source: 'React',
          note: 'Satu-satunya titik tempat React menempel ke DOM asli.',
        },
      ),
    ],
  ),

  written(
    'props',
    'Props: mengalirkan data ke bawah',
    21,
    'Kontrak masuk sebuah komponen — dan kenapa ia hanya-baca.',
    [
      terms(
        {
          term: 'props',
          meaning:
            'Singkatan *properties*. Satu objek berisi seluruh data yang dikirim **dari komponen induk ke anaknya**. Sifat terpentingnya: props bersifat **hanya-baca**. Mengubahnya dari dalam komponen anak tidak akan memberi tahu induknya apa pun, dan React memang melarangnya.',
        },
        {
          term: 'aliran satu arah',
          meaning:
            'Terjemahan dari *one-way data flow*. Data hanya mengalir **ke bawah** — dari induk ke anak, tidak pernah sebaliknya. Terdengar membatasi, tapi justru inilah yang membuat penelusuran bug mungkin: kalau sebuah nilai salah, kamu tahu pasti asalnya dari atas.',
        },
        {
          term: 'callback prop',
          meaning:
            'Fungsi yang dikirim induk ke anak agar anak bisa **memberi kabar ke atas**. Karena data hanya mengalir turun, inilah satu-satunya cara anak memengaruhi induknya — bukan dengan mengubah props, melainkan dengan memanggil fungsi yang induknya sediakan.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Terjemahan bebasnya **pengeboran prop**. Keadaan ketika sebuah data harus dioper melewati banyak lapisan komponen yang **tidak memakainya sama sekali**, hanya untuk sampai ke tujuan di bawah. Dua jalan keluarnya dibahas di Sub-bab 2.8 (composition) dan bab berikutnya (context).',
        },
        {
          term: 'destructuring props',
          meaning:
            'Pola `function Profil({ nama, umur })` yang mengambil property langsung di daftar parameter. Persis destructuring object dari Sub-bab 1.11, diterapkan pada props — dan manfaat tambahannya: daftar parameter itu sekaligus menjadi **dokumentasi** prop apa saja yang dipakai.',
        },
        {
          term: 'nilai default',
          meaning:
            'Nilai cadangan untuk prop opsional, ditulis di destructuring: `{ umur = 0 }`. Ingat aturan dari Sub-bab 1.7 yang berlaku persis sama di sini — ia **hanya terpicu oleh `undefined`**, bukan oleh `null`.',
        },
        {
          term: 'spread props',
          meaning:
            'Meneruskan seluruh sisa props sekaligus dengan `{...sisanya}`. Berguna untuk komponen pembungkus, tapi punya biaya: pembaca tidak lagi bisa melihat prop apa saja yang sebenarnya diterima hanya dengan membaca komponennya.',
        },
        {
          term: 'immutable',
          meaning:
            'Artinya **tidak boleh diubah**. Props bersifat immutable dari sudut pandang penerimanya. Kalau sebuah nilai memang perlu berubah, ia bukan props — ia state, dan tempatnya di komponen yang memilikinya.',
        },
      ),

      h2('Dasar'),
      code(
        'tsx',
        `
        type Props = {
          nama: string;
          umur?: number;
          onKlik: () => void;
        };

        function Profil({ nama, umur = 0, onKlik }: Props) {
          return <button onClick={onKlik}>{nama} ({umur})</button>;
        }

        <Profil nama="Zum" onKlik={() => console.log('klik')} />
        `,
      ),
      p(
        'Tipe `Props` di atas mendeklarasikan bentuk yang **wajib** diberikan pemanggil komponen ini. `nama` sebagai string dan `onKlik` sebagai fungsi tanpa argumen adalah wajib, sementara tanda tanya pada `umur?: number` menandainya opsional. Nilai `= 0` pada parameter `umur = 0` adalah nilai bawaan JavaScript biasa, sehingga kalau pemanggil tidak mengoper `umur` sama sekali, `umur` di dalam fungsi otomatis bernilai `0` tanpa perlu pengecekan manual. Pada baris pemanggilan, `nama="Zum"` dan `onKlik={...}` adalah cara mengoper nilai ke props, sama seperti mengoper atribut ke elemen HTML, hanya saja nilainya bisa berupa string, fungsi, angka, atau objek apa pun.',
      ),

      h2('Props hanya-baca'),
      code(
        'tsx',
        `
        function Buruk({ items }) {
          items.push('baru');        // JANGAN — mengubah data milik induk
          return <ul>{items.map(...)}</ul>;
        }

        function Baik({ items, onTambah }) {
          return <button onClick={() => onTambah('baru')}>Tambah</button>;
        }
        `,
      ),
      p(
        "Baris `items.push('baru')` di `Buruk` adalah kesalahan yang **tidak menghasilkan error apa pun**, dan justru itu masalahnya. Array yang diterima sebagai prop bukan salinan, melainkan object yang sama persis dengan milik induk, seperti aturan reference dari Bab 1. Jadi `push` diam-diam mengubah data milik komponen lain, dan React tidak akan memberi tahu siapa pun karena alamat arraynya tidak berubah, sehingga layar bahkan bisa tidak diperbarui sama sekali. `Baik` memperbaikinya dengan membalik arah, sebab alih-alih mengubah data, ia **memberi tahu induknya** lewat `onTambah` bahwa ada sesuatu yang perlu diubah lalu membiarkan pemilik data yang memutuskan. Perhatikan `Baik` sama sekali tidak menyentuh `items`, dan ia bahkan tidak perlu tahu bentuk datanya.",
      ),
      callout(
        'danger',
        'Kenapa aturan ini menentukan segalanya',
        'Aliran data satu arah adalah yang membuat React bisa ditelusuri: kalau sebuah nilai salah, kamu menaikinya ke atas sampai ketemu sumbernya. Komponen yang menulis ke propsnya sendiri memutus rantai itu — dan React tidak akan memberi tahumu, karena ia tidak mengamati perubahan itu.',
      ),

      h2('Data turun, perubahan naik'),
      code(
        'tsx',
        `
        function Induk() {
          const [nilai, setNilai] = useState('');

          return <Anak nilai={nilai} onUbah={setNilai} />;
          //            ^data turun    ^perubahan naik
        }

        function Anak({ nilai, onUbah }) {
          return <input value={nilai} onChange={(e) => onUbah(e.target.value)} />;
        }
        `,
      ),
      p(
        'Ini pola paling dasar yang akan kamu tulis berulang-ulang di React. `Induk` memiliki data (`nilai`) dan cara mengubahnya (`setNilai`), lalu mengoper **keduanya** ke `Anak`, dengan nilainya sebagai props biasa dan fungsi pengubahnya sebagai prop bernama `onUbah`. `Anak` sendiri tidak tahu dari mana `nilai` berasal atau ke mana perubahannya pergi, sebab ia hanya menampilkan `nilai` yang diterima dan memanggil `onUbah` setiap kali pengguna mengetik. Karena `setNilai` dipanggil di dalam `onUbah` yang dijalankan `Anak`, perubahan yang terjadi di komponen anak "naik" kembali ke state yang dimiliki induknya, dan itulah asal nama pola ini, *data turun, perubahan naik* (*data down, events up*).',
      ),

      h2('`children`'),
      code(
        'tsx',
        `
        function Panel({ judul, children }: { judul: string; children: React.ReactNode }) {
          return (
            <section className="rounded-lg border border-border p-4">
              <h2>{judul}</h2>
              {children}
            </section>
          );
        }

        <Panel judul="Pengaturan">
          <p>Isi apa pun di sini</p>
          <Tombol />
        </Panel>
        `,
      ),
      p(
        'Bagian bawah menunjukkan perbedaan yang membuat `children` istimewa, yaitu isi `<Panel>` ditulis **di tempat pemakaian** alih-alih dioper sebagai atribut. Padahal seperti dibahas di Bab 6, keduanya sebenarnya sama, sebab `children` hanyalah prop biasa yang kebetulan punya penulisan khusus. Yang penting adalah akibatnya. `Panel` menyediakan bingkai berupa border, padding, dan judul, **tanpa perlu tahu apa yang akan ditaruh di dalamnya**, sehingga pemakainya bebas mengisi apa saja termasuk komponen lain. Bandingkan dengan mengoper `isi` sebagai prop string, karena itu akan membatasi isinya pada teks dan setiap variasi baru menuntut prop tambahan. Kotak berikut menyebut konsekuensi yang lebih jauh, sebab pola ini juga jalan keluar dari *prop drilling* karena mengoper komponen jadi lebih murah daripada mengoper datanya melewati banyak lapisan.',
      ),
      callout(
        'tip',
        '`children` adalah alat paling ampuh melawan prop drilling',
        'Alih-alih mengoper data melewati lima lapisan komponen, oper **komponennya** sebagai `children` dari tempat datanya berada. Dibahas tuntas di Bab 6.',
      ),

      h2('Meneruskan sisa props'),
      code(
        'tsx',
        `
        type Props = React.ComponentProps<'button'> & { varian?: 'utama' | 'hantu' };

        function Tombol({ varian = 'utama', className, ...sisa }: Props) {
          return <button className={\`\${KELAS[varian]} \${className ?? ''}\`} {...sisa} />;
        }

        // Semua atribut <button> asli tetap bekerja dan tetap bertipe
        <Tombol type="submit" disabled aria-label="Kirim" varian="hantu" />
        `,
      ),
      p(
        "`React.ComponentProps<'button'>` meminjam **seluruh** tipe atribut yang sah dimiliki elemen `<button>` HTML asli, mulai dari `type`, `disabled`, `aria-label`, `onClick`, sampai puluhan lainnya, tanpa kamu perlu mendaftarkannya satu per satu. `& { varian?: ... }` menambahkan satu prop milikmu sendiri di atasnya. Di dalam fungsi, `{ varian = 'utama', className, ...sisa }` memisahkan tiga hal. `varian` diambil untuk menentukan class-nya sendiri, `className` diambil terpisah supaya bisa digabung manual, dan `...sisa` menangkap **semua atribut lain** yang tidak disebut secara eksplisit. Pada contoh pemanggilan di atas, `type`, `disabled`, dan `aria-label` semuanya masuk ke `sisa` lalu diteruskan lewat `{...sisa}` ke elemen `<button>` sungguhan. Tanpa pola `...sisa` ini, setiap atribut HTML yang ingin didukung `Tombol` harus didaftarkan satu per satu secara manual di tipe `Props`.",
      ),

      h2('Kesalahan yang sering terjadi'),
      code(
        'tsx',
        `
        <Tombol onClick={handleKlik()} />     // SALAH: dipanggil saat render
        <Tombol onClick={handleKlik} />       // BENAR: dioper
        <Tombol onClick={() => hapus(id)} />  // BENAR: butuh argumen

        <Kartu judul=judul />                 // SALAH: nilai JS butuh kurung kurawal
        <Kartu judul={judul} />               // BENAR

        <Kartu aktif="false" />               // SALAH: string "false" itu truthy
        <Kartu aktif={false} />               // BENAR
        `,
      ),
      p(
        'Baris terakhir yang paling sering menjebak pemula: `aktif="false"` tanpa kurung kurawal mengoper **string** berisi empat karakter `f`, `a`, `l`, `s`, dan `e` — bukan nilai boolean `false`. Di JavaScript, string apa pun yang tidak kosong selalu dianggap *truthy*, termasuk string `"false"` itu sendiri. Kalau komponen `Kartu` melakukan `if (aktif) { ... }`, kondisinya akan **selalu benar**, meski niatnya jelas ingin menonaktifkannya. Kurung kurawal `{false}` yang mengoper nilai JavaScript asli-lah yang membuat React membaca boolean-nya dengan benar.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Tombol` dipakai di seluruh aplikasi. Awalnya ia menerima tiga prop. Enam bulan kemudian ia menerima empat belas, termasuk `kecil`, `besar`, `penuh`, `merah`, `hantu`, dan `garis`. Setengahnya tidak boleh dipakai bersamaan, dan tidak ada satu pun yang mencegahnya. Ada halaman yang memakai `kecil` dan `besar` sekaligus, dan hasilnya bergantung pada urutan kelas CSS yang tidak seorang pun pahami.',
      ),
      p(
        'Bentuk props menentukan seberapa mudah komponen dipakai salah. Perbandingan di bawah menunjukkan selisihnya, dan yang berubah bukan kemampuannya melainkan kemungkinan salahnya.',
      ),
      compare(
        {
          title: 'Boolean bertumpuk',
          lang: 'tsx',
          code: `
          type TombolProps = {
            kecil?: boolean;
            besar?: boolean;
            merah?: boolean;
            hantu?: boolean;
            garis?: boolean;
          };

          // Sah menurut tipe, dan tidak masuk akal:
          <Tombol kecil besar merah hantu />

          // 2^5 = 32 kombinasi, dan hanya 6 yang berarti.
          `,
          notes: ['Tidak ada yang mencegah kombinasi yang tidak masuk akal'],
        },
        {
          title: 'Union yang saling meniadakan',
          lang: 'tsx',
          code: `
          type TombolProps = {
            ukuran?: 'kecil' | 'sedang' | 'besar';
            varian?: 'utama' | 'sekunder' | 'bahaya' | 'hantu';
            penuh?: boolean;
          };

          // Mustahil memilih dua ukuran sekaligus.
          <Tombol ukuran="kecil" varian="bahaya" />

          // 3 x 4 x 2 = 24 kombinasi, dan SEMUANYA berarti.
          `,
          notes: ['Editor melengkapi pilihannya, dan salah ketik ditolak'],
        },
      ),
      p(
        'Perbedaan terbesarnya bukan jumlah prop melainkan **kombinasi yang mustahil dibuat**. Dengan union, memilih dua ukuran sekaligus bukan sekadar tidak dianjurkan melainkan tidak bisa ditulis. Ini penerapan langsung gagasan dari Bab 2 Frontend Basic, yaitu membuat keadaan yang salah menjadi mustahil, dan di sini alatnya adalah tipe props.',
      ),
      p(
        'Prop `penuh` tetap boolean, dan itu benar. Boolean cocok untuk hal yang memang hanya punya dua keadaan dan tidak meniadakan apa pun. Aturannya, boolean sah kalau ia berdiri sendiri, dan berubah menjadi masalah begitu ada beberapa boolean yang saling meniadakan.',
      ),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ReactNode } from 'react';

        type TombolProps = ComponentPropsWithoutRef<'button'> & {
          ukuran?: 'kecil' | 'sedang' | 'besar';
          varian?: 'utama' | 'sekunder' | 'bahaya' | 'hantu';
          penuh?: boolean;
          ikonKiri?: ReactNode;
        };

        export function Tombol({
          ukuran = 'sedang',
          varian = 'utama',
          penuh = false,
          ikonKiri,
          className = '',
          children,
          ...sisa
        }: TombolProps) {
          const kelas = [
            'tombol',
            \`tombol-\${ukuran}\`,
            \`tombol-\${varian}\`,
            penuh ? 'tombol-penuh' : '',
            className,                 // dari pemanggil, ditaruh TERAKHIR supaya bisa menimpa
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button type="button" {...sisa} className={kelas}>
              {ikonKiri}
              {children}
            </button>
          );
        }
        `,
        { filename: 'src/ui/Tombol.tsx' },
      ),
      p(
        'Urutan pada `{...sisa}` dan `className` menentukan siapa yang menang, dan itu sering keliru. Karena `className` ditulis **setelah** spread, nilai yang kamu susun menang atas `className` mentah dari `sisa`. Itu sebabnya `className` dibongkar keluar lebih dulu dan digabungkan, bukan dibiarkan di dalam `sisa`. Tanpa itu, pemanggil yang memberi `className` akan menghapus seluruh kelas varian.',
      ),
      p(
        'Sebaliknya `type="button"` ditulis **sebelum** spread, dan itu juga disengaja. Nilainya menjadi bawaan yang bisa ditimpa pemanggil dengan `type="submit"`. Kalau ia ditulis setelah spread, pemanggil tidak akan pernah bisa mengubahnya. Aturan yang bisa dipegang, taruh sebelum spread untuk nilai bawaan, dan setelah spread untuk nilai yang tidak boleh ditimpa.',
      ),
      p(
        "Bagian `ComponentPropsWithoutRef<'button'>` membuat seluruh atribut tombol yang sah otomatis diterima, yaitu `onClick`, `disabled`, `aria-label`, `form`, dan puluhan lainnya. Tanpa itu, tiap kebutuhan baru berarti menyunting tipe props. Ini pola yang sudah dibahas di Bab 6 Frontend Basic, dan di sini terlihat gunanya pada komponen yang benar-benar dipakai banyak tempat.",
      ),
      callout(
        'warning',
        'Props adalah milik pemanggil, dan tidak boleh diubah',
        'Mengubah `props.daftar.push(...)` di dalam komponen mengubah data milik induknya, dan React tidak akan tahu perubahan itu terjadi sehingga tampilan tidak ikut berubah. Ini pantangan mutasi dari Bab 1 Frontend Basic, muncul kembali sebagai aturan React. Perlakukan props sebagai nilai yang hanya bisa dibaca.',
      ),

      h2('Saat error-nya muncul'),
      p('Empat kegagalan berikut adalah yang paling sering saat props mulai bertambah rumit.'),
      code(
        'text',
        `
        <Tombol ukuran="kcil" />

        error TS2322: Type '"kcil"' is not assignable to type
        '"kecil" | "sedang" | "besar" | undefined'.
        `,
        { caption: 'Salah ketik ditolak, dan pilihannya disebut lengkap.' },
      ),
      p(
        'Inilah manfaat union yang paling langsung terasa. Dengan `ukuran: string`, salah ketik ini lolos tanpa suara dan menghasilkan kelas CSS `tombol-kcil` yang tidak ada, sehingga tombolnya tampil tanpa ukuran. Pesan errornya bahkan menyebut seluruh pilihan yang sah, sehingga perbaikannya tidak perlu membuka berkas tipenya.',
      ),
      code(
        'text',
        `
        <Tombol onClick={hapus(id)} />

        // hapus() berjalan SAAT RENDER, bukan saat diklik.
        // Kalau hapus memanggil setState, muncul:
        Warning: Cannot update a component while rendering a different component.
        `,
        { caption: 'Tanda kurung ikut ditulis pada penangan peristiwa.' },
      ),
      p(
        'Gejalanya khas dan mudah dikenali, yaitu aksi berjalan sendiri saat halaman dimuat sebelum ada yang mengklik. Kalau fungsi itu mengubah state, React memberi peringatan tambahan sebab mengubah state komponen lain selama render adalah pelanggaran yang bisa menyebabkan putaran tak berujung. Bungkus menjadi `onClick={() => hapus(id)}`.',
      ),
      code(
        'text',
        `
        function Daftar({ item }) {
          item.sort((a, b) => a.nama.localeCompare(b.nama));
          return <ul>{item.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }

        // Tidak ada error. Array milik induk ikut terurut,
        // dan induknya tidak tahu datanya berubah.
        `,
        { caption: 'Props diubah di tempat, dan `sort` memang mengubah aslinya.' },
      ),
      p(
        'Ini pelanggaran pantangan mutasi yang paling sering di React, dan `sort` adalah pelakunya karena namanya tidak menyiratkan bahwa ia mengubah aslinya. Akibatnya berlapis, yaitu data induk berubah tanpa sepengetahuannya, dan pada `StrictMode` yang menjalankan render dua kali hasilnya bisa berbeda. Pakai `toSorted` dari Bab 1 Frontend Basic, atau salin dulu dengan `[...item].sort(...)`.',
      ),
      code(
        'text',
        `
        <Tombol varian="utama" className="mt-4" />

        // Hasil: <button class="mt-4">
        // Seluruh kelas varian hilang.
        `,
        { caption: '`className` dari pemanggil menimpa yang disusun komponen.' },
      ),
      p(
        'Ini akibat urutan spread yang keliru, yaitu `className` dibiarkan berada di dalam `{...sisa}` yang ditulis setelah `className` milik komponen. Tidak ada error, dan gejalanya berupa tombol yang kehilangan seluruh gayanya begitu pemanggil menambahkan satu kelas. Bongkar `className` keluar dari `sisa` lalu gabungkan, seperti pada studi kasus.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Type \'"x"\' is not assignable to type \'"a" | "b"\'`',
            'Salah ketik pada prop bertipe union',
            'Perbaiki ejaannya, pilihannya disebut di pesan errornya',
          ],
          [
            'Aksi berjalan sendiri saat halaman dimuat',
            'Tanda kurung ikut ditulis pada penangan',
            'Bungkus menjadi fungsi panah',
          ],
          [
            'Data induk berubah tanpa sepengetahuannya',
            'Props diubah di tempat, sering lewat `sort` atau `push`',
            'Salin dulu, atau pakai `toSorted`',
          ],
          [
            'Gaya komponen hilang saat pemanggil memberi `className`',
            'Urutan spread membuat nilai pemanggil menimpa',
            'Bongkar `className` keluar dari spread lalu gabungkan',
          ],
          [
            'Prop asing muncul sebagai atribut di DOM',
            'Props disebar ke elemen tanpa disaring',
            'Bongkar prop khusus komponen keluar sebelum menyebar sisanya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Props adalah antarmuka komponenmu, dan sebagian besar kesalahan di bawah membuat antarmuka itu lebih mudah dipakai salah daripada dipakai benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah boolean baru tiap ada varian tampilan baru',
            'Satu prop untuk satu kebutuhan',
            'Kombinasi yang tidak masuk akal menjadi mungkin, dan jumlahnya tumbuh dua pangkat. Pakai union',
          ],
          [
            'Memakai `string` untuk prop yang pilihannya terbatas',
            '`string` menerima semuanya',
            'Salah ketik lolos tanpa peringatan dan menghasilkan kelas CSS yang tidak ada',
          ],
          [
            'Mengubah props di dalam komponen',
            'Datanya kan sudah ada di sini',
            'Induk tidak tahu perubahannya sehingga tampilan tidak ikut berubah, dan pada `StrictMode` hasilnya bisa berbeda antar-render',
          ],
          [
            'Menyebar seluruh props ke elemen DOM',
            'Supaya semua atribut lolos',
            'Prop khusus komponen ikut menjadi atribut HTML yang tidak dikenal. Bongkar yang khusus keluar lebih dulu',
          ],
          [
            'Memberi nilai bawaan lewat `defaultProps`',
            'Namanya jelas menyebut bawaan',
            '`defaultProps` sudah tidak dipakai untuk komponen fungsi di React 19. Beri bawaan saat membongkar parameter',
          ],
          [
            'Mengirim fungsi baru sebagai prop pada tiap render tanpa perlu',
            'Fungsinya kecil',
            'Komponen anak menganggap propnya berubah tiap render. Ini baru berarti kalau anaknya dioptimalkan, dan pembahasannya ada di Bab 7',
          ],
        ],
      ),
      p(
        'Baris pertama layak diperiksa secara berkala pada komponen yang sudah lama hidup. Hitung berapa boolean yang dimiliki komponenmu, lalu hitung dua pangkat sebanyak itu. Kalau hasilnya jauh lebih besar daripada jumlah tampilan yang sebenarnya kamu maksud, sebagian besar kombinasi itu adalah keadaan yang tidak pernah kamu rancang dan tidak pernah kamu uji.',
      ),
      callout(
        'tip',
        'Urutan menulis tipe props yang jarang keliru',
        'Mulai dari data yang wajib, lalu pilihan tampilan sebagai union, lalu penangan peristiwa, lalu `children` kalau ada. Warisi atribut elemen dengan `ComponentPropsWithoutRef` kalau komponenmu membungkus satu elemen HTML. Urutan itu juga membuat tipenya terbaca sebagai penjelasan tentang apa yang komponen ini butuhkan.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Props hanya-baca — komponen tidak boleh mengubah yang diterimanya.',
        'Data turun lewat props; perubahan naik lewat callback.',
        '`children` menghindari prop drilling dengan mengoper komponen, bukan data.',
        '`...sisa` + `ComponentProps` meneruskan atribut HTML lengkap dengan tipenya.',
        '`onClick={fn()}` memanggil saat render; `onClick={fn}` mengoper.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Rujukan utama sub-bab ini, termasuk `children` dan penerusan props.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan props bersifat hanya-baca dan apa akibatnya kalau diubah.',
        },
        {
          label: 'Responding to Events',
          href: 'https://react.dev/learn/responding-to-events',
          source: 'React',
          note: 'Pembedaan mengoper fungsi dan memanggilnya — kesalahan nomor satu di sub-bab ini.',
        },
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Pola callback prop untuk menyampaikan perubahan dari anak ke induk.',
        },
      ),
    ],
  ),

  written(
    'rendering-kondisional',
    'Rendering Kondisional',
    20,
    'Menampilkan sesuatu hanya bila perlu — dan jebakan yang menampilkan angka nol.',
    [
      terms(
        {
          term: 'rendering kondisional',
          meaning:
            'Terjemahannya **menampilkan berdasarkan syarat**. Tiga bentuknya punya kegunaan berbeda: `&&` untuk "tampil atau tidak sama sekali", ternary untuk "salah satu dari dua", dan `early return` untuk "seluruh komponen berubah bentuk".',
        },
        {
          term: 'early return',
          meaning:
            'Keluar dari komponen lebih awal dengan `return` sebelum JSX utamanya. Ini bentuk **paling terbaca** untuk keadaan yang mengubah seluruh tampilan — memuat, gagal, kosong. Menuliskannya sebagai ternary bertingkat menghasilkan kode yang benar tapi hampir mustahil dibaca ulang.',
        },
        {
          term: 'jebakan angka nol',
          meaning:
            'Bug paling terkenal di React. `{items.length && <Daftar />}` menampilkan **angka `0`** di layar saat daftarnya kosong — karena `0` falsy sehingga `&&` mengembalikannya, dan berbeda dari `false`, **angka nol benar-benar dirender**. Obatnya: ubah jadi boolean dulu dengan `items.length > 0 &&`.',
        },
        {
          term: 'nilai yang diabaikan',
          meaning:
            'React sengaja tidak menampilkan apa pun untuk `true`, `false`, `null`, dan `undefined`. Sifat inilah yang membuat pola `&&` bisa bekerja sama sekali. Perhatikan lagi bahwa `0` **tidak** termasuk daftar ini.',
        },
        {
          term: 'return null',
          meaning:
            'Cara sah menyatakan "komponen ini tidak menampilkan apa-apa". Berbeda dari mengembalikan `undefined`, yang justru merupakan **error** di React. Kalau sebuah komponen sering mengembalikan `null`, pertimbangkan memindahkan syaratnya ke induknya.',
        },
        {
          term: 'state mesin',
          meaning:
            'Terjemahan bebas dari *state machine*. Menyimpan keadaan sebagai **satu nilai berhingga** seperti `"memuat" | "gagal" | "berhasil"`, alih-alih beberapa boolean terpisah. Keunggulannya, kombinasi mustahil seperti "sedang memuat **dan** gagal sekaligus" menjadi tidak bisa ditulis.',
        },
        {
          term: 'empat keadaan UI',
          meaning:
            'Memuat, kosong, gagal, berhasil — persis yang kamu pelajari di Sub-bab 5.12 Frontend Basic. Rendering kondisional adalah alat untuk menampilkannya, dan `early return` adalah bentuk yang paling cocok untuk keempatnya.',
        },
        {
          term: 'ternary bertingkat',
          meaning:
            'Ternary di dalam ternary. Secara teknis sah, tapi menjadi tidak terbaca dengan sangat cepat — dan di dalam JSX yang sudah penuh kurung, ia jauh lebih buruk lagi. Kalau butuh lebih dari satu tingkat, pindahkan ke `early return` di atas JSX.',
        },
      ),

      h2('Tiga bentuk'),
      code(
        'tsx',
        `
        {sudahLogin && <Profil />}                      // tampil kalau true
        {sudahLogin ? <Profil /> : <TombolLogin />}     // salah satu

        function Halaman({ status }) {                  // early return
          if (status === 'memuat') return <Skeleton />;
          if (status === 'gagal') return <Error />;
          return <Konten />;
        }
        `,
      ),
      p(
        'Ketiganya menjawab kebutuhan yang berbeda. `sudahLogin && <Profil />` cocok saat kamu hanya punya **satu** kemungkinan tampilan, yaitu menampilkan sesuatu atau tidak sama sekali. `? :` dipakai saat ada **dua** kemungkinan yang saling menggantikan. Sedangkan `early return`, yang memakai beberapa `if` dengan masing-masing langsung `return`, cocok begitu ada **tiga atau lebih** kemungkinan, karena membaca beberapa ternary yang ditumpuk (`a ? b ? c : d : e`) jauh lebih sulit daripada membaca beberapa `if` berurutan dari atas ke bawah.',
      ),

      h2('Jebakan angka nol'),
      code(
        'tsx',
        `
        {items.length && <Daftar items={items} />}
        // Saat kosong: 0 && ... menghasilkan 0, dan React MERENDER angka 0 di layar

        {items.length > 0 && <Daftar items={items} />}    // BENAR
        {Boolean(items.length) && <Daftar items={items} />}
        `,
      ),
      p(
        'Jebakan ini muncul di React justru karena `length` adalah cara paling alami menanyakan "apakah ada isinya", padahal `length` menghasilkan angka dan bukan boolean. Selama daftarnya berisi, `3 && <Daftar />` menghasilkan elemennya dan semuanya tampak benar, sehingga masalahnya baru terlihat pada daftar kosong, keadaan yang justru jarang diuji selama pengembangan. Kedua versi BENAR menyelesaikannya dengan cara yang sama, yaitu memastikan sisi kiri **sudah berupa boolean** sebelum bertemu `&&`. Perlu ditegaskan ini bukan aturan khusus React melainkan sifat `&&` dari Bab 1 yang bertemu keputusan React untuk merender angka, sebab `false`, `null`, dan `undefined` diabaikan sedangkan `0` adalah nilai yang sah untuk ditampilkan.',
      ),
      callout(
        'danger',
        'Ini bug yang lolos review lebih sering daripada yang kamu duga',
        'Angka "0" yang muncul sendirian di halaman terlihat seperti kesalahan data, bukan kesalahan kode — jadi orang mencarinya di tempat yang salah. `false`, `null`, dan `undefined` diabaikan React; **`0` tidak**.',
      ),

      h2('Empat keadaan UI'),
      code(
        'tsx',
        `
        function DaftarTugas({ status, tugas, pesan, onCobaLagi }) {
          if (status === 'memuat') return <Skeleton baris={5} />;

          if (status === 'gagal') {
            return (
              <div role="alert">
                <p>{pesan}</p>
                <button onClick={onCobaLagi}>Coba lagi</button>
              </div>
            );
          }

          if (tugas.length === 0) {
            return (
              <div>
                <p>Belum ada tugas.</p>
                <button onClick={onTambah}>Tambah yang pertama</button>
              </div>
            );
          }

          return <ul>{tugas.map((t) => <Baris key={t.id} tugas={t} />)}</ul>;
        }
        `,
      ),
      p(
        'Perhatikan urutan keempat cabangnya, karena ia bukan acak, melainkan memuat, gagal, kosong, lalu berhasil, dari yang paling menghentikan ke yang paling normal. Urutan itu penting karena tiap `return` mengakhiri fungsi, sehingga cabang di bawah hanya berjalan bila semua di atasnya terlewati. Menukar `status === \'gagal\'` ke bawah `tugas.length === 0`, misalnya, akan menampilkan "belum ada tugas" pada permintaan yang sebenarnya gagal, sebuah pesan yang **berbohong** kepada pengguna. Perhatikan juga cabang gagal dan kosong sama-sama menyediakan **tindakan lanjutan** berupa tombol alih-alih sekadar kalimat, dan itu penerapan langsung dari aturan empat keadaan UI di Bab 5. Dan cabang berhasil sengaja ditulis paling ringkas, karena ia jalur yang paling sering dibaca ulang orang.',
      ),
      callout(
        'info',
        'Early return membuat keempat keadaan terbaca berurutan',
        'Bandingkan dengan satu blok JSX berisi ternary bertingkat — versi ini bisa dibaca dari atas ke bawah, dan menambah keadaan kelima tidak menyentuh yang lain. Ini penerapan langsung dari sub-bab 1.5 Frontend Basic.',
      ),

      h2('Skeleton harus memesan ruang'),
      code(
        'tsx',
        `
        // SALAH: tinggi berubah saat data datang — halaman melompat
        {memuat ? <p>Memuat…</p> : <Daftar items={items} />}

        // BENAR: skeleton setinggi hasil akhirnya
        {memuat
          ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 animate-pulse rounded-md bg-raised" />)
          : items.map((i) => <Baris key={i.id} item={i} />)}
        `,
      ),
      p(
        'Perbedaannya bukan soal estetika. Versi SALAH menampilkan teks "Memuat…" yang tingginya jauh lebih pendek daripada daftar isi yang akan menggantikannya — begitu datanya tiba, seluruh konten di bawahnya **melompat turun** karena tinggi elemen berubah drastis. Versi BENAR merender lima kotak abu-abu (`Array.from({ length: 5 }, ...)` membuat lima elemen tanpa perlu data sungguhan) yang tingginya (`h-16`) dibuat mendekati tinggi satu baris data aslinya, sehingga saat data sungguhan menggantikannya, tinggi totalnya tidak banyak berubah dan halaman tidak melompat.',
      ),

      h2('Menyembunyikan vs tidak merender'),
      code(
        'tsx',
        `
        <div className={terbuka ? '' : 'hidden'}>{isi}</div>
        // Tetap dirender: state di dalamnya bertahan, gambarnya tetap diunduh

        {terbuka && <div>{isi}</div>}
        // Tidak dirender: state di dalamnya HILANG saat ditutup
        `,
      ),
      p(
        'Keduanya benar untuk kasus berbeda. Untuk tab yang isinya berat, `hidden` mempertahankan posisi scroll dan isian form. Untuk modal, tidak merender lebih tepat — supaya keadaannya bersih setiap kali dibuka.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar pesanan harus menampilkan lima keadaan yang berbeda, yaitu sedang memuat pertama kali, sedang memuat ulang setelah filter diganti, gagal, kosong karena filter terlalu sempit, dan kosong karena memang belum ada pesanan. Ditulis dengan ternary bersarang, hasilnya satu ekspresi sepanjang empat puluh baris yang tidak seorang pun berani ubah.',
      ),
      p(
        'Ini persis masalah yang sama dengan piramida `if` di Bab 1 Frontend Basic, dan jalan keluarnya juga sama, yaitu keluar lebih awal untuk tiap keadaan.',
      ),
      compare(
        {
          title: 'Ternary bersarang',
          lang: 'tsx',
          code: `
          return (
            <div>
              {memuat ? (
                <Skeleton />
              ) : galat ? (
                <PesanGagal galat={galat} />
              ) : data.length === 0 ? (
                adaFilter ? (
                  <KosongKarenaFilter />
                ) : (
                  <BelumAdaData />
                )
              ) : (
                <Daftar data={data} />
              )}
            </div>
          );
          `,
          notes: ['Menambah keadaan keenam berarti membongkar seluruh susunannya'],
        },
        {
          title: 'Keluar lebih awal',
          lang: 'tsx',
          code: `
          if (memuat && data.length === 0) return <Skeleton />;
          if (galat) return <PesanGagal galat={galat} onCobaLagi={muat} />;

          if (data.length === 0) {
            return adaFilter
              ? <KosongKarenaFilter onBersihkan={bersihkan} />
              : <BelumAdaData onBuat={keFormBaru} />;
          }

          return (
            <div aria-busy={memuat}>
              <Daftar data={data} />
            </div>
          );
          `,
          notes: ['Tiap keadaan dan hasilnya bersebelahan, dan urutannya terbaca dari atas'],
        },
      ),
      p(
        'Syarat pertama di kolom kanan sengaja berbunyi `memuat && data.length === 0`, bukan sekadar `memuat`. Ini menutup masalah pengalaman yang sudah dibahas di Bab 5 Frontend Basic, yaitu menampilkan skeleton penuh saat filter diganti membuat daftar yang sudah ada lenyap dan layar berkedip. Dengan syarat itu, skeleton hanya muncul pada pemuatan pertama, dan pemuatan ulang ditandai `aria-busy` tanpa membuang isinya.',
      ),
      p(
        'Urutan pemeriksaannya juga menentukan. Galat diperiksa sebelum kosong, sebab daftar yang gagal dimuat memang panjangnya nol dan tanpa urutan itu pengguna akan melihat pesan belum ada data padahal yang terjadi gangguan. Ini kesalahan yang sangat sering, dan ia hanya muncul saat server sedang bermasalah sehingga jarang tertangkap saat pengujian.',
      ),
      code(
        'tsx',
        `
        // Untuk banyak kemungkinan yang setara, tabel lebih terbaca daripada rantai ternary.
        const LENCANA: Record<StatusPesanan, { label: string; warna: string }> = {
          menunggu: { label: 'Menunggu bayar', warna: 'kuning' },
          lunas: { label: 'Lunas', warna: 'hijau' },
          dikirim: { label: 'Dikirim', warna: 'biru' },
          batal: { label: 'Dibatalkan', warna: 'abu' },
        };

        function Lencana({ status }: { status: StatusPesanan }) {
          const info = LENCANA[status];
          // Kalau status baru ditambahkan di server tapi belum di sini.
          if (!info) return <span className="lencana lencana-abu">{status}</span>;

          return <span className={\`lencana lencana-\${info.warna}\`}>{info.label}</span>;
        }
        `,
        { filename: 'src/pesanan/Lencana.tsx' },
      ),
      p(
        'Pola tabel ini sudah muncul di Bab 2 Frontend Basic sebagai pengganti rantai `if`, dan di React ia sama bergunanya. Menambah status kelima berarti menambah satu baris di object, bukan menyunting rantai percabangan. Karena `Record<StatusPesanan, ...>` mengharuskan seluruh anggota union ada, lupa menambahkan status baru akan ditolak TypeScript sebelum dijalankan.',
      ),
      p(
        'Penjaga `if (!info)` tetap diperlukan meskipun tipenya sudah menjamin kelengkapan. Alasannya, data dari server tidak tunduk pada tipe TypeScript seperti dibahas di Bab 6 Frontend Basic. Kalau server suatu hari mengirim status yang belum dikenal, tanpa penjaga itu halaman akan melempar. Dengan penjaga, ia menampilkan status mentahnya dan halaman tetap berguna.',
      ),
      callout(
        'tip',
        'Aturan memilih bentuk percabangan di React',
        'Dua kemungkinan yang salah satunya kosong, pakai `&&` dengan sisi kiri boolean. Dua kemungkinan yang keduanya ada, pakai ternary. Tiga atau lebih keadaan tampilan, pakai `return` lebih awal. Banyak kemungkinan yang setara dan hanya berbeda nilainya, pakai tabel object.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React sungguhan, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        const item = [];
        <div>{item.length && <Badge jumlah={item.length} />}</div>

        // Hasil render: <div>0</div>
        `,
        { caption: 'Angka nol dirender, sedangkan `false` dan `null` tidak.' },
      ),
      p(
        "Sudah dibahas di Bab 6 Frontend Basic dan diulang di sini karena inilah tempatnya paling sering muncul, yaitu percabangan berdasarkan panjang daftar. Diuji dengan React sungguhan, `render(0, '', false, null, undefined, 'akhir')` menghasilkan `0akhir`, yang membuktikan hanya angka dan teks yang dirender. Bandingkan lebih dulu supaya sisi kiri `&&` benar-benar boolean.",
      ),
      code(
        'text',
        `
        if (galat) return <PesanGagal />;
        if (data.length === 0) return <BelumAdaData />;

        // Server sedang mati. Pengguna melihat "Belum ada data".
        `,
        { caption: 'Urutan pemeriksaan terbalik, dan tidak ada error apa pun.' },
      ),
      p(
        'Contoh di atas justru urutannya sudah benar, dan ditampilkan untuk menunjukkan seperti apa kegagalannya kalau dibalik. Kalau `data.length === 0` diperiksa lebih dulu, daftar yang gagal dimuat akan tertangkap di sana sebab panjangnya memang nol. Pengguna menyimpulkan datanya hilang, dan kamu kehilangan satu-satunya tanda bahwa ada gangguan. Periksa kegagalan lebih dulu, selalu.',
      ),
      code(
        'text',
        `
        {kondisi && <Kartu />}
        {!kondisi && <Kosong />}

        // Bekerja, dan keduanya dievaluasi tiap render.
        // Kalau salah satu syaratnya diubah, yang lain bisa lupa disesuaikan.
        `,
        { caption: 'Bukan error, dan dua syarat yang harus dijaga tetap berlawanan.' },
      ),
      p(
        'Menulis dua `&&` yang syaratnya berlawanan menciptakan dua sumber kebenaran untuk satu keputusan. Kalau nanti syaratnya berubah menjadi lebih rumit, misalnya menambah satu kondisi, ada kemungkinan hanya satu yang disesuaikan. Hasilnya keadaan di mana keduanya tampil atau keduanya hilang. Pakai ternary supaya keputusannya tertulis sekali.',
      ),
      code(
        'text',
        `
        {daftar.map((d) => d.aktif && <Baris key={d.id} data={d} />)}

        Warning: Each child in a list should have a unique "key" prop.
        `,
        { caption: 'Sebagian anggota menghasilkan `false`, dan peringatannya tetap muncul.' },
      ),
      p(
        'Contoh ini punya `key` dan peringatannya tetap muncul pada sebagian versi, sebab hasil `map` berisi campuran elemen dan `false`. Bentuk yang lebih bersih adalah menyaring lebih dulu dengan `filter` lalu memetakan, dan itu juga lebih terbaca. Menyaring di dalam `map` mengerjakan dua hal sekaligus, dan hasilnya array yang panjangnya sama dengan aslinya tapi sebagian isinya kosong.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Angka `0` muncul di halaman',
            '`&&` dengan sisi kiri berupa angka',
            'Bandingkan lebih dulu, misalnya `arr.length > 0 &&`',
          ],
          [
            'Pesan belum ada data muncul saat server bermasalah',
            'Kekosongan diperiksa sebelum kegagalan',
            'Periksa galat lebih dulu',
          ],
          [
            'Dua bagian tampil bersamaan atau keduanya hilang',
            'Dua `&&` dengan syarat berlawanan yang tidak sinkron',
            'Pakai satu ternary',
          ],
          [
            'Peringatan `key` pada `map` yang sudah punya `key`',
            'Hasilnya campuran elemen dan `false`',
            'Saring dengan `filter` lebih dulu, baru petakan',
          ],
          [
            'Layar berkedip saat filter diganti',
            'Skeleton ditampilkan walaupun sudah ada data',
            'Tampilkan skeleton hanya saat data masih kosong',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Percabangan tampilan adalah tempat keadaan yang tidak dipikirkan paling sering lolos ke produksi, sebab keadaan gagal dan kosong jarang muncul saat mengembangkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis jalur sukses lebih dulu, sisanya menyusul',
            'Itu yang paling penting',
            'Keadaan memuat, kosong, dan gagal menjadi tambalan yang tidak konsisten. Tulis keempatnya sejak awal',
          ],
          [
            'Memakai satu pesan kosong untuk semua sebab',
            'Sama-sama tidak ada data',
            'Pengguna tidak tahu apakah harus melonggarkan filter atau membuat data pertamanya',
          ],
          [
            'Memakai `&&` untuk semua percabangan',
            'Lebih pendek daripada ternary',
            'Nilai `0` dan teks kosong ikut dirender, dan untuk dua kemungkinan yang keduanya ada ia tidak cukup',
          ],
          [
            'Menumpuk ternary untuk lebih dari dua keadaan',
            'Semuanya jadi di satu ekspresi',
            'Termasuk bentuk yang paling sulit dibaca dan diubah. Pakai `return` lebih awal',
          ],
          [
            'Menyembunyikan elemen dengan CSS alih-alih tidak merendernya',
            'Lebih cepat berpindah',
            'Elemen yang tersembunyi tetap ada di DOM, tetap bisa difokus keyboard, dan tetap dibaca pembaca layar. Untuk hal yang benar-benar tidak berlaku, jangan render sama sekali',
          ],
          [
            'Memeriksa kekosongan sebelum kegagalan',
            'Urutannya terasa alami',
            'Daftar yang gagal dimuat panjangnya juga nol, sehingga gangguan tampil sebagai kekosongan',
          ],
        ],
      ),
      p(
        'Baris kelima punya konsekuensi aksesibilitas yang sering tidak disadari. Elemen yang disembunyikan dengan `display: none` memang tidak terlihat dan tidak dibaca pembaca layar, tapi elemen yang disembunyikan dengan `opacity` atau posisi di luar layar tetap bisa difokus dengan Tab. Pengguna keyboard akan menemukan fokusnya berpindah ke tempat yang tidak terlihat. Kalau sesuatu tidak berlaku, jangan render.',
      ),
      callout(
        'info',
        'Empat keadaan itu bukan aturan React melainkan aturan project ini',
        'Baseline frontend project ini mewajibkan tiap tampilan yang mengambil data punya keadaan memuat, kosong, galat, dan sukses. React hanya menyediakan caranya. Yang menentukan apakah keempatnya ada adalah disiplin menulisnya, dan cara termurah menjaganya adalah menulis keempatnya sebelum jalur suksesnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`length > 0 &&`, bukan `length &&` — `0` tetap dirender.',
        'Early return membuat empat keadaan UI terbaca berurutan.',
        'Skeleton harus memesan tinggi akhirnya supaya layout tidak melompat.',
        '`hidden` mempertahankan state; tidak merender menghapusnya.',
      ),
      references(
        {
          label: 'Conditional Rendering',
          href: 'https://react.dev/learn/conditional-rendering',
          source: 'React',
          note: 'Ketiga bentuk beserta peringatan resmi tentang jebakan `&&` dengan angka nol.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Menjelaskan kenapa `hidden` mempertahankan state sementara tidak merender menghapusnya.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Anjuran memakai satu nilai berhingga alih-alih beberapa boolean yang bisa bertabrakan.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Alasan skeleton wajib memesan tinggi akhirnya, bukan sekadar menampilkan teks "Memuat…".',
        },
      ),
    ],
  ),

  written(
    'rendering-list',
    'Rendering List & Kenapa `key` Penting',
    23,
    'Menampilkan banyak item dan menjaga identitasnya — sumber bug yang tampak mustahil.',
    [
      terms(
        {
          term: 'key',
          meaning:
            'Penanda **identitas** sebuah elemen di dalam daftar. Perlu ditegaskan apa yang ia **bukan**: ia bukan sekadar syarat formal untuk menghilangkan peringatan console. Ia adalah cara React menjawab pertanyaan "apakah elemen ini masih elemen yang sama seperti tadi?" — dan jawaban itu menentukan apakah state di dalamnya dipertahankan atau dibuang.',
        },
        {
          term: 'identitas',
          meaning:
            'Sesuatu yang **melekat pada data itu sendiri** dan tidak berubah sepanjang hidupnya — biasanya `id` dari database. Bedakan dari **posisi**, yang berubah setiap kali daftar diurutkan, disaring, atau disisipi. Inilah alasan indeks array bukan identitas.',
        },
        {
          term: 'indeks sebagai key',
          meaning:
            'Kesalahan yang gejalanya sangat aneh: teks yang sedang diketik **berpindah ke baris lain**, atau centang menempel di item yang salah setelah daftar diurutkan. Penyebabnya karena React mengira item di posisi 0 masih item yang sama, padahal isinya sudah berganti. Aman **hanya** kalau daftarnya tidak pernah berubah urutan, disaring, maupun disisipi.',
        },
        {
          term: 'unik di antara saudara',
          meaning:
            'Syarat sebenarnya sebuah `key`: ia hanya perlu unik **di dalam daftar yang sama**, bukan unik di seluruh aplikasi. Dua daftar berbeda boleh sama-sama memakai key `1`, dan itu tidak masalah sama sekali.',
        },
        {
          term: 'stabil',
          meaning:
            'Syarat kedua: key harus **sama pada tiap render** untuk item yang sama. Karena itu `key={Math.random()}` adalah kesalahan yang lebih buruk daripada tidak memberi key — setiap render menghasilkan key baru, sehingga React membuang dan membangun ulang seluruh daftar setiap kali.',
        },
        {
          term: 'reconciliation',
          meaning:
            'Proses React mencocokkan elemen lama dengan elemen baru untuk menentukan perubahan seminimal mungkin. `key` adalah **petunjuk utama** yang ia pakai dalam pencocokan itu — tanpa key, ia hanya bisa menebak berdasarkan urutan.',
        },
        {
          term: 'Fragment dengan key',
          meaning:
            'Ketika satu item daftar menghasilkan beberapa elemen sejajar, `<>` biasa tidak bisa diberi key. Pakai bentuk panjangnya: `<Fragment key={t.id}>`. Ini satu-satunya alasan bentuk panjang Fragment masih dibutuhkan.',
        },
        {
          term: 'daftar besar',
          meaning:
            'Daftar dengan ratusan atau ribuan baris. Merendernya sekaligus membuat halaman berat meski React sudah efisien — jalan keluarnya **virtualisasi**, yaitu hanya merender baris yang benar-benar terlihat di layar.',
        },
      ),

      h2('Dasar'),
      code(
        'tsx',
        `
        <ul>
          {tugas.map((t) => (
            <li key={t.id}>{t.judul}</li>
          ))}
        </ul>
        `,
      ),
      p(
        '`key={t.id}` bukan prop biasa yang bisa dibaca `Tugas` — React **mengambilnya sendiri** sebelum komponennya dirender, dan memakainya secara internal sebagai penanda identitas. Karena itu `key` tidak pernah muncul di `props` komponen anak, meski ditulis persis seperti prop lain di JSX.',
      ),

      h2('Apa yang sebenarnya dilakukan `key`'),
      p(
        'Saat daftar berubah, React membandingkan daftar lama dan baru. `key` adalah **identitas** yang dipakainya untuk memutuskan: "ini item yang sama yang berubah isinya" atau "ini item yang berbeda".',
      ),
      code(
        'tsx',
        `
        // Sebelum: [A, B, C]   Sesudah: [Z, A, B, C]

        // Dengan key stabil:
        //   React melihat Z baru -> sisipkan SATU elemen. A, B, C tidak disentuh.

        // Dengan key = indeks:
        //   posisi 0: dulu A, sekarang Z -> "isinya berubah"
        //   posisi 1: dulu B, sekarang A -> "isinya berubah"
        //   posisi 2: dulu C, sekarang B -> "isinya berubah"
        //   posisi 3: baru C             -> sisipkan
        //   -> React mengubah EMPAT elemen, bukan satu
        `,
      ),
      p(
        'Contoh ini menunjukkan biaya `key` yang salah dalam angka. Menyisipkan satu item di depan seharusnya menghasilkan **satu** perubahan, dan dengan key stabil itulah yang terjadi, sebab React mengenali A, B, dan C sebagai item yang sama meski posisinya bergeser sehingga ia cukup menyisipkan Z. Dengan key berupa indeks, React tidak punya cara mengetahui itu, karena yang ia lihat hanyalah bahwa posisi 0 dulu berisi A dan sekarang berisi Z, sehingga ia menyimpulkan **isinya yang berubah**. Empat baris komentar itu adalah kesimpulan yang ia ambil satu per satu, dan hasilnya empat elemen disentuh alih-alih satu. Untuk daftar pendek pemborosan ini tidak terasa, dan yang jauh lebih berbahaya adalah akibat keduanya, yaitu keadaan internal elemen yang ikut tertukar, dan itulah yang diperagakan bagian berikutnya.',
      ),

      h2('Bug yang tampak mustahil'),
      code(
        'tsx',
        `
        // Setiap baris punya input yang belum tersimpan
        {tugas.map((t, i) => (
          <li key={i}>
            <input defaultValue={t.judul} />
            <button onClick={() => hapus(t.id)}>Hapus</button>
          </li>
        ))}
        `,
      ),
      p(
        'Perhatikan `defaultValue` dan bukan `value`, yang artinya isi input itu **tidak dikendalikan React** setelah render pertama, sehingga apa pun yang diketik pengguna hidup di elemen DOM-nya sendiri alih-alih di dalam data. Di situlah letak jebakannya. Selama tidak ada baris yang dihapus atau diurutkan ulang, `key={i}` bekerja tanpa gejala apa pun. Tapi karena identitas baris di sini ditentukan **posisi**, menghapus satu baris membuat semua baris di bawahnya bergeser naik dan mewarisi identitas milik tetangganya, sementara teks yang sudah terlanjur diketik tetap menempel di elemen input yang sama. Hasilnya persis seperti dijelaskan di kotak berikut, yaitu data tetap benar tapi yang terlihat di layar milik item yang berbeda.',
      ),
      callout(
        'danger',
        'Yang terjadi kalau kamu menghapus baris pertama',
        'React mengira baris di posisi 0 "berubah isinya", jadi ia **mempertahankan elemen input yang sama** dan hanya mengganti propsnya. Tapi `defaultValue` hanya dipakai sekali — sehingga teks yang kamu ketik di baris pertama sekarang muncul di baris yang isinya milik item lain. Datanya benar; tampilannya berbohong.',
      ),
      code(
        'tsx',
        `
        {tugas.map((t) => (
          <li key={t.id}>          {/* identitas ikut berpindah bersama itemnya */}
            <input defaultValue={t.judul} />
          </li>
        ))}
        `,
      ),

      h2('Memilih `key`'),
      table(
        ['Sumber', 'Boleh?'],
        [
          ['`item.id` dari database', '**Terbaik**'],
          ['`crypto.randomUUID()` saat item dibuat', 'Baik'],
          ['Gabungan field yang unik', 'Boleh kalau benar-benar unik'],
          [
            'Indeks array',
            'Hanya kalau daftar **tidak pernah** berubah urutan, disisipi, atau disaring',
          ],
          ['`Math.random()`', '**Tidak pernah** — key baru tiap render, semua dibuat ulang'],
        ],
      ),
      callout(
        'warning',
        'Kapan indeks benar-benar aman',
        'Kalau daftarnya statis, tidak pernah diurutkan ulang, tidak pernah disisipi di tengah, dan itemnya tidak punya state internal. Kalau salah satu saja tidak terpenuhi, pakai id.',
      ),

      h2('`key` bersifat lokal'),
      code(
        'tsx',
        `
        // key hanya perlu unik di antara SAUDARANYA, bukan di seluruh aplikasi
        <ul>{a.map((x) => <li key={x.id}>{x.nama}</li>)}</ul>
        <ul>{b.map((x) => <li key={x.id}>{x.nama}</li>)}</ul>   // id yang sama pun tidak masalah
        `,
      ),
      p(
        'React hanya membandingkan `key` di antara elemen-elemen yang **dirender oleh `map` yang sama, dalam wadah yang sama**. Dua `<ul>` yang berbeda adalah dua "ruang lingkup" pencocokan yang terpisah sepenuhnya — kalau `a` dan `b` sama-sama punya item dengan `id: "1"`, React tidak akan pernah menganggap keduanya sebagai elemen yang sama, karena mereka bahkan tidak pernah dibandingkan satu sama lain.',
      ),

      h2('`key` untuk memaksa reset'),
      code(
        'tsx',
        `
        // Mengganti key membuat React MEMBUANG komponen lama dan membuat yang baru,
        // beserta seluruh state di dalamnya
        <FormProfil key={penggunaId} pengguna={pengguna} />

        // Tanpa key: pindah ke pengguna lain akan MEMPERTAHANKAN isian form sebelumnya
        `,
      ),
      p(
        'Ini pemakaian `key` yang berbeda dari semua contoh sebelumnya, yaitu **di luar daftar, pada satu komponen tunggal**. Mekanismenya tetap sama karena `key` adalah identitas, tapi di sini kamu memanfaatkannya secara sengaja. Selama `penggunaId` tidak berubah, React menganggap ini komponen yang sama dan mempertahankan seluruh state di dalamnya. Begitu `penggunaId` berganti, identitasnya berbeda sehingga React **membuang komponen lama beserta semua state-nya** dan membuat yang baru dari nol. Tanpa baris `key`, berpindah ke pengguna lain akan menampilkan form dengan isian milik pengguna sebelumnya, bug yang terlihat mustahil sampai kamu memahami bahwa React memang tidak punya alasan mengira itu form yang berbeda.',
      ),
      callout(
        'tip',
        'Ini teknik yang sah dan sering menyelamatkan',
        'Alih-alih menulis `useEffect` yang mereset lima state saat props berubah, ganti `key`-nya. Satu baris, tanpa efek, dan tidak mungkin ada state yang terlewat direset.',
      ),

      h2('Fragment dengan key'),
      code(
        'tsx',
        `
        import { Fragment } from 'react';

        {items.map((i) => (
          <Fragment key={i.id}>
            <dt>{i.istilah}</dt>
            <dd>{i.arti}</dd>
          </Fragment>
        ))}
        `,
        { caption: 'Bentuk pendek `<>` tidak bisa menerima key.' },
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman keranjang menampilkan daftar barang, dan tiap baris punya kotak jumlah yang bisa diketik. Pengguna mengetik angka di baris ketiga, lalu menghapus baris pertama. Angka yang tadi ia ketik berpindah ke baris lain, dan baris yang seharusnya dihapus justru terlihat masih ada dengan isi yang berbeda. Laporan bugnya berbunyi angkanya kacau kalau menghapus barang, dan penyebabnya satu baris.',
      ),
      code(
        'tsx',
        `
        // Penyebabnya di sini.
        {barang.map((b, i) => (
          <BarisKeranjang key={i} barang={b} />
        ))}
        `,
        { caption: 'Indeks dipakai sebagai `key`.' },
      ),
      p(
        'Bandingkan dengan `Map` id ke elemen yang kamu tulis sendiri di Bab 4 Frontend Basic. Di sana kuncinya adalah id, sehingga menghapus baris pertama tidak mempengaruhi pencocokan baris lain. Kalau kuncinya posisi, menghapus baris pertama membuat baris kedua sekarang berada di posisi nol, sehingga React menyimpulkan baris di posisi nol berubah isinya. Ia mempertahankan elemen DOM beserta seluruh keadaannya, dan hanya mengganti isinya.',
      ),
      code(
        'text',
        `
        Sebelum menghapus:              Sesudah menghapus barang pertama:

        key=0  Kaos    [ 2 ]           key=0  Topi    [ 2 ]  <- isian ikut dari baris lama
        key=1  Topi    [ 1 ]           key=1  Tas     [ 1 ]  <- ikut bergeser
        key=2  Tas     [ 5 ]           (baris terakhir dibuang)

        React menyimpulkan: "key=0 masih ada, isinya berubah dari Kaos jadi Topi."
        Yang dipertahankan: elemen input beserta angka yang diketik pengguna.
        `,
        { caption: 'Isian pengguna melekat pada posisi, bukan pada barangnya.' },
      ),
      p(
        'Diagram itu menjelaskan kenapa gejalanya berupa angka yang berpindah, bukan baris yang hilang. Yang salah bukan datanya melainkan pencocokannya. Data yang dirender sudah benar, yaitu Topi dan Tas, dan yang ikut tertinggal adalah keadaan yang hidup di dalam elemen DOM, yaitu isi kotak input, posisi kursor, dan kelas animasi yang sedang berjalan.',
      ),
      code(
        'tsx',
        `
        // Perbaikannya satu kata.
        {barang.map((b) => (
          <BarisKeranjang key={b.id} barang={b} />
        ))}

        // Kalau datanya belum punya id, buat SAAT DATANYA DIBUAT,
        // bukan saat dirender.
        const barangBaru = { id: crypto.randomUUID(), produkId, jumlah: 1 };
        `,
        { caption: 'Id dibuat di sumber datanya, bukan di dalam render.' },
      ),
      p(
        'Baris terakhir menutup jalan pintas yang sering dipilih orang saat datanya belum punya id, yaitu membuat id di dalam `map`. Bentuk `key={crypto.randomUUID()}` menghasilkan kunci baru pada tiap render, sehingga React menganggap seluruh baris adalah baris baru dan membongkar semuanya setiap kali. Akibatnya jauh lebih buruk daripada memakai indeks, yaitu seluruh state hilang pada tiap render dan performanya anjlok.',
      ),
      code(
        'tsx',
        `
        // Kasus yang lebih rumit: daftar bisa diurutkan dan disaring.
        function DaftarBarang({ barang, urut, cari }: Props) {
          // Hitung DI LUAR JSX, dan jangan mengubah array aslinya.
          const terlihat = barang
            .filter((b) => b.nama.toLowerCase().includes(cari.toLowerCase()))
            .toSorted((a, b) => (urut === 'nama' ? a.nama.localeCompare(b.nama, 'id') : b.hargaSen - a.hargaSen));

          if (terlihat.length === 0) {
            return <p>Tidak ada barang yang cocok</p>;
          }

          return (
            <ul>
              {terlihat.map((b) => (
                <BarisKeranjang key={b.id} barang={b} />
              ))}
            </ul>
          );
        }
        `,
        { filename: 'src/keranjang/DaftarBarang.tsx' },
      ),
      p(
        'Method `toSorted` dipakai alih-alih `sort` karena `sort` mengubah array aslinya, dan array itu adalah props milik induk. Ini pantangan mutasi dari Bab 1 Frontend Basic yang muncul kembali, dan di React akibatnya lebih besar sebab induknya tidak tahu datanya berubah. Kalau kamu terpaksa memakai `sort` pada lingkungan yang belum mendukung `toSorted`, salin dulu dengan `[...barang].sort(...)`.',
      ),
      p(
        'Penyaringan dan pengurutan diletakkan di atas `return`, bukan di dalam JSX, dan itu bukan sekadar keterbacaan. Variabel `terlihat` bisa dipakai untuk memeriksa kekosongan sebelum merender, dan bisa dicetak saat menelusuri bug. Rangkaian panjang yang tertanam di dalam JSX tidak bisa disentuh tanpa mengubah strukturnya.',
      ),
      callout(
        'danger',
        'Indeks sebagai `key` aman hanya kalau tiga syarat ini terpenuhi sekaligus',
        'Daftarnya tidak pernah diurutkan ulang, tidak pernah disisipi atau dihapus di tengah, dan tidak ada satu pun elemen di dalamnya yang menyimpan keadaan. Dalam praktik, ketiganya jarang terpenuhi bersamaan, dan daftar yang hari ini memenuhinya bisa berubah besok. Biasakan memakai id sungguhan sejak awal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React sungguhan, dan hanya satu yang berupa peringatan. Sisanya bekerja diam-diam dengan hasil yang salah.',
      ),
      code(
        'text',
        `
        <ul>{barang.map((b) => <li>{b.nama}</li>)}</ul>

        Warning: Each child in a list should have a unique "key" prop.
        Check the top-level render call using <li>.
        `,
        { caption: '`key` tidak diberikan sama sekali.' },
      ),
      p(
        'Peringatan ini menyebut elemen mana yang bermasalah lewat kalimat `Check the top-level render call using <li>`, dan itu berguna saat ada beberapa `map` di satu komponen. Yang perlu diingat, `key` dipasang pada elemen **terluar** yang dihasilkan `map`, bukan di dalamnya. Kalau `map` mengembalikan fragment, kamu butuh bentuk panjang `<Fragment key={...}>` yang perlu diimpor.',
      ),
      code(
        'text',
        `
        {barang.map((b) => <Baris key={b.produkId} barang={b} />)}

        Warning: Encountered two children with the same key, \`7\`.
        Keys should be unique so that components maintain their identity
        across updates.
        `,
        { caption: 'Dua barang berbeda punya `produkId` yang sama.' },
      ),
      p(
        'Ini terjadi saat kunci yang dipilih tidak benar-benar unik dalam daftar itu, misalnya keranjang yang memuat produk sama dengan varian berbeda. Pesannya menyebut nilai kunci yang bentrok, sehingga kamu langsung tahu data mana yang bermasalah. Perbaikannya memakai kunci yang benar-benar unik, misalnya id baris keranjang, atau menggabungkan dua field menjadi satu kunci.',
      ),
      code(
        'text',
        `
        {barang.map((b) => <Baris key={crypto.randomUUID()} barang={b} />)}

        // Tidak ada peringatan. Seluruh baris dibongkar dan dibangun ulang
        // pada SETIAP render.
        `,
        { caption: 'Kunci acak baru pada tiap render, dan tidak ada tanda apa pun.' },
      ),
      p(
        'Ini bentuk yang paling merugikan sekaligus paling sulit dikenali, sebab peringatan `key` justru hilang. Gejalanya berupa kotak input yang kehilangan fokus pada tiap ketikan, animasi yang selalu memulai dari awal, dan halaman yang terasa berat pada daftar panjang. Kalau daftar terasa aneh dan tidak ada satu pun peringatan, periksa apakah kuncinya dibuat di dalam render.',
      ),
      code(
        'text',
        `
        function Daftar({ barang }) {
          barang.sort((a, b) => a.nama.localeCompare(b.nama));
          return <ul>{barang.map((b) => <li key={b.id}>{b.nama}</li>)}</ul>;
        }

        // Tidak ada error. Array milik induk ikut terurut permanen.
        `,
        { caption: '`sort` mengubah props di tempat.' },
      ),
      p(
        'Selain melanggar pantangan mutasi, ini punya akibat khas React yang lebih membingungkan. Pada `StrictMode` yang menjalankan render dua kali di pengembangan, pengurutan berjalan dua kali pada array yang sama. Untuk pengurutan itu hasilnya sama, dan untuk operasi seperti `reverse` hasilnya berbeda antar-render sehingga tampilannya berkedip. Pakai `toSorted` atau salin dulu.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Each child in a list should have a unique "key" prop`',
            '`key` tidak diberikan',
            'Beri `key` pada elemen terluar hasil `map`',
          ],
          [
            '`Encountered two children with the same key`',
            'Kunci yang dipilih tidak unik dalam daftar itu',
            'Pakai id baris, atau gabungkan dua field',
          ],
          [
            'Fokus hilang tiap ketikan tanpa satu pun peringatan',
            'Kunci dibuat acak di dalam render',
            'Buat id saat data dibuat, bukan saat dirender',
          ],
          [
            'Isian input berpindah baris setelah menghapus',
            'Indeks dipakai sebagai `key`',
            'Pakai id yang melekat pada datanya',
          ],
          [
            'Data induk ikut terurut permanen',
            '`sort` mengubah props di tempat',
            'Pakai `toSorted`, atau salin dengan spread',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Merender daftar terlihat sebagai bagian paling sederhana dari React, dan ia sekaligus tempat bug keadaan yang paling sulit ditelusuri berasal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai indeks sebagai `key`',
            'Indeksnya unik dan sudah tersedia',
            'Ia menyatakan posisi bukan identitas. Keadaan di dalam baris berpindah begitu daftar diurutkan atau dihapus',
          ],
          [
            'Membuat id acak di dalam `map`',
            'Setidaknya kuncinya unik',
            'Kunci berubah tiap render, sehingga seluruh baris dibongkar setiap kali. Lebih buruk daripada indeks',
          ],
          [
            'Memakai `sort` atau `reverse` pada props',
            'Datanya kan sudah ada',
            'Mengubah data milik induk yang tidak tahu perubahannya, dan berperilaku aneh pada `StrictMode`',
          ],
          [
            'Menyaring di dalam `map` dengan `&&`',
            'Hemat satu langkah',
            'Hasilnya array berisi campuran elemen dan `false`. Pakai `filter` lebih dulu',
          ],
          [
            'Memasang `key` pada elemen di dalam, bukan yang terluar',
            'Yang penting ada `key`-nya',
            '`key` harus pada elemen terluar yang dihasilkan `map`. Kalau terluarnya fragment, pakai bentuk panjangnya',
          ],
          [
            'Merender ribuan baris sekaligus',
            'Datanya memang sebanyak itu',
            'Peramban harus membuat ribuan elemen DOM. Pakai paginasi, atau daftar tervirtualisasi untuk yang benar-benar panjang',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan karena ia sering dipilih justru sebagai perbaikan atas baris pertama. Orang membaca bahwa indeks buruk lalu menggantinya dengan nilai acak, dan hasilnya lebih buruk. Yang dicari `key` bukan keunikan melainkan **kestabilan**, yaitu nilai yang sama untuk data yang sama di seluruh render. Id yang dibuat saat data lahir memenuhi keduanya.',
      ),
      callout(
        'tip',
        'Cara memeriksa apakah `key`-mu benar',
        'Tanyakan apakah nilai kunci sebuah baris akan tetap sama setelah daftarnya diurutkan, disaring, dan ada yang dihapus di tengah. Kalau ya, kuncinya benar. Kalau nilainya bergantung pada posisi atau dibuat ulang tiap render, itulah penyebab bug yang sedang kamu telusuri.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`key` adalah identitas yang dipakai React untuk mencocokkan item lama dan baru.',
        'Indeks sebagai key membuat state internal berpindah ke baris yang salah.',
        'Pakai id yang ikut berpindah bersama itemnya.',
        '`key` hanya perlu unik di antara saudaranya.',
        'Mengganti `key` adalah cara bersih memaksa reset seluruh state komponen.',
      ),
      references(
        {
          label: 'Rendering Lists',
          href: 'https://react.dev/learn/rendering-lists',
          source: 'React',
          note: 'Bagian "Why does React need keys?" — penjelasan resmi paling langsung soal identitas.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Termasuk teknik mengganti `key` untuk memaksa reset seluruh state komponen.',
        },
        {
          label: '<Fragment> (<>)',
          href: 'https://react.dev/reference/react/Fragment',
          source: 'React',
          note: 'Kapan bentuk panjangnya wajib dipakai — yaitu saat butuh `key`.',
        },
        {
          label: 'react/jsx-key',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Aturan yang ditegakkan lint untuk menangkap daftar tanpa `key` sebelum sampai ke browser.',
        },
      ),
    ],
  ),

  written(
    'styling-react',
    'Styling di React',
    20,
    'Beberapa pendekatan, dan kriteria memilih yang tidak berdasarkan selera.',
    [
      terms(
        {
          term: 'CSS Module',
          meaning:
            'Berkas CSS biasa berakhiran `.module.css` yang **nama class-nya diacak otomatis** saat build, sehingga mustahil bertabrakan dengan berkas lain. Kelebihannya: kamu menulis CSS biasa. Kekurangannya: setiap komponen jadi butuh dua berkas yang harus dibuka bergantian.',
        },
        {
          term: 'scoping',
          meaning:
            'Terjemahannya **pembatasan jangkauan**. Jaminan bahwa style sebuah komponen **tidak bisa bocor** ke komponen lain. Ini masalah inti yang dipecahkan semua pendekatan di sub-bab ini — masing-masing dengan cara berbeda.',
        },
        {
          term: 'CSS-in-JS',
          meaning:
            'Pendekatan menulis style di dalam berkas JavaScript, seperti styled-components dan Emotion. Sempat sangat populer, kini banyak ditinggalkan karena **biaya saat program berjalan**: style harus dihitung dan disisipkan di browser, dan itu bertabrakan dengan Server Component yang berjalan tanpa browser sama sekali.',
        },
        {
          term: 'runtime cost',
          meaning:
            'Terjemahannya **biaya saat berjalan**. Pekerjaan yang harus dilakukan browser **setiap kali** halaman dibuka. Tailwind dan CSS Module memindahkan hampir seluruh pekerjaannya ke tahap build, sehingga biaya ini nyaris nol.',
        },
        {
          term: 'zero-runtime',
          meaning:
            'Terjemahannya **tanpa biaya saat berjalan**. Sebutan untuk pendekatan yang menghasilkan CSS statis di tahap build. Ini yang membuat Tailwind dan CSS Module tetap bekerja mulus di Server Component, sementara CSS-in-JS klasik tidak.',
        },
        {
          term: 'CSS global',
          meaning:
            'Berkas CSS yang berlaku untuk **seluruh aplikasi**. Bukan berarti selalu salah — reset, token, dan gaya dasar elemen memang tempatnya di sini. Yang bermasalah adalah menaruh style **komponen** di dalamnya, karena di situlah tabrakan nama dan CSS mati bermula.',
        },
        {
          term: 'clsx / cn',
          meaning:
            'Fungsi pembantu untuk **menyusun nama class secara bersyarat**: `cn("dasar", aktif && "bg-primary")`. Menggantikan penyambungan teks manual yang mudah menghasilkan spasi ganda atau kata `false` yang ikut masuk ke atribut.',
        },
        {
          term: 'kriteria memilih',
          meaning:
            'Sub-bab ini menolak memilih berdasarkan selera. Tiga pertanyaan yang menentukan: apakah project sudah punya pilihan (**ikuti yang ada**), apakah kamu memakai Server Component (**hindari CSS-in-JS**), dan apakah timnya lebih nyaman dengan CSS biasa (**CSS Module masuk akal**).',
        },
      ),

      h2('Pilihan yang ada'),
      table(
        ['Pendekatan', 'Kelebihan', 'Kekurangan'],
        [
          ['**Tailwind**', 'Tidak ada penamaan, style ikut komponen', 'Markup panjang'],
          ['**CSS Module**', 'CSS biasa, scope otomatis', 'Dua berkas per komponen'],
          ['**CSS-in-JS**', 'Style dinamis dari props', 'Biaya runtime, banyak yang ditinggalkan'],
          ['**CSS global**', 'Sederhana', 'Tabrakan nama, tidak bisa dihapus dengan yakin'],
        ],
      ),

      h2('CSS Module'),
      code(
        'css',
        `
        .kartu { border: 1px solid var(--color-border); padding: 1rem; }
        .aktif { border-color: var(--color-primary); }
        `,
        { filename: 'Kartu.module.css' },
      ),
      code(
        'tsx',
        `
        import gaya from './Kartu.module.css';

        <div className={\`\${gaya.kartu} \${aktif ? gaya.aktif : ''}\`} />
        // Nama class jadi unik saat build: 'Kartu_kartu__x7f2a'
        `,
      ),
      p(
        "Yang membuat CSS Module berbeda dari CSS biasa: `import gaya from './Kartu.module.css'` tidak mengimpor style-nya secara langsung, melainkan mengimpor sebuah **objek** yang tiap propertinya adalah nama class asli yang dipetakan ke nama unik hasil build (`gaya.kartu` berisi string seperti `'Kartu_kartu__x7f2a'`). Karena nama aslinya (`.kartu`, `.aktif`) hanya berlaku di dalam berkas ini, dua komponen berbeda boleh sama-sama punya class bernama `.kartu` tanpa pernah bertabrakan — inilah yang dimaksud \"scope otomatis\" di tabel sebelumnya, menyelesaikan masalah tabrakan nama yang dimiliki CSS global.",
      ),

      h2('Class kondisional'),
      code(
        'tsx',
        `
        import { clsx } from 'clsx';

        <div
          className={clsx(
            'rounded-md border p-4',
            aktif && 'border-primary',
            nonaktif && 'opacity-50',
            { 'bg-danger-fill': gagal },
          )}
        />
        `,
      ),
      p(
        "`clsx` menyelesaikan pekerjaan yang tampak sepele tapi berantakan kalau ditulis tangan, yaitu menggabungkan beberapa class sambil melewati yang tidak berlaku **tanpa meninggalkan spasi ganda atau kata `false` di dalam atribut**. Ia menerima tiga bentuk masukan sekaligus, dan ketiganya terlihat di contoh. Ada string biasa untuk class yang selalu ada, lalu `kondisi && 'kelas'` yang menghasilkan `false` saat tidak berlaku dan diabaikan `clsx`, serta objek `{ 'kelas': kondisi }` yang berguna saat nama classnya lebih enak dibaca di depan. Bandingkan dengan merangkai template literal sendiri, karena di sana kamu harus mengurus spasi pemisah dan mengubah `false` menjadi string kosong secara manual, dan satu yang terlewat menghasilkan atribut `class` yang cacat.",
      ),
      callout(
        'danger',
        'Nama class yang disusun dinamis tidak akan terdeteksi Tailwind',
        'Tailwind memindai **teks sumber**, bukan menjalankan kodemu. `bg-${warna}-500` tidak pernah muncul sebagai teks utuh, jadi class-nya tidak pernah dihasilkan. Pakai peta berisi nama lengkap.',
      ),
      code(
        'tsx',
        `
        const WARNA = {
          sukses: 'bg-accent-fill text-accent',
          gagal: 'bg-danger-fill text-danger',
        } as const;

        <div className={WARNA[status]} />
        `,
      ),
      p(
        "Solusinya membalik arah pencarian: alih-alih **menyusun** nama class dari variabel (`bg-${warna}-500`, yang gagal terdeteksi), tulis **seluruh** nama class lengkap di objek `WARNA`, lalu pilih string mana yang dipakai lewat `WARNA[status]`. Karena `'bg-accent-fill text-accent'` muncul utuh sebagai teks di berkas sumber, Tailwind menemukannya saat memindai — meski nilai yang dipilih saat runtime tergantung `status`.",
      ),

      h2('Style inline: hanya untuk nilai yang dihitung'),
      code(
        'tsx',
        `
        // Tepat — nilainya baru diketahui saat berjalan
        <div style={{ width: \`\${persen}%\` }} />
        <div style={{ transform: \`translateY(\${offset}px)\` }} />

        // Tidak tepat — ini milik CSS
        <div style={{ padding: 16, borderRadius: 8, color: '#666' }} />
        `,
      ),
      p(
        "Pembeda kedua kelompok ini sama seperti di Bab 4, yaitu **apakah nilainya bisa diketahui saat CSS ditulis.** `persen` dan `offset` baru ada saat program berjalan, dan kamu tidak mungkin membuat class untuk setiap kemungkinan angka, jadi style inline memang jawabannya. Tiga nilai di kelompok bawah sebaliknya bisa ditulis di CSS, dan menaruhnya inline menimbulkan tiga kerugian sekaligus. Ia tidak ikut berubah di mode gelap, tidak bisa di-override lewat media query, dan yang paling merusak, `'#666'` yang ditulis langsung memotong design token sehingga warna itu tidak akan pernah ikut berubah saat palet project diperbarui. Ini penerapan langsung dari aturan terakhir di daftar kriteria, bahwa apa pun sistem styling yang dipilih, nilai warna dan spacing tetap harus terkunci di token.",
      ),

      h2('Kriteria memilih'),
      ol(
        '**Ikuti yang sudah dipakai project.** Konsistensi mengalahkan preferensi — dua sistem styling dalam satu project adalah yang terburuk.',
        '**Project baru:** Tailwind kalau kamu nyaman dengan utility; CSS Module kalau tim lebih kuat di CSS.',
        '**Hindari CSS-in-JS runtime** di project baru — banyak yang beralih karena biaya runtime dan ketidakcocokan dengan Server Component.',
        '**Apa pun pilihannya, kunci token.** Nilai warna dan spacing yang tersebar adalah masalah yang sama di sistem mana pun.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim mulai dengan gaya inline karena paling cepat. Tiga bulan kemudian ada permintaan menambahkan tema gelap, dan ternyata warna tersebar di seratus dua puluh berkas komponen. Tim kedua mulai dengan berkas CSS global, dan setelah setahun tidak ada yang berani menghapus satu aturan pun karena tidak tahu siapa yang memakainya. Keduanya masalah yang sama, yaitu tidak ada batas antara keputusan visual dan kode komponen.',
      ),
      p(
        'Empat pendekatan yang umum dipakai, dan yang membedakan bukan mana yang paling modern melainkan di mana batasnya berada.',
      ),
      table(
        ['Pendekatan', 'Di mana warnanya diputuskan', 'Kapan paling cocok'],
        [
          [
            'Gaya inline',
            'Di dalam komponen',
            'Nilai yang benar-benar dihitung saat berjalan, misalnya posisi',
          ],
          ['CSS Modules', 'Berkas CSS per komponen', 'Project tanpa pustaka gaya, batasnya jelas'],
          [
            'Tailwind',
            'Berkas token, dipakai lewat kelas',
            'Yang dipakai project ini, konsisten dan tanpa penamaan',
          ],
          [
            'CSS-in-JS',
            'Di dalam berkas komponen',
            'Jarang diperlukan, dan menambah biaya saat berjalan',
          ],
        ],
        'Ketiganya sah. Yang tidak sah adalah menyebar nilai warna ke seluruh komponen.',
      ),
      code(
        'tsx',
        `
        // Yang SALAH: nilai visual tersebar di JavaScript.
        <div style={{
          backgroundColor: aktif ? '#2563eb' : '#e5e7eb',
          color: aktif ? '#ffffff' : '#374151',
          padding: '8px 16px',
          borderRadius: '6px',
        }}>
          {label}
        </div>
        `,
        { filename: 'Sebelum' },
      ),
      code(
        'tsx',
        `
        // Yang BENAR: komponen menyatakan KEADAAN, CSS memutuskan tampilannya.
        <div className={\`chip \${aktif ? 'chip-aktif' : ''}\`}>{label}</div>

        // Atau dengan atribut data, yang lebih enak dibaca di DevTools:
        <div className="chip" data-aktif={aktif || undefined}>{label}</div>
        `,
        { filename: 'Sesudah' },
      ),
      p(
        'Bentuk `data-aktif={aktif || undefined}` punya satu detail yang layak diperhatikan. Nilai `undefined` membuat React **menghapus** atributnya, sedangkan `false` akan menghasilkan `data-aktif="false"` yang tetap ada di DOM. Karena pemilih CSS `[data-aktif]` mencocokkan keberadaan atributnya, membiarkan `false` berarti gayanya selalu berlaku. Ini persis jebakan atribut boolean dari Bab 4 Frontend Basic.',
      ),
      code(
        'tsx',
        `
        // Gaya inline TETAP tepat untuk nilai yang dihitung saat berjalan.
        function BilahKemajuan({ persen }: { persen: number }) {
          const aman = Math.min(100, Math.max(0, persen));
          return (
            <div className="bilah" role="progressbar" aria-valuenow={aman}>
              {/* Nilai ini mustahil ditulis sebagai kelas CSS. */}
              <div className="bilah-isi" style={{ width: \`\${aman}%\` }} />
            </div>
          );
        }
        `,
        { filename: 'src/ui/BilahKemajuan.tsx' },
      ),
      p(
        'Inilah batas yang tepat untuk gaya inline, yaitu nilai yang benar-benar tidak bisa diketahui sebelum program berjalan. Lebar bilah kemajuan bergantung pada angka yang berubah terus, sehingga tidak mungkin dinyatakan sebagai kelas. Sebaliknya warna dan bentuk bilahnya tetap di CSS, sebab keduanya keputusan visual yang tidak bergantung pada data.',
      ),
      p(
        'Perhatikan `Math.min(100, Math.max(0, persen))` yang membatasi nilainya. Tanpa itu, nilai 150 menghasilkan lebar 150 persen yang meluber keluar wadahnya, dan nilai negatif menghasilkan CSS yang tidak sah. Data yang datang dari perhitungan atau dari server tidak dijamin berada dalam rentang yang kamu harapkan, dan membatasinya di tempat pemakaian jauh lebih murah daripada menelusuri tata letak yang rusak.',
      ),
      callout(
        'warning',
        'Gaya inline mengalahkan seluruh aturan CSS, dan itu sering merugikan',
        'Nilai yang ditulis lewat `style` punya kekhususan tertinggi, sehingga tidak bisa ditimpa oleh kelas mana pun tanpa `!important`. Untuk komponen yang dipakai banyak tempat, ini berarti pemanggil kehilangan kemampuan menyesuaikan tampilannya. Simpan gaya inline hanya untuk nilai yang dihitung, dan biarkan sisanya bisa ditimpa.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React sungguhan, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        <div style="color: red" />

        Error: The \`style\` prop expects a mapping from style properties to
        values, not a string. For example, style={{marginRight: spacing + 'em'}}
        when using JSX.
        `,
        { caption: 'Gaya inline ditulis sebagai teks CSS.' },
      ),
      p(
        'React melempar alih-alih mengabaikan, dan pesannya bahkan menyertakan contoh bentuk yang benar. Perhatikan kurung kurawal ganda pada bentuk yang benar bukan sintaks khusus, melainkan satu pasang untuk menyisipkan ekspresi dan satu pasang untuk object di dalamnya. Nama properti bertanda hubung ditulis dengan huruf kapital di tengah, jadi `margin-right` menjadi `marginRight`.',
      ),
      code(
        'text',
        `
        <div style={{ width: 100 }} />

        // Bekerja, dan menghasilkan width: 100px.

        <div style={{ lineHeight: 100 }} />

        // Juga bekerja, dan menghasilkan line-height: 100 TANPA satuan.
        `,
        {
          caption: 'React menambahkan `px` untuk sebagian properti dan tidak untuk sebagian lain.',
        },
      ),
      p(
        'Perilaku ini berbeda dari DOM biasa yang mengabaikan angka tanpa satuan sepenuhnya, seperti dibahas di Bab 4 Frontend Basic. React menambahkan `px` otomatis untuk properti yang memang berukuran, dan membiarkan apa adanya untuk properti tanpa satuan seperti `lineHeight`, `opacity`, `zIndex`, dan `flexGrow`. Kemudahan ini menyenangkan sampai kamu butuh satuan lain, dan untuk itu nilainya harus ditulis sebagai teks.',
      ),
      code(
        'text',
        `
        <div className="chip" data-aktif={false} />

        // Hasil: <div class="chip" data-aktif="false">
        // Pemilih [data-aktif] tetap cocok, dan gayanya berlaku.
        `,
        { caption: 'Nilai `false` pada atribut data tetap menghasilkan atributnya.' },
      ),
      p(
        'React menghapus atribut hanya untuk nilai `false` pada atribut boolean HTML yang sungguhan seperti `disabled`, dan atribut `data-` bukan termasuk itu. Untuk atribut data, gunakan `undefined` supaya benar-benar dihapus. Bentuk `data-aktif={aktif || undefined}` menghasilkan atribut saat aktif dan menghilangkannya saat tidak, dan itu yang dicocokkan pemilih CSS.',
      ),
      code(
        'text',
        `
        <Tombol className="mt-4" />

        // Hasil: <button class="mt-4">
        // Seluruh kelas varian dari komponen hilang.
        `,
        { caption: '`className` dari pemanggil menimpa yang disusun komponen.' },
      ),
      p(
        'Sudah dibahas di sub-bab props dan diulang di sini karena inilah tempatnya paling terasa, yaitu saat gaya mulai dipakai serius. Bongkar `className` keluar dari spread lalu gabungkan, dan taruh milik pemanggil di posisi terakhir supaya ia bisa menimpa saat memang diinginkan. Untuk Tailwind, penggabungan yang benar butuh alat khusus supaya kelas yang bertabrakan diselesaikan, dan itu dibahas di bab Tailwind.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`The \\`style\\` prop expects a mapping ... not a string`',
            'Gaya inline ditulis sebagai teks CSS',
            'Tulis sebagai object dengan nama bergaya huruf kapital di tengah',
          ],
          [
            'Nilai gaya kehilangan satuan yang diinginkan',
            'React menambah `px` otomatis untuk properti berukuran',
            "Tulis sebagai teks kalau butuh satuan lain, misalnya `\\'2rem\\'`",
          ],
          [
            'Gaya keadaan selalu berlaku',
            'Atribut data bernilai `false` tetap ada di DOM',
            'Pakai `nilai || undefined` supaya atributnya dihapus',
          ],
          [
            'Kelas komponen hilang saat pemanggil memberi `className`',
            'Urutan spread membuat nilai pemanggil menimpa',
            'Bongkar `className` keluar lalu gabungkan',
          ],
          [
            'Gaya tidak bisa ditimpa dari luar',
            'Gaya inline punya kekhususan tertinggi',
            'Pindahkan ke kelas, dan sisakan inline untuk nilai yang dihitung',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menata tampilan di React sering dimulai dengan cara yang paling cepat, dan biaya pilihannya baru terasa saat ada permintaan yang menyentuh seluruh aplikasi seperti tema gelap.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis warna dan ukuran lewat gaya inline',
            'Langsung terlihat tanpa berpindah berkas',
            'Nilai visual tersebar ke seluruh JavaScript, tema gelap jadi mustahil, dan gayanya tidak bisa ditimpa',
          ],
          [
            'Membuat satu berkas CSS global untuk semuanya',
            'Semua aturan di satu tempat',
            'Nama kelas bertabrakan antar-komponen, dan tidak ada yang berani menghapus aturan karena tidak tahu pemakainya',
          ],
          [
            'Menyusun nama kelas dengan penggabungan teks tanpa penyaring',
            'Sederhana dan bekerja',
            "Nilai kosong menghasilkan spasi ganda dan kelas `undefined`. Kumpulkan ke array lalu `filter(Boolean).join(\\' \\')`",
          ],
          [
            'Memakai pustaka CSS-in-JS untuk project sederhana',
            'Gaya dan komponen jadi di satu berkas',
            'Menambah biaya saat berjalan dan mempersulit rendering di server. Untuk sebagian besar kasus, kelas sudah cukup',
          ],
          [
            'Menyalin nilai warna dari desain ke tiap komponen',
            'Warnanya kan sudah pasti',
            'Satu perubahan merek berarti menyunting puluhan berkas. Simpan sebagai token, lalu rujuk tokennya',
          ],
          [
            'Menganimasikan `width`, `height`, atau `top`',
            'Itu properti yang mengatur posisi',
            'Keempatnya memicu perhitungan tata letak tiap bingkai. Pakai `transform` dan `opacity`, seperti diukur di Bab 4 Frontend Basic',
          ],
        ],
      ),
      p(
        "Baris ketiga menghasilkan bug yang terlihat sepele dan menyulitkan saat menelusuri. Bentuk `` className={`chip ${aktif && 'chip-aktif'}`} `` menghasilkan `chip false` saat tidak aktif, sebab `&&` mengembalikan `false` yang lalu diubah menjadi teks. Kumpulkan ke array lalu saring dengan `filter(Boolean)`, dan seluruh kelas kosong hilang dengan sendirinya.",
      ),
      callout(
        'info',
        'Project ini memakai Tailwind, dan alasannya dibahas di babnya sendiri',
        'Bab Tailwind di kategori ini membahas token, varian keadaan, tema gelap, dan penggabungan kelas yang benar. Yang perlu dipegang dari sub-bab ini berlaku untuk pendekatan mana pun, yaitu keputusan visual tinggal di satu lapisan, dan komponen hanya menyatakan keadaan apa yang sedang berlaku.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Konsistensi dalam satu project mengalahkan preferensi pribadi.',
        'CSS Module memberi scope otomatis dengan CSS biasa.',
        '`clsx` untuk class kondisional; nama class dinamis tidak terdeteksi Tailwind.',
        'Style inline hanya untuk nilai yang dihitung saat berjalan.',
        'Kunci design token apa pun sistem styling yang dipakai.',
      ),
      references(
        {
          label: 'CSS Modules',
          href: 'https://nextjs.org/docs/app/getting-started/css',
          source: 'Next.js',
          note: 'Dukungan bawaan CSS Module beserta aturan penamaan berkasnya.',
        },
        {
          label: 'Styling with utility classes',
          href: 'https://tailwindcss.com/docs/styling-with-utility-classes',
          source: 'Tailwind CSS',
          note: 'Pendekatan yang dipakai project ini, dibahas tuntas di Bab 1.',
        },
        {
          label: 'CSS Modules — Vite',
          href: 'https://vite.dev/guide/features#css-modules',
          source: 'Vite',
          note: 'Cara kerja pengacakan nama class yang membuat scoping otomatis mungkin.',
        },
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Alasan CSS-in-JS berbasis runtime bertabrakan dengan arah React sekarang.',
        },
      ),
    ],
  ),

  written(
    'composition-children',
    'Composition & `children`',
    23,
    'Menyusun komponen dari komponen lain — jalan keluar dari prop drilling.',
    [
      terms(
        {
          term: 'composition',
          meaning:
            'Terjemahannya **penyusunan**. Membangun tampilan dengan **merakit komponen dari komponen lain** alih-alih menambah prop. Ini jawaban React untuk hal-hal yang di dunia OOP diselesaikan dengan pewarisan — dan alasannya sama dengan Sub-bab 2.10 Frontend Basic: merakit jauh lebih lentur daripada mewarisi.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus berisi **apa pun yang ditulis di antara tag pembuka dan penutup** sebuah komponen. Kekuatannya sering diremehkan: dengan `children`, komponen pembungkus **tidak perlu tahu apa pun** tentang isi yang ia bungkus.',
        },
        {
          term: 'ledakan prop',
          meaning:
            'Terjemahan dari *prop explosion*. Komponen yang props-nya terus bertambah setiap ada kebutuhan baru — `judul`, `ikonJudul`, `tombolPrimer`, `warnaTombol`. Gejalanya khas: setiap fitur baru berarti **mengedit komponen lama**, dan itu tanda composition-nya belum dipakai.',
        },
        {
          term: 'prop drilling',
          meaning:
            'Data yang harus dioper melewati banyak lapisan yang tidak memakainya. Composition menyelesaikan sebagian besar kasusnya dengan cara yang mengejutkan sederhana: **oper komponennya, bukan datanya** — sehingga lapisan di tengah tidak perlu tahu apa-apa.',
        },
        {
          term: 'slot',
          meaning:
            'Terjemahannya **lubang isian**. Prop yang isinya berupa JSX, misalnya `header` atau `footer`. Berguna ketika sebuah komponen butuh **beberapa** tempat isian sekaligus — karena `children` hanya menyediakan satu.',
        },
        {
          term: 'compound component',
          meaning:
            'Terjemahannya **komponen majemuk**. Sekelompok komponen yang dirancang untuk dipakai bersama: `<Modal><Modal.Header/><Modal.Body/></Modal>`. Bentuk composition yang paling lentur, dan pola yang dipakai hampir semua library komponen modern.',
        },
        {
          term: 'container / presentational',
          meaning:
            'Pembagian lama antara komponen yang **mengurus data** dan yang **hanya menampilkan**. Sudah tidak dianjurkan sebagai aturan kaku sejak adanya hooks, tapi gagasan intinya tetap berguna: komponen yang tidak tahu dari mana datanya datang jauh lebih mudah dipakai ulang dan diuji.',
        },
        {
          term: 'inversion of control',
          meaning:
            'Terjemahannya **pembalikan kendali**. Dengan `children`, **pemakai komponen** yang memutuskan apa isinya, bukan penulis komponennya. Inilah alasan mendasar kenapa composition tidak pernah membutuhkan prop baru untuk kebutuhan yang belum terpikirkan.',
        },
      ),

      h2('Masalah: props yang terus bertambah'),
      code(
        'tsx',
        `
        // Setiap kebutuhan baru menambah satu prop
        <Modal
          judul="Hapus?"
          isi="Yakin?"
          tombolPrimer="Hapus"
          tombolSekunder="Batal"
          ikonJudul={<Warning />}
          adaFooter
          footerKiri={<Checkbox />}
          onPrimer={...}
          onSekunder={...}
        />
        `,
      ),
      code(
        'tsx',
        `
        // Composition: strukturnya terbaca langsung dari pemakaiannya
        <Modal>
          <Modal.Header>
            <Warning /> Hapus?
          </Modal.Header>

          <Modal.Body>Yakin?</Modal.Body>

          <Modal.Footer>
            <Checkbox /> Jangan tanya lagi
            <Button variant="hantu">Batal</Button>
            <Button variant="danger">Hapus</Button>
          </Modal.Footer>
        </Modal>
        `,
      ),
      p(
        'Bandingkan kedua pemakaian itu sebagai **teks yang dibaca orang**. Versi pertama menuntut pembaca menghubungkan `tombolPrimer` dengan `onPrimer` sendiri, dan menebak di mana `footerKiri` akan muncul. Lebih buruk lagi, tiap kebutuhan baru seperti ikon di footer atau dua tombol sekunder menambah prop lagi, dan `Modal` harus ikut diubah setiap kali. Versi kedua memindahkan strukturnya ke **tempat pemakaian**, sehingga susunan header, body, dan footer terbaca persis seperti hasilnya di layar, dan isinya bebas apa saja karena masing-masing bagian menerima `children`. Konsekuensinya yang paling penting, menambah sesuatu di footer **tidak menyentuh `Modal` sama sekali**. Pola `Modal.Header` yang menempel sebagai property inilah yang disebut *compound component*, dan cara membangunnya dibahas tuntas di Bab 6.',
      ),

      h2('Prop drilling'),
      code(
        'tsx',
        `
        // pengguna melewati tiga lapisan yang tidak memakainya sama sekali
        <Halaman pengguna={pengguna}>
          <Sidebar pengguna={pengguna}>
            <Menu pengguna={pengguna}>
              <Avatar pengguna={pengguna} />
        `,
      ),
      code(
        'tsx',
        `
        // Composition: komponen yang butuh data dirakit DI TEMPAT datanya ada
        function Halaman() {
          const pengguna = usePengguna();

          return (
            <Layout
              sidebar={
                <Sidebar>
                  <Menu>
                    <Avatar pengguna={pengguna} />
                  </Menu>
                </Sidebar>
              }
            />
          );
        }
        // Layout, Sidebar, dan Menu tidak perlu tahu apa pun tentang pengguna
        `,
      ),
      p(
        'Kuncinya ada pada **di mana `<Avatar pengguna={pengguna} />` ditulis**. Pada versi drilling, `Avatar` bersarang di dalam `Menu` yang bersarang di `Sidebar`, sehingga data harus dititipkan melewati ketiganya. Pada versi ini, seluruh susunan itu dirakit **di dalam `Halaman`**, tempat `pengguna` memang tersedia, lalu hasilnya yang sudah jadi dioper ke `Layout` sebagai prop `sidebar`. Dari sudut pandang `Layout`, yang ia terima hanyalah JSX yang siap dirender, dan ia tidak tahu serta tidak perlu tahu bahwa di dalamnya ada data pengguna. Itulah kenapa komentar terakhir bisa mengatakan ketiganya tidak perlu tahu apa-apa. Perhatikan pola ini pada dasarnya sama dengan `children`, hanya diberi nama sendiri karena ada lebih dari satu lubang yang perlu diisi.',
      ),
      callout(
        'tip',
        'Coba composition sebelum menjangkau Context',
        'Prop drilling sering dijawab dengan Context, padahal composition lebih sederhana dan tidak menambah re-render. Context tepat untuk nilai yang dibutuhkan **banyak cabang berjauhan** — tema, bahasa, pengguna aktif.',
      ),

      h2('Slot lewat props'),
      code(
        'tsx',
        `
        type Props = {
          kiri?: React.ReactNode;
          kanan?: React.ReactNode;
          children: React.ReactNode;
        };

        function Toolbar({ kiri, kanan, children }: Props) {
          return (
            <div className="flex items-center gap-3">
              {kiri}
              <div className="flex-1">{children}</div>
              {kanan}
            </div>
          );
        }

        <Toolbar kiri={<Logo />} kanan={<Avatar />}>
          <Pencarian />
        </Toolbar>
        `,
      ),
      p(
        '`children` hanya menyediakan **satu** lubang isian, tepat di antara tag pembuka dan penutup. `Toolbar` di atas butuh tiga posisi berbeda (kiri, tengah, kanan), sehingga `children` saja tidak cukup, dan dua posisi tambahan (`kiri`, `kanan`) ditulis sebagai prop biasa yang nilainya berupa elemen JSX alih-alih string atau angka. Pemanggil kemudian memilih elemen mana yang mengisi slot mana lewat nama prop-nya, sehingga `kiri={<Logo />}` secara eksplisit mengisi posisi kiri sementara `<Pencarian />` yang ditulis di antara tag otomatis menjadi `children` dan mengisi posisi tengah.',
      ),

      h2('Compound component'),
      code(
        'tsx',
        `
        function Kartu({ children }: { children: React.ReactNode }) {
          return <article className="rounded-lg border border-border">{children}</article>;
        }

        Kartu.Header = function Header({ children }) {
          return <div className="border-b border-border p-4">{children}</div>;
        };

        Kartu.Body = function Body({ children }) {
          return <div className="p-4">{children}</div>;
        };

        <Kartu>
          <Kartu.Header>Judul</Kartu.Header>
          <Kartu.Body>Isi</Kartu.Body>
        </Kartu>
        `,
      ),
      p(
        'Versi yang berbagi state lewat Context, beserta kapan pola ini sepadan, dibahas di Bab 6.',
      ),

      h2('Kapan composition berlebihan'),
      callout(
        'warning',
        'Jangan memecah komponen yang belum menyakitkan',
        'Komponen dengan tiga prop yang jelas lebih baik daripada compound component dengan lima bagian yang harus dirakit setiap kali dipakai. Composition menyelesaikan masalah **props yang meledak** dan **prop drilling** — kalau keduanya belum terjadi, ia hanya menambah lapisan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Dialog` dipakai di enam tempat. Awalnya ia menerima `judul` dan `isi`. Lalu ada yang butuh tombol tambahan di kaki dialog, jadi lahir prop `tombolTambahan`. Lalu ada yang butuh ikon di kepala, jadi lahir `ikon`. Lalu ada yang butuh kaki tanpa tombol batal, jadi lahir `sembunyikanBatal`. Setelah setahun, `Dialog` menerima sembilan belas prop dan tidak ada satu pun pemakai yang memakai lebih dari lima.',
      ),
      p(
        'Ini pola pertumbuhan yang khas, dan penyebabnya satu, yaitu komponen mencoba mengatur isi yang seharusnya ditentukan pemakainya. Komposisi membalik arah itu.',
      ),
      compare(
        {
          title: 'Konfigurasi lewat props',
          lang: 'tsx',
          code: `
          type DialogProps = {
            judul: string;
            ikon?: ReactNode;
            isi: string;
            tombolTambahan?: ReactNode;
            sembunyikanBatal?: boolean;
            labelSimpan?: string;
            ukuran?: 'kecil' | 'besar';
            // ...dan dua belas lagi
          };

          <Dialog
            judul="Hapus pesanan"
            isi="Tindakan ini tidak bisa dibatalkan."
            labelSimpan="Hapus"
            sembunyikanBatal={false}
          />
          `,
          notes: ['Tiap kebutuhan baru menambah satu prop, dan tidak pernah berkurang'],
        },
        {
          title: 'Komposisi lewat children',
          lang: 'tsx',
          code: `
          type DialogProps = {
            terbuka: boolean;
            onTutup: () => void;
            children: ReactNode;
          };

          <Dialog terbuka={terbuka} onTutup={tutup}>
            <Dialog.Kepala>
              <IkonPeringatan /> Hapus pesanan
            </Dialog.Kepala>

            <Dialog.Isi>Tindakan ini tidak bisa dibatalkan.</Dialog.Isi>

            <Dialog.Kaki>
              <Tombol varian="hantu" onClick={tutup}>Batal</Tombol>
              <Tombol varian="bahaya" onClick={hapus}>Hapus</Tombol>
            </Dialog.Kaki>
          </Dialog>
          `,
          notes: ['Kebutuhan baru diselesaikan pemanggil, tanpa menyentuh Dialog'],
        },
      ),
      p(
        'Perbedaan yang menentukan bukan panjangnya melainkan **siapa yang memutuskan isinya**. Di kolom kiri, `Dialog` harus tahu segala kemungkinan isi kakinya, sehingga tiap kebutuhan baru menjadi prop baru. Di kolom kanan, `Dialog` hanya tahu ia punya tiga area dan tidak peduli apa isinya. Menambah tombol ketiga tidak menyentuh berkas `Dialog` sama sekali.',
      ),
      p(
        'Yang perlu jujur disebut, kolom kanan lebih panjang di tempat pemakaian. Itu memang harganya, dan ia sepadan justru ketika pemakaiannya beragam. Untuk dialog konfirmasi yang bentuknya selalu sama di sepuluh tempat, membuat komponen `DialogKonfirmasi` yang menerima tiga prop justru lebih tepat. Keduanya bisa hidup berdampingan, yaitu yang komposisional sebagai dasar, dan yang berprop sebagai pembungkus untuk pola yang sering berulang.',
      ),
      code(
        'tsx',
        `
        // Prop 'children' bukan satu-satunya cara. Slot bernama juga sah.
        type PanelProps = {
          kepala: ReactNode;
          samping?: ReactNode;
          children: ReactNode;
        };

        function Panel({ kepala, samping, children }: PanelProps) {
          return (
            <section className="panel">
              <header className="panel-kepala">{kepala}</header>
              <div className="panel-badan">
                <main>{children}</main>
                {samping ? <aside className="panel-samping">{samping}</aside> : null}
              </div>
            </section>
          );
        }

        <Panel
          kepala={<h2>Ringkasan bulan ini</h2>}
          samping={<FilterTanggal nilai={rentang} onUbah={setRentang} />}
        >
          <Grafik data={data} />
        </Panel>
        `,
        { filename: 'src/ui/Panel.tsx' },
      ),
      p(
        'Slot bernama lebih tepat daripada `children` saat ada beberapa area yang posisinya berbeda dan tidak boleh tertukar. Keunggulannya, tipe memaksa `kepala` diisi dan membiarkan `samping` opsional, sedangkan dengan `children` saja urutan dan kelengkapannya tidak bisa dijamin. Kekurangannya, JSX di tempat pemakaian menjadi lebih padat karena elemen ditulis di dalam atribut.',
      ),
      p(
        'Ada satu manfaat komposisi yang jarang disebut dan sangat berpengaruh, yaitu elemen yang dikirim sebagai prop **dibuat oleh induknya**. Artinya kalau `Panel` digambar ulang karena keadaannya sendiri berubah, `<Grafik data={data} />` yang sudah dibuat induknya tidak ikut dibuat ulang. Ini cara paling sederhana menghindari penggambaran ulang yang tidak perlu, dan ia bekerja tanpa satu pun pengoptimalan eksplisit.',
      ),
      callout(
        'tip',
        'Tanda bahwa komponenmu butuh komposisi',
        'Hitung berapa prop yang isinya berupa teks atau elemen yang akan ditampilkan apa adanya. Kalau ada lebih dari dua, kemungkinan besar keduanya sebenarnya area yang lebih baik diisi pemanggil. Tanda kedua, kalau ada prop bernama seperti `sembunyikanX` atau `tampilkanY`, itu berarti komponenmu sedang menebak isi yang bukan urusannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat mulai memakai komposisi, dan seluruhnya diuji dengan React sungguhan.',
      ),
      code(
        'text',
        `
        type Props = { children: JSX.Element };
        <Kartu>Halo</Kartu>

        error TS2322: Type 'string' is not assignable to type 'Element'.
        `,
        { caption: '`children` diketik terlalu sempit.' },
      ),
      p(
        'Tipe `JSX.Element` hanya mencakup satu elemen JSX, sedangkan teks, angka, array, dan `null` juga sah sebagai anak. Pakai `ReactNode` yang mencakup semuanya. Kalau kamu memang ingin memaksa anaknya berupa satu elemen, misalnya untuk komponen yang mengkloningnya, `ReactElement` lebih tepat dan itu kasus yang jarang.',
      ),
      code(
        'text',
        `
        <div dangerouslySetInnerHTML={{ __html: html }}>anak</div>

        Error: Can only set one of \`children\` or \`props.dangerouslySetInnerHTML\`.
        `,
        { caption: 'Dua cara mengisi isi elemen dipakai bersamaan.' },
      ),
      p(
        'React menolak karena keduanya sama-sama mengatur isi elemen dan tidak ada urutan yang masuk akal. Yang lebih penting dari pesan errornya, kehadiran `dangerouslySetInnerHTML` itu sendiri layak dipertanyakan. Namanya sengaja dibuat panjang dan menakutkan supaya kamu berhenti sejenak. Kalau isinya berasal dari pengguna, ini celah XSS yang sama persis dengan `innerHTML` di Bab 4 Frontend Basic.',
      ),
      code(
        'text',
        `
        function Induk() {
          function Anak() { return <input />; }   // didefinisikan di dalam
          return <Anak />;
        }

        // Tidak ada error. Kotak input kehilangan fokus pada tiap ketikan.
        `,
        { caption: 'Komponen didefinisikan di dalam komponen lain.' },
      ),
      p(
        'Fungsi `Anak` dibuat ulang pada tiap render `Induk`, sehingga identitasnya selalu berbeda. React membandingkan jenis komponen berdasarkan identitas fungsinya, sehingga ia menyimpulkan komponennya berganti dan membongkar seluruh pohonnya. Akibatnya state hilang, fokus lepas, dan elemen DOM dibuat ulang. Definisikan komponen di luar, dan kirim yang berbeda lewat props atau `children`.',
      ),
      code(
        'text',
        `
        <Dialog>
          <Dialog.Kepala>Judul</Dialog.Kepala>
        </Dialog>

        // Dialog.Kepala membaca konteks yang disediakan Dialog.
        // Kalau dipakai di luar Dialog:
        Error: Dialog.Kepala harus berada di dalam Dialog
        `,
        { caption: 'Bagian dari komponen majemuk dipakai di luar induknya.' },
      ),
      p(
        'Komponen majemuk seperti `Dialog.Kepala` biasanya bergantung pada konteks yang disediakan `Dialog`. Kalau dipakai sendirian, konteksnya tidak ada. Pesan error yang kamu tulis sendiri jauh lebih menolong daripada `Cannot read properties of undefined`, dan menuliskannya cukup satu baris pemeriksaan di dalam bagian itu. Pola lengkapnya dibahas di bab jenis komponen.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Type 'string' is not assignable to type 'Element'`",
            '`children` diketik `JSX.Element`',
            'Pakai `ReactNode`',
          ],
          [
            '`Can only set one of children or dangerouslySetInnerHTML`',
            'Dua cara mengisi isi dipakai bersamaan',
            'Pilih salah satu, dan pertanyakan kebutuhan `dangerouslySetInnerHTML`',
          ],
          [
            'Fokus hilang tiap ketikan tanpa error',
            'Komponen didefinisikan di dalam komponen lain',
            'Definisikan di luar, kirim perbedaannya lewat props',
          ],
          [
            'Bagian komponen majemuk gagal di luar induknya',
            'Konteks yang ia butuhkan tidak ada',
            'Tulis pemeriksaan dengan pesan yang menyebut induknya',
          ],
          [
            'Komponen menerima belasan prop yang hanya diteruskan',
            'Isi diatur lewat konfigurasi, bukan komposisi',
            'Ubah menjadi area yang diisi pemanggil',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Komposisi adalah pola yang sangat berguna dan sangat mudah dipakai berlebihan. Sebagian besar baris di bawah adalah tentang menemukan batasnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah prop baru tiap ada kebutuhan tampilan baru',
            'Satu prop untuk satu kebutuhan',
            'Komponen tumbuh menjadi puluhan prop yang tidak pernah dipakai bersamaan. Ubah menjadi area yang diisi pemanggil',
          ],
          [
            'Memakai komposisi untuk komponen yang bentuknya selalu sama',
            'Katanya komposisi lebih baik',
            'Pemakainya jadi menulis sepuluh baris untuk hal yang bisa tiga prop. Sediakan pembungkus untuk pola yang sering berulang',
          ],
          [
            'Mendefinisikan komponen di dalam komponen lain',
            'Supaya bisa mengakses variabel induknya',
            'State di dalamnya hilang tiap render dan fokus lepas. Definisikan di luar dan kirim lewat props',
          ],
          [
            'Memakai `children` untuk beberapa area sekaligus',
            'Semuanya kan anak',
            'Urutan dan kelengkapannya tidak bisa dijamin. Pakai slot bernama untuk area yang posisinya berbeda',
          ],
          [
            'Mengkloning `children` untuk menyuntikkan props',
            'Supaya anaknya dapat data dari induk',
            '`cloneElement` rapuh sebab bergantung pada bentuk anak yang tidak kamu kendalikan. Pakai konteks, dan itu dibahas di bab jenis komponen',
          ],
          [
            'Mengetik `children` sebagai `any`',
            'Isinya kan bisa apa saja',
            '`ReactNode` sudah berarti apa saja yang bisa dirender, dan ia tetap menolak object dan janji yang memang tidak bisa',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan karena nasihat pilih komposisi sering dibaca terlalu keras, persis seperti nasihat pilih komposisi daripada pewarisan di Bab 2 Frontend Basic. Komposisi menukar kesederhanaan di tempat pemakaian dengan keluwesan. Untuk komponen yang dipakai di tiga tempat dengan bentuk yang persis sama, kesederhanaan lebih berharga, dan tiga prop adalah jawaban yang benar.',
      ),
      callout(
        'info',
        'Elemen sebagai prop menghindari penggambaran ulang tanpa pengoptimalan apa pun',
        'Karena elemen yang dikirim sebagai `children` dibuat oleh induknya, ia tidak dibuat ulang saat komponen penerimanya digambar ulang. Ini yang membuat pola membungkus bagian yang sering berubah dengan komponen berkeadaan, lalu mengirim bagian yang jarang berubah sebagai `children`, menjadi pengoptimalan yang tidak menuntut satu pun pemanggilan khusus.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Composition menggantikan props yang terus bertambah dengan struktur yang terbaca.',
        'Prop drilling sering selesai dengan composition, tanpa perlu Context.',
        'Slot lewat props berguna saat posisinya harus ditentukan komponen induk.',
        'Compound component memberi API yang terbaca dari markup.',
        'Jangan memecah sebelum masalahnya benar-benar terasa.',
      ),
      references(
        {
          label: 'Passing JSX as children',
          href: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children',
          source: 'React',
          note: 'Mekanisme dasar composition — mengoper komponen alih-alih menambah prop.',
        },
        {
          label: 'Extracting Components',
          href: 'https://react.dev/learn/your-first-component#nesting-and-organizing-components',
          source: 'React',
          note: 'Kapan sebuah komponen layak dipecah, dan kapan justru terlalu dini.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Menegaskan bahwa composition sebaiknya dicoba lebih dulu sebelum Context.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Langkah memecah rancangan menjadi hierarki komponen yang masuk akal.',
        },
      ),
    ],
  ),

  written(
    'virtual-dom',
    'Virtual DOM & Reconciliation',
    21,
    'Apa yang sebenarnya dilakukan React di balik layar — dan apa yang sering dilebih-lebihkan.',
    [
      terms(
        {
          term: 'Virtual DOM',
          meaning:
            'Terjemahannya **DOM maya**. Gambaran struktur tampilan yang disimpan React di memori sebagai **object JavaScript biasa** — jauh lebih murah dibuat dan dibandingkan daripada elemen DOM sungguhan. Perlu diluruskan: ia **bukan** teknologi rahasia, hanya object bersarang seperti yang kamu lihat di Sub-bab 6.4 Frontend Basic.',
        },
        {
          term: 'reconciliation',
          meaning:
            'Terjemahannya **pencocokan**. Proses React membandingkan gambaran lama dengan gambaran baru untuk menentukan **perubahan seminimal mungkin** yang perlu diterapkan ke DOM. Dua petunjuk utamanya: jenis elemen dan `key`.',
        },
        {
          term: 'diffing',
          meaning:
            'Terjemahannya **pencarian perbedaan**. Algoritma di dalam reconciliation. Ia sengaja memakai dua asumsi penyederhana: elemen dengan **jenis berbeda menghasilkan pohon berbeda**, dan `key` menandai elemen yang tetap sama antar-render. Tanpa dua asumsi itu, pencocokan sempurna akan terlalu mahal untuk dilakukan tiap render.',
        },
        {
          term: 'klaim yang menyesatkan',
          meaning:
            '"Virtual DOM lebih cepat daripada DOM" — ini **tidak benar** dan layak diluruskan. Menyentuh DOM tetap sama mahalnya. Yang React lakukan adalah **menyentuhnya lebih sedikit**, secara otomatis. DOM manual yang ditulis dengan sangat hati-hati justru bisa lebih cepat; yang React beli untukmu adalah kecepatan yang **wajar tanpa perlu melacaknya sendiri**.',
        },
        {
          term: 'Fiber',
          meaning:
            'Nama arsitektur internal React sejak versi 16. Kemampuan utamanya: pekerjaan render bisa **dipecah dan dijeda** di tengah jalan, sehingga tugas mendesak seperti ketikan pengguna tidak perlu menunggu render besar selesai.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **penggabungan**. Beberapa perubahan state yang terjadi berdekatan digabung menjadi **satu** render. Sejak React 18 ini berlaku otomatis di mana pun — termasuk di dalam `setTimeout` dan penangan Promise, yang sebelumnya tidak ikut digabung.',
        },
        {
          term: 're-render',
          meaning:
            'React memanggil ulang fungsi komponenmu. Yang wajib dipahami: **re-render tidak berarti DOM berubah**. Kalau hasil gambarannya sama, tidak ada satu pun elemen yang disentuh — sehingga "komponen ini render 20 kali" belum tentu masalah.',
        },
        {
          term: 'optimasi prematur',
          meaning:
            'Membungkus segalanya dengan `memo` tanpa pernah mengukur. Biayanya nyata: perbandingan props juga memakan waktu, dan kodenya jadi lebih sulit dibaca. Aturan yang berlaku sejak Frontend Basic tetap sama — **ukur dulu dengan Profiler**, baru optimalkan.',
        },
        {
          term: 'React DevTools Profiler',
          meaning:
            'Alat resmi untuk **mengukur** komponen mana yang benar-benar sering render dan berapa lama. Inilah yang memisahkan optimasi yang berdasar dari tebakan — dan hampir selalu menunjukkan bahwa dugaan awalmu salah sasaran.',
        },
      ),

      h2('Bukan "DOM virtual lebih cepat dari DOM"'),
      p(
        'Klaim itu menyesatkan. Menyentuh DOM tetap operasi yang sama mahalnya. Yang React lakukan adalah **menyentuhnya lebih sedikit** — dan melakukannya secara otomatis, tanpa kamu harus melacak apa yang berubah.',
      ),
      code(
        'js',
        `
        // DOM manual yang ditulis dengan hati-hati bisa LEBIH cepat dari React,
        // karena ia tahu persis satu elemen mana yang berubah.
        //
        // Yang React beli untukmu bukan kecepatan mentah —
        // melainkan kecepatan yang WAJAR tanpa harus melacaknya sendiri.
        `,
      ),

      h2('Prosesnya'),
      ol(
        'Komponen dipanggil, menghasilkan pohon objek deskripsi (elemen React).',
        'React membandingkannya dengan pohon dari render sebelumnya.',
        'Perbedaannya dikumpulkan jadi daftar perubahan minimum.',
        'Daftar itu diterapkan ke DOM sungguhan dalam satu tahap commit.',
      ),

      h2('Dua aturan pembandingan'),
      code(
        'tsx',
        `
        // Aturan 1: TIPE yang berbeda -> buang seluruh subpohon, bangun baru
        {kondisi ? <div><Form /></div> : <span><Form /></span>}
        // div -> span: Form DIBONGKAR dan dibuat ulang, seluruh state-nya hilang

        // Aturan 2: tipe sama -> pertahankan elemen, perbarui propsnya saja
        <div className="a" />  ->  <div className="b" />
        // Elemen DOM yang sama, hanya className yang diubah
        `,
      ),
      p(
        'Kedua aturan ini menjelaskan hampir semua perilaku React yang tampak aneh. Aturan pertama tegas dan tidak melihat isi, sebab begitu **tipe** elemen di posisi yang sama berubah, React membuang seluruh subpohonnya dan membangun ulang dari nol. Pada contoh itu, `<Form />` di dalam `div` dan `<Form />` di dalam `span` **bukan komponen yang sama** bagi React meski tulisannya identik, karena pembungkusnya berubah sehingga seluruh isinya ikut dibongkar dan state di dalam form hilang. Aturan kedua adalah kebalikannya dan menjelaskan kenapa React murah, sebab tipe yang sama berarti elemen DOM-nya dipertahankan dan hanya prop yang berbeda yang diperbarui. Dari sinilah bug di kotak berikut berasal, karena komponen yang didefinisikan ulang tiap render menghasilkan **tipe** yang berbeda setiap kali sehingga aturan pertama berlaku terus-menerus.',
      ),
      callout(
        'danger',
        'Komponen yang didefinisikan di dalam komponen lain',
        'Ini bug yang gejalanya sangat membingungkan: input kehilangan fokus setiap ketikan.',
      ),
      code(
        'tsx',
        `
        // SALAH: Baris adalah fungsi BARU setiap render induknya
        function Halaman() {
          function Baris({ item }) {          // referensi berbeda tiap render
            return <input defaultValue={item.nama} />;
          }
          return items.map((i) => <Baris key={i.id} item={i} />);
        }
        // React melihat "tipe komponen berbeda" -> bongkar dan bangun ulang tiap render
        // -> fokus hilang setiap ketikan

        // BENAR: definisikan di luar
        function Baris({ item }) {
          return <input defaultValue={item.nama} />;
        }
        `,
      ),
      p(
        'Akar masalahnya persis Aturan 1 di atas, yaitu React mengidentifikasi tipe komponen lewat **referensi fungsinya** dan bukan lewat namanya. Setiap kali `Halaman` di-render ulang, `function Baris(...)` yang dideklarasikan di dalamnya membuat objek fungsi yang **baru secara referensi**, meski namanya dan isinya sama persis dengan render sebelumnya. Bagi React, itu berarti "tipe komponennya berubah", persis kasus `div` menjadi `span`, sehingga elemen `<input>` lama dibongkar dan yang baru dipasang dari nol, membawa fokus dan apa pun yang sedang diketik pengguna ikut hilang. Mendefinisikan `Baris` di luar `Halaman` membuat referensinya tetap sama di setiap render, sehingga React mengenalinya sebagai komponen yang sama dan hanya memperbarui propsnya.',
      ),

      h2('Posisi juga identitas'),
      code(
        'tsx',
        `
        {kondisi ? <Counter /> : <Counter />}
        // Posisinya sama, tipenya sama -> React MEMPERTAHANKAN state-nya.
        // Berganti kondisi tidak mereset counter — sering mengejutkan.

        {kondisi ? <Counter key="a" /> : <Counter key="b" />}
        // key berbeda -> dianggap komponen berbeda -> state di-reset
        `,
      ),
      p(
        'Contoh pertama sering mengejutkan pemula, karena intuisinya bilang "kondisinya berganti, jadi ini pasti komponen yang berbeda", padahal dari sudut pandang React keduanya adalah `<Counter />` di **posisi yang sama** dalam pohon, yaitu posisi tunggal hasil ekspresi ternary, dengan **tipe yang sama**. Karena kedua aturan pencocokan itu terpenuhi, React memperlakukannya sebagai elemen yang sama persis dan tidak pernah membongkarnya, meski secara visual terlihat seperti dua `Counter` yang berbeda karena muncul bergantian sesuai `kondisi`. Menambahkan `key` yang berbeda pada contoh kedua memberi React identitas eksplisit yang mengalahkan aturan posisi dan tipe, sehingga berganti `kondisi` benar-benar membongkar `Counter` lama dan memasang yang baru dengan state yang di-reset ke awal.',
      ),

      h2('Apa yang tidak perlu kamu optimasi'),
      callout(
        'info',
        'Re-render tidak otomatis berarti masalah',
        'Komponen yang di-render ulang tapi menghasilkan output yang sama **tidak menyentuh DOM sama sekali**. Membungkus semuanya dengan `memo` sering menambah biaya perbandingan tanpa menghemat apa pun. Ukur dulu dengan React DevTools Profiler — dan di React 19 dengan React Compiler, sebagian besarnya sudah otomatis.',
      ),

      h2('Yang benar-benar berdampak'),
      ol(
        '`key` yang stabil — mencegah refactor yang tidak perlu.',
        'Jangan mendefinisikan komponen di dalam komponen.',
        'Jangan mengubah tipe elemen tanpa alasan (`div` ↔ `span`).',
        'Untuk daftar sangat panjang (>200 baris), virtualisasi — bukan memoization.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Ada keluhan bahwa tabel pesanan terasa tersendat saat pengguna mengetik di kotak pencarian. Dugaan pertama tim adalah virtual DOM tidak cukup cepat untuk seribu baris. Setelah diukur di tab Profiler, ternyata React hanya butuh delapan milidetik untuk membandingkan seluruh pohonnya. Yang memakan dua ratus milidetik adalah satu komponen yang memformat tanggal seribu kali dengan `Intl.DateTimeFormat` yang dibuat ulang di dalam `map`.',
      ),
      p(
        'Kesalahpahaman terbesar tentang virtual DOM adalah menganggapnya alat pemercepat. Ia bukan. Memahami apa yang sebenarnya ia lakukan menghemat banyak waktu penelusuran yang salah arah.',
      ),
      code(
        'text',
        `
        Apa yang terjadi saat sebuah state berubah:

        1. RENDER   — React memanggil fungsi komponenmu.
                      Hasilnya object deskripsi, bukan DOM.
                      Ini murni JavaScript, dan biasanya cepat.

        2. DIFF     — React membandingkan deskripsi baru dengan yang lama.
                      Pencocokan anak memakai \`key\`.
                      Ini yang disebut rekonsiliasi.

        3. COMMIT   — React mengubah DOM, HANYA pada bagian yang berbeda.
                      Ini yang menyentuh peramban, dan biasanya paling mahal.

        Digambar ulang TIDAK berarti DOM berubah.
        Sebagian besar render berakhir tanpa satu pun perubahan DOM.
        `,
        { caption: 'Tiga tahap yang sering dianggap satu.' },
      ),
      p(
        'Pemisahan tiga tahap ini menjelaskan kenapa React bisa cepat meski komponenmu dipanggil ulang. Memanggil fungsi dan membuat object adalah operasi JavaScript murni yang sangat cepat. Yang mahal adalah menyentuh DOM, dan tahap ketiga hanya mengerjakan bagian yang benar-benar berbeda. Ini persis pemeriksaan `if (judulEl.textContent !== tugas.judul)` yang kamu tulis sendiri di Bab 4 Frontend Basic.',
      ),
      p(
        'Yang perlu ditegaskan, virtual DOM **menambah** pekerjaan dibandingkan mengubah DOM secara langsung dengan tepat sasaran. Kode DOM manual yang ditulis dengan benar akan selalu lebih cepat. Yang React berikan bukan kecepatan melainkan kemudahan menulis kode yang benar, sebab menulis pembaruan DOM manual yang tepat sasaran untuk aplikasi dengan banyak keadaan sangat sulit dijaga kebenarannya.',
      ),
      code(
        'tsx',
        `
        // Penyebab sungguhan dari kasus di awal.
        function BarisPesanan({ pesanan }: { pesanan: Pesanan }) {
          // Objek Intl dibuat ULANG untuk tiap baris, tiap render.
          const tanggal = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })
            .format(new Date(pesanan.padaIso));

          return <tr><td>{tanggal}</td></tr>;
        }

        // Perbaikannya: buat SEKALI di luar komponen.
        const FORMAT_TANGGAL = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' });

        function BarisPesanan({ pesanan }: { pesanan: Pesanan }) {
          const tanggal = FORMAT_TANGGAL.format(new Date(pesanan.padaIso));
          return <tr><td>{tanggal}</td></tr>;
        }
        `,
        { caption: 'Yang mahal bukan React, melainkan pekerjaan di dalam komponen.' },
      ),
      p(
        'Ini pola yang sudah muncul di Bab 1 Frontend Basic saat membahas `formatRupiah`, yaitu objek pemformat dibuat sekali di luar fungsi. Di React alasannya sama dan dampaknya lebih besar, sebab fungsi komponen dipanggil ulang jauh lebih sering daripada fungsi biasa. Aturan yang bisa dipegang, apa pun yang tidak bergantung pada props atau state layak dipindahkan ke luar komponen.',
      ),
      p(
        'Cara menemukan penyebab sungguhan seperti ini bukan menebak melainkan mengukur. Tab Profiler di React DevTools merekam tiap render, menyebut komponen mana yang memakan waktu, dan menyebut alasan ia digambar ulang. Sepuluh detik merekam di sana menghemat berjam-jam menebak, dan hampir selalu penyebabnya bukan yang pertama kali diduga.',
      ),
      callout(
        'warning',
        'Jangan mengoptimalkan sebelum mengukur',
        'Menambahkan pembungkus pengoptimalan ke seluruh komponen menambah biaya perbandingan pada tiap render, dan untuk sebagian besar komponen biaya itu lebih besar daripada penghematannya. Rekam di Profiler lebih dulu, cari komponen yang benar-benar memakan waktu, lalu perbaiki yang itu saja. Ini persis disiplin yang sama dengan pengukuran performa DOM di Bab 4 Frontend Basic.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Masalah rendering jarang berupa pesan error. Yang muncul adalah gejala, dan mengenalinya menentukan ke mana kamu mencari.',
      ),
      code(
        'text',
        `
        Warning: Maximum update depth exceeded. This can happen when a component
        repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
        React limits the number of nested updates to prevent infinite loops.
        `,
        { caption: 'Putaran render tak berujung.' },
      ),
      p(
        'Penyebab paling sering di komponen fungsi adalah `setState` dipanggil langsung di badan komponen alih-alih di dalam penangan peristiwa atau efek. Setiap render memicu pembaruan, dan pembaruan memicu render lagi. Penyebab kedua adalah efek yang dependensinya berupa object atau array yang dibuat baru tiap render, dan itu dibahas tuntas di Bab 7.',
      ),
      code(
        'text',
        `
        function Daftar({ item }) {
          const [pilih, setPilih] = useState(null);
          if (item.length === 0) return null;
          const [urut, setUrut] = useState('nama');

          Warning: React has detected a change in the order of Hooks called by Daftar.
        }
        `,
        { caption: 'Jumlah hook berbeda antar-render.' },
      ),
      p(
        'React menyimpan state berdasarkan urutan pemanggilan hook, persis seperti dibahas di Bab 7. Kalau sebuah render memanggil dua hook dan render berikutnya hanya satu, pencocokannya bergeser dan nilai state berpindah ke slot yang salah. Peringatan ini termasuk yang wajib diperbaiki segera, sebab akibatnya berupa nilai yang tertukar tanpa pola yang jelas.',
      ),
      code(
        'text',
        `
        // Tidak ada peringatan apa pun.
        // Profiler menunjukkan komponen ini dirender 400 kali dalam satu detik.
        `,
        { caption: 'Penggambaran ulang berlebihan yang tidak melempar apa pun.' },
      ),
      p(
        'Ini gejala yang paling sering dan paling tidak terlihat. Halaman tetap benar, hanya terasa berat. Cara menemukannya adalah menyalakan opsi Highlight updates di React DevTools, yang membuat komponen berkedip saat digambar ulang. Kalau seluruh halaman berkedip setiap kali satu huruf diketik, itu berarti keadaannya berada terlalu tinggi di pohon komponen.',
      ),
      code(
        'text',
        `
        // Kotak input kehilangan fokus setiap kali diketik satu huruf.
        // Tidak ada error, tidak ada peringatan.
        `,
        { caption: 'Elemen dibongkar dan dibuat ulang, bukan diperbarui.' },
      ),
      p(
        'Ada tiga penyebab yang menghasilkan gejala persis sama, dan ketiganya membuat React menyimpulkan elemennya berganti identitas. Pertama, komponen didefinisikan di dalam komponen lain. Kedua, `key` dibuat acak di dalam render. Ketiga, struktur JSX berubah sehingga posisi elemennya bergeser, misalnya dibungkus kondisional yang berubah. Periksa ketiganya berurutan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Maximum update depth exceeded`',
            '`setState` dipanggil di badan komponen, atau efek memicu dirinya sendiri',
            'Pindahkan ke penangan peristiwa, dan periksa dependensi efeknya',
          ],
          [
            '`change in the order of Hooks called by ...`',
            'Jumlah hook berbeda antar-render',
            'Panggil seluruh hook sebelum `return` mana pun',
          ],
          [
            'Halaman berat tanpa satu pun peringatan',
            'Penggambaran ulang berlebihan, atau pekerjaan mahal di dalam komponen',
            'Rekam di Profiler, dan nyalakan Highlight updates',
          ],
          [
            'Fokus hilang tiap ketikan',
            'Elemen dibongkar karena identitasnya berubah',
            'Periksa komponen bersarang, `key` acak, dan struktur JSX yang berubah',
          ],
          [
            'Perubahan state tidak menyebabkan penggambaran ulang',
            'Object atau array diubah di tempat, bukan diganti',
            'Buat nilai baru, jangan mengubah yang lama',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Virtual DOM adalah bagian React yang paling sering disalahpahami, dan kesalahpahamannya mengarahkan penelusuran ke tempat yang salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira virtual DOM membuat aplikasi lebih cepat',
            'Katanya itu keunggulan React',
            'Ia menambah pekerjaan dibandingkan DOM manual yang tepat sasaran. Yang ia berikan adalah kemudahan menulis kode yang benar',
          ],
          [
            'Mengira render berarti DOM diubah',
            'Namanya juga render',
            'Sebagian besar render berakhir tanpa satu pun perubahan DOM. Render itu memanggil fungsi dan membuat object',
          ],
          [
            'Membungkus seluruh komponen dengan pengoptimalan',
            'Semakin sedikit render semakin baik',
            'Perbandingan props juga makan biaya, dan untuk komponen ringan biayanya lebih besar daripada penghematannya',
          ],
          [
            'Menebak penyebab kelambatan lalu langsung memperbaiki',
            'Dugaannya masuk akal',
            'Hampir selalu salah. Rekam di Profiler lebih dulu, dan penyebabnya sering pekerjaan di dalam komponen bukan React-nya',
          ],
          [
            'Membuat objek mahal di dalam komponen',
            'Nilainya kan dipakai di situ',
            'Ia dibuat ulang tiap render dan dikalikan jumlah baris. Pindahkan ke luar komponen kalau tidak bergantung props',
          ],
          [
            'Menaruh state di komponen paling atas',
            'Supaya bisa dijangkau semua',
            'Setiap perubahan menggambar ulang seluruh pohon. Simpan state sedekat mungkin dengan yang memakainya',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah pengoptimalan paling ampuh sekaligus paling sering dilewatkan, dan ia tidak menuntut satu pun pemanggilan khusus. Kotak pencarian yang statenya berada di komponen halaman akan menggambar ulang seluruh halaman pada tiap ketikan. Memindahkan state itu ke dalam komponen kotak pencarian membuat hanya kotak itu yang digambar ulang. Ini penerapan aturan simpan state sedekat mungkin dengan pembacanya, yang sudah ada di baseline frontend project ini.',
      ),
      callout(
        'tip',
        'Tiga alat yang menjawab hampir semua pertanyaan performa React',
        'Tab Profiler di React DevTools merekam tiap render beserta durasinya dan alasannya. Opsi Highlight updates membuat komponen berkedip saat digambar ulang, sehingga penggambaran berlebihan langsung terlihat. Tab Performance peramban menunjukkan apakah waktunya habis di JavaScript, di tata letak, atau di penggambaran. Pakai ketiganya sebelum mengubah satu baris pun.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'React tidak lebih cepat dari DOM — ia menyentuh DOM lebih sedikit, secara otomatis.',
        'Tipe berbeda membongkar seluruh subpohon beserta state-nya.',
        'Komponen yang didefinisikan di dalam komponen dibongkar setiap render.',
        'Posisi dan tipe yang sama membuat state dipertahankan; `key` mengubah itu.',
        'Ukur sebelum memoization — re-render sering tidak menyentuh DOM.',
      ),
      references(
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Aturan posisi dan tipe yang menentukan kapan state dipertahankan atau dibuang.',
        },
        {
          label: 'Render and Commit',
          href: 'https://react.dev/learn/render-and-commit',
          source: 'React',
          note: 'Menegaskan bahwa re-render tidak otomatis berarti DOM ikut berubah.',
        },
        {
          label: 'Queueing a Series of State Updates',
          href: 'https://react.dev/learn/queueing-a-series-of-state-updates',
          source: 'React',
          note: 'Cara React menggabungkan beberapa perubahan state menjadi satu render.',
        },
        {
          label: 'React Developer Tools',
          href: 'https://react.dev/learn/react-developer-tools',
          source: 'React',
          note: 'Profiler yang memisahkan optimasi berdasar dari tebakan.',
        },
      ),
    ],
  ),

  written(
    'react-compiler',
    'React Compiler dan artinya bagi memoization',
    20,
    'Perubahan besar di React 19 yang mengurangi kebutuhan `useMemo` dan `useCallback` manual.',
    [
      p(
        'Selama bertahun-tahun, "optimasi React" berarti menaburkan `useMemo`, `useCallback`, dan `memo`. React Compiler mengubah itu: ia menganalisis komponenmu saat build dan menyisipkan memoization yang diperlukan secara otomatis.',
      ),

      terms(
        {
          term: 'React Compiler',
          meaning:
            'Alat yang **menganalisis komponenmu saat build** lalu menyisipkan memoization yang diperlukan secara otomatis. Perubahannya besar: selama bertahun-tahun "optimasi React" berarti menaburkan `useMemo` dan `useCallback` dengan tangan, dan compiler menghapus sebagian besar pekerjaan itu.',
        },
        {
          term: 'memoization',
          meaning:
            'Dibaca "me-mo-i-sei-syen", terjemahannya **penyimpanan hasil**. Mengingat hasil sebuah perhitungan agar tidak dihitung ulang selama masukannya tidak berubah. Perlu diingat: ia **tidak gratis** — perbandingan masukan juga memakan waktu dan memori, dan itulah kenapa memoization yang ditaburkan sembarangan justru merugikan.',
        },
        {
          term: 'useMemo',
          meaning:
            'Hook yang mengingat **hasil sebuah perhitungan**. Dipakai saat perhitungannya benar-benar mahal, atau saat hasilnya berupa object atau array yang identitasnya harus tetap stabil antar-render.',
        },
        {
          term: 'useCallback',
          meaning:
            'Hook yang mengingat **sebuah fungsi**. Sebenarnya bentuk khusus dari `useMemo` — `useCallback(fn, deps)` sama persis dengan `useMemo(() => fn, deps)`. Gunanya menjaga identitas fungsi tetap sama agar komponen anak yang di-`memo` tidak ikut re-render.',
        },
        {
          term: 'memo',
          meaning:
            'Pembungkus komponen yang **melewati re-render** kalau props-nya tidak berubah. Perbandingannya dangkal, jadi ia hanya bekerja kalau props berupa object dan fungsi juga stabil — dan itulah kenapa ketiganya (`memo`, `useMemo`, `useCallback`) hampir selalu dipakai bertiga.',
        },
        {
          term: 'referential equality',
          meaning:
            'Terjemahannya **kesamaan berdasarkan alamat**. Akar dari seluruh urusan memoization: `{} === {}` bernilai `false` meski isinya sama, persis seperti yang kamu pelajari di Sub-bab 1.3 Frontend Basic. Object baru yang dibuat tiap render membuat `memo` selalu menganggap props-nya berubah.',
        },
        {
          term: 'Rules of React',
          meaning:
            'Sekumpulan aturan yang **harus dipenuhi** agar compiler bisa bekerja: komponen harus murni, hooks dipanggil di tingkat teratas, dan props maupun state tidak boleh dimutasi. Compiler tidak bisa memperbaiki kode yang melanggarnya — ia hanya akan melewatkan komponen itu.',
        },
        {
          term: 'eslint-plugin-react-hooks',
          meaning:
            'Plugin lint yang menegakkan Rules of React **sebelum** compiler dijalankan. Project ini memakainya, dan aturannya di sini berstatus **error, bukan peringatan** — karena melanggarnya berarti compiler diam-diam berhenti mengoptimalkan komponen itu.',
        },
        {
          term: 'opt-in',
          meaning:
            'Terjemahannya **ikut secara sadar**. React Compiler tidak menyala dengan sendirinya, melainkan harus dipasang dan diaktifkan. Ia juga bisa dijalankan **bertahap**, hanya untuk sebagian folder, sehingga project besar tidak perlu mengubah semuanya sekaligus.',
        },
      ),

      h2('Sebelum dan sesudah'),
      compare(
        {
          title: 'Manual',
          lang: 'tsx',
          code: `
            const filtered = useMemo(
              () => items.filter((i) => i.aktif),
              [items],
            );

            const onKlik = useCallback(
              (id) => hapus(id),
              [hapus],
            );

            export default memo(Daftar);
          `,
          notes: ['Mudah salah dependency', 'Menambah kebisingan'],
        },
        {
          title: 'Dengan Compiler',
          lang: 'tsx',
          code: `
            const filtered = items.filter((i) => i.aktif);

            const onKlik = (id) => hapus(id);

            export default Daftar;
          `,
          notes: ['Compiler menyisipkan memoization', 'Kode kembali terbaca'],
        },
      ),
      p(
        'Perbandingan ini memperlihatkan apa yang sebenarnya dibayar oleh memoization manual, yaitu **kode yang lebih sulit dibaca demi optimasi yang tidak terlihat.** Kolom kanan bukan versi yang lebih lambat, melainkan versi yang sama dengan memoization yang disisipkan compiler saat build alih-alih ditulis tangan. Yang hilang dari kolom kiri layak dicatat satu per satu, yaitu array dependensi yang harus dijaga tetap benar setiap kali kode di dalamnya berubah, pembungkus `useCallback` yang mengaburkan bahwa isinya cuma satu baris, dan `memo()` di ekspor yang mudah terlupa. Ketiganya adalah pekerjaan yang tidak menambah kemampuan apa pun bagi pengguna, dan justru karena mekanis, ia jenis pekerjaan yang paling tepat diserahkan ke alat.',
      ),

      h2('Syaratnya: komponenmu harus murni'),
      code(
        'tsx',
        `
        // Compiler MELEWATI komponen yang melanggar aturan React —
        // ia tidak mengoptimalkan sesuatu yang tidak bisa ia pahami.

        // Yang membuatnya melewati komponenmu:
        //   - mengubah props atau state secara langsung
        //   - efek samping di badan komponen
        //   - memanggil hook di dalam kondisi atau loop
        `,
      ),
      p(
        'Inilah alasan kemurnian dari sub-bab komponen akhirnya punya konsekuensi yang bisa diukur. Compiler menyisipkan memoization dengan **menyimpulkan** kapan hasil sebuah perhitungan pasti sama, dan itu hanya mungkin kalau komponennya berperilaku seperti pure function. Begitu ada yang mengubah props secara langsung atau menjalankan efek samping saat render, compiler tidak bisa lagi menjamin kesimpulannya benar sehingga ia mengambil pilihan yang aman, yaitu **melewati komponen itu sepenuhnya**. Perhatikan apa artinya secara praktis, bahwa kodenya tetap berjalan tanpa error dan hanya optimasinya yang diam-diam tidak diterapkan. Karena itu kotak berikut penting, sebab lint yang menandai pelanggaran adalah satu-satunya cara kamu tahu bahwa sebuah komponen dilewati.',
      ),
      callout(
        'info',
        'ESLint akan memberi tahu — dan itu error, bukan saran',
        'Project ini menjalankan plugin React Compiler lewat ESLint. Dua pelanggaran yang ditemukan di audit sesi lalu, yaitu `useMemo` yang tidak bisa dipertahankan dan `setState` di dalam Effect, keduanya muncul sebagai **error lint** alih-alih peringatan. Perbaiki polanya, jangan matikan aturannya.',
      ),

      h2('Kapan memoization manual masih diperlukan'),
      code(
        'tsx',
        `
        // 1. Perhitungan yang benar-benar berat
        const hasil = useMemo(() => hitungRibuanBaris(data), [data]);

        // 2. Referensi stabil yang dituntut library luar
        const opsi = useMemo(() => ({ tinggi: 400 }), []);
        useEfekPustakaLuar(opsi);

        // 3. Nilai Context yang objek — mencegah seluruh konsumen re-render
        const value = useMemo(() => ({ pengguna, keluar }), [pengguna, keluar]);
        `,
      ),
      p(
        'Ketiga kasus ini punya benang merah yang sama, yaitu Compiler memoization berdasarkan **struktur kode** alih-alih berdasarkan **biaya sungguhan** menjalankannya. Jadi kasus di mana biayanya besar, atau di mana identitas referensinya sendiri yang penting dan bukan sekadar nilainya, tetap butuh campur tangan manual. Kasus pertama jelas, sebab `hitungRibuanBaris` mahal dijalankan sehingga memoization-nya bermanfaat nyata. Kasus kedua berbeda, karena library pihak ketiga seperti grafik, peta, dan editor kadang membandingkan objek opsi lewat referensinya alih-alih isinya, sehingga tanpa `useMemo` objek baru di tiap render membuat library itu mengira konfigurasinya berubah terus-menerus meski isinya identik. Kasus ketiga mengingatkan pada Bab 3, sebab nilai Context berupa objek yang dibuat baru setiap render akan membuat **semua** komponen yang membacanya ikut re-render, jadi memoization objek itu tetap penting terlepas dari Compiler.',
      ),

      h2('Yang tidak berubah'),
      ul(
        'Compiler **tidak** memperbaiki `key` yang salah.',
        'Ia **tidak** memperbaiki fetch waterfall.',
        'Ia **tidak** mengurangi ukuran bundle.',
        'Ia **tidak** membuat daftar 5.000 baris jadi cepat — itu butuh virtualisasi.',
      ),
      callout(
        'warning',
        'Compiler mengoptimalkan memoization, bukan arsitektur',
        'Masalah performa React yang paling sering di aplikasi nyata bukan re-render — melainkan pengambilan data yang berurutan padahal bisa paralel, dan bundle yang membawa library berat ke halaman yang tidak memakainya. Keduanya tidak disentuh Compiler.',
      ),

      h2('Cara kerjanya, singkat'),
      code(
        'tsx',
        `
        // Yang kamu tulis
        function Daftar({ items }) {
          const aktif = items.filter((i) => i.aktif);
          return <ul>{aktif.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }

        // Yang kira-kira dihasilkan Compiler
        function Daftar({ items }) {
          const $ = useMemoCache(2);
          let aktif;
          if ($[0] !== items) {
            aktif = items.filter((i) => i.aktif);
            $[0] = items;
            $[1] = aktif;
          } else {
            aktif = $[1];
          }
          return <ul>{aktif.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }
        `,
      ),
      p(
        'Perhatikan `$[0] !== items`, karena inilah pola dasar semua memoization, yaitu membandingkan masukan sekarang dengan yang tersimpan dari render sebelumnya. Kalau `items` masih objek yang sama persis (*referential equality* dari kotak istilah), compiler memakai `aktif` yang sudah dihitung sebelumnya di `$[1]` tanpa menjalankan `filter` lagi. Kalau berbeda, ia menghitung ulang dan menyimpan hasil barunya. Inilah persis yang `useMemo` lakukan secara manual, dan compiler hanya menuliskannya untukmu di setiap tempat yang aman untuk dilakukan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tabel pesanan digambar ulang setiap kali pengguna mengetik di kotak pencarian, dan tim menghabiskan dua hari menaburkan pembungkus pengoptimalan ke seluruh komponen. Hasilnya kode yang penuh pembungkus, satu bug baru karena daftar dependensi yang tidak lengkap, dan peningkatan kecepatan yang nyaris tidak terukur. Sebulan kemudian React Compiler dinyalakan, seluruh pembungkus itu dihapus, dan hasilnya justru lebih cepat.',
      ),
      p(
        'Compiler mengubah pertanyaan yang perlu kamu jawab. Yang tadinya di mana harus memasang pengoptimalan, kini menjadi apakah kodeku mengikuti aturan React.',
      ),
      compare(
        {
          title: 'Tanpa compiler',
          lang: 'tsx',
          code: `
          const kolom = useMemo(
            () => [
              { kunci: 'nomor', judul: 'Nomor' },
              { kunci: 'status', judul: 'Status' },
            ],
            [],
          );

          const tanganiPilih = useCallback(
            (id: string) => bukaDetail(id),
            [bukaDetail],
          );

          const total = useMemo(
            () => data.reduce((j, d) => j + d.totalSen, 0),
            [data],
          );

          return <Tabel kolom={kolom} onPilih={tanganiPilih} total={total} />;
          `,
          notes: [
            'Tiga pembungkus, tiga daftar dependensi yang harus dijaga tetap benar',
            'Daftar yang salah menghasilkan nilai basi, dan itu bug yang senyap',
          ],
        },
        {
          title: 'Dengan compiler',
          lang: 'tsx',
          code: `
          const kolom = [
            { kunci: 'nomor', judul: 'Nomor' },
            { kunci: 'status', judul: 'Status' },
          ];

          const tanganiPilih = (id: string) => bukaDetail(id);

          const total = data.reduce((j, d) => j + d.totalSen, 0);

          return <Tabel kolom={kolom} onPilih={tanganiPilih} total={total} />;
          `,
          notes: [
            'Compiler menambahkan penyimpanan hasilnya sendiri saat membangun',
            'Tidak ada daftar dependensi yang bisa salah',
          ],
        },
      ),
      p(
        'Yang dihilangkan compiler bukan sekadar baris melainkan **kelas bug tersendiri**. Daftar dependensi yang tidak lengkap menghasilkan nilai basi, yaitu fungsi yang masih memegang nilai lama dari render sebelumnya. Bug itu tidak melempar apa pun dan hanya muncul pada urutan interaksi tertentu, sehingga ia termasuk yang paling sulit direproduksi. Compiler menghitung dependensinya sendiri dari kode yang benar-benar ada.',
      ),
      p(
        'Syaratnya satu, dan syarat itu mutlak, yaitu kodemu harus mengikuti aturan React. Compiler perlu bisa memprediksi kapan sebuah nilai berubah, dan itu hanya mungkin kalau komponenmu tidak punya efek samping tersembunyi. Komponen yang mengubah props di tempat, menulis ke variabel modul saat render, atau memanggil hook secara bersyarat membuat prediksi itu mustahil, dan compiler akan melewatinya.',
      ),
      code(
        'text',
        `
        Yang membuat compiler MELEWATI sebuah komponen:

        - Props atau state diubah di tempat, misalnya lewat push atau sort
        - Variabel di luar komponen ditulis selama render
        - Hook dipanggil di dalam kondisi atau loop
        - DOM disentuh langsung selama render

        Compiler tidak melempar error. Ia hanya diam-diam tidak mengoptimalkan
        komponen itu, dan itulah kenapa aturan lint tetap diperlukan.
        `,
        { caption: 'Aturan React bukan formalitas, melainkan syarat teknis.' },
      ),
      p(
        'Kalimat terakhir itu yang paling perlu dipegang. Compiler tidak memberi tahu bahwa ia melewati komponenmu, sehingga kamu bisa mengira sudah dioptimalkan padahal tidak. Plugin lint resmi React menandai pelanggaran aturan itu sebelum sampai ke compiler, dan pada project yang mengaktifkan compiler termasuk website ini, sebagian pelanggaran justru menjadi error bukan peringatan.',
      ),
      p(
        'Perlu ditegaskan compiler tidak menghapus kebutuhan memahami `useMemo` dan `useCallback`. Keduanya masih diperlukan untuk kasus yang bukan sekadar penyimpanan hasil, misalnya menjaga identitas object yang dipakai sebagai dependensi efek, atau menyimpan hasil perhitungan yang benar-benar mahal dan jarang berubah. Yang hilang adalah pemakaiannya sebagai pengoptimalan rutin di mana-mana.',
      ),
      callout(
        'info',
        'Website ini mengaktifkan React Compiler',
        'Artinya materi di kategori ini ditulis dengan asumsi compiler aktif, dan contoh-contohnya tidak menaburkan `useMemo` di setiap tempat. Kalau project-mu belum mengaktifkannya, contoh-contohnya tetap benar, hanya saja kamu perlu menambahkan pengoptimalan secara manual pada bagian yang terbukti lambat lewat pengukuran.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Compiler mengubah sebagian peringatan menjadi error, dan itu keputusan yang disengaja sebab kode yang melanggar aturannya tidak bisa dioptimalkan dengan aman.',
      ),
      code(
        'text',
        `
        function Daftar({ item }) {
          item.sort((a, b) => a.nama.localeCompare(b.nama));
          return <ul>{item.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>;
        }

        error: Mutating a value returned from a function whose return value
        should not be mutated
        `,
        { caption: 'Props diubah di tempat, dan compiler menolaknya.' },
      ),
      p(
        'Tanpa compiler, kode ini hanya menghasilkan bug yang senyap seperti dibahas di sub-bab props. Dengan compiler, ia menjadi error saat membangun. Ini peningkatan besar, sebab pelanggaran pantangan mutasi yang selama ini hanya terdeteksi lewat gejala kini tertangkap sebelum kodenya berjalan. Perbaikannya `toSorted`, atau salin dulu dengan spread.',
      ),
      code(
        'text',
        `
        let penghitung = 0;

        function Kartu() {
          penghitung += 1;              // menulis variabel modul saat render
          return <div>{penghitung}</div>;
        }

        error: Writing to a variable defined outside a component or hook
        is not allowed
        `,
        { caption: 'Efek samping selama render membuat hasilnya tidak bisa diprediksi.' },
      ),
      p(
        'Render harus menghasilkan hal yang sama untuk masukan yang sama, dan menulis ke variabel di luar melanggar itu. Akibatnya nyata bahkan tanpa compiler, sebab `StrictMode` menjalankan render dua kali sehingga penghitungnya bertambah dua. Ini persis gagasan fungsi murni dari Bab 2 Frontend Basic, dan di React ia bukan anjuran melainkan syarat.',
      ),
      code(
        'text',
        `
        function Kartu({ tampil }) {
          if (!tampil) return null;
          const [buka, setBuka] = useState(false);   // hook setelah return
          return <div>{buka ? 'terbuka' : 'tertutup'}</div>;
        }

        error: React Hook "useState" is called conditionally
        `,
        { caption: 'Aturan hook ditegakkan sebagai error, bukan peringatan.' },
      ),
      p(
        'Tanpa compiler, ini adalah peringatan lint yang bisa diabaikan atau dimatikan. Dengan compiler aktif, ia menjadi error yang menghentikan build. Alasannya sama dengan yang dibahas di Bab 7, yaitu React menyimpan state berdasarkan urutan pemanggilan hook. Compiler menaikkan taruhannya karena ia juga bergantung pada urutan itu untuk menentukan apa yang bisa disimpan hasilnya.',
      ),
      code(
        'text',
        `
        // Komponen tidak melanggar apa pun, dan tetap terasa lambat.
        // Profiler menunjukkan durasi render 180 ms.
        `,
        { caption: 'Compiler tidak mempercepat pekerjaan yang memang mahal.' },
      ),
      p(
        'Compiler menghindari **pekerjaan yang berulang tanpa perlu**, dan sama sekali tidak mempercepat pekerjaan yang memang harus dilakukan. Mengurutkan sepuluh ribu baris tetap memakan waktu yang sama. Kalau Profiler menunjukkan satu komponen memakan ratusan milidetik pada render pertamanya, yang perlu diperbaiki adalah algoritmanya, bukan pengoptimalannya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Mutating a value ... should not be mutated`',
            'Props atau state diubah di tempat',
            'Pakai `toSorted`, atau salin dengan spread',
          ],
          [
            '`Writing to a variable defined outside a component`',
            'Efek samping selama render',
            'Pindahkan ke penangan peristiwa atau efek',
          ],
          [
            '`React Hook ... is called conditionally`',
            'Hook dipanggil setelah `return` atau di dalam kondisi',
            'Panggil seluruh hook di level teratas komponen',
          ],
          [
            'Komponen tidak dioptimalkan tanpa satu pun pesan',
            'Compiler melewatinya karena ada pelanggaran aturan',
            'Jalankan plugin lint React, dan perbaiki temuannya',
          ],
          [
            'Masih lambat walaupun compiler aktif',
            'Pekerjaannya memang mahal, bukan berulang',
            'Perbaiki algoritmanya, atau pindahkan ke luar render',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'React Compiler mengubah kebiasaan yang sudah lama terbentuk, dan sebagian besar kesalahan di bawah berasal dari membawa kebiasaan lama atau dari terlalu memercayainya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tetap menaburkan `useMemo` dan `useCallback` di mana-mana',
            'Kebiasaan lama, dan tidak ada ruginya',
            'Menambah baris dan daftar dependensi yang bisa salah, sementara compiler sudah mengerjakannya. Hapus yang hanya untuk pengoptimalan rutin',
          ],
          [
            'Mengira compiler memperbaiki kode yang melanggar aturan',
            'Ia kan menganalisis kodenya',
            'Ia justru melewati komponen yang melanggar, dan diam-diam. Aturan React tetap wajib diikuti',
          ],
          [
            'Mengira compiler mempercepat semua hal',
            'Namanya juga pengoptimalan',
            'Ia hanya menghindari pekerjaan berulang. Perhitungan yang memang mahal tetap mahal',
          ],
          [
            'Mematikan plugin lint karena compiler sudah ada',
            'Compiler lebih pintar',
            'Lint yang menandai pelanggaran sebelum compiler melewatinya. Tanpa lint, kamu tidak tahu komponen mana yang dilewati',
          ],
          [
            'Menghapus seluruh `useMemo` tanpa memeriksa maksudnya',
            'Compiler menggantikan semuanya',
            'Sebagian `useMemo` ada untuk menjaga identitas object yang dipakai sebagai dependensi efek, bukan untuk kecepatan. Yang itu tetap diperlukan',
          ],
          [
            'Mengaktifkan compiler lalu tidak mengukur apa pun',
            'Pasti lebih cepat',
            'Ukur sebelum dan sesudah di Profiler. Untuk sebagian aplikasi selisihnya kecil, dan manfaat terbesarnya justru kode yang lebih bersih',
          ],
        ],
      ),
      p(
        'Baris kelima layak diperiksa sebelum menghapus apa pun. Ada `useMemo` yang ada bukan demi kecepatan melainkan demi **identitas**, misalnya object pengaturan yang menjadi dependensi sebuah efek. Kalau identitasnya berubah tiap render, efeknya berjalan terus. Compiler biasanya menangani ini juga, dan pada kasus yang rumit ia bisa melewatinya. Hapus bertahap, dan perhatikan apakah ada efek yang mulai berjalan lebih sering.',
      ),
      callout(
        'tip',
        'Cara memeriksa apakah compiler benar-benar bekerja',
        'React DevTools menandai komponen yang dioptimalkan compiler dengan lencana khusus. Buka tab Components, pilih sebuah komponen, dan lihat apakah lencananya ada. Kalau sebuah komponen yang kamu harapkan dioptimalkan ternyata tidak bertanda, jalankan plugin lint pada berkas itu dan hampir selalu ada pelanggaran aturan di dalamnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Compiler menyisipkan memoization otomatis — `useMemo`/`useCallback` manual jauh berkurang.',
        'Ia melewati komponen yang melanggar aturan React; ESLint yang memberi tahu.',
        'Masih perlu manual untuk perhitungan berat, referensi untuk library luar, dan nilai Context.',
        'Ia tidak memperbaiki `key`, waterfall, ukuran bundle, atau daftar sangat panjang.',
      ),
      references(
        {
          label: 'React Compiler',
          href: 'https://react.dev/learn/react-compiler',
          source: 'React',
          note: 'Cara memasang, mengaktifkan bertahap, dan batas yang tidak bisa ia selesaikan.',
        },
        {
          label: 'Rules of React',
          href: 'https://react.dev/reference/rules',
          source: 'React',
          note: 'Aturan yang wajib dipenuhi agar compiler mau mengoptimalkan sebuah komponen.',
        },
        {
          label: 'useMemo',
          href: 'https://react.dev/reference/react/useMemo',
          source: 'React',
          note: 'Termasuk catatan resmi kapan memoization manual masih benar-benar diperlukan.',
        },
        {
          label: 'memo',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Menjelaskan shallow comparison props dan kenapa ia gagal tanpa identitas yang stabil.',
        },
        {
          label: 'React 19',
          href: 'https://react.dev/blog/2024/12/05/react-19',
          source: 'React',
          note: 'Konteks perubahan versi 19, termasuk `ref` sebagai prop dan arah compiler.',
        },
      ),
    ],
  ),

  written(
    'praktik-halaman-profil',
    'Praktik: Halaman profil dari data statis',
    24,
    'Menyusun beberapa komponen jadi satu halaman — tanpa satu pun state.',
    [
      p(
        'Praktik ini sengaja **tanpa state sama sekali**. Tujuannya melatih hal yang paling menentukan kualitas kode React: memecah tampilan menjadi komponen, dan mengalirkan data lewat props.',
      ),

      terms(
        {
          term: 'data dulu, komponen kemudian',
          meaning:
            'Urutan kerja yang dipakai praktik ini. Merancang **bentuk datanya** lebih dulu membuat pembagian komponen muncul dengan sendirinya — biasanya satu komponen per satuan data. Urutan sebaliknya sering menghasilkan komponen yang bentuknya dipaksakan mengikuti tampilan, lalu berantakan saat datanya berubah.',
        },
        {
          term: 'komponen daun',
          meaning:
            'Terjemahan dari *leaf component*. Komponen di ujung pohon yang **tidak tahu-menahu dari mana datanya datang** — ia hanya menerima props dan menampilkannya. Inilah komponen yang paling mudah dipakai ulang, diuji, dan dipindahkan.',
        },
        {
          term: 'hierarki komponen',
          meaning:
            'Susunan komponen dari halaman di puncak sampai daun di ujung. Pertanyaan penuntunnya bukan "apa yang terlihat sebagai satu kotak", melainkan **"apa yang berubah bersamaan"** — bagian yang selalu berubah bersama sebaiknya tinggal bersama.',
        },
        {
          term: 'kapan memecah',
          meaning:
            'Dua tanda yang cukup jelas: bagian itu **berulang**, atau ia punya **satu tanggung jawab yang bisa disebutkan dalam satu kalimat**. Memecah sebelum salah satunya muncul hanya menambah berkas yang harus dibuka tanpa manfaat apa pun.',
        },
        {
          term: 'empty state',
          meaning:
            'Terjemahan dari *empty state*. Tanggung jawabnya ada di **komponen daftar itu sendiri**, bukan di pemanggilnya. Alasannya sederhana: daftar itu yang tahu isinya kosong, dan menaruhnya di pemanggil berarti setiap pemanggil baru harus mengingatnya lagi.',
        },
        {
          term: 'data statis',
          meaning:
            'Data yang ditulis langsung di kode, bukan diambil dari server. Sengaja dipakai di praktik ini agar perhatianmu tertuju penuh pada **struktur komponen** — pengambilan data dan state datang di bab berikutnya.',
        },
        {
          term: 'semantik HTML',
          meaning:
            'Memilih tag menurut **maknanya**, bukan tampilannya: `<article>` untuk satuan yang berdiri sendiri, `<section>` untuk bagian bertema, `<nav>` untuk navigasi. Manfaatnya nyata bagi pembaca layar — dan `<div>` untuk segalanya menghapus seluruh manfaat itu.',
        },
        {
          term: 'props sebagai kontrak',
          meaning:
            'Daftar props sebuah komponen adalah **janji tentang apa yang ia butuhkan**. Menuliskannya sebagai tipe membuat janji itu diperiksa mesin — dan sekaligus menjadi dokumentasi yang tidak bisa basi, seperti yang kamu pelajari di Sub-bab 6.7 Frontend Basic.',
        },
      ),

      h2('1. Data'),
      code(
        'ts',
        `
        export type Proyek = {
          id: string;
          nama: string;
          ringkasan: string;
          tag: string[];
          status: 'aktif' | 'arsip';
        };

        export type Profil = {
          nama: string;
          peran: string;
          bio: string;
          proyek: Proyek[];
        };

        export const profil: Profil = {
          nama: 'Zum',
          peran: 'Fullstack Developer',
          bio: 'Sedang belajar dari JavaScript sampai deployment.',
          proyek: [
            {
              id: 'p1',
              nama: 'Ruang Belajar',
              ringkasan: 'Website kurikulum fullstack dengan progres tersimpan lokal.',
              tag: ['Next.js', 'TypeScript'],
              status: 'aktif',
            },
            {
              id: 'p2',
              nama: 'To-Do DOM',
              ringkasan: 'Latihan manipulasi DOM tanpa framework.',
              tag: ['JavaScript'],
              status: 'arsip',
            },
          ],
        };
        `,
        { filename: 'src/data/profil.ts' },
      ),
      p(
        "Berkas ini ditulis **lebih dulu, sebelum satu komponen pun**, dan urutan itu yang dianjurkan kotak berikutnya. Perhatikan `status: 'aktif' | 'arsip'` ditulis sebagai union literal alih-alih `string`, sehingga salah ketik `'arsipp'` tertangkap saat mengetik dan `KartuProyek` nanti bisa membandingkannya dengan aman. Perhatikan juga tiap proyek punya `id` yang **terpisah dari `nama`**, sebab id-lah yang nanti menjadi `key` saat merender daftar, dan memakai nama sebagai key akan rapuh begitu ada dua proyek bernama sama. Field `tag` berupa array karena satu proyek boleh punya beberapa label, dan bentuk array itulah yang menentukan bahwa nanti akan ada `map` bersarang di dalam kartu. Inilah maksud \"komponen mengikuti bentuk data\", sebab hampir semua keputusan struktur komponen sudah tersirat di berkas ini.",
      ),
      callout(
        'tip',
        'Rancang bentuk datanya sebelum komponennya',
        'Komponen mengikuti bentuk data, bukan sebaliknya. Kalau kamu mulai dari komponen, kamu akan menemukan props yang aneh dan data yang harus dibentuk ulang di banyak tempat.',
      ),

      h2('2. Memecah jadi komponen'),
      code(
        'text',
        `
        HalamanProfil
        ├── HeaderProfil     (nama, peran, bio)
        ├── DaftarProyek     (proyek[])
        │   └── KartuProyek  (satu proyek)
        │       └── Label    (satu tag)
        └── FooterProfil
        `,
      ),
      p(
        'Aturan sederhana untuk memecah: **kalau ia muncul lebih dari sekali, atau punya satu tanggung jawab yang bisa disebut dalam satu kalimat — jadikan komponen.**',
      ),

      h2('3. Komponen daun'),
      code(
        'tsx',
        `
        export function Label({ children }: { children: React.ReactNode }) {
          return (
            <span className="bg-raised text-muted rounded-full px-2 py-0.5 text-xs">
              {children}
            </span>
          );
        }
        `,
        { filename: 'src/components/Label.tsx' },
      ),
      code(
        'tsx',
        `
        import type { Proyek } from '../data/profil';
        import { Label } from './Label';

        export function KartuProyek({ proyek }: { proyek: Proyek }) {
          return (
            <article className="border-border bg-surface rounded-lg border p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-text min-w-0 font-medium">{proyek.nama}</h3>

                {proyek.status === 'arsip' && (
                  <span className="text-faint shrink-0 text-xs">Arsip</span>
                )}
              </div>

              <p className="text-muted mt-2 text-sm">{proyek.ringkasan}</p>

              {proyek.tag.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {proyek.tag.map((t) => (
                    <li key={t}>
                      <Label>{t}</Label>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        }
        `,
        { filename: 'src/components/KartuProyek.tsx' },
      ),
      p(
        '`Label` adalah komponen daun yang paling murni, sebab ia hanya menerima `children` dan membungkusnya dengan gaya. Ia tidak tahu isinya tag proyek, dan justru itu yang membuatnya bisa dipakai untuk apa pun. `KartuProyek` di bawahnya menyusun satu tingkat lebih tinggi, dan dua `&&` di dalamnya adalah penerapan langsung dari sub-bab rendering kondisional. Perhatikan yang dipakai `proyek.tag.length > 0` alih-alih `proyek.tag.length`, sesuai jebakan angka nol yang sudah dibahas. Perhatikan juga `<article>` dipilih untuk kartu karena ia satuan yang berdiri sendiri, dan tiap tag dibungkus `<li>` di dalam `<ul>` karena ia memang daftar. Semantik itulah yang membuat pembaca layar mengumumkan "daftar dengan tiga item" alih-alih membacakan tiga kata yang menggantung. Terakhir, `key={t}` di sini sah karena isi tag unik dalam satu proyek.',
      ),

      h2('4. Daftar dengan empty state'),
      code(
        'tsx',
        `
        export function DaftarProyek({ proyek }: { proyek: Proyek[] }) {
          if (proyek.length === 0) {
            return (
              <p className="border-border text-muted rounded-lg border border-dashed p-6 text-sm">
                Belum ada proyek yang ditampilkan.
              </p>
            );
          }

          return (
            <ul className="grid gap-4 sm:grid-cols-2">
              {proyek.map((p) => (
                <li key={p.id}>
                  <KartuProyek proyek={p} />
                </li>
              ))}
            </ul>
          );
        }
        `,
      ),
      p(
        'Komponen ini memakai early return untuk memisahkan dua keadaan, dan perhatikan empty state-nya **tidak sekadar dikosongkan**, melainkan punya kotak bergaris putus-putus dengan kalimat yang menjelaskan. Bedanya nyata bagi pengguna, sebab area kosong tanpa penjelasan tidak bisa dibedakan dari halaman yang rusak. Cabang berhasil merender `<ul>` dengan `grid gap-4 sm:grid-cols-2`, artinya satu kolom di layar sempit dan dua kolom mulai ukuran `sm`, mengikuti pendekatan *mobile-first* dari Bab 4. Perhatikan pembagian tanggung jawab antara komponen ini dan `KartuProyek`, di mana `DaftarProyek` mengurus **susunan dan empty state** sedangkan tampilan tiap kartu sepenuhnya urusan `KartuProyek`. Karena itu mengubah tata letak grid tidak menyentuh kartu, dan sebaliknya.',
      ),
      callout(
        'warning',
        'Empty state bukan opsional',
        'Daftar tanpa penanganan kosong akan menampilkan area kosong tanpa penjelasan — tidak bisa dibedakan dari halaman yang rusak. Ini kebiasaan yang sama dengan yang kamu bangun di Frontend Basic Bab 5.',
      ),

      h2('5. Merakit'),
      code(
        'tsx',
        `
        import { profil } from './data/profil';
        import { DaftarProyek } from './components/DaftarProyek';

        export default function App() {
          return (
            <main className="mx-auto max-w-4xl px-4 py-12">
              <header>
                <h1 className="text-text text-3xl font-semibold tracking-tight">
                  {profil.nama}
                </h1>
                <p className="text-primary mt-1 text-sm">{profil.peran}</p>
                <p className="text-muted mt-4 max-w-prose">{profil.bio}</p>
              </header>

              <section className="mt-12" aria-labelledby="proyek">
                <h2 id="proyek" className="text-text text-lg font-semibold">
                  Proyek
                </h2>
                <div className="mt-4">
                  <DaftarProyek proyek={profil.proyek} />
                </div>
              </section>
            </main>
          );
        }
        `,
      ),
      p(
        'Perhatikan bagaimana `App` tidak menyimpan state atau logika apa pun — ia hanya membaca `profil` dari modul data, menata heading dan struktur semantik (`<main>`, `<header>`, `<section aria-labelledby>`), lalu menyerahkan daftar proyek ke `DaftarProyek`. Ini penerapan langsung dari "satu tanggung jawab" yang dibahas sepanjang bab ini: `App` bertanggung jawab atas **tata letak halaman**, `DaftarProyek` atas **cara menampilkan sebuah daftar** (termasuk empty state-nya dari langkah sebelumnya), dan `KartuProyek` di dalamnya atas **cara menampilkan satu proyek**. Setiap komponen bisa dibaca dan diuji tanpa perlu memahami dua lainnya.',
      ),

      h2('6. Kesalahan yang harus kamu hindari'),
      code(
        'tsx',
        `
        {proyek.tag.length && <ul>…</ul>}          // menampilkan 0 saat kosong
        {proyek.map((p, i) => <li key={i}>…</li>)} // key indeks pada daftar yang bisa berubah
        function App() { function Kartu() {…} }    // komponen di dalam komponen
        <KartuProyek {...proyek} />                // props melebar tanpa kontrak jelas
        `,
      ),
      p(
        'Keempatnya layak dibongkar satu per satu karena semuanya **type-check dengan sempurna**, sehingga tidak ada yang akan ditangkap compiler. Pada baris pertama, `proyek.tag.length` bernilai `0` saat array-nya kosong, dan React **merender** angka `0` sebagai teks alih-alih menganggapnya `falsy` seperti yang diharapkan, sehingga solusinya adalah `proyek.tag.length > 0 && ...` yang menghasilkan boolean sungguhan. Pada baris kedua, indeks array sebagai `key` terlihat bekerja sampai urutan proyeknya berubah karena disaring, diurutkan ulang, atau satu dihapus. Di titik itu React mencocokkan elemen yang salah dan state internal komponen bisa tertukar antar-baris, persis kasus yang dibahas Sub-bab 2.1. Pada baris ketiga, mendefinisikan `Kartu` di dalam `App` berarti fungsi `Kartu` **dibuat ulang setiap kali `App` dirender**, sehingga dari sudut pandang React itu selalu jadi "komponen baru" dan seluruh state di dalamnya di-reset setiap render. Pada baris keempat, `{...proyek}` menyebar seluruh properti objek `proyek` sebagai props tanpa kontrak eksplisit, sehingga kalau bentuk `proyek` berubah nanti karena field ditambah atau diganti nama, `KartuProyek` ikut menerima props yang tidak diduga tanpa satu pun peringatan dari TypeScript.',
      ),

      checklist(
        'frontend-intermediate/fundamental-reactjs/praktik',
        'Checklist praktik 2.11',
        'Bentuk data dirancang lebih dulu, sebelum komponen',
        'Minimal empat komponen, masing-masing satu tanggung jawab',
        'Tidak ada komponen yang didefinisikan di dalam komponen lain',
        '`key` memakai id yang stabil, bukan indeks',
        'Kondisional memakai `length > 0 &&`, bukan `length &&`',
        'Empty state ditangani dengan kalimat yang menjelaskan',
        'Semua props punya tipe eksplisit',
        'Tidak ada nilai warna atau spacing mentah — semuanya token',
        'Struktur heading benar: satu `h1`, lalu `h2` untuk tiap bagian',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman profil yang baru kamu bangun bekerja. Sekarang tiga permintaan datang sekaligus, yaitu tampilkan lencana verifikasi kalau akunnya terverifikasi, tampilkan daftar keahlian yang bisa disaring, dan pastikan halamannya tetap berguna saat sebagian data tidak ada. Ketiganya menyentuh seluruh materi bab ini, dan yang ketiga adalah yang paling sering dilewati.',
      ),
      p(
        'Bentuk di bawah menggabungkan enam sub-bab sebelumnya menjadi satu halaman yang siap menghadapi data sungguhan.',
      ),
      code(
        'tsx',
        `
        type Profil = {
          id: string;
          nama: string;
          bio: string | null;              // boleh kosong, dan itu wajar
          fotoUrl: string | null;
          terverifikasi: boolean;
          keahlian: Keahlian[];
        };

        type Props = {
          profil: Profil;
          memuat?: boolean;
        };

        export function HalamanProfil({ profil, memuat = false }: Props) {
          const [saring, setSaring] = useState('');

          // Hitung di atas return, dan jangan ubah array aslinya.
          const keahlianTerlihat = profil.keahlian.filter((k) =>
            k.nama.toLowerCase().includes(saring.toLowerCase()),
          );

          return (
            <main aria-busy={memuat}>
              <KepalaProfil profil={profil} />

              {/* bio boleh null, jadi keadaan kosongnya ditulis eksplisit */}
              {profil.bio ? (
                <p className="bio">{profil.bio}</p>
              ) : (
                <p className="bio bio-kosong">Belum ada bio</p>
              )}

              <SaringKeahlian nilai={saring} onUbah={setSaring} />
              <DaftarKeahlian keahlian={keahlianTerlihat} adaSaring={saring !== ''} />
            </main>
          );
        }
        `,
        { filename: 'src/profil/HalamanProfil.tsx' },
      ),
      code(
        'tsx',
        `
        function KepalaProfil({ profil }: { profil: Profil }) {
          return (
            <header className="kepala-profil">
              {/* Gambar boleh tidak ada. Jangan render img dengan src kosong. */}
              {profil.fotoUrl ? (
                <img
                  src={profil.fotoUrl}
                  alt={\`Foto profil \${profil.nama}\`}
                  width={96}
                  height={96}          // width dan height mencegah pergeseran tata letak
                />
              ) : (
                <div className="foto-kosong" aria-hidden="true">
                  {profil.nama.charAt(0).toUpperCase()}
                </div>
              )}

              <h1>
                {profil.nama}
                {profil.terverifikasi && (
                  // Ikon saja tidak cukup. Beri nama yang bisa dibaca pembaca layar.
                  <IkonVerifikasi role="img" aria-label="Akun terverifikasi" />
                )}
              </h1>
            </header>
          );
        }

        function DaftarKeahlian({ keahlian, adaSaring }: DaftarProps) {
          if (keahlian.length === 0) {
            return (
              <p className="kosong">
                {adaSaring
                  ? 'Tidak ada keahlian yang cocok dengan pencarianmu'
                  : 'Belum menambahkan keahlian'}
              </p>
            );
          }

          return (
            <ul className="keahlian">
              {keahlian.map((k) => (
                <li key={k.id}>{k.nama}</li>
              ))}
            </ul>
          );
        }
        `,
        { filename: 'src/profil/bagian.tsx' },
      ),
      p(
        'Tipe `bio: string | null` dan `fotoUrl: string | null` bukan kelengkapan formalitas. Menuliskan bahwa keduanya boleh kosong memaksa TypeScript menolak kode yang memakainya tanpa memeriksa, dan itu yang membuat keadaan kosongnya tidak mungkin lupa ditulis. Ini penerapan langsung materi Bab 6 Frontend Basic, yaitu tipe yang jujur tentang ketiadaan nilai.',
      ),
      p(
        'Atribut `width` dan `height` pada gambar mencegah pergeseran tata letak saat gambar selesai dimuat, dan itu bagian dari baseline performa project ini. Tanpa keduanya, seluruh isi halaman melompat ke bawah begitu gambar muncul, dan itu salah satu penyebab terbesar skor Cumulative Layout Shift yang buruk. Biayanya dua atribut.',
      ),
      p(
        'Ikon verifikasi diberi `role="img"` dan `aria-label`, sebab ikon tanpa nama tidak berarti apa-apa bagi pengguna pembaca layar. Ini aturan yang sama dengan yang dibahas di Bab 4 Frontend Basic, yaitu jangan menyampaikan informasi hanya lewat bentuk visual. Sebaliknya `div` foto pengganti diberi `aria-hidden` karena huruf inisial di dalamnya adalah hiasan, dan nama penggunanya sudah dibacakan lewat judul.',
      ),
      p(
        'Dua pesan kosong yang berbeda untuk daftar keahlian menutup masalah yang sudah dibahas di Bab 5 Frontend Basic. Kosong karena saringan dan kosong karena memang belum ada adalah dua keadaan berbeda yang menuntut tindakan berbeda dari pengguna. Membedakannya hanya butuh satu prop tambahan, dan hasilnya pesan yang benar-benar menolong.',
      ),
      callout(
        'tip',
        'Urutan membangun halaman yang jarang meninggalkan keadaan tertinggal',
        'Mulai dari bentuk datanya, dan tuliskan mana yang boleh kosong. Lalu tulis keadaan kosong dan gagalnya. Baru terakhir jalur suksesnya. Kalau dibalik, keadaan kosong dan gagal akan menjadi tambalan yang tidak konsisten, sebab keduanya jarang muncul saat mengembangkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul saat halaman seperti ini bertemu data sungguhan.',
      ),
      code(
        'text',
        `
        <p>{profil.bio.slice(0, 100)}</p>

        TypeError: Cannot read properties of null (reading 'slice')
        `,
        { caption: 'Field yang boleh kosong dipakai tanpa diperiksa.' },
      ),
      p(
        "Dengan tipe `bio: string | null`, TypeScript menolak kode ini sebelum dijalankan dengan pesan `'profil.bio' is possibly 'null'`. Tanpa tipe, ia lolos sampai ada satu pengguna yang belum mengisi bio. Inilah yang membuat menuliskan `| null` di tipe jauh lebih berharga daripada terlihat, sebab ia memindahkan kegagalan dari produksi ke waktu build.",
      ),
      code(
        'text',
        `
        <img src={profil.fotoUrl} alt="" />

        // fotoUrl bernilai null.
        // Peramban meminta alamat halaman itu sendiri sebagai gambar,
        // lalu gagal, lalu menampilkan ikon gambar rusak.
        `,
        { caption: 'Tidak ada error di console, dan permintaan sia-sia tetap dikirim.' },
      ),
      p(
        'Atribut `src` bernilai `null` diubah menjadi teks kosong, dan peramban memperlakukan teks kosong sebagai alamat halaman saat ini. Akibatnya satu permintaan jaringan sia-sia untuk tiap gambar yang kosong, dan pada daftar berisi lima puluh profil itu lima puluh permintaan. Jangan render elemen `img` sama sekali kalau alamatnya tidak ada.',
      ),
      code(
        'text',
        `
        <img src={profil.fotoUrl} />

        Warning: Image elements must have an alt prop, either with meaningful
        text, or an empty string for decorative images.
        `,
        { caption: 'Peringatan dari plugin lint aksesibilitas, bukan dari React.' },
      ),
      p(
        'Peringatan ini datang dari `eslint-plugin-jsx-a11y` yang aktif pada sebagian besar penyiapan React termasuk Next.js. Yang perlu diputuskan bukan sekadar mengisinya melainkan memilih di antara dua kemungkinan. Gambar yang membawa informasi butuh `alt` yang menjelaskan, sedangkan gambar hiasan butuh `alt=""` supaya pembaca layar melewatinya. Mengisi `alt="gambar"` adalah pilihan terburuk sebab ia mengumumkan sesuatu yang tidak berguna.',
      ),
      code(
        'text',
        `
        // Halaman terlihat benar. Lalu gambar profil selesai dimuat,
        // dan seluruh isi halaman melompat 96 piksel ke bawah.
        `,
        { caption: 'Pergeseran tata letak, tanpa satu pun pesan.' },
      ),
      p(
        'Sebelum gambar terunduh, peramban tidak tahu ukurannya sehingga menyediakan ruang nol. Begitu terunduh, ruang itu tiba-tiba terisi dan mendorong seluruh isi di bawahnya. Pengguna yang sedang hendak mengklik sesuatu bisa mengklik hal yang salah. Atribut `width` dan `height` menyelesaikannya sepenuhnya, dan keduanya tetap berlaku walaupun ukuran akhirnya diatur CSS.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of null`',
            'Field yang boleh kosong dipakai tanpa diperiksa',
            'Tuliskan `| null` di tipenya, lalu tangani keadaan kosongnya',
          ],
          [
            'Ikon gambar rusak dan permintaan sia-sia',
            '`src` bernilai `null` diubah menjadi teks kosong',
            'Jangan render `img` sama sekali kalau alamatnya tidak ada',
          ],
          [
            '`Image elements must have an alt prop`',
            'Atribut `alt` tidak diisi',
            'Isi dengan teks yang menjelaskan, atau `alt=""` untuk hiasan',
          ],
          [
            'Isi halaman melompat saat gambar muncul',
            'Ukuran gambar belum diketahui sebelum terunduh',
            'Selalu tulis `width` dan `height`',
          ],
          [
            'Pesan kosong menyesatkan',
            'Satu pesan untuk kosong karena saringan dan kosong karena belum ada data',
            'Bedakan keduanya lewat prop',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini menggabungkan seluruh materi, dan kesalahan yang muncul di sini hampir selalu berupa keadaan yang tidak dipikirkan sejak awal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis tipe data tanpa menandai field yang boleh kosong',
            'Datanya biasanya terisi',
            'Kegagalan berpindah dari waktu build ke produksi, dan muncul pada pengguna pertama yang belum melengkapi profilnya',
          ],
          [
            'Menguji hanya dengan satu profil yang lengkap',
            'Itu bentuk data yang normal',
            'Profil tanpa foto, tanpa bio, tanpa keahlian, dan dengan nama sangat panjang adalah empat kasus yang paling sering merusak tampilan',
          ],
          [
            'Menyampaikan status verifikasi hanya lewat ikon',
            'Ikonnya jelas terlihat',
            'Pengguna pembaca layar tidak mendapat informasinya sama sekali. Beri `aria-label`',
          ],
          [
            'Melupakan `width` dan `height` pada gambar',
            'Ukurannya kan sudah diatur CSS',
            'Sebelum gambar terunduh peramban tidak tahu ukurannya, dan tata letak melompat saat ia muncul',
          ],
          [
            'Menaruh state saringan di komponen halaman',
            'Supaya bisa dijangkau dari mana-mana',
            'Setiap ketikan menggambar ulang seluruh halaman termasuk kepala profil. Simpan sedekat mungkin dengan yang memakainya',
          ],
          [
            'Memakai indeks sebagai `key` pada daftar keahlian',
            'Daftarnya kan tidak pernah diurutkan',
            'Ia bisa disaring, dan menyaring mengubah posisi. Pakai id',
          ],
        ],
      ),
      p(
        'Baris kedua layak dijadikan kebiasaan tetap sebelum menyatakan sebuah halaman selesai. Siapkan empat data uji, yaitu yang lengkap, yang seluruh field opsionalnya kosong, yang teksnya sangat panjang, dan yang daftarnya kosong. Membuka keempatnya memakan dua menit, dan ia menemukan sebagian besar masalah tampilan yang biasanya baru dilaporkan pengguna.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'Komponen sebagai fungsi yang mengembalikan deskripsi, props sebagai nilai yang hanya bisa dibaca, `key` sebagai identitas bukan posisi, dan empat keadaan tampilan yang ditulis sejak awal. Bab berikutnya menambahkan satu hal yang belum ada di sini, yaitu ingatan yang bertahan antar-render, dan itulah yang disebut state.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Rancang bentuk data sebelum komponen.',
        'Pecah jadi komponen saat ia berulang atau punya satu tanggung jawab yang jelas.',
        'Komponen daun tidak tahu-menahu soal data induknya.',
        'Empty state ditangani di komponen daftar, bukan di pemanggilnya.',
        'Bab berikutnya menambahkan state — dan semua kebiasaan ini tetap berlaku.',
      ),
      references(
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Urutan resmi yang dipakai praktik ini: rancang data dulu, baru pecah jadi komponen.',
        },
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Kapan sebuah bagian layak dipecah menjadi komponen tersendiri.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Props sebagai kontrak masuk — dasar seluruh aliran data di praktik ini.',
        },
        {
          label: 'HTML: content sectioning',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements',
          source: 'MDN',
          note: 'Memilih `<article>`, `<section>`, dan `<nav>` menurut maknanya, bukan tampilannya.',
        },
        {
          label: 'Adding Interactivity',
          href: 'https://react.dev/learn/adding-interactivity',
          source: 'React',
          note: 'Titik masuk bab berikutnya — state, event, dan perubahan yang terjadi seiring waktu.',
        },
      ),
    ],
  ),
];
