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
 * Backend Intermediate — Chapter 5, all twelve lessons.
 *
 * Structured as OWASP Top 10 (2021) plus two additions the list folds into other categories but
 * that deserve their own treatment here: SSRF and secrets management.
 *
 * Written as rules with failure modes, not as options. Every item here has been the root cause of
 * a documented breach, and none of them announce themselves — an application with broken access
 * control behaves exactly like one with working access control until someone looks.
 */
export const lessons: LessonDraft[] = [
  written(
    'broken-access-control',
    'Broken Access Control',
    13,
    'Peringkat satu OWASP, dan kegagalan yang paling mahal.',
    [
      p(
        'Broken access control adalah kerentanan paling umum di aplikasi web. Ia menempati peringkat satu bukan karena sulit dicegah, melainkan karena **tidak menimbulkan gejala apa pun** — aplikasi yang bocor berperilaku persis seperti yang aman.',
      ),

      h2('Bentuk-bentuknya'),
      table(
        ['Bentuk', 'Contoh'],
        [
          ['**IDOR**', '`/api/faktur/1042` diganti jadi `1043`'],
          ['Fungsi tanpa penjagaan', '`POST /api/admin/hapus-pengguna` tanpa cek peran'],
          ['Escalation vertikal', 'Pengguna biasa memanggil endpoint admin'],
          ['Escalation horizontal', 'Pengguna A mengubah data pengguna B'],
          ['Mass assignment', 'Mengirim `{"peran":"admin"}` saat memperbarui profil'],
          ['CORS yang salah', 'Origin dipantulkan, sehingga situs mana pun bisa membaca'],
          ['Metadata dipercaya', 'Peran diambil dari body, bukan dari sesi terverifikasi'],
        ],
      ),

      h2('Tiga lapisan yang harus ada'),
      code(
        'js',
        `
        // Lapisan 1 — rute: apakah peran ini boleh menyentuh endpoint ini?
        router.delete('/:id', autentikasi, wajibIzin('artikel.hapus'), controller.hapus);

        // Lapisan 2 — objek: apakah pengguna ini boleh menyentuh BARIS ini?
        const artikel = await repo.cariSatu(id);
        if (artikel.penulisId !== req.pengguna.id) throw new KesalahanTidakDitemukan();

        // Lapisan 3 — query: penjagaan yang tidak bisa dilupakan
        await db.query(
          'DELETE FROM artikel WHERE id = $1 AND penulis_id = $2',
          [id, req.pengguna.id],
        );
        `,
      ),
      callout(
        'danger',
        'Lapisan ketiga yang paling sering hilang, dan yang paling penting',
        'Lapisan 1 dan 2 adalah pemeriksaan yang bisa dilupakan pada endpoint kesepuluh. Lapisan 3 melekat pada query itu sendiri — kalau ia ada, satu kesalahan di lapisan atas tidak berubah menjadi kebocoran data.',
      ),

      h2('Endpoint daftar adalah titik buta'),
      compare(
        {
          title: 'Bocor',
          lang: 'php',
          code: `
          public function index()
          {
              // Policy TIDAK dipanggil per baris.
              // Ini mengembalikan artikel SEMUA orang.
              return ArtikelResource::collection(
                  Artikel::paginate(20),
              );
          }
          `,
          notes: ['Policy lengkap, tetap bocor', 'Tidak ada error apa pun'],
        },
        {
          title: 'Aman',
          lang: 'php',
          code: `
          public function index(Request $r)
          {
              return ArtikelResource::collection(
                  Artikel::where('penulis_id', $r->user()->id)
                      ->paginate(20),
              );
          }
          `,
          notes: ['Penjagaan ada di query'],
        },
      ),

      h2('Default: tolak'),
      code(
        'js',
        `
        // SALAH: rute baru otomatis terbuka
        const TERLINDUNGI = ['/api/admin', '/api/pengguna'];
        if (TERLINDUNGI.includes(req.path)) periksaAuth(req);

        // BENAR: rute baru otomatis terlindungi
        const PUBLIK = ['/health', '/api/auth/masuk'];
        if (!PUBLIK.includes(req.path)) periksaAuth(req);
        `,
      ),
      p(
        'Perbedaan dua blok itu adalah perbedaan antara kelupaan yang merepotkan dan kelupaan yang membocorkan data.',
      ),

      h2('Menemukannya'),
      code(
        'bash',
        `
        # Buat dua pengguna, lalu coba setiap endpoint dengan token yang salah
        for jalur in /api/artikel/1 /api/artikel/1/komentar /api/berkas/1 /api/ekspor/job_1; do
          kode=$(curl -s -o /dev/null -w "%{http_code}" localhost:3000$jalur \\
            -H "Authorization: Bearer $TOKEN_ANA")
          echo "$jalur -> $kode"
        done
        # Setiap 200 untuk sumber daya milik Budi adalah temuan.
        `,
      ),
      code(
        'bash',
        `
        # Audit rute Laravel: cari yang kolom middleware-nya kosong
        php artisan route:list --json | jq -r '.[] | select(.middleware | contains("auth") | not) | .uri'
        `,
      ),

      h2('Menegakkannya dengan tes'),
      code(
        'ts',
        `
        // Salin untuk SETIAP sumber daya yang punya pemilik
        describe.each(['artikel', 'komentar', 'berkas'])('%s — otorisasi', (sumber) => {
          it('menolak akses milik pengguna lain', async () => {
            const ana = await buatPengguna();
            const budi = await buatPengguna();
            const milikBudi = await buat(sumber, { pemilikId: budi.id });

            for (const method of ['get', 'patch', 'delete'] as const) {
              const res = await request(app)[method](\`/api/\${sumber}/\${milikBudi.id}\`)
                .set('Authorization', bearer(ana));

              expect(res.status, \`\${method} \${sumber}\`).toBe(404);
            }
          });
        });
        `,
      ),
      callout(
        'tip',
        'Aturan yang dijaga tes bertahan; yang dijaga ingatan akan terlewat',
        'Kamu akan ingat memeriksa otorisasi pada endpoint pertama, kedua, dan kelima. Endpoint kesepuluh — yang ditambahkan buru-buru enam bulan kemudian — adalah yang bocor. Tes parametrik seperti di atas membuatnya mustahil terlewat.',
      ),
    ],
  ),

  written(
    'cryptographic-failures',
    'Cryptographic Failures & Data Sensitif',
    12,
    'Melindungi data saat bergerak dan saat diam.',
    [
      p(
        'Peringkat dua OWASP. Namanya menyesatkan: sebagian besar kasusnya bukan kriptografi yang dipecahkan, melainkan **kriptografi yang tidak dipakai** — data sensitif yang dikirim atau disimpan tanpa perlindungan sama sekali.',
      ),

      h2('Klasifikasikan datamu dulu'),
      table(
        ['Kelas', 'Contoh', 'Perlakuan'],
        [
          ['Rahasia', 'Password, kunci API, token', '**Hash** (satu arah) atau vault'],
          [
            'Sangat sensitif',
            'NIK, nomor kartu, data kesehatan',
            'Enkripsi at rest + akses terbatas',
          ],
          ['Sensitif', 'Email, telepon, alamat', 'TLS, jangan di log, minimalkan'],
          ['Publik', 'Nama tampilan, artikel terbit', 'Tidak perlu perlakuan khusus'],
        ],
      ),
      callout(
        'tip',
        'Data yang tidak kamu simpan tidak bisa bocor',
        'Kontrol paling efektif bukan enkripsi — melainkan **tidak mengumpulkannya**. Sebelum menambah kolom, tanyakan apakah aplikasinya benar-benar butuh data itu. Menyimpan NIK "untuk berjaga-jaga" adalah kewajiban hukum dan risiko yang kamu ambil tanpa manfaat.',
      ),

      h2('TLS di setiap hop'),
      code(
        'bash',
        `
        # Bukan hanya di tepi publik
        DATABASE_URL="postgresql://user:sandi@db:5432/app?sslmode=verify-full"
        REDIS_URL="rediss://cache:6380"
        `,
      ),
      callout(
        'danger',
        'Jangan pernah mematikan verifikasi sertifikat',
        '`rejectUnauthorized: false`, `verify=False`, dan `sslmode=require` (tanpa `verify-full`) meniadakan seluruh manfaat TLS — koneksinya terenkripsi tapi kamu tidak tahu sedang bicara dengan siapa. Trik ini biasanya masuk saat "sertifikatnya bermasalah di lokal", lalu ikut ter-deploy ke produksi.',
      ),

      h2('Hash vs enkripsi'),
      table(
        ['', 'Hash', 'Enkripsi'],
        [
          ['Arah', 'Satu arah', 'Dua arah'],
          ['Untuk', 'Password, token pembanding', 'Data yang harus dibaca kembali'],
          ['Algoritma', 'argon2id, bcrypt', 'AES-256-GCM'],
          ['Kalau kunci hilang', 'Tidak masalah', '**Data hilang selamanya**'],
        ],
      ),
      code(
        'js',
        `
        import crypto from 'node:crypto';

        // AES-256-GCM: terenkripsi DAN terautentikasi (tidak bisa diubah diam-diam)
        export function enkripsi(teks, kunci) {
          const iv = crypto.randomBytes(12);
          const cipher = crypto.createCipheriv('aes-256-gcm', kunci, iv);

          const data = Buffer.concat([cipher.update(teks, 'utf8'), cipher.final()]);
          const tag = cipher.getAuthTag();

          // IV dan tag disimpan bersama ciphertext — keduanya bukan rahasia.
          return Buffer.concat([iv, tag, data]).toString('base64');
        }
        `,
      ),
      callout(
        'danger',
        'Jangan pernah memakai mode tanpa autentikasi',
        'AES-CBC dan AES-ECB tidak mendeteksi perubahan — penyerang bisa mengubah ciphertext dan kamu tidak akan tahu. ECB bahkan membocorkan pola dalam data. Pakai **AES-256-GCM** atau XChaCha20-Poly1305, dan jangan pernah memakai ulang IV dengan kunci yang sama.',
      ),

      h2('Jangan menulis kripto sendiri'),
      code(
        'php',
        `
        // Laravel: pakai bawaannya
        protected function casts(): array
        {
            return [
                'nomor_ktp' => 'encrypted',
                'catatan_medis' => 'encrypted',
                'password' => 'hashed',
            ];
        }
        `,
      ),
      p(
        'Kunci untuk `encrypted` adalah `APP_KEY`. Kehilangannya berarti kehilangan datanya — jadi ia harus di-backup terpisah dari database, dan rotasinya butuh proses dekripsi-ulang yang direncanakan.',
      ),

      h2('Data sensitif di respons'),
      code(
        'js',
        `
        // BOCOR: SELECT * mengirim setiap kolom, termasuk yang baru
        const { rows } = await db.query('SELECT * FROM pengguna WHERE id = $1', [id]);
        res.json({ data: rows[0] });

        // AMAN: sebutkan kolomnya
        const { rows } = await db.query(
          'SELECT id, nama, email FROM pengguna WHERE id = $1', [id],
        );
        `,
      ),
      callout(
        'warning',
        'Kolom yang ditambahkan bulan depan otomatis ikut',
        'Ini yang membuat `SELECT *` berbahaya bukan hanya boros. Tambahkan `catatan_internal` atau `skor_risiko` ke tabel, dan endpoint yang tidak pernah disentuh siapa pun mulai mengirimkannya ke setiap klien.',
      ),

      h2('Jangan pernah di log'),
      code(
        'js',
        `
        redact: {
          paths: [
            'req.headers.authorization', 'req.headers.cookie',
            'password', '*.password', '*.kataSandi',
            'token', '*.token', '*.refreshToken',
            '*.nomorKtp', '*.kartuKredit',
          ],
          censor: '[DISENSOR]',
        },
        `,
      ),
      p(
        'Log diakses lebih banyak orang daripada database, disimpan bertahun-tahun, dan sering dikirim ke layanan pihak ketiga. Data yang masuk ke sana menyebar jauh lebih luas daripada yang kamu kira.',
      ),

      h2('Yang sudah tidak boleh dipakai'),
      table(
        ['Jangan', 'Pakai'],
        [
          ['MD5, SHA-1', 'SHA-256 untuk integritas; argon2 untuk password'],
          ['DES, 3DES, RC4', 'AES-256-GCM'],
          ['AES-ECB, AES-CBC tanpa MAC', 'AES-256-GCM'],
          ['`Math.random()` untuk token', '`crypto.randomBytes()`'],
          ['TLS 1.0/1.1', 'TLS 1.2 minimum, 1.3 lebih baik'],
        ],
      ),
      callout(
        'danger',
        '`Math.random()` tidak boleh untuk apa pun yang bersifat keamanan',
        'Ia tidak dirancang kriptografis — keluarannya bisa diprediksi dari beberapa nilai sebelumnya. Token reset password, id sesi, dan kunci idempotensi yang dibuat dengannya bisa ditebak. Selalu `crypto.randomBytes()` atau `crypto.randomUUID()`.',
      ),
    ],
  ),

  written(
    'injection',
    'Injection: SQL, NoSQL, Command',
    13,
    'Ketika data berubah menjadi perintah.',
    [
      p(
        'Semua injeksi punya bentuk yang sama: masukan yang seharusnya menjadi **nilai** malah dibaca sebagai **perintah**. Perbaikannya juga sama bentuknya — pisahkan perintah dari datanya, jangan berusaha menyaring karakter.',
      ),

      h2('SQL injection'),
      code(
        'js',
        `
        // RENTAN
        const q = \`SELECT * FROM pengguna WHERE email = '\${email}'\`;

        // AMAN — perintah dan nilai dikirim terpisah
        await db.query('SELECT * FROM pengguna WHERE email = $1', [email]);
        `,
      ),
      code(
        'js',
        `
        // Identifier TIDAK BISA diparameterkan -> allow-list
        const KOLOM = { judul: 'judul', tanggal: 'dibuat_pada' };
        const ARAH = { naik: 'ASC', turun: 'DESC' };

        const kolom = KOLOM[req.query.urut] ?? 'dibuat_pada';
        const arah = ARAH[req.query.arah] ?? 'DESC';

        // Nilainya berasal dari objek MILIKMU, bukan dari input yang dibersihkan.
        await db.query(\`SELECT ... ORDER BY \${kolom} \${arah} LIMIT $1\`, [batas]);
        `,
      ),

      h2('ORM tidak otomatis aman'),
      code(
        'ts',
        `
        // AMAN — tagged template diparameterkan
        await prisma.$queryRaw\`SELECT * FROM pengguna WHERE email = \${email}\`;

        // RENTAN — namanya sudah memperingatkan
        await prisma.$queryRawUnsafe(\`SELECT * FROM pengguna WHERE email = '\${email}'\`);
        `,
      ),
      code(
        'php',
        `
        // AMAN
        DB::select('SELECT * FROM pengguna WHERE email = ?', [$email]);
        User::where('email', $email)->first();

        // RENTAN
        DB::select("SELECT * FROM pengguna WHERE email = '{$email}'");
        User::whereRaw("email = '{$email}'")->first();
        `,
      ),

      h2('NoSQL injection'),
      code(
        'js',
        `
        // RENTAN: body JSON bisa berisi OPERATOR, bukan hanya nilai
        await db.collection('pengguna').findOne({
          email: req.body.email,
          kataSandi: req.body.kataSandi,
        });

        // Penyerang mengirim:
        // { "email": "admin@x.com", "kataSandi": { "$ne": null } }
        // -> cocok dengan password apa pun
        `,
      ),
      code(
        'js',
        `
        // AMAN: validasi tipe SEBELUM query
        const Skema = z.object({
          email: z.string().email(),
          kataSandi: z.string().min(1),
        }).strict();

        const { email, kataSandi } = Skema.parse(req.body);
        // Sekarang keduanya dijamin string, bukan objek operator.
        `,
      ),
      callout(
        'danger',
        'Ini kenapa validasi tipe adalah kontrol keamanan, bukan kerapian',
        'Pada NoSQL, sebuah field yang seharusnya string tapi ternyata objek mengubah arti query sepenuhnya. Skema yang memastikan tipenya menutup seluruh kelas serangan ini — dan `.strict()` menutup varian yang menyelipkan field tambahan.',
      ),

      h2('Command injection'),
      code(
        'js',
        `
        import { execFile } from 'node:child_process';

        // RENTAN: seluruh string diurai shell
        exec(\`convert \${namaBerkas} keluaran.png\`);
        // namaBerkas = "a.jpg; rm -rf /" -> dua perintah dijalankan

        // AMAN: argumen sebagai ARRAY, tanpa shell
        execFile('convert', [jalurMasuk, jalurKeluar], { timeout: 30_000 });
        `,
      ),
      ol(
        'Pakai API yang menerima **array argumen**, bukan string perintah.',
        'Jangan pernah menyalakan opsi `shell: true` dengan input pengguna.',
        'Allow-list executable yang boleh dijalankan.',
        'Beri timeout dan batas keluaran.',
        'Kalau ada library yang mengerjakannya di dalam proses, pakai itu — jangan panggil binary.',
      ),

      h2('Injeksi lain yang sering terlupa'),
      table(
        ['Jenis', 'Vektornya'],
        [
          ['Path traversal', '`../../etc/passwd` sebagai nama berkas'],
          ['LDAP injection', 'Filter LDAP dari input'],
          ['Template injection', 'Template dikompilasi dari input pengguna'],
          ['Header injection', '`\\r\\n` disisipkan ke header respons'],
          ['Log injection', 'Baris baru disisipkan ke log untuk memalsukan entri'],
          ['XXE', 'XML dengan entitas eksternal'],
        ],
      ),
      code(
        'js',
        `
        // Path traversal
        import path from 'node:path';

        const AKAR = path.resolve('/var/data/unggahan');
        const tujuan = path.resolve(AKAR, namaDariKlien);

        // Setelah resolve, pastikan masih di dalam akar
        if (!tujuan.startsWith(AKAR + path.sep)) {
          throw new KesalahanValidasi({ berkas: 'jalur tidak sah' });
        }
        `,
      ),
      callout(
        'warning',
        'Path traversal punya banyak bentuk',
        '`../`, `..%2f`, `....//`, dan jalur absolut semuanya harus tertutup. Karena itu jangan menyaring karakter — **resolve dulu, lalu bandingkan** dengan direktori akar. Lebih baik lagi: jangan pernah memakai nama dari klien sebagai jalur berkas sama sekali.',
      ),

      h2('Deserialisasi tidak aman'),
      code(
        'js',
        `
        // JANGAN deserialisasi data tidak tepercaya dengan format asli:
        // Python pickle, PHP unserialize, Java serialization, YAML full-load.
        // Semuanya bisa membuat objek arbitrer -> eksekusi kode.

        // Pakai JSON + validasi skema.
        const data = SkemaData.parse(JSON.parse(teks));
        `,
      ),

      h2('Pertahanan berlapis'),
      p(
        'Parameterisasi menutup celahnya. Dua lapisan berikutnya membatasi kerusakan kalau ada yang lolos:',
      ),
      ul(
        '**Hak akses database minimum** — aplikasi yang tidak pernah mengubah skema tidak boleh terhubung sebagai pemilik skema.',
        '**Validasi skema** — menolak bentuk yang salah sebelum mencapai query.',
        '**Batas ukuran** — muatan injeksi sering panjang.',
        '**Pemantauan** — permintaan yang cocok dengan pola injeksi layak dicatat dan diberi alert.',
      ),
    ],
  ),

  written(
    'insecure-design',
    'Insecure Design & Threat Modeling Ringkas',
    11,
    'Kerentanan yang tidak bisa ditambal karena ia ada di rancangannya.',
    [
      p(
        'Sebagian besar kategori OWASP adalah kesalahan **implementasi** — kodenya salah, perbaiki kodenya. *Insecure design* berbeda: fiturnya berjalan persis seperti yang dirancang, dan rancangan itulah yang bermasalah.',
      ),

      h2('Contoh'),
      table(
        ['Rancangan', 'Kenapa bermasalah'],
        [
          ['Reset password lewat pertanyaan rahasia', 'Jawabannya sering bisa dicari publik'],
          [
            'Kode OTP 4 digit tanpa batas percobaan',
            'Sepuluh ribu kemungkinan — habis dalam menit',
          ],
          ['Kupon tanpa batas pemakaian per akun', 'Bisa dipakai berulang lewat akun baru'],
          ['Harga dikirim dari klien', 'Klien bisa mengirim harga berapa pun'],
          ['Ekspor tanpa batas laju', 'Satu akun bisa menarik seluruh basis data'],
          ['Undangan tanpa kedaluwarsa', 'Tautan lama tetap memberi akses selamanya'],
        ],
      ),
      callout(
        'danger',
        'Harga dari klien adalah kesalahan rancangan klasik',
        'Toko yang menerima `{"produkId": 7, "harga": 1}` dan memakainya akan menjual apa pun seharga satu rupiah. Validasi tidak menolongnya — `1` adalah angka yang sah. Perbaikannya struktural: **harga diambil server dari database**, klien hanya mengirim id dan jumlah.',
      ),

      h2('Threat modeling dalam empat pertanyaan'),
      steps(
        {
          title: '1. Apa yang sedang kita bangun?',
          body: 'Gambar alur datanya. Di mana data masuk, ke mana ia pergi, siapa yang menyentuhnya. Batas kepercayaan ada di setiap panah yang menyeberang dari luar ke dalam.',
        },
        {
          title: '2. Apa yang bisa salah?',
          body: 'Untuk tiap batas, tanyakan: bisakah dipalsukan, diubah, disangkal, dibocorkan, dibanjiri, atau dinaikkan haknya? Itu enam pertanyaan STRIDE, tanpa perlu menghafal namanya.',
        },
        {
          title: '3. Apa yang akan kita lakukan?',
          body: 'Untuk tiap risiko: mitigasi, hilangkan fiturnya, alihkan ke pihak lain, atau terima secara sadar dan tertulis. Menerima risiko itu sah — yang tidak sah adalah tidak menyadarinya.',
        },
        {
          title: '4. Apakah kita sudah cukup baik?',
          body: 'Tinjau ulang setelah implementasi. Fitur yang berubah di tengah jalan sering membatalkan mitigasi yang direncanakan di awal.',
        },
      ),

      h2('Contoh singkat: fitur "bagikan tautan"'),
      code(
        'text',
        `
        Fitur: pengguna bisa membagikan artikel privat lewat tautan.

        Batas kepercayaan: siapa pun yang memegang tautan.

        Yang bisa salah:
          - Tautan diteruskan ke orang yang tidak dimaksud
          - Tautan muncul di log server dan header Referer
          - Tautan bisa ditebak kalau id-nya berurutan
          - Tautan berlaku selamanya, jauh setelah tidak dibutuhkan
          - Tidak ada cara mencabutnya

        Keputusan:
          - Token acak 32 byte, BUKAN id artikel
          - Kedaluwarsa wajib, default 7 hari
          - Bisa dicabut oleh pemiliknya kapan saja
          - Halaman berbagi memakai Referrer-Policy: no-referrer
          - Catat setiap akses, tampilkan ke pemiliknya
          - DITERIMA: siapa pun yang memegang tautan bisa membaca.
            Ini memang inti fiturnya. Dinyatakan jelas di antarmuka.
        `,
      ),
      callout(
        'tip',
        'Baris terakhir sama pentingnya dengan yang lain',
        'Risiko yang **diterima secara sadar dan tertulis** bukan kelalaian — ia keputusan. Yang berbahaya adalah risiko yang tidak pernah disebut, karena tidak ada yang bisa meninjaunya ulang saat keadaan berubah.',
      ),

      h2('Kapan melakukannya'),
      p(
        'Bukan untuk setiap perubahan. Lakukan saat fitur menyentuh salah satu dari ini: **uang, identitas, data pribadi, izin, atau integrasi luar**. Tiga puluh menit di depan papan tulis jauh lebih murah daripada perbaikan setelah rilis.',
      ),

      h2('Pola rancangan yang aman'),
      table(
        ['Prinsip', 'Wujudnya'],
        [
          ['Gagal ke keadaan tertutup', 'Error di pemeriksaan izin berarti tolak, bukan izinkan'],
          ['Hak minimum', 'Setiap identitas hanya punya yang benar-benar dibutuhkan'],
          ['Pertahanan berlapis', 'Otorisasi di rute, di objek, **dan** di query'],
          ['Server yang menentukan', 'Harga, peran, dan kepemilikan tidak pernah dari klien'],
          ['Batas di mana-mana', 'Ukuran, laju, jumlah, masa berlaku'],
          ['Bisa diaudit', 'Aksi penting meninggalkan jejak yang tidak bisa dihapus pelakunya'],
        ],
      ),
    ],
  ),

  written(
    'security-misconfiguration',
    'Security Misconfiguration & Header',
    12,
    'Kodenya benar, pengaturannya yang membuka pintu.',
    [
      h2('Kesalahan konfigurasi yang paling sering'),
      table(
        ['Kesalahan', 'Akibat'],
        [
          [
            'Mode debug menyala di produksi',
            'Stack trace, variabel environment, struktur query terekspos',
          ],
          ['Kredensial default tidak diganti', 'Masuk tanpa usaha'],
          ['Endpoint admin/metrik terbuka', 'Data internal dan kontrol sistem'],
          ['Direktori bisa dijelajahi', 'Berkas yang tidak dimaksudkan publik'],
          ['Header keamanan tidak dipasang', 'XSS, clickjacking, downgrade'],
          ['Bucket storage publik', 'Kebocoran massal'],
          ['CORS memantulkan origin', 'Situs mana pun bisa membaca API-mu'],
          ['Document root salah', '`.env` bisa diunduh lewat web'],
        ],
      ),
      callout(
        'danger',
        '`APP_DEBUG=true` di produksi Laravel membocorkan hampir segalanya',
        'Halaman errornya menampilkan stack trace, potongan kode, isi variabel — dan pada beberapa versi, isi environment termasuk kredensial database. Satu error yang dipicu sengaja sudah cukup. Pastikan `APP_DEBUG=false` dan `APP_ENV=production`.',
      ),

      h2('Header keamanan'),
      code(
        'js',
        `
        app.use(helmet({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              objectSrc: ["'none'"],
              frameAncestors: ["'self'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
              upgradeInsecureRequests: [],
            },
          },
          hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true },
          referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
          crossOriginOpenerPolicy: { policy: 'same-origin' },
        }));

        app.disable('x-powered-by');
        `,
      ),
      table(
        ['Header', 'Melindungi dari'],
        [
          ['`Content-Security-Policy`', 'XSS — membatasi sumber skrip yang boleh berjalan'],
          ['`Strict-Transport-Security`', 'Penurunan ke HTTP'],
          ['`X-Content-Type-Options: nosniff`', 'Browser menebak tipe lalu mengeksekusinya'],
          ['`Referrer-Policy`', 'URL bocor ke situs lain'],
          ['`X-Frame-Options` / `frame-ancestors`', 'Clickjacking'],
          ['`Permissions-Policy`', 'Akses kamera/mikrofon/lokasi yang tidak diminta'],
        ],
      ),
      callout(
        'warning',
        'CSP dengan `unsafe-inline` pada `script-src` hampir meniadakan manfaatnya',
        'Justru skrip inline yang paling sering menjadi vektor XSS. Kalau aplikasimu membutuhkannya, pakai **nonce** yang dihasilkan per permintaan — bukan `unsafe-inline` permanen. Untuk `style-src`, `unsafe-inline` jauh lebih bisa diterima.',
      ),

      h2('Yang harus dimatikan di produksi'),
      code(
        'bash',
        `
        # Laravel
        APP_DEBUG=false
        APP_ENV=production

        # Node
        NODE_ENV=production

        # Jangan pernah menyalakan ini di produksi:
        #   - GraphQL introspection
        #   - Halaman dokumentasi API yang tidak dilindungi
        #   - Dashboard antrean/monitoring tanpa auth
        #   - Endpoint /metrics terbuka
        #   - Berkas .map sumber untuk kode server
        `,
      ),

      h2('Endpoint yang sering lupa dilindungi'),
      code(
        'php',
        `
        // Semuanya butuh gate — "tidak ditautkan di mana pun" bukan kontrol akses
        Gate::define('viewHorizon', fn ($u) => $u->peran === 'admin');
        Gate::define('viewTelescope', fn ($u) => $u->peran === 'admin');
        Gate::define('viewPulse', fn ($u) => $u->peran === 'admin');
        `,
      ),
      callout(
        'danger',
        'Dashboard pemantauan memperlihatkan data yang lewat sistemmu',
        'Horizon memperlihatkan payload job, Telescope memperlihatkan permintaan lengkap beserta body-nya. Dibiarkan terbuka, keduanya memberi lebih banyak informasi daripada endpoint API mana pun — termasuk data yang sudah kamu susah-payah lindungi di tempat lain.',
      ),

      h2('Document root'),
      code(
        'text',
        `
        # BENAR — hanya public/ yang terjangkau web
        root /var/www/app/public;

        # SALAH — .env, storage/, dan vendor/ bisa diunduh
        root /var/www/app;
        `,
      ),

      h2('Verifikasi, jangan berasumsi'),
      code(
        'bash',
        `
        # Header pada server yang BENAR-BENAR berjalan
        curl -sI https://api.contoh.com | grep -iE \\
          "content-security-policy|strict-transport|x-content-type|referrer-policy|x-frame"

        # Berkas yang seharusnya tidak terjangkau
        for f in .env .git/config composer.json package.json .env.backup; do
          kode=$(curl -s -o /dev/null -w "%{http_code}" https://contoh.com/$f)
          echo "$f -> $kode"     # harus 404, bukan 200
        done

        # Endpoint internal
        for e in /metrics /horizon /telescope /debug /admin /api/openapi.json; do
          kode=$(curl -s -o /dev/null -w "%{http_code}" https://contoh.com$e)
          echo "$e -> $kode"     # harus 401/403/404, bukan 200
        done

        # Mode debug
        curl -s https://contoh.com/rute-yang-tidak-ada | grep -iE "stack trace|vendor/|APP_KEY" \\
          && echo "DEBUG MENYALA — perbaiki segera"
        `,
      ),
      callout(
        'tip',
        'Jadikan ini bagian dari checklist rilis',
        'Konfigurasi yang benar di berkas tapi tidak diterapkan di server adalah kegagalan yang paling mudah terlewat — dan paling mudah dideteksi. Sepuluh baris `curl` di atas menangkap sebagian besar kesalahan konfigurasi yang pernah menyebabkan kebocoran.',
      ),
    ],
  ),

  written(
    'vulnerable-components',
    'Komponen Rentan & Audit Dependency',
    11,
    'Kerentanan yang kamu warisi tanpa menulis satu baris pun.',
    [
      p(
        'Aplikasi modern menjalankan lebih banyak kode orang lain daripada kode sendiri. Satu paket dengan kerentanan berjalan dengan **hak penuh aplikasimu** — akses database, rahasia, dan jaringan internal.',
      ),

      h2('Memeriksa'),
      code(
        'bash',
        `
        npm audit
        npm audit --production          # abaikan devDependencies
        npm audit fix                   # perbaikan yang tidak memutus
        npm outdated

        composer audit
        composer outdated --direct
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menjalankan `npm audit fix --force` tanpa membaca akibatnya',
        'Ia boleh menurunkan versi mayor untuk menutup kerentanan — dan bisa mengembalikan framework-mu ke versi bertahun-tahun lalu. Project ini pernah menghadapinya: `--force` akan menurunkan Next.js 16 ke 9.3.3 (rilis 2020). Perbaikannya memakai `overrides` untuk menambal paket transitif saja, dan keputusannya dicatat.',
      ),
      code(
        'json',
        `
        {
          "overrides": {
            "postcss": "8.5.25",
            "sharp": "0.35.3"
          }
        }
        `,
      ),
      p(
        'Kalau kamu memakai `overrides`, tulis alasannya di dekatnya. Tanpa catatan, orang berikutnya akan menghapusnya karena mengira itu sisa eksperimen.',
      ),

      h2('Membaca laporan audit'),
      table(
        ['Pertanyaan', 'Kenapa penting'],
        [
          [
            'Apakah kode rentannya benar-benar terpanggil?',
            'Kerentanan di jalur yang tidak dipakai berisiko rendah',
          ],
          ['Langsung atau transitif?', 'Transitif butuh `overrides` atau menunggu pemeliharanya'],
          ['Produksi atau hanya devDependency?', 'Yang hanya di build tidak terekspos ke pengguna'],
          ['Apakah butuh input pengguna untuk dipicu?', 'Menentukan urgensinya'],
          ['Ada perbaikan tanpa perubahan yang memutus?', 'Menentukan cara menambalnya'],
        ],
      ),

      h2('Sebelum menambah dependency'),
      ol(
        '**Apakah benar-benar perlu?** Fungsi tujuh baris tidak layak ditukar dengan pohon dependency.',
        '**Kapan terakhir diperbarui?** Paket yang mati tidak akan pernah menerima perbaikan keamanan.',
        '**Berapa dependency yang ikut?** Satu paket bisa menarik tiga puluh.',
        '**Siapa pemeliharanya?** Satu orang tanpa penerus adalah risiko keberlanjutan.',
        '**Namanya benar?** Typosquatting nyata: `expres`, `lodahs`, `crossenv`.',
      ),
      callout(
        'danger',
        'Serangan rantai pasok menargetkan momen pemasangan',
        'Skrip `postinstall` berjalan dengan hak penggunamu, di laptopmu dan di CI. Paket berbahaya memakainya untuk membaca variabel environment, mencuri token npm, dan menanam backdoor. Untuk CI, pertimbangkan `npm ci --ignore-scripts` bila paketmu tidak membutuhkannya.',
      ),

      h2('Lockfile'),
      code(
        'bash',
        `
        npm ci            # PATUH pada lockfile; gagal kalau tidak cocok
        npm install       # boleh memperbarui lockfile

        composer install  # dari composer.lock
        composer update   # perbarui dan tulis ulang lockfile
        `,
      ),
      callout(
        'warning',
        'CI harus memakai `npm ci`, bukan `npm install`',
        '`npm install` boleh menyelesaikan versi berbeda dari lockfile. Artinya yang diuji CI bisa berbeda dari yang dipasang di produksi — dan perbedaan itu bisa memuat paket yang tidak pernah kamu tinjau.',
      ),

      h2('Otomatiskan'),
      code(
        'yaml',
        `
        # .github/dependabot.yml
        version: 2
        updates:
          - package-ecosystem: npm
            directory: /
            schedule: { interval: weekly }
            open-pull-requests-limit: 5
            groups:
              patch-minor:
                update-types: [patch, minor]
        `,
      ),
      p(
        'Mengelompokkan patch dan minor menjadi satu PR membuat pembaruan rutin tidak melelahkan — sementara mayor tetap terpisah supaya bisa ditinjau sungguhan.',
      ),

      h2('Gerbang di CI'),
      code(
        'yaml',
        `
        - name: Audit dependency
          run: |
            npm audit --production --audit-level=high
            # Gagalkan build kalau ada kerentanan tinggi di dependency produksi.
        `,
      ),

      h2('Yang paling sering terlupa'),
      ul(
        '**Image dasar container** — `node:22-alpine` juga punya kerentanan sistem operasi.',
        '**Action di CI** — pin ke SHA commit, bukan ke tag yang bisa dipindahkan.',
        '**Ekstensi database** dan versi database itu sendiri.',
        '**Dependency di devDependencies** — ia berjalan di CI dengan akses ke rahasia deploy.',
      ),
      callout(
        'tip',
        'Pembaruan rutin lebih murah daripada pembaruan darurat',
        'Project yang diperbarui mingguan hampir tidak pernah menghadapi lompatan besar. Project yang dibiarkan setahun akan menemukan bahwa menutup satu kerentanan membutuhkan upgrade mayor tiga paket sekaligus — biasanya pada hari kerentanannya diumumkan publik.',
      ),
    ],
  ),

  written(
    'auth-failures',
    'Kegagalan Identifikasi & Autentikasi',
    12,
    'Cara masuk yang bisa ditembus tanpa mengetahui password.',
    [
      h2('Bentuk kegagalannya'),
      table(
        ['Kegagalan', 'Akibat'],
        [
          ['Tanpa batas percobaan', 'Password bisa ditebak habis'],
          ['Password lemah diizinkan', 'Credential stuffing berhasil'],
          ['Pesan error membedakan', 'Akun bisa dienumerasi'],
          ['Sesi tidak diregenerasi', 'Session fixation'],
          ['Sesi tidak kedaluwarsa', 'Perangkat hilang tetap punya akses'],
          ['Token reset bisa dipakai ulang', 'Pengambilalihan akun'],
          ['MFA tanpa rate limit', 'Kode enam digit ditebak habis'],
          ['Ganti password tidak mencabut sesi', 'Penyerang tetap masuk'],
        ],
      ),

      h2('Login yang benar'),
      code(
        'js',
        `
        const HASH_PALSU = await argon2.hash(crypto.randomBytes(32).toString('hex'));

        export async function masuk(req, res) {
          const { email, kataSandi } = req.body;

          // Rate limit per akun DAN per IP
          const kunci = \`masuk:\${email.toLowerCase()}\`;
          if (await terlaluBanyak(kunci) || await terlaluBanyak(\`ip:\${req.ip}\`)) {
            return res.status(429).json({
              error: { kode: 'TERLALU_BANYAK', pesan: 'Terlalu banyak percobaan. Coba lagi nanti.' },
            });
          }

          const pengguna = await repo.cariByEmail(email);

          // Verifikasi tetap dijalankan walau pengguna tidak ada ->
          // waktu responsnya seragam, tidak membocorkan keberadaan akun.
          const cocok = await argon2.verify(pengguna?.kataSandiHash ?? HASH_PALSU, kataSandi);

          if (pengguna === null || !cocok) {
            await catatGagal(kunci, req.ip);
            // SATU pesan untuk kedua kemungkinan.
            return res.status(401).json({
              error: { kode: 'KREDENSIAL_SALAH', pesan: 'Email atau kata sandi salah' },
            });
          }

          if (pengguna.dinonaktifkan) {
            // Pesan yang sama juga di sini — jangan ungkap status akun.
            return res.status(401).json({
              error: { kode: 'KREDENSIAL_SALAH', pesan: 'Email atau kata sandi salah' },
            });
          }

          await bersihkanHitungan(kunci);

          // Naikkan biaya hash kalau parameternya sudah dinaikkan
          if (argon2.needsRehash(pengguna.kataSandiHash)) {
            await repo.perbaruiHash(pengguna.id, await argon2.hash(kataSandi));
          }

          // Regenerasi sesi -> cegah session fixation
          await regenerasiSesi(req);
          req.session.penggunaId = pengguna.id;

          log.info({ penggunaId: pengguna.id, ip: req.ip }, 'login berhasil');
          res.json({ data: { id: pengguna.id, nama: pengguna.nama } });
        }
        `,
      ),
      callout(
        'danger',
        'Waktu respons juga membocorkan',
        'Kalau email tidak ada dan kamu langsung `return`, responsnya jauh lebih cepat daripada saat hash sungguhan diverifikasi. Selisih itu bisa diukur, dan ia sama saja dengan pesan error yang berbeda. Verifikasi terhadap hash palsu menutupnya.',
      ),

      h2('Aturan password'),
      ul(
        '**Minimal 12 karakter** — panjang lebih penting daripada kerumitan.',
        '**Batas atas** 200–256 karakter — hashing string raksasa membebani CPU.',
        '**Jangan larang karakter apa pun**, termasuk spasi dan emoji.',
        '**Periksa kebocoran** lewat Have I Been Pwned (k-anonymity, password tidak dikirim).',
        '**Jangan paksa ganti berkala** tanpa indikasi kompromi — praktik itu menghasilkan password lebih lemah.',
      ),

      h2('Reset password'),
      code(
        'js',
        `
        export async function mintaReset(req, res) {
          const pengguna = await repo.cariByEmail(req.body.email);

          if (pengguna !== null) {
            const token = crypto.randomBytes(32).toString('base64url');

            await repo.simpanTokenReset({
              penggunaId: pengguna.id,
              // Simpan HASH-nya. Database bocor tidak berarti akun bisa diambil alih.
              hash: sha256(token),
              kedaluwarsaPada: new Date(Date.now() + 60 * 60_000),
            });

            await antrean.tambah('email-reset', { penggunaId: pengguna.id, token });
          }

          // Jawaban SAMA baik email terdaftar maupun tidak.
          res.json({
            data: { pesan: 'Kalau email terdaftar, kami sudah mengirim tautan reset.' },
          });
        }
        `,
      ),
      ol(
        'Token acak berentropi tinggi, disimpan sebagai hash.',
        'Berumur pendek: 15–60 menit.',
        '**Sekali pakai** — hapus begitu dipakai.',
        'Cabut **semua** sesi dan refresh token setelah password diganti.',
        'Rate limit permintaan resetnya — kalau tidak, ia jadi alat pengeboman email.',
        'Beri tahu pemilik lewat email bahwa passwordnya baru saja diganti.',
      ),

      h2('MFA'),
      code(
        'js',
        `
        // Kode 6 digit = satu juta kemungkinan.
        // Tanpa batas, ia habis dalam hitungan menit.
        if (await hitungGagalOtp(penggunaId) >= 5) {
          await batalkanKodeOtp(penggunaId);   // kode dibatalkan, bukan sekadar ditolak
          return res.status(429).json({ error: { pesan: 'Terlalu banyak percobaan' } });
        }

        // Perbandingan waktu-konstan
        const sah = crypto.timingSafeEqual(
          Buffer.from(kodeDikirim.padEnd(6)),
          Buffer.from(kodeBenar.padEnd(6)),
        );
        `,
      ),
      callout(
        'danger',
        'Rate limit pada OTP adalah yang paling sering terlupa',
        'MFA dipasang untuk melindungi akun, lalu endpoint verifikasinya dibiarkan tanpa batas percobaan — dan seluruh manfaatnya hilang. Batasi ketat, dan **batalkan kodenya** setelah beberapa kegagalan, jangan hanya menolak percobaan itu.',
      ),

      h2('Manajemen sesi'),
      table(
        ['Peristiwa', 'Yang harus terjadi'],
        [
          ['Login berhasil', 'Regenerasi ID sesi'],
          ['Keluar', 'Cabut di **server**, bukan hanya hapus cookie'],
          ['Ganti password', 'Cabut **semua** sesi'],
          ['Perubahan peran', 'Cabut semua, atau naikkan versi token'],
          ['Tidak aktif lama', 'Kedaluwarsa otomatis'],
          ['Terdeteksi anomali', 'Cabut dan beri tahu pemiliknya'],
        ],
      ),

      h2('Catat dan pantau'),
      code(
        'js',
        `
        log.warn({
          peristiwa: 'login_gagal',
          email: samarkan(email),      // jangan catat email lengkap
          ip: req.ip,
          beruntun: jumlah,
        }, 'percobaan masuk gagal');
        `,
      ),
      p(
        'Pasang alert untuk lonjakan kegagalan login, login dari lokasi yang tidak biasa, dan banyak akun berbeda yang dicoba dari satu IP — pola credential stuffing.',
      ),
    ],
  ),

  written(
    'integrity-failures',
    'Integritas Software & Data',
    11,
    'Memastikan yang berjalan memang yang kamu maksud.',
    [
      p(
        'Kategori ini tentang **kepercayaan pada asal**: apakah kode yang berjalan benar-benar yang kamu tulis, dan apakah data yang kamu terima benar-benar dari pihak yang mengaku mengirimnya.',
      ),

      h2('Integritas rantai pasok'),
      code(
        'bash',
        `
        # Lockfile menjamin versi yang sama persis
        npm ci
        composer install

        # Skrip pemasangan berjalan dengan hakmu — di laptop dan di CI
        npm ci --ignore-scripts    # kalau paketmu tidak membutuhkannya
        `,
      ),
      code(
        'yaml',
        `
        # Pin action ke SHA, bukan tag — tag bisa dipindahkan pemiliknya
        - uses: actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608   # v4.1.0
        `,
      ),
      callout(
        'danger',
        'Tag Git bisa dipindahkan; SHA tidak',
        'Repositori action yang dibajak bisa memindahkan tag `v4` ke commit berbahaya, dan setiap workflow yang memakai `@v4` langsung menjalankannya — dengan akses ke seluruh rahasia CI-mu. Menyematkan SHA menutupnya sepenuhnya.',
      ),

      h2('Verifikasi webhook'),
      code(
        'js',
        `
        export function verifikasiWebhook(req, res, next) {
          const tandaTangan = req.headers['x-signature'];
          const timestamp = req.headers['x-timestamp'];

          if (typeof tandaTangan !== 'string' || typeof timestamp !== 'string') {
            return res.status(401).end();
          }

          // Tolak yang terlalu lama -> cegah replay attack
          const umur = Math.abs(Date.now() / 1000 - Number(timestamp));
          if (!Number.isFinite(umur) || umur > 300) return res.status(401).end();

          // WAJIB memakai body MENTAH, bukan hasil parse —
          // urutan kunci JSON bisa berubah dan tanda tangannya jadi tidak cocok.
          const diharapkan = crypto
            .createHmac('sha256', env.WEBHOOK_SECRET)
            .update(\`\${timestamp}.\${req.rawBody}\`)
            .digest('hex');

          const a = Buffer.from(tandaTangan);
          const b = Buffer.from(diharapkan);

          // Perbandingan waktu-konstan
          if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            log.warn({ ip: req.ip }, 'tanda tangan webhook tidak sah');
            return res.status(401).end();
          }

          next();
        }
        `,
      ),
      code(
        'js',
        `
        // Simpan body mentah SEBELUM di-parse
        app.use(express.json({
          limit: '100kb',
          verify: (req, res, buf) => { req.rawBody = buf.toString('utf8'); },
        }));
        `,
      ),
      callout(
        'danger',
        'Webhook tanpa verifikasi tanda tangan adalah endpoint publik yang dipercaya',
        'Siapa pun yang tahu URL-nya bisa mengirim "pembayaran berhasil" ke sistemmu. URL yang sulit ditebak bukan kontrol akses — dan URL itu muncul di log, di dokumentasi, dan di riwayat konfigurasi.',
      ),

      h2('Webhook harus idempoten'),
      code(
        'js',
        `
        // Pengirim webhook memakai jaminan at-least-once:
        // kalau jawabanmu lambat atau gagal, mereka MENGIRIM ULANG.
        const idPeristiwa = req.body.id;

        const sudah = await db.klaimPeristiwaWebhook(idPeristiwa);
        if (!sudah) {
          log.info({ idPeristiwa }, 'webhook duplikat, dilewati');
          return res.status(200).end();   // tetap 200, supaya tidak diulang lagi
        }

        await proses(req.body);
        res.status(200).end();
        `,
      ),
      callout(
        'warning',
        'Jawab `200` untuk duplikat, bukan error',
        'Menjawab `4xx` atau `5xx` membuat pengirim mencoba lagi — untuk peristiwa yang sudah berhasil kamu proses. Duplikat yang terdeteksi bukan kegagalan; ia hasil yang benar.',
      ),

      h2('Jangan deserialisasi data tidak tepercaya'),
      code(
        'php',
        `
        // BERBAHAYA: bisa membuat objek arbitrer -> eksekusi kode
        $data = unserialize($input);

        // AMAN
        $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);
        // lalu validasi bentuknya
        `,
      ),
      p(
        'Berlaku juga untuk `pickle` di Python, serialisasi native Java, dan `yaml.load` tanpa loader aman. Semuanya bisa membangun objek arbitrer saat mengurai.',
      ),

      h2('Integritas data dan jejak audit'),
      code(
        'sql',
        `
        CREATE TABLE audit_log (
          id         BIGSERIAL PRIMARY KEY,
          aktor_id   BIGINT,
          aksi       VARCHAR(50)  NOT NULL,
          objek_tipe VARCHAR(50)  NOT NULL,
          objek_id   BIGINT       NOT NULL,
          sebelum    JSONB,
          sesudah    JSONB,
          ip         VARCHAR(45),
          waktu      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
        );

        -- Hanya INSERT. Aplikasi TIDAK boleh bisa mengubah atau menghapusnya.
        REVOKE UPDATE, DELETE ON audit_log FROM app_user;
        `,
      ),
      callout(
        'tip',
        'Audit log yang bisa diubah pelakunya bukan audit log',
        'Kalau akun aplikasi bisa `DELETE` dari tabel itu, penyerang yang menguasainya akan menghapus jejaknya. Cabut izinnya di lapisan database, dan salin ke penyimpanan terpisah yang append-only.',
      ),

      h2('Kode yang berjalan'),
      ul(
        'CI/CD hanya boleh men-deploy dari commit yang sudah melewati review.',
        'Artefak build ditandatangani atau setidaknya di-hash dan dicatat.',
        'Image container di-pin ke digest, bukan ke tag `latest`.',
        'Tidak ada yang bisa menyunting kode langsung di server produksi.',
      ),
    ],
  ),

  written(
    'logging-monitoring-failures',
    'Kegagalan Logging & Monitoring',
    11,
    'Kerentanan yang membuat semua kerentanan lain lebih mahal.',
    [
      p(
        'Peringkat sembilan OWASP, dan yang paling sering dianggap sudah beres. Ia tidak memungkinkan serangan — tapi ia menentukan berapa lama serangan berlangsung sebelum ada yang menyadarinya, dan apakah kamu bisa menjawab "apa saja yang diambil".',
      ),

      h2('Bentuk kegagalannya'),
      table(
        ['Kegagalan', 'Akibat'],
        [
          ['Peristiwa keamanan tidak dicatat', 'Tidak ada jejak untuk diselidiki'],
          ['Log hanya di disk instance', 'Hilang bersama instance yang dibuang'],
          ['Tidak ada alert', 'Serangan berlangsung berbulan-bulan'],
          ['Log memuat rahasia', 'Log itu sendiri jadi target'],
          ['Tanpa id korelasi', 'Tidak bisa merangkai satu permintaan'],
          ['Retensi terlalu pendek', 'Kejadian lama tidak bisa ditelusuri'],
        ],
      ),

      h2('Yang wajib dicatat'),
      code(
        'js',
        `
        const PERISTIWA_KEAMANAN = [
          'login_berhasil', 'login_gagal', 'logout',
          'password_diganti', 'password_reset_diminta',
          'mfa_diaktifkan', 'mfa_gagal',
          'otorisasi_ditolak',
          'peran_diubah', 'izin_diberikan',
          'akun_dinonaktifkan',
          'token_dicabut', 'token_dipakai_ulang',
          'aksi_admin',
          'data_diekspor',
        ];

        log.warn({
          peristiwa: 'otorisasi_ditolak',
          aktorId: req.pengguna?.id,
          aksi: 'artikel.hapus',
          objekId: req.params.id,
          ip: req.ip,
          reqId: req.id,
        }, 'akses ditolak');
        `,
      ),
      p('Setiap catatan butuh lima hal: **kapan, siapa, apa, target apa, dan hasilnya**.'),

      h2('Yang tidak boleh dicatat'),
      callout(
        'danger',
        'Log adalah tempat kebocoran yang sering terlupa',
        'Password, token, header `Authorization`, nomor kartu, dan data pribadi mentah. "Catat seluruh request body supaya gampang debug" adalah cara paling umum kredensial berakhir di sistem yang diakses banyak orang dan disimpan bertahun-tahun.',
      ),

      h2('Log harus selamat dari instance yang dibobol'),
      code(
        'bash',
        `
        # Aplikasi menulis ke stdout; lingkungan yang mengumpulkan.
        # Penyerang yang menguasai satu instance tidak bisa menghapus
        # log yang sudah terkirim keluar.
        node server.js
        `,
      ),

      h2('Log tanpa alert adalah arsip'),
      table(
        ['Pola', 'Kemungkinan artinya'],
        [
          ['Lonjakan `5xx`', 'Ada yang rusak, atau sedang dieksploitasi'],
          ['Kegagalan login beruntun satu akun', 'Penebakan password'],
          ['Banyak akun dicoba dari satu IP', 'Credential stuffing'],
          ['Lonjakan penolakan otorisasi', 'Seseorang memetakan aksesnya'],
          ['Permintaan cocok pola injeksi', 'Pemindaian aktif'],
          ['Ekspor data di luar jam biasa', 'Kemungkinan eksfiltrasi'],
          ['Refresh token dipakai ulang', '**Token dicuri**'],
        ],
      ),
      callout(
        'tip',
        'Baris terakhir layak diberi alert tertinggi',
        'Refresh token yang sudah dirotasi lalu muncul lagi hampir pasti berarti pencurian. Sistemmu sudah mencabut keluarganya secara otomatis — tapi kamu tetap perlu tahu, karena itu berarti ada jalur kebocoran yang belum kamu temukan.',
      ),

      h2('Alert yang tidak melelahkan'),
      ol(
        'Beri ambang yang masuk akal — satu login gagal itu normal.',
        'Kelompokkan peristiwa serupa, jangan satu alert per kejadian.',
        'Setiap alert harus punya tindakan yang jelas; kalau tidak ada, jangan buat alertnya.',
        'Tinjau berkala dan matikan yang selalu palsu.',
      ),
      callout(
        'warning',
        'Alert yang terlalu berisik lebih buruk daripada tidak ada',
        'Tim yang menerima lima puluh alert palsu per hari akan mengabaikan yang kelima puluh satu — dan itu yang sungguhan. Kelelahan alert adalah cara paling umum sistem pemantauan yang mahal menjadi tidak berguna.',
      ),

      h2('Retensi'),
      table(
        ['Jenis', 'Simpan', 'Alasan'],
        [
          ['Log aplikasi', '30–90 hari', 'Diagnosis'],
          ['Log keamanan', '**1 tahun+**', 'Investigasi insiden sering terlambat'],
          ['Audit log', 'Sesuai kewajiban', 'Kepatuhan'],
          ['Log berisi PII', 'Sesingkat mungkin', 'Kewajiban privasi'],
        ],
      ),
      p(
        'Rata-rata waktu penemuan pembobolan diukur dalam **bulan**. Retensi 7 hari berarti saat kamu akhirnya tahu, jejaknya sudah lama hilang.',
      ),

      h2('Uji bahwa pemantauannya bekerja'),
      code(
        'bash',
        `
        # Picu peristiwa yang seharusnya memunculkan alert
        for i in $(seq 1 30); do
          curl -s -o /dev/null -X POST localhost:3000/api/auth/masuk \\
            -H 'Content-Type: application/json' \\
            -d '{"email":"korban@x.com","kataSandi":"salah"}'
        done

        # Lalu periksa: apakah alertnya benar-benar datang?
        `,
      ),
      callout(
        'tip',
        'Pemantauan yang tidak pernah diuji biasanya tidak bekerja',
        'Aturan alert bisa salah tulis, saluran notifikasi bisa berubah, dan kunci integrasi bisa kedaluwarsa — semuanya tanpa gejala apa pun sampai kamu benar-benar membutuhkannya. Uji jalurnya secara berkala, seperti menguji cadangan.',
      ),
    ],
  ),

  written('ssrf', 'SSRF', 12, 'Membuat servermu mengirim permintaan atas nama penyerang.', [
    p(
      'Server-Side Request Forgery terjadi ketika penyerang mengendalikan URL yang **diambil servermu**. Karena permintaan itu berasal dari dalam jaringanmu, ia bisa menjangkau hal yang tidak bisa dijangkau penyerang dari luar.',
    ),

    h2('Di mana ia muncul'),
    ul(
      '"Impor dari URL" — gambar, dokumen, umpan RSS.',
      'Webhook yang alamatnya ditentukan pengguna.',
      'Pratinjau tautan yang mengambil metadata halaman.',
      'Proxy gambar dan pembuat thumbnail.',
      'Konverter HTML ke PDF yang memuat sumber daya eksternal.',
      'Integrasi yang endpoint-nya bisa dikonfigurasi pengguna.',
    ),

    h2('Kenapa berbahaya'),
    code(
      'text',
      `
        Penyerang mengirim:
          POST /api/impor  { "url": "http://169.254.169.254/latest/meta-data/iam/security-credentials/" }

        Servermu mengambilnya, dan mengembalikan isinya.
        -> kredensial IAM cloud, dari dalam jaringan yang seharusnya tertutup.

        Target lain:
          http://localhost:6379          Redis tanpa autentikasi
          http://localhost:9200          Elasticsearch
          http://10.0.0.5/admin          panel internal
          file:///etc/passwd             berkas lokal
          http://localhost:3000/api/admin  API-mu sendiri, dari dalam
        `,
    ),
    callout(
      'danger',
      'SSRF membatalkan seluruh perlindungan berbasis jaringan',
      'Firewall, subnet privat, dan security group melindungi dari akses **luar**. SSRF membuat penyerang meminjam posisi servermu di dalam. Ini persis alasan zero trust berlaku: posisi jaringan bukan otorisasi — layanan internal tetap harus berautentikasi.',
    ),

    h2('Pertahanan'),
    code(
      'js',
      `
        import dns from 'node:dns/promises';
        import net from 'node:net';

        const SKEMA_BOLEH = new Set(['http:', 'https:']);
        const HOST_BOLEH = new Set(['images.partner.com', 'cdn.partner.com']);

        function ipPrivat(ip) {
          if (net.isIPv4(ip)) {
            const [a, b] = ip.split('.').map(Number);
            return a === 10
              || a === 127
              || (a === 172 && b >= 16 && b <= 31)
              || (a === 192 && b === 168)
              || (a === 169 && b === 254)      // metadata cloud
              || a === 0;
          }
          // IPv6: loopback, link-local, unique-local
          return ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd');
        }

        export async function ambilUrlAman(urlMentah) {
          const url = new URL(urlMentah);

          if (!SKEMA_BOLEH.has(url.protocol)) throw new KesalahanValidasi({ url: 'skema tidak diizinkan' });

          // Allow-list host adalah pertahanan TERKUAT. Pakai kalau memungkinkan.
          if (!HOST_BOLEH.has(url.hostname)) throw new KesalahanValidasi({ url: 'host tidak diizinkan' });

          // Kalau allow-list tidak memungkinkan, minimal blokir alamat internal.
          const alamat = await dns.lookup(url.hostname, { all: true });
          if (alamat.some((a) => ipPrivat(a.address))) {
            throw new KesalahanValidasi({ url: 'alamat internal tidak diizinkan' });
          }

          return fetch(url, {
            redirect: 'manual',                    // JANGAN ikuti redirect otomatis
            signal: AbortSignal.timeout(5_000),
            headers: { 'User-Agent': 'AppBot/1.0' },
          });
        }
        `,
    ),
    callout(
      'danger',
      'Redirect adalah cara paling umum melewati pemeriksaan',
      "Penyerang memberi URL publik yang lolos validasi, lalu servernya menjawab `302` ke `169.254.169.254`. Kalau klienmu mengikuti redirect otomatis, seluruh validasimu terlewati. Setel `redirect: 'manual'` dan validasi ulang setiap tujuan.",
    ),

    h2('DNS rebinding'),
    callout(
      'warning',
      'Memeriksa DNS lalu mengambil punya celah waktu',
      'Antara pemeriksaan dan permintaan sebenarnya, DNS bisa berubah — nama yang tadi menunjuk IP publik kini menunjuk `127.0.0.1`. Ini disebut DNS rebinding. Pertahanan yang benar-benar menutupnya: **allow-list host**, atau menyambung ke IP yang sudah diverifikasi sambil menyetel header `Host`.',
    ),

    h2('Pertahanan berlapis'),
    table(
      ['Lapisan', 'Kontrol'],
      [
        ['Aplikasi', 'Allow-list host, blokir IP privat, tanpa redirect otomatis'],
        ['Jaringan', 'Egress firewall — batasi tujuan yang boleh dihubungi server'],
        ['Cloud', 'IMDSv2 yang mewajibkan token; hak IAM minimum'],
        ['Arsitektur', 'Pengambilan URL dijalankan di layanan terpisah tanpa akses internal'],
      ],
    ),
    callout(
      'tip',
      'Egress firewall adalah kontrol yang paling sering terlewat',
      'Hampir semua orang membatasi lalu lintas **masuk**. Membatasi lalu lintas **keluar** — server aplikasi hanya boleh menghubungi database, cache, dan daftar host tertentu — membuat SSRF yang lolos tetap tidak bisa menjangkau apa pun yang berharga.',
    ),

    h2('Kalau URL sepenuhnya bebas'),
    p(
      'Untuk fitur yang memang harus mengambil URL apa pun (pratinjau tautan, perayap), jalankan pengambilannya di **layanan terpisah** yang berada di jaringan terisolasi tanpa akses ke database, rahasia, maupun layanan internal. Dengan begitu, SSRF di sana tidak mendapat apa-apa.',
    ),
  ]),

  written(
    'rahasia-konfigurasi',
    'Rahasia & Konfigurasi',
    12,
    'Tempat kebocoran paling umum, dan paling mudah dihindari.',
    [
      h2('Aturan dasar'),
      ol(
        'Rahasia **tidak pernah** ditulis di source code.',
        '`.env` dan berkas kunci di-gitignore; hanya `.env.example` dengan placeholder **kosong**.',
        'Rahasia tidak pernah di-log, termasuk di level debug.',
        'Rahasia tidak pernah dibakukan ke dalam image container atau bundle klien.',
        'Rahasia yang **pernah** ter-commit dianggap bocor — rotasi, jangan hanya hapus riwayatnya.',
      ),
      callout(
        'danger',
        'Menghapus commit tidak menutup kebocoran',
        'Begitu rahasia masuk git dan di-push, ia ada di setiap clone, setiap fork, dan kemungkinan besar sudah terindeks oleh pemindai otomatis yang memantau GitHub secara terus-menerus. Menulis ulang riwayat tidak menariknya kembali. Satu-satunya perbaikan yang benar adalah **merotasi** rahasianya.',
      ),

      h2('Prefiks publik'),
      code(
        'bash',
        `
        # Server saja — aman
        DATABASE_URL="postgresql://..."
        JWT_SECRET="..."

        # IKUT KE BUNDLE BROWSER — bisa dibaca siapa pun
        NEXT_PUBLIC_SITE_URL="https://contoh.com"
        VITE_API_URL="https://api.contoh.com"
        `,
      ),
      callout(
        'danger',
        '`NEXT_PUBLIC_` berarti publik, tanpa pengecualian',
        'Nilainya ditanam ke JavaScript yang diunduh browser. Tidak ada "rahasia yang cuma dipakai untuk memanggil API" — kalau ia di bundle, ia bukan rahasia. Kesalahan ini biasanya terjadi saat seseorang mendapat `undefined` di Client Component lalu "memperbaikinya" dengan menambahkan prefiks.',
      ),

      h2('Validasi saat boot'),
      code(
        'ts',
        `
        import 'server-only';
        import { z } from 'zod';

        const Skema = z.object({
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
          // Default AMAN: ketiadaan nilai = pilihan paling ketat
          CORS_ORIGINS: z.string().default(''),
        });

        const hasil = Skema.safeParse(process.env);

        if (!hasil.success) {
          console.error('Konfigurasi tidak valid:');
          for (const m of hasil.error.issues) console.error(\`  \${m.path.join('.')}: \${m.message}\`);
          process.exit(1);
        }

        export const env = Object.freeze(hasil.data);
        `,
      ),
      p(
        'Aplikasi yang menolak menyala dengan pesan jelas jauh lebih murah daripada aplikasi yang menyala lalu menandatangani token dengan `undefined`.',
      ),

      h2('Mencegah rahasia sampai ke git'),
      code(
        'bash',
        `
        # Pemindai rahasia
        npx secretlint "**/*"
        gitleaks detect --source .

        # Pre-commit hook
        npx husky add .husky/pre-commit "npx secretlint --secretlintignore .gitignore ."
        `,
      ),
      code(
        'yaml',
        `
        - name: Pindai rahasia
          uses: gitleaks/gitleaks-action@v2
          # Gagalkan CI kalau ada yang terdeteksi
        `,
      ),

      h2('Vault untuk produksi'),
      table(
        ['Cara', 'Kapan pantas'],
        [
          ['Berkas `.env`', 'Pengembangan lokal saja'],
          ['Environment dari platform', 'Baik — disuntikkan saat deploy'],
          ['Secrets manager (Vault, AWS SM)', '**Terbaik** — audit, rotasi, akses terkontrol'],
          ['Rahasia di image container', '**Tidak pernah**'],
        ],
      ),
      code(
        'text',
        `
        # Dockerfile — JANGAN
        ENV DATABASE_URL="postgresql://user:sandi@db/app"
        COPY .env .env

        # Keduanya tersimpan permanen di layer image.
        # Siapa pun yang bisa menarik image itu bisa membacanya —
        # termasuk dari layer yang sudah "dihapus" di layer berikutnya.
        `,
      ),
      callout(
        'danger',
        'Layer image bersifat permanen',
        'Menghapus berkas di layer berikutnya **tidak** menghapusnya dari image — ia masih ada di layer sebelumnya dan bisa diekstrak. Rahasia yang pernah masuk image harus dianggap bocor, sama seperti yang pernah masuk git.',
      ),

      h2('Rotasi'),
      ol(
        'Rancang agar rotasi **tidak memerlukan perubahan kode** — baca nilainya per boot, jangan hardcode di mana pun.',
        'Dukung dua kunci sementara saat rotasi, supaya tidak ada permintaan yang gagal di tengah.',
        'Rotasi terjadwal, dan **segera** setelah dicurigai bocor.',
        'Rotasi juga setelah ada anggota tim yang keluar.',
      ),

      h2('Batas server dan klien'),
      code(
        'ts',
        `
        // src/lib/db.ts
        import 'server-only';   // build GAGAL kalau berkas ini terimpor komponen klien

        export const db = buatKoneksi(env.DATABASE_URL);
        `,
      ),
      callout(
        'tip',
        '`server-only` mengubah kesalahan diam menjadi kegagalan build',
        'Tanpa itu, modul yang menyentuh rahasia bisa tanpa sengaja terimpor komponen klien — dan bundler dengan patuh mengirimkannya ke browser. Paketnya kecil, dan ia menutup satu jalur kebocoran sepenuhnya.',
      ),

      h2('Checklist'),
      ul(
        '`.env`, `.env.local`, dan berkas kunci ada di `.gitignore`.',
        '`.env.example` hanya berisi placeholder kosong.',
        'Tidak ada rahasia asli di belakang prefiks publik.',
        'Tidak ada rahasia yang di-`console.log` atau masuk log.',
        'Tidak ada rahasia di Dockerfile atau layer image.',
        'Pemindai rahasia berjalan di pre-commit dan di CI.',
        'Aplikasi gagal boot kalau ada rahasia yang hilang atau terlalu lemah.',
      ),
    ],
  ),

  written(
    'praktik-checklist-keamanan',
    'Praktik: Checklist keamanan sebelum rilis',
    13,
    'Audit yang dijalankan, bukan dibaca.',
    [
      p(
        'Latihan penutup Backend Intermediate: jalankan audit keamanan lengkap pada API yang sudah kamu bangun. Ini bukan daftar untuk dibaca — setiap baris punya perintah yang menghasilkan bukti.',
      ),

      h2('Cara mengauditnya'),
      callout(
        'tip',
        'Jangan membaca kode — panggil endpoint-nya',
        'Audit yang dilakukan dengan membaca akan menemukan yang kamu ingat, bukan yang kamu tulis. Setiap temuan harus punya keluaran perintah yang membuktikannya.',
      ),

      h2('1. Kontrol akses'),
      code(
        'bash',
        `
        # Siapkan dua pengguna dengan data masing-masing
        # Lalu coba SETIAP endpoint dengan token yang salah
        for jalur in /api/artikel/1 /api/artikel/1/komentar /api/berkas/1 /api/ekspor/job_1; do
          kode=$(curl -s -o /dev/null -w "%{http_code}" localhost:3000$jalur \\
            -H "Authorization: Bearer $TOKEN_ANA")
          printf "%-35s -> %s\\n" "$jalur" "$kode"
        done
        # Setiap 200 untuk milik Budi adalah TEMUAN BERAT.

        # Endpoint daftar tidak boleh membocorkan milik orang lain
        curl -s localhost:3000/api/artikel -H "Authorization: Bearer $TOKEN_ANA" \\
          | jq '[.data[].penulisId] | unique'
        # Harus hanya berisi id Ana.

        # Escalation: pengguna biasa memanggil endpoint admin
        curl -s -o /dev/null -w "admin -> %{http_code}\\n" \\
          localhost:3000/api/admin/pengguna -H "Authorization: Bearer $TOKEN_ANA"
        `,
      ),

      h2('2. Mass assignment'),
      code(
        'bash',
        `
        curl -s -X POST localhost:3000/api/artikel \\
          -H "Authorization: Bearer $TOKEN_ANA" -H 'Content-Type: application/json' \\
          -d '{"judul":"A","isi":"B","penulisId":999,"status":"terbit","peran":"admin"}'

        # Lalu periksa di database: penulisId HARUS Ana, status HARUS draf.
        `,
      ),

      h2('3. Injeksi'),
      code(
        'bash',
        `
        for muatan in "' OR '1'='1" "'; DROP TABLE artikel; --" "\\" OR 1=1--"; do
          curl -s -o /dev/null -w "%{http_code} " localhost:3000/api/artikel \\
            --get --data-urlencode "cari=$muatan" -H "Authorization: Bearer $TOKEN_ANA"
        done
        echo
        # Harus 200 dengan hasil kosong, atau 422 — TIDAK BOLEH 500.
        # 500 berarti muatannya sampai ke database.

        # NoSQL / type confusion
        curl -s -o /dev/null -w "%{http_code}\\n" -X POST localhost:3000/api/auth/masuk \\
          -H 'Content-Type: application/json' \\
          -d '{"email":"admin@x.com","kataSandi":{"$ne":null}}'
        # Harus 422, bukan 200.
        `,
      ),

      h2('4. Autentikasi'),
      code(
        'bash',
        `
        # Pesan dan waktu harus SAMA untuk email ada dan tidak ada
        for email in "tidakada@x.com" "ada@x.com"; do
          curl -s -o /tmp/r.json -w "$email: %{http_code} %{time_total}s " \\
            -X POST localhost:3000/api/auth/masuk -H 'Content-Type: application/json' \\
            -d "{\\"email\\":\\"$email\\",\\"kataSandi\\":\\"salah\\"}"
          jq -r '.error.pesan' /tmp/r.json
        done

        # Rate limit harus benar-benar aktif
        for i in $(seq 1 30); do
          curl -s -o /dev/null -w "%{http_code} " -X POST localhost:3000/api/auth/masuk \\
            -H 'Content-Type: application/json' -d '{"email":"ada@x.com","kataSandi":"salah"}'
        done; echo

        # Token setelah ganti password harus DITOLAK
        curl -s -o /dev/null -w "token lama -> %{http_code}\\n" \\
          localhost:3000/api/saya/artikel -H "Authorization: Bearer $TOKEN_SEBELUM_GANTI"
        `,
      ),

      h2('5. Kebocoran data'),
      code(
        'bash',
        `
        # Hash password tidak boleh muncul di respons mana pun
        for jalur in /api/saya/profil /api/artikel/1 /api/artikel; do
          curl -s localhost:3000$jalur -H "Authorization: Bearer $TOKEN_ANA" \\
            | grep -iE "password|hash|token|secret" && echo "BOCOR di $jalur"
        done

        # Error 5xx tidak boleh membocorkan detail internal
        curl -s localhost:3000/api/artikel/999999999999999999999 \\
          -H "Authorization: Bearer $TOKEN_ANA" \\
          | grep -iE "stack|at /|node_modules|vendor/|constraint|relation" \\
          && echo "DETAIL INTERNAL BOCOR"
        `,
      ),

      h2('6. Konfigurasi & header'),
      code(
        'bash',
        `
        curl -sI localhost:3000/api/artikel | grep -iE \\
          "content-security-policy|strict-transport|x-content-type|referrer-policy|x-frame|x-powered-by"
        # x-powered-by TIDAK boleh ada.

        # Berkas yang seharusnya tidak terjangkau
        for f in .env .git/config package.json composer.json; do
          printf "%-20s -> %s\\n" "$f" "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000/$f)"
        done

        # Endpoint internal
        for e in /metrics /horizon /telescope /openapi.json /debug; do
          printf "%-20s -> %s\\n" "$e" "$(curl -s -o /dev/null -w '%{http_code}' localhost:3000$e)"
        done

        # CORS: origin asing harus DITOLAK, bukan dipantulkan
        curl -sI localhost:3000/api/artikel -H "Origin: https://jahat.com" \\
          | grep -i "access-control-allow-origin" && echo "MEMANTULKAN ORIGIN" || echo "menolak (benar)"
        `,
      ),

      h2('7. Batas & anti-penyalahgunaan'),
      code(
        'bash',
        `
        # Batas paginasi
        curl -s "localhost:3000/api/artikel?per_hal=999999" -H "Authorization: Bearer $TOKEN_ANA" \\
          | jq '.data | length'
        # Harus <= 100.

        # Batas ukuran body
        head -c 20000000 /dev/zero | tr '\\0' 'a' > /tmp/besar.txt
        curl -s -o /dev/null -w "body besar -> %{http_code}\\n" \\
          -X POST localhost:3000/api/artikel -H "Authorization: Bearer $TOKEN_ANA" \\
          -H 'Content-Type: application/json' --data-binary @/tmp/besar.txt
        # Harus 413, bukan server mati.
        `,
      ),

      h2('8. Dependency'),
      code(
        'bash',
        `
        npm audit --production --audit-level=high
        composer audit
        gitleaks detect --source . --no-git
        `,
      ),

      h2('Menuliskan temuan'),
      code(
        'text',
        `
        AUDIT KEAMANAN — <tanggal> — <nama layanan>

        BERAT (tunda rilis sampai diperbaiki)
        [ ] GET /api/artikel/{id} menjawab 200 untuk artikel milik pengguna lain
            Bukti: curl dengan TOKEN_ANA ke artikel milik Budi -> 200
        [ ] Endpoint daftar mengembalikan artikel semua pengguna
            Bukti: jq '[.data[].penulisId] | unique' -> [1,2,3]

        SEDANG
        [ ] Pesan login membedakan email tidak ada dan password salah
        [ ] per_hal tidak dibatasi; ?per_hal=999999 mengembalikan 4.213 baris
        [ ] X-Powered-By masih terkirim

        RINGAN
        [ ] DELETE mengembalikan 200 dengan body, seharusnya 204
        [ ] Tidak ada Content-Security-Policy

        DITERIMA SECARA SADAR
        [ ] Tautan berbagi bisa diteruskan siapa pun — ini memang inti fiturnya,
            dinyatakan jelas di antarmuka, dan bisa dicabut pemiliknya.
        `,
      ),
      callout(
        'tip',
        'Bagian terakhir sama pentingnya dengan yang pertama',
        'Risiko yang diterima secara sadar dan **tertulis** bukan kelalaian — ia keputusan yang bisa ditinjau ulang saat keadaan berubah. Yang berbahaya adalah risiko yang tidak pernah disebut siapa pun.',
      ),

      divider,

      checklist(
        'bi5-praktik',
        'Checklist keamanan sebelum rilis',
        'Setiap endpoint diuji dengan token pengguna lain — tidak ada yang menjawab 200',
        'Endpoint daftar di-scope di query, bukan hanya mengandalkan policy',
        'Field asing dan `penulisId` dari klien diabaikan atau ditolak',
        'Semua query diparameterkan; identifier berasal dari allow-list',
        'Login memberi pesan dan waktu respons yang seragam',
        'Rate limit aktif per akun dan per IP, termasuk pada OTP dan reset password',
        'Token dicabut saat keluar, ganti password, dan perubahan peran',
        'Tidak ada hash, token, atau data sensitif di respons mana pun',
        'Error 5xx tidak membocorkan stack trace, nama tabel, atau jalur berkas',
        'Header keamanan terpasang; `X-Powered-By` tidak ada',
        'Mode debug mati; endpoint internal dan dashboard dilindungi',
        'CORS memakai allow-list persis; origin asing benar-benar ditolak',
        'Batas ukuran body dan batas paginasi ditegakkan server',
        'Unggahan diverifikasi dari isi, dinamai server, disajikan sebagai attachment',
        'Pengambilan URL memakai allow-list host dan tidak mengikuti redirect otomatis',
        'Webhook memverifikasi tanda tangan dari body mentah, dan idempoten',
        '`npm audit` / `composer audit` bersih untuk dependency produksi',
        'Pemindai rahasia berjalan dan tidak menemukan apa pun',
        'Peristiwa keamanan tercatat, terpusat, dan punya alert yang sudah diuji',
        'Temuan ditulis dan diurutkan berdasarkan dampak, termasuk yang diterima sadar',
      ),
    ],
  ),
];
