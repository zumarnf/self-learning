import { callout, code, divider, h2, p, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Frontend Basic — Chapter 1, lessons 1.4 to 1.8.
 *
 * Split out of the chapter file purely for readability: sixteen written lessons in one module is
 * a file nobody opens twice. Every code sample here was executed before being written down.
 */
export const lessons: LessonDraft[] = [
  written(
    'operator-dan-coercion',
    'Operator & Type Coercion — kenapa `==` menipu',
    12,
    'Operator aritmetika, perbandingan, dan logika — plus aturan konversi tipe otomatis yang jadi sumber banyak kejutan.',
    [
      p(
        'JavaScript adalah bahasa bertipe dinamis dan **longgar**. Dinamis berarti tipe ditentukan saat program berjalan. Longgar berarti JavaScript akan diam-diam mengubah tipe supaya sebuah operasi tetap bisa dilakukan. Perilaku kedua itulah yang disebut **type coercion**, dan ia sumber sebagian besar kebingungan pemula.',
      ),

      h2('Operator aritmetika'),
      code(
        'js',
        `
        7 + 3;    // 10
        7 - 3;    // 4
        7 * 3;    // 21
        7 / 3;    // 2.3333333333333335
        7 % 3;    // 1   — sisa bagi
        7 ** 3;   // 343 — pangkat

        let n = 5;
        n += 2;   // 7   — sama dengan n = n + 2
        n++;      // 8
        `,
      ),
      callout(
        'tip',
        'Modulo bukan cuma untuk matematika',
        '`i % 2 === 0` mengecek bilangan genap. `index % warna.length` membuat indeks berputar kembali ke awal saat mencapai ujung array — pola yang sering dipakai untuk memberi warna bergantian pada daftar.',
      ),

      h2('Coercion: aturan yang harus kamu tahu'),
      p(
        'Operator `+` punya dua pekerjaan: menjumlah angka **dan** menyambung string. Kalau salah satu operannya string, ia memilih menyambung. Operator aritmetika lain tidak punya kebingungan itu — mereka selalu mencoba mengubah keduanya jadi angka.',
      ),
      code(
        'js',
        `
        '5' + 2;    // '52'  — + memilih menyambung string
        '5' - 2;    // 3     — - hanya bisa berarti kurang, jadi '5' diubah jadi 5
        '5' * '2';  // 10
        '5' / 2;    // 2.5

        1 + 2 + '3';    // '33'  — dievaluasi kiri ke kanan: (1+2) lalu 3 + '3'
        '1' + 2 + 3;    // '123' — sudah jadi string sejak langkah pertama
        `,
      ),
      callout(
        'warning',
        'Ini bukan trik ujian — ini bug produksi',
        'Nilai dari `<input>` **selalu** string, meski `type="number"`. `hargaBarang + ongkir` dengan keduanya dari input akan menghasilkan `"1500010000"`, bukan `25000`. Ubah dulu dengan `Number(nilai)` sebelum menghitung.',
      ),
      code(
        'js',
        `
        const harga = '15000';   // dari input
        const ongkir = '10000';  // dari input

        harga + ongkir;                  // '1500010000'  <- SALAH
        Number(harga) + Number(ongkir);  // 25000         <- BENAR

        // Cara lain yang sering dipakai:
        parseInt('15000px', 10);   // 15000 — berhenti di karakter non-angka
        parseFloat('2.5rem');      // 2.5
        Number('15000px');         // NaN   — lebih ketat, dan itu bagus
        `,
      ),

      h2('`==` vs `===`'),
      p(
        '`==` membandingkan setelah mencoba menyamakan tipe. `===` membandingkan nilai **dan** tipe, tanpa konversi apa pun. Aturannya sederhana: **pakai `===` selalu.**',
      ),
      code(
        'js',
        `
        1 == '1';        // true   — '1' diubah jadi 1 dulu
        1 === '1';       // false  — tipenya beda

        0 == false;      // true
        0 === false;     // false

        '' == 0;         // true
        null == undefined;   // true
        null === undefined;  // false

        // Yang benar-benar aneh:
        [] == false;     // true
        '0' == false;    // true
        '0' == 0;        // true
        // ...tapi:
        '' == '0';       // false
        `,
      ),
      p(
        'Tabel aturan `==` cukup rumit sampai tidak ada yang menghafalnya. Itu sendiri sudah jadi alasan yang cukup untuk memakai `===`.',
      ),
      callout(
        'info',
        'Satu pengecualian yang disepakati banyak tim',
        '`nilai == null` bernilai `true` untuk `null` **maupun** `undefined`. Sebagian tim mengizinkannya sebagai cara ringkas mengecek "kosong dalam arti apa pun". Kalau tim kamu tidak menyepakatinya, tulis `nilai === null || nilai === undefined`.',
      ),

      h2('Truthy & falsy'),
      p(
        'Setiap nilai punya "rasa boolean" saat dipakai di dalam `if`. Yang perlu dihafal cuma daftar **falsy**-nya, karena pendek — sisanya truthy.',
      ),
      table(
        ['Nilai falsy', 'Catatan'],
        [
          ['`false`', 'Jelas'],
          ['`0` dan `-0`', '**Termasuk nol yang valid**, seperti "0 komentar"'],
          ['`0n`', 'BigInt nol'],
          ['`""`', 'String kosong'],
          ['`null`', 'Sengaja kosong'],
          ['`undefined`', 'Belum diisi'],
          ['`NaN`', 'Hasil perhitungan yang gagal'],
        ],
        'Delapan nilai ini falsy. Semua yang lain truthy — termasuk `"0"`, `[]`, dan `{}`.',
      ),
      code(
        'js',
        `
        if ([])  console.log('array kosong itu truthy');   // tercetak
        if ({})  console.log('object kosong itu truthy');  // tercetak
        if ('0') console.log('string "0" itu truthy');     // tercetak
        `,
      ),
      callout(
        'danger',
        'Jebakan angka nol',
        'Ini bug yang muncul di hampir setiap aplikasi. `if (jumlahKomentar)` akan **melewati** kasus nol komentar, padahal nol adalah nilai yang sah dan biasanya justru perlu ditangani ("belum ada komentar"). Tulis `if (jumlahKomentar > 0)` atau `if (jumlahKomentar !== undefined)` sesuai maksudmu.',
      ),

      h2('Operator logika'),
      code(
        'js',
        `
        true && false;   // false — semua harus benar
        true || false;   // true  — salah satu cukup
        !true;           // false

        // Keduanya mengembalikan SALAH SATU OPERAN, bukan true/false:
        'a' && 'b';      // 'b'  — kiri truthy, jadi hasilnya yang kanan
        ''  && 'b';      // ''   — kiri falsy, langsung berhenti
        'a' || 'b';      // 'a'  — kiri truthy, langsung berhenti
        ''  || 'b';      // 'b'
        `,
      ),
      p(
        'Sifat "berhenti lebih awal" itu disebut **short-circuit**, dan sering dipakai sebagai pengganti `if` singkat:',
      ),
      code(
        'js',
        `
        // Jalankan hanya kalau ada
        pengguna && kirimEmail(pengguna);

        // Nilai cadangan
        const nama = namaDariForm || 'Tanpa Nama';
        `,
      ),

      h2('`??` — dan kenapa ia berbeda dari `||`'),
      p(
        '`||` memakai cadangan untuk **semua** nilai falsy. `??` (nullish coalescing) hanya untuk `null` dan `undefined`. Perbedaannya penting persis di kasus nol dan string kosong.',
      ),
      code(
        'js',
        `
        const jumlah = 0;

        jumlah || 10;   // 10  <- SALAH — nol dianggap "tidak ada"
        jumlah ?? 10;   // 0   <- BENAR — nol adalah nilai yang sah

        const catatan = '';
        catatan || 'kosong';   // 'kosong'
        catatan ?? 'kosong';   // ''      <- BENAR string kosong tetap dihormati
        `,
      ),
      callout(
        'tip',
        'Aturan memilih',
        'Kalau `0` atau `""` adalah nilai yang **sah** untuk data itu — pakai `??`. Kalau keduanya memang dianggap "kosong" — `||` boleh. Saat ragu, `??` lebih jarang salah.',
      ),

      h2('Optional chaining dan operator penugasan logika'),
      code(
        'js',
        `
        const data = { pengguna: { alamat: null } };

        data.pengguna.alamat.kota;      // TypeError: Cannot read properties of null
        data.pengguna?.alamat?.kota;    // undefined — berhenti dengan aman
        data.hitung?.();                // undefined — aman meski hitung tidak ada
        data.daftar?.[0];               // undefined

        // Penugasan logika — ringkas, tapi jangan sampai mengaburkan maksud
        let a = null;
        a ??= 5;      // a = 5    (hanya kalau null/undefined)

        let b = 0;
        b ||= 9;      // b = 9    (semua falsy) — hati-hati, sering bukan yang kamu mau

        let c = 1;
        c &&= 3;      // c = 3    (hanya kalau truthy)
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`+` menyambung string kalau salah satu operannya string; operator aritmetika lain mengubah ke angka.',
        'Nilai dari input **selalu** string — ubah dengan `Number()` sebelum menghitung.',
        'Pakai `===`. Tabel aturan `==` terlalu rumit untuk dipercaya.',
        'Hafalkan delapan nilai falsy; sisanya truthy. `[]` dan `{}` itu truthy.',
        '`if (angka)` melewatkan nol — hampir selalu bukan yang kamu maksud.',
        '`??` menghormati `0` dan `""`; `||` tidak.',
      ),
    ],
  ),

  written(
    'percabangan',
    'Percabangan: `if`, `switch`, ternary',
    9,
    'Mengarahkan alur program berdasarkan kondisi, dan menjaga percabangan tetap terbaca saat kondisinya bertambah.',
    [
      p(
        'Percabangan itu mudah ditulis dan mudah dibuat berantakan. Bagian yang benar-benar perlu dilatih bukan sintaksnya, melainkan **menjaga kode tetap rata** saat kondisinya bertambah banyak.',
      ),

      h2('`if` / `else if` / `else`'),
      code(
        'js',
        `
        const nilai = 82;

        if (nilai >= 85) {
          console.log('A');
        } else if (nilai >= 70) {
          console.log('B');
        } else {
          console.log('C');
        }
        // 'B' — urutan penting: cabang pertama yang cocok yang menang
        `,
      ),
      callout(
        'warning',
        'Urutan cabang menentukan hasil',
        'Kalau `nilai >= 70` ditulis lebih dulu, nilai 90 pun akan masuk ke sana dan cabang `>= 85` tidak pernah tercapai. Susun dari kondisi paling sempit ke paling lebar.',
      ),

      h2('Early return: obat untuk kode bertingkat'),
      p(
        'Kode yang menjorok tiga tingkat ke dalam sulit dibaca karena pembaca harus mengingat semua kondisi sekaligus. Tangani kasus gagal lebih dulu lalu keluar, sehingga jalur utama tetap rata.',
      ),
      code(
        'js',
        `
        // Bertingkat — pembaca harus menahan tiga kondisi di kepala
        function prosesPesanan(pesanan) {
          if (pesanan) {
            if (pesanan.item.length > 0) {
              if (pesanan.sudahDibayar) {
                return kirim(pesanan);
              } else {
                return 'Belum dibayar';
              }
            } else {
              return 'Keranjang kosong';
            }
          } else {
            return 'Pesanan tidak ada';
          }
        }
        `,
        { filename: 'sebelum.js' },
      ),
      code(
        'js',
        `
        // Rata — tiap baris menutup satu kemungkinan, lalu selesai
        function prosesPesanan(pesanan) {
          if (!pesanan) return 'Pesanan tidak ada';
          if (pesanan.item.length === 0) return 'Keranjang kosong';
          if (!pesanan.sudahDibayar) return 'Belum dibayar';

          return kirim(pesanan);
        }
        `,
        {
          filename: 'sesudah.js',
          caption: 'Perilaku identik, tapi jalur suksesnya bisa dibaca sekali lihat.',
        },
      ),

      h2('`switch`'),
      p(
        'Berguna saat kamu membandingkan **satu nilai** dengan banyak kemungkinan yang pasti. Perbandingannya memakai `===`.',
      ),
      code(
        'js',
        `
        function labelStatus(status) {
          switch (status) {
            case 'draft':
              return 'Draf';
            case 'review':
              return 'Sedang ditinjau';
            case 'published':
              return 'Terbit';
            default:
              return 'Status tidak dikenal';
          }
        }
        `,
      ),
      p(
        'Tanpa `return` atau `break`, eksekusi **jatuh** ke case berikutnya. Itu sering jadi bug — tapi sesekali justru yang diinginkan:',
      ),
      code(
        'js',
        `
        function hariKerja(hari) {
          switch (hari) {
            case 'sabtu':
            case 'minggu':
              return false;   // dua case sengaja berbagi satu hasil
            default:
              return true;
          }
        }
        `,
      ),
      callout(
        'tip',
        'Alternatif yang sering lebih rapi',
        'Untuk pemetaan nilai-ke-nilai sederhana, objek pencarian lebih pendek dan lebih mudah diperluas daripada `switch`:',
        '`const LABEL = { draft: "Draf", review: "Sedang ditinjau" }; LABEL[status] ?? "Tidak dikenal";`',
      ),

      h2('Ternary'),
      code(
        'js',
        `
        const label = jumlah > 0 ? 'Ada isinya' : 'Kosong';

        // Boleh di dalam template literal — pola yang sering dipakai di React
        const pesan = \`Kamu punya \${jumlah} \${jumlah === 1 ? 'pesan' : 'pesan'}\`;
        `,
      ),
      callout(
        'danger',
        'Jangan pernah menyusun ternary bertingkat',
        'Ternary di dalam ternary di dalam ternary hampir mustahil dibaca dan sangat mudah salah dibaca saat sedang buru-buru. Kalau butuh lebih dari satu tingkat, pakai `if` dengan early return atau objek pencarian.',
      ),
      code(
        'js',
        `
        // SALAH: Jangan
        const t = a ? (b ? 'x' : c ? 'y' : 'z') : 'w';

        // BENAR: Pakai fungsi dengan early return
        function tentukan(a, b, c) {
          if (!a) return 'w';
          if (b) return 'x';
          return c ? 'y' : 'z';
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Susun cabang dari kondisi paling sempit ke paling lebar.',
        'Early return meratakan kode dan membuat jalur sukses terbaca sekali lihat.',
        '`switch` memakai `===`; tanpa `break`/`return` ia jatuh ke case berikutnya.',
        'Objek pencarian sering mengalahkan `switch` untuk pemetaan sederhana.',
        'Ternary bertingkat adalah utang teknis, bukan kepintaran.',
      ),
    ],
  ),

  written(
    'perulangan',
    'Perulangan: `for`, `for...of`, `for...in`, `while`',
    10,
    'Empat bentuk perulangan, bedanya, dan kapan method array lebih tepat daripada loop manual.',
    [
      p(
        'JavaScript punya beberapa cara mengulang. Memilih yang tepat bukan soal selera — masing-masing menyampaikan maksud yang berbeda kepada pembaca berikutnya.',
      ),

      h2('`for` klasik'),
      code(
        'js',
        `
        for (let i = 0; i < 5; i++) {
          console.log(i);   // 0 1 2 3 4
        }

        // Mundur
        for (let i = 5; i > 0; i--) {
          console.log(i);   // 5 4 3 2 1
        }
        `,
      ),
      p(
        'Pakai ini kalau kamu **benar-benar butuh indeksnya** — untuk melangkah dua-dua, mundur, atau berhenti di posisi tertentu.',
      ),

      h2('`for...of` — untuk nilainya'),
      code(
        'js',
        `
        const warna = ['merah', 'hijau', 'biru'];

        for (const w of warna) {
          console.log(w);   // merah, hijau, biru
        }

        // Butuh indeks juga? entries() memberi keduanya
        for (const [i, w] of warna.entries()) {
          console.log(i, w);   // 0 merah, 1 hijau, 2 biru
        }

        // Bekerja pada apa pun yang iterable — termasuk string, Map, dan Set
        for (const huruf of 'halo') {
          console.log(huruf);   // h a l o
        }
        `,
      ),

      h2('`for...in` — untuk kunci object'),
      code(
        'js',
        `
        const pengguna = { nama: 'Zum', level: 2 };

        for (const kunci in pengguna) {
          console.log(kunci, pengguna[kunci]);   // nama Zum, level 2
        }
        `,
      ),
      callout(
        'warning',
        'Jangan pakai `for...in` pada array',
        'Ia mengembalikan **kunci** sebagai string (`"0"`, `"1"`), bukan nilai, dan ikut menelusuri property yang diwarisi dari prototype. Untuk array pakai `for...of`; untuk object, `Object.entries()` biasanya lebih jelas.',
      ),
      code(
        'js',
        `
        // Lebih jelas maksudnya daripada for...in
        for (const [kunci, nilai] of Object.entries(pengguna)) {
          console.log(kunci, nilai);
        }
        `,
      ),

      h2('`while` dan `do...while`'),
      code(
        'js',
        `
        let sisa = 3;
        while (sisa > 0) {
          console.log(sisa);
          sisa--;                 // JANGAN LUPA — tanpa ini loop tak berujung
        }

        // do...while selalu jalan minimal sekali
        let jawab;
        do {
          jawab = tanyaPengguna();
        } while (!jawab);
        `,
      ),
      callout(
        'danger',
        'Loop tak berujung membekukan seluruh halaman',
        'JavaScript di browser berjalan pada satu thread yang sama dengan tampilan. `while (true)` tanpa jalan keluar bukan sekadar lambat — ia membuat halaman tidak bisa di-scroll, diklik, atau ditutup. Pastikan kondisi berhentinya benar-benar bisa tercapai sebelum menjalankan.',
      ),

      h2('`break` dan `continue`'),
      code(
        'js',
        `
        for (const n of [1, 2, 3, 4, 5]) {
          if (n === 3) continue;   // lewati yang ini, lanjut
          if (n === 5) break;      // hentikan seluruh loop
          console.log(n);          // 1, 2, 4
        }
        `,
      ),

      h2('Kapan method array lebih baik'),
      p(
        'Sebagian besar loop yang kamu tulis sebenarnya sedang melakukan salah satu dari tiga hal: mengubah tiap elemen, menyaring, atau meringkas. Untuk ketiganya, method array menyatakan maksud lebih langsung daripada loop.',
      ),
      code(
        'js',
        `
        const angka = [1, 2, 3, 4];

        // Loop manual — pembaca harus membaca isinya untuk tahu maksudnya
        const genap = [];
        for (const n of angka) {
          if (n % 2 === 0) genap.push(n);
        }

        // Method — maksudnya ada di namanya
        const genapRapi = angka.filter((n) => n % 2 === 0);   // [2, 4]
        `,
      ),
      table(
        ['Yang kamu lakukan', 'Pakai'],
        [
          ['Mengubah tiap elemen', '`map`'],
          ['Menyaring sebagian', '`filter`'],
          ['Meringkas jadi satu nilai', '`reduce`'],
          ['Mencari satu elemen', '`find`'],
          ['Butuh berhenti di tengah', '`for...of` + `break`'],
          ['Butuh melangkah tidak satu-satu', '`for` klasik'],
          ['Butuh `await` berurutan', '`for...of`'],
        ],
      ),
      callout(
        'info',
        'Satu hal yang tidak bisa dilakukan `forEach`',
        'Kamu tidak bisa `break` dari `forEach`, dan `await` di dalamnya tidak ditunggu. Kalau butuh salah satu dari keduanya, pakai `for...of`.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`for...of` untuk nilai, `for` klasik saat indeksnya benar-benar dibutuhkan.',
        '`for...in` untuk kunci object — bukan untuk array.',
        '`while` butuh perhatian ekstra: pastikan kondisi berhentinya bisa tercapai.',
        'Kalau loop-mu hanya mengubah, menyaring, atau meringkas — method array lebih jelas.',
        '`forEach` tidak bisa di-`break` dan tidak menunggu `await`.',
      ),
    ],
  ),

  written(
    'fungsi',
    'Fungsi: declaration, expression, arrow',
    13,
    'Tiga cara menulis fungsi, parameter default dan rest, serta fungsi sebagai nilai.',
    [
      p(
        'Fungsi adalah unit yang menampung satu pekerjaan supaya bisa diberi nama, diuji, dan dipakai ulang. Di JavaScript fungsi juga merupakan **nilai** — bisa disimpan di variabel, dioper sebagai argumen, dan dikembalikan dari fungsi lain. Sifat itu yang membuat `map`, `filter`, dan event handler mungkin ada.',
      ),

      h2('Tiga bentuk penulisan'),
      code(
        'js',
        `
        // 1. Function declaration — di-hoist penuh, bisa dipanggil sebelum barisnya
        function sapa(nama) {
          return \`Halo \${nama}\`;
        }

        // 2. Function expression — tidak bisa dipanggil sebelum deklarasinya
        const sapa2 = function (nama) {
          return \`Halo \${nama}\`;
        };

        // 3. Arrow function — paling ringkas, dan punya perilaku 'this' yang berbeda
        const sapa3 = (nama) => \`Halo \${nama}\`;
        `,
      ),
      code(
        'js',
        `
        sapaAwal('Zum');   // 'Halo Zum' — declaration boleh dipanggil lebih dulu
        function sapaAwal(nama) { return \`Halo \${nama}\`; }

        sapaAkhir('Zum');  // ReferenceError: Cannot access 'sapaAkhir' before initialization
        const sapaAkhir = (nama) => \`Halo \${nama}\`;
        `,
      ),

      h2('Bentuk ringkas arrow function'),
      code(
        'js',
        `
        (a, b) => a + b;          // return implisit — tanpa kurung kurawal
        (a) => a * 2;
        a => a * 2;               // satu parameter: kurung boleh dilepas
        () => 'tanpa parameter';

        (a) => { return a * 2; }; // dengan kurawal, 'return' wajib ditulis

        // Mengembalikan object literal butuh kurung tambahan,
        // kalau tidak, { } dibaca sebagai badan fungsi:
        () => ({ nama: 'Zum' });
        `,
      ),
      callout(
        'info',
        'Perbedaan `this` — dibahas tuntas di Bab 2',
        'Arrow function tidak punya `this` sendiri; ia memakai `this` dari tempat ia **ditulis**. Untuk sekarang cukup ingat: arrow function biasanya pilihan aman untuk callback, dan **bukan** pilihan untuk method di dalam object literal.',
      ),

      h2('Parameter default dan rest'),
      code(
        'js',
        `
        function buatSapaan(nama, sapaan = 'Halo') {
          return \`\${sapaan} \${nama}\`;
        }

        buatSapaan('Zum');            // 'Halo Zum'
        buatSapaan('Zum', 'Hai');     // 'Hai Zum'
        buatSapaan('Zum', undefined); // 'Halo Zum' — undefined memicu default
        buatSapaan('Zum', null);      // 'null Zum' — null TIDAK memicu default

        // Rest: mengumpulkan sisa argumen jadi array asli
        function jumlahkan(...angka) {
          return angka.reduce((total, n) => total + n, 0);
        }

        jumlahkan(1, 2, 3);   // 6
        jumlahkan();          // 0
        `,
      ),
      callout(
        'tip',
        'Rest menggantikan `arguments`',
        'Kode lama memakai objek `arguments`. Ia bukan array sungguhan (tidak punya `map` atau `filter`) dan tidak tersedia di arrow function. Rest parameter menghasilkan array asli dan selalu lebih jelas.',
      ),

      h2('Nilai kembalian'),
      code(
        'js',
        `
        function tanpaReturn() {
          const x = 1;
        }
        tanpaReturn();   // undefined — fungsi tanpa return mengembalikan undefined

        function returnKosong() {
          return;        // juga undefined
        }
        `,
      ),
      callout(
        'danger',
        'Jangan taruh nilai di baris setelah `return`',
        'JavaScript menyisipkan titik koma otomatis setelah `return` yang berdiri sendiri di satu baris. Kode di bawah ini mengembalikan `undefined`, bukan objek:',
        '`return` lalu baris baru `{ nama: "Zum" };` → hasilnya `undefined`. Taruh `{` di baris yang sama dengan `return`.',
      ),

      h2('Fungsi sebagai nilai'),
      code(
        'js',
        `
        // Disimpan di variabel dan dioper sebagai argumen
        const kali2 = (n) => n * 2;
        [1, 2, 3].map(kali2);          // [2, 4, 6]

        // Dikembalikan dari fungsi lain
        function pengali(faktor) {
          return (n) => n * faktor;
        }

        const kali3 = pengali(3);
        kali3(5);                      // 15
        `,
      ),
      callout(
        'warning',
        'Bedakan mengoper fungsi dan memanggilnya',
        '`onClick={handleKlik}` mengoper fungsinya — dipanggil nanti saat diklik. `onClick={handleKlik()}` **memanggilnya sekarang** dan mengoper hasilnya. Ini salah satu kesalahan paling sering di React.',
      ),

      h2('Satu fungsi, satu pekerjaan'),
      code(
        'js',
        `
        // SALAH: Tiga pekerjaan sekaligus: menghitung, memformat, mencetak
        function proses(items) {
          const total = items.reduce((a, i) => a + i.harga, 0);
          const teks = 'Rp' + total.toLocaleString('id-ID');
          document.querySelector('#total').textContent = teks;
        }

        // BENAR: Dipisah — dua di antaranya jadi fungsi murni yang mudah diuji
        const hitungTotal = (items) => items.reduce((a, i) => a + i.harga, 0);
        const formatRupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

        function tampilkanTotal(items) {
          document.querySelector('#total').textContent = formatRupiah(hitungTotal(items));
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Declaration bisa dipanggil sebelum barisnya; expression dan arrow tidak.',
        'Arrow function memakai `this` dari tempat ia ditulis — aman untuk callback, tidak untuk method object.',
        'Parameter default hanya terpicu oleh `undefined`, bukan `null`.',
        'Rest parameter menghasilkan array asli; `arguments` tidak.',
        'Fungsi adalah nilai — perhatikan bedanya mengoper dan memanggil.',
        'Pisahkan menghitung dari menampilkan; yang menghitung jadi mudah diuji.',
      ),
    ],
  ),

  written(
    'scope-hoisting-closure',
    'Scope, Hoisting & Closure',
    14,
    'Bagaimana JavaScript menentukan nama mana yang terlihat dari mana — dan closure sebagai konsekuensi alaminya.',
    [
      p(
        'Scope adalah jawaban atas satu pertanyaan: **dari mana sebuah nama bisa dilihat?** Menguasainya menghapus sekelas bug sekaligus, dan membuat closure — konsep yang sering terdengar menakutkan — terasa jelas dengan sendirinya.',
      ),

      h2('Tiga tingkat scope'),
      code(
        'js',
        `
        const global = 'terlihat di mana-mana';

        function luar() {
          const scopeFungsi = 'hanya di dalam luar()';

          if (true) {
            const scopeBlok = 'hanya di dalam if ini';
            console.log(global, scopeFungsi, scopeBlok);   // ketiganya terlihat
          }

          console.log(scopeBlok);   // ReferenceError
        }

        console.log(scopeFungsi);   // ReferenceError
        `,
      ),
      p(
        'Aturannya satu arah: **dari dalam bisa melihat ke luar, dari luar tidak bisa melihat ke dalam.** Ini yang membuat variabel di dalam sebuah fungsi tidak bertabrakan dengan nama yang sama di fungsi lain.',
      ),

      h2('Scope chain'),
      p(
        'Saat sebuah nama dipakai, JavaScript mencarinya di scope terdekat. Kalau tidak ketemu, ia naik satu tingkat, lalu satu tingkat lagi, sampai scope global. Kalau tetap tidak ada — `ReferenceError`.',
      ),
      code(
        'js',
        `
        const level = 'global';

        function a() {
          const level = 'fungsi a';

          function b() {
            console.log(level);   // 'fungsi a' — ketemu di tingkat terdekat, berhenti naik
          }

          b();
        }

        a();
        `,
      ),
      callout(
        'info',
        'Lexical scoping: ditentukan oleh tempat menulis',
        'Scope chain dibentuk berdasarkan **di mana fungsi ditulis**, bukan dari mana ia dipanggil. Kamu bisa membaca scope sebuah fungsi hanya dengan melihat kodenya — tidak perlu menjalankan program.',
      ),

      h2('Hoisting'),
      p(
        'Sebelum kode dijalankan, JavaScript mendata semua deklarasi di scope itu. Yang berbeda adalah apa yang terjadi kalau kamu mengaksesnya sebelum barisnya tercapai.',
      ),
      table(
        ['Bentuk', 'Diakses sebelum deklarasi'],
        [
          ['`function foo() {}`', 'Berfungsi penuh'],
          ['`var x`', '`undefined` — diam-diam, dan itu masalahnya'],
          ['`let x` / `const x`', '`ReferenceError` — berisik, dan itu bagus'],
          ['`class Foo {}`', '`ReferenceError`'],
        ],
      ),
      code(
        'js',
        `
        console.log(pakaiVar);   // undefined
        var pakaiVar = 1;

        console.log(pakaiLet);   // ReferenceError: Cannot access 'pakaiLet' before initialization
        let pakaiLet = 1;
        `,
      ),
      p(
        'Rentang antara awal blok dan baris deklarasi `let`/`const` disebut **Temporal Dead Zone**. Error yang berisik jauh lebih murah daripada `undefined` yang mengalir diam-diam ke perhitungan berikutnya.',
      ),

      h2('Closure'),
      p(
        'Closure adalah konsekuensi langsung dari lexical scoping: **fungsi tetap mengingat lingkungan tempat ia dibuat, bahkan setelah fungsi induknya selesai.**',
      ),
      code(
        'js',
        `
        function buatPenghitung() {
          let hitungan = 0;              // hidup di scope buatPenghitung

          return function () {
            hitungan++;                  // masih bisa diakses meski buatPenghitung sudah selesai
            return hitungan;
          };
        }

        const hitung = buatPenghitung();
        hitung();   // 1
        hitung();   // 2
        hitung();   // 3

        const hitungLain = buatPenghitung();
        hitungLain();   // 1 — lingkungannya sendiri, terpisah
        `,
      ),
      p(
        'Perhatikan: `hitungan` tidak bisa disentuh dari luar sama sekali. Tidak ada cara membacanya, mengubahnya, atau merusaknya kecuali lewat fungsi yang dikembalikan. Itulah **enkapsulasi** — dan ia sudah ada di JavaScript jauh sebelum `class` dan private field.',
      ),

      h2('Closure dalam praktik'),
      code(
        'js',
        `
        // 1. State privat
        function buatDompet(saldoAwal) {
          let saldo = saldoAwal;

          return {
            setor(n) {
              if (n <= 0) throw new Error('Setoran harus lebih dari nol');
              saldo += n;
              return saldo;
            },
            lihatSaldo() {
              return saldo;
            },
          };
        }

        const dompet = buatDompet(1000);
        dompet.setor(500);      // 1500
        dompet.lihatSaldo();    // 1500
        dompet.saldo;           // undefined — tidak bisa diakses langsung
        `,
      ),
      code(
        'js',
        `
        // 2. Factory function — konfigurasi dikunci sekali, dipakai berkali-kali
        function buatFormatter(mataUang) {
          return (angka) => \`\${mataUang}\${angka.toLocaleString('id-ID')}\`;
        }

        const rupiah = buatFormatter('Rp');
        rupiah(1500000);   // 'Rp1.500.000'
        `,
      ),
      code(
        'js',
        `
        // 3. Debounce — menunda sampai berhenti diketik. Timer disimpan di closure.
        function debounce(fn, jeda) {
          let timer;

          return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), jeda);
          };
        }

        const cariTertunda = debounce((kata) => console.log('cari:', kata), 300);
        `,
      ),

      h2('Jebakan closure di dalam loop'),
      code(
        'js',
        `
        for (var i = 0; i < 3; i++) {
          setTimeout(() => console.log('var:', i), 0);
        }
        // var: 3, var: 3, var: 3
        // Semua callback berbagi SATU variabel i. Saat mereka jalan, i sudah 3.

        for (let j = 0; j < 3; j++) {
          setTimeout(() => console.log('let:', j), 0);
        }
        // let: 0, let: 1, let: 2
        // let membuat j BARU tiap iterasi, jadi tiap closure menangkap nilainya sendiri.
        `,
      ),
      callout(
        'tip',
        'Kenapa contoh ini penting jauh melampaui loop',
        'Pola yang sama muncul di React: sebuah callback menangkap nilai state dari render saat ia dibuat. Kalau kamu pernah bingung kenapa handler menampilkan nilai lama, jawabannya ada di sini — bukan di React, tapi di cara closure bekerja.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Dari dalam bisa melihat ke luar; dari luar tidak bisa melihat ke dalam.',
        'Scope chain naik dari terdekat ke global, dan berhenti pada kecocokan pertama.',
        'Lexical scoping: ditentukan tempat menulis, bukan tempat memanggil.',
        '`var` di-hoist jadi `undefined`; `let`/`const` melempar error — itu fitur, bukan gangguan.',
        'Closure adalah fungsi yang mengingat lingkungannya — dasar dari state privat, factory, dan debounce.',
        '`var` di dalam loop dibagikan; `let` dibuat ulang tiap iterasi.',
      ),
    ],
  ),
];
