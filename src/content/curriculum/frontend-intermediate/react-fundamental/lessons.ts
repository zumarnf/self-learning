import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  table,
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
    10,
    'Melihat React sebagai jawaban atas kode DOM manual yang kamu tulis sendiri di Frontend Basic.',
    [
      p(
        'Di Bab 4 Frontend Basic kamu membangun To-Do List dengan DOM murni. Ia bekerja. Bab ini menjelaskan kenapa pendekatan itu berhenti bekerja saat aplikasi membesar — memakai kodemu sendiri sebagai bukti.',
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

      h2('Masalah 2: membangun ulang merusak keadaan'),
      code(
        'js',
        `
        // Pola Bab 4
        wadah.replaceChildren();
        for (const t of daftar) wadah.append(buatBaris(t));

        // Setiap render ulang menghapus:
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

      h2('Yang React TIDAK selesaikan'),
      ul(
        'Ia tidak membuat aplikasimu cepat dengan sendirinya — pembaruan yang salah tetap lambat.',
        'Ia tidak mengurus pengambilan data, routing, atau form. Semuanya pustaka terpisah.',
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
      h2('Rangkuman'),
      ul(
        'Sinkronisasi manual antara data dan DOM adalah sumber bug yang tumbuh seiring aplikasi.',
        'React membandingkan deskripsi lama dan baru, sehingga keadaan DOM tidak ikut hancur.',
        'Komponen menyatukan struktur, tampilan, dan perilaku dalam satu satuan.',
        'React tidak mengurus data, routing, maupun form — semuanya terpisah.',
      ),
    ],
  ),

  written(
    'setup-project',
    'Menyiapkan Project: Vite vs Next.js',
    10,
    'Dua titik awal dan konsekuensinya — dipilih dari kebutuhan, bukan dari popularitas.',
    [
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
        ├── lib/               # fungsi murni — bisa diuji tanpa React
        ├── types/
        └── App.tsx
        `,
      ),
      callout(
        'info',
        'Kelompokkan per fitur, bukan per jenis berkas',
        'Folder `components/`, `hooks/`, `utils/` yang berisi semua fitur bercampur terlihat rapi saat kecil, tapi mengerjakan satu fitur berarti membuka lima folder berbeda. Setelah aplikasi tumbuh, kelompokkan per fitur — semua yang berubah bersama, disimpan bersama.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Vite untuk belajar dan aplikasi di balik login; Next.js kalau butuh SEO atau kode server.',
        'StrictMode memanggil komponen dua kali di development untuk membongkar efek samping.',
        'Jangan matikan StrictMode — perbaiki penyebabnya.',
        'Kelompokkan berkas per fitur begitu aplikasi tumbuh.',
      ),
    ],
  ),

  written(
    'komponen-pertama',
    'Komponen Pertama & Cara React Merender',
    11,
    'Fungsi yang mengembalikan tampilan — dan apa yang terjadi saat ia dipanggil.',
    [
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
      callout(
        'info',
        'Render tidak berarti DOM berubah',
        'React bisa memanggil komponenmu, mendapati hasilnya sama persis, lalu **tidak menyentuh DOM sama sekali**. "Render ulang" jauh lebih murah daripada yang dibayangkan banyak orang — dan itu sebabnya optimasi prematur di React sering menyelesaikan masalah yang tidak ada.',
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
      h2('Rangkuman'),
      ul(
        'Komponen adalah fungsi yang mengembalikan deskripsi tampilan.',
        'Nama wajib huruf besar; mengembalikan `undefined` adalah error.',
        'Komponen harus murni — React boleh memanggilnya berkali-kali.',
        'Render menghasilkan objek deskripsi; commit yang menyentuh DOM.',
        'Render ulang tidak selalu berarti DOM berubah.',
      ),
    ],
  ),

  written(
    'props',
    'Props: mengalirkan data ke bawah',
    11,
    'Kontrak masuk sebuah komponen — dan kenapa ia hanya-baca.',
    [
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

      divider,
      h2('Rangkuman'),
      ul(
        'Props hanya-baca — komponen tidak boleh mengubah yang diterimanya.',
        'Data turun lewat props; perubahan naik lewat callback.',
        '`children` menghindari prop drilling dengan mengoper komponen, bukan data.',
        '`...sisa` + `ComponentProps` meneruskan atribut HTML lengkap dengan tipenya.',
        '`onClick={fn()}` memanggil saat render; `onClick={fn}` mengoper.',
      ),
    ],
  ),

  written(
    'rendering-kondisional',
    'Rendering Kondisional',
    10,
    'Menampilkan sesuatu hanya bila perlu — dan jebakan yang menampilkan angka nol.',
    [
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
      h2('Rangkuman'),
      ul(
        '`length > 0 &&`, bukan `length &&` — `0` tetap dirender.',
        'Early return membuat empat keadaan UI terbaca berurutan.',
        'Skeleton harus memesan tinggi akhirnya supaya layout tidak melompat.',
        '`hidden` mempertahankan state; tidak merender menghapusnya.',
      ),
    ],
  ),

  written(
    'rendering-list',
    'Rendering List & Kenapa `key` Penting',
    12,
    'Menampilkan banyak item dan menjaga identitasnya — sumber bug yang tampak mustahil.',
    [
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
      h2('Rangkuman'),
      ul(
        '`key` adalah identitas yang dipakai React untuk mencocokkan item lama dan baru.',
        'Indeks sebagai key membuat state internal berpindah ke baris yang salah.',
        'Pakai id yang ikut berpindah bersama itemnya.',
        '`key` hanya perlu unik di antara saudaranya.',
        'Mengganti `key` adalah cara bersih memaksa reset seluruh state komponen.',
      ),
    ],
  ),

  written(
    'styling-react',
    'Styling di React',
    10,
    'Beberapa pendekatan, dan kriteria memilih yang tidak berdasarkan selera.',
    [
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

      h2('Kriteria memilih'),
      ol(
        '**Ikuti yang sudah dipakai project.** Konsistensi mengalahkan preferensi — dua sistem styling dalam satu project adalah yang terburuk.',
        '**Project baru:** Tailwind kalau kamu nyaman dengan utility; CSS Module kalau tim lebih kuat di CSS.',
        '**Hindari CSS-in-JS runtime** di project baru — banyak yang beralih karena biaya runtime dan ketidakcocokan dengan Server Component.',
        '**Apa pun pilihannya, kunci token.** Nilai warna dan spacing yang tersebar adalah masalah yang sama di sistem mana pun.',
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
    ],
  ),

  written(
    'composition-children',
    'Composition & `children`',
    12,
    'Menyusun komponen dari komponen lain — jalan keluar dari prop drilling.',
    [
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
      p('Versi yang berbagi state lewat Context — dan kapan pola ini sepadan — dibahas di Bab 6.'),

      h2('Kapan composition berlebihan'),
      callout(
        'warning',
        'Jangan memecah komponen yang belum menyakitkan',
        'Komponen dengan tiga prop yang jelas lebih baik daripada compound component dengan lima bagian yang harus dirakit setiap kali dipakai. Composition menyelesaikan masalah **props yang meledak** dan **prop drilling** — kalau keduanya belum terjadi, ia hanya menambah lapisan.',
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
    ],
  ),

  written(
    'virtual-dom',
    'Virtual DOM & Reconciliation',
    12,
    'Apa yang sebenarnya dilakukan React di balik layar — dan apa yang sering dilebih-lebihkan.',
    [
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

      h2('Apa yang tidak perlu kamu optimasi'),
      callout(
        'info',
        'Render ulang tidak otomatis berarti masalah',
        'Komponen yang dirender ulang tapi menghasilkan output yang sama **tidak menyentuh DOM sama sekali**. Membungkus semuanya dengan `memo` sering menambah biaya perbandingan tanpa menghemat apa pun. Ukur dulu dengan React DevTools Profiler — dan di React 19 dengan React Compiler, sebagian besarnya sudah otomatis.',
      ),

      h2('Yang benar-benar berdampak'),
      ol(
        '`key` yang stabil — mencegah pembongkaran yang tidak perlu.',
        'Jangan mendefinisikan komponen di dalam komponen.',
        'Jangan mengubah tipe elemen tanpa alasan (`div` ↔ `span`).',
        'Untuk daftar sangat panjang (>200 baris), virtualisasi — bukan memoisasi.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'React tidak lebih cepat dari DOM — ia menyentuh DOM lebih sedikit, secara otomatis.',
        'Tipe berbeda membongkar seluruh subpohon beserta state-nya.',
        'Komponen yang didefinisikan di dalam komponen dibongkar setiap render.',
        'Posisi dan tipe yang sama membuat state dipertahankan; `key` mengubah itu.',
        'Ukur sebelum memoisasi — render ulang sering tidak menyentuh DOM.',
      ),
    ],
  ),

  written(
    'react-compiler',
    'React Compiler dan artinya bagi memoization',
    11,
    'Perubahan besar di React 19 yang mengurangi kebutuhan `useMemo` dan `useCallback` manual.',
    [
      p(
        'Selama bertahun-tahun, "optimasi React" berarti menaburkan `useMemo`, `useCallback`, dan `memo`. React Compiler mengubah itu: ia menganalisis komponenmu saat build dan menyisipkan memoisasi yang diperlukan secara otomatis.',
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
          notes: ['Compiler menyisipkan memoisasi', 'Kode kembali terbaca'],
        },
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
      callout(
        'info',
        'ESLint akan memberi tahu — dan itu error, bukan saran',
        'Project ini menjalankan plugin React Compiler lewat ESLint. Dua pelanggaran yang ditemukan di audit sesi lalu — `useMemo` yang tidak bisa dipertahankan dan `setState` di dalam Effect — keduanya muncul sebagai **error lint**, bukan peringatan. Perbaiki polanya; jangan matikan aturannya.',
      ),

      h2('Kapan memoisasi manual masih diperlukan'),
      code(
        'tsx',
        `
        // 1. Perhitungan yang benar-benar berat
        const hasil = useMemo(() => hitungRibuanBaris(data), [data]);

        // 2. Referensi stabil yang dituntut pustaka luar
        const opsi = useMemo(() => ({ tinggi: 400 }), []);
        useEfekPustakaLuar(opsi);

        // 3. Nilai Context yang objek — mencegah seluruh konsumen re-render
        const value = useMemo(() => ({ pengguna, keluar }), [pengguna, keluar]);
        `,
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
        'Compiler mengoptimalkan memoisasi, bukan arsitektur',
        'Masalah performa React yang paling sering di aplikasi nyata bukan re-render — melainkan pengambilan data yang berurutan padahal bisa paralel, dan bundle yang membawa pustaka berat ke halaman yang tidak memakainya. Keduanya tidak disentuh Compiler.',
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

      divider,
      h2('Rangkuman'),
      ul(
        'Compiler menyisipkan memoisasi otomatis — `useMemo`/`useCallback` manual jauh berkurang.',
        'Ia melewati komponen yang melanggar aturan React; ESLint yang memberi tahu.',
        'Masih perlu manual untuk perhitungan berat, referensi untuk pustaka luar, dan nilai Context.',
        'Ia tidak memperbaiki `key`, waterfall, ukuran bundle, atau daftar sangat panjang.',
      ),
    ],
  ),

  written(
    'praktik-halaman-profil',
    'Praktik: Halaman profil dari data statis',
    14,
    'Menyusun beberapa komponen jadi satu halaman — tanpa satu pun state.',
    [
      p(
        'Praktik ini sengaja **tanpa state sama sekali**. Tujuannya melatih hal yang paling menentukan kualitas kode React: memecah tampilan menjadi komponen, dan mengalirkan data lewat props.',
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

      h2('4. Daftar dengan keadaan kosong'),
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
      callout(
        'warning',
        'Keadaan kosong bukan opsional',
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

      checklist(
        'frontend-intermediate/fundamental-reactjs/praktik',
        'Checklist praktik 2.11',
        'Bentuk data dirancang lebih dulu, sebelum komponen',
        'Minimal empat komponen, masing-masing satu tanggung jawab',
        'Tidak ada komponen yang didefinisikan di dalam komponen lain',
        '`key` memakai id yang stabil, bukan indeks',
        'Kondisional memakai `length > 0 &&`, bukan `length &&`',
        'Keadaan kosong ditangani dengan kalimat yang menjelaskan',
        'Semua props punya tipe eksplisit',
        'Tidak ada nilai warna atau spacing mentah — semuanya token',
        'Struktur heading benar: satu `h1`, lalu `h2` untuk tiap bagian',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Rancang bentuk data sebelum komponen.',
        'Pecah jadi komponen saat ia berulang atau punya satu tanggung jawab yang jelas.',
        'Komponen daun tidak tahu-menahu soal data induknya.',
        'Keadaan kosong ditangani di komponen daftar, bukan di pemanggilnya.',
        'Bab berikutnya menambahkan state — dan semua kebiasaan ini tetap berlaku.',
      ),
    ],
  ),
];
