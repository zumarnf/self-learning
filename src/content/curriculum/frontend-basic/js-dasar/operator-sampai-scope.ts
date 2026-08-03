import {
  callout,
  code,
  divider,
  h2,
  p,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
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

      terms(
        {
          term: 'operator',
          meaning:
            'Simbol yang **melakukan sesuatu** pada satu atau dua nilai — `+`, `-`, `===`, `&&`, `!`. Cara paling mudah mengingatnya: kalau nilai adalah kata benda, operator adalah kata kerjanya. Kebanyakan operator bekerja pada dua nilai (disebut *biner*), sebagian hanya pada satu (*uner*, seperti `!` dan `typeof`), dan tepat satu operator bekerja pada tiga nilai sekaligus — ternary `? :` yang dibahas di sub-bab berikutnya.',
        },
        {
          term: 'operan',
          meaning:
            'Dari *operand*, artinya **yang dioperasikan**. Nilai yang dikerjakan oleh sebuah operator. Pada `7 + 3`, tanda `+` adalah operatornya sementara angka `7` dan `3` adalah kedua operannya. Istilah ini berguna karena banyak aturan JavaScript berbunyi "kalau salah satu operannya bertipe X, maka…" — dan tanpa kata ini, aturan itu jadi berbelit untuk dijelaskan.',
        },
        {
          term: 'coercion',
          meaning:
            'Dibaca "ko-er-syen", artinya **pemaksaan**. Perilaku JavaScript yang, saat menemui operasi antara dua tipe berbeda, diam-diam mengubah salah satunya agar operasi itu tetap bisa dijalankan alih-alih menyerah dan melempar error. Niatnya membantu, tapi karena terjadi tanpa pemberitahuan, hasilnya sering bukan yang kamu maksud. Sebagian besar isi sub-bab ini pada dasarnya adalah daftar tempat perilaku ini menggigit.',
        },
        {
          term: 'modulo',
          meaning:
            'Nama operator `%`, dibaca "mo-du-lo". **Bukan persen**, meski simbolnya sama dengan tanda persen — ia memberi **sisa** dari sebuah pembagian. `7 % 3` bernilai `1`, karena 7 dibagi 3 hasilnya 2 dan bersisa 1. Dua pemakaian yang akan sering kamu lihat: `i % 2 === 0` untuk mengecek bilangan genap, dan `i % panjangDaftar` untuk membuat indeks berputar kembali ke awal saat mencapai ujung.',
        },
        {
          term: 'truthy / falsy',
          meaning:
            'Dibaca "tru-thi" dan "fol-si", dari kata *true* dan *false* dengan akhiran yang berarti "cenderung" atau "berasa seperti". Keduanya menggambarkan **sifat sebuah nilai saat dipakai sebagai kondisi**, misalnya di dalam `if`. Falsy berarti diperlakukan seperti `false`; truthy berarti diperlakukan seperti `true`. Kabar baiknya, daftar falsy hanya berisi delapan nilai dan bisa dihafal; segala sesuatu di luar delapan itu bersifat truthy — termasuk array kosong dan object kosong, yang sering mengejutkan.',
        },
        {
          term: 'short-circuit',
          meaning:
            'Terjemahan harfiahnya **hubungan pendek**, dari dunia kelistrikan: arus menemukan jalan pintas dan tidak melewati sisa rangkaian. Sifat `&&` dan `||` yang berhenti mengevaluasi begitu hasilnya sudah pasti, sehingga bagian di sebelah kanan **tidak pernah dijalankan sama sekali**. Pada `a && b()`, kalau `a` sudah falsy maka fungsi `b` tidak dipanggil. Sifat ini bukan sekadar penghematan; ia sengaja dipakai sebagai pengganti `if` singkat.',
        },
        {
          term: 'nullish',
          meaning:
            'Dibaca "na-lisy", bentukan dari `null` dengan akhiran yang berarti "semacam". Istilah resmi spesifikasi untuk **"bernilai `null` atau `undefined`, dan hanya kedua itu"**. Perlu istilah tersendiri karena ia lebih sempit daripada *falsy*: angka `0` dan teks kosong `""` bersifat falsy tapi **tidak** nullish. Perbedaan sempit inilah yang membuat operator `??` ada dan berguna.',
        },
        {
          term: 'optional chaining',
          meaning:
            'Terjemahan bebasnya **penelusuran yang boleh gagal**. Operator `?.` yang berarti: "kalau bagian sebelum tanda ini bernilai `null` atau `undefined`, berhenti dengan tenang dan hasilkan `undefined` — jangan melempar error dan menghentikan seluruh program". Disebut *chaining* karena ia dipakai saat menelusuri rantai property yang panjang seperti `data.pengguna?.alamat?.kota`, di mana bagian mana pun bisa saja tidak ada.',
        },
        {
          term: 'NaN',
          meaning:
            'Singkatan *Not a Number*, artinya **bukan sebuah angka**. Muncul ketika sebuah perhitungan angka gagal, misalnya `Number("15000px")`. Jangan mengeceknya dengan `nilai === NaN` karena selalu bernilai `false`; pakai `Number.isNaN(nilai)`.',
        },
        {
          term: 'parseInt / parseFloat',
          meaning:
            'Gabungan *parse* (membedah) dengan *integer* (bilangan bulat) dan *float* (bilangan desimal). Keduanya membedah teks menjadi angka, tapi lebih **longgar** daripada `Number()`: mereka membaca dari kiri dan berhenti di karakter pertama yang bukan angka, sehingga `parseInt("15000px", 10)` menghasilkan `15000` sementara `Number("15000px")` menghasilkan `NaN`. Angka `10` pada argumen kedua adalah basis bilangan (desimal) dan sebaiknya selalu ditulis.',
        },
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
      references(
        {
          label: 'Expressions and operators',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators',
          source: 'MDN',
          note: 'Daftar lengkap operator JavaScript beserta urutan prioritasnya.',
        },
        {
          label: 'Equality comparisons and sameness',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness',
          source: 'MDN',
          note: 'Perbandingan langsung `==`, `===`, dan `Object.is` — termasuk tabel `==` yang tidak perlu kamu hafal.',
        },
        {
          label: 'Truthy',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Truthy',
          source: 'MDN',
          note: 'Definisi resminya, dengan tautan ke daftar lengkap nilai falsy.',
        },
        {
          label: 'Nullish coalescing operator (??)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing',
          source: 'MDN',
          note: 'Menjelaskan kenapa `??` sengaja dibuat berbeda dari `||`.',
        },
        {
          label: 'Optional chaining (?.)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
          source: 'MDN',
          note: 'Termasuk bentuk `?.()` untuk memanggil fungsi dan `?.[]` untuk mengakses indeks.',
        },
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

      terms(
        {
          term: 'kondisi',
          meaning:
            'Dari *condition*, artinya **syarat**. Ekspresi di dalam kurung `if (...)` yang hasilnya dinilai truthy atau falsy. Kalau truthy, blok di bawahnya dijalankan; kalau tidak, dilewati. Yang perlu diingat: isinya tidak harus berupa perbandingan — nilai apa pun boleh ditaruh di sana, dan JavaScript akan menilai "rasa boolean"-nya. Justru kelonggaran itulah yang membuat jebakan angka nol di sub-bab sebelumnya bisa terjadi.',
        },
        {
          term: 'early return',
          meaning:
            'Terjemahannya **keluar lebih awal**. Pola menulis fungsi dengan menangani semua kasus gagal di baris-baris pertama lalu langsung `return`, sehingga sisa fungsi hanya berisi jalur normal tanpa perlu menjorok ke dalam. Manfaatnya bukan estetika: pembaca yang menelusuri jalur sukses tidak perlu lagi menahan tiga syarat sekaligus di kepalanya, karena setiap syarat sudah ditutup dan ditinggalkan satu per satu.',
        },
        {
          term: 'nesting',
          meaning:
            'Dibaca "nes-ting", dari *nest* yang berarti **sarang**. Kondisi berada di dalam kondisi, yang berada di dalam kondisi lagi. Masalahnya bersifat manusiawi, bukan teknis: setiap tingkat sarang menambah satu hal yang harus diingat pembaca secara bersamaan, dan kemampuan itu habis jauh lebih cepat daripada yang biasanya kita kira. Karena itu meratakan sarang hampir selalu memperbaiki kode.',
        },
        {
          term: 'fall-through',
          meaning:
            'Terjemahan bebasnya **jatuh menembus ke bawah**. Perilaku `switch` yang, jika sebuah `case` tidak diakhiri `break` atau `return`, akan terus menjalankan isi `case` di bawahnya — bahkan meski nilainya tidak cocok. Lupa menuliskan penutup adalah salah satu bug klasik `switch`. Tapi perilaku ini juga bisa dimanfaatkan dengan sengaja: menumpuk dua `case` berturut-turut adalah cara ringkas mengatakan "kedua nilai ini diperlakukan sama".',
        },
        {
          term: 'ternary',
          meaning:
            'Dibaca "ter-na-ri", dari bahasa Latin *ternarius* yang berarti **terdiri dari tiga**. Bentuknya `kondisi ? nilaiJikaBenar : nilaiJikaSalah`. Disebut ternary karena ia satu-satunya operator di JavaScript yang bekerja atas **tiga** bagian sekaligus. Bedanya dengan `if` bukan sekadar gaya: `if` adalah pernyataan yang menjalankan sesuatu, sementara ternary adalah **ekspresi yang menghasilkan nilai**, sehingga ia bisa ditaruh langsung di dalam template literal atau di tengah JSX.',
        },
        {
          term: 'default',
          meaning:
            'Artinya **cadangan** atau **bawaan**. Di dalam `switch`, cabang yang dijalankan kalau tidak ada satu pun `case` yang cocok — perannya sama seperti `else` pada `if`. Menuliskannya bukan formalitas: `switch` tanpa `default` akan diam saja ketika menerima nilai tak dikenal, sehingga bug melewati tempat ini tanpa jejak apa pun.',
        },
        {
          term: 'objek pencarian',
          meaning:
            'Terjemahan dari *lookup object*. Sebuah object biasa yang dipakai sebagai tabel pemetaan nilai-ke-nilai, misalnya `{ draft: "Draf", review: "Sedang ditinjau" }`, lalu dibaca dengan `LABEL[status]`. Untuk pemetaan sederhana ia lebih pendek daripada `switch` dan lebih mudah diperluas, karena menambah kemungkinan baru cukup menambah satu baris data.',
        },
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
      references(
        {
          label: 'Control flow and error handling',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling',
          source: 'MDN',
          note: 'Panduan resmi seluruh bentuk percabangan dalam satu halaman.',
        },
        {
          label: 'if...else',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else',
          source: 'MDN',
          note: 'Termasuk catatan kenapa kurung kurawal tetap dianjurkan meski isinya satu baris.',
        },
        {
          label: 'switch',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch',
          source: 'MDN',
          note: 'Penjelasan resmi fall-through dan alasan `switch` memakai perbandingan ketat `===`.',
        },
        {
          label: 'Conditional (ternary) operator',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator',
          source: 'MDN',
          note: 'Halaman ini sendiri memperingatkan soal ternary bertingkat yang sulit dibaca.',
        },
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

      terms(
        {
          term: 'loop',
          meaning:
            'Dibaca "lup", artinya **gelung** atau **putaran**. Blok kode yang dijalankan berulang-ulang sampai kondisi berhentinya terpenuhi. Nama "gelung" itu tepat secara harfiah: alur program berjalan ke bawah, lalu melengkung kembali ke atas, lalu ke bawah lagi. Bagian yang paling penting diperhatikan bukan cara memulainya, melainkan **apa yang membuatnya berhenti** — loop tanpa jalan keluar akan membekukan seluruh halaman.',
        },
        {
          term: 'iterasi',
          meaning:
            'Dari *iteration*, artinya **satu kali putaran**. Loop yang berjalan lima kali dikatakan melakukan lima iterasi. Kata kerjanya *meng-iterasi*, yang berarti menelusuri sesuatu satu per satu. Istilah ini akan muncul lagi di luar konteks loop — misalnya "React meng-iterasi daftar" — dengan arti yang persis sama.',
        },
        {
          term: 'i',
          meaning:
            'Nama variabel penghitung loop yang sudah menjadi kebiasaan turun-temurun sejak bahasa Fortran tahun 1950-an, berasal dari kata *index*. **Bukan kata kunci** — kamu bebas menamainya `baris` atau `nomor` kalau itu lebih menjelaskan. Kalau ada loop di dalam loop, kebiasaannya berlanjut ke `j` lalu `k`; tapi begitu kamu butuh sampai `k`, biasanya itu tanda bahwa kodenya lebih baik dipecah.',
        },
        {
          term: 'indeks',
          meaning:
            'Dari *index*, artinya **nomor posisi** sebuah elemen di dalam array. Yang wajib diingat: penomorannya **dimulai dari 0**, bukan 1 — elemen pertama berindeks 0, elemen kelima berindeks 4, dan elemen terakhir selalu berindeks `panjang - 1`. Kekeliruan satu angka di sini sangat umum sampai punya nama sendiri dalam bahasa Inggris: *off-by-one error*.',
        },
        {
          term: 'iterable',
          meaning:
            'Dibaca "i-te-ra-bel", artinya **bisa ditelusuri satu per satu**. Sebutan untuk nilai apa pun yang sanggup diperiksa oleh `for...of`: array, string (yang ditelusuri per karakter), `Map`, `Set`, dan hasil `Object.entries()`. Perhatikan bahwa **object biasa tidak termasuk** — dan itulah sebabnya menelusuri object butuh `Object.entries()` terlebih dulu.',
        },
        {
          term: 'break / continue',
          meaning:
            '`break` artinya **patahkan** — ia menghentikan seluruh loop saat itu juga dan melanjutkan ke baris setelah loop. `continue` artinya **lanjutkan** — ia hanya melewati sisa iterasi yang sedang berjalan lalu langsung meloncat ke putaran berikutnya. Keduanya hanya bekerja di dalam loop sungguhan; di dalam `forEach` keduanya tidak tersedia, dan itulah batasan utama method tersebut.',
        },
        {
          term: 'callback',
          meaning:
            'Terjemahan bebasnya **fungsi panggilan balik**. Fungsi yang kamu serahkan ke fungsi lain, dengan kesepakatan bahwa fungsi lain itulah yang akan memanggilnya — bukan kamu. Pada `angka.filter((n) => n > 2)`, bagian `(n) => n > 2` adalah callback: kamu tidak pernah memanggilnya sendiri, `filter` yang memanggilnya sekali untuk setiap elemen. Pola ini adalah fondasi hampir seluruh JavaScript modern, dari method array sampai event handler dan operasi jaringan.',
        },
        {
          term: 'n',
          meaning:
            'Singkatan *number*, nama parameter yang lazim dipakai saat sebuah callback menerima satu angka. Sama seperti `i`, ini murni kebiasaan penamaan dan **bukan aturan bahasa** — `(harga) => harga * 2` sama sahnya dan sering lebih jelas.',
        },
        {
          term: 'entries',
          meaning:
            'Artinya **entri** atau **pasangan catatan**. Method `.entries()` pada array mengembalikan pasangan `[indeks, nilai]`, sementara `Object.entries()` pada object mengembalikan pasangan `[kunci, nilai]`. Keduanya dipakai saat kamu butuh nama sekaligus isinya dalam satu putaran loop.',
        },
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
      references(
        {
          label: 'Loops and iteration',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration',
          source: 'MDN',
          note: 'Semua bentuk perulangan JavaScript dijelaskan berurutan dalam satu panduan.',
        },
        {
          label: 'for...of',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of',
          source: 'MDN',
          note: 'Termasuk perbandingan resmi `for...of` dengan `for...in` yang sering tertukar.',
        },
        {
          label: 'for...in',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in',
          source: 'MDN',
          note: 'Berisi peringatan resmi agar tidak dipakai pada array.',
        },
        {
          label: 'Iteration protocols',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
          source: 'MDN',
          note: 'Menjelaskan apa yang membuat sebuah nilai disebut *iterable*.',
        },
        {
          label: 'Array.prototype.forEach()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach',
          source: 'MDN',
          note: 'Bagian "No way to stop or break" menegaskan batasan yang dibahas di sub-bab ini.',
        },
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

      terms(
        {
          term: 'fn',
          meaning:
            'Singkatan dari *function*, dibaca "ef-en" atau langsung "function". **Ini bukan kata kunci JavaScript** — ia hanya nama parameter yang sudah jadi kebiasaan bersama saat sebuah fungsi menerima fungsi lain sebagai bahannya. Ketika kamu melihat `debounce(fn, jeda)` di dokumentasi atau `arr.map(fn)` di cheatsheet, yang dimaksud adalah "di posisi ini isikan sebuah **fungsi**, bukan angka atau teks". Kamu bebas menamainya `aksi`, `callback`, atau `apaYangDijalankan` — JavaScript tidak peduli sedikit pun, dan nama yang lebih panjang justru sering lebih baik di kodemu sendiri. Catatan penting untuk nanti: di **PHP**, `fn` justru **benar-benar kata kunci** untuk arrow function, jadi jangan bawa asumsi ini ke bab Laravel.',
        },
        {
          term: 'parameter',
          meaning:
            'Nama yang kamu tulis di dalam kurung ketika **mendefinisikan** sebuah fungsi. Pada `function sapa(nama)`, kata `nama` adalah parameter. Ia berperan seperti **wadah kosong yang diberi label**: saat fungsi ditulis, isinya belum ada dan belum perlu ada.',
        },
        {
          term: 'argumen',
          meaning:
            'Nilai sungguhan yang kamu kirimkan ketika **memanggil** fungsi. Pada `sapa("Zum")`, teks `"Zum"` adalah argumen. Hubungannya dengan parameter mudah diingat: **parameter adalah wadahnya, argumen adalah isinya**. Kedua istilah ini sering tertukar dalam percakapan sehari-hari, tapi dokumentasi resmi membedakannya dengan konsisten, jadi ada gunanya membiasakan diri sekarang.',
        },
        {
          term: 'declaration',
          meaning:
            'Dibaca "dek-la-ra-syen", artinya **pernyataan**. Bentuk penulisan fungsi yang diawali kata kunci `function` lalu langsung diberi nama: `function sapa(nama) { ... }`. Ciri khasnya, ia di-*hoist* secara penuh — artinya boleh dipanggil di baris yang letaknya **di atas** definisinya, dan tetap bekerja.',
        },
        {
          term: 'expression',
          meaning:
            'Dibaca "eks-pre-syen", artinya **ungkapan** — sesuatu yang menghasilkan nilai. Fungsi yang diperlakukan sebagai nilai biasa lalu disimpan ke dalam variabel: `const sapa = function () { ... }`. Berbeda dari declaration, bentuk ini **tidak** bisa dipanggil sebelum barisnya tercapai, karena yang berlaku adalah aturan variabel, bukan aturan fungsi.',
        },
        {
          term: 'arrow function',
          meaning:
            'Terjemahannya **fungsi panah**, dinamai dari tanda `=>` yang menjadi cirinya. Bentuk ringkas menulis fungsi: `(a, b) => a + b` adalah versi pendek dari `function (a, b) { return a + b; }`. Perhatikan bahwa tanpa kurung kurawal, nilai di sebelah kanan panah **otomatis dikembalikan** tanpa perlu menulis `return` — dan begitu kamu menambahkan kurung kurawal, `return` menjadi wajib lagi. Arrow function juga memperlakukan `this` secara berbeda, yang dibahas tuntas di Bab 2.',
        },
        {
          term: 'callback',
          meaning:
            'Terjemahan bebasnya **fungsi panggilan balik**. Fungsi yang kamu serahkan kepada pihak lain dengan kesepakatan bahwa pihak itulah yang akan memanggilnya nanti — saat tombol diklik, saat data selesai diunduh, atau sekali untuk tiap elemen array. Kamu menyerahkan fungsinya, bukan hasilnya; dan itulah kenapa membedakan "mengoper" dari "memanggil" menjadi sangat penting di sub-bab ini.',
        },
        {
          term: 'default parameter',
          meaning:
            'Terjemahannya **parameter dengan nilai cadangan**. Nilai yang otomatis dipakai kalau argumennya tidak dikirim: `function sapa(nama, sapaan = "Halo")`. Satu aturan yang wajib diingat karena sering menjebak: nilai cadangan ini **hanya terpicu oleh `undefined`**, tidak oleh `null`. Mengirim `null` secara eksplisit berarti kamu benar-benar bermaksud mengirim `null`, dan JavaScript menghormatinya.',
        },
        {
          term: 'rest parameter',
          meaning:
            'Terjemahannya **parameter sisa**. Tanda `...` di depan parameter **terakhir**, yang mengumpulkan semua argumen yang tersisa menjadi satu array asli: `function jumlahkan(...angka)`. Karena hasilnya array sungguhan, kamu bisa langsung memakai `map`, `filter`, dan `reduce` di atasnya. Ini menggantikan objek `arguments` gaya lama yang tampak seperti array tapi tidak punya method-method itu.',
        },
        {
          term: 'args',
          meaning:
            'Singkatan *arguments*, nama yang lazim dipakai untuk menampung rest parameter: `(...args)`. Seperti `fn` dan `arr`, ini kebiasaan penamaan, bukan aturan.',
        },
        {
          term: 'return',
          meaning:
            'Artinya **mengembalikan**. Kata kunci yang melakukan dua hal sekaligus: **menghentikan fungsi saat itu juga** dan **menyerahkan sebuah nilai kepada yang memanggilnya**. Baris apa pun setelah `return` di dalam blok yang sama tidak akan pernah dijalankan. Fungsi yang tidak punya `return` tetap menghasilkan sesuatu, yaitu `undefined` — dan lupa menuliskannya adalah penyebab nomor satu dari `map` yang menghasilkan array berisi `undefined`.',
        },
        {
          term: 'fungsi murni',
          meaning:
            'Terjemahan dari *pure function*. Fungsi yang memenuhi dua syarat: **hasilnya hanya bergantung pada argumen yang masuk**, dan **ia tidak mengubah apa pun di luar dirinya sendiri** — tidak menyentuh variabel global, tidak menulis ke layar, tidak mengirim data ke server. Akibatnya, memanggilnya sepuluh kali dengan argumen yang sama selalu memberi hasil yang sama. Jenis fungsi ini paling mudah diuji karena tidak butuh persiapan apa pun, dan React mensyaratkan komponennya berperilaku seperti ini.',
        },
        {
          term: 'ASI',
          meaning:
            'Singkatan *Automatic Semicolon Insertion*, artinya **penyisipan titik koma otomatis**. Mekanisme JavaScript yang menambahkan titik koma yang kamu lupa tulis. Biasanya menolong, tapi ada satu tempat ia menggigit: bila `return` berdiri sendiri di ujung baris, JavaScript menyisipkan titik koma tepat sesudahnya — sehingga nilai yang kamu tulis di baris berikutnya tidak pernah ikut dikembalikan.',
        },
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
      references(
        {
          label: 'Functions — JavaScript Guide',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
          source: 'MDN',
          note: 'Panduan resmi yang membahas ketiga bentuk penulisan sekaligus perbedaan hoisting-nya.',
        },
        {
          label: 'Arrow function expressions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions',
          source: 'MDN',
          note: 'Daftar resmi apa saja yang tidak dimiliki arrow function — termasuk `this` dan `arguments`.',
        },
        {
          label: 'Default parameters',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters',
          source: 'MDN',
          note: 'Menegaskan bahwa hanya `undefined` yang memicu nilai default, bukan `null`.',
        },
        {
          label: 'Rest parameters',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters',
          source: 'MDN',
          note: 'Perbandingan resmi rest parameter dengan objek `arguments` yang lama.',
        },
        {
          label: 'return',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return',
          source: 'MDN',
          note: 'Bagian "Automatic semicolon insertion" menjelaskan jebakan menaruh nilai di baris setelah `return`.',
        },
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

      terms(
        {
          term: 'scope',
          meaning:
            'Dibaca "skop", artinya **jangkauan** atau **wilayah berlaku**. Bagian kode di mana sebuah nama masih dikenali; di luar wilayah itu, memakainya menghasilkan `ReferenceError`. JavaScript punya tiga tingkat: global (seluruh program), fungsi (di dalam sebuah fungsi), dan blok (di antara sepasang kurung kurawal). Menguasai satu konsep ini menghapus sekelas bug sekaligus, karena sebagian besar pertanyaan "kenapa variabel saya tidak terbaca" adalah pertanyaan tentang scope.',
        },
        {
          term: 'scope chain',
          meaning:
            'Terjemahannya **rantai scope**. Urutan yang ditempuh JavaScript saat mencari sebuah nama: mulai dari scope terdekat, kalau tidak ketemu naik satu tingkat ke luar, naik lagi, sampai akhirnya tiba di scope global. Pencarian **berhenti pada kecocokan pertama** — itulah sebabnya variabel bernama sama di scope yang lebih dalam akan "menutupi" yang di luar, perilaku yang dalam bahasa Inggris disebut *shadowing*.',
        },
        {
          term: 'global',
          meaning:
            'Artinya **menyeluruh**. Scope terluar yang terlihat dari mana pun di dalam program. Di browser ia menempel pada objek `window`, di Node.js pada `globalThis`. Menaruh terlalu banyak hal di sini berbahaya karena dua berkas berbeda bisa memakai nama yang sama dan saling menimpa tanpa peringatan apa pun — masalah yang justru diselesaikan oleh modul ES di Sub-bab 1.13.',
        },
        {
          term: 'lexical scoping',
          meaning:
            'Dibaca "lek-si-kal skou-ping". Kata *lexical* berhubungan dengan **teks kode itu sendiri**, bukan dengan jalannya program. Aturannya: scope sebuah fungsi ditentukan oleh **tempat ia ditulis**, bukan tempat ia dipanggil. Akibat praktisnya sangat berguna — kamu bisa menentukan variabel apa saja yang bisa dilihat sebuah fungsi hanya dengan membaca berkasnya, tanpa perlu menjalankan programnya sama sekali. Ini juga fondasi yang membuat closure masuk akal.',
        },
        {
          term: 'hoisting',
          meaning:
            'Dari *hoist* yang berarti **mengangkat**. Pendataan semua deklarasi ke bagian atas scope sebelum satu baris pun dijalankan. Yang penting: yang terangkat adalah **namanya**, bukan nilainya — dan tiap bentuk deklarasi bereaksi berbeda saat diakses terlalu awal, seperti dirangkum tabel di bawah.',
        },
        {
          term: 'closure',
          meaning:
            'Dibaca "klo-syur", artinya **penutupan**. Fungsi yang tetap mengingat variabel dari lingkungan tempat ia dibuat, **bahkan setelah fungsi induknya selesai berjalan dan seharusnya sudah hilang**. Namanya berasal dari gagasan bahwa fungsi itu "menutup" dan membawa serta lingkungannya. Terdengar rumit, tapi sebenarnya ia hanyalah akibat langsung dari lexical scoping: kalau scope ditentukan oleh tempat menulis, maka fungsi tersebut memang seharusnya masih bisa melihat variabel itu.',
        },
        {
          term: 'enkapsulasi',
          meaning:
            'Dari *encapsulation*, harfiahnya **pengapsulan** — membungkus sesuatu agar tidak bisa disentuh sembarangan. Menyembunyikan data sehingga ia hanya bisa dibaca atau diubah lewat jalur yang kamu sediakan sendiri. Closure adalah cara tertua JavaScript melakukannya, dan sudah ada jauh sebelum kata kunci `class` maupun private field `#` diperkenalkan.',
        },
        {
          term: 'factory function',
          meaning:
            'Terjemahannya **fungsi pabrik**. Fungsi yang tugasnya bukan menghitung sesuatu, melainkan **membuat dan mengembalikan fungsi atau objek lain** yang sudah disetel sebelumnya. `buatFormatter("Rp")` mengembalikan sebuah fungsi baru yang selamanya memformat dengan awalan "Rp". Polanya berguna ketika kamu punya konfigurasi yang ditentukan sekali lalu dipakai berkali-kali.',
        },
        {
          term: 'debounce',
          meaning:
            'Dibaca "di-bauns". Istilahnya dipinjam dari elektronika: tombol fisik yang ditekan sekali sebenarnya menghasilkan beberapa sinyal karena logamnya memantul, dan *debouncing* adalah teknik mengabaikan pantulan itu. Di web, artinya **menunda sebuah aksi sampai pemicunya berhenti berdatangan** — misalnya baru mengirim permintaan pencarian setelah pengguna berhenti mengetik selama 300 milidetik. Tanpa ini, mengetik sepuluh huruf berarti sepuluh permintaan ke server.',
        },
        {
          term: 'shadowing',
          meaning:
            'Artinya **membayangi**. Keadaan ketika sebuah variabel di scope dalam memakai nama yang sama dengan variabel di scope luar, sehingga yang di luar jadi tidak terjangkau dari dalam. Bukan error, dan kadang memang disengaja — tapi kalau tidak disengaja, ia menghasilkan bug yang sangat membingungkan karena kodenya terlihat benar sepenuhnya.',
        },
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
      references(
        {
          label: 'Closures',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures',
          source: 'MDN',
          note: 'Penjelasan resmi closure, lengkap dengan contoh penghitung dan factory function.',
        },
        {
          label: 'Scope',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Scope',
          source: 'MDN',
          note: 'Definisi ringkas ketiga tingkat scope dalam satu halaman.',
        },
        {
          label: 'Hoisting',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Hoisting',
          source: 'MDN',
          note: 'Membedakan deklarasi mana yang bisa diakses lebih awal dan mana yang melempar error.',
        },
        {
          label: 'Grammar and types',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types',
          source: 'MDN',
          note: 'Bagian "Variable scope" dan "Variable hoisting" menjadi dasar seluruh sub-bab ini.',
        },
      ),
    ],
  ),
];
