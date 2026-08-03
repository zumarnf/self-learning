import {
  callout,
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
 * Frontend Basic — Chapter 6, all eleven lessons. Closes the category and bridges into React.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-jsx',
    'Kenapa Ada JSX: dari DOM manual ke deklaratif',
    10,
    'Masalah yang dipecahkan JSX, dilihat langsung dari kode DOM yang baru saja kamu tulis di Bab 4.',
    [
      p(
        'Di Bab 4 kamu menulis `render()` yang mengosongkan wadah lalu membangun ulang isinya. Itu bekerja — tapi ada dua masalah yang muncul begitu aplikasinya membesar.',
      ),

      terms(
        {
          term: 'JSX',
          meaning:
            'Singkatan *JavaScript XML*, dibaca "je-es-eks". Sintaks tambahan yang membuatmu bisa menulis bentuk tampilan **seperti HTML di dalam berkas JavaScript**. Yang penting dipahami sejak awal: browser **tidak mengerti JSX sama sekali** — ia harus diterjemahkan dulu jadi pemanggilan fungsi biasa, dan Sub-bab 6.4 menunjukkan hasil terjemahannya.',
        },
        {
          term: 'imperatif',
          meaning:
            'Dari *imperative*, artinya **memerintah langkah demi langkah**. Gaya kode yang kamu tulis di Bab 4: buat elemen, isi teksnya, sambungkan ke induknya. Kamu memberi tahu komputer **caranya**. Kelemahannya bukan teknis melainkan manusiawi — untuk tahu hasilnya, pembaca harus menjalankan kodenya di kepala dulu.',
        },
        {
          term: 'deklaratif',
          meaning:
            'Dari *declarative*, artinya **menyatakan hasil yang diinginkan**. Kamu menggambarkan **bentuk akhirnya** dan membiarkan sistem yang menentukan langkah menuju ke sana. JSX bersifat deklaratif, dan itulah sebabnya ia bisa dibaca sekali lihat: bentuk kodenya menyerupai bentuk hasilnya.',
        },
        {
          term: 'render',
          meaning:
            'Artinya **menghasilkan tampilan**. Di Bab 4 kamu menulis fungsi `render()` sendiri yang mengosongkan wadah lalu membangun ulang isinya. React mengotomatiskan proses itu — dan karena kamu sudah pernah menulisnya manual, kamu tahu persis apa yang diotomatiskan.',
        },
        {
          term: 'Virtual DOM',
          meaning:
            'Terjemahannya **DOM maya**. Gambaran ringan struktur tampilan yang disimpan React di memori sebagai object biasa. React membandingkan gambaran baru dengan yang lama, lalu **hanya menyentuh bagian DOM yang benar-benar berubah** — alih-alih membangun ulang semuanya seperti pola Bab 4.',
        },
        {
          term: 'reconciliation',
          meaning:
            'Dibaca "re-kon-si-li-ei-syen", terjemahannya **pencocokan**. Proses React membandingkan dua gambaran Virtual DOM untuk menentukan perubahan seminimal mungkin. Ini yang membuat elemen tidak dibuat ulang tanpa perlu — sehingga fokus, posisi kursor, dan nilai input yang belum dikirim tidak ikut hilang.',
        },
        {
          term: 'state',
          meaning:
            'Terjemahannya **keadaan**. Data yang bisa berubah dan menentukan seperti apa tampilan saat ini. Prinsip yang dibawa JSX dan React: **tampilan adalah hasil perhitungan dari state** — ubah state, dan tampilan menyesuaikan sendiri.',
        },
        {
          term: 'kehilangan keadaan',
          meaning:
            'Akibat nyata dari membangun ulang seluruh DOM: fokus keyboard pindah, teks yang sedang diketik hilang, posisi gulir kembali ke atas, dan animasi terputus. Inilah masalah kedua yang dipecahkan pendekatan deklaratif — bukan sekadar soal kecepatan.',
        },
      ),

      h2('Masalah 1: kamu menuliskan langkahnya, bukan hasilnya'),
      code(
        'js',
        `
        // Imperatif: kamu memberi tahu CARANYA, langkah demi langkah
        const li = document.createElement('li');
        li.className = tugas.selesai ? 'selesai' : '';
        const label = document.createElement('span');
        label.textContent = tugas.judul;
        const btn = document.createElement('button');
        btn.textContent = 'Hapus';
        li.append(label, btn);
        wadah.append(li);
        `,
      ),
      code(
        'jsx',
        `
        // Deklaratif: kamu menggambarkan HASILNYA
        <li className={tugas.selesai ? 'selesai' : ''}>
          <span>{tugas.judul}</span>
          <button>Hapus</button>
        </li>
        `,
      ),
      p(
        'Yang kedua bisa dibaca sekali lihat karena bentuknya menyerupai hasil akhirnya. Yang pertama harus kamu jalankan di kepala dulu.',
      ),

      h2('Masalah 2: membangun ulang semuanya itu mahal dan merusak'),
      code(
        'js',
        `
        // Pola Bab 4: kosongkan, bangun ulang
        wadah.replaceChildren();
        for (const t of tugas) wadah.append(buatBaris(t));

        // Konsekuensinya, setiap kali satu tugas berubah:
        //   - seluruh baris dibuat ulang, meski hanya satu yang berubah
        //   - fokus keyboard hilang
        //   - input yang sedang diketik di dalam baris ter-reset
        //   - posisi scroll bisa melompat
        `,
      ),
      p(
        'React memakai deskripsi deklaratif itu untuk **membandingkan** hasil baru dengan yang lama, lalu mengubah **hanya bagian yang benar-benar berbeda** di DOM sungguhan. Kamu tetap menulis "seperti membangun ulang semuanya"; React yang mengerjakan pembaruan minimalnya.',
      ),
      callout(
        'info',
        'Inilah alasan Bab 4 ditulis sebelum bab ini',
        'Tanpa pernah menulis kode DOM manual, "React itu deklaratif" hanya jadi slogan. Sekarang kamu tahu persis apa yang diotomatiskan — dan kenapa itu sepadan.',
      ),

      h2('JSX bukan HTML, bukan template'),
      table(
        ['', 'HTML', 'Template engine', 'JSX'],
        [
          ['Dievaluasi', 'Browser', 'Saat build/render', '**Dikompilasi jadi JavaScript**'],
          ['Logika', 'Tidak ada', 'Sintaks khusus (`{% if %}`)', 'JavaScript biasa'],
          [
            'Kesalahan ketik tag',
            'Diabaikan diam-diam',
            'Error saat render',
            '**Error saat build**',
          ],
          ['Bisa disimpan di variabel', 'Tidak', 'Tidak', '**Ya**'],
        ],
      ),
      code(
        'jsx',
        `
        // JSX adalah NILAI — bisa disimpan, dioper, dikembalikan
        const tombol = <button>Klik</button>;
        const daftar = items.map((i) => <li key={i.id}>{i.nama}</li>);

        function pilih(kondisi) {
          return kondisi ? <Sukses /> : <Gagal />;
        }
        `,
      ),

      h2('Yang JSX TIDAK selesaikan'),
      ul(
        'Ia tidak membuat aplikasimu cepat dengan sendirinya — pembaruan yang salah tetap lambat.',
        'Ia tidak menghapus kebutuhan paham DOM; ia menyembunyikannya sampai kamu perlu.',
        'Ia bukan syarat memakai React — React bisa ditulis tanpa JSX, hanya jauh lebih sulit dibaca.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Imperatif menuliskan langkah; deklaratif menggambarkan hasil.',
        'React membandingkan deskripsi lama dan baru, lalu mengubah seminimal mungkin.',
        'JSX dikompilasi jadi JavaScript — ia nilai, bukan teks template.',
        'Kesalahan tag tertangkap saat build, bukan diabaikan diam-diam seperti HTML.',
      ),
      references(
        {
          label: 'Writing Markup with JSX',
          href: 'https://react.dev/learn/writing-markup-with-jsx',
          source: 'React',
          note: 'Pengantar resmi JSX beserta alasan React menggabungkan tampilan dan logika dalam satu berkas.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Pergeseran dari imperatif ke deklaratif, dijelaskan dari sudut pandang membangun aplikasi.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Menjelaskan kenapa membangun ulang seluruh DOM membuat fokus dan isi input hilang.',
        },
        {
          label: 'React Without JSX',
          href: 'https://react.dev/reference/react/createElement',
          source: 'React',
          note: 'Bukti bahwa JSX bukan syarat memakai React — hanya jauh lebih enak dibaca.',
        },
      ),
    ],
  ),

  written(
    'anatomi-jsx',
    'Anatomi JSX & Aturannya',
    10,
    'Aturan penulisan yang berbeda dari HTML — dan alasan tiap perbedaannya.',
    [
      terms(
        {
          term: 'elemen akar',
          meaning:
            'Terjemahan dari *root element*. JSX harus punya **satu** elemen terluar, karena hasil kompilasinya adalah satu nilai yang dikembalikan — dan sebuah `return` tidak bisa mengembalikan dua nilai sekaligus. Aturannya bukan kesewenangan React; ia konsekuensi langsung dari cara JavaScript bekerja.',
        },
        {
          term: 'Fragment',
          meaning:
            'Terjemahannya **potongan**. Pembungkus tak terlihat yang memenuhi syarat satu elemen akar **tanpa menambah elemen apa pun ke DOM**. Ditulis singkat sebagai `<>...</>`, atau `<React.Fragment key={...}>` ketika kamu perlu memberinya `key`.',
        },
        {
          term: 'className',
          meaning:
            'Pengganti atribut `class` di JSX. Alasannya sama dengan yang kamu pelajari di Sub-bab 4.4: `class` adalah **kata kunci JavaScript**, sehingga tidak bisa dipakai sebagai nama property. Kejanggalan sejarah yang sama juga melahirkan `htmlFor` untuk atribut `for`.',
        },
        {
          term: 'self-closing',
          meaning:
            'Terjemahannya **menutup sendiri**. Tag yang diakhiri `/>` seperti `<img />` dan `<br />`. Di HTML garis miringnya opsional; di **JSX ia wajib**, karena JSX mengikuti aturan XML yang lebih ketat dan tidak mengizinkan tag menggantung.',
        },
        {
          term: 'camelCase attribute',
          meaning:
            'Atribut JSX memakai penamaan JavaScript, bukan HTML: `onclick` menjadi `onClick`, `tabindex` menjadi `tabIndex`, `maxlength` menjadi `maxLength`. Alasannya konsisten: yang kamu tulis sebenarnya **property objek JavaScript**, bukan atribut HTML.',
        },
        {
          term: 'komentar di JSX',
          meaning:
            'Ditulis `{/* ... */}` — kurung kurawal dulu, baru komentar JavaScript di dalamnya. Menulis `<!-- ... -->` gaya HTML **tidak bekerja** dan justru muncul sebagai teks di layar.',
        },
        {
          term: 'kapitalisasi',
          meaning:
            'Aturan yang menentukan segalanya: tag berhuruf **kecil** (`<div>`) diterjemahkan menjadi elemen HTML, sedangkan tag berhuruf **besar** (`<Tombol>`) diterjemahkan menjadi pemanggilan komponenmu. Salah kapitalisasi tidak melempar error — React justru mencoba membuat elemen HTML bernama aneh yang diabaikan browser.',
        },
        {
          term: 'style',
          meaning:
            'Di JSX, `style` menerima **objek**, bukan teks: `style={{ color: "red" }}`. Kurung kurawal gandanya bukan sintaks khusus — yang luar adalah penanda ekspresi JSX, yang dalam adalah object literal biasa. Nama propertynya juga camelCase: `backgroundColor`, bukan `background-color`.',
        },
      ),

      h2('Satu elemen akar'),
      code(
        'jsx',
        `
        // SALAH: dua elemen sejajar tanpa pembungkus
        return (
          <h1>Judul</h1>
          <p>Isi</p>
        );

        // BENAR: dibungkus
        return (
          <div>
            <h1>Judul</h1>
            <p>Isi</p>
          </div>
        );

        // LEBIH BAIK: Fragment — tanpa elemen tambahan di DOM
        return (
          <>
            <h1>Judul</h1>
            <p>Isi</p>
          </>
        );
        `,
      ),
      p(
        'Alasannya sederhana: sebuah fungsi hanya bisa mengembalikan **satu** nilai. Fragment memberimu pembungkus tanpa menambah `<div>` yang merusak layout Grid atau Flex.',
      ),
      code(
        'jsx',
        `
        // Fragment dengan key — saat merender list
        {items.map((i) => (
          <Fragment key={i.id}>
            <dt>{i.istilah}</dt>
            <dd>{i.arti}</dd>
          </Fragment>
        ))}
        `,
        { caption: 'Bentuk pendek `<>` tidak bisa menerima `key`.' },
      ),

      h2('Atribut yang berubah nama'),
      table(
        ['HTML', 'JSX', 'Kenapa'],
        [
          ['`class`', '`className`', '`class` kata kunci JavaScript'],
          ['`for`', '`htmlFor`', '`for` kata kunci JavaScript'],
          ['`tabindex`', '`tabIndex`', 'Property DOM memakai camelCase'],
          ['`onclick`', '`onClick`', 'Sama'],
          ['`stroke-width`', '`strokeWidth`', 'Berlaku juga di SVG'],
          ['`aria-label`', '`aria-label`', '**Tidak berubah** — ARIA tetap ber-dash'],
          ['`data-id`', '`data-id`', '**Tidak berubah** — data attribute tetap ber-dash'],
        ],
      ),

      h2('Semua tag harus ditutup'),
      code(
        'jsx',
        `
        <img src="a.png" alt="A" />       {/* wajib self-closing */}
        <input type="text" />
        <br />

        <div />                            {/* boleh, sama dengan <div></div> */}
        `,
      ),

      h2('Huruf besar menentukan artinya'),
      code(
        'jsx',
        `
        <button />     // huruf kecil -> elemen HTML biasa
        <Button />     // huruf besar -> komponen React milikmu

        // Ini penyebab "Nothing was returned from render" yang membingungkan:
        <tombol />     // dianggap tag HTML bernama 'tombol' — bukan komponenmu
        `,
      ),
      callout(
        'warning',
        'Konsekuensi nyata',
        'Komponen React **wajib** diawali huruf besar. Kalau tidak, JSX mengiranya elemen HTML tak dikenal dan merendernya sebagai tag kosong — tanpa error, tanpa peringatan.',
      ),

      h2('Style sebagai objek'),
      code(
        'jsx',
        `
        // SALAH
        <div style="color: red; font-size: 14px" />

        // BENAR: objek, camelCase, angka jadi px otomatis
        <div style={{ color: 'red', fontSize: 14 }} />

        // Kurung kurawal ganda = kurung JSX + literal objek. Bukan sintaks khusus.
        `,
      ),

      h2('Komentar'),
      code(
        'jsx',
        `
        <div>
          {/* Komentar di dalam JSX harus dibungkus kurung kurawal */}
          <p>Isi</p>
        </div>
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Satu elemen akar; pakai Fragment `<>` supaya tidak menambah node.',
        '`className` dan `htmlFor` karena `class` dan `for` kata kunci JavaScript.',
        'ARIA dan `data-*` **tetap** memakai dash.',
        'Semua tag ditutup; komponen wajib diawali huruf besar.',
        '`style` menerima objek camelCase, bukan string.',
      ),
      references(
        {
          label: 'Writing Markup with JSX — The Rules of JSX',
          href: 'https://react.dev/learn/writing-markup-with-jsx',
          source: 'React',
          note: 'Ketiga aturan resmi: satu elemen akar, semua tag ditutup, atribut camelCase.',
        },
        {
          label: '<Fragment> (<>)',
          href: 'https://react.dev/reference/react/Fragment',
          source: 'React',
          note: 'Termasuk kapan kamu harus memakai bentuk panjangnya demi memberi `key`.',
        },
        {
          label: 'Common components (e.g. <div>)',
          href: 'https://react.dev/reference/react-dom/components/common',
          source: 'React',
          note: 'Daftar lengkap perbedaan penamaan atribut JSX dengan HTML, termasuk `style` sebagai objek.',
        },
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Menegaskan kewajiban huruf besar di awal nama komponen dan akibatnya kalau dilanggar.',
        },
      ),
    ],
  ),

  written(
    'ekspresi-di-jsx',
    'Menyisipkan Ekspresi JavaScript',
    11,
    'Apa yang boleh dan tidak boleh ditulis di dalam kurung kurawal — termasuk jebakan angka nol.',
    [
      terms(
        {
          term: 'ekspresi',
          meaning:
            'Dari *expression*, artinya **ungkapan yang menghasilkan nilai**. Hanya ini yang boleh masuk ke dalam kurung kurawal JSX. Aturan praktisnya sederhana dan tidak pernah meleset: **kalau bisa ditaruh di sisi kanan tanda `=`, ia boleh masuk kurung kurawal.**',
        },
        {
          term: 'pernyataan',
          meaning:
            'Dari *statement*, artinya **perintah yang melakukan sesuatu tapi tidak menghasilkan nilai** — `if`, `for`, `const x = 1`. Ketiganya **tidak boleh** ditulis di dalam kurung kurawal JSX. Penggantinya: ternary untuk `if`, dan `map` untuk `for`.',
        },
        {
          term: 'rendering kondisional',
          meaning:
            'Terjemahannya **menampilkan berdasarkan syarat**. Ada tiga cara umum: ternary untuk memilih di antara dua tampilan, `&&` untuk menampilkan atau tidak sama sekali, dan `return null` lebih awal untuk membatalkan seluruh komponen.',
        },
        {
          term: 'jebakan angka nol',
          meaning:
            'Bug paling terkenal di JSX. Menulis `{items.length && <Daftar />}` menampilkan **angka `0`** di layar ketika daftarnya kosong — karena `0` adalah falsy sehingga `&&` mengembalikannya, dan berbeda dari `false`, **angka nol benar-benar dirender**. Obatnya: ubah jadi boolean dulu, `{items.length > 0 && <Daftar />}`.',
        },
        {
          term: 'nilai yang diabaikan',
          meaning:
            'React sengaja **tidak menampilkan apa pun** untuk `true`, `false`, `null`, dan `undefined`. Sifat inilah yang membuat pola `{kondisi && <Elemen />}` bisa bekerja. Perhatikan bahwa `0` **tidak** termasuk dalam daftar ini — dan justru itu sumber jebakan di atas.',
        },
        {
          term: 'key',
          meaning:
            'Penanda identitas tiap elemen dalam sebuah daftar, wajib ada saat merender dengan `map`. Harus **stabil dan unik di antara saudaranya**. Pakai `id` dari datamu; **jangan pakai indeks array** kalau daftarnya bisa diurutkan, disaring, atau disisipi — indeks berubah, dan React jadi salah mengenali elemen mana yang mana.',
        },
        {
          term: 'map',
          meaning:
            'Method array yang menjadi pengganti `for` di dalam JSX. Karena ia **menghasilkan nilai** berupa array elemen, ia sah ditulis di dalam kurung kurawal — sementara `for` tidak.',
        },
        {
          term: 'escaping otomatis',
          meaning:
            'React **secara otomatis menetralkan** teks yang kamu sisipkan, sehingga `<script>` dari data pengguna muncul sebagai tulisan biasa, bukan dijalankan. Ini pertahanan XSS bawaan yang membuat JSX jauh lebih aman daripada `innerHTML` di Bab 4 — dan satu-satunya cara melewatinya adalah `dangerouslySetInnerHTML`, yang namanya sengaja dibuat menakutkan.',
        },
      ),

      h2('Ekspresi, bukan pernyataan'),
      code(
        'jsx',
        `
        // BOLEH — semuanya menghasilkan nilai
        <p>{nama}</p>
        <p>{a + b}</p>
        <p>{items.length}</p>
        <p>{formatRupiah(total)}</p>
        <p>{kondisi ? 'ya' : 'tidak'}</p>

        // TIDAK BOLEH — pernyataan tidak menghasilkan nilai
        <p>{if (x) { ... }}</p>
        <p>{for (const i of items) { ... }}</p>
        <p>{const x = 1;}</p>
        `,
      ),
      p(
        'Aturan praktisnya: kalau bisa ditaruh di sisi kanan tanda `=`, ia boleh masuk kurung kurawal.',
      ),

      h2('Apa yang dirender dan apa yang diabaikan'),
      table(
        ['Nilai', 'Yang tampil'],
        [
          ['`"teks"`, `42`', 'Apa adanya'],
          ['`true`, `false`', '**Tidak ada** — diabaikan'],
          ['`null`, `undefined`', '**Tidak ada** — diabaikan'],
          ['`0`', '**Angka 0 tampil** — ini jebakannya'],
          ['`[a, b]`', 'Berurutan'],
          ['`{ a: 1 }`', '**Error** — objek tidak bisa dirender'],
        ],
      ),

      h2('Rendering kondisional'),
      code(
        'jsx',
        `
        {sudahLogin && <Profil />}                    // tampil kalau true
        {sudahLogin ? <Profil /> : <TombolLogin />}   // salah satu
        {pesan && <p>{pesan}</p>}
        `,
      ),
      callout(
        'danger',
        'Jebakan `&&` dengan angka',
        '`{items.length && <Daftar />}` akan menampilkan **angka 0** di layar saat daftarnya kosong — karena `0 && x` menghasilkan `0`, dan React merender angka. Tulis `{items.length > 0 && <Daftar />}` supaya sisi kirinya benar-benar boolean.',
      ),
      code(
        'jsx',
        `
        // SALAH — menampilkan "0" saat kosong
        {items.length && <Daftar items={items} />}

        // BENAR
        {items.length > 0 && <Daftar items={items} />}
        {Boolean(items.length) && <Daftar items={items} />}
        `,
      ),

      h2('Merender list'),
      code(
        'jsx',
        `
        <ul>
          {tugas.map((t) => (
            <li key={t.id}>{t.judul}</li>
          ))}
        </ul>
        `,
      ),
      callout(
        'warning',
        '`key` bukan formalitas',
        'React memakainya untuk mencocokkan elemen lama dengan yang baru. Tanpa `key` yang stabil, menyisipkan item di awal daftar membuat React mengira semua item berubah isi — dan state internal seperti input yang sedang diketik bisa **berpindah ke baris yang salah**. Dibahas tuntas di Frontend Intermediate 2.6.',
      ),
      code(
        'jsx',
        `
        {items.map((item, i) => <li key={i}>{item}</li>)}      // rapuh saat urutan berubah
        {items.map((item) => <li key={item.id}>{item}</li>)}   // benar — identitas stabil
        `,
      ),

      h2('Logika rumit keluar dari JSX'),
      code(
        'jsx',
        `
        // Sulit dibaca
        return (
          <div>{a ? (b ? <X /> : c ? <Y /> : <Z />) : <W />}</div>
        );

        // Jauh lebih baik — early return di atas JSX
        function Status({ a, b, c }) {
          if (!a) return <W />;
          if (b) return <X />;
          return c ? <Y /> : <Z />;
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Hanya ekspresi yang boleh di dalam kurung kurawal — kalau muat di kanan `=`, ia boleh.',
        '`false`, `null`, `undefined` diabaikan; **`0` tetap tampil**.',
        'Pakai `length > 0 &&`, bukan `length &&`.',
        '`key` harus identitas stabil, bukan indeks array.',
        'Percabangan rumit dipindah ke atas JSX sebagai early return.',
      ),
      references(
        {
          label: 'JavaScript in JSX with Curly Braces',
          href: 'https://react.dev/learn/javascript-in-jsx-with-curly-braces',
          source: 'React',
          note: 'Aturan resmi apa yang boleh masuk kurung kurawal — hanya ekspresi, bukan pernyataan.',
        },
        {
          label: 'Conditional Rendering',
          href: 'https://react.dev/learn/conditional-rendering',
          source: 'React',
          note: 'Termasuk peringatan resmi tentang jebakan `&&` dengan angka nol.',
        },
        {
          label: 'Rendering Lists',
          href: 'https://react.dev/learn/rendering-lists',
          source: 'React',
          note: 'Bagian "Why does React need keys?" dan alasan indeks array bukan pilihan yang aman.',
        },
        {
          label: 'Array.prototype.map()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
          source: 'MDN',
          note: 'Pengganti `for` di dalam JSX — sah karena ia menghasilkan nilai.',
        },
        {
          label: 'dangerouslySetInnerHTML',
          href: 'https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html',
          source: 'React',
          note: 'Satu-satunya jalan melewati escaping otomatis — namanya sengaja dibuat menakutkan.',
        },
      ),
    ],
  ),

  written(
    'kompilasi-jsx',
    'Apa yang Dihasilkan JSX Setelah Dikompilasi',
    10,
    'Melihat JSX berubah menjadi pemanggilan fungsi biasa — dan kenapa itu menjelaskan banyak hal.',
    [
      p(
        'JSX bukan sihir. Ia sintaks yang diubah alat build menjadi pemanggilan fungsi. Melihat hasilnya sekali akan menjelaskan beberapa perilaku React yang tampak aneh.',
      ),

      terms(
        {
          term: 'kompilasi',
          meaning:
            'Dari *compile*, artinya **menerjemahkan** kode dari satu bentuk ke bentuk lain sebelum dijalankan. JSX dikompilasi menjadi pemanggilan fungsi JavaScript biasa. Melihat hasilnya sekali saja akan menjelaskan beberapa perilaku React yang sebelumnya terasa aneh — dan itulah gunanya sub-bab ini.',
        },
        {
          term: 'transpiler',
          meaning:
            'Gabungan *transform* dan *compiler*. Alat yang menerjemahkan kode dari satu bahasa ke bahasa lain **yang setingkat**, bukan ke bahasa mesin. Babel, SWC, dan esbuild semuanya transpiler, dan salah satunya pasti bekerja di balik layar project React-mu.',
        },
        {
          term: 'jsx-runtime',
          meaning:
            'Modul `react/jsx-runtime` yang menyediakan fungsi `_jsx`. Sejak React 17 ia **diimpor otomatis** oleh transpiler, sehingga kamu tidak perlu lagi menulis `import React from "react"` di setiap berkas — kebiasaan yang masih sering terlihat di kode dan tutorial lama.',
        },
        {
          term: 'createElement',
          meaning:
            'Fungsi lama yang dipakai sebelum jsx-runtime: `React.createElement("h1", { className: "judul" }, "Halo")`. Masih bekerja, dan berguna dilihat sekali untuk memahami bahwa JSX benar-benar hanya pemanggilan fungsi biasa.',
        },
        {
          term: 'React element',
          meaning:
            'Hasil kompilasi JSX: sebuah **object JavaScript biasa** berisi `type`, `props`, dan `key`. Perlu ditegaskan — ia **bukan elemen DOM**, dan belum menyentuh layar sama sekali. Ia hanya deskripsi tentang apa yang seharusnya ada.',
        },
        {
          term: 'props',
          meaning:
            'Singkatan *properties*. Semua atribut yang kamu tulis di JSX berkumpul menjadi **satu objek** yang dioper ke komponen. Isi di antara tag pembuka dan penutup masuk ke dalamnya sebagai `children`.',
        },
        {
          term: 'children',
          meaning:
            'Property khusus yang berisi apa pun yang ditulis **di antara tag pembuka dan penutup**. Melihat hasil kompilasinya menjelaskan kenapa `children` bisa berupa teks, elemen, array, atau bahkan fungsi — semuanya hanyalah nilai di dalam sebuah objek.',
        },
        {
          term: 'evaluasi eager',
          meaning:
            'Terjemahan bebasnya **dihitung lebih dulu**. Argumen sebuah pemanggilan fungsi selalu dihitung sebelum fungsinya berjalan. Konsekuensinya penting dan sering mengejutkan: `<Berat />` yang ditulis di dalam JSX **sudah menjadi objek** meski akhirnya tidak dirender — jadi bekerjanya bukan penundaan, melainkan sekadar tidak dipakai.',
        },
      ),

      h2('Sebelum dan sesudah'),
      compare(
        {
          title: 'Yang kamu tulis',
          lang: 'jsx',
          code: `
            <h1 className="judul">
              Halo {nama}
            </h1>
          `,
        },
        {
          title: 'Yang dijalankan',
          lang: 'js',
          code: `
            import { jsx as _jsx } from 'react/jsx-runtime';

            _jsx('h1', {
              className: 'judul',
              children: ['Halo ', nama],
            });
          `,
          notes: ['Hasilnya objek biasa, bukan elemen DOM.'],
        },
      ),
      code(
        'js',
        `
        // Objek yang dihasilkan kira-kira begini:
        {
          type: 'h1',
          props: { className: 'judul', children: ['Halo ', nama] },
          key: null,
        }
        `,
      ),

      h2('Empat hal yang langsung jadi masuk akal'),
      ol(
        '**Kenapa komponen wajib huruf besar.** `<button />` dikompilasi jadi `jsx("button", …)` — string. `<Button />` jadi `jsx(Button, …)` — referensi variabel.',
        '**Kenapa `children` adalah prop biasa.** Ia memang hanya field di objek props; `<A>isi</A>` sama dengan `<A children="isi" />`.',
        '**Kenapa JSX bisa disimpan di variabel.** Ia menghasilkan objek — objek bisa disimpan dan dioper seperti nilai lain.',
        '**Kenapa merendernya tidak langsung menyentuh DOM.** Objek itu hanya **deskripsi**; React yang memutuskan apa yang perlu diubah.',
      ),

      h2('Automatic JSX runtime'),
      code(
        'jsx',
        `
        // Sebelum React 17 — import wajib, meski React tidak dipakai langsung
        import React from 'react';
        export function Kartu() { return <div />; }

        // React 17+ dengan automatic runtime — tidak perlu lagi
        export function Kartu() { return <div />; }
        `,
      ),
      callout(
        'info',
        'Kenapa dulu wajib',
        'Transform lama mengubah JSX menjadi `React.createElement(...)`, yang membutuhkan variabel `React` ada di scope. Runtime otomatis menyisipkan impor `react/jsx-runtime` sendiri, jadi kamu tidak perlu menulisnya. Kode lama yang masih mengimpor `React` tetap bekerja.',
      ),

      h2('Melihatnya sendiri'),
      code(
        'bash',
        `
        # Tempel JSX ke https://babeljs.io/repl, aktifkan preset React,
        # dan lihat keluarannya berubah saat kamu mengetik.
        `,
      ),

      h2('React tanpa JSX'),
      code(
        'js',
        `
        import { createElement as h } from 'react';

        // Sah, dan inilah yang sebenarnya dijalankan:
        h('ul', null, items.map((i) => h('li', { key: i.id }, i.nama)));

        // Setara dengan:
        // <ul>{items.map((i) => <li key={i.id}>{i.nama}</li>)}</ul>
        `,
      ),
      p(
        'JSX sepenuhnya opsional. Ia ada karena versi keduanya jauh lebih sulit dibaca begitu strukturnya bertingkat.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'JSX dikompilasi menjadi `jsx(type, props)` yang mengembalikan objek deskripsi.',
        'Huruf besar menentukan apakah `type` berupa string atau referensi komponen.',
        '`children` adalah prop biasa di dalam objek itu.',
        'Automatic runtime menghapus kewajiban `import React`.',
        'JSX opsional — tapi alternatifnya jauh lebih sulit dibaca.',
      ),
      references(
        {
          label: 'createElement',
          href: 'https://react.dev/reference/react/createElement',
          source: 'React',
          note: 'Bentuk yang sebenarnya dijalankan di balik setiap JSX yang kamu tulis.',
        },
        {
          label: 'Introducing the New JSX Transform',
          href: 'https://react.dev/blog/2020/09/22/introducing-the-new-jsx-transform',
          source: 'React',
          note: 'Alasan `import React` tidak lagi wajib sejak React 17.',
        },
        {
          label: '@babel/plugin-transform-react-jsx',
          href: 'https://babeljs.io/docs/babel-plugin-transform-react-jsx',
          source: 'Babel',
          note: 'Transpiler yang melakukan penerjemahan — bisa dicoba langsung di REPL-nya.',
        },
        {
          label: 'JSX In Depth',
          href: 'https://react.dev/learn/writing-markup-with-jsx',
          source: 'React',
          note: 'Aturan penerjemahan tag berhuruf kecil menjadi string dan huruf besar menjadi referensi komponen.',
        },
      ),
    ],
  ),

  written(
    'typescript-sekilas',
    'TypeScript Sekilas',
    13,
    'Cukup TypeScript untuk memahami TSX — tanpa mempelajari seluruh sistem tipenya.',
    [
      p(
        'TypeScript adalah JavaScript ditambah anotasi tipe yang **dihapus saat build**. Tidak ada satu pun tipe yang tersisa di kode yang berjalan; semuanya adalah pemeriksaan saat kamu menulis.',
      ),

      terms(
        {
          term: 'TypeScript',
          meaning:
            'Bahasa yang merupakan **JavaScript ditambah anotasi tipe**. Hal terpenting yang wajib dipahami: seluruh tipenya **dihapus saat build** dan tidak ada satu pun yang tersisa di kode yang berjalan. Ia bukan pemeriksaan saat program berjalan — ia pemeriksaan saat kamu mengetik.',
        },
        {
          term: 'tipe',
          meaning:
            'Terjemahan dari *type*. Pernyataan tentang **bentuk nilai apa** yang boleh mengisi sebuah tempat: `string`, `number`, `boolean`, atau bentuk yang lebih rumit. Manfaatnya bukan sekadar mencegah error — editor jadi bisa memberi autocomplete dan rename otomatis yang tepat.',
        },
        {
          term: 'anotasi',
          meaning:
            'Dari *annotation*, artinya **keterangan yang kamu tulis**: `let nama: string`. Tanda titik dua dan tipenya adalah anotasi. Aturan praktisnya: tulis anotasi **hanya kalau inferensinya salah** atau belum ada nilai untuk disimpulkan.',
        },
        {
          term: 'inferensi',
          meaning:
            'Dari *inference*, artinya **kesimpulan otomatis**. TypeScript menebak tipe dari nilainya sendiri: `let kota = "Bandung"` sudah dianggap `string` tanpa kamu tulis apa pun. Kemampuan ini yang membuat TypeScript jauh tidak seberat kelihatannya — sebagian besar tipe tidak perlu ditulis.',
        },
        {
          term: 'interface',
          meaning:
            'Cara mendeskripsikan **bentuk sebuah objek**: property apa saja yang ada dan bertipe apa. Di React ia paling sering dipakai untuk mendeskripsikan props sebuah komponen.',
        },
        {
          term: 'type alias',
          meaning:
            'Terjemahannya **nama panggilan untuk sebuah tipe**, ditulis `type Nama = ...`. Lebih fleksibel daripada `interface` karena bisa menamai apa pun — union, tuple, bahkan tipe hasil perhitungan. Untuk bentuk objek biasa, keduanya nyaris setara; pilih satu dan konsisten.',
        },
        {
          term: 'union',
          meaning:
            'Terjemahannya **gabungan**, ditulis dengan garis tegak: `"kecil" | "besar"`. Menyatakan bahwa sebuah nilai boleh salah satu dari beberapa kemungkinan. Sangat berguna untuk prop seperti `ukuran` atau `varian`, karena editor langsung menawarkan pilihan yang sah.',
        },
        {
          term: 'optional',
          meaning:
            'Tanda tanya setelah nama property: `judul?: string`. Artinya property itu **boleh tidak ada**, dan tipenya otomatis menjadi `string | undefined`. Inilah cara menyatakan prop yang tidak wajib diisi.',
        },
        {
          term: 'any',
          meaning:
            'Tipe yang berarti **"jangan periksa apa pun"**. Memakainya mematikan seluruh manfaat TypeScript di tempat itu. Kalau kamu benar-benar tidak tahu bentuknya, pakai `unknown` — ia memaksamu memeriksa dulu sebelum dipakai, dan itulah yang kamu inginkan.',
        },
        {
          term: 'strict',
          meaning:
            'Mode ketat di `tsconfig.json` yang menyalakan pemeriksaan paling berguna, termasuk `strictNullChecks` yang membuat `null` dan `undefined` tidak bisa masuk diam-diam. **Nyalakan sejak hari pertama** — menyalakannya belakangan pada project yang sudah besar jauh lebih menyakitkan.',
        },
      ),

      h2('Tipe dasar dan inferensi'),
      code(
        'ts',
        `
        let nama: string = 'Zum';
        let umur: number = 24;
        let aktif: boolean = true;
        let daftar: string[] = ['a', 'b'];
        let pasangan: [string, number] = ['a', 1];   // tuple

        // Inferensi: TypeScript sudah tahu tanpa kamu tulis
        let kota = 'Bandung';        // string
        let angka = [1, 2, 3];       // number[]

        // Tulis anotasi hanya kalau inferensinya salah atau belum ada nilainya
        `,
      ),
      callout(
        'tip',
        'Jangan menganotasi yang sudah jelas',
        '`const nama: string = "Zum"` adalah kebisingan. Biarkan inferensi bekerja; anotasi berguna di **batas** — parameter fungsi, nilai kembalian publik, dan bentuk data dari luar.',
      ),

      h2('`interface` vs `type`'),
      code(
        'ts',
        `
        interface Pengguna {
          nama: string;
          umur?: number;          // opsional
          readonly id: string;    // tidak boleh diubah setelah dibuat
        }

        type Titik = { x: number; y: number };

        // Yang hanya bisa 'type':
        type Status = 'draft' | 'terbit';                 // union
        type Id = string | number;
        type Nama = Pengguna['nama'];                      // ambil tipe field

        // Yang hanya bisa 'interface': declaration merging (jarang dipakai)
        `,
      ),
      p(
        'Untuk objek biasa keduanya setara. Pakai satu secara konsisten; project ini memakai `type` kecuali butuh merging.',
      ),

      h2('Union dan literal type'),
      code(
        'ts',
        `
        type Ukuran = 'sm' | 'md' | 'lg';

        function tombol(ukuran: Ukuran) {}
        tombol('md');      // ok
        tombol('besar');   // Error: Argument of type '"besar"' is not assignable

        // Inilah yang membuat autocomplete di editor menampilkan pilihan yang benar
        `,
      ),

      h2('Discriminated union — pola paling berguna'),
      code(
        'ts',
        `
        type Keadaan =
          | { status: 'memuat' }
          | { status: 'gagal'; pesan: string }
          | { status: 'berhasil'; data: string[] };

        function tampil(k: Keadaan) {
          switch (k.status) {
            case 'memuat':
              return 'Memuat…';
            case 'gagal':
              return k.pesan;        // TypeScript TAHU pesan ada di cabang ini
            case 'berhasil':
              return k.data.length;  // dan data ada di cabang ini
          }
        }
        `,
      ),
      callout(
        'info',
        'Kenapa ini penting untuk UI',
        'Empat keadaan UI dari Bab 5 bisa dimodelkan persis begini. Kombinasi yang mustahil — "memuat sekaligus punya data error" — menjadi **tidak bisa ditulis**, bukan sekadar tidak dianjurkan.',
      ),

      h2('Fungsi'),
      code(
        'ts',
        `
        function jumlah(a: number, b: number): number { return a + b; }
        const kali = (a: number, b: number): number => a * b;

        function sapa(nama: string, sapaan = 'Halo'): string {
          return \`\${sapaan} \${nama}\`;
        }

        function log(pesan: string): void {}          // tidak mengembalikan apa pun
        `,
      ),

      h2('Generic, secukupnya'),
      code(
        'ts',
        `
        // Tanpa generic: tipe hasilnya hilang
        function pertamaBuruk(a: unknown[]): unknown { return a[0]; }

        // Dengan generic: tipe masukan mengalir ke keluaran
        function pertama<T>(a: T[]): T | undefined { return a[0]; }

        pertama([1, 2, 3]);        // number | undefined
        pertama(['a', 'b']);       // string | undefined
        `,
      ),

      h2('`any`, `unknown`, dan larangan'),
      code(
        'ts',
        `
        let a: any = ambilData();
        a.apaPunBoleh.tanpaDiperiksa();   // TypeScript diam — pemeriksaan MATI total

        let u: unknown = ambilData();
        u.apaPun;                          // Error — harus dipersempit dulu
        if (typeof u === 'string') u.toUpperCase();   // sekarang aman
        `,
      ),
      callout(
        'danger',
        '`any` mematikan alasan memakai TypeScript',
        'Ia tidak "melonggarkan" pemeriksaan — ia menghapusnya, dan penghapusan itu menular ke semua yang menyentuhnya. Untuk nilai yang benar-benar belum diketahui bentuknya, pakai `unknown` lalu persempit. Project ini menyalakan `strict` dan tidak punya satu pun `any`.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Tipe dihapus saat build — tidak ada biaya saat berjalan.',
        'Biarkan inferensi bekerja; anotasi di batas fungsi dan data dari luar.',
        '`type` dan `interface` setara untuk objek; union hanya bisa dengan `type`.',
        'Discriminated union membuat kombinasi keadaan yang mustahil jadi tidak bisa ditulis.',
        '`unknown` untuk yang belum diketahui; `any` mematikan seluruh pemeriksaan.',
      ),
      references(
        {
          label: 'TypeScript for JavaScript Programmers',
          href: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
          source: 'TypeScript',
          note: 'Pengantar paling ringkas — cukup untuk memahami TSX tanpa mempelajari seluruh sistem tipenya.',
        },
        {
          label: 'Everyday Types',
          href: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
          source: 'TypeScript',
          note: 'Tipe dasar, union, `interface` versus `type`, dan property opsional.',
        },
        {
          label: 'Narrowing',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
          source: 'TypeScript',
          note: 'Cara TypeScript mempersempit tipe di dalam `if` — dasar kerja discriminated union.',
        },
        {
          label: 'Generics',
          href: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
          source: 'TypeScript',
          note: 'Cara membuat tipe masukan mengalir ke keluaran, dipakai lagi di Sub-bab 6.9.',
        },
        {
          label: 'tsconfig — strict',
          href: 'https://www.typescriptlang.org/tsconfig/#strict',
          source: 'TypeScript',
          note: 'Daftar pemeriksaan yang dinyalakannya, termasuk `strictNullChecks`.',
        },
      ),
    ],
  ),

  written(
    'tsx-vs-jsx',
    '`.tsx` vs `.jsx` — apa yang berubah',
    10,
    'Perbedaan konkret di berkas, tooling, dan pengalaman menulis.',
    [
      terms(
        {
          term: '.tsx',
          meaning:
            'Ekstensi berkas untuk **TypeScript yang berisi JSX**. Ekstensinya wajib `.tsx`, bukan `.ts` — di berkas `.ts` biasa, tanda `<` di awal justru ditafsirkan sebagai sesuatu yang lain dan menghasilkan error sintaks yang membingungkan.',
        },
        {
          term: '.jsx',
          meaning:
            'Ekstensi untuk **JavaScript yang berisi JSX**. Sebenarnya `.js` pun bekerja di kebanyakan alat build modern, tapi `.jsx` memberi sinyal jelas kepada pembaca dan editor bahwa berkas ini berisi tampilan.',
        },
        {
          term: 'compile-time',
          meaning:
            'Terjemahannya **saat dibangun**, sebelum kode dijalankan. Inilah waktu TypeScript bekerja. Bandingkan dengan **runtime** (saat program berjalan) — dan seluruh nilai TSX terletak pada pergeseran ini: kesalahan yang tadinya baru muncul di depan pengguna, kini muncul di editormu.',
        },
        {
          term: 'type error',
          meaning:
            'Kesalahan yang **ditemukan sebelum kode dijalankan** — salah nama prop, prop wajib yang lupa diisi, atau tipe yang tidak cocok. Di berkas `.jsx` ketiganya baru ketahuan saat halaman dibuka; di `.tsx` ketiganya bergaris merah saat kamu mengetik.',
        },
        {
          term: 'autocomplete',
          meaning:
            'Saran otomatis dari editor saat kamu mengetik. Ini manfaat TSX yang paling terasa sehari-hari dan paling sering diremehkan: mengetik `<Kartu ` langsung menampilkan daftar prop yang tersedia beserta tipenya, tanpa perlu membuka berkas komponennya.',
        },
        {
          term: 'tsconfig.json',
          meaning:
            'Berkas konfigurasi TypeScript. Untuk TSX, kuncinya adalah opsi `jsx` — nilai `react-jsx` mengaktifkan runtime otomatis sehingga kamu tidak perlu mengimpor `React` di setiap berkas.',
        },
        {
          term: 'vue-tsc / tsc',
          meaning:
            '`tsc` adalah pemeriksa tipe resmi TypeScript, dijalankan dengan `tsc --noEmit` untuk memeriksa tanpa menghasilkan berkas. Perlu diketahui: **alat build seperti Vite dan SWC hanya membuang tipe tanpa memeriksanya**, jadi pemeriksaan sungguhan harus dijalankan terpisah — dan itulah kenapa project ini punya skrip `type-check` sendiri.',
        },
        {
          term: 'migrasi bertahap',
          meaning:
            'TypeScript bisa dipakai **berkas per berkas**. `.jsx` dan `.tsx` boleh hidup berdampingan dalam satu project, sehingga kamu tidak perlu mengubah semuanya sekaligus. Ini yang membuat perpindahan pada project berjalan tetap masuk akal.',
        },
      ),

      h2('Perbandingan langsung'),
      compare(
        {
          title: 'Kartu.jsx',
          lang: 'jsx',
          code: `
            export function Kartu({ judul, jumlah }) {
              return (
                <article>
                  <h3>{judul}</h3>
                  <p>{jumlah} item</p>
                </article>
              );
            }
          `,
          notes: ['Salah nama prop baru ketahuan saat dijalankan.'],
        },
        {
          title: 'Kartu.tsx',
          lang: 'tsx',
          code: `
            type Props = {
              judul: string;
              jumlah: number;
            };

            export function Kartu({ judul, jumlah }: Props) {
              return (
                <article>
                  <h3>{judul}</h3>
                  <p>{jumlah} item</p>
                </article>
              );
            }
          `,
          notes: ['Salah nama prop jadi error saat menulis.'],
        },
      ),

      h2('Apa yang benar-benar berubah'),
      table(
        ['Aspek', '`.jsx`', '`.tsx`'],
        [
          ['Ekstensi', '`.jsx` / `.js`', '`.tsx` (wajib, bukan `.ts`)'],
          ['Prop salah nama', 'Ketahuan saat dijalankan', '**Error saat menulis**'],
          ['Autocomplete props', 'Terbatas', 'Lengkap'],
          ['Rename prop di seluruh project', 'Cari-ganti manual', '**Otomatis dan aman**'],
          ['Data dari API', 'Ditebak', 'Dijamin bentuknya'],
          ['Baris tambahan', '—', 'Definisi tipe'],
        ],
      ),
      callout(
        'warning',
        'JSX butuh ekstensi `.tsx`, bukan `.ts`',
        'Berkas `.ts` tidak mengizinkan sintaks JSX sama sekali. Ini kesalahan pertama yang hampir semua orang temui saat pindah.',
      ),

      h2('Satu perbedaan sintaks yang nyata'),
      code(
        'ts',
        `
        // Di .ts — generic biasa, tidak ambigu
        const pertama = <T>(a: T[]): T | undefined => a[0];
        `,
      ),
      code(
        'tsx',
        `
        // Di .tsx — <T> dikira awal tag JSX!
        const pertama = <T,>(a: T[]): T | undefined => a[0];   // koma menghilangkan ambiguitas

        // Atau pakai function declaration — tidak pernah ambigu
        function pertama<T>(a: T[]): T | undefined {
          return a[0];
        }
        `,
      ),

      h2('Konfigurasi minimum'),
      code(
        'json',
        `
        {
          "compilerOptions": {
            "jsx": "react-jsx",
            "strict": true,
            "noUncheckedIndexedAccess": true
          }
        }
        `,
        { filename: 'tsconfig.json' },
      ),
      callout(
        'tip',
        'Nyalakan `strict` sejak awal',
        'Menambahkannya belakangan berarti memperbaiki ratusan error sekaligus di project yang sudah besar. Menyalakannya di hari pertama membuatnya tidak pernah terasa. Project ini juga menyalakan `noUncheckedIndexedAccess`, yang membuat `arr[0]` bertipe `T | undefined` — memaksa kamu menangani array kosong.',
      ),

      h2('Yang TIDAK berubah'),
      ul(
        'Semua aturan JSX dari sub-bab 6.2 tetap sama persis.',
        'Kode yang berjalan identik — tipe dihapus saat build.',
        'Tidak ada biaya performa saat aplikasi berjalan.',
        'Berkas `.jsx` dan `.tsx` bisa hidup berdampingan dalam satu project.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'JSX butuh ekstensi `.tsx`; `.ts` menolaknya.',
        'Arrow function generic di `.tsx` butuh koma: `<T,>`.',
        'Kesalahan props berpindah dari runtime ke waktu menulis.',
        'Nyalakan `strict` sejak hari pertama.',
        'Tipe dihapus saat build — nol biaya saat berjalan.',
      ),
      references(
        {
          label: 'JSX — tsconfig option',
          href: 'https://www.typescriptlang.org/tsconfig/#jsx',
          source: 'TypeScript',
          note: 'Nilai `react-jsx` yang mengaktifkan runtime otomatis, beserta pilihan lainnya.',
        },
        {
          label: 'JSX in TypeScript',
          href: 'https://www.typescriptlang.org/docs/handbook/jsx.html',
          source: 'TypeScript',
          note: 'Alasan berkas harus berekstensi `.tsx` dan kenapa arrow generic butuh koma tambahan.',
        },
        {
          label: 'Using TypeScript',
          href: 'https://react.dev/learn/typescript',
          source: 'React',
          note: 'Panduan resmi React untuk TypeScript, termasuk cara memulai dari project yang sudah ada.',
        },
        {
          label: 'Features — TypeScript',
          href: 'https://vite.dev/guide/features#typescript',
          source: 'Vite',
          note: 'Penegasan bahwa alat build hanya membuang tipe tanpa memeriksanya — `tsc` tetap perlu dijalankan.',
        },
      ),
    ],
  ),

  written(
    'tipe-props-children',
    'Memberi Tipe pada Props & `children`',
    12,
    'Kontrak antar komponen yang diperiksa mesin.',
    [
      terms(
        {
          term: 'Props',
          meaning:
            'Tipe yang mendeskripsikan **kontrak sebuah komponen**: prop apa saja yang ia terima, bertipe apa, dan mana yang wajib. Nilainya melampaui pencegahan error — kontrak ini menjadi dokumentasi yang **tidak bisa basi**, karena kode yang menyimpang darinya langsung ditolak.',
        },
        {
          term: 'ReactNode',
          meaning:
            'Tipe untuk **apa pun yang bisa dirender React**: teks, angka, elemen, array, `null`, atau `false`. Inilah tipe yang hampir selalu benar untuk `children`, karena ia paling longgar dan tidak membatasi pemakai komponenmu tanpa alasan.',
        },
        {
          term: 'ReactElement',
          meaning:
            'Tipe yang **lebih sempit** dari `ReactNode` — hanya menerima elemen JSX, bukan teks atau angka. Pakai ini hanya kalau komponenmu memang tidak bisa bekerja dengan teks biasa; kalau tidak, ia hanya mempersulit pemakainya tanpa manfaat.',
        },
        {
          term: 'PropsWithChildren',
          meaning:
            'Pembantu bawaan React yang menambahkan `children` ke tipe props-mu. Sekarang jarang dipakai karena menulis `children: ReactNode` sendiri lebih jelas terbaca dan tidak menyembunyikan apa pun.',
        },
        {
          term: 'nilai default',
          meaning:
            'Nilai cadangan untuk prop opsional, ditulis langsung di destructuring: `{ jumlah = 0 }`. Ini menggantikan `defaultProps` gaya lama yang sudah tidak dianjurkan untuk komponen fungsi. Ingat aturan dari Sub-bab 1.7: nilai default **hanya terpicu oleh `undefined`**, bukan oleh `null`.',
        },
        {
          term: 'callback prop',
          meaning:
            'Prop berupa fungsi yang dipanggil komponen anak untuk memberi tahu induknya bahwa sesuatu terjadi — `onKlik: () => void`, `onPilih: (id: string) => void`. Tipenya sekaligus mendokumentasikan **argumen apa** yang akan diterima induk.',
        },
        {
          term: 'void',
          meaning:
            'Tipe kembalian yang berarti **"nilai kembaliannya tidak dipakai"**. Dipakai untuk hampir semua callback prop. Perlu diketahui, ia sedikit longgar: fungsi yang sebenarnya mengembalikan sesuatu tetap boleh dipasang — nilainya saja yang diabaikan.',
        },
        {
          term: 'ComponentProps',
          meaning:
            'Pembantu untuk **meminjam tipe props elemen bawaan**: `ComponentProps<"button">` memberimu seluruh atribut tombol HTML. Sangat berguna saat membuat komponen pembungkus, agar pemakainya tetap bisa mengoper `disabled`, `type`, atau `aria-label` tanpa kamu daftarkan satu per satu.',
        },
        {
          term: 'rest props',
          meaning:
            'Pola `{ variant, ...sisanya }` yang mengumpulkan prop yang tidak kamu pakai lalu meneruskannya ke elemen di dalamnya dengan `{...sisanya}`. Persis pola rest yang kamu pelajari di Sub-bab 1.11, diterapkan pada komponen.',
        },
      ),

      h2('Dasar'),
      code(
        'tsx',
        `
        type Props = {
          judul: string;
          jumlah?: number;              // opsional
          onKlik: () => void;
          onPilih: (id: string) => void;
        };

        export function Kartu({ judul, jumlah = 0, onKlik }: Props) {
          return <button onClick={onKlik}>{judul} ({jumlah})</button>;
        }
        `,
      ),

      h2('`children`'),
      code(
        'tsx',
        `
        import type { ReactNode } from 'react';

        type Props = {
          judul: string;
          children: ReactNode;          // apa pun yang bisa dirender React
        };

        export function Panel({ judul, children }: Props) {
          return (
            <section>
              <h2>{judul}</h2>
              {children}
            </section>
          );
        }
        `,
      ),
      table(
        ['Tipe', 'Menerima'],
        [
          ['`ReactNode`', 'Hampir semuanya — elemen, string, angka, array, `null` (**pakai ini**)'],
          ['`ReactElement`', 'Hanya satu elemen JSX'],
          ['`() => ReactNode`', 'Fungsi — pola render prop'],
        ],
      ),
      callout(
        'warning',
        'Jangan pakai `React.FC`',
        'Ia dulu populer karena otomatis menambahkan `children`. Sekarang tidak lagi (sejak tipe React 18), sementara kekurangannya tetap: ia mempersulit komponen generic dan menambahkan properti yang jarang dipakai. Tulis `function Nama({ ... }: Props)` biasa.',
      ),

      h2('Meneruskan props elemen HTML'),
      code(
        'tsx',
        `
        import type { ComponentProps } from 'react';

        type Props = ComponentProps<'button'> & {
          varian?: 'utama' | 'sekunder';
        };

        export function Tombol({ varian = 'utama', className, ...sisa }: Props) {
          return <button className={\`\${varian} \${className ?? ''}\`} {...sisa} />;
        }

        // Sekarang SEMUA prop <button> asli ikut bertipe:
        <Tombol type="submit" disabled aria-label="Kirim" onClick={...} varian="sekunder" />
        `,
      ),
      p(
        '`ComponentProps<"button">` mengambil seluruh tipe atribut `<button>` sekaligus — termasuk yang belum ada saat kamu menulisnya.',
      ),

      h2('Props yang saling eksklusif'),
      code(
        'tsx',
        `
        // Masalah: kombinasi yang tidak masuk akal tetap lolos
        type Buruk = { href?: string; onClick?: () => void };
        <Aksi href="/a" onClick={() => {}} />;      // keduanya sekaligus?

        // Discriminated union — kombinasi mustahil jadi tidak bisa ditulis
        type Props =
          | { sebagai: 'tautan'; href: string }
          | { sebagai: 'tombol'; onClick: () => void };

        export function Aksi(props: Props) {
          if (props.sebagai === 'tautan') return <a href={props.href} />;
          return <button onClick={props.onClick} />;
        }

        <Aksi sebagai="tautan" href="/a" />;              // ok
        <Aksi sebagai="tautan" onClick={() => {}} />;     // Error
        `,
      ),

      h2('Yang sering salah'),
      code(
        'tsx',
        `
        // SALAH: object mentah — tidak menjelaskan apa pun
        type P1 = { data: object };

        // SALAH: any — mematikan seluruh pemeriksaan
        type P2 = { data: any };

        // BENAR: bentuknya eksplisit
        type P3 = { data: { id: string; nama: string }[] };

        // BENAR juga: tipe bersama yang dipakai ulang
        import type { Tugas } from '@/lib/types';
        type P4 = { data: Tugas[] };
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`ReactNode` untuk `children` — bukan `ReactElement` kecuali memang satu elemen.',
        'Jangan pakai `React.FC`; tulis fungsi biasa dengan tipe props.',
        '`ComponentProps<"tag">` meneruskan seluruh atribut HTML dengan tipenya.',
        'Discriminated union membuat kombinasi props yang mustahil tidak bisa ditulis.',
        'Hindari `object` dan `any` di props — tulis bentuknya.',
      ),
      references(
        {
          label: 'Using TypeScript — Typing props',
          href: 'https://react.dev/learn/typescript#typing-props',
          source: 'React',
          note: 'Pola resmi memberi tipe props, termasuk anjuran menulis fungsi biasa alih-alih `React.FC`.',
        },
        {
          label: 'ReactNode',
          href: 'https://react.dev/learn/typescript#typing-children',
          source: 'React',
          note: 'Tipe yang tepat untuk `children`, beserta kapan `ReactElement` lebih cocok.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dasar konsep props sebelum tipenya ditambahkan, termasuk pola rest props.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Cara membuat kombinasi props yang mustahil menjadi tidak bisa ditulis sama sekali.',
        },
        {
          label: 'Utility Types',
          href: 'https://www.typescriptlang.org/docs/handbook/utility-types.html',
          source: 'TypeScript',
          note: '`Omit`, `Pick`, dan `Partial` yang sering dipakai saat menyusun tipe props turunan.',
        },
      ),
    ],
  ),

  written(
    'tipe-event-ref',
    'Memberi Tipe pada Event & `ref`',
    12,
    'Dua tempat pemula paling sering tersandung tipe.',
    [
      terms(
        {
          term: 'handler inline',
          meaning:
            'Fungsi penangan yang ditulis **langsung di dalam JSX**: `onChange={(e) => ...}`. Keuntungan yang sering tidak disadari: TypeScript sudah tahu tipe `e` dari konteksnya, jadi **kamu tidak perlu menganotasi apa pun**. Anotasi baru dibutuhkan ketika fungsinya dipisah keluar dari JSX.',
        },
        {
          term: 'SyntheticEvent',
          meaning:
            'Terjemahannya **peristiwa sintetis**. Pembungkus React atas peristiwa DOM asli, dibuat agar perilakunya seragam di semua browser. API-nya nyaris identik dengan yang kamu pelajari di Bab 4 — `preventDefault`, `target`, `currentTarget` semuanya ada. Peristiwa aslinya tetap bisa diambil lewat `e.nativeEvent`.',
        },
        {
          term: 'ChangeEvent',
          meaning:
            'Tipe peristiwa untuk perubahan isi input, ditulis dengan elemennya: `ChangeEvent<HTMLInputElement>`. Menyebutkan elemennya penting — itulah yang membuat `e.target.value` dikenali sebagai `string` alih-alih error.',
        },
        {
          term: 'FormEvent',
          meaning:
            'Tipe peristiwa pengiriman form: `FormEvent<HTMLFormElement>`. Ini tempat `e.preventDefault()` dipanggil untuk mencegah halaman dimuat ulang, persis seperti di Sub-bab 4.9.',
        },
        {
          term: 'target vs currentTarget',
          meaning:
            'Perbedaan yang sama dengan Bab 4, tapi dengan akibat tambahan di TypeScript: **`currentTarget` bertipe tepat** karena React tahu di elemen mana handler dipasang, sementara **`target` bertipe longgar** karena peristiwa bisa berasal dari elemen mana pun di dalamnya. Kalau tipenya terasa tidak cocok, biasanya kamu sebenarnya menginginkan `currentTarget`.',
        },
        {
          term: 'ref',
          meaning:
            'Singkatan *reference*. Cara React memberimu **akses langsung ke elemen DOM** — untuk memfokuskan input, mengukur ukuran, atau memutar video. Ia adalah jalan keluar yang disediakan React ketika pendekatan deklaratif tidak cukup.',
        },
        {
          term: 'useRef',
          meaning:
            'Hook untuk membuat ref. Bentuk tipenya menentukan perilakunya: `useRef<HTMLInputElement>(null)` untuk menunjuk elemen DOM, dan hasilnya **selalu bisa `null`** — karena sebelum React memasangnya ke elemen, isinya memang belum ada.',
        },
        {
          term: 'null check',
          meaning:
            'Pemeriksaan `if (ref.current)` atau `ref.current?.focus()` yang **wajib** ada sebelum memakai isi sebuah ref. Bukan formalitas TypeScript — pada render pertama, atau setelah elemennya dilepas, isinya benar-benar `null`.',
        },
        {
          term: 'HTMLInputElement',
          meaning:
            'Salah satu dari puluhan tipe elemen DOM bawaan — ada juga `HTMLButtonElement`, `HTMLDivElement`, `HTMLFormElement`. Menyebutkan tipe yang **tepat** memberimu property khusus elemen itu; menyebut `HTMLElement` yang terlalu umum membuat `value` dan `checked` tidak dikenali.',
        },
      ),

      h2('Handler inline: biarkan inferensi bekerja'),
      code(
        'tsx',
        `
        // Tidak perlu menganotasi apa pun — TypeScript sudah tahu
        <input onChange={(e) => setNilai(e.target.value)} />
        <form onSubmit={(e) => { e.preventDefault(); kirim(); }} />
        <button onClick={(e) => console.log(e.currentTarget)} />
        `,
      ),
      callout(
        'tip',
        'Anotasi hanya dibutuhkan saat handler dipisah',
        'Begitu fungsinya keluar dari JSX, konteksnya hilang dan TypeScript tidak bisa lagi menebak tipe eventnya. Baru di situ anotasi diperlukan.',
      ),

      h2('Handler terpisah'),
      code(
        'tsx',
        `
        import type { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent } from 'react';

        function onUbah(e: ChangeEvent<HTMLInputElement>) {
          setNilai(e.target.value);
        }

        function onKirim(e: FormEvent<HTMLFormElement>) {
          e.preventDefault();
        }

        function onKlik(e: MouseEvent<HTMLButtonElement>) {
          e.currentTarget.disabled = true;
        }

        function onTekan(e: KeyboardEvent<HTMLInputElement>) {
          if (e.key === 'Enter') kirim();
        }
        `,
      ),
      table(
        ['Elemen', 'Tipe event'],
        [
          ['`<input>`, `<textarea>`', '`ChangeEvent<HTMLInputElement>`'],
          ['`<select>`', '`ChangeEvent<HTMLSelectElement>`'],
          ['`<form>`', '`FormEvent<HTMLFormElement>`'],
          ['`<button>`, `<div>`', '`MouseEvent<HTMLButtonElement>`'],
          ['Keyboard', '`KeyboardEvent<HTMLInputElement>`'],
        ],
      ),

      h2('`target` vs `currentTarget` — di TypeScript pun berbeda'),
      code(
        'tsx',
        `
        function onKlik(e: MouseEvent<HTMLButtonElement>) {
          e.currentTarget;   // HTMLButtonElement — elemen tempat handler dipasang
          e.target;          // EventTarget — bisa <span> di dalam tombol
        }
        `,
      ),
      p(
        '`currentTarget` bertipe spesifik karena React tahu di mana handler dipasang. `target` sengaja longgar, karena bisa berupa elemen apa pun di dalamnya — persis seperti yang kamu pelajari di sub-bab 4.7.',
      ),

      h2('`useRef` untuk elemen DOM'),
      code(
        'tsx',
        `
        import { useRef, useEffect } from 'react';

        export function Pencarian() {
          const inputRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            inputRef.current?.focus();     // optional chaining — bisa null
          }, []);

          return <input ref={inputRef} />;
        }
        `,
      ),
      callout(
        'warning',
        'Kenapa `.current` selalu bisa `null`',
        'Ref diisi React **setelah** render pertama selesai. Sebelum itu, dan setelah elemennya dilepas, nilainya `null`. Karena itu selalu pakai `?.` atau periksa dulu — TypeScript memaksamu, dan itu benar.',
      ),

      h2('`useRef` untuk nilai biasa'),
      code(
        'tsx',
        `
        // Nilai mutable yang TIDAK memicu render
        const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
        const hitungRef = useRef(0);

        timerRef.current = setTimeout(fn, 300);
        hitungRef.current += 1;               // tidak menyebabkan render ulang
        `,
      ),

      h2('React 19: `ref` jadi prop biasa'),
      code(
        'tsx',
        `
        // Sebelum React 19 — butuh forwardRef
        const Input = forwardRef<HTMLInputElement, Props>((props, ref) => (
          <input ref={ref} {...props} />
        ));

        // React 19 — ref cukup jadi prop biasa
        type Props = ComponentProps<'input'>;

        export function Input({ ref, ...sisa }: Props) {
          return <input ref={ref} {...sisa} />;
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Handler inline tidak perlu anotasi — inferensi sudah bekerja.',
        'Handler terpisah butuh tipe eksplisit; nama tipenya mengikuti elemen.',
        '`currentTarget` bertipe spesifik; `target` sengaja longgar.',
        '`ref.current` selalu bisa `null` — pakai `?.`.',
        'Di React 19, `ref` sudah jadi prop biasa; `forwardRef` tidak lagi diperlukan.',
      ),
      references(
        {
          label: 'Responding to Events',
          href: 'https://react.dev/learn/responding-to-events',
          source: 'React',
          note: 'Dasar penanganan peristiwa di React sebelum tipenya ditambahkan.',
        },
        {
          label: 'Common components — event props',
          href: 'https://react.dev/reference/react-dom/components/common#common-props',
          source: 'React',
          note: 'Daftar seluruh prop peristiwa beserta tipe objek yang diterimanya.',
        },
        {
          label: 'useRef',
          href: 'https://react.dev/reference/react/useRef',
          source: 'React',
          note: 'Termasuk penegasan bahwa `ref.current` bernilai `null` sebelum React memasangnya.',
        },
        {
          label: 'Manipulating the DOM with Refs',
          href: 'https://react.dev/learn/manipulating-the-dom-with-refs',
          source: 'React',
          note: 'Kapan ref memang jalan keluar yang tepat, dan kapan justru menandakan rancangan yang keliru.',
        },
        {
          label: 'ref as a prop',
          href: 'https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop',
          source: 'React',
          note: 'Perubahan React 19 yang membuat `forwardRef` tidak lagi diperlukan.',
        },
      ),
    ],
  ),

  written(
    'generic-component',
    'Generic Component & Discriminated Union Props',
    13,
    'Komponen yang tipenya menyesuaikan datanya — dan cara menghapus banyak boolean prop sekaligus.',
    [
      terms(
        {
          term: 'generic',
          meaning:
            'Dibaca "je-ne-rik", terjemahannya **umum** atau serbaguna. Cara membuat sebuah komponen atau fungsi bekerja untuk **tipe apa pun**, sambil tetap **mengingat tipe apa yang sebenarnya dipakai**. Inilah bedanya dengan `unknown`: keduanya menerima apa saja, tapi generic mengalirkan tipenya sampai ke ujung.',
        },
        {
          term: 'T',
          meaning:
            'Nama **parameter tipe** yang sudah jadi kebiasaan, dari kata *Type*. Sama seperti `fn` dan `arr`, ia hanya nama — kamu bebas menulis `Item` atau `Data`, dan pada komponen nyata nama yang lebih menjelaskan biasanya lebih baik. Kalau butuh lebih dari satu, kebiasaannya berlanjut ke `U` dan `V`.',
        },
        {
          term: 'parameter tipe',
          meaning:
            'Tipe yang diserahkan ke sebuah komponen, ditulis di antara kurung sudut: `<T>`. Berperan persis seperti parameter fungsi biasa — bedanya, yang diisikan adalah **tipe**, bukan nilai.',
        },
        {
          term: 'constraint',
          meaning:
            'Terjemahannya **batasan**, ditulis dengan `extends`: `<T extends { id: string }>`. Menyatakan bahwa tipe apa pun boleh dipakai **asalkan** memenuhi bentuk tertentu. Sangat berguna untuk komponen daftar yang butuh `id` sebagai `key`.',
        },
        {
          term: 'render prop',
          meaning:
            'Prop yang berisi **fungsi yang mengembalikan tampilan**: `render={(item) => <li>{item.judul}</li>}`. Polanya membuat komponen bisa mengurus logika daftar sementara pemakainya yang menentukan bentuk tiap barisnya.',
        },
        {
          term: 'boolean prop explosion',
          meaning:
            'Terjemahan bebasnya **ledakan prop boolean**. Keadaan ketika sebuah komponen mengumpulkan banyak prop `true`/`false` — `withHeader`, `isLoading`, `hasError`, `isEmpty` — sampai kombinasinya jadi mustahil ditelusuri. Empat prop boolean berarti **16 kombinasi**, dan sebagian besar di antaranya tidak masuk akal.',
        },
        {
          term: 'discriminated union',
          meaning:
            'Terjemahannya **gabungan berpembeda**. Union yang tiap anggotanya punya satu property penanda dengan nilai tetap — misalnya `sebagai: "tautan"` versus `sebagai: "tombol"`. Kekuatannya: **kombinasi yang mustahil menjadi tidak bisa ditulis sama sekali**, dan TypeScript otomatis tahu property mana yang tersedia di tiap cabang.',
        },
        {
          term: 'discriminant',
          meaning:
            'Terjemahannya **pembeda**. Property penanda yang membedakan tiap anggota union — `sebagai`, `status`, atau `kind`. Nilainya harus berupa **literal tetap**, bukan `string` biasa, karena dari situlah TypeScript tahu cabang mana yang sedang berlaku.',
        },
        {
          term: 'exhaustiveness',
          meaning:
            'Terjemahannya **ketuntasan**. Jaminan bahwa **semua cabang sudah ditangani**. Caranya dengan menugaskan nilai sisa ke `never` di cabang terakhir — menambah anggota union baru lalu lupa menanganinya langsung menjadi error. Pola inilah yang dipakai `BlockRenderer` di project website ini.',
        },
        {
          term: 'never',
          meaning:
            'Tipe yang berarti **"tidak akan pernah ada nilainya"**. Kalau TypeScript berhasil menyimpulkan sebuah nilai bertipe `never`, artinya semua kemungkinan sudah habis ditangani — dan itulah yang membuatnya berguna sebagai penjaga ketuntasan.',
        },
      ),

      h2('Masalahnya'),
      code(
        'tsx',
        `
        // Tanpa generic: tipe item hilang di dalam render
        type Props = {
          items: unknown[];
          render: (item: unknown) => ReactNode;
        };

        <Daftar items={tugas} render={(t) => t.judul} />;
        //                                  ^ Error: 't' bertipe unknown
        `,
      ),

      h2('Dengan generic'),
      code(
        'tsx',
        `
        import type { ReactNode } from 'react';

        type Props<T> = {
          items: T[];
          render: (item: T) => ReactNode;
          kunci: (item: T) => string;
          kosong?: ReactNode;
        };

        export function Daftar<T,>({ items, render, kunci, kosong }: Props<T>) {
          if (items.length === 0) return <>{kosong ?? <p>Belum ada data.</p>}</>;

          return (
            <ul>
              {items.map((item) => (
                <li key={kunci(item)}>{render(item)}</li>
              ))}
            </ul>
          );
        }

        // Tipe mengalir masuk — 't' otomatis bertipe Tugas
        <Daftar
          items={tugas}
          kunci={(t) => t.id}
          render={(t) => t.judul}
          kosong={<p>Belum ada tugas.</p>}
        />;
        `,
      ),
      callout(
        'info',
        'Koma pada `<T,>` bukan salah ketik',
        'Di berkas `.tsx`, `<T>` sendirian dibaca sebagai awal tag JSX. Koma menghilangkan ambiguitas itu. Kalau kamu memakai `function` declaration alih-alih arrow, koma tidak diperlukan.',
      ),

      h2('Membatasi generic'),
      code(
        'tsx',
        `
        // Hanya menerima item yang punya id — jadi tidak perlu prop 'kunci'
        type Props<T extends { id: string }> = {
          items: T[];
          render: (item: T) => ReactNode;
        };

        export function DaftarBerId<T extends { id: string },>({ items, render }: Props<T>) {
          return (
            <ul>
              {items.map((item) => (
                <li key={item.id}>{render(item)}</li>
              ))}
            </ul>
          );
        }
        `,
      ),

      h2('Menghapus ledakan boolean prop'),
      code(
        'tsx',
        `
        // SEBELUM: tiga boolean = delapan kombinasi, sebagian mustahil
        type Buruk = {
          sedangMemuat?: boolean;
          gagal?: boolean;
          pesanGagal?: string;
          data?: Item[];
        };

        <Panel sedangMemuat gagal pesanGagal="x" data={items} />;   // artinya apa?
        `,
      ),
      code(
        'tsx',
        `
        // SESUDAH: keadaan yang mustahil jadi tidak bisa ditulis
        type Keadaan =
          | { status: 'memuat' }
          | { status: 'gagal'; pesan: string }
          | { status: 'kosong' }
          | { status: 'berhasil'; data: Item[] };

        export function Panel(props: Keadaan) {
          switch (props.status) {
            case 'memuat':   return <Skeleton />;
            case 'gagal':    return <Error pesan={props.pesan} />;
            case 'kosong':   return <Kosong />;
            case 'berhasil': return <Daftar items={props.data} />;
          }
        }

        <Panel status="gagal" pesan="Koneksi terputus" />;   // ok
        <Panel status="gagal" />;                             // Error: pesan wajib
        <Panel status="memuat" data={items} />;               // Error: tidak boleh bersama
        `,
      ),
      callout(
        'tip',
        'Inilah pemakaian TypeScript yang paling berharga di UI',
        'Bukan sekadar mencegah salah ketik — tapi membuat **keadaan yang tidak masuk akal menjadi tidak bisa diekspresikan**. Empat keadaan UI dari Bab 5 dan bab ini adalah pasangan alaminya.',
      ),

      h2('Polymorphic `as`, secukupnya'),
      code(
        'tsx',
        `
        import type { ElementType, ComponentProps } from 'react';

        type Props<T extends ElementType> = {
          as?: T;
        } & Omit<ComponentProps<T>, 'as'>;

        export function Kotak<T extends ElementType = 'div',>({ as, ...sisa }: Props<T>) {
          const Komponen = as ?? 'div';
          return <Komponen {...sisa} />;
        }

        <Kotak as="section" aria-label="Utama" />;
        <Kotak as="a" href="/x" />;
        `,
      ),
      callout(
        'warning',
        'Polymorphic component itu mahal',
        'Tipenya rumit, pesan errornya panjang dan sulit dibaca, dan editor jadi lebih lambat. Pakai hanya kalau benar-benar dibutuhkan — biasanya cukup membuat dua komponen terpisah.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Generic membuat tipe data mengalir masuk ke callback render.',
        'Di `.tsx`, arrow generic butuh `<T,>`.',
        '`extends` membatasi bentuk yang diterima dan menghapus prop yang tidak perlu.',
        'Discriminated union menghapus ledakan boolean prop dan kombinasi mustahil.',
        'Polymorphic `as` berguna tapi mahal — jangan jadikan default.',
      ),
      references(
        {
          label: 'Generics',
          href: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
          source: 'TypeScript',
          note: 'Parameter tipe dan `extends` sebagai pembatas — dasar komponen generic di atas.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Beserta pemeriksaan ketuntasan memakai `never` di cabang terakhir.',
        },
        {
          label: 'never',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-never-type',
          source: 'TypeScript',
          note: 'Penjaga ketuntasan — pola yang dipakai `BlockRenderer` di project website ini.',
        },
        {
          label: 'Using TypeScript — Generic components',
          href: 'https://react.dev/learn/typescript',
          source: 'React',
          note: 'Contoh resmi komponen generic, termasuk kebutuhan koma pada arrow generic di `.tsx`.',
        },
        {
          label: 'ElementType',
          href: 'https://react.dev/reference/react/createElement',
          source: 'React',
          note: 'Dasar pola polymorphic `as` yang membuat satu komponen bisa merender tag berbeda.',
        },
      ),
    ],
  ),

  written(
    'kapan-tsx',
    'Kapan JSX Cukup, Kapan TSX Wajib',
    10,
    'Keputusan yang sebaiknya diambil di awal project, bukan di tengah jalan.',
    [
      terms(
        {
          term: 'trade-off',
          meaning:
            'Terjemahannya **pertukaran untung-rugi**. Sub-bab ini bukan tentang mana yang "lebih benar" — keduanya sah. Yang dibandingkan adalah **apa yang kamu bayar** (waktu belajar, baris tipe, build sedikit lebih lama) melawan **apa yang kamu dapat** (bug tertangkap lebih awal, autocomplete akurat, refactor yang aman).',
        },
        {
          term: 'beban kognitif',
          meaning:
            'Terjemahan dari *cognitive load*: berapa banyak hal baru yang harus ditahan di kepala **sekaligus**. Ini alasan utama kenapa belajar React sebaiknya dimulai dari JSX — menambahkan sistem tipe di saat yang sama berarti dua hal asing sekaligus, dan keduanya jadi lebih sulit dari seharusnya.',
        },
        {
          term: 'prototipe',
          meaning:
            'Kode yang dibuat untuk **menguji sebuah gagasan lalu dibuang**. Untuk ini JSX hampir selalu pilihan yang tepat. Bahayanya cuma satu, dan sangat nyata: prototipe yang ternyata tidak jadi dibuang, lalu tumbuh menjadi produk.',
        },
        {
          term: 'refactor aman',
          meaning:
            'Kemampuan mengubah nama atau memindahkan sesuatu dengan jaminan **tidak ada pemakai yang terlewat**. Ini manfaat TSX yang paling terasa pada project yang berumur panjang — pada JSX, mengganti nama sebuah prop berarti mencari manual dan berharap tidak ada yang tertinggal.',
        },
        {
          term: 'kontrak API',
          meaning:
            'Bentuk data yang dijanjikan sebuah layanan. Menuliskannya sebagai tipe membuatnya **terdokumentasi di dalam kode** alih-alih di catatan terpisah yang cepat basi. Tapi ingat: tipe **tidak memeriksa apa pun saat program berjalan** — data dari jaringan tetap wajib divalidasi.',
        },
        {
          term: 'validasi runtime',
          meaning:
            'Pemeriksaan bentuk data **saat program berjalan**, memakai pustaka seperti Zod. Wajib untuk data dari luar, karena TypeScript sudah dihapus di titik itu. Menulis `data as Tugas[]` hanya **membungkam** pemeriksa, bukan membuktikan apa pun.',
        },
        {
          term: 'type assertion',
          meaning:
            'Bentuk `nilai as Tipe` yang berarti "percaya saja, aku tahu bentuknya". **Bukan konversi dan bukan pemeriksaan** — kalau kamu keliru, TypeScript tetap diam dan errornya muncul saat berjalan. Pakai sehemat mungkin, dan curigai setiap kemunculannya saat mereview kode.',
        },
        {
          term: 'DX',
          meaning:
            'Singkatan *Developer Experience*, terjemahannya **pengalaman pengembang**. Seberapa nyaman kode itu dikerjakan sehari-hari: autocomplete, pesan error yang jelas, kepercayaan diri saat mengubah sesuatu. Sebagian besar nilai TSX sebenarnya jatuh ke kategori ini, bukan ke pencegahan bug.',
        },
      ),

      h2('Biaya sungguhan'),
      table(
        ['Biaya TSX', 'Imbalan TSX'],
        [
          ['Waktu belajar sistem tipe', 'Bug props tertangkap sebelum dijalankan'],
          ['Beberapa baris definisi tipe', 'Autocomplete yang benar-benar akurat'],
          ['Sesekali bergulat dengan tipe pustaka', 'Rename dan refactor otomatis yang aman'],
          ['Waktu build sedikit lebih lama', 'Bentuk data dari API terdokumentasi di kode'],
        ],
      ),

      h2('Kriteria memilih'),
      table(
        ['Situasi', 'Pilihan'],
        [
          ['Belajar React untuk pertama kali', '**JSX** — satu hal baru pada satu waktu'],
          ['Prototipe yang akan dibuang', 'JSX'],
          ['Project yang hidup lebih dari sebulan', '**TSX**'],
          ['Lebih dari satu orang mengerjakannya', '**TSX**'],
          ['Banyak data dari API', '**TSX**'],
          ['Membangun pustaka/komponen bersama', '**TSX** — pemakainya butuh tipenya'],
        ],
      ),
      callout(
        'tip',
        'Saran untuk kamu sekarang',
        'Kalau ini pertama kalinya belajar React, tulis dua atau tiga komponen pertama dalam JSX — supaya yang kamu pelajari benar-benar React, bukan TypeScript. Setelah itu pindah ke TSX dan jangan kembali. Menambahkan tipe belakangan jauh lebih mahal daripada memulainya dengan tipe.',
      ),

      h2('Migrasi bertahap'),
      code(
        'json',
        `
        {
          "compilerOptions": {
            "allowJs": true,      // izinkan .js dan .jsx hidup berdampingan
            "strict": false,      // sementara — naikkan setelah sebagian besar dikonversi
            "jsx": "react-jsx"
          }
        }
        `,
        { filename: 'tsconfig.json' },
      ),
      ol(
        'Ubah satu berkas dari `.jsx` menjadi `.tsx`.',
        'Perbaiki error yang muncul — biasanya props dan event.',
        'Ulangi. Mulai dari komponen daun (yang tidak mengimpor komponen lain).',
        'Setelah sebagian besar selesai, nyalakan `strict` dan bereskan sisanya.',
      ),
      callout(
        'warning',
        'Jangan berhenti di tengah selamanya',
        'Project yang separuh JSX dan separuh TSX mendapatkan biaya keduanya tanpa manfaat penuh salah satunya — dan batas antar keduanya jadi tempat bug bersembunyi. Selesaikan migrasinya.',
      ),

      h2('Yang bukan alasan'),
      ul(
        '**"TypeScript membuat aplikasi lebih cepat"** — tidak. Tipe dihapus saat build.',
        '**"TypeScript menghapus semua bug"** — tidak. Ia menangkap kesalahan bentuk data, bukan kesalahan logika.',
        '**"Semua orang memakainya"** — bukan alasan teknis.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'JSX untuk belajar dan prototipe; TSX untuk apa pun yang akan hidup lama.',
        'Pindah setelah dua-tiga komponen pertama, lalu jangan kembali.',
        'Migrasi bertahap: `allowJs`, mulai dari komponen daun, `strict` terakhir.',
        'TypeScript menangkap kesalahan bentuk data, bukan kesalahan logika.',
      ),
      references(
        {
          label: 'Adding TypeScript to an existing project',
          href: 'https://react.dev/learn/typescript#adding-typescript-to-an-existing-react-project',
          source: 'React',
          note: 'Langkah resmi migrasi bertahap dari project React yang sudah berjalan.',
        },
        {
          label: 'tsconfig — allowJs',
          href: 'https://www.typescriptlang.org/tsconfig/#allowJs',
          source: 'TypeScript',
          note: 'Opsi yang membuat `.jsx` dan `.tsx` bisa hidup berdampingan selama masa migrasi.',
        },
        {
          label: 'Migrating from JavaScript',
          href: 'https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html',
          source: 'TypeScript',
          note: 'Urutan yang dianjurkan: mulai dari berkas daun, naikkan ketegasan belakangan.',
        },
        {
          label: 'Type Checking JavaScript Files',
          href: 'https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html',
          source: 'TypeScript',
          note: 'Alternatif tanpa mengubah ekstensi — memakai JSDoc seperti di Sub-bab 1.16.',
        },
      ),
    ],
  ),

  written(
    'praktik-konversi-tsx',
    'Praktik: Konversi komponen JSX ke TSX',
    14,
    'Melihat sendiri error apa yang muncul, apa artinya, dan bug mana yang tertangkap sebelum dijalankan.',
    [
      p(
        'Praktik penutup Frontend Basic. Kamu akan mengambil satu komponen JSX yang sudah bekerja, mengubahnya ke TSX, dan mencatat setiap error yang muncul.',
      ),

      terms(
        {
          term: 'konversi',
          meaning:
            'Mengubah berkas `.jsx` menjadi `.tsx`. Yang perlu diluruskan sejak awal: **error yang muncul bukan kerusakan baru**. Semuanya sudah ada sejak tadi — TypeScript hanya membuatnya terlihat sebelum kode dijalankan, alih-alih menunggu pengguna yang menemukannya.',
        },
        {
          term: 'komponen daun',
          meaning:
            'Terjemahan dari *leaf component*: komponen yang **tidak mengimpor komponen lain**. Mulailah migrasi dari sini, karena tipenya tidak bergantung pada berkas yang belum dikonversi — sehingga errornya sedikit dan mudah dipahami.',
        },
        {
          term: 'implicit any',
          meaning:
            'Error paling pertama yang akan kamu temui: `Parameter "tugas" implicitly has an "any" type`. Artinya TypeScript **tidak punya petunjuk apa pun** tentang bentuk prop itu. Ini bukan keluhan rewel — ia menunjukkan bahwa kontrak komponenmu memang belum pernah ditulis di mana pun.',
        },
        {
          term: 'strictNullChecks',
          meaning:
            'Pemeriksaan yang membuat `null` dan `undefined` **tidak bisa masuk diam-diam** ke tempat yang tidak mengharapkannya. Ini yang menangkap bug `Cannot read properties of undefined` — kelas error yang paling sering muncul di produksi — sebelum kodenya sempat dijalankan.',
        },
        {
          term: 'union literal',
          meaning:
            'Tipe seperti `"semua" | "aktif" | "selesai"` untuk prop `filter`. Manfaatnya dua sekaligus: salah ketik nilai langsung tertangkap, **dan** editor menawarkan ketiga pilihan itu saat kamu mengetik.',
        },
        {
          term: 'bug yang tertangkap',
          meaning:
            'Inti sesungguhnya dari praktik ini. Catat setiap error yang muncul dan tanyakan: **apakah ini benar-benar bug, atau hanya tipe yang belum ditulis?** Sebagian akan ternyata bug sungguhan yang sudah lama ada di kode — dan menemukannya tanpa membuka browser adalah bukti paling meyakinkan tentang nilai TSX.',
        },
        {
          term: 'error TypeScript',
          meaning:
            'Pesannya sering panjang dan menakutkan, tapi polanya tetap: **baris pertama menyebut masalahnya**, sisanya menjelaskan jalur penalarannya. Bacalah seperti stack trace di Sub-bab 1.1 — dari atas, dan berhenti begitu kamu paham.',
        },
        {
          term: 'satisfies',
          meaning:
            'Operator yang memeriksa sebuah nilai **cocok dengan tipe tertentu tanpa melebarkan tipenya**. Berbeda dari `as` yang hanya membungkam pemeriksa, `satisfies` benar-benar memeriksa — sehingga ia pilihan yang lebih aman untuk objek konfigurasi.',
        },
      ),

      h2('1. Titik awal'),
      code(
        'jsx',
        `
        export function DaftarTugas({ tugas, filter, onToggle, onHapus, sedangMemuat }) {
          if (sedangMemuat) return <Skeleton />;

          const terlihat = tugas.filter((t) =>
            filter === 'semua' ? true : filter === 'aktif' ? !t.selesai : t.selesai,
          );

          if (terlihat.length === 0) return <p>Tidak ada tugas.</p>;

          return (
            <ul>
              {terlihat.map((t) => (
                <li key={t.id}>
                  <input
                    type="checkbox"
                    checked={t.selesai}
                    onChange={() => onToggle(t.id)}
                  />
                  <span>{t.judul}</span>
                  <button onClick={() => onHapus(t.id)}>Hapus</button>
                </li>
              ))}
            </ul>
          );
        }
        `,
        { filename: 'DaftarTugas.jsx' },
      ),

      h2('2. Ganti ekstensi dan baca errornya'),
      code(
        'text',
        `
        Parameter 'tugas' implicitly has an 'any' type.
        Parameter 'filter' implicitly has an 'any' type.
        Parameter 'onToggle' implicitly has an 'any' type.
        ...
        `,
      ),
      p(
        'Ini bukan gangguan — ini pertanyaan yang tepat: **apa sebenarnya bentuk data yang komponen ini terima?** Sebelumnya, jawabannya hanya ada di kepalamu.',
      ),

      h2('3. Definisikan bentuknya'),
      code(
        'tsx',
        `
        export type Tugas = {
          id: string;
          judul: string;
          selesai: boolean;
        };

        export type Filter = 'semua' | 'aktif' | 'selesai';

        type Props = {
          tugas: Tugas[];
          filter: Filter;
          onToggle: (id: string) => void;
          onHapus: (id: string) => void;
          sedangMemuat?: boolean;
        };

        export function DaftarTugas({
          tugas,
          filter,
          onToggle,
          onHapus,
          sedangMemuat = false,
        }: Props) {
          // ... isi sama persis
        }
        `,
        { filename: 'DaftarTugas.tsx' },
      ),

      h2('4. Bug yang langsung tertangkap'),
      code(
        'tsx',
        `
        <DaftarTugas
          tugas={tugas}
          filter="aktiv"                 // Error: '"aktiv"' bukan Filter — SALAH KETIK TERTANGKAP
          onToggle={onToggle}
          onHapus={onHapus}
        />

        <DaftarTugas tugas={tugas} filter="aktif" onToggle={onToggle} />
        // Error: Property 'onHapus' is missing — PROP WAJIB YANG TERLUPA

        <DaftarTugas tugas={tugas} filter="aktif" onToggle={(t) => t.id} ... />
        // Error: 'onToggle' menerima string, bukan objek — TANDA TANGAN SALAH
        `,
      ),
      callout(
        'info',
        'Ketiganya adalah bug nyata',
        'Di versi JSX, ketiganya lolos ke browser: filter salah ketik membuat daftar kosong tanpa penjelasan, prop yang hilang membuat tombol hapus tidak melakukan apa-apa, dan tanda tangan yang salah baru meledak saat tombol ditekan. Sekarang ketiganya muncul saat mengetik.',
      ),

      h2('5. Perbaiki dengan discriminated union'),
      p(
        'Perhatikan `sedangMemuat` di komponen asli. Ia boolean terpisah — artinya "sedang memuat **dan** punya data" bisa ditulis, meski tidak masuk akal.',
      ),
      code(
        'tsx',
        `
        type Props =
          | { status: 'memuat' }
          | { status: 'gagal'; pesan: string; onCobaLagi: () => void }
          | {
              status: 'siap';
              tugas: Tugas[];
              filter: Filter;
              onToggle: (id: string) => void;
              onHapus: (id: string) => void;
            };

        export function DaftarTugas(props: Props) {
          if (props.status === 'memuat') return <Skeleton />;
          if (props.status === 'gagal') {
            return <Error pesan={props.pesan} onCobaLagi={props.onCobaLagi} />;
          }

          const { tugas, filter, onToggle, onHapus } = props;
          // ... sisanya
        }
        `,
      ),
      p(
        'Sekarang keempat keadaan UI dari Bab 5 terwakili di sistem tipe, dan kombinasi yang mustahil tidak bisa ditulis sama sekali.',
      ),

      h2('6. Yang harus kamu catat sendiri'),
      ol(
        'Berapa banyak error yang muncul saat pertama mengubah ekstensi.',
        'Berapa di antaranya yang ternyata **bug sungguhan**, bukan sekadar tipe yang kurang.',
        'Berapa baris tambahan yang dibutuhkan — dan apakah itu sepadan menurutmu.',
      ),

      divider,
      h2('Penutup Frontend Basic'),
      p(
        'Kamu sudah menyelesaikan enam bab: JavaScript dari nol, objek dan prototype, asinkron dan event loop, DOM dan event, pengambilan data, dan jembatan ke React. Di Frontend Intermediate, hampir semuanya akan muncul lagi — `map` dan `key`, closure di dalam handler, empat keadaan UI, immutability, dan `this` yang menjelaskan kenapa arrow function ada di mana-mana.',
      ),
      p('React akan terasa jauh lebih masuk akal karena kamu tahu apa yang ia otomatiskan.'),

      divider,
      h2('Rangkuman'),
      ul(
        'Error "implicitly has an any type" adalah pertanyaan yang tepat, bukan gangguan.',
        'Konversi ke TSX langsung menangkap salah ketik, prop hilang, dan tanda tangan salah.',
        'Boolean prop yang terpisah membolehkan keadaan mustahil; discriminated union menutupnya.',
        'Nilai TypeScript di UI bukan sekadar mencegah salah ketik — tapi membuat keadaan yang tidak masuk akal tidak bisa diekspresikan.',
      ),
      references(
        {
          label: 'Using TypeScript',
          href: 'https://react.dev/learn/typescript',
          source: 'React',
          note: 'Rujukan menyeluruh untuk seluruh pola yang dipakai dalam konversi ini.',
        },
        {
          label: 'tsconfig — strictNullChecks',
          href: 'https://www.typescriptlang.org/tsconfig/#strictNullChecks',
          source: 'TypeScript',
          note: 'Pemeriksaan yang menangkap kelas bug `Cannot read properties of undefined`.',
        },
        {
          label: 'noImplicitAny',
          href: 'https://www.typescriptlang.org/tsconfig/#noImplicitAny',
          source: 'TypeScript',
          note: 'Sumber error pertama yang akan kamu temui saat mengubah ekstensi berkas.',
        },
        {
          label: 'The satisfies Operator',
          href: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html',
          source: 'TypeScript',
          note: 'Alternatif `as` yang benar-benar memeriksa alih-alih sekadar membungkam.',
        },
        {
          label: 'Describing the UI',
          href: 'https://react.dev/learn/describing-the-ui',
          source: 'React',
          note: 'Titik masuk Frontend Intermediate — seluruh konsep bab ini muncul lagi di sana.',
        },
      ),
    ],
  ),
];
