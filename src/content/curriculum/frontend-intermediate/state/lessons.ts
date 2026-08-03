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
      terms(
        {
          term: 'state',
          meaning:
            'Terjemahannya **keadaan**. Data yang dimiliki sebuah komponen, bisa berubah, dan **memicu penggambaran ulang** saat berubah. Inilah yang membedakannya dari variabel biasa: mengubah variabel biasa tidak membuat apa pun bergerak di layar, karena React tidak tahu ada yang berubah.',
        },
        {
          term: 'useState',
          meaning:
            'Hook yang memberi komponen sebuah **ingatan**. Ia mengembalikan array dua elemen — nilainya sekarang, dan fungsi untuk mengubahnya — sehingga selalu ditulis dengan destructuring array: `const [jumlah, setJumlah] = useState(0)`. Karena berbasis posisi, penamaannya bebas; kebiasaan `setXxx` murni kesepakatan.',
        },
        {
          term: 'hook',
          meaning:
            'Dibaca "huk", artinya **kait**. Fungsi khusus React yang namanya selalu diawali `use`. Ia "mengaitkan" komponenmu ke kemampuan React seperti ingatan dan efek samping. Bukan fungsi biasa — ia punya aturan pemakaian yang ketat, dan itulah isi bagian berikutnya.',
        },
        {
          term: 'Rules of Hooks',
          meaning:
            'Dua aturan yang **tidak bisa ditawar**: hook hanya boleh dipanggil di **tingkat teratas** komponen (bukan di dalam `if`, loop, atau fungsi bersarang), dan hanya dari **komponen atau hook lain**. Alasannya teknis: React mengenali hook mana yang mana **berdasarkan urutan pemanggilannya**, jadi urutan yang berubah membuatnya tertukar.',
        },
        {
          term: 'nilai awal',
          meaning:
            'Argumen `useState(0)`. Hanya dipakai pada **render pertama** dan diabaikan sepenuhnya setelah itu — kesalahpahaman yang sering membuat orang bingung kenapa mengubah props tidak mengubah state yang diinisialisasi darinya.',
        },
        {
          term: 'lazy initializer',
          meaning:
            'Terjemahannya **penyiapan yang ditunda**. Mengoper **fungsi** alih-alih nilai: `useState(() => hitungBerat())`. Bedanya besar dan sering terlewat — `useState(hitungBerat())` menjalankan perhitungan itu **pada setiap render** lalu membuang hasilnya, sementara bentuk fungsi hanya menjalankannya sekali.',
        },
        {
          term: 'state lokal',
          meaning:
            'State yang dimiliki **satu komponen saja**. Tiap instance komponen punya salinannya sendiri yang benar-benar terpisah — merender `<Penghitung />` dua kali menghasilkan dua hitungan yang tidak saling memengaruhi.',
        },
        {
          term: 'kapan sesuatu jadi state',
          meaning:
            'Tiga syarat yang harus dipenuhi bersamaan: ia **berubah seiring waktu**, perubahannya **harus terlihat di layar**, dan ia **tidak bisa dihitung** dari state atau props lain. Gagal syarat ketiga adalah kesalahan paling sering — dan Sub-bab 4.9 membahasnya tuntas.',
        },
      ),

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
      references(
        {
          label: 'useState',
          href: 'https://react.dev/reference/react/useState',
          source: 'React',
          note: 'Rujukan lengkap, termasuk bentuk lazy initializer dan kapan nilai awal diabaikan.',
        },
        {
          label: 'State: A Component’s Memory',
          href: 'https://react.dev/learn/state-a-components-memory',
          source: 'React',
          note: 'Kenapa variabel biasa tidak cukup, dan apa yang membuat state berbeda.',
        },
        {
          label: 'Rules of Hooks',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Dua aturan yang mengikat, beserta alasan teknis di balik ketergantungan pada urutan.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Kapan memisahkan state dan kapan menggabungkannya menjadi satu objek.',
        },
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

      terms(
        {
          term: 'snapshot',
          meaning:
            'Terjemahannya **potret sesaat**. Gagasan inti sub-bab ini, dan kalau hanya satu hal yang kamu ingat dari seluruh bab, biarlah yang ini: **nilai state di dalam satu render tidak akan pernah berubah**. Ia difoto saat render dimulai, dan foto itu tetap sama sampai render berikutnya — berapa kali pun kamu memanggil `setState` di antaranya.',
        },
        {
          term: 'nilai basi',
          meaning:
            'Terjemahan dari *stale value*. Membaca nilai state yang sudah usang. Bukan bug React — ini akibat langsung dari sifat snapshot. `setJumlah(jumlah + 1)` tiga kali berturut-turut hanya menambah satu, karena ketiganya membaca `jumlah` dari potret yang **sama**.',
        },
        {
          term: 'closure',
          meaning:
            'Fungsi yang mengingat lingkungan tempat ia dibuat — persis yang kamu pelajari di Sub-bab 1.8 Frontend Basic. Inilah **penjelasan sesungguhnya** di balik perilaku snapshot: tiap render menghasilkan fungsi-fungsi baru yang menangkap nilai state saat itu, dan fungsi lama tetap memegang nilai lamanya.',
        },
        {
          term: 'stale closure',
          meaning:
            'Terjemahan bebasnya **closure yang membawa nilai basi**. Fungsi yang dibuat pada render lama lalu dijalankan belakangan — di dalam `setTimeout`, pendengar event, atau timer — sehingga ia membaca state dari saat ia dibuat, bukan dari saat ia berjalan. Sumber bug asinkron yang paling membingungkan di React.',
        },
        {
          term: 'render sebagai foto',
          meaning:
            'Analogi yang menutup seluruh sub-bab ini: setiap render adalah **satu lembar foto** berisi tampilan beserta nilai-nilai yang berlaku saat itu. Memanggil `setState` tidak mengedit foto yang sedang tampil — ia **meminta foto baru dibuat**, dan foto baru itu baru muncul setelah render berikutnya.',
        },
        {
          term: 'setState tidak seketika',
          meaning:
            'Membaca state **tepat setelah** memanggil pengubahnya akan memberi nilai lama. Ini bukan penundaan yang bisa ditunggu dengan `await` — nilai barunya memang **tidak ada** di render yang sedang berjalan, karena ia milik render berikutnya.',
        },
        {
          term: 'event handler',
          meaning:
            'Fungsi penangan peristiwa. Perlu diingat bahwa ia **dibuat ulang setiap render**, dan tiap versinya menangkap potret state saat render itu. Karena itu handler yang tersimpan di suatu tempat dan dipanggil belakangan bisa membaca nilai yang sudah lama berganti.',
        },
        {
          term: 'updater function',
          meaning:
            'Bentuk `setJumlah(n => n + 1)` yang menerima **nilai terbaru** sebagai argumen alih-alih membacanya dari potret. Ini jalan keluar dari seluruh masalah di atas, dan dibahas tuntas di sub-bab berikutnya.',
        },
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
      references(
        {
          label: 'State as a Snapshot',
          href: 'https://react.dev/learn/state-as-a-snapshot',
          source: 'React',
          note: 'Rujukan utama sub-bab ini — analogi foto dan kenapa state konstan dalam satu render.',
        },
        {
          label: 'Queueing a Series of State Updates',
          href: 'https://react.dev/learn/queueing-a-series-of-state-updates',
          source: 'React',
          note: 'Kenapa tiga `setJumlah(jumlah + 1)` berturut-turut hanya menambah satu.',
        },
        {
          label: 'useRef',
          href: 'https://react.dev/reference/react/useRef',
          source: 'React',
          note: 'Nilai yang berubah seketika tanpa memicu render — untuk penjaga yang tidak boleh menunggu.',
        },
        {
          label: 'Closures',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
          source: 'MDN',
          note: 'Mekanisme JavaScript yang menjelaskan perilaku snapshot — bukan sesuatu yang khas React.',
        },
      ),
    ],
  ),

  written(
    'batching-updater',
    'Batching & Updater Function',
    12,
    'Beberapa pembaruan dalam satu event — dan kapan bentuk updater wajib.',
    [
      terms(
        {
          term: 'batching',
          meaning:
            'Terjemahannya **penggabungan**. React menunggu sebuah event handler **selesai seluruhnya**, lalu merender **satu kali** untuk semua perubahan di dalamnya. Tiga `setState` berturut-turut tidak menghasilkan tiga render. Inilah salah satu hal yang membuat React tetap cepat tanpa kamu mengaturnya sama sekali.',
        },
        {
          term: 'automatic batching',
          meaning:
            'Perluasan sejak React 18: penggabungan kini berlaku **di mana pun**, termasuk di dalam `setTimeout`, penangan Promise, dan pendengar event asli. Sebelumnya hanya berlaku di dalam event handler React — dan perbedaan itu dulu menjadi sumber kebingungan yang sekarang sudah hilang.',
        },
        {
          term: 'updater function',
          meaning:
            'Bentuk `setJumlah(n => n + 1)` yang menerima **nilai terbaru dalam antrean** sebagai argumen, bukan membacanya dari potret render. Wajib dipakai dalam tiga keadaan: beberapa pembaruan berurutan dalam satu handler, pembaruan di dalam kode asinkron, dan pembaruan di dalam `setInterval`.',
        },
        {
          term: 'antrean pembaruan',
          meaning:
            'Terjemahan dari *update queue*. React tidak langsung menerapkan `setState` — ia **mengantrekannya**. Saat render berikutnya disiapkan, seluruh antrean diproses berurutan. Bentuk nilai menimpa antrean dengan angka tetap; bentuk updater justru **membaca hasil sebelumnya** dalam antrean itu.',
        },
        {
          term: 'n vs jumlah',
          meaning:
            'Perbedaan yang menentukan dan mudah terlewat. `setJumlah(jumlah + 1)` membaca `jumlah` dari **potret render** — jadi tiga kali berturut-turut tetap menghasilkan satu. `setJumlah(n => n + 1)` membaca `n` dari **antrean** — jadi tiga kali menghasilkan tiga.',
        },
        {
          term: 'flushSync',
          meaning:
            'Fungsi yang **memaksa React merender saat itu juga**, membatalkan penggabungan. Hampir selalu salah pilih — pakai hanya kalau kamu benar-benar perlu membaca DOM yang sudah diperbarui sebelum baris berikutnya, misalnya untuk mengukur tinggi lalu menggulir ke sana.',
        },
        {
          term: 'render sekali per event',
          meaning:
            'Model mental yang paling berguna untuk diingat: **satu peristiwa pengguna menghasilkan satu render**, apa pun jumlah `setState` di dalamnya. Kalau kamu melihat render berkali-kali untuk satu klik, biasanya ada `setState` yang dipanggil di luar handler.',
        },
        {
          term: 'transisi',
          meaning:
            'Kemampuan React menandai sebagian pembaruan sebagai **tidak mendesak** lewat `useTransition`, sehingga ketikan pengguna tetap responsif meski ada penggambaran berat di belakangnya. Dibahas di bab hooks; disebut di sini karena ia perluasan dari gagasan penjadwalan yang sama.',
        },
      ),

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
      references(
        {
          label: 'Queueing a Series of State Updates',
          href: 'https://react.dev/learn/queueing-a-series-of-state-updates',
          source: 'React',
          note: 'Cara antrean pembaruan diproses, dan kapan bentuk updater wajib dipakai.',
        },
        {
          label: 'React 18: Automatic Batching',
          href: 'https://react.dev/blog/2022/03/29/react-v18',
          source: 'React',
          note: 'Perluasan penggabungan ke `setTimeout` dan penangan Promise sejak React 18.',
        },
        {
          label: 'flushSync',
          href: 'https://react.dev/reference/react-dom/flushSync',
          source: 'React',
          note: 'Memaksa render seketika — beserta peringatan resmi bahwa ia hampir selalu salah pilih.',
        },
        {
          label: 'useState — setState',
          href: 'https://react.dev/reference/react/useState#setstate',
          source: 'React',
          note: 'Menegaskan bahwa tidak ada callback setelah `setState` seperti pada komponen kelas.',
        },
      ),
    ],
  ),

  written(
    'update-immutable',
    'Memperbarui Object & Array secara Immutable',
    13,
    'Kenapa `push` tidak memicu render — dan cara memperbarui data bersarang tanpa mutasi.',
    [
      terms(
        {
          term: 'immutable',
          meaning:
            'Terjemahannya **tidak diubah isinya**. Aturan React untuk state: jangan pernah mengubah object atau array yang sudah ada — **buat yang baru**. Ini bukan preferensi gaya melainkan syarat teknis, dan alasannya ada tepat di bawah.',
        },
        {
          term: 'mutasi',
          meaning:
            'Perubahan langsung pada data asli: `daftar.push(4)`. Masalahnya bukan bahwa isinya berubah — masalahnya **alamatnya tidak**. React membandingkan alamat, melihat alamat yang sama, lalu menyimpulkan tidak ada yang berubah dan **tidak merender apa pun**.',
        },
        {
          term: 'Object.is',
          meaning:
            'Fungsi pembanding yang dipakai React untuk memutuskan apakah state berubah. Ia membandingkan **alamat**, bukan isi — persis konsep primitif versus reference dari Sub-bab 1.3 Frontend Basic. Inilah penjelasan lengkap kenapa `push` tidak memicu render.',
        },
        {
          term: 'spread',
          meaning:
            'Tanda `...` yang menyalin isi lalu menghasilkan object atau array **baru** dengan alamat baru: `[...daftar, 4]`, `{ ...pengguna, nama: "Zum" }`. Cara paling langsung memenuhi aturan immutable.',
        },
        {
          term: 'salinan dangkal',
          meaning:
            'Terjemahan dari *shallow copy*. Spread hanya menyalin **satu lapis** — object yang bersarang di dalamnya tetap dibagi bersama aslinya. Konsekuensinya penting: untuk data bersarang, kamu harus menyalin **setiap tingkat** sepanjang jalur yang diubah, bukan hanya yang terluar.',
        },
        {
          term: 'to-prefixed',
          meaning:
            'Method array bertanda awal `to` yang mengembalikan versi baru tanpa memutasi: `toSorted`, `toSpliced`, `toReversed`, dan `with`. Ketiganya menggantikan `sort`, `splice`, dan `reverse` yang bermutasi — dan sekarang tersedia di semua browser modern.',
        },
        {
          term: 'update bersarang',
          meaning:
            'Memperbarui data beberapa tingkat ke dalam. Menulisnya dengan spread berlapis bisa jadi sangat panjang dan mudah salah. Dua jalan keluarnya: **ratakan bentuk datanya** sejak awal, atau pakai pustaka seperti Immer.',
        },
        {
          term: 'Immer',
          meaning:
            'Pustaka yang membiarkanmu menulis kode yang **terlihat seperti mutasi** — `draft.a.b.c = 1` — lalu diam-diam menghasilkan salinan baru yang benar. Berguna untuk state bersarang dalam. Perlu diingat, ia mengurangi gejalanya; bentuk data yang lebih rata sering menyelesaikan akar masalahnya.',
        },
        {
          term: 'ratakan state',
          meaning:
            'Terjemahan dari *flatten state*. Menyimpan data sebagai peta id-ke-item alih-alih pohon bersarang. Sedikit lebih banyak kode di awal, tapi menghapus seluruh kelas kerumitan spread berlapis — dan biasanya inilah perbaikan yang sebenarnya dibutuhkan.',
        },
      ),

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
      references(
        {
          label: 'Updating Objects in State',
          href: 'https://react.dev/learn/updating-objects-in-state',
          source: 'React',
          note: 'Aturan immutable beserta cara menyalin setiap tingkat pada data bersarang.',
        },
        {
          label: 'Updating Arrays in State',
          href: 'https://react.dev/learn/updating-arrays-in-state',
          source: 'React',
          note: 'Tabel resmi method mana yang bermutasi dan mana penggantinya.',
        },
        {
          label: 'Object.is()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is',
          source: 'MDN',
          note: 'Pembanding yang dipakai React — alasan teknis kenapa `push` tidak memicu render.',
        },
        {
          label: 'Array.prototype.with()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/with',
          source: 'MDN',
          note: 'Mengganti satu elemen tanpa memutasi — pengganti `arr[i] = x` yang aman untuk state.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Anjuran meratakan state bersarang alih-alih menambah lapisan spread.',
        },
      ),
    ],
  ),

  written(
    'event-handler-react',
    'Event Handler di React vs DOM',
    11,
    'Perbedaan yang halus tapi nyata — dan cara mengoper argumen dengan benar.',
    [
      terms(
        {
          term: 'SyntheticEvent',
          meaning:
            'Terjemahannya **peristiwa sintetis**. Pembungkus React atas peristiwa DOM asli, dibuat agar perilakunya seragam di semua browser. API-nya nyaris identik dengan yang kamu pelajari di Bab 4 Frontend Basic — `preventDefault`, `target`, `currentTarget` semuanya ada. Peristiwa aslinya tetap bisa diambil lewat `e.nativeEvent`.',
        },
        {
          term: 'event delegation React',
          meaning:
            'React **tidak memasang pendengar di tiap elemen**. Ia memasang satu pendengar di akar aplikasi lalu mengarahkannya sendiri — persis pola delegation dari Sub-bab 4.8 Frontend Basic, dikerjakan otomatis untukmu. Konsekuensinya: `e.stopPropagation()` di React tidak selalu menghentikan pendengar DOM asli yang dipasang manual.',
        },
        {
          term: 'onClick vs addEventListener',
          meaning:
            'Perbedaan yang paling terasa: di React kamu **tidak perlu melepas pendengar**, karena React yang mengurusnya saat komponen dilepas. Bandingkan dengan DOM murni, di mana pendengar yang lupa dilepas menjadi kebocoran memori.',
        },
        {
          term: 'mengoper argumen',
          meaning:
            'Kesalahan nomor satu di sub-bab ini. `onClick={hapus(id)}` **memanggil `hapus` saat render** dan mengoper hasilnya — biasanya `undefined`. Yang benar `onClick={() => hapus(id)}`: sebuah fungsi baru yang memanggil `hapus` nanti saat diklik.',
        },
        {
          term: 'arrow di JSX',
          meaning:
            'Membuat fungsi baru di setiap render. Sering dikhawatirkan soal performa, dan hampir selalu **berlebihan** — biayanya nyaris nol, dan React Compiler menanganinya otomatis. Kejelasan kode lebih berharga daripada mikro-optimasi yang tidak pernah diukur.',
        },
        {
          term: 'preventDefault',
          meaning:
            'Membatalkan **perilaku bawaan browser**: form yang memuat ulang halaman, tautan yang berpindah, checkbox yang berubah. Di React ia bekerja persis sama seperti di DOM — tidak ada perbedaan yang perlu diingat.',
        },
        {
          term: 'e.target vs currentTarget',
          meaning:
            'Sama seperti di DOM: `target` adalah elemen yang **benar-benar** memicu, `currentTarget` adalah tempat pendengarnya dipasang. Tambahan yang khas TypeScript: `currentTarget` bertipe tepat, sementara `target` sengaja longgar — kalau tipenya terasa janggal, biasanya kamu menginginkan `currentTarget`.',
        },
        {
          term: 'nativeEvent',
          meaning:
            'Peristiwa DOM asli di balik SyntheticEvent. Jarang dibutuhkan, tapi berguna saat kamu perlu sesuatu yang tidak dibungkus React — misalnya `e.nativeEvent.stopImmediatePropagation()` untuk mencegat pendengar lain di elemen yang sama.',
        },
      ),

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
      references(
        {
          label: 'Responding to Events',
          href: 'https://react.dev/learn/responding-to-events',
          source: 'React',
          note: 'Pembedaan mengoper dan memanggil, beserta cara mengoper argumen dengan benar.',
        },
        {
          label: 'Common components — event props',
          href: 'https://react.dev/reference/react-dom/components/common#common-props',
          source: 'React',
          note: 'Daftar seluruh prop peristiwa React dan objek yang diterimanya.',
        },
        {
          label: 'Event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event',
          source: 'MDN',
          note: 'API peristiwa asli yang dibungkus SyntheticEvent — perilakunya nyaris identik.',
        },
        {
          label: 'Event.preventDefault()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault',
          source: 'MDN',
          note: 'Membatalkan aksi bawaan browser, bekerja sama persis di React.',
        },
      ),
    ],
  ),

  written(
    'controlled-uncontrolled',
    'Controlled vs Uncontrolled Input',
    12,
    'Dua cara mengelola nilai input — dan kapan masing-masing tepat.',
    [
      terms(
        {
          term: 'controlled',
          meaning:
            'Terjemahannya **terkendali**. Nilai input **sepenuhnya ditentukan React** lewat prop `value`, dan setiap ketikan dilaporkan lewat `onChange`. Yang perlu dipahami: input jadi tidak bisa mengubah dirinya sendiri sama sekali — kalau kamu lupa memasang `onChange`, ketikan pengguna benar-benar tidak muncul.',
        },
        {
          term: 'uncontrolled',
          meaning:
            'Terjemahannya **tidak terkendali**. Input **menyimpan nilainya sendiri** di DOM, seperti HTML biasa. React hanya membacanya saat dibutuhkan, lewat `ref` atau `FormData`. Lebih sederhana, lebih sedikit render, dan sering justru pilihan yang benar.',
        },
        {
          term: 'defaultValue',
          meaning:
            'Nilai awal untuk input **uncontrolled**. Memakai `value` untuk input uncontrolled adalah kesalahan yang memunculkan peringatan React — `value` mengunci nilainya, `defaultValue` hanya mengisinya di awal lalu melepasnya.',
        },
        {
          term: 'kapan controlled',
          meaning:
            'Tiga keadaan yang benar-benar membutuhkannya: nilainya **memengaruhi hal lain seketika** (pencarian langsung, pratinjau), nilainya harus **diubah dari luar** (tombol reset, isi otomatis), atau ada **validasi per ketikan**. Di luar tiga itu, uncontrolled biasanya lebih tepat.',
        },
        {
          term: 'peringatan berpindah',
          meaning:
            'Terjemahan dari *switching from uncontrolled to controlled*. Terjadi saat `value` awalnya `undefined` lalu berubah menjadi teks. Penyebabnya hampir selalu sama: nilai awal state tidak disetel. Perbaikannya juga sederhana — mulai dari `useState("")`, bukan `useState()`.',
        },
        {
          term: 'ref pada input',
          meaning:
            'Cara membaca nilai input uncontrolled: `ref.current.value`. Ingat dari Sub-bab 6.8 Frontend Basic bahwa `ref.current` **selalu bisa `null`** sebelum React memasangnya, jadi pemeriksaan `?.` tetap wajib.',
        },
        {
          term: 'render per ketikan',
          meaning:
            'Konsekuensi input controlled: **setiap huruf memicu satu render**. Untuk satu input biasa ini tidak terasa sama sekali. Untuk form berisi tiga puluh field yang semuanya controlled dalam satu state, barulah ia menjadi masalah nyata — dan itulah salah satu alasan pindah ke React Hook Form di sub-bab berikutnya.',
        },
        {
          term: 'single source of truth',
          meaning:
            'Terjemahannya **satu sumber kebenaran**. Pada input controlled, sumbernya adalah state React; pada uncontrolled, sumbernya adalah DOM. Yang berbahaya adalah **mencampur keduanya** — menyimpan nilai di state sekaligus membiarkan DOM memegangnya sendiri berarti dua sumber yang pasti berselisih.',
        },
      ),

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
      references(
        {
          label: '<input>',
          href: 'https://react.dev/reference/react-dom/components/input',
          source: 'React',
          note: 'Perbandingan controlled dan uncontrolled langsung dari rujukan resminya.',
        },
        {
          label: 'Reacting to Input with State',
          href: 'https://react.dev/learn/reacting-to-input-with-state',
          source: 'React',
          note: 'Kapan nilai input memang perlu menjadi state, dan kapan tidak.',
        },
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN',
          note: 'Membaca seluruh form uncontrolled sekaligus — ingat, hanya input dengan `name`.',
        },
        {
          label: '<input type="file">',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file',
          source: 'MDN',
          note: 'Alasan keamanan kenapa input berkas tidak bisa dijadikan controlled.',
        },
      ),
    ],
  ),

  written(
    'form-react',
    'Form: dari `useState` ke React Hook Form',
    13,
    'Dari form sederhana ke form yang benar-benar dipakai — beserta alasan pindahnya.',
    [
      terms(
        {
          term: 'React Hook Form',
          meaning:
            'Pustaka form yang bekerja dengan pendekatan **uncontrolled**, sehingga mengetik di satu field **tidak merender seluruh form**. Perlu ditegaskan: ia bukan keharusan. Form dengan dua atau tiga field cukup dengan `useState` — pustaka ini menang saat fieldnya banyak dan validasinya rumit.',
        },
        {
          term: 'register',
          meaning:
            'Fungsi React Hook Form yang **menyambungkan sebuah input** ke sistemnya: `{...register("email")}`. Ia mengembalikan `name`, `ref`, dan penangan peristiwa sekaligus — itulah sebabnya ia disebar dengan spread.',
        },
        {
          term: 'handleSubmit',
          meaning:
            'Pembungkus yang **menjalankan validasi lebih dulu**, lalu memanggil fungsimu hanya kalau seluruhnya lolos. Ia juga sudah memanggil `preventDefault` untukmu, sehingga halaman tidak memuat ulang.',
        },
        {
          term: 'resolver',
          meaning:
            'Jembatan antara React Hook Form dan pustaka skema seperti Zod. Manfaatnya besar: aturan validasi ditulis **sekali sebagai skema**, lalu dipakai di form **dan** di server — sehingga keduanya tidak mungkin berselisih.',
        },
        {
          term: 'Zod',
          meaning:
            'Pustaka pendefinisi skema yang memeriksa bentuk data **saat program berjalan**, sekaligus menghasilkan tipe TypeScript-nya. Inilah yang menutup celah dari Sub-bab 6.10 Frontend Basic: TypeScript sudah dihapus saat build, jadi data dari luar tetap butuh pemeriksaan sungguhan.',
        },
        {
          term: 'validasi berlapis',
          meaning:
            'Aturan yang tidak berubah sejak Frontend Basic: validasi klien untuk **kenyamanan**, validasi server untuk **keamanan**. Pustaka form secanggih apa pun tidak mengubah ini — siapa pun bisa mengirim permintaan langsung tanpa membuka halamanmu.',
        },
        {
          term: 'mode validasi',
          meaning:
            'Kapan validasi dijalankan: `onSubmit` (bawaan), `onBlur`, atau `onChange`. Pola yang paling nyaman dipakai: **diam sampai submit pertama**, lalu setelah itu validasi tiap ketikan — sehingga pengguna tidak dimarahi sebelum sempat mengetik.',
        },
        {
          term: 'formState',
          meaning:
            'Objek berisi keadaan form: `errors`, `isSubmitting`, `isDirty`, `isValid`. `isSubmitting` yang paling sering terpakai — untuk menonaktifkan tombol kirim agar tidak terkirim dua kali, persis kewajiban yang dibahas di Bab 3.',
        },
        {
          term: 'kapan pindah',
          meaning:
            'Tiga tanda yang cukup jelas: lebih dari **lima field**, validasi yang saling bergantung antar-field, atau form yang **terasa berat saat diketik**. Sebelum salah satunya muncul, `useState` lebih sederhana dan tidak menambah dependensi.',
        },
      ),

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
      references(
        {
          label: '<form>',
          href: 'https://react.dev/reference/react-dom/components/form',
          source: 'React',
          note: 'Dukungan form bawaan React 19, termasuk `action` dan `useFormStatus`.',
        },
        {
          label: 'Client-side form validation',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
          source: 'MDN',
          note: 'Termasuk penegasan resmi bahwa validasi klien bukan kontrol keamanan.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Dasar keamanan kenapa server wajib memeriksa ulang apa pun yang dikirim klien.',
        },
        {
          label: 'Constraint Validation API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation',
          source: 'MDN',
          note: 'Validasi bawaan HTML yang sering sudah cukup sebelum menambah pustaka apa pun.',
        },
      ),
    ],
  ),

  written(
    'lifting-state',
    'Lifting State Up',
    12,
    'Menaikkan state ke induk terdekat yang membutuhkannya — dan biaya menaikkannya terlalu tinggi.',
    [
      terms(
        {
          term: 'lifting state up',
          meaning:
            'Terjemahannya **menaikkan state ke atas**. Memindahkan state ke **induk terdekat yang dibutuhkan bersama** oleh komponen-komponen yang memerlukannya. Dilakukan ketika dua komponen bersaudara harus melihat data yang sama — karena data hanya mengalir turun, satu-satunya cara adalah menaikkannya ke induk mereka.',
        },
        {
          term: 'induk terdekat bersama',
          meaning:
            'Terjemahan dari *closest common ancestor*. Komponen terendah yang **membungkus semua** komponen yang membutuhkan data itu. Kata "terendah" penting: menaikkan lebih tinggi dari yang perlu justru menimbulkan masalahnya sendiri.',
        },
        {
          term: 'biaya menaikkan terlalu tinggi',
          meaning:
            'Tiga akibat yang nyata: setiap perubahan **merender ulang seluruh cabang** di bawahnya, komponen di tengah jadi harus mengoper props yang tidak ia pakai (prop drilling), dan komponen daun kehilangan kemandiriannya. Karena itu aturannya: **serendah mungkin, tapi setinggi yang diperlukan**.',
        },
        {
          term: 'colocation',
          meaning:
            'Terjemahannya **menyimpan berdekatan**. Prinsip menaruh state **sedekat mungkin dengan yang memakainya**. Kebalikan naluri umum yang ingin menaruh semuanya di satu tempat pusat — dan hampir selalu menghasilkan aplikasi yang lebih mudah diubah.',
        },
        {
          term: 'komponen terkendali',
          meaning:
            'Hasil dari lifting state: komponen anak jadi **menerima nilainya dari props** dan melaporkan perubahan lewat callback. Ia tidak lagi memiliki datanya sendiri — polanya sama persis dengan input controlled di Sub-bab 4.6.',
        },
        {
          term: 'callback ke atas',
          meaning:
            'Fungsi yang diserahkan induk ke anak agar anak bisa memberi kabar. Karena data hanya mengalir turun, inilah **satu-satunya cara** anak memengaruhi induknya — bukan dengan mengubah props, melainkan memanggil fungsi yang induknya sediakan.',
        },
        {
          term: 'kapan naik ke Context',
          meaning:
            'Ketika data dibutuhkan **banyak komponen yang tersebar jauh** — tema, pengguna yang login, bahasa. Tapi coba **composition lebih dulu**: mengoper komponennya alih-alih datanya sering sudah menyelesaikannya tanpa Context sama sekali.',
        },
        {
          term: 'state management global',
          meaning:
            'Pustaka seperti Zustand atau Redux. Kebutuhannya jauh lebih jarang daripada yang orang duga — sebagian besar yang terasa butuh state global sebenarnya **server state** (data dari API), dan itu punya alatnya sendiri. Dibahas di bab tersendiri nanti.',
        },
      ),

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
      references(
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Rujukan utama lifting state, termasuk cara mengubah komponen menjadi terkendali.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip colocation — taruh state sedekat mungkin dengan yang memakainya.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Menegaskan bahwa composition sebaiknya dicoba lebih dulu sebelum Context.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Apa yang terjadi pada state saat komponen berpindah posisi dalam pohon.',
        },
      ),
    ],
  ),

  written(
    'derived-state',
    'State Turunan — yang bisa dihitung jangan disimpan',
    12,
    'Sumber bug "dua nilai yang tidak sinkron" — dan cara menghapusnya sepenuhnya.',
    [
      terms(
        {
          term: 'state turunan',
          meaning:
            'Terjemahan dari *derived state*. Nilai yang **bisa dihitung** dari state atau props lain — total dari daftar, jumlah item, hasil penyaringan. Aturannya tegas: **jangan disimpan sebagai state**. Hitung saja saat render, karena perhitungannya hampir selalu jauh lebih murah daripada risikonya.',
        },
        {
          term: 'dua nilai tidak sinkron',
          meaning:
            'Akibat langsung menyimpan turunan. Begitu ada **dua tempat** yang menyimpan hal yang sama, keduanya pasti berselisih cepat atau lambat — cukup satu jalur pembaruan yang lupa memperbarui salah satunya. Yang membuatnya mahal: bugnya muncul jauh dari penyebabnya, dan datanya terlihat masuk akal.',
        },
        {
          term: 'hitung saat render',
          meaning:
            'Jalan keluarnya, dan lebih sederhana dari dugaan: `const total = items.reduce(...)` ditulis biasa di badan komponen. Tidak ada state tambahan, tidak ada efek, dan **mustahil tidak sinkron** — karena hanya ada satu sumbernya.',
        },
        {
          term: 'useEffect untuk sinkronisasi',
          meaning:
            'Anti-pola yang sangat umum: `useEffect` yang tugasnya menyalin satu state ke state lain. Selain tidak perlu, ia juga **menambah satu render** dan membuat aplikasi sempat menampilkan nilai yang belum diperbarui. Dokumentasi React membahasnya di halaman berjudul "You Might Not Need an Effect".',
        },
        {
          term: 'useMemo untuk turunan',
          meaning:
            'Dipakai **hanya kalau perhitungannya benar-benar mahal** — mengurutkan ribuan baris, misalnya. Untuk `reduce` atas dua puluh item, membungkusnya justru lebih mahal daripada menghitungnya. Dan dengan React Compiler, sebagian besar kasus ini sudah ditangani otomatis.',
        },
        {
          term: 'satu sumber kebenaran',
          meaning:
            'Prinsip yang mendasari seluruh sub-bab ini. Setiap data hanya boleh punya **satu** tempat penyimpanan resmi; sisanya dihitung darinya. Ini juga alasan menyimpan indeks terpilih lebih baik daripada menyimpan objeknya — indeks tidak bisa basi, salinan objek bisa.',
        },
        {
          term: 'state minimum',
          meaning:
            'Terjemahan dari *minimal state*. Pertanyaan yang harus diajukan untuk tiap state: **bisakah ini dihitung dari yang lain?** Kalau bisa, ia bukan state. Menerapkan pertanyaan ini secara konsisten menghapus sekelas bug sebelum ia sempat ditulis.',
        },
        {
          term: 'menyimpan id, bukan objek',
          meaning:
            'Pola khusus yang sering menyelamatkan. Menyimpan `idTerpilih` lalu mencari objeknya saat render, alih-alih menyimpan objeknya langsung. Alasannya: objek yang disimpan menjadi **salinan beku** — ketika data aslinya diperbarui, salinan itu tetap menampilkan versi lama.',
        },
      ),

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
      references(
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Rujukan utama sub-bab ini — daftar lengkap effect yang sebenarnya tidak perlu ada.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip state minimum: jangan menyimpan apa pun yang bisa dihitung.',
        },
        {
          label: 'Preserving and Resetting State',
          href: 'https://react.dev/learn/preserving-and-resetting-state',
          source: 'React',
          note: 'Teknik mengganti `key` untuk mereset state — pengganti effect yang mengawasi props.',
        },
        {
          label: 'useMemo',
          href: 'https://react.dev/reference/react/useMemo',
          source: 'React',
          note: 'Termasuk catatan resmi bahwa sebagian besar perhitungan tidak perlu dimemoisasi.',
        },
      ),
    ],
  ),

  written(
    'usereducer',
    '`useReducer` untuk State yang Rumit',
    13,
    'Ketika beberapa nilai berubah bersama, dan transisinya punya aturan.',
    [
      terms(
        {
          term: 'useReducer',
          meaning:
            'Hook alternatif `useState` untuk keadaan yang **beberapa nilainya berubah bersamaan** dan transisinya punya aturan. Ia memisahkan **apa yang terjadi** (action) dari **bagaimana state berubah** (reducer) — sehingga logikanya bisa diuji tanpa merender apa pun.',
        },
        {
          term: 'reducer',
          meaning:
            'Fungsi murni bertanda tangan `(state, action) => stateBaru`. Namanya dari `Array.prototype.reduce` di Sub-bab 1.9 Frontend Basic — gagasannya sama persis: mengambil nilai berjalan dan satu masukan, lalu menghasilkan nilai berjalan berikutnya. Karena ia fungsi murni biasa, ia bisa diuji tanpa React sama sekali.',
        },
        {
          term: 'action',
          meaning:
            'Objek yang menjelaskan **apa yang terjadi**, bukan apa yang harus diubah: `{ type: "MULAI_MEMUAT" }`. Pembedaan ini penting — nama action sebaiknya menceritakan **peristiwa** (`TOMBOL_KIRIM_DIKLIK`), bukan perintah (`SET_LOADING`), karena satu peristiwa bisa mengubah beberapa nilai sekaligus.',
        },
        {
          term: 'dispatch',
          meaning:
            'Terjemahannya **mengirimkan**. Fungsi untuk mengirim action ke reducer: `dispatch({ type: "BERHASIL", data })`. Berbeda dari `setState`, **identitasnya tidak pernah berubah** antar-render — jadi ia aman dioper ke komponen anak tanpa memicu render tambahan.',
        },
        {
          term: 'kombinasi mustahil',
          meaning:
            'Masalah yang diselesaikan sub-bab ini. Tiga state terpisah — `data`, `memuat`, `error` — menghasilkan **delapan kombinasi**, dan hanya sekitar empat yang masuk akal. "Sedang memuat sekaligus punya error" bisa ditulis, tidak berarti apa-apa, dan tidak ada yang mencegahnya.',
        },
        {
          term: 'state machine',
          meaning:
            'Terjemahannya **mesin keadaan**. Menyimpan keadaan sebagai **satu nilai berhingga** — `"diam" | "memuat" | "berhasil" | "gagal"` — sehingga hanya keadaan yang sah yang bisa ada. Reducer adalah cara alami mewujudkannya, karena ia satu tempat yang mengatur seluruh perpindahan.',
        },
        {
          term: 'transisi',
          meaning:
            'Perpindahan dari satu keadaan ke keadaan lain, dan **aturan tentang mana yang sah**. Dari `"memuat"` boleh ke `"berhasil"` atau `"gagal"`, tapi dari `"diam"` tidak boleh langsung ke `"berhasil"`. Reducer adalah tempat aturan itu ditulis dan ditegakkan.',
        },
        {
          term: 'kapan pindah dari useState',
          meaning:
            'Tiga tanda yang cukup jelas: **lebih dari tiga state yang saling terkait**, satu peristiwa yang mengubah beberapa nilai sekaligus, atau transisi yang punya aturan. Di luar itu, `useState` lebih sederhana — dan `useReducer` untuk satu boolean adalah kerumitan tanpa imbalan.',
        },
        {
          term: 'exhaustiveness',
          meaning:
            'Terjemahannya **ketuntasan**. Memastikan **semua jenis action ditangani** reducer, dengan menugaskan sisanya ke `never` di cabang `default`. Menambah action baru lalu lupa menanganinya langsung menjadi error TypeScript — persis pola yang dipakai `BlockRenderer` di project ini.',
        },
      ),

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
      references(
        {
          label: 'useReducer',
          href: 'https://react.dev/reference/react/useReducer',
          source: 'React',
          note: 'Rujukan lengkap, termasuk syarat kemurnian reducer dan stabilitas `dispatch`.',
        },
        {
          label: 'Extracting State Logic into a Reducer',
          href: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
          source: 'React',
          note: 'Kapan berpindah dari `useState`, beserta cara menamai action sebagai peristiwa.',
        },
        {
          label: 'Scaling Up with Reducer and Context',
          href: 'https://react.dev/learn/scaling-up-with-reducer-and-context',
          source: 'React',
          note: 'Memisahkan context keadaan dan dispatch agar render lebih hemat.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Membuat kombinasi keadaan mustahil menjadi tidak bisa ditulis, plus penjaga ketuntasan.',
        },
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

      terms(
        {
          term: 'empat keadaan UI',
          meaning:
            'Memuat, kosong, gagal, berhasil. Kamu sudah menemuinya di Sub-bab 5.12 Frontend Basic; **di React ia justru lebih mudah terlewat**, karena menulis komponen yang hanya menangani keadaan berhasil terasa selesai dan tidak terlihat salah — sampai dipakai orang lain di jaringan yang lambat.',
        },
        {
          term: 'keadaan kosong',
          meaning:
            'Wajib menjelaskan **kenapa** kosong dan memberi **satu langkah lanjutan**. Perlu dibedakan penyebabnya: "belum ada data sama sekali" berbeda dari "ada, tapi tidak cocok dengan saringan" — dan menampilkan pesan yang sama untuk keduanya membingungkan.',
        },
        {
          term: 'keadaan gagal',
          meaning:
            'Wajib punya **pesan yang bisa ditindaklanjuti** dan **tombol coba lagi**. Aturan pendampingnya dari `security.md` tetap berlaku: detail teknis ke log, pesan yang ramah ke layar — jangan menampilkan pesan error mentah dari server.',
        },
        {
          term: 'skeleton',
          meaning:
            'Bentuk kerangka yang **memesan ruang seukuran isi akhirnya**. Ini yang membedakannya dari pemutar berputar: skeleton mencegah tata letak melompat, spinner tidak. Untuk operasi yang hampir selalu instan, keduanya justru lebih baik dihilangkan — kedipannya terasa lebih lambat daripada tanpa indikator.',
        },
        {
          term: 'keadaan yang mustahil',
          meaning:
            'Menyimpan keempat keadaan sebagai boolean terpisah membolehkan kombinasi seperti "sedang memuat **dan** gagal". Menyimpannya sebagai **satu nilai berhingga** menutup seluruh kelas masalah itu — dan itulah sambungan langsung dengan sub-bab `useReducer` sebelumnya.',
        },
        {
          term: 'early return',
          meaning:
            'Bentuk paling terbaca untuk keempat keadaan: satu `if` per keadaan di atas JSX utama, masing-masing langsung `return`. Menambah keadaan kelima tidak menyentuh yang lain — bandingkan dengan ternary bertingkat yang harus dibongkar seluruhnya.',
        },
        {
          term: 'aria-live',
          meaning:
            'Menandai area yang isinya berubah agar **diumumkan pembaca layar**. Tanpa itu, perpindahan dari "memuat" ke "berhasil" sepenuhnya senyap bagi pengguna tunanetra — mereka tidak tahu datanya sudah datang.',
        },
        {
          term: 'jujur',
          meaning:
            'Prinsip yang mengikat seluruh sub-bab ini. Tampilan **tidak boleh menyembunyikan keadaan sebenarnya**. Layar kosong tanpa penjelasan tidak bisa dibedakan dari aplikasi yang rusak — dan pengguna akan menganggapnya rusak.',
        },
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
      references(
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Anjuran memakai satu nilai berhingga alih-alih beberapa boolean yang bisa bertabrakan.',
        },
        {
          label: 'Conditional Rendering',
          href: 'https://react.dev/learn/conditional-rendering',
          source: 'React',
          note: 'Pola early return yang membuat keempat keadaan terbaca berurutan.',
        },
        {
          label: 'ARIA live regions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
          source: 'MDN',
          note: 'Mengumumkan perpindahan keadaan yang tanpa itu sepenuhnya senyap.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Alasan skeleton wajib memesan tinggi akhirnya alih-alih sekadar berputar.',
        },
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

      terms(
        {
          term: 'rancang state dulu',
          meaning:
            'Langkah pertama praktik ini, dan urutan yang menentukan sisanya. Sebelum menulis satu komponen pun, **pisahkan state sungguhan dari nilai turunan**. Yang sungguhan hanya tiga di sini: kata pencarian, filter, dan halaman. Sisanya — hasil saring, jumlah total, jumlah halaman — semuanya dihitung.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunda sebuah aksi sampai pemicunya berhenti berdatangan. Yang penting dan sering keliru: **debounce nilai yang dipakai menyaring, bukan yang ditampilkan di input**. Kalau nilai inputnya ikut ditunda, ketikan pengguna terasa tersendat.',
        },
        {
          term: 'menjepit nilai',
          meaning:
            'Terjemahan bebas dari *clamping*. Menjaga `halaman` tetap dalam rentang yang sah setelah hasil saring mengecil. Kerjakan **saat render** — `const halamanAman = Math.min(halaman, totalHalaman)` — bukan lewat `useEffect` yang memperbaikinya setelah layar sempat menampilkan halaman kosong.',
        },
        {
          term: 'fungsi murni untuk penyaringan',
          meaning:
            'Menaruh logika saring, cari, dan paginasi di **fungsi biasa di luar komponen**. Manfaatnya langsung: bisa diuji tanpa merender apa pun, dan komponennya menyusut jadi sekadar menyusun tampilan.',
        },
        {
          term: 'reset halaman',
          meaning:
            'Kasus tepi yang selalu terlupakan: mengganti kata pencarian **harus mengembalikan halaman ke satu**. Tanpa itu, pengguna yang sedang di halaman 5 lalu mencari sesuatu yang baru akan melihat layar kosong, meski hasilnya sebenarnya ada.',
        },
        {
          term: 'aria-live untuk hasil',
          meaning:
            'Mengumumkan jumlah hasil setelah pencarian selesai — "12 hasil ditemukan". Bagi pengguna pembaca layar, tanpa ini mengetik di kotak pencarian tidak menghasilkan umpan balik apa pun.',
        },
        {
          term: 'URL sebagai state',
          meaning:
            'Menyimpan kata pencarian dan filter di **query string** alih-alih di state komponen. Keuntungannya nyata: hasil pencarian bisa dibagikan lewat tautan, tombol Kembali browser bekerja, dan menyegarkan halaman tidak menghapus apa pun. Dibahas tuntas di bab state management.',
        },
        {
          term: 'fitur utuh',
          meaning:
            'Tujuan praktik ini: bukan sekadar membuat pencarian yang bekerja, melainkan yang **lengkap** — keempat keadaan UI, atribut ARIA, kasus tepi halaman, dan logika yang bisa diuji. Ketiga hal terakhir itulah yang membedakan latihan dari kode yang benar-benar dipakai.',
        },
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
      references(
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Bagian "Adjusting state when a prop changes" — dasar menjepit halaman saat render.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Langkah pertama praktik ini: pisahkan state sungguhan dari nilai turunan.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan logika penyaringan sebaiknya berupa fungsi murni di luar komponen.',
        },
        {
          label: 'ARIA live regions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
          source: 'MDN',
          note: 'Mengumumkan jumlah hasil pencarian kepada pengguna pembaca layar.',
        },
        {
          label: 'Debounce your input handlers',
          href: 'https://web.dev/articles/debounce-your-input-handlers',
          source: 'web.dev',
          note: 'Kenapa yang di-debounce adalah nilai penyaring, bukan nilai yang ditampilkan.',
        },
      ),
    ],
  ),
];
