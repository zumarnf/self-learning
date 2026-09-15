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
    19,
    'Peringkat satu OWASP, dan kegagalan yang paling mahal.',
    [
      p(
        'Broken access control adalah kerentanan paling umum di aplikasi web. Ia menempati peringkat satu bukan karena sulit dicegah, melainkan karena **tidak menimbulkan gejala apa pun** — aplikasi yang bocor berperilaku persis seperti yang aman.',
      ),

      terms(
        {
          term: 'access control (kontrol akses)',
          meaning:
            'Aturan tentang **siapa boleh melakukan apa terhadap objek mana**. Berbeda dari autentikasi, yang hanya menjawab "siapa kamu". Membuktikan identitas tidak berarti berhak.',
        },
        {
          term: 'broken access control',
          meaning:
            'Aturan itu ada di kepala pengembang tapi **tidak ditegakkan di kode**, atau ditegakkan hanya di sebagian jalur. Berbahaya karena tidak menimbulkan error — aplikasi terlihat berjalan normal sambil membocorkan data.',
        },
        {
          term: 'OWASP',
          meaning:
            'Singkatan dari **Open Worldwide Application Security Project** — organisasi nirlaba yang menerbitkan daftar risiko keamanan aplikasi web berdasarkan data insiden nyata. Daftar "Top 10"-nya adalah rujukan industri.',
        },
        {
          term: 'IDOR',
          meaning:
            '**Insecure Direct Object Reference** — id sumber daya dipakai langsung dari input pengguna tanpa memeriksa kepemilikan. Menaikkan `/faktur/1042` menjadi `/faktur/1043` adalah serangan lengkapnya; tidak butuh perkakas apa pun.',
        },
        {
          term: 'escalation vertikal',
          meaning:
            'Pengguna biasa berhasil menjalankan aksi yang seharusnya khusus peran lebih tinggi — memanggil endpoint admin, misalnya.',
        },
        {
          term: 'escalation horizontal',
          meaning:
            'Pengguna berhasil menyentuh data pengguna **lain di tingkat yang sama**. Peranmu tidak naik, tapi jangkauan datamu melebar.',
        },
        {
          term: 'mass assignment',
          meaning:
            'Menyalin seluruh isi body permintaan ke objek yang disimpan. Penyerang cukup menambahkan `"peran": "admin"` ke body pembaruan profil, dan kolom itu ikut tersimpan.',
        },
        {
          term: 'default deny',
          meaning:
            'Menyusun penjagaan sebagai daftar **yang boleh terbuka**, bukan daftar yang harus dijaga. Bedanya menentukan apakah rute baru yang lupa dijaga menjadi merepotkan atau membocorkan data.',
        },
        {
          term: 'penjagaan di query',
          meaning:
            'Menempelkan syarat kepemilikan pada query itu sendiri (`WHERE ... AND penulis_id = $2`). Lapisan ini tidak bisa dilupakan pada endpoint kesepuluh, karena ia bagian dari cara datanya diambil.',
        },
        {
          term: 'endpoint daftar (list) sebagai titik buta',
          meaning:
            'Pemeriksaan izin biasanya dipasang per objek — dan endpoint daftar tidak memanggilnya per baris. Policy yang lengkap tetap membocorkan seluruh tabel bila query-nya tidak disaring.',
        },
        {
          term: '`404` alih-alih `403`',
          meaning:
            'Menjawab "tidak ditemukan" untuk sumber daya milik orang lain. `403` mengonfirmasi bahwa id itu **ada** — informasi yang bisa dipakai penyerang untuk memetakan data.',
        },
        {
          term: 'tes parametrik',
          meaning:
            'Satu tes yang dijalankan berulang untuk banyak sumber daya sekaligus (`describe.each`). Ia membuat penjagaan otorisasi mustahil terlewat pada sumber daya yang ditambahkan belakangan.',
        },
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
      p(
        'Ketiga lapisan menjawab pertanyaan yang berbeda, dan tidak satu pun menggantikan yang lain. Lapisan 1 bertanya **"peran ini boleh menyentuh endpoint ini?"**, dan jawabannya sama untuk semua baris. Lapisan 2 bertanya **"pengguna ini boleh menyentuh baris ini?"**, dan di sinilah kepemilikan diperiksa. Lapisan 3 tidak bertanya sama sekali, sebab ia membuat baris milik orang lain **tidak bisa ditemukan**.',
      ),
      p(
        'Perhatikan lapisan 2 melempar `KesalahanTidakDitemukan`, bukan `TidakBerhak`. Itu pilihan sadar untuk data privat: `403` sudah membocorkan bahwa baris dengan id tersebut memang ada, dan penyerang bisa memetakan seluruh database hanya dari perbedaan antara `403` dan `404`.',
      ),
      p(
        'Lapisan 3 yang paling sering hilang justru karena ia terasa mengulang. Bedanya, lapisan 1 dan 2 adalah pemeriksaan yang **bisa dilupakan**, entah pada endpoint kesepuluh, pada jalur pemanggilan baru, atau pada refactor yang memindahkan logika. `AND penulis_id = $2` melekat pada query itu sendiri, sehingga selama query-nya dipakai penjagaannya ikut. Perhatikan pula ia mengubah cara membaca hasil, sebab jumlah baris terpengaruh `0` kini berarti "tidak ada atau bukan milikmu", dan keduanya dijawab sama.',
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
      p(
        'Catatan "Policy lengkap, tetap bocor" pada kolom kiri adalah inti sub-bab ini. Aplikasi itu **punya** Policy yang benar, lengkap, dan teruji, tetapi `index` tidak memanggilnya. Dan memang tidak bisa, karena Policy bekerja per objek sementara endpoint daftar mengembalikan dua puluh objek sekaligus tanpa pernah memeriksa satu pun. Inilah kenapa endpoint daftar disebut titik buta, sebab penjagaan yang sudah kamu bangun tidak berlaku di sana, dan tidak ada yang memberi tahu.',
      ),
      p(
        "Perbaikannya hanya satu baris `where('penulis_id', ...)`, dan letaknya menentukan: **di query**, bukan sebagai penyaringan setelah data diambil. Menyaring di PHP setelah `paginate(20)` akan menghasilkan halaman yang jumlah itemnya berubah-ubah — dua puluh baris diambil dari seluruh pengguna, lalu tersisa tiga yang benar-benar milik peminta.",
      ),
      p(
        'Perhatikan juga catatan "Tidak ada error apa pun". Endpoint bocor ini merespons `200` dengan data yang tampak wajar, lolos setiap tes jalur sukses, dan terlihat normal saat kamu mencobanya sendiri — karena saat mencoba, kamu memakai akun yang memang punya artikel. Ia hanya terlihat kalau kamu **sengaja** memeriksa isi daftarnya dengan akun yang seharusnya tidak melihat apa-apa.',
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
      p(
        'Perulangan pertama menyerang dari sisi **data**, yaitu kirim token milik Ana ke sumber daya milik Budi lalu baca status codenya. Komentar terakhirnya menyatakan kriteria yang tegas, bahwa setiap `200` adalah temuan. Perhatikan daftar jalurnya mencakup lebih dari baris database, sebab berkas unggahan dan status job ekspor juga objek yang punya pemilik, dan keduanya sering terlewat karena tidak terasa seperti "data".',
      ),
      p(
        'Perintah kedua menyerang dari sisi **konfigurasi**, dan ia menemukan kelas masalah yang berbeda. `select(.middleware | contains("auth") | not)` menyaring rute yang **tidak** punya middleware auth, jadi keluarannya adalah daftar endpoint terbuka. Sebagian memang seharusnya publik, seperti `/health` dan halaman login, tetapi apa pun di luar itu adalah rute yang lupa dimasukkan ke grup terlindungi. Ini cara tercepat menemukan kelalaian yang tidak akan pernah muncul lewat pengujian biasa, karena endpoint-nya bekerja sempurna.',
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
      p(
        '`describe.each` menjalankan blok tes yang **sama** untuk setiap sumber daya di dalam array-nya. Itu yang membuat pola ini bertahan, sebab menambahkan sumber daya baru cukup menambah satu string ke daftarnya, bukan menyalin seluruh blok tes dan berharap tidak ada yang lupa. Perhatikan komentar di atasnya yang berbunyi "salin untuk SETIAP sumber daya yang punya pemilik", lalu bandingkan dengan tabel bentuk serangan di awal sub-bab. Escalation horizontal terjadi persis di sumber daya yang tidak ikut dalam daftar ini.',
      ),
      p(
        'Perulangan atas tiga method di dalamnya menutup kelalaian yang paling umum. Sangat sering `GET` sudah diperbaiki sementara `PATCH` dan `DELETE` masih memakai query lama, karena keduanya jarang diuji dengan token orang lain — dan keduanya justru yang paling merusak kalau bocor. Perhatikan label `` `${method} ${sumber}` `` pada `expect`: tanpa itu, kegagalan hanya berbunyi "expected 200 to be 404" tanpa menyebut kombinasi mana yang bocor di antara sembilan yang diuji.',
      ),
      p(
        'Perhatikan yang diharapkan `404`, bukan `403` — konsisten dengan keputusan di lapisan 2 tadi. Kalau aplikasimu memilih `403` untuk sumber daya yang keberadaannya memang publik, sesuaikan angkanya; yang tidak boleh adalah `200`.',
      ),
      callout(
        'tip',
        'Aturan yang dijaga tes bertahan; yang dijaga ingatan akan terlewat',
        'Kamu akan ingat memeriksa otorisasi pada endpoint pertama, kedua, dan kelima. Endpoint kesepuluh, yang ditambahkan buru-buru enam bulan kemudian, adalah yang bocor. Tes parametrik seperti di atas membuatnya mustahil terlewat.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Broken Access Control menempati peringkat satu OWASP bukan karena sulit diperbaiki melainkan karena sangat mudah terlewat. Bentuk paling umumnya hanya satu baris, yaitu id dari klien dipakai langsung untuk mengambil data.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan node:sqlite pada Node 26.5.0.
        Ana (id=1) login. Faktur 102 dan 103 milik Budi (id=2).

        TANPA scoping - SELECT * FROM faktur WHERE id = ?
          Ana meminta /faktur/101 -> {"id":101,"pemilik_id":1,"nomor":"INV-2026-0001","jumlah":250000}
          Ana meminta /faktur/102 -> {"id":102,"pemilik_id":2,"nomor":"INV-2026-0002","jumlah":9500000}
          Ana meminta /faktur/103 -> {"id":103,"pemilik_id":2,"nomor":"INV-2026-0003","jumlah":12000}

        DENGAN scoping - SELECT * FROM faktur WHERE id = ? AND pemilik_id = ?
          Ana meminta /faktur/101 -> {"id":101,"pemilik_id":1,...}
          Ana meminta /faktur/102 -> 404
          Ana meminta /faktur/103 -> 404
        `,
        {
          caption:
            'Perbedaannya satu klausa WHERE, dan itu satu-satunya hal yang memisahkan data Ana dari data Budi.',
        },
      ),
      p(
        'Yang membuat kelas kerentanan ini murah dieksploitasi adalah **biaya mencobanya**, dan itu juga bisa diukur.',
      ),
      code(
        'text',
        `
        200.000 percobaan id berurutan: 52 ms, 3 faktur ditemukan
        laju: 3.882.229 percobaan/detik (tanpa jaringan)

        Lewat jaringan angkanya jauh lebih kecil, dan tetap tidak
        menolong: dengan 20 permintaan/detik pun, seluruh rentang
        id 1 sampai 100.000 habis dalam sekitar 83 menit.
        `,
      ),
      p(
        'Karena itu mengganti id berurutan dengan UUID **bukan** perbaikan. Ia hanya membuat penebakan mahal, dan id yang bocor lewat tautan, tangkapan layar, atau log tetap bisa dipakai. Yang memperbaiki adalah pemeriksaan kepemilikan di lapisan data.',
      ),
      code(
        'ts',
        `
        // Bentuk yang menutup seluruh kelas ini sekaligus: konteks pengguna
        // ikut masuk ke query, bukan diperiksa terpisah SESUDAH data terambil.
        function faktur(idFaktur: number, pengguna: Pengguna) {
          if (pengguna.peran === 'admin') {
            return db.prepare('SELECT * FROM faktur WHERE id = ?').get(idFaktur);
          }
          return db
            .prepare('SELECT * FROM faktur WHERE id = ? AND pemilik_id = ?')
            .get(idFaktur, pengguna.id);
        }

        // Untuk DAFTAR, batasnya WAJIB ikut ke query. Menyaring di memori
        // berarti baris orang lain sudah terbaca — dan di bab Laravel Lanjutan
        // itu terukur: pengguna MEMINTA 20 baris dan MENERIMA 9, sementara
        // 11 baris milik orang lain sudah masuk ke memori proses.
        function daftarFaktur(pengguna: Pengguna, limit: number) {
          return db
            .prepare('SELECT * FROM faktur WHERE pemilik_id = ? ORDER BY id DESC LIMIT ?')
            .all(pengguna.id, Math.min(limit, 100));
        }
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kerentanan ini punya sifat yang membuatnya sulit ditemukan, yaitu **tidak menghasilkan error sama sekali**. Servernya menjawab 200, log-nya bersih, dan pengujiannya lolos.',
      ),
      code(
        'text',
        `
        Yang tercatat di log ketika Ana membaca faktur Budi:

          200 GET /v1/faktur/102  12ms  pengguna=1

        Tidak ada peringatan. Tidak ada pengecualian. Satu-satunya
        petunjuk adalah bahwa pengguna 1 membaca sumber daya milik
        pengguna 2, dan tidak ada yang memeriksanya.
        `,
      ),
      p(
        'Kesalahan berikutnya justru muncul saat perbaikannya dipasang, dan bentuknya adalah memilih kode status yang membocorkan informasi.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          /faktur/102 -> {"status":403,"arti":"faktur ini ADA, tapi bukan milikmu"}
          /faktur/999 -> {"status":404,"arti":"faktur ini TIDAK ADA"}

        Penyerang yang menyapu id 1 sampai 100.000 kini bisa
        memisahkan mana yang NYATA hanya dari kode statusnya,
        tanpa pernah melihat satu pun isinya.
        `,
        {
          caption:
            'Untuk sumber daya yang keberadaannya sendiri bersifat rahasia, jawab 404 untuk keduanya.',
        },
      ),
      p(
        'Pilihannya keputusan produk, bukan keputusan teknis. Untuk data yang keberadaannya memang publik, misalnya profil pengguna, `403` lebih jujur dan lebih mudah dipahami. Untuk faktur, dokumen, atau percakapan, `404` untuk keduanya menutup saluran kebocoran itu sepenuhnya.',
      ),
      code(
        'text',
        `
        TIGA TEMPAT LAIN yang sering luput, dan gejalanya juga diam:

        1. Endpoint tulis diperiksa, endpoint baca tidak
           PATCH /faktur/102 -> 403
           GET   /faktur/102 -> 200      <- lubangnya di sini

        2. Mass assignment: field peran ikut terkirim
           PATCH /profil {"nama":"Ana","peran":"admin"}
           -> bila body-nya di-spread langsung, penggunanya naik pangkat sendiri

        3. Endpoint yang "tidak ada di menu"
           /admin/ekspor tidak pernah ditautkan di antarmuka
           -> tetap bisa dipanggil langsung. Menyembunyikan tombol bukan otorisasi
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hampir semua kesalahan di kategori ini berasal dari satu keyakinan yang tidak pernah diuji, yaitu bahwa pengguna hanya akan mengirim permintaan yang disediakan antarmuka.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai id dari klien tanpa klausa kepemilikan',
            'Id-nya kan dari halaman kita sendiri',
            'Diukur, Ana membaca tiga faktur yang dua di antaranya milik Budi. Tidak ada error apa pun',
          ],
          [
            'Mengganti id berurutan dengan UUID lalu merasa aman',
            'Tidak bisa ditebak lagi',
            'Id yang bocor lewat tautan atau tangkapan layar tetap berlaku. Yang memperbaiki adalah pemeriksaan, bukan bentuk id',
          ],
          [
            'Menyaring daftar di memori setelah query',
            'Hasil akhirnya kan sudah benar',
            'Baris orang lain sudah terbaca ke proses. Batasnya harus ikut ke klausa `WHERE`',
          ],
          [
            'Menyembunyikan tombol admin di antarmuka',
            'Penggunanya tidak akan melihatnya',
            'Endpoint-nya tetap bisa dipanggil langsung. Menyembunyikan bukan menolak',
          ],
          [
            'Memeriksa otorisasi hanya pada endpoint tulis',
            'Yang berbahaya kan yang mengubah data',
            'Membaca faktur orang lain sudah merupakan kebocoran data. Baca dan tulis sama-sama perlu dijaga',
          ],
          [
            'Menjawab `403` untuk sumber daya rahasia',
            'Lebih jujur ke pengguna',
            'Diukur, `403` memberi tahu penyerang id mana yang nyata. Untuk data rahasia, `404` untuk keduanya',
          ],
        ],
      ),
      p(
        'Baris ketiga pantas diulang karena ia yang paling sering terlihat benar dari luar. Endpoint daftar yang menyaring hasilnya di memori memang menampilkan data yang tepat kepada pengguna, dan pada saat yang sama sudah membaca baris milik orang lain ke dalam proses. Satu kesalahan pencatatan, satu pesan error yang terlalu rinci, atau satu bug serialisasi sudah cukup untuk membuatnya keluar.',
      ),
      references(
        {
          label: 'A01:2021 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'Kategori peringkat satu beserta contoh skenario serangan dan pencegahannya.',
        },
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Praktik menegakkan otorisasi berlapis, termasuk prinsip default-deny.',
        },
        {
          label: 'Insecure Direct Object Reference Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pencegahan IDOR — kerentanan yang paling murah dieksploitasi dan paling sering ada.',
        },
        {
          label: 'Authorization',
          href: 'https://laravel.com/docs/12.x/authorization',
          source: 'Laravel',
          note: 'Gate dan Policy, termasuk peringatan bahwa endpoint daftar harus disaring di query.',
        },
      ),
    ],
  ),

  written(
    'cryptographic-failures',
    'Cryptographic Failures & Data Sensitif',
    19,
    'Melindungi data saat bergerak dan saat diam.',
    [
      p(
        'Peringkat dua OWASP. Namanya menyesatkan: sebagian besar kasusnya bukan kriptografi yang dipecahkan, melainkan **kriptografi yang tidak dipakai** — data sensitif yang dikirim atau disimpan tanpa perlindungan sama sekali.',
      ),

      terms(
        {
          term: 'hash',
          meaning:
            'Perubahan **satu arah**: dari data menjadi sidik jari yang tidak bisa dikembalikan. Dipakai untuk password, karena sistem tidak pernah perlu membaca password aslinya — cukup membandingkan.',
        },
        {
          term: 'enkripsi',
          meaning:
            'Perubahan **dua arah** dengan kunci: bisa dibuka kembali. Dipakai untuk data yang memang harus dibaca lagi, seperti NIK atau catatan medis. Kehilangan kuncinya berarti kehilangan datanya.',
        },
        {
          term: 'at rest / in transit',
          meaning:
            'Dua keadaan data. **In transit** = sedang melintasi jaringan (dilindungi TLS); **at rest** = sedang tersimpan di disk atau backup (dilindungi enkripsi penyimpanan).',
        },
        {
          term: 'TLS',
          meaning:
            '**Transport Layer Security** — protokol yang mengenkripsi koneksi jaringan. Penerus SSL; nama lamanya masih sering dipakai sehari-hari meski protokolnya sudah tidak ada.',
        },
        {
          term: '`sslmode=verify-full`',
          meaning:
            'Mode koneksi PostgreSQL yang mengenkripsi **dan** memverifikasi bahwa sertifikat servernya benar. `require` hanya mengenkripsi — ia tidak membuktikan lawan bicaranya siapa.',
        },
        {
          term: 'AES-256-GCM',
          meaning:
            'Algoritma enkripsi simetris mode **GCM**, yang selain menyembunyikan isi juga **mendeteksi perubahan**. Mode tanpa autentikasi seperti CBC membiarkan ciphertext diubah tanpa ketahuan.',
        },
        {
          term: 'IV (initialization vector)',
          meaning:
            'Nilai acak yang membuat dua pesan identik menghasilkan ciphertext berbeda. Ia **bukan rahasia** dan disimpan bersama ciphertext — tapi tidak boleh dipakai ulang dengan kunci yang sama.',
        },
        {
          term: 'auth tag',
          meaning:
            'Potongan data yang dihasilkan mode GCM untuk membuktikan ciphertext tidak diubah. Dekripsi akan **gagal** bila tag-nya tidak cocok — itulah gunanya.',
        },
        {
          term: '`APP_KEY`',
          meaning:
            'Kunci enkripsi aplikasi Laravel. Cast `encrypted` bergantung penuh padanya: kehilangan `APP_KEY` berarti seluruh kolom terenkripsi tidak bisa dibaca lagi.',
        },
        {
          term: 'redaction (redaksi)',
          meaning:
            'Menghapus nilai sensitif dari log berdasarkan jalur field-nya sebelum ditulis. Diperlukan karena log dibaca lebih banyak orang, disimpan lebih lama, dan sering dikirim ke pihak ketiga.',
        },
        {
          term: 'CSPRNG',
          meaning:
            '**Cryptographically Secure Pseudo-Random Number Generator** — pembangkit acak yang keluarannya tidak bisa diprediksi. `crypto.randomBytes()` termasuk; `Math.random()` **tidak**.',
        },
        {
          term: 'minimalisasi data',
          meaning:
            'Sengaja tidak mengumpulkan data yang tidak dibutuhkan. Kontrol paling efektif dalam bab ini, karena data yang tidak pernah disimpan tidak bisa bocor, tidak perlu dienkripsi, dan tidak menimbulkan kewajiban hukum.',
        },
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
      p(
        'Komentar di atasnya menandai asumsi yang sering keliru: TLS **bukan hanya di tepi publik**. Anggapan "sudah di belakang load balancer, jadi internal boleh plaintext" adalah model perimeter yang sudah runtuh — satu container yang dibajak atau satu akun VPN yang bocor cukup untuk menempatkan penyerang di dalam jaringan yang kamu anggap aman.',
      ),
      p(
        '`sslmode=verify-full` adalah bagian yang menentukan, dan ia berbeda dari `require` dengan cara yang penting. `require` hanya menuntut koneksinya terenkripsi; ia **tidak memeriksa** sertifikatnya, sehingga penyerang yang bisa menyisip di tengah jalan tinggal menyodorkan sertifikat buatannya sendiri dan membaca seluruh lalu lintas. `verify-full` memeriksa sertifikatnya sah **dan** nama host-nya cocok. Perhatikan pula `rediss://` dengan dua huruf s — itu skema TLS untuk Redis, mudah tertukar dengan `redis://` biasa yang mengirim perintah dalam teks polos.',
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
      p(
        'Huruf **GCM** pada `aes-256-gcm` yang membedakan ini dari enkripsi biasa: ia terenkripsi **dan terautentikasi**. Mode tanpa autentikasi seperti CBC menyembunyikan isinya tetapi tidak mendeteksi perubahan — penyerang bisa membalik bit di ciphertext, dan hasil dekripsinya berubah tanpa satu pun tanda bahwa ada yang mengutak-atik. `getAuthTag()` menghasilkan penanda yang membuat perubahan seperti itu langsung ketahuan saat dekripsi.',
      ),
      p(
        '`crypto.randomBytes(12)` menghasilkan **IV**, yaitu nilai acak yang membuat dua teks identik menghasilkan ciphertext berbeda. Aturan mutlaknya adalah **jangan pernah memakai ulang IV dengan kunci yang sama**. Pada GCM, pengulangan itu bukan sekadar melemahkan, sebab ia bisa membocorkan isi pesan dan merusak jaminan keasliannya. Karena itu IV dibuat baru di setiap pemanggilan, bukan disimpan sebagai konstanta.',
      ),
      p(
        'Komentar terakhir menjawab pertanyaan yang wajar muncul, yaitu kalau IV dan tag disimpan bersama ciphertext, bukankah itu membocorkannya? Jawabannya tidak, karena **keduanya memang bukan rahasia**. IV hanya perlu unik dan tidak harus tersembunyi, sedangkan tag hanya perlu utuh. Yang rahasia hanya kuncinya. Menyimpannya bersama justru keharusan praktis, sebab tanpa keduanya ciphertext-nya tidak bisa didekripsi sama sekali. Urutan `[iv, tag, data]` yang tetap itulah yang membuat fungsi dekripsinya tahu di mana memotong.',
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
      p(
        'Bahaya `SELECT *` di sini bukan pemborosan, melainkan bahwa ia **berubah artinya seiring waktu**. Hari ini tabel `pengguna` mungkin hanya berisi tiga kolom dan blok pertama lolos review dengan mulus. Masalahnya muncul bulan depan saat seseorang menambahkan `kata_sandi_hash`, `token_reset`, atau `skor_risiko` — dan endpoint yang **tidak pernah disentuh siapa pun** mulai mengirimkannya ke setiap klien.',
      ),
      p(
        'Blok kedua menghilangkan kemungkinan itu dengan membalik siapa yang menentukan. Daftar kolom yang keluar ditetapkan oleh **keputusanmu di baris ini**, bukan oleh bentuk tabel yang bisa berubah kapan saja tanpa sepengetahuanmu. Perlakukan aturan ini sama seperti daftar `select` pada Prisma dan API Resource di Laravel: bentuk respons adalah kontrak yang dipilih sadar, bukan cerminan otomatis dari skema database.',
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

      h2('Studi kasus di project nyata'),
      p(
        'Kategori ini jarang berarti "enkripsinya dibobol". Hampir selalu ia berarti sesuatu yang seharusnya dilindungi ternyata tidak dilindungi sama sekali, atau dilindungi dengan cara yang salah pilih. Contoh paling mahalnya adalah cara menyimpan sandi.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan PHP 8.3.6 di mesin ini:

          sha256          : 2.395.136 tebakan / detik
          bcrypt cost=10  :        20,0 tebakan / detik
          bcrypt cost=12  :         5,0 tebakan / detik

        Selisihnya bukan persen melainkan kelipatan:
          sha256 vs bcrypt cost=12  ->  479.027 kali lebih cepat

        Artinya, bila basis datamu bocor:
          dengan sha256, daftar sandi umum sepanjang 10 juta
          selesai dicoba dalam sekitar 4 detik.
          dengan bcrypt cost=12, butuh sekitar 23 hari.
        `,
        { caption: 'Angka-angka ini mesin-spesifik. Yang tidak berubah adalah urutan besarannya.' },
      ),
      p(
        'Alasan kedua kenapa hash tujuan umum tidak boleh dipakai adalah **garam**, dan efeknya terlihat langsung.',
      ),
      code(
        'text',
        `
        Dua pengguna berbeda dengan sandi yang sama persis:

          sha256("rahasia123") Ana  : bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2
          sha256("rahasia123") Budi : bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2
                                      ^ IDENTIK

          bcrypt Ana  : $2y$08$VoQiCHaXFg/3QyxEurkYk.YsKSuSGBgtPaMV/Ic17y0q61isLCype
          bcrypt Budi : $2y$08$BU3zOAAsEpa8mKxdfpdEw.h18NVVR6W.w5oTMADJKW5VUw/.JoSW.
                                ^ garamnya berbeda, jadi hash-nya berbeda

        Hash sha256 yang identik memberi tahu penyerang bahwa keduanya
        memakai sandi yang sama, dan satu kali pecah membuka dua akun.
        `,
      ),
      p(
        'Menaikkan biaya di kemudian hari juga tidak perlu memaksa semua orang mengganti sandinya, dan itu sudah ada mekanismenya.',
      ),
      code(
        'php',
        `
        // Saat login berhasil, periksa apakah hash lamanya perlu dinaikkan.
        if (password_verify($sandi, $baris['sandi_hash'])) {
            if (password_needs_rehash($baris['sandi_hash'], PASSWORD_BCRYPT, ['cost' => 12])) {
                // Kita sedang memegang sandi mentahnya SEKARANG — satu-satunya
                // momen ia bisa di-hash ulang tanpa mengganggu pengguna.
                simpanHash($baris['id'], password_hash($sandi, PASSWORD_BCRYPT, ['cost' => 12]));
            }
            masuk($baris['id']);
        }

        // Diuji sungguhan pada PHP 8.3.6:
        //   password_needs_rehash(hash cost=8,  target cost=12) -> true
        //   password_needs_rehash(hash cost=12, target cost=12) -> false
        //   algoritma tersedia: bcrypt, argon2i, argon2id  (ketiganya ada)
        `,
      ),
      p(
        'Untuk data yang benar-benar perlu dienkripsi, pilihan modenya menentukan apakah perubahan diam-diam bisa terdeteksi, dan selisihnya bisa dilihat langsung.',
      ),
      code(
        'text',
        `
        Pesan asli: "saldo=1000000;pemilik=ana"
        Satu byte ciphertext dibalik oleh penyerang.

        AES-256-CBC:
          DEKRIPSI BERHASIL padahal ciphertext-nya diubah:
            "���\`�7*����|�s߇milik�ana"

        AES-256-GCM (pesan sama, perubahan sama):
          DITOLAK: Error: Unsupported state or unable to authenticate data
        `,
        {
          caption:
            'CBC tidak punya cara tahu isinya diubah. GCM punya, dan menolak sebelum satu byte pun dipakai.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan kriptografi hampir tidak pernah muncul sebagai pesan error, dan itulah bagian yang paling berbahaya. Yang berikut ini semuanya dari kode yang berjalan tanpa keluhan.',
      ),
      code(
        'text',
        `
        1. JWT: payload dikira terenkripsi

           token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQyLCJwZXJhbiI...
           siapa pun bisa membacanya TANPA kunci apa pun:
             {"sub":42,"peran":"admin","surel":"ana@contoh.id","nik":"3273xxxxxxxx"}

           JWT DITANDATANGANI, bukan dienkripsi. Base64 bukan penyandian rahasia.

        2. Payload diubah -> tanda tangan cocok? false

           Tanda tangannya memang bekerja. Yang TIDAK ia lakukan
           adalah menyembunyikan isinya.

        3. alg:none

           eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjQyLC...
           Verifier yang membaca alg DARI TOKEN akan menerimanya
           tanpa memeriksa apa pun.
        `,
      ),
      p(
        'Kesalahan berikutnya muncul saat membandingkan token, dan di sini ada satu perilaku yang perlu diketahui sebelum dipakai.',
      ),
      code(
        'text',
        `
        Diuji sungguhan pada Node 26.5.0:

          timingSafeEqual, panjang berbeda
            -> RangeError: Input buffers must have the same byte length

          timingSafeEqual, panjang sama, isi beda  -> false
          timingSafeEqual, identik                 -> true

        Jadi timingSafeEqual MELEMPAR bila panjangnya berbeda.
        Bandingkan panjangnya lebih dulu, atau bandingkan hash
        keduanya yang panjangnya selalu sama.
        `,
      ),
      code(
        'ts',
        `
        // Bentuk yang aman dan tidak melempar: bandingkan digest,
        // yang panjangnya selalu 32 byte berapa pun masukannya.
        function tokenCocok(diberikan: string, tersimpan: string) {
          const a = crypto.createHash('sha256').update(diberikan).digest();
          const b = crypto.createHash('sha256').update(tersimpan).digest();
          return crypto.timingSafeEqual(a, b);
        }

        // Catatan jujur dari pengukuran di bab Auth: perbandingan === pada
        // string 64 karakter TIDAK menunjukkan gradien waktu yang bisa dibaca
        // (3,23 / 0,79 / 0,59 / 0,59 / 0,62 ns). Alasan memakai timingSafeEqual
        // bukan "=== pasti bocor", melainkan "waktu di JavaScript tidak bisa
        // diprediksi" — mesin, versi, dan JIT bisa mengubahnya kapan saja.
        `,
      ),
      p(
        'Perhatikan kenapa kedua masukan di-hash lebih dulu. `timingSafeEqual` melempar begitu panjang kedua buffer berbeda, dan panjang token yang dikirim penyerang jelas bisa berbeda-beda. Men-digest keduanya membuat panjangnya selalu 32 byte, sehingga perbandingannya aman dijalankan tanpa perlu memeriksa panjang lebih dulu, dan pemeriksaan panjang itu sendiri justru yang akan membocorkan informasi.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kategori ini penuh pilihan yang terlihat setara padahal tidak, dan hampir semuanya berakhir sebagai kode yang berjalan mulus sampai datanya bocor.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan sandi dengan `sha256` atau `md5`',
            'Itu kan hash juga',
            'Diukur, sha256 479.027 kali lebih cepat dicoba daripada bcrypt cost=12. Cepat adalah kelemahannya',
          ],
          [
            'Menambahkan garam sendiri lalu memakai `sha256`',
            'Kan sudah bergaram',
            'Garam menutup tabel pelangi, bukan kecepatan. `password_hash` mengurus garam DAN biaya sekaligus',
          ],
          [
            'Menaruh data sensitif di dalam payload JWT',
            'Tokennya kan ditandatangani',
            'Diukur, payload terbaca tanpa kunci apa pun. JWT ditandatangani, bukan dienkripsi',
          ],
          [
            'Membaca `alg` dari token lalu memakainya untuk verifikasi',
            'Tokennya yang tahu algoritmanya',
            'Itu membiarkan penyerang memilih `none`. Tentukan daftar algoritma yang diizinkan di sisi server',
          ],
          [
            'Memakai AES-CBC untuk data yang bisa disentuh pengguna',
            'AES kan kuat',
            'Diukur, ciphertext yang diubah tetap terdekripsi. Pakai mode berautentikasi seperti GCM',
          ],
          [
            'Membandingkan token dengan `===`',
            'Hasilnya kan sama',
            'Waktu eksekusi di JavaScript tidak bisa diprediksi. Pakai `timingSafeEqual` atas digest yang panjangnya tetap',
          ],
        ],
      ),
      p(
        'Baris terakhir layak dibaca dengan jujur. Pengukuran di bab Auth tidak berhasil menunjukkan kebocoran waktu dari `===` pada string 64 karakter, dan itu dilaporkan apa adanya. Alasan tetap memakai `timingSafeEqual` bukan karena kebocorannya terbukti, melainkan karena tidak ada yang menjamin perilaku itu bertahan pada mesin lain, versi Node lain, atau setelah JIT memutuskan hal yang berbeda. Kontrol keamanan dipilih berdasarkan jaminan, bukan berdasarkan hasil pengukuran di satu mesin.',
      ),
      references(
        {
          label: 'A02:2021 — Cryptographic Failures',
          href: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
          source: 'OWASP',
          note: 'Termasuk daftar algoritma yang sudah tidak layak pakai dan kesalahan penerapannya.',
        },
        {
          label: 'Cryptographic Storage Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Pilihan algoritma, pengelolaan kunci, dan rotasinya untuk data at rest.',
        },
        {
          label: 'Crypto — createCipheriv',
          href: 'https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options',
          source: 'Node.js',
          note: 'API resmi enkripsi simetris di Node, termasuk penanganan IV dan auth tag GCM.',
        },
        {
          label: 'Encryption',
          href: 'https://laravel.com/docs/12.x/encryption',
          source: 'Laravel',
          note: 'Cara Laravel mengenkripsi kolom dan peran `APP_KEY` di dalamnya.',
        },
        {
          label: 'SSL Support — libpq sslmode',
          href: 'https://www.postgresql.org/docs/current/libpq-ssl.html',
          source: 'PostgreSQL',
          note: 'Perbedaan tegas antara `require`, `verify-ca`, dan `verify-full`.',
        },
      ),
    ],
  ),

  written(
    'injection',
    'Injection: SQL, NoSQL, Command',
    18,
    'Ketika data berubah menjadi perintah.',
    [
      p(
        'Semua injeksi punya bentuk yang sama: masukan yang seharusnya menjadi **nilai** malah dibaca sebagai **perintah**. Perbaikannya juga sama bentuknya — pisahkan perintah dari datanya, jangan berusaha menyaring karakter.',
      ),

      terms(
        {
          term: 'injection (injeksi)',
          meaning:
            'Masukan yang seharusnya menjadi **nilai** ikut dibaca sebagai **perintah**. Bentuknya sama di SQL, NoSQL, shell, LDAP, dan template — hanya bahasanya yang berganti.',
        },
        {
          term: 'parameterized query / prepared statement',
          meaning:
            'Query yang mengirim perintah dan nilainya lewat jalur **terpisah**, sehingga isi nilai tidak pernah bisa berubah menjadi sintaks SQL. Ini pertahanan intinya — bukan penyaringan karakter.',
        },
        {
          term: '`$1`, `?`, placeholder',
          meaning:
            'Penanda posisi nilai di dalam query. `$1`/`$2` gaya PostgreSQL, `?` gaya MySQL dan Laravel. Nilainya menyusul sebagai array terpisah.',
        },
        {
          term: 'identifier',
          meaning:
            'Nama tabel, nama kolom, atau arah pengurutan. Ia **tidak bisa diparameterkan** — karena itu harus dipetakan lewat allow-list milikmu sendiri, bukan diambil langsung dari input.',
        },
        {
          term: 'allow-list',
          meaning:
            'Daftar nilai yang **boleh**, kebalikan dari blocklist. Selalu lebih aman, karena daftar hal buruk selalu tertinggal dari kreativitas penyerang.',
        },
        {
          term: '`$queryRawUnsafe`',
          meaning:
            'Fungsi Prisma yang menjalankan SQL mentah **tanpa** parameterisasi. Namanya sengaja memuat "unsafe" — kemunculannya di kode adalah tanda yang harus diperiksa.',
        },
        {
          term: 'NoSQL injection',
          meaning:
            'Body JSON menyelipkan **operator** query (`{"$ne": null}`) di tempat yang seharusnya berisi string. Query-nya berubah arti sepenuhnya, dan tidak ada karakter berbahaya yang bisa disaring.',
        },
        {
          term: '`.strict()`',
          meaning:
            'Opsi skema Zod yang **menolak field tak dikenal**, bukan sekadar mengabaikannya. Ia menutup varian serangan yang menyelipkan properti tambahan ke dalam objek.',
        },
        {
          term: 'command injection',
          meaning:
            'Input pengguna masuk ke perintah shell dan diurai sebagai sintaks shell. `; rm -rf /` yang tersisip di nama berkas menjadi perintah kedua yang sungguh dijalankan.',
        },
        {
          term: '`execFile` vs `exec`',
          meaning:
            '`exec` menjalankan **satu string lewat shell** (rentan). `execFile` menerima **array argumen tanpa shell** — sehingga isi argumen tidak pernah bisa menjadi perintah baru.',
        },
        {
          term: 'path traversal',
          meaning:
            'Menaiki direktori dengan `../` untuk menyentuh berkas di luar folder yang dimaksud. Punya banyak encoding (`..%2f`, `....//`), jadi pertahanannya adalah **resolve lalu bandingkan**, bukan menyaring.',
        },
        {
          term: 'XXE',
          meaning:
            '**XML External Entity** — parser XML disuruh memuat entitas dari luar, sehingga bisa membaca berkas server atau memicu permintaan jaringan. Cegah dengan mematikan entitas eksternal di parser.',
        },
        {
          term: 'deserialisasi tidak aman',
          meaning:
            'Membangun kembali objek dari data tak tepercaya memakai format asli bahasa (`pickle`, `unserialize`, serialisasi Java, YAML full-load). Format-format itu bisa membangun objek sembarang — jalannya menuju eksekusi kode.',
        },
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
      p(
        'Komentar pertama menyebut batas yang membuat bagian ini perlu ada: **identifier tidak bisa diparameterkan**. Placeholder `$1` hanya bisa menggantikan **nilai**, sementara nama kolom dan arah `ASC`/`DESC` adalah bagian dari struktur query — database sudah harus mengetahuinya sebelum slot nilai diisi. Jadi untuk keduanya, prepared statement tidak tersedia sebagai jalan keluar.',
      ),
      p(
        'Allow-list menggantikannya, dan perhatikan **arah alirannya** pada `KOLOM[req.query.urut]`: input klien dipakai sebagai **kunci pencarian** ke dalam objek milikmu, dan yang masuk ke query adalah **nilai dari objek itu**. Kirim `?urut=judul; DROP TABLE artikel--` dan pencariannya menghasilkan `undefined`, sehingga `??` mengembalikan `dibuat_pada`. Tidak ada satu karakter pun dari klien yang pernah menyentuh teks query.',
      ),
      p(
        'Inilah yang membedakannya dari "sanitasi". Sanitasi berusaha **membersihkan** teks berbahaya, dan selalu tertinggal dari kreativitas penyerang, karena daftar hal buruk tidak pernah lengkap. Allow-list tidak membersihkan apa pun, melainkan memastikan teks dari klien tidak pernah sampai ke query sama sekali. Perhatikan `LIMIT $1` di baris yang sama tetap memakai parameter, karena batas adalah nilai, dan campuran keduanya dalam satu query justru bentuk yang benar.',
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
      p(
        'Perhatikan bentuk aman di Prisma memakai **tagged template** — `` $queryRaw`...` `` tanpa tanda kurung. Bentuk itu menyerahkan potongan teks dan nilainya secara **terpisah** ke Prisma, yang lalu memparameterkannya. Menuliskannya dengan kurung, `$queryRaw(\`...\`)`, mengubah artinya sepenuhnya: string sudah tergabung sebelum Prisma melihatnya, dan perlindungannya hilang. Satu pasang kurung yang membedakan aman dan rentan.',
      ),
      p(
        'Baris `$queryRawUnsafe` memberi pelajaran tentang penamaan, sebab kata **Unsafe** ada di namanya karena memang begitulah adanya. Fungsi seperti ini punya alasan untuk ada, sebab sesekali kamu benar-benar butuh menyusun query secara dinamis, tetapi namanya memastikan tidak ada yang memakainya tanpa sadar, dan pencarian `Unsafe` di codebase langsung menemukan setiap tempat yang perlu ditinjau.',
      ),
      p(
        'Di Laravel, `whereRaw` adalah jebakan yang lebih halus daripada `DB::select` mentah. `User::where(...)` yang biasa memang aman dan memparameterkan sendiri, sehingga orang terbiasa menganggap "pakai Eloquent berarti aman". Lalu datang satu kondisi rumit yang tidak terwakili query builder, `whereRaw` dipakai dengan interpolasi string — dan satu baris itu membatalkan seluruh perlindungan di berkas yang sama.',
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
      p(
        'Serangan ini tidak menyisipkan teks berbahaya, melainkan mengirim **objek di tempat yang seharusnya string**. Karena body JSON bisa membawa struktur apa pun, `req.body.kataSandi` bernilai `{ "$ne": null }` diteruskan apa adanya ke query, dan MongoDB membacanya sebagai operator "tidak sama dengan null". Artinya syaratnya berubah dari "password harus sama dengan ini" menjadi "password apa pun asal ada", sehingga login berhasil tanpa mengetahui satu karakter pun passwordnya.',
      ),
      p(
        'Perhatikan yang salah di sini **bukan** karena query-nya dirangkai dengan string. Kodenya sudah memakai bentuk objek yang dianjurkan, tidak ada penggabungan teks sama sekali, dan tetap rentan. Itulah kenapa nasihat "pakai query builder, jangan string" tidak cukup untuk NoSQL — yang dieksploitasi adalah **tipe datanya**, bukan sintaksnya.',
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
      p(
        'Perbaikannya bukan menyaring karakter berbahaya, melainkan **memastikan tipenya**. `z.string()` menolak apa pun yang bukan string, termasuk objek `{ "$ne": null }`, sehingga permintaan itu gagal validasi sebelum menyentuh database sama sekali. Inilah alasan validasi skema disebut kontrol keamanan di `security.md` dan bukan sekadar kerapian.',
      ),
      p(
        'Komentar terakhir menandai jaminan yang diberikan baris di atasnya, yaitu setelah `Skema.parse`, `email` dan `kataSandi` **dijamin string**. Kode di bawahnya bisa memakainya tanpa memeriksa apa pun lagi. Perhatikan `.parse` dipakai di sini dan bukan `.safeParse`, sebab pada jalur autentikasi melempar seketika adalah perilaku yang tepat. Tidak ada yang perlu dilanjutkan kalau bentuk masukannya sudah salah.',
      ),
      p(
        '`.strict()` menutup varian yang berbeda dari serangan yang sama: menyelipkan **field tambahan** yang tidak ada di skema, misalnya `{"email":"...","kataSandi":"...","$where":"1==1"}`. Tanpa `.strict()`, Zod membuangnya diam-diam — hasilnya tetap aman, tetapi kamu kehilangan sinyal bahwa ada yang mencoba. Dengan `.strict()`, percobaan itu menjadi `422` yang tercatat di log.',
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
      p(
        'Bedanya ada pada siapa yang mengurai perintahnya. `exec` menyerahkan seluruh string ke **shell**, dan shell memberi arti khusus pada `;`, `|`, `&&`, `$()`, serta backtick. Karena itu `namaBerkas` bernilai `"a.jpg; rm -rf /"` bukan dibaca sebagai nama berkas aneh, melainkan sebagai **dua perintah** — dan keduanya dijalankan dengan hak akses aplikasimu.',
      ),
      p(
        '`execFile` tidak melibatkan shell sama sekali. Nama program disebut terpisah dari argumennya, dan argumen diserahkan sebagai **array** — jadi `"a.jpg; rm -rf /"` sampai ke `convert` sebagai satu nama berkas utuh, yang lalu ditolak karena berkas itu tidak ada. Tidak ada yang perlu disaring, karena tidak ada yang bisa ditafsirkan.',
      ),
      p(
        'Perhatikan `{ timeout: 30_000 }` yang mudah dianggap opsional. Proses eksternal bisa menggantung — menunggu masukan, terjebak pada berkas rusak, atau memproses gambar yang sengaja dibuat mahal. Tanpa timeout, setiap permintaan seperti itu meninggalkan satu proses yang tidak pernah selesai, dan cukup beberapa puluh untuk menghabiskan sumber daya server.',
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
      p(
        'Urutan dua baris ini yang menentukan: **resolve dulu, baru bandingkan**. `path.resolve` menyelesaikan seluruh `..` dan menormalkan jalurnya menjadi bentuk absolut yang tunggal — jadi `../../etc/passwd`, `....//....//etc/passwd`, dan varian ber-encoding lainnya semuanya berakhir sebagai jalur yang sama. Setelah itu, satu perbandingan `startsWith` cukup untuk memutuskan apakah ia masih di dalam akar.',
      ),
      p(
        'Perhatikan `AKAR + path.sep`, bukan `AKAR` saja. Tanpa pemisah itu, jalur `/var/data/unggahan-lama/rahasia.txt` akan lolos — ia memang diawali `/var/data/unggahan`, tetapi berada di direktori yang **berbeda**. Kesalahan satu karakter yang membuka kembali celah yang baru saja ditutup.',
      ),
      p(
        'Yang tidak boleh dilakukan adalah **menyaring karakter**. Menghapus `../` dari input terlihat masuk akal sampai kamu menyadari `....//` menjadi `../` setelah penghapusan itu sendiri, dan `..%2f` belum ter-decode saat penyaringan berjalan. Daftar bentuk berbahaya tidak pernah lengkap; membandingkan hasil resolve dengan akar tidak bergantung pada daftar apa pun. Lebih baik lagi, seperti di sub-bab 2.7: jangan pernah memakai nama dari klien sebagai jalur berkas sama sekali.',
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
      p(
        'Format serialisasi asli seperti `pickle` dan `unserialize` tidak sekadar mengangkut data — ia mengangkut **objek beserta kelasnya**, dan saat dibangkitkan kembali, konstruktor atau method khusus kelas itu ikut berjalan. Di situlah eksekusi kode terjadi: penyerang menyusun payload yang menyebutkan kelas yang kebetulan ada di aplikasimu, dan proses "membaca data" berubah menjadi menjalankan perintah.',
      ),
      p(
        'JSON tidak punya kemampuan itu sama sekali, sebab ia hanya bisa menyatakan angka, string, boolean, array, dan objek biasa. Keterbatasan itulah keamanannya. Perhatikan urutannya di baris terakhir, sebab `JSON.parse` mengubah teks menjadi struktur, lalu `SkemaData.parse` memastikan strukturnya sesuai yang diharapkan. Yang pertama menjaga dari format yang berbahaya dan yang kedua dari isi yang tidak masuk akal, dan keduanya diperlukan.',
      ),

      h2('Defense in depth'),
      p(
        'Parameterisasi menutup celahnya. Dua lapisan berikutnya membatasi kerusakan kalau ada yang lolos:',
      ),
      ul(
        '**Hak akses database minimum** — aplikasi yang tidak pernah mengubah skema tidak boleh terhubung sebagai pemilik skema.',
        '**Validasi skema** — menolak bentuk yang salah sebelum mencapai query.',
        '**Batas ukuran** — payload injeksi sering panjang.',
        '**Pemantauan** — permintaan yang cocok dengan pola injeksi layak dicatat dan diberi alert.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Injection terjadi ketika masukan pengguna berhenti diperlakukan sebagai **data** dan mulai dibaca sebagai **perintah**. Contohnya paling mudah dilihat pada query yang dirakit dengan penggabungan string.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan node:sqlite pada Node 26.5.0.
        Query: SELECT id, nama, surel, sandi_hash FROM pengguna WHERE nama = '<masukan>'

        masukan: "ana"
          -> 1 baris: [{"id":1,"nama":"ana","surel":"ana@contoh.id","sandi_hash":"$2y$12$abc"}]

        masukan: "ana' OR '1'='1"
          -> 2 baris: SELURUH tabel, sandi_hash ikut terbawa

        masukan: "x' UNION SELECT id, nama, surel, sandi_hash FROM pengguna --"
          -> 2 baris: SELURUH tabel

        Query yang SAMA dengan prepared statement:
          "ana"                              -> 1 baris
          "ana' OR '1'='1"                   -> 0 baris
          "x' UNION SELECT ... --"           -> 0 baris
        `,
        {
          caption:
            'Prepared statement tidak "membersihkan" masukannya. Ia mengirimkannya di saluran yang terpisah dari perintahnya.',
        },
      ),
      p(
        'Perbedaan itu yang menentukan. Pembersihan masukan berusaha menebak mana yang berbahaya, sementara prepared statement membuat pertanyaan itu tidak relevan, sebab nilainya tidak pernah ikut diurai sebagai SQL.',
      ),
      code(
        'text',
        `
        Dan kerusakannya tidak berhenti di pembacaan:

          exec("SELECT * FROM audit WHERE pesan = 'x'; DELETE FROM audit; --'")
          baris audit sebelum : 1
          baris audit sesudah : 0

        Perintah bertumpuk berjalan. Satu kolom pencarian sudah cukup.
        `,
      ),
      p('Bentuk yang sama berlaku untuk perintah sistem, dan selisihnya juga bisa diukur.'),
      code(
        'text',
        `
        Nama berkas dari pengguna: "catatan.txt; id"

          exec(\`cat /tmp/\${berkas}\`)
            -> "uid=1000(zum) gid=1000(zum) groups=1000(zum),4(adm),24(cdrom),
                27(sudo),30(dip),46(plugdev),100(users),105(lpadmin),125(s..."

          execFile('cat', [\`/tmp/\${berkas}\`])
            -> gagal: Command failed: cat /tmp/catatan.txt; id
        `,
        {
          caption:
            'exec menyerahkan teksnya ke shell. execFile memperlakukan seluruh teks sebagai SATU nama berkas.',
        },
      ),
      p(
        'Titik koma itu tidak pernah punya arti khusus bagi `execFile`, sebab tidak ada shell yang membacanya. Itulah alasan memilih bentuk berargumen jauh lebih kuat daripada berapa pun banyaknya karakter yang kamu blokir.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Injection yang berhasil biasanya tidak memunculkan error apa pun, sehingga yang perlu dikenali justru **error yang muncul saat ia setengah berhasil** — itulah yang dipakai penyerang untuk memetakan basis datamu.',
      ),
      code(
        'text',
        `
        Pesan yang membocorkan struktur, dan sering dikirim apa adanya ke klien:

          SqliteError: no such column: xyz
          SqliteError: near "UNION": syntax error
          SQLSTATE[42S22]: Column not found: 1054 Unknown column 'peran' in 'where clause'
          error: relation "pengguna" does not exist

        Penyerang mengirim masukan yang SENGAJA salah, lalu membaca
        pesannya untuk menebak nama tabel dan kolom satu per satu.
        Teknik ini punya nama sendiri: error-based SQL injection.
        `,
      ),
      p(
        'Menutupnya tidak berarti menyembunyikan errornya dari dirimu sendiri, melainkan memisahkan siapa yang boleh melihatnya.',
      ),
      code(
        'ts',
        `
        // Detail TETAP dicatat lengkap di server. Klien hanya menerima
        // penanda yang bisa dicocokkan dengan log.
        try {
          return db.prepare(sql).all(...nilai);
        } catch (e) {
          const jejak = crypto.randomUUID();
          log.error({ jejak, sql, pesan: (e as Error).message });   // server
          throw new GagalApi(
            { type: 'about:blank', title: 'Terjadi kesalahan', status: 500, jejak },
            500,
          );                                                        // klien
        }
        `,
      ),
      p(
        'Ada satu jalur injeksi yang tidak bisa ditutup prepared statement, dan justru karena itu ia sering terlewat.',
      ),
      code(
        'ts',
        `
        // Placeholder TIDAK bisa dipakai untuk nama kolom atau arah urutan.
        // Ini GAGAL, bukan aman:
        //   db.prepare('SELECT * FROM artikel ORDER BY ? ?').all(kolom, arah)

        // Satu-satunya cara yang benar adalah daftar izin.
        const KOLOM_BOLEH = { judul: 'judul', dibuat: 'created_at', populer: 'view_count' } as const;
        const ARAH_BOLEH = { naik: 'ASC', turun: 'DESC' } as const;

        function daftar(kolom: string, arah: string) {
          const k = KOLOM_BOLEH[kolom as keyof typeof KOLOM_BOLEH];
          const a = ARAH_BOLEH[arah as keyof typeof ARAH_BOLEH];
          if (!k || !a) throw new GagalApi({ title: 'Urutan tidak dikenal', status: 422 }, 422);
          // Nilainya kini berasal dari KONSTANTA di kode, bukan dari pengguna.
          return db.prepare(\`SELECT * FROM artikel ORDER BY \${k} \${a} LIMIT 50\`).all();
        }
        `,
        {
          caption:
            'Diuji di bab Desain API: percobaan injeksi lewat ORDER BY ditolak 422 dan jumlah baris tabel tetap utuh.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di kategori ini hampir selalu berupa upaya membersihkan masukan, padahal yang dibutuhkan adalah memisahkan masukan dari perintahnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyaring kata seperti `SELECT`, `DROP`, `--`',
            'Yang berbahaya kan kata-kata itu',
            "Diukur, `ana' OR '1'='1` tidak mengandung satu pun kata itu dan membocorkan seluruh tabel",
          ],
          [
            'Meng-escape tanda kutip sendiri',
            'Masalahnya kan tanda kutip',
            'Aturan escape berbeda per basis data dan per encoding. Prepared statement membuatnya tidak relevan',
          ],
          [
            'Merasa aman karena memakai ORM',
            'ORM kan sudah mengurus itu',
            'Setiap ORM punya jalan keluar untuk SQL mentah. Yang dirakit dengan string di sana tetap rentan',
          ],
          [
            'Memakai `exec` dengan nama berkas dari pengguna',
            'Cuma menjalankan `cat`',
            'Diukur, `catatan.txt; id` menjalankan perintah kedua dan membocorkan identitas proses server',
          ],
          [
            'Memakai placeholder untuk nama kolom `ORDER BY`',
            'Kan sama-sama parameter',
            'Placeholder hanya untuk NILAI. Nama kolom dan arah urutan wajib lewat daftar izin',
          ],
          [
            'Mengirim pesan error basis data ke klien',
            'Biar pengguna tahu masalahnya',
            'Pesannya menyebut nama tabel dan kolom. Itulah bahan utama error-based SQL injection',
          ],
        ],
      ),
      p(
        'Baris ketiga paling sering menimpa project yang justru sudah rapi. ORM menutup jalur yang biasa, lalu satu laporan yang butuh query rumit ditulis sebagai SQL mentah dengan penggabungan string, dan seluruh perlindungan itu dilewati di satu tempat. Aturannya tidak berubah oleh alat: selama ada nilai dari pengguna yang ikut dirakit menjadi teks perintah, kerentanannya ada di sana.',
      ),
      references(
        {
          label: 'A03:2021 — Injection',
          href: 'https://owasp.org/Top10/A03_2021-Injection/',
          source: 'OWASP',
          note: 'Satu kategori yang mencakup SQL, NoSQL, perintah shell, LDAP, dan template.',
        },
        {
          label: 'SQL Injection Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Termasuk cara menangani identifier yang tidak bisa diparameterkan.',
        },
        {
          label: 'Injection Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Prinsip umum memisahkan perintah dari data di berbagai jenis interpreter.',
        },
        {
          label: 'child_process.execFile()',
          href: 'https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback',
          source: 'Node.js',
          note: 'API yang menerima array argumen tanpa shell — dasar pencegahan command injection.',
        },
        {
          label: 'Raw Database Queries',
          href: 'https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries',
          source: 'Prisma',
          note: 'Perbedaan `$queryRaw` yang diparameterkan dan `$queryRawUnsafe` yang tidak.',
        },
      ),
    ],
  ),

  written(
    'insecure-design',
    'Insecure Design & Threat Modeling Ringkas',
    18,
    'Kerentanan yang tidak bisa ditambal karena ia ada di rancangannya.',
    [
      p(
        'Sebagian besar kategori OWASP adalah kesalahan **implementasi** — kodenya salah, perbaiki kodenya. *Insecure design* berbeda: fiturnya berjalan persis seperti yang dirancang, dan rancangan itulah yang bermasalah.',
      ),

      terms(
        {
          term: 'insecure design',
          meaning:
            'Kerentanan yang berada di **rancangan**, bukan di kode. Ia tidak bisa ditambal dengan memperbaiki satu fungsi, karena fungsinya berjalan persis seperti yang dimaksudkan.',
        },
        {
          term: 'threat modeling',
          meaning:
            'Menelaah sebuah fitur untuk menemukan apa yang bisa disalahgunakan **sebelum** ia dibangun. Bentuk praktisnya cuma empat pertanyaan, dan biasanya cukup tiga puluh menit.',
        },
        {
          term: 'trust boundary (trust boundary)',
          meaning:
            'Titik di mana data berpindah dari pihak yang tidak dikendalikan ke pihak yang dikendalikan. Setiap panah yang menyeberangi batas ini adalah tempat validasi dan otorisasi harus ada.',
        },
        {
          term: 'STRIDE',
          meaning:
            'Enam jenis ancaman sebagai daftar periksa: **S**poofing (pemalsuan identitas), **T**ampering (pengubahan), **R**epudiation (penyangkalan), **I**nformation disclosure (kebocoran), **D**enial of service (pembanjiran), **E**levation of privilege (naik hak).',
        },
        {
          term: 'menerima risiko',
          meaning:
            'Memutuskan secara **sadar dan tertulis** untuk tidak memitigasi sesuatu. Ini keputusan yang sah — yang berbahaya adalah risiko yang tidak pernah disebut, karena tidak ada yang bisa meninjaunya ulang.',
        },
        {
          term: 'server yang menentukan',
          meaning:
            'Nilai yang menyangkut uang, izin, dan kepemilikan diambil server dari sumbernya sendiri. Klien hanya mengirim **id dan jumlah**, tidak pernah harga atau peran.',
        },
        {
          term: 'fail closed (gagal ke keadaan tertutup)',
          meaning:
            'Bila pemeriksaan izin melempar error, hasilnya **tolak**, bukan izinkan. Kesalahan tak terduga tidak boleh berubah menjadi pintu terbuka.',
        },
        {
          term: 'rate limit',
          meaning:
            'Batas jumlah permintaan per satuan waktu. Di konteks rancangan, ia yang membedakan OTP 4 digit yang aman dari yang bisa dihabiskan seluruh kemungkinannya dalam hitungan menit.',
        },
        {
          term: '`Referrer-Policy: no-referrer`',
          meaning:
            'Instruksi agar browser **tidak mengirim URL halaman asal** saat pengguna mengeklik tautan keluar. Penting untuk halaman yang URL-nya sendiri adalah rahasia, seperti tautan berbagi bertoken.',
        },
        {
          term: 'token acak vs id berurutan',
          meaning:
            'Tautan berbagi yang memakai id artikel bisa ditebak dengan menaikkan angkanya. Token acak 32 byte tidak — dan itu perbedaan antara fitur berbagi dan kebocoran massal.',
        },
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
          body: 'Gambar alur datanya. Di mana data masuk, ke mana ia pergi, siapa yang menyentuhnya. Trust boundary ada di setiap panah yang menyeberang dari luar ke dalam.',
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

        Trust boundary: siapa pun yang memegang tautan.

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
      p(
        'Perhatikan dokumen ini tidak berisi satu baris kode pun, sebab ia dibuat **sebelum** implementasi, dan justru itu nilainya. Baris "Trust boundary: siapa pun yang memegang tautan" adalah kalimat yang mengubah seluruh sisanya, karena begitu dinyatakan seterang itu, kelima risiko di bawahnya menjadi konsekuensi yang jelas alih-alih penemuan mengejutkan setelah rilis.',
      ),
      p(
        'Setiap keputusan menjawab satu risiko di atasnya, dan pasangannya bisa ditelusuri satu per satu. "Bisa ditebak kalau id-nya berurutan" dijawab token acak 32 byte. "Berlaku selamanya" dijawab kedaluwarsa wajib. "Muncul di header Referer" dijawab `Referrer-Policy: no-referrer`, yang mencegah URL rahasia ikut terkirim saat pengguna mengeklik tautan keluar dari halaman itu. Dan "tidak ada cara mencabutnya" dijawab tombol cabut — kemampuan yang hampir mustahil ditambahkan belakangan kalau tautannya terlanjur dirancang sebagai id permanen.',
      ),
      p(
        'Baris `DITERIMA` di akhir yang paling sering hilang dari dokumen semacam ini. Risiko itu **tidak bisa dimitigasi** tanpa membunuh fiturnya — inti berbagi tautan memang siapa pun yang memegangnya bisa membaca. Menuliskannya sebagai keputusan sadar, lengkap dengan alasannya, mengubahnya dari kelalaian menjadi pilihan yang bisa ditinjau ulang saat keadaan berubah. Yang berbahaya bukan risiko yang diterima, melainkan risiko yang tidak pernah disebut.',
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
          ['Defense in depth', 'Otorisasi di rute, di objek, **dan** di query'],
          ['Server yang menentukan', 'Harga, peran, dan kepemilikan tidak pernah dari klien'],
          ['Batas di mana-mana', 'Ukuran, laju, jumlah, masa berlaku'],
          ['Bisa diaudit', 'Aksi penting meninggalkan jejak yang tidak bisa dihapus pelakunya'],
        ],
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Insecure Design adalah satu-satunya kategori OWASP yang **tidak bisa ditutup dengan menulis kode lebih hati-hati**. Bugnya ada pada aturan yang tidak pernah ditetapkan, dan kodenya bekerja persis seperti yang diminta.',
      ),
      code(
        'text',
        `
        Diukur sungguhan. Validasi tipe dan format LENGKAP dan lolos semuanya.

        total = harga * jumlah + ongkir      harga=150.000  ongkir=20.000

          jumlah=     2 -> {"total":320000}
          jumlah=     0 -> {"total":20000}
          jumlah=    -5 -> {"total":-730000}
          jumlah= -1000 -> {"total":-149980000}

        Tipe benar. Format benar. Skemanya lolos.
        Dan pelanggan terakhir memesan seratus empat puluh sembilan
        juta rupiah UNTUK DIRINYA SENDIRI.
        `,
        {
          caption:
            'Validasi menjawab "bentuknya benar?". Ia tidak pernah menjawab "ini masuk akal?".',
        },
      ),
      p(
        'Perbaikannya bukan validasi yang lebih ketat melainkan **aturan bisnis yang ditulis sebagai batas**, dan bedanya terlihat langsung.',
      ),
      code(
        'text',
        `
        jumlah harus 1 sampai 10, dan tidak boleh melebihi stok:

          jumlah=   2 -> {"status":200,"total":320000}
          jumlah=   0 -> {"status":422,"error":"jumlah harus 1 sampai 10"}
          jumlah=  -5 -> {"status":422,"error":"jumlah harus 1 sampai 10"}
          jumlah=  50 -> {"status":422,"error":"jumlah harus 1 sampai 10"}
        `,
      ),
      p(
        'Kelas kedua yang khas Insecure Design adalah **cek-lalu-tulis**, dan ia tidak pernah muncul saat diuji satu per satu.',
      ),
      code(
        'text',
        `
        Kupon HEMAT50 sisa 1. Dua permintaan tiba hampir bersamaan.
        Diukur sungguhan dengan node:sqlite:

          A membaca sisa=1, B membaca sisa=1  (keduanya SEBELUM ada yang menulis)
          A -> DITERIMA
          B -> DITERIMA

          penukaran tercatat : 2   (seharusnya 1)
          sisa kupon         : -1  (NEGATIF)

        Kodenya benar bila dibaca baris demi baris. Yang salah adalah
        asumsi bahwa antara CEK dan TULIS tidak terjadi apa-apa.
        `,
      ),
      code(
        'text',
        `
        Bentuk yang benar: satu pernyataan bersyarat, dijaga basis data.

          UPDATE kupon SET sisa = sisa - 1 WHERE kode = ? AND sisa > 0

          A -> DITERIMA
          B -> DITOLAK
          C -> DITOLAK
          sisa kupon : 0

        Dan pagarnya ikut dipasang di skema:
          CHECK (sisa >= 0)
          memaksa sisa negatif -> Error: CHECK constraint failed: sisa >= 0
        `,
        {
          caption:
            'Basis data memeriksa syaratnya SAAT menulis, jadi tidak ada celah antara cek dan tulis.',
        },
      ),
      p(
        'Threat modeling ringkas adalah cara menemukan hal-hal ini sebelum ditulis, dan tidak memerlukan kerangka kerja formal. Empat pertanyaan sudah cukup untuk sebagian besar fitur.',
      ),
      code(
        'text',
        `
        1. Apa yang berharga di sini?
           Uang, data pribadi, reputasi, kapasitas server, kepercayaan.

        2. Siapa yang diuntungkan bila aturannya dilanggar?
           Pengguna nakal, pesaing, bot, ATAU karyawan sendiri.

        3. Apa yang terjadi bila langkah ini dilakukan:
           - dua kali bersamaan?      -> perlombaan
           - seribu kali per detik?   -> penyalahgunaan sumber daya
           - dengan nilai di luar dugaan (nol, negatif, sangat besar)?
           - dengan urutan yang dibalik?
           - berhenti di tengah?      -> keadaan setengah jadi

        4. Bagaimana kita TAHU kalau itu terjadi?
           Bila jawabannya "tidak tahu", itu temuannya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ciri khas kategori ini adalah errornya muncul jauh dari tempat masalahnya, dan seringkali baru berbulan-bulan kemudian.',
      ),
      code(
        'text',
        `
        Yang akhirnya terlihat, dan sudah terlambat:

          laporan keuangan  : "total penjualan bulan ini: -12.400.000"
          basis data        : kolom stok berisi -47
          dukungan pelanggan: "kenapa saldo saya naik setelah membatalkan pesanan?"
          audit             : satu kupon sekali-pakai terpakai 312 kali

        Tidak satu pun dari ini pernah muncul sebagai pengecualian
        di log aplikasi pada saat kejadiannya.
        `,
      ),
      p(
        'Ketika pagarnya akhirnya dipasang, error yang muncul justru **pesan yang bagus**, sebab ia berbunyi tepat saat pelanggaran terjadi.',
      ),
      code(
        'text',
        `
        Error: CHECK constraint failed: sisa >= 0
        SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry
        error: new row for relation "saldo" violates check constraint "saldo_non_negatif"

        Ketiganya BUKAN kegagalan sistem melainkan sistem yang
        menolak menyimpan keadaan yang mustahil. Jangan ditangkap
        lalu didiamkan — terjemahkan menjadi 409 atau 422 yang jelas.
        `,
      ),
      code(
        'ts',
        `
        // Terjemahkan pelanggaran batas menjadi jawaban yang bisa ditindaklanjuti.
        try {
          await tukarKupon(kode, pengguna.id);
        } catch (e) {
          if (kodeBasisData(e) === 'UNIQUE_VIOLATION') {
            // Bukan bug. Aturannya bekerja.
            throw new GagalApi({ title: 'Kupon sudah pernah kamu pakai', status: 409 }, 409);
          }
          throw e;   // sisanya benar-benar tidak terduga — biarkan naik
        }
        `,
      ),
      p(
        'Yang membedakan potongan ini dari `try/catch` yang meredam gejala adalah baris terakhirnya. Hanya pelanggaran yang memang kamu rancang sendiri yang diterjemahkan menjadi jawaban, sementara error lain dibiarkan naik apa adanya. Menangkap semuanya lalu membalas 409 akan menyamarkan bug yang tidak terduga menjadi pesan yang terdengar wajar bagi pengguna.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kategori ini menghukum kebiasaan yang di tempat lain justru dipuji, yaitu mempercayai bahwa kode yang lolos semua test berarti fiturnya benar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menganggap validasi skema sudah mengamankan fitur',
            'Semua field sudah divalidasi',
            'Diukur, `jumlah: -1000` lolos validasi dan menghasilkan total negatif seratus empat puluh sembilan juta',
          ],
          [
            'Menguji fitur hanya satu permintaan pada satu waktu',
            'Begitu cara pemakaian normalnya',
            'Diukur, dua permintaan bersamaan menukar kupon sisa 1 sebanyak dua kali dan sisanya jadi -1',
          ],
          [
            'Menjaga invarian hanya di kode aplikasi',
            'Logikanya kan sudah benar',
            'Dua proses menjalankan logika yang sama bersamaan. Pasang `CHECK` dan `UNIQUE` di basis data juga',
          ],
          [
            'Menangkap pelanggaran constraint lalu mengabaikannya',
            'Supaya tidak ada error ke pengguna',
            'Itu mematikan satu-satunya alarm yang berbunyi tepat waktu. Terjemahkan ke 409, jangan didiamkan',
          ],
          [
            'Menunda pertanyaan "bagaimana kita tahu kalau ini terjadi"',
            'Nanti saja setelah fiturnya jalan',
            'Tanpa jawabannya, pelanggaran pertama baru ketahuan dari laporan keuangan bulan berikutnya',
          ],
          [
            'Menganggap penyerang selalu dari luar',
            'Yang internal kan sudah dipercaya',
            'Kupon terpakai 312 kali biasanya bukan peretas, melainkan satu orang yang menemukan celahnya dan memberitahu teman',
          ],
        ],
      ),
      p(
        'Baris kelima adalah yang paling menentukan, dan ia tidak menuntut alat mahal. Satu baris log terstruktur yang mencatat siapa menukar kupon apa, ditambah satu query mingguan yang menghitung penukaran per kupon, sudah cukup untuk mengubah temuan berbulan-bulan menjadi temuan berhari-hari. Keamanan desain sebagian besar adalah kebiasaan bertanya apa yang bisa salah, lalu memastikan ada yang akan memberi tahu ketika itu terjadi.',
      ),
      references(
        {
          label: 'A04:2021 — Insecure Design',
          href: 'https://owasp.org/Top10/A04_2021-Insecure_Design/',
          source: 'OWASP',
          note: 'Membedakan cacat rancangan dari cacat implementasi, beserta contoh skenarionya.',
        },
        {
          label: 'Threat Modeling Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Empat pertanyaan pemodelan ancaman dan cara menjalankannya tanpa proses berat.',
        },
        {
          label: 'Abuse Case Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Abuse_Case_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Menuliskan "apa yang bisa disalahgunakan" berdampingan dengan user story biasa.',
        },
        {
          label: 'Referrer-Policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy',
          source: 'MDN Web Docs',
          note: 'Mencegah URL rahasia, seperti tautan berbagi bertoken, bocor lewat header `Referer`.',
        },
      ),
    ],
  ),

  written(
    'security-misconfiguration',
    'Security Misconfiguration & Header',
    19,
    'Kodenya benar, pengaturannya yang membuka pintu.',
    [
      terms(
        {
          term: 'security misconfiguration',
          meaning:
            'Kerentanan yang lahir dari **pengaturan**, bukan dari kode: mode debug menyala, kredensial default dibiarkan, endpoint internal terbuka. Kodenya bisa sempurna dan aplikasinya tetap bocor.',
        },
        {
          term: 'header keamanan',
          meaning:
            'Header respons HTTP yang memberi tahu browser cara memperlakukan halamanmu dengan lebih ketat. Ia lapisan pertahanan **kedua** — membatasi kerusakan saat pertahanan pertama terlewat.',
        },
        {
          term: 'CSP (Content-Security-Policy)',
          meaning:
            'Daftar sumber yang boleh dimuat dan dijalankan halaman. Ia tidak menggantikan escaping keluaran, tapi membuat XSS yang lolos jauh lebih sulit dieksploitasi.',
        },
        {
          term: '`unsafe-inline`',
          meaning:
            'Nilai CSP yang mengizinkan skrip/gaya tertulis langsung di HTML. Pada `script-src` ia hampir meniadakan manfaat CSP — justru skrip inline yang paling sering menjadi vektor XSS.',
        },
        {
          term: 'nonce',
          meaning:
            'Nilai acak sekali pakai yang dihasilkan **per permintaan** dan ditempelkan pada tag skrip yang sah. Cara benar mengizinkan skrip inline tertentu tanpa membuka semuanya.',
        },
        {
          term: 'HSTS',
          meaning:
            '**HTTP Strict Transport Security** — memerintahkan browser mengakses domainmu hanya lewat HTTPS selama `max-age` detik, bahkan sebelum permintaan pertama dikirim.',
        },
        {
          term: 'clickjacking',
          meaning:
            'Menyematkan situsmu di dalam `<iframe>` transparan sehingga pengguna mengeklik sesuatu yang tidak ia lihat. Dicegah dengan `frame-ancestors` atau `X-Frame-Options`.',
        },
        {
          term: '`nosniff`',
          meaning:
            'Nilai `X-Content-Type-Options` yang melarang browser **menebak** tipe berkas dari isinya. Tanpa itu, berkas yang dikirim sebagai teks bisa ditebak sebagai skrip lalu dijalankan.',
        },
        {
          term: 'document root',
          meaning:
            'Direktori yang benar-benar dilayani web server. Menyetelnya ke akar project alih-alih ke `public/` membuat `.env`, `vendor/`, dan `.git/` bisa diunduh siapa saja.',
        },
        {
          term: 'introspection GraphQL',
          meaning:
            'Kemampuan klien menanyakan **seluruh skema** API GraphQL. Berguna saat pengembangan, tapi di produksi ia memberi penyerang peta lengkap tanpa usaha.',
        },
        {
          term: 'Horizon / Telescope / Pulse',
          meaning:
            'Dashboard pemantauan Laravel. Ketiganya memperlihatkan payload job dan isi permintaan lengkap — dibiarkan terbuka, mereka membocorkan lebih banyak daripada endpoint API mana pun.',
        },
        {
          term: '`x-powered-by`',
          meaning:
            'Header yang mengumumkan teknologi servermu. Mematikannya bukan keamanan sejati, tapi ia menghilangkan petunjuk gratis tentang kerentanan versi mana yang layak dicoba.',
        },
      ),

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
      p(
        "Empat direktif di tengah blok CSP itu sering dilewatkan padahal masing-masing menutup jalur pintas yang nyata. `objectSrc: ['none']` menutup `<object>` dan `<embed>`, yang bisa memuat plugin dan melewati pembatasan `scriptSrc`. `baseUri: ['self']` mencegah penyerang menyuntikkan `<base href=\"https://jahat.com\">` yang membelokkan **setiap** jalur relatif di halamanmu. Dan `formAction: ['self']` mencegah formulir dikirim ke domain lain — jalur pencurian kredensial yang tidak tersentuh direktif skrip mana pun.",
      ),
      p(
        "Perhatikan `styleSrc` mengizinkan `'unsafe-inline'` sementara `scriptSrc` tidak, dan itu bukan ketidakkonsistenan. Gaya inline paling banter bisa dipakai menyamarkan tampilan; skrip inline **menjalankan kode** — dan justru itu vektor XSS yang paling umum. Kalau aplikasimu benar-benar butuh skrip inline, pakai nonce yang dihasilkan per permintaan, bukan `unsafe-inline` permanen.",
      ),
      p(
        '`imgSrc` menyertakan `data:` dan `blob:` karena keduanya dibutuhkan pratinjau unggahan dari sub-bab 4.6 — `URL.createObjectURL` menghasilkan alamat `blob:`, dan tanpa izin itu pratinjaunya diblokir CSP. Ini pola yang berulang: setiap fitur menambah kebutuhan pada CSP, dan menambahkannya harus dilakukan sadar per direktif, bukan dengan melonggarkan `defaultSrc`.',
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
      p(
        'Dua baris pertama menutup kebocoran terbesar sekaligus paling mudah terjadi. `APP_DEBUG=true` di Laravel membuat halaman error menampilkan stack trace, potongan kode, isi variabel — dan pada beberapa versi, isi environment beserta kredensial database. Satu error yang **sengaja dipicu** sudah cukup untuk mendapat semuanya. `NODE_ENV=production` melakukan hal setara di sisi Node, sekaligus menyalakan jalur cepat di banyak library.',
      ),
      p(
        'Lima larangan di bawahnya punya satu kesamaan, yaitu semuanya adalah alat yang **memang berguna saat pengembangan**, dan itulah kenapa mereka tertinggal menyala. GraphQL introspection membocorkan seluruh skema API-mu, mulai dari setiap tipe, setiap field, sampai setiap mutasi. Endpoint `/metrics` membocorkan peta operasional berupa nama rute, volume trafik, dan jam sibuk. Dan dashboard antrean memperlihatkan **payload job**, yang sering memuat data yang sudah kamu susah-payah lindungi di endpoint lain.',
      ),
      p(
        'Perhatikan kelimanya tidak dilindungi dengan mematikan saja — sebagian tetap kamu butuhkan di produksi. Yang tepat adalah menaruhnya di balik autentikasi, seperti yang dicontohkan pada `Gate::define` berikutnya. "Tidak ditautkan di mana pun" bukan kontrol akses.',
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
      p(
        'Ketiga dashboard ini dipasang lewat paket dan langsung punya rutenya sendiri — tanpa kamu menulis satu baris pun di berkas rute. Itulah yang membuatnya sering luput dari audit: perintah `route:list` menampilkannya, tetapi tidak ada berkas di project-mu yang menyebutnya, sehingga ia tidak muncul saat kamu menelusuri kode.',
      ),
      p(
        'Perhatikan apa yang sebenarnya mereka perlihatkan. Horizon menampilkan **payload job**, yang menurut sub-bab 2.8 seharusnya hanya berisi id — tetapi kalau ada satu saja job yang membawa data lengkap, ia terpampang di sana. Telescope lebih jauh lagi: ia merekam permintaan **beserta body-nya**, termasuk yang berisi password saat pendaftaran. Dibiarkan terbuka, keduanya memberi lebih banyak daripada endpoint API mana pun yang kamu jaga ketat.',
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
      p(
        'Selisihnya satu segmen jalur, dan akibatnya adalah seluruh isi project-mu bisa diunduh dari internet. Berkas `.env` berada di **akar** project, satu tingkat di atas `public/` — jadi document root yang menunjuk akar membuat `https://contoh.com/.env` melayani berkas berisi kredensial database, `APP_KEY`, dan setiap rahasia lain. Tidak ada yang perlu diretas; cukup mengetik alamatnya.',
      ),
      p(
        'Dan bukan hanya `.env`. `storage/` memuat log yang bisa berisi data pengguna, `vendor/` memperlihatkan setiap paket beserta versinya — daftar belanja bagi siapa pun yang mencari kerentanan yang sudah diketahui. Kesalahan ini masih sering ditemukan di server sungguhan karena ia **tidak menimbulkan gejala apa pun**: aplikasinya berjalan normal, semua halaman terbuka, dan tidak ada satu pun error di log.',
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
      p(
        'Judulnya menyatakan alasannya: seluruh sub-bab ini tentang **konfigurasi**, dan konfigurasi yang benar di berkas tidak berarti apa-apa kalau tidak diterapkan di server. Berkas `.env` yang salah salin, deploy yang gagal separuh, atau proxy di depan yang menimpa header — ketiganya menghasilkan server yang berperilaku berbeda dari yang tertulis di repo. Yang membuktikannya hanya memanggil server yang **benar-benar berjalan**.',
      ),
      p(
        'Perulangan kedua dan ketiga memakai pola yang sama dan layak diperhatikan, karena keduanya **berharap gagal**. `.env` yang menjawab `200` berarti document root salah, sedangkan `/horizon` yang menjawab `200` berarti dashboard-nya terbuka. Perhatikan komentarnya menyebut `401/403/404` sebagai jawaban yang benar untuk endpoint internal, sebab ketiganya sama-sama menutup akses, dan `404` bahkan sedikit lebih baik karena tidak mengonfirmasi endpoint itu ada.',
      ),
      p(
        'Uji terakhir memakai cara yang berbeda: ia sengaja memanggil rute yang tidak ada untuk **memancing halaman error**, lalu mencari jejak khas mode debug di dalamnya — kata "stack trace", jalur `vendor/`, atau bahkan `APP_KEY`. Ini satu-satunya dari empat uji yang mendeteksi masalah dari **isi** respons, bukan dari status code, karena halaman error debug tetap menjawab `500` seperti halaman error biasa.',
      ),
      callout(
        'tip',
        'Jadikan ini bagian dari checklist rilis',
        'Konfigurasi yang benar di berkas tapi tidak diterapkan di server adalah kegagalan yang paling mudah terlewat — dan paling mudah dideteksi. Sepuluh baris `curl` di atas menangkap sebagian besar kesalahan konfigurasi yang pernah menyebabkan kebocoran.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Security Misconfiguration jarang berupa satu pengaturan yang salah. Lebih sering ia berupa **pengaturan bawaan yang tidak pernah diubah**, dan yang paling mahal di antaranya adalah respons error yang terlalu ramah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan node:http. Pola "biar gampang debug":

          status: 500
          badan : {"error":"relation 'produk' does not exist at
                   /srv/app/src/db/produk.repo.ts:48",
                   "stack":["Error: relation 'produk' does not exist at
                   /srv/app/src/db/produk.repo.ts:48",
                   "    at Server.<anonymous> (file:///srv/app/src/server.mjs:6:38)",
                   "    at Server.emit (node:events:509:20)"]}

          header keamanan yang ada: (tidak ada satu pun)

        Dalam satu respons, penyerang mendapat: nama tabel, jalur berkas
        di server, struktur direktori, dan versi runtime.
        `,
      ),
      p(
        'Versi yang benar tidak menghapus informasinya melainkan memindahkannya, sehingga kamu tetap bisa menelusuri dan penyerang tidak mendapat apa pun.',
      ),
      code(
        'text',
        `
        Di LOG SERVER:
          [LOG SERVER] req_ezj2c4in relation 'produk' does not exist at
                       /srv/app/src/db/produk.repo.ts:48

        Yang dikirim ke KLIEN:
          {"type":"about:blank","title":"Terjadi kesalahan","status":500,
           "jejak":"req_ezj2c4in"}

        Header yang ikut terpasang:
          content-security-policy: default-src 'self'; script-src 'self';
                                   object-src 'none'; frame-ancestors 'none'
          strict-transport-security: max-age=31536000; includeSubDomains
          x-content-type-options: nosniff
          referrer-policy: strict-origin-when-cross-origin
          permissions-policy: geolocation=(), camera=(), microphone=()
        `,
        {
          caption:
            'Penanda jejak itu yang menyambungkan keluhan pengguna ke baris log yang tepat tanpa membocorkan apa pun.',
        },
      ),
      p(
        'Tiap header di atas menutup sesuatu yang spesifik, dan mengetahui apa yang ditutupnya jauh lebih berguna daripada menyalin daftarnya.',
      ),
      table(
        ['Header', 'Yang ditutupnya', 'Yang terjadi bila tidak ada'],
        [
          [
            '`Content-Security-Policy`',
            'Menentukan dari mana skrip dan sumber daya boleh dimuat',
            'Satu celah XSS bisa memuat skrip dari domain mana pun dan mengirim data ke sana',
          ],
          [
            '`Strict-Transport-Security`',
            'Memaksa peramban selalu memakai HTTPS untuk domain ini',
            'Kunjungan pertama lewat `http://` bisa dibajak sebelum pengalihan ke HTTPS terjadi',
          ],
          [
            '`X-Content-Type-Options: nosniff`',
            'Melarang peramban menebak tipe berkas dari isinya',
            'Berkas unggahan bertipe teks bisa dieksekusi sebagai skrip oleh peramban lama',
          ],
          [
            '`Referrer-Policy`',
            'Membatasi seberapa banyak URL asal ikut terkirim ke situs lain',
            'URL berisi token atau id pesanan bocor ke setiap situs yang ditautkan',
          ],
          [
            "`frame-ancestors 'none'`",
            'Melarang halamanmu dimuat di dalam bingkai situs lain',
            'Clickjacking: tombolmu ditumpuk di bawah halaman penyerang',
          ],
          [
            '`Permissions-Policy`',
            'Mematikan akses ke kamera, mikrofon, dan lokasi',
            'Skrip pihak ketiga yang dimuat halamanmu bisa memintanya atas nama situsmu',
          ],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan konfigurasi punya dua wajah. Yang pertama tidak menghasilkan error sama sekali, dan yang kedua menghasilkan error yang menyesatkan karena datang dari lapisan yang salah.',
      ),
      code(
        'text',
        `
        YANG DIAM — tidak ada error, dan itu masalahnya:

          X-Powered-By: PHP/8.3.6        <- versi runtime diumumkan
          Server: nginx/1.24.0           <- versi server web diumumkan
          /debug, /metrics, /health?full=1 terbuka tanpa autentikasi
          direktori unggahan bisa dijelajahi
          akun bawaan masih memakai sandi bawaan
          CORS: Access-Control-Allow-Origin dipantulkan dari Origin

        Semua itu menjawab 200. Tidak ada satu pun yang tercatat
        sebagai kesalahan di mana pun.
        `,
      ),
      p(
        'Contoh nyata dari pengukuran di bab sebelumnya menunjukkan betapa mudahnya header seperti ini terkirim tanpa disadari.',
      ),
      code(
        'text',
        `
        Server PHP bawaan yang dipakai menguji kontrak API mengirim:

          HTTP/1.0 500 Internal Server Error
          X-Powered-By: PHP/8.3.6
          Access-Control-Allow-Origin: http://localhost:3000

        Tidak seorang pun menulis baris X-Powered-By itu.
        Ia bawaan, dan ia ikut terkirim sampai seseorang mematikannya
        (expose_php = Off).
        `,
      ),
      p(
        'Wajah kedua adalah CSP yang dipasang terlalu cepat, dan gejalanya sangat khas karena muncul di konsol peramban, bukan di log server.',
      ),
      code(
        'text',
        `
        Refused to execute inline script because it violates the following
        Content Security Policy directive: "script-src 'self'". Either the
        'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce is required.

        Refused to apply inline style because it violates the following
        Content Security Policy directive: "style-src 'self'".

        Refused to connect to 'https://api.pihakketiga.com/' because it
        violates the following Content Security Policy directive:
        "connect-src 'self'".
        `,
        {
          caption:
            'Halamannya tampak rusak tanpa satu pun error di sisi server. Konsol peramban satu-satunya tempat pesan ini ada.',
        },
      ),
      p(
        'Jalan keluarnya bukan menambahkan `unsafe-inline`, sebab itu mematikan sebagian besar manfaat CSP. Yang benar adalah memulai dari mode laporan sehingga kamu melihat apa saja yang akan diblokir sebelum benar-benar memblokirnya.',
      ),
      code(
        'text',
        `
        Tahap 1 — hanya melapor, tidak memblokir apa pun:
          Content-Security-Policy-Report-Only: default-src 'self';
            report-uri /csp-laporan

        Tahap 2 — baca laporannya selama beberapa hari, perbaiki
          skrip dan gaya inline yang ternyata masih dipakai.

        Tahap 3 — barulah ganti headernya menjadi
          Content-Security-Policy: ...

        Melewati tahap 1 hampir selalu berakhir dengan 'unsafe-inline'
        ditambahkan karena terburu-buru, dan CSP-nya jadi hiasan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di sini bukan tindakan yang salah melainkan tindakan yang tidak pernah dilakukan, dan itulah yang membuatnya sulit terlihat saat review kode.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengirim pesan dan stack error ke klien',
            'Biar gampang debug di produksi',
            'Diukur, satu respons membocorkan nama tabel, jalur berkas, dan struktur direktori server',
          ],
          [
            'Memakai konfigurasi yang sama untuk dev dan produksi',
            'Biar tidak ada kejutan',
            'Mode debug, CORS `localhost`, dan akun uji ikut terbawa ke produksi',
          ],
          [
            'Menambahkan `unsafe-inline` supaya CSP tidak mengganggu',
            'Halamannya jadi jalan lagi',
            'Itu mematikan perlindungan utamanya. Mulai dari `Report-Only`, perbaiki, baru tegakkan',
          ],
          [
            'Membiarkan `/metrics` atau `/debug` terbuka',
            'Tidak ditautkan dari mana pun',
            'Tidak ditautkan bukan berarti tidak bisa diakses. Pemindai menemukannya dalam hitungan menit',
          ],
          [
            'Membiarkan `X-Powered-By` dan `Server` apa adanya',
            'Cuma nama dan versi',
            'Itu memberi penyerang daftar kerentanan yang tepat untuk versi itu tanpa perlu menebak',
          ],
          [
            'Memasang header keamanan hanya di halaman utama',
            'Yang penting kan halaman depan',
            'Header dipasang per respons. Endpoint API dan halaman error juga membutuhkannya',
          ],
        ],
      ),
      p(
        'Baris terakhir sering terlewat karena cara pemasangannya. Header yang ditambahkan di satu handler tidak berlaku untuk handler lain, dan justru halaman error adalah tempat yang paling sering lupa dipasangi. Pasang di satu tempat yang dilalui semua respons, yaitu middleware paling luar atau konfigurasi server web, lalu buktikan dengan `curl -i` pada beberapa rute yang berbeda, termasuk satu rute yang sengaja dibuat gagal.',
      ),
      references(
        {
          label: 'A05:2021 — Security Misconfiguration',
          href: 'https://owasp.org/Top10/A05_2021-Security_Misconfiguration/',
          source: 'OWASP',
          note: 'Daftar kesalahan konfigurasi yang paling sering menyebabkan insiden nyata.',
        },
        {
          label: 'Content-Security-Policy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy',
          source: 'MDN Web Docs',
          note: 'Setiap direktif beserta artinya, termasuk cara memakai nonce alih-alih `unsafe-inline`.',
        },
        {
          label: 'Strict-Transport-Security',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security',
          source: 'MDN Web Docs',
          note: 'Termasuk konsekuensi `preload` yang sulit ditarik kembali.',
        },
        {
          label: 'HTTP Security Response Headers Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kumpulan header yang layak dipasang beserta nilai yang disarankan.',
        },
        {
          label: 'Configuration — Debug Mode',
          href: 'https://laravel.com/docs/12.x/configuration#debug-mode',
          source: 'Laravel',
          note: 'Peringatan resmi mengapa `APP_DEBUG` wajib `false` di produksi.',
        },
      ),
    ],
  ),

  written(
    'vulnerable-components',
    'Komponen Rentan & Audit Dependency',
    18,
    'Kerentanan yang kamu warisi tanpa menulis satu baris pun.',
    [
      p(
        'Aplikasi modern menjalankan lebih banyak kode orang lain daripada kode sendiri. Satu paket dengan kerentanan berjalan dengan **hak penuh aplikasimu** — akses database, rahasia, dan jaringan internal.',
      ),

      terms(
        {
          term: 'dependency',
          meaning:
            'Paket pihak ketiga yang dipasang dan dijalankan aplikasimu. Ia berjalan dengan **hak yang sama** dengan kodemu sendiri — tidak ada kotak pasir yang memisahkannya.',
        },
        {
          term: 'dependency langsung vs transitif',
          meaning:
            '**Langsung** = yang kamu tulis sendiri di `package.json`. **Transitif** = yang ikut terbawa oleh dependency lain. Sebagian besar pohonmu transitif, dan ia yang paling jarang ditinjau.',
        },
        {
          term: 'lockfile',
          meaning:
            'Berkas yang mengunci versi persis setiap paket (`package-lock.json`, `composer.lock`). Ia yang membuat pemasangan hari ini menghasilkan pohon yang sama dengan pemasangan bulan lalu.',
        },
        {
          term: '`npm ci` vs `npm install`',
          meaning:
            '`npm ci` **patuh pada lockfile** dan gagal bila tidak cocok; `npm install` boleh menyelesaikan versi lain dan menulis ulang lockfile. CI harus memakai yang pertama.',
        },
        {
          term: '`overrides`',
          meaning:
            'Bagian `package.json` yang memaksa versi tertentu untuk paket **transitif**. Cara menambal kerentanan yang berada di dalam dependency-nya dependency, tanpa menunggu pemeliharanya merilis.',
        },
        {
          term: '`npm audit fix --force`',
          meaning:
            'Perintah yang boleh **menurunkan versi mayor** untuk menutup kerentanan. Di project ini ia akan menurunkan Next.js 16 ke 9.3.3 — karena itu jangan pernah dijalankan tanpa membaca akibatnya.',
        },
        {
          term: 'supply chain attack',
          meaning:
            'Serangan yang menyusup lewat **paket yang kamu pasang**, bukan lewat aplikasimu. Ia bekerja karena satu paket berbahaya bisa menjangkau ribuan project sekaligus.',
        },
        {
          term: '`postinstall`',
          meaning:
            'Skrip yang otomatis berjalan setelah paket dipasang, dengan hak penggunamu — di laptopmu maupun di CI. Ini pintu masuk favorit serangan rantai pasok.',
        },
        {
          term: 'typosquatting',
          meaning:
            'Menerbitkan paket berbahaya dengan nama yang mirip paket populer (`expres`, `lodahs`, `crossenv`), menunggu seseorang salah ketik. Nyata, dan berulang kali berhasil.',
        },
        {
          term: 'CVE',
          meaning:
            '**Common Vulnerabilities and Exposures** — nomor identitas publik untuk satu kerentanan tertentu, sehingga semua orang membicarakan hal yang sama persis.',
        },
        {
          term: 'pin ke SHA',
          meaning:
            'Merujuk GitHub Action ke **hash commit**, bukan ke tag. Tag bisa dipindahkan pemiliknya ke commit lain; hash tidak bisa.',
        },
        {
          term: 'Dependabot',
          meaning:
            'Layanan GitHub yang membuka pull request otomatis untuk pembaruan dependency. Nilainya bukan otomatisasinya, melainkan membuat pembaruan menjadi **rutin dan kecil** alih-alih darurat dan besar.',
        },
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
      p(
        'Opsi `--production` pada baris kedua sering menjadi pembeda antara laporan yang bisa ditindaklanjuti dan laporan yang diabaikan. `npm audit` polos ikut memeriksa `devDependencies` seperti linter, test runner, dan alat build, padahal kerentanan di sana **tidak terekspos ke pengguna** karena paketnya tidak pernah berjalan di server. Menyaringnya membuat temuan yang tersisa benar-benar layak diperhatikan, alih-alih tenggelam di antara puluhan yang tidak relevan.',
      ),
      p(
        '`npm audit fix` tanpa `--force` hanya menerapkan perbaikan yang **tidak memutus** — kenaikan versi patch dan minor dalam rentang yang sudah kamu izinkan. Itu aman dijalankan rutin. Yang berbahaya adalah varian `--force`, dan peringatan berikutnya memakai project ini sendiri sebagai contoh nyata.',
      ),
      p(
        'Dua perintah terakhir berbeda maksud dari `audit`. `npm outdated` dan `composer outdated --direct` menjawab "apa yang sudah ketinggalan", bukan "apa yang rentan" — dan keduanya perlu, karena paket yang tertinggal jauh akan sulit dinaikkan saat suatu hari kerentanannya muncul. Opsi `--direct` membatasi keluarannya ke paket yang **kamu sebut sendiri** di `composer.json`, bukan seluruh pohon transitif yang bukan urusanmu langsung.',
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
      p(
        'Perbedaan dua perintah pertama adalah **sikapnya terhadap lockfile**, dan di konteks keamanan itu bukan detail. `npm ci` memasang persis apa yang tertulis di lockfile dan **gagal** kalau lockfile tidak cocok dengan `package.json`. `npm install` boleh menyelesaikan versi yang berbeda — artinya paket yang dipasang di CI bisa berbeda dari yang pernah kamu tinjau, dan perbedaan itu bisa memuat kode yang belum dilihat siapa pun.',
      ),
      p(
        'Kegagalan `npm ci` justru yang kamu inginkan. Ia mengubah masalah senyap yang biasa berbunyi "kok versi di server beda" menjadi build yang berhenti dengan pesan jelas. Perhatikan pasangannya di Composer bekerja dengan cara yang sama, karena `install` membaca `composer.lock` sedangkan `update` menulis ulangnya. Aturannya identik di kedua ekosistem, yaitu **`update` hanya dijalankan saat kamu memang berniat memperbarui, dan tidak pernah di server**.',
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
      p(
        'Dua opsi di baris itu menentukan apakah gerbang ini berguna atau sekadar mengganggu. `--production` membuang temuan di `devDependencies` yang tidak terekspos ke pengguna, dan `--audit-level=high` menetapkan ambang yang **memang menghentikan rilis**. Tanpa ambang, satu temuan `low` pada paket yang tidak pernah dipanggil akan menggagalkan build — dan gerbang yang terlalu sering merah untuk hal sepele akan segera dimatikan orang, sehingga tidak lagi menjaga apa pun.',
      ),
      p(
        'Perhatikan gerbang ini bekerja pada **setiap** build, bukan hanya saat kamu ingat memeriksanya. Itu bedanya dengan menjalankan `npm audit` secara manual: kerentanan yang diumumkan hari Selasa akan menggagalkan build hari Rabu, tanpa ada yang perlu mengingatnya. Pasangkan dengan Dependabot di atas — yang satu memberi tahu ada masalah, yang lain menyiapkan pull request perbaikannya.',
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

      h2('Studi kasus di project nyata'),
      p(
        'Sebagian besar kode yang berjalan di aplikasimu bukan kode yang kamu tulis. Angka itu bisa diukur, dan biasanya jauh lebih besar daripada dugaan.',
      ),
      code(
        'text',
        `
        Diukur sungguhan di project ini dengan npm:

          dependencies      :   4
          devDependencies   :  17
          langsung total    :  21

          total paket terpasang : 651
            untuk produksi      :  62
            untuk pengembangan  : 552

        Dua puluh satu keputusan sadar berubah menjadi 651 paket.
        `,
        { caption: 'Setiap paket itu berjalan dengan hak yang sama dengan kodemu sendiri.' },
      ),
      p('Dan hasil pemindaiannya juga nyata, bukan contoh karangan.'),
      code(
        'text',
        `
        npm audit pada project ini, saat materi ini ditulis:

          6 vulnerabilities (2 moderate, 3 high, 1 critical)

          @vitest/mocker   moderate   langsung=tidak   lewat: vitest
          js-yaml          high       langsung=tidak
          nanoid           high       langsung=tidak
          next             critical   langsung=YA
          sharp            high       langsung=tidak   lewat: next
          vitest           moderate   langsung=YA

        Empat dari enam TIDAK pernah dipasang siapa pun secara sadar.
        Mereka ikut terbawa.
        `,
      ),
      p(
        'Bagian yang paling sering tidak dibaca orang adalah kalimat yang menyertai saran perbaikannya, dan justru di situ letak keputusannya.',
      ),
      code(
        'text',
        `
        sharp  <0.35.4
        Severity: high
        fix available via \`npm audit fix --force\`
        Will install next@16.3.5, which is outside the stated dependency range

        Artinya:
          - perbaikan otomatisnya menaikkan Next.js ke versi MAYOR berikutnya
          - versi itu di luar rentang yang project ini nyatakan
          - menjalankannya bisa merusak hal yang sekarang bekerja

        Ini keputusan, bukan perintah yang dijalankan buta.
        `,
        {
          caption:
            'Aturan project ini juga menuntutnya: menaikkan versi dependency harus ditanyakan lebih dulu ke pemilik project.',
        },
      ),
      p(
        'Cara membacanya sederhana. `npm audit fix` tanpa `--force` hanya menaikkan versi di dalam rentang yang sudah dinyatakan, jadi risikonya kecil. Begitu `--force` diperlukan, yang sedang ditawarkan adalah perubahan mayor, dan itu masuk ke daftar pekerjaan tersendiri dengan pengujian tersendiri.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Yang membuat kategori ini sulit adalah errornya sering muncul **jauh dari paket yang bermasalah**, atau tidak muncul sama sekali sampai seseorang memanfaatkannya.',
      ),
      code(
        'text',
        `
        BENTUK 1 — muncul saat memasang, bukan saat menjalankan

          npm error code ERESOLVE
          npm error ERESOLVE unable to resolve dependency tree
          npm error Found: react@19.2.8
          npm error Could not resolve dependency:
          npm error peer react@"^18.0.0" from paket-lama@2.1.0

          Godaan terbesarnya adalah menambahkan --legacy-peer-deps
          supaya pesannya hilang. Yang terjadi: paketnya tetap terpasang
          dan ketidakcocokannya muncul nanti sebagai bug runtime
          yang tidak menyebut nama paket mana pun.

        BENTUK 2 — muncul di CI, bukan di mesin siapa pun

          npm error \`npm ci\` can only install packages when your
          package.json and package-lock.json are in sync

          Itu tanda lockfile-nya tidak ikut diperbarui bersama
          package.json. Perbaikannya bukan menghapus lockfile.
        `,
      ),
      p(
        'Bentuk ketiga tidak menghasilkan pesan apa pun, dan itulah yang paling berbahaya, sebab ia berupa paket yang memang berjalan sesuai deskripsinya sambil melakukan hal lain.',
      ),
      code(
        'text',
        `
        Yang perlu diperiksa SEBELUM sebuah paket masuk:

          - kapan rilis terakhirnya, dan berapa isu terbuka yang menumpuk
          - berapa orang yang berhak menerbitkannya
          - apakah namanya mirip paket populer (typosquatting):
              cross-env  vs  crossenv
              lodash     vs  lodahs
          - apakah ada skrip postinstall, dan apa isinya
          - berapa dependency yang ikut terbawa

        Pertanyaan terakhir sering menentukan: satu paket kecil yang
        membawa 40 dependency menambah 40 pintu, bukan satu.
        `,
      ),
      code(
        'bash',
        `
        # Lihat apa yang sebenarnya ikut terbawa SEBELUM memasang.
        npm view <paket> dependencies
        npm view <paket> maintainers
        npm view <paket> time.modified

        # Lihat siapa yang meminta sebuah paket transitif ada di sini.
        npm ls sharp
        npm explain nanoid

        # Pasang tanpa menjalankan skrip lifecycle paket mana pun.
        npm install --ignore-scripts

        # Di CI: pasang PERSIS seperti lockfile, jangan menyelesaikan ulang.
        npm ci
        `,
        {
          caption:
            '`npm explain` menjawab pertanyaan "kenapa paket ini ada di project saya" — pertanyaan yang paling sering tidak terjawab.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di kategori ini hampir semuanya berupa mengambil jalan tercepat untuk menghilangkan pesan, bukan untuk menyelesaikan masalahnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjalankan `npm audit fix --force` sampai bersih',
            'Tujuannya kan nol kerentanan',
            'Diukur, `--force` di project ini menaikkan Next.js ke luar rentang yang dinyatakan. Bisa merusak yang sekarang bekerja',
          ],
          [
            'Menambahkan `--legacy-peer-deps` agar pemasangan lolos',
            'Pesannya hilang dan paketnya terpasang',
            'Ketidakcocokannya tidak hilang, hanya ditunda menjadi bug runtime yang tidak menyebut nama paket',
          ],
          [
            'Menghapus `package-lock.json` saat CI mengeluh',
            'Biar dibuat ulang yang bersih',
            'Lockfile adalah catatan versi yang benar-benar teruji. Menghapusnya membuang satu-satunya jaminan reproduktifitas',
          ],
          [
            'Menganggap `devDependencies` tidak berisiko',
            'Tidak ikut ke produksi',
            'Diukur, 552 dari 651 paket ada di sisi dev. Semuanya berjalan di mesinmu dan di CI, tempat kredensial berada',
          ],
          [
            'Memasang paket kecil tanpa melihat dependency-nya',
            'Cuma satu fungsi kecil',
            'Satu paket bisa membawa puluhan paket lain. Periksa dengan `npm view <paket> dependencies` lebih dulu',
          ],
          [
            'Mengabaikan `npm audit` karena "cuma dev"',
            'Tidak menyentuh pengguna',
            'CI memegang token deploy dan kunci penerbitan. Itu target yang lebih berharga daripada satu server aplikasi',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas ditegaskan karena arah serangannya berlawanan dengan dugaan. Menyerang server produksi berarti mendapat satu sistem, sementara menyerang pipeline pembangunan berarti mendapat kemampuan menyisipkan kode ke setiap rilis berikutnya, sekaligus semua kredensial yang dipegang pipeline itu. Karena itulah `npm ci`, `--ignore-scripts` saat memeriksa paket baru, dan kebiasaan membaca siapa penerbit sebuah paket bukan formalitas, melainkan tempat pertahanan yang sebenarnya berada.',
      ),
      references(
        {
          label: 'A06:2021 — Vulnerable and Outdated Components',
          href: 'https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/',
          source: 'OWASP',
          note: 'Kategori kerentanan yang diwarisi lewat dependency, beserta cara mengelolanya.',
        },
        {
          label: 'npm audit',
          href: 'https://docs.npmjs.com/cli/v11/commands/npm-audit',
          source: 'npm Docs',
          note: 'Termasuk peringatan resmi tentang perilaku `--force` yang boleh menurunkan versi mayor.',
        },
        {
          label: 'npm ci',
          href: 'https://docs.npmjs.com/cli/v11/commands/npm-ci',
          source: 'npm Docs',
          note: 'Kenapa CI harus memakainya alih-alih `npm install`.',
        },
        {
          label: 'overrides',
          href: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json#overrides',
          source: 'npm Docs',
          note: 'Menambal versi paket transitif tanpa menunggu pemeliharanya merilis.',
        },
        {
          label: 'Configuring Dependabot version updates',
          href: 'https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuring-dependabot-version-updates',
          source: 'GitHub Docs',
          note: 'Opsi `groups`, jadwal, dan batas PR yang dipakai contoh di sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'auth-failures',
    'Kegagalan Identifikasi & Autentikasi',
    19,
    'Cara masuk yang bisa ditembus tanpa mengetahui password.',
    [
      terms(
        {
          term: 'autentikasi vs otorisasi',
          meaning:
            '**Autentikasi** menjawab "siapa kamu"; **otorisasi** menjawab "kamu boleh apa". Sub-bab ini soal yang pertama; yang kedua ada di sub-bab 5.1.',
        },
        {
          term: 'credential stuffing',
          meaning:
            'Mencoba pasangan email–password yang bocor dari situs **lain** ke situsmu. Berhasil karena banyak orang memakai password yang sama di banyak tempat — bukan karena sistemmu ditembus.',
        },
        {
          term: 'enumerasi akun',
          meaning:
            'Menyimpulkan email mana yang terdaftar dari perbedaan jawaban sistem. Karena itu "password salah" dan "akun tidak ada" **wajib** menghasilkan pesan, status, dan waktu respons yang sama.',
        },
        {
          term: 'timing attack',
          meaning:
            'Menyimpulkan rahasia dari **selisih waktu** respons. Jika akun tak ada langsung ditolak sementara akun ada harus melewati verifikasi hash, selisihnya bisa diukur — itu kebocoran juga.',
        },
        {
          term: 'dummy hash',
          meaning:
            'Hash yang tetap diverifikasi ketika pengguna tidak ditemukan, semata agar waktu prosesnya sama. Cara paling sederhana menutup timing attack pada endpoint login.',
        },
        {
          term: 'argon2 / bcrypt',
          meaning:
            'Algoritma hash password **adaptif**: biayanya bisa dinaikkan seiring perangkat keras makin cepat. Jangan pernah memakai MD5, SHA-1, atau SHA biasa untuk password.',
        },
        {
          term: '`needsRehash`',
          meaning:
            'Pemeriksaan apakah hash tersimpan masih memakai parameter biaya lama. Bila ya, hash diperbarui saat pengguna berhasil login — satu-satunya momen password aslinya tersedia.',
        },
        {
          term: 'session fixation',
          meaning:
            'Penyerang menanamkan ID sesi lebih dulu, lalu menunggu korban login memakai sesi itu. Dicegah dengan **meregenerasi ID sesi** tepat setelah login berhasil.',
        },
        {
          term: 'MFA / OTP',
          meaning:
            '**Multi-Factor Authentication**: faktor kedua di luar password. **OTP** adalah kode sekali pakai — enam digit berarti sejuta kemungkinan, yang habis dalam menit tanpa rate limit.',
        },
        {
          term: '`timingSafeEqual`',
          meaning:
            'Perbandingan yang selalu memakan waktu sama, berapa pun karakter yang cocok. Perbandingan `===` biasa berhenti di ketidakcocokan pertama, dan itu bisa diukur.',
        },
        {
          term: 'k-anonymity (Have I Been Pwned)',
          meaning:
            'Cara memeriksa apakah password pernah bocor **tanpa mengirimnya**: hanya lima karakter pertama hash SHA-1 yang dikirim, dan pencocokan akhirnya dilakukan di sisimu.',
        },
        {
          term: 'entropi',
          meaning:
            'Ukuran seberapa sulit sebuah rahasia ditebak. Untuk password, **panjang** menyumbang lebih banyak entropi daripada aturan kerumitan karakter.',
        },
        {
          term: 'token reset disimpan sebagai hash',
          meaning:
            'Yang disimpan database adalah sidik jari tokennya, bukan tokennya. Database yang bocor jadi tidak cukup untuk mengambil alih akun mana pun.',
        },
      ),

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
              error: { kode: 'KREDENSIAL_SALAH', pesan: 'Email atau password salah' },
            });
          }

          if (pengguna.dinonaktifkan) {
            // Pesan yang sama juga di sini — jangan ungkap status akun.
            return res.status(401).json({
              error: { kode: 'KREDENSIAL_SALAH', pesan: 'Email atau password salah' },
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
      p(
        'Rate limit di awal memeriksa **dua** kunci sekaligus, dan keduanya menutup serangan yang berbeda. Kunci per akun menahan seribu mesin yang masing-masing mencoba beberapa kali terhadap satu akun — pola botnet yang setiap IP-nya berada jauh di bawah ambang per-IP. Kunci per IP menahan satu mesin yang mencoba ribuan password. Menghilangkan salah satunya menyisakan satu pintu terbuka lebar.',
      ),
      p(
        'Perhatikan **tiga** cabang penolakan di tengah fungsi ini mengembalikan kode dan pesan yang **sama persis**, yaitu untuk email tidak ada, password salah, dan akun dinonaktifkan. Yang ketiga paling sering dianggap tidak berbahaya dengan alasan "kan cuma memberi tahu akunnya nonaktif", padahal ia mengonfirmasi bahwa email itu **terdaftar**, dan itu separuh informasi yang dicari penyerang.',
      ),
      p(
        'Baris `argon2.verify(pengguna?.kataSandiHash ?? HASH_PALSU, ...)` menutup kebocoran yang tidak terlihat di isi respons. Karena argon2 sengaja lambat, langsung `return` saat pengguna tidak ada akan menghasilkan jawaban dalam milidetik, sementara email yang terdaftar butuh ratusan milidetik. Selisih itu bisa diukur dari luar, dan hasilnya sama saja dengan pesan error yang berbeda. Perhatikan `HASH_PALSU` dihitung **sekali** di luar fungsi — menghitungnya per permintaan justru menambah beban tanpa manfaat.',
      ),
      p(
        'Tiga langkah terakhir menutup kelas kegagalan dari tabel di atas. `needsRehash` mengangkat password lama ke parameter biaya baru — dan inilah satu-satunya momen password aslinya tersedia. `regenerasiSesi` mengganti id sesi **sebelum** identitas dititipkan, mencegah session fixation. Dan `log.info` mencatat login berhasil beserta IP-nya; tanpa jejak itu, "akun saya diakses orang lain" tidak bisa ditelusuri sama sekali.',
      ),
      callout(
        'danger',
        'Waktu respons juga membocorkan',
        'Kalau email tidak ada dan kamu langsung `return`, responsnya jauh lebih cepat daripada saat hash sungguhan diverifikasi. Selisih itu bisa diukur, dan ia sama saja dengan pesan error yang berbeda. Verifikasi terhadap dummy hash menutupnya.',
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
      p(
        'Struktur fungsi ini yang paling penting, yaitu **respons di luar blok `if`**. Apa pun hasil pencarian emailnya, jawabannya sama persis, sehingga tidak ada yang bisa memakai formulir "lupa password" sebagai alat memetakan email mana yang terdaftar. Perhatikan kalimat jawabannya juga disusun untuk itu, sebab kalimat "kalau email terdaftar, kami sudah mengirim…" tidak mengaku apa pun.',
      ),
      p(
        'Pengiriman emailnya lewat **antrean**, bukan langsung, dan itu bukan sekadar kerapian. Memanggil layanan email di sini akan menambah waktu respons hanya untuk email yang **terdaftar** — dan selisih waktu itu membocorkan persis yang baru saja kamu tutup. Antrean membuat kedua jalur selesai sama cepatnya.',
      ),
      p(
        'Komentar pada `hash: sha256(token)` menandai keputusan yang sama seperti pada refresh token di sub-bab 2.4: yang tersimpan adalah **sidik jarinya**, sedangkan token aslinya hanya ada di email pengguna. Database yang bocor jadi tidak cukup untuk mengambil alih akun mana pun. Perhatikan SHA-256 memadai di sini dan argon2 justru tidak perlu — token ini nilai acak 32 byte yang mustahil ditebak, bukan password buatan manusia yang rawan serangan kamus.',
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
      p(
        'Komentar pembuka menyatakan aritmetikanya dengan jujur: kode enam digit hanya punya **satu juta** kemungkinan. Tanpa batas percobaan, itu bukan pertahanan sama sekali — skrip sederhana bisa menghabiskan seluruhnya dalam hitungan menit. Ini kelalaian yang menyakitkan karena MFA dipasang justru untuk melindungi akun, lalu endpoint verifikasinya dibiarkan terbuka dan seluruh manfaatnya hilang.',
      ),
      p(
        'Perhatikan komentar `kode dibatalkan, bukan sekadar ditolak`. Bedanya menentukan: kalau kamu hanya menolak percobaan ke-6, penyerang tinggal menunggu jendela rate limit berlalu lalu melanjutkan dari tebakan berikutnya — kodenya masih sah dan ruang tebakannya menyusut terus. `batalkanKodeOtp` membuang kodenya sepenuhnya, sehingga setiap serangan harus dimulai dari nol dengan kode baru.',
      ),
      p(
        '`timingSafeEqual` menutup kebocoran yang lebih halus. Perbandingan `===` biasa **berhenti pada karakter pertama yang berbeda**, jadi kode yang tiga digit pertamanya benar dibandingkan sedikit lebih lama daripada yang salah sejak awal. Selisihnya sangat kecil, tetapi cukup untuk menebak digit demi digit — mengubah satu juta kemungkinan menjadi enam puluh percobaan. Perhatikan `.padEnd(6)` di kedua sisi: `timingSafeEqual` melempar kalau panjang buffer-nya berbeda, dan pengecualian itu sendiri akan membocorkan panjang kode yang benar.',
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

      h2('Studi kasus di project nyata'),
      p(
        'Kegagalan autentikasi jarang berupa sandi yang bisa ditebak. Lebih sering ia berupa **saluran sampingan** yang memberi tahu penyerang lebih banyak daripada yang dimaksudkan, dan yang paling murah dieksploitasi adalah pesan errornya sendiri.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0. Pesan yang "membantu pengguna":

          ana@contoh.id  -> {"status":401,"pesan":"Password salah"}
          budi@contoh.id -> {"status":404,"pesan":"Email tidak terdaftar"}

        Penyerang kini tahu ana@contoh.id TERDAFTAR dan budi@contoh.id tidak,
        tanpa pernah menebak satu sandi pun.

        Pesan seragam:
          ana@contoh.id  -> {"status":401,"pesan":"Email atau password salah"}
          budi@contoh.id -> {"status":401,"pesan":"Email atau password salah"}
        `,
      ),
      p(
        'Menyeragamkan pesannya belum cukup, sebab ada saluran kedua yang tidak terlihat di badan respons, yaitu **berapa lama** server menjawab.',
      ),
      code(
        'text',
        `
        Diukur, median dari 40 percobaan login yang GAGAL:

          pengguna ADA   : 28,05 ms
          pengguna TIADA :  0,00 ms

        Selisih 28 milidetik itu cukup untuk memisahkan email yang
        terdaftar dari yang tidak, meski pesannya identik.

        Sebabnya sederhana: bila penggunanya tidak ada, kodenya
        keluar lebih awal dan TIDAK PERNAH menjalankan hash.
        `,
      ),
      p(
        'Perbaikan yang tampak jelas adalah tetap menghitung hash meski penggunanya tidak ada. Perbaikan itu diukur, dan hasilnya **membuat kebocorannya lebih besar**.',
      ),
      code(
        'text',
        `
        Diukur, median dari 40 percobaan:

          patokan dihitung TIAP permintaan
            ada=27,96 ms   tiada=56,54 ms   selisih=28,58 ms

          patokan dihitung SEKALI saat boot
            ada=28,19 ms   tiada=27,82 ms   selisih= 0,37 ms

        Versi pertama menjalankan scrypt DUA KALI untuk pengguna
        yang tidak ada — sekali untuk patokan palsu, sekali untuk
        masukannya. Selisihnya justru lebih besar daripada tanpa
        perbaikan sama sekali, hanya arahnya terbalik.
        `,
        {
          caption:
            'Perbaikan yang masuk akal secara logika bisa memperburuk keadaan. Itulah sebabnya diukur, bukan dikira.',
        },
      ),
      code(
        'ts',
        `
        // Patokan dihitung SEKALI saat proses dinyalakan, bukan per permintaan.
        const HASH_PALSU = crypto.scryptSync('tidak-akan-pernah-cocok', GARAM, 32).toString('hex');

        function masuk(surel: string, sandi: string) {
          const u = cariPengguna(surel);
          const patokan = u?.hash ?? HASH_PALSU;              // konstanta, bukan kerja baru
          const h = crypto.scryptSync(sandi, GARAM, 32).toString('hex');
          const cocok = crypto.timingSafeEqual(Buffer.from(h), Buffer.from(patokan));
          return Boolean(u) && cocok;
        }

        // Kebenarannya tetap sama, diuji:
        //   masuk(ana, benar123)  -> true
        //   masuk(ana, salah)     -> false
        //   masuk(budi, apa pun)  -> false
        `,
      ),
      p(
        'Kunci perbaikannya ada pada kata sekali. Menghitung hash palsu pada tiap permintaan justru menambahkan kerja baru yang waktunya ikut berubah-ubah, dan pengukuran di bab ini menunjukkan selisihnya malah membesar. Karena patokannya dihitung saat proses menyala, jalur pengguna yang tidak ada dan jalur sandi yang salah mengerjakan jumlah kerja yang sama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dua kegagalan berikutnya juga tidak menghasilkan pesan error, dan keduanya sering ada bersamaan di aplikasi yang sama.',
      ),
      code(
        'text',
        `
        SESSION FIXATION — diukur sungguhan

          penyerang menanam id      : id-yang-DITANAM-penyerang
          tanpa regenerasi, sesudah login id-nya : id-yang-DITANAM-penyerang
            -> penyerang memegang id yang SAMA, dan kini id itu
               menunjuk sesi Ana yang SUDAH LOGIN

          dengan regenerasi, sesudah login id-nya:
            77565be0-8f10-4549-b97a-36d97ad1b30b
            -> id lama dibuang; id yang dipegang penyerang tidak
               lagi menunjuk sesi mana pun
        `,
        { caption: 'Satu baris regenerasi id sesudah login menutup seluruh serangan ini.' },
      ),
      code(
        'text',
        `
        TANPA PEMBATASAN LAJU — diukur, lalu diskalakan

          tanpa pembatasan laju : ~350 tebakan / 10 detik
            (diukur 200 ms lalu diskalakan; batasnya di sini adalah
             biaya scrypt itu sendiri, bukan aturan apa pun)

          dengan 5 percobaan / 15 menit per akun:
            5 tebakan / 10 detik, sisanya 429

        Perhatikan: hash yang lambat SUDAH menjadi pembatas alami.
        Tapi 350 tebakan per 10 detik tetap berarti 3.000 per menit,
        dan daftar seribu sandi terpopuler habis dalam 20 detik.
        `,
      ),
      p(
        'Pembatasan lajunya harus dipasang di dua sumbu sekaligus, sebab masing-masing menutup serangan yang berbeda.',
      ),
      code(
        'text',
        `
        PER AKUN   : melindungi satu pengguna dari ditebak berulang
                     5 gagal -> kunci 15 menit

        PER IP     : melindungi dari satu penyerang yang mencoba
                     BANYAK akun sekaligus
                     100 percobaan/jam per IP

        Keduanya diperlukan:
          - hanya per akun  -> penyerang mencoba satu sandi populer
                               ke 10.000 akun berbeda (credential stuffing)
          - hanya per IP    -> penyerang memakai 10.000 IP berbeda
                               untuk menyerang satu akun

        Dan ada jebakannya: penguncian per akun bisa dipakai untuk
        MENGUNCI pengguna lain dengan sengaja. Karena itu pakai
        penundaan bertingkat, bukan penguncian keras, untuk akun biasa.
        `,
      ),
      code(
        'ts',
        `
        // Token setel-ulang sandi: tiga sifat yang wajib ada sekaligus.
        async function buatTokenSetelUlang(penggunaId: number) {
          const mentah = crypto.randomBytes(32).toString('base64url');   // 1. acak kriptografis
          await db.simpanToken({
            penggunaId,
            // 2. yang DISIMPAN adalah hash-nya. Bocornya basis data
            //    tidak memberi penyerang token yang bisa dipakai.
            hash: crypto.createHash('sha256').update(mentah).digest('hex'),
            kedaluwarsa: Date.now() + 15 * 60 * 1000,                    // 3. berumur pendek
            terpakai: false,
          });
          return mentah;   // hanya ini yang dikirim lewat surel
        }

        // Dan saat dipakai: tandai terpakai DI DALAM transaksi yang sama,
        // supaya satu token tidak bisa dipakai dua kali secara bersamaan.
        `,
      ),
      p(
        'Ketiga sifat itu menutup lubang yang berbeda, dan menghilangkan satu saja membatalkan dua lainnya. Acak kriptografis menutup tebakan, menyimpan hash menutup akibat bocornya basis data, dan umur pendek menutup token lama yang tertinggal di kotak surel. Penandaan terpakai di dalam transaksi yang sama menutup yang keempat, yaitu dua permintaan yang tiba bersamaan dan sama-sama lolos.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di sini hampir semuanya lahir dari niat baik, yaitu keinginan membuat pengalaman masuk terasa membantu dan ramah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membedakan "email tidak terdaftar" dan "password salah"',
            'Pengguna jadi tahu masalahnya',
            'Diukur, itu memberi penyerang daftar email yang terdaftar tanpa menebak satu sandi pun',
          ],
          [
            'Menyeragamkan pesan lalu menganggapnya selesai',
            'Pesannya sudah sama',
            'Diukur, selisih waktunya 28 ms — cukup untuk membedakan keduanya meski pesannya identik',
          ],
          [
            'Menghitung hash palsu di setiap permintaan agar seragam',
            'Biar waktunya sama',
            'Diukur, itu menjalankan hash DUA KALI dan selisihnya justru naik jadi 28,58 ms. Hitung patokan sekali saat boot',
          ],
          [
            'Tidak meregenerasi id sesi sesudah login',
            'Sesinya kan sudah ada',
            'Diukur, id yang ditanam penyerang tetap berlaku dan kini menunjuk sesi yang sudah login',
          ],
          [
            'Membatasi laju hanya per akun',
            'Yang diserang kan akunnya',
            'Credential stuffing mencoba satu sandi ke ribuan akun. Batasi per IP juga',
          ],
          [
            'Menyimpan token setel-ulang apa adanya di basis data',
            'Kan sudah acak',
            'Basis data yang bocor langsung memberi token yang bisa dipakai. Simpan hash-nya, kirim yang mentah',
          ],
        ],
      ),
      p(
        'Hasil pengukuran di baris ketiga pantas diingat melampaui topiknya. Perbaikan itu benar secara penalaran, ditulis dengan niat yang tepat, dan membuat keadaannya lebih buruk. Satu-satunya yang menunjukkannya adalah pengukuran. Untuk kontrol keamanan, keyakinan bahwa sesuatu seharusnya bekerja tidak pernah setara dengan bukti bahwa ia bekerja.',
      ),
      references(
        {
          label: 'A07:2021 — Identification and Authentication Failures',
          href: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
          source: 'OWASP',
          note: 'Daftar kegagalan autentikasi yang paling sering ditemukan di lapangan.',
        },
        {
          label: 'Password Storage Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Parameter argon2id/bcrypt yang disarankan, beserta alasan tidak memakai SHA biasa.',
        },
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Aturan panjang password, pesan error seragam, dan pencegahan enumerasi akun.',
        },
        {
          label: 'Forgot Password Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Alur reset password yang tidak berubah menjadi jalur pengambilalihan akun.',
        },
        {
          label: 'crypto.timingSafeEqual()',
          href: 'https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b',
          source: 'Node.js',
          note: 'Perbandingan waktu-konstan untuk token, kode OTP, dan tanda tangan.',
        },
      ),
    ],
  ),

  written(
    'integrity-failures',
    'Integritas Software & Data',
    16,
    'Memastikan yang berjalan memang yang kamu maksud.',
    [
      p(
        'Kategori ini tentang **kepercayaan pada asal**: apakah kode yang berjalan benar-benar yang kamu tulis, dan apakah data yang kamu terima benar-benar dari pihak yang mengaku mengirimnya.',
      ),

      terms(
        {
          term: 'integritas',
          meaning:
            'Jaminan bahwa sesuatu **tidak berubah** sejak dibuat pihak yang sah. Berbeda dari kerahasiaan: data bisa terbuka untuk umum dan tetap butuh jaminan bahwa isinya tidak dipalsukan.',
        },
        {
          term: 'webhook',
          meaning:
            'Permintaan HTTP yang **dikirim layanan lain ke servermu** saat suatu peristiwa terjadi — misalnya "pembayaran berhasil". Ia endpoint publik, jadi asalnya harus dibuktikan, bukan dipercaya.',
        },
        {
          term: 'HMAC',
          meaning:
            '**Hash-based Message Authentication Code** — sidik jari pesan yang hanya bisa dibuat pihak yang memegang secret bersama. Ia yang membuktikan pengirim webhook memang siapa yang ia klaim.',
        },
        {
          term: 'raw body',
          meaning:
            'Body permintaan **sebelum** diurai menjadi objek. Verifikasi tanda tangan wajib memakainya, karena mengurai lalu menyusun ulang JSON bisa mengubah urutan kunci dan spasi — tanda tangannya jadi tidak cocok.',
        },
        {
          term: 'replay attack',
          meaning:
            'Mengirim ulang permintaan sah yang direkam sebelumnya. Tanda tangannya tetap valid, jadi pertahanannya bukan tanda tangan melainkan **timestamp** yang ditolak setelah beberapa menit.',
        },
        {
          term: 'at-least-once',
          meaning:
            'Jaminan pengiriman yang berarti sebuah peristiwa bisa tiba **lebih dari sekali**. Semua pengirim webhook besar memakainya — jadi penangannya wajib idempoten.',
        },
        {
          term: 'idempoten',
          meaning:
            'Menjalankan operasi yang sama dua kali menghasilkan keadaan akhir yang sama dengan sekali. Untuk webhook, wujudnya adalah mengklaim id peristiwa sebelum memprosesnya.',
        },
        {
          term: 'digest (image digest)',
          meaning:
            'Hash isi image container (`sha256:…`). Menyematkan digest membuat deployment mengambil **byte yang sama persis**; tag seperti `latest` bisa menunjuk isi berbeda besok.',
        },
        {
          term: 'append-only',
          meaning:
            'Penyimpanan yang hanya menerima penambahan — tidak bisa diubah atau dihapus. Sifat inilah yang membuat audit log tetap berguna setelah akun aplikasi dikuasai penyerang.',
        },
        {
          term: '`REVOKE`',
          meaning:
            'Perintah SQL untuk mencabut izin. `REVOKE UPDATE, DELETE ON audit_log` menegakkan sifat append-only di **lapisan database**, bukan sekadar di kesepakatan tim.',
        },
        {
          term: 'audit trail',
          meaning:
            'Catatan **siapa melakukan apa, terhadap objek mana, kapan**. Ia yang membedakan insiden yang bisa dijawab dari insiden yang hanya bisa ditebak luasnya.',
        },
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
      p(
        '`npm ci --ignore-scripts` menutup jalur serangan yang bekerja **saat pemasangan**, jauh sebelum kodemu berjalan. Skrip `postinstall` sebuah paket berjalan dengan hak penggunamu — di laptopmu, dan lebih berbahaya lagi di CI, tempat variabel environment memuat token npm serta kredensial deploy. Perhatikan komentarnya menambahkan syarat: hanya kalau paketmu memang tidak membutuhkannya, karena sebagian paket sah benar-benar mengandalkan skrip itu untuk mengompilasi binary.',
      ),
      p(
        'Blok kedua menyematkan action ke **SHA commit**, bukan tag. Bedanya mendasar: tag Git hanyalah penunjuk yang **bisa dipindahkan** pemilik repositori kapan saja, sedangkan SHA adalah sidik jari isi commit yang mustahil dipalsukan. Repositori action yang dibajak tinggal memindahkan tag `v4` ke commit berbahaya, dan setiap workflow yang memakai `@v4` langsung menjalankannya — dengan akses ke seluruh rahasia CI-mu.',
      ),
      p(
        'Perhatikan komentar `# v4.1.0` di ujung baris. SHA tidak terbaca manusia, jadi tanpa catatan itu tidak ada yang tahu versi apa yang sedang dipakai maupun kapan layak dinaikkan. Alat seperti Dependabot juga membacanya untuk mengusulkan pembaruan — jadi komentar itu bagian dari mekanismenya, bukan sekadar catatan.',
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
      p(
        'Komentar berhuruf besar menandai kesalahan yang paling sering membuat verifikasi webhook gagal misterius: tanda tangan **wajib** dihitung dari body **mentah**, bukan dari hasil `JSON.parse` yang diserialisasi ulang. `JSON.stringify(req.body)` bisa menghasilkan urutan kunci atau spasi yang berbeda dari yang dikirim pengirim, dan satu byte berbeda sudah cukup membuat HMAC-nya tidak cocok. Blok kedua menunjukkan caranya: opsi `verify` pada `express.json` menyimpan buffer aslinya **sebelum** diurai.',
      ),
      p(
        'Pemeriksaan `umur > 300` menutup **replay attack**. Tanpa itu, permintaan sah yang pernah disadap, entah dari log proxy, dari riwayat, atau dari mana pun, bisa dikirim ulang berkali-kali dengan tanda tangan yang tetap valid selamanya, karena tanda tangan hanya membuktikan keaslian isi, bukan kesegarannya. Perhatikan `timestamp` ikut masuk ke perhitungan HMAC (`${timestamp}.${req.rawBody}`), sebab kalau tidak, penyerang tinggal mengganti header timestamp-nya sendiri.',
      ),
      p(
        '`timingSafeEqual` di akhir memakai alasan yang sama seperti pada OTP, sebab perbandingan `===` berhenti di karakter pertama yang berbeda, dan selisih waktunya bisa diukur untuk menebak tanda tangan yang benar karakter demi karakter. Perhatikan `a.length !== b.length` diperiksa lebih dulu dengan `||`, karena `timingSafeEqual` melempar untuk panjang yang berbeda, dan hubung-singkat itu mencegah pengecualiannya. Dan `log.warn` mencatat setiap kegagalan, sebab lonjakan tanda tangan tidak sah adalah sinyal seseorang sedang mencoba memalsukan peristiwa.',
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
      p(
        'Komentar pembuka menyebut sifat yang menentukan seluruh rancangan ini, yaitu pengirim webhook memakai jaminan **at-least-once**. Kalau jawabanmu lambat, gagal, atau koneksinya putus sebelum sampai, mereka mengirim ulang, dan itu perilaku yang benar dari sisi mereka alih-alih bug. Konsekuensinya, handler webhook **wajib** aman dijalankan berulang, persis seperti handler job di sub-bab 2.8.',
      ),
      p(
        '`klaimPeristiwaWebhook` mengerjakan pemeriksaan dan penandaan dalam **satu operasi atomik** — biasanya `INSERT` yang mengandalkan batasan `UNIQUE` pada `idPeristiwa`. Itu penting karena dua pengiriman ulang bisa tiba benar-benar bersamaan; pola "cek dulu, lalu tulis" punya jendela di antaranya, dan di jendela itulah keduanya sama-sama menyimpulkan peristiwanya belum pernah diproses.',
      ),
      p(
        'Perhatikan duplikat dijawab **`200`**, bukan `409` atau error. Ini berlawanan dengan naluri karena duplikat terasa seperti sesuatu yang layak ditolak, tetapi status `4xx`/`5xx` akan membuat pengirim mencoba lagi untuk peristiwa yang **sudah berhasil** kamu proses, dan pengulangannya tidak akan pernah berhenti. Duplikat yang terdeteksi bukan kegagalan melainkan hasil yang benar, dan `200` yang menyatakannya.',
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

      h2('Integritas data dan audit trail'),
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
      p(
        'Pasangan kolom `sebelum` dan `sesudah` adalah yang membedakan audit log dari log biasa. Log aplikasi mencatat bahwa sesuatu **terjadi**, sedangkan kedua kolom `JSONB` ini mencatat **apa yang berubah**, sehingga saat menyelidiki insiden, kamu bisa melihat nilai lamanya dan memulihkannya. Perhatikan keduanya `nullable`, sebab pembuatan tidak punya `sebelum` dan penghapusan tidak punya `sesudah`.',
      ),
      p(
        'Baris `REVOKE` di akhir yang paling penting, dan ia menerapkan hak akses minimum di tempat yang jarang terpikir. Aplikasi hanya perlu **menulis** ke tabel ini — ia tidak pernah punya alasan sah untuk mengubah atau menghapus catatan audit. Mencabut izinnya di lapisan database berarti penyerang yang menguasai aplikasi tetap tidak bisa membersihkan jejaknya, bahkan dengan menjalankan query apa pun yang ia mau.',
      ),
      p(
        'Perhatikan pencabutan ini dilakukan pada `app_user`, yaitu user database yang dipakai aplikasi, dan bukan pada pemilik skema. Konsekuensinya harus diterima sadar, sebab migrasi dan pembersihan berkala tabel ini nanti butuh kredensial berbeda. Itu memang tujuannya. Dan seperti disebut di sub-bab 5.9, salin juga ke penyimpanan terpisah yang append-only, karena siapa pun yang menguasai server database masih bisa menyentuh tabelnya langsung.',
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

      h2('Studi kasus di project nyata'),
      p(
        'Kategori ini menanyakan satu hal, yaitu apakah kamu bisa memastikan bahwa kode dan data yang masuk ke sistemmu benar-benar berasal dari sumber yang kamu percaya. Contoh paling langsungnya adalah data terserialisasi yang dibangkitkan kembali menjadi objek.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan PHP 8.3.6.

        Data sah yang dibuat server sendiri:
          O:4:"Sesi":2:{s:8:"pengguna";s:3:"ana";s:5:"peran";s:4:"user";}
          -> Sesi peran=user

        Data yang DITULIS SENDIRI oleh penyerang:
          O:4:"Sesi":2:{s:8:"pengguna";s:3:"ana";s:5:"peran";s:5:"admin";}
          -> Sesi peran=admin

        Penyerang menaikkan perannya sendiri tanpa menyentuh basis data.
        `,
      ),
      p(
        'Yang membuatnya jauh lebih berbahaya daripada sekadar mengubah nilai adalah kemampuan memilih **kelas mana** yang dibangkitkan, termasuk kelas yang sama sekali tidak berhubungan dengan sesi.',
      ),
      code(
        'text',
        `
        Payload: O:6:"Berkas":1:{s:5:"jalur";s:17:"/etc/passwd-PALSU";}

          [__destruct Berkas berjalan] akan menghapus: /etc/passwd-PALSU

        Penyerang tidak pernah memanggil kelas Berkas. unserialize
        yang membangunnya, lalu __destruct berjalan SENDIRI dengan
        jalur pilihan penyerang.

        Di aplikasi sungguhan, kelas seperti ini ada di mana-mana:
        pembersih berkas sementara, penulis cache, pengirim log.
        Rangkaiannya punya nama sendiri: gadget chain.
        `,
        {
          caption:
            'Kerentanannya bukan pada kelas Berkas. Kelas itu benar. Kerentanannya pada siapa yang boleh memilih kelas.',
        },
      ),
      code(
        'php',
        `
        // Bila format asli benar-benar tidak bisa dihindari, batasi kelasnya.
        $aman = unserialize($data, ['allowed_classes' => ['Sesi']]);
        // Diuji: payload Berkas menjadi __PHP_Incomplete_Class,
        //        dan __destruct kelas Berkas TIDAK berjalan.

        // Yang jauh lebih baik: pakai format yang tidak bisa membangkitkan
        // objek apa pun.
        $data = json_decode($teks, true);
        // Diuji: selalu array atau skalar. Tidak ada konstruktor,
        //        tidak ada __destruct, tidak ada gadget.
        `,
      ),
      p(
        'Bentuk yang sama berlaku di stack lain dengan nama berbeda. Python punya `pickle`, Java punya serialisasi nativenya, Node punya `node-serialize`, dan YAML punya pemuat penuh yang bisa membangun objek. Semuanya menanyakan pertanyaan yang sama, yaitu apakah data ini boleh menentukan kode apa yang berjalan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Serangan yang berhasil tidak menghasilkan error. Yang menghasilkan error justru percobaan yang **setengah berhasil**, dan pesannya perlu dikenali karena ia menandai adanya percobaan.',
      ),
      code(
        'text',
        `
        Diukur saat payload penyerang panjang stringnya tidak tepat:

          PHP Warning: unserialize(): Error at offset 50 of 54 bytes
          [__destruct Berkas berjalan] akan menghapus:

        Perhatikan urutannya. unserialize GAGAL, dan __destruct
        TETAP BERJALAN — objeknya sempat dibangun sebagian sebelum
        pengurainya menyerah.

        Artinya: kegagalan unserialize BUKAN jaminan bahwa tidak
        ada kode yang berjalan.
        `,
      ),
      p(
        'Sisi kedua dari kategori ini adalah integritas rantai pembangunan, dan di sinilah lockfile berhenti menjadi berkas yang mengganggu dan mulai menjadi kontrol keamanan.',
      ),
      code(
        'text',
        `
        npm error \`npm ci\` can only install packages when your package.json
        and package-lock.json are in sync. Please update your lock file with
        \`npm install\` before continuing.

        npm error code EINTEGRITY
        npm error sha512-... integrity checksum failed when using sha512:
        wanted sha512-abc... but got sha512-xyz...

        Pesan kedua berarti isi paket yang diunduh TIDAK SAMA dengan
        yang tercatat saat lockfile dibuat. Itu bisa berarti registry
        bermasalah, atau berarti sesuatu yang jauh lebih serius.
        Jangan pernah menyelesaikannya dengan menghapus lockfile.
        `,
      ),
      code(
        'text',
        `
        TIGA TEMPAT lain yang menentukan integritas, dan sering terlewat:

        1. Skrip pihak ketiga di halaman tanpa Subresource Integrity

           <script src="https://cdn.contoh.com/paket.js"></script>
           -> bila CDN-nya dibajak, skrip apa pun berjalan di halamanmu

           <script src="https://cdn.contoh.com/paket.js"
                   integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
                   crossorigin="anonymous"></script>
           -> peramban MENOLAK menjalankannya bila isinya berubah

        2. Pembaruan otomatis tanpa verifikasi tanda tangan
           -> saluran pembaruan adalah jalur masuk paling langsung
              ke setiap mesin yang memasangnya

        3. Data dari antrean atau webhook yang dipercaya begitu saja
           -> "datang dari antrean kita sendiri" bukan autentikasi.
              Pesan antrean tetap divalidasi dan tetap diotorisasi
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di sini berakar pada satu asumsi yang jarang diucapkan, yaitu bahwa data yang bentuknya kita kenali pasti berasal dari kita.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan sesi sebagai data terserialisasi di cookie',
            'Praktis, tidak perlu basis data',
            'Diukur, penyerang menulis sendiri datanya dan menjadi admin. Tanda tangani, atau simpan di server',
          ],
          [
            'Memakai `unserialize` pada data dari pengguna',
            'Formatnya kan dari kita',
            'Diukur, penyerang memilih kelas apa pun yang ada di aplikasi dan `__destruct`-nya berjalan',
          ],
          [
            'Menganggap `unserialize` yang gagal berarti aman',
            'Kan errornya muncul',
            'Diukur, `__destruct` TETAP berjalan meski pengurainya gagal di tengah',
          ],
          [
            'Menghapus lockfile saat `npm ci` mengeluh',
            'Biar dibuat ulang yang cocok',
            'Lockfile menyimpan checksum tiap paket. Menghapusnya membuang pemeriksaan integritasnya',
          ],
          [
            'Memuat skrip dari CDN tanpa `integrity`',
            'CDN-nya besar dan terpercaya',
            'Satu CDN yang dibajak menjalankan kode apa pun di halamanmu. `integrity` membuat peramban menolaknya',
          ],
          [
            'Mempercayai pesan dari antrean internal',
            'Pengirimnya sistem kita sendiri',
            'Siapa pun yang bisa menulis ke antrean bisa mengirim pesan. Validasi dan otorisasi tetap berlaku',
          ],
        ],
      ),
      p(
        'Hasil pengukuran di baris ketiga layak diingat karena ia melawan intuisi yang paling wajar. Melihat pesan `Warning: unserialize(): Error at offset` terasa seperti melihat serangan yang gagal, padahal `__destruct` sudah sempat berjalan dengan nilai pilihan penyerang. Pemeriksaan yang gagal di tengah tidak sama dengan pemeriksaan yang menolak sejak awal, dan hanya yang kedua yang benar-benar melindungi.',
      ),
      references(
        {
          label: 'A08:2021 — Software and Data Integrity Failures',
          href: 'https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/',
          source: 'OWASP',
          note: 'Kategori yang menyatukan integritas rantai pasok, pembaruan otomatis, dan deserialisasi.',
        },
        {
          label: 'crypto.createHmac()',
          href: 'https://nodejs.org/api/crypto.html#cryptocreatehmacalgorithm-key-options',
          source: 'Node.js',
          note: 'API yang dipakai contoh verifikasi tanda tangan webhook di sub-bab ini.',
        },
        {
          label: 'Deserialization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Format serialisasi yang berbahaya per bahasa, dan penggantinya yang aman.',
        },
        {
          label: 'Security hardening for GitHub Actions',
          href: 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions',
          source: 'GitHub Docs',
          note: 'Termasuk anjuran resmi menyematkan action ke SHA commit, bukan ke tag.',
        },
        {
          label: 'REVOKE',
          href: 'https://www.postgresql.org/docs/current/sql-revoke.html',
          source: 'PostgreSQL',
          note: 'Mencabut hak `UPDATE`/`DELETE` agar tabel audit benar-benar append-only.',
        },
      ),
    ],
  ),

  written(
    'logging-monitoring-failures',
    'Kegagalan Logging & Monitoring',
    18,
    'Kerentanan yang membuat semua kerentanan lain lebih mahal.',
    [
      p(
        'Peringkat sembilan OWASP, dan yang paling sering dianggap sudah beres. Ia tidak memungkinkan serangan — tapi ia menentukan berapa lama serangan berlangsung sebelum ada yang menyadarinya, dan apakah kamu bisa menjawab "apa saja yang diambil".',
      ),

      terms(
        {
          term: 'log vs audit log',
          meaning:
            '**Log** mencatat apa yang terjadi di sistem untuk keperluan diagnosis. **Audit log** khusus mencatat siapa melakukan apa terhadap objek mana — ia bukti, bukan alat debug.',
        },
        {
          term: 'peristiwa keamanan',
          meaning:
            'Kejadian yang bernilai untuk investigasi: login berhasil/gagal, penolakan otorisasi, perubahan izin, aksi admin, ekspor data. Daftarnya ditentukan **sebelum** insiden, bukan sesudah.',
        },
        {
          term: 'correlation id (`reqId`)',
          meaning:
            'Satu id yang menempel pada semua catatan dari satu permintaan. Tanpa itu, log adalah ribuan baris terpisah yang tidak bisa dirangkai menjadi satu cerita.',
        },
        {
          term: 'log terstruktur',
          meaning:
            'Log berbentuk objek berfield, bukan kalimat bebas. Ia yang membuat pencarian "semua penolakan otorisasi untuk pengguna 42" mungkin dilakukan tanpa menebak-nebak pola teks.',
        },
        {
          term: 'sentralisasi log',
          meaning:
            'Mengirim log keluar dari instance yang menghasilkannya. Penyerang yang menguasai satu server bisa menghapus berkas log lokal — tapi tidak bisa menarik kembali yang sudah terkirim.',
        },
        {
          term: 'stdout sebagai keluaran log',
          meaning:
            'Aplikasi menulis ke keluaran standar dan **lingkungan** yang mengumpulkannya. Ini praktik Twelve-Factor: aplikasi tidak mengurus rotasi berkas dan tujuan penyimpanan.',
        },
        {
          term: 'alert',
          meaning:
            'Pemberitahuan aktif saat pola tertentu muncul. Log tanpa alert hanyalah arsip — ia menjelaskan setelah kejadian, tapi tidak memberi tahu saat kejadian.',
        },
        {
          term: 'alert fatigue',
          meaning:
            'Kelelahan akibat terlalu banyak alert palsu, sampai yang sungguhan ikut diabaikan. Ini cara paling umum sistem pemantauan mahal menjadi tidak berguna.',
        },
        {
          term: 'retensi',
          meaning:
            'Berapa lama log disimpan. Karena pembobolan rata-rata baru ditemukan setelah **berbulan-bulan**, retensi tujuh hari berarti jejaknya sudah lama hilang saat dibutuhkan.',
        },
        {
          term: 'eksfiltrasi',
          meaning:
            'Pemindahan data keluar dari sistem oleh penyerang. Tandanya sering halus: ekspor besar di luar jam biasa, atau akun yang tiba-tiba membaca jauh lebih banyak daripada biasanya.',
        },
        {
          term: 'PII',
          meaning:
            '**Personally Identifiable Information** — data yang bisa mengidentifikasi orang tertentu. Ia punya kewajiban hukum sendiri, jadi umur simpannya justru harus **sependek mungkin**.',
        },
        {
          term: 'menyamarkan (masking)',
          meaning:
            'Menulis `a***@contoh.com` alih-alih email lengkap di log. Cukup untuk menelusuri pola, tanpa menjadikan log itu sendiri kumpulan data pribadi.',
        },
      ),

      h2('Bentuk kegagalannya'),
      table(
        ['Kegagalan', 'Akibat'],
        [
          ['Peristiwa keamanan tidak dicatat', 'Tidak ada jejak untuk diselidiki'],
          ['Log hanya di disk instance', 'Hilang bersama instance yang dibuang'],
          ['Tidak ada alert', 'Serangan berlangsung berbulan-bulan'],
          ['Log memuat rahasia', 'Log itu sendiri jadi target'],
          ['Tanpa correlation id', 'Tidak bisa merangkai satu permintaan'],
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
      p(
        'Perhatikan perintahnya sengaja **polos** — tidak ada pengalihan ke berkas, tidak ada konfigurasi rotasi. Aplikasinya hanya menulis ke stdout, dan lingkungan yang menangkapnya: Docker, systemd, atau agen pengumpul milik penyedia hosting. Ini prinsip 12-Factor dari sub-bab 1.7, tetapi di konteks keamanan ia punya alasan tambahan yang lebih penting.',
      ),
      p(
        'Komentar di dalamnya menyebutkannya: **penyerang yang menguasai satu instance tidak bisa menghapus log yang sudah terkirim keluar**. Log yang hanya ada di disk instance adalah log yang bisa dihapus oleh siapa pun yang berhasil masuk ke sana — dan menghapus jejak adalah salah satu hal pertama yang dilakukan penyerang. Begitu log terkirim ke sistem terpusat, ia berada di luar jangkauan mesin yang dibobol.',
      ),
      p(
        'Idealnya sistem penyimpanan itu bersifat **append-only**: catatan bisa ditambahkan tetapi tidak bisa diubah atau dihapus, bahkan oleh akun yang mengirimnya. Tanpa itu, kredensial pengirim log yang ikut bocor cukup untuk membersihkan jejak dari pusat sekalipun.',
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
      p(
        'Perulangan ini **meniru serangan penebakan password** — tiga puluh percobaan gagal terhadap satu akun, persis pola "kegagalan login beruntun satu akun" di tabel di atas. Yang diuji bukan apakah servermu menolak (itu sudah pasti), melainkan apakah **rantai pemantauannya sampai ke ujung**: peristiwa tercatat, aturan alert cocok, notifikasi terkirim, dan seseorang benar-benar menerimanya.',
      ),
      p(
        'Rantai itu punya banyak titik putus yang **tidak bergejala**. Aturan alert bisa salah tulis nama field. Saluran Slack bisa diarsipkan. Kunci integrasi bisa kedaluwarsa. Ambang bisa disetel terlalu tinggi saat seseorang mencoba mengurangi kebisingan. Semuanya diam sampai hari kamu benar-benar membutuhkannya — dan hari itu bukan waktu yang tepat untuk menemukan bahwa alertnya tidak pernah bekerja.',
      ),
      p(
        'Perlakukan ini seperti menguji cadangan: **cadangan yang tidak pernah dipulihkan bukan cadangan**, dan alert yang tidak pernah dipicu bukan deteksi. Jalankan berkala, dan catat kapan terakhir jalurnya terbukti utuh. Jalankan di lingkungan staging kalau memicu tiga puluh kegagalan login di produksi akan mengunci akun sungguhan.',
      ),
      callout(
        'tip',
        'Pemantauan yang tidak pernah diuji biasanya tidak bekerja',
        'Aturan alert bisa salah tulis, saluran notifikasi bisa berubah, dan kunci integrasi bisa kedaluwarsa — semuanya tanpa gejala apa pun sampai kamu benar-benar membutuhkannya. Uji jalurnya secara berkala, seperti menguji cadangan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Kategori ini berbeda dari yang lain karena ia tidak menutup satu pun lubang. Ia menentukan **berapa lama** lubang yang terbuka tetap tidak diketahui, dan itu biasanya selisih antara insiden kecil dan insiden besar.',
      ),
      p('Kegagalan pertamanya selalu sama, yaitu log yang mencatat terlalu banyak.'),
      code(
        'text',
        `
        Diukur sungguhan. Pola "log saja semuanya biar gampang debug":

          {"metode":"POST","jalur":"/v1/masuk",
           "headers":{"authorization":"Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQyfQ.abc",
                      "cookie":"sesi=s%3Aabc123"},
           "body":{"surel":"ana@contoh.id","sandi":"RahasiaSaya123!",
                   "kartu":"4111111111111111"}}

        Sandi, token, cookie sesi, dan nomor kartu kini ada di berkas
        log yang dibaca lebih banyak orang daripada basis datamu,
        disalin ke layanan pemantauan, dan disimpan berbulan-bulan.
        `,
      ),
      code(
        'text',
        `
        Dengan redaksi berbasis daftar kunci:

          {"metode":"POST","jalur":"/v1/masuk",
           "headers":{"authorization":"[DIREDAKSI]","cookie":"[DIREDAKSI]"},
           "body":{"surel":"ana@contoh.id","sandi":"[DIREDAKSI]",
                   "kartu":"[DIREDAKSI]"}}
        `,
      ),
      p(
        'Redaksi itu perlu, dan tidak cukup. Batasnya juga diukur, dan penting diketahui supaya tidak dipercaya melebihi kemampuannya.',
      ),
      code(
        'text',
        `
        masuk  : {"catatan":"sandinya RahasiaSaya123!",
                  "metadata":{"Authorization":"Bearer abc"},
                  "q":"password=xyz"}

        keluar : {"catatan":"sandinya RahasiaSaya123!",
                  "metadata":{"Authorization":"[DIREDAKSI]"},
                  "q":"password=xyz"}

        "Authorization" berhuruf besar TERTANGKAP karena kuncinya
        dicek dalam huruf kecil. Tapi rahasia yang berada di dalam
        TEKS BEBAS lolos sepenuhnya.

        Redaksi mengurangi paparan. Ia tidak menjaminnya.
        `,
        {
          caption:
            'Karena itu keputusan pertamanya bukan "bagaimana meredaksi" melainkan "apakah ini perlu dicatat sama sekali".',
        },
      ),
      p(
        'Kegagalan kedua berlawanan arah, yaitu log yang mencatat terlalu sedikit untuk bisa dipakai menyelidiki apa pun.',
      ),
      code(
        'text',
        `
        BURUK : {"level":"error","pesan":"Gagal menyimpan"}
        BURUK : {"level":"warn","pesan":"Akses ditolak"}

        BAIK  : {"level":"warn","peristiwa":"otorisasi.ditolak",
                 "aktor":{"id":1,"peran":"user"},
                 "aksi":"faktur.baca",
                 "sasaran":{"jenis":"faktur","id":102},
                 "ip":"203.0.113.7","jejak":"req_ezj2c4in",
                 "waktu":"2026-09-14T08:31:02.114Z"}

        Hanya yang terakhir bisa menjawab pertanyaan yang sebenarnya
        diajukan saat insiden: siapa mencoba apa, terhadap apa,
        kapan, dari mana, dan BERAPA KALI.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Ada satu serangan yang menyasar log itu sendiri, dan ia bekerja persis seperti injection lain, yaitu dengan membuat data dibaca sebagai struktur.',
      ),
      code(
        'text',
        `
        Nama yang dikirim pengguna berisi baris baru.

        Log digabung dengan string:
          {"level":"info","nama":"ana"}
          {"level":"info","peristiwa":"otorisasi.diberikan","aktor":{"id":9,"peran":"admin"}"}

        Pembaca log melihat DUA baris, dan yang kedua mengaku
        memberikan hak admin. Baris itu tidak pernah terjadi.

        Log dengan JSON.stringify:
          {"level":"info","nama":"ana\\"}\\n{\\"level\\":\\"info\\",\\"peristiwa\\":\\"otorisasi.diberikan\\"...}

        Baris barunya ikut di-escape menjadi \\n. Tetap SATU baris.
        `,
        { caption: 'Log terstruktur bukan sekadar lebih rapi. Ia menutup satu kelas serangan.' },
      ),
      p(
        'Sisanya bukan error melainkan keheningan, dan itulah bentuk kegagalan yang khas kategori ini.',
      ),
      code(
        'text',
        `
        Yang seharusnya membangunkan seseorang, dan biasanya tidak:

          - 3.000 percobaan login gagal dari satu IP dalam 10 menit
          - satu akun mengakses 4.000 faktur dalam satu jam
          - lonjakan 403 dari satu pengguna, dari 0 menjadi 900
          - permintaan berisi "../", "UNION SELECT", "169.254.169.254"
          - job latar yang berhenti sama sekali tiga hari lalu
          - ukuran berkas log yang turun drastis

        Yang terakhir sering justru tanda paling serius: log yang
        MENGECIL bisa berarti seseorang menghapus jejaknya.
        `,
      ),
      p(
        'Karena itu log yang berguna harus keluar dari mesin tempat ia dihasilkan, dan sifatnya ditentukan sejak awal.',
      ),
      code(
        'text',
        `
        Tiga sifat yang membuat log bisa dipercaya saat insiden:

        1. TERPUSAT  — dikirim keluar dari mesinnya. Penyerang yang
                       menguasai satu server tidak bisa menghapus
                       jejak yang sudah pergi.

        2. HANYA-TAMBAH — aplikasi boleh menulis, tidak boleh mengubah
                       atau menghapus. Kredensial pengirim log dibatasi
                       ke satu izin itu saja.

        3. BERWAKTU SERAGAM — seluruh mesin memakai UTC dan jam yang
                       tersinkron. Tanpa ini, menyusun urutan kejadian
                       lintas layanan mustahil dilakukan.
        `,
      ),
      code(
        'ts',
        `
        // Penanda korelasi: satu id yang ikut ke SELURUH lapisan.
        // Tanpa ini, satu permintaan yang melewati empat layanan
        // meninggalkan empat baris log yang tidak bisa disambungkan.
        app.use((req, res, next) => {
          const jejak = req.headers['x-request-id'] ?? crypto.randomUUID();
          penyimpananKonteks.run({ jejak }, () => {
            res.setHeader('X-Request-Id', String(jejak));
            next();
          });
        });

        // Diteruskan ke setiap panggilan keluar, sehingga jejaknya
        // tetap satu meski melintasi batas layanan.
        fetch(url, { headers: { 'X-Request-Id': konteks().jejak } });
        `,
      ),
      p(
        'Yang membuat penanda ini bekerja bukan pembuatannya melainkan penerusannya. Membuat id lalu lupa mengirimkannya pada panggilan keluar menghasilkan jejak yang terputus tepat di batas layanan, yaitu tempat penelusuran paling dibutuhkan. Membaca `x-request-id` yang mungkin sudah ada juga penting, sebab bila tiap layanan membuat id baru maka tiap layanan punya cerita sendiri-sendiri.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di kategori ini jarang terasa mendesak, sebab akibatnya baru muncul pada hari yang paling tidak tepat untuk menemukannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mencatat seluruh badan permintaan',
            'Biar lengkap kalau perlu debug',
            'Diukur, sandi, token, cookie, dan nomor kartu ikut masuk ke berkas yang dibaca banyak orang',
          ],
          [
            'Menganggap redaksi berbasis kunci sudah menjamin',
            'Semua kunci rahasia sudah terdaftar',
            'Diukur, rahasia di dalam teks bebas lolos. Redaksi mengurangi paparan, bukan menjaminnya',
          ],
          [
            'Menulis log sebagai teks yang digabung',
            'Lebih enak dibaca',
            'Diukur, masukan berisi baris baru menyisipkan baris log palsu yang mengaku memberi hak admin',
          ],
          [
            'Mencatat `"Akses ditolak"` tanpa konteks',
            'Kejadiannya sudah tercatat',
            'Tidak bisa menjawab siapa, terhadap apa, dan berapa kali. Baris seperti itu tidak bisa dipakai menyelidiki',
          ],
          [
            'Menyimpan log hanya di mesin aplikasi',
            'Di sana kan sumbernya',
            'Penyerang yang menguasai mesin itu juga menguasai jejaknya. Kirim keluar, dan jadikan hanya-tambah',
          ],
          [
            'Mengumpulkan log tanpa satu pun alarm',
            'Datanya sudah ada kalau dibutuhkan',
            'Log yang tidak dibaca siapa pun bukan deteksi. Tentukan ambang, dan pastikan ada yang dibangunkan',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah inti seluruh kategori ini. Mengumpulkan log itu mudah dan terasa produktif, sementara yang benar-benar menentukan adalah satu pertanyaan yang jarang ditanyakan pada saat fiturnya dibangun, yaitu apa yang harus terjadi ketika angkanya tidak wajar. Bila jawabannya adalah "seseorang mungkin akan melihatnya nanti", maka yang kamu miliki adalah arsip, bukan deteksi.',
      ),
      references(
        {
          label: 'A09:2021 — Security Logging and Monitoring Failures',
          href: 'https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/',
          source: 'OWASP',
          note: 'Peristiwa yang wajib dicatat dan pola yang layak diberi alert.',
        },
        {
          label: 'Logging Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Isi minimum satu catatan log, dan daftar yang tidak boleh masuk ke dalamnya.',
        },
        {
          label: 'Logging Vocabulary Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Vocabulary_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Penamaan peristiwa keamanan yang konsisten sehingga bisa dicari lintas layanan.',
        },
        {
          label: 'XI. Logs — Treat logs as event streams',
          href: 'https://12factor.net/logs',
          source: 'The Twelve-Factor App',
          note: 'Alasan aplikasi menulis ke stdout dan lingkungan yang mengumpulkan.',
        },
      ),
    ],
  ),

  written('ssrf', 'SSRF', 19, 'Membuat servermu mengirim permintaan atas nama penyerang.', [
    p(
      'Server-Side Request Forgery terjadi ketika penyerang mengendalikan URL yang **diambil servermu**. Karena permintaan itu berasal dari dalam jaringanmu, ia bisa menjangkau hal yang tidak bisa dijangkau penyerang dari luar.',
    ),

    terms(
      {
        term: 'SSRF',
        meaning:
          '**Server-Side Request Forgery** — penyerang mengendalikan URL yang **diambil servermu**. Permintaannya berasal dari dalam jaringanmu, jadi ia menjangkau hal yang tidak bisa dijangkau penyerang dari luar.',
      },
      {
        term: 'endpoint metadata cloud',
        meaning:
          'Alamat khusus `169.254.169.254` yang hanya bisa dihubungi dari dalam instance cloud, dan mengembalikan **kredensial IAM**. Target nomor satu setiap serangan SSRF.',
      },
      {
        term: 'IMDSv2',
        meaning:
          'Versi kedua layanan metadata AWS yang **mewajibkan token** lewat permintaan `PUT` lebih dulu. Ia membuat SSRF sederhana yang hanya bisa melakukan `GET` tidak lagi cukup.',
      },
      {
        term: 'rentang IP privat',
        meaning:
          'Alamat yang hanya berlaku di jaringan internal: `10.x`, `172.16–31.x`, `192.168.x`, `127.x`, dan `169.254.x`. Semuanya harus ditolak sebagai tujuan pengambilan URL.',
      },
      {
        term: 'skema URL',
        meaning:
          'Bagian sebelum `://`. Selain `http:` dan `https:`, ada `file:`, `gopher:`, dan `ftp:` yang bisa dipakai membaca berkas lokal — karena itu skema wajib di-allow-list.',
      },
      {
        term: 'redirect',
        meaning:
          'Jawaban `3xx` yang menyuruh klien pindah ke URL lain. Ini jalur pintas favorit untuk melewati validasi: URL awalnya publik dan lolos, lalu diarahkan ke alamat internal.',
      },
      {
        term: "`redirect: 'manual'`",
        meaning:
          'Opsi `fetch` yang **tidak mengikuti** redirect otomatis, sehingga setiap tujuan baru bisa divalidasi ulang sebelum diikuti.',
      },
      {
        term: 'DNS rebinding',
        meaning:
          'Nama domain yang saat diperiksa menunjuk IP publik, lalu berubah menunjuk `127.0.0.1` tepat sebelum permintaan dikirim. Celah waktu antara pemeriksaan dan pengambilan inilah yang dieksploitasi.',
      },
      {
        term: 'egress firewall',
        meaning:
          'Pembatasan lalu lintas **keluar** dari server. Hampir semua orang membatasi yang masuk; membatasi yang keluar membuat SSRF yang lolos tetap tidak menjangkau apa pun.',
      },
      {
        term: 'zero trust',
        meaning:
          'Prinsip bahwa **posisi jaringan bukan otorisasi** — layanan internal tetap wajib berautentikasi. SSRF adalah bukti paling jelas kenapa prinsip ini diperlukan.',
      },
      {
        term: 'layanan pengambil terisolasi',
        meaning:
          'Menjalankan pengambilan URL di proses/jaringan terpisah yang tidak punya akses ke database, rahasia, maupun layanan internal. Satu-satunya cara aman melayani URL yang benar-benar bebas.',
      },
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

    h2('Defense in depth'),
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
      'Hampir semua orang membatasi lalu lintas **masuk**. Membatasi lalu lintas **keluar**, sehingga server aplikasi hanya boleh menghubungi database, cache, dan daftar host tertentu, membuat SSRF yang lolos tetap tidak bisa menjangkau apa pun yang berharga.',
    ),

    h2('Kalau URL sepenuhnya bebas'),
    p(
      'Untuk fitur yang memang harus mengambil URL apa pun (pratinjau tautan, crawler), jalankan pengambilannya di **layanan terpisah** yang berada di jaringan terisolasi tanpa akses ke database, rahasia, maupun layanan internal. Dengan begitu, SSRF di sana tidak mendapat apa-apa.',
    ),

    h2('Studi kasus di project nyata'),
    p(
      'SSRF muncul di fitur yang terdengar tidak berbahaya sama sekali, misalnya "impor dari URL", pratinjau tautan, pengambil gambar profil, pembuat PDF, atau webhook yang alamatnya ditentukan pengguna. Semuanya punya bentuk yang sama, yaitu servermu mengambil alamat pilihan orang lain.',
    ),
    p(
      'Pertahanan pertama yang hampir selalu ditulis adalah daftar tolak berbasis teks, dan itu bisa diuji.',
    ),
    code(
      'ts',
      `
        // Cara yang paling sering ditulis, dan paling sering gagal.
        function bolehVersiNaif(url: string) {
          const s = String(url).toLowerCase();
          const dilarang = ['localhost', '127.0.0.1', '169.254.169.254', 'internal'];
          return !dilarang.some((d) => s.includes(d));
        }
        `,
    ),
    code(
      'text',
      `
        Diuji sungguhan terhadap layanan internal di 127.0.0.1:3980
        yang menjawab {"rahasia":"DB_PASSWORD=rahasia-produksi"}:

          http://127.0.0.1:3980/rahasia           filter=tolak  diblokir
          http://localhost:3980/rahasia           filter=tolak  diblokir
          http://2130706433:3980/rahasia          filter=LOLOS  BERHASIL MENGAMBIL
          http://0x7f000001:3980/rahasia          filter=LOLOS  BERHASIL MENGAMBIL
          http://[::ffff:127.0.0.1]:3980/rahasia  filter=tolak  diblokir
          http://0:3980/rahasia                   filter=LOLOS  BERHASIL MENGAMBIL

        Tiga bentuk penulisan alamat yang SAMA lolos filter dan
        membocorkan kredensial basis data produksi.
        `,
      {
        caption:
          '2130706433 adalah 127.0.0.1 dalam desimal, 0x7f000001 dalam heksadesimal, dan 0 berarti alamat lokal juga.',
      },
    ),
    p(
      'Jalan keluarnya bukan menambahkan tiga pola lagi ke daftar tolak, sebab bentuk penulisan alamat masih banyak lagi. Yang benar adalah **menerjemahkan nama menjadi alamat dulu, lalu memeriksa alamatnya**.',
    ),
    code(
      'text',
      `
        Diuji sungguhan, keenam varian yang sama:

          127.0.0.1        -> 127.0.0.1       DITOLAK (rentang pribadi)
          localhost        -> 127.0.0.1       DITOLAK (rentang pribadi)
          127.0.0.1        -> 127.0.0.1       DITOLAK (rentang pribadi)
          127.0.0.1        -> 127.0.0.1       DITOLAK (rentang pribadi)
          ::ffff:7f00:1    -> ::ffff:7f00:1   DITOLAK (rentang pribadi)
          0.0.0.0          -> 0.0.0.0         DITOLAK (rentang pribadi)

        Perhatikan kolom kiri: new URL() sudah menormalkan 2130706433
        dan 0x7f000001 menjadi 127.0.0.1 sebelum diresolve. Memeriksa
        hostname dari URL yang sudah diurai jauh lebih baik daripada
        memeriksa teks URL-nya apa adanya.
        `,
    ),
    code(
      'ts',
      `
        // Rentang yang wajib ditolak, bukan hanya localhost.
        function alamatPribadi(ip: string) {
          if (ip.startsWith('::ffff:')) ip = ip.slice(7);
          const b = ip.split('.').map(Number);
          if (b.length !== 4 || b.some(Number.isNaN)) return true;   // IPv6 dan bentuk aneh: tolak
          return (
            b[0] === 127 ||                               // loopback
            b[0] === 10 ||                                // pribadi
            b[0] === 0 ||                                 // "alamat ini"
            (b[0] === 172 && b[1] >= 16 && b[1] <= 31) || // pribadi
            (b[0] === 192 && b[1] === 168) ||             // pribadi
            (b[0] === 169 && b[1] === 254)                // link-local + metadata cloud
          );
        }
        `,
      {
        caption:
          'Baris terakhir menutup 169.254.169.254, endpoint metadata cloud yang memuat kredensial instance.',
      },
    ),

    h2('Saat error-nya muncul'),
    p(
      'SSRF yang berhasil terlihat seperti fitur yang bekerja, sehingga tandanya justru harus dicari di tempat lain.',
    ),
    code(
      'text',
      `
        Yang muncul di log ketika seseorang memetakan jaringan dalammu:

          200 POST /v1/impor  url=http://10.0.0.5:6379/   180ms
          200 POST /v1/impor  url=http://10.0.0.5:5432/    12ms
          504 POST /v1/impor  url=http://10.0.0.9:8080/  3010ms
          200 POST /v1/impor  url=http://169.254.169.254/latest/meta-data/

        Bukan kode statusnya yang membocorkan, melainkan WAKTUNYA.
        Port yang tertutup menolak seketika. Port yang terbuka tapi
        tidak menjawab menghabiskan waktu tunggu. Selisih itu sudah
        cukup untuk memetakan port mana yang hidup.
        `,
      {
        caption:
          'Karena itu pesan gagal ke klien harus seragam, dan waktunya sebaiknya tidak mencerminkan hasil aslinya.',
      },
    ),
    p(
      'Ada satu celah yang tetap terbuka meski pemeriksaan alamatnya sudah benar, dan namanya pengalihan.',
    ),
    code(
      'ts',
      `
        // URL yang diperiksa: https://contoh-sah.com/gambar.png   -> alamat publik, LOLOS
        // Yang dijawab server itu: 302 Location: http://169.254.169.254/latest/meta-data/
        // fetch mengikutinya SECARA BAWAAN, dan pemeriksaanmu sudah lewat.

        const r = await fetch(url, {
          redirect: 'manual',                    // JANGAN ikuti sendiri
          signal: AbortSignal.timeout(5000),     // selalu ada batas waktu
        });

        if (r.status >= 300 && r.status < 400) {
          const tujuan = r.headers.get('location');
          // Periksa ULANG tujuannya dengan aturan yang sama, lalu
          // batasi berapa kali pengalihan boleh diikuti.
          return ambilDenganPemeriksaan(tujuan, sisaLompatan - 1);
        }
        `,
    ),
    code(
      'text',
      `
        DUA CELAH LAIN yang sering tertinggal:

        1. DNS rebinding — nama yang sama menjawab BERBEDA
           pemeriksaan  : contoh.com -> 93.184.216.34   (publik, lolos)
           pengambilan  : contoh.com -> 127.0.0.1       (TTL 0, jawaban berubah)

           Namanya celah waktu-periksa ke waktu-pakai. Menutupnya:
           resolve SEKALI, lalu sambungkan ke ALAMAT itu, bukan ke namanya.

        2. Skema selain http dan https

           file:///etc/passwd
           gopher://10.0.0.5:6379/_SET%20kunci%20nilai
           dict://10.0.0.5:11211/

           Batasi skemanya ke http dan https saja, dengan daftar izin.
        `,
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Kesalahan di kategori ini hampir seluruhnya berupa memeriksa hal yang salah, yaitu memeriksa teks alamatnya alih-alih tujuan yang benar-benar dihubungi.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Memblokir teks `localhost` dan `127.0.0.1`',
          'Itu kan alamat lokalnya',
          'Diukur, `2130706433`, `0x7f000001`, dan `0` lolos filter dan membocorkan kredensial produksi',
        ],
        [
          'Memeriksa teks URL-nya, bukan hostname hasil urai',
          'Sama saja isinya',
          'Diukur, `new URL()` menormalkan bentuk desimal dan heksadesimal. Periksa `new URL(u).hostname`, lalu resolve',
        ],
        [
          'Hanya menolak loopback',
          'Yang berbahaya kan server sendiri',
          'Rentang `10.x`, `172.16-31.x`, `192.168.x`, dan `169.254.x` menjangkau seluruh jaringan dalam dan metadata cloud',
        ],
        [
          'Membiarkan `fetch` mengikuti pengalihan',
          'URL awalnya sudah diperiksa',
          "Server jauh menjawab `302` ke alamat internal. Pakai `redirect: 'manual'` dan periksa ulang tujuannya",
        ],
        [
          'Tidak memasang batas waktu pada panggilan keluar',
          'Biasanya cepat kok',
          'Selisih waktu antara port terbuka dan tertutup memetakan jaringanmu, dan koneksi menggantung menghabiskan kapasitas',
        ],
        [
          'Membiarkan skema apa pun diterima',
          'Penggunanya kan memasukkan alamat web',
          '`file://`, `gopher://`, dan `dict://` membaca berkas lokal dan berbicara ke Redis atau Memcached',
        ],
      ],
    ),
    p(
      'Pertahanan yang paling kuat untuk kategori ini justru bukan di kode aplikasi. Bila panggilan keluar dari server itu dijalankan melalui proxy khusus yang hanya boleh menghubungi alamat publik, seluruh daftar di atas menjadi lapisan kedua, bukan satu-satunya penghalang. Aturan jaringan tidak bisa dilewati dengan menulis alamat dalam bentuk desimal, dan ia tetap berlaku bahkan ketika ada satu jalur di kodemu yang lupa diperiksa.',
    ),
    references(
      {
        label: 'A10:2021 — Server-Side Request Forgery (SSRF)',
        href: 'https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/',
        source: 'OWASP',
        note: 'Kategori SSRF beserta skenario serangan dan lapis pertahanannya.',
      },
      {
        label: 'Server Side Request Forgery Prevention Cheat Sheet',
        href: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html',
        source: 'OWASP',
        note: 'Termasuk penanganan redirect, DNS rebinding, dan daftar rentang IP yang harus ditolak.',
      },
      {
        label: 'dns.lookup()',
        href: 'https://nodejs.org/api/dns.html#dnslookuphostname-options-callback',
        source: 'Node.js',
        note: 'Meresolusi hostname menjadi alamat sebelum memutuskan boleh dihubungi atau tidak.',
      },
      {
        label: 'RFC 1918 — Address Allocation for Private Internets',
        href: 'https://www.rfc-editor.org/rfc/rfc1918.html',
        source: 'RFC Editor',
        note: 'Sumber resmi rentang `10/8`, `172.16/12`, dan `192.168/16` yang dipakai contoh di sini.',
      },
    ),
  ]),

  written(
    'rahasia-konfigurasi',
    'Rahasia & Konfigurasi',
    18,
    'Tempat kebocoran paling umum, dan paling mudah dihindari.',
    [
      terms(
        {
          term: 'rahasia (secret)',
          meaning:
            'Nilai yang memberi **kewenangan** kepada pemegangnya: password database, kunci API, secret penandatangan token. Berbeda dari konfigurasi biasa, yang hanya menentukan perilaku.',
        },
        {
          term: '`.env`',
          meaning:
            'Berkas berisi variabel environment untuk pengembangan lokal. Ia **wajib** di-gitignore; yang boleh masuk repo hanya `.env.example` dengan nilai kosong.',
        },
        {
          term: '`.env.example`',
          meaning:
            'Cetakan berisi **nama** variabel yang dibutuhkan, dengan nilai kosong. Fungsinya memberi tahu orang berikutnya apa yang harus diisi — bukan memberi contoh nilai asli.',
        },
        {
          term: 'rotasi',
          meaning:
            'Mengganti rahasia dengan yang baru dan menonaktifkan yang lama. Wajib dilakukan terjadwal, dan **segera** setelah dicurigai bocor — menghapus commit tidak menggantikannya.',
        },
        {
          term: 'prefiks publik',
          meaning:
            'Awalan seperti `NEXT_PUBLIC_` atau `VITE_` yang menandai variabel **ikut ke bundle browser**. Apa pun di belakangnya terbaca siapa saja yang membuka DevTools.',
        },
        {
          term: 'validasi konfigurasi saat boot',
          meaning:
            'Memeriksa seluruh variabel sekali di awal, lalu **berhenti dengan pesan jelas** bila ada yang kurang. Jauh lebih murah daripada aplikasi yang menyala lalu menandatangani token dengan `undefined`.',
        },
        {
          term: 'fail fast',
          meaning:
            'Fail loudly dan segera, bukan diam-diam dan belakangan. Untuk konfigurasi, artinya menolak menyala — bukan melempar error pada permintaan pertama pengguna.',
        },
        {
          term: 'default aman',
          meaning:
            'Ketiadaan nilai jatuh ke pilihan **paling ketat**, bukan paling permisif. `CORS_ORIGINS` yang kosong berarti tidak ada origin yang diizinkan, bukan semuanya.',
        },
        {
          term: '`Object.freeze`',
          meaning:
            'Membekukan objek konfigurasi supaya tidak bisa diubah saat aplikasi berjalan. Konfigurasi yang bisa berubah di tengah jalan sulit dipertanggungjawabkan.',
        },
        {
          term: 'secrets manager / vault',
          meaning:
            'Layanan penyimpan rahasia dengan kontrol akses, audit trail, dan rotasi terkelola. Aplikasi mengambil nilainya **saat runtime**, sehingga rahasia tidak pernah tersimpan di artefak build.',
        },
        {
          term: 'secret scanner',
          meaning:
            'Perkakas seperti gitleaks atau secretlint yang mencari pola rahasia di kode. Dipasang sebagai pre-commit hook dan gerbang CI, ia menangkap kebocoran **sebelum** ter-push.',
        },
        {
          term: '`server-only`',
          meaning:
            'Paket penanda yang membuat build **gagal** bila modul berisi rahasia sampai terimpor Client Component. Pertahanan waktu-kompilasi, bukan sekadar kesepakatan tim.',
        },
      ),

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
      p(
        'Prefiks `NEXT_PUBLIC_` dan `VITE_` bukan sekadar konvensi penamaan — keduanya **instruksi kepada bundler**. Saat build, nilainya disalin langsung ke dalam JavaScript yang diunduh browser, jadi ia bukan lagi variabel yang dibaca saat berjalan melainkan teks yang tertanam di berkas. Siapa pun bisa menemukannya dengan membuka DevTools dan mencari di berkas bundle.',
      ),
      p(
        'Perhatikan dua contoh publik di atas memang **layak** publik: alamat situs dan alamat API akan terlihat di setiap permintaan jaringan, jadi tidak ada yang disembunyikan. Itulah pemakaian prefiks yang benar — untuk konfigurasi yang kebetulan dibutuhkan browser, bukan untuk rahasia yang ingin kamu jangkau dari sana.',
      ),
      p(
        'Cara kesalahan ini biasanya terjadi patut dikenali karena alurnya sangat wajar: seseorang memakai `process.env.API_KEY` di Client Component, mendapat `undefined`, mencari di internet, menemukan jawaban "tambahkan prefiks `NEXT_PUBLIC_`", dan errornya hilang. Yang sebenarnya terjadi adalah kunci API-nya baru saja diterbitkan ke setiap pengunjung. Kalau sebuah rahasia dibutuhkan dari browser, jawabannya bukan memindahkannya ke bundle — melainkan membuat endpoint di servermu yang memakainya atas nama klien.',
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
        # Secret scanner
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
      p(
        'Kedua blok memasang pemindai yang sama pada **dua titik berbeda**, dan keduanya perlu karena masing-masing menangkap hal yang lolos dari yang lain. Pre-commit hook menahan rahasianya **sebelum** masuk ke riwayat git sama sekali — inilah pertahanan yang benar-benar mencegah, karena sesuai peringatan di atas, rahasia yang sudah ter-commit harus dianggap bocor dan wajib dirotasi.',
      ),
      p(
        'Tetapi hook lokal bisa dilewati: `git commit --no-verify` melewatinya, dan mesin yang belum menjalankan `npm install` tidak punya hook-nya sama sekali. Karena itu pemindaian di CI ada sebagai jaring kedua — ia berjalan di server dan tidak bisa dilewati siapa pun. Perhatikan komentar "gagalkan CI kalau ada yang terdeteksi": pemindai yang hanya memberi peringatan akan diabaikan pada temuan kelima.',
      ),
      p(
        'Perhatikan pula opsi `--secretlintignore .gitignore` pada hook. Tanpa itu, pemindainya akan memeriksa berkas `.env` lokalmu yang **memang** berisi rahasia sungguhan dan gagal setiap kali — lalu orang mematikan hook-nya. Menghormati `.gitignore` membuat pemindai fokus pada apa yang benar-benar akan ter-commit.',
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
      p(
        'Kedua baris salah dengan cara yang berbeda tetapi berakhir sama. `ENV` menanam nilainya sebagai **metadata image** — siapa pun bisa membacanya dengan `docker inspect`, tanpa perlu menjalankan container-nya. `COPY .env .env` menyalin berkasnya ke dalam sistem berkas image, tempat ia bisa diekstrak dengan membongkar layer-nya.',
      ),
      p(
        'Komentar terakhir menandai bagian yang paling sering disalahpahami: menambahkan `RUN rm .env` di baris berikutnya **tidak menghapusnya**. Image Docker tersusun dari layer bertumpuk, dan setiap layer menyimpan perubahannya sendiri secara permanen. Layer yang menghapus berkas hanya menandainya tidak terlihat di lapisan atas; isinya tetap utuh di layer sebelumnya dan bisa dibaca dengan menarik layer itu sendiri.',
      ),
      p(
        'Konsekuensinya sama persis dengan rahasia yang pernah masuk git: begitu image-nya pernah di-push ke registry, rahasianya harus **dirotasi**, bukan sekadar dibangun ulang tanpanya. Yang benar adalah menyuntikkan rahasia **saat menjalankan** container — lewat variabel environment dari platform, atau lewat secrets manager yang dibaca aplikasi saat boot.',
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
      p(
        "Satu baris `import 'server-only'` mengubah kesepakatan tim menjadi **pertahanan waktu-kompilasi**. Paketnya sendiri tidak melakukan apa-apa saat berjalan; ia dirancang agar **gagal di-resolve** dalam konteks bundle klien, sehingga build berhenti dengan pesan jelas begitu ada Client Component yang mengimpor berkas ini — entah langsung, atau lewat rantai impor sepanjang lima berkas.",
      ),
      p(
        'Tanpa itu, kebocorannya **tidak bergejala sama sekali**. Bundler dengan patuh menyertakan modul yang diminta, dan `env.DATABASE_URL` ikut ke berkas JavaScript yang diunduh browser. Aplikasinya tetap berjalan normal, tidak ada error, tidak ada peringatan — kredensial databasemu hanya diam-diam terbit ke setiap pengunjung.',
      ),
      p(
        'Pasang di setiap modul yang menyentuh rahasia atau koneksi: `lib/db.ts`, `lib/redis.ts`, `config/env.ts`, dan berkas yang memuat kunci penandatangan. Project ini memakai pendekatan yang sama untuk masalah berbeda — `client-bundle-boundary.test.ts` menjaga agar kurikulum tidak terimpor Client Component, karena kebocoran itu juga tidak terlihat di UI dan hanya membengkakkan bundle pembaca.',
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
        'Secret scanner berjalan di pre-commit dan di CI.',
        'Aplikasi gagal boot kalau ada rahasia yang hilang atau terlalu lemah.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Rahasia yang bocor jarang bocor lewat serangan. Jauh lebih sering ia bocor lewat tempat penyimpanan yang salah pilih, dan yang paling sering adalah riwayat versi.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan git. Berkas konfigurasi berisi kredensial
        di-commit, lalu disadari salah dan dikeluarkan dari repo.

          git status sesudah dihapus
            (bersih)

          git log
            2a67de6 keluarkan konfigurasi dari repo
            f102fd8 setup awal

        Terlihat beres. Dan yang tetap terbaca siapa pun pemegang klon:

          +  "db": "postgres://app:CONTOH-BUKAN-ASLI-123@db.internal:5432/app",
          +  "kunciBayar": "sk_live_CONTOH_BUKAN_ASLI"
        `,
        { caption: 'Nilai di atas sengaja dibuat palsu. Yang nyata adalah mekanismenya.' },
      ),
      p('Dan penyerang tidak perlu tahu nama berkasnya, sebab riwayatnya bisa disisir seluruhnya.'),
      code(
        'text',
        `
        git rev-list --all | while read c; do git grep -h 'sk_live' "$c"; done

          "kunciBayar": "sk_live_CONTOH_BUKAN_ASLI"

        Objek blob yang masih menyimpannya juga masih ada:
          blob 3bcef1d7ae2c788671135e94f392c0187cc5f88e 117
        `,
      ),
      p(
        'Kesimpulannya satu, dan ia mengikat. **Rahasia yang pernah masuk ke riwayat versi dihitung bocor**, bahkan setelah commit-nya dihapus. Menulis ulang riwayat hanya menyulitkan pembacaan, sementara setiap orang yang pernah mengklon repo itu masih memegangnya. Yang benar adalah merotasi rahasianya.',
      ),
      code(
        'text',
        `
        Urutan yang benar saat menyadari sebuah rahasia ter-commit:

          1. ROTASI dulu — terbitkan nilai baru, matikan yang lama.
             Ini satu-satunya langkah yang benar-benar menutup.
          2. Pasang nilai barunya di tempat yang tepat (vault atau
             environment yang disuntik saat deploy).
          3. Baru bereskan repo: tambahkan ke .gitignore, pertimbangkan
             menulis ulang riwayat bila memang perlu.
          4. Periksa apakah rahasia itu sempat terpakai oleh orang lain
             (log akses penyedia layanan biasanya menyimpannya).

        Melakukan 3 tanpa 1 memberi rasa aman tanpa keamanan apa pun.
        `,
      ),
      p(
        'Tempat kedua yang paling sering membocorkan rahasia adalah bundel klien, dan di Next.js batasnya ditandai satu awalan.',
      ),
      code(
        'ts',
        `
        // Awalan NEXT_PUBLIC_ BUKAN penanda "boleh dipakai di komponen".
        // Ia penanda "nilai ini AKAN ikut terkirim ke peramban", dan
        // nilainya ditanam ke dalam bundel saat build.

        const salah = process.env.NEXT_PUBLIC_STRIPE_SECRET;   // BOCOR ke semua pengunjung
        const benar = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;  // memang publik

        // Rahasia dibaca HANYA di kode yang berjalan di server:
        //   Server Component, Route Handler, Server Action, atau middleware.
        // Bila sebuah nilai dibutuhkan di komponen klien, yang perlu
        // dipindahkan adalah PEKERJAANNYA ke server, bukan nilainya ke klien.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan konfigurasi punya satu sifat yang menentukan seberapa mahal ia, yaitu **kapan** ia ketahuan.',
      ),
      code(
        'text',
        `
        KONFIGURASI DIBACA TERSEBAR — ketahuan saat permintaan pertama:

          TypeError: Cannot read properties of undefined (reading 'length')
          Error: connect ECONNREFUSED 127.0.0.1:5432
          error: password authentication failed for user "undefined"

        Ketiganya muncul dari dalam kode yang jauh dari penyebabnya,
        dan tidak satu pun menyebutkan variabel mana yang hilang.

        KONFIGURASI DIVALIDASI SAAT BOOT — ketahuan sebelum melayani
        satu permintaan pun:

          Konfigurasi tidak valid, proses dihentikan:
            DATABASE_URL : wajib diisi
            SESSION_SECRET : minimal 32 karakter, diterima 8
            PORT : harus berupa angka, diterima "tiga ribu"
        `,
      ),
      code(
        'ts',
        `
        // Dibaca SEKALI saat boot, divalidasi, lalu dibekukan.
        const SkemaEnv = z.object({
          DATABASE_URL: z.string().url(),
          SESSION_SECRET: z.string().min(32),
          PORT: z.coerce.number().int().positive().default(3000),
          NODE_ENV: z.enum(['development', 'test', 'production']),
        });

        const hasil = SkemaEnv.safeParse(process.env);
        if (!hasil.success) {
          console.error('Konfigurasi tidak valid, proses dihentikan:');
          for (const [kunci, isu] of Object.entries(hasil.error.flatten().fieldErrors)) {
            console.error(\`  \${kunci} : \${isu?.join(', ')}\`);
          }
          process.exit(1);          // gagal NYARING, bukan diam
        }

        export const env = Object.freeze(hasil.data);
        // Sisa aplikasi mengimpor \`env\`, dan TIDAK PERNAH menyentuh
        // process.env lagi. Itu yang membuat daftar di atas lengkap.
        `,
        {
          caption:
            'Membekukannya juga mencegah satu bagian aplikasi diam-diam mengubah konfigurasi bagian lain.',
        },
      ),
      p(
        'Kesalahan terakhir yang khas adalah nilai bawaan yang dipilih ke arah yang salah, dan gejalanya tidak pernah berupa error.',
      ),
      code(
        'text',
        `
        Bawaan yang PERMISIF — tidak ada error, dan itu masalahnya:

          const wajibHttps = process.env.WAJIB_HTTPS === 'false' ? false : true;
          // variabelnya salah ketik di produksi -> tetap true. AMAN.

          const wajibHttps = process.env.WAJIB_HTTPS === 'true';
          // variabelnya salah ketik di produksi -> menjadi false. TERBUKA.

        Aturannya: nilai yang hilang harus jatuh ke pilihan yang
        PALING KETAT, bukan yang paling longgar. Konfigurasi yang
        hilang tidak boleh pernah berarti "matikan pengamanannya".
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di kategori ini biasanya berupa langkah yang masuk akal secara teknis tetapi menjawab pertanyaan yang berbeda dari yang seharusnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menghapus commit berisi rahasia lalu menganggap selesai',
            '`git status` sudah bersih',
            'Diuji, nilainya tetap terbaca dari riwayat dan dari objek blob. Rahasianya harus DIROTASI',
          ],
          [
            'Menulis ulang riwayat sebagai langkah pertama',
            'Menghapus jejaknya sampai akar',
            'Setiap orang yang pernah mengklon masih memegangnya. Rotasi dulu, baru bereskan repo',
          ],
          [
            'Menaruh rahasia di variabel ber-awalan `NEXT_PUBLIC_`',
            'Supaya bisa dipakai di komponen',
            'Awalan itu menandai nilai yang ditanam ke bundel klien. Pindahkan pekerjaannya ke server, bukan nilainya ke klien',
          ],
          [
            'Membaca `process.env` tersebar di banyak berkas',
            'Praktis, langsung di tempat pakainya',
            'Variabel yang hilang baru ketahuan saat permintaan pertama, sebagai error yang tidak menyebut namanya',
          ],
          [
            'Menulis nilai bawaan ke arah yang permisif',
            'Biar tidak merepotkan saat pengembangan',
            'Satu salah ketik di produksi mematikan pengamanan tanpa satu pun error. Bawaan harus jatuh ke yang paling ketat',
          ],
          [
            'Mencatat konfigurasi saat boot untuk memastikan benar',
            'Biar kelihatan terbaca semua',
            'Baris itu menuliskan kredensial ke log. Catat NAMA variabel yang terbaca, jangan nilainya',
          ],
        ],
      ),
      p(
        'Baris terakhir sering muncul justru karena kebiasaan yang baik, yaitu ingin memastikan konfigurasi benar-benar terbaca. Yang perlu diubah hanya apa yang dicetak. Menuliskan daftar nama variabel yang berhasil dibaca beserta jumlahnya sudah menjawab pertanyaan itu sepenuhnya, dan tidak meninggalkan satu pun kredensial di berkas yang akan disalin ke layanan pemantauan dan disimpan berbulan-bulan.',
      ),
      references(
        {
          label: 'Secrets Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Penyimpanan, distribusi, dan rotasi rahasia beserta kesalahan yang paling sering terjadi.',
        },
        {
          label: 'III. Config — Store config in the environment',
          href: 'https://12factor.net/config',
          source: 'The Twelve-Factor App',
          note: 'Alasan konfigurasi dipisahkan dari kode, dan batas antara config dan rahasia.',
        },
        {
          label: 'Environment Variables',
          href: 'https://nextjs.org/docs/app/guides/environment-variables',
          source: 'Next.js',
          note: 'Aturan `NEXT_PUBLIC_` — apa yang ikut ke bundle browser dan apa yang tidak.',
        },
        {
          label: 'Build secrets',
          href: 'https://docs.docker.com/build/building/secrets/',
          source: 'Docker Docs',
          note: 'Cara memakai rahasia saat build tanpa menanamnya permanen ke layer image.',
        },
        {
          label: 'Basic usage — Zod',
          href: 'https://zod.dev/basics',
          source: 'Zod',
          note: 'Menyusun skema untuk memvalidasi `process.env` sekali saat boot.',
        },
      ),
    ],
  ),

  written(
    'praktik-checklist-keamanan',
    'Praktik: Checklist keamanan sebelum rilis',
    18,
    'Audit yang dijalankan, bukan dibaca.',
    [
      p(
        'Latihan penutup Backend Intermediate: jalankan audit keamanan lengkap pada API yang sudah kamu bangun. Ini bukan daftar untuk dibaca — setiap baris punya perintah yang menghasilkan bukti.',
      ),

      terms(
        {
          term: 'audit keamanan',
          meaning:
            'Pemeriksaan terencana terhadap sistem yang **sedang berjalan**, bukan terhadap ingatan tentang kodenya. Setiap temuan harus punya keluaran perintah yang membuktikannya.',
        },
        {
          term: 'bukti (evidence)',
          meaning:
            'Keluaran perintah yang menunjukkan perilaku sebenarnya. Tanpa itu, sebuah temuan hanya dugaan — dan dugaan tidak bisa diperiksa ulang orang lain.',
        },
        {
          term: 'peringkat dampak',
          meaning:
            'Mengurutkan temuan menjadi **berat / sedang / ringan** berdasarkan akibatnya, bukan berdasarkan seberapa mudah diperbaiki. Ini yang menentukan mana yang menunda rilis.',
        },
        {
          term: '`curl -w "%{http_code}"`',
          meaning:
            'Opsi `curl` yang mencetak kode status saja. Cara paling ringkas menguji puluhan endpoint sekaligus tanpa membaca body-nya satu per satu.',
        },
        {
          term: '`jq`',
          meaning:
            "Perkakas baris perintah untuk menyaring JSON. `jq '[.data[].penulisId] | unique'` langsung membuktikan apakah endpoint daftar membocorkan data pengguna lain.",
        },
        {
          term: '`%{time_total}`',
          meaning:
            'Variabel `curl` yang mencetak durasi permintaan. Dipakai untuk membuktikan bahwa waktu respons login **seragam** antara akun yang ada dan tidak ada.',
        },
        {
          term: '`413 Payload Too Large`',
          meaning:
            'Jawaban yang seharusnya muncul saat body melampaui batas. Yang tidak boleh muncul adalah server yang justru **mati** — itu berarti batasnya tidak pernah ada.',
        },
        {
          term: '`500` sebagai sinyal injeksi',
          meaning:
            'Payload injeksi yang menghasilkan `500` berarti ia **sampai ke database**. Jawaban yang benar adalah `200` dengan hasil kosong atau `422` — bukan error internal.',
        },
        {
          term: 'temuan yang diterima sadar',
          meaning:
            'Risiko yang sengaja tidak dimitigasi, ditulis lengkap dengan alasannya. Menuliskannya membuat keputusan itu bisa ditinjau ulang saat keadaan berubah.',
        },
        {
          term: 'gerbang rilis',
          meaning:
            'Aturan bahwa temuan kategori berat **menunda rilis**. Tanpa gerbang, audit berubah menjadi dokumen yang dibaca lalu dilewati.',
        },
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
      p(
        'Ketiga uji ini menyerang kategori peringkat satu OWASP dari tiga arah berbeda, dan ketiganya perlu. Yang pertama menguji **akses per objek** — token Ana terhadap sumber daya milik Budi. Perhatikan daftar jalurnya melampaui baris database: berkas unggahan dan status job ekspor juga objek yang punya pemilik, dan keduanya paling sering terlewat karena tidak terasa seperti "data".',
      ),
      p(
        "Uji kedua menyerang **endpoint daftar**, titik buta yang dibahas di sub-bab 5.1. `jq '[.data[].penulisId] | unique'` mengambil seluruh `penulisId` dari hasil lalu membuang duplikatnya — jadi keluarannya seharusnya array berisi **satu** id saja, milik Ana. Dua id atau lebih berarti scope query-nya bocor. Ini cara memeriksa yang jauh lebih cepat daripada membaca dua puluh objek satu per satu.",
      ),
      p(
        'Uji ketiga menguji **escalation vertikal**: pengguna biasa memanggil endpoint admin. Bedanya dengan dua uji sebelumnya, yang diperiksa di sini bukan kepemilikan melainkan peran — dan kegagalannya biasanya lahir dari rute admin yang lupa dimasukkan ke grup middleware, bukan dari query yang salah.',
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
      p(
        'Body permintaan ini menyelipkan **tiga** field yang tidak seharusnya bisa diisi klien, masing-masing menguji hal berbeda. `penulisId: 999` mencoba membuat artikel atas nama orang lain. `status: "terbit"` mencoba melewati alur penerbitan yang mungkin butuh izin tersendiri. Dan `peran: "admin"` mencoba field yang bahkan tidak ada di sumber daya ini — kalau kode di belakangnya menyebar body mentah ke `update`, field itu bisa mendarat di tempat yang tidak diduga.',
      ),
      p(
        'Perhatikan komentar terakhir menyuruh **memeriksa di database**, bukan membaca respons. Itu penting: respons `201` yang tampak normal tidak membuktikan apa-apa — bisa saja artikelnya memang dibuat, tetapi dengan `penulisId` milik Budi. Bahkan respons yang menampilkan `penulisId` Ana pun belum cukup kalau lapisan Resource kebetulan menimpanya saat serialisasi. Yang menentukan adalah baris yang benar-benar tersimpan.',
      ),
      p(
        'Hasil yang benar juga bukan penolakan. Dengan skema `.strict()`, permintaan ini seharusnya dijawab `422` karena ada field asing; tanpa `.strict()` tetapi dengan `$fillable` yang benar, ia dijawab `201` sambil mengabaikan ketiganya. Keduanya aman — yang menjadi temuan adalah `201` dengan field yang **benar-benar tersimpan**.',
      ),

      h2('3. Injeksi'),
      code(
        'bash',
        `
        for payload in "' OR '1'='1" "'; DROP TABLE artikel; --" "\\" OR 1=1--"; do
          curl -s -o /dev/null -w "%{http_code} " localhost:3000/api/artikel \\
            --get --data-urlencode "cari=$payload" -H "Authorization: Bearer $TOKEN_ANA"
        done
        echo
        # Harus 200 dengan hasil kosong, atau 422 — TIDAK BOLEH 500.
        # 500 berarti payload-nya sampai ke database.

        # NoSQL / type confusion
        curl -s -o /dev/null -w "%{http_code}\\n" -X POST localhost:3000/api/auth/masuk \\
          -H 'Content-Type: application/json' \\
          -d '{"email":"admin@x.com","kataSandi":{"$ne":null}}'
        # Harus 422, bukan 200.
        `,
      ),
      p(
        'Komentar di tengah menyatakan kriteria yang paling berguna dari seluruh checklist ini: **`500` berarti payload-nya sampai ke database**. Jawaban `200` dengan hasil kosong berarti tanda kutipnya diperlakukan sebagai teks pencarian biasa — persis yang diinginkan. Jawaban `422` berarti validasi menolaknya lebih awal, juga baik. Tetapi `500` berarti query-nya rusak karena sintaks SQL berubah, dan itu bukti langsung bahwa input klien ikut menyusun perintah.',
      ),
      p(
        "Ketiga payload sengaja berbeda bentuk. `' OR '1'='1` menutup kutip tunggal, `\"` menutup kutip ganda, dan `'; DROP TABLE artikel; --` menguji apakah beberapa perintah bisa dirangkai sekaligus. Perhatikan `--data-urlencode` dipakai alih-alih menempelkannya langsung ke URL — tanpa itu, karakter seperti `&` dan spasi akan mengubah bentuk query string dan ujiannya jadi tidak menguji apa pun.",
      ),
      p(
        'Uji terakhir menyerang kelas yang berbeda dan sering luput: **type confusion**. Yang dikirim bukan teks berbahaya melainkan **objek** di tempat yang seharusnya string. Kalau jawabannya `200`, artinya login berhasil tanpa mengetahui password — operator `$ne` diteruskan ke query dan mengubah syaratnya menjadi "password apa pun asal ada". Jawaban `422` membuktikan skema validasi memeriksa tipenya, bukan hanya keberadaannya.',
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
      p(
        'Uji pertama memeriksa **dua** hal sekaligus lewat `%{time_total}s` dan `jq` pada pesannya. Pesan yang berbeda antara email terdaftar dan tidak adalah enumerasi akun yang jelas. Tetapi selisih **waktu** sama membocorkannya walau pesannya identik — dan itulah yang biasanya lolos review, karena membaca kode tidak memperlihatkan durasi. Keduanya harus mirip; selisih yang konsisten beberapa ratus milidetik adalah temuan.',
      ),
      p(
        'Uji kedua membuktikan rate limit **benar-benar aktif di server yang berjalan**, bukan hanya terpasang di kode. Bacalah deretan status codenya: seharusnya `401` beberapa kali lalu berubah menjadi `429`. Kalau ketiga puluh percobaan seluruhnya `401`, limiter-nya tidak bekerja — mungkin `trust proxy` salah sehingga semua permintaan dihitung dari IP proxy, atau penyimpanannya di memori sementara ada beberapa proses berjalan.',
      ),
      p(
        'Uji ketiga menutup kelalaian yang paling merugikan korban: **token lama setelah ganti password**. Alasan utama orang mengganti password adalah kecurigaan akun dibajak — dan kalau token penyerang tetap sah setelahnya, tindakan itu tidak mengubah apa pun baginya sementara korban mengira dirinya sudah aman. Jawaban yang benar `401`.',
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
      p(
        'Perulangan pertama menyisir **beberapa endpoint sekaligus** mencari kata yang tidak boleh ada di respons mana pun. Itu penting karena kebocoran kolom biasanya tidak merata: endpoint profil mungkin sudah rapi memilih kolomnya, sementara endpoint daftar masih memakai `SELECT *` dan ikut mengirim `password_hash`. Perhatikan pencariannya memakai `-i` supaya `passwordHash`, `PasswordHash`, dan `password_hash` sama-sama tertangkap.',
      ),
      p(
        'Uji kedua sengaja mengirim id yang **terlalu besar untuk tipe kolomnya** — itu cara memancing error dari lapisan database, bukan dari validasi. Yang dicari di jawabannya adalah jejak khas kebocoran internal: `stack` dan `at /` menandakan stack trace, `node_modules`/`vendor/` membocorkan struktur project, dan `constraint`/`relation` adalah kata dari pesan PostgreSQL mentah yang menyebut nama tabel serta kolom.',
      ),
      p(
        'Perhatikan kedua uji memakai pola `grep ... && echo "BOCOR"` — keduanya **berhasil bila tidak menemukan apa pun**. Keluaran yang kosong berarti bersih. Ini kebalikan dari kebiasaan membaca hasil perintah, dan patut disadari supaya kamu tidak salah menyimpulkan "tidak ada keluaran" sebagai "ujinya tidak jalan".',
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
      p(
        'Uji header pertama mencari enam nama sekaligus, tetapi yang keenam **berbeda maksud** dari lima lainnya. Lima yang pertama harus **ada**; `x-powered-by` harus **tidak ada** — ia mengumumkan framework beserta versinya, dan itu pengintaian gratis bagi penyerang yang mencari kerentanan yang sudah diketahui.',
      ),
      p(
        'Dua perulangan berikutnya menguji apa yang **tidak boleh terjangkau**. Berkas `.env` yang menjawab `200` berarti document root menunjuk akar project, bukan `public/` — kebocoran total yang tidak bergejala sama sekali. Dan endpoint internal seperti `/horizon` atau `/metrics` yang menjawab `200` berarti dashboard-nya terbuka; ingat dari sub-bab 5.9, keduanya memperlihatkan payload job dan peta operasional yang sering lebih kaya daripada endpoint API mana pun.',
      ),
      p(
        'Uji CORS di akhir memakai pola yang perlu dibaca terbalik: ia **berhasil ketika `grep` tidak menemukan apa-apa**. Keluaran "menolak (benar)" berarti tidak ada header `Access-Control-Allow-Origin` untuk origin asing. Kalau yang muncul "MEMANTULKAN ORIGIN", berarti servermu memantulkan origin apa pun kembali — dan kebijakan CORS-mu sama saja tidak ada.',
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
      p(
        "Uji pertama memeriksa hasilnya lewat `jq '.data | length'`, bukan lewat status code — dan itu disengaja. Permintaan `?per_hal=999999` akan tetap menjawab `200`; yang membuktikan batasnya ditegakkan adalah **jumlah item** yang benar-benar dikembalikan. Kalau angkanya 4.213, berarti seluruh tabel ikut terkirim dan batas atasnya tidak pernah dipasang.",
      ),
      p(
        'Uji kedua membangun berkas 20 MB berisi huruf `a` lewat `head -c` dan `tr`, lalu mengirimkannya sebagai body. Komentar terakhir menyatakan dua hasil yang berbeda maknanya: `413` berarti batas ukuran bekerja dan permintaannya ditolak sebelum diuraikan. Yang **tidak boleh** terjadi adalah server mati atau menggantung — itu berarti body raksasa sempat masuk ke memori, dan satu permintaan seperti ini cukup untuk menjatuhkan layanan.',
      ),
      p(
        'Ingat dari sub-bab 2.6 bahwa setiap jalur masuk punya batasnya sendiri. Lulus uji ini pada endpoint JSON **tidak** berarti endpoint unggahan berkas ikut terlindungi — Multer punya `limits` terpisah yang perlu diuji sendiri dengan berkas besar sungguhan.',
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
      p(
        'Tiga perintah ini menutup dua kategori OWASP sekaligus. Dua yang pertama memeriksa **dependency rentan**, dengan opsi yang membuat hasilnya bisa ditindaklanjuti: `--production` membuang temuan di `devDependencies` yang tidak terekspos ke pengguna, dan `--audit-level=high` menetapkan ambang yang memang layak menghentikan rilis.',
      ),
      p(
        'Perintah ketiga memeriksa **rahasia yang bocor**, dan opsi `--no-git` di sana penting. Tanpanya, `gitleaks` hanya menyisir riwayat commit; dengan `--no-git`, ia memeriksa berkas yang benar-benar ada di direktori kerja — termasuk berkas yang belum ter-commit, hasil build, dan berkas konfigurasi yang tersalin ke tempat yang tidak seharusnya. Keduanya berguna, dan menjalankan yang ini melengkapi pemindai riwayat yang sudah berjalan di CI.',
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
      p(
        'Perhatikan setiap butir BERAT disertai baris **Bukti** berisi perintah dan hasilnya. Itu yang membedakan temuan dari opini: "GET menjawab 200 untuk artikel milik pengguna lain" bisa diverifikasi ulang siapa pun dalam sepuluh detik, sedangkan "otorisasinya kurang ketat" akan berakhir sebagai perdebatan. Tulis temuan dalam bentuk yang bisa dibuktikan salah.',
      ),
      p(
        'Label BERAT diberi keterangan **"tunda rilis sampai diperbaiki"**, dan itu bukan hiasan. Pembagian tingkatnya bukan soal seberapa mudah diperbaiki melainkan **seberapa besar akibatnya kalau dibiarkan** — dua butir BERAT di atas sama-sama membocorkan data pengguna lain, sementara `X-Powered-By` yang masih terkirim hanya mempermudah pengintaian. Menaruh keduanya sederet akan mengubur yang penting di antara yang sepele.',
      ),
      p(
        'Bagian **DITERIMA SECARA SADAR** adalah yang paling sering hilang dari laporan audit, dan ketiadaannya justru berbahaya. Risiko itu tidak bisa dimitigasi tanpa membunuh fiturnya — inti berbagi tautan memang siapa pun yang memegangnya bisa membaca. Menuliskannya lengkap dengan alasan dan mitigasi yang menyertainya mengubahnya dari kelalaian menjadi keputusan yang bisa **ditinjau ulang** saat keadaan berubah, misalnya saat fitur itu nanti dipakai untuk dokumen yang jauh lebih sensitif.',
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
        'Secret scanner berjalan dan tidak menemukan apa pun',
        'Peristiwa keamanan tercatat, terpusat, dan punya alert yang sudah diuji',
        'Temuan ditulis dan diurutkan berdasarkan dampak, termasuk yang diterima sadar',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Checklist keamanan yang hanya dibaca tidak menghasilkan apa-apa. Yang berguna adalah checklist yang **dijalankan**, sehingga tiap butirnya menghasilkan jawaban yang bisa dilihat orang lain, bukan pendapat.',
      ),
      code(
        'bash',
        `
        #!/usr/bin/env bash
        BASE="$1"; NAMA="$2"; gagal=0

        periksa() {
          local nama="$1" harap="$2" dapat="$3"
          if [ "$harap" = "$dapat" ]; then
            printf '  AMAN   %-32s %s\\n' "$nama" "$dapat"
          else
            printf '  TEMUAN %-32s harap=%s dapat=%s\\n' "$nama" "$harap" "$dapat"
            gagal=$((gagal + 1))
          fi
        }

        echo "== $NAMA"

        # 1. Otorisasi — pengguna 1 meminta faktur milik pengguna 2
        periksa "IDOR faktur orang lain" 404 \\
          "$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Pengguna: 1' "$BASE/v1/faktur/102")"

        # 2. Enumerasi pengguna — dua email berbeda harus dijawab SAMA
        periksa "pesan login seragam" "sama" \\
          "$( [ "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/v1/masuk?surel=ana@contoh.id")" \\
             = "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/v1/masuk?surel=tiada@contoh.id")" ] \\
             && echo sama || echo beda )"

        # 3. Pembatasan laju — percobaan ketujuh harus ditolak
        periksa "pembatasan laju login" 429 \\
          "$(for i in 1 2 3 4 5 6 7; do
               curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/v1/masuk?surel=uji@contoh.id"; echo;
             done | tail -1)"

        # 4. Kebocoran detail error
        periksa "500 tanpa stack trace" "bersih" \\
          "$(curl -s "$BASE/v1/pecah" | grep -qi 'stack\\|/srv/app' && echo bocor || echo bersih)"

        # 5. Endpoint diagnostik
        periksa "/metrics tertutup" 404 \\
          "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/metrics")"

        # 6-9. Header keamanan
        for h in content-security-policy strict-transport-security \\
                 x-content-type-options referrer-policy; do
          periksa "header $h" "ada" \\
            "$(curl -s -i "$BASE/v1/faktur/101" -H 'X-Pengguna: 1' \\
               | grep -qi "^$h:" && echo ada || echo tiada)"
        done

        # 10. Versi runtime
        periksa "X-Powered-By disembunyikan" "tiada" \\
          "$(curl -s -i "$BASE/v1/faktur/101" -H 'X-Pengguna: 1' \\
             | grep -qi '^x-powered-by:' && echo ada || echo tiada)"

        echo "  -> temuan: $gagal"
        `,
        {
          caption:
            'Sepuluh butir, seluruhnya curl. Tidak perlu alat khusus, dan bisa dijalankan siapa pun di tim.',
        },
      ),
      p(
        'Dijalankan terhadap dua versi aplikasi yang sama, sebelum dan sesudah diperbaiki, hasilnya seperti ini.',
      ),
      code(
        'text',
        `
        == SEBELUM diperbaiki
          TEMUAN IDOR faktur orang lain           harap=404 dapat=200
          TEMUAN pesan login seragam              harap=sama dapat=beda
          TEMUAN pembatasan laju login            harap=429 dapat=404
          TEMUAN 500 tanpa stack trace            harap=bersih dapat=bocor
          TEMUAN /metrics tertutup                harap=404 dapat=200
          TEMUAN header content-security-policy   harap=ada dapat=tiada
          TEMUAN header strict-transport-security harap=ada dapat=tiada
          TEMUAN header x-content-type-options    harap=ada dapat=tiada
          TEMUAN header referrer-policy           harap=ada dapat=tiada
          TEMUAN X-Powered-By disembunyikan       harap=tiada dapat=ada
          -> temuan: 10

        == SESUDAH diperbaiki
          (sepuluh baris AMAN)
          -> temuan: 0
        `,
        {
          caption:
            'Dijalankan sungguhan dengan curl 8.5.0 terhadap dua server node:http yang sengaja dibedakan.',
        },
      ),
      p(
        'Ada satu detail di baris ketiga yang layak diperhatikan. Pada versi rentan, pemeriksaan pembatasan laju menerima `404`, bukan `429`, dan itu **bukan** karena pembatasannya bekerja. Servernya memang tidak punya pembatasan sama sekali, dan `404` yang muncul itu justru kebocoran enumerasi dari butir nomor dua yang menampakkan dirinya lagi di butir lain. Satu kelemahan sering terlihat di beberapa tempat sekaligus, dan itu sebabnya membaca kolom `dapat=` lebih penting daripada sekadar menghitung jumlah temuan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Skrip seperti ini juga bisa gagal karena alasan yang tidak ada hubungannya dengan keamanan, dan mengenali bedanya menghemat banyak waktu.',
      ),
      code(
        'text',
        `
        curl: (7) Failed to connect to 127.0.0.1 port 3991 after 0 ms:
              Couldn't connect to server
          -> servernya belum jalan. Bukan temuan.

        curl: (28) Operation timed out after 30001 milliseconds
          -> server hidup tapi menggantung. Bisa jadi temuan
             ketersediaan, periksa terpisah.

        TEMUAN header content-security-policy  harap=ada dapat=tiada
          -> header memang tidak ada, ATAU kamu memeriksa rute yang
             tidak melewati middleware header. Periksa beberapa rute,
             termasuk satu yang sengaja dibuat gagal.

        TEMUAN IDOR faktur orang lain  harap=404 dapat=401
          -> permintaannya ditolak sebelum sampai ke pemeriksaan
             kepemilikan. Autentikasi ujimu salah, bukan otorisasinya
             yang benar. Pemeriksaan ini belum membuktikan apa pun.
        `,
        {
          caption:
            'Yang terakhir paling berbahaya: hasil yang terlihat aman padahal pemeriksaannya tidak pernah sampai ke sasaran.',
        },
      ),
      p(
        'Karena itu setiap pemeriksaan negatif perlu punya pasangan positifnya, yaitu satu permintaan yang **seharusnya berhasil** dan benar-benar berhasil. Tanpa itu, skripnya bisa hijau hanya karena semua permintaannya ditolak sejak awal.',
      ),
      code(
        'bash',
        `
        # Pasangan positif — membuktikan jalur ujinya memang sampai.
        periksa "pemilik sah BISA membaca fakturnya" 200 \\
          "$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Pengguna: 1' "$BASE/v1/faktur/101")"

        # Baru setelah itu, pemeriksaan negatifnya berarti.
        periksa "bukan pemilik TIDAK bisa" 404 \\
          "$(curl -s -o /dev/null -w '%{http_code}' -H 'X-Pengguna: 1' "$BASE/v1/faktur/102")"
        `,
      ),
      p(
        'Butir-butir lain dalam checklist ini tidak bisa diperiksa dengan `curl`, dan itu harus dinyatakan terus terang alih-alih dibiarkan seolah tercakup.',
      ),
      code(
        'text',
        `
        Diperiksa dengan perintah lain:
          npm audit                     kerentanan dependency
          git log -p | grep -i secret   rahasia di riwayat versi
          grep -r "process.env" src/    pembacaan konfigurasi tersebar

        Diperiksa dengan membaca kode, bukan dengan perintah:
          - apakah query daftar menyaring di WHERE, bukan di memori
          - apakah id sesi diregenerasi sesudah login
          - apakah ada cek-lalu-tulis yang bisa berlomba
          - apakah URL dari pengguna diresolve sebelum dihubungi
          - apakah pesan antrean divalidasi seperti masukan luar

        Checklist yang jujur menyebutkan KEDUA daftar ini. Yang hanya
        menampilkan daftar pertama memberi kesan cakupannya penuh.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan terbesar pada tahap ini bukan melewatkan satu butir, melainkan salah memahami apa yang dibuktikan oleh checklist yang hijau.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menandai butir checklist tanpa menjalankan perintahnya',
            'Sudah diperiksa waktu menulis kodenya',
            'Klaim tanpa keluaran perintah bukan verifikasi. Jalankan, lalu baca kolom `dapat=`',
          ],
          [
            'Hanya menulis pemeriksaan yang harus DITOLAK',
            'Yang diuji kan pertahanannya',
            'Diukur, permintaan yang ditolak sejak autentikasi terlihat sama dengan otorisasi yang bekerja. Sertakan pasangan positifnya',
          ],
          [
            'Menghitung jumlah temuan tanpa membaca isinya',
            'Angkanya sudah nol',
            'Diukur, satu kelemahan muncul di dua butir berbeda. Kolom `dapat=` yang menjelaskan, bukan jumlahnya',
          ],
          [
            'Memeriksa header hanya di satu rute',
            'Header kan dipasang global',
            'Rute error dan endpoint API sering melewati middleware yang berbeda. Periksa beberapa rute termasuk yang gagal',
          ],
          [
            'Menganggap checklist hijau berarti aplikasinya aman',
            'Semua butir sudah lolos',
            'Checklist hanya menguji apa yang ditulis di dalamnya. Logika bisnis dan perlombaan tidak terlihat oleh `curl`',
          ],
          [
            'Menjalankan audit hanya sekali sebelum rilis pertama',
            'Sudah pernah diperiksa',
            'Setiap rute baru dan setiap dependency baru mengubah hasilnya. Jadikan bagian dari pipeline, bukan acara',
          ],
        ],
      ),
      p(
        'Baris kelima adalah yang paling menentukan cara membaca seluruh bab ini. Sepuluh pemeriksaan yang hijau membuktikan sepuluh hal, tidak lebih. Perlombaan penukaran kupon yang menghasilkan sisa `-1`, total pesanan negatif dari jumlah `-1000`, dan `__destruct` yang berjalan meski `unserialize` gagal semuanya terjadi di aplikasi yang akan melewati checklist ini tanpa satu pun temuan. Checklist adalah lantai, bukan langit-langit, dan gunanya memastikan kesalahan yang sudah dikenali tidak terulang, bukan memastikan tidak ada kesalahan lain.',
      ),
      references(
        {
          label: 'OWASP Top 10:2021',
          href: 'https://owasp.org/Top10/',
          source: 'OWASP',
          note: 'Sepuluh kategori yang menjadi kerangka seluruh bab ini, lengkap dengan datanya.',
        },
        {
          label: 'Web Security Testing Guide',
          href: 'https://owasp.org/www-project-web-security-testing-guide/',
          source: 'OWASP',
          note: 'Metodologi pengujian keamanan aplikasi web — versi lengkap dari audit di sub-bab ini.',
        },
        {
          label: 'Application Security Verification Standard (ASVS)',
          href: 'https://owasp.org/www-project-application-security-verification-standard/',
          source: 'OWASP',
          note: 'Daftar syarat keamanan bertingkat yang bisa dipakai sebagai gerbang rilis formal.',
        },
        {
          label: 'REST Security Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Ringkasan kontrol khusus API yang diuji satu per satu oleh skrip audit di sini.',
        },
      ),
    ],
  ),
];
