import {
  callout,
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
 * Frontend Basic — Chapter 6, all eleven lessons. Closes the category and bridges into React.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-jsx',
    'Kenapa Ada JSX: dari DOM manual ke deklaratif',
    20,
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
      p(
        'Kalimat di komentar itu adalah gagasan paling penting dari seluruh sub-bab, yaitu **JSX menghasilkan nilai** dan bukan pernyataan. Karena ia nilai, ia bisa diperlakukan seperti angka atau string, sehingga bisa disimpan di `const`, dikembalikan dari fungsi, dan dioper sebagai argumen. Baris kedua adalah wujud yang paling sering kamu tulis nanti, karena `items.map(...)` menghasilkan **array berisi JSX** dan React tahu cara merender array. Baris terakhir memakai ternary dari Bab 1, dan sekarang alasannya jelas, sebab ternary dipakai alih-alih `if` justru karena ia ekspresi yang menghasilkan nilai sedangkan `if` tidak. Itu pula sebabnya di dalam JSX kamu akan terus bertemu ternary dan `&&` alih-alih `if` dan `for`, karena yang dibutuhkan di sana selalu sesuatu yang menghasilkan nilai.',
      ),

      h2('Yang JSX TIDAK selesaikan'),
      ul(
        'Ia tidak membuat aplikasimu cepat dengan sendirinya — pembaruan yang salah tetap lambat.',
        'Ia tidak menghapus kebutuhan paham DOM; ia menyembunyikannya sampai kamu perlu.',
        'Ia bukan syarat memakai React — React bisa ditulis tanpa JSX, hanya jauh lebih sulit dibaca.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Di Bab 4 kamu membangun kartu produk dengan `createElement`, `textContent`, dan `append`. Fungsinya benar dan aman. Yang menjadi masalah muncul saat kartunya bertambah rumit, yaitu ada lencana diskon yang hanya tampil kalau ada diskon, tombol yang berubah bentuk kalau stok habis, dan daftar varian warna. Fungsi pembangunnya tumbuh menjadi enam puluh baris, dan tidak ada satu titik pun di dalamnya tempat kamu bisa melihat bentuk akhir kartunya.',
      ),
      p(
        'Perbandingan di bawah memakai kartu yang sama persis, dan yang berbeda hanya cara menuliskannya.',
      ),
      compare(
        {
          title: 'Dibangun langkah demi langkah',
          lang: 'js',
          code: `
          function buatKartu(p) {
            const kartu = document.createElement('article');
            kartu.className = 'kartu';

            const judul = document.createElement('h3');
            judul.textContent = p.nama;
            kartu.append(judul);

            if (p.diskonPersen > 0) {
              const lencana = document.createElement('span');
              lencana.className = 'lencana';
              lencana.textContent = \`-\${p.diskonPersen}%\`;
              kartu.append(lencana);
            }

            const tombol = document.createElement('button');
            tombol.textContent = p.stok > 0 ? 'Beli' : 'Stok habis';
            tombol.disabled = p.stok === 0;
            kartu.append(tombol);

            return kartu;
          }
          `,
          notes: ['Bentuk akhirnya harus dibayangkan sendiri dari urutan perintahnya'],
        },
        {
          title: 'Ditulis sebagai bentuk yang diinginkan',
          lang: 'jsx',
          code: `
          function Kartu({ produk: p }) {
            return (
              <article className="kartu">
                <h3>{p.nama}</h3>

                {p.diskonPersen > 0 && (
                  <span className="lencana">-{p.diskonPersen}%</span>
                )}

                <button disabled={p.stok === 0}>
                  {p.stok > 0 ? 'Beli' : 'Stok habis'}
                </button>
              </article>
            );
          }
          `,
          notes: ['Susunannya terbaca langsung, dan percabangannya terlihat di tempatnya'],
        },
      ),
      p(
        'Kedua fungsi menghasilkan susunan yang sama, dan yang berubah bukan jumlah barisnya melainkan **apa yang bisa dilihat sekilas**. Di kolom kiri, hubungan induk dan anak dinyatakan lewat pemanggilan `append` yang tersebar, sehingga pembaca harus melacaknya sendiri untuk tahu lencana itu berada di dalam kartu. Di kolom kanan, hubungan itu terlihat dari indentasi seperti pada HTML biasa.',
      ),
      p(
        'Perhatikan percabangan diskonnya. Di kolom kiri ia berupa blok `if` yang memutus alur pembacaan, dan blok itu harus berada di antara pembuatan judul dan pembuatan tombol supaya urutannya benar. Di kolom kanan percabangannya berada persis di posisi tempat hasilnya akan muncul, sehingga tidak ada urutan tersembunyi yang perlu dijaga.',
      ),
      p(
        'Yang perlu ditegaskan, JSX **bukan** HTML dan bukan pula template. Ia sintaks JavaScript yang diubah alat pembangun menjadi pemanggilan fungsi biasa, dan itu dibahas tuntas di Sub-bab 6.4. Karena ia JavaScript, seluruh aturan bahasa tetap berlaku di dalamnya, termasuk aturan bahwa sebuah ekspresi harus menghasilkan nilai.',
      ),
      callout(
        'info',
        'JSX tidak wajib dipakai, dan hampir semua orang memakainya',
        'React bisa ditulis sepenuhnya dengan `createElement` tanpa satu baris JSX, dan hasilnya sama persis. Yang membuat JSX hampir selalu dipakai adalah susunan bersarang yang dalam menjadi jauh lebih sulit dibaca dalam bentuk pemanggilan fungsi. Untuk satu atau dua tingkat perbedaannya tipis, dan untuk lima tingkat perbedaannya menentukan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat orang pertama kali menulis JSX, dan dua di antaranya tidak melempar apa pun. Semuanya diuji dengan `tsc` dan React sungguhan.',
      ),
      code(
        'text',
        `
        <div class="kotak" />

        error TS2322: Type '{ class: string; }' is not assignable to type
        'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'.
          Property 'class' does not exist on type '...'. Did you mean 'className'?
        `,
        { caption: 'Atribut HTML yang namanya bentrok dengan kata kunci JavaScript diganti.' },
      ),
      p(
        'Karena JSX adalah JavaScript, atribut yang namanya sama dengan kata kunci bahasa tidak bisa dipakai apa adanya. `class` menjadi `className` dan `for` menjadi `htmlFor`. Kabar baiknya TypeScript menebakkan jawabannya di akhir pesan. Pada project tanpa TypeScript, kesalahan ini **tidak** melempar sama sekali, dan yang terjadi hanya gayanya tidak pernah menempel.',
      ),
      code(
        'text',
        `
        <div onclick={() => {}} />

        error TS2322: Property 'onclick' does not exist on type '...'.
          Did you mean 'onClick'?
        `,
        { caption: 'Nama penangan peristiwa memakai huruf kapital di tengah.' },
      ),
      p(
        'Seluruh penangan peristiwa di JSX ditulis dengan huruf kapital pada kata keduanya, yaitu `onClick`, `onChange`, `onSubmit`, dan seterusnya. Tanpa TypeScript, menulis `onclick` menghasilkan atribut biasa yang diabaikan React, sehingga tombolnya diam tanpa satu pun pesan. Ini salah satu contoh paling langsung kenapa TypeScript layak dipakai untuk kode React.',
      ),
      code(
        'text',
        `
        const obj = { a: 1 };
        <div>{obj}</div>

        error TS2322: Type '{ a: number; }' is not assignable to type 'ReactNode'.

        # Dan saat dijalankan, React melempar:
        Objects are not valid as a React child (found: object with keys {a}).
        If you meant to render a collection of children, use an array instead.
        `,
        { caption: 'Object tidak bisa dirender, dan pesannya menyebut kuncinya.' },
      ),
      p(
        'Pesan runtime React di sini termasuk yang paling menolong karena ia menyebut kunci object yang bermasalah, sehingga kamu langsung tahu nilai mana yang salah tempat. Penyebab yang paling sering adalah lupa memilih fieldnya, misalnya menulis `{pengguna}` padahal yang dimaksud `{pengguna.nama}`. Penyebab kedua adalah menaruh object `Date` langsung, dan itu perlu diformat lebih dulu.',
      ),
      code(
        'text',
        `
        function kartu() { return <div>x</div>; }
        <kartu />

        # Hasil render: <kartu></kartu>
        # Tidak ada error, dan komponennya tidak pernah dipanggil.
        `,
        { caption: 'Nama berhuruf kecil dianggap tag HTML, bukan komponen.' },
      ),
      p(
        'Ini kegagalan senyap yang paling membingungkan bagi pemula. JSX membedakan komponen dari tag HTML **hanya** lewat huruf pertamanya, yaitu huruf besar berarti komponen dan huruf kecil berarti tag HTML. Komponen bernama `kartu` diperlakukan sebagai tag HTML tak dikenal yang dirender apa adanya, dan fungsinya tidak pernah dipanggil. Selalu awali nama komponen dengan huruf besar.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Property 'class' does not exist ... Did you mean 'className'?`",
            'Atribut yang bentrok dengan kata kunci JavaScript',
            'Pakai `className` dan `htmlFor`',
          ],
          [
            "`Did you mean 'onClick'?`",
            'Penangan peristiwa ditulis huruf kecil semua',
            'Pakai huruf kapital di kata kedua',
          ],
          [
            '`Objects are not valid as a React child`',
            'Object dirender langsung tanpa dipilih fieldnya',
            'Pilih fieldnya, atau format lebih dulu',
          ],
          [
            'Komponen tidak pernah dipanggil, dan tag asing muncul di DOM',
            'Nama komponennya berhuruf kecil',
            'Awali dengan huruf besar',
          ],
          [
            'Gaya tidak menempel tanpa satu pun error',
            'Project tanpa TypeScript, sehingga `class` diabaikan diam-diam',
            'Pertimbangkan TypeScript, atau pasang aturan lint untuk JSX',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'JSX terlihat seperti HTML, dan kemiripan itu yang menjadi sumber hampir seluruh kesalahan di bawah. Setiap kali ada yang terasa aneh, ingat bahwa yang kamu tulis adalah JavaScript.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyalin HTML apa adanya ke dalam JSX',
            'Bentuknya kan sama',
            '`class`, `for`, `tabindex`, dan seluruh atribut `on...` punya nama berbeda. Tag yang tidak ditutup juga menjadi kesalahan sintaks',
          ],
          [
            'Menamai komponen dengan huruf kecil',
            'Nama fungsi biasanya memang huruf kecil',
            'JSX memperlakukannya sebagai tag HTML, dan komponennya tidak pernah dipanggil. Tidak ada error sama sekali',
          ],
          [
            'Mengira JSX adalah bahasa template tersendiri',
            'Ia punya sintaks sendiri',
            'Ia JavaScript. Tidak ada `if` di dalamnya bukan karena dilarang melainkan karena `if` bukan ekspresi',
          ],
          [
            'Menulis komentar HTML di dalam JSX',
            'Bentuknya kan mirip HTML',
            'Komentar HTML akan dirender sebagai teks. Pakai bentuk JavaScript di dalam kurung kurawal',
          ],
          [
            'Menaruh seluruh halaman dalam satu komponen raksasa',
            'Belum perlu dipecah',
            'Keuntungan terbesar JSX muncul saat susunan bersarang bisa diberi nama. Komponen tiga ratus baris kehilangan itu',
          ],
          [
            'Mengira JSX lebih lambat karena ada tahap penerjemahan',
            'Ada langkah tambahan sebelum dijalankan',
            'Penerjemahan terjadi saat build, bukan saat halaman berjalan. Hasil akhirnya pemanggilan fungsi biasa yang sama persis',
          ],
        ],
      ),
      p(
        'Baris kedua adalah kesalahan yang paling mahal waktunya karena tidak menghasilkan satu pun petunjuk. Kamu melihat tag asing di tab Elements, komponennya tidak pernah berjalan, dan tidak ada pesan apa pun di console. Kebiasaan mengawali seluruh nama komponen dengan huruf besar sejak awal menutup seluruh kelas bug ini, dan hampir semua konfigurasi lint React memeriksanya.',
      ),
      callout(
        'tip',
        'Cara cepat memastikan sesuatu adalah komponen atau tag',
        'Lihat huruf pertamanya. Huruf besar berarti JSX mencarinya sebagai variabel di scope, dan kalau tidak ada akan melempar. Huruf kecil berarti JSX mengirimkannya sebagai nama tag apa adanya, dan tag apa pun diterima tanpa protes. Aturan satu huruf itu yang menentukan segalanya.',
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
    20,
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
            'Di JSX, `style` menerima **objek** alih-alih teks, misalnya `style={{ color: "red" }}`. Kurung kurawal gandanya bukan sintaks khusus, sebab yang luar adalah penanda ekspresi JSX sedangkan yang dalam adalah object literal biasa. Nama propertynya juga camelCase, yaitu `backgroundColor` dan bukan `background-color`.',
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
      p(
        'Fragment ada untuk satu masalah, yaitu JSX mengharuskan **satu elemen akar** padahal kadang kamu perlu mengembalikan beberapa elemen sejajar tanpa pembungkus tambahan. Contoh di atas persis kasusnya, sebab `<dt>` dan `<dd>` harus menjadi anak langsung dari `<dl>` sehingga membungkusnya dengan `<div>` akan merusak strukturnya. Fragment menyelesaikan itu karena ia **tidak menghasilkan elemen apa pun di DOM**, melainkan hanya pengelompokan bagi JSX. Keterangan di bawah kode menyebut batasannya. Bentuk pendek `<>...</>` lebih enak dibaca, tapi ia tidak bisa menerima atribut apa pun termasuk `key`. Karena merender daftar mewajibkan `key`, di dalam `map` kamu harus memakai bentuk panjang `<Fragment key={...}>` yang perlu diimpor dari React.',
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
      p(
        'Di HTML, `<img>` dan `<br>` boleh ditulis tanpa penutup karena browser memang mengizinkannya. JSX tidak sepermisif itu — ia harus diurai menjadi struktur data yang tepat, jadi **setiap tag wajib punya penutup**, entah berupa `</tag>` atau garis miring di ujung seperti `<img />`. Lupa garis miring itu bukan menghasilkan tag kosong melainkan `SyntaxError` yang menghentikan seluruh build, jadi setidaknya kegagalannya berisik dan cepat ketahuan. Baris terakhir menunjukkan bahwa bentuk self-closing juga sah untuk tag yang biasanya berisi: `<div />` sama artinya dengan `<div></div>`, dan itu berguna untuk elemen yang memang sengaja dikosongkan.',
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
      p(
        "Aturan ini terlihat sepele tapi ia **satu-satunya cara** JSX membedakan tag HTML dari komponenmu, dan pembedanya benar-benar hanya huruf pertama. Alasannya masuk akal begitu kamu tahu apa yang dihasilkan JSX. Huruf kecil diubah menjadi **string** `'button'` yang diteruskan ke React sebagai nama tag HTML, sedangkan huruf besar diubah menjadi **referensi variabel** `Button` yang menunjuk ke fungsi komponenmu. Karena itulah `<tombol />` tidak pernah menjadi komponen, sebab ia dikirim sebagai string `'tombol'` dan React dengan patuh membuat tag HTML bernama itu. Gejalanya persis seperti disebut di kotak berikut, yaitu tidak ada error, tidak ada peringatan, hanya elemen kosong yang tidak menampilkan apa-apa.",
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
      p(
        'Komentar terakhir menjawab kebingungan yang hampir semua pemula alami, yaitu bahwa `{{ ... }}` **bukan sintaks khusus**. Kurung luar adalah kurung JSX yang berarti "mulai ekspresi JavaScript", sedangkan kurung dalam adalah literal objek biasa, persis seperti object yang kamu pelajari di Bab 1. Karena isinya objek JavaScript dan bukan teks CSS, aturannya ikut aturan JavaScript, sehingga nama property memakai camelCase (`fontSize`, bukan `font-size`), nilainya dipisah koma alih-alih titik koma, dan teks harus diberi tanda kutip. Ada satu kemudahan yang layak diingat, yaitu **angka polos otomatis diberi satuan `px`**, jadi `fontSize: 14` menghasilkan `14px`. Untuk satuan lain kamu harus menulisnya sebagai string, misalnya `width: \'50%\'`.',
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
      p(
        'Alasan komentar harus dibungkus kurung kurawal sekarang seharusnya sudah jelas: di dalam JSX, apa pun yang bukan tag dianggap **teks yang akan ditampilkan**. Menulis `// catatan` di antara elemen tidak akan diperlakukan sebagai komentar — ia tampil di layar apa adanya sebagai tulisan. Kurung kurawal memindahkanmu kembali ke wilayah JavaScript, dan di sanalah `/* ... */` bermakna komentar seperti biasa. Perhatikan bentuk yang dipakai adalah komentar blok, bukan `//`, karena komentar satu baris akan ikut mengomentari kurung kurawal penutupnya sendiri.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen baris tabel pesanan harus menampilkan status dengan warna berbeda, menampilkan tombol batalkan hanya untuk pesanan yang masih bisa dibatalkan, dan menampilkan tanggal dalam format Indonesia. Kamu menulisnya dan bertemu tiga kesalahan sintaks berturut-turut, yaitu dua elemen berdampingan ditolak, blok `if` di dalam JSX ditolak, dan gaya inline yang ditulis seperti CSS ditolak.',
      ),
      p(
        'Ketiganya berasal dari satu hal yang sama, yaitu JSX adalah **ekspresi JavaScript**, dan sebuah ekspresi harus menghasilkan tepat satu nilai. Begitu itu dipegang, ketiga aturannya berhenti terasa sewenang-wenang.',
      ),
      code(
        'jsx',
        `
        function BarisPesanan({ pesanan, onBatal }) {
          const bisaBatal = pesanan.status === 'lunas' || pesanan.status === 'menunggu';

          return (
            // Satu induk. Fragment dipakai supaya tidak menambah elemen ke DOM.
            <>
              <td>{pesanan.nomor}</td>

              <td>
                <span className={\`lencana lencana-\${pesanan.status}\`}>
                  {LABEL_STATUS[pesanan.status] ?? 'Tidak dikenal'}
                </span>
              </td>

              <td>
                <time dateTime={pesanan.padaIso}>
                  {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' })
                    .format(new Date(pesanan.padaIso))}
                </time>
              </td>

              {/* Komentar di JSX ditulis begini, di dalam kurung kurawal */}
              <td style={{ textAlign: 'right' }}>
                {bisaBatal ? (
                  <button type="button" onClick={() => onBatal(pesanan.id)}>
                    Batalkan
                  </button>
                ) : null}
              </td>
            </>
          );
        }
        `,
        { filename: 'src/pesanan/BarisPesanan.jsx' },
      ),
      p(
        'Fragment yang ditulis sebagai tag kosong menyelesaikan masalah pertama tanpa menambah elemen apa pun ke DOM. Ini penting untuk tabel, sebab menambahkan `div` pembungkus di antara `tr` dan `td` menghasilkan HTML yang tidak sah dan tata letak tabel yang rusak. Kalau kamu butuh memberi `key` pada fragment, ada bentuk panjangnya yaitu `<Fragment key={...}>` yang perlu diimpor.',
      ),
      p(
        'Gaya inline ditulis sebagai **object**, bukan teks, dan itu konsekuensi langsung dari JSX yang berupa JavaScript. Nama propertinya memakai huruf kapital di tengah seperti di DOM, jadi `text-align` menjadi `textAlign`. Kurung kurawal ganda pada `style={{ ... }}` bukan sintaks khusus, melainkan satu pasang untuk menyisipkan ekspresi dan satu pasang lagi untuk object di dalamnya.',
      ),
      p(
        'Percabangan memakai ternary karena `if` adalah pernyataan, bukan ekspresi, sehingga ia tidak menghasilkan nilai yang bisa disisipkan. Kalau percabangannya rumit, jalan keluarnya menghitung nilainya di atas `return` seperti pada baris `bisaBatal`, lalu menyisipkan hasilnya. Ini bentuk yang jauh lebih terbaca daripada ternary bersarang.',
      ),
      code(
        'jsx',
        `
        // Empat cara menampilkan sesuatu secara bersyarat, dan kapan memakainya.

        {bisaBatal ? <TombolBatal /> : null}          // dua kemungkinan, atau tidak ada
        {bisaBatal && <TombolBatal />}                // hati-hati, lihat bagian error
        {bisaBatal ? <TombolBatal /> : <TombolLacak />} // dua kemungkinan berbeda

        {(() => {                                      // hindari, sulit dibaca
          if (a) return <A />;
          return <B />;
        })()}
        `,
        { caption: 'Bentuk keempat sah dan hampir selalu menandakan logikanya perlu dipindah.' },
      ),
      p(
        'Bentuk keempat memakai fungsi yang langsung dipanggil supaya `if` bisa dipakai di dalam JSX. Ia sah dan bekerja, dan kehadirannya hampir selalu menandakan bahwa percabangan itu terlalu rumit untuk berada di dalam JSX. Pindahkan ke atas `return` sebagai variabel, atau pecah menjadi komponen tersendiri. Keduanya menghasilkan kode yang lebih mudah diuji.',
      ),
      callout(
        'tip',
        'Kapan JSX perlu dibungkus tanda kurung',
        'Tanda kurung setelah `return` diperlukan kalau JSX-nya dimulai di baris berikutnya. Tanpa itu, JavaScript menyisipkan titik koma otomatis setelah `return` dan fungsinya mengembalikan `undefined`. Ini salah satu dari sedikit tempat penyisipan titik koma otomatis benar-benar menggigit, dan gejalanya berupa komponen yang tidak menampilkan apa pun tanpa error.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut mencakup hampir seluruh kesalahan sintaks JSX yang akan kamu temui, dan satu di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        return (
          <td>satu</td>
          <td>dua</td>
        );

        error: Adjacent JSX elements must be wrapped in an enclosing tag.
        Did you want a JSX fragment <>...</>?
        `,
        { caption: 'Dua elemen berdampingan tanpa satu induk.' },
      ),
      p(
        'Alasannya bukan aturan gaya melainkan konsekuensi bahasa. Ekspresi harus menghasilkan satu nilai, dan dua elemen berdampingan adalah dua nilai. Pesan errornya bahkan menyarankan jawabannya. Pakai fragment kalau kamu tidak ingin menambah elemen ke DOM, dan pakai elemen sungguhan kalau memang butuh pembungkus untuk gaya.',
      ),
      code(
        'text',
        `
        <div>
          {if (a) { return <A />; }}
        </div>

        error: Unexpected token. Did you mean \`{'if'}\` or \`&if;\`?
        `,
        { caption: '`if` adalah pernyataan, dan hanya ekspresi yang boleh disisipkan.' },
      ),
      p(
        'Pesan errornya membingungkan karena penerjemah menduga kamu bermaksud menuliskan kata `if` sebagai teks. Yang sebenarnya terjadi adalah kurung kurawal di dalam JSX hanya menerima ekspresi, dan `if` bukan ekspresi. Gantilah dengan ternary, atau hitung nilainya di atas `return`. Aturan yang sama berlaku untuk `for` dan `switch`.',
      ),
      code(
        'text',
        `
        function A() {
          return
            <div>halo</div>;
        }

        # Tidak ada error. Komponennya mengembalikan undefined
        # dan tidak menampilkan apa pun.
        `,
        { caption: 'Titik koma disisipkan otomatis tepat setelah `return`.' },
      ),
      p(
        'JavaScript menyisipkan titik koma setelah `return` yang diikuti baris baru, sehingga fungsinya mengembalikan `undefined` dan baris JSX di bawahnya menjadi kode mati. Tidak ada error karena keduanya sah secara sintaks. Perbaikannya membuka tanda kurung di baris yang sama dengan `return`, dan itu sebabnya hampir seluruh contoh React menulisnya begitu.',
      ),
      code(
        'text',
        `
        <div style="color: red" />

        error TS2559: Type 'string' has no properties in common with type
        'Properties<string | number, string & {}>'.
        `,
        { caption: 'Gaya inline harus berupa object, bukan teks CSS.' },
      ),
      p(
        "Pesannya tidak menyebut kata object sama sekali, dan itu yang membuatnya sulit dibaca pertama kali. Yang dikatakannya adalah teks tidak punya properti yang sama dengan tipe kumpulan properti CSS. Perbaikannya menulis `style={{ color: 'red' }}`, dengan nama properti bergaya huruf kapital di tengah untuk nama yang bertanda hubung.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Adjacent JSX elements must be wrapped`',
            'Lebih dari satu elemen dikembalikan',
            'Bungkus dengan fragment `<>...</>`',
          ],
          [
            '`Unexpected token` pada `if` di dalam JSX',
            'Kurung kurawal hanya menerima ekspresi',
            'Pakai ternary, atau hitung di atas `return`',
          ],
          [
            'Komponen tidak menampilkan apa pun tanpa error',
            'Titik koma otomatis setelah `return`',
            'Buka tanda kurung di baris yang sama dengan `return`',
          ],
          [
            "`Type 'string' has no properties in common with ... Properties`",
            'Gaya inline ditulis sebagai teks CSS',
            'Tulis sebagai object dengan nama bergaya huruf kapital di tengah',
          ],
          [
            'Komentar muncul sebagai teks di halaman',
            'Komentar HTML dipakai di dalam JSX',
            'Pakai bentuk JavaScript di dalam kurung kurawal',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Anatomi JSX punya beberapa aturan yang terasa sewenang-wenang sampai kamu ingat bahwa semuanya JavaScript. Baris di bawah adalah tempat kemiripan dengan HTML paling menyesatkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis gaya inline sebagai teks CSS',
            'Bentuknya sama dengan atribut `style` di HTML',
            'JSX menerima object. Nama bertanda hubung menjadi bergaya huruf kapital di tengah',
          ],
          [
            'Membungkus segalanya dengan `div` supaya jadi satu induk',
            'Itu jalan keluar yang paling langsung',
            'Menambah elemen yang tidak diperlukan ke DOM, dan merusak tata letak tabel dan flex. Pakai fragment',
          ],
          [
            'Menulis ternary bersarang tiga tingkat di dalam JSX',
            'Semua kemungkinan jadi di satu tempat',
            'Termasuk bentuk yang paling sulit dibaca. Hitung di atas `return`, atau pecah menjadi komponen',
          ],
          [
            'Lupa menutup tag yang di HTML boleh tidak ditutup',
            '`<br>` dan `<img>` di HTML memang begitu',
            'JSX menuntut semuanya ditutup. Tulis `<br />` dan `<img />`',
          ],
          [
            'Memakai `&&` untuk semua tampilan bersyarat',
            'Lebih pendek daripada ternary',
            'Nilai `0` dan teks kosong ikut dirender. Ini dibahas tuntas di sub-bab berikutnya',
          ],
          [
            'Menaruh logika pengambilan data di dalam JSX',
            'Datanya kan dipakai di situ',
            'JSX sebaiknya hanya menyusun tampilan. Hitung dan ambil di atas `return`, lalu sisipkan hasilnya',
          ],
        ],
      ),
      p(
        'Baris keenam layak dijadikan kebiasaan tetap sejak awal. Kalau di dalam JSX ada perhitungan yang lebih dari sekadar menyisipkan nilai, angkat ke variabel di atas `return` dan beri nama yang menjelaskan. Selain lebih terbaca, variabel itu juga bisa dicetak saat menelusuri bug, sedangkan ekspresi yang tertanam di dalam JSX tidak bisa disentuh tanpa mengubah strukturnya.',
      ),
      callout(
        'info',
        'Atribut yang namanya berbeda dari HTML',
        'Yang paling sering ditemui adalah `class` menjadi `className`, `for` menjadi `htmlFor`, `tabindex` menjadi `tabIndex`, `readonly` menjadi `readOnly`, `maxlength` menjadi `maxLength`, dan `colspan` menjadi `colSpan`. Polanya seragam, yaitu atribut bertanda hubung atau bersuku kata banyak ditulis dengan huruf kapital di tengah. Atribut `data-` dan `aria-` justru dikecualikan dan tetap ditulis dengan tanda hubung.',
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
    20,
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
      p(
        'Ketiga bentuk ini bekerja karena sifat yang sudah kamu pelajari di Bab 1, bukan karena aturan khusus React. `&&` mengembalikan **salah satu operannya** alih-alih `true` atau `false`. Kalau sisi kiri truthy hasilnya sisi kanan, yaitu elemen JSX-nya, dan kalau falsy hasilnya nilai kiri itu sendiri, yang biasanya `false` atau `null` dan **diabaikan React** sesuai tabel di atas. Ternary dipakai saat ada dua kemungkinan tampilan, dan ia sah di sini justru karena ternary adalah ekspresi. Baris ketiga menunjukkan pola yang sangat sering, yaitu menampilkan sesuatu **hanya bila datanya ada** sekaligus memakai nilainya. Semua ini berjalan mulus sampai nilai di sisi kiri berupa angka, dan di situlah jebakan pada kotak berikut muncul.',
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
      p(
        'Telusuri versi SALAH pada daftar kosong. `items.length` bernilai `0`, dan `0 && x` menghasilkan `0` alih-alih `false`. Menurut tabel di atas, `false` diabaikan React tapi **angka `0` tetap dirender**, jadi yang muncul di layar adalah angka nol yang menggantung tanpa penjelasan. Bugnya sangat sering lolos karena selama pengembangan daftarnya hampir selalu berisi data. Kedua versi BENAR memperbaikinya dengan cara yang sama, yaitu memastikan sisi kiri benar-benar **boolean** sebelum bertemu `&&`. `items.length > 0` menghasilkan `true` atau `false`, begitu juga `Boolean(items.length)`. Aturan yang bisa dibawa pulang, jangan pernah menaruh angka di sisi kiri `&&` di dalam JSX, melainkan ubah dulu menjadi perbandingan.',
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
      p(
        '`map` dipakai di sini alih-alih `for` karena aturan yang sama seperti sebelumnya, yaitu hanya **ekspresi** yang boleh masuk kurung kurawal sedangkan `for` adalah pernyataan yang tidak menghasilkan nilai. `map` menghasilkan array berisi elemen JSX, dan React tahu cara merender array secara berurutan. Perhatikan `key` ditaruh pada elemen **terluar** yang dihasilkan tiap putaran, bukan pada `<ul>` dan bukan pada elemen di dalam `<li>`. Itu ketentuan yang mutlak, sebab React memerlukan penanda identitas tepat di tingkat tempat elemen-elemen bersaudara itu berada. Perhatikan juga tanda kurung setelah `=>` yang membungkus JSX multi-baris, karena ia diperlukan agar penyisipan titik koma otomatis tidak memotong return value-nya, sekaligus menjaga return implisit tetap berlaku.',
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
      p(
        'Kedua baris menghasilkan tampilan awal yang **sama persis**, dan itulah kenapa versi rapuh sering lolos. Perbedaannya baru muncul saat daftarnya berubah urutan. `key={i}` memakai posisi alih-alih identitas, sehingga menyisipkan satu item di awal membuat item yang tadinya `key={0}` kini menjadi `key={1}`, dan React menyimpulkan bahwa isi tiap baris berubah alih-alih bahwa ada baris baru di depan. Akibatnya bukan sekadar pemborosan render, sebab keadaan internal yang menempel pada baris, misalnya teks yang sedang diketik di sebuah input atau checkbox yang sedang tercentang, ikut tertinggal di posisi lamanya dan seolah **berpindah ke baris yang salah**. `key={item.id}` memakai identitas yang melekat pada datanya, sehingga React bisa mengenali baris yang sama meski posisinya bergeser. Indeks hanya aman bila daftarnya tidak pernah diurutkan ulang, disisipi, atau dihapus di tengah.',
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
      p(
        'Versi pertama menumpuk tiga ternary dalam satu baris, dan membacanya menuntut kamu melacak pasangan `?` dengan `:` sambil menahan tiga kondisi di kepala, persis keluhan yang sama seperti kode bertingkat di Bab 1 hanya dalam bentuk yang lebih padat. Versi kedua memindahkan seluruh percabangan ke **atas** JSX sebagai rangkaian early return, dan hasilnya tiap baris menutup satu kemungkinan lalu selesai. Ini menjawab pertanyaan yang wajar muncul, yaitu kalau `if` tidak boleh dipakai di dalam JSX, bagaimana menangani percabangan rumit? Jawabannya bukan memaksakan ternary bertingkat melainkan **keluar dari JSX**, sebab di badan fungsi `if` sepenuhnya sah. Aturan praktisnya, satu ternary di dalam JSX masih terbaca, dan begitu butuh tingkat kedua, pindahkan ke atas.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman keranjang menampilkan jumlah barang di badge, daftar barangnya, dan pesan kosong kalau tidak ada apa-apa. Kamu menulisnya dengan `&&` karena bentuknya paling pendek. Setelah dipasang, muncul laporan aneh, yaitu angka nol muncul begitu saja di tengah halaman saat keranjang kosong, dan pesan kosongnya tidak pernah tampil.',
      ),
      p(
        'Inilah jebakan `&&` yang paling sering, dan penyebabnya bukan React melainkan aturan JavaScript yang sudah dibahas di Bab 1. Operator `&&` mengembalikan **operand kirinya** kalau kiri bernilai salah, bukan mengembalikan `false`.',
      ),
      code(
        'jsx',
        `
        const barang = [];   // keranjang kosong

        // SALAH: barang.length bernilai 0, dan React MERENDER angka 0.
        <div>{barang.length && <Badge jumlah={barang.length} />}</div>
        // Hasil: <div>0</div>

        // BENAR: paksa menjadi boolean, atau bandingkan.
        <div>{barang.length > 0 && <Badge jumlah={barang.length} />}</div>
        <div>{Boolean(barang.length) && <Badge jumlah={barang.length} />}</div>
        <div>{barang.length ? <Badge jumlah={barang.length} /> : null}</div>
        `,
        { caption: 'Diuji dengan React sungguhan. Angka `0` benar-benar muncul di halaman.' },
      ),
      p(
        'Yang membuat jebakan ini berbahaya adalah ia hanya muncul pada nilai nol, sehingga pengujian dengan keranjang berisi tiga barang selalu lulus. Perlu dicatat React memperlakukan nilai palsu secara berbeda satu sama lain. Nilai `false`, `null`, dan `undefined` tidak dirender sama sekali, sedangkan angka `0` dan teks kosong dirender apa adanya. Karena itu `&&` hanya aman kalau sisi kirinya benar-benar boolean.',
      ),
      code(
        'jsx',
        `
        function DaftarKeranjang({ barang, memuat, galat }) {
          // Empat keadaan diputuskan DI ATAS return, bukan bertumpuk di dalam JSX.
          if (memuat) return <Skeleton baris={3} />;
          if (galat) return <PesanGagal galat={galat} onCobaLagi={muatUlang} />;
          if (barang.length === 0) return <KeranjangKosong />;

          const totalSen = barang.reduce((j, b) => j + b.hargaSen * b.jumlah, 0);

          return (
            <div>
              <Badge jumlah={barang.length} />

              <ul>
                {barang.map((b) => (
                  // key WAJIB, dan harus id sungguhan bukan indeks.
                  <li key={b.id}>
                    {b.nama} × {b.jumlah}
                  </li>
                ))}
              </ul>

              <p>Total {formatRupiah(totalSen)}</p>
            </div>
          );
        }
        `,
        { filename: 'src/keranjang/DaftarKeranjang.jsx' },
      ),
      p(
        'Tiga `return` lebih awal di atas menggantikan tiga tingkat percabangan di dalam JSX, dan ini persis pola guard clause dari Bab 1 yang muncul kembali. Keuntungannya sama, yaitu tiap keadaan dan hasilnya bersebelahan, dan jalur suksesnya rata di bawah tanpa indentasi tambahan. Menambah keadaan keempat berarti menyisipkan satu baris, bukan membongkar ternary bersarang.',
      ),
      p(
        'Baris `key={b.id}` adalah kewajiban yang sering dianggap formalitas. React memakainya untuk mencocokkan elemen lama dengan elemen baru saat daftar berubah, persis seperti `Map` id ke elemen yang kamu tulis sendiri di Bab 4. Tanpa `key`, React mencocokkan berdasarkan posisi, sehingga menghapus baris pertama membuat seluruh baris di bawahnya dianggap berubah isinya. Akibat nyatanya, isian kotak input di dalam baris ikut berpindah ke baris yang salah.',
      ),
      p(
        'Perhitungan `totalSen` diletakkan di atas `return`, bukan disisipkan langsung ke JSX. Selain lebih terbaca, variabel bernama itu bisa dicetak saat menelusuri bug. Ekspresi panjang yang tertanam di dalam JSX tidak bisa disentuh tanpa mengubah strukturnya, dan itu perbedaan yang terasa saat ada laporan totalnya salah.',
      ),
      callout(
        'warning',
        'Jangan pernah memakai indeks array sebagai `key`',
        'Bentuk `key={i}` sekilas bekerja dan rusak begitu daftarnya bisa diurutkan, disaring, atau dihapus di tengah. Indeks menyatakan posisi, sedangkan `key` harus menyatakan identitas. Gejalanya khas, yaitu isi kotak input berpindah ke baris lain, atau animasi terpasang pada baris yang salah. Ini persis masalah yang sama dengan memakai indeks sebagai penanda baris di Bab 4.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React sungguhan, dan dua di antaranya berupa peringatan yang sangat mudah diabaikan.',
      ),
      code(
        'text',
        `
        <ul>{[1, 2].map((n) => <li>{n}</li>)}</ul>

        Warning: Each child in a list should have a unique "key" prop.
        Check the top-level render call using <li>.
        See https://react.dev/link/warning-keys for more information.
        `,
        { caption: 'Peringatan, bukan error, sehingga halaman tetap berjalan.' },
      ),
      p(
        'Karena ini hanya peringatan, halamannya terlihat benar dan mudah sekali diabaikan. Akibatnya baru muncul saat daftarnya berubah, dan bentuknya berupa keadaan yang berpindah ke baris yang salah. Perlakukan peringatan `key` sebagai kesalahan yang harus diperbaiki, bukan sebagai catatan. Sebagian tim bahkan menyetel lint agar menolaknya.',
      ),
      code(
        'text',
        `
        <div>{{ nama: 'Sari' }}</div>

        Objects are not valid as a React child (found: object with keys {nama}).
        If you meant to render a collection of children, use an array instead.
        `,
        { caption: 'Object dirender langsung, dan pesannya menyebut kuncinya.' },
      ),
      p(
        'Pesan ini menyebut kunci object yang bermasalah, dan itu petunjuk yang langsung mengarah ke penyebabnya. Selain lupa memilih field, penyebab lain yang sering adalah object `Date` dan hasil `Promise`. Yang terakhir itu khas, yaitu memanggil fungsi `async` di dalam JSX menghasilkan janji yang bukan node React, dan pesannya akan menyebut object tanpa kunci.',
      ),
      code(
        'text',
        `
        const jumlah = 0;
        <div>{jumlah && <Badge />}</div>

        # Hasil render: <div>0</div>
        # Tidak ada error dan tidak ada peringatan.
        `,
        { caption: 'Angka nol dirender, sedangkan `false` dan `null` tidak.' },
      ),
      p(
        'Perbedaan perlakuan inilah yang membuat jebakan ini bertahan. Kalau React merender `false` sebagai teks, kesalahan ini akan langsung terlihat pada semua kasus. Karena hanya nol dan teks kosong yang dirender, ia hanya muncul pada keadaan tertentu yang jarang diuji. Aturan praktisnya, sisi kiri `&&` harus selalu berupa perbandingan yang menghasilkan boolean.',
      ),
      code(
        'text',
        `
        <input value={nilai} />

        Warning: You provided a \`value\` prop to a form field without an
        \`onChange\` handler. This will render a read-only field.
        `,
        { caption: 'Kolom terkendali tanpa penangan perubahan tidak bisa diketik.' },
      ),
      p(
        'Begitu kamu memberikan `value` pada kolom formulir, React mengambil alih nilainya sepenuhnya dan mengabaikan ketikan pengguna kecuali kamu memperbaruinya lewat `onChange`. Gejalanya berupa kotak input yang tidak bisa diketik sama sekali. Kalau yang kamu maksud hanya nilai awal, pakai `defaultValue`. Perbedaan keduanya dibahas lebih jauh di kategori Frontend Intermediate.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Each child in a list should have a unique "key" prop`',
            'Elemen hasil `map` tidak diberi `key`',
            'Tambahkan `key` berisi id sungguhan, bukan indeks',
          ],
          [
            '`Objects are not valid as a React child`',
            'Object, `Date`, atau janji dirender langsung',
            'Pilih fieldnya, format lebih dulu, atau `await` di luar JSX',
          ],
          [
            'Angka `0` muncul di halaman',
            '`&&` dengan sisi kiri berupa angka',
            'Bandingkan lebih dulu, misalnya `arr.length > 0 &&`',
          ],
          [
            'Kotak input tidak bisa diketik',
            '`value` diberikan tanpa `onChange`',
            'Tambahkan `onChange`, atau pakai `defaultValue`',
          ],
          [
            'Isian input berpindah ke baris lain setelah menghapus',
            '`key` memakai indeks array',
            'Pakai id yang melekat pada datanya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menyisipkan ekspresi ke JSX terlihat sederhana, dan sebagian besar kesalahan di bawah berasal dari lupa bahwa aturan JavaScript tetap berlaku sepenuhnya di dalam kurung kurawal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `&&` dengan sisi kiri berupa angka',
            'Nol kan berarti tidak ada',
            'React merender angka `0`. Bandingkan lebih dulu supaya sisi kirinya boolean',
          ],
          [
            'Memakai indeks array sebagai `key`',
            'Indeksnya unik dan sudah tersedia',
            'Indeks menyatakan posisi bukan identitas. Menghapus di tengah membuat keadaan berpindah ke baris salah',
          ],
          [
            'Memanggil fungsi dengan tanda kurung pada penangan peristiwa',
            'Bentuknya seperti memanggil fungsi biasa',
            '`onClick={hapus(id)}` menjalankan `hapus` saat render, bukan saat diklik. Bungkus menjadi `onClick={() => hapus(id)}`',
          ],
          [
            'Memakai fungsi `async` langsung sebagai isi JSX',
            'Datanya kan perlu diambil',
            'Fungsi `async` mengembalikan janji, dan janji bukan node React. Ambil datanya di luar, lalu sisipkan hasilnya',
          ],
          [
            'Menaruh perhitungan panjang langsung di dalam kurung kurawal',
            'Hemat baris',
            'Tidak bisa dicetak saat menelusuri, dan sulit dibaca. Angkat menjadi variabel bernama di atas `return`',
          ],
          [
            'Menumpuk ternary untuk empat keadaan tampilan',
            'Semuanya jadi di satu tempat',
            'Menjadi sangat sulit dibaca. Pakai `return` lebih awal untuk tiap keadaan',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah kesalahan yang paling sering dibuat sekali oleh setiap orang, dan gejalanya khas sehingga mudah dikenali. Kalau sebuah aksi berjalan sendiri saat halaman dimuat, bahkan sebelum ada yang mengklik apa pun, hampir pasti ada tanda kurung yang ikut ditulis pada penangan peristiwa. Ini bentuk yang sama dengan jebakan `addEventListener` di Bab 4, dan penyebabnya pun sama.',
      ),
      callout(
        'tip',
        'Yang dirender React dan yang tidak',
        'Tidak dirender sama sekali, yaitu `false`, `null`, `undefined`, dan `true`. Dirender apa adanya, yaitu angka termasuk `0`, dan teks termasuk teks kosong yang tidak terlihat. Melempar error, yaitu object, `Map`, `Set`, dan janji. Mengingat kelompok pertama dan kedua sudah cukup untuk menghindari sebagian besar kejutan.',
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
    20,
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
      p(
        "Perbandingan ini menjawab pertanyaan yang selama ini digantung, yaitu JSX **bukan sihir** melainkan hanya penulisan singkat untuk pemanggilan fungsi. Bacalah kolom kanan dan cocokkan bagiannya dengan kolom kiri. Nama tag menjadi **argumen pertama**, berupa string `'h1'` karena huruf kecil. Semua atribut menjadi field di objek argumen kedua, dan `className` di sana tertulis persis seperti yang kamu tulis alih-alih `class`. Yang paling menarik, **isi di antara tag menjadi field bernama `children`**, jadi teks dan variabel yang kamu tulis di dalam elemen sebenarnya tidak istimewa melainkan hanya prop yang kebetulan punya penulisan khusus. Catatan di bawah kolom kanan menegaskan bagian yang paling sering disalahpahami, bahwa yang dihasilkan bukan elemen DOM melainkan objek JavaScript biasa.",
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
      p(
        'Inilah wujud sebenarnya sebuah elemen React, yaitu **objek biasa dengan tiga field**. Tidak ada satu pun bagian dari DOM di dalamnya, tidak ada `<h1>` sungguhan, dan tidak ada yang tergambar di layar. Ia hanya **deskripsi** tentang apa yang seharusnya ada. `type` menyimpan jenisnya, `props` menyimpan seluruh atribut beserta `children`, dan `key` berdiri terpisah dari props justru karena ia bukan data untuk komponen melainkan penanda identitas untuk React sendiri, dan itu sebabnya membaca `props.key` di dalam komponen selalu menghasilkan `undefined`. Karena bentuknya sesederhana ini, React bisa membandingkan objek lama dengan objek baru untuk menyimpulkan apa yang berubah, lalu menyentuh DOM sesedikit mungkin. Empat konsekuensi di bawah semuanya mengalir dari kenyataan ini.',
      ),

      h2('Empat hal yang langsung jadi masuk akal'),
      ol(
        '**Kenapa komponen wajib huruf besar.** `<button />` dikompilasi jadi `jsx("button", …)` yang berupa string, sedangkan `<Button />` jadi `jsx(Button, …)` yang berupa referensi variabel.',
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
      p(
        'Kedua blok berisi komponen yang **identik**, dan yang berbeda hanya ada tidaknya baris `import React`. Kalau kamu pernah bingung kenapa sebagian tutorial mengimpor React padahal namanya tidak pernah dipakai di kode, jawabannya ada di transform lama. JSX dulu dikompilasi menjadi `React.createElement(...)`, sehingga variabel `React` **harus** ada di scope meski kamu tidak menyebutnya. Sejak React 17, runtime otomatis menyisipkan impornya sendiri dari `react/jsx-runtime`, jadi barisnya tidak lagi diperlukan. Perlu ditegaskan ini bukan perubahan yang memutus kode lama, sebab berkas yang masih mengimpor `React` tetap bekerja tanpa masalah dan hanya menyisakan satu impor yang tidak berguna.',
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
      p(
        'Saran ini layak benar-benar dicoba, bukan sekadar dibaca. Melihat keluarannya berubah **sambil kamu mengetik** mengubah JSX dari sesuatu yang harus dihafal menjadi sesuatu yang bisa diperiksa. Tambahkan satu atribut, dan lihat ia muncul sebagai field baru di objek props. Ubah huruf pertama nama tag menjadi besar, dan lihat argumen pertamanya berubah dari string menjadi referensi variabel. Beberapa menit di sana biasanya menyelesaikan lebih banyak kebingungan tentang JSX daripada membaca penjelasan berulang kali, dan kebiasaan memeriksa langsung seperti ini berlaku jauh melampaui JSX.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tim kamu menerima laporan bahwa halaman produk terasa lambat dimuat pertama kali. Setelah diperiksa, berkas JavaScript yang dikirim ke pengguna berukuran tiga kali lebih besar daripada perkiraan. Salah satu penyebabnya ternyata konfigurasi penerjemah yang masih memakai mode lama, sehingga tiap berkas JSX ikut membawa impor React walaupun tidak dipakai langsung. Memahami apa yang sebenarnya terjadi saat build menjawab pertanyaan seperti ini.',
      ),
      p('Berikut satu potongan JSX beserta hasil terjemahannya pada dua mode yang berbeda.'),
      compare(
        {
          title: 'Mode lama, disebut classic',
          lang: 'jsx',
          code: `
          // Yang kamu tulis:
          import React from 'react';

          function Kartu({ nama }) {
            return <h3 className="judul">{nama}</h3>;
          }

          // Menjadi:
          function Kartu({ nama }) {
            return React.createElement(
              'h3',
              { className: 'judul' },
              nama,
            );
          }
          `,
          notes: [
            'Impor React WAJIB ada, walaupun namanya tidak dipakai di kodemu',
            'Lupa mengimpornya menghasilkan `React is not defined` saat dijalankan',
          ],
        },
        {
          title: 'Mode baru, disebut automatic',
          lang: 'jsx',
          code: `
          // Yang kamu tulis:
          function Kartu({ nama }) {
            return <h3 className="judul">{nama}</h3>;
          }

          // Menjadi:
          import { jsx as _jsx } from 'react/jsx-runtime';

          function Kartu({ nama }) {
            return _jsx('h3', {
              className: 'judul',
              children: nama,
            });
          }
          `,
          notes: [
            'Impor ditambahkan penerjemah sendiri, hanya di berkas yang memakainya',
            'Ini bawaan sejak React 17, dan yang dipakai project ini',
          ],
        },
      ),
      p(
        'Perbedaan yang paling terlihat adalah `children` berpindah dari argumen ketiga menjadi bagian dari object properti. Perubahan itu bukan kosmetik, sebab ia memungkinkan penerjemah membedakan satu anak dari banyak anak lewat fungsi yang berbeda, yaitu `jsx` dan `jsxs`. Pembedaan itu menghemat pemeriksaan saat berjalan.',
      ),
      p(
        'Yang lebih penting untuk dipahami adalah **kapan** penerjemahan ini terjadi, yaitu saat build, bukan saat halaman berjalan. Peramban tidak pernah melihat satu karakter JSX pun. Karena itu pertanyaan apakah JSX lebih lambat tidak punya arti, sebab yang dijalankan peramban sudah berupa pemanggilan fungsi biasa yang sama persis dengan yang akan kamu tulis sendiri.',
      ),
      code(
        'js',
        `
        // Hasil pemanggilan itu bukan elemen DOM, melainkan object biasa.
        const elemen = <h3 className="judul">Kaos</h3>;

        console.log(elemen);
        // {
        //   type: 'h3',
        //   props: { className: 'judul', children: 'Kaos' },
        //   key: null,
        //   ...
        // }

        // Ia hanya DESKRIPSI. Yang membuat DOM sungguhan adalah react-dom.
        `,
        { caption: 'Inilah yang disebut elemen React, dan ia sekadar object.' },
      ),
      p(
        'Kesadaran bahwa hasilnya hanya object menjelaskan banyak hal sekaligus. Elemen React bisa disimpan di variabel, dikirim sebagai prop, dan ditaruh di array, sebab ia nilai biasa. Ia juga tidak melakukan apa pun sampai diserahkan ke penggambar. Ini yang membuat React bisa membandingkan deskripsi lama dengan deskripsi baru lalu mengubah DOM seperlunya, persis pola yang kamu tulis sendiri di praktik Bab 4.',
      ),
      p(
        'Kembali ke masalah ukuran berkas di awal. Pada mode lama, tiap berkas JSX menyebut `React` sehingga alat pembangun tidak bisa membuang bagian React yang tidak dipakai. Pada mode baru, yang diimpor hanya fungsi `jsx` dari titik masuk terpisah, sehingga pembuangan kode mati bekerja lebih baik. Untuk project dengan ratusan komponen, selisihnya nyata.',
      ),
      callout(
        'info',
        'Alat pembangun mana yang menerjemahkan',
        'Yang mengubah JSX menjadi pemanggilan fungsi bisa Babel, SWC, esbuild, atau TypeScript sendiri lewat opsi `jsx`. Project ini memakai Next.js yang di dalamnya memakai SWC. Yang perlu kamu ketahui bukan namanya melainkan bahwa penerjemahan itu ada, dan konfigurasinya menentukan bentuk keluarannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang berhubungan dengan penerjemahan biasanya terjadi saat build atau saat halaman baru dimuat, dan pesannya sering menunjuk ke tempat yang tidak jelas.',
      ),
      code(
        'text',
        `
        ReferenceError: React is not defined
            at Kartu (Kartu.jsx:4:10)
        `,
        { caption: 'Mode classic dipakai, dan impor React tidak ada di berkas itu.' },
      ),
      p(
        "Pesan ini membingungkan karena kodemu tidak menyebut `React` sama sekali. Yang menyebutnya adalah hasil terjemahan. Ada dua perbaikan, yaitu menambahkan `import React from 'react'` di berkas itu, atau lebih baik mengubah konfigurasi ke mode automatic sehingga impornya tidak pernah dibutuhkan lagi. Kalau kamu bertemu ini di project baru, hampir pasti konfigurasinya yang tertinggal.",
      ),
      code(
        'text',
        `
        error TS2875: This JSX tag requires the module path 'react/jsx-runtime'
        to exist, but none could be found.
        `,
        { caption: 'Diuji dengan `tsc` sungguhan. Mode automatic aktif tanpa React terpasang.' },
      ),
      p(
        'Pesan ini muncul saat opsi `jsx` disetel ke `react-jsx` sedangkan paket React atau tipenya belum terpasang. Perhatikan ia menyebut jalur `react/jsx-runtime` dan bukan `react`, dan itu petunjuk bahwa konfigurasinya sudah memakai mode baru. Perbaikannya memasang `react` beserta `@types/react`, atau menyesuaikan opsi `jsx` kalau project itu memang bukan React.',
      ),
      code(
        'text',
        `
        Failed to parse source for import analysis because the content
        contains invalid JS syntax. If you are using JSX, make sure to
        name the file with the .jsx or .tsx extension.
        `,
        { caption: 'Berkas berisi JSX tapi berekstensi `.js`.' },
      ),
      p(
        'Sebagian alat pembangun hanya menerjemahkan JSX pada berkas berekstensi `.jsx` dan `.tsx`, dan memperlakukan `.js` sebagai JavaScript biasa. Karena JSX bukan sintaks JavaScript yang sah, penguraiannya gagal. Pesannya cukup jelas dan bahkan menyebut perbaikannya. Ganti nama berkasnya, dan jangan melonggarkan konfigurasi supaya `.js` ikut diterjemahkan sebab itu memperlambat build untuk seluruh berkas.',
      ),
      code(
        'text',
        `
        Uncaught SyntaxError: Unexpected token '<'
            at index.js:12
        `,
        { caption: 'JSX sampai ke peramban tanpa pernah diterjemahkan.' },
      ),
      p(
        'Ini terjadi saat berkas berisi JSX dimuat langsung lewat tag skrip tanpa melewati alat pembangun sama sekali. Peramban membaca tanda kurung sudut sebagai operator perbandingan lalu menyerah. Kalau kamu melihat ini, periksa apakah berkasnya memang termasuk dalam proses build, dan bukan berkas yang tidak sengaja disalin ke folder publik.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`React is not defined`',
            'Mode classic aktif tanpa impor React',
            'Pindah ke mode automatic, atau tambahkan impornya',
          ],
          [
            "`requires the module path 'react/jsx-runtime' to exist`",
            'Mode automatic aktif tanpa React terpasang',
            'Pasang `react` dan `@types/react`',
          ],
          [
            '`make sure to name the file with the .jsx or .tsx extension`',
            'Berkas berisi JSX berekstensi `.js`',
            'Ganti nama berkasnya',
          ],
          [
            "`Unexpected token '<'` di peramban",
            'JSX tidak pernah diterjemahkan',
            'Pastikan berkasnya melewati alat pembangun',
          ],
          [
            'Ukuran bundel jauh lebih besar dari perkiraan',
            'Mode classic membuat pembuangan kode mati kurang efektif',
            'Pindah ke mode automatic',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penerjemahan JSX adalah lapisan yang biasanya tidak terlihat, dan kesalahpahaman tentangnya muncul justru saat ada yang tidak beres.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira JSX diproses saat halaman berjalan',
            'Ada langkah tambahan sebelum jadi',
            'Penerjemahan terjadi saat build. Peramban tidak pernah melihat JSX sama sekali',
          ],
          [
            'Mengira elemen JSX adalah elemen DOM',
            'Bentuknya seperti HTML',
            'Ia object biasa yang mendeskripsikan tampilan. Yang membuat DOM adalah penggambar, dan itu langkah terpisah',
          ],
          [
            'Menambahkan impor React di semua berkas untuk berjaga-jaga',
            'Tidak ada ruginya',
            'Pada mode automatic itu tidak dibutuhkan, dan sebagian konfigurasi lint menandainya sebagai impor yang tidak dipakai',
          ],
          [
            'Menamai berkas berisi JSX dengan ekstensi `.js`',
            'Isinya kan JavaScript',
            'Sebagian alat tidak menerjemahkannya. Pakai `.jsx` atau `.tsx`',
          ],
          [
            'Mengira JSX lebih lambat daripada `createElement`',
            'Ada tahap tambahan',
            'Keluarannya persis pemanggilan `createElement` yang sama. Tidak ada biaya tambahan saat berjalan',
          ],
          [
            'Menyalin konfigurasi build dari project lain tanpa memeriksanya',
            'Konfigurasinya kan sudah terbukti',
            'Mode JSX, versi React, dan alat penerjemahnya bisa berbeda. Sebagian besar error di bagian atas berasal dari konfigurasi yang tidak cocok',
          ],
        ],
      ),
      p(
        'Baris kedua adalah pemahaman yang paling berguna untuk bab-bab berikutnya. Karena elemen React hanya object, ia bisa diperlakukan seperti nilai biasa, yaitu disimpan di variabel, dikembalikan dari fungsi, ditaruh di array, dan dikirim sebagai prop. Kemampuan mengirim elemen sebagai prop itulah dasar dari pola komposisi yang dibahas di kategori Frontend Intermediate.',
      ),
      callout(
        'tip',
        'Cara melihat sendiri hasil terjemahannya',
        'Situs resmi Babel menyediakan halaman percobaan tempat kamu bisa menempelkan JSX dan langsung melihat hasilnya. Lima menit mencoba beberapa potongan di sana memberi model mental yang jauh lebih kuat daripada membaca penjelasan mana pun, termasuk penjelasan ini. Coba juga bentuk bersarang dan bentuk dengan `key` untuk melihat perbedaannya.',
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
    22,
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
      p(
        'Kelompok atas menunjukkan **anotasi**, yaitu tanda titik dua diikuti nama tipe. Perhatikan `string[]` berarti "array berisi string", sedangkan `[string, number]` yang disebut tuple berarti array dengan **panjang dan urutan tipe yang pasti**, dengan elemen pertama string dan kedua angka, tidak lebih. Kelompok bawah menunjukkan hal yang jauh lebih sering kamu andalkan dalam praktik, yaitu **inferensi**. TypeScript membaca nilai yang kamu berikan dan menyimpulkan tipenya sendiri, jadi `kota` sudah bertipe `string` tanpa satu anotasi pun, dan menugaskan angka ke sana tetap ditolak. Karena itu saran di kotak berikut layak diikuti sejak awal, sebab menuliskan tipe untuk sesuatu yang nilainya sudah jelas hanya menambah teks tanpa menambah keamanan.',
      ),
      callout(
        'tip',
        'Jangan menganotasi yang sudah jelas',
        '`const nama: string = "Zum"` adalah kebisingan. Biarkan inferensi bekerja; anotasi berguna di **batas** — parameter fungsi, return value publik, dan bentuk data dari luar.',
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
      p(
        "`type Ukuran = 'sm' | 'md' | 'lg'` adalah **union tipe literal**, artinya nilainya bukan sembarang string melainkan tepat salah satu dari tiga teks itu. Efeknya terlihat di dua baris pemanggilan, di mana `'md'` diterima sementara `'besar'` ditolak sebelum program pernah dijalankan. Bandingkan dengan menulis parameternya sebagai `string`, karena salah ketik nama ukuran baru ketahuan saat tampilannya aneh di layar, dan tidak ada yang memberitahumu bahwa pilihannya cuma tiga. Komentar terakhir menyebut manfaat yang mungkin justru paling sering kamu rasakan sehari-hari. Karena editor tahu daftar nilainya, ia bisa menampilkan **ketiga pilihan itu saja** saat kamu mengetik, sehingga dokumentasinya muncul di tempat kamu membutuhkannya tanpa perlu membuka berkas lain.",
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
      p(
        "Yang membuat pola ini bekerja adalah field `status` yang **ada di ketiga varian** dengan nilai literal yang berbeda-beda, dan itulah \"diskriminan\"-nya. Saat kamu memeriksa `k.status` di dalam `switch`, TypeScript **mempersempit** tipe `k` di tiap cabang. Di cabang `'gagal'` ia tahu `k` pasti varian kedua sehingga `k.pesan` boleh diakses, sedangkan di cabang `'berhasil'` ia tahu `k.data` ada. Mencoba membaca `k.data` di cabang `'memuat'` akan ditolak, karena varian itu memang tidak memilikinya. Perhatikan yang dicegah bukan hanya salah akses, sebab bentuk seperti `{ status: 'memuat', data: [...] }` **tidak bisa ditulis sama sekali** karena tidak cocok dengan varian mana pun. Kombinasi keadaan yang mustahil jadi tidak bisa ada, bukan sekadar tidak dianjurkan.",
      ),
      callout(
        'info',
        'Kenapa ini penting untuk UI',
        'Empat keadaan UI dari Bab 5 bisa dimodelkan persis begini. Kombinasi yang mustahil seperti "memuat sekaligus punya data error" menjadi **tidak bisa ditulis**, bukan sekadar tidak dianjurkan.',
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
      p(
        'Perhatikan letak anotasinya, di mana tipe parameter ditulis di dalam kurung dan **tipe return value ditulis setelah kurung tutup**. Menyebut tipe kembalian sebenarnya opsional karena TypeScript bisa menyimpulkannya dari isi fungsi, tapi menuliskannya di fungsi yang dipakai berkas lain punya nilai tersendiri. Ia mengunci kontraknya, sehingga perubahan tak sengaja di dalam badan fungsi ditolak di tempat alih-alih meledak di pemanggil yang jauh. Fungsi ketiga menunjukkan parameter dengan nilai bawaan, dan tipenya tidak perlu ditulis karena sudah tersimpulkan dari `\'Halo\'`. Dan `void` di fungsi terakhir berarti "memang tidak mengembalikan apa-apa", berbeda dari `undefined` yang berarti nilainya ada tapi kosong, sebab `void` menyatakan bahwa return value-nya memang tidak untuk dipakai.',
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
      p(
        'Perhatikan `<T>` di `pertama<T>(a: T[])`: `T` adalah **placeholder tipe** yang diisi otomatis berdasarkan argumen yang benar-benar dioper. Saat dipanggil dengan `[1, 2, 3]`, TypeScript menyimpulkan `T` adalah `number`, sehingga return value-nya diketahui bertipe `number | undefined` — bukan `unknown` yang tidak berguna seperti pada `pertamaBuruk`. Generic pada dasarnya adalah cara menulis "tipe hasilnya sama dengan tipe masukannya", tanpa harus menulis fungsi terpisah untuk setiap kemungkinan tipe array.',
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
      p(
        'Keduanya berarti "belum tahu tipenya", tapi menghasilkan perlakuan yang berlawanan. Dengan `any`, baris `a.apaPunBoleh.tanpaDiperiksa()` **lolos tanpa satu keluhan pun**, sebab TypeScript berhenti memeriksa apa pun yang menyentuh nilai itu, dan kesalahan yang seharusnya tertangkap saat menulis berubah menjadi `TypeError` saat program berjalan di depan pengguna. Dengan `unknown`, mengakses apa pun ditolak sampai kamu **membuktikan** bentuknya lebih dulu. Baris terakhir menunjukkan pembuktian itu, di mana `typeof u === \'string\'` mempersempit tipenya sehingga di dalam blok `if` barulah `u.toUpperCase()` diizinkan. Jadi `unknown` tidak menghalangi pekerjaanmu, melainkan hanya menunda izinnya sampai ada pemeriksaan yang membuat pemakaiannya benar-benar aman.',
      ),
      callout(
        'danger',
        '`any` mematikan alasan memakai TypeScript',
        'Ia tidak "melonggarkan" pemeriksaan — ia menghapusnya, dan penghapusan itu menular ke semua yang menyentuhnya. Untuk nilai yang benar-benar belum diketahui bentuknya, pakai `unknown` lalu persempit. Project ini menyalakan `strict` dan tidak punya satu pun `any`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Fungsi `hitungOngkir` dipakai di empat tempat. Suatu hari ada yang menambahkan parameter baru berupa kode promo di posisi kedua, dan memperbarui tiga dari empat pemanggilnya. Pemanggil keempat tetap mengirim berat di posisi kedua, dan sejak itu setiap pesanan dari satu jalur pembelian mendapat ongkir yang salah. Tidak ada error, tidak ada test yang merah, dan bugnya baru ketahuan dari laporan keuangan tiga minggu kemudian.',
      ),
      p(
        'Inilah kelas bug yang TypeScript hilangkan seluruhnya. Bukan dengan menambah pemeriksaan saat berjalan, melainkan dengan menolak kodenya sebelum sempat dijalankan.',
      ),
      code(
        'ts',
        `
        // Bentuk data dinyatakan sekali, lalu dipakai di mana-mana.
        type Berat = { gram: number };
        type Tujuan = { provinsi: string; kota: string; kodePos: string };

        type HasilOngkir = {
          layanan: 'reguler' | 'kilat';   // hanya dua nilai ini yang sah
          biayaSen: number;
          estimasiHari: number;
        };

        export function hitungOngkir(
          berat: Berat,
          tujuan: Tujuan,
          opsi: { layanan?: 'reguler' | 'kilat'; kodePromo?: string } = {},
        ): HasilOngkir {
          const layanan = opsi.layanan ?? 'reguler';
          // ...
          return { layanan, biayaSen: 1_800_000, estimasiHari: 3 };
        }
        `,
        { filename: 'src/ongkir/hitung.ts' },
      ),
      p(
        'Tiga keputusan di sini yang menutup bug di awal. Pertama, parameter opsional dikumpulkan ke satu object bernama, sehingga menambah opsi baru tidak pernah menggeser posisi apa pun. Kedua, `layanan` bertipe union dua nilai, sehingga salah ketik `regular` dengan huruf a ditolak sebelum dijalankan. Ketiga, nilai kembaliannya dinyatakan, sehingga pemanggil yang membaca `hasil.biaya` alih-alih `hasil.biayaSen` langsung ditolak.',
      ),
      p(
        "Tipe union seperti `'reguler' | 'kilat'` sering diremehkan padahal ia salah satu yang paling berguna sehari-hari. Ia menggantikan konstanta teks yang tersebar, dan editor akan melengkapinya otomatis saat kamu mengetik. Yang lebih penting, menambah layanan ketiga berarti seluruh `switch` yang menanganinya akan ditandai belum lengkap kalau kamu memakai pemeriksaan kelengkapan.",
      ),
      code(
        'ts',
        `
        // Menyempitkan tipe, yaitu meyakinkan TypeScript tentang bentuk sesungguhnya.
        function tampilkan(v: string | number): string {
          if (typeof v === 'number') {
            return v.toFixed(2);        // di sini v pasti number
          }
          return v.toUpperCase();       // di sini v pasti string
        }

        // Untuk nilai yang mungkin tidak ada, penyempitannya lewat pemeriksaan.
        function judulAman(el: HTMLElement | null): string {
          if (el === null) return '';
          return el.textContent ?? '';  // di sini el pasti HTMLElement
        }
        `,
        { caption: 'TypeScript mengikuti alur kodemu, bukan sekadar melihat deklarasinya.' },
      ),
      p(
        'Kemampuan mengikuti alur ini yang membuat TypeScript terasa membantu alih-alih mengganggu. Kamu tidak perlu menuliskan tipe di mana-mana, sebab ia menyimpulkan sendiri dari pemeriksaan yang sudah kamu tulis. Blok `if (el === null) return` bukan tambahan demi TypeScript, melainkan pemeriksaan yang memang seharusnya ada, dan TypeScript sekadar memanfaatkannya.',
      ),
      p(
        'Perlu ditegaskan satu hal yang sering disalahpahami, yaitu **seluruh tipe hilang saat build**. Tidak ada satu pun pemeriksaan tipe yang berjalan di peramban. Data yang datang dari server tetap bisa berbentuk apa saja, dan menyatakan tipenya tidak mengubah itu. Untuk data dari luar, kamu tetap butuh validasi saat berjalan seperti dibahas di Bab 5.',
      ),
      callout(
        'info',
        'TypeScript tidak memperlambat apa pun saat berjalan',
        'Berkas TypeScript diubah menjadi JavaScript biasa dengan seluruh anotasi tipe dihapus, dan itulah yang dijalankan. Yang bertambah hanya waktu build. Karena itu pertanyaan apakah TypeScript membuat aplikasi lebih lambat tidak punya arti, sebab keluarannya identik dengan JavaScript yang akan kamu tulis sendiri.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat pesan berikut diambil dari `tsc` sungguhan, dan keempatnya mewakili kategori kesalahan yang paling sering ditemui.',
      ),
      code(
        'text',
        `
        const el = document.querySelector('#x');
        el.textContent = 'a';

        error TS18047: 'el' is possibly 'null'.
        `,
        { caption: 'Nilai yang mungkin tidak ada dipakai tanpa diperiksa.' },
      ),
      p(
        'Ini pesan yang paling sering ditemui saat pertama kali memakai TypeScript, dan ia mudah dianggap mengganggu. Yang perlu disadari, ia menandai bug yang **nyata**, yaitu persis error `Cannot read properties of null` dari Bab 4 yang ditangkap sebelum sempat dijalankan. Perbaikan yang benar adalah memeriksa nilainya, bukan memakai tanda seru untuk memaksa TypeScript diam.',
      ),
      code(
        'text',
        `
        function f(x) { return x * 2; }

        error TS7006: Parameter 'x' implicitly has an 'any' type.
        `,
        { caption: 'Parameter tanpa tipe pada mode ketat.' },
      ),
      p(
        'Tipe `any` mematikan seluruh pemeriksaan untuk nilai itu, sehingga membiarkannya masuk diam-diam akan melubangi jaminan yang justru kamu bayar. Opsi `noImplicitAny` yang aktif pada mode ketat menolaknya. Perbaikannya menuliskan tipe parameternya. Kalau kamu benar-benar tidak tahu tipenya, `unknown` jauh lebih baik daripada `any`, sebab ia memaksa pemeriksaan sebelum dipakai.',
      ),
      code(
        'text',
        `
        function g(v: string | number) { return v.toUpperCase(); }

        error TS2339: Property 'toUpperCase' does not exist on type 'string | number'.
          Property 'toUpperCase' does not exist on type 'number'.
        `,
        { caption: 'Union dipakai tanpa disempitkan lebih dulu.' },
      ),
      p(
        'Pesannya menyebut dua baris, dan baris kedua yang menjelaskan penyebabnya, yaitu `number` tidak punya method itu. TypeScript hanya mengizinkan hal yang berlaku untuk **seluruh** anggota union. Perbaikannya menyempitkan dulu dengan `typeof`, dan setelah penyempitan itu method yang khusus untuk teks menjadi tersedia.',
      ),
      code(
        'text',
        `
        const arr: readonly number[] = [1];
        arr.push(2);

        error TS2339: Property 'push' does not exist on type 'readonly number[]'.
        `,
        { caption: 'Array yang ditandai tidak boleh diubah menolak method pengubah.' },
      ),
      p(
        'Penanda `readonly` menghapus seluruh method yang mengubah array, yaitu `push`, `pop`, `splice`, `sort`, dan `reverse`. Ini cara menyatakan di tingkat tipe bahwa sebuah nilai tidak boleh diubah, dan ia sangat berguna untuk data yang dibagi beberapa bagian aplikasi. Perbaikannya membuat array baru dengan spread, dan itu memang bentuk yang diinginkan.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`'x' is possibly 'null'`",
            'Nilai yang mungkin tidak ada dipakai tanpa diperiksa',
            'Periksa dengan `if`, atau pakai `?.` bila ketiadaannya memang wajar',
          ],
          [
            "`Parameter 'x' implicitly has an 'any' type`",
            'Tipe parameter tidak dituliskan pada mode ketat',
            'Tuliskan tipenya, dan pakai `unknown` bila benar-benar tidak diketahui',
          ],
          [
            "`Property 'x' does not exist on type 'A | B'`",
            'Union dipakai tanpa disempitkan',
            'Sempitkan dengan `typeof`, `in`, atau pemeriksaan nilai',
          ],
          [
            "`Property 'push' does not exist on type 'readonly ...'`",
            'Array ditandai tidak boleh diubah',
            'Buat array baru dengan spread, jangan mengubah aslinya',
          ],
          [
            "`Object is of type 'unknown'`",
            'Nilai dari `catch` atau `JSON.parse` bertipe tidak diketahui',
            'Periksa bentuknya lebih dulu sebelum memakainya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar keluhan tentang TypeScript berasal dari cara memakainya, bukan dari bahasanya. Baris di bawah adalah kebiasaan yang membuang sebagian besar manfaatnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `any` saat tipenya sulit ditentukan',
            'Errornya langsung hilang',
            '`any` mematikan seluruh pemeriksaan untuk nilai itu dan seluruh yang berasal darinya. Pakai `unknown` yang memaksa pemeriksaan',
          ],
          [
            'Memakai tanda seru untuk menghilangkan peringatan null',
            'Kita kan tahu nilainya pasti ada',
            'Itu janji yang tidak diperiksa siapa pun, dan errornya kembali sebagai kegagalan saat berjalan. Periksa nilainya',
          ],
          [
            'Memakai `as` untuk memaksa tipe yang diinginkan',
            'Lebih cepat daripada memperbaiki bentuknya',
            '`as` memberi tahu TypeScript untuk percaya tanpa memeriksa. Kalau bentuk aslinya berbeda, kegagalannya muncul saat berjalan di tempat yang jauh',
          ],
          [
            'Menuliskan tipe untuk setiap variabel',
            'Semakin eksplisit semakin baik',
            'TypeScript menyimpulkan sendiri dengan baik. Tuliskan tipe di **batas**, yaitu parameter fungsi dan nilai kembalian, dan biarkan sisanya disimpulkan',
          ],
          [
            'Mengira tipe memvalidasi data dari server',
            'Bentuknya kan sudah dinyatakan',
            'Seluruh tipe hilang saat build. Data dari luar tetap harus divalidasi saat berjalan',
          ],
          [
            'Mematikan mode ketat supaya errornya berkurang',
            'Supaya bisa jalan dulu',
            'Sebagian besar nilai TypeScript ada di mode ketat, terutama pemeriksaan null. Tanpanya, ia hanya menambah pekerjaan tanpa memberi jaminan',
          ],
        ],
      ),
      p(
        'Baris terakhir layak ditegaskan karena ia keputusan yang menentukan apakah TypeScript sepadan. Tanpa `strictNullChecks`, nilai `null` dan `undefined` diterima di mana saja, dan itu justru kategori bug terbesar yang ingin ditutup. Project yang menyalakan TypeScript tanpa mode ketat mendapat sebagian besar biayanya dan sebagian kecil manfaatnya, dan itu kombinasi yang paling buruk.',
      ),
      callout(
        'tip',
        'Urutan belajar yang jarang membuat frustrasi',
        'Mulai dari tiga hal saja, yaitu tipe dasar pada parameter dan nilai kembalian fungsi, `type` untuk bentuk object, dan union teks untuk nilai yang pilihannya terbatas. Ketiganya sudah menutup sebagian besar kebutuhan sehari-hari. Generik, tipe kondisional, dan tipe pemetaan bisa menunggu sampai kamu benar-benar bertemu masalah yang membutuhkannya.',
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
    21,
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
      p(
        'Bandingkan keduanya, karena **badan komponennya sama persis** baris demi baris. Yang ditambahkan versi `.tsx` hanya empat baris `type Props` dan satu anotasi `: Props` di parameter, dan dari situ seluruh perbedaan di tabel berikut mengalir. Perhatikan destructuring `{ judul, jumlah }` tidak berubah sama sekali, sebab anotasinya ditempelkan pada **polanya** alih-alih pada tiap variabel. Efeknya bekerja dua arah. Di dalam komponen, TypeScript tahu `jumlah` adalah angka sehingga memanggil `jumlah.toUpperCase()` ditolak. Di luar, pemanggil yang menulis `<Kartu judull="A" />` mendapat error saat mengetik alih-alih komponen yang diam-diam menampilkan `undefined`. Empat baris itu juga menjadi dokumentasi yang tidak bisa basi, sebab siapa pun yang membuka berkas ini langsung tahu prop apa yang diterima tanpa membaca isinya.',
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
      p(
        'Masalahnya murni soal tanda kurung siku yang punya **dua arti** di berkas `.tsx`, yaitu pembuka generic dan pembuka tag JSX. Di berkas `.ts` tidak ada JSX, jadi `<T>` tidak ambigu. Begitu berkasnya `.tsx`, pengurai melihat `<T>` di posisi awal ekspresi dan menyimpulkan kamu sedang membuka elemen bernama `T`, lalu mengeluh karena tidak ada penutupnya. Koma pada `<T,>` menyelesaikannya dengan cara yang sederhana, sebab tag JSX tidak pernah memuat koma sehingga kehadirannya cukup memberi tahu pengurai bahwa ini generic. Cara kedua sering lebih enak dibaca, karena **function declaration tidak pernah ambigu** sebab `<T>` di sana muncul setelah nama fungsi alih-alih di posisi awal ekspresi. Kalau kamu bertemu error JSX yang aneh pada arrow function generic, penyebabnya hampir selalu ini.',
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
      p(
        'Tiga opsi ini sudah cukup untuk memulai, dan masing-masing menentukan hal yang berbeda. `"jsx": "react-jsx"` memilih **automatic runtime** dari sub-bab kompilasi — inilah baris yang membuat `import React` tidak lagi diperlukan di tiap berkas. `"strict": true` sebenarnya bukan satu opsi melainkan sakelar untuk sekelompok pemeriksaan sekaligus, dan yang paling terasa di antaranya adalah `strictNullChecks`, yang memaksa kamu menangani kemungkinan `null` alih-alih menemukannya sebagai `TypeError` di produksi. `"noUncheckedIndexedAccess"` menambahkan satu lapis lagi: membaca `arr[0]` menghasilkan tipe `T | undefined`, karena array kosong memang tidak punya elemen pertama. Opsi terakhir ini kadang terasa cerewet, tapi ia menutup sekelas bug yang selama ini hanya muncul pada data yang kebetulan kosong.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Project yang kamu warisi berisi dua ratus berkas `.jsx` tanpa satu pun tipe. Tim memutuskan pindah ke TypeScript, dan usulan pertama yang muncul adalah menulis ulang semuanya dalam satu sprint. Setelah dua minggu, separuh berkas sudah diubah, aplikasinya tidak bisa dijalankan sama sekali karena impor antar-berkas saling tidak cocok, dan tidak ada satu pun fitur baru yang dikerjakan.',
      ),
      p(
        'Perpindahan yang berhasil hampir selalu bertahap, dan yang memungkinkan itu adalah TypeScript sengaja dirancang bisa hidup berdampingan dengan JavaScript di project yang sama.',
      ),
      code(
        'json',
        `
        {
          "compilerOptions": {
            "strict": true,
            "allowJs": true,          // berkas .js tetap ikut dibaca
            "checkJs": false,         // tapi belum diperiksa tipenya
            "jsx": "react-jsx",       // mode automatic, lihat Sub-bab 6.4
            "noEmit": true,           // alat pembangun yang menghasilkan berkasnya
            "moduleResolution": "bundler"
          },
          "include": ["src"]
        }
        `,
        { filename: 'tsconfig.json — susunan untuk perpindahan bertahap' },
      ),
      p(
        'Kombinasi `allowJs` benar dan `checkJs` salah adalah kuncinya. Berkas `.js` dan `.jsx` yang lama tetap bisa diimpor dari berkas `.ts` dan `.tsx` yang baru, dan keduanya hidup berdampingan tanpa satu pun error dari berkas lama. Kamu bisa mengubah satu berkas per hari, dan aplikasinya tetap berjalan sepanjang prosesnya.',
      ),
      code(
        'text',
        `
        Urutan perpindahan yang jarang menyakitkan:

        1. Berkas yang TIDAK punya ketergantungan, yaitu fungsi bantu murni.
           Contoh: format rupiah, hitung ongkir, validasi email.

        2. Berkas tipe bersama, yaitu bentuk data yang dipakai banyak tempat.
           Contoh: type Produk, type Pesanan, type Pengguna.

        3. Komponen daun, yaitu yang tidak merender komponen lain.
           Contoh: Badge, Lencana, Tombol.

        4. Komponen menengah, lalu naik terus sampai halaman.

        5. Terakhir: nyalakan checkJs, atau ubah sisa .js yang tinggal sedikit.
        `,
        { caption: 'Dari dalam ke luar, sebab tipe mengalir dari yang dipakai ke pemakainya.' },
      ),
      p(
        'Urutan dari dalam ke luar itu bukan selera. Kalau kamu mulai dari halaman, seluruh komponen yang ia pakai masih tanpa tipe, sehingga propsnya bertipe `any` dan kamu tidak mendapat jaminan apa pun. Kalau kamu mulai dari daun, tiap berkas yang diubah langsung memberi manfaat kepada seluruh pemakainya, dan pemakainya menjadi lebih mudah diubah berikutnya.',
      ),
      code(
        'ts',
        `
        // Dua ekstensi, dua aturan yang berbeda.

        // Berkas .ts: tanda kurung sudut berarti penegasan tipe.
        const el = document.querySelector('#x') as HTMLInputElement;
        const lama = <HTMLInputElement>document.querySelector('#x');   // bentuk lama, sah di .ts

        // Berkas .tsx: bentuk lama itu TIDAK BISA dipakai,
        // sebab tanda kurung sudut sudah berarti JSX.
        // Hanya 'as' yang tersedia.
        `,
        { caption: 'Inilah satu-satunya perbedaan sintaks yang benar-benar berarti.' },
      ),
      p(
        'Aturan memilih ekstensinya sederhana, yaitu pakai `.tsx` kalau berkasnya berisi JSX, dan `.ts` kalau tidak. Menamai berkas tanpa JSX sebagai `.tsx` tidak merusak apa pun, dan hanya membuat bentuk penegasan bergaya kurung sudut tidak tersedia. Karena bentuk itu memang sudah jarang dipakai, sebagian tim memakai `.tsx` untuk semuanya demi keseragaman.',
      ),
      callout(
        'warning',
        'Jangan menyalakan `checkJs` di tengah perpindahan',
        'Opsi itu membuat seluruh berkas `.js` lama ikut diperiksa, dan pada project dua ratus berkas hasilnya bisa ribuan error sekaligus. Itu membuat keluaran `tsc` tidak berguna sebab error yang benar-benar baru tenggelam di antaranya. Nyalakan di akhir, atau nyalakan per berkas dengan komentar `// @ts-check` di berkas yang sudah siap.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Perpindahan bertahap menghasilkan kelas kesalahan yang khas, yaitu batas antara bagian bertipe dan bagian tanpa tipe.',
      ),
      code(
        'text',
        `
        import { formatRupiah } from './format';

        error TS7016: Could not find a declaration file for module './format'.
        '/src/format.js' implicitly has an 'any' type.
        `,
        { caption: 'Berkas `.js` diimpor dari berkas bertipe, dan `allowJs` belum aktif.' },
      ),
      p(
        'Pesannya menyebut `implicitly has an any type`, dan itu justru menjelaskan apa yang hilang. Tanpa `allowJs`, TypeScript tidak tahu apa pun tentang berkas itu. Perbaikannya menyalakan `allowJs`, dan setelah itu TypeScript akan menyimpulkan tipe dari isi berkas `.js`-nya, yang biasanya sudah cukup baik untuk perpindahan bertahap.',
      ),
      code(
        'text',
        `
        // Di dalam berkas .tsx:
        const el = <HTMLInputElement>document.querySelector('#x');

        error: Unterminated JSX contents.
        `,
        { caption: 'Penegasan bergaya kurung sudut dipakai di berkas `.tsx`.' },
      ),
      p(
        'Di berkas `.tsx`, tanda kurung sudut selalu diartikan sebagai awal JSX, sehingga penerjemah mencari tag penutup yang tidak pernah ada. Pesannya menyebut JSX walaupun kamu tidak bermaksud menulis JSX sama sekali, dan itu yang membingungkan. Ganti menjadi bentuk `as`, dan itu satu-satunya jalan di berkas `.tsx`.',
      ),
      code(
        'text',
        `
        import Kartu from './Kartu';
        <Kartu judul={5} />

        # Tidak ada error, sebab Kartu.jsx belum bertipe.
        `,
        { caption: 'Komponen dari berkas tanpa tipe menerima prop apa saja.' },
      ),
      p(
        'Ini yang perlu dipahami sebagai batas manfaat perpindahan bertahap. Selama komponennya masih `.jsx`, propsnya bertipe `any` dan tidak ada satu pun pemeriksaan. Kamu tidak salah, dan kamu juga belum mendapat manfaat apa pun untuk bagian itu. Ini alasan urutan dari dalam ke luar penting, sebab ia memaksimalkan bagian yang sudah terlindungi lebih awal.',
      ),
      code(
        'text',
        `
        error TS2307: Cannot find module 'react' or its corresponding
        type declarations.
        `,
        { caption: 'Paket tipe untuk React belum terpasang.' },
      ),
      p(
        'Sebagian pustaka menyertakan tipenya sendiri di dalam paketnya, dan sebagian lagi menyediakannya sebagai paket terpisah berawalan `@types`. React termasuk yang kedua, sehingga kamu perlu memasang `@types/react` dan `@types/react-dom` di samping paket utamanya. Kalau pesan ini muncul untuk pustaka lain, periksa apakah ada paket `@types` yang sepadan.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Could not find a declaration file for module`',
            'Berkas `.js` diimpor tanpa `allowJs`',
            'Nyalakan `allowJs` di `tsconfig.json`',
          ],
          [
            '`Unterminated JSX contents` pada penegasan tipe',
            'Bentuk kurung sudut dipakai di berkas `.tsx`',
            'Ganti menjadi bentuk `as`',
          ],
          [
            'Komponen menerima prop yang salah tanpa error',
            'Berkas komponennya masih tanpa tipe',
            'Ubah berkasnya, dan utamakan komponen daun lebih dulu',
          ],
          [
            '`Cannot find module ... or its corresponding type declarations`',
            'Paket `@types` belum terpasang',
            'Pasang paket `@types` yang sepadan',
          ],
          [
            'Ribuan error muncul sekaligus',
            '`checkJs` dinyalakan di tengah perpindahan',
            'Matikan, dan nyalakan per berkas dengan `// @ts-check`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perpindahan ke TypeScript sering gagal bukan karena teknisnya sulit melainkan karena caranya terlalu ambisius.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengubah seluruh berkas dalam satu perubahan besar',
            'Sekalian selesai',
            'Aplikasinya rusak di tengah jalan, tinjauan kodenya mustahil, dan tidak ada fitur yang jalan selama itu. Ubah bertahap',
          ],
          [
            'Mulai dari halaman atau komponen paling atas',
            'Itu yang paling terlihat',
            'Seluruh yang ia pakai masih tanpa tipe, jadi manfaatnya kecil. Mulai dari fungsi bantu dan komponen daun',
          ],
          [
            'Menyebar `any` supaya berkasnya cepat lolos',
            'Yang penting sudah `.ts`',
            'Berkas itu terlihat sudah diubah padahal tidak memberi jaminan apa pun, dan tidak ada yang akan kembali memperbaikinya',
          ],
          [
            'Menyalakan seluruh opsi ketat sekaligus di project lama',
            'Sekalian benar dari awal',
            'Ribuan error sekaligus membuat keluarannya tidak berguna. Nyalakan bertahap, dan `strictNullChecks` dulu karena dampaknya paling besar',
          ],
          [
            'Menamai berkas tanpa JSX sebagai `.tsx`',
            'Supaya seragam',
            'Sah dan tidak merusak apa pun, hanya bentuk penegasan kurung sudut tidak tersedia. Ini keputusan gaya, bukan kebenaran',
          ],
          [
            'Menulis tipe untuk data dari server dari ingatan',
            'Bentuknya kan sudah diketahui',
            'Tipe yang tidak cocok dengan kenyataan justru berbahaya, sebab kamu percaya pada jaminan yang salah. Bangkitkan dari skema API, atau validasi saat berjalan',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah bahaya yang paling halus dari TypeScript. Menyatakan `type Produk = { harga: number }` untuk data yang sebenarnya mengirim harga sebagai teks membuat seluruh kode setelahnya yakin ia angka, padahal bukan. Hasilnya lebih buruk daripada tanpa tipe sama sekali, sebab pemeriksaan yang seharusnya kamu tulis justru dihilangkan atas dasar jaminan palsu. Untuk data dari luar, validasi saat berjalan tetap wajib.',
      ),
      callout(
        'tip',
        'Ukuran keberhasilan perpindahan bukan jumlah berkas',
        'Yang layak diukur adalah berapa persen berkas yang bebas dari `any`, dan apakah `strict` sudah aktif. Project dengan dua ratus berkas `.ts` yang penuh `any` mendapat manfaat lebih sedikit daripada project dengan lima puluh berkas bertipe rapi. Ubah lebih sedikit, dan ubah dengan benar.',
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
    23,
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
            'Tipe kembalian yang berarti **"return value-nya tidak dipakai"**. Dipakai untuk hampir semua callback prop. Perlu diketahui, ia sedikit longgar: fungsi yang sebenarnya mengembalikan sesuatu tetap boleh dipasang — nilainya saja yang diabaikan.',
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
      p(
        'Empat baris `Props` itu sekaligus menjadi **dokumentasi komponen ini**. Tanda tanya pada `jumlah?` menandainya opsional, sehingga `<Kartu judul="A" onKlik={...} />` sah tanpa menyebut jumlah, sedangkan `judul` dan `onKlik` yang tanpa tanda tanya wajib diisi dan melewatkannya menjadi error saat menulis. Dua baris terakhir menunjukkan cara menipekan **fungsi**. `() => void` berarti "fungsi tanpa parameter yang nilainya tidak dipakai", sedangkan `(id: string) => void` mengharuskan pemanggil menyediakan fungsi yang menerima satu string, sehingga mengirim handler dengan bentuk parameter yang salah langsung ditolak. Perhatikan `jumlah = 0` di destructuring adalah nilai bawaan JavaScript biasa dan bukan bagian dari tipe, sebab keduanya bekerja berpasangan, dengan tipe yang menyatakan boleh kosong dan nilai bawaan yang menentukan apa yang dipakai saat memang kosong.',
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
      p(
        'Yang baru di sini adalah `children` sebagai **prop biasa yang perlu ditipekan**, dan itu masuk akal setelah sub-bab kompilasi menunjukkan bahwa isi di antara tag memang berakhir sebagai field bernama `children`. Tipenya `ReactNode` yang sengaja luas, karena isi sebuah komponen bisa apa saja, mulai dari elemen JSX, string, angka, array dari semuanya, bahkan `null` saat pemanggil memilih tidak mengisi apa-apa. Di dalam badan komponen, `{children}` cukup ditaruh di posisi yang kamu inginkan, sebab komponen ini tidak perlu tahu apa isinya. Perhatikan `children` harus ditulis di `Props` seperti prop lain, karena ia **tidak lagi ditambahkan otomatis** sejak tipe React 18, dan itulah alasan utama `React.FC` di kotak peringatan bawah kehilangan daya tariknya.',
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
        "Ini versi bertipe dari pola rest+spread yang sudah kamu tulis di Bab 1. Tanda `&` pada `ComponentProps<'button'> & { varian?: ... }` adalah **intersection**, sehingga hasilnya tipe yang memuat seluruh atribut `<button>` **ditambah** prop milikmu sendiri. Di parameter, `varian` dan `className` diambil untuk diolah, sedangkan `...sisa` menampung semua atribut tombol lainnya lalu ditumpahkan kembali ke elemennya, sehingga `type`, `disabled`, `onClick`, dan `aria-label` semuanya bekerja tanpa kamu daftarkan satu per satu **dan semuanya bertipe benar**. `className` sengaja tidak ikut ke `...sisa` karena ia perlu digabung dengan kelas varian, sedangkan `?? ''` menjaga agar tidak muncul teks `undefined` saat pemanggil tidak mengirimnya.",
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
      p(
        "`Buruk` di atas tidak ditolak TypeScript, sebab kombinasi `href` dan `onClick` sekaligus tetap lolos kompilasi karena keduanya sama-sama opsional dan boleh diisi bersamaan. Discriminated union memperbaikinya dengan menambahkan field pembeda `sebagai`. Begitu `sebagai: 'tautan'` dipilih, TypeScript tahu satu-satunya bentuk `Props` yang cocok adalah yang punya `href`, sehingga menulis `onClick` di kombinasi itu langsung ditolak sebelum kode sempat dijalankan, pola yang sama persis dengan discriminated union `Keadaan` di sub-bab TypeScript sekilas.",
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
      p(
        'Dua bentuk pertama sama-sama membuat TypeScript berhenti membantu, meski dengan cara berbeda. `object` memang menolak angka dan string, tapi ia tidak tahu **field apa pun** di dalamnya, sehingga `data.nama` ditolak justru karena TypeScript tidak yakin field itu ada. `any` lebih buruk lagi, sebab ia mengizinkan segalanya termasuk `data.namaYangSalahKetik`, dan kesalahan yang seharusnya tertangkap saat menulis berpindah ke runtime. Dua bentuk terakhir menuliskan bentuknya dengan jujur. Bedanya, `P3` menulis bentuknya di tempat sedangkan `P4` mengimpor tipe bersama, dan itu yang sebaiknya kamu pilih begitu bentuk data yang sama muncul di lebih dari satu komponen, karena satu definisi berarti satu tempat untuk diperbarui. Perhatikan `import type` di sana, sebab kata `type` membuat impornya **dihapus seluruhnya** saat build sehingga tidak menambah apa pun ke bundle.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Kartu` dipakai di lima halaman. Suatu hari ada yang menambahkan prop wajib bernama `onKlik`, dan empat halaman diperbarui. Halaman kelima tidak, dan sejak itu mengklik kartu di halaman itu melempar `onKlik is not a function`. Bug yang sama tidak mungkin terjadi kalau propsnya bertipe, sebab halaman kelima akan menolak dikompilasi.',
      ),
      p(
        'Berikut bentuk pengetikan props yang menutup seluruh kelas kesalahan itu, beserta cara menyatakan `children` dengan benar.',
      ),
      code(
        'tsx',
        `
        import type { ReactNode } from 'react';

        type Status = 'draf' | 'terbit' | 'arsip';

        type KartuProps = {
          judul: string;                       // wajib
          status: Status;                      // hanya tiga nilai ini
          ringkasan?: string;                  // opsional
          jumlahDilihat?: number;
          onKlik: (id: string) => void;        // tanda tangan ditegaskan
          children?: ReactNode;                // apa pun yang bisa dirender
        };

        export function Kartu({
          judul,
          status,
          ringkasan,
          jumlahDilihat = 0,                   // bawaan, bukan tipe
          onKlik,
          children,
        }: KartuProps) {
          return (
            <article className="kartu" data-status={status}>
              <h3>{judul}</h3>
              {ringkasan ? <p>{ringkasan}</p> : null}
              <small>{jumlahDilihat} kali dilihat</small>
              {children}
              <button type="button" onClick={() => onKlik(judul)}>Buka</button>
            </article>
          );
        }
        `,
        { filename: 'src/komponen/Kartu.tsx' },
      ),
      p(
        'Tanda tanya pada `ringkasan?` berarti prop itu boleh tidak diberikan, dan tipenya menjadi `string | undefined`. Perhatikan tanda tanya menyatakan **boleh tidak ada**, bukan menyediakan nilai bawaan. Nilai bawaan diberikan saat pembongkaran seperti pada `jumlahDilihat = 0`, dan keduanya memang dipakai bersama.',
      ),
      p(
        'Tipe `ReactNode` adalah yang benar untuk `children`, dan ia mencakup seluruh yang bisa dirender, yaitu elemen JSX, teks, angka, array, `null`, dan `undefined`. Kesalahan yang sering adalah memakai `JSX.Element` yang hanya mencakup satu elemen JSX, sehingga memberikan teks biasa sebagai anak akan ditolak padahal itu sah.',
      ),
      code(
        'tsx',
        `
        // Ketika props hanya menambah sedikit pada elemen HTML,
        // warisi tipenya alih-alih menulis ulang satu per satu.
        import type { ComponentPropsWithoutRef } from 'react';

        type TombolProps = ComponentPropsWithoutRef<'button'> & {
          varian?: 'utama' | 'sekunder' | 'bahaya';
          memuat?: boolean;
        };

        export function Tombol({ varian = 'utama', memuat = false, ...sisa }: TombolProps) {
          return (
            <button
              {...sisa}                          // type, onClick, aria-*, semuanya lolos
              className={\`tombol tombol-\${varian} \${sisa.className ?? ''}\`}
              disabled={memuat || sisa.disabled}
              aria-busy={memuat}
            >
              {memuat ? 'Memuat…' : sisa.children}
            </button>
          );
        }
        `,
        { filename: 'src/komponen/Tombol.tsx' },
      ),
      p(
        "Pola ini menyelesaikan masalah yang sangat nyata, yaitu komponen pembungkus yang selalu kekurangan satu prop. Tanpa mewarisi tipe elemennya, tiap kali seseorang butuh `aria-label`, `title`, atau `form` pada tombol, ia harus menambahkannya satu per satu ke tipe props. Dengan `ComponentPropsWithoutRef<'button'>`, seluruh atribut tombol yang sah otomatis diterima dan tetap diperiksa tipenya.",
      ),
      p(
        'Perhatikan `disabled={memuat || sisa.disabled}` menggabungkan dua sumber, sehingga tombol tetap mati kalau pemanggilnya menyetel `disabled` sendiri. Tanpa penggabungan itu, spread `{...sisa}` yang berada di atas akan ditimpa oleh `disabled` di bawahnya, dan prop dari pemanggil diabaikan diam-diam. Urutan spread dan prop yang ditulis sendiri menentukan siapa yang menang, dan itu sering menjadi sumber bug.',
      ),
      callout(
        'tip',
        'Pakai `type` untuk props, dan simpan `interface` untuk kasus khusus',
        'Keduanya hampir selalu bisa dipakai bergantian untuk props. `type` bisa menyatakan union dan gabungan dengan `&`, sedangkan `interface` bisa ditambahi dari berkas lain. Kemampuan ditambahi itu justru sering tidak diinginkan untuk props komponen, sebab ia berarti tipe komponenmu bisa diubah dari luar. Sebagian besar tim memakai `type` sebagai bawaan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat pesan berikut diambil dari `tsc` sungguhan dengan tipe React asli, dan keempatnya menandai bug yang nyata.',
      ),
      code(
        'text',
        `
        <Kartu judul="x" onKlik={() => {}} />

        error TS2741: Property 'jumlah' is missing in type
        '{ judul: string; onKlik: () => void; }' but required in type 'Props'.
        `,
        { caption: 'Prop wajib tidak diberikan.' },
      ),
      p(
        'Inilah bug dari cerita di awal, ditangkap sebelum sempat dijalankan. Pesannya menyebut prop mana yang hilang dan tipe mana yang membutuhkannya, sehingga perbaikannya langsung jelas. Perhatikan pesannya juga menampilkan seluruh prop yang **sudah** diberikan, dan itu berguna saat namanya mirip.',
      ),
      code(
        'text',
        `
        <Kartu judul={5} jumlah={1} onKlik={() => {}} />

        error TS2322: Type 'number' is not assignable to type 'string'.
        `,
        { caption: 'Tipe prop tidak cocok.' },
      ),
      p(
        'Kesalahan ini sering terjadi saat nilainya berasal dari data, misalnya `judul={produk.id}` padahal `id` bertipe angka. Tanpa TypeScript, angka itu akan dirender apa adanya dan tidak ada yang menyadari kesalahannya sampai ada yang membaca layar. Untuk union teks seperti `status`, pesan yang sama muncul saat nilainya salah ketik, dan itu salah satu manfaat union yang paling sering terasa.',
      ),
      code(
        'text',
        `
        <Kartu judul="x" jumlah={1} onKlik={() => {}} warna="merah" />

        error TS2322: Type '{ judul: string; jumlah: number; onKlik: () => void;
        warna: string; }' is not assignable to type 'Props'.
          Property 'warna' does not exist on type 'Props'.
        `,
        { caption: 'Prop yang tidak dikenal ditolak.' },
      ),
      p(
        'Penolakan prop asing ini sangat berguna sebab ia menangkap salah ketik nama prop. Tanpa itu, `onKlick` dengan huruf k ganda akan diterima diam-diam sebagai prop yang tidak dipakai, dan komponennya tidak akan pernah bereaksi. Yang perlu diketahui, penolakan ini hanya berlaku untuk object literal yang ditulis langsung, sehingga menyebarkan object variabel dengan spread tidak terkena pemeriksaan yang sama.',
      ),
      code(
        'text',
        `
        <Kartu judul="x" jumlah={1} onKlik={(id: number) => {}} />

        error TS2322: Type '(id: number) => void' is not assignable to type
        '(id: string) => void'.
          Types of parameters 'id' and 'id' are incompatible.
            Type 'string' is not assignable to type 'number'.
        `,
        { caption: 'Tanda tangan fungsi penangan tidak cocok.' },
      ),
      p(
        'Pesan bertingkat tiga baris ini sekilas menakutkan, dan sebenarnya sangat runtut. Baris pertama menyebut kedua tipe fungsinya, baris kedua menunjuk parameter mana yang bermasalah, dan baris ketiga menyebut ketidakcocokannya. Kebiasaan membaca pesan TypeScript dari baris **paling dalam** ke luar membuat sebagian besar pesan panjang menjadi mudah dipahami.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Property 'x' is missing ... but required in type`",
            'Prop wajib tidak diberikan',
            'Berikan propnya, atau jadikan opsional dengan tanda tanya',
          ],
          [
            "`Type 'number' is not assignable to type 'string'`",
            'Tipe nilai prop tidak cocok',
            'Ubah nilainya, atau perbaiki tipe propsnya kalau memang salah',
          ],
          [
            "`Property 'warna' does not exist on type`",
            'Prop asing, sering karena salah ketik',
            'Periksa ejaannya, atau tambahkan ke tipe props kalau memang perlu',
          ],
          [
            '`Types of parameters ... are incompatible`',
            'Tanda tangan fungsi penangan berbeda',
            'Samakan parameternya dengan yang dinyatakan tipe props',
          ],
          [
            "`Type 'string' is not assignable to type 'JSX.Element'`",
            '`children` diketik `JSX.Element`, padahal teks juga sah',
            'Pakai `ReactNode`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Mengetik props adalah tempat TypeScript paling terasa manfaatnya di kode React, dan juga tempat sebagian orang membuatnya lebih rumit daripada perlu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `JSX.Element` untuk `children`',
            'Anaknya kan elemen JSX',
            'Teks, angka, array, dan `null` juga sah sebagai anak dan akan ditolak. Pakai `ReactNode`',
          ],
          [
            'Memakai `any` untuk prop yang bentuknya rumit',
            'Menuliskannya makan waktu',
            'Seluruh pemeriksaan untuk prop itu mati, termasuk salah ketik nama fieldnya. Tulis bentuknya, atau pakai `unknown` sementara',
          ],
          [
            'Menulis ulang seluruh atribut HTML di tipe props pembungkus',
            'Supaya jelas apa yang diterima',
            'Selalu ada yang kurang, dan tiap kebutuhan baru berarti menyunting tipenya. Warisi dengan `ComponentPropsWithoutRef`',
          ],
          [
            'Memakai `React.FC` untuk mengetik komponen',
            'Banyak contoh lama memakainya',
            'Ia menambahkan `children` secara diam-diam pada versi lama dan mempersulit generik. Ketik parameternya langsung',
          ],
          [
            'Menjadikan seluruh prop opsional supaya pemanggilnya bebas',
            'Lebih fleksibel',
            'Kamu kehilangan jaminan bahwa prop yang memang wajib pasti diberikan, dan tiap pemakaian harus memeriksa keberadaannya',
          ],
          [
            'Memakai `string` untuk nilai yang pilihannya terbatas',
            '`string` menerima semuanya',
            'Salah ketik lolos tanpa peringatan. Pakai union teks supaya editornya melengkapi dan salah ketik ditolak',
          ],
        ],
      ),
      p(
        "Baris terakhir memberi manfaat yang langsung terasa saat mengetik kode. Dengan `status: 'draf' | 'terbit' | 'arsip'`, editor akan menawarkan ketiga pilihannya begitu kamu mengetik `status=`, dan salah ketik ditolak sebelum berkasnya disimpan. Dengan `status: string`, tidak ada bantuan apa pun dan `'terbitt'` diterima tanpa suara. Selisih usahanya nol, dan selisih manfaatnya besar.",
      ),
      callout(
        'info',
        'Prop asing hanya ditolak pada object literal',
        'Pemeriksaan yang menolak prop tidak dikenal disebut excess property checking, dan ia hanya berlaku saat object ditulis langsung di tempatnya. Menyebarkan object dari variabel dengan spread melewatinya, sehingga `<Kartu {...data} />` bisa membawa field asing tanpa ditolak. Ini bukan lubang melainkan keputusan desain, dan ia perlu diketahui supaya kamu tidak mengandalkan pemeriksaan itu untuk data yang disebar.',
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
    23,
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
      p(
        'Ketiga baris ini tidak punya satu pun anotasi, dan itu memang yang dianjurkan. TypeScript tahu bahwa `onChange` pada `<input>` menerima fungsi dengan parameter bertipe tertentu, jadi tipe `e` **mengalir masuk** dari posisi tempat fungsinya ditulis lewat mekanisme yang disebut *contextual typing*. Hasilnya bukan sekadar hemat mengetik, sebab karena tipenya diketahui, `e.target.value` langsung dikenali sebagai string sedangkan `e.target.valuee` yang salah ketik ditolak. Perhatikan juga `e.currentTarget` pada baris ketiga, yang bertipe `HTMLButtonElement` yang tepat alih-alih `HTMLElement` yang terlalu umum. Anotasi baru diperlukan ketika handler dipindah ke luar JSX seperti di bagian berikutnya, karena di sana tidak ada lagi konteks yang bisa dibaca TypeScript.',
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
      p(
        'Pola tipenya seragam, yaitu **nama event diikuti tipe elemennya di dalam kurung siku**, seperti `ChangeEvent<HTMLInputElement>` dan `FormEvent<HTMLFormElement>`. Bagian dalam kurung siku itu yang menentukan property apa yang tersedia, sehingga menyebut `HTMLElement` yang terlalu umum membuat `e.target.value` ditolak karena tidak semua elemen punya `value`. Perhatikan `import type` di baris pertama, sebab semua ini murni tipe sehingga impornya hilang saat build. Dua contoh terakhir memakai `e.currentTarget` alih-alih `e.target`, dan itu disengaja. Seperti dibahas di bab DOM, `currentTarget` selalu elemen tempat handler terpasang sehingga tipenya pasti, sedangkan `target` bisa berupa elemen anak mana pun. Untuk `onUbah`, `e.target` aman dipakai karena `<input>` memang tidak punya anak.',
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
      p(
        'Tiga bagian di sini bekerja sebagai satu rangkaian. `useRef<HTMLInputElement>(null)` membuat wadah kosong dengan tipe elemen yang **disebutkan eksplisit**, sebab tanpa itu TypeScript tidak tahu isinya nanti apa. Atribut `ref={inputRef}` pada JSX yang menyuruh React mengisi wadah itu dengan elemen DOM sungguhan setelah render. Dan `useEffect` dengan array dependensi kosong menjalankan `focus()` **satu kali setelah render pertama**, yaitu waktu yang tepat karena sebelum render selesai elemennya belum ada. Baris `inputRef.current?.focus()` memakai optional chaining bukan sebagai formalitas, sebab seperti dijelaskan di kotak berikut `current` benar-benar `null` sebelum React mengisinya, dan TypeScript memaksamu mengakui kemungkinan itu.',
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
        hitungRef.current += 1;               // tidak menyebabkan re-render
        `,
      ),
      p(
        'Ini pemakaian `useRef` yang kedua dan sering tidak disangka, yaitu **wadah untuk nilai yang bertahan antar-render tapi tidak memicu re-render**. Bedanya dengan state penting, sebab mengubah state menggambar ulang komponen sedangkan mengubah `ref.current` tidak. Karena itu ref cocok untuk hal-hal yang tidak perlu terlihat di layar, seperti id timer atau penghitung untuk keperluan internal. Tipe `ReturnType<typeof setTimeout>` dipakai alih-alih `number` karena `setTimeout` mengembalikan jenis nilai yang berbeda di browser dan di Node, dan menuliskannya begitu membuat kodenya benar di keduanya tanpa menebak. Untuk `hitungRef`, tipenya tidak perlu disebut sama sekali, sebab nilai awal `0` sudah cukup untuk disimpulkan sebagai `number`.',
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
      p(
        'Sebelum React 19, `ref` tidak bisa diterima seperti prop biasa, karena komponen fungsi harus dibungkus `forwardRef` khusus supaya bisa meneruskan ref ke elemen di dalamnya, dan itulah kenapa banyak kode lama terlihat seperti versi pertama di atas. React 19 menyederhanakannya, sebab `ref` sekarang cukup didestrukturisasi dari `props` seperti prop lain mana pun, dan komponennya ditulis sebagai fungsi biasa tanpa pembungkus tambahan. Itu mengurangi satu lapisan yang sebelumnya wajib dipahami hanya untuk meneruskan sebuah ref.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Formulir pencarian punya kotak teks, pilihan kategori, dan tombol kirim. Kamu ingin memfokuskan kotak teks saat halaman dibuka, membaca nilainya saat dikirim, dan mengosongkannya setelah berhasil. Ditulis tanpa tipe, tiga baris pertama sudah menghasilkan tiga kesalahan yang berbeda, yaitu `ref` yang mungkin `null`, `event.target` yang tidak punya `value`, dan tipe `ref` yang tidak cocok dengan elemennya.',
      ),
      p(
        'Ketiganya adalah kesalahan yang memang nyata, dan bentuk di bawah menutup ketiganya sekaligus.',
      ),
      code(
        'tsx',
        `
        import { useRef, useEffect } from 'react';
        import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

        export function FormCari({ onCari }: { onCari: (kata: string, kategori: string) => void }) {
          // Tipe elemennya disebut, dan nilai awal null diakui.
          const kotakRef = useRef<HTMLInputElement>(null);

          useEffect(() => {
            kotakRef.current?.focus();      // current bisa null, jadi pakai ?.
          }, []);

          function tangani(peristiwa: FormEvent<HTMLFormElement>) {
            peristiwa.preventDefault();

            // currentTarget bertipe HTMLFormElement, jadi elements dikenali.
            const data = new FormData(peristiwa.currentTarget);
            const kata = String(data.get('q') ?? '').trim();
            const kategori = String(data.get('kategori') ?? '');

            if (kata === '') {
              kotakRef.current?.focus();
              return;
            }

            onCari(kata, kategori);
            peristiwa.currentTarget.reset();
          }

          function tanganiEscape(peristiwa: KeyboardEvent<HTMLInputElement>) {
            if (peristiwa.key === 'Escape') peristiwa.currentTarget.value = '';
          }

          return (
            <form onSubmit={tangani}>
              <input ref={kotakRef} name="q" onKeyDown={tanganiEscape} />
              <select name="kategori">
                <option value="">Semua</option>
                <option value="kaos">Kaos</option>
              </select>
              <button type="submit">Cari</button>
            </form>
          );
        }
        `,
        { filename: 'src/cari/FormCari.tsx' },
      ),
      p(
        'Bentuk `useRef<HTMLInputElement>(null)` menyatakan dua hal sekaligus, yaitu elemen apa yang akan disimpan dan bahwa nilainya dimulai dari `null`. Nilai `null` itu bukan formalitas, sebab `ref` memang belum terisi sampai React memasang elemennya ke DOM. Karena itu `kotakRef.current?.focus()` dengan tanda tanya bukan kehati-hatian berlebihan melainkan satu-satunya bentuk yang benar.',
      ),
      p(
        'Perbedaan `target` dan `currentTarget` pada peristiwa React sama dengan di DOM biasa, dan tipenya membuat perbedaan itu terasa. `currentTarget` bertipe persis elemen tempat penangan dipasang, sehingga `peristiwa.currentTarget.reset()` dikenali karena `HTMLFormElement` memang punya method itu. `target` bertipe lebih longgar sebab ia bisa berupa elemen mana pun di dalamnya, dan itu justru cerminan kenyataan.',
      ),
      code(
        'tsx',
        `
        // Tipe peristiwa yang paling sering dipakai, dan elemen yang menyertainya.
        function onUbah(e: ChangeEvent<HTMLInputElement>) {
          e.currentTarget.value;      // string
        }
        function onUbahPilihan(e: ChangeEvent<HTMLSelectElement>) {
          e.currentTarget.value;
        }
        function onKirim(e: FormEvent<HTMLFormElement>) {
          e.currentTarget.elements;
        }
        function onKlik(e: MouseEvent<HTMLButtonElement>) {
          e.currentTarget.disabled = true;
        }
        function onTombol(e: KeyboardEvent<HTMLInputElement>) {
          e.key;                      // 'Escape', 'Enter', dan seterusnya
        }
        `,
        { caption: 'Bagian dalam kurung sudut adalah elemen tempat penangan dipasang.' },
      ),
      p(
        'Cara termudah mengingatnya adalah dengan tidak menghafalnya. Tulis penangannya sebagai fungsi panah langsung di dalam JSX lebih dulu, arahkan kursor ke parameternya, dan editor akan menampilkan tipe yang tepat. Salin tipe itu kalau kamu ingin memindahkan fungsinya keluar. Ini cara yang jauh lebih cepat daripada mencari di dokumentasi, dan hasilnya selalu benar untuk versi React yang kamu pakai.',
      ),
      callout(
        'warning',
        '`ref` bukan tempat menyimpan keadaan yang mempengaruhi tampilan',
        'Mengubah `ref.current` tidak menyebabkan komponen digambar ulang, sehingga tampilan tidak akan mengikuti perubahannya. Ia untuk hal yang berada di luar alur penggambaran, yaitu memegang elemen DOM, menyimpan id timer, dan menyimpan nilai sebelumnya. Untuk apa pun yang harus terlihat di layar, gunakan state yang dibahas di kategori Frontend Intermediate.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat pesan berikut adalah yang paling sering saat mengetik peristiwa dan `ref`, dan seluruhnya menandai bug yang nyata.',
      ),
      code(
        'text',
        `
        kotakRef.current.focus();

        error TS18047: 'kotakRef.current' is possibly 'null'.
        `,
        { caption: '`ref` belum terisi saat kode itu bisa berjalan.' },
      ),
      p(
        'Ini bukan kerewelan TypeScript melainkan cerminan kenyataan. Nilai `ref` diisi React **setelah** komponen digambar, sehingga kode yang berjalan sebelum itu benar-benar akan mendapat `null`. Perbaikannya memakai `?.`, atau memeriksa dengan `if` kalau ada beberapa baris yang memakainya. Yang harus dihindari adalah tanda seru untuk memaksa TypeScript diam, sebab itu mengubah error yang jelas menjadi kegagalan saat berjalan.',
      ),
      code(
        'text',
        `
        function onUbah(e) { setNilai(e.target.value); }

        error TS7006: Parameter 'e' implicitly has an 'any' type.
        `,
        { caption: 'Penangan ditulis sebagai fungsi terpisah tanpa tipe.' },
      ),
      p(
        'Kalau penangan ditulis langsung di dalam JSX sebagai fungsi panah, TypeScript menyimpulkan tipenya sendiri dari propnya dan kamu tidak perlu menulis apa pun. Begitu fungsinya dipindahkan keluar, hubungan itu putus dan tipenya harus dituliskan. Ini alasan praktis kenapa penangan pendek sering dibiarkan di dalam JSX, dan penangan panjang diberi tipe eksplisit saat dipindahkan.',
      ),
      code(
        'text',
        `
        function onUbah(e: ChangeEvent<HTMLElement>) {
          setNilai(e.currentTarget.value);
        }

        error TS2339: Property 'value' does not exist on type 'HTMLElement'.
        `,
        { caption: 'Tipe elemennya terlalu umum.' },
      ),
      p(
        'Properti `value` hanya ada pada elemen tertentu seperti `input`, `select`, dan `textarea`, bukan pada semua elemen. Menyebut tipe yang terlalu umum berarti kamu kehilangan properti yang khusus. Sebut tipe elemen yang sebenarnya, dan kalau satu penangan dipakai untuk beberapa jenis elemen, pakai union seperti `HTMLInputElement | HTMLTextAreaElement`.',
      ),
      code(
        'text',
        `
        const ref = useRef<HTMLInputElement>();
        <input ref={ref} />

        error TS2322: Type 'MutableRefObject<HTMLInputElement | undefined>'
        is not assignable to type 'Ref<HTMLInputElement>'.
        `,
        { caption: 'Nilai awal tidak diberikan, sehingga tipenya menyertakan `undefined`.' },
      ),
      p(
        'Perbedaan antara `useRef<T>(null)` dan `useRef<T>()` menghasilkan dua tipe yang berbeda, dan hanya yang pertama yang cocok untuk dipasang ke atribut `ref`. Aturan praktisnya, kalau `ref` akan dipasang ke elemen, selalu beri nilai awal `null`. Kalau `ref` dipakai untuk menyimpan nilai biasa seperti id timer, barulah nilai awal lain masuk akal.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`'ref.current' is possibly 'null'`",
            '`ref` belum terisi sebelum komponen digambar',
            'Pakai `?.`, atau periksa dengan `if`',
          ],
          [
            "`Parameter 'e' implicitly has an 'any' type`",
            'Penangan dipindahkan keluar JSX tanpa tipe',
            'Tuliskan tipenya, misalnya `ChangeEvent<HTMLInputElement>`',
          ],
          [
            "`Property 'value' does not exist on type 'HTMLElement'`",
            'Tipe elemen terlalu umum',
            'Sebut tipe elemen yang sebenarnya',
          ],
          [
            '`MutableRefObject<... | undefined> is not assignable to Ref<...>`',
            '`useRef` dipanggil tanpa nilai awal',
            'Beri nilai awal `null` untuk `ref` yang dipasang ke elemen',
          ],
          [
            "`Property 'value' does not exist on type 'EventTarget'`",
            '`e.target` dipakai, dan tipenya memang longgar',
            'Pakai `e.currentTarget` yang tipenya persis',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Peristiwa dan `ref` adalah dua tempat kode React paling sering bersentuhan langsung dengan DOM, dan sebagian besar kesalahan di bawah berasal dari membawa kebiasaan DOM biasa apa adanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai tanda seru untuk menghilangkan peringatan `ref.current`',
            'Kita tahu elemennya pasti ada',
            'Ia pasti ada setelah digambar, dan belum ada sebelum itu. Tanda seru mengubah error yang jelas menjadi kegagalan saat berjalan',
          ],
          [
            'Membaca `e.target.value` alih-alih `e.currentTarget.value`',
            'Bentuknya sama dengan DOM biasa',
            '`target` bertipe longgar sebab bisa berupa elemen mana pun di dalamnya. `currentTarget` bertipe persis',
          ],
          [
            'Memakai `ref` untuk menyimpan nilai yang ditampilkan',
            'Lebih sederhana daripada state',
            'Mengubah `ref.current` tidak menggambar ulang, sehingga layar tidak pernah berubah',
          ],
          [
            'Membaca `ref.current` saat komponen pertama kali berjalan',
            'Elemennya kan sudah ditulis di JSX',
            'JSX baru berupa deskripsi. Elemennya belum ada di DOM sampai React memasangnya. Baca di dalam efek',
          ],
          [
            'Menghafal seluruh nama tipe peristiwa',
            'Perlu ditulis setiap kali',
            'Arahkan kursor ke parameter penangan yang ditulis di dalam JSX, dan editor menampilkan tipenya. Salin dari sana',
          ],
          [
            'Memakai `MouseEvent` dari DOM alih-alih dari React',
            'Namanya sama',
            'React memakai pembungkus peristiwanya sendiri dengan tipe berbeda. Impor dari `react`, bukan memakai tipe global',
          ],
        ],
      ),
      p(
        "Baris terakhir menghasilkan pesan error yang sangat membingungkan karena kedua tipe itu bernama sama persis. Kalau kamu melihat pesan yang menyebut `MouseEvent` tidak cocok dengan `MouseEvent`, itulah penyebabnya. Impor tipe peristiwa secara eksplisit dari `react` dengan `import type { MouseEvent } from 'react'`, dan kebingungan itu tidak akan muncul lagi.",
      ),
      callout(
        'tip',
        'Sebagian besar `ref` bisa dihindari, dan itu memang lebih baik',
        'Membaca nilai formulir bisa lewat `FormData` seperti pada studi kasus. Menampilkan atau menyembunyikan bisa lewat state. Mengubah gaya bisa lewat kelas. Yang benar-benar membutuhkan `ref` tinggal sedikit, yaitu memfokuskan elemen, memutar media, mengukur ukuran, dan berinteraksi dengan pustaka non-React. Kalau kamu memakai `ref` untuk hal di luar itu, biasanya ada jalan yang lebih sesuai.',
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
    22,
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
            'Terjemahan bebasnya **ledakan prop boolean**. Keadaan ketika sebuah komponen mengumpulkan banyak prop `true`/`false` seperti `withHeader`, `isLoading`, `hasError`, dan `isEmpty`, sampai kombinasinya jadi mustahil ditelusuri. Empat prop boolean berarti **16 kombinasi**, dan sebagian besar di antaranya tidak masuk akal.',
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
      p(
        'Masalahnya muncul karena `unknown` **memutus hubungan** antara apa yang masuk dan apa yang keluar. Komponen ini menerima array apa pun, tapi begitu `render` dipanggil, TypeScript tidak lagi punya cara mengetahui bahwa item yang dioper berasal dari array itu, jadi ia hanya bisa menjanjikan `unknown` dan mengakses `t.judul` ditolak. Perlu ditegaskan `unknown` di sini **bukan kesalahan**, melainkan justru pilihan yang jujur karena tanpa generic memang tidak ada informasi yang bisa dipertahankan. Mengganti `unknown` dengan `any` akan menghilangkan errornya, tapi juga menghilangkan seluruh manfaat pemeriksaan, sehingga salah ketik `t.judull` akan lolos diam-diam. Yang dibutuhkan adalah cara menyatakan "tipe item di `render` **sama dengan** tipe elemen di `items`", dan itulah tepatnya yang dilakukan generic di bagian berikutnya.',
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
      p(
        'Huruf `T` di sini adalah **placeholder** yang nilainya baru ditentukan saat komponen dipakai. `Props<T>` menyatakan bahwa `items` berisi `T`, dan bahwa `render` maupun `kunci` menerima `T` yang sama, dan hubungan itulah yang tadi hilang saat memakai `unknown`. Karena `items={tugas}` berisi array `Tugas`, TypeScript menyimpulkan `T` adalah `Tugas` lalu **mengalirkannya** ke kedua fungsi, sehingga `t` di `render` dan `kunci` otomatis bertipe `Tugas`, dan `t.judul` dikenali sedangkan `t.judull` ditolak. Perhatikan komponen ini juga menangani empty state lewat prop `kosong` dengan `??` sebagai nilai bawaan, mengikuti pola empat keadaan UI yang sama seperti di bab AJAX. Dan `kunci` sengaja dibuat sebagai fungsi alih-alih nama field berupa string, supaya identitas baris tetap terjamin apa pun bentuk datanya.',
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
      p(
        "Perhatikan bedanya dari `Daftar` sebelumnya. Karena `T extends { id: string }` memastikan setiap item pasti punya `id`, komponen ini tidak perlu lagi menerima prop `kunci` terpisah dan bisa langsung memakai `item.id` sebagai `key`. Batasan ini juga bekerja sebagai penjaga di sisi pemakai, sebab mencoba `<DaftarBerId items={[{ nama: 'x' }]} .../>` pada array yang objeknya tidak punya `id` ditolak TypeScript sebelum kode sempat dijalankan, alih-alih meledak nanti saat `item.id` ternyata `undefined`.",
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
      p(
        'Empat prop opsional yang berdiri sendiri-sendiri menghasilkan **enam belas kombinasi**, dan hanya empat di antaranya yang masuk akal. Baris terakhir adalah salah satu yang tidak, yaitu sedang memuat, sekaligus gagal, sekaligus punya data. TypeScript tidak protes sama sekali karena semua propnya opsional dan boleh diisi bersamaan, jadi tipe seperti ini **terlihat aman padahal tidak menjaga apa-apa**. Akibatnya beban pindah ke badan komponen, yang harus memeriksa urutan prioritas sendiri dengan rantai `if`, dan pemeriksaan itu mudah tertinggal saat keadaan kelima ditambahkan nanti. Ini bentuk umum dari masalah yang sama, sebab menyimpan satu keadaan sebagai beberapa nilai terpisah selalu membuka kemungkinan kombinasi yang tidak dimaksudkan siapa pun.',
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
      p(
        'Enam belas kombinasi tadi menyusut menjadi **tepat empat**, dan tiga baris pemakaian di bawah membuktikannya, karena yang benar diterima sedangkan yang kurang lengkap dan yang bercampur sama-sama ditolak. Perhatikan `Panel` di sini tidak memakai satu pun `if` untuk memeriksa keadaan yang tidak konsisten, sebab `switch` atas `props.status` sudah cukup, dan di tiap `case` TypeScript **mempersempit** tipe `props` sehingga `props.pesan` dan `props.data` hanya bisa diakses di cabang yang memang memilikinya. Ada bonus yang sangat berharga. Kalau nanti kamu menambahkan varian kelima ke `Keadaan`, TypeScript akan menandai `switch` ini karena ada cabang yang belum ditangani, sebuah pengingat otomatis yang tidak mungkin didapat dari rangkaian boolean.',
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
      p(
        'Pola ini membuat **tag yang dirender bisa dipilih pemanggil**, dan tipenya ikut menyesuaikan, sebab `<Kotak as="a" href="/x" />` diterima karena `<a>` memang punya `href`, sedangkan `href` pada `as="section"` akan ditolak. Kuncinya `T extends ElementType`, yang membatasi `T` hanya pada hal-hal yang benar-benar bisa dirender, lalu `ComponentProps<T>` mengambil atribut milik tag itu. `Omit<..., \'as\'>` membuang `as` dari daftar atribut supaya tidak bentrok dengan prop kita sendiri, dan `= \'div\'` memberi nilai bawaan sehingga `<Kotak />` polos tetap sah. Perhatikan `const Komponen = as ?? \'div\'` disimpan ke variabel **berhuruf besar**, dan itu wajib karena seperti dibahas di sub-bab anatomi, JSX memakai huruf pertama untuk membedakan komponen dari tag HTML. Tetapi bacalah peringatan berikutnya dengan serius, sebab kerumitan tipe ini nyata, dan dua komponen terpisah biasanya lebih baik.',
      ),
      callout(
        'warning',
        'Polymorphic component itu mahal',
        'Tipenya rumit, pesan errornya panjang dan sulit dibaca, dan editor jadi lebih lambat. Pakai hanya kalau benar-benar dibutuhkan — biasanya cukup membuat dua komponen terpisah.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi punya tiga tabel, yaitu tabel pesanan, tabel produk, dan tabel pengguna. Ketiganya butuh pengurutan, pemilihan baris, dan keadaan kosong yang sama. Versi pertama menyalin komponen tabelnya tiga kali, dan tiga bulan kemudian perbaikan pada pengurutan hanya diterapkan di satu salinan. Versi kedua membuat satu komponen dengan tipe `any[]`, dan seluruh jaminan tipe hilang justru di tempat yang paling banyak menyentuh data.',
      ),
      p(
        'Generik menyelesaikan keduanya sekaligus, yaitu satu komponen untuk semua jenis data, dengan tipe yang tetap tepat untuk masing-masing.',
      ),
      code(
        'tsx',
        `
        type Kolom<T> = {
          kunci: keyof T & string;              // hanya nama field yang benar-benar ada
          judul: string;
          gambar?: (baris: T) => ReactNode;     // pemformat opsional
          rata?: 'kiri' | 'kanan';
        };

        type TabelProps<T> = {
          data: readonly T[];
          kolom: readonly Kolom<T>[];
          ambilId: (baris: T) => string;        // untuk key, bukan indeks
          onPilih?: (baris: T) => void;
          pesanKosong?: string;
        };

        export function Tabel<T>({
          data,
          kolom,
          ambilId,
          onPilih,
          pesanKosong = 'Belum ada data',
        }: TabelProps<T>) {
          if (data.length === 0) return <p className="kosong">{pesanKosong}</p>;

          return (
            <table>
              <thead>
                <tr>
                  {kolom.map((k) => (
                    <th key={k.kunci} style={{ textAlign: k.rata ?? 'kiri' }}>{k.judul}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((baris) => (
                  <tr key={ambilId(baris)} onClick={() => onPilih?.(baris)}>
                    {kolom.map((k) => (
                      <td key={k.kunci} style={{ textAlign: k.rata ?? 'kiri' }}>
                        {k.gambar ? k.gambar(baris) : String(baris[k.kunci])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        }
        `,
        { filename: 'src/komponen/Tabel.tsx' },
      ),
      code(
        'tsx',
        `
        // Dipakai untuk Pesanan. Tipe T disimpulkan dari prop data.
        <Tabel
          data={pesanan}                              // Pesanan[]
          ambilId={(p) => p.id}                       // p bertipe Pesanan, bukan any
          kolom={[
            { kunci: 'nomor', judul: 'Nomor' },
            { kunci: 'status', judul: 'Status' },
            {
              kunci: 'totalSen',
              judul: 'Total',
              rata: 'kanan',
              gambar: (p) => formatRupiah(p.totalSen),  // p juga bertipe Pesanan
            },
            { kunci: 'pembeli', judul: 'Pembeli' },     // ERROR kalau field ini tidak ada
          ]}
          onPilih={(p) => bukaDetail(p.id)}
        />
        `,
        { caption: 'Tidak ada satu pun tipe yang dituliskan di tempat pemakaian.' },
      ),
      p(
        'Yang membuat pola ini bekerja adalah TypeScript menyimpulkan `T` dari prop `data`, lalu memakainya untuk seluruh prop lain. Fungsi `ambilId` menerima parameter bertipe `Pesanan`, fungsi `gambar` juga, dan editor melengkapi field-nya saat kamu mengetik. Tidak ada satu pun `any`, dan tidak ada satu pun tipe yang perlu ditulis di tempat pemakaian.',
      ),
      p(
        'Bagian `keyof T & string` pada `kunci` adalah yang paling menentukan. Ia membatasi nilai `kunci` hanya pada nama field yang benar-benar ada di `T`, sehingga salah ketik `nomer` alih-alih `nomor` ditolak sebelum dijalankan. Tambahan `& string` diperlukan karena `keyof` juga bisa menghasilkan `number` dan `symbol` untuk sebagian tipe, sedangkan `key` pada JSX butuh teks.',
      ),
      p(
        'Prop `ambilId` menggantikan pendekatan yang biasa dipakai, yaitu mensyaratkan setiap data punya field bernama `id`. Menuntut nama field tertentu membuat komponen ini tidak bisa dipakai untuk data yang penandanya bernama lain, misalnya `kode` atau `nomorInduk`. Menerima fungsi pengambil membuat pemanggilnya yang memutuskan, dan itu lebih fleksibel tanpa kehilangan jaminan apa pun.',
      ),
      callout(
        'tip',
        'Jangan membuat generik sebelum ada dua pemakai nyata',
        'Ini penerapan aturan tiga dari Bab 2 pada tipe. Komponen generik yang dirancang dari satu contoh hampir selalu salah bentuk, sebab kamu menebak apa yang akan berbeda. Tulis dua tabel yang konkret lebih dulu, lihat apa yang benar-benar berbeda di antaranya, baru angkat menjadi generik. Hasilnya hampir selalu lebih sederhana daripada yang kamu bayangkan di awal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Generik menghasilkan pesan error yang lebih panjang daripada biasanya, dan kuncinya membaca dari baris paling dalam.',
      ),
      code(
        'text',
        `
        <Tabel data={pesanan} kolom={[{ kunci: 'nomer', judul: 'Nomor' }]} ambilId={(p) => p.id} />

        error TS2322: Type '"nomer"' is not assignable to type
        '"id" | "nomor" | "status" | "totalSen"'.
        `,
        { caption: 'Nama field salah ketik, dan pilihannya disebut lengkap.' },
      ),
      p(
        'Inilah manfaat `keyof T` yang paling langsung terasa. Pesannya bahkan menyebutkan seluruh nama field yang sah, sehingga kamu tidak perlu membuka berkas tipenya untuk mencari ejaan yang benar. Tanpa pembatasan itu, `kunci: string` akan menerima apa saja dan salah ketiknya menghasilkan kolom berisi `undefined` di layar.',
      ),
      code(
        'text',
        `
        <Tabel data={pesanan} ambilId={(p) => p.kodeUnik} kolom={[...]} />

        error TS2339: Property 'kodeUnik' does not exist on type 'Pesanan'.
        `,
        { caption: 'Parameter fungsi sudah bertipe, jadi field asing ditolak.' },
      ),
      p(
        'Perhatikan kamu tidak menuliskan tipe `p` di mana pun, dan TypeScript tetap tahu ia `Pesanan`. Ini yang disebut penyimpulan generik, yaitu `T` ditentukan dari prop `data` lalu mengalir ke seluruh prop lain. Kalau kamu menemukan diri menuliskan tipe parameter di tempat pemakaian, biasanya itu tanda penyimpulannya gagal karena ada `any` di suatu tempat.',
      ),
      code(
        'text',
        `
        <Tabel<Pesanan> data={produk} ambilId={(p) => p.id} kolom={[...]} />

        error TS2322: Type 'Produk[]' is not assignable to type 'readonly Pesanan[]'.
        `,
        { caption: 'Tipe generik disebut manual, dan datanya tidak cocok.' },
      ),
      p(
        'Menyebut tipe generiknya secara manual dengan kurung sudut memang bisa, dan hampir selalu tidak perlu. Ia berguna hanya saat penyimpulannya gagal atau saat kamu sengaja ingin membatasi. Pada kasus ini ia justru menangkap kesalahan, yaitu data yang diberikan bukan yang dinyatakan. Tanpa penyebutan manual, `T` akan disimpulkan sebagai `Produk` dan tidak ada error.',
      ),
      code(
        'text',
        `
        export function Tabel<T>({ data }: { data: T[] }) {
          return <div>{data.map((b) => b.nama)}</div>;
        }

        error TS2339: Property 'nama' does not exist on type 'T'.
        `,
        { caption: 'Generik tanpa batasan berarti bisa apa saja.' },
      ),
      p(
        'Tipe `T` tanpa batasan berarti benar-benar apa saja, termasuk angka dan teks, sehingga tidak ada satu pun properti yang bisa dijamin ada. Kalau komponenmu memang membutuhkan field tertentu, nyatakan lewat batasan seperti `<T extends { nama: string }>`. Kalau tidak, terima fungsi pengambil seperti `ambilId` pada studi kasus, dan itu bentuk yang lebih fleksibel.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Type \'"x"\' is not assignable to type \'"a" | "b"\'`',
            'Nama field tidak ada, dibatasi `keyof T`',
            'Perbaiki ejaannya, pilihannya disebut di pesan errornya',
          ],
          [
            "`Property 'x' does not exist on type 'Pesanan'`",
            'Field asing dipakai pada parameter yang sudah bertipe',
            'Periksa nama fieldnya di tipe datanya',
          ],
          [
            "`Type 'A[]' is not assignable to type 'readonly B[]'`",
            'Tipe generik disebut manual dan tidak cocok dengan datanya',
            'Hapus penyebutan manualnya, biarkan disimpulkan',
          ],
          [
            "`Property 'x' does not exist on type 'T'`",
            'Generik tanpa batasan dipakai seolah punya field tertentu',
            'Tambahkan batasan `extends`, atau terima fungsi pengambil',
          ],
          [
            'Seluruh parameter bertipe `any`',
            'Ada `any` di rantai penyimpulannya',
            'Telusuri dari mana `any` masuk, biasanya dari data yang tidak bertipe',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Generik adalah alat yang sangat berguna dan sangat mudah dipakai berlebihan. Sebagian besar baris di bawah adalah tentang menahan diri.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat komponen generik dari satu contoh',
            'Nanti pasti dipakai untuk yang lain',
            'Bentuknya hampir selalu salah, sebab kamu menebak apa yang akan berbeda. Tulis dua yang konkret dulu',
          ],
          [
            'Memakai `any[]` supaya komponennya bisa untuk semua data',
            'Lebih cepat daripada memikirkan generik',
            'Seluruh jaminan hilang justru di komponen yang paling banyak menyentuh data. Generik memberi keluwesan yang sama tanpa kehilangan tipe',
          ],
          [
            'Memakai `keyof T` tanpa `& string`',
            '`keyof` sudah menghasilkan nama fieldnya',
            'Ia juga bisa menghasilkan `number` dan `symbol`, dan itu tidak bisa dipakai sebagai `key` di JSX',
          ],
          [
            'Menambahkan batasan yang lebih ketat daripada yang dibutuhkan',
            'Lebih aman kalau dibatasi',
            'Komponennya jadi tidak bisa dipakai untuk data yang sebenarnya cocok. Batasi hanya field yang benar-benar dipakai di dalamnya',
          ],
          [
            'Menyebut tipe generik secara manual di setiap pemakaian',
            'Lebih eksplisit',
            'Penyimpulan biasanya sudah benar, dan penyebutan manual justru bisa menyembunyikan ketidakcocokan. Sebut manual hanya saat penyimpulannya gagal',
          ],
          [
            'Memakai nama parameter tipe satu huruf untuk semuanya',
            'Konvensinya memang begitu',
            'Untuk satu parameter, `T` sudah jelas. Untuk tiga parameter, `T`, `U`, `V` tidak menjelaskan apa pun. Beri nama seperti `TData` dan `TKunci`',
          ],
        ],
      ),
      p(
        'Baris pertama layak diingat sebagai aturan tetap, dan ia sama dengan aturan tiga untuk abstraksi di Bab 2. Komponen generik lebih sulit dibaca daripada komponen biasa, dan biaya itu hanya sepadan kalau memang ada beberapa pemakai dengan bentuk data berbeda. Menyalin komponen dua kali lalu menyatukannya setelah perbedaannya terlihat hampir selalu menghasilkan bentuk yang lebih baik daripada merancangnya di depan.',
      ),
      callout(
        'info',
        'Materi ini punya lanjutan tersendiri',
        'Generik pada komponen adalah pintu masuk ke bagian TypeScript yang jauh lebih dalam, yaitu tipe kondisional, tipe pemetaan, dan tipe template literal. Ketiganya sangat berguna untuk pustaka dan jarang dibutuhkan untuk kode aplikasi biasa. Kalau kamu bertemu kebutuhan yang tidak bisa diselesaikan generik sederhana, itulah saat yang tepat mempelajarinya, bukan sebelum itu.',
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
    17,
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
            'Pemeriksaan bentuk data **saat program berjalan**, memakai library seperti Zod. Wajib untuk data dari luar, karena TypeScript sudah dihapus di titik itu. Menulis `data as Tugas[]` hanya **membungkam** pemeriksa, bukan membuktikan apa pun.',
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
          ['Sesekali bergulat dengan tipe library', 'Rename dan refactor otomatis yang aman'],
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
          ['Membangun library/komponen bersama', '**TSX** — pemakainya butuh tipenya'],
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
      p(
        'Konfigurasi ini sengaja berbeda dari yang dianjurkan untuk project baru, dan perbedaannya ada pada dua baris. `"allowJs": true` mengizinkan berkas `.js` dan `.jsx` **hidup berdampingan** dengan `.tsx`, sebab tanpa itu migrasi menuntut mengubah seluruh project sekaligus, yang jarang realistis. `"strict": false` sengaja ditulis sebagai keadaan **sementara**, dan komentarnya menegaskan hal itu. Menyalakan `strict` di hari pertama migrasi berarti menghadapi ratusan error dari berkas yang bahkan belum kamu sentuh, dan itu cara paling cepat membuat migrasinya ditinggalkan. Urutan yang disarankan di bawah mengikuti logika yang sama, yaitu mulai dari komponen daun karena ia tidak bergantung pada tipe komponen lain, sehingga tiap langkah selesai tanpa menunggu langkah berikutnya.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Dua project berjalan bersamaan di tim yang sama. Yang pertama adalah halaman arahan promosi yang berumur enam minggu, dikerjakan satu orang, berisi delapan komponen tanpa data dari server. Yang kedua adalah panel admin yang akan dirawat bertahun-tahun, dikerjakan enam orang, berisi dua ratus komponen dan tiga puluh endpoint. Menerapkan keputusan yang sama untuk keduanya akan salah pada salah satunya.',
      ),
      p(
        'Pertanyaan yang menentukan bukan seberapa besar projectnya, melainkan tiga hal yang bisa dijawab sebelum satu baris kode ditulis.',
      ),
      table(
        ['Pertanyaan', 'Halaman promosi', 'Panel admin'],
        [
          ['Berapa lama kodenya akan dirawat?', 'Enam minggu, lalu dimatikan', 'Bertahun-tahun'],
          ['Berapa orang yang akan menyentuhnya?', 'Satu', 'Enam, dan berganti'],
          ['Berapa banyak bentuk data dari luar?', 'Nyaris tidak ada', 'Tiga puluh endpoint'],
          ['**Keputusan**', '**JSX cukup**', '**TSX, dengan mode ketat**'],
        ],
        'Yang menentukan adalah umur, jumlah orang, dan jumlah bentuk data dari luar.',
      ),
      p(
        'Ketiga pertanyaan itu mengukur hal yang sama, yaitu seberapa besar kemungkinan seseorang akan mengubah kode ini tanpa mengingat seluruh asumsinya. Untuk halaman promosi yang ditulis dan dibuang oleh satu orang, jawabannya nyaris nol, dan biaya menuliskan tipe tidak terbayar. Untuk panel admin, jawabannya hampir pasti, dan tipe adalah cara termurah menuliskan asumsi itu supaya diperiksa mesin.',
      ),
      code(
        'text',
        `
        Tanda bahwa project SUDAH melewati batas dan layak pindah ke TSX:

        - Ada lebih dari satu orang yang menyentuh berkas yang sama
        - Ada data dari server yang bentuknya tidak ditulis di kode ini
        - Sudah pernah ada bug karena prop yang salah nama atau salah tipe
        - Ada refactor yang ditunda karena takut merusak sesuatu
        - Komponen yang sama dipakai di lebih dari tiga tempat
        - Sudah ada test, sebab tipe dan test saling melengkapi bukan menggantikan
        `,
        { caption: 'Tiga tanda pertama biasanya sudah cukup untuk memutuskan.' },
      ),
      p(
        'Tanda keempat sering diabaikan padahal ia yang paling mahal. Kode tanpa tipe membuat perubahan struktur terasa berisiko, sehingga orang memilih menambahkan cabang baru alih-alih merapikan yang ada. Setelah setahun, hasilnya bukan kode tanpa tipe melainkan kode tanpa tipe yang juga berantakan, dan keduanya saling memperkuat.',
      ),
      p(
        'Ada satu jalan tengah yang sering terlupakan, yaitu memakai JavaScript dengan komentar tipe. Berkas `.js` yang diberi komentar bergaya JSDoc bisa diperiksa TypeScript lewat opsi `checkJs`, tanpa satu pun langkah build tambahan. Ini cocok untuk project menengah yang belum ingin menambah alat, dan sebagian besar manfaat pemeriksaan tetap didapat.',
      ),
      code(
        'js',
        `
        /**
         * @param {{ judul: string, jumlah: number, onKlik: (id: string) => void }} props
         */
        export function Kartu({ judul, jumlah, onKlik }) {
          return <button onClick={() => onKlik(judul)}>{judul} ({jumlah})</button>;
        }

        // Dengan checkJs aktif, pemanggilan yang salah tetap ditolak,
        // dan berkasnya tetap JavaScript biasa tanpa langkah build tambahan.
        `,
        { filename: 'src/komponen/Kartu.jsx' },
      ),
      p(
        'Bentuk ini punya batasnya, yaitu sintaksnya jauh lebih panjang untuk tipe yang rumit, dan sebagian fitur TypeScript tidak tersedia. Untuk tipe props sederhana ia sudah cukup, dan yang lebih penting ia bisa ditambahkan berkas per berkas tanpa mengubah apa pun di konfigurasi build. Beberapa pustaka besar memilih jalur ini justru karena keluarannya tetap JavaScript murni.',
      ),
      callout(
        'tip',
        'Keputusan ini tidak permanen, dan itu bagian dari pertimbangannya',
        'Pindah dari JSX ke TSX bisa dilakukan bertahap seperti dibahas di Sub-bab 6.6, jadi memilih JSX di awal bukan pintu yang tertutup. Yang sulit adalah kebalikannya, yaitu melepaskan tipe dari project yang sudah memakainya. Karena itu untuk project yang benar-benar meragukan, memulai tanpa tipe lalu menambahkannya saat terbukti perlu adalah pilihan yang wajar.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian ini berbeda dari sub-bab lain, sebab yang dibahas adalah biaya yang muncul dari keputusan yang keliru, bukan pesan dari alat.',
      ),
      code(
        'text',
        `
        # Project JSX, setelah delapan bulan dan empat orang:

        $ grep -rn "onKlik\\|onClick\\|onPress" src/komponen/ | wc -l
        47

        # Tiga nama berbeda untuk hal yang sama, dan tidak ada yang tahu
        # komponen mana memakai yang mana tanpa membukanya satu per satu.
        `,
        { caption: 'Biaya tanpa tipe berupa waktu, bukan pesan error.' },
      ),
      p(
        'Inilah bentuk kerugian yang sebenarnya, dan ia tidak pernah muncul sebagai error. Tanpa tipe, tidak ada satu tempat pun yang menyatakan bentuk sebuah komponen, sehingga satu-satunya cara mengetahuinya adalah membaca isinya. Dikalikan dua ratus komponen dan enam orang, itu ratusan jam yang tidak pernah tercatat sebagai biaya.',
      ),
      code(
        'text',
        `
        # Project TSX dengan strict dimatikan:

        $ grep -rn ": any" src/ | wc -l
        312

        # Seluruh biaya TypeScript dibayar, dan sebagian besar manfaatnya tidak didapat.
        `,
        { caption: 'Keputusan setengah jalan yang paling merugikan.' },
      ),
      p(
        'Ini kombinasi terburuk dari kedua pilihan, yaitu menanggung waktu build yang lebih lama dan sintaks yang lebih panjang tanpa mendapat jaminan apa pun. Kalau sebuah project memutuskan memakai TypeScript, mode ketat dan disiplin menghindari `any` adalah bagian dari keputusan itu. Tanpa keduanya, memilih JavaScript murni justru lebih jujur.',
      ),
      code(
        'text',
        `
        # Halaman promosi yang seharusnya selesai dua minggu:

        Minggu 1: menyiapkan tsconfig, eslint, dan tipe untuk tiga komponen
        Minggu 2: memperbaiki error tipe pada pustaka animasi yang tipenya tidak lengkap
        Minggu 3: mulai menulis halamannya
        `,
        { caption: 'Biaya yang tidak terbayar pada project berumur pendek.' },
      ),
      p(
        'Kerugian arah sebaliknya juga nyata, dan ia paling terasa pada project kecil berumur pendek. Waktu penyiapan, waktu build yang lebih lama, dan pergulatan dengan tipe pustaka pihak ketiga semuanya biaya yang harus dibayar di depan. Untuk kode yang akan hidup enam minggu dan disentuh satu orang, biaya itu tidak pernah kembali.',
      ),
      table(
        ['Gejala', 'Keputusan yang keliru', 'Jalan keluarnya'],
        [
          [
            'Nama prop yang sama ditulis berbeda-beda di banyak komponen',
            'JSX dipakai pada project yang sudah melewati batas',
            'Pindah bertahap ke TSX, mulai dari komponen daun',
          ],
          [
            'Ratusan `any` di project TypeScript',
            'TypeScript dipakai tanpa mode ketat dan tanpa disiplin',
            'Nyalakan `strict`, lalu kurangi `any` bertahap',
          ],
          [
            'Dua minggu habis sebelum satu fitur pun jadi',
            'TypeScript dipakai pada project berumur pendek',
            'Pertimbangkan JSX, atau JSDoc dengan `checkJs`',
          ],
          [
            'Refactor selalu ditunda karena takut merusak',
            'Tidak ada tipe dan tidak ada test',
            'Tambahkan salah satunya, dan tipe biasanya lebih murah untuk dimulai',
          ],
          [
            'Bug berulang karena bentuk data dari server berubah',
            'Tipe ditulis dari ingatan, tanpa validasi saat berjalan',
            'Bangkitkan tipe dari skema API, dan validasi di batas',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Keputusan memakai TypeScript sering diambil sebagai soal identitas, bukan sebagai perhitungan. Baris di bawah adalah bentuk keduanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai TypeScript untuk semua project tanpa kecuali',
            'Lebih profesional',
            'Untuk skrip sekali pakai dan halaman berumur pendek, biayanya tidak pernah kembali. Ukur umur dan jumlah orangnya',
          ],
          [
            'Menghindari TypeScript karena terasa memperlambat',
            'Menulis tipe memakan waktu',
            'Waktu yang dihemat dari bug yang tidak terjadi jauh lebih besar pada project berumur panjang. Yang melambat hanya minggu pertama',
          ],
          [
            'Memakai TypeScript dengan `strict` dimatikan',
            'Supaya errornya sedikit',
            'Kombinasi terburuk, yaitu seluruh biayanya dibayar dan sebagian besar manfaatnya tidak didapat',
          ],
          [
            'Mengira tipe menggantikan test',
            'Keduanya sama-sama menangkap kesalahan',
            'Tipe memeriksa bentuk, dan test memeriksa perilaku. Fungsi yang tipenya benar tetap bisa menghitung salah',
          ],
          [
            'Menunda keputusan sampai project besar',
            'Nanti saja kalau sudah perlu',
            'Memindahkan dua ratus berkas jauh lebih mahal daripada memulai dengan tipe. Putuskan di awal, dan putuskan sadar',
          ],
          [
            'Menyalin keputusan dari project lain tanpa menimbangnya',
            'Project itu berhasil',
            'Umur, jumlah orang, dan jumlah bentuk data mereka bisa berbeda jauh. Jawab tiga pertanyaannya sendiri',
          ],
        ],
      ),
      p(
        'Baris keempat perlu ditegaskan karena ia sering dipakai sebagai alasan meninggalkan salah satunya. Tipe menjamin bahwa `hitungOngkir` menerima berat dan mengembalikan angka, dan sama sekali tidak menjamin angkanya benar. Test menjamin angkanya benar untuk kasus yang diuji, dan sama sekali tidak menjamin pemanggilnya mengirim argumen yang tepat. Keduanya menutup celah yang berbeda, dan project yang serius memakai keduanya.',
      ),
      callout(
        'info',
        'Yang perlu kamu bawa ke kategori berikutnya',
        'Seluruh materi React di Frontend Intermediate ditulis dengan TypeScript, sebab itu yang dipakai sebagian besar project React hari ini termasuk website ini sendiri. Kalau kamu memutuskan memakai JSX untuk project pribadimu, materinya tetap berlaku penuh. Yang perlu kamu lakukan hanya mengabaikan anotasi tipenya, dan sisa kodenya identik.',
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
    25,
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
            'Pemeriksaan yang membuat `null` dan `undefined` **tidak bisa masuk diam-diam** ke tempat yang tidak mengharapkannya. Ini yang menangkap bug `Cannot read properties of undefined`, kelas error yang paling sering muncul di produksi, sebelum kodenya sempat dijalankan.',
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
      p(
        "Perhatikan komponen ini **sudah bekerja dengan benar**, sehingga tidak ada yang perlu diperbaiki dari sisi perilaku. Yang tidak terlihat justru pertanyaannya. Apa isi `tugas`? Nilai apa saja yang sah untuk `filter`? `onToggle` menerima apa, id atau objek tugasnya? Jawaban ketiganya hanya ada di kepala penulisnya, dan pemakai komponen ini harus menebaknya dengan membaca isi fungsi. Rantai ternary di dalam `filter` juga menyimpan risiko, sebab kalau `filter` bernilai `'aktiv'` karena salah ketik, tidak ada cabang yang cocok, `filter` mengembalikan semua item dengan syarat terakhir, dan daftarnya salah **tanpa satu pun error**. Itulah kelas kesalahan yang akan ditangkap begitu ekstensinya diganti di langkah berikutnya.",
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
      p(
        "Perhatikan komentar `// ... isi sama persis`, sebab **badan komponennya tidak berubah satu baris pun**. Seluruh migrasi ini hanya menambahkan deklarasi tipe di atasnya. `Tugas` dan `Filter` sengaja di-`export` karena keduanya menggambarkan bentuk data yang dipakai bersama, sebab komponen induk yang menyusun daftarnya butuh tipe yang sama, dan mengimpornya jauh lebih baik daripada menulis ulang bentuk yang gampang menyimpang. `Filter` ditulis sebagai union literal alih-alih `string`, dan itulah yang nanti menangkap salah ketik `'aktiv'` di langkah berikutnya. Tanda tangan `(id: string) => void` pada kedua handler menjawab pertanyaan yang tadi hanya ada di kepala penulisnya. Dan `sedangMemuat = false` menunjukkan prop opsional beserta nilai bawaannya, sebab tipe menyatakan boleh kosong sedangkan nilai bawaan menentukan apa yang dipakai saat kosong.",
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
      p(
        'Ketiga kesalahan ini mewakili tiga cara berbeda sebuah komponen dipakai keliru, dan ketiganya **tidak menghasilkan error apa pun di versi JSX**. Yang pertama adalah salah ketik satu huruf pada nilai literal, persis skenario yang tadi disebut, di mana daftarnya diam-diam salah tanpa gejala. Yang kedua adalah prop wajib yang terlupa, dan di JSX ia hanya membuat `onHapus` bernilai `undefined` sehingga tombol hapusnya diam saat ditekan. Yang ketiga paling halus, yaitu handler yang **bentuk parameternya salah** karena mengira menerima objek padahal menerima id, dan itu baru meledak sebagai `TypeError` saat tombolnya benar-benar ditekan, mungkin berhari-hari setelah kodenya ditulis. Perhatikan pola yang sama di ketiganya, bahwa kegagalan yang tadinya muncul di browser pada waktu yang tidak terduga kini muncul di editor pada baris yang tepat.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Kamu diminta mengubah satu berkas `KartuProduk.jsx` yang sudah dipakai di tiga halaman menjadi TypeScript. Berkasnya seratus baris, tidak punya test, dan tiga pemanggilnya masih `.jsx`. Godaan pertama adalah mengganti ekstensinya lalu memperbaiki error sampai hijau. Cara itu bekerja untuk berkas sederhana, dan pada berkas seperti ini ia biasanya berakhir dengan sepuluh `any` yang menghilangkan seluruh manfaatnya.',
      ),
      p(
        'Urutan di bawah menghasilkan berkas yang benar-benar bertipe, dan tiap langkahnya bisa dihentikan tanpa meninggalkan kode yang rusak.',
      ),
      steps(
        {
          title: 'Ganti ekstensi, jangan sentuh isinya',
          body: 'Ubah `KartuProduk.jsx` menjadi `KartuProduk.tsx` lalu jalankan `tsc`. Baca seluruh errornya tanpa memperbaiki satu pun. Daftar itu adalah peta pekerjaan yang sebenarnya, dan membacanya lebih dulu mencegah kamu menambal satu per satu tanpa melihat polanya.',
        },
        {
          title: 'Tulis tipe props lebih dulu',
          body: 'Sebagian besar error biasanya berasal dari props yang bertipe implisit. Menuliskan satu tipe props sering menghilangkan separuh daftar errornya sekaligus. Baca pemanggilnya untuk tahu prop mana yang selalu diberikan dan mana yang kadang tidak.',
        },
        {
          title: 'Tangani nilai yang mungkin tidak ada',
          body: 'Error `possibly null` dan `possibly undefined` adalah bug nyata yang selama ini tidak terlihat. Perbaiki dengan pemeriksaan sungguhan, bukan dengan tanda seru. Kalau sebuah nilai memang tidak mungkin kosong, biasanya tipenya yang perlu diperbaiki bukan pemeriksaannya yang perlu dipaksa.',
        },
        {
          title: 'Ketik data dari luar di batasnya',
          body: 'Respons server, isi `localStorage`, dan parameter alamat semuanya bertipe tidak diketahui. Ketik di satu titik masuk, lalu seluruh kode setelahnya bekerja dengan tipe yang benar. Jangan menyebarkan penegasan tipe ke seluruh berkas.',
        },
        {
          title: 'Hapus sisa `any` satu per satu',
          body: 'Cari dengan `grep -n ": any" berkas.tsx`. Tiap `any` yang tersisa adalah janji yang belum ditepati. Kalau ada yang benar-benar sulit, tinggalkan komentar yang menyebut alasannya supaya orang berikutnya tahu itu disengaja.',
        },
        {
          title: 'Ubah pemanggilnya, dan biarkan error memandu',
          body: 'Setelah berkasnya bertipe, ubah satu pemanggil dan jalankan `tsc` lagi. Error yang muncul di pemanggil adalah bug yang selama ini diam. Inilah bagian yang paling sering menemukan sesuatu.',
        },
      ),
      code(
        'text',
        `
        # Langkah 1, keluaran tsc pertama pada KartuProduk.tsx:

        error TS7031: Binding element 'produk' implicitly has an 'any' type.
        error TS7031: Binding element 'onTambah' implicitly has an 'any' type.
        error TS7006: Parameter 'e' implicitly has an 'any' type.
        error TS18047: 'gambarRef.current' is possibly 'null'.
        error TS2339: Property 'diskon' does not exist on type 'never'.

        # Lima error, dan tiga di antaranya hilang setelah tipe props ditulis.
        `,
        { caption: 'Membaca seluruh daftar lebih dulu memperlihatkan polanya.' },
      ),
      p(
        'Kode `TS7031` yang muncul dua kali menandakan props yang dibongkar tanpa tipe, dan keduanya selesai dengan satu tipe props. Kode `TS7006` untuk parameter `e` juga sering ikut selesai kalau penanganya ditulis di dalam JSX. Yang tersisa biasanya `TS18047` dan hal yang berhubungan dengan data dari luar, dan itulah bug yang sebenarnya.',
      ),
      code(
        'tsx',
        `
        // Langkah 4: mengetik data dari luar DI BATASNYA, bukan disebar.
        import { z } from 'zod';

        const SkemaProduk = z.object({
          id: z.string(),
          nama: z.string(),
          hargaSen: z.number().int().nonnegative(),
          diskonPersen: z.number().min(0).max(100).default(0),
          stok: z.number().int().nonnegative(),
        });

        export type Produk = z.infer<typeof SkemaProduk>;   // tipe DARI skema, sekali tulis

        export async function ambilProduk(id: string): Promise<Produk> {
          const respons = await klien.ambil(\`/produk/\${id}\`);
          // Diperiksa saat BERJALAN, bukan hanya saat build.
          return SkemaProduk.parse(respons);
        }
        `,
        { filename: 'src/produk/api.ts' },
      ),
      p(
        'Pola ini menutup lubang terbesar TypeScript, yaitu tipe hilang saat build sehingga data dari server tidak pernah benar-benar diperiksa. Skema divalidasi saat berjalan, dan tipenya diturunkan dari skema itu sehingga keduanya tidak mungkin menyimpang. Kalau server suatu hari mengirim `hargaSen` sebagai teks, kegagalannya muncul di satu tempat dengan pesan yang menyebut field-nya, bukan sebagai perhitungan salah di halaman lain.',
      ),
      p(
        'Perhatikan `z.infer<typeof SkemaProduk>` menghasilkan tipe dari skema, bukan sebaliknya. Urutan itu penting. Kalau kamu menulis tipenya sendiri lalu menulis skema terpisah, keduanya akan menyimpang seiring waktu dan kamu kembali punya dua sumber kebenaran. Satu skema, dan tipenya ikut.',
      ),
      callout(
        'danger',
        'Tanda seru dan `as` adalah utang, bukan perbaikan',
        'Keduanya memberi tahu TypeScript untuk berhenti memeriksa tanpa mengubah apa pun tentang nilainya. Kalau kamu memakainya untuk menyelesaikan konversi lebih cepat, kamu memindahkan kegagalan dari waktu build ke waktu berjalan, yaitu ke tempat yang lebih mahal. Kalau memang terpaksa, tulis komentar yang menyebut kenapa itu aman.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat pesan berikut adalah yang paling sering muncul selama konversi, dan seluruhnya diambil dari `tsc` sungguhan.',
      ),
      code(
        'text',
        `
        export function Kartu({ produk, onTambah }) { /* ... */ }

        error TS7031: Binding element 'produk' implicitly has an 'any' type.
        `,
        { caption: 'Props dibongkar tanpa tipe.' },
      ),
      p(
        'Ini error pertama yang hampir selalu muncul, dan ia hilang begitu tipe props ditulis. Yang perlu dihindari adalah jalan pintas berupa `{ produk, onTambah }: any`, sebab itu menghilangkan seluruh manfaat konversinya. Baca pemanggilnya untuk tahu bentuk sesungguhnya, dan kalau ada prop yang kadang tidak diberikan, tandai opsional dengan tanda tanya.',
      ),
      code(
        'text',
        `
        const [item, setItem] = useState([]);
        item.map((i) => i.nama);

        error TS2339: Property 'nama' does not exist on type 'never'.
        `,
        { caption: 'Array kosong sebagai nilai awal disimpulkan sebagai `never[]`.' },
      ),
      p(
        'Tipe `never` muncul karena TypeScript tidak punya petunjuk apa pun tentang isi array kosong itu. Pesannya membingungkan pertama kali karena kata `never` tidak menjelaskan apa-apa. Perbaikannya menyebut tipenya di `useState`, yaitu `useState<Produk[]>([])`. Pola yang sama berlaku untuk `useState(null)` yang perlu ditulis `useState<Produk | null>(null)`.',
      ),
      code(
        'text',
        `
        const data = await respons.json();
        hitungTotal(data.item);

        error TS18046: 'data' is of type 'unknown'.
        `,
        { caption: 'Hasil `json()` bertipe tidak diketahui pada TypeScript versi baru.' },
      ),
      p(
        'Ini justru perubahan yang benar, sebab hasil `json()` memang bisa berbentuk apa saja. Godaan terbesarnya adalah menambahkan `as Produk` dan melanjutkan, dan itu berarti kamu berjanji tanpa memeriksa. Perbaikan yang sungguhan adalah memvalidasinya seperti pada studi kasus di atas. Kalau validasi penuh belum memungkinkan, minimal periksa field yang benar-benar dipakai.',
      ),
      code(
        'text',
        `
        import { formatRupiah } from './format';

        error TS2307: Cannot find module './format' or its corresponding
        type declarations.
        `,
        { caption: 'Berkas tujuannya masih `.js` dan `allowJs` belum aktif.' },
      ),
      p(
        'Selama konversi bertahap, berkas `.tsx` yang baru akan mengimpor berkas `.js` yang lama, dan itu perlu diizinkan lewat `allowJs` seperti dibahas di Sub-bab 6.6. Kalau opsi itu sudah aktif dan pesannya tetap muncul, periksa jalur impornya, sebab TypeScript juga menolak jalur yang salah dengan pesan yang sama.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Binding element 'x' implicitly has an 'any' type`",
            'Props dibongkar tanpa tipe',
            'Tulis tipe props, jangan memakai `any`',
          ],
          [
            "`Property 'x' does not exist on type 'never'`",
            'Nilai awal array kosong tanpa tipe',
            'Sebut tipenya, misalnya `useState<Produk[]>([])`',
          ],
          [
            "`'data' is of type 'unknown'`",
            'Hasil `json()` memang tidak diketahui bentuknya',
            'Validasi dengan skema, jangan memakai `as`',
          ],
          [
            "`Cannot find module './x'`",
            'Berkas tujuannya masih `.js` tanpa `allowJs`',
            'Nyalakan `allowJs`, dan periksa jalurnya',
          ],
          [
            "`Object is possibly 'null'` pada `ref`",
            '`ref` belum terisi sebelum digambar',
            'Pakai `?.`, bukan tanda seru',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Konversi yang buruk menghasilkan berkas yang terlihat sudah bertipe padahal tidak memberi jaminan apa pun. Baris di bawah adalah bentuk-bentuknya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `any` untuk menghabiskan daftar error dengan cepat',
            'Berkasnya jadi hijau',
            'Berkas itu terlihat sudah dikonversi padahal tidak diperiksa sama sekali, dan tidak ada yang akan kembali memperbaikinya',
          ],
          [
            'Memakai tanda seru untuk seluruh peringatan null',
            'Kita tahu nilainya ada',
            'Itu janji tanpa pemeriksaan. Errornya kembali sebagai kegagalan saat berjalan, di tempat yang lebih sulit ditelusuri',
          ],
          [
            'Menulis tipe untuk respons server dari ingatan',
            'Bentuknya kan sudah diketahui',
            'Tipe yang tidak cocok dengan kenyataan lebih berbahaya daripada tanpa tipe, sebab pemeriksaan yang seharusnya ada justru dihapus. Validasi di batas',
          ],
          [
            'Mengonversi berkas beserta seluruh pemanggilnya sekaligus',
            'Sekalian selesai',
            'Diff-nya menjadi terlalu besar untuk ditinjau, dan kalau ada yang rusak sulit tahu bagian mana. Satu berkas per perubahan',
          ],
          [
            'Melewatkan langkah membaca seluruh error lebih dulu',
            'Langsung perbaiki saja satu per satu',
            'Kamu kehilangan polanya. Satu tipe props sering menghilangkan separuh daftar sekaligus',
          ],
          [
            'Menganggap konversi selesai saat `tsc` hijau',
            'Tidak ada error lagi',
            'Hijau dengan sepuluh `any` bukan selesai. Cari sisa `any` dengan `grep`, dan pastikan tiap yang tersisa punya alasan tertulis',
          ],
        ],
      ),
      p(
        'Baris terakhir memberi ukuran keberhasilan yang bisa diperiksa. Setelah `tsc` hijau, jalankan `grep -n ": any" berkas.tsx` dan hitung hasilnya. Nol berarti konversinya sungguhan. Angka selain nol berarti masih ada janji yang belum ditepati, dan tiap satunya layak diberi komentar yang menyebut kenapa ia dibiarkan. Berkas yang hijau tanpa `any` adalah berkas yang benar-benar terlindungi.',
      ),
      callout(
        'info',
        'Ini penutup Frontend Basic, dan pintu masuk ke React',
        'Enam bab kategori ini membangun fondasi yang seluruhnya akan dipakai lagi. Bahasa dan pantangan mutasi dari Bab 1, object dan prototype dari Bab 2, asinkron dan pembatalan dari Bab 3, pohon DOM dan rekonsiliasi manual dari Bab 4, konsumsi API beserta empat keadaannya dari Bab 5, dan JSX beserta tipe dari Bab 6. Frontend Intermediate tidak memperkenalkan gagasan baru sebanyak yang terlihat, melainkan menyediakan cara yang lebih rapi untuk hal yang sudah kamu tulis sendiri.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Error "implicitly has an any type" adalah pertanyaan yang tepat, bukan gangguan.',
        'Konversi ke TSX langsung menangkap salah ketik, prop hilang, dan tanda tangan salah.',
        'Boolean prop yang terpisah membolehkan impossible state; discriminated union menutupnya.',
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
