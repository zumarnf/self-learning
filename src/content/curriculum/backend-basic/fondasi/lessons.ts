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
    17,
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
          term: 'untrusted input',
          meaning:
            'Kalimat terpenting di seluruh kategori Backend adalah **semua yang datang dari klien adalah untrusted input.** Bukan sebagian melainkan semuanya, mulai dari body, query string, header, cookie, sampai hal yang "hanya bisa dikirim aplikasi kita sendiri". Siapa pun bisa membuka DevTools, memakai `curl`, atau menulis skrip.',
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
        '**Semua yang datang dari klien adalah masukan yang tidak tepercaya.** Bukan sebagian melainkan semuanya, mulai dari body, query string, header, cookie, sampai hal yang "hanya bisa dikirim aplikasi kita sendiri". Siapa pun bisa membuka DevTools, memakai `curl`, atau menulis skrip. Validasi di browser adalah kenyamanan, sedangkan penjagaan sebenarnya selalu di server.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Cara paling cepat memahami hubungan klien dan server bukan lewat gambar melainkan lewat mencatat apa yang benar-benar tiba di server. Berikut sebuah server Node yang tidak melakukan apa-apa selain menuliskan setiap permintaan yang masuk, lalu dihampiri dua kali oleh peramban sungguhan dan sekali oleh `curl`.',
      ),
      code(
        'text',
        `
        Permintaan ke-1, dari Chrome (satu kali membuka /halaman):

          GET /halaman HTTP/1.1
            host: 127.0.0.1:3997
            connection: keep-alive
            sec-ch-ua: "Chromium";v="151", "Not=A?Brand";v="99"
            sec-ch-ua-mobile: ?0
            sec-ch-ua-platform: "Linux"
            accept-language: en-US,en;q=0.9
            upgrade-insecure-requests: 1
            user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ...
            accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,...
            sec-fetch-site: none
            sec-fetch-mode: navigate
            sec-fetch-user: ?1
            sec-fetch-dest: document
            accept-encoding: gzip, deflate, br, zstd

        Permintaan ke-2, yang TIDAK PERNAH ditulis siapa pun:

          GET /favicon.ico HTTP/1.1
            ...
            referer: http://127.0.0.1:3997/halaman

        Permintaan ke-5, dari curl:

          GET /api HTTP/1.1
            host: 127.0.0.1:3997
            user-agent: curl/8.5.0
            accept: */*
        `,
        {
          caption:
            'Dijalankan sungguhan: server Node 26.5.0 mencatat header mentahnya, dihampiri Chrome 151 dan curl 8.5.0.',
        },
      ),
      p(
        'Tiga hal langsung terlihat. Pertama, satu tindakan pengguna menghasilkan **dua permintaan**, sebab peramban meminta ikon tab sendiri tanpa diperintah. Ini penyebab paling umum baris `404 /favicon.ico` memenuhi log server yang baru dibuat, dan ia bukan bug. Kedua, peramban mengirim empat belas header sedangkan `curl` hanya tiga, jadi menguji dengan `curl` berarti menguji **keadaan yang lebih sederhana** daripada yang sebenarnya terjadi. Ketiga, sebagian besar header itu bukan permintaan melainkan **keterangan tentang pengirimnya**, misalnya format apa yang bisa diterimanya dan kompresi apa yang dimengertinya.',
      ),
      p(
        'Yang paling penting justru ada di baris terakhir setiap catatan. Permintaan ke-3 adalah pembukaan halaman yang sama persis dengan permintaan ke-1, dan header yang tiba identik sampai ke urutannya. Server tidak punya satu pun cara mengetahui bahwa ia pernah melayani permintaan itu sebelumnya, sebab tidak ada apa pun di dalam permintaan kedua yang menyebutkannya.',
      ),
      table(
        ['Yang dikira pemula', 'Yang sebenarnya terjadi', 'Akibatnya di kode'],
        [
          [
            'Server "ingat" siapa yang sedang membuka halaman',
            'Setiap permintaan tiba tanpa riwayat apa pun',
            'Identitas harus dikirim ulang setiap kali, lewat cookie atau header',
          ],
          [
            'Satu klik sama dengan satu permintaan',
            'Satu halaman bisa memicu puluhan permintaan',
            'Log penuh baris yang tidak kamu tulis, dan itu wajar',
          ],
          [
            'Klien hanya peramban',
            'curl, aplikasi ponsel, server lain, dan bot semuanya klien',
            'API tidak boleh mengandalkan perilaku khas peramban',
          ],
          [
            'Server yang memulai percakapan',
            'Server tidak pernah bisa memulai lebih dulu',
            'Notifikasi butuh mekanisme lain, misalnya WebSocket atau push',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pada tingkat klien-server punya satu ciri yang membedakannya dari bug biasa, yaitu **permintaannya tidak pernah sampai**. Tidak ada status code, tidak ada badan respons, dan tidak ada satu pun baris di log server, sebab servernya memang tidak pernah tahu ada yang memanggil.',
      ),
      code(
        'text',
        `
        1. Server tidak berjalan di port itu
          TypeError: fetch failed
          cause: ECONNREFUSED connect ECONNREFUSED 127.0.0.1:3901

        2. Nama host tidak bisa diterjemahkan jadi alamat
          TypeError: fetch failed
          cause: ENOTFOUND getaddrinfo ENOTFOUND server-yang-tidak-pernah-ada.invalid

        3. Tersambung tapi tidak pernah dijawab
          TimeoutError: The operation was aborted due to timeout

        4. Skema protokolnya salah tulis (htp:// bukan http://)
          TypeError: fetch failed
          cause: unknown scheme
        `,
        { caption: 'Dijalankan sungguhan dengan fetch bawaan Node 26.5.0.' },
      ),
      p(
        'Perhatikan bahwa keempatnya melempar pesan luar yang **sama persis**, yaitu `TypeError: fetch failed`. Keterangan yang benar-benar berguna hanya ada di `error.cause`, dan itu bagian yang paling sering hilang ketika seseorang menulis `catch (e) { console.log(e.message) }`. Biasakan mencatat `e.cause?.code` juga, sebab selisih antara `ECONNREFUSED` dan `ENOTFOUND` adalah selisih antara "servernya mati" dan "alamatnya salah ketik", dan keduanya butuh perbaikan yang sama sekali berbeda.',
      ),
      p(
        'Kesalahpahaman yang jauh lebih mahal ada pada sisi sebaliknya. Ketika permintaannya **berhasil** sampai tapi servernya menjawab dengan status gagal, `fetch` sama sekali tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        Server menjawab 404 untuk /x dan 500 untuk /y:

          /x -> tidak melempar. r.status=404  r.ok=false
          /y -> tidak melempar. r.status=500  r.ok=false

        Jadi blok try/catch di sekitar fetch TIDAK menangkap keduanya.
        Yang menangkapnya hanya pemeriksaan eksplisit:

          const r = await fetch(url);
          if (!r.ok) throw new Error('HTTP ' + r.status);
        `,
        {
          caption:
            'Dijalankan sungguhan. Ini perbedaan perilaku fetch yang paling sering menjebak.',
        },
      ),
      p(
        'Alasan `fetch` berperilaku begitu masuk akal begitu diingat siapa yang gagal. Respons 404 adalah percakapan yang **berhasil**, sebab pertanyaannya sampai dan jawabannya kembali. Yang gagal adalah maksud pengguna, bukan jaringannya, dan `fetch` hanya bertanggung jawab atas jaringannya.',
      ),
      code(
        'text',
        `
        Satu error lagi yang pasti kamu temui di hari pertama:

          EADDRINUSE: listen EADDRINUSE: address already in use 127.0.0.1:3995

        Artinya ada proses lain yang sudah memegang port itu — hampir selalu
        server-mu sendiri dari percobaan sebelumnya yang belum benar-benar mati.

          lsof -i :3995        melihat siapa yang memegangnya
          kill <pid>           menghentikannya
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di tingkat ini bukan salah menulis kode melainkan salah membayangkan siapa yang mengerjakan apa, dan itu menyesatkan seluruh keputusan sesudahnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan data pengguna di variabel global server',
            'Servernya kan cuma satu',
            'Permintaan berikutnya bisa dilayani proses lain, dan variabelnya kosong. Simpan di database atau session store',
          ],
          [
            'Membungkus `fetch` dengan try/catch lalu merasa aman',
            'Itu cara menangani error',
            'Diuji sungguhan, 404 dan 500 tidak melempar sama sekali. Periksa `r.ok` secara eksplisit',
          ],
          [
            'Mencatat `e.message` saja saat jaringan gagal',
            'Itu pesan errornya',
            'Diuji sungguhan, keempat kegagalan jaringan berpesan sama. Keterangannya ada di `e.cause.code`',
          ],
          [
            'Panik melihat `404 /favicon.ico` di log',
            'Ada 404 berarti ada yang salah',
            'Peramban memintanya sendiri tanpa diperintah. Sediakan ikonnya, atau abaikan',
          ],
          [
            'Menguji API hanya lewat peramban',
            'Penggunanya kan pakai peramban',
            'Peramban menambah belasan header dan menyembunyikan detail. Uji juga dengan `curl` yang polos',
          ],
          [
            'Mengharapkan server bisa mengirim data lebih dulu',
            'Servernya kan tahu ada perubahan',
            'HTTP selalu dimulai klien. Untuk dorongan dari server, butuh WebSocket atau Server-Sent Events',
          ],
        ],
      ),
      p(
        'Baris pertama pantas ditegaskan karena ia terasa aman di komputer sendiri dan gagal begitu aplikasinya dijalankan lebih dari satu proses. Selama pengembangan hanya ada satu proses, jadi variabel global tampak berfungsi sempurna. Di produksi, aplikasi biasanya berjalan dalam beberapa proses atau beberapa mesin, dan permintaan kedua dari pengguna yang sama bisa mendarat di tempat yang tidak pernah melihat permintaan pertamanya.',
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
          note: 'Spesifikasi resmi HTTP — source of truth saat dokumentasi lain berbeda pendapat.',
        },
      ),
    ],
  ),

  written(
    'http-mendalam',
    'HTTP Mendalam: method, status code, header',
    20,
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
            'Kata kerja di baris pertama permintaan — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Ia menyatakan **apa yang ingin kamu lakukan**, bukan sekadar formalitas: browser, proxy, dan crawler memperlakukan tiap method dengan cara berbeda.',
        },
        {
          term: 'aman (safe)',
          meaning:
            'Method yang **tidak mengubah apa pun** — hanya membaca. `GET` dan `HEAD` termasuk. Karena itulah browser dan crawler merasa bebas mengambil ulang `GET` kapan saja, termasuk melakukan prefetch tanpa pengguna mengklik apa pun.',
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
        'Bacalah contoh itu dari atas ke bawah, karena urutannya bukan kebetulan. **Baris pertama** memuat tiga hal sekaligus, yaitu method (`POST`), path yang dituju (`/api/catatan`), dan versi protokol (`HTTP/1.1`). Lima baris berikutnya adalah header dengan tugas masing-masing yang jelas. `Host` menyebut nama domain yang dituju dan wajib ada, karena satu alamat IP lazim melayani puluhan domain sekaligus sehingga server perlu tahu yang mana. `Content-Type` mengumumkan format body, dan dari baris inilah server memilih parser, sebab tanpa baris ini server tidak menebak melainkan menolak. `Authorization` membawa kredensial. `Content-Length` menyebut panjang body dalam byte, sehingga server tahu kapan harus berhenti membaca. Lalu ada **satu baris kosong** yang bukan hiasan, melainkan pemisah wajib yang menandai "header selesai, mulai dari sini isinya". Baris terakhir adalah body, isi sebenarnya yang ingin disimpan.',
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
        'Jawabannya berbentuk kembar, yaitu baris pertama, header, baris kosong, lalu body. Yang berubah hanya baris pertamanya, sebab alih-alih method dan path, ia berisi versi, angka status, dan nama kodenya (`201 Created`). Angkanya `201` dan bukan `200` karena ada sesuatu yang **baru dibuat**, dan header `Location` menyebutkan di mana benda baru itu sekarang bisa ditemukan. Kombinasi itu menghemat satu putaran permintaan, sebab klien langsung tahu alamat catatan barunya tanpa harus menebak `id` dari body atau memanggil ulang daftar catatan.',
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
        'Browser, proxy, dan crawler bebas mengambil ulang `GET` kapan saja — termasuk melakukan prefetch tanpa pengguna mengklik apa pun. Sebuah `GET /hapus?id=42` bisa dijalankan crawler dan menghapus data tanpa ada yang menyentuhnya. Aksi yang mengubah state **wajib** memakai `POST`, `PUT`, `PATCH`, atau `DELETE`.',
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
        'Batas antara `4xx` dan `5xx` terlihat sepele, padahal ia yang menentukan siapa yang harus bangun tengah malam. `4xx` berarti **permintaannya yang bermasalah**, entah pemanggil mengirim data cacat, lupa login, atau meminta sesuatu yang tidak ada, dan kodemu bekerja dengan benar saat menolaknya. `5xx` berarti **kodemu yang gagal**, sebab permintaannya sah tetapi ada yang meledak di dalam. Karena itu sistem pemantauan hampir selalu memasang alarm pada lonjakan `5xx` dan membiarkan `4xx` lewat. Memberi status `500` untuk input yang salah akan membuat alarm berbunyi terus tanpa ada yang perlu diperbaiki, sedangkan memberi `400` untuk bug asli akan menyembunyikan kerusakan sampai ada pengguna yang mengeluh.',
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
        'Perhatikan kolom "Arah", sebab itu yang paling sering membingungkan di awal. `Accept` dan `Content-Type` sering dikira sama padahal berlawanan arah. `Accept` dikirim klien untuk berkata *"kirimkan padaku dalam bentuk ini"*, sedangkan `Content-Type` menerangkan bentuk isi yang **sedang dibawa** pesan itu sendiri, dan karena itu bisa muncul di permintaan maupun jawaban. Pasangan `Set-Cookie` dan `Cookie` bekerja sama, sebab server mengirim `Set-Cookie` sekali, lalu browser memantulkannya kembali sebagai `Cookie` di **setiap** permintaan berikutnya secara otomatis, dan sifat "otomatis" itulah yang nanti melahirkan seluruh persoalan CSRF di bab Autentikasi.',
      ),
      callout(
        'warning',
        'Header juga masukan yang tidak tepercaya',
        'Siapa pun bisa mengirim header apa pun dengan nilai apa pun. `X-Forwarded-For` hanya bisa dipercaya kalau proxy di depanmu benar-benar menimpanya, dan `User-Agent` tidak pernah bisa dijadikan dasar keputusan keamanan.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Cara paling jujur mempelajari HTTP adalah berhenti memakai pustaka apa pun dan mengirim bytenya sendiri lewat socket. Berikut permintaan dan jawaban yang benar-benar melintas di kabel, diambil dari sebuah server catatan kecil yang ditulis dengan `node:http` polos.',
      ),
      code(
        'text',
        `
        YANG DIKIRIM:

          GET /catatan HTTP/1.1
          Host: 127.0.0.1:3999
          Accept: application/json
          Connection: close

        YANG DITERIMA:

          HTTP/1.1 200 OK
          Content-Type: application/json
          Date: Mon, 07 Sep 2026 08:34:43 GMT
          Connection: close
          Transfer-Encoding: chunked

          24
          [{"id":1,"judul":"Catatan pertama"}]
          0
        `,
        {
          caption:
            'Dijalankan sungguhan lewat net.connect ke server Node 26.5.0, tanpa pustaka HTTP di sisi klien.',
        },
      ),
      p(
        'Angka `24` dan `0` yang mengapit badan respons itu bukan bagian datanya. Ia muncul karena server tidak menyetel `Content-Length`, sehingga Node beralih ke `Transfer-Encoding: chunked` yang mengirim data dalam potongan berukuran diumumkan lebih dulu dalam heksadesimal. Angka `24` heksadesimal sama dengan 36 desimal, dan itu memang panjang JSON di bawahnya. Potongan `0` menandai bahwa tidak ada potongan lagi. Ini bagian HTTP yang biasanya tidak pernah terlihat karena pustaka menyembunyikannya, dan berguna dikenali ketika suatu hari kamu membaca respons mentah dan bingung dari mana angka-angka itu datang.',
      ),
      p(
        'Perbandingan berikut menunjukkan bahwa method dan status code bukan sekadar label, melainkan **janji tentang perilaku** yang diikuti perantara di jalur, mulai dari cache sampai proxy.',
      ),
      code(
        'text',
        `
        POST /catatan  dengan badan {"judul":"Belanja"}

          HTTP/1.1 201 Created
          Content-Type: application/json
          Location: /catatan/2

          {"id":2,"judul":"Belanja"}

        DELETE /catatan  (server hanya mendukung GET dan POST di sini)

          HTTP/1.1 405 Method Not Allowed
          Allow: GET, POST

          {"error":"Method tidak didukung"}

        GET /lama  (sumber daya sudah pindah)

          HTTP/1.1 301 Moved Permanently
          Location: /catatan
        `,
        {
          caption:
            'Dijalankan sungguhan. Perhatikan header Location dan Allow yang menyertai statusnya.',
        },
      ),
      p(
        'Tiga jawaban itu memuat tiga aturan yang sering dilewatkan. Respons `201 Created` **wajib** menyertakan header `Location` yang menunjuk sumber daya yang baru lahir, sebab tanpanya klien tidak tahu ke mana harus melihat. Respons `405` **wajib** menyertakan `Allow` yang menyebutkan method apa saja yang sebenarnya didukung, dan itulah yang membedakannya dari sekadar 404. Respons `301` mengubah perilaku klien secara permanen, jadi peramban akan mengingat pengalihannya dan berhenti menanyakan alamat lama, kadang sampai cache-nya dibersihkan manual.',
      ),
      callout(
        'warning',
        '301 sulit ditarik kembali, 302 tidak',
        'Pengalihan 301 disimpan peramban dan bisa bertahan lama sekali. Kalau kamu memasangnya karena salah, pengguna yang sudah menerimanya akan tetap dialihkan meski servernya sudah diperbaiki. Selama pengalihannya belum pasti permanen, pakai 302 atau 307 yang tidak disimpan seagresif itu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Satu kegagalan HTTP yang paling sering luput dari pengujian adalah method `HEAD`. Aturannya sederhana, `HEAD` harus menjawab persis seperti `GET` tetapi tanpa badan, sebab ia dipakai untuk memeriksa keberadaan atau ukuran sumber daya tanpa mengunduhnya. Server yang menangani method dengan rangkaian `if` biasanya melupakannya.',
      ),
      code(
        'text',
        `
        Server yang memeriksa method seperti ini:

          if (url === '/catatan' && method === 'GET')  { ... 200 ... }
          else if (url === '/catatan' && method === 'POST') { ... 201 ... }
          else if (url === '/catatan') { ... 405 ... }

        Jawaban untuk HEAD /catatan yang benar-benar diukur:

          HTTP/1.1 405 Method Not Allowed
          Allow: GET, POST
          Content-Type: application/json
          Connection: close

          (badan kosong — Node membuang badan respons HEAD secara otomatis)

        Yang benar seharusnya 200 dengan header yang sama seperti GET.
        `,
        {
          caption:
            'Dijalankan sungguhan. 405 di atas adalah bug server ini, bukan perilaku HTTP yang benar.',
        },
      ),
      p(
        'Dua hal terlihat di sini sekaligus. Yang pertama bug, yaitu `HEAD` jatuh ke cabang 405 karena tidak pernah disebut. Yang kedua justru fitur, yaitu Node membuang badan respons untuk `HEAD` dengan sendirinya meski kodenya memanggil `res.end(...)` dengan isi. Jadi kamu tidak perlu menangani pembuangan badannya, hanya perlu memastikan `HEAD` masuk ke cabang yang benar.',
      ),
      p(
        'Kelompok kegagalan kedua muncul dari status code yang dipilih asal, dan akibatnya menyebar ke klien yang tidak bisa kamu kendalikan.',
      ),
      table(
        ['Yang sering dipakai', 'Kapan sebenarnya', 'Akibat memakainya salah'],
        [
          [
            '`200` untuk semua jawaban, termasuk yang gagal',
            'Hanya ketika permintaannya benar-benar berhasil',
            'Klien, cache, dan pemantauan menganggap semuanya sehat. Kegagalan jadi tidak terlihat sama sekali',
          ],
          [
            '`400` untuk setiap masukan bermasalah',
            'Badan permintaannya tidak bisa diurai sama sekali',
            'Kehilangan beda antara "JSON-nya rusak" dan "JSON-nya sah tapi isinya tidak valid", yang seharusnya `422`',
          ],
          [
            '`401` dan `403` dianggap sama',
            '`401` belum diketahui siapa, `403` sudah diketahui tapi tidak berhak',
            'Klien tidak tahu apakah harus meminta pengguna masuk lagi atau tidak',
          ],
          [
            '`500` untuk kesalahan pengguna',
            'Hanya untuk kesalahan yang bukan salah pengguna',
            'Pemantauan berbunyi karena hal yang tidak perlu diperbaiki siapa pun',
          ],
          [
            '`404` untuk sumber daya milik orang lain',
            'Justru sering benar, dan disengaja',
            'Menjawab `403` membocorkan bahwa datanya ada. Untuk data pribadi, `404` sering pilihan yang lebih aman',
          ],
        ],
      ),
      p(
        'Baris terakhir memuat keputusan keamanan yang layak diketahui sejak awal. Ketika seseorang meminta `/pesanan/4211` milik orang lain, menjawab `403` sama saja memberi tahu bahwa pesanan bernomor 4211 memang ada. Untuk sumber daya yang keberadaannya sendiri bersifat rahasia, menjawab `404` menutup kebocoran itu tanpa mengurangi apa pun bagi pemilik yang sah.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'HTTP terasa seperti detail yang bisa dilewati karena framework sudah menanganinya. Yang tidak ditangani framework adalah keputusan-keputusan di bawah ini, dan semuanya milikmu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `POST` untuk semua endpoint',
            'Ia bisa membawa badan, jadi paling fleksibel',
            'Cache, tombol kembali, dan percobaan ulang otomatis jadi tidak bisa dipakai. `GET` yang bisa di-cache adalah keuntungan gratis',
          ],
          [
            'Menjawab `200` dengan `{"success": false}`',
            'Kliennya kan membaca badan respons',
            'Setiap perantara di jalur menganggapnya berhasil. Status code adalah bagian yang dibaca mesin',
          ],
          [
            'Melupakan `HEAD`',
            'Tidak ada yang memakainya',
            'Diuji sungguhan, ia jatuh ke 405. Pemantau uptime dan sebagian proxy memakainya',
          ],
          [
            'Menjawab `201` tanpa header `Location`',
            'Datanya sudah ada di badan respons',
            'Klien harus menebak alamat sumber daya baru. `Location` adalah bagian dari kontrak `201`',
          ],
          [
            'Memakai `301` untuk pengalihan yang belum pasti',
            'Namanya kan "moved"',
            'Peramban menyimpannya lama dan sulit ditarik kembali. Pakai `302` atau `307` selama belum permanen',
          ],
          [
            'Mengarang header sendiri tanpa awalan',
            'Namanya lebih rapi',
            'Bisa bentrok dengan header standar sekarang atau nanti. Pakai nama yang jelas milikmu, misalnya `X-Request-Id`',
          ],
        ],
      ),
      p(
        'Baris kedua adalah yang paling merugikan dalam jangka panjang, dan alasannya bukan soal kerapian. Status code dibaca oleh hal-hal yang tidak pernah membaca badan respons, yaitu cache peramban, CDN, load balancer, pustaka percobaan ulang, dan sistem pemantauan. Ketika sebuah kegagalan dibungkus `200`, seluruh lapisan itu melaporkan aplikasimu sehat sepenuhnya, dan grafik kesalahan tetap datar meski penggunanya tidak bisa melakukan apa pun.',
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
    17,
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
        'Enam bagian itu punya pemisah masing-masing, dan mengenali pemisahnya jauh lebih berguna daripada menghafal namanya. **Skema** berakhir di `://`. **Host** berakhir di `:` bila portnya ditulis, atau di `/` bila tidak, dan `:443` di contoh sebenarnya boleh dihilangkan karena itu memang port bawaan `https`. **Path** membentang dari `/` pertama sampai tanda `?`, dan di dalamnya `42` adalah path param yang merupakan bagian dari alamat alih-alih pelengkap. **Query string** dimulai tepat setelah `?`, berisi pasangan `nama=nilai` yang dipisah `&`, dan di sini ada dua yaitu `urut=baru` dan `hal=2`. **Fragment** dimulai di `#`, dan inilah bagian yang paling sering disalahpahami, sebab browser memotongnya sebelum permintaan dikirim, sehingga server tidak pernah bisa membacanya betapapun kamu mencoba.',
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
        'Bandingkan baris kedua dan ketiga, karena di situlah letak perbedaan yang paling sering keliru. `?arsip=true` **menyaring daftar**, sehingga hasilnya tetap sekumpulan catatan hanya lebih sedikit, dan menghilangkan query-nya masih memberimu daftar yang sah. Sedangkan `/42` **menunjuk satu benda tertentu**, sehingga menghilangkan `42` mengubah arti alamatnya sepenuhnya. Uji cepatnya, kalau bagian itu dibuang dan permintaannya masih masuk akal maka ia milik query string, sedangkan kalau dibuang lalu maksudnya hilang maka ia milik path. Perhatikan juga baris terakhir, sebab `DELETE` tidak butuh body sama sekali, karena path sudah menyebutkan seluruh yang perlu diketahui server.',
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
        'Kedua permintaan itu sama-sama mengirim password ke server yang sama lewat koneksi terenkripsi yang sama, sebab TLS melindungi keduanya selama di perjalanan. Yang membedakan adalah **apa yang terjadi setelah paketnya tiba**. Format log akses bawaan server web (dan proxy, dan CDN) mencatat baris permintaan secara utuh, yaitu method, path, **beserta query string**. Jadi versi "Berbahaya" menuliskan `password=rahasia123` dalam teks polos ke berkas log, ke sistem agregasi log, dan ke riwayat browser pengguna, yang semuanya tempat jauh lebih longgar penjagaannya daripada database password. Versi "Benar" menaruh nilai yang sama di body, dan body tidak pernah masuk ke log akses standar. Perbedaannya bukan enkripsi, melainkan **jejak yang tertinggal**.',
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
        'Perhatikan hasil `toString()` di baris ketiga yang berbunyi `cari=react+%26+next`. Dua karakter berubah bentuk di sana. Spasi menjadi `+`, dan `&` menjadi `%26`, persis karena `&` punya arti khusus sebagai **pemisah antar parameter**. Kalau URL itu dirangkai sendiri dengan penggabungan string, server akan membaca `cari=react `, lalu menganggap ` next` sebagai parameter ketiga yang tidak pernah kamu kirim, dan nilai pencarian pengguna diam-diam terpotong. `URLSearchParams` melakukan encoding itu otomatis untuk setiap nilai, jadi memakainya bukan soal kerapian melainkan soal menghindari bug yang hanya muncul pada input tertentu, yaitu jenis bug yang lolos dari semua pengujian manual karena tidak ada yang mengetik tanda `&` saat mencoba.',
      ),
      callout(
        'warning',
        'Batasi ukuran, di ketiga tempat',
        'URL punya batas praktis (~2000 karakter di banyak proxy), tapi body tidak punya batas alami. Tanpa batas ukuran body yang kamu tetapkan sendiri, satu permintaan berisi 500 MB JSON cukup untuk menghabiskan memori server. Ini pertahanan pertama terhadap penyalahgunaan sumber daya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Endpoint pencarian produk adalah tempat ketiga cara menitipkan data bertemu sekaligus, dan juga tempat kesalahan penanganannya paling cepat terasa. Berikut satu URL nyata dibongkar oleh `new URL()` bawaan Node, tanpa pustaka apa pun.',
      ),
      code(
        'text',
        `
        https://api.toko.id:8443/v1/produk/42/ulasan?halaman=2&urut=terbaru&q=kaos%20polos#bagian-2

          protocol  = "https:"
          hostname  = "api.toko.id"
          port      = "8443"
          pathname  = "/v1/produk/42/ulasan"
          search    = "?halaman=2&urut=terbaru&q=kaos%20polos"
          hash      = "#bagian-2"
          origin    = "https://api.toko.id:8443"
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Angka `42` di dalam `pathname` adalah path param, dan letaknya menyatakan sesuatu, yaitu ulasan ini **milik** produk 42. Bagian `?halaman=2&urut=terbaru` adalah query string, dan isinya menyatakan cara menampilkan, bukan identitas. Bagian `#bagian-2` tidak pernah dikirim ke server sama sekali, sebab fragment hanya urusan peramban. Membedakan ketiganya sejak awal menghindarkan API yang bentuknya harus diubah belakangan.',
      ),
      p(
        'Setelah URL-nya dibongkar, ada satu sifat query string yang wajib diketahui dan hampir selalu terlambat disadari.',
      ),
      code(
        'text',
        `
        q.get("halaman")      = "2"     <- SELALU string, tidak pernah angka
        typeof                = string
        q.get("tidak-ada")    = null    <- null, bukan undefined

        Jadi kode seperti ini SALAH tanpa memberi tanda apa pun:

          const halaman = req.query.halaman;
          const lewati = (halaman - 1) * 20;      // "2" - 1 berhasil jadi 1 (JS memaksa)
          const berikut = halaman + 1;            // "2" + 1 jadi "21"  <-- di sini rusak
        `,
        {
          caption: 'Dijalankan sungguhan. Operator minus memaksa jadi angka, operator plus tidak.',
        },
      ),
      p(
        'Perilaku ganda itu yang membuat bugnya bertahan lama. Pengurangan diam-diam berhasil sehingga sebagian kode terlihat benar, sedangkan penjumlahan menghasilkan penggabungan teks. Karena itu setiap nilai dari query string harus diubah tipenya secara eksplisit di satu tempat, sebaiknya lewat skema validasi, bukan ditebak di tempat pemakaian.',
      ),
      p(
        'Jebakan kedua muncul ketika satu kunci dikirim lebih dari sekali, dan ini normal untuk penyaringan bertumpuk seperti `?tag=baju&tag=celana&tag=topi`.',
      ),
      code(
        'text',
        `
        Query: tag=baju&tag=celana&tag=topi

          get("tag")            = "baju"                        <- hanya yang PERTAMA
          getAll("tag")         = ["baju","celana","topi"]      <- semuanya
          Object.fromEntries(q) = {"tag":"topi"}                <- dua nilai HILANG
        `,
        { caption: 'Dijalankan sungguhan dengan URLSearchParams bawaan Node 26.5.0.' },
      ),
      p(
        'Baris ketiga layak diperhatikan karena `Object.fromEntries` adalah cara yang paling sering dipakai orang untuk mengubah query string menjadi objek biasa, dan ia membuang dua dari tiga nilai tanpa satu pun peringatan. Pengguna menyaring tiga tag, servernya hanya menerima satu, dan tidak ada error di mana pun. Untuk kunci yang boleh berulang, `getAll` yang benar.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan encoding tidak melempar error. Ia menghasilkan data yang salah, dan bentuk salahnya kadang justru terlihat seperti data yang sah sehingga lolos sampai jauh.',
      ),
      code(
        'text',
        `
        Nilai yang ingin dicari pengguna:

          kaos & celana 100% katun

        Ditempel langsung ke URL tanpa encode:

          https://a.id/cari?q=kaos & celana 100% katun

          searchParams.get("q")  = "kaos "                        <- terpotong di &
          daftar kunci           = ["q", " celana 100% katun"]    <- kunci hantu muncul

        Dengan encodeURIComponent:

          kaos%20%26%20celana%20100%25%20katun
          searchParams.get("q")  = "kaos & celana 100% katun"     <- utuh

        Dengan encodeURI (fungsi yang mirip, dan SALAH untuk kasus ini):

          kaos%20&%20celana%20100%25%20katun
                    ^
                    & tidak ikut di-encode, jadi bugnya tetap ada
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Perbedaan dua fungsi itu perlu dipegang. `encodeURI` dipakai untuk **seluruh URL** sehingga ia sengaja membiarkan karakter struktural seperti `&`, `?`, dan `/` tetap apa adanya. `encodeURIComponent` dipakai untuk **satu potongan nilai** sehingga ia meng-encode semuanya. Untuk nilai yang dimasukkan pengguna, hampir selalu yang kedua yang benar.',
      ),
      code(
        'text',
        `
        Dua bentuk spasi yang sering membingungkan:

          ?q=kaos+polos      -> "kaos polos"     (+ berarti spasi DI QUERY STRING)
          ?q=kaos%20polos    -> "kaos polos"     (bentuk yang selalu benar)
          /kaos+polos        -> "/kaos+polos"    (+ di PATH tetap tanda tambah)

        Jadi tanda + berarti dua hal berbeda tergantung letaknya. Ini penyebab
        nama berkas atau kata sandi yang mengandung + rusak saat dilewatkan URL.
        `,
        { caption: 'Dijalankan sungguhan.' },
      ),
      p(
        'Kelompok ketiga adalah kegagalan keamanan, dan yang satu ini justru menarik karena sebagian sudah ditangani sebelum sampai ke kodemu.',
      ),
      code(
        'text',
        `
        Yang diminta penyerang:

          https://a.id/berkas/../../etc/passwd

        Yang tiba di pathname setelah dinormalisasi:

          /etc/passwd
        `,
        { caption: 'Dijalankan sungguhan dengan new URL() di Node 26.5.0.' },
      ),
      p(
        'Normalisasi itu bukan perlindungan, melainkan sekadar perapian. Ia menghilangkan `..` dari bentuk URL-nya, dan yang tersisa di tanganmu adalah jalur yang sudah bersih tapi tetap menunjuk ke luar folder yang kamu maksud. Kalau nilai itu kemudian digabungkan ke jalur berkas di server, kebocorannya tetap terjadi. Aturan yang mengikat tetap sama, yaitu jangan pernah menyusun jalur berkas dari masukan pengguna, dan bandingkan terhadap daftar yang diizinkan.',
      ),
      callout(
        'danger',
        'Yang tidak boleh masuk URL, dan alasannya bukan estetika',
        'URL tercatat di log server, log proxy, riwayat peramban, dan header `Referer` yang ikut terkirim ke situs pihak ketiga. Apa pun yang masuk URL harus dianggap sudah tersimpan di banyak tempat yang tidak kamu kendalikan. Karena itu kata sandi, token, nomor kartu, dan data pribadi tidak pernah boleh berada di query string, meski koneksinya HTTPS. HTTPS menyembunyikannya dari jaringan, bukan dari log.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hampir semua kesalahan di bagian ini berasal dari menganggap URL sekadar teks yang bisa disambung dengan tanda tambah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyusun URL dengan penggabungan teks',
            'Hasilnya terlihat benar saat diuji',
            'Diuji sungguhan, satu karakter `&` dari pengguna memotong nilainya dan memunculkan kunci hantu. Pakai `URL` dan `URLSearchParams`',
          ],
          [
            'Memakai nilai query langsung sebagai angka',
            'Isinya memang angka',
            'Diuji sungguhan, ia selalu string. `"2" - 1` berhasil tapi `"2" + 1` jadi `"21"`',
          ],
          [
            'Mengubah query jadi objek dengan `Object.fromEntries`',
            'Paling ringkas',
            'Diuji sungguhan, kunci berulang kehilangan semua nilai kecuali yang terakhir. Pakai `getAll`',
          ],
          [
            'Memakai `encodeURI` untuk nilai pencarian',
            'Namanya paling mirip',
            'Diuji sungguhan, ia tidak meng-encode `&`. Untuk satu nilai, `encodeURIComponent`',
          ],
          [
            'Meletakkan token atau kata sandi di query string',
            'Praktis dan tetap lewat HTTPS',
            'URL tercatat di log server, proxy, riwayat, dan header `Referer`. HTTPS tidak menghapusnya dari sana',
          ],
          [
            'Mengirim data yang panjang lewat query string',
            'GET terasa lebih sederhana',
            'Ada batas panjang URL di proxy dan server, dan batasnya berbeda-beda. Data panjang milik badan permintaan',
          ],
        ],
      ),
      p(
        'Baris terakhir sering baru terasa saat sudah di produksi, sebab batas panjang URL tidak diatur satu standar. Peramban, server, dan proxy masing-masing punya batas sendiri, dan yang paling ketat di antara merekalah yang berlaku. Sebuah penyaringan dengan dua ratus id yang dikirim lewat query string bisa berjalan mulus di komputer sendiri lalu terpotong di proxy produksi tanpa satu pun error yang jelas.',
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
    19,
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
            'Perubahan yang merusak klien yang sudah berjalan: menghapus field, mengganti namanya, mengubah tipenya, atau menambah aturan validasi baru. Aturan praktisnya, **menambah field opsional itu aman, sedangkan hampir semua perubahan lain tidak.**',
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
        'Kolom kiri sebenarnya **berfungsi**, sebab API seperti itu jalan dan banyak dipakai. Ongkosnya muncul belakangan. Karena semuanya `POST`, tidak ada satu pun yang boleh di-cache, sebab browser dan CDN tidak punya cara mengetahui bahwa `/ambilSemuaCatatan` hanya membaca, jadi setiap pemanggilan menempuh perjalanan penuh sampai ke database. Retry juga jadi menakutkan, sebab kalau koneksi putus di tengah `POST /hapusCatatanById`, tidak ada yang tahu apakah aman mengulanginya. Kolom kanan memindahkan informasi itu ke tempat yang **sudah dimengerti seluruh infrastruktur web**, sebab `GET` menyatakan "hanya membaca, silakan cache", `DELETE` menyatakan "diulang sepuluh kali hasilnya tetap satu". Perhatikan baris terakhirnya, sebab "arsipkan" bukan operasi CRUD sehingga ia tetap boleh punya alamat sendiri sebagai `POST /catatan/42/arsip`. Yang dihindari REST adalah kata kerja yang **menggantikan** method, bukan kata kerja yang menamai aksi yang memang tidak punya padanan.',
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
        'Enam baris pertama adalah pola yang sama persis untuk **setiap** resource di API mana pun: ganti `catatan` dengan `pengguna` atau `pesanan`, dan seorang pemakai baru sudah bisa menebak alamatnya tanpa membuka dokumentasi. Yang membedakan `PUT` dari `PATCH` di baris keempat dan kelima adalah cakupannya. `PUT` mengirim **seluruh** bentuk catatan dan menggantinya bulat-bulat, sehingga field yang tidak kamu sertakan akan hilang, sedangkan `PATCH` hanya mengirim bagian yang berubah. Dua baris terakhir menunjukkan penyarangan, dan tanda `/42` di tengah itulah yang menyatakan kepemilikan, sebab komentar di sana tidak berdiri sendiri, ia milik catatan 42, sehingga meminta komentar tanpa menyebut catatannya tidak punya arti.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Sifat REST yang paling berpengaruh di project nyata bukan bentuk URL-nya melainkan **idempotensi**, yaitu jaminan bahwa mengirim permintaan yang sama dua kali menghasilkan keadaan akhir yang sama. Jaminan itu terdengar akademis sampai satu situasi yang pasti terjadi muncul, yaitu pengguna menekan tombol dua kali karena jawabannya lambat, atau jaringan ponselnya terputus sehingga aplikasinya mencoba lagi otomatis.',
      ),
      code(
        'text',
        `
        POST /catatan  dua kali dengan badan IDENTIK {"judul":"Belanja"}

          ke-1 -> 201  {"id":2,"judul":"Belanja","selesai":false,"tag":[]}
          ke-2 -> 201  {"id":3,"judul":"Belanja","selesai":false,"tag":[]}

          jumlah baris di penyimpanan = 3     <- DUA catatan lahir

        PUT /catatan/1  dua kali dengan badan IDENTIK

          ke-1 -> 200  {"id":1,"judul":"Diganti","selesai":true,"tag":["rumah"]}
          ke-2 -> 200  {"id":1,"judul":"Diganti","selesai":true,"tag":["rumah"]}

          jumlah baris di penyimpanan = 3     <- tidak bertambah

        DELETE /catatan/2  dua kali

          ke-1 -> 204
          ke-2 -> 204                         <- jawabannya sama, keadaannya sama
        `,
        {
          caption: 'Dijalankan sungguhan terhadap server Node 26.5.0 dengan penyimpanan di memori.',
        },
      ),
      p(
        'Selisihnya nyata dan bisa dilihat. `POST` menciptakan sumber daya baru setiap kali dipanggil, jadi mengirimnya dua kali menghasilkan dua catatan. `PUT` menempatkan sebuah sumber daya di alamat yang sudah ditentukan, jadi mengirimnya dua kali menghasilkan keadaan yang sama persis. `DELETE` yang kedua tidak menemukan apa pun untuk dihapus, dan tetap menjawab `204` sebab keadaan yang diminta pengguna, yaitu "catatan ini tidak ada", sudah tercapai.',
      ),
      p(
        'Konsekuensi praktisnya menentukan bagaimana klien boleh diprogram. Permintaan yang idempoten boleh dicoba ulang otomatis ketika jaringan gagal, sedangkan `POST` tidak boleh, sebab tidak ada cara membedakan "permintaan pertama belum sampai" dari "permintaan pertama sampai tapi jawabannya hilang di jalan".',
      ),
      table(
        ['Method', 'Idempoten?', 'Boleh dicoba ulang otomatis?', 'Boleh di-cache?'],
        [
          ['`GET`', 'Ya', 'Ya', 'Ya'],
          ['`PUT`', 'Ya', 'Ya', 'Tidak'],
          ['`DELETE`', 'Ya', 'Ya', 'Tidak'],
          ['`PATCH`', 'Tidak dijamin', 'Hanya bila kamu merancangnya begitu', 'Tidak'],
          ['`POST`', 'Tidak', 'Tidak, kecuali dengan idempotency key', 'Tidak'],
        ],
      ),
      p(
        'Untuk `POST` yang benar-benar tidak boleh berlipat, misalnya pembayaran, polanya bernama **idempotency key**. Klien membuat satu identitas acak untuk niat itu, mengirimnya sebagai header, dan server menyimpan hasil pertama untuk kunci tersebut. Permintaan kedua dengan kunci yang sama tidak mengerjakan apa pun, hanya mengembalikan jawaban yang sudah tersimpan.',
      ),
      code(
        'ts',
        `
        // Bentuk paling sederhana yang sudah benar. Kuncinya dibuat KLIEN,
        // sebab hanya klien yang tahu bahwa dua percobaan adalah satu niat yang sama.
        app.post('/pembayaran', async (req, res) => {
          const kunci = req.header('Idempotency-Key');
          if (!kunci) return res.status(400).json({ error: 'Idempotency-Key wajib' });

          const tersimpan = await db.idempotensi.cari(kunci);
          if (tersimpan) return res.status(tersimpan.status).json(tersimpan.badan);

          const hasil = await buatPembayaran(req.body);

          // Disimpan SETELAH berhasil, dan dengan batas waktu — bukan selamanya.
          await db.idempotensi.simpan(kunci, { status: 201, badan: hasil, kedaluwarsa: '24 jam' });
          return res.status(201).json(hasil);
        });
        `,
        {
          caption:
            'Pola ini yang dipakai penyedia pembayaran besar, dan namanya sama di mana-mana.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan REST yang paling merusak data adalah tertukarnya `PUT` dan `PATCH`, dan ia tidak menghasilkan error apa pun. Yang terjadi adalah **data hilang diam-diam**.',
      ),
      code(
        'text',
        `
        Keadaan sebelum:
          {"id":1,"judul":"Diganti","selesai":true,"tag":["rumah"]}

        PUT /catatan/1  dengan badan {"judul":"Hanya judul"}
          -> 200  {"id":1,"judul":"Hanya judul","selesai":false,"tag":[]}
                                                ^^^^^^^^^^^^^^  ^^^^^^^^
                                                selesai dan tag HILANG

        Keadaan dikembalikan, lalu percobaan yang sama dengan PATCH:
          {"id":1,"judul":"Kembali","selesai":true,"tag":["rumah"]}

        PATCH /catatan/1  dengan badan {"judul":"Hanya judul"}
          -> 200  {"id":1,"judul":"Hanya judul","selesai":true,"tag":["rumah"]}
                                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                sisanya utuh
        `,
        {
          caption:
            'Dijalankan sungguhan. Statusnya 200 pada keduanya, jadi tidak ada tanda bahaya apa pun.',
        },
      ),
      p(
        'Ini bukan bug pada servernya, melainkan tepat perilaku yang dijanjikan `PUT`. `PUT` berarti "jadikan sumber daya di alamat ini sama dengan badan yang saya kirim", jadi field yang tidak disebutkan memang harus kembali ke nilai bawaannya. Bug-nya ada pada memilih `PUT` untuk sesuatu yang sebenarnya perubahan sebagian.',
      ),
      p(
        'Kegagalan senyap ini sangat khas pada formulir edit. Formulirnya hanya memuat tiga field, sedangkan sumber dayanya punya delapan, dan pengiriman dengan `PUT` mengosongkan lima sisanya. Yang membuatnya sulit dilacak, kerusakannya baru terlihat berhari-hari kemudian ketika seseorang membuka data itu dari halaman lain.',
      ),
      table(
        ['Situasi', 'Yang benar', 'Alasannya'],
        [
          [
            'Formulir edit menampilkan seluruh field',
            '`PUT`',
            'Klien memang mengirim keadaan lengkap, jadi janji `PUT` terpenuhi',
          ],
          [
            'Formulir edit menampilkan sebagian field',
            '`PATCH`',
            'Field yang tidak ditampilkan tidak boleh ikut berubah',
          ],
          [
            'Tombol tandai selesai',
            '`PATCH`, atau endpoint aksi tersendiri',
            'Hanya satu field yang berubah',
          ],
          [
            'Mengunggah ulang satu berkas ke alamat tetap',
            '`PUT`',
            'Isinya memang diganti seluruhnya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'REST punya banyak aturan yang beredar sebagai selera, padahal sebagian benar-benar berpengaruh pada perilaku sistem. Tabel di bawah hanya memuat yang berpengaruh.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `PUT` untuk formulir edit sebagian',
            'Namanya update',
            'Diuji sungguhan, field yang tidak dikirim kembali ke nilai bawaan dan datanya hilang tanpa error',
          ],
          [
            'Membuat endpoint `/getUser` dan `/createUser`',
            'Namanya jelas menyebutkan aksinya',
            'Kata kerja sudah ada di method. `GET /users/:id` dan `POST /users` menyampaikan hal yang sama tanpa mengulang',
          ],
          [
            'Mencoba ulang `POST` otomatis saat jaringan gagal',
            'Kan cuma percobaan ulang',
            'Diuji sungguhan, dua `POST` identik melahirkan dua data. Butuh idempotency key lebih dulu',
          ],
          [
            'Menjawab `204` untuk `POST` yang berhasil',
            'Tidak ada yang perlu dikembalikan',
            'Klien butuh id sumber daya baru. Jawab `201` beserta badan dan header `Location`',
          ],
          [
            'Memakai `DELETE` lalu menjawab `404` pada percobaan kedua',
            'Datanya kan sudah tidak ada',
            'Merusak idempotensi yang dijanjikan `DELETE`. Diuji sungguhan, `204` dua kali adalah perilaku yang benar',
          ],
          [
            'Memasang versi API belakangan, saat sudah perlu',
            'Sekarang belum butuh',
            'Saat dibutuhkan, sudah ada klien yang tidak bisa diubah. Mulai dari `/v1` sejak awal',
          ],
        ],
      ),
      p(
        'Baris terakhir murah dilakukan sekarang dan mahal ditambahkan nanti. Menaruh `/v1` di depan seluruh alamat sejak hari pertama tidak menambah kerumitan apa pun, dan ia memberimu satu pintu keluar ketika suatu hari sebuah perubahan harus memutus kompatibilitas. Tanpa itu, satu-satunya pilihan yang tersisa adalah memaksa setiap klien berubah pada hari yang sama, dan aplikasi ponsel yang sudah terpasang di perangkat pengguna tidak bisa dipaksa begitu.',
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
    18,
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
      p(
        'Angka `0.30000000000000004` itu bukan kesalahan JSON, melainkan sifat bilangan pecahan di komputer yang sudah kamu temui di Frontend Basic, dan JSON mewarisinya karena angkanya memang disimpan sebagai floating point. Yang berubah di sisi backend adalah **taruhannya**, sebab selisih sepersepuluh triliun tidak terlihat di layar, tapi terakumulasi di ribuan transaksi dan berakhir sebagai laporan keuangan yang tidak balance. Baris terakhir menunjukkan obatnya, yaitu simpan `150000` sebagai bilangan **bulat** dalam satuan terkecil, lalu bagi seribu hanya saat menampilkannya. Dengan begitu tidak ada pecahan yang pernah disimpan maupun dijumlahkan, dan seluruh kelas kesalahan pembulatan hilang di akar.',
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
      p(
        'Perhatikan angka yang masuk dan yang keluar **berbeda satu digit terakhir**, sebab `…993` menjadi `…992`. Penyebabnya adalah batas `Number.MAX_SAFE_INTEGER` (2⁵³ − 1) dari Frontend Basic, karena di atas itu dua bilangan bulat yang berbeda bisa dipetakan ke nilai tersimpan yang sama. Ini masalah nyata di backend karena banyak database mengeluarkan id `BIGINT` yang dengan mudah melewati batas tersebut, terutama pada tabel dengan id berbasis waktu seperti Snowflake. Baris terakhir menunjukkan solusinya, dan ia harus diputuskan **sejak awal**, yaitu kirim id sebagai string. Mengubahnya belakangan berarti memutus setiap klien yang sudah terlanjur memperlakukannya sebagai angka.',
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
      p(
        'Berbeda dari kebanyakan fungsi, `JSON.parse` **melempar** untuk masukan yang cacat alih-alih mengembalikan `null`, jadi tanpa `try` satu permintaan berisi teks sembarang cukup untuk menjatuhkan penanganannya. Dan karena body datang dari klien, ia **selalu** untrusted input, sebab siapa pun bisa mengirim apa saja dengan `curl`. Perhatikan `catch` di sini sengaja tanpa parameter dan tidak menampilkan pesan error aslinya ke klien, sebab pesan bawaan `JSON.parse` menyebut posisi karakter dan potongan isi, detail yang tidak berguna bagi pemanggil dan tidak perlu dibocorkan. Status `400` dipilih karena yang salah memang permintaannya dan bukan servermu. Kalau kamu mengembalikan `500` di sini, alarm pemantauan akan berbunyi untuk sesuatu yang berjalan persis seperti seharusnya.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Kegagalan JSON yang paling sering ditemui di project nyata bukan pada bentuk datanya melainkan pada **apa yang hilang saat diubah menjadi teks**. `JSON.stringify` tidak pernah melaporkan bahwa ia membuang sesuatu, dan itu membuat kelasnya sendiri berupa bug yang hanya muncul setelah data melewati jaringan.',
      ),
      code(
        'text',
        `
        Objek yang dikirim:

          {
            nama: 'Rina',
            umur: undefined,
            hitung: () => 1,
            dibuat: new Date('2026-09-07T08:00:00Z'),
            tag: new Set(['a', 'b']),
            saldo: 10,
            kosong: null,
          }

        Hasil JSON.stringify:

          {"nama":"Rina","dibuat":"2026-09-07T08:00:00.000Z","tag":{},"saldo":10,"kosong":null}

        Kunci sebelum : nama, umur, hitung, dibuat, tag, saldo, kosong
        Kunci sesudah : nama, dibuat, tag, saldo, kosong
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Empat perubahan terjadi tanpa satu pun peringatan. Field `umur` yang bernilai `undefined` **menghilang seluruhnya**, bukan menjadi `null`, sehingga klien menerima objek yang bahkan tidak punya kuncinya. Field `hitung` juga hilang karena fungsi bukan tipe JSON. Field `dibuat` yang tadinya objek `Date` menjadi **string**, jadi di sisi penerima `data.dibuat.getFullYear()` akan gagal. Dan `tag` yang berupa `Set` menjadi `{}`, yaitu objek kosong, sehingga isinya benar-benar musnah.',
      ),
      p(
        'Perbedaan antara `undefined` dan `null` di sini bukan detail. Sebuah endpoint yang membedakan "field ini tidak dikirim" dari "field ini sengaja dikosongkan" akan salah membaca niat klien kalau klien memakai `undefined`, sebab yang tiba di server adalah ketiadaan kunci, bukan nilai kosong.',
      ),
      table(
        ['Tipe di JavaScript', 'Jadi apa di JSON', 'Yang harus dilakukan'],
        [
          [
            '`undefined`',
            'Kuncinya hilang seluruhnya',
            'Pakai `null` bila memang ingin menyatakan kosong',
          ],
          ['`Date`', 'String ISO 8601', 'Ubah kembali di penerima, atau pakai pustaka tanggal'],
          ['`Set`, `Map`', '`{}` — isinya musnah', 'Ubah jadi array lebih dulu'],
          [
            '`NaN`, `Infinity`',
            '`null`',
            'Periksa sebelum mengirim; `null` menyembunyikan bug hitungnya',
          ],
          ['`BigInt`', 'Melempar `TypeError`', 'Kirim sebagai string'],
          [
            'Fungsi',
            'Kuncinya hilang',
            'Tidak ada yang perlu dikirim; ini biasanya tanda salah rancang',
          ],
        ],
      ),
      p(
        'Dua baris terakhir dari daftar itu berperilaku berbeda dari yang lain, dan salah satunya justru berteriak.',
      ),
      code(
        'text',
        `
        JSON.stringify({ id: 9007199254740993n })
          TypeError: Do not know how to serialize a BigInt

        const a = { nama: 'a' }; a.diri = a;
        JSON.stringify(a)
          TypeError: Converting circular structure to JSON
              --> starting at object with constructor 'Object'
              --- property 'diri' closes the circle
        `,
        {
          caption:
            'Dijalankan sungguhan. Dua-duanya melempar, dan pesan yang kedua menunjuk properti penyebabnya.',
        },
      ),
      p(
        'Pesan referensi melingkar itu sangat berguna karena menyebutkan nama properti yang menutup lingkarannya. Di project nyata, penyebab paling sering adalah objek ORM yang membawa relasi dua arah, misalnya `pesanan.pelanggan.pesanan`, atau objek `req` dan `res` Express yang saling menunjuk dan tanpa sengaja ikut masuk ke sebuah log.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Sekarang sisi sebaliknya, yaitu `JSON.parse`. Semua pesan di bawah dihasilkan sungguhan, dan yang pertama adalah error yang paling sering dilihat pemrogram backend sepanjang karirnya.',
      ),
      code(
        'text',
        `
        1. Server menjawab halaman HTML, bukan JSON
             SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON

        2. Badan responsnya kosong (misalnya 204 No Content)
             SyntaxError: Unexpected end of JSON input

        3. Nilainya undefined (respons belum diambil, atau salah nama field)
             SyntaxError: "undefined" is not valid JSON

        4. Trailing comma — sah di JavaScript, TIDAK sah di JSON
             {"a":1,}
             SyntaxError: Expected double-quoted property name in JSON at position 7 (line 1 column 8)

        5. Kutip tunggal — sah di JavaScript, TIDAK sah di JSON
             {'a':1}
             SyntaxError: Expected property name or '}' in JSON at position 1 (line 1 column 2)
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Error nomor satu pantas dihafal bentuknya, sebab ia hampir selalu berarti hal yang sama, yaitu **kamu memanggil alamat yang salah dan mendapat halaman error**. Server proxy, gateway, dan load balancer menjawab kegagalan dengan halaman HTML, jadi `<!doctype` di awal pesan adalah petunjuk bahwa yang menjawab bukan aplikasimu. Yang perlu diperiksa bukan JSON-nya melainkan status code dan alamat yang dituju.',
      ),
      p(
        'Nomor dua dan tiga punya akar yang sama, yaitu memanggil `.json()` tanpa memeriksa apa yang sebenarnya diterima. Respons `204 No Content` sengaja tidak berbadan, dan `DELETE` yang benar biasanya menjawab dengan itu.',
      ),
      code(
        'ts',
        `
        // Pembacaan respons yang tidak akan menghasilkan lima error di atas.
        async function ambilJson(url: string, opsi?: RequestInit) {
          const r = await fetch(url, opsi);

          // 1. Periksa status LEBIH DULU. fetch tidak melempar untuk 404 maupun 500.
          if (!r.ok) {
            const teks = await r.text();          // .text() aman untuk apa pun
            throw new Error(\`HTTP \${r.status} dari \${url}: \${teks.slice(0, 200)}\`);
          }

          // 2. 204 dan 205 memang tidak berbadan, jadi jangan diurai.
          if (r.status === 204 || r.status === 205) return null;

          // 3. Pastikan yang datang memang JSON, bukan halaman HTML.
          const tipe = r.headers.get('content-type') ?? '';
          if (!tipe.includes('application/json')) {
            const teks = await r.text();
            throw new Error(\`Diharapkan JSON, diterima "\${tipe}": \${teks.slice(0, 200)}\`);
          }

          return r.json();
        }
        `,
        {
          caption:
            'Tiga pemeriksaan ini menutup kelima error di atas, dan pesannya menyebutkan apa yang sebenarnya diterima.',
        },
      ),
      p(
        'Bagian `teks.slice(0, 200)` di dalam pesan error itu bukan hiasan. Ketika sesuatu gagal di produksi, potongan awal respons aslinya adalah keterangan yang paling cepat menjawab pertanyaan "siapa yang sebenarnya menjawab", dan tanpa itu kamu hanya tahu bahwa penguraian gagal.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'JSON terlihat sederhana, dan sebagian besar kesalahan justru berasal dari menganggapnya sama dengan objek JavaScript.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memanggil `.json()` tanpa memeriksa status',
            'Servernya biasanya menjawab JSON',
            "Diuji sungguhan, halaman error HTML menghasilkan `Unexpected token '<'` yang menyesatkan penelusuran",
          ],
          [
            'Menguraikan badan respons `204`',
            'Semua respons kan punya badan',
            'Diuji sungguhan, hasilnya `Unexpected end of JSON input`. `204` memang tanpa badan',
          ],
          [
            'Memakai `undefined` untuk menyatakan kosong',
            'Sama saja dengan `null`',
            'Diuji sungguhan, kuncinya hilang seluruhnya dari JSON. Server tidak bisa membedakannya dari tidak dikirim',
          ],
          [
            'Mengharapkan `Date` tetap `Date` setelah dikirim',
            'Tipenya kan sudah benar di server',
            'Diuji sungguhan, ia menjadi string. Pemanggilan `.getFullYear()` di penerima akan gagal',
          ],
          [
            'Menyimpan uang sebagai angka pecahan',
            'Harga memang pecahan',
            'Diuji sungguhan, `19.99 * 100` menghasilkan `1998.9999999999998`. Simpan dalam satuan terkecil sebagai bilangan bulat',
          ],
          [
            'Menyalin JSON dari kode JavaScript apa adanya',
            'Bentuknya kan sama',
            'Diuji sungguhan, trailing comma dan kutip tunggal keduanya ditolak. JSON lebih ketat daripada JavaScript',
          ],
        ],
      ),
      p(
        'Baris kelima adalah keputusan yang paling mahal diubah belakangan, dan angkanya layak dilihat. Perkalian `19.99 * 100` tidak menghasilkan `1999` melainkan `1998.9999999999998`, sebab `19.99` tidak bisa diwakili tepat dalam bilangan pecahan biner. Selisih sekecil itu tidak terlihat pada satu transaksi dan menjadi selisih yang tidak bisa dijelaskan pada laporan bulanan. Karena itu uang disimpan sebagai bilangan bulat dalam satuan terkecil, misalnya rupiah utuh atau sen, lalu diberi titik desimal hanya pada saat ditampilkan.',
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
    19,
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
          term: 'deletion test',
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
      p(
        'Bacalah diagram itu sebagai **satu arah panah**, sebab setiap lapisan hanya memanggil lapisan di bawahnya, tidak pernah ke atas dan tidak pernah melompat. Controller tidak boleh langsung menyentuh Database walau secara teknis bisa, sebab begitu lompatan itu dibuat, aturan bisnis yang seharusnya dijaga Service jadi mudah terlewat. Perhatikan juga keterangan di baris Service: *bagian yang benar-benar milikmu*. Route, Controller, dan Repository sebagian besar berisi pola yang mirip di semua project, sedangkan Service-lah yang berisi keputusan khas produkmu seperti siapa boleh membatalkan pesanan, kapan stok dikurangi, dan berapa lama tautan kedaluwarsa. Itu sebabnya lapisan tengah dijaga paling ketat kebersihannya.',
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
      p(
        'Kedua kolom menyelesaikan pekerjaan yang sama, yaitu mengambil satu baris data, tetapi kolom kiri melewati tujuh perhentian untuk melakukannya. Biayanya bukan performa melainkan **waktu paham**, sebab untuk mengubah satu perilaku kecil, seseorang harus membuka tujuh berkas dan menahan ketujuhnya di kepala sekaligus. Catatan "Tidak ada yang dilindungi" adalah inti kritiknya, sebab DAO, Mapper, dan Entity di sana hanya meneruskan nilai tanpa menambah aturan apa pun, jadi lapisannya tidak melindungi apa-apa. Kolom kanan bukan berarti "tiga lapisan selamanya", sebab kalimat terakhirnya berbunyi *tambah lapisan hanya saat ada masalah nyata*. Lapisan keempat sah begitu kamu benar-benar punya dua sumber data yang harus disatukan; yang tidak sah adalah menambahkannya lebih dulu untuk masalah yang belum ada.',
      ),
      callout(
        'tip',
        'Deletion test',
        'Untuk setiap lapisan, tanyakan: *kalau lapisan ini dihapus, apakah kerumitannya hilang, atau justru pindah ke pemanggilnya?* Kalau hilang, lapisan itu memang tidak menanggung apa pun. Lapisan yang layak ada adalah yang **menyerap** kerumitan, bukan yang meneruskannya.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Pelanggaran lapisan biasanya dibicarakan sebagai soal kerapian, dan itu membuatnya mudah ditunda. Berikut satu contoh yang menunjukkan bahwa ia bukan soal kerapian sama sekali, sebab akibatnya adalah aplikasi yang tidak bisa dijalankan.',
      ),
      p(
        'Bayangkan sebuah API pesanan dengan tiga lapisan yang wajar, yaitu controller yang menerima permintaan, service yang memuat aturan bisnis, dan repository yang berbicara dengan database. Suatu hari seseorang butuh sebuah ringkasan di dalam repository, dan cara tercepatnya adalah memanggil fungsi hitung yang sudah ada di service.',
      ),
      code(
        'text',
        `
        service.cjs      butuh data      ->  require('./repo.cjs')
        repo.cjs         butuh hitungan  ->  require('./service.cjs')

        Lingkarannya lahir. Yang terjadi saat dijalankan:

          TypeError: ambilPesanan is not a function
              at Object.<anonymous> (.../service.cjs:4:16)
              at Module._compile (node:internal/modules/cjs/loader:1934:14)
              at Module.load (node:internal/modules/cjs/loader:1656:32)
              at Module.require (node:internal/modules/cjs/loader:1679:12)
              at Object.<anonymous> (.../repo.cjs:2:25)
                                          ^^^^^^^^^^^^
                                          jejaknya menunjuk kembali ke repo
        `,
        {
          caption:
            'Dijalankan sungguhan dengan Node 26.5.0. Jejak tumpukannya memperlihatkan lingkarannya.',
        },
      ),
      p(
        'Penyebabnya mekanis dan berguna dipahami. Ketika `repo` mulai dimuat, ia meminta `service`. `service` lalu meminta `repo` yang **masih separuh dimuat**, sehingga yang diterimanya adalah objek ekspor yang belum berisi apa pun. Karena `service` memanggil `ambilPesanan` langsung di tingkat modul, ia memanggil `undefined`, dan aplikasinya berhenti sebelum satu permintaan pun dilayani.',
      ),
      p(
        'Ada bentuk yang lebih jahat dari kegagalan ini, yaitu ketika pemanggilannya berada di dalam fungsi sehingga tidak pernah terjadi saat pemuatan.',
      ),
      code(
        'text',
        `
        Versi yang memanggil di dalam fungsi, bukan di tingkat modul:

          2000
          (node:478812) Warning: Accessing non-existent property 'hitungTotal'
                                 of module exports inside circular dependency
        `,
        {
          caption:
            'Dijalankan sungguhan. Aplikasinya BERJALAN dan hasilnya benar, hanya menyisakan satu peringatan.',
        },
      ),
      p(
        'Inilah bentuk yang biasanya bertahan bertahun-tahun di dalam repo. Hasilnya benar, testnya lulus, dan yang tersisa hanya satu baris peringatan yang bercampur dengan keluaran lain lalu tidak terbaca siapa pun. Ia menjadi masalah pada hari seseorang memindahkan satu pemanggilan ke tingkat modul, dan pada hari itu penyebabnya terlihat seperti perubahan yang tidak berhubungan.',
      ),
      p(
        'Perlu satu catatan jujur di sini supaya tidak menyimpulkan berlebihan. Bentuk modul yang lebih baru, yaitu ESM dengan `import`, **tidak** gagal pada kasus yang sama.',
      ),
      code(
        'text',
        `
        Lingkaran yang sama persis, ditulis dengan import/export:

          { total: 2000 }

        Tanpa error, tanpa peringatan.
        `,
        {
          caption:
            'Dijalankan sungguhan. ESM memakai live binding, jadi deklarasi fungsi sudah terjangkau lebih awal.',
        },
      ),
      p(
        'Jadi pada project ESM, lingkaran ketergantungan tidak selalu menghasilkan tanda apa pun, dan itu justru memperkuat alasan menjaga arah ketergantungan secara sengaja. Yang menahannya bukan pesan error dari Node melainkan keputusan arsitektur, yaitu **ketergantungan hanya mengalir satu arah**.',
      ),
      code(
        'text',
        `
        Arah yang benar, dan tidak pernah sebaliknya:

          controller  ->  service  ->  repository  ->  database
             (HTTP)      (aturan)      (query)

        Aturannya satu baris: lapisan bawah TIDAK PERNAH mengimpor lapisan atas.

        Kalau repository butuh sebuah perhitungan:
          - pindahkan perhitungan itu ke tempat yang lebih rendah (util murni), atau
          - biarkan service yang memanggil keduanya lalu menggabungkan hasilnya

        Kalau service butuh tahu status HTTP:
          - jangan. Service melempar error domain, controller yang menerjemahkannya
            menjadi status code
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan arsitektur yang kedua tidak berupa error runtime melainkan **error yang mustahil ditulis testnya**. Gejalanya adalah aturan bisnis yang tidak bisa diuji tanpa menyalakan server HTTP dan database sekaligus.',
      ),
      code(
        'ts',
        `
        // Semua tercampur di satu tempat. Ini yang paling sering ditulis pertama kali.
        app.post('/pesanan', async (req, res) => {
          const { itemId, jumlah } = req.body;

          const item = await db.query('SELECT * FROM item WHERE id = $1', [itemId]);
          if (!item) return res.status(404).json({ error: 'Item tidak ada' });
          if (item.stok < jumlah) return res.status(409).json({ error: 'Stok kurang' });

          const diskon = jumlah >= 12 ? 0.1 : jumlah >= 6 ? 0.05 : 0;
          const total = Math.round(item.harga * jumlah * (1 - diskon));

          await db.query('INSERT INTO pesanan (item_id, jumlah, total) VALUES ($1,$2,$3)',
            [itemId, jumlah, total]);
          res.status(201).json({ total, diskon });
        });

        // Untuk menguji SATU aturan diskon, kamu harus:
        //   - menyalakan server HTTP
        //   - menyiapkan database beserta datanya
        //   - mengirim permintaan HTTP sungguhan
        //   - membaca status code untuk memastikan hitungannya benar
        //
        // Padahal yang ingin diuji cuma: "beli 6 dapat 5%, beli 12 dapat 10%".
        `,
        {
          caption:
            'Aturan bisnisnya benar. Yang salah adalah tempatnya, dan itu membuatnya tidak terjangkau test.',
        },
      ),
      p(
        'Perbaikannya tidak menambah lapisan demi kerapian, melainkan memindahkan **satu hal** ke tempat yang tidak bergantung pada apa pun.',
      ),
      code(
        'ts',
        `
        // aturan/diskon.ts — fungsi murni. Tanpa HTTP, tanpa database, tanpa async.
        export function hitungDiskon(jumlah: number): number {
          if (jumlah >= 12) return 0.1;
          if (jumlah >= 6) return 0.05;
          return 0;
        }

        export function hitungTotal(harga: number, jumlah: number): number {
          return Math.round(harga * jumlah * (1 - hitungDiskon(jumlah)));
        }

        // Testnya sekarang tidak butuh apa pun selain fungsinya.
        // Termasuk jalur yang tidak nyaman, dan justru di situ nilainya:
        //   hitungDiskon(0)   -> 0
        //   hitungDiskon(5)   -> 0
        //   hitungDiskon(6)   -> 0.05      <- tepat di batas
        //   hitungDiskon(11)  -> 0.05
        //   hitungDiskon(12)  -> 0.1       <- tepat di batas
        //   hitungTotal(19_990, 1) -> 19990
        `,
        {
          caption:
            'Nilai lapisan bukan kerapian, melainkan bahwa aturan bisnisnya bisa diuji tanpa dunia luar.',
        },
      ),
      p(
        'Dua pengujian di batas, yaitu 6 dan 12, adalah tempat kesalahan `>=` melawan `>` bersembunyi, dan keduanya mustahil diuji dengan nyaman selama aturan itu masih tinggal di dalam handler HTTP.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan arsitektur punya sifat khas, yaitu tidak terasa mahal saat dilakukan dan sangat mahal saat harus dibongkar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis query database langsung di handler rute',
            'Paling singkat dan langsung terlihat',
            'Aturan bisnisnya jadi hanya bisa diuji lewat HTTP dan database sungguhan',
          ],
          [
            'Memanggil service dari repository',
            'Fungsinya sudah ada di sana',
            'Diuji sungguhan, lingkarannya menghasilkan `TypeError: ambilPesanan is not a function` saat pemuatan',
          ],
          [
            'Mengabaikan peringatan circular dependency',
            'Aplikasinya tetap berjalan',
            'Diuji sungguhan, ia berjalan sampai satu pemanggilan dipindah ke tingkat modul, lalu mati mendadak',
          ],
          [
            'Mengembalikan `res` dari dalam service',
            'Lebih sedikit kode perantara',
            'Service jadi terikat HTTP dan tidak bisa dipakai job latar maupun perintah CLI',
          ],
          [
            'Membuat folder untuk setiap konsep sejak awal',
            'Terlihat profesional',
            'Lapisan tanpa isi hanya menambah tempat yang harus dibuka. Tambah lapisan saat ada dua pemakai, bukan sebelumnya',
          ],
          [
            'Mulai dengan microservice',
            'Terdengar lebih siap tumbuh',
            'Menambah jaringan, penemuan layanan, dan penelusuran terdistribusi sebelum ada masalah yang membutuhkannya',
          ],
        ],
      ),
      p(
        'Baris terakhir layak ditegaskan karena ia keputusan yang paling sering diambil dari alasan yang salah. Monolith yang tersusun berlapis dengan baik bisa melayani sangat banyak pengguna, dan memecahnya menjadi layanan terpisah menukar satu masalah, yaitu kode yang besar, dengan sekumpulan masalah baru berupa kegagalan jaringan, konsistensi data lintas layanan, dan penelusuran satu permintaan yang melewati lima proses. Pecah sebuah bagian ketika ia benar-benar punya alasan sendiri untuk berskala atau dirilis terpisah, bukan karena bentuknya terdengar lebih modern.',
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
    19,
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
      p(
        'Dua berkas ini punya nama yang mirip tetapi nasib yang berlawanan, sebab `.env` tidak pernah masuk git sedangkan `.env.example` justru wajib masuk. Bandingkan isinya baris per baris, karena **nama variabelnya identik dan nilainya yang berbeda**. Itulah gunanya, sebab `.env.example` menjawab pertanyaan "apa saja yang harus saya isi" bagi orang baru yang baru meng-clone repo, tanpa membocorkan satu pun rahasia. Perhatikan `PORT` dan `NODE_ENV` tetap terisi di contoh, sebab keduanya bukan rahasia melainkan hanya nilai bawaan yang masuk akal. Yang dikosongkan hanya `DATABASE_URL` dan `JWT_SECRET`, dua baris yang kalau bocor memberi penyerang akses langsung ke data dan kemampuan memalsukan token siapa pun.',
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
      p(
        "Perbedaan kedua baris itu cuma satu operator, tapi akibatnya berlawanan. Kuncinya, kalau variabelnya **tidak dipasang sama sekali**, `process.env.CORS_ALL` bernilai `undefined`. Pada baris pertama, `undefined !== 'false'` bernilai `true`, jadi lupa memasang variabel berarti membuka API ke seluruh origin di internet. Pada baris kedua, `undefined === 'true'` bernilai `false`, sehingga kelalaian yang sama justru menghasilkan pilihan paling ketat. Aturannya bisa dipakai di mana saja di luar CORS, yaitu susun perbandinganmu supaya **ketiadaan nilai jatuh ke sisi yang aman**, karena variabel yang lupa dipasang adalah kejadian rutin saat menyiapkan lingkungan baru, bukan pengecualian langka.",
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
      p(
        'Perhatikan siapa yang menulis berkas di baris itu: **bukan `server.js`**, melainkan `tee` di luar aplikasi. Aplikasinya sendiri hanya memanggil `console.log` dan tidak tahu tujuannya ke mana. Justru di situ kekuatannya — proses yang sama bisa dijalankan di laptopmu (log muncul di terminal), di dalam kontainer (Docker yang menangkapnya), atau di penyedia hosting (yang mengirimnya ke layanan pemantauan), semuanya **tanpa satu baris kode pun berubah**. Sebaliknya, aplikasi yang membuka berkas log sendiri harus tahu jalurnya, mengurus rotasi agar disk tidak penuh, dan akan bentrok ketika dua salinan proses menulis ke berkas yang sama.',
      ),
      h2('Studi kasus di project nyata'),
      p(
        'Konfigurasi adalah penyebab kegagalan deploy yang lebih sering daripada kode itu sendiri, dan sebabnya satu sifat yang mudah dilupakan, yaitu **seluruh isi `process.env` adalah string, tanpa kecuali**. Tidak ada angka, tidak ada boolean, dan tidak ada nilai kosong yang berarti kosong.',
      ),
      code(
        'text',
        `
        PORT=3000  DEBUG=false  MAX_UPLOAD=   (dikosongkan)

          typeof process.env.PORT   = string
          PORT + 1                  = "30001"   <- penggabungan teks, bukan penjumlahan
          Number(PORT) + 1          = 3001

          DEBUG                     = "false"
          if (DEBUG) berjalan?      = YA        <- "false" itu string berisi, jadi truthy

          Number(MAX_UPLOAD)        = 0         <- Number("") bernilai 0, bukan NaN
          Number(TIDAK_ADA)         = NaN
          parseInt(TIDAK_ADA, 10)   = NaN
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0.' },
      ),
      p(
        'Baris `if (DEBUG) berjalan? = YA` adalah bug yang paling sering lolos sampai produksi. Seseorang menyetel `DEBUG=false` dengan maksud mematikannya, dan yang tiba di kode adalah string `"false"` yang panjangnya lima karakter sehingga bernilai benar dalam pemeriksaan kebenaran. Akibatnya log rinci menyala di produksi, dan log rinci sering memuat isi permintaan lengkap dengan datanya.',
      ),
      p(
        'Baris `Number("") = 0` sama berbahayanya dengan cara berbeda. Sebuah variabel yang dideklarasikan tapi dikosongkan tidak menghasilkan `NaN` yang mencurigakan melainkan angka nol yang terlihat sah. Batas unggahan nol byte, jumlah percobaan ulang nol, atau batas waktu nol semuanya berupa nilai yang lolos pemeriksaan sederhana dan berperilaku aneh.',
      ),
      p(
        'Jawaban atas ketiganya adalah satu tempat masuk yang memvalidasi dan mengubah tipe sekaligus, dijalankan **saat boot**. Project ini memasang `zod`, jadi contoh di bawah dijalankan sungguhan dengan versi yang benar-benar terpasang.',
      ),
      code(
        'ts',
        `
        // config/env.ts — dibaca SATU KALI, saat proses menyala.
        import { z } from 'zod';

        const Skema = z.object({
          NODE_ENV: z.enum(['development', 'test', 'production']),
          PORT: z.coerce.number().int().min(1).max(65535).default(3000),
          DATABASE_URL: z.string().url(),
          JWT_SECRET: z.string().min(32),
          DEBUG: z.enum(['true', 'false']).transform((v) => v === 'true').default('false'),
        });

        // .parse melempar bila ada yang salah, dan itu memang yang diinginkan:
        // proses menolak menyala, bukan menyala lalu rusak di permintaan pertama.
        export const env = Skema.parse(process.env);
        `,
        {
          caption:
            'z.coerce mengubah string jadi angka; transform mengubah "true"/"false" jadi boolean sungguhan.',
        },
      ),
      code(
        'text',
        `
        Hasil untuk nilai yang benar:

          {"NODE_ENV":"production","PORT":8080,"DATABASE_URL":"postgres://user:sandi@db:5432/toko",
           "JWT_SECRET":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","DEBUG":true}

          typeof PORT  = number
          typeof DEBUG = boolean
        `,
        { caption: 'Dijalankan sungguhan dengan zod 4.4.3 yang terpasang di project ini.' },
      ),
      p(
        'Dua baris terakhir itu yang membuat seluruh pekerjaannya sepadan. Setelah titik ini, tidak ada lagi tempat di dalam aplikasi yang perlu menulis `Number(process.env.PORT)`, dan tidak ada lagi tempat yang bisa salah membaca `"false"` sebagai benar.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Keuntungan terbesar validasi di titik boot baru terlihat ketika konfigurasinya salah. Berikut keluaran sungguhan untuk environment yang kacau, dengan `NODE_ENV` salah eja, `PORT` bukan angka, `DATABASE_URL` tidak ada, dan `JWT_SECRET` terlalu pendek.',
      ),
      code(
        'text',
        `
        [
          {
            "code": "invalid_value",
            "values": ["development", "test", "production"],
            "path": ["NODE_ENV"],
            "message": "Invalid option: expected one of \\"development\\"|\\"test\\"|\\"production\\""
          },
          {
            "expected": "number",
            "code": "invalid_type",
            "received": "NaN",
            "path": ["PORT"],
            "message": "Invalid input: expected number, received NaN"
          },
          {
            "expected": "string",
            "code": "invalid_type",
            "path": ["DATABASE_URL"],
            "message": "Invalid input: expected string, received undefined"
          },
          {
            "origin": "string",
            "code": "too_small",
            "minimum": 32,
            "path": ["JWT_SECRET"],
            "message": "Too small: expected string to have >=32 characters"
          }
        ]
        `,
        {
          caption:
            'Dijalankan sungguhan dengan zod 4.4.3. Empat masalah dilaporkan sekaligus, bukan satu per satu.',
        },
      ),
      p(
        'Kata "sekaligus" di situ adalah keuntungan yang mudah diremehkan. Tanpa validasi terpusat, empat masalah ini muncul berurutan dalam empat siklus deploy terpisah, masing-masing memakan waktu tunggu build dan masing-masing tampak sebagai bug baru. Dengan satu skema, semuanya terlihat dalam satu kali jalan sebelum servernya bahkan mulai mendengarkan.',
      ),
      p(
        'Bandingkan dengan bentuk kegagalan yang terjadi ketika konfigurasi dibaca tersebar di banyak tempat.',
      ),
      code(
        'text',
        `
        Tanpa validasi terpusat, ini yang terlihat di produksi:

          [09:14:02] Server siap di port NaN
          [09:14:02] Terhubung ke database
          ... tiga jam berlalu, semuanya tampak normal ...
          [12:41:55] TypeError: Cannot read properties of undefined (reading 'sign')
              at buatToken (/app/src/auth/token.js:12:29)

        Servernya menyala dengan port NaN dan tidak ada yang menyadari.
        JWT_SECRET yang hilang baru terasa pada login PERTAMA, jam berapa pun itu.
        `,
      ),
      p(
        'Inilah yang dimaksud gagal cepat. Proses yang menolak menyala karena satu variabel hilang jauh lebih murah daripada proses yang menyala, dinyatakan sehat oleh pemeriksa kesehatan, menerima lalu lintas, lalu gagal pada permintaan pertama yang menyentuh bagian itu. Yang kedua terlihat seperti bug aplikasi, dan penelusurannya dimulai dari tempat yang salah.',
      ),
      callout(
        'danger',
        'Rahasia yang pernah masuk git dianggap sudah bocor',
        'Menghapus berkas `.env` dari commit terakhir tidak menghapusnya dari riwayat, dan riwayat itu ada di setiap salinan repo yang pernah diambil siapa pun. Satu-satunya perbaikan yang sungguhan adalah **mengganti rahasianya**, bukan membersihkan riwayatnya. Karena itu `.env` masuk `.gitignore` sejak commit pertama, dan yang ikut ke repo hanya `.env.example` berisi nama variabel dengan nilai kosong.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Konfigurasi terasa seperti pekerjaan administratif, dan justru karena itu ia sering dikerjakan tanpa keputusan sadar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `process.env.DEBUG` sebagai boolean',
            'Isinya kan `false`',
            'Diuji sungguhan, `"false"` adalah string berisi sehingga truthy. Log rinci menyala di produksi',
          ],
          [
            'Memakai `Number(process.env.X)` di tempat pemakaian',
            'Diubah saat dibutuhkan saja',
            'Diuji sungguhan, `Number("")` bernilai 0 dan lolos pemeriksaan sederhana. Ubah tipe sekali di titik boot',
          ],
          [
            'Membaca `process.env` tersebar di banyak berkas',
            'Praktis, tinggal panggil',
            'Tidak ada satu tempat pun yang tahu variabel apa saja yang dibutuhkan aplikasi ini',
          ],
          [
            'Memberi nilai bawaan untuk rahasia',
            'Supaya jalan di komputer sendiri',
            'Nilai bawaan itu ikut ke produksi ketika variabelnya lupa dipasang. Rahasia tidak pernah punya bawaan',
          ],
          [
            'Menaruh `.env` di repo "sementara saja"',
            'Nanti dihapus',
            'Riwayat git menyimpannya selamanya. Rahasianya harus diganti, bukan sekadar dihapus',
          ],
          [
            'Membiarkan aplikasi menyala meski konfigurasinya kurang',
            'Yang lain kan masih bisa jalan',
            'Kegagalannya pindah ke permintaan pengguna pertama, dan terlihat seperti bug aplikasi',
          ],
        ],
      ),
      p(
        'Baris keempat pantas diperjelas karena batasnya halus. Nilai bawaan sangat berguna untuk hal yang tidak berbahaya bila salah, misalnya `PORT` dan tingkat log. Ia berbahaya untuk hal yang menentukan keamanan, misalnya kunci penandatanganan token, kata sandi database, dan daftar asal yang diizinkan. Aturan yang mudah dipegang, kalau sebuah nilai bawaan bisa membuat sistem tetap berjalan **dengan tingkat keamanan lebih rendah**, jangan beri bawaan. Biarkan ia menolak menyala.',
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
    18,
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
          term: 'unhappy path',
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
            'Setiap baris log yang layak ditulis menjawab: **kapan**, **siapa**, **apa yang diminta**, **apa hasilnya**, dan **correlation id-nya**. Kurang dari itu, log jadi arsip yang tidak bisa dipakai menelusuri apa pun.',
        },
        {
          term: 'correlation id',
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
      p(
        'Lima varian di atas sebenarnya menjawab lima pertanyaan berbeda, dan memilih yang tepat menghemat banyak waktu menebak. `-I` hanya meminta header, berguna saat yang ingin kamu pastikan adalah status atau `Content-Type` alih-alih isinya. `-X POST` dengan `-H "Content-Type: application/json"` menunjukkan pasangan yang tidak boleh dipisah, sebab tanpa header itu server tidak akan mem-parse `-d` sebagai JSON dan body-mu berakhir kosong. `-v` mencetak **kedua sisi** percakapan, jadi ia yang kamu pakai ketika curiga permintaanmu sendiri yang salah bentuk alih-alih jawabannya. Yang terakhir sengaja membuang seluruh body ke `/dev/null` dan hanya mencetak angka status, dan bentuk inilah yang bisa dipakai di skrip CI, karena keluarannya satu baris yang mudah dibandingkan.',
      ),
      callout(
        'tip',
        'Kenapa `curl`, padahal ada Postman',
        '`curl` bisa disalin ke mana pun: ke isu, ke pesan tim, ke skrip CI, ke dokumentasi. Ia tidak butuh dipasang, tidak butuh akun, dan tidak menyembunyikan apa pun. Postman lebih nyaman untuk eksplorasi berulang; `curl` lebih baik untuk **membuktikan**.',
      ),

      h2('Menguji unhappy path, bukan hanya jalur sukses'),
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
        'Log yang berguna selalu punya lima hal: **kapan, siapa, apa yang diminta, apa hasilnya, dan correlation id**.',
      ),
      callout(
        'danger',
        'Yang tidak boleh masuk log',
        'Password, token, isi `Authorization`, nomor kartu, dan data pribadi mentah. "Log seluruh request body supaya gampang debug" adalah cara paling umum kredensial berakhir di sistem pencatatan yang diakses banyak orang dan disimpan bertahun-tahun.',
      ),

      h2('Correlation id'),
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
      h2('Studi kasus di project nyata'),
      p(
        'Laporan bug yang paling sering diterima pemrogram backend berbunyi seperti ini, "kadang gagal simpan". Tidak ada langkah, tidak ada waktu, dan tidak ada pesan. Yang membedakan penelusuran satu jam dari penelusuran tiga hari bukan kepintaran melainkan apakah **satu permintaan bisa dilacak dari klien sampai log server**.',
      ),
      p(
        'Berikut sebuah server yang menuliskan satu baris log terstruktur untuk setiap permintaan, dijalankan sungguhan lalu dihampiri `curl` untuk lima keadaan berbeda.',
      ),
      code(
        'text',
        `
        {"level":"info","waktu":"2026-09-07T08:36:34.988Z","requestId":"9546c1ef-...","method":"GET","path":"/catatan","status":200,"durasiMs":4.39}
        {"level":"warn","waktu":"2026-09-07T08:36:34.998Z","requestId":"f070e263-...","method":"POST","path":"/catatan","status":400,"durasiMs":0.88}
        {"level":"warn","waktu":"2026-09-07T08:36:35.004Z","requestId":"a55084a3-...","method":"POST","path":"/catatan","status":422,"durasiMs":0.27}
        {"level":"warn","waktu":"2026-09-07T08:36:35.010Z","requestId":"f5977bbc-...","method":"GET","path":"/rahasia","status":401,"durasiMs":0.18}
        {"level":"error","waktu":"2026-09-07T08:36:35.016Z","requestId":"8aaf7722-...","method":"GET","path":"/rusak","status":500,"durasiMs":0.22}
        {"level":"info","waktu":"2026-09-07T08:36:35.023Z","requestId":"jejak-manual-123","method":"GET","path":"/catatan","status":200,"durasiMs":0.92}
        `,
        { caption: 'Dijalankan sungguhan dengan Node 26.5.0 dan curl 8.5.0.' },
      ),
      p(
        'Tiga keputusan di dalam baris-baris itu yang membuatnya berguna. Yang pertama, formatnya JSON satu baris per permintaan, sehingga bisa disaring dengan perintah biasa maupun dikirim ke sistem pencarian log tanpa penguraian khusus. Yang kedua, `level` ditentukan dari status code, sehingga `4xx` menjadi `warn` yang berarti "pengguna salah" dan `5xx` menjadi `error` yang berarti "kita salah". Yang ketiga, dan yang paling menentukan, setiap baris membawa `requestId`.',
      ),
      p(
        'Baris terakhir memperlihatkan gunanya. `requestId` di situ bukan acak melainkan `jejak-manual-123`, sebab nilainya dikirim klien.',
      ),
      code(
        'text',
        `
        Yang dijalankan:

          curl -D- -o /dev/null -H 'X-Request-Id: jejak-manual-123' \\
               http://127.0.0.1:3998/catatan

        Yang muncul di header respons:

          X-Request-Id: jejak-manual-123

        Yang muncul di log server:

          {"level":"info", ... ,"requestId":"jejak-manual-123", ... }
        `,
        {
          caption:
            'Dijalankan sungguhan. Satu nilai yang sama menghubungkan klien, respons, dan log.',
        },
      ),
      p(
        'Pola yang dipakai server itu ada di satu baris, yaitu pakai `X-Request-Id` yang dikirim klien bila ada, kalau tidak buat baru dengan `randomUUID()`, lalu **kembalikan nilainya di header respons**. Pengembalian itu bagian yang paling sering dilupakan, dan tanpanya pengguna yang melaporkan bug tidak punya apa pun untuk disebutkan. Dengan itu, laporan "kadang gagal simpan" berubah menjadi satu id yang langsung menemukan barisnya.',
      ),
      code(
        'ts',
        `
        // Middleware yang cukup untuk seluruh manfaat di atas.
        import { randomUUID } from 'node:crypto';

        app.use((req, res, next) => {
          // Terima id dari klien supaya satu permintaan yang melewati beberapa
          // layanan tetap punya satu jejak. Buat baru bila ini pintu pertamanya.
          const rid = req.header('x-request-id') ?? randomUUID();
          res.setHeader('X-Request-Id', rid);
          res.locals.requestId = rid;

          const mulai = process.hrtime.bigint();
          res.on('finish', () => {
            const durasiMs = Number(process.hrtime.bigint() - mulai) / 1e6;
            console.log(
              JSON.stringify({
                level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
                waktu: new Date().toISOString(),
                requestId: rid,
                method: req.method,
                path: req.originalUrl,
                status: res.statusCode,
                durasiMs: Math.round(durasiMs * 100) / 100,
              }),
            );
          });
          next();
        });
        `,
        { caption: 'Dicatat pada peristiwa finish, supaya status dan durasinya sudah pasti.' },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Nilai `curl` bukan pada jalur sukses melainkan pada jalur yang tidak nyaman, dan justru itu bagian yang paling sering tidak pernah dicoba manual. Empat pemanggilan berikut dijalankan sungguhan terhadap endpoint yang sama.',
      ),
      code(
        'text',
        `
        1. Badan permintaan bukan JSON yang sah
             curl -i -X POST http://127.0.0.1:3998/catatan \\
                  -H 'Content-Type: application/json' -d '{judul: "Belanja"}'

             HTTP/1.1 400 Bad Request
             X-Request-Id: f070e263-ed1d-4779-a85f-8c27493bca1a
             {"error":"Badan permintaan bukan JSON yang sah"}

        2. JSON sah, isinya tidak valid
             -d '{"judul":"   "}'

             HTTP/1.1 422 Unprocessable Entity
             {"error":"Validasi gagal","detail":[{"field":"judul","pesan":"wajib diisi"}]}

        3. Tanpa autentikasi
             curl -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3998/rahasia
             401

        4. Kesalahan di server
             curl http://127.0.0.1:3998/rusak
             {"error":"Terjadi kesalahan di server","requestId":"8aaf7722-176e-46f2-8128-19b7dd8716a1"}
        `,
        { caption: 'Dijalankan sungguhan dengan curl 8.5.0.' },
      ),
      p(
        'Perhatikan perbedaan antara nomor satu dan nomor dua, sebab keduanya sering disamakan menjadi `400`. Nomor satu adalah badan yang **tidak bisa diurai sama sekali**, jadi server belum tahu apa pun tentang isinya. Nomor dua adalah badan yang penguraiannya berhasil tetapi isinya melanggar aturan, dan untuk itu `422` menyampaikan keadaan yang lebih tepat sekaligus memungkinkan klien menampilkan pesan per field.',
      ),
      p(
        'Nomor empat memuat keputusan yang mengikat. Respons `500` mengembalikan `requestId` tetapi **tidak** mengembalikan jejak tumpukan maupun pesan asli errornya. Pesan asli bisa memuat nama tabel, jalur berkas di server, potongan query, atau bagian dari data pengguna lain, dan semuanya adalah keterangan yang tidak perlu diketahui klien. Yang rinci tinggal di log server, yang keluar hanya id untuk menemukannya.',
      ),
      p(
        'Bendera `-w` layak dikenal karena ia menjawab pertanyaan "lambatnya di bagian mana" tanpa alat tambahan.',
      ),
      code(
        'text',
        `
        curl -o /dev/null -w 'dns=%{time_namelookup}s connect=%{time_connect}s \\
             total=%{time_total}s ukuran=%{size_download}B\\n' http://127.0.0.1:3998/catatan

          dns=0.000016s connect=0.000108s total=0.001164s ukuran=36B
        `,
        {
          caption:
            'Dijalankan sungguhan. Angka DNS mendekati nol karena alamatnya sudah berupa IP.',
        },
      ),
      p(
        'Memecah waktu total menjadi bagian-bagian itu yang membedakan dugaan dari pengukuran. Ketika `time_namelookup` besar, masalahnya DNS. Ketika `time_connect` besar, masalahnya jaringan atau server yang penuh. Ketika hanya `time_total` yang besar sementara dua yang pertama kecil, masalahnya di dalam aplikasimu, dan di situlah log durasi per permintaan mengambil alih.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perkakas terasa seperti hal yang bisa dipelajari nanti. Yang terjadi tanpanya adalah penelusuran bug dengan cara menebak, dan menebak jauh lebih lambat daripada belajar tiga bendera `curl`.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `console.log(objek)` untuk log',
            'Cepat dan cukup',
            'Tidak bisa disaring, tidak bisa dicari, dan tidak punya waktu maupun id. Cetak satu baris JSON',
          ],
          [
            'Mencatat seluruh isi badan permintaan',
            'Supaya jelas apa yang dikirim',
            'Kata sandi, token, dan data pribadi ikut tersimpan di log. Catat yang perlu saja, dan sensor sisanya',
          ],
          [
            'Menjawab `500` beserta pesan error aslinya',
            'Supaya klien tahu masalahnya',
            'Membocorkan nama tabel, jalur berkas, dan potongan query. Kembalikan `requestId`, simpan detailnya di server',
          ],
          [
            'Tidak mengembalikan id permintaan di respons',
            'Sudah dicatat di log',
            'Pengguna yang melaporkan bug tidak punya apa pun untuk disebutkan. Kirim balik lewat header',
          ],
          [
            'Menguji hanya jalur sukses lewat Postman',
            'Yang penting fiturnya jalan',
            'Jalur `400`, `401`, `422`, dan `500` justru yang paling sering rusak. Uji keempatnya',
          ],
          [
            'Menyimpulkan "servernya lambat" tanpa memecah waktunya',
            'Angkanya memang besar',
            'Diukur dengan `curl -w`, lambatnya bisa di DNS, koneksi, atau aplikasi. Ketiganya butuh perbaikan berbeda',
          ],
        ],
      ),
      p(
        'Baris kedua adalah kesalahan yang paling sulit diperbaiki setelah terjadi. Log biasanya dikirim ke sistem terpusat, disimpan berbulan-bulan, dan bisa dibaca lebih banyak orang daripada yang bisa membaca database. Satu kata sandi yang tercatat di sana berarti satu kata sandi yang tersebar ke seluruh riwayat log, dan menghapusnya jauh lebih sulit daripada menghapus satu baris di database. Karena itu keputusan tentang apa yang dicatat harus diambil sebelum log pertama ditulis, bukan sesudahnya.',
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
          note: 'Menghasilkan correlation id yang aman dipakai per permintaan.',
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
    20,
    'Menyatukan seluruh bab menjadi satu penelusuran nyata.',
    [
      p(
        'Latihan penutup bab ini bukan menulis kode, melainkan **melihat**. Kamu akan mengikuti satu permintaan dari awal sampai akhir dan mencatat apa yang benar-benar terjadi di setiap titik — keterampilan yang dipakai setiap kali ada sesuatu yang tidak berjalan.',
      ),

      terms(
        {
          term: 'tracing (penelusuran)',
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
      p(
        "Berkas ini sengaja mentah tanpa Route, Controller, maupun Service seperti sub-bab 1.5, supaya seluruh perjalanan satu permintaan muat dalam satu layar dan bisa kamu telusuri utuh. Bagian yang paling layak diperhatikan adalah middleware pencatat, sebab ia memberi setiap permintaan sebuah `req.id` acak 8 karakter, mencetak baris `-->` saat masuk, lalu mencetak baris `<--` di dalam `res.on('finish')`. Kenapa harus di dalam `finish` dan bukan langsung setelahnya? Karena respons dikirim **belakangan** setelah handler selesai bekerja, dan hanya pada peristiwa itulah `res.statusCode` sudah final dan selisih `Date.now() - mulai` benar-benar mewakili durasi permintaan.",
      ),
      p(
        "Tiga handler-nya memperlihatkan tiga status yang berbeda dan alasannya masing-masing. `GET /api/catatan/:id` menjawab `404` ketika `find` mengembalikan `undefined`, sebab sumber daya yang diminta memang tidak ada. `POST` menjawab `422` ketika `judul` kosong, karena permintaannya sah sebagai JSON tetapi **isinya** tidak lolos aturan. Dan pada pembuatan yang berhasil ia menjawab `201` plus header `Location` berisi alamat catatan yang baru lahir, sehingga klien tahu ke mana harus melihat tanpa perlu menebak. Perhatikan pula `express.json({ limit: '10kb' })` di baris atas, sebab tanpa batas itu siapa pun bisa mengirim body 500 MB dan menghabiskan memori servermu. Batas ukuran adalah pertahanan pertama, bukan detail opsional.",
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
          body: 'Setiap baris log punya id 8 karakter. Kirim tiga permintaan berturut-turut dan buktikan kamu bisa memisahkan ketiganya di log — inilah gunanya correlation id saat suatu hari ada satu permintaan bermasalah di antara ribuan.',
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
        'Lacak satu permintaan dari awal sampai akhir memakai correlation id-nya',
        'Tuliskan lima endpoint REST untuk satu sumber daya pilihanmu, lengkap dengan status code-nya',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Penelusuran yang paling berguna dipelajari bukan penelusuran halaman yang berhasil melainkan penelusuran sebuah laporan bug yang isinya hampir kosong. Berikut satu insiden yang bentuknya akan kamu temui berulang kali, beserta urutan langkah yang menyelesaikannya.',
      ),
      code(
        'text',
        `
        Laporan yang masuk:
          "Kadang kalau saya simpan catatan, tidak tersimpan. Tidak ada pesan apa-apa."

        Yang TIDAK ada di laporan itu:
          - jam berapa
          - catatan yang mana
          - apa yang muncul di layarnya
          - apakah halamannya dimuat ulang

        Yang tersedia untuk ditelusuri:
          - log server
          - kemampuan meniru permintaannya dengan curl
        `,
      ),
      p(
        'Langkah pertama bukan membuka kode melainkan **mempersempit dari log**. Karena setiap permintaan sudah dicatat satu baris JSON beserta status dan durasinya, pertanyaan "kapan sesuatu gagal" bisa dijawab tanpa menebak.',
      ),
      code(
        'text',
        `
        Saring baris yang bukan sukses:

          grep -v '"status":2' log.txt | head

          {"level":"warn","waktu":"2026-09-07T08:36:34.998Z","requestId":"f070e263-...","method":"POST","path":"/catatan","status":400,"durasiMs":0.88}
          {"level":"warn","waktu":"2026-09-07T08:36:35.004Z","requestId":"a55084a3-...","method":"POST","path":"/catatan","status":422,"durasiMs":0.27}
          {"level":"warn","waktu":"2026-09-07T08:36:35.010Z","requestId":"f5977bbc-...","method":"GET","path":"/rahasia","status":401,"durasiMs":0.18}
          {"level":"error","waktu":"2026-09-07T08:36:35.016Z","requestId":"8aaf7722-...","method":"GET","path":"/rusak","status":500,"durasiMs":0.22}

        Dua baris pertama sudah menjawab "tidak ada pesan apa-apa":
        POST /catatan menjawab 400 dan 422, dan aplikasi klien
        rupanya tidak menampilkan keduanya kepada pengguna.
        `,
        {
          caption:
            'Log-nya dari server Node 26.5.0 yang benar-benar dijalankan; penyaringannya perintah shell biasa.',
        },
      ),
      p(
        'Perhatikan bahwa penyebab akhirnya ternyata **bukan di server**. Server sudah menjawab dengan benar, yaitu `400` untuk badan yang tidak bisa diurai dan `422` untuk isi yang tidak valid. Yang rusak adalah klien yang mengabaikan keduanya, dan itu tepat perilaku yang dihasilkan `try/catch` di sekitar `fetch` tanpa pemeriksaan `r.ok`, sebagaimana sudah diukur di sub-bab pertama bab ini.',
      ),
      p(
        'Langkah kedua adalah **menirukan permintaannya** supaya perbaikan bisa dipastikan, bukan diharapkan. Di sini `curl` mengambil peran yang tidak bisa digantikan peramban, sebab ia mengirim persis apa yang kamu tulis.',
      ),
      code(
        'text',
        `
        Menirukan badan yang rusak (koma dan kutip seperti JavaScript, bukan JSON):

          curl -i -X POST http://127.0.0.1:3998/catatan \\
               -H 'Content-Type: application/json' -d '{judul: "Belanja"}'

          HTTP/1.1 400 Bad Request
          X-Request-Id: f070e263-ed1d-4779-a85f-8c27493bca1a
          {"error":"Badan permintaan bukan JSON yang sah"}

        Menirukan isi yang tidak valid:

          curl -i -X POST http://127.0.0.1:3998/catatan \\
               -H 'Content-Type: application/json' -d '{"judul":"   "}'

          HTTP/1.1 422 Unprocessable Entity
          {"error":"Validasi gagal","detail":[{"field":"judul","pesan":"wajib diisi"}]}

        Keduanya bisa direproduksi kapan saja. Bug yang bisa direproduksi
        bukan lagi bug "kadang".
        `,
        { caption: 'Dijalankan sungguhan dengan curl 8.5.0.' },
      ),
      p(
        'Perbedaan antara `400` dan `422` yang terlihat di dua pemanggilan itu langsung menentukan perbaikan di klien. Yang `422` membawa daftar `detail` per field, jadi klien bisa menempelkan pesannya di sebelah kolom yang bermasalah. Yang `400` tidak membawa apa pun per field karena badannya memang tidak bisa dibaca, jadi klien hanya bisa menampilkan pesan umum. Dua bentuk kegagalan, dua penanganan berbeda, dan keduanya harus ditampilkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Sebagian penelusuran tersesat bukan karena datanya kurang melainkan karena satu asumsi yang tidak pernah diuji. Berikut tiga temuan sungguhan yang paling sering membuat pemula menelusuri ke arah yang salah.',
      ),
      code(
        'text',
        `
        Satu kali membuka satu halaman di Chrome 151. Yang tiba di server:

          --- permintaan ke-1 ---
          GET /halaman HTTP/1.1
            (14 header, termasuk sec-fetch-dest: document)

          --- permintaan ke-2 ---
          GET /favicon.ico HTTP/1.1
            referer: http://127.0.0.1:3997/halaman
            (tidak ada satu baris kode pun yang memintanya)
        `,
        {
          caption: 'Dijalankan sungguhan: server Node mencatat header mentah, peramban Chrome 151.',
        },
      ),
      p(
        'Temuan pertama, satu tindakan pengguna tidak sama dengan satu permintaan. Baris `404 /favicon.ico` di log server yang baru dibuat bukan gejala kerusakan, dan menelusurinya hanya membuang waktu. Sebaliknya, ketika sebuah halaman memicu dua puluh permintaan, angka itu sendiri layak diperiksa, sebab bisa jadi ada pengambilan data yang berulang tanpa perlu.',
      ),
      code(
        'text',
        `
        Membuka halaman yang SAMA dua kali. Header yang tiba di permintaan
        ke-3 identik dengan permintaan ke-1, sampai ke urutannya.

          (server tidak menyimpan apa pun tentang permintaan sebelumnya)
        `,
        {
          caption: 'Dijalankan sungguhan. Ini statelessness yang terlihat, bukan yang dibayangkan.',
        },
      ),
      p(
        'Temuan kedua, tidak ada yang bisa disimpulkan server tentang permintaan sebelumnya kecuali klien mengirimkannya lagi. Karena itu bug yang bunyinya "kadang" sering ternyata berarti "pada permintaan yang tidak membawa cookie atau header tertentu", dan pembeda itu selalu terlihat di header yang tercatat.',
      ),
      code(
        'text',
        `
        Perbandingan pengirim untuk endpoint yang sama:

          dari Chrome : 14 header, termasuk accept, accept-encoding, sec-fetch-*
          dari curl   :  3 header — host, user-agent, accept: */*
        `,
        { caption: 'Dijalankan sungguhan.' },
      ),
      p(
        'Temuan ketiga adalah yang paling sering menjelaskan bug yang "hanya terjadi di peramban". Peramban mengirim sebelas header lebih banyak, mematuhi CORS, menyimpan cookie, dan mengikuti pengalihan dengan aturannya sendiri. Karena itu urutan penelusuran yang benar adalah **`curl` dulu**, sebab kalau `curl` sudah gagal, masalahnya ada di server dan seluruh perilaku peramban bisa dikesampingkan. Kalau `curl` berhasil sementara peramban gagal, penyebabnya berada di lapisan yang hanya dimiliki peramban.',
      ),
      table(
        ['Gejala', 'Uji pemisahnya', 'Kesimpulannya'],
        [
          [
            'Gagal di peramban, `curl` berhasil',
            'Bandingkan header yang dikirim keduanya',
            'CORS, cookie, cache peramban, atau pengalihan',
          ],
          [
            'Gagal di keduanya',
            'Baca log server untuk permintaan itu',
            'Masalahnya di server. Peramban tidak perlu dilibatkan',
          ],
          [
            'Tidak ada satu baris pun di log server',
            'Periksa `e.cause.code` di sisi klien',
            'Permintaannya tidak pernah sampai. Alamat, port, atau servernya mati',
          ],
          [
            'Log server menunjukkan `2xx` tapi pengguna melihat gagal',
            'Periksa apakah klien memeriksa `r.ok`',
            'Servernya benar. Klien yang menelan jawaban gagal',
          ],
        ],
      ),
      p(
        'Baris ketiga di tabel itu adalah pemisah yang paling cepat mempersempit. Ketiadaan baris log bukan kekurangan informasi melainkan informasi yang sangat kuat, sebab ia memindahkan seluruh penyelidikan dari server ke jaringan dan alamat.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penelusuran yang lambat hampir selalu punya bentuk yang sama, yaitu langsung membuka kode dan mulai mengubah sesuatu sebelum ada satu fakta pun yang terkumpul.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Langsung membuka kode dan menebak penyebabnya',
            'Sudah kenal kodenya',
            'Dugaan pertama sering salah, dan perubahan tanpa fakta menambah variabel baru. Kumpulkan status code dan log dulu',
          ],
          [
            'Menelusuri `404 /favicon.ico`',
            'Ada 404 berarti ada masalah',
            'Diukur, peramban memintanya sendiri. Ia tidak berhubungan dengan bug apa pun',
          ],
          [
            'Menyimpulkan dari peramban saja',
            'Penggunanya kan pakai peramban',
            'Diukur, peramban menambah sebelas header dan lapisan CORS serta cookie. Pisahkan dengan `curl` lebih dulu',
          ],
          [
            'Mengabaikan durasi di log',
            'Yang penting statusnya',
            'Durasi memperlihatkan permintaan yang berhasil tapi melambat, dan itu gejala paling awal sebelum sesuatu benar-benar rusak',
          ],
          [
            'Memperbaiki lalu menyatakan selesai tanpa reproduksi',
            'Sudah tidak muncul lagi saat dicoba',
            'Bug "kadang" memang tidak selalu muncul. Tanpa reproduksi, tidak ada bukti apa pun bahwa ia beres',
          ],
          [
            'Menambahkan `try/catch` supaya pesannya berhenti muncul',
            'Errornya hilang',
            'Gejalanya diredam dan akarnya tetap ada. Ini yang membuat bug kembali di tempat lain',
          ],
        ],
      ),
      p(
        'Baris kelima pantas menjadi penutup bab ini karena ia menentukan apakah sebuah perbaikan benar-benar perbaikan. Urutannya selalu sama, yaitu buat dulu satu cara memanggil yang **pasti gagal**, baru ubah kodenya, lalu jalankan cara yang sama itu untuk memastikan ia sekarang berhasil. Tanpa langkah pertama, tidak ada bedanya antara sebuah bug yang beres dan sebuah bug yang sedang kebetulan tidak muncul.',
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
