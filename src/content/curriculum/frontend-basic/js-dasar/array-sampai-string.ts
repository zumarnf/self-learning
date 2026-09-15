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
    23,
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
            'Dari *accumulate*, artinya **mengumpulkan** atau **menumpuk**. Nilai berjalan yang dibawa `reduce` dari satu elemen ke elemen berikutnya, seperti saldo yang terus diperbarui saat kamu menjumlah belanjaan satu per satu. Di materi ini namanya ditulis `total` atau `hasil` supaya terbaca, sedangkan di dokumentasi resmi ia sering disingkat `acc`. Nilai awalnya, yaitu argumen kedua `reduce`, adalah saldo pembukaannya.',
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
            'Alamat menuju sebuah array atau object di dalam memori, jadi bukan isinya melainkan penunjuk ke tempat isinya berada. React memutuskan perlu-tidaknya menggambar ulang layar dengan membandingkan **referensi**, bukan isi. Karena `push` mengubah isi tanpa mengubah alamat, React tidak melihat perubahan apa pun dan layar tidak diperbarui, dan inilah alasan teknis di balik seluruh anjuran "jangan bermutasi" di sub-bab ini.',
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
      p(
        'Tiga hal di contoh itu layak diperhatikan. Pertama, `length` adalah **jumlah elemen**, sedangkan indeks dimulai dari nol, dan itu sebabnya elemen terakhir berada di indeks `length - 1`, dan `buah[3]` pada array berisi tiga elemen menghasilkan `undefined`, bukan error. Kedua, `at(-1)` ada justru untuk menghindari perhitungan itu, sebab angka negatif dihitung mundur dari belakang, sehingga `at(-1)` selalu berarti "elemen terakhir" tanpa perlu menyebut panjang arraynya sama sekali. Ketiga, perhatikan `indexOf` mengembalikan `-1` saat tidak ketemu dan bukan `null` atau `false`. Karena `-1` adalah angka yang dianggap `true` oleh JavaScript, menulis `if (buah.indexOf(\'durian\'))` justru bernilai benar padahal durian tidak ada. Untuk pertanyaan "ada atau tidak", `includes` yang menjawab `true`/`false` selalu lebih aman.',
      ),

      h2('Mengubah asli vs mengembalikan baru'),
      p(
        'Ini pembagian terpenting di seluruh bab. Method yang **mengubah array aslinya** (mutasi) berbahaya di React, karena React membandingkan referensi untuk memutuskan perlu re-render atau tidak — array yang sama isinya berubah tidak terlihat sebagai perubahan.',
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
      p(
        'Contoh ini menyembunyikan satu jebakan yang bagus untuk disadari sejak awal. Setelah baris `asli.sort()`, variabel `asli` **sudah bukan `[3, 1, 2]` lagi**, sebab isinya berubah permanen menjadi `[1, 2, 3]`, dan semua baris di bawahnya bekerja pada urutan yang sudah berubah itu. Padahal `asli` dideklarasikan dengan `const`. Ini sering membingungkan pemula, jadi perlu diluruskan bahwa `const` hanya melarang variabelnya **ditunjuk ulang** ke array lain, bukan melarang isi arraynya diubah. Bandingkan dengan empat baris terakhir, sebab `toSorted`, spread `[...asli, 4]`, `filter`, dan `with` semuanya menghasilkan array **baru** dan meninggalkan `asli` apa adanya. Perbedaan itu terlihat sepele di layar, tetapi di React ia menentukan tampil-tidaknya perubahan, sebab array yang isinya berubah tanpa berganti alamat tidak terbaca sebagai perubahan sama sekali.',
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
      p(
        'Tiga contoh itu memperlihatkan bahwa `map` selalu melakukan hal yang sama, yaitu menjalankan fungsimu sekali untuk **tiap** elemen, lalu menyusun hasilnya jadi array baru dengan panjang yang persis sama. Yang berubah hanya bentuk hasilnya, karena contoh pertama angka jadi angka, contoh kedua object jadi teks (`u.nama`), contoh ketiga object jadi object yang lebih kaya. Dua hal kecil layak dicatat. Angka aneh `27750.000000000004` bukan kesalahan `map`, melainkan sifat bilangan pecahan di komputer yang tidak bisa menyimpan `0,11` dengan tepat. Untuk uang, pembulatan dilakukan saat menampilkan, bukan disimpan. Lalu perhatikan tanda kurung di `(u) => ({ ...u, ... })`, sebab tanpa kurung pembungkusnya, JavaScript membaca `{` sebagai awal blok kode, bukan awal object, dan hasilnya array berisi `undefined`.',
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
      p(
        'Kalau `map` menjaga panjang, `filter` justru **memangkasnya**, sebab fungsimu tidak menghasilkan nilai baru, melainkan menjawab ya-atau-tidak untuk tiap elemen, dan hanya yang dijawab "ya" yang ikut ke array hasil. Dua baris di tengah menegaskannya secara ekstrem, sebab menjawab `true` untuk semua menghasilkan salinan utuh sedangkan menjawab `false` untuk semua menghasilkan array kosong. Jadi hasil `filter` tidak pernah lebih panjang dari masukannya, dan yang paling sering dilupakan adalah **ia bisa kosong**, sehingga kode yang langsung membaca `hasil[0]` perlu bersiap menerima `undefined`. Baris terakhir memakai pintasan yang akan sering kamu temui. `filter(Boolean)` berarti "buang semua yang dianggap kosong", yaitu string kosong, `null`, `undefined`, `0`, dan `NaN`, karena `Boolean` sendiri adalah fungsi yang mengubah nilai apa pun menjadi `true`/`false`.',
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
      p(
        'Empat baris komentar di bawah adalah inti `reduce`, dan sebaiknya dibaca perlahan. Fungsi yang kamu berikan menerima **dua** hal, yaitu `total` sebagai hasil sementara sejauh ini dan `n` sebagai elemen yang sedang diproses. Apa pun yang kamu `return` menjadi `total` untuk putaran berikutnya, dan itulah yang membuat nilainya "berjalan" dari 0 ke 1, lalu 3, lalu 6, lalu 10. Angka `0` di akhir pemanggilan bukan pelengkap, melainkan **nilai awal** `total` sebelum elemen pertama disentuh. Coba hilangkan, dan `reduce` akan memakai elemen pertama sebagai nilai awal, yang biasanya masih benar untuk penjumlahan tetapi langsung melempar `TypeError` begitu arraynya kosong.',
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
      p(
        'Di sini nilai awalnya `{}` dan bukan `0`, dan itulah satu-satunya alasan hasil akhirnya berupa object alih-alih angka. Bentuk nilai awal selalu menentukan bentuk hasil akhir `reduce`. Baris `hasil[item.kategori] ??= []` berarti "kalau kunci ini belum ada, isi dulu dengan array kosong". Tanpa baris itu, `push` pada kategori yang baru pertama kali muncul akan gagal karena mencoba memanggil `push` pada `undefined`. Baris `return hasil` yang diberi huruf besar juga bukan basa-basi. Karena badan fungsinya memakai kurung kurawal, JavaScript tidak mengembalikan apa pun secara otomatis, sehingga lupa menulisnya membuat `hasil` bernilai `undefined` pada putaran kedua, dan pesan errornya menunjuk ke baris `??=`, jauh dari sumber masalah sebenarnya.',
      ),
      callout(
        'tip',
        'Untuk pengelompokan, sekarang ada cara yang lebih pendek',
        '`Object.groupBy(pesanan, (item) => item.kategori)` melakukan hal yang sama dalam satu baris. Tetap pelajari `reduce` karena ia dipakai untuk banyak hal lain, tetapi jangan pakai `reduce` kalau ada method yang namanya langsung menjelaskan maksudnya.',
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
      p(
        'Ketiga method ini menjawab pertanyaan yang berbeda-beda dari array yang sama. `find` menjawab **"yang mana?"** dan mengembalikan elemennya sendiri, sedangkan pasangannya `findIndex` menjawab "di posisi berapa?" dan mengembalikan angka. `some` menjawab **"adakah minimal satu?"** dan `every` menjawab **"apakah semuanya?"**, dan keduanya hanya mengembalikan `true` atau `false`. Komentar di baris terakhir menyebut sifat yang sering luput, yaitu ketiganya berhenti begitu jawabannya sudah pasti. `some` berhenti pada elemen pertama yang cocok, `every` berhenti pada elemen pertama yang gagal, dan `find` berhenti begitu menemukan yang dicari, jadi mencari satu pengguna di antara sepuluh ribu tidak berarti memeriksa sepuluh ribu elemen. Satu hal yang perlu diwaspadai, `find` mengembalikan `undefined` kalau tidak ketemu, sehingga langsung menulis `pengguna.find(...).nama` akan melempar `TypeError` pada hari data yang dicari kebetulan tidak ada.',
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
      p(
        'Baca dari atas ke bawah seperti kalimat. `filter` menyisakan hanya produk yang stoknya lebih dari 0 (Kaos dan Tas yang lolos, Topi tersingkir), `map` mengubah tiap produk yang tersisa menjadi satu angka lewat harga dikali stok, sehingga `80000 * 3 = 240000` untuk Kaos dan `250000 * 7 = 1750000` untuk Tas, lalu `reduce` menjumlahkan kedua angka itu jadi satu nilai akhir. Tiap tahap menerima array hasil tahap sebelumnya dan mengembalikan array baru, itulah sebabnya ketiganya bisa dirangkai langsung dengan titik, persis seperti `filter` dan `map` yang sudah dipelajari sendiri-sendiri di atas.',
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
      p(
        "Perhatikan baris pertama, sebab `flat()` tanpa argumen hanya membongkar **satu** tingkat, sehingga `[3, [4]]` masih tersisa utuh di dalam hasilnya. Kedalaman itu bisa ditentukan lewat argumen, misalnya `flat(2)` untuk dua tingkat, atau `flat(Infinity)` bila kamu memang ingin semuanya rata berapa pun dalamnya. `flatMap` di baris terakhir adalah pintasan untuk urutan yang sangat sering muncul, yaitu `map` dulu lalu `flat` satu tingkat. Contohnya jelas, karena `split(' ')` mengubah tiap kalimat menjadi array kata sehingga `map` biasa akan menghasilkan array-di-dalam-array `[['a','b'], ['c','d']]`, sedangkan `flatMap` langsung meratakannya jadi satu daftar kata. Pola ini muncul setiap kali satu elemen masukan bisa menghasilkan nol, satu, atau banyak elemen keluaran.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kamu diminta membuat kartu ringkasan di dashboard admin toko. Isinya tiga angka, yaitu omzet bulan ini, rincian omzet per produk, dan tiga produk terlaris. Datanya datang dari API sebagai satu array pesanan mentah, lengkap dengan pesanan yang dibatalkan dan yang belum dibayar. Tidak ada satu pun angka yang sudah dihitung dari server, jadi seluruhnya kamu olah di sisi klien.',
      ),
      p(
        'Inilah bentuk paling khas pemakaian array method di pekerjaan sehari-hari. Yang membedakannya dari contoh di atas bukan method-nya, melainkan bahwa lima method berbeda dirangkai berurutan dan tiap tahap menghasilkan bentuk data yang berbeda dari tahap sebelumnya.',
      ),
      code(
        'js',
        `
        const pesanan = [
          { id: 'INV-001', status: 'lunas',   produk: 'Kaos', jumlah: 2, hargaSatuan: 89000 },
          { id: 'INV-002', status: 'batal',   produk: 'Topi', jumlah: 1, hargaSatuan: 55000 },
          { id: 'INV-003', status: 'lunas',   produk: 'Kaos', jumlah: 5, hargaSatuan: 89000 },
          { id: 'INV-004', status: 'lunas',   produk: 'Tas',  jumlah: 1, hargaSatuan: 240000 },
          { id: 'INV-005', status: 'pending', produk: 'Kaos', jumlah: 3, hargaSatuan: 89000 },
        ];

        // 1. Buang yang belum jadi uang.
        const lunas = pesanan.filter((p) => p.status === 'lunas');

        // 2. Tambahkan field turunan tanpa merusak data aslinya.
        const denganTotal = lunas.map((p) => ({ ...p, total: p.jumlah * p.hargaSatuan }));

        // 3. Ringkas jadi satu angka.
        const omzet = denganTotal.reduce((jumlah, p) => jumlah + p.total, 0);

        // 4. Ringkas jadi satu object, dikelompokkan per produk.
        const perProduk = denganTotal.reduce((peta, p) => {
          peta[p.produk] = (peta[p.produk] ?? 0) + p.total;
          return peta;
        }, {});

        // 5. Ubah object menjadi array supaya bisa diurutkan, lalu ambil tiga teratas.
        const terlaris = Object.entries(perProduk)
          .map(([produk, total]) => ({ produk, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3);

        console.log(omzet);      // 863000
        console.log(perProduk);  // { Kaos: 623000, Tas: 240000 }
        console.log(terlaris);   // [ { produk: 'Kaos', total: 623000 }, { produk: 'Tas', total: 240000 } ]
        `,
        { filename: 'src/ringkasan-dashboard.js' },
      ),
      p(
        'Urutan lima tahap itu bukan selera melainkan keharusan, dan alasannya efisiensi sekaligus kebenaran. `filter` sengaja dijalankan paling awal supaya empat tahap sesudahnya bekerja pada data yang lebih sedikit, dan yang lebih penting supaya pesanan batal tidak pernah ikut terhitung. Kalau `map` dijalankan lebih dulu, kamu menghitung total untuk pesanan yang tidak akan pernah dibayar, dan itu pekerjaan yang terbuang.',
      ),
      p(
        'Perhatikan bentuk `({ ...p, total: ... })` di tahap dua, dan khususnya tanda kurung yang membungkus kurung kurawal. Tanpa tanda kurung itu, JavaScript membaca `{` sebagai awal badan fungsi bukan awal object, dan fungsinya mengembalikan `undefined`. Ini kesalahan yang hampir semua orang buat sekali. Pola tiga titik di dalamnya juga penting, sebab ia menyalin seluruh field lama lalu menambah satu field baru, sehingga array `lunas` yang asli tidak berubah sama sekali.',
      ),
      p(
        'Tahap empat memakai `reduce` dengan `{}` sebagai nilai awal, dan inilah bentuk `reduce` yang paling sering dipakai di luar penjumlahan. Yang dikumpulkan bukan angka melainkan object, dan `(peta[p.produk] ?? 0)` menangani kasus produk yang baru pertama kali muncul. Tanda `??` dipakai bukan `||` karena keduanya berbeda saat nilainya nol, dan omzet nol adalah nilai yang sah. Jangan lupa `return peta` di akhir, sebab fungsi panah dengan kurung kurawal tidak mengembalikan apa pun kalau tidak diminta.',
      ),
      p(
        'Tahap lima memperlihatkan pola bolak-balik yang sangat sering dipakai, yaitu object diubah menjadi array dengan `Object.entries`, diolah dengan method array, lalu dipotong dengan `slice`. `Object.entries` menghasilkan array berisi pasangan, dan `([produk, total]) =>` di dalam `map` membongkar tiap pasangan itu langsung di parameter. Comparator `(a, b) => b.total - a.total` mengurutkan dari besar ke kecil, dan urutannya terbalik dari yang biasa karena `b` ditulis lebih dulu.',
      ),
      callout(
        'tip',
        'Sejak ES2024 ada jalan yang lebih pendek untuk tahap empat',
        '`Object.groupBy(denganTotal, (p) => p.produk)` langsung mengelompokkan array menjadi object berisi array. Ia belum menjumlahkan, jadi kamu tetap butuh satu `reduce` setelahnya, tapi maksudnya jauh lebih terbaca daripada `reduce` yang mengurus pengelompokan dan penjumlahan sekaligus.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dua error di bawah muncul dari method array itu sendiri, dan dua sisanya adalah kesalahan yang tidak melempar error sama sekali. Yang terakhir itu justru yang paling perlu diwaspadai.',
      ),
      code(
        'text',
        `
        const omzet = kosong.reduce((jumlah, p) => jumlah + p.total);
                             ^

        TypeError: Reduce of empty array with no initial value
        `,
        { caption: '`reduce` dipanggil tanpa nilai awal pada array kosong.' },
      ),
      p(
        'Pesan ini menyebut penyebabnya lengkap dengan solusinya, yaitu tidak ada nilai awal. Kalau `reduce` dipanggil tanpa argumen kedua, ia memakai elemen pertama sebagai titik mula, dan pada array kosong tidak ada elemen pertama untuk dipakai. Di dashboard tadi array kosong bukan kasus aneh melainkan kasus normal, sebab toko yang baru buka memang belum punya pesanan lunas. Selalu tulis nilai awalnya, dan sebagai bonus nilai awal itu juga menyatakan bentuk hasil yang kamu harapkan.',
      ),
      code(
        'text',
        `
        const nama = pesanan.map((p) => p.pelanggan.nama);
                                                   ^

        TypeError: Cannot read properties of undefined (reading 'nama')
        `,
        { caption: 'Satu elemen di tengah array tidak punya field yang diharapkan.' },
      ),
      p(
        'Error ini menyesatkan karena ia tidak menyebut elemen ke berapa yang bermasalah. Sembilan puluh sembilan elemen bisa saja lengkap dan satu elemen tidak, dan `map` berhenti pada elemen yang tidak lengkap itu. Cara tercepat menemukannya adalah menambahkan indeks ke parameter kedua lalu mencetaknya, misalnya `map((p, i) => { if (!p.pelanggan) console.log(i, p); ... })`. Perbaikan sebenarnya biasanya di tahap sebelumnya, yaitu menyaring elemen yang tidak lengkap dengan `filter` sebelum `map` menyentuhnya.',
      ),
      code(
        'text',
        `
        console.log([10, 9, 100, 2].sort());

        [ 10, 100, 2, 9 ]
        `,
        { caption: 'Tidak ada error, tapi urutannya salah.' },
      ),
      p(
        'Inilah perilaku `sort` yang paling sering mengejutkan. Tanpa fungsi pembanding, `sort` mengubah tiap elemen menjadi teks lebih dulu lalu mengurutkannya seperti kata dalam kamus. Dalam urutan kamus, teks `100` datang sebelum `2` karena karakter pertamanya `1` lebih kecil daripada `2`. Program tidak melempar apa pun, angka tetap keluar, dan laporan yang dihasilkan tetap terlihat masuk akal sampai ada yang memeriksanya. Untuk angka, selalu tulis `sort((a, b) => a - b)`.',
      ),
      code(
        'text',
        `
        const asli = [3, 1, 2];
        const urut = asli.sort();

        console.log(asli);        // [ 1, 2, 3 ]  <- ikut berubah
        console.log(asli === urut); // true       <- keduanya array yang sama
        `,
        { caption: '`sort` mengubah array aslinya, bukan membuat yang baru.' },
      ),
      p(
        'Sebagian besar method array mengembalikan array baru dan meninggalkan aslinya utuh, tapi `sort`, `reverse`, `splice`, `push`, dan `pop` justru mengubah aslinya. Di dashboard, ini berarti mengurutkan daftar untuk ditampilkan sekaligus mengacak urutan data sumber yang dipakai bagian lain halaman. Sejak ES2023 ada `toSorted`, `toReversed`, dan `toSpliced` yang mengembalikan salinan baru, dan ketiganya lebih aman dipakai sebagai kebiasaan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Reduce of empty array with no initial value`',
            '`reduce` tanpa nilai awal dipanggil pada array kosong',
            'Selalu beri nilai awal, misalnya `0` untuk angka dan `{}` untuk object',
          ],
          [
            '`Cannot read properties of undefined` di dalam `map`',
            'Ada satu elemen yang bentuknya berbeda dari elemen lain',
            'Saring dengan `filter` lebih dulu, atau pakai `?.` dan nilai cadangan',
          ],
          [
            'Angka terurut menjadi `10, 100, 2, 9`',
            '`sort` tanpa pembanding mengurutkan sebagai teks',
            'Tulis `sort((a, b) => a - b)` untuk angka',
          ],
          [
            'Data sumber ikut berubah setelah diurutkan',
            '`sort` dan `reverse` mengubah array aslinya',
            'Pakai `toSorted` dan `toReversed`, atau salin dulu dengan `[...arr].sort()`',
          ],
          [
            '`Maximum call stack size exceeded` pada `Math.max(...arr)`',
            'Spread mengubah tiap elemen menjadi satu argumen, dan jumlahnya melebihi batas',
            'Pakai `arr.reduce((a, b) => Math.max(a, b), -Infinity)` untuk array besar',
          ],
        ],
        'Tiga baris pertama muncul saat kode berjalan, dua baris terakhir hanya terlihat dari hasilnya.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Array method paling sering disalahpahami dalam satu hal, yaitu mana yang mengembalikan nilai dan mana yang tidak. Empat baris pertama tabel di bawah semuanya berakar di situ.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `forEach` lalu berharap hasilnya bisa ditampung',
            'Ia juga berjalan untuk tiap elemen, sama seperti `map`',
            '`forEach` selalu mengembalikan `undefined`. Kalau kamu butuh hasilnya, yang dicari adalah `map`',
          ],
          [
            'Menulis `map((p) => { p.total = ... })` tanpa `return`',
            'Kurung kurawal terasa lebih rapi untuk beberapa baris',
            'Fungsi panah berkurung kurawal tidak mengembalikan apa pun tanpa `return`, jadi hasilnya array berisi `undefined`. Ia juga mengubah object aslinya',
          ],
          [
            'Menulis `map((p) => { ...p, total: 1 })`',
            'Bentuknya sama dengan yang biasa dipakai di dalam object',
            'Kurung kurawalnya dibaca sebagai badan fungsi, bukan object. Bungkus dengan tanda kurung menjadi `({ ...p, total: 1 })`',
          ],
          [
            'Memakai `filter` untuk mencari satu elemen',
            'Ia memang menemukan elemennya',
            '`filter` selalu mengembalikan array, jadi kamu harus menulis `[0]` sesudahnya. `find` langsung mengembalikan elemennya, atau `undefined` bila tidak ketemu',
          ],
          [
            'Merangkai `filter` lalu `map` lalu `filter` lagi berulang kali',
            'Tiap baris jadi mudah dibaca sendiri-sendiri',
            'Tiap tahap membuat array baru, jadi enam rangkaian berarti enam kali menelusuri data. Untuk ribuan baris ini terasa, dan biasanya cukup digabung menjadi satu `reduce`',
          ],
          [
            'Memakai `includes` pada array object untuk mencari berdasarkan id',
            '`includes` bekerja sempurna untuk array angka dan teks',
            '`includes` membandingkan rujukan, jadi dua object dengan isi sama tetap dianggap berbeda. Pakai `some((p) => p.id === id)`',
          ],
        ],
      ),
      p(
        'Baris kedua dan ketiga bersama-sama adalah kesalahan paling sering di seluruh sub-bab ini, dan keduanya berasal dari satu aturan sintaks yang sama. Fungsi panah tanpa kurung kurawal mengembalikan nilai ekspresinya secara otomatis, sedangkan fungsi panah dengan kurung kurawal membutuhkan `return` yang ditulis sendiri. Kalau `map` mengembalikan array berisi `undefined`, tersangka pertamanya selalu `return` yang hilang.',
      ),
      callout(
        'warning',
        'Method yang mengubah aslinya perlu dihafal',
        'Yang mengubah array aslinya adalah `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, dan `fill`. Sisanya mengembalikan array baru. Di React, mengubah array aslinya adalah penyebab langsung tampilan yang tidak ikut berubah, dan itu bug yang akan kamu temui lagi di Bab 4.',
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
    20,
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
            'Terjemahannya **kunci** dan **nilai**. Kunci adalah nama sebuah property, nilai adalah isinya, sehingga pada `{ umur: 24 }`, `umur` kuncinya dan `24` nilainya. Disebut kunci karena fungsinya memang seperti kunci lemari yang membuka akses ke isi tertentu. Tiga fungsi bawaan bekerja berdasarkan pembagian ini, yakni `Object.keys()` mengambil daftar kuncinya, `Object.values()` daftar nilainya, dan `Object.entries()` pasangan keduanya.',
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
      p(
        'Contoh itu memuat empat penulisan singkat yang akan kamu lihat terus-menerus. Baris `nama,` adalah **shorthand property**, sebab ketika nama variabel dan nama kunci kebetulan sama, cukup tulis sekali dan hasilnya persis sama dengan `nama: nama`. `alamat` menunjukkan bahwa nilai sebuah property boleh berupa object lagi, dan bersarang seperti itu boleh sedalam apa pun. `sapa()` adalah **shorthand method**, yaitu bentuk pendek dari `sapa: function () { ... }`, dan di dalamnya `this.nama` menunjuk object yang memiliki method itu sendiri. Terakhir, kurung siku pada `{ [field]: ... }` adalah **computed key**, sebab tanpa kurung siku itu kuncinya akan benar-benar bernama `"field"`, bukan `"email"`, karena JavaScript membaca nama kunci apa adanya kecuali kamu memintanya mengevaluasi dulu.',
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
      p(
        'Baris `pengguna.kunci` di atas adalah jebakan yang sering terjadi. Kalau variabel `kunci` berisi teks `\'umur\'`, menulis `pengguna.kunci` **tidak** membaca `pengguna[kunci]`, sebab ia justru mencari property yang namanya benar-benar `"kunci"`, yang tidak ada di `pengguna`. Notasi titik selalu membaca nama yang ditulis apa adanya, sedangkan kurung siku selalu mengevaluasi dulu apa yang ada di dalamnya sebagai ekspresi. Aturan praktisnya, kunci yang kamu ketik langsung dan sudah pasti namanya boleh pakai titik, sedangkan kunci yang datang dari variabel wajib pakai kurung siku.',
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
      p(
        'Bandingkan dua baris pertama, karena bedanya cuma satu karakter tapi akibatnya sangat berbeda. `respons.pengguna.alamat.kota` gagal bukan di `alamat`, melainkan **saat membaca `kota` dari `undefined`**, sebab `respons.pengguna.alamat` sendiri sah dan bernilai `undefined`, dan barunya titik berikutnya yang meledak. `?.` memutus rantai itu, sebab begitu bagian di kirinya `null` atau `undefined`, seluruh sisa rantai dilewati dan hasilnya langsung `undefined`, tanpa error. Dua baris terakhir memperlihatkan bahwa polanya berlaku untuk bentuk akses lain juga, yaitu `?.()` untuk memanggil fungsi yang mungkin tidak ada, dan `?.[0]` untuk membaca indeks dari array yang mungkin belum terisi. Perhatikan tanda titik tetap ada sebelum kurung sikunya, sebab menulis `respons.daftar?[0]` tanpa titik adalah kesalahan sintaks.',
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
      p(
        'Baris pertama menunjukkan pasangan yang akan sering kamu tulis, dengan `?.` yang mengamankan penelusuran dan `??` yang menyediakan nilai cadangan bila hasilnya ternyata kosong. Bagian bawahnya menjelaskan kenapa `??` layak dipelajari terpisah dari `||` yang sudah lebih dulu kamu kenal. `||` menganggap **semua nilai falsy** sebagai kosong, termasuk angka `0`, string kosong `\'\'`, dan `false`. Padahal ketiganya sering kali data yang sah, misalnya stok yang benar-benar nol, catatan yang sengaja dikosongkan, atau pengaturan yang memang dimatikan. `??` jauh lebih sempit, sebab ia hanya menggantikan `null` dan `undefined`, yaitu dua nilai yang artinya benar-benar "tidak ada nilainya". Aturan praktisnya, pakai `??` untuk nilai bawaan dan simpan `||` untuk pemeriksaan benar-salah biasa.',
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
      p(
        '`Object.entries(skor)` mengubah object menjadi array pasangan `[kunci, nilai]`, dan begitu berbentuk array ia bisa dipakai bersama `for...of` maupun method array biasa. Perhitungan `rataRata` di atas memanfaatkan ini, sebab `Object.values(skor)` mengambil hanya nilainya sebagai array angka, lalu `reduce` menjumlahkannya, lalu hasilnya dibagi `.length`-nya. Baris terakhir menunjukkan pola sebaliknya, yaitu **menyaring** object. `Object.entries` membongkarnya jadi array, `filter` menyaring pasangan yang nilainya `>= 80`, lalu `Object.fromEntries` merakitnya kembali jadi object. Perhatikan `[, nilai]` di dalam `filter`, sebab koma tanpa nama di depannya sengaja melewati elemen pertama (kuncinya), karena bagian itu tidak dibutuhkan pemeriksaan ini.',
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
      p(
        'Object `o` sengaja dibuat memuat kasus yang membingungkan, yaitu kunci `b` yang **ada** tetapi isinya `undefined`. Dari situ, tiga cara pengecekan memberi jawaban yang berbeda. `in` dan `Object.hasOwn` sama-sama menjawab `true` karena yang mereka periksa adalah keberadaan kuncinya. Sedangkan `o.b !== undefined` menjawab `false`, karena ia sebenarnya memeriksa **isinya**, dan isi yang `undefined` tidak bisa dibedakan dari kunci yang memang tidak pernah ada. Perbedaan ini penting saat menangani data dari API, sebab "field tidak dikirim" dan "field dikirim tapi kosong" sering punya arti yang berbeda. Antara `in` dan `Object.hasOwn`, pilih yang kedua, karena `in` juga menjawab `true` untuk property warisan dari prototype (misalnya `\'toString\' in o` bernilai `true` pada object mana pun), sementara `Object.hasOwn` hanya melihat property milik object itu sendiri.',
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
      p(
        'Perbedaan `dangkal` dan `dalam` di sini adalah kasus nyata dari **shallow vs deep copy** yang sudah dibahas di sub-bab tipe data: spread `{ ...asli }` hanya menyalin lapisan pertama, sehingga `profil` di dalamnya masih berupa alamat yang **sama persis** dengan `asli.profil` — mengubah `dangkal.profil.kota` ikut mengubah `asli.profil.kota` karena keduanya sebenarnya menunjuk object yang sama. `structuredClone` menelusuri sampai ke lapisan terdalam dan membuat semuanya baru, sehingga `dalam.profil` benar-benar terpisah dari `asli.profil`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi yang kamu kerjakan punya halaman pengaturan. Ada nilai bawaan yang berlaku untuk semua orang, dan tiap pengguna boleh menimpa sebagian saja dari nilai itu. Pengguna yang belum pernah membuka halaman pengaturan harus tetap mendapat seluruh nilai bawaan, dan pengguna yang hanya mengubah satu hal tidak boleh kehilangan sisanya. Kedengarannya sepele, dan justru di sinilah bug yang sangat sering terjadi.',
      ),
      code(
        'js',
        `
        const bawaan = {
          tema: 'terang',
          notifikasi: { email: true, push: false },
          perHalaman: 20,
        };

        // Yang tersimpan di database untuk pengguna ini, hanya sebagian.
        const dariPengguna = {
          tema: 'gelap',
          notifikasi: { push: true },
        };

        const gabungan = { ...bawaan, ...dariPengguna };

        console.log(gabungan.tema);         // 'gelap'                  <- benar
        console.log(gabungan.perHalaman);   // 20                       <- benar
        console.log(gabungan.notifikasi);   // { push: true }           <- SALAH
        `,
        { filename: 'src/pengaturan.js — versi yang bermasalah' },
      ),
      p(
        'Dua baris pertama benar dan baris ketiga salah, dan pola itulah yang membuat bug ini lolos dari pengujian. Spread menggabungkan **satu lapis**. Untuk `tema` dan `perHalaman`, satu lapis memang cukup, sehingga nilai pengguna menimpa bawaan dan yang tidak diisi tetap terbawa. Untuk `notifikasi`, nilai pengguna adalah object utuh yang menimpa object bawaan secara keseluruhan, sehingga `email: true` yang tidak pernah pengguna sentuh justru lenyap. Akibat nyatanya pengguna berhenti menerima email pemberitahuan tanpa pernah mematikannya.',
      ),
      code(
        'js',
        `
        const gabungan = {
          ...bawaan,
          ...dariPengguna,
          // Lapisan bersarang digabung sendiri, satu per satu.
          notifikasi: { ...bawaan.notifikasi, ...dariPengguna.notifikasi },
        };

        console.log(gabungan.notifikasi);   // { email: true, push: true }
        `,
        { filename: 'src/pengaturan.js — perbaikannya' },
      ),
      p(
        'Perbaikannya menyebut lapisan bersarang secara eksplisit setelah kedua spread. Urutannya penting, sebab kunci yang ditulis belakangan menang, jadi `notifikasi` yang kamu tulis sendiri menimpa `notifikasi` yang datang dari `...dariPengguna`. Di dalamnya pola yang sama diulang satu tingkat lebih dalam. Cara ini terlihat bertele-tele, dan itu memang harga yang dibayar untuk kejelasan. Kalau struktur pengaturanmu punya empat atau lima lapis, itu justru pertanda strukturnya perlu diratakan, bukan pertanda kamu butuh library penggabung.',
      ),
      p(
        'Bagian kedua studi kasus ini soal membaca data yang bentuknya tidak kamu kendalikan. Respons API sering punya lapisan pembungkus, dan sebagian field boleh kosong.',
      ),
      code(
        'js',
        `
        const respons = { data: { pengguna: { profil: null } } };

        // Tanpa penjaga, baris ini melempar TypeError.
        // const kota = respons.data.pengguna.profil.kota;

        const kota = respons.data?.pengguna?.profil?.kota ?? 'belum diisi';
        console.log(kota);   // 'belum diisi'
        `,
      ),
      p(
        'Tanda `?.` berhenti dengan aman begitu bertemu `null` atau `undefined` lalu menghasilkan `undefined`, alih-alih melanjutkan dan melempar error. Tanda `??` di belakangnya menyediakan nilai pengganti. Yang perlu diperhatikan adalah `??` sengaja dipakai bukan `||`, sebab `||` juga akan mengganti nilai yang sah seperti angka nol dan teks kosong. Kalau kota pengguna sungguhan bernama kosong karena ia belum mengisinya, `||` dan `??` sama saja, tapi untuk field angka seperti `perHalaman` yang boleh bernilai nol, perbedaannya menentukan.',
      ),
      callout(
        'warning',
        'Jangan pasang `?.` di seluruh rantai tanpa berpikir',
        'Kalau `respons.data` seharusnya selalu ada, menulis `respons.data?.` justru menyembunyikan kesalahan yang seharusnya kamu ketahui. Pakai `?.` hanya pada bagian yang memang boleh kosong menurut kontrak API-nya, dan biarkan sisanya melempar error kalau ternyata kosong.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Tiga error di bawah semuanya muncul saat sebuah nilai diperlakukan sebagai object padahal bukan.',
      ),
      code(
        'text',
        `
        Object.keys(pengaturan);
               ^

        TypeError: Cannot convert undefined or null to object
        `,
        { caption: '`Object.keys` menerima `null` atau `undefined`.' },
      ),
      p(
        'Pesan ini muncul dari `Object.keys`, `Object.values`, dan `Object.entries` ketika argumennya kosong. Kasus paling sering adalah data dari server yang belum sampai, sehingga variabelnya masih `undefined` saat komponen pertama kali dirender. Perbaikannya memberi nilai cadangan di tempat, misalnya `Object.keys(pengaturan ?? {})`, yang menghasilkan array kosong alih-alih error. Perhatikan `Object.keys({})` sendiri sah dan menghasilkan `[]`, jadi object kosong bukan masalah, hanya ketiadaan object yang masalah.',
      ),
      code(
        'text',
        `
        console.log(profil.nama.toUpperCase());
                                ^

        TypeError: Cannot read properties of null (reading 'toUpperCase')
        `,
        { caption: 'Field ada di database tapi isinya `null`.' },
      ),
      p(
        'Bedakan pesan ini dari versi `undefined`-nya, sebab keduanya menunjuk penyebab yang berbeda. `null` berarti field-nya memang ada dan sengaja dikosongkan, dan itu biasanya berarti kolom di database memang boleh kosong. `undefined` berarti field-nya tidak dikirim sama sekali, dan itu biasanya berarti API-nya tidak menyertakannya atau nama field-nya berbeda dari dugaanmu. Perbaikan untuk `null` adalah menyediakan nilai tampilan cadangan, sedangkan perbaikan untuk `undefined` biasanya memeriksa ulang bentuk responsnya.',
      ),
      code(
        'text',
        `
        const total = { a: 1 } + { b: 2 };
        console.log(total);

        [object Object][object Object]
        `,
        { caption: 'Tidak ada error, dan itu justru masalahnya.' },
      ),
      p(
        'Teks `[object Object]` adalah hasil ketika sebuah object dipaksa menjadi teks, dan ia sangat sering muncul di layar pengguna sungguhan. Penyebabnya biasanya object ikut masuk ke dalam template literal atau ke `textContent` tanpa dipilih field-nya lebih dulu. Kalau kamu melihat teks itu di halaman, cari tempat sebuah object dipakai di posisi yang seharusnya diisi teks, lalu ganti dengan field yang benar. Untuk keperluan debug, `console.log(JSON.stringify(obj, null, 2))` menampilkan isinya dengan rapi.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot convert undefined or null to object`',
            '`Object.keys`, `values`, atau `entries` menerima nilai kosong',
            'Beri cadangan di tempat, misalnya `Object.keys(x ?? {})`',
          ],
          [
            "`Cannot read properties of null (reading 'x')`",
            'Field-nya ada tapi isinya sengaja dikosongkan',
            'Pakai `?.` lalu `??` untuk menyediakan nilai tampilan',
          ],
          [
            '`[object Object]` muncul di halaman',
            'Object dipakai di posisi yang seharusnya teks',
            'Pilih field-nya, atau pakai `JSON.stringify` bila memang perlu seluruh isinya',
          ],
          [
            'Nilai bawaan hilang setelah digabung',
            'Spread hanya menggabung satu lapis',
            'Gabung lapisan bersarangnya sendiri, atau ratakan struktur pengaturannya',
          ],
          [
            'Kunci angka muncul lebih dulu saat ditelusuri',
            'Kunci berupa angka selalu diurutkan naik dan ditaruh di depan',
            'Kalau urutan penting, simpan sebagai array atau `Map`, bukan object',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Object terlihat sederhana, dan justru karena itu sebagian besar kesalahan di bawah tidak menghasilkan error apa pun. Programnya jalan, dan nilainya salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `||` untuk memberi nilai bawaan',
            'Bentuknya pendek dan sudah dipakai di mana-mana',
            'Angka `0`, teks kosong, dan `false` ikut tergantikan padahal ketiganya nilai yang sah. Pakai `??` yang hanya bereaksi pada `null` dan `undefined`',
          ],
          [
            'Memakai `obj.hasOwnProperty(k)` langsung',
            'Namanya jelas dan sudah lama ada',
            'Kalau object-nya punya kunci bernama `hasOwnProperty`, pemanggilannya gagal. `Object.hasOwn(obj, k)` aman untuk semua kasus',
          ],
          [
            'Memeriksa keberadaan kunci dengan `if (obj.k)`',
            'Terlihat ringkas dan biasanya benar',
            "Kunci yang ada tapi bernilai `0`, `''`, atau `false` dianggap tidak ada. Untuk memeriksa keberadaan, pakai `Object.hasOwn` atau `k in obj`",
          ],
          [
            'Memakai `in` untuk memeriksa kunci milik object itu sendiri',
            "`'nama' in obj` terbaca sangat alami",
            "`in` juga menemukan kunci warisan seperti `toString`, sehingga `'toString' in {}` bernilai `true`",
          ],
          [
            'Menyimpan urutan data di dalam object',
            'Saat dicetak urutannya memang sesuai',
            'Kunci berupa angka selalu naik ke depan dan diurutkan menaik, jadi urutan penulisanmu tidak dijaga untuk kunci angka',
          ],
          [
            'Memakai object sebagai penampung yang kuncinya datang dari pengguna',
            'Object memang penampung pasangan kunci dan nilai',
            'Kunci seperti `__proto__` bisa mengubah perilaku object. Untuk kunci yang tidak kamu kendalikan, pakai `Map` atau `Object.create(null)`',
          ],
        ],
      ),
      p(
        'Baris pertama adalah yang paling sering merugikan di aplikasi nyata, dan contohnya mudah dibayangkan. Bayangkan `perHalaman` bisa diisi nol untuk berarti tampilkan semua. Dengan `pengaturan.perHalaman || 20`, pilihan pengguna diam-diam berubah menjadi 20 setiap kali ia memilih nol. Tidak ada error, tidak ada peringatan, dan pengguna hanya merasa tombolnya tidak berfungsi.',
      ),
      callout(
        'tip',
        'Kapan memilih `Map` alih-alih object biasa',
        'Pakai `Map` kalau kuncinya datang dari pengguna atau dari data luar, kalau kamu butuh urutan penyisipan dijaga apa adanya, atau kalau kuncinya bukan teks. Pakai object biasa untuk struktur yang bentuknya kamu tulis sendiri di kode, sebab bentuk itulah yang paling enak dibaca dan paling mudah diketik.',
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
    18,
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
            'Fungsi bawaan React yang mengembalikan **array berisi dua elemen**, yaitu nilai yang sedang disimpan dan fungsi untuk mengubahnya. Karena hasilnya array, ia selalu ditulis dengan destructuring array, dan karena berbasis posisi kamu bebas menamai keduanya apa saja. `const [hitungan, setHitungan] = useState(0)` dan `const [n, setN] = useState(0)` sama sahnya, dan kebiasaan `setXxx` murni kesepakatan komunitas.',
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
      p(
        'Kunci membaca semua bentuk di atas adalah satu kalimat, yaitu **sisi kiri `=` bukan lagi nama variabel, melainkan pola yang harus dicocokkan dengan bentuk object di sisi kanan.** `const { nama, umur } = pengguna` berarti "carikan property bernama `nama` dan `umur`, lalu buatkan variabel dengan nama yang sama". Karena pencocokannya berdasarkan **nama**, urutan penulisannya sama sekali tidak berpengaruh. Titik dua di `{ nama: namaLengkap }` sering disalahartikan sebagai "isi `namaLengkap` ke `nama`", padahal arahnya justru sebaliknya, yaitu ambil property `nama` lalu simpan ke variabel bernama `namaLengkap`. Tanda `=` di `{ negara = \'Indonesia\' }` adalah nilai cadangan, dan penting diingat ia **hanya terpicu oleh `undefined`**, sehingga kalau `pengguna.negara` bernilai `null`, defaultnya tidak dipakai dan hasilnya tetap `null`. Baris terakhir menumpuk pola di dalam pola. `profil: { alamat: { kota } }` menyusuri tiga tingkat sekaligus, dan perlu dicatat bahwa `profil` maupun `alamat` di sana **tidak** menjadi variabel, sebab keduanya hanya jalan menuju `kota`.',
      ),
      callout(
        'warning',
        'Destructuring bersarang tidak aman terhadap data kosong',
        'Kalau `profil` tidak ada, baris terakhir di atas melempar `TypeError`. Beri default di tiap tingkat lewat `const { profil: { alamat = {} } = {} } = data;`, atau lebih sederhana pakai `?.` biasa untuk data yang tidak terjamin bentuknya.',
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
      p(
        'Bedanya dengan destructuring object hanya satu tetapi menentukan semuanya, yaitu di sini pencocokan berdasarkan **posisi** dan bukan nama. Karena itu `pertama` dan `kedua` boleh dinamai apa saja, sebab yang menentukan isinya adalah urutan penulisannya. Baris `const [, , ketiga]` memanfaatkan hal itu, sebab dua koma di depan sengaja mengosongkan posisi pertama dan kedua, sehingga `ketiga` mendapat elemen di indeks 2. Baris berikutnya menunjukkan default bekerja sama seperti pada object, karena `b` mendapat `\'y\'` karena arraynya hanya berisi satu elemen, sehingga posisi kedua bernilai `undefined`. Baris terakhir adalah trik yang sering dipamerkan. `[x, y] = [y, x]` menukar isi dua variabel karena sisi kanan dievaluasi lebih dulu menjadi array `[2, 1]`, baru kemudian dibongkar ke `x` dan `y`. Nilai lamanya sudah "diamankan" di dalam array sementara itu, jadi tidak ada yang tertimpa.',
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
      p(
        'Perhatikan `ditimpa` di atas, karena urutan penulisan menentukan siapa yang menang saat ada kunci yang sama. `{ ...dasar, x: 9 }` menyalin seluruh isi `dasar` dulu (termasuk `x: 1`), lalu menimpa `x` dengan `9` karena ditulis belakangan. Kalau urutannya dibalik jadi `{ x: 9, ...dasar }`, hasilnya justru `{ x: 1 }` karena `dasar` yang menimpa belakangan. Aturan sederhananya, siapa yang ditulis paling akhir, dialah yang menang. `Math.max(...[3, 7, 2])` menunjukkan pemakaian spread yang berbeda, sebab ia bukan menggabung dua array melainkan **membongkar** satu array menjadi argumen-argumen terpisah, karena `Math.max` menerima banyak angka satu per satu, bukan satu array sekaligus.',
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
      p(
        'Ketiga contoh memakai tanda `...` yang sama persis dengan spread, tetapi arah kerjanya terbalik, sebab ia bukan menumpahkan isi melainkan menampung apa yang tersisa. Pada `[utama, ...sisanya]`, posisi pertama diambil sendiri dan **seluruh** sisanya dikumpulkan ke satu array baru. Contoh kedua adalah pola yang sangat berguna di praktik. `const { id, ...tanpaId }` menghasilkan salinan object **tanpa** field `id`, dan ini cara paling bersih untuk membuang satu field tanpa menyentuh object aslinya, dan jauh lebih aman daripada `delete`, yang mengubah object di tempat. Contoh ketiga memindahkan gagasan yang sama ke parameter fungsi, sebab `function total(...angka)` membuat fungsi yang bisa dipanggil dengan berapa pun argumen, dan semuanya tiba di dalam sebagai satu array biasa yang siap dipakai dengan `reduce`. Satu batasan yang perlu diingat, rest wajib berada di **posisi terakhir**, karena secara logika tidak mungkin ada "sisa" yang masih diikuti sesuatu.',
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
      p(
        'Potongan React itu memakai **kedua** sisi tanda `...` sekaligus dalam satu baris, dan itulah sebabnya ia dipilih sebagai contoh penutup. Di daftar parameter, `{ variant, ...propsSisanya }` adalah **rest**, sebab ia mengambil `variant` untuk dipakai sendiri memilih kelas CSS, lalu mengumpulkan seluruh props lain yang dikirim pemanggil seperti `onClick`, `disabled`, `type`, dan `aria-label` ke satu object. Di dalam JSX, `{...propsSisanya}` adalah **spread**, sebab ia menumpahkan kembali isi object itu menjadi atribut-atribut terpisah pada `<button>`. Hasilnya sebuah komponen yang punya gaya sendiri tapi tetap menerima semua kemampuan bawaan tombol HTML, tanpa kamu harus menuliskan atributnya satu per satu, dan tanpa `variant` ikut bocor ke DOM sebagai atribut yang tidak dikenal browser.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Ada satu tugas yang muncul di hampir semua project yang punya login, yaitu mengirim data pengguna ke browser tanpa ikut mengirim hal yang tidak boleh dilihat. Baris pengguna di database berisi hash kata sandi, id peran internal, dan mungkin catatan admin. Semua itu tidak boleh ikut terkirim, dan menghapusnya satu per satu dengan `delete` mudah terlewat begitu ada kolom baru ditambahkan.',
      ),
      code(
        'js',
        `
        const pengguna = {
          id: 7,
          nama: 'Sari',
          email: 's@x.id',
          kataSandiHash: '$2b$10$x',
          peranId: 3,
        };

        // Ambil yang berbahaya ke variabelnya sendiri, kumpulkan sisanya ke 'aman'.
        const { kataSandiHash, peranId, ...aman } = pengguna;

        console.log(aman);   // { id: 7, nama: 'Sari', email: 's@x.id' }
        res.json(aman);
        `,
        { filename: 'Membuang field sensitif dengan rest' },
      ),
      p(
        'Pola ini disebut membuang lewat rest, dan yang membuatnya lebih aman daripada `delete` adalah ia bekerja dengan cara memilih apa yang **ikut** bukan apa yang **dibuang**. Dua nama di depan diambil keluar, dan `...aman` mengumpulkan seluruh sisanya ke object baru. Object `pengguna` yang asli tidak berubah sama sekali, jadi kode lain yang masih membutuhkan `peranId` tetap bisa memakainya. Kalau nanti ada kolom baru bernama `catatanAdmin`, ia akan ikut ke `aman` secara otomatis, dan itu sisi lemahnya yang perlu kamu sadari.',
      ),
      callout(
        'danger',
        'Untuk data yang benar-benar sensitif, pilih yang ikut bukan yang dibuang',
        'Bentuk `const { kataSandiHash, ...aman } = pengguna` gagal secara diam-diam begitu ada kolom rahasia baru ditambahkan ke tabel, sebab kolom baru itu otomatis ikut terkirim. Untuk endpoint yang mengeluarkan data pengguna, lebih aman menyusun objectnya secara eksplisit dengan `{ id, nama, email }`. Aturan ini bagian dari prinsip mengirim data seminimal mungkin yang dibahas di Kategori Keamanan Fullstack.',
      ),
      p(
        'Bagian kedua studi kasus ini adalah bentuk yang akan kamu tulis berkali-kali sepanjang belajar React, yaitu fungsi yang menerima satu object berisi banyak pilihan.',
      ),
      code(
        'js',
        `
        function buatTabel({
          data,                       // wajib
          perHalaman = 20,            // ada nilai bawaan
          urutan: kolomUrut = 'id',   // diganti nama sekaligus diberi bawaan
          ...sisa                     // pilihan lain diteruskan apa adanya
        } = {}) {                     // seluruh argumennya sendiri punya bawaan
          return { jumlah: data.length, perHalaman, kolomUrut, sisa };
        }

        buatTabel({ data: [1, 2, 3], urutan: 'nama', ketat: true });
        // { jumlah: 3, perHalaman: 20, kolomUrut: 'nama', sisa: { ketat: true } }
        `,
        { filename: 'src/tabel.js' },
      ),
      p(
        "Empat teknik berbeda dipakai bersamaan di satu tanda kurung, dan tiap barisnya menyelesaikan masalah yang berbeda. `data` diambil apa adanya dan tidak diberi bawaan, sehingga ketiadaannya akan ketahuan. `perHalaman = 20` memberi nilai bawaan yang hanya berlaku saat nilainya `undefined`. Baris `urutan: kolomUrut = 'id'` melakukan dua hal sekaligus, yaitu mengambil kunci bernama `urutan` lalu menaruhnya di variabel bernama `kolomUrut`, sambil menyediakan bawaan. Penggantian nama seperti ini berguna saat nama dari luar bentrok dengan nama yang sudah ada di dalam fungsi.",
      ),
      p(
        'Tanda `= {}` di akhir adalah bagian yang paling sering dilupakan, dan tanpanya `buatTabel()` tanpa argumen langsung melempar error. Dengan `= {}`, memanggil tanpa argumen menghasilkan object kosong yang kemudian dibongkar seperti biasa, sehingga seluruh nilai bawaan berlaku. Perlu dicatat pada contoh ini `data` tetap tidak punya bawaan, jadi `buatTabel()` masih akan gagal saat `data.length` dibaca, dan itu memang disengaja karena tabel tanpa data memang tidak masuk akal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Destructuring menghasilkan dua jenis error yang bentuknya sangat khas, sehingga begitu kamu mengenalinya sekali kamu akan langsung tahu penyebabnya.',
      ),
      code(
        'text',
        `
        const { nama } = pengguna;
              ^

        TypeError: Cannot destructure property 'nama' of 'undefined'
        as it is undefined.
        `,
        { caption: 'Yang dibongkar ternyata tidak ada.' },
      ),
      p(
        'Pesan ini menyebut nama propertinya di depan, dan itu sering membuat orang mengira `nama` yang bermasalah. Bacalah bagian setelah `of`, sebab di situlah penyebab sebenarnya disebut. Yang `undefined` adalah `pengguna`, bukan `nama`. Di React, penyebab paling sering adalah komponen dirender sebelum datanya sampai. Perbaikan cepatnya menambahkan `= {}` seperti pada studi kasus di atas, dan perbaikan sebenarnya menampilkan keadaan memuat sampai datanya benar-benar ada.',
      ),
      code(
        'text',
        `
        const [...awal, terakhir] = daftar;
                        ^

        SyntaxError: Rest element must be last element
        `,
        { caption: 'Rest ditaruh bukan di posisi terakhir.' },
      ),
      p(
        'Ini `SyntaxError` dan bukan `TypeError`, dan bedanya penting. `SyntaxError` berarti berkasnya bahkan tidak dijalankan sama sekali, sehingga seluruh halaman atau seluruh skrip mati bukan hanya bagian ini. Alasan aturannya masuk akal kalau dipikirkan sebentar, sebab rest berarti kumpulkan sisanya, dan tidak ada yang bisa disebut sisa kalau masih ada yang datang sesudahnya. Untuk mengambil elemen terakhir, pakai `daftar.at(-1)`.',
      ),
      code(
        'text',
        `
        const { alamat: { kota } } = pengguna;
                          ^

        TypeError: Cannot read properties of undefined (reading 'kota')
        `,
        { caption: 'Membongkar dua lapis padahal lapisan pertamanya kosong.' },
      ),
      p(
        'Membongkar bersarang hanya aman kalau seluruh lapisan di atasnya dijamin ada. Kalau `alamat` boleh kosong, bentuk yang aman adalah `const { alamat: { kota } = {} } = pengguna`, yang memberi bawaan pada lapisan tengahnya. Sebagian besar waktu, membongkar dua lapis sekaligus justru membuat kode lebih sulit dibaca dan lebih rapuh, jadi pertimbangkan menulis `pengguna.alamat?.kota` yang lebih jelas maksudnya.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot destructure property 'x' of 'undefined'`",
            'Object yang dibongkar tidak ada, bukan propertinya',
            'Beri bawaan `= {}`, atau tunda pembongkarannya sampai datanya ada',
          ],
          [
            '`Rest element must be last element`',
            'Rest ditulis sebelum elemen lain',
            'Pindahkan ke posisi terakhir, atau pakai `at(-1)` untuk elemen terakhir',
          ],
          [
            '`Cannot read properties of undefined` saat membongkar bersarang',
            'Lapisan tengahnya kosong',
            'Beri bawaan pada lapisan tengah, atau pakai `?.` alih-alih membongkar',
          ],
          [
            '`Invalid destructuring assignment target`',
            'Membongkar ke variabel yang sudah ada tanpa membungkusnya dengan tanda kurung',
            'Tulis `({ a } = obj)` dengan tanda kurung mengelilingi seluruh baris',
          ],
          [
            'Nilai bawaan tidak berlaku padahal field-nya kosong',
            'Isinya `null`, dan bawaan hanya berlaku untuk `undefined`',
            "Pakai `??` setelah membongkar, misalnya `const kota = obj.kota ?? '-'`",
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sebagian besar kesalahan di bawah berasal dari mengira destructuring adalah penyalinan. Ia bukan penyalinan melainkan pengambilan, dan perbedaannya baru terasa saat nilainya berupa object.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira nilai bawaan berlaku juga untuk `null`',
            'Keduanya sama-sama berarti kosong',
            'Bawaan hanya berlaku untuk `undefined`. Untuk `null` kamu tetap mendapat `null`, jadi tambahkan `??` sesudahnya',
          ],
          [
            'Mengira `const { a } = obj` membuat salinan `a`',
            'Ia memang variabel baru',
            'Kalau `a` berupa object, variabel barunya menunjuk object yang sama. Mengubah isinya tetap mengubah `obj.a`',
          ],
          [
            'Memakai spread untuk menyalin object bersarang',
            'Untuk object satu lapis memang benar-benar menyalin',
            'Lapisan dalamnya tetap dibagi bersama. Untuk salinan penuh pakai `structuredClone`',
          ],
          [
            'Membongkar terlalu banyak sekaligus di satu baris',
            'Terlihat efisien dan hemat baris',
            'Baris yang membongkar delapan nama sulit dibaca dan sulit diubah. Bongkar yang dipakai saja, sisanya baca langsung',
          ],
          [
            'Menulis `{ a } = obj` tanpa tanda kurung di baris tersendiri',
            'Bentuknya sama dengan yang biasa dipakai setelah `const`',
            'Tanpa `const`, kurung kurawal di awal baris dibaca sebagai blok kode. Bungkus seluruh baris dengan tanda kurung',
          ],
          [
            'Memakai rest untuk membuang field rahasia dari respons API',
            'Field yang tidak diinginkan memang hilang',
            'Kolom rahasia baru yang ditambahkan nanti akan ikut terkirim tanpa ada yang sadar. Susun object keluarannya secara eksplisit',
          ],
        ],
      ),
      p(
        "Baris pertama layak diingat baik-baik karena ia sangat sering muncul saat membaca data dari database. Kolom yang boleh kosong biasanya bernilai `null`, bukan `undefined`, sehingga `const { kota = '-' } = alamat` tetap menghasilkan `null` dan bukan tanda hubung. Bentuk yang benar untuk kasus itu adalah membongkar dulu lalu memberi cadangan dengan `??`, atau langsung menulis `alamat.kota ?? '-'`.",
      ),
      callout(
        'tip',
        'Kapan destructuring justru merugikan keterbacaan',
        'Kalau sebuah nama hanya dipakai satu kali, membacanya langsung dengan `pengguna.email` lebih jelas daripada membongkarnya lebih dulu. Destructuring paling menguntungkan saat sebuah nama dipakai berkali-kali dalam satu fungsi, atau saat kamu ingin menyatakan di baris pertama fungsi bahwa inilah bagian yang dibutuhkan fungsi ini.',
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
          note: 'Semua bentuk destructuring, mulai dari object, array, bersarang, default, sampai alias, di satu halaman.',
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
    15,
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
            'Artinya **tidak bisa diubah isinya**. String di JavaScript bersifat immutable, dan konsekuensinya sangat praktis, yaitu **setiap method string mengembalikan string baru dan tidak pernah menyentuh yang lama**. Karena itu menulis `s.trim();` sendirian tidak melakukan apa-apa yang terlihat, sebab hasilnya dibuang begitu saja. Kamu harus menyimpannya lewat `const bersih = s.trim();`. Ini kesalahan yang sangat mudah terlewat karena tidak memunculkan error apa pun.',
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
      p(
        'Bandingkan dua baris pertama. Cara lama memaksamu mengurus tanda kutip, tanda plus, dan **spasi di tempat yang tepat** secara manual. Perhatikan `\'Halo \'` yang harus diakhiri spasi, karena kalau lupa hasilnya menempel jadi "HaloZum". Template literal menghilangkan seluruh urusan itu, sebab teksnya ditulis apa adanya, dan hanya bagian yang berubah yang diberi tanda `${ }`. Dua baris berikutnya menegaskan bahwa isi `${ }` bukan sekadar nama variabel, sebab apa pun yang menghasilkan nilai boleh masuk ke sana, termasuk perhitungan `jumlah * 2` dan ternary. Bagian multi-baris di akhir juga bekerja tanpa `\\n` sama sekali, sebab enter yang kamu tekan di editor benar-benar tersimpan sebagai baris baru di dalam string. Satu syarat mutlak untuk semua ini adalah **backtick**, karena memakai kutip tunggal membuat `${nama}` tampil apa adanya di layar, dan inilah kesalahan nomor satu pemula pada sub-bab ini.',
      ),
      callout(
        'warning',
        'Indentasi ikut terbawa',
        'Semua spasi di awal baris kedua dan seterusnya ikut masuk ke dalam string. Kalau format teksnya penting, misalnya untuk `<pre>`, rapatkan ke kiri atau bersihkan dengan `.trim()` per baris.',
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
      p(
        "Perhatikan `slice(0, 4)` dan `slice(-5)`, sebab argumen positif menghitung dari depan (`0` adalah karakter pertama), sementara argumen negatif menghitung mundur dari belakang, sehingga `-5` berarti \"lima karakter terakhir\". `split('')` memisah teks per karakter karena pemisahnya adalah string kosong, sehingga setiap posisi dianggap batas, sedangkan `split('-')` memisah tepat di setiap tanda hubung. `join('-')` mengerjakan kebalikannya dengan menyatukan array menjadi satu string dengan tanda hubung sebagai penyambung antar elemen.",
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
      p(
        'Empat method pertama menjawab pertanyaan yang mirip tapi tidak sama. `includes` menjawab "ada di mana pun?", `startsWith` dan `endsWith` mempersempitnya ke awal dan akhir teks, dan ketiganya mengembalikan `true`/`false` sehingga langsung bisa dipakai di `if`. `indexOf` berbeda sendiri, sebab ia mengembalikan **angka posisi**. Angka `19` di contoh itu berarti kata "dari" mulai pada karakter ke-20, karena hitungannya mulai dari nol, dan ia mengembalikan `-1` bila tidak ketemu, jebakan yang sama persis seperti pada array. Dua baris terakhir adalah perbedaan yang paling sering memakan waktu debugging. `replace` dengan pola berupa teks biasa hanya mengganti **kemunculan pertama**, sehingga `\'a-b-c\'` menjadi `\'a+b-c\'` dan tanda hubung kedua tertinggal. Kalau maksudmu mengganti semuanya, `replaceAll` adalah jawabannya. Perlu diingat juga bahwa string bersifat *immutable*, sebab kedua baris itu **menghasilkan string baru** dan tidak mengubah teks aslinya, jadi hasilnya harus disimpan ke variabel agar tidak terbuang.',
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
      p(
        "Angka `2` pada `padStart(2, '0')` bukan \"tambahkan dua karakter\", melainkan **panjang total yang diinginkan**. Karena itu `'7'` yang panjangnya satu karakter mendapat satu nol di depan menjadi `'07'`, sedangkan teks yang sudah mencapai atau melebihi panjang itu dibiarkan apa adanya. Sifat inilah yang membuatnya aman dipakai untuk semua angka jam dari `0` sampai `23` tanpa pengecekan tambahan. Perhatikan juga `String(7)` yang membungkusnya, sebab `padStart` adalah method **string**, jadi angka harus diubah dulu menjadi teks. Contoh format jam di baris terakhir menggabungkan semuanya lewat dua `padStart` di dalam satu template literal, dan hasilnya `'09.05'`, bukan `'9.5'` yang membuat daftar jadwal terlihat melompat-lompat karena lebarnya tidak seragam.",
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
      p(
        "Perhatikan tiga cara yang sedikit berbeda di atas. `toLocaleString` langsung dipanggil pada angkanya sendiri dan cocok untuk kebutuhan sekali pakai. `new Intl.NumberFormat(...).format(...)` sedikit lebih panjang untuk ditulis, tetapi objek formatter-nya bisa **dipakai berulang kali** untuk banyak angka tanpa mengulang konfigurasi, sehingga lebih efisien kalau kamu memformat banyak nilai dengan aturan yang sama, misalnya seluruh baris di sebuah tabel harga. `Intl.DateTimeFormat` bekerja dengan prinsip yang sama tetapi untuk tanggal, dan `dateStyle: 'long'` menentukan seberapa lengkap tanggalnya ditulis, dan hasilnya otomatis dalam Bahasa Indonesia karena locale `'id-ID'` yang dioper.",
      ),
      callout(
        'info',
        'String tidak bisa diubah isinya',
        'Semua method di atas mengembalikan string **baru**; tidak ada satu pun yang mengubah aslinya. `s.trim()` tanpa menyimpan hasilnya tidak melakukan apa-apa — kesalahan yang mudah terlewat.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Blog toko yang kamu kerjakan butuh alamat halaman yang enak dibaca. Judul artikel ditulis bebas oleh penulisnya, lengkap dengan huruf besar, tanda baca, huruf beraksen, dan spasi berlebih di sana-sini. Dari judul itu harus lahir satu potongan alamat yang hanya berisi huruf kecil, angka, dan tanda hubung. Potongan itu disebut slug, dan membuatnya adalah salah satu tugas pengolahan teks yang paling sering muncul.',
      ),
      code(
        'js',
        `
        function buatSlug(judul) {
          return judul
            .normalize('NFD')                  // pisahkan huruf dari tanda aksennya
            .replace(/[\\u0300-\\u036f]/g, '')   // buang tanda aksennya
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\\s-]/g, '')      // buang selain huruf, angka, spasi, tanda hubung
            .replace(/\\s+/g, '-')              // spasi berapa pun jadi satu tanda hubung
            .replace(/-+/g, '-');              // tanda hubung beruntun jadi satu
        }

        buatSlug('  Café & Resto   Terbaik di Bandung! ');
        // 'cafe-resto-terbaik-di-bandung'
        `,
        { filename: 'src/slug.js' },
      ),
      p(
        "Tujuh method dirangkai berurutan, dan tiap satu menyelesaikan satu masalah yang tidak bisa diselesaikan yang lain. `normalize('NFD')` adalah bagian yang paling jarang diketahui, dan ia memecah satu huruf beraksen seperti `é` menjadi dua bagian terpisah, yaitu huruf `e` biasa dan tanda aksennya. Setelah dipecah, tanda aksennya bisa dibuang lewat penyaringan berikutnya, dan yang tersisa huruf `e` yang aman untuk alamat. Tanpa langkah ini, `é` akan ikut terbuang seluruhnya dan kata `café` berubah menjadi `caf`.",
      ),
      p(
        'Perhatikan urutan `toLowerCase` sebelum penyaringan huruf, dan itu bukan kebetulan. Pola `[^a-z0-9\\s-]` hanya menyebut huruf kecil, jadi kalau huruf besar belum diubah lebih dulu, seluruh huruf besar akan ikut terbuang dan `Bandung` menjadi `andung`. Dua `replace` terakhir juga berpasangan, sebab yang pertama mengubah setiap kelompok spasi menjadi satu tanda hubung sedangkan yang kedua merapikan tanda hubung yang sudah ada di judul asli agar tidak menumpuk.',
      ),
      p(
        'Semua `replace` di atas memakai tanda `g` di akhir polanya, dan tanpa itu hanya kemunculan pertama yang diganti. Ini kesalahan yang sangat sering terjadi, dan bagian error di bawah membahasnya lebih jauh.',
      ),
      p(
        'Bagian kedua studi kasus ini adalah membangun satu baris faktur yang siap ditampilkan, dan di sinilah pemformatan berbahasa Indonesia dipakai sungguhan.',
      ),
      code(
        'js',
        `
        const tanggal = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' })
          .format(new Date('2026-08-19'));

        const rupiah = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(240000);

        const nomor = \`INV-\${String(4).padStart(3, '0')}\`;

        console.log(\`\${nomor} | \${tanggal} | \${rupiah}\`);
        // INV-004 | 19 Agustus 2026 | Rp 240.000
        `,
        { filename: 'src/faktur.js' },
      ),
      p(
        "Tiga pemformat berbeda dipakai untuk tiga jenis nilai, dan tidak satu pun ditulis manual. `Intl.DateTimeFormat` dengan `id-ID` menghasilkan nama bulan berbahasa Indonesia tanpa kamu perlu menyediakan daftar nama bulan sendiri. `Intl.NumberFormat` dengan `currency: 'IDR'` memberi awalan `Rp` dan pemisah ribuan berupa titik, sesuai kebiasaan penulisan Indonesia. `padStart(3, '0')` mengubah angka 4 menjadi teks `004`, dan `String(4)` di depannya diperlukan karena `padStart` hanya ada pada teks bukan pada angka.",
      ),
      callout(
        'warning',
        'Pemisah setelah `Rp` bukan spasi biasa',
        "Karakter yang disisipkan `Intl.NumberFormat` di antara `Rp` dan angkanya adalah spasi non-breaking, yaitu `U+00A0`. Ia terlihat persis seperti spasi biasa di layar, tapi `hasil === 'Rp 240.000'` yang kamu ketik dengan spasi biasa akan bernilai `false`. Kalau sebuah test gagal padahal dua teksnya terlihat identik, inilah tersangka pertamanya.",
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dua error pertama di bawah menghentikan program, dan dua sisanya berjalan mulus dengan hasil yang salah.',
      ),
      code(
        'text',
        `
        const awal = pengguna.nama.toUpperCase();
                                  ^

        TypeError: Cannot read properties of undefined (reading 'toUpperCase')
        `,
        { caption: 'Method teks dipanggil pada nilai yang bukan teks.' },
      ),
      p(
        "Seluruh method teks hanya ada pada teks, sehingga memanggilnya pada `undefined` atau `null` selalu gagal. Ini sangat sering terjadi pada field yang boleh kosong di database, misalnya nama tengah atau nomor telepon. Perbaikan cepatnya `pengguna.nama?.toUpperCase()`, yang menghasilkan `undefined` alih-alih error. Kalau kamu butuh teks kosong sebagai hasilnya, tulis `(pengguna.nama ?? '').toUpperCase()`, dan bentuk kedua ini lebih aman kalau hasilnya langsung ditampilkan.",
      ),
      code(
        'text',
        `
        new Intl.DateTimeFormat('id-ID').format(new Date('19-08-2026'));
                                        ^

        RangeError: Invalid time value
        `,
        { caption: 'Teks tanggal tidak dikenali sebagai tanggal.' },
      ),
      p(
        'Penyebabnya hampir selalu format tanggal yang dibalik. JavaScript membaca teks tanggal dengan andal hanya dalam bentuk tahun bulan hari yang dipisah tanda hubung, yaitu `2026-08-19`. Format yang biasa ditulis orang Indonesia seperti `19-08-2026` menghasilkan tanggal tidak sah, dan yang lebih berbahaya adalah `08/19/2026` justru diterima karena dibaca sebagai format Amerika. Kalau datanya datang dari formulir, ubah ke bentuk baku lebih dulu sebelum diserahkan ke `new Date`.',
      ),
      code(
        'text',
        `
        console.log('a-b-c'.replace('-', '_'));

        a_b-c
        `,
        { caption: 'Tidak ada error, tapi hanya yang pertama diganti.' },
      ),
      p(
        "Ini perilaku bawaan `replace` yang paling sering menjebak, dan ia tidak memberi peringatan apa pun. Dengan pola berupa teks biasa, `replace` hanya mengganti kemunculan pertama. Ada dua jalan keluar, yaitu memakai `replaceAll('-', '_')` yang namanya sudah menjelaskan dirinya, atau memakai pola bertanda `g` seperti `replace(/-/g, '_')`. Untuk penggantian teks sederhana, `replaceAll` lebih terbaca dan tidak menuntut pembacanya paham regex.",
      ),
      code(
        'text',
        `
        'a-b'.replaceAll(/-/, '_');
              ^

        TypeError: String.prototype.replaceAll called with a
        non-global RegExp argument
        `,
        { caption: 'Pola regex diberikan ke `replaceAll` tanpa tanda `g`.' },
      ),
      p(
        "Aturan ini terlihat rewel, dan sebenarnya ia sedang menolak perintah yang bertentangan dengan dirinya sendiri. Nama `replaceAll` berarti ganti semuanya, sedangkan regex tanpa `g` berarti berhenti setelah yang pertama. Alih-alih diam-diam memilih salah satu, JavaScript menolak. Perbaikannya menambahkan `g` menjadi `replaceAll(/-/g, '_')`, atau lebih sederhana lagi memakai teks biasa sebagai polanya.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot read properties of undefined (reading 'toUpperCase')`",
            'Nilainya bukan teks, biasanya field yang boleh kosong',
            "Pakai `?.`, atau beri cadangan dengan `(nilai ?? '')`",
          ],
          [
            '`Invalid time value`',
            'Teks tanggalnya tidak dalam bentuk `YYYY-MM-DD`',
            'Ubah ke bentuk baku sebelum diserahkan ke `new Date`',
          ],
          [
            'Hanya kemunculan pertama yang terganti',
            '`replace` dengan pola teks biasa hanya mengganti sekali',
            'Pakai `replaceAll`, atau tambahkan `g` pada polanya',
          ],
          [
            '`replaceAll called with a non-global RegExp argument`',
            'Regex tanpa `g` diberikan ke `replaceAll`',
            'Tambahkan `g`, atau ganti polanya menjadi teks biasa',
          ],
          [
            '`Invalid count value: -1`',
            '`repeat` menerima angka negatif, biasanya hasil pengurangan',
            'Batasi dengan `Math.max(0, n)` sebelum dipakai',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Teks di JavaScript punya dua sifat yang sering dilupakan, yaitu ia tidak bisa diubah di tempat dan ia dihitung per unit kode bukan per huruf yang terlihat. Sebagian besar kesalahan di bawah berasal dari salah satu dari dua sifat itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `judul.trim()` lalu berharap `judul` ikut bersih',
            'Method-nya jelas dipanggil pada `judul`',
            'Teks tidak bisa diubah di tempat, jadi seluruh method teks mengembalikan teks baru. Tampung hasilnya dengan `judul = judul.trim()`',
          ],
          [
            'Menghitung jumlah karakter dengan `.length`',
            'Untuk teks biasa angkanya memang tepat',
            'Emoji dan sebagian huruf dihitung dua, sebab `.length` menghitung unit kode. Untuk jumlah karakter yang terlihat, pakai `[...teks].length`',
          ],
          [
            'Menggabung teks panjang dengan tanda tambah beruntun',
            'Cara ini paling awal dipelajari dan selalu bekerja',
            'Sulit dibaca dan mudah salah spasi. Template literal dengan backtick menampung baris baru apa adanya dan menyisipkan nilai lewat penanda dolar',
          ],
          [
            'Memakai `==` untuk membandingkan teks dari formulir',
            'Isinya sama-sama teks jadi tipenya pasti cocok',
            "Nilai dari formulir selalu teks, jadi `'5' == 5` bernilai `true` dan bisa menyembunyikan kesalahan. Pakai `===` selalu",
          ],
          [
            'Mengurutkan nama Indonesia dengan `sort()` biasa',
            'Hasilnya terlihat urut secara abjad',
            "Urutannya memakai nomor karakter, sehingga seluruh huruf besar mendahului huruf kecil. Pakai `sort((a, b) => a.localeCompare(b, 'id'))`",
          ],
          [
            'Membandingkan teks hasil `Intl` dengan teks yang diketik tangan',
            'Keduanya terlihat sama persis di layar',
            'Pemisah ribuan dan spasi setelah `Rp` bisa berupa karakter khusus. Bandingkan angka sebelum diformat, bukan teks sesudahnya',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering dibuat orang yang baru pindah dari bahasa lain. Di JavaScript, tidak ada satu pun method teks yang mengubah teks aslinya, jadi `judul.toUpperCase()` yang berdiri sendiri di satu baris tidak melakukan apa-apa yang terlihat. Kalau kamu memanggil method teks lalu tidak menampung hasilnya, hampir pasti itu baris yang sia-sia.',
      ),
      callout(
        'tip',
        'Jangan menyusun HTML dengan menggabung teks',
        'Template literal sangat nyaman untuk menyusun potongan HTML, dan di situlah bahayanya. Kalau nilai yang disisipkan berasal dari pengguna, ia bisa berisi tag yang ikut dijalankan browser, dan itu celah keamanan bernama XSS. Untuk teks yang berasal dari pengguna, isi lewat `textContent` bukan lewat `innerHTML`. Pembahasan lengkapnya ada di Bab 6 dan di Kategori Keamanan Fullstack.',
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
