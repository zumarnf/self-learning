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
 * Backend Intermediate — Chapter 1, all eleven lessons.
 *
 * Framework-agnostic on purpose: this is the contract layer, and a contract that only makes sense
 * inside one framework is not a contract. Express and Laravel both appear in later chapters as
 * implementations of what is decided here.
 *
 * The chapter's spine is backward compatibility. Almost every rule in it exists because an API is
 * a promise to clients you cannot redeploy — mobile apps, partner integrations, cached scripts.
 */
export const lessons: LessonDraft[] = [
  written(
    'penamaan-resource',
    'Penamaan Resource & Struktur URL',
    10,
    'Keputusan yang paling sulit diubah setelah ada klien yang memakainya.',
    [
      p(
        'URL adalah bagian API yang paling permanen. Field bisa ditambah, respons bisa diperkaya, tapi mengubah alamat berarti memutus setiap klien yang sudah memakainya — termasuk aplikasi mobile yang tidak bisa kamu paksa memperbarui diri.',
      ),

      h2('Aturan penamaan'),
      table(
        ['Aturan', 'Benar', 'Hindari'],
        [
          ['Kata benda jamak', '`/artikel`', '`/getArtikel`, `/artikelList`'],
          [
            'Huruf kecil + tanda hubung',
            '`/kategori-produk`',
            '`/kategoriProduk`, `/Kategori_Produk`',
          ],
          ['Konsisten satu bahasa', '`/artikel`, `/komentar`', 'Campur `/artikel` dan `/comments`'],
          ['Tanpa ekstensi', '`/artikel/42`', '`/artikel/42.json`'],
          ['Tanpa garis miring di akhir', '`/artikel`', '`/artikel/`'],
        ],
      ),
      callout(
        'tip',
        'Pilih satu bahasa dan tegakkan',
        'Project ini memakai Bahasa Indonesia untuk materi, tapi **API sebaiknya konsisten dalam satu bahasa** — bahasa mana pun. Yang merusak adalah campuran: `/artikel/{id}/comments` memaksa setiap pembaca menebak istilah mana yang dipakai di endpoint berikutnya.',
      ),

      h2('Kedalaman bersarang'),
      code(
        'text',
        `
        # Baik — hubungan kepemilikan yang jelas, satu tingkat
        GET /artikel/42/komentar

        # Batas wajar — dua tingkat
        GET /organisasi/7/proyek/12/tugas

        # Terlalu dalam — sulit dibaca, sulit di-cache, sulit diubah
        GET /organisasi/7/proyek/12/tugas/34/komentar/56/lampiran
        `,
      ),
      p('Kalau sudah lebih dari dua tingkat, pecah jadi endpoint tingkat atas dengan filter:'),
      code(
        'text',
        `
        GET /lampiran?komentarId=56
        GET /tugas?proyekId=12
        `,
      ),

      h2('Aksi yang bukan CRUD'),
      p(
        'Tidak semua operasi cocok dipaksa menjadi bentuk data. "Batalkan pesanan" bukan `PATCH` pada field status — ia punya aturan sendiri, efek samping sendiri, dan syarat sendiri.',
      ),
      compare(
        {
          title: 'Dipaksa jadi CRUD',
          lang: 'text',
          code: `
          PATCH /pesanan/42
          { "status": "dibatalkan" }

          Masalahnya:
          - Klien boleh menulis status apa saja?
          - Bagaimana dengan pengembalian dana?
          - Bagaimana kalau sudah dikirim?
          `,
          notes: ['Aturan bisnisnya tersembunyi di validasi field'],
        },
        {
          title: 'Sub-resource aksi',
          lang: 'text',
          code: `
          POST /pesanan/42/pembatalan
          { "alasan": "salah pilih" }

          -> 201 dengan detail pembatalan
          -> 409 kalau sudah dikirim

          Aturannya jadi eksplisit.
          `,
          notes: ['Satu endpoint, satu aturan, satu kumpulan status code'],
        },
      ),

      h2('Singular atau plural untuk sumber daya tunggal'),
      code(
        'text',
        `
        # Sumber daya yang hanya ada satu per pengguna
        GET   /saya/profil
        PATCH /saya/profil
        GET   /saya/pengaturan

        # Ini pengecualian yang sah dari aturan "selalu jamak"
        `,
      ),
      p(
        'Pola `/saya/...` juga menghilangkan satu kelas IDOR: tidak ada id yang bisa diganti, karena identitasnya berasal dari token.',
      ),

      h2('Yang tidak boleh masuk URL'),
      callout(
        'danger',
        'URL tercatat di banyak tempat',
        'Riwayat browser, log akses server, log proxy dan CDN, dan header `Referer` saat pengguna mengeklik tautan keluar. Jangan pernah menaruh token, id sesi, kunci API, atau data pribadi di path maupun query string. Semuanya lewat header atau body.',
      ),

      h2('Keputusan yang harus diambil sekali dan dipegang'),
      ol(
        '**Bahasa** — Indonesia atau Inggris, untuk seluruh API.',
        '**Bentuk id** — integer berurutan atau UUID. Jangan campur antar sumber daya.',
        '**Penamaan field** — `snake_case` atau `camelCase`. Pilih satu.',
        '**Bentuk pembungkus** — `{ "data": ... }` atau objek telanjang. Ini sangat sulit diubah nanti.',
        '**Format tanggal** — ISO 8601 dengan zona waktu, selalu.',
      ),
      callout(
        'warning',
        'Array telanjang di tingkat atas adalah keputusan yang menyulitkan',
        'Mengembalikan `[{...}, {...}]` terlihat bersih sampai kamu perlu menambahkan paginasi. Menambahkan pembungkus setelah ada klien berarti perubahan yang memutus mereka. Mulailah dengan `{ "data": [...], "meta": {...} }` sejak endpoint pertama.',
      ),
    ],
  ),

  written(
    'status-code-tepat',
    'Memilih Status Code yang Tepat',
    11,
    'Kode yang salah membuat klien menangani kegagalan dengan cara yang salah.',
    [
      p(
        'Status code bukan hiasan — ia adalah bagian dari kontrak yang menentukan **apa yang klien lakukan berikutnya**. Klien memutuskan untuk mencoba lagi, meminta login ulang, atau menampilkan pesan berdasarkan angka itu.',
      ),

      h2('Kelompok besar'),
      table(
        ['Kelas', 'Artinya bagi klien'],
        [
          ['`2xx`', 'Berhasil — lanjutkan'],
          ['`3xx`', 'Pergi ke tempat lain'],
          ['`4xx`', '**Kamu yang salah** — mengulang permintaan yang sama tidak akan menolong'],
          ['`5xx`', '**Aku yang salah** — mencoba lagi masuk akal'],
        ],
      ),
      callout(
        'danger',
        'Menjawab `500` untuk kesalahan klien punya biaya nyata',
        'Klien akan mencoba lagi — karena `5xx` berarti "mungkin sementara". Permintaan yang cacat itu diulang terus, membebani server, dan membanjiri alarm sehingga kegagalan server yang sungguhan tenggelam. JSON rusak adalah `400`, bukan `500`.',
      ),

      h2('Yang sering tertukar'),
      table(
        ['Kode', 'Kapan dipakai', 'Sering salah dipakai untuk'],
        [
          ['`400`', 'Bentuk permintaan cacat: JSON rusak, tipe salah', 'Semua kesalahan klien'],
          ['`401`', 'Tidak tahu kamu siapa', 'Tahu siapa tapi tidak berhak'],
          [
            '`403`',
            'Tahu siapa, tapi tidak berhak',
            'Data yang tidak boleh diketahui keberadaannya',
          ],
          ['`404`', 'Tidak ada, atau tidak berhak tahu ia ada', 'Daftar yang hasilnya kosong'],
          ['`409`', 'Bentrok dengan keadaan sekarang', 'Kegagalan validasi biasa'],
          ['`422`', 'Bentuk benar, isi tidak lolos aturan', '`400`'],
          ['`429`', 'Terlalu banyak permintaan', '`403`'],
        ],
      ),

      h2('`400` vs `422`'),
      code(
        'text',
        `
        # 400 — parser gagal. Server tidak bisa memahami bentuknya.
        POST /artikel
        { "judul": "Halo",

        # 422 — bentuknya sah, isinya melanggar aturan bisnis.
        POST /artikel
        { "judul": "", "isi": "..." }
        `,
      ),
      p(
        'Bedanya berguna bagi klien: `400` berarti ada bug di kode klien; `422` berarti pengguna perlu memperbaiki isiannya. Keduanya ditangani sangat berbeda di antarmuka.',
      ),

      h2('`409 Conflict`'),
      code(
        'text',
        `
        # Bentrok keadaan — bukan kesalahan bentuk
        POST /pesanan/42/pembatalan   -> 409 "pesanan sudah dikirim"
        POST /pengguna                -> 409 "email sudah terdaftar"
        PUT  /artikel/7               -> 409 "versi yang kamu ubah sudah usang"
        `,
      ),
      callout(
        'warning',
        '`409` untuk email terdaftar membocorkan akun',
        'Pada endpoint pendaftaran publik, membedakan "email sudah ada" dari "berhasil" memberi penyerang daftar akun. Kalau pendaftaranmu memakai verifikasi email, jawab `202 Accepted` yang sama untuk keduanya — yang membedakan hanyalah isi email yang diterima pemiliknya.',
      ),

      h2('`2xx` yang bukan `200`'),
      table(
        ['Kode', 'Untuk'],
        [
          ['`201 Created`', 'Sumber daya baru dibuat — sertakan header `Location`'],
          ['`202 Accepted`', 'Diterima, diproses belakangan — sertakan cara memantaunya'],
          ['`204 No Content`', 'Berhasil, tidak ada yang perlu dikirim — **body harus kosong**'],
        ],
      ),
      code(
        'text',
        `
        HTTP/1.1 201 Created
        Location: /api/artikel/42

        { "data": { "id": 42, "judul": "Halo" } }
        `,
      ),
      callout(
        'danger',
        '`204` dengan body melanggar spesifikasi',
        'Sebagian klien HTTP akan gagal mengurainya, sebagian lain diam-diam mengabaikannya. Kalau kamu perlu mengirim sesuatu setelah `DELETE`, pakai `200` dengan body — jangan `204` yang berisi.',
      ),

      h2('Daftar kosong tetap `200`'),
      code(
        'json',
        `
        // BENAR — pencarian yang tidak menemukan apa pun tetap berhasil
        HTTP/1.1 200 OK
        { "data": [], "meta": { "total": 0 } }
        `,
      ),
      p(
        '`404` berarti endpoint atau sumber dayanya tidak ada. "Tidak ada hasil untuk filtermu" adalah jawaban yang sah — klien yang menerima `404` akan menampilkan halaman error alih-alih keadaan kosong.',
      ),

      h2('Konsistensi lebih penting daripada kesempurnaan'),
      p(
        'Ada perdebatan sah antara `400` dan `422`, atau `403` dan `404`. Yang **tidak** bisa ditawar: endpoint yang berbeda tidak boleh menjawab kasus yang sama dengan kode berbeda. Tulis keputusanmu, dan tegakkan di seluruh API.',
      ),
    ],
  ),

  written(
    'bentuk-error',
    'Bentuk Error Seragam (RFC 9457)',
    11,
    'Satu bentuk respons gagal yang bisa diandalkan setiap klien.',
    [
      p(
        'Klien harus bisa menangani kegagalan tanpa menebak. Kalau setiap endpoint mengembalikan bentuk error yang berbeda, setiap pemanggilan butuh penanganan khusus — dan satu yang terlewat menghasilkan layar putih.',
      ),

      h2('Masalahnya'),
      code(
        'json',
        `
        // Endpoint A
        { "error": "Judul wajib diisi" }

        // Endpoint B
        { "message": "validation failed", "errors": { "judul": ["required"] } }

        // Endpoint C
        { "success": false, "msg": "gagal", "code": 4001 }

        // Endpoint D — plain text
        Internal Server Error
        `,
      ),

      h2('RFC 9457 — Problem Details'),
      p(
        'Standar resmi untuk bentuk error HTTP. Ia menetapkan sekumpulan field baku, dan kamu boleh menambah field sendiri.',
      ),
      code(
        'json',
        `
        HTTP/1.1 422 Unprocessable Content
        Content-Type: application/problem+json

        {
          "type": "https://contoh.com/masalah/validasi",
          "title": "Data yang dikirim tidak valid",
          "status": 422,
          "detail": "Judul wajib diisi dan maksimal 200 karakter.",
          "instance": "/api/artikel",

          "errors": {
            "judul": ["wajib diisi"],
            "isi": ["maksimal 10000 karakter"]
          },
          "requestId": "a1b2c3d4"
        }
        `,
      ),
      table(
        ['Field', 'Isinya'],
        [
          ['`type`', 'URI yang mengidentifikasi **jenis** masalah — stabil, bisa didokumentasikan'],
          ['`title`', 'Ringkasan singkat, sama untuk setiap `type`'],
          ['`status`', 'Sama dengan status code HTTP-nya'],
          ['`detail`', 'Penjelasan khusus untuk kejadian ini'],
          ['`instance`', 'URI kejadiannya'],
        ],
      ),

      h2('Kalau tidak memakai RFC 9457'),
      p('Bentuk sederhana pun tidak masalah — asalkan **satu bentuk untuk seluruh API**:'),
      code(
        'json',
        `
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": { "judul": "wajib diisi" },
            "requestId": "a1b2c3d4"
          }
        }
        `,
      ),
      callout(
        'tip',
        'Kode error lebih berharga daripada pesannya',
        'Pesan boleh berubah, diterjemahkan, atau diperhalus. Kode seperti `VALIDASI_GAGAL` atau `SALDO_TIDAK_CUKUP` adalah yang dipakai klien untuk bercabang. Perlakukan kode sebagai bagian kontrak: menambahnya aman, mengubah artinya tidak.',
      ),

      h2('Apa yang tidak boleh ada di dalamnya'),
      compare(
        {
          title: 'Membocorkan',
          lang: 'json',
          code: `
          {
            "error": {
              "pesan": "duplicate key value violates
                unique constraint
                \\"pengguna_email_key\\"",
              "stack": "at Pool.query (/app/src/
                repositories/pengguna.js:42)",
              "query": "INSERT INTO pengguna ..."
            }
          }
          `,
          notes: ['Nama tabel, nama constraint, jalur berkas, struktur query'],
        },
        {
          title: 'Aman',
          lang: 'json',
          code: `
          {
            "error": {
              "kode": "SUDAH_TERDAFTAR",
              "pesan": "Data sudah ada",
              "requestId": "a1b2c3d4"
            }
          }
          `,
          notes: ['Detail lengkapnya ada di log server, dikaitkan lewat requestId'],
        },
      ),
      callout(
        'danger',
        'Pesan error database adalah peta bagi penyerang',
        'Nama tabel, nama kolom, dan nama constraint memberi tahu struktur databasemu tanpa penyerang perlu menebak. Untuk `5xx`, jangan pernah meneruskan pesan aslinya ke klien — kirim `requestId` supaya kamu tetap bisa menelusurinya di log.',
      ),

      h2('Error validasi per field'),
      code(
        'json',
        `
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Data yang dikirim tidak valid",
            "field": {
              "judul": "wajib diisi",
              "tag_ids.2": "harus bilangan bulat",
              "penulis.email": "format email tidak sah"
            }
          }
        }
        `,
      ),
      p(
        'Kunci memakai notasi titik supaya klien bisa memetakannya langsung ke field formulir — termasuk yang bersarang dan yang di dalam array.',
      ),

      h2('Sertakan `requestId` di setiap error'),
      code(
        'js',
        `
        res.setHeader('X-Request-Id', req.id);
        `,
      ),
      p(
        'Saat pengguna melapor "tadi gagal", satu id membuatmu menemukan persis permintaan itu di log — tanpa menebak dari perkiraan waktu, dan tanpa harus membocorkan detail apa pun ke klien.',
      ),
    ],
  ),

  written(
    'paginasi',
    'Paginasi: offset vs cursor',
    12,
    'Dua pendekatan dengan trade-off yang berbeda tajam.',
    [
      p(
        'Setiap endpoint daftar **wajib** berpaginasi. Endpoint tanpa batas adalah cara paling mudah menjatuhkan server: satu permintaan yang mengembalikan seluruh tabel cukup untuk menghabiskan memori.',
      ),

      h2('Offset — sederhana'),
      code(
        'text',
        `
        GET /artikel?hal=2&per_hal=20
        `,
      ),
      code(
        'json',
        `
        {
          "data": [ ... ],
          "meta": {
            "halaman": 2,
            "perHalaman": 20,
            "total": 1337,
            "totalHalaman": 67
          }
        }
        `,
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Bisa lompat ke halaman mana pun', 'Makin dalam, makin lambat'],
          ['Total halaman diketahui', '`COUNT` pada tabel besar mahal'],
          ['Mudah dipahami', '**Item bisa terlewat atau ganda**'],
        ],
      ),
      callout(
        'danger',
        'Masalah pergeseran yang jarang disadari',
        'Pengguna membuka halaman 1 (item 1–20). Sementara ia membaca, 5 artikel baru ditambahkan. Saat ia membuka halaman 2, item 16–20 yang sudah ia lihat muncul lagi — dan sebagian item lain tidak pernah muncul sama sekali. Ini bukan kasus tepi teoretis; ia terjadi setiap kali datanya aktif.',
      ),

      h2('Cursor — stabil dan cepat'),
      code(
        'text',
        `
        GET /artikel?limit=20
        GET /artikel?limit=20&cursor=eyJpZCI6MTAwMjN9
        `,
      ),
      code(
        'json',
        `
        {
          "data": [ ... ],
          "meta": {
            "cursorBerikutnya": "eyJpZCI6MTAwMDN9",
            "adaLagi": true
          }
        }
        `,
      ),
      code(
        'sql',
        `
        -- Offset: baca 10.020 baris, buang 10.000
        SELECT * FROM artikel ORDER BY id DESC LIMIT 20 OFFSET 10000;

        -- Cursor: langsung ke posisinya lewat index
        SELECT * FROM artikel WHERE id < 10023 ORDER BY id DESC LIMIT 20;
        `,
      ),
      p('Query kedua kecepatannya **sama** di halaman 1 maupun halaman 500.'),

      h2('Menyusun cursor'),
      code(
        'js',
        `
        // Cursor adalah posisi yang di-encode — bukan rahasia, tapi juga bukan
        // sesuatu yang boleh dipercaya begitu saja.
        function buatCursor(baris) {
          return Buffer.from(JSON.stringify({
            id: baris.id,
            dibuatPada: baris.dibuat_pada.toISOString(),
          })).toString('base64url');
        }

        function bacaCursor(cursor) {
          try {
            const isi = JSON.parse(Buffer.from(cursor, 'base64url').toString());

            // WAJIB divalidasi — cursor datang dari klien.
            const hasil = SkemaCursor.safeParse(isi);
            return hasil.success ? hasil.data : null;
          } catch {
            return null;
          }
        }
        `,
      ),
      callout(
        'danger',
        'Cursor adalah masukan yang tidak tepercaya',
        'Base64 bukan enkripsi — siapa pun bisa membacanya dan mengarang isinya. Cursor yang dipakai langsung untuk menyusun query tanpa validasi adalah jalur injeksi. Urai, validasi dengan skema, dan pakai nilainya sebagai parameter.',
      ),

      h2('Urutan harus unik'),
      code(
        'sql',
        `
        -- SALAH: banyak baris bisa punya dibuat_pada yang sama.
        -- Urutan antar baris itu tidak dijamin -> paginasi kacau.
        ORDER BY dibuat_pada DESC

        -- BENAR: pemecah seri yang pasti unik.
        ORDER BY dibuat_pada DESC, id DESC
        `,
      ),
      code(
        'sql',
        `
        -- Cursor untuk urutan gabungan
        WHERE (dibuat_pada, id) < ($1, $2)
        ORDER BY dibuat_pada DESC, id DESC
        LIMIT 20
        `,
      ),

      h2('Memilih'),
      table(
        ['Pakai offset kalau', 'Pakai cursor kalau'],
        [
          ['Data jarang berubah', 'Data aktif berubah'],
          ['Pengguna perlu lompat ke halaman tertentu', 'Hanya butuh "muat lebih banyak"'],
          ['Total item perlu ditampilkan', 'Total tidak penting'],
          ['Datanya kecil', 'Datanya besar'],
          ['Panel admin', 'Umpan publik, gulir tak berujung'],
        ],
      ),

      h2('Batas yang wajib ada'),
      code(
        'js',
        `
        // Batas atas ditentukan SERVER, bukan klien.
        const perHalaman = Math.min(Number(req.query.per_hal) || 20, 100);
        `,
      ),
      callout(
        'warning',
        'Tanpa batas atas, `?per_hal=999999` adalah serangan satu baris',
        'Ia memaksa database mengembalikan seluruh tabel, memuat semuanya ke memori aplikasi, lalu menyerialisasinya menjadi JSON raksasa. Tidak perlu alat apa pun untuk melakukannya — cukup mengubah angka di URL.',
      ),
    ],
  ),

  written(
    'filter-sort',
    'Filtering, Sorting & Sparse Fieldset',
    11,
    'Membiarkan klien menyempitkan hasil, tanpa membiarkannya menyusun query.',
    [
      h2('Filter'),
      code(
        'text',
        `
        GET /artikel?status=terbit
        GET /artikel?status=terbit&penulis_id=42
        GET /artikel?dibuat_setelah=2026-01-01
        GET /artikel?cari=react
        `,
      ),
      code(
        'js',
        `
        // Setiap filter divalidasi dan dipetakan ke kolom yang KAMU tentukan.
        const SkemaFilter = z.object({
          status: z.enum(['draf', 'terbit', 'arsip']).optional(),
          penulis_id: z.coerce.number().int().positive().optional(),
          dibuat_setelah: z.coerce.date().optional(),
          cari: z.string().trim().max(100).optional(),
        }).strict();
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menerjemahkan query string langsung menjadi query database',
        'API yang menerima `?where[peran]=admin` atau `?filter={"$ne":null}` menyerahkan penyusunan query kepada klien. Itu bukan fitur fleksibel — itu injeksi dengan pintu depan terbuka. Setiap filter harus punya nama yang kamu daftarkan dan kolom yang kamu tentukan.',
      ),

      h2('Sorting'),
      code(
        'text',
        `
        GET /artikel?urut=-dibuat_pada          # tanda minus = menurun
        GET /artikel?urut=judul                 # menaik
        GET /artikel?urut=-dibuat_pada,judul    # beberapa kunci
        `,
      ),
      code(
        'js',
        `
        // Nama kolom TIDAK BISA diparameterkan di SQL.
        // Karena itu ia harus berasal dari allow-list milikmu sendiri.
        const KOLOM_URUT = {
          dibuat_pada: 'dibuat_pada',
          judul: 'judul',
          populer: 'jumlah_dibaca',
        };

        function susunOrderBy(param) {
          const bagian = [];

          for (const potongan of String(param ?? '').split(',').slice(0, 3)) {
            const menurun = potongan.startsWith('-');
            const nama = menurun ? potongan.slice(1) : potongan;
            const kolom = KOLOM_URUT[nama];

            if (kolom === undefined) continue;   // abaikan yang tidak dikenal
            bagian.push(\`\${kolom} \${menurun ? 'DESC' : 'ASC'}\`);
          }

          // Selalu ada default DAN pemecah seri yang unik.
          if (bagian.length === 0) bagian.push('dibuat_pada DESC');
          bagian.push('id DESC');

          return bagian.join(', ');
        }
        `,
      ),
      p(
        'Perhatikan bahwa yang masuk ke SQL adalah nilai dari **objek milikmu**. Input klien hanya dipakai sebagai kunci pencarian — tidak ada jalan bagi teksnya untuk sampai ke query.',
      ),

      h2('Sparse fieldset'),
      code(
        'text',
        `
        GET /artikel?fields=id,judul,dibuat_pada
        `,
      ),
      code(
        'js',
        `
        const FIELD_BOLEH = new Set(['id', 'judul', 'ringkasan', 'dibuat_pada', 'status']);

        function pilihField(param) {
          if (param === undefined) return [...FIELD_BOLEH];

          const diminta = String(param).split(',').filter((f) => FIELD_BOLEH.has(f));

          // Kalau semua yang diminta tidak dikenal, kembalikan default —
          // jangan kembalikan objek kosong.
          return diminta.length > 0 ? diminta : [...FIELD_BOLEH];
        }
        `,
      ),
      callout(
        'warning',
        'Allow-list field juga kontrol keamanan',
        'Tanpa daftar itu, `?fields=password_hash` atau `?fields=catatan_internal` akan dilayani dengan patuh. Field yang tidak ada di daftar tidak boleh bisa diminta — bahkan kalau kolomnya memang ada di tabel.',
      ),

      h2('Pencarian teks'),
      code(
        'sql',
        `
        -- Untuk data kecil: cukup ILIKE
        WHERE judul ILIKE '%' || $1 || '%'

        -- Untuk data besar: LIKE dengan wildcard di depan tidak bisa memakai index.
        -- Pakai full-text search.
        WHERE to_tsvector('indonesian', judul || ' ' || isi)
              @@ plainto_tsquery('indonesian', $1)
        `,
      ),
      callout(
        'tip',
        'Pakai `plainto_tsquery`, bukan `to_tsquery`',
        '`to_tsquery` memperlakukan input sebagai **sintaks kueri** — karakter seperti `&`, `|`, dan `!` punya arti khusus, dan input yang salah bentuk melempar error. `plainto_tsquery` memperlakukan input sebagai teks biasa, yang justru yang kamu inginkan untuk kotak pencarian.',
      ),

      h2('Dokumentasikan gabungannya'),
      p(
        'Filter, sort, dan paginasi dipakai bersamaan. Nyatakan dengan jelas: filter mana yang bisa digabung, kolom mana yang bisa diurutkan, dan berapa batas atas `limit`. Yang tidak didokumentasikan akan dicoba klien — lalu menjadi kontrak tak sengaja yang tidak bisa kamu ubah.',
      ),
    ],
  ),

  written(
    'versioning',
    'Versioning & Kompatibilitas Mundur',
    12,
    'Mengubah API tanpa memutus klien yang tidak bisa kamu perbarui.',
    [
      p(
        'API adalah janji kepada klien yang tidak bisa kamu deploy ulang: aplikasi mobile di perangkat pengguna, integrasi partner, skrip yang berjalan terjadwal. Kompatibilitas mundur bukan kesopanan — ia syarat agar API-mu bisa dipakai.',
      ),

      h2('Aman vs memutus'),
      table(
        ['Aman ditambahkan', 'Memutus klien'],
        [
          ['Field baru **opsional** di respons', 'Menghapus field'],
          ['Endpoint baru', 'Mengganti nama field'],
          ['Parameter query baru yang opsional', 'Mengubah tipe field'],
          ['Nilai enum baru — **kalau klien menanganinya**', 'Mengubah arti sebuah field'],
          ['Header baru', 'Menambah aturan validasi baru'],
          ['Melonggarkan validasi', 'Mengubah status code untuk kasus yang sama'],
        ],
      ),
      callout(
        'danger',
        'Menambah aturan validasi baru adalah perubahan yang memutus',
        'Ini yang paling sering tidak disadari. Menjadikan field yang tadinya opsional jadi wajib, atau menurunkan batas panjang dari 500 ke 200, akan menolak permintaan yang sebelumnya berhasil. Klien lama tidak berubah — tapi tiba-tiba mendapat `422`.',
      ),

      h2('Nilai enum baru juga bisa memutus'),
      code(
        'js',
        `
        // Klien menulis ini, dan ia benar untuk API versi lama:
        switch (artikel.status) {
          case 'draf': return <Draf />;
          case 'terbit': return <Terbit />;
          default: throw new Error('status tidak dikenal');
        }

        // Kamu menambahkan status 'ditinjau' -> klien meledak.
        `,
      ),
      p(
        'Karena itu dokumentasikan sejak awal: "klien harus menangani nilai enum yang tidak dikenal dengan anggun". Menambah nilai enum aman **hanya kalau** itu bagian dari kontrak.',
      ),

      h2('Cara memberi versi'),
      table(
        ['Cara', 'Contoh', 'Catatan'],
        [
          ['**Di URL**', '`/api/v1/artikel`', 'Paling jelas, paling mudah di-cache dan di-debug'],
          [
            'Header',
            '`Accept: application/vnd.app.v1+json`',
            'URL tetap bersih; lebih sulit diuji dengan `curl`',
          ],
          ['Query', '`?version=1`', 'Mudah, tapi gampang lupa disertakan'],
        ],
      ),
      callout(
        'tip',
        'Untuk kebanyakan project, versi di URL adalah pilihan yang benar',
        'Ia terlihat di log, di `curl`, di dokumentasi, dan di kunci cache. Versi lewat header lebih "murni" secara REST tapi menambah gesekan di setiap alat yang kamu pakai untuk mendiagnosis.',
      ),

      h2('Mengubah tanpa versi baru'),
      p('Sebagian besar perubahan tidak perlu versi baru kalau dilakukan bertahap:'),
      steps(
        {
          title: '1. Tambah yang baru, pertahankan yang lama',
          body: 'Kirim `namaLengkap` **dan** `nama` sekaligus. Klien lama tetap bekerja; klien baru memakai yang baru.',
        },
        {
          title: '2. Tandai yang lama sebagai usang',
          body: 'Dokumentasikan, dan kirim header `Deprecation` beserta `Sunset` yang menyebut tanggalnya. Catat siapa saja yang masih memakainya.',
        },
        {
          title: '3. Pantau pemakaiannya',
          body: 'Catat setiap permintaan yang masih membaca field lama, lengkap dengan identitas kliennya. Tanpa data ini, kamu tidak akan pernah berani menghapusnya.',
        },
        {
          title: '4. Hapus setelah pemakaiannya nol',
          body: 'Bukan setelah tanggal yang kamu umumkan — setelah **angkanya benar-benar nol**, atau setelah kamu menghubungi yang tersisa.',
        },
      ),
      code(
        'text',
        `
        HTTP/1.1 200 OK
        Deprecation: true
        Sunset: Wed, 31 Dec 2026 23:59:59 GMT
        Link: <https://contoh.com/docs/migrasi-v2>; rel="deprecation"
        `,
      ),

      h2('Berapa lama versi lama dipertahankan'),
      p(
        'Tergantung siapa kliennya. API internal bisa dihentikan dalam hitungan minggu. API yang dipakai aplikasi mobile harus hidup selama masih ada versi aplikasi lama yang terpasang — dan itu bisa **bertahun-tahun**, karena sebagian pengguna tidak pernah memperbarui.',
      ),
      callout(
        'warning',
        'Setiap versi yang hidup adalah kode yang harus dipelihara',
        'Tiga versi berarti tiga jalur kode, tiga kumpulan tes, dan tiga tempat yang harus diperbaiki saat ada bug keamanan. Jangan menambah versi untuk perubahan yang bisa dilakukan secara aditif — biayanya jauh lebih besar daripada yang terlihat saat memulainya.',
      ),
    ],
  ),

  written(
    'idempotency',
    'Idempotency & `Idempotency-Key`',
    11,
    'Membuat permintaan yang sama dua kali tidak berakibat dua kali.',
    [
      p(
        'Jaringan tidak bisa diandalkan. Klien mengirim permintaan, koneksinya putus sebelum jawaban tiba, lalu ia mencoba lagi — padahal permintaan pertama **sudah berhasil** di server. Tanpa penjagaan, pengguna terkena tagihan dua kali.',
      ),

      h2('Yang sudah idempoten secara alami'),
      table(
        ['Method', 'Idempoten?', 'Kenapa'],
        [
          ['`GET`', 'Ya', 'Hanya membaca'],
          ['`PUT`', 'Ya', 'Menetapkan keadaan akhir, bukan menambah'],
          ['`DELETE`', 'Ya', 'Menghapus dua kali tetap satu terhapus'],
          ['`PATCH`', 'Tidak selalu', '`{ "saldo": "+100" }` menambah tiap kali'],
          ['`POST`', '**Tidak**', 'Setiap panggilan membuat sesuatu yang baru'],
        ],
      ),

      h2('`Idempotency-Key`'),
      code(
        'text',
        `
        POST /pembayaran
        Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
        Content-Type: application/json

        { "jumlah": 150000, "pesananId": 42 }
        `,
      ),
      p(
        'Klien membuat kunci acak **sekali per operasi logis**, dan memakai kunci yang sama saat mencoba lagi. Server mengingat hasil untuk kunci itu.',
      ),

      h2('Implementasinya'),
      code(
        'js',
        `
        export async function tanganiPembayaran(req, res) {
          const kunci = req.headers['idempotency-key'];

          if (typeof kunci !== 'string' || kunci.length < 16 || kunci.length > 128) {
            return res.status(400).json({
              error: { kode: 'IDEMPOTENCY_KEY_TIDAK_SAH', pesan: 'Header Idempotency-Key wajib' },
            });
          }

          // Kunci di-scope PER PENGGUNA — kalau tidak, satu pengguna bisa
          // membaca hasil operasi pengguna lain hanya dengan menebak kuncinya.
          const kunciPenuh = \`idem:\${req.pengguna.id}:\${kunci}\`;

          // Sidik jari body: kunci yang sama dengan isi berbeda adalah bug klien.
          const sidikJari = sha256(JSON.stringify(req.body));

          const tersimpan = await db.cariIdempotensi(kunciPenuh);

          if (tersimpan !== null) {
            if (tersimpan.sidikJari !== sidikJari) {
              return res.status(422).json({
                error: { kode: 'KUNCI_DIPAKAI_ULANG', pesan: 'Kunci dipakai untuk isi yang berbeda' },
              });
            }

            if (tersimpan.status === 'diproses') {
              // Permintaan pertama masih berjalan. Jangan proses ganda.
              return res.status(409).json({
                error: { kode: 'SEDANG_DIPROSES', pesan: 'Permintaan sedang diproses' },
              });
            }

            // Kembalikan hasil yang SAMA PERSIS, termasuk status code-nya.
            return res.status(tersimpan.statusCode).json(tersimpan.body);
          }

          // Klaim kuncinya secara atomik — INSERT yang gagal berarti
          // ada permintaan lain yang menang balapan.
          const berhasilKlaim = await db.klaimIdempotensi(kunciPenuh, sidikJari);
          if (!berhasilKlaim) {
            return res.status(409).json({
              error: { kode: 'SEDANG_DIPROSES', pesan: 'Permintaan sedang diproses' },
            });
          }

          const hasil = await layanan.proses(req.body, req.pengguna.id);

          await db.simpanHasilIdempotensi(kunciPenuh, 201, hasil);
          res.status(201).json(hasil);
        }
        `,
      ),
      callout(
        'danger',
        'Klaim kunci harus atomik',
        'Pola "cek dulu, lalu tulis" punya celah di antaranya: dua permintaan bersamaan bisa sama-sama melihat kunci belum ada, lalu keduanya memproses. Klaimnya harus berupa satu `INSERT` yang mengandalkan `UNIQUE` — kalau gagal karena bentrok, berarti sudah ada yang menang.',
      ),

      h2('Masa berlaku kunci'),
      code(
        'sql',
        `
        CREATE TABLE idempotensi (
          kunci        VARCHAR(200) PRIMARY KEY,
          sidik_jari   CHAR(64) NOT NULL,
          status       VARCHAR(20) NOT NULL,   -- diproses | selesai
          status_code  INTEGER,
          body         JSONB,
          kedaluwarsa_pada TIMESTAMPTZ NOT NULL
        );

        CREATE INDEX idx_idempotensi_kedaluwarsa ON idempotensi(kedaluwarsa_pada);
        `,
      ),
      p(
        'Simpan 24 jam sampai beberapa hari — cukup lama untuk menutupi percobaan ulang, cukup pendek supaya tabelnya tidak tumbuh tanpa batas. Bersihkan dengan job terjadwal.',
      ),

      h2('Kapan ini diperlukan'),
      ul(
        '**Pembayaran dan transaksi keuangan** — tanpa pengecualian.',
        '**Pembuatan pesanan** dengan stok terbatas.',
        '**Pengiriman notifikasi** — email ganda menyebalkan, SMS ganda berbiaya.',
        '**Webhook masuk** — pengirim hampir selalu memakai pengiriman at-least-once.',
      ),
      callout(
        'warning',
        'Webhook pasti akan terkirim lebih dari sekali',
        'Hampir semua penyedia webhook memakai jaminan **at-least-once**: kalau jawabanmu lambat atau gagal, mereka mengirim ulang. Handler webhook yang tidak idempoten akan memproses pembayaran yang sama dua kali. Simpan id peristiwa dari pengirim dan abaikan yang sudah pernah diproses.',
      ),
    ],
  ),

  written(
    'caching-http',
    'Caching HTTP: `ETag` & `Cache-Control`',
    11,
    'Membiarkan klien dan perantara menyimpan jawaban dengan aman.',
    [
      p(
        'Permintaan tercepat adalah yang tidak pernah dikirim. Caching HTTP sudah tersedia di setiap browser dan CDN — yang perlu kamu lakukan hanyalah menyatakan aturannya dengan benar.',
      ),

      h2('`Cache-Control`'),
      code(
        'text',
        `
        # Data publik yang jarang berubah
        Cache-Control: public, max-age=3600

        # Boleh disimpan, tapi periksa dulu ke server setiap kali
        Cache-Control: no-cache

        # JANGAN pernah disimpan — untuk data privat & sensitif
        Cache-Control: no-store

        # Hanya browser pengguna, bukan CDN atau proxy bersama
        Cache-Control: private, max-age=300

        # Boleh pakai yang basi sambil menyegarkan di latar
        Cache-Control: public, max-age=60, stale-while-revalidate=600
        `,
      ),
      callout(
        'danger',
        '`no-cache` tidak berarti "jangan simpan"',
        'Ini penamaan yang membingungkan dan sumber kebocoran nyata. `no-cache` berarti *"boleh disimpan, tapi validasikan dulu sebelum dipakai"*. Yang berarti "jangan pernah disimpan" adalah **`no-store`**. Untuk respons berisi data pribadi, `no-store` yang kamu butuhkan.',
      ),
      code(
        'js',
        `
        // Data privat — jangan sampai tersimpan di CDN atau proxy bersama
        res.set('Cache-Control', 'no-store');

        // Data publik yang boleh disimpan CDN
        res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
        `,
      ),

      h2('`ETag` — validasi bersyarat'),
      code(
        'text',
        `
        # Permintaan pertama
        GET /artikel/42
        -> 200 OK
           ETag: "a1b2c3d4"
           { "data": { ... } }          <- 40 KB terkirim

        # Permintaan berikutnya
        GET /artikel/42
        If-None-Match: "a1b2c3d4"
        -> 304 Not Modified              <- 0 byte body
        `,
      ),
      code(
        'js',
        `
        export async function ambilArtikel(req, res) {
          const artikel = await repo.cariSatu(req.params.id);
          if (artikel === null) return kirim404(res);

          // ETag dari sesuatu yang pasti berubah saat isinya berubah.
          const etag = \`"\${sha256(JSON.stringify(artikel)).slice(0, 16)}"\`;

          res.set('ETag', etag);
          res.set('Cache-Control', 'private, no-cache');

          if (req.headers['if-none-match'] === etag) {
            return res.status(304).end();   // tanpa body
          }

          res.json({ data: artikel });
        }
        `,
      ),
      p(
        'Servernya tetap bekerja — query tetap jalan. Yang dihemat adalah **bandwidth** dan waktu parsing di klien. Untuk respons besar di jaringan lambat, itu perbedaan yang terasa.',
      ),

      h2('`ETag` untuk mencegah lost update'),
      code(
        'text',
        `
        # Klien mengubah artikel yang ia baca tadi
        PUT /artikel/42
        If-Match: "a1b2c3d4"

        -> 200 kalau versinya masih sama
        -> 412 Precondition Failed kalau sudah diubah orang lain
        `,
      ),
      callout(
        'tip',
        'Ini optimistic concurrency, dan ia menutup bug yang halus',
        'Dua editor membuka artikel yang sama. Yang pertama menyimpan, yang kedua menyimpan setelahnya — dan perubahan yang pertama hilang tanpa jejak. Dengan `If-Match`, penyimpanan kedua ditolak `412`, dan klien bisa memberi tahu penggunanya bahwa isinya sudah berubah.',
      ),

      h2('`Vary` — jangan sampai cache tertukar'),
      code(
        'text',
        `
        Cache-Control: private, max-age=60
        Vary: Authorization, Accept-Language
        `,
      ),
      callout(
        'danger',
        'Melewatkan `Vary` bisa menyajikan data orang lain',
        'Kalau respons bergantung pada `Authorization` tapi cache tidak diberi tahu, proxy bersama bisa menyimpan jawaban milik Ana lalu menyajikannya kepada Budi. Ini bukan teori — ia kelas bug yang berulang muncul di layanan besar. Untuk data privat, pasangkan `private` dengan `no-store`, dan sebutkan `Vary` untuk apa pun yang memengaruhi isinya.',
      ),

      h2('Apa yang boleh dan tidak boleh di-cache'),
      table(
        ['Boleh di-cache publik', 'Jangan pernah'],
        [
          ['Daftar kategori', 'Profil pengguna'],
          ['Artikel yang sudah terbit', 'Isi keranjang'],
          ['Konfigurasi publik', 'Apa pun di balik autentikasi'],
          ['Aset statis (dengan hash di nama berkas)', 'Respons yang memuat token'],
        ],
      ),

      h2('Invalidasi'),
      code(
        'js',
        `
        // Setelah mutasi, cache harus disegarkan.
        // Yang paling andal: ubah kuncinya, jangan berusaha menghapusnya.
        // Aset: /app.a1b2c3.js  -> nama berubah saat isinya berubah
        // API: naikkan versi di kunci cache internal
        `,
      ),
      p(
        'Menghapus entri cache yang tersebar di banyak CDN dan proxy sulit dijamin. Mengubah kunci selalu bekerja — inilah alasan bundler menaruh hash di nama berkas.',
      ),
    ],
  ),

  written(
    'operasi-panjang',
    'Operasi Panjang: `202 Accepted` + job id',
    10,
    'Memindahkan pekerjaan lama keluar dari jalur permintaan.',
    [
      p(
        'Ekspor 500.000 baris, pembuatan laporan, pemrosesan video, sinkronisasi ke pihak ketiga — semuanya tidak boleh dikerjakan di dalam permintaan HTTP. Klien akan timeout, dan pekerjaannya tetap berjalan tanpa ada yang tahu hasilnya.',
      ),

      h2('Polanya'),
      code(
        'text',
        `
        # 1. Klien meminta
        POST /ekspor
        { "format": "csv", "rentang": "2026-01-01/2026-08-01" }

        HTTP/1.1 202 Accepted
        Location: /ekspor/job_a1b2c3
        { "data": { "jobId": "job_a1b2c3", "status": "antre" } }

        # 2. Klien memantau
        GET /ekspor/job_a1b2c3
        { "data": { "status": "diproses", "kemajuan": 45 } }

        # 3. Selesai
        GET /ekspor/job_a1b2c3
        {
          "data": {
            "status": "selesai",
            "unduhUrl": "https://.../ekspor/a1b2c3.csv?token=...",
            "kedaluwarsaPada": "2026-08-03T10:00:00Z"
          }
        }
        `,
      ),

      h2('Bentuk status job'),
      code(
        'js',
        `
        const STATUS = ['antre', 'diproses', 'selesai', 'gagal', 'dibatalkan'];

        {
          jobId: 'job_a1b2c3',
          status: 'diproses',
          kemajuan: 45,                        // 0-100, kalau bisa dihitung
          dibuatPada: '2026-08-02T10:00:00Z',
          selesaiPada: null,
          hasil: null,
          error: null,                          // diisi kalau status 'gagal'
        }
        `,
      ),
      callout(
        'danger',
        'Status job harus di-scope ke pemiliknya',
        'Job id sering bisa ditebak, dan hasilnya sering berisi data sensitif. `GET /ekspor/job_a1b2c3` yang tidak memeriksa siapa pemilik job itu adalah IDOR — dengan hadiah berupa berkas ekspor lengkap. Setiap pembacaan status wajib di-scope ke pengguna yang meminta.',
      ),

      h2('Jangan buat job ganda'),
      code(
        'js',
        `
        // Pengguna menekan tombol dua kali -> dua ekspor identik berjalan.
        // Idempotency-Key (sub-bab 1.7) menutupnya:
        const kunci = req.headers['idempotency-key'];
        const adaJob = await db.cariJobAktif(req.pengguna.id, kunci);

        if (adaJob !== null) {
          // Kembalikan job yang SUDAH ada, jangan buat yang baru.
          return res.status(202)
            .location(\`/ekspor/\${adaJob.id}\`)
            .json({ data: adaJob });
        }
        `,
      ),

      h2('Memberi tahu klien tanpa polling terus-menerus'),
      table(
        ['Cara', 'Cocok untuk', 'Catatan'],
        [
          ['Polling', 'Job pendek, klien sederhana', 'Beri `Retry-After` supaya tidak membanjiri'],
          ['Webhook', 'Klien server-to-server', 'Klien harus punya endpoint publik'],
          ['SSE', 'Kemajuan waktu-nyata satu arah', 'Lebih sederhana dari WebSocket'],
          ['WebSocket', 'Dua arah', 'Paling berat; hanya kalau memang perlu'],
        ],
      ),
      code(
        'text',
        `
        HTTP/1.1 200 OK
        Retry-After: 5

        { "data": { "status": "diproses" } }
        `,
      ),

      h2('Kegagalan harus terlihat'),
      code(
        'json',
        `
        {
          "data": {
            "jobId": "job_a1b2c3",
            "status": "gagal",
            "error": {
              "kode": "SUMBER_DATA_TIDAK_TERJANGKAU",
              "pesan": "Gagal mengambil data. Coba lagi nanti.",
              "requestId": "r_9f8e7d"
            },
            "bisaDiulang": true
          }
        }
        `,
      ),
      callout(
        'warning',
        'Job yang gagal diam-diam lebih buruk daripada yang gagal keras',
        'Pengguna menunggu tanpa batas untuk sesuatu yang tidak akan pernah selesai. Setiap job harus punya keadaan akhir — `selesai`, `gagal`, atau `dibatalkan` — dan batas waktu yang memindahkannya ke `gagal` kalau macet terlalu lama.',
      ),

      h2('Hasil yang bisa diunduh'),
      ul(
        'URL bertanda tangan dengan **masa berlaku pendek**, bukan URL tetap yang bisa ditebak.',
        'Simpan di object storage, bukan di disk instance yang bisa hilang.',
        'Hapus otomatis setelah kedaluwarsa — data ekspor sering memuat informasi sensitif.',
        'Sertakan `Content-Disposition` supaya browser mengunduhnya, bukan merendernya.',
      ),
    ],
  ),

  written(
    'openapi',
    'Dokumentasi API dengan OpenAPI',
    11,
    'Kontrak yang bisa dibaca mesin — dan karenanya tidak bisa basi diam-diam.',
    [
      p(
        'Dokumentasi yang ditulis terpisah dari kode akan basi. OpenAPI menutup celah itu: ia bisa dihasilkan dari skema validasi yang sudah kamu tulis, dan bisa dipakai untuk menghasilkan klien, memvalidasi respons, dan menguji kontrak.',
      ),

      h2('Bentuknya'),
      code(
        'yaml',
        `
        openapi: 3.1.0
        info:
          title: API Ruang Belajar
          version: 1.0.0

        paths:
          /artikel:
            get:
              summary: Daftar artikel
              parameters:
                - name: hal
                  in: query
                  schema: { type: integer, minimum: 1, default: 1 }
                - name: per_hal
                  in: query
                  schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
              responses:
                '200':
                  description: Berhasil
                  content:
                    application/json:
                      schema:
                        $ref: '#/components/schemas/DaftarArtikel'
                '401':
                  $ref: '#/components/responses/TidakTerautentikasi'

        components:
          schemas:
            Artikel:
              type: object
              required: [id, judul, status]
              properties:
                id: { type: integer }
                judul: { type: string, maxLength: 200 }
                status: { type: string, enum: [draf, terbit, arsip] }
          securitySchemes:
            bearerAuth:
              type: http
              scheme: bearer
              bearerFormat: JWT
        `,
      ),

      h2('Hasilkan dari skema, jangan tulis dua kali'),
      code(
        'js',
        `
        import { z } from 'zod';
        import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

        extendZodWithOpenApi(z);

        // Skema yang SAMA dipakai untuk memvalidasi permintaan
        // DAN untuk menghasilkan dokumentasi.
        export const SkemaArtikel = z.object({
          id: z.number().int().openapi({ example: 42 }),
          judul: z.string().max(200).openapi({ example: 'Belajar API' }),
          status: z.enum(['draf', 'terbit', 'arsip']),
        }).openapi('Artikel');
        `,
      ),
      callout(
        'tip',
        'Satu sumber kebenaran',
        'Dokumentasi yang ditulis tangan pasti akan berbeda dari kode — bukan karena orang malas, tapi karena tidak ada yang membuatnya gagal saat menyimpang. Menghasilkannya dari skema validasi membuat keduanya tidak bisa berbeda.',
      ),
      code(
        'php',
        `
        // Laravel: paket seperti Scramble membaca Form Request dan API Resource
        composer require dedoc/scramble
        // -> dokumentasi tersedia di /docs/api tanpa anotasi tambahan
        `,
      ),

      h2('Apa yang harus ada di setiap endpoint'),
      ol(
        '**Ringkasan** dalam satu kalimat, dan penjelasan kalau perilakunya tidak jelas.',
        '**Semua parameter** beserta tipe, batas, dan nilai default.',
        '**Skema respons sukses** dengan contoh sungguhan.',
        '**Semua respons gagal** yang mungkin — `400`, `401`, `403`, `404`, `409`, `422`, `429`.',
        '**Kebutuhan autentikasi** dan izin yang diperlukan.',
        '**Batas rate limit** yang berlaku untuk endpoint itu.',
      ),
      callout(
        'warning',
        'Respons gagal yang tidak didokumentasikan adalah penyebab bug klien',
        'Klien yang tidak tahu bahwa sebuah endpoint bisa menjawab `409` tidak akan menanganinya — dan penggunanya melihat pesan error mentah atau layar kosong. Dokumentasi yang hanya memuat jalur sukses hanya mendokumentasikan separuh kontrak.',
      ),

      h2('Yang bisa dilakukan setelah ada OpenAPI'),
      table(
        ['Kegunaan', 'Alat'],
        [
          ['Halaman dokumentasi interaktif', 'Swagger UI, Scalar, Redoc'],
          ['Menghasilkan klien bertipe', '`openapi-typescript`, `orval`'],
          ['Uji kontrak di CI', 'Dredd, Schemathesis'],
          ['Memvalidasi respons saat pengembangan', 'Middleware validator OpenAPI'],
          ['Data tiruan untuk frontend', 'Prism'],
        ],
      ),
      code(
        'bash',
        `
        # Menghasilkan tipe TypeScript untuk frontend dari spesifikasi yang sama
        npx openapi-typescript http://localhost:3000/openapi.json -o src/tipe-api.ts
        `,
      ),
      p(
        'Ini yang membuat kontrak benar-benar berguna: frontend memakai tipe yang **diturunkan** dari API, bukan ditulis ulang dengan tangan. Perubahan di backend langsung menjadi error type-check di frontend — dibahas lagi di Bab 4.1.',
      ),

      h2('Jangan bocorkan spesifikasi internal'),
      callout(
        'danger',
        'Endpoint dokumentasi juga endpoint',
        'Spesifikasi lengkap memberi peta seluruh API-mu — termasuk endpoint admin yang tidak ditautkan di mana pun. Kalau API-mu tidak publik, lindungi `/openapi.json` dan halaman dokumentasinya dengan autentikasi yang sama seperti endpoint lain. "Tidak ada yang tahu alamatnya" bukan kontrol akses.',
      ),
    ],
  ),

  written(
    'praktik-audit-api',
    'Praktik: Audit API CRUD-mu sendiri',
    13,
    'Menerapkan seluruh bab pada API yang sudah kamu bangun.',
    [
      p(
        'Ambil API catatan yang kamu bangun di Backend Basic — versi Express maupun Laravel. Bab ini memberi kamu daftar periksa; sekarang jalankan pada kodemu sendiri dan catat temuannya.',
      ),

      h2('Cara mengaudit'),
      p(
        'Jangan membaca kode. **Panggil endpoint-nya** dan catat apa yang benar-benar terjadi. Audit yang dilakukan dengan membaca akan menemukan yang kamu ingat, bukan yang kamu tulis.',
      ),

      h2('1. Struktur URL'),
      code(
        'bash',
        `
        # Daftar seluruh rute yang benar-benar terdaftar
        php artisan route:list          # Laravel
        # atau baca berkas routes/ untuk Express
        `,
      ),
      ul(
        'Semua kata benda jamak dan konsisten satu bahasa?',
        'Ada kata kerja yang tersisa di path (`/getCatatan`, `/hapusCatatan`)?',
        'Ada rute yang bersarang lebih dari dua tingkat?',
        'Ada rute yang tidak sengaja terbuka — kolom middleware-nya kosong?',
      ),

      h2('2. Status code'),
      code(
        'bash',
        `
        # Catat status code SEBENARNYA untuk setiap kasus
        curl -s -o /dev/null -w "POST kosong        -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{}'

        curl -s -o /dev/null -w "JSON rusak         -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{"judul": '

        curl -s -o /dev/null -w "tanpa token        -> %{http_code}\\n" \\
          localhost:3000/api/catatan

        curl -s -o /dev/null -w "milik orang lain   -> %{http_code}\\n" \\
          localhost:3000/api/catatan/1 -H "Authorization: Bearer $T_LAIN"

        curl -s -o /dev/null -w "id bukan angka     -> %{http_code}\\n" \\
          localhost:3000/api/catatan/abc -H "Authorization: Bearer $T"

        curl -s -o /dev/null -w "tidak ada          -> %{http_code}\\n" \\
          localhost:3000/api/catatan/999999 -H "Authorization: Bearer $T"

        curl -s -o /dev/null -w "buat berhasil      -> %{http_code}\\n" \\
          -X POST localhost:3000/api/catatan -H "Authorization: Bearer $T" \\
          -H 'Content-Type: application/json' -d '{"judul":"A","isi":"B"}'

        curl -s -o /dev/null -w "hapus berhasil     -> %{http_code}\\n" \\
          -X DELETE localhost:3000/api/catatan/1 -H "Authorization: Bearer $T"
        `,
      ),
      table(
        ['Kasus', 'Harus'],
        [
          ['POST body kosong', '`422`'],
          ['JSON rusak', '`400`'],
          ['Tanpa token', '`401`'],
          ['Milik orang lain', '`404` (atau `403`)'],
          ['id bukan angka', '`400`'],
          ['Tidak ada', '`404`'],
          ['Buat berhasil', '`201` + header `Location`'],
          ['Hapus berhasil', '`204` tanpa body'],
        ],
      ),
      callout(
        'danger',
        'Baris keempat adalah yang paling penting',
        'Kalau ia menjawab `200`, kamu punya IDOR — dan setiap pengguna bisa membaca data seluruh pengguna lain hanya dengan menaikkan angka di URL. Perbaiki ini sebelum yang lain.',
      ),

      h2('3. Bentuk error'),
      code(
        'bash',
        `
        # Kumpulkan SEMUA bentuk error yang dihasilkan API-mu
        for kasus in "kosong" "rusak" "tanpa-token" "tidak-ada"; do
          echo "--- $kasus ---"
        done
        # Lalu bandingkan: apakah semuanya berbentuk sama?
        `,
      ),
      ul(
        'Satu bentuk untuk semua error?',
        'Ada `err.message` mentah yang bocor untuk kasus `5xx`?',
        'Ada nama tabel, jalur berkas, atau potongan query di respons?',
        'Ada `requestId` yang bisa dicocokkan ke log?',
      ),

      h2('4. Paginasi & batas'),
      code(
        'bash',
        `
        # Apakah batas atasnya ditegakkan?
        curl -s "localhost:3000/api/catatan?per_hal=999999" -H "Authorization: Bearer $T" \\
          | head -c 200

        # Apakah urutannya stabil? Panggil dua kali, bandingkan.
        curl -s "localhost:3000/api/catatan?hal=1" -H "Authorization: Bearer $T" > /tmp/a.json
        curl -s "localhost:3000/api/catatan?hal=1" -H "Authorization: Bearer $T" > /tmp/b.json
        diff /tmp/a.json /tmp/b.json && echo "stabil" || echo "TIDAK STABIL"
        `,
      ),

      h2('5. Header'),
      code(
        'bash',
        `
        curl -sI localhost:3000/api/catatan -H "Authorization: Bearer $T"
        `,
      ),
      ul(
        '`Cache-Control: no-store` pada data privat?',
        'Tidak ada `X-Powered-By` atau header lain yang menyebut teknologi dan versinya?',
        'Ada `X-Request-Id` yang dikembalikan?',
        'Header rate limit (`RateLimit-*`) ada saat mendekati batas?',
      ),

      h2('Menuliskan temuan'),
      code(
        'text',
        `
        TEMUAN AUDIT API — <tanggal>

        BERAT
        [ ] GET /api/catatan/{id} menjawab 200 untuk catatan milik pengguna lain (IDOR)
        [ ] Respons 500 memuat err.message berisi nama constraint database

        SEDANG
        [ ] per_hal tidak dibatasi; ?per_hal=999999 mengembalikan seluruh tabel
        [ ] Bentuk error berbeda antara middleware validasi dan handler

        RINGAN
        [ ] DELETE mengembalikan 200 dengan body, seharusnya 204
        [ ] Tidak ada header Location pada 201
        `,
      ),
      callout(
        'tip',
        'Urutkan berdasarkan dampak, bukan berdasarkan urutan penemuan',
        'Temuan berat adalah yang membocorkan data atau memungkinkan penyalahgunaan. Temuan ringan adalah ketidakrapian kontrak. Keduanya layak diperbaiki, tapi hanya yang pertama yang tidak boleh menunggu.',
      ),

      divider,

      checklist(
        'bi1-praktik',
        'Checklist audit API',
        'Semua URL kata benda jamak, satu bahasa, tanpa kata kerja di path',
        'Tidak ada rute yang bersarang lebih dari dua tingkat',
        'Setiap rute yang seharusnya terlindungi benar-benar punya middleware auth',
        'Kedelapan kasus status code di atas diuji dan hasilnya dicatat',
        'Catatan milik pengguna lain menjawab 404/403 — bukan 200',
        'Satu bentuk error untuk seluruh API, dengan kode error yang stabil',
        'Tidak ada `err.message`, stack trace, atau detail database di respons 5xx',
        'Setiap error menyertakan `requestId` yang bisa dicocokkan ke log',
        'Setiap endpoint daftar berpaginasi, dengan batas atas ditegakkan server',
        '`ORDER BY` punya pemecah seri unik sehingga urutannya stabil',
        'Kolom untuk sort dan field berasal dari allow-list, bukan dari input',
        '`Cache-Control: no-store` pada semua respons berisi data privat',
        'Tidak ada header yang menyebut teknologi atau versinya',
        '201 menyertakan header `Location`; 204 tidak punya body',
        'Endpoint yang mengubah uang atau stok menerima `Idempotency-Key`',
        'Temuan ditulis dan diurutkan berdasarkan dampak',
      ),
    ],
  ),
];
