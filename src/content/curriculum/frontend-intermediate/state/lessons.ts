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
 * Frontend Intermediate — Chapter 4, all twelve lessons.
 *
 * The mental model chapter. "State is a snapshot" is the single idea that resolves most React
 * confusion, so it gets its own lesson early and is referenced throughout the rest.
 */
export const lessons: LessonDraft[] = [
  written(
    'usestate-dasar',
    '`useState`: dasar dan aturannya',
    11,
    'Menambahkan ingatan ke sebuah komponen — dan aturan yang mengikatnya.',
    [
      h2('Bentuk dasar'),
      code(
        'tsx',
        `
        import { useState } from 'react';

        export function Penghitung() {
          const [jumlah, setJumlah] = useState(0);
          //     ^nilai   ^pengubah        ^nilai awal

          return <button onClick={() => setJumlah(jumlah + 1)}>{jumlah}</button>;
        }
        `,
      ),
      p(
        '`useState` mengembalikan array dua elemen, dan kamu memberi nama keduanya lewat destructuring array — persis yang kamu pelajari di Frontend Basic 1.11.',
      ),

      h2('Kenapa bukan variabel biasa'),
      code(
        'tsx',
        `
        // TIDAK BEKERJA — dua alasan sekaligus
        export function Buruk() {
          let jumlah = 0;

          return <button onClick={() => { jumlah++; }}>{jumlah}</button>;
        }
        // 1. React tidak tahu ada yang berubah -> tidak merender ulang
        // 2. Kalaupun dirender ulang, 'jumlah' di-reset ke 0 karena fungsinya dipanggil lagi
        `,
      ),
      p(
        '`useState` menyelesaikan keduanya: React menyimpan nilainya di luar fungsi, dan memicu render saat nilainya berubah.',
      ),

      h2('Dua aturan hooks'),
      ol(
        '**Hanya di level teratas.** Tidak di dalam `if`, loop, atau fungsi bersarang.',
        '**Hanya di komponen React atau hook lain.** Tidak di fungsi biasa.',
      ),
      code(
        'tsx',
        `
        // SALAH: jumlah hook berubah antar render
        if (masuk) {
          const [x, setX] = useState(0);
        }

        // SALAH: di dalam loop
        for (const i of items) {
          const [y] = useState(i);
        }

        // BENAR: kondisi di dalam, hook di luar
        const [x, setX] = useState(0);
        if (masuk) { /* pakai x di sini */ }
        `,
      ),
      callout(
        'warning',
        'Kenapa aturannya seketat itu',
        'React tidak menyimpan **nama** hook — hanya **urutan pemanggilannya**. Kalau satu hook dilewati pada render tertentu, semua hook setelahnya bergeser satu posisi dan menerima state milik hook lain. Nilai `useState` bisa tiba-tiba berisi hasil `useRef`, tanpa error apa pun.',
      ),

      h2('Nilai awal yang mahal'),
      code(
        'tsx',
        `
        // SALAH: bacaLocalStorage() dipanggil di SETIAP render,
        // meski hasilnya hanya dipakai sekali
        const [data, setData] = useState(bacaLocalStorage());

        // BENAR: lazy initializer — fungsinya hanya dipanggil di render pertama
        const [data, setData] = useState(() => bacaLocalStorage());
        `,
      ),
      callout(
        'tip',
        'Perhatikan bedanya',
        '`useState(fn())` memanggil `fn` lalu mengoper hasilnya — setiap render. `useState(fn)` mengoper fungsinya, dan React memanggilnya sekali. Selisihnya satu pasang tanda kurung.',
      ),

      h2('Menyimpan fungsi di dalam state'),
      code(
        'tsx',
        `
        // Karena bentuk fungsi diartikan sebagai updater, menyimpan fungsi butuh pembungkus
        const [fn, setFn] = useState(() => () => console.log('halo'));
        setFn(() => () => console.log('baru'));
        `,
      ),
      p(
        'Ini jarang diperlukan — biasanya `useRef` lebih tepat untuk menyimpan fungsi yang tidak memicu render.',
      ),

      h2('Satu state atau beberapa'),
      code(
        'tsx',
        `
        // Pisah — kalau berubah sendiri-sendiri
        const [nama, setNama] = useState('');
        const [email, setEmail] = useState('');

        // Gabung — kalau SELALU berubah bersamaan
        const [posisi, setPosisi] = useState({ x: 0, y: 0 });

        // Gabung juga kalau keadaannya saling bergantung -> useReducer (sub-bab 4.10)
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Variabel biasa tidak memicu render dan ter-reset setiap render.',
        'Hook hanya di level teratas — React mengandalkan urutan pemanggilan, bukan nama.',
        '`useState(() => mahal())` memanggil sekali; `useState(mahal())` memanggil setiap render.',
        'Pisahkan state yang berubah sendiri-sendiri; gabungkan yang selalu berubah bersama.',
      ),
    ],
  ),

  written(
    'state-snapshot',
    'State itu Snapshot, Bukan Variabel Biasa',
    13,
    'Satu gagasan yang menyelesaikan sebagian besar kebingungan tentang React.',
    [
      p(
        'Kalau kamu hanya mengingat satu hal dari bab ini, ingat yang ini: **nilai state di dalam satu render tidak akan pernah berubah.** Ia adalah potret, bukan variabel hidup.',
      ),

      h2('Contoh yang membingungkan semua orang'),
      code(
        'tsx',
        `
        const [jumlah, setJumlah] = useState(0);

        function tambah() {
          setJumlah(jumlah + 1);
          console.log(jumlah);      // 0 — bukan 1
        }
        `,
      ),
      callout(
        'info',
        'Bukan karena `setJumlah` asinkron',
        'Penjelasan "setState itu asinkron jadi belum sempat berubah" salah, dan menyesatkan. `jumlah` adalah **konstanta** untuk render ini. Ia tidak akan pernah menjadi 1, berapa lama pun kamu menunggu. Nilai 1 hanya ada di render **berikutnya**, sebagai konstanta baru.',
      ),

      h2('Model mentalnya'),
      code(
        'tsx',
        `
        // Bayangkan tiap render menghasilkan salinan fungsinya sendiri:

        // Render 1
        function Penghitung() {
          const jumlah = 0;                     // konstanta untuk render ini
          function tambah() { setJumlah(0 + 1); }
          return <button onClick={tambah}>0</button>;
        }

        // Render 2 (setelah setJumlah)
        function Penghitung() {
          const jumlah = 1;                     // konstanta BARU
          function tambah() { setJumlah(1 + 1); }
          return <button onClick={tambah}>1</button>;
        }
        `,
      ),
      p(
        'Setiap render punya nilai state, handler, dan variabel lokalnya sendiri. Handler dari render 1 selamanya melihat `jumlah` bernilai 0 — itu closure, persis yang kamu pelajari di Frontend Basic 1.8.',
      ),

      h2('Konsekuensi 1: tiga panggilan tidak menambah tiga'),
      code(
        'tsx',
        `
        function tambahTiga() {
          setJumlah(jumlah + 1);    // jumlah = 0 -> minta jadi 1
          setJumlah(jumlah + 1);    // jumlah TETAP 0 -> minta jadi 1
          setJumlah(jumlah + 1);    // jumlah TETAP 0 -> minta jadi 1
        }
        // Hasil: 1, bukan 3
        `,
      ),
      code(
        'tsx',
        `
        // Perbaikannya: bentuk updater menerima nilai TERBARU, bukan snapshot
        function tambahTiga() {
          setJumlah((n) => n + 1);   // 0 -> 1
          setJumlah((n) => n + 1);   // 1 -> 2
          setJumlah((n) => n + 1);   // 2 -> 3
        }
        // Hasil: 3
        `,
      ),

      h2('Konsekuensi 2: `setTimeout` melihat nilai lama'),
      code(
        'tsx',
        `
        function kirimTertunda() {
          setTimeout(() => {
            alert(\`Mengirim: \${pesan}\`);    // nilai saat tombol DITEKAN
          }, 3000);
        }

        // Tekan tombol, lalu ubah teks selama tiga detik.
        // Alert tetap menampilkan teks yang lama — dan itu BENAR:
        // pengguna menekan kirim untuk teks itu, bukan untuk teks yang belakangan.
        `,
      ),
      callout(
        'tip',
        'Perilaku ini sering justru yang kamu inginkan',
        'Kalau kamu butuh nilai terbaru, `useRef` menyediakannya — tapi tanyakan dulu: apakah pengguna memang bermaksud mengirim yang terbaru, atau yang ada saat ia menekan tombol? Seringkali yang kedua.',
      ),

      h2('Konsekuensi 3: state tidak berubah di tengah handler'),
      code(
        'tsx',
        `
        async function simpan() {
          setMemuat(true);

          if (memuat) return;         // SELALU false di render ini —
                                       // penjaga ini tidak pernah bekerja

          await kirim();
          setMemuat(false);
        }
        `,
      ),
      code(
        'tsx',
        `
        // Perbaikan: pakai ref untuk penjaga yang harus langsung berlaku
        const sedangKirim = useRef(false);

        async function simpan() {
          if (sedangKirim.current) return;
          sedangKirim.current = true;    // langsung berlaku, tanpa menunggu render

          setMemuat(true);
          try {
            await kirim();
          } finally {
            sedangKirim.current = false;
            setMemuat(false);
          }
        }
        `,
      ),

      h2('Aturan praktisnya'),
      table(
        ['Situasi', 'Pakai'],
        [
          ['Nilai baru tidak bergantung yang lama', '`setX(nilai)`'],
          ['Nilai baru dihitung dari yang lama', '**`setX(prev => …)`**'],
          ['Beberapa pembaruan dalam satu event', '**`setX(prev => …)`**'],
          ['Butuh nilai terbaru di dalam `setTimeout`', '`useRef`'],
          ['Penjaga yang harus langsung berlaku', '`useRef`'],
        ],
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'State adalah konstanta untuk satu render, bukan variabel yang berubah.',
        'Membaca state setelah `setState` memberi nilai lama — dan itu bukan soal asinkron.',
        'Bentuk updater menerima nilai terbaru; bentuk nilai memakai snapshot.',
        'Handler menangkap nilai saat ia dibuat — itu closure, bukan bug.',
        'Penjaga yang harus langsung berlaku memakai `useRef`, bukan state.',
      ),
    ],
  ),

  written(
    'batching-updater',
    'Batching & Updater Function',
    12,
    'Beberapa pembaruan dalam satu event — dan kapan bentuk updater wajib.',
    [
      h2('Batching'),
      code(
        'tsx',
        `
        function tangani() {
          setA(1);
          setB(2);
          setC(3);
        }
        // React menunggu handler selesai, lalu merender SATU KALI.
        // Bukan tiga kali. Ini yang membuat React tetap cepat tanpa kamu mengaturnya.
        `,
      ),
      callout(
        'info',
        'Sejak React 18, batching berlaku di mana saja',
        'Sebelumnya batching hanya terjadi di dalam event handler React. Di dalam `setTimeout`, `fetch().then()`, atau listener DOM asli, tiap `setState` memicu render tersendiri. React 18 menyamakannya — sekarang semuanya di-batch.',
      ),
      code(
        'tsx',
        `
        // React 17: dua render.  React 18+: satu render.
        setTimeout(() => {
          setA(1);
          setB(2);
        }, 0);
        `,
      ),

      h2('Kapan updater wajib'),
      code(
        'tsx',
        `
        // Wajib: nilai baru bergantung nilai lama
        setJumlah((n) => n + 1);
        setDaftar((d) => [...d, baru]);
        setTerbuka((t) => !t);

        // Boleh nilai langsung: tidak bergantung yang lama
        setNama(e.target.value);
        setDipilih(id);
        setError(null);
        `,
      ),

      h2('Kasus yang benar-benar menggigit'),
      code(
        'tsx',
        `
        // Dua sumber menambah item ke daftar yang sama
        function tambahDariForm(item) {
          setDaftar([...daftar, item]);        // memakai snapshot
        }

        socket.on('item-baru', (item) => {
          setDaftar([...daftar, item]);        // memakai snapshot yang SAMA
        });

        // Kalau keduanya terjadi berdekatan, satu item HILANG —
        // keduanya membangun array dari daftar lama yang sama.
        `,
      ),
      code(
        'tsx',
        `
        // Perbaikan: keduanya memakai updater
        setDaftar((d) => [...d, item]);
        `,
      ),
      callout(
        'danger',
        'Bug ini muncul acak dan sangat sulit direproduksi',
        'Ia hanya terjadi saat dua pembaruan kebetulan berdekatan — sering di jaringan cepat, tidak di jaringan lambat, dan hampir tidak pernah saat kamu sedang mengujinya. Memakai updater sebagai kebiasaan menutup seluruh kelas bug ini sebelum ia sempat muncul.',
      ),

      h2('Membaca hasil pembaruan'),
      code(
        'tsx',
        `
        // TIDAK BISA: tidak ada callback seperti setState kelas
        setJumlah(1, () => console.log('selesai'));    // tidak didukung

        // Kalau butuh bereaksi terhadap nilai baru, hitung saja:
        const baru = jumlah + 1;
        setJumlah(baru);
        laporkan(baru);        // pakai nilai yang kamu hitung sendiri

        // Kalau reaksinya harus setelah DOM diperbarui -> useEffect (Bab 7)
        `,
      ),

      h2('Set nilai yang sama tidak memicu render'),
      code(
        'tsx',
        `
        const [n, setN] = useState(0);
        setN(0);      // React membandingkan dengan Object.is -> sama -> tidak render

        const [o, setO] = useState({ a: 1 });
        setO({ a: 1 });   // objek BARU -> referensi beda -> TETAP render
        `,
      ),
      p('Ini alasan lain kenapa immutability penting: React membandingkan referensi, bukan isi.'),

      divider,
      h2('Rangkuman'),
      ul(
        'Semua `setState` dalam satu tugas di-batch jadi satu render.',
        'Sejak React 18, batching berlaku juga di `setTimeout` dan `then`.',
        'Pakai updater setiap kali nilai baru dihitung dari yang lama.',
        'Dua sumber yang memakai snapshot yang sama akan saling menimpa.',
        'Tidak ada callback setelah `setState` — hitung nilainya sendiri.',
      ),
    ],
  ),

  written(
    'update-immutable',
    'Memperbarui Object & Array secara Immutable',
    13,
    'Kenapa `push` tidak memicu render — dan cara memperbarui data bersarang tanpa mutasi.',
    [
      h2('Kenapa mutasi tidak bekerja'),
      code(
        'tsx',
        `
        const [daftar, setDaftar] = useState([1, 2, 3]);

        function tambah() {
          daftar.push(4);        // isinya berubah...
          setDaftar(daftar);     // ...tapi REFERENSINYA sama
        }
        // React: Object.is(lama, baru) -> true -> tidak ada yang berubah -> tidak render
        `,
      ),
      callout(
        'info',
        'React membandingkan referensi, bukan isi',
        'Membandingkan isi objek besar di setiap pembaruan akan jauh lebih mahal daripada render itu sendiri. Perbandingan referensi berbiaya konstan — dan harganya adalah kamu harus membuat objek baru saat datanya berubah.',
      ),

      h2('Array'),
      code(
        'tsx',
        `
        // Tambah
        setDaftar((d) => [...d, baru]);
        setDaftar((d) => [baru, ...d]);                        // di awal

        // Hapus
        setDaftar((d) => d.filter((x) => x.id !== id));

        // Ubah satu
        setDaftar((d) => d.map((x) => (x.id === id ? { ...x, selesai: true } : x)));

        // Sisipkan di posisi
        setDaftar((d) => [...d.slice(0, i), baru, ...d.slice(i)]);

        // Urutkan — toSorted, BUKAN sort
        setDaftar((d) => d.toSorted((a, b) => a.nama.localeCompare(b.nama, 'id')));

        // Ganti berdasarkan indeks
        setDaftar((d) => d.with(i, baru));
        `,
      ),
      table(
        ['Jangan pakai (mutasi)', 'Pakai ini'],
        [
          ['`push`, `unshift`', '`[...d, x]`, `[x, ...d]`'],
          ['`pop`, `shift`', '`d.slice(0, -1)`, `d.slice(1)`'],
          ['`splice`', '`d.toSpliced(...)`'],
          ['`sort`', '`d.toSorted(...)`'],
          ['`reverse`', '`d.toReversed()`'],
          ['`d[i] = x`', '`d.with(i, x)`'],
        ],
      ),

      h2('Object'),
      code(
        'tsx',
        `
        setForm((f) => ({ ...f, email: nilai }));

        // Kunci dinamis
        setForm((f) => ({ ...f, [field]: nilai }));

        // Menghapus satu field
        setForm((f) => {
          const { email, ...sisa } = f;
          return sisa;
        });
        `,
      ),

      h2('Bersarang — bagian yang menyakitkan'),
      code(
        'tsx',
        `
        // Setiap tingkat yang berubah harus disalin
        setState((s) => ({
          ...s,
          pengaturan: {
            ...s.pengaturan,
            notifikasi: {
              ...s.pengaturan.notifikasi,
              email: true,
            },
          },
        }));
        `,
      ),
      callout(
        'warning',
        'Kalau kamu menulis ini lebih dari sekali, bentuk state-mu yang salah',
        'State bersarang dalam adalah tanda ia harus diratakan atau dipecah. `useState` terpisah untuk `pengaturan` sudah menghapus satu tingkat, dan biasanya itu sudah cukup.',
      ),
      code(
        'tsx',
        `
        // Ratakan: dari objek bersarang jadi peta berdasarkan id
        // SEBELUM
        const [data, setData] = useState({ tugas: [{ id, sub: [{ id, judul }] }] });

        // SESUDAH
        const [tugas, setTugas] = useState<Record<string, Tugas>>({});
        const [subtugas, setSubtugas] = useState<Record<string, Subtugas>>({});

        // Memperbarui jadi satu tingkat
        setSubtugas((s) => ({ ...s, [id]: { ...s[id], judul: baru } }));
        `,
      ),

      h2('Immer, kalau memang perlu'),
      code(
        'tsx',
        `
        import { produce } from 'immer';

        setState(produce((draft) => {
          draft.pengaturan.notifikasi.email = true;    // terlihat seperti mutasi
        }));
        // Immer menghasilkan objek baru di balik layar.
        `,
      ),
      callout(
        'tip',
        'Ratakan dulu sebelum menambah pustaka',
        'Immer menyelesaikan gejalanya. Kalau state-mu bersarang lima tingkat, masalah sebenarnya adalah bentuk datanya — dan meratakannya juga mempercepat pencarian, memudahkan pembaruan sebagian, serta menyederhanakan tes.',
      ),

      h2('Yang boleh dimutasi'),
      code(
        'tsx',
        `
        // Objek yang baru kamu buat, sebelum masuk ke state — aman
        function tambahBanyak(baru) {
          const salinan = [...daftar];
          for (const x of baru) salinan.push(x);   // salinan lokal, belum jadi state
          setDaftar(salinan);
        }

        // Nilai di dalam ref — memang untuk dimutasi
        hitungRef.current += 1;
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'React membandingkan referensi — mutasi tidak terlihat sebagai perubahan.',
        'Pakai method yang mengembalikan array baru: `toSorted`, `toSpliced`, `with`.',
        'Spread satu tingkat untuk objek; tiap tingkat bersarang harus ikut disalin.',
        'State bersarang dalam adalah tanda bentuk datanya perlu diratakan.',
        'Objek yang belum masuk state boleh dimutasi.',
      ),
    ],
  ),

  written(
    'event-handler-react',
    'Event Handler di React vs DOM',
    11,
    'Perbedaan yang halus tapi nyata — dan cara mengoper argumen dengan benar.',
    [
      h2('Perbandingan'),
      compare(
        {
          title: 'DOM',
          lang: 'js',
          code: `
            const btn = document.querySelector('#simpan');
            btn.addEventListener('click', tangani);
            btn.removeEventListener('click', tangani);
          `,
          notes: ['Harus dipasang dan dilepas sendiri'],
        },
        {
          title: 'React',
          lang: 'tsx',
          code: `
            <button onClick={tangani}>Simpan</button>
          `,
          notes: ['Dipasang dan dilepas otomatis'],
        },
      ),

      h2('Mengoper vs memanggil'),
      code(
        'tsx',
        `
        <button onClick={hapus} />              // BENAR: dioper
        <button onClick={hapus()} />            // SALAH: dipanggil saat render
        <button onClick={() => hapus(id)} />    // BENAR: butuh argumen
        `,
      ),
      callout(
        'danger',
        'Gejala `onClick={hapus()}` sangat membingungkan',
        'Fungsinya berjalan **saat halaman dimuat**, bukan saat diklik. Kalau ia memanggil `setState`, kamu mendapat render tak berujung. Kalau ia menghapus data, data terhapus tanpa ada yang mengklik apa pun.',
      ),

      h2('Synthetic event'),
      code(
        'tsx',
        `
        function tangani(e: React.MouseEvent<HTMLButtonElement>) {
          e.preventDefault();
          e.stopPropagation();
          e.target;              // yang benar-benar diklik
          e.currentTarget;       // elemen tempat handler dipasang
          e.nativeEvent;         // event DOM aslinya, kalau butuh
        }
        `,
      ),
      p(
        'React membungkus event asli demi konsistensi antar browser. API-nya hampir identik dengan yang kamu pelajari di Frontend Basic 4.7 — termasuk perbedaan `target` dan `currentTarget`.',
      ),

      h2('Di mana React memasang listener'),
      callout(
        'info',
        'Sejak React 17, listener dipasang di container root',
        'Bukan di `document`, dan bukan di tiap elemen. Ini penting kalau kamu mencampur React dengan kode DOM lain: `stopPropagation` di listener DOM asli yang dipasang di `document` **tidak akan** menghentikan handler React, karena React sudah menerimanya lebih dulu di root.',
      ),

      h2('Handler yang butuh data baris'),
      code(
        'tsx',
        `
        // Cara 1: closure — paling langsung
        {items.map((i) => (
          <button key={i.id} onClick={() => hapus(i.id)}>Hapus</button>
        ))}

        // Cara 2: data attribute + satu handler — mirip event delegation Bab 4
        <ul onClick={(e) => {
          const id = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')?.dataset.id;
          if (id) hapus(id);
        }}>
          {items.map((i) => (
            <li key={i.id} data-id={i.id}>
              <button>Hapus</button>
            </li>
          ))}
        </ul>
        `,
      ),
      p(
        'Cara 1 hampir selalu lebih jelas di React. Cara 2 berguna untuk daftar sangat panjang, tapi kehilangan keamanan tipe.',
      ),

      h2('Event yang tidak ada di React'),
      code(
        'tsx',
        `
        // Sebagian event hanya ada di DOM — pasang manual lewat useEffect
        useEffect(() => {
          function onResize() { setLebar(window.innerWidth); }

          window.addEventListener('resize', onResize, { passive: true });
          return () => window.removeEventListener('resize', onResize);
        }, []);
        `,
      ),
      callout(
        'warning',
        'Listener manual wajib dibersihkan',
        'Tanpa fungsi cleanup, listener bertumpuk setiap kali komponen dipasang ulang — dan menahan seluruh closure-nya di memori. Ini kebocoran memori paling umum di aplikasi React.',
      ),

      h2('`preventDefault` yang sering diperlukan'),
      code(
        'tsx',
        `
        <form onSubmit={(e) => { e.preventDefault(); kirim(); }}>
        <a href="#" onClick={(e) => { e.preventDefault(); buka(); }}>
        <div onDragOver={(e) => e.preventDefault()}>   {/* supaya onDrop terpicu */}
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'React memasang dan melepas listener otomatis.',
        '`onClick={fn}` mengoper; `onClick={fn()}` memanggil saat render.',
        'Synthetic event membungkus event asli; `nativeEvent` tetap tersedia.',
        'Listener yang dipasang manual wajib dibersihkan.',
        'Event handler menangkap nilai state dari render tempat ia dibuat.',
      ),
    ],
  ),

  written(
    'controlled-uncontrolled',
    'Controlled vs Uncontrolled Input',
    12,
    'Dua cara mengelola nilai input — dan kapan masing-masing tepat.',
    [
      h2('Controlled'),
      code(
        'tsx',
        `
        const [nilai, setNilai] = useState('');

        <input value={nilai} onChange={(e) => setNilai(e.target.value)} />
        `,
      ),
      p(
        'React memegang sumber kebenarannya. Setiap ketikan memicu render, dan nilai yang tampil selalu berasal dari state.',
      ),

      h2('Uncontrolled'),
      code(
        'tsx',
        `
        const ref = useRef<HTMLInputElement>(null);

        <input ref={ref} defaultValue="awal" />

        function kirim() {
          console.log(ref.current?.value);    // dibaca saat dibutuhkan
        }
        `,
      ),
      p(
        'DOM yang memegangnya. Tidak ada render saat mengetik, dan kamu membacanya hanya saat perlu.',
      ),

      h2('Memilih'),
      table(
        ['Kebutuhan', 'Pakai'],
        [
          ['Validasi sambil mengetik', '**Controlled**'],
          ['Tombol nonaktif sampai valid', '**Controlled**'],
          ['Memformat saat mengetik (angka, telepon)', '**Controlled**'],
          ['Nilai memengaruhi tampilan lain', '**Controlled**'],
          ['Form besar yang dibaca sekali saat submit', '**Uncontrolled**'],
          ['Input file', '**Uncontrolled** — wajib'],
          ['Integrasi dengan pustaka non-React', 'Uncontrolled'],
        ],
      ),
      callout(
        'warning',
        'Input file selalu uncontrolled',
        '`<input type="file" value={x} />` tidak diizinkan — karena kalau bisa, halaman mana pun dapat menetapkan berkas mana yang "sudah dipilih" pengguna tanpa dialog. Baca lewat `ref` atau dari `e.target.files`.',
      ),

      h2('Peringatan yang paling sering muncul'),
      code(
        'tsx',
        `
        // "A component is changing an uncontrolled input to be controlled"
        const [nilai, setNilai] = useState();          // undefined -> uncontrolled
        <input value={nilai} onChange={…} />           // lalu jadi string -> controlled

        // Perbaikan: mulai dari string kosong
        const [nilai, setNilai] = useState('');
        `,
      ),
      code(
        'tsx',
        `
        // "You provided a value prop without an onChange handler"
        <input value={nilai} />                        // read-only tanpa disengaja

        <input value={nilai} onChange={…} />           // benar
        <input value={nilai} readOnly />               // atau memang read-only
        `,
      ),
      code(
        'tsx',
        `
        // Data dari API yang datang belakangan
        const [nama, setNama] = useState('');
        // JANGAN: value={pengguna?.nama ?? ''} lalu berubah jadi controlled/uncontrolled
        // BENAR: isi state-nya saat data tiba, atau pakai key untuk mereset komponen
        <FormProfil key={pengguna?.id} pengguna={pengguna} />
        `,
      ),

      h2('Checkbox, radio, select'),
      code(
        'tsx',
        `
        <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
        <input type="radio" name="p" value="a" checked={pilih === 'a'} onChange={() => setPilih('a')} />
        <select value={kota} onChange={(e) => setKota(e.target.value)}>…</select>
        <select multiple value={terpilih} onChange={(e) =>
          setTerpilih([...e.target.selectedOptions].map((o) => o.value))
        }>
        `,
      ),
      p(
        'Checkbox memakai `checked`, bukan `value`. Ini penyebab "kenapa centangnya tidak berubah" yang paling sering.',
      ),

      h2('Form besar: uncontrolled + `FormData`'),
      code(
        'tsx',
        `
        function onSubmit(e: React.FormEvent<HTMLFormElement>) {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          kirim(data);
        }

        <form onSubmit={onSubmit}>
          <input name="nama" defaultValue={awal.nama} />
          <input name="email" type="email" defaultValue={awal.email} />
          <button type="submit">Simpan</button>
        </form>
        `,
      ),
      callout(
        'tip',
        'Dua puluh field controlled berarti dua puluh render per ketikan',
        'Untuk form panjang yang hanya dibaca saat submit, uncontrolled + `FormData` jauh lebih ringan dan kodenya lebih sedikit. Ini juga cara React Hook Form bekerja di balik layar (sub-bab 4.7).',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Controlled: React sumber kebenarannya, render tiap ketikan.',
        'Uncontrolled: DOM yang memegang, dibaca saat dibutuhkan.',
        'Input file selalu uncontrolled.',
        'Mulai state dari `""`, bukan `undefined`.',
        'Checkbox memakai `checked`, bukan `value`.',
        'Form besar yang dibaca sekali: uncontrolled + `FormData`.',
      ),
    ],
  ),

  written(
    'form-react',
    'Form: dari `useState` ke React Hook Form',
    13,
    'Dari form sederhana ke form yang benar-benar dipakai — beserta alasan pindahnya.',
    [
      h2('Tahap 1: `useState` per field'),
      code(
        'tsx',
        `
        const [nama, setNama] = useState('');
        const [email, setEmail] = useState('');

        <input value={nama} onChange={(e) => setNama(e.target.value)} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
        `,
      ),
      p(
        'Cukup untuk dua sampai tiga field. Di atas itu, jumlah barisnya tumbuh lebih cepat daripada manfaatnya.',
      ),

      h2('Tahap 2: satu objek'),
      code(
        'tsx',
        `
        const [form, setForm] = useState({ nama: '', email: '' });

        function ubah(e: React.ChangeEvent<HTMLInputElement>) {
          const { name, value } = e.target;
          setForm((f) => ({ ...f, [name]: value }));
        }

        <input name="nama" value={form.nama} onChange={ubah} />
        <input name="email" value={form.email} onChange={ubah} />
        `,
      ),
      callout(
        'warning',
        'Setiap ketikan me-render ulang SELURUH form',
        'Dengan sepuluh field, satu huruf yang diketik merender sepuluh input. Biasanya masih terasa cepat — sampai ada field yang menghitung sesuatu di setiap render.',
      ),

      h2('Tahap 3: validasi dan sentuhan'),
      code(
        'tsx',
        `
        const [form, setForm] = useState({ nama: '', email: '' });
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [pernahSubmit, setPernahSubmit] = useState(false);

        function validasi(f: typeof form) {
          const e: Record<string, string> = {};
          if (!f.nama.trim()) e.nama = 'Nama wajib diisi';
          if (!f.email.includes('@')) e.email = 'Format email tidak valid';
          return e;
        }

        function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
          ev.preventDefault();
          setPernahSubmit(true);

          const e = validasi(form);
          setErrors(e);

          if (Object.keys(e).length > 0) {
            ev.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            return;
          }

          kirim(form);
        }
        `,
      ),
      p(
        'Perhatikan berapa banyak yang sudah kamu tulis sendiri: nilai, error, status pernah-submit, fokus ke error pertama. Dan belum ada penanganan pengiriman ganda atau error dari server.',
      ),

      h2('Tahap 4: React Hook Form + skema'),
      code('bash', `npm install react-hook-form zod @hookform/resolvers`),
      code(
        'tsx',
        `
        import { useForm } from 'react-hook-form';
        import { zodResolver } from '@hookform/resolvers/zod';
        import { z } from 'zod';

        const skema = z.object({
          nama: z.string().min(1, 'Nama wajib diisi'),
          email: z.string().email('Format email tidak valid'),
          umur: z.coerce.number().int().min(17, 'Minimal 17 tahun'),
        });

        type Data = z.infer<typeof skema>;     // tipe dihasilkan dari skema

        export function FormDaftar() {
          const {
            register,
            handleSubmit,
            setError,
            formState: { errors, isSubmitting },
          } = useForm<Data>({ resolver: zodResolver(skema) });

          async function onSubmit(data: Data) {
            try {
              await kirim(data);
            } catch (e) {
              // Error dari server dipetakan ke fieldnya
              if (e.field) setError(e.field, { message: e.message });
              else setError('root', { message: 'Gagal mengirim. Coba lagi.' });
            }
          }

          return (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Field label="Nama" error={errors.nama?.message} {...register('nama')} />
              <Field label="Email" type="email" error={errors.email?.message} {...register('email')} />

              {errors.root && <p role="alert">{errors.root.message}</p>}

              <Button type="submit" memuat={isSubmitting}>Daftar</Button>
            </form>
          );
        }
        `,
      ),
      table(
        ['Yang kamu dapat', 'Sebelumnya harus ditulis sendiri'],
        [
          ['Uncontrolled — tidak render tiap ketikan', 'Ya'],
          ['Validasi dari skema', 'Ya'],
          ['Tipe dihasilkan dari skema', 'Ya'],
          ['`isSubmitting` untuk mencegah kirim ganda', 'Ya'],
          ['Error dari server dipetakan ke field', 'Ya'],
          ['Fokus ke error pertama', 'Ya'],
        ],
      ),

      h2('Skema yang sama di server'),
      code(
        'ts',
        `
        // Skema Zod bisa dipakai di kedua sisi — satu sumber kebenaran
        import { skema } from '@/lib/skema/daftar';

        export async function POST(req: Request) {
          const hasil = skema.safeParse(await req.json());

          if (!hasil.success) {
            return Response.json({ errors: hasil.error.flatten() }, { status: 422 });
          }

          // hasil.data sudah bertipe dan tervalidasi
        }
        `,
      ),
      callout(
        'danger',
        'Validasi klien tetap bukan pengaman',
        'Siapa pun bisa memanggil endpointmu dengan `curl` tanpa membuka halamanmu sama sekali. Skema yang sama **wajib** dijalankan di server. Yang dihemat adalah menulisnya dua kali, bukan menjalankannya dua kali.',
      ),

      h2('Kapan tetap pakai `useState`'),
      ul(
        'Satu atau dua field (kotak pencarian, filter).',
        'Form yang nilainya memengaruhi tampilan lain secara langsung.',
        'Kamu sedang belajar — tulis manual dulu sekali supaya tahu apa yang diotomatiskan.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`useState` cukup sampai dua-tiga field.',
        'Satu objek state merender seluruh form di tiap ketikan.',
        'React Hook Form memakai uncontrolled — tidak render saat mengetik.',
        'Skema Zod menghasilkan tipe sekaligus validasi, dan bisa dipakai di server.',
        'Validasi server tetap wajib, apa pun yang dilakukan klien.',
      ),
    ],
  ),

  written(
    'lifting-state',
    'Lifting State Up',
    12,
    'Menaikkan state ke induk terdekat yang membutuhkannya — dan biaya menaikkannya terlalu tinggi.',
    [
      h2('Masalahnya'),
      code(
        'tsx',
        `
        function Suhu() {
          const [c, setC] = useState('');
          return <input value={c} onChange={(e) => setC(e.target.value)} />;
        }

        function App() {
          return (
            <>
              <Suhu />     {/* Celsius */}
              <Suhu />     {/* Fahrenheit — tidak tahu apa-apa tentang yang pertama */}
            </>
          );
        }
        `,
      ),
      p(
        'Dua komponen bersaudara tidak bisa saling melihat state-nya. Solusinya: naikkan ke induk terdekat yang memuat keduanya.',
      ),

      h2('Setelah dinaikkan'),
      code(
        'tsx',
        `
        function Suhu({ nilai, satuan, onUbah }) {
          return (
            <label>
              {satuan}
              <input value={nilai} onChange={(e) => onUbah(e.target.value)} />
            </label>
          );
        }

        function App() {
          const [nilai, setNilai] = useState('');
          const [satuan, setSatuan] = useState<'c' | 'f'>('c');

          const celsius = satuan === 'c' ? nilai : konversi(nilai, 'f', 'c');
          const fahrenheit = satuan === 'f' ? nilai : konversi(nilai, 'c', 'f');

          return (
            <>
              <Suhu satuan="C" nilai={celsius} onUbah={(v) => { setNilai(v); setSatuan('c'); }} />
              <Suhu satuan="F" nilai={fahrenheit} onUbah={(v) => { setNilai(v); setSatuan('f'); }} />
            </>
          );
        }
        `,
      ),
      callout(
        'tip',
        'Perhatikan: hanya SATU nilai yang disimpan',
        'Menyimpan `celsius` dan `fahrenheit` sebagai dua state berarti keduanya harus disinkronkan manual — dan cepat atau lambat akan menyimpang. Simpan satu, hitung yang lain. Ini state turunan, dibahas di sub-bab 4.9.',
      ),

      h2('Sampai mana harus naik'),
      ol(
        'Temukan **semua** komponen yang membaca atau mengubah nilai itu.',
        'Cari **induk bersama terdekat** dari semuanya.',
        'Taruh state di sana — **tidak lebih tinggi**.',
      ),
      callout(
        'danger',
        'Menaikkan terlalu tinggi punya biaya nyata',
        'State di komponen akar berarti setiap perubahannya merender ulang seluruh pohon. Selain itu, komponen-komponen di antaranya jadi harus meneruskan props yang tidak mereka pakai — prop drilling. Naikkan seperlunya, tidak lebih.',
      ),

      h2('Menaikkan bukan satu-satunya jawaban'),
      table(
        ['Situasi', 'Solusi'],
        [
          ['Dua komponen bersaudara berdekatan', '**Lifting state**'],
          ['Melewati banyak lapisan yang tidak memakainya', 'Composition (`children`)'],
          ['Dibutuhkan banyak cabang berjauhan', 'Context'],
          ['Harus bisa dibagikan lewat tautan', 'URL (`searchParams`)'],
          ['Sumber kebenarannya di server', 'Cache server (TanStack Query)'],
        ],
      ),

      h2('Composition sebagai alternatif'),
      code(
        'tsx',
        `
        // Prop drilling: pengguna melewati tiga lapisan
        <Layout pengguna={p}><Sidebar pengguna={p}><Menu pengguna={p} /></Sidebar></Layout>

        // Composition: dirakit di tempat datanya ada
        <Layout sidebar={<Sidebar><Menu pengguna={p} /></Sidebar>} />
        `,
      ),

      h2('Menurunkan state kembali'),
      code(
        'tsx',
        `
        // Kalau ternyata hanya satu komponen yang memakainya, TURUNKAN.
        // Sisa state di induk yang tidak lagi dipakai adalah utang:
        // ia tetap merender ulang seluruh cabang untuk perubahan yang
        // sebenarnya hanya dipedulikan satu komponen.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Naikkan ke induk bersama terdekat — tidak lebih tinggi.',
        'Simpan satu nilai, hitung turunannya; jangan menyimpan keduanya.',
        'Composition sering mengalahkan lifting untuk masalah prop drilling.',
        'State yang tidak lagi dipakai bersama harus diturunkan kembali.',
      ),
    ],
  ),

  written(
    'derived-state',
    'State Turunan — yang bisa dihitung jangan disimpan',
    12,
    'Sumber bug "dua nilai yang tidak sinkron" — dan cara menghapusnya sepenuhnya.',
    [
      h2('Masalahnya'),
      code(
        'tsx',
        `
        const [items, setItems] = useState<Item[]>([]);
        const [total, setTotal] = useState(0);          // TURUNAN — jangan disimpan
        const [jumlah, setJumlah] = useState(0);        // TURUNAN juga

        function tambah(item: Item) {
          setItems((i) => [...i, item]);
          setTotal((t) => t + item.harga);              // harus ingat
          setJumlah((j) => j + 1);                      // harus ingat
        }

        function hapus(id: string) {
          setItems((i) => i.filter((x) => x.id !== id));
          // ...dan lupa memperbarui total dan jumlah.
          // Sekarang keranjang menampilkan angka yang salah.
        }
        `,
      ),
      callout(
        'danger',
        'Ini bukan bug yang bisa diperbaiki dengan lebih teliti',
        'Setiap tempat baru yang mengubah `items` menambah dua baris yang harus diingat. Cepat atau lambat ada yang terlewat — dan gejalanya muncul di tempat lain, jauh dari penyebabnya.',
      ),

      h2('Perbaikannya: hitung saat render'),
      code(
        'tsx',
        `
        const [items, setItems] = useState<Item[]>([]);

        const total = items.reduce((t, i) => t + i.harga, 0);
        const jumlah = items.length;
        const adaYangMahal = items.some((i) => i.harga > 1_000_000);

        // Tidak mungkin tidak sinkron — mereka DIHITUNG dari sumbernya.
        `,
      ),
      p(
        'Satu state, nol sinkronisasi, nol kemungkinan menyimpang. Setiap tempat yang mengubah `items` otomatis benar.',
      ),

      h2('Cara mengenalinya'),
      ol(
        'Bisakah nilai ini dihitung dari state lain? → **turunan**',
        'Apakah ada `useEffect` yang tugasnya hanya menyalin satu state ke state lain? → **turunan**',
        'Apakah kamu harus memperbarui dua state bersamaan supaya tetap benar? → **turunan**',
      ),
      code(
        'tsx',
        `
        // Anti-pola paling umum di React
        const [items, setItems] = useState([]);
        const [terfilter, setTerfilter] = useState([]);

        useEffect(() => {
          setTerfilter(items.filter((i) => i.aktif));
        }, [items]);

        // Perbaikan: satu baris, tanpa efek, tanpa render tambahan
        const terfilter = items.filter((i) => i.aktif);
        `,
      ),
      callout(
        'warning',
        'Effect yang menyalin state selalu terlambat satu render',
        'Render pertama menampilkan nilai lama, effect berjalan, lalu render kedua menampilkan yang benar. Pengguna bisa melihat kedipan — dan kamu membayar dua render untuk sesuatu yang bisa dihitung langsung.',
      ),

      h2('Kapan memoisasi diperlukan'),
      code(
        'tsx',
        `
        // Tidak perlu — filter atas seratus item jauh lebih murah daripada satu render
        const terfilter = items.filter((i) => i.aktif);

        // Perlu — perhitungan yang benar-benar berat
        const hasil = useMemo(() => analisis(sepuluhRibuBaris), [sepuluhRibuBaris]);
        `,
      ),
      callout(
        'info',
        'React Compiler menangani sebagian besarnya',
        'Di React 19 dengan Compiler aktif, perhitungan turunan dimemoisasi otomatis. `useMemo` manual tinggal untuk perhitungan yang benar-benar mahal dan referensi yang dituntut pustaka luar — sub-bab 2.10.',
      ),

      h2('Yang BUKAN turunan'),
      code(
        'tsx',
        `
        // Nilai awal dari props — ini state sungguhan
        const [draft, setDraft] = useState(props.nilaiAwal);
        // Pengguna mengeditnya; ia sengaja TIDAK mengikuti props lagi.

        // Kalau props berubah dan draft HARUS ikut ter-reset, pakai key:
        <FormEdit key={item.id} nilaiAwal={item.judul} />
        `,
      ),
      callout(
        'tip',
        '`key` mengalahkan effect untuk mereset state',
        'Alih-alih `useEffect` yang mengawasi props lalu memanggil lima `setState`, ganti `key`-nya. React membuang komponen lama beserta seluruh state-nya. Satu baris, dan tidak mungkin ada state yang terlewat.',
      ),

      h2('Contoh nyata'),
      code(
        'tsx',
        `
        const [tugas, setTugas] = useState<Tugas[]>([]);
        const [filter, setFilter] = useState<'semua' | 'aktif' | 'selesai'>('semua');
        const [cari, setCari] = useState('');

        // SEMUA di bawah ini turunan — nol kemungkinan menyimpang
        const terlihat = tugas
          .filter((t) => (filter === 'semua' ? true : filter === 'aktif' ? !t.selesai : t.selesai))
          .filter((t) => t.judul.toLowerCase().includes(cari.trim().toLowerCase()));

        const selesai = tugas.filter((t) => t.selesai).length;
        const persen = tugas.length === 0 ? 0 : Math.round((selesai / tugas.length) * 100);
        const semuaSelesai = tugas.length > 0 && selesai === tugas.length;
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Nilai yang bisa dihitung dari state lain tidak boleh disimpan.',
        'Effect yang menyalin state adalah tanda paling jelas adanya state turunan.',
        'Effect penyalin selalu terlambat satu render dan bisa terlihat berkedip.',
        'Ganti `key` untuk mereset state, jangan effect yang mengawasi props.',
        'Memoisasi hanya untuk perhitungan yang benar-benar mahal.',
      ),
    ],
  ),

  written(
    'usereducer',
    '`useReducer` untuk State yang Rumit',
    13,
    'Ketika beberapa nilai berubah bersama, dan transisinya punya aturan.',
    [
      h2('Kapan `useState` mulai tidak cukup'),
      code(
        'tsx',
        `
        const [data, setData] = useState(null);
        const [memuat, setMemuat] = useState(false);
        const [error, setError] = useState(null);

        // Tiga boolean/nilai yang saling terkait = 8 kombinasi.
        // Berapa yang valid? Empat.
        // { memuat: true, error: 'x', data: [...] } bisa ditulis, tapi tidak masuk akal.
        `,
      ),

      h2('Reducer membuat keadaan mustahil tidak bisa ditulis'),
      code(
        'tsx',
        `
        type Keadaan =
          | { status: 'idle' }
          | { status: 'memuat' }
          | { status: 'gagal'; pesan: string }
          | { status: 'berhasil'; data: Item[] };

        type Aksi =
          | { tipe: 'muat' }
          | { tipe: 'berhasil'; data: Item[] }
          | { tipe: 'gagal'; pesan: string }
          | { tipe: 'reset' };

        // Fungsi MURNI — bisa diuji tanpa React sama sekali
        function reducer(k: Keadaan, a: Aksi): Keadaan {
          switch (a.tipe) {
            case 'muat':     return { status: 'memuat' };
            case 'berhasil': return { status: 'berhasil', data: a.data };
            case 'gagal':    return { status: 'gagal', pesan: a.pesan };
            case 'reset':    return { status: 'idle' };
          }
        }

        export function Daftar() {
          const [keadaan, dispatch] = useReducer(reducer, { status: 'idle' });

          async function muat() {
            dispatch({ tipe: 'muat' });
            try {
              dispatch({ tipe: 'berhasil', data: await ambil() });
            } catch (e) {
              dispatch({ tipe: 'gagal', pesan: e.message });
            }
          }

          switch (keadaan.status) {
            case 'idle':     return <Mulai onMuat={muat} />;
            case 'memuat':   return <Skeleton />;
            case 'gagal':    return <Error pesan={keadaan.pesan} onCobaLagi={muat} />;
            case 'berhasil': return <Items items={keadaan.data} />;
          }
        }
        `,
      ),
      callout(
        'tip',
        'Perhatikan: TypeScript tahu field apa yang tersedia di tiap cabang',
        '`keadaan.pesan` hanya bisa diakses di cabang `gagal`, dan `keadaan.data` hanya di cabang `berhasil`. Ini discriminated union dari Frontend Basic 6.9, dipakai untuk hal yang paling berguna.',
      ),

      h2('Reducer bisa diuji tanpa React'),
      code(
        'ts',
        `
        import { describe, expect, it } from 'vitest';
        import { reducer } from './reducer';

        describe('reducer daftar', () => {
          it('dari idle ke memuat', () => {
            expect(reducer({ status: 'idle' }, { tipe: 'muat' })).toEqual({ status: 'memuat' });
          });

          it('gagal menyimpan pesannya', () => {
            const k = reducer({ status: 'memuat' }, { tipe: 'gagal', pesan: 'x' });
            expect(k).toEqual({ status: 'gagal', pesan: 'x' });
          });
        });
        `,
      ),
      p(
        'Ini keunggulan terbesarnya: seluruh logika transisi jadi fungsi murni yang bisa diuji tanpa jsdom, tanpa render, tanpa mock.',
      ),

      h2('Memilih'),
      table(
        ['Situasi', 'Pakai'],
        [
          ['Satu nilai berdiri sendiri', '`useState`'],
          ['Beberapa nilai berubah bersama', '**`useReducer`**'],
          ['Transisi punya aturan', '**`useReducer`**'],
          ['Ada kombinasi keadaan yang mustahil', '**`useReducer`**'],
          ['Logikanya perlu diuji terpisah', '**`useReducer`**'],
          ['Nilai berikutnya bergantung beberapa nilai sebelumnya', '**`useReducer`**'],
        ],
      ),

      h2('Aturan reducer'),
      ol(
        '**Murni** — tanpa `fetch`, tanpa `Math.random()`, tanpa `Date.now()`, tanpa menyentuh DOM.',
        '**Immutable** — kembalikan objek baru, jangan mutasi argumennya.',
        '**Selalu mengembalikan keadaan** — cabang `default` melempar error, bukan mengembalikan `undefined`.',
      ),
      code(
        'tsx',
        `
        // SALAH: efek samping di dalam reducer
        case 'simpan':
          fetch('/api', …);                 // JANGAN
          return { ...k, tersimpan: true };

        // BENAR: efek samping di pemanggil
        async function simpan() {
          dispatch({ tipe: 'mulaiSimpan' });
          await fetch('/api', …);
          dispatch({ tipe: 'selesaiSimpan' });
        }
        `,
      ),

      h2('Nilai awal yang mahal'),
      code(
        'tsx',
        `
        // Argumen ketiga: fungsi inisialisasi, dipanggil sekali
        const [keadaan, dispatch] = useReducer(reducer, penggunaId, buatKeadaanAwal);
        `,
      ),

      h2('Bersama Context'),
      code(
        'tsx',
        `
        // Pola umum untuk state yang dibutuhkan banyak cabang
        const KeadaanCtx = createContext<Keadaan | null>(null);
        const DispatchCtx = createContext<React.Dispatch<Aksi> | null>(null);

        // Dipisah menjadi dua context: komponen yang hanya mem-dispatch
        // tidak ikut render saat keadaannya berubah.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`useReducer` saat beberapa nilai berubah bersama atau transisinya punya aturan.',
        'Discriminated union membuat kombinasi keadaan mustahil tidak bisa ditulis.',
        'Reducer wajib murni dan immutable — efek samping ada di pemanggil.',
        'Reducer bisa diuji sebagai fungsi biasa, tanpa React.',
        'Pisahkan context keadaan dan dispatch supaya render lebih hemat.',
      ),
    ],
  ),

  written(
    'empat-keadaan-ui',
    'Empat Keadaan UI',
    12,
    'Loading, kosong, error, sukses — bukan hanya sukses.',
    [
      p(
        'Kamu sudah menemui ini di Frontend Basic Bab 5. Di React ia jadi lebih penting, karena lebih mudah menulis komponen yang hanya menangani keadaan berhasil dan tidak terlihat salah sampai dipakai orang lain.',
      ),

      h2('Empatnya'),
      table(
        ['Keadaan', 'Wajib ada'],
        [
          ['**Memuat**', 'Indikator yang **memesan ruang**'],
          ['**Kosong**', 'Sebabnya + satu langkah lanjutan'],
          ['**Gagal**', 'Pesan yang bisa ditindaklanjuti + cara mencoba lagi'],
          ['**Berhasil**', 'Datanya'],
        ],
      ),

      h2('Memodelkannya di tipe'),
      code(
        'tsx',
        `
        type Keadaan<T> =
          | { status: 'memuat' }
          | { status: 'gagal'; pesan: string }
          | { status: 'berhasil'; data: T };

        // Kombinasi mustahil tidak bisa ditulis:
        // { status: 'memuat', data: [...] }  -> Error saat kompilasi
        `,
      ),

      h2('Merendernya'),
      code(
        'tsx',
        `
        export function DaftarTugas({ keadaan, onCobaLagi, onTambah }: Props) {
          if (keadaan.status === 'memuat') {
            return (
              <div aria-busy="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="mb-2 h-16" />   {/* tinggi = baris asli */}
                ))}
              </div>
            );
          }

          if (keadaan.status === 'gagal') {
            return (
              <div role="alert" className="border-border bg-danger-fill rounded-lg border p-5">
                <p className="text-text">{keadaan.pesan}</p>
                <Button className="mt-3" onClick={onCobaLagi}>Coba lagi</Button>
              </div>
            );
          }

          if (keadaan.data.length === 0) {
            return (
              <div className="border-border rounded-lg border border-dashed p-6">
                <p className="text-text">Belum ada tugas.</p>
                <p className="text-muted mt-1 text-sm">
                  Tambahkan yang pertama untuk mulai melacak pekerjaanmu.
                </p>
                <Button className="mt-4" varian="utama" onClick={onTambah}>
                  Tambah tugas
                </Button>
              </div>
            );
          }

          return <ul>{keadaan.data.map((t) => <Baris key={t.id} tugas={t} />)}</ul>;
        }
        `,
      ),

      h2('Kesalahan yang paling sering'),
      ol(
        '**Skeleton yang tingginya tidak sama** — halaman melompat saat data datang.',
        '**Keadaan kosong tanpa penjelasan** — tidak bisa dibedakan dari halaman rusak.',
        '**Pesan error mentah dari server** — membocorkan detail internal dan tidak bisa ditindaklanjuti.',
        '**Tidak ada cara mencoba lagi** — pengguna terpaksa memuat ulang halaman.',
        '**Menyamakan "belum mencari" dengan "tidak ada hasil"** — dua situasi berbeda.',
      ),
      code(
        'tsx',
        `
        // Bedakan dua keadaan kosong yang berbeda
        {cari
          ? \`Tidak ada hasil untuk "\${cari}". Coba kata kunci lain.\`
          : 'Belum ada data. Mulai dengan menambahkan yang pertama.'}
        `,
      ),

      h2('Kegagalan sebagian'),
      code(
        'tsx',
        `
        // SALAH: satu widget gagal -> seluruh dashboard kosong
        const [a, b, c] = await Promise.all([ambilA(), ambilB(), ambilC()]);

        // BENAR: tiap widget punya keadaannya sendiri
        const hasil = await Promise.allSettled([ambilA(), ambilB(), ambilC()]);
        `,
      ),
      code(
        'tsx',
        `
        // Error Boundary membatasi kerusakan ke satu widget
        <ErrorBoundary fallback={<WidgetGagal />}>
          <Grafik />
        </ErrorBoundary>
        `,
      ),
      callout(
        'warning',
        'Aturan yang mengikat di project ini',
        '`frontend.md` menyatakan: **kegagalan satu widget tidak boleh menjatuhkan seluruh halaman.** Ini bukan saran — halaman kosong karena satu grafik gagal adalah cacat, bukan kompromi yang bisa diterima.',
      ),

      h2('Mengumumkan perubahan keadaan'),
      code(
        'tsx',
        `
        <div aria-live="polite" aria-busy={keadaan.status === 'memuat'}>
          {/* isinya berganti antar keadaan */}
        </div>
        `,
      ),
      p(
        'Tanpa ini, pengguna screen reader tidak tahu bahwa "memuat" sudah berubah menjadi "12 hasil" — layar berubah tanpa ada yang mengumumkannya.',
      ),

      h2('Kapan skeleton justru memperburuk'),
      ul(
        'Operasi yang hampir selalu di bawah 200ms — kedipannya terasa lebih lambat.',
        'Memuat ulang data yang sudah tampil — pertahankan data lama, jangan ganti skeleton.',
        'Aksi yang dipicu pengguna dengan respons lokal — pakai keadaan pada tombolnya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Empat keadaan adalah kewajiban, bukan kemewahan.',
        'Modelkan sebagai discriminated union supaya kombinasi mustahil tidak bisa ditulis.',
        'Skeleton wajib memesan tinggi akhirnya.',
        'Bedakan "belum mencari" dari "tidak ada hasil".',
        'Kegagalan satu widget tidak boleh menjatuhkan halaman.',
        '`aria-live` dan `aria-busy` mengumumkan perubahan keadaan.',
      ),
    ],
  ),

  written(
    'praktik-form-filter',
    'Praktik: Form pencarian + filter dengan keempat keadaan',
    16,
    'Menggabungkan state, event, turunan, dan empat keadaan UI menjadi satu fitur utuh.',
    [
      p(
        'Praktik penutup bab. Fitur ini kecil tapi menyentuh hampir semua yang dipelajari di dua belas sub-bab sebelumnya.',
      ),

      h2('1. Rancang state-nya dulu'),
      code(
        'tsx',
        `
        // State sungguhan — yang tidak bisa dihitung dari yang lain
        const [cari, setCari] = useState('');
        const [filter, setFilter] = useState<Filter>('semua');
        const [halaman, setHalaman] = useState(1);
        const [keadaan, dispatch] = useReducer(reducer, { status: 'memuat' });

        // Turunan — dihitung, TIDAK disimpan
        const semua = keadaan.status === 'berhasil' ? keadaan.data : [];
        const terlihat = saring(semua, { cari, filter });
        const totalHalaman = Math.max(1, Math.ceil(terlihat.length / PER_HALAMAN));
        const halamanAman = Math.min(halaman, totalHalaman);
        const baris = terlihat.slice((halamanAman - 1) * PER_HALAMAN, halamanAman * PER_HALAMAN);
        `,
      ),
      callout(
        'tip',
        'Perhatikan `halamanAman`',
        'Kalau pengguna di halaman 5 lalu mengetik pencarian yang hanya menyisakan 1 halaman, `halaman` masih bernilai 5 dan daftarnya kosong tanpa sebab. Menjepitnya saat render menyelesaikan itu tanpa effect dan tanpa state tambahan.',
      ),

      h2('2. Fungsi penyaring — murni dan bisa diuji'),
      code(
        'ts',
        `
        export type Filter = 'semua' | 'aktif' | 'selesai';

        export function saring(
          items: Tugas[],
          { cari, filter }: { cari: string; filter: Filter },
        ): Tugas[] {
          const q = cari.trim().toLowerCase();

          return items
            .filter((t) =>
              filter === 'semua' ? true : filter === 'aktif' ? !t.selesai : t.selesai,
            )
            .filter((t) => (q === '' ? true : t.judul.toLowerCase().includes(q)));
        }
        `,
        { filename: 'src/lib/saring.ts' },
      ),

      h2('3. Debounce pencarian'),
      code(
        'tsx',
        `
        // Nilai yang tampil di input berubah seketika;
        // nilai yang dipakai menyaring tertunda 250ms.
        const [cari, setCari] = useState('');
        const cariTertunda = useDebounce(cari, 250);

        const terlihat = saring(semua, { cari: cariTertunda, filter });
        `,
      ),
      code(
        'tsx',
        `
        export function useDebounce<T>(nilai: T, jeda: number): T {
          const [tertunda, setTertunda] = useState(nilai);

          useEffect(() => {
            const timer = setTimeout(() => setTertunda(nilai), jeda);
            return () => clearTimeout(timer);      // cleanup WAJIB
          }, [nilai, jeda]);

          return tertunda;
        }
        `,
        { filename: 'src/hooks/useDebounce.ts' },
      ),
      callout(
        'warning',
        'Input tetap controlled tanpa debounce',
        'Kalau kamu men-debounce nilai `value` pada inputnya, ketikan akan terasa tersendat. Debounce yang di-debounce adalah **nilai turunan yang dipakai menyaring**, bukan yang ditampilkan.',
      ),

      h2('4. Merender keempat keadaan'),
      code(
        'tsx',
        `
        <div aria-live="polite" aria-busy={keadaan.status === 'memuat'}>
          {keadaan.status === 'memuat' && <SkeletonDaftar jumlah={PER_HALAMAN} />}

          {keadaan.status === 'gagal' && (
            <div role="alert" className="border-border bg-danger-fill rounded-lg border p-5">
              <p>{keadaan.pesan}</p>
              <Button className="mt-3" onClick={muat}>Coba lagi</Button>
            </div>
          )}

          {keadaan.status === 'berhasil' && baris.length === 0 && (
            <p className="text-muted border-border rounded-lg border border-dashed p-6 text-sm">
              {cariTertunda || filter !== 'semua'
                ? 'Tidak ada tugas yang cocok dengan pencarian atau saringan ini.'
                : 'Belum ada tugas. Tambahkan yang pertama.'}
            </p>
          )}

          {keadaan.status === 'berhasil' && baris.length > 0 && (
            <ul className="divide-border divide-y">
              {baris.map((t) => <Baris key={t.id} tugas={t} />)}
            </ul>
          )}
        </div>
        `,
      ),

      h2('5. Kontrol filter yang bisa diakses'),
      code(
        'tsx',
        `
        <div role="group" aria-label="Saring tugas" className="flex gap-1">
          {(['semua', 'aktif', 'selesai'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setFilter(f); setHalaman(1); }}
              aria-pressed={filter === f}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs transition-colors duration-150',
                filter === f
                  ? 'border-border-strong bg-raised text-text font-medium'
                  : 'border-border text-muted hover:text-text',
              )}
            >
              {f}
            </button>
          ))}
        </div>
        `,
      ),
      p(
        '`aria-pressed` membuat keadaan aktif terbaca teknologi bantu — bukan hanya terlihat lewat warna.',
      ),

      h2('6. Input pencarian'),
      code(
        'tsx',
        `
        <label htmlFor="cari" className="sr-only">Cari tugas</label>
        <input
          id="cari"
          type="search"
          value={cari}
          onChange={(e) => { setCari(e.target.value); setHalaman(1); }}
          autoComplete="off"
          spellCheck={false}
          placeholder="Cari tugas…"
          className="border-border bg-surface w-full rounded-md border px-3 py-2 text-sm"
        />
        `,
      ),

      h2('7. Menguji bagian yang murni'),
      code(
        'ts',
        `
        import { describe, expect, it } from 'vitest';
        import { saring } from '@/lib/saring';

        const data = [
          { id: '1', judul: 'Belajar React', selesai: false },
          { id: '2', judul: 'Baca dokumentasi', selesai: true },
        ];

        describe('saring', () => {
          it('mengembalikan semuanya saat tanpa saringan', () => {
            expect(saring(data, { cari: '', filter: 'semua' })).toHaveLength(2);
          });

          it('mengabaikan besar-kecil huruf dan spasi berlebih', () => {
            expect(saring(data, { cari: '  REACT ', filter: 'semua' })).toHaveLength(1);
          });

          it('menggabungkan pencarian dan filter', () => {
            expect(saring(data, { cari: 'a', filter: 'selesai' })).toHaveLength(1);
          });

          it('daftar kosong tidak melempar error', () => {
            expect(saring([], { cari: 'x', filter: 'aktif' })).toEqual([]);
          });
        });
        `,
      ),
      callout(
        'tip',
        'Inilah imbalan memisahkan logika dari komponen',
        'Empat tes di atas berjalan tanpa jsdom, tanpa render, tanpa mock — dan menutup sebagian besar kemungkinan bug. Menguji hal yang sama lewat komponen akan jauh lebih lambat dan lebih rapuh.',
      ),

      checklist(
        'frontend-intermediate/state-dan-event-handler/praktik',
        'Checklist praktik 4.12',
        'Tidak ada state turunan yang disimpan — semua dihitung saat render',
        'Tidak ada `useEffect` yang tugasnya menyalin satu state ke state lain',
        'Semua pembaruan yang bergantung nilai lama memakai bentuk updater',
        'Tidak ada mutasi array atau objek state',
        'Keempat keadaan UI ditangani, dengan dua keadaan kosong yang dibedakan',
        'Skeleton memesan tinggi yang sama dengan baris asli',
        'Halaman dijepit supaya tidak menunjuk halaman yang sudah tidak ada',
        'Debounce diterapkan pada nilai penyaring, bukan pada `value` input',
        '`useDebounce` membersihkan timer-nya',
        'Input punya `<label>`; tombol filter punya `aria-pressed`',
        'Wadah hasil punya `aria-live` dan `aria-busy`',
        'Fungsi `saring` diuji terpisah, termasuk kasus daftar kosong',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pisahkan state sungguhan dari nilai turunan sebelum menulis komponen.',
        'Jepit nilai seperti halaman saat render, bukan lewat effect.',
        'Debounce nilai yang dipakai menyaring, bukan yang ditampilkan.',
        'Logika penyaringan sebagai fungsi murni — diuji tanpa React.',
        'Empat keadaan UI dan atribut ARIA-nya adalah bagian dari fiturnya, bukan tambahan.',
      ),
    ],
  ),
];
