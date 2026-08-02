import {
  callout,
  checklist,
  code,
  divider,
  h2,
  ol,
  p,
  playground,
  steps,
  table,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/** Frontend Basic — Chapter 1, lessons 1.13 to 1.16 (the closing practice). */
export const lessons: LessonDraft[] = [
  written(
    'modul-es',
    'Modul ES: `import` & `export`',
    11,
    'Memecah kode ke banyak berkas tanpa membuat kekacauan variabel global.',
    [
      p(
        'Begitu sebuah berkas melewati beberapa ratus baris, ia berhenti bisa dibaca. Modul memecahnya menjadi bagian-bagian yang punya batas jelas: tiap berkas menyatakan apa yang ia **berikan** ke luar, dan apa yang ia **butuh** dari luar.',
      ),

      h2('Named export'),
      code(
        'js',
        `
        export const PAJAK = 0.11;

        export function hitungTotal(harga) {
          return harga * (1 + PAJAK);
        }

        // Boleh juga dikumpulkan di akhir berkas
        const rahasiaInternal = 'tidak diekspor';
        function format(n) { return \`Rp\${n}\`; }

        export { format };
        `,
        { filename: 'src/lib/harga.js' },
      ),
      code(
        'js',
        `
        import { PAJAK, hitungTotal } from './lib/harga.js';
        import { format as formatRupiah } from './lib/harga.js';   // ganti nama saat impor

        hitungTotal(10000);   // 11100
        `,
        { filename: 'src/app.js' },
      ),
      p(
        'Apa pun yang tidak di-`export` **tidak bisa** disentuh dari luar berkas. Itu batas yang dijaga bahasa, bukan sekadar kesepakatan.',
      ),

      h2('Default export'),
      code(
        'js',
        `
        export default function Tombol() { /* ... */ }
        `,
        { filename: 'Tombol.js' },
      ),
      code(
        'js',
        `
        import Tombol from './Tombol.js';       // tanpa kurung kurawal
        import ApaPun from './Tombol.js';       // namanya bebas — dan itu masalahnya
        `,
      ),
      table(
        ['', 'Named', 'Default'],
        [
          ['Jumlah per berkas', 'Banyak', 'Maksimal satu'],
          ['Sintaks impor', '`{ nama }`', 'tanpa kurawal'],
          ['Nama saat impor', 'Harus sama (kecuali `as`)', 'Bebas'],
          ['Autocomplete editor', 'Bekerja', 'Sering meleset'],
          ['Ganti nama massal', 'Otomatis di seluruh project', 'Manual satu per satu'],
        ],
      ),
      callout(
        'tip',
        'Pilih named export sebagai default',
        'Nama yang konsisten membuat pencarian, autocomplete, dan rename otomatis bekerja. Default export membuat berkas yang sama diimpor dengan tiga nama berbeda di tiga tempat, dan tidak ada alat yang bisa merapikannya. Pengecualian yang wajar: berkas yang memang hanya berisi satu hal, seperti komponen halaman di Next.js — yang bahkan mewajibkannya.',
      ),

      h2('Re-export dan berkas indeks'),
      code(
        'js',
        `
        export { Tombol } from './Tombol.js';
        export { Kartu } from './Kartu.js';
        export * from './form/index.js';
        `,
        {
          filename: 'src/components/index.js',
          caption: 'Satu pintu masuk untuk sekelompok modul.',
        },
      ),
      callout(
        'warning',
        'Berkas indeks tidak gratis',
        'Ia merapikan impor, tapi bisa menarik seluruh isi folder ke dalam bundle meski kamu hanya memakai satu komponen, dan mempermudah terjadinya impor melingkar. Pakai untuk kelompok yang memang selalu dipakai bersama, bukan untuk setiap folder.',
      ),

      h2('Path, ekstensi, dan alias'),
      code(
        'js',
        `
        import { a } from './tetangga.js';       // relatif — satu folder
        import { b } from '../lib/util.js';      // naik satu folder
        import { c } from '@/lib/util';          // alias — dikonfigurasi di project
        import React from 'react';               // dari node_modules
        `,
      ),
      p(
        'Di browser, ekstensi `.js` **wajib** ditulis. Bundler seperti Vite dan Next.js membolehkannya dihilangkan dan menerjemahkan alias `@/`. Project ini memakai alias `@/` yang menunjuk ke `src/`.',
      ),

      h2('ESM vs CommonJS'),
      p('Kamu akan bertemu keduanya, terutama di kode Node.js yang lebih lama.'),
      code(
        'js',
        `
        // CommonJS — gaya lama Node.js
        const { hitung } = require('./harga');
        module.exports = { hitung };

        // ESM — standar bahasa, dipakai di browser maupun Node modern
        import { hitung } from './harga.js';
        export { hitung };
        `,
      ),
      table(
        ['', 'CommonJS', 'ESM'],
        [
          ['Dimuat', 'Saat baris dijalankan', 'Dianalisis sebelum dijalankan'],
          ['Bisa dinamis', 'Ya, `require` di mana saja', 'Hanya lewat `import()`'],
          ['Tree-shaking', 'Sulit', 'Bisa — kode tak terpakai dibuang'],
          ['Berjalan di browser', 'Tidak', 'Ya'],
          ['`await` di level atas', 'Tidak', 'Ya'],
        ],
      ),
      callout(
        'info',
        'Cara Node menentukan yang mana',
        'Node memakai ESM kalau `package.json` berisi `"type": "module"`, atau berkasnya berekstensi `.mjs`. Tanpa itu, ia memakai CommonJS. Project ini memakai `"type": "module"`.',
      ),

      h2('Dynamic import'),
      code(
        'js',
        `
        // Statis — selalu ikut dimuat
        import { Chart } from 'chart.js';

        // Dinamis — dimuat hanya saat benar-benar dibutuhkan
        tombol.addEventListener('click', async () => {
          const { Chart } = await import('chart.js');
          new Chart(/* ... */);
        });
        `,
      ),
      p(
        'Inilah mekanisme di balik *code splitting*. Website ini memakainya untuk playground: editor kodenya berukuran besar, jadi ia baru diunduh saat kamu menekan tombol Jalankan.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Yang tidak di-`export` tidak bisa disentuh dari luar — batasnya dijaga bahasa.',
        'Named export sebagai default; default export hanya untuk berkas satu-isi.',
        'Berkas indeks merapikan impor tapi bisa menggemukkan bundle.',
        'ESM adalah standar; CommonJS masih hidup di Node lama.',
        '`import()` dinamis memuat kode saat dibutuhkan — dasar dari code splitting.',
      ),
    ],
  ),

  written(
    'error-handling',
    'Error Handling: `try`, `catch`, `finally`',
    12,
    'Menangani kegagalan dengan sengaja — bukan menyembunyikannya sampai jadi kerusakan diam-diam.',
    [
      p(
        'Kode yang berjalan mulus adalah kasus yang paling jarang terjadi di produksi. Jaringan putus, input aneh, berkas tidak ada, server balas 500. Bab ini soal bersikap terhadap kegagalan dengan sadar.',
      ),

      h2('`try` / `catch` / `finally`'),
      code(
        'js',
        `
        try {
          const data = JSON.parse(teksMentah);
          console.log(data);
        } catch (error) {
          console.error('Gagal membaca JSON:', error.message);
        } finally {
          // Selalu jalan — baik berhasil maupun gagal, bahkan setelah return
          matikanIndikatorMemuat();
        }
        `,
      ),
      code(
        'js',
        `
        // catch boleh tanpa parameter kalau errornya memang tidak dipakai
        try {
          risiko();
        } catch {
          gunakanNilaiCadangan();
        }
        `,
      ),

      h2('`throw` dan objek `Error`'),
      code(
        'js',
        `
        function bagi(a, b) {
          if (b === 0) {
            throw new Error('Pembagi tidak boleh nol');
          }
          return a / b;
        }

        try {
          bagi(10, 0);
        } catch (error) {
          error.name;      // 'Error'
          error.message;   // 'Pembagi tidak boleh nol'
          error.stack;     // jejak sampai ke baris yang melempar
        }
        `,
      ),
      callout(
        'warning',
        'Selalu lempar objek `Error`, bukan string',
        '`throw "gagal"` memang sah secara sintaks, tapi hasilnya tidak punya `stack`, tidak punya `name`, dan tidak bisa dibedakan jenisnya. Saat kamu menelusuri bug jam sebelas malam, jejak tumpukan itu satu-satunya petunjuk yang kamu punya.',
      ),

      h2('Error kustom'),
      p(
        'Membuat kelas error sendiri membuat pemanggil bisa **membedakan** jenis kegagalan, alih-alih mencocokkan teks pesan.',
      ),
      code(
        'js',
        `
        class ValidasiError extends Error {
          constructor(field, pesan) {
            super(pesan);
            this.name = 'ValidasiError';
            this.field = field;      // konteks tambahan yang berguna
          }
        }

        function simpanPengguna(data) {
          if (!data.email?.includes('@')) {
            throw new ValidasiError('email', 'Format email tidak valid');
          }
          // ...
        }

        try {
          simpanPengguna({ email: 'salah' });
        } catch (error) {
          if (error instanceof ValidasiError) {
            tampilkanErrorDiField(error.field, error.message);   // bisa ditindaklanjuti
          } else {
            throw error;   // bukan urusan kita — teruskan ke atas
          }
        }
        `,
      ),
      callout(
        'tip',
        'Melempar ulang bukan kemalasan',
        'Menangkap error yang tidak bisa kamu tangani, lalu menelannya, adalah cara paling efektif menyembunyikan bug. Tangkap yang kamu tahu cara menanganinya; sisanya biarkan naik ke atas.',
      ),

      h2('Anti-pola: `catch` yang menelan'),
      code(
        'js',
        `
        // SALAH: Kegagalan berisik berubah jadi kerusakan data diam-diam
        try {
          simpanKeServer(data);
        } catch (e) {}

        // SALAH: Sedikit lebih baik, tapi tetap berbohong ke pengguna:
        // dia mengira tersimpan, padahal tidak
        try {
          simpanKeServer(data);
        } catch (e) {
          console.log(e);
        }

        // BENAR: Catat untuk penelusuran, DAN beri tahu pengguna, DAN jangan pura-pura berhasil
        try {
          await simpanKeServer(data);
          tampilkanPesan('Tersimpan');
        } catch (error) {
          console.error('[simpan] gagal', error);
          tampilkanError('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
        }
        `,
      ),

      h2('Membedakan kegagalan yang diharapkan dari bug'),
      table(
        ['Jenis', 'Contoh', 'Sikap'],
        [
          [
            'Diharapkan',
            'Input tidak valid, data tidak ditemukan, koneksi putus',
            'Bagian dari kontrak. Tangani, beri pesan yang bisa ditindaklanjuti',
          ],
          [
            'Tak terduga (bug)',
            '`undefined is not a function`, invariant yang dilanggar',
            'Catat lengkap, tampilkan pesan generik, jangan coba dipulihkan',
          ],
        ],
      ),
      code(
        'js',
        `
        // Yang dilihat pengguna: umum. Yang masuk log: lengkap.
        catch (error) {
          console.error('[checkout] gagal memproses', { orderId, error });
          tampilkanError('Pesanan gagal diproses. Silakan coba lagi.');
        }
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menampilkan pesan error mentah ke pengguna',
        'Stack trace dan pesan internal membocorkan struktur sistem, jalur berkas, dan kadang nama tabel — informasi berharga bagi penyerang. Detail tetap di log server; pengguna dapat pesan yang bisa ditindaklanjuti.',
      ),

      h2('Error pada kode asinkron'),
      code(
        'js',
        `
        // try/catch TIDAK menangkap error dari kode asinkron di dalamnya
        try {
          setTimeout(() => { throw new Error('tidak tertangkap'); }, 0);
        } catch (e) {
          // tidak pernah tercapai
        }

        // Dengan async/await, try/catch bekerja seperti biasa
        async function ambilData() {
          try {
            const res = await fetch('/api/data');
            if (!res.ok) throw new Error(\`Server balas \${res.status}\`);
            return await res.json();
          } catch (error) {
            console.error('[ambilData]', error);
            throw error;   // biarkan pemanggil memutuskan tampilannya
          }
        }
        `,
      ),
      p(
        'Perilaku asinkron dibahas tuntas di Bab 3 — untuk sekarang cukup tahu bahwa ada perbedaannya.',
      ),

      h2('Jaring pengaman terakhir'),
      code(
        'js',
        `
        window.addEventListener('error', (e) => {
          kirimKeLayananPemantauan(e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
          kirimKeLayananPemantauan(e.reason);
        });
        `,
        { caption: 'Untuk menangkap yang lolos — bukan pengganti penanganan di tempatnya.' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Selalu `throw new Error(...)`, jangan string — jejak tumpukan itu berharga.',
        'Error kustom membuat pemanggil bisa membedakan jenis kegagalan tanpa mencocokkan teks.',
        '`catch` kosong mengubah kegagalan berisik jadi kerusakan data diam-diam.',
        'Tangkap yang bisa kamu tangani; lempar ulang sisanya.',
        'Detail lengkap ke log, pesan generik yang bisa ditindaklanjuti ke pengguna.',
        '`try`/`catch` tidak menangkap error dari callback asinkron seperti `setTimeout`.',
      ),
    ],
  ),

  written(
    'debugging',
    'Debugging dengan DevTools & `"use strict"`',
    11,
    'Menemukan penyebab masalah dengan alat, bukan dengan menebak lalu mengubah baris acak.',
    [
      p(
        'Debugging bukan menebak lalu mengubah sesuatu sampai kebetulan jalan. Ia adalah proses: reproduksi masalahnya, persempit, buat hipotesis, lalu buktikan salah satunya. Alatnya sudah ada di browsermu.',
      ),

      h2('Console lebih dari sekadar `log`'),
      code(
        'js',
        `
        console.log('nilai:', x);

        console.table([{ nama: 'Zum', umur: 24 }, { nama: 'Ani', umur: 30 }]);
        // Menampilkan array of object sebagai tabel — jauh lebih terbaca

        console.group('Proses checkout');
        console.log('validasi lolos');
        console.log('pembayaran dikirim');
        console.groupEnd();

        console.time('ambilData');
        await ambilData();
        console.timeEnd('ambilData');    // ambilData: 342.1ms

        console.assert(total > 0, 'Total seharusnya positif, dapat:', total);
        console.count('render');          // menghitung berapa kali baris ini dilewati

        console.warn('deprecated');
        console.error('gagal');           // keduanya menampilkan jejak tumpukan
        `,
      ),
      callout(
        'tip',
        'Trik yang menghemat banyak waktu',
        '`console.log({ x, y, z })` — dengan kurung kurawal — mencetak **nama beserta nilainya**. Tanpa itu kamu sering melihat tiga angka tanpa tahu yang mana yang mana.',
      ),

      h2('Breakpoint: berhenti dan lihat sendiri'),
      p(
        '`console.log` memberi tahu satu nilai pada satu titik. Breakpoint membekukan program dan membiarkanmu memeriksa **semuanya** pada titik itu.',
      ),
      steps(
        {
          title: 'Buka Sources (Chrome) atau Debugger (Firefox)',
          body: 'Cari berkasmu di panel kiri. Untuk kode yang sudah di-bundle, aktifkan source map supaya yang tampil adalah kode aslimu.',
        },
        {
          title: 'Klik nomor barisnya',
          body: 'Eksekusi akan berhenti tepat sebelum baris itu dijalankan.',
        },
        {
          title: 'Periksa panel Scope',
          body: 'Ia menampilkan semua variabel yang terlihat di titik itu — lokal, closure, dan global sekaligus.',
        },
        {
          title: 'Melangkah',
          body: 'Step over menjalankan satu baris. Step into masuk ke dalam fungsi yang dipanggil. Step out keluar dan kembali ke pemanggil.',
        },
        {
          title: 'Baca Call Stack',
          body: 'Daftar siapa memanggil siapa, dari yang terbaru ke terlama. Ini yang menjawab "kenapa fungsi ini sampai dijalankan?".',
        },
      ),
      code(
        'js',
        `
        function hitung(items) {
          debugger;   // berhenti di sini KALAU DevTools sedang terbuka
          return items.reduce((a, b) => a + b.harga, 0);
        }
        `,
        {
          caption:
            'Berguna untuk kode yang sulit dicari di panel Sources. Jangan sampai ikut ter-commit.',
        },
      ),
      callout(
        'info',
        'Conditional breakpoint',
        'Klik kanan pada nomor baris → Add conditional breakpoint. Isi misalnya `item.id === 42`. Loop yang berjalan seribu kali jadi hanya berhenti pada iterasi yang benar-benar kamu selidiki.',
      ),

      h2('Membaca jejak tumpukan'),
      code(
        'text',
        `
        TypeError: Cannot read properties of undefined (reading 'nama')
            at tampilkanProfil (profil.js:12:26)
            at renderHalaman (app.js:45:3)
            at app.js:78:1
        `,
      ),
      ol(
        '**Baris pertama** menyebut jenis dan pesannya. "reading \'nama\'" berarti sesuatu di sebelah kiri `.nama` bernilai `undefined`.',
        '**Baris kedua** adalah tempat kejadiannya: `profil.js` baris 12. Mulai dari sini.',
        '**Baris berikutnya** adalah rantai pemanggil, dari terbaru ke terlama — jawaban atas "kenapa fungsi ini dipanggil".',
      ),

      h2('`"use strict"`'),
      p(
        'Mode ketat mengubah beberapa kesalahan diam-diam menjadi error yang terlihat. **Modul ES otomatis strict**, jadi kalau kamu memakai `import`/`export` atau `<script type="module">`, kamu sudah berada di dalamnya.',
      ),
      code(
        'js',
        `
        'use strict';

        namaSalahKetik = 'Zum';
        // Tanpa strict: diam-diam membuat variabel GLOBAL baru — bug yang sulit dilacak
        // Dengan strict: ReferenceError: namaSalahKetik is not defined

        const beku = Object.freeze({ a: 1 });
        beku.a = 2;
        // Tanpa strict: gagal diam-diam
        // Dengan strict: TypeError
        `,
      ),
      table(
        ['Tanpa strict', 'Dengan strict'],
        [
          ['Salah ketik membuat variabel global', '`ReferenceError`'],
          ['Menulis ke property beku gagal diam-diam', '`TypeError`'],
          ['`this` jadi `window` di fungsi biasa', '`this` jadi `undefined`'],
          ['Parameter duplikat diizinkan', '`SyntaxError`'],
        ],
      ),

      h2('Alat lain yang sering menyelamatkan'),
      ul(
        '**Tab Network** — lihat permintaan yang benar-benar dikirim: status, header, body. Sering ternyata masalahnya bukan di kodemu.',
        '**Tab Elements** — periksa DOM yang sedang tampil dan CSS yang benar-benar berlaku, bukan yang kamu kira berlaku.',
        '**Tab Application** — isi `localStorage`, cookie, dan cache.',
        '**Tab Performance** — untuk masalah lambat. Ukur dulu, jangan menebak.',
        '**Pause on exceptions** (ikon jeda di Sources) — otomatis berhenti tepat saat error terjadi.',
      ),

      h2('Disiplin yang membuat debugging cepat'),
      ol(
        '**Reproduksi dulu.** Bug yang tidak bisa kamu munculkan lagi tidak bisa kamu buktikan sudah diperbaiki.',
        '**Persempit.** Buang bagian yang tidak berhubungan sampai tersisa contoh sekecil mungkin yang masih gagal.',
        '**Tulis hipotesis, jangan langsung ubah.** "Saya duga `items` sudah kosong sebelum sampai sini" bisa dibuktikan salah; "coba ubah ini" tidak.',
        '**Ubah satu hal.** Dua perubahan sekaligus membuatmu tidak tahu mana yang berpengaruh.',
        '**Setelah beres, tulis test yang menangkapnya.** Kalau tidak, bug yang sama akan kembali.',
      ),
      callout(
        'warning',
        'Kalau tiga perbaikan berturut-turut gagal — berhenti',
        'Percobaan keempat hampir tidak pernah berhasil. Kegagalan berulang biasanya berarti model mentalmu tentang sistem itu yang salah, bukan barisnya. Mundur, baca ulang alurnya dari awal.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`console.log({ x })` mencetak nama beserta nilainya.',
        '`console.table` untuk array of object; `console.time` untuk mengukur.',
        'Breakpoint memperlihatkan seluruh keadaan, bukan satu nilai.',
        'Jejak tumpukan dibaca dari atas: jenis → lokasi → rantai pemanggil.',
        'Modul ES otomatis `"use strict"` — salah ketik jadi error, bukan variabel global baru.',
        'Reproduksi → persempit → hipotesis → ubah satu hal → tulis test.',
      ),
    ],
  ),

  written(
    'praktik-todo-logic',
    'Praktik: Logika To-Do List tanpa DOM',
    16,
    'Menggabungkan seluruh bab menjadi satu modul logika yang bisa diuji — tanpa satu baris pun kode tampilan.',
    [
      p(
        'Praktik penutup bab ini sengaja **tidak menyentuh DOM sama sekali**. Memisahkan logika dari tampilan adalah keputusan yang membentuk seluruh sisa kurikulum: modul yang tidak tahu-menahu soal layar bisa diuji di terminal, dipakai ulang di server, dan dipindahkan ke React tanpa diubah.',
      ),
      p(
        'Tampilannya akan dipasang di Bab 4 — memakai modul yang sama persis dengan yang kamu tulis sekarang.',
      ),

      h2('1. Rancang bentuk datanya lebih dulu'),
      p(
        'Sebelum menulis fungsi, putuskan seperti apa satu tugas itu. Keputusan ini menentukan segalanya yang datang setelahnya.',
      ),
      code(
        'js',
        `
        /**
         * @typedef {object} Tugas
         * @property {string}  id        Identitas unik dan stabil
         * @property {string}  judul     Selalu sudah di-trim, tidak pernah kosong
         * @property {boolean} selesai
         * @property {string}  dibuatPada  ISO 8601
         */
        `,
        { filename: 'src/todo.js' },
      ),
      callout(
        'tip',
        'Kenapa `id` bukan indeks array',
        'Indeks berubah begitu ada penghapusan atau pengurutan. Identitas yang berubah bukan identitas. Ini pelajaran yang sama yang akan muncul lagi sebagai `key` di React.',
      ),

      h2('2. Fungsi murni, tanpa mutasi'),
      code(
        'js',
        `
        export function buatTugas(judul) {
          const bersih = judul.trim();

          if (bersih.length === 0) {
            throw new Error('Judul tugas tidak boleh kosong');
          }

          return {
            id: crypto.randomUUID(),
            judul: bersih,
            selesai: false,
            dibuatPada: new Date().toISOString(),
          };
        }

        // Setiap fungsi mengembalikan array BARU — aslinya tidak pernah disentuh
        export function tambah(daftar, tugas) {
          return [...daftar, tugas];
        }

        export function hapus(daftar, id) {
          return daftar.filter((t) => t.id !== id);
        }

        export function toggleSelesai(daftar, id) {
          return daftar.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t));
        }

        export function ubahJudul(daftar, id, judulBaru) {
          const bersih = judulBaru.trim();
          if (bersih.length === 0) throw new Error('Judul tugas tidak boleh kosong');

          return daftar.map((t) => (t.id === id ? { ...t, judul: bersih } : t));
        }
        `,
        { filename: 'src/todo.js' },
      ),
      callout(
        'info',
        'Kenapa tidak ada satu pun `push` atau `splice`',
        'Fungsi yang tidak mengubah masukannya bisa dipanggil berkali-kali dengan hasil yang sama, mudah diuji, dan tidak pernah mengejutkan pemanggil lain yang kebetulan memegang array yang sama. Di Bab 4 Frontend Intermediate kamu akan melihat bahwa React **mengharuskan** ini.',
      ),

      h2('3. Menyaring dan meringkas'),
      code(
        'js',
        `
        export const FILTER = {
          SEMUA: 'semua',
          AKTIF: 'aktif',
          SELESAI: 'selesai',
        };

        export function saring(daftar, filter) {
          switch (filter) {
            case FILTER.AKTIF:
              return daftar.filter((t) => !t.selesai);
            case FILTER.SELESAI:
              return daftar.filter((t) => t.selesai);
            case FILTER.SEMUA:
              return daftar;
            default:
              throw new Error(\`Filter tidak dikenal: \${filter}\`);
          }
        }

        export function cari(daftar, kata) {
          const q = kata.trim().toLowerCase();
          if (q.length === 0) return daftar;
          return daftar.filter((t) => t.judul.toLowerCase().includes(q));
        }

        export function ringkasan(daftar) {
          const selesai = daftar.filter((t) => t.selesai).length;
          return {
            total: daftar.length,
            selesai,
            aktif: daftar.length - selesai,
            // Perhatikan penjaga pembagian nol — daftar kosong itu kasus yang sah
            persen: daftar.length === 0 ? 0 : Math.round((selesai / daftar.length) * 100),
          };
        }
        `,
        { filename: 'src/todo.js' },
      ),

      h2('4. Jalankan dan buktikan sendiri'),
      code(
        'js',
        `
        import { buatTugas, tambah, toggleSelesai, saring, ringkasan, FILTER } from './todo.js';

        let daftar = [];

        daftar = tambah(daftar, buatTugas('Belajar closure'));
        daftar = tambah(daftar, buatTugas('Latihan reduce'));
        daftar = tambah(daftar, buatTugas('  Baca bab 2  '));   // spasi ikut dibersihkan

        console.log(daftar[2].judul);   // 'Baca bab 2'

        daftar = toggleSelesai(daftar, daftar[0].id);

        console.table(daftar);
        console.log(saring(daftar, FILTER.AKTIF).length);   // 2
        console.log(ringkasan(daftar));
        // { total: 3, selesai: 1, aktif: 2, persen: 33 }
        `,
        { filename: 'src/main.js' },
      ),

      h2('5. Uji jalur yang tidak bahagia'),
      p(
        'Jalur sukses adalah bagian yang paling jarang rusak. Nilai sebenarnya ada pada kasus yang tidak nyaman.',
      ),
      code(
        'js',
        `
        // Judul kosong harus ditolak, bukan diam-diam masuk
        try {
          buatTugas('   ');
        } catch (e) {
          console.log('OK, ditolak:', e.message);
        }

        // Daftar kosong tidak boleh membuat apa pun jatuh
        console.log(ringkasan([]));                 // { total: 0, ..., persen: 0 }
        console.log(saring([], FILTER.AKTIF));      // []

        // Id yang tidak ada tidak boleh mengubah apa pun dan tidak boleh error
        const sebelum = [...daftar];
        const sesudah = hapus(daftar, 'id-yang-tidak-ada');
        console.log(sesudah.length === sebelum.length);   // true

        // Filter tak dikenal harus berteriak, bukan diam-diam mengembalikan semua
        try {
          saring(daftar, 'entah');
        } catch (e) {
          console.log('OK, ditolak:', e.message);
        }
        `,
      ),

      h2('Coba langsung'),
      playground(
        'vanilla',
        {
          '/index.html': `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Logika To-Do</title>
  </head>
  <body>
    <h1>Logika To-Do</h1>
    <p>Buka console untuk melihat hasilnya.</p>
    <script type="module" src="./index.js"></script>
  </body>
</html>
`,
          '/todo.js': `export function buatTugas(judul) {
  const bersih = judul.trim();
  if (bersih.length === 0) throw new Error('Judul tugas tidak boleh kosong');

  return {
    id: crypto.randomUUID(),
    judul: bersih,
    selesai: false,
    dibuatPada: new Date().toISOString(),
  };
}

export const tambah = (daftar, tugas) => [...daftar, tugas];

export const hapus = (daftar, id) => daftar.filter((t) => t.id !== id);

export const toggleSelesai = (daftar, id) =>
  daftar.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t));

export function ringkasan(daftar) {
  const selesai = daftar.filter((t) => t.selesai).length;
  return {
    total: daftar.length,
    selesai,
    aktif: daftar.length - selesai,
    persen: daftar.length === 0 ? 0 : Math.round((selesai / daftar.length) * 100),
  };
}
`,
          '/index.js': `import { buatTugas, tambah, toggleSelesai, ringkasan } from './todo.js';

let daftar = [];
daftar = tambah(daftar, buatTugas('Belajar closure'));
daftar = tambah(daftar, buatTugas('Latihan reduce'));
daftar = tambah(daftar, buatTugas('  Baca bab 2  '));

daftar = toggleSelesai(daftar, daftar[0].id);

console.table(daftar);
console.log(ringkasan(daftar));

// Cobalah: hapus .trim() di buatTugas, lalu perhatikan judul ketiga.
// Cobalah juga: buatTugas('   ') — lihat errornya muncul.
`,
        },
        'Logika To-Do — ubah dan jalankan sendiri',
      ),

      h2('Apa yang baru saja kamu pakai'),
      table(
        ['Sub-bab', 'Dipakai di mana'],
        [
          ['1.2 `const`/`let`', 'Seluruh modul; `daftar` satu-satunya yang `let`'],
          ['1.3 Primitif vs reference', 'Alasan setiap fungsi mengembalikan array baru'],
          ['1.4 Truthy/falsy', 'Penjaga `bersih.length === 0`, bukan `!bersih`'],
          ['1.5 `switch`', '`saring()` dengan `default` yang melempar'],
          ['1.7 Fungsi & default', 'Seluruh API modul'],
          ['1.9 `map`/`filter`', 'Inti dari `hapus`, `toggleSelesai`, `saring`'],
          ['1.10 Object & spread', '`{ ...t, selesai: !t.selesai }`'],
          ['1.12 String', '`trim()`, `toLowerCase()`, `includes()`'],
          ['1.13 Modul', '`export` per fungsi, `import` di `main.js`'],
          ['1.14 Error', '`throw new Error` untuk input tidak valid'],
          ['1.15 Debugging', '`console.table` untuk memeriksa hasilnya'],
        ],
      ),

      checklist(
        'frontend-basic/javascript-dari-nol/praktik',
        'Checklist praktik 1.16',
        'Modul `todo.js` selesai dan tidak menyentuh DOM sama sekali',
        'Tidak ada satu pun `push`, `splice`, atau penugasan langsung ke elemen array',
        'Judul kosong atau berisi spasi saja ditolak dengan `Error`',
        'Daftar kosong tidak membuat `ringkasan()` maupun `saring()` jatuh',
        'Menghapus id yang tidak ada tidak mengubah apa pun dan tidak error',
        'Sudah dijalankan dengan `node` atau di playground di atas, dan outputnya diperiksa',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Logika yang terpisah dari tampilan bisa diuji, dipakai ulang, dan dipindahkan tanpa diubah.',
        '`id` yang stabil mengalahkan indeks array — pelajaran yang kembali sebagai `key` di React.',
        'Fungsi murni tanpa mutasi bukan gaya, melainkan syarat agar React bekerja benar.',
        'Validasi di batas masuk: tolak input tidak valid sekali, di satu tempat.',
        'Uji kasus kosong, id tidak ada, dan nilai tak dikenal — di situlah bug bersembunyi.',
      ),
    ],
  ),
];
