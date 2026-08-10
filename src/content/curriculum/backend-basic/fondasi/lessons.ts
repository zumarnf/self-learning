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

      terms(
        {
          term: 'klien (client)',
          meaning:
            'Pihak yang **meminta**. Biasanya browser, tapi juga aplikasi mobile, `curl`, atau server lain. Sifat yang menentukan segalanya: klien sepenuhnya di luar kendalimu, jadi apa pun yang ia kirim tidak boleh dipercaya begitu saja.',
        },
        {
          term: 'server',
          meaning:
            'Pihak yang **menunggu lalu menjawab**. Ia tidak pernah memulai percakapan. Ia menunggu, menjawab, lalu melupakan — dan dari sifat "melupakan" itulah hampir semua keputusan desain backend berasal.',
        },
        {
          term: 'request / response',
          meaning:
            'Sepasang pesan: **permintaan** yang dikirim klien dan **jawaban** yang dikirim server. Satu request selalu menghasilkan tepat satu response. Tidak ada jawaban tanpa permintaan, dan tidak ada permintaan yang dijawab dua kali.',
        },
        {
          term: 'DNS',
          meaning:
            'Singkatan *Domain Name System* — buku telepon internet yang menerjemahkan nama (`contoh.com`) menjadi alamat IP (`93.184.216.34`). Ini langkah **pertama**, dan terjadi sebelum satu byte pun kode aplikasimu berjalan.',
        },
        {
          term: 'TCP',
          meaning:
            'Singkatan *Transmission Control Protocol* — lapisan yang memastikan data sampai lengkap dan berurutan. Membuka koneksi TCP butuh "jabat tangan" bolak-balik, yang memakan waktu. Itu sebabnya koneksi yang dibuka ulang terus-menerus terasa lambat.',
        },
        {
          term: 'TLS',
          meaning:
            'Singkatan *Transport Layer Security* — lapisan yang mengenkripsi lalu lintas, dan yang membuat alamat berawalan `https`. Ia juga butuh jabat tangan sendiri. Tanpanya, siapa pun di jaringan yang sama bisa membaca isi permintaanmu.',
        },
        {
          term: 'stateless',
          meaning:
            'Artinya **tanpa ingatan**. HTTP tidak mengingat apa pun antar permintaan: request kedua tidak tahu apa-apa tentang request pertama, meski datang dari orang sama satu detik kemudian. Ini bukan kekurangan yang harus diakali — ini yang membuat satu server bisa melayani ribuan orang, dan yang membuat jumlah server bisa ditambah tanpa ada yang "kehilangan sesinya".',
        },
        {
          term: 'membawa bukti sendiri',
          meaning:
            'Konsekuensi langsung dari stateless: **setiap** permintaan harus menyertakan identitasnya — cookie sesi atau token di header. Server tidak akan mengingatmu dari permintaan sebelumnya, jadi setiap permintaan berdiri sendiri.',
        },
        {
          term: 'masukan tak tepercaya (untrusted input)',
          meaning:
            'Kalimat terpenting di seluruh kategori Backend: **semua yang datang dari klien adalah masukan tak tepercaya.** Bukan sebagian — semuanya: body, query string, header, cookie, bahkan hal yang "hanya bisa dikirim aplikasi kita sendiri". Siapa pun bisa membuka DevTools, memakai `curl`, atau menulis skrip.',
        },
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
      p(
        'Baris yang benar-benar menentukan di tabel itu adalah **"Bisa dipercaya"** — tiga baris lainnya hanyalah akibatnya. Karena klien berjalan di komputer orang lain, seluruh isinya bisa dibongkar: kode JavaScript-nya bisa dibaca, permintaannya bisa diubah lewat DevTools, dan seluruh aplikasi bisa dilewati dengan satu perintah `curl`. Maka klien tidak bisa menyimpan rahasia (kunci API di dalamnya sama saja dengan menempelkannya di papan pengumuman) dan tidak boleh menentukan siapa boleh apa (menyembunyikan tombol "Hapus" tidak menghalangi siapa pun mengirim `DELETE` sendiri). Server ada di mesin yang kamu kendalikan, jadi hanya di sanalah rahasia dan keputusan kewenangan boleh tinggal.',
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
      references(
        {
          label: 'An overview of HTTP',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
          source: 'MDN Web Docs',
          note: 'Model klien–server dan sifat stateless HTTP, dari dasarnya.',
        },
        {
          label: 'What is a URL?',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL',
          source: 'MDN Web Docs',
          note: 'Perjalanan dari nama domain ke alamat IP lewat DNS.',
        },
        {
          label: 'Transport Layer Security (TLS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security',
          source: 'MDN Web Docs',
          note: 'Lapisan enkripsi yang menjadikan alamat berawalan `https`, beserta jabat tangannya.',
        },
        {
          label: 'RFC 9110 — HTTP Semantics',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          source: 'IETF',
          note: 'Spesifikasi resmi HTTP — sumber kebenaran saat dokumentasi lain berbeda pendapat.',
        },
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

      terms(
        {
          term: 'HTTP',
          meaning:
            'Singkatan *HyperText Transfer Protocol* — aturan percakapan antara klien dan server di web. Yang perlu kamu pegang: **HTTP adalah teks**. Sebuah permintaan hanyalah beberapa baris yang dikirim lewat koneksi, dan itulah kenapa ia bisa dipelajari sampai tuntas.',
        },
        {
          term: 'method',
          meaning:
            'Kata kerja di baris pertama permintaan — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Ia menyatakan **apa yang ingin kamu lakukan**, bukan sekadar formalitas: browser, proxy, dan perayap memperlakukan tiap method dengan cara berbeda.',
        },
        {
          term: 'aman (safe)',
          meaning:
            'Method yang **tidak mengubah apa pun** — hanya membaca. `GET` dan `HEAD` termasuk. Karena itulah browser dan perayap merasa bebas mengambil ulang `GET` kapan saja, termasuk melakukan prefetch tanpa pengguna mengklik apa pun.',
        },
        {
          term: 'idempoten',
          meaning:
            'Dijalankan sekali atau sepuluh kali, **hasil akhirnya sama**. `DELETE /catatan/42` sepuluh kali tetap menghasilkan satu catatan terhapus. Sering dikira sama dengan "aman", padahal berbeda: `DELETE` idempoten tapi jelas tidak aman.',
        },
        {
          term: 'status code',
          meaning:
            'Angka tiga digit yang menyatakan **apa yang terjadi**. Digit pertama menentukan kelasnya: `2xx` berhasil, `3xx` dialihkan, `4xx` **kesalahan klien**, `5xx` **kesalahan server**. Batas antara `4xx` dan `5xx` penting: yang pertama salah pemanggil, yang kedua salah kamu.',
        },
        {
          term: '401 vs 403',
          meaning:
            'Dua kode yang paling sering tertukar. **`401 Unauthorized`** berarti "aku tidak tahu kamu siapa" — belum login atau token tidak sah. **`403 Forbidden`** berarti "aku tahu kamu siapa, dan kamu tidak boleh". Namanya menyesatkan: `401` sebenarnya soal **autentikasi**, bukan otorisasi.',
        },
        {
          term: 'header',
          meaning:
            'Baris `Nama: nilai` yang membawa informasi **tentang** permintaan atau jawaban — format body, kredensial, aturan cache. Ia dipisahkan dari body oleh satu baris kosong. Dan seperti body: **header juga masukan yang tidak tepercaya**.',
        },
        {
          term: 'body',
          meaning:
            'Isi sebenarnya sebuah permintaan atau jawaban, di bawah baris kosong setelah header. Formatnya diumumkan lewat `Content-Type`. `GET` biasanya tidak punya body; `POST` dan `PUT` hampir selalu punya.',
        },
        {
          term: 'X-Forwarded-For',
          meaning:
            'Header berisi IP asli klien di balik proxy. Contoh sempurna kenapa header tidak boleh dipercaya: **siapa pun bisa mengirimnya dengan nilai apa pun.** Ia hanya bisa dipercaya kalau proxy di depanmu benar-benar menimpanya, bukan menambahkannya.',
        },
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
      p(
        'Bacalah contoh itu dari atas ke bawah, karena urutannya bukan kebetulan. **Baris pertama** memuat tiga hal sekaligus: method (`POST`), path yang dituju (`/api/catatan`), dan versi protokol (`HTTP/1.1`). Lima baris berikutnya adalah header, masing-masing dengan tugas yang jelas: `Host` menyebut nama domain yang dituju — wajib ada, karena satu alamat IP lazim melayani puluhan domain sekaligus dan server perlu tahu yang mana; `Content-Type` mengumumkan format body, dan dari baris inilah server memilih parser (tanpa baris ini server tidak menebak, ia menolak); `Authorization` membawa kredensial; `Content-Length` menyebut panjang body dalam byte, sehingga server tahu kapan harus berhenti membaca. Lalu ada **satu baris kosong** — itu bukan hiasan, melainkan pemisah wajib yang menandai "header selesai, mulai dari sini isinya". Baris terakhir adalah body, isi sebenarnya yang ingin disimpan.',
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
      p(
        'Jawabannya berbentuk kembar: baris pertama, header, baris kosong, body. Yang berubah hanya baris pertamanya — alih-alih method dan path, ia berisi versi, angka status, dan nama kodenya (`201 Created`). Angkanya `201` dan bukan `200` karena ada sesuatu yang **baru dibuat**, dan header `Location` menyebutkan di mana benda baru itu sekarang bisa ditemukan. Kombinasi itu menghemat satu putaran permintaan: klien langsung tahu alamat catatan barunya tanpa harus menebak `id` dari body atau memanggil ulang daftar catatan.',
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
      p(
        'Batas antara `4xx` dan `5xx` terlihat sepele, padahal ia yang menentukan siapa yang harus bangun tengah malam. `4xx` berarti **permintaannya yang bermasalah** — pemanggil mengirim data cacat, lupa login, atau meminta sesuatu yang tidak ada; kodemu bekerja dengan benar saat menolaknya. `5xx` berarti **kodemu yang gagal** — permintaannya sah, tapi ada yang meledak di dalam. Karena itu sistem pemantauan hampir selalu memasang alarm pada lonjakan `5xx` dan membiarkan `4xx` lewat: memberi status `500` untuk input yang salah akan membuat alarm berbunyi terus tanpa ada yang perlu diperbaiki, sedangkan memberi `400` untuk bug asli akan menyembunyikan kerusakan sampai ada pengguna yang mengeluh.',
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
      p(
        'Perhatikan kolom "Arah": itu yang paling sering membingungkan di awal. `Accept` dan `Content-Type` sering dikira sama padahal berlawanan arah — `Accept` dikirim klien untuk berkata *"kirimkan padaku dalam bentuk ini"*, sedangkan `Content-Type` menerangkan bentuk isi yang **sedang dibawa** pesan itu sendiri, dan karena itu bisa muncul di permintaan maupun jawaban. Pasangan `Set-Cookie` dan `Cookie` bekerja sama: server mengirim `Set-Cookie` sekali, lalu browser memantulkannya kembali sebagai `Cookie` di **setiap** permintaan berikutnya secara otomatis — sifat "otomatis" itulah yang nanti melahirkan seluruh persoalan CSRF di bab Autentikasi.',
      ),
      callout(
        'warning',
        'Header juga masukan yang tidak tepercaya',
        'Siapa pun bisa mengirim header apa pun dengan nilai apa pun. `X-Forwarded-For` hanya bisa dipercaya kalau proxy di depanmu benar-benar menimpanya, dan `User-Agent` tidak pernah bisa dijadikan dasar keputusan keamanan.',
      ),
      references(
        {
          label: 'HTTP request methods',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
          source: 'MDN Web Docs',
          note: 'Daftar method beserta sifat aman dan idempotennya masing-masing.',
        },
        {
          label: 'HTTP response status codes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
          source: 'MDN Web Docs',
          note: 'Arti setiap kode, termasuk beda `401` dan `403` yang paling sering tertukar.',
        },
        {
          label: 'HTTP headers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers',
          source: 'MDN Web Docs',
          note: 'Rujukan lengkap header permintaan dan jawaban.',
        },
        {
          label: 'RFC 9110 §9 — Methods',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-methods',
          source: 'IETF',
          note: 'Definisi resmi "safe" dan "idempotent" — bukan tafsiran, melainkan spesifikasinya.',
        },
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

      terms(
        {
          term: 'URL',
          meaning:
            'Singkatan *Uniform Resource Locator* — alamat lengkap sebuah sumber daya. Ia terdiri dari beberapa bagian bernama: skema, host, port, path, query string, dan fragment. Mengenali batas tiap bagian penting karena masing-masing punya aturan sendiri.',
        },
        {
          term: 'path param',
          meaning:
            'Bagian **path** yang mengidentifikasi satu sumber daya tertentu — angka `42` pada `/catatan/42`. Aturannya: kalau kamu menunjuk **satu** benda, ia masuk ke path, bukan ke query string.',
        },
        {
          term: 'query string',
          meaning:
            'Bagian setelah `?`, berisi pasangan `nama=nilai` dipisah `&`. Gunanya mengubah **cara** hasil ditampilkan: menyaring, mengurutkan, memaginasi. Yang wajib diingat: isinya tercatat di banyak tempat sekaligus.',
        },
        {
          term: 'fragment (`#`)',
          meaning:
            'Bagian setelah tanda pagar. Satu-satunya bagian URL yang **tidak pernah dikirim ke server** — ia murni dipakai browser untuk menggulung ke bagian tertentu halaman. Server tidak pernah melihatnya.',
        },
        {
          term: 'Referer',
          meaning:
            'Header berisi alamat halaman asal saat pengguna mengeklik tautan keluar — ejaannya memang salah sejak spesifikasi pertama dan tidak pernah diperbaiki. Ia salah satu alasan query string bocor: alamat halamanmu ikut terkirim ke situs lain.',
        },
        {
          term: 'log akses',
          meaning:
            'Catatan setiap permintaan yang ditulis server, proxy, dan CDN — biasanya berisi method, path **beserta query string**, status, dan waktu. Body **tidak** ikut dicatat. Inilah alasan teknis kenapa password harus lewat body, bukan query.',
        },
        {
          term: 'URL encoding',
          meaning:
            'Mengganti karakter yang punya arti khusus (`&`, `=`, `?`, spasi) dengan bentuk `%XX`. Tanpa ini, satu karakter `&` di dalam input pengguna sudah cukup memecah query string jadi parameter tambahan yang tidak kamu duga.',
        },
        {
          term: 'URLSearchParams',
          meaning:
            'API bawaan browser dan Node.js untuk menyusun query string dengan encoding yang benar otomatis. Memakainya bukan soal kerapian — merangkai URL dengan penggabungan string adalah cara paling mudah membuat bug yang hanya muncul pada input tertentu.',
        },
        {
          term: 'batas ukuran body',
          meaning:
            'URL punya batas praktis (~2000 karakter di banyak proxy), tapi **body tidak punya batas alami**. Tanpa batas yang kamu tetapkan sendiri, satu permintaan berisi 500 MB JSON cukup untuk menghabiskan memori server. Ini pertahanan pertama terhadap penyalahgunaan sumber daya.',
        },
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
      p(
        'Enam bagian itu punya pemisah masing-masing, dan mengenali pemisahnya jauh lebih berguna daripada menghafal namanya. **Skema** berakhir di `://`. **Host** berakhir di `:` bila portnya ditulis, atau di `/` bila tidak — `:443` di contoh sebenarnya boleh dihilangkan karena itu memang port bawaan `https`. **Path** membentang dari `/` pertama sampai tanda `?`, dan di dalamnya `42` adalah path param: ia bagian dari alamat, bukan pelengkap. **Query string** dimulai tepat setelah `?`, berisi pasangan `nama=nilai` yang dipisah `&` — di sini ada dua, `urut=baru` dan `hal=2`. **Fragment** dimulai di `#`, dan inilah bagian yang paling sering disalahpahami: browser memotongnya sebelum permintaan dikirim, sehingga server tidak pernah bisa membacanya betapapun kamu mencoba.',
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
      p(
        'Bandingkan baris kedua dan ketiga, karena di situlah letak perbedaan yang paling sering keliru. `?arsip=true` **menyaring daftar** — hasilnya tetap sekumpulan catatan, hanya lebih sedikit; hilangkan query-nya dan kamu masih mendapat daftar yang sah. Sedangkan `/42` **menunjuk satu benda tertentu** — hilangkan `42` dan alamatnya berubah arti sepenuhnya. Uji cepatnya: kalau bagian itu dibuang dan permintaannya masih masuk akal, ia milik query string; kalau dibuang lalu maksudnya hilang, ia milik path. Perhatikan juga baris terakhir: `DELETE` tidak butuh body sama sekali, karena path sudah menyebutkan seluruh yang perlu diketahui server.',
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
      p(
        'Kedua permintaan itu sama-sama mengirim password ke server yang sama lewat koneksi terenkripsi yang sama — TLS melindungi keduanya selama di perjalanan. Yang membedakan adalah **apa yang terjadi setelah paketnya tiba**. Format log akses bawaan server web (dan proxy, dan CDN) mencatat baris permintaan secara utuh: method, path, **beserta query string**. Jadi versi "Berbahaya" menuliskan `password=rahasia123` dalam teks polos ke berkas log, ke sistem agregasi log, dan ke riwayat browser pengguna — semuanya tempat yang jauh lebih longgar penjagaannya daripada database password. Versi "Benar" menaruh nilai yang sama di body, dan body tidak pernah masuk ke log akses standar. Perbedaannya bukan enkripsi, melainkan **jejak yang tertinggal**.',
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
      p(
        'Perhatikan hasil `toString()` di baris ketiga: `cari=react+%26+next`. Dua karakter berubah bentuk di sana. Spasi menjadi `+`, dan `&` menjadi `%26` — persis karena `&` punya arti khusus sebagai **pemisah antar parameter**. Kalau URL itu dirangkai sendiri dengan penggabungan string, server akan membaca `cari=react `, lalu menganggap ` next` sebagai parameter ketiga yang tidak pernah kamu kirim, dan nilai pencarian pengguna diam-diam terpotong. `URLSearchParams` melakukan penyandian itu otomatis untuk setiap nilai, jadi memakainya bukan soal kerapian melainkan soal menghindari bug yang hanya muncul pada input tertentu — jenis bug yang lolos dari semua pengujian manual karena tidak ada yang mengetik tanda `&` saat mencoba.',
      ),
      callout(
        'warning',
        'Batasi ukuran, di ketiga tempat',
        'URL punya batas praktis (~2000 karakter di banyak proxy), tapi body tidak punya batas alami. Tanpa batas ukuran body yang kamu tetapkan sendiri, satu permintaan berisi 500 MB JSON cukup untuk menghabiskan memori server. Ini pertahanan pertama terhadap penyalahgunaan sumber daya.',
      ),
      references(
        {
          label: 'What is a URL?',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL',
          source: 'MDN Web Docs',
          note: 'Setiap bagian URL beserta namanya — termasuk fragment yang tidak pernah dikirim ke server.',
        },
        {
          label: 'URLSearchParams',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
          source: 'MDN Web Docs',
          note: 'Menyusun query string dengan encoding yang benar, tanpa merangkai string sendiri.',
        },
        {
          label: 'Referer header',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer',
          source: 'MDN Web Docs',
          note: 'Salah satu jalur bocornya query string ke pihak lain — termasuk cara membatasinya.',
        },
        {
          label: 'RFC 3986 — URI Generic Syntax',
          href: 'https://www.rfc-editor.org/rfc/rfc3986.html',
          source: 'IETF',
          note: 'Spesifikasi resmi bentuk URL beserta karakter mana yang wajib di-encode.',
        },
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

      terms(
        {
          term: 'REST',
          meaning:
            'Singkatan *Representational State Transfer*. **Bukan protokol dan bukan library** — ia gaya arsitektur. Intinya satu: perlakukan segalanya sebagai sumber daya yang punya alamat, lalu pakai method HTTP untuk menyatakan apa yang ingin kamu lakukan padanya.',
        },
        {
          term: 'resource (sumber daya)',
          meaning:
            'Benda yang punya alamat sendiri — sebuah catatan, seorang pengguna, sebuah pesanan. Ini unit dasar REST. Kalau sesuatu layak punya URL, ia sebuah resource.',
        },
        {
          term: 'kata benda di URL, kata kerja di method',
          meaning:
            'Aturan penamaan REST yang paling sering dilanggar. `/buatCatatan`, `/hapusCatatanById` menaruh kata kerja di URL, sehingga setiap aksi butuh alamat baru. `POST /catatan` dan `DELETE /catatan/42` memisahkannya: **URL menyebut benda, method menyebut aksi**.',
        },
        {
          term: 'CRUD',
          meaning:
            'Singkatan *Create, Read, Update, Delete* — empat operasi dasar atas data, yang memetakan rapi ke `POST`, `GET`, `PUT`/`PATCH`, dan `DELETE`. Tapi tidak semua hal cocok dipaksa jadi CRUD; itu dibahas di bawah.',
        },
        {
          term: 'sub-resource aksi',
          meaning:
            'Jalan keluar untuk aksi yang **bukan** CRUD — "terbitkan artikel", "batalkan pesanan". `POST /artikel/7/terbitkan` lebih jujur daripada memaksa `PATCH` dengan field status. Memaksa semuanya jadi CRUD murni menghasilkan API yang terlihat rapi tapi sulit dipakai.',
        },
        {
          term: 'resource bersarang',
          meaning:
            'Alamat yang menyatakan kepemilikan: `/catatan/42/komentar` berarti komentar **milik** catatan 42. Batas praktisnya **dua tingkat** — `/a/1/b/2/c/3` sudah lebih baik dipecah jadi endpoint sendiri.',
        },
        {
          term: 'statelessness',
          meaning:
            'Server REST tidak menyimpan konteks percakapan. Setiap permintaan harus **lengkap sendiri** — membawa identitas, filternya, dan halamannya. Keuntungannya nyata: server bisa ditambah jumlahnya sesuka hati, karena tidak ada permintaan yang "harus" mendarat di mesin yang sama.',
        },
        {
          term: 'versi API',
          meaning:
            'Menandai kontrak API dengan nomor, biasanya di path: `/api/v1/catatan`. Diperlukan karena **klien mobile tidak bisa dipaksa memperbarui dirinya** — versi lama akan terus memanggilmu berbulan-bulan setelah kamu merasa sudah pindah.',
        },
        {
          term: 'breaking change',
          meaning:
            'Perubahan yang merusak klien yang sudah berjalan: menghapus field, mengganti namanya, mengubah tipenya, atau menambah aturan validasi baru. Aturan praktisnya: **menambah field opsional aman; hampir semua perubahan lain tidak.**',
        },
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
      p(
        'Kolom kiri sebenarnya **berfungsi** — API seperti itu jalan dan banyak dipakai. Ongkosnya muncul belakangan. Karena semuanya `POST`, tidak ada satu pun yang boleh di-cache: browser dan CDN tidak punya cara mengetahui bahwa `/ambilSemuaCatatan` hanya membaca, jadi setiap pemanggilan menempuh perjalanan penuh sampai ke database. Retry juga jadi menakutkan: kalau koneksi putus di tengah `POST /hapusCatatanById`, tidak ada yang tahu apakah aman mengulanginya. Kolom kanan memindahkan informasi itu ke tempat yang **sudah dimengerti seluruh infrastruktur web**: `GET` menyatakan "hanya membaca, silakan cache", `DELETE` menyatakan "diulang sepuluh kali hasilnya tetap satu". Perhatikan baris terakhirnya — "arsipkan" bukan operasi CRUD, jadi ia tetap boleh punya alamat sendiri sebagai `POST /catatan/42/arsip`; yang dihindari REST adalah kata kerja yang **menggantikan** method, bukan kata kerja yang menamai aksi yang memang tidak punya padanan.',
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
      p(
        'Enam baris pertama adalah pola yang sama persis untuk **setiap** resource di API mana pun: ganti `catatan` dengan `pengguna` atau `pesanan`, dan seorang pemakai baru sudah bisa menebak alamatnya tanpa membuka dokumentasi. Yang membedakan `PUT` dari `PATCH` di baris keempat dan kelima adalah cakupannya: `PUT` mengirim **seluruh** bentuk catatan dan menggantinya bulat-bulat — field yang tidak kamu sertakan akan hilang; `PATCH` hanya mengirim bagian yang berubah. Dua baris terakhir menunjukkan penyarangan, dan tanda `/42` di tengah itulah yang menyatakan kepemilikan: komentar di sana tidak berdiri sendiri, ia milik catatan 42, sehingga meminta komentar tanpa menyebut catatannya tidak punya arti.',
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
      p(
        'Dua baris itu terlihat seperti pengganti berurutan, padahal maksudnya justru sebaliknya: keduanya **hidup berdampingan di server yang sama, pada waktu yang sama**. Saat kamu mengubah bentuk jawaban secara mendasar, `v1` dibiarkan berjalan apa adanya untuk klien yang sudah terpasang, dan `v2` melayani klien yang sudah diperbarui. Ini bukan kerapian administratif — aplikasi mobile di ponsel pengguna hanya berganti versi kalau pemiliknya memperbarui sendiri lewat toko aplikasi, dan sebagian orang tidak pernah melakukannya. Menghapus `v1` terlalu cepat berarti merusak aplikasi yang masih terpasang di ribuan ponsel, tanpa satu pun cara untuk memperbaikinya dari sisimu.',
      ),
      callout(
        'warning',
        'Perubahan yang memutus klien lama butuh versi baru',
        'Menghapus field, mengganti namanya, mengubah tipenya, atau menambah aturan validasi baru — semuanya bisa merusak klien yang sudah berjalan. Klien mobile tidak bisa dipaksa memperbarui dirinya. Menambah field opsional aman; hampir semua perubahan lain tidak.',
      ),
      references(
        {
          label: 'RFC 9110 — HTTP Semantics',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          source: 'IETF',
          note: 'Dasar semantik yang membuat pemetaan method ke operasi CRUD masuk akal.',
        },
        {
          label: 'HTTP request methods',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
          source: 'MDN Web Docs',
          note: 'Kata kerja yang dipakai REST, beserta sifat aman dan idempotennya.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Sisi keamanan perancangan REST — otorisasi per resource, validasi, dan pesan error.',
        },
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'IETF',
          note: 'Format baku badan error API, supaya klien tidak perlu menebak bentuknya.',
        },
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

      terms(
        {
          term: 'JSON',
          meaning:
            'Singkatan *JavaScript Object Notation*, dibaca "jeisen". Format teks untuk bertukar data yang menjadi standar karena sederhana, terbaca manusia, dan didukung setiap bahasa. Tapi kesederhanaannya juga berarti ada hal yang **tidak bisa** ia nyatakan — dan di situlah bug muncul.',
        },
        {
          term: 'ISO 8601',
          meaning:
            'Standar penulisan tanggal dan waktu: `"2026-08-02T10:30:00Z"`. JSON **tidak punya** tipe tanggal, jadi tanggal selalu dikirim sebagai string — dan format inilah yang dipakai supaya urutannya benar saat diurutkan sebagai teks. Huruf `Z` berarti UTC.',
        },
        {
          term: '2^53',
          meaning:
            'Batas angka bulat yang masih bisa disimpan JavaScript dengan tepat — 9.007.199.254.740.992. Di atas itu, angka **berubah diam-diam** saat di-parse. Karena itu ID besar dari database dikirim sebagai string, bukan angka.',
        },
        {
          term: 'floating point',
          meaning:
            'Cara komputer menyimpan bilangan desimal, dan alasan `0.1 + 0.2` menghasilkan `0.30000000000000004`. Konsekuensinya untuk backend: **uang jangan disimpan sebagai desimal** — pakai integer dalam satuan terkecil (rupiah, sen).',
        },
        {
          term: 'base64',
          meaning:
            'Cara mengubah data biner (gambar, berkas) menjadi teks supaya muat di JSON. Harganya: ukurannya membengkak sekitar 33%. Untuk berkas besar, unggah terpisah hampir selalu lebih baik.',
        },
        {
          term: 'JSON.parse',
          meaning:
            'Mengubah teks JSON menjadi objek. Ia **melempar error** untuk input rusak, jadi wajib dibungkus `try/catch` — kalau tidak, satu body cacat dari klien cukup menjatuhkan penanganan permintaanmu.',
        },
        {
          term: 'parse ≠ valid',
          meaning:
            'Jebakan yang paling sering. `JSON.parse` hanya memastikan **bentuknya** sah. `{"jumlah": "banyak sekali"}` lolos parse dengan mulus, dan `{"peran": "admin"}` juga. Setelah parse, isinya **tetap** harus divalidasi dengan skema.',
        },
        {
          term: 'array telanjang',
          meaning:
            'Membalas daftar sebagai array langsung di tingkat atas (`[...]`) alih-alih membungkusnya (`{ "data": [...], "meta": {...} }`). Masalahnya muncul belakangan: begitu klien mengharapkan array, menambahkan metadata paginasi menjadi perubahan yang memutus mereka.',
        },
        {
          term: 'bentuk error yang konsisten',
          meaning:
            'Satu bentuk badan error untuk **semua** kegagalan, misalnya `{ "error": { "kode", "pesan", "field" } }`. Nilainya bagi klien: ia bisa menulis satu penangan error, bukan satu per endpoint.',
        },
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
      references(
        {
          label: 'JSON',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
          source: 'MDN Web Docs',
          note: 'Tipe yang tersedia beserta perilaku `parse` dan `stringify`.',
        },
        {
          label: 'Number.MAX_SAFE_INTEGER',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER',
          source: 'MDN Web Docs',
          note: 'Batas 2^53 yang membuat ID besar rusak diam-diam saat di-parse.',
        },
        {
          label: 'RFC 8259 — The JSON Data Interchange Format',
          href: 'https://www.rfc-editor.org/rfc/rfc8259.html',
          source: 'IETF',
          note: 'Spesifikasi resmi — termasuk penegasan bahwa JSON tidak punya tipe tanggal maupun komentar.',
        },
        {
          label: 'RFC 9457 — Problem Details for HTTP APIs',
          href: 'https://www.rfc-editor.org/rfc/rfc9457.html',
          source: 'IETF',
          note: 'Bentuk baku badan error, alternatif dari membuat formatmu sendiri.',
        },
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

      terms(
        {
          term: 'monolith',
          meaning:
            'Dibaca "monolit", artinya **satu bongkah**. Semua kode dalam satu project, di-deploy sekaligus. Ini **default yang benar** untuk hampir semua project — termasuk yang berencana besar.',
        },
        {
          term: 'microservice',
          meaning:
            'Memecah aplikasi menjadi banyak layanan kecil yang di-deploy sendiri-sendiri. Ia menukar kompleksitas **kode** dengan kompleksitas **operasional**: penemuan layanan, pemantauan terdistribusi, kegagalan sebagian, transaksi lintas layanan. Semua itu biaya sejak hari pertama, sementara manfaatnya baru terasa pada skala yang mungkin tidak pernah kamu capai.',
        },
        {
          term: 'layered architecture',
          meaning:
            'Memisahkan kode berdasarkan **tanggung jawab**, bukan berdasarkan fitur: route → controller → service → repository → database. Nilainya bukan kerapian, melainkan aturan siapa boleh tahu apa.',
        },
        {
          term: 'controller',
          meaning:
            'Lapisan yang berurusan dengan **HTTP**: membaca input, memanggil service, menyusun respons beserta status code-nya. Ia boleh tahu soal status dan header — tapi tidak boleh tahu apa pun soal SQL atau struktur tabel.',
        },
        {
          term: 'service',
          meaning:
            'Lapisan **aturan bisnis** — bagian yang benar-benar milikmu dan yang tidak bisa disalin dari framework mana pun. Aturan terpentingnya: service **tidak boleh tahu HTTP maupun SQL**. Ini baris yang paling sering dilanggar.',
        },
        {
          term: 'repository',
          meaning:
            'Lapisan akses data — **satu-satunya** yang tahu soal SQL dan bentuk tabel. Gunanya: mengganti database atau mengubah query tidak menyentuh aturan bisnis sama sekali.',
        },
        {
          term: 'MVC',
          meaning:
            'Singkatan *Model–View–Controller*. **Model** memegang data dan aturan yang melekat padanya, **View** menentukan tampilan (pada API: bentuk JSON-nya), **Controller** mengatur alur. Laravel memakainya eksplisit; Express tidak memaksakan apa pun.',
        },
        {
          term: 'kebocoran lapisan',
          meaning:
            'Ketika sebuah lapisan menyentuh urusan lapisan lain. Contoh paling sering: service yang mengembalikan `res.status(404)`. Begitu ia tercampur HTTP, ia langsung **mustahil dipakai ulang** dari perintah CLI, job terjadwal, atau tes.',
        },
        {
          term: 'uji penghapusan (deletion test)',
          meaning:
            'Cara memutuskan apakah sebuah lapisan layak ada: *kalau lapisan ini dihapus, apakah kerumitannya hilang, atau justru pindah ke pemanggilnya?* Kalau hilang, ia memang tidak menanggung apa pun. Lapisan yang layak ada adalah yang **menyerap** kerumitan, bukan yang meneruskannya.',
        },
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
      references(
        {
          label: 'Express — Writing middleware & app structure',
          href: 'https://expressjs.com/en/guide/writing-middleware.html',
          source: 'Express',
          note: 'Express tidak memaksakan struktur, jadi lapisan di atas kamu bangun sendiri.',
        },
        {
          label: 'Laravel — Architecture Concepts',
          href: 'https://laravel.com/docs/12.x/lifecycle',
          source: 'Laravel',
          note: 'Contoh MVC yang ditegakkan framework, kebalikan dari pendekatan Express.',
        },
        {
          label: 'Node.js — Modules: CommonJS & ECMAScript',
          href: 'https://nodejs.org/api/esm.html',
          source: 'Node.js',
          note: 'Mekanisme modul yang menjadi batas fisik antar lapisan di project Node.',
        },
        {
          label: 'Twelve-Factor App — Codebase',
          href: 'https://12factor.net/codebase',
          source: '12factor.net',
          note: 'Prinsip satu codebase, banyak deploy — dasar argumen "mulai dari monolith".',
        },
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

      terms(
        {
          term: '12-Factor App',
          meaning:
            'Kumpulan dua belas prinsip untuk membangun aplikasi yang mudah di-deploy dan diskalakan. Kamu tidak perlu menghafal semuanya — yang benar-benar menentukan sekarang ada tiga: **config di environment**, **proses stateless**, dan **log ke stdout**.',
        },
        {
          term: 'environment variable',
          meaning:
            'Nilai konfigurasi yang datang dari **luar kode**. Prinsipnya: kode yang sama harus bisa berjalan di laptopmu, di server uji, dan di produksi tanpa satu baris pun diubah — yang berbeda hanya konfigurasinya.',
        },
        {
          term: '.env vs .env.example',
          meaning:
            '`.env` berisi nilai sungguhan dan **wajib** masuk `.gitignore`. `.env.example` yang di-commit, berisi daftar nama variabel dengan nilai **kosong**. Menulis nilai asli di `.env.example` "sebagai contoh" adalah salah satu cara paling umum rahasia masuk ke git.',
        },
        {
          term: 'baca sekali saat boot',
          meaning:
            'Mengumpulkan seluruh `process.env` di satu tempat saat aplikasi menyala, bukan menyebar pemanggilannya di lima berkas. Bedanya: salah ketik nama variabel akan tertangkap **saat start**, bukan meledak saat pengguna pertama datang.',
        },
        {
          term: 'z.coerce',
          meaning:
            'Bentuk Zod yang **mengubah tipe sebelum memvalidasi**. Diperlukan di sini karena semua environment variable adalah **string** — `PORT=3000` bernilai `"3000"`, bukan `3000`. Tanpa coerce, validasi angka akan selalu gagal.',
        },
        {
          term: 'default yang aman',
          meaning:
            "Ketiadaan nilai harus berarti pilihan **paling ketat**, bukan paling permisif. `process.env.CORS_ALL !== 'false'` membuka semuanya kalau variabelnya lupa dipasang; `=== 'true'` menutupnya. Satu perbedaan operator, dua akibat yang berlawanan.",
        },
        {
          term: 'proses stateless',
          meaning:
            'Aplikasi tidak menyimpan apa pun di memorinya sendiri antar permintaan. Menyimpan sesi di memori proses bekerja sempurna **sampai kamu menjalankan proses kedua** — setelah itu pengguna tampak "logout sendiri" secara acak, tergantung mesin mana yang menerima permintaannya.',
        },
        {
          term: 'log ke stdout',
          meaning:
            'Menulis log ke keluaran standar, bukan mengelola berkas log sendiri. Alasannya operasional: rotasi, pengumpulan, dan pengiriman log adalah urusan lingkungan — aplikasi yang mengurusnya sendiri akan bentrok dengan alat yang sudah ada di sana.',
        },
        {
          term: 'dev/prod parity',
          meaning:
            'Menjaga lingkungan pengembangan sedekat mungkin dengan produksi — versi database yang sama, sistem operasi yang mirip. Setiap perbedaan adalah tempat bug bisa bersembunyi sampai rilis.',
        },
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
      references(
        {
          label: 'The Twelve-Factor App — Config',
          href: 'https://12factor.net/config',
          source: '12factor.net',
          note: 'Sumber primer prinsip "konfigurasi di environment, tidak pernah di kode".',
        },
        {
          label: 'Twelve-Factor — Processes & Logs',
          href: 'https://12factor.net/processes',
          source: '12factor.net',
          note: 'Kenapa proses harus stateless, dan kenapa log ditulis ke stdout.',
        },
        {
          label: 'process.env',
          href: 'https://nodejs.org/api/process.html#processenv',
          source: 'Node.js',
          note: 'Termasuk penegasan bahwa setiap nilainya adalah string — dasar kebutuhan `z.coerce`.',
        },
        {
          label: 'Secrets Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Aturan menyimpan dan merotasi rahasia, termasuk larangan menaruhnya di repo.',
        },
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

      terms(
        {
          term: 'curl',
          meaning:
            'Perintah terminal untuk mengirim permintaan HTTP. Kelebihannya bukan fiturnya melainkan sifatnya: ia **bisa disalin ke mana pun** — ke isu, pesan tim, skrip CI, dokumentasi. Tidak butuh dipasang, tidak butuh akun, dan tidak menyembunyikan apa pun.',
        },
        {
          term: '-X / -H / -d',
          meaning:
            'Tiga flag `curl` yang paling sering dipakai. **`-X`** menentukan method (`-X POST`), **`-H`** menambah header (`-H "Content-Type: application/json"`), **`-d`** mengirim body. Menyebut `-d` saja sudah otomatis membuat permintaannya `POST`.',
        },
        {
          term: '-i / -I / -v',
          meaning:
            'Tiga tingkat kedetailan. **`-i`** menampilkan header **beserta** body, **`-I`** hanya header (dan mengirim `HEAD`), **`-v`** menampilkan seluruh percakapan termasuk header yang **dikirim** — yang terakhir ini paling berguna saat menelusuri masalah.',
        },
        {
          term: 'jalur gagal (unhappy path)',
          meaning:
            'Skenario yang bukan sukses: JSON rusak, tanpa token, data milik orang lain, body raksasa. Empat perintah menguji ini menemukan lebih banyak bug daripada dua puluh pengujian jalur sukses — karena jalur sukses adalah bagian yang paling jarang gagal di produksi.',
        },
        {
          term: '413',
          meaning:
            'Status `Content Too Large`. Jawaban yang **benar** untuk body yang melebihi batas. Kalau servermu justru mati atau kehabisan memori, itu tandanya batas ukuran body belum dipasang.',
        },
        {
          term: 'log terstruktur',
          meaning:
            'Log yang ditulis sebagai JSON dengan field bernama, bukan kalimat bebas. Bedanya praktis: log terstruktur bisa **dicari dan disaring** (`status: 500`, `userId: u_42`), sementara kalimat bebas hanya bisa dibaca satu per satu.',
        },
        {
          term: 'lima isi log yang berguna',
          meaning:
            'Setiap baris log yang layak ditulis menjawab: **kapan**, **siapa**, **apa yang diminta**, **apa hasilnya**, dan **id korelasinya**. Kurang dari itu, log jadi arsip yang tidak bisa dipakai menelusuri apa pun.',
        },
        {
          term: 'id korelasi (correlation id)',
          meaning:
            'Satu id acak per permintaan yang muncul di **semua** baris log yang berasal darinya, dan dikembalikan ke klien lewat header. Saat pengguna melapor "tadi error", satu id membuatmu menemukan **persis** permintaan itu di antara jutaan baris — bukan menebak dari perkiraan waktu.',
        },
        {
          term: 'yang tidak boleh masuk log',
          meaning:
            'Password, token, isi `Authorization`, nomor kartu, dan data pribadi mentah. "Log seluruh request body supaya gampang debug" adalah cara paling umum kredensial berakhir di sistem pencatatan yang diakses banyak orang dan disimpan bertahun-tahun.',
        },
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
      references(
        {
          label: 'HTTP headers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers',
          source: 'MDN Web Docs',
          note: 'Header yang akan kamu lihat di keluaran `curl -v`, satu per satu.',
        },
        {
          label: '413 Content Too Large',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/413',
          source: 'MDN Web Docs',
          note: 'Jawaban yang benar untuk body melebihi batas — bukan server yang mati.',
        },
        {
          label: 'crypto.randomUUID()',
          href: 'https://nodejs.org/api/crypto.html#cryptorandomuuidoptions',
          source: 'Node.js',
          note: 'Menghasilkan id korelasi yang aman dipakai per permintaan.',
        },
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Apa yang wajib dicatat, dan daftar tegas apa yang tidak boleh masuk log.',
        },
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

      terms(
        {
          term: 'penelusuran (tracing)',
          meaning:
            'Mengikuti satu permintaan dari awal sampai akhir dan mencatat apa yang benar-benar terjadi di tiap titik. Latihan ini bukan menulis kode melainkan **melihat** — keterampilan yang dipakai setiap kali ada sesuatu yang tidak berjalan.',
        },
        {
          term: 'tab Network',
          meaning:
            'Panel DevTools yang menampilkan setiap permintaan yang dikirim browser beserta header, body, status, dan waktunya. Yang akan kamu buktikan di langkah 2: isinya **persis sama** dengan keluaran `curl` — browser hanyalah klien HTTP biasa.',
        },
        {
          term: 'middleware pencatat',
          meaning:
            'Fungsi yang dijalankan untuk **setiap** permintaan sebelum handler-nya, dipakai di sini untuk mencetak apa yang masuk dan apa yang keluar. Ia dibahas tuntas di Bab 3; di sini ia sekadar alat untuk melihat.',
        },
        {
          term: "res.on('finish')",
          meaning:
            'Event yang menyala setelah jawaban **selesai dikirim**. Dipakai untuk mencatat status akhir dan durasinya — informasi yang belum tersedia saat permintaan baru masuk.',
        },
        {
          term: "limit: '10kb'",
          meaning:
            'Batas ukuran body yang diterima `express.json()`. Tanpa ini, satu permintaan berisi 50 MB JSON cukup menghabiskan memori server. Salah satu langkah latihan ini adalah membuktikannya sendiri.',
        },
        {
          term: '422 Unprocessable Content',
          meaning:
            'Jawaban untuk body yang **bentuknya benar tapi isinya tidak lolos validasi** — misalnya `{"judul":""}`. Bedanya dengan `400`: `400` untuk yang bahkan tidak bisa di-parse, `422` untuk yang bisa dibaca tapi ditolak aturan.',
        },
        {
          term: 'header Location',
          meaning:
            'Header jawaban berisi alamat sumber daya yang baru dibuat, dipasangkan dengan status `201 Created`. Gunanya: klien tahu ke mana harus pergi untuk melihat hasil buatannya, tanpa menebak dari bentuk URL.',
        },
        {
          term: '4xx vs 5xx pada latihan ini',
          meaning:
            'Kriteria temuan di langkah 4: kalau kesalahan **klien** dijawab `500`, itu bukan kesalahan klien melainkan **kesalahan penanganan di kodemu**. Server yang menyalahkan dirinya sendiri untuk input yang buruk menyembunyikan bug yang sebenarnya.',
        },
        {
          term: 'server vs jaringan',
          meaning:
            'Cara memisahkan keduanya di langkah 6: bandingkan durasi yang dicatat **log server** dengan waktu total di **tab Network**. Selisihnya adalah jaringan. Ini yang membedakan "aplikasinya lambat" dari "koneksinya lambat".',
        },
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

      references(
        {
          label: 'An overview of HTTP',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview',
          source: 'MDN Web Docs',
          note: 'Cocokkan keluaran `curl -v` di langkah 1 dengan anatomi HTTP di sini.',
        },
        {
          label: 'Network Monitor / Network panel',
          href: 'https://developer.chrome.com/docs/devtools/network',
          source: 'Chrome DevTools',
          note: 'Alat untuk langkah 2 dan 6 — membandingkan permintaan browser dengan `curl`.',
        },
        {
          label: 'express.json()',
          href: 'https://expressjs.com/en/api.html#express.json',
          source: 'Express',
          note: 'Opsi `limit` yang membuat body raksasa ditolak, bukan dimakan memori.',
        },
        {
          label: '422 Unprocessable Content',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/422',
          source: 'MDN Web Docs',
          note: 'Beda `400` dan `422` — bentuk rusak versus isi yang ditolak aturan.',
        },
      ),
    ],
  ),
];
