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
  steps,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Backend Basic — Chapter 5, all nine lessons.
 *
 * The security chapter. Written to be read as a set of hard rules rather than options, because
 * every item here has a well-documented failure mode and none of them announce themselves when
 * they are wrong — an app with broken authorization behaves exactly like one with working
 * authorization until someone notices.
 *
 * Examples appear in both Express and Laravel throughout, since the reader has now built the same
 * API twice and the point is that the rules do not change with the framework.
 */
export const lessons: LessonDraft[] = [
  written(
    'auth-vs-authz',
    'Beda Autentikasi dan Otorisasi',
    14,
    'Dua pertanyaan berbeda yang sering dijawab sebagai satu.',
    [
      p(
        'Dua istilah ini sering disingkat sama-sama "auth", dan penggabungan itu sendiri yang melahirkan celah. Keduanya menjawab pertanyaan yang berbeda, di tempat yang berbeda.',
      ),

      terms(
        {
          term: 'autentikasi',
          meaning:
            'Menjawab **"siapa kamu"**. Terjadi **sekali**, saat masuk. Gagal berarti `401 Unauthorized`. Contohnya email + password, atau token yang tanda tangannya diperiksa.',
        },
        {
          term: 'otorisasi',
          meaning:
            'Menjawab **"kamu boleh apa"**. Terjadi di **setiap** permintaan, untuk **setiap** sumber daya. Gagal berarti `403 Forbidden` — atau `404`, kalau keberadaan datanya sendiri tidak boleh diketahui.',
        },
        {
          term: '"auth"',
          meaning:
            'Singkatan yang dipakai untuk **keduanya** — dan penggabungan itu sendiri yang melahirkan celah. Dua hal yang berbeda pertanyaan, berbeda waktu, dan berbeda tempat pemeriksaannya jadi terasa seperti satu urusan yang sudah selesai.',
        },
        {
          term: 'otorisasi tingkat rute',
          meaning:
            'Apakah peran ini boleh menyentuh endpoint ini **sama sekali** — misalnya hanya admin yang boleh `/api/admin/*`. Ini lapisan yang biasanya diingat orang.',
        },
        {
          term: 'otorisasi tingkat objek',
          meaning:
            'Apakah pengguna ini boleh menyentuh **baris ini**. Inilah lapisan yang **paling sering hilang**: endpoint terlindungi dari orang asing, tapi tidak dari sesama pengguna yang mengganti angka di URL.',
        },
        {
          term: 'IDOR',
          meaning:
            'Singkatan *Insecure Direct Object Reference* — akibat langsung dari hilangnya otorisasi tingkat objek. Setiap pengguna yang sudah masuk bisa membaca data siapa pun hanya dengan mengubah id di URL. Dibahas tuntas di sub-bab 5.7.',
        },
        {
          term: 'default deny',
          meaning:
            'Menolak semuanya, lalu **membuka akses secara eksplisit**. Perbedaannya dari "default izinkan" adalah perbedaan antara aman dan bocor: dengan default deny, endpoint baru yang lupa didaftarkan jadi **tidak bisa diakses** — merepotkan, tapi tidak berbahaya.',
        },
        {
          term: 'fail closed',
          meaning:
            'Prinsip bahwa **kegagalan harus mengarah ke penolakan**. Error saat memeriksa token, database yang tidak bisa dihubungi, konfigurasi yang hilang — semuanya harus berakhir "ditolak", bukan "dilewatkan".',
        },
        {
          term: 'security by obscurity',
          meaning:
            'Mengandalkan sesuatu yang tidak diketahui orang sebagai penjagaan — tombol yang disembunyikan, halaman yang tidak ditautkan, URL yang sulit ditebak. **Tidak menjaga apa pun**: siapa pun bisa memanggil endpoint-nya langsung dengan `curl`.',
        },
      ),

      table(
        ['', 'Autentikasi', 'Otorisasi'],
        [
          ['Pertanyaan', '**Siapa kamu?**', '**Kamu boleh apa?**'],
          ['Terjadi', 'Sekali, saat masuk', '**Setiap** permintaan, setiap sumber daya'],
          ['Gagal', '`401 Unauthorized`', '`403 Forbidden` (atau `404`)'],
          ['Contoh', 'Email + password, token', 'Pemilik catatan, peran admin'],
        ],
      ),

      h2('Kesalahan yang paling sering'),
      code(
        'js',
        `
        // Ini HANYA autentikasi. Ia memeriksa "siapa", bukan "boleh apa".
        app.use('/api', autentikasi);

        app.get('/api/catatan/:id', async (req, res) => {
          const catatan = await db.cariCatatan(req.params.id);
          res.json({ data: catatan });
        });
        `,
      ),
      p(
        'Setiap pengguna yang **sudah masuk** bisa membaca catatan **siapa pun** hanya dengan mengganti angka di URL. Endpoint-nya terlindungi dari orang asing, tapi tidak dari sesama pengguna. Ini IDOR, dibahas tuntas di sub-bab 5.7.',
      ),
      code(
        'js',
        `
        // BENAR: identitas dari sesi, kewenangan diperiksa di query
        const catatan = await db.cariCatatanMilik(req.params.id, req.pengguna.id);
        if (catatan === null) return res.status(404).json({ error: { pesan: 'Tidak ditemukan' } });
        `,
      ),
      p(
        'Dua argumen pada baris pertama itulah perbaikannya, dan keduanya punya asal yang berbeda. `req.params.id` menyebut **benda mana** yang diminta dan datang dari klien, sedangkan `req.pengguna.id` menyebut **siapa yang meminta** dan datang dari sesi atau token yang sudah diverifikasi server. Karena keduanya dipakai bersama di dalam query, catatan milik orang lain tidak akan pernah terambil — pemeriksaannya terjadi di lapisan data, bukan sebagai `if` di atasnya yang bisa terlupa di endpoint berikutnya.',
      ),
      p(
        'Perhatikan jawabannya `404`, bukan `403`. Catatan yang ada tapi bukan milik peminta dan catatan yang memang tidak ada menghasilkan respons yang **sama persis**, sehingga tidak ada yang bisa memetakan id mana yang terpakai hanya dengan mencoba angka berurutan. Ini pilihan yang tepat untuk data yang keberadaannya sendiri bersifat privat.',
      ),

      h2('Tiga lapisan yang harus ada'),
      ol(
        '**Autentikasi** — verifikasi identitas di setiap permintaan, dari token atau sesi yang tanda tangannya diperiksa.',
        '**Otorisasi tingkat rute** — apakah peran ini boleh menyentuh endpoint ini sama sekali.',
        '**Otorisasi tingkat objek** — apakah pengguna ini boleh menyentuh **baris ini**. Ini yang paling sering hilang.',
      ),

      h2('Default: tolak, lalu izinkan secara eksplisit'),
      compare(
        {
          title: 'Default izinkan',
          lang: 'js',
          code: `
          const RUTE_TERLINDUNGI = [
            '/api/admin',
            '/api/pengguna',
          ];

          if (RUTE_TERLINDUNGI.includes(req.path)) {
            periksaAuth(req);
          }
          `,
          notes: ['Rute baru otomatis TERBUKA', 'Satu yang lupa didaftarkan = celah'],
        },
        {
          title: 'Default tolak',
          lang: 'js',
          code: `
          const RUTE_PUBLIK = [
            '/health',
            '/api/masuk',
          ];

          if (!RUTE_PUBLIK.includes(req.path)) {
            periksaAuth(req);
          }
          `,
          notes: ['Rute baru otomatis TERLINDUNGI', 'Membuka akses harus disengaja'],
        },
      ),
      p(
        'Kedua kolom memakai struktur yang hampir sama, yaitu sebuah daftar dan sebuah `if`, dan hari ini keduanya berperilaku identik. Yang berbeda adalah **apa yang terjadi ketika seseorang lupa**. Pada kolom kiri, endpoint baru yang tidak didaftarkan ke `RUTE_TERLINDUNGI` langsung terbuka untuk siapa saja. Pada kolom kanan, endpoint baru yang tidak didaftarkan ke `RUTE_PUBLIK` justru ikut terlindungi.',
      ),
      p(
        'Perhatikan tanda `!` pada kolom kanan, sebab satu karakter itu yang membalik arah kelalaian. Kelupaan tetap akan terjadi, bukan karena orangnya ceroboh melainkan karena daftar seperti ini hidup jauh dari berkas tempat rute baru ditulis. Karena itu rancangannya harus membuat kelalaian **berujung pada penolakan** alih-alih pada keterbukaan. Kelalaian di kolom kanan menghasilkan keluhan "kenapa endpoint saya 401" yang ketahuan dalam hitungan menit, sedangkan kelalaian di kolom kiri menghasilkan kebocoran yang bisa tidak ketahuan berbulan-bulan.',
      ),
      callout(
        'danger',
        'Perbedaan dua kolom itu adalah perbedaan antara aman dan bocor',
        'Pada kolom kiri, setiap endpoint baru yang ditambahkan bulan depan terbuka sampai seseorang ingat mendaftarkannya. Pada kolom kanan, kelupaan menghasilkan endpoint yang tidak bisa diakses — merepotkan, tapi tidak berbahaya. **Kegagalan harus mengarah ke penolakan.**',
      ),

      h2('Menyembunyikan di UI bukan kontrol akses'),
      p(
        'Tombol yang tidak ditampilkan, menu yang disembunyikan, dan halaman yang tidak ditautkan **tidak menjaga apa pun**. Siapa pun bisa memanggil endpoint-nya langsung dengan `curl`. Antarmuka mengatur kenyamanan; server yang mengatur kewenangan.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Beda autentikasi dan otorisasi paling mudah dipahami lewat satu kebocoran yang benar-benar sering terjadi, yaitu aplikasi yang autentikasinya sempurna dan otorisasinya tidak ada sama sekali. Semua pengguna harus masuk, tidak ada yang bisa melewatinya, dan setiap pengguna tetap bisa membaca data siapa pun.',
      ),
      code(
        'text',
        `
        Dua pesanan di basis data:

          id   | pelanggan_id | total  | catatan
          -----+--------------+--------+------------------------------
          4211 |            7 | 890000 | Alamat Rina, Jl. Merdeka 12
          4212 |            9 | 125000 | Alamat Budi, Jl. Sudirman 4

        Budi (pelanggan_id 9) SUDAH LOGIN, lalu membuka /pesanan/4211:

          RENTAN : SELECT * FROM pesanan WHERE id = ?
                   -> {"id":4211,"pelanggan_id":7,"total":890000,
                       "catatan":"Alamat Rina, Jl. Merdeka 12"}

          AMAN   : SELECT * FROM pesanan WHERE id = ? AND pelanggan_id = ?
                   -> null   -> dijawab 404
        `,
        { caption: 'Dijalankan sungguhan dengan node:sqlite bawaan Node 26.5.0.' },
      ),
      p(
        'Budi berhasil melewati autentikasi, dan memang seharusnya begitu, sebab ia pengguna yang sah. Yang tidak ada adalah pertanyaan kedua, yaitu **apakah ia berhak atas baris ini**. Autentikasi menjawab "siapa kamu", otorisasi menjawab "boleh apa", dan yang pertama tidak pernah menyiratkan yang kedua.',
      ),
      p(
        'Perbedaan itu perlu ditegaskan karena ia menentukan letak kodenya. Autentikasi terjadi **sekali** di pintu masuk, sedangkan otorisasi harus terjadi **pada setiap sumber daya yang disentuh**. Satu middleware yang memeriksa token di depan semua rute sudah cukup untuk yang pertama, dan tidak menyumbang apa pun untuk yang kedua.',
      ),
      table(
        ['Pertanyaan', 'Autentikasi', 'Otorisasi'],
        [
          ['Menjawab apa', '"Siapa kamu?"', '"Boleh melakukan apa terhadap objek ini?"'],
          ['Kapan dijalankan', 'Sekali, di pintu masuk', 'Setiap kali sebuah sumber daya disentuh'],
          ['Di mana kodenya', 'Satu middleware di depan', 'Di lapisan data, ikut ke dalam query'],
          [
            'Gejala bila hilang',
            'Siapa pun bisa masuk',
            'Setiap yang masuk bisa membaca milik siapa pun',
          ],
          [
            'Terlihat saat pengujian biasa?',
            'Ya, langsung gagal',
            '**Tidak** — fiturnya bekerja sempurna',
          ],
        ],
      ),
      p(
        'Baris terakhir yang membuat kebocoran otorisasi bertahan lama. Halaman menampilkan data yang benar untuk pemiliknya, test lulus, dan tidak ada satu pun yang salah kecuali kalau ada yang iseng mengganti angka di alamat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan otorisasi tidak pernah menghasilkan error. Yang muncul justru **ketiadaan error** pada permintaan yang seharusnya ditolak. Karena itu satu-satunya cara mengetahuinya adalah mengujinya dengan sengaja.',
      ),
      code(
        'text',
        `
        Uji yang wajib ada untuk SETIAP endpoint yang mengembalikan data milik seseorang:

          1. login sebagai pengguna A
          2. buat satu sumber daya, catat id-nya
          3. login sebagai pengguna B
          4. buka sumber daya milik A dengan id itu
          5. HARUS 404 (atau 403), dan badan responsnya HARUS kosong dari data A

        Langkah 5 yang paling sering dilewatkan. Status 404 saja belum cukup —
        periksa juga bahwa tidak ada potongan data A di dalam responsnya.
        `,
      ),
      p(
        'Ada satu bentuk perbaikan yang terlihat benar dan sebenarnya tidak, yaitu memeriksa kepemilikan **setelah** datanya diambil.',
      ),
      code(
        'text',
        `
        const baris = ambil(4211);                       // tanpa syarat pemilik
        const boleh = baris.pelanggan_id === penggunaLogin;
        if (!boleh) return res.status(404).json({ error: 'Tidak ditemukan' });

        Yang benar-benar terjadi, diukur:

          data sudah TERBACA ke memori proses :
            {"id":4211,"pelanggan_id":7,"total":890000,"catatan":"Alamat...
          baru kemudian ditolak              : ditolak
        `,
        {
          caption:
            'Dijalankan sungguhan. Penolakannya benar, tapi datanya sudah keluar dari database.',
        },
      ),
      p(
        'Bentuk ini menutup satu jalur dan membiarkan yang lain terbuka. Data milik orang lain sudah berada di dalam proses, jadi ia bisa ikut masuk ke log, ke pesan error yang dicetak lengkap dengan objeknya, ke jejak tumpukan yang dikirim sistem pemantauan, atau ke respons yang lupa disaring pada satu cabang kode. Menaruh syarat kepemilikan **di dalam query** menutup semuanya sekaligus, sebab datanya tidak pernah keluar dari database.',
      ),
      p('Kesalahan ketiga yang sama seringnya adalah menganggap antarmuka sebagai kontrol akses.'),
      code(
        'ts',
        `
        // Ini BUKAN kontrol akses. Ia hanya kerapian tampilan.
        {pengguna.peran === 'admin' && <button onClick={hapusSemua}>Hapus semua</button>}

        // Yang bisa dilakukan siapa pun tanpa alat khusus:
        //   - memanggil endpointnya langsung dengan curl
        //   - menghapus kondisinya lewat DevTools, lalu mengeklik tombolnya
        //   - membaca bundel JavaScript dan menemukan seluruh alamat endpoint
        //
        // Bundel frontend SELALU bisa dibaca siapa pun. Tidak ada satu pun
        // keputusan keamanan yang boleh tinggal di sana.
        `,
        { caption: 'Menyembunyikan tombol menyembunyikan tombolnya, bukan kemampuannya.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hampir semua kesalahan di sini berasal dari satu asumsi yang tidak pernah diucapkan, yaitu bahwa pengguna yang sudah masuk adalah pengguna yang bisa dipercaya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memeriksa token di satu middleware lalu merasa selesai',
            'Semua rute sudah terlindungi',
            'Itu autentikasi. Setiap pengguna sah tetap bisa membaca data pengguna sah lainnya',
          ],
          [
            'Menyembunyikan tombol untuk peran tertentu',
            'Penggunanya tidak akan bisa mengaksesnya',
            'Endpointnya tetap bisa dipanggil langsung. Bundel frontend selalu terbaca',
          ],
          [
            'Memeriksa kepemilikan setelah data diambil',
            'Hasil akhirnya sama-sama ditolak',
            'Diuji sungguhan, datanya sudah masuk ke proses dan bisa bocor lewat log atau pesan error',
          ],
          [
            'Mengirim id pengguna dari klien',
            'Kliennya tahu siapa dirinya',
            'Klien bisa mengirim id siapa pun. Identitas hanya boleh berasal dari sesi atau token di server',
          ],
          [
            'Memberi izin secara bawaan, lalu menolak yang berbahaya',
            'Lebih sedikit yang harus ditulis',
            'Setiap endpoint baru otomatis terbuka. Bawaan harus menolak, izin diberikan eksplisit',
          ],
          [
            'Menguji hanya sebagai satu pengguna',
            'Fiturnya sudah jalan',
            'Kebocoran otorisasi hanya terlihat dengan dua akun. Uji A membuka milik B',
          ],
        ],
      ),
      p(
        'Baris keempat pantas ditegaskan karena bentuknya sangat mudah ditulis tanpa sadar. Sebuah endpoint yang menerima `pelangganId` dari badan permintaan atau dari query string menyerahkan keputusan identitas kepada pemanggil, dan pemanggil tidak pernah terikat aturan apa pun. Identitas pengguna hanya boleh dibaca dari sesi atau token yang sudah diverifikasi server, dan nilai itu tidak pernah boleh bisa ditimpa oleh apa pun yang dikirim klien.',
      ),
      references(
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Prinsip default deny dan pemeriksaan tingkat objek, langsung dari sumbernya.',
        },
        {
          label: 'OWASP Top 10 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'Kategori kerentanan nomor satu — dan kenapa ia hampir selalu soal otorisasi, bukan autentikasi.',
        },
        {
          label: '401 Unauthorized',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/401',
          source: 'MDN Web Docs',
          note: 'Termasuk catatan bahwa namanya menyesatkan — ia sebenarnya soal autentikasi.',
        },
        {
          label: '403 Forbidden',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/403',
          source: 'MDN Web Docs',
          note: 'Kapan `403` tepat, dan kapan `404` justru pilihan yang lebih aman.',
        },
      ),
    ],
  ),

  written(
    'hashing-password',
    'Hashing Password',
    18,
    'Menyimpan password sehingga database yang dicuri pun tidak membocorkannya.',
    [
      p(
        'Password tidak pernah disimpan. Yang disimpan adalah **hash**-nya — hasil fungsi satu arah yang tidak bisa dibalik. Kalau databasemu suatu hari bocor, hash yang benar membuat password penggunanya tetap aman.',
      ),

      terms(
        {
          term: 'hash',
          meaning:
            'Hasil fungsi **satu arah** yang tidak bisa dibalik. Password tidak pernah disimpan — yang disimpan hash-nya. Kalau databasemu suatu hari bocor, hash yang benar membuat password penggunanya tetap aman.',
        },
        {
          term: 'algoritma adaptif',
          meaning:
            'Algoritma yang **biayanya bisa dinaikkan** seiring perangkat keras makin cepat — argon2id, bcrypt, scrypt. Sifat itu yang membuat algoritma yang sama tetap relevan bertahun-tahun tanpa perlu diganti.',
        },
        {
          term: 'cepat = lemah',
          meaning:
            'Pembalikan intuisi yang penting. SHA-256 dirancang **cepat** — itu gunanya untuk memeriksa integritas berkas. Untuk password, kecepatan itu senjata penyerang: dengan GPU biasa, miliaran tebakan per detik. Algoritma password sengaja dibuat **lambat**.',
        },
        {
          term: 'argon2id',
          meaning:
            'Pilihan terbaik saat ini. Varian `id` menggabungkan ketahanan terhadap serangan GPU (banyak memori) dan terhadap serangan side-channel. Parameternya, yaitu `memoryCost`, `timeCost`, dan `parallelism`, yang menentukan biayanya.',
        },
        {
          term: 'bcrypt',
          meaning:
            'Sangat matang dan tersedia di mana-mana, dan menjadi default Laravel. Satu batasan yang harus diketahui, ia hanya membaca **72 byte pertama** password, jadi passphrase yang sangat panjang tidak menambah keamanan.',
        },
        {
          term: 'salt',
          meaning:
            'Nilai acak unik per password yang ikut di-hash. Karena setiap password punya salt berbeda, **dua pengguna dengan password identik menghasilkan hash berbeda** — dan rainbow table jadi tidak berguna. Ia sudah ditangani algoritmanya; jangan pernah membuatnya sendiri.',
        },
        {
          term: 'rainbow table',
          meaning:
            'Tabel berisi jutaan pasangan password–hash yang sudah dihitung sebelumnya. Ia mengubah pemecahan hash dari perhitungan jadi pencarian. Salt yang unik per password membuatnya tidak berguna sama sekali.',
        },
        {
          term: 'needsRehash',
          meaning:
            'Pemeriksaan apakah sebuah hash memakai biaya yang sudah usang. Polanya: hitung ulang **saat pengguna berhasil masuk** — satu-satunya waktu password aslinya tersedia. Perlahan seluruh basis pengguna terangkat ke biaya baru, tanpa ada yang perlu mengubah passwordnya.',
        },
        {
          term: 'perbandingan waktu-konstan',
          meaning:
            'Perbandingan yang waktunya **sama** berapa pun karakter yang cocok. `===` berhenti pada karakter pertama yang berbeda — selisih waktunya sangat kecil, tapi cukup untuk menebak token karakter demi karakter. Pakai `timingSafeEqual` untuk token dan kunci API.',
        },
      ),

      h2('Yang tidak boleh dipakai'),
      table(
        ['Cara', 'Kenapa gagal'],
        [
          ['Plain text', 'Tidak perlu penjelasan'],
          ['MD5, SHA-1', 'Rusak secara kriptografis, dan sangat cepat dihitung'],
          ['SHA-256 tanpa salt', 'GPU bisa mencoba miliaran per detik; rainbow table'],
          ['Enkripsi (bukan hash)', 'Bisa dibalik — kalau kuncinya ikut bocor, semua terbuka'],
          ['Skema buatan sendiri', 'Selalu lebih lemah daripada yang terlihat'],
        ],
      ),
      callout(
        'danger',
        'Cepat adalah kelemahan, bukan keunggulan',
        'SHA-256 dirancang untuk cepat — itulah gunanya untuk memeriksa integritas berkas. Untuk password, kecepatan itu justru senjata penyerang: dengan GPU biasa, miliaran tebakan per detik. Algoritma password sengaja dibuat **lambat**.',
      ),

      h2('Yang dipakai: algoritma adaptif'),
      table(
        ['Algoritma', 'Catatan'],
        [
          ['**argon2id**', 'Pilihan terbaik saat ini; tahan serangan GPU dan side-channel'],
          ['**bcrypt**', 'Sangat matang, tersedia di mana-mana; batas 72 byte'],
          ['**scrypt**', 'Baik; butuh banyak memori'],
        ],
      ),
      p(
        '"Adaptif" berarti biayanya bisa dinaikkan seiring perangkat keras makin cepat — sehingga algoritma yang sama tetap relevan bertahun-tahun.',
      ),

      h2('Node.js'),
      code(
        'js',
        `
        import argon2 from 'argon2';

        // Mendaftar
        const hash = await argon2.hash(kataSandi, {
          type: argon2.argon2id,
          memoryCost: 19456,   // 19 MiB
          timeCost: 2,
          parallelism: 1,
        });

        await db.query(
          'INSERT INTO pengguna (email, kata_sandi_hash) VALUES ($1, $2)',
          [email, hash],
        );

        // Masuk
        const cocok = await argon2.verify(pengguna.kata_sandi_hash, kataSandiDikirim);
        `,
      ),
      p(
        'Tiga opsi pada `argon2.hash` adalah biaya yang sengaja kamu bayar. `memoryCost: 19456` memaksa setiap perhitungan hash memakai 19 MiB memori — angka kecil bagi servermu yang menghitung satu hash per login, tetapi mematikan bagi penyerang yang ingin menghitung jutaan tebakan sekaligus di kartu grafis, karena memori jauh lebih sulit diperbanyak daripada inti pemroses. `timeCost: 2` menentukan berapa kali perhitungan diulang, dan `type: argon2id` memilih varian yang tahan terhadap dua jenis serangan sekaligus. Angka-angka itu mengikuti anjuran OWASP dan boleh dinaikkan seiring perangkat kerasmu makin cepat.',
      ),
      p(
        'Perhatikan pada bagian "Masuk" tidak ada perbandingan `===` sama sekali. Hash tidak bisa dibalik menjadi password aslinya, jadi yang dilakukan `argon2.verify` adalah membaca parameter yang tersimpan di dalam string hash, menghitung ulang dengan password yang baru dikirim, lalu membandingkan hasilnya secara waktu-konstan. Karena itu pula kamu tidak perlu menyimpan salt atau cost factor di kolom terpisah — semuanya sudah ada di dalam satu string hash, seperti yang dibedah beberapa bagian di bawah.',
      ),

      h2('Laravel'),
      code(
        'php',
        `
        use Illuminate\\Support\\Facades\\Hash;

        // Mendaftar — Laravel memakai bcrypt secara default,
        // bisa diganti ke argon2id lewat config/hashing.php
        $user = User::create([
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        // Masuk
        if (! Hash::check($request->input('password'), $user->password)) {
            // gagal
        }

        // Naikkan biaya secara bertahap saat pengguna berhasil masuk
        if (Hash::needsRehash($user->password)) {
            $user->update(['password' => Hash::make($request->input('password'))]);
        }
        `,
      ),
      p(
        'Laravel membungkus hal yang sama di balik dua pemanggilan. `Hash::make` menghasilkan hash beserta salt-nya, dan `Hash::check` memverifikasi tanpa pernah mengembalikan password aslinya — algoritmanya sendiri ditentukan di `config/hashing.php`, sehingga berpindah dari bcrypt ke argon2id tidak menyentuh satu baris pun kode ini. Perhatikan `$request->validated(...)` dipakai, bukan `$request->input(...)`: yang masuk ke database hanyalah field yang lolos aturan validasi, sehingga tidak ada kolom asing yang bisa menyelinap lewat body permintaan.',
      ),
      p(
        'Blok `needsRehash` menyelesaikan masalah yang muncul justru karena algoritmanya adaptif. Ketika kamu menaikkan cost factor, password lama tetap tersimpan dengan biaya lama, dan tidak ada cara menghitung ulangnya — servermu tidak menyimpan password aslinya. Satu-satunya saat password asli tersedia adalah **detik pengguna berhasil masuk**, dan di situlah blok ini bekerja. Perhatikan letaknya setelah `Hash::check` berhasil: perlahan seluruh basis penggunamu terangkat ke biaya baru tanpa seorang pun diminta mengganti passwordnya.',
      ),
      callout(
        'tip',
        '`needsRehash` menaikkan keamanan tanpa mengganggu siapa pun',
        'Saat kamu menaikkan cost factor, password lama tetap memakai biaya lama. Pola di atas menghitung ulang hash-nya saat pengguna berhasil masuk — satu-satunya waktu password aslinya tersedia. Perlahan seluruh basis pengguna terangkat ke biaya baru, tanpa ada yang perlu mengubah passwordnya.',
      ),

      h2('Salt sudah ditangani'),
      code(
        'text',
        `
        $argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
        └──┬───┘ └─┬─┘ └──────┬──────┘ └───┬────┘ └──────────────┬──────────────┘
        algoritma versi     parameter      SALT                 hash

        Salt ikut tersimpan di dalam string hash-nya.
        Jangan pernah membuat dan menyimpannya sendiri.
        `,
      ),
      p(
        'Karena salt-nya unik per password, dua pengguna dengan password identik menghasilkan hash yang berbeda — dan rainbow table jadi tidak berguna.',
      ),

      h2('Perbandingan waktu-konstan'),
      code(
        'js',
        `
        // SALAH untuk token: waktu perbandingannya bocor
        if (tokenDikirim === tokenTersimpan) { ... }

        // BENAR: waktunya sama berapa pun karakter yang cocok
        import { timingSafeEqual } from 'node:crypto';

        const a = Buffer.from(tokenDikirim);
        const b = Buffer.from(tokenTersimpan);
        const sah = a.length === b.length && timingSafeEqual(a, b);
        `,
      ),
      p(
        'Perbandingan `===` berhenti pada karakter pertama yang berbeda. Selisih waktunya sangat kecil, tapi cukup untuk menebak token karakter demi karakter. Fungsi `argon2.verify` dan `Hash::check` sudah waktu-konstan; yang perlu perhatianmu adalah token dan kunci API yang kamu bandingkan sendiri.',
      ),

      h2('Aturan password'),
      code(
        'js',
        `
        const SkemaKataSandi = z.string()
          .min(12, 'minimal 12 karakter')
          // Batas atas mencegah DoS: hashing string 10 MB memakan CPU sangat lama.
          .max(200, 'maksimal 200 karakter');
        `,
      ),
      p(
        'Perhatikan skema ini hanya berisi dua aturan, dan tidak satu pun menuntut huruf besar, angka, atau simbol. Itu disengaja dan sesuai anjuran OWASP terkini, sebab `.min(12)` mengejar **panjang** yang menaikkan jumlah kemungkinan jauh lebih cepat daripada aturan kerumitan. Aturan seperti "wajib ada simbol" justru mendorong orang menulis `P@ssw0rd!` yang sudah ada di setiap daftar tebakan. Batas atas `.max(200)` punya alasan yang sama sekali berbeda. Karena hashing sengaja dibuat mahal, string 10 MB yang dikirim berulang kali akan menghabiskan CPU servermu, jadi batas itu adalah pertahanan ketersediaan alih-alih pembatas kekuatan password.',
      ),
      ul(
        '**Panjang lebih penting daripada kerumitan.** Frasa 16 karakter lebih kuat daripada `P@ssw0rd!`.',
        '**Jangan larang karakter apa pun** — termasuk spasi dan emoji.',
        '**Periksa kebocoran** dengan Have I Been Pwned (`uncompromised()` di Laravel).',
        '**Batas atas tetap perlu**, karena hashing string raksasa adalah cara membebani CPU server.',
        '**Jangan paksa ganti berkala tanpa alasan** — praktik itu justru menghasilkan password yang lebih lemah.',
      ),
      callout(
        'danger',
        'Hash tidak boleh pernah keluar dari server',
        'Jangan pernah menyertakan kolom hash di respons API, di log, atau di pesan error. Ini alasan lain kenapa `SELECT *` yang langsung dikirim ke klien berbahaya — dan kenapa `$hidden` di model Laravel harus memuat `password`.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Alasan sandi tidak boleh di-hash dengan SHA-256 sering dijelaskan dengan kalimat "terlalu cepat", dan kalimat itu benar tapi tidak memberi gambaran seberapa. Berikut angkanya, diukur di satu mesin biasa.',
      ),
      code(
        'text',
        `
        HASH CEPAT — yang TIDAK boleh dipakai untuk sandi

          MD5                             0,0009 ms/hash    1.170.031 hash/detik
          SHA-1                           0,0008 ms/hash    1.212.523 hash/detik
          SHA-256                         0,0008 ms/hash    1.270.049 hash/detik
          SHA-256 + salt                  0,0008 ms/hash    1.228.039 hash/detik

        HASH ADAPTIF — yang memang dirancang untuk sandi

          scrypt N=2^14 (bawaan Node)    28,6949 ms/hash           35 hash/detik
          scrypt N=2^15                  69,3542 ms/hash           14 hash/detik
          scrypt N=2^16                 141,1268 ms/hash            7 hash/detik
          PBKDF2-SHA256 600.000 iterasi 102,1614 ms/hash           10 hash/detik
        `,
        { caption: 'Dijalankan sungguhan dengan node:crypto pada Node 26.5.0.' },
      ),
      p(
        'Selisih antara SHA-256 dan scrypt di mesin ini sekitar **36.000 kali**. Artinya, bila basis datamu bocor, penyerang yang memakai satu mesin biasa bisa menguji 1,27 juta tebakan per detik terhadap hash SHA-256, dan hanya 35 tebakan per detik terhadap hash scrypt. Dengan perangkat keras khusus, angka pertama naik berkali-kali lipat lagi sementara angka kedua naik jauh lebih sedikit, sebab scrypt sengaja dirancang boros memori.',
      ),
      p(
        'Baris keempat di tabel itu yang paling sering disalahpahami. Menambahkan salt ke SHA-256 **tidak memperlambat apa pun**, yaitu 1.228.039 melawan 1.270.049 hash per detik, selisihnya hanya derau pengukuran. Salt mengerjakan pekerjaan yang berbeda, yaitu memastikan dua orang bersandi sama menghasilkan hash berbeda sehingga tabel pelangi tidak bisa dipakai. Ia tidak pernah dimaksudkan untuk memperlambat penebakan, dan tidak melakukannya.',
      ),
      table(
        ['Yang dikerjakan', 'Salt', 'Faktor biaya (N, iterasi)'],
        [
          ['Menggagalkan tabel pelangi', 'Ya', 'Tidak'],
          ['Menggagalkan penebakan massal', 'Tidak', 'Ya'],
          ['Membuat dua sandi sama jadi hash berbeda', 'Ya', 'Tidak'],
          ['Bisa disimpan terbuka bersama hash-nya', 'Ya', 'Ya — memang harus'],
        ],
      ),
      p(
        'Bahwa salt boleh disimpan terbuka sering mengejutkan. Ia memang bukan rahasia, sebab tugasnya hanya membuat setiap hash unik. Yang harus dirahasiakan adalah sandi aslinya, dan itu tidak pernah disimpan di mana pun.',
      ),
      code(
        'ts',
        `
        import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

        // Faktor biayanya disimpan BERSAMA hash-nya, supaya sandi lama tetap bisa
        // diverifikasi ketika suatu hari faktornya dinaikkan.
        const OPSI = { N: 2 ** 14, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

        export function buatHash(sandi: string): string {
          const garam = randomBytes(16);
          const turunan = scryptSync(sandi, garam, 64, OPSI);
          return \`scrypt$\${OPSI.N}$\${garam.toString('hex')}$\${turunan.toString('hex')}\`;
        }

        export function cocok(sandi: string, tersimpan: string): boolean {
          const [, n, garamHex, hashHex] = tersimpan.split('$');
          const hash = Buffer.from(hashHex, 'hex');
          const uji = scryptSync(sandi, Buffer.from(garamHex, 'hex'), hash.length, {
            ...OPSI,
            N: Number(n),          // pakai N yang TERSIMPAN, bukan N yang sekarang
          });
          return timingSafeEqual(hash, uji);
        }
        `,
        {
          caption:
            'Menyimpan N di dalam string hash itu yang memungkinkan faktor biayanya dinaikkan belakangan.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Perbandingan hash punya satu jebakan yang menghasilkan error sungguhan, dan errornya justru berguna.',
      ),
      code(
        'text',
        `
        timingSafeEqual(Buffer.from('pendek'), Buffer.from('jauh-lebih-panjang'));

          RangeError: Input buffers must have the same byte length
        `,
        { caption: 'Dijalankan sungguhan dengan node:crypto.' },
      ),
      p(
        'Node menolak membandingkan dua buffer berbeda panjang karena perbandingan waktu-konstan memang tidak bisa dilakukan di situ, dan menyamarkannya akan memberi rasa aman palsu. Yang harus dilakukan adalah memeriksa panjangnya lebih dulu sebagai cabang terpisah, seperti pada fungsi `cocok` di atas.',
      ),
      p(
        'Perlu satu catatan jujur tentang perbandingan waktu-konstan di JavaScript, sebab pengukurannya tidak sepolos yang biasa diceritakan.',
      ),
      code(
        'text',
        `
        Membandingkan dua string 64 karakter dengan operator === :

          beda di karakter ke-1                         3,23 ns
          cocok 8 karakter pertama                      0,79 ns
          cocok 32 karakter pertama                     0,59 ns
          cocok 63 karakter pertama                     0,59 ns
          cocok SELURUHNYA                              0,62 ns

        timingSafeEqual pada masukan yang sama:

          beda di karakter ke-1                        70,87 ns
          cocok 63 karakter pertama                    71,02 ns
          cocok SELURUHNYA                             78,50 ns
        `,
        {
          caption:
            'Dijalankan sungguhan. Hasilnya TIDAK menunjukkan bocoran bertingkat yang biasa digambarkan.',
        },
      ),
      p(
        'Angka operator `===` di atas tidak naik seiring banyaknya karakter yang cocok, dan itu berlawanan dengan gambaran umum tentang perbandingan yang berhenti di karakter pertama yang berbeda. Penyebabnya, mesin JavaScript melakukan banyak hal di balik layar, mulai dari memeriksa panjang lebih dulu, menyamakan string identik menjadi satu objek, sampai membandingkan beberapa byte sekaligus. Jadi pada JavaScript, kamu **tidak bisa memperkirakan** apakah sebuah perbandingan bocor atau tidak.',
      ),
      p(
        'Ketidakpastian itulah alasan memakai `timingSafeEqual`, bukan bukti bahwa `===` pasti bocor. Perhatikan bahwa angka `timingSafeEqual` memang rata di ketiga kasus, yaitu 70,87 sampai 78,50 nanodetik, dan kerataan itulah yang dijaminnya. Untuk membandingkan hash sandi, token sesi, kunci API, dan tanda tangan webhook, jaminan yang bisa dipegang jauh lebih berharga daripada perilaku yang kebetulan aman hari ini dan bisa berubah pada pembaruan mesin JavaScript berikutnya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penyimpanan sandi adalah bagian yang paling mudah ditulis salah dengan kode yang terlihat sangat meyakinkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai SHA-256 dengan salt',
            'Sudah di-hash dan sudah di-salt',
            'Diukur, 1,2 juta tebakan per detik. Salt tidak memperlambat apa pun — pakai algoritma adaptif',
          ],
          [
            'Menambah putaran SHA-256 sendiri, misalnya sepuluh ribu kali',
            'Jadi lambat juga, kan',
            'Lambat di CPU biasa, tetap sangat cepat di perangkat keras khusus. Pakai yang memang dirancang untuk ini',
          ],
          [
            'Menyimpan salt di berkas konfigurasi, satu untuk semua',
            'Rahasianya jadi terjaga',
            'Salt tidak rahasia dan harus BERBEDA per pengguna. Yang satu untuk semua kehilangan seluruh gunanya',
          ],
          [
            'Membandingkan hash dengan `===`',
            'Sama-sama membandingkan string',
            'Diukur, perilaku waktunya tidak bisa diperkirakan di JavaScript. Pakai `timingSafeEqual`',
          ],
          [
            'Menyimpan faktor biaya di konfigurasi, bukan di hash-nya',
            'Satu tempat, lebih rapi',
            'Menaikkan faktornya membuat seluruh sandi lama tidak bisa diverifikasi lagi',
          ],
          [
            'Memaksa sandi rumit dan diganti tiap 90 hari',
            'Terdengar lebih aman',
            'Menghasilkan sandi yang ditulis di kertas dan pola `Sandi1!`, `Sandi2!`. Panjang minimum lebih berpengaruh',
          ],
        ],
      ),
      p(
        'Baris terakhir sudah berubah dari saran lama, dan perubahannya berdasar pengamatan atas perilaku manusia. Aturan yang mewajibkan huruf besar, angka, dan simbol menghasilkan sandi yang sulit diingat manusia tetapi tidak sulit ditebak mesin, sedangkan pemaksaan penggantian berkala menghasilkan variasi berurutan yang mudah diprediksi. Yang benar-benar berpengaruh adalah **panjang minimum yang layak**, menolak sandi yang sudah diketahui bocor, dan mewajibkan faktor kedua untuk akun berhak tinggi.',
      ),
      references(
        {
          label: 'Password Storage Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Parameter argon2id yang dianjurkan, beserta alasan setiap algoritma dipilih atau ditolak.',
        },
        {
          label: 'Authentication Cheat Sheet — Password Policy',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls',
          source: 'OWASP',
          note: 'Kenapa panjang mengalahkan kerumitan, dan kenapa ganti berkala justru melemahkan.',
        },
        {
          label: 'crypto.timingSafeEqual()',
          href: 'https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b',
          source: 'Node.js',
          note: 'Perbandingan waktu-konstan untuk token dan kunci API.',
        },
        {
          label: 'Laravel — Hashing',
          href: 'https://laravel.com/docs/12.x/hashing',
          source: 'Laravel',
          note: '`Hash::make`, `Hash::check`, dan pola `needsRehash` yang menaikkan biaya bertahap.',
        },
      ),
    ],
  ),

  written(
    'session-cookie',
    'Session-based Auth',
    20,
    'Autentikasi dengan sesi di server dan cookie di browser.',
    [
      p(
        'Pada session-based auth, server menyimpan data sesi dan browser hanya membawa **id**-nya di cookie. Ini pendekatan yang lebih tua, dan untuk aplikasi web biasa ia masih pilihan yang paling tepat.',
      ),

      terms(
        {
          term: 'session-based auth',
          meaning:
            'Server menyimpan **data sesi**, browser hanya membawa **id**-nya di cookie. Pendekatan yang lebih tua — dan untuk aplikasi web biasa, masih yang paling tepat.',
        },
        {
          term: 'cookie',
          meaning:
            'Nilai kecil yang disimpan browser dan **dikirim otomatis** di setiap permintaan ke domain itu. Sifat "otomatis" itu yang membuatnya nyaman, dan sekaligus yang melahirkan kebutuhan perlindungan CSRF.',
        },
        {
          term: 'HttpOnly',
          meaning:
            'Atribut yang membuat cookie **tidak bisa dibaca JavaScript sama sekali** — termasuk oleh skrip penyerang. Tanpa itu, satu celah XSS cukup untuk mencuri semua sesi lewat `document.cookie`. Ini alasan utama cookie lebih aman daripada `localStorage` untuk token sesi.',
        },
        {
          term: 'Secure',
          meaning:
            'Atribut yang membuat cookie hanya dikirim lewat **HTTPS**. Tanpa itu, cookie bisa terbaca siapa pun yang menyadap jaringan — misalnya di Wi-Fi publik.',
        },
        {
          term: 'SameSite',
          meaning:
            'Atribut yang mengatur apakah cookie ikut terkirim ketika permintaan datang **dari situs lain**. Nilai `Lax` memberi pertahanan **CSRF dasar**: situs jahat tidak bisa lagi memicu aksi mengubah data hanya karena cookie-nya otomatis ikut.',
        },
        {
          term: 'session fixation',
          meaning:
            'Penyerang memberi korban tautan berisi **id sesi yang ia tentukan sendiri**. Kalau id itu tidak berubah setelah login, penyerang kini memegang id sesi yang **sudah terautentikasi** sebagai korban.',
        },
        {
          term: 'regenerasi sesi',
          meaning:
            'Mengganti id sesi setelah login berhasil. Satu baris yang menutup session fixation **sepenuhnya** — dan yang paling sering lupa ditulis di implementasi buatan sendiri.',
        },
        {
          term: 'session store',
          meaning:
            'Tempat sesi disimpan — database atau Redis. Penyimpanan di **memori proses** hanya untuk pengembangan: ia hilang saat restart, dan dengan dua proses pengguna akan "logout sendiri" secara acak.',
        },
        {
          term: 'saveUninitialized: false',
          meaning:
            'Setelan yang mencegah sesi dibuat untuk pengunjung yang belum melakukan apa pun. Tanpa itu, setiap crawler dan setiap kunjungan sekali lewat meninggalkan baris sesi yang tidak pernah dipakai.',
        },
      ),

      h2('Alurnya'),
      code(
        'text',
        `
        1. POST /masuk  { email, kataSandi }
        2. Server verifikasi -> buat sesi -> simpan di DB/Redis
        3. Set-Cookie: sesi=<id acak>; HttpOnly; Secure; SameSite=Lax
        4. Browser menyimpannya, dan MENGIRIMNYA OTOMATIS di setiap permintaan
        5. Server mencari id itu -> dapat penggunanya
        `,
      ),
      p(
        'Perhatikan apa yang **tidak** ada di cookie pada langkah 3: tidak ada nama, tidak ada peran, tidak ada apa pun tentang penggunanya — hanya sebuah id acak. Itu inti model sesi. Semua data sesungguhnya tinggal di server (langkah 2), dan cookie hanyalah tiket bernomor untuk mengambilnya kembali. Karena isinya tidak bermakna apa-apa, mengubah isi cookie tidak memberi keuntungan apa pun bagi penyerang, dan mencabut sesi cukup dilakukan dengan menghapus barisnya di server.',
      ),
      p(
        'Langkah 4 adalah yang paling menentukan sifat model ini: browser mengirim cookie itu **otomatis**, tanpa kodemu perlu mengaturnya. Di satu sisi itu memudahkan — frontend tidak perlu menyimpan atau menyertakan token apa pun. Di sisi lain, "otomatis" berarti browser juga mengirimnya ketika permintaannya dipicu dari situs lain, dan dari situlah lahir kebutuhan perlindungan CSRF yang dibahas di bagian akhir sub-bab ini.',
      ),

      h2('Cookie yang benar'),
      code(
        'js',
        `
        res.cookie('sesi', idSesi, {
          httpOnly: true,     // JavaScript TIDAK BISA membacanya -> aman dari pencurian via XSS
          secure: true,       // hanya dikirim lewat HTTPS
          sameSite: 'lax',    // tidak ikut terkirim dari situs lain -> pertahanan CSRF dasar
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        `,
      ),
      p(
        "Keempat atribut itu bukan setelan opsional, sebab tanpa salah satunya cookie sesi berubah menjadi kerentanan. `httpOnly` menyembunyikan cookie dari JavaScript sepenuhnya, sehingga skrip penyerang yang berhasil masuk lewat XSS tidak bisa membacanya lewat `document.cookie`. `secure` menolak mengirimnya lewat koneksi HTTP biasa, menutup penyadapan di jaringan publik. `sameSite: 'lax'` membuat cookie tidak ikut terkirim pada permintaan yang dipicu dari situs lain, yaitu pertahanan CSRF dasar meski bukan satu-satunya lapisan.",
      ),
      p(
        '`maxAge` ditulis sebagai perkalian `7 * 24 * 60 * 60 * 1000` alih-alih angka `604800000` supaya bisa dibaca sebagai "tujuh hari" tanpa menghitung, dan satuannya milidetik di Express. Nilai ini juga keputusan keamanan alih-alih sekadar kenyamanan, sebab sesi yang tidak pernah kedaluwarsa berarti perangkat yang hilang tetap masuk selamanya. Perhatikan `secure: true` di sini ditulis mati, sedangkan pada kode nyata ia biasanya `env.isProduksi`, karena `localhost` tanpa HTTPS tidak akan menerima cookie yang bertanda `Secure`.',
      ),
      table(
        ['Atribut', 'Melindungi dari'],
        [
          ['`HttpOnly`', 'Pencurian cookie lewat XSS'],
          ['`Secure`', 'Penyadapan di jaringan tidak terenkripsi'],
          ['`SameSite=Lax`', 'CSRF pada sebagian besar kasus'],
          ['`maxAge`', 'Sesi yang berlaku selamanya'],
        ],
      ),
      callout(
        'danger',
        'Tanpa `HttpOnly`, satu celah XSS mencuri semua sesi',
        'Skrip apa pun yang berhasil berjalan di halamanmu bisa membaca `document.cookie` dan mengirimkannya ke penyerang. Dengan `HttpOnly`, cookie itu tidak terlihat oleh JavaScript sama sekali — termasuk oleh skrip penyerang. Ini alasan utama cookie lebih aman daripada `localStorage` untuk token sesi.',
      ),

      h2('Regenerasi id setelah login'),
      code(
        'js',
        `
        // WAJIB: cegah session fixation
        req.session.regenerate((err) => {
          if (err) return next(err);
          req.session.penggunaId = pengguna.id;
          res.json({ data: { id: pengguna.id, nama: pengguna.nama } });
        });
        `,
      ),
      p(
        'Urutan tiga baris di dalamnya adalah keseluruhan pelajaran di sini. `regenerate` dipanggil **lebih dulu**, dan `req.session.penggunaId` baru diisi setelah id sesinya berganti. Kalau dibalik, yaitu mengisi identitas ke sesi lama lalu meregenerasi, id yang sudah terautentikasi sempat ada sesaat, dan itulah yang ingin dicegah. Yang dilakukan `regenerate` adalah membuang id sesi lama sepenuhnya dan menerbitkan id baru yang belum pernah dilihat siapa pun.',
      ),
      p(
        'Perhatikan pula respons yang dikirim hanya berisi `id` dan `nama`. Baris ini adalah tempat yang sangat mudah tergelincir: menuliskan `res.json({ data: pengguna })` akan ikut mengirim `kata_sandi_hash` dan setiap kolom lain di tabel itu, persis kebocoran `SELECT *` yang dibahas di Bab 3. Sebutkan field yang keluar satu per satu, terutama pada endpoint autentikasi.',
      ),
      callout(
        'warning',
        'Session fixation',
        'Penyerang memberi korban tautan berisi id sesi yang ia tentukan sendiri. Kalau id itu tidak berubah setelah login, penyerang kini memegang id sesi yang **sudah terautentikasi** sebagai korban. Regenerasi setelah login menutupnya sepenuhnya.',
      ),

      h2('Menyimpan sesi'),
      code(
        'js',
        `
        import session from 'express-session';
        import { RedisStore } from 'connect-redis';

        app.use(session({
          // Penyimpanan di memori HANYA untuk pengembangan —
          // ia hilang saat restart dan tidak bekerja dengan banyak proses.
          store: new RedisStore({ client: redis }),
          secret: env.SESSION_SECRET,
          resave: false,
          saveUninitialized: false,
          cookie: { httpOnly: true, secure: env.isProduksi, sameSite: 'lax', maxAge: 604800000 },
        }));
        `,
      ),
      p(
        'Ini penerapan langsung prinsip stateless dari sub-bab 1.7: proses aplikasi tidak boleh menyimpan state. Dengan sesi di memori, menjalankan dua proses membuat pengguna "logout sendiri" secara acak.',
      ),

      h2('Laravel'),
      code(
        'php',
        `
        // Login — Laravel menangani regenerasi sesi
        if (Auth::attempt(['email' => $email, 'password' => $kataSandi], $ingatSaya)) {
            $request->session()->regenerate();
            return response()->json(['data' => ['id' => Auth::id()]]);
        }

        // Logout — cabut sesinya di server, bukan hanya hapus cookie
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        `,
      ),
      p(
        '`Auth::attempt` mengerjakan beberapa hal sekaligus, yaitu mencari pengguna dengan email tersebut, memverifikasi password lewat `Hash::check`, dan menandai sesinya sebagai terautentikasi. Perhatikan syaratnya ditulis sebagai satu array, sehingga password **tidak** dibandingkan manual di mana pun, sehingga tidak ada peluang seseorang keliru memakai `==` biasa. Baris `regenerate()` tepat setelahnya adalah pencegahan session fixation yang sama seperti pada contoh Node, dan Laravel tidak memanggilnya untukmu di jalur ini.',
      ),
      p(
        'Blok logout memperlihatkan tiga hal yang harus dilakukan bersama, dan inilah yang paling sering hanya dikerjakan separuh. `Auth::logout()` melepaskan penggunanya, `invalidate()` **menghapus sesinya di server** sehingga id lama tidak lagi bisa dipakai, dan `regenerateToken()` menerbitkan token CSRF baru. Logout yang hanya menghapus cookie di sisi klien tidak mencabut apa pun: siapa pun yang sempat menyalin id sesi itu tetap bisa memakainya.',
      ),

      h2('CSRF: konsekuensi memakai cookie'),
      p(
        'Browser mengirim cookie **otomatis** ke domain tujuan — termasuk saat permintaannya dipicu dari situs lain. Karena itu auth berbasis cookie butuh perlindungan kedua.',
      ),
      code(
        'html',
        `
        <!-- Di situs jahat. Browser korban tetap menyertakan cookie sesinya. -->
        <form action="https://bank.com/transfer" method="POST">
          <input name="tujuan" value="penyerang">
          <input name="jumlah" value="1000000">
        </form>
        <script>document.forms[0].submit()</script>
        `,
      ),
      p(
        'Perhatikan tidak ada yang dicuri di sini — penyerang tidak pernah membaca cookie korban, dan memang tidak bisa karena `HttpOnly`. Yang ia lakukan hanya **memicu permintaan** ke `bank.com`, dan browser korbanlah yang dengan patuh menyertakan cookie sesinya. Dari sudut pandang server bank, permintaan itu tampak sah sepenuhnya: cookie benar, sesi aktif, pengguna terautentikasi.',
      ),
      p(
        'Perhatikan pula `<script>` di baris terakhir mengirim formulir itu sendiri, sehingga korban tidak perlu mengklik apa pun dan cukup membuka halaman jahatnya. Inilah alasan `HttpOnly` dan `Secure` tidak cukup, sebab keduanya melindungi **isi** cookie dan bukan pemakaiannya. Yang menutup celah ini adalah sesuatu yang tidak dikirim browser secara otomatis, yaitu token anti-CSRF yang harus dibaca dari halaman aslinya, dan situs penyerang tidak punya cara mendapatkannya.',
      ),
      ul(
        '**Token anti-CSRF** — pola synchronizer atau double-submit. Laravel melakukannya otomatis untuk rute `web`.',
        '**`SameSite=Lax`** menutup sebagian besar kasus, tapi jangan dijadikan satu-satunya lapisan.',
        '**Verifikasi `Origin`/`Referer`** pada method yang mengubah state.',
        '**Aksi yang mengubah state tidak boleh lewat `GET`.**',
      ),
      callout(
        'info',
        'API murni token tidak butuh mesin CSRF',
        'Kalau autentikasimu memakai header `Authorization` tanpa cookie ambient, tidak ada yang bisa ditumpangi permintaan lintas situs — browser tidak menyertakan header itu secara otomatis. Jangan memasang token CSRF di tempat yang tidak punya cookie; fokuskan usaha pada endpoint yang memang memakai auth berbasis cookie.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Atribut cookie sering disalin dari contoh tanpa diketahui apa yang sebenarnya dilakukannya. Berikut pengukurannya, memakai server yang mengirim tiga cookie sekaligus dan peramban sungguhan yang membacanya.',
      ),
      code(
        'text',
        `
        Yang dikirim server:

          Set-Cookie: sesi=rahasia-abc123; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600
          Set-Cookie: tema=gelap; SameSite=Lax; Path=/; Max-Age=3600
          Set-Cookie: analitik=xyz; Path=/; Max-Age=3600

        Yang terlihat oleh JavaScript di halaman (document.cookie):

          tema=gelap
          analitik=xyz

        Yang DIKIRIM peramban kembali ke server pada permintaan berikutnya:

          sesi=rahasia-abc123; tema=gelap; analitik=xyz
        `,
        { caption: 'Dijalankan sungguhan: server Node 26.5.0, dibaca Chrome for Testing 149.' },
      ),
      p(
        'Dua daftar itu berbeda, dan perbedaannya persis satu baris. Cookie `sesi` **tidak terlihat sama sekali** oleh JavaScript di halaman, tetapi **tetap dikirim** ke server pada setiap permintaan. Itulah seluruh isi janji `HttpOnly`, dan ia menjawab satu ancaman yang sangat konkret.',
      ),
      p(
        'Ancamannya adalah XSS. Ketika penyerang berhasil menjalankan satu baris JavaScript di halamanmu, hal pertama yang dicarinya adalah `document.cookie`. Tanpa `HttpOnly`, satu baris itu cukup untuk mengambil sesi dan memakainya dari komputer mana pun. Dengan `HttpOnly`, token sesinya tidak pernah ada di tempat yang bisa dijangkau JavaScript.',
      ),
      table(
        ['Atribut', 'Yang dijaminnya', 'Ancaman yang ditutupnya'],
        [
          [
            '`HttpOnly`',
            'Tidak terlihat JavaScript, tetap dikirim ke server',
            'Pencurian sesi lewat XSS',
          ],
          [
            '`Secure`',
            'Hanya dikirim lewat HTTPS',
            'Penyadapan di jaringan yang tidak terenkripsi',
          ],
          [
            '`SameSite=Lax`',
            'Tidak ikut pada permintaan lintas-situs, kecuali navigasi biasa',
            'Sebagian besar bentuk CSRF',
          ],
          [
            '`SameSite=Strict`',
            'Tidak pernah ikut lintas-situs sama sekali',
            'CSRF, dengan biaya pengalaman pengguna',
          ],
          ['`Path`', 'Hanya dikirim pada jalur tertentu', 'Mengurangi tempat token beredar'],
          ['`Max-Age`', 'Kedaluwarsa otomatis di peramban', 'Sesi yang menggantung selamanya'],
        ],
      ),
      p(
        'Baris `SameSite=Strict` perlu penjelasan karena biayanya nyata. Dengan `Strict`, pengguna yang mengeklik tautan ke aplikasimu dari surel atau dari situs lain akan tiba dalam keadaan **belum masuk**, sebab cookie-nya tidak ikut pada navigasi itu. Untuk aplikasi biasa, `Lax` adalah titik yang tepat. `Strict` masuk akal untuk hal yang memang tidak pernah dituju dari luar, misalnya panel administrasi internal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan sesi jarang berupa error dan hampir selalu berupa perilaku yang salah. Yang paling berbahaya adalah **session fixation**, yaitu id sesi yang tidak berubah setelah login.',
      ),
      code(
        'text',
        `
        Alur serangannya, dan semua langkahnya adalah perilaku yang sah:

          1. penyerang membuka situsmu, menerima id sesi  A1B2C3
          2. penyerang mengirim korban tautan berisi id itu, misalnya lewat
             parameter yang diterima aplikasi, atau lewat subdomain yang
             bisa menulis cookie untuk domain induknya
          3. korban membuka tautannya, lalu LOGIN dengan sandinya sendiri
          4. server menandai sesi A1B2C3 sebagai "sudah login sebagai korban"
          5. penyerang memakai A1B2C3 yang sejak awal dipegangnya

        Tidak ada satu pun error di sepanjang alur itu.
        `,
      ),
      p(
        'Perbaikannya satu baris dan mudah dilupakan, yaitu **membuat id sesi baru tepat setelah login berhasil**. Setelah itu, id lama yang dipegang penyerang tidak lagi menunjuk apa pun.',
      ),
      code(
        'ts',
        `
        // Urutan yang benar, dan urutannya menentukan.
        async function login(req, res) {
          const pengguna = await periksaKredensial(req.body.email, req.body.sandi);
          if (!pengguna) return res.status(401).json({ error: 'Email atau sandi salah' });

          // 1. Buang id sesi LAMA sebelum menyimpan apa pun tentang pengguna.
          await sesi.regenerate(req);

          // 2. Baru setelah id-nya baru, tandai sebagai sudah login.
          req.sesi.penggunaId = pengguna.id;

          // 3. Hal yang sama berlaku saat KELUAR: hancurkan, jangan sekadar kosongkan.
          //    Mengosongkan isinya meninggalkan id yang masih sah.
          res.json({ ok: true });
        }

        async function logout(req, res) {
          await sesi.destroy(req);                  // BUKAN req.sesi = {}
          res.clearCookie('sesi', { path: '/' });
          res.status(204).end();
        }
        `,
        {
          caption:
            'Regenerasi setelah login dan penghancuran saat keluar adalah dua sisi dari satu aturan.',
        },
      ),
      p(
        'Kegagalan kedua muncul dari konsekuensi memakai cookie, yaitu **peramban mengirimkannya secara otomatis pada setiap permintaan ke domain itu**, termasuk permintaan yang dipicu situs lain. Itu tepat yang dimanfaatkan CSRF.',
      ),
      code(
        'text',
        `
        Halaman jahat yang dibuka korban di tab lain:

          <form action="https://bank.contoh.id/transfer" method="POST">
            <input name="ke" value="rekening-penyerang">
            <input name="jumlah" value="10000000">
          </form>
          <script>document.forms[0].submit()</script>

        Peramban korban mengirim formulir itu BESERTA cookie sesinya,
        sebab cookie memang dikirim otomatis ke domain tujuannya.
        Server melihat permintaan yang terautentikasi dengan sempurna.
        `,
      ),
      p(
        'Perlindungannya berlapis dan yang pertama sudah hampir cukup. `SameSite=Lax` membuat cookie tidak ikut pada pengiriman formulir lintas-situs seperti di atas, dan itu menutup bentuk yang paling umum. Lapisan keduanya adalah token anti-CSRF, yaitu nilai acak yang harus disertakan di badan atau header permintaan, dan yang tidak bisa dibaca situs lain karena terhalang aturan asal-sama.',
      ),
      p(
        'Satu catatan penting yang sering membuat orang memasang perlindungan di tempat yang salah. API yang autentikasinya memakai **header** `Authorization`, bukan cookie, secara alami tidak rentan CSRF, sebab situs lain tidak bisa membuat peramban korban mengirimkan header itu. Memasang token anti-CSRF di API seperti itu menambah kerumitan tanpa menutup apa pun.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sesi berbasis cookie punya banyak bagian kecil yang masing-masing sepele dan bersama-sama menentukan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan token sesi di `localStorage`',
            'Lebih mudah diakses dari JavaScript',
            'Justru itu masalahnya. Satu XSS langsung membacanya. Cookie `HttpOnly` tidak bisa dibaca sama sekali',
          ],
          [
            'Lupa `HttpOnly`',
            'Cookie-nya kan sudah acak',
            'Diukur, tanpa `HttpOnly` nilainya muncul di `document.cookie` dan satu baris XSS cukup mengambilnya',
          ],
          [
            'Tidak membuat id sesi baru setelah login',
            'Sesinya kan sudah ada',
            'Membuka session fixation. Id yang dipegang penyerang menjadi sesi korban setelah korban login',
          ],
          [
            'Logout dengan mengosongkan isi sesi',
            'Datanya sudah hilang',
            'Id-nya masih sah dan masih bisa dipakai. Hancurkan sesinya di penyimpanan',
          ],
          [
            'Menyimpan sesi di memori proses',
            'Paling cepat',
            'Restart menghapus semua sesi, dan beberapa proses tidak saling melihat. Pakai penyimpanan bersama',
          ],
          [
            'Memasang token anti-CSRF di API berbasis header',
            'Lebih aman kan',
            'API tanpa cookie tidak rentan CSRF. Perlindungannya menambah kerumitan tanpa menutup apa pun',
          ],
        ],
      ),
      p(
        'Baris pertama layak diperjelas karena `localStorage` sering dipilih justru untuk menghindari kerumitan cookie. Pertukarannya perlu dilihat apa adanya. Token di `localStorage` kebal CSRF tetapi terbuka penuh terhadap XSS, sedangkan cookie `HttpOnly` kebal terhadap XSS tetapi butuh perlindungan CSRF. Karena XSS jauh lebih sering ditemukan daripada CSRF pada aplikasi modern, dan karena `SameSite=Lax` sudah menutup sebagian besar CSRF tanpa kode tambahan, cookie `HttpOnly` biasanya pilihan yang lebih baik.',
      ),
      references(
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Atribut cookie, regenerasi id setelah login, dan masa berlaku sesi.',
        },
        {
          label: 'Set-Cookie',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie',
          source: 'MDN Web Docs',
          note: 'Arti setiap atribut: `HttpOnly`, `Secure`, `SameSite`, `Max-Age`.',
        },
        {
          label: 'Cross-Site Request Forgery Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk penegasan bahwa API murni token tidak butuh mesin CSRF.',
        },
        {
          label: 'Laravel — Authentication',
          href: 'https://laravel.com/docs/12.x/authentication',
          source: 'Laravel',
          note: '`Auth::attempt` dan regenerasi sesi yang sudah ditangani framework.',
        },
      ),
    ],
  ),

  written(
    'jwt',
    'Token-based Auth & JWT beserta batasnya',
    20,
    'Token bertanda tangan, kegunaannya, dan harga yang dibayar.',
    [
      p(
        'JWT membungkus identitas dalam token bertanda tangan yang bisa diverifikasi server **tanpa** query ke database. Itu kelebihannya. Harganya: token yang sudah terbit sulit dicabut — dan itu trade-off utamanya, bukan detail kecil.',
      ),

      terms(
        {
          term: 'JWT',
          meaning:
            'Singkatan *JSON Web Token*, dibaca "jot". Membungkus identitas dalam token **bertanda tangan** yang bisa diverifikasi server tanpa query ke database. Harganya: token yang sudah terbit **sulit dicabut** — dan itu trade-off utamanya, bukan detail kecil.',
        },
        {
          term: 'tiga bagian',
          meaning:
            'JWT terdiri dari **header . payload . tanda tangan**, dipisah titik. Header menyebut algoritmanya, payload memuat datanya, tanda tangan yang membuktikan keduanya tidak diubah.',
        },
        {
          term: 'payload bukan enkripsi',
          meaning:
            'Bagian tengah JWT adalah **base64, bukan enkripsi**. Siapa pun yang memegang token bisa membacanya dengan `base64 -d` — tanpa kunci apa pun. Jangan pernah menaruh password, hash, atau data pribadi di sana.',
        },
        {
          term: 'claim',
          meaning:
            'Field di dalam payload. Yang baku: `sub` (siapa), `exp` (kapan kedaluwarsa), `iat` (kapan dibuat), `iss` (siapa penerbitnya), `aud` (untuk siapa). Tiga yang terakhir yang membuat token tidak bisa dipakai lintas sistem.',
        },
        {
          term: 'algorithm confusion',
          meaning:
            'Serangan yang membatalkan seluruh perlindungan JWT. Tanpa allow-list algoritma, token bisa menyatakan `alg: none` dan diterima **tanpa tanda tangan**. Atau pada sistem RS256, penyerang mengubahnya jadi `HS256` dan menandatangani dengan **kunci publikmu** — yang memang terbuka.',
        },
        {
          term: 'decode vs verify',
          meaning:
            'Kesalahan yang namanya mirip dan akibatnya sangat berbeda. `jwt.decode()` hanya **membaca isinya tanpa memeriksa tanda tangan**. Kode yang memakainya lalu mempercayai `payload.peran` menerima siapa pun yang mengarang token sendiri.',
        },
        {
          term: 'masalah pencabutan',
          meaning:
            'Konsekuensi paling mahal JWT. Pengguna menekan "keluar" → token dihapus dari browser, tapi **masih sah di server** sampai `exp`. Password diganti karena akun dibajak → token lama penyerang **masih bekerja**. Peran diturunkan → token lama masih membawa peran admin.',
        },
        {
          term: 'deny-list',
          meaning:
            'Daftar token yang dicabut, biasanya di Redis. Ia menyelesaikan pencabutan — dengan harga: kamu kembali menyentuh penyimpanan di **setiap** permintaan, yang menghapus keunggulan utama JWT.',
        },
        {
          term: 'token_version',
          meaning:
            'Kolom angka di tabel pengguna yang dinaikkan saat logout atau ganti password; token yang versinya lebih rendah ditolak. Tetap butuh query, tapi jauh lebih ringan daripada deny-list — dan ia mencabut **semua** token sekaligus.',
        },
      ),

      h2('Bentuknya'),
      code(
        'text',
        `
        eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiI0MiIsImV4cCI6MTc1NDE1MDAwMH0 . SflKxwRJSM...
        └────── header ─────┘  └──────────── payload ────────────────┘  └ tanda tangan ┘

        { "alg": "HS256", "typ": "JWT" }
        { "sub": "42", "peran": "penulis", "iat": 1754146400, "exp": 1754150000 }
        `,
      ),
      p(
        'Sebuah JWT adalah tiga bagian yang dipisahkan titik, dan dua baris di bawah menunjukkan isi dua bagian pertama setelah di-base64-decode. Yang paling penting untuk dipahami: **base64 bukan enkripsi**, ia hanya cara menuliskan data agar aman dilewatkan URL. Siapa pun yang memegang token bisa membaca `sub` dan `peran` di dalamnya dengan satu perintah, tanpa kunci apa pun.',
      ),
      p(
        'Lalu apa yang dilindungi? Bagian ketiga, yaitu tanda tangannya. Ia dihitung dari header dan payload memakai kunci rahasia yang hanya dimiliki servermu, jadi mengubah `"peran": "penulis"` menjadi `"admin"` akan membuat tanda tangannya tidak lagi cocok dan token itu ditolak. Jadi JWT menjamin isinya **tidak bisa diubah**, bukan **tidak bisa dibaca**. Perhatikan `iat` dan `exp` berupa angka detik sejak 1970, dan selisih keduanya di contoh ini 3.600 detik alias masa berlaku satu jam.',
      ),
      callout(
        'danger',
        'Payload JWT itu base64, BUKAN enkripsi',
        'Siapa pun yang memegang token bisa membaca isinya dengan satu perintah `base64 -d` — tidak perlu kunci apa pun. Jangan pernah menaruh password, hash, data pribadi, atau apa pun yang tidak boleh dibaca pemegang token di dalam payload.',
      ),

      h2('Membuat dan memverifikasi'),
      code(
        'js',
        `
        import jwt from 'jsonwebtoken';

        // Membuat
        const token = jwt.sign(
          { sub: String(pengguna.id), peran: pengguna.peran },
          env.JWT_SECRET,
          { expiresIn: '15m', issuer: 'api-catatan', audience: 'web' },
        );

        // Memverifikasi
        try {
          const payload = jwt.verify(token, env.JWT_SECRET, {
            // WAJIB: daftar algoritma yang diizinkan secara eksplisit
            algorithms: ['HS256'],
            issuer: 'api-catatan',
            audience: 'web',
          });
        } catch {
          // Pesan generik — jangan bedakan kedaluwarsa, salah tanda tangan,
          // atau salah format. Semua itu informasi bagi penyerang.
          return res.status(401).json({ error: { pesan: 'Tidak terautentikasi' } });
        }
        `,
      ),
      p(
        "Perhatikan isi payload pada `sign` hanya `sub` dan `peran` — tidak ada email, nama, apalagi apa pun yang sensitif, sesuai sifat base64 tadi. `expiresIn: '15m'` menetapkan masa berlaku pendek karena JWT sulit dicabut: token yang bocor tetap sah sampai kedaluwarsa, jadi lima belas menit adalah batas kerugiannya. `issuer` dan `audience` menandai siapa yang menerbitkan dan untuk siapa token ini dimaksudkan, sehingga token dari sistem lain yang kebetulan memakai kunci sama tidak bisa dipakai lintas tempat.",
      ),
      p(
        "Baris `algorithms: ['HS256']` adalah satu-satunya baris yang kalau dihilangkan membuat seluruh perlindungan ini runtuh. Tanpa allow-list eksplisit, **token sendiri yang menentukan** algoritma verifikasinya lewat field `alg` di header — dan penyerang tinggal menuliskan `alg: none` untuk mengirim token tanpa tanda tangan sama sekali. Verifikasi juga memeriksa `issuer` dan `audience`, memakai nilai yang sama seperti saat penerbitan; kalau tidak diperiksa di sini, menuliskannya di `sign` tadi tidak ada gunanya.",
      ),
      p(
        'Blok `catch` sengaja menangkap **semua** kegagalan dan menjawab dengan satu pesan yang sama. Membedakan "token kedaluwarsa" dari "tanda tangan salah" terdengar membantu, tetapi keduanya memberi petunjuk berbeda kepada penyerang: yang pertama memberitahunya bahwa tebakannya pernah sah, yang kedua memberitahunya bahwa formatnya sudah benar dan tinggal kuncinya yang keliru. Simpan detailnya di log server, kirim yang generik ke klien.',
      ),

      h2('Tiga kesalahan yang membatalkan seluruh perlindungannya'),
      steps(
        {
          title: '1. Tidak membatasi algoritma',
          body: 'Tanpa opsi `algorithms`, token bisa menyatakan `alg: none` dan diterima tanpa tanda tangan sama sekali. Atau pada sistem RS256, penyerang mengubahnya jadi `HS256` lalu menandatangani dengan kunci publikmu, yang memang terbuka. Itu **algorithm confusion**. Selalu tulis allow-list-nya.',
        },
        {
          title: '2. Memakai `decode`, bukan `verify`',
          body: '`jwt.decode()` hanya membaca isinya **tanpa memeriksa tanda tangan**. Kode yang memakainya lalu mempercayai `payload.peran` menerima siapa pun yang mengarang token sendiri. Namanya mirip; akibatnya sangat berbeda.',
        },
        {
          title: '3. Tidak memverifikasi `exp`',
          body: 'Library umumnya melakukannya otomatis, tapi hanya kalau kamu memakai `verify`. Token tanpa masa berlaku, atau yang masa berlakunya tidak diperiksa, berlaku selamanya.',
        },
      ),

      h2('Masalah pencabutan'),
      code(
        'text',
        `
        Pengguna menekan "keluar"
          -> token dihapus dari browser
          -> tapi token itu MASIH SAH di server sampai exp

        Password diganti karena akun dibajak
          -> token lama penyerang MASIH BEKERJA

        Peran diturunkan dari admin
          -> token lama MASIH membawa peran admin
        `,
      ),
      p('Tiga jalan keluarnya, dari yang paling sederhana:'),
      ol(
        '**Umur sangat pendek** (5–15 menit) + refresh token — jendela penyalahgunaannya kecil. Ini pilihan yang paling umum, dibahas di sub-bab berikutnya.',
        '**Deny-list** di Redis — cepat, tapi berarti kamu kembali menyentuh penyimpanan di setiap permintaan, yang menghapus keunggulan utama JWT.',
        '**Kolom `token_version`** di tabel pengguna — dinaikkan saat logout/ganti password; token yang versinya lebih rendah ditolak. Tetap butuh query, tapi ringan.',
      ),

      h2('Di mana token disimpan di sisi klien'),
      table(
        ['Tempat', 'Rawan XSS', 'Rawan CSRF', 'Catatan'],
        [
          ['`localStorage`', '**Ya**', 'Tidak', 'Skrip apa pun bisa membacanya'],
          ['Memori JavaScript', 'Ya (lebih sempit)', 'Tidak', 'Hilang saat halaman dimuat ulang'],
          ['Cookie `HttpOnly`', '**Tidak**', 'Ya', 'Perlu perlindungan CSRF'],
        ],
      ),
      callout(
        'warning',
        '`localStorage` untuk token adalah pilihan yang sering disesali',
        'Satu celah XSS saja, entah dependency yang dibajak atau HTML tak tersanitasi, sudah cukup untuk membuat seluruh token pengguna dicuri. Cookie `HttpOnly` menutup jalur itu sepenuhnya, dengan konsekuensi kamu harus menangani CSRF. Untuk aplikasi web, itu pertukaran yang hampir selalu lebih baik.',
      ),

      h2('Kapan JWT, kapan sesi'),
      table(
        ['Pilih JWT kalau', 'Pilih sesi kalau'],
        [
          ['Banyak layanan perlu memverifikasi sendiri', 'Satu aplikasi web biasa'],
          ['Klien mobile atau pihak ketiga', 'Hanya browser'],
          ['Lintas domain', 'Satu domain'],
          ['Skala baca sangat tinggi', 'Pencabutan seketika penting'],
        ],
      ),
      callout(
        'tip',
        'Pilih karena kebutuhannya',
        'JWT sering dipilih karena terdengar modern, lalu tim menghabiskan waktu membangun ulang pencabutan yang sudah gratis pada sesi. Untuk aplikasi web satu domain, sesi biasanya lebih sederhana **dan** lebih aman.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Hal pertama yang harus dipahami tentang JWT bukan cara membuatnya melainkan **apa yang bisa dibaca siapa pun**. Berikut satu token sungguhan beserta isinya, dibongkar tanpa kunci apa pun.',
      ),
      code(
        'text',
        `
        Token:
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInBlcmFuIjoidXNlciIs...

        Dibongkar tanpa rahasia, tanpa alat khusus:
          header  : {"alg":"HS256","typ":"JWT"}
          payload : {"sub":"42","peran":"user","iat":1789367409,"exp":1789368309}
        `,
        {
          caption:
            'Dijalankan sungguhan dengan node:crypto. Cukup Buffer.from(bagian, "base64url").',
        },
      ),
      p(
        'Base64url adalah **pengkodean, bukan enkripsi**. Siapa pun yang memegang tokennya bisa membaca seluruh isinya, termasuk pengguna itu sendiri, termasuk setiap perantara yang pernah menyentuhnya. Tanda tangannya menjamin isi itu **tidak diubah**, dan sama sekali tidak menjamin isinya **tidak terbaca**.',
      ),
      p(
        'Konsekuensinya satu aturan yang tidak boleh ditawar, yaitu jangan pernah menaruh apa pun yang bersifat rahasia di dalam payload. Tidak ada nomor identitas, tidak ada alamat, tidak ada hasil pemeriksaan internal, dan tentu tidak ada kunci apa pun. Yang pantas ada di sana hanyalah identitas yang memang sudah diketahui pemiliknya beserta keterangan masa berlaku.',
      ),
      code(
        'ts',
        `
        // Verifikasi yang LENGKAP. Setiap baris menutup satu serangan nyata.
        function verifikasi(tok: string, algDiizinkan = ['HS256']) {
          const [hb, pb, sb] = tok.split('.');
          if (!hb || !pb || sb === undefined) throw new Error('Bentuk token tidak sah');

          const header = JSON.parse(Buffer.from(hb, 'base64url').toString());

          // 1. ALGORITMA DARI DAFTAR MILIK KITA, bukan dari header token.
          //    Header itu dikirim pemanggil dan bisa berisi apa saja.
          if (!algDiizinkan.includes(header.alg)) {
            throw new Error('Algoritma tidak diizinkan: ' + header.alg);
          }

          // 2. Tanda tangan dibandingkan dengan waktu-konstan.
          const harap = createHmac('sha256', RAHASIA).update(hb + '.' + pb).digest();
          const ada = Buffer.from(sb, 'base64url');
          if (harap.length !== ada.length || !timingSafeEqual(harap, ada)) {
            throw new Error('Tanda tangan tidak cocok');
          }

          // 3. Masa berlaku WAJIB ada dan WAJIB diperiksa.
          const payload = JSON.parse(Buffer.from(pb, 'base64url').toString());
          if (typeof payload.exp !== 'number') throw new Error('Klaim exp wajib ada');
          if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token kedaluwarsa');

          return payload;
        }
        `,
        { caption: 'Fungsi ini benar-benar dijalankan terhadap ketiga serangan di bawah.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Tiga serangan berikut dijalankan sungguhan terhadap dua versi verifikasi, yaitu versi lengkap di atas dan versi yang hanya **mengurai** payload tanpa memeriksa apa pun. Versi kedua itu bukan karangan, melainkan bentuk yang sering muncul ketika seseorang memakai fungsi `decode` alih-alih `verify`.',
      ),
      code(
        'text',
        `
        SERANGAN 1 — payload diubah, tanda tangan lama dibiarkan
          urai saja        -> peran = admin   <- LOLOS, jadi admin
          verifikasi penuh -> Tanda tangan tidak cocok

        SERANGAN 2 — alg diganti "none", tanda tangan diisi asal
          percaya header   -> LOLOS, peran = admin
          allow-list alg   -> Algoritma tidak diizinkan: none

        SERANGAN 3 — token ASLI yang sudah kedaluwarsa satu jam
          urai saja        -> peran = user    <- LOLOS
          verifikasi penuh -> Token kedaluwarsa
        `,
        { caption: 'Ketiganya dijalankan sungguhan dengan node:crypto pada Node 26.5.0.' },
      ),
      p(
        'Serangan kedua layak diperhatikan tersendiri karena ia menunjukkan kesalahan yang bentuknya sangat halus. Pustaka JWT yang membaca `alg` **dari dalam token** lalu memilih cara verifikasi berdasarkan nilai itu menyerahkan keputusan keamanan kepada pihak yang dicurigai. Yang benar adalah server menentukan sendiri algoritma yang diterimanya, dan menolak token apa pun yang menyebut algoritma lain.',
      ),
      p(
        'Bentuk lain dari serangan yang sama bernama **algorithm confusion**, dan ia lebih berbahaya lagi. Ketika sebuah sistem memakai kunci publik dan privat, penyerang bisa mengganti `alg` dari `RS256` menjadi `HS256`, lalu menandatangani token dengan **kunci publik** yang memang terbuka untuk siapa pun. Verifikasi yang percaya pada `alg` akan memeriksanya sebagai HMAC memakai kunci publik itu, dan tanda tangannya cocok.',
      ),
      p(
        'Serangan ketiga menunjukkan hal yang lebih sederhana dan sama seringnya, yaitu masa berlaku yang tidak pernah diperiksa. Token yang sudah lewat satu jam tetap dianggap sah, dan itu menghapus satu-satunya mekanisme pembatasan yang dimiliki JWT.',
      ),
      p(
        'Masa berlaku membawa persoalan yang melekat pada JWT dan tidak punya jawaban yang rapi, yaitu **pencabutan**.',
      ),
      code(
        'text',
        `
        Sesi (server menyimpan)          JWT (server tidak menyimpan)
        ---------------------------      ------------------------------------------
        Logout   : hapus barisnya        Logout   : tokennya TETAP SAH sampai exp
        Ganti     : hapus semua baris     Ganti    : token lama tetap bisa dipakai
          sandi     milik pengguna itu     sandi
        Blokir    : hapus barisnya        Blokir   : tetap bisa masuk sampai exp
          akun

        Jadi "logout" pada JWT murni hanya berarti klien MEMBUANG tokennya
        sendiri. Server tidak punya cara menolaknya.
        `,
      ),
      p(
        'Karena itu sistem nyata jarang memakai JWT murni. Yang lazim adalah token akses berumur sangat pendek, misalnya lima sampai lima belas menit, dipasangkan dengan refresh token yang **disimpan** di server sehingga bisa dicabut. Dengan begitu, jendela terburuk setelah pencabutan hanya selama sisa umur token akses.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'JWT terasa sederhana karena membuatnya sederhana. Yang tidak sederhana adalah memverifikasinya dengan benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai fungsi `decode`, bukan `verify`',
            'Sama-sama mengembalikan payload',
            'Diuji sungguhan, payload yang diubah penyerang lolos dan perannya menjadi admin',
          ],
          [
            'Menerima algoritma yang disebut di dalam token',
            'Tokennya kan menyebutkan sendiri',
            'Diuji sungguhan, `alg: none` lolos. Server harus punya daftar algoritma sendiri',
          ],
          [
            'Tidak memeriksa `exp`',
            'Tanda tangannya sudah benar',
            'Diuji sungguhan, token yang lewat satu jam tetap diterima. Masa berlaku wajib diperiksa',
          ],
          [
            'Menaruh data sensitif di payload',
            'Sudah ditandatangani',
            'Diuji sungguhan, payload terbaca tanpa kunci apa pun. Tanda tangan mencegah perubahan, bukan pembacaan',
          ],
          [
            'Memakai token akses berumur panjang supaya nyaman',
            'Pengguna tidak perlu login ulang',
            'Tidak ada cara mencabutnya. Logout dan blokir akun jadi tidak berlaku sampai masa berlakunya habis',
          ],
          [
            'Memakai JWT untuk sesi aplikasi web biasa',
            'Terdengar lebih modern',
            'Sesi berbasis cookie lebih sederhana dan bisa dicabut seketika. JWT unggul saat lintas-layanan',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas jadi penutup karena ia keputusan yang paling sering diambil dari alasan yang keliru. JWT lahir untuk kasus yang sangat spesifik, yaitu ketika penerima token **berbeda pihak** dengan penerbitnya, misalnya beberapa layanan yang perlu memverifikasi identitas tanpa menghubungi satu server pusat. Untuk satu aplikasi web dengan satu basis data, keunggulan itu tidak berlaku sama sekali, sementara seluruh kerumitannya tetap ada.',
      ),
      references(
        {
          label: 'RFC 7519 — JSON Web Token',
          href: 'https://www.rfc-editor.org/rfc/rfc7519.html',
          source: 'IETF',
          note: 'Spesifikasi resmi beserta arti setiap claim baku.',
        },
        {
          label: 'JSON Web Tokens — Introduction',
          href: 'https://jwt.io/introduction',
          source: 'jwt.io',
          note: 'Anatomi tiga bagian token, dan penegasan bahwa payload-nya tidak terenkripsi.',
        },
        {
          label: 'JSON Web Token Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Algorithm confusion, `alg: none`, dan strategi pencabutan.',
        },
        {
          label: 'RFC 8725 — JWT Best Current Practices',
          href: 'https://www.rfc-editor.org/rfc/rfc8725.html',
          source: 'IETF',
          note: 'Anjuran resmi memakai allow-list algoritma dan memverifikasi `iss`/`aud`.',
        },
      ),
    ],
  ),

  written(
    'refresh-token',
    'Refresh Token & Rotasi',
    19,
    'Memperpendek umur token tanpa memaksa pengguna login terus.',
    [
      p(
        'Token akses berumur pendek itu aman tapi merepotkan; berumur panjang itu nyaman tapi berbahaya. Refresh token memberi keduanya: akses pendek yang diperbarui diam-diam oleh token panjang yang lebih terjaga.',
      ),

      terms(
        {
          term: 'access token',
          meaning:
            'Token berumur **pendek** (5–15 menit) yang dikirim di setiap permintaan API. Umur pendeknya yang membatasi kerusakan: token yang dicuri hanya berguna sebentar.',
        },
        {
          term: 'refresh token',
          meaning:
            'Token berumur **panjang** (7–30 hari) yang **hanya** dipakai untuk meminta access token baru. Ia disimpan di server supaya bisa dicabut — sesuatu yang tidak bisa dilakukan pada access token.',
        },
        {
          term: 'rotasi',
          meaning:
            'Setiap kali refresh token dipakai, yang lama **dicabut** dan yang baru diterbitkan. Konsekuensinya: sebuah refresh token hanya sah **sekali**. Ini yang membuat deteksi pencurian jadi mungkin.',
        },
        {
          term: 'reuse detection',
          meaning:
            'Inti seluruh pola ini. Kalau refresh token dicuri, **dua pihak** memakainya. Begitu salah satu memakai token yang sudah dirotasi, server tahu ada penyalahgunaan. Tanpa deteksi ini, rotasi hanya menambah langkah tanpa menambah keamanan.',
        },
        {
          term: 'token family',
          meaning:
            'Rantai refresh token yang berasal dari satu login. Saat pemakaian ulang terdeteksi, **seluruh keluarga** dicabut sekaligus — korban terpaksa masuk lagi, penyerang kehilangan akses.',
        },
        {
          term: 'simpan hash-nya',
          meaning:
            'Refresh token disimpan sebagai **hash**, bukan apa adanya — sama seperti password. Kalau tabel token bocor, isinya tidak bisa langsung dipakai. Karena token sudah acak panjang, SHA-256 cukup di sini; tidak perlu algoritma adaptif.',
        },
        {
          term: 'randomBytes',
          meaning:
            'Pembangkit nilai acak **kriptografis** — bukan `Math.random()`, yang bisa diprediksi. 32 byte dalam bentuk `base64url` menghasilkan token yang tidak mungkin ditebak dan aman dipakai di URL maupun cookie.',
        },
        {
          term: 'path pada cookie',
          meaning:
            "Membatasi cookie ke satu endpoint — `path: '/api/refresh'`. Refresh token jadi **tidak ikut terkirim** pada ratusan permintaan API biasa, memperkecil peluangnya bocor lewat log, proxy, atau kesalahan konfigurasi.",
        },
        {
          term: 'SameSite=Strict',
          meaning:
            'Setelan paling ketat: cookie **tidak pernah** ikut pada permintaan yang datang dari situs lain. Cocok untuk refresh token, yang memang hanya dipakai aplikasimu sendiri — dan tidak cocok untuk cookie sesi yang perlu bertahan saat pengguna datang dari tautan luar.',
        },
      ),

      h2('Dua token'),
      table(
        ['', 'Access token', 'Refresh token'],
        [
          ['Umur', '5–15 menit', '7–30 hari'],
          ['Dipakai untuk', 'Setiap permintaan API', '**Hanya** meminta token baru'],
          ['Disimpan di', 'Memori klien', 'Cookie `HttpOnly`'],
          ['Disimpan di server', 'Tidak', '**Ya** — supaya bisa dicabut'],
        ],
      ),

      h2('Alurnya'),
      code(
        'text',
        `
        Masuk
          -> access (15 menit) + refresh (30 hari, disimpan di DB)

        Permintaan biasa
          -> pakai access

        Access kedaluwarsa -> 401
          -> POST /refresh dengan refresh token
          -> server: periksa, CABUT yang lama, terbitkan PASANGAN BARU
          -> ulangi permintaan tadi
        `,
      ),
      p(
        'Pola ini memisahkan dua token dengan sifat yang berlawanan, dan justru itu yang membuatnya bekerja. **Access token** berumur 15 menit dan dipakai di setiap permintaan. Karena sering berkeliaran, peluangnya bocor lebih besar, tetapi umur pendeknya membatasi kerugian. **Refresh token** berumur 30 hari dan hanya dipakai sesekali ke satu endpoint saja. Ia jarang berkeliaran, dan **disimpan di database** sehingga bisa dicabut kapan pun, tidak seperti JWT.',
      ),
      p(
        'Perhatikan langkah keempat: server tidak sekadar menerbitkan access token baru, tetapi juga **mencabut refresh token lama dan menerbitkan pasangan baru**. Itulah yang disebut rotasi, dan tanpa langkah pencabutan itu, refresh token yang pernah bocor akan terus berguna selama tiga puluh hari. Bagian "ulangi permintaan tadi" biasanya dikerjakan otomatis oleh interseptor di sisi klien, sehingga penggunanya tidak pernah melihat `401` yang sempat terjadi.',
      ),

      h2('Rotasi dan reuse detection'),
      code(
        'js',
        `
        export async function refresh(req, res) {
          const tokenLama = req.cookies.refresh;
          if (tokenLama === undefined) return res.status(401).json({ error: { pesan: 'Tidak sah' } });

          // Simpan HASH-nya, bukan tokennya — sama seperti password.
          const hash = sha256(tokenLama);
          const tersimpan = await db.cariRefreshToken(hash);

          if (tersimpan === null) {
            return res.status(401).json({ error: { pesan: 'Tidak sah' } });
          }

          // INI BAGIAN TERPENTING.
          // Token yang sudah dicabut muncul lagi = ia dicuri dan diputar ulang.
          if (tersimpan.dicabutPada !== null) {
            await db.cabutSeluruhKeluarga(tersimpan.keluargaId);
            log.warn({ penggunaId: tersimpan.penggunaId }, 'refresh token dipakai ulang — seluruh sesi dicabut');
            return res.status(401).json({ error: { pesan: 'Tidak sah' } });
          }

          if (tersimpan.kedaluwarsaPada < new Date()) {
            return res.status(401).json({ error: { pesan: 'Tidak sah' } });
          }

          // Rotasi: yang lama dicabut, yang baru diterbitkan.
          await db.cabutRefreshToken(tersimpan.id);

          const refreshBaru = crypto.randomBytes(32).toString('base64url');
          await db.simpanRefreshToken({
            hash: sha256(refreshBaru),
            penggunaId: tersimpan.penggunaId,
            keluargaId: tersimpan.keluargaId,   // rantai yang sama
            kedaluwarsaPada: new Date(Date.now() + 30 * 24 * 3600_000),
          });

          res.cookie('refresh', refreshBaru, {
            httpOnly: true, secure: true, sameSite: 'strict',
            path: '/api/refresh',              // dikirim HANYA ke endpoint ini
            maxAge: 30 * 24 * 3600_000,
          });

          res.json({ accessToken: buatAccessToken(tersimpan.penggunaId) });
        }
        `,
      ),
      p(
        'Baris `sha256(tokenLama)` di awal menerapkan prinsip yang sama seperti password: yang tersimpan di database adalah **hash**-nya, bukan tokennya. Kalau tabel itu bocor, penyerang hanya mendapat hash yang tidak bisa dipakai untuk apa pun. Perhatikan di sini SHA-256 cukup dan argon2 justru tidak tepat — token ini nilai acak 32 byte yang mustahil ditebak, jadi tidak butuh algoritma lambat yang dirancang melawan tebakan kamus.',
      ),
      p(
        'Blok bertanda "INI BAGIAN TERPENTING" adalah jantung pola ini. Pikirkan apa artinya sebuah token yang **sudah dicabut** muncul kembali. Token itu hanya dicabut setelah dipakai, jadi kemunculannya yang kedua berarti ada dua pihak yang memegangnya, yaitu pemiliknya dan pencurinya. Server tidak bisa tahu mana yang mana, jadi ia mengambil sikap paling aman dengan mencabut **seluruh keluarga** token itu lewat `keluargaId`. Korban terpaksa masuk ulang, penyerang kehilangan akses sepenuhnya. Tanpa langkah ini, rotasi hanya menambah kerumitan tanpa menambah keamanan.',
      ),
      p(
        "`keluargaId` yang diteruskan apa adanya ke token baru adalah yang membuat pencabutan itu mungkin: seluruh rantai rotasi sejak satu kali login membawa penanda yang sama, sehingga satu perintah cukup untuk memutus semuanya. Perhatikan pula cookie-nya memakai `sameSite: 'strict'` yang lebih ketat daripada `lax` pada cookie sesi biasa, dan `path: '/api/refresh'` yang membuat browser **hanya** mengirimkannya ke endpoint ini — bukan ke ratusan permintaan API lain tempat ia bisa tercatat di log atau proxy.",
      ),
      callout(
        'danger',
        'Reuse detection adalah inti dari pola ini',
        'Kalau refresh token dicuri, ada dua pihak yang memakainya. Begitu salah satu memakai token yang sudah dirotasi, server tahu ada penyalahgunaan — dan mencabut **seluruh keluarga** token itu. Korban terpaksa masuk lagi, penyerang kehilangan akses. Tanpa deteksi ini, rotasi hanya menambah langkah tanpa menambah keamanan.',
      ),

      h2('Kenapa `path` dibatasi'),
      p(
        "Dengan `path: '/api/refresh'`, browser hanya menyertakan refresh token pada permintaan ke endpoint itu. Ia tidak ikut terkirim pada ratusan permintaan API biasa — memperkecil peluang ia bocor lewat log, proxy, atau kesalahan konfigurasi.",
      ),

      h2('Kapan seluruh token harus dicabut'),
      ul(
        '**Keluar** — cabut refresh token yang dipakai.',
        '**Ganti password** — cabut **semua** sesi pengguna itu.',
        '**Perubahan peran atau izin** — token lama masih membawa peran lama.',
        '**Akun dinonaktifkan atau dihapus.**',
        '**Terreuse detection** — cabut seluruh keluarga.',
      ),
      code(
        'php',
        `
        // Laravel Sanctum
        $user->tokens()->delete();                        // semua perangkat
        $request->user()->currentAccessToken()->delete();  // perangkat ini saja
        `,
      ),
      p(
        'Dua baris ini adalah dua tombol yang berbeda, dan memilih yang salah terasa langsung oleh penggunanya. Baris pertama menghapus **semua** token milik pengguna itu, sehingga ia keluar dari setiap perangkat sekaligus, dan itulah yang harus dijalankan saat password diganti atau akun dicurigai dibajak. Baris kedua hanya menghapus token yang dipakai permintaan ini, yaitu tombol "keluar" biasa yang tidak mengganggu sesi di perangkat lain. Perhatikan keduanya menghapus baris **di database** alih-alih sekadar menyuruh klien membuang tokennya, dan itulah yang membedakan logout sungguhan dari logout yang hanya tampak.',
      ),

      h2('Kesalahan yang sering'),
      table(
        ['Kesalahan', 'Akibat'],
        [
          ['Refresh token tidak pernah berubah', 'Sekali bocor, berlaku sampai kedaluwarsa'],
          ['Token disimpan apa adanya, bukan hash-nya', 'Database bocor = semua sesi terbuka'],
          ['Logout hanya menghapus token di klien', 'Token masih sah di server'],
          ['Tidak ada reuse detection', 'Pencurian tidak pernah ketahuan'],
          ['Refresh token di `localStorage`', 'Bisa dicuri lewat XSS'],
        ],
      ),
      callout(
        'warning',
        'Simpan hash refresh token, bukan tokennya',
        'Alasannya sama persis dengan password: kalau tabel token bocor, penyerang mendapat hash yang tidak bisa dipakai. Karena refresh token adalah nilai acak berentropi tinggi, SHA-256 sudah cukup di sini — tidak perlu algoritma lambat seperti argon2.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Refresh token menjawab satu pertanyaan yang tidak punya jawaban baik pada JWT murni, yaitu bagaimana memberi pengguna sesi yang panjang tanpa memberi penyerang token yang sah berbulan-bulan. Jawabannya bukan memperpanjang masa berlaku melainkan **memutar tokennya**, dan yang membuat pola ini bekerja adalah bagian yang sering dilewatkan, yaitu deteksi pemakaian ulang.',
      ),
      code(
        'ts',
        `
        // Refresh token disimpan sebagai HASH, persis seperti sandi. Alasannya sama:
        // bocornya basis data tidak langsung berarti bocornya seluruh sesi.
        const hash = (t: string) => createHash('sha256').update(t).digest('hex');

        function tukar(token: string) {
          const rec = db.get(hash(token));
          if (!rec) return { ok: false, alasan: 'Token tidak dikenal' };
          if (keluargaDicabut.has(rec.keluarga)) {
            return { ok: false, alasan: 'Keluarga token sudah dicabut' };
          }

          // INTI POLANYA. Token yang SUDAH PERNAH dipakai berarti ada salinan
          // yang beredar — entah di tangan pengguna, entah di tangan pencuri.
          // Karena tidak ada cara membedakan keduanya, keduanya dicabut.
          if (rec.dipakai) {
            keluargaDicabut.add(rec.keluarga);
            return { ok: false, alasan: 'REUSE TERDETEKSI — seluruh keluarga token dicabut' };
          }

          rec.dipakai = true;
          return { ok: true, ...terbitkan(rec.penggunaId, rec.keluarga) };
        }
        `,
        { caption: 'Kode ini benar-benar dijalankan; hasil ketiga skenarionya ada di bawah.' },
      ),
      code(
        'text',
        `
        Alur normal — token diputar setiap kali dipakai:
          tukar ke-1: BERHASIL, token baru diterbitkan
          tukar ke-2: BERHASIL, token baru diterbitkan
          tukar ke-3: BERHASIL, token baru diterbitkan

        Penyerang memakai token ke-1 yang dicurinya sejak awal:
          penyerang : REUSE TERDETEKSI — seluruh keluarga token dicabut

        Akibatnya bagi pengguna yang SAH:
          pengguna  : Keluarga token sudah dicabut
        `,
        { caption: 'Dijalankan sungguhan dengan node:crypto pada Node 26.5.0.' },
      ),
      p(
        'Baris terakhir itu bukan cacat melainkan **harga yang memang dibayar**. Pengguna yang sah dipaksa login ulang, dan itu terjadi tepat ketika ada bukti bahwa tokennya beredar di dua tempat. Alternatifnya jauh lebih buruk, yaitu membiarkan penyerang ikut memegang sesi yang terus diperbarui selama berbulan-bulan tanpa satu pun tanda.',
      ),
      p(
        'Konsep **keluarga token** yang muncul di kode itu yang membuat pencabutannya menyeluruh. Setiap kali sebuah token ditukar, token penggantinya mewarisi penanda keluarga yang sama. Jadi satu deteksi pemakaian ulang mencabut seluruh rantai sejak login pertama, bukan hanya satu token.',
      ),
      table(
        ['Token akses', 'Refresh token'],
        [
          ['Umur 5–15 menit', 'Umur berhari-hari sampai berminggu-minggu'],
          ['Dikirim pada SETIAP permintaan', 'Dikirim HANYA ke endpoint pembaruan'],
          ['Tidak disimpan server (bila JWT)', '**Wajib** disimpan server, sebagai hash'],
          ['Tidak bisa dicabut', 'Bisa dicabut seketika'],
          ['Boleh di memori aplikasi klien', 'Cookie `HttpOnly` dengan `Path` dibatasi'],
        ],
      ),
      p(
        'Baris terakhir memuat detail yang sering dianggap kosmetik. Membatasi `Path` refresh token ke endpoint pembaruannya saja berarti peramban **tidak mengirimkannya** pada permintaan biasa. Dengan begitu, token yang paling berharga tidak ikut melintas ratusan kali sehari, dan tidak ikut tercatat di log perantara mana pun.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pola ini punya satu kegagalan yang muncul justru pada aplikasi yang berjalan normal, dan penyebabnya bukan penyerang melainkan **beberapa permintaan yang berjalan bersamaan**.',
      ),
      code(
        'text',
        `
        Aplikasi memuat tiga bagian halaman sekaligus. Token akses baru kedaluwarsa.

          permintaan A  -> 401  -> memanggil /refresh dengan token R1
          permintaan B  -> 401  -> memanggil /refresh dengan token R1   (bersamaan)
          permintaan C  -> 401  -> memanggil /refresh dengan token R1   (bersamaan)

        Yang terjadi:
          A berhasil, R1 ditandai dipakai, R2 diterbitkan
          B memakai R1 yang SUDAH dipakai  -> REUSE TERDETEKSI
          C sama                           -> seluruh keluarga dicabut

        Pengguna yang tidak melakukan apa-apa tiba-tiba terlempar ke halaman login.
        `,
      ),
      p(
        'Ini bug nyata yang sering dilaporkan sebagai "kadang tiba-tiba logout sendiri", dan penyebabnya bukan keamanan melainkan perlombaan. Perbaikannya ada di dua sisi, dan keduanya diperlukan.',
      ),
      code(
        'ts',
        `
        // SISI KLIEN — hanya satu pembaruan yang boleh berjalan pada satu waktu.
        let pembaruanBerjalan: Promise<string> | null = null;

        async function ambilTokenSegar(): Promise<string> {
          // Permintaan kedua dan ketiga IKUT menunggu promise yang sama,
          // alih-alih memanggil /refresh lagi.
          pembaruanBerjalan ??= panggilRefresh().finally(() => {
            pembaruanBerjalan = null;
          });
          return pembaruanBerjalan;
        }

        // SISI SERVER — beri tenggang singkat untuk token yang BARU SAJA ditukar,
        // supaya permintaan yang terlanjur terkirim tidak dianggap serangan.
        const TENGGANG_DETIK = 10;

        if (rec.dipakai) {
          const usiaPemakaian = (Date.now() - rec.dipakaiPada) / 1000;
          if (usiaPemakaian <= TENGGANG_DETIK && rec.penggantiToken) {
            // Kembalikan token pengganti yang SAMA, jangan terbitkan yang baru.
            return { ok: true, token: rec.penggantiToken };
          }
          keluargaDicabut.add(rec.keluarga);
          return { ok: false, alasan: 'REUSE TERDETEKSI' };
        }
        `,
        {
          caption:
            'Tenggang sepuluh detik itu pertukaran sadar: sedikit longgar, ditukar dengan logout palsu yang hilang.',
        },
      ),
      p(
        'Perlu disebut jujur bahwa tenggang itu **melonggarkan** deteksi. Penyerang yang memakai token curian dalam sepuluh detik pertama setelah pemiliknya menukarkannya tidak akan terdeteksi. Pertukarannya masuk akal karena jendela sepuluh detik itu sangat sempit, sedangkan logout palsu yang dihasilkan tanpa tenggang terjadi setiap hari dan membuat pengguna kehilangan kepercayaan.',
      ),
      p(
        'Kelompok kegagalan kedua adalah pencabutan yang tidak lengkap. Ada beberapa peristiwa yang **wajib** mencabut seluruh token seorang pengguna, dan melewatkan satu saja meninggalkan lubang.',
      ),
      code(
        'text',
        `
        Peristiwa yang WAJIB mencabut seluruh refresh token milik pengguna:

          ganti sandi          -> yang paling sering dilupakan, dan paling penting:
                                  orang mengganti sandi TEPAT KARENA curiga dibobol
          keluar dari semua perangkat
          akun dinonaktifkan atau dihapus
          peran atau izin berubah   -> token lama membawa izin lama
          deteksi pemakaian ulang   -> seluruh keluarga

        Ganti sandi yang TIDAK mencabut sesi lain berarti penyerang tetap
        memegang sesinya, dan korban merasa sudah aman.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pola dua token mudah dipasang setengah, dan setengahnya sering justru bagian yang memberi perlindungannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memutar token tanpa deteksi pemakaian ulang',
            'Tokennya sudah berganti-ganti',
            'Rotasi tanpa deteksi hampir tidak menambah apa pun. Yang memberi perlindungan adalah deteksinya',
          ],
          [
            'Menyimpan refresh token apa adanya di basis data',
            'Bukan sandi, kan',
            'Bocornya basis data langsung berarti bocornya seluruh sesi. Simpan hash-nya, seperti sandi',
          ],
          [
            'Tidak mencabut sesi lain saat sandi diganti',
            'Sandinya sudah diganti',
            'Penyerang tetap memegang sesinya. Orang mengganti sandi justru karena curiga dibobol',
          ],
          [
            'Membiarkan beberapa permintaan memanggil `/refresh` bersamaan',
            'Masing-masing memang butuh token',
            'Diuraikan di atas, deteksi reuse ikut terpicu dan pengguna sah terlempar ke login',
          ],
          [
            'Memberi refresh token masa berlaku sangat panjang tanpa batas mutlak',
            'Pengguna tidak perlu login ulang',
            'Sesi yang bisa diperpanjang selamanya tidak pernah berakhir. Beri batas mutlak sejak login pertama',
          ],
          [
            'Mengirim refresh token pada setiap permintaan',
            'Sekalian saja',
            'Token paling berharga jadi melintas ratusan kali sehari. Batasi dengan `Path`',
          ],
        ],
      ),
      p(
        'Baris kelima memuat perbedaan yang layak dipegang, yaitu antara masa berlaku yang **bergulir** dan batas **mutlak**. Masa berlaku bergulir memperpanjang sesi setiap kali dipakai, dan tanpa batas mutlak ia berarti sesi yang tidak pernah berakhir selama penggunanya aktif. Batas mutlak sejak login pertama, misalnya tiga puluh hari, memastikan setiap sesi punya akhir yang pasti, berapa pun seringnya dipakai.',
      ),
      references(
        {
          label: 'RFC 6749 §1.5 — Refresh Token',
          href: 'https://www.rfc-editor.org/rfc/rfc6749.html#section-1.5',
          source: 'IETF',
          note: 'Definisi resmi peran refresh token dalam alur OAuth 2.0.',
        },
        {
          label: 'OAuth 2.0 Security Best Current Practice — token rotation',
          href: 'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics',
          source: 'IETF',
          note: 'Anjuran rotasi beserta reuse detection, langsung dari sumbernya.',
        },
        {
          label: 'crypto.randomBytes()',
          href: 'https://nodejs.org/api/crypto.html#cryptorandombytessize-callback',
          source: 'Node.js',
          note: 'Pembangkit acak kriptografis — bukan `Math.random()`, yang bisa diprediksi.',
        },
        {
          label: 'Session Management — token storage',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa `HttpOnly` cookie lebih aman daripada `localStorage` untuk refresh token.',
        },
      ),
    ],
  ),

  written(
    'otorisasi-role-policy',
    'Otorisasi: role, permission, policy',
    19,
    'Menyusun aturan "siapa boleh apa" supaya tetap terkelola.',
    [
      terms(
        {
          term: 'peran (role)',
          meaning:
            'Label yang menempel pada pengguna — `admin`, `editor`, `pengguna`. Ia jawaban paling sederhana untuk otorisasi, dan cukup sampai aturannya mulai berkembang.',
        },
        {
          term: 'izin (permission)',
          meaning:
            'Kata kerja yang menyatakan satu aksi — `catatan.terbitkan`, `pengguna.kelola`. Peran menjadi **kumpulan izin**. Bedanya menentukan: izin tidak berubah saat struktur peran berubah.',
        },
        {
          term: 'periksa izin, bukan peran',
          meaning:
            "Aturan praktis yang menyelamatkan banyak waktu. `if (user.peran === 'admin')` yang tersebar di puluhan tempat akan menyakitkan begitu ada peran baru `supervisor` yang butuh sebagian hak admin. Memeriksa izin membuat perubahan cukup di satu tabel.",
        },
        {
          term: 'policy',
          meaning:
            'Aturan yang menjawab pertanyaan **per objek**. Peran menjawab "boleh menerbitkan artikel?"; policy menjawab "boleh menerbitkan artikel **ini**?". Sebagian besar aplikasi butuh keduanya sekaligus.',
        },
        {
          term: 'RBAC',
          meaning:
            'Singkatan *Role-Based Access Control* — model otorisasi berbasis peran. Ia titik awal yang wajar, dan mulai terasa sempit begitu kewenangan bergantung pada **hubungan** antara pengguna dan objeknya, bukan hanya pada labelnya.',
        },
        {
          term: 'before()',
          meaning:
            'Metode Laravel Policy yang dijalankan **sebelum** metode lain. Mengembalikan `true` meloloskan semuanya, `null` melanjutkan ke pemeriksaan biasa. Mengembalikan **`false` menolak setiap pemeriksaan**, termasuk yang seharusnya lolos — kesalahan yang menghasilkan "admin tidak bisa apa-apa".',
        },
        {
          term: 'otorisasi di lapisan query',
          meaning:
            'Policy saja **tidak cukup untuk daftar**. `SELECT * FROM catatan LIMIT 20` mengembalikan milik semua orang, dan tidak ada policy yang dipanggil. Scope kepemilikan harus ikut di `WHERE`.',
        },
        {
          term: 'catat penolakan otorisasi',
          meaning:
            'Setiap `403` yang terjadi layak dicatat sebagai **peristiwa keamanan**. Lonjakan penolakan dari satu pengguna adalah tanda seseorang sedang memetakan apa yang bisa ia sentuh — sinyal yang hilang kalau tidak dicatat.',
        },
        {
          term: 'jangan taruh peran di JWT tanpa rencana',
          meaning:
            'Peran yang ikut di dalam token **tidak berubah** sampai token itu kedaluwarsa. Menurunkan hak seseorang tidak langsung berlaku — dan itu persis masalah pencabutan dari sub-bab 5.4, muncul lagi di bentuk lain.',
        },
      ),

      h2('Tiga tingkat kerumitan'),
      table(
        ['Model', 'Cocok untuk', 'Contoh'],
        [
          ['**Peran** saja', 'Aturan sederhana', '`admin`, `editor`, `pengguna`'],
          ['**Peran + izin**', 'Aturan berkembang', '`editor` punya `artikel.terbitkan`'],
          ['**Policy per objek**', 'Kepemilikan', '"boleh, kalau ini catatanmu"'],
        ],
      ),
      p(
        'Sebagian besar aplikasi butuh dua yang terakhir sekaligus: peran menentukan **jenis** aksi yang boleh, policy menentukan **objek** mana yang boleh disentuh.',
      ),

      h2('Peran + izin'),
      code(
        'js',
        `
        // Izin adalah kata kerja; peran adalah kumpulan izin.
        // Kode memeriksa IZIN, bukan peran — supaya peran bisa diubah
        // tanpa menyentuh satu pun pemeriksaan.
        const IZIN_PER_PERAN = {
          pengguna: ['catatan.baca', 'catatan.tulis'],
          editor: ['catatan.baca', 'catatan.tulis', 'catatan.terbitkan'],
          admin: ['catatan.baca', 'catatan.tulis', 'catatan.terbitkan', 'pengguna.kelola'],
        };

        export function wajibIzin(izin) {
          return (req, res, next) => {
            const dimiliki = IZIN_PER_PERAN[req.pengguna.peran] ?? [];

            if (!dimiliki.includes(izin)) {
              log.warn({ penggunaId: req.pengguna.id, izin }, 'otorisasi ditolak');
              return res.status(403).json({ error: { kode: 'TIDAK_BERWENANG', pesan: 'Tidak berwenang' } });
            }

            next();
          };
        }

        router.post('/:id/terbitkan', autentikasi, wajibIzin('catatan.terbitkan'), controller.terbitkan);
        `,
      ),
      p(
        "Perhatikan `wajibIzin` menerima **nama izin**, bukan nama peran, dan pemetaan peran-ke-izin tinggal di satu tabel di atasnya. Bedanya terasa ketika ada peran baru: menambahkan `supervisor` dengan sebagian hak admin cukup menambah satu baris di `IZIN_PER_PERAN`, tanpa menyentuh satu pun berkas rute. Sebaliknya, kode yang menyebar `if (peran === 'admin')` ke puluhan tempat menuntut kamu menemukan dan mengubah semuanya — dan satu yang terlewat adalah celah atau bug.",
      ),
      p(
        'Dua detail kecilnya penting. `?? []` menangani peran yang tidak dikenal dengan **daftar izin kosong**, sehingga nilai peran yang aneh berujung penolakan alih-alih error, dan sekali lagi kelalaian harus mengarah ke penolakan. Dan `log.warn` mencatat setiap penolakan berikut siapa serta izin apa yang diminta. Satu penolakan itu wajar, tetapi puluhan dari satu akun dalam semenit adalah seseorang yang sedang memetakan apa yang bisa ia sentuh. Perhatikan pula status yang dipakai `403` dan bukan `401`, sebab penggunanya sudah terbukti siapa dan hanya memang tidak berwenang.',
      ),
      callout(
        'tip',
        'Periksa izin, bukan peran',
        "Kode yang menulis `if (user.peran === 'admin')` tersebar di puluhan tempat akan menyakitkan begitu ada peran baru `supervisor` yang butuh sebagian hak admin. Memeriksa izin membuat perubahan peran cukup dilakukan di satu tabel.",
      ),

      h2('Policy per objek'),
      code(
        'js',
        `
        // Peran menjawab "boleh menerbitkan artikel?"
        // Policy menjawab "boleh menerbitkan artikel INI?"
        export function bolehUbahCatatan(pengguna, catatan) {
          if (catatan.penulisId === pengguna.id) return true;
          if (pengguna.peran === 'admin') return true;
          return false;
        }
        `,
      ),
      p(
        'Dua komentar di atas fungsi ini menjelaskan perbedaan yang sering kabur. Izin menjawab pertanyaan **umum** seperti "peran ini boleh menerbitkan artikel?", sedangkan policy menjawab pertanyaan **tentang satu objek tertentu** seperti "boleh menerbitkan artikel ini?". Keduanya diperlukan bersama, sebab seorang editor punya izin `catatan.terbitkan`, tetapi itu tidak berarti ia boleh menerbitkan draf milik orang lain. Perhatikan fungsinya menerima **dua** argumen, pengguna dan catatannya, dan justru argumen kedua itulah yang membedakannya dari pemeriksaan izin biasa.',
      ),
      code(
        'php',
        `
        // Laravel Policy
        final class CatatanPolicy
        {
            // Dijalankan SEBELUM method lain. Mengembalikan null = lanjut ke pemeriksaan biasa.
            public function before(User $user): ?bool
            {
                return $user->peran === 'admin' ? true : null;
            }

            public function view(User $user, Catatan $catatan): bool
            {
                return $catatan->penulis_id === $user->id;
            }

            public function terbitkan(User $user, Catatan $catatan): bool
            {
                return $catatan->penulis_id === $user->id
                    && $user->punyaIzin('catatan.terbitkan');
            }
        }
        `,
      ),
      p(
        'Laravel membungkus pola yang sama dalam sebuah kelas, satu method per aksi. Bagian yang paling mudah salah adalah `before()`, dan tipe kembaliannya `?bool` sudah memberi petunjuk bahwa ia punya **tiga** kemungkinan alih-alih dua. `true` meloloskan semuanya, `false` **menolak** semuanya termasuk yang seharusnya lolos, sedangkan `null` berarti "saya tidak memutuskan, lanjutkan ke method biasa". Kode di atas mengembalikan `null` untuk non-admin, sehingga pemeriksaan kepemilikan di bawahnya tetap berjalan. Menuliskan `return $user->peran === \'admin\';` di situ akan menghasilkan `false` untuk semua orang lain dan mematikan seluruh policy-nya.',
      ),
      p(
        'Perhatikan pula `terbitkan()` menggabungkan **dua** syarat dengan `&&`: kepemilikan objek dan izin peran. Ini bentuk paling jujur dari aturan bisnisnya — penulis boleh menerbitkan tulisannya sendiri, tetapi hanya kalau perannya memang berwenang menerbitkan. Bandingkan dengan `view()` yang cukup memeriksa kepemilikan saja, karena membaca tulisan sendiri tidak memerlukan izin tambahan.',
      ),
      callout(
        'warning',
        '`before()` yang mengembalikan `false` mematikan semua policy',
        'Mengembalikan `false` dari `before()` menolak **setiap** pemeriksaan, termasuk yang seharusnya lolos. Kembalikan `null` kalau ingin melanjutkan ke method policy biasa. Ini kesalahan yang menghasilkan "admin tidak bisa apa-apa" atau, lebih buruk, kebalikannya.',
      ),

      h2('Lapisan yang tidak boleh dilewati: query'),
      code(
        'js',
        `
        // Policy saja tidak cukup untuk DAFTAR.
        // Yang ini mengembalikan catatan SEMUA orang:
        const semua = await db.query('SELECT * FROM catatan LIMIT 20');

        // Yang benar: scope-nya ada di query.
        const milikku = await db.query(
          'SELECT ... FROM catatan WHERE penulis_id = $1 LIMIT 20',
          [req.pengguna.id],
        );
        `,
      ),
      p(
        'Policy bekerja per objek, dan endpoint daftar tidak memanggilnya untuk setiap baris. Untuk daftar, penjagaannya **harus** ada di query.',
      ),

      h2('Prinsip hak minimum, untuk semua identitas'),
      ul(
        'User database aplikasi tidak perlu `DROP` atau `ALTER` kalau aplikasinya tidak pernah mengubah skema.',
        'Kunci API per klien, dengan cakupan masing-masing — bukan satu kunci serba bisa.',
        'Token CI/CD hanya untuk repositori yang ia butuhkan.',
        'Peran sementara harus benar-benar dicabut setelah selesai.',
      ),

      h2('Catat setiap penolakan'),
      code(
        'js',
        `
        log.warn({
          penggunaId: req.pengguna.id,
          aksi: 'catatan.hapus',
          objekId: req.params.id,
          hasil: 'ditolak',
        }, 'otorisasi ditolak');
        `,
      ),
      p(
        'Empat field itu adalah bentuk minimum sebuah catatan audit, yaitu **siapa** (`penggunaId`), **apa** (`aksi`), **atas objek mana** (`objekId`), dan **hasilnya** (`ditolak`), sedangkan waktu ditambahkan pino secara otomatis. Dengan keempatnya sebagai field terpisah, pertanyaan "siapa saja yang mencoba menghapus catatan 42 minggu ini" menjadi penyaringan biasa alih-alih pencarian teks. Perhatikan levelnya `warn` dan bukan `error`, sebab penolakan otorisasi bukan bug di kodemu tetapi tetap layak diperhatikan. Yang membuatnya berguna adalah alert atas **polanya**, bukan atas satu barisnya.',
      ),
      callout(
        'tip',
        'Lonjakan penolakan adalah sinyal serangan',
        'Satu penolakan itu wajar — seseorang salah klik. Lima puluh penolakan dari satu akun dalam semenit adalah seseorang yang sedang memetakan apa yang bisa ia sentuh. Log tanpa alert hanyalah arsip; pasang peringatan untuk pola ini.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Otorisasi hampir selalu dimulai dengan pemeriksaan peran di dalam handler, dan bentuk itu bertahan sampai muncul kebutuhan pertama yang tidak bisa dijawabnya, yaitu **izin yang bergantung pada objeknya**, bukan hanya pada penggunanya.',
      ),
      code(
        'ts',
        `
        // Tingkat 1 — peran saja. Cukup untuk "siapa boleh masuk ke halaman ini".
        if (req.pengguna.peran !== 'admin') return res.status(403).json({ error: 'Tidak berhak' });

        // Pertanyaan yang TIDAK bisa dijawab bentuk di atas:
        //   - "editor boleh mengubah artikel MILIKNYA SENDIRI"
        //   - "anggota tim boleh melihat pesanan TIM-nya, bukan tim lain"
        //   - "penulis boleh menghapus komentar di artikelnya, bukan di artikel lain"
        //
        // Semuanya bergantung pada HUBUNGAN antara pengguna dan objek tertentu.
        `,
      ),
      p(
        'Jawaban untuk pertanyaan seperti itu bernama **policy**, yaitu fungsi yang menerima pengguna dan objeknya lalu menjawab boleh atau tidak. Yang membuatnya bekerja bukan bentuk fungsinya melainkan bahwa ia **satu-satunya tempat** aturan itu ditulis.',
      ),
      code(
        'ts',
        `
        // domain/policy/artikel.ts — tanpa req, tanpa res, tanpa HTTP.
        // Karena murni, ia bisa diuji tanpa menyalakan apa pun.
        export const artikelPolicy = {
          lihat(pengguna: Pengguna, artikel: Artikel): boolean {
            if (artikel.status === 'terbit') return true;
            return artikel.penulisId === pengguna.id || pengguna.peran === 'admin';
          },
          ubah(pengguna: Pengguna, artikel: Artikel): boolean {
            if (pengguna.peran === 'admin') return true;
            return pengguna.peran === 'editor' && artikel.penulisId === pengguna.id;
          },
          hapus(pengguna: Pengguna, artikel: Artikel): boolean {
            // Sengaja LEBIH KETAT daripada ubah: menghapus tidak bisa dibatalkan.
            return pengguna.peran === 'admin';
          },
        };

        // Testnya tidak butuh server maupun basis data, dan justru kasus yang
        // TIDAK nyaman yang paling penting diuji:
        //   ubah(editorA, artikelMilikEditorB)  -> false
        //   ubah(editorA, artikelMilikEditorA)  -> true
        //   hapus(editorA, artikelMilikEditorA) -> false   <- lebih ketat, disengaja
        //   lihat(tamu, artikelDraf)            -> false
        `,
        {
          caption:
            'Menaruh aturan di fungsi murni membuat empat baris uji di atas mungkin ditulis sama sekali.',
        },
      ),
      p(
        'Perlu ditegaskan satu hal yang membedakan policy yang berguna dari policy yang memberi rasa aman palsu. Policy bekerja pada objek yang **sudah diambil**, dan itu berarti ia sendiri tidak cukup untuk daftar. Untuk daftar, batasnya harus ikut ke dalam query, sebagaimana sudah diukur pada sub-bab IDOR.',
      ),
      code(
        'ts',
        `
        // SATU objek: ambil dulu, lalu policy. Objeknya dibatasi pemiliknya di query
        // supaya datanya tidak pernah keluar dari database untuk yang tidak berhak.
        const artikel = await repo.cari(id);
        if (!artikel || !artikelPolicy.lihat(req.pengguna, artikel)) {
          return res.status(404).json({ error: 'Tidak ditemukan' });
        }

        // DAFTAR: policy TIDAK BISA dipakai di sini. Menyaring seribu baris di
        // aplikasi berarti seribu baris sudah terbaca, dan paginasinya jadi salah
        // karena jumlah baris sebelum dan sesudah penyaringan berbeda.
        const daftar = await repo.daftarUntuk(req.pengguna);
        // -> WHERE status = 'terbit' OR penulis_id = $1
        `,
        { caption: 'Satu aturan, dua bentuk: policy untuk satu objek, klausa WHERE untuk daftar.' },
      ),
      p(
        'Bagian tentang paginasi di komentar itu sering baru disadari setelah bug-nya muncul. Ketika penyaringan dilakukan setelah data diambil, sebuah halaman berisi dua puluh baris bisa menyusut menjadi tiga setelah disaring, sementara penanda halaman berikutnya sudah terlanjur dihitung dari dua puluh. Pengguna melihat halaman yang isinya sedikit dan sebagian barisnya terlewat sepenuhnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan otorisasi tidak menghasilkan error, jadi satu-satunya cara mengetahuinya adalah menulis uji yang memang mencarinya. Berikut bentuk kebocoran yang paling sering lolos.',
      ),
      code(
        'text',
        `
        KEBOCORAN 1 — memeriksa peran, lupa memeriksa kepemilikan
          if (pengguna.peran === 'editor') { ubah(artikel); }
          -> setiap editor bisa mengubah artikel editor lain

        KEBOCORAN 2 — aturan yang sama ditulis di dua tempat
          handler ubah  : peran editor DAN pemilik
          handler hapus : peran editor saja      <- salah satu akan menyimpang
          -> perbaikan di satu tempat tidak ikut ke tempat lain

        KEBOCORAN 3 — endpoint baru yang lupa dipasangi pemeriksaan
          Bawaan yang MENGIZINKAN berarti setiap rute baru otomatis terbuka.
          Bawaan yang MENOLAK berarti rute yang lupa dipasangi akan gagal keras,
          dan kegagalan keras itu ketahuan di hari pertama.

        KEBOCORAN 4 — mass assignment lewat peran
          await db.pengguna.update({ id, ...req.body });
          -> klien mengirim {"peran":"admin"} dan menaikkan haknya sendiri
        `,
      ),
      p(
        'Kebocoran keempat menghubungkan kembali ke apa yang sudah diukur di bab Express, yaitu `z.object()` membuang kunci yang tidak dideklarasikan. Selama kamu memakai hasil parsing dan bukan `req.body`, `peran` yang disisipkan penyerang tidak pernah sampai ke basis data.',
      ),
      p(
        'Prinsip hak minimum berlaku untuk **setiap identitas**, bukan hanya untuk pengguna manusia, dan bagian ini yang paling sering dilewatkan sepenuhnya.',
      ),
      code(
        'text',
        `
        Identitas yang semuanya butuh hak minimum:

          pengguna aplikasi   -> peran dan policy, seperti di atas
          akun database       -> aplikasi yang tidak pernah membuat tabel TIDAK PERLU
                                 terhubung sebagai pemilik skema
          service account     -> layanan pengirim surel tidak perlu membaca tabel pesanan
          kunci API           -> satu kunci per klien, dengan izin sesempit kebutuhannya
          token CI/CD         -> hanya izin yang dibutuhkan pipeline-nya

        Diuji sungguhan di bab database: injeksi lewat ORDER BY berhasil
        MENGHAPUS sebuah tabel. Dengan akun database yang hanya berhak membaca
        dan menulis baris, perintah DROP itu akan gagal di tingkat izin
        meski celah injeksinya tetap ada.
        `,
      ),
      p(
        'Contoh terakhir itu menunjukkan kenapa lapisan tidak bisa saling menggantikan. Query berparameter menutup celahnya, dan hak minimum membatasi kerusakan bila suatu hari ada celah lain yang terlewat. Keduanya murah, dan yang kedua sering tidak dipasang sama sekali karena "lebih repot saat mengembangkan".',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Otorisasi adalah bagian yang paling mudah ditulis terlalu sederhana, sebab bentuk sederhananya bekerja sempurna sampai pengguna kedua muncul.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memeriksa peran saja, tanpa kepemilikan',
            'Perannya sudah benar',
            'Setiap editor bisa mengubah milik editor lain. Peran menjawab "boleh apa", bukan "boleh atas objek mana"',
          ],
          [
            'Menulis aturan yang sama di beberapa handler',
            'Tiap handler jelas terbaca',
            'Salinan-salinannya menyimpang seiring waktu. Satu aturan hidup di satu fungsi policy',
          ],
          [
            'Memakai policy untuk menyaring daftar',
            'Aturannya kan sama',
            'Seluruh baris terbaca lebih dulu, dan paginasinya jadi salah. Daftar disaring di klausa `WHERE`',
          ],
          [
            'Bawaan mengizinkan, lalu menolak yang berbahaya',
            'Lebih sedikit yang ditulis',
            'Setiap endpoint baru otomatis terbuka. Bawaan menolak membuat yang terlewat gagal keras',
          ],
          [
            'Terhubung ke database sebagai pemilik skema',
            'Supaya tidak ada yang menghalangi',
            'Diuji di bab database, satu celah injeksi cukup untuk menghapus tabel. Hak minimum membatasi kerusakannya',
          ],
          [
            'Tidak mencatat penolakan akses',
            'Kan memang ditolak',
            'Lonjakan penolakan adalah tanda paling awal seseorang sedang menjelajah. Tanpa catatan, ia tak terlihat',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas ditegaskan karena nilainya baru terasa saat dibutuhkan. Satu penolakan akses adalah kejadian biasa, misalnya pengguna membuka tautan lama. Tiga ratus penolakan dalam lima menit dari satu akun, terhadap tiga ratus id yang berurutan, adalah seseorang yang sedang mencoba IDOR satu per satu. Yang membedakan keduanya bukan peristiwanya melainkan polanya, dan pola hanya terlihat kalau setiap peristiwanya dicatat beserta aktor, tindakan, objek, dan waktunya.',
      ),
      references(
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Model RBAC, otorisasi tingkat objek, dan prinsip hak akses minimum.',
        },
        {
          label: 'Laravel — Authorization Policies',
          href: 'https://laravel.com/docs/12.x/authorization#creating-policies',
          source: 'Laravel',
          note: 'Termasuk perilaku `before()` dan beda antara `false` dan `null`.',
        },
        {
          label: 'OWASP Top 10 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'Kenapa memeriksa izin di satu lapisan saja hampir selalu tidak cukup.',
        },
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Penolakan otorisasi sebagai peristiwa keamanan yang wajib dicatat dan dipantau.',
        },
      ),
    ],
  ),

  written(
    'idor',
    'IDOR — kenapa ID dari klien bukan bukti kewenangan',
    17,
    'Kerentanan paling umum di API, dan yang paling mudah dilewatkan.',
    [
      p(
        '**IDOR** (Insecure Direct Object Reference) terjadi ketika aplikasi memakai id dari klien untuk mengambil data **tanpa** memeriksa apakah klien itu berhak. Ia menempati peringkat teratas OWASP, dan alasannya sederhana: kodenya terlihat benar.',
      ),

      terms(
        {
          term: 'IDOR',
          meaning:
            'Singkatan *Insecure Direct Object Reference*. Terjadi ketika aplikasi memakai id dari klien untuk mengambil data **tanpa memeriksa apakah klien itu berhak**. Ia menempati peringkat teratas OWASP, dan alasannya sederhana: **kodenya terlihat benar**.',
        },
        {
          term: 'referensi objek langsung',
          meaning:
            'Nilai dari klien yang menunjuk sesuatu di sistemmu — id baris, nama berkas, id job, kunci cache. Aturannya: kalau klien yang **menyebutkan**, kewenangannya harus **diperiksa**.',
        },
        {
          term: 'kenapa sering lolos',
          meaning:
            'Tidak ada error. Tidak ada peringatan. Fiturnya berjalan sempurna saat diuji — **karena saat menguji, kamu memakai id milikmu sendiri**. Bug ini hanya terlihat kalau kamu sengaja mencoba mengakses data orang lain.',
        },
        {
          term: 'scope di query',
          meaning:
            'Perbaikan yang benar: kepemilikan jadi **bagian dari `WHERE`** — `WHERE id = $1 AND penulis_id = $2`. Milik orang lain otomatis mengembalikan nol baris, dan endpoint-nya menjawab `404` tanpa cabang tambahan.',
        },
        {
          term: '404 bukan 403',
          meaning:
            'Untuk data privat, `404` lebih aman. Menjawab `403` sudah **mengungkap bahwa data itu ada** — cukup bagi penyerang untuk memetakan sistemmu dari beda pesan error saja.',
        },
        {
          term: 'enumerasi',
          meaning:
            'Menaikkan angka satu per satu untuk memanen data — `for i in $(seq 1 100000)`. Ini bentuk eksploitasi IDOR yang paling sederhana, dan tidak butuh alat apa pun selain `curl` dan satu perulangan.',
        },
        {
          term: 'IDOR di luar database',
          meaning:
            'Aturannya berlaku untuk **setiap** referensi objek, bukan hanya baris tabel: berkas unggahan (`faktur-1042.pdf` → coba `1043`), laporan berparameter, id job latar, dan kunci cache yang tidak menyertakan id pengguna.',
        },
        {
          term: 'UUID bukan perbaikan',
          meaning:
            'UUID membuat id **sulit ditebak**, bukan **terlarang diakses**. Kalau id-nya bocor lewat tautan yang dibagikan, log, atau header `Referer`, celahnya terbuka lagi. Ia memperlambat penyerang, tidak menutup lubangnya.',
        },
        {
          term: 'menguji IDOR',
          meaning:
            'Satu-satunya cara membuktikannya tertutup: buat **dua pengguna**, ambil id milik yang satu, panggil dengan token yang lain, dan pastikan jawabannya `404`. Tes ini yang paling sering tidak ditulis.',
        },
      ),

      h2('Bentuknya'),
      code(
        'js',
        `
        // Endpoint ini SUDAH terautentikasi. Dan tetap rentan.
        app.get('/api/catatan/:id', autentikasi, async (req, res) => {
          const catatan = await db.query('SELECT * FROM catatan WHERE id = $1', [req.params.id]);
          res.json({ data: catatan.rows[0] });
        });
        `,
      ),
      code(
        'bash',
        `
        # Pengguna sah, membaca catatannya sendiri
        curl /api/catatan/42 -H "Authorization: Bearer $TOKEN"

        # Pengguna sah yang sama, membaca catatan orang lain
        curl /api/catatan/43 -H "Authorization: Bearer $TOKEN"
        curl /api/catatan/44 -H "Authorization: Bearer $TOKEN"

        # Satu perulangan sederhana mengambil seluruh basis data
        for i in $(seq 1 100000); do curl -s /api/catatan/$i -H "Authorization: Bearer $TOKEN"; done
        `,
      ),
      p(
        'Perhatikan `autentikasi` sudah terpasang pada rute itu, dan tetap saja rentan. Kesalahannya ada di baris query, sebab `WHERE id = $1` menjadikan angka dari klien sebagai **satu-satunya penentu** baris mana yang diambil. Servernya tahu persis siapa yang meminta karena nilainya ada di `req.pengguna`, tetapi tidak pernah memakainya. Inilah beda autentikasi dan otorisasi dalam satu baris kode, sebab pintunya terkunci tetapi begitu masuk semua laci bisa dibuka.',
      ),
      p(
        'Bagian `curl` menunjukkan mengapa ini kelas kerentanan tersendiri, bukan sekadar bug kecil. Tiga baris pertama identik kecuali angkanya, dan **semuanya memakai token yang sama dan sah**. Tidak ada yang diretas, tidak ada tanda tangan yang dipalsukan. Perulangan di baris terakhir memperlihatkan konsekuensinya: karena id-nya berurutan, satu perintah `for` sudah cukup untuk mengunduh seluruh isi tabel — dan dari sisi server, semuanya tampak sebagai pengguna sah yang sedang rajin membaca.',
      ),
      callout(
        'danger',
        'Kenapa ini begitu sering lolos',
        'Tidak ada error. Tidak ada peringatan. Fiturnya berjalan sempurna saat diuji — karena saat menguji, kamu memakai id milikmu sendiri. Bug ini hanya terlihat kalau kamu **sengaja** mencoba mengakses data orang lain.',
      ),

      h2('Perbaikannya: scope-kan di query'),
      compare(
        {
          title: 'Rentan',
          lang: 'js',
          code: `
          const { rows } = await db.query(
            'SELECT * FROM catatan WHERE id = $1',
            [req.params.id],
          );
          `,
          notes: ['ID dari klien menjadi satu-satunya penentu'],
        },
        {
          title: 'Aman',
          lang: 'js',
          code: `
          const { rows } = await db.query(
            \`SELECT ... FROM catatan
             WHERE id = $1 AND penulis_id = $2\`,
            [req.params.id, req.pengguna.id],
          );

          if (rows.length === 0) {
            return res.status(404).json({
              error: { pesan: 'Tidak ditemukan' },
            });
          }
          `,
          notes: ['Kepemilikan jadi bagian dari query', 'Milik orang lain = tidak ditemukan'],
        },
      ),
      p(
        'Perbaikannya hanya menambah satu syarat dan satu parameter: `AND penulis_id = $2` dengan `req.pengguna.id`. Yang berubah secara mendasar adalah **siapa yang menentukan hasil**. Pada kolom kiri, klien sepenuhnya yang menentukan lewat angka di URL. Pada kolom kanan, klien hanya boleh mengusulkan id, dan servernya menyaring dengan identitas yang ia verifikasi sendiri. Letaknya di dalam query juga disengaja — pemeriksaan di lapisan data tidak bisa dilewati oleh jalur pemanggilan baru yang lupa memeriksa.',
      ),
      p(
        'Blok `if (rows.length === 0)` menyatukan dua keadaan yang berbeda menjadi satu jawaban: catatan yang tidak ada dan catatan yang bukan miliknya sama-sama menghasilkan nol baris, sehingga keduanya dijawab `404` yang identik. Dengan begitu tidak ada informasi yang bocor lewat perbedaan respons. Perhatikan pula kolom kanan mengganti `SELECT *` menjadi daftar kolom eksplisit — memperbaiki IDOR adalah saat yang tepat untuk sekaligus menutup kebocoran kolom.',
      ),

      h2('IDOR tidak hanya soal baris database'),
      table(
        ['Objek', 'Bentuk serangannya'],
        [
          ['Berkas unggahan', '`/unggahan/faktur-1042.pdf` -> coba `1043`'],
          ['Laporan', '`/laporan?perusahaanId=7` -> ganti angkanya'],
          ['Job latar', '`/job/abc123/status` -> tebak id job orang lain'],
          ['Kunci cache', 'Kunci yang tidak menyertakan id pengguna'],
          ['Pesan antrean', 'Payload dipercaya tanpa memeriksa pemiliknya'],
        ],
      ),
      p(
        'Aturannya berlaku untuk **setiap referensi objek**, bukan hanya baris tabel: kalau klien menyebutkan sesuatu, kewenangannya harus diperiksa.',
      ),

      h2('UUID bukan perbaikan'),
      code(
        'text',
        `
        /api/catatan/550e8400-e29b-41d4-a716-446655440000
        `,
      ),
      p(
        'Alamat ini memang mematikan serangan `for` di atas, sebab tidak ada "id berikutnya" yang bisa ditebak dari 128 bit acak. Tetapi perhatikan apa yang **tidak** berubah, karena kalau query di belakangnya masih `WHERE id = $1` tanpa `penulis_id`, maka siapa pun yang memegang UUID itu tetap mendapat datanya. Dan UUID bocor dengan cara yang tidak terduga, entah lewat tautan yang dibagikan di grup, dari respons API lain yang menyertakannya, dari log server, atau dari header `Referer` saat pengguna mengklik tautan keluar. Perlakukan UUID sebagai pengurang paparan alih-alih sebagai kontrol akses.',
      ),
      callout(
        'warning',
        'UUID hanya membuat penjelajahan lebih sulit, bukan mustahil',
        'ID acak mencegah penyerang menaikkan angka satu per satu — itu berharga. Tapi id sering bocor: dari URL yang dibagikan, dari respons API lain, dari log, dari header `Referer`. Begitu satu id diketahui, aplikasi tanpa pemeriksaan kepemilikan tetap menyerahkan datanya. UUID adalah lapisan tambahan, bukan penggantinya.',
      ),

      h2('`404` atau `403`?'),
      table(
        ['Situasi', 'Jawaban'],
        [
          ['Data privat milik orang lain', '**`404`** — jangan ungkap bahwa ia ada'],
          ['Data yang keberadaannya memang publik', '`403`'],
          ['Dalam ruang kerja bersama', '`403` — anggota tahu ia ada'],
        ],
      ),
      p(
        'Menjawab `403` untuk data privat sudah membocorkan satu fakta: sumber daya itu **ada**. Penyerang bisa memetakan seluruh basis data hanya dari perbedaan antara `403` dan `404`.',
      ),

      h2('Menegakkannya dengan tes'),
      code(
        'js',
        `
        // Tes seperti ini yang menangkap IDOR. Ia menguji bahwa sesuatu
        // yang seharusnya TIDAK BISA memang tidak bisa.
        it('menolak akses ke catatan milik pengguna lain', async () => {
          const ana = await buatPengguna();
          const budi = await buatPengguna();
          const catatanBudi = await buatCatatan({ penulisId: budi.id });

          for (const [method, jalur] of [
            ['get', \`/api/catatan/\${catatanBudi.id}\`],
            ['patch', \`/api/catatan/\${catatanBudi.id}\`],
            ['delete', \`/api/catatan/\${catatanBudi.id}\`],
          ]) {
            const res = await request(app)[method](jalur).set('Authorization', bearer(ana));
            expect(res.status).toBe(404);
          }

          // Dan pastikan datanya benar-benar tidak berubah
          const sesudah = await ambilCatatan(catatanBudi.id);
          expect(sesudah).toEqual(catatanBudi);
        });
        `,
      ),
      p(
        'Tes ini berbeda dari tes biasa karena ia membuktikan sesuatu **tidak** terjadi. Perhatikan ada dua pengguna: catatan dibuat atas nama Budi, lalu setiap permintaan dikirim dengan token Ana. Inilah yang tidak akan pernah kamu lakukan saat menguji manual — kamu selalu memakai akunmu sendiri, dan itulah alasan IDOR begitu sering lolos ke produksi.',
      ),
      p(
        'Perulangan atas tiga method juga disengaja. Sangat sering `GET` sudah diperbaiki sementara `PATCH` dan `DELETE` masih memakai query lama, karena keduanya jarang diuji dengan token orang lain. Menuliskannya sebagai daftar membuat penambahan endpoint baru cukup menambah satu baris. Dan dua baris terakhir menutup celah terakhirnya: status `404` saja belum membuktikan apa-apa kalau ternyata datanya **sempat berubah** sebelum ditolak. Perbandingan `toEqual(catatanBudi)` memastikan `PATCH` dan `DELETE` benar-benar tidak menyentuh apa pun.',
      ),
      callout(
        'tip',
        'Jadikan ini tes wajib untuk setiap sumber daya',
        'Setiap kali kamu menambahkan entitas baru yang punya pemilik, salin tes ini dan sesuaikan. Aturan yang dijaga tes bertahan; aturan yang dijaga ingatan akan terlewat pada endpoint kesepuluh — dan endpoint kesepuluh itulah yang bocor.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'IDOR adalah kerentanan yang paling banyak ditemukan pada program bug bounty, dan alasannya bukan karena sulit dicegah melainkan karena **tidak menghasilkan gejala apa pun**. Fiturnya bekerja, testnya lulus, dan yang bocor hanya terlihat kalau ada yang sengaja mencobanya.',
      ),
      code(
        'text',
        `
        Dua pesanan milik dua orang berbeda:

          id   | pelanggan_id | total  | catatan
          -----+--------------+--------+------------------------------
          4211 |            7 | 890000 | Alamat Rina, Jl. Merdeka 12
          4212 |            9 | 125000 | Alamat Budi, Jl. Sudirman 4

        Budi (pelanggan_id 9), SUDAH LOGIN, mengganti angka di alamat
        menjadi /pesanan/4211:

          RENTAN : SELECT * FROM pesanan WHERE id = ?
            {"id":4211,"pelanggan_id":7,"total":890000,
             "catatan":"Alamat Rina, Jl. Merdeka 12"}

          AMAN   : SELECT * FROM pesanan WHERE id = ? AND pelanggan_id = ?
            null    -> dijawab 404

        Dan pesanan Budi sendiri tetap terbaca:
            {"id":4212,"pelanggan_id":9,"total":125000,
             "catatan":"Alamat Budi, Jl. Sudirman 4"}
        `,
        { caption: 'Dijalankan sungguhan dengan node:sqlite bawaan Node 26.5.0.' },
      ),
      p(
        'Perbedaan antara kedua query itu hanya satu klausa, dan klausa itu yang memindahkan pemeriksaan kepemilikan **ke dalam basis data**. Selama syaratnya ada di sana, tidak ada satu pun jalur kode di atasnya yang bisa lupa memeriksanya, sebab barisnya memang tidak pernah kembali.',
      ),
      p(
        'Bentuk perbaikan yang terlihat setara dan sebenarnya tidak adalah memeriksa kepemilikan setelah barisnya diambil.',
      ),
      code(
        'text',
        `
        const baris = ambil(4211);                          // tanpa syarat pemilik
        if (baris.pelanggan_id !== penggunaLogin) return res.status(404)...

        Yang benar-benar terukur:

          data sudah TERBACA ke memori proses :
            {"id":4211,"pelanggan_id":7,"total":890000,"catatan":"Alamat...
          baru kemudian ditolak              : ditolak
        `,
        {
          caption:
            'Dijalankan sungguhan. Penolakannya berhasil, datanya sudah keluar dari database.',
        },
      ),
      p(
        'Setelah baris itu berada di dalam proses, ada banyak jalan ia bisa bocor tanpa siapa pun berniat membocorkannya. Ia bisa ikut tercetak ke log saat sebuah pesan error mencetak objeknya, ikut ke jejak tumpukan yang dikirim sistem pemantauan, ikut ke respons pada satu cabang kode yang lupa disaring, atau ikut ke cache yang menyimpan hasil query berdasarkan id saja. Menaruh syaratnya di dalam query menutup semua jalan itu sekaligus.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu "perbaikan" yang sangat sering dipakai dan sama sekali tidak memperbaiki, yaitu mengganti id berurutan dengan UUID.',
      ),
      code(
        'text',
        `
        CREATE TABLE berkas (id TEXT PRIMARY KEY, pemilik_id INTEGER, nama TEXT);
        INSERT INTO berkas VALUES ('9f1c2b7a-4d3e-4a11-9c2f-0b7e6d5a4c31', 7, 'ktp-rina.pdf');

        SELECT * FROM berkas WHERE id = '9f1c2b7a-4d3e-4a11-9c2f-0b7e6d5a4c31';
          {"id":"9f1c2b7a-...","pemilik_id":7,"nama":"ktp-rina.pdf"}
        `,
        {
          caption:
            'Dijalankan sungguhan. Query-nya tetap tidak menyebut pemilik, jadi tetap terbuka.',
        },
      ),
      p(
        'UUID memang membuat penebakan acak menjadi tidak praktis, dan itu manfaat yang nyata. Yang tidak dilakukannya adalah menutup akses bagi siapa pun yang **sudah memegang** nilainya, dan nilai seperti itu beredar di banyak tempat. Ia muncul di riwayat peramban, di header `Referer` yang terkirim ke situs pihak ketiga, di log server dan log proxy, di tautan yang dibagikan lewat pesan, dan di tangkapan layar. Keamanan yang bergantung pada nilai yang beredar seperti itu bukan kontrol akses melainkan penundaan.',
      ),
      p(
        'IDOR juga tidak hanya soal baris basis data, dan bentuk-bentuk berikut sering luput karena tidak melibatkan query sama sekali.',
      ),
      code(
        'text',
        `
        Referensi objek yang SEMUANYA butuh pemeriksaan kepemilikan:

          /berkas/laporan-q3.pdf          berkas di penyimpanan
          /faktur/2026-09/INV-4211.pdf    berkas yang dibuat per pengguna
          /ekspor/status/8821             id pekerjaan latar
          /notifikasi/9931/baca           id notifikasi
          cache key "pesanan:4211"        kunci cache yang tidak memuat pemilik
          antrean pesan { pesananId: 4211 }  payload job yang dipercaya apa adanya

        Baris terakhir sering dilewatkan sepenuhnya: pekerjaan latar yang membaca
        id dari antrean dan langsung memprosesnya tanpa memeriksa siapa pemiliknya.
        Antrean milik sendiri BUKAN alasan untuk mempercayai isinya.
        `,
      ),
      p(
        'Pilihan antara `404` dan `403` juga bagian dari perbaikannya, dan keduanya benar untuk situasi yang berbeda. Menjawab `403` berarti mengakui bahwa objek bernomor itu **ada**, dan untuk sebagian data keberadaannya sendiri sudah merupakan keterangan. Bahwa ada faktur bernomor tertentu, atau ada berkas bernama tertentu, bisa cukup berarti bagi penyerang.',
      ),
      code(
        'text',
        `
        Pakai 404 bila keberadaan objeknya sendiri bersifat rahasia:
          /faktur/:id   /berkas/:id   /pesanan/:id   /dokumen/:id

        Pakai 403 bila keberadaannya memang publik dan hanya aksinya yang dibatasi:
          /artikel/:id/hapus  -> artikelnya publik, yang dibatasi adalah menghapusnya
          /tim/:id/undang     -> timnya diketahui, yang dibatasi adalah mengundang

        Yang penting: KONSISTEN. Bila sebagian endpoint menjawab 403 dan
        sebagian 404 untuk situasi yang sama, selisihnya sendiri jadi bocoran.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'IDOR bertahan di produksi bukan karena sulit dipahami melainkan karena tidak pernah muncul pada pengujian yang biasa dilakukan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengambil baris berdasarkan id saja',
            'Penggunanya sudah login',
            'Diuji sungguhan, pengguna lain membacanya utuh hanya dengan mengganti angka di alamat',
          ],
          [
            'Memeriksa kepemilikan setelah baris diambil',
            'Hasilnya sama-sama ditolak',
            'Diuji sungguhan, datanya sudah masuk ke proses dan bisa bocor lewat log, cache, atau pesan error',
          ],
          [
            'Mengganti id berurutan dengan UUID',
            'Tidak bisa ditebak lagi',
            'Diuji sungguhan, tetap terbuka bagi siapa pun yang memegang nilainya. UUID memperlambat, bukan menutup',
          ],
          [
            'Melupakan referensi selain baris database',
            'Yang penting datanya aman',
            'Berkas, id pekerjaan, kunci cache, dan payload antrean semuanya referensi objek yang sama rentannya',
          ],
          [
            'Mempercayai payload dari antrean sendiri',
            'Antreannya kan milik kita',
            'Pesan bisa berasal dari permintaan pengguna. Job harus memeriksa kepemilikan seperti endpoint',
          ],
          [
            'Menguji hanya dengan satu akun',
            'Fiturnya sudah bekerja',
            'IDOR hanya terlihat dengan dua akun. Uji A membuka objek milik B pada SETIAP endpoint',
          ],
        ],
      ),
      p(
        'Baris terakhir bisa diubah menjadi kebiasaan yang murah dan menangkap hampir semuanya. Buat dua akun uji tetap, sebut saja A dan B, lalu untuk setiap endpoint yang mengembalikan atau mengubah objek milik seseorang, tulis satu uji yang login sebagai B dan menyentuh objek milik A. Uji itu pendek, tidak butuh alat khusus, dan ia satu-satunya hal yang membedakan kebocoran yang tertangkap di hari pertama dari kebocoran yang ditemukan orang lain setahun kemudian.',
      ),
      references(
        {
          label: 'Insecure Direct Object Reference Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk penegasan bahwa id yang sulit ditebak bukan pengganti pemeriksaan kewenangan.',
        },
        {
          label: 'OWASP Top 10 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'IDOR sebagai bentuk paling umum dari kategori kerentanan nomor satu.',
        },
        {
          label: 'Authorization Testing Automation Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Testing_Automation_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Cara menjadikan uji otorisasi negatif bagian tetap dari suite tes.',
        },
        {
          label: '404 Not Found',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404',
          source: 'MDN Web Docs',
          note: 'Kenapa `404` sah dipakai untuk data yang keberadaannya tidak boleh diketahui.',
        },
      ),
    ],
  ),

  written(
    'rate-limit-login',
    'Rate Limit Login & Pesan Error Generik',
    18,
    'Membuat penebakan password tidak sepadan dengan usahanya.',
    [
      p(
        'Password yang kuat tidak menolong kalau penyerang boleh menebak tanpa batas. Dua kontrol di sub-bab ini murah dipasang dan menutup sebagian besar serangan otomatis.',
      ),

      terms(
        {
          term: 'brute force',
          meaning:
            'Menebak password dengan mencoba kemungkinan satu per satu. Password kuat tidak menolong kalau penyerang boleh menebak **tanpa batas** — dan itulah yang ditutup dua kontrol di sub-bab ini.',
        },
        {
          term: 'enumerasi akun',
          meaning:
            'Memetakan **email mana yang terdaftar** dari perbedaan jawaban server. Ia langkah **pertama** serangan: setelah tahu daftarnya, penyerang bisa memfokuskan penebakan, menjalankan credential stuffing, atau mengirim phishing yang meyakinkan.',
        },
        {
          term: 'pesan error identik',
          meaning:
            'Jawaban yang **sama persis** untuk "email tidak terdaftar" dan "password salah" — keduanya `401` dengan pesan "Email atau password salah". Perbedaan yang tampak sepele itulah yang menyediakan daftar untuk enumerasi.',
        },
        {
          term: 'timing attack',
          meaning:
            'Membaca informasi dari **selisih waktu respons**. Kalau email tidak ada, kode langsung kembali — jauh lebih cepat daripada saat ia harus memverifikasi hash. Selisih itu bisa diukur, dan ia sama saja dengan pesan yang berbeda.',
        },
        {
          term: 'dummy hash',
          meaning:
            'Obat untuk timing attack: saat email tidak ditemukan, **tetap jalankan verifikasi** terhadap hash buatan. Waktu responsnya jadi sama untuk email yang ada maupun tidak — dan celah waktunya tertutup.',
        },
        {
          term: 'credential stuffing',
          meaning:
            'Mencoba pasangan email–password yang bocor dari situs **lain**. Ia bekerja karena banyak orang memakai password yang sama di beberapa tempat — dan itulah kenapa memeriksa kebocoran (`uncompromised()`) berharga.',
        },
        {
          term: 'rate limit per IP dan per akun',
          meaning:
            'Keduanya perlu, dan masing-masing menutup lubang yang lain. **Per IP saja** lolos oleh botnet terdistribusi. **Per akun saja** membuka celah DoS: penyerang sengaja salah password untuk mengunci akun korban.',
        },
        {
          term: 'skipSuccessfulRequests',
          meaning:
            'Opsi yang membuat rate limiter **hanya menghitung percobaan yang gagal**. Tanpa itu, pengguna sah yang berkali-kali login dari jaringan kantor bisa ikut terblokir bersama penyerangnya.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Menaikkan jeda tunggu secara berlipat setelah setiap kegagalan — 1 detik, 2, 4, 8. Lebih baik daripada lockout keras: penyerang cepat kehabisan kesabaran, sementara pengguna sah yang salah ketik sekali tidak terkunci.',
        },
      ),

      h2('Pesan error harus identik'),
      compare(
        {
          title: 'Membocorkan',
          lang: 'js',
          code: `
          if (pengguna === null) {
            return res.status(404).json({
              pesan: 'Email tidak terdaftar',
            });
          }

          if (!cocok) {
            return res.status(401).json({
              pesan: 'Password salah',
            });
          }
          `,
          notes: ['Penyerang bisa memetakan email mana yang terdaftar'],
        },
        {
          title: 'Generik',
          lang: 'js',
          code: `
          if (pengguna === null || !cocok) {
            return res.status(401).json({
              error: { pesan: 'Email atau password salah' },
            });
          }
          `,
          notes: ['Tidak ada informasi yang bisa dipetakan'],
        },
      ),
      p(
        'Kolom kiri memberi pesan yang lebih membantu — dan justru itu masalahnya, karena yang paling terbantu adalah penyerang. Dengan `404 Email tidak terdaftar` versus `401 Password salah`, siapa pun bisa mengirim daftar sejuta email dan memilah mana yang punya akun di sistemmu, tanpa pernah menebak satu password pun. Perhatikan status kodenya juga ikut membocorkan, jadi menyeragamkan pesannya saja tidak cukup kalau angkanya tetap berbeda.',
      ),
      p(
        'Kolom kanan menyatukan dua keadaan itu dengan `||` menjadi satu cabang, satu status, dan satu pesan. Pengguna sah yang salah ketik memang jadi tidak tahu apakah emailnya keliru atau passwordnya — sedikit merepotkan, tetapi ia bisa memakai alur "lupa password" yang aman. Perhatikan alur lupa password pun harus mengikuti aturan yang sama: balas "kalau email itu terdaftar, kami sudah mengirim tautannya", bukan "email tidak ditemukan".',
      ),
      callout(
        'danger',
        'Enumerasi akun adalah langkah pertama serangan',
        'Dengan mengetahui email mana yang terdaftar, penyerang bisa memfokuskan penebakan, menjalankan credential stuffing dari kebocoran situs lain, atau mengirim phishing yang meyakinkan. Perbedaan pesan yang tampak sepele itulah yang menyediakan daftarnya.',
      ),

      h2('Waktu respons juga membocorkan'),
      code(
        'js',
        `
        // Kalau email tidak ada, kita langsung kembali -> jauh lebih cepat.
        // Selisih waktunya bisa diukur, dan ia sama saja dengan pesan berbeda.
        //
        // Perbaikannya: tetap jalankan verifikasi terhadap dummy hash.
        const HASH_PALSU = await argon2.hash(crypto.randomBytes(32).toString('hex'));

        const pengguna = await db.cariPenggunaByEmail(email);
        const hash = pengguna?.kataSandiHash ?? HASH_PALSU;

        const cocok = await argon2.verify(hash, kataSandiDikirim);

        if (pengguna === null || !cocok) {
          return res.status(401).json({ error: { pesan: 'Email atau password salah' } });
        }
        `,
      ),
      p(
        'Kebocoran ini lebih halus daripada perbedaan pesan, dan tidak akan tertangkap dengan membaca respons. Karena argon2 sengaja dibuat lambat, ingat `memoryCost` 19 MiB tadi, email yang **tidak terdaftar** akan dijawab dalam hitungan milidetik, sementara email yang terdaftar butuh puluhan hingga ratusan milidetik untuk memverifikasi hash-nya. Selisih itu cukup konsisten untuk diukur dari luar, dan ia memberi jawaban yang sama seperti pesan "email tidak terdaftar".',
      ),
      p(
        'Perbaikannya ada di baris `?? HASH_PALSU`: ketika penggunanya tidak ditemukan, verifikasi tetap dijalankan terhadap hash tiruan sehingga waktunya sebanding. `argon2.verify` tentu gagal, tetapi kegagalannya sudah ditangani oleh cabang `pengguna === null` di bawah. Perhatikan `HASH_PALSU` dihitung **sekali** di luar handler — menghitungnya di setiap permintaan justru menambah beban tanpa manfaat. Perhatikan pula pemeriksaannya ditulis `pengguna === null || !cocok`, satu cabang untuk kedua keadaan, sesuai pelajaran sebelumnya.',
      ),

      h2('Rate limit: per IP DAN per akun'),
      code(
        'js',
        `
        import rateLimit from 'express-rate-limit';

        // Per IP — menahan satu mesin yang menyerang bertubi-tubi
        const batasIp = rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 20,
          standardHeaders: 'draft-7',
          skipSuccessfulRequests: true,   // hanya hitung yang GAGAL
          message: { error: { pesan: 'Terlalu banyak percobaan. Coba lagi nanti.' } },
        });

        // Per akun — menahan botnet yang IP-nya berbeda-beda
        async function batasAkun(req, res, next) {
          const kunci = \`gagal:\${req.body?.email ?? ''}\`;
          const jumlah = Number(await redis.get(kunci)) || 0;

          if (jumlah >= 10) {
            // Backoff eksponensial, bukan penguncian keras.
            return res.status(429).json({ error: { pesan: 'Terlalu banyak percobaan. Coba lagi nanti.' } });
          }

          next();
        }

        router.post('/masuk', batasIp, batasAkun, controller.masuk);
        `,
      ),
      p(
        'Kedua pembatas ini menutup dua serangan yang berbeda, dan itulah sebabnya keduanya dipasang berurutan pada rute yang sama. `batasIp` menahan satu mesin yang mencoba ribuan password terhadap satu akun. `batasAkun` menahan kebalikannya: ribuan mesin yang masing-masing hanya mencoba beberapa kali terhadap akun yang sama — pola botnet yang setiap IP-nya berada jauh di bawah ambang per-IP dan karenanya tidak akan pernah tertangkap `batasIp`.',
      ),
      p(
        'Opsi `skipSuccessfulRequests: true` adalah detail yang menentukan kenyamanan penggunanya: yang dihitung hanya percobaan yang **gagal**, sehingga orang yang benar-benar bekerja dan berkali-kali login dari kantor yang sama tidak ikut terblokir. `windowMs: 15 * 60 * 1000` dengan `limit: 20` berarti dua puluh kegagalan per lima belas menit — cukup longgar untuk orang yang pelupa, cukup ketat untuk menghentikan penebakan otomatis.',
      ),
      p(
        'Perhatikan `batasAkun` memakai `req.body?.email` sebagai kunci di Redis dan bukan id pengguna, sebab pada titik ini kita memang belum tahu penggunanya siapa, dan justru itu yang membuatnya bekerja bahkan untuk email yang tidak terdaftar. Redis dipakai, bukan variabel di memori proses, karena hitungannya harus **dibagi antar proses**. Dengan penyimpanan di memori, menjalankan empat proses berarti penyerang mendapat empat kali jatah. Perhatikan pula ambangnya menghasilkan `429`, dan komentarnya menegaskan ini backoff alih-alih penguncian keras, dengan alasan yang dibahas tepat di bawah.',
      ),
      callout(
        'warning',
        'Rate limit per IP saja tidak cukup',
        'Botnet terdistribusi memakai ribuan IP berbeda, masing-masing hanya beberapa percobaan — jauh di bawah ambang per-IP. Yang menangkapnya adalah hitungan per akun. Keduanya harus ada.',
      ),

      h2('Kenapa backoff, bukan penguncian keras'),
      callout(
        'danger',
        'Penguncian polos adalah celah penolakan layanan',
        'Kalau akun terkunci setelah lima percobaan gagal, penyerang bisa **mengunci akun siapa pun** hanya dengan sengaja salah password lima kali. Ia tidak perlu masuk, sebab cukup membuat korban tidak bisa masuk. Karena itu aturannya adalah rate limit **dan** backoff eksponensial, per akun **dan** per IP, bukan penguncian tanpa syarat.',
      ),
      code(
        'js',
        `
        // Jeda yang naik: 1s, 2s, 4s, 8s, ... dengan batas atas
        const jedaDetik = Math.min(2 ** jumlahGagal, 300);
        `,
      ),
      p(
        'Satu baris ini menjelaskan kenapa backoff mengalahkan penguncian. `2 ** jumlahGagal` tumbuh sangat cepat, yaitu 1, 2, 4, 8, 16, lalu 32 detik, sehingga penebakan otomatis yang butuh ribuan percobaan menjadi mustahil secara waktu, sementara pengguna sah yang salah ketik dua kali hanya menunggu beberapa detik. Perbedaannya dengan penguncian, akun tetap **bisa** diakses pemiliknya dan hanya lebih lambat, jadi penyerang tidak bisa memakai kegagalan yang disengaja untuk mengunci akun orang lain.',
      ),
      p(
        '`Math.min(..., 300)` memasang batas atas lima menit, dan itu bukan kelonggaran melainkan keharusan. Tanpa batas, `2 ** 20` sudah lebih dari dua belas hari — artinya kamu baru saja membuat penguncian permanen dengan cara lain. Batas atas menjaga agar jedanya tetap menyakitkan bagi mesin, tetapi selalu punya ujung bagi manusia.',
      ),

      h2('Endpoint lain yang juga butuh rate limit'),
      table(
        ['Endpoint', 'Kenapa'],
        [
          ['Login', 'Penebakan password'],
          ['Daftar', 'Pembuatan akun massal'],
          ['Lupa password', 'Enumerasi email dan pengeboman email'],
          ['**Verifikasi OTP/MFA**', 'Kode 6 digit bisa ditebak habis'],
          ['Pencarian pengguna', 'Enumerasi'],
          ['Endpoint yang mahal', 'Penghabisan sumber daya'],
        ],
      ),
      callout(
        'danger',
        'Rate limit pada OTP paling sering terlupa',
        'Kode enam digit hanya punya satu juta kemungkinan. Tanpa batas percobaan, ia bisa dihabiskan dalam hitungan menit — dan MFA yang ada jadi tidak berarti apa-apa. Batasi ketat: lima percobaan, lalu kodenya dibatalkan dan harus diminta ulang.',
      ),

      h2('Reset password yang aman'),
      ol(
        'Selalu jawab **sama** dengan kalimat "kalau email terdaftar, kami sudah mengirim tautan", baik emailnya ada maupun tidak.',
        'Token acak berentropi tinggi, disimpan sebagai **hash**.',
        'Berumur pendek: 15–60 menit.',
        '**Sekali pakai** — hapus begitu digunakan.',
        'Cabut **semua** sesi dan refresh token setelah password berhasil diganti.',
        'Rate limit permintaan resetnya — kalau tidak, ia menjadi alat pengeboman email.',
      ),

      h2('Catat dan pantau'),
      code(
        'js',
        `
        log.warn({
          peristiwa: 'login_gagal',
          email: samarkan(email),        // jangan catat email lengkap
          ip: req.ip,
          jumlahGagalBeruntun: jumlah,
        }, 'percobaan masuk gagal');
        `,
      ),
      p(
        'Pasang alert untuk lonjakan kegagalan login, lonjakan penolakan otorisasi, dan permintaan yang cocok dengan pola injeksi. Log yang tidak ada yang membaca bukan deteksi — ia arsip.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Halaman login membocorkan keterangan lewat dua jalur yang sama pentingnya, yaitu **pesannya** dan **waktunya**. Yang pertama mudah diperbaiki dan sering sudah diperbaiki. Yang kedua jarang disadari, dan berikut ukurannya.',
      ),
      code(
        'text',
        `
        VERSI RENTAN — keluar lebih awal ketika emailnya tidak ada

          email TIDAK terdaftar      median     0,0 ms
          email ada, sandi SALAH     median    28,7 ms
          email ada, sandi BENAR     median    30,0 ms

        VERSI AMAN — SELALU menghitung hash, meski emailnya tidak ada

          email TIDAK terdaftar      median    28,4 ms
          email ada, sandi SALAH     median    28,5 ms
          email ada, sandi BENAR     median    28,2 ms
        `,
        {
          caption:
            'Dijalankan sungguhan dengan scrypt pada Node 26.5.0, median dari 12 pengukuran.',
        },
      ),
      p(
        'Selisih 28 milidetik pada versi rentan bukan angka yang samar. Ia jauh lebih besar daripada derau jaringan biasa, dan penyerang yang mengirim satu permintaan per alamat email bisa memilah daftar sejuta alamat menjadi "terdaftar" dan "tidak terdaftar" tanpa pernah menebak satu sandi pun. Daftar hasilnya kemudian dipakai untuk hal-hal yang jauh lebih merugikan, mulai dari penipuan bersasar sampai penebakan sandi yang terfokus.',
      ),
      p('Penyebabnya terlihat begitu alurnya ditulis berdampingan.'),
      code(
        'ts',
        `
        // RENTAN: cabang pertama keluar tanpa mengerjakan apa pun yang mahal.
        function loginRentan(email: string, sandi: string) {
          const tersimpan = db.get(email);
          if (!tersimpan) return { ok: false, pesan: 'Email tidak terdaftar' };  // 0 ms
          if (!cocok(sandi, tersimpan)) return { ok: false, pesan: 'Sandi salah' }; // 28 ms
          return { ok: true };
        }

        // AMAN: hash SELALU dihitung, dan pesannya identik.
        // HASH_UMPAN dibuat sekali saat boot dari nilai acak — ia tidak pernah cocok
        // dengan sandi apa pun, dan biayanya sama persis dengan hash sungguhan.
        const HASH_UMPAN = buatHash(randomBytes(32).toString('hex'));

        function loginAman(email: string, sandi: string) {
          const tersimpan = db.get(email) ?? HASH_UMPAN;
          const benar = cocok(sandi, tersimpan);
          if (!db.has(email) || !benar) return { ok: false, pesan: 'Email atau sandi salah' };
          return { ok: true };
        }
        `,
        {
          caption:
            'Perhatikan pemeriksaan db.has ditaruh SESUDAH cocok(), supaya hash-nya tetap dihitung.',
        },
      ),
      code(
        'text',
        `
        Pesan yang dikembalikan keduanya:

          rentan, email tak ada  : Email tidak terdaftar
          rentan, sandi salah    : Sandi salah
          aman,   email tak ada  : Email atau sandi salah
          aman,   sandi salah    : Email atau sandi salah
        `,
        { caption: 'Dijalankan sungguhan. Dua pesan identik, dan dua waktu yang juga identik.' },
      ),
      p(
        'Perlu disebut bahwa pesan yang identik saja tidak cukup, dan itu tepat yang ditunjukkan versi rentan. Ia bisa saja memakai pesan yang sama untuk keduanya dan tetap membocorkan seluruhnya lewat selisih 28 milidetik. Dua perbaikan itu harus dipasang bersama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pembatasan laju punya satu keputusan yang menentukan apakah ia melindungi atau justru menjadi senjata, yaitu **backoff** atau **penguncian keras**. Berikut simulasi penyerang yang menebak sandi satu akun, dengan backoff eksponensial.',
      ),
      code(
        'text',
        `
          t=   0s  percobaan ke- 1  diproses, jeda berikutnya   0s
          t=   0s  percobaan ke- 2  diproses, jeda berikutnya   0s
          t=   0s  percobaan ke- 3  diproses, jeda berikutnya   1s
          t=   1s  percobaan ke- 4  diproses, jeda berikutnya   2s
          t=   3s  percobaan ke- 5  diproses, jeda berikutnya   4s
          t=   7s  percobaan ke- 6  diproses, jeda berikutnya   8s
          t=  15s  percobaan ke- 7  diproses, jeda berikutnya  16s
          t=  31s  percobaan ke- 8  diproses, jeda berikutnya  32s
          t=  63s  percobaan ke- 9  diproses, jeda berikutnya  60s
          t= 123s  percobaan ke-10  diproses, jeda berikutnya 120s
          t= 243s  percobaan ke-11  diproses, jeda berikutnya 300s
          t= 543s  percobaan ke-12  diproses, jeda berikutnya 300s

        Berapa tebakan yang muat dalam 24 jam:
          dengan backoff : 298 tebakan
          tanpa backoff  : dibatasi kecepatan jaringan saja, mudah ratusan ribu
        `,
        {
          caption:
            'Dijalankan sungguhan. Tiga percobaan pertama sengaja tanpa jeda, supaya salah ketik biasa tidak terhukum.',
        },
      ),
      p(
        'Angka 298 tebakan per hari itu yang membuat penebakan sandi menjadi tidak praktis, dan perhatikan bahwa tiga percobaan pertama tetap berjalan tanpa jeda sama sekali. Pengguna yang salah mengetik sandinya sekali atau dua kali tidak merasakan apa pun, sementara penyerang yang mencoba ke sepuluh sudah menunggu dua menit.',
      ),
      p('Sekarang alternatifnya, dan kenapa ia memindahkan masalah alih-alih menyelesaikannya.'),
      code(
        'text',
        `
        PENGUNCIAN KERAS: "5 kali gagal, akun dikunci 30 menit"

        Yang bisa dilakukan penyerang dengan aturan itu:

          1. ambil daftar email pelanggan (atau tebak dari pola email perusahaan)
          2. kirim 5 percobaan asal untuk SETIAP email
          3. seluruh pengguna terkunci, dan tidak satu pun sandinya perlu ditebak

        Serangan berpindah dari pencurian akun menjadi penolakan layanan,
        dan tombolnya justru disediakan oleh perlindungan yang kita pasang.
        `,
      ),
      p(
        'Karena itu backoff lebih disukai, sebab ia memperlambat penyerang **tanpa memberinya kemampuan mengunci korban**. Penguncian keras masih punya tempat, yaitu sebagai lapisan terakhir dengan ambang yang jauh lebih tinggi dan disertai jalan pemulihan mandiri lewat surel.',
      ),
      p(
        'Pembatasan laju juga harus dipasang pada **dua sumbu sekaligus**, dan memasang satu saja meninggalkan lubang yang besar.',
      ),
      code(
        'text',
        `
        HANYA per IP:
          -> credential stuffing dari botnet ribuan IP lolos sepenuhnya,
             sebab tiap IP hanya mencoba beberapa kali

        HANYA per akun:
          -> penyerang menebak SATU sandi yang sangat umum terhadap
             SEJUTA akun berbeda. Tiap akun hanya kena satu percobaan,
             jadi backoff per akun tidak pernah menyala. Ini namanya
             password spraying, dan ia berhasil dengan mengejutkan sering

        Yang benar: keduanya, plus batas global untuk endpoint login itu sendiri.
        `,
      ),
      p(
        'Endpoint lain yang sering dilupakan padahal sama rentannya adalah pendaftaran, permintaan reset sandi, pengiriman ulang kode verifikasi, dan pemeriksaan ketersediaan nama pengguna. Yang terakhir itu bahkan tidak butuh sandi sama sekali untuk membocorkan siapa saja yang sudah terdaftar.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perlindungan login mudah dipasang setengah, dan setengahnya sering adalah bagian yang menutup kebocoran.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai pesan berbeda untuk email salah dan sandi salah',
            'Lebih membantu pengguna',
            'Memberitahu penyerang email mana yang terdaftar. Pakai satu pesan untuk keduanya',
          ],
          [
            'Menyamakan pesannya, tapi keluar lebih awal saat email tak ada',
            'Pesannya sudah sama',
            'Diukur, selisihnya 0,0 ms melawan 28,7 ms. Waktunya membocorkan apa yang pesannya sembunyikan',
          ],
          [
            'Mengunci akun setelah beberapa kali gagal',
            'Penyerang jadi berhenti',
            'Penyerang bisa mengunci akun siapa pun dengan 5 tebakan asal. Pakai backoff bertingkat',
          ],
          [
            'Membatasi laju hanya per IP',
            'Penyerangnya kan dari satu tempat',
            'Botnet ribuan IP lolos sepenuhnya. Batasi per akun juga',
          ],
          [
            'Membatasi laju hanya per akun',
            'Yang diserang kan akunnya',
            'Password spraying satu sandi ke sejuta akun tidak pernah menyalakan batas per akun',
          ],
          [
            'Memberi pesan berbeda pada reset sandi untuk email tak terdaftar',
            'Supaya pengguna tahu salah ketik',
            'Bocoran yang sama persis, lewat pintu lain. Jawab identik: "Bila terdaftar, tautan sudah dikirim"',
          ],
        ],
      ),
      p(
        'Baris terakhir melengkapi seluruh bagian ini, sebab perbaikan di halaman login jadi sia-sia bila halaman reset sandi membocorkan hal yang sama. Bentuk yang benar untuk reset adalah selalu menjawab dengan kalimat yang sama, misalnya "Bila alamat itu terdaftar, tautan pemulihan sudah kami kirim", dan mengirim surelnya hanya bila memang ada. Tokennya sendiri harus acak, berumur pendek, sekali pakai, dan mencabut seluruh sesi lain begitu sandinya benar-benar diganti.',
      ),
      references(
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pesan error seragam, perlindungan brute force, dan alur reset password yang aman.',
        },
        {
          label: 'Forgot Password Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Token sekali pakai, umur pendek, dan jawaban yang sama untuk email ada maupun tidak.',
        },
        {
          label: 'Multifactor Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa rate limit pada verifikasi OTP tidak bisa dilewatkan.',
        },
        {
          label: '429 Too Many Requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
          source: 'MDN Web Docs',
          note: 'Status yang benar untuk rate limit, beserta header `Retry-After`.',
        },
      ),
    ],
  ),

  written(
    'praktik-register-login',
    'Praktik: Register/login di Express dan Laravel',
    20,
    'Membangun alur autentikasi lengkap di kedua stack.',
    [
      p(
        'Latihan penutup Backend Basic: bangun pendaftaran dan login yang memenuhi **setiap** aturan di bab ini, di kedua framework yang sudah kamu pelajari.',
      ),

      terms(
        {
          term: 'alur autentikasi lengkap',
          meaning:
            'Bukan hanya "login berhasil". Ia mencakup pendaftaran, login, logout yang **mencabut di server**, ganti password yang mencabut sesi lain, dan setiap penjagaan di antaranya. Latihan ini menuntut seluruhnya.',
        },
        {
          term: 'toLowerCase() pada email',
          meaning:
            'Normalisasi sebelum menyimpan dan mencari. Tanpa itu, `Ana@contoh.com` dan `ana@contoh.com` menjadi **dua akun berbeda** — dan constraint `UNIQUE` tidak menahannya, karena keduanya memang berbeda sebagai teks.',
        },
        {
          term: 'unique violation',
          meaning:
            'Error database saat email yang sudah ada didaftarkan lagi. Menanganinya penting **dan** halus: jawabannya tidak boleh membocorkan bahwa email itu terdaftar — kalau tidak, endpoint pendaftaran menjadi alat enumerasi.',
        },
        {
          term: 'logout yang sungguhan',
          meaning:
            'Mencabut sesi atau token **di server**, bukan hanya menghapusnya di klien. Logout yang cuma menghapus di browser meninggalkan token yang masih sah — dan penyerang yang sudah menyalinnya tidak terpengaruh sama sekali.',
        },
        {
          term: 'ganti password mencabut sesi lain',
          meaning:
            'Konsekuensi yang sering dilupakan. Orang mengganti password **justru karena** curiga akunnya dibajak. Kalau sesi lain tidak ikut dicabut, penyerang tetap masuk — dan korban mengira sudah aman.',
        },
        {
          term: 'membangun di dua stack',
          meaning:
            'Metode latihan ini. Aturan yang **sama** harus dipenuhi di Express dan Laravel. Yang berbeda hanya cara framework menyediakannya — dan itu memisahkan prinsip keamanan dari kebiasaan alat.',
        },
        {
          term: 'checklist sebagai spesifikasi',
          meaning:
            'Delapan butir "yang wajib ada" bukan saran melainkan **kriteria selesai**. Setiap butir bisa dijawab ya atau tidak dengan menjalankan satu perintah `curl` — bukan dengan membaca ulang kode dan merasa yakin.',
        },
        {
          term: 'uji dengan dua akun',
          meaning:
            'Pola pengujian yang mengikat seluruh bab ini. Buat dua pengguna, lalu buktikan: yang satu tidak bisa membaca, mengubah, maupun menghapus milik yang lain — dan datanya benar-benar tidak berubah setelah percobaan itu.',
        },
      ),

      h2('Yang wajib ada'),
      ul(
        'Password di-hash dengan argon2id atau bcrypt.',
        'Pesan gagal identik untuk email tidak ada dan password salah.',
        'Waktu respons tidak membocorkan keberadaan akun.',
        'Rate limit per IP **dan** per akun.',
        'Sesi/token diregenerasi setelah login.',
        'Logout mencabut di **server**, bukan hanya menghapus di klien.',
        'Ganti password mencabut seluruh sesi lain.',
        'Tidak ada hash password yang keluar dari server.',
      ),

      h2('Express — pendaftaran'),
      code(
        'js',
        `
        const SkemaDaftar = z.object({
          nama: z.string().trim().min(1).max(100),
          email: z.string().trim().toLowerCase().email().max(255),
          kataSandi: z.string().min(12).max(200),
        }).strict();

        export async function daftar(req, res) {
          const { nama, email, kataSandi } = req.body;

          const hash = await argon2.hash(kataSandi, { type: argon2.argon2id });

          try {
            const { rows } = await db.query(
              \`INSERT INTO pengguna (nama, email, kata_sandi_hash)
               VALUES ($1, $2, $3)
               RETURNING id, nama, email\`,
              [nama, email, hash],
            );

            // Perhatikan: kata_sandi_hash TIDAK ikut di RETURNING.
            res.status(201).json({ data: rows[0] });
          } catch (err) {
            // 23505 = pelanggaran unique. Jangan bilang "email sudah terdaftar" —
            // itu enumerasi akun lewat pintu belakang.
            if (err.code === '23505') {
              return res.status(202).json({
                data: { pesan: 'Kalau email belum terdaftar, kami sudah mengirim tautan verifikasi.' },
              });
            }
            throw err;
          }
        }
        `,
      ),
      p(
        'Perhatikan `.toLowerCase()` pada skema email — tanpanya, `Ana@contoh.com` dan `ana@contoh.com` akan menjadi dua akun berbeda meski merujuk kotak surat yang sama, dan `UNIQUE` di database tidak akan mencegahnya. Normalisasi harus dilakukan **sebelum** validasi dan penyimpanan, bukan sesekali saat mencari. `.strict()` menutup celah mass assignment: tanpa itu, body yang menyertakan `{"peran":"admin"}` bisa ikut terbawa kalau kode di bawahnya menyebarkan `req.body`.',
      ),
      p(
        'Komentar pada `RETURNING id, nama, email` menandai keputusan yang mudah terlewat, yaitu `kata_sandi_hash` sengaja tidak ikut dikembalikan. Kalau ditulis `RETURNING *`, hash password akan langsung terkirim ke klien pada respons pendaftaran, dan itu kebocoran paling telanjang yang bisa terjadi di endpoint ini. Perhatikan pula urutannya, sebab hash dihitung **sebelum** `INSERT` karena yang masuk ke database memang harus sudah berupa hash, bukan password mentah.',
      ),
      p(
        'Blok `catch` menangani kode error PostgreSQL `23505`, yaitu pelanggaran batasan `UNIQUE` yang terjadi ketika emailnya sudah terdaftar. Jawaban yang mudah adalah "email sudah dipakai", dan itulah jebakannya, sebab pesan tersebut memberi penyerang daftar akun yang sama persis seperti pesan login yang berbeda. Karena itu jawabannya `202` dengan kalimat yang **sama** seperti pendaftaran yang berhasil. Yang membedakan hanyalah isi email yang diterima pemilik alamat itu, karena pemilik lama mendapat pemberitahuan sedangkan pemilik baru mendapat tautan verifikasi. Perhatikan error lain tetap dilempar ulang lewat `throw err`, sehingga masalah database sungguhan tidak tersamar sebagai pendaftaran yang berhasil.',
      ),
      callout(
        'tip',
        'Pendaftaran juga bisa membocorkan akun',
        'Menjawab "email sudah terdaftar" pada endpoint daftar memberi penyerang daftar akun yang sama seperti pesan login yang berbeda. Alur verifikasi lewat email menutupnya: jawabannya selalu sama, dan yang membedakan hanyalah isi email yang diterima pemilik alamat itu.',
      ),

      h2('Express — login'),
      code(
        'js',
        `
        const HASH_PALSU = await argon2.hash(crypto.randomBytes(32).toString('hex'));

        export async function masuk(req, res) {
          const { email, kataSandi } = req.body;

          const pengguna = await db.cariPenggunaByEmail(email);

          // Selalu jalankan verifikasi, walau penggunanya tidak ada -> waktu seragam.
          const hash = pengguna?.kataSandiHash ?? HASH_PALSU;
          const cocok = await argon2.verify(hash, kataSandi);

          if (pengguna === null || !cocok) {
            await catatGagal(email, req.ip);
            // Satu pesan untuk kedua kemungkinan.
            return res.status(401).json({ error: { pesan: 'Email atau password salah' } });
          }

          await bersihkanHitunganGagal(email);

          // Naikkan biaya hash kalau parameternya sudah dinaikkan.
          if (argon2.needsRehash(hash, { type: argon2.argon2id })) {
            await db.perbaruiHash(pengguna.id, await argon2.hash(kataSandi, { type: argon2.argon2id }));
          }

          // Regenerasi sesi -> cegah session fixation.
          req.session.regenerate((err) => {
            if (err) return res.status(500).json({ error: { pesan: 'Terjadi kesalahan' } });

            req.session.penggunaId = pengguna.id;
            res.json({ data: { id: pengguna.id, nama: pengguna.nama, email: pengguna.email } });
          });
        }
        `,
      ),
      p(
        'Fungsi ini menggabungkan hampir setiap pelajaran sub-bab sebelumnya, dan setiap barisnya punya alasan. `HASH_PALSU` di luar handler menyeragamkan waktu respons agar email yang tidak terdaftar tidak terjawab lebih cepat. Cabang `pengguna === null || !cocok` menyatukan dua kegagalan menjadi satu pesan. `catatGagal(email, req.ip)` mengisi hitungan untuk pembatas per-akun **dan** per-IP, dan `bersihkanHitunganGagal` di jalur sukses memastikan pengguna sah tidak terus membawa beban kegagalan lamanya.',
      ),
      p(
        'Blok `needsRehash` adalah penerapan hal yang tadi dibahas pada Laravel: inilah satu-satunya momen password asli tersedia, jadi di sinilah hash lama diangkat ke parameter biaya yang baru. Perhatikan ia diletakkan setelah verifikasi berhasil — menjalankannya lebih dulu berarti menghitung ulang hash untuk password yang mungkin salah.',
      ),
      p(
        'Dua hal terakhir menutup fungsinya. `req.session.regenerate` mengganti id sesi sebelum identitas dititipkan, mencegah session fixation. Dan respons suksesnya menyebut `id`, `nama`, serta `email` satu per satu, bukan mengirim objek `pengguna` apa adanya — objek itu membawa `kataSandiHash`, dan mengirimnya utuh akan membocorkan hash password ke setiap orang yang berhasil login.',
      ),

      h2('Laravel'),
      code(
        'php',
        `
        final class MasukController extends Controller
        {
            public function __invoke(MasukRequest $request): JsonResponse
            {
                // Rate limit per akun + per IP dalam satu kunci
                $kunci = Str::lower($request->input('email')) . '|' . $request->ip();

                if (RateLimiter::tooManyAttempts($kunci, maxAttempts: 5)) {
                    $detik = RateLimiter::availableIn($kunci);

                    return response()->json([
                        'error' => ['pesan' => "Terlalu banyak percobaan. Coba lagi dalam {$detik} detik."],
                    ], 429);
                }

                if (! Auth::attempt($request->only('email', 'password'), $request->boolean('ingat'))) {
                    RateLimiter::hit($kunci, decaySeconds: 900);

                    // Pesan yang SAMA untuk email tidak ada dan password salah.
                    return response()->json([
                        'error' => ['pesan' => 'Email atau password salah'],
                    ], 401);
                }

                RateLimiter::clear($kunci);
                $request->session()->regenerate();

                return response()->json([
                    'data' => ['id' => Auth::id(), 'nama' => Auth::user()->name],
                ]);
            }
        }
        `,
      ),
      code(
        'php',
        `
        // Model User — kolom yang TIDAK PERNAH ikut ke JSON
        protected $hidden = ['password', 'remember_token'];

        // Laravel 10+: hashing otomatis saat diisi
        protected function casts(): array
        {
            return ['password' => 'hashed'];
        }
        `,
      ),
      p(
        'Versi Laravel-nya mengerjakan hal yang sama dengan alat bawaan. Perhatikan kunci rate limiter-nya menggabungkan email **dan** IP dalam satu string, yaitu satu kunci yang menutup kedua sisi sekaligus sebagai alternatif ringkas dari dua middleware terpisah pada contoh Node. `Str::lower` di sana memastikan `Ana@` dan `ana@` dihitung sebagai akun yang sama. `RateLimiter::hit` hanya dipanggil di unhappy path dan `RateLimiter::clear` di jalur sukses, mengikuti pola `skipSuccessfulRequests` tadi. Perhatikan pula responsnya menyebutkan sisa detik lewat `availableIn`, dan ini aman diberitahukan karena tidak mengungkap apa pun tentang akunnya.',
      ),
      p(
        "Blok kedua adalah dua baris yang menyelamatkan banyak aplikasi Laravel. `$hidden` mencegah `password` dan `remember_token` ikut terserialisasi ke JSON — jadi bahkan `return response()->json($user)` yang ceroboh tidak akan membocorkan hash. Dan cast `'password' => 'hashed'` membuat setiap penugasan ke kolom itu di-hash otomatis, sehingga `$user->update(['password' => $plain])` pada contoh ganti password di bawah tidak menyimpan teks mentah. Keduanya bekerja sebagai jaring pengaman: mereka menutup celah yang lahir dari kelalaian, bukan dari niat.",
      ),

      h2('Ganti password — cabut sesi lain'),
      code(
        'php',
        `
        public function gantiKataSandi(GantiKataSandiRequest $request): JsonResponse
        {
            $user = $request->user();

            // Verifikasi password LAMA — jangan izinkan ganti hanya karena sesi aktif.
            if (! Hash::check($request->validated('kata_sandi_lama'), $user->password)) {
                return response()->json(['error' => ['pesan' => 'Password lama salah']], 422);
            }

            $user->update(['password' => $request->validated('kata_sandi_baru')]);

            // Cabut token dan sesi lain — kalau akun sempat dibajak,
            // ini yang mengeluarkan penyerangnya.
            $user->tokens()->delete();
            Auth::logoutOtherDevices($request->validated('kata_sandi_baru'));

            return response()->json(['data' => ['pesan' => 'Password diperbarui']]);
        }
        `,
      ),
      p(
        'Pemeriksaan `Hash::check` terhadap password **lama** di awal sering dianggap formalitas, padahal ia yang menutup satu skenario nyata: laptop yang ditinggal terbuka, atau sesi yang dicuri lewat XSS. Tanpa langkah itu, siapa pun yang memegang sesi aktif bisa mengganti password dan mengunci pemilik aslinya keluar dari akunnya sendiri. Sesi yang aktif membuktikan seseorang pernah masuk; ia tidak membuktikan orang itu masih pemiliknya.',
      ),
      p(
        'Dua baris pencabutan di bawahnya menyelesaikan alasan orang mengganti password. `$user->tokens()->delete()` mencabut token API di semua perangkat, dan `Auth::logoutOtherDevices` mengeluarkan sesi browser lain sambil **mempertahankan** sesi yang sedang dipakai — sehingga penggunanya tidak ikut terlempar keluar setelah berhasil mengganti passwordnya sendiri. Tanpa keduanya, sesi penyerang tetap hidup dan tindakan ganti password hanya memberi rasa aman yang keliru.',
      ),
      callout(
        'danger',
        'Ganti password yang tidak mencabut sesi lain hampir tidak berguna',
        'Alasan utama seseorang mengganti password adalah kecurigaan akun dibajak. Kalau sesi penyerang tetap aktif setelahnya, tindakan itu tidak mengubah apa pun bagi penyerang — dan korban mengira dirinya sudah aman.',
      ),

      h2('Uji seluruh unhappy path-nya'),
      code(
        'bash',
        `
        # 1. Email tidak ada dan password salah -> pesan HARUS identik
        curl -s -X POST localhost:3000/api/masuk -H 'Content-Type: application/json' \\
          -d '{"email":"tidakada@x.com","kataSandi":"salahsekali"}'
        curl -s -X POST localhost:3000/api/masuk -H 'Content-Type: application/json' \\
          -d '{"email":"ada@x.com","kataSandi":"salahsekali"}'

        # 2. Waktunya juga harus mirip
        curl -s -o /dev/null -w "%{time_total}\\n" -X POST localhost:3000/api/masuk \\
          -H 'Content-Type: application/json' -d '{"email":"tidakada@x.com","kataSandi":"x"}'
        curl -s -o /dev/null -w "%{time_total}\\n" -X POST localhost:3000/api/masuk \\
          -H 'Content-Type: application/json' -d '{"email":"ada@x.com","kataSandi":"x"}'

        # 3. Rate limit aktif setelah beberapa percobaan -> 429
        for i in $(seq 1 30); do
          curl -s -o /dev/null -w "%{http_code} " -X POST localhost:3000/api/masuk \\
            -H 'Content-Type: application/json' -d '{"email":"ada@x.com","kataSandi":"salah"}'
        done

        # 4. Respons login TIDAK BOLEH memuat hash
        curl -s -X POST localhost:3000/api/masuk -H 'Content-Type: application/json' \\
          -d '{"email":"ada@x.com","kataSandi":"benar"}' | grep -i "hash\\|password" \\
          && echo "BOCOR" || echo "bersih"
        `,
      ),
      p(
        'Nomor 2 adalah yang paling sering terlewat. Kalau selisih waktunya konsisten dan besar, kamu punya kebocoran lewat saluran samping — pesan errornya seragam, tapi waktunya tidak.',
      ),

      h2('Langkah pengerjaan'),
      steps(
        {
          title: '1. Skema database',
          body: 'Tabel `pengguna` dengan `email UNIQUE`, `kata_sandi_hash VARCHAR(255)`, dan `dibuat_pada`. Tabel `sesi` atau `refresh_token` dengan kolom `hash`, `keluarga_id`, `dicabut_pada`, dan `kedaluwarsa_pada`.',
        },
        {
          title: '2. Pendaftaran',
          body: 'Validasi dengan batas panjang atas dan bawah, hash dengan argon2id, dan pastikan respons tidak pernah memuat kolom hash.',
        },
        {
          title: '3. Login',
          body: 'Terapkan verifikasi terhadap dummy hash, satu pesan error, regenerasi sesi, dan rehash saat parameter dinaikkan.',
        },
        {
          title: '4. Rate limit',
          body: 'Pasang per IP dan per akun. Uji dengan tiga puluh permintaan berturut-turut dan pastikan `429` benar-benar muncul.',
        },
        {
          title: '5. Logout dan ganti password',
          body: 'Keduanya harus mencabut di server. Buktikan dengan memakai token lama setelahnya — ia harus ditolak.',
        },
        {
          title: '6. Jalankan keempat uji di atas',
          body: 'Catat hasil sebenarnya. Perbedaan pesan, perbedaan waktu yang mencolok, atau `429` yang tidak pernah muncul semuanya adalah temuan yang harus diperbaiki.',
        },
      ),

      divider,

      checklist(
        'bb5-praktik',
        'Checklist praktik bab ini',
        'Password di-hash dengan argon2id atau bcrypt — tidak pernah MD5, SHA, atau plain',
        'Pesan gagal login identik untuk email tidak ada dan password salah',
        'Verifikasi tetap dijalankan walau pengguna tidak ada, supaya waktunya seragam',
        'Rate limit terpasang per IP dan per akun, dengan backoff — bukan penguncian polos',
        'Rate limit juga terpasang di endpoint OTP, reset password, dan pendaftaran',
        'Sesi diregenerasi setelah login berhasil',
        'Logout mencabut sesi/token di server, bukan hanya menghapus di klien',
        'Ganti password mencabut seluruh sesi dan refresh token lain',
        'Refresh token dirotasi setiap dipakai, dan pemakaian ulang terdeteksi',
        'Refresh token disimpan sebagai hash, bukan apa adanya',
        'Cookie memakai `HttpOnly`, `Secure`, dan `SameSite`',
        'Tidak ada kolom hash password yang bisa keluar lewat respons API mana pun',
        'Setiap query yang mengambil data pengguna di-scope ke pemiliknya',
        'Ada tes yang membuktikan pengguna lain menerima 404/403 dan datanya tidak berubah',
        'Penolakan otorisasi tercatat di log, dan ada alert untuk lonjakannya',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Pendaftaran dan login yang siap dipakai berbeda dari versi latihan pada hal-hal yang tidak terlihat di jalur sukses. Delapan di antaranya sudah diukur sepanjang bab ini, dan berikut bagaimana kedelapannya bertemu dalam satu alur.',
      ),
      code(
        'ts',
        `
        // service/auth.ts — tanpa req, tanpa res, tanpa status code.
        import { scryptSync, randomBytes, timingSafeEqual, randomUUID } from 'node:crypto';

        const OPSI = { N: 2 ** 14, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

        // Dibuat SEKALI saat boot. Biayanya sama persis dengan hash sungguhan,
        // dan ia tidak akan pernah cocok dengan sandi apa pun.
        const HASH_UMPAN = buatHash(randomBytes(32).toString('hex'));

        export async function daftar(email: string, sandi: string) {
          const hash = buatHash(sandi);
          try {
            return await repo.buatPengguna({ email, sandiHash: hash });
          } catch (e) {
            // 1. Email ganda TIDAK boleh dibedakan dari pendaftaran berhasil,
            //    sebab selisihnya membocorkan siapa yang sudah terdaftar.
            //    Yang benar: kirim surel yang isinya BERBEDA, responsnya SAMA.
            if (kodeUnikDilanggar(e)) {
              await surel.kirimPemberitahuanPercobaanDaftar(email);
              return null;           // pemanggil tetap menjawab 201
            }
            throw e;
          }
        }

        export async function login(email: string, sandi: string) {
          const pengguna = await repo.cariPenggunaByEmail(email);

          // 2. Hash SELALU dihitung, bahkan ketika emailnya tidak ada.
          //    Tanpa ini, selisihnya 0,0 ms melawan 28,7 ms — terukur di sub-bab
          //    rate limit, dan cukup untuk memilah sejuta alamat.
          const benar = cocok(sandi, pengguna?.sandiHash ?? HASH_UMPAN);

          if (!pengguna || !benar) return null;
          return pengguna;
        }
        `,
        { caption: 'Dua bagian ini dijalankan sungguhan sebagai loginAman di sub-bab rate limit.' },
      ),
      p(
        'Bagian pendaftaran itu memuat keputusan yang sering mengejutkan, yaitu **tidak memberitahu bahwa email sudah terdaftar**. Terasa tidak ramah, dan memang ada biayanya bagi pengguna. Tapi pesan "email sudah terdaftar" adalah alat enumerasi yang sama persis dengan pesan login yang membedakan email dan sandi. Jalan tengah yang dipakai layanan besar adalah menjawab sama untuk keduanya, lalu mengirim surel yang isinya berbeda, yaitu tautan verifikasi untuk yang baru dan pemberitahuan "ada yang mencoba mendaftar dengan alamat Anda" untuk yang sudah ada.',
      ),
      code(
        'ts',
        `
        // controller — tipis, dan seluruh keputusan status code ada di sini.
        ruteAuth.post('/daftar', validasi('body', SkemaDaftar), async (req, res) => {
          await daftar(req.konteks.body.email, req.konteks.body.sandi);
          // Jawaban yang SAMA, ada atau tidak ada emailnya.
          res.status(201).json({ pesan: 'Periksa surel Anda untuk melanjutkan' });
        });

        ruteAuth.post('/login', validasi('body', SkemaLogin), async (req, res) => {
          const pengguna = await login(req.konteks.body.email, req.konteks.body.sandi);
          if (!pengguna) {
            // 3. Satu pesan untuk dua sebab yang berbeda.
            return res.status(401).json({ error: 'Email atau sandi salah' });
          }

          // 4. Id sesi BARU sebelum menandai sudah login — menutup session fixation.
          await sesi.regenerate(req);
          req.sesi.penggunaId = pengguna.id;
          res.json({ id: pengguna.id, email: pengguna.email });   // 5. field DIPILIH
        });
        `,
        {
          caption:
            'Baris res.json menyebut field satu per satu, jadi kolom baru di tabel tidak pernah ikut bocor.',
        },
      ),
      p('Skema validasinya sendiri memuat satu keputusan yang sering ditulis terbalik.'),
      code(
        'ts',
        `
        const SkemaDaftar = z.object({
          email: z.email(),
          // Panjang minimum yang layak, TANPA mewajibkan simbol dan angka.
          // Aturan rumit menghasilkan "Sandi1!" dan sandi yang ditulis di kertas.
          sandi: z.string().min(12, 'Minimal 12 karakter').max(200),
        });

        // Batas atas 200 itu bukan kerewelan melainkan kontrol ketersediaan:
        // scrypt atas masukan sepanjang satu megabyte menahan utasnya, dan
        // di bab Express sudah diukur apa akibatnya bagi permintaan lain.
        `,
        {
          caption:
            'Batas atas pada panjang sandi adalah perlindungan DoS, bukan pembatasan pengguna.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Alur yang paling sering ditulis setengah benar adalah **ganti sandi**, dan yang terlewat bukan penggantian sandinya melainkan apa yang harus terjadi sesudahnya.',
      ),
      code(
        'ts',
        `
        export async function gantiSandi(penggunaId: string, lama: string, baru: string) {
          const pengguna = await repo.cariPengguna(penggunaId);

          // 1. Verifikasi sandi LAMA. Tanpa ini, siapa pun yang menemukan
          //    laptop terbuka bisa mengunci pemiliknya dari akunnya sendiri.
          if (!cocok(lama, pengguna.sandiHash)) throw new SandiSalah();

          await repo.simpanSandi(penggunaId, buatHash(baru));

          // 2. INI yang paling sering dilupakan, dan justru yang paling penting.
          //    Orang mengganti sandi TEPAT KARENA curiga akunnya dibobol.
          //    Tanpa dua baris ini, penyerang tetap memegang sesinya.
          await sesi.hancurkanSemuaKecuali(penggunaId, sesiSaatIni);
          await refreshToken.cabutSemua(penggunaId);

          // 3. Beri tahu lewat jalur yang TIDAK dikuasai penyerang.
          await surel.kirimPemberitahuanGantiSandi(pengguna.email);
        }
        `,
        {
          caption:
            'Langkah 2 adalah pembeda antara ganti sandi yang mengamankan dan yang hanya terasa mengamankan.',
        },
      ),
      p(
        'Langkah ketiga layak diperhatikan. Pemberitahuan lewat surel berguna justru ketika penyerangnyalah yang mengganti sandinya, sebab itu satu-satunya kesempatan pemilik sah mengetahui bahwa akunnya diambil alih. Karena itu pemberitahuannya dikirim ke alamat **lama** ketika alamat surel ikut diubah.',
      ),
      p(
        'Bagian terakhir yang memisahkan siap pakai dari latihan adalah menguji jalur yang tidak nyaman. Kedelapan baris berikut menutup seluruh kebocoran yang diukur di bab ini.',
      ),
      code(
        'text',
        `
        #!/bin/bash
        # uji-auth.sh — jalankan sebelum menyatakan autentikasi selesai.
        A=http://localhost:3000/v1/auth
        H="Content-Type: application/json"

        kode() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
        waktu() { curl -s -o /dev/null -w '%{time_total}' "$@"; }

        echo "daftar baru              -> $(kode -X POST $A/daftar -H "$H" -d '{"email":"baru@c.id","sandi":"sandi-panjang-aman"}')"
        echo "daftar email SAMA        -> $(kode -X POST $A/daftar -H "$H" -d '{"email":"baru@c.id","sandi":"sandi-panjang-aman"}')"
        echo "   ^ kedua baris HARUS sama. Beda berarti enumerasi."

        echo "login sandi benar        -> $(kode -X POST $A/login -H "$H" -d '{"email":"baru@c.id","sandi":"sandi-panjang-aman"}')"
        echo "login sandi salah        -> $(kode -X POST $A/login -H "$H" -d '{"email":"baru@c.id","sandi":"salah"}')"
        echo "login email tak ada      -> $(kode -X POST $A/login -H "$H" -d '{"email":"tidakada@c.id","sandi":"salah"}')"
        echo "   ^ dua baris terakhir HARUS 401 dengan badan yang sama persis."

        echo "waktu email tak ada      -> $(waktu -X POST $A/login -H "$H" -d '{"email":"tidakada@c.id","sandi":"x"}')s"
        echo "waktu email ada          -> $(waktu -X POST $A/login -H "$H" -d '{"email":"baru@c.id","sandi":"x"}')s"
        echo "   ^ selisihnya harus KECIL. Diukur di bab ini: 0,0 vs 28,7 ms = bocor."

        echo "sandi terlalu pendek     -> $(kode -X POST $A/login -H "$H" -d '{"email":"a@c.id","sandi":"x"}')"
        echo "tanpa badan              -> $(kode -X POST $A/login -H "$H")"
        `,
        {
          caption:
            'Dua baris waktu di tengah itu yang paling sering tidak pernah diperiksa siapa pun.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Autentikasi adalah bagian yang paling sering dinyatakan selesai terlalu cepat, sebab jalur suksesnya memang cepat selesai dan terlihat meyakinkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyatakan selesai setelah bisa daftar dan login',
            'Fiturnya sudah bekerja',
            'Enumerasi, kebocoran waktu, session fixation, dan pencabutan sesi semuanya belum diuji',
          ],
          [
            'Menjawab "email sudah terdaftar" saat mendaftar',
            'Lebih membantu pengguna',
            'Alat enumerasi yang sama persis dengan pesan login. Jawab sama, bedakan isi surelnya',
          ],
          [
            'Mengganti sandi tanpa mencabut sesi lain',
            'Sandinya sudah diganti',
            'Penyerang tetap memegang sesinya, dan korban merasa sudah aman',
          ],
          [
            'Mengganti sandi tanpa meminta sandi lama',
            'Penggunanya kan sudah login',
            'Siapa pun yang menemukan perangkat terbuka bisa mengunci pemiliknya dari akunnya sendiri',
          ],
          [
            'Tidak membatasi panjang maksimum sandi',
            'Makin panjang makin aman',
            'scrypt atas masukan sangat panjang menahan utasnya. Batas atas adalah kontrol ketersediaan',
          ],
          [
            'Menulis autentikasi sendiri untuk project produksi',
            'Sudah paham cara kerjanya',
            'Memahami mekanismenya justru yang membuatmu bisa menilai pustaka. Untuk produksi, pakai yang sudah teruji',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas menjadi penutup bab ini, dan ia tidak membatalkan seluruh isi bab. Menulis autentikasi sendiri adalah cara terbaik memahami apa yang sebenarnya dilindungi, dan pemahaman itu yang membuatmu bisa menilai apakah sebuah pustaka memasang perlindungannya dengan benar. Untuk project yang dipakai orang lain, pakailah pustaka yang sudah teruji, lalu **periksa sendiri** delapan hal yang diukur di bab ini, sebab pustaka pun bisa dipasang dengan konfigurasi yang membatalkan perlindungannya.',
      ),
      references(
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Checklist di atas dipetakan langsung dari dokumen ini.',
        },
        {
          label: 'Laravel — Authentication & Sanctum',
          href: 'https://laravel.com/docs/12.x/authentication',
          source: 'Laravel',
          note: 'Sisi Laravel dari latihan ini: `Auth::attempt`, regenerasi sesi, dan pencabutan token.',
        },
        {
          label: 'Express — Production Best Practices: Security',
          href: 'https://expressjs.com/en/advanced/best-practice-security.html',
          source: 'Express',
          note: 'Sisi Express: cookie, rate limiting, dan header keamanan.',
        },
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pencabutan saat logout dan saat ganti password — dua butir yang paling sering terlewat.',
        },
      ),
    ],
  ),
];
