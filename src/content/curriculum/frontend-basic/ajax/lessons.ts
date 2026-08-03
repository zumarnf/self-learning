import {
  callout,
  checklist,
  code,
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

/** Frontend Basic — Chapter 5, all twelve lessons. Every sample was executed before writing. */
export const lessons: LessonDraft[] = [
  written(
    'apa-itu-ajax',
    'Apa itu AJAX & dari `XMLHttpRequest` ke `fetch`',
    9,
    'Kenapa halaman web bisa memperbarui sebagian isinya tanpa memuat ulang.',
    [
      p(
        'Sebelum 2005, setiap interaksi berarti memuat ulang seluruh halaman. Menekan "Simpan" mengirim form, server membalas dokumen HTML baru, dan browser menggambar ulang semuanya — layar berkedip putih, posisi scroll hilang, isi form lain lenyap.',
      ),
      p(
        '**AJAX** (Asynchronous JavaScript And XML) mengubah itu: JavaScript mengirim permintaan di latar belakang, menerima data, lalu memperbarui **bagian** halaman yang perlu saja. Namanya menyebut XML karena format itu yang populer saat itu; hari ini hampir semuanya JSON, tapi namanya terlanjur melekat.',
      ),

      terms(
        {
          term: 'AJAX',
          meaning:
            'Singkatan *Asynchronous JavaScript And XML*, dibaca "a-jaks". Teknik mengirim permintaan ke server **di latar belakang** lalu memperbarui hanya **bagian** halaman yang perlu, tanpa memuat ulang seluruhnya. Catatan sejarah yang penting: huruf X-nya menyebut XML karena format itu yang populer pada 2005; hari ini hampir semuanya JSON, tapi namanya sudah terlanjur melekat.',
        },
        {
          term: 'XMLHttpRequest',
          meaning:
            'Sering disingkat **XHR**. Objek generasi pertama untuk mengirim permintaan dari JavaScript. Berbasis callback, penanganan errornya tersebar di beberapa property (`onload`, `onerror`), dan tidak bisa dirangkai. Kamu tidak perlu menulisnya lagi, tapi perlu bisa mengenalinya di kode lama.',
        },
        {
          term: 'fetch',
          meaning:
            'Artinya **mengambil**. Pengganti modern `XMLHttpRequest` yang mengembalikan **Promise**, sehingga bisa dipakai dengan `await` dan `try`/`catch` biasa. Satu perilakunya wajib dihafal sejak sekarang: **`fetch` tidak menolak untuk status 404 atau 500** — bagi dia, jawaban "tidak ditemukan" tetap permintaan yang berhasil sampai tujuan.',
        },
        {
          term: 'request',
          meaning:
            'Terjemahannya **permintaan**. Pesan yang dikirim browser ke server, berisi method, alamat, header, dan kadang badan pesan.',
        },
        {
          term: 'response',
          meaning:
            'Terjemahannya **jawaban** atau respons. Pesan balasan dari server, berisi status, header, dan badan pesan. Perlu diingat: objek respons **belum berisi datanya** — datanya baru keluar setelah `await res.json()`.',
        },
        {
          term: 'JSON',
          meaning:
            'Singkatan *JavaScript Object Notation*, dibaca "je-son". Format teks untuk bertukar data yang bentuknya menyerupai object literal JavaScript. Format baku hampir semua API hari ini, menggantikan XML yang jauh lebih bertele-tele.',
        },
        {
          term: 'XML',
          meaning:
            'Singkatan *eXtensible Markup Language*. Format bertukar data berbasis tag seperti HTML. Masih dipakai di beberapa sistem lama dan RSS, tapi untuk API baru hampir selalu kalah dari JSON karena jauh lebih panjang untuk data yang sama.',
        },
        {
          term: 'SPA',
          meaning:
            'Singkatan *Single Page Application*, terjemahannya **aplikasi satu halaman**. Aplikasi yang memuat satu dokumen HTML lalu mengganti isinya dari JavaScript, alih-alih berpindah halaman. AJAX adalah teknik yang memungkinkannya — tanpa AJAX, SPA tidak punya cara mengambil data baru.',
        },
        {
          term: 'endpoint',
          meaning:
            'Terjemahannya **titik ujung**. Satu alamat di server yang melayani permintaan tertentu, misalnya `/api/pengguna`. Kamu akan merancang endpoint sendiri nanti di kategori Backend; di bab ini kamu berlatih memakainya.',
        },
      ),

      h2('Yang berubah bagi pengguna'),
      table(
        ['', 'Tanpa AJAX', 'Dengan AJAX'],
        [
          ['Menyimpan form', 'Seluruh halaman dimuat ulang', 'Hanya pesan status yang berubah'],
          ['Mencari', 'Pindah halaman hasil', 'Hasil muncul sambil mengetik'],
          ['Posisi scroll', 'Kembali ke atas', 'Tetap'],
          ['Isi form lain', 'Hilang', 'Tetap'],
        ],
      ),

      h2('`XMLHttpRequest` — cara lama'),
      code(
        'js',
        `
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/data');

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            tampilkan(data);
          } else {
            tampilkanError(xhr.status);
          }
        };

        xhr.onerror = function () { tampilkanError('jaringan'); };
        xhr.send();
        `,
        { caption: 'Berbasis callback, penanganan error tersebar, dan tidak bisa dirangkai.' },
      ),

      h2('`fetch` — cara sekarang'),
      code(
        'js',
        `
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error(\`Server balas \${res.status}\`);
        const data = await res.json();
        `,
      ),
      table(
        ['', '`XMLHttpRequest`', '`fetch`'],
        [
          ['Berbasis', 'Callback', 'Promise'],
          ['Bisa dirangkai', 'Tidak', 'Ya'],
          ['Bisa dibatalkan', 'Ya (`abort()`)', 'Ya (`AbortController`)'],
          ['Progres unggah', '**Ya**', 'Tidak langsung'],
          ['Streaming respons', 'Terbatas', '**Ya**'],
          ['Menolak untuk 404/500', 'Tidak', 'Tidak'],
        ],
      ),
      callout(
        'info',
        'Satu hal yang masih dipegang `XMLHttpRequest`',
        'Progres unggah (`upload.onprogress`). `fetch` belum punya padanan yang sederhana untuk itu, jadi pustaka unggahan berkas besar kadang masih memakainya. Untuk semua kebutuhan lain, `fetch`.',
      ),

      h2('Kenapa masih perlu tahu keduanya'),
      p(
        'Kamu akan bertemu `XMLHttpRequest` di kode lama, di pustaka yang belum diperbarui, dan di jawaban Stack Overflow berumur sepuluh tahun. Mengenalinya membuatmu bisa membacanya — dan tahu bahwa ia bisa diganti.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'AJAX = memperbarui sebagian halaman tanpa memuat ulang seluruhnya.',
        'Namanya menyebut XML karena sejarah; isinya hampir selalu JSON sekarang.',
        '`fetch` berbasis Promise, bisa dirangkai, dan mendukung streaming.',
        '`XMLHttpRequest` masih unggul untuk progres unggah.',
        'Keduanya sama-sama **tidak** menolak untuk status 404 atau 500.',
      ),
      references(
        {
          label: 'Using the Fetch API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
          source: 'MDN',
          note: 'Pengganti resmi `XMLHttpRequest`, lengkap dengan catatan bahwa ia tidak menolak untuk 404.',
        },
        {
          label: 'XMLHttpRequest',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest',
          source: 'MDN',
          note: 'Dibaca bukan untuk dipakai lagi, melainkan agar kamu mengenalinya di kode lama.',
        },
        {
          label: 'AJAX',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/AJAX',
          source: 'MDN',
          note: 'Definisi ringkas beserta catatan kenapa huruf X-nya sudah tidak relevan lagi.',
        },
        {
          label: 'JSON',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
          source: 'MDN',
          note: 'Format baku yang menggantikan XML, beserta `parse` dan `stringify`.',
        },
        {
          label: 'ProgressEvent',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent',
          source: 'MDN',
          note: 'Alasan `XMLHttpRequest` masih unggul untuk menampilkan progres unggahan.',
        },
      ),
    ],
  ),

  written(
    'http-dasar',
    'HTTP Dasar: method, status code, header',
    13,
    'Bahasa yang dipakai browser dan server untuk berbicara — dan yang akan kamu pakai lagi di seluruh kategori Backend.',
    [
      p(
        'Setiap permintaan HTTP punya bentuk yang sama: **method**, **URL**, **header**, dan kadang **body**. Setiap respons punya **status code**, **header**, dan **body**. Menguasai empat bagian ini membuat sisi frontend dan backend terasa seperti satu bahasa.',
      ),

      terms(
        {
          term: 'HTTP',
          meaning:
            'Singkatan *HyperText Transfer Protocol*, terjemahannya **protokol pengiriman hiperteks**. Aturan baku yang dipakai browser dan server untuk saling berbicara. Menguasainya membuat sisi frontend dan backend terasa seperti satu bahasa — dan seluruh kategori Backend nanti berdiri di atas bab ini.',
        },
        {
          term: 'method',
          meaning:
            'Terjemahannya **kata kerja permintaan**. Kata di awal permintaan yang menyatakan **maksudmu**: `GET` untuk membaca, `POST` untuk membuat, `PUT` untuk mengganti, `DELETE` untuk menghapus. Bukan sekadar formalitas — perantara jaringan dan cache memperlakukan tiap method secara berbeda berdasarkan sifatnya.',
        },
        {
          term: 'aman (safe)',
          meaning:
            'Sifat method yang **tidak mengubah apa pun** di server. Hanya `GET` dan `HEAD` yang aman. Konsekuensi praktisnya penting: tautan dan tombol yang mengubah data **tidak boleh** memakai `GET`, karena browser dan perayap web bebas memanggilnya kapan saja tanpa diminta.',
        },
        {
          term: 'idempoten',
          meaning:
            'Dibaca "i-dem-po-ten". Sifat operasi yang **hasil akhirnya sama meski dijalankan berkali-kali**. `DELETE` idempoten — menghapus dua kali tetap menghasilkan "tidak ada". `POST` tidak — mengirim dua kali menghasilkan dua data. Ini yang menentukan boleh-tidaknya sebuah permintaan diulang otomatis saat gagal.',
        },
        {
          term: 'status code',
          meaning:
            'Terjemahannya **kode status**. Angka tiga digit di jawaban server yang menyatakan hasilnya. Digit pertamanya sudah memberi tahu banyak: **2xx** berhasil, **3xx** dialihkan, **4xx** kesalahan dari pihak klien, **5xx** kesalahan dari pihak server. Membedakan 4xx dan 5xx menentukan apakah kamu perlu memperbaiki permintaanmu atau menunggu server pulih.',
        },
        {
          term: 'header',
          meaning:
            'Terjemahannya **kepala pesan**. Pasangan nama–nilai yang membawa keterangan **tentang** permintaan atau jawaban, bukan isinya — misalnya `Content-Type` yang menyatakan format badan pesan, atau `Authorization` yang membawa identitas.',
        },
        {
          term: 'body',
          meaning:
            'Terjemahannya **badan pesan**. Isi sebenarnya yang dikirim, biasanya JSON. `GET` dan `DELETE` umumnya tidak punya body — datanya dititipkan di URL sebagai query string.',
        },
        {
          term: 'Content-Type',
          meaning:
            'Header yang menyatakan **format** badan pesan: `application/json`, `text/html`, `multipart/form-data`. Salah menyebutkannya adalah penyebab umum server menolak dengan `400` meski datamu sebenarnya sudah benar.',
        },
        {
          term: 'Authorization',
          meaning:
            'Header yang membawa **bukti identitas** ke server, paling sering dalam bentuk `Bearer <token>`. Dibahas tuntas di Sub-bab 5.7 beserta perbandingannya dengan cookie.',
        },
        {
          term: 'URL',
          meaning:
            'Singkatan *Uniform Resource Locator*. Alamat lengkap sebuah sumber daya. Bagian-bagiannya punya nama sendiri: **protokol** (`https:`), **host** (`contoh.id`), **path** (`/api/tugas`), dan **query string** (`?halaman=2`). Ketiga bagian pertama menentukan *origin*, yang menjadi inti pembahasan CORS di Sub-bab 5.6.',
        },
      ),

      h2('Bentuk permintaan'),
      code(
        'text',
        `
        POST /api/tugas HTTP/1.1
        Host: contoh.id
        Content-Type: application/json
        Authorization: Bearer eyJhbGci...

        {"judul":"Belajar HTTP"}
        `,
      ),

      h2('Method'),
      table(
        ['Method', 'Maksud', 'Aman?', 'Idempoten?'],
        [
          ['`GET`', 'Membaca', '**Ya**', '**Ya**'],
          ['`POST`', 'Membuat / aksi', 'Tidak', '**Tidak**'],
          ['`PUT`', 'Mengganti seluruhnya', 'Tidak', '**Ya**'],
          ['`PATCH`', 'Mengubah sebagian', 'Tidak', 'Tidak selalu'],
          ['`DELETE`', 'Menghapus', 'Tidak', '**Ya**'],
        ],
        '**Aman** = tidak mengubah apa pun. **Idempoten** = dijalankan berkali-kali, hasil akhirnya sama.',
      ),
      callout(
        'warning',
        'Kenapa `GET` tidak boleh mengubah data',
        'Browser, proxy, dan prefetch bebas memanggil `GET` kapan saja tanpa diminta pengguna — bahkan hanya karena tautannya terlihat. Endpoint `GET /hapus?id=5` bisa terpanggil sendiri oleh pemindai tautan atau pratinjau. Ini pernah menghapus data produksi orang sungguhan.',
      ),

      h2('Status code'),
      table(
        ['Kelompok', 'Arti', 'Yang sering kamu temui'],
        [
          ['`2xx`', 'Berhasil', '`200` OK · `201` Created · `204` No Content'],
          ['`3xx`', 'Pengalihan', '`301` permanen · `302` sementara · `304` Not Modified'],
          ['`4xx`', '**Kesalahan klien**', '`400` · `401` · `403` · `404` · `409` · `422` · `429`'],
          ['`5xx`', '**Kesalahan server**', '`500` · `502` · `503` · `504`'],
        ],
      ),
      callout(
        'tip',
        'Empat yang paling sering tertukar',
        '`401` = kamu **belum** terautentikasi (silakan login). `403` = kamu sudah dikenali tapi **tidak berhak**. `400` = bentuk permintaannya salah. `422` = bentuknya benar tapi isinya tidak valid secara aturan bisnis.',
      ),
      code(
        'js',
        `
        // Menerjemahkan status jadi tindakan, bukan sekadar pesan
        if (res.status === 401) arahkanKeLogin();
        else if (res.status === 403) tampilkan('Kamu tidak punya akses ke halaman ini.');
        else if (res.status === 404) tampilkan('Data yang kamu cari tidak ada.');
        else if (res.status === 429) tampilkan('Terlalu banyak permintaan. Coba lagi sebentar.');
        else if (res.status >= 500) tampilkan('Server sedang bermasalah. Coba lagi nanti.');
        `,
      ),

      h2('Header yang paling sering dipakai'),
      table(
        ['Header', 'Arah', 'Gunanya'],
        [
          ['`Content-Type`', 'Keduanya', 'Format body — `application/json`, `multipart/form-data`'],
          ['`Accept`', 'Permintaan', 'Format yang klien inginkan'],
          ['`Authorization`', 'Permintaan', '`Bearer <token>`'],
          ['`Cache-Control`', 'Keduanya', 'Boleh disimpan berapa lama'],
          ['`ETag` / `If-None-Match`', 'Keduanya', 'Permintaan bersyarat → `304`'],
          ['`Location`', 'Respons', 'Alamat sumber daya yang baru dibuat'],
          ['`Retry-After`', 'Respons', 'Kapan boleh mencoba lagi'],
        ],
      ),
      code(
        'js',
        `
        const res = await fetch('/api/data');

        res.headers.get('content-type');        // 'application/json; charset=utf-8'
        res.headers.has('etag');                // true/false
        [...res.headers.entries()];             // semua header yang boleh dibaca

        // Nama header TIDAK case-sensitive
        res.headers.get('Content-Type') === res.headers.get('content-type');   // true
        `,
      ),
      callout(
        'info',
        'Kamu tidak bisa membaca semua header respons',
        'Untuk permintaan lintas origin, browser hanya membuka beberapa header aman kecuali server mengizinkannya lewat `Access-Control-Expose-Headers`. Kalau `res.headers.get("X-Total")` bernilai `null` padahal server mengirimnya, itu penyebabnya — bukan bug di kodemu.',
      ),

      h2('URL: bagian-bagiannya'),
      code(
        'js',
        `
        const u = new URL('https://contoh.id/api/tugas?status=aktif&hal=2#bagian');

        u.protocol;      // 'https:'
        u.host;          // 'contoh.id'
        u.pathname;      // '/api/tugas'
        u.search;        // '?status=aktif&hal=2'
        u.searchParams.get('status');   // 'aktif'
        u.hash;          // '#bagian'   — tidak pernah dikirim ke server

        // Menambah parameter dengan aman, tanpa merangkai string
        u.searchParams.set('hal', '3');
        u.toString();    // 'https://contoh.id/api/tugas?status=aktif&hal=3#bagian'
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`GET` harus aman — jangan pernah mengubah data lewatnya.',
        'Idempoten berarti mengulang tidak mengubah hasil akhir; `POST` tidak idempoten.',
        '`401` belum login, `403` tidak berhak, `400` bentuk salah, `422` isi tidak valid.',
        'Nama header tidak case-sensitive; sebagian tersembunyi pada permintaan lintas origin.',
        'Pakai `URL` dan `searchParams`, jangan merangkai query string dengan tangan.',
      ),
      references(
        {
          label: 'HTTP request methods',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods',
          source: 'MDN',
          note: 'Tabel resmi sifat aman dan idempoten tiap method — dasar seluruh sub-bab ini.',
        },
        {
          label: 'HTTP response status codes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status',
          source: 'MDN',
          note: 'Daftar lengkap status beserta arti tiap kelompok digit pertamanya.',
        },
        {
          label: 'HTTP headers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers',
          source: 'MDN',
          note: 'Rujukan seluruh header, termasuk mana yang boleh dibaca pada permintaan lintas origin.',
        },
        {
          label: 'URL',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URL',
          source: 'MDN',
          note: 'Beserta `searchParams` — cara aman menyusun query string tanpa merangkai teks.',
        },
        {
          label: 'RFC 9110: HTTP Semantics',
          href: 'https://www.rfc-editor.org/rfc/rfc9110.html',
          source: 'IETF',
          note: 'Spesifikasi aslinya, sumber kebenaran untuk definisi "safe" dan "idempotent".',
        },
      ),
    ],
  ),

  written(
    'fetch-dasar',
    '`fetch()`: GET, POST, JSON, header',
    12,
    'Pemanggilan API sehari-hari, dari yang paling sederhana sampai unggahan berkas.',
    [
      terms(
        {
          term: 'res',
          meaning:
            'Singkatan *response*, nama variabel yang lazim untuk hasil `fetch`. Yang wajib dipahami: **`res` belum berisi datanya** — ia baru berisi status, header, dan sebuah aliran yang belum dibaca. Datanya keluar setelah `await res.json()`, dan itulah sebabnya hampir selalu ada dua `await` berturut-turut.',
        },
        {
          term: 'res.json()',
          meaning:
            'Method yang **membaca badan jawaban lalu mengurainya sebagai JSON**. Ia mengembalikan Promise karena badan pesan bisa saja masih mengalir dari jaringan. Perlu diketahui: memanggilnya pada jawaban yang bukan JSON — misalnya halaman error HTML — melempar `SyntaxError` yang pesannya membingungkan.',
        },
        {
          term: 'res.text()',
          meaning:
            'Membaca badan jawaban sebagai teks mentah. Berguna saat kamu tidak yakin server mengirim JSON, atau ketika ingin melihat isi sebenarnya dari jawaban yang gagal diurai.',
        },
        {
          term: 'body sekali baca',
          meaning:
            'Badan jawaban `fetch` hanya bisa **dibaca satu kali**. Memanggil `res.json()` setelah `res.text()` pada objek yang sama melempar error. Kalau butuh keduanya, baca sebagai teks lalu urai sendiri dengan `JSON.parse`, atau gandakan dulu dengan `res.clone()`.',
        },
        {
          term: 'options',
          meaning:
            'Objek argumen kedua `fetch` yang mengatur permintaan: `method`, `headers`, `body`, `signal`, `credentials`. Tanpa objek ini, `fetch` menganggap permintaanmu `GET` sederhana.',
        },
        {
          term: 'JSON.stringify',
          meaning:
            'Mengubah object JavaScript menjadi teks JSON, kebalikan dari `JSON.parse`. Wajib dipakai saat mengisi `body`, karena `fetch` **tidak** mengubah object menjadi JSON dengan sendirinya — mengirim object mentah menghasilkan teks `[object Object]` yang tidak berguna.',
        },
        {
          term: 'query string',
          meaning:
            'Bagian URL setelah tanda tanya, berisi pasangan nama–nilai: `?status=aktif&hal=2`. Susun dengan `URLSearchParams` dan jangan pernah merangkainya dengan penyambungan teks — nilai yang mengandung spasi, tanda `&`, atau huruf non-Latin akan merusak alamatnya.',
        },
        {
          term: 'encodeURIComponent',
          meaning:
            'Fungsi yang mengubah karakter bermakna khusus menjadi bentuk amannya untuk URL — spasi menjadi `%20`, `&` menjadi `%26`. `URLSearchParams` sudah melakukannya otomatis, jadi kamu jarang perlu memanggilnya sendiri.',
        },
        {
          term: 'multipart/form-data',
          meaning:
            'Format badan pesan untuk mengirim **berkas** bersama data teks. Aturan yang sering menjebak: kalau kamu memakai `FormData`, **jangan menulis header `Content-Type` sendiri** — browser harus menyusunnya sendiri agar bisa menyisipkan penanda pembatas yang benar.',
        },
      ),

      h2('GET'),
      code(
        'js',
        `
        const res = await fetch('/api/tugas');
        const data = await res.json();

        // Dengan query — pakai URL, bukan sambung string
        const url = new URL('/api/tugas', location.origin);
        url.searchParams.set('status', 'aktif');
        url.searchParams.set('cari', 'a b&c');       // otomatis di-encode
        await fetch(url);
        // /api/tugas?status=aktif&cari=a+b%26c
        `,
      ),
      callout(
        'danger',
        'Jangan pernah merangkai query dengan string',
        '`?cari=${kata}` akan rusak begitu kata mengandung `&`, `=`, `#`, atau spasi — dan pada kasus tertentu bisa menyisipkan parameter tambahan yang tidak kamu maksud. `searchParams.set()` meng-encode semuanya dengan benar.',
      ),

      h2('POST dengan JSON'),
      code(
        'js',
        `
        const res = await fetch('/api/tugas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul: 'Belajar fetch' }),
        });
        `,
      ),
      callout(
        'warning',
        'Dua kesalahan yang membuat server membalas 400',
        'Lupa `JSON.stringify` (body-nya jadi `"[object Object]"`) dan lupa header `Content-Type` (server tidak tahu cara mem-parse-nya). Keduanya tidak menghasilkan error di sisi klien — kamu hanya melihat 400 tanpa penjelasan.',
      ),

      h2('Membaca respons'),
      code(
        'js',
        `
        await res.json();       // objek — melempar SyntaxError kalau body bukan JSON
        await res.text();       // string mentah
        await res.blob();       // untuk berkas dan gambar
        await res.formData();
        await res.arrayBuffer();

        // Body hanya bisa dibaca SATU KALI
        const a = await res.json();
        const b = await res.json();   // TypeError: body stream already read

        // Kalau butuh dua kali, salin dulu
        const salinan = res.clone();
        `,
      ),
      callout(
        'tip',
        'Periksa `content-type` sebelum `res.json()`',
        'Kalau server error dan membalas halaman HTML, `res.json()` melempar `SyntaxError: Unexpected token <` — pesan yang menyesatkan karena masalah sebenarnya ada di server, bukan di parsing.',
      ),
      code(
        'js',
        `
        const tipe = res.headers.get('content-type') ?? '';
        const data = tipe.includes('application/json') ? await res.json() : await res.text();
        `,
      ),

      h2('Opsi lain yang sering dipakai'),
      code(
        'js',
        `
        await fetch(url, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
          credentials: 'include',   // kirim cookie lintas origin
          cache: 'no-store',        // jangan pakai cache
          redirect: 'follow',       // 'error' kalau ingin menolak pengalihan
          signal: AbortSignal.timeout(10_000),
        });
        `,
      ),
      table(
        ['`credentials`', 'Artinya'],
        [
          ['`same-origin`', 'Bawaan — cookie hanya untuk origin yang sama'],
          ['`include`', 'Kirim cookie juga lintas origin (server harus mengizinkannya)'],
          ['`omit`', 'Jangan pernah kirim cookie'],
        ],
      ),

      h2('Membungkus jadi satu tempat'),
      code(
        'js',
        `
        async function api(path, opsi = {}) {
          const res = await fetch(\`/api\${path}\`, {
            headers: { Accept: 'application/json', ...opsi.headers },
            signal: AbortSignal.timeout(10_000),
            ...opsi,
          });

          if (!res.ok) {
            const error = new Error(\`Permintaan gagal: \${res.status}\`);
            error.status = res.status;
            throw error;
          }

          return res.status === 204 ? null : res.json();
        }

        await api('/tugas');
        await api('/tugas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul: 'x' }),
        });
        `,
        { caption: 'Versi lengkapnya dibangun di sub-bab 5.11.' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pakai `URL` + `searchParams`; jangan merangkai query dengan string.',
        'POST JSON butuh `JSON.stringify` **dan** header `Content-Type`.',
        'Body respons hanya bisa dibaca sekali — `clone()` kalau butuh dua kali.',
        'Periksa `content-type` sebelum `res.json()` supaya pesan errornya jujur.',
        '`204 No Content` tidak punya body — jangan panggil `res.json()` untuknya.',
      ),
      references(
        {
          label: 'fetch()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch',
          source: 'MDN',
          note: 'Seluruh opsi permintaan: `method`, `headers`, `body`, `credentials`, dan `signal`.',
        },
        {
          label: 'Response',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Response',
          source: 'MDN',
          note: 'Menegaskan bahwa badan jawaban hanya bisa dibaca sekali, beserta `clone()` sebagai jalan keluar.',
        },
        {
          label: 'URLSearchParams',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams',
          source: 'MDN',
          note: 'Menyusun query string dengan pengkodean otomatis — pengganti penyambungan teks.',
        },
        {
          label: 'Headers',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Headers',
          source: 'MDN',
          note: 'Termasuk aturan jangan menulis `Content-Type` sendiri saat memakai `FormData`.',
        },
        {
          label: '204 No Content',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/204',
          source: 'MDN',
          note: 'Alasan `res.json()` tidak boleh dipanggil untuk status ini.',
        },
      ),
    ],
  ),

  written(
    'error-fetch',
    'Menangani Error di `fetch`',
    12,
    'Kesalahan paling umum: mengira 404 akan masuk ke `catch`.',
    [
      p(
        'Ini sub-bab pendek dengan dampak besar. Satu salah paham di sini membuat aplikasi menampilkan "berhasil" padahal server menolak permintaannya.',
      ),

      terms(
        {
          term: 'res.ok',
          meaning:
            'Property boolean yang bernilai `true` **hanya** untuk status 200–299. Inilah pemeriksaan yang wajib kamu tulis sendiri setelah setiap `fetch`. Melewatkannya adalah kesalahan nomor satu di sub-bab ini, dan akibatnya aplikasi menampilkan "berhasil" padahal server menolak.',
        },
        {
          term: 'menolak (reject)',
          meaning:
            'Promise yang berakhir gagal sehingga masuk ke `catch`. Aturan `fetch` konsisten dan perlu dihafal: ia menolak **hanya kalau jawabannya tidak sampai** — jaringan mati, DNS gagal, dibatalkan, atau diblokir CORS. Begitu server menjawab, apa pun isinya, permintaannya dianggap berhasil dilakukan.',
        },
        {
          term: 'TypeError',
          meaning:
            'Jenis error yang dilempar `fetch` saat permintaan **tidak sampai sama sekali**. Sayangnya pesannya sengaja dibuat kabur ("Failed to fetch") demi keamanan — browser tidak ingin membocorkan apakah kegagalannya karena jaringan, DNS, atau CORS.',
        },
        {
          term: 'error jaringan',
          meaning:
            'Kegagalan sebelum jawaban sempat tiba: koneksi putus, server tidak dapat dihubungi, permintaan diblokir. Bedakan dari **error aplikasi** seperti `404` atau `422` — yang pertama layak dicoba ulang, yang kedua tidak.',
        },
        {
          term: 'error terstruktur',
          meaning:
            'Objek `Error` buatanmu yang **membawa keterangan tambahan** selain pesan — `status`, `kode`, atau isi jawaban server. Tanpa itu, pemanggil hanya punya teks untuk dicocokkan, dan pencocokan teks selalu rapuh.',
        },
        {
          term: 'error.cause',
          meaning:
            'Property baku untuk **menyimpan error asal** saat kamu membungkusnya dengan error baru: `new Error("Gagal memuat", { cause: e })`. Tanpa itu, jejak penyebab sebenarnya hilang begitu error dibungkus ulang.',
        },
        {
          term: 'pesan yang bisa ditindaklanjuti',
          meaning:
            'Pesan error yang memberi tahu pengguna **apa yang bisa ia lakukan**, bukan sekadar menyatakan ada yang salah. "Periksa koneksi lalu coba lagi" bisa ditindaklanjuti; "Terjadi kesalahan" tidak. Aturan pendampingnya dari `security.md`: detail teknis tetap di log, jangan di layar.',
        },
        {
          term: 'graceful degradation',
          meaning:
            'Terjemahannya **penurunan yang anggun**. Aplikasi tetap berguna meski sebagian gagal — misalnya menampilkan data lama dari cache sambil memberi tahu bahwa pembaruan gagal, alih-alih menampilkan layar kosong.',
        },
      ),

      h2('Kapan `fetch` menolak'),
      table(
        ['Kejadian', '`fetch` menolak?'],
        [
          ['Jaringan mati, DNS gagal, koneksi ditolak', '**Ya** — `TypeError`'],
          ['Dibatalkan `AbortController`', '**Ya** — `AbortError`'],
          ['Habis waktu `AbortSignal.timeout`', '**Ya** — `TimeoutError`'],
          ['Diblokir CORS', '**Ya** — `TypeError`'],
          ['Server balas `404`', '**Tidak** — dianggap berhasil diterima'],
          ['Server balas `500`', '**Tidak**'],
        ],
      ),
      p(
        'Logikanya konsisten: `fetch` menolak kalau **responsnya tidak sampai**. Kalau server menjawab — apa pun jawabannya — permintaannya berhasil dilakukan.',
      ),
      code(
        'js',
        `
        // SALAH: catch tidak akan pernah menangkap 404 atau 500
        try {
          const data = await fetch('/api/tidak-ada').then((r) => r.json());
          tampilkan(data);
        } catch (e) {
          tampilkanError(e);
        }
        `,
      ),
      code(
        'js',
        `
        // BENAR
        const res = await fetch('/api/tidak-ada');
        if (!res.ok) {
          throw new Error(\`Server balas \${res.status}\`);
        }
        `,
      ),

      h2('Membedakan tiga jenis kegagalan'),
      code(
        'js',
        `
        async function ambil(url) {
          let res;

          try {
            res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
          } catch (error) {
            if (error.name === 'AbortError') throw error;        // dibatalkan sengaja
            if (error.name === 'TimeoutError') {
              throw new Error('Server tidak menjawab. Periksa koneksimu.');
            }
            // TypeError: jaringan mati, DNS gagal, atau diblokir CORS
            throw new Error('Tidak bisa terhubung ke server.');
          }

          if (!res.ok) {
            const pesan = await pesanDariServer(res);
            const error = new Error(pesan ?? \`Server balas \${res.status}\`);
            error.status = res.status;
            throw error;
          }

          return res.json();
        }

        async function pesanDariServer(res) {
          try {
            const tipe = res.headers.get('content-type') ?? '';
            if (!tipe.includes('json')) return null;
            const body = await res.json();
            return body?.message ?? body?.error ?? null;
          } catch {
            return null;      // body rusak — jangan sampai ini menutupi error aslinya
          }
        }
        `,
      ),
      callout(
        'warning',
        'Perbedaan yang membingungkan saat menguji',
        '`AbortSignal.timeout()` hanya melempar `TimeoutError` kalau waktunya benar-benar habis. Kalau koneksi **ditolak lebih dulu** (server mati, port salah), yang kamu terima adalah `TypeError` — bukan `TimeoutError`. Diverifikasi langsung saat menulis materi ini.',
      ),

      h2('Pesan untuk pengguna vs pesan untuk log'),
      code(
        'js',
        `
        catch (error) {
          // Log: lengkap, untuk kamu
          console.error('[ambilTugas] gagal', { url, status: error.status, error });

          // Layar: bisa ditindaklanjuti, tanpa detail internal
          tampilkanError(
            error.status === 404
              ? 'Data tidak ditemukan.'
              : 'Gagal memuat data. Coba muat ulang halaman.',
          );
        }
        `,
      ),
      callout(
        'danger',
        'Jangan tampilkan pesan error mentah ke pengguna',
        'Stack trace dan pesan internal bisa membocorkan jalur berkas, nama tabel, dan versi pustaka — informasi berharga bagi penyerang. Detail ke log; pesan yang bisa ditindaklanjuti ke layar.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`fetch` hanya menolak kalau responsnya tidak sampai — 404 dan 500 dianggap berhasil.',
        'Selalu periksa `res.ok` sebelum membaca body.',
        'Bedakan `AbortError`, `TimeoutError`, dan `TypeError` — ketiganya butuh perlakuan berbeda.',
        'Koneksi yang ditolak memberi `TypeError`, bukan `TimeoutError`.',
        'Detail lengkap ke log; pesan yang bisa ditindaklanjuti ke layar.',
      ),
      references(
        {
          label: 'Response.ok',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Response/ok',
          source: 'MDN',
          note: 'Pemeriksaan wajib setelah setiap `fetch` — inti seluruh sub-bab ini.',
        },
        {
          label: 'Using the Fetch API — Checking that the fetch was successful',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
          source: 'MDN',
          note: 'Penegasan resmi bahwa `fetch` hanya menolak saat jawaban tidak sampai.',
        },
        {
          label: 'Error: cause',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause',
          source: 'MDN',
          note: 'Menyimpan error asal saat membungkusnya, agar jejak penyebab tidak hilang.',
        },
        {
          label: 'TypeError',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError',
          source: 'MDN',
          note: 'Jenis error yang dilempar `fetch` saat permintaan tidak sampai sama sekali.',
        },
        {
          label: 'Error Handling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan keamanan di balik "detail ke log, pesan generik ke layar".',
        },
      ),
    ],
  ),

  written(
    'upload-file',
    'Upload Berkas: `FormData` & multipart',
    11,
    'Mengirim berkas dari browser — dan kenapa validasi klien bukan pengaman.',
    [
      terms(
        {
          term: 'File',
          meaning:
            'Objek yang mewakili satu berkas yang dipilih pengguna, berisi `name`, `size`, `type`, dan `lastModified`. Peringatan yang wajib melekat: **`type` berasal dari klien dan bisa dipalsukan** — mengganti nama `virus.exe` menjadi `foto.jpg` sudah cukup untuk mengelabuinya.',
        },
        {
          term: 'FileList',
          meaning:
            'Kumpulan berkas pada `input.files`. Seperti `NodeList`, ia **mirip array tapi bukan array** — sebarkan dengan `[...input.files]` kalau butuh `map` atau `filter`.',
        },
        {
          term: 'FormData',
          meaning:
            'Objek yang menyusun badan pesan `multipart/form-data`, satu-satunya format yang bisa membawa **berkas dan teks sekaligus**. Aturan mutlaknya: **jangan pernah menulis header `Content-Type` sendiri** saat memakainya — browser harus menyusunnya sendiri agar bisa menyisipkan penanda pembatas yang benar.',
        },
        {
          term: 'multipart',
          meaning:
            'Terjemahannya **berbagai bagian**. Format badan pesan yang memisahkan tiap potongan data dengan penanda pembatas unik, sehingga berkas biner dan teks bisa dikirim dalam satu permintaan tanpa saling merusak.',
        },
        {
          term: 'boundary',
          meaning:
            'Terjemahannya **pembatas**. Untai teks acak yang memisahkan tiap bagian di dalam badan `multipart`. Nilainya harus dijamin tidak muncul di dalam isi berkas — dan justru karena itulah browser yang harus membuatnya, bukan kamu.',
        },
        {
          term: 'MIME type',
          meaning:
            'Singkatan *Multipurpose Internet Mail Extensions*. Penanda jenis berkas seperti `image/jpeg` atau `application/pdf`. Asal-usulnya memang dari surel, tapi kini dipakai di seluruh web untuk menyatakan format sebuah data.',
        },
        {
          term: 'magic bytes',
          meaning:
            'Terjemahannya **byte penanda**. Beberapa byte pertama sebuah berkas yang menyatakan jenis aslinya — misalnya berkas PNG selalu diawali `89 50 4E 47`. Inilah cara **server** memeriksa jenis berkas yang sebenarnya, karena ia tidak bisa dipalsukan hanya dengan mengganti nama.',
        },
        {
          term: 'accept',
          meaning:
            'Atribut pada `<input type="file">` yang **menyaring pilihan di dialog** berkas, misalnya `accept="image/*"`. Perlu ditegaskan: ini murni kenyamanan — ia sama sekali tidak mencegah pengguna memilih berkas lain lewat cara lain.',
        },
        {
          term: 'validasi klien vs server',
          meaning:
            'Pemeriksaan di browser membuat pengguna dapat jawaban seketika; pemeriksaan di server **satu-satunya yang mengamankan**. Untuk unggahan, server wajib memeriksa ukuran, jenis berkas dari magic bytes, dan menyimpannya dengan nama yang ia buat sendiri — bukan nama dari klien.',
        },
        {
          term: 'objectURL',
          meaning:
            'Alamat sementara berbentuk `blob:` yang dibuat `URL.createObjectURL(file)` untuk menampilkan pratinjau tanpa mengunggah apa pun. Wajib dilepas dengan `URL.revokeObjectURL(...)` setelah selesai, kalau tidak berkasnya tertahan di memori.',
        },
      ),

      h2('Memilih berkas'),
      code('html', `<input type="file" id="berkas" accept="image/*" multiple />`),
      code(
        'js',
        `
        const input = document.querySelector('#berkas');

        input.addEventListener('change', () => {
          for (const file of input.files) {
            file.name;            // 'foto.jpg'
            file.size;            // dalam byte
            file.type;            // 'image/jpeg' — DARI KLIEN, bisa dipalsukan
            file.lastModified;
          }
        });
        `,
      ),

      h2('Mengunggah'),
      code(
        'js',
        `
        const fd = new FormData();
        fd.append('judul', 'Foto profil');
        fd.append('berkas', input.files[0]);

        const res = await fetch('/api/unggah', {
          method: 'POST',
          body: fd,          // JANGAN set Content-Type sendiri
        });
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menyetel `Content-Type` untuk `FormData`',
        'Multipart butuh *boundary* — penanda acak yang memisahkan tiap bagian. Browser menghasilkannya dan menyisipkannya ke header secara otomatis. Kalau kamu menulis `Content-Type: multipart/form-data` sendiri, boundary-nya hilang dan server **tidak bisa mem-parse body sama sekali**.',
      ),

      h2('Pratinjau sebelum diunggah'),
      code(
        'js',
        `
        const url = URL.createObjectURL(file);
        gambar.src = url;

        // WAJIB dilepas — kalau tidak, berkasnya tertahan di memori
        gambar.onload = () => URL.revokeObjectURL(url);
        `,
      ),

      h2('Validasi di klien — untuk kenyamanan'),
      code(
        'js',
        `
        const MAKS = 5 * 1024 * 1024;   // 5 MB
        const DIIZINKAN = ['image/jpeg', 'image/png', 'image/webp'];

        function periksa(file) {
          if (file.size > MAKS) return 'Ukuran maksimal 5 MB.';
          if (!DIIZINKAN.includes(file.type)) return 'Hanya JPG, PNG, atau WebP.';
          return null;
        }
        `,
      ),
      callout(
        'danger',
        'Semua pemeriksaan di atas bisa dilewati',
        '`file.type` berasal dari ekstensi berkas di komputer pengguna — mengganti nama `virus.exe` menjadi `foto.jpg` sudah cukup mengubahnya. Dan siapa pun bisa memanggil endpointmu langsung dengan `curl`, tanpa membuka halamanmu sama sekali. **Server wajib memeriksa ulang: batas ukuran, ekstensi allow-list, dan isi berkas sungguhan lewat magic byte.** Dibahas tuntas di Backend Intermediate 2.7.',
      ),

      h2('Progres unggah'),
      code(
        'js',
        `
        // fetch belum punya progres unggah. Untuk berkas besar, XHR masih dipakai:
        function unggahDenganProgres(url, fd, onProgres) {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) onProgres(Math.round((e.loaded / e.total) * 100));
            });

            xhr.addEventListener('load', () =>
              xhr.status < 400 ? resolve(xhr.responseText) : reject(new Error(\`\${xhr.status}\`)),
            );
            xhr.addEventListener('error', () => reject(new Error('Gagal terhubung')));

            xhr.open('POST', url);
            xhr.send(fd);
          });
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`FormData` + `fetch` sudah cukup untuk unggahan biasa.',
        'Jangan pernah menyetel `Content-Type` sendiri untuk `FormData`.',
        '`URL.createObjectURL` wajib dipasangkan dengan `revokeObjectURL`.',
        '`file.type` berasal dari klien dan bisa dipalsukan.',
        'Validasi klien adalah kenyamanan; server wajib memeriksa ulang semuanya.',
      ),
      references(
        {
          label: 'FormData',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
          source: 'MDN',
          note: 'Termasuk aturan jangan menyetel `Content-Type` sendiri agar boundary tersusun benar.',
        },
        {
          label: 'File',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/File',
          source: 'MDN',
          note: 'Property `name`, `size`, dan `type` — beserta catatan bahwa `type` berasal dari klien.',
        },
        {
          label: 'URL.createObjectURL()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static',
          source: 'MDN',
          note: 'Pratinjau tanpa mengunggah, beserta kewajiban memanggil `revokeObjectURL`.',
        },
        {
          label: 'File Upload Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar pemeriksaan yang wajib dilakukan server: magic bytes, ukuran, dan nama berkas.',
        },
        {
          label: 'HTML attribute: accept',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept',
          source: 'MDN',
          note: 'Menegaskan bahwa ia hanya menyaring dialog berkas, bukan mencegah apa pun.',
        },
      ),
    ],
  ),

  written(
    'cors',
    'CORS: apa yang sebenarnya terjadi',
    13,
    'Kenapa permintaanmu diblokir padahal `curl` ke alamat yang sama berhasil.',
    [
      p(
        'Hampir setiap orang yang belajar frontend pernah berhenti karena pesan ini. Kabar baiknya: setelah paham **siapa yang memblokir dan kenapa**, penyelesaiannya selalu sama dan selalu di sisi server.',
      ),

      terms(
        {
          term: 'origin',
          meaning:
            'Terjemahannya **asal**. Gabungan **protokol + host + port** sebuah alamat. Path tidak ikut dihitung. Karena ketiganya harus identik, `https://app.id` dan `https://api.app.id` adalah origin **berbeda** — subdomain pun dihitung host lain, dan ini yang paling sering mengejutkan.',
        },
        {
          term: 'same-origin policy',
          meaning:
            'Terjemahannya **kebijakan asal yang sama**. Aturan bawaan browser yang melarang halaman dari satu origin membaca jawaban dari origin lain. Alasannya sangat konkret: tanpa aturan ini, situs jahat yang kamu buka bisa memanggil `https://bank.id/api/saldo` **dengan cookie login-mu** lalu membaca hasilnya.',
        },
        {
          term: 'CORS',
          meaning:
            'Singkatan *Cross-Origin Resource Sharing*, terjemahannya **berbagi sumber daya lintas asal**. Perlu diluruskan: CORS **bukan** yang memblokir permintaanmu — same-origin policy yang memblokir, dan CORS justru mekanisme server untuk **mengizinkan pengecualian secara sadar**. Karena itu penyelesaiannya selalu di sisi server, tidak pernah di kodemu.',
        },
        {
          term: 'preflight',
          meaning:
            'Terjemahannya **penerbangan pendahuluan**. Permintaan `OPTIONS` yang **dikirim browser lebih dulu** untuk bertanya "boleh tidak saya mengirim permintaan seperti ini?". Terpicu oleh method selain GET/POST/HEAD, atau oleh header tidak baku seperti `Authorization`. Kalau preflight ditolak, permintaan sebenarnya tidak pernah dikirim sama sekali.',
        },
        {
          term: 'Access-Control-Allow-Origin',
          meaning:
            'Header **jawaban dari server** yang menyatakan origin mana yang boleh membaca hasilnya. Inilah header yang keberadaannya dicari browser. Perlu diingat: `*` tidak boleh dipakai bersama `credentials: "include"` — kombinasi itu ditolak spesifikasi karena akan membuka celah yang justru ingin ditutup.',
        },
        {
          term: 'simple request',
          meaning:
            'Terjemahannya **permintaan sederhana**. Permintaan yang **tidak memicu preflight** karena memenuhi syarat ketat: method GET, POST, atau HEAD, dengan `Content-Type` terbatas pada tiga nilai saja. Menambahkan satu header kustom saja sudah cukup membuatnya tidak lagi sederhana.',
        },
        {
          term: 'credentials',
          meaning:
            'Opsi `fetch` yang menentukan **apakah cookie ikut dikirim**. Nilai `include` mengirimnya bahkan lintas origin — dan begitu dipakai, server wajib menyebutkan origin secara persis serta menambahkan `Access-Control-Allow-Credentials: true`.',
        },
        {
          term: 'opaque response',
          meaning:
            'Terjemahannya **jawaban buram**. Jawaban yang **diterima browser tapi tidak boleh dibaca kodemu** — statusnya tampak `0` dan badannya kosong. Ini yang kamu lihat saat CORS gagal: datanya sebenarnya sampai, tapi browser menolak menyerahkannya kepadamu.',
        },
        {
          term: 'proxy',
          meaning:
            'Terjemahannya **perantara**. Server milikmu sendiri yang meneruskan permintaan ke API pihak ketiga. Ini jalan keluar yang sah saat kamu **tidak bisa mengubah** server tujuan — karena permintaan server-ke-server tidak tunduk pada same-origin policy sama sekali.',
        },
        {
          term: 'curl',
          meaning:
            'Alat baris perintah untuk mengirim permintaan HTTP. Disebut di sini karena ia **berhasil pada alamat yang persis sama** dengan yang diblokir di browser — dan itu bukan keanehan, melainkan bukti bahwa CORS adalah kontrol **browser**, bukan kontrol server. Konsekuensi pentingnya: CORS tidak pernah bisa dianggap sebagai pengaman.',
        },
      ),

      h2('Same-origin policy'),
      p('Dua alamat disebut **origin yang sama** kalau protokol, host, dan port-nya identik.'),
      table(
        ['Dibandingkan dengan `https://app.id/a`', 'Sama origin?'],
        [
          ['`https://app.id/b`', 'Ya — path tidak dihitung'],
          ['`http://app.id/a`', '**Tidak** — protokol beda'],
          ['`https://api.app.id/a`', '**Tidak** — subdomain dihitung host berbeda'],
          ['`https://app.id:8080/a`', '**Tidak** — port beda'],
        ],
      ),
      callout(
        'info',
        'Kenapa aturan ini ada',
        'Tanpanya, situs jahat yang kamu buka bisa memanggil `https://bank.id/api/saldo` **dengan cookie login-mu**, lalu membaca hasilnya. Same-origin policy adalah yang mencegah itu — dan CORS adalah cara server mengizinkan pengecualian secara sadar.',
      ),

      h2('Yang sebenarnya terjadi'),
      steps(
        {
          title: 'Browser tetap mengirim permintaannya',
          body: 'Ini bagian yang mengejutkan: server **menerima dan memprosesnya**. Kalau itu `POST` yang membuat data, datanya benar-benar terbuat.',
        },
        {
          title: 'Server membalas',
          body: 'Dengan atau tanpa header `Access-Control-Allow-Origin`.',
        },
        {
          title: 'Browser memeriksa header itu',
          body: 'Kalau tidak ada atau tidak cocok dengan origin halamanmu, browser **menolak memberikan responsnya ke JavaScript-mu**.',
        },
        {
          title: 'JavaScript melihat `TypeError`',
          body: 'Tanpa status, tanpa body — karena browser tidak pernah menyerahkannya kepadamu.',
        },
      ),
      callout(
        'warning',
        'Inilah kenapa `curl` berhasil dan browser tidak',
        'CORS ditegakkan **browser**, bukan server. `curl`, Postman, skrip Node, dan aplikasi mobile tidak terpengaruh sama sekali. Konsekuensi penting: **CORS bukan kontrol keamanan.** Ia tidak melindungi API-mu dari siapa pun — otorisasi tetap wajib ada di server.',
      ),

      h2('Preflight'),
      p(
        'Untuk permintaan yang bisa mengubah data, browser bertanya lebih dulu dengan `OPTIONS` — sebelum permintaan aslinya dikirim.',
      ),
      code(
        'text',
        `
        OPTIONS /api/tugas
        Origin: https://app.id
        Access-Control-Request-Method: POST
        Access-Control-Request-Headers: content-type, authorization

        --- balasan server ---
        Access-Control-Allow-Origin: https://app.id
        Access-Control-Allow-Methods: GET, POST, DELETE
        Access-Control-Allow-Headers: content-type, authorization
        Access-Control-Max-Age: 86400
        `,
      ),
      table(
        ['Tidak perlu preflight (simple request)', 'Perlu preflight'],
        [
          ['`GET`, `HEAD`, `POST`', '`PUT`, `PATCH`, `DELETE`'],
          ['`Content-Type` form/text/plain', '`Content-Type: application/json`'],
          ['Tanpa header kustom', 'Ada `Authorization` atau header kustom'],
        ],
      ),
      p(
        'Karena itu hampir semua panggilan API modern memicu preflight — mereka mengirim JSON dan membawa token.',
      ),

      h2('Memperbaikinya'),
      code(
        'js',
        `
        // Di server (contoh Express) — allow-list origin yang PERSIS
        const DIIZINKAN = ['https://app.id', 'https://staging.app.id'];

        app.use((req, res, next) => {
          const origin = req.headers.origin;
          if (DIIZINKAN.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Vary', 'Origin');        // penting untuk cache
          }
          res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          if (req.method === 'OPTIONS') return res.sendStatus(204);
          next();
        });
        `,
      ),
      callout(
        'danger',
        'Dua kesalahan konfigurasi yang serius',
        '**`Access-Control-Allow-Origin: *` bersama `Allow-Credentials: true`** — browser menolaknya, dan alasannya penting: itu setara mengizinkan situs mana pun bertindak atas nama pengguna yang sedang login. **Memantulkan header `Origin` apa adanya** tanpa memeriksanya terhadap allow-list sama saja dengan tidak punya kebijakan.',
      ),

      h2('Saat pengembangan'),
      code(
        'js',
        `
        // Proxy di dev server membuat permintaan tampak same-origin,
        // sehingga CORS tidak ikut campur sama sekali.
        // vite.config.js
        export default {
          server: {
            proxy: { '/api': { target: 'http://localhost:4000', changeOrigin: true } },
          },
        };
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Origin = protokol + host + port. Subdomain dihitung berbeda.',
        'Server tetap menerima dan memproses permintaannya — browser yang menahan responsnya.',
        'CORS adalah kontrol browser, bukan kontrol akses. Otorisasi tetap di server.',
        'JSON + `Authorization` hampir selalu memicu preflight `OPTIONS`.',
        'Allow-list origin yang persis; jangan `*` dengan credentials, jangan pantulkan `Origin`.',
      ),
      references(
        {
          label: 'Cross-Origin Resource Sharing (CORS)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS',
          source: 'MDN',
          note: 'Rujukan utama sub-bab ini: preflight, header yang terlibat, dan syarat simple request.',
        },
        {
          label: 'Same-origin policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy',
          source: 'MDN',
          note: 'Aturan yang sebenarnya memblokir — CORS hanyalah cara server memberi pengecualian.',
        },
        {
          label: 'Access-Control-Allow-Origin',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin',
          source: 'MDN',
          note: 'Termasuk larangan memakai `*` bersama permintaan yang membawa credentials.',
        },
        {
          label: 'Origin',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Origin',
          source: 'MDN',
          note: 'Definisi resmi: protokol + host + port, dan kenapa subdomain dihitung berbeda.',
        },
        {
          label: 'Fetch Standard — CORS protocol',
          href: 'https://fetch.spec.whatwg.org/#http-cors-protocol',
          source: 'WHATWG',
          note: 'Spesifikasi aslinya, sumber kebenaran untuk kapan preflight wajib dikirim.',
        },
      ),
    ],
  ),

  written(
    'auth-klien',
    'Autentikasi dari Sisi Klien: Bearer vs cookie',
    13,
    'Dua pola menyimpan identitas, dan daftar risiko masing-masing.',
    [
      p(
        'Setelah login, browser harus membuktikan siapa kamu di setiap permintaan berikutnya. Ada dua cara utama, dan keduanya punya risiko berbeda — bukan satu yang aman dan satu yang tidak.',
      ),

      terms(
        {
          term: 'autentikasi',
          meaning:
            'Dari *authentication*, terjemahannya **pembuktian identitas** — menjawab "siapa kamu". Bedakan dari **otorisasi** (*authorization*) yang menjawab "boleh apa saja kamu". Keduanya sering disingkat sama-sama "auth", padahal urusannya berbeda: kamu bisa terautentikasi tapi tetap tidak berhak.',
        },
        {
          term: 'Bearer token',
          meaning:
            'Artinya **token pembawa**. Untai teks yang dikirim di header `Authorization: Bearer <token>` sebagai bukti identitas. Namanya menjelaskan risikonya: **siapa pun yang membawanya diperlakukan sebagai pemiliknya** — tidak ada pemeriksaan tambahan apakah pembawanya memang orang yang berhak.',
        },
        {
          term: 'cookie',
          meaning:
            'Potongan data kecil yang disimpan browser dan **dikirim otomatis** ke server pada setiap permintaan ke domain itu. Sifat otomatis inilah kelebihan sekaligus kelemahannya: kamu tidak perlu mengurusnya, tapi ia juga ikut terkirim pada permintaan yang dipicu situs lain.',
        },
        {
          term: 'HttpOnly',
          meaning:
            'Penanda pada cookie yang membuatnya **tidak bisa dibaca JavaScript sama sekali**. Ini keunggulan besar cookie atas token di `localStorage`: kalau ada celah XSS, skrip penyerang tetap tidak bisa mencuri cookie yang ditandai `HttpOnly`.',
        },
        {
          term: 'Secure',
          meaning:
            'Penanda yang membuat cookie **hanya dikirim lewat HTTPS**. Tanpa itu, cookie ikut terkirim dalam bentuk terbaca pada koneksi biasa, dan siapa pun yang menyadap jaringan bisa mengambilnya.',
        },
        {
          term: 'SameSite',
          meaning:
            'Penanda yang mengatur **apakah cookie ikut terkirim** saat permintaan dipicu dari situs lain. Nilai `Lax` (bawaan sekarang) dan `Strict` adalah pertahanan utama terhadap CSRF, karena keduanya memutus jalur yang dipakai serangan itu.',
        },
        {
          term: 'CSRF',
          meaning:
            'Singkatan *Cross-Site Request Forgery*, terjemahannya **pemalsuan permintaan lintas situs**. Serangan di mana situs jahat memicu permintaan ke situsmu **memakai cookie login korban**. Perhatikan pembagian risikonya: pola cookie rentan CSRF, sementara pola Bearer rentan XSS. Tidak ada yang aman tanpa syarat — masing-masing menukar satu risiko dengan risiko lain.',
        },
        {
          term: 'access token',
          meaning:
            'Token berumur **pendek** (hitungan menit) yang dipakai untuk mengakses sumber daya. Umurnya sengaja dibuat pendek agar token yang dicuri cepat kedaluwarsa dengan sendirinya.',
        },
        {
          term: 'refresh token',
          meaning:
            'Token berumur **panjang** yang tugasnya hanya satu: menukar dirinya dengan access token baru. Disimpan lebih hati-hati — idealnya sebagai cookie `HttpOnly` — dan sebaiknya **dirotasi setiap kali dipakai**, sehingga kemunculan token lama menjadi tanda pencurian.',
        },
        {
          term: 'JWT',
          meaning:
            'Singkatan *JSON Web Token*, dibaca "jot". Format token yang membawa datanya sendiri dalam bentuk bertanda tangan. Satu hal yang wajib dipahami sejak awal: **isinya hanya di-encode base64, bukan dienkripsi** — siapa pun bisa membacanya. Jangan pernah menaruh apa pun yang rahasia di dalamnya.',
        },
      ),

      h2('Pola 1 — Bearer token di header'),
      code(
        'js',
        `
        const { token } = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }).then((r) => r.json());

        // Setiap permintaan berikutnya
        await fetch('/api/profil', {
          headers: { Authorization: \`Bearer \${token}\` },
        });
        `,
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          [
            'Bekerja lintas domain tanpa masalah',
            '**Rentan XSS** — skrip apa pun di halamanmu bisa membacanya',
          ],
          ['Tidak butuh proteksi CSRF', 'Kamu yang harus menyimpannya di suatu tempat'],
          ['Cocok untuk aplikasi mobile', 'Sulit dicabut kalau memakai JWT stateless'],
        ],
      ),
      callout(
        'danger',
        'Di mana menyimpan token adalah pertanyaan yang salah',
        '`localStorage`, `sessionStorage`, dan variabel biasa **semuanya** bisa dibaca JavaScript. Kalau ada satu celah XSS di halamanmu, token tercuri — di mana pun ia disimpan. Menyimpan di memori (variabel modul) sedikit lebih baik karena hilang saat tab ditutup, tapi tetap tidak menyelesaikan XSS.',
      ),

      h2('Pola 2 — Cookie `HttpOnly`'),
      code(
        'js',
        `
        // Server menyetel cookie; JavaScript tidak pernah menyentuhnya
        // Set-Cookie: sesi=abc; HttpOnly; Secure; SameSite=Lax; Path=/

        await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        // Permintaan berikutnya — cookie ikut otomatis
        await fetch('/api/profil', { credentials: 'include' });

        document.cookie;   // tidak berisi 'sesi' — HttpOnly menyembunyikannya
        `,
      ),
      table(
        ['Atribut cookie', 'Gunanya'],
        [
          ['`HttpOnly`', '**JavaScript tidak bisa membacanya** — XSS tidak langsung mencuri sesi'],
          ['`Secure`', 'Hanya dikirim lewat HTTPS'],
          ['`SameSite=Lax`', 'Tidak ikut pada permintaan lintas situs, kecuali navigasi biasa'],
          ['`SameSite=Strict`', 'Tidak pernah ikut lintas situs'],
          ['`Path` / `Max-Age`', 'Cakupan dan umur'],
        ],
      ),

      h2('Perbandingan risiko'),
      table(
        ['Ancaman', 'Bearer di `localStorage`', 'Cookie `HttpOnly`'],
        [
          [
            'XSS',
            '**Token langsung tercuri**',
            'Sesi tidak terbaca; penyerang tetap bisa mengirim permintaan dari halamanmu',
          ],
          [
            'CSRF',
            'Kebal — token tidak ikut otomatis',
            '**Rentan** — butuh `SameSite` + token anti-CSRF',
          ],
          ['Lintas domain', 'Mudah', 'Perlu CORS + `credentials`'],
        ],
      ),
      callout(
        'info',
        'Kesimpulan yang jujur',
        'Untuk aplikasi web, **cookie `HttpOnly` + `SameSite` + proteksi CSRF** umumnya lebih aman, karena XSS adalah ancaman yang jauh lebih sering terjadi daripada CSRF. Bearer token lebih tepat untuk aplikasi mobile dan integrasi antar-layanan. Pilih berdasarkan itu, bukan berdasarkan yang lebih mudah ditulis.',
      ),

      h2('Refresh token'),
      code(
        'js',
        `
        // Access token berumur pendek (menit), refresh token lebih panjang.
        // Saat access token kedaluwarsa, tukar sekali — dan JANGAN sampai
        // sepuluh permintaan yang gagal bersamaan memicu sepuluh refresh.

        let refreshBerjalan = null;

        async function apiDenganRefresh(path, opsi) {
          let res = await fetch(path, opsi);

          if (res.status === 401) {
            refreshBerjalan ??= refreshToken().finally(() => { refreshBerjalan = null; });
            await refreshBerjalan;                 // semua menunggu satu refresh yang sama
            res = await fetch(path, opsi);         // coba sekali lagi
          }

          return res;
        }
        `,
      ),

      h2('Yang tidak boleh dilakukan'),
      ol(
        '**Menaruh data rahasia di dalam JWT.** Payload-nya base64, bukan enkripsi — siapa pun bisa membacanya.',
        '**Mengandalkan `exp` di klien.** Server tetap wajib memverifikasi setiap permintaan.',
        '**Menyembunyikan tombol sebagai kontrol akses.** UI yang disembunyikan tetap bisa dipanggil lewat `curl`.',
        '**Menaruh kunci API di kode frontend.** Bundle klien bisa dibaca siapa pun — itu setara memublikasikannya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Bearer token rentan XSS; cookie `HttpOnly` rentan CSRF.',
        'Cookie `HttpOnly` + `SameSite` + anti-CSRF umumnya lebih aman untuk aplikasi web.',
        'Di mana pun token disimpan, XSS tetap bisa mencurinya — kecuali `HttpOnly`.',
        'Refresh token harus dijaga agar hanya satu yang berjalan pada satu waktu.',
        'JWT bisa dibaca siapa saja; jangan pernah menaruh rahasia di dalamnya.',
      ),
      references(
        {
          label: 'Using HTTP cookies',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies',
          source: 'MDN',
          note: 'Penanda `HttpOnly`, `Secure`, dan `SameSite` beserta perilaku bawaannya sekarang.',
        },
        {
          label: 'Authorization header',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Authorization',
          source: 'MDN',
          note: 'Bentuk baku `Bearer <token>` dan skema autentikasi lain yang tersedia.',
        },
        {
          label: 'Cross-Site Request Forgery Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Risiko utama pola cookie, beserta pola token anti-CSRF yang menutupnya.',
        },
        {
          label: 'JSON Web Token Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kesalahan JWT yang paling sering, termasuk menaruh data rahasia di payload.',
        },
        {
          label: 'RFC 6750: Bearer Token Usage',
          href: 'https://www.rfc-editor.org/rfc/rfc6750.html',
          source: 'IETF',
          note: 'Spesifikasi resminya, termasuk penegasan bahwa pembawa token diperlakukan sebagai pemiliknya.',
        },
      ),
    ],
  ),

  written(
    'web-storage',
    'Web Storage: `localStorage`, `sessionStorage`, IndexedDB',
    11,
    'Menyimpan data di browser — beserta batas yang sering ditemukan terlambat.',
    [
      terms(
        {
          term: 'Web Storage',
          meaning:
            'Nama payung untuk `localStorage` dan `sessionStorage`. Keduanya menyimpan data **di browser pengguna**, terikat pada satu origin — data yang disimpan situs A tidak akan pernah bisa dibaca situs B.',
        },
        {
          term: 'localStorage',
          meaning:
            'Penyimpanan yang isinya **bertahan sampai dihapus**, bahkan setelah browser ditutup dan komputer dimatikan. Kapasitasnya sekitar 5–10 MB. Dua batas yang sering ditemukan terlambat: **isinya hanya bisa berupa teks**, dan **API-nya sinkron** sehingga operasi besar memblokir tampilan.',
        },
        {
          term: 'sessionStorage',
          meaning:
            'Sama seperti `localStorage`, kecuali umurnya **hanya selama tab terbuka**. Perbedaan penting lainnya: tiap tab punya salinannya sendiri yang **tidak dibagi**. Cocok untuk keadaan sementara seperti langkah formulir bertahap.',
        },
        {
          term: 'IndexedDB',
          meaning:
            'Basis data di dalam browser yang jauh lebih mampu: kapasitas ratusan megabita, bisa menyimpan **objek, Blob, dan File** apa adanya tanpa diubah jadi teks, dan **asinkron** sehingga tidak memblokir tampilan. Harganya: API bawaannya rumit, sehingga hampir semua orang memakai pembungkus seperti `idb`.',
        },
        {
          term: 'serialize',
          meaning:
            'Mengubah data menjadi teks agar bisa disimpan. Karena Web Storage hanya menerima teks, objek **wajib** melewati `JSON.stringify` dulu. Menyimpannya langsung tidak melempar error — ia diam-diam tersimpan sebagai teks `[object Object]`, dan itulah yang membuat bug ini sulit dilacak.',
        },
        {
          term: 'quota',
          meaning:
            'Terjemahannya **jatah**. Batas ruang yang diberikan browser per origin. Melewatinya membuat penulisan **melempar `QuotaExceededError`** — dan karena penyimpanan sering dianggap pasti berhasil, kegagalan ini biasanya tidak ditangani siapa pun.',
        },
        {
          term: 'input tidak tepercaya',
          meaning:
            'Sikap yang wajib diambil terhadap isi Web Storage. Pengguna bisa mengubahnya kapan saja lewat DevTools, dan versi lama aplikasimu mungkin menyimpan bentuk yang berbeda. Karena itu hasil `JSON.parse` **wajib divalidasi bentuknya**, persis seperti data dari jaringan.',
        },
        {
          term: 'storage event',
          meaning:
            'Peristiwa yang berbunyi ketika `localStorage` diubah **dari tab lain** pada origin yang sama. Berguna untuk menyelaraskan keadaan antar-tab — misalnya logout di satu tab ikut melogout tab lainnya. Perhatikan: ia **tidak** berbunyi di tab yang melakukan perubahan itu sendiri.',
        },
        {
          term: 'PII',
          meaning:
            'Singkatan *Personally Identifiable Information*, artinya **data yang bisa mengidentifikasi seseorang**. Web Storage bukan tempatnya: isinya terbaca JavaScript mana pun di halaman itu, sehingga satu celah XSS sudah cukup untuk membocorkan semuanya.',
        },
      ),

      h2('Tiga pilihan'),
      table(
        ['', '`localStorage`', '`sessionStorage`', 'IndexedDB'],
        [
          ['Umur', 'Sampai dihapus', 'Sampai tab ditutup', 'Sampai dihapus'],
          ['Kapasitas', '±5–10 MB', '±5–10 MB', 'Ratusan MB'],
          ['API', 'Sinkron', 'Sinkron', '**Asinkron**'],
          ['Tipe data', 'String saja', 'String saja', 'Objek, Blob, File'],
          ['Antar tab', 'Dibagi', 'Terpisah', 'Dibagi'],
        ],
      ),

      h2('`localStorage`'),
      code(
        'js',
        `
        localStorage.setItem('tema', 'gelap');
        localStorage.getItem('tema');       // 'gelap'
        localStorage.getItem('tidakAda');   // null
        localStorage.removeItem('tema');
        localStorage.clear();

        // Hanya menyimpan string — objek harus di-serialize
        localStorage.setItem('pengguna', JSON.stringify({ nama: 'Zum' }));
        JSON.parse(localStorage.getItem('pengguna'));

        // Menyimpan objek langsung menghasilkan ini:
        localStorage.setItem('x', { a: 1 });
        localStorage.getItem('x');          // '[object Object]'
        `,
      ),

      h2('Tiga cara ia gagal'),
      code(
        'js',
        `
        function simpanAman(kunci, nilai) {
          try {
            localStorage.setItem(kunci, JSON.stringify(nilai));
            return true;
          } catch (error) {
            // 1. QuotaExceededError — penyimpanan penuh
            // 2. SecurityError — diblokir mode privat / pengaturan browser
            console.error('[storage] gagal menyimpan', error);
            return false;      // beri tahu pemanggil, jangan telan diam-diam
          }
        }

        function muatAman(kunci, cadangan) {
          try {
            const mentah = localStorage.getItem(kunci);
            if (mentah === null) return cadangan;
            return JSON.parse(mentah);
          } catch {
            // 3. JSON rusak — diedit tangan, atau sisa versi lama
            return cadangan;
          }
        }
        `,
      ),
      callout(
        'danger',
        'Data dari penyimpanan adalah input yang tidak tepercaya',
        'Ia bisa diedit lewat DevTools dalam sepuluh detik, tersisa dari versi aplikasi yang bentuk datanya berbeda, atau rusak sebagian. **Selalu validasi bentuknya setelah `JSON.parse`** — persis seperti pada respons API. Website ini melakukannya di `storageAdapter`-nya sendiri.',
      ),

      h2('Sinkron berarti memblokir'),
      code(
        'js',
        `
        // localStorage berjalan di thread yang sama dengan tampilan.
        // Menyimpan 5 MB akan membekukan halaman selama penulisan.
        // Untuk data besar atau sering berubah, pakai IndexedDB.
        `,
      ),

      h2('Sinkronisasi antar tab'),
      code(
        'js',
        `
        // Terpicu di tab LAIN saat localStorage berubah — bukan di tab yang mengubahnya
        window.addEventListener('storage', (e) => {
          if (e.key === 'tema') terapkanTema(e.newValue);
        });
        `,
      ),

      h2('IndexedDB, secukupnya'),
      code(
        'js',
        `
        // API bawaannya bertele-tele. Untuk pemakaian nyata, pustaka tipis
        // seperti 'idb' membungkusnya jadi Promise.
        import { openDB } from 'idb';

        const db = await openDB('app', 1, {
          upgrade(db) { db.createObjectStore('tugas', { keyPath: 'id' }); },
        });

        await db.put('tugas', { id: '1', judul: 'Belajar' });
        await db.get('tugas', '1');
        `,
      ),
      callout(
        'tip',
        'Kapan naik ke IndexedDB',
        'Saat kamu menyimpan lebih dari beberapa ratus kilobyte, menyimpan berkas atau gambar, atau butuh mencari dan mengurutkan data tersimpan. Selama datanya kecil dan berbentuk sederhana, `localStorage` lebih ringkas dan cukup.',
      ),

      h2('Yang TIDAK boleh disimpan'),
      ul(
        'Token autentikasi — bisa dibaca skrip mana pun (sub-bab 5.7).',
        'Kunci API atau rahasia apa pun.',
        'Data pribadi orang lain.',
        'Apa pun yang server harus percayai tanpa memverifikasinya ulang.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`localStorage` hanya menyimpan string — `JSON.stringify` dulu.',
        'Ia bisa gagal karena kuota penuh atau diblokir; tangani, jangan asumsikan berhasil.',
        'Validasi bentuk data setelah `JSON.parse` — ia input tidak tepercaya.',
        'API-nya sinkron dan memblokir tampilan; data besar sebaiknya ke IndexedDB.',
        'Event `storage` hanya terpicu di tab lain.',
      ),
      references(
        {
          label: 'Window.localStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
          source: 'MDN',
          note: 'Termasuk kapan penulisan bisa gagal dengan `QuotaExceededError`.',
        },
        {
          label: 'Window.sessionStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage',
          source: 'MDN',
          note: 'Menegaskan bahwa tiap tab punya salinannya sendiri yang tidak dibagi.',
        },
        {
          label: 'IndexedDB API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API',
          source: 'MDN',
          note: 'Untuk data besar, berkas, dan pencarian — asinkron sehingga tidak memblokir tampilan.',
        },
        {
          label: 'Window: storage event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event',
          source: 'MDN',
          note: 'Menyelaraskan keadaan antar-tab; tidak berbunyi di tab yang melakukan perubahan.',
        },
        {
          label: 'Storage for the web',
          href: 'https://web.dev/articles/storage-for-the-web',
          source: 'web.dev',
          note: 'Panduan memilih di antara ketiganya, beserta cara browser menentukan kuota.',
        },
      ),
    ],
  ),

  written(
    'web-api-lain',
    'Web API Lain: Clipboard, Geolocation, Notification, File',
    11,
    'Kemampuan browser di luar pengambilan data — dan pola izin yang berlaku untuk semuanya.',
    [
      p(
        'API berikut punya satu pola bersama: sebagian butuh **izin pengguna**, sebagian butuh **secure context** (HTTPS atau `localhost`), dan semuanya bisa ditolak. Kode yang menganggapnya selalu berhasil akan rusak di perangkat sungguhan.',
      ),

      terms(
        {
          term: 'secure context',
          meaning:
            'Terjemahannya **konteks aman**. Syarat bahwa halaman harus dimuat lewat **HTTPS** atau berjalan di `localhost`. Banyak API modern menolak bekerja di luar itu, dan alasannya masuk akal: kemampuan seperti membaca lokasi atau kamera tidak boleh dititipkan pada koneksi yang bisa disadap dan dipalsukan.',
        },
        {
          term: 'izin',
          meaning:
            'Dari *permission*. Persetujuan yang harus diberikan pengguna sebelum sebuah kemampuan bisa dipakai. Tiga keadaannya: `granted` (diizinkan), `denied` (ditolak), dan `prompt` (belum ditanya). Yang wajib diingat: **penolakan bersifat menetap** — sekali ditolak, browser tidak akan bertanya lagi sampai pengguna mengubahnya sendiri dari pengaturan.',
        },
        {
          term: 'user gesture',
          meaning:
            'Terjemahannya **tindakan langsung pengguna** — klik, ketukan, atau tekanan tombol. Sebagian API **hanya boleh dipanggil dari dalam penangan peristiwa semacam itu**, bukan dari `setTimeout` atau saat halaman dimuat. Aturan ini ada untuk mencegah situs menyalin papan klip atau meminta izin tanpa sebab yang terlihat pengguna.',
        },
        {
          term: 'navigator',
          meaning:
            'Objek browser yang menjadi **pintu masuk sebagian besar kemampuan perangkat**: `navigator.clipboard`, `navigator.geolocation`, `navigator.mediaDevices`. Namanya warisan sejarah dari Netscape Navigator, dan sudah terlanjur menjadi standar.',
        },
        {
          term: 'Clipboard API',
          meaning:
            'Kemampuan membaca dan menulis **papan klip** (tempat hasil salin-tempel). Menulis relatif mudah; **membaca** jauh lebih dibatasi karena isinya bisa saja berupa kata sandi yang baru disalin pengguna dari aplikasi lain.',
        },
        {
          term: 'Geolocation API',
          meaning:
            'Kemampuan membaca **posisi geografis** perangkat. Selalu butuh izin, selalu butuh secure context, dan **selalu bisa ditolak atau gagal** — pengguna bisa menolak, GPS bisa tidak tersedia, atau pembacaan bisa habis waktu. Ketiga kemungkinan itu wajib ditangani.',
        },
        {
          term: 'Notification API',
          meaning:
            'Kemampuan menampilkan pemberitahuan sistem di luar halaman. Aturan tak tertulis yang penting: **jangan meminta izinnya saat halaman baru dibuka**. Pengguna yang belum tahu situsmu untuk apa hampir pasti menolak, dan penolakan itu menetap.',
        },
        {
          term: 'File API',
          meaning:
            'Kumpulan kemampuan membaca berkas yang dipilih pengguna — `File`, `FileReader`, `Blob`. Perlu ditegaskan: ia hanya bisa membaca berkas yang **secara sadar dipilih pengguna** lewat dialog atau seret-lepas, bukan menjelajahi berkas di komputernya.',
        },
        {
          term: 'Blob',
          meaning:
            'Singkatan *Binary Large Object*. Wadah untuk data biner mentah — isi gambar, berkas PDF, potongan video. `File` sebenarnya adalah `Blob` yang diberi nama dan tanggal.',
        },
        {
          term: 'progressive enhancement',
          meaning:
            'Terjemahannya **peningkatan bertahap**. Prinsip membangun agar fungsi dasarnya tetap berjalan tanpa kemampuan tambahan, lalu memperkayanya kalau kemampuan itu tersedia. Wujud praktisnya di sub-bab ini: **selalu periksa keberadaan API dulu**, dan sediakan jalan lain saat izinnya ditolak.',
        },
      ),

      h2('Clipboard'),
      code(
        'js',
        `
        async function salin(teks) {
          try {
            if (!navigator.clipboard) throw new Error('Clipboard API tidak tersedia');
            await navigator.clipboard.writeText(teks);
            return true;
          } catch {
            return false;      // beri umpan balik, jangan pura-pura berhasil
          }
        }
        `,
      ),
      callout(
        'warning',
        'Dua syarat yang sering terlupa',
        'Clipboard API butuh **secure context** (HTTPS atau `localhost`) dan biasanya harus dipicu oleh **tindakan pengguna** — di dalam handler klik, bukan di dalam `setTimeout` atau saat halaman dimuat. Tombol salin di website ini menangani kedua kegagalan itu secara eksplisit.',
      ),

      h2('Geolocation'),
      code(
        'js',
        `
        function posisi() {
          return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Perangkat ini tidak mendukung geolokasi'));
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              (err) => {
                const pesan = {
                  1: 'Izin lokasi ditolak.',
                  2: 'Lokasi tidak bisa ditentukan.',
                  3: 'Permintaan lokasi habis waktu.',
                }[err.code];
                reject(new Error(pesan ?? 'Gagal mengambil lokasi.'));
              },
              { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
            );
          });
        }
        `,
      ),
      callout(
        'tip',
        'Minta izin saat pengguna paham kenapa',
        'Meminta lokasi begitu halaman terbuka hampir selalu ditolak — dan penolakan itu **permanen** sampai pengguna mengubahnya di pengaturan browser. Minta saat ia menekan "Cari yang terdekat", bukan sebelumnya.',
      ),

      h2('Notification'),
      code(
        'js',
        `
        async function beriTahu(judul, isi) {
          if (!('Notification' in window)) return;

          if (Notification.permission === 'denied') return;   // hormati penolakan

          if (Notification.permission === 'default') {
            const hasil = await Notification.requestPermission();
            if (hasil !== 'granted') return;
          }

          new Notification(judul, { body: isi });
        }
        `,
      ),

      h2('File API'),
      code(
        'js',
        `
        // Membaca isi berkas tanpa mengunggahnya
        const teks = await file.text();
        const buffer = await file.arrayBuffer();

        // Drag and drop
        zona.addEventListener('dragover', (e) => e.preventDefault());   // WAJIB
        zona.addEventListener('drop', (e) => {
          e.preventDefault();
          for (const file of e.dataTransfer.files) proses(file);
        });
        `,
      ),

      h2('Memeriksa izin lebih dulu'),
      code(
        'js',
        `
        const status = await navigator.permissions.query({ name: 'geolocation' });
        status.state;   // 'granted' | 'denied' | 'prompt'

        status.addEventListener('change', () => perbaruiTampilan(status.state));
        `,
      ),

      h2('Pola yang berlaku untuk semuanya'),
      ol(
        '**Periksa keberadaannya** — `if (!navigator.clipboard) return;`',
        '**Minta izin saat relevan**, bukan saat halaman dimuat.',
        '**Tangani penolakan** dengan jalur alternatif, bukan dengan pesan buntu.',
        '**Jangan pernah menganggapnya berhasil** — semuanya bisa gagal di perangkat sungguhan.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Clipboard butuh secure context dan pemicu dari tindakan pengguna.',
        'Izin yang ditolak bersifat permanen sampai pengguna mengubahnya sendiri.',
        'Minta izin saat pengguna sudah paham kenapa ia dibutuhkan.',
        '`dragover` wajib di-`preventDefault` agar `drop` terpicu.',
        'Semua API ini bisa gagal — sediakan jalur alternatif.',
      ),
      references(
        {
          label: 'Secure contexts',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts',
          source: 'MDN',
          note: 'Daftar API yang mensyaratkannya, beserta alasan `localhost` ikut dianggap aman.',
        },
        {
          label: 'Permissions API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API',
          source: 'MDN',
          note: 'Memeriksa keadaan izin tanpa memicu dialog — `granted`, `denied`, atau `prompt`.',
        },
        {
          label: 'Clipboard API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
          source: 'MDN',
          note: 'Termasuk syarat secure context dan pemicu dari tindakan langsung pengguna.',
        },
        {
          label: 'Geolocation API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API',
          source: 'MDN',
          note: 'Ketiga jalur kegagalan yang wajib ditangani: ditolak, tidak tersedia, dan habis waktu.',
        },
        {
          label: 'Notification permissions best practices',
          href: 'https://web.dev/articles/push-notifications-permissions-ux',
          source: 'web.dev',
          note: 'Alasan meminta izin saat halaman dibuka hampir selalu berakhir dengan penolakan permanen.',
        },
      ),
    ],
  ),

  written(
    'realtime',
    'Realtime: WebSocket & Server-Sent Events',
    12,
    'Ketika server perlu mengirim lebih dulu, tanpa diminta.',
    [
      p(
        'HTTP biasa selalu dimulai klien. Untuk notifikasi, chat, atau angka yang berubah sendiri, server yang perlu memulai — dan ada tiga tingkat solusi.',
      ),

      terms(
        {
          term: 'realtime',
          meaning:
            'Terjemahannya **waktu nyata**. Keadaan ketika pembaruan sampai ke pengguna **segera setelah terjadi**, bukan menunggu ia menyegarkan halaman. Perlu diluruskan: "realtime" di web hampir tidak pernah berarti seketika secara harfiah — yang dimaksud adalah cukup cepat sehingga terasa langsung.',
        },
        {
          term: 'polling',
          meaning:
            'Terjemahannya **menanyai berulang**. Klien bertanya ke server setiap sekian detik, entah ada perubahan atau tidak. Terdengar primitif, tapi **sering justru jawaban yang benar**: jauh lebih sedikit yang bisa rusak, lewat proxy dan firewall mana pun, dan tidak butuh infrastruktur khusus.',
        },
        {
          term: 'long polling',
          meaning:
            'Varian di mana server **menahan permintaan** sampai ada kabar baru, baru kemudian menjawab. Mengurangi permintaan sia-sia dibanding polling biasa, dengan harga koneksi yang menggantung lebih lama.',
        },
        {
          term: 'SSE',
          meaning:
            'Singkatan *Server-Sent Events*, terjemahannya **peristiwa yang dikirim server**. Aliran **satu arah** dari server ke klien lewat HTTP biasa. Dua keunggulan praktisnya sering diremehkan: ia **menyambung ulang otomatis** saat koneksi putus, dan karena tetap HTTP biasa, ia melewati proxy tanpa masalah.',
        },
        {
          term: 'EventSource',
          meaning:
            'Objek browser untuk membuka koneksi SSE: `new EventSource("/api/aliran")`. Penyambungan ulang sudah tertanam di dalamnya — kamu tidak perlu menulis logika apa pun untuk itu.',
        },
        {
          term: 'WebSocket',
          meaning:
            'Protokol **dua arah** yang membuka saluran tetap antara klien dan server, sehingga keduanya bisa mengirim kapan saja. Harganya nyata: protokolnya sendiri (bukan HTTP), penyambungan ulang **harus kamu tulis sendiri**, dan sebagian proxy perusahaan memblokirnya.',
        },
        {
          term: 'handshake',
          meaning:
            'Terjemahannya **jabat tangan**. Proses pembuka koneksi WebSocket, yang justru dimulai sebagai permintaan HTTP biasa berisi permintaan naik tingkat (`Upgrade: websocket`). Setelah server menyetujuinya, koneksi yang sama beralih ke protokol WebSocket.',
        },
        {
          term: 'wss://',
          meaning:
            'Skema alamat WebSocket **terenkripsi**, padanan `https://`. Selalu pakai ini di produksi — `ws://` mengirim seluruh pesan dalam bentuk terbaca, dan banyak browser menolaknya dari halaman HTTPS.',
        },
        {
          term: 'heartbeat',
          meaning:
            'Terjemahannya **denyut jantung**. Pesan kecil yang dikirim berkala untuk **memastikan koneksi masih hidup**. Dibutuhkan karena koneksi yang mati diam-diam — misalnya diputus perantara jaringan — sering tidak memicu peristiwa `close` sama sekali.',
        },
        {
          term: 'backpressure',
          meaning:
            'Terjemahannya **tekanan balik**. Keadaan ketika pesan datang lebih cepat daripada kemampuan penerima mengolahnya. Pada aliran realtime yang ramai, ini menumpuk di memori dan akhirnya membuat tab berat — sehingga pembatasan laju perlu dipikirkan sejak awal.',
        },
      ),

      h2('Tiga pendekatan'),
      table(
        ['', 'Polling', 'SSE', 'WebSocket'],
        [
          ['Arah', 'Klien bertanya', 'Server → klien', '**Dua arah**'],
          ['Protokol', 'HTTP biasa', 'HTTP biasa', 'Protokol sendiri'],
          ['Sambung ulang otomatis', 'Tidak perlu', '**Ya, bawaan**', 'Harus ditulis sendiri'],
          ['Melewati proxy/firewall', 'Selalu', 'Biasanya', 'Kadang bermasalah'],
          ['Kerumitan', 'Paling rendah', 'Rendah', 'Tinggi'],
        ],
      ),
      callout(
        'tip',
        'Mulai dari yang paling sederhana',
        'Kalau pembaruan setiap 30 detik sudah cukup, polling biasa adalah jawaban yang benar — dan jauh lebih sedikit yang bisa rusak. Naik ke SSE kalau butuh lebih cepat dan arahnya satu; naik ke WebSocket hanya kalau klien juga perlu mengirim terus-menerus.',
      ),

      h2('Server-Sent Events'),
      code(
        'js',
        `
        const sumber = new EventSource('/api/aliran');

        sumber.addEventListener('message', (e) => {
          const data = JSON.parse(e.data);
          tampilkan(data);
        });

        sumber.addEventListener('notifikasi', (e) => {   // event bernama
          beriTahu(JSON.parse(e.data));
        });

        sumber.addEventListener('error', () => {
          // EventSource menyambung ulang SENDIRI — jangan buru-buru menutupnya
          if (sumber.readyState === EventSource.CLOSED) tampilkan('Koneksi terputus.');
        });

        // Wajib saat halaman/komponen ditinggalkan
        sumber.close();
        `,
      ),

      h2('WebSocket'),
      code(
        'js',
        `
        const ws = new WebSocket('wss://contoh.id/soket');

        ws.addEventListener('open', () => ws.send(JSON.stringify({ tipe: 'gabung', ruang: 'a' })));

        ws.addEventListener('message', (e) => {
          const pesan = JSON.parse(e.data);
          tampilkan(pesan);
        });

        ws.addEventListener('close', (e) => {
          console.log('tertutup', e.code, e.wasClean);
        });

        ws.addEventListener('error', () => tampilkan('Koneksi bermasalah.'));

        ws.close(1000, 'selesai');
        `,
      ),
      callout(
        'warning',
        'Selalu `wss://`, tidak pernah `ws://`',
        '`ws://` tidak terenkripsi, dan halaman HTTPS akan memblokirnya sebagai mixed content. Sama seperti `https`, ini bukan opsional di produksi.',
      ),

      h2('Menyambung ulang — yang harus kamu tulis sendiri'),
      code(
        'js',
        `
        function sambung(url, { onPesan }) {
          let ws;
          let percobaan = 0;
          let sengajaDitutup = false;

          function buka() {
            ws = new WebSocket(url);

            ws.addEventListener('open', () => { percobaan = 0; });
            ws.addEventListener('message', (e) => onPesan(JSON.parse(e.data)));

            ws.addEventListener('close', () => {
              if (sengajaDitutup) return;

              // Backoff eksponensial + jitter — pola yang sama dengan sub-bab 3.9
              const jeda = Math.min(30_000, 1000 * 2 ** percobaan) * (0.5 + Math.random());
              percobaan++;
              setTimeout(buka, jeda);
            });
          }

          buka();

          return () => { sengajaDitutup = true; ws?.close(1000); };
        }
        `,
      ),

      h2('Yang sering terlupa'),
      ol(
        '**Tutup koneksi** saat halaman atau komponen ditinggalkan — kalau tidak, ia terus hidup.',
        '**Data yang masuk tetap input tidak tepercaya.** Validasi bentuknya, dan jangan pernah merendernya sebagai HTML.',
        '**Autentikasi tetap wajib.** WebSocket tidak otomatis membawa identitas — kirim token saat handshake atau pesan pertama.',
        '**Tangani keadaan terputus di UI.** Pengguna harus tahu kalau angka yang dilihatnya sudah basi.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Polling dulu; SSE untuk satu arah; WebSocket hanya kalau dua arah benar-benar dibutuhkan.',
        'SSE menyambung ulang sendiri; WebSocket tidak.',
        'Selalu `wss://` di produksi.',
        'Selalu tutup koneksi saat ditinggalkan.',
        'Pesan masuk adalah input tidak tepercaya — validasi, jangan render sebagai HTML.',
      ),
      references(
        {
          label: 'Server-sent events',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events',
          source: 'MDN',
          note: 'Termasuk penyambungan ulang otomatis yang menjadi keunggulan utamanya atas WebSocket.',
        },
        {
          label: 'The WebSocket API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket_API',
          source: 'MDN',
          note: 'Siklus hidup koneksi dan kode penutupan — dasar logika sambung ulang di atas.',
        },
        {
          label: 'EventSource',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/EventSource',
          source: 'MDN',
          note: 'Antarmuka SSE di sisi klien, termasuk penanganan `error` dan `open`.',
        },
        {
          label: 'RFC 6455: The WebSocket Protocol',
          href: 'https://www.rfc-editor.org/rfc/rfc6455.html',
          source: 'IETF',
          note: 'Spesifikasi handshake yang menjelaskan kenapa koneksinya dimulai sebagai HTTP.',
        },
        {
          label: 'WebSocket Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alasan WebSocket wajib punya autentikasi sendiri dan kenapa `wss://` tidak opsional.',
        },
      ),
    ],
  ),

  written(
    'wrapper-fetch',
    'Membungkus `fetch` dengan Rapi',
    12,
    'Satu tempat untuk base URL, timeout, retry, bentuk error, dan header.',
    [
      p(
        'Setelah sepuluh pemanggilan `fetch` tersebar di seluruh aplikasi, kamu akan menemukan timeout yang lupa dipasang di tiga tempat dan penanganan 401 yang berbeda-beda. Satu pembungkus menyelesaikan itu — dan menjadi tempat tunggal untuk memperbaikinya.',
      ),

      terms(
        {
          term: 'wrapper',
          meaning:
            'Terjemahannya **pembungkus**. Satu fungsi yang menyelimuti `fetch` dan menampung semua urusan berulang: base URL, header baku, timeout, penanganan `401`, dan bentuk error. Nilainya bukan menghemat ketikan — nilainya adalah **satu tempat untuk memperbaiki**, alih-alih sepuluh tempat yang perlu diingat semuanya.',
        },
        {
          term: 'base URL',
          meaning:
            'Awalan alamat yang sama untuk seluruh pemanggilan API, misalnya `/api` atau `https://api.contoh.id/v1`. Menaruhnya di satu tempat membuat perpindahan antara lingkungan pengembangan dan produksi cukup mengubah satu nilai.',
        },
        {
          term: 'error terstruktur',
          meaning:
            'Kelas error buatan sendiri seperti `ApiError` yang **membawa keterangan tambahan** selain pesan: `status`, `kode` dari server, dan `detail` error per field. Ini yang memungkinkan pemanggil bereaksi berbeda untuk tiap kasus tanpa mencocokkan teks pesan — pencocokan teks selalu rusak begitu kalimatnya diubah sedikit.',
        },
        {
          term: 'interceptor',
          meaning:
            'Terjemahannya **pencegat**. Fungsi yang berjalan **sebelum setiap permintaan** atau **sesudah setiap jawaban**, sehingga bisa menyisipkan token, mencatat, atau menangani `401` secara terpusat. Istilah ini berasal dari pustaka seperti Axios, tapi polanya bisa kamu tulis sendiri dengan mudah.',
        },
        {
          term: 'single-flight',
          meaning:
            'Terjemahan bebasnya **satu penerbangan saja**. Aturan bahwa hanya boleh ada **satu** proses penyegaran token yang berjalan pada satu waktu. Tanpa itu, lima permintaan yang bersamaan menerima `401` akan memicu lima penyegaran sekaligus — dan sebagian di antaranya membatalkan hasil yang lain.',
        },
        {
          term: 'idempoten (di wrapper)',
          meaning:
            'Syarat sebelum sebuah permintaan boleh diulang otomatis oleh wrapper. Aman untuk `GET`, `PUT`, dan `DELETE`; **berbahaya untuk `POST`**, karena pengulangan bisa menghasilkan dua data. Karena itu logika retry di wrapper wajib memeriksa method-nya, bukan hanya statusnya.',
        },
        {
          term: 'AbortSignal.any',
          meaning:
            'Menggabungkan beberapa signal menjadi satu, sehingga permintaan batal kalau **salah satunya** memicu pembatalan. Dipakai untuk menggabungkan timeout bawaan wrapper dengan signal pembatalan milik pemanggil, tanpa salah satunya harus mengalah.',
        },
        {
          term: 'kontrak',
          meaning:
            'Kesepakatan tentang **apa yang dijanjikan** sebuah fungsi kepada pemanggilnya: bentuk nilai kembalian, jenis error yang mungkin dilempar, dan perilaku pada kasus khusus. Wrapper yang baik punya kontrak yang jelas — misalnya "selalu melempar `ApiError`, tidak pernah `TypeError` mentah".',
        },
      ),

      h2('Bentuk error yang seragam'),
      code(
        'js',
        `
        export class ApiError extends Error {
          constructor(pesan, { status, kode, detail } = {}) {
            super(pesan);
            this.name = 'ApiError';
            this.status = status;
            this.kode = kode;         // kode dari server, mis. 'EMAIL_TERPAKAI'
            this.detail = detail;     // error per field untuk form
          }

          get bisaDiulang() {
            return this.status === undefined || this.status === 429 || this.status >= 500;
          }
        }
        `,
        { filename: 'src/lib/api-error.js' },
      ),

      h2('Pembungkusnya'),
      code(
        'js',
        `
        import { ApiError } from './api-error.js';

        const BASE = '/api';
        const TIMEOUT = 10_000;

        async function minta(path, { method = 'GET', body, headers, signal, ...sisa } = {}) {
          const opsi = {
            method,
            headers: { Accept: 'application/json', ...headers },
            signal: signal ?? AbortSignal.timeout(TIMEOUT),
            ...sisa,
          };

          // FormData mengatur Content-Type-nya sendiri — jangan disentuh
          if (body instanceof FormData) {
            opsi.body = body;
          } else if (body !== undefined) {
            opsi.headers['Content-Type'] = 'application/json';
            opsi.body = JSON.stringify(body);
          }

          let res;
          try {
            res = await fetch(BASE + path, opsi);
          } catch (error) {
            if (error.name === 'AbortError') throw error;          // pembatalan disengaja
            throw new ApiError(
              error.name === 'TimeoutError'
                ? 'Server tidak menjawab tepat waktu.'
                : 'Tidak bisa terhubung ke server.',
            );
          }

          if (!res.ok) throw await bacaError(res);
          if (res.status === 204) return null;

          const tipe = res.headers.get('content-type') ?? '';
          return tipe.includes('json') ? res.json() : res.text();
        }

        async function bacaError(res) {
          let body = null;
          try {
            const tipe = res.headers.get('content-type') ?? '';
            if (tipe.includes('json')) body = await res.json();
          } catch {
            // body rusak — jangan sampai ini menutupi status aslinya
          }

          return new ApiError(body?.message ?? \`Permintaan gagal (\${res.status})\`, {
            status: res.status,
            kode: body?.code,
            detail: body?.errors,
          });
        }

        export const api = {
          get:    (p, o)    => minta(p, { ...o, method: 'GET' }),
          post:   (p, b, o) => minta(p, { ...o, method: 'POST', body: b }),
          patch:  (p, b, o) => minta(p, { ...o, method: 'PATCH', body: b }),
          delete: (p, o)    => minta(p, { ...o, method: 'DELETE' }),
        };
        `,
        { filename: 'src/lib/api.js' },
      ),

      h2('Memakainya'),
      code(
        'js',
        `
        import { api } from './lib/api.js';
        import { ApiError } from './lib/api-error.js';

        try {
          const tugas = await api.get('/tugas?status=aktif');
          const baru = await api.post('/tugas', { judul: 'Belajar' });
        } catch (error) {
          if (error.name === 'AbortError') return;

          if (error instanceof ApiError && error.detail) {
            tampilkanErrorForm(error.detail);      // error per field
          } else {
            tampilkanError(error.message);
          }
        }
        `,
      ),

      h2('Menambah retry'),
      code(
        'js',
        `
        async function mintaDenganRetry(path, opsi, maksimal = 2) {
          for (let percobaan = 0; ; percobaan++) {
            try {
              return await minta(path, opsi);
            } catch (error) {
              const layak = error instanceof ApiError && error.bisaDiulang;
              if (!layak || percobaan >= maksimal) throw error;

              await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 * 2 ** percobaan),
              );
            }
          }
        }
        `,
      ),
      callout(
        'warning',
        'Jangan ulangi otomatis untuk `POST`',
        'Permintaan pertama mungkin **berhasil** dan hanya responsnya yang hilang — mengulangnya membuat data ganda. Batasi retry otomatis ke `GET`, atau kirim `Idempotency-Key` (Backend Intermediate 1.7).',
      ),

      h2('Kapan berhenti menulis sendiri'),
      p(
        'Pembungkus di atas cukup untuk aplikasi kecil sampai menengah. Begitu kamu butuh cache, deduplikasi permintaan yang sama, revalidasi otomatis, dan optimistic update — itu adalah **server state**, dan menulisnya sendiri berarti membangun ulang TanStack Query. Dibahas di Frontend Intermediate Bab 5.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Satu pembungkus = satu tempat untuk timeout, header, dan bentuk error.',
        'Kelas `ApiError` sendiri membuat pemanggil bisa membedakan jenis kegagalan.',
        'Jangan sentuh `Content-Type` saat body-nya `FormData`.',
        '`204` tidak punya body.',
        'Retry otomatis hanya untuk `GET`, kecuali ada idempotency key.',
      ),
      references(
        {
          label: 'Error: cause',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause',
          source: 'MDN',
          note: 'Menjaga penyebab asli tetap terbaca saat wrapper membungkusnya jadi `ApiError`.',
        },
        {
          label: 'extends',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends',
          source: 'MDN',
          note: 'Dasar pembuatan `class ApiError extends Error` — pola yang sama dengan Sub-bab 2.7.',
        },
        {
          label: 'AbortSignal: any() static method',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static',
          source: 'MDN',
          note: 'Menggabungkan timeout wrapper dengan signal pembatalan milik pemanggil.',
        },
        {
          label: 'Idempotency-Key Header Field',
          href: 'https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-idempotency-key-header',
          source: 'IETF',
          note: 'Syarat agar `POST` pun aman diulang otomatis oleh wrapper.',
        },
        {
          label: '429 Too Many Requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
          source: 'MDN',
          note: 'Salah satu status yang dianggap `bisaDiulang` oleh `ApiError` di atas.',
        },
      ),
    ],
  ),

  written(
    'praktik-konsumsi-api',
    'Praktik: Konsumsi REST API dengan empat keadaan UI',
    16,
    'Menggabungkan fetch, DOM, dan penanganan error menjadi tampilan yang jujur.',
    [
      p(
        'Praktik penutup Bab 5. Kamu akan membangun daftar yang mengambil data dari API sungguhan, menangani **keempat keadaan UI**, membatalkan pencarian yang sudah usang, dan tidak pernah berbohong tentang apa yang sedang terjadi.',
      ),

      terms(
        {
          term: 'empat keadaan UI',
          meaning:
            'Setiap tampilan yang mengambil data punya **empat** kemungkinan keadaan, bukan satu: **memuat**, **kosong**, **gagal**, dan **berhasil**. Melewatkan tiga di antaranya adalah cacat yang paling sering sampai ke produksi — hampir semua tutorial hanya menunjukkan yang terakhir.',
        },
        {
          term: 'skeleton',
          meaning:
            'Terjemahannya **kerangka**. Bentuk abu-abu yang menyerupai isi sebenarnya, ditampilkan selama memuat. Keunggulannya atas pemutar berputar bukan sekadar estetika: ia **memesan ruang** dengan ukuran yang mendekati isi akhir, sehingga tata letak tidak melompat saat datanya tiba.',
        },
        {
          term: 'layout shift',
          meaning:
            'Terjemahannya **pergeseran tata letak**. Isi halaman yang melompat karena sesuatu muncul dan mendorong yang lain. Sangat mengganggu — pengguna bisa salah menekan tombol karena posisinya berubah tepat saat ia mengklik.',
        },
        {
          term: 'keadaan kosong',
          meaning:
            'Terjemahan dari *empty state*. Wajib menjelaskan **kenapa** kosong dan memberi **satu langkah lanjutan**. Perhatikan bahwa penyebabnya bisa berbeda: belum ada data sama sekali, atau ada tapi tidak cocok dengan saringan — dan keduanya butuh pesan yang berbeda.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunda sebuah aksi sampai pemicunya berhenti berdatangan. Pada kotak pencarian, ia mencegah sepuluh huruf menghasilkan sepuluh permintaan. Dipasangkan dengan pembatalan, ia juga menutup masalah respons lama yang menimpa hasil baru.',
        },
        {
          term: 'race condition (di UI)',
          meaning:
            'Respons untuk kata kunci **lama** tiba setelah respons kata kunci baru, lalu menimpanya di layar. Pengguna melihat hasil untuk sesuatu yang sudah tidak ia ketik. Obatnya sudah kamu pelajari di Sub-bab 3.8: batalkan permintaan sebelumnya sebelum mengirim yang baru.',
        },
        {
          term: 'aria-busy',
          meaning:
            'Atribut yang memberi tahu pembaca layar bahwa sebuah area **sedang diperbarui**, sehingga ia tidak membacakan isi setengah jadi. Dipasangkan dengan `aria-live` untuk mengumumkan hasilnya setelah selesai.',
        },
        {
          term: 'jujur',
          meaning:
            'Prinsip yang mendasari seluruh praktik ini: tampilan **tidak boleh menyembunyikan keadaan sebenarnya**. Layar kosong tanpa penjelasan tidak bisa dibedakan dari aplikasi yang rusak, dan pengguna akan menganggapnya rusak. Menampilkan kegagalan dengan jelas lebih baik daripada terlihat rapi tapi menyesatkan.',
        },
      ),

      h2('Empat keadaan — bukan satu'),
      table(
        ['Keadaan', 'Yang wajib ditampilkan'],
        [
          ['**Memuat**', 'Indikator yang **memesan ruang**, supaya tata letak tidak melompat'],
          ['**Kosong**', 'Sebabnya, plus satu langkah lanjutan yang jelas'],
          ['**Gagal**', 'Pesan yang bisa ditindaklanjuti + tombol coba lagi'],
          ['**Berhasil**', 'Datanya'],
        ],
      ),
      callout(
        'danger',
        'Melewatkan tiga di antaranya adalah cacat yang paling sering sampai produksi',
        'Hampir semua tutorial hanya menunjukkan keadaan berhasil. Halaman yang kosong tanpa penjelasan tidak bisa dibedakan dari halaman yang rusak — dan pengguna akan menganggapnya rusak.',
      ),

      h2('1. Struktur'),
      code(
        'html',
        `
        <section>
          <label for="cari" class="sr-only">Cari</label>
          <input id="cari" type="search" autocomplete="off" spellcheck="false"
                 placeholder="Cari pengguna…" />

          <div id="wadah" aria-live="polite" aria-busy="false"></div>
        </section>
        `,
      ),
      callout(
        'tip',
        '`aria-live` dan `aria-busy` bukan hiasan',
        'Tanpanya, pengguna screen reader tidak tahu bahwa isi wadah baru saja berubah dari "memuat" menjadi "12 hasil". Keduanya adalah cara memberi tahu perubahan yang terjadi tanpa memindahkan fokus.',
      ),

      h2('2. Satu fungsi render untuk semua keadaan'),
      code(
        'js',
        `
        const wadah = document.querySelector('#wadah');

        function render(keadaan) {
          wadah.replaceChildren();
          wadah.setAttribute('aria-busy', String(keadaan.status === 'memuat'));

          if (keadaan.status === 'memuat') {
            for (let i = 0; i < 5; i++) {
              const baris = document.createElement('div');
              baris.className = 'skeleton';      // tinggi SAMA dengan baris asli
              wadah.append(baris);
            }
            return;
          }

          if (keadaan.status === 'gagal') {
            const kotak = document.createElement('div');
            kotak.className = 'error';
            kotak.setAttribute('role', 'alert');

            const pesan = document.createElement('p');
            pesan.textContent = keadaan.pesan;

            const ulang = document.createElement('button');
            ulang.type = 'button';
            ulang.textContent = 'Coba lagi';
            ulang.addEventListener('click', () => muat(terakhirDicari));

            kotak.append(pesan, ulang);
            wadah.append(kotak);
            return;
          }

          if (keadaan.data.length === 0) {
            const kosong = document.createElement('p');
            kosong.className = 'kosong';
            kosong.textContent = terakhirDicari
              ? \`Tidak ada hasil untuk "\${terakhirDicari}". Coba kata kunci lain.\`
              : 'Belum ada data. Mulai mengetik untuk mencari.';
            wadah.append(kosong);
            return;
          }

          const fragment = document.createDocumentFragment();
          for (const item of keadaan.data) fragment.append(buatBaris(item));
          wadah.append(fragment);
        }
        `,
      ),

      h2('3. Mengambil data, dengan pembatalan'),
      code(
        'js',
        `
        let kontrolAktif = null;
        let terakhirDicari = '';

        async function muat(kata) {
          terakhirDicari = kata;

          kontrolAktif?.abort();                 // batalkan pencarian sebelumnya
          kontrolAktif = new AbortController();

          render({ status: 'memuat' });

          try {
            const url = new URL('https://jsonplaceholder.typicode.com/users');
            if (kata) url.searchParams.set('q', kata);

            const res = await fetch(url, {
              signal: AbortSignal.any([
                kontrolAktif.signal,
                AbortSignal.timeout(10_000),
              ]),
            });

            if (!res.ok) throw new Error(\`Server balas \${res.status}\`);

            const semua = await res.json();

            // API contoh ini tidak menyaring — kita saring di klien
            const data = kata
              ? semua.filter((u) => u.name.toLowerCase().includes(kata.toLowerCase()))
              : semua;

            render({ status: 'berhasil', data });
          } catch (error) {
            if (error.name === 'AbortError') return;    // digantikan pencarian baru

            console.error('[muat]', error);

            render({
              status: 'gagal',
              pesan:
                error.name === 'TimeoutError'
                  ? 'Server tidak menjawab. Periksa koneksimu lalu coba lagi.'
                  : 'Gagal memuat data. Coba lagi sebentar.',
            });
          }
        }
        `,
      ),

      h2('4. Debounce pada input'),
      code(
        'js',
        `
        function debounce(fn, jeda) {
          let timer;
          return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), jeda);
          };
        }

        const cariTertunda = debounce((kata) => muat(kata), 300);

        document.querySelector('#cari').addEventListener('input', (e) => {
          cariTertunda(e.target.value.trim());
        });

        muat('');   // muat awal
        `,
      ),
      callout(
        'info',
        'Debounce dan pembatalan menyelesaikan masalah berbeda',
        '**Debounce** mengurangi jumlah permintaan yang dikirim. **Pembatalan** memastikan respons yang sudah usang tidak menimpa yang baru. Kamu butuh keduanya: debounce saja masih bisa menghasilkan dua permintaan yang tiba tidak berurutan.',
      ),

      h2('5. Baris yang aman'),
      code(
        'js',
        `
        function buatBaris(pengguna) {
          const li = document.createElement('li');
          li.dataset.id = pengguna.id;

          const nama = document.createElement('strong');
          nama.textContent = pengguna.name;       // AMAN — bukan innerHTML

          const email = document.createElement('span');
          email.textContent = pengguna.email;

          li.append(nama, ' — ', email);
          return li;
        }
        `,
      ),
      callout(
        'warning',
        'Data dari API adalah input tidak tepercaya',
        'Nama pengguna itu diketik seseorang. Kalau ia berisi `<img src=x onerror=...>` dan kamu memakai `innerHTML`, skripnya berjalan di browser pembacamu. `textContent` menutup jalur itu sepenuhnya.',
      ),

      checklist(
        'frontend-basic/ajax-web-api/praktik',
        'Checklist praktik 5.12',
        'Keempat keadaan UI ditangani: memuat, kosong, gagal, berhasil',
        'Skeleton memesan tinggi yang sama dengan baris asli — tata letak tidak melompat',
        'Dua keadaan kosong dibedakan: belum mencari vs tidak ada hasil',
        'Keadaan gagal punya pesan yang bisa ditindaklanjuti dan tombol coba lagi',
        'Pencarian lama dibatalkan; `AbortError` tidak ditampilkan sebagai error',
        'Ada timeout pada setiap permintaan',
        'Input di-debounce, dan pembatalan tetap dipasang',
        'Tidak ada satu pun `innerHTML` untuk data dari API',
        '`aria-live` dan `aria-busy` dipasang pada wadah hasil',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Empat keadaan UI adalah kewajiban, bukan kemewahan.',
        'Skeleton harus memesan ruang, bukan sekadar berputar.',
        'Bedakan "belum mencari" dari "tidak ada hasil".',
        'Debounce mengurangi permintaan; pembatalan mencegah respons usang menimpa yang baru.',
        '`AbortError` bukan kegagalan — jangan tampilkan ke pengguna.',
        'Data dari API tetap input tidak tepercaya.',
      ),
      references(
        {
          label: 'aria-busy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy',
          source: 'MDN',
          note: 'Mencegah pembaca layar membacakan isi yang masih setengah jadi.',
        },
        {
          label: 'aria-live',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-live',
          source: 'MDN',
          note: 'Mengumumkan hasil pencarian setelah selesai dimuat, tanpa memotong pengguna.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Alasan skeleton harus memesan ruang, bukan sekadar berputar di tengah.',
        },
        {
          label: 'AbortController',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController',
          source: 'MDN',
          note: 'Pembatalan yang mencegah respons usang menimpa hasil yang lebih baru.',
        },
        {
          label: 'Empty states',
          href: 'https://web.dev/articles/building-a-loading-bar-component',
          source: 'web.dev',
          note: 'Pola menampilkan kemajuan yang jujur alih-alih layar kosong tanpa penjelasan.',
        },
      ),
    ],
  ),
];
