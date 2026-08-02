import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  steps,
  table,
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
    8,
    'Dua pertanyaan berbeda yang sering dijawab sebagai satu.',
    [
      p(
        'Dua istilah ini sering disingkat sama-sama "auth", dan penggabungan itu sendiri yang melahirkan celah. Keduanya menjawab pertanyaan yang berbeda, di tempat yang berbeda.',
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
      callout(
        'danger',
        'Perbedaan dua kolom itu adalah perbedaan antara aman dan bocor',
        'Pada kolom kiri, setiap endpoint baru yang ditambahkan bulan depan terbuka sampai seseorang ingat mendaftarkannya. Pada kolom kanan, kelupaan menghasilkan endpoint yang tidak bisa diakses — merepotkan, tapi tidak berbahaya. **Kegagalan harus mengarah ke penolakan.**',
      ),

      h2('Menyembunyikan di UI bukan kontrol akses'),
      p(
        'Tombol yang tidak ditampilkan, menu yang disembunyikan, dan halaman yang tidak ditautkan **tidak menjaga apa pun**. Siapa pun bisa memanggil endpoint-nya langsung dengan `curl`. Antarmuka mengatur kenyamanan; server yang mengatur kewenangan.',
      ),
    ],
  ),

  written(
    'hashing-password',
    'Hashing Password',
    12,
    'Menyimpan password sehingga database yang dicuri pun tidak membocorkannya.',
    [
      p(
        'Password tidak pernah disimpan. Yang disimpan adalah **hash**-nya — hasil fungsi satu arah yang tidak bisa dibalik. Kalau databasemu suatu hari bocor, hash yang benar membuat password penggunanya tetap aman.',
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
    ],
  ),

  written(
    'session-cookie',
    'Session-based Auth',
    12,
    'Autentikasi dengan sesi di server dan cookie di browser.',
    [
      p(
        'Pada session-based auth, server menyimpan data sesi dan browser hanya membawa **id**-nya di cookie. Ini pendekatan yang lebih tua, dan untuk aplikasi web biasa ia masih pilihan yang paling tepat.',
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
    ],
  ),

  written(
    'jwt',
    'Token-based Auth & JWT beserta batasnya',
    13,
    'Token bertanda tangan, kegunaannya, dan harga yang dibayar.',
    [
      p(
        'JWT membungkus identitas dalam token bertanda tangan yang bisa diverifikasi server **tanpa** query ke database. Itu kelebihannya. Harganya: token yang sudah terbit sulit dicabut — dan itu trade-off utamanya, bukan detail kecil.',
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

      h2('Tiga kesalahan yang membatalkan seluruh perlindungannya'),
      steps(
        {
          title: '1. Tidak membatasi algoritma',
          body: 'Tanpa opsi `algorithms`, token bisa menyatakan `alg: none` dan diterima tanpa tanda tangan sama sekali. Atau — pada sistem RS256 — penyerang mengubahnya jadi `HS256` dan menandatangani dengan kunci publikmu, yang memang terbuka. Itu **algorithm confusion**. Selalu tulis allow-list-nya.',
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
        'Satu celah XSS — satu dependency yang dibajak, satu HTML tak tersanitasi — dan seluruh token pengguna bisa dicuri. Cookie `HttpOnly` menutup jalur itu sepenuhnya, dengan konsekuensi kamu harus menangani CSRF. Untuk aplikasi web, itu pertukaran yang hampir selalu lebih baik.',
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
    ],
  ),

  written(
    'refresh-token',
    'Refresh Token & Rotasi',
    11,
    'Memperpendek umur token tanpa memaksa pengguna login terus.',
    [
      p(
        'Token akses berumur pendek itu aman tapi merepotkan; berumur panjang itu nyaman tapi berbahaya. Refresh token memberi keduanya: akses pendek yang diperbarui diam-diam oleh token panjang yang lebih terjaga.',
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

      h2('Rotasi dan deteksi pemakaian ulang'),
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
      callout(
        'danger',
        'Deteksi pemakaian ulang adalah inti dari pola ini',
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
        '**Terdeteksi pemakaian ulang** — cabut seluruh keluarga.',
      ),
      code(
        'php',
        `
        // Laravel Sanctum
        $user->tokens()->delete();                        // semua perangkat
        $request->user()->currentAccessToken()->delete();  // perangkat ini saja
        `,
      ),

      h2('Kesalahan yang sering'),
      table(
        ['Kesalahan', 'Akibat'],
        [
          ['Refresh token tidak pernah berubah', 'Sekali bocor, berlaku sampai kedaluwarsa'],
          ['Token disimpan apa adanya, bukan hash-nya', 'Database bocor = semua sesi terbuka'],
          ['Logout hanya menghapus token di klien', 'Token masih sah di server'],
          ['Tidak ada deteksi pemakaian ulang', 'Pencurian tidak pernah ketahuan'],
          ['Refresh token di `localStorage`', 'Bisa dicuri lewat XSS'],
        ],
      ),
      callout(
        'warning',
        'Simpan hash refresh token, bukan tokennya',
        'Alasannya sama persis dengan password: kalau tabel token bocor, penyerang mendapat hash yang tidak bisa dipakai. Karena refresh token adalah nilai acak berentropi tinggi, SHA-256 sudah cukup di sini — tidak perlu algoritma lambat seperti argon2.',
      ),
    ],
  ),

  written(
    'otorisasi-role-policy',
    'Otorisasi: role, permission, policy',
    12,
    'Menyusun aturan "siapa boleh apa" supaya tetap terkelola.',
    [
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
      callout(
        'tip',
        'Lonjakan penolakan adalah sinyal serangan',
        'Satu penolakan itu wajar — seseorang salah klik. Lima puluh penolakan dari satu akun dalam semenit adalah seseorang yang sedang memetakan apa yang bisa ia sentuh. Log tanpa alert hanyalah arsip; pasang peringatan untuk pola ini.',
      ),
    ],
  ),

  written(
    'idor',
    'IDOR — kenapa ID dari klien bukan bukti kewenangan',
    11,
    'Kerentanan paling umum di API, dan yang paling mudah dilewatkan.',
    [
      p(
        '**IDOR** (Insecure Direct Object Reference) terjadi ketika aplikasi memakai id dari klien untuk mengambil data **tanpa** memeriksa apakah klien itu berhak. Ia menempati peringkat teratas OWASP, dan alasannya sederhana: kodenya terlihat benar.',
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
      callout(
        'tip',
        'Jadikan ini tes wajib untuk setiap sumber daya',
        'Setiap kali kamu menambahkan entitas baru yang punya pemilik, salin tes ini dan sesuaikan. Aturan yang dijaga tes bertahan; aturan yang dijaga ingatan akan terlewat pada endpoint kesepuluh — dan endpoint kesepuluh itulah yang bocor.',
      ),
    ],
  ),

  written(
    'rate-limit-login',
    'Rate Limit Login & Pesan Error Generik',
    11,
    'Membuat penebakan password tidak sepadan dengan usahanya.',
    [
      p(
        'Password yang kuat tidak menolong kalau penyerang boleh menebak tanpa batas. Dua kontrol di sub-bab ini murah dipasang dan menutup sebagian besar serangan otomatis.',
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
              error: { pesan: 'Email atau kata sandi salah' },
            });
          }
          `,
          notes: ['Tidak ada informasi yang bisa dipetakan'],
        },
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
        // Perbaikannya: tetap jalankan verifikasi terhadap hash palsu.
        const HASH_PALSU = await argon2.hash(crypto.randomBytes(32).toString('hex'));

        const pengguna = await db.cariPenggunaByEmail(email);
        const hash = pengguna?.kataSandiHash ?? HASH_PALSU;

        const cocok = await argon2.verify(hash, kataSandiDikirim);

        if (pengguna === null || !cocok) {
          return res.status(401).json({ error: { pesan: 'Email atau kata sandi salah' } });
        }
        `,
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
      callout(
        'warning',
        'Rate limit per IP saja tidak cukup',
        'Botnet terdistribusi memakai ribuan IP berbeda, masing-masing hanya beberapa percobaan — jauh di bawah ambang per-IP. Yang menangkapnya adalah hitungan per akun. Keduanya harus ada.',
      ),

      h2('Kenapa backoff, bukan penguncian keras'),
      callout(
        'danger',
        'Penguncian polos adalah celah penolakan layanan',
        'Kalau akun terkunci setelah lima percobaan gagal, penyerang bisa **mengunci akun siapa pun** hanya dengan sengaja salah password lima kali. Ia tidak perlu masuk — cukup membuat korban tidak bisa masuk. Karena itu aturannya: rate limit **dan** backoff eksponensial, per akun **dan** per IP — bukan penguncian tanpa syarat.',
      ),
      code(
        'js',
        `
        // Jeda yang naik: 1s, 2s, 4s, 8s, ... dengan batas atas
        const jedaDetik = Math.min(2 ** jumlahGagal, 300);
        `,
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
        'Selalu jawab **sama** — "kalau email terdaftar, kami sudah mengirim tautan" — baik emailnya ada maupun tidak.',
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
    ],
  ),

  written(
    'praktik-register-login',
    'Praktik: Register/login di Express dan Laravel',
    14,
    'Membangun alur autentikasi lengkap di kedua stack.',
    [
      p(
        'Latihan penutup Backend Basic: bangun pendaftaran dan login yang memenuhi **setiap** aturan di bab ini, di kedua framework yang sudah kamu pelajari.',
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
            return res.status(401).json({ error: { pesan: 'Email atau kata sandi salah' } });
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
                        'error' => ['pesan' => 'Email atau kata sandi salah'],
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

      h2('Ganti password — cabut sesi lain'),
      code(
        'php',
        `
        public function gantiKataSandi(GantiKataSandiRequest $request): JsonResponse
        {
            $user = $request->user();

            // Verifikasi password LAMA — jangan izinkan ganti hanya karena sesi aktif.
            if (! Hash::check($request->validated('kata_sandi_lama'), $user->password)) {
                return response()->json(['error' => ['pesan' => 'Kata sandi lama salah']], 422);
            }

            $user->update(['password' => $request->validated('kata_sandi_baru')]);

            // Cabut token dan sesi lain — kalau akun sempat dibajak,
            // ini yang mengeluarkan penyerangnya.
            $user->tokens()->delete();
            Auth::logoutOtherDevices($request->validated('kata_sandi_baru'));

            return response()->json(['data' => ['pesan' => 'Kata sandi diperbarui']]);
        }
        `,
      ),
      callout(
        'danger',
        'Ganti password yang tidak mencabut sesi lain hampir tidak berguna',
        'Alasan utama seseorang mengganti password adalah kecurigaan akun dibajak. Kalau sesi penyerang tetap aktif setelahnya, tindakan itu tidak mengubah apa pun bagi penyerang — dan korban mengira dirinya sudah aman.',
      ),

      h2('Uji seluruh jalur gagalnya'),
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
          body: 'Terapkan verifikasi terhadap hash palsu, satu pesan error, regenerasi sesi, dan rehash saat parameter dinaikkan.',
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
    ],
  ),
];
