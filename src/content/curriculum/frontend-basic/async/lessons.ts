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
    24,
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
            'Dibaca "lib-yu-vi", singkatan dari *library for unicorn velociraptor* menurut candaan penulisnya, tapi fungsinya serius: library C yang menangani timer, akses berkas, dan jaringan di **Node.js**. Perannya persis sama dengan Web API di browser — mengerjakan hal-hal yang menunggu, di luar jalur utama JavaScript.',
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
        // bahkan re-render — semuanya menunggu. Halaman tampak "hang".
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
      p(
        'Perbedaannya murni penamaan dan bukan konsep. Di browser, kemampuan menunggu berupa timer, jaringan, dan event disediakan oleh Web API, sedangkan di Node.js pekerjaan yang sama dikerjakan oleh library bernama libuv yang sudah dijelaskan di kotak istilah. Call stack, task queue, dan event loop bekerja dengan aturan yang identik di keduanya, dan itulah sebabnya semua yang baru saja kamu pelajari tentang urutan eksekusi `setTimeout` di browser berlaku sama persis saat kode itu dijalankan lewat `node app.js`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Dashboard admin punya tombol Hitung Ulang Ringkasan. Saat ditekan, halaman membeku selama beberapa saat. Tombolnya tidak berubah warna saat ditekan, indikator memuat yang sudah kamu pasang tidak pernah muncul, dan pengguna menekan tombolnya dua tiga kali karena mengira kliknya tidak terbaca. Setelah selesai, semua klik itu diproses sekaligus.',
      ),
      p(
        'Yang menarik, tidak ada satu pun jaringan yang terlibat. Datanya sudah ada di memori. Yang membekukan halaman adalah perhitungannya sendiri, dan sub-bab ini menjelaskan kenapa satu perhitungan bisa menghentikan seluruh halaman.',
      ),
      code(
        'js',
        `
        // 2 juta baris transaksi yang sudah ada di memori.
        function hitungRingkasan(baris) {
          const peta = new Map();
          for (const b of baris) {
            peta.set(b.kategori, (peta.get(b.kategori) ?? 0) + b.nilai);
          }
          return peta;
        }

        tombol.addEventListener('click', () => {
          tampilkanSpinner();            // baris ini TIDAK akan terlihat
          const ringkasan = hitungRingkasan(baris);
          sembunyikanSpinner();
          gambar(ringkasan);
        });
        `,
        { filename: 'src/ringkasan.js — versi yang membekukan' },
      ),
      p(
        'Baris `tampilkanSpinner()` benar-benar dijalankan, dan ia benar-benar mengubah DOM. Yang tidak terjadi adalah **menggambarnya ke layar**. Peramban hanya bisa menggambar ulang di antara dua tugas, dan seluruh isi handler ini adalah satu tugas yang tak terputus. Spinner baru akan digambar setelah `sembunyikanSpinner()` juga selesai dijalankan, sehingga hasil akhirnya spinner yang muncul lalu hilang dalam nol detik, yaitu tidak terlihat sama sekali.',
      ),
      p(
        'Angkanya bisa diukur, dan hasil pengukuran di mesin pengembangan yang cepat menunjukkan agregasi dua juta baris memakan sekitar 162 milidetik. Angka itu terdengar kecil, dan justru di situ jebakannya. Baseline performa yang dipakai project ini menuntut Interaction to Next Paint di bawah 200 milidetik, jadi 162 milidetik sudah hampir memenuhi seluruh anggaran hanya untuk satu perhitungan. Di ponsel kelas menengah yang biasanya tiga sampai lima kali lebih lambat, angka yang sama menjadi lima ratus sampai delapan ratus milidetik, dan itu pembekuan yang jelas terasa.',
      ),
      code(
        'js',
        `
        // Potong pekerjaannya, dan serahkan kembali ke event loop tiap potongan.
        async function hitungRingkasanBertahap(baris, ukuran = 50_000) {
          const peta = new Map();

          for (let i = 0; i < baris.length; i += ukuran) {
            const akhir = Math.min(i + ukuran, baris.length);
            for (let j = i; j < akhir; j += 1) {
              const b = baris[j];
              peta.set(b.kategori, (peta.get(b.kategori) ?? 0) + b.nilai);
            }
            // Beri kesempatan peramban menggambar dan memproses klik.
            await new Promise((teruskan) => setTimeout(teruskan, 0));
          }

          return peta;
        }

        tombol.addEventListener('click', async () => {
          tombol.disabled = true;
          tampilkanSpinner();             // sekarang benar-benar terlihat
          try {
            gambar(await hitungRingkasanBertahap(baris));
          } finally {
            sembunyikanSpinner();
            tombol.disabled = false;
          }
        });
        `,
        { filename: 'src/ringkasan.js — versi yang tetap responsif' },
      ),
      p(
        'Baris `await new Promise((teruskan) => setTimeout(teruskan, 0))` adalah seluruh perbaikannya. Ia mengakhiri tugas yang sedang berjalan dan menjadwalkan sisanya sebagai tugas baru. Di sela itulah peramban sempat menggambar ulang dan memproses klik yang menumpuk. Total waktunya justru sedikit lebih lama karena ada biaya penjadwalan, dan itu pertukaran yang disengaja, yaitu selesai sedikit lebih lambat tapi halaman tetap hidup.',
      ),
      p(
        'Dua baris lain juga penting dan sering dilupakan. `tombol.disabled = true` mencegah klik ganda yang tadi terjadi, dan `finally` memastikan tombolnya kembali aktif bahkan kalau perhitungannya melempar error. Tanpa `finally`, satu kegagalan meninggalkan tombol mati selamanya dan pengguna harus memuat ulang halaman.',
      ),
      callout(
        'tip',
        'Untuk pekerjaan yang benar-benar berat, Web Worker lebih tepat',
        'Memotong pekerjaan menjaga halaman tetap responsif, tapi seluruh perhitungan tetap berebut satu utas dengan penggambaran. Kalau pekerjaannya lebih dari sekitar satu detik, pindahkan ke Web Worker yang berjalan di utas terpisah. Ongkosnya, data harus dikirim bolak-balik dan Worker tidak bisa menyentuh DOM sama sekali.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang berhubungan dengan event loop punya sifat khas, yaitu sebagian besarnya tidak menghasilkan pesan apa pun. Dua yang pertama di bawah adalah gejala tanpa error, dan dua sisanya barulah pesan sungguhan.',
      ),
      code(
        'text',
        `
        (Halaman berhenti merespons. Tab menjadi putih atau abu.)

        Chrome akhirnya menampilkan:
        "Halaman ini tidak merespons" — Tunggu / Keluar
        `,
        { caption: 'Tugas sinkron yang terlalu panjang, atau loop tak berujung.' },
      ),
      p(
        'Peramban menampilkan dialog itu setelah utas utama tidak menjawab selama beberapa detik. Dua penyebabnya berbeda jauh. Kalau ia akhirnya selesai sendiri, itu perhitungan berat yang perlu dipotong seperti di atas. Kalau ia tidak pernah selesai, itu loop tak berujung. Cara membedakannya, buka tab Performance di DevTools lalu rekam beberapa detik. Perhitungan berat muncul sebagai satu balok panjang dengan nama fungsimu, sedangkan loop tak berujung muncul sebagai balok yang tidak pernah berakhir.',
      ),
      code(
        'text',
        `
        console.log('mulai');
        setTimeout(() => console.log('timer 0ms'), 0);
        for (let i = 0; i < 2_000_000_000; i += 1) {}
        console.log('selesai');

        mulai
        selesai
        timer 0ms      <- muncul beberapa detik kemudian
        `,
        { caption: 'Angka nol pada `setTimeout` bukan janji waktu.' },
      ),
      p(
        'Ini bukan error, tapi ia sumber kesalahpahaman yang sangat sering. Angka pada `setTimeout` adalah **waktu tunggu minimum sebelum antre**, bukan waktu eksekusi. Callback baru dijalankan setelah seluruh kode sinkron selesai dan giliran antreannya tiba. Kalau kamu memakai `setTimeout(..., 0)` untuk menunda sesuatu lalu hasilnya tetap terlambat, penyebabnya hampir selalu ada kode sinkron panjang di depannya.',
      ),
      code(
        'text',
        `
        const salinan = new Array(1e9).fill(0);
                        ^

        RangeError: Array buffer allocation failed
        `,
        { caption: 'Memori habis sebelum perhitungannya sempat berjalan.' },
      ),
      p(
        'Pada data yang benar-benar besar, batas yang lebih dulu tercapai sering kali memori, bukan waktu. Menyalin array dua juta baris menjadi array baru pada tiap tahap pengolahan menggandakan pemakaian memori tiap kali. Kalau kamu bertemu error ini, periksa berapa salinan penuh yang dibuat sepanjang alur, dan pertimbangkan mengolahnya per potongan seperti pada bagian studi kasus.',
      ),
      code(
        'text',
        `
        [Violation] 'click' handler took 1840ms
        [Violation] 'setTimeout' handler took 612ms
        `,
        { caption: 'Peringatan Chrome untuk handler yang terlalu lama.' },
      ),
      p(
        'Pesan berawalan `[Violation]` adalah peringatan Chrome, bukan error, dan ia sangat berguna karena menyebut jenis handler beserta durasinya. Ia muncul otomatis saat sebuah handler melewati ambang tertentu. Kalau console-mu penuh pesan seperti ini, kamu punya daftar tepat bagian mana yang perlu dipotong, tanpa perlu menebak.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '"Halaman ini tidak merespons"',
            'Tugas sinkron sangat panjang, atau loop tak berujung',
            'Rekam di tab Performance untuk membedakannya, lalu potong atau perbaiki loopnya',
          ],
          [
            'Indikator memuat tidak pernah terlihat',
            'DOM diubah dan dikembalikan dalam satu tugas yang sama',
            'Serahkan giliran dengan `await` sebelum pekerjaan beratnya dimulai',
          ],
          [
            '`setTimeout(..., 0)` berjalan jauh lebih lambat dari nol',
            'Antreannya menunggu seluruh kode sinkron selesai',
            'Pendekkan tugas sinkron di depannya',
          ],
          [
            '`RangeError: Array buffer allocation failed`',
            'Terlalu banyak salinan penuh dari data besar',
            'Olah per potongan, dan hindari menyalin seluruh data tiap tahap',
          ],
          [
            '`[Violation] handler took ...ms`',
            'Satu handler melewati ambang waktu peramban',
            'Pakai daftar itu sebagai antrean kerja, potong yang paling lama dulu',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Event loop paling sering disalahpahami dalam satu hal, yaitu mengira asinkron berarti berjalan bersamaan. JavaScript di peramban punya satu utas untuk kodemu, dan asinkron hanya mengatur **giliran**, bukan menambah pekerja.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membungkus perhitungan berat dengan `setTimeout` supaya tidak membekukan',
            'Ia jadi asinkron, jadi seharusnya tidak menghalangi',
            'Perhitungannya tetap berjalan di utas yang sama, hanya bergeser gilirannya. Yang menolong adalah memotongnya menjadi banyak giliran, bukan menggeser satu giliran',
          ],
          [
            'Menambah `async` pada fungsi berat supaya tidak memblokir',
            'Kata `async` terdengar seperti berjalan di latar',
            '`async` hanya mengubah nilai kembaliannya menjadi janji. Isi fungsinya tetap berjalan sinkron sampai bertemu `await`',
          ],
          [
            'Mengira `setTimeout(fn, 100)` berjalan tepat 100 milidetik',
            'Angkanya jelas tertulis',
            'Itu waktu tunggu minimum sebelum masuk antrean. Kalau utas sedang sibuk, ia menunggu lebih lama',
          ],
          [
            'Memakai `setInterval` untuk pekerjaan yang lamanya tidak pasti',
            'Ia menjaga jarak waktu tetap',
            'Kalau satu putaran lebih lama daripada intervalnya, putaran menumpuk dan saling tindih. Pakai `setTimeout` yang dijadwalkan ulang setelah pekerjaannya selesai',
          ],
          [
            'Menganggap animasi CSS ikut membeku saat utas sibuk',
            'Semuanya kan berjalan di peramban yang sama',
            'Sebagian animasi CSS berjalan di utas komposisi dan tetap mulus. Itu sebabnya spinner CSS kadang tetap berputar padahal halaman tidak bisa diklik, dan itu justru menyesatkan pengguna',
          ],
          [
            'Menyimpulkan halaman lambat dari perasaan saat mengembangkan',
            'Di mesin sendiri semuanya terasa cepat',
            'Mesin pengembangan biasanya jauh lebih cepat daripada perangkat pengguna. Pakai pembatas CPU di tab Performance untuk melihat angka yang mendekati kenyataan',
          ],
        ],
      ),
      p(
        'Baris kelima layak diingat karena ia menyesatkan dua arah sekaligus. Spinner berbasis CSS yang tetap berputar saat halaman membeku membuat pengujian manualmu menyimpulkan halaman baik-baik saja, sedangkan pengguna justru bingung karena spinner berputar tapi tidak ada yang bisa diklik. Cara memeriksanya jujur adalah mencoba mengklik sesuatu, bukan melihat apakah ada yang bergerak.',
      ),
      callout(
        'warning',
        'Satu utas berarti satu bagian bisa merusak seluruh halaman',
        'Widget pihak ketiga, pustaka grafik, dan skrip analitik semuanya berbagi utas yang sama dengan kodemu. Satu di antaranya yang melakukan perhitungan panjang akan membekukan halamanmu, dan di console errornya menunjuk berkas mereka bukan berkasmu. Tab Performance adalah satu-satunya cara memastikan siapa yang memakai waktunya.',
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
    23,
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
            'Artinya **menggambar ke layar**. Browser hanya sempat menggambar ulang di antara dua macrotask, **tidak** di tengah penguras antrean microtask. Inilah sebabnya teks "Memuat…" kadang tidak pernah terlihat sama sekali — dan untuk indikator yang sangat singkat, itu justru menguntungkan karena tidak ada flicker.',
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
      p(
        'Hal yang paling membingungkan dari contoh ini adalah `setTimeout` ditulis **sebelum** kedua microtask dan jedanya `0`, tapi ia tetap dijalankan paling akhir. Angka `0` di sana tidak berarti "sekarang juga", melainkan "titipkan ke antrean, jadwalkan secepat mungkin". Sementara itu `Promise.resolve().then(...)` dan `queueMicrotask(...)` masuk ke antrean yang **berbeda dan lebih diprioritaskan**. Urutan lengkapnya jadi terbaca begini. Seluruh baris sinkron dijalankan sampai habis lebih dulu (A dan E, sekali lagi tanpa peduli urutan penulisan yang diselingi baris asinkron), lalu antrean microtask dikuras habis sesuai urutan masuk (C lalu D), dan baru setelah antrean itu benar-benar kosong satu macrotask diambil (B). `queueMicrotask` sengaja dipakai berdampingan dengan `Promise` untuk menunjukkan keduanya masuk ke antrean yang sama persis.',
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
      p(
        'Contoh ini menajamkan aturan sebelumnya. `timer` sudah menunggu di antrean macrotask sejak awal, sementara `microtask 2` bahkan **belum ada**, karena ia baru dibuat di dalam microtask pertama, jauh setelah timer mengantre. Meski begitu ia tetap didahulukan. Sebabnya, aturannya bukan "siapa mengantre lebih dulu" melainkan **"antrean microtask harus benar-benar kosong sebelum macrotask berikutnya diambil"**, dan pemeriksaan kosong itu dilakukan ulang setelah setiap microtask selesai, sehingga microtask yang lahir di tengah jalan pun ikut terangkut di putaran yang sama. Dari situ pula bahaya di kotak peringatan berikut berasal. Kalau setiap microtask selalu melahirkan microtask baru, antrean itu tidak pernah kosong, dan macrotask maupun penggambaran layar tidak pernah kebagian giliran.',
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
        // tidak ada flicker.
        `,
      ),
      p(
        "Inilah alasan seluruh sub-bab ini layak dipelajari, karena penggambaran layar adalah pekerjaan yang **mengantre di belakang microtask**, sama seperti macrotask. Menugaskan `textContent = 'Memuat…'` tidak langsung mengubah piksel di layar, sebab ia hanya menandai bahwa halaman perlu digambar ulang, dan penggambarannya baru terjadi setelah antrean microtask kosong. Jadi kalau `simpanData()` selesai dalam satu microtask, kedua penugasan `textContent` terjadi sebelum browser sempat menggambar sekali pun, dan yang akhirnya terlihat hanya `'Selesai'`. Seperti disebut di komentar, untuk indikator sesingkat ini hasilnya justru diinginkan, sebab teks \"Memuat…\" yang berkedip 3 milidetik lebih mengganggu daripada tidak ada sama sekali. Yang perlu diwaspadai adalah kebalikannya, yaitu menganggap sesuatu pasti terlihat di layar hanya karena barisnya sudah dijalankan.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kamu memasang indikator penyimpanan otomatis di editor catatan. Alurnya sederhana, yaitu tampilkan teks Menyimpan, panggil server, lalu ganti menjadi Tersimpan. Setelah dipasang, teks Menyimpan tidak pernah terlihat sama sekali. Yang muncul langsung Tersimpan, seolah penyimpanannya seketika, padahal permintaan jaringannya jelas memakan ratusan milidetik.',
      ),
      p(
        'Penyebabnya bukan jaringan dan bukan React. Penyebabnya urutan antrean, yaitu pekerjaan yang kamu kira ditunda ternyata masuk antrean microtask yang seluruhnya dihabiskan **sebelum** peramban sempat menggambar satu pixel pun.',
      ),
      code(
        'js',
        `
        // Bukti urutannya, jalankan di Node.js atau di console peramban.
        setTimeout(() => console.log('macrotask A'), 0);

        Promise.resolve()
          .then(() => { console.log('micro 1'); return Promise.resolve(); })
          .then(() => console.log('micro 2'))
          .then(() => console.log('micro 3'));

        setTimeout(() => console.log('macrotask B'), 0);

        // Keluaran sungguhan:
        // micro 1
        // micro 2
        // micro 3
        // macrotask A
        // macrotask B
        `,
        { caption: 'Tiga microtask berurutan tetap mendahului macrotask yang antre lebih dulu.' },
      ),
      p(
        'Perhatikan `setTimeout` pertama dijadwalkan sebelum rantai janjinya, tapi ketiga microtask tetap berjalan lebih dulu. Aturannya satu kalimat, yaitu setelah satu tugas selesai, event loop menghabiskan **seluruh** antrean microtask sampai kosong sebelum mengambil tugas berikutnya. Rantai `then` yang panjang berarti antrean microtask yang panjang, dan selama antrean itu belum kosong, tidak ada penggambaran dan tidak ada macrotask yang tersentuh.',
      ),
      code(
        'js',
        `
        // Kenapa teks 'Menyimpan' tidak pernah terlihat.
        async function simpanOtomatis(isi) {
          status.textContent = 'Menyimpan…';        // DOM berubah, tapi belum digambar

          const respons = await fetch('/api/catatan', {
            method: 'PUT',
            body: JSON.stringify({ isi }),
          });

          status.textContent = respons.ok ? 'Tersimpan' : 'Gagal';
        }
        `,
        { filename: 'Versi yang terlihat benar tapi tidak bekerja seperti dugaan' },
      ),
      p(
        'Kode di atas sebenarnya **benar** untuk kasus jaringan lambat, dan teks Menyimpan memang akan terlihat. Yang membuatnya tidak terlihat adalah situasi lain, yaitu ketika responsnya datang sangat cepat karena tersimpan di cache atau karena server berjalan lokal. Bagian pengujian di komputer sendiri hampir selalu jatuh pada situasi itu, sehingga kamu menyimpulkan kodenya rusak padahal ia hanya kelewat cepat.',
      ),
      code(
        'js',
        `
        // Jaminan agar keadaan memuat selalu terlihat cukup lama untuk dibaca.
        const tidur = (ms) => new Promise((teruskan) => setTimeout(teruskan, ms));

        async function simpanOtomatis(isi) {
          status.textContent = 'Menyimpan…';

          const mulai = performance.now();
          const respons = await fetch('/api/catatan', {
            method: 'PUT',
            body: JSON.stringify({ isi }),
          });

          // Tahan minimal 400 ms supaya tidak berkedip.
          const berlalu = performance.now() - mulai;
          if (berlalu < 400) await tidur(400 - berlalu);

          status.textContent = respons.ok ? 'Tersimpan' : 'Gagal';
        }
        `,
        { filename: 'src/simpan-otomatis.js' },
      ),
      p(
        '`setTimeout` di dalam `tidur` adalah macrotask, dan itu justru yang dibutuhkan di sini. Karena ia macrotask, event loop wajib mengosongkan antrean microtask lebih dulu, dan di sela itu peramban mendapat kesempatan menggambar. Kalau kamu memakai `queueMicrotask` atau `Promise.resolve().then(...)` untuk maksud yang sama, penggambaran justru tidak akan pernah terjadi karena keduanya tetap berada di antrean yang sama.',
      ),
      p(
        'Pola menahan minimal beberapa ratus milidetik ini disebut ambang antikedip, dan ia menyelesaikan masalah pengalaman pengguna bukan masalah teknis. Perubahan keadaan yang muncul dan hilang dalam lima puluh milidetik terbaca sebagai kedipan yang mengganggu, dan sering justru terasa lebih lambat daripada tidak ada indikator sama sekali. Aturan yang dipakai baseline frontend project ini sejalan, yaitu jangan pasang spinner untuk operasi yang hampir selalu seketika.',
      ),
      callout(
        'danger',
        'Rantai microtask tak berujung membekukan halaman tanpa satu pun peringatan',
        'Fungsi yang memanggil dirinya sendiri lewat `Promise.resolve().then(...)` membuat antrean microtask tidak pernah kosong. Event loop tidak akan pernah sampai ke penggambaran maupun ke macrotask, dan tab benar-benar mati tanpa pesan `[Violation]` karena tiap microtask-nya sendiri sangat cepat. Untuk perulangan yang perlu memberi napas, selalu pakai `setTimeout` atau `requestAnimationFrame`.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian ini hampir seluruhnya berisi gejala tanpa pesan, sebab masalah urutan antrean memang jarang melempar apa pun. Satu-satunya error sungguhan justru datang dari pemakaian yang berlebihan.',
      ),
      code(
        'text',
        `
        (Tab membeku total. Tidak ada [Violation], tidak ada error.)

        function ulang() {
          Promise.resolve().then(ulang);
        }
        ulang();
        `,
        { caption: 'Antrean microtask yang tidak pernah kosong.' },
      ),
      p(
        'Inilah kegagalan paling senyap di seluruh bab ini. Tiap microtask selesai dalam waktu yang sangat singkat, jadi tidak ada satu tugas panjang yang bisa dilaporkan peramban. Yang terjadi adalah antreannya diisi ulang secepat ia dikosongkan, sehingga event loop tidak pernah keluar dari tahap microtask. Bandingkan dengan versi `setTimeout(ulang, 0)` yang tetap membuat halaman berat tapi masih bisa diklik, sebab macrotask memberi celah di antaranya.',
      ),
      code(
        'text',
        `
        console.log('sebelum');
        await Promise.resolve();
        console.log('sesudah');

        // Di antara kedua baris itu TIDAK ada penggambaran.
        // Elemen yang diubah sebelum await tidak akan terlihat.
        `,
        { caption: 'Menunggu janji yang sudah selesai tetap tidak memberi kesempatan menggambar.' },
      ),
      p(
        '`await` pada nilai yang sudah tersedia tetap menunda sisanya ke antrean microtask, dan itu memang gunanya untuk menjaga urutan tetap terduga. Yang tidak ia berikan adalah kesempatan menggambar. Kalau kamu perlu perubahan DOM benar-benar terlihat sebelum pekerjaan berikutnya dimulai, tunggu dengan `setTimeout` atau dengan dua kali `requestAnimationFrame`, bukan dengan `await` pada janji kosong.',
      ),
      code(
        'text',
        `
        Uncaught (in promise) Error: gagal simpan
        `,
        {
          caption:
            'Kegagalan janji yang tidak ditangkap, dilaporkan setelah antrean microtask kosong.',
        },
      ),
      p(
        'Peramban menunggu sampai antrean microtask kosong sebelum memutuskan sebuah kegagalan benar-benar tidak tertangkap, dan itu keputusan yang masuk akal karena `catch` bisa saja dipasang beberapa microtask kemudian. Efek praktisnya, pesan ini muncul terlambat dan sering tidak sejajar dengan baris yang menyebabkannya. Kalau kamu melihat error yang seakan datang dari ketiadaan, telusuri janji yang dibuat tanpa `await` dan tanpa `catch`.',
      ),
      code(
        'text',
        `
        const b = document.body;
        b.style.background = 'red';
        for (let i = 0; i < 3e8; i += 1) {}
        b.style.background = 'blue';

        // Layar tidak pernah menjadi merah.
        `,
        { caption: 'Dua perubahan gaya dalam satu tugas hanya menghasilkan satu penggambaran.' },
      ),
      p(
        'Peramban tidak menggambar tiap kali kamu mengubah DOM, melainkan sekali di akhir tugas, dan yang digambar adalah keadaan terakhir. Ini bukan pengoptimalan yang bisa dimatikan melainkan cara kerja dasarnya. Karena itu, urutan tampilkan lalu sembunyikan di dalam satu tugas selalu berarti tidak pernah tampil, dan satu-satunya jalan keluar adalah memberi jeda berupa macrotask di antaranya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tab membeku tanpa pesan `[Violation]` apa pun',
            'Rantai microtask yang mengisi ulang dirinya sendiri',
            'Ganti penjadwalannya menjadi `setTimeout` atau `requestAnimationFrame`',
          ],
          [
            'Perubahan DOM tidak terlihat padahal barisnya dijalankan',
            'Belum ada penggambaran di antara dua perubahan',
            'Sisipkan macrotask, misalnya `await new Promise((r) => setTimeout(r, 0))`',
          ],
          [
            'Indikator memuat berkedip lalu hilang',
            'Responsnya datang lebih cepat daripada waktu baca manusia',
            'Tahan minimal sekitar 400 milidetik sebelum mengganti keadaannya',
          ],
          [
            '`Uncaught (in promise)` muncul terlambat',
            'Peramban menunggu antrean microtask kosong dulu',
            'Telusuri janji tanpa `await` dan tanpa `catch`',
          ],
          [
            'Urutan `console.log` tidak seperti urutan penulisan',
            'Sebagian masuk antrean microtask dan sebagian macrotask',
            'Kelompokkan mana yang sinkron, microtask, dan macrotask sebelum menyimpulkan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perbedaan microtask dan macrotask jarang terasa sampai kamu butuh sesuatu benar-benar terlihat di layar. Sebagian besar kesalahan di bawah berasal dari memakai antrean yang salah untuk maksud yang benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `await Promise.resolve()` untuk menunggu DOM tergambar',
            'Ia jelas menunda eksekusi',
            'Ia menunda ke antrean microtask, dan penggambaran terjadi setelah antrean itu kosong. Pakai `setTimeout` atau dua kali `requestAnimationFrame`',
          ],
          [
            'Mengira `queueMicrotask` dan `setTimeout(..., 0)` sama saja',
            'Keduanya sama-sama menunda ke lain waktu',
            'Yang pertama berjalan sebelum penggambaran, yang kedua sesudahnya. Untuk hal yang harus terlihat, hanya yang kedua bekerja',
          ],
          [
            'Merangkai belasan `then` untuk merapikan alur',
            'Tiap tahap jadi terlihat jelas',
            'Tiap `then` menambah satu putaran microtask, dan seluruh rantainya berjalan sebelum satu pun penggambaran. Untuk alur panjang, `async` dan `await` lebih terbaca dan lebih mudah disisipi jeda',
          ],
          [
            'Memasang spinner untuk operasi yang biasanya di bawah 100 milidetik',
            'Lebih baik ada indikator daripada tidak',
            'Kedipan terbaca lebih lambat daripada tidak ada indikator sama sekali. Tunda memunculkan spinner, atau tahan minimalnya',
          ],
          [
            'Menguji kecepatan hanya di komputer sendiri dengan server lokal',
            'Alurnya sama saja',
            'Respons lokal hampir seketika, sehingga seluruh keadaan memuat tidak pernah teruji. Pakai pembatas jaringan di DevTools',
          ],
          [
            'Memakai `process.nextTick` di Node.js seperti `setTimeout`',
            'Namanya terdengar seperti giliran berikutnya',
            'Ia berjalan sebelum antrean microtask janji, sehingga rantai `nextTick` yang panjang bisa menahan seluruh event loop Node.js',
          ],
        ],
      ),
      p(
        'Baris terakhir khusus berlaku di Node.js, dan layak disebut karena kamu akan menemuinya di kategori Backend. Node.js punya satu antrean tambahan di depan antrean janji, dan pekerjaan yang dijadwalkan ke sana dihabiskan lebih dulu. Untuk pekerjaan biasa, pakai `queueMicrotask` yang perilakunya sama di peramban dan di Node.js, sehingga satu kode berperilaku sama di kedua tempat.',
      ),
      callout(
        'tip',
        'Cara membuktikan urutan tanpa menebak',
        'Tulis empat baris di console, yaitu satu `console.log` biasa, satu `queueMicrotask`, satu `Promise.resolve().then`, dan satu `setTimeout` nol. Jalankan, lalu baca urutannya. Percobaan lima detik itu memberi model mental yang jauh lebih kuat daripada membaca penjelasan mana pun, termasuk penjelasan ini.',
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
          note: 'Spesifikasi aslinya — source of truth untuk urutan yang dibuktikan di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'callback',
    'Callback & Callback Hell',
    21,
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
            'Terjemahannya **pembalikan kendali**. Keadaan ketika kamu menyerahkan fungsimu ke pihak lain, sehingga **pihak lain itu yang memutuskan** kapan, berapa kali, dan dengan argumen apa fungsimu dipanggil. Kalau library itu memanggilnya dua kali karena bug, kodemu ikut berjalan dua kali — dan kamu tidak punya cara mencegahnya. Promise mengembalikan kendali itu ke tanganmu.',
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
      p(
        '`ambilData` menerima `id` dan sebuah fungsi bernama `selesai`, dan inilah callback-nya. Alih-alih `return` nilai secara langsung (mustahil, karena datanya belum ada saat fungsi ini dipanggil), `ambilData` menyerahkan tugas "memberi tahu nanti" kepada `setTimeout`, yang akan memanggil `selesai(...)` begitu 500 milidetik berlalu. Pola ini persis sama dengan callback pada `map` dan `addEventListener` yang sudah biasa kamu pakai, dan bedanya di sini kamu sendiri yang mendefinisikan fungsi `ambilData`, bukan memakai yang sudah disediakan bahasa atau browser.',
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
      p(
        'Perhatikan urutan parameter callback-nya, di mana **`err` selalu di posisi pertama** dan hasilnya menyusul di belakang. Itu konvensi yang dipegang seluruh API asinkron bawaan Node.js, dan alasannya praktis. Pada gaya callback tidak ada `try/catch` yang bisa menangkap kegagalan, karena saat error terjadi baris `readFile(...)` sudah lama selesai dijalankan. Satu-satunya jalan menyampaikan kegagalan adalah **mengirimkannya sebagai argumen**. Konsekuensinya, memeriksa `if (err)` bukan kesopanan melainkan kewajiban, sebab kalau pembacaan gagal `isi` bernilai `undefined`, dan melanjutkan tanpa memeriksa berarti memproses data yang tidak pernah ada. Baris `return` yang diberi huruf besar itu penting justru karena `if (err)` tidak menghentikan apa pun dengan sendirinya, sehingga tanpa `return`, `console.log(isi)` tetap dijalankan setelah pesan error tercetak.',
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

        // Kamu menyerahkan kendali. Bagaimana kalau library itu:
        //   - memanggil callback-mu dua kali?  -> data tersimpan dua kali
        //   - tidak pernah memanggilnya?       -> menggantung selamanya
        //   - memanggilnya secara sinkron?     -> urutan tak terduga
        // Promise menutup ketiganya: ia hanya bisa selesai SATU KALI.
        `,
      ),
      p(
        'Masalah di sini berbeda jenis dari callback hell, karena bukan soal keterbacaan melainkan soal **siapa yang memegang kendali**. Begitu kamu menyerahkan fungsi ke `pustakaOrangLain`, kamu tidak lagi menentukan kapan, berapa kali, atau bahkan apakah fungsimu dijalankan, sebab semua itu ditentukan kode yang tidak kamu tulis. Ketiga kemungkinan di komentar bukan hal teoretis. Callback yang terpanggil dua kali menyimpan data ganda tanpa satu pun error muncul, dan callback yang tidak pernah terpanggil membuat indikator "memuat" berputar selamanya tanpa jejak apa pun untuk ditelusuri. Yang paling halus adalah kemungkinan ketiga, yaitu library yang kadang memanggil callback secara langsung dan kadang setelah jeda, sehingga urutan eksekusi berubah-ubah dan bug seperti itu hanya muncul sesekali. Promise menutup ketiganya sekaligus lewat satu jaminan yang dipaksakan bahasa, yaitu sebuah Promise hanya bisa berpindah keadaan **satu kali**, dan penanganannya selalu dijalankan secara asinkron.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kamu diminta menambahkan unggah foto produk ke sebuah aplikasi lama. Pustaka pengolah gambar yang sudah dipakai project itu berumur bertahun-tahun dan seluruh API-nya berbasis callback, sedangkan kode barumu memakai `async` dan `await`. Alurnya empat langkah, yaitu baca berkas, ubah ukuran, unggah, lalu simpan alamatnya ke database. Ditulis dengan callback apa adanya, hasilnya menjorok ke kanan sampai setengah layar.',
      ),
      code(
        'js',
        `
        // Bentuk yang lahir kalau callback dipakai apa adanya.
        bacaBerkas(berkas, (galat, data) => {
          if (galat) return tampilkanGagal(galat);

          ubahUkuran(data, 800, (galat2, kecil) => {
            if (galat2) return tampilkanGagal(galat2);

            unggah(kecil, (galat3, alamat) => {
              if (galat3) return tampilkanGagal(galat3);

              simpanAlamat(produkId, alamat, (galat4) => {
                if (galat4) return tampilkanGagal(galat4);
                tampilkanBerhasil(alamat);
              });
            });
          });
        });
        `,
        { filename: 'Empat langkah, empat tingkat, empat pemeriksaan galat yang sama' },
      ),
      p(
        'Yang paling merugikan dari bentuk ini bukan indentasinya melainkan **pengulangan penanganan galat**. Empat baris `if (galat) return ...` isinya sama persis, dan keempatnya harus diingat. Melewatkan satu saja berarti satu jalur kegagalan yang berlanjut diam-diam membawa `undefined` ke langkah berikutnya. Nama variabel `galat2`, `galat3`, dan `galat4` juga bukan pilihan gaya melainkan keharusan, sebab keempatnya berada di scope yang saling bersarang.',
      ),
      p(
        'Perhatikan juga urutan argumen `(galat, data)`. Konvensi Node.js menaruh galat di posisi pertama justru supaya ia sulit diabaikan, sebab ia adalah hal pertama yang kamu tulis saat membongkar parameter. Konvensi ini bukan aturan bahasa melainkan kesepakatan, dan pustaka yang tidak mengikutinya harus dibaca dokumentasinya lebih dulu.',
      ),
      code(
        'js',
        `
        // Bungkus SEKALI di satu berkas, lalu seluruh aplikasi memakai janji.
        function janjikan(fn) {
          return (...arg) =>
            new Promise((teruskan, tolak) => {
              fn(...arg, (galat, hasil) => (galat ? tolak(galat) : teruskan(hasil)));
            });
        }

        export const bacaBerkasAsync = janjikan(bacaBerkas);
        export const ubahUkuranAsync = janjikan(ubahUkuran);
        export const unggahAsync = janjikan(unggah);
        export const simpanAlamatAsync = janjikan(simpanAlamat);
        `,
        { filename: 'src/pustaka-lama/bungkus.js' },
      ),
      code(
        'js',
        `
        // Alur yang sama, empat langkah, satu penanganan galat.
        async function unggahFoto(berkas, produkId) {
          try {
            const data = await bacaBerkasAsync(berkas);
            const kecil = await ubahUkuranAsync(data, 800);
            const alamat = await unggahAsync(kecil);
            await simpanAlamatAsync(produkId, alamat);
            tampilkanBerhasil(alamat);
          } catch (galat) {
            tampilkanGagal(galat);
          }
        }
        `,
        { filename: 'src/unggah-foto.js' },
      ),
      p(
        'Fungsi `janjikan` hanya tujuh baris dan ia menyelesaikan seluruh masalah di atas sekaligus. Bentuk `(...arg)` mengumpulkan argumen apa pun yang diberikan pemanggil, lalu `fn(...arg, callback)` menyebarkannya kembali dan menambahkan callback di posisi terakhir. Itu bekerja untuk fungsi berapa pun jumlah parameternya, selama ia mengikuti dua konvensi, yaitu callback di posisi terakhir dan galat di posisi pertama callback.',
      ),
      p(
        'Hasilnya, empat pemeriksaan galat berubah menjadi satu `catch`. Bukan karena galatnya berkurang, melainkan karena `await` melempar saat janjinya ditolak, dan satu `try` bisa membungkus keempat langkah sekaligus. Kalau kamu perlu tahu langkah mana yang gagal, bungkus galatnya dengan `cause` seperti dibahas di Sub-bab 1.14, sehingga pesannya menyebut langkahnya tanpa mengembalikan empat blok terpisah.',
      ),
      callout(
        'info',
        'Node.js sudah menyediakan pembungkus ini',
        'Untuk fungsi Node.js yang mengikuti konvensi galat di depan, `util.promisify` melakukan hal yang sama dan menangani beberapa kasus khusus. Banyak modul inti Node.js bahkan sudah punya versi janjinya sendiri, misalnya `node:fs/promises`. Tulis pembungkusmu sendiri hanya untuk pustaka yang tidak menyediakannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Callback punya satu sifat yang membuat kegagalannya sulit dilacak, yaitu galat yang dilempar di dalamnya tidak bisa ditangkap `try` di luarnya. Tiga bentuk di bawah semuanya berakar di situ.',
      ),
      code(
        'text',
        `
        try {
          bacaBerkas(berkas, (galat, data) => {
            throw new Error('gagal memproses');
          });
        } catch (e) {
          console.log('tidak pernah sampai sini');
        }

        Uncaught Error: gagal memproses
        `,
        { caption: '`try` di luar tidak menangkap galat dari dalam callback.' },
      ),
      p(
        'Alasannya urutan waktu. Blok `try` sudah selesai jauh sebelum callbacknya dijalankan, sebab `bacaBerkas` hanya mendaftarkan callback lalu segera kembali. Saat callbacknya akhirnya berjalan, ia berada di tugas yang sama sekali berbeda dan tidak ada `try` yang aktif di sekitarnya. Inilah salah satu alasan terkuat memindahkan kode callback ke janji, sebab `await` mengembalikan galat ke alur yang bisa dibungkus `try`.',
      ),
      code(
        'text',
        `
        bacaBerkas(berkas, (galat, data) => {
          proses(data.isi);
                     ^

        TypeError: Cannot read properties of undefined (reading 'isi')
        `,
        { caption: 'Parameter galat tidak diperiksa, dan `data` ternyata `undefined`.' },
      ),
      p(
        'Saat sebuah operasi gagal, konvensi galat di depan mengisi parameter pertama dan membiarkan parameter kedua `undefined`. Kalau pemeriksaan galat dilewati, kegagalan yang sebenarnya jelas berubah menjadi `TypeError` di baris yang sama sekali lain. Pesan aslinya, yang mungkin berbunyi berkas tidak ditemukan, hilang sepenuhnya. Inilah kenapa `if (galat)` bukan formalitas melainkan syarat.',
      ),
      code(
        'text',
        `
        let jumlahDipanggil = 0;
        pustakaLama.proses(data, () => { jumlahDipanggil += 1; });

        // jumlahDipanggil bernilai 3
        `,
        { caption: 'Callback dipanggil lebih dari sekali oleh pustaka yang tidak rapi.' },
      ),
      p(
        'Ini masalah yang disebut penyerahan kendali, yaitu kamu menyerahkan fungsimu kepada kode lain dan kode itu yang menentukan kapan dan berapa kali ia dipanggil. Pustaka yang bermasalah bisa memanggilnya dua kali, tidak sama sekali, atau memanggilnya secara sinkron padahal kamu mengira asinkron. Janji tidak punya masalah ini sama sekali, sebab sebuah janji hanya bisa selesai satu kali dan panggilan sesudahnya diabaikan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Galat di dalam callback tidak tertangkap `try` di luar',
            'Callback berjalan di tugas yang berbeda dari blok `try`',
            'Bungkus jadi janji lalu pakai `await` di dalam `try`',
          ],
          [
            '`Cannot read properties of undefined` di dalam callback',
            'Parameter galat tidak diperiksa, sehingga hasilnya kosong',
            'Selalu tulis `if (galat)` sebagai baris pertama callback',
          ],
          [
            'Callback berjalan lebih dari sekali',
            'Pustaka memanggilnya berulang, dan callback tidak bisa mencegahnya',
            'Bungkus jadi janji, sebab janji hanya bisa selesai satu kali',
          ],
          [
            'Callback berjalan sinkron padahal diduga asinkron',
            'Sebagian pustaka memanggilnya langsung untuk kasus cepat',
            'Bungkus jadi janji supaya urutannya selalu asinkron dan bisa diprediksi',
          ],
          [
            '`RangeError: Maximum call stack size exceeded` pada rantai callback',
            'Callback saling memanggil secara sinkron tanpa jeda',
            'Sisipkan `setTimeout` nol, atau ubah menjadi janji',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Callback bukan bentuk yang usang, sebab seluruh penangan peristiwa peramban memakainya dan itu memang tepat. Yang keliru adalah memakainya untuk urutan operasi yang bisa gagal, dan beberapa baris di bawah adalah gejalanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Melupakan `return` pada baris `if (galat) tampilkanGagal(galat)`',
            'Pesan gagalnya sudah muncul, jadi terasa selesai',
            'Tanpa `return`, eksekusi melanjutkan ke baris di bawahnya dengan data kosong. Pesan gagal muncul, lalu menyusul `TypeError`',
          ],
          [
            'Mencampur callback dan janji dalam satu fungsi',
            'Keduanya sama-sama asinkron',
            'Urutannya jadi sulit diikuti dan galatnya keluar lewat dua jalur berbeda. Bungkus callbacknya di batas, lalu pakai satu gaya di dalam',
          ],
          [
            'Mengembalikan nilai dari dalam callback',
            'Bentuknya sama dengan fungsi biasa',
            'Nilai itu kembali ke pemanggil callback, yaitu pustakanya, bukan ke fungsimu. Fungsimu sudah selesai jauh sebelumnya',
          ],
          [
            'Memakai variabel di luar callback untuk menampung hasilnya',
            'Terlihat seperti cara mengeluarkan nilainya',
            'Baris yang membaca variabel itu berjalan sebelum callbacknya dipanggil, jadi nilainya masih kosong. Pakai janji, atau lanjutkan pekerjaannya di dalam callback',
          ],
          [
            'Membungkus fungsi yang callbacknya dipanggil berkali-kali menjadi janji',
            'Pembungkusnya kan sudah terbukti bekerja',
            'Janji hanya menangkap panggilan pertama, dan sisanya hilang tanpa jejak. Untuk peristiwa berulang, pakai penangan peristiwa atau async iterator',
          ],
          [
            'Menghapus callback lama dan menulis ulang seluruh alur sekaligus',
            'Sekalian dibereskan',
            'Risikonya tinggi dan sulit diuji bertahap. Bungkus di batas lebih dulu, jalankan test, baru rapikan alur di dalamnya',
          ],
        ],
      ),
      p(
        'Baris pertama layak diingat karena ia adalah bug yang paling sering lolos dari tinjauan kode. Bentuk `if (galat) tampilkanGagal(galat)` tanpa `return` terlihat lengkap, dan pengujian jalur suksesnya lulus. Kegagalannya hanya muncul pada jalur galat, dan justru jalur itulah yang paling jarang diuji. Kebiasaan menulis `return` di baris yang sama menutup seluruh kelas bug ini.',
      ),
      callout(
        'tip',
        'Callback tetap bentuk yang benar untuk peristiwa berulang',
        'Yang cocok diubah menjadi janji adalah operasi yang selesai **satu kali**, misalnya membaca berkas atau memanggil server. Yang tidak cocok adalah hal yang terjadi berkali-kali seperti klik, scroll, atau pesan dari WebSocket. Untuk itu, callback lewat `addEventListener` justru bentuk yang tepat, dan versi asinkronnya adalah async iterator yang dibahas di Sub-bab 3.10.',
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
    25,
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
            'Sebutan untuk objek apa pun yang **punya method `.then()`**, meski bukan Promise sungguhan. JavaScript memperlakukannya seperti Promise saat dirangkai. Berguna untuk kompatibilitas dengan library lama yang punya jenis Promise-nya sendiri sebelum ada versi bawaan.',
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
      p(
        'Telusuri angkanya, mulai dari `1`, lalu tahap pertama menghasilkan `2`, tahap kedua menghasilkan `4`, dan tahap ketiga mencetaknya. Yang membuat rantai ini bekerja adalah satu aturan yang berlaku di **setiap** `then`, yaitu apa pun yang kamu `return` menjadi masukan tahap berikutnya. Aturan itu punya dua cabang, dan keduanya sengaja diperlihatkan berdampingan. Kalau yang dikembalikan **nilai biasa** seperti `n + 1`, JavaScript membungkusnya jadi promise yang langsung selesai. Kalau yang dikembalikan **sebuah promise** seperti `Promise.resolve(n * 2)`, rantai justru **menunggunya selesai** dulu lalu meneruskan isinya dan bukan promise-nya. Cabang kedua inilah yang membuat operasi asinkron bisa dirangkai berurutan tanpa bersarang, dan itu perbedaan mendasar dari callback yang harus ditumpuk ke dalam.',
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
      p(
        'Kedua versi hanya berbeda pada sepasang kurung kurawal, dan itu cukup untuk mengubah artinya sepenuhnya. Pada versi SALAH, badan arrow function dibungkus `{ }` sehingga tidak ada nilai yang dikembalikan. `ambilPesanan(u.id)` tetap **dijalankan**, tapi promise-nya tidak diserahkan ke rantai. Akibatnya tahap berikutnya menerima `undefined`, dan yang lebih berbahaya, permintaan pesanan itu berjalan sendirian tanpa ditunggu siapa pun sehingga kegagalannya tidak akan pernah sampai ke `catch` di rantai ini. Versi BENAR melepas kurung kurawalnya, sehingga hasil `ambilPesanan(u.id)` dikembalikan secara implisit dan rantai menunggunya. Kalau kamu memang butuh beberapa baris di dalam `then`, kurung kurawal boleh dipakai asalkan `return` ditulis sendiri.',
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
      p(
        'Perhatikan posisi `finally` di ujung rantai dan pasangannya `tampilkanIndikator()` di baris paling atas, karena keduanya sengaja mengapit seluruh operasi. Tanpa `finally`, kamu harus memanggil `sembunyikanIndikator()` dua kali, sekali di `then` dan sekali di `catch`, dan lupa salah satunya berarti indikator memuat berputar selamanya pada kasus yang jarang terjadi. `finally` menghapus duplikasi itu karena ia berjalan **apa pun hasilnya**. Komentar di bawahnya menyebut batasan yang membedakannya dari `then`, yaitu `finally` tidak menerima nilai apa pun sebagai parameter, dan apa pun yang ia kembalikan diabaikan, sehingga nilai maupun error dari rantai diteruskan utuh melewatinya. Itu disengaja, supaya blok pembersihan tidak bisa diam-diam mengubah hasil yang sedang mengalir.',
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
      p(
        'Perhatikan bedanya dengan sengaja, karena di Node.js promise yang gagal tanpa penanganan **menghentikan seluruh proses**. Sikap itu jauh lebih keras daripada sekadar mencetak peringatan, justru supaya kegagalan diam-diam tidak pernah lolos ke production tanpa disadari siapa pun. `unhandledrejection` di browser berperan sebagai jaring pengaman terakhir, sama seperti yang dibahas di sub-bab error handling, sehingga ia berguna untuk mengirim laporan ke layanan pemantauan tapi tidak menggantikan kewajiban menaruh `.catch()` tepat di tempat promise itu dipakai.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail pesanan mengambil datanya dari server, lalu memvalidasi bentuknya, lalu memperkaya tiap barisnya dengan harga terkini, lalu menampilkannya. Empat tahap, dan tiap tahap bisa gagal dengan cara yang berbeda. Jaringan bisa mati, server bisa mengirim bentuk yang tidak sesuai, dan harga terkini bisa tidak ditemukan untuk produk yang sudah dihapus.',
      ),
      p(
        'Alur seperti ini adalah tempat aturan pengembalian nilai `then` benar-benar terasa. Kalau satu tahap lupa mengembalikan sesuatu, tahap berikutnya menerima `undefined` dan kegagalannya muncul di tempat yang salah.',
      ),
      code(
        'js',
        `
        function muatPesanan(id) {
          return fetch(\`/api/pesanan/\${id}\`)
            .then((respons) => {
              // fetch TIDAK menolak untuk 404 atau 500, jadi periksa sendiri.
              if (!respons.ok) {
                throw new Error(\`Server menjawab \${respons.status} untuk pesanan \${id}\`);
              }
              return respons.json();          // janji, dan rantai menunggunya
            })
            .then((data) => {
              if (!Array.isArray(data.item)) {
                throw new TypeError('Bentuk respons tidak sesuai, item bukan array');
              }
              return data;                    // nilai biasa, diteruskan apa adanya
            })
            .then((data) =>
              // Janji dari dalam then ikut ditunggu sebelum lanjut.
              ambilHargaTerkini(data.item.map((i) => i.produkId)).then((harga) => ({
                ...data,
                item: data.item.map((i) => ({ ...i, hargaKini: harga[i.produkId] ?? null })),
              })),
            )
            .catch((galat) => {
              catatKeLog(galat);
              throw galat;                    // lempar ulang supaya pemanggil tahu
            });
        }
        `,
        { filename: 'src/pesanan/muat.js' },
      ),
      p(
        'Tiga `then` di atas memperlihatkan tiga jenis nilai kembalian yang berbeda, dan ketiganya diperlakukan berbeda oleh rantai. `then` pertama mengembalikan `respons.json()` yang berupa janji, sehingga rantai menunggunya selesai lebih dulu dan `then` berikutnya menerima datanya bukan janjinya. `then` kedua mengembalikan `data` yang berupa nilai biasa, sehingga langsung diteruskan. `then` ketiga mengembalikan janji dari `ambilHargaTerkini`, dan sekali lagi rantai menunggunya.',
      ),
      p(
        'Aturan yang menyatukan ketiganya satu kalimat, yaitu apa pun yang kamu kembalikan dari `then` akan dibuka bungkusnya kalau ia janji. Inilah yang membuat rantai bisa datar tanpa bersarang, dan inilah yang hilang begitu satu `then` lupa menulis `return`. Bagian error di bawah menunjukkan bentuk kegagalannya.',
      ),
      p(
        'Blok `catch` di ujung menangkap kegagalan dari **tahap mana pun** di atasnya, termasuk `throw` yang kamu tulis sendiri di dalam `then`. Yang perlu diperhatikan adalah `throw galat` di dalam `catch` itu. Tanpa baris itu, `catch` dianggap sudah menyelesaikan masalahnya dan rantai berlanjut sebagai berhasil dengan nilai `undefined`. Pemanggil `muatPesanan` akan mengira semuanya baik-baik saja lalu gagal saat membaca `data.item`.',
      ),
      code(
        'js',
        `
        // Letak catch menentukan apa yang ia lindungi.
        muatPesanan(id)
          .then(gambarHalaman)      // kalau INI gagal, catch di bawah menangkapnya
          .catch(tampilkanGagal);

        muatPesanan(id)
          .catch(tampilkanGagal)    // hanya melindungi muatPesanan
          .then(gambarHalaman);     // ini tetap jalan walau muatPesanan gagal
        `,
        { caption: 'Dua bentuk yang terlihat mirip dengan perilaku yang berbeda.' },
      ),
      p(
        'Bentuk kedua adalah kesalahan yang sangat sering. Karena `catch` menangani kegagalannya, rantai berlanjut sebagai berhasil dan `gambarHalaman` tetap dipanggil, kali ini dengan `undefined`. Hasilnya pengguna melihat pesan gagal **dan** halaman kosong sekaligus. Aturan praktisnya, taruh `catch` di paling ujung kecuali kamu memang sengaja ingin memulihkan lalu melanjutkan.',
      ),
      callout(
        'warning',
        '`fetch` hanya menolak untuk kegagalan jaringan',
        'Respons 404, 422, dan 500 semuanya dianggap berhasil oleh `fetch`, sebab permintaannya memang sampai dan dijawab. Kalau kamu tidak memeriksa `respons.ok`, `catch`-mu tidak akan pernah berjalan untuk kesalahan server, dan aplikasi akan mencoba membaca badan respons error sebagai data yang sah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat bentuk berikut mencakup hampir seluruh kegagalan rantai janji yang akan kamu temui.',
      ),
      code(
        'text',
        `
        fetch(url)
          .then((r) => { r.json(); })      // kurung kurawal tanpa return
          .then((data) => console.log(data.nama));

        TypeError: Cannot read properties of undefined (reading 'nama')
        `,
        { caption: '`return` yang hilang membuat tahap berikutnya menerima `undefined`.' },
      ),
      p(
        'Ini kesalahan nomor satu pada rantai janji, dan bentuknya sama persis dengan jebakan `map` di Bab 1. Fungsi panah berkurung kurawal tidak mengembalikan apa pun tanpa `return`, sehingga `then` berikutnya menerima `undefined`. Perhatikan errornya muncul di tahap **berikutnya**, bukan di tahap yang lupa `return`, dan itu yang membuatnya sulit dilacak. Kalau sebuah tahap hanya berisi satu ekspresi, hapus kurung kurawalnya dan masalah ini tidak bisa terjadi.',
      ),
      code(
        'text',
        `
        muatPesanan(id).then(gambar);

        Uncaught (in promise) Error: Server menjawab 500 untuk pesanan 7
        `,
        { caption: 'Rantai tanpa `catch` di ujungnya.' },
      ),
      p(
        'Tanpa `catch`, kegagalan tidak hilang melainkan menjadi kegagalan yang tidak tertangani. Di peramban ia muncul sebagai `Uncaught (in promise)` di console dan tidak menghentikan halaman, sehingga sangat mudah terlewat saat pengujian manual. Di Node.js versi modern, kegagalan tidak tertangani justru **menghentikan proses**, dan itu perbedaan penting yang perlu diingat saat kode yang sama dipakai di kedua tempat.',
      ),
      code(
        'text',
        `
        muatPesanan(id)
          .catch(tampilkanGagal)
          .then(gambarHalaman);

        // tampilkanGagal berjalan, LALU gambarHalaman(undefined) juga berjalan.
        TypeError: Cannot read properties of undefined (reading 'item')
        `,
        {
          caption:
            '`catch` di tengah rantai memulihkan alur, sehingga tahap sesudahnya tetap jalan.',
        },
      ),
      p(
        'Setelah `catch` menangani sebuah kegagalan tanpa melempar ulang, rantai kembali ke jalur berhasil. Nilai yang diteruskan adalah nilai kembalian `catch`, dan kalau `tampilkanGagal` tidak mengembalikan apa pun, nilainya `undefined`. Kalau kamu memang ingin memulihkan, kembalikan nilai cadangan yang sah dari dalam `catch`, misalnya `return { item: [] }`.',
      ),
      code(
        'text',
        `
        const hasil = Promise.resolve(1).then(2).then((v) => console.log('v', v));

        v 1
        `,
        { caption: 'Argumen `then` yang bukan fungsi diabaikan diam-diam.' },
      ),
      p(
        'Ini perilaku yang jarang diketahui dan tidak melempar apa pun. Kalau argumen `then` bukan fungsi, ia diabaikan dan nilainya diteruskan apa adanya. Akibat praktisnya, salah ketik seperti `then(prosesData())` yang seharusnya `then(prosesData)` bisa lolos tanpa satu pun tanda, sebab `prosesData()` dipanggil terlalu awal dan hasilnya yang bukan fungsi diabaikan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of undefined` di tahap berikutnya',
            'Tahap sebelumnya lupa `return`',
            'Hapus kurung kurawalnya, atau tambahkan `return`',
          ],
          [
            '`Uncaught (in promise)`',
            'Rantai tidak punya `catch` di ujungnya',
            'Tambahkan `catch`, dan ingat Node.js akan menghentikan proses untuk kasus ini',
          ],
          [
            'Pesan gagal muncul bersamaan dengan halaman kosong',
            '`catch` diletakkan di tengah, sehingga rantai pulih dan lanjut',
            'Pindahkan `catch` ke ujung, atau kembalikan nilai cadangan yang sah',
          ],
          [
            'Tahap `then` tidak pernah berjalan',
            'Argumennya bukan fungsi, biasanya karena tanda kurung ikut ditulis',
            'Berikan nama fungsinya tanpa tanda kurung',
          ],
          [
            'Respons 500 diperlakukan sebagai data yang sah',
            '`fetch` tidak menolak untuk status kegagalan',
            'Periksa `respons.ok` dan lempar sendiri',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Rantai janji mudah ditulis dan mudah salah dalam cara yang tidak berbunyi. Enam baris di bawah adalah yang paling sering lolos ke produksi.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyarangkan `then` di dalam `then`',
            'Bentuknya mirip callback yang sudah dikenal',
            'Itu membuang keuntungan terbesar janji. Kembalikan janji dalamnya, dan rantainya tetap datar',
          ],
          [
            'Membungkus fungsi yang sudah mengembalikan janji dengan `new Promise`',
            'Supaya bentuknya seragam',
            'Ini disebut anti-pola constructor janji. Tanpa penanganan galat yang teliti, kegagalannya justru hilang. Kembalikan janji aslinya',
          ],
          [
            'Memakai `then` dan `await` bercampur dalam satu fungsi',
            'Keduanya sama-sama menangani janji',
            'Alurnya jadi sulit dibaca dan urutan galatnya tidak jelas. Pilih satu gaya per fungsi',
          ],
          [
            'Membuat janji tanpa mengembalikannya dari fungsi',
            'Ia toh tetap berjalan',
            'Pemanggil tidak punya cara menunggunya maupun menangkap kegagalannya. Selalu kembalikan janji yang kamu buat',
          ],
          [
            'Menulis `.catch(console.error)` sebagai penanganan akhir',
            'Setidaknya kegagalannya tercatat',
            'Pengguna tidak melihat apa pun dan aplikasi berlanjut dengan data kosong. Catat, lalu tentukan apa yang ditampilkan',
          ],
          [
            'Mengira `finally` menerima nilai hasilnya',
            'Ia bagian dari rantai yang sama',
            '`finally` tidak menerima argumen dan tidak mengubah nilai yang diteruskan. Ia hanya untuk pembersihan seperti mematikan indikator memuat',
          ],
        ],
      ),
      p(
        'Baris kedua perlu dijelaskan lebih jauh karena bentuknya sangat sering muncul di kode pemula. Menulis `new Promise((teruskan) => { fetch(url).then(teruskan); })` menambah satu lapisan yang tidak menangani penolakan sama sekali, sehingga kegagalan `fetch` menghilang tanpa jejak. Kalau sebuah fungsi sudah mengembalikan janji, kembalikan saja janji itu. `new Promise` hanya untuk membungkus hal yang **belum** berupa janji, dan itu topik sub-bab berikutnya.',
      ),
      callout(
        'tip',
        'Cara cepat memastikan rantaimu benar',
        'Baca rantainya dan tanyakan tiga hal. Apakah setiap `then` mengembalikan sesuatu, apakah ada `catch` di ujung, dan apakah `catch` itu melempar ulang atau memang sengaja memulihkan. Tiga pertanyaan itu menutup hampir seluruh isi bagian error di atas.',
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
    24,
    'Membungkus API berbasis callback menjadi Promise.',
    [
      p(
        'Sebagian besar waktu kamu **mengonsumsi** promise dari `fetch` atau library. Sesekali kamu perlu membuatnya sendiri — biasanya untuk membungkus API lama.',
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
            'Fungsi yang memindahkan Promise ke keadaan berhasil sambil membawa sebuah nilai. Kalau kamu memanggilnya tanpa argumen, seperti pada `setTimeout(resolve, ms)`, nilainya `undefined`, dan itu wajar untuk janji yang gunanya cuma "beri tahu aku kalau sudah waktunya".',
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
            'Dua **helper statis** untuk membuat Promise yang sudah selesai sejak awal. Berguna untuk menyeragamkan bentuk return value — misalnya sebuah fungsi yang kadang punya hasil di cache dan kadang harus mengambil dari jaringan tetap bisa selalu mengembalikan Promise.',
        },
        {
          term: 'anti-pattern constructor',
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
      p(
        '`tunggu(ms)` adalah versi paling minim, sebab `resolve` diserahkan langsung sebagai callback `setTimeout`, sehingga promise-nya selesai (dengan nilai `undefined`) begitu waktunya habis. `muatGambar` menunjukkan pola yang lebih lengkap, yaitu membungkus API lama `Image` yang memberi tahu hasilnya lewat `onload`/`onerror`. Perhatikan bahwa fungsi *executor* `(resolve, reject) => { ... }` itu sendiri berjalan **seketika** saat `new Promise(...)` dipanggil, persis seperti dijelaskan di kotak istilah, sebab yang menunggu bukan executor-nya melainkan `resolve`/`reject` yang baru benar-benar dipanggil belakangan dari dalam `onload`/`onerror`.',
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
      p(
        'Kesalahan pertama yang paling berbahaya, karena **tidak menghasilkan error apa pun**. Baris `if (err) return` menghentikan callback tanpa memanggil `reject`, sehingga promise-nya tidak pernah berpindah keadaan dan menggantung selamanya. Bagi pemanggil, `await` pada promise seperti itu berarti menunggu tanpa akhir, tanpa error untuk ditangkap, tanpa `finally` yang berjalan, dan indikator memuat berputar terus. Aturannya, **setiap jalur keluar** dari executor harus berakhir di `resolve` atau `reject`. Kesalahan kedua mengulang pelajaran dari bab error handling, karena menolak dengan string membuang `stack` sehingga pesan yang sampai ke `catch` tidak bisa ditelusuri asalnya. Kesalahan ketiga adalah anti-pattern yang dibahas di kotak berikut, sebab `fetch(url)` sudah mengembalikan promise, jadi membungkusnya lagi hanya menambah lapisan yang justru gampang menelan error.',
      ),
      callout(
        'warning',
        'Anti-pattern "explicit promise construction"',
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
      p(
        'Fungsi ini menerjemahkan gaya error-first callback dari sub-bab sebelumnya menjadi gaya promise, dan menariknya ia bekerja untuk **fungsi apa pun** yang mengikuti konvensi itu. Kuncinya ada di `fn(...args, (err, hasil) => ...)`, tempat rest parameter `...args` menampung semua argumen yang dikirim pemanggil, lalu spread menyebarkannya kembali ke `fn` dengan callback buatan sendiri **ditempelkan di posisi terakhir**, tepat di tempat konvensi Node meletakkannya. Callback itulah yang menjembatani kedua dunia, karena kalau `err` terisi ia memanggil `reject`, dan kalau tidak ia memanggil `resolve`. Perhatikan `promisify` mengembalikan **fungsi** dan bukan promise, sebab promise-nya baru lahir saat fungsi hasilnya benar-benar dipanggil. Karena itu `bacaBerkas` bisa dipakai berkali-kali, dan `await` di baris terakhir bekerja seolah `readFile` memang sejak awal berbasis promise.',
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
      p(
        'Contoh `ambil(id)` menunjukkan kegunaan `Promise.resolve` yang paling sering dipakai, yaitu **menyeragamkan bentuk kembalian**. Tanpa pembungkus itu, fungsi ini kadang mengembalikan data langsung dari cache dan kadang mengembalikan promise dari `fetch`, sehingga setiap pemanggil terpaksa memeriksa dulu mana yang ia terima, dan pemeriksaan seperti itu selalu ada yang lupa. Dengan `Promise.resolve(cache)`, kedua cabang mengembalikan promise, sehingga `await ambil(id)` selalu benar tanpa peduli datanya berasal dari mana. Konsistensi ini juga membuat perilakunya bisa ditebak dari sisi waktu, sebab kedua jalur sama-sama menyelesaikan diri secara asinkron, jadi kode setelahnya tidak akan kadang berjalan seketika dan kadang tertunda, persis masalah "urutan tak terduga" yang disebut di sub-bab callback.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Fitur unggah foto profil butuh menampilkan pratinjau sebelum berkasnya dikirim. API peramban untuk membaca berkas, yaitu `FileReader`, berbasis peristiwa dan bukan janji. Ia punya tiga peristiwa yang bisa terjadi, yaitu selesai membaca, gagal membaca, dan dibatalkan pengguna. Ketiganya harus ditangani, dan hanya satu di antaranya yang boleh menentukan hasil akhirnya.',
      ),
      p(
        'Inilah situasi yang benar-benar membutuhkan `new Promise`, yaitu membungkus sesuatu yang belum berupa janji. Perhatikan bagaimana ketiga peristiwa itu dipetakan ke dua jalan keluar sebuah janji.',
      ),
      code(
        'js',
        `
        export function bacaSebagaiDataUrl(berkas, { batasByte = 5 * 1024 * 1024 } = {}) {
          return new Promise((teruskan, tolak) => {
            // Periksa yang bisa diperiksa SEBELUM memulai pekerjaan asinkron.
            if (!(berkas instanceof Blob)) {
              tolak(new TypeError('Argumen harus berupa File atau Blob'));
              return;
            }
            if (berkas.size > batasByte) {
              tolak(new RangeError(\`Berkas \${berkas.size} byte melebihi batas \${batasByte}\`));
              return;
            }

            const pembaca = new FileReader();

            pembaca.onload = () => teruskan(pembaca.result);
            pembaca.onerror = () => tolak(pembaca.error ?? new Error('Gagal membaca berkas'));
            pembaca.onabort = () => tolak(new DOMException('Dibatalkan', 'AbortError'));

            pembaca.readAsDataURL(berkas);
          });
        }
        `,
        { filename: 'src/baca-berkas.js' },
      ),
      p(
        'Dua pemeriksaan di awal sengaja diletakkan **di dalam** executor, bukan di luar sebelum `new Promise`. Alasannya konsistensi jalur kegagalan. Kalau pemeriksaan ditaruh di luar dan melempar, pemanggil harus membungkusnya dengan `try` selain memasang `catch`, yaitu dua jalur galat untuk satu fungsi. Dengan menaruhnya di dalam, seluruh kegagalan keluar lewat satu pintu, yaitu penolakan janjinya.',
      ),
      p(
        'Baris `return` setelah tiap `tolak(...)` bukan hiasan. Memanggil `tolak` tidak menghentikan eksekusi executor, jadi tanpa `return` kode di bawahnya tetap berjalan dan `FileReader` tetap dibuat untuk berkas yang sudah ditolak. Janjinya memang tetap berakhir sebagai ditolak, karena panggilan sesudahnya diabaikan, tapi pekerjaan sia-sia itu tetap terjadi.',
      ),
      p(
        "Ketiga penangan peristiwa memetakan tiga kemungkinan ke dua jalan keluar. Hanya `onload` yang memanggil `teruskan`, sedangkan gagal dan dibatalkan sama-sama menolak dengan jenis error yang berbeda. Pemakaian `DOMException` bernama `AbortError` untuk pembatalan mengikuti konvensi peramban, sehingga kode pemanggil bisa membedakannya dengan `if (e.name === 'AbortError')` persis seperti saat memakai `AbortController` di Sub-bab 3.8.",
      ),
      code(
        'js',
        `
        // Sifat yang membuat janji aman dipakai untuk membungkus peristiwa.
        const p = new Promise((teruskan, tolak) => {
          teruskan('pertama');
          teruskan('kedua');            // diabaikan
          tolak(new Error('diabaikan'));  // diabaikan juga
        });

        p.then((v) => console.log('hasil:', v));
        // hasil: pertama

        const q = new Promise(() => {
          throw new Error('lempar di dalam executor');
        });

        q.catch((e) => console.log('executor throw ->', e.message));
        // executor throw -> lempar di dalam executor
        `,
        {
          caption:
            'Janji hanya bisa selesai sekali, dan lemparan di executor otomatis menjadi penolakan.',
        },
      ),
      p(
        'Dua sifat di atas yang membuat `new Promise` cocok untuk membungkus API berbasis peristiwa. Sifat pertama, janji hanya bisa selesai satu kali, sehingga pustaka yang memanggil callback berkali-kali tidak bisa merusak alurmu. Sifat kedua, `throw` di dalam executor otomatis berubah menjadi penolakan, sehingga kesalahan sinkron di dalamnya tidak lolos begitu saja. Perhatikan sifat kedua ini **tidak** berlaku untuk `throw` di dalam callback asinkron seperti `pembaca.onload`, dan itu dibahas di bagian error di bawah.',
      ),
      callout(
        'warning',
        'Jangan pakai `new Promise` untuk hal yang sudah berupa janji',
        'Menulis `new Promise((teruskan) => { fetch(url).then(teruskan); })` adalah anti-pola yang punya nama tersendiri, yaitu promise constructor antipattern. Ia menambah satu lapisan yang biasanya lupa meneruskan penolakan, sehingga kegagalan `fetch` hilang tanpa jejak. Kalau sesuatu sudah mengembalikan janji, kembalikan janji itu apa adanya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Membuat janji sendiri punya beberapa cara gagal yang khas, dan yang paling berbahaya adalah janji yang tidak pernah selesai sama sekali.',
      ),
      code(
        'text',
        `
        const p = new Promise((teruskan, tolak) => {
          if (berkas.size > batas) return;    // lupa memanggil tolak
          teruskan(baca(berkas));
        });

        await p;
        // Tidak ada error. Tidak ada apa pun. Menunggu selamanya.
        `,
        { caption: 'Executor selesai tanpa memanggil `teruskan` maupun `tolak`.' },
      ),
      p(
        'Ini kegagalan paling senyap dari seluruh materi janji. Janji yang executornya berakhir tanpa memanggil salah satu dari dua fungsi itu akan tetap berada di keadaan menunggu selamanya. Kode yang meng-`await`-nya berhenti di situ tanpa pesan, tanpa timeout, dan tanpa jejak di console. Di antarmuka, gejalanya berupa indikator memuat yang berputar tanpa akhir. Pastikan **setiap** jalur di dalam executor berakhir pada `teruskan` atau `tolak`.',
      ),
      code(
        'text',
        `
        new Promise((teruskan) => {
          pembaca.onload = () => {
            throw new Error('bentuk data salah');    // TIDAK menjadi penolakan
          };
          pembaca.readAsText(berkas);
        });

        Uncaught Error: bentuk data salah
        `,
        { caption: '`throw` di dalam callback asinkron tidak ditangkap janjinya.' },
      ),
      p(
        'Perbedaannya dengan `throw` langsung di badan executor sangat penting. Janji hanya menangkap lemparan yang terjadi **selama executor berjalan**, yaitu secara sinkron. Callback `onload` berjalan jauh kemudian di tugas yang berbeda, dan pada saat itu executornya sudah lama selesai. Akibatnya janji tetap menunggu selamanya sekaligus ada error tidak tertangkap di console. Bungkus isi callback dengan `try` lalu panggil `tolak(e)` di dalam `catch`-nya.',
      ),
      code(
        'text',
        `
        function ambil() {
          return new Promise((teruskan) => {
            fetch(url).then((r) => teruskan(r.json()));
          });
        }

        await ambil();
        // Kalau fetch gagal: menunggu selamanya, plus Uncaught (in promise).
        `,
        { caption: 'Anti-pola constructor janji yang menelan penolakan.' },
      ),
      p(
        'Karena `tolak` tidak pernah dipanggil, kegagalan `fetch` tidak punya jalan keluar dari janji pembungkusnya. Yang terjadi dua hal sekaligus, yaitu janji luar menunggu selamanya dan penolakan `fetch` menjadi tidak tertangani. Bentuk yang benar adalah `function ambil() { return fetch(url).then((r) => r.json()); }`, yaitu tanpa `new Promise` sama sekali.',
      ),
      code(
        'text',
        `
        const p = new Promise((teruskan) => teruskan());
        p.then((v) => console.log(v.nama));
                                     ^

        TypeError: Cannot read properties of undefined (reading 'nama')
        `,
        { caption: '`teruskan()` tanpa argumen menghasilkan `undefined`.' },
      ),
      p(
        'Memanggil `teruskan` tanpa argumen sah dan menghasilkan janji yang berhasil dengan nilai `undefined`. Ini sering terjadi saat kamu menyalin bentuk pembungkus lalu lupa mengisi nilainya, misalnya menulis `teruskan()` alih-alih `teruskan(pembaca.result)`. Karena janjinya benar-benar berhasil, tidak ada satu pun tanda sampai nilainya dibaca di tempat lain.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Menunggu selamanya tanpa pesan apa pun',
            'Ada jalur di executor yang tidak memanggil `teruskan` maupun `tolak`',
            'Telusuri setiap `return` dan setiap percabangan di dalam executor',
          ],
          [
            '`Uncaught Error` dari dalam callback, dan janjinya tetap menunggu',
            '`throw` di callback asinkron tidak ditangkap janjinya',
            'Bungkus isi callback dengan `try`, lalu `tolak(e)` di `catch`',
          ],
          [
            'Kegagalan bagian dalam hilang tanpa jejak',
            'Anti-pola constructor janji yang lupa meneruskan penolakan',
            'Hapus `new Promise`, kembalikan janji aslinya',
          ],
          [
            'Nilai hasil `undefined` padahal seharusnya ada',
            '`teruskan()` dipanggil tanpa argumen',
            'Isi argumennya dengan nilai yang dimaksud',
          ],
          [
            'Pekerjaan tetap berjalan setelah ditolak',
            '`tolak` tidak diikuti `return`',
            'Tulis `return` setelah tiap `tolak` dan `teruskan` yang mengakhiri jalur',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Membuat janji sendiri lebih jarang dibutuhkan daripada yang orang kira, dan sebagian besar kesalahan di bawah berasal dari memakainya di tempat yang tidak membutuhkannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membungkus fungsi `async` dengan `new Promise`',
            'Supaya bentuknya seragam dengan pembungkus lain',
            'Fungsi `async` sudah mengembalikan janji. Pembungkusnya hanya menambah lapisan yang bisa menelan penolakan',
          ],
          [
            'Memakai `async` pada executor, misalnya `new Promise(async (t) => ...)`',
            'Isi executornya memang perlu `await`',
            'Kegagalan di dalam executor `async` menjadi penolakan janji yang berbeda dan tidak tertangkap. Pakai fungsi `async` biasa, tanpa `new Promise`',
          ],
          [
            'Memanggil `teruskan` di dalam `setTimeout` tanpa jalur galat',
            'Yang ditunggu hanya waktunya, jadi tidak mungkin gagal',
            'Benar untuk `tidur`, tapi begitu ada pekerjaan lain di dalamnya, jalur galatnya hilang. Sediakan `tolak` sejak awal',
          ],
          [
            'Membuat janji lalu menyimpannya sebagai variabel modul',
            'Supaya hasilnya bisa dipakai bersama',
            'Janji hanya berjalan sekali, jadi kegagalan pertama akan terus terulang selamanya bagi semua pemakai. Simpan fungsinya, bukan janjinya',
          ],
          [
            'Menulis pembungkus baru untuk tiap fungsi callback',
            'Tiap fungsi kan berbeda',
            'Untuk pustaka yang mengikuti konvensi galat di depan, satu pembungkus umum cukup untuk semuanya, seperti dibahas di Sub-bab 3.3',
          ],
          [
            'Membungkus penangan peristiwa berulang dengan janji',
            'Bentuknya sama dengan membungkus `FileReader`',
            'Janji selesai sekali, sehingga peristiwa kedua dan seterusnya hilang. Untuk peristiwa berulang, pakai penangan biasa atau async iterator',
          ],
        ],
      ),
      p(
        'Baris kedua layak diwaspadai karena editor tidak menandainya sama sekali. Bentuk `new Promise(async (teruskan, tolak) => { ... })` menghasilkan dua janji yang tidak berhubungan, yaitu janji luar yang menunggu `teruskan` dan janji dalam dari fungsi `async`. Kalau bagian dalam melempar, penolakannya menjadi milik janji dalam yang tidak dipegang siapa pun, sedangkan janji luar tetap menunggu selamanya. Kalau kamu merasa butuh `await` di dalam executor, yang sebenarnya kamu butuhkan adalah fungsi `async` biasa.',
      ),
      callout(
        'tip',
        'Tiga fungsi bantu yang layak ditulis sekali di tiap project',
        'Pertama `tidur(ms)` yang membungkus `setTimeout`. Kedua `janjikan(fn)` untuk pustaka callback, seperti di Sub-bab 3.3. Ketiga `denganTimeout(janji, ms)` yang memakai `Promise.race`. Ketiganya pendek, dipakai berulang kali, dan menutup hampir seluruh kebutuhan `new Promise` di aplikasi biasa.',
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
    27,
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
      p(
        'Aturan pertama sering mengejutkan, karena `async function f() { return 1; }` tidak mengembalikan `1` melainkan promise yang **berisi** `1`. Kata `async` di depan sebuah fungsi otomatis membungkus apa pun yang ia kembalikan, begitu juga error yang dilemparnya, yang berubah menjadi promise yang ditolak. Konsekuensi praktisnya, memanggil fungsi `async` tanpa `await` atau `.then()` hanya memberimu janjinya dan bukan hasilnya, dan itu penyebab umum variabel yang isinya `Promise { <pending> }` alih-alih data. Aturan kedua menjelaskan dua `await` berturut-turut pada `fetch`. Yang pertama menunggu **respons tiba**, yakni statusnya dan header-nya tapi belum isinya, sedangkan yang kedua menunggu badan respons selesai dibaca dan diurai menjadi object. Itu bukan pemborosan, sebab keduanya memang dua tahap yang berbeda, dan pemisahan itu yang memungkinkan kamu memeriksa `res.ok` sebelum repot mengurai isinya.',
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
      p(
        'Kedua versi ini melakukan hal yang identik dan sama-sama memakai Promise di baliknya, sebab `ambilProfil2` bukan cara baru yang lebih cepat, hanya cara menulis yang lebih mudah diikuti. Perbedaan yang paling terasa ada di penanganan error. Pada versi `then`, kegagalan ditangkap lewat `.catch()` yang terpisah dari kode utamanya, sedangkan pada versi `async`/`await`, `try`/`catch` yang sama persis dengan penanganan error kode sinkron biasa bisa langsung dipakai membungkus seluruh alurnya.',
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
      p(
        'Kedua fungsi melakukan hal yang persis sama, jadi bandingkan **cara membacanya**. Versi `then` memaksa matamu melompat dari satu callback ke callback berikutnya, dan nilai antaranya, yaitu pengguna lalu pesanan, tidak pernah punya nama yang bisa dirujuk di luar tahapnya sendiri. Versi `async`/`await` menuliskan langkah yang sama sebagai baris berurutan dari atas ke bawah, dengan `u` dan `pesanan` sebagai variabel biasa yang bisa dipakai di baris mana pun setelahnya. Perubahan terbesarnya ada di penanganan error, karena `.catch()` yang menempel di ujung rantai digantikan `try`/`catch` yang **sama persis** dengan yang kamu pakai untuk kode biasa, sehingga tidak ada lagi dua cara berbeda untuk menangani kegagalan. Perhatikan keduanya sama-sama melempar ulang errornya setelah mencatat, sebab mencatat lalu diam akan membuat pemanggil mengira semuanya berhasil.',
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
      p(
        'Sebelum ada kemampuan ini, kode seperti itu harus dibungkus IIFE async berbentuk `(async () => { ... })()`, hanya untuk mendapatkan tempat yang sah memakai `await`. Di modul ES kini tidak perlu lagi. Tetapi ada harga yang perlu disadari, sebab `await` di tingkat teratas **menunda selesainya modul itu sendiri**, dan setiap modul lain yang mengimpornya ikut menunggu sampai baris itu tuntas. Untuk memuat konfigurasi yang memang wajib ada sebelum apa pun berjalan, itu justru yang diinginkan. Namun menaruh permintaan jaringan yang lambat di sana berarti memperlambat seluruh rantai impor aplikasimu, dan penyebabnya sulit dilacak karena tidak ada satu pun fungsi yang terlihat menunggu.',
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
      p(
        'Ketiga contoh ini punya benang merah yang sama, yaitu `then` tetap masuk akal ketika kamu tidak butuh membungkus sesuatu dalam fungsi `async` terpisah hanya untuk satu baris. `namaPengguna` cukup satu transformasi, `kirimAnalitik(...).catch(() => {})` sengaja **tidak** ditunggu karena mengirim data analitik tidak boleh menahan aksi utama pengguna, sambil tetap punya `.catch()` supaya kegagalannya tidak menjadi unhandled rejection, dan baris terakhir merangkai `.then()` langsung di dalam `map` karena menulisnya sebagai fungsi `async` terpisah justru menambah baris tanpa menambah kejelasan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Alur pendaftaran pengguna baru punya lima langkah yang harus berurutan, yaitu periksa email belum terpakai, buat akun, buat dompet awal, kirim email verifikasi, lalu catat ke analitik. Tiap langkah bergantung pada hasil langkah sebelumnya, jadi tidak ada yang bisa dijalankan bersamaan. Yang menjadi pertanyaan bukan bagaimana menulisnya, melainkan apa yang terjadi kalau langkah keempat gagal setelah tiga langkah pertama sudah mengubah data.',
      ),
      code(
        'js',
        `
        export async function daftar({ email, sandi }) {
          const sudahAda = await cariPenggunaLewatEmail(email);
          if (sudahAda) {
            throw new ErrorValidasi('Email sudah terdaftar', 'email');
          }

          const pengguna = await buatPengguna({ email, sandi });

          try {
            await buatDompet(pengguna.id);
          } catch (penyebab) {
            // Langkah ini wajib berhasil. Bersihkan, lalu naikkan kegagalannya.
            await hapusPengguna(pengguna.id);
            throw new Error('Gagal menyiapkan akun', { cause: penyebab });
          }

          // Dua langkah terakhir TIDAK boleh menggagalkan pendaftaran.
          try {
            await kirimEmailVerifikasi(pengguna);
          } catch (penyebab) {
            catatKeLog('email verifikasi gagal', { id: pengguna.id, penyebab });
          }

          analitik.catat('pengguna_daftar', { id: pengguna.id });   // sengaja tanpa await

          return pengguna;
        }
        `,
        { filename: 'src/pendaftaran.js' },
      ),
      p(
        'Yang membuat fungsi ini layak dipelajari adalah **tiga perlakuan berbeda** untuk tiga jenis kegagalan, dan ketiganya ditulis dengan alat yang sama. Langkah pertama dan kedua dibiarkan melempar apa adanya, sebab kalau email sudah terpakai atau pembuatan akun gagal, tidak ada yang bisa dilanjutkan. Langkah ketiga dibungkus `try` karena kegagalannya menuntut pembersihan lebih dulu. Langkah keempat dibungkus `try` yang hanya mencatat, sebab email verifikasi bisa dikirim ulang nanti dan pendaftarannya sendiri sudah berhasil.',
      ),
      p(
        'Langkah kelima ditulis tanpa `await`, dan itu keputusan yang disengaja bukan kelalaian. Pencatatan analitik tidak boleh menahan respons kepada pengguna, dan kegagalannya tidak boleh mempengaruhi apa pun. Yang perlu diingat, janji tanpa `await` seperti ini kegagalannya menjadi tidak tertangani, jadi fungsi `analitik.catat` sendiri wajib punya `catch` di dalamnya. Kalau tidak, ia akan menghentikan proses di Node.js.',
      ),
      p(
        "Bentuk `new Error('Gagal menyiapkan akun', { cause: penyebab })` menyimpan error asli di dalam error baru. Pesan yang sampai ke pengguna tetap ramah, sedangkan penyebab teknisnya utuh untuk log. Tanpa `cause`, kamu harus memilih antara pesan yang berguna bagi pengguna atau pesan yang berguna bagi penelusuran, dan biasanya yang dipilih salah.",
      ),
      code(
        'js',
        `
        // Bentuk yang sama ditulis dengan then, untuk perbandingan.
        function daftarDenganThen({ email, sandi }) {
          return cariPenggunaLewatEmail(email)
            .then((sudahAda) => {
              if (sudahAda) throw new ErrorValidasi('Email sudah terdaftar', 'email');
              return buatPengguna({ email, sandi });
            })
            .then((pengguna) =>
              buatDompet(pengguna.id)
                .catch((penyebab) =>
                  hapusPengguna(pengguna.id).then(() => {
                    throw new Error('Gagal menyiapkan akun', { cause: penyebab });
                  }),
                )
                .then(() => pengguna),        // kembalikan pengguna ke rantai
            );
          // ... dan dua langkah sisanya membuatnya makin bersarang
        }
        `,
        { caption: 'Alur yang sama dengan `then`, sudah bersarang pada langkah ketiga.' },
      ),
      p(
        'Perbandingan ini memperlihatkan alasan `async` dan `await` menang untuk alur berurutan. Masalahnya bukan panjang melainkan **akses ke variabel sebelumnya**. Pada versi `await`, `pengguna` tetap terlihat sampai baris terakhir fungsi. Pada versi `then`, tiap tahap punya scope-nya sendiri, sehingga `pengguna` harus diteruskan manual lewat `.then(() => pengguna)` atau disarangkan supaya tetap terlihat. Kedua jalan keluarnya sama-sama menambah kerumitan yang tidak ada hubungannya dengan masalah aslinya.',
      ),
      callout(
        'info',
        'Kalau beberapa langkah wajib berhasil bersama, ini bukan urusan `await`',
        'Contoh di atas membersihkan secara manual dengan `hapusPengguna`, dan itu jalan keluar seadanya. Untuk operasi yang benar-benar harus berhasil atau gagal bersama, yang dibutuhkan transaksi database, bukan pengaturan `await`. Pembahasannya ada di Kategori Backend Basic pada bab basis data.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat bentuk berikut adalah kegagalan `async` dan `await` yang paling sering ditemui, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        function muat() {
          const data = await ambil();
                       ^^^^^

        SyntaxError: Unexpected reserved word
        `,
        { caption: '`await` dipakai di fungsi yang tidak `async`.' },
      ),
      p(
        'Pesannya tidak menyebut kata `await` sama sekali, dan itu yang membingungkan saat pertama kali bertemu. Yang perlu dibaca adalah **posisi tanda panahnya**, yang menunjuk tepat ke `await`. Perbaikannya menambahkan `async` di depan `function`. Perlu diingat menambahkan `async` mengubah nilai kembalian fungsi itu menjadi janji, jadi seluruh pemanggilnya juga perlu ikut menyesuaikan, dan itu sering merambat ke atas beberapa tingkat.',
      ),
      code(
        'text',
        `
        async function simpan() { throw new Error('gagal simpan'); }

        try {
          simpan();                 // tanpa await
        } catch (e) {
          console.log('tidak pernah sampai sini');
        }
        console.log('try selesai tanpa menangkap apa pun');

        try selesai tanpa menangkap apa pun
        Error: gagal simpan
        `,
        { caption: '`try` tanpa `await` tidak menangkap apa pun.' },
      ),
      p(
        'Perhatikan urutan keluarannya, yaitu pesan dari `console.log` muncul **sebelum** errornya. Tanpa `await`, `simpan()` hanya mengembalikan janji dan blok `try` langsung selesai. Kegagalannya baru terjadi setelah itu, saat tidak ada lagi `try` yang aktif. Ini salah satu bug paling sering pada kode `async`, dan karena `try`-nya terlihat ada, tinjauan kode sekilas justru meloloskannya.',
      ),
      code(
        'text',
        `
        async function total() {
          const a = await hargaA();
          const b = await hargaB();
          return a + b;
        }

        const t = total();
        console.log(t.toFixed(2));
                      ^

        TypeError: t.toFixed is not a function
        `,
        { caption: 'Nilai kembalian fungsi `async` selalu janji.' },
      ),
      p(
        'Fungsi `async` **selalu** mengembalikan janji, bahkan kalau `return`-nya berupa angka biasa. Nilai `t` di atas adalah janji, dan janji tidak punya `toFixed`. Kalau kamu melihat `[object Promise]` di layar atau error seperti ini, tersangka pertamanya selalu `await` yang lupa ditulis di titik pemanggilan.',
      ),
      code(
        'text',
        `
        for (const id of daftarId) {
          await kirimEmail(id);      // 200 email, masing-masing 300 ms
        }

        // Tidak ada error. Selesai setelah 60 detik.
        `,
        { caption: 'Operasi yang sebenarnya independen dijalankan berurutan.' },
      ),
      p(
        'Ini bukan error melainkan pemborosan yang tidak berbunyi, dan ia sangat sering muncul justru karena `await` di dalam loop terbaca sangat wajar. Kalau tiap panggilan tidak bergantung pada hasil panggilan sebelumnya, bentuk yang benar adalah menjalankannya bersamaan, dan itu topik Sub-bab 3.7. Kalau memang harus berurutan, misalnya karena batas laju permintaan penyedia, bentuk ini benar dan layak diberi komentar yang menyebut alasannya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`SyntaxError: Unexpected reserved word`',
            '`await` dipakai di fungsi tanpa `async`',
            'Tambahkan `async`, lalu sesuaikan pemanggilnya',
          ],
          [
            '`try` tidak menangkap kegagalan',
            '`await` tidak ditulis, jadi `try` selesai sebelum kegagalannya terjadi',
            'Tambahkan `await` pada pemanggilan di dalam `try`',
          ],
          [
            '`[object Promise]` atau `x is not a function`',
            'Hasil fungsi `async` dipakai tanpa `await`',
            'Tambahkan `await`, atau rangkaikan `then`',
          ],
          [
            'Alur berjalan jauh lebih lama daripada perkiraan',
            '`await` di dalam loop untuk operasi yang independen',
            'Jalankan bersamaan dengan `Promise.all`, lihat Sub-bab 3.7',
          ],
          [
            '`Uncaught (in promise)` dari fungsi yang punya `try`',
            'Ada pemanggilan `async` lain di fungsi itu yang tidak di-`await`',
            'Telusuri pemanggilan yang hasilnya tidak dipakai sama sekali',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`async` dan `await` membuat kode asinkron terbaca seperti kode sinkron, dan justru kemiripan itu yang menjadi sumber kesalahan. Enam baris di bawah semuanya berasal dari memperlakukannya benar-benar sinkron.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `async` ke setiap fungsi untuk berjaga-jaga',
            'Tidak ada ruginya',
            'Nilai kembaliannya berubah menjadi janji, sehingga seluruh pemanggilnya wajib menyesuaikan. Tambahkan `async` hanya kalau di dalamnya benar-benar ada `await`',
          ],
          [
            'Memakai `await` pada nilai yang bukan janji',
            'Ia tetap bekerja dan hasilnya benar',
            'Benar, tapi ia tetap menunda sisanya ke antrean microtask tanpa alasan. Di dalam loop panjang, penundaan itu menumpuk',
          ],
          [
            'Memakai `await` di dalam `forEach`',
            'Bentuknya sama dengan loop lain',
            '`forEach` tidak menunggu, sehingga seluruh pekerjaan berjalan bersamaan dan fungsi luarnya selesai lebih dulu. Pakai `for...of`',
          ],
          [
            'Membungkus seluruh isi fungsi dalam satu `try` besar',
            'Semua kegagalan jadi tertangani',
            'Kamu kehilangan informasi langkah mana yang gagal, dan perlakuannya terpaksa seragam. Bungkus per langkah yang memang butuh perlakuan berbeda',
          ],
          [
            'Menganggap `await` menghentikan seluruh program',
            'Baris di bawahnya memang menunggu',
            'Yang berhenti hanya fungsi itu. Kode lain, penangan klik, dan timer tetap berjalan, dan itu sumber race condition yang dibahas di Sub-bab 3.11',
          ],
          [
            'Menaruh `await` di dalam blok `finally` untuk membersihkan',
            'Pembersihan memang perlu ditunggu',
            'Sah, tapi kalau `await` di `finally` melempar, kegagalan aslinya tertimpa. Bungkus isi `finally` dengan `try` sendiri',
          ],
        ],
      ),
      p(
        'Baris kelima adalah pemahaman yang paling menentukan untuk bab-bab berikutnya. `await` menghentikan **fungsi tempat ia ditulis**, bukan aplikasinya. Selama sebuah fungsi menunggu, pengguna masih bisa mengklik tombol lain, timer masih berjalan, dan respons lain masih bisa tiba. Dua alur yang mengubah data yang sama bisa saling menimpa, dan itu bukan kasus langka melainkan kejadian sehari-hari pada kotak pencarian dan formulir yang bisa disimpan dua kali.',
      ),
      callout(
        'tip',
        'Aturan tiga baris untuk `await`',
        'Tulis `await` kalau baris berikutnya benar-benar membutuhkan hasilnya. Jangan tulis `await` di dalam loop kalau tiap putaran tidak saling bergantung. Dan kalau kamu sengaja tidak menulis `await`, pastikan janji itu punya `catch`-nya sendiri, atau tandai dengan komentar supaya pembaca berikutnya tahu itu disengaja.',
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
    24,
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
            'Semua pekerjaan **dimulai bersamaan**, lalu hasilnya ditunggu sekaligus. Perlu diluruskan sedikit: JavaScript tetap berutas tunggal, jadi yang benar-benar berjalan bersamaan adalah **penantiannya**, sebab jaringan dan berkas dikerjakan runtime di luar. Untuk pekerjaan yang menunggu, efeknya sama saja, karena total waktu turun dari jumlah semuanya menjadi sepanjang yang paling lambat.',
        },
        {
          term: 'Promise.all',
          meaning:
            'Menunggu **semua** Promise selesai dan mengembalikan array hasilnya dengan urutan yang sama seperti masukannya. Sifat pentingnya adalah **satu saja gagal, seluruhnya langsung gagal**, yaitu perilaku *fail-fast*. Pakai ini ketika semua hasil memang wajib ada, sedangkan kalau sebagian boleh gagal, pakai `allSettled`.',
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
      p(
        'Perbedaan 900 ms versus 300 ms itu berasal dari **kapan permintaannya dimulai**, bukan dari kecepatan jaringan. Pada versi berurutan, `ambilProduk()` bahkan belum dipanggil ketika `ambilPengguna()` sedang berjalan, sebab `await` menahan seluruh badan fungsi di baris pertama, jadi ketiganya antre satu per satu. Pada versi paralel, ketiga fungsi dipanggil **di dalam array**, artinya ketiganya berangkat pada saat yang hampir bersamaan, dan `Promise.all` hanya menunggu ketiganya rampung. Karena itu total waktunya kira-kira sama dengan yang paling lambat, bukan jumlah ketiganya. Perhatikan destructuring `[pengguna, produk, berita]` di sisi kiri, sebab hasilnya selalu mengikuti **urutan penulisan di array**, bukan urutan siapa yang selesai lebih dulu, sehingga kamu tidak perlu khawatir data tertukar meski salah satunya jauh lebih lambat.',
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
      p(
        'Dua komentar di blok ini menyimpan hal yang paling sering disalahpahami tentang `Promise.all`. Yang pertama sudah disebut di atas, yaitu urutan hasil selalu mengikuti urutan masukan. Yang kedua jauh lebih penting untuk diingat, karena ketika satu promise gagal, `Promise.all` **langsung menolak** tapi promise lainnya tidak dihentikan sama sekali. Permintaan jaringannya tetap berjalan sampai tuntas, penulisan ke database tetap terjadi, dan hanya hasilnya saja yang tidak pernah kamu terima. Jadi `Promise.all` bukan mekanisme pembatalan, sehingga kalau kamu benar-benar perlu menghentikan pekerjaan yang sedang berjalan, itu tugas `AbortController` di sub-bab berikutnya. Sifat "semua atau tidak sama sekali" ini tepat ketika ketiga data memang wajib ada untuk menggambar halaman, dan justru salah ketika sebagian data masih berguna sendirian.',
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
      p(
        'Keduanya sama-sama "yang tercepat menang", tapi berbeda pada **apa yang dianggap menang**. `Promise.race` menerima hasil pertama apa pun jenisnya, baik berhasil maupun gagal, dan justru sifat itulah yang membuat pola timeout di atas bekerja. `tunggu(5000)` yang melempar error diadu dengan `ambilData()`, sehingga siapa pun yang lebih dulu tiba menentukan hasilnya. Kalau datanya tiba dalam 5 detik ia menang, dan kalau tidak, error timeout yang menang. `Promise.any` sebaliknya mengabaikan kegagalan dan menunggu **keberhasilan** pertama, jadi ia cocok untuk beberapa server cadangan yang sama-sama bisa melayani. Ia baru menyerah kalau semuanya gagal, dan errornya berupa `AggregateError`, yaitu satu error khusus yang menampung seluruh kegagalan di property `errors` sehingga kamu bisa memeriksa alasan tiap server dan bukan hanya salah satunya.',
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
      p(
        '`forEach` tidak pernah memeriksa apa yang dikembalikan callback-nya, sebab ia memanggil callback untuk tiap elemen lalu langsung lanjut ke elemen berikutnya, tanpa peduli apakah hasilnya berupa Promise atau bukan. Karena `async (id) => { await proses(id); }` selalu mengembalikan Promise, `forEach` memanggil semuanya nyaris bersamaan lalu langsung selesai, sementara Promise-Promise yang baru dimulai itu masih berjalan di latar belakang, tak tertunggu oleh siapa pun. `Promise.all(daftar.map(...))` bekerja karena `map` **mengumpulkan** seluruh Promise ke dalam satu array, yang kemudian benar-benar ditunggu oleh `Promise.all`.',
      ),
      callout(
        'warning',
        'Paralel tidak selalu benar',
        'Seribu permintaan sekaligus akan ditolak server atau kena rate limit. Untuk daftar besar, batasi jumlah yang berjalan bersamaan — proses per kelompok, atau pakai library pembatas konkurensi.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail produk butuh empat potong data, yaitu data produk itu sendiri, daftar ulasan, jumlah stok, dan daftar rekomendasi. Keempatnya datang dari endpoint yang berbeda dan tidak ada satu pun yang membutuhkan hasil yang lain. Ditulis apa adanya dengan empat `await` berurutan, halaman terasa lambat padahal tiap panggilan sendiri cepat.',
      ),
      p(
        'Angkanya bisa diukur, dan pengukuran di bawah memakai penundaan tiruan yang meniru latensi nyata, yaitu 120, 150, 90, dan 200 milidetik.',
      ),
      code(
        'js',
        `
        const tunda = (ms, nilai) => new Promise((r) => setTimeout(() => r(nilai), ms));
        const ambilProduk = () => tunda(120, { nama: 'Kaos' });
        const ambilUlasan = () => tunda(150, [1, 2, 3]);
        const ambilStok = () => tunda(90, 12);
        const ambilRekomendasi = () => tunda(200, ['A', 'B']);

        // BERURUTAN — tiap await menunggu yang sebelumnya selesai.
        let t = performance.now();
        const a1 = await ambilProduk();
        const a2 = await ambilUlasan();
        const a3 = await ambilStok();
        const a4 = await ambilRekomendasi();
        console.log('berurutan :', Math.round(performance.now() - t), 'ms');
        // berurutan : 562 ms

        // PARALEL — keempatnya dimulai bersamaan.
        t = performance.now();
        const [b1, b2, b3, b4] = await Promise.all([
          ambilProduk(), ambilUlasan(), ambilStok(), ambilRekomendasi(),
        ]);
        console.log('paralel   :', Math.round(performance.now() - t), 'ms');
        // paralel   : 200 ms
        `,
        { filename: 'Diukur sungguhan, bukan diperkirakan' },
      ),
      p(
        'Selisihnya 562 melawan 200 milidetik, dan dua angka itu punya arti yang berbeda. Versi berurutan memakan **jumlah** seluruh waktu, yaitu 120 ditambah 150 ditambah 90 ditambah 200. Versi paralel memakan waktu yang **terlama** saja, yaitu 200. Aturan itu berlaku umum, dan artinya menambah satu panggilan lagi ke versi paralel hampir tidak menambah waktu selama panggilan baru itu tidak lebih lambat dari yang terlama.',
      ),
      p(
        'Yang membuat `Promise.all` bekerja adalah keempat fungsi **dipanggil lebih dulu**, baru hasilnya dikumpulkan. Tanda kurung pemanggilan ada di dalam array, sehingga saat baris itu dijalankan keempat permintaan sudah melayang bersamaan. Ini bagian yang sering salah, dan bentuk `Promise.all([ambilProduk, ambilUlasan])` tanpa tanda kurung justru tidak memanggil apa pun.',
      ),
      code(
        'js',
        `
        // Masalah Promise.all: satu gagal, semuanya hilang.
        // Rekomendasi hanya pelengkap, jadi kegagalannya tidak boleh
        // mengosongkan seluruh halaman.
        const [produk, ulasan, stok, rekomendasi] = await Promise.all([
          ambilProduk(),
          ambilUlasan(),
          ambilStok(),
          ambilRekomendasi().catch(() => []),   // pelengkap, boleh gagal
        ]);
        `,
        { caption: 'Memberi `catch` sendiri pada bagian yang boleh gagal.' },
      ),
      code(
        'js',
        `
        // Alternatifnya allSettled kalau BANYAK bagian boleh gagal.
        const hasil = await Promise.allSettled([ambilProduk(), ambilUlasan(), ambilStok()]);
        // 120 ms, dan tidak ada yang membatalkan yang lain

        const [produk, ulasan, stok] = hasil.map((h) =>
          h.status === 'fulfilled' ? h.value : null,
        );

        for (const h of hasil) {
          if (h.status === 'rejected') catatKeLog('bagian halaman gagal', h.reason);
        }
        `,
        { caption: '`allSettled` selalu berhasil, dan tiap hasilnya menyebut statusnya sendiri.' },
      ),
      p(
        'Perbedaan keduanya menentukan pilihan, dan aturannya bisa diringkas. Pakai `Promise.all` kalau **semua** bagian wajib ada untuk halaman bisa berarti, misalnya data produk dan harganya. Pakai `allSettled` kalau sebagian bagian hanya pelengkap dan halaman tetap berguna tanpanya, misalnya rekomendasi dan ulasan. Kalau hanya satu bagian yang boleh gagal, memberi `catch` sendiri pada bagian itu lebih ringkas daripada memindahkan semuanya ke `allSettled`.',
      ),
      p(
        'Perhatikan bentuk hasil `allSettled` yang berbeda dari `all`. Ia selalu berupa array object berisi `status`, ditambah `value` untuk yang berhasil atau `reason` untuk yang gagal. Ia tidak pernah menolak, sehingga `try` di sekitarnya tidak akan pernah berjalan. Yang sering salah adalah memperlakukan hasilnya seperti hasil `all`, dan membaca `hasil[0].nama` alih-alih `hasil[0].value.nama`.',
      ),
      callout(
        'warning',
        'Paralel bukan berarti tanpa batas',
        'Menjalankan lima panggilan bersamaan bagus. Menjalankan lima ratus bersamaan justru memperlambat semuanya, sebab peramban membatasi jumlah koneksi per domain dan sisanya mengantre. Server juga bisa menganggapnya serangan lalu memblokirmu. Untuk daftar panjang, olah per kelompok, misalnya sepuluh sekaligus.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Menjalankan banyak hal bersamaan menghasilkan kegagalan yang bentuknya berbeda dari kegagalan berurutan, terutama karena satu kegagalan bisa menutupi yang lain.',
      ),
      code(
        'text',
        `
        const r = await Promise.all([
          Promise.resolve(1),
          Promise.reject(new Error('B gagal')),
          Promise.resolve(3),
        ]);

        Error: B gagal
        `,
        { caption: 'Satu penolakan membatalkan seluruh hasil.' },
      ),
      p(
        '`Promise.all` menolak begitu **salah satu** anggotanya menolak, dan nilai dari anggota yang sudah berhasil ikut hilang. Yang perlu diingat, anggota lain **tidak dibatalkan**. Permintaan jaringan yang sudah melayang tetap berjalan sampai selesai, hanya hasilnya tidak lagi dipakai siapa pun. Kalau kamu memang ingin membatalkannya, itu tugas `AbortController` yang dibahas di sub-bab berikutnya.',
      ),
      code(
        'text',
        `
        const hasil = await Promise.allSettled([ambilProduk(), gagal()]);
        console.log(hasil[0].nama);
                              ^

        undefined
        `,
        { caption: 'Bentuk hasil `allSettled` berbeda dari `all`.' },
      ),
      p(
        'Tiap anggota hasil `allSettled` adalah object pembungkus, bukan nilainya langsung. Yang berhasil punya `status` bernilai `fulfilled` dan `value`, sedangkan yang gagal punya `status` bernilai `rejected` dan `reason`. Karena tidak ada error yang dilempar, kesalahan membaca seperti ini menghasilkan `undefined` dan merambat ke tempat lain. Selalu petakan hasilnya lebih dulu sebelum dipakai.',
      ),
      code(
        'text',
        `
        await Promise.any([Promise.reject(new Error('a')), Promise.reject(new Error('b'))]);

        AggregateError: All promises were rejected
        `,
        { caption: '`Promise.any` menolak hanya kalau semuanya gagal.' },
      ),
      p(
        'Pesan `AggregateError` tidak menyebut satu pun penyebab aslinya, dan itu sering membingungkan. Penyebab lengkapnya ada di properti `errors`, yaitu array berisi seluruh error dari anggota yang gagal. Saat mencatat kegagalan `Promise.any`, cetak `e.errors.map((x) => x.message)` supaya lognya berguna, sebab pesan bawaannya sendiri tidak memberi tahu apa pun.',
      ),
      code(
        'text',
        `
        const hasil = await Promise.all(daftar.map(async (x) => olah(x)));
        // 5.000 permintaan berangkat bersamaan

        TypeError: Failed to fetch
        `,
        { caption: 'Terlalu banyak permintaan bersamaan sampai peramban menyerah.' },
      ),
      p(
        'Bentuk `Promise.all(arr.map(async ...))` sangat ringkas dan sangat mudah disalahgunakan. Untuk lima elemen ia sempurna, sedangkan untuk lima ribu ia membanjiri peramban dan server sekaligus. Gejalanya bermacam-macam, mulai dari `Failed to fetch`, respons 429 dari server, sampai halaman yang membeku. Untuk daftar yang panjangnya tidak kamu kendalikan, olah per kelompok dengan ukuran tetap.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Seluruh data hilang padahal hanya satu bagian gagal',
            '`Promise.all` menolak begitu ada satu yang menolak',
            'Beri `catch` pada bagian pelengkap, atau pakai `allSettled`',
          ],
          [
            'Nilai dari `allSettled` selalu `undefined`',
            'Hasilnya berupa object pembungkus, bukan nilainya',
            'Baca lewat `.value`, dan periksa `.status` lebih dulu',
          ],
          [
            '`AggregateError: All promises were rejected`',
            'Seluruh anggota `Promise.any` gagal',
            'Cetak `e.errors` untuk melihat penyebab masing-masing',
          ],
          [
            '`Failed to fetch` atau 429 saat memproses daftar panjang',
            'Terlalu banyak permintaan berangkat bersamaan',
            'Olah per kelompok dengan ukuran tetap',
          ],
          [
            '`Promise.all` selesai seketika dengan hasil aneh',
            'Fungsinya diberikan tanpa tanda kurung, jadi isinya bukan janji',
            'Panggil fungsinya di dalam array, yaitu `f()` bukan `f`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan terbesar di sub-bab ini bukan memilih fungsi yang salah melainkan salah menilai apakah dua operasi benar-benar saling bergantung.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `await` berurutan untuk panggilan yang independen',
            'Terbaca rapi dari atas ke bawah',
            'Waktunya menjadi jumlah seluruhnya, bukan yang terlama. Empat panggilan 150 milidetik menjadi 600 milidetik',
          ],
          [
            'Memberikan nama fungsi tanpa tanda kurung ke `Promise.all`',
            'Bentuknya mirip memberikan callback',
            '`Promise.all` menerima nilai, bukan fungsi. Nilai yang bukan janji langsung dianggap selesai, jadi ia selesai seketika tanpa memanggil apa pun',
          ],
          [
            'Memakai `Promise.all` untuk operasi yang saling bergantung',
            'Keduanya kan sama-sama perlu dijalankan',
            'Kalau yang kedua butuh hasil yang pertama, ia harus berurutan. Paralel hanya untuk yang benar-benar independen',
          ],
          [
            'Memakai `Promise.race` untuk mengambil yang tercepat dari beberapa server',
            'Namanya memang balapan',
            '`race` juga menyelesaikan diri pada **penolakan** pertama, jadi satu server yang gagal cepat mengalahkan yang berhasil lambat. Untuk keberhasilan pertama, pakai `Promise.any`',
          ],
          [
            'Menganggap `Promise.all` membatalkan sisanya saat satu gagal',
            'Hasilnya toh sudah tidak dipakai',
            'Semuanya tetap berjalan sampai selesai. Untuk membatalkan sungguhan, butuh `AbortController`',
          ],
          [
            'Menjalankan seluruh isi array secara paralel tanpa memeriksa panjangnya',
            'Untuk data uji yang sepuluh baris memang cepat',
            'Panjang array di produksi sering ribuan. Batasi jumlah yang berjalan bersamaan',
          ],
        ],
      ),
      p(
        'Baris pertama punya cara pemeriksaan yang sangat cepat. Baca dua baris `await` yang berurutan, lalu tanyakan apakah baris kedua memakai variabel dari baris pertama. Kalau tidak, keduanya seharusnya paralel. Pemeriksaan sepuluh detik itu sering memangkas separuh waktu muat sebuah halaman, dan ia salah satu perbaikan performa dengan rasio hasil terhadap usaha yang paling tinggi.',
      ),
      callout(
        'tip',
        'Pola pengelompokan untuk daftar panjang',
        'Potong daftarnya menjadi kelompok berukuran tetap dengan `slice`, lalu jalankan `Promise.all` per kelompok di dalam `for...of`. Bentuk itu menjaga jumlah permintaan bersamaan tetap terkendali sambil tetap jauh lebih cepat daripada satu per satu, dan ia cukup pendek untuk ditulis ulang setiap kali tanpa pustaka tambahan.',
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
    22,
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
            'Error yang dilempar operasi ketika ia dibatalkan. Yang wajib diingat, **ini bukan kegagalan** melainkan akibat dari perintahmu sendiri. Karena itu jangan pernah menampilkannya sebagai pesan error ke pengguna, dan periksa `e.name === "AbortError"` lebih dulu lalu keluar diam-diam.',
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
      p(
        "Mekanismenya terbagi dua benda yang sengaja dipisah. `controller` adalah **kendalinya**, dan hanya ia yang punya method `abort()`. `controller.signal` adalah **penerimanya**, yaitu objek pasif yang diserahkan ke `fetch` dan bisa dibagikan ke banyak permintaan sekaligus tanpa memberi mereka kemampuan membatalkan apa pun. Pemisahan itu membuat kode yang menjalankan permintaan tidak bisa membatalkan dirinya sendiri, karena keputusan itu tetap di tangan pemanggil. Ketika `abort()` dipanggil, promise dari `fetch` **ditolak** dan bukan diselesaikan, jadi jalur yang dilewati adalah `.catch()`, sama seperti kegagalan jaringan sungguhan. Karena itu pemeriksaan `e.name === 'AbortError'` wajib ada di baris pertama, sebab tanpa itu pembatalan yang kamu lakukan sendiri akan muncul di layar pengguna sebagai pesan kesalahan.",
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
      p(
        '`AbortSignal.timeout(5000)` adalah pintasan yang membuat sinyal siap pakai tanpa perlu membuat `AbortController` dan `setTimeout` sendiri, karena sinyalnya membatalkan dirinya otomatis setelah 5 detik. `AbortSignal.any([...])` menggabungkan beberapa sinyal menjadi satu, dan gabungan itu ikut membatalkan begitu **salah satu** anggotanya membatalkan. Kombinasi keduanya menyelesaikan kebutuhan yang sangat umum, yaitu permintaan harus berhenti kalau server terlalu lambat **atau** kalau pengguna berpindah halaman lebih dulu, dan kamu tidak perlu menulis logika mana yang lebih dulu terjadi. Perlu dicatat kedua API ini relatif baru, sehingga pada lingkungan lama cara setaranya adalah membuat `AbortController` sendiri lalu memanggil `abort()` dari dalam `setTimeout`.',
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
      p(
        'Baris `return () => controller.abort()` adalah **fungsi pembersihan**, dan React menjalankannya saat komponen dilepas dari layar atau sebelum efek yang sama dijalankan ulang. Tanpa itu, permintaan yang sudah terlanjur berangkat akan tetap tiba dan memanggil `setData` pada komponen yang sudah tidak ada lagi. Pekerjaannya sia-sia, dan pada pola tertentu ia menahan data komponen lama tetap di memori. Perhatikan `controller` dibuat **di dalam** efek dan bukan di luar, sebab tiap kali efek berjalan ia butuh controller barunya sendiri karena controller yang sudah dibatalkan tidak bisa dipakai ulang. Dan seperti pada contoh dasar tadi, `catch`-nya menyaring `AbortError` lebih dulu, karena pembatalan yang kita sengaja lakukan tidak boleh berakhir sebagai pesan error di layar.',
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
      p(
        '`signal.throwIfAborted()` memeriksa apakah controller-nya sudah dibatalkan, dan kalau ya, langsung melempar `AbortError` di titik itu juga — menghentikan loop sebelum item berikutnya sempat diproses. Menaruhnya di **awal setiap iterasi**, bukan di tengah atau di dalam `proses(item)`, memastikan pembatalan diperiksa di titik yang aman dan bisa diprediksi, bukan di sembarang baris yang kebetulan sedang berjalan saat `abort()` dipanggil.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kotak pencarian produk memanggil server tiap kali pengguna berhenti mengetik. Dengan debounce dari Bab 1, jumlah panggilannya sudah jauh berkurang. Yang belum selesai adalah masalah kedua, yaitu pengguna mengetik kaos lalu melanjutkan menjadi kaos polos, dan jaringan sedang tidak stabil sehingga jawaban untuk kaos justru datang belakangan. Layar menampilkan hasil yang salah, dan pengguna melihat daftarnya berkedip ke isi lama.',
      ),
      p(
        'Ada dua tingkat perbaikan. Tingkat pertama membuang hasil yang sudah usang, dan itu sudah dibahas di Bab 1 dengan penomoran antrean. Tingkat kedua lebih baik, yaitu **membatalkan permintaannya** sehingga jaringan dan server tidak lagi mengerjakan sesuatu yang tidak akan dipakai.',
      ),
      code(
        'js',
        `
        let kendaliTerakhir = null;

        export async function cari(kata, { batasMs = 8000 } = {}) {
          // Batalkan pencarian sebelumnya, kalau masih berjalan.
          kendaliTerakhir?.abort(new DOMException('Pencarian baru dimulai', 'AbortError'));

          const kendali = new AbortController();
          kendaliTerakhir = kendali;

          // Gabungkan dua alasan berhenti: dibatalkan manual, atau kehabisan waktu.
          const sinyal = AbortSignal.any([kendali.signal, AbortSignal.timeout(batasMs)]);

          try {
            const respons = await fetch(\`/api/cari?q=\${encodeURIComponent(kata)}\`, { signal: sinyal });
            if (!respons.ok) throw new Error(\`Server menjawab \${respons.status}\`);
            return await respons.json();
          } catch (galat) {
            if (galat.name === 'AbortError') return null;      // sengaja dibatalkan, bukan bug
            if (galat.name === 'TimeoutError') {
              throw new Error(\`Pencarian melebihi \${batasMs} ms\`, { cause: galat });
            }
            throw galat;
          }
        }
        `,
        { filename: 'src/cari.js' },
      ),
      p(
        'Baris `kendaliTerakhir?.abort(...)` di awal adalah inti polanya. Setiap pencarian baru membatalkan pendahulunya sebelum memulai dirinya sendiri, sehingga hanya ada satu permintaan hidup pada satu waktu. Tanda tanya di depan `abort` menangani pemanggilan pertama saat belum ada pendahulu. Memberi alasan berupa `DOMException` bernama `AbortError` membuat penanganan di `catch` bisa membedakan pembatalan yang disengaja dari kegagalan sungguhan.',
      ),
      p(
        '`AbortSignal.any([...])` menggabungkan beberapa sinyal menjadi satu yang berhenti begitu **salah satu** anggotanya berhenti. Di sini alasannya dua, yaitu pengguna mengetik lagi atau permintaannya kelewat lama. Tanpa penggabungan ini, kamu perlu mengatur timer sendiri lalu memanggil `abort` dari dalamnya, dan itu lebih panjang sekaligus lebih mudah bocor.',
      ),
      p(
        'Bagian `catch` memisahkan tiga jenis akhir dengan tiga perlakuan. `AbortError` mengembalikan `null` tanpa melempar, sebab pembatalan yang kamu lakukan sendiri bukan kesalahan yang perlu ditampilkan kepada pengguna. `TimeoutError` diubah menjadi pesan yang menyebut batas waktunya, dengan error aslinya disimpan di `cause`. Sisanya dilempar apa adanya. Pemanggil yang menerima `null` cukup tidak melakukan apa pun, sebab pasti ada pencarian yang lebih baru sedang berjalan.',
      ),
      code(
        'js',
        `
        // Membatalkan saat komponen ditutup, supaya tidak menulis ke DOM yang sudah hilang.
        function pasangPencarian(elemen) {
          const kendali = new AbortController();

          // addEventListener juga menerima signal, dan itu melepas listener otomatis.
          elemen.addEventListener('input', tangani, { signal: kendali.signal });
          window.addEventListener('resize', aturLebar, { signal: kendali.signal });

          // Satu panggilan melepas SEMUA listener yang memakai sinyal ini.
          return () => kendali.abort();
        }
        `,
        { caption: '`AbortController` juga melepas penangan peristiwa, bukan hanya `fetch`.' },
      ),
      p(
        'Kemampuan ini jarang diketahui dan sangat menghemat kode. Dengan memberikan `signal` ke `addEventListener`, satu panggilan `abort` melepas seluruh listener yang memakai sinyal itu sekaligus. Ini menggantikan daftar `removeEventListener` yang panjang, dan sekaligus menutup masalah dari Bab 2 yaitu `removeEventListener` yang gagal karena rujukan fungsinya berbeda. Pola ini persis yang dipakai fungsi pembersih `useEffect` di React.',
      ),
      callout(
        'warning',
        'Membatalkan `fetch` tidak selalu membatalkan pekerjaan di server',
        'Pembatalan memutus koneksi dari sisi peramban. Server yang sudah mulai memproses permintaan biasanya tetap menyelesaikannya, dan untuk operasi yang mengubah data itu berarti perubahannya tetap terjadi. Jangan pernah mengandalkan `abort` untuk membatalkan sebuah pembayaran atau penyimpanan. Untuk itu, yang dibutuhkan kunci idempoten di sisi server.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pembatalan menghasilkan error yang **disengaja**, dan kesalahan terbesar biasanya memperlakukannya sebagai kegagalan sungguhan.',
      ),
      code(
        'text',
        `
        const c = new AbortController();
        c.abort();
        await fetch(url, { signal: c.signal });

        AbortError: This operation was aborted
        `,
        { caption: 'Pembatalan muncul sebagai error yang dilempar `fetch`.' },
      ),
      p(
        "Yang perlu dipegang, ini bukan bug melainkan cara `fetch` memberi tahu bahwa permintaannya berhenti. Kalau `catch`-mu tidak membedakannya, pengguna akan melihat pesan gagal setiap kali ia mengetik satu huruf lagi, padahal yang terjadi justru sistem bekerja sebagaimana mestinya. Periksa `galat.name === 'AbortError'` sebagai baris pertama di dalam `catch`.",
      ),
      code(
        'text',
        `
        await fetch(url, { signal: AbortSignal.timeout(300) });

        TimeoutError: The operation was aborted due to timeout
        `,
        { caption: 'Kehabisan waktu punya nama error yang berbeda.' },
      ),
      p(
        'Sejak `AbortSignal.timeout` tersedia, pembatalan karena waktu punya nama tersendiri, yaitu `TimeoutError`, terpisah dari `AbortError`. Perbedaan itu berguna, sebab keduanya menuntut tanggapan yang berbeda. Pembatalan manual berarti sudah ada permintaan baru dan tidak perlu berbuat apa-apa. Kehabisan waktu berarti jaringan atau server bermasalah, dan pengguna perlu diberi tahu beserta tombol coba lagi.',
      ),
      code(
        'text',
        `
        const kendali = new AbortController();
        kendali.abort();
        const kedua = new AbortController();
        await fetch(url, { signal: kendali.signal });   // salah sinyal

        AbortError: This operation was aborted
        `,
        { caption: 'Sinyal lama dipakai untuk permintaan baru.' },
      ),
      p(
        'Sebuah `AbortController` hanya bisa dipakai satu kali, sebab begitu ia dibatalkan, sinyalnya selamanya berada di keadaan dibatalkan. Permintaan baru yang diberi sinyal itu langsung gagal sebelum sempat berangkat. Kesalahan ini muncul saat controller dibuat sekali di luar fungsi lalu dipakai berulang. Buat controller **baru** untuk tiap permintaan, seperti pada studi kasus di atas.',
      ),
      code(
        'text',
        `
        const respons = await fetch(url, { signal });
        const data = await respons.json();   // dibatalkan di antara dua baris ini

        AbortError: BodyStreamBuffer was aborted
        `,
        { caption: 'Pembatalan bisa terjadi saat badan respons sedang dibaca.' },
      ),
      p(
        'Pembatalan tidak hanya berlaku untuk permintaan yang belum dijawab, melainkan juga untuk pembacaan badan responsnya. Pesannya berbeda, tapi `name`-nya tetap `AbortError`, sehingga pemeriksaan berbasis `name` tetap menangkapnya. Ini alasan lain untuk memeriksa `name` alih-alih mencocokkan teks pesan, sebab teks pesannya berbeda antar-peramban dan antar-tahap.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`AbortError: This operation was aborted`',
            'Permintaan sengaja dibatalkan',
            "Periksa `galat.name === 'AbortError'` lalu keluar diam-diam",
          ],
          [
            '`TimeoutError: The operation was aborted due to timeout`',
            'Batas waktu tercapai',
            'Tampilkan pesan beserta tombol coba lagi',
          ],
          [
            'Permintaan gagal langsung sebelum berangkat',
            'Controller yang sudah dibatalkan dipakai ulang',
            'Buat `AbortController` baru untuk tiap permintaan',
          ],
          [
            '`AbortError: BodyStreamBuffer was aborted`',
            'Pembatalan terjadi saat badan respons dibaca',
            'Perlakukan sama, sebab `name`-nya tetap `AbortError`',
          ],
          [
            'Pesan gagal muncul tiap kali pengguna mengetik',
            'Pembatalan diperlakukan seperti kegagalan sungguhan',
            'Bedakan berdasarkan `name` sebelum menampilkan apa pun',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pembatalan sering dianggap penyempurnaan yang bisa ditunda. Untuk halaman yang punya kotak pencarian atau navigasi cepat, ia justru bagian dari perilaku yang benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai satu `AbortController` untuk seluruh umur halaman',
            'Cukup satu, lebih sederhana',
            'Sekali dibatalkan ia mati selamanya, sehingga seluruh permintaan sesudahnya langsung gagal. Buat satu per permintaan',
          ],
          [
            'Menampilkan pesan error untuk setiap kegagalan `fetch`',
            'Semua kegagalan kan perlu diberitahukan',
            'Pembatalan yang kamu lakukan sendiri ikut ditampilkan, sehingga pengguna melihat error saat ia hanya mengetik lebih lanjut',
          ],
          [
            'Mengandalkan debounce saja tanpa pembatalan',
            'Jumlah panggilan sudah jauh berkurang',
            'Permintaan yang sudah berangkat tetap bisa datang tidak berurutan. Debounce mengurangi jumlah, pembatalan menjaga urutan',
          ],
          [
            'Membatalkan permintaan yang mengubah data untuk membatalkan aksinya',
            'Permintaannya kan berhenti',
            'Server bisa sudah memprosesnya. Pembatalan hanya memutus koneksi, bukan membatalkan pekerjaan',
          ],
          [
            'Lupa memasang batas waktu karena jaringan lokal selalu cepat',
            'Belum pernah ada yang menggantung',
            'Permintaan tanpa batas waktu bisa menggantung selamanya di jaringan seluler yang buruk, dan indikator memuat tidak pernah berhenti',
          ],
          [
            'Memeriksa jenis kegagalan dengan mencocokkan teks pesannya',
            'Pesannya jelas menyebut aborted',
            'Teks pesan berbeda antar-peramban dan antar-tahap. Periksa `galat.name`',
          ],
        ],
      ),
      p(
        'Baris ketiga menjelaskan kenapa debounce dan pembatalan bukan dua pilihan melainkan dua bagian dari satu solusi. Debounce mengurangi **jumlah** permintaan, dan itu menghemat kuota serta beban server. Pembatalan menjamin **urutan**, yaitu hanya hasil dari permintaan terbaru yang boleh sampai ke layar. Kotak pencarian yang benar memakai keduanya, dan tanpa salah satunya masih ada kelas bug yang tersisa.',
      ),
      callout(
        'tip',
        'Nilai batas waktu yang masuk akal untuk dipakai sebagai titik awal',
        'Untuk permintaan yang menghalangi tampilan, sekitar 8 sampai 10 detik sudah termasuk lama bagi pengguna. Untuk unggah berkas besar, batasnya harus jauh lebih longgar atau diganti dengan pemantauan kemajuan. Yang penting bukan angkanya melainkan adanya batas, sebab tanpa batas keadaan memuat tidak punya jalan keluar sama sekali.',
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
    21,
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
      p(
        'Blok ini sengaja tidak berisi kode, karena masalahnya bukan pada satu klien melainkan pada **perilaku kolektif ribuan klien sekaligus**. Bayangkan server tersendat sesaat. Semua klien gagal pada waktu yang hampir sama, lalu semuanya mencoba lagi 100 milidetik kemudian, juga pada waktu yang hampir sama. Server yang tadinya hanya tersendat kini menerima gelombang permintaan berulang yang jauh lebih besar daripada beban normalnya, dan gangguan kecil berubah menjadi mati total. Dua obatnya bekerja pada dua sumbu berbeda. **Backoff eksponensial** memperpanjang jeda tiap kali gagal sehingga jumlah permintaan menurun seiring waktu, sedangkan **jitter** mengacak jedanya sehingga klien-klien yang gagal bersamaan tidak lagi kembali bersamaan. Keduanya harus dipakai bersama, sebab backoff tanpa jitter tetap menghasilkan gelombang, hanya gelombang yang lebih jarang.',
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
      p(
        'Perhatikan formula jedanya, yaitu `Math.random() * dasarMs * 2 ** percobaan`. Bagian `2 ** percobaan` yang membuatnya *eksponensial*, karena angkanya berlipat dua tiap percobaan menjadi 1, 2, 4, 8, sedangkan `Math.random()` di depannya menjadi *jitter*. Alih-alih menunggu tepat sekian detik, jedanya diacak antara 0 sampai batas maksimum itu. Kombinasi keduanya mencegah retry storm dengan dua lapis sekaligus, karena jedanya makin panjang tiap kali gagal, dan klien-klien yang gagal bersamaan tidak akan mencoba lagi di detik yang sama persis. `layakDiulang` dipanggil **sebelum** menghitung jeda apa pun, supaya kegagalan yang memang tidak akan pernah berubah hasilnya, seperti input salah, langsung dilempar ulang tanpa membuang waktu menunggu.',
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
      p(
        'Seluruh perhitungan backoff di atas pada dasarnya adalah **tebakan** tentang kapan server siap menerima lagi. `Retry-After` menghapus tebakan itu, sebab ia jawaban langsung dari server tentang berapa lama harus menunggu, dan lazim dikirim bersama status `429` (terlalu banyak permintaan) atau `503` (layanan sedang tidak tersedia). Kalau header itu ada, mengikutinya selalu lebih baik daripada rumus apa pun yang kamu susun sendiri. Perhatikan `Number(retryAfter) * 1000`, sebab nilainya dikirim dalam **detik** sedangkan `setTimeout` bekerja dalam milidetik, jadi lupa mengalikannya membuat jedanya seribu kali lebih pendek dari yang diminta. Satu catatan, `Retry-After` juga boleh berisi tanggal HTTP alih-alih angka detik, jadi kode yang tangguh sebaiknya memeriksa kedua bentuk itu.',
      ),
      callout(
        'warning',
        'Jangan ulangi operasi yang tidak idempoten tanpa pengaman',
        'Mengulang `POST /pembayaran` bisa memotong saldo dua kali — permintaan pertama mungkin **berhasil** dan hanya responsnya yang hilang. Untuk operasi seperti itu, kirim `Idempotency-Key` supaya server bisa mengenali pengulangan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi memanggil API pihak ketiga untuk menghitung ongkos kirim. Penyedianya cukup andal, tapi sekitar satu dari lima puluh permintaan gagal dengan status 503 atau kehabisan waktu, dan permintaan yang sama berhasil kalau diulang sedetik kemudian. Tanpa pengulangan, satu dari lima puluh pengguna melihat checkout yang gagal tanpa sebab yang bisa ia perbaiki.',
      ),
      p(
        'Yang perlu diputuskan bukan apakah harus mengulang, melainkan **apa yang layak diulang** dan **berapa lama menunggu di antaranya**. Mengulang hal yang salah justru memperburuk keadaan.',
      ),
      code(
        'js',
        `
        const tidur = (ms) => new Promise((teruskan) => setTimeout(teruskan, ms));

        class ErrorHttp extends Error {
          constructor(status, retryAfter) {
            super(\`HTTP \${status}\`);
            this.name = 'ErrorHttp';
            this.status = status;
            this.retryAfter = retryAfter;    // detik, dari header Retry-After
          }
        }

        // Hanya kegagalan SEMENTARA yang layak diulang.
        function bolehDiulang(galat) {
          if (galat.name === 'TimeoutError') return true;
          if (galat.name === 'TypeError') return true;          // jaringan putus
          if (galat instanceof ErrorHttp) {
            return galat.status === 429 || galat.status >= 500;
          }
          return false;
        }

        export async function denganUlang(kerja, { maks = 4, dasarMs = 200 } = {}) {
          for (let percobaan = 1; ; percobaan += 1) {
            try {
              return await kerja(percobaan);
            } catch (galat) {
              if (!bolehDiulang(galat) || percobaan >= maks) throw galat;

              const jeda =
                galat.retryAfter != null
                  ? galat.retryAfter * 1000
                  : Math.round(dasarMs * 2 ** (percobaan - 1) * (0.5 + Math.random() * 0.5));

              await tidur(jeda);
            }
          }
        }
        `,
        { filename: 'src/dengan-ulang.js' },
      ),
      p(
        'Fungsi `bolehDiulang` adalah bagian terpenting dan paling sering dilupakan. Status 400, 401, 403, dan 404 **tidak pernah** layak diulang, sebab permintaan yang sama akan gagal dengan cara yang sama selamanya. Mengulangnya hanya memperlambat pesan kegagalan yang seharusnya langsung sampai ke pengguna. Yang layak diulang hanya kegagalan yang sifatnya sementara, yaitu kehabisan waktu, jaringan putus, 429 karena batas laju, dan 5xx.',
      ),
      p(
        'Perhitungan `dasarMs * 2 ** (percobaan - 1)` adalah backoff eksponensial, yaitu jeda yang berlipat tiap percobaan sehingga menjadi 200, 400, 800, dan seterusnya. Alasannya, kalau server sedang kewalahan, mengulang cepat justru menambah beban dan memperpanjang gangguannya. Bagian `(0.5 + Math.random() * 0.5)` adalah jitter, yaitu pengacakan yang membuat jedanya berada antara separuh dan penuh.',
      ),
      p(
        'Jitter terlihat sepele dan justru bagian yang paling penting saat gangguan nyata terjadi. Bayangkan seribu pengguna gagal pada detik yang sama karena server sempat mati. Tanpa jitter, keseribunya akan mengulang tepat 200 milidetik kemudian, lalu tepat 400 milidetik kemudian, sehingga server yang baru pulih langsung dihantam gelombang serentak dan mati lagi. Ini disebut kawanan bergemuruh, dan pengacakan kecil sudah cukup memecah gelombangnya.',
      ),
      code(
        'text',
        `
        # Keluaran sungguhan, dengan server yang gagal dua kali lalu berhasil.
        percobaan 1 gagal (HTTP 503), tunggu 145ms
        percobaan 2 gagal (HTTP 503), tunggu 244ms
        berhasil di percobaan 3

        # Dan untuk kegagalan yang tidak layak diulang:
        404 tidak diulang: HTTP 404
        `,
        { caption: 'Perhatikan jedanya bukan 200 dan 400 persis, sebab ada jitter.' },
      ),
      p(
        'Baris terakhir keluaran itu sama pentingnya dengan tiga baris di atasnya. Status 404 langsung dilempar tanpa satu pun pengulangan, sehingga pengguna mendapat jawabannya seketika. Kalau `bolehDiulang` tidak ada, pengguna akan menunggu empat percobaan dengan total lebih dari satu detik hanya untuk mendapat pesan yang sudah pasti sejak percobaan pertama.',
      ),
      callout(
        'danger',
        'Jangan mengulang operasi yang mengubah data tanpa kunci idempoten',
        'Kalau permintaan pembayaran kehabisan waktu, kamu tidak tahu apakah server sudah memprosesnya atau belum. Mengulangnya bisa berarti pengguna dibebankan dua kali. Untuk operasi yang mengubah data, kirimkan kunci idempoten yang sama pada tiap percobaan supaya server bisa mengenali dan mengabaikan permintaan yang sudah pernah diproses. Rancangannya dibahas di Kategori Backend Intermediate.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pengulangan menghasilkan kelas kegagalan barunya sendiri, dan sebagian di antaranya justru disebabkan oleh pengulangan itu.',
      ),
      code(
        'text',
        `
        HTTP 429
        HTTP 429
        HTTP 429
        HTTP 429
        Error: HTTP 429
        `,
        { caption: 'Diulang empat kali dan tetap gagal, sebab jedanya terlalu pendek.' },
      ),
      p(
        'Status 429 berarti kamu melebihi batas laju permintaan, dan sebagian besar penyedia menyertakan header `Retry-After` yang menyebut berapa detik harus menunggu. Kalau header itu diabaikan dan kamu memakai backoff sendiri yang jauh lebih pendek, keempat percobaan akan ditolak dengan alasan yang sama. Baca `Retry-After` dan patuhi, sebab penyedia lebih tahu kapan pintunya dibuka lagi.',
      ),
      code(
        'text',
        `
        // Pengguna menekan Bayar sekali.
        POST /bayar  -> timeout setelah 5 detik
        POST /bayar  -> timeout setelah 5 detik
        POST /bayar  -> 200 OK

        // Di sisi server: tiga transaksi tercatat.
        `,
        { caption: 'Pengulangan pada operasi yang mengubah data tanpa kunci idempoten.' },
      ),
      p(
        'Ini kegagalan paling mahal dari seluruh sub-bab, dan ia tidak menghasilkan satu pun error di sisi klien. Dari sudut pandang aplikasimu, permintaannya kehabisan waktu dua kali lalu berhasil. Dari sudut pandang server, ketiganya sampai dan ketiganya diproses. Kehabisan waktu berarti kamu **tidak tahu** apakah permintaannya sampai, dan ketidaktahuan itu yang membuat pengulangan berbahaya.',
      ),
      code(
        'text',
        `
        await denganUlang(() => ambil(url), { maks: 8, dasarMs: 1000 });

        // Pengguna menunggu 1 + 2 + 4 + 8 + 16 + 32 + 64 = 127 detik
        // sebelum melihat pesan gagal.
        `,
        { caption: 'Batas percobaan dan jeda dasar yang terlalu besar.' },
      ),
      p(
        'Backoff eksponensial tumbuh sangat cepat, dan delapan percobaan dengan jeda dasar satu detik berarti lebih dari dua menit menunggu. Untuk pekerjaan latar itu mungkin wajar, sedangkan untuk permintaan yang ditunggu pengguna di depan layar itu tidak bisa diterima. Sediakan batas total waktu di samping batas jumlah percobaan, dan untuk alur yang ditunggu pengguna biasanya tiga percobaan sudah cukup.',
      ),
      code(
        'text',
        `
        for (const id of daftar) {
          await denganUlang(() => kirim(id));
        }

        // Server sedang mati. 500 item x 4 percobaan = 2.000 permintaan.
        `,
        { caption: 'Pengulangan di dalam loop memperbanyak beban saat gangguan.' },
      ),
      p(
        'Saat gangguan sungguhan terjadi, seluruh item akan gagal dan seluruhnya akan diulang. Jumlah permintaan justru berlipat tepat pada saat server paling tidak mampu melayaninya. Pola yang benar untuk kasus ini adalah pemutus arus, yaitu setelah sejumlah kegagalan berurutan, berhenti mencoba sama sekali untuk sementara. Pembahasannya ada di Kategori System Design.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Empat kali 429 berturut-turut',
            'Header `Retry-After` diabaikan',
            'Baca dan patuhi `Retry-After` kalau ada',
          ],
          [
            'Transaksi tercatat berkali-kali',
            'Operasi yang mengubah data diulang tanpa kunci idempoten',
            'Kirim kunci idempoten yang sama pada tiap percobaan',
          ],
          [
            'Pengguna menunggu lebih dari satu menit sebelum tahu gagal',
            'Batas percobaan dan jeda dasar terlalu besar',
            'Batasi total waktu, dan pakai tiga percobaan untuk alur interaktif',
          ],
          [
            'Beban ke server justru melonjak saat gangguan',
            'Setiap item mengulang sendiri-sendiri',
            'Tambahkan pemutus arus yang berhenti setelah sejumlah kegagalan berurutan',
          ],
          [
            'Kegagalan 400 atau 404 tetap diulang',
            'Tidak ada penyaringan jenis kegagalan',
            'Ulang hanya kegagalan sementara, yaitu 429, 5xx, kehabisan waktu, dan jaringan putus',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pengulangan mudah ditambahkan dan sulit diatur dengan benar. Sebagian besar kesalahan di bawah membuat sistem menjadi lebih rapuh, bukan lebih tangguh.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengulang semua kegagalan tanpa memilah',
            'Semakin banyak dicoba semakin besar peluang berhasil',
            'Kegagalan 400 dan 404 tidak akan pernah berubah, jadi pengulangannya hanya memperlambat pesan yang sudah pasti',
          ],
          [
            'Memakai jeda tetap, misalnya selalu satu detik',
            'Lebih mudah diprediksi',
            'Kalau server sedang kewalahan, jeda tetap dari banyak klien menghasilkan gelombang serentak. Backoff yang berlipat memberi server ruang untuk pulih',
          ],
          [
            'Melewatkan jitter karena terlihat tidak penting',
            'Pengacakan kecil tidak mungkin berpengaruh',
            'Tanpa jitter, seluruh klien yang gagal bersamaan akan mengulang bersamaan juga. Ini penyebab gangguan yang berulang setelah server baru pulih',
          ],
          [
            'Mengulang di beberapa lapisan sekaligus',
            'Tiap lapisan menjaga bagiannya sendiri',
            'Tiga lapisan yang masing-masing mengulang tiga kali menghasilkan dua puluh tujuh percobaan. Pilih satu lapisan yang bertanggung jawab mengulang',
          ],
          [
            'Tidak mencatat percobaan keberapa yang akhirnya berhasil',
            'Yang penting hasilnya berhasil',
            'Kamu kehilangan tanda bahwa penyedia sedang memburuk. Angka percobaan adalah sinyal awal gangguan yang paling murah',
          ],
          [
            'Menaruh pengulangan di dalam fungsi yang juga membangun permintaannya',
            'Lebih ringkas jadi satu',
            'Pengulangan menjadi sulit diuji dan sulit dimatikan. Pisahkan sebagai pembungkus umum seperti `denganUlang`',
          ],
        ],
      ),
      p(
        'Baris keempat sering terjadi tanpa disadari, terutama saat memakai pustaka klien HTTP yang sudah punya pengulangan bawaan. Kalau pustakanya mengulang tiga kali dan kamu membungkusnya lagi dengan tiga kali, satu kegagalan menghasilkan sembilan permintaan. Periksa perilaku bawaan pustaka yang kamu pakai sebelum menambahkan lapisanmu sendiri, dan matikan salah satunya.',
      ),
      callout(
        'tip',
        'Angka awal yang masuk akal untuk alur yang ditunggu pengguna',
        'Tiga percobaan, jeda dasar dua ratus milidetik, jitter antara separuh dan penuh, dan total waktu dibatasi sekitar lima detik. Untuk pekerjaan latar yang tidak ditunggu siapa pun, batasnya boleh jauh lebih longgar. Yang membedakan keduanya bukan pentingnya pekerjaan melainkan ada tidaknya manusia yang sedang menunggu di depan layar.',
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
    21,
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
      p(
        '`async function*` menggabungkan dua hal sekaligus, yaitu `async` yang boleh memakai `await` di dalamnya dan `function*` yang bisa berhenti-lalu-lanjut lewat `yield`. Setiap kali `for await...of` meminta nilai berikutnya, fungsi `angkaBertahap` melanjutkan dari tempat ia terakhir berhenti alih-alih mengulang dari awal, sampai `yield` berikutnya ditemukan atau fungsinya benar-benar selesai. Itulah yang membuat ketiga `console.log` di atas tercetak satu per satu "saat masing-masing siap", bukan sekaligus setelah semuanya terkumpul lebih dulu.',
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
      p(
        'Yang membuat pola ini bekerja adalah sifat `yield`, karena fungsi generator **berhenti** di baris itu dan menyerahkan nilainya ke pemanggil, lalu baru dilanjutkan ketika pemanggil meminta item berikutnya. Jadi `while (true)` di dalamnya tidak berbahaya, sebab ia tidak berputar sendiri melainkan maju satu langkah setiap kali `for await` meminta. Bentuk `yield*` dengan tanda bintang berarti "hasilkan setiap elemen dari `data` satu per satu" dan bukan mengembalikan arraynya sekaligus, dan itulah yang membuat pemanggil menerima pengguna satu demi satu tanpa pernah melihat batas halaman. Baris `break` di bawah menunjukkan keuntungan terbesarnya, karena begitu pemanggil berhenti meminta, generatornya tidak pernah dilanjutkan sehingga halaman 3, 4, dan seterusnya **tidak pernah diminta ke server sama sekali**. Bandingkan dengan mengambil semua halaman lebih dulu ke dalam satu array, di mana seluruh permintaan tetap terjadi meski kamu hanya butuh item pertama.',
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
      p(
        'Perhatikan tidak ada `await res.json()` di sini, dan itu memang inti perbedaannya. `res.json()` menunggu **seluruh** badan respons tiba sebelum mengembalikan apa pun, sementara `res.body` adalah aliran yang bisa dibaca potongan demi potongan begitu tiba. `for await` menelusuri aliran itu, dan tiap `potongan` yang diterima masih berupa data biner mentah, sehingga `TextDecoder` diperlukan untuk mengubahnya kembali menjadi teks. Hasilnya, teks bisa mulai ditampilkan setelah potongan pertama tiba dan bukan setelah semuanya selesai, persis yang membuat antarmuka semacam chat AI terasa menjawab sambil mengetik. Ada satu hal yang perlu diwaspadai. Pemotongan aliran tidak menghormati batas karakter, sehingga satu karakter multi-byte bisa terbelah di antara dua potongan, dan untuk teks non-ASCII `new TextDecoder()` sebaiknya dibuat **sekali di luar loop** lalu dipakai dengan opsi `{ stream: true }`.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tombol Unduh Semua Transaksi di halaman laporan harus menghasilkan berkas CSV. Jumlah barisnya bisa lima ratus untuk toko kecil dan bisa dua ratus ribu untuk toko yang sudah berjalan bertahun-tahun. Server mengirimnya per halaman berisi seribu baris. Kalau seluruh halaman dikumpulkan dulu ke satu array lalu diubah menjadi CSV, dua ratus ribu baris berarti dua salinan penuh di memori sekaligus, dan tab bisa mati sebelum berkasnya jadi.',
      ),
      p(
        'Async iterator menyelesaikan ini dengan mengubah bentuk masalahnya. Alih-alih mengumpulkan dulu lalu mengolah, tiap baris diolah begitu ia tiba lalu dilepas.',
      ),
      code(
        'js',
        `
        export async function* halamanDemiHalaman(ambil, { batasHalaman = 500 } = {}) {
          let kursor = null;

          for (let i = 0; i < batasHalaman; i += 1) {
            const { data, kursorBerikut } = await ambil(kursor);

            yield* data;                 // keluarkan tiap baris satu per satu

            if (!kursorBerikut) return;  // server bilang sudah habis
            kursor = kursorBerikut;
          }

          throw new Error(\`Berhenti setelah \${batasHalaman} halaman, server tidak pernah selesai\`);
        }
        `,
        { filename: 'src/laporan/paginasi.js' },
      ),
      code(
        'js',
        `
        // Pemakaiannya terbaca seperti loop biasa, padahal tiap putaran bisa memanggil server.
        async function unduhCsv(ambil) {
          const potongan = ['tanggal,produk,total\\n'];
          let jumlah = 0;

          for await (const baris of halamanDemiHalaman(ambil)) {
            potongan.push(\`\${baris.tanggal},\${baris.produk},\${baris.total}\\n\`);
            jumlah += 1;

            if (jumlah % 1000 === 0) {
              perbaruiKemajuan(jumlah);           // pengguna melihat angkanya naik
            }
          }

          return new Blob(potongan, { type: 'text/csv;charset=utf-8' });
        }
        `,
        { filename: 'src/laporan/unduh.js' },
      ),
      p(
        'Tanda bintang pada `async function*` menandai generator asinkron, yaitu fungsi yang bisa `await` di dalamnya sekaligus mengeluarkan nilai satu per satu lewat `yield`. Bentuk `yield* data` mengeluarkan **tiap elemen** array itu satu per satu, bukan arraynya sebagai satu nilai. Tanpa tanda bintang pada `yield`, konsumennya akan menerima array per halaman dan bukan baris per baris.',
      ),
      p(
        'Yang paling berharga dari bentuk ini adalah pemisahan tanggung jawabnya. Fungsi `halamanDemiHalaman` hanya tahu cara berpindah halaman, dan sama sekali tidak tahu bahwa hasilnya akan menjadi CSV. Fungsi `unduhCsv` hanya tahu cara membentuk baris CSV, dan sama sekali tidak tahu datanya datang per halaman. Kalau nanti ada fitur baru yang perlu menghitung total dari data yang sama, ia cukup memakai iterator yang sama tanpa satu baris pun disalin.',
      ),
      p(
        'Baris `if (jumlah % 1000 === 0)` menunjukkan keuntungan praktis yang tidak dimiliki pendekatan kumpulkan dulu. Karena datanya mengalir, kemajuannya bisa dilaporkan sepanjang jalan. Pengguna melihat angka yang naik alih-alih spinner diam selama satu menit, dan perbedaan itu besar bagi persepsi kecepatan meskipun waktu totalnya sama.',
      ),
      p(
        'Batas `batasHalaman` mengikuti pola yang sama dengan loop paginasi di Bab 1, dan alasannya sama. Bug di sisi server yang selalu mengirim kursor berikutnya akan membuat iterator ini berjalan selamanya. Perhatikan `throw` diletakkan **setelah** loop, sehingga ia hanya tercapai kalau loopnya habis tanpa pernah bertemu `return`.',
      ),
      callout(
        'info',
        '`for await` juga bekerja untuk respons yang mengalir',
        'Badan sebuah `Response` dari `fetch` bisa dibaca sebagai aliran, dan `for await (const potongan of respons.body)` mengeluarkan potongan byte begitu tiba. Itu yang memungkinkan menampilkan jawaban model bahasa kata demi kata alih-alih menunggu seluruhnya selesai. Bentuk konsumsinya sama persis dengan contoh di atas.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Generator asinkron punya beberapa cara gagal yang khas, dan sebagian di antaranya berupa kebocoran yang tidak berbunyi sama sekali.',
      ),
      code(
        'text',
        `
        for await (const v of 5) console.log(v);
                              ^

        TypeError: 5 is not async iterable
        `,
        { caption: '`for await` dipakai pada nilai yang tidak bisa ditelusuri.' },
      ),
      p(
        'Pesannya menyebut `async iterable`, dan itu berbeda dari `iterable` biasa. Yang bisa dipakai `for await` adalah generator asinkron, aliran, dan juga iterable biasa seperti array. Yang tidak bisa adalah angka, object biasa, dan janji tunggal. Kesalahan yang sering terjadi adalah menulis `for await (const x of ambilSemua())` padahal `ambilSemua` mengembalikan janji berisi array, dan bukan generator. Untuk kasus itu, `await` dulu janjinya baru telusuri hasilnya.',
      ),
      code(
        'text',
        `
        const arr = [Promise.resolve(1), Promise.resolve(2)];
        for await (const v of arr) console.log('v', v);

        v 1
        v 2
        `,
        { caption: 'Bukan error, dan hasilnya benar, tapi keduanya berjalan berurutan.' },
      ),
      p(
        '`for await` pada array berisi janji memang bekerja dan menunggu tiap janji satu per satu. Yang perlu disadari, ia **berurutan** bukan paralel. Kalau kedua janji itu adalah panggilan jaringan yang independen, bentuk ini memakan jumlah seluruh waktunya sementara `Promise.all` hanya memakan yang terlama. Pakai `for await` kalau urutannya penting atau kalau datanya memang datang bertahap, dan pakai `Promise.all` kalau seluruhnya sudah ada dan independen.',
      ),
      code(
        'text',
        `
        for await (const baris of halamanDemiHalaman(ambil)) {
          if (baris.total > 1_000_000) break;      // berhenti di tengah
        }

        // Tidak ada error. Tapi apakah 'finally' di dalam generator berjalan?
        `,
        {
          caption:
            '`break` di tengah menghentikan generator, dan pembersihannya perlu diperhatikan.',
        },
      ),
      p(
        'Saat `for await` dihentikan dengan `break`, `return`, atau `throw`, JavaScript memanggil `return()` pada generatornya. Kalau generatormu punya blok `try` dan `finally`, blok `finally` itu akan berjalan, dan di situlah tempat menutup koneksi atau membatalkan permintaan yang menggantung. Kalau kamu tidak menyediakannya, permintaan halaman berikutnya yang sudah melayang tetap berjalan tanpa ada yang memakai hasilnya.',
      ),
      code(
        'text',
        `
        async function* ambilTerus() {
          while (true) {
            yield await ambilSatu();
          }
        }

        // Dipanggil tanpa break dan tanpa batas.
        for await (const x of ambilTerus()) simpan(x);
        `,
        { caption: 'Generator tak berujung tanpa jalan keluar.' },
      ),
      p(
        'Berbeda dari loop sinkron tak berujung yang membekukan tab, bentuk ini justru **tidak** membekukan apa pun, sebab tiap putaran menunggu dan memberi giliran ke event loop. Halaman tetap responsif, dan itu yang membuatnya berbahaya. Yang terjadi adalah permintaan jaringan yang tidak pernah berhenti, memori yang terus bertambah kalau hasilnya disimpan, dan kuota yang habis tanpa ada yang menyadari. Selalu sediakan batas atau syarat berhenti.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`x is not async iterable`',
            'Yang ditelusuri janji atau nilai biasa, bukan generator',
            '`await` dulu janjinya, atau ubah sumbernya menjadi generator asinkron',
          ],
          [
            'Terasa lambat padahal sudah memakai `for await`',
            'Ia berurutan, bukan paralel',
            'Pakai `Promise.all` kalau seluruhnya sudah ada dan independen',
          ],
          [
            'Permintaan tetap berjalan setelah loop di-`break`',
            'Generator tidak punya pembersihan di `finally`',
            'Bungkus isi generator dengan `try` dan `finally`, lalu batalkan di sana',
          ],
          [
            'Memori terus naik selama pengunduhan',
            'Hasil tiap putaran tetap disimpan ke satu array besar',
            'Olah lalu lepas, atau tulis langsung ke tujuan alirannya',
          ],
          [
            'Konsumennya menerima array per halaman, bukan baris',
            '`yield` dipakai, seharusnya `yield*`',
            'Ganti menjadi `yield*` untuk mengeluarkan tiap elemen',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Async iterator adalah alat yang cocok untuk satu jenis masalah saja, yaitu data yang datang bertahap. Sebagian besar kesalahan di bawah berasal dari memakainya di luar itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `for await` untuk daftar janji yang sudah lengkap',
            'Bentuknya lebih terbaca daripada `Promise.all`',
            'Ia menunggu satu per satu, sehingga waktunya menjadi jumlah seluruhnya. Untuk yang sudah lengkap dan independen, `Promise.all` yang tepat',
          ],
          [
            'Mengumpulkan seluruh hasil generator ke array lalu mengolahnya',
            'Lebih mudah dipikirkan',
            'Itu membuang seluruh keuntungan mengalir, sebab memorinya kembali menampung semuanya. Olah tiap elemen di dalam loop',
          ],
          [
            'Menulis generator tanpa batas jumlah putaran',
            'Server pasti akan bilang kapan habis',
            'Bug di server membuatnya berjalan selamanya tanpa membekukan halaman, jadi tidak ada gejala yang terlihat',
          ],
          [
            'Melupakan `finally` untuk pembersihan',
            'Loopnya toh selalu selesai sampai habis',
            '`break`, `return`, dan error dari konsumen semuanya menghentikan generator di tengah. Tanpa `finally`, koneksi dan permintaan tergantung',
          ],
          [
            'Memakai generator untuk data yang jumlahnya pasti kecil',
            'Bentuknya lebih canggih',
            'Untuk lima puluh baris, satu panggilan biasa lebih pendek dan lebih mudah dibaca. Generator berguna saat jumlahnya besar atau tidak diketahui',
          ],
          [
            'Menggabungkan `yield` dan nilai kembalian dalam satu generator',
            'Keduanya sama-sama mengeluarkan nilai',
            'Nilai dari `return` tidak muncul di `for await`, jadi ia hilang tanpa jejak. Keluarkan seluruh hasil lewat `yield`',
          ],
        ],
      ),
      p(
        'Baris terakhir sering menghabiskan waktu penelusuran yang tidak perlu. Kalau generatormu menulis `return jumlahTotal` di akhir, nilai itu **tidak** akan pernah muncul di loop `for await`, sebab loop berhenti tepat saat generator selesai. Nilainya hanya bisa diambil kalau kamu memanggil `next()` secara manual dan membaca propertinya. Untuk hal seperti total dan ringkasan, hitung di sisi konsumen selama loop berjalan.',
      ),
      callout(
        'tip',
        'Cara memutuskan antara `Promise.all` dan `for await`',
        'Tanyakan apakah seluruh pekerjaannya sudah bisa dimulai sekarang. Kalau ya dan jumlahnya wajar, `Promise.all` lebih cepat. Kalau pekerjaan berikutnya baru bisa dimulai setelah yang sekarang selesai, misalnya karena butuh kursor halaman berikutnya, `for await` adalah satu-satunya bentuk yang benar.',
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
    23,
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
      p(
        'Bedanya terletak pada **kapan tiap permintaan berangkat**. Pada versi loop, `await` menahan seluruh badan fungsi, sehingga permintaan kedua baru dikirim setelah yang pertama kembali, dan sepuluh item berarti sepuluh perjalanan bolak-balik yang antre rapi. Pada versi `map`, `ids.map(ambil)` memanggil `ambil` untuk **semua** id lebih dulu dan menghasilkan array berisi sepuluh promise yang sudah berjalan bersamaan, lalu `Promise.all` tinggal menunggu semuanya rampung. Perhatikan `map(ambil)` menuliskan nama fungsinya tanpa kurung, karena ia mengoper fungsinya dan bukan memanggilnya di situ. Ada satu peringatan penting, yaitu paralel bukan selalu benar. Kalau daftarnya berisi ribuan item, menembakkan ribuan permintaan sekaligus bisa membuat browser maupun server kewalahan, dan untuk kasus itu kamu perlu membatasi jumlah yang berjalan bersamaan alih-alih melepas semuanya.',
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
      p(
        'Disebut *floating* karena promise-nya mengambang, tanpa satu pun kode yang memegangnya. Baris pertama tetap **menjalankan** `simpanData`, jadi bugnya bukan "tidak jalan" melainkan kegagalannya tidak punya tujuan. Kalau penyimpanan gagal, tidak ada `catch` yang menerima, tidak ada `await` yang melempar, dan yang tersisa hanya peringatan unhandled rejection di console yang mudah terlewat, sementara pengguna tetap melihat aplikasi seolah semuanya berhasil. Ketiga versi BENAR menutup celah itu dengan cara berbeda, dan pilihannya bergantung pada niatmu. Pakai `await` kalau hasilnya memang perlu ditunggu, `.catch(laporkan)` kalau operasinya boleh berjalan di latar tapi kegagalannya tetap perlu dicatat, dan `void ... .catch(() => {})` kalau kamu benar-benar tidak peduli hasilnya. Kata `void` di depan tidak mengubah apa pun secara teknis, karena ia penanda bagi pembaca dan linter bahwa promise ini **sengaja** dibiarkan dan bukan terlupakan.',
      ),

      h2('3. `forEach` dengan `async`'),
      code(
        'js',
        `
        daftar.forEach(async (item) => { await proses(item); });
        console.log('selesai');   // BOHONG — tercetak sebelum apa pun selesai

        // forEach mengabaikan return value callback, termasuk promise.
        await Promise.all(daftar.map(proses));   // benar
        `,
      ),
      p(
        "Jebakan ini sangat mudah terlewat karena kodenya **terlihat** benar, sebab ada `async`, ada `await`, dan tidak ada satu pun error yang muncul. Masalahnya ada pada `forEach` itu sendiri. Ia memanggil callback untuk tiap elemen lalu **membuang return value-nya**, padahal return value callback `async` adalah promise. Jadi semua promise itu mengambang persis seperti kasus nomor 2, dan `forEach` selesai seketika tanpa menunggu apa pun, dan itulah kenapa `console.log('selesai')` berbohong. `map` memperbaikinya justru karena ia **mengembalikan** array hasil callback, yang di sini berarti array promise, sehingga `Promise.all` bisa menunggunya. Aturan yang mudah diingat, `forEach` tidak pernah cocok dengan `async`. Kalau kamu butuh berurutan, pakai `for...of` dengan `await` di dalamnya, dan kalau butuh bersamaan, pakai `map` dengan `Promise.all`.",
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
      p(
        'Bug ini muncul karena **urutan permintaan berangkat tidak menjamin urutan jawaban tiba**. Pengguna mengetik "ab" dan permintaannya berangkat, lalu sepersekian detik kemudian ia mengetik "abc" dan permintaan kedua berangkat. Kalau kebetulan permintaan "ab" tersendat sedikit lebih lama, jawabannya tiba **belakangan** dan menimpa hasil "abc" yang sudah tampil, sehingga pengguna melihat hasil pencarian yang tidak sesuai dengan yang tertulis di kotak pencariannya. Perbaikan B bekerja dengan menomori tiap permintaan, karena `++terakhir` menaikkan penghitung dan menyimpan nomornya ke variabel lokal `nomor` sebelum `await`. Setelah jawaban tiba, `nomor !== terakhir` menjawab pertanyaan "apakah masih ada permintaan yang lebih baru setelah saya?", dan kalau ya, jawaban ini sudah usang dan dibuang tanpa ditampilkan. Perhatikan `nomor` harus variabel lokal di dalam fungsi, sebab kalau ia dibaca ulang dari `terakhir` setelah `await`, perbandingannya selalu benar dan penjagaannya tidak berguna.',
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
      p(
        'Kedua versi SALAH di atas gagal karena alasan berbeda tapi berujung sama: `try`/`catch` hanya bisa menangkap sesuatu yang **benar-benar terjadi di dalam badannya sendiri**, bukan yang terjadi belakangan. Pada baris pertama, `throw` di dalam `setTimeout` terjadi di macrotask lain yang berjalan **setelah** blok `try` sudah selesai dan keluar — `catch`-nya sudah lama tidak aktif lagi saat error itu muncul. Pada baris kedua, `ambilData()` tanpa `await` langsung mengembalikan Promise seketika, dan `try` menganggap dirinya sudah selesai tanpa pernah tahu Promise itu belakangan gagal. Baris ketiga bekerja karena `await` membuat `try` benar-benar **menunggu** sampai promise-nya settle sebelum blok itu dianggap tuntas.',
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
      p(
        'Telusuri apa yang sebenarnya terjadi. Ketiga pemanggilan `tambah()` dimulai hampir bersamaan, dan ketiganya membaca `jumlah` yang masih bernilai `0` **sebelum** `await` menghentikan mereka. Setelah jeda berakhir, ketiganya melanjutkan dan masing-masing menulis `0 + 1`, sehingga hasil akhirnya `1` dan bukan `3`, dengan dua kenaikan hilang tanpa jejak. Pola ini dikenal sebagai *read-modify-write* yang tidak aman, dan penting disadari bahwa **JavaScript yang single-threaded tidak melindungimu darinya**. Yang dijamin single-thread hanyalah tidak ada dua baris berjalan pada detik yang sama persis, tetapi setiap `await` adalah titik di mana fungsimu dijeda dan fungsi lain boleh berjalan sampai jauh. Aturan praktisnya, jangan pernah menganggap nilai yang kamu baca sebelum `await` masih sama sesudahnya. Baca ulang setelah jeda, atau susun operasinya agar tidak butuh nilai lama sama sekali.',
      ),
      callout(
        'warning',
        'Setiap `await` adalah titik di mana kode lain bisa menyela',
        'JavaScript memang single-threaded, tapi itu tidak berarti bebas dari race condition. Jangan pernah berasumsi keadaan yang kamu baca sebelum `await` masih sama sesudahnya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman checkout punya tombol Bayar. Pengguna menekannya, jaringan sedang lambat, tidak ada yang berubah di layar selama dua detik, lalu ia menekannya lagi. Di server tercatat dua pesanan. Setelah diperbaiki dengan menonaktifkan tombol, muncul laporan kedua, yaitu total di ringkasan kadang tidak cocok dengan total yang tercetak di faktur.',
      ),
      p(
        'Dua bug ini bukan kejadian yang berdiri sendiri, melainkan dua wajah dari satu kesalahpahaman yang sama, yaitu mengira `await` membuat sebuah alur kebal dari gangguan alur lain. Fungsi checkout di bawah memuat lima jebakan sekaligus dari sub-bab ini.',
      ),
      code(
        'js',
        `
        // Versi yang memuat lima jebakan sekaligus.
        let totalTampil = 0;

        async function bayar(keranjang) {
          const harga = [];
          for (const item of keranjang) {
            harga.push(await ambilHarga(item.id));      // 1. berurutan padahal independen
          }

          totalTampil = harga.reduce((a, b) => a + b, 0);  // 2. race condition

          keranjang.forEach(async (item) => {
            await kurangiStok(item.id);                 // 3. forEach tidak menunggu
          });

          try {
            kirimPesanan(keranjang, totalTampil);       // 4. tanpa await, try tidak berguna
          } catch (e) {
            tampilkanGagal(e);
          }

          catatAnalitik('bayar', totalTampil);          // 5. floating promise
        }
        `,
        { filename: 'src/checkout.js — jangan ditiru' },
      ),
      p(
        'Jebakan pertama ada di loop. Sepuluh item berarti sepuluh panggilan berurutan, dan pada 150 milidetik per panggilan itu 1,5 detik yang seharusnya 150 milidetik. Jebakan kedua, `totalTampil` adalah variabel modul yang ditulis oleh fungsi ini. Kalau pengguna sempat mengubah keranjang lalu memicu `bayar` lagi, dua alur menulis ke variabel yang sama dan yang selesai belakangan menang, tanpa peduli mana yang lebih baru.',
      ),
      p(
        'Jebakan ketiga membuat pengurangan stok tidak pernah ditunggu, sehingga `bayar` selesai dan pesanan terkirim sebelum stoknya sempat berkurang. Jebakan keempat, `kirimPesanan` tanpa `await` berarti `try` sudah selesai jauh sebelum kegagalannya terjadi, jadi `catch` itu tidak akan pernah berjalan. Jebakan kelima, `catatAnalitik` yang tidak ditunggu dan tidak diberi `catch` akan menjadi penolakan tidak tertangani kalau ia gagal.',
      ),
      code(
        'js',
        `
        // Versi yang menutup kelima jebakan.
        let idPermintaan = 0;

        async function bayar(keranjang) {
          const idSaya = ++idPermintaan;

          // 1. Independen, jadi jalankan bersamaan.
          const harga = await Promise.all(keranjang.map((item) => ambilHarga(item.id)));
          const total = harga.reduce((a, b) => a + b, 0);

          // 2. Kalau sudah ada permintaan yang lebih baru, hasil ini sudah usang.
          if (idSaya !== idPermintaan) return null;

          // 3. for...of menunggu, dan urutan pengurangan stok memang penting.
          for (const item of keranjang) {
            await kurangiStok(item.id);
          }

          // 4. await di dalam try, supaya catch benar-benar bekerja.
          try {
            await kirimPesanan(keranjang, total, { kunciIdempoten: idKunci(keranjang) });
          } catch (galat) {
            tampilkanGagal(galat);
            throw galat;
          }

          // 5. Sengaja tidak ditunggu, tapi kegagalannya ditangani sendiri.
          void catatAnalitik('bayar', total).catch(() => {});

          return total;
        }
        `,
        { filename: 'src/checkout.js — versi yang benar' },
      ),
      p(
        'Perubahan nomor dua layak diperhatikan lebih lama, sebab ia satu-satunya yang tidak bisa diselesaikan dengan mengganti bentuk sintaks. Penomoran `idSaya` dan pemeriksaan sesudah `await` adalah pola penjaga respons basi yang sudah muncul di Bab 1 dan Bab 3. Ia diperlukan karena `await` **tidak** mengunci apa pun, dan selama sebuah fungsi menunggu, pengguna masih bisa menekan tombol lagi.',
      ),
      p(
        'Perhatikan juga `total` sekarang variabel lokal, bukan variabel modul. Ini perbaikan yang lebih dalam daripada penjaga id, sebab dua alur yang berjalan bersamaan tidak lagi berebut tempat penyimpanan yang sama. Aturan umum yang bisa dipegang, keadaan yang bisa disentuh dua alur asinkron sekaligus adalah sumber bug yang paling sulit direproduksi, dan cara termurah menghindarinya adalah tidak membuatnya menjadi bersama sejak awal.',
      ),
      p(
        'Kata `void` di depan `catatAnalitik` adalah penanda yang bisa dibaca manusia maupun alat lint, artinya janji ini memang sengaja tidak ditunggu. Ditambah `.catch(() => {})` di belakangnya, kegagalannya tidak akan menjadi penolakan tidak tertangani. Tanpa dua penanda itu, pembaca berikutnya tidak punya cara membedakan mana yang sengaja dan mana yang lupa.',
      ),
      callout(
        'danger',
        'Kunci idempoten adalah satu-satunya perlindungan sungguhan dari pesanan ganda',
        'Menonaktifkan tombol menutup kasus klik ganda, dan itu perlu. Yang tidak ia tutup adalah pengguna yang menekan muat ulang, jaringan yang mengirim ulang permintaan, dan pengulangan otomatis dari Sub-bab 3.9. Server harus bisa mengenali bahwa dua permintaan adalah permintaan yang sama, dan itu hanya mungkin kalau klien mengirimkan kunci yang sama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Jebakan asinkron punya sifat yang membuatnya mahal, yaitu sebagian besarnya tidak melempar apa pun di tempat kesalahannya dibuat.',
      ),
      code(
        'text',
        `
        keranjang.forEach(async (item) => {
          await kurangiStok(item.id);
        });
        console.log('semua stok berkurang');

        semua stok berkurang        <- tercetak lebih dulu
        (lalu sepuluh pengurangan stok berjalan bersamaan)
        `,
        { caption: '`forEach` tidak menunggu fungsi `async` yang diberikan kepadanya.' },
      ),
      p(
        '`forEach` memanggil fungsimu untuk tiap elemen lalu langsung lanjut, tanpa peduli fungsi itu mengembalikan janji. Hasilnya sepuluh janji melayang tanpa ada yang memegangnya, dan baris sesudah `forEach` berjalan sebelum satu pun selesai. Kalau urutannya penting, pakai `for...of` dengan `await`. Kalau tidak penting dan boleh bersamaan, pakai `await Promise.all(arr.map(...))` supaya tetap ada yang menunggunya.',
      ),
      code(
        'text',
        `
        try {
          simpan();                  // fungsi async, tanpa await
        } catch (e) {
          tampilkanGagal(e);         // tidak pernah berjalan
        }

        Uncaught (in promise) Error: gagal simpan
        `,
        { caption: '`try` tanpa `await` tidak melindungi apa pun.' },
      ),
      p(
        'Blok `try` hanya aktif selama kode di dalamnya berjalan. `simpan()` tanpa `await` selesai seketika dengan mengembalikan janji, jadi blok `try` sudah tutup sebelum kegagalannya terjadi. Bentuk ini sangat berbahaya karena terlihat aman saat ditinjau sekilas. Kalau sebuah fungsi `async` dipanggil di dalam `try`, hampir pasti ia butuh `await`.',
      ),
      code(
        'text',
        `
        // Pengguna mengetik cepat, dua permintaan berangkat.
        cari('kaos');        // lambat, 800 ms
        cari('kaos polos');  // cepat, 100 ms

        // Layar akhirnya menampilkan hasil untuk 'kaos'.
        `,
        { caption: 'Respons yang datang tidak berurutan saling menimpa.' },
      ),
      p(
        'Tidak ada error, tidak ada peringatan, dan bugnya hanya muncul kalau jaringan kebetulan berperilaku seperti itu. Karena di komputer pengembangan jaringan biasanya cepat dan stabil, bug ini hampir tidak pernah muncul saat pengujian manual dan sangat sering muncul di ponsel pengguna. Pakai pembatas jaringan di DevTools untuk membuatnya bisa direproduksi.',
      ),
      code(
        'text',
        `
        async function muat() {
          const data = await ambil();
          setState(data);            // komponen sudah dilepas
        }

        Warning: Can't perform a React state update on an unmounted component.
        `,
        { caption: 'Hasil datang setelah bagian yang menampilkannya sudah tidak ada.' },
      ),
      p(
        'Peringatan ini khas React, tapi masalahnya berlaku umum, yaitu menulis ke sesuatu yang sudah tidak ada. Versi tanpa React-nya berupa `Cannot set properties of null` saat kamu menulis ke elemen yang sudah dihapus dari halaman. Perbaikannya sama untuk keduanya, yaitu batalkan permintaannya saat bagian itu ditutup, memakai `AbortController` seperti di Sub-bab 3.8.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Baris sesudah `forEach` berjalan terlalu cepat',
            '`forEach` tidak menunggu fungsi `async`',
            'Pakai `for...of` dengan `await`, atau `Promise.all` dengan `map`',
          ],
          [
            '`catch` tidak pernah berjalan padahal ada `try`',
            'Pemanggilan di dalamnya tidak di-`await`',
            'Tambahkan `await`',
          ],
          [
            'Layar menampilkan hasil yang sudah usang',
            'Respons datang tidak berurutan',
            'Pakai penjaga nomor permintaan, atau batalkan yang lama',
          ],
          [
            'Peringatan menulis ke komponen yang sudah dilepas',
            'Hasil datang setelah tujuannya hilang',
            'Batalkan permintaan saat komponen ditutup',
          ],
          [
            '`Uncaught (in promise)` tanpa baris yang jelas',
            'Ada janji yang dibuat tanpa `await` dan tanpa `catch`',
            'Cari pemanggilan `async` yang hasilnya tidak dipakai sama sekali',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sub-bab ini sendiri adalah kumpulan kesalahan, jadi tabel di bawah memuat yang belum disebut di atas, ditambah kebiasaan yang membuat kesalahan itu sulit ditemukan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menguji alur asinkron hanya di jaringan cepat',
            'Alurnya kan sama saja',
            'Race condition, respons yang saling menimpa, dan keadaan memuat yang berkedip semuanya hanya muncul saat lambat. Pakai pembatas jaringan di DevTools',
          ],
          [
            'Menyimpan hasil asinkron ke variabel di luar fungsi',
            'Supaya bisa dipakai bagian lain',
            'Dua alur yang berjalan bersamaan menulis ke tempat yang sama. Simpan hasilnya sebagai variabel lokal, lalu kembalikan',
          ],
          [
            'Menambahkan `setTimeout` supaya urutannya benar',
            'Setelah ditunda, urutannya jadi cocok',
            'Itu menebak berapa lama sesuatu memakan waktu, dan tebakan itu salah di perangkat lain. Tunggu hal yang benar dengan `await`',
          ],
          [
            'Menonaktifkan tombol saja untuk mencegah kiriman ganda',
            'Klik gandanya memang tertutup',
            'Muat ulang halaman, pengulangan otomatis, dan pengiriman ulang jaringan tetap bisa menggandakan. Perlindungan sungguhan ada di server',
          ],
          [
            'Membungkus seluruh isi fungsi dengan satu `try` besar',
            'Semua kegagalan tertangani',
            'Kamu kehilangan informasi langkah mana yang gagal, dan biasanya tetap ada satu pemanggilan yang lupa di-`await` di dalamnya',
          ],
          [
            'Mengabaikan peringatan lint tentang janji yang tidak ditunggu',
            'Kodenya jalan',
            'Aturan seperti `no-floating-promises` justru dibuat untuk menangkap tepat kelas bug di sub-bab ini. Kalau memang sengaja, tandai dengan `void` dan beri `catch`',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan kebiasaan tetap. Buka DevTools, pilih pembatas jaringan Slow 4G, lalu jalankan alur yang baru kamu tulis. Sebagian besar bug di sub-bab ini akan muncul dalam percobaan pertama, dan menemukannya di mejamu sendiri jauh lebih murah daripada menerima laporan yang berbunyi kadang totalnya salah.',
      ),
      callout(
        'tip',
        'Lima pertanyaan untuk memeriksa fungsi asinkron sebelum selesai',
        'Apakah ada `await` di dalam loop yang sebenarnya independen. Apakah ada janji yang dibuat tanpa `await` dan tanpa `catch`. Apakah setiap pemanggilan di dalam `try` benar-benar di-`await`. Apakah ada keadaan bersama yang ditulis setelah `await`. Dan apakah ada jalan keluar kalau bagian yang menampilkannya sudah ditutup lebih dulu.',
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
    25,
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
      p(
        '`ambilPalsu` sengaja dibuat supaya latihan ini bisa dijalankan tanpa internet sekalipun, dan supaya waktunya **bisa ditebak**. Sebuah permintaan jaringan sungguhan bervariasi antara 80 dan 800 milidetik, dan variasi itu akan menutupi perbedaan yang justru ingin kamu ukur. Perhatikan `await tunggu(ms)` di dalamnya, karena jeda ini memakai `setTimeout` sehingga ia benar-benar asinkron. Fungsinya melepaskan giliran selama satu detik alih-alih menyibukkan prosesor. Itu penting, sebab kalau jedanya dibuat dengan loop yang berputar sampai waktu habis, versi paralel di langkah 3 tidak akan lebih cepat sama sekali karena satu-satunya thread akan tersita penuh oleh loop pertama.',
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
      p(
        "Angka ±3000 ms itu adalah penjumlahan sederhana dari tiga jeda satu detik yang antre satu per satu. Yang perlu diperhatikan, tidak ada satu pun baris di sini yang **menyuruh** ketiganya berurutan, sebab keberurutan itu efek samping dari menulis `await` di depan masing-masing. Setiap `await` menahan seluruh badan fungsi sampai promise-nya selesai, jadi `ambilPalsu('b')` bahkan belum dipanggil ketika `a` masih menunggu. Pasangan `console.time('berurutan')` dan `console.timeEnd('berurutan')` mengapit blok yang diukur, dan seperti disebut di sub-bab debugging, **labelnya harus sama persis**, sebab itulah yang memasangkan keduanya, sehingga pengukuran \"berurutan\" dan \"paralel\" di langkah berikutnya tidak tertukar.",
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
      p(
        'Blok ini menjalankan pekerjaan yang **sama persis** dengan langkah 2, yaitu tiga pemanggilan `ambilPalsu` dengan jeda satu detik masing-masing, dan selesai dalam sepertiga waktunya. Satu-satunya yang berubah adalah letak `await`. Di sini hanya ada **satu** `await`, dan ia berada di depan `Promise.all` alih-alih di depan tiap pemanggilan. Ketiga fungsi dipanggil di dalam array sebelum `await` sempat menahan apa pun, sehingga ketiga jeda satu detik berjalan menumpang waktu yang sama. Inilah bukti terukur dari aturan yang sudah dibahas, bahwa total waktunya mendekati **yang paling lambat** dan bukan jumlah ketiganya. Jalankan sendiri kedua langkah ini berurutan di console lalu bandingkan dua angka yang tercetak, karena itu jauh lebih meyakinkan daripada membaca penjelasannya.',
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
      p(
        "Perhatikan bahwa `Promise.reject(new Error('b gagal'))` sengaja disisipkan di antara dua permintaan yang berhasil, dan `Promise.allSettled` tidak pernah melempar karena kegagalan ini, berbeda dari `Promise.all` yang akan langsung menolak seluruhnya begitu satu saja gagal. `berhasil` dan `gagal` di atas dipisahkan dengan memeriksa `r.status`, persis seperti pola yang sudah dipelajari di sub-bab paralel vs berurutan, dan bedanya sekarang kamu melihat sendiri bahwa kegagalan satu permintaan tidak menghilangkan dua hasil lain yang sukses.",
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
      p(
        'Fungsi ini menggabungkan dua penjagaan yang keduanya wajib ada pada permintaan sungguhan, dan keduanya menangani masalah yang berbeda. `AbortSignal.timeout(ms)` menjaga terhadap server yang **tidak menjawab**, sebab tanpa itu promise-nya menunggu selamanya karena `fetch` tidak punya batas waktu bawaan. Pemeriksaan `if (!res.ok)` menjaga terhadap server yang **menjawab dengan kegagalan**, dan ini perlu ditulis sendiri karena `fetch` menganggap status `404` maupun `500` sebagai permintaan yang berhasil sampai tujuan, sehingga tanpa baris itu `res.json()` akan mencoba mengurai halaman error sebagai data. Perhatikan nama error yang tercetak adalah `TimeoutError`, bukan `AbortError`. Keduanya datang dari mekanisme abort yang sama tapi artinya berbeda bagi pengguna, karena yang satu berarti "server terlalu lambat, coba lagi" sedangkan yang lain berarti "kamu sendiri yang membatalkan, jangan tampilkan apa-apa".',
      ),

      h2('6. Yang harus kamu catat sendiri'),
      ol(
        'Berapa milidetik selisih berurutan dan paralel di mesinmu.',
        'Apa yang terjadi pada `Promise.all` kalau salah satunya gagal — apakah yang lain benar-benar berhenti?',
        'Berapa lama `AbortSignal.timeout` benar-benar menunggu sebelum melempar.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Praktik di atas mengukur perbedaan berurutan dan paralel pada sumber tiruan. Sekarang bentuk yang benar-benar dipakai di halaman produk, yaitu satu fungsi yang menggabungkan seluruh materi bab ini. Empat sumber data, dua di antaranya wajib dan dua lainnya pelengkap, dengan batas waktu, pembatalan, pengulangan untuk kegagalan sementara, dan pelaporan yang cukup untuk menelusuri kalau nanti ada yang lambat.',
      ),
      code(
        'js',
        `
        import { denganUlang } from './dengan-ulang.js';

        export async function muatHalamanProduk(id, { sinyalLuar, batasMs = 8000 } = {}) {
          const kendali = new AbortController();
          const sinyal = sinyalLuar
            ? AbortSignal.any([kendali.signal, sinyalLuar, AbortSignal.timeout(batasMs)])
            : AbortSignal.any([kendali.signal, AbortSignal.timeout(batasMs)]);

          const ambil = (jalur) =>
            denganUlang(async () => {
              const r = await fetch(jalur, { signal: sinyal });
              if (r.status === 429 || r.status >= 500) {
                throw new ErrorHttp(r.status, Number(r.headers.get('Retry-After')) || null);
              }
              if (!r.ok) throw new Error(\`\${r.status} pada \${jalur}\`);
              return r.json();
            }, { maks: 3, dasarMs: 200 });

          const mulai = performance.now();

          try {
            // Dua yang WAJIB. Kalau salah satu gagal, halaman tidak berarti.
            const wajib = Promise.all([ambil(\`/api/produk/\${id}\`), ambil(\`/api/stok/\${id}\`)]);

            // Dua yang PELENGKAP. Kegagalannya tidak boleh mengosongkan halaman.
            const pelengkap = Promise.allSettled([
              ambil(\`/api/ulasan/\${id}\`),
              ambil(\`/api/rekomendasi/\${id}\`),
            ]);

            const [[produk, stok], [ulasan, rekomendasi]] = await Promise.all([wajib, pelengkap]);

            return {
              produk,
              stok,
              ulasan: ulasan.status === 'fulfilled' ? ulasan.value : [],
              rekomendasi: rekomendasi.status === 'fulfilled' ? rekomendasi.value : [],
              gagalSebagian: [ulasan, rekomendasi]
                .filter((h) => h.status === 'rejected')
                .map((h) => h.reason.message),
              msTotal: Math.round(performance.now() - mulai),
            };
          } finally {
            // Apa pun hasilnya, jangan tinggalkan permintaan menggantung.
            kendali.abort();
          }
        }
        `,
        { filename: 'src/produk/muat-halaman.js' },
      ),
      p(
        'Bagian paling menentukan ada di dua baris pembentukan `wajib` dan `pelengkap`. Keduanya **tidak** di-`await` di baris pembuatannya, sehingga keempat permintaan sudah berangkat bersamaan pada saat itu juga. Barulah `Promise.all([wajib, pelengkap])` di bawahnya menunggu keduanya. Kalau `wajib` di-`await` lebih dulu di barisnya sendiri, dua permintaan pelengkap baru berangkat sesudahnya dan seluruh keuntungan paralel hilang.',
      ),
      p(
        'Pemisahan wajib dan pelengkap adalah keputusan produk, bukan keputusan teknis, dan itu perlu ditegaskan. `Promise.all` untuk yang wajib berarti halaman menolak tampil tanpa data produk atau stok, dan itu benar sebab harga tanpa stok bisa menyesatkan pembeli. `allSettled` untuk yang pelengkap berarti ulasan yang mati tidak menghalangi orang membeli. Yang menentukan pembagian ini bukan seberapa penting datanya menurut pemrogram, melainkan apakah halaman masih berguna tanpanya.',
      ),
      p(
        'Field `gagalSebagian` mengembalikan daftar pesan dari bagian yang gagal, dan itu sengaja dibuat bagian dari hasil bukan sekadar dicatat diam-diam. Tampilan bisa memakainya untuk menampilkan pemberitahuan kecil di bagian ulasan alih-alih membiarkan area itu kosong tanpa penjelasan. Ini penerapan langsung dari aturan empat keadaan tampilan, yaitu kegagalan sebagian tetap harus punya wujud yang bisa dilihat pengguna.',
      ),
      p(
        'Blok `finally` yang memanggil `kendali.abort()` berjalan pada ketiga kemungkinan, yaitu berhasil, gagal, dan dibatalkan dari luar. Pada jalur berhasil ia tidak melakukan apa-apa yang terasa, sebab seluruh permintaan sudah selesai. Pada jalur gagal ia penting, sebab `Promise.all` yang menolak tidak membatalkan anggota lain, dan tanpa baris ini dua permintaan pelengkap tetap berjalan tanpa ada yang memakai hasilnya.',
      ),
      p(
        'Parameter `sinyalLuar` membuat fungsi ini bisa dibatalkan oleh pemanggilnya, misalnya saat pengguna berpindah halaman sebelum pemuatan selesai. Menggabungkannya dengan `AbortSignal.any` berarti ada tiga alasan berhenti yang berlaku sekaligus, yaitu pembersihan internal, permintaan dari luar, dan kehabisan waktu. Pemanggil tidak perlu tahu ketiganya, ia cukup memberikan sinyalnya sendiri.',
      ),
      callout(
        'tip',
        'Kembalikan angka waktunya, jangan hanya mencatatnya',
        'Field `msTotal` terlihat sepele dan sangat berguna. Begitu angka itu ikut dikembalikan, ia bisa dikirim ke pemantauan, ditampilkan di mode pengembangan, atau dipakai di test yang memastikan pemuatan tidak melewati anggaran. Angka yang hanya dicetak ke console hilang begitu tab ditutup.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Fungsi yang menggabungkan banyak teknik punya kegagalan gabungan juga. Empat berikut adalah yang paling sering muncul saat pola ini dipasang pertama kali.',
      ),
      code(
        'text',
        `
        const [produk, stok] = await Promise.all([ambil(a), ambil(b)]);
        const [ulasan] = await Promise.allSettled([ambil(c)]);

        // Total 340 ms, padahal seharusnya 200 ms.
        `,
        { caption: 'Kelompok kedua baru berangkat setelah kelompok pertama selesai.' },
      ),
      p(
        'Ini kesalahan paralel yang paling halus, sebab kedua barisnya sendiri sudah memakai `Promise.all` dengan benar. Yang salah adalah `await` pertama menahan seluruh baris berikutnya. Aturan yang bisa dipegang, buat **seluruh** janji lebih dulu tanpa `await`, baru tunggu semuanya di satu tempat. Kalau kamu melihat dua `await Promise.all` berurutan, hampir selalu keduanya bisa digabung.',
      ),
      code(
        'text',
        `
        const hasil = await muatHalamanProduk(7);
        console.log(hasil.ulasan.length);
                                 ^

        TypeError: Cannot read properties of undefined (reading 'length')
        `,
        { caption: 'Hasil `allSettled` dibaca tanpa memeriksa statusnya.' },
      ),
      p(
        "Kalau baris pemetaan `ulasan.status === 'fulfilled' ? ulasan.value : []` dilupakan, yang tersimpan di field `ulasan` adalah object pembungkus `{ status, reason }` dan bukan arraynya. Pemakainya lalu membaca `.length` dari sesuatu yang tidak punya `length`. Perhatikan nilai cadangannya berupa array kosong, bukan `null`, sehingga pemakainya bisa langsung memetakannya tanpa pemeriksaan tambahan.",
      ),
      code(
        'text',
        `
        Error: 8000 ms terlampaui

        # Padahal tiap permintaan sendiri hanya 200 ms.
        `,
        { caption: 'Batas waktu total termakan oleh pengulangan.' },
      ),
      p(
        'Ini jebakan gabungan antara batas waktu dan pengulangan yang mudah terlewat. Sinyal batas waktu berlaku untuk **seluruh** rangkaian, sedangkan `denganUlang` menambahkan jeda di antara percobaan. Tiga percobaan dengan backoff bisa menghabiskan lebih dari satu detik hanya untuk menunggu, dan itu sebelum permintaan terakhirnya berjalan. Kalau angka batas waktunya ketat, kurangi jumlah percobaannya, atau berikan batas waktu per percobaan alih-alih untuk keseluruhan.',
      ),
      code(
        'text',
        `
        AbortError: This operation was aborted

        # Muncul pada pemuatan yang seharusnya berhasil.
        `,
        { caption: 'Sinyal dari `finally` membatalkan pengulangan yang sedang berjalan.' },
      ),
      p(
        'Kalau `kendali.abort()` di `finally` dijalankan sementara masih ada percobaan ulang yang tertunda dalam jeda, percobaan itu akan langsung gagal dengan `AbortError`. Pada contoh di atas hal ini tidak terjadi karena `finally` baru berjalan setelah seluruh `await` selesai. Ia menjadi masalah kalau kamu memindahkan `abort` ke tempat lain, misalnya ke penangan `catch` yang berjalan lebih awal. Urutan antara pembatalan dan pengulangan perlu diperiksa setiap kali keduanya dipakai bersama.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Waktu total sama dengan jumlah kelompok, bukan yang terlama',
            'Kelompok kedua baru dibuat setelah kelompok pertama ditunggu',
            'Buat seluruh janji lebih dulu, baru tunggu di satu tempat',
          ],
          [
            '`Cannot read properties of undefined` pada hasil pelengkap',
            'Hasil `allSettled` dipakai tanpa dipetakan',
            'Petakan lewat `.status` dan `.value`, dengan nilai cadangan yang bertipe sama',
          ],
          [
            'Batas waktu tercapai padahal tiap permintaan cepat',
            'Jeda antar-percobaan ikut memakan anggaran waktu',
            'Kurangi jumlah percobaan, atau pasang batas per percobaan',
          ],
          [
            '`AbortError` pada pemuatan yang seharusnya berhasil',
            'Pembatalan dijalankan sebelum seluruh percobaan selesai',
            'Pastikan `abort` hanya berjalan setelah seluruh `await` selesai',
          ],
          [
            'Permintaan pelengkap tetap berjalan setelah halaman ditutup',
            'Tidak ada pembatalan saat keluar dari fungsi',
            'Panggil `abort` di `finally`, dan terima sinyal dari pemanggil',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik terakhir bab ini adalah tempat seluruh materi bertemu, dan kesalahan yang muncul di sini biasanya berupa satu teknik yang dipakai tanpa mempertimbangkan teknik lain di sekitarnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menganggap seluruh data halaman sama pentingnya',
            'Semuanya kan ditampilkan',
            'Satu bagian pelengkap yang mati akan mengosongkan seluruh halaman. Putuskan mana yang wajib berdasarkan apakah halaman masih berguna tanpanya',
          ],
          [
            'Memasang pengulangan tanpa memikirkan batas waktu total',
            'Keduanya sama-sama membuat lebih tangguh',
            'Jeda pengulangan memakan anggaran batas waktu, sehingga permintaan yang sebenarnya sehat ikut dibatalkan',
          ],
          [
            'Mengukur kecepatan hanya dari `console.time` di mesin sendiri',
            'Angkanya nyata dan langsung terlihat',
            'Mesin pengembangan dan jaringan lokal jauh lebih cepat. Kembalikan angkanya sebagai bagian hasil supaya bisa diukur di perangkat pengguna',
          ],
          [
            'Menulis satu fungsi pemuat raksasa untuk seluruh halaman',
            'Semua pemanggilan jadi berada di satu tempat',
            'Ia menjadi sulit diuji dan sulit dipakai ulang. Pisahkan pengambil per sumber, lalu rakit di satu fungsi yang hanya mengatur',
          ],
          [
            'Melupakan pembatalan karena halamannya jarang ditinggalkan',
            'Pengguna biasanya menunggu sampai selesai',
            'Navigasi cepat dan tombol kembali sangat umum di ponsel. Permintaan yang menggantung menghabiskan kuota dan bisa menulis ke tampilan yang sudah hilang',
          ],
          [
            'Menyembunyikan kegagalan sebagian supaya halaman terlihat rapi',
            'Pengguna tidak perlu tahu detail teknis',
            'Area kosong tanpa penjelasan lebih membingungkan daripada satu baris yang menyebutkan ulasan gagal dimuat beserta tombol coba lagi',
          ],
        ],
      ),
      p(
        'Baris pertama adalah keputusan yang paling sering diambil tanpa dipikirkan, padahal ia menentukan seluruh bentuk fungsinya. Cara memutuskannya sederhana, yaitu bayangkan bagian itu kosong lalu tanyakan apakah pengguna masih bisa menyelesaikan tujuannya. Kalau ia masih bisa membeli tanpa melihat rekomendasi, rekomendasi adalah pelengkap. Kalau ia tidak bisa membeli tanpa tahu stok, stok adalah wajib.',
      ),
      callout(
        'info',
        'Bab berikutnya melanjutkan dari titik ini',
        'Seluruh pola di sub-bab ini, yaitu paralel untuk yang independen, kegagalan sebagian yang tetap ditampilkan, pembatalan saat berpindah, dan angka waktu yang bisa diukur, akan muncul lagi di Frontend Intermediate sebagai bagian bawaan pustaka pengambil data. Memahami bentuk manualnya lebih dulu membuat pustaka itu terbaca sebagai penyingkat, bukan sebagai sihir.',
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
