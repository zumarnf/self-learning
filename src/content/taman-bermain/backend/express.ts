import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * Backend — Express, graded structurally.
 *
 * Three shapes that decide whether a Node service is operable: one place that turns an error into
 * a response, one place that decides what input is allowed in, and one place that refuses to boot
 * on bad configuration.
 *
 * All three share a failure mode that a passing happy path hides completely — the app works
 * perfectly until the day it doesn't, and then nobody can tell what went wrong.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'express-error-terpusat',
    title: 'Error handler terpusat di Express',
    topic: 'backend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Satu tempat yang mengubah error menjadi response. Tanpa ini, setiap route menulis `try/catch` sendiri, bentuk response-nya berbeda-beda, dan sebagian route menelan error-nya diam-diam.',
    source: { category: 'backend-basic', chapter: 'nodejs-express-basic' },
    brief: {
      situation:
        'API catatan yang kamu buat punya puluhan route. Setiap route bisa gagal, misalnya karena database mati. Kalau setiap route menangani error-nya sendiri, bentuk pesan error-nya jadi berbeda-beda dan ada route yang lupa menanganinya. Express menyediakan satu tempat khusus untuk menangani semua error sekaligus, yaitu error handler.',
      tasks: [
        'Tulis sebuah error handler dan daftarkan ke aplikasi dengan `app.use(...)`.',
        'Error handler itu wajib punya EMPAT parameter, yaitu `(err, req, res, next)`.',
        'Catat detail error ke log di server, misalnya dengan `console.error`.',
        'Kirim response berisi pesan umum ke klien, dengan status dari `err.status` atau `500` kalau tidak ada.',
        'Daftarkan error handler SETELAH semua route.',
      ],
      pitfalls: [
        'Express mengenali error handler HANYA dari jumlah parameternya. Tiga parameter menghasilkan middleware biasa yang tidak pernah menerima error, dan tidak ada peringatan apa pun. Error-nya diam-diam tidak pernah sampai.',
        'Jangan mengirim `err.stack` ke klien. Stack trace membocorkan nama folder dan versi library kepada siapa pun yang bisa memancing error.',
        'Error handler yang didaftarkan sebelum route tidak pernah dilewati apa pun, karena Express menjalankan middleware sesuai urutan pendaftarannya.',
      ],
      terms: [
        {
          term: 'middleware',
          meaning:
            'Fungsi yang dijalankan Express di antara datangnya request dan dikirimnya response. Bentuk biasanya `(req, res, next)`. Middleware bisa memeriksa request, mengubahnya, lalu memanggil `next()` untuk meneruskan ke middleware berikutnya, sesuai urutan `app.use`.',
        },
        {
          term: 'error handler',
          meaning:
            'Middleware khusus dengan empat parameter `(err, req, res, next)`. Express hanya memanggilnya kalau ada error, baik yang dilempar di route maupun yang dikirim lewat `next(err)`. Di situlah error diubah menjadi response yang rapi.',
        },
        {
          term: 'stack trace',
          meaning:
            'Catatan urutan pemanggilan fungsi saat error terjadi, lengkap dengan nama file dan nomor barisnya. Isinya sangat berguna untuk developer, tapi berbahaya kalau terlihat orang luar, karena memperlihatkan struktur folder dan library yang dipakai server.',
        },
      ],
    },
    rules: [
      'Error handler punya empat parameter `(err, req, res, next)`.',
      'Didaftarkan setelah route.',
      'Klien menerima pesan umum, bukan `err.stack`.',
      'Status diambil dari error, dengan `500` sebagai bawaan.',
    ],
    starter: `
      app.get('/catatan', ambilCatatan);

      // daftarkan error handler terpusat di sini
    `,
    hints: [
      'Express membedakan error handler dari middleware biasa hanya lewat jumlah parameternya.',
      'Catat detailnya ke log lebih dulu, baru kirim response yang sudah dibersihkan.',
      'Bentuknya `app.use((err, req, res, next) => { ... })`. Tetap tulis empat parameter walau `next` tidak dipakai.',
    ],
    solution: {
      code: `
        app.get('/catatan', ambilCatatan);

        // Didaftarkan SETELAH semua route. Empat parameter wajib, walau next tidak dipakai,
        // karena dari jumlah parameter itulah Express tahu ini error handler.
        app.use((err, req, res, next) => {
          // Detail error hanya dicatat di server.
          console.error('[error]', { url: req.originalUrl, pesan: err.message });

          // Klien menerima status yang tepat dan pesan yang umum.
          const status = err.status ?? 500;
          res.status(status).json({ pesan: 'Terjadi kesalahan di server.' });
        });
      `,
      steps: [
        'Route `app.get("/catatan", ...)` didaftarkan lebih dulu, dan error handler didaftarkan paling akhir.',
        '`app.use((err, req, res, next) => ...)` mendaftarkan fungsi dengan empat parameter, sehingga Express memperlakukannya sebagai error handler.',
        '`console.error(...)` mencatat detail error beserta URL-nya di log server, supaya developer bisa menyelidikinya.',
        '`err.status ?? 500` memakai status dari error kalau ada, dan `500` kalau tidak ada.',
        '`res.status(status).json(...)` mengirim pesan umum ke klien, tanpa `err.stack`.',
      ],
      explanation:
        'Parameter `next` tidak dipakai, tapi tetap harus ada. Express memutuskan sebuah fungsi adalah error handler hanya dari jumlah parameternya. Menghapus `next` karena terlihat tidak terpakai mengubahnya menjadi middleware biasa yang tidak pernah menerima error, dan tidak ada apa pun yang memberi tahu.',
    },
    alternativeSolutions: [
      `
        app.get('/catatan', ambilCatatan);

        function errorHandler(err, req, res, next) {
          logger.error({ err: err.message, url: req.originalUrl }, 'permintaan gagal');
          const status = typeof err.status === 'number' ? err.status : 500;
          res.status(status).json({ pesan: 'Terjadi kesalahan di server.' });
        }

        app.use(errorHandler);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          app.get('/catatan', ambilCatatan);

          app.use((err, req, res) => {
            console.error(err.message);
            res.status(500).json({ pesan: 'Terjadi kesalahan di server.' });
          });
        `,
        reason:
          'Hanya tiga parameter, sehingga Express memperlakukannya sebagai middleware biasa dan error tidak pernah sampai.',
      },
      {
        code: `
          app.get('/catatan', ambilCatatan);

          app.use((err, req, res, next) => {
            res.status(500).json({ pesan: err.stack });
          });
        `,
        reason: 'Mengirim stack trace ke klien, sehingga nama folder dan versi library ikut bocor.',
      },
      {
        code: `
          app.use((err, req, res, next) => {
            console.error(err.message);
            res.status(500).json({ pesan: 'Terjadi kesalahan di server.' });
          });

          app.get('/catatan', ambilCatatan);
        `,
        reason: 'Didaftarkan sebelum route, sehingga tidak ada error yang pernah sampai kepadanya.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'empat-parameter',
        'Error handler punya empat parameter `(err, req, res, next)`',
        'Express mengenali error handler HANYA dari jumlah parameternya. Tiga parameter menghasilkan middleware biasa yang tidak pernah menerima error, dan tidak ada peringatan apa pun.',
        '\\(\\s*err\\s*,\\s*req\\s*,\\s*res\\s*,\\s*next\\s*\\)',
      ),
      wajibStruktur(
        'dicatat-di-log',
        'Detail error dicatat di server',
        'Belum ada yang mencatat error-nya. Error yang ditelan tanpa jejak mengubah kegagalan yang berisik menjadi kerusakan yang diam-diam.',
        'console\\.error|logger\\.(error|warn)',
      ),
      larangStruktur(
        'tanpa-stack-ke-klien',
        'Tidak mengirim `err.stack` ke klien',
        'Stack trace membocorkan nama folder dan versi library kepada siapa pun yang bisa memancing error. Detailnya cukup di log, dan klien menerima pesan umum.',
        'res\\.[\\s\\S]{0,80}err\\.stack',
      ),
      wajibStruktur(
        'status-berbawaan',
        'Status diambil dari error, dengan `500` sebagai bawaan',
        'Belum ada penentuan status. Ambil dari `err.status` kalau ada, dan pakai `500` kalau tidak ada.',
        'err\\.status[\\s\\S]{0,40}500|500[\\s\\S]{0,40}err\\.status|res\\.status\\(\\s*500',
      ),
      urutStruktur(
        'setelah-route',
        'Didaftarkan setelah route',
        'Error handler yang didaftarkan sebelum route tidak pernah dilewati apa pun.',
        ['app\\.(get|post|put|delete|use)\\s*\\(\\s*[\'"]/', '\\(\\s*err\\s*,\\s*req'],
      ),
    ]),
  }),

  soal({
    slug: 'express-validasi-zod',
    title: 'Validasi body dengan Zod sebelum handler',
    topic: 'backend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Satu pintu masuk yang memutuskan bentuk data apa yang boleh lewat. Tanpa ini, setiap handler memeriksa sebagian field sendiri, dan field yang tidak diperiksa mengalir sampai ke database.',
    source: { category: 'backend-basic', chapter: 'nodejs-express-basic' },
    brief: {
      situation:
        'Endpoint `POST /catatan` menerima data dari klien untuk membuat catatan baru. Klien bisa mengirim apa saja, misalnya judul sepanjang satu juta karakter, isi yang kosong, atau field tambahan seperti `userId` milik orang lain. Sebelum data itu sampai ke handler yang menyimpannya, bentuknya harus diperiksa lebih dulu.',
      tasks: [
        'Buat schema Zod bernama `skemaCatatan` untuk body request.',
        '`judul` berupa string yang tidak kosong dengan panjang maksimal 200 karakter.',
        '`isi` berupa string yang tidak kosong.',
        'Buat middleware `validasiCatatan` yang memeriksa `req.body` memakai `safeParse`.',
        'Kalau tidak valid, kirim status `400`. Kalau valid, simpan data hasil validasi ke `req.data` lalu panggil `next()`.',
      ],
      pitfalls: [
        'Pakai `safeParse`, bukan `parse`. `parse` melempar error, sehingga kamu kehilangan kendali atas bentuk response dan kesalahan klien keluar sebagai status 500.',
        'Data yang tidak valid dijawab status `400`, bukan `500`. Status 5xx memberi tahu klien "coba lagi nanti", padahal yang sebenarnya terjadi adalah "perbaiki data yang kamu kirim".',
        'Teruskan hasil validasi, yaitu `hasil.data`, bukan `req.body` mentah. Zod hanya mengembalikan field yang ada di schema, sehingga field tambahan seperti `userId` berhenti di sini.',
      ],
      terms: [
        {
          term: 'Zod',
          meaning:
            'Library JavaScript untuk mendeskripsikan bentuk data lalu memeriksanya. `z.object({ judul: z.string().max(200) })` berarti "objek dengan field judul berupa string maksimal 200 karakter". Zod juga dipakai di bagian lain project ini untuk memeriksa data.',
        },
        {
          term: 'schema',
          meaning:
            'Deskripsi bentuk data yang dianggap sah, misalnya field apa saja yang wajib ada dan tipenya apa. Schema bekerja seperti formulir resmi dengan kolom yang sudah ditentukan. Data yang tidak cocok dengan formulir itu ditolak.',
        },
        {
          term: 'safeParse()',
          meaning:
            'Method Zod yang memeriksa data tanpa melempar error. Hasilnya objek `{ success: true, data }` kalau valid, atau `{ success: false, error }` kalau tidak valid. Kebalikannya `parse()`, yang langsung melempar error saat datanya tidak valid.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Celah keamanan ketika server menyimpan semua field yang dikirim klien apa adanya. Penyerang bisa menambahkan field seperti `role: "admin"` ke request-nya. Validasi yang hanya meneruskan field yang dikenal schema menutup celah ini.',
        },
      ],
    },
    rules: [
      'Ada schema Zod dengan batas `max` pada judul.',
      'Memakai `safeParse`.',
      'Data yang tidak valid dijawab status `400`.',
      'Data hasil validasi yang diteruskan, bukan `req.body` mentah.',
    ],
    starter: `
      import { z } from 'zod';

      // tulis schema dan middleware validasinya di sini

      app.post('/catatan', validasiCatatan, simpanCatatan);
    `,
    hints: [
      'Schema Zod disusun dengan `z.object({ ... })` yang berisi tipe setiap field.',
      '`safeParse` mengembalikan objek dengan properti `success`, bukan melempar error.',
      'Simpan hasilnya di `req.data`, supaya handler berikutnya memakai data yang sudah bersih.',
    ],
    solution: {
      code: `
        import { z } from 'zod';

        // Bentuk data yang boleh masuk. Field lain di luar ini akan dibuang.
        const skemaCatatan = z.object({
          judul: z.string().min(1).max(200),
          isi: z.string().min(1),
        });

        function validasiCatatan(req, res, next) {
          // safeParse tidak melempar. Hasilnya kita periksa sendiri.
          const hasil = skemaCatatan.safeParse(req.body);

          if (!hasil.success) {
            // Kesalahan ada di data kiriman klien, jadi statusnya 400.
            return res.status(400).json({
              pesan: 'Data yang dikirim tidak valid.',
              error: hasil.error.flatten().fieldErrors,
            });
          }

          req.data = hasil.data; // teruskan data yang SUDAH bersih, bukan req.body
          next();
        }

        app.post('/catatan', validasiCatatan, simpanCatatan);
      `,
      steps: [
        '`z.object({...})` mendeskripsikan body yang sah. `.min(1)` berarti tidak boleh kosong, dan `.max(200)` membatasi panjang judul.',
        '`skemaCatatan.safeParse(req.body)` memeriksa data kiriman klien tanpa melempar error.',
        'Kalau `hasil.success` bernilai `false`, middleware langsung mengirim status `400` beserta daftar field yang bermasalah, dan handler tidak pernah dijalankan.',
        'Kalau valid, `hasil.data` disimpan di `req.data`. Isinya hanya field yang ada di schema.',
        '`next()` meneruskan request ke `simpanCatatan`, yang sekarang cukup membaca `req.data`.',
      ],
      explanation:
        '`req.data` diisi dari hasil `safeParse`, bukan dari `req.body` yang diteruskan apa adanya. Zod mengembalikan objek baru yang hanya berisi field yang dideklarasikan schema. Jadi field tambahan apa pun yang dikirim klien berhenti di sini, dan perlindungan dari mass assignment kamu dapatkan gratis dari validasi.',
    },
    alternativeSolutions: [
      `
        import { z } from 'zod';

        const skemaCatatan = z.object({
          judul: z.string().trim().min(1).max(200),
          isi: z.string().trim().min(1),
        });

        const validasiCatatan = (req, res, next) => {
          const hasil = skemaCatatan.safeParse(req.body);
          if (hasil.success === false) {
            res.status(400).json({ pesan: 'Data tidak valid.', error: hasil.error.issues });
            return;
          }
          req.data = hasil.data;
          next();
        };

        app.post('/catatan', validasiCatatan, simpanCatatan);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          import { z } from 'zod';

          const skemaCatatan = z.object({
            judul: z.string().min(1).max(200),
            isi: z.string().min(1),
          });

          function validasiCatatan(req, res, next) {
            const data = skemaCatatan.parse(req.body);
            req.data = data;
            next();
          }

          app.post('/catatan', validasiCatatan, simpanCatatan);
        `,
        reason:
          'Memakai `parse` yang melempar error, sehingga kesalahan data dari klien keluar sebagai status 500.',
      },
      {
        code: `
          import { z } from 'zod';

          const skemaCatatan = z.object({
            judul: z.string().min(1),
            isi: z.string().min(1),
          });

          function validasiCatatan(req, res, next) {
            const hasil = skemaCatatan.safeParse(req.body);
            if (!hasil.success) return res.status(400).json({ pesan: 'Tidak valid.' });
            req.data = req.body;
            next();
          }

          app.post('/catatan', validasiCatatan, simpanCatatan);
        `,
        reason:
          'Meneruskan `req.body` mentah sehingga field tambahan tetap mengalir, dan judulnya tanpa batas `max`.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'ada-skema',
        'Ada schema Zod untuk body',
        'Belum ada `z.object({ ... })` yang mendeskripsikan bentuk body yang diterima.',
        'z\\.object\\s*\\(',
      ),
      wajibStruktur(
        'batas-max',
        'Judul punya batas panjang',
        'Belum ada `.max()` pada judul. Tanpa batas, teks berukuran megabyte lolos validasi lalu ditolak database sebagai status 500.',
        '\\.max\\s*\\(\\s*\\d+',
      ),
      wajibStruktur(
        'pakai-safeparse',
        'Memakai `safeParse`',
        '`safeParse` mengembalikan hasil alih-alih melempar error, sehingga kamu yang menentukan bentuk dan status response-nya.',
        '\\.safeParse\\s*\\(',
      ),
      wajibStruktur(
        'status-400',
        'Data yang tidak valid dijawab status `400`',
        'Belum ada status `400`. Status 5xx memberi tahu klien "coba lagi nanti", padahal yang sebenarnya terjadi adalah "perbaiki data kirimanmu".',
        'status\\s*\\(\\s*400\\s*\\)',
      ),
      wajibStruktur(
        'teruskan-tervalidasi',
        'Data hasil validasi yang diteruskan',
        'Teruskan `hasil.data`, bukan `req.body`. Zod mengembalikan objek baru yang hanya berisi field di schema, sehingga perlindungan dari mass assignment didapat gratis.',
        '=\\s*hasil\\.data|=\\s*\\w+\\.data\\b',
      ),
    ]),
  }),

  soal({
    slug: 'express-config-divalidasi',
    title: 'Konfigurasi divalidasi saat server dinyalakan',
    topic: 'backend-nyata',
    level: 'intermediate',
    realWorldUse:
      'Deployment jauh lebih sering gagal karena konfigurasi daripada karena kode. Server yang menyala dengan variabel yang hilang lalu rusak di request pertama jauh lebih sulit diselidiki daripada server yang menolak menyala dengan pesan yang jelas.',
    source: { category: 'backend-basic', chapter: 'nodejs-express-basic' },
    brief: {
      situation:
        'Server kamu butuh beberapa pengaturan dari environment variable, misalnya alamat database dan nomor port. Suatu hari seseorang men-deploy tanpa mengisi `DATABASE_URL`. Server tetap menyala dan terlihat sehat, lalu gagal satu jam kemudian saat request pertama menyentuh database. Tidak ada yang langsung tahu penyebabnya. Soal ini mencegah kejadian itu.',
      tasks: [
        'Baca `process.env` SEKALI saat server dinyalakan, lalu periksa bentuknya dengan schema Zod.',
        'Schema-nya memuat `DATABASE_URL` berupa string yang tidak kosong, dan `PORT` berupa angka dengan nilai bawaan `3000`.',
        'Kalau ada yang hilang atau bentuknya salah, cetak NAMA variabel yang bermasalah lalu hentikan proses.',
        'Ekspor hasil validasinya sebagai satu objek bernama `config`.',
      ],
      pitfalls: [
        'Server harus berhenti SEKARANG kalau konfigurasinya salah. Menyala dengan `DATABASE_URL` bernilai `undefined` berarti kegagalannya baru muncul di request pertama, jauh dari penyebabnya.',
        'Jangan pernah mencetak isi `process.env` ke log. Konfigurasi hampir selalu berisi password dan kunci rahasia, dan log kegagalan server sering disalin ke tiket atau chat. Cetak NAMA variabelnya saja.',
        'Setelah ini, tidak ada bagian lain dari kode yang membaca `process.env` langsung. Semua bagian memakai `config`.',
      ],
      terms: [
        {
          term: 'environment variable',
          meaning:
            'Pengaturan yang diberikan kepada program dari luar kodenya, misalnya lewat file `.env` atau pengaturan server hosting. Di Node.js semuanya bisa dibaca lewat `process.env`, misalnya `process.env.PORT`. Nilainya SELALU berupa string, termasuk angka.',
        },
        {
          term: 'fail fast',
          meaning:
            'Prinsip bahwa program sebaiknya gagal secepat mungkin dan sejelas mungkin saat ada yang salah. Server yang menolak menyala dengan pesan "`DATABASE_URL` belum diisi" jauh lebih mudah diperbaiki daripada server yang menyala lalu rusak diam-diam satu jam kemudian.',
        },
        {
          term: 'z.coerce.number()',
          meaning:
            'Schema Zod yang mengubah nilai menjadi angka lebih dulu, baru memeriksanya. Ini penting karena `process.env.PORT` bernilai string `"3000"`, bukan angka `3000`. `z.coerce.number()` mengubah `"3000"` menjadi `3000` dan menolak teks yang bukan angka.',
        },
      ],
    },
    rules: [
      'Membaca `process.env` lewat satu schema.',
      'Proses berhenti saat konfigurasi tidak valid.',
      'Mengekspor satu objek `config`.',
      'Tidak mencetak isi `process.env` ke log.',
    ],
    starter: `
      import { z } from 'zod';

      // baca, validasi, lalu ekspor konfigurasinya di sini
    `,
    hints: [
      'Perlakukan `process.env` seperti body request, yaitu belum bisa dipercaya sebelum diperiksa.',
      '`z.coerce.number()` berguna karena semua environment variable berupa string.',
      'Untuk menghentikan server, cetak pesannya lalu panggil `process.exit(1)`, atau lempar error.',
    ],
    solution: {
      code: `
        import { z } from 'zod';

        const skemaEnv = z.object({
          DATABASE_URL: z.string().min(1),
          PORT: z.coerce.number().int().positive().default(3000), // "3000" diubah menjadi 3000
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        // Diperiksa SEKALI, saat file ini pertama kali dimuat.
        const hasil = skemaEnv.safeParse(process.env);

        if (!hasil.success) {
          // Cetak NAMA variabel yang bermasalah saja, jangan isinya.
          console.error('Konfigurasi tidak valid:', Object.keys(hasil.error.flatten().fieldErrors));
          process.exit(1); // fail fast. Server menolak menyala.
        }

        // Bagian lain aplikasi memakai config ini, bukan process.env langsung.
        export const config = hasil.data;
      `,
      steps: [
        '`z.object({...})` mendeskripsikan pengaturan yang dibutuhkan server beserta bentuknya.',
        '`z.coerce.number()` mengubah `PORT` dari string menjadi angka, dan `.default(3000)` dipakai kalau `PORT` tidak diisi.',
        '`skemaEnv.safeParse(process.env)` memeriksa seluruh environment variable sekali saat server dinyalakan.',
        'Kalau tidak valid, `Object.keys(...)` mengambil NAMA variabel yang bermasalah untuk dicetak, lalu `process.exit(1)` menghentikan server.',
        'Kalau valid, `hasil.data` diekspor sebagai `config`, dan bagian lain aplikasi cukup meng-import `config`.',
      ],
      explanation:
        'Yang dicetak saat gagal adalah NAMA variabelnya lewat `Object.keys`, bukan isinya. Kesalahan konfigurasi hampir selalu menyangkut password atau kunci rahasia, dan log kegagalan server adalah salah satu hal yang paling sering disalin ke tiket, chat, dan pesan bantuan.',
    },
    alternativeSolutions: [
      `
        import { z } from 'zod';

        const skemaEnv = z.object({
          DATABASE_URL: z.string().url(),
          PORT: z.coerce.number().default(3000),
        });

        const hasil = skemaEnv.safeParse(process.env);

        if (hasil.success === false) {
          throw new Error('Konfigurasi tidak valid: ' + Object.keys(hasil.error.flatten().fieldErrors).join(', '));
        }

        export const config = Object.freeze(hasil.data);
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          export const config = {
            databaseUrl: process.env.DATABASE_URL,
            port: process.env.PORT ?? 3000,
          };
        `,
        reason:
          'Tidak divalidasi sama sekali, sehingga server tetap menyala walau `DATABASE_URL` bernilai `undefined`.',
      },
      {
        code: `
          import { z } from 'zod';

          const skemaEnv = z.object({ DATABASE_URL: z.string().min(1) });
          const hasil = skemaEnv.safeParse(process.env);

          if (!hasil.success) {
            console.error('Konfigurasi tidak valid', process.env);
          }

          export const config = hasil.data;
        `,
        reason:
          'Mencetak seluruh isi `process.env` ke log, dan server tetap menyala walau konfigurasinya gagal.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'validasi-env',
        '`process.env` divalidasi lewat schema',
        'Belum ada schema yang memeriksa `process.env`. Perlakukan ia seperti body request, yaitu belum bisa dipercaya sebelum diperiksa.',
        'safeParse\\s*\\(\\s*process\\.env|parse\\s*\\(\\s*process\\.env',
      ),
      wajibStruktur(
        'berhenti-saat-gagal',
        'Proses berhenti saat konfigurasi tidak valid',
        'Belum ada `process.exit` atau `throw`. Menyala dengan konfigurasi yang salah berarti kegagalannya muncul jauh dari penyebabnya.',
        'process\\.exit\\s*\\(|throw\\s+new\\s+Error',
      ),
      wajibStruktur(
        'ekspor-config',
        'Mengekspor satu objek `config`',
        'Belum ada `export const config`. Satu objek di satu tempat menjawab pertanyaan "variabel apa saja yang dibutuhkan server ini".',
        'export\\s+(const|default)\\s+config',
      ),
      larangStruktur(
        'tanpa-cetak-nilai',
        'Tidak mencetak isi `process.env` ke log',
        'Mencetak `process.env` membocorkan password dan kunci rahasia ke log, dan log kegagalan server adalah hal yang paling sering disalin ke tiket dan chat.',
        'console\\.\\w+\\([^)]{0,60}process\\.env\\s*[,)]',
      ),
    ]),
  }),
];
