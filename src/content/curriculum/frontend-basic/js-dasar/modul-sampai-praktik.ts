import {
  callout,
  checklist,
  code,
  divider,
  h2,
  ol,
  p,
  playground,
  references,
  steps,
  table,
  terms,
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

      terms(
        {
          term: 'modul',
          meaning:
            'Dari *module*, artinya **bagian yang berdiri sendiri**. Satu berkas kode yang punya batas jelas terhadap dunia luar: ia menyatakan secara eksplisit apa yang **diberikan** keluar lewat `export`, dan apa yang **dibutuhkan** dari luar lewat `import`. Yang terpenting, batas ini ditegakkan oleh bahasanya sendiri — apa pun yang tidak kamu ekspor benar-benar tidak bisa disentuh berkas lain, bukan sekadar "sebaiknya jangan disentuh".',
        },
        {
          term: 'export',
          meaning:
            'Dibaca "eks-port", artinya **mengekspor** atau mengeluarkan. Menandai sesuatu di dalam sebuah berkas agar boleh dipakai berkas lain. Bisa ditulis langsung di depan deklarasinya (`export const PAJAK = 0.11`) atau dikumpulkan di akhir berkas (`export { format }`) — keduanya sama saja, pilih yang membuat berkasnya lebih mudah dibaca.',
        },
        {
          term: 'import',
          meaning:
            'Dibaca "im-port", artinya **mengimpor** atau memasukkan. Mengambil sesuatu yang sudah diekspor berkas lain untuk dipakai di berkas ini. Semua `import` selalu dievaluasi lebih dulu sebelum baris mana pun dijalankan, jadi urutan penulisannya di bagian atas berkas tidak memengaruhi apa pun selain kerapian.',
        },
        {
          term: 'named export',
          meaning:
            'Terjemahannya **ekspor bernama**. Ini bentuk ekspor yang paling umum. Sebuah berkas boleh punya sebanyak apa pun, dan saat diimpor namanya **harus sama persis** serta ditulis di dalam kurung kurawal seperti `import { hitungTotal } from "./harga.js"`. Justru keharusan nama yang sama itulah kelebihannya, sebab autocomplete editor bekerja, pencarian di seluruh project menemukan semuanya, dan rename otomatis tidak melewatkan satu pun.',
        },
        {
          term: 'default export',
          meaning:
            'Terjemahannya **ekspor utama**. Satu berkas hanya boleh punya maksimal satu, dan saat diimpor ia ditulis **tanpa** kurung kurawal dengan nama yang **bebas** kamu tentukan. Kebebasan itu terdengar enak, tapi justru menjadi kelemahannya: berkas yang sama bisa diimpor dengan tiga nama berbeda di tiga tempat, dan tidak ada alat yang bisa merapikannya kembali. Pengecualian yang wajar adalah berkas halaman di Next.js, yang memang mewajibkannya.',
        },
        {
          term: 'ESM',
          meaning:
            'Singkatan *ECMAScript Modules*, yaitu **sistem modul resmi bahasa JavaScript** yang memakai `import` dan `export`. ECMAScript sendiri adalah nama resmi standar bahasanya — "JavaScript" secara teknis adalah nama dagang. ESM adalah standar yang berlaku di browser maupun Node.js modern, dan satu-satunya yang memungkinkan tree-shaking.',
        },
        {
          term: 'CommonJS',
          meaning:
            'Dibaca "ko-mon-je-es", sering disingkat CJS. Sistem modul **lama** milik Node.js yang memakai `require()` untuk mengambil dan `module.exports` untuk memberikan. Ia lahir sebelum JavaScript punya sistem modul resmi, dan masih sangat banyak ditemui di paket-paket lawas. Kamu tidak perlu menulisnya, tapi perlu bisa mengenalinya saat membaca kode orang lain.',
        },
        {
          term: 'bundler',
          meaning:
            'Dibaca "ban-dler", dari *bundle* yang berarti **bendel** atau ikatan. Alat yang menelusuri seluruh rantai `import` di project-mu lalu menggabungkan ratusan berkas menjadi beberapa berkas saja yang siap dikirim ke browser. Alasannya praktis: mengunduh 300 berkas kecil jauh lebih lambat daripada mengunduh tiga berkas besar. Vite dan Next.js memakainya di balik layar tanpa perlu kamu setel.',
        },
        {
          term: 'tree-shaking',
          meaning:
            'Harfiahnya **mengguncang pohon**, seperti memanen buah dengan mengguncang batangnya sampai yang tidak melekat berjatuhan. Kemampuan bundler membuang kode yang **tidak pernah diimpor siapa pun**, sehingga berkas akhir yang diunduh pengunjung jadi lebih kecil. Ini hanya mungkin pada ESM, karena `import` bisa dianalisis sebelum program dijalankan — sementara `require()` bisa muncul di mana saja, bahkan di dalam `if`.',
        },
        {
          term: 'code splitting',
          meaning:
            'Terjemahannya **pemecahan kode**. Memisahkan bagian-bagian aplikasi ke berkas terpisah supaya masing-masing baru diunduh **ketika benar-benar dibutuhkan**, bukan sekaligus di awal. Caranya lewat `import()` dinamis. Website yang sedang kamu baca ini memakainya untuk editor playground: berkasnya besar, jadi ia baru diambil saat kamu benar-benar membuka sub-bab yang punya playground.',
        },
        {
          term: 'node_modules',
          meaning:
            'Folder tempat seluruh paket pihak ketiga dipasang oleh npm. Aturan pencariannya begini. Impor yang dimulai dengan `./` atau `../` dicari relatif terhadap berkasmu, sementara impor **tanpa** keduanya seperti `from "react"` dicari di folder ini. Folder ini tidak pernah ikut disimpan ke Git karena isinya bisa dibangun ulang kapan saja dari `package.json`.',
        },
        {
          term: 'alias',
          meaning:
            'Artinya **nama pengganti**. Jalan pintas penulisan alamat berkas yang disetel di konfigurasi project. Di project ini `@/` berarti folder `src/`, sehingga `@/lib/util` menunjuk berkas yang sama dengan `src/lib/util`. Manfaatnya terasa saat berkasmu dalam-dalam: `@/lib/util` jauh lebih tahan pindah folder daripada `../../../lib/util`.',
        },
        {
          term: 'impor melingkar',
          meaning:
            'Terjemahan dari *circular import*. Keadaan ketika berkas A mengimpor B, sementara B juga mengimpor A — langsung maupun lewat perantara. Akibatnya salah satu berkas bisa membaca nilai yang **belum sempat terisi**, menghasilkan `undefined` yang sangat sulit dilacak karena kodenya sendiri terlihat benar. Berkas indeks yang dipakai berlebihan adalah salah satu penyebab paling umumnya.',
        },
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
      p(
        'Berkas ini memperlihatkan dua cara menulis named export yang hasilnya identik. Cara pertama menempelkan kata `export` langsung di depan deklarasi, seperti pada `PAJAK` dan `hitungTotal`. Cara kedua mendeklarasikan dulu secara biasa lalu mengumpulkannya di akhir berkas dengan `export { format }`, dan itu berguna ketika kamu ingin daftar "apa saja yang keluar dari berkas ini" terbaca di satu tempat. Yang paling penting justru baris yang **tidak** punya `export`, sebab `rahasiaInternal` dan fungsi `format` sebelum dikumpulkan hanya hidup di dalam berkas ini. Perhatikan juga `hitungTotal` memakai `PAJAK` tanpa mengimpornya, karena keduanya berada di berkas yang sama, sebab impor hanya diperlukan untuk melewati batas antar-berkas.',
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
      p(
        "Dua baris impor itu **sama-sama sah dan sama-sama menghasilkan fungsi yang sama**, dan di situlah letak masalahnya. Named export mengharuskan namanya cocok karena yang kamu minta adalah sesuatu yang bernama tertentu; default export tidak punya nama sama sekali di berkas asalnya, sehingga penamaannya sepenuhnya diserahkan ke pengimpor. Akibat praktisnya baru terasa di project yang sudah besar. Berkas yang sama bisa diimpor sebagai `Tombol` di satu tempat, `Button` di tempat lain, dan `ApaPun` di tempat ketiga, dan tidak ada alat yang bisa merapikannya, karena tidak ada satu nama pun yang bisa dijadikan patokan. Perhatikan juga tanda kurung kurawal sebagai pembeda visual, sebab `{ nama }` berarti named sedangkan tanpa kurawal berarti default. Keduanya boleh dipakai bersamaan dalam satu baris seperti `import Tombol, { UkuranTombol } from './Tombol.js'`.",
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
      p(
        "Berkas ini tidak mendefinisikan apa pun, sebab ia hanya **meneruskan**. `export { Tombol } from './Tombol.js'` adalah bentuk singkat dari mengimpor lalu mengekspor ulang, dan bedanya `Tombol` tidak pernah menjadi variabel yang bisa dipakai di dalam berkas indeks itu sendiri. Gunanya membuat pemakai cukup menulis `import { Tombol, Kartu } from '@/components'` dalam satu baris, alih-alih menelusuri jalur tiap berkas satu per satu. Baris ketiga memakai `export *`, yang meneruskan **semua** named export dari berkas tujuan sekaligus. Itu praktis, tetapi juga membuat isi berkas indeks tidak lagi bisa dibaca sebagai daftar, sehingga kamu harus membuka berkas lain untuk tahu apa saja yang sebenarnya keluar dari sini. Perlu dicatat `export *` tidak pernah meneruskan default export, jadi itu harus ditulis sendiri bila dibutuhkan.",
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
      p(
        'Kedua gaya menghasilkan hal yang sama, tetapi berbeda pada **kapan** modulnya dimuat, dan dari perbedaan itulah seluruh baris di tabel di bawah berasal. `require()` adalah pemanggilan fungsi biasa yang berjalan saat barisnya tercapai, sehingga ia boleh ditaruh di dalam `if` atau di tengah fungsi, tapi isinya baru diketahui ketika program sudah berjalan. `import` bukan fungsi melainkan bagian dari bahasa, dan seluruh daftar impor sebuah berkas dianalisis **sebelum** satu baris pun dijalankan. Kemampuan menganalisis lebih awal itulah yang memungkinkan *tree-shaking*, sebab bundler bisa memastikan `format` tidak pernah dipakai siapa pun lalu membuangnya dari hasil akhir, sesuatu yang mustahil dipastikan bila modul bisa dipanggil kapan saja lewat `require`. Kalau kamu memang butuh memuat modul secara kondisional dengan ESM, jalurnya adalah `import()` berbentuk fungsi yang menghasilkan Promise.',
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
      references(
        {
          label: 'JavaScript modules',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
          source: 'MDN',
          note: 'Panduan resmi modul ES dari awal, termasuk kenapa berkas module butuh server lokal.',
        },
        {
          label: 'import',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import',
          source: 'MDN',
          note: 'Semua bentuk impor: named, default, namespace, dan `import()` dinamis.',
        },
        {
          label: 'export',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export',
          source: 'MDN',
          note: 'Termasuk sintaks re-export yang dipakai berkas indeks.',
        },
        {
          label: 'Modules: ECMAScript modules',
          href: 'https://nodejs.org/api/esm.html',
          source: 'Node.js',
          note: 'Aturan resmi Node menentukan sebuah berkas dibaca sebagai ESM atau CommonJS.',
        },
        {
          label: 'Modules: CommonJS modules',
          href: 'https://nodejs.org/api/modules.html',
          source: 'Node.js',
          note: 'Dokumentasi `require()` dan `module.exports` untuk saat kamu membaca kode lama.',
        },
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

      terms(
        {
          term: 'error',
          meaning:
            'Objek bawaan JavaScript yang **mewakili sebuah kegagalan**. Ia bukan sekadar teks pesan: ia membawa `name` (jenis kegagalannya, misalnya `TypeError`), `message` (penjelasan singkatnya), dan `stack` (jejak lengkap sampai ke baris penyebabnya). Ketiga bagian itulah yang membuat error berguna, dan itu pula sebabnya melempar teks biasa alih-alih objek `Error` adalah kerugian besar.',
        },
        {
          term: 'exception',
          meaning:
            'Dibaca "ek-sep-syen", artinya **pengecualian**. Nama umum lintas bahasa untuk kegagalan yang dilempar dan menghentikan alur normal program. Disebut pengecualian karena ia menandai keadaan di luar jalur yang diharapkan. Di JavaScript, istilah *error* dan *exception* sering dipakai bergantian dan dalam praktik maksudnya sama.',
        },
        {
          term: 'throw',
          meaning:
            'Dibaca "thro", artinya **melempar**. Kata kunci yang menghentikan fungsi saat itu juga lalu **menyerahkan sebuah error ke atas**, ke pihak yang memanggilnya. Istilah "melempar" dipilih karena gambarannya memang seperti itu: fungsi yang tidak sanggup menangani sesuatu melemparkannya ke pemanggil, dan kalau pemanggil juga tidak menangkapnya, error terus terlempar naik sampai menghentikan program.',
        },
        {
          term: 'try / catch',
          meaning:
            '`try` artinya **coba**, yaitu "jalankan blok ini, dan bersiaplah kalau ternyata gagal". `catch` artinya **tangkap**, yaitu "kalau tadi gagal, inilah yang harus dilakukan". Melanjutkan gambaran melempar tadi, `throw` melemparkan, `catch` yang menangkapnya di udara sebelum ia jatuh menghancurkan program.',
        },
        {
          term: 'finally',
          meaning:
            'Artinya **pada akhirnya**. Blok yang **selalu** dijalankan apa pun yang terjadi sebelumnya — `try` berhasil, `try` gagal, bahkan ketika `try` sudah menjalankan `return`. Gunanya untuk pekerjaan pembersihan yang tidak boleh terlewat dalam keadaan apa pun: mematikan indikator memuat, menutup koneksi, atau mengaktifkan kembali tombol yang tadi dinonaktifkan.',
        },
        {
          term: 'stack trace',
          meaning:
            'Terjemahannya **jejak tumpukan**. Daftar pemanggilan fungsi yang menempel pada setiap objek `Error`, tersusun dari yang **terbaru di atas** ke yang terlama di bawah. Membacanya menjawab dua pertanyaan sekaligus: baris teratas menjawab "di mana ini terjadi", dan baris-baris di bawahnya menjawab "kenapa fungsi itu sampai dijalankan". Inilah alasan sesungguhnya melempar objek `Error` dan bukan teks biasa — teks tidak punya jejak ini.',
        },
        {
          term: 'instanceof',
          meaning:
            'Gabungan *instance* (wujud nyata dari sebuah kelas) dan *of* (dari). Operator yang menjawab pertanyaan **"apakah nilai ini dibuat dari kelas tertentu?"**. Dipakai di `catch` untuk membedakan `ValidasiError` buatanmu dari error jenis lain, sehingga kamu bisa menangani yang kamu pahami dan meneruskan sisanya. Ini jauh lebih andal daripada mencocokkan teks pesan, yang akan rusak begitu kalimatnya diubah sedikit saja.',
        },
        {
          term: 'rethrow',
          meaning:
            'Artinya **melempar ulang**. Menangkap sebuah error, memeriksanya, menyadari bahwa itu bukan jenis yang kamu tahu cara menanganinya, lalu melemparkannya lagi ke atas dengan `throw error`. Ini bukan kemalasan melainkan kejujuran: menahan error yang tidak bisa kamu tangani sama saja dengan menyembunyikan bug dari orang yang seharusnya melihatnya.',
        },
        {
          term: 'anti-pattern',
          meaning:
            'Terjemahan dari *anti-pattern*. Cara yang **tampak** menyelesaikan masalah dan sering dipakai, tapi sebenarnya menimbulkan masalah yang lebih besar dan lebih sulit dilacak. `catch` kosong adalah contoh paling klasik di bab ini: ia benar-benar membuat pesan error hilang dari layar, sehingga terasa seperti berhasil — padahal yang hilang hanyalah peringatannya, bukan kerusakannya.',
        },
        {
          term: 'e / err',
          meaning:
            'Singkatan *error*, nama parameter yang lazim dipakai di `catch (e)`. Sama persis artinya dengan menulis `catch (error)` — murni kebiasaan penamaan. Sejak ES2019 kamu bahkan boleh menghilangkannya sama sekali (`catch { ... }`) kalau memang tidak dipakai.',
        },
        {
          term: 'unhandledrejection',
          meaning:
            'Gabungan *unhandled* (tidak ditangani) dan *rejection* (penolakan). Nama event browser yang berbunyi ketika sebuah operasi asinkron gagal dan **tidak ada satu pun `catch` yang menanganinya**. Mendengarkan event ini berguna sebagai jaring pengaman terakhir untuk mengirim laporan ke layanan pemantauan — tapi ia bukan pengganti penanganan error di tempat kejadiannya.',
        },
        {
          term: 'invariant',
          meaning:
            'Artinya **hal yang seharusnya selalu benar** sepanjang program berjalan, misalnya "sebuah pesanan pasti punya minimal satu item". Kalau invariant dilanggar, itu bukan input yang salah melainkan **bug di kodemu sendiri**. Karena itu perlakuannya berbeda: input salah ditangani dengan pesan yang ramah, sedangkan invariant yang dilanggar sebaiknya gagal dengan berisik supaya cepat ketahuan.',
        },
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
      p(
        'Ketiga blok itu punya peran yang jelas berbeda. Isi `try` adalah kode yang **mungkin gagal**, dan begitu satu baris di dalamnya melempar error, sisa baris di blok itu langsung dilewati. Pada contoh ini, kalau `JSON.parse` gagal maka `console.log(data)` tidak pernah dijalankan. `catch` menerima objek errornya sebagai parameter dan menjadi tempat memutuskan apa yang harus terjadi setelah kegagalan. `finally` berjalan **dalam kedua keadaan**, baik berhasil maupun gagal, dan bahkan tetap berjalan bila di dalam `try` ada `return`. Itulah sebabnya ia tempat yang tepat untuk pembersihan seperti mematikan indikator memuat, yang harus terjadi apa pun hasilnya. Perlu ditegaskan `try/catch` hanya menangkap error dari kode yang **benar-benar berjalan di dalamnya**, dan bukan dari kode yang dijadwalkan untuk nanti, karena bagian itu dibahas di akhir sub-bab.',
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
      p(
        'Bentuk ini disebut *optional catch binding*, dan gunanya menghilangkan parameter yang tidak akan dipakai. Perhatikan `catch` di sini tidak diikuti kurung sama sekali, jadi bukan `catch ()` yang kosong melainkan langsung `catch {`. Pakai bentuk ini hanya ketika kamu benar-benar tidak butuh detail errornya, misalnya karena sudah punya nilai cadangan yang pasti benar. Kalau kamu ragu, tetap tangkap errornya dan setidaknya catat ke `console.error`, sebab membuang informasi kegagalan adalah keputusan yang sulit dibatalkan saat kamu sedang menelusuri bug.',
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
      p(
        '`throw` melakukan dua hal sekaligus. Ia menghentikan fungsi saat itu juga, sehingga baris `return a / b` tidak pernah tercapai saat `b` bernilai nol, lalu **melemparkan** errornya ke pemanggil. Kalau pemanggil juga tidak menangkapnya, ia terus naik sampai ada yang menangkap atau sampai program berhenti. Inilah bedanya dengan `return` yang mengembalikan nilai khusus seperti `null`, sebab error tidak bisa diabaikan diam-diam, sedangkan `null` yang tidak diperiksa akan mengalir ke perhitungan berikutnya dan meledak jauh dari sumbernya. Tiga baris di dalam `catch` menunjukkan apa yang kamu dapat dari objek `Error`, yaitu `name` untuk membedakan jenisnya, `message` untuk penjelasan yang bisa dibaca, dan `stack` sebagai jejak lengkap fungsi mana memanggil fungsi mana sampai ke baris yang melempar. `stack` inilah yang hilang bila kamu melempar string biasa.',
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
      p(
        "Kelas ini menambahkan dua hal yang tidak dimiliki `Error` biasa. `this.name = 'ValidasiError'` memberi label yang muncul di log, dan `this.field = field` menyimpan **konteks tambahan**, sehingga pemanggil jadi tahu bukan hanya bahwa validasi gagal tetapi juga field mana yang salah, sehingga pesannya bisa ditempelkan tepat di bawah input yang bersangkutan. Baris `super(pesan)` wajib ada dan harus di paling atas, sebab ia menyerahkan pesan ke `Error` induknya, dan itu yang membuat `message` maupun `stack` tetap terisi. Bagian yang paling penting justru di blok `catch`, sebab `error instanceof ValidasiError` memeriksa **jenis** errornya alih-alih mencocokkan teks pesan. Itu pemeriksaan yang tidak akan rusak ketika suatu hari kalimat pesannya diperbaiki. Cabang `else` menutup polanya dengan benar, sebab error yang bukan urusan blok ini dilempar ulang apa adanya alih-alih ditelan.",
      ),
      callout(
        'tip',
        'Melempar ulang bukan kemalasan',
        'Menangkap error yang tidak bisa kamu tangani, lalu menelannya, adalah cara paling efektif menyembunyikan bug. Tangkap yang kamu tahu cara menanganinya; sisanya biarkan naik ke atas.',
      ),

      h2('Anti-pattern: `catch` yang menelan'),
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
      p(
        'Perhatikan progresi ketiga versi ini. Versi pertama gagal total, sebab `catch (e) {}` menangkap error lalu membuangnya begitu saja. Akibatnya kegagalan penyimpanan data, sesuatu yang seharusnya sangat berisik, lewat tanpa jejak apa pun, baik di layar maupun di log. Versi kedua sedikit lebih baik karena setidaknya mencatat errornya ke console, tapi pengguna tetap tidak diberi tahu apa-apa dan mengira datanya sudah tersimpan padahal tidak. Versi ketiga menutup ketiga celah sekaligus, sebab `console.error` menyimpan jejak untuk ditelusuri nanti, `tampilkanError` memberi tahu pengguna dengan jujur, dan tidak ada satu baris pun yang berpura-pura berhasil di jalur yang sebenarnya gagal.',
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
      p(
        'Dua baris ini adalah penerapan langsung dari tabel di atas, dan yang membuatnya bekerja adalah **pemisahan tujuan pembaca**. Baris `console.error` ditujukan untuk kamu yang akan menelusuri masalah, sebab ia menyertakan `orderId` supaya kejadiannya bisa dicocokkan dengan pesanan tertentu, dan objek `error` utuh supaya `stack`-nya ikut tersimpan. Baris `tampilkanError` ditujukan untuk pengguna, berupa satu kalimat yang menyebutkan apa yang gagal **dan** apa yang bisa ia lakukan berikutnya. Perhatikan awalan `[checkout]` pada pesan log, yaitu kebiasaan kecil yang sangat membantu, karena log aplikasi nyata bercampur dari banyak bagian sekaligus dan penanda seperti itu membuatnya bisa disaring. Yang harus dihindari adalah menaruh isi `error.message` ke dalam pesan yang dilihat pengguna, karena isinya ditentukan oleh sistem, bukan oleh kamu.',
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
      p(
        'Dua pendengar ini menangkap dua jalur kegagalan yang berbeda, dan keduanya perlu dipasang karena tidak saling menggantikan. Peristiwa `error` menangkap error biasa yang tidak ada `try/catch`-nya di sepanjang jalur, dan errornya tersedia lewat `e.error`. Peristiwa `unhandledrejection` menangkap Promise yang gagal tanpa pernah diberi `.catch()` maupun dibungkus `try/catch`, dan perhatikan properti yang dipakai berbeda, yaitu `e.reason` dan bukan `e.error`. Perbedaan nama itu sering luput dan membuat salah satu pendengar diam-diam mengirim `undefined` ke layanan pemantauan. Keterangan pada keterangan gambar di atas layak digarisbawahi, sebab ini **jaring pengaman** dan bukan penanganan error. Ia berguna karena memberi tahu bahwa ada yang lolos, tetapi pada titik itu pengguna sudah terlanjur melihat aplikasi yang rusak, sehingga penanganan yang sebenarnya tetap harus berada di tempat kegagalannya terjadi.',
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
      references(
        {
          label: 'try...catch',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch',
          source: 'MDN',
          note: 'Termasuk `catch` tanpa parameter dan urutan jalannya `finally` terhadap `return`.',
        },
        {
          label: 'Error',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
          source: 'MDN',
          note: 'Seluruh property error dan cara membuat kelas error turunan sendiri.',
        },
        {
          label: 'throw',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw',
          source: 'MDN',
          note: 'Menjelaskan bahwa apa pun boleh dilempar — dan kenapa sebaiknya tetap objek `Error`.',
        },
        {
          label: 'Window: unhandledrejection event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event',
          source: 'MDN',
          note: 'Jaring pengaman terakhir untuk kegagalan asinkron yang lolos dari semua `catch`.',
        },
        {
          label: 'Error Handling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan keamanan di balik aturan "detail ke log, pesan generik ke pengguna".',
        },
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

      terms(
        {
          term: 'bug',
          meaning:
            'Harfiahnya **serangga**, istilah baku untuk cacat pada program. Ceritanya sering dikaitkan dengan ngengat yang benar-benar tersangkut di relai komputer Harvard Mark II pada 1947, meski istilahnya sudah dipakai insinyur jauh sebelum itu. Yang berguna dari asal-usul ini: bug bukan tanda kebodohan, melainkan sesuatu yang sudah menyertai profesi ini sejak awal.',
        },
        {
          term: 'debugging',
          meaning:
            'Dibaca "di-ba-ging", harfiahnya **membasmi serangga**. Proses **menemukan penyebab** sebuah masalah — bukan sekadar membuat gejalanya hilang dari layar. Perbedaan itu penting: mengubah baris acak sampai errornya berhenti muncul bukan debugging, karena masalahnya kemungkinan besar hanya berpindah ke tempat yang lebih sulit ditemukan.',
        },
        {
          term: 'DevTools',
          meaning:
            'Singkatan *Developer Tools*, artinya **alat untuk pengembang**. Panel bawaan yang sudah ada di dalam setiap browser modern tanpa perlu dipasang, dibuka dengan `F12` atau `Ctrl+Shift+I` (di macOS `Cmd+Option+I`). Isinya jauh lebih luas daripada console: ada pemeriksa elemen, pemantau jaringan, penyimpanan, dan pengukur performa.',
        },
        {
          term: 'breakpoint',
          meaning:
            'Terjemahannya **titik henti**. Penanda yang kamu pasang pada sebuah baris supaya program **berhenti tepat sebelum baris itu dijalankan**, membekukan seluruh keadaannya agar bisa diperiksa dengan santai. Bedanya dengan `console.log` besar: `console.log` menunjukkan **satu nilai** pada satu titik, sementara breakpoint menunjukkan **semua nilai** yang ada pada titik itu.',
        },
        {
          term: 'source map',
          meaning:
            'Terjemahannya **peta sumber**. Berkas pemetaan yang menghubungkan kode hasil bundling, yang sudah digabung, dipendekkan, dan hampir tidak terbaca manusia, kembali ke kode aslimu. Berkat berkas ini, yang tampil di DevTools tetaplah kode yang kamu tulis, lengkap dengan nama variabel dan nomor baris yang benar.',
        },
        {
          term: 'call stack',
          meaning:
            'Terjemahannya **tumpukan pemanggilan**. Daftar fungsi yang sedang berjalan pada saat itu, dengan yang **terbaru di paling atas**. Disebut tumpukan karena cara kerjanya persis seperti tumpukan piring: fungsi yang dipanggil terakhir adalah yang pertama selesai dan diangkat. Panel ini yang menjawab pertanyaan "kenapa fungsi ini sampai dijalankan?" ketika kodenya sendiri terlihat baik-baik saja.',
        },
        {
          term: 'step over / into / out',
          meaning:
            'Tiga cara melangkah saat program sedang dibekukan. **Step over** ("melangkahi") menjalankan satu baris utuh dan berhenti di baris berikutnya, termasuk kalau baris itu memanggil fungsi. **Step into** ("melangkah masuk") justru masuk ke dalam fungsi yang dipanggil baris itu untuk menelusurinya dari dalam. **Step out** ("melangkah keluar") menyelesaikan sisa fungsi yang sedang kamu telusuri lalu kembali ke pemanggilnya.',
        },
        {
          term: 'scope panel',
          meaning:
            'Terjemahannya **panel jangkauan**. Bagian DevTools yang menampilkan **semua variabel yang terlihat** pada titik program berhenti — dikelompokkan menjadi lokal, closure, dan global. Ini juga cara terbaik melihat closure dari Sub-bab 1.8 secara nyata: variabel yang "seharusnya sudah hilang" ternyata benar-benar masih tercantum di sana.',
        },
        {
          term: 'strict mode',
          meaning:
            'Terjemahannya **mode ketat**. Mode yang mengubah sejumlah kesalahan yang biasanya lolos diam-diam menjadi error yang terlihat — misalnya salah ketik nama variabel yang tanpa mode ini justru membuat variabel global baru. Kabar baiknya, **modul ES selalu berjalan dalam mode ini secara otomatis**, jadi kalau kamu memakai `import`/`export` kamu sudah berada di dalamnya tanpa menulis apa pun.',
        },
        {
          term: 'hipotesis',
          meaning:
            'Dugaan yang dirumuskan sedemikian rupa sehingga **bisa dibuktikan salah**. Perbedaannya dengan tebakan biasa menentukan cepat-lambatnya kamu menemukan bug. "Saya duga `items` sudah kosong sebelum sampai di baris ini" adalah hipotesis — kamu bisa langsung membuktikannya benar atau salah. "Coba ubah bagian ini" bukan hipotesis, karena apa pun hasilnya kamu tetap tidak belajar apa-apa.',
        },
        {
          term: 'deprecated',
          meaning:
            'Dibaca "de-pre-key-ted", artinya **tidak lagi dianjurkan**. Label untuk fitur yang masih berfungsi hari ini tapi sudah direncanakan untuk dihapus, biasanya karena sudah ada penggantinya yang lebih baik. Menemuinya di console bukan error, melainkan peringatan dini: kodenya akan rusak di masa depan, jadi lebih murah menggantinya sekarang.',
        },
        {
          term: 'conditional breakpoint',
          meaning:
            'Terjemahannya **titik henti bersyarat**. Breakpoint yang hanya aktif kalau syarat yang kamu tulis terpenuhi, misalnya `item.id === 42`. Sangat berguna pada loop yang berjalan ribuan kali: alih-alih menekan tombol lanjut ratusan kali, program hanya berhenti pada iterasi yang benar-benar kamu selidiki.',
        },
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
      p(
        'Masing-masing method di atas menjawab pertanyaan yang berbeda, dan memilih yang tepat menghemat waktu penelusuran. `console.table` mengubah array of object menjadi tabel dengan kolom yang bisa diurutkan, dan itu jauh lebih terbaca daripada `console.log` yang menampilkannya sebagai daftar object yang harus dibuka satu per satu. `console.group` dan `console.groupEnd` membungkus beberapa pesan menjadi satu blok yang bisa dilipat, berguna saat satu proses menghasilkan banyak baris log sekaligus. Pasangan `console.time` dan `console.timeEnd` mengukur durasi, dan perhatikan **label di keduanya harus sama persis**, sebab itulah yang memasangkan awal dengan akhirnya, sehingga beberapa pengukuran bisa berjalan bersamaan tanpa tertukar. `console.assert` hanya mencetak **bila syaratnya salah**, cocok untuk menyatakan asumsi tanpa mengotori log saat semuanya normal. `console.count` menghitung berapa kali baris itu dilewati, dan itu cara tercepat menjawab "kenapa komponen ini dirender berkali-kali?".',
      ),
      callout(
        'tip',
        'Trik yang menghemat banyak waktu',
        'Bentuk `console.log({ x, y, z })` dengan kurung kurawal mencetak **nama beserta nilainya**. Tanpa itu kamu sering melihat tiga angka tanpa tahu yang mana yang mana.',
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
      p(
        'Kata `debugger` adalah breakpoint yang ditulis **di dalam kode**, bukan diklik di panel. Ia berperilaku persis seperti breakpoint biasa, sebab eksekusi berhenti tepat sebelum baris berikutnya dijalankan, dan seluruh panel Scope maupun Call Stack tersedia. Keunggulannya muncul pada kode yang sulit ditemukan di panel Sources, misalnya fungsi di dalam berkas yang sudah di-bundle, atau kode yang dijalankan lewat `eval` sebuah library. Sifat pentingnya ada di komentar, yaitu baris ini **tidak melakukan apa-apa bila DevTools sedang tertutup**, sehingga ia tidak akan menghentikan aplikasi pengguna. Meski begitu, ia tetap tidak boleh ikut ter-commit, bukan karena berbahaya melainkan karena akan menghentikan browser rekan setimmu yang kebetulan sedang membuka DevTools untuk urusan lain.',
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
      p(
        'Jejak tumpukan terlihat menakutkan padahal susunannya sangat teratur, dan arah membacanya adalah **dari atas ke bawah, dari yang terbaru ke yang terlama**. Angka di ujung tiap baris, misalnya `profil.js:12:26`, berarti berkas `profil.js` baris 12 karakter ke-26. Kolom itu sering diabaikan padahal ia menunjuk titik yang tepat ketika satu baris memuat beberapa pemanggilan sekaligus. Baris teratas hampir selalu tempat kamu harus mulai, karena di situlah kerusakan benar-benar terjadi. Baris di bawahnya menjawab pertanyaan yang berbeda, bukan "apa yang rusak" melainkan **"kenapa fungsi ini sampai dijalankan"**, dan itu yang kamu butuhkan ketika penyebab sebenarnya adalah data cacat yang dioper dari beberapa lapis di atas. Satu catatan praktis, pada kode yang sudah di-bundle nama berkas dan nomor barisnya akan terlihat asing kecuali *source map* aktif.',
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
      p(
        "Kedua contoh memperlihatkan pola yang sama, yaitu mode ketat **tidak menambah aturan baru** melainkan hanya mengubah kegagalan yang tadinya diam menjadi kegagalan yang berisik. Kasus pertama adalah yang paling sering menyelamatkan orang. Tanpa `'use strict'`, menulis `namaSalahKetik = 'Zum'` tanpa `const`/`let` tidak dianggap salah, sebab JavaScript diam-diam membuat variabel **global** baru, sehingga salah ketik satu huruf menghasilkan variabel berbeda yang isinya tidak pernah terbaca oleh kode yang membutuhkannya, dan tidak ada satu pun pesan yang muncul. Kasus kedua serupa, sebab menulis ke object yang sudah dibekukan `Object.freeze` tidak berpengaruh apa-apa, dan tanpa strict kamu tidak akan pernah tahu perubahanmu tidak tersimpan. Kabar baiknya, seperti disebut di atas, semua berkas yang memakai `import`/`export` sudah otomatis berada dalam mode ini, jadi di project modern kamu praktis tidak perlu menuliskannya sendiri.",
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
      references(
        {
          label: 'Debug JavaScript',
          href: 'https://developer.chrome.com/docs/devtools/javascript',
          source: 'Chrome DevTools',
          note: 'Panduan resmi memasang breakpoint, melangkah, dan membaca panel Scope.',
        },
        {
          label: 'Console features reference',
          href: 'https://developer.chrome.com/docs/devtools/console/reference',
          source: 'Chrome DevTools',
          note: 'Seluruh kemampuan panel console, termasuk conditional breakpoint dan filter log.',
        },
        {
          label: 'console',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/console',
          source: 'MDN',
          note: 'Rujukan lintas-browser untuk `table`, `group`, `time`, `assert`, dan `count`.',
        },
        {
          label: 'Strict mode',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode',
          source: 'MDN',
          note: 'Daftar lengkap perubahan perilaku yang diaktifkan mode ketat.',
        },
        {
          label: 'debugger',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/debugger',
          source: 'MDN',
          note: 'Menegaskan bahwa pernyataan ini tidak berefek apa pun saat DevTools tertutup.',
        },
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

      terms(
        {
          term: 'DOM',
          meaning:
            'Singkatan *Document Object Model*, dibaca "dom", terjemahannya **model objek dokumen**. Representasi halaman web sebagai kumpulan objek yang bisa dibaca dan diubah oleh JavaScript — inilah yang ada di balik `document.querySelector(...)`. Praktik penutup ini **sengaja tidak menyentuhnya sama sekali**, dan itu bukan karena DOM sulit, melainkan karena memisahkan logika dari tampilan adalah keputusan yang akan membentuk seluruh sisa kurikulum.',
        },
        {
          term: 'pure function',
          meaning:
            'Terjemahan dari *pure function*. Fungsi dengan dua syarat: **hasilnya hanya ditentukan oleh argumen yang masuk**, dan **ia tidak mengubah apa pun di luar dirinya sendiri**. Konsekuensinya, memanggilnya seratus kali dengan argumen yang sama selalu memberi hasil yang sama, dan urutan pemanggilannya tidak pernah jadi masalah. Inilah yang membuatnya bisa diuji tanpa persiapan apa pun — tidak perlu browser, tidak perlu server, tidak perlu database.',
        },
        {
          term: 'mutasi',
          meaning:
            'Perubahan yang terjadi **langsung pada data aslinya**. `push`, `splice`, `sort`, dan penugasan langsung ke elemen array (`daftar[0] = x`) semuanya bermutasi; `map`, `filter`, dan spread `[...daftar]` tidak. Perhatikan bahwa di seluruh modul praktik ini tidak ada satu pun operasi yang bermutasi — dan itu disengaja sepenuhnya.',
        },
        {
          term: 'JSDoc',
          meaning:
            'Gabungan *JS* dan *doc* (dokumentasi). Format komentar khusus yang diawali `/**` dan berisi penanda seperti `@typedef`, `@property`, dan `@param`. Manfaat praktisnya besar: editor membaca komentar ini dan mulai memberikan autocomplete serta peringatan tipe **tanpa kamu perlu memakai TypeScript sama sekali**. Cocok sebagai langkah antara sebelum benar-benar pindah ke TypeScript di Bab 6.',
        },
        {
          term: 'UUID',
          meaning:
            'Singkatan *Universally Unique Identifier*, artinya **penanda unik universal**. String acak panjang berbentuk `f81d4fae-7dec-11d0-a765-00a0c91e6bf6` yang kemungkinan kembarnya begitu kecil sampai bisa dianggap mustahil dalam praktik. `crypto.randomUUID()` menghasilkannya, dan ia hanya tersedia pada konteks aman — yaitu `https` atau `localhost`.',
        },
        {
          term: 'ISO 8601',
          meaning:
            'Dibaca "ai-es-o delapan enam nol satu". Standar internasional penulisan tanggal dan waktu, bentuknya `2026-08-03T10:15:30.000Z`. Kelebihan utamanya sering diremehkan: karena bagian tahun ditulis lebih dulu, lalu bulan, lalu tanggal, **urutan teksnya selalu sama dengan urutan waktunya** — sehingga tanggal bisa diurutkan sebagai teks biasa tanpa dikonversi dulu. Huruf `Z` di akhir menandakan waktunya UTC.',
        },
        {
          term: 'toggle',
          meaning:
            'Dibaca "to-gel", artinya **membalik keadaan** ke lawannya, seperti sakelar lampu. Kalau statusnya selesai menjadi belum, kalau belum menjadi selesai. Di kode, pembaliknya adalah operator `!` — `selesai: !t.selesai`.',
        },
        {
          term: 'key',
          meaning:
            'Artinya **kunci** atau penanda identitas. Di React nanti, setiap elemen dalam sebuah daftar wajib punya `key` yang stabil agar React bisa mengenali mana yang berpindah, ditambah, atau dihapus. Alasan `id` harus stabil di modul ini **sama persis** dengan alasan `key` harus stabil di sana: sesuatu yang identitasnya berubah setiap saat bukanlah identitas.',
        },
        {
          term: 'jalur tidak bahagia',
          meaning:
            'Terjemahan dari *unhappy path*, kadang disebut juga *sad path*. Jalur ketika sesuatu tidak berjalan sebagaimana diharapkan: input kosong, daftar kosong, id yang tidak ditemukan, angka nol sebagai pembagi. Pasangannya adalah *happy path*, jalur ketika semua berjalan lancar. Kenyataannya, jalur bahagia justru bagian yang paling jarang rusak — jadi di sanalah pengujian paling sedikit memberi manfaat.',
        },
        {
          term: 't',
          meaning:
            'Singkatan *tugas*, nama parameter callback yang dipakai berulang di modul ini: `daftar.filter((t) => t.id !== id)`. Sekali lagi ini kebiasaan penamaan; menulis `(tugas) => tugas.id !== id` sama sahnya dan lebih jelas untuk pembaca baru.',
        },
        {
          term: 'validasi di batas masuk',
          meaning:
            'Terjemahan bebas dari *validate at the boundary*. Prinsip memeriksa kebenaran data **satu kali, di satu tempat, tepat saat data itu masuk ke sistemmu** — bukan diperiksa berulang-ulang di setiap fungsi yang menyentuhnya. Di modul ini, `buatTugas()` adalah batas itu: setelah sebuah tugas berhasil dibuat, seluruh fungsi lain boleh mempercayai bahwa judulnya pasti sudah bersih dan tidak kosong.',
        },
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
      p(
        'Blok ini tidak menghasilkan kode apa pun saat dijalankan, sebab ia komentar JSDoc yang gunanya menuliskan **kontrak** bentuk data sebelum satu fungsi pun ditulis. Manfaatnya dua. Pertama, editormu membaca `@typedef` ini dan mulai memberi autocomplete serta peringatan saat kamu salah mengetik nama property, tanpa perlu memasang TypeScript. Kedua, dan yang lebih penting, keterangan di sebelah tiap property adalah **janji** yang akan ditegakkan kode di bawah. Kalimat "selalu sudah di-trim, tidak pernah kosong" pada `judul` bukan harapan, melainkan alasan kenapa `buatTugas` nanti wajib memvalidasi. Perhatikan `dibuatPada` disimpan sebagai teks ISO 8601 dan bukan objek `Date`, sebab bentuk teks bisa langsung dikirim sebagai JSON, diurutkan sebagai string biasa, dan tidak berubah makna saat berpindah zona waktu.',
      ),
      callout(
        'tip',
        'Kenapa `id` bukan indeks array',
        'Indeks berubah begitu ada penghapusan atau pengurutan. Identitas yang berubah bukan identitas. Ini pelajaran yang sama yang akan muncul lagi sebagai `key` di React.',
      ),

      h2('2. Pure function, tanpa mutasi'),
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
      p(
        'Lima fungsi ini memakai kembali hampir seluruh isi bab, jadi telusuri satu per satu. `buatTugas` adalah **batas masuk** sistem, sebab ia membersihkan judul dengan `trim()`, menolak yang kosong dengan `throw`, dan hanya mengembalikan object bila keduanya lolos. Karena itu setiap fungsi lain boleh mempercayai bahwa `judul` pasti bersih tanpa perlu memeriksanya lagi. `tambah` memakai spread `[...daftar, tugas]` alih-alih `push`, `hapus` memakai `filter` yang menyisakan semua yang **bukan** id itu, sedangkan `toggleSelesai` dan `ubahJudul` memakai `map`, yang menjaga panjang dan urutan daftar tetap sama.',
      ),
      p(
        'Baris `toggleSelesai` layak dibaca pelan karena ia menumpuk dua gagasan sekaligus dalam bentuk `t.id === id ? { ...t, selesai: !t.selesai } : t`. Ternary di situ berarti "kalau ini tugas yang dicari, hasilkan **salinan** dengan nilai `selesai` yang dibalik, dan kalau bukan, kembalikan object aslinya apa adanya". Menyalin hanya yang berubah dan membiarkan sisanya utuh itu penting, sebab di React nanti, object yang alamatnya tidak berubah adalah tanda bahwa baris itu tidak perlu digambar ulang. Perhatikan juga `{ ...t, selesai: ... }` menempatkan property yang ditimpa **setelah** spread sesuai aturan "yang belakangan menang", sedangkan membaliknya justru membuat nilai lama yang menang dan tombolnya seolah tidak berfungsi.',
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
      p(
        '`saring` memakai `switch` untuk memilih jalur berdasarkan filter yang diminta, dan sengaja melempar error untuk nilai yang tidak dikenal, alih-alih diam-diam mengembalikan semua tugas, supaya kesalahan ketik nama filter langsung ketahuan alih-alih tersembunyi sebagai data yang seakan-akan benar. `cari` menormalkan dulu (trim lalu lowercase) baik kata kuncinya maupun judul yang dibandingkan, sehingga pencarian "Bab 2" dan "bab 2" menghasilkan hasil yang sama. `ringkasan` menghitung ulang seluruh angkanya dari `daftar` setiap kali dipanggil, alih-alih menyimpan angka yang gampang basi begitu ada tugas ditambah atau dihapus, dan itu pola yang nanti kamu kenali sebagai *derived state* saat belajar React.',
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
      p(
        "Pola `daftar = tambah(daftar, ...)` yang berulang di sini adalah harga yang dibayar karena semua fungsinya murni, sebab tidak ada yang mengubah `daftar` di tempat, jadi hasilnya harus ditugaskan kembali. Itu sebabnya `daftar` dideklarasikan `let` alih-alih `const`, dan itu satu-satunya variabel yang berubah di seluruh berkas ini. Perhatikan baris ketiga, sebab `'  Baca bab 2  '` dikirim dengan spasi di kedua ujungnya, dan `console.log` di bawahnya membuktikan judulnya tersimpan sudah bersih. Pembersihan itu terjadi di dalam `buatTugas` dan bukan di sini, persis seperti yang dijanjikan kontrak data di langkah pertama. Baris `toggleSelesai(daftar, daftar[0].id)` menandai satu tugas selesai, sehingga `saring(..., FILTER.AKTIF)` menyisakan `2` dan `ringkasan` melaporkan `persen: 33` sebagai hasil pembulatan `1/3 × 100`.",
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
      p(
        'Keempat pengujian ini memeriksa hal yang berbeda-beda, dan bersama-sama mereka menutup celah yang paling sering lolos. Kelompok pertama memastikan input cacat **ditolak dengan berisik**, sebab kalau `buatTugas(\'   \')` berhasil tanpa error, artinya validasinya tidak bekerja dan daftar akan berisi tugas tanpa judul. Kelompok kedua menguji **daftar kosong**, keadaan yang selalu ada di aplikasi mana pun saat pertama kali dibuka, dan di sinilah penjaga pembagian nol pada `ringkasan` membuktikan gunanya, sebab tanpa itu `selesai / daftar.length` menghasilkan `NaN` yang lalu tampil di layar sebagai "NaN%". Kelompok ketiga memeriksa **id yang tidak ada**, dan perhatikan yang diuji bukan errornya melainkan justru ketiadaan perubahan, sebab `filter` memang tidak protes bila tak ada yang cocok, dan perilaku itu yang ingin dipastikan. Kelompok terakhir menegaskan bahwa nilai filter salah ketik harus berteriak, sebab kalau ia diam-diam mengembalikan semua tugas, bugnya akan terlihat seperti "filternya tidak berfungsi" dan penelusurannya bisa memakan waktu berjam-jam.',
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
        'Pure function tanpa mutasi bukan gaya, melainkan syarat agar React bekerja benar.',
        'Validasi di batas masuk: tolak input tidak valid sekali, di satu tempat.',
        'Uji kasus kosong, id tidak ada, dan nilai tak dikenal — di situlah bug bersembunyi.',
      ),
      references(
        {
          label: 'Crypto: randomUUID() method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID',
          source: 'MDN',
          note: 'Termasuk catatan bahwa ia hanya tersedia pada konteks yang aman (`https` atau `localhost`).',
        },
        {
          label: 'Date.prototype.toISOString()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString',
          source: 'MDN',
          note: 'Bentuk baku tanggal yang dipakai `dibuatPada` di modul ini.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan resmi React kenapa fungsi tanpa mutasi bukan sekadar gaya penulisan.',
        },
        {
          label: 'Rendering Lists',
          href: 'https://react.dev/learn/rendering-lists',
          source: 'React',
          note: 'Bagian "Why does React need keys?" adalah lanjutan langsung dari keputusan `id` di sub-bab ini.',
        },
        {
          label: 'JSDoc @typedef',
          href: 'https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html',
          source: 'TypeScript',
          note: 'Daftar penanda JSDoc yang dipahami editor untuk memberi tipe pada berkas JavaScript biasa.',
        },
      ),
    ],
  ),
];
