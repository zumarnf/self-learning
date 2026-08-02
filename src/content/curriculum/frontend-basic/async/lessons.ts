import { callout, code, divider, h2, ol, p, steps, table, ul } from '@/lib/content/builders';
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
    ],
  ),
];
