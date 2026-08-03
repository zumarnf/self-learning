import {
  callout,
  code,
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

/** Frontend Basic — Chapter 3, all twelve lessons. Every sample was executed before writing. */
export const lessons: LessonDraft[] = [
  written(
    'event-loop',
    'Model Eksekusi: Call Stack, Web API, Task Queue, Event Loop',
    14,
    'Bagaimana bahasa bertugas-tunggal bisa menangani banyak hal sekaligus.',
    [
      p(
        'JavaScript menjalankan **satu hal pada satu waktu**. Tapi halaman web tetap responsif sambil mengunduh data, menunggu klik, dan menjalankan timer. Bab ini menjelaskan bagaimana keduanya bisa benar sekaligus — dan begitu kamu paham, hampir semua kebingungan soal asinkron hilang.',
      ),

      terms(
        {
          term: 'asinkron',
          meaning:
            'Dari *asynchronous*, gabungan *a-* (tidak) dan *synchronous* (serentak) — harfiahnya **tidak berbarengan**. Cara kerja di mana kamu memulai sebuah pekerjaan lalu **lanjut mengerjakan hal lain** tanpa menunggunya selesai, dan baru menanggapi hasilnya ketika ia benar-benar datang. Lawannya *sinkron*, di mana setiap baris harus benar-benar tuntas sebelum baris berikutnya dimulai.',
        },
        {
          term: 'single-threaded',
          meaning:
            'Terjemahannya **berutas tunggal**. *Thread* berarti utas atau jalur eksekusi. JavaScript hanya punya satu jalur, artinya ia benar-benar menjalankan **satu hal pada satu waktu**. Yang perlu diluruskan: ini **tidak** berarti JavaScript hanya bisa mengurus satu hal — pekerjaan menunggu dikerjakan oleh runtime di luar jalur itu, dan itulah seluruh isi sub-bab ini.',
        },
        {
          term: 'call stack',
          meaning:
            'Terjemahannya **tumpukan pemanggilan**. Tempat mesin JavaScript menjalankan kode, satu potongan pada satu waktu. Disebut tumpukan karena cara kerjanya seperti tumpukan piring: fungsi yang dipanggil terakhir adalah yang pertama selesai dan diangkat. Selama ada sesuatu di sini, **tidak ada apa pun dari antrean yang boleh masuk**.',
        },
        {
          term: 'frame',
          meaning:
            'Satu lapisan di dalam call stack, mewakili satu pemanggilan fungsi yang sedang berjalan beserta variabel lokalnya. Inilah yang kamu lihat berderet di panel Call Stack DevTools saat program berhenti di breakpoint.',
        },
        {
          term: 'Web API',
          meaning:
            'Kumpulan kemampuan yang disediakan **browser**, bukan bahasa JavaScript. `setTimeout`, `fetch`, dan pendengar event DOM semuanya termasuk. Ini titik yang paling sering disalahpahami: mesin JavaScript hanya **menitipkan** pekerjaan ke sini lalu langsung melanjutkan baris berikutnya — pekerjaannya sendiri dikerjakan di luar, oleh browser.',
        },
        {
          term: 'libuv',
          meaning:
            'Dibaca "lib-yu-vi", singkatan dari *library for unicorn velociraptor* menurut candaan penulisnya, tapi fungsinya serius: pustaka C yang menangani timer, akses berkas, dan jaringan di **Node.js**. Perannya persis sama dengan Web API di browser — mengerjakan hal-hal yang menunggu, di luar jalur utama JavaScript.',
        },
        {
          term: 'task queue',
          meaning:
            'Terjemahannya **antrean tugas**, disebut juga *callback queue*. Ruang tunggu tempat callback yang pekerjaannya sudah selesai berbaris, menunggu giliran masuk ke call stack. Kata kuncinya **antre** — selesai tidak berarti langsung dijalankan.',
        },
        {
          term: 'event loop',
          meaning:
            'Terjemahannya **gelung peristiwa**. Mekanisme yang tugasnya cuma satu dan diulang terus-menerus: **periksa apakah call stack kosong; kalau kosong, ambil satu dari antrean dan masukkan**. Sesederhana itu, dan dari aturan sesederhana itulah seluruh perilaku asinkron JavaScript berasal.',
        },
        {
          term: 'blocking',
          meaning:
            'Terjemahannya **memblokir**. Keadaan ketika sebuah pekerjaan menahan call stack begitu lama sehingga event loop tidak sempat memasukkan apa pun. Akibatnya terlihat langsung oleh pengguna: halaman tidak bisa di-scroll, tombol tidak merespons, animasi berhenti — karena tampilan dan JavaScript berbagi satu utas yang sama.',
        },
        {
          term: 'Web Worker',
          meaning:
            'Kemampuan browser untuk menjalankan JavaScript di **utas terpisah**, sehingga perhitungan berat tidak membekukan tampilan. Harganya: worker tidak bisa menyentuh DOM sama sekali dan hanya bisa berkomunikasi lewat pesan. Ini salah satu dari tiga jalan keluar untuk pekerjaan berat, selain memecahnya atau memindahkannya ke server.',
        },
      ),

      h2('Empat bagian'),
      table(
        ['Bagian', 'Tugasnya', 'Milik siapa'],
        [
          ['**Call stack**', 'Menjalankan kode, satu frame pada satu waktu', 'Mesin JS'],
          [
            '**Web API / libuv**',
            'Mengerjakan timer, jaringan, berkas — **di luar** mesin JS',
            'Browser / Node',
          ],
          ['**Task queue**', 'Menampung callback yang sudah siap dijalankan', 'Runtime'],
          [
            '**Event loop**',
            'Memindahkan callback dari antrean ke stack **saat stack kosong**',
            'Runtime',
          ],
        ],
      ),
      callout(
        'info',
        'Yang paling sering disalahpahami',
        '`setTimeout` **bukan** bagian dari bahasa JavaScript. Ia disediakan browser (atau Node). Mesin JS hanya menitipkan pekerjaan itu, lalu melanjutkan baris berikutnya. Itulah kenapa "single-threaded" tidak berarti "hanya bisa satu hal".',
      ),

      h2('Menelusuri satu contoh'),
      code(
        'js',
        `
        console.log('1');

        setTimeout(() => console.log('2'), 0);

        console.log('3');

        // Output: 1, 3, 2
        `,
      ),
      steps(
        {
          title: '`console.log("1")` masuk stack',
          body: 'Dijalankan, tercetak, keluar dari stack.',
        },
        {
          title: '`setTimeout` masuk stack',
          body: 'Ia **menitipkan** callback ke timer milik browser dengan tunda 0 ms, lalu langsung keluar dari stack. Callback-nya belum berjalan.',
        },
        { title: '`console.log("3")` masuk stack', body: 'Dijalankan, tercetak, keluar.' },
        {
          title: 'Timer selesai, callback masuk task queue',
          body: 'Ia menunggu di antrean — bukan langsung dijalankan.',
        },
        {
          title: 'Event loop melihat stack sudah kosong',
          body: 'Baru sekarang callback dipindahkan ke stack dan dijalankan. Tercetak "2".',
        },
      ),
      callout(
        'warning',
        '`setTimeout(fn, 0)` bukan "jalankan sekarang"',
        'Artinya "jalankan **secepatnya setelah semua kode sinkron selesai**". Kalau ada perhitungan berat yang berjalan 3 detik, callback itu menunggu 3 detik — bukan 0 ms.',
      ),

      h2('Kenapa perhitungan berat membekukan halaman'),
      code(
        'js',
        `
        document.querySelector('button').addEventListener('click', () => {
          let x = 0;
          for (let i = 0; i < 5_000_000_000; i++) x += i;   // beberapa detik
          console.log(x);
        });

        // Selama loop ini berjalan, stack TIDAK PERNAH kosong.
        // Event loop tidak bisa memasukkan apa pun: klik, scroll, animasi,
        // bahkan render ulang — semuanya menunggu. Halaman tampak "hang".
        `,
      ),
      p(
        'Tampilan dan JavaScript berbagi thread yang sama. Itulah kenapa pekerjaan berat harus dipecah, dipindahkan ke Web Worker, atau dikerjakan di server.',
      ),

      h2('Node.js: model yang sama, nama berbeda'),
      code(
        'js',
        `
        // Browser: Web API menangani setTimeout, fetch, event DOM
        // Node.js: libuv menangani timer, I/O berkas, jaringan
        //
        // Konsepnya identik: mesin JS menitipkan pekerjaan, lalu melanjutkan.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Mesin JS menjalankan satu hal pada satu waktu; runtime yang mengerjakan sisanya di luar.',
        '`setTimeout`, `fetch`, dan event DOM bukan bagian dari bahasa — mereka milik runtime.',
        'Event loop hanya memindahkan callback saat call stack **kosong**.',
        '`setTimeout(fn, 0)` berarti "setelah semua kode sinkron selesai", bukan "sekarang".',
        'Perhitungan berat memblokir tampilan karena keduanya berbagi satu thread.',
      ),
      references(
        {
          label: 'The event loop',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model',
          source: 'MDN',
          note: 'Model eksekusi resmi JavaScript: stack, antrean, dan aturan "jalankan sampai selesai".',
        },
        {
          label: 'setTimeout()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout',
          source: 'MDN',
          note: 'Bagian "Reasons for delays longer than specified" menjelaskan kenapa `0` tidak berarti sekarang.',
        },
        {
          label: 'The Node.js Event Loop',
          href: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
          source: 'Node.js',
          note: 'Versi Node dari model yang sama, lengkap dengan fase-fase libuv.',
        },
        {
          label: 'Using Web Workers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers',
          source: 'MDN',
          note: 'Jalan keluar untuk perhitungan berat yang tidak boleh membekukan tampilan.',
        },
        {
          label: 'Optimize long tasks',
          href: 'https://web.dev/articles/optimize-long-tasks',
          source: 'web.dev',
          note: 'Panduan resmi memecah pekerjaan panjang agar utas utama tetap responsif.',
        },
      ),
    ],
  ),

  written(
    'microtask-macrotask',
    'Microtask vs Macrotask',
    11,
    'Kenapa Promise selalu mendahului `setTimeout`, meski ditulis belakangan.',
    [
      p(
        'Ada **dua** antrean, bukan satu. Dan salah satunya selalu dikuras sampai habis sebelum yang lain disentuh.',
      ),

      terms(
        {
          term: 'microtask',
          meaning:
            'Terjemahan bebasnya **tugas mikro**. Antrean berprioritas **tinggi** yang menampung callback dari Promise (`.then`, `.catch`, `.finally`), setiap lanjutan `await`, `queueMicrotask`, dan `MutationObserver`. Sifat paling penting: antrean ini **dikuras sampai benar-benar habis** sebelum event loop menyentuh antrean satunya.',
        },
        {
          term: 'macrotask',
          meaning:
            'Terjemahan bebasnya **tugas makro**, kadang disebut hanya *task* dalam spesifikasi resmi. Antrean berprioritas normal yang menampung `setTimeout`, `setInterval`, event I/O, dan event DOM. Bedanya dengan microtask bukan soal kecepatan pekerjaannya, melainkan **giliran** — dan giliran itulah yang menentukan urutan hasil di layar.',
        },
        {
          term: 'queueMicrotask',
          meaning:
            'Fungsi bawaan untuk **menjadwalkan sesuatu ke antrean microtask secara langsung**, tanpa perlu membuat Promise kosong hanya sebagai perantara. Dipakai ketika kamu butuh sesuatu berjalan setelah kode sekarang selesai tapi sebelum timer mana pun mendapat giliran.',
        },
        {
          term: 'MutationObserver',
          meaning:
            'Kemampuan browser untuk **mengamati perubahan pada DOM** dan menjalankan callback ketika ada elemen yang ditambah, dihapus, atau diubah. Disebut di sini karena callback-nya masuk antrean microtask — sama seperti Promise, bukan seperti timer.',
        },
        {
          term: 'Promise.resolve()',
          meaning:
            'Cara paling cepat membuat Promise yang **sudah selesai sejak awal**. Bukan berarti `.then`-nya langsung berjalan — ia tetap masuk antrean microtask dan menunggu seluruh kode sinkron tuntas. Justru sifat inilah yang dibuktikan contoh di sub-bab ini.',
        },
        {
          term: 'menyerobot antrean',
          meaning:
            'Terjemahan bebas dari *queue jumping*. Keadaan ketika sebuah microtask yang dibuat **belakangan** tetap dijalankan lebih dulu daripada timer yang sudah menunggu lebih lama. Bukan bug: aturannya memang menguras seluruh antrean microtask dulu, termasuk yang baru lahir di tengah penguras itu.',
        },
        {
          term: 'render',
          meaning:
            'Artinya **menggambar ke layar**. Browser hanya sempat menggambar ulang di antara dua macrotask, **tidak** di tengah penguras antrean microtask. Inilah sebabnya teks "Memuat…" kadang tidak pernah terlihat sama sekali — dan untuk indikator yang sangat singkat, itu justru menguntungkan karena tidak ada kedipan.',
        },
        {
          term: 'starvation',
          meaning:
            'Terjemahannya **kelaparan**. Keadaan ketika satu jenis pekerjaan tidak pernah mendapat giliran karena jenis lain terus mengisi antrean berprioritas lebih tinggi. Microtask yang terus menjadwalkan microtask baru menyebabkan ini, dan efeknya di layar sama persis dengan `while (true)` — halaman mati total.',
        },
      ),

      table(
        ['Antrean', 'Isinya', 'Prioritas'],
        [
          [
            '**Microtask**',
            '`.then`/`.catch`/`.finally`, `await`, `queueMicrotask`, `MutationObserver`',
            '**Tinggi**',
          ],
          ['**Macrotask**', '`setTimeout`, `setInterval`, event I/O, event DOM', 'Normal'],
        ],
      ),
      p(
        'Aturannya: setelah satu macrotask selesai, event loop **mengosongkan seluruh antrean microtask** sebelum mengambil macrotask berikutnya.',
      ),

      h2('Membuktikannya'),
      code(
        'js',
        `
        console.log('A: sinkron');

        setTimeout(() => console.log('B: macrotask'), 0);

        Promise.resolve().then(() => console.log('C: microtask'));

        queueMicrotask(() => console.log('D: microtask'));

        console.log('E: sinkron');

        // Output:
        // A: sinkron
        // E: sinkron
        // C: microtask
        // D: microtask
        // B: macrotask
        `,
        { caption: 'Dijalankan dengan Node 22 — urutan ini sama di semua browser modern.' },
      ),
      ol(
        'Semua kode sinkron selesai lebih dulu — A dan E.',
        'Antrean microtask dikuras habis — C lalu D, sesuai urutan masuk.',
        'Baru macrotask pertama diambil — B.',
      ),

      h2('Microtask bisa menyerobot antrean'),
      code(
        'js',
        `
        setTimeout(() => console.log('timer'), 0);

        Promise.resolve().then(() => {
          console.log('microtask 1');
          Promise.resolve().then(() => console.log('microtask 2'));
        });

        // Output: microtask 1, microtask 2, timer
        // microtask 2 dibuat SETELAH timer menunggu, tapi tetap didahulukan.
        `,
      ),
      callout(
        'danger',
        'Microtask tak berujung membekukan halaman',
        'Karena antreannya dikuras sampai habis, sebuah microtask yang terus menjadwalkan microtask baru tidak akan pernah memberi giliran ke macrotask maupun render. Efeknya sama persis dengan `while(true)` — halaman mati.',
      ),

      h2('Kenapa ini penting dalam praktik'),
      code(
        'js',
        `
        // Kasus nyata: pembaruan tampilan tertunda
        elemen.textContent = 'Memuat…';
        await simpanData();          // microtask
        elemen.textContent = 'Selesai';

        // Pembaca mungkin TIDAK PERNAH melihat 'Memuat…' kalau simpanData()
        // selesai dalam satu microtask — browser belum sempat menggambar
        // di antara keduanya. Untuk indikator singkat, ini justru bagus:
        // tidak ada kedipan.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Dua antrean: microtask (Promise, `await`) berprioritas di atas macrotask (`setTimeout`).',
        'Antrean microtask dikuras **habis** sebelum macrotask berikutnya diambil.',
        'Microtask yang dibuat di dalam microtask tetap didahulukan dari timer yang sudah menunggu.',
        'Microtask tak berujung membekukan halaman sama seperti loop tak berujung.',
      ),
      references(
        {
          label: 'Microtask guide',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide',
          source: 'MDN',
          note: 'Rujukan utama sub-bab ini: kapan microtask dijalankan dan kenapa antreannya dikuras habis.',
        },
        {
          label: 'queueMicrotask()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask',
          source: 'MDN',
          note: 'Termasuk penjelasan kenapa ia lebih tepat daripada memakai `Promise.resolve().then()` sebagai perantara.',
        },
        {
          label: 'Promise.resolve()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve',
          source: 'MDN',
          note: 'Menegaskan bahwa Promise yang sudah selesai pun tetap menunggu giliran di antrean microtask.',
        },
        {
          label: 'MutationObserver',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver',
          source: 'MDN',
          note: 'Contoh lain callback yang masuk antrean microtask, bukan macrotask.',
        },
        {
          label: 'Event loop: microtasks and macrotasks',
          href: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model',
          source: 'WHATWG HTML',
          note: 'Spesifikasi aslinya — sumber kebenaran untuk urutan yang dibuktikan di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'callback',
    'Callback & Callback Hell',
    10,
    'Pola asinkron generasi pertama, dan masalah nyata yang melahirkan Promise.',
    [
      p(
        'Sebelum Promise, satu-satunya cara mengatakan "kerjakan ini setelah selesai" adalah mengoper fungsi. Polanya sederhana dan masih ada di mana-mana.',
      ),

      terms(
        {
          term: 'callback',
          meaning:
            'Terjemahan bebasnya **fungsi panggilan balik**. Fungsi yang kamu serahkan ke pihak lain dengan kesepakatan bahwa **pihak itulah yang akan memanggilnya** ketika saatnya tiba. Kamu sudah memakainya setiap hari tanpa menyebut namanya: bagian `(n) => n * 2` pada `map`, dan fungsi di dalam `addEventListener`, keduanya callback.',
        },
        {
          term: 'error-first callback',
          meaning:
            'Terjemahannya **callback dengan error di depan**. Konvensi Node.js di mana parameter **pertama** callback selalu berisi error (atau `null` kalau berhasil), dan hasilnya baru di parameter kedua: `(err, isi) => { ... }`. Konvensi ini lahir karena pada masa itu tidak ada mekanisme bawaan untuk menyampaikan kegagalan lewat callback.',
        },
        {
          term: 'err',
          meaning:
            'Singkatan *error*, nama parameter pertama yang hampir selalu dipakai pada error-first callback. Bukan kata kunci — hanya kebiasaan penamaan yang begitu seragam sampai terasa seperti aturan.',
        },
        {
          term: 'callback hell',
          meaning:
            'Terjemahan bebasnya **neraka callback**, disebut juga *pyramid of doom* (piramida kiamat) karena bentuk indentasinya yang melebar ke kanan seperti piramida miring. Keadaan ketika beberapa operasi asinkron yang saling bergantung harus disarangkan satu di dalam yang lain. Masalahnya bukan estetika: penanganan error jadi terduplikasi di setiap tingkat, dan alur bacanya berlawanan dengan urutan kejadiannya.',
        },
        {
          term: 'inversion of control',
          meaning:
            'Terjemahannya **pembalikan kendali**. Keadaan ketika kamu menyerahkan fungsimu ke pihak lain, sehingga **pihak lain itu yang memutuskan** kapan, berapa kali, dan dengan argumen apa fungsimu dipanggil. Kalau pustaka itu memanggilnya dua kali karena bug, kodemu ikut berjalan dua kali — dan kamu tidak punya cara mencegahnya. Promise mengembalikan kendali itu ke tanganmu.',
        },
        {
          term: 'nesting',
          meaning:
            'Artinya **penyarangan** — blok di dalam blok. Pada kode asinkron gaya callback, setiap operasi yang bergantung pada hasil operasi sebelumnya menambah satu tingkat sarang, dan tingkat itu bertambah lebih cepat daripada yang dibayangkan.',
        },
        {
          term: 'node:fs',
          meaning:
            'Modul `fs` Node.js dengan awalan `node:` yang menegaskan bahwa ini **modul bawaan**, bukan paket dari `node_modules`. Awalan ini dianjurkan sejak Node 16 karena menghilangkan kemungkinan tertukar dengan paket pihak ketiga bernama sama.',
        },
        {
          term: 'utf8',
          meaning:
            'Singkatan *Unicode Transformation Format, 8-bit*. Cara baku menyimpan teks sebagai byte, dan yang dipakai hampir seluruh web. Menyebutkannya pada `readFile` membuat Node mengembalikan **teks** siap pakai; tanpa itu, yang kamu dapat adalah data mentah berupa byte.',
        },
      ),

      h2('Callback sebagai argumen'),
      code(
        'js',
        `
        function ambilData(id, selesai) {
          setTimeout(() => selesai({ id, nama: 'Zum' }), 500);
        }

        ambilData(1, (data) => console.log(data));

        // Kamu memakai pola ini setiap hari tanpa menyebutnya callback:
        [1, 2, 3].map((n) => n * 2);
        tombol.addEventListener('click', () => {});
        `,
      ),

      h2('Error-first callback — konvensi Node.js'),
      code(
        'js',
        `
        import { readFile } from 'node:fs';

        readFile('data.txt', 'utf8', (err, isi) => {
          if (err) {
            console.error('Gagal membaca:', err.message);
            return;                       // JANGAN LUPA return
          }
          console.log(isi);
        });
        `,
      ),
      callout(
        'warning',
        'Lupa `return` setelah menangani error',
        'Tanpa `return`, eksekusi lanjut ke baris berikutnya dengan `isi` bernilai `undefined` — dan errornya terlihat seolah datang dari tempat lain. Ini bug klasik pada kode gaya callback.',
      ),

      h2('Callback hell'),
      code(
        'js',
        `
        ambilPengguna(id, (err, pengguna) => {
          if (err) return tangani(err);

          ambilPesanan(pengguna.id, (err, pesanan) => {
            if (err) return tangani(err);

            ambilDetail(pesanan[0].id, (err, detail) => {
              if (err) return tangani(err);

              ambilPengiriman(detail.kodePos, (err, ongkir) => {
                if (err) return tangani(err);
                tampilkan(ongkir);
              });
            });
          });
        });
        `,
      ),
      p('Masalahnya bukan sekadar tampilan piramida. Ada tiga hal yang benar-benar merugikan:'),
      ol(
        '**Penanganan error berulang** di setiap tingkat, dan satu yang terlewat membuat kegagalan hilang diam-diam.',
        '**Tidak bisa dirangkai atau dikembalikan** — kamu tidak bisa `return` hasilnya ke pemanggil.',
        '**Sulit menjalankan paralel** — menjalankan tiga permintaan bersamaan lalu menunggu semuanya butuh penghitung manual.',
      ),

      h2('Satu masalah lagi: inversion of control'),
      code(
        'js',
        `
        pustakaOrangLain(data, (hasil) => {
          simpanKeDatabase(hasil);
        });

        // Kamu menyerahkan kendali. Bagaimana kalau pustaka itu:
        //   - memanggil callback-mu dua kali?  -> data tersimpan dua kali
        //   - tidak pernah memanggilnya?       -> menggantung selamanya
        //   - memanggilnya secara sinkron?     -> urutan tak terduga
        // Promise menutup ketiganya: ia hanya bisa selesai SATU KALI.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Callback bekerja, dan masih dipakai di `map`, event listener, dan API Node.',
        'Konvensi Node adalah error-first — dan `return` setelah menangani error itu wajib.',
        'Masalah nyata callback hell: error berulang, tidak bisa dirangkai, sulit diparalelkan.',
        'Promise juga menyelesaikan inversion of control — ia hanya bisa selesai sekali.',
      ),
      references(
        {
          label: 'Callback function',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Callback_function',
          source: 'MDN',
          note: 'Definisi ringkas beserta pembedaan callback sinkron dan asinkron.',
        },
        {
          label: 'Introducing asynchronous JavaScript',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing',
          source: 'MDN',
          note: 'Bagian tentang callback bersarang dan masalah yang melahirkan Promise.',
        },
        {
          label: 'Asynchronous flow control',
          href: 'https://nodejs.org/en/learn/asynchronous-work/asynchronous-flow-control',
          source: 'Node.js',
          note: 'Sumber resmi konvensi error-first callback dan alasan di baliknya.',
        },
        {
          label: 'fs.readFile()',
          href: 'https://nodejs.org/api/fs.html#fsreadfilepath-options-callback',
          source: 'Node.js',
          note: 'Contoh baku error-first callback, termasuk arti opsi `utf8`.',
        },
      ),
    ],
  ),

  written(
    'promise',
    'Promise: `then`, `catch`, `finally`',
    13,
    'Objek yang mewakili nilai yang belum ada — dan bisa dioper, dirangkai, dikembalikan.',
    [
      p(
        'Promise adalah **objek biasa** yang mewakili hasil operasi yang belum selesai. Karena ia objek, ia bisa disimpan di variabel, dioper ke fungsi lain, dan dikembalikan — tiga hal yang tidak bisa dilakukan callback.',
      ),

      terms(
        {
          term: 'Promise',
          meaning:
            'Dibaca "pro-mis", artinya **janji**. Sebuah **objek biasa** yang mewakili hasil operasi yang belum selesai — janji bahwa suatu saat nanti akan ada nilainya, atau ada alasan kenapa gagal. Karena ia objek, ia bisa disimpan di variabel, dioper ke fungsi lain, dan dikembalikan dari fungsi. Tiga kemampuan itulah yang tidak dimiliki callback, dan dari situlah seluruh keunggulannya berasal.',
        },
        {
          term: 'pending',
          meaning:
            'Artinya **menggantung** atau belum selesai. Keadaan awal setiap Promise: pekerjaannya sudah dimulai, tapi hasilnya belum ada dan belum ada kegagalan juga.',
        },
        {
          term: 'fulfilled',
          meaning:
            'Artinya **terpenuhi**. Keadaan Promise yang berhasil selesai dan membawa sebuah nilai. Callback yang didaftarkan lewat `.then()` akan menerima nilai itu.',
        },
        {
          term: 'rejected',
          meaning:
            'Artinya **ditolak**. Keadaan Promise yang gagal dan membawa sebuah alasan — hampir selalu berupa objek `Error`. Callback yang didaftarkan lewat `.catch()` akan menerimanya.',
        },
        {
          term: 'settled',
          meaning:
            'Artinya **sudah pasti**. Istilah payung untuk Promise yang sudah tidak `pending` lagi — entah `fulfilled` atau `rejected`. Sifat terpentingnya: **sekali settled, keadaannya tidak bisa berubah lagi selamanya**, dan inilah yang menutup masalah "callback dipanggil dua kali" dari sub-bab sebelumnya.',
        },
        {
          term: 'resolve / reject',
          meaning:
            'Dua fungsi yang kamu panggil untuk **menentukan nasib** sebuah Promise. `resolve(nilai)` memindahkannya ke `fulfilled`, `reject(alasan)` ke `rejected`. Panggilan kedua dan seterusnya diabaikan diam-diam — bukan error, tapi juga tidak berpengaruh apa-apa.',
        },
        {
          term: 'chaining',
          meaning:
            'Terjemahannya **merangkai**. Menyambung beberapa `.then()` berturut-turut. Ini mungkin karena setiap `.then()` **selalu mengembalikan Promise baru**, sehingga hasilnya bisa disambung lagi. Bandingkan bentuknya dengan piramida callback di sub-bab sebelumnya: rangkaian ini **rata**, dan urutan bacanya sama dengan urutan kejadiannya.',
        },
        {
          term: 'unhandled rejection',
          meaning:
            'Terjemahannya **penolakan yang tidak ditangani**. Promise yang gagal tapi tidak punya satu pun `.catch()` maupun `try/catch` yang menangkapnya. Di browser ia memicu event `unhandledrejection` dan muncul sebagai peringatan di console; di Node.js modern, ia **menghentikan proses**. Karena itu ia harus diperlakukan sebagai cacat, bukan sebagai gangguan kecil.',
        },
        {
          term: 'thenable',
          meaning:
            'Sebutan untuk objek apa pun yang **punya method `.then()`**, meski bukan Promise sungguhan. JavaScript memperlakukannya seperti Promise saat dirangkai. Berguna untuk kompatibilitas dengan pustaka lama yang punya jenis Promise-nya sendiri sebelum ada versi bawaan.',
        },
      ),

      h2('Tiga keadaan'),
      table(
        ['Keadaan', 'Artinya'],
        [
          ['`pending`', 'Belum selesai'],
          ['`fulfilled`', 'Selesai dengan nilai'],
          ['`rejected`', 'Gagal dengan alasan'],
        ],
        'Sekali berpindah dari `pending`, keadaannya **tidak bisa berubah lagi**. Ini yang menutup masalah "callback dipanggil dua kali".',
      ),

      h2('Merangkai'),
      code(
        'js',
        `
        ambilPengguna(1)
          .then((pengguna) => ambilPesanan(pengguna.id))   // kembalikan promise -> dirangkai
          .then((pesanan) => pesanan[0])
          .then((pertama) => console.log(pertama))
          .catch((err) => console.error('Gagal:', err.message))
          .finally(() => sembunyikanIndikator());
        `,
      ),
      p(
        'Bandingkan dengan piramida callback di sub-bab sebelumnya: **rata**, dan **satu** `catch` menangkap kegagalan dari tahap mana pun.',
      ),

      h2('Aturan `then` yang menentukan segalanya'),
      code(
        'js',
        `
        Promise.resolve(1)
          .then((n) => n + 1)                    // kembalikan nilai -> dibungkus jadi promise
          .then((n) => Promise.resolve(n * 2))   // kembalikan promise -> DITUNGGU dulu
          .then((n) => console.log(n));          // 4
        `,
      ),
      callout(
        'danger',
        'Kesalahan nomor satu: lupa `return` di dalam rantai',
        'Kalau sebuah `then` tidak mengembalikan apa pun, tahap berikutnya menerima `undefined` — dan promise di dalamnya berjalan tanpa ditunggu.',
      ),
      code(
        'js',
        `
        // SALAH
        ambilPengguna(1)
          .then((u) => { ambilPesanan(u.id); })   // tidak dikembalikan
          .then((pesanan) => console.log(pesanan));   // undefined

        // BENAR
        ambilPengguna(1)
          .then((u) => ambilPesanan(u.id))
          .then((pesanan) => console.log(pesanan));
        `,
      ),

      h2('`catch` menangkap dari tahap mana pun'),
      code(
        'js',
        `
        Promise.resolve()
          .then(() => { throw new Error('gagal di tahap 1'); })
          .then(() => console.log('dilewati'))
          .catch((e) => console.log('tertangkap:', e.message))
          .then(() => console.log('rantai lanjut setelah catch'));

        // tertangkap: gagal di tahap 1
        // rantai lanjut setelah catch
        `,
      ),
      p(
        'Setelah `catch` menangani kegagalan, rantai kembali ke jalur normal — mirip `try`/`catch` yang diikuti kode lain.',
      ),

      h2('`finally`'),
      code(
        'js',
        `
        tampilkanIndikator();

        ambilData()
          .then(tampilkan)
          .catch(tampilkanError)
          .finally(() => sembunyikanIndikator());   // selalu jalan

        // finally TIDAK menerima nilai dan TIDAK mengubah hasil rantai —
        // ia untuk pembersihan, bukan untuk transformasi.
        `,
      ),

      h2('Unhandled rejection'),
      code(
        'js',
        `
        // Promise yang ditolak tanpa .catch di mana pun:
        Promise.reject(new Error('tidak ditangani'));
        // Node: UnhandledPromiseRejection -> proses berhenti
        // Browser: error di console

        // Jaring pengaman terakhir (bukan pengganti .catch di tempatnya):
        window.addEventListener('unhandledrejection', (e) => {
          laporkan(e.reason);
        });
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Promise adalah objek — bisa disimpan, dioper, dan dikembalikan.',
        'Sekali selesai, keadaannya tidak bisa berubah lagi.',
        'Mengembalikan promise dari `then` membuatnya ditunggu; lupa `return` memutus rantai.',
        'Satu `catch` menangkap kegagalan dari tahap mana pun sebelumnya.',
        '`finally` untuk pembersihan — ia tidak mengubah hasil.',
      ),
      references(
        {
          label: 'Promise',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
          source: 'MDN',
          note: 'Rujukan lengkap ketiga keadaan, aturan perangkaian, dan seluruh method statisnya.',
        },
        {
          label: 'Using promises',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises',
          source: 'MDN',
          note: 'Panduan resmi yang secara khusus membahas kesalahan "lupa `return`" yang memutus rantai.',
        },
        {
          label: 'Promise.prototype.finally()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally',
          source: 'MDN',
          note: 'Menegaskan bahwa ia tidak menerima nilai dan tidak mengubah hasil rantai.',
        },
        {
          label: 'unhandledrejection event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event',
          source: 'MDN',
          note: 'Jaring pengaman terakhir — bukan pengganti `.catch()` di tempat kejadiannya.',
        },
        {
          label: 'Promise rejection handling',
          href: 'https://nodejs.org/api/process.html#event-unhandledrejection',
          source: 'Node.js',
          note: 'Alasan penolakan yang tidak ditangani menghentikan proses di Node.js modern.',
        },
      ),
    ],
  ),

  written(
    'membuat-promise',
    'Membuat Promise Sendiri & Promisify',
    11,
    'Membungkus API berbasis callback menjadi Promise.',
    [
      p(
        'Sebagian besar waktu kamu **mengonsumsi** promise dari `fetch` atau pustaka. Sesekali kamu perlu membuatnya sendiri — biasanya untuk membungkus API lama.',
      ),

      terms(
        {
          term: 'executor',
          meaning:
            'Dibaca "ek-se-kyu-tor", artinya **pelaksana**. Fungsi yang kamu serahkan ke `new Promise((resolve, reject) => { ... })`. Satu hal yang penting dan sering mengejutkan: **ia dijalankan seketika dan secara sinkron**, tepat saat `new Promise` dipanggil — bukan nanti. Yang asinkron adalah kapan `resolve` atau `reject` akhirnya dipanggil dari dalamnya.',
        },
        {
          term: 'resolve',
          meaning:
            'Fungsi yang memindahkan Promise ke keadaan berhasil sambil membawa sebuah nilai. Kalau kamu memanggilnya tanpa argumen — seperti pada `setTimeout(resolve, ms)` — nilainya `undefined`, dan itu wajar untuk janji yang gunanya cuma "beri tahu aku kalau sudah waktunya".',
        },
        {
          term: 'reject',
          meaning:
            'Fungsi yang memindahkan Promise ke keadaan gagal sambil membawa alasan. **Selalu berikan objek `Error`**, bukan teks biasa — alasannya sama dengan `throw` di Sub-bab 1.14: hanya objek `Error` yang membawa jejak tumpukan.',
        },
        {
          term: 'promisify',
          meaning:
            'Terjemahan bebasnya **menjadikan Promise**. Membungkus sebuah fungsi bergaya error-first callback menjadi fungsi yang mengembalikan Promise, sehingga bisa dipakai dengan `await`. Node.js menyediakan `util.promisify` siap pakai untuk pola baku ini.',
        },
        {
          term: 'API lama',
          meaning:
            'Sebutan untuk antarmuka yang dibuat sebelum Promise ada, sehingga hanya menerima callback — misalnya `img.onload`, `FileReader`, dan sebagian besar modul Node generasi awal. Membungkusnya adalah alasan paling umum kamu perlu menulis `new Promise` sendiri.',
        },
        {
          term: 'onload / onerror',
          meaning:
            'Property untuk memasang callback pada objek browser seperti `Image` dan `FileReader`. `onload` dipanggil saat berhasil, `onerror` saat gagal. Keduanya adalah contoh sempurna API lama: ia memberi tahu hasilnya lewat callback, bukan lewat Promise.',
        },
        {
          term: 'Promise.resolve / reject',
          meaning:
            'Dua **helper statis** untuk membuat Promise yang sudah selesai sejak awal. Berguna untuk menyeragamkan bentuk nilai kembalian — misalnya sebuah fungsi yang kadang punya hasil di cache dan kadang harus mengambil dari jaringan tetap bisa selalu mengembalikan Promise.',
        },
        {
          term: 'anti-pola constructor',
          meaning:
            'Terjemahan dari *promise constructor antipattern*. Membungkus sesuatu yang **sudah** berupa Promise ke dalam `new Promise` lagi. Selain berlebihan, ia berbahaya karena error dari Promise dalam mudah tertelan dan tidak pernah sampai ke `.catch()` di luar.',
        },
      ),

      h2('`new Promise`'),
      code(
        'js',
        `
        function tunggu(ms) {
          return new Promise((resolve) => setTimeout(resolve, ms));
        }

        await tunggu(1000);   // jeda satu detik, tanpa memblokir apa pun
        `,
      ),
      code(
        'js',
        `
        function muatGambar(url) {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(\`Gagal memuat gambar: \${url}\`));
            img.src = url;
          });
        }
        `,
      ),

      h2('Tiga kesalahan yang sering terjadi'),
      code(
        'js',
        `
        // 1. Lupa memanggil reject — kegagalan jadi menggantung selamanya
        new Promise((resolve) => {
          lakukanSesuatu((err, hasil) => {
            if (err) return;          // SALAH: promise tidak pernah selesai
            resolve(hasil);
          });
        });

        // 2. Menolak dengan string, bukan Error — kehilangan jejak tumpukan
        reject('gagal');              // SALAH
        reject(new Error('gagal'));   // BENAR

        // 3. Membungkus sesuatu yang sudah berupa promise
        new Promise((resolve) => resolve(fetch(url)));   // berlebihan
        fetch(url);                                       // cukup
        `,
      ),
      callout(
        'warning',
        'Anti-pola "explicit promise construction"',
        'Kalau di dalam `new Promise` kamu memanggil sesuatu yang sudah mengembalikan promise, kamu hampir pasti tidak membutuhkan `new Promise` sama sekali. Ia hanya untuk membungkus API yang **belum** berbasis promise.',
      ),

      h2('Promisify'),
      code(
        'js',
        `
        function promisify(fn) {
          return (...args) =>
            new Promise((resolve, reject) => {
              fn(...args, (err, hasil) => (err ? reject(err) : resolve(hasil)));
            });
        }

        import { readFile } from 'node:fs';
        const bacaBerkas = promisify(readFile);

        const isi = await bacaBerkas('data.txt', 'utf8');
        `,
      ),
      callout(
        'tip',
        'Node sudah menyediakan keduanya',
        '`import { promisify } from "node:util"` untuk API lama, dan `import { readFile } from "node:fs/promises"` untuk versi promise yang sudah jadi. Menulis sendiri berguna untuk memahaminya, bukan untuk dipakai.',
      ),

      h2('Helper statis'),
      code(
        'js',
        `
        Promise.resolve(5);                    // promise yang langsung selesai
        Promise.reject(new Error('x'));        // promise yang langsung gagal

        // Berguna untuk menyeragamkan nilai sinkron dan asinkron
        function ambil(id) {
          const cache = cari(id);
          return cache ? Promise.resolve(cache) : fetch(\`/api/\${id}\`);
        }
        // Pemanggil selalu bisa memakai await, tanpa perlu tahu mana yang terjadi.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`new Promise` hanya untuk membungkus API yang belum berbasis promise.',
        'Selalu tolak dengan objek `Error`, bukan string.',
        'Lupa memanggil `reject` membuat promise menggantung selamanya.',
        '`Promise.resolve()` menyeragamkan jalur sinkron dan asinkron bagi pemanggil.',
      ),
      references(
        {
          label: 'Promise() constructor',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise',
          source: 'MDN',
          note: 'Menegaskan bahwa fungsi executor dijalankan seketika dan secara sinkron.',
        },
        {
          label: 'Promise.resolve()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve',
          source: 'MDN',
          note: 'Helper untuk menyeragamkan jalur sinkron dan asinkron bagi pemanggil.',
        },
        {
          label: 'util.promisify()',
          href: 'https://nodejs.org/api/util.html#utilpromisifyoriginal',
          source: 'Node.js',
          note: 'Versi siap pakai dari pembungkus error-first callback yang ditulis manual di sub-bab ini.',
        },
        {
          label: 'HTMLImageElement: load event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/load_event',
          source: 'MDN',
          note: 'API lama berbasis `onload`/`onerror` yang dibungkus pada contoh `muatGambar`.',
        },
      ),
    ],
  ),

  written(
    'async-await',
    '`async`/`await` dan Cara Menangani Error-nya',
    13,
    'Sintaks yang membuat kode asinkron terbaca seperti kode biasa — tanpa mengubah cara kerjanya.',
    [
      p(
        '`async`/`await` adalah lapisan sintaks di atas Promise. Tidak ada mekanisme baru — hanya cara menulis yang jauh lebih mudah dibaca.',
      ),

      terms(
        {
          term: 'async',
          meaning:
            'Kata kunci yang ditaruh di depan sebuah fungsi. Efeknya dua: fungsi itu **selalu mengembalikan Promise** (bahkan kalau isinya `return 1`, yang kamu terima adalah `Promise { 1 }`), dan di dalamnya kamu boleh memakai `await`. Perhatikan konsekuensi pertama baik-baik — lupa `await` saat memanggil fungsi async adalah salah satu bug asinkron paling sering.',
        },
        {
          term: 'await',
          meaning:
            'Artinya **menunggu**. Kata kunci yang **menjeda fungsi async tempat ia berada** sampai Promise yang ditunggunya selesai, lalu melanjutkan dengan nilai hasilnya. Yang wajib diluruskan: ia **tidak memblokir aplikasi** — yang berhenti hanyalah badan fungsi itu sendiri, sementara sisa program tetap berjalan seperti biasa.',
        },
        {
          term: 'lapisan sintaks',
          meaning:
            'Sama seperti `class` di Bab 2, `async`/`await` **tidak menambah mekanisme baru** ke bahasa. Di balik layar ia tetap Promise dan tetap memakai antrean microtask; yang berubah hanyalah bentuk tulisannya, dari rangkaian `.then()` menjadi alur yang terbaca lurus ke bawah.',
        },
        {
          term: 'try/catch',
          meaning:
            'Inilah keuntungan terbesar `async`/`await`: kegagalan asinkron bisa ditangani dengan `try`/`catch` yang **sama persis** dengan kegagalan biasa dari Sub-bab 1.14. Tidak perlu lagi mengingat bahwa error asinkron butuh jalur penanganan tersendiri.',
        },
        {
          term: 'top-level await',
          meaning:
            'Terjemahannya **`await` di tingkat teratas**. Kemampuan memakai `await` **langsung di badan modul**, di luar fungsi async mana pun. Hanya tersedia di modul ES, bukan CommonJS. Perlu diingat: ia menunda selesainya modul itu, sehingga modul lain yang mengimpornya ikut menunggu.',
        },
        {
          term: 'sequential',
          meaning:
            'Artinya **berurutan**. Dua `await` yang ditulis berurutan berarti yang kedua **baru dimulai setelah** yang pertama selesai. Kalau keduanya sebenarnya tidak saling bergantung, ini pemborosan waktu murni — dan itulah kesalahan performa yang dibahas tuntas di sub-bab berikutnya.',
        },
        {
          term: 'res',
          meaning:
            'Singkatan *response* (respons), nama variabel yang lazim dipakai untuk hasil `fetch`. Perhatikan bahwa `res` **belum berisi data** — ia baru berisi status dan header. Datanya baru keluar setelah `await res.json()`, dan itulah kenapa ada dua `await` berturut-turut.',
        },
        {
          term: 'IIFE async',
          meaning:
            'Singkatan *Immediately Invoked Function Expression*, artinya **fungsi yang langsung dipanggil saat itu juga**. Pola `(async () => { ... })()` dipakai untuk mendapatkan tempat memakai `await` di lingkungan yang belum mendukung top-level await — misalnya berkas CommonJS.',
        },
      ),

      h2('Dua aturan'),
      code(
        'js',
        `
        // 1. Fungsi async SELALU mengembalikan Promise
        async function f() { return 1; }
        f();                    // Promise { 1 } — bukan 1
        await f();              // 1

        // 2. await menjeda fungsi itu sampai promise selesai
        async function ambil() {
          const res = await fetch('/api/data');   // fungsi ini berhenti di sini
          const data = await res.json();          // ...dan di sini
          return data;
        }
        `,
      ),
      callout(
        'info',
        '`await` tidak memblokir apa pun selain fungsinya sendiri',
        'Sisa aplikasi tetap berjalan. Yang dijeda hanya badan fungsi async itu, dan ia dilanjutkan lewat antrean microtask setelah promise-nya selesai.',
      ),

      h2('Perbandingan langsung'),
      code(
        'js',
        `
        // then
        function ambilProfil(id) {
          return ambilPengguna(id)
            .then((u) => ambilPesanan(u.id))
            .then((pesanan) => ({ jumlah: pesanan.length }))
            .catch((e) => { console.error(e); throw e; });
        }

        // async/await — alur bacanya lurus ke bawah
        async function ambilProfil2(id) {
          try {
            const u = await ambilPengguna(id);
            const pesanan = await ambilPesanan(u.id);
            return { jumlah: pesanan.length };
          } catch (e) {
            console.error(e);
            throw e;
          }
        }
        `,
      ),

      h2('Penanganan error'),
      code(
        'js',
        `
        async function ambilData() {
          try {
            const res = await fetch('/api/data');

            // fetch TIDAK menolak untuk 404 atau 500 — periksa sendiri
            if (!res.ok) {
              throw new Error(\`Server balas \${res.status}\`);
            }

            return await res.json();
          } catch (error) {
            // Menangkap kegagalan jaringan DAN Error yang kita lempar sendiri
            console.error('[ambilData]', error);
            throw error;     // biarkan pemanggil yang memutuskan tampilannya
          }
        }
        `,
      ),
      callout(
        'danger',
        '`return` vs `return await` di dalam `try`',
        '`return janji;` mengembalikan promise-nya **tanpa menunggu**, jadi kalau ia gagal, `catch` di fungsi itu **tidak** menangkapnya. `return await janji;` menunggu lebih dulu, sehingga kegagalannya tertangkap. Di dalam `try`, hampir selalu pakai `return await`.',
      ),

      h2('Top-level await'),
      code(
        'js',
        `
        // Di dalam modul ES, await boleh dipakai di level teratas
        const konfigurasi = await fetch('/config.json').then((r) => r.json());

        // Tidak berlaku di CommonJS, dan tidak di dalam fungsi biasa
        `,
      ),

      h2('Kapan `then` masih lebih tepat'),
      code(
        'js',
        `
        // Satu transformasi ringkas — membungkusnya dengan async terasa berlebihan
        const namaPengguna = ambilPengguna(id).then((u) => u.nama);

        // Efek samping yang sengaja tidak ditunggu, dengan catch eksplisit
        kirimAnalitik(peristiwa).catch(() => {});   // sengaja diabaikan, dan terlihat

        // Merangkai di tempat, di dalam ekspresi
        const hasil = daftar.map((id) => ambil(id).then(format));
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Fungsi `async` selalu mengembalikan Promise, apa pun isinya.',
        '`await` menjeda fungsinya sendiri, bukan aplikasinya.',
        '`fetch` tidak menolak untuk 404/500 — periksa `res.ok` sendiri.',
        'Di dalam `try`, pakai `return await` supaya kegagalannya tertangkap.',
        '`then` masih lebih ringkas untuk transformasi tunggal dan efek samping yang sengaja tidak ditunggu.',
      ),
      references(
        {
          label: 'async function',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
          source: 'MDN',
          note: 'Menegaskan bahwa fungsi async selalu mengembalikan Promise, apa pun isi `return`-nya.',
        },
        {
          label: 'await',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await',
          source: 'MDN',
          note: 'Termasuk penjelasan bahwa lanjutannya dijadwalkan lewat antrean microtask.',
        },
        {
          label: 'Response.ok',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Response/ok',
          source: 'MDN',
          note: 'Dasar peringatan penting sub-bab ini: `fetch` tidak menolak untuk status 404 atau 500.',
        },
        {
          label: 'Top level await',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
          source: 'MDN',
          note: 'Bagian "Top level await" menjelaskan batasnya — hanya di modul ES, dan menunda modul pengimpor.',
        },
        {
          label: 'How to use promises',
          href: 'https://web.dev/articles/promises',
          source: 'web.dev',
          note: 'Perbandingan gaya `then` dan `async`/`await` beserta kapan masing-masing lebih tepat.',
        },
      ),
    ],
  ),

  written(
    'paralel-vs-berurutan',
    'Paralel vs Berurutan: `all`, `allSettled`, `race`, `any`',
    13,
    'Kesalahan performa paling umum di kode asinkron — dan empat alat untuk memperbaikinya.',
    [
      p(
        'Ini sub-bab dengan dampak paling langsung ke kecepatan aplikasi. Satu perubahan kecil sering mengubah waktu muat dari tiga detik menjadi setengah detik.',
      ),

      terms(
        {
          term: 'berurutan',
          meaning:
            'Terjemahan dari *sequential*. Pekerjaan kedua **baru dimulai setelah** yang pertama benar-benar selesai. Wajib dipakai kalau yang kedua memang membutuhkan hasil yang pertama; pemborosan murni kalau tidak. Cara mengenalinya saat membaca kode ada di bawah, dan cuma butuh satu pertanyaan.',
        },
        {
          term: 'paralel',
          meaning:
            'Semua pekerjaan **dimulai bersamaan**, lalu hasilnya ditunggu sekaligus. Perlu diluruskan sedikit: JavaScript tetap berutas tunggal, jadi yang benar-benar berjalan bersamaan adalah **penantiannya** — jaringan dan berkas dikerjakan runtime di luar. Untuk pekerjaan yang menunggu, efeknya sama saja: total waktu turun dari jumlah semuanya menjadi sepanjang yang paling lambat.',
        },
        {
          term: 'Promise.all',
          meaning:
            'Menunggu **semua** Promise selesai dan mengembalikan array hasilnya dengan urutan yang sama seperti masukannya. Sifat penting: **satu saja gagal, seluruhnya langsung gagal** — perilaku *fail-fast*. Pakai ini ketika semua hasil memang wajib ada; kalau sebagian boleh gagal, pakai `allSettled`.',
        },
        {
          term: 'Promise.allSettled',
          meaning:
            'Menunggu semua Promise **sampai pasti nasibnya**, berhasil maupun gagal, lalu mengembalikan array berisi objek `{ status, value }` atau `{ status, reason }`. Ia **tidak pernah menolak**. Cocok saat kamu ingin menampilkan bagian yang berhasil sambil menandai bagian yang gagal.',
        },
        {
          term: 'Promise.race',
          meaning:
            'Artinya **balapan**. Mengembalikan hasil dari Promise yang **paling cepat selesai**, entah berhasil atau gagal. Pemakaian paling umum: memasangkannya dengan sebuah timer untuk membuat batas waktu.',
        },
        {
          term: 'Promise.any',
          meaning:
            'Mengembalikan hasil dari Promise pertama yang **berhasil**, sambil mengabaikan yang gagal. Baru menolak kalau **semuanya** gagal, dengan `AggregateError`. Bedanya dengan `race` justru di situ: `race` peduli siapa tercepat, `any` peduli siapa yang berhasil duluan.',
        },
        {
          term: 'fail-fast',
          meaning:
            'Terjemahannya **gagal cepat**. Perilaku berhenti dan melaporkan kegagalan pada kesalahan pertama, tanpa menunggu sisanya. `Promise.all` bersifat begini. Perlu dicatat: Promise lain yang sudah telanjur berjalan **tidak ikut dibatalkan** — mereka tetap jalan sampai selesai, hasilnya saja yang diabaikan.',
        },
        {
          term: 'AggregateError',
          meaning:
            'Jenis error khusus yang **membungkus banyak error sekaligus** di dalam property `errors`. Dipakai `Promise.any` ketika semua kandidat gagal, sehingga kamu tetap bisa memeriksa alasan kegagalan masing-masing.',
        },
        {
          term: 'waterfall',
          meaning:
            'Terjemahannya **air terjun**. Sebutan untuk rangkaian permintaan yang saling menunggu sehingga membentuk tangga menurun di panel Network DevTools. Ini gambaran visual dari masalah yang dipecahkan sub-bab ini — dan panel Network adalah tempat pertama untuk memeriksanya.',
        },
      ),

      h2('Masalahnya'),
      code(
        'js',
        `
        // BERURUTAN — total ± 900 ms
        const pengguna = await ambilPengguna();    // 300 ms
        const produk   = await ambilProduk();      // 300 ms
        const berita   = await ambilBerita();      // 300 ms

        // Ketiganya TIDAK saling bergantung. Tidak ada alasan menunggu berurutan.
        `,
      ),
      code(
        'js',
        `
        // PARALEL — total ± 300 ms
        const [pengguna, produk, berita] = await Promise.all([
          ambilPengguna(),
          ambilProduk(),
          ambilBerita(),
        ]);
        `,
      ),
      callout(
        'tip',
        'Cara mengenalinya saat membaca kode',
        'Lihat dua `await` berurutan. Tanyakan: **apakah yang kedua memakai hasil yang pertama?** Kalau tidak, itu kesempatan paralel yang terlewat.',
      ),

      h2('`Promise.all` — semua harus berhasil'),
      code(
        'js',
        `
        const hasil = await Promise.all([a(), b(), c()]);
        // Hasil dalam URUTAN YANG SAMA dengan masukan — bukan urutan selesai.

        // Satu gagal -> seluruhnya menolak, dengan error yang pertama gagal.
        // Yang lain TETAP BERJALAN (tidak dibatalkan), hasilnya saja diabaikan.
        `,
      ),

      h2('`Promise.allSettled` — sebagian boleh gagal'),
      code(
        'js',
        `
        const hasil = await Promise.allSettled([a(), b(), c()]);
        // [
        //   { status: 'fulfilled', value: ... },
        //   { status: 'rejected',  reason: Error },
        //   { status: 'fulfilled', value: ... },
        // ]

        const berhasil = hasil
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value);

        const gagal = hasil.filter((r) => r.status === 'rejected');
        `,
      ),
      p(
        'Pakai ini untuk beberapa widget dashboard yang berdiri sendiri: satu yang gagal tidak boleh mengosongkan seluruh halaman.',
      ),

      h2('`race` dan `any`'),
      code(
        'js',
        `
        // race: yang PERTAMA selesai menang — berhasil maupun gagal
        await Promise.race([
          ambilData(),
          tunggu(5000).then(() => { throw new Error('Timeout'); }),
        ]);

        // any: yang pertama BERHASIL menang; gagal semua -> AggregateError
        try {
          await Promise.any([serverA(), serverB(), serverC()]);
        } catch (e) {
          e.constructor.name;   // 'AggregateError'
          e.errors;             // array berisi semua kegagalan
        }
        `,
      ),

      h2('Ringkasan memilih'),
      table(
        ['Kebutuhan', 'Pakai'],
        [
          ['Semua hasil dibutuhkan, satu gagal = tidak berguna', '`Promise.all`'],
          ['Sebagian boleh gagal, ingin tahu mana yang gagal', '`Promise.allSettled`'],
          ['Yang tercepat menang, apa pun hasilnya (timeout)', '`Promise.race`'],
          ['Yang pertama berhasil menang (server cadangan)', '`Promise.any`'],
          ['Yang kedua butuh hasil yang pertama', '`await` berurutan — memang benar'],
        ],
      ),

      h2('Jebakan: `map` dengan fungsi async'),
      code(
        'js',
        `
        // SALAH: forEach tidak menunggu apa pun
        daftar.forEach(async (id) => { await proses(id); });
        console.log('selesai');   // tercetak DULUAN, tidak ada yang selesai

        // BENAR — paralel
        await Promise.all(daftar.map((id) => proses(id)));

        // BENAR — berurutan, kalau memang harus satu per satu
        for (const id of daftar) {
          await proses(id);
        }
        `,
      ),
      callout(
        'warning',
        'Paralel tidak selalu benar',
        'Seribu permintaan sekaligus akan ditolak server atau kena rate limit. Untuk daftar besar, batasi jumlah yang berjalan bersamaan — proses per kelompok, atau pakai pustaka pembatas konkurensi.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Dua `await` berurutan yang tidak saling bergantung = kesempatan paralel yang terlewat.',
        '`Promise.all` mengembalikan hasil dalam urutan masukan, dan gagal total kalau satu gagal.',
        '`allSettled` saat sebagian boleh gagal; `race` untuk timeout; `any` untuk cadangan.',
        '`forEach` dengan `async` tidak menunggu apa pun — pakai `Promise.all(map(...))` atau `for...of`.',
        'Paralel tanpa batas bisa membanjiri server — batasi untuk daftar besar.',
      ),
      references(
        {
          label: 'Promise.all()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa Promise lain tetap berjalan meski salah satu sudah gagal.',
        },
        {
          label: 'Promise.allSettled()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled',
          source: 'MDN',
          note: 'Bentuk hasil `{ status, value }` dan `{ status, reason }` yang dipakai saat sebagian boleh gagal.',
        },
        {
          label: 'Promise.any()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any',
          source: 'MDN',
          note: 'Beserta `AggregateError` yang muncul ketika seluruh kandidat gagal.',
        },
        {
          label: 'Promise.race()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race',
          source: 'MDN',
          note: 'Pola baku memasangkannya dengan timer untuk membuat batas waktu.',
        },
        {
          label: 'Array.prototype.forEach()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach',
          source: 'MDN',
          note: 'Bagian yang menegaskan `forEach` tidak menunggu callback async — dasar jebakan di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'abort-timeout',
    'Membatalkan Pekerjaan: `AbortController` & timeout',
    12,
    'Menghentikan permintaan yang sudah tidak relevan — dan kenapa permintaan tanpa timeout akhirnya menggantung aplikasi.',
    [
      p(
        'Promise tidak bisa dibatalkan. Yang bisa dibatalkan adalah **operasi di baliknya** — dan `AbortController` adalah cara standar untuk itu.',
      ),

      terms(
        {
          term: 'AbortController',
          meaning:
            'Terjemahan bebasnya **pengendali pembatalan**. Objek bawaan browser dan Node.js yang menyediakan cara **standar** untuk membatalkan operasi yang sedang berjalan. Ia bekerja berpasangan: kamu memegang controller-nya, dan operasi yang ingin dibatalkan memegang `signal`-nya.',
        },
        {
          term: 'signal',
          meaning:
            'Artinya **isyarat**. Objek `controller.signal` yang kamu serahkan ke operasi seperti `fetch`. Ia berperan sebagai penerima kabar: ketika `abort()` dipanggil pada controller, signal-lah yang memberi tahu operasi itu untuk berhenti.',
        },
        {
          term: 'abort',
          meaning:
            'Artinya **membatalkan** atau menggugurkan. Method `controller.abort()` yang menghentikan semua operasi yang memegang signal dari controller itu. Perlu dipahami, satu controller bisa membatalkan **beberapa operasi sekaligus** kalau semuanya memakai signal yang sama.',
        },
        {
          term: 'AbortError',
          meaning:
            'Error yang dilempar operasi ketika ia dibatalkan. Yang wajib diingat: **ini bukan kegagalan** — ini akibat dari perintahmu sendiri. Karena itu jangan pernah menampilkannya sebagai pesan error ke pengguna; periksa `e.name === "AbortError"` lebih dulu lalu keluar diam-diam.',
        },
        {
          term: 'timeout',
          meaning:
            'Artinya **batas waktu**. Aturan bahwa sebuah operasi dianggap gagal kalau belum selesai dalam jangka waktu tertentu. Permintaan jaringan **tanpa** timeout bisa menggantung sangat lama — dan kalau itu terjadi berulang, koneksi yang menumpuk pelan-pelan membuat aplikasi tidak responsif.',
        },
        {
          term: 'AbortSignal.timeout',
          meaning:
            'Cara ringkas membuat signal yang **membatalkan dirinya sendiri** setelah sekian milidetik: `AbortSignal.timeout(5000)`. Menggantikan pola lama yang memerlukan `setTimeout` plus controller manual.',
        },
        {
          term: 'race condition',
          meaning:
            'Terjemahannya **kondisi balapan**. Keadaan ketika dua operasi selesai dalam urutan yang tidak bisa kamu pastikan, sehingga hasilnya kadang benar dan kadang salah. Contoh paling nyata di web: pengguna mengetik cepat di kotak pencarian, lalu respons untuk kata yang lama datang **setelah** respons kata yang baru — dan menimpanya di layar.',
        },
        {
          term: 'cleanup',
          meaning:
            'Artinya **pembersihan**. Pekerjaan yang harus dilakukan ketika sesuatu berakhir — membatalkan permintaan, melepas pendengar event, menghentikan timer. Di React ini adalah fungsi yang dikembalikan dari `useEffect`, dan membatalkan `fetch` di sana mencegah pembaruan pada komponen yang sudah tidak ada.',
        },
      ),

      h2('Dasar'),
      code(
        'js',
        `
        const controller = new AbortController();

        fetch('/api/data', { signal: controller.signal })
          .then((r) => r.json())
          .catch((e) => {
            if (e.name === 'AbortError') return;   // dibatalkan, bukan kegagalan
            tampilkanError(e);
          });

        controller.abort();   // membatalkan
        `,
      ),
      callout(
        'info',
        '`AbortError` bukan kegagalan',
        'Pembatalan yang kamu lakukan sendiri tidak boleh muncul sebagai pesan error ke pengguna. Selalu periksa `e.name === "AbortError"` lebih dulu dan keluar diam-diam.',
      ),

      h2('Timeout'),
      code(
        'js',
        `
        // Cara ringkas — didukung browser modern dan Node 18+
        await fetch('/api/data', { signal: AbortSignal.timeout(5000) });

        // Menggabungkan beberapa sinyal
        const gabungan = AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(5000),
        ]);
        `,
      ),
      callout(
        'danger',
        'Permintaan tanpa timeout akhirnya menggantung aplikasi',
        '`fetch` **tidak punya timeout bawaan**. Kalau server tidak pernah menjawab, promise-mu menunggu selamanya, indikator memuat berputar tanpa akhir, dan koneksinya tidak pernah dilepas. Setiap permintaan keluar harus punya batas waktu.',
      ),

      h2('Kasus nyata: pencarian yang diketik cepat'),
      code(
        'js',
        `
        let kontrolAktif = null;

        async function cari(kata) {
          kontrolAktif?.abort();                 // batalkan pencarian sebelumnya
          kontrolAktif = new AbortController();

          try {
            const res = await fetch(\`/api/cari?q=\${encodeURIComponent(kata)}\`, {
              signal: kontrolAktif.signal,
            });
            tampilkan(await res.json());
          } catch (e) {
            if (e.name === 'AbortError') return;
            tampilkanError(e);
          }
        }
        `,
      ),
      p(
        'Tanpa pembatalan, mengetik "javascript" mengirim sepuluh permintaan, dan yang **terakhir tiba** menang — bukan yang terakhir diketik. Hasil untuk "java" bisa menimpa hasil untuk "javascript". Ini **race condition**, dan pembatalan adalah obatnya.',
      ),

      h2('Membatalkan saat komponen dilepas'),
      code(
        'jsx',
        `
        useEffect(() => {
          const controller = new AbortController();

          fetch('/api/data', { signal: controller.signal })
            .then((r) => r.json())
            .then(setData)
            .catch((e) => { if (e.name !== 'AbortError') setError(e); });

          return () => controller.abort();   // pembersihan
        }, []);
        `,
        { caption: 'Tanpa ini, `setData` dipanggil pada komponen yang sudah tidak ada.' },
      ),

      h2('Membatalkan pekerjaanmu sendiri'),
      code(
        'js',
        `
        async function prosesBanyak(daftar, signal) {
          for (const item of daftar) {
            signal.throwIfAborted();   // berhenti di titik yang aman
            await proses(item);
          }
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Promise tidak bisa dibatalkan; operasi di baliknya bisa.',
        '`AbortError` adalah pembatalan yang disengaja — jangan tampilkan sebagai error.',
        '`fetch` tidak punya timeout bawaan; `AbortSignal.timeout()` menutup celah itu.',
        'Membatalkan permintaan lama menghapus race condition pada pencarian.',
        'Bersihkan permintaan saat komponen dilepas.',
      ),
      references(
        {
          label: 'AbortController',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
          source: 'MDN',
          note: 'Cara standar membatalkan operasi, termasuk memakai satu controller untuk beberapa permintaan.',
        },
        {
          label: 'AbortSignal: timeout() static method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static',
          source: 'MDN',
          note: 'Pengganti ringkas untuk pola `setTimeout` + controller manual.',
        },
        {
          label: 'AbortSignal: throwIfAborted() method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/throwIfAborted',
          source: 'MDN',
          note: 'Cara menyisipkan titik henti yang aman di dalam pekerjaan panjang milikmu sendiri.',
        },
        {
          label: 'Using Fetch',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
          source: 'MDN',
          note: 'Bagian "Aborting a fetch" beserta penegasan bahwa `fetch` tidak punya timeout bawaan.',
        },
        {
          label: 'Synchronizing with Effects',
          href: 'https://react.dev/learn/synchronizing-with-effects',
          source: 'React',
          note: 'Bagian "Fetching data" memakai persis pola pembersihan `controller.abort()` di atas.',
        },
      ),
    ],
  ),

  written(
    'retry-backoff',
    'Pola Retry dengan Exponential Backoff',
    11,
    'Mencoba lagi tanpa memperparah keadaan.',
    [
      p(
        'Sebagian kegagalan bersifat sementara. Mengulanginya masuk akal — tapi mengulang **dengan cara yang salah** justru menjatuhkan server yang sedang kepayahan.',
      ),

      terms(
        {
          term: 'retry',
          meaning:
            'Artinya **mencoba lagi**. Mengulangi operasi yang gagal dengan harapan kali ini berhasil. Syarat mutlaknya: kegagalan itu harus **bersifat sementara**. Mengulang permintaan yang gagal karena input salah hanya menghasilkan kegagalan yang sama persis, berkali-kali.',
        },
        {
          term: 'backoff',
          meaning:
            'Artinya **mundur** atau memberi jarak. Menambah jeda tunggu sebelum percobaan berikutnya, alih-alih langsung mencoba lagi. Tujuannya memberi kesempatan kepada pihak yang sedang bermasalah untuk pulih.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Terjemahannya **mundur secara eksponensial**. Jeda tunggu **berlipat ganda** setiap kali gagal: 1 detik, 2 detik, 4 detik, 8 detik. Disebut eksponensial karena jedanya mengikuti pangkat dua. Pola ini yang dipakai hampir semua penyedia layanan besar, dan alasannya ada di bawah.',
        },
        {
          term: 'retry storm',
          meaning:
            'Terjemahannya **badai pengulangan**. Keadaan ketika ribuan klien sama-sama mengulang permintaan pada saat yang hampir bersamaan, sehingga server yang sedang berusaha pulih justru dibanjiri lebih parah. Inilah cara sebuah gangguan kecil berubah menjadi mati total — dan backoff adalah pencegahnya.',
        },
        {
          term: 'jitter',
          meaning:
            'Artinya **getaran** atau ketidakteraturan kecil. Angka acak yang ditambahkan ke jeda tunggu supaya klien-klien **tidak mengulang serempak**. Tanpa jitter, seribu klien yang gagal pada detik yang sama akan mencoba lagi pada detik yang sama pula — backoff-nya tetap menghasilkan gelombang.',
        },
        {
          term: 'idempoten',
          meaning:
            'Dibaca "i-dem-po-ten". Sifat operasi yang **memberi hasil sama meski dijalankan berkali-kali**. Membaca data bersifat idempoten; menambah pesanan tidak. Ini syarat penting sebelum mengulang: mengulang operasi yang tidak idempoten bisa menghasilkan dua pesanan untuk satu pembelian.',
        },
        {
          term: 'Retry-After',
          meaning:
            'Header HTTP yang dikirim server untuk berkata **"coba lagi setelah sekian detik"**. Isinya bisa berupa jumlah detik atau tanggal. Menghormatinya lebih baik daripada memakai perhitungan backoff sendiri — server tahu kondisinya, kamu tidak.',
        },
        {
          term: '429',
          meaning:
            'Kode status HTTP *Too Many Requests*, artinya **terlalu banyak permintaan**. Server memberi tahu bahwa kamu melebihi batas yang diizinkan. Layak diulang, tapi **hanya** setelah menunggu — dan biasanya server menyertakan `Retry-After` untuk memberitahu berapa lama.',
        },
        {
          term: '503',
          meaning:
            'Kode status HTTP *Service Unavailable*, artinya **layanan sedang tidak tersedia**. Umumnya sementara — server sedang kelebihan beban atau dalam pemeliharaan. Ini termasuk kegagalan yang paling layak diulang.',
        },
      ),

      h2('Mana yang layak diulang'),
      table(
        ['Kegagalan', 'Diulang?', 'Alasan'],
        [
          ['Jaringan putus', 'Ya', 'Kemungkinan besar sementara'],
          ['`408`, `429`, `503`, `504`', 'Ya', 'Server minta dicoba lagi nanti'],
          ['`500`', 'Hati-hati', 'Bisa sementara, bisa bug yang selalu terjadi'],
          ['`400`, `422` (input salah)', '**Tidak**', 'Akan gagal lagi dengan cara sama'],
          ['`401`, `403`', '**Tidak**', 'Perlu tindakan, bukan pengulangan'],
          ['`404`', '**Tidak**', 'Memang tidak ada'],
        ],
      ),

      h2('Kenapa harus backoff'),
      code(
        'js',
        `
        // SALAH: seribu klien mengulang tiap 100 ms saat server kepayahan.
        // Server yang sedang berusaha pulih justru dibanjiri. Ini
        // "retry storm" — pola yang mengubah gangguan kecil jadi mati total.

        // BENAR: jeda berlipat, ditambah keacakan supaya klien tidak serempak
        // 1s, 2s, 4s, 8s ... masing-masing dengan jitter acak
        `,
      ),

      h2('Implementasi'),
      code(
        'js',
        `
        const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

        async function denganRetry(fn, { maksimal = 3, dasarMs = 1000 } = {}) {
          let terakhir;

          for (let percobaan = 0; percobaan <= maksimal; percobaan++) {
            try {
              return await fn();
            } catch (error) {
              terakhir = error;

              // Jangan ulangi yang tidak akan pernah berhasil
              if (!layakDiulang(error)) throw error;
              if (percobaan === maksimal) break;

              // Backoff eksponensial + jitter penuh
              const jeda = Math.random() * dasarMs * 2 ** percobaan;
              await tunggu(jeda);
            }
          }

          throw new Error(\`Gagal setelah \${maksimal + 1} percobaan\`, { cause: terakhir });
        }

        function layakDiulang(error) {
          if (error.name === 'AbortError') return false;
          const status = error.status;
          if (status === undefined) return true;               // kegagalan jaringan
          return status === 408 || status === 429 || status >= 500;
        }
        `,
      ),
      callout(
        'tip',
        '`cause` menjaga jejak penyebab aslinya',
        'Opsi kedua `new Error(pesan, { cause })` menyimpan error asli. Tanpa itu, kamu hanya tahu "gagal setelah 4 percobaan" tanpa tahu **kenapa**.',
      ),

      h2('Hormati `Retry-After`'),
      code(
        'js',
        `
        // Kalau server memberi tahu kapan harus kembali, ikuti — jangan menebak
        const retryAfter = respons.headers.get('Retry-After');
        if (retryAfter) {
          await tunggu(Number(retryAfter) * 1000);
        }
        `,
      ),
      callout(
        'warning',
        'Jangan ulangi operasi yang tidak idempoten tanpa pengaman',
        'Mengulang `POST /pembayaran` bisa memotong saldo dua kali — permintaan pertama mungkin **berhasil** dan hanya responsnya yang hilang. Untuk operasi seperti itu, kirim `Idempotency-Key` supaya server bisa mengenali pengulangan.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Hanya ulangi kegagalan yang benar-benar bisa berbeda hasilnya.',
        'Backoff eksponensial + jitter mencegah retry storm.',
        'Selalu ada batas percobaan dan keadaan akhir yang jelas.',
        'Simpan penyebab asli dengan `{ cause }`.',
        'Operasi tidak idempoten butuh idempotency key sebelum boleh diulang.',
      ),
      references(
        {
          label: 'Retry-After',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After',
          source: 'MDN',
          note: 'Header yang memberitahu berapa lama harus menunggu — hormati ini di atas backoff sendiri.',
        },
        {
          label: '429 Too Many Requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
          source: 'MDN',
          note: 'Status yang layak diulang, tapi hanya setelah menunggu sesuai petunjuk server.',
        },
        {
          label: '503 Service Unavailable',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503',
          source: 'MDN',
          note: 'Kegagalan sementara yang paling layak diulang di antara semua status 5xx.',
        },
        {
          label: 'Error: cause',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause',
          source: 'MDN',
          note: 'Cara menyimpan penyebab asli agar tidak hilang saat error dibungkus ulang.',
        },
        {
          label: 'Idempotency-Key Header Field',
          href: 'https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header',
          source: 'IETF',
          note: 'Rancangan standar untuk membuat operasi yang tidak idempoten aman diulang.',
        },
      ),
    ],
  ),

  written(
    'async-iterator',
    'Async Iterator & `for await...of`',
    10,
    'Mengolah data yang datang bertahap, tanpa menunggu semuanya lengkap.',
    [
      p(
        'Kadang data tidak datang sekaligus: respons streaming, halaman demi halaman, atau peristiwa yang mengalir. Async iterator adalah cara standar mengonsumsinya.',
      ),

      terms(
        {
          term: 'iterator',
          meaning:
            'Dibaca "i-te-rei-tor", artinya **penelusur**. Objek yang tahu cara mengeluarkan isi sebuah kumpulan **satu per satu**, lewat method `next()`. Inilah mesin yang sebenarnya bekerja di balik `for...of` yang sudah kamu pakai sejak Bab 1.',
        },
        {
          term: 'async iterator',
          meaning:
            'Versi iterator yang setiap pengambilannya **mengembalikan Promise**. Cocok untuk data yang datang bertahap dari jaringan, karena kamu bisa mengolah bagian yang sudah tiba tanpa menunggu keseluruhannya lengkap.',
        },
        {
          term: 'generator',
          meaning:
            'Fungsi yang ditandai `function*` dan bisa **berhenti di tengah lalu dilanjutkan lagi**. Berbeda dari fungsi biasa yang sekali jalan langsung tuntas. Kemampuan berhenti-dan-lanjut inilah yang membuatnya cara paling ringkas menulis iterator sendiri.',
        },
        {
          term: 'function*',
          meaning:
            'Tanda bintang setelah kata `function` yang menjadikannya generator. Untuk versi asinkron, tulis `async function*` — gabungan keduanya. Bintang ini mudah terlewat saat membaca, jadi biasakan mencarinya.',
        },
        {
          term: 'yield',
          meaning:
            'Artinya **menghasilkan** atau menyerahkan. Kata kunci di dalam generator yang mengeluarkan satu nilai ke pemanggil, lalu **membekukan fungsinya di titik itu** sampai nilai berikutnya diminta. Bedakan dari `return` yang mengakhiri fungsi untuk selamanya.',
        },
        {
          term: 'yield*',
          meaning:
            'Dibaca "yield star". Menyerahkan **seluruh isi** sebuah kumpulan satu per satu, alih-alih menyerahkan kumpulannya sebagai satu nilai utuh. `yield* data` pada contoh paginasi mengeluarkan tiap item di dalam `data`, bukan array `data` itu sendiri.',
        },
        {
          term: 'for await...of',
          meaning:
            'Bentuk perulangan yang **menunggu setiap nilai** sebelum menjalankan badan loop-nya. Ia bekerja pada async iterator maupun pada array berisi Promise. Perhatikan bedanya dengan `Promise.all`: yang ini **berurutan dan hemat memori**, sementara `Promise.all` paralel tapi menahan seluruh hasil sekaligus.',
        },
        {
          term: 'streaming',
          meaning:
            'Artinya **mengalir**. Cara menerima data sedikit demi sedikit begitu ia tersedia, bukan menunggu seluruhnya lengkap dulu. Bermanfaat untuk berkas besar atau jawaban yang panjang: pengguna melihat bagian pertama jauh lebih cepat.',
        },
        {
          term: 'paginasi',
          meaning:
            'Dari *pagination*, artinya **pembagian ke dalam halaman**. Teknik server mengirim data besar sepotong demi sepotong. Keindahan async generator di sini: pemanggil cukup menulis `for await (const p of semuaPengguna())` dan **tidak perlu tahu sama sekali** bahwa ada halaman di baliknya.',
        },
      ),

      h2('`for await...of`'),
      code(
        'js',
        `
        async function* angkaBertahap() {
          yield 1;
          yield 2;
          yield 3;
        }

        for await (const n of angkaBertahap()) {
          console.log(n);   // 1, 2, 3 — satu per satu, saat masing-masing siap
        }
        `,
      ),

      h2('Kasus nyata: paginasi'),
      code(
        'js',
        `
        async function* semuaPengguna() {
          let halaman = 1;

          while (true) {
            const res = await fetch(\`/api/pengguna?page=\${halaman}\`);
            const { data, adaLagi } = await res.json();

            yield* data;              // hasilkan tiap item satu per satu
            if (!adaLagi) return;
            halaman++;
          }
        }

        // Pemanggil tidak perlu tahu soal halaman sama sekali
        for await (const pengguna of semuaPengguna()) {
          console.log(pengguna.nama);
          if (pengguna.nama === 'Zum') break;   // berhenti kapan saja — sisa halaman tidak diambil
        }
        `,
      ),
      callout(
        'tip',
        'Keunggulannya: memori dan pembatalan',
        'Kamu tidak pernah menahan seluruh data di memori, dan `break` benar-benar menghentikan pengambilan berikutnya. Membandingkannya dengan "ambil semua halaman ke dalam satu array" — perbedaannya besar untuk data yang banyak.',
      ),

      h2('Membaca respons streaming'),
      code(
        'js',
        `
        const res = await fetch('/api/stream');

        for await (const potongan of res.body) {
          const teks = new TextDecoder().decode(potongan);
          tampilkanBertahap(teks);       // muncul sedikit demi sedikit
        }
        `,
        { caption: 'Pola yang dipakai antarmuka yang menampilkan jawaban sambil diketik.' },
      ),

      h2('Bedakan dari `Promise.all`'),
      table(
        ['', '`for await...of`', '`Promise.all`'],
        [
          ['Urutan', 'Satu per satu, berurutan', 'Semua bersamaan'],
          ['Memori', 'Hanya satu item', 'Semua hasil sekaligus'],
          ['Bisa berhenti di tengah', 'Ya (`break`)', 'Tidak'],
          ['Cocok untuk', 'Aliran, paginasi, streaming', 'Beberapa permintaan independen'],
        ],
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`async function*` menghasilkan nilai bertahap; `for await...of` mengonsumsinya.',
        'Paginasi jadi detail internal — pemanggil cukup melihat satu aliran item.',
        '`break` benar-benar menghentikan pengambilan berikutnya.',
        'Pakai untuk aliran; pakai `Promise.all` untuk beberapa permintaan sekaligus.',
      ),
      references(
        {
          label: 'for await...of',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of',
          source: 'MDN',
          note: 'Termasuk perilaku `break` yang benar-benar menghentikan pengambilan berikutnya.',
        },
        {
          label: 'async function*',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function*',
          source: 'MDN',
          note: 'Sintaks async generator yang dipakai pada contoh paginasi.',
        },
        {
          label: 'yield*',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*',
          source: 'MDN',
          note: 'Bedanya dengan `yield` biasa: menyerahkan isi kumpulan satu per satu, bukan kumpulannya.',
        },
        {
          label: 'Iteration protocols',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
          source: 'MDN',
          note: 'Bagian "The async iterator and async iterable protocols" — dasar formal sub-bab ini.',
        },
        {
          label: 'Streaming requests with fetch',
          href: 'https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests',
          source: 'Chrome',
          note: 'Penerapan nyata aliran bertahap pada respons jaringan.',
        },
      ),
    ],
  ),

  written(
    'jebakan-async',
    'Jebakan Umum di Kode Asinkron',
    12,
    'Kesalahan yang lolos review tapi muncul di produksi.',
    [
      p(
        'Enam pola berikut jarang menyebabkan error saat pengembangan. Mereka muncul saat jaringan lambat, data banyak, atau pengguna mengklik lebih cepat dari dugaan.',
      ),

      terms(
        {
          term: 'floating promise',
          meaning:
            'Terjemahan bebasnya **Promise yang mengambang**. Fungsi async yang dipanggil **tanpa `await` dan tanpa `.catch()`**, sehingga tidak ada satu pun yang memperhatikan nasibnya. Kalau ia gagal, hasilnya adalah unhandled rejection yang tidak pernah kamu lihat sampai muncul di produksi. Ada tiga cara benar menanganinya, dan semuanya ada di contoh bawah.',
        },
        {
          term: 'void',
          meaning:
            'Operator yang membuang nilai sebuah ekspresi dan menghasilkan `undefined`. Di depan pemanggilan async, `void simpanData(...)` berfungsi sebagai **pernyataan niat**: "saya memang sengaja tidak menunggu ini". Nilainya bukan teknis melainkan komunikasi — pembaca berikutnya tahu ini bukan kelalaian.',
        },
        {
          term: 'race condition',
          meaning:
            'Terjemahannya **kondisi balapan**. Dua operasi selesai dalam urutan yang tidak bisa dipastikan, sehingga hasilnya kadang benar dan kadang salah. Sangat berbahaya justru karena **di komputer pengembang hampir tidak pernah muncul** — jaringan lokal terlalu cepat dan terlalu konsisten untuk memicunya.',
        },
        {
          term: 'stale response',
          meaning:
            'Terjemahannya **respons basi**. Jawaban dari permintaan lama yang tiba **setelah** jawaban permintaan baru, lalu menimpanya di layar. Pengguna melihat hasil untuk kata kunci yang sudah tidak ia ketik lagi. Obatnya sudah dibahas di Sub-bab 3.8: batalkan yang lama.',
        },
        {
          term: 'memory leak',
          meaning:
            'Terjemahannya **kebocoran memori**. Memori yang seharusnya sudah bisa dilepas tapi tetap tertahan karena masih ada yang menunjuknya. Di kode asinkron ini sering terjadi lewat timer yang tidak pernah dihentikan atau pendengar event yang tidak pernah dilepas.',
        },
        {
          term: 'error swallowing',
          meaning:
            'Terjemahannya **menelan error**. Menangkap sebuah kegagalan lalu tidak melakukan apa pun terhadapnya. Sama seperti `catch` kosong di Sub-bab 1.14, ia mengubah kegagalan yang berisik menjadi kerusakan data yang senyap — jenis bug yang paling mahal karena baru ketahuan jauh belakangan.',
        },
        {
          term: 'ids',
          meaning:
            'Bentuk jamak dari `id`, nama variabel yang lazim untuk array berisi banyak identitas. Contoh lain dari kebiasaan penamaan yang sudah kamu temui sejak Bab 1.',
        },
        {
          term: 'code review',
          meaning:
            'Terjemahannya **peninjauan kode** oleh orang lain sebelum digabungkan. Disebut di sini karena inti sub-bab ini justru itu: keenam pola berikut **lolos review** dengan mudah karena kodenya terlihat wajar, dan baru menampakkan diri saat jaringan lambat atau pengguna mengklik lebih cepat dari dugaan.',
        },
      ),

      h2('1. `await` di dalam loop yang seharusnya paralel'),
      code(
        'js',
        `
        // 10 permintaan @200 ms = 2 detik
        for (const id of ids) {
          hasil.push(await ambil(id));
        }

        // 10 permintaan bersamaan = ±200 ms
        const hasil = await Promise.all(ids.map(ambil));
        `,
      ),

      h2('2. Floating promise'),
      code(
        'js',
        `
        // SALAH: dipanggil tanpa await dan tanpa catch.
        // Kalau gagal -> unhandled rejection, dan kamu tidak pernah tahu.
        simpanData(data);

        // BENAR — salah satu dari tiga:
        await simpanData(data);                       // ditunggu
        simpanData(data).catch(laporkan);             // sengaja tidak ditunggu, tapi ditangani
        void simpanData(data).catch(() => {});        // sengaja diabaikan, dan terlihat jelas
        `,
      ),

      h2('3. `forEach` dengan `async`'),
      code(
        'js',
        `
        daftar.forEach(async (item) => { await proses(item); });
        console.log('selesai');   // BOHONG — tercetak sebelum apa pun selesai

        // forEach mengabaikan nilai kembalian callback, termasuk promise.
        await Promise.all(daftar.map(proses));   // benar
        `,
      ),

      h2('4. Race condition pada respons yang saling menimpa'),
      code(
        'js',
        `
        // Pengguna mengetik "ab" lalu "abc".
        // Permintaan "ab" bisa tiba SETELAH "abc" karena jaringan.
        async function cari(q) {
          const hasil = await fetch(\`/cari?q=\${q}\`).then((r) => r.json());
          tampilkan(hasil);       // hasil "ab" menimpa hasil "abc"
        }

        // Perbaikan A: batalkan yang lama (lihat sub-bab 3.8)
        // Perbaikan B: abaikan respons yang bukan yang terakhir diminta
        let terakhir = 0;
        async function cari2(q) {
          const nomor = ++terakhir;
          const hasil = await fetch(\`/cari?q=\${q}\`).then((r) => r.json());
          if (nomor !== terakhir) return;   // sudah usang, buang
          tampilkan(hasil);
        }
        `,
      ),

      h2('5. `try`/`catch` yang tidak menangkap apa-apa'),
      code(
        'js',
        `
        // Tidak menangkap: error dilempar di macrotask lain
        try {
          setTimeout(() => { throw new Error('lolos'); }, 0);
        } catch (e) { }

        // Tidak menangkap: promise tidak ditunggu
        try {
          ambilData();          // tanpa await
        } catch (e) { }

        // Menangkap dengan benar
        try {
          await ambilData();
        } catch (e) { }
        `,
      ),

      h2('6. Menganggap `await` membuat kode jadi sinkron'),
      code(
        'js',
        `
        let jumlah = 0;

        async function tambah() {
          const nilai = jumlah;      // baca
          await tunggu(10);          // fungsi lain BISA berjalan di sini
          jumlah = nilai + 1;        // tulis nilai yang mungkin sudah usang
        }

        await Promise.all([tambah(), tambah(), tambah()]);
        jumlah;   // 1, bukan 3
        `,
      ),
      callout(
        'warning',
        'Setiap `await` adalah titik di mana kode lain bisa menyela',
        'JavaScript memang single-threaded, tapi itu tidak berarti bebas dari race condition. Jangan pernah berasumsi keadaan yang kamu baca sebelum `await` masih sama sesudahnya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`await` dalam loop untuk operasi independen membuang waktu tanpa alasan.',
        'Setiap promise harus di-`await` atau di-`catch` — tidak ada opsi ketiga.',
        '`forEach` tidak menunggu apa pun.',
        'Respons yang datang tidak berurutan bisa menimpa hasil yang lebih baru.',
        '`try`/`catch` hanya menangkap yang benar-benar di-`await` di dalamnya.',
        'Setiap `await` adalah celah bagi kode lain untuk mengubah keadaan.',
      ),
      references(
        {
          label: 'Using promises',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises',
          source: 'MDN',
          note: 'Bagian "Common mistakes" mencakup beberapa jebakan yang dibahas di sub-bab ini.',
        },
        {
          label: 'try...catch',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch',
          source: 'MDN',
          note: 'Dasar jebakan nomor 5: `try` hanya menangkap yang benar-benar di-`await` di dalamnya.',
        },
        {
          label: 'void operator',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void',
          source: 'MDN',
          note: 'Dipakai sebagai pernyataan niat bahwa sebuah Promise memang sengaja tidak ditunggu.',
        },
        {
          label: 'no-floating-promises',
          href: 'https://typescript-eslint.io/rules/no-floating-promises/',
          source: 'typescript-eslint',
          note: 'Aturan lint yang menangkap jebakan nomor 2 secara otomatis sebelum sampai ke review.',
        },
        {
          label: 'You Might Not Need an Effect',
          href: 'https://react.dev/learn/you-might-not-need-an-effect',
          source: 'React',
          note: 'Konteks React untuk race condition pada respons yang saling menimpa.',
        },
      ),
    ],
  ),

  written(
    'praktik-fetch-paralel',
    'Praktik: Fetch berurutan vs paralel',
    13,
    'Mengukur sendiri selisihnya, bukan mempercayai teori.',
    [
      p(
        'Praktik ini singkat tapi menempel: kamu akan melihat angkanya sendiri, di mesinmu sendiri.',
      ),

      terms(
        {
          term: 'console.time',
          meaning:
            'Perintah untuk **mengukur berapa lama** sebuah bagian kode berjalan. Cara pakainya berpasangan: `console.time("label")` di awal, `console.timeEnd("label")` di akhir, dan hasilnya tercetak di console. Labelnya harus sama persis di kedua sisi. Ini alat paling sederhana yang mengubah "kayaknya lebih cepat" menjadi angka.',
        },
        {
          term: 'benchmark',
          meaning:
            'Dibaca "bench-mark", artinya **tolok ukur**. Pengukuran yang dilakukan untuk membandingkan dua cara secara adil. Prinsip yang dipegang sub-bab ini: **mengukur mengalahkan menebak** — dan angkanya harus dari mesinmu sendiri, bukan dari klaim di artikel orang lain.',
        },
        {
          term: 'httpbin.org',
          meaning:
            'Layanan uji coba gratis untuk permintaan HTTP. Alamat `/delay/1` sengaja menunda satu detik sebelum menjawab, sehingga cocok untuk melihat selisih berurutan dan paralel secara kasatmata. Kalau tidak ada internet, tiruannya dengan `setTimeout` sudah disediakan di bawah.',
        },
        {
          term: 'latensi',
          meaning:
            'Dari *latency*, artinya **waktu tunda** antara permintaan dikirim dan jawaban mulai diterima. Inilah yang sebenarnya kamu hemat dengan paralel: bukan mempercepat servernya, melainkan **menumpuk penantian** sehingga tidak dijalani satu per satu.',
        },
        {
          term: 'TimeoutError',
          meaning:
            'Nama error yang dilempar ketika `AbortSignal.timeout()` habis waktunya. Bedakan dari `AbortError` yang berarti kamu membatalkan secara sengaja — keduanya sama-sama datang dari mekanisme abort, tapi artinya berbeda bagi pengguna.',
        },
        {
          term: 'res.ok',
          meaning:
            'Property boolean pada respons `fetch` yang bernilai `true` hanya untuk status 200–299. Wajib diperiksa sendiri, karena `fetch` **tidak pernah menolak** untuk status 404 maupun 500 — bagi `fetch`, jawaban "tidak ditemukan" tetap dihitung sebagai permintaan yang berhasil sampai tujuan.',
        },
        {
          term: 'status',
          meaning:
            'Property pada tiap hasil `Promise.allSettled`, isinya `"fulfilled"` atau `"rejected"`. Dipakai untuk memisahkan yang berhasil dari yang gagal, seperti pada contoh penyaringan di langkah 4.',
        },
      ),

      h2('1. Siapkan sumber yang bisa ditunda'),
      code(
        'js',
        `
        // https://httpbin.org/delay/1 menunda 1 detik sebelum menjawab.
        // Kalau tidak ada internet, tiru saja:
        const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
        const ambilPalsu = async (nama, ms = 1000) => {
          await tunggu(ms);
          return { nama, ms };
        };
        `,
      ),

      h2('2. Ukur berurutan'),
      code(
        'js',
        `
        console.time('berurutan');

        const a = await ambilPalsu('a');
        const b = await ambilPalsu('b');
        const c = await ambilPalsu('c');

        console.timeEnd('berurutan');   // ± 3000 ms
        `,
      ),

      h2('3. Ukur paralel'),
      code(
        'js',
        `
        console.time('paralel');

        const [x, y, z] = await Promise.all([
          ambilPalsu('a'),
          ambilPalsu('b'),
          ambilPalsu('c'),
        ]);

        console.timeEnd('paralel');     // ± 1000 ms
        `,
      ),
      callout(
        'info',
        'Kenapa bukan 3× lebih cepat persis',
        'Ada biaya koneksi, dan browser membatasi jumlah permintaan bersamaan per host (biasanya 6 pada HTTP/1.1). Untuk tiga permintaan, selisihnya tetap mendekati 3×.',
      ),

      h2('4. Tangani satu yang gagal'),
      code(
        'js',
        `
        const hasil = await Promise.allSettled([
          ambilPalsu('a'),
          Promise.reject(new Error('b gagal')),
          ambilPalsu('c'),
        ]);

        const berhasil = hasil.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        const gagal    = hasil.filter((r) => r.status === 'rejected').map((r) => r.reason.message);

        console.log({ berhasil: berhasil.length, gagal });
        // { berhasil: 2, gagal: ['b gagal'] }
        `,
      ),

      h2('5. Tambahkan timeout'),
      code(
        'js',
        `
        async function ambilDenganTimeout(url, ms = 5000) {
          const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
          if (!res.ok) throw new Error(\`Server balas \${res.status}\`);
          return res.json();
        }

        try {
          await ambilDenganTimeout('/api/lambat', 1000);
        } catch (e) {
          console.log(e.name);   // 'TimeoutError'
        }
        `,
      ),

      h2('6. Yang harus kamu catat sendiri'),
      ol(
        'Berapa milidetik selisih berurutan dan paralel di mesinmu.',
        'Apa yang terjadi pada `Promise.all` kalau salah satunya gagal — apakah yang lain benar-benar berhenti?',
        'Berapa lama `AbortSignal.timeout` benar-benar menunggu sebelum melempar.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Mengukur mengalahkan menebak — `console.time` sudah cukup untuk ini.',
        '`Promise.all` mempercepat; `allSettled` membuat kegagalan sebagian tidak fatal.',
        'Setiap permintaan keluar butuh timeout.',
        'Yang gagal di `Promise.all` tidak membatalkan yang lain — mereka tetap berjalan.',
      ),
      references(
        {
          label: 'console: time() method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/console/time_static',
          source: 'MDN',
          note: 'Alat pengukur yang dipakai seluruh praktik ini, beserta pasangannya `timeEnd`.',
        },
        {
          label: 'AbortSignal: timeout() static method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa errornya bernama `TimeoutError`, bukan `AbortError`.',
        },
        {
          label: 'Response.ok',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Response/ok',
          source: 'MDN',
          note: 'Alasan status 404 dan 500 harus diperiksa sendiri di langkah 5.',
        },
        {
          label: 'Promise.allSettled()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled',
          source: 'MDN',
          note: 'Bentuk hasil `status`/`value`/`reason` yang disaring pada langkah 4.',
        },
        {
          label: 'Measure performance with the RAIL model',
          href: 'https://web.dev/articles/rail',
          source: 'web.dev',
          note: 'Angka acuan resmi untuk menilai apakah hasil pengukuranmu tergolong cepat.',
        },
      ),
    ],
  ),
];
