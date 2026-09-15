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
    22,
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
            'Hook yang memberi komponen sebuah **ingatan**. Ia mengembalikan array dua elemen, yaitu nilainya sekarang dan fungsi untuk mengubahnya, sehingga selalu ditulis dengan destructuring array seperti `const [jumlah, setJumlah] = useState(0)`. Karena berbasis posisi, penamaannya bebas, dan kebiasaan `setXxx` murni kesepakatan.',
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
        // 1. React tidak tahu ada yang berubah -> tidak melakukan re-render
        // 2. Kalaupun di-render ulang, 'jumlah' di-reset ke 0 karena fungsinya dipanggil lagi
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
      p(
        'Kedua bentuk SALAH punya satu kesamaan, yaitu keduanya membuat **jumlah hook yang dipanggil bisa berbeda antar render**. Nilai `masuk` bisa berubah, dan panjang `items` bisa berubah. Bentuk BENAR menunjukkan koreksinya, dan yang dipindah bukan pemakaiannya melainkan **pemanggilan hook-nya**. `useState` naik ke atas tanpa syarat apa pun, sedangkan `if (masuk)` tetap ada untuk mengatur kapan nilainya dipakai. Kalau kamu benar-benar butuh state per item dalam sebuah daftar, jawabannya bukan hook di dalam loop melainkan **memecah tiap item menjadi komponennya sendiri**, karena tiap komponen punya daftar hook-nya sendiri. Kotak di bawah menjelaskan kenapa aturannya tidak bisa ditawar.',
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
      p(
        'Perbedaannya benar-benar hanya sepasang tanda kurung, tapi artinya berlawanan. `useState(bacaLocalStorage())` **menjalankan** fungsinya lebih dulu lalu mengoper hasilnya, dan karena badan komponen dijalankan ulang di setiap render, pembacaan itu terjadi berulang-ulang meski nilainya hanya dipakai sekali di render pertama. `useState(() => bacaLocalStorage())` mengoper **fungsinya**, dan React memanggilnya tepat sekali saat state itu pertama dibuat. Bentuk ini disebut *lazy initializer*. Ia layak dipakai setiap kali nilai awalnya butuh pekerjaan nyata, misalnya membaca `localStorage`, mengurai JSON, atau menghitung dari data besar. Untuk nilai murah seperti `useState(0)`, pembungkus fungsi hanya menambah teks tanpa manfaat.',
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
      p(
        'Uji sederhananya: kalau mengubah `nama` tidak pernah butuh mengubah `email` di saat yang sama, keduanya adalah dua fakta terpisah dan pantas jadi dua panggilan `useState`. Sebaliknya, `x` dan `y` pada sebuah posisi **selalu** berubah bersama — memisahkannya menjadi dua state berarti ada dua kesempatan salah satu terlupa diperbarui, sementara satu objek `{ x, y }` menjamin keduanya selalu konsisten sebagai satu pembaruan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Panel filter di halaman katalog punya kotak pencarian, pilihan kategori, rentang harga, dan tombol bersihkan. Versi pertama menyimpan keempatnya di komponen halaman supaya bisa dijangkau dari mana saja. Setelah dipasang, mengetik satu huruf di kotak pencarian membuat seluruh halaman berkedip, termasuk daftar produk yang belum berubah dan kepala halaman yang tidak ada hubungannya.',
      ),
      p(
        'Yang menentukan bukan berapa banyak state melainkan **di mana** ia disimpan. Aturannya satu kalimat, yaitu simpan sedekat mungkin dengan yang membacanya.',
      ),
      compare(
        {
          title: 'State di komponen halaman',
          lang: 'tsx',
          code: `
          function HalamanKatalog() {
            const [cari, setCari] = useState('');
            const [kategori, setKategori] = useState('');

            return (
              <>
                <KepalaHalaman />          {/* ikut digambar ulang */}
                <input value={cari} onChange={(e) => setCari(e.target.value)} />
                <PilihKategori nilai={kategori} onUbah={setKategori} />
                <DaftarProduk cari={cari} kategori={kategori} />
                <KakiHalaman />            {/* ikut digambar ulang */}
              </>
            );
          }
          `,
          notes: ['Tiap ketikan menggambar ulang seluruh isi halaman'],
        },
        {
          title: 'State di komponen yang memakainya',
          lang: 'tsx',
          code: `
          function HalamanKatalog() {
            return (
              <>
                <KepalaHalaman />
                <PanelKatalog />          {/* hanya ini yang punya state */}
                <KakiHalaman />
              </>
            );
          }

          function PanelKatalog() {
            const [cari, setCari] = useState('');
            const [kategori, setKategori] = useState('');

            return (
              <>
                <input value={cari} onChange={(e) => setCari(e.target.value)} />
                <PilihKategori nilai={kategori} onUbah={setKategori} />
                <DaftarProduk cari={cari} kategori={kategori} />
              </>
            );
          }
          `,
          notes: ['Kepala dan kaki halaman tidak tersentuh sama sekali'],
        },
      ),
      p(
        'Perubahan ini tidak menuntut satu pun pemanggilan pengoptimalan, dan hasilnya sudah terasa. Alasannya, React menggambar ulang komponen tempat state berubah beserta seluruh keturunannya. Memindahkan state turun satu tingkat berarti mengeluarkan seluruh saudara di atasnya dari cakupan itu. Ini pengoptimalan dengan rasio hasil terhadap usaha yang paling tinggi, dan ia sering dilewatkan karena tidak terlihat seperti pengoptimalan.',
      ),
      code(
        'tsx',
        `
        // Nilai awal yang mahal: pakai bentuk fungsi, bukan nilai langsung.
        // SALAH: bacaDrafDariPenyimpanan() dipanggil pada SETIAP render,
        // dan hasilnya dibuang kecuali render pertama.
        const [draf, setDraf] = useState(bacaDrafDariPenyimpanan());

        // BENAR: React hanya memanggilnya saat inisialisasi.
        const [draf, setDraf] = useState(() => bacaDrafDariPenyimpanan());
        `,
        {
          caption: 'Perbedaan satu pasang tanda kurung, dan satu pembacaan penyimpanan per render.',
        },
      ),
      p(
        "Bentuk fungsi ini disebut lazy initializer, dan gunanya baru terasa saat penyiapan nilainya benar-benar mahal, misalnya membaca `localStorage`, menguraikan JSON besar, atau menghitung dari daftar panjang. Untuk nilai awal sederhana seperti `useState(0)` atau `useState('')`, bentuk biasa sudah tepat dan membungkusnya dengan fungsi hanya menambah kebisingan.",
      ),
      p(
        'Perlu ditegaskan `useState` hanya memakai argumennya sekali seumur hidup komponen. Kalau props berubah, nilai awal itu **tidak** dibaca ulang. Ini penyebab bug yang sangat sering, yaitu `useState(props.nilai)` yang tidak pernah mengikuti perubahan `props.nilai`. Bagian error di bawah membahasnya, dan jalan keluarnya ada di sub-bab tentang state turunan.',
      ),
      callout(
        'tip',
        'Tiga pertanyaan sebelum menambahkan satu state',
        'Apakah nilainya bisa dihitung dari state atau props yang sudah ada, sebab kalau ya ia bukan state melainkan nilai turunan. Apakah ia hanya dibaca satu komponen, sebab kalau ya ia harus tinggal di sana. Dan apakah ia harus bertahan setelah halaman dimuat ulang, sebab kalau ya tempatnya bukan di state melainkan di alamat halaman atau penyimpanan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 sungguhan, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        function Kartu() {
          const [n, setN] = useState(0);
          setN(n + 1);              // dipanggil langsung di badan komponen
          return <div>{n}</div>;
        }

        Error: Too many re-renders. React limits the number of renders
        to prevent an infinite loop.
        `,
        { caption: 'Setiap render memicu pembaruan, dan pembaruan memicu render lagi.' },
      ),
      p(
        'React menghentikan putarannya setelah sekitar lima puluh render dan melempar. Tanpa batas itu, tab akan membeku total. Penyebabnya selalu sama, yaitu setter dipanggil selama render alih-alih di dalam penangan peristiwa atau efek. Kalau kamu memang perlu menghitung sesuatu dari props, itu bukan state melainkan nilai turunan yang cukup dihitung langsung.',
      ),
      code(
        'text',
        `
        function Kotak({ awal }) {
          const [nilai, setNilai] = useState(awal);
          return <input value={nilai} onChange={(e) => setNilai(e.target.value)} />;
        }

        // Induk mengubah 'awal' dari 'Sari' menjadi 'Budi'.
        // Kotak tetap menampilkan 'Sari'. Tidak ada error.
        `,
        { caption: 'Nilai awal hanya dibaca sekali seumur hidup komponen.' },
      ),
      p(
        'Ini kesalahpahaman paling sering tentang `useState`. Argumennya bukan nilai yang terus diikuti melainkan nilai **awal**, dan React mengabaikannya pada seluruh render berikutnya. Ada tiga jalan keluar tergantung maksudnya. Kalau nilainya memang harus mengikuti props, jangan disimpan sebagai state. Kalau ia harus direset saat konteksnya berganti, pakai `key` pada komponennya. Ketiga, kirim nilainya dari induk beserta penanganya.',
      ),
      code(
        'text',
        `
        const [n, setN] = useState(0);
        // ...
        n = 5;

        TypeError: Assignment to constant variable.
        `,
        { caption: 'State diubah langsung, bukan lewat setternya.' },
      ),
      p(
        'Error ini justru menolong sebab ia menghentikan kesalahan yang paling mendasar. Menugaskan langsung tidak akan pernah bekerja walaupun deklarasinya `let`, sebab React tidak punya cara mengetahui nilainya berubah sehingga tidak ada penggambaran ulang. Satu-satunya cara mengubah state adalah lewat setternya, dan itu bukan formalitas melainkan cara React tahu ada yang perlu digambar ulang.',
      ),
      code(
        'text',
        `
        const [daftar, setDaftar] = useState([]);
        // ...
        daftar.push(itemBaru);
        setDaftar(daftar);

        // Tidak ada error. Tampilan tidak berubah sama sekali.
        `,
        { caption: 'Array diubah di tempat, lalu diserahkan kembali sebagai dirinya sendiri.' },
      ),
      p(
        'React membandingkan nilai lama dan baru dengan `Object.is`, dan karena `daftar` masih object yang sama persis, ia menyimpulkan tidak ada yang berubah lalu melewati penggambaran ulang. Ini pantangan mutasi dari Bab 1 Frontend Basic, dan di React akibatnya berupa tampilan yang diam. Bentuk yang benar `setDaftar([...daftar, itemBaru])`, dan pembahasan lengkapnya ada di Sub-bab 4.4.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Too many re-renders`',
            'Setter dipanggil langsung di badan komponen',
            'Pindahkan ke penangan peristiwa atau efek',
          ],
          [
            'State tidak mengikuti perubahan props',
            'Argumen `useState` hanya dibaca sekali',
            'Jangan salin props ke state, atau reset dengan `key`',
          ],
          [
            '`Assignment to constant variable`',
            'State diubah langsung tanpa setter',
            'Pakai setternya',
          ],
          [
            'Tampilan tidak berubah setelah setState',
            'Nilainya diubah di tempat lalu diserahkan kembali',
            'Buat nilai baru, misalnya `[...daftar, item]`',
          ],
          [
            'Seluruh halaman berkedip tiap ketikan',
            'State disimpan terlalu tinggi di pohon komponen',
            'Pindahkan ke komponen yang benar-benar memakainya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useState` adalah hook pertama yang dipelajari dan yang paling sering dipakai secara berlebihan. Sebagian besar baris di bawah adalah tentang state yang seharusnya tidak pernah ada.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan nilai yang bisa dihitung dari state lain',
            'Supaya tidak dihitung ulang tiap render',
            'Dua sumber kebenaran yang harus dijaga tetap sinkron, dan itu selalu gagal. Hitung saat render, dan ini dibahas di Sub-bab 4.9',
          ],
          [
            'Menyalin props ke state dengan `useState(props.x)`',
            'Supaya bisa diubah di dalam',
            'Nilainya tidak pernah mengikuti perubahan props. Kalau memang perlu diubah, angkat penanganya ke induk',
          ],
          [
            'Membuat satu state untuk tiap field formulir',
            'Tiap field kan berbeda',
            'Sepuluh field berarti sepuluh state dan sepuluh setter. Kumpulkan menjadi satu object, atau pakai `FormData` seperti di Bab 5 Frontend Basic',
          ],
          [
            'Menyimpan state di komponen paling atas',
            'Supaya bisa dijangkau semua',
            'Setiap perubahan menggambar ulang seluruh pohon. Simpan sedekat mungkin dengan pembacanya',
          ],
          [
            'Memanggil fungsi mahal langsung sebagai nilai awal',
            'Ia kan hanya nilai awal',
            'Fungsinya dipanggil pada tiap render dan hasilnya dibuang. Bungkus dengan fungsi panah',
          ],
          [
            'Menyimpan keadaan yang harus bertahan di state',
            'State kan tempat menyimpan',
            'State hilang saat halaman dimuat ulang. Untuk filter dan halaman keberapa, tempatnya di alamat halaman',
          ],
        ],
      ),
      p(
        'Baris pertama adalah sumber bug yang paling sering di seluruh bab ini, dan gejalanya khas. Kalau ada dua nilai yang harus selalu cocok dan kamu menulis kode untuk menjaganya tetap cocok, salah satunya seharusnya bukan state. Contoh yang paling sering, menyimpan `daftar` dan `jumlahDaftar` sebagai dua state terpisah. Yang kedua cukup dihitung dengan `daftar.length` saat render, dan seluruh kode penjaga sinkronisasinya hilang.',
      ),
      callout(
        'info',
        'State adalah ingatan komponen, bukan tempat penyimpanan data',
        'Yang layak menjadi state adalah hal yang berubah karena interaksi pengguna dan mempengaruhi tampilan, misalnya tab yang aktif atau isi kotak pencarian. Data dari server punya kebutuhan sendiri berupa cache, kesegaran, dan penanganan gagal, dan itu bukan pekerjaan `useState`. Pembahasannya ada di bab tentang state management.',
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
    23,
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
            'Terjemahan bebasnya **closure yang membawa nilai basi**. Fungsi yang dibuat pada render lama lalu dijalankan belakangan, entah di dalam `setTimeout`, pendengar event, atau timer, sehingga ia membaca state dari saat ia dibuat, bukan dari saat ia berjalan. Sumber bug asinkron yang paling membingungkan di React.',
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
      p(
        'Bandingkan komentar di kedua blok, karena di situlah perbedaannya terbaca. Pada versi pertama, ketiga baris membaca variabel `jumlah` yang **sama**, yaitu konstanta milik render ini yang tetap `0` sepanjang fungsi berjalan. Jadi ketiganya mengajukan permintaan yang identik, yakni "jadikan 1". React menjalankan ketiganya, dan hasil akhirnya tentu saja 1. Versi kedua tidak mengoper nilai melainkan **fungsi**, dan React memanggil tiap fungsi itu dengan nilai terbaru hasil pemanggilan sebelumnya, dan itulah kenapa angkanya berjalan 0→1, 1→2, 2→3. Aturan praktis yang bisa dibawa pulang, **kalau nilai barunya dihitung dari nilai lama, pakai bentuk updater.** Untuk nilai yang tidak bergantung pada yang lama, misalnya `setNama(input.value)`, bentuk biasa sudah tepat.',
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
      p(
        'Penjaga di baris ketiga adalah pola yang sangat umum untuk mencegah pengiriman ganda, tapi di sini ia **tidak pernah bekerja sama sekali**. Sebabnya sama seperti sebelumnya, karena `memuat` adalah konstanta untuk render ini, jadi memanggil `setMemuat(true)` satu baris di atasnya tidak mengubahnya. Nilai `true` baru ada di render berikutnya, sementara pemeriksaan ini terjadi di render sekarang. Yang membuatnya berbahaya adalah gejalanya jarang muncul, sebab pada koneksi cepat pengguna tidak sempat mengklik dua kali. Ia baru terlihat di jaringan lambat, tepat pada saat pengiriman ganda paling merugikan.',
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
      p(
        'Perhatikan ada **dua nilai yang melacak hal yang sama**, dan itu disengaja karena keduanya melayani pembaca berbeda. `sedangKirim` adalah `useRef` yang nilainya berubah **seketika** tanpa menunggu render, jadi ia bisa dipakai sebagai penjaga yang benar-benar berlaku pada baris berikutnya. `memuat` tetap state karena ia yang **ditampilkan** ke pengguna sebagai tombol nonaktif atau spinner, dan hal yang tampil memang harus memicu render. Perhatikan juga pengembalian nilainya ditaruh di `finally` dan bukan setelah `await kirim()`, sebab dengan begitu penjaganya tetap dilepas meski pengirimannya gagal, sehingga pengguna tidak terkunci selamanya dari mencoba lagi.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tombol Tambah pada kartu produk harus menambah jumlah di keranjang lalu menampilkan pesan berisi jumlah barunya. Kamu menulisnya dalam tiga baris yang terlihat lurus, yaitu setel jumlah baru, lalu baca jumlahnya, lalu tampilkan pesan. Pesannya selalu menyebut angka yang lama. Pengguna menambah barang ketiga, dan pesannya berbunyi sekarang ada 2 barang.',
      ),
      p('Berikut hasil pengukuran sungguhan dengan React 19 di jsdom, bukan perkiraan.'),
      code(
        'tsx',
        `
        function Keranjang() {
          const [n, setN] = useState(0);

          return (
            <button
              onClick={() => {
                setN(n + 1);
                console.log('n TEPAT setelah setN:', n);   // nilai LAMA
              }}
            >
              Tambah
            </button>
          );
        }

        // Keluaran terukur saat n bernilai 4:
        // n TEPAT setelah setN: 4
        // (render berikutnya baru menampilkan 5)
        `,
        { caption: 'Diukur dengan React 19 sungguhan. Nilainya tetap 4 setelah setN dipanggil.' },
      ),
      p(
        'Penyebabnya bukan penundaan melainkan **closure**, dan itu materi yang sudah kamu pelajari di Bab 1 Frontend Basic. Variabel `n` di dalam penangan adalah konstanta yang nilainya ditetapkan saat render itu terjadi. Memanggil `setN` tidak mengubah konstanta itu, sebab tidak ada yang bisa mengubah konstanta. Yang ia lakukan adalah memberi tahu React untuk menjalankan komponennya lagi dengan nilai baru, dan di render berikutnya `n` adalah konstanta baru yang berbeda.',
      ),
      p(
        'Istilah yang dipakai untuk ini adalah snapshot, yaitu tiap render memotret seluruh nilainya dan penangan peristiwa yang dibuat di render itu selamanya memegang potret tersebut. Sekali gagasan ini masuk, sebagian besar kebingungan tentang state React selesai sekaligus, termasuk yang dibahas di sub-bab berikutnya tentang tiga pemanggilan yang hanya menambah satu.',
      ),
      code(
        'tsx',
        `
        // Perbaikannya: hitung nilainya SEKALI, lalu pakai variabel itu.
        function Keranjang() {
          const [n, setN] = useState(0);

          return (
            <button
              onClick={() => {
                const berikut = n + 1;      // satu sumber kebenaran di dalam penangan
                setN(berikut);
                tampilkanPesan(\`Sekarang ada \${berikut} barang\`);
                catatAnalitik('tambah_keranjang', { jumlah: berikut });
              }}
            >
              Tambah
            </button>
          );
        }
        `,
        { filename: 'src/keranjang/TombolTambah.tsx' },
      ),
      p(
        'Pola ini menyelesaikan seluruh masalahnya tanpa satu pun hook tambahan. Karena `berikut` dihitung sekali lalu dipakai di tiga tempat, tidak ada satu pun yang membaca nilai lama. Yang perlu dihindari adalah menghitung `n + 1` berulang di tiap baris, sebab itu mengulang perhitungan yang sama dan membuka peluang salah satu terlewat saat kode berubah.',
      ),
      p(
        'Ada satu kasus di mana pola ini tidak cukup, yaitu ketika nilai barunya harus dihitung dari nilai terbaru yang mungkin sudah diubah pemanggilan lain. Untuk itu ada bentuk fungsi pada setter, dan itu topik sub-bab berikutnya. Untuk penangan peristiwa biasa yang hanya menyetel sekali, menghitung ke variabel sudah tepat dan lebih terbaca.',
      ),
      callout(
        'info',
        'Snapshot berlaku juga untuk props dan variabel lain di dalam komponen',
        'Bukan hanya state. Setiap nilai yang dibaca penangan peristiwa adalah nilai dari render tempat penangan itu dibuat, termasuk props, hasil perhitungan, dan variabel biasa. Ini penting saat kamu memakai `setTimeout` atau `await` di dalam penangan, sebab nilainya tetap yang lama walaupun sudah lewat beberapa detik.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Snapshot hampir tidak pernah melempar error. Yang muncul adalah nilai yang tertinggal satu langkah, dan itulah yang membuatnya sulit dikenali sebelum kamu tahu mekanismenya.',
      ),
      code(
        'text',
        `
        setN(n + 1);
        console.log(n);

        // n bernilai 4, dan tetap 4. Tidak ada error.
        `,
        { caption: 'Diukur sungguhan. Nilainya tidak berubah di baris berikutnya.' },
      ),
      p(
        'Ini bukan bug React melainkan konsekuensi langsung dari `n` yang berupa konstanta. Kalau kamu perlu memakai nilai barunya di baris yang sama, hitung ke variabel lebih dulu. Kalau kamu perlu bereaksi setelah nilainya benar-benar berubah, tempatnya bukan di penangan melainkan di efek, dan itu dibahas di Bab 7.',
      ),
      code(
        'text',
        `
        onClick={() => {
          setN(n + 1);
          kirimKeServer(n);        // mengirim nilai LAMA
        }}

        // Server menerima 4, padahal yang ditampilkan pengguna 5.
        `,
        { caption: 'Tidak ada error, dan data yang tersimpan salah satu langkah.' },
      ),
      p(
        'Inilah bentuk paling mahal dari jebakan snapshot, sebab akibatnya berupa data yang salah tersimpan di server. Gejalanya sangat sulit dikenali dari laporan pengguna, yaitu jumlahnya kadang kurang satu. Perbaikannya sama, yaitu hitung ke variabel lalu kirim variabel itu, bukan membaca state lagi.',
      ),
      code(
        'text',
        `
        onClick={() => {
          setPesan('Menyimpan...');
          setTimeout(() => {
            console.log(pesan);    // masih nilai dari SEBELUM diklik
          }, 2000);
        }}

        // Dua detik kemudian, yang tercetak tetap nilai lama.
        `,
        { caption: 'Penundaan tidak mengubah nilai yang tertangkap closure.' },
      ),
      p(
        'Menunggu dua detik tidak membuat closure membaca nilai baru, sebab yang ia pegang adalah konstanta dari render lama. Ini sering mengejutkan karena orang mengira masalahnya waktu. Kalau kamu butuh nilai terbaru di dalam penundaan, ada dua jalan, yaitu memakai bentuk fungsi pada setter, atau menyimpan nilainya di `ref` yang memang dirancang untuk hidup di luar alur render.',
      ),
      code(
        'text',
        `
        async function simpan() {
          setMemuat(true);
          await kirim(data);
          if (memuat) { /* selalu false di sini */ }
        }

        // Kondisinya tidak pernah benar. Tidak ada error.
        `,
        { caption: '`await` tidak mengubah nilai yang sudah tertangkap.' },
      ),
      p(
        'Sama seperti `setTimeout`, `await` hanya menunda eksekusi dan tidak membuat variabel membaca ulang. Nilai `memuat` di baris terakhir adalah nilai dari render saat fungsi ini dibuat, yaitu `false`. Kalau kamu perlu memeriksa apakah masih relevan setelah `await`, yang dibutuhkan penjaga nomor permintaan seperti di Bab 3 Frontend Basic, bukan membaca state.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Nilai tetap sama tepat setelah setter dipanggil',
            'Variabelnya konstanta dari render ini',
            'Hitung ke variabel lebih dulu, lalu pakai variabel itu',
          ],
          [
            'Data yang dikirim ke server tertinggal satu langkah',
            'Nilai lama dibaca setelah setter',
            'Kirim variabel hasil perhitungan, bukan state',
          ],
          [
            'Nilai di dalam `setTimeout` tetap lama',
            'Closure memegang konstanta dari render lama',
            'Pakai bentuk fungsi pada setter, atau `ref`',
          ],
          [
            'Kondisi setelah `await` tidak pernah benar',
            'Nilainya sudah tertangkap sebelum `await`',
            'Pakai penjaga nomor permintaan, bukan membaca state',
          ],
          [
            'Dua penangan membaca nilai yang berbeda',
            'Keduanya dibuat pada render yang berbeda',
            'Pastikan keduanya dibuat di render yang sama, atau pakai bentuk fungsi',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Gagasan snapshot bertentangan dengan intuisi yang dibangun dari JavaScript biasa, dan sebagian besar kesalahan di bawah berasal dari memperlakukan state seperti variabel biasa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membaca state tepat setelah memanggil setternya',
            'Barusan disetel, jadi pasti sudah berubah',
            'Variabelnya konstanta dari render ini dan tidak bisa berubah. Hitung ke variabel lebih dulu',
          ],
          [
            'Menambahkan `setTimeout` supaya nilainya sempat berubah',
            'Mungkin hanya perlu menunggu sebentar',
            'Menunggu tidak mengubah nilai yang tertangkap closure. Ini tebakan yang tidak pernah benar',
          ],
          [
            'Memakai `ref` untuk menghindari snapshot pada semua hal',
            '`ref` selalu berisi nilai terbaru',
            'Mengubah `ref` tidak menggambar ulang, sehingga tampilan tidak mengikuti. Pakai `ref` hanya untuk nilai yang tidak mempengaruhi tampilan',
          ],
          [
            'Mengira snapshot hanya berlaku untuk state',
            'Yang dibahas kan state',
            'Ia berlaku untuk props dan seluruh variabel di dalam komponen. Penangan memegang potret seluruh render itu',
          ],
          [
            'Membaca nilai state di dalam fungsi async setelah `await`',
            'Fungsinya kan masih berjalan',
            'Nilainya sudah tertangkap sebelum `await`. Pakai penjaga nomor permintaan untuk memeriksa relevansi',
          ],
          [
            'Menganggap ini bug React yang perlu diakali',
            'Perilakunya tidak seperti dugaan',
            'Ia justru yang membuat render bisa diprediksi. Tanpa snapshot, nilai bisa berubah di tengah penangan dan hasilnya tidak konsisten',
          ],
        ],
      ),
      p(
        'Baris terakhir layak direnungkan sebab ia mengubah snapshot dari gangguan menjadi jaminan. Karena seluruh nilai dalam satu penangan berasal dari render yang sama, kamu bisa yakin `n` di baris pertama dan `n` di baris kesepuluh adalah nilai yang sama persis. Kalau state bisa berubah di tengah penangan, tidak ada satu pun bagian kode yang bisa mengandalkan nilai yang baru saja ia baca.',
      ),
      callout(
        'tip',
        'Cara membuktikannya sendiri dalam satu menit',
        'Buat komponen dengan satu state angka dan satu tombol. Di dalam penanganya, panggil setternya lalu cetak nilainya. Klik sekali, dan lihat angka yang tercetak. Percobaan satu menit itu memberi model mental yang jauh lebih kuat daripada penjelasan mana pun, termasuk penjelasan ini.',
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
    22,
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
            'Perbedaan yang menentukan dan mudah terlewat. `setJumlah(jumlah + 1)` membaca `jumlah` dari **potret render**, jadi tiga kali berturut-turut tetap menghasilkan satu. `setJumlah(n => n + 1)` membaca `n` dari **antrean**, jadi tiga kali menghasilkan tiga.',
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
      p(
        'Cara memilih di antara keduanya bisa diringkas satu pertanyaan, yaitu **apakah nilai barunya menyebut nilai lama?** Ketiga baris pertama menyebutnya, karena `n + 1` butuh `n`, `[...d, baru]` butuh `d`, dan `!t` butuh `t`, jadi ketiganya wajib memakai updater. Ketiga baris kedua tidak menyebutnya, sebab `e.target.value` datang dari input, `id` datang dari argumen, dan `null` adalah nilai tetap. Untuk kelompok itu, bentuk nilai langsung lebih pendek dan sama benarnya. Perlu ditegaskan bahwa memakai updater di kelompok kedua **tidak salah**, hanya tidak perlu, sedangkan memakai bentuk nilai di kelompok pertama adalah bug yang menunggu waktu.',
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
      p(
        'Contoh ini lebih berbahaya daripada kasus tiga `setJumlah` sebelumnya, karena kedua pemanggilnya **tidak saling mengetahui**. Satu dipicu pengguna lewat form, satu lagi dipicu pesan dari server lewat socket, sehingga keduanya ditulis di tempat berbeda, mungkin oleh orang berbeda, dan masing-masing terlihat benar sendiri. Masalahnya baru muncul saat keduanya terjadi berdekatan. Keduanya membaca `daftar` dari render yang sama, keduanya membangun array baru dari titik awal yang sama, dan yang belakangan menimpa hasil yang pertama. Satu item hilang tanpa error apa pun. Perbaikannya cuma mengganti bentuknya menjadi updater, dan seperti dijelaskan kotak berikut, memakai updater sebagai kebiasaan menutup seluruh kelas bug ini sebelum ia sempat terjadi.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tombol Tambah Semua pada halaman keranjang harus menambah tiga barang sekaligus. Kamu menulis tiga pemanggilan setter berurutan, dan hasilnya jumlah hanya bertambah satu. Kamu mencoba membungkusnya dengan `setTimeout`, dan hasilnya bertambah tiga tapi layar berkedip tiga kali. Kedua gejala itu punya penjelasan yang sama, dan pengukurannya di bawah dilakukan dengan React 19 sungguhan.',
      ),
      compare(
        {
          title: 'Menyetel dengan nilai',
          lang: 'tsx',
          code: `
          onClick={() => {
            setN(n + 1);
            setN(n + 1);
            setN(n + 1);
          }}

          // n bernilai 0 saat diklik.
          // HASIL TERUKUR: 1
          `,
          notes: [
            'Ketiganya memakai `n` yang sama, yaitu 0, sehingga ketiganya menyetel 1',
            'Ini akibat langsung dari snapshot di sub-bab sebelumnya',
          ],
        },
        {
          title: 'Menyetel dengan fungsi',
          lang: 'tsx',
          code: `
          onClick={() => {
            setN((v) => v + 1);
            setN((v) => v + 1);
            setN((v) => v + 1);
          }}

          // n bernilai 1 saat diklik.
          // HASIL TERUKUR: 4
          `,
          notes: [
            'Tiap fungsi menerima nilai TERBARU dalam antrean, bukan snapshot',
            'React menjalankan ketiganya berurutan sebelum menggambar',
          ],
        },
      ),
      p(
        'Angka 1 dan 4 di atas diukur sungguhan, bukan diperkirakan. Kolom kiri menghasilkan 1 karena ketiga pemanggilan memakai `n` yang sama, yaitu potret dari render saat tombol diklik. Ketiganya berkata jadikan nilainya 1, dan yang terakhir menang. Kolom kanan menghasilkan 4 karena tiap fungsi menerima nilai terbaru dari antrean, yaitu 1 lalu 2 lalu 3, dan menghasilkan 4.',
      ),
      p(
        'Bagian kedua yang perlu diketahui adalah batching. Diukur pada percobaan yang sama, dua pemanggilan setter untuk dua state berbeda dalam satu penangan hanya menghasilkan **satu** render. React mengumpulkan seluruh pembaruan dalam satu penangan lalu memprosesnya sekaligus. Ini yang membuat menyetel lima state sekaligus tidak berarti lima kali penggambaran.',
      ),
      code(
        'tsx',
        `
        // Diukur: dua setState dalam satu penangan -> jumlah render bertambah 1.
        onClick={() => {
          setN(n + 1);
          setPesan('Ditambahkan');
          // Halaman digambar ulang SEKALI, dengan kedua nilai baru sekaligus.
        }}
        `,
        { caption: 'Batching berlaku juga untuk penangan asinkron sejak React 18.' },
      ),
      p(
        'Sejak React 18, batching berlaku di mana pun termasuk di dalam `setTimeout`, di dalam janji, dan di penangan peristiwa asli. Sebelumnya batching hanya berlaku di penangan peristiwa React, dan itu sumber perbedaan perilaku yang membingungkan. Kalau kamu membaca tulisan lama yang menyebut setter di dalam `setTimeout` tidak di-batch, itu sudah tidak berlaku.',
      ),
      code(
        'tsx',
        `
        // Kapan bentuk fungsi WAJIB dipakai:
        // 1. Beberapa pembaruan berurutan dalam satu penangan.
        setN((v) => v + 1);
        setN((v) => v + 1);

        // 2. Pembaruan di dalam penundaan atau setelah await.
        setTimeout(() => setN((v) => v + 1), 1000);

        // 3. Pembaruan dari penangan yang dipasang sekali dan hidup lama.
        useEffect(() => {
          const id = setInterval(() => setDetik((v) => v + 1), 1000);
          return () => clearInterval(id);
        }, []);   // dependensi kosong, jadi closure-nya dari render pertama
        `,
        { caption: 'Ketiganya sama-sama membutuhkan nilai terbaru, bukan snapshot.' },
      ),
      p(
        'Kasus ketiga adalah yang paling sering menyebabkan bug yang membingungkan. Efek dengan dependensi kosong hanya berjalan sekali, sehingga fungsi di dalam `setInterval` selamanya memegang potret dari render pertama. Dengan `setDetik(detik + 1)`, nilainya selalu nol tambah satu sehingga penghitungnya berhenti di satu. Dengan bentuk fungsi, ia bekerja benar tanpa perlu menambah dependensi apa pun.',
      ),
      callout(
        'tip',
        'Aturan satu kalimat untuk memilih bentuknya',
        'Kalau nilai barumu dihitung dari nilai lama, pakai bentuk fungsi. Kalau nilai barunya tidak bergantung pada yang lama, misalnya menyetel dari isi kotak input, bentuk nilai biasa sudah tepat dan lebih terbaca. Ragu berarti pakai bentuk fungsi, sebab ia benar di kedua kasus.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Batching dan bentuk updater hampir tidak pernah melempar. Yang muncul adalah angka yang salah, dan keempat bentuk di bawah diukur dengan React sungguhan.',
      ),
      code(
        'text',
        `
        setN(n + 1);
        setN(n + 1);
        setN(n + 1);

        // n awal 0. HASIL TERUKUR: 1, bukan 3.
        `,
        { caption: 'Ketiganya memakai snapshot yang sama.' },
      ),
      p(
        'Tidak ada error dan tidak ada peringatan. Yang perlu dikenali adalah polanya, yaitu beberapa pemanggilan setter berurutan yang seluruhnya membaca state yang sama. Kalau kamu melihat itu di kode, hampir pasti hanya yang terakhir yang berlaku. Ganti seluruhnya menjadi bentuk fungsi, atau gabungkan menjadi satu pemanggilan.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          const id = setInterval(() => setDetik(detik + 1), 1000);
          return () => clearInterval(id);
        }, []);

        // Penghitung berhenti di 1 selamanya. Tidak ada error.
        `,
        { caption: 'Closure dari render pertama memegang `detik` bernilai nol.' },
      ),
      p(
        'Ini bug penghitung yang paling terkenal di React, dan penyebabnya bukan `setInterval` melainkan dependensi kosong yang membuat efeknya tidak pernah dijalankan ulang. Ada dua jalan keluar, yaitu memakai bentuk fungsi seperti pada studi kasus, atau menambahkan `detik` ke dependensi sehingga intervalnya dipasang ulang tiap detik. Yang pertama jauh lebih baik sebab ia tidak membongkar dan memasang ulang timer.',
      ),
      code(
        'text',
        `
        setPengaturan({ ...pengaturan, tema: 'gelap' });
        setPengaturan({ ...pengaturan, bahasa: 'id' });

        // Hasil: hanya bahasa yang berubah. Tema kembali seperti semula.
        `,
        { caption: 'Dua pembaruan object yang keduanya menyebar snapshot yang sama.' },
      ),
      p(
        "Ini bentuk yang sama dengan jebakan angka, hanya lebih berbahaya karena akibatnya berupa data yang hilang bukan sekadar angka yang kurang. Pemanggilan kedua menyebar `pengaturan` versi lama yang temanya masih terang, sehingga perubahan pertama tertimpa. Pakai bentuk fungsi, yaitu `setPengaturan((p) => ({ ...p, bahasa: 'id' }))`, dan keduanya berlaku.",
      ),
      code(
        'text',
        `
        setN((v) => {
          simpanKeServer(v + 1);      // efek samping di dalam updater
          return v + 1;
        });

        // Di StrictMode, simpanKeServer dipanggil DUA KALI.
        `,
        { caption: 'Fungsi updater harus murni, dan React memanggilnya lebih dari sekali.' },
      ),
      p(
        'React memperlakukan fungsi updater sebagai fungsi murni dan boleh memanggilnya beberapa kali, terutama di `StrictMode` yang sengaja memanggilnya dua kali untuk menemukan efek samping. Karena itu jangan pernah menaruh pemanggilan server, pencatatan, atau perubahan variabel luar di dalamnya. Ia hanya boleh menghitung dan mengembalikan nilai baru, persis seperti fungsi murni di Bab 2 Frontend Basic.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tiga pemanggilan setter hanya menambah satu',
            'Ketiganya memakai snapshot yang sama',
            'Pakai bentuk fungsi `setN((v) => v + 1)`',
          ],
          [
            'Penghitung dalam interval berhenti di satu',
            'Closure dari render pertama memegang nilai nol',
            'Pakai bentuk fungsi, jangan menambah dependensi',
          ],
          [
            'Perubahan object pertama tertimpa yang kedua',
            'Keduanya menyebar snapshot yang sama',
            'Pakai bentuk fungsi yang menyebar nilai terbaru',
          ],
          [
            'Efek samping berjalan dua kali di pengembangan',
            'Ada efek samping di dalam fungsi updater',
            'Updater harus murni, pindahkan efek sampingnya keluar',
          ],
          [
            'Layar berkedip beberapa kali untuk satu aksi',
            'Pembaruan dipecah ke beberapa tugas terpisah',
            'Kumpulkan dalam satu penangan supaya di-batch',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Batching dan bentuk updater adalah dua hal yang paling sering diakali alih-alih dipahami, dan hampir seluruh akalannya menambah masalah baru.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil setter berkali-kali dengan bentuk nilai',
            'Tiap pemanggilan kan menambah satu',
            'Ketiganya memakai snapshot yang sama, jadi hanya yang terakhir berlaku',
          ],
          [
            'Membungkus dengan `setTimeout` supaya tidak di-batch',
            'Supaya tiap pembaruan terpisah',
            'Sejak React 18 batching berlaku di sana juga, dan kalaupun tidak, layar akan berkedip beberapa kali',
          ],
          [
            'Memakai bentuk fungsi untuk semua pembaruan',
            'Lebih aman',
            'Untuk nilai yang tidak bergantung nilai lama, misalnya dari kotak input, bentuk biasa lebih terbaca. Bentuk fungsi bukan salah, hanya lebih berisik',
          ],
          [
            'Menaruh pencatatan atau pemanggilan server di dalam updater',
            'Di sana nilai terbarunya tersedia',
            'React boleh memanggilnya beberapa kali. Hitung nilainya di updater, dan lakukan efek sampingnya di luar',
          ],
          [
            'Menyimpan beberapa state yang selalu berubah bersamaan',
            'Tiap nilai punya state sendiri',
            'Menambah peluang salah satu terlewat saat diperbarui. Kumpulkan menjadi satu object, atau pakai `useReducer`',
          ],
          [
            'Mengira batching menunda pembaruan',
            'Namanya mengumpulkan',
            'Ia mengumpulkan dalam satu tugas lalu memproses semuanya sekaligus, dan itu terjadi sebelum penggambaran berikutnya. Tidak ada penundaan yang terasa',
          ],
        ],
      ),
      p(
        'Baris kelima layak dipertimbangkan begitu kamu punya tiga state atau lebih yang selalu berubah bersama, misalnya `memuat`, `data`, dan `galat`. Ketiganya menggambarkan satu keadaan, dan memisahkannya membuka kemungkinan keadaan yang tidak masuk akal, misalnya sedang memuat sekaligus punya galat. Menggabungkannya menjadi satu object atau satu reducer membuat kombinasi yang tidak masuk akal menjadi mustahil.',
      ),
      callout(
        'info',
        'Cara React memproses antrean pembaruan',
        'Tiap pemanggilan setter menaruh satu entri di antrean, bisa berupa nilai atau fungsi. Sebelum render berikutnya, React memproses antrean itu berurutan. Entri berupa nilai menggantikan hasilnya, dan entri berupa fungsi dipanggil dengan hasil sejauh ini. Itulah kenapa mencampur keduanya menghasilkan urutan yang perlu dipikirkan, dan kenapa memakai satu bentuk saja lebih mudah diprediksi.',
      ),
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
    25,
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
            'Memperbarui data beberapa tingkat ke dalam. Menulisnya dengan spread berlapis bisa jadi sangat panjang dan mudah salah. Dua jalan keluarnya: **ratakan bentuk datanya** sejak awal, atau pakai library seperti Immer.',
        },
        {
          term: 'Immer',
          meaning:
            'Library yang membiarkanmu menulis kode yang **terlihat seperti mutasi**, misalnya `draft.a.b.c = 1`, lalu diam-diam menghasilkan salinan baru yang benar. Berguna untuk state bersarang dalam. Perlu diingat, ia mengurangi gejalanya, sedangkan bentuk data yang lebih rata sering menyelesaikan akar masalahnya.',
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
      p(
        'Ketujuh baris ini punya satu benang merah, yaitu **tidak satu pun menyentuh array aslinya.** Semuanya menghasilkan array baru, sehingga referensinya berubah dan React melihat perubahannya. Perhatikan tiga nama method yang mungkin masih asing. `toSorted` dan `with` adalah padanan aman dari `sort` dan `arr[i] = x` yang sudah kamu pelajari di Frontend Basic, dan awalan `to` adalah janji bahwa ia mengembalikan versi baru. Baris "Ubah satu" layak dibaca pelan karena ia menumpuk dua gagasan. `map` menghasilkan array baru, dan ternary di dalamnya menyalin **hanya item yang cocok** dengan `{ ...x, selesai: true }` sambil mengembalikan item lain apa adanya. Menyalin seperlunya itu penting, karena item yang alamatnya tidak berubah memberi tahu React bahwa baris itu tidak perlu digambar ulang.',
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
      p(
        'Menghapus satu field dari objek immutable memakai trik destructuring yang sama seperti meneruskan sisa props di Bab 3: `const { email, ...sisa } = f` memisahkan `f` menjadi dua bagian — `email` yang ditangkap sendiri (lalu tidak dipakai), dan `sisa` yang berisi **semua field lain**. Karena `sisa` adalah objek baru yang sudah tidak punya `email` sama sekali, mengembalikannya sebagai state berikutnya sama saja dengan "menghapus" field itu, tanpa pernah memakai `delete` yang memutasi objek aslinya.',
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
      p(
        'Perhatikan **tiga** spread bersarang untuk mengubah **satu** nilai boolean. Itu bukan kerumitan yang dibuat-buat, karena aturannya memang begitu. Setiap tingkat yang isinya berubah harus disalin, sebab kalau salah satu tingkat memakai objek lama, referensinya tidak berubah dan React tidak melihat perubahan di cabang itu. Hitung mundur dari bawah, karena mengubah `email` mengubah `notifikasi`, yang mengubah `pengaturan`, yang mengubah objek akarnya. Yang layak digarisbawahi bukan cara menulisnya, melainkan **apa yang ia beri tahu tentang bentuk state-mu**. Seperti kata kotak berikut, kalau kamu menulis pola ini lebih dari sekali, masalahnya bukan di sintaks melainkan di struktur datanya.',
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
      p(
        'Perbaikannya bukan menulis spread yang lebih pintar melainkan **mengubah bentuk datanya**. Versi SEBELUM menyimpan subtugas di dalam tugas, jadi menyentuh satu subtugas berarti menyalin tiga tingkat. Versi SESUDAH memisahkannya menjadi dua state terpisah berbentuk `Record<string, T>`, yaitu peta dari id ke objeknya dan bukan array bersarang. Hasilnya terlihat di baris terakhir, karena pembaruan yang tadinya tiga tingkat kini **dua tingkat saja**, satu untuk peta dan satu untuk item yang berubah. Cara ini disebut *normalisasi*, dan ia memberi keuntungan kedua yang tak kalah penting. Mencari subtugas berdasarkan id menjadi pencarian langsung `subtugas[id]`, bukan menelusuri array di dalam array.',
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
        'Ratakan dulu sebelum menambah library',
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
      p(
        'Aturan "jangan memutasi" berlaku untuk **objek yang React sudah simpan sebagai state**, bukan untuk objek apa pun yang kebetulan ada di memori. `salinan` pada contoh pertama adalah array biasa yang belum diserahkan ke `setDaftar`, sehingga memutasinya dengan `push` di dalam loop aman karena React belum tahu apa-apa tentang objek itu. Yang penting hasil akhirnya diserahkan lewat `setDaftar(salinan)` sebagai satu pembaruan. `hitungRef.current` malah **memang dirancang** untuk dimutasi langsung, karena ref sengaja tidak memicu render, dan sub-bab 4.7 (Frontend Intermediate Bab 7) membahas ini lebih dalam.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman pengaturan notifikasi punya struktur bersarang tiga tingkat, yaitu pengaturan berisi kanal, kanal berisi email, dan email berisi daftar jenis pemberitahuan. Pengguna mematikan satu jenis, dan tampilan tidak berubah. Kamu menambahkan pemanggilan setter lagi, dan tampilan berubah tapi pengaturan lain ikut kembali ke bawaan. Keduanya adalah gejala dari satu penyebab, yaitu object bersarang diubah dengan cara yang setengah benar.',
      ),
      code(
        'tsx',
        `
        type Pengaturan = {
          tema: 'terang' | 'gelap';
          kanal: {
            email: { aktif: boolean; jenis: string[] };
            push: { aktif: boolean; jenis: string[] };
          };
        };

        // SALAH 1: diubah di tempat. React tidak tahu ada perubahan.
        pengaturan.kanal.email.aktif = false;
        setPengaturan(pengaturan);        // object yang SAMA, tidak ada render

        // SALAH 2: disalin satu lapis. Lapisan dalam masih dibagi bersama.
        setPengaturan({ ...pengaturan, kanal: { ...pengaturan.kanal, email: { aktif: false } } });
        // 'jenis' hilang, sebab email diganti object baru yang tidak memuatnya
        `,
        { caption: 'Dua kesalahan yang gejalanya berlawanan, dan penyebabnya sama.' },
      ),
      p(
        'Kesalahan pertama adalah pantangan mutasi dari Bab 1 Frontend Basic. React membandingkan dengan `Object.is`, dan karena rujukannya sama persis ia menyimpulkan tidak ada yang berubah. Kesalahan kedua adalah penyalinan dangkal yang sudah dibahas di Bab 1 juga, yaitu spread hanya menyalin satu lapis sehingga mengganti `email` dengan object baru menghapus field yang tidak disebut.',
      ),
      code(
        'tsx',
        `
        // BENAR: salin tiap lapisan yang dilewati, sampai ke yang diubah.
        setPengaturan({
          ...pengaturan,
          kanal: {
            ...pengaturan.kanal,
            email: {
              ...pengaturan.kanal.email,
              aktif: false,
            },
          },
        });
        `,
        {
          caption:
            'Tiga lapis berarti tiga spread. Yang tidak dilewati tetap dibagi, dan itu benar.',
        },
      ),
      p(
        'Aturannya bisa dinyatakan satu kalimat, yaitu salin setiap object di sepanjang jalur dari akar sampai ke nilai yang diubah, dan biarkan sisanya. Object `push` pada contoh di atas tidak disalin dan tetap menunjuk object yang sama, dan itu justru diinginkan sebab ia memang tidak berubah. React akan melihat rujukannya sama lalu melewati penggambaran ulang bagian yang membacanya.',
      ),
      code(
        'tsx',
        `
        // Untuk struktur yang lebih dalam, bentuk bersarang menjadi sulit dibaca.
        // Dua jalan keluar yang keduanya sah.

        // 1. Ratakan strukturnya. Ini yang paling sering benar.
        type Pengaturan = {
          tema: 'terang' | 'gelap';
          emailAktif: boolean;
          emailJenis: string[];
          pushAktif: boolean;
          pushJenis: string[];
        };
        setPengaturan({ ...pengaturan, emailAktif: false });

        // 2. Pakai pustaka pembaru yang menulis seolah mengubah di tempat.
        import { produce } from 'immer';
        setPengaturan(produce((draf) => {
          draf.kanal.email.aktif = false;      // aman, draf bukan objek aslinya
        }));
        `,
        {
          caption:
            'Meratakan struktur biasanya menyelesaikan lebih banyak daripada menambah pustaka.',
        },
      ),
      p(
        'Pilihan pertama layak dicoba lebih dulu, dan ia sering diabaikan karena terasa kurang rapi. Struktur bersarang tiga tingkat di state hampir selalu meniru bentuk respons server, padahal keduanya tidak harus sama. Meratakannya membuat setiap pembaruan menjadi satu spread, membuat perbandingan React lebih tepat sasaran, dan menghilangkan seluruh kelas bug yang dibahas di bagian error.',
      ),
      code(
        'tsx',
        `
        // Array: lima operasi yang paling sering, semuanya tanpa mutasi.
        setDaftar([...daftar, baru]);                                   // tambah di akhir
        setDaftar([baru, ...daftar]);                                   // tambah di awal
        setDaftar(daftar.filter((d) => d.id !== id));                   // hapus
        setDaftar(daftar.map((d) => (d.id === id ? { ...d, selesai: true } : d)));  // ubah satu
        setDaftar(daftar.toSorted((a, b) => a.nama.localeCompare(b.nama, 'id')));   // urutkan
        `,
        { caption: 'Perhatikan `toSorted`, bukan `sort`. Yang kedua mengubah aslinya.' },
      ),
      p(
        'Baris keempat adalah pola yang paling sering dipakai dan paling sering ditulis setengah benar. Bentuk `{ ...d, selesai: true }` di dalamnya wajib, sebab tanpa itu kamu mengubah object anggotanya di tempat walaupun arraynya sudah baru. Komponen yang menerima anggota itu sebagai props tidak akan melihat perubahan, dan gejalanya berupa satu baris yang tidak ikut diperbarui sementara sisanya benar.',
      ),
      callout(
        'warning',
        'Lima method array yang mengubah aslinya, dan wajib dihindari di state',
        '`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, dan `fill`. Ketiga terakhir punya padanan yang aman, yaitu `toSorted`, `toReversed`, dan `with`. Untuk sisanya, pakai spread dan `filter`. Daftar ini sudah muncul di Bab 1 Frontend Basic, dan di React melanggarnya berarti tampilan yang diam.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pelanggaran pantangan mutasi hampir tidak pernah melempar. Empat gejala di bawah adalah cara mengenalinya.',
      ),
      code(
        'text',
        `
        daftar.push(baru);
        setDaftar(daftar);

        // Tidak ada error. Tampilan tidak berubah sama sekali.
        `,
        { caption: 'Rujukan yang sama diserahkan kembali.' },
      ),
      p(
        'React membandingkan dengan `Object.is`, dan `daftar` masih array yang sama persis. Karena tidak ada perbedaan, ia melewati penggambaran ulang. Gejalanya sangat khas, yaitu data bertambah kalau kamu cetak ke console tapi layar tidak berubah. Kalau kamu melihat itu, tersangka pertamanya selalu mutasi.',
      ),
      code(
        'text',
        `
        setPengaturan({ ...pengaturan, kanal: { email: { aktif: false } } });

        // Tampilan berubah, dan 'push' beserta 'jenis' hilang.
        // Tidak ada error.
        `,
        { caption: 'Lapisan dalam diganti seluruhnya, bukan disalin lalu diubah.' },
      ),
      p(
        'Ini kebalikan dari kesalahan pertama, yaitu penggambaran ulangnya terjadi dan datanya yang rusak. Object `kanal` baru hanya memuat `email`, sehingga `push` lenyap. Object `email` baru hanya memuat `aktif`, sehingga `jenis` lenyap. Setiap lapisan yang dilewati wajib disebar dengan spread, dan melewatkan satu berarti menghapus seluruh isinya.',
      ),
      code(
        'text',
        `
        const [profil, setProfil] = useState({ nama: 'Sari', alamat: { kota: 'Bandung' } });
        const salinan = { ...profil };
        salinan.alamat.kota = 'Jakarta';
        setProfil(salinan);

        // Tampilan berubah, DAN nilai lama di riwayat ikut berubah.
        `,
        { caption: 'Salinan dangkal membagi lapisan dalam dengan aslinya.' },
      ),
      p(
        'Ini masalah yang sudah dibahas di Bab 1 Frontend Basic, dan di React akibatnya lebih luas. Kalau kamu menyimpan riwayat untuk fitur urungkan, seluruh entri riwayat menunjuk object `alamat` yang sama, sehingga mengubah satu mengubah semuanya. Fitur urungkan mengembalikan keadaan yang isinya sudah ikut berubah, dan gejalanya berupa urungkan yang tidak melakukan apa-apa.',
      ),
      code(
        'text',
        `
        setDaftar(daftar.map((d) => {
          d.selesai = true;      // mengubah anggota di tempat
          return d;
        }));

        // Array baru, anggota lama. Sebagian komponen tidak ikut diperbarui.
        `,
        { caption: 'Array-nya baru, dan isinya masih object yang sama.' },
      ),
      p(
        'Ini bentuk yang paling menipu sebab `map` memang menghasilkan array baru, sehingga penggambaran ulang tingkat atas terjadi. Yang tidak berubah adalah rujukan tiap anggotanya, sehingga komponen anak yang menerima anggota sebagai props akan menyimpulkan propnya tidak berubah. Gejalanya berupa sebagian baris yang diperbarui dan sebagian tidak, tergantung apakah anaknya dioptimalkan. Kembalikan object baru dari dalam `map`.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Data berubah di console tapi layar diam',
            'Rujukan yang sama diserahkan kembali ke setter',
            'Buat nilai baru dengan spread, `filter`, atau `map`',
          ],
          [
            'Field lain hilang setelah satu diubah',
            'Lapisan dalam diganti, bukan disalin lalu diubah',
            'Sebar setiap lapisan yang dilewati',
          ],
          [
            'Fitur urungkan tidak mengembalikan apa pun',
            'Riwayat memegang lapisan dalam yang ikut berubah',
            'Salin sampai lapisan yang diubah, atau pakai `structuredClone` untuk riwayat',
          ],
          [
            'Sebagian baris tidak ikut diperbarui',
            'Anggota array diubah di tempat di dalam `map`',
            'Kembalikan object baru, yaitu `{ ...d, selesai: true }`',
          ],
          [
            'Data ikut terurut permanen setelah ditampilkan',
            '`sort` dipakai pada array state',
            'Pakai `toSorted`, atau salin dulu',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pantangan mutasi adalah aturan yang paling sering dilanggar tanpa sadar, sebab JavaScript sama sekali tidak mencegahnya dan React tidak selalu memberi tanda.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `push` lalu memanggil setter dengan array yang sama',
            'Datanya kan sudah bertambah',
            'React membandingkan rujukan, dan rujukannya sama. Tidak ada penggambaran ulang',
          ],
          [
            'Menyalin dengan spread lalu mengubah lapisan dalam',
            'Sudah disalin, jadi aman',
            'Spread hanya menyalin satu lapis. Lapisan dalam masih dibagi dengan aslinya',
          ],
          [
            'Memakai `JSON.parse(JSON.stringify(x))` untuk menyalin dalam',
            'Cara ini beredar luas',
            '`Date` menjadi teks, `Map` dan `Set` hilang, `undefined` lenyap, dan struktur melingkar melempar. Pakai `structuredClone`',
          ],
          [
            'Menyimpan struktur bersarang tiga tingkat di state',
            'Bentuknya mengikuti respons server',
            'Setiap pembaruan butuh tiga spread yang mudah salah. Ratakan strukturnya, sebab bentuk state tidak harus sama dengan bentuk API',
          ],
          [
            'Memakai `sort` pada array state untuk menampilkan terurut',
            'Datanya kan perlu diurutkan',
            'Ia mengubah state di tempat. Urutkan saat render dengan `toSorted`, dan jangan simpan hasil urutannya sebagai state',
          ],
          [
            'Menambahkan pustaka pembaru sejak awal',
            'Supaya tidak repot dengan spread',
            'Untuk struktur satu atau dua lapis, spread sudah cukup dan tanpa dependensi tambahan. Pertimbangkan pustaka setelah meratakan struktur ternyata tidak mungkin',
          ],
        ],
      ),
      p(
        'Baris keempat adalah keputusan yang paling berpengaruh dan paling sering diambil tanpa dipikirkan. Bentuk state tidak harus meniru bentuk respons API. Server mungkin mengirim struktur bersarang karena itu bentuk yang efisien untuk dikirim, dan yang enak dipakai komponen bisa berbeda jauh. Meratakannya saat data masuk adalah pekerjaan sekali yang menghemat setiap pembaruan sesudahnya.',
      ),
      callout(
        'tip',
        'Cara cepat memeriksa apakah kamu melanggar pantangan mutasi',
        'Cari `push`, `pop`, `splice`, `sort`, `reverse`, dan tanda sama dengan yang menulis ke properti, lalu periksa apakah targetnya berasal dari state atau props. Aturan lint React juga menandai sebagian di antaranya, dan pada project yang mengaktifkan React Compiler sebagian menjadi error saat membangun.',
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
    23,
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
            'Sama seperti di DOM, `target` adalah elemen yang **benar-benar** memicu, sedangkan `currentTarget` adalah tempat pendengarnya dipasang. Ada tambahan yang khas TypeScript. `currentTarget` bertipe tepat, sementara `target` sengaja longgar, jadi kalau tipenya terasa janggal biasanya kamu menginginkan `currentTarget`.',
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
      p(
        'Perbedaan ketiga baris ini cuma sepasang tanda kurung, tapi artinya sangat berbeda. Baris pertama **mengoper fungsinya**, sehingga React menyimpannya dan memanggilnya nanti saat tombol diklik. Baris kedua **memanggilnya sekarang**, saat JSX sedang dievaluasi, lalu mendaftarkan return value-nya sebagai handler. Karena `hapus` biasanya tidak mengembalikan fungsi, yang terdaftar akhirnya `undefined`. Baris ketiga menyelesaikan kebutuhan yang membuat orang tergoda menulis baris kedua, yaitu mengoper argumen. Caranya dengan membungkusnya dalam arrow function, sehingga yang **dioper** adalah arrow itu, dan `hapus(id)` di dalamnya baru berjalan saat arrow-nya dipanggil.',
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
      p(
        'React hanya menyediakan prop `on*` untuk event yang terjadi **pada elemen**, seperti klik, ketik, dan submit. Event yang terjadi pada `window` atau `document`, seperti `resize`, `scroll`, dan `online`/`offline`, tidak punya padanan prop, jadi harus dipasang sendiri lewat `useEffect`. Perhatikan `onResize` didefinisikan **di dalam** Effect dan bukan di badan komponen, sebab itu memastikan fungsi yang dipasang dan yang dilepas benar-benar objek yang sama, karena `removeEventListener` mencocokkan berdasarkan alamat fungsi. `{ passive: true }` adalah janji bahwa handler ini tidak akan memanggil `preventDefault`, sehingga browser tidak perlu menunggunya. Dan `return () => ...` adalah pembersihan yang wajib ada, dengan alasan yang dijelaskan di kotak berikut.',
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
      p(
        'Ketiganya membatalkan perilaku bawaan browser yang berjalan **otomatis** kalau tidak dicegah. Form yang di-submit tanpa `preventDefault` akan memuat ulang seluruh halaman, kebiasaan lama sebelum JavaScript menangani form. Tautan `href="#"` tanpa `preventDefault` akan menggulir halaman ke atas. Dan yang paling mudah terlupa, `onDragOver` tanpa `preventDefault` membuat `onDrop` di elemen yang sama **tidak pernah terpicu sama sekali**, karena browser memperlakukan area itu sebagai "tidak menerima drop" secara default kecuali kamu menyatakan sebaliknya di `onDragOver`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tabel produk punya baris yang bisa diklik untuk membuka detail, dan di dalam tiap baris ada tombol hapus. Mengklik tombol hapus membuka detail **dan** menghapus barisnya. Setelah diperbaiki dengan menghentikan perambatan, muncul masalah baru, yaitu menu dropdown di halaman itu berhenti menutup saat pengguna mengklik di luar.',
      ),
      p(
        'Keduanya adalah masalah yang sama dengan yang dibahas di Bab 4 Frontend Basic, dan di React ada satu detail tambahan, yaitu React tidak memasang penangan pada elemennya melainkan pada akar aplikasi.',
      ),
      code(
        'tsx',
        `
        function BarisProduk({ produk, onBuka, onHapus }: Props) {
          return (
            <tr onClick={() => onBuka(produk.id)}>
              <td>{produk.nama}</td>
              <td>
                <button
                  type="button"
                  onClick={(peristiwa) => {
                    // Hentikan perambatan supaya baris tidak ikut terbuka.
                    peristiwa.stopPropagation();
                    onHapus(produk.id);
                  }}
                >
                  Hapus
                </button>
              </td>
            </tr>
          );
        }
        `,
        { filename: 'src/produk/BarisProduk.tsx' },
      ),
      p(
        'Ini pemakaian `stopPropagation` yang sah, sebab tombol hapus memang berada **di dalam** baris yang bisa diklik dan keduanya menangani peristiwa yang sama. Tanpa itu, klik pada tombol merambat naik ke `tr` dan memicu penangan barisnya juga. Yang perlu diwaspadai adalah efek sampingnya terhadap penangan lain yang dipasang lebih tinggi.',
      ),
      code(
        'tsx',
        `
        // Penangan "klik di luar" yang TETAP bekerja walaupun ada stopPropagation.
        useEffect(() => {
          function tanganiKlikLuar(peristiwa: MouseEvent) {
            if (!menuRef.current?.contains(peristiwa.target as Node)) setBuka(false);
          }
          // Fase CAPTURE berjalan turun, jadi ia sudah lewat sebelum
          // stopPropagation di elemen dalam sempat memutusnya.
          document.addEventListener('click', tanganiKlikLuar, { capture: true });
          return () => document.removeEventListener('click', tanganiKlikLuar, { capture: true });
        }, []);
        `,
        { caption: 'Fase capture menyelesaikan bentrokan tanpa menghapus `stopPropagation`.' },
      ),
      p(
        'Peristiwa melewati dua fase, yaitu turun dari akar ke sasaran yang disebut capture, lalu naik kembali yang disebut bubbling. `stopPropagation` yang dipanggil pada fase naik tidak mempengaruhi penangan yang sudah berjalan pada fase turun. Memasang penangan klik di luar pada fase capture membuatnya kebal terhadap `stopPropagation` di elemen mana pun di dalamnya.',
      ),
      code(
        'tsx',
        `
        // Perbedaan target dan currentTarget, dan kenapa itu penting di React.
        <tr onClick={(e) => {
          e.target;         // elemen yang BENAR-BENAR diklik, bisa <td> atau <button>
          e.currentTarget;  // selalu <tr>, yaitu tempat penangan dipasang
        }}>

        // Setelah await, currentTarget menjadi null.
        <button onClick={async (e) => {
          const tombol = e.currentTarget;   // salin DULU
          await simpan();
          tombol.disabled = false;          // aman
          // e.currentTarget di sini sudah null
        }}>
        `,
        { caption: 'Salin `currentTarget` di baris pertama kalau penanganmu asinkron.' },
      ),
      p(
        'React memakai kembali object peristiwa dan membersihkan sebagian propertinya setelah penangan selesai berjalan secara sinkron. Karena `await` mengembalikan kendali, sisa fungsi berjalan setelah pembersihan itu. Menyalin nilai yang dibutuhkan ke variabel di baris pertama menutup seluruh kelas bug ini, dan kebiasaan itu layak dipakai untuk setiap penangan asinkron.',
      ),
      p(
        'Perlu diketahui React tidak memasang penangan pada tiap elemen melainkan satu penangan pada akar aplikasi, lalu meneruskannya ke komponen yang tepat. Ini persis pola delegasi dari Bab 4 Frontend Basic, dan konsekuensinya satu, yaitu penangan yang kamu pasang sendiri dengan `addEventListener` pada `document` akan berjalan **sesudah** penangan React pada fase bubbling.',
      ),
      callout(
        'warning',
        '`preventDefault` harus dipanggil sebelum `await`',
        'Sama seperti di Bab 4 Frontend Basic, peluang membatalkan perilaku bawaan hanya ada selama penangan berjalan sinkron. Menulis `await periksa()` lalu `e.preventDefault()` tidak akan menghentikan pengiriman formulir. Panggil di baris pertama, lalu kerjakan sisanya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat menangani peristiwa di React, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        <button onClick={hapus(produk.id)}>Hapus</button>

        // hapus() berjalan SAAT RENDER. Kalau ia memanggil setState:
        Error: Too many re-renders. React limits the number of renders
        to prevent an infinite loop.
        `,
        { caption: 'Tanda kurung ikut ditulis, sehingga fungsinya dipanggil terlalu awal.' },
      ),
      p(
        'Ini kesalahan satu karakter yang gejalanya bergantung pada isi fungsinya. Kalau `hapus` hanya mencatat, ia berjalan sekali saat render dan tombolnya diam. Kalau ia memanggil setter, terbentuk putaran tak berujung yang dihentikan React dengan error di atas. Bungkus menjadi `onClick={() => hapus(produk.id)}`.',
      ),
      code(
        'text',
        `
        <button onClick={async (e) => {
          await simpan();
          e.currentTarget.disabled = false;
        }}>

        TypeError: Cannot read properties of null (reading 'disabled')
        `,
        { caption: '`currentTarget` dibersihkan setelah penangan selesai sinkron.' },
      ),
      p(
        'Perhatikan `e.target` tidak mengalami hal yang sama dan tetap bisa dibaca, sehingga sebagian orang menggantinya begitu saja. Itu memperbaiki errornya dan bisa menunjuk elemen yang salah, misalnya ikon di dalam tombol. Yang benar adalah menyalin `currentTarget` ke variabel di baris pertama penangan.',
      ),
      code(
        'text',
        `
        <div onClick={tutupMenu}>
          <button onClick={(e) => { e.stopPropagation(); pilih(); }}>Pilih</button>
        </div>

        // Menu tidak menutup. Dan penangan lain di document juga tidak berjalan.
        `,
        { caption: '`stopPropagation` memutus seluruh penangan di atasnya.' },
      ),
      p(
        'Tidak ada error, dan yang rusak justru bagian lain aplikasi yang tidak ada hubungannya. Ini yang membuat `stopPropagation` berbahaya sebagai perbaikan cepat, yaitu dampaknya melewati batas komponen. Pakai hanya kalau memang ada dua penangan untuk peristiwa yang sama dalam satu pohon yang kamu kendalikan, dan untuk penangan global pakai fase capture.',
      ),
      code(
        'text',
        `
        <form onSubmit={async (e) => {
          await periksa();
          e.preventDefault();
        }}>

        // Halaman tetap memuat ulang. Tidak ada error.
        `,
        { caption: '`preventDefault` dipanggil setelah `await`.' },
      ),
      p(
        'Begitu `await` menyerahkan giliran, React menganggap penanganmu selesai dan peramban melanjutkan pengiriman formulir. Gejalanya berupa halaman yang berkedip lalu memuat ulang, dan seluruh state hilang. Panggil `preventDefault` sebagai baris pertama, lalu kerjakan pemeriksaannya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Too many re-renders` saat halaman dimuat',
            'Tanda kurung ikut ditulis pada penangan',
            'Bungkus menjadi fungsi panah',
          ],
          [
            '`Cannot read properties of null` pada `currentTarget`',
            'Dibaca setelah `await`',
            'Salin ke variabel di baris pertama penangan',
          ],
          [
            'Penangan di tempat lain berhenti bekerja',
            '`stopPropagation` memutus perambatan',
            'Pakai fase capture untuk penangan global, atau perbaiki syaratnya',
          ],
          [
            'Halaman memuat ulang saat formulir dikirim',
            '`preventDefault` dipanggil setelah `await`',
            'Panggil sebagai baris pertama',
          ],
          [
            'Penangan tidak terpanggil untuk klik di ikon dalam tombol',
            '`e.target` dipakai tanpa `closest`',
            'Pakai `e.currentTarget`, atau `e.target.closest(...)`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penangan peristiwa di React terlihat sama dengan DOM biasa, dan sebagian besar kesalahan di bawah berasal dari perbedaan kecil yang tidak terlihat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `onClick={fungsi(arg)}`',
            'Bentuknya seperti memanggil fungsi',
            'Fungsinya berjalan saat render, bukan saat diklik. Bungkus dengan fungsi panah',
          ],
          [
            'Memakai `stopPropagation` untuk memperbaiki penangan yang bentrok',
            'Masalahnya langsung hilang',
            'Ia memutus penangan lain di seluruh pohon di atasnya, termasuk yang menutup menu. Perbaiki syaratnya, atau pakai fase capture',
          ],
          [
            'Memasang `addEventListener` sendiri di dalam komponen',
            'Itu cara yang sudah dikuasai',
            'Ia bercampur dengan sistem peristiwa React dan urutannya sulit diprediksi. Pakai prop `onClick` kecuali memang butuh peristiwa yang React tidak sediakan',
          ],
          [
            'Membaca `e.currentTarget` setelah `await`',
            'Objectnya kan masih ada',
            'React membersihkannya setelah penangan selesai sinkron. Salin ke variabel lebih dulu',
          ],
          [
            'Memakai `onKeyPress`',
            'Namanya paling langsung',
            'Sudah usang dan tidak menangkap seluruh tombol. Pakai `onKeyDown` dan periksa `e.key`',
          ],
          [
            'Memasang penangan klik pada `div` alih-alih `button`',
            'Tampilannya lebih bebas diatur',
            'Tidak bisa difokus keyboard dan Enter tidak bekerja. Pakai `button` lalu atur gayanya, seperti aturan di Bab 4 Frontend Basic',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah pelanggaran aksesibilitas yang paling sering di kode React, dan ia mudah dihindari. Elemen `button` memberi fokus keyboard, memicu `onClick` lewat Enter dan spasi, dan diumumkan sebagai tombol oleh pembaca layar. Semuanya gratis. Kalau kamu memakai `div`, ketiganya harus dibangun ulang dengan `tabIndex`, penangan keyboard, dan `role`, dan hampir selalu ada yang terlewat.',
      ),
      callout(
        'info',
        'Kenapa React memakai satu penangan di akar',
        'Memasang satu penangan lalu meneruskannya ke komponen yang tepat jauh lebih hemat daripada memasang ribuan penangan pada tiap elemen, dan ia juga membuat komponen yang baru dibuat langsung menerima peristiwa tanpa pemasangan ulang. Ini persis alasan yang sama dengan pola delegasi di Bab 4 Frontend Basic, diterapkan oleh pustakanya sendiri.',
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
    24,
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
            'Terjemahannya **satu source of truth**. Pada input controlled, sumbernya adalah state React; pada uncontrolled, sumbernya adalah DOM. Yang berbahaya adalah **mencampur keduanya** — menyimpan nilai di state sekaligus membiarkan DOM memegangnya sendiri berarti dua sumber yang pasti berselisih.',
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
        'React memegang source of truth-nya. Setiap ketikan memicu render, dan nilai yang tampil selalu berasal dari state.',
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
          ['Integrasi dengan library non-React', 'Uncontrolled'],
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
      p(
        "Peringatan ini muncul karena React menentukan mode sebuah input dari **ada tidaknya `value`**, dan `undefined` dianggap tidak ada. Jadi `useState()` tanpa argumen membuat input itu lahir sebagai *uncontrolled*. Begitu pengguna mengetik dan `nilai` menjadi string, input yang sama berpindah menjadi *controlled*, dan React memperingatkan karena perpindahan itu membuang keadaan yang sudah ada di elemen DOM-nya. Perbaikannya sederhana, yaitu beri nilai awal `''` supaya `value` selalu berupa string sejak render pertama. Aturan yang berlaku umum, **input controlled tidak boleh pernah menerima `undefined`**, jadi kalau nilainya bisa kosong, pakai `''` dan bukan `undefined` maupun `null`.",
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
      p(
        'Peringatan kedua ini menandai input yang **terkunci tanpa disengaja**. Begitu `value` diberikan, React yang memegang kendali penuh atas isinya, dan tanpa `onChange` tidak ada apa pun yang memperbarui state saat pengguna mengetik, sehingga React langsung menggambar ulang nilai lamanya. Bagi pengguna, inputnya terlihat normal tapi tidak bisa diketik sama sekali. Dua baris perbaikan mewakili dua niat yang berbeda. Kalau memang harus bisa diubah, pasangkan `onChange`, dan kalau memang sengaja tidak boleh diubah, nyatakan dengan `readOnly`. Cara kedua lebih baik daripada membiarkan peringatannya, karena `readOnly` juga memberi tahu pembaca layar bahwa field itu tidak untuk diisi.',
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
      p(
        "Ini bentuk paling umum dari peringatan pertama tadi, dan penyebabnya bukan kelalaian melainkan **urutan waktu**. Halaman dirender sebelum data tiba, jadi `pengguna` masih `undefined` di render pertama dan baru terisi beberapa ratus milidetik kemudian. Menulis `value={pengguna?.nama ?? ''}` memang menghindari `undefined`, tapi menimbulkan masalah lain, karena isian yang sudah diketik pengguna akan tertimpa begitu data tiba. Baris terakhir menunjukkan jalan keluar yang sudah dibahas di Bab 2. `key={pengguna?.id}` membuat React **membuang form lama dan memasang yang baru** saat identitas penggunanya berubah, sehingga state di dalamnya lahir sudah berisi data yang benar, tanpa `useEffect` penyalin dan tanpa render yang menampilkan nilai lama.",
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
      h2('Studi kasus di project nyata'),
      p(
        'Formulir alamat pengiriman punya delapan kolom. Versi pertama membuat delapan state dan delapan penangan perubahan, dan berkasnya seratus baris sebelum satu baris logika pun ditulis. Versi kedua menghapus seluruh state dan membaca nilainya saat dikirim, dan tiba-tiba fitur validasi per kolom menjadi mustahil. Keduanya benar untuk kebutuhan yang berbeda, dan yang salah adalah memilih tanpa menimbang.',
      ),
      table(
        ['Kebutuhan', 'Terkendali', 'Tak terkendali'],
        [
          ['Validasi sambil mengetik', '**Bisa**', 'Tidak, kecuali membaca DOM'],
          ['Menonaktifkan tombol kirim saat kosong', '**Bisa**', 'Tidak langsung'],
          ['Memformat sambil mengetik, misalnya nomor kartu', '**Bisa**', 'Tidak'],
          ['Menyalin nilai satu kolom ke kolom lain', '**Bisa**', 'Tidak'],
          [
            'Sekadar mengumpulkan nilai saat dikirim',
            'Bisa, dan berlebihan',
            '**Lebih sederhana**',
          ],
          ['Jumlah kolom banyak', 'Satu state per kolom, berisik', '**Satu `FormData`**'],
        ],
        'Yang menentukan adalah apakah kamu butuh bereaksi sebelum formulir dikirim.',
      ),
      code(
        'tsx',
        `
        // TERKENDALI: dipakai karena tombol harus mati saat kolom belum sah,
        // dan karena nomor telepon diformat sambil diketik.
        function FormKontak() {
          const [nilai, setNilai] = useState({ nama: '', telepon: '' });

          const teleponSah = /^08[0-9]{8,11}$/.test(nilai.telepon);
          const bolehKirim = nilai.nama.trim() !== '' && teleponSah;

          function ubah(kolom: keyof typeof nilai, isi: string) {
            setNilai((n) => ({ ...n, [kolom]: isi }));
          }

          return (
            <form onSubmit={kirim}>
              <input
                value={nilai.nama}
                onChange={(e) => ubah('nama', e.currentTarget.value)}
              />
              <input
                value={nilai.telepon}
                inputMode="numeric"
                onChange={(e) => ubah('telepon', e.currentTarget.value.replace(/\\D/g, ''))}
                aria-invalid={nilai.telepon !== '' && !teleponSah}
              />
              <button type="submit" disabled={!bolehKirim}>Kirim</button>
            </form>
          );
        }
        `,
        { filename: 'src/kontak/FormKontak.tsx' },
      ),
      p(
        'Satu object state untuk seluruh kolom menggantikan delapan state terpisah, dan fungsi `ubah` yang menerima nama kolom menggantikan delapan penangan. Bentuk `[kolom]: isi` di dalamnya adalah nama properti terhitung yang sudah dibahas di Bab 1 Frontend Basic. Bentuk fungsi pada setter dipakai karena nilai barunya dihitung dari nilai lama, dan itu aturan dari Sub-bab 4.3.',
      ),
      p(
        'Perhatikan `teleponSah` dan `bolehKirim` **tidak** disimpan sebagai state melainkan dihitung saat render. Keduanya bisa disimpulkan sepenuhnya dari `nilai`, sehingga menyimpannya berarti dua sumber kebenaran yang harus dijaga tetap cocok. Ini nilai turunan, dan pembahasan lengkapnya ada di Sub-bab 4.9.',
      ),
      code(
        'tsx',
        `
        // TAK TERKENDALI: delapan kolom, dan tidak ada yang perlu direaksi
        // sebelum tombol kirim ditekan.
        function FormAlamat({ onSimpan }: { onSimpan: (d: Alamat) => void }) {
          function kirim(peristiwa: FormEvent<HTMLFormElement>) {
            peristiwa.preventDefault();
            const data = new FormData(peristiwa.currentTarget);

            onSimpan({
              nama: String(data.get('nama') ?? '').trim(),
              telepon: String(data.get('telepon') ?? '').trim(),
              kodePos: String(data.get('kodePos') ?? '').trim(),   // TETAP teks
              jadikanUtama: data.has('jadikanUtama'),               // centang: keberadaannya
            });
          }

          return (
            <form onSubmit={kirim}>
              <input name="nama" required defaultValue={alamat?.nama} />
              <input name="telepon" required pattern="08[0-9]{8,11}" />
              <input name="kodePos" required inputMode="numeric" />
              <input name="jadikanUtama" type="checkbox" />
              <button type="submit">Simpan</button>
            </form>
          );
        }
        `,
        { filename: 'src/alamat/FormAlamat.tsx' },
      ),
      p(
        'Versi ini nol state dan tetap punya validasi, yaitu lewat atribut `required` dan `pattern` yang ditangani peramban. Pesan galatnya sudah diterjemahkan mengikuti bahasa peramban dan sudah dibacakan pembaca layar dengan benar, seperti dibahas di Bab 5 Frontend Basic. Untuk formulir yang hanya perlu diperiksa saat dikirim, ini bentuk yang lebih sedikit kodenya dan lebih baik aksesibilitasnya.',
      ),
      p(
        'Perhatikan `defaultValue`, bukan `value`. Perbedaannya menentukan, yaitu `defaultValue` hanya menetapkan nilai awal lalu membiarkan peramban yang mengurus sisanya, sedangkan `value` membuat React mengambil alih sepenuhnya. Memakai `value` tanpa `onChange` menghasilkan kolom yang tidak bisa diketik sama sekali, dan itu peringatan yang dibahas di bagian error.',
      ),
      callout(
        'tip',
        'Keduanya boleh dipakai bersama dalam satu formulir',
        'Tidak ada aturan yang mengharuskan seluruh kolom seragam. Kolom yang butuh reaksi langsung dibuat terkendali, dan sisanya dibiarkan tak terkendali lalu dibaca lewat `FormData` saat dikirim. Untuk formulir panjang dengan satu atau dua kolom khusus, campuran ini justru bentuk yang paling sedikit kodenya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat peringatan berikut diuji dengan React 19 sungguhan, dan keempatnya menandai kesalahan yang nyata.',
      ),
      code(
        'text',
        `
        <input value="x" />

        Warning: You provided a \`value\` prop to a form field without an
        \`onChange\` handler. This will render a read-only field. If the field
        should be mutable use \`defaultValue\`.
        `,
        { caption: 'Kolom terkendali tanpa penangan perubahan tidak bisa diketik.' },
      ),
      p(
        'Pesannya bahkan menyebut kedua jalan keluarnya. Kalau yang kamu maksud nilai awal, pakai `defaultValue`. Kalau kamu memang ingin mengendalikannya, tambahkan `onChange`. Ada satu kasus ketiga yang sah, yaitu kolom yang memang harus dibaca saja, dan untuk itu tambahkan `readOnly` supaya maksudnya tertulis dan peringatannya hilang.',
      ),
      code(
        'text',
        `
        <input value={profil.bio} onChange={ubah} />
        // profil.bio bernilai null

        Warning: \`value\` prop on \`input\` should not be null. Consider using
        an empty string to clear the component or \`undefined\` for
        uncontrolled components.
        `,
        { caption: 'Nilai `null` dari server masuk langsung ke kolom terkendali.' },
      ),
      p(
        "Ini terjadi setiap kali data dari server punya field yang boleh kosong, seperti dibahas di Bab 6 Frontend Basic. Nilai `null` membuat React bingung antara terkendali dan tak terkendali. Perbaikannya `value={profil.bio ?? ''}`, dan tanda tanya ganda dipakai bukan `||` supaya teks kosong yang sah tidak ikut tergantikan.",
      ),
      code(
        'text',
        `
        <select defaultValue="a">
          <option value="a" selected>A</option>
        </select>

        Warning: Use the \`defaultValue\` or \`value\` props on <select>
        instead of setting \`selected\` on <option>.
        `,
        { caption: 'Kebiasaan HTML biasa dibawa apa adanya ke React.' },
      ),
      p(
        'Di HTML biasa, pilihan awal ditandai dengan atribut `selected` pada `option`. React memindahkan tanggung jawab itu ke elemen `select` supaya ada satu tempat yang menentukan, dan itu konsisten dengan cara kolom lain bekerja. Hal yang sama berlaku untuk `textarea`, yang di HTML diisi lewat anak dan di React lewat `value` atau `defaultValue`.',
      ),
      code(
        'text',
        `
        <input type="checkbox" value={setuju} onChange={ubah} />

        // Hasil: <input type="checkbox" value="true">
        // Centangnya tidak pernah tercentang. Tidak ada peringatan.
        `,
        { caption: 'Centang memakai `checked`, bukan `value`.' },
      ),
      p(
        'Diuji sungguhan, dan hasilnya atribut `value` berisi teks `true` sementara centangnya tetap kosong. Tidak ada peringatan sebab `value` memang atribut yang sah untuk centang, hanya artinya berbeda yaitu nilai yang dikirim saat tercentang. Yang mengatur tercentang atau tidak adalah `checked`. Kesalahan ini sangat sering dan gejalanya berupa centang yang tidak pernah bisa dicentang.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`You provided a \\`value\\` prop ... without an \\`onChange\\` handler`',
            'Kolom terkendali tanpa penangan perubahan',
            'Tambahkan `onChange`, pakai `defaultValue`, atau tambahkan `readOnly`',
          ],
          [
            '`\\`value\\` prop on \\`input\\` should not be null`',
            'Field yang boleh kosong dari server masuk langsung',
            "Pakai `value={nilai ?? \\'\\'}`",
          ],
          [
            '`Use the \\`defaultValue\\` or \\`value\\` props on <select>`',
            'Atribut `selected` dipakai pada `option`',
            'Pindahkan ke `value` atau `defaultValue` pada `select`',
          ],
          [
            'Centang tidak pernah tercentang',
            '`value` dipakai, seharusnya `checked`',
            'Ganti menjadi `checked`',
          ],
          [
            'Kolom berubah dari tak terkendali menjadi terkendali',
            'Nilai awalnya `undefined` lalu berubah menjadi teks',
            'Beri nilai awal teks kosong, jangan `undefined`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memilih antara terkendali dan tak terkendali sering diputuskan tanpa menimbang, dan sebagian besar kesalahan di bawah berasal dari memakai yang terkendali untuk hal yang tidak membutuhkannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat satu state untuk tiap kolom',
            'Tiap kolom kan berbeda',
            'Delapan kolom berarti delapan state dan delapan penangan. Kumpulkan menjadi satu object, atau pakai `FormData`',
          ],
          [
            'Memakai kolom terkendali untuk semua formulir',
            'Katanya itu cara React',
            'Untuk formulir yang hanya dibaca saat dikirim, ia menambah state dan penggambaran ulang tiap ketikan tanpa manfaat',
          ],
          [
            'Memakai `value` untuk centang',
            'Kolom lain memakai `value`',
            'Centang memakai `checked`. `value` pada centang berarti nilai yang dikirim, bukan keadaannya',
          ],
          [
            'Memberi nilai awal `undefined` pada kolom terkendali',
            'Datanya belum ada',
            'React menganggapnya tak terkendali lalu berubah menjadi terkendali, dan itu memicu peringatan. Beri teks kosong',
          ],
          [
            'Menyimpan hasil validasi sebagai state',
            'Supaya tidak dihitung ulang',
            'Ia bisa disimpulkan dari nilainya, jadi dua sumber kebenaran. Hitung saat render',
          ],
          [
            'Mengganti seluruh validasi bawaan dengan validasi sendiri',
            'Supaya seragam dengan desain',
            'Pesan bawaan sudah diterjemahkan dan sudah dibacakan pembaca layar. Ganti hanya aturan yang tidak bisa dinyatakan atribut',
          ],
        ],
      ),
      p(
        'Baris keempat menghasilkan peringatan yang khas dan sering membingungkan. Kalau nilai awal `useState` berupa `undefined` lalu diisi setelah data dari server tiba, React melihat kolom itu berubah dari tak terkendali menjadi terkendali di tengah jalan. Perbaikannya memberi teks kosong sebagai nilai awal, atau tidak merender formulirnya sama sekali sampai datanya ada.',
      ),
      callout(
        'info',
        'Aturan memilih dalam satu pertanyaan',
        'Tanyakan apakah ada sesuatu yang harus terjadi **sebelum** pengguna menekan tombol kirim. Kalau ya, misalnya menonaktifkan tombol, memformat sambil mengetik, atau menampilkan sisa karakter, kolomnya terkendali. Kalau tidak, tak terkendali dengan `FormData` lebih sedikit kodenya dan lebih baik aksesibilitasnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Controlled: React source of truth-nya, render tiap ketikan.',
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
    24,
    'Dari form sederhana ke form yang benar-benar dipakai — beserta alasan pindahnya.',
    [
      terms(
        {
          term: 'React Hook Form',
          meaning:
            'Library form yang bekerja dengan pendekatan **uncontrolled**, sehingga mengetik di satu field **tidak merender seluruh form**. Perlu ditegaskan: ia bukan keharusan. Form dengan dua atau tiga field cukup dengan `useState` — library ini menang saat fieldnya banyak dan validasinya rumit.',
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
            'Jembatan antara React Hook Form dan library skema seperti Zod. Manfaatnya besar: aturan validasi ditulis **sekali sebagai skema**, lalu dipakai di form **dan** di server — sehingga keduanya tidak mungkin berselisih.',
        },
        {
          term: 'Zod',
          meaning:
            'Library pendefinisi skema yang memeriksa bentuk data **saat program berjalan**, sekaligus menghasilkan tipe TypeScript-nya. Inilah yang menutup celah dari Sub-bab 6.10 Frontend Basic: TypeScript sudah dihapus saat build, jadi data dari luar tetap butuh pemeriksaan sungguhan.',
        },
        {
          term: 'validasi berlapis',
          meaning:
            'Aturan yang tidak berubah sejak Frontend Basic: validasi klien untuk **kenyamanan**, validasi server untuk **keamanan**. Library form secanggih apa pun tidak mengubah ini — siapa pun bisa mengirim permintaan langsung tanpa membuka halamanmu.',
        },
        {
          term: 'mode validasi',
          meaning:
            'Ini menentukan kapan validasi dijalankan, apakah `onSubmit` (bawaan), `onBlur`, atau `onChange`. Pola yang paling nyaman dipakai adalah **diam sampai submit pertama**, lalu setelah itu validasi tiap ketikan, sehingga pengguna tidak dimarahi sebelum sempat mengetik.',
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
      p(
        'Kunci penghematannya ada pada `[name]: value` di dalam `setForm`, yaitu **computed key** dari Frontend Basic yang dipakai supaya satu fungsi `ubah` melayani semua field. Atribut `name` di tiap `<input>` yang menentukan field mana yang diperbarui, jadi menambah field baru cukup dengan menambah satu `<input>` bernama, tanpa menambah state maupun handler. Perhatikan juga bentuk updater `(f) => ({ ...f, ... })` yang dipakai alih-alih `{ ...form, ... }`, karena nilai barunya dihitung dari yang lama, sesuai aturan di sub-bab batching. Dan `const { name, value } = e.target` di baris pertama hanya destructuring biasa untuk memendekkan dua baris berikutnya.',
      ),
      callout(
        'warning',
        'Setiap ketikan melakukan re-render SELURUH form',
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
        // Skema Zod bisa dipakai di kedua sisi — satu source of truth
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
      p(
        'Baris impornya yang paling penting, karena **skema yang sama** diimpor dari berkas bersama dan bukan ditulis ulang. Itu menutup masalah klasik validasi ganda, yaitu aturan di klien dan server yang perlahan menyimpang karena satu diperbarui dan yang lain lupa. `safeParse` dipilih alih-alih `parse` supaya kegagalan datang sebagai nilai yang bisa diperiksa dan bukan error yang harus ditangkap, sedangkan `error.flatten()` mengubahnya menjadi bentuk yang mudah dipetakan ke field di form. Status `422` dipakai, bukan `400`, karena bentuk permintaannya sebenarnya sudah benar dan yang gagal adalah **isinya** menurut aturan bisnis. Perhatikan komentar terakhir. Setelah `safeParse` lolos, `hasil.data` sudah bertipe, jadi kode di bawahnya tidak perlu memeriksa apa pun lagi.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Formulir pendaftaran punya enam kolom, validasi per kolom, tombol kirim yang mati saat ada kesalahan, dan penanganan galat dari server yang harus menyorot kolom yang bermasalah. Versi pertama menyimpan enam state nilai ditambah enam state pesan galat ditambah satu state sedang mengirim, yaitu tiga belas state untuk satu formulir. Setengah bug yang muncul berasal dari salah satunya lupa direset.',
      ),
      p(
        'Bentuk di bawah memakai tiga state saja, dan sisanya dihitung. Perbedaannya bukan jumlah baris melainkan jumlah hal yang bisa tidak sinkron.',
      ),
      code(
        'tsx',
        `
        type Nilai = { nama: string; email: string; sandi: string };
        type Galat = Partial<Record<keyof Nilai, string>>;

        function periksa(nilai: Nilai): Galat {
          const galat: Galat = {};
          if (nilai.nama.trim().length < 3) galat.nama = 'Nama minimal 3 karakter';
          if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(nilai.email)) galat.email = 'Email tidak sah';
          if (nilai.sandi.length < 8) galat.sandi = 'Kata sandi minimal 8 karakter';
          return galat;
        }

        export function FormDaftar({ onDaftar }: Props) {
          const [nilai, setNilai] = useState<Nilai>({ nama: '', email: '', sandi: '' });
          const [disentuh, setDisentuh] = useState<Partial<Record<keyof Nilai, boolean>>>({});
          const [mengirim, setMengirim] = useState(false);
          const [galatServer, setGalatServer] = useState<Galat>({});

          // DIHITUNG, bukan disimpan. Tidak mungkin tidak sinkron.
          const galat = { ...periksa(nilai), ...galatServer };
          const bolehKirim = Object.keys(galat).length === 0 && !mengirim;

          function ubah(kolom: keyof Nilai, isi: string) {
            setNilai((n) => ({ ...n, [kolom]: isi }));
            // Galat dari server hilang begitu kolomnya disentuh lagi.
            setGalatServer((g) => ({ ...g, [kolom]: undefined }));
          }

          return (
            <form onSubmit={kirim} noValidate>
              <Kolom
                label="Nama"
                nilai={nilai.nama}
                galat={disentuh.nama ? galat.nama : undefined}
                onUbah={(v) => ubah('nama', v)}
                onBlur={() => setDisentuh((d) => ({ ...d, nama: true }))}
              />
              {/* dua kolom lain dengan pola yang sama */}
              <button type="submit" disabled={!bolehKirim}>Daftar</button>
            </form>
          );
        }
        `,
        { filename: 'src/daftar/FormDaftar.tsx' },
      ),
      p(
        'Keputusan yang paling menentukan di sini adalah `galat` **dihitung** dari `nilai`, bukan disimpan. Karena itu mustahil ada keadaan di mana nilainya sudah benar tapi pesan galatnya masih tampil. Dengan enam state galat terpisah, keadaan itu terjadi setiap kali ada satu jalur yang lupa mengosongkannya, dan jalur seperti itu selalu ada.',
      ),
      p(
        'State `disentuh` menyelesaikan masalah pengalaman yang sangat nyata, yaitu formulir yang menampilkan tiga pesan galat merah sebelum pengguna sempat mengetik satu huruf pun. Dengan menandai kolom yang sudah pernah kehilangan fokus, pesan galat hanya muncul setelah pengguna benar-benar meninggalkan kolom itu. Ini pola yang dipakai hampir seluruh pustaka formulir.',
      ),
      p(
        'Atribut `noValidate` pada formulir mematikan validasi bawaan peramban, dan itu disengaja di sini. Karena kamu sudah menampilkan pesan galat sendiri per kolom, dialog bawaan peramban justru menampilkan dua pesan untuk satu masalah. Yang perlu diingat, mematikan validasi bawaan berarti kamu bertanggung jawab penuh atas pengalamannya, termasuk mengumumkan galat ke pembaca layar.',
      ),
      code(
        'tsx',
        `
        // Kolom yang menghubungkan label, kolom, dan pesan galat dengan benar.
        function Kolom({ label, nilai, galat, onUbah, onBlur }: KolomProps) {
          const id = useId();
          const idGalat = \`\${id}-galat\`;

          return (
            <div>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                value={nilai}
                onChange={(e) => onUbah(e.currentTarget.value)}
                onBlur={onBlur}
                aria-invalid={galat ? true : undefined}
                aria-describedby={galat ? idGalat : undefined}
              />
              {galat ? (
                <p id={idGalat} role="alert" className="galat">{galat}</p>
              ) : null}
            </div>
          );
        }
        `,
        { filename: 'src/ui/Kolom.tsx' },
      ),
      p(
        'Tiga atribut di sini yang membuat formulirnya bisa dipakai pengguna pembaca layar. Atribut `htmlFor` dan `id` menghubungkan label ke kolomnya, sehingga mengklik label memfokuskan kolom dan pembaca layar mengumumkan namanya. Atribut `aria-describedby` menghubungkan pesan galat ke kolomnya, sehingga pesannya dibacakan setelah nama kolom. Atribut `role="alert"` membuat pesan yang baru muncul langsung diumumkan.',
      ),
      p(
        'Hook `useId` menghasilkan id yang unik dan stabil, dan ia memang dibuat untuk keperluan ini. Memakai nilai acak biasa akan menghasilkan id berbeda antara render di server dan di klien, dan itu menyebabkan ketidakcocokan hidrasi. Memakai id tetap seperti `nama` akan bentrok kalau komponennya dipakai dua kali di satu halaman.',
      ),
      callout(
        'danger',
        'Validasi di klien tidak pernah menggantikan validasi di server',
        'Seluruh pemeriksaan di sub-bab ini adalah pengalaman pengguna, bukan keamanan. Siapa pun bisa mengirim permintaan langsung tanpa lewat formulirmu. Server wajib memeriksa ulang seluruhnya, dan aturan ini mengikat di project ini. Yang dibahas di sini hanya bagaimana memberi tahu pengguna lebih cepat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada formulir React, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        <input value={nilai.nama} />

        Warning: You provided a \`value\` prop to a form field without an
        \`onChange\` handler. This will render a read-only field.
        `,
        { caption: 'Kolom terkendali tanpa penangan, dan tidak bisa diketik.' },
      ),
      p(
        'Gejalanya sangat jelas, yaitu kolomnya benar-benar tidak bisa diketik sama sekali. Yang sering terjadi adalah `onChange` ada tapi salah nama, misalnya `onchange` dengan huruf kecil semua. Pada project tanpa TypeScript, kesalahan itu tidak menghasilkan error apa pun dan gejalanya persis sama. Ini salah satu alasan paling langsung memakai TypeScript untuk kode React.',
      ),
      code(
        'text',
        `
        // Kolom email masih kosong, dan pengguna belum menyentuhnya.
        // Halaman sudah menampilkan: "Email tidak sah"
        `,
        { caption: 'Galat ditampilkan sebelum pengguna sempat mengetik.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah pengalamannya. Formulir yang menyambut pengguna dengan tiga pesan merah terasa menghakimi dan membuat sebagian orang meninggalkannya. Penjaga `disentuh` pada studi kasus menutup ini. Pilihan lain yang juga umum adalah menampilkan galat hanya setelah tombol kirim ditekan sekali, dan keduanya sah.',
      ),
      code(
        'text',
        `
        onSubmit={async (e) => {
          const data = new FormData(e.currentTarget);
          await kirim(data);
        }}

        // Halaman memuat ulang, dan seluruh isian hilang.
        `,
        { caption: '`preventDefault` tidak dipanggil.' },
      ),
      p(
        'Ini kegagalan yang paling merugikan pada formulir panjang, sebab seluruh yang sudah diketik pengguna hilang. Tanpa `preventDefault`, peramban mengirim formulir ke alamat di atribut `action` lalu memuat halaman baru. Panggil sebagai baris pertama, sebelum `await` apa pun, seperti dibahas di Sub-bab 4.5.',
      ),
      code(
        'text',
        `
        // Pengiriman gagal karena email sudah terdaftar.
        // Formulir dikosongkan, dan pengguna harus mengetik ulang semuanya.
        `,
        { caption: 'Isian dibuang pada kegagalan.' },
      ),
      p(
        'Ini kesalahan yang paling menyakitkan bagi pengguna sekaligus paling mudah dihindari. Kosongkan formulir hanya setelah pengiriman **berhasil**, dan pada kegagalan pertahankan seluruh isinya sambil menyorot kolom yang bermasalah. Aturan ini sudah ada di baseline frontend project ini, yaitu jangan pernah membuang apa yang sudah diketik pengguna.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Kolom tidak bisa diketik',
            '`value` diberikan tanpa `onChange`',
            'Tambahkan `onChange`, dan periksa ejaan namanya',
          ],
          [
            'Pesan galat muncul sebelum pengguna mengetik',
            'Galat ditampilkan tanpa penjaga',
            'Tampilkan hanya setelah kolomnya disentuh, atau setelah tombol kirim ditekan',
          ],
          [
            'Halaman memuat ulang saat dikirim',
            '`preventDefault` tidak dipanggil, atau dipanggil setelah `await`',
            'Panggil sebagai baris pertama penangan',
          ],
          [
            'Isian hilang setelah pengiriman gagal',
            'Formulir dikosongkan tanpa memeriksa hasilnya',
            'Kosongkan hanya setelah berhasil',
          ],
          [
            'Pesan galat tidak dibacakan pembaca layar',
            'Tidak ada `aria-describedby` dan `role="alert"`',
            'Hubungkan pesan ke kolomnya, dan tandai sebagai peringatan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Formulir adalah tempat data pengguna masuk, dan sebagian besar kesalahan di bawah berujung pada pengalaman yang buruk atau data yang salah tersimpan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan pesan galat sebagai state terpisah per kolom',
            'Tiap kolom punya galatnya sendiri',
            'Dua sumber kebenaran yang harus dijaga sinkron, dan selalu ada jalur yang lupa mengosongkannya. Hitung galat dari nilainya',
          ],
          [
            'Menampilkan seluruh galat sejak halaman dibuka',
            'Supaya pengguna tahu apa yang diminta',
            'Terasa menghakimi dan membuat sebagian orang meninggalkan formulir. Tampilkan setelah kolomnya disentuh',
          ],
          [
            'Mengosongkan formulir pada kegagalan',
            'Supaya diisi ulang dengan benar',
            'Kehilangan data yang sudah diketik adalah kegagalan pengalaman yang paling menyakitkan dan paling mudah dihindari',
          ],
          [
            'Menonaktifkan tombol kirim tanpa menjelaskan kenapa',
            'Supaya tidak bisa mengirim yang salah',
            'Pengguna tidak tahu apa yang kurang. Sertakan pesan, atau biarkan tombolnya aktif lalu tampilkan galat saat ditekan',
          ],
          [
            'Menaruh pesan galat umum di atas formulir',
            'Cukup memberi tahu ada yang salah',
            'Pengguna harus mencari sendiri kolom mana yang bermasalah. Taruh di sebelah kolomnya',
          ],
          [
            'Memakai `id` tetap pada komponen kolom yang dipakai berulang',
            'Idnya kan sudah unik',
            'Dua kolom dengan id sama membuat label menunjuk kolom yang salah. Pakai `useId`',
          ],
        ],
      ),
      p(
        'Baris keempat punya jalan keluar yang sering diabaikan. Tombol kirim yang mati tanpa penjelasan membuat pengguna menekannya berkali-kali lalu menyerah. Dua pilihan yang lebih baik, yaitu membiarkan tombolnya aktif lalu menampilkan seluruh galat saat ditekan sambil memindahkan fokus ke kolom pertama yang bermasalah, atau menonaktifkannya sambil menampilkan ringkasan apa yang masih kurang di sebelahnya.',
      ),
      callout(
        'tip',
        'Kapan pustaka formulir mulai sepadan',
        'Untuk formulir dengan tiga sampai lima kolom, bentuk di studi kasus sudah cukup dan tanpa dependensi tambahan. Pustaka mulai sepadan saat ada kolom bersarang, array kolom yang bisa ditambah, validasi yang bergantung antar-kolom, atau formulir bertahap. Pilih setelah kebutuhannya nyata, bukan sebelum itu.',
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
          note: 'Validasi bawaan HTML yang sering sudah cukup sebelum menambah library apa pun.',
        },
      ),
    ],
  ),

  written(
    'lifting-state',
    'Lifting State Up',
    21,
    'Menaikkan state ke induk terdekat yang membutuhkannya — dan biaya menaikkannya terlalu tinggi.',
    [
      terms(
        {
          term: 'lifting state up',
          meaning:
            'Terjemahannya **menaikkan state ke atas**. Memindahkan state ke **induk terdekat yang dibutuhkan bersama** oleh komponen-komponen yang memerlukannya. Dilakukan ketika dua sibling component harus melihat data yang sama — karena data hanya mengalir turun, satu-satunya cara adalah menaikkannya ke induk mereka.',
        },
        {
          term: 'induk terdekat bersama',
          meaning:
            'Terjemahan dari *closest common ancestor*. Komponen terendah yang **membungkus semua** komponen yang membutuhkan data itu. Kata "terendah" penting: menaikkan lebih tinggi dari yang perlu justru menimbulkan masalahnya sendiri.',
        },
        {
          term: 'biaya menaikkan terlalu tinggi',
          meaning:
            'Tiga akibat yang nyata: setiap perubahan **melakukan re-render seluruh cabang** di bawahnya, komponen di tengah jadi harus mengoper props yang tidak ia pakai (prop drilling), dan komponen daun kehilangan kemandiriannya. Karena itu aturannya: **serendah mungkin, tapi setinggi yang diperlukan**.',
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
            'Library seperti Zustand atau Redux. Kebutuhannya jauh lebih jarang daripada yang orang duga — sebagian besar yang terasa butuh state global sebenarnya **server state** (data dari API), dan itu punya alatnya sendiri. Dibahas di bab tersendiri nanti.',
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
        'Dua sibling component tidak bisa saling melihat state-nya. Solusinya: naikkan ke induk terdekat yang memuat keduanya.',
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
        'State di komponen akar berarti setiap perubahannya melakukan re-render seluruh pohon. Selain itu, komponen-komponen di antaranya jadi harus meneruskan props yang tidak mereka pakai — prop drilling. Naikkan seperlunya, tidak lebih.',
      ),

      h2('Menaikkan bukan satu-satunya jawaban'),
      table(
        ['Situasi', 'Solusi'],
        [
          ['Dua sibling component berdekatan', '**Lifting state**'],
          ['Melewati banyak lapisan yang tidak memakainya', 'Composition (`children`)'],
          ['Dibutuhkan banyak cabang berjauhan', 'Context'],
          ['Harus bisa dibagikan lewat tautan', 'URL (`searchParams`)'],
          ['Source of truthnya di server', 'Cache server (TanStack Query)'],
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
      p(
        'Bandingkan berapa kali kata `pengguna` muncul di kedua baris, yaitu tiga kali di atas dan satu kali di bawah. Pada versi pertama, `Layout` dan `Sidebar` sama-sama menerima `pengguna` padahal **tidak satu pun memakainya**, sehingga keduanya hanya jadi kurir. Versi kedua merakit susunannya **di tempat `p` memang tersedia**, lalu mengoper hasilnya yang sudah jadi sebagai prop `sidebar`. Dari sudut pandang `Layout`, yang ia terima cuma JSX siap render, dan ia tidak tahu serta tidak perlu tahu ada data pengguna di dalamnya. Perlu ditegaskan ini **bukan** pengganti lifting state, karena nilai `p` tetap dimiliki komponen di atas. Yang dihapus composition adalah kewajiban meneruskannya lapis demi lapis, dan itu masalah yang berbeda.',
      ),

      h2('Menurunkan state kembali'),
      code(
        'tsx',
        `
        // Kalau ternyata hanya satu komponen yang memakainya, TURUNKAN.
        // Sisa state di induk yang tidak lagi dipakai adalah utang:
        // ia tetap melakukan re-render seluruh cabang untuk perubahan yang
        // sebenarnya hanya dipedulikan satu komponen.
        `,
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman katalog punya panel filter di kiri dan daftar produk di kanan, dan keduanya komponen terpisah. Panel filter menyimpan kata pencarian di statenya sendiri, dan daftar produk tidak punya cara mengetahuinya. Solusi cepat yang sering dipilih adalah menyimpan nilainya di variabel modul, dan itu bekerja sampai ada dua katalog di satu halaman yang saling mengganggu.',
      ),
      p(
        'Jalan keluarnya adalah memindahkan state ke induk terdekat yang dimiliki keduanya, dan itulah yang disebut mengangkat state. Yang perlu diputuskan adalah **seberapa tinggi**, sebab terlalu tinggi punya biayanya sendiri.',
      ),
      code(
        'tsx',
        `
        // Induk terdekat yang dimiliki KEDUANYA. Bukan lebih tinggi dari itu.
        function PanelKatalog() {
          const [filter, setFilter] = useState<Filter>({ cari: '', kategori: '' });

          return (
            <div className="katalog">
              <SidebarFilter nilai={filter} onUbah={setFilter} />
              <DaftarProduk filter={filter} />
            </div>
          );
        }

        function SidebarFilter({ nilai, onUbah }: SidebarProps) {
          return (
            <aside>
              <input
                value={nilai.cari}
                onChange={(e) => onUbah({ ...nilai, cari: e.currentTarget.value })}
              />
              <PilihKategori
                nilai={nilai.kategori}
                onUbah={(k) => onUbah({ ...nilai, kategori: k })}
              />
            </aside>
          );
        }
        `,
        { filename: 'src/katalog/PanelKatalog.tsx' },
      ),
      p(
        'Pola yang terbentuk di sini punya nama, yaitu komponen terkendali. `SidebarFilter` tidak menyimpan apa pun dan hanya menerima nilai beserta cara mengubahnya. Ini bentuk yang sama dengan kolom formulir terkendali di Sub-bab 4.6, dan keunggulannya sama, yaitu ada tepat satu tempat yang menyimpan kebenaran sehingga tidak mungkin ada dua nilai yang berbeda.',
      ),
      p(
        'Perhatikan `PanelKatalog` adalah induk **terdekat** yang memiliki keduanya, bukan komponen halaman atau komponen aplikasi. Mengangkat lebih tinggi dari yang dibutuhkan menyebabkan seluruh saudara di tingkat itu ikut digambar ulang pada tiap ketikan, dan itu masalah yang dibahas di Sub-bab 4.1. Naikkan tepat sampai induk bersama, lalu berhenti.',
      ),
      code(
        'tsx',
        `
        // Kalau jarak antara pemilik dan pemakai terlalu jauh, props berantai
        // adalah gejala, bukan penyakitnya.

        // BURUK: 'tema' dilewatkan lima tingkat, dan tiga di antaranya
        // sama sekali tidak memakainya.
        <Halaman tema={tema}>
          <Isi tema={tema}>
            <Panel tema={tema}>
              <Kartu tema={tema}>
                <Tombol tema={tema} />

        // Dua jalan keluar, dan yang pertama sering cukup:
        // 1. Komposisi — kirim elemennya, bukan datanya.
        <Halaman>
          <Isi>
            <Panel>
              <Kartu>
                <Tombol tema={tema} />    {/* dibuat di tempat tema tersedia */}

        // 2. Konteks — untuk nilai yang benar-benar dibutuhkan banyak tingkat.
        `,
        { caption: 'Komposisi menyelesaikan sebagian besar kasus props berantai.' },
      ),
      p(
        'Jalan keluar pertama sering dilewatkan padahal ia yang paling sederhana. Karena elemen React hanya object seperti dibahas di Bab 6 Frontend Basic, ia bisa dibuat di tempat datanya tersedia lalu dikirim sebagai `children`. Komponen di antaranya tidak perlu tahu apa pun tentang `tema`. Konteks baru diperlukan kalau nilainya dibutuhkan di banyak cabang yang berbeda, dan pembahasannya ada di bab jenis komponen.',
      ),
      p(
        'Ada satu tanda yang layak diperhatikan, yaitu kalau kamu mengangkat state lalu menemukan induknya tidak memakainya sama sekali dan hanya meneruskan, itu berarti kamu mengangkat terlalu tinggi atau seharusnya memakai komposisi. State yang diangkat sebaiknya benar-benar dipakai induknya, minimal untuk meneruskan ke dua anak yang berbeda.',
      ),
      callout(
        'tip',
        'Urutan yang jarang keliru saat memutuskan letak state',
        'Mulai dengan menaruhnya di komponen yang memakainya. Kalau ternyata komponen lain membutuhkannya, cari induk terdekat yang memiliki keduanya lalu angkat ke sana. Kalau jaraknya lebih dari dua tingkat, coba komposisi lebih dulu. Kalau nilainya dibutuhkan di banyak cabang yang berbeda, barulah konteks.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Mengangkat state jarang melempar. Yang muncul adalah dua nilai yang tidak cocok, atau tampilan yang berhenti bereaksi.',
      ),
      code(
        'text',
        `
        function Sidebar({ nilai, onUbah }) {
          const [lokal, setLokal] = useState(nilai);   // menyalin props ke state
          return <input value={lokal} onChange={(e) => setLokal(e.target.value)} />;
        }

        // Induk mengubah 'nilai'. Sidebar tetap menampilkan yang lama.
        `,
        { caption: 'Props disalin ke state, dan salinannya tidak pernah diperbarui.' },
      ),
      p(
        'Ini kesalahan yang paling sering saat mengangkat state setengah jalan. Argumen `useState` hanya dibaca sekali seperti dibahas di Sub-bab 4.1, sehingga perubahan dari induk tidak pernah sampai. Yang lebih buruk, sekarang ada dua nilai yang bisa berbeda dan tidak ada yang tahu mana yang benar. Hapus state lokalnya, dan pakai props apa adanya.',
      ),
      code(
        'text',
        `
        <Sidebar nilai={filter} />
        // onUbah tidak diberikan

        // Kolom tidak bisa diketik. Tidak ada error kalau propsnya opsional.
        `,
        { caption: 'Komponen terkendali tanpa cara mengubah nilainya.' },
      ),
      p(
        'Komponen terkendali menuntut dua hal, yaitu nilai dan cara mengubahnya. Memberikan satu tanpa yang lain menghasilkan komponen yang tampil benar dan tidak bisa disentuh. Dengan TypeScript, menandai `onUbah` sebagai wajib membuat kesalahan ini ditolak sebelum dijalankan. Tanpa TypeScript, gejalanya persis sama dengan kolom `value` tanpa `onChange`.',
      ),
      code(
        'text',
        `
        function Panel() {
          const [filter, setFilter] = useState({ cari: '' });

          return <Sidebar onUbah={(cari) => setFilter({ cari })} />;
          // Field lain di dalam filter hilang setiap kali cari diubah.
        }
        `,
        { caption: 'Object diganti seluruhnya, bukan disebar lalu diubah.' },
      ),
      p(
        'Ini pelanggaran pantangan mutasi versi kebalikannya, yaitu bukan mengubah di tempat melainkan mengganti terlalu banyak. Object baru hanya memuat `cari`, sehingga `kategori` dan seluruh field lain lenyap. Tidak ada error, dan gejalanya berupa filter kategori yang tereset setiap kali pengguna mengetik. Pakai `setFilter((f) => ({ ...f, cari }))`.',
      ),
      code(
        'text',
        `
        // Mengetik satu huruf di sidebar menggambar ulang seluruh halaman,
        // termasuk kepala, kaki, dan tiga panel yang tidak berhubungan.
        `,
        { caption: 'State diangkat lebih tinggi daripada yang dibutuhkan.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa halaman yang terasa berat. Cara menemukannya adalah menyalakan Highlight updates di React DevTools, yang membuat komponen berkedip saat digambar ulang. Kalau seluruh halaman berkedip untuk perubahan yang hanya menyentuh satu panel, statenya berada terlalu tinggi. Turunkan sampai induk bersama yang sesungguhnya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Anak tidak mengikuti perubahan dari induk',
            'Props disalin ke state lokal',
            'Hapus state lokalnya, pakai props apa adanya',
          ],
          [
            'Komponen tampil benar tapi tidak bisa disentuh',
            'Nilai diberikan tanpa cara mengubahnya',
            'Kirim penanganya juga, dan tandai wajib di tipe props',
          ],
          [
            'Field lain hilang saat satu diubah',
            'Object diganti seluruhnya',
            'Sebar nilai lamanya, yaitu `{ ...f, cari }`',
          ],
          [
            'Seluruh halaman berkedip untuk perubahan kecil',
            'State diangkat lebih tinggi daripada yang dibutuhkan',
            'Turunkan ke induk bersama terdekat',
          ],
          [
            'Props diteruskan lima tingkat tanpa dipakai di tengah',
            'Jarak antara pemilik dan pemakai terlalu jauh',
            'Pakai komposisi, atau konteks kalau memang banyak cabang',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Mengangkat state adalah keputusan struktur, dan sebagian besar kesalahan di bawah berasal dari mengangkat terlalu jauh atau setengah jalan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh seluruh state di komponen paling atas',
            'Supaya bisa dijangkau semua',
            'Setiap perubahan menggambar ulang seluruh pohon. Angkat tepat sampai induk bersama',
          ],
          [
            'Menyalin props ke state supaya bisa diubah di dalam',
            'Datanya kan perlu berubah',
            'Dua sumber kebenaran yang bisa berbeda, dan salinannya tidak mengikuti perubahan induk',
          ],
          [
            'Memakai variabel modul untuk berbagi antar-komponen',
            'Paling cepat dan bekerja',
            'Dibagi seluruh instance, sehingga dua panel di satu halaman saling mengganggu. Dan perubahannya tidak memicu penggambaran ulang',
          ],
          [
            'Meneruskan props lima tingkat',
            'Datanya memang dibutuhkan di bawah',
            'Tiga komponen di tengah harus tahu sesuatu yang bukan urusannya. Pakai komposisi atau konteks',
          ],
          [
            'Memakai konteks untuk semua state yang dibagi dua komponen',
            'Supaya tidak perlu meneruskan',
            'Konteks membuat setiap pembacanya digambar ulang saat nilainya berubah. Untuk dua komponen bersebelahan, mengangkat ke induk lebih tepat',
          ],
          [
            'Mengangkat state lalu induknya hanya meneruskan',
            'Induknya kan yang memiliki',
            'Itu tanda seharusnya memakai komposisi. State yang diangkat sebaiknya benar-benar dipakai induknya',
          ],
        ],
      ),
      p(
        'Baris ketiga layak diwaspadai karena ia sering dipilih di awal dan biayanya baru terasa jauh kemudian. Variabel modul memang dibagi antar-komponen, dan itu justru masalahnya. Ia dibagi oleh **seluruh** instance di seluruh aplikasi, sehingga dua katalog di satu halaman akan saling menimpa filternya. Ditambah lagi, mengubahnya tidak memicu penggambaran ulang sehingga tampilannya tidak ikut berubah.',
      ),
      callout(
        'info',
        'Pola terkendali ini akan muncul lagi di seluruh kategori',
        'Komponen yang menerima nilai beserta cara mengubahnya adalah bentuk yang sama dengan kolom formulir terkendali, dengan komponen pilihan tanggal, dan dengan hampir seluruh komponen pustaka UI. Sekali polanya dikenali, sebagian besar API komponen pihak ketiga menjadi mudah ditebak, sebab mereka memakai bentuk yang sama.',
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
    21,
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
            'Anti-pattern yang sangat umum: `useEffect` yang tugasnya menyalin satu state ke state lain. Selain tidak perlu, ia juga **menambah satu render** dan membuat aplikasi sempat menampilkan nilai yang belum diperbarui. Dokumentasi React membahasnya di halaman berjudul "You Might Not Need an Effect".',
        },
        {
          term: 'useMemo untuk turunan',
          meaning:
            'Dipakai **hanya kalau perhitungannya benar-benar mahal** — mengurutkan ribuan baris, misalnya. Untuk `reduce` atas dua puluh item, membungkusnya justru lebih mahal daripada menghitungnya. Dan dengan React Compiler, sebagian besar kasus ini sudah ditangani otomatis.',
        },
        {
          term: 'satu source of truth',
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
      p(
        'Perhatikan `tambah` **benar**, karena ketiga state diperbarui, dan komentar "harus ingat" menandai bahwa kebenarannya bergantung pada ingatan penulisnya. `hapus` menunjukkan apa yang terjadi ketika ingatan itu gagal. `items` berkurang tapi `total` dan `jumlah` tidak, dan sejak saat itu keranjang menampilkan angka yang tidak cocok dengan isinya. Yang membuatnya mahal adalah **jarak antara penyebab dan gejala**, sebab kesalahannya ada di fungsi `hapus` tapi yang terlihat rusak adalah ringkasan harga di bagian lain halaman. Dan seperti kata kotak berikut, ini bukan masalah ketelitian, karena tiap tempat baru yang menyentuh `items` menambah dua baris yang harus diingat, sehingga peluang terlewat hanya bertambah seiring aplikasinya tumbuh.',
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
        // Anti-pattern paling umum di React
        const [items, setItems] = useState([]);
        const [terfilter, setTerfilter] = useState([]);

        useEffect(() => {
          setTerfilter(items.filter((i) => i.aktif));
        }, [items]);

        // Perbaikan: satu baris, tanpa efek, tanpa render tambahan
        const terfilter = items.filter((i) => i.aktif);
        `,
      ),
      p(
        'Empat baris menjadi satu, dan yang hilang bukan cuma barisnya. Versi anti-pattern menyimpan `terfilter` sebagai state kedua lalu memakai `useEffect` untuk menjaganya tetap cocok, pola yang terlihat bertanggung jawab tapi menciptakan source of truth kedua. Biayanya disebut di kotak berikut. Karena Effect berjalan **setelah** render, selalu ada satu render yang menampilkan `terfilter` lama bersama `items` yang baru. Versi perbaikan menghapus keduanya sekaligus, sehingga tidak ada state kedua, tidak ada Effect, dan tidak ada render tambahan. Perhatikan `terfilter` di sana adalah `const` biasa yang dihitung ulang tiap render, dan itu memang cukup, karena menghitung ulang jauh lebih murah daripada menyimpan dan menyelaraskan.',
      ),
      callout(
        'warning',
        'Effect yang menyalin state selalu terlambat satu render',
        'Render pertama menampilkan nilai lama, effect berjalan, lalu render kedua menampilkan yang benar. Pengguna bisa melihat flicker — dan kamu membayar dua render untuk sesuatu yang bisa dihitung langsung.',
      ),

      h2('Kapan memoization diperlukan'),
      code(
        'tsx',
        `
        // Tidak perlu — filter atas seratus item jauh lebih murah daripada satu render
        const terfilter = items.filter((i) => i.aktif);

        // Perlu — perhitungan yang benar-benar berat
        const hasil = useMemo(() => analisis(sepuluhRibuBaris), [sepuluhRibuBaris]);
        `,
      ),
      p(
        'Komentar baris pertama menyebut perbandingan yang layak diingat, yaitu **menyaring seratus item jauh lebih murah daripada satu render.** Membungkusnya dengan `useMemo` justru menambah biaya, sebab React harus menyimpan hasilnya, membandingkan dependensinya tiap render, dan kamu menanggung risiko array dependensi yang salah. `useMemo` baru berbayar ketika perhitungannya benar-benar berat, seperti menganalisis sepuluh ribu baris di contoh kedua. Cara memutuskannya bukan menebak melainkan **mengukur** dengan React DevTools Profiler, sebab kalau sebuah perhitungan tidak muncul sebagai penyumbang waktu di sana, memoization tidak akan mengubah apa pun. Dan seperti disebut di kotak berikut, dengan React Compiler aktif sebagian besar keputusan ini sudah tidak perlu kamu ambil sendiri.',
      ),
      callout(
        'info',
        'React Compiler menangani sebagian besarnya',
        'Di React 19 dengan Compiler aktif, perhitungan turunan di-memoize otomatis. `useMemo` manual tinggal untuk perhitungan yang benar-benar mahal dan referensi yang dituntut library luar — sub-bab 2.10.',
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
      p(
        'Ini pengecualian penting supaya aturan "hitung, jangan simpan" tidak diterapkan berlebihan. `draft` memang **berasal** dari props, tetapi setelah itu ia hidup sendiri, sebab pengguna mengeditnya dan seluruh gunanya justru karena ia **tidak** lagi mengikuti props. Menghitungnya dari props akan membuang ketikan pengguna setiap kali induknya dirender. Jadi ia state sungguhan, dan `props.nilaiAwal` hanya dipakai sekali sebagai titik mulai, dan perhatikan namanya pun mengandung kata "awal". Yang tersisa adalah pertanyaan kapan draft harus dimulai ulang, dan jawabannya adalah `key` seperti di baris terakhir, sebab saat `item.id` berganti React membuang form lama beserta draftnya dan memasang yang baru.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman keranjang menyimpan tiga state, yaitu daftar barang, jumlah barang, dan total harga. Ketiganya diperbarui bersama setiap kali ada perubahan. Setelah fitur hapus barang ditambahkan, jumlahnya berkurang dan totalnya tidak, sebab jalur hapus lupa memperbarui yang ketiga. Setelah diperbaiki, fitur ubah jumlah ditambahkan dan masalah yang sama terjadi lagi di jalur yang berbeda.',
      ),
      p(
        'Ini bukan kelalaian melainkan konsekuensi struktur. Dua dari tiga nilai itu bisa disimpulkan sepenuhnya dari yang pertama, sehingga menyimpannya berarti tiga sumber kebenaran yang harus dijaga tetap cocok di setiap jalur perubahan.',
      ),
      compare(
        {
          title: 'Tiga state yang harus dijaga sinkron',
          lang: 'tsx',
          code: `
          const [barang, setBarang] = useState<Barang[]>([]);
          const [jumlah, setJumlah] = useState(0);
          const [totalSen, setTotalSen] = useState(0);

          function hapus(id: string) {
            const baru = barang.filter((b) => b.id !== id);
            setBarang(baru);
            setJumlah(baru.length);
            setTotalSen(baru.reduce((j, b) => j + b.hargaSen * b.jumlah, 0));
            // Tiga baris, dan tiap fitur baru harus mengingat ketiganya.
          }
          `,
          notes: ['Empat jalur perubahan berarti dua belas baris yang harus benar semua'],
        },
        {
          title: 'Satu state, dua nilai dihitung',
          lang: 'tsx',
          code: `
          const [barang, setBarang] = useState<Barang[]>([]);

          // Dihitung saat render. Mustahil tidak sinkron.
          const jumlah = barang.length;
          const totalSen = barang.reduce((j, b) => j + b.hargaSen * b.jumlah, 0);

          function hapus(id: string) {
            setBarang(barang.filter((b) => b.id !== id));
            // Satu baris. Selesai.
          }
          `,
          notes: ['Menambah fitur baru tidak bisa lupa memperbarui apa pun'],
        },
      ),
      p(
        'Selisihnya bukan jumlah baris melainkan **jumlah keadaan yang tidak masuk akal**. Di kolom kiri, keadaan di mana `barang` berisi dua item sementara `jumlah` bernilai tiga adalah keadaan yang bisa terjadi. Di kolom kanan, keadaan itu tidak bisa ditulis sama sekali. Ini gagasan yang sama dengan membuat keadaan salah menjadi mustahil dari Bab 2 Frontend Basic.',
      ),
      p(
        'Kekhawatiran yang biasanya muncul adalah perhitungan itu berjalan pada tiap render. Untuk `barang.length` dan `reduce` atas beberapa puluh item, biayanya di bawah satu mikrodetik dan tidak akan pernah terukur. Kekhawatiran itu baru relevan untuk perhitungan yang benar-benar mahal atas ribuan baris, dan untuk itu ada `useMemo` yang dibahas di Bab 7. Ukur lebih dulu, sebab hampir selalu jawabannya tidak perlu.',
      ),
      code(
        'tsx',
        `
        // Cara mengenali nilai turunan: coba jawab dari mana nilainya berasal.
        const [barang, setBarang] = useState<Barang[]>([]);
        const [cari, setCari] = useState('');
        const [halaman, setHalaman] = useState(1);

        // Semuanya TURUNAN. Tidak satu pun layak jadi state.
        const terlihat = barang.filter((b) => b.nama.toLowerCase().includes(cari.toLowerCase()));
        const totalHalaman = Math.max(1, Math.ceil(terlihat.length / 20));
        const halamanAman = Math.min(halaman, totalHalaman);   // jaga tetap dalam rentang
        const potongan = terlihat.slice((halamanAman - 1) * 20, halamanAman * 20);
        const kosong = terlihat.length === 0;
        const adaFilter = cari.trim() !== '';
        `,
        { filename: 'src/keranjang/Daftar.tsx' },
      ),
      p(
        'Baris `halamanAman` menunjukkan pola yang berguna, yaitu menyesuaikan nilai state saat render alih-alih memperbaikinya lewat efek. Kalau pengguna berada di halaman lima lalu menyaring sehingga hanya tersisa satu halaman, membiarkan `halaman` bernilai lima akan menampilkan daftar kosong. Membatasinya saat render menyelesaikannya seketika, sedangkan memperbaikinya lewat efek menghasilkan satu render tambahan dengan tampilan yang salah di antaranya.',
      ),
      p(
        'Aturan untuk mengenali nilai turunan bisa diringkas satu pertanyaan, yaitu bisakah nilai ini dihitung dari state dan props yang sudah ada. Kalau jawabannya ya, ia bukan state. Ada satu pengecualian yang sah, yaitu ketika perhitungannya benar-benar mahal **dan** sudah terbukti lewat pengukuran, dan untuk itu jawabannya tetap bukan state melainkan `useMemo`.',
      ),
      callout(
        'warning',
        'Menyinkronkan dua state dengan `useEffect` hampir selalu keliru',
        'Pola yang sering ditulis adalah efek yang mengawasi satu state lalu menyetel state lain. Itu menghasilkan dua render untuk satu perubahan, dan di antara keduanya ada satu render dengan nilai yang belum sinkron. Kalau nilai kedua bisa dihitung dari yang pertama, hitung saat render dan efeknya tidak diperlukan sama sekali. Ini dibahas tuntas di Bab 7.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Nilai turunan yang disimpan sebagai state hampir tidak pernah melempar. Yang muncul adalah dua angka yang tidak cocok, dan itu jenis bug yang paling sulit dipercaya saat dilaporkan.',
      ),
      code(
        'text',
        `
        // Keranjang berisi 2 barang.
        // Badge di kepala halaman menampilkan: 3

        // Tidak ada error. Salah satu jalur lupa memperbarui 'jumlah'.
        `,
        { caption: 'Dua sumber kebenaran yang menyimpang.' },
      ),
      p(
        'Gejalanya khas, yaitu dua tempat menampilkan angka berbeda untuk hal yang sama. Yang membuatnya sulit ditelusuri adalah penyebabnya bukan di tempat angkanya salah melainkan di jalur perubahan yang lupa memperbarui. Dengan empat jalur perubahan, kamu harus memeriksa keempatnya. Menghapus state turunannya menyelesaikan seluruh kelas bug ini sekaligus.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          setTotal(barang.reduce((j, b) => j + b.hargaSen, 0));
        }, [barang]);

        // Bekerja, dan menghasilkan DUA render untuk satu perubahan.
        // Di antara keduanya, 'total' masih nilai lama.
        `,
        { caption: 'Menyinkronkan state dengan efek, dan ada satu render yang salah.' },
      ),
      p(
        'Render pertama terjadi karena `barang` berubah, dan pada render itu `total` masih nilai lama sehingga tampilannya salah sesaat. Efek berjalan setelahnya, menyetel `total`, dan memicu render kedua yang benar. Untuk perhitungan cepat, kedipan itu mungkin tidak terlihat mata. Untuk yang lebih berat, ia terlihat jelas. Hitung saat render, dan kedua masalahnya hilang.',
      ),
      code(
        'text',
        `
        const [halaman, setHalaman] = useState(1);
        // Pengguna di halaman 5, lalu menyaring sehingga tersisa 1 halaman.

        // Daftar kosong. Tidak ada error, dan tidak ada penjelasan bagi pengguna.
        `,
        { caption: 'State yang tidak lagi masuk akal setelah state lain berubah.' },
      ),
      p(
        'Nomor halaman adalah state yang sah, sebab ia tidak bisa disimpulkan dari yang lain. Yang tidak sah adalah membiarkannya keluar dari rentang yang mungkin. Membatasinya saat render dengan `Math.min(halaman, totalHalaman)` menyelesaikannya tanpa efek dan tanpa render tambahan. Ini pola yang berguna untuk seluruh state yang rentang sahnya bergantung pada state lain.',
      ),
      code(
        'text',
        `
        const [terpilih, setTerpilih] = useState<Barang | null>(null);
        // Barang yang terpilih dihapus dari daftar.

        // Panel detail masih menampilkan barang yang sudah tidak ada.
        `,
        { caption: 'Menyimpan seluruh object alih-alih penandanya.' },
      ),
      p(
        'Menyimpan object utuh sebagai state menciptakan salinan yang bisa basi begitu sumbernya berubah. Simpan **id**-nya saja, lalu cari objectnya saat render dengan `barang.find((b) => b.id === idTerpilih)`. Hasilnya `undefined` kalau barangnya sudah tidak ada, dan itu keadaan yang bisa kamu tangani secara eksplisit. Ini pola yang berlaku untuk seluruh pemilihan, baik baris tabel, tab aktif, maupun item yang sedang disunting.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Dua tempat menampilkan angka berbeda',
            'Nilai turunan disimpan sebagai state terpisah',
            'Hapus statenya, hitung saat render',
          ],
          [
            'Tampilan salah sesaat lalu benar',
            'State disinkronkan lewat efek, sehingga ada dua render',
            'Hitung saat render, hapus efeknya',
          ],
          [
            'Daftar kosong setelah menyaring',
            'Nomor halaman keluar dari rentang yang mungkin',
            'Batasi saat render dengan `Math.min`',
          ],
          [
            'Panel detail menampilkan data yang sudah dihapus',
            'Object utuh disimpan sebagai state',
            'Simpan idnya, cari objectnya saat render',
          ],
          [
            'Perhitungan terasa berat pada daftar sangat panjang',
            'Perhitungan mahal dijalankan tiap render',
            'Bungkus dengan `useMemo`, setelah diukur',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Nilai turunan adalah sumber bug terbesar di seluruh bab ini, dan hampir seluruhnya bisa dicegah dengan satu pertanyaan sebelum menambahkan state.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan jumlah, total, atau hasil filter sebagai state',
            'Supaya tidak dihitung ulang tiap render',
            'Sumber kebenaran kedua yang harus dijaga di setiap jalur perubahan, dan selalu ada yang terlewat',
          ],
          [
            'Menyinkronkan dua state dengan `useEffect`',
            'Efek memang untuk bereaksi terhadap perubahan',
            'Dua render untuk satu perubahan, dan satu di antaranya menampilkan nilai yang belum sinkron',
          ],
          [
            'Menyimpan object utuh yang dipilih',
            'Supaya bisa langsung dipakai',
            'Salinannya basi begitu sumbernya berubah. Simpan idnya, cari saat render',
          ],
          [
            'Mengoptimalkan perhitungan sebelum mengukur',
            'Perhitungan di render pasti mahal',
            '`length` dan `reduce` atas puluhan item tidak akan pernah terukur. Ukur lebih dulu',
          ],
          [
            'Menyimpan hasil pemformatan sebagai state',
            'Supaya tidak diformat ulang',
            'Ia terikat pada nilai mentahnya dan harus diperbarui bersama. Format saat menampilkan',
          ],
          [
            'Membiarkan state keluar dari rentang yang mungkin',
            'Nilainya kan diatur pengguna',
            'Nomor halaman lima pada daftar satu halaman menghasilkan tampilan kosong. Batasi saat render',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan karena ia pola yang paling sering ditulis dan paling sering keliru. Efek dirancang untuk menyinkronkan dengan sesuatu **di luar** React, misalnya jaringan, timer, atau API peramban. Menyinkronkan satu state dengan state lain bukan itu, dan hampir selalu berarti salah satunya seharusnya bukan state. Bab 7 membahas ini dengan judul tersendiri, dan itu menunjukkan seberapa sering ia terjadi.',
      ),
      callout(
        'tip',
        'Satu pertanyaan sebelum menambahkan `useState`',
        'Bisakah nilai ini dihitung dari state atau props yang sudah ada. Kalau ya, ia bukan state melainkan variabel biasa di atas `return`. Pertanyaan sepuluh detik itu menghapus sebagian besar bug sinkronisasi sebelum ia sempat ditulis.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Nilai yang bisa dihitung dari state lain tidak boleh disimpan.',
        'Effect yang menyalin state adalah tanda paling jelas adanya state turunan.',
        'Effect penyalin selalu terlambat satu render dan bisa terlihat berkedip.',
        'Ganti `key` untuk mereset state, jangan effect yang mengawasi props.',
        'Memoization hanya untuk perhitungan yang benar-benar mahal.',
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
          note: 'Termasuk catatan resmi bahwa sebagian besar perhitungan tidak perlu di-memoize.',
        },
      ),
    ],
  ),

  written(
    'usereducer',
    '`useReducer` untuk State yang Rumit',
    25,
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
            'Pure function bertanda tangan `(state, action) => stateBaru`. Namanya dari `Array.prototype.reduce` di Sub-bab 1.9 Frontend Basic — gagasannya sama persis: mengambil nilai berjalan dan satu masukan, lalu menghasilkan nilai berjalan berikutnya. Karena ia pure function biasa, ia bisa diuji tanpa React sama sekali.',
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
            'Masalah yang diselesaikan sub-bab ini. Tiga state terpisah, yaitu `data`, `memuat`, dan `error`, menghasilkan **delapan kombinasi**, dan hanya sekitar empat yang masuk akal. "Sedang memuat sekaligus punya error" bisa ditulis, tidak berarti apa-apa, dan tidak ada yang mencegahnya.',
        },
        {
          term: 'state machine',
          meaning:
            'Terjemahannya **mesin keadaan**. Menyimpan keadaan sebagai **satu nilai berhingga** seperti `"diam" | "memuat" | "berhasil" | "gagal"`, sehingga hanya keadaan yang sah yang bisa ada. Reducer adalah cara alami mewujudkannya, karena ia satu tempat yang mengatur seluruh perpindahan.',
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
      p(
        'Tiga `useState` di atas terlihat wajar dan memang sangat umum, tapi masalahnya baru terlihat kalau kombinasinya dihitung. Ketiganya bisa berubah **secara terpisah**, jadi tidak ada apa pun yang mencegah `memuat: true` hidup bersama `error` dan `data` sekaligus, seperti dicontohkan komentar terakhir. Delapan kombinasi, hanya empat yang punya arti. Yang berbahaya bukan kombinasi mustahilnya sendiri melainkan **cara ia muncul**. Setiap tempat yang memulai atau menyelesaikan permintaan harus ingat mengatur ketiganya, dan satu yang terlewat, misalnya lupa `setError(null)` saat mencoba lagi, meninggalkan pesan gagal yang tetap tampil di atas data yang sebenarnya sudah berhasil dimuat.',
      ),

      h2('Reducer membuat impossible state tidak bisa ditulis'),
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
      p(
        'Bandingkan tipe `Keadaan` di atas dengan tiga `useState` sebelumnya, sebab `pesan` **hanya ada** di varian `gagal`, dan `data` **hanya ada** di varian `berhasil`. Kombinasi mustahil tadi kini tidak bisa dituliskan sama sekali, bukan karena dicegah validasi melainkan karena tidak punya bentuk yang sah. Fungsi `reducer` di tengah adalah satu-satunya tempat keadaan berpindah, dan perhatikan ia **pure function** yang menerima keadaan lama dan aksi lalu mengembalikan keadaan baru, tanpa menyentuh apa pun di luar. Karena itu ia bisa diuji dengan memanggilnya langsung, tanpa merender komponen apa pun.',
      ),
      p(
        "Fungsi `muat` di bawahnya menunjukkan imbalan sehari-harinya. Tiga `dispatch` menggantikan enam pemanggilan `setState` yang harus diingat urutannya, dan tidak ada lagi kemungkinan `error` lama tertinggal saat mencoba ulang, karena `{ tipe: 'muat' }` **mengganti seluruh keadaan** dan bukan menambal sebagian. Blok `switch` terakhir menutup polanya. Keempat keadaan UI dari Frontend Basic Bab 5 terbaca berurutan, masing-masing sebagai satu baris, dan menambah keadaan kelima berarti menambah satu varian di tipe lalu satu `case`, dengan TypeScript yang menolak build kalau salah satunya lupa.",
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
        'Ini keunggulan terbesarnya: seluruh logika transisi jadi pure function yang bisa diuji tanpa jsdom, tanpa render, tanpa mock.',
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
      p(
        'Larangan ini datang langsung dari syarat "pure function" tadi. Reducer harus menghasilkan keadaan yang **sama untuk masukan yang sama, setiap kali** — dan React memang berhak memanggilnya lebih dari sekali, misalnya di bawah StrictMode. Kalau ada `fetch` di dalamnya, permintaan itu ikut berjalan dua kali, dan gejalanya muncul sebagai data ganda yang sangat sulit dilacak karena tidak ada satu pun baris yang terlihat memanggilnya dua kali. Perbaikannya memindahkan efek sampingnya ke pemanggil, dengan pola tiga langkah yang sudah kamu lihat: dispatch penanda mulai, kerjakan efeknya, dispatch hasilnya. Reducer tetap murni dan hanya mengurus **perpindahan keadaan**, bukan pekerjaan yang menimbulkannya.',
      ),

      h2('Nilai awal yang mahal'),
      code(
        'tsx',
        `
        // Argumen ketiga: fungsi inisialisasi, dipanggil sekali
        const [keadaan, dispatch] = useReducer(reducer, penggunaId, buatKeadaanAwal);
        `,
      ),
      p(
        '`useReducer` menerima **tiga** argumen di sini, dan argumen ketiga yang jarang dipakai justru yang berguna saat keadaan awalnya butuh perhitungan. Tanpa ia, kamu akan menulis `useReducer(reducer, buatKeadaanAwal(penggunaId))` — dan seperti pada `useState`, pemanggilan itu terjadi di **setiap** render meski hasilnya cuma dipakai sekali. Bentuk tiga argumen membalikkannya: `penggunaId` dioper sebagai bahan, `buatKeadaanAwal` dioper sebagai fungsi, dan React memanggilnya tepat sekali dengan bahan itu. Polanya sama persis dengan lazy initializer di sub-bab pertama bab ini, hanya bentuknya berbeda karena reducer perlu tahu bahan apa yang dipakai.',
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
      p(
        "Alasan memakai **dua** context terpisah, bukan satu yang membungkus `{ keadaan, dispatch }` sekaligus, sama dengan alasan yang dibahas di Bab 5 saat memisahkan nilai dari fungsi pengubahnya pada Context API. `dispatch` tidak pernah berubah identitasnya antar-render, sementara `keadaan` berubah setiap kali sebuah aksi diproses. Komponen yang hanya perlu memicu perubahan, misalnya sebuah tombol yang memanggil `dispatch({ tipe: 'reset' })`, cukup membaca `DispatchCtx`, dan karena context itu tidak pernah membawa nilai baru, komponen itu **tidak pernah ikut re-render** ketika `keadaan` berubah di tempat lain. Kalau keduanya digabung dalam satu context, setiap konsumen, termasuk tombol yang cuma mem-dispatch, akan ikut re-render setiap kali keadaannya berubah meski ia tidak pernah membaca isinya.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Alur checkout punya empat langkah, tombol maju dan mundur, validasi per langkah, dan kemampuan melompat ke langkah yang sudah pernah dilewati. Ditulis dengan `useState`, hasilnya lima state dan tujuh penangan yang masing-masing menyetel tiga hingga empat state sekaligus. Setelah fitur mundur ditambahkan, muncul keadaan di mana langkahnya mundur tapi penanda langkah selesainya tidak, dan tombol majunya mati padahal seharusnya aktif.',
      ),
      p(
        'Ini gejala yang khas, yaitu beberapa state yang selalu berubah bersama tapi diperbarui di banyak tempat. `useReducer` memindahkan seluruh aturan perubahannya ke satu tempat.',
      ),
      code(
        'tsx',
        `
        type Langkah = 'alamat' | 'pengiriman' | 'pembayaran' | 'konfirmasi';

        type Keadaan = {
          langkah: Langkah;
          selesai: Set<Langkah>;
          data: Partial<DataCheckout>;
          galat: string | null;
        };

        // Tiap aksi menyatakan APA YANG TERJADI, bukan apa yang harus diubah.
        type Aksi =
          | { jenis: 'isi'; bagian: Partial<DataCheckout> }
          | { jenis: 'maju' }
          | { jenis: 'mundur' }
          | { jenis: 'lompat'; ke: Langkah }
          | { jenis: 'gagal'; pesan: string };

        const URUTAN: Langkah[] = ['alamat', 'pengiriman', 'pembayaran', 'konfirmasi'];

        function reducer(keadaan: Keadaan, aksi: Aksi): Keadaan {
          switch (aksi.jenis) {
            case 'isi':
              return { ...keadaan, data: { ...keadaan.data, ...aksi.bagian }, galat: null };

            case 'maju': {
              const i = URUTAN.indexOf(keadaan.langkah);
              if (i >= URUTAN.length - 1) return keadaan;      // sudah di ujung
              return {
                ...keadaan,
                langkah: URUTAN[i + 1],
                selesai: new Set(keadaan.selesai).add(keadaan.langkah),
                galat: null,
              };
            }

            case 'mundur': {
              const i = URUTAN.indexOf(keadaan.langkah);
              if (i <= 0) return keadaan;
              return { ...keadaan, langkah: URUTAN[i - 1], galat: null };
            }

            case 'lompat':
              // Hanya boleh ke langkah yang SUDAH pernah diselesaikan.
              if (!keadaan.selesai.has(aksi.ke)) return keadaan;
              return { ...keadaan, langkah: aksi.ke, galat: null };

            case 'gagal':
              return { ...keadaan, galat: aksi.pesan };

            default:
              return keadaan;
          }
        }
        `,
        { filename: 'src/checkout/reducer.ts' },
      ),
      p(
        'Yang berubah bukan jumlah baris melainkan **di mana aturannya tinggal**. Seluruh aturan tentang bagaimana keadaan boleh berpindah kini berada di satu fungsi, dan komponen hanya mengirim aksi. Aturan bahwa lompat hanya boleh ke langkah yang sudah selesai tertulis satu kali, bukan diulang di tiap tempat yang memanggilnya.',
      ),
      p(
        "Bentuk `case 'maju'` yang mengembalikan `keadaan` apa adanya saat sudah di ujung adalah pola yang layak dicontoh. Reducer boleh memutuskan tidak ada yang berubah, dan mengembalikan object yang sama membuat React melewati penggambaran ulang. Ini lebih baik daripada memeriksa syaratnya di komponen, sebab pemeriksaannya menjadi bagian dari aturan bukan bagian dari tampilan.",
      ),
      code(
        'tsx',
        `
        export function Checkout() {
          const [keadaan, kirim] = useReducer(reducer, {
            langkah: 'alamat',
            selesai: new Set<Langkah>(),
            data: {},
            galat: null,
          });

          // Komponen hanya menyatakan apa yang terjadi.
          return (
            <>
              <PenandaLangkah
                aktif={keadaan.langkah}
                selesai={keadaan.selesai}
                onLompat={(ke) => kirim({ jenis: 'lompat', ke })}
              />

              <IsiLangkah
                langkah={keadaan.langkah}
                data={keadaan.data}
                onIsi={(bagian) => kirim({ jenis: 'isi', bagian })}
              />

              {keadaan.galat ? <PesanGalat pesan={keadaan.galat} /> : null}

              <button onClick={() => kirim({ jenis: 'mundur' })}>Kembali</button>
              <button onClick={() => kirim({ jenis: 'maju' })}>Lanjut</button>
            </>
          );
        }
        `,
        { filename: 'src/checkout/Checkout.tsx' },
      ),
      p(
        'Perhatikan tombol Kembali tidak perlu memeriksa apakah sudah di langkah pertama, sebab reducer yang memutuskan. Kalau nanti aturannya berubah, misalnya mundur dari pembayaran harus mengosongkan data pembayaran, perubahannya satu tempat dan seluruh pemanggil ikut. Dengan `useState`, aturan itu harus diulang di setiap tombol yang bisa memundurkan langkah.',
      ),
      p(
        'Keuntungan lain yang sering menentukan adalah pengujian. Fungsi `reducer` adalah fungsi murni yang menerima keadaan dan aksi lalu mengembalikan keadaan baru, sehingga seluruh aturan alurnya bisa diuji tanpa merender apa pun. Menguji bahwa lompat ke langkah yang belum selesai tidak mengubah apa-apa cukup satu baris pemanggilan, tanpa peramban dan tanpa klik.',
      ),
      callout(
        'tip',
        'Tanda bahwa `useState` sudah tidak cukup',
        'Ada tiga atau lebih state yang selalu berubah bersama. Satu penangan menyetel tiga state sekaligus. Aturan tentang apa yang boleh berubah menjadi apa diulang di beberapa tempat. Muncul keadaan yang tidak masuk akal, misalnya sedang memuat sekaligus punya galat. Kalau dua di antaranya benar, `useReducer` biasanya sepadan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada reducer, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        function reducer(keadaan, aksi) {
          switch (aksi.jenis) {
            case 'maju':
              keadaan.langkah = 'pengiriman';    // diubah di tempat
              return keadaan;
          }
        }

        // Tidak ada error. Tampilan tidak berubah sama sekali.
        `,
        { caption: 'Reducer mengubah keadaan di tempat lalu mengembalikannya.' },
      ),
      p(
        'Ini pantangan mutasi yang muncul lagi, dan di reducer ia sangat mudah terjadi karena `keadaan` terlihat seperti variabel biasa. React membandingkan rujukan, dan karena objectnya sama persis ia melewati penggambaran ulang. Reducer wajib mengembalikan object **baru** untuk setiap perubahan, dan mengembalikan yang lama hanya kalau memang tidak ada yang berubah.',
      ),
      code(
        'text',
        `
        function reducer(keadaan, aksi) {
          switch (aksi.jenis) {
            case 'maju':
              return { ...keadaan, langkah: 'pengiriman' };
          }
          // tidak ada default
        }

        // Aksi yang tidak dikenal membuat keadaan menjadi undefined.
        TypeError: Cannot read properties of undefined (reading 'langkah')
        `,
        { caption: 'Cabang `default` tidak ada, sehingga fungsinya mengembalikan `undefined`.' },
      ),
      p(
        'Fungsi yang jatuh sampai ke bawah tanpa `return` mengembalikan `undefined`, dan React menyimpan itu sebagai keadaan baru. Seluruh pembacaan sesudahnya gagal. Selalu sediakan `default` yang mengembalikan `keadaan` apa adanya, atau lebih baik lagi melempar error yang menyebut jenis aksinya supaya salah ketik langsung ketahuan.',
      ),
      code(
        'text',
        `
        case 'maju': {
          simpanKeServer(keadaan.data);      // efek samping di dalam reducer
          return { ...keadaan, langkah: 'pengiriman' };
        }

        // Di StrictMode, simpanKeServer dipanggil DUA KALI.
        `,
        { caption: 'Reducer harus murni, dan React memanggilnya lebih dari sekali.' },
      ),
      p(
        'Sama seperti fungsi updater di Sub-bab 4.3, reducer diperlakukan sebagai fungsi murni. React boleh memanggilnya beberapa kali, dan `StrictMode` sengaja memanggilnya dua kali untuk menemukan efek samping. Pemanggilan server, pencatatan, dan penulisan ke penyimpanan semuanya harus berada di luar. Reducer hanya menghitung keadaan baru dari keadaan lama dan aksi.',
      ),
      code(
        'text',
        `
        case 'isi':
          keadaan.selesai.add(keadaan.langkah);    // Set diubah di tempat
          return { ...keadaan };

        // Object luarnya baru, dan Set-nya masih yang sama.
        // Komponen yang membaca 'selesai' tidak ikut diperbarui.
        `,
        { caption: 'Spread hanya menyalin satu lapis, dan `Set` termasuk lapisan dalam.' },
      ),
      p(
        'Ini bentuk yang paling menipu, sebab object luarnya memang baru sehingga sebagian tampilan ikut diperbarui. Yang tidak berubah adalah rujukan `Set`, sehingga komponen yang menerimanya sebagai props menyimpulkan propnya tidak berubah. Buat `Set` baru dengan `new Set(keadaan.selesai).add(...)`, dan hal yang sama berlaku untuk `Map` dan array bersarang.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tampilan tidak berubah setelah mengirim aksi',
            'Reducer mengubah keadaan di tempat',
            'Kembalikan object baru dengan spread',
          ],
          [
            '`Cannot read properties of undefined`',
            'Tidak ada cabang `default`',
            'Kembalikan `keadaan` apa adanya, atau lempar error yang menyebut jenisnya',
          ],
          [
            'Efek samping berjalan dua kali di pengembangan',
            'Ada pemanggilan server atau pencatatan di dalam reducer',
            'Pindahkan ke penangan peristiwa atau efek',
          ],
          [
            'Sebagian komponen tidak ikut diperbarui',
            '`Set`, `Map`, atau array bersarang diubah di tempat',
            'Buat salinan barunya, misalnya `new Set(lama)`',
          ],
          [
            'Aksi dengan jenis salah ketik diabaikan diam-diam',
            '`default` mengembalikan keadaan tanpa memberi tahu',
            'Lempar error di `default`, atau pakai union tipe yang ketat',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`useReducer` sering dipakai terlalu dini atau terlalu terlambat, dan keduanya punya biayanya sendiri.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `useReducer` untuk satu boolean',
            'Katanya lebih terstruktur',
            'Menambah tipe aksi, fungsi reducer, dan satu lapisan tak langsung untuk hal yang cukup `useState`. Pakai saat ada beberapa state yang berubah bersama',
          ],
          [
            'Menamai aksi dengan apa yang harus diubah',
            'Lebih langsung',
            'Nama seperti `setLangkah` membuat reducer sekadar setter berkedok. Namai dengan apa yang terjadi, misalnya `maju`, supaya aturannya bisa tinggal di reducer',
          ],
          [
            'Menaruh pemanggilan server di dalam reducer',
            'Di sana keadaannya tersedia',
            'Reducer harus murni dan React boleh memanggilnya dua kali. Kirim aksi, lalu lakukan efeknya di penangan',
          ],
          [
            'Mengubah `Set` atau `Map` di dalam keadaan dengan method pengubah',
            'Objek luarnya kan sudah disalin',
            'Spread tidak menyalin lapisan dalam. Buat `Set` atau `Map` baru',
          ],
          [
            'Membuat satu reducer raksasa untuk seluruh halaman',
            'Semua aturan di satu tempat',
            'Menjadi ratusan baris dan sulit diuji. Pecah per bagian yang aturannya memang berhubungan',
          ],
          [
            'Melupakan cabang `default`',
            'Seluruh aksi sudah ditangani',
            'Salah ketik jenis aksi membuat keadaan menjadi `undefined`, dan seluruh halaman rusak',
          ],
        ],
      ),
      p(
        'Baris kedua adalah pembeda antara reducer yang berguna dan reducer yang hanya menambah lapisan. Aksi bernama `setLangkah` memindahkan keputusan ke pemanggil, sehingga aturan tentang langkah mana yang boleh dituju tetap tersebar. Aksi bernama `maju` menyerahkan keputusan itu ke reducer, dan di situlah seluruh keuntungannya berada. Namai aksi dengan **peristiwa**, bukan dengan perubahan.',
      ),
      callout(
        'info',
        'Reducer adalah fungsi murni, dan itu membuatnya mudah diuji',
        'Karena ia hanya menerima keadaan dan aksi lalu mengembalikan keadaan baru, seluruh aturan alurnya bisa diuji tanpa merender satu komponen pun. Menguji sepuluh kombinasi aksi memakan sepuluh baris dan berjalan dalam milidetik. Ini keuntungan yang sering menentukan pada alur yang aturannya rumit seperti checkout atau wisaya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`useReducer` saat beberapa nilai berubah bersama atau transisinya punya aturan.',
        'Discriminated union membuat kombinasi impossible state tidak bisa ditulis.',
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
          note: 'Membuat kombinasi impossible state menjadi tidak bisa ditulis, plus penjaga ketuntasan.',
        },
      ),
    ],
  ),

  written(
    'empat-keadaan-ui',
    'Empat Keadaan UI',
    22,
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
          term: 'empty state',
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
            'Bentuk kerangka yang **memesan ruang seukuran isi akhirnya**. Ini yang membedakannya dari pemutar berputar: skeleton mencegah tata letak melompat, spinner tidak. Untuk operasi yang hampir selalu instan, keduanya justru lebih baik dihilangkan — flicker-nya terasa lebih lambat daripada tanpa indikator.',
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
      p(
        'Perhatikan tipe ini **generik**, ditulis `Keadaan<T>`, sehingga bentuk yang sama bisa dipakai untuk daftar tugas, profil, maupun apa pun, dengan `data` yang tetap bertipe tepat. Tiga varian memodelkan tiga dari empat keadaan di tabel, dan itu disengaja. Keadaan **kosong** bukan varian tersendiri melainkan bagian dari `berhasil` dengan `data` yang panjangnya nol, karena "berhasil mengambil, hasilnya kosong" memang berbeda dari "gagal mengambil". Komentar terakhir menegaskan imbalannya, yaitu kombinasi seperti `memuat` yang sekaligus punya `data` ditolak **saat kompilasi**, bukan ditemukan saat menjalankan. Ini penerapan discriminated union dari Frontend Basic 6.9 pada masalah yang paling sering ditemui di aplikasi nyata.',
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
      p(
        "Bentuk ini disebut *early return*, yaitu tiap keadaan diperiksa lewat satu `if`, dan begitu cocok fungsinya langsung `return` tanpa perlu memeriksa sisanya. Urutannya sengaja. `memuat` diperiksa lebih dulu karena itu keadaan yang paling sering terjadi, yakni setiap kali komponen pertama kali dipasang, lalu `gagal`, baru pengecekan `data.length === 0` untuk daftar kosong, dan barisan `<Baris>` sungguhan sebagai jalur terakhir. Karena `keadaan` didefinisikan sebagai discriminated union di sub-bab sebelumnya, TypeScript tahu persis field apa yang tersedia di tiap cabang. Di dalam blok `if (keadaan.status === 'gagal')`, `keadaan.pesan` bisa diakses tanpa `?.` karena compiler sudah mempersempit tipenya, dan mencoba mengakses `keadaan.data` di blok yang sama akan ditolak sebagai error karena varian `gagal` memang tidak punya field itu.",
      ),

      h2('Kesalahan yang paling sering'),
      ol(
        '**Skeleton yang tingginya tidak sama** — halaman melompat saat data datang.',
        '**Empty state tanpa penjelasan** — tidak bisa dibedakan dari halaman rusak.',
        '**Pesan error mentah dari server** — membocorkan detail internal dan tidak bisa ditindaklanjuti.',
        '**Tidak ada cara mencoba lagi** — pengguna terpaksa memuat ulang halaman.',
        '**Menyamakan "belum mencari" dengan "tidak ada hasil"** — dua situasi berbeda.',
      ),
      code(
        'tsx',
        `
        // Bedakan dua empty state yang berbeda
        {cari
          ? \`Tidak ada hasil untuk "\${cari}". Coba kata kunci lain.\`
          : 'Belum ada data. Mulai dengan menambahkan yang pertama.'}
        `,
      ),
      p(
        'Kedua kalimat ini keluar dari cabang yang sama, yaitu daftar kosong, tapi menjawab situasi yang sepenuhnya berbeda, dan yang membedakan hanya ada tidaknya kata kunci pencarian. Kalimat pertama memberi tahu bahwa **data ada, hanya tidak ada yang cocok**, sekaligus menyarankan tindakan yang masuk akal, yaitu mengganti kata kuncinya. Kalimat kedua memberi tahu bahwa **memang belum ada apa-apa**, dan mengarahkan ke tindakan yang berbeda, yaitu menambahkan yang pertama. Menyamakan keduanya dengan satu pesan generik seperti "Tidak ada data" membuat pengguna yang salah ketik mengira aplikasinya kosong, dan pengguna baru mengira pencariannya gagal. Keduanya sama-sama kesimpulan keliru dari satu kalimat yang terlalu hemat.',
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
      p(
        'Perbedaan satu kata, yaitu `all` menjadi `allSettled`, mengubah perilaku seluruh dashboard. `Promise.all` menolak begitu **satu** promise gagal, sehingga baris destructuring-nya tidak pernah tercapai dan ketiga widget kosong meski dua di antaranya berhasil. `Promise.allSettled` selalu menunggu semuanya selesai lalu mengembalikan array berisi status tiap permintaan, sehingga kamu bisa merender widget yang berhasil dan menampilkan pesan gagal hanya pada yang bermasalah. Pilihan di antara keduanya bukan soal gaya melainkan **apakah datanya saling bergantung**. Kalau halaman tidak berarti apa-apa tanpa salah satunya, `all` justru tepat, dan kalau tiap bagian berdiri sendiri seperti widget dashboard, `allSettled` yang benar.',
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
        'Operasi yang hampir selalu di bawah 200ms — flicker-nya terasa lebih lambat.',
        'Memuat ulang data yang sudah tampil — pertahankan data lama, jangan ganti skeleton.',
        'Aksi yang dipicu pengguna dengan respons lokal — pakai keadaan pada tombolnya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman riwayat transaksi diserahkan ke tim penguji, dan tiga laporan masuk di hari pertama. Saat internet mati, halaman menampilkan tulisan belum ada transaksi. Saat filter tanggal diubah menjadi rentang yang kosong, tulisannya sama persis. Dan saat data sedang dimuat, layar putih selama dua detik tanpa satu pun tanda. Ketiganya adalah keadaan yang tidak pernah muncul saat dikembangkan, sebab server lokal selalu cepat dan datanya selalu ada.',
      ),
      p(
        'Empat keadaan itu bukan anjuran melainkan bagian dari baseline frontend project ini. Bentuk di bawah menulis keempatnya secara eksplisit, dan menambahkan satu keadaan kelima yang sering dilupakan.',
      ),
      code(
        'tsx',
        `
        type Keadaan<T> =
          | { status: 'memuat' }
          | { status: 'memuat-ulang'; data: T }      // sudah ada data, sedang menyegarkan
          | { status: 'gagal'; galat: Error }
          | { status: 'kosong' }
          | { status: 'sukses'; data: T };

        // Union bertanda seperti ini membuat kombinasi yang tidak masuk akal
        // menjadi MUSTAHIL. Tidak ada keadaan 'memuat sekaligus gagal'.
        `,
        { filename: 'src/lib/keadaan.ts' },
      ),
      p(
        'Bentuk ini disebut union bertanda, dan keunggulannya bukan sekadar kerapian. Dengan tiga boolean terpisah, yaitu `memuat`, `galat`, dan `kosong`, ada delapan kombinasi yang bisa ditulis dan hanya empat yang berarti. Dengan union, kombinasi yang tidak masuk akal tidak bisa dibuat sama sekali. Ini gagasan yang sama dengan mengganti boolean bertumpuk pada props di bab sebelumnya.',
      ),
      code(
        'tsx',
        `
        export function RiwayatTransaksi({ filter }: { filter: Filter }) {
          const keadaan = useTransaksi(filter);   // hook yang mengembalikan Keadaan<Transaksi[]>
          const adaFilter = filter.cari !== '' || filter.dari !== null;

          // Urutan pemeriksaan MENENTUKAN. Gagal sebelum kosong.
          if (keadaan.status === 'memuat') {
            return <Skeleton baris={5} />;
          }

          if (keadaan.status === 'gagal') {
            const jaringan = keadaan.galat.name === 'ErrorJaringan';
            return (
              <PesanGagal
                pesan={jaringan
                  ? 'Koneksi bermasalah. Periksa jaringanmu.'
                  : 'Gagal memuat riwayat. Coba lagi sebentar.'}
                onCobaLagi={muatUlang}
              />
            );
          }

          if (keadaan.status === 'kosong') {
            return adaFilter ? (
              <Kosong
                pesan="Tidak ada transaksi pada rentang ini"
                aksi={{ label: 'Hapus filter', jalankan: bersihkanFilter }}
              />
            ) : (
              <Kosong
                pesan="Belum ada transaksi sama sekali"
                aksi={{ label: 'Mulai belanja', jalankan: keKatalog }}
              />
            );
          }

          // Di sini TypeScript tahu keadaan.data pasti ada.
          return (
            <div aria-busy={keadaan.status === 'memuat-ulang'}>
              <Tabel data={keadaan.data} />
            </div>
          );
        }
        `,
        { filename: 'src/riwayat/RiwayatTransaksi.tsx' },
      ),
      p(
        'Urutan pemeriksaannya bukan selera. Gagal diperiksa sebelum kosong, sebab daftar yang gagal dimuat panjangnya juga nol. Kalau urutannya dibalik, gangguan server akan tampil sebagai belum ada transaksi, dan itu persis laporan pertama dari cerita di awal. Ini kesalahan yang hanya muncul saat server bermasalah, sehingga hampir tidak pernah tertangkap saat pengujian biasa.',
      ),
      p(
        'Keadaan `memuat-ulang` yang membawa data adalah yang paling sering dilupakan. Tanpa itu, mengganti filter akan menampilkan skeleton dan membuang daftar yang sudah ada, sehingga layar berkedip. Dengan memisahkannya, data lama tetap terlihat sambil ditandai `aria-busy`, dan pengguna melihat perubahan bukan kekosongan. Ini pola yang sudah dibahas di Bab 5 Frontend Basic.',
      ),
      p(
        'Dua pesan kosong yang berbeda menutup laporan kedua. Kosong karena filter dan kosong karena belum ada data adalah dua keadaan yang menuntut tindakan berbeda dari pengguna, dan menyatukannya membuat pengguna baru mengira aplikasinya rusak. Tombol aksinya juga berbeda, yaitu hapus filter untuk yang pertama dan mulai belanja untuk yang kedua.',
      ),
      callout(
        'tip',
        'Tulis keadaan gagal dan kosong LEBIH DULU',
        'Keduanya paling sering dilewati justru karena paling jarang muncul saat mengembangkan. Kalau kamu menulisnya sebelum jalur suksesnya, keduanya pasti ada dan jalur suksesnya akan menyusul dengan sendirinya. Kalau dibalik, keduanya menjadi tambalan yang bentuknya berbeda-beda antar-halaman.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Keadaan yang tidak ditulis tidak menghasilkan error. Ia menghasilkan layar yang salah, dan empat bentuk di bawah adalah yang paling sering dilaporkan pengguna.',
      ),
      code(
        'text',
        `
        // Server sedang mati.
        // Layar menampilkan: "Belum ada transaksi sama sekali"
        `,
        { caption: 'Kekosongan diperiksa sebelum kegagalan.' },
      ),
      p(
        'Pengguna menyimpulkan datanya hilang, dan pada aplikasi keuangan itu bisa menimbulkan kepanikan yang nyata. Yang lebih merugikan bagimu, kamu kehilangan satu-satunya tanda bahwa ada gangguan, sebab tidak ada laporan galat yang masuk. Periksa kegagalan lebih dulu, selalu, dan pastikan keadaan gagal punya wujud yang jelas berbeda dari keadaan kosong.',
      ),
      code(
        'text',
        `
        {data.map((d) => <Baris key={d.id} data={d} />)}

        TypeError: Cannot read properties of undefined (reading 'map')
        `,
        { caption: 'Data dibaca sebelum keadaan sukses dipastikan.' },
      ),
      p(
        'Dengan union bertanda dan TypeScript, kesalahan ini ditolak sebelum dijalankan sebab `data` hanya ada pada keadaan `sukses` dan `memuat-ulang`. Tanpa union, `data` biasanya berupa `T[] | undefined` dan mudah dipakai tanpa diperiksa. Ini salah satu manfaat union yang paling langsung terasa, yaitu TypeScript memaksa kamu memeriksa statusnya lebih dulu.',
      ),
      code(
        'text',
        `
        // Pengguna mengganti filter. Daftar hilang, skeleton muncul 200 ms,
        // lalu daftar baru muncul. Layar berkedip.
        `,
        { caption: 'Skeleton ditampilkan padahal sudah ada data.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah pengalamannya. Kedipan ini terasa lebih lambat daripada tidak ada indikator sama sekali, sebab mata menangkap perubahan besar dua kali. Pisahkan `memuat` dari `memuat-ulang`, dan tampilkan skeleton hanya saat benar-benar belum ada apa pun untuk ditampilkan.',
      ),
      code(
        'text',
        `
        // Permintaan gagal. Indikator memuat terus berputar.
        // Tidak ada pesan, dan tidak ada tombol coba lagi.
        `,
        { caption: 'Blok `catch` hanya mencetak ke console.' },
      ),
      p(
        'Ini pola yang sudah dibahas di Bab 5 Frontend Basic dan muncul kembali di React dengan bentuk yang sama. Setiap `catch` harus mengubah sesuatu yang **dilihat pengguna**, dan mencetak ke console bukan jawabannya. Kalau keadaan memuat tidak pernah punya jalan keluar pada jalur gagal, pengguna akan menunggu selamanya tanpa tahu apa yang terjadi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Gangguan server tampil sebagai belum ada data',
            'Kekosongan diperiksa sebelum kegagalan',
            'Periksa gagal lebih dulu',
          ],
          [
            "`Cannot read properties of undefined (reading 'map')`",
            'Data dibaca sebelum status sukses dipastikan',
            'Pakai union bertanda supaya TypeScript memaksa memeriksa',
          ],
          [
            'Layar berkedip saat filter diganti',
            'Skeleton ditampilkan walaupun sudah ada data',
            'Pisahkan `memuat` dari `memuat-ulang`',
          ],
          [
            'Indikator memuat berputar selamanya',
            '`catch` tidak mengubah keadaan yang terlihat',
            'Setel keadaan gagal, dan sediakan tombol coba lagi',
          ],
          [
            'Pesan kosong menyesatkan pengguna baru',
            'Satu pesan untuk dua sebab yang berbeda',
            'Bedakan kosong karena filter dan kosong karena belum ada data',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Empat keadaan tampilan adalah bagian yang paling sering dianggap penyempurnaan, padahal tiga di antaranya justru yang paling sering dilihat pengguna saat ada masalah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis jalur sukses lebih dulu, sisanya menyusul',
            'Itu yang paling penting',
            'Keadaan lain menjadi tambalan yang bentuknya berbeda-beda antar-halaman, dan sebagian tidak pernah ditulis',
          ],
          [
            'Memakai tiga boolean terpisah untuk keadaan',
            'Tiap keadaan punya penandanya sendiri',
            'Delapan kombinasi bisa ditulis dan hanya empat yang berarti. Pakai union bertanda',
          ],
          [
            'Memeriksa kekosongan sebelum kegagalan',
            'Urutannya terasa alami',
            'Daftar yang gagal dimuat panjangnya juga nol, sehingga gangguan tampil sebagai kekosongan',
          ],
          [
            'Menampilkan spinner untuk operasi yang biasanya seketika',
            'Lebih baik ada indikator',
            'Kedipan terbaca lebih lambat daripada tidak ada indikator. Tunda memunculkannya, atau tahan minimalnya',
          ],
          [
            'Memakai pesan galat yang sama untuk semua kegagalan',
            'Pengguna tidak peduli detailnya',
            'Gangguan jaringan bisa pengguna perbaiki sendiri, gangguan server tidak. Bedakan keduanya',
          ],
          [
            'Menguji hanya di jaringan cepat dengan data lengkap',
            'Alurnya kan sama',
            'Ketiga keadaan selain sukses hampir tidak pernah muncul. Pakai pembatas jaringan dan data uji yang kosong',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah kebiasaan yang menemukan sebagian besar masalah di sub-bab ini dalam dua menit. Buka DevTools, pilih pembatas jaringan Slow 4G, lalu matikan servernya di tengah pemuatan. Setelah itu, hapus seluruh data uji dan buka halamannya lagi. Dua percobaan itu memaksa ketiga keadaan selain sukses muncul, dan hampir selalu ada satu yang belum ditulis.',
      ),
      callout(
        'info',
        'Pustaka pengambil data menyediakan keempatnya secara bawaan',
        'Pustaka seperti TanStack Query mengembalikan `isPending`, `isError`, `error`, dan `data` sekaligus, plus `isFetching` yang membedakan pemuatan pertama dari pemuatan ulang. Bab tentang state management membahasnya. Yang tidak disediakan pustaka mana pun adalah keputusan apa yang ditampilkan untuk tiap keadaan, dan itu tetap pekerjaanmu.',
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
    27,
    'Menggabungkan state, event, turunan, dan empat keadaan UI menjadi satu fitur utuh.',
    [
      p(
        'Praktik penutup bab. Fitur ini kecil tapi menyentuh hampir semua yang dipelajari di dua belas sub-bab sebelumnya.',
      ),

      terms(
        {
          term: 'rancang state dulu',
          meaning:
            'Langkah pertama praktik ini, dan urutan yang menentukan sisanya. Sebelum menulis satu komponen pun, **pisahkan state sungguhan dari derived value**. Yang sungguhan hanya tiga di sini, yaitu kata pencarian, filter, dan halaman. Sisanya seperti hasil saring, jumlah total, dan jumlah halaman semuanya dihitung.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunda sebuah aksi sampai pemicunya berhenti berdatangan. Yang penting dan sering keliru: **debounce nilai yang dipakai menyaring, bukan yang ditampilkan di input**. Kalau nilai inputnya ikut ditunda, ketikan pengguna terasa tersendat.',
        },
        {
          term: 'menjepit nilai',
          meaning:
            'Terjemahan bebas dari *clamping*. Menjaga `halaman` tetap dalam rentang yang sah setelah hasil saring mengecil. Kerjakan **saat render** lewat `const halamanAman = Math.min(halaman, totalHalaman)`, bukan lewat `useEffect` yang memperbaikinya setelah layar sempat menampilkan halaman kosong.',
        },
        {
          term: 'pure function untuk penyaringan',
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
            'Mengumumkan jumlah hasil setelah pencarian selesai — "12 hasil ditemukan". Bagi pengguna pembaca layar, tanpa ini mengetik di kotak pencarian tidak menghasilkan feedback apa pun.',
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
      p(
        'Komentar yang memisahkan kedua kelompok adalah keputusan terpenting di seluruh praktik ini. Empat baris pertama adalah **state sungguhan**, dan tidak satu pun bisa dihitung dari yang lain. Kata pencarian datang dari ketikan, filter dari klik, halaman dari navigasi, dan `keadaan` dari hasil permintaan. Lima baris berikutnya semuanya **turunan**, dan tiap barisnya bersandar pada baris di atasnya. `semua` diambil dari keadaan, `terlihat` disaring dari `semua`, `totalHalaman` dihitung dari panjang `terlihat`, dan seterusnya. Karena semuanya dihitung ulang tiap render, tidak ada satu pun yang bisa menyimpang, sehingga mengubah `filter` otomatis membuat jumlah halaman dan isi barisnya ikut benar tanpa satu `useEffect` pun. Bandingkan dengan menyimpan `totalHalaman` sebagai state, karena setiap tempat yang mengubah filter harus ingat memperbaruinya juga.',
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
      p(
        "Perhatikan berkas ini **tidak mengimpor React sama sekali**, karena ia hanya menerima data beserta opsinya lalu mengembalikan hasil, persis pola modul `todo.js` dari Frontend Basic Bab 1. Karena murni, ia bisa diuji dengan memanggilnya langsung memakai array biasa, tanpa perlu merender komponen dan tanpa perlu mensimulasikan ketikan. Rantai dua `filter` dipisah dengan sengaja alih-alih digabung jadi satu kondisi panjang, sehingga tiap tahap menjawab satu pertanyaan, yang pertama menyaring berdasarkan status dan yang kedua berdasarkan kata kunci. Baris `const q = cari.trim().toLowerCase()` dihitung **sekali di luar** kedua filter dan bukan di dalamnya, sebab kalau ditaruh di dalam, normalisasi yang sama diulang untuk setiap item. Dan `q === '' ? true : …` memastikan pencarian kosong meloloskan semuanya alih-alih tidak mencocokkan apa pun.",
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
      p(
        'Kunci pola ini ada pada **dua nilai yang hidup berdampingan**, seperti disebut komentarnya. `cari` dipakai sebagai `value` input, sehingga huruf yang diketik muncul di layar seketika, sebab menundanya di sini akan membuat input terasa lag. `cariTertunda` yang dipakai menyaring, dan ia baru menyusul 250 milidetik setelah pengguna berhenti mengetik. Jadi yang ditunda bukan tampilan melainkan **pekerjaannya**. Perhatikan `useDebounce` menerima nilai dan mengembalikan nilai, bukan menerima fungsi seperti `debounce` di Frontend Basic. Bentuk itu dipilih karena lebih cocok dengan cara React bekerja, sebab kamu tidak menunda pemanggilan, kamu cukup memakai versi nilai yang tertinggal.',
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
        'Kalau kamu men-debounce nilai `value` pada inputnya, ketikan akan terasa tersendat. Debounce yang di-debounce adalah **derived value yang dipakai menyaring**, bukan yang ditampilkan.',
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
      p(
        "Berbeda dari `DaftarTugas` di Bab 4.11 yang memakai `if`/`return` berurutan, di sini keempat keadaan ditulis sebagai ekspresi `&&` berurutan di dalam **satu** elemen pembungkus. Pilihan itu masuk akal karena wadah itu sendiri butuh `aria-live` dan `aria-busy` yang menempel di satu tempat, bukan tersebar di beberapa `return`. Perhatikan syarat gandanya di dua baris terakhir. `keadaan.status === 'berhasil' && baris.length === 0` khusus untuk empty state, sedangkan `keadaan.status === 'berhasil' && baris.length > 0` untuk daftar yang terisi, dan keduanya saling meniadakan sehingga tidak akan pernah tampil berbarengan. Pesan kosongnya sendiri dibedakan dua kalimat tergantung `cariTertunda || filter !== 'semua'`. Kalau pengguna sedang menyaring atau mencari sesuatu, pesannya menjelaskan bahwa hasilnya nol untuk pencarian **itu**, dan kalau tidak, pesannya menjelaskan bahwa datanya memang belum ada sama sekali. Dua situasi itu terasa sama bagi kode tapi berbeda maknanya bagi pengguna.",
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
      p(
        'Perhatikan `setHalaman(1)` dipanggil bersama `setCari`, persis seperti pada tombol filter di atas. Itu penanganan kasus tepi yang paling mudah terlewat, sebab pengguna yang sedang di halaman 3 lalu mengetik pencarian baru akan melihat daftar kosong, karena hasil pencariannya mungkin hanya punya satu halaman. Menyetel ulang halaman **di tempat penyebabnya** lebih sederhana daripada mengawasinya lewat `useEffect`, sekaligus bekerja berdampingan dengan `halamanAman` sebagai jaring pengaman kedua. Sisa atributnya menerapkan aturan form dari Bab 3, sebab `<label>` dengan `sr-only` memberi nama yang terbaca pembaca layar tanpa memakan ruang, `type="search"` memberi tombol hapus bawaan, dan `autoComplete="off"` beserta `spellCheck={false}` mematikan dua bantuan browser yang hanya mengganggu di kotak pencarian.',
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
      p(
        "Keempat tes ini menutup empat jenis kemungkinan yang berbeda, bukan empat variasi dari hal yang sama. Yang pertama menguji **jalur normal** tanpa saringan apa pun. Yang kedua menguji **normalisasi**, karena `'  REACT '` dengan spasi berlebih dan huruf besar tetap harus cocok dengan `'Belajar React'`, dan inilah yang membuktikan `trim().toLowerCase()` bekerja. Yang ketiga menguji **kombinasi** pencarian dan filter sekaligus, karena keduanya benar sendiri-sendiri tidak menjamin benar bersamaan. Dan yang keempat menguji **jalur tidak bahagia** dari Frontend Basic, yaitu daftar kosong tidak boleh melempar error. Perhatikan tidak ada satu pun tes yang merender komponen, dan seperti disebut kotak berikut, itulah imbalan memisahkan `saring` ke berkasnya sendiri.",
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
        'Keempat keadaan UI ditangani, dengan dua empty state yang dibedakan',
        'Skeleton memesan tinggi yang sama dengan baris asli',
        'Halaman dijepit supaya tidak menunjuk halaman yang sudah tidak ada',
        'Debounce diterapkan pada nilai penyaring, bukan pada `value` input',
        '`useDebounce` membersihkan timer-nya',
        'Input punya `<label>`; tombol filter punya `aria-pressed`',
        'Wadah hasil punya `aria-live` dan `aria-busy`',
        'Fungsi `saring` diuji terpisah, termasuk kasus daftar kosong',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar produk yang baru kamu bangun bekerja. Sekarang tiga permintaan datang, yaitu filternya harus bisa dibagikan lewat tautan, tombol kembali peramban harus mengembalikan filter sebelumnya, dan memuat ulang halaman tidak boleh mengosongkan pilihan pengguna. Ketiganya tidak bisa diselesaikan `useState`, sebab state React hilang begitu halaman dimuat ulang.',
      ),
      p(
        'Jawabannya bukan menambah state melainkan **memindahkannya**. Alamat halaman adalah tempat penyimpanan yang sudah tersedia, sudah dipahami setiap pengguna, dan sudah terhubung dengan tombol kembali tanpa satu baris kode tambahan.',
      ),
      table(
        ['Jenis nilai', 'Tempatnya', 'Alasannya'],
        [
          [
            'Kata pencarian, filter, urutan, halaman keberapa',
            '**Alamat halaman**',
            'Harus bisa dibagikan dan dikembalikan tombol kembali',
          ],
          [
            'Baris mana yang sedang dipilih di tabel',
            'State komponen',
            'Tidak berarti apa-apa di tab lain',
          ],
          ['Dialog terbuka atau tidak', 'State komponen', 'Kecuali dialognya punya alamat sendiri'],
          [
            'Isi kotak pencarian yang sedang diketik',
            'State komponen',
            'Alamat baru diperbarui setelah pengguna berhenti mengetik',
          ],
          [
            'Tema terang atau gelap',
            'Penyimpanan peramban',
            'Preferensi yang bertahan lintas sesi',
          ],
          [
            'Daftar produk dari server',
            'Cache pengambil data',
            'Punya kesegaran dan penanganan gagal sendiri',
          ],
        ],
        'Yang menentukan adalah siapa yang perlu tahu, dan berapa lama ia harus bertahan.',
      ),
      code(
        'tsx',
        `
        function DaftarProduk() {
          const [params, setParams] = useSearchParams();

          // Dibaca dari alamat, bukan disimpan. Satu sumber kebenaran.
          const cari = params.get('q') ?? '';
          const kategori = params.get('kategori') ?? '';
          const urut = (params.get('urut') as Urut) ?? 'terbaru';
          const halaman = Math.max(1, Number(params.get('halaman') ?? '1') || 1);

          // Kotak pencarian tetap terkendali state lokal supaya ketikan terasa
          // seketika. Alamat diperbarui setelah pengguna berhenti mengetik.
          const [ketikan, setKetikan] = useState(cari);

          useEffect(() => {
            const id = setTimeout(() => {
              if (ketikan === cari) return;
              perbarui({ q: ketikan || null, halaman: null });   // reset ke halaman 1
            }, 400);
            return () => clearTimeout(id);
          }, [ketikan, cari]);

          function perbarui(bagian: Record<string, string | null>) {
            const baru = new URLSearchParams(params);
            for (const [kunci, nilai] of Object.entries(bagian)) {
              if (nilai === null || nilai === '') baru.delete(kunci);
              else baru.set(kunci, nilai);
            }
            setParams(baru, { replace: true });   // jangan penuhi riwayat tiap ketikan
          }

          return (
            <>
              <input value={ketikan} onChange={(e) => setKetikan(e.currentTarget.value)} />
              <PilihKategori nilai={kategori} onUbah={(k) => perbarui({ kategori: k, halaman: null })} />
              <PilihUrut nilai={urut} onUbah={(u) => perbarui({ urut: u })} />
              <HasilProduk cari={cari} kategori={kategori} urut={urut} halaman={halaman} />
            </>
          );
        }
        `,
        { filename: 'src/produk/DaftarProduk.tsx' },
      ),
      p(
        'Bagian yang paling mudah keliru adalah kotak pencarian. Ia tetap memakai state lokal karena mengetik harus terasa seketika, dan memperbarui alamat pada tiap huruf akan memenuhi riwayat peramban sehingga tombol kembali harus ditekan dua puluh kali. Alamat diperbarui setelah pengguna berhenti mengetik, memakai debounce dari Bab 1 Frontend Basic, dan dengan `replace` supaya tidak menambah entri riwayat.',
      ),
      p(
        'Baris `halaman: null` pada penangan filter menyelesaikan bug yang sangat sering. Kalau pengguna berada di halaman lima lalu mengganti kategori, hasil kategori baru mungkin hanya punya satu halaman sehingga daftarnya kosong. Mereset halaman setiap kali filter berubah adalah aturan yang berlaku di hampir semua daftar berpaginasi, dan menuliskannya di satu fungsi `perbarui` membuatnya tidak mungkin terlewat.',
      ),
      p(
        'Fungsi `perbarui` juga menghapus parameter yang nilainya kosong, dan itu bukan sekadar kerapian. Alamat `?q=&kategori=` dan alamat tanpa parameter menghasilkan halaman yang sama, dan cache peramban maupun CDN menyimpannya sebagai dua entri terpisah. Menjaga alamat tetap kanonik meningkatkan keberhasilan cache dan membuat tautan yang dibagikan lebih bersih.',
      ),
      code(
        'tsx',
        `
        // Membaca dari alamat berarti nilainya bisa apa saja.
        // Perlakukan sebagai masukan dari luar, persis seperti data dari server.
        const URUT_SAH = ['terbaru', 'termurah', 'termahal'] as const;
        type Urut = (typeof URUT_SAH)[number];

        const urutMentah = params.get('urut');
        const urut: Urut = URUT_SAH.includes(urutMentah as Urut)
          ? (urutMentah as Urut)
          : 'terbaru';                              // bawaan kalau tidak dikenal
        `,
        { caption: 'Siapa pun bisa mengetik apa saja di alamat halaman.' },
      ),
      p(
        'Ini penerapan aturan dari Bab 6 Frontend Basic, yaitu tipe TypeScript hilang saat build sehingga data dari luar tetap harus diperiksa saat berjalan. Alamat halaman adalah data dari luar, sama seperti respons server. Tanpa pemeriksaan ini, `?urut=xyz` akan menghasilkan kelas CSS yang tidak ada, pemanggilan API dengan parameter tidak sah, atau bahkan halaman yang gagal dimuat.',
      ),
      callout(
        'tip',
        'Pertanyaan yang memutuskan tempat sebuah nilai',
        'Apakah nilainya perlu bertahan setelah halaman dimuat ulang, sebab kalau ya tempatnya bukan state. Apakah pengguna perlu bisa membagikannya lewat tautan, sebab kalau ya tempatnya alamat halaman. Apakah ia hanya berarti bagi satu pengguna di satu perangkat, sebab kalau ya penyimpanan peramban cocok. Kalau ketiganya tidak, `useState` memang jawabannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat state dipindahkan ke alamat halaman.',
      ),
      code(
        'text',
        `
        // Pengguna mengetik "kaos polos", lalu menekan tombol kembali.
        // Ia harus menekan sepuluh kali untuk kembali ke halaman sebelumnya.
        `,
        { caption: 'Alamat diperbarui pada tiap ketikan tanpa `replace`.' },
      ),
      p(
        'Tiap pemanggilan yang menambah entri riwayat membuat tombol kembali harus ditekan sekali lagi. Sepuluh huruf berarti sepuluh entri. Ada dua perbaikan yang dipakai bersama, yaitu menunda pembaruan sampai pengguna berhenti mengetik, dan memakai opsi `replace` supaya entri yang ada digantikan bukan ditambah. Untuk perubahan yang memang berarti navigasi, misalnya berpindah halaman, `replace` justru tidak dipakai.',
      ),
      code(
        'text',
        `
        // Alamat: ?urut=xyz
        <div className={\`daftar daftar-\${urut}\`} />

        // Hasil: class="daftar daftar-xyz"
        // Tidak ada gaya yang menempel. Tidak ada error.
        `,
        { caption: 'Nilai dari alamat dipakai tanpa diperiksa.' },
      ),
      p(
        'Siapa pun bisa mengetik apa saja di bilah alamat, dan tautan lama yang beredar bisa memuat nilai yang sudah tidak didukung. Tanpa pemeriksaan terhadap daftar nilai yang sah, akibatnya bisa berupa gaya yang hilang, pemanggilan API yang gagal, atau pada kasus terburuk nilai yang disisipkan ke tempat yang berbahaya. Perlakukan alamat sebagai masukan yang tidak dipercaya.',
      ),
      code(
        'text',
        `
        const halaman = Number(params.get('halaman'));
        const mulai = (halaman - 1) * 20;

        // Alamat tanpa parameter halaman: Number(null) = 0
        // mulai = -20, dan slice(-20, 0) menghasilkan array kosong.
        `,
        {
          caption: 'Parameter yang tidak ada menghasilkan `null`, dan `Number(null)` bernilai nol.',
        },
      ),
      p(
        "Ini jebakan coercion dari Bab 1 Frontend Basic yang muncul di tempat yang tidak diduga. `params.get` mengembalikan `null` untuk parameter yang tidak ada, dan `Number(null)` bernilai nol bukan `NaN`. Akibatnya perhitungan indeks menjadi negatif dan daftarnya kosong tanpa satu pun error. Bentuk yang aman pada studi kasus memakai `?? '1'` lalu `|| 1` untuk menangkap `NaN`, dan `Math.max` untuk menjaga batas bawahnya.",
      ),
      code(
        'text',
        `
        const [cari, setCari] = useState(params.get('q') ?? '');

        // Pengguna menekan tombol kembali. Alamat berubah,
        // dan kotak pencarian tetap menampilkan kata yang lama.
        `,
        { caption: 'Nilai dari alamat disalin ke state, dan salinannya tidak mengikuti.' },
      ),
      p(
        'Ini kesalahan menyalin props ke state dari Sub-bab 4.1, muncul kembali dengan alamat sebagai sumbernya. Argumen `useState` hanya dibaca sekali, sehingga perubahan alamat dari tombol kembali tidak pernah sampai. Baca langsung dari alamat sebagai sumber kebenaran, dan pakai state lokal hanya untuk ketikan yang belum sempat dikirim ke alamat.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tombol kembali harus ditekan berkali-kali',
            'Tiap ketikan menambah entri riwayat',
            'Tunda dengan debounce, dan pakai opsi `replace`',
          ],
          [
            'Gaya atau perilaku hilang untuk nilai tertentu di alamat',
            'Nilai dari alamat dipakai tanpa diperiksa',
            'Cocokkan terhadap daftar nilai yang sah, dengan bawaan',
          ],
          [
            'Daftar kosong padahal datanya ada',
            '`Number(null)` bernilai nol, sehingga indeksnya negatif',
            'Beri bawaan dengan `??`, tangkap `NaN`, dan batasi dengan `Math.max`',
          ],
          [
            'Kotak pencarian tidak mengikuti tombol kembali',
            'Nilai alamat disalin ke state',
            'Baca langsung dari alamat sebagai sumber kebenaran',
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
        'Praktik penutup bab ini menggabungkan seluruh materi, dan kesalahan yang muncul hampir selalu berupa nilai yang disimpan di tempat yang salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan filter dan halaman di `useState`',
            'Itu kan state',
            'Tautan tidak bisa dibagikan, tombol kembali tidak bekerja, dan memuat ulang mengosongkan pilihan pengguna',
          ],
          [
            'Memperbarui alamat pada tiap ketikan',
            'Supaya selalu sinkron',
            'Riwayat penuh dan tombol kembali menjadi tidak berguna. Tunda dan pakai `replace`',
          ],
          [
            'Memercayai nilai dari alamat halaman',
            'Kita sendiri yang menulisnya',
            'Siapa pun bisa mengetik apa saja, dan tautan lama bisa memuat nilai yang sudah tidak didukung. Periksa terhadap daftar yang sah',
          ],
          [
            'Menyimpan seluruh state di alamat',
            'Supaya semuanya bisa dibagikan',
            'Alamat menjadi panjang dan berisi hal yang tidak berarti bagi orang lain, misalnya baris mana yang sedang disorot. Simpan yang memang layak dibagikan',
          ],
          [
            'Melupakan reset halaman saat filter berubah',
            'Halamannya kan tidak disentuh',
            'Hasil filter baru bisa lebih pendek, dan pengguna melihat daftar kosong di halaman lima',
          ],
          [
            'Menguji hanya dengan mengklik, tidak dengan memuat ulang',
            'Alurnya kan sama',
            'Seluruh masalah di sub-bab ini hanya muncul saat halaman dimuat ulang atau tautan dibuka langsung. Selalu uji dengan menempelkan alamatnya di tab baru',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah kebiasaan yang menemukan sebagian besar masalah di sub-bab ini dalam satu menit. Setelah menyetel filter, salin alamatnya lalu buka di tab baru. Kalau halamannya tidak menampilkan keadaan yang sama, ada nilai yang seharusnya berada di alamat tapi tersimpan di state. Uji juga tombol kembali setelah beberapa perubahan, sebab itu yang menemukan masalah riwayat yang penuh.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'State sebagai potret per render, pantangan mutasi, nilai turunan yang dihitung bukan disimpan, empat keadaan tampilan, dan keputusan di mana sebuah nilai layak tinggal. Bab berikutnya membahas hook di luar `useState`, dan yang paling banyak dipakai di sana adalah `useEffect`. Yang perlu dibawa sejak sekarang, sebagian besar pemakaian `useEffect` yang kamu lihat di internet sebenarnya tidak diperlukan, dan alasannya sudah ada di sub-bab tentang nilai turunan.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pisahkan state sungguhan dari derived value sebelum menulis komponen.',
        'Jepit nilai seperti halaman saat render, bukan lewat effect.',
        'Debounce nilai yang dipakai menyaring, bukan yang ditampilkan.',
        'Logika penyaringan sebagai pure function — diuji tanpa React.',
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
          note: 'Langkah pertama praktik ini: pisahkan state sungguhan dari derived value.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan logika penyaringan sebaiknya berupa pure function di luar komponen.',
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
