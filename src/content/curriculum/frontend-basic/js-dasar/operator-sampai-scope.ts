import {
  callout,
  code,
  compare,
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
    17,
    'Operator aritmetika, perbandingan, dan logika — plus aturan konversi tipe otomatis yang jadi sumber banyak kejutan.',
    [
      p(
        'JavaScript adalah bahasa bertipe dinamis dan **longgar**. Dinamis berarti tipe ditentukan saat program berjalan. Longgar berarti JavaScript akan diam-diam mengubah tipe supaya sebuah operasi tetap bisa dilakukan. Perilaku kedua itulah yang disebut **type coercion**, dan ia sumber sebagian besar kebingungan pemula.',
      ),

      terms(
        {
          term: 'operator',
          meaning:
            'Simbol yang **melakukan sesuatu** pada satu atau dua nilai, misalnya `+`, `-`, `===`, `&&`, dan `!`. Cara paling mudah mengingatnya, kalau nilai adalah kata benda, operator adalah kata kerjanya. Kebanyakan operator bekerja pada dua nilai (disebut *biner*), sebagian hanya pada satu (*uner*, seperti `!` dan `typeof`), dan tepat satu operator bekerja pada tiga nilai sekaligus, yaitu ternary `? :` yang dibahas di sub-bab berikutnya.',
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
            'Dibaca "tru-thi" dan "fol-si", dari kata *true* dan *false* dengan akhiran yang berarti "cenderung" atau "berasa seperti". Keduanya menggambarkan **sifat sebuah nilai saat dipakai sebagai kondisi**, misalnya di dalam `if`. Falsy berarti diperlakukan seperti `false`, sedangkan truthy berarti diperlakukan seperti `true`. Kabar baiknya, daftar falsy hanya berisi delapan nilai dan bisa dihafal, sebab segala sesuatu di luar delapan itu bersifat truthy, termasuk array kosong dan object kosong yang sering mengejutkan.',
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
      p(
        'Empat operator pertama sudah kamu kenal dari matematika sekolah, tetapi tiga baris terakhir di kelompok atas layak diperhatikan. Hasil `7 / 3` berupa `2.3333333333333335`, dan perhatikan angka `5` yang muncul di ujung. Itu bukan kesalahan pengetikan melainkan sifat bilangan pecahan di komputer, yang menyimpan angka dalam basis dua sehingga sepertiga tidak pernah bisa disimpan dengan tepat. Konsekuensi praktisnya, jangan pernah membandingkan hasil pembagian dengan `===` dan jangan menyimpan uang sebagai pecahan. Operator `%` adalah **sisa bagi** dan bukan persen, sebab `7 % 3` bernilai `1` karena 3 muat dua kali di dalam 7 dan menyisakan 1. Operator `**` adalah pangkat. Dua baris terakhir memperlihatkan penulisan singkat, dengan `n += 2` sebagai bentuk pendek dari `n = n + 2`, sedangkan `n++` menambah satu. Keduanya **mengubah** isi `n`, jadi keduanya hanya bisa dipakai pada variabel `let` dan bukan `const`.',
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
      p(
        "Empat baris pertama menunjukkan bahwa `+` benar-benar berdiri sendiri di antara operator aritmetika. Hanya `+` yang punya dua pekerjaan, sehingga hanya ia yang perlu memilih, dan pilihannya selalu **menyambung** begitu ada satu operan berupa string. `-`, `*`, dan `/` tidak punya arti lain selain hitung-hitungan, jadi mereka justru mengubah string menjadi angka, dan itu sebabnya `'5' - 2` menghasilkan `3` sementara `'5' + 2` menghasilkan `'52'`. Dua baris terakhir memperlihatkan akibat yang lebih halus, sebab `+` dievaluasi dari kiri ke kanan, satu pasang demi satu pasang. Pada `1 + 2 + '3'`, pasangan pertama `1 + 2` masih dua angka sehingga hasilnya `3`, baru kemudian `3 + '3'` bertemu string dan menyambung jadi `'33'`. Sedangkan `'1' + 2 + 3` sudah bertemu string di langkah pertama, dan begitu hasilnya menjadi string, semua penjumlahan setelahnya ikut berubah menjadi penyambungan.",
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
      p(
        "Inilah bentuk nyata dari aturan di atas, dan perhatikan bahwa **tidak ada satu pun error yang muncul**. Nilai `'1500010000'` adalah hasil yang sah menurut JavaScript, hanya salah menurut maksudmu. Bug jenis ini lolos dari semua pemeriksaan otomatis dan biasanya baru ketahuan saat ada pengguna melaporkan total belanja yang aneh. Tiga baris terakhir memperlihatkan tiga cara mengubah teks jadi angka yang **tidak** setara. `parseInt` dan `parseFloat` bersifat longgar, karena keduanya membaca dari kiri lalu berhenti di karakter pertama yang bukan angka sehingga `'15000px'` tetap menghasilkan `15000`. Sifat itu berguna untuk membaca nilai CSS tetapi berbahaya untuk memvalidasi masukan pengguna, karena `'12abc'` diam-diam lolos sebagai `12`. `Number()` bersifat ketat, sebab seluruh teks harus berupa angka dan kalau tidak hasilnya `NaN`. Ketatnya itu justru keunggulan, karena `NaN` memberimu kesempatan menolak masukan yang tidak masuk akal alih-alih menghitungnya diam-diam.",
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
      p(
        "Ketiganya tercetak, dan itu mengejutkan hampir semua pemula. Penyebabnya satu aturan sederhana, yaitu **hanya delapan nilai di tabel itu yang falsy, dan array maupun object tidak termasuk di dalamnya**, sekosong apa pun isinya. Akibat praktisnya sering menyakitkan, sebab `if (daftar)` bernilai `true` bahkan ketika `daftar` adalah `[]`, sehingga kode yang mengandalkannya akan menampilkan bagian \"ada data\" pada daftar yang sebenarnya kosong. Untuk memeriksa array kosong, tanyakan panjangnya dengan `if (daftar.length > 0)`. Baris ketiga menunjukkan jebakan yang serupa untuk teks. Nilai `'0'` adalah string berisi satu karakter, dan setiap string yang bukan string kosong bernilai truthy, jadi nilai `'0'` dari sebuah `<input>` akan lolos pemeriksaan `if` sementara angka `0` tidak.",
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
      p(
        "Kedua baris di atas memanfaatkan sifat short-circuit yang baru saja dijelaskan. `pengguna && kirimEmail(pengguna)` hanya menjalankan `kirimEmail(pengguna)` kalau `pengguna` truthy, sehingga kalau `pengguna` bernilai `null` misalnya, `kirimEmail` tidak pernah dipanggil sama sekali dan bukan dipanggil dengan `null`. `namaDariForm || 'Tanpa Nama'` bekerja mirip, sebab begitu `namaDariForm` truthy ekspresi berhenti dan mengembalikan nilai itu, sedangkan kalau falsy termasuk string kosong, ia lanjut ke `'Tanpa Nama'`.",
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
      p(
        'Dua contoh itu memakai nilai yang bukan buatan, sebab keduanya kasus yang benar-benar sering muncul. Angka `0` adalah jawaban yang sah untuk "berapa banyak", dan string kosong adalah jawaban yang sah untuk "catatan tambahan". Karena `||` menganggap **semua** nilai falsy sebagai "tidak ada", ia diam-diam menimpa keduanya dengan nilai cadangan, dan pengguna melihat "10" padahal stoknya benar-benar nol. `??` jauh lebih sempit cakupannya, karena ia hanya bereaksi pada `null` dan `undefined`, yaitu dua nilai yang artinya memang "belum ada nilainya". Ringkasnya, pilih berdasarkan pertanyaan yang ingin kamu ajukan. Kalau pertanyaanmu "apakah nilainya belum diisi?", pakai `??`, sedangkan kalau pertanyaanmu benar-benar "apakah nilainya kosong dalam arti apa pun?", barulah `||` yang tepat.',
      ),
      callout(
        'tip',
        'Aturan memilih',
        'Kalau `0` atau `""` adalah nilai yang **sah** untuk data itu, pakai `??`. Kalau keduanya memang dianggap "kosong", `||` boleh. Saat ragu, `??` lebih jarang salah.',
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
      p(
        'Empat baris pertama menunjukkan kenapa `?.` disebut *optional* chaining. Ekspresi `data.pengguna.alamat.kota` meledak karena `alamat` bernilai `null`, sementara `data.pengguna?.alamat?.kota` berhenti dengan tenang di titik mana pun rantainya putus dan menghasilkan `undefined`. Tiga baris penugasan logika di bawahnya adalah versi ringkas dari pola "isi hanya kalau kondisi tertentu". Bentuk `a ??= 5` setara dengan `if (a === null || a === undefined) a = 5`, begitu juga `||=` (falsy) dan `&&=` (truthy), yang hanya ditulis dalam satu operator alih-alih satu blok `if`. Perhatikan peringatan di komentar `b ||= 9`. Karena `||=` memakai aturan falsy yang sama seperti `||`, ia punya jebakan angka nol yang sama seperti yang sudah dibahas di bagian truthy/falsy sebelumnya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        "Kamu membuat halaman checkout. Pembeli mengisi jumlah barang, kode promo, berat paket, dan mencentang persetujuan syarat. Semua nilai itu dibaca dari elemen formulir, dan di situlah letak jebakannya, sebab **apa pun yang datang dari formulir HTML selalu berupa teks**. Angka nol datang sebagai teks `'0'`, centang yang tidak dicentang datang sebagai teks `'false'`, dan kolom kosong datang sebagai teks kosong.",
      ),
      p(
        'Halaman checkout adalah tempat paling mahal untuk salah menangani ini, karena kesalahannya berupa uang. Lihat apa yang terjadi kalau nilai teks itu langsung dipakai apa adanya.',
      ),
      code(
        'js',
        `
        const form = {
          jumlah: '0',        // pembeli mengosongkan lalu mengetik 0
          kodePromo: '',
          beratKg: '2.5',
          setuju: 'false',    // checkbox tidak dicentang
        };

        if (form.jumlah) { /* dianggap ada isinya */ }   // true   <- SALAH
        console.log(form.jumlah == 0);                   // true   <- kebetulan benar
        if (form.setuju) { /* dianggap setuju */ }       // true   <- SALAH dan berbahaya
        console.log(form.beratKg > 2);                   // true   <- kebetulan benar
        console.log('2.5' > '10');                       // true   <- SALAH
        `,
        { filename: 'Kenapa nilai formulir tidak boleh dipakai mentah' },
      ),
      p(
        "Perhatikan bahwa dari lima baris itu, dua kebetulan benar dan tiga salah, dan campuran itulah yang membuat bug jenis ini bertahan lama. Baris `form.beratKg > 2` benar karena salah satu sisinya angka, sehingga JavaScript mengubah teks menjadi angka lebih dulu. Baris `'2.5' > '10'` salah karena **kedua** sisinya teks, sehingga perbandingannya dilakukan huruf demi huruf seperti kamus, dan karakter `2` memang lebih besar daripada `1`. Ongkos kirim untuk paket 2,5 kilogram jadi dihitung seperti paket di atas 10 kilogram.",
      ),
      p(
        "Baris `if (form.setuju)` adalah yang paling berbahaya. Teks `'false'` bukan nilai `false`, melainkan teks sepanjang lima huruf, dan teks apa pun yang tidak kosong selalu dianggap benar. Artinya pembeli yang **tidak** mencentang persetujuan tetap dianggap setuju. Ini bukan bug tampilan, melainkan bug yang bisa berujung sengketa.",
      ),
      code(
        'js',
        `
        // Ubah tipe di batas, yaitu tepat saat nilai masuk ke program.
        const jumlah = Number.parseInt(form.jumlah, 10);
        const beratKg = Number.parseFloat(form.beratKg);
        const setuju = form.setuju === 'true';
        const adaPromo = form.kodePromo.trim() !== '';

        if (Number.isNaN(jumlah) || jumlah < 1) {
          return { sah: false, pesan: 'Jumlah minimal 1' };
        }
        if (!setuju) {
          return { sah: false, pesan: 'Centang persetujuan dulu' };
        }
        `,
        { filename: 'src/validasi-checkout.js' },
      ),
      p(
        'Pola ini disebut mengubah tipe di batas, dan aturannya satu kalimat. Ubah teks menjadi tipe yang benar **satu kali** di tempat ia masuk, lalu seluruh kode setelahnya bekerja dengan tipe yang benar dan tidak perlu waspada lagi. Angka 10 pada `parseInt(form.jumlah, 10)` adalah basis bilangan, dan menuliskannya bukan formalitas sebab tanpa itu teks berawalan nol bisa dibaca dengan basis lain di lingkungan lama.',
      ),
      p(
        'Pemeriksaan `Number.isNaN(jumlah)` diperlukan karena `parseInt` tidak melempar error saat gagal, melainkan mengembalikan `NaN`. Yang perlu diingat, `NaN` adalah satu-satunya nilai di JavaScript yang tidak sama dengan dirinya sendiri, sehingga `jumlah === NaN` selalu `false` dan tidak bisa dipakai memeriksanya. Pakai `Number.isNaN`, dan hindari `isNaN` global yang lebih longgar karena ia mengubah argumennya menjadi angka lebih dulu.',
      ),
      callout(
        'tip',
        'Aturan tiga baris untuk nilai dari luar',
        'Ubah tipenya di tempat ia masuk. Periksa hasilnya sebelum dipakai. Jangan pernah membandingkan dua teks dengan operator `>` atau `<` kecuali kamu memang sedang mengurutkan kata. Ketiganya bersama menutup hampir seluruh bug coercion di aplikasi nyata.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Coercion punya sifat yang membuatnya sulit dipelajari, yaitu ia hampir tidak pernah melempar error. Dua error di bawah adalah pengecualian yang jarang, dan sisanya adalah gejala tanpa pesan.',
      ),
      code(
        'text',
        `
        const nilai = null || 1 ?? 2;
                            ^^

        SyntaxError: Unexpected token '??'
        `,
        { caption: '`??` dicampur dengan `||` atau `&&` tanpa tanda kurung.' },
      ),
      p(
        'JavaScript sengaja menolak campuran ini alih-alih memilih urutan sendiri, dan alasannya baik. Kalau ditulis begitu saja, pembaca tidak punya cara untuk tahu apakah maksudnya `(null || 1) ?? 2` atau `null || (1 ?? 2)`. Perbaikannya menambahkan tanda kurung sesuai maksudmu. Ini contoh langka JavaScript memaksa penulisnya memperjelas maksud, dan kalau kamu bertemu error ini, anggap ia pertanyaan bukan gangguan.',
      ),
      code(
        'text',
        `
        console.log(hargaBigInt + ongkir);
                                ^

        TypeError: Cannot mix BigInt and other types, use explicit conversions
        `,
        { caption: 'Angka besar bertipe BigInt dicampur dengan angka biasa.' },
      ),
      p(
        'Tipe `BigInt` dipakai untuk bilangan bulat yang melebihi batas aman angka biasa, misalnya id dari sistem lain atau nilai dari kolom database `bigint`. Ia sengaja menolak dicampur, sebab hasil campurannya tidak bisa dijamin tepat. Kalau kamu bertemu ini, ubah salah satunya secara eksplisit dengan `Number(x)` atau `BigInt(x)`, dan sadari bahwa mengubah `BigInt` besar menjadi `Number` bisa kehilangan ketepatan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Unexpected token '??'`",
            '`??` dicampur `||` atau `&&` tanpa tanda kurung',
            'Tambahkan tanda kurung sesuai maksudmu',
          ],
          [
            '`Cannot mix BigInt and other types`',
            'Angka `BigInt` dijumlahkan dengan angka biasa',
            'Ubah eksplisit dengan `Number()` atau `BigInt()`',
          ],
          [
            'Dua angka digabung menjadi teks, misalnya `53` dari `5` dan `3`',
            'Salah satunya masih teks, dan `+` mengutamakan penggabungan teks',
            'Ubah ke angka lebih dulu, atau pakai `-` untuk menguji apakah nilainya memang angka',
          ],
          [
            'Nilai `0` dari formulir dianggap kosong',
            "Teks `'0'` truthy, sedangkan angka `0` falsy",
            'Ubah ke angka lebih dulu, lalu periksa dengan `Number.isNaN` dan batas nilainya',
          ],
          [
            'Perbandingan `>` memberi hasil terbalik',
            'Kedua sisinya teks, jadi dibandingkan seperti kata dalam kamus',
            'Pastikan minimal satu sisi sudah berupa angka sebelum dibandingkan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Coercion adalah topik dengan jumlah kesalahan senyap terbanyak di seluruh bab ini. Karena itu kolom ketiga di bawah lebih banyak berisi kata diam-diam daripada kata error.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `==` supaya tidak repot memikirkan tipe',
            'Ia lebih pemaaf, dan biasanya hasilnya memang yang diharapkan',
            'Aturannya tidak bisa ditebak dari akal sehat. `[] == false` bernilai `true`, sedangkan `null == 0` bernilai `false`',
          ],
          [
            'Memeriksa isi variabel dengan `if (nilai)`',
            'Terbaca alami sebagai kalau nilainya ada',
            'Angka `0`, teks kosong, `NaN`, dan `false` ikut dianggap tidak ada. Untuk memeriksa keberadaan, bandingkan dengan `null` memakai `!= null`',
          ],
          [
            'Memakai `isNaN(x)` global',
            'Namanya persis menyatakan yang dicari',
            "`isNaN` mengubah argumennya menjadi angka lebih dulu, sehingga `isNaN('abc')` bernilai `true` padahal `'abc'` bukan `NaN`. Pakai `Number.isNaN`",
          ],
          [
            'Membandingkan hasil `parseInt` dengan `NaN` memakai `===`',
            'Perbandingan ketat memang cara yang benar untuk nilai lain',
            '`NaN === NaN` bernilai `false`, jadi pemeriksaannya tidak pernah berhasil',
          ],
          [
            'Memakai `+` untuk menjumlahkan dua nilai dari formulir',
            'Keduanya jelas angka di mata pengguna',
            "Keduanya teks di mata program, jadi `'2' + '3'` menghasilkan `'23'` bukan `5`",
          ],
          [
            'Memakai `||` untuk memberi nilai bawaan pada angka',
            'Bentuknya pendek dan sudah dipakai di mana-mana',
            'Angka `0` yang sah ikut tergantikan. Pakai `??` yang hanya bereaksi pada `null` dan `undefined`',
          ],
        ],
      ),
      p(
        'Baris kedua patut ditegaskan karena ia sumber bug yang paling sering dianggap misterius. Bentuk `if (jumlah)` bermaksud memeriksa apakah nilainya diisi, tapi yang sebenarnya diperiksa adalah apakah nilainya truthy. Untuk kolom yang boleh bernilai nol, seperti jumlah, diskon, atau stok, keduanya berbeda dan perbedaannya menentukan. Bentuk yang menyatakan maksud sebenarnya adalah `if (jumlah != null)`, dan inilah satu-satunya tempat `!=` dua huruf memang dianjurkan karena ia menangkap `null` dan `undefined` sekaligus.',
      ),
      callout(
        'warning',
        'Nilai dari `localStorage` juga selalu teks',
        "Sama seperti formulir, `localStorage.getItem('perHalaman')` mengembalikan teks bahkan kalau yang kamu simpan tadinya angka. Simpan dengan `JSON.stringify` dan baca dengan `JSON.parse` supaya tipenya kembali utuh, dan bungkus pembacaannya dengan `try` karena isi penyimpanan bisa saja rusak atau diubah orang.",
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
    16,
    'Mengarahkan alur program berdasarkan kondisi, dan menjaga percabangan tetap terbaca saat kondisinya bertambah.',
    [
      p(
        'Percabangan itu mudah ditulis dan mudah dibuat berantakan. Bagian yang benar-benar perlu dilatih bukan sintaksnya, melainkan **menjaga kode tetap rata** saat kondisinya bertambah banyak.',
      ),

      terms(
        {
          term: 'kondisi',
          meaning:
            'Dari *condition*, artinya **syarat**. Ekspresi di dalam kurung `if (...)` yang hasilnya dinilai truthy atau falsy. Kalau truthy, blok di bawahnya dijalankan, dan kalau tidak, dilewati. Yang perlu diingat, isinya tidak harus berupa perbandingan, sebab nilai apa pun boleh ditaruh di sana, dan JavaScript akan menilai "rasa boolean"-nya. Justru kelonggaran itulah yang membuat jebakan angka nol di sub-bab sebelumnya bisa terjadi.',
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
      p(
        'Yang perlu dipahami dari contoh ini bukan sintaksnya, melainkan **cara JavaScript menelusurinya**. Kondisi diperiksa satu per satu dari atas, dan begitu ada yang bernilai `true`, blok itu dijalankan lalu seluruh sisa rantainya **dilewati sepenuhnya** tanpa pemeriksaan lanjutan. Karena itu nilai `82` berhenti di cabang kedua, sebab `82 >= 85` bernilai `false`, `82 >= 70` bernilai `true`, dan `else` tidak pernah disentuh. Perhatikan juga bahwa cabang kedua ditulis `nilai >= 70` saja tanpa `nilai < 85`, karena batas atasnya tidak perlu ditulis justru sebab cabang sebelumnya sudah menyaringnya lebih dulu. `else` di ujung berperan sebagai penampung terakhir, sebab ia berjalan bila **tidak satu pun** kondisi di atasnya terpenuhi, dan keberadaannya menjamin fungsi ini selalu punya jawaban.',
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
      p(
        'Bacalah versi ini dan perhatikan di mana matamu harus berhenti. Baris `return kirim(pesanan)`, satu-satunya hal yang benar-benar dikerjakan fungsi ini, terkubur di tingkat keempat. Untuk sampai ke sana pembaca harus menahan tiga kondisi sekaligus di kepala, yaitu pesanan ada, itemnya tidak kosong, **dan** sudah dibayar. Lebih buruk lagi, setiap `else` letaknya jauh dari `if` pasangannya, sehingga menjawab "kapan pesan `Keranjang kosong` muncul?" menuntut penelusuran mundur melewati beberapa kurung kurawal. Bentuk seperti ini disebut *arrow code* karena kurungnya membentuk anak panah menjorok ke kanan, dan ia menjadi berlipat-lipat lebih sulit tiap kali satu syarat baru ditambahkan.',
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
      p(
        'Perhatikan bahwa tidak ada satu pun `else` di versi ini, dan justru itulah kuncinya. Setiap baris `if` menangani **satu** kemungkinan gagal lalu langsung `return`. Begitu fungsi mengembalikan nilai, eksekusi berhenti total, sehingga baris di bawahnya sudah pasti hanya berjalan bila syarat di atasnya terlewati. `else` menjadi mubazir karena keluarnya fungsi sudah melakukan pemisahan yang sama. Hasilnya dua keuntungan sekaligus, yaitu seluruh kode tetap rata di satu tingkat, dan jalur sukses `return kirim(pesanan)` berdiri sendirian di baris terakhir sebagai kesimpulan. Perhatikan juga urutan pemeriksaannya tidak boleh ditukar, sebab `pesanan.item.length` akan melempar `TypeError` bila `pesanan` ternyata `null`, jadi penjagaan `if (!pesanan)` wajib berada paling atas. Pola ini dikenal sebagai **guard clause**, dan ia salah satu perubahan kecil dengan dampak keterbacaan terbesar yang bisa kamu terapkan.',
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
      p(
        "Perhatikan `case 'sabtu':` yang badannya benar-benar **kosong**, tanpa kode apa pun di bawahnya sebelum `case 'minggu'`. Itu bukan kelalaian, melainkan pemanfaatan sengaja dari sifat \"jatuh\" yang baru saja disebut. Karena tidak ada `return` maupun `break` yang menghentikannya, `'sabtu'` meluncur turun dan menjalankan badan `case 'minggu'`. Hasilnya dua nilai berbagi satu jawaban tanpa penulisan ganda. Bedanya dengan bug fall-through terletak pada niatnya. Di sini `case`-nya sengaja dikosongkan dan ditumpuk berurutan, sedangkan bug terjadi ketika sebuah `case` **punya isi** lalu lupa diakhiri, sehingga kode `case` berikutnya ikut berjalan tanpa ada yang menyadari. Kalau kamu memang bermaksud membuatnya jatuh, biasakan menulis komentar penanda supaya pembaca berikutnya tidak mengiranya kelalaian.",
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
        const pesan = \`Kamu punya \${jumlah} pesan\${jumlah === 0 ? ' — kotak masuk kosong' : ''}\`;
        `,
      ),
      p(
        "Ternary adalah satu-satunya operator di JavaScript yang memakai **tiga** bagian, yaitu kondisi, lalu nilai bila benar setelah `?`, lalu nilai bila salah setelah `:`. Perbedaannya dengan `if` bukan sekadar panjang tulisan, sebab `if` adalah **pernyataan** yang menjalankan sesuatu sedangkan ternary adalah **ekspresi** yang menghasilkan nilai. Karena menghasilkan nilai, ia bisa ditaruh di tempat yang tidak bisa menampung `if` sama sekali, misalnya di kanan tanda `=`, sebagai argumen fungsi, dan seperti baris kedua, di dalam `${ }` sebuah template literal. Perhatikan cabang `:` pada baris kedua yang sengaja diisi string kosong `''`. Itu pola yang akan sering kamu tulis di React untuk menambahkan sesuatu **hanya** bila syaratnya terpenuhi, tanpa mengubah bagian kalimat lainnya.",
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
      p(
        'Bandingkan versi SALAH dan BENAR di atas: keduanya menghasilkan nilai yang sama persis untuk kombinasi `a`, `b`, `c` yang sama, tapi `tentukan()` bisa dibaca baris demi baris tanpa perlu menghitung tingkat kurung mana yang cocok dengan tingkat mana. Ini penerapan langsung early return dari bagian sebelumnya — hanya kali ini dipakai untuk menggantikan ternary bertingkat, bukan `if` bertingkat.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Fitur yang hampir selalu ada di aplikasi pesanan adalah tombol Batalkan. Kelihatannya sederhana, dan begitu ditulis ternyata syaratnya berlapis. Pesanannya harus ada. Pesanannya belum boleh dibatalkan kalau sudah dikirim. Pesanan yang sudah batal tidak boleh dibatalkan dua kali. Dan yang membatalkan harus pemilik pesanannya sendiri, kecuali ia admin.',
      ),
      p(
        'Empat syarat itu adalah tempat kode bertingkat lahir. Kalau tiap syarat ditulis sebagai `if` yang membungkus syarat berikutnya, hasilnya menjadi piramida yang sulit dibaca dan lebih sulit lagi diubah. Bandingkan dua bentuknya.',
      ),
      compare(
        {
          title: 'Bertingkat, sulit diikuti',
          lang: 'js',
          code: `
          function bolehBatalkan(pesanan, aktor) {
            if (pesanan) {
              if (pesanan.status !== 'batal') {
                if (pesanan.status !== 'dikirim') {
                  if (aktor.peran === 'admin' || aktor.id === pesanan.penggunaId) {
                    return { boleh: true };
                  } else {
                    return { boleh: false, alasan: 'Bukan pesanan Anda' };
                  }
                } else {
                  return { boleh: false, alasan: 'Sudah dikirim' };
                }
              } else {
                return { boleh: false, alasan: 'Sudah dibatalkan' };
              }
            } else {
              return { boleh: false, alasan: 'Tidak ditemukan' };
            }
          }
          `,
          notes: ['Syarat dan penolakannya berjauhan, jadi harus dibaca bolak-balik'],
        },
        {
          title: 'Early return, dibaca sekali dari atas',
          lang: 'js',
          code: `
          function bolehBatalkan(pesanan, aktor) {
            if (!pesanan) {
              return { boleh: false, alasan: 'Tidak ditemukan' };
            }
            if (pesanan.status === 'batal') {
              return { boleh: false, alasan: 'Sudah dibatalkan' };
            }
            if (pesanan.status === 'dikirim') {
              return { boleh: false, alasan: 'Sudah dikirim' };
            }
            if (aktor.peran !== 'admin' && aktor.id !== pesanan.penggunaId) {
              return { boleh: false, alasan: 'Bukan pesanan Anda' };
            }
            return { boleh: true };
          }
          `,
          notes: ['Tiap syarat dan penolakannya bersebelahan, dan jalur suksesnya rata di bawah'],
        },
      ),
      p(
        'Kedua fungsi menghasilkan jawaban yang sama persis untuk masukan yang sama, dan yang berbeda hanya bentuknya. Di kolom kanan, tiap `if` menjawab satu pertanyaan lalu langsung keluar, sehingga saat kamu sampai ke baris terakhir kamu sudah tahu seluruh syarat sudah lolos. Di kolom kiri, kamu harus menghitung kurung kurawal untuk tahu `else` yang mana milik `if` yang mana, dan setiap syarat baru menambah satu tingkat lagi.',
      ),
      p(
        'Alasan yang lebih penting daripada keterbacaan adalah kemudahan berubah. Kalau besok muncul syarat kelima, misalnya pesanan yang sudah lewat tujuh hari tidak boleh dibatalkan, di kolom kanan kamu cukup menyisipkan satu blok `if` di tempat yang sesuai. Di kolom kiri, kamu harus membongkar piramidanya dan menyusun ulang seluruh `else`. Bentuk kanan disebut guard clause, dan pola ini akan kamu temui lagi di seluruh kode backend.',
      ),
      p(
        'Perhatikan juga urutan syaratnya bukan sembarangan. Pemeriksaan keberadaan selalu didahulukan, sebab tiga syarat setelahnya membaca field dari `pesanan` dan akan gagal kalau `pesanan` tidak ada. Pemeriksaan kepemilikan sengaja ditaruh terakhir karena ia yang paling mahal secara logika, dan tidak ada gunanya memeriksanya kalau pesanannya sudah pasti tidak bisa dibatalkan.',
      ),
      callout(
        'danger',
        'Pemeriksaan izin di klien tidak pernah cukup',
        'Fungsi seperti `bolehBatalkan` di sisi browser hanya menentukan apakah tombolnya ditampilkan. Server tetap wajib menjalankan pemeriksaan yang sama sebelum benar-benar membatalkan, sebab siapa pun bisa memanggil API-mu langsung tanpa lewat halamanmu. Menyembunyikan tombol bukan kontrol akses, dan ini aturan keras yang dibahas penuh di Kategori Keamanan Fullstack.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Percabangan menghasilkan sedikit error runtime dan banyak kesalahan logika. Satu-satunya error yang sering muncul adalah kesalahan penulisan, dan sisanya berupa cabang yang diam-diam tidak pernah tercapai.',
      ),
      code(
        'text',
        `
        if (lunas) { kirim(); }
        catat();
        else { batalkan(); }
             ^^^^

        SyntaxError: Unexpected token 'else'
        `,
        { caption: '`else` tidak menempel langsung pada penutup `if`-nya.' },
      ),
      p(
        '`else` harus berada tepat setelah kurung kurawal penutup blok `if`, tanpa pernyataan apa pun di antaranya. Karena ini `SyntaxError`, seluruh berkas gagal dijalankan bukan hanya baris ini, jadi kalau tiba-tiba tidak ada satu pun kode di berkas itu yang bekerja, periksa dulu apakah ada kesalahan penulisan seperti ini. Editor biasanya sudah menandainya dengan garis merah sebelum kamu menyimpan.',
      ),
      code(
        'text',
        `
        switch (statusDariUrl) {     // nilainya teks '1'
          case 1:
            console.log('menunggu');
            break;
          default:
            console.log('tidak dikenal');
        }

        tidak dikenal
        `,
        { caption: 'Tidak ada error, tapi `case`-nya tidak pernah cocok.' },
      ),
      p(
        "`switch` membandingkan dengan aturan ketat, setara dengan `===`, sehingga teks `'1'` tidak pernah cocok dengan angka `1`. Ini sangat sering terjadi pada nilai yang datang dari URL, dari atribut `data-`, atau dari formulir, karena ketiganya selalu menghasilkan teks. Perbaikannya mengubah tipenya sebelum masuk ke `switch`, dan itu pilihan yang lebih baik daripada menulis `case '1'` karena ia menyelesaikan masalahnya di sumber.",
      ),
      code(
        'text',
        `
        switch (peran) {
          case 'admin':
            bukaPanelAdmin();
          case 'editor':
            bukaEditor();
            break;
        }

        // peran = 'admin' -> panel admin DAN editor ikut terbuka
        `,
        { caption: '`break` yang hilang membuat eksekusi jatuh ke `case` berikutnya.' },
      ),
      p(
        'Perilaku jatuh ke bawah ini disebut fallthrough, dan ia memang disengaja oleh bahasa, bukan bug. Tanpa `break`, eksekusi terus berlanjut ke `case` di bawahnya tanpa memeriksa nilainya lagi. Kadang ini berguna, misalnya saat dua nilai harus diperlakukan sama, dan dalam kasus itu tulis komentar supaya pembaca berikutnya tahu itu disengaja. Di luar itu, `break` yang lupa ditulis adalah bug diam yang bisa membuka akses yang seharusnya tertutup.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Unexpected token 'else'`",
            'Ada pernyataan lain di antara `}` dan `else`',
            'Rapatkan `else` ke penutup blok `if`-nya',
          ],
          [
            '`switch` selalu jatuh ke `default`',
            'Nilai yang dibandingkan bertipe teks sedangkan `case`-nya angka',
            'Ubah tipenya sebelum masuk `switch`',
          ],
          [
            'Beberapa cabang `switch` ikut berjalan',
            '`break` tidak ditulis, sehingga eksekusi jatuh ke bawah',
            'Tulis `break` di tiap `case`, atau `return` bila di dalam fungsi',
          ],
          [
            'Cabang `if` tidak pernah tercapai',
            'Cabang di atasnya sudah menangkap kasusnya lebih dulu',
            'Urutkan dari yang paling khusus ke yang paling umum',
          ],
          [
            '`Cannot read properties of undefined` di dalam `if`',
            'Syarat keberadaan diperiksa setelah field-nya dibaca',
            'Taruh pemeriksaan keberadaan sebagai guard clause pertama',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan percabangan bukan soal sintaks melainkan soal susunan. Kode yang bercabang terlalu dalam masih berjalan benar hari ini, dan menjadi salah pada perubahan berikutnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membungkus seluruh isi fungsi dalam satu `if` besar',
            'Terlihat seperti melindungi seluruh isi sekaligus',
            'Seluruh badan fungsi menjorok satu tingkat dan penolakannya tersembunyi di `else` paling bawah. Balik syaratnya lalu keluar lebih awal',
          ],
          [
            'Menulis `if (sah === true)`',
            'Terbaca sangat eksplisit',
            'Kalau `sah` memang boolean, `if (sah)` sudah menyatakan hal yang sama. Kalau ia bukan boolean, perbandingan itu justru menyembunyikan bahwa tipenya salah',
          ],
          [
            'Memakai ternary bersarang untuk tiga kemungkinan atau lebih',
            'Satu baris terasa lebih ringkas daripada blok `if`',
            'Ternari bersarang termasuk bentuk yang paling sulit dibaca. Untuk tiga kemungkinan atau lebih, pakai `if` berantai atau tabel pemetaan',
          ],
          [
            'Melupakan `else` terakhir atau `default` pada `switch`',
            'Semua kemungkinan sudah terpikirkan saat menulisnya',
            'Nilai baru yang muncul kemudian tidak tertangani, dan fungsinya diam-diam mengembalikan `undefined`',
          ],
          [
            'Menyalin badan `if` dan `else` yang isinya hampir sama',
            'Menyalin lebih cepat daripada memikirkan strukturnya',
            'Perbaikan nanti hanya diterapkan di satu sisi. Pisahkan bagian yang berbeda saja, lalu jalankan bagian yang sama sekali',
          ],
          [
            'Menulis syarat dengan negasi ganda seperti `if (!tidakAktif)`',
            'Nama variabelnya memang begitu di database',
            'Otak pembaca harus membalik dua kali. Simpan sebagai `aktif` sejak awal, atau buat variabel antara dengan nama positif',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan kebiasaan tetap. Setiap kali kamu hendak menulis `if` yang membungkus hampir seluruh isi fungsi, balik syaratnya dan keluar lebih awal. Setelah beberapa kali, kamu akan menyadari fungsi yang tadinya menjorok empat tingkat berubah menjadi daftar syarat yang rata dan bisa dibaca dari atas ke bawah seperti daftar periksa.',
      ),
      callout(
        'tip',
        'Kalau `switch` hanya memetakan nilai ke nilai, object lebih baik',
        "Bentuk `const label = { lunas: 'Lunas', batal: 'Dibatalkan' }[status] ?? 'Tidak dikenal'` jauh lebih pendek daripada `switch` yang setiap `case`-nya hanya mengembalikan satu teks. Pakai `switch` saat tiap cabang benar-benar menjalankan langkah berbeda, dan pakai object saat yang berbeda hanya nilainya.",
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
    17,
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
            'Dari *iteration*, artinya **satu kali putaran**. Loop yang berjalan lima kali dikatakan melakukan lima iterasi. Kata kerjanya *meng-iterasi*, yang berarti menelusuri sesuatu satu per satu. Istilah ini akan muncul lagi di luar konteks loop, misalnya "React meng-iterasi daftar", dengan arti yang persis sama.',
        },
        {
          term: 'i',
          meaning:
            'Nama variabel penghitung loop yang sudah menjadi kebiasaan turun-temurun sejak bahasa Fortran tahun 1950-an, berasal dari kata *index*. **Bukan kata kunci** — kamu bebas menamainya `baris` atau `nomor` kalau itu lebih menjelaskan. Kalau ada loop di dalam loop, kebiasaannya berlanjut ke `j` lalu `k`; tapi begitu kamu butuh sampai `k`, biasanya itu tanda bahwa kodenya lebih baik dipecah.',
        },
        {
          term: 'indeks',
          meaning:
            'Dari *index*, artinya **nomor posisi** sebuah elemen di dalam array. Yang wajib diingat, penomorannya **dimulai dari 0** dan bukan 1, sehingga elemen pertama berindeks 0, elemen kelima berindeks 4, dan elemen terakhir selalu berindeks `panjang - 1`. Kekeliruan satu angka di sini sangat umum sampai punya nama sendiri dalam bahasa Inggris, yaitu *off-by-one error*.',
        },
        {
          term: 'iterable',
          meaning:
            'Dibaca "i-te-ra-bel", artinya **bisa ditelusuri satu per satu**. Sebutan untuk nilai apa pun yang sanggup diperiksa oleh `for...of`: array, string (yang ditelusuri per karakter), `Map`, `Set`, dan hasil `Object.entries()`. Perhatikan bahwa **object biasa tidak termasuk** — dan itulah sebabnya menelusuri object butuh `Object.entries()` terlebih dulu.',
        },
        {
          term: 'break / continue',
          meaning:
            '`break` artinya **patahkan**, sebab ia menghentikan seluruh loop saat itu juga dan melanjutkan ke baris setelah loop. `continue` artinya **lanjutkan**, sebab ia hanya melewati sisa iterasi yang sedang berjalan lalu langsung meloncat ke putaran berikutnya. Keduanya hanya bekerja di dalam loop sungguhan, sedangkan di dalam `forEach` keduanya tidak tersedia, dan itulah batasan utama method tersebut.',
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
      p(
        'Bandingkan dengan `for` klasik di atas. Seluruh urusan indeks, mulai dari memulai dari nol, memeriksa batas, sampai menaikkan satu, lenyap sepenuhnya. Kamu langsung menerima **nilainya**, dan itu menghilangkan sekelas kesalahan yang disebut *off-by-one*, yaitu salah satu angka pada batas yang membuat elemen terakhir terlewat atau terbaca dua kali. Perhatikan juga `const` pada `for (const w of warna)`. Itu sah meski nilainya berganti tiap putaran, karena setiap putaran sebenarnya membuat variabel `w` yang benar-benar baru dan bukan menugaskan ulang yang lama. Blok kedua memperlihatkan jalan keluar bila indeksnya ternyata tetap dibutuhkan, sebab `warna.entries()` menghasilkan pasangan `[indeks, nilai]` yang langsung dibongkar dengan destructuring array. Blok terakhir menegaskan jangkauannya, karena `for...of` bekerja pada apa pun yang *iterable*, sehingga string ditelusuri per karakter, dan `Map` maupun `Set` bisa dipakai dengan cara yang sama persis.',
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
      p(
        "Perbedaannya dengan `for...of` cuma satu kata, yaitu `in`, tetapi yang kamu terima sama sekali berbeda. `for...in` memberi **nama kuncinya** (`'nama'`, `'level'`), bukan isinya, sehingga nilainya harus diambil sendiri lewat `pengguna[kunci]`. Perhatikan kurung siku di sana dan bukan titik, karena `kunci` adalah variabel berisi teks, dan seperti yang sudah dibahas di sub-bab object, menulis `pengguna.kunci` justru akan mencari property yang benar-benar bernama `\"kunci\"`. Ini juga satu-satunya bentuk perulangan pada daftar di JavaScript yang menelusuri **object biasa**, karena object bukan sesuatu yang *iterable* dan karena itu tidak bisa dipakai langsung dengan `for...of`.",
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
      p(
        'Versi ini menghasilkan keluaran yang sama persis, tapi lebih jujur menyatakan maksudnya. `Object.entries(pengguna)` mengubah object menjadi array pasangan `[kunci, nilai]`, dan begitu berbentuk array ia bisa ditelusuri `for...of` seperti daftar biasa, lalu `[kunci, nilai]` di sisi kiri membongkar tiap pasangan menjadi dua variabel sekaligus. Keuntungannya bukan hanya keterbacaan, sebab `Object.entries` hanya melihat property milik object itu sendiri, sedangkan `for...in` ikut menelusuri property yang diwarisi dari prototype, dan itu sumber bug yang sulit dilacak saat kamu bekerja dengan object dari library pihak ketiga. Sebagai bonus, karena hasilnya array biasa, kamu bisa menyisipkan `.filter(...)` atau `.sort(...)` sebelum menelusurinya, sesuatu yang mustahil dilakukan pada `for...in`.',
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
      p(
        'Bedanya dengan `for` terletak pada **siapa yang bertanggung jawab menghentikan loop**. Pada `for`, penghitungnya ditulis di satu baris bersama kondisi dan kenaikannya, sehingga sulit terlupakan. Pada `while`, kondisinya di atas tetapi yang mengubahnya ada di dalam badan, dan baris `sisa--` itulah satu-satunya hal yang membuat loop ini berakhir. Hapus baris itu, maka `sisa` selamanya bernilai `3`, kondisinya selamanya `true`, dan halaman membeku. Karena itu `while` paling cocok dipakai justru ketika **jumlah putarannya tidak diketahui di awal**, misalnya memproses antrean sampai habis atau mencoba sampai berhasil. Blok kedua menunjukkan varian `do...while`, yang kondisinya diperiksa **setelah** badan dijalankan sehingga isinya dijamin berjalan minimal sekali. Contoh itu pas untuk kasusnya, sebab kamu harus bertanya lebih dulu sebelum bisa menilai jawabannya kosong atau tidak.',
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
      p(
        'Perhatikan urutan pengecekannya. `continue` untuk `n === 3` dijalankan lebih dulu, sehingga angka `3` dilewati tapi loop tetap lanjut ke `4`. `break` untuk `n === 5` baru dicek berikutnya, dan begitu tercapai seluruh loop berhenti, dan itulah sebabnya `5` sendiri tidak pernah sempat tercetak. Bandingkan dengan `filter`/`find` di bagian berikutnya, karena keduanya tidak punya padanan `break` di tengah jalan, jadi kapan pun kamu perlu berhenti sebelum menelusuri seluruh elemen, `for...of` dengan `break` tetap pilihan yang tepat, bukan method array.',
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
      p(
        'Kedua versi menghasilkan `[2, 4]` yang sama, jadi perbandingannya bukan soal benar-salah melainkan soal **berapa lama pembaca butuh untuk mengerti maksudnya**. Versi loop menuntut penelusuran empat baris sebelum maksudnya jelas, karena ada array kosong yang disiapkan, ada penelusuran, ada syarat, dan ada `push`, lalu barulah kamu simpulkan sendiri "oh, ini menyaring". Versi `filter` menyebut maksudnya di nama methodnya, di baris pertama, sebelum kamu sempat membaca syaratnya. Ada keuntungan kedua yang lebih halus. `genapRapi` bisa dideklarasikan `const` karena ia langsung terisi penuh saat dibuat, sementara `genap` pada versi loop terpaksa dimulai kosong lalu diisi bertahap, dan variabel yang isinya berubah-ubah selalu menuntut pembaca menelusuri ke mana saja ia mungkin disentuh.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Ada satu tugas yang selalu muncul begitu kamu mulai bekerja dengan API sungguhan, yaitu mengambil data yang jumlahnya lebih banyak daripada satu respons. Server tidak mengirim sepuluh ribu baris sekaligus. Ia mengirim halaman demi halaman, dan tiap respons memberi tahu apakah masih ada halaman berikutnya. Tugasmu mengambil semuanya sampai habis lalu menggabungkannya.',
      ),
      p(
        'Ini adalah kasus di mana method array tidak bisa dipakai, dan perulangan memang jawabannya. Alasannya sederhana, yaitu jumlah putarannya belum diketahui saat loop dimulai. `map` dan `filter` bekerja pada koleksi yang panjangnya sudah pasti, sedangkan di sini kamu baru tahu harus berhenti setelah server memberi tahu.',
      ),
      code(
        'js',
        `
        async function ambilSemua(ambilHalaman, { batasHalaman = 50 } = {}) {
          const semua = [];
          let halaman = 1;

          while (halaman <= batasHalaman) {
            const { data, adaLagi } = await ambilHalaman(halaman);
            semua.push(...data);

            if (!adaLagi) {
              return semua;              // jalan keluar yang normal
            }
            halaman += 1;
          }

          // Sampai di sini berarti server tidak pernah bilang selesai.
          throw new Error(
            \`Berhenti di halaman \${batasHalaman}, kemungkinan server tidak pernah selesai\`,
          );
        }
        `,
        { filename: 'src/ambil-semua.js' },
      ),
      p(
        'Fungsi ini punya **dua** jalan keluar, dan keduanya disengaja. Jalan keluar normal adalah `return semua` saat server memberi tahu tidak ada halaman lagi. Jalan keluar kedua adalah `throw` setelah batas halaman terlampaui, dan inilah bagian yang paling sering dilupakan orang. Tanpa `batasHalaman`, satu bug di server yang selalu menjawab `adaLagi: true` akan membuat loop berjalan selamanya, memakan seluruh memori browser, lalu membekukan tab pengguna tanpa satu pun pesan error.',
      ),
      p(
        'Perhatikan `while` dipilih bukan `for`, dan itu bukan selera. `for` cocok saat jumlah putaran diketahui di depan. `while` cocok saat yang diketahui hanya syarat berhentinya. Menulis loop ini dengan `for` bisa saja, tapi bagian penambahan halamannya akan berpindah ke tempat yang tidak menyatakan maksudnya. Pilih bentuk yang menyatakan apa yang sebenarnya kamu ketahui.',
      ),
      p(
        'Baris `semua.push(...data)` juga layak diperhatikan. Tiga titik di depan `data` menyebarkan isi array sebagai argumen terpisah, sehingga `push` menambahkan elemen satu per satu alih-alih menambahkan satu array ke dalam array. Untuk halaman berisi ribuan baris, bentuk ini punya batas, dan bagian error di bawah membahasnya.',
      ),
      callout(
        'warning',
        'Loop yang memanggil server harus punya jeda dan batas',
        'Loop di atas memanggil server secepat server menjawab. Untuk API yang punya batas laju permintaan, kamu perlu menambahkan jeda kecil di antara halaman. Loop tanpa batas yang memanggil server juga bisa terlihat seperti serangan dari sisi penyedia API, dan alamatmu bisa diblokir. Batas dan jeda bukan kesopanan melainkan syarat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Perulangan menghasilkan satu jenis kegagalan yang tidak dimiliki bagian lain, yaitu kegagalan tanpa pesan sama sekali. Halaman membeku, kipas menyala, dan tidak ada satu baris pun di console.',
      ),
      code(
        'text',
        `
        for (const nilai of pengaturan) {
                            ^

        TypeError: pengaturan is not iterable
        `,
        { caption: '`for...of` dipakai pada object biasa.' },
      ),
      p(
        '`for...of` hanya bekerja pada hal yang bisa ditelusuri satu per satu, yaitu array, teks, `Map`, `Set`, dan `NodeList`. Object biasa tidak termasuk, dan itu keputusan bahasa yang disengaja. Untuk menelusuri object, pilih salah satu dari `Object.keys`, `Object.values`, atau `Object.entries` sesuai yang kamu butuhkan, lalu `for...of` bekerja lagi karena ketiganya menghasilkan array. Bentuk yang paling sering dipakai adalah `for (const [kunci, nilai] of Object.entries(obj))`.',
      ),
      code(
        'text',
        `
        const a = ['x', 'y'];
        for (const i in a) {
          console.log(typeof i, i);
        }

        string 0
        string 1
        `,
        { caption: 'Tidak ada error, tapi indeksnya berupa teks.' },
      ),
      p(
        "`for...in` dirancang untuk object, bukan array, dan memakainya pada array menimbulkan dua masalah sekaligus. Indeksnya datang sebagai teks, sehingga `i + 1` menghasilkan `'01'` bukan `1`. Lebih jauh lagi, `for...in` juga menelusuri properti tambahan yang mungkin ditempelkan library lain ke array. Untuk array, pakai `for...of` bila kamu butuh nilainya, atau `entries()` bila kamu butuh indeks dan nilai sekaligus.",
      ),
      code(
        'text',
        `
        let i = 0;
        while (i < 10) {
          console.log(i);
          // i tidak pernah bertambah
        }

        (tidak ada keluaran error, tab berhenti merespons)
        `,
        { caption: 'Loop tak berujung karena syaratnya tidak pernah berubah.' },
      ),
      p(
        'Loop tak berujung adalah satu-satunya kegagalan di bab ini yang tidak menghasilkan pesan apa pun. Di browser, tab menjadi tidak responsif dan akhirnya Chrome menawarkan menutup halaman. Di Node.js, prosesnya berjalan terus sampai kamu menekan Ctrl+C. Kalau kamu curiga sebuah loop tidak berujung, tambahkan penghitung pengaman yang melempar error setelah sejumlah putaran, persis seperti `batasHalaman` pada studi kasus di atas.',
      ),
      code(
        'text',
        `
        semua.push(...halamanBesar);
              ^

        RangeError: Maximum call stack size exceeded
        `,
        { caption: 'Spread menyebarkan terlalu banyak elemen sekaligus.' },
      ),
      p(
        'Tiga titik mengubah tiap elemen array menjadi satu argumen tersendiri, dan jumlah argumen sebuah fungsi punya batas sekitar seratus ribu. Untuk array yang lebih besar, ganti dengan `for (const x of halamanBesar) semua.push(x)`, atau gabung dengan `semua = semua.concat(halamanBesar)`. Error yang sama muncul pada `Math.max(...arrBesar)` dengan sebab yang persis sama.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`x is not iterable`',
            '`for...of` dipakai pada object biasa',
            'Bungkus dengan `Object.entries`, `keys`, atau `values`',
          ],
          [
            'Indeks array berupa teks',
            '`for...in` dipakai pada array',
            'Pakai `for...of`, atau `for (const [i, v] of arr.entries())`',
          ],
          [
            'Halaman membeku tanpa pesan apa pun',
            'Syarat berhenti tidak pernah tercapai',
            'Pastikan ada baris yang mengubah syaratnya, lalu tambahkan penghitung pengaman',
          ],
          [
            '`Maximum call stack size exceeded` pada `push(...arr)`',
            'Jumlah argumen melebihi batas',
            'Pakai loop biasa, atau `concat`',
          ],
          [
            'Elemen terlewat saat menghapus di dalam loop',
            'Menghapus elemen menggeser indeks elemen sesudahnya',
            'Telusuri mundur dari indeks terakhir, atau bangun array baru dengan `filter`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perulangan adalah tempat pertama pemula bertemu dengan gagasan bahwa kode yang benar belum tentu kode yang tepat. Beberapa baris di bawah bukan salah melainkan pilihan yang lebih buruk daripada yang tersedia.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `for` klasik dengan indeks untuk semua hal',
            'Bentuk ini yang paling awal dipelajari dan selalu bisa dipakai',
            'Tiga bagian di dalam tanda kurungnya semua bisa salah ketik, dan indeksnya sering tidak dibutuhkan. Kalau yang kamu perlukan hanya nilainya, `for...of` lebih pendek dan lebih sulit disalahtulis',
          ],
          [
            'Memakai `forEach` lalu ingin berhenti di tengah',
            'Ia terasa seperti loop, jadi `break` semestinya bekerja',
            '`break` di dalam `forEach` adalah `SyntaxError`, dan `return` hanya melewati satu elemen. Kalau kamu perlu berhenti, pakai `for...of` atau `some`',
          ],
          [
            'Memakai `await` di dalam `forEach`',
            'Bentuknya sama dengan loop lain yang memang bekerja',
            '`forEach` tidak menunggu, sehingga seluruh pekerjaan jalan bersamaan dan urutannya kacau. Pakai `for...of` bila harus berurutan, atau `Promise.all` bila memang boleh bersamaan',
          ],
          [
            'Memanggil server di dalam loop tanpa batas',
            'Datanya memang harus diambil semua',
            'Satu bug di server membuat loop berjalan selamanya. Selalu ada batas putaran dan jalan keluar yang melempar error',
          ],
          [
            'Menghapus elemen array di dalam loop maju',
            'Menghapus di tempat terasa paling langsung',
            'Setiap penghapusan menggeser sisanya, sehingga satu elemen terlewat setiap kali. Bangun array baru dengan `filter`',
          ],
          [
            'Menyusun teks HTML dengan menambah ke variabel di dalam loop',
            'Cara ini mudah dibayangkan dan bekerja',
            "Untuk ratusan baris, menyusun array lalu `join('')` lebih terbaca. Dan untuk data dari pengguna, menyusun HTML dengan penggabungan teks adalah celah XSS",
          ],
        ],
      ),
      p(
        'Baris ketiga adalah kesalahan yang paling sering muncul begitu kamu masuk ke Bab 5 tentang asinkron, jadi ada baiknya diingat sejak sekarang. `forEach` menerima fungsi lalu menjalankannya untuk tiap elemen tanpa peduli fungsi itu mengembalikan janji atau tidak. Akibatnya `await` di dalamnya memang menunggu, tapi `forEach` sudah lanjut ke elemen berikutnya tanpa menunggu satu pun. Kalau kamu butuh urutan, satu-satunya bentuk yang benar adalah `for...of` dengan `await` di dalamnya.',
      ),
      callout(
        'tip',
        'Aturan memilih bentuk perulangan',
        'Butuh nilainya saja, pakai `for...of`. Butuh indeks dan nilai, pakai `for (const [i, v] of arr.entries())`. Butuh kunci object, pakai `for...of` di atas `Object.entries`. Butuh berhenti di tengah, jangan pakai method array. Tidak butuh berhenti dan hasilnya berupa array baru, `map` dan `filter` lebih menyatakan maksud daripada loop apa pun.',
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
    21,
    'Tiga cara menulis fungsi, parameter default dan rest, serta fungsi sebagai nilai.',
    [
      p(
        'Fungsi adalah unit yang menampung satu pekerjaan supaya bisa diberi nama, diuji, dan dipakai ulang. Di JavaScript fungsi juga merupakan **nilai** — bisa disimpan di variabel, dioper sebagai argumen, dan dikembalikan dari fungsi lain. Sifat itu yang membuat `map`, `filter`, dan event handler mungkin ada.',
      ),

      terms(
        {
          term: 'fn',
          meaning:
            'Singkatan dari *function*, dibaca "ef-en" atau langsung "function". **Ini bukan kata kunci JavaScript**, sebab ia hanya nama parameter yang sudah jadi kebiasaan bersama saat sebuah fungsi menerima fungsi lain sebagai bahannya. Ketika kamu melihat `debounce(fn, jeda)` di dokumentasi atau `arr.map(fn)` di cheatsheet, yang dimaksud adalah "di posisi ini isikan sebuah **fungsi**, bukan angka atau teks". Kamu bebas menamainya `aksi`, `callback`, atau `apaYangDijalankan`, karena JavaScript tidak peduli sedikit pun, dan nama yang lebih panjang justru sering lebih baik di kodemu sendiri. Catatan penting untuk nanti, di **PHP** `fn` justru **benar-benar kata kunci** untuk arrow function, jadi jangan bawa asumsi ini ke bab Laravel.',
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
          term: 'pure function',
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
      p(
        'Ketiganya menghasilkan fungsi yang berperilaku sama saat dipanggil, jadi yang membedakannya bukan hasil melainkan **cara mereka lahir**. Bentuk pertama adalah pernyataan yang berdiri sendiri, dan namanya melekat pada fungsi itu sejak awal. Bentuk kedua dan ketiga sebenarnya bukan "cara mendeklarasikan fungsi" sama sekali, sebab keduanya membuat sebuah nilai fungsi lalu **menugaskannya ke variabel biasa**, persis seperti menugaskan angka atau string. Perhatikan tanda titik koma di akhir bentuk kedua dan ketiga, yang ada karena keduanya adalah penugasan, sedangkan bentuk pertama tidak membutuhkannya. Perbedaan "sekadar penulisan" ini punya dua akibat nyata yang dibahas tepat di bawah, yaitu kapan fungsi itu bisa mulai dipanggil, dan bagaimana `this` di dalamnya berperilaku.',
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
      p(
        "Perhatikan bedanya secara konkret di atas. `sapaAwal('Zum')` di baris pertama berhasil meski fungsinya baru dideklarasikan di baris berikutnya, karena function declaration di-*hoist* penuh, seluruh definisinya diangkat ke atas sebelum kode mulai dijalankan. `sapaAkhir('Zum')` sebaliknya gagal dengan `ReferenceError`, karena `const sapaAkhir = (nama) => ...` mengikuti aturan `const` dari sub-bab sebelumnya, yaitu namanya memang ikut di-*hoist* tetapi nilainya baru terisi tepat di baris deklarasi, dan mengaksesnya lebih awal jatuh ke Temporal Dead Zone.",
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
      p(
        "Aturan pembeda seluruh contoh di atas cuma satu, yaitu **ada tidaknya kurung kurawal setelah tanda panah**. Tanpa kurawal, apa pun yang ditulis setelah `=>` otomatis menjadi return value, dan itulah yang disebut *return implisit*, sehingga `(a, b) => a + b` tidak perlu menulis `return`. Begitu kurawal dipasang, kamu sedang membuka **badan fungsi** yang bisa memuat beberapa baris, dan JavaScript berhenti menebak, sehingga tanpa `return` yang ditulis sendiri hasilnya `undefined`. Baris terakhir adalah tempat kedua aturan itu bertabrakan. Karena `{` sudah punya arti \"mulai badan fungsi\", menulis `() => { nama: 'Zum' }` tidak menghasilkan object, karena JavaScript membacanya sebagai badan fungsi kosong. Membungkusnya dengan kurung biasa, `({ nama: 'Zum' })`, memaksa `{` dibaca sebagai awal object. Inilah penyebab paling umum sebuah `map` mengembalikan array berisi `undefined`.",
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
      p(
        'Dua baris terakhir kelompok pertama adalah yang paling layak diperhatikan, karena keduanya terlihat sama-sama "kosong" tapi hasilnya berbeda. Nilai default **hanya terpicu oleh `undefined`**, dan itu berlaku baik saat argumennya tidak dikirim sama sekali maupun saat `undefined` dikirim secara eksplisit. `null` bukan `undefined`, sebab ia dianggap nilai yang sengaja diberikan, sehingga default dilewati dan `null` benar-benar masuk ke dalam teks menjadi `\'null Zum\'`. Aturan ini persis sama dengan default pada destructuring yang sudah kamu pelajari, jadi cukup diingat sekali untuk keduanya. Kelompok kedua memakai rest parameter, dan perhatikan `jumlahkan()` tanpa argumen menghasilkan `0` dan bukan error, karena `...angka` selalu menghasilkan array, dan array kosong ditambah nilai awal `0` pada `reduce` membuat fungsi ini aman dipanggil dengan berapa pun jumlah argumen, termasuk nol.',
      ),
      callout(
        'tip',
        'Rest menggantikan `arguments`',
        'Kode lama memakai objek `arguments`. Ia bukan array sungguhan (tidak punya `map` atau `filter`) dan tidak tersedia di arrow function. Rest parameter menghasilkan array asli dan selalu lebih jelas.',
      ),

      h2('Return value'),
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
      p(
        'Kedua fungsi itu memperlihatkan hal yang sama dari dua arah, yaitu **setiap fungsi di JavaScript selalu mengembalikan sesuatu**, dan bila kamu tidak menyebutkan apa, yang dikembalikan adalah `undefined`. Tidak ada konsep "fungsi tanpa return value" seperti di sebagian bahasa lain. Ini penting karena `undefined` tidak menimbulkan error saat itu juga. Ia diam saja, ikut mengalir ke variabel berikutnya, dan baru meledak beberapa baris kemudian di tempat yang sama sekali tidak berhubungan dengan sumber masalahnya. Gejala yang paling sering muncul persis seperti yang disebut di bagian `map` tadi, yaitu sebuah fungsi yang badannya memakai kurawal tapi lupa `return`, lalu menghasilkan array penuh `undefined` tanpa satu pun pesan kesalahan.',
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
      p(
        'Gagasan yang diperagakan di sini disebut *first-class function*. Di JavaScript, fungsi adalah **nilai biasa** yang bisa disimpan di variabel, dioper sebagai argumen, dan dikembalikan dari fungsi lain, persis seperti angka. Kelompok pertama menunjukkan sisi "dioper": `map(kali2)` menyerahkan fungsinya sendiri, dan `map` yang nanti memanggilnya untuk tiap elemen. Perhatikan **tidak ada kurung** setelah `kali2`, karena menambahkan kurung berarti memanggilnya sekarang lalu mengoper hasilnya. Kelompok kedua menunjukkan sisi "dikembalikan", dan hasilnya lebih menarik daripada tampaknya. `pengali(3)` sudah selesai berjalan dan berakhir, tetapi fungsi yang ia kembalikan **masih mengingat** bahwa `faktor` bernilai `3`. Ingatan yang bertahan setelah fungsi induknya selesai itu bernama **closure**, dan ia dibahas tuntas di sub-bab berikutnya.',
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

        // BENAR: Dipisah — dua di antaranya jadi pure function yang mudah diuji
        const hitungTotal = (items) => items.reduce((a, i) => a + i.harga, 0);
        const formatRupiah = (n) => 'Rp' + n.toLocaleString('id-ID');

        function tampilkanTotal(items) {
          document.querySelector('#total').textContent = formatRupiah(hitungTotal(items));
        }
        `,
      ),
      p(
        'Versi SALAH mencampur tiga tanggung jawab dalam satu fungsi, yaitu menghitung total, memformat jadi teks rupiah, dan menulis ke halaman. Menguji bagian hitungnya saja berarti kamu harus punya elemen `#total` sungguhan di DOM, padahal yang ingin diuji sebenarnya cuma aritmetikanya. Versi BENAR memisahkan `hitungTotal` dan `formatRupiah` sebagai **pure function**, istilah yang sudah dijelaskan di kotak istilah, karena keduanya bisa diuji hanya dengan memanggil dan memeriksa return value-nya, tanpa menyentuh halaman sama sekali. `tampilkanTotal` yang tersisa menjadi satu-satunya bagian yang menyentuh DOM, dan tidak perlu diuji sedetail dua fungsi lainnya.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi yang kamu kerjakan menampilkan uang dan tanggal di banyak tempat, yaitu di daftar pesanan, di halaman faktur, di email, dan di laporan yang diunduh. Kalau tiap tempat memanggil `Intl.NumberFormat` sendiri dengan pengaturannya sendiri, cepat atau lambat akan ada satu tempat yang menampilkan `Rp240000` tanpa titik sementara tempat lain menampilkannya dengan benar. Solusinya membuat satu fungsi yang menghasilkan sekumpulan pemformat siap pakai.',
      ),
      code(
        'js',
        `
        function buatPemformat({ lokal = 'id-ID', mataUang = 'IDR' } = {}) {
          // Ketiga objek Intl dibuat SATU KALI, lalu dipakai berulang.
          const uang = new Intl.NumberFormat(lokal, {
            style: 'currency',
            currency: mataUang,
            maximumFractionDigits: 0,
          });
          const tanggal = new Intl.DateTimeFormat(lokal, { dateStyle: 'medium' });

          return {
            rupiah: (n) => uang.format(n),
            tanggal: (iso) => tanggal.format(new Date(iso)),
            barisFaktur: (item) =>
              \`\${item.nama.padEnd(12)} \${uang.format(item.total).padStart(14)}\`,
          };
        }

        const f = buatPemformat();
        f.rupiah(240000);                              // 'Rp 240.000'
        f.tanggal('2026-08-19');                       // '19 Agu 2026'
        f.barisFaktur({ nama: 'Kaos', total: 178000 }); // 'Kaos            Rp 178.000'
        `,
        { filename: 'src/pemformat.js' },
      ),
      p(
        'Fungsi ini disebut factory, yaitu fungsi yang tugasnya membuat sesuatu lalu mengembalikannya. Yang membuat pola ini berguna adalah ketiga objek `Intl` dibuat sekali di dalam badan fungsi, lalu dipakai berkali-kali oleh ketiga fungsi kecil yang dikembalikan. Ketiga fungsi kecil itu tetap bisa mengakses `uang` dan `tanggal` bahkan setelah `buatPemformat` selesai berjalan, dan kemampuan itulah yang dibahas tuntas di Sub-bab 1.13 dengan nama closure.',
      ),
      p(
        "Perhatikan parameter `{ lokal = 'id-ID', mataUang = 'IDR' } = {}` di baris pertama. Dua nilai bawaan di dalam kurung kurawal membuat pemanggil boleh mengisi salah satu saja. Tanda `= {}` di luarnya membuat `buatPemformat()` tanpa argumen tetap bekerja. Karena itu satu fungsi yang sama bisa dipakai untuk versi Indonesia maupun versi berbahasa Inggris, cukup dengan `buatPemformat({ lokal: 'en-US', mataUang: 'USD' })`.",
      ),
      p(
        'Bagian kedua studi kasus ini adalah perbedaan yang menentukan apakah sebuah fungsi mudah diuji atau tidak, yaitu fungsi murni dan fungsi yang bergantung pada nilai di luar dirinya.',
      ),
      code(
        'js',
        `
        let pajak = 0.11;

        const tidakMurni = (n) => n * (1 + pajak);   // hasilnya bergantung pada nilai luar
        const murni = (n, tarif) => n * (1 + tarif); // hasilnya hanya bergantung pada argumen

        console.log(tidakMurni(100000));   // 111000.00000000001
        pajak = 0.12;
        console.log(tidakMurni(100000));   // 112000.00000000001  <- argumen sama, hasil beda

        console.log(murni(100000, 0.11));  // selalu sama untuk argumen yang sama
        `,
      ),
      p(
        'Kedua fungsi menghitung hal yang sama, dan yang membedakan hanya dari mana tarif pajaknya datang. `tidakMurni` membaca variabel di luar dirinya, sehingga hasilnya bisa berubah tanpa satu pun argumennya berubah. Kalau nanti ada bug yang menyebutkan angka pajaknya salah, kamu harus menelusuri seluruh berkas untuk mencari siapa yang mengubah `pajak`. `murni` tidak punya masalah itu, sebab seluruh yang ia butuhkan tertulis di daftar parameternya.',
      ),
      p(
        'Sisi praktis yang paling langsung terasa adalah pengujian. Menguji `murni` cukup memanggilnya dan membandingkan hasilnya. Menguji `tidakMurni` menuntut kamu menyiapkan nilai variabel luarnya lebih dulu, dan mengembalikannya sesudahnya supaya test berikutnya tidak terpengaruh. Angka `111000.00000000001` di keluaran juga sekaligus mengingatkan kembali pada pembahasan pecahan di Sub-bab 1.3, dan itu alasan lain kenapa uang sebaiknya disimpan sebagai bilangan bulat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Fungsi menghasilkan beberapa error yang bentuknya sangat khas, dan tiga di antaranya berkaitan dengan hal yang sama, yaitu memanggil sesuatu yang ternyata bukan fungsi.',
      ),
      code(
        'text',
        `
        pemformat.rupiah(240000);
                  ^

        TypeError: pemformat.rupiah is not a function
        `,
        { caption: 'Nama yang dipanggil ada, tapi isinya bukan fungsi.' },
      ),
      p(
        'Pesan ini menyebut jalur lengkapnya, dan itu petunjuk terbesar. Kalau yang disebut `pemformat.rupiah`, berarti `pemformat` sendiri ada, dan yang bermasalah hanya isinya. Penyebab paling sering adalah salah ketik nama, atau modul yang diimpor dengan bentuk yang salah. Kalau kamu menulis `import buatPemformat from ...` padahal berkasnya mengekspor dengan nama, yang kamu dapat adalah `undefined` dan errornya muncul di titik pemanggilan bukan di baris impor.',
      ),
      code(
        'text',
        `
        function f(a = b, b = 2) { return a; }
        f();
                   ^

        ReferenceError: Cannot access 'b' before initialization
        `,
        { caption: 'Nilai bawaan parameter mengacu ke parameter yang ditulis sesudahnya.' },
      ),
      p(
        'Nilai bawaan parameter dievaluasi dari kiri ke kanan pada setiap pemanggilan, jadi saat `a = b` dijalankan, `b` belum sempat diberi nilai. Ini Temporal Dead Zone yang sudah dibahas di Sub-bab 1.2, muncul lagi di tempat yang tidak diduga. Perbaikannya menukar urutan parameternya, atau memindahkan perhitungannya ke dalam badan fungsi.',
      ),
      code(
        'text',
        `
        const f = () => arguments.length;
        f(1);
                        ^

        ReferenceError: arguments is not defined
        `,
        { caption: 'Fungsi panah tidak punya `arguments`.' },
      ),
      p(
        'Ini salah satu perbedaan nyata antara fungsi panah dan `function` biasa, dan ia bukan kelalaian melainkan keputusan desain. Fungsi panah sengaja tidak membawa `arguments` sendiri, sama seperti ia tidak membawa `this` sendiri. Kalau kamu butuh seluruh argumen, pakai parameter rest `(...arg)` yang menghasilkan array sungguhan dan bekerja di kedua bentuk fungsi. Parameter rest juga lebih baik daripada `arguments` karena hasilnya array, sehingga `map` dan `filter` langsung bisa dipakai.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`x is not a function`',
            'Namanya ada tapi isinya bukan fungsi, sering karena bentuk impor yang salah',
            'Periksa apakah ekspornya bernama atau bawaan, lalu samakan bentuk impornya',
          ],
          [
            "`Cannot access 'b' before initialization` di daftar parameter",
            'Nilai bawaan mengacu ke parameter yang ditulis di sebelah kanannya',
            'Tukar urutan parameternya, atau hitung di dalam badan fungsi',
          ],
          [
            '`arguments is not defined`',
            'Fungsi panah tidak punya `arguments`',
            'Pakai parameter rest `(...arg)`',
          ],
          [
            'Fungsi mengembalikan `undefined` padahal ada nilainya',
            'Fungsi panah berkurung kurawal tanpa `return`',
            'Tambahkan `return`, atau hapus kurung kurawalnya',
          ],
          [
            "`Cannot read properties of undefined (reading 'nama')` di dalam fungsi",
            'Fungsi dipanggil tanpa argumen sedangkan parameternya dibongkar',
            'Beri nilai bawaan `= {}` pada parameternya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bawah lebih banyak soal bentuk daripada soal logika, dan hampir semuanya bisa dihindari dengan satu kebiasaan, yaitu memilih bentuk fungsi berdasarkan alasan bukan berdasarkan kebiasaan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `(x) => { x * 2 }` untuk fungsi satu baris',
            'Kurung kurawal terasa lebih formal dan aman',
            'Kurung kurawal menandai badan fungsi, jadi hasilnya `undefined`. Untuk satu ekspresi, tulis `(x) => x * 2` tanpa kurung kurawal',
          ],
          [
            'Menulis `(x) => { nama: x }` untuk mengembalikan object',
            'Bentuknya sama dengan menulis object di tempat lain',
            'Dibaca sebagai badan fungsi berisi label, bukan object. Bungkus menjadi `(x) => ({ nama: x })`',
          ],
          [
            'Memberi nilai bawaan berupa array atau object di parameter',
            'Terlihat sama dengan bahasa lain yang memakainya',
            'Di JavaScript ini justru aman, sebab nilai bawaan dievaluasi ulang tiap pemanggilan. Yang berbahaya adalah menaruh array itu di luar fungsi lalu memakainya sebagai bawaan',
          ],
          [
            'Membuat fungsi dengan lima parameter atau lebih',
            'Semua nilai itu memang dibutuhkan fungsinya',
            'Pemanggilnya harus mengingat urutannya, dan menukar dua argumen bertipe sama tidak menghasilkan error. Kumpulkan menjadi satu object berparameter bernama',
          ],
          [
            'Memberi nama fungsi dengan kata benda seperti `data` atau `hasil`',
            'Nama itu memang menggambarkan yang dikembalikan',
            'Fungsi melakukan sesuatu, jadi namanya sebaiknya kata kerja seperti `hitungTotal` atau `ambilPesanan`. Nama benda menyamarkan bahwa ia harus dipanggil',
          ],
          [
            'Menaruh `console.log` di dalam fungsi yang seharusnya murni',
            'Hanya untuk melihat isinya sebentar',
            'Fungsi itu berhenti murni dan ikut mencetak di produksi kalau lupa dihapus. Cetak di pemanggilnya, bukan di dalamnya',
          ],
        ],
      ),
      p(
        'Baris pertama dan kedua bersama-sama menyumbang porsi terbesar kebingungan pemula soal fungsi panah, dan keduanya berasal dari satu aturan yang sama. Kurung kurawal setelah tanda panah selalu berarti badan fungsi. Kalau kamu ingin mengembalikan object, kurung kurawal itu harus dibungkus tanda kurung supaya JavaScript membacanya sebagai nilai bukan sebagai blok.',
      ),
      callout(
        'tip',
        'Kapan memakai `function` dan kapan memakai panah',
        'Pakai fungsi panah untuk fungsi kecil yang diberikan ke method lain seperti `map` dan `filter`, dan untuk fungsi yang tidak butuh `this`. Pakai `function` untuk fungsi tingkat atas yang punya nama, sebab namanya muncul di stack trace dan itu memudahkan menelusuri error. Perbedaan `this` di antara keduanya dibahas di Bab 3 tentang OOP.',
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
    24,
    'Bagaimana JavaScript menentukan nama mana yang terlihat dari mana — dan closure sebagai konsekuensi alaminya.',
    [
      p(
        'Scope adalah jawaban atas satu pertanyaan, yaitu **dari mana sebuah nama bisa dilihat?** Menguasainya menghapus sekelas bug sekaligus, sekaligus membuat closure, konsep yang sering terdengar menakutkan itu, terasa jelas dengan sendirinya.',
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
      p(
        'Nama `level` sengaja dipakai dua kali supaya pencariannya terlihat. Saat `console.log(level)` di dalam `b` dijalankan, JavaScript melihat scope `b` sendiri lebih dulu, dan tidak ada `level` di sana. Ia naik ke scope `a`, dan **di sinilah pencarian berhenti**. Di situ `level` ketemu bernilai `\'fungsi a\'`, sehingga `level` milik global tidak pernah sempat dilihat. Perilaku "berhenti di temuan pertama" itu disebut *shadowing*, yaitu variabel di tingkat dalam menutupi variabel bernama sama di tingkat luar. Perlu ditegaskan bahwa arah pencariannya **hanya ke atas, tidak pernah ke bawah maupun ke samping**, sebab `a` tidak bisa melihat variabel milik `b`, dan dua fungsi yang bersebelahan tidak bisa saling mengintip. Itulah yang membuat variabel di dalam sebuah fungsi aman dari gangguan bagian lain program.',
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
      p(
        'Perbedaannya dengan `buatPenghitung` sebelumnya cuma satu, yaitu yang dikembalikan bukan satu fungsi melainkan **object berisi dua fungsi**. Keduanya berbagi `saldo` yang sama persis, karena keduanya lahir di dalam pemanggilan `buatDompet` yang sama. Itulah cara membuat beberapa operasi yang bekerja atas satu data tersembunyi. Perhatikan `throw` di dalam `setor`. Karena `saldo` mustahil disentuh dari luar, pemeriksaan itu **tidak bisa dilewati siapa pun**, sebab tidak ada jalan lain masuk selain melewati method ini. Bandingkan dengan menaruh `saldo` sebagai property biasa, karena siapa pun bisa menulis `dompet.saldo = -999` sehingga aturan setorannya tidak berarti apa-apa. Baris terakhir membuktikannya, sebab `dompet.saldo` bernilai `undefined` bukan karena disembunyikan, melainkan karena property bernama itu memang tidak pernah ada di object yang dikembalikan.',
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
      p(
        "Di sini closure dipakai untuk **mengunci konfigurasi**. `buatFormatter('Rp')` dijalankan sekali, lalu selesai — tapi arrow function yang ia kembalikan tetap mengingat bahwa `mataUang` bernilai `'Rp'`. Akibatnya `rupiah(1500000)` cukup dipanggil dengan angkanya saja; simbol mata uangnya tidak perlu dioper ulang tiap kali. Karena tiap pemanggilan `buatFormatter` menciptakan lingkungan barunya sendiri, kamu bisa membuat `const dolar = buatFormatter('$')` di baris berikutnya dan keduanya hidup berdampingan tanpa saling mengganggu. Pola \"fungsi yang membuat fungsi\" ini disebut **factory function**, dan gunanya adalah menghapus argumen yang nilainya selalu sama dari setiap pemanggilan.",
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
      p(
        'Ini pemakaian closure yang paling sering kamu temui di kode nyata, dan yang disimpan bukan data melainkan **`timer`, sebuah nomor pengenal**. Kuncinya ada pada urutan dua baris di dalamnya. Setiap kali `cariTertunda` dipanggil, `clearTimeout(timer)` membatalkan penundaan yang dipasang pemanggilan **sebelumnya**, baru kemudian `setTimeout` memasang penundaan baru. Karena `timer` hidup di closure, ia bertahan **di antara** pemanggilan yang berbeda. Kalau ia dideklarasikan di dalam arrow function-nya, tiap pemanggilan akan memulai dari nol dan tidak ada yang pernah dibatalkan. Hasilnya persis yang diinginkan pada kotak pencarian, sebab mengetik "react" cepat-cepat hanya memicu satu pencarian setelah jeda 300 milidetik, bukan lima. Bagian `(...args)` dan `fn(...args)` adalah pasangan rest dan spread dari sub-bab sebelumnya, dan gunanya membuat `debounce` bekerja untuk fungsi apa pun tanpa peduli berapa argumen yang ia terima.',
      ),
      p(
        'Ketiga contoh punya bentuk yang sama persis, yaitu sebuah fungsi luar yang mendeklarasikan variabel lalu mengembalikan fungsi dalam yang memakainya. Ketiganya menunjukkan bahwa closure bukan fitur eksotis melainkan alat sehari-hari untuk menyembunyikan data, mengunci konfigurasi, dan menyimpan keadaan antar-pemanggilan.',
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
      p(
        'Perbedaan satu kata itu menghasilkan keluaran yang sama sekali berbeda, dan sebabnya bukan `setTimeout` melainkan **berapa banyak variabel yang sebenarnya dibuat**. `var` tidak mengenal scope blok, jadi seluruh loop hanya punya **satu** `i`, sehingga ketiga callback menyimpan alamat variabel yang sama, dan karena `setTimeout` menunda eksekusinya sampai loop selesai, ketiganya membaca nilai akhir `i` yang sudah menjadi `3`. `let` berbeda, sebab ia membuat `j` yang benar-benar **baru pada setiap putaran**, sehingga masing-masing callback mengingat variabel miliknya sendiri berisi `0`, `1`, dan `2`. Perhatikan bahwa jeda `0` sekalipun tidak mengubah apa pun, karena `setTimeout` selalu menjadwalkan fungsinya untuk dijalankan setelah kode yang sedang berjalan selesai, jadi loopnya pasti sudah tuntas lebih dulu betapapun singkat jedanya. Ini alasan paling praktis untuk tidak lagi memakai `var`.',
      ),
      callout(
        'tip',
        'Kenapa contoh ini penting jauh melampaui loop',
        'Pola yang sama muncul di React: sebuah callback menangkap nilai state dari render saat ia dibuat. Kalau kamu pernah bingung kenapa handler menampilkan nilai lama, jawabannya ada di sini — bukan di React, tapi di cara closure bekerja.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kotak pencarian di katalog produk memanggil server setiap kali pengguna mengetik satu huruf. Pengguna mengetik kata kaos, dan server dipanggil empat kali untuk k, ka, kao, dan kaos. Tiga panggilan pertama sia-sia, dan pada halaman yang dipakai ribuan orang, itu berarti ribuan permintaan yang tidak pernah dilihat siapa pun. Yang dibutuhkan adalah menunda panggilan sampai pengguna berhenti mengetik.',
      ),
      p(
        'Teknik ini disebut debounce, dan ia adalah pemakaian closure yang paling sering kamu temui di kode nyata. Yang membuatnya hanya bisa ditulis dengan closure adalah ia butuh mengingat sesuatu di antara pemanggilan, yaitu id timer yang sedang berjalan.',
      ),
      code(
        'js',
        `
        function buatDebounce(fn, jeda = 300) {
          let timer = null;          // hidup selama fungsi yang dikembalikan masih dipakai

          return function (...arg) {
            clearTimeout(timer);     // batalkan rencana sebelumnya
            timer = setTimeout(() => fn(...arg), jeda);
          };
        }

        const cari = buatDebounce((kata) => panggilServer(kata), 300);

        // Pengguna mengetik empat huruf berturut-turut:
        cari('k');
        cari('ka');
        cari('kao');
        cari('kaos');
        // Server hanya dipanggil sekali, dengan 'kaos'.
        `,
        { filename: 'src/debounce.js' },
      ),
      p(
        'Variabel `timer` adalah inti seluruh teknik ini. Ia dideklarasikan di dalam `buatDebounce`, sehingga tidak terlihat dari luar dan tidak bisa ditimpa kode lain. Tapi ia juga tidak ikut hilang saat `buatDebounce` selesai berjalan, sebab fungsi yang dikembalikan masih memakainya. Inilah closure, dan bentuknya di sini bukan latihan melainkan satu-satunya cara yang wajar untuk menulis fitur ini.',
      ),
      p(
        'Urutan dua baris di dalam fungsi yang dikembalikan juga menentukan. `clearTimeout(timer)` dijalankan lebih dulu, dan ia membatalkan rencana pemanggilan yang belum sempat berjalan. Baru setelah itu rencana baru dipasang. Kalau urutannya dibalik, tiap ketikan akan menambah timer baru tanpa membatalkan yang lama, dan server justru dipanggil empat kali dengan jeda. Perhatikan juga `clearTimeout(null)` pada pemanggilan pertama tidak melempar error, sehingga tidak perlu pemeriksaan tambahan.',
      ),
      p(
        'Bagian kedua studi kasus ini menyelesaikan masalah yang tersisa bahkan setelah debounce dipasang, yaitu respons yang datang tidak berurutan. Pengguna mengetik kaos, lalu melanjutkan menjadi kaos polos. Kalau jaringan sedang tidak stabil, jawaban untuk kaos bisa datang **setelah** jawaban untuk kaos polos, dan layar menampilkan hasil yang sudah usang.',
      ),
      code(
        'js',
        `
        let idTerakhir = 0;            // dibagi oleh semua pemanggilan

        async function cariAman(kata) {
          const idSaya = ++idTerakhir; // nomor antrean milik pemanggilan ini

          const hasil = await ambilDariServer(kata);

          if (idSaya !== idTerakhir) {
            return;                    // sudah ada pencarian yang lebih baru, buang hasil ini
          }
          tampilkan(hasil);
        }
        `,
        { filename: 'src/cari-aman.js' },
      ),
      p(
        'Variabel `idSaya` dibuat baru pada setiap pemanggilan, sedangkan `idTerakhir` dibagi bersama. Perbandingan `idSaya !== idTerakhir` setelah `await` adalah penjaganya. Kalau selama menunggu jawaban ada pencarian baru dimulai, `idTerakhir` sudah naik dan pemanggilan lama tahu dirinya sudah tidak relevan lalu keluar tanpa menampilkan apa pun. Pola ini sering disebut penjaga respons basi, dan tanpa itu pengguna akan melihat hasil berkedip ke daftar yang salah.',
      ),
      callout(
        'info',
        'Debounce dan throttle menyelesaikan masalah yang berbeda',
        'Debounce menunggu sampai kegiatan berhenti, jadi cocok untuk kotak pencarian dan penyimpanan otomatis. Throttle menjalankan paling banyak sekali dalam rentang waktu tertentu, jadi cocok untuk peristiwa scroll dan resize yang memang perlu direspons terus tapi tidak perlu setiap kali. Keduanya sama-sama dibangun dari closure.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Closure jarang melempar error. Yang sering terjadi justru sebaliknya, yaitu kode berjalan mulus dengan nilai yang bukan yang kamu maksud. Dua error pertama di bawah berkaitan dengan scope, dan dua sisanya adalah gejala tanpa pesan.',
      ),
      code(
        'text',
        `
        console.log(hitungan);
        let hitungan = 0;
                    ^

        ReferenceError: Cannot access 'hitungan' before initialization
        `,
        { caption: 'Nama dipakai sebelum baris deklarasinya dijalankan.' },
      ),
      p(
        'Kalimat `Cannot access` menyatakan bahwa namanya sudah dikenali, hanya saja belum siap. Perbedaan dengan `is not defined` sangat penting saat menelusuri, sebab yang satu berarti salah tempat dan yang satu berarti salah nama. Di berkas panjang, penyebab tersering adalah fungsi yang dipanggil di bagian atas berkas padahal nilai yang ia butuhkan dideklarasikan di bawah.',
      ),
      code(
        'text',
        `
        function sapa() { return \`Halo \${nama}\`; }
        sapa();
                              ^

        ReferenceError: nama is not defined
        `,
        { caption: 'Nama tidak ada di scope mana pun yang bisa dijangkau.' },
      ),
      p(
        'Fungsi mencari nama ke luar, yaitu ke scope tempat ia **ditulis**, bukan ke scope tempat ia **dipanggil**. Ini yang disebut lexical scoping, dan ia sering mengejutkan orang yang mengira variabel di pemanggil bisa dilihat fungsi yang dipanggil. Kalau `nama` ada di fungsi pemanggil, `sapa` tetap tidak bisa melihatnya. Kirimkan lewat parameter, sebab itulah satu-satunya jalan yang benar.',
      ),
      code(
        'text',
        `
        function cek() {
          console.log(nilai);   // undefined, bukan error
          var nilai = 5;
        }
        cek();

        undefined
        `,
        { caption: '`var` dinaikkan ke atas tanpa nilainya.' },
      ),
      p(
        'Inilah alasan `var` lebih berbahaya daripada `let` meskipun ia terlihat lebih pemaaf. Deklarasi `var` dinaikkan ke atas fungsi, tapi penugasan nilainya tetap di tempatnya, sehingga baris pertama membaca `undefined` tanpa satu pun peringatan. Program terus berjalan membawa nilai kosong itu, dan errornya baru muncul di tempat lain yang tidak ada hubungannya. `let` dan `const` mengubah kasus yang sama menjadi error yang jelas di baris yang benar.',
      ),
      code(
        'text',
        `
        for (var i = 0; i < 3; i++) {
          setTimeout(() => console.log(i), 0);
        }

        3
        3
        3
        `,
        { caption: 'Tiga fungsi berbagi satu variabel yang sama.' },
      ),
      p(
        'Ini bentuk paling terkenal dari jebakan closure, dan penyebabnya bukan closure melainkan `var`. Dengan `var`, hanya ada satu `i` untuk seluruh loop, dan ketiga fungsi menyimpan rujukan ke variabel yang sama. Loop selesai lebih dulu sebelum satu pun fungsi dijalankan, dan saat itu `i` sudah bernilai 3. Mengganti `var` menjadi `let` menyelesaikannya sepenuhnya, sebab `let` membuat variabel baru pada tiap putaran.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot access 'x' before initialization`",
            'Nama dipakai sebelum baris `let` atau `const`-nya',
            'Pindahkan pemakaian ke bawah, atau pindahkan deklarasinya ke atas',
          ],
          [
            '`x is not defined` di dalam fungsi',
            'Fungsi mencari ke scope tempat ia ditulis, bukan tempat ia dipanggil',
            'Kirimkan nilainya lewat parameter',
          ],
          [
            'Nilai `undefined` tanpa error apa pun',
            '`var` dinaikkan tanpa nilainya',
            'Ganti `var` menjadi `const` atau `let`',
          ],
          [
            'Semua handler di dalam loop memakai nilai terakhir',
            '`var` membuat satu variabel dipakai bersama seluruh putaran',
            'Ganti `var` menjadi `let` pada deklarasi loopnya',
          ],
          [
            'Nilai yang seharusnya tersimpan selalu kembali ke awal',
            'Variabelnya dideklarasikan di dalam fungsi yang dikembalikan, bukan di luarnya',
            'Pindahkan deklarasinya ke fungsi pembungkus supaya ia bertahan antar-pemanggilan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Closure paling sering disalahpahami dalam satu hal, yaitu apa yang sebenarnya disimpan. Yang disimpan bukan salinan nilai pada saat fungsi dibuat, melainkan **variabelnya sendiri**. Empat baris pertama tabel di bawah semuanya berakar di situ.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira closure menyimpan salinan nilai saat fungsi dibuat',
            'Nilainya memang terlihat ikut terbawa',
            'Yang tersimpan variabelnya, jadi kalau nilainya berubah setelah itu, fungsinya melihat nilai yang baru',
          ],
          [
            'Memakai `var` di dalam loop yang memasang handler',
            'Loopnya jelas benar, dan mencetak di dalam loop menunjukkan angka yang benar',
            'Handler baru berjalan setelah loop selesai, dan satu-satunya `i` yang ada sudah bernilai akhir',
          ],
          [
            'Mendeklarasikan variabel penampung di dalam fungsi yang dikembalikan',
            'Terlihat lebih rapi karena dekat dengan pemakaiannya',
            'Ia dibuat ulang tiap pemanggilan, sehingga tidak ada yang tersimpan. Variabel yang harus bertahan diletakkan di fungsi pembungkusnya',
          ],
          [
            'Membuat fungsi baru di dalam render atau di dalam loop tanpa perlu',
            'Fungsinya kecil, jadi biayanya pasti kecil',
            'Tiap fungsi membawa scope-nya, dan ribuan fungsi yang masih dirujuk berarti ribuan scope yang tidak bisa dibersihkan. Ini penyebab kebocoran memori yang sulit dilacak',
          ],
          [
            'Melupakan `clearTimeout` atau `removeEventListener` saat komponen ditutup',
            'Halaman toh berpindah, jadi semuanya pasti ikut hilang',
            'Timer dan listener yang masih hidup menahan closure-nya tetap ada. Di aplikasi satu halaman, ini menumpuk sampai tab menjadi berat',
          ],
          [
            'Memakai variabel global untuk menyimpan keadaan antar-pemanggilan',
            'Lebih cepat ditulis daripada membuat fungsi pembungkus',
            'Siapa pun bisa menimpanya, dan dua bagian aplikasi yang memakainya akan saling merusak. Closure memberi ruang simpan yang sama tanpa terbuka ke luar',
          ],
        ],
      ),
      p(
        'Baris pertama adalah inti yang perlu dipegang, dan cara mengujinya mudah. Buat variabel `let n = 1`, buat fungsi yang mengembalikan `n`, lalu ubah `n` menjadi 2 sebelum memanggil fungsi itu. Hasilnya 2, bukan 1. Begitu itu masuk, jebakan loop dengan `var` berhenti terasa misterius dan berubah menjadi konsekuensi yang bisa diprediksi.',
      ),
      callout(
        'warning',
        'Closure adalah penyebab kebocoran memori yang paling sering di aplikasi satu halaman',
        'Selama sebuah fungsi masih dirujuk, seluruh variabel di scope tempat ia ditulis tidak bisa dibersihkan, termasuk data besar yang kebetulan ada di scope itu. Kalau kamu memasang listener atau timer, pastikan ada kode yang melepasnya saat halaman atau komponennya ditutup. Di React, ini persis fungsi nilai kembalian dari `useEffect` yang dibahas di Bab 7.',
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
