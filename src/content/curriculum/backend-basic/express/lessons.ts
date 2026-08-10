import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  p,
  references,
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Basic — Chapter 3, all fourteen lessons.
 *
 * Express 5 throughout. The version matters more than usual here: async error handling changed,
 * `req.query` became a getter, and several long-standing middleware are now built in. Copying a
 * tutorial written for Express 4 produces code that runs but swallows errors.
 *
 * The chapter deliberately builds a raw `node:http` server first (3.3) so that Express is
 * understood as a convenience over something the reader has already seen, not as magic.
 */
export const lessons: LessonDraft[] = [
  written(
    'nodejs-runtime',
    'Node.js: runtime, event loop, npm',
    10,
    'Menjalankan JavaScript di luar browser, dan model konkurensinya.',
    [
      p(
        'Node.js adalah runtime yang menjalankan JavaScript di luar browser. Bahasanya sama persis dengan yang kamu pakai di Frontend Basic — yang berbeda adalah **lingkungannya**: tidak ada `window`, tidak ada `document`, tapi ada akses berkas, jaringan, dan proses.',
      ),

      terms(
        {
          term: 'runtime',
          meaning:
            'Lingkungan tempat kode dijalankan beserta API yang tersedia di sana. Bahasanya **sama persis** dengan yang kamu pakai di Frontend Basic — yang berbeda lingkungannya: tidak ada `window` dan `document`, tapi ada akses berkas, jaringan, dan proses.',
        },
        {
          term: 'V8',
          meaning:
            'Mesin JavaScript buatan Google yang menjalankan kodemu — mesin yang sama dengan yang dipakai Chrome. Node.js pada dasarnya adalah V8 ditambah kemampuan yang tidak dimiliki browser: berkas, jaringan tingkat rendah, dan proses.',
        },
        {
          term: 'libuv',
          meaning:
            'Pustaka C yang menangani operasi I/O di **luar** utas JavaScript. Ia yang membuat Node bisa menunggu ribuan operasi sekaligus tanpa menghentikan kodemu. Nama `uv` dari *unicorn velociraptor* — bercandaan penulisnya, bukan singkatan teknis.',
        },
        {
          term: 'single-threaded',
          meaning:
            'Node menjalankan kodemu di **satu utas**. Yang membuatnya tetap sanggup melayani ribuan koneksi bukan jumlah utasnya, melainkan cara ia menangani penantian: operasi I/O diserahkan ke sistem, dan utasnya lanjut mengerjakan hal lain.',
        },
        {
          term: 'blocking',
          meaning:
            'Kode yang menahan utas sampai selesai. Konsekuensi terbesar Node ada di sini: satu `for` loop yang berjalan tiga detik membuat **setiap** permintaan lain menunggu tiga detik — bukan hanya milik pemicunya. Ini beda terbesar dari model satu-proses-per-permintaan seperti PHP.',
        },
        {
          term: 'event loop',
          meaning:
            'Putaran yang mengambil callback dari antrean dan menjalankannya **saat call stack kosong**. Ia bukan penjadwal paralel: ia mengerjakan satu hal pada satu waktu, hanya saja tidak pernah menganggur menunggu I/O.',
        },
        {
          term: 'LTS',
          meaning:
            'Singkatan *Long Term Support* — versi Node bernomor **genap** yang didukung bertahun-tahun. Versi ganjil bersifat eksperimental dan berumur pendek. Untuk server, selalu pilih LTS.',
        },
        {
          term: 'dependencies vs devDependencies',
          meaning:
            '`dependencies` dibutuhkan saat aplikasi **berjalan**; `devDependencies` hanya saat pengembangan — linter, formatter, alat uji. Salah menaruh berarti server ikut memasang paket yang tidak pernah ia pakai.',
        },
        {
          term: 'package-lock.json',
          meaning:
            'Berkas yang mencatat versi **persis** setiap paket beserta turunannya. `package.json` hanya menyimpan **rentang** (`^5.1.0` berarti 5.x.x mana saja). Tanpa lockfile yang di-commit, dua orang bisa memasang versi berbeda dari perintah yang sama.',
        },
        {
          term: 'npm ci',
          meaning:
            'Pemasangan yang **patuh pada lockfile** dan gagal kalau tidak cocok dengan `package.json`. Ini yang dipakai di CI dan produksi. `npm install` boleh memperbarui lockfile, jadi ia untuk pengembangan saja.',
        },
      ),

      h2('Yang ada dan tidak ada'),
      table(
        ['Browser', 'Node.js'],
        [
          ['`window`, `document`, `localStorage`', '`process`, `fs`, `path`, `os`'],
          ['`fetch` (bawaan)', '`fetch` (bawaan sejak Node 18)'],
          ['Tidak bisa baca berkas', 'Bisa baca/tulis berkas'],
          ['Dijalankan pengguna', 'Dijalankan kamu, di server'],
          ['Kode terlihat semua orang', '**Kode dan rahasianya tersembunyi**'],
        ],
      ),

      h2('Satu utas, tapi tidak memblokir'),
      p(
        'Node menjalankan kodemu di **satu utas**. Yang membuatnya tetap sanggup melayani ribuan koneksi adalah cara ia menangani penantian: operasi I/O diserahkan ke sistem, dan utasnya lanjut mengerjakan hal lain sampai hasilnya siap.',
      ),
      code(
        'text',
        `
        ┌───────────────────────────┐
        │  Call Stack (satu utas)   │
        └────────────┬──────────────┘
                     │ operasi I/O diserahkan
                     ▼
        ┌───────────────────────────┐
        │  libuv / OS               │  baca berkas, query DB,
        │  (berjalan di luar utas)  │  panggil API
        └────────────┬──────────────┘
                     │ selesai -> callback masuk antrean
                     ▼
        ┌───────────────────────────┐
        │  Event Loop               │  ambil dari antrean saat
        │                           │  call stack kosong
        └───────────────────────────┘
        `,
      ),
      callout(
        'danger',
        'Satu perhitungan berat memblokir SEMUA pengguna',
        'Karena hanya ada satu utas, satu `for` loop yang berjalan tiga detik membuat **setiap** permintaan lain menunggu tiga detik — bukan hanya milik pemicunya. Ini perbedaan terbesar dari model satu-proses-per-permintaan seperti PHP. Pekerjaan berat harus dipindahkan ke worker thread, ke proses terpisah, atau ke antrean job.',
      ),
      code(
        'js',
        `
        // MEMBLOKIR: seluruh server berhenti melayani
        function hitungBerat() {
          let total = 0;
          for (let i = 0; i < 1e10; i++) total += i;
          return total;
        }

        // TIDAK memblokir: penantian diserahkan ke sistem
        const data = await fs.promises.readFile('besar.txt');
        `,
      ),

      h2('Versi Node'),
      code(
        'bash',
        `
        node --version     # pakai versi LTS (bernomor genap)
        npm --version
        `,
      ),
      callout(
        'tip',
        'Kunci versinya di project',
        'Tambahkan `"engines": { "node": ">=22" }` di `package.json`, dan berkas `.nvmrc` berisi nomor versinya. Perbedaan versi Node antara laptop dan server adalah sumber bug "jalan di tempatku" yang sangat sering.',
      ),

      h2('npm dan `package.json`'),
      code(
        'json',
        `
        {
          "name": "api-catatan",
          "type": "module",
          "engines": { "node": ">=22" },
          "scripts": {
            "dev": "node --watch src/server.js",
            "start": "node src/server.js",
            "test": "node --test"
          },
          "dependencies": {
            "express": "^5.1.0"
          },
          "devDependencies": {
            "pino-pretty": "^13.0.0"
          }
        }
        `,
      ),
      table(
        ['', 'Untuk'],
        [
          ['`dependencies`', 'Dibutuhkan saat aplikasi **berjalan**'],
          ['`devDependencies`', 'Hanya saat pengembangan: linter, formatter, alat uji'],
        ],
      ),
      callout(
        'warning',
        '`package-lock.json` wajib ikut di-commit',
        '`package.json` menyimpan **rentang** versi (`^5.1.0` berarti 5.x.x mana saja). Tanpa lockfile, dua orang bisa memasang versi berbeda dari `npm install` yang sama, dan server bisa berbeda lagi. Lockfile yang di-commit adalah yang membuat pemasangan bisa diulang persis.',
      ),
      code(
        'bash',
        `
        npm install          # untuk pengembangan; boleh memperbarui lockfile
        npm ci               # untuk CI/produksi; PATUH pada lockfile, gagal kalau tidak cocok
        `,
      ),
      references(
        {
          label: 'The Node.js Event Loop',
          href: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
          source: 'Node.js',
          note: 'Fase-fase event loop dan alasan kode berat memblokir seluruh server.',
        },
        {
          label: "Don't Block the Event Loop",
          href: 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop',
          source: 'Node.js',
          note: 'Panduan resmi memindahkan pekerjaan berat keluar dari utas utama.',
        },
        {
          label: 'package.json — dependencies & engines',
          href: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json',
          source: 'npm',
          note: 'Arti setiap field, termasuk `engines` yang mengunci versi Node.',
        },
        {
          label: 'npm ci',
          href: 'https://docs.npmjs.com/cli/v11/commands/npm-ci',
          source: 'npm',
          note: 'Kenapa CI dan produksi memakai perintah ini, bukan `npm install`.',
        },
      ),
    ],
  ),

  written(
    'modul-node',
    'Modul: CommonJS vs ESM',
    9,
    'Dua sistem modul yang hidup berdampingan, dan cara memilih.',
    [
      p(
        'Node punya dua sistem modul. Kode lama memakai CommonJS; kode baru sebaiknya memakai ESM — sistem yang sama dengan yang kamu pakai di frontend.',
      ),

      terms(
        {
          term: 'modul',
          meaning:
            'Satu berkas yang bisa mengekspor sesuatu dan mengimpor dari berkas lain. Node punya **dua sistem modul** yang hidup berdampingan — dan mengenali yang mana penting, karena sintaks serta aturannya berbeda.',
        },
        {
          term: 'CommonJS (CJS)',
          meaning:
            'Sistem modul lama Node: `require()` dan `module.exports`. Dimuat **sinkron**, dan bisa dipanggil di tengah kode. Masih tersebar luas di kode lama dan banyak paket npm.',
        },
        {
          term: 'ESM',
          meaning:
            'Singkatan *ECMAScript Modules* — sistem modul resmi JavaScript: `import` dan `export`. Ini yang **sama dengan frontend**, dan yang sebaiknya dipakai untuk kode baru.',
        },
        {
          term: '"type": "module"',
          meaning:
            'Baris di `package.json` yang membuat Node memperlakukan berkas `.js` sebagai ESM. Tanpa itu, `.js` dianggap CommonJS. Alternatifnya: ekstensi `.mjs` untuk ESM dan `.cjs` untuk CommonJS — berguna saat satu project harus memuat keduanya.',
        },
        {
          term: 'ekstensi wajib di ESM',
          meaning:
            "Jebakan yang paling sering. `import { helper } from './utils'` **gagal** di Node — ekstensinya harus ditulis: `'./utils.js'`. Bundler seperti Vite menebak untukmu, Node tidak. Di TypeScript, tetap tulis `.js` meski berkasnya `.ts`, karena yang berjalan nanti hasil kompilasinya.",
        },
        {
          term: '__dirname',
          meaning:
            'Variabel berisi jalur folder berkas yang sedang berjalan. Ia **tersedia otomatis** di CommonJS tapi tidak ada di ESM — di sana kamu membuatnya sendiri dari `import.meta.url`.',
        },
        {
          term: 'import.meta.url',
          meaning:
            'Alamat berkas yang sedang berjalan, dalam bentuk URL (`file:///...`). Ini pengganti `__filename` di ESM; untuk mendapat jalur biasa, ia dilewatkan ke `fileURLToPath`.',
        },
        {
          term: 'prefiks node:',
          meaning:
            'Menulis `node:fs` alih-alih `fs`. Selain lebih jelas, ia menutup satu risiko rantai pasok: paket npm bernama `fs` atau `path` **tidak bisa membajak impormu**, karena `node:fs` mustahil merujuk ke paket pihak ketiga.',
        },
        {
          term: 'top-level await',
          meaning:
            '`await` di luar fungsi `async`, hanya bisa di ESM. Berguna untuk inisialisasi yang harus selesai sebelum modul dipakai — koneksi database, pembacaan kunci, atau validasi konfigurasi.',
        },
      ),

      h2('Perbandingan'),
      compare(
        {
          title: 'CommonJS (lama)',
          lang: 'js',
          code: `
          // Mengekspor
          module.exports = { buatCatatan };
          module.exports.hapus = hapus;

          // Mengimpor
          const { buatCatatan } = require('./catatan');
          const express = require('express');

          // Tersedia otomatis
          __dirname
          __filename
          `,
          notes: ['Dimuat sinkron', 'Bisa require di tengah kode'],
        },
        {
          title: 'ESM (baru)',
          lang: 'js',
          code: `
          // Mengekspor
          export { buatCatatan };
          export default app;

          // Mengimpor — ekstensi WAJIB ditulis
          import { buatCatatan } from './catatan.js';
          import express from 'express';

          // Harus dibuat sendiri
          import { fileURLToPath } from 'node:url';
          const __dirname = path.dirname(
            fileURLToPath(import.meta.url),
          );
          `,
          notes: ['Bisa top-level await', 'Sama dengan frontend'],
        },
      ),

      h2('Mengaktifkan ESM'),
      code(
        'json',
        `
        {
          "type": "module"
        }
        `,
        { filename: 'package.json' },
      ),
      p(
        'Tanpa baris itu, Node memperlakukan `.js` sebagai CommonJS. Alternatifnya: beri ekstensi `.mjs` untuk ESM, atau `.cjs` untuk CommonJS — berguna saat satu project harus memuat keduanya.',
      ),

      h2('Jebakan yang paling sering'),
      code(
        'js',
        `
        // SALAH di ESM — Node tidak menebak ekstensi
        import { helper } from './utils';

        // BENAR — ekstensi ditulis lengkap
        import { helper } from './utils.js';
        `,
      ),
      callout(
        'warning',
        'Ini berbeda dari yang kamu biasakan di frontend',
        "Bundler seperti Vite dan webpack menebak ekstensi untukmu, jadi `from './utils'` bekerja di project React. Node **tidak** menebak — ia mengikuti spesifikasi ESM. Kalau kamu memakai TypeScript, tulis tetap `.js` di jalur impor meski berkasnya `.ts`, karena yang berjalan nanti adalah hasil kompilasinya.",
      ),

      h2('Prefiks `node:`'),
      code(
        'js',
        `
        // Disarankan: jelas ini modul bawaan, bukan paket dari npm
        import fs from 'node:fs/promises';
        import path from 'node:path';
        import crypto from 'node:crypto';
        `,
      ),
      p(
        'Prefiks itu juga menutup satu risiko rantai pasok: paket npm bernama `fs` atau `path` tidak bisa membajak impormu, karena `node:fs` tidak mungkin merujuk ke paket pihak ketiga.',
      ),

      h2('Top-level `await` — hanya di ESM'),
      code(
        'js',
        `
        // Bisa di ESM, tidak bisa di CommonJS
        const konfigurasi = await bacaKonfigurasi();
        const db = await hubungkanDatabase(konfigurasi.databaseUrl);

        export { db };
        `,
      ),
      p(
        'Ini berguna untuk inisialisasi yang harus selesai sebelum modul dipakai — koneksi database, pembacaan kunci, atau validasi konfigurasi.',
      ),
      references(
        {
          label: 'Modules: ECMAScript modules',
          href: 'https://nodejs.org/api/esm.html',
          source: 'Node.js',
          note: 'Aturan ESM di Node, termasuk kewajiban menulis ekstensi berkas.',
        },
        {
          label: 'Modules: CommonJS modules',
          href: 'https://nodejs.org/api/modules.html',
          source: 'Node.js',
          note: 'Sistem lama beserta variabel bawaannya seperti `__dirname`.',
        },
        {
          label: 'Determining module system',
          href: 'https://nodejs.org/api/packages.html#determining-module-system',
          source: 'Node.js',
          note: 'Bagaimana `"type": "module"` dan ekstensi `.mjs`/`.cjs` menentukan sistemnya.',
        },
        {
          label: 'import.meta',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta',
          source: 'MDN Web Docs',
          note: 'Objek yang menggantikan `__filename` dan `__dirname` di ESM.',
        },
      ),
    ],
  ),

  written(
    'http-tanpa-framework',
    'HTTP Server tanpa Framework',
    10,
    'Melihat apa yang sebenarnya dikerjakan Express, dengan membuatnya sendiri.',
    [
      p(
        'Sebelum memakai Express, buat dulu servernya dengan modul bawaan. Sepuluh menit di sini membuat Express terasa seperti kemudahan yang wajar — bukan sihir yang harus dihafal.',
      ),

      terms(
        {
          term: 'node:http',
          meaning:
            'Modul bawaan Node untuk membuat server HTTP. Tidak ada yang perlu dipasang — kemampuan ini sudah ada sejak awal. Express dibangun **di atasnya**, bukan menggantikannya.',
        },
        {
          term: 'createServer',
          meaning:
            'Fungsi yang menerima **satu fungsi handler** `(req, res) => {...}` dan mengembalikan server. Ini poin terpenting sub-bab: Express bukan server — ia adalah satu handler yang dioper ke sini.',
        },
        {
          term: 'req / res',
          meaning:
            'Singkatan **request** dan **response**. `req` berisi apa yang dikirim klien (method, url, header, body); `res` adalah alat untuk menjawab. Nama pendek ini konvensi yang berlaku di hampir semua framework Node.',
        },
        {
          term: 'writeHead / end',
          meaning:
            '`res.writeHead(status, header)` menetapkan status dan header; `res.end(isi)` mengirim body dan **menutup** jawaban. Setelah `end`, tidak ada lagi yang bisa ditulis — jawaban sudah berangkat.',
        },
        {
          term: 'routing manual',
          meaning:
            'Mencocokkan `req.method` dan `req.url` sendiri dengan `if` dan regex. Terlihat sederhana untuk dua rute, lalu berubah jadi rantai `if` yang sulit dibaca begitu rutenya belasan. Inilah yang pertama kali dihapus Express.',
        },
        {
          term: 'stream',
          meaning:
            'Data yang datang **bertahap sebagai potongan**, bukan sekaligus. Body permintaan adalah stream — itulah kenapa membacanya butuh mengumpulkan potongan lewat event `data`, lalu menunggu event `end`.',
        },
        {
          term: "req.on('data') / req.on('end')",
          meaning:
            'Dua event saat membaca body. `data` menyala untuk **setiap potongan** yang tiba; `end` menyala sekali setelah semuanya lengkap. Baru di `end` kamu punya body utuh untuk di-parse.',
        },
        {
          term: 'batas byte',
          meaning:
            'Pemeriksaan ukuran **selama** potongan masuk, bukan setelahnya. Tanpa itu, satu permintaan bisa menghabiskan memori sebelum kamu sempat menolaknya. Perhatikan `req.destroy()` — ia memutus koneksinya, bukan sekadar berhenti mengumpulkan.',
        },
        {
          term: 'Content-Type',
          meaning:
            'Header yang memberitahu klien **format** isi jawaban — `application/json`. Tanpa itu, browser dan klien lain bisa salah menafsirkan isinya. Express menuliskannya otomatis lewat `res.json()`.',
        },
      ),

      h2('Server paling sederhana'),
      code(
        'js',
        `
        import http from 'node:http';

        const server = http.createServer((req, res) => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ pesan: 'Halo' }));
        });

        server.listen(3000, () => console.log('Siap di http://localhost:3000'));
        `,
        { filename: 'server.js' },
      ),

      h2('Routing manual'),
      code(
        'js',
        `
        const server = http.createServer(async (req, res) => {
          const url = new URL(req.url, \`http://\${req.headers.host}\`);

          if (req.method === 'GET' && url.pathname === '/api/catatan') {
            return kirimJson(res, 200, { data: catatan });
          }

          // Path param harus dicocokkan sendiri, dengan regex
          const cocok = url.pathname.match(/^\\/api\\/catatan\\/(\\d+)$/);
          if (req.method === 'GET' && cocok) {
            const item = catatan.find((c) => c.id === Number(cocok[1]));
            if (item === undefined) return kirimJson(res, 404, { pesan: 'Tidak ditemukan' });
            return kirimJson(res, 200, { data: item });
          }

          kirimJson(res, 404, { pesan: 'Rute tidak ditemukan' });
        });

        function kirimJson(res, status, data) {
          res.writeHead(status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        }
        `,
      ),

      h2('Membaca body — bagian yang paling merepotkan'),
      code(
        'js',
        `
        function bacaBody(req, batasByte = 10_000) {
          return new Promise((selesai, gagal) => {
            let data = '';

            req.on('data', (potongan) => {
              data += potongan;

              // WAJIB: tanpa batas, satu permintaan bisa menghabiskan memori.
              if (data.length > batasByte) {
                gagal(new Error('Body terlalu besar'));
                req.destroy();
              }
            });

            req.on('end', () => {
              if (data === '') return selesai({});
              try {
                selesai(JSON.parse(data));
              } catch {
                gagal(new Error('Body bukan JSON yang sah'));
              }
            });

            req.on('error', gagal);
          });
        }
        `,
      ),
      p(
        'Body datang **bertahap** sebagai potongan (stream), bukan sekaligus. Itulah kenapa membacanya butuh mengumpulkan potongan lalu menunggu `end`.',
      ),

      h2('Yang Express hilangkan dari kode di atas'),
      table(
        ['Manual', 'Express'],
        [
          ['Cocokkan URL dengan `if` dan regex', "`app.get('/api/catatan/:id', ...)`"],
          ['Kumpulkan potongan body sendiri', '`express.json()`'],
          ['Tulis `Content-Type` sendiri', '`res.json(data)`'],
          ['Susun 404 di setiap cabang', 'Otomatis kalau tidak ada rute yang cocok'],
          ['Tidak ada tempat untuk kode bersama', 'Middleware'],
        ],
      ),
      callout(
        'tip',
        'Apa yang perlu kamu bawa dari sub-bab ini',
        'Express bukan server — ia adalah **satu fungsi handler** yang dioper ke `http.createServer`. Semua yang ia lakukan bisa kamu tulis sendiri. Mengetahui itu membuatmu bisa membaca pesan errornya, memahami kenapa urutan middleware penting, dan tidak takut membuka kodenya saat ada yang aneh.',
      ),
      references(
        {
          label: 'HTTP — http.createServer()',
          href: 'https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener',
          source: 'Node.js',
          note: 'Bentuk handler `(req, res)` yang menjadi dasar seluruh framework HTTP di Node.',
        },
        {
          label: 'http.IncomingMessage',
          href: 'https://nodejs.org/api/http.html#class-httpincomingmessage',
          source: 'Node.js',
          note: 'Objek `req` — dan penegasan bahwa ia sebuah readable stream.',
        },
        {
          label: 'Stream — Readable',
          href: 'https://nodejs.org/api/stream.html#readable-streams',
          source: 'Node.js',
          note: 'Event `data` dan `end` yang dipakai mengumpulkan body bertahap.',
        },
        {
          label: 'URL',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URL',
          source: 'MDN Web Docs',
          note: 'Mengurai `req.url` menjadi pathname dan query tanpa regex buatan sendiri.',
        },
      ),
    ],
  ),

  written(
    'express-setup',
    'Express 5: instalasi, `app`, `listen`',
    9,
    'Menyiapkan aplikasi Express yang benar sejak awal.',
    [
      terms(
        {
          term: 'Express',
          meaning:
            'Framework web paling banyak dipakai di Node. Ia tidak memaksakan struktur apa pun — yang ia beri hanya routing, middleware, dan pembantu untuk membaca permintaan serta menyusun jawaban. Sisanya kamu yang atur.',
        },
        {
          term: 'app',
          meaning:
            'Objek aplikasi hasil `express()`. Ia sekaligus **fungsi handler** yang bisa dioper ke `http.createServer` — itulah kenapa memisahkannya dari `listen` membuat pengujian jadi mungkin tanpa membuka port.',
        },
        {
          term: 'express.json()',
          meaning:
            'Middleware bawaan yang membaca body JSON dan mengisinya ke `req.body`. Ia menggantikan seluruh kode pengumpul potongan di sub-bab sebelumnya — termasuk penanganan JSON rusak.',
        },
        {
          term: 'limit',
          meaning:
            'Opsi batas ukuran body. Default-nya kebetulan aman (100kb), tapi **tulis eksplisit**: begitu seseorang menaikkannya "supaya unggahan besar bisa lewat", batasnya hilang bersama pertahanannya — dan keputusan itu jadi tidak terlihat siapa pun.',
        },
        {
          term: 'express.urlencoded()',
          meaning:
            'Middleware untuk body dari form HTML biasa (`application/x-www-form-urlencoded`), bukan JSON. Opsi `extended: true` membuatnya bisa membaca objek dan array bersarang.',
        },
        {
          term: 'Express 5 dan handler async',
          meaning:
            'Alasan utama memakai Express 5. Di Express 4, error di dalam handler `async` **tidak pernah** sampai ke error handler — permintaannya menggantung sampai timeout, tanpa jejak apa pun di log. Express 5 meneruskannya otomatis.',
        },
        {
          term: 'app.listen',
          meaning:
            'Mulai mendengarkan di sebuah port dan mengembalikan objek `server`. Objek itulah yang nanti dipakai untuk menutup server dengan benar — jadi simpan hasilnya, jangan buang.',
        },
        {
          term: 'graceful shutdown',
          meaning:
            'Menutup server dengan **menyelesaikan dulu** permintaan yang sedang berjalan, bukan memutusnya. Tanpa ini, setiap deploy memotong permintaan di tengah jalan — termasuk yang sedang menulis ke database. Kecil untuk ditulis, mahal kalau tidak ada.',
        },
        {
          term: 'SIGTERM / SIGINT',
          meaning:
            'Dua sinyal permintaan berhenti. **SIGTERM** dikirim sistem saat deploy atau restart; **SIGINT** saat kamu menekan Ctrl+C. Keduanya harus ditangani supaya penutupan berlangsung rapi di kedua situasi.',
        },
        {
          term: 'unref()',
          meaning:
            'Menandai sebuah timer supaya **tidak menahan** proses tetap hidup. Pada contoh shutdown, ia membuat timer batas 10 detik ada sebagai jaring pengaman tanpa ikut menunda proses yang sudah selesai lebih cepat.',
        },
      ),

      h2('Pemasangan'),
      code(
        'bash',
        `
        mkdir api-catatan && cd api-catatan
        npm init -y
        npm install express
        npm pkg set type=module
        `,
      ),

      h2('Aplikasi minimal'),
      code(
        'js',
        `
        import express from 'express';

        const app = express();

        // Batas ukuran body — pertahanan pertama terhadap penyalahgunaan sumber daya.
        app.use(express.json({ limit: '100kb' }));
        app.use(express.urlencoded({ extended: true, limit: '100kb' }));

        app.get('/health', (req, res) => {
          res.json({ status: 'ok' });
        });

        const port = Number(process.env.PORT ?? 3000);
        app.listen(port, () => {
          console.log(\`Siap di http://localhost:\${port}\`);
        });
        `,
        { filename: 'src/server.js' },
      ),
      callout(
        'danger',
        'Jangan lupa `limit`',
        'Tanpa opsi itu, `express.json()` memakai batas default 100kb — yang kebetulan aman. Tapi begitu seseorang menaikkannya "supaya unggahan besar bisa lewat", batasnya hilang bersama pertahanannya. Tulis batasnya secara eksplisit supaya keputusannya terlihat.',
      ),

      h2('Perubahan penting di Express 5'),
      table(
        ['', 'Express 4', 'Express 5'],
        [
          ['Error di handler `async`', '**Ditelan diam-diam**', 'Diteruskan otomatis'],
          ['`req.query`', 'Properti biasa', 'Getter — tidak bisa ditimpa'],
          ['`app.del()`', 'Ada', 'Dihapus — pakai `app.delete()`'],
          ['Wildcard `*`', 'Bisa telanjang', 'Harus dinamai: `/*sisa`'],
          ['`res.sendfile()`', 'Ada (huruf kecil)', 'Dihapus — pakai `res.sendFile()`'],
          ['Node minimum', '0.10+', '**18+**'],
        ],
      ),
      callout(
        'info',
        'Perubahan async adalah alasan utama memakai Express 5',
        'Di Express 4, error di dalam handler `async` tidak pernah sampai ke error handler — permintaannya menggantung sampai timeout, tanpa jejak apa pun di log. Setiap handler harus dibungkus manual. Express 5 menanganinya sendiri, dan itu menghapus satu kelas bug yang sangat sulit dilacak.',
      ),

      h2('Memisahkan `app` dari `listen`'),
      compare(
        {
          title: 'Digabung',
          lang: 'js',
          code: `
          // server.js
          const app = express();
          app.get('/', ...);
          app.listen(3000);

          // Tes harus benar-benar
          // membuka port.
          `,
          notes: ['Sulit diuji', 'Port bentrok kalau tes berjalan paralel'],
        },
        {
          title: 'Dipisah',
          lang: 'js',
          code: `
          // app.js
          export const app = express();
          app.get('/', ...);

          // server.js
          import { app } from './app.js';
          app.listen(3000);

          // Tes cukup mengimpor app.
          `,
          notes: ['Bisa diuji tanpa membuka port', 'Satu berkas untuk satu tanggung jawab'],
        },
      ),

      h2('Mematikan server dengan benar'),
      code(
        'js',
        `
        const server = app.listen(port);

        // Saat proses diminta berhenti (deploy, restart), selesaikan dulu
        // permintaan yang sedang berjalan — jangan putus di tengah jalan.
        for (const sinyal of ['SIGTERM', 'SIGINT']) {
          process.on(sinyal, () => {
            console.log(\`\${sinyal} diterima, menutup server...\`);

            server.close(() => {
              console.log('Server ditutup');
              process.exit(0);
            });

            // Jangan menggantung selamanya kalau ada koneksi yang tidak selesai.
            setTimeout(() => process.exit(1), 10_000).unref();
          });
        }
        `,
      ),
      p(
        'Tanpa ini, setiap deploy memutus permintaan yang sedang diproses — termasuk yang sedang menulis ke database. Ini kecil untuk ditulis dan mahal kalau tidak ada.',
      ),
      references(
        {
          label: 'Express — Installing & Hello World',
          href: 'https://expressjs.com/en/starter/installing.html',
          source: 'Express',
          note: 'Bentuk aplikasi paling minimal, sebelum struktur apa pun ditambahkan.',
        },
        {
          label: 'Migrating to Express 5',
          href: 'https://expressjs.com/en/guide/migrating-5.html',
          source: 'Express',
          note: 'Daftar perubahan yang memutus kode Express 4, termasuk perilaku handler `async`.',
        },
        {
          label: 'express.json() & express.urlencoded()',
          href: 'https://expressjs.com/en/api.html#express.json',
          source: 'Express',
          note: 'Opsi `limit` dan `extended` beserta default masing-masing.',
        },
        {
          label: 'Signal Events — SIGTERM & SIGINT',
          href: 'https://nodejs.org/api/process.html#signal-events',
          source: 'Node.js',
          note: 'Sinyal yang harus ditangani agar penutupan server berlangsung rapi.',
        },
      ),
    ],
  ),

  written(
    'routing-express',
    'Routing & Route Parameter',
    10,
    'Memetakan URL ke fungsi yang menanganinya.',
    [
      terms(
        {
          term: 'routing',
          meaning:
            'Memetakan pasangan **method + path** ke fungsi yang menanganinya. `app.get(\'/catatan\', ...)` berarti "kalau ada `GET /catatan`, jalankan fungsi ini". Ini pekerjaan pertama yang dihapus Express dari kode manual di sub-bab sebelumnya.',
        },
        {
          term: 'route parameter',
          meaning:
            'Bagian path yang ditandai titik dua — `:id` pada `/catatan/:id`. Nilainya masuk ke `req.params`. Sifat yang wajib diingat: **isinya SELALU string**, bahkan untuk `/catatan/42`.',
        },
        {
          term: 'req.params',
          meaning:
            'Objek berisi seluruh route parameter. Karena nilainya string dan **apa pun** cocok — `/catatan/abc` juga masuk ke rute `:id` — ia wajib divalidasi sebelum dipakai, bukan langsung dilempar ke query database.',
        },
        {
          term: 'urutan rute',
          meaning:
            'Express mencocokkan **dari atas ke bawah** dan berhenti pada yang pertama cocok. Akibatnya: `/catatan/baru` yang ditulis setelah `/catatan/:id` **tidak pernah tercapai**. Aturannya — rute spesifik selalu di atas rute berparameter.',
        },
        {
          term: 'Router',
          meaning:
            "Objek routing mini yang bisa berdiri sendiri di berkasnya, lalu dipasang ke aplikasi dengan `app.use('/api/catatan', router)`. Prefiksnya ditentukan **sekali di tempat pemasangan**, bukan diulang di setiap rute.",
        },
        {
          term: 'mergeParams',
          meaning:
            'Opsi `Router({ mergeParams: true })` yang membuat parameter dari router **induk** terlihat di router anak. Tanpa itu, `req.params.catatanId` bernilai `undefined` **tanpa error apa pun** — query mencari komentar milik catatan `undefined` lalu mengembalikan array kosong. Tidak ada yang tampak rusak.',
        },
        {
          term: 'router bersarang',
          meaning:
            'Router yang dipasang di dalam router lain untuk menyatakan kepemilikan — `/api/catatan/:catatanId/komentar`. Ia yang mewujudkan resource bersarang dari Bab 1, tapi butuh `mergeParams` supaya id induknya sampai ke bawah.',
        },
        {
          term: 'rute penampung 404',
          meaning:
            'Middleware terakhir yang menjawab permintaan yang tidak cocok dengan rute mana pun. Ia harus dipasang **setelah semua rute lain** — kalau lebih dulu, ia akan menelan semuanya.',
        },
        {
          term: 'wildcard bernama',
          meaning:
            "Perubahan Express 5: pola `*` telanjang **tidak lagi sah**, harus dinamai (`/*sisa`). Kode Express 4 yang memakai `app.get('*')` akan melempar error saat aplikasi dijalankan, bukan diam-diam berperilaku lain.",
        },
      ),

      h2('Bentuk dasar'),
      code(
        'js',
        `
        app.get('/catatan', (req, res) => { /* daftar */ });
        app.post('/catatan', (req, res) => { /* buat */ });
        app.get('/catatan/:id', (req, res) => { /* satu item */ });
        app.patch('/catatan/:id', (req, res) => { /* ubah sebagian */ });
        app.delete('/catatan/:id', (req, res) => { /* hapus */ });
        `,
      ),

      h2('Route parameter'),
      code(
        'js',
        `
        app.get('/catatan/:id', (req, res) => {
          // SELALU string, bahkan untuk /catatan/42
          const idMentah = req.params.id;

          const id = Number(idMentah);

          // Validasi sebelum dipakai — '/catatan/abc' juga cocok dengan rute ini.
          if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: { pesan: 'id harus bilangan bulat positif' } });
          }

          // ...
        });

        // Beberapa parameter
        app.get('/pengguna/:penggunaId/catatan/:catatanId', (req, res) => {
          const { penggunaId, catatanId } = req.params;
        });
        `,
      ),
      callout(
        'danger',
        'Parameter rute adalah masukan yang tidak tepercaya',
        '`/catatan/abc`, `/catatan/-1`, `/catatan/999999999999999999999`, dan `/catatan/1%20OR%201=1` semuanya cocok dengan pola `:id`. Tanpa validasi, nilai itu langsung masuk ke query database. Perlakukan sama seperti body: validasi bentuk dan rentangnya lebih dulu.',
      ),

      h2('Urutan rute menentukan'),
      code(
        'js',
        `
        // SALAH: '/catatan/baru' akan tertangkap ':id' lebih dulu
        app.get('/catatan/:id', ...);
        app.get('/catatan/baru', ...);   // tidak pernah tercapai

        // BENAR: yang spesifik didahulukan
        app.get('/catatan/baru', ...);
        app.get('/catatan/:id', ...);
        `,
      ),
      p(
        'Express mencocokkan dari atas ke bawah dan berhenti pada yang pertama cocok. Rute spesifik selalu di atas rute berparameter.',
      ),

      h2('Router: memecah berdasarkan sumber daya'),
      code(
        'js',
        `
        import { Router } from 'express';

        const router = Router();

        router.get('/', daftarCatatan);
        router.post('/', buatCatatan);
        router.get('/:id', ambilCatatan);

        export default router;
        `,
        { filename: 'src/routes/catatan.js' },
      ),
      code(
        'js',
        `
        import catatanRouter from './routes/catatan.js';
        import penggunaRouter from './routes/pengguna.js';

        // Prefiks ditentukan di sini, bukan diulang di setiap rute.
        app.use('/api/catatan', catatanRouter);
        app.use('/api/pengguna', penggunaRouter);
        `,
      ),

      h2('Router bersarang'),
      code(
        'js',
        `
        // Untuk /api/catatan/:catatanId/komentar
        const komentarRouter = Router({ mergeParams: true });

        komentarRouter.get('/', (req, res) => {
          // mergeParams inilah yang membuat :catatanId terlihat di sini
          const { catatanId } = req.params;
        });

        router.use('/:catatanId/komentar', komentarRouter);
        `,
      ),
      callout(
        'warning',
        'Tanpa `mergeParams`, parameter induk hilang',
        'Ini jebakan yang membingungkan: `req.params.catatanId` bernilai `undefined` tanpa error apa pun, lalu query-mu mencari komentar milik catatan `undefined` dan mengembalikan array kosong. Tidak ada yang tampak rusak — hanya datanya tidak pernah muncul.',
      ),

      h2('Rute penampung 404'),
      code(
        'js',
        `
        // Setelah SEMUA rute lain. Di Express 5, wildcard harus dinamai.
        app.use((req, res) => {
          res.status(404).json({
            error: { kode: 'RUTE_TIDAK_DITEMUKAN', pesan: 'Endpoint tidak ada' },
          });
        });
        `,
      ),
      references(
        {
          label: 'Express — Basic routing',
          href: 'https://expressjs.com/en/starter/basic-routing.html',
          source: 'Express',
          note: 'Bentuk `app.METHOD(path, handler)` untuk setiap method HTTP.',
        },
        {
          label: 'Routing guide — route parameters',
          href: 'https://expressjs.com/en/guide/routing.html',
          source: 'Express',
          note: 'Pola path, `req.params`, dan aturan pencocokan dari atas ke bawah.',
        },
        {
          label: 'express.Router()',
          href: 'https://expressjs.com/en/5x/api.html#router',
          source: 'Express',
          note: 'Opsi `mergeParams` yang membuat parameter router induk terlihat di anaknya.',
        },
        {
          label: 'Migrating to Express 5 — path matching',
          href: 'https://expressjs.com/en/guide/migrating-5.html#path-syntax',
          source: 'Express',
          note: 'Kenapa wildcard `*` sekarang wajib dinamai.',
        },
      ),
    ],
  ),

  written(
    'middleware',
    'Middleware: konsep, urutan, `next()`',
    12,
    'Fungsi yang berjalan di antara permintaan dan handlernya.',
    [
      p(
        'Middleware adalah fungsi yang menerima `(req, res, next)` dan berjalan **sebelum** handler rute. Seluruh Express dibangun dari konsep ini — bahkan `express.json()` hanyalah middleware biasa.',
      ),

      terms(
        {
          term: 'middleware',
          meaning:
            'Fungsi bertanda tangan `(req, res, next)` yang berjalan **sebelum** handler rute. Seluruh Express dibangun dari konsep ini — bahkan `express.json()` hanyalah middleware biasa, bukan sesuatu yang istimewa.',
        },
        {
          term: 'next()',
          meaning:
            'Fungsi yang menyerahkan permintaan ke middleware berikutnya. **Lupa memanggilnya berarti permintaan menggantung** — tidak ada error, tidak ada log, tidak ada jawaban. Aturannya: setiap jalur harus mengirim respons **atau** memanggil `next()`, persis satu dari keduanya.',
        },
        {
          term: 'urutan pendaftaran',
          meaning:
            'Middleware berjalan sesuai urutan `app.use()` ditulis. Ini bukan detail gaya: memasang autentikasi **setelah** router berarti penjagaannya tidak pernah tercapai. Urutan adalah bagian dari logikanya.',
        },
        {
          term: 'app.use dengan prefiks',
          meaning:
            "`app.use('/api', autentikasi)` membuat middleware itu hanya berlaku untuk path yang diawali `/api`. Cara paling ringkas memasang penjagaan di depan sekelompok rute sekaligus.",
        },
        {
          term: 'middleware per rute',
          meaning:
            "Middleware yang dioper langsung ke definisi rute: `app.post('/catatan', autentikasi, validasi, handler)`. Ia berjalan **berurutan dari kiri ke kanan**, dan hanya untuk rute itu.",
        },
        {
          term: 'menitipkan data lewat req',
          meaning:
            'Menempelkan hasil kerja middleware ke objek `req` — misalnya `req.pengguna = {...}` — supaya handler berikutnya bisa membacanya. Ini jalur resmi berbagi data antar middleware dalam satu permintaan.',
        },
        {
          term: 'identitas hanya dari yang diverifikasi',
          meaning:
            'Aturan keras. Menerima `req.body.userId` sebagai identitas berarti **siapa pun bisa mengaku jadi siapa pun**. Identitas hanya boleh berasal dari token yang tanda tangannya diperiksa, atau cookie sesi yang dicocokkan ke penyimpanan.',
        },
        {
          term: 'middleware error',
          meaning:
            'Middleware bertanda tangan **empat argumen** `(err, req, res, next)`. Express membedakannya dari middleware biasa lewat `fn.length` — menulis tiga argumen membuatnya diperlakukan sebagai middleware biasa dan ia **tidak akan pernah** menerima error. Parameter `next` wajib ditulis meski tidak dipakai.',
        },
        {
          term: 'helmet',
          meaning:
            'Middleware pihak ketiga yang memasang sekumpulan header keamanan sekaligus — `X-Content-Type-Options`, `Referrer-Policy`, dan lainnya. Satu baris yang menutup beberapa celah kecil sekaligus.',
        },
        {
          term: 'express-rate-limit',
          meaning:
            'Middleware pembatas jumlah permintaan per pemanggil. Wajib pada endpoint sensitif — login, reset password, pencarian — supaya satu klien tidak bisa menghabiskan kapasitas untuk semua.',
        },
      ),

      h2('Bentuknya'),
      code(
        'js',
        `
        function pencatat(req, res, next) {
          const mulai = Date.now();

          res.on('finish', () => {
            console.log(\`\${req.method} \${req.originalUrl} \${res.statusCode} \${Date.now() - mulai}ms\`);
          });

          next();   // WAJIB — tanpa ini permintaan menggantung selamanya
        }

        app.use(pencatat);
        `,
      ),
      callout(
        'danger',
        'Lupa `next()` = permintaan menggantung',
        'Tidak ada error, tidak ada log, tidak ada jawaban. Klien menunggu sampai timeout. Aturannya: setiap jalur di dalam middleware harus **mengirim respons** atau **memanggil `next()`** — persis satu dari keduanya, tidak boleh keduanya.',
      ),

      h2('Urutan adalah segalanya'),
      code(
        'js',
        `
        app.use(express.json());        // 1. body diurai
        app.use(pencatat);              // 2. dicatat
        app.use('/api', autentikasi);   // 3. identitas diperiksa
        app.use('/api/catatan', catatanRouter);   // 4. handler
        app.use(penanganError);         // 5. terakhir, selalu
        `,
      ),
      compare(
        {
          title: 'Urutan salah',
          lang: 'js',
          code: `
          app.use('/api', catatanRouter);
          app.use('/api', autentikasi);

          // Handler sudah menjawab
          // sebelum auth diperiksa.
          // SELURUH API terbuka.
          `,
          notes: ['Celah keamanan yang tidak terlihat di pengujian normal'],
        },
        {
          title: 'Urutan benar',
          lang: 'js',
          code: `
          app.use('/api', autentikasi);
          app.use('/api', catatanRouter);

          // Auth berjalan lebih dulu
          // untuk setiap rute /api.
          `,
          notes: ['Penjagaan di depan pintu'],
        },
      ),

      h2('Middleware untuk satu rute'),
      code(
        'js',
        `
        // Berlaku hanya untuk rute ini, berurutan dari kiri ke kanan
        app.post('/catatan', autentikasi, validasiCatatan, buatCatatan);

        // Beberapa sekaligus dalam array
        app.delete('/catatan/:id', [autentikasi, wajibPemilik], hapusCatatan);
        `,
      ),

      h2('Menitipkan data antar middleware'),
      code(
        'js',
        `
        async function autentikasi(req, res, next) {
          const header = req.headers.authorization;

          if (header === undefined || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error: { pesan: 'Tidak terautentikasi' } });
          }

          try {
            const payload = await verifikasiToken(header.slice(7));

            // Handler berikutnya membaca dari sini.
            req.pengguna = { id: payload.sub, peran: payload.peran };

            next();
          } catch {
            // Pesan generik — jangan beri tahu apakah tokennya kedaluwarsa,
            // salah tanda tangan, atau salah format.
            return res.status(401).json({ error: { pesan: 'Tidak terautentikasi' } });
          }
        }
        `,
      ),
      callout(
        'warning',
        'Jangan pernah membaca identitas dari body atau query',
        'Menerima `req.body.userId` sebagai identitas berarti siapa pun bisa mengaku jadi siapa pun. Identitas hanya boleh berasal dari sesuatu yang **diverifikasi server** — token yang tanda tangannya diperiksa, atau cookie sesi yang dicocokkan ke penyimpanan.',
      ),

      h2('Middleware error: empat argumen'),
      code(
        'js',
        `
        // Express mengenali middleware error dari JUMLAH ARGUMENNYA — harus empat.
        function penanganError(err, req, res, next) {
          console.error({ reqId: req.id, err });

          res.status(err.status ?? 500).json({
            error: { pesan: err.expose === true ? err.message : 'Terjadi kesalahan' },
          });
        }

        // Selalu didaftarkan TERAKHIR
        app.use(penanganError);
        `,
      ),
      callout(
        'info',
        'Kenapa jumlah argumennya penting',
        'Express memeriksa `fn.length` untuk membedakan middleware biasa dari middleware error. Menulis `(err, req, res)` dengan tiga argumen membuatnya diperlakukan sebagai middleware **biasa** — dan ia tidak akan pernah menerima error. Parameter `next` harus ditulis meski tidak dipakai.',
      ),

      h2('Middleware bawaan dan pihak ketiga'),
      table(
        ['Middleware', 'Gunanya'],
        [
          ['`express.json()`', 'Mengurai body JSON'],
          ['`express.urlencoded()`', 'Mengurai body form'],
          ['`express.static()`', 'Menyajikan berkas statis'],
          ['`helmet`', 'Memasang header keamanan'],
          ['`cors`', 'Mengatur origin yang diizinkan'],
          ['`express-rate-limit`', 'Membatasi jumlah permintaan'],
          ['`compression`', 'Kompresi gzip pada respons'],
        ],
      ),
      references(
        {
          label: 'Using middleware',
          href: 'https://expressjs.com/en/guide/using-middleware.html',
          source: 'Express',
          note: 'Jenis middleware dan bagaimana urutan pendaftaran menentukan urutan eksekusi.',
        },
        {
          label: 'Writing middleware',
          href: 'https://expressjs.com/en/guide/writing-middleware.html',
          source: 'Express',
          note: 'Bentuk `(req, res, next)` dan kewajiban memanggil `next()`.',
        },
        {
          label: 'Error handling',
          href: 'https://expressjs.com/en/guide/error-handling.html',
          source: 'Express',
          note: 'Kenapa middleware error harus punya tepat empat argumen.',
        },
        {
          label: 'Production Best Practices: Security',
          href: 'https://expressjs.com/en/advanced/best-practice-security.html',
          source: 'Express',
          note: 'Middleware keamanan yang dianjurkan resmi, termasuk `helmet` dan rate limiting.',
        },
      ),
    ],
  ),

  written(
    'body-query',
    'Membaca Body & Query',
    9,
    'Mengambil data yang dikirim klien, dengan aman.',
    [
      terms(
        {
          term: 'req.params / req.query / req.body',
          meaning:
            'Tiga sumber data dari klien. **`params`** dari path (selalu string), **`query`** dari query string, **`body`** dari isi permintaan — dan yang terakhir butuh middleware, kalau tidak ia `undefined`.',
        },
        {
          term: 'req.body undefined',
          meaning:
            'Tanpa `express.json()`, `req.body` bernilai **`undefined`**, bukan objek kosong. Merusak strukturnya langsung akan melempar error. Karena itu selalu beri nilai cadangan: `const { judul } = req.body ?? {}`.',
        },
        {
          term: 'query parameter ganda',
          meaning:
            'Klien mana pun bisa mengirim `?id=1&id=2`, dan `req.query.id` **berubah dari string menjadi array**. Kode yang menulis `req.query.id.trim()` akan meledak. Ini bukan kasus tepi teoretis — ia dipakai menyerang aplikasi yang mengasumsikan tipe.',
        },
        {
          term: 'normalisasi nilai',
          meaning:
            'Menyeragamkan bentuk sebelum dipakai — fungsi `satuNilai()` yang mengambil elemen pertama kalau ternyata array. Langkah kecil yang menutup seluruh kelas bug dari poin di atas.',
        },
        {
          term: 'konversi tipe',
          meaning:
            "Semua yang datang dari URL adalah **string**. `Number(req.query.hal)` mengubahnya jadi angka — tapi `Number('abc')` menghasilkan `NaN`, jadi selalu pasangkan dengan nilai cadangan (`|| 1`).",
        },
        {
          term: 'batas atas dari server',
          meaning:
            'Perhatikan `Math.min(100, ...)`. Tanpa batas, `?perHalaman=999999999` memaksa database mengembalikan seluruh tabel — **cara paling mudah menjatuhkan server tanpa alat apa pun**.',
        },
        {
          term: 'SyntaxError dengan body',
          meaning:
            "Bentuk error yang dilempar `express.json()` untuk JSON rusak. Memeriksanya (`err instanceof SyntaxError && 'body' in err`) yang membuat jawabannya bisa `400`, bukan `500`.",
        },
        {
          term: 'entity.too.large',
          meaning:
            'Kode error saat body melebihi `limit`. Jawabannya `413`. Menanganinya berarti klien tahu apa yang salah, alih-alih menerima `500` yang tidak menjelaskan apa pun.',
        },
        {
          term: 'kesalahan klien bukan 5xx',
          meaning:
            'JSON rusak adalah kesalahan **pengirim**, jadi jawabannya `400`. Ini bukan sekadar kerapian: `500` yang membanjir memicu alarm dan **menutupi kegagalan server yang sungguhan**.',
        },
        {
          term: 'membaca ≠ memvalidasi',
          meaning:
            'Seluruh sub-bab ini hanya membaca dan mengubah tipe. Ia **belum** memastikan isinya masuk akal — `{"jumlah": -5}` lolos semuanya. Validasi sungguhan dengan skema dibahas di sub-bab 3.13, dan itulah penjaga yang sebenarnya.',
        },
      ),

      h2('Tiga sumber'),
      code(
        'js',
        `
        app.post('/catatan/:id/komentar', (req, res) => {
          req.params;   // { id: '42' }          <- dari path, selalu string
          req.query;    // { urut: 'baru' }      <- dari query string
          req.body;     // { isi: 'Bagus!' }     <- dari body, perlu middleware
        });
        `,
      ),

      h2('Body butuh middleware'),
      code(
        'js',
        `
        app.use(express.json({ limit: '100kb' }));
        app.use(express.urlencoded({ extended: true, limit: '100kb' }));
        `,
      ),
      p(
        'Tanpa itu, `req.body` bernilai `undefined` — bukan objek kosong. Karena itu selalu beri nilai cadangan saat merusak strukturnya:',
      ),
      code(
        'js',
        `
        const { judul, isi } = req.body ?? {};
        `,
      ),

      h2('Query selalu string, dan bisa berbentuk apa saja'),
      code(
        'js',
        `
        // GET /catatan?hal=2&arsip=true&tag=a&tag=b
        req.query.hal;     // '2'        <- string, bukan angka
        req.query.arsip;   // 'true'     <- string, bukan boolean
        req.query.tag;     // ['a','b']  <- ARRAY karena dikirim dua kali
        `,
      ),
      callout(
        'danger',
        'Satu parameter bisa tiba-tiba menjadi array',
        'Klien mana pun bisa mengirim `?id=1&id=2`, dan `req.query.id` berubah dari string menjadi array. Kode yang menulis `req.query.id.trim()` akan meledak, dan kode yang mengopernya ke query database bisa berperilaku tak terduga. Ini bukan kasus tepi teoretis — ia dipakai untuk menyerang aplikasi yang mengasumsikan tipe.',
      ),
      code(
        'js',
        `
        // Normalisasi sebelum dipakai
        function satuNilai(nilai) {
          return Array.isArray(nilai) ? nilai[0] : nilai;
        }

        const halaman = Number(satuNilai(req.query.hal) ?? 1);
        `,
      ),

      h2('Konversi tipe yang benar'),
      code(
        'js',
        `
        // Batasi dari sisi server — jangan percaya angka dari klien.
        const halaman = Math.max(1, Number(satuNilai(req.query.hal)) || 1);
        const perHalaman = Math.min(100, Math.max(1, Number(satuNilai(req.query.perHalaman)) || 20));

        // Boolean: bandingkan eksplisit
        const arsip = satuNilai(req.query.arsip) === 'true';
        `,
      ),
      p(
        'Perhatikan `Math.min(100, ...)`. Tanpa batas atas, `?perHalaman=999999999` memaksa database mengembalikan seluruh tabel — cara paling mudah menjatuhkan server tanpa alat apa pun.',
      ),

      h2('Menangani body JSON yang rusak'),
      code(
        'js',
        `
        // express.json() melempar error untuk JSON rusak.
        // Tangkap di middleware error, kalau tidak jadi 500.
        app.use((err, req, res, next) => {
          if (err instanceof SyntaxError && 'body' in err) {
            return res.status(400).json({ error: { pesan: 'Body bukan JSON yang sah' } });
          }
          if (err.type === 'entity.too.large') {
            return res.status(413).json({ error: { pesan: 'Body terlalu besar' } });
          }
          next(err);
        });
        `,
      ),
      callout(
        'tip',
        'Kesalahan klien tidak boleh dijawab 5xx',
        'JSON rusak adalah kesalahan pengirim, jadi jawabannya `400` — bukan `500`. Ini penting bukan hanya demi kerapian: `500` yang membanjir memicu alarm dan menutupi kegagalan server yang sungguhan.',
      ),

      h2('Pengingat'),
      p(
        'Semua di sub-bab ini hanya **membaca dan mengubah tipe**. Ia belum memvalidasi bahwa isinya masuk akal. Validasi sungguhan dengan skema dibahas di sub-bab 3.13 — dan itulah yang menjadi penjaga sebenarnya.',
      ),
      references(
        {
          label: 'Request — req.params, req.query, req.body',
          href: 'https://expressjs.com/en/5x/api.html#req',
          source: 'Express',
          note: 'Ketiga sumber data beserta bentuk nilainya masing-masing.',
        },
        {
          label: 'express.json() — opsi limit',
          href: 'https://expressjs.com/en/api.html#express.json',
          source: 'Express',
          note: 'Perilaku saat body rusak atau melebihi batas, beserta bentuk error-nya.',
        },
        {
          label: 'URLSearchParams — nilai ganda',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/getAll',
          source: 'MDN Web Docs',
          note: 'Kenapa satu nama query bisa membawa beberapa nilai sekaligus.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Batas antara "membaca" dan "memvalidasi" — dan kenapa keduanya tidak sama.',
        },
      ),
    ],
  ),

  written(
    'struktur-folder',
    'Struktur Folder: router → controller → service → repository',
    12,
    'Menyusun project supaya tidak berubah jadi satu berkas raksasa.',
    [
      p(
        'Express tidak memaksakan struktur apa pun. Kebebasan itu enak di hari pertama dan mahal di bulan keenam — karena itu strukturnya kamu tetapkan sendiri, sejak awal.',
      ),

      terms(
        {
          term: 'struktur folder',
          meaning:
            'Express **tidak memaksakan** struktur apa pun. Kebebasan itu enak di hari pertama dan mahal di bulan keenam — karena itu strukturnya kamu tetapkan sendiri, sejak awal, bukan setelah berkasnya terlanjur raksasa.',
        },
        {
          term: 'routes/',
          meaning:
            'Lapisan paling luar: **hanya pemetaan** URL ke controller, ditambah middleware yang berlaku untuk rute itu. Kalau ada logika di sini, ia salah tempat.',
        },
        {
          term: 'controllers/',
          meaning:
            'Lapisan yang **bicara HTTP**: membaca `req`, memanggil service, menyusun `res` beserta status code-nya. Ia tidak boleh tahu nama tabel maupun bentuk SQL.',
        },
        {
          term: 'services/',
          meaning:
            'Lapisan **aturan bisnis** — bagian yang benar-benar milik aplikasimu. Aturan kerasnya: service **tidak boleh menyentuh `req`/`res` maupun SQL**. Ini baris yang paling sering dilanggar tanpa disadari.',
        },
        {
          term: 'repositories/',
          meaning:
            'Lapisan akses data — **satu-satunya** yang menyentuh SQL dan mengenal bentuk tabel. Mengubah query atau mengganti database berhenti di sini, tidak merambat ke aturan bisnis.',
        },
        {
          term: 'uji kebocoran lapisan',
          meaning:
            'Cara cepat memeriksanya: cari `res.` di dalam folder `services/`. Kalau ada, service itu sudah terikat HTTP dan **tidak lagi bisa dipakai** dari perintah CLI, job terjadwal, atau tes — tanpa memalsukan objek `res`.',
        },
        {
          term: 'error bertipe',
          meaning:
            'Perbaikan untuk kebocoran di atas: service **melempar** error seperti `KesalahanTidakBerhak`, dan controller yang menerjemahkannya menjadi status code. Dengan begitu aturan bisnis tetap bebas dari HTTP.',
        },
        {
          term: 'otorisasi berlapis',
          meaning:
            'Perhatikan contohnya: pemeriksaan kepemilikan ada di **service** (`catatan.penulisId !== penggunaId`) **dan** ikut di `WHERE` query repository. Bukan pengulangan sia-sia — lapisan kedua yang menyelamatkan kalau lapisan pertama suatu hari terlewat.',
        },
        {
          term: 'app.js vs server.js',
          meaning:
            'Pemisahan yang membuat pengujian mungkin: `app.js` merakit middleware dan router lalu mengekspor `app`; `server.js` **hanya** memanggil `listen`. Tes cukup mengimpor `app` tanpa membuka port.',
        },
        {
          term: 'kapan struktur ini berlebihan',
          meaning:
            'Untuk API tiga endpoint yang tidak akan tumbuh, empat lapisan hanya menambah berkas. Mulai dari `routes/` + `controllers/`; tarik keluar `services/` saat ada logika dipakai lebih dari satu controller, dan `repositories/` saat query mulai berulang. **Tambahkan lapisan sebagai jawaban atas masalah nyata**, bukan sebagai persiapan.',
        },
      ),

      h2('Struktur yang dipakai'),
      code(
        'text',
        `
        src/
        ├── server.js              hanya listen()
        ├── app.js                 rakit middleware & router
        ├── config/
        │   └── env.js             baca & validasi environment SEKALI
        ├── routes/
        │   └── catatan.js         petakan URL -> controller
        ├── controllers/
        │   └── catatan.js         baca req, panggil service, susun res
        ├── services/
        │   └── catatan.js         ATURAN BISNIS — tidak tahu HTTP
        ├── repositories/
        │   └── catatan.js         akses database — satu-satunya yang tahu SQL
        ├── middleware/
        │   ├── auth.js
        │   └── error.js
        └── lib/
            ├── db.js
            └── errors.js
        `,
      ),

      h2('Aliran satu permintaan'),
      code(
        'js',
        `
        // routes/catatan.js — hanya pemetaan
        import { Router } from 'express';
        import * as controller from '../controllers/catatan.js';
        import { autentikasi } from '../middleware/auth.js';

        const router = Router();
        router.get('/', autentikasi, controller.daftar);
        router.post('/', autentikasi, controller.buat);
        export default router;
        `,
      ),
      code(
        'js',
        `
        // controllers/catatan.js — bicara HTTP, tidak bicara SQL
        import * as service from '../services/catatan.js';

        export async function daftar(req, res) {
          const halaman = Math.max(1, Number(req.query.hal) || 1);

          const hasil = await service.daftarCatatan({
            penggunaId: req.pengguna.id,     // dari middleware auth, bukan dari klien
            halaman,
          });

          res.json({ data: hasil.items, meta: hasil.meta });
        }
        `,
      ),
      code(
        'js',
        `
        // services/catatan.js — aturan bisnis; TIDAK tahu req/res
        import * as repo from '../repositories/catatan.js';
        import { KesalahanTidakBerhak } from '../lib/errors.js';

        export async function daftarCatatan({ penggunaId, halaman }) {
          const perHalaman = 20;
          const items = await repo.cariMilikPengguna(penggunaId, {
            batas: perHalaman,
            lewati: (halaman - 1) * perHalaman,
          });
          const total = await repo.hitungMilikPengguna(penggunaId);

          return { items, meta: { halaman, perHalaman, total } };
        }

        export async function hapusCatatan({ id, penggunaId }) {
          const catatan = await repo.cariSatu(id);
          if (catatan === null) return false;

          // Otorisasi ada di sini — dan juga di query repository.
          if (catatan.penulisId !== penggunaId) throw new KesalahanTidakBerhak();

          await repo.hapus(id, penggunaId);
          return true;
        }
        `,
      ),
      code(
        'js',
        `
        // repositories/catatan.js — satu-satunya yang menyentuh SQL
        import { pool } from '../lib/db.js';

        export async function cariMilikPengguna(penggunaId, { batas, lewati }) {
          const { rows } = await pool.query(
            \`SELECT id, judul, dibuat_pada
             FROM catatan
             WHERE penulis_id = $1 AND dihapus_pada IS NULL
             ORDER BY dibuat_pada DESC, id DESC
             LIMIT $2 OFFSET $3\`,
            [penggunaId, batas, lewati],
          );
          return rows;
        }

        export async function hapus(id, penggunaId) {
          // penulis_id ikut di WHERE: pertahanan kedua terhadap IDOR.
          const hasil = await pool.query(
            'DELETE FROM catatan WHERE id = $1 AND penulis_id = $2',
            [id, penggunaId],
          );
          return hasil.rowCount > 0;
        }
        `,
      ),

      h2('Batas yang tidak boleh dilanggar'),
      table(
        ['Lapisan', 'Boleh', 'Tidak boleh'],
        [
          ['Controller', '`req`, `res`, status code', 'SQL, nama tabel'],
          ['Service', 'Aturan bisnis, memanggil repository', '**`req`/`res`, SQL**'],
          ['Repository', 'SQL, koneksi database', '`req`/`res`, aturan bisnis'],
        ],
      ),
      callout(
        'danger',
        'Uji sederhana untuk melihat batasnya bocor',
        'Cari `res.` di dalam folder `services/`. Kalau ada, service itu sudah terikat pada HTTP dan tidak lagi bisa dipakai dari perintah CLI, job terjadwal, atau tes — tanpa memalsukan objek `res`. Perbaikannya: service melempar error bertipe, controller yang menerjemahkannya menjadi status code.',
      ),

      h2('Kapan struktur ini berlebihan'),
      p(
        'Untuk API dengan tiga endpoint yang tidak akan tumbuh, empat lapisan hanya menambah berkas. Mulailah dari `routes/` + `controllers/`, lalu tarik keluar `services/` saat ada logika yang dipakai lebih dari satu controller, dan `repositories/` saat query mulai berulang. **Tambahkan lapisan sebagai jawaban atas masalah nyata**, bukan sebagai persiapan.',
      ),
      references(
        {
          label: 'express.Router()',
          href: 'https://expressjs.com/en/5x/api.html#router',
          source: 'Express',
          note: 'Unit yang memungkinkan lapisan `routes/` berdiri di berkasnya sendiri.',
        },
        {
          label: 'Modules: ECMAScript modules',
          href: 'https://nodejs.org/api/esm.html',
          source: 'Node.js',
          note: 'Sistem impor yang menjadi batas fisik antar lapisan.',
        },
        {
          label: 'Parameterized queries — node-postgres',
          href: 'https://www.postgresql.org/docs/17/sql-prepare.html',
          source: 'PostgreSQL',
          note: 'Bentuk `$1, $2` yang dipakai lapisan repository pada contoh.',
        },
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan pemeriksaan kepemilikan diletakkan di service **dan** di query.',
        },
      ),
    ],
  ),

  written(
    'respons-status',
    'Respons & Status Code yang Benar',
    10,
    'Menjawab dengan kode dan bentuk yang bisa diandalkan klien.',
    [
      terms(
        {
          term: '201 Created',
          meaning:
            'Jawaban yang benar untuk `POST` yang berhasil membuat sesuatu — bukan `200`. Ia dipasangkan dengan header **`Location`** berisi alamat sumber daya baru, supaya klien tahu ke mana harus pergi tanpa menebak bentuk URL.',
        },
        {
          term: '204 No Content',
          meaning:
            'Jawaban untuk `DELETE` yang berhasil. Aturannya keras: **`204` tidak boleh punya body sama sekali**. Karena itu ditulis `res.status(204).end()`, bukan `.json()`.',
        },
        {
          term: 'daftar kosong tetap 200',
          meaning:
            'Kesalahan yang sering. `404` berarti **endpoint atau sumber dayanya** tidak ada. "Tidak ada catatan yang cocok dengan filtermu" adalah hasil pencarian yang **sah** — jawab `200` dengan array kosong. Klien yang menerima `404` akan menampilkan halaman error, padahal seharusnya keadaan kosong.',
        },
        {
          term: '409 Conflict',
          meaning:
            'Permintaannya sah, tapi bentrok dengan keadaan sekarang — email yang sudah dipakai, versi data yang sudah berubah. Berbeda dari `422`: bentuk dan isinya benar, keadaannya yang tidak memungkinkan.',
        },
        {
          term: '429 Too Many Requests',
          meaning:
            'Jawaban saat rate limit terlampaui. Sebaiknya disertai header `Retry-After` supaya klien tahu kapan boleh mencoba lagi, alih-alih menembak terus-menerus.',
        },
        {
          term: '502 / 504',
          meaning:
            'Dua kegagalan yang **bukan** salah kodemu langsung. `502 Bad Gateway` — dependensi hulu menjawab tidak keruan; `504 Gateway Timeout` — ia tidak menjawab tepat waktu. Membedakannya dari `500` mempercepat penelusuran saat ada masalah.',
        },
        {
          term: 'kode error stabil',
          meaning:
            'String seperti `VALIDASI_GAGAL` di badan error. Ia lebih berguna bagi klien daripada pesannya: **pesan boleh berubah dan diterjemahkan, kode tidak**. Klien mencocokkan kode, bukan teks.',
        },
        {
          term: 'bentuk respons seragam',
          meaning:
            'Satu bentuk untuk seluruh API — `{ data, meta }` untuk sukses, `{ error: { kode, pesan, field } }` untuk gagal. Nilainya bagi klien: satu penangan error untuk semua endpoint, bukan satu per endpoint.',
        },
        {
          term: 'kebocoran lewat SELECT *',
          meaning:
            'Cara paling umum data sensitif bocor ke API. Kolom baru bulan depan — `password_hash`, `token_reset`, `catatan_internal` — **otomatis ikut terkirim** ke setiap klien, tanpa ada yang mengubah kode endpoint-nya. Sebutkan kolomnya, atau bentuk ulang objeknya sebelum dikirim.',
        },
        {
          term: 'Cache-Control: no-store',
          meaning:
            'Header yang melarang jawaban disimpan di cache mana pun — browser, proxy, CDN. Wajib untuk data privat: tanpa itu, halaman milik satu pengguna bisa tersimpan dan tersaji ke orang lain lewat cache bersama.',
        },
      ),

      h2('Status code per operasi'),
      table(
        ['Operasi', 'Berhasil', 'Catatan'],
        [
          ['`GET` daftar', '`200`', 'Array kosong tetap `200`, bukan `404`'],
          ['`GET` satu item', '`200` / `404`', ''],
          ['`POST` buat', '**`201`**', 'Sertakan header `Location`'],
          ['`PUT`/`PATCH`', '`200`', 'Kembalikan objek setelah diubah'],
          ['`DELETE`', '`204`', 'Tanpa body'],
          ['Aksi asinkron', '`202`', 'Sertakan cara memantau statusnya'],
        ],
      ),
      code(
        'js',
        `
        // Buat
        res.status(201).location(\`/api/catatan/\${baru.id}\`).json({ data: baru });

        // Hapus — 204 TIDAK BOLEH punya body
        res.status(204).end();

        // Daftar kosong tetap sukses
        res.json({ data: [], meta: { total: 0 } });
        `,
      ),
      callout(
        'warning',
        'Daftar kosong bukan `404`',
        '`404` berarti *endpoint atau sumber dayanya* tidak ada. "Tidak ada catatan yang cocok dengan filtermu" adalah hasil pencarian yang sah — jawab `200` dengan array kosong. Klien yang menerima `404` untuk daftar akan menampilkan halaman error, padahal seharusnya keadaan kosong.',
      ),

      h2('Status code untuk kegagalan'),
      table(
        ['Situasi', 'Kode'],
        [
          ['Body atau parameter cacat bentuknya', '`400`'],
          ['Belum login / token tidak sah', '`401`'],
          ['Sudah login tapi tidak berhak', '`403`'],
          ['Tidak ada (atau tidak berhak tahu)', '`404`'],
          ['Bentrok — email sudah dipakai', '`409`'],
          ['Body terlalu besar', '`413`'],
          ['Bentuk benar, isi tidak lolos validasi', '`422`'],
          ['Terlalu banyak permintaan', '`429`'],
          ['Bug di server', '`500`'],
          ['Dependensi hulu gagal / timeout', '`502` / `504`'],
        ],
      ),

      h2('Satu bentuk respons untuk seluruh API'),
      code(
        'js',
        `
        // Sukses — satu item
        { "data": { "id": 42, "judul": "Catatan" } }

        // Sukses — daftar
        {
          "data": [ ... ],
          "meta": { "halaman": 1, "perHalaman": 20, "total": 137 }
        }

        // Gagal — SELALU bentuk yang sama
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": { "judul": "wajib diisi", "isi": "maksimal 10000 karakter" }
          }
        }
        `,
      ),
      p(
        'Kode error yang stabil (`VALIDASI_GAGAL`) lebih berguna bagi klien daripada pesannya — pesan boleh berubah dan diterjemahkan, kode tidak.',
      ),

      h2('Yang tidak boleh ada di respons'),
      code(
        'js',
        `
        // BOCOR
        res.status(500).json({
          pesan: err.message,             // bisa memuat nama tabel, jalur berkas
          stack: err.stack,               // struktur internal aplikasi
        });

        const pengguna = await db.query('SELECT * FROM pengguna WHERE id = $1', [id]);
        res.json({ data: pengguna.rows[0] });   // password_hash ikut terkirim

        // AMAN
        res.status(500).json({
          error: { kode: 'KESALAHAN_SERVER', pesan: 'Terjadi kesalahan', id: req.id },
        });

        const { rows } = await db.query(
          'SELECT id, nama, email FROM pengguna WHERE id = $1', [id],
        );
        res.json({ data: rows[0] });
        `,
      ),
      callout(
        'danger',
        '`SELECT *` adalah cara paling umum data sensitif bocor ke API',
        'Kolom baru yang ditambahkan bulan depan — `password_hash`, `token_reset`, `catatan_internal` — otomatis ikut terkirim ke setiap klien, tanpa ada yang mengubah kode endpoint-nya. Sebutkan kolomnya, atau bentuk ulang objeknya sebelum dikirim.',
      ),

      h2('Header yang perlu diperhatikan'),
      code(
        'js',
        `
        res.set('Cache-Control', 'no-store');   // untuk data privat
        res.set('X-Request-Id', req.id);        // supaya pengguna bisa melaporkan id-nya
        `,
      ),
      references(
        {
          label: 'HTTP response status codes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
          source: 'MDN Web Docs',
          note: 'Arti setiap kode di tabel di atas, langsung dari rujukannya.',
        },
        {
          label: 'Response — res.status, res.json, res.location',
          href: 'https://expressjs.com/en/5x/api.html#res',
          source: 'Express',
          note: 'API yang dipakai menyusun jawaban beserta header dan status-nya.',
        },
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'IETF',
          note: 'Bentuk baku badan error, alternatif dari format buatan sendiri.',
        },
        {
          label: 'Cache-Control',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control',
          source: 'MDN Web Docs',
          note: 'Kenapa data privat wajib `no-store`, bukan sekadar `no-cache`.',
        },
      ),
    ],
  ),

  written(
    'error-terpusat',
    'Error Handling Terpusat',
    12,
    'Satu tempat yang menerjemahkan setiap kegagalan menjadi respons.',
    [
      p(
        'Tanpa penanganan terpusat, setiap handler menulis `try/catch` sendiri, formatnya berbeda-beda, dan selalu ada satu yang lupa. Satu middleware error menggantikan semuanya.',
      ),

      terms(
        {
          term: 'error terpusat',
          meaning:
            'Satu middleware yang menerjemahkan **setiap** kegagalan menjadi respons. Tanpanya, setiap handler menulis `try/catch` sendiri, formatnya berbeda-beda, dan selalu ada satu yang lupa.',
        },
        {
          term: 'kelas error milik aplikasi',
          meaning:
            'Turunan `Error` yang membawa informasi tambahan — status, kode, dan boleh-tidaknya ditampilkan. Ia yang membuat service bisa **melempar makna** (`KesalahanTidakDitemukan`) tanpa tahu apa pun soal HTTP.',
        },
        {
          term: 'bendera tampilkan',
          meaning:
            'Penanda apakah pesan error boleh dikirim ke klien apa adanya. Ia memisahkan kegagalan yang **memang bagian dari kontrak** (validasi, tidak ditemukan) dari **bug**, yang pesannya bisa memuat nama tabel atau jalur berkas.',
        },
        {
          term: '404 alih-alih 403',
          meaning:
            'Pilihan sadar pada contoh: catatan milik orang lain dijawab `404`, bukan `403`. Menjawab `403` sudah **mengungkap bahwa catatan itu ada** — cukup bagi penyerang untuk memetakan data yang bukan haknya dari beda pesan error saja.',
        },
        {
          term: 'res.headersSent',
          meaning:
            'Bernilai `true` kalau jawaban **sudah mulai dikirim**. Menulis status lagi setelah itu akan melempar error baru di dalam penangan error. Karena itu penangan menyerahkannya ke Express dengan `next(err)`.',
        },
        {
          term: '4xx dicatat ringkas, 5xx dicatat lengkap',
          meaning:
            'Pembagian yang menjaga log tetap berguna. `4xx` adalah kesalahan **klien** — cukup satu baris ringkas. `5xx` adalah **bug kita** — catat lengkap dengan stack dan konteksnya, karena itu yang akan kamu telusuri.',
        },
        {
          term: 'id permintaan di respons error',
          meaning:
            'Menyertakan `id: req.id` di badan error. Saat pengguna melapor "tadi error", satu id membuatmu menemukan **persis** permintaan itu di log — tanpa menebak dari perkiraan waktu. Murah dipasang, sangat menolong saat dibutuhkan.',
        },
        {
          term: 'uncaughtException',
          meaning:
            'Event untuk error yang **tidak tertangkap di mana pun**. Setelah itu proses berada dalam keadaan tidak menentu — jadi yang benar adalah mencatatnya lalu **keluar**, membiarkan manajer proses menyalakan ulang. Melanjutkan hidup justru berbahaya.',
        },
        {
          term: 'unhandledRejection',
          meaning:
            'Padanan `uncaughtException` untuk Promise yang ditolak tanpa `.catch()`. Sejak Node 15 ia **menjatuhkan proses secara default** — perilaku yang benar, tapi tetap perlu ditangani agar penyebabnya tercatat sebelum proses mati.',
        },
        {
          term: 'manajer proses',
          meaning:
            'Program yang menjalankan aplikasimu dan menyalakannya ulang saat mati — systemd, Docker restart policy, atau PM2. Keberadaannya yang membuat `process.exit(1)` menjadi jawaban yang benar, bukan menyerah.',
        },
      ),

      h2('Kelas error milik aplikasi'),
      code(
        'js',
        `
        // lib/errors.js
        export class KesalahanAplikasi extends Error {
          constructor(pesan, { status = 500, kode = 'KESALAHAN_SERVER', tampilkan = false } = {}) {
            super(pesan);
            this.name = this.constructor.name;
            this.status = status;
            this.kode = kode;
            // tampilkan = boleh dikirim ke klien apa adanya
            this.tampilkan = tampilkan;
          }
        }

        export class KesalahanValidasi extends KesalahanAplikasi {
          constructor(field) {
            super('Data yang dikirim tidak valid', {
              status: 422, kode: 'VALIDASI_GAGAL', tampilkan: true,
            });
            this.field = field;
          }
        }

        export class KesalahanTidakDitemukan extends KesalahanAplikasi {
          constructor(apa = 'Sumber daya') {
            super(\`\${apa} tidak ditemukan\`, {
              status: 404, kode: 'TIDAK_DITEMUKAN', tampilkan: true,
            });
          }
        }

        export class KesalahanTidakBerhak extends KesalahanAplikasi {
          constructor() {
            super('Tidak berwenang', { status: 403, kode: 'TIDAK_BERWENANG', tampilkan: true });
          }
        }
        `,
      ),
      p(
        'Bendera `tampilkan` itulah yang memisahkan kegagalan yang **memang bagian dari kontrak** (validasi, tidak ditemukan) dari **bug** yang pesannya tidak boleh keluar.',
      ),

      h2('Melempar dari service'),
      code(
        'js',
        `
        export async function ambilCatatan({ id, penggunaId }) {
          const catatan = await repo.cariSatu(id);

          if (catatan === null) throw new KesalahanTidakDitemukan('Catatan');
          if (catatan.penulisId !== penggunaId) {
            // 404, bukan 403: jangan bocorkan bahwa catatan ini ada.
            throw new KesalahanTidakDitemukan('Catatan');
          }

          return catatan;
        }
        `,
      ),

      h2('Middleware error'),
      code(
        'js',
        `
        // middleware/error.js
        import { KesalahanAplikasi } from '../lib/errors.js';
        import { log } from '../lib/log.js';

        export function penanganError(err, req, res, next) {
          // Kalau respons sudah mulai dikirim, serahkan ke Express.
          if (res.headersSent) return next(err);

          const status = err.status ?? 500;

          // 5xx adalah bug kita -> catat lengkap.
          // 4xx adalah kesalahan klien -> cukup catat ringkas.
          if (status >= 500) {
            log.error({ reqId: req.id, err, url: req.originalUrl }, 'kesalahan server');
          } else {
            log.warn({ reqId: req.id, status, kode: err.kode }, 'permintaan ditolak');
          }

          const bolehTampil = err instanceof KesalahanAplikasi && err.tampilkan === true;

          res.status(status).json({
            error: {
              kode: err.kode ?? 'KESALAHAN_SERVER',
              pesan: bolehTampil ? err.message : 'Terjadi kesalahan pada server',
              ...(err.field !== undefined && { field: err.field }),
              id: req.id,
            },
          });
        }
        `,
      ),
      callout(
        'tip',
        'Sertakan id permintaan di respons error',
        'Saat pengguna melapor "tadi error", satu id membuatmu menemukan **persis** permintaan itu di log — tanpa menebak dari perkiraan waktu. Ini murah dipasang dan sangat menolong saat dibutuhkan.',
      ),

      h2('Express 5 dan handler `async`'),
      code(
        'js',
        `
        // Express 5: error dari handler async diteruskan OTOMATIS
        app.get('/catatan/:id', async (req, res) => {
          const catatan = await service.ambilCatatan({ ... });   // kalau melempar,
          res.json({ data: catatan });                            // penanganError yang menerima
        });
        `,
      ),
      callout(
        'warning',
        'Di Express 4 ini tidak bekerja',
        'Express 4 tidak menangkap Promise yang ditolak. Errornya hilang, permintaannya menggantung sampai timeout, dan tidak ada apa pun di log. Setiap handler async harus dibungkus manual. Kalau kamu terpaksa memakai Express 4, `express-async-errors` menutupnya — tapi memakai Express 5 lebih baik.',
      ),

      h2('Kegagalan di luar siklus permintaan'),
      code(
        'js',
        `
        // Error yang tidak tertangkap di mana pun
        process.on('uncaughtException', (err) => {
          log.fatal({ err }, 'uncaught exception');
          // Proses sudah dalam keadaan tidak menentu -> keluar, biarkan
          // manajer proses menyalakan ulang.
          process.exit(1);
        });

        process.on('unhandledRejection', (alasan) => {
          log.fatal({ alasan }, 'unhandled rejection');
          process.exit(1);
        });
        `,
      ),
      p(
        'Melanjutkan proses setelah `uncaughtException` berbahaya: state di dalamnya bisa sudah rusak, dan kerusakannya menyebar diam-diam. Lebih aman keluar dan menyala ulang bersih.',
      ),
      references(
        {
          label: 'Express — Error handling',
          href: 'https://expressjs.com/en/guide/error-handling.html',
          source: 'Express',
          note: 'Middleware error, perilaku `next(err)`, dan penanganan handler `async` di Express 5.',
        },
        {
          label: 'Error — kelas bawaan JavaScript',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
          source: 'MDN Web Docs',
          note: 'Dasar pembuatan kelas error milik aplikasi lewat `extends Error`.',
        },
        {
          label: 'process — uncaughtException & unhandledRejection',
          href: 'https://nodejs.org/api/process.html#event-uncaughtexception',
          source: 'Node.js',
          note: 'Termasuk peringatan resmi bahwa melanjutkan proses setelahnya tidak aman.',
        },
        {
          label: 'Error Handling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Batas antara pesan yang boleh sampai ke klien dan yang harus tinggal di log.',
        },
      ),
    ],
  ),

  written(
    'config-validasi',
    'Environment Variable & Konfigurasi yang Divalidasi',
    10,
    'Membaca konfigurasi sekali, memvalidasinya, dan gagal keras kalau salah.',
    [
      p(
        'Sub-bab 1.7 menjelaskan **kenapa** konfigurasi harus terpisah dari kode. Yang ini tentang **bagaimana** mewujudkannya di Node dengan benar.',
      ),

      terms(
        {
          term: '--env-file',
          meaning:
            'Flag bawaan Node sejak versi 20.6 yang memuat berkas `.env` **tanpa paket tambahan**. Paket `dotenv` yang masih sering kamu temui di tutorial lama sudah tidak diperlukan untuk kasus dasar ini.',
        },
        {
          term: 'produksi tanpa .env',
          meaning:
            'Di produksi, variabel **disuntikkan platform** — systemd, Docker, atau penyedia hosting. Karena itu skrip `start` sengaja tidak memakai `--env-file`. Berkas `.env` adalah kemudahan untuk pengembangan lokal, bukan mekanisme deploy.',
        },
        {
          term: 'safeParse',
          meaning:
            'Bentuk validasi Zod yang mengembalikan `{ success, data }` alih-alih melempar. Dipakai di sini supaya kamu bisa **mencetak setiap masalah** dengan nama variabelnya, bukan sekadar melempar satu error yang tidak menjelaskan apa-apa.',
        },
        {
          term: 'z.coerce',
          meaning:
            'Mengubah tipe **sebelum** memvalidasi. Wajib untuk environment variable karena semuanya **string**: `PORT=3000` bernilai `"3000"`. Tanpa coerce, validasi angka selalu gagal.',
        },
        {
          term: 'z.enum',
          meaning:
            "Membatasi nilai ke daftar tertentu — `['development', 'test', 'production']`. Salah ketik `prod` alih-alih `production` tertangkap **saat boot**, bukan lewat perilaku aneh yang baru disadari berjam-jam kemudian.",
        },
        {
          term: 'panjang minimum rahasia',
          meaning:
            '`JWT_SECRET: z.string().min(32)` bukan hiasan. Rahasia pendek bisa ditebak dengan pencarian menyeluruh — dan token yang ditandatangani dengannya bisa dipalsukan siapa pun yang berhasil menebaknya.',
        },
        {
          term: 'default aman',
          meaning:
            "Perhatikan `CORS_ORIGINS: z.string().default('')`. Kalau variabelnya lupa dipasang, hasilnya **tidak ada origin yang diizinkan** — bukan semuanya. Ketiadaan nilai harus selalu berarti pilihan paling ketat.",
        },
        {
          term: 'Object.freeze',
          meaning:
            'Membuat objek tidak bisa diubah setelah dibuat. Dipakai pada `env` supaya tidak ada bagian kode yang diam-diam menimpa konfigurasi saat aplikasi sudah berjalan.',
        },
        {
          term: 'gagal saat boot',
          meaning:
            'Aplikasi **menolak menyala** kalau konfigurasinya cacat, dengan pesan yang menyebut nama variabelnya. Bandingkan dengan yang menyala lalu menandatangani token memakai secret `undefined`: penyebabnya berjarak belasan menit dari gejalanya.',
        },
        {
          term: 'satu pintu konfigurasi',
          meaning:
            'Mengimpor `env` dari satu modul alih-alih menyebar `process.env` di mana-mana. Efeknya nyata: salah ketik nama variabel jadi **error lint atau TypeScript**, bukan `undefined` yang diam.',
        },
      ),

      h2('Memuat `.env`'),
      code(
        'bash',
        `
        # Node 20.6+ punya dukungan bawaan — tidak perlu paket dotenv
        node --env-file=.env src/server.js
        `,
      ),
      code(
        'json',
        `
        {
          "scripts": {
            "dev": "node --watch --env-file=.env src/server.js",
            "start": "node src/server.js"
          }
        }
        `,
      ),
      callout(
        'info',
        'Produksi tidak memakai berkas `.env`',
        'Di produksi, variabel disuntikkan oleh platform (systemd, Docker, penyedia hosting). Karena itu skrip `start` di atas sengaja tidak memakai `--env-file`. Berkas `.env` adalah kemudahan untuk pengembangan lokal, bukan mekanisme deploy.',
      ),

      h2('Validasi terpusat'),
      code(
        'js',
        `
        // config/env.js
        import { z } from 'zod';

        const Skema = z.object({
          NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
          PORT: z.coerce.number().int().positive().default(3000),

          DATABASE_URL: z.string().url(),

          // Panjang minimum bukan hiasan: rahasia pendek bisa ditebak.
          JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),

          // Default AMAN: kalau tidak diisi, tidak ada origin yang diizinkan.
          CORS_ORIGINS: z.string().default(''),

          LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
        });

        const hasil = Skema.safeParse(process.env);

        if (!hasil.success) {
          // Gagal SAAT BOOT dengan pesan yang menyebut variabelnya.
          console.error('Konfigurasi tidak valid:');
          for (const masalah of hasil.error.issues) {
            console.error(\`  \${masalah.path.join('.')}: \${masalah.message}\`);
          }
          process.exit(1);
        }

        export const env = Object.freeze({
          ...hasil.data,
          corsOrigins: hasil.data.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
          isProduksi: hasil.data.NODE_ENV === 'production',
        });
        `,
      ),

      h2('Memakainya'),
      code(
        'js',
        `
        import { env } from './config/env.js';

        app.listen(env.PORT);

        // Bukan process.env.PORT yang tersebar di mana-mana.
        // Salah ketik nama variabel sekarang jadi error TypeScript/lint,
        // bukan undefined yang diam.
        `,
      ),

      h2('Kenapa gagal saat boot itu penting'),
      compare(
        {
          title: 'Tanpa validasi',
          lang: 'text',
          code: `
          08:00 deploy berhasil
          08:00 server menyala
          08:14 pengguna pertama login
          08:14 token ditandatangani dengan
                secret 'undefined'
          08:14 semua token jadi tidak sah

          Penyebabnya 14 menit di belakang.
          `,
          notes: ['Gejala jauh dari sebabnya'],
        },
        {
          title: 'Dengan validasi',
          lang: 'text',
          code: `
          08:00 deploy
          08:00 Konfigurasi tidak valid:
                  JWT_SECRET: minimal 32 karakter
          08:00 proses keluar dengan kode 1
          08:00 deploy DIBATALKAN

          Penyebabnya ada di baris errornya.
          `,
          notes: ['Rusak sebelum ada pengguna yang terkena'],
        },
      ),

      h2('Default harus ketat, bukan longgar'),
      code(
        'js',
        `
        // SALAH: lupa memasang variabel -> semua origin diizinkan
        const bolehSemua = process.env.CORS_STRICT !== 'true';

        // BENAR: ketiadaan nilai berarti pilihan paling aman
        const bolehSemua = process.env.CORS_ALLOW_ALL === 'true';
        `,
      ),
      callout(
        'danger',
        'Checklist rahasia',
        '`.env` masuk `.gitignore`; hanya `.env.example` yang di-commit, dengan nilai **kosong**; tidak ada rahasia yang di-`console.log`; dan rahasia yang **pernah** ter-commit dianggap bocor — rotasi, jangan sekadar menghapus riwayatnya.',
      ),
      references(
        {
          label: 'node --env-file',
          href: 'https://nodejs.org/api/cli.html#--env-fileconfig',
          source: 'Node.js',
          note: 'Dukungan bawaan `.env` sejak Node 20.6, pengganti paket `dotenv`.',
        },
        {
          label: 'Zod — coerce & safeParse',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Bentuk validasi yang dipakai `config/env.js` di atas.',
        },
        {
          label: 'The Twelve-Factor App — Config',
          href: 'https://12factor.net/config',
          source: '12factor.net',
          note: 'Prinsip di balik seluruh sub-bab ini: konfigurasi hidup di environment.',
        },
        {
          label: 'Secrets Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist rahasia di atas, beserta alasan rotasi tidak bisa digantikan penghapusan riwayat.',
        },
      ),
    ],
  ),

  written(
    'logging',
    'Logging dengan `pino`',
    10,
    'Mencatat yang berguna, tanpa mencatat yang berbahaya.',
    [
      p(
        '`console.log` cukup untuk belajar dan tidak cukup untuk apa pun setelah itu. Log produksi harus bisa **disaring, dicari, dan dikaitkan** — dan itu berarti terstruktur, bukan kalimat bebas.',
      ),

      terms(
        {
          term: 'pino',
          meaning:
            'Library logging Node yang menulis **JSON** dan dirancang untuk cepat. Namanya dari bahasa Italia untuk "pohon pinus". Dipilih di sini karena keluarannya bisa langsung diolah alat, bukan hanya dibaca manusia.',
        },
        {
          term: 'log terstruktur',
          meaning:
            'Log berupa objek dengan field bernama, bukan kalimat. Bedanya praktis: `console.log(\'Pengguna 42 membuat catatan\')` tidak bisa disaring per pengguna maupun per level; `{"userId":42,"msg":"catatan dibuat"}` bisa.',
        },
        {
          term: 'level',
          meaning:
            'Tingkat kepentingan sebuah baris log: `debug`, `info`, `warn`, `error`, `fatal`. Di pino ia disimpan sebagai angka (`30` = info, `50` = error), sehingga penyaringan "tampilkan yang ≥ error" jadi perbandingan angka biasa.',
        },
        {
          term: 'redact',
          meaning:
            'Fitur pino yang **mengganti** nilai pada jalur tertentu sebelum ditulis — `req.headers.authorization` menjadi `[DISENSOR]`. Ia jaring pengaman, **bukan izin untuk ceroboh**: field bernama lain (`pass`, `secret`, `apiKey`) tetap lolos.',
        },
        {
          term: 'jangan catat seluruh body',
          meaning:
            'Aturan yang tetap berlaku meski `redact` terpasang. "Log seluruh request body supaya gampang debug" adalah cara paling umum kredensial berakhir di sistem pencatatan yang diakses banyak orang dan disimpan bertahun-tahun. Catat field yang kamu pilih sadar.',
        },
        {
          term: 'pino-pretty',
          meaning:
            'Alat pendamping yang mengubah JSON menjadi keluaran berwarna yang enak dibaca — **hanya untuk pengembangan**. Di produksi ia dimatikan, karena di sana log dibaca alat pengumpul, bukan mata.',
        },
        {
          term: 'transport',
          meaning:
            'Opsi pino yang menentukan ke mana log diteruskan dan bagaimana ia diformat. Menyalakannya hanya saat bukan produksi adalah cara memisahkan kenyamanan pengembangan dari performa produksi.',
        },
        {
          term: 'id korelasi',
          meaning:
            'Satu id per permintaan yang muncul di **semua** baris log yang berasal darinya. Perhatikan contohnya: ia **memakai ulang** `x-request-id` dari header kalau ada — supaya jejaknya nyambung melintasi beberapa layanan sekaligus.',
        },
        {
          term: 'child logger',
          meaning:
            'Logger turunan yang membawa field tetap — misalnya `reqId`. Setiap baris yang ditulis darinya otomatis menyertakan field itu, sehingga kamu tidak perlu mengulangnya di setiap pemanggilan.',
        },
        {
          term: 'log ke stdout',
          meaning:
            'Menulis ke keluaran standar, bukan mengelola berkas log sendiri. Rotasi, pengumpulan, dan pengiriman adalah urusan lingkungan — aplikasi yang mengurusnya sendiri akan bentrok dengan alat yang sudah ada di sana.',
        },
      ),

      h2('Terstruktur vs teks bebas'),
      compare(
        {
          title: '`console.log`',
          lang: 'text',
          code: `
          Pengguna 42 membuat catatan 7
          Gagal menyimpan: timeout

          Tidak bisa disaring per pengguna.
          Tidak bisa dicari per level.
          Tidak bisa dikaitkan antar baris.
          `,
          notes: ['Hanya berguna kalau dibaca manusia satu per satu'],
        },
        {
          title: '`pino`',
          lang: 'json',
          code: `
          {"level":30,"time":1754...,
           "reqId":"a1b2","userId":42,
           "catatanId":7,"msg":"catatan dibuat"}

          Bisa disaring:
            level >= 50
            userId = 42
            reqId = "a1b2"
          `,
          notes: ['Bisa diolah alat, tetap terbaca saat dibutuhkan'],
        },
      ),

      h2('Menyiapkannya'),
      code(
        'bash',
        `
        npm install pino
        npm install --save-dev pino-pretty
        `,
      ),
      code(
        'js',
        `
        // lib/log.js
        import pino from 'pino';
        import { env } from '../config/env.js';

        export const log = pino({
          level: env.LOG_LEVEL,

          // Sensor: pino MENGGANTI nilainya sebelum ditulis.
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'password',
              '*.password',
              '*.kataSandi',
              'token',
              '*.token',
            ],
            censor: '[DISENSOR]',
          },

          // Format berwarna hanya saat pengembangan.
          transport: env.isProduksi
            ? undefined
            : { target: 'pino-pretty', options: { colorize: true } },
        });
        `,
      ),
      callout(
        'danger',
        '`redact` adalah jaring pengaman, bukan izin untuk ceroboh',
        'Ia hanya menyensor jalur yang kamu sebutkan. Field bernama lain — `pass`, `secret`, `apiKey`, `kartu` — tetap lolos. Tetap berlaku aturan utamanya: **jangan pernah mencatat seluruh request body**. Catat field yang kamu pilih sadar.',
      ),

      h2('Log per permintaan dengan id korelasi'),
      code(
        'js',
        `
        import crypto from 'node:crypto';
        import { log } from '../lib/log.js';

        export function pencatatPermintaan(req, res, next) {
          req.id = req.headers['x-request-id'] ?? crypto.randomUUID();
          res.setHeader('X-Request-Id', req.id);

          // Logger anak: reqId otomatis ikut di SETIAP baris berikutnya.
          req.log = log.child({ reqId: req.id });

          const mulai = process.hrtime.bigint();

          res.on('finish', () => {
            const ms = Number(process.hrtime.bigint() - mulai) / 1e6;

            req.log[res.statusCode >= 500 ? 'error' : 'info'](
              {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                durasiMs: Math.round(ms),
                userId: req.pengguna?.id,
              },
              'permintaan selesai',
            );
          });

          next();
        }
        `,
      ),

      h2('Level dan kapan memakainya'),
      table(
        ['Level', 'Untuk'],
        [
          ['`fatal`', 'Aplikasi harus berhenti'],
          ['`error`', 'Operasi gagal dan butuh perhatian — 5xx, kegagalan tak terduga'],
          ['`warn`', 'Aneh tapi tertangani — 4xx, retry, batas hampir tercapai'],
          ['`info`', 'Peristiwa normal — permintaan selesai, server menyala'],
          ['`debug`', 'Detail untuk pengembangan — tidak dinyalakan di produksi'],
        ],
      ),

      h2('Tulis ke stdout'),
      code(
        'bash',
        `
        # Jangan mengelola berkas log dan rotasinya sendiri.
        node src/server.js | pino-pretty          # pengembangan
        node src/server.js                        # produksi: platform yang mengumpulkan
        `,
      ),
      p(
        'Ini prinsip 12-Factor dari sub-bab 1.7. Aplikasi menulis ke stdout; lingkungan yang mengumpulkan, merotasi, dan mengirimnya ke tempat penyimpanan terpusat. Log yang hanya ada di disk satu instance akan hilang bersama instance itu.',
      ),
      callout(
        'warning',
        'Log adalah tempat kebocoran data yang sering terlupa',
        'Log biasanya diakses lebih banyak orang daripada database, disimpan bertahun-tahun, dan sering dikirim ke layanan pihak ketiga. Email, nomor telepon, dan alamat yang masuk ke sana menyebar jauh lebih luas daripada yang kamu kira.',
      ),
      references(
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Apa yang wajib dicatat, dan daftar tegas apa yang tidak boleh masuk log.',
        },
        {
          label: 'Twelve-Factor App — Logs',
          href: 'https://12factor.net/logs',
          source: '12factor.net',
          note: 'Prinsip "aplikasi menulis ke stdout, lingkungan yang mengumpulkan".',
        },
        {
          label: 'process.hrtime.bigint()',
          href: 'https://nodejs.org/api/process.html#processhrtimebigint',
          source: 'Node.js',
          note: 'Pengukur durasi beresolusi tinggi yang dipakai contoh pencatat permintaan.',
        },
        {
          label: 'crypto.randomUUID()',
          href: 'https://nodejs.org/api/crypto.html#cryptorandomuuidoptions',
          source: 'Node.js',
          note: 'Menghasilkan id korelasi saat header `x-request-id` belum ada.',
        },
      ),
    ],
  ),

  written(
    'validasi-zod',
    'Validasi Input dengan Zod',
    12,
    'Penjaga sebenarnya antara klien dan logikamu.',
    [
      p(
        'Semua sub-bab sebelumnya hanya **membaca** input. Sub-bab ini tentang **menolaknya** kalau tidak sesuai. Ini kontrol keamanan paling hulu — yang membuat sebagian besar kontrol lain benar-benar bekerja.',
      ),

      terms(
        {
          term: 'validasi',
          meaning:
            'Menolak input yang tidak sesuai bentuk yang kamu tetapkan. Ini **kontrol keamanan paling hulu** — yang membuat sebagian besar kontrol lain benar-benar bekerja. Semua sub-bab sebelumnya hanya membaca input; yang ini menolaknya.',
        },
        {
          term: 'skema (schema)',
          meaning:
            'Deskripsi bentuk data yang sah — tipe tiap field, batas panjang, mana yang wajib. Ia ditulis **sekali** lalu dipakai memvalidasi setiap permintaan, alih-alih pemeriksaan `if` yang tersebar dan tidak lengkap.',
        },
        {
          term: 'Zod',
          meaning:
            'Library skema untuk TypeScript/JavaScript. Kelebihannya: satu definisi menghasilkan **validator sekaligus tipenya**, jadi bentuk yang divalidasi dan bentuk yang dikenal TypeScript tidak mungkin berbeda.',
        },
        {
          term: '.strict()',
          meaning:
            'Membuat skema **menolak field yang tidak dikenal**. Tanpa itu, Zod diam-diam membuangnya — aman, tapi tidak memberi tahu apa pun. Dengan `.strict()`, permintaan yang menyertakan `{"peran":"admin"}` ditolak, dan kamu jadi tahu ada yang mencoba.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Menyerahkan seluruh kolom kepada pengirim lewat `db.insert({ ...req.body })`. Ini jauh lebih berbahaya daripada field asing yang lolos: klien bisa mengirim `{"peran":"admin"}` atau `{"penulisId":"orang-lain"}` dan kamu menyimpannya.',
        },
        {
          term: '.trim()',
          meaning:
            'Membuang spasi di awal dan akhir **sebelum** memvalidasi. Urutannya penting: tanpa itu, judul berisi `"   "` akan lolos `.min(1)` karena panjangnya tiga.',
        },
        {
          term: 'safeParse',
          meaning:
            'Bentuk validasi yang mengembalikan `{ success, data }` alih-alih melempar. Ini bentuk yang tepat untuk input pengguna: **kegagalan validasi adalah bagian dari kontrak**, bukan kondisi tak terduga yang perlu di-`try/catch`.',
        },
        {
          term: 'issues',
          meaning:
            "Daftar masalah pada `hasil.error`. Tiap masalah membawa `path` (field mana) dan `message` (apa yang salah) — dua hal yang dipakai menyusun `{ field: { judul: 'wajib diisi' } }` di badan respons.",
        },
        {
          term: 'mengganti req.body dengan hasil',
          meaning:
            'Baris `req.body = hasil.data` bukan formalitas. Ia menukar data mentah dengan **hasil yang sudah divalidasi dan dikonversi** — jadi mulai titik itu, handler bisa memakainya tanpa memeriksa apa pun lagi.',
        },
        {
          term: 'validasi klien hanya UX',
          meaning:
            'Aturan yang tidak bisa ditawar. Batas panjang di form React tidak berlaku bagi aplikasi mobile, dan **tidak berlaku sama sekali** bagi `curl`. Penjagaan yang menentukan selalu di server.',
        },
      ),

      h2('Skema'),
      code(
        'js',
        `
        import { z } from 'zod';

        export const SkemaBuatCatatan = z.object({
          judul: z.string()
            .trim()
            .min(1, 'wajib diisi')
            .max(200, 'maksimal 200 karakter'),

          isi: z.string()
            .trim()
            .min(1, 'wajib diisi')
            .max(10_000, 'maksimal 10.000 karakter'),

          tagIds: z.array(z.number().int().positive())
            .max(10, 'maksimal 10 tag')
            .default([]),

          diarsipkan: z.boolean().default(false),
        })
        // Tolak field yang tidak dikenal — ini yang mencegah mass assignment.
        .strict();
        `,
      ),
      callout(
        'danger',
        '`.strict()` mencegah mass assignment',
        'Tanpa itu, Zod diam-diam membuang field asing — aman, tapi tidak memberi tahu apa pun. Dengan `.strict()`, permintaan yang menyertakan `{"peran":"admin"}` atau `{"penulisId":"orang-lain"}` **ditolak**, dan kamu jadi tahu ada yang mencoba. Yang jauh lebih berbahaya adalah menyebar body mentah ke query: `db.insert({ ...req.body })` menyerahkan seluruh kolom kepada pengirim.',
      ),

      h2('Middleware validasi'),
      code(
        'js',
        `
        // middleware/validasi.js
        import { KesalahanValidasi } from '../lib/errors.js';

        export function validasiBody(skema) {
          return (req, res, next) => {
            const hasil = skema.safeParse(req.body);

            if (!hasil.success) {
              const field = {};
              for (const masalah of hasil.error.issues) {
                field[masalah.path.join('.')] = masalah.message;
              }
              return next(new KesalahanValidasi(field));
            }

            // Ganti dengan hasil yang SUDAH divalidasi dan dikonversi.
            // Mulai titik ini, req.body dijamin sesuai skema.
            req.body = hasil.data;
            next();
          };
        }

        export function validasiQuery(skema) {
          return (req, res, next) => {
            const hasil = skema.safeParse(req.query);
            if (!hasil.success) return next(new KesalahanValidasi(ambilField(hasil.error)));

            // Di Express 5, req.query adalah getter -> simpan di properti lain.
            req.kueriTervalidasi = hasil.data;
            next();
          };
        }
        `,
      ),
      callout(
        'warning',
        'Express 5: `req.query` tidak bisa ditimpa',
        'Di Express 4, `req.query = hasil.data` bekerja. Di Express 5 ia adalah getter, dan penugasan itu gagal diam-diam — validasimu seolah berjalan, tapi handler tetap membaca nilai mentah. Simpan hasilnya di properti lain, seperti pada kode di atas.',
      ),

      h2('Memakainya'),
      code(
        'js',
        `
        const SkemaDaftar = z.object({
          hal: z.coerce.number().int().min(1).default(1),
          // Batas atas ada DI SKEMA, bukan di logika yang bisa terlupa.
          perHalaman: z.coerce.number().int().min(1).max(100).default(20),
          urut: z.enum(['baru', 'lama', 'judul']).default('baru'),
        });

        router.get('/', autentikasi, validasiQuery(SkemaDaftar), controller.daftar);
        router.post('/', autentikasi, validasiBody(SkemaBuatCatatan), controller.buat);
        `,
      ),

      h2('Validasi yang saling bergantung'),
      code(
        'js',
        `
        const SkemaRentang = z.object({
          mulai: z.coerce.date(),
          selesai: z.coerce.date(),
        }).refine((d) => d.mulai <= d.selesai, {
          message: 'tanggal mulai harus sebelum tanggal selesai',
          path: ['mulai'],
        });

        const SkemaDaftarAkun = z.object({
          kataSandi: z.string().min(12),
          konfirmasi: z.string(),
        }).refine((d) => d.kataSandi === d.konfirmasi, {
          message: 'konfirmasi tidak cocok',
          path: ['konfirmasi'],
        });
        `,
      ),

      h2('Batas yang wajib ada di setiap skema'),
      ul(
        '**Panjang maksimum** setiap string — tanpa ini, satu field bisa menampung berapa pun.',
        '**Panjang maksimum** setiap array — 10.000 tag dalam satu permintaan adalah serangan, bukan pemakaian.',
        '**Rentang** setiap angka — termasuk batas atas `perHalaman`.',
        '**Allow-list** untuk nilai berpilihan, memakai `z.enum`.',
      ),

      h2('Validasi juga berlaku untuk data dari luar lainnya'),
      code(
        'js',
        `
        // Respons API pihak ketiga TETAP masukan yang tidak tepercaya.
        const respons = await fetch(URL_PARTNER, { signal: AbortSignal.timeout(5000) });
        const mentah = await respons.json();

        const data = SkemaResponsPartner.parse(mentah);
        // Kalau partner mengubah bentuk responsnya, kamu tahu DI SINI —
        // bukan lima lapisan kemudian saat sebuah field bernilai undefined.
        `,
      ),
      callout(
        'tip',
        'Kaitannya dengan sub-bab 2.11',
        'Validasi **bukan** pengganti prepared statement. Keduanya lapisan berbeda: validasi menolak bentuk yang salah, parameterisasi memastikan nilai tidak pernah bisa menjadi perintah. API yang memvalidasi tapi merangkai SQL dengan string tetap rentan sepenuhnya.',
      ),
      references(
        {
          label: 'Zod — Basics',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Bentuk skema, `safeParse`, dan struktur `error.issues`.',
        },
        {
          label: 'Zod — Objects & .strict()',
          href: 'https://zod.dev/api',
          source: 'Zod',
          note: 'Perilaku field asing dan cara menolaknya alih-alih membuangnya diam-diam.',
        },
        {
          label: 'Input Validation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Prinsip allow-list dan batas ukuran yang wajib ada di setiap skema.',
        },
        {
          label: 'Mass Assignment Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa `{ ...req.body }` menyerahkan seluruh kolom kepada pengirim.',
        },
      ),
    ],
  ),

  written(
    'praktik-crud-express',
    'Praktik: REST API CRUD "catatan"',
    14,
    'Menyatukan seluruh bab menjadi satu API yang benar-benar berjalan.',
    [
      p(
        'Bangun API catatan lengkap yang memakai setiap konsep bab ini: struktur berlapis, validasi, penanganan error terpusat, logging, dan konfigurasi tervalidasi.',
      ),

      terms(
        {
          term: 'CRUD',
          meaning:
            'Singkatan *Create, Read, Update, Delete*. Empat operasi dasar yang dipetakan ke `POST`, `GET`, `PATCH`, dan `DELETE`. Latihan ini membangun kelimanya sekaligus dengan struktur berlapis yang benar.',
        },
        {
          term: 'trust proxy',
          meaning:
            'Setelan Express yang menentukan seberapa jauh header `X-Forwarded-*` boleh dipercaya. **Beri angka (`1`), jangan `true`**: `true` mempercayai seluruh rantai, sehingga klien bisa memalsukan IP-nya sendiri dan melewati rate limit.',
        },
        {
          term: 'helmet',
          meaning:
            'Middleware yang memasang sekumpulan header keamanan sekaligus. Satu baris di awal rantai yang menutup beberapa celah kecil — `X-Content-Type-Options`, `Referrer-Policy`, dan lainnya.',
        },
        {
          term: 'rate limit',
          meaning:
            'Pembatas jumlah permintaan per jendela waktu. `windowMs: 60_000, limit: 100` berarti seratus permintaan per menit per pemanggil. Ia yang membuat satu klien tidak bisa menghabiskan kapasitas untuk semua.',
        },
        {
          term: 'standardHeaders',
          meaning:
            'Opsi yang membuat rate limiter mengirim header sesuai draf standar (`RateLimit-*`) alih-alih header lama berawalan `X-`. Klien yang patuh bisa membaca sisa kuotanya tanpa menebak.',
        },
        {
          term: 'otorisasi per baris',
          meaning:
            'Spesifikasi terpenting latihan ini: pengguna **hanya** bisa melihat dan mengubah catatannya sendiri. Wujudnya bukan menyembunyikan tombol, melainkan `penulis_id` yang ikut di setiap `WHERE`.',
        },
        {
          term: 'uji dengan token pengguna lain',
          meaning:
            'Cara membuktikan otorisasi benar-benar bekerja. Ambil id catatan milik pengguna A, panggil endpoint dengan token pengguna B, dan pastikan jawabannya `404` — bukan `200`. Ini uji yang paling sering dilewatkan.',
        },
        {
          term: 'uji jalur gagal',
          meaning:
            'Delapan skenario yang harus kamu jalankan sendiri: tanpa token, token cacat, JSON rusak, body terlalu besar, field asing, id bukan angka, milik orang lain, dan rate limit terlampaui. **Setiap `500` untuk kesalahan klien adalah temuan**, bukan hasil yang wajar.',
        },
        {
          term: 'catat yang diterima, bukan yang diharapkan',
          meaning:
            'Disiplin verifikasi latihan ini. Tulis status code yang **benar-benar** kamu terima dari `curl`, bukan yang menurutmu seharusnya keluar. Selisih di antara keduanya persis daftar pekerjaan yang tersisa.',
        },
      ),

      h2('Spesifikasi'),
      code(
        'text',
        `
        GET    /api/catatan          daftar milik pengguna, berpaginasi
        POST   /api/catatan          buat baru             -> 201 + Location
        GET    /api/catatan/:id      satu item             -> 404 kalau bukan miliknya
        PATCH  /api/catatan/:id      ubah sebagian
        DELETE /api/catatan/:id      hapus                 -> 204

        Semua endpoint butuh autentikasi.
        Pengguna HANYA bisa melihat dan mengubah catatannya sendiri.
        `,
      ),

      h2('Struktur'),
      code(
        'text',
        `
        src/
        ├── server.js
        ├── app.js
        ├── config/env.js
        ├── lib/{db.js,log.js,errors.js}
        ├── middleware/{auth.js,validasi.js,error.js,pencatat.js}
        ├── routes/catatan.js
        ├── controllers/catatan.js
        ├── services/catatan.js
        ├── repositories/catatan.js
        └── schemas/catatan.js
        `,
      ),

      h2('Merakit aplikasinya'),
      code(
        'js',
        `
        // app.js
        import express from 'express';
        import helmet from 'helmet';
        import rateLimit from 'express-rate-limit';

        import { env } from './config/env.js';
        import { pencatatPermintaan } from './middleware/pencatat.js';
        import { penanganError } from './middleware/error.js';
        import catatanRouter from './routes/catatan.js';

        export const app = express();

        // Di belakang proxy: percaya X-Forwarded-* HANYA satu hop.
        app.set('trust proxy', 1);

        app.use(helmet());
        app.use(express.json({ limit: '100kb' }));
        app.use(pencatatPermintaan);

        app.use('/api', rateLimit({
          windowMs: 60_000,
          limit: 100,
          standardHeaders: 'draft-7',
          legacyHeaders: false,
        }));

        app.get('/health', (req, res) => res.json({ status: 'ok' }));

        app.use('/api/catatan', catatanRouter);

        // 404 untuk rute yang tidak cocok
        app.use((req, res) => {
          res.status(404).json({ error: { kode: 'RUTE_TIDAK_DITEMUKAN', pesan: 'Endpoint tidak ada' } });
        });

        // SELALU terakhir
        app.use(penanganError);
        `,
        { filename: 'src/app.js' },
      ),
      callout(
        'warning',
        '`trust proxy` harus diberi angka, jangan `true`',
        "Rate limiter memakai IP klien. Kalau kamu menulis `app.set('trust proxy', true)`, Express mempercayai seluruh rantai `X-Forwarded-For` — dan header itu bisa dipalsukan siapa pun. Penyerang tinggal mengirim IP acak di setiap permintaan untuk melewati rate limit sepenuhnya. Angka `1` berarti hanya mempercayai satu proxy terdekat.",
      ),

      h2('Repository — otorisasi ikut di query'),
      code(
        'js',
        `
        // repositories/catatan.js
        import { pool } from '../lib/db.js';

        const KOLOM = 'id, judul, isi, diarsipkan, dibuat_pada, diperbarui_pada';

        export async function cariMilikPengguna(penggunaId, { batas, lewati }) {
          const { rows } = await pool.query(
            \`SELECT \${KOLOM} FROM catatan
             WHERE penulis_id = $1 AND dihapus_pada IS NULL
             ORDER BY dibuat_pada DESC, id DESC
             LIMIT $2 OFFSET $3\`,
            [penggunaId, batas, lewati],
          );
          return rows;
        }

        export async function cariSatuMilikPengguna(id, penggunaId) {
          const { rows } = await pool.query(
            \`SELECT \${KOLOM} FROM catatan
             WHERE id = $1 AND penulis_id = $2 AND dihapus_pada IS NULL\`,
            [id, penggunaId],
          );
          return rows[0] ?? null;
        }

        export async function perbarui(id, penggunaId, perubahan) {
          // Allow-list kolom: nama kolom TIDAK BISA diparameterkan,
          // jadi ia harus berasal dari daftar milik kita sendiri.
          const KOLOM_BOLEH = { judul: 'judul', isi: 'isi', diarsipkan: 'diarsipkan' };

          const bagian = [];
          const nilai = [];

          for (const [kunci, val] of Object.entries(perubahan)) {
            const kolom = KOLOM_BOLEH[kunci];
            if (kolom === undefined) continue;          // abaikan yang tidak dikenal
            nilai.push(val);
            bagian.push(\`\${kolom} = $\${nilai.length}\`);
          }

          if (bagian.length === 0) return cariSatuMilikPengguna(id, penggunaId);

          nilai.push(id, penggunaId);

          const { rows } = await pool.query(
            \`UPDATE catatan SET \${bagian.join(', ')}, diperbarui_pada = NOW()
             WHERE id = $\${nilai.length - 1} AND penulis_id = $\${nilai.length}
             RETURNING \${KOLOM}\`,
            nilai,
          );
          return rows[0] ?? null;
        }
        `,
        { filename: 'src/repositories/catatan.js' },
      ),
      callout(
        'danger',
        'Perhatikan `AND penulis_id = $n` di setiap query',
        'Ini bukan pengulangan yang berlebihan — ini pertahanan berlapis. Meski service sudah memeriksa kepemilikan, query yang di-scope membuat satu kesalahan di lapisan atas tidak berubah menjadi kebocoran data. Kalau baris itu tidak ada, `PATCH /api/catatan/1` dari pengguna mana pun akan mengubah catatan siapa pun.',
      ),

      h2('Controller'),
      code(
        'js',
        `
        // controllers/catatan.js
        import * as service from '../services/catatan.js';

        export async function daftar(req, res) {
          const { hal, perHalaman } = req.kueriTervalidasi;

          const hasil = await service.daftarCatatan({
            penggunaId: req.pengguna.id,   // dari token, BUKAN dari klien
            halaman: hal,
            perHalaman,
          });

          res.json({ data: hasil.items, meta: hasil.meta });
        }

        export async function buat(req, res) {
          const catatan = await service.buatCatatan({
            ...req.body,                   // sudah lolos skema .strict()
            penggunaId: req.pengguna.id,
          });

          res.status(201).location(\`/api/catatan/\${catatan.id}\`).json({ data: catatan });
        }

        export async function hapus(req, res) {
          await service.hapusCatatan({ id: req.params.id, penggunaId: req.pengguna.id });
          res.status(204).end();
        }
        `,
      ),

      h2('Uji jalur yang tidak bahagia'),
      code(
        'bash',
        `
        # 1. Tanpa token -> 401
        curl -i http://localhost:3000/api/catatan

        # 2. Body kosong -> 422 dengan detail per field
        curl -i -X POST http://localhost:3000/api/catatan \\
          -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'

        # 3. Field asing -> 422 (karena .strict())
        curl -i -X POST http://localhost:3000/api/catatan \\
          -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \\
          -d '{"judul":"a","isi":"b","penulisId":999,"peran":"admin"}'

        # 4. Catatan milik orang lain -> 404, BUKAN 200 dan bukan 403
        curl -i http://localhost:3000/api/catatan/1 -H "Authorization: Bearer $TOKEN_LAIN"

        # 5. id bukan angka -> 400
        curl -i http://localhost:3000/api/catatan/abc -H "Authorization: Bearer $TOKEN"

        # 6. JSON rusak -> 400, bukan 500
        curl -i -X POST http://localhost:3000/api/catatan \\
          -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"judul": '

        # 7. perHalaman raksasa -> ditolak skema, bukan menghabiskan memori
        curl -i "http://localhost:3000/api/catatan?perHalaman=999999" -H "Authorization: Bearer $TOKEN"

        # 8. Lampaui rate limit -> 429
        for i in $(seq 1 120); do curl -s -o /dev/null -w "%{http_code} " \\
          http://localhost:3000/api/catatan -H "Authorization: Bearer $TOKEN"; done
        `,
      ),
      p(
        'Nomor 4 adalah yang paling penting. Kalau ia menjawab `200`, kamu punya IDOR — dan itu berarti setiap pengguna bisa membaca catatan seluruh pengguna lain hanya dengan menaikkan angka di URL.',
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Konfigurasi dan logging lebih dulu',
          body: 'Buat `config/env.js` dan `lib/log.js` sebelum apa pun. Uji dengan sengaja menghapus `JWT_SECRET` — aplikasi harus menolak menyala dengan pesan yang menyebut variabelnya.',
        },
        {
          title: '2. Kerangka aplikasi',
          body: 'Rakit `app.js` dengan helmet, batas body, pencatat, rate limit, dan penanganError. Uji `/health` sebelum menulis satu pun endpoint bisnis.',
        },
        {
          title: '3. Repository, dengan otorisasi di query',
          body: 'Tulis query berparameter, dan pastikan **setiap** query menyertakan `penulis_id`. Uji langsung lewat `psql` sebelum disambungkan ke HTTP.',
        },
        {
          title: '4. Service dan kelas error',
          body: 'Service melempar `KesalahanTidakDitemukan` / `KesalahanTidakBerhak`; ia tidak boleh menyebut `res` sama sekali. Buktikan dengan mencari `res.` di folder `services/` — harus nihil.',
        },
        {
          title: '5. Skema, controller, dan rute',
          body: 'Skema memakai `.strict()` dan punya batas untuk setiap string, array, dan angka. Baru sambungkan ke controller dan rute.',
        },
        {
          title: '6. Jalankan kedelapan uji gagal di atas',
          body: 'Catat status code yang benar-benar kamu terima, bukan yang kamu harapkan. Setiap `500` untuk kesalahan klien adalah temuan yang harus diperbaiki.',
        },
      ),

      divider,

      checklist(
        'bb3-praktik',
        'Checklist praktik bab ini',
        'Aplikasi menolak menyala kalau ada variabel environment yang hilang atau tidak valid',
        'Setiap endpoint melewati middleware autentikasi, dan urutannya sudah diperiksa',
        'Identitas pengguna hanya berasal dari token, tidak pernah dari body atau query',
        'Setiap query database menyertakan `penulis_id` — diuji dengan token pengguna lain',
        'Semua skema memakai `.strict()` dan punya batas panjang serta rentang',
        'Tidak ada satu pun query yang dirangkai dengan penggabungan string',
        'Nama kolom untuk `ORDER BY`/`UPDATE` berasal dari allow-list, bukan dari input',
        'JSON rusak dijawab 400, body terlalu besar dijawab 413 — keduanya bukan 500',
        'Respons error tidak pernah memuat `err.message` untuk kesalahan 5xx',
        'Tidak ada `SELECT *` yang hasilnya langsung dikirim ke klien',
        'Log tidak memuat password, token, atau header `Authorization`',
        'Rate limit terpasang dan `trust proxy` diberi angka, bukan `true`',
        'Server menutup dengan rapi saat menerima SIGTERM',
      ),

      references(
        {
          label: 'Production Best Practices: Security',
          href: 'https://expressjs.com/en/advanced/best-practice-security.html',
          source: 'Express',
          note: 'Termasuk penjelasan resmi kenapa `trust proxy` diberi angka, bukan `true`.',
        },
        {
          label: 'Production Best Practices: Performance',
          href: 'https://expressjs.com/en/advanced/best-practice-performance.html',
          source: 'Express',
          note: 'Daftar hal yang harus benar sebelum aplikasi Express dijalankan di produksi.',
        },
        {
          label: 'Zod — Basics',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Skema yang dipakai langkah 5, beserta bentuk `error.issues`-nya.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist keamanan API yang dipetakan langsung ke kedelapan uji gagal di atas.',
        },
      ),
    ],
  ),
];
