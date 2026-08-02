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
 * Backend Basic — Chapter 1, all nine lessons.
 *
 * The reader arrives here from a fully frontend track, so the chapter's job is to replace
 * "the backend is where the API lives" with an accurate model of what actually crosses the wire.
 * Everything is framework-agnostic on purpose: Express arrives in chapter 3, Laravel in chapter 4,
 * and neither should be mistaken for how the web itself works.
 */
export const lessons: LessonDraft[] = [
  written(
    'client-server',
    'Client–Server & Siklus Request/Response',
    9,
    'Satu percakapan yang selalu dimulai klien dan selalu dijawab server.',
    [
      p(
        'Seluruh web berdiri di atas satu pola sederhana: **klien meminta, server menjawab**. Server tidak pernah memulai percakapan. Ia menunggu, menjawab, lalu melupakan — dan dari sifat "melupakan" itulah hampir semua keputusan desain backend berasal.',
      ),

      h2('Perjalanan satu permintaan'),
      code(
        'text',
        `
        Browser                      Internet                    Server
        ───────────────────────────────────────────────────────────────
        1. Ketik alamat
        2. DNS: nama -> alamat IP    ──────────>
        3. Buka koneksi TCP          <────────── (jabat tangan)
        4. Jabat tangan TLS          <──────────> (kunci enkripsi)
        5. Kirim HTTP request        ──────────>
                                                  6. Server memproses
                                                     (routing, query DB,
                                                      susun jawaban)
        7. Terima HTTP response      <──────────
        8. Render
        `,
      ),
      p(
        'Langkah 1–4 terjadi sebelum satu byte pun kode aplikasimu berjalan. Ini penting saat mendiagnosis: "servernya lambat" kadang sebenarnya DNS lambat, atau koneksi yang dibuka ulang terus-menerus.',
      ),

      h2('Yang dikerjakan klien vs server'),
      table(
        ['', 'Klien (browser)', 'Server'],
        [
          ['Memulai percakapan', '**Selalu**', 'Tidak pernah'],
          ['Bisa dipercaya', '**Tidak pernah**', 'Ya (kamu yang menulisnya)'],
          ['Menyimpan rahasia', 'Tidak bisa', 'Bisa'],
          ['Menentukan siapa boleh apa', 'Tidak', '**Ya**'],
          ['Bisa dimodifikasi pengguna', 'Sepenuhnya', 'Tidak'],
        ],
      ),
      callout(
        'danger',
        'Kalimat terpenting di seluruh kategori Backend',
        '**Semua yang datang dari klien adalah masukan yang tidak tepercaya.** Bukan sebagian — semuanya: body, query string, header, cookie, bahkan hal yang "hanya bisa dikirim aplikasi kita sendiri". Siapa pun bisa membuka DevTools, memakai `curl`, atau menulis skrip. Validasi di browser adalah kenyamanan; penjagaan sebenarnya selalu di server.',
      ),

      h2('Stateless: server melupakanmu setiap kali'),
      p(
        'HTTP tidak punya ingatan. Permintaan kedua tidak tahu apa-apa tentang permintaan pertama, meski datang dari orang yang sama satu detik kemudian.',
      ),
      code(
        'text',
        `
        Request 1: POST /login      -> server: "oke, kamu Ana"
        Request 2: GET /profil      -> server: "...siapa kamu?"
        `,
      ),
      p(
        'Karena itu setiap permintaan harus **membawa buktinya sendiri** — cookie sesi atau token di header. Ini bukan kekurangan yang harus diakali; ini yang membuat satu server bisa melayani ribuan orang tanpa menyimpan siapa-siapa, dan yang membuat server bisa ditambah jumlahnya tanpa ada yang "kehilangan sesinya".',
      ),

      h2('Beberapa jenis klien, satu server'),
      code(
        'text',
        `
                   Browser  ──┐
                   Mobile   ──┼──>  API  ──>  Database
                   curl     ──┤
                   Server lain ┘
        `,
      ),
      p(
        'Konsekuensi praktisnya: **jangan pernah menaruh aturan di satu jenis klien saja**. Batas maksimal karakter yang hanya dipasang di form React tidak berlaku bagi aplikasi mobile — dan tidak berlaku sama sekali bagi `curl`.',
      ),
    ],
  ),

  written(
    'http-mendalam',
    'HTTP Mendalam: method, status code, header',
    12,
    'Kosakata yang dipakai setiap permintaan di web.',
    [
      p(
        'HTTP adalah teks. Sebuah permintaan hanyalah beberapa baris yang dikirim lewat koneksi — tidak ada sihir di dalamnya, dan itulah kenapa ia bisa dipelajari sampai tuntas.',
      ),

      h2('Bentuk mentahnya'),
      code(
        'text',
        `
        POST /api/catatan HTTP/1.1
        Host: contoh.com
        Content-Type: application/json
        Authorization: Bearer eyJhbGci...
        Content-Length: 46

        {"judul":"Belajar HTTP","isi":"Catatan pertama"}
        `,
        { caption: 'Baris pertama, lalu header, lalu satu baris kosong, lalu body.' },
      ),
      code(
        'text',
        `
        HTTP/1.1 201 Created
        Content-Type: application/json
        Location: /api/catatan/42

        {"id":42,"judul":"Belajar HTTP"}
        `,
      ),

      h2('Method: apa yang ingin kamu lakukan'),
      table(
        ['Method', 'Maksud', 'Aman?', 'Idempoten?'],
        [
          ['`GET`', 'Ambil data', '**Ya**', 'Ya'],
          ['`POST`', 'Buat baru / aksi', 'Tidak', '**Tidak**'],
          ['`PUT`', 'Ganti seluruhnya', 'Tidak', 'Ya'],
          ['`PATCH`', 'Ubah sebagian', 'Tidak', 'Tidak selalu'],
          ['`DELETE`', 'Hapus', 'Tidak', 'Ya'],
        ],
      ),
      p('Dua istilah di kolom kanan sering dikira sama, padahal berbeda:'),
      ul(
        '**Aman (safe)** — tidak mengubah apa pun. `GET` hanya membaca.',
        '**Idempoten** — dijalankan sekali atau sepuluh kali, hasil akhirnya sama. `DELETE /catatan/42` sepuluh kali tetap menghasilkan satu catatan terhapus.',
      ),
      callout(
        'danger',
        '`GET` yang mengubah data adalah bug keamanan',
        'Browser, proxy, dan perayap bebas mengambil ulang `GET` kapan saja — termasuk melakukan prefetch tanpa pengguna mengklik apa pun. Sebuah `GET /hapus?id=42` bisa dijalankan perayap dan menghapus data tanpa ada yang menyentuhnya. Aksi yang mengubah state **wajib** memakai `POST`, `PUT`, `PATCH`, atau `DELETE`.',
      ),

      h2('Status code: apa yang terjadi'),
      table(
        ['Kelas', 'Arti', 'Yang sering dipakai'],
        [
          ['`2xx`', 'Berhasil', '`200 OK`, `201 Created`, `204 No Content`'],
          ['`3xx`', 'Dialihkan', '`301` permanen, `302`/`307` sementara, `304 Not Modified`'],
          ['`4xx`', '**Kesalahan klien**', '`400`, `401`, `403`, `404`, `409`, `422`, `429`'],
          ['`5xx`', '**Kesalahan server**', '`500`, `502`, `503`, `504`'],
        ],
      ),
      p('Empat kode yang paling sering tertukar:'),
      table(
        ['Kode', 'Artinya sebenarnya'],
        [
          ['`401 Unauthorized`', '"Aku tidak tahu kamu siapa" — belum login, atau token tidak sah'],
          [
            '`403 Forbidden`',
            '"Aku tahu kamu siapa, dan kamu tidak boleh" — sudah login, tapi tidak berhak',
          ],
          ['`404 Not Found`', 'Tidak ada, **atau** kamu tidak berhak tahu bahwa ia ada'],
          ['`422 Unprocessable`', 'Bentuknya benar, isinya tidak lolos validasi'],
        ],
      ),
      callout(
        'tip',
        'Kapan `404` lebih baik daripada `403`',
        'Menjawab `403` untuk sumber daya milik orang lain sudah mengungkap bahwa sumber daya itu **ada**. Penyerang bisa memakainya untuk memetakan data yang bukan haknya, hanya dari beda pesan error. Untuk data privat, `404` sering lebih tepat: ia tidak membocorkan apa pun.',
      ),

      h2('Header yang perlu kamu kenali'),
      table(
        ['Header', 'Arah', 'Gunanya'],
        [
          ['`Content-Type`', 'Keduanya', 'Format body: `application/json`, `multipart/form-data`'],
          ['`Authorization`', 'Permintaan', 'Kredensial: `Bearer <token>`'],
          ['`Accept`', 'Permintaan', 'Format yang diinginkan klien'],
          ['`Cookie` / `Set-Cookie`', 'Permintaan / Jawaban', 'Sesi'],
          ['`Cache-Control`', 'Keduanya', 'Boleh disimpan atau tidak, berapa lama'],
          ['`Location`', 'Jawaban', 'Alamat sumber daya baru (dipakai bersama `201`)'],
          ['`X-Forwarded-For`', 'Permintaan', 'IP asli di balik proxy — **bisa dipalsukan**'],
        ],
      ),
      callout(
        'warning',
        'Header juga masukan yang tidak tepercaya',
        'Siapa pun bisa mengirim header apa pun dengan nilai apa pun. `X-Forwarded-For` hanya bisa dipercaya kalau proxy di depanmu benar-benar menimpanya, dan `User-Agent` tidak pernah bisa dijadikan dasar keputusan keamanan.',
      ),
    ],
  ),

  written(
    'url-param-body',
    'URL, Query String, Path Param & Body',
    9,
    'Tiga tempat data bisa dititipkan, dan kapan memakai yang mana.',
    [
      p(
        'Ada tiga tempat klien bisa menitipkan data pada sebuah permintaan. Memilih yang salah bukan sekadar soal gaya — satu di antaranya bisa membocorkan data ke log dan riwayat browser.',
      ),

      h2('Anatomi URL'),
      code(
        'text',
        `
        https://contoh.com:443/api/catatan/42?urut=baru&hal=2#bagian
        └─┬─┘   └────┬────┘└┬┘└──────┬──────┘└───────┬───────┘└──┬──┘
        skema     host    port    path        query string   fragment

        fragment (#bagian) TIDAK PERNAH dikirim ke server —
        ia hanya dipakai browser.
        `,
      ),

      h2('Tiga tempat data'),
      table(
        ['Tempat', 'Untuk', 'Contoh'],
        [
          ['**Path param**', 'Mengidentifikasi sumber daya tertentu', '`/catatan/42`'],
          ['**Query string**', 'Menyaring, mengurutkan, memaginasi', '`?kategori=kerja&hal=2`'],
          ['**Body**', 'Data yang dikirim untuk disimpan/diubah', '`{"judul":"..."}`'],
        ],
      ),
      code(
        'text',
        `
        GET    /catatan            -> semua catatan
        GET    /catatan?arsip=true -> yang diarsipkan saja   (query menyaring)
        GET    /catatan/42         -> satu catatan           (path mengidentifikasi)
        POST   /catatan            -> buat baru              (data di body)
        PATCH  /catatan/42         -> ubah sebagian          (path + body)
        DELETE /catatan/42         -> hapus                  (path saja)
        `,
      ),

      h2('Aturan memilih'),
      ol(
        'Menunjuk **satu** sumber daya tertentu → **path param**.',
        'Mengubah **cara** hasil ditampilkan (filter, sort, halaman) → **query string**.',
        'Data yang **disimpan atau diubah** → **body**.',
      ),

      h2('Yang tidak boleh masuk URL'),
      callout(
        'danger',
        'URL tercatat di banyak tempat sekaligus',
        'Query string masuk ke riwayat browser, log akses server, log proxy dan CDN, serta header `Referer` saat pengguna mengeklik tautan keluar. Artinya: **jangan pernah** menaruh password, token, id sesi, nomor kartu, atau data pribadi di sana. Semuanya harus lewat body atau header.',
      ),
      compare(
        {
          title: 'Berbahaya',
          lang: 'text',
          code: `
          POST /login?email=ana@contoh.com
                     &password=rahasia123
          `,
          notes: ['Password ikut ke log server dan riwayat browser'],
        },
        {
          title: 'Benar',
          lang: 'text',
          code: `
          POST /login
          Content-Type: application/json

          {"email":"ana@contoh.com",
           "password":"rahasia123"}
          `,
          notes: ['Body tidak dicatat log akses standar'],
        },
      ),

      h2('Encoding'),
      code(
        'js',
        `
        // Nilai yang mengandung spasi, &, =, atau ? harus di-encode.
        const kueri = new URLSearchParams({
          cari: 'react & next',
          urut: 'baru',
        });

        console.log(kueri.toString());  // cari=react+%26+next&urut=baru

        // Jangan merangkai URL dengan penggabungan string —
        // satu karakter '&' di input pengguna sudah cukup merusaknya.
        const url = \`/api/catatan?\${kueri}\`;
        `,
      ),
      callout(
        'warning',
        'Batasi ukuran, di ketiga tempat',
        'URL punya batas praktis (~2000 karakter di banyak proxy), tapi body tidak punya batas alami. Tanpa batas ukuran body yang kamu tetapkan sendiri, satu permintaan berisi 500 MB JSON cukup untuk menghabiskan memori server. Ini pertahanan pertama terhadap penyalahgunaan sumber daya.',
      ),
    ],
  ),

  written(
    'rest',
    'REST: resource, kata benda, statelessness',
    11,
    'Satu gaya perancangan API yang menjelaskan kenapa URL-nya berbentuk begitu.',
    [
      p(
        'REST bukan protokol dan bukan library — ia adalah **gaya arsitektur**. Intinya satu: perlakukan segalanya sebagai **sumber daya (resource)** yang punya alamat, lalu pakai method HTTP untuk menyatakan apa yang ingin kamu lakukan padanya.',
      ),

      h2('Kata benda di URL, kata kerja di method'),
      compare(
        {
          title: 'Bukan REST',
          lang: 'text',
          code: `
          POST /buatCatatan
          POST /ambilSemuaCatatan
          POST /updateCatatan
          POST /hapusCatatanById
          POST /arsipkanCatatan
          `,
          notes: [
            'Semua POST',
            'Setiap aksi butuh URL baru',
            'Cache dan retry mustahil diandalkan',
          ],
        },
        {
          title: 'REST',
          lang: 'text',
          code: `
          POST   /catatan
          GET    /catatan
          PUT    /catatan/42
          DELETE /catatan/42
          POST   /catatan/42/arsip
          `,
          notes: [
            'URL menyebut benda, method menyebut aksi',
            'Perilakunya bisa ditebak tanpa dokumentasi',
          ],
        },
      ),

      h2('Pola URL yang baku'),
      code(
        'text',
        `
        GET    /catatan              daftar
        POST   /catatan              buat
        GET    /catatan/42           satu item
        PUT    /catatan/42           ganti seluruhnya
        PATCH  /catatan/42           ubah sebagian
        DELETE /catatan/42           hapus

        # Bersarang untuk hubungan kepemilikan
        GET    /catatan/42/komentar        komentar milik catatan 42
        POST   /catatan/42/komentar        tambah komentar di catatan 42
        `,
      ),
      ul(
        'Pakai **jamak** secara konsisten: `/catatan`, bukan campur `/catatan` dan `/note`.',
        'Pakai **huruf kecil** dan tanda hubung: `/kategori-produk`, bukan `/kategoriProduk`.',
        'Jangan bersarang lebih dari **dua tingkat**. `/a/1/b/2/c/3` sudah lebih baik dipecah.',
        'Jangan menaruh kata kerja di path kecuali untuk aksi yang benar-benar bukan CRUD.',
      ),

      h2('Kalau aksinya bukan CRUD'),
      p(
        'Tidak semua hal cocok dipaksa jadi CRUD. "Kirim ulang email verifikasi" atau "terbitkan artikel" bukan operasi pada bentuk data. Untuk itu, sub-resource yang menyatakan aksinya lebih jujur daripada memaksa `PATCH`:',
      ),
      code(
        'text',
        `
        POST /pesanan/42/batal
        POST /artikel/7/terbitkan
        POST /pengguna/3/kirim-ulang-verifikasi
        `,
      ),
      p(
        'Memaksa semuanya menjadi CRUD murni menghasilkan API yang terlihat rapi tapi sulit dipakai.',
      ),

      h2('Stateless: konsekuensinya nyata'),
      p(
        'Server REST tidak menyimpan konteks percakapan. Setiap permintaan harus lengkap sendiri — membawa identitas, membawa filternya, membawa halamannya.',
      ),
      code(
        'text',
        `
        # SALAH: mengandalkan server mengingat langkah sebelumnya
        POST /cari  {"kata":"react"}
        GET  /hasil-berikutnya           <- server harus ingat "react"

        # BENAR: setiap permintaan lengkap sendiri
        GET /catatan?cari=react&hal=1
        GET /catatan?cari=react&hal=2
        `,
      ),
      p(
        'Keuntungannya: server bisa ditambah jumlahnya sesuka hati, karena tidak ada permintaan yang "harus" mendarat di mesin yang sama.',
      ),

      h2('Versi API'),
      code(
        'text',
        `
        /api/v1/catatan
        /api/v2/catatan
        `,
      ),
      callout(
        'warning',
        'Perubahan yang memutus klien lama butuh versi baru',
        'Menghapus field, mengganti namanya, mengubah tipenya, atau menambah aturan validasi baru — semuanya bisa merusak klien yang sudah berjalan. Klien mobile tidak bisa dipaksa memperbarui dirinya. Menambah field opsional aman; hampir semua perubahan lain tidak.',
      ),
    ],
  ),

  written(
    'json',
    'JSON sebagai Format Pertukaran Data',
    8,
    'Format yang dipakai hampir setiap API, beserta jebakannya.',
    [
      p(
        'JSON menjadi format standar karena ia sederhana, terbaca manusia, dan didukung setiap bahasa. Tapi kesederhanaannya juga berarti ada beberapa hal yang **tidak bisa** ia nyatakan — dan di situlah bug muncul.',
      ),

      h2('Tipe yang tersedia'),
      code(
        'json',
        `
        {
          "teks": "string",
          "angka": 42,
          "desimal": 3.14,
          "benar": true,
          "kosong": null,
          "daftar": [1, 2, 3],
          "objek": { "bersarang": "boleh" }
        }
        `,
      ),
      p('Hanya itu. Yang **tidak ada** justru yang paling sering dibutuhkan:'),
      table(
        ['Tidak ada di JSON', 'Cara umum menanganinya'],
        [
          ['Tanggal', 'String ISO 8601: `"2026-08-02T10:30:00Z"`'],
          ['Angka besar (> 2^53)', 'Kirim sebagai **string**'],
          ['Desimal uang', 'Integer dalam satuan terkecil, atau string'],
          ['Data biner', 'Base64, atau unggah terpisah'],
          ['Komentar', 'Tidak ada — jangan dipakai untuk berkas konfigurasi manusia'],
          ['`undefined`', 'Hilangkan field-nya, atau pakai `null`'],
        ],
      ),

      h2('Jebakan angka pecahan'),
      code(
        'js',
        `
        // Uang JANGAN disimpan sebagai float — hasilnya tidak eksak.
        console.log(0.1 + 0.2);        // 0.30000000000000004

        // Simpan dalam satuan terkecil (rupiah, sen), sebagai integer.
        { "harga": 150000 }            // Rp150.000
        `,
      ),
      code(
        'js',
        `
        // ID besar dari database bisa rusak diam-diam.
        JSON.parse('{"id": 9007199254740993}');   // -> 9007199254740992  (SALAH)

        // Karena itu ID besar dikirim sebagai string.
        { "id": "9007199254740993" }
        `,
      ),
      callout(
        'danger',
        'Ini rusak tanpa error apa pun',
        'Tidak ada pengecualian yang dilempar, tidak ada peringatan. Angkanya hanya berubah, dan kamu baru menyadarinya saat ada data yang tertukar. Kalau ID-mu bisa melewati 2^53, kirim sebagai string sejak awal.',
      ),

      h2('Parsing yang aman'),
      code(
        'js',
        `
        // JSON.parse melempar error untuk input rusak — TANGKAP.
        try {
          const data = JSON.parse(teksMasuk);
        } catch {
          return balas(400, { pesan: 'Body bukan JSON yang sah' });
        }
        `,
      ),
      callout(
        'warning',
        'Parse berhasil bukan berarti datanya benar',
        '`JSON.parse` hanya memastikan **bentuknya** sah. `{"jumlah": "banyak sekali"}` lolos parse dengan mulus, dan `{"peran": "admin"}` juga. Setelah parse, isinya tetap harus divalidasi dengan skema — dibahas tuntas di Bab 3.13.',
      ),

      h2('Bentuk respons yang konsisten'),
      code(
        'json',
        `
        // Daftar: bungkus dengan metadata, jangan array telanjang.
        {
          "data": [ { "id": 1, "judul": "Catatan" } ],
          "meta": { "halaman": 1, "perHalaman": 20, "total": 137 }
        }

        // Error: bentuk yang sama untuk SEMUA error.
        {
          "error": {
            "kode": "VALIDASI_GAGAL",
            "pesan": "Judul wajib diisi",
            "field": { "judul": "wajib diisi" }
          }
        }
        `,
      ),
      p(
        'Array telanjang di tingkat atas menyulitkan penambahan metadata nanti — begitu klien sudah mengharapkan array, menambahkan pembungkus menjadi perubahan yang memutus mereka.',
      ),
    ],
  ),

  written(
    'arsitektur-backend',
    'Arsitektur: Monolith, Layered, MVC',
    11,
    'Cara menyusun kode server supaya masih bisa dibaca enam bulan lagi.',
    [
      p(
        'Aplikasi backend yang baru lahir muat di satu berkas. Yang berumur satu tahun tidak. Sub-bab ini tentang batas-batas yang membuat pertumbuhan itu tetap terkendali — dan tentang tidak memasang batas yang belum dibutuhkan.',
      ),

      h2('Monolith: satu aplikasi, satu deploy'),
      p(
        'Semua kode dalam satu project, di-deploy sekaligus. Ini **default yang benar** untuk hampir semua project — termasuk yang berencana besar.',
      ),
      table(
        ['Untung', 'Rugi'],
        [
          [
            'Satu tempat untuk dijalankan dan di-debug',
            'Semua ikut ter-deploy walau yang berubah kecil',
          ],
          ['Tidak ada jaringan antar-modul', 'Satu bagian yang berat memengaruhi semuanya'],
          ['Transaksi database sederhana', 'Sulit diskalakan per bagian'],
          ['Refactor lintas modul mudah', 'Batas modul harus dijaga disiplin, bukan oleh jaringan'],
        ],
      ),
      callout(
        'warning',
        'Jangan mulai dari microservice',
        'Microservice menukar kompleksitas kode dengan kompleksitas **operasional**: penemuan layanan, pemantauan terdistribusi, kegagalan sebagian, transaksi lintas layanan, dan versi API antar tim. Semua itu biaya nyata sejak hari pertama, sementara manfaatnya baru terasa pada skala yang mungkin tidak pernah kamu capai. Mulailah dari monolith yang batas modulnya rapi.',
      ),

      h2('Layered: memisahkan berdasarkan tanggung jawab'),
      code(
        'text',
        `
        Permintaan masuk
             │
             ▼
        ┌─────────────────┐
        │ Route           │  petakan URL -> handler
        ├─────────────────┤
        │ Controller      │  baca input, panggil service, susun respons
        ├─────────────────┤
        │ Service         │  ATURAN BISNIS — bagian yang benar-benar milikmu
        ├─────────────────┤
        │ Repository      │  akses data; satu-satunya yang tahu soal SQL
        ├─────────────────┤
        │ Database        │
        └─────────────────┘
        `,
      ),
      table(
        ['Lapisan', 'Boleh tahu', 'TIDAK boleh tahu'],
        [
          ['Controller', 'HTTP: status, header, body', 'SQL, struktur tabel'],
          ['Service', 'Aturan bisnis', '**HTTP maupun SQL**'],
          ['Repository', 'Database', 'HTTP, aturan bisnis'],
        ],
      ),
      p(
        'Baris tengah itu yang paling sering dilanggar. Service yang mengembalikan `res.status(404)` sudah tercampur dengan HTTP, dan ia langsung menjadi mustahil dipakai ulang dari perintah CLI, job terjadwal, atau tes.',
      ),

      h2('MVC dan hubungannya dengan Layered'),
      table(
        ['Bagian', 'Tanggung jawab'],
        [
          ['**Model**', 'Data dan aturan yang melekat padanya'],
          ['**View**', 'Tampilan — pada API, ini adalah bentuk JSON-nya'],
          ['**Controller**', 'Menerima permintaan, mengatur alur, menyerahkan hasil'],
        ],
      ),
      p(
        'Laravel memakai MVC secara eksplisit (Bab 4). Express tidak memaksakan apa pun, jadi struktur di atas kamu bangun sendiri (Bab 3.8). Keduanya menyelesaikan masalah yang sama: **jangan campur logika bisnis dengan detail pengiriman**.',
      ),

      h2('Kapan menambah lapisan'),
      compare(
        {
          title: 'Lapisan berlebihan',
          lang: 'text',
          code: `
          Route -> Controller -> Service
                -> Repository -> DAO
                -> Mapper -> Entity -> DTO

          Untuk satu SELECT sederhana.
          `,
          notes: ['Tujuh berkas dibuka untuk memahami satu query', 'Tidak ada yang dilindungi'],
        },
        {
          title: 'Secukupnya',
          lang: 'text',
          code: `
          Route -> Controller -> Service
                -> Repository

          Tambah lapisan HANYA saat ada
          masalah nyata yang ia selesaikan.
          `,
          notes: ['Setiap lapisan bisa dijelaskan gunanya'],
        },
      ),
      callout(
        'tip',
        'Uji penghapusan',
        'Untuk setiap lapisan, tanyakan: *kalau lapisan ini dihapus, apakah kerumitannya hilang, atau justru pindah ke pemanggilnya?* Kalau hilang, lapisan itu memang tidak menanggung apa pun. Lapisan yang layak ada adalah yang **menyerap** kerumitan, bukan yang meneruskannya.',
      ),
    ],
  ),

  written(
    'environment-12factor',
    'Environment & 12-Factor App secukupnya',
    10,
    'Memisahkan konfigurasi dari kode, dan kenapa itu wajib.',
    [
      p(
        'Kode yang sama harus bisa berjalan di laptopmu, di server uji, dan di produksi — tanpa satu baris pun diubah. Yang berbeda hanyalah **konfigurasinya**. Prinsip ini yang membuat deploy bisa dipercaya.',
      ),

      h2('Konfigurasi tinggal di environment'),
      code(
        'bash',
        `
        # .env — WAJIB masuk .gitignore
        DATABASE_URL="postgresql://user:sandi@localhost:5432/app"
        JWT_SECRET="rahasia-panjang-yang-diacak"
        PORT=3000
        NODE_ENV=development
        `,
      ),
      code(
        'bash',
        `
        # .env.example — INI yang di-commit, dengan nilai KOSONG
        DATABASE_URL=
        JWT_SECRET=
        PORT=3000
        NODE_ENV=development
        `,
      ),
      callout(
        'danger',
        'Rahasia asli di `.env.example` adalah kebocoran',
        'Menulis nilai sungguhan "sebagai contoh" adalah salah satu cara paling umum rahasia masuk ke git. Placeholder harus benar-benar kosong atau jelas palsu.',
      ),

      h2('Baca sekali saat boot, dan validasi'),
      compare(
        {
          title: 'Tersebar',
          lang: 'js',
          code: `
          // di lima berkas berbeda
          const db = process.env.DATABASE_URL;
          const secret = process.env.JWT_SECRET;

          // Kalau salah ketik namanya,
          // nilainya undefined — dan baru
          // meledak saat pengguna pertama datang.
          `,
          notes: ['Gagal jauh dari penyebabnya'],
        },
        {
          title: 'Terpusat & tervalidasi',
          lang: 'ts',
          code: `
          import { z } from 'zod';

          const Skema = z.object({
            DATABASE_URL: z.string().url(),
            JWT_SECRET: z.string().min(32),
            PORT: z.coerce.number().default(3000),
          });

          // Gagal SAAT BOOT, dengan pesan jelas.
          export const env = Skema.parse(process.env);
          `,
          notes: ['Aplikasi menolak menyala kalau salah'],
        },
      ),
      p(
        'Aplikasi yang menolak start dengan pesan `JWT_SECRET: String must contain at least 32 character(s)` jauh lebih murah diperbaiki daripada aplikasi yang menyala lalu menandatangani token dengan `undefined`.',
      ),

      h2('Default harus aman, bukan permisif'),
      code(
        'ts',
        `
        // SALAH: kalau variabelnya lupa dipasang, semuanya terbuka
        const bolehSemuaOrigin = process.env.CORS_ALL !== 'false';

        // BENAR: ketiadaan nilai berarti pilihan yang paling ketat
        const bolehSemuaOrigin = process.env.CORS_ALL === 'true';
        `,
      ),

      h2('Yang benar-benar perlu dari 12-Factor'),
      table(
        ['Prinsip', 'Artinya bagi kamu sekarang'],
        [
          ['Codebase', 'Satu repo, banyak lingkungan'],
          ['Dependencies', 'Nyatakan eksplisit; lockfile ikut di-commit'],
          ['**Config**', '**Di environment, tidak pernah di kode**'],
          ['Backing services', 'Database adalah sumber daya yang dilampirkan, bisa ditukar'],
          ['**Processes**', '**Stateless** — jangan simpan sesi di memori proses'],
          ['**Logs**', '**Tulis ke stdout**, jangan kelola berkas log sendiri'],
          ['Dev/prod parity', 'Buat sedekat mungkin — versi database yang sama'],
        ],
      ),
      callout(
        'warning',
        'Stateless bukan formalitas',
        'Menyimpan sesi di memori proses bekerja sempurna sampai kamu menjalankan proses kedua. Setelah itu pengguna akan tampak "logout sendiri" secara acak — tergantung mesin mana yang kebetulan menerima permintaannya. Sesi harus di database, Redis, atau cookie bertanda tangan.',
      ),
      code(
        'bash',
        `
        # Jangan menulis berkas log sendiri. Tulis ke stdout;
        # biarkan lingkungan yang mengumpulkan dan merotasinya.
        node server.js | tee -a /var/log/app.log
        `,
      ),
    ],
  ),

  written(
    'tooling-backend',
    'Perkakas: `curl`, Postman, dan membaca log',
    10,
    'Tiga alat yang dipakai setiap hari untuk memastikan, bukan menebak.',
    [
      p(
        'Frontend punya DevTools; backend punya `curl` dan log. Keduanya membuat kamu bisa **melihat** apa yang benar-benar terjadi, bukan menebaknya dari gejala.',
      ),

      h2('`curl` — yang paling sering dipakai'),
      code(
        'bash',
        `
        # GET sederhana
        curl http://localhost:3000/api/catatan

        # Lihat header respons saja
        curl -I http://localhost:3000/api/catatan

        # POST dengan body JSON
        curl -X POST http://localhost:3000/api/catatan \\
          -H "Content-Type: application/json" \\
          -d '{"judul":"Catatan baru","isi":"Isi catatan"}'

        # Dengan token
        curl http://localhost:3000/api/profil \\
          -H "Authorization: Bearer eyJhbGci..."

        # Lihat SELURUH percakapan (header permintaan + jawaban)
        curl -v http://localhost:3000/api/catatan

        # Hanya status code — berguna untuk skrip
        curl -s -o /dev/null -w "%{http_code}\\n" http://localhost:3000/api/catatan
        `,
      ),
      callout(
        'tip',
        'Kenapa `curl`, padahal ada Postman',
        '`curl` bisa disalin ke mana pun: ke isu, ke pesan tim, ke skrip CI, ke dokumentasi. Ia tidak butuh dipasang, tidak butuh akun, dan tidak menyembunyikan apa pun. Postman lebih nyaman untuk eksplorasi berulang; `curl` lebih baik untuk **membuktikan**.',
      ),

      h2('Menguji jalur gagal, bukan hanya jalur sukses'),
      code(
        'bash',
        `
        # JSON rusak -> harus 400, bukan 500
        curl -X POST http://localhost:3000/api/catatan \\
          -H "Content-Type: application/json" \\
          -d '{"judul": '

        # Tanpa token -> harus 401
        curl -i http://localhost:3000/api/profil

        # Milik orang lain -> harus 404 atau 403, JANGAN 200
        curl -i http://localhost:3000/api/catatan/99 \\
          -H "Authorization: Bearer <token-pengguna-lain>"

        # Body raksasa -> harus 413, bukan server mati
        head -c 50000000 /dev/zero | tr '\\0' 'a' > /tmp/besar.txt
        curl -X POST http://localhost:3000/api/catatan \\
          -H "Content-Type: application/json" \\
          --data-binary @/tmp/besar.txt
        `,
      ),
      p(
        'Empat perintah itu menemukan lebih banyak bug daripada dua puluh pengujian jalur sukses. Ini penerapan langsung "uji jalur yang tidak bahagia".',
      ),

      h2('Membaca log'),
      code(
        'json',
        `
        {
          "level": "error",
          "time": "2026-08-02T10:30:00.000Z",
          "reqId": "a1b2c3",
          "method": "POST",
          "url": "/api/catatan",
          "status": 500,
          "userId": "u_42",
          "msg": "gagal menyimpan catatan",
          "err": { "type": "PostgresError", "code": "23505" }
        }
        `,
      ),
      p(
        'Log yang berguna selalu punya lima hal: **kapan, siapa, apa yang diminta, apa hasilnya, dan id korelasi**.',
      ),
      callout(
        'danger',
        'Yang tidak boleh masuk log',
        'Password, token, isi `Authorization`, nomor kartu, dan data pribadi mentah. "Log seluruh request body supaya gampang debug" adalah cara paling umum kredensial berakhir di sistem pencatatan yang diakses banyak orang dan disimpan bertahun-tahun.',
      ),

      h2('Id korelasi'),
      code(
        'ts',
        `
        // Beri setiap permintaan satu id, sertakan di semua log
        // yang berasal darinya, dan kembalikan ke klien.
        app.use((req, res, next) => {
          req.id = crypto.randomUUID();
          res.setHeader('X-Request-Id', req.id);
          next();
        });
        `,
      ),
      p(
        'Saat pengguna melapor "tadi error", satu id membuatmu bisa menemukan **persis** permintaan itu di antara jutaan baris log — bukan menebak dari perkiraan waktu.',
      ),

      h2('Alat lain yang layak dikenal'),
      table(
        ['Alat', 'Untuk'],
        [
          ['`psql` / `mysql`', 'Menjalankan query langsung tanpa lewat aplikasi'],
          ['`jq`', 'Memformat dan menyaring JSON di terminal'],
          ['`httpie`', 'Alternatif `curl` yang lebih enak dibaca'],
          ['`docker compose logs -f`', 'Mengikuti log layanan yang berjalan di container'],
        ],
      ),
    ],
  ),

  written(
    'praktik-telusuri-request',
    'Praktik: Telusuri satu request dari browser sampai server',
    12,
    'Menyatukan seluruh bab menjadi satu penelusuran nyata.',
    [
      p(
        'Latihan penutup bab ini bukan menulis kode, melainkan **melihat**. Kamu akan mengikuti satu permintaan dari awal sampai akhir dan mencatat apa yang benar-benar terjadi di setiap titik — keterampilan yang dipakai setiap kali ada sesuatu yang tidak berjalan.',
      ),

      h2('Persiapan'),
      code(
        'bash',
        `
        mkdir telusur && cd telusur
        npm init -y
        npm install express
        `,
      ),
      code(
        'js',
        `
        // server.js — sengaja dibuat mentah, tanpa struktur apa pun
        const express = require('express');
        const crypto = require('node:crypto');

        const app = express();
        app.use(express.json({ limit: '10kb' }));   // batas ukuran body

        // Middleware pencatat: tampilkan setiap permintaan yang masuk
        app.use((req, res, next) => {
          req.id = crypto.randomUUID().slice(0, 8);
          const mulai = Date.now();

          console.log(\`[\${req.id}] --> \${req.method} \${req.url}\`);
          console.log(\`[\${req.id}]     content-type: \${req.headers['content-type'] ?? '-'}\`);

          res.on('finish', () => {
            console.log(\`[\${req.id}] <-- \${res.statusCode} (\${Date.now() - mulai}ms)\`);
          });

          next();
        });

        const catatan = [{ id: 1, judul: 'Catatan pertama' }];

        app.get('/api/catatan', (req, res) => {
          res.json({ data: catatan, meta: { total: catatan.length } });
        });

        app.get('/api/catatan/:id', (req, res) => {
          const item = catatan.find((c) => c.id === Number(req.params.id));
          if (item === undefined) {
            return res.status(404).json({ error: { pesan: 'Tidak ditemukan' } });
          }
          res.json({ data: item });
        });

        app.post('/api/catatan', (req, res) => {
          const { judul } = req.body ?? {};

          // Validasi di server. Ini yang menentukan, bukan form di browser.
          if (typeof judul !== 'string' || judul.trim() === '') {
            return res.status(422).json({ error: { pesan: 'judul wajib diisi' } });
          }

          const baru = { id: catatan.length + 1, judul: judul.trim() };
          catatan.push(baru);

          res.status(201).location(\`/api/catatan/\${baru.id}\`).json({ data: baru });
        });

        app.listen(3000, () => console.log('Siap di http://localhost:3000'));
        `,
        { filename: 'server.js' },
      ),

      h2('Penelusuran'),
      steps(
        {
          title: '1. Lihat percakapan mentahnya',
          body: 'Jalankan `curl -v http://localhost:3000/api/catatan`. Baris berawalan `>` adalah yang kamu kirim, `<` adalah yang server jawab. Cocokkan dengan bentuk HTTP di sub-bab 1.2 — semuanya ada di sana.',
        },
        {
          title: '2. Bandingkan dengan tab Network',
          body: 'Buka alamat yang sama di browser, lalu lihat tab Network. Kamu akan melihat method, status, dan header yang **persis sama**. Browser tidak melakukan sesuatu yang istimewa — ia hanya klien HTTP biasa.',
        },
        {
          title: '3. Buktikan validasi klien tidak menjaga apa pun',
          body: 'Kirim `curl -X POST .../api/catatan -H "Content-Type: application/json" -d \'{"judul":""}\'`. Server menolak dengan `422` — dan tidak ada satu pun form React yang terlibat. Inilah alasan validasi server tidak bisa ditawar.',
        },
        {
          title: '4. Uji jalur yang tidak bahagia',
          body: 'Kirim JSON rusak (`-d \'{"judul": \'`), lalu ID yang tidak ada (`/api/catatan/999`), lalu body 50 MB. Catat status code masing-masing. Kalau ada yang menjawab `500` untuk kesalahan klien, itu temuan — bukan kesalahan klien, tapi kesalahan penanganan.',
        },
        {
          title: '5. Cocokkan log dengan permintaannya',
          body: 'Setiap baris log punya id 8 karakter. Kirim tiga permintaan berturut-turut dan buktikan kamu bisa memisahkan ketiganya di log — inilah gunanya id korelasi saat suatu hari ada satu permintaan bermasalah di antara ribuan.',
        },
        {
          title: '6. Periksa apa yang sebenarnya lambat',
          body: 'Tambahkan `await new Promise((r) => setTimeout(r, 2000))` di satu handler. Bandingkan angka di log server dengan waktu total di tab Network. Selisihnya adalah jaringan — bukan aplikasimu.',
        },
      ),

      h2('Yang harus bisa kamu jawab setelah ini'),
      ol(
        'Apa isi baris pertama sebuah HTTP request, dan apa isi baris pertama responsnya?',
        'Kenapa `POST` dipakai untuk membuat, dan kenapa `GET` tidak boleh mengubah apa pun?',
        'Apa beda `401` dan `403`, dan kapan `404` justru pilihan yang lebih aman?',
        'Kenapa validasi di browser tidak dihitung sebagai kontrol keamanan?',
        'Di mana password boleh dititipkan pada sebuah permintaan — dan di mana tidak boleh?',
        'Apa yang membuat server disebut stateless, dan apa akibatnya bagi penyimpanan sesi?',
      ),

      divider,

      checklist(
        'bb1-praktik',
        'Checklist praktik bab ini',
        'Jalankan `curl -v` dan cocokkan keluarannya dengan anatomi HTTP di sub-bab 1.2',
        'Bandingkan permintaan dari browser dan dari `curl` — buktikan keduanya identik',
        'Kirim body kosong dan JSON rusak; pastikan jawabannya 4xx, bukan 5xx',
        'Minta sumber daya yang tidak ada; pastikan 404 dengan bentuk error yang konsisten',
        'Kirim body melebihi batas; pastikan server menolak, bukan kehabisan memori',
        'Pastikan tidak ada password atau token yang muncul di keluaran log',
        'Lacak satu permintaan dari awal sampai akhir memakai id korelasinya',
        'Tuliskan lima endpoint REST untuk satu sumber daya pilihanmu, lengkap dengan status code-nya',
      ),
    ],
  ),
];
