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

/** Frontend Basic — Chapter 1, lessons 1.9 to 1.12. */
export const lessons: LessonDraft[] = [
  written(
    'array-dan-method',
    'Array & Method Penting',
    15,
    '`map`, `filter`, `reduce`, dan kawan-kawannya — cara mengolah data tanpa menulis loop manual.',
    [
      p(
        'Sebagian besar pekerjaan frontend adalah mengubah bentuk data: dari respons API menjadi daftar di layar. Method array adalah alat utamanya, dan menguasai lima di antaranya sudah menutup mayoritas kebutuhan sehari-hari.',
      ),

      terms(
        {
          term: 'array',
          meaning:
            'Dibaca "a-rei", terjemahan Indonesianya **larik**. Daftar berurutan yang menyimpan banyak nilai di dalam satu variabel, ditulis dengan kurung siku: `["apel", "jeruk", "mangga"]`. Dua sifat yang membedakannya dari object: isinya **berurutan** (elemen pertama selalu tetap pertama) dan diakses lewat **nomor posisi**, bukan nama. Hampir semua data yang datang dari server berbentuk array of object, jadi sub-bab ini adalah alat kerja harianmu nanti.',
        },
        {
          term: 'arr',
          meaning:
            'Singkatan *array*, nama parameter yang lazim dipakai di dokumentasi, tutorial, dan cheatsheet — misalnya `arr.map(fn)`. **Bukan kata kunci**, hanya kebiasaan penamaan bersama. Di kodemu sendiri, nama yang menjelaskan isinya hampir selalu lebih baik: `daftarProduk.map(...)` langsung memberi tahu pembaca apa yang sedang diolah, sementara `arr.map(...)` tidak.',
        },
        {
          term: 'fn',
          meaning:
            'Singkatan *function*. Ia menandakan bahwa di posisi itu kamu harus mengisikan sebuah **fungsi**, bukan angka atau teks. Jadi `arr.map(fn)` di cheatsheet sebenarnya berarti sesuatu seperti `daftarHarga.map((harga) => harga * 1.11)`. Sama seperti `arr`, ini **bukan kata kunci JavaScript** — ia hanya nama yang dipilih penulis dokumentasi karena pendek. Kalau kamu menemuinya di dokumentasi resmi mana pun, terjemahkan dalam hati menjadi "isi bagian ini dengan fungsi".',
        },
        {
          term: 'method',
          meaning:
            'Dibaca "me-thod", artinya **cara** atau **metode**. Fungsi yang menempel pada sebuah nilai dan dipanggil dengan tanda titik. Bedakan dari *property*: `buah.length` adalah property (sebuah nilai, tanpa kurung), sementara `buah.includes("jeruk")` adalah method (sebuah fungsi, dengan kurung). Kalau kamu lupa menuliskan kurungnya pada method, yang kamu dapat bukan hasilnya melainkan fungsinya sendiri — sumber bug yang membingungkan karena tidak ada error yang muncul.',
        },
        {
          term: 'mutasi',
          meaning:
            'Dari *mutate*, artinya **mengubah**. Perubahan yang terjadi **langsung pada data aslinya**, bukan menghasilkan data baru. `push`, `sort`, dan `splice` bermutasi; `map`, `filter`, dan `toSorted` tidak. Pembagian ini adalah bagian terpenting di seluruh sub-bab ini, karena ia yang menentukan benar atau tidaknya tampilan React nanti diperbarui.',
        },
        {
          term: 'callback',
          meaning:
            'Fungsi yang kamu serahkan ke sebuah method untuk **dijalankan olehnya**, sekali untuk setiap elemen. Pada `angka.filter((n) => n > 2)`, bagian `(n) => n > 2` adalah callback: kamu menuliskannya, tapi `filter` yang memanggilnya. Yang perlu dipahami, method itulah yang mengisi nilai `n` — kamu hanya menentukan apa yang harus dilakukan terhadapnya.',
        },
        {
          term: 'akumulator',
          meaning:
            'Dari *accumulate*, artinya **mengumpulkan** atau **menumpuk**. Nilai berjalan yang dibawa `reduce` dari satu elemen ke elemen berikutnya, seperti saldo yang terus diperbarui saat kamu menjumlah belanjaan satu per satu. Di materi ini namanya ditulis `total` atau `hasil` supaya terbaca; di dokumentasi resmi ia sering disingkat `acc`. Nilai awalnya — argumen kedua `reduce` — adalah saldo pembukaannya.',
        },
        {
          term: 'u / p / n',
          meaning:
            'Nama parameter singkat yang dipakai di contoh-contoh sub-bab ini: `u` untuk *user* (pengguna), `p` untuk *produk*, `n` untuk *number* (angka). Semuanya kebiasaan penamaan, bukan aturan. Di kode sungguhan, `(pengguna) => pengguna.nama` lebih baik daripada `(u) => u.nama` karena pembaca berikutnya tidak perlu menebak.',
        },
        {
          term: 'chaining',
          meaning:
            'Dibaca "chei-ning", artinya **merangkai seperti rantai**. Memanggil beberapa method berturut-turut dalam satu ekspresi: `.filter(...).map(...).reduce(...)`. Ini mungkin karena `filter` mengembalikan array baru, yang lalu punya method `map` sendiri, dan seterusnya. Bacalah dari kiri ke kanan seperti kalimat: "ambil produk, saring yang stoknya ada, ubah jadi nilai rupiah, lalu jumlahkan".',
        },
        {
          term: 'referensi',
          meaning:
            'Alamat menuju sebuah array atau object di dalam memori — bukan isinya, melainkan penunjuk ke tempat isinya berada. React memutuskan perlu-tidaknya menggambar ulang layar dengan membandingkan **referensi**, bukan isi. Karena `push` mengubah isi tanpa mengubah alamat, React tidak melihat perubahan apa pun dan layar tidak diperbarui — inilah alasan teknis di balik seluruh anjuran "jangan bermutasi" di sub-bab ini.',
        },
        {
          term: 'to-prefixed',
          meaning:
            'Sekelompok method baru yang namanya diawali `to`: `toSorted`, `toSpliced`, `toReversed`. Awalan itu adalah janji bahwa method tersebut **mengembalikan versi baru** dan tidak menyentuh array asli — pasangan aman dari `sort`, `splice`, dan `reverse` yang bermutasi. Ketiganya tersedia di semua browser modern dan Node.js 20 ke atas.',
        },
      ),

      h2('Dasar'),
      code(
        'js',
        `
        const buah = ['apel', 'jeruk', 'mangga'];

        buah.length;      // 3
        buah[0];          // 'apel'
        buah.at(-1);      // 'mangga' — jauh lebih jelas daripada buah[buah.length - 1]

        buah.includes('jeruk');    // true
        buah.indexOf('mangga');    // 2
        buah.indexOf('durian');    // -1 — tidak ketemu
        `,
      ),

      h2('Mengubah asli vs mengembalikan baru'),
      p(
        'Ini pembagian terpenting di seluruh bab. Method yang **mengubah array aslinya** (mutasi) berbahaya di React, karena React membandingkan referensi untuk memutuskan perlu render ulang atau tidak — array yang sama isinya berubah tidak terlihat sebagai perubahan.',
      ),
      table(
        ['Mengubah array asli (hati-hati)', 'Mengembalikan array baru (aman)'],
        [
          ['`push`, `pop`', '`concat`, `slice`'],
          ['`shift`, `unshift`', '`[...arr, item]`'],
          ['`splice`', '`toSpliced`'],
          ['`sort`', '`toSorted`'],
          ['`reverse`', '`toReversed`'],
          ['`arr[i] = x`', '`with(i, x)`'],
          ['`fill`', '`map`, `filter`'],
        ],
      ),
      code(
        'js',
        `
        const asli = [3, 1, 2];

        asli.sort();          // mengubah asli menjadi [1, 2, 3]
        const b = asli.toSorted();   // asli tetap utuh, b adalah array baru

        const c = [...asli, 4];      // tambah tanpa mutasi
        const d = asli.filter((n) => n !== 1);   // hapus tanpa mutasi
        const e = asli.with(0, 99);  // ganti elemen indeks 0 tanpa mutasi
        `,
      ),
      callout(
        'warning',
        '`sort()` mengurutkan sebagai teks',
        'Tanpa fungsi pembanding, `sort` mengubah tiap elemen jadi string. Akibatnya `[10, 9, 100].sort()` menghasilkan `[10, 100, 9]`. Untuk angka selalu beri pembanding: `.sort((a, b) => a - b)`.',
      ),

      h2('`map` — mengubah tiap elemen'),
      code(
        'js',
        `
        const harga = [10000, 25000, 5000];

        harga.map((n) => n * 1.11);
        // [11100, 27750.000000000004, 5550]

        const pengguna = [
          { nama: 'Zum', umur: 24 },
          { nama: 'Ani', umur: 30 },
        ];

        pengguna.map((u) => u.nama);   // ['Zum', 'Ani']

        // Panjang hasil SELALU sama dengan panjang masukan
        pengguna.map((u) => ({ ...u, dewasa: u.umur >= 18 }));
        `,
      ),
      callout(
        'danger',
        'Kesalahan paling sering pada `map`',
        'Lupa `return` saat memakai kurung kurawal. `arr.map(n => { n * 2 })` menghasilkan array berisi `undefined` — karena blok itu tidak mengembalikan apa pun. Pakai `n => n * 2` (return implisit) atau tulis `return`-nya.',
      ),

      h2('`filter` — menyaring'),
      code(
        'js',
        `
        const angka = [1, 2, 3, 4, 5, 6];

        angka.filter((n) => n % 2 === 0);   // [2, 4, 6]

        // Panjang hasil selalu <= panjang masukan
        angka.filter(() => true);   // salinan penuh
        angka.filter(() => false);  // []

        // Membuang nilai kosong
        ['a', '', 'b', null, 'c'].filter(Boolean);   // ['a', 'b', 'c']
        `,
      ),

      h2('`reduce` — meringkas jadi satu nilai'),
      p(
        'Method paling ampuh sekaligus paling sering disalahpahami. Ia berjalan dari kiri ke kanan sambil membawa satu nilai akumulasi.',
      ),
      code(
        'js',
        `
        const angka = [1, 2, 3, 4];

        angka.reduce((total, n) => total + n, 0);   // 10
        //            ^akumulasi  ^elemen     ^nilai awal

        // Langkah demi langkah:
        // total=0, n=1 -> 1
        // total=1, n=2 -> 3
        // total=3, n=3 -> 6
        // total=6, n=4 -> 10
        `,
      ),
      code(
        'js',
        `
        // Hasilnya tidak harus angka — inilah yang membuat reduce ampuh
        const pesanan = [
          { kategori: 'makanan', harga: 20000 },
          { kategori: 'minuman', harga: 8000 },
          { kategori: 'makanan', harga: 15000 },
        ];

        // Kelompokkan per kategori
        pesanan.reduce((hasil, item) => {
          hasil[item.kategori] ??= [];
          hasil[item.kategori].push(item);
          return hasil;                       // JANGAN LUPA return
        }, {});
        // { makanan: [...2 item], minuman: [...1 item] }
        `,
      ),
      callout(
        'tip',
        'Untuk pengelompokan, sekarang ada cara yang lebih pendek',
        '`Object.groupBy(pesanan, (item) => item.kategori)` melakukan hal yang sama dalam satu baris. Tetap pelajari `reduce` — ia dipakai untuk banyak hal lain — tapi jangan pakai `reduce` kalau ada method yang namanya langsung menjelaskan maksudnya.',
      ),
      callout(
        'warning',
        'Nilai awal bukan opsional dalam praktik',
        '`reduce` tanpa nilai awal akan melempar `TypeError` pada array kosong. Selalu beri nilai awal — `0`, `[]`, atau `{}` sesuai bentuk hasilnya.',
      ),

      h2('`find`, `some`, `every`'),
      code(
        'js',
        `
        const pengguna = [
          { id: 1, nama: 'Zum', aktif: true },
          { id: 2, nama: 'Ani', aktif: false },
        ];

        pengguna.find((u) => u.id === 2);        // { id: 2, ... } — elemennya
        pengguna.findIndex((u) => u.id === 2);   // 1               — posisinya
        pengguna.find((u) => u.id === 99);       // undefined

        pengguna.some((u) => u.aktif);           // true  — minimal satu
        pengguna.every((u) => u.aktif);          // false — harus semua

        // Ketiganya berhenti begitu jawabannya pasti — tidak menelusuri sisanya
        `,
      ),
      callout(
        'info',
        'Bedakan `find` dan `filter`',
        '`find` mengembalikan **satu elemen** atau `undefined`. `filter` selalu mengembalikan **array**, bahkan kalau hanya ada satu hasil. `filter(...)[0]` adalah tanda bahwa yang kamu butuhkan sebenarnya `find`.',
      ),

      h2('Merangkai method'),
      code(
        'js',
        `
        const produk = [
          { nama: 'Kaos', harga: 80000, stok: 3 },
          { nama: 'Topi', harga: 45000, stok: 0 },
          { nama: 'Tas', harga: 250000, stok: 7 },
        ];

        const totalTersedia = produk
          .filter((p) => p.stok > 0)
          .map((p) => p.harga * p.stok)
          .reduce((total, n) => total + n, 0);
        // 240000 + 1750000 = 1990000
        `,
      ),
      callout(
        'tip',
        'Kapan rantai jadi terlalu panjang',
        'Lebih dari tiga sampai empat langkah biasanya lebih baik dipecah ke variabel bernama. `const tersedia = produk.filter(...)` memberi nama pada langkah tengah, dan nama itu adalah dokumentasi yang tidak bisa basi.',
      ),

      h2('Meratakan array bersarang'),
      code(
        'js',
        `
        [1, [2, [3, [4]]]].flat();           // [1, 2, [3, [4]]]  — satu tingkat
        [1, [2, [3, [4]]]].flat(Infinity);   // [1, 2, 3, 4]

        // flatMap = map lalu flat satu tingkat
        ['a b', 'c d'].flatMap((s) => s.split(' '));   // ['a', 'b', 'c', 'd']
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Bedakan method yang mengubah asli dari yang mengembalikan baru — ini penentu di React.',
        '`sort()` tanpa pembanding mengurutkan sebagai teks; untuk angka pakai `(a, b) => a - b`.',
        '`map` selalu menghasilkan panjang yang sama; `filter` selalu lebih pendek atau sama.',
        'Lupa `return` di dalam kurung kurawal adalah kesalahan `map` nomor satu.',
        '`reduce` selalu diberi nilai awal — array kosong tanpa nilai awal melempar error.',
        '`filter(...)[0]` artinya kamu sebenarnya butuh `find`.',
      ),
      references(
        {
          label: 'Array',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
          source: 'MDN',
          note: 'Daftar lengkap seluruh method array, dengan penanda mana yang mengubah array asli.',
        },
        {
          label: 'Array.prototype.map()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa panjang hasilnya selalu sama dengan panjang masukan.',
        },
        {
          label: 'Array.prototype.reduce()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce',
          source: 'MDN',
          note: 'Menjelaskan resmi kenapa `reduce` tanpa nilai awal melempar error pada array kosong.',
        },
        {
          label: 'Array.prototype.sort()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
          source: 'MDN',
          note: 'Sumber resmi untuk perilaku "diurutkan sebagai teks" saat pembandingnya tidak diberikan.',
        },
        {
          label: 'Object.groupBy()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy',
          source: 'MDN',
          note: 'Alternatif ringkas untuk pengelompokan yang biasanya ditulis dengan `reduce`.',
        },
      ),
    ],
  ),

  written(
    'object',
    'Object: literal, nested, `?.`, `??`',
    12,
    'Membuat dan membaca object, termasuk mengakses data bersarang tanpa risiko error.',
    [
      p(
        'Object adalah kumpulan pasangan kunci–nilai, dan bentuk data paling umum yang akan kamu terima dari API. Bab ini fokus pada membacanya dengan aman — karena data dari luar hampir tidak pernah selengkap yang kamu harapkan.',
      ),

      terms(
        {
          term: 'object',
          meaning:
            'Dibaca "ob-jek", terjemahannya **objek**. Kumpulan pasangan nama–nilai yang ditulis di antara kurung kurawal: `{ nama: "Zum", umur: 24 }`. Bedanya dengan array ada pada cara mengambil isinya — array memakai **nomor posisi**, object memakai **nama**. Karena itu object cocok untuk data yang setiap bagiannya punya arti berbeda, sementara array cocok untuk banyak hal sejenis. Ini bentuk data yang paling sering kamu terima dari server.',
        },
        {
          term: 'property',
          meaning:
            'Dibaca "pro-per-ti", artinya **sifat** atau **atribut**. Satu pasangan nama–nilai di dalam object. Pada `{ nama: "Zum" }`, keseluruhan `nama: "Zum"` adalah sebuah property. Kata ini juga dipakai untuk hal yang menempel pada nilai lain: `teks.length` adalah property dari sebuah string.',
        },
        {
          term: 'key / value',
          meaning:
            'Terjemahannya **kunci** dan **nilai**. Kunci adalah nama sebuah property, nilai adalah isinya — pada `{ umur: 24 }`, `umur` kuncinya dan `24` nilainya. Disebut kunci karena fungsinya memang seperti kunci lemari: ia yang membuka akses ke isi tertentu. Tiga fungsi bawaan bekerja berdasarkan pembagian ini: `Object.keys()` mengambil daftar kuncinya, `Object.values()` daftar nilainya, dan `Object.entries()` pasangan keduanya.',
        },
        {
          term: 'literal',
          meaning:
            'Artinya **apa adanya, secara harfiah**. Cara menuliskan sebuah nilai langsung di dalam kode alih-alih membuatnya lewat fungsi. `{ nama: "Zum" }` disebut *object literal* karena objectnya ditulis begitu saja; `[1, 2, 3]` adalah *array literal*; dan `"halo"` adalah *string literal*. Istilah ini akan muncul lagi sebagai *template literal* di Sub-bab 1.12.',
        },
        {
          term: 'shorthand',
          meaning:
            'Artinya **bentuk singkat**. Kalau nama variabel kebetulan sama persis dengan nama property yang ingin kamu buat, `{ nama: nama }` boleh disingkat menjadi `{ nama }` saja. Ada juga bentuk singkat untuk method: `{ sapa() { ... } }` menggantikan `{ sapa: function () { ... } }`. Kamu akan melihat kedua bentuk ini di hampir setiap kode React.',
        },
        {
          term: 'nested',
          meaning:
            'Dibaca "nes-ted", artinya **bersarang** — object yang berada di dalam object lain. `pengguna.alamat.kota` menembus dua tingkat sarang sekaligus. Semakin dalam sarangnya, semakin besar kemungkinan salah satu tingkat ternyata tidak ada pada data sungguhan, dan di situlah `?.` menjadi penyelamat.',
        },
        {
          term: 'API',
          meaning:
            'Singkatan *Application Programming Interface*. Dalam konteks sub-bab ini artinya **layanan di server yang mengirimkan data ke aplikasimu**, biasanya dalam bentuk JSON yang berubah menjadi object begitu diterima. Yang perlu diingat: data dari API adalah data dari luar, dan data dari luar hampir tidak pernah selengkap yang dijanjikan dokumentasinya.',
        },
        {
          term: 'JSON',
          meaning:
            'Singkatan *JavaScript Object Notation*, dibaca "je-son". Format teks untuk bertukar data yang bentuknya sengaja dibuat menyerupai object literal JavaScript. Perbedaan yang sering menjebak: di JSON, **setiap kunci wajib memakai tanda kutip ganda**, dan tidak boleh ada fungsi, komentar, maupun koma di akhir daftar.',
        },
        {
          term: 'o',
          meaning:
            'Nama variabel singkat untuk *object*, dipakai di contoh-contoh pendek agar perhatian tertuju pada bentuk sintaksnya. Seperti `arr` dan `fn`, ini kebiasaan penamaan — bukan aturan bahasa.',
        },
        {
          term: 'in',
          meaning:
            'Operator yang menjawab satu pertanyaan: **"apakah kunci ini ada di object tersebut?"** Ditulis `"a" in o`. Bedanya dengan mengecek nilainya sangat halus tapi penting — `in` menjawab `true` meski isinya `undefined`, karena yang ia periksa memang keberadaan kuncinya, bukan isinya. Untuk pengecekan yang lebih tepat pada kunci milik object itu sendiri, pakai `Object.hasOwn(o, "a")`.',
        },
      ),

      h2('Membuat object'),
      code(
        'js',
        `
        const nama = 'Zum';
        const umur = 24;

        const pengguna = {
          nama,                    // shorthand — sama dengan nama: nama
          umur,
          alamat: {
            kota: 'Bandung',
            pos: '40123',
          },
          sapa() {                 // shorthand method
            return \`Halo, saya \${this.nama}\`;
          },
        };

        // Kunci dinamis
        const field = 'email';
        const data = { [field]: 'a@b.c' };   // { email: 'a@b.c' }
        `,
      ),

      h2('Membaca: titik vs kurung siku'),
      code(
        'js',
        `
        pengguna.nama;             // 'Zum'  — kalau kunci sudah pasti
        pengguna['nama'];          // 'Zum'  — sama saja

        const kunci = 'umur';
        pengguna[kunci];           // 24     — WAJIB kurung siku kalau kunci dari variabel
        pengguna.kunci;            // undefined — mencari kunci bernama "kunci"

        // Kunci yang tidak bisa ditulis dengan titik
        const konfig = { 'max-size': 10 };
        konfig['max-size'];        // 10
        `,
      ),

      h2('Optional chaining — jangan biarkan aplikasi jatuh'),
      p(
        'Mengakses property dari `undefined` melempar `TypeError` yang menghentikan seluruh eksekusi. Pada data dari API, itu kejadian rutin.',
      ),
      code(
        'js',
        `
        const respons = { pengguna: { nama: 'Zum' } };   // tanpa 'alamat'

        respons.pengguna.alamat.kota;      // TypeError: Cannot read properties of undefined
        respons.pengguna?.alamat?.kota;    // undefined — berhenti dengan tenang

        // Bekerja juga untuk fungsi dan indeks array
        respons.hitung?.();                // undefined kalau hitung tidak ada
        respons.daftar?.[0];               // undefined kalau daftar tidak ada
        `,
      ),
      callout(
        'warning',
        'Jangan taburkan `?.` di mana-mana',
        '`?.` menyembunyikan ketiadaan data. Kalau sebuah field **seharusnya selalu ada**, ketiadaannya adalah bug yang perlu terlihat, bukan diredam. Pakai `?.` untuk field yang memang opsional; untuk yang wajib, validasi bentuk datanya di batas masuk.',
      ),

      h2('`??` bersama `?.`'),
      code(
        'js',
        `
        const kota = respons.pengguna?.alamat?.kota ?? 'Tidak diketahui';

        // Perhatikan bedanya pada nilai nol
        const stok = { jumlah: 0 };
        stok.jumlah || 'habis';    // 'habis'  <- SALAH — nol itu jumlah yang sah
        stok.jumlah ?? 'habis';    // 0        <- BENAR
        `,
      ),

      h2('Menelusuri isi object'),
      code(
        'js',
        `
        const skor = { matematika: 90, fisika: 75, kimia: 82 };

        Object.keys(skor);      // ['matematika', 'fisika', 'kimia']
        Object.values(skor);    // [90, 75, 82]
        Object.entries(skor);   // [['matematika', 90], ['fisika', 75], ['kimia', 82]]

        // entries + method array = alat paling berguna untuk object
        for (const [mapel, nilai] of Object.entries(skor)) {
          console.log(\`\${mapel}: \${nilai}\`);
        }

        const rataRata =
          Object.values(skor).reduce((a, b) => a + b, 0) / Object.values(skor).length;
        // 82.33333333333333

        // Menyaring object lewat entries lalu dirakit kembali
        Object.fromEntries(Object.entries(skor).filter(([, nilai]) => nilai >= 80));
        // { matematika: 90, kimia: 82 }
        `,
      ),

      h2('Mengecek keberadaan kunci'),
      code(
        'js',
        `
        const o = { a: 1, b: undefined };

        'a' in o;                    // true
        'b' in o;                    // true  — kuncinya ada, isinya undefined
        'c' in o;                    // false

        o.b !== undefined;           // false — TIDAK membedakan "tidak ada" dari "ada tapi undefined"
        Object.hasOwn(o, 'b');       // true  — cara paling tepat
        `,
      ),

      h2('Menyalin dan menggabung'),
      code(
        'js',
        `
        const dasar = { nama: 'Zum', level: 1 };

        const salinan = { ...dasar };              // salinan dangkal
        const diubah = { ...dasar, level: 2 };     // yang belakangan menang
        const gabung = { ...dasar, ...{ kota: 'Bandung' } };

        // Dangkal berarti object di dalamnya masih dibagi
        const asli = { profil: { kota: 'Bandung' } };
        const dangkal = { ...asli };
        dangkal.profil.kota = 'Jakarta';
        asli.profil.kota;             // 'Jakarta' — ikut berubah

        const dalam = structuredClone(asli);
        dalam.profil.kota = 'Surabaya';
        asli.profil.kota;             // 'Jakarta' — aman
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Kunci dari variabel wajib memakai kurung siku, bukan titik.',
        '`?.` mencegah aplikasi jatuh pada data yang tidak lengkap — tapi jangan pakai untuk field yang wajib ada.',
        '`??` menghormati `0` dan `""`; `||` menganggap keduanya kosong.',
        '`Object.entries()` + method array adalah kombinasi paling berguna untuk mengolah object.',
        '`Object.hasOwn()` membedakan "kunci tidak ada" dari "ada tapi `undefined`".',
        'Spread menyalin satu lapis; `structuredClone` menyalin seluruhnya.',
      ),
      references(
        {
          label: 'Working with objects',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects',
          source: 'MDN',
          note: 'Panduan resmi membuat, membaca, dan menelusuri object dari awal.',
        },
        {
          label: 'Object.entries()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries',
          source: 'MDN',
          note: 'Pasangan `Object.keys()` dan `Object.values()` ada di halaman yang sama tautannya.',
        },
        {
          label: 'Object.hasOwn()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn',
          source: 'MDN',
          note: 'Menjelaskan kenapa ia menggantikan `hasOwnProperty` yang lama.',
        },
        {
          label: 'Property accessors',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors',
          source: 'MDN',
          note: 'Aturan resmi kapan harus memakai titik dan kapan wajib kurung siku.',
        },
        {
          label: 'Object.fromEntries()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries',
          source: 'MDN',
          note: 'Kebalikan dari `Object.entries()` — dipakai untuk merakit object hasil penyaringan.',
        },
      ),
    ],
  ),

  written(
    'destructuring-spread',
    'Destructuring, Spread & Rest',
    11,
    'Sintaks yang akan kamu lihat di hampir setiap baris kode React modern.',
    [
      p(
        'Tiga sintaks ini tidak menambah kemampuan baru — semuanya bisa ditulis dengan cara lama. Yang mereka tambahkan adalah **kejelasan**, dan itu sebabnya mereka ada di mana-mana. Memahaminya adalah syarat untuk bisa membaca kode React.',
      ),

      terms(
        {
          term: 'destructuring',
          meaning:
            'Dibaca "di-strak-cer-ing", harfiahnya **membongkar struktur**. Mengambil beberapa nilai dari dalam sebuah object atau array sekaligus, lalu memberi masing-masing nama tersendiri. Bayangkan membuka kardus paket dan langsung menaruh isinya di rak masing-masing, alih-alih menyebut "isi kardus nomor satu" setiap kali membutuhkannya. Aturan pembedanya: destructuring object bekerja berdasarkan **nama**, destructuring array berdasarkan **posisi**.',
        },
        {
          term: 'spread',
          meaning:
            'Dibaca "spred", artinya **menyebar** atau **menumpahkan**. Tanda `...` yang menumpahkan isi sebuah array atau object ke tempat baru: `[...a, ...b]` menghasilkan satu array berisi seluruh elemen keduanya. Yang penting diingat, ia menumpahkan **satu lapis saja** — object yang berada di dalam object tetap dibagi bersama aslinya.',
        },
        {
          term: 'rest',
          meaning:
            'Artinya **sisa**. Tanda `...` yang justru **mengumpulkan** nilai-nilai yang tersisa menjadi satu: `const [utama, ...sisanya] = [1, 2, 3, 4]` membuat `sisanya` bernilai `[2, 3, 4]`. Simbolnya sama persis dengan spread dan tugasnya berkebalikan, sehingga pemula sering tertukar. Cara membedakannya ada di bagian akhir sub-bab ini, dan intinya cuma satu: lihat ia berada di sisi mana.',
        },
        {
          term: 'alias',
          meaning:
            'Artinya **nama samaran** atau **nama pengganti**. `const { nama: namaLengkap } = pengguna` mengambil property bernama `nama` tapi menyimpannya ke variabel bernama `namaLengkap`. Berguna ketika nama aslinya terlalu umum, bertabrakan dengan variabel yang sudah ada, atau kurang menjelaskan dalam konteks barunya.',
        },
        {
          term: 'props',
          meaning:
            'Singkatan *properties*, dibaca "props". Di React, sebuah object tunggal yang berisi **seluruh data yang dikirim dari komponen induk ke komponen anak** — mirip atribut pada tag HTML. Pola `function Tombol({ label, ukuran })` yang akan kamu tulis ribuan kali nanti pada dasarnya hanyalah destructuring object yang kamu pelajari di sub-bab ini, diterapkan pada props.',
        },
        {
          term: 'useState',
          meaning:
            'Fungsi bawaan React yang mengembalikan **array berisi dua elemen**: nilai yang sedang disimpan, dan fungsi untuk mengubahnya. Karena hasilnya array, ia selalu ditulis dengan destructuring array — dan karena berbasis posisi, kamu bebas menamai keduanya apa saja. `const [hitungan, setHitungan] = useState(0)` dan `const [n, setN] = useState(0)` sama sahnya; kebiasaan `setXxx` murni kesepakatan komunitas.',
        },
        {
          term: 'x / y / a / b',
          meaning:
            'Nama variabel satu huruf yang sengaja dipakai di contoh singkat tentang sintaks, supaya perhatian pembaca tertuju pada **bentuk penulisannya**, bukan pada makna datanya. Di kode sungguhan, nama sependek ini hampir selalu keputusan yang buruk.',
        },
        {
          term: 'swap',
          meaning:
            'Artinya **menukar**. Baris `[x, y] = [y, x]` menukar isi dua variabel tanpa memerlukan variabel bantu sama sekali — sesuatu yang di banyak bahasa lain butuh tiga baris. Ini salah satu contoh paling ringkas bahwa destructuring bukan sekadar penghematan tulisan.',
        },
      ),

      h2('Destructuring object'),
      code(
        'js',
        `
        const pengguna = { nama: 'Zum', umur: 24, kota: 'Bandung' };

        // Cara lama
        const nama = pengguna.nama;
        const umur = pengguna.umur;

        // Destructuring
        const { nama, umur } = pengguna;

        // Ganti nama variabel
        const { nama: namaLengkap } = pengguna;   // namaLengkap === 'Zum'

        // Nilai default untuk kunci yang mungkin tidak ada
        const { negara = 'Indonesia' } = pengguna;   // 'Indonesia'

        // Bersarang
        const data = { profil: { alamat: { kota: 'Bandung' } } };
        const { profil: { alamat: { kota } } } = data;   // kota === 'Bandung'
        `,
      ),
      callout(
        'warning',
        'Destructuring bersarang tidak aman terhadap data kosong',
        'Kalau `profil` tidak ada, baris terakhir di atas melempar `TypeError`. Beri default di tiap tingkat — `const { profil: { alamat = {} } = {} } = data;` — atau lebih sederhana, pakai `?.` biasa untuk data yang tidak terjamin bentuknya.',
      ),

      h2('Destructuring array'),
      code(
        'js',
        `
        const warna = ['merah', 'hijau', 'biru'];

        const [pertama, kedua] = warna;        // 'merah', 'hijau'
        const [, , ketiga] = warna;            // 'biru' — koma kosong melewati posisi
        const [a = 'x', b = 'y'] = ['ada'];    // 'ada', 'y'

        // Menukar dua nilai tanpa variabel bantu
        let x = 1, y = 2;
        [x, y] = [y, x];                       // x=2, y=1
        `,
      ),
      callout(
        'info',
        'Inilah yang terjadi pada `useState`',
        '`const [nilai, setNilai] = useState(0)` adalah destructuring array. `useState` mengembalikan array dua elemen, dan kamu memberi nama pada keduanya. Karena berbasis posisi, kamu bebas menamainya apa saja — dan itu sebabnya `[hitungan, setHitungan]` sama sahnya.',
      ),

      h2('Destructuring di parameter fungsi'),
      code(
        'js',
        `
        // Tanpa destructuring
        function tampilkan(pengguna) {
          return \`\${pengguna.nama} (\${pengguna.umur})\`;
        }

        // Dengan destructuring — kontraknya terbaca dari tanda tangan fungsi
        function tampilkan({ nama, umur }) {
          return \`\${nama} (\${umur})\`;
        }

        // Dengan default, aman dipanggil tanpa argumen
        function buatKartu({ judul = 'Tanpa judul', warna = 'abu' } = {}) {
          return \`\${judul} — \${warna}\`;
        }

        buatKartu();                      // 'Tanpa judul — abu'
        buatKartu({ judul: 'Halo' });     // 'Halo — abu'
        `,
      ),
      p(
        'Pola terakhir itu persis yang dipakai komponen React: `function Tombol({ label, ukuran = "md" })`.',
      ),

      h2('Spread — menyebar isi'),
      code(
        'js',
        `
        const a = [1, 2];
        const b = [3, 4];

        [...a, ...b];             // [1, 2, 3, 4]
        [0, ...a];                // [0, 1, 2]
        [...'halo'];              // ['h', 'a', 'l', 'o']

        const dasar = { x: 1 };
        const ditambah = { ...dasar, y: 2 };   // { x: 1, y: 2 }
        const ditimpa = { ...dasar, x: 9 };    // { x: 9 }  — yang belakangan menang

        // Mengoper array sebagai argumen terpisah
        Math.max(...[3, 7, 2]);   // 7
        `,
      ),

      h2('Rest — mengumpulkan sisa'),
      p(
        'Sintaksnya identik dengan spread (`...`), tapi tugasnya kebalikan: mengumpulkan, bukan menyebar.',
      ),
      code(
        'js',
        `
        const [utama, ...sisanya] = [1, 2, 3, 4];
        // utama = 1, sisanya = [2, 3, 4]

        const { id, ...tanpaId } = { id: 7, nama: 'Zum', kota: 'Bandung' };
        // id = 7, tanpaId = { nama: 'Zum', kota: 'Bandung' }

        function total(...angka) {
          return angka.reduce((a, b) => a + b, 0);
        }
        total(1, 2, 3);   // 6
        `,
      ),
      callout(
        'tip',
        'Cara membedakan spread dan rest',
        'Lihat posisinya. Di **sisi kanan** penugasan atau di dalam pemanggilan fungsi → **spread** (menyebar). Di **sisi kiri** penugasan atau di daftar parameter → **rest** (mengumpulkan).',
      ),
      code(
        'jsx',
        `
        // Pola yang sangat sering dipakai: buang satu field, teruskan sisanya
        function Tombol({ variant, ...propsSisanya }) {
          return <button className={kelas[variant]} {...propsSisanya} />;
        }
        `,
        { filename: 'Tombol.jsx' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Destructuring object berbasis **nama**; destructuring array berbasis **posisi**.',
        'Nilai default hanya terpicu oleh `undefined`, bukan `null`.',
        'Destructuring bersarang butuh default di tiap tingkat, atau pakai `?.` saja.',
        '`{ ... } = {}` di parameter membuat fungsi aman dipanggil tanpa argumen.',
        'Spread menyebar (kanan), rest mengumpulkan (kiri).',
        'Spread menyalin satu lapis saja — object di dalamnya masih dibagi.',
      ),
      references(
        {
          label: 'Destructuring assignment',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring',
          source: 'MDN',
          note: 'Semua bentuk destructuring — object, array, bersarang, default, dan alias — di satu halaman.',
        },
        {
          label: 'Spread syntax (...)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax',
          source: 'MDN',
          note: 'Termasuk penegasan resmi bahwa spread hanya menyalin satu lapis.',
        },
        {
          label: 'Rest parameters',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters',
          source: 'MDN',
          note: 'Sisi "mengumpulkan" dari tanda `...`, dibandingkan langsung dengan spread.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dokumentasi resmi React yang memakai persis pola destructuring dan rest dari sub-bab ini.',
        },
      ),
    ],
  ),

  written(
    'string-dan-template-literal',
    'Template Literal & Method String',
    9,
    'Merangkai teks dengan rapi, plus method string yang paling sering dipakai.',
    [
      p(
        'Teks adalah hal yang paling sering kamu tampilkan ke pengguna. Bab ini pendek, tapi isinya dipakai setiap hari.',
      ),

      terms(
        {
          term: 'string',
          meaning:
            'Dibaca "string", terjemahannya **teks** atau harfiahnya "untaian". Rangkaian karakter yang ditulis di antara tanda kutip: `\'halo\'`, `"halo"`, atau `` `halo` ``. Nama "untaian" itu tepat — sebuah string memang dianggap sebagai deretan karakter yang berurutan, sehingga ia punya `length` dan bisa ditelusuri per karakter dengan `for...of`, persis seperti array.',
        },
        {
          term: 'backtick',
          meaning:
            'Dibaca "bek-tik", kadang disebut *aksen kuburan* dalam tipografi. Tanda kutip miring `` ` `` yang letaknya di sebelah kiri angka 1 pada kebanyakan keyboard, satu tombol dengan tilde `~`. Perhatikan baik-baik: ia **berbeda** dari tanda kutip tunggal `\'`, dan hanya tanda inilah yang mengaktifkan kemampuan template literal. Salah memakai kutip tunggal adalah penyebab paling umum `${ }` muncul apa adanya di layar.',
        },
        {
          term: 'template literal',
          meaning:
            'Terjemahan bebasnya **teks bercetakan**. Teks yang ditulis di antara sepasang backtick, sehingga memperoleh dua kemampuan yang tidak dimiliki kutip biasa: **menyisipkan nilai** dengan `${ }`, dan **menulis beberapa baris** langsung tanpa perlu `\\n`. Di dalam `${ }` boleh diisi ekspresi apa pun — perhitungan, pemanggilan fungsi, bahkan ternary.',
        },
        {
          term: 'interpolasi',
          meaning:
            'Dari *interpolation*, artinya **penyisipan di antara**. Bagian `${nama}` di dalam template literal adalah interpolasi: nilai variabel disisipkan ke tengah teks pada saat teks itu dibuat. Istilah yang sama dipakai di banyak bahasa lain dengan sintaks berbeda, jadi mengenalinya akan membantu saat kamu membaca dokumentasi di luar JavaScript.',
        },
        {
          term: 'immutable',
          meaning:
            'Artinya **tidak bisa diubah isinya**. String di JavaScript bersifat immutable, dan konsekuensinya sangat praktis: **setiap method string mengembalikan string baru dan tidak pernah menyentuh yang lama**. Karena itu menulis `s.trim();` sendirian tidak melakukan apa-apa yang terlihat — hasilnya dibuang begitu saja. Kamu harus menyimpannya: `const bersih = s.trim();`. Ini kesalahan yang sangat mudah terlewat karena tidak memunculkan error apa pun.',
        },
        {
          term: 'trim',
          meaning:
            'Artinya **memangkas**. `trim()` membuang spasi, tab, dan baris baru di awal maupun akhir teks — tanpa menyentuh yang di tengah. Variannya: `trimStart()` hanya memangkas bagian depan, `trimEnd()` hanya bagian belakang. Ini nyaris selalu langkah pertama saat memproses apa pun yang diketik pengguna, karena spasi yang tidak sengaja terikut sangat umum.',
        },
        {
          term: 'pad',
          meaning:
            'Artinya **mengganjal** atau **melapisi**. `padStart(2, "0")` menambahkan karakter di **depan** sampai panjang totalnya tercapai, sehingga `"9"` menjadi `"09"`; `padEnd` melakukannya di belakang. Pemakaian sehari-harinya adalah menyeragamkan tampilan jam, tanggal, dan nomor urut supaya rata dan tidak melompat-lompat.',
        },
        {
          term: 'Intl',
          meaning:
            'Singkatan dari *Internationalization* — kata yang begitu panjang sehingga di dunia perangkat lunak biasa disingkat menjadi "i18n" (i, lalu 18 huruf, lalu n). Objek bawaan JavaScript yang **sudah tahu aturan penulisan angka, mata uang, dan tanggal untuk hampir semua bahasa di dunia**. Memakainya berarti kamu tidak perlu menulis sendiri logika pemisah ribuan atau nama bulan, dan hasilnya otomatis mengikuti pengaturan perangkat pembacamu.',
        },
        {
          term: 'locale',
          meaning:
            'Dibaca "lo-kal", artinya **setelan kebahasaan dan kewilayahan**. Kode pendek seperti `id-ID` (bahasa Indonesia, wilayah Indonesia) atau `en-US` (Inggris, Amerika). Bagian pertama adalah bahasanya, bagian kedua wilayahnya — dan wilayah itu penting, karena kode inilah yang memutuskan apakah satu juta setengah ditulis `1.000.000,5` atau `1,000,000.5`.',
        },
        {
          term: 's',
          meaning:
            'Nama variabel singkat untuk *string*, dipakai di contoh pendek supaya perhatian tertuju pada method yang sedang dibahas. Kebiasaan penamaan, bukan aturan bahasa.',
        },
        {
          term: 'replace / replaceAll',
          meaning:
            'Artinya **mengganti**. Perbedaannya sering menjebak: `replace("-", "+")` hanya mengganti **kemunculan pertama**, sementara `replaceAll("-", "+")` mengganti **semuanya**. Kalau kamu pernah bingung kenapa hanya satu tanda yang berubah, jawabannya ada di sini.',
        },
      ),

      h2('Template literal'),
      code(
        'js',
        `
        const nama = 'Zum';
        const jumlah = 3;

        // Cara lama
        'Halo ' + nama + ', kamu punya ' + jumlah + ' pesan';

        // Template literal — pakai backtick
        \`Halo \${nama}, kamu punya \${jumlah} pesan\`;

        // Ekspresi apa pun boleh di dalam \${ }
        \`Total: \${jumlah * 2}\`;
        \`Status: \${jumlah > 0 ? 'ada' : 'kosong'}\`;

        // Multi-baris tanpa \\n
        \`Baris satu
        Baris dua\`;
        `,
      ),
      callout(
        'warning',
        'Indentasi ikut terbawa',
        'Semua spasi di awal baris kedua dan seterusnya ikut masuk ke dalam string. Kalau format teksnya penting — misalnya untuk `<pre>` — rapatkan ke kiri atau bersihkan dengan `.trim()` per baris.',
      ),

      h2('Method yang paling sering dipakai'),
      code(
        'js',
        `
        const s = '  Halo Dunia  ';

        s.trim();                  // 'Halo Dunia'
        s.trimStart();             // 'Halo Dunia  '
        s.length;                  // 14 (termasuk spasi)

        'halo'.toUpperCase();      // 'HALO'
        'HALO'.toLowerCase();      // 'halo'

        'a-b-c'.split('-');        // ['a', 'b', 'c']
        'halo'.split('');          // ['h', 'a', 'l', 'o']
        ['a', 'b'].join('-');      // 'a-b'

        'halo dunia'.slice(0, 4);  // 'halo'
        'halo dunia'.slice(-5);    // 'dunia'
        'halo'.at(-1);             // 'o'
        `,
      ),

      h2('Mencari dan mengganti'),
      code(
        'js',
        `
        const judul = 'Belajar JavaScript dari Nol';

        judul.includes('JavaScript');    // true
        judul.startsWith('Belajar');     // true
        judul.endsWith('Nol');           // true
        judul.indexOf('dari');           // 19

        'a-b-c'.replace('-', '+');       // 'a+b-c'    — hanya yang pertama
        'a-b-c'.replaceAll('-', '+');    // 'a+b+c'    — semua
        `,
      ),
      callout(
        'tip',
        'Pencarian yang mengabaikan huruf besar-kecil',
        'Samakan dulu kedua sisinya: `judul.toLowerCase().includes(kata.toLowerCase())`. Ini pola yang dipakai kotak pencarian di website ini sendiri.',
      ),

      h2('Melengkapi dan mengulang'),
      code(
        'js',
        `
        String(7).padStart(2, '0');     // '07'  — untuk jam, tanggal, nomor urut
        'ab'.padEnd(5, '.');            // 'ab...'
        '-'.repeat(20);                 // '--------------------'

        // Contoh nyata: format jam
        const jam = 9, menit = 5;
        \`\${String(jam).padStart(2, '0')}.\${String(menit).padStart(2, '0')}\`;   // '09.05'
        `,
      ),

      h2('Format angka & tanggal berbahasa Indonesia'),
      p(
        'Jangan pernah merangkai format tanggal atau pemisah ribuan dengan tangan. `Intl` sudah tahu aturan tiap bahasa, dan ia mengikuti pengaturan perangkat pembaca.',
      ),
      code(
        'js',
        `
        (1234567.891).toLocaleString('id-ID');
        // '1.234.567,891'

        (250000).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
        // 'Rp250.000,00'

        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(250000);
        // 'Rp250.000'

        new Intl.DateTimeFormat('id-ID', {
          dateStyle: 'long',
        }).format(new Date('2026-08-02'));
        // '2 Agustus 2026'
        `,
      ),
      callout(
        'info',
        'String tidak bisa diubah isinya',
        'Semua method di atas mengembalikan string **baru**; tidak ada satu pun yang mengubah aslinya. `s.trim()` tanpa menyimpan hasilnya tidak melakukan apa-apa — kesalahan yang mudah terlewat.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Template literal memakai backtick dan `${ }`; multi-baris tanpa `\\n`.',
        'Indentasi di dalam template literal ikut terbawa ke dalam string.',
        '`replaceAll` mengganti semua; `replace` hanya yang pertama.',
        '`padStart` untuk nomor urut, jam, dan tanggal.',
        'Pakai `Intl` untuk angka dan tanggal — jangan pernah merangkainya sendiri.',
        'String tidak bisa diubah: setiap method mengembalikan string baru.',
      ),
      references(
        {
          label: 'Template literals',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals',
          source: 'MDN',
          note: 'Aturan resmi backtick, `${ }`, multi-baris, dan tagged template.',
        },
        {
          label: 'String',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
          source: 'MDN',
          note: 'Daftar seluruh method string, dengan penegasan bahwa string bersifat immutable.',
        },
        {
          label: 'String.prototype.replaceAll()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll',
          source: 'MDN',
          note: 'Menjelaskan bedanya dengan `replace` yang hanya mengganti kemunculan pertama.',
        },
        {
          label: 'Intl.NumberFormat',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat',
          source: 'MDN',
          note: 'Seluruh opsi format angka dan mata uang, termasuk `style: "currency"`.',
        },
        {
          label: 'Intl.DateTimeFormat',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
          source: 'MDN',
          note: 'Pilihan `dateStyle` dan `timeStyle` untuk menulis tanggal sesuai kebiasaan tiap locale.',
        },
      ),
    ],
  ),
];
