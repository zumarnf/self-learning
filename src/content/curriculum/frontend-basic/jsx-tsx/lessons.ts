import { callout, code, compare, divider, h2, ol, p, table, ul } from '@/lib/content/builders';
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
    ],
  ),

  written(
    'anatomi-jsx',
    'Anatomi JSX & Aturannya',
    10,
    'Aturan penulisan yang berbeda dari HTML — dan alasan tiap perbedaannya.',
    [
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
    ],
  ),

  written(
    'ekspresi-di-jsx',
    'Menyisipkan Ekspresi JavaScript',
    11,
    'Apa yang boleh dan tidak boleh ditulis di dalam kurung kurawal — termasuk jebakan angka nol.',
    [
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
    ],
  ),

  written(
    'tsx-vs-jsx',
    '`.tsx` vs `.jsx` — apa yang berubah',
    10,
    'Perbedaan konkret di berkas, tooling, dan pengalaman menulis.',
    [
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
    ],
  ),

  written(
    'tipe-props-children',
    'Memberi Tipe pada Props & `children`',
    12,
    'Kontrak antar komponen yang diperiksa mesin.',
    [
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
    ],
  ),

  written(
    'tipe-event-ref',
    'Memberi Tipe pada Event & `ref`',
    12,
    'Dua tempat pemula paling sering tersandung tipe.',
    [
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
    ],
  ),

  written(
    'generic-component',
    'Generic Component & Discriminated Union Props',
    13,
    'Komponen yang tipenya menyesuaikan datanya — dan cara menghapus banyak boolean prop sekaligus.',
    [
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
    ],
  ),

  written(
    'kapan-tsx',
    'Kapan JSX Cukup, Kapan TSX Wajib',
    10,
    'Keputusan yang sebaiknya diambil di awal project, bukan di tengah jalan.',
    [
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
    ],
  ),
];
