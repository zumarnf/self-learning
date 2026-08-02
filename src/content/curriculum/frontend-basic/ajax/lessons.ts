import {
  callout,
  checklist,
  code,
  divider,
  h2,
  ol,
  p,
  steps,
  table,
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
    ],
  ),

  written(
    'fetch-dasar',
    '`fetch()`: GET, POST, JSON, header',
    12,
    'Pemanggilan API sehari-hari, dari yang paling sederhana sampai unggahan berkas.',
    [
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
    ],
  ),

  written(
    'upload-file',
    'Upload Berkas: `FormData` & multipart',
    11,
    'Mengirim berkas dari browser — dan kenapa validasi klien bukan pengaman.',
    [
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
    ],
  ),

  written(
    'web-storage',
    'Web Storage: `localStorage`, `sessionStorage`, IndexedDB',
    11,
    'Menyimpan data di browser — beserta batas yang sering ditemukan terlambat.',
    [
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
    ],
  ),
];
