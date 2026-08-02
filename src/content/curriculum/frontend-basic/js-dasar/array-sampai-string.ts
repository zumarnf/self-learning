import { callout, code, divider, h2, p, table, ul } from '@/lib/content/builders';
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
    ],
  ),
];
