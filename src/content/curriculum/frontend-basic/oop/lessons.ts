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
 * Frontend Basic — Chapter 2, all twelve lessons.
 *
 * Every code sample was executed before being written down.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-oop',
    'Kenapa OOP — dan kapan justru tidak perlu',
    9,
    'OOP sebagai alat, bukan kewajiban: masalah apa yang ia pecahkan, dan kapan fungsi biasa lebih tepat.',
    [
      p(
        'OOP lahir dari satu masalah yang nyata: ketika sebuah program tumbuh, **data dan perilaku yang mengurusnya tercecer di tempat berbeda**. Ada objek `pengguna` di satu berkas, dan lima fungsi yang mengubahnya di tiga berkas lain. Tidak ada yang menjaga aturan bahwa saldo tidak boleh negatif, karena siapa pun bisa menyentuhnya.',
      ),
      p(
        'OOP menjawabnya dengan mengikat data dan perilakunya jadi satu, lalu membatasi siapa boleh menyentuh apa.',
      ),

      terms(
        {
          term: 'OOP',
          meaning:
            'Singkatan *Object-Oriented Programming*, dibaca "o-o-pe", terjemahannya **pemrograman berorientasi objek**. Cara menyusun program dengan **mengikat data dan perilaku yang mengurusnya menjadi satu kesatuan**, lalu membatasi siapa saja yang boleh menyentuh data itu. Perlu ditegaskan sejak awal: ini adalah **satu di antara beberapa gaya**, bukan cara yang lebih benar. JavaScript sama-sama nyaman dipakai dengan gaya fungsional, dan React modern justru memilih gaya itu.',
        },
        {
          term: 'objek',
          meaning:
            'Dalam konteks OOP, artinya lebih sempit daripada "object" biasa di JavaScript: sebuah kesatuan yang punya **keadaan** (data yang ia simpan) sekaligus **perilaku** (fungsi yang mengurus data itu). Sebuah keranjang belanja punya keadaan berupa daftar isinya, dan perilaku berupa kemampuan menambah atau mengeluarkan barang.',
        },
        {
          term: 'keadaan',
          meaning:
            'Terjemahan dari *state*. Data yang dipegang sebuah objek dan **bisa berubah seiring waktu** — saldo dompet, isi keranjang, status login. Ini kata kunci untuk memutuskan perlu tidaknya sebuah class: kalau tidak ada keadaan yang berubah dan perlu dijaga, kemungkinan besar kamu hanya butuh fungsi biasa.',
        },
        {
          term: 'encapsulation',
          meaning:
            'Dibaca "en-kap-su-lei-syen", terjemahannya **pengapsulan**. Menyembunyikan keadaan internal sebuah objek sehingga ia **hanya bisa diubah lewat pintu yang kamu sediakan sendiri**. Nilainya bukan kerahasiaan, melainkan jaminan: kalau satu-satunya jalan menambah barang adalah lewat method `tambah()`, maka pemeriksaan "jumlah harus lebih dari nol" mustahil dilewati siapa pun.',
        },
        {
          term: 'inheritance',
          meaning:
            'Dibaca "in-he-ri-tens", terjemahannya **pewarisan**. Mengambil perilaku dari tipe lain sehingga tidak perlu menulisnya ulang. Di JavaScript ini dikerjakan lewat rantai prototype. Ini pilar yang paling sering **disalahgunakan** — dibahas tuntas beserta batasnya di Sub-bab 2.7 dan 2.10.',
        },
        {
          term: 'polymorphism',
          meaning:
            'Dibaca "po-li-mor-fism", dari bahasa Yunani *poly* (banyak) dan *morphe* (bentuk) — harfiahnya **berbagai bentuk**. Kemampuan satu pemanggilan yang sama menghasilkan perilaku berbeda tergantung objeknya. Memanggil `.gambar()` pada sebuah lingkaran dan pada sebuah persegi adalah pemanggilan yang identik, tapi yang terjadi di dalamnya berbeda sepenuhnya.',
        },
        {
          term: 'abstraction',
          meaning:
            'Dibaca "ab-strak-syen", terjemahannya **abstraksi**. Menampilkan **apa** yang bisa dilakukan sebuah objek sambil menyembunyikan **bagaimana** ia melakukannya. Setir mobil adalah abstraksi: kamu tahu memutarnya membelokkan mobil, tanpa perlu tahu apa pun tentang rack and pinion di baliknya.',
        },
        {
          term: 'instance',
          meaning:
            'Dibaca "in-stens", terjemahannya **wujud nyata** atau **contoh**. Satu objek konkret yang dibuat dari sebuah class. Kalau `Keranjang` adalah cetakannya, maka `new Keranjang()` menghasilkan satu instance — dan kamu bisa membuat sebanyak apa pun instance dari cetakan yang sama, masing-masing dengan isinya sendiri.',
        },
        {
          term: 'tree-shaking',
          meaning:
            'Kemampuan bundler membuang kode yang tidak pernah diimpor siapa pun agar berkas akhirnya lebih kecil. Disebut di sini karena berkaitan langsung dengan pilihan gaya: fungsi lepas yang diekspor satu per satu bisa dibuang sebagian, sementara sebuah class ikut terbawa utuh meski hanya satu method-nya yang dipakai.',
        },
      ),

      h2('Empat pilar, seperlunya'),
      table(
        ['Pilar', 'Artinya di JavaScript'],
        [
          [
            '**Encapsulation**',
            'Sembunyikan keadaan internal; ubah hanya lewat pintu yang kamu sediakan',
          ],
          ['**Inheritance**', 'Ambil perilaku dari tipe lain — di JS lewat rantai prototype'],
          ['**Polymorphism**', 'Satu pemanggilan, banyak implementasi'],
          ['**Abstraction**', 'Tampilkan *apa* yang bisa dilakukan, sembunyikan *bagaimana*'],
        ],
      ),
      p(
        'Dari empat itu, **encapsulation dan polymorphism** yang paling sering benar-benar berguna. Inheritance adalah yang paling sering disalahgunakan.',
      ),

      h2('Kapan OOP membantu'),
      code(
        'js',
        `
        // Ada aturan yang harus SELALU dijaga, apa pun yang terjadi
        class Keranjang {
          #item = [];

          tambah(produk, jumlah) {
            if (jumlah <= 0) throw new Error('Jumlah harus lebih dari nol');
            this.#item.push({ produk, jumlah });
          }

          get total() {
            return this.#item.reduce((t, i) => t + i.produk.harga * i.jumlah, 0);
          }
        }
        `,
        {
          caption:
            'Tidak ada cara membuat keranjang dengan jumlah negatif — aturannya dijaga tipe itu sendiri.',
        },
      ),

      h2('Kapan OOP justru menambah beban'),
      code(
        'js',
        `
        // SALAH: class tanpa keadaan yang perlu dijaga — hanya fungsi yang dibungkus
        class Kalkulator {
          jumlah(a, b) { return a + b; }
          kali(a, b) { return a * b; }
        }
        new Kalkulator().jumlah(1, 2);

        // BENAR: fungsi biasa. Lebih mudah diuji, lebih mudah dioper, lebih mudah di-tree-shake.
        export const jumlah = (a, b) => a + b;
        export const kali = (a, b) => a * b;
        `,
      ),
      callout(
        'tip',
        'Pertanyaan penentu',
        'Apakah objek ini punya **keadaan yang berubah** dan **aturan yang harus dijaga**? Kalau ya, class masuk akal. Kalau ia cuma sekumpulan fungsi tanpa keadaan — modul dengan fungsi lepas hampir selalu lebih baik.',
      ),
      callout(
        'info',
        'Di React, jawabannya hampir selalu "fungsi"',
        'Komponen React modern adalah fungsi, bukan class. Yang tetap kamu butuhkan dari bab ini adalah **`this`, prototype, dan composition** — karena ketiganya menjelaskan perilaku yang akan kamu temui, bahkan tanpa menulis satu pun `class`.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'OOP memecahkan masalah data dan perilaku yang tercecer, bukan masalah "kode terlihat rapi".',
        'Encapsulation dan polymorphism paling berguna; inheritance paling sering disalahgunakan.',
        'Class tanpa keadaan yang dijaga = fungsi yang dibungkus tanpa alasan.',
      ),
      references(
        {
          label: 'Object-oriented programming',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Object-oriented_programming',
          source: 'MDN',
          note: 'Definisi ringkas paradigmanya beserta tautan ke tiap pilar yang dibahas di sub-bab ini.',
        },
        {
          label: 'Encapsulation',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Encapsulation',
          source: 'MDN',
          note: 'Pilar yang paling sering benar-benar berguna, dijelaskan tanpa contoh berbahasa Java.',
        },
        {
          label: 'Polymorphism',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Polymorphism',
          source: 'MDN',
          note: 'Pasangan encapsulation, dan alasan JavaScript tidak memerlukan `interface` formal.',
        },
        {
          label: 'Using classes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes',
          source: 'MDN',
          note: 'Panduan resmi yang dipakai sebagai rujukan utama seluruh bab ini.',
        },
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Bukti langsung bahwa komponen React modern adalah fungsi, bukan class — konteks untuk catatan di atas.',
        },
      ),
    ],
  ),

  written(
    'object-factory-constructor',
    'Object Literal, Factory Function, Constructor Function',
    12,
    'Tiga cara membuat objek sebelum ada `class` — dan kenapa semuanya masih relevan.',
    [
      p(
        'Sebelum `class` masuk ke bahasa (2015), JavaScript sudah punya tiga cara membuat objek. Ketiganya masih dipakai hari ini, dan `class` sendiri dibangun di atas yang ketiga.',
      ),

      terms(
        {
          term: 'object literal',
          meaning:
            'Terjemahannya **objek yang ditulis apa adanya**. Object yang dibuat dengan langsung menuliskan isinya di antara kurung kurawal: `{ nama: "Zum" }`. Kata *literal* berarti harfiah — kamu menulis wujud akhirnya, bukan membuat resep untuk menghasilkannya.',
        },
        {
          term: 'factory function',
          meaning:
            'Terjemahannya **fungsi pabrik**. Fungsi biasa yang tugasnya **membuat lalu mengembalikan sebuah object baru** setiap kali dipanggil. Tidak butuh `new`, tidak butuh `this`, dan justru karena itulah ia punya keunggulan yang dibahas di bawah.',
        },
        {
          term: 'constructor',
          meaning:
            'Dibaca "kon-strak-tor", terjemahannya **pembangun** atau **perakit**. Fungsi yang dirancang khusus untuk dipanggil dengan kata kunci `new`, dan tugasnya mengisi objek baru yang sedang dirakit. Konvensi penamaannya memakai huruf besar di awal (`Pengguna`, bukan `pengguna`) — itu bukan aturan bahasa, melainkan tanda bagi pembaca bahwa fungsi ini **wajib** dipanggil dengan `new`.',
        },
        {
          term: 'new',
          meaning:
            'Kata kunci yang melakukan empat langkah sekaligus: membuat object kosong, menyambungkan prototype-nya, menjalankan constructor dengan `this` mengarah ke object baru itu, lalu mengembalikannya. Melupakannya adalah bug klasik — pada constructor function ia gagal diam-diam, sementara pada `class` ia selalu melempar `TypeError`.',
        },
        {
          term: 'prototype',
          meaning:
            'Dibaca "pro-to-taip", terjemahannya **purwarupa** atau cetakan asal. Sebuah object tempat menaruh method yang akan **dibagi bersama** oleh semua objek yang dibuat dari constructor itu. Ini mekanisme pewarisan asli JavaScript, dan seluruh Sub-bab 2.3 membahasnya.',
        },
        {
          term: 'closure',
          meaning:
            'Fungsi yang tetap mengingat variabel dari tempat ia dibuat. Di sub-bab ini closure adalah **rahasia keunggulan factory function**: karena method-nya mengambil nilai dari closure alih-alih dari `this`, ia tidak pernah bisa kehilangan konteks meski dioper ke mana pun.',
        },
        {
          term: 'kehilangan konteks',
          meaning:
            'Terjemahan bebas dari *losing `this`*. Keadaan ketika sebuah method dipisahkan dari objeknya — misalnya `const s = a.sapa;` lalu `s()` — sehingga `this` di dalamnya tidak lagi menunjuk objek asal. Ini penyebab bug yang sangat sering muncul pada event handler, dan Sub-bab 2.4 membahas keempat aturannya secara lengkap.',
        },
        {
          term: 'instance',
          meaning:
            'Satu objek konkret hasil pemanggilan constructor atau factory. `new Pengguna("Zum")` dan `new Pengguna("Ani")` menghasilkan dua instance berbeda dari cetakan yang sama.',
        },
      ),

      h2('1. Object literal'),
      code(
        'js',
        `
        const pengguna = {
          nama: 'Zum',
          sapa() { return \`Halo, \${this.nama}\`; },
        };
        `,
      ),
      p(
        'Cocok untuk objek yang **cuma satu**: konfigurasi, satu respons API, satu nilai. Begitu kamu butuh membuat sepuluh objek serupa, menyalin literal jadi salah.',
      ),

      h2('2. Factory function'),
      code(
        'js',
        `
        function buatPengguna(nama) {
          return {
            nama,
            sapa() { return \`Halo, \${nama}\`; },   // pakai closure, bukan this
          };
        }

        const a = buatPengguna('Zum');
        const b = buatPengguna('Ani');
        a.sapa();   // 'Halo, Zum'
        `,
      ),
      callout(
        'tip',
        'Keunggulan diam-diam factory function',
        'Karena method-nya memakai **closure** dan bukan `this`, ia tidak pernah kehilangan konteks. `const s = a.sapa; s();` tetap bekerja — sesuatu yang akan gagal pada class. Untuk callback dan event handler, ini menghapus sekelas bug.',
      ),

      h2('3. Constructor function'),
      code(
        'js',
        `
        function Pengguna(nama) {
          this.nama = nama;
        }

        // Method ditaruh di prototype, BUKAN di dalam constructor
        Pengguna.prototype.sapa = function () {
          return \`Halo, \${this.nama}\`;
        };

        const c = new Pengguna('Zum');
        c.sapa();   // 'Halo, Zum'
        `,
      ),
      p('Nama diawali huruf besar — konvensi yang berarti "harus dipanggil dengan `new`".'),

      h2('Apa yang dilakukan `new`'),
      code(
        'js',
        `
        // new Pengguna('Zum') kira-kira melakukan ini:
        // 1. Membuat objek kosong
        // 2. Menyambungkan prototype-nya ke Pengguna.prototype
        // 3. Menjalankan Pengguna dengan this = objek baru itu
        // 4. Mengembalikan objek itu (kecuali constructor mengembalikan objek lain)

        function Pengguna(nama) {
          this.nama = nama;
        }

        const tanpaNew = Pengguna('Zum');
        // undefined — dan di mode non-strict, 'nama' bocor ke global!
        // Di dalam modul ES (otomatis strict): TypeError, karena this undefined
        `,
      ),
      callout(
        'warning',
        'Lupa `new` adalah bug klasik',
        'Inilah salah satu alasan `class` ditambahkan ke bahasa: memanggil class tanpa `new` **selalu** melempar `TypeError`, tidak pernah gagal diam-diam.',
      ),

      h2('Perbandingan memori'),
      code(
        'js',
        `
        // Factory: setiap objek punya SALINAN SENDIRI fungsi sapa
        const x = buatPengguna('A');
        const y = buatPengguna('B');
        x.sapa === y.sapa;   // false — dua fungsi berbeda di memori

        // Constructor/class: SATU fungsi dibagi semua instance lewat prototype
        const p1 = new Pengguna('A');
        const p2 = new Pengguna('B');
        p1.sapa === p2.sapa;   // true — fungsi yang sama persis
        `,
      ),
      callout(
        'info',
        'Jangan langsung menyimpulkan factory itu boros',
        'Untuk puluhan atau ratusan objek, selisihnya tidak terukur, dan mesin JavaScript modern mengoptimalkannya. Perbedaan ini baru penting pada puluhan ribu objek. Pilih berdasarkan **`this` vs closure**, bukan memori.',
      ),

      table(
        ['', 'Object literal', 'Factory', 'Constructor / class'],
        [
          ['Untuk berapa objek', 'Satu', 'Banyak', 'Banyak'],
          ['Memakai `this`', 'Ya', 'Tidak (closure)', 'Ya'],
          ['Kehilangan konteks?', 'Bisa', '**Tidak pernah**', 'Bisa'],
          ['Method dibagi', '—', 'Tidak', 'Ya (prototype)'],
          ['Butuh `new`', 'Tidak', 'Tidak', '**Ya**'],
          ['Data privat', 'Sulit', 'Mudah (closure)', 'Mudah (`#`)'],
        ],
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Object literal untuk satu objek; factory dan constructor untuk banyak.',
        'Factory memakai closure — method-nya tidak pernah kehilangan konteks.',
        '`new` membuat objek, menyambungkan prototype, dan menjalankan constructor dengan `this` ke objek itu.',
        'Constructor/class berbagi method lewat prototype; factory menyalinnya per objek.',
      ),
      references(
        {
          label: 'Working with objects',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects',
          source: 'MDN',
          note: 'Bagian "Using a constructor function" dan "Using Object.create" menjelaskan ketiga cara di sub-bab ini.',
        },
        {
          label: 'new operator',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new',
          source: 'MDN',
          note: 'Uraian resmi keempat langkah yang dilakukan `new`, termasuk apa yang terjadi bila constructor mengembalikan object lain.',
        },
        {
          label: 'Constructor',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Constructor',
          source: 'MDN',
          note: 'Definisi ringkas beserta konvensi penamaan huruf besar di awal.',
        },
        {
          label: 'Object.create()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create',
          source: 'MDN',
          note: 'Cara membuat object dengan prototype yang kamu tentukan sendiri, tanpa constructor sama sekali.',
        },
        {
          label: 'Function: prototype',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype',
          source: 'MDN',
          note: 'Tempat method dibagi bersama seluruh instance — dasar dari perbandingan memori di atas.',
        },
      ),
    ],
  ),

  written(
    'prototype-chain',
    'Prototype & Rantai Prototype',
    14,
    'Mekanisme pewarisan asli JavaScript — yang berada di balik setiap `class`.',
    [
      p(
        'JavaScript **tidak punya** inheritance berbasis class seperti Java. Yang ia punya adalah objek yang menunjuk objek lain. Kalau sebuah property tidak ada di objek itu sendiri, JavaScript menelusuri tautan itu ke atas. Itulah seluruh mekanismenya.',
      ),

      terms(
        {
          term: 'prototype',
          meaning:
            'Dibaca "pro-to-taip", terjemahannya **purwarupa**. Sebuah object yang menjadi **tempat pencarian cadangan** bagi object lain. Kalau sebuah property tidak ditemukan pada object itu sendiri, JavaScript melanjutkan pencarian ke prototype-nya. Inilah satu-satunya mekanisme pewarisan yang benar-benar dimiliki JavaScript — `class` yang kamu tulis nanti hanyalah cara penulisan yang lebih rapi di atas mekanisme ini.',
        },
        {
          term: '[[Prototype]]',
          meaning:
            'Ditulis dengan kurung siku ganda karena begitulah spesifikasi ECMAScript menandai **slot internal** — sesuatu yang benar-benar ada di dalam mesin JavaScript tapi tidak bisa kamu tulis langsung dalam kode. Isinya adalah tautan dari sebuah object ke prototype-nya. Untuk membacanya dari kode, pakai `Object.getPrototypeOf(obj)`.',
        },
        {
          term: '__proto__',
          meaning:
            'Dibaca "dander-proto" (dua garis bawah di kiri dan kanan). Cara **lama** membaca dan menulis tautan `[[Prototype]]` sebuah object. Masih bekerja demi kompatibilitas, tapi sudah *deprecated* — pakailah `Object.getPrototypeOf()` dan `Object.setPrototypeOf()`. Jangan tertukar dengan `prototype`: `__proto__` ada pada **object**, sedangkan `prototype` ada pada **fungsi**.',
        },
        {
          term: 'prototype chain',
          meaning:
            'Terjemahannya **rantai prototype**. Deretan object yang ditelusuri JavaScript saat mencari sebuah property: dari object itu sendiri, naik ke prototype-nya, naik lagi, sampai akhirnya tiba di `null` — ujung rantai. Sebuah array biasa punya rantai `arr → Array.prototype → Object.prototype → null`, dan itulah sebabnya ia punya `map` sekaligus `toString`.',
        },
        {
          term: 'shadowing',
          meaning:
            'Artinya **membayangi**. Keadaan ketika sebuah object punya property dengan nama yang sama dengan yang ada di prototype-nya, sehingga pencarian berhenti lebih dulu dan versi prototype tidak pernah terpakai. Penting untuk dipahami: **tidak ada yang benar-benar ditimpa atau dihapus** — versi induknya masih utuh di sana, hanya saja tidak pernah tercapai.',
        },
        {
          term: 'own property',
          meaning:
            'Terjemahannya **milik sendiri**. Property yang benar-benar tersimpan pada object itu, bukan diwarisi dari prototype. `Object.hasOwn(obj, "a")` menjawab pertanyaan ini dengan tepat, sementara operator `in` menjawab `true` untuk keduanya. `Object.keys()` juga hanya mengembalikan milik sendiri.',
        },
        {
          term: 'monkey patching',
          meaning:
            'Terjemahan bebasnya **menambal seenaknya**. Praktik menambah atau mengubah method pada prototype bawaan seperti `Array.prototype`. Terlihat praktis karena semua array langsung punya method barumu, tapi berbahaya: **seluruh** array di aplikasi ikut berubah, termasuk milik pustaka pihak ketiga. Contoh nyatanya ada di bawah, dan akibatnya sampai mengubah nama sebuah method di standar ECMAScript.',
        },
        {
          term: 'MooTools',
          meaning:
            'Nama pustaka JavaScript populer di sekitar tahun 2007–2012. Disebut di sini karena ia menambahkan `Array.prototype.flatten` dengan perilaku yang berbeda dari rencana standar. Karena masih ada situs lama yang memakainya, komite standar terpaksa menamai method resminya `flat` — bukti nyata bahwa monkey patching bisa berdampak sampai ke tingkat spesifikasi bahasa.',
        },
      ),

      h2('Tautan `[[Prototype]]`'),
      code(
        'js',
        `
        const hewan = {
          bernapas() { return 'menghirup udara'; },
        };

        const kucing = Object.create(hewan);   // prototype kucing = hewan
        kucing.mengeong = () => 'meong';

        kucing.mengeong();    // 'meong'          — milik sendiri
        kucing.bernapas();    // 'menghirup udara' — ditemukan di prototype

        Object.getPrototypeOf(kucing) === hewan;   // true
        `,
      ),
      callout(
        'info',
        '`__proto__` vs `prototype`',
        'Dua nama yang membingungkan. `__proto__` (kini lebih baik: `Object.getPrototypeOf`) adalah **tautan pada sebuah objek** ke prototype-nya. `prototype` adalah **property pada sebuah fungsi**, yang akan dipakai sebagai prototype objek yang dibuat dengan `new`. Keduanya bukan hal yang sama.',
      ),

      h2('Rantainya'),
      code(
        'js',
        `
        const arr = [1, 2, 3];

        // arr -> Array.prototype -> Object.prototype -> null
        Object.getPrototypeOf(arr) === Array.prototype;              // true
        Object.getPrototypeOf(Array.prototype) === Object.prototype; // true
        Object.getPrototypeOf(Object.prototype);                     // null — ujung rantai

        arr.map;        // ditemukan di Array.prototype
        arr.toString;   // ditemukan di Object.prototype
        arr.entahApa;   // undefined — rantai habis, tidak ketemu
        `,
      ),
      p(
        'Pencarian berhenti pada kecocokan **pertama**. Itu sebabnya mendefinisikan ulang sebuah method di objek anak "menimpa" versi induknya — tidak ada yang benar-benar ditimpa, yang terjadi hanya pencarian berhenti lebih awal.',
      ),

      h2('Milik sendiri vs warisan'),
      code(
        'js',
        `
        const induk = { a: 1 };
        const anak = Object.create(induk);
        anak.b = 2;

        'a' in anak;                    // true  — termasuk warisan
        Object.hasOwn(anak, 'a');       // false — bukan miliknya sendiri
        Object.hasOwn(anak, 'b');       // true

        Object.keys(anak);              // ['b'] — hanya milik sendiri
        for (const k in anak) { }       // 'b' lalu 'a' — ikut warisan
        `,
      ),
      callout(
        'warning',
        'Inilah alasan `for...in` berbahaya pada objek',
        'Ia menelusuri seluruh rantai. Kalau ada pustaka yang menambah sesuatu ke `Object.prototype`, ia akan muncul di setiap `for...in` di seluruh aplikasimu. Pakai `Object.entries()` atau `Object.keys()`.',
      ),

      h2('Jangan mengubah prototype bawaan'),
      code(
        'js',
        `
        // JANGAN PERNAH:
        Array.prototype.terakhir = function () { return this[this.length - 1]; };

        // Sekarang SETIAP array di seluruh aplikasi punya method ini —
        // termasuk array milik pustaka pihak ketiga. Kalau standar ECMAScript
        // kelak menambahkan nama yang sama dengan perilaku berbeda, semuanya rusak.
        // Ini pernah benar-benar terjadi: Array.prototype.flatten milik MooTools
        // memaksa standar menamai methodnya 'flat'.
        `,
      ),

      h2('Membaca prototype sebuah class'),
      code(
        'js',
        `
        class Hewan {
          bernapas() { return 'menghirup udara'; }
        }

        const h = new Hewan();

        Object.getPrototypeOf(h) === Hewan.prototype;   // true
        Object.hasOwn(h, 'bernapas');                   // false — ada di prototype
        Object.hasOwn(Hewan.prototype, 'bernapas');     // true
        typeof Hewan;                                   // 'function' — class itu fungsi
        `,
        { caption: 'Class adalah gula sintaks; mekanismenya tetap prototype.' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pencarian property naik rantai prototype dan berhenti pada kecocokan pertama.',
        '`__proto__` adalah tautan objek; `prototype` adalah property fungsi. Berbeda.',
        '`Object.hasOwn()` membedakan milik sendiri dari warisan.',
        'Jangan pernah menambah apa pun ke prototype bawaan.',
        '`class` tidak menggantikan prototype — ia dibangun di atasnya.',
      ),
      references(
        {
          label: 'Inheritance and the prototype chain',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain',
          source: 'MDN',
          note: 'Rujukan utama sub-bab ini — menjelaskan rantai prototype dari dasar sampai kaitannya dengan `class`.',
        },
        {
          label: 'Object.getPrototypeOf()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf',
          source: 'MDN',
          note: 'Cara resmi membaca tautan `[[Prototype]]`, pengganti `__proto__` yang sudah usang.',
        },
        {
          label: 'Object.prototype.__proto__',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto',
          source: 'MDN',
          note: 'Halaman ini sendiri memberi peringatan *deprecated* beserta alasan performanya.',
        },
        {
          label: 'Object.hasOwn()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn',
          source: 'MDN',
          note: 'Membedakan property milik sendiri dari yang diwarisi — inti bagian "milik sendiri vs warisan".',
        },
        {
          label: 'Array.prototype.flat()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat',
          source: 'MDN',
          note: 'Method yang terpaksa dinamai `flat` alih-alih `flatten` gara-gara monkey patching MooTools.',
        },
      ),
    ],
  ),

  written(
    'this-binding',
    '`this` — Empat Aturan Binding',
    14,
    'Nilai `this` ditentukan oleh **cara fungsi dipanggil**, bukan tempat ia ditulis.',
    [
      p(
        'Kalau ada satu konsep JavaScript yang paling sering membuat orang menyerah, ini dia. Kabar baiknya: aturannya cuma empat, dan bisa dicek berurutan.',
      ),

      terms(
        {
          term: 'this',
          meaning:
            'Kata kunci yang berarti **"objek yang sedang mengerjakan fungsi ini"**. Bagian yang membingungkan dan wajib dipegang erat: nilainya **tidak ditentukan saat fungsi ditulis**, melainkan saat fungsi **dipanggil** — dan fungsi yang sama persis bisa punya `this` berbeda pada dua pemanggilan berbeda. Ini kebalikan dari aturan scope biasa, dan justru ketidaksesuaian itulah sumber hampir semua kebingungan tentangnya.',
        },
        {
          term: 'binding',
          meaning:
            'Dibaca "bain-ding", artinya **pengikatan**. Proses menentukan nilai `this` untuk sebuah pemanggilan. Ada empat aturan pengikatan, dan JavaScript memeriksanya menurut prioritas — begitu satu aturan cocok, sisanya tidak diperiksa lagi.',
        },
        {
          term: 'call-site',
          meaning:
            'Terjemahannya **tempat pemanggilan**, yaitu baris tempat fungsi itu benar-benar dipanggil — bukan baris tempat ia ditulis. Inilah satu-satunya tempat yang perlu kamu lihat untuk menentukan `this`. Trik praktisnya: lihat **apa yang berada tepat sebelum tanda kurung pemanggilan**.',
        },
        {
          term: 'implicit binding',
          meaning:
            'Terjemahannya **pengikatan tersirat**. Aturan yang berlaku saat fungsi dipanggil sebagai method: `o.sapa()`. Nilai `this` menjadi apa pun yang berada **sebelum titik** — dalam hal ini `o`. Disebut tersirat karena kamu tidak menyebutkannya secara khusus; ia tersimpul dari cara penulisannya.',
        },
        {
          term: 'explicit binding',
          meaning:
            'Terjemahannya **pengikatan tersurat**. Kamu menentukan `this` secara langsung lewat `call`, `apply`, atau `bind`. Bedanya: `call(konteks, a, b)` memanggil sekarang dengan argumen terpisah, `apply(konteks, [a, b])` sama tapi argumennya dalam bentuk array, dan `bind(konteks)` **tidak memanggil apa pun** melainkan menghasilkan fungsi baru yang `this`-nya terkunci selamanya.',
        },
        {
          term: 'new binding',
          meaning:
            'Pengikatan berprioritas paling tinggi. Saat fungsi dipanggil dengan `new`, `this` selalu menunjuk objek baru yang sedang dibuat — mengalahkan ketiga aturan lainnya.',
        },
        {
          term: 'default binding',
          meaning:
            'Terjemahannya **pengikatan bawaan**, yaitu yang berlaku kalau tidak ada satu pun aturan lain yang cocok — misalnya pada pemanggilan telanjang `sapa()`. Di dalam modul ES yang otomatis mode ketat, hasilnya adalah `undefined`, sehingga menyentuh property darinya melempar `TypeError`. Di mode longgar lama, ia justru menjadi `window`, dan diam-diam mencemari lingkup global.',
        },
        {
          term: 'kehilangan this',
          meaning:
            'Terjemahan dari *losing `this`*. Terjadi ketika sebuah method dipisahkan dari objeknya — `const lepas = pengguna.sapa;` — sehingga saat dipanggil ia tidak lagi punya apa pun sebelum titik. Ini penyebab bug paling sering pada `setTimeout` dan event handler, dan `bind` atau arrow function adalah dua obatnya.',
        },
        {
          term: 'lexical this',
          meaning:
            'Terjemahannya **`this` menurut tempat penulisan**. Arrow function **tidak punya `this` sendiri sama sekali** — ia meminjam `this` dari tempat ia ditulis, dan pinjaman itu tidak pernah bisa diubah, bahkan oleh `call` maupun `bind`. Justru sifat inilah yang membuatnya aman untuk callback, dan sekaligus membuatnya salah untuk method di dalam object literal.',
        },
      ),

      h2('Aturan, dari prioritas tertinggi'),
      code(
        'js',
        `
        function tampil() { return this; }

        // 1. new binding — this = objek baru
        function Orang(n) { this.nama = n; }
        new Orang('Zum').nama;        // 'Zum'

        // 2. explicit binding — this = argumen pertama
        const konteks = { nama: 'Ani' };
        function sapa() { return this.nama; }
        sapa.call(konteks);           // 'Ani'
        sapa.apply(konteks);          // 'Ani'  — sama, argumen sebagai array
        const terikat = sapa.bind(konteks);
        terikat();                    // 'Ani'  — terikat selamanya

        // 3. implicit binding — this = objek sebelum titik
        const o = { nama: 'Zum', sapa };
        o.sapa();                     // 'Zum'

        // 4. default binding — tidak ada konteks
        sapa();                       // TypeError di modul ES (this undefined)
        `,
      ),
      callout(
        'tip',
        'Cara membacanya dalam satu detik',
        'Lihat **apa yang ada tepat sebelum tanda kurung pemanggilan**. `o.sapa()` → `this` adalah `o`. `sapa()` → tidak ada apa-apa → `undefined`. Titik penentu adalah *call-site*, bukan tempat fungsi didefinisikan.',
      ),

      h2('Kehilangan `this` — bug yang paling sering'),
      code(
        'js',
        `
        const pengguna = {
          nama: 'Zum',
          sapa() { return \`Halo \${this.nama}\`; },
        };

        pengguna.sapa();              // 'Halo Zum'

        const lepas = pengguna.sapa;  // fungsinya dilepas dari objeknya
        lepas();                      // TypeError: Cannot read properties of undefined

        // Kasus nyata: mengoper method sebagai callback
        setTimeout(pengguna.sapa, 100);          // rusak
        setTimeout(() => pengguna.sapa(), 100);  // benar
        setTimeout(pengguna.sapa.bind(pengguna), 100);  // benar juga
        `,
      ),

      h2('Arrow function tidak punya `this` sendiri'),
      p(
        'Arrow function mengambil `this` dari **scope tempat ia ditulis**, dan tidak bisa diubah oleh `call`, `apply`, `bind`, atau `new`.',
      ),
      code(
        'js',
        `
        const timer = {
          detik: 0,

          mulaiSalah() {
            setInterval(function () {
              this.detik++;   // this = undefined (atau globalThis) — BUKAN timer
            }, 1000);
          },

          mulaiBenar() {
            setInterval(() => {
              this.detik++;   // arrow mengambil this dari mulaiBenar -> timer
            }, 1000);
          },
        };
        `,
      ),
      callout(
        'danger',
        'Jangan pakai arrow function untuk method objek',
        'Arrow di dalam object literal mengambil `this` dari scope **di luar** objek — biasanya modul, jadi `undefined`. `const o = { nama: "Z", sapa: () => this.nama }` tidak akan pernah bekerja. Untuk method, pakai bentuk `sapa() { }`.',
      ),

      h2('Ringkasan keputusan'),
      table(
        ['Bentuk pemanggilan', '`this` bernilai'],
        [
          ['`new Fn()`', 'Objek yang baru dibuat'],
          ['`fn.call(o)` / `fn.apply(o)` / `fn.bind(o)()`', '`o`'],
          ['`o.fn()`', '`o`'],
          ['`fn()`', '`undefined` (mode strict / modul ES)'],
          ['Arrow function', '`this` dari scope tempat ia **ditulis**'],
          ['Method class', 'Instance — tapi hilang kalau method dilepas'],
        ],
      ),

      h2('Kenapa ini tetap penting meski kamu menulis React'),
      code(
        'js',
        `
        // Kamu tidak akan menulis 'this' di React modern. Tapi kamu AKAN menemui:
        const { current } = ref;              // melepas nilai dari objeknya
        const { push } = router;              // melepas method — sering rusak
        array.map(obj.method);                // melepas method jadi callback

        // Polanya sama persis dengan yang kamu pelajari di sini.
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`this` ditentukan call-site, bukan tempat penulisan.',
        'Urutan prioritas: `new` > explicit (`call`/`bind`) > implicit (`o.fn()`) > default.',
        'Melepas method dari objeknya memutus binding — sumber bug paling umum.',
        'Arrow function mengambil `this` dari tempat ia ditulis, dan tidak bisa diubah.',
        'Jangan pakai arrow untuk method objek; pakai untuk callback.',
      ),
      references(
        {
          label: 'this',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this',
          source: 'MDN',
          note: 'Rujukan resmi keempat aturan binding, lengkap dengan perbedaan mode ketat dan longgar.',
        },
        {
          label: 'Function.prototype.bind()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind',
          source: 'MDN',
          note: 'Menegaskan bahwa `bind` menghasilkan fungsi baru dan ikatannya tidak bisa dibatalkan lagi.',
        },
        {
          label: 'Function.prototype.call()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call',
          source: 'MDN',
          note: 'Pasangannya `apply` ada di halaman tetangga — bedanya hanya pada bentuk argumen.',
        },
        {
          label: 'Arrow function expressions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions',
          source: 'MDN',
          note: 'Bagian "No separate this" adalah dasar seluruh peringatan tentang method objek di atas.',
        },
        {
          label: 'Strict mode',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode',
          source: 'MDN',
          note: 'Alasan `this` menjadi `undefined` alih-alih `globalThis` pada pemanggilan telanjang.',
        },
      ),
    ],
  ),

  written(
    'class-dasar',
    '`class`: constructor, method, field',
    11,
    'Sintaks class dan apa yang sebenarnya ia hasilkan.',
    [
      p(
        '`class` masuk ke JavaScript pada 2015 sebagai sintaks yang lebih jelas untuk pola constructor + prototype yang sudah ada. Tidak ada mekanisme baru yang ditambahkan ke bahasa.',
      ),

      terms(
        {
          term: 'class',
          meaning:
            'Dibaca "klas", terjemahannya **kelas** dalam arti golongan atau jenis. Cetakan untuk membuat banyak objek yang berperilaku sama. Yang wajib dipahami sejak awal: `class` **tidak menambahkan mekanisme baru** ke JavaScript — ia hanya cara penulisan yang lebih rapi untuk pola constructor dan prototype yang sudah kamu pelajari di dua sub-bab sebelumnya.',
        },
        {
          term: 'gula sintaks',
          meaning:
            'Terjemahan dari *syntactic sugar*. Sebutan untuk sintaks yang membuat sesuatu **lebih enak ditulis dan dibaca**, tanpa menambah kemampuan apa pun yang sebelumnya tidak ada. Disebut "gula" karena ia mempermanis, bukan menambah gizi. `class` adalah contohnya, dan membuktikannya mudah: `typeof Pengguna` tetap menjawab `"function"`.',
        },
        {
          term: 'constructor',
          meaning:
            'Method khusus di dalam class yang **dijalankan otomatis sekali** setiap kali `new` dipanggil. Tugasnya mengisi keadaan awal objek yang sedang dibuat. Namanya wajib persis `constructor`, dan satu class hanya boleh punya satu.',
        },
        {
          term: 'instance field',
          meaning:
            'Terjemahannya **medan milik instance**. Property yang ditulis langsung di badan class tanpa `static`, misalnya `peran = "anggota"`. Setiap instance mendapat **salinannya sendiri**, dan pengisiannya terjadi **sebelum** badan constructor dijalankan — urutan yang penting diingat saat constructor-mu bergantung padanya.',
        },
        {
          term: 'static',
          meaning:
            'Artinya **melekat pada class itu sendiri**, bukan pada instance-nya. `Pengguna.jumlahDibuat` dibaca dari class-nya langsung, dan tidak ada di dalam `u`. Dipakai untuk hal yang berlaku untuk seluruh golongan, bukan untuk satu objek — misalnya penghitung total, konstanta bersama, atau factory method.',
        },
        {
          term: 'method',
          meaning:
            'Fungsi yang ditulis di dalam badan class. Berbeda dari instance field, **method ditaruh di prototype dan dibagi bersama** oleh seluruh instance — hanya ada satu salinannya di memori, berapa pun banyak objek yang kamu buat. Inilah yang dibuktikan `Object.hasOwn(u, "sapa")` yang bernilai `false`.',
        },
        {
          term: 'factory method',
          meaning:
            'Method `static` yang tugasnya **membuat instance dengan cara khusus**, misalnya `Pengguna.dariJSON(teks)`. Berguna ketika ada beberapa cara membuat objek yang sama sementara `constructor` hanya boleh satu — dan namanya bisa menjelaskan asal datanya, sesuatu yang tidak bisa dilakukan `new`.',
        },
        {
          term: 'hoisting class',
          meaning:
            'Berbeda dari fungsi biasa: nama sebuah `class` memang di-*hoist*, tapi ia berada dalam Temporal Dead Zone sampai barisnya tercapai. Akibat praktisnya, **class tidak bisa dipakai sebelum baris deklarasinya** — mencobanya melempar `ReferenceError`, bukan bekerja diam-diam seperti function declaration.',
        },
      ),

      h2('Anatomi'),
      code(
        'js',
        `
        class Pengguna {
          // Instance field — dijalankan sebelum badan constructor
          peran = 'anggota';

          // Static field — milik class, bukan instance
          static jumlahDibuat = 0;

          constructor(nama, email) {
            this.nama = nama;
            this.email = email;
            Pengguna.jumlahDibuat++;
          }

          // Method — ditaruh di prototype, dibagi semua instance
          sapa() {
            return \`Halo \${this.nama}\`;
          }

          // Static method — dipanggil pada class
          static dariJSON(json) {
            const { nama, email } = JSON.parse(json);
            return new Pengguna(nama, email);
          }
        }

        const u = new Pengguna('Zum', 'a@b.c');
        u.peran;                 // 'anggota'
        u.sapa();                // 'Halo Zum'
        Pengguna.jumlahDibuat;   // 1
        `,
      ),

      h2('Membuktikan ia tetap prototype'),
      code(
        'js',
        `
        typeof Pengguna;                                  // 'function'
        Object.hasOwn(u, 'sapa');                         // false — ada di prototype
        Object.hasOwn(Pengguna.prototype, 'sapa');        // true
        Object.getPrototypeOf(u) === Pengguna.prototype;  // true

        // Instance field BERBEDA: ia milik tiap objek
        Object.hasOwn(u, 'peran');                        // true
        `,
      ),
      callout(
        'info',
        'Kenapa field milik instance, tapi method milik prototype',
        'Field adalah **data** — tiap objek butuh salinannya sendiri. Method adalah **perilaku** — satu salinan cukup untuk semua. Kalau kamu menulis `sapa = () => ...` (field arrow), ia jadi milik instance: `this` terikat aman, tapi ada satu fungsi per objek.',
      ),

      h2('Yang berbeda dari constructor function'),
      code(
        'js',
        `
        // 1. Wajib new
        Pengguna('Zum');   // TypeError: Class constructor cannot be invoked without 'new'

        // 2. Tidak di-hoist seperti function declaration
        new Awal();               // ReferenceError
        class Awal {}

        // 3. Badannya SELALU mode strict, meski berkas tidak

        // 4. Method class tidak enumerable — tidak muncul di for...in
        `,
      ),

      h2('Class expression'),
      code(
        'js',
        `
        const Kotak = class {
          constructor(isi) { this.isi = isi; }
        };

        // Berguna untuk class yang dibuat secara dinamis
        function buatTipe(label) {
          return class {
            get label() { return label; }   // closure atas parameter
          };
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Class adalah gula sintaks di atas constructor function + prototype.',
        'Field milik instance; method milik prototype dan dibagi.',
        'Class wajib dipanggil dengan `new`, tidak di-hoist, dan selalu mode strict.',
        'Field arrow (`sapa = () => {}`) mengunci `this`, dengan biaya satu fungsi per objek.',
      ),
      references(
        {
          label: 'Classes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes',
          source: 'MDN',
          note: 'Rujukan lengkap seluruh anggota class: constructor, field, method, static, dan private.',
        },
        {
          label: 'constructor',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor',
          source: 'MDN',
          note: 'Termasuk aturan bahwa satu class hanya boleh punya satu constructor.',
        },
        {
          label: 'Public class fields',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields',
          source: 'MDN',
          note: 'Menjelaskan urutan eksekusi field terhadap badan constructor — sumber kejutan yang sering terjadi.',
        },
        {
          label: 'static',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static',
          source: 'MDN',
          note: 'Anggota yang melekat pada class, dasar dari factory method di Sub-bab 2.9.',
        },
        {
          label: 'class expression',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class',
          source: 'MDN',
          note: 'Bentuk class sebagai nilai, dipakai saat class perlu dibuat secara dinamis.',
        },
      ),
    ],
  ),

  written(
    'encapsulation',
    'Encapsulation: private field `#`, getter & setter',
    11,
    'Menyembunyikan detail internal supaya perubahan di dalam tidak merembet keluar.',
    [
      p(
        'Encapsulation adalah pilar OOP yang paling sering benar-benar terpakai. Intinya satu kalimat: **apa yang tidak bisa disentuh dari luar, tidak bisa dirusak dari luar** — dan bisa kamu ubah kapan saja tanpa memecahkan kode orang lain.',
      ),

      terms(
        {
          term: 'private field',
          meaning:
            'Terjemahannya **medan privat**. Property yang namanya diawali tanda pagar `#`, misalnya `#saldo`. Ia **benar-benar dijaga bahasa**: mengaksesnya dari luar class bukan sekadar tidak sopan, melainkan `SyntaxError` yang membuat kodenya tidak bisa dijalankan sama sekali. Ia juga tidak muncul di `Object.keys()` maupun `JSON.stringify()`.',
        },
        {
          term: '#',
          meaning:
            'Tanda pagar (*hash*) yang menjadi bagian **dari nama property itu sendiri**, bukan sekadar penanda. Karena itu `#saldo` dan `saldo` adalah dua property yang benar-benar berbeda dan bisa hidup berdampingan dalam satu class tanpa bertabrakan.',
        },
        {
          term: '_nama',
          meaning:
            'Konvensi lama: garis bawah di depan nama dipakai sebagai **isyarat** bahwa property itu urusan internal dan sebaiknya tidak disentuh dari luar. Perlu ditegaskan, ini hanya kesepakatan sopan santun — tidak ada apa pun yang mencegah siapa saja menulis `obj._saldo = -999`. Inilah bedanya dengan `#` yang ditegakkan bahasa.',
        },
        {
          term: 'getter',
          meaning:
            'Method yang ditulis dengan awalan `get` dan **dibaca seperti property biasa**, tanpa tanda kurung: `d.saldo`, bukan `d.saldo()`. Gunanya menyediakan jalan baca yang aman ke data internal, atau menghitung nilai turunan setiap kali diminta.',
        },
        {
          term: 'setter',
          meaning:
            'Pasangan getter, ditulis dengan awalan `set` dan **dipakai seperti penugasan biasa**: `d.saldo = 100`. Kekuatannya ada di sini — kamu bisa menyelipkan pemeriksaan di tengah sesuatu yang tampak seperti penugasan polos, sehingga nilai tidak valid ditolak sebelum sempat masuk.',
        },
        {
          term: 'serialize',
          meaning:
            'Dibaca "si-ri-a-laiz", artinya **mengubah objek menjadi teks** agar bisa dikirim lewat jaringan atau disimpan. `JSON.stringify()` melakukannya. Perlu diingat bahwa private field **tidak ikut ter-serialize** — kalau kamu butuh menyimpan keadaan internal, sediakan method khusus untuk itu.',
        },
        {
          term: 'invariant',
          meaning:
            'Aturan yang harus **selalu benar** sepanjang umur sebuah objek — misalnya "saldo tidak pernah negatif". Encapsulation adalah cara menegakkannya: kalau satu-satunya jalan mengubah saldo adalah lewat `setor()` dan `tarik()` yang keduanya memeriksa dulu, maka aturan itu mustahil dilanggar dari luar.',
        },
        {
          term: 'antarmuka publik',
          meaning:
            'Terjemahan dari *public interface*. Kumpulan method dan property yang sengaja kamu buka ke dunia luar — inilah janji yang kamu berikan kepada pemakai class-mu. Segala sesuatu di luar itu boleh kamu ubah kapan saja tanpa merusak kode siapa pun, dan justru kebebasan itulah imbalan sesungguhnya dari encapsulation.',
        },
      ),

      h2('Private field `#`'),
      code(
        'js',
        `
        class Dompet {
          #saldo = 0;   // benar-benar privat, dijaga bahasa

          setor(jumlah) {
            if (jumlah <= 0) throw new Error('Setoran harus lebih dari nol');
            this.#saldo += jumlah;
            return this.#saldo;
          }

          tarik(jumlah) {
            if (jumlah > this.#saldo) throw new Error('Saldo tidak cukup');
            this.#saldo -= jumlah;
            return this.#saldo;
          }

          get saldo() { return this.#saldo; }
        }

        const d = new Dompet();
        d.setor(1000);
        d.saldo;          // 1000
        d.#saldo;         // SyntaxError — bahkan tidak bisa dikompilasi
        Object.keys(d);   // [] — tidak terlihat sama sekali
        JSON.stringify(d);// '{}' — tidak ikut ter-serialize
        `,
      ),
      callout(
        'info',
        'Beda dari konvensi `_nama`',
        '`this._saldo` hanya kesepakatan — siapa pun tetap bisa menulis `obj._saldo = -999`. `#saldo` dijaga bahasa: mengaksesnya dari luar adalah error sintaks, bukan sekadar tidak sopan.',
      ),

      h2('Getter & setter'),
      code(
        'js',
        `
        class Suhu {
          #celsius = 0;

          get celsius() { return this.#celsius; }

          set celsius(nilai) {
            if (typeof nilai !== 'number' || Number.isNaN(nilai)) {
              throw new TypeError('Suhu harus berupa angka');
            }
            if (nilai < -273.15) throw new RangeError('Di bawah nol mutlak');
            this.#celsius = nilai;
          }

          // Nilai turunan — dihitung, tidak disimpan
          get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
        }

        const s = new Suhu();
        s.celsius = 25;    // memanggil setter
        s.fahrenheit;      // 77
        s.celsius = -300;  // RangeError
        `,
      ),
      callout(
        'warning',
        'Getter harus murah dan tidak punya efek samping',
        'Ia terlihat seperti pembacaan property biasa, jadi pembaca berasumsi ia gratis. Getter yang memanggil API, menulis ke penyimpanan, atau menghitung berat akan mengejutkan — jadikan method biasa (`hitungTotal()`) supaya biayanya terlihat.',
      ),

      h2('Kapan getter/setter tidak diperlukan'),
      code(
        'js',
        `
        // Berlebihan: getter/setter yang tidak melakukan apa-apa
        class A {
          #n;
          get n() { return this.#n; }
          set n(v) { this.#n = v; }
        }

        // Cukup: property biasa. Tambahkan getter/setter NANTI kalau
        // memang muncul aturan — dan pemanggil tidak perlu berubah sama sekali.
        class B {
          n;
        }
        `,
      ),

      h2('Private method dan static privat'),
      code(
        'js',
        `
        class Antrean {
          #item = [];
          static #maksimum = 100;

          #penuh() { return this.#item.length >= Antrean.#maksimum; }

          tambah(x) {
            if (this.#penuh()) throw new Error('Antrean penuh');
            this.#item.push(x);
          }
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`#field` benar-benar privat; `_field` hanya kesepakatan.',
        'Private field tidak muncul di `Object.keys` maupun `JSON.stringify`.',
        'Setter adalah tempat yang tepat untuk validasi; getter untuk nilai turunan.',
        'Getter harus murah dan bebas efek samping — kalau tidak, jadikan method.',
        'Mulai dengan property biasa; tambahkan getter/setter saat aturannya muncul.',
      ),
      references(
        {
          label: 'Private properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties',
          source: 'MDN',
          note: 'Aturan lengkap `#field`, termasuk private method dan static privat yang dipakai di contoh terakhir.',
        },
        {
          label: 'get',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get',
          source: 'MDN',
          note: 'Sintaks getter beserta catatan bahwa ia sebaiknya murah dan bebas efek samping.',
        },
        {
          label: 'set',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set',
          source: 'MDN',
          note: 'Pasangan getter — tempat paling tepat menaruh validasi sebelum nilai masuk.',
        },
        {
          label: 'JSON.stringify()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify',
          source: 'MDN',
          note: 'Menjelaskan property apa saja yang ikut ter-serialize — private field tidak termasuk.',
        },
        {
          label: 'RangeError',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError',
          source: 'MDN',
          note: 'Jenis error yang tepat untuk nilai di luar jangkauan, seperti suhu di bawah nol mutlak.',
        },
      ),
    ],
  ),

  written(
    'inheritance',
    'Inheritance: `extends`, `super`, overriding',
    12,
    'Mewarisi perilaku dari class lain — dan batas yang perlu dijaga sejak awal.',
    [
      p(
        '`extends` menyambungkan rantai prototype dua class. Sintaksnya mudah; yang sulit adalah menahan diri untuk tidak memakainya terlalu sering.',
      ),

      terms(
        {
          term: 'inheritance',
          meaning:
            'Terjemahannya **pewarisan**. Menyusun sebuah class di atas class lain sehingga ia otomatis memiliki seluruh method induknya tanpa perlu menulisnya ulang. Yang terjadi di balik layar hanyalah penyambungan rantai prototype — mekanisme yang sudah kamu pelajari di Sub-bab 2.3.',
        },
        {
          term: 'extends',
          meaning:
            'Artinya **memperluas**. Kata kunci yang menyatakan bahwa sebuah class dibangun di atas class lain: `class Kucing extends Hewan`. Pilihan kata "memperluas" itu sendiri sudah menjadi petunjuk pemakaian yang benar — turunan sebaiknya **menambah** kemampuan induknya, bukan mengurangi atau membatalkannya.',
        },
        {
          term: 'super',
          meaning:
            'Dari *superclass*, artinya **class di atasnya**. Punya dua pemakaian yang berbeda: `super(...)` di dalam constructor **memanggil constructor induk**, sementara `super.method()` di dalam method **memanggil versi induk** dari method itu. Yang kedua berguna untuk memperluas perilaku induk alih-alih menggantinya sama sekali.',
        },
        {
          term: 'superclass / subclass',
          meaning:
            'Terjemahannya **class induk** dan **class turunan**. Kata *super* di sini berarti "di atas" (seperti pada *supervisor*), bukan "hebat"; dan *sub* berarti "di bawah". `Hewan` adalah superclass, `Kucing` adalah subclass.',
        },
        {
          term: 'overriding',
          meaning:
            'Dibaca "o-ver-rai-ding", artinya **menimpa**. Mendefinisikan ulang sebuah method di class turunan dengan nama yang sama seperti di induknya. Perlu diingat dari Sub-bab 2.3: tidak ada yang benar-benar terhapus — versi induk masih utuh di prototype-nya, hanya saja pencarian berhenti lebih dulu di versi turunan.',
        },
        {
          term: 'instanceof',
          meaning:
            'Operator yang memeriksa apakah sebuah objek berada dalam rantai prototype sebuah class. Karena ia menelusuri **seluruh rantai**, `k instanceof Kucing` dan `k instanceof Hewan` sama-sama bernilai `true` untuk objek yang sama.',
        },
        {
          term: 'hierarki',
          meaning:
            'Susunan bertingkat dari umum ke khusus: `Hewan` → `Burung` → `Pinguin`. Masalah utamanya muncul belakangan — hierarki yang terasa sangat masuk akal hari ini sering patah begitu satu kasus baru datang, dan mengubahnya berarti membongkar seluruh cabang di bawahnya.',
        },
        {
          term: 'LSP',
          meaning:
            'Singkatan *Liskov Substitution Principle*, terjemahannya **prinsip substitusi Liskov**, diambil dari nama Barbara Liskov. Isinya satu kalimat: **objek turunan harus bisa menggantikan induknya tanpa merusak apa pun**. Pinguin yang mewarisi `terbang()` lalu melempar error melanggar prinsip ini — dan pelanggaran itulah tanda bahwa inheritance-nya salah pilih.',
        },
      ),

      h2('Dasar'),
      code(
        'js',
        `
        class Hewan {
          constructor(nama) { this.nama = nama; }
          bersuara() { return '...'; }
          perkenalan() { return \`\${this.nama} berkata \${this.bersuara()}\`; }
        }

        class Kucing extends Hewan {
          constructor(nama, warna) {
            super(nama);        // WAJIB, dan harus sebelum menyentuh this
            this.warna = warna;
          }

          bersuara() { return 'meong'; }   // menimpa versi induk
        }

        const k = new Kucing('Mimi', 'oranye');
        k.perkenalan();        // 'Mimi berkata meong'
        k instanceof Kucing;   // true
        k instanceof Hewan;    // true
        `,
      ),
      p(
        'Perhatikan `perkenalan()`: ia didefinisikan di `Hewan`, tapi memanggil `this.bersuara()` yang di-*resolve* ke versi `Kucing`. Itulah **polymorphism** bekerja.',
      ),

      callout(
        'danger',
        '`super()` wajib dipanggil lebih dulu',
        'Menyentuh `this` sebelum `super()` di constructor turunan melempar `ReferenceError`. Alasannya: objeknya belum selesai dibentuk sampai constructor induk berjalan.',
      ),

      h2('Memanggil versi induk'),
      code(
        'js',
        `
        class Anjing extends Hewan {
          bersuara() { return 'guk'; }

          perkenalan() {
            return super.perkenalan() + ' dengan riang';   // perluas, bukan ganti total
          }
        }
        `,
      ),

      h2('Kapan inheritance salah pilih'),
      code(
        'js',
        `
        // Hierarki yang terlihat masuk akal... sampai kasus baru datang
        class Burung extends Hewan { terbang() { return 'terbang'; } }
        class Pinguin extends Burung { }   // pinguin tidak bisa terbang

        // Solusi buruk: menimpa dengan error
        class Pinguin2 extends Burung {
          terbang() { throw new Error('Pinguin tidak bisa terbang'); }
        }
        // Sekarang setiap kode yang menerima Burung bisa meledak tak terduga.
        `,
      ),
      callout(
        'warning',
        'Masalah "base class yang rapuh"',
        'Semakin dalam hierarki, semakin besar kemungkinan perubahan kecil di induk merusak turunan yang jauh — dan kamu tidak melihatnya saat mengedit induk. Aturan praktis: **maksimal satu tingkat**, dan berhenti kalau kamu mulai menimpa method dengan error.',
      ),

      h2('Mewarisi dari class bawaan'),
      code(
        'js',
        `
        class ValidasiError extends Error {
          constructor(field, pesan) {
            super(pesan);
            this.name = 'ValidasiError';
            this.field = field;
          }
        }

        const e = new ValidasiError('email', 'Format tidak valid');
        e instanceof ValidasiError;   // true
        e instanceof Error;           // true
        e.stack;                      // jejak tumpukan tetap ada
        `,
        { caption: 'Ini pemakaian inheritance yang hampir selalu tepat: memperluas Error.' },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`super()` wajib dipanggil sebelum menyentuh `this` di constructor turunan.',
        '`super.method()` memanggil versi induk — untuk memperluas, bukan mengganti.',
        'Method induk yang memanggil `this.x()` akan memakai versi turunan (polymorphism).',
        'Batasi kedalaman hierarki; menimpa method dengan error adalah tanda pilihan yang salah.',
        'Memperluas `Error` adalah kasus inheritance yang hampir selalu benar.',
      ),
      references(
        {
          label: 'extends',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends',
          source: 'MDN',
          note: 'Termasuk aturan mewarisi dari class bawaan seperti `Error` dan `Array`.',
        },
        {
          label: 'super',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super',
          source: 'MDN',
          note: 'Menjelaskan kedua bentuknya sekaligus alasan `super()` wajib dipanggil sebelum `this`.',
        },
        {
          label: 'instanceof',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof',
          source: 'MDN',
          note: 'Menegaskan bahwa pemeriksaannya menelusuri seluruh rantai prototype, bukan satu tingkat.',
        },
        {
          label: 'Error: cause',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause',
          source: 'MDN',
          note: 'Cara membawa error asal saat membuat kelas error turunan sendiri.',
        },
        {
          label: 'Object.setPrototypeOf()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf',
          source: 'MDN',
          note: 'Apa yang sebenarnya dilakukan `extends` di balik layar, ditulis secara eksplisit.',
        },
      ),
    ],
  ),

  written(
    'polymorphism',
    'Polymorphism & Duck Typing',
    10,
    'Satu antarmuka, banyak implementasi — tanpa perlu interface formal.',
    [
      p(
        'Polymorphism berarti kode pemanggil tidak perlu tahu tipe konkretnya. Ia memanggil `bayar()`, dan objek yang menerimanya yang tahu caranya. Nilainya: **menambah kasus baru tidak mengubah kode yang sudah ada.**',
      ),

      terms(
        {
          term: 'polymorphism',
          meaning:
            'Dari bahasa Yunani *poly* (banyak) dan *morphe* (bentuk) — harfiahnya **berbagai bentuk**. Kemampuan kode pemanggil untuk **tidak perlu tahu tipe konkret** dari objek yang ia pegang. Ia cukup memanggil `metode.proses(jumlah)`, dan objek yang menerimanyalah yang tahu caranya. Nilai praktisnya besar: menambah jenis baru tidak memaksamu mengedit satu baris pun kode lama.',
        },
        {
          term: 'duck typing',
          meaning:
            'Terjemahan harfiahnya **penipean bebek**, dari pepatah Inggris: *"kalau ia berjalan seperti bebek dan bersuara seperti bebek, maka ia bebek"*. Cara JavaScript menentukan kecocokan: ia **tidak peduli sebuah objek bertipe apa atau dibuat dari class mana**, yang penting objek itu punya method yang sedang dipanggil. Karena itu object literal, hasil factory, dan instance class bisa dipakai bergantian tanpa masalah.',
        },
        {
          term: 'antarmuka',
          meaning:
            'Terjemahan dari *interface*. Kesepakatan tentang **method apa saja yang harus dimiliki** sebuah objek agar bisa dipakai di suatu tempat. Di JavaScript kesepakatan ini bersifat tak tertulis — tidak ada kata kunci `interface` seperti di Java. TypeScript-lah yang kelak membuatnya tertulis dan bisa diperiksa sebelum program dijalankan.',
        },
        {
          term: 'implementasi',
          meaning:
            'Isi konkret dari sebuah antarmuka — **bagaimana** sesuatu benar-benar dikerjakan. `Kartu` dan `Transfer` adalah dua implementasi berbeda dari antarmuka yang sama, yaitu "punya method `proses(jumlah)`".',
        },
        {
          term: 'rantai if',
          meaning:
            'Deretan `if` atau `switch` yang memeriksa tipe lalu bercabang, seperti pada contoh "SEBELUM" di bawah. Ia bukan salah secara teknis, tapi punya satu kelemahan yang tumbuh seiring waktu: **setiap kasus baru memaksamu mengedit fungsi lama**, dan setiap pengeditan itu berpeluang merusak kasus yang sudah bekerja.',
        },
        {
          term: 'open–closed',
          meaning:
            'Singkatan dari *Open–Closed Principle*: sebuah rancangan sebaiknya **terbuka untuk perluasan, tertutup untuk perubahan**. Persis inilah yang dicapai contoh "SESUDAH": menambah metode pembayaran baru cukup dengan menambah class baru, tanpa menyentuh fungsi `bayar()`. Prinsip ini dibahas lagi di Sub-bab 2.11.',
        },
        {
          term: 'objek palsu',
          meaning:
            'Terjemahan bebas dari *mock* atau *stub*. Objek sederhana yang dibuat khusus untuk pengujian, menggantikan yang asli. Berkat duck typing, membuatnya sangat murah di JavaScript — `{ proses: () => "dipanggil" }` sudah cukup untuk menguji fungsi `bayar()` tanpa perlu kartu kredit sungguhan.',
        },
        {
          term: 'tipe nominal vs struktural',
          meaning:
            'Dua cara sistem tipe menentukan kecocokan. **Nominal** (Java, C#) menuntut objek benar-benar dideklarasikan sebagai turunan tipe tertentu. **Struktural** (TypeScript) hanya menuntut bentuknya cocok — punya method yang sama dengan tanda tangan yang sama. Duck typing pada dasarnya adalah versi struktural yang diperiksa saat program berjalan, bukan sebelumnya.',
        },
      ),

      h2('Menghapus rantai `if`'),
      code(
        'js',
        `
        // SEBELUM: setiap metode pembayaran baru berarti mengedit fungsi ini
        function bayar(metode, jumlah) {
          if (metode.tipe === 'kartu') return prosesKartu(jumlah);
          if (metode.tipe === 'transfer') return prosesTransfer(jumlah);
          if (metode.tipe === 'ewallet') return prosesEwallet(jumlah);
          throw new Error('Metode tidak dikenal');
        }
        `,
      ),
      code(
        'js',
        `
        // SESUDAH: menambah metode baru tidak menyentuh satu baris pun kode lama
        class Kartu {
          proses(jumlah) { return \`Kartu: \${jumlah}\`; }
        }
        class Transfer {
          proses(jumlah) { return \`Transfer: \${jumlah}\`; }
        }

        function bayar(metode, jumlah) {
          return metode.proses(jumlah);
        }

        bayar(new Kartu(), 50000);
        bayar(new Transfer(), 50000);
        `,
      ),

      h2('Duck typing'),
      p(
        '"Kalau ia berjalan seperti bebek dan bersuara seperti bebek, ia bebek." JavaScript tidak peduli tipe apa sebuah objek — yang penting **ia punya method yang dipanggil.**',
      ),
      code(
        'js',
        `
        // Tidak ada class, tidak ada inheritance — tetap polymorphic
        const tunai = { proses: (n) => \`Tunai: \${n}\` };
        const poin  = { proses: (n) => \`Poin: \${n}\` };

        bayar(tunai, 10000);   // bekerja
        bayar(poin, 10000);    // bekerja

        // Objek literal, class, factory — semuanya boleh bercampur
        `,
      ),
      callout(
        'tip',
        'Konsekuensinya untuk pengujian',
        'Karena tidak ada tipe formal yang harus dicocokkan, membuat objek palsu untuk test jadi sangat murah: `{ proses: () => "dipanggil" }` sudah cukup. Ini keunggulan nyata duck typing dibanding sistem tipe nominal.',
      ),

      h2('Batasnya, dan apa yang TypeScript tambahkan'),
      code(
        'js',
        `
        bayar({ prosess: () => 1 }, 100);   // salah ketik -> TypeError saat berjalan
        `,
      ),
      code(
        'ts',
        `
        interface MetodeBayar {
          proses(jumlah: number): string;
        }

        function bayar(metode: MetodeBayar, jumlah: number) {
          return metode.proses(jumlah);
        }

        bayar({ prosess: () => '' }, 100);
        // Error saat kompilasi: Object literal may only specify known properties
        `,
        {
          caption: 'TypeScript memeriksa bentuknya (structural typing) tanpa memaksa inheritance.',
        },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Polymorphism memindahkan percabangan dari pemanggil ke objeknya.',
        'Menambah kasus baru jadi tidak menyentuh kode lama.',
        'Duck typing: yang penting bentuknya, bukan tipenya — objek literal pun sah.',
        'TypeScript menambahkan pemeriksaan bentuk saat kompilasi, tanpa mewajibkan inheritance.',
      ),
      references(
        {
          label: 'Polymorphism',
          href: 'https://developer.mozilla.org/en-US/docs/Glossary/Polymorphism',
          source: 'MDN',
          note: 'Definisi ringkas beserta kaitannya dengan overriding di sub-bab sebelumnya.',
        },
        {
          label: 'Object Prototypes',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object_prototypes',
          source: 'MDN',
          note: 'Alasan JavaScript tidak memerlukan `interface` formal untuk mencapai polymorphism.',
        },
        {
          label: 'Interfaces',
          href: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
          source: 'TypeScript',
          note: 'Bentuk tertulis dari antarmuka yang di JavaScript hanya berupa kesepakatan tak tertulis.',
        },
        {
          label: 'Type Compatibility',
          href: 'https://www.typescriptlang.org/docs/handbook/type-compatibility.html',
          source: 'TypeScript',
          note: 'Penjelasan resmi *structural typing* — versi duck typing yang diperiksa sebelum program berjalan.',
        },
      ),
    ],
  ),

  written(
    'static-factory',
    'Anggota `static` & Factory Method',
    10,
    'Anggota yang menempel pada class, bukan pada instance.',
    [
      p(
        '`static` berarti "milik class itu sendiri". Tidak ada `this` yang merujuk instance, karena tidak ada instance yang terlibat.',
      ),

      terms(
        {
          term: 'static',
          meaning:
            'Artinya **melekat pada class itu sendiri**, bukan pada instance mana pun. `Suhu.NOL_MUTLAK` dibaca langsung dari class-nya, dan tidak ikut tersalin ke setiap objek yang kamu buat. Konsekuensinya penting: **di dalam anggota `static`, `this` menunjuk class-nya**, bukan sebuah instance — karena memang tidak ada instance yang terlibat.',
        },
        {
          term: 'factory method',
          meaning:
            'Terjemahannya **method pabrik**. Method `static` yang tugasnya membuat instance dengan cara tertentu, misalnya `Suhu.dariFahrenheit(77)`. Keunggulannya atas `constructor` ada pada **namanya**: satu class hanya boleh punya satu constructor dan namanya tidak bisa diubah, sedangkan factory method boleh sebanyak apa pun dan masing-masing bisa menjelaskan asal datanya.',
        },
        {
          term: 'konstanta bersama',
          meaning:
            'Nilai tetap yang berlaku untuk seluruh golongan, bukan untuk satu objek — misalnya `NOL_MUTLAK`. Menaruhnya sebagai `static` membuatnya punya rumah yang jelas dan mudah ditemukan, alih-alih berkeliaran sebagai variabel lepas di suatu berkas.',
        },
        {
          term: 'comparator',
          meaning:
            'Dibaca "kom-pa-rei-tor", artinya **fungsi pembanding**. Fungsi yang menerima dua nilai lalu mengembalikan angka negatif, nol, atau positif untuk menentukan urutan. `sort` memerlukannya untuk mengurutkan angka dengan benar, dan menaruhnya sebagai `static` pada class yang bersangkutan membuatnya mudah ditemukan.',
        },
        {
          term: 'cache',
          meaning:
            'Dibaca "kesy", artinya **simpanan sementara**. Menyimpan hasil yang sudah pernah dibuat agar permintaan berikutnya tidak perlu membuatnya ulang. Disebut di sini karena inilah salah satu hal yang **bisa dilakukan factory method tapi tidak bisa dilakukan `new`** — `new` selalu memaksa pembuatan objek baru.',
        },
        {
          term: 'keadaan global',
          meaning:
            'Terjemahan dari *global state*. Data yang bisa dibaca dan diubah dari mana saja di seluruh aplikasi. Berbahaya karena tidak ada yang bisa memastikan siapa mengubah apa dan kapan, sehingga bug jadi sulit direproduksi. Menyimpannya di dalam anggota `static` tidak membuatnya lebih aman — ia hanya menyamar dengan pakaian OOP.',
        },
        {
          term: 'singleton',
          meaning:
            'Dibaca "sing-gel-ton", artinya **satu-satunya**. Pola di mana sebuah class sengaja dirancang hanya boleh punya satu instance untuk seluruh aplikasi. Terdengar rapi, tapi sebenarnya ia keadaan global dengan nama lain — dan mewarisi semua kesulitannya, terutama saat pengujian.',
        },
        {
          term: 'dependency injection',
          meaning:
            'Terjemahannya **penyuntikan kebergantungan**. Alih-alih sebuah bagian kode mengambil sendiri apa yang ia butuhkan dari tempat global, kebutuhan itu **diserahkan dari luar** lewat parameter. Ini obat langsung untuk masalah keadaan global: apa yang diserahkan dari luar bisa diganti dengan objek palsu saat pengujian.',
        },
      ),

      h2('Static method dan field'),
      code(
        'js',
        `
        class Suhu {
          static NOL_MUTLAK = -273.15;

          constructor(celsius) { this.celsius = celsius; }

          static dariFahrenheit(f) {
            return new Suhu((f - 32) * 5 / 9);
          }

          static bandingkan(a, b) {
            return a.celsius - b.celsius;
          }
        }

        Suhu.NOL_MUTLAK;                    // -273.15
        Suhu.dariFahrenheit(77).celsius;    // 25
        [new Suhu(30), new Suhu(10)].sort(Suhu.bandingkan);
        `,
      ),

      h2('Factory method: constructor yang punya nama'),
      p(
        'Constructor hanya ada satu dan tidak bisa diberi nama. Kalau sebuah objek bisa dibuat dari beberapa sumber, factory method jauh lebih terbaca.',
      ),
      code(
        'js',
        `
        // SEBELUM: satu constructor mengerjakan tiga hal
        new Pengguna(nama, email, null, null);
        new Pengguna(null, null, jsonString, null);

        // SESUDAH: tiap jalur punya nama yang menjelaskan dirinya
        class Pengguna {
          #nama; #email;

          constructor(nama, email) {
            this.#nama = nama;
            this.#email = email;
          }

          static dariForm(formData) {
            return new Pengguna(formData.get('nama'), formData.get('email'));
          }

          static dariJSON(json) {
            const { nama, email } = JSON.parse(json);
            return new Pengguna(nama, email);
          }

          static tamu() {
            return new Pengguna('Tamu', null);
          }
        }

        Pengguna.dariForm(fd);
        Pengguna.tamu();
        `,
      ),
      callout(
        'tip',
        'Factory method bisa mengembalikan objek yang sudah ada',
        'Constructor **selalu** membuat objek baru. Factory method boleh mengembalikan instance yang di-cache, atau bahkan subclass yang berbeda — fleksibilitas yang tidak dimiliki `new`.',
      ),

      h2('Anti-pola: `static` sebagai gudang global'),
      code(
        'js',
        `
        // SALAH: keadaan global yang disamarkan sebagai class
        class Konfigurasi {
          static data = {};
          static set(k, v) { Konfigurasi.data[k] = v; }
          static get(k) { return Konfigurasi.data[k]; }
        }
        // Semua kode berbagi satu keadaan. Test saling memengaruhi.
        // Tidak ada cara punya dua konfigurasi berbeda.

        // BENAR: instance yang dioper secara eksplisit
        class Konfigurasi2 {
          #data;
          constructor(awal = {}) { this.#data = { ...awal }; }
          get(k) { return this.#data[k]; }
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`static` milik class, bukan instance — tidak ada `this` ke objek.',
        'Factory method memberi nama pada cara pembuatan objek yang berbeda-beda.',
        'Factory boleh mengembalikan objek yang sudah ada; constructor tidak.',
        '`static` yang menyimpan data yang berubah adalah variabel global yang menyamar.',
      ),
      references(
        {
          label: 'static',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static',
          source: 'MDN',
          note: 'Aturan resmi anggota `static`, termasuk nilai `this` di dalamnya yang menunjuk class.',
        },
        {
          label: 'Static initialization blocks',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks',
          source: 'MDN',
          note: 'Blok `static { ... }` untuk penyiapan yang lebih rumit daripada sekadar mengisi satu nilai.',
        },
        {
          label: 'Array.prototype.sort()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort',
          source: 'MDN',
          note: 'Kontrak fungsi pembanding yang dipakai `Suhu.bandingkan` — negatif, nol, atau positif.',
        },
        {
          label: 'Private properties',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties',
          source: 'MDN',
          note: 'Termasuk `static #field`, yang dipakai pada contoh alternatif yang benar di atas.',
        },
      ),
    ],
  ),

  written(
    'composition-over-inheritance',
    'Composition over Inheritance',
    13,
    'Menyusun perilaku dari bagian kecil, alih-alih mewarisi pohon yang kaku.',
    [
      p(
        'Inheritance menjawab "**apa** benda ini". Composition menjawab "**apa yang bisa** ia lakukan". Yang kedua hampir selalu lebih tahan terhadap perubahan, karena kemampuan bisa ditambah dan dicabut satu per satu.',
      ),

      terms(
        {
          term: 'composition',
          meaning:
            'Dibaca "kom-po-si-syen", terjemahannya **penyusunan** atau perakitan. Membangun kemampuan sebuah objek dengan **merakit bagian-bagian kecil yang berdiri sendiri**, alih-alih mewarisinya dari sebuah induk. Bedanya dengan inheritance terletak pada pertanyaan yang dijawab: inheritance menjawab "apa benda ini", composition menjawab "apa yang bisa ia lakukan".',
        },
        {
          term: 'delegasi',
          meaning:
            'Dari *delegation*, artinya **melimpahkan tugas**. Sebuah objek menyimpan objek lain di dalamnya, lalu meneruskan permintaan kepadanya: `Mobil` menyimpan `Mesin` dan meneruskan `nyalakan()` ke sana. Ini wujud composition ketika kamu tetap memakai class — mobil tidak *menjadi* mesin, ia hanya *punya* mesin dan menyuruhnya bekerja.',
        },
        {
          term: 'multiple inheritance',
          meaning:
            'Terjemahannya **pewarisan berganda** — satu class mewarisi dari dua atau lebih induk sekaligus. **JavaScript tidak mendukungnya**, dan itu keputusan yang disengaja karena pewarisan berganda menimbulkan pertanyaan sulit soal method mana yang menang. Composition adalah jawaban JavaScript untuk kebutuhan yang sama, tanpa kerumitannya.',
        },
        {
          term: 'mixin',
          meaning:
            'Dibaca "mik-sin", dari *mix in* (mencampurkan ke dalam). Sebuah objek berisi sekumpulan method yang **dicampurkan** ke objek lain, biasanya dengan spread `{ ...bisaKoding(nama) }`. Inilah bentuk paling langsung dari composition di JavaScript, dan tiap mixin bisa ditambah atau dicabut satu per satu.',
        },
        {
          term: 'tes kalimat',
          meaning:
            'Cara cepat memilih antara keduanya dengan mengucapkan hubungannya keras-keras. Kalau **"X adalah Y"** terdengar benar — `ValidasiError` adalah `Error` — inheritance masuk akal. Kalau **"X punya Y"** yang benar — `Mobil` punya `Mesin` — pakai composition. Sederhana, tapi menyelesaikan sebagian besar perdebatan sebelum kodenya sempat ditulis.',
        },
        {
          term: 'boolean prop',
          meaning:
            'Prop berupa `true`/`false` yang dipakai untuk menyalakan bagian tertentu, seperti `<Modal withHeader withFooter />`. Terlihat praktis di awal, tapi jumlahnya cenderung terus bertambah sampai komponennya sulit dipahami. Ini pertanda inheritance yang menyamar, dan obatnya adalah composition.',
        },
        {
          term: 'compound component',
          meaning:
            'Terjemahannya **komponen majemuk**. Pola React di mana sebuah komponen induk menyediakan beberapa komponen anak yang dipakai bersama: `<Modal><Modal.Header/><Modal.Body/></Modal>`. Ini composition dalam bentuk paling murni, dan dibahas tuntas di Frontend Intermediate Bab 6.',
        },
        {
          term: 'coupling',
          meaning:
            'Dibaca "ka-pling", artinya **keterikatan** antar bagian kode. Inheritance menghasilkan keterikatan yang sangat erat — turunan bergantung pada detail internal induknya, sehingga perubahan kecil di induk bisa merusak turunan yang jauh. Composition menjaga keterikatan tetap longgar karena tiap bagian hanya perlu tahu antarmuka bagian lain.',
        },
      ),

      h2('Masalahnya dulu'),
      code(
        'js',
        `
        class Karyawan { bekerja() {} }
        class Manajer extends Karyawan { memimpin() {} }
        class Programmer extends Karyawan { koding() {} }

        // Lalu datang: manajer yang juga koding.
        // JavaScript tidak punya multiple inheritance. Pilihanmu:
        //   - duplikasi method
        //   - naikkan koding() ke Karyawan (semua karyawan jadi bisa koding)
        //   - hierarki makin dalam dan makin rapuh
        `,
      ),

      h2('Composition'),
      code(
        'js',
        `
        // Tiap kemampuan berdiri sendiri
        const bisaBekerja = (nama) => ({
          bekerja: () => \`\${nama} sedang bekerja\`,
        });

        const bisaMemimpin = (nama) => ({
          memimpin: (tim) => \`\${nama} memimpin \${tim.length} orang\`,
        });

        const bisaKoding = (nama) => ({
          koding: (bahasa) => \`\${nama} menulis \${bahasa}\`,
        });

        // Rakit sesuai kebutuhan
        function buatManajerTeknis(nama) {
          return {
            nama,
            ...bisaBekerja(nama),
            ...bisaMemimpin(nama),
            ...bisaKoding(nama),
          };
        }

        const m = buatManajerTeknis('Zum');
        m.koding('TypeScript');   // 'Zum menulis TypeScript'
        `,
      ),

      h2('Composition dengan class: delegasi'),
      code(
        'js',
        `
        class Mesin {
          nyalakan() { return 'mesin menyala'; }
        }

        // Mobil BUKAN mesin — mobil PUNYA mesin
        class Mobil {
          #mesin = new Mesin();

          nyalakan() { return this.#mesin.nyalakan(); }
        }
        `,
      ),
      callout(
        'tip',
        'Tes kalimat yang menyelesaikan banyak perdebatan',
        'Ucapkan hubungannya. Kalau "**X adalah Y**" terdengar benar (`ValidasiError` adalah `Error`), inheritance masuk akal. Kalau "**X punya Y**" yang benar (`Mobil` punya `Mesin`), pakai composition. `Mobil extends Mesin` gagal tes ini.',
      ),

      h2('Kriteria memilih'),
      table(
        ['Pertanyaan', 'Inheritance', 'Composition'],
        [
          ['Hubungannya', '"adalah"', '"punya" / "bisa"'],
          ['Menambah kemampuan baru', 'Ubah hierarki', 'Tambah satu bagian'],
          ['Beberapa kemampuan sekaligus', 'Tidak bisa (satu induk)', 'Bisa'],
          ['Mengganti bagian saat berjalan', 'Tidak', 'Bisa'],
          ['Mudah diuji terpisah', 'Sulit', 'Mudah'],
          ['Kode paling sedikit', 'Sering ya', 'Sering lebih panjang'],
        ],
      ),

      h2('Composition di React'),
      code(
        'jsx',
        `
        // Bukan <Modal withHeader withFooter closable /> — itu inheritance yang menyamar
        <Modal>
          <Modal.Header>Judul</Modal.Header>
          <Modal.Body>Isi</Modal.Body>
          <Modal.Footer><Button>Tutup</Button></Modal.Footer>
        </Modal>
        `,
        {
          caption:
            'Prinsip yang sama, tanpa satu pun class — dibahas tuntas di Frontend Intermediate Bab 6.',
        },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Inheritance menjawab "apa benda ini"; composition menjawab "apa yang bisa ia lakukan".',
        'Tes kalimat: "adalah" → inheritance, "punya"/"bisa" → composition.',
        'Composition membolehkan banyak kemampuan sekaligus dan bisa diganti saat berjalan.',
        'Harganya: biasanya sedikit lebih banyak kode. Hampir selalu sepadan.',
      ),
      references(
        {
          label: 'Spread syntax (...)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax',
          source: 'MDN',
          note: 'Mekanisme di balik pencampuran mixin `{ ...bisaKoding(nama) }` pada contoh di atas.',
        },
        {
          label: 'Object.assign()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign',
          source: 'MDN',
          note: 'Cara lain mencampurkan mixin, termasuk ke `prototype` sebuah class.',
        },
        {
          label: 'Extending built-in classes',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends',
          source: 'MDN',
          note: 'Bagian "Mix-ins" menunjukkan pola composition memakai class expression sebagai fungsi.',
        },
        {
          label: 'Passing JSX as children',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dasar pola compound component yang menggantikan ledakan boolean prop.',
        },
        {
          label: 'Extracting State Logic into a Reducer',
          href: 'https://react.dev/learn/extracting-state-logic-into-a-reducer',
          source: 'React',
          note: 'Contoh nyata memecah perilaku menjadi bagian yang bisa diuji terpisah, tanpa satu pun class.',
        },
      ),
    ],
  ),

  written(
    'solid-ringkas',
    'SOLID Ringkas untuk JavaScript',
    13,
    'Lima prinsip desain, diterjemahkan ke idiom JavaScript — bukan disalin dari Java.',
    [
      p(
        'SOLID dirumuskan untuk bahasa dengan interface dan class yang ketat. Di JavaScript, sebagian besarnya tetap berlaku — tapi wujudnya sering berupa **fungsi dan modul**, bukan hierarki class.',
      ),

      terms(
        {
          term: 'SOLID',
          meaning:
            'Akronim dari lima huruf awal prinsip yang dirangkum Robert C. Martin: **S**ingle Responsibility, **O**pen/Closed, **L**iskov Substitution, **I**nterface Segregation, dan **D**ependency Inversion. Perlu dicatat sejak awal: kelimanya dirumuskan untuk bahasa dengan `interface` dan class yang ketat seperti Java, jadi di JavaScript wujudnya sering berupa **fungsi dan modul**, bukan hierarki class.',
        },
        {
          term: 'Single Responsibility',
          meaning:
            'Terjemahannya **tanggung jawab tunggal**. Sebuah modul sebaiknya punya **satu alasan untuk berubah**. Perhatikan bahwa yang diukur adalah *alasan berubah*, bukan jumlah baris. Uji cepatnya ada di bawah: sebutkan tanggung jawab modul itu dalam satu kalimat — kalau kalimatnya butuh kata "dan", kemungkinan besar ia sudah lebih dari satu.',
        },
        {
          term: 'Open/Closed',
          meaning:
            'Terjemahannya **terbuka–tertutup**: terbuka untuk **diperluas**, tertutup untuk **diubah**. Menambah kemampuan baru sebaiknya berarti menambah kode baru, bukan mengedit kode yang sudah bekerja. Alasannya praktis: kode yang tidak disentuh tidak bisa rusak.',
        },
        {
          term: 'Liskov Substitution',
          meaning:
            'Diambil dari nama Barbara Liskov, ilmuwan komputer yang merumuskannya. Isinya: **objek turunan harus bisa menggantikan induknya tanpa mengejutkan pemanggil**. Pinguin yang mewarisi `terbang()` lalu melemparkan error melanggarnya — dan obatnya bukan menambal, melainkan mengakui bahwa hierarkinya memang salah sejak awal.',
        },
        {
          term: 'Interface Segregation',
          meaning:
            'Terjemahannya **pemisahan antarmuka**. Jangan memaksa pemakai bergantung pada hal-hal yang tidak ia pakai. Di JavaScript ini paling sering muncul sebagai **parameter fungsi dan props komponen**: minta persis apa yang benar-benar dipakai, bukan satu objek raksasa berisi segalanya.',
        },
        {
          term: 'Dependency Inversion',
          meaning:
            'Terjemahannya **pembalikan kebergantungan**. Bagian penting sebaiknya bergantung pada **kemampuan yang diserahkan dari luar**, bukan mengambil sendiri implementasi konkret dari dalam dirinya. Manfaat paling nyata terasa saat pengujian: kelas yang menerima repositorinya lewat constructor bisa diuji dengan objek palsu, tanpa perlu menambal `fetch` global.',
        },
        {
          term: 'dependensi',
          meaning:
            'Dari *dependency*, artinya **sesuatu yang dibutuhkan** sebuah bagian kode agar bisa bekerja — sebuah pustaka, sebuah layanan jaringan, atau sekadar fungsi lain. Ia menjadi masalah ketika diambil diam-diam dari dalam, karena saat itulah ia tidak bisa diganti dari luar.',
        },
        {
          term: 'mock global',
          meaning:
            'Praktik mengganti fungsi bawaan seperti `fetch` dengan versi palsu selama pengujian. Bisa dilakukan, tapi rapuh: ia memengaruhi seluruh berkas test, mudah bocor antar-test, dan menyembunyikan bahwa rancangannya sebenarnya terlalu terikat. Dependency Inversion menghapus kebutuhan ini sepenuhnya.',
        },
        {
          term: 'abstraksi prematur',
          meaning:
            'Terjemahan dari *premature abstraction*. Membangun lapisan fleksibel untuk kebutuhan yang **belum ada**. Biayanya dibayar hari ini dalam bentuk waktu membaca, sementara manfaatnya mungkin tidak pernah datang. Aturan project ini melarangnya terang-terangan, dan itulah inti peringatan di akhir sub-bab.',
        },
      ),

      h2('S — Single Responsibility'),
      code(
        'js',
        `
        // SALAH: tiga alasan untuk berubah dalam satu class
        class Laporan {
          hitung() {}
          keHTML() {}
          kirimEmail() {}
        }

        // BENAR: tiap bagian berubah karena alasannya sendiri
        const hitungLaporan = (data) => { /* ... */ };
        const laporanKeHTML = (hasil) => { /* ... */ };
        const kirimLaporan = (html, ke) => { /* ... */ };
        `,
      ),
      p(
        'Uji cepat: sebutkan tanggung jawab modul ini dalam satu kalimat. Kalau ada kata "dan", kemungkinan ia lebih dari satu.',
      ),

      h2('O — Open/Closed'),
      code(
        'js',
        `
        // SALAH: menambah format berarti mengedit fungsi ini terus-menerus
        function ekspor(data, format) {
          if (format === 'csv') return keCSV(data);
          if (format === 'json') return keJSON(data);
        }

        // BENAR: terbuka untuk diperluas, tertutup untuk diubah
        const eksporter = {
          csv: keCSV,
          json: keJSON,
        };

        function ekspor(data, format) {
          const fn = eksporter[format];
          if (!fn) throw new Error(\`Format tidak dikenal: \${format}\`);
          return fn(data);
        }

        eksporter.xml = keXML;   // menambah tanpa menyentuh ekspor()
        `,
      ),

      h2('L — Liskov Substitution'),
      p('Turunan harus bisa menggantikan induknya tanpa mengejutkan pemanggil.'),
      code(
        'js',
        `
        // MELANGGAR: pemanggil yang menerima Burung tidak menduga ini
        class Pinguin extends Burung {
          terbang() { throw new Error('tidak bisa terbang'); }
        }

        // Perbaikannya bukan menambal — tapi mengakui hierarkinya salah.
        // Pakai composition: kemampuan terbang jadi bagian yang dirakit.
        `,
      ),

      h2('I — Interface Segregation'),
      code(
        'js',
        `
        // SALAH: satu objek raksasa, pemanggil dipaksa menerima semuanya
        function buatEditor({ simpan, muat, cetak, ekspor, bagikan, komentar }) {}

        // BENAR: minta persis yang dipakai
        function buatEditor({ simpan, muat }) {}
        `,
      ),
      p(
        'Di JavaScript ini muncul sebagai **props komponen** dan **parameter fungsi**: jangan menuntut lebih dari yang benar-benar dipakai.',
      ),

      h2('D — Dependency Inversion'),
      code(
        'js',
        `
        // SALAH: terikat langsung ke implementasi
        class LayananPengguna {
          async simpan(u) {
            await fetch('/api/pengguna', { method: 'POST', body: JSON.stringify(u) });
          }
        }
        // Untuk mengujinya, kamu harus mem-patch fetch global.

        // BENAR: bergantung pada kemampuan yang dioper masuk
        class LayananPengguna2 {
          #repo;
          constructor(repo) { this.#repo = repo; }
          simpan(u) { return this.#repo.simpan(u); }
        }

        // Produksi
        new LayananPengguna2(repoAPI);
        // Test — tanpa jaringan, tanpa mock global
        new LayananPengguna2({ simpan: async () => 'ok' });
        `,
      ),

      h2('Kapan SOLID justru berlebihan'),
      callout(
        'warning',
        'Prinsip adalah obat, bukan vitamin',
        'Menerapkan kelimanya pada skrip 50 baris menghasilkan lima berkas dan satu lapisan abstraksi untuk pemanggil yang belum ada. `code-style.md` melarang itu terang-terangan: **jangan membangun abstraksi untuk pemanggil yang belum eksis.** Terapkan saat rasa sakitnya sudah terasa — biasanya pada perubahan kedua atau ketiga di tempat yang sama.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'S: satu alasan untuk berubah. Kalau deskripsinya mengandung "dan", pecah.',
        'O: tambah tanpa mengedit — peta atau daftar yang bisa didaftari.',
        'L: turunan tidak boleh mengejutkan pemanggil induknya.',
        'I: minta persis yang dipakai, bukan objek raksasa.',
        'D: oper dependensi masuk — itu yang membuat test tidak butuh mock global.',
        'Terapkan saat sakitnya terasa, bukan sebagai ritual di awal.',
      ),
      references(
        {
          label: 'Object-oriented programming',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming',
          source: 'MDN',
          note: 'Bagian "Should you use OOP?" sejalan dengan peringatan penutup sub-bab ini.',
        },
        {
          label: 'Optional chaining (?.)',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining',
          source: 'MDN',
          note: 'Dipakai pada pola peta eksporter agar format tak dikenal ditangani tanpa rantai `if`.',
        },
        {
          label: 'Destructuring assignment',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring',
          source: 'MDN',
          note: 'Mekanisme di balik Interface Segregation versi JavaScript: `function buatEditor({ simpan, muat })`.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Penerapan Single Responsibility pada bentuk data, bukan pada hierarki class.',
        },
      ),
    ],
  ),

  written(
    'praktik-refactor-todo',
    'Praktik: Refactor To-Do List jadi berbasis class',
    15,
    'Mengubah modul fungsional Bab 1 jadi rancangan berorientasi objek — lalu menilai jujur apakah itu memang lebih baik.',
    [
      p(
        'Praktik ini punya kesimpulan yang mungkin mengejutkan. Kamu akan menulis versi class-nya sungguhan, lalu membandingkannya dengan versi fungsional dari Bab 1 — dan memutuskan sendiri mana yang menang untuk kasus ini.',
      ),

      terms(
        {
          term: 'refactor',
          meaning:
            'Dibaca "ri-fek-tor", terjemahannya **menata ulang**. Mengubah **struktur** kode tanpa mengubah **perilakunya** dari sudut pandang pemakai. Ini syarat yang ketat dan mudah dilanggar: begitu hasil yang terlihat ikut berubah, yang kamu lakukan bukan lagi refactor melainkan penulisan ulang — dan keduanya butuh kehati-hatian yang berbeda.',
        },
        {
          term: 'toJSON',
          meaning:
            'Method dengan nama khusus yang **dicari otomatis oleh `JSON.stringify()`**. Kalau sebuah objek punya method ini, `stringify` memakai nilai kembaliannya alih-alih membaca property objeknya langsung. Di sini ia wajib ada, karena private field `#judul` tidak pernah ikut ter-serialize dengan sendirinya.',
        },
        {
          term: 'method chaining',
          meaning:
            'Terjemahannya **merangkai method**. Pola di mana sebuah method mengembalikan `this` agar pemanggilan berikutnya bisa langsung disambung: `tugas.toggle().ubahJudul("baru")`. Perhatikan baris `return this;` pada `toggle()` — itulah yang memungkinkannya.',
        },
        {
          term: 'kebocoran enkapsulasi',
          meaning:
            'Terjemahan bebas dari *encapsulation leak*. Keadaan ketika data internal yang seharusnya terlindungi ternyata bisa disentuh dari luar. Contoh paling sering: getter yang mengembalikan **array internal itu sendiri**, sehingga pemanggil bisa menulis `daftar.semua.push(...)` dan menembus seluruh perlindungan. Obatnya sederhana — kembalikan salinan, seperti `[...this.#item]`.',
        },
        {
          term: 'Object.assign',
          meaning:
            'Fungsi bawaan yang **menyalin property dari satu atau beberapa objek ke objek tujuan**, lalu mengembalikan objek tujuan itu. Dipakai di sini untuk mencampurkan mixin ke sebuah instance. Perlu dicatat, ia menyalin secara **dangkal** dan tidak bisa menyentuh private field.',
        },
        {
          term: 'findIndex',
          meaning:
            'Method array yang mengembalikan **posisi** elemen pertama yang cocok, atau `-1` kalau tidak ada. Bedakan dari `find` yang mengembalikan elemennya. Nilai `-1` itulah yang dipakai `hapus()` untuk membedakan "ketemu" dari "tidak ada" sebelum memanggil `splice`.',
        },
        {
          term: 'splice',
          meaning:
            'Dibaca "splais", artinya **menyambung atau menyisipkan**. Method array yang membuang dan/atau menyisipkan elemen **langsung pada array aslinya** — ia bermutasi. Aman dipakai di sini justru karena arraynya privat (`#item`), sehingga tidak ada pihak luar yang bisa terkejut oleh perubahan itu.',
        },
        {
          term: 'trade-off',
          meaning:
            'Terjemahannya **pertukaran untung-rugi**. Keadaan ketika memilih satu keuntungan berarti melepaskan keuntungan lain — bukan salah satu pilihan yang benar dan satunya salah. Seluruh praktik ini pada dasarnya adalah latihan menilai trade-off antara versi class dan versi fungsional, dan kesimpulannya sengaja tidak diberikan di awal.',
        },
      ),

      h2('1. Versi class'),
      code(
        'js',
        `
        class Tugas {
          #id; #judul; #selesai = false;

          constructor(judul) {
            const bersih = judul.trim();
            if (bersih.length === 0) throw new Error('Judul tugas tidak boleh kosong');

            this.#id = crypto.randomUUID();
            this.#judul = bersih;
          }

          get id() { return this.#id; }
          get judul() { return this.#judul; }
          get selesai() { return this.#selesai; }

          toggle() { this.#selesai = !this.#selesai; return this; }

          ubahJudul(baru) {
            const bersih = baru.trim();
            if (bersih.length === 0) throw new Error('Judul tugas tidak boleh kosong');
            this.#judul = bersih;
            return this;
          }

          toJSON() {
            return { id: this.#id, judul: this.#judul, selesai: this.#selesai };
          }
        }
        `,
        { filename: 'src/Tugas.js' },
      ),
      code(
        'js',
        `
        export class DaftarTugas {
          #item = [];

          tambah(judul) {
            const t = new Tugas(judul);
            this.#item.push(t);
            return t;
          }

          hapus(id) {
            const i = this.#item.findIndex((t) => t.id === id);
            if (i === -1) return false;
            this.#item.splice(i, 1);
            return true;
          }

          cari(id) { return this.#item.find((t) => t.id === id); }

          get semua()   { return [...this.#item]; }   // salinan — internal tetap terlindungi
          get aktif()   { return this.#item.filter((t) => !t.selesai); }
          get selesai() { return this.#item.filter((t) => t.selesai); }

          get ringkasan() {
            const selesai = this.selesai.length;
            return {
              total: this.#item.length,
              selesai,
              aktif: this.#item.length - selesai,
              persen: this.#item.length === 0
                ? 0
                : Math.round((selesai / this.#item.length) * 100),
            };
          }
        }
        `,
        { filename: 'src/DaftarTugas.js' },
      ),
      callout(
        'tip',
        'Perhatikan getter `semua`',
        'Ia mengembalikan **salinan**, bukan array internal. Tanpa itu, pemanggil bisa menulis `daftar.semua.push(...)` dan menembus seluruh enkapsulasi yang baru saja kamu bangun. Kebocoran seperti ini adalah kesalahan encapsulation yang paling sering terjadi.',
      ),

      h2('2. Tambah kemampuan baru — lewat composition'),
      code(
        'js',
        `
        // Kebutuhan baru: sebagian tugas punya tenggat.
        // Godaan: class TugasBertenggat extends Tugas.
        // Masalahnya: nanti ada tugas berulang, tugas berprioritas...
        // dan JavaScript hanya punya satu induk.

        const bisaBertenggat = (tanggal) => ({
          tenggat: tanggal,
          terlambat() { return new Date() > this.tenggat; },
        });

        const bisaBerprioritas = (level) => ({
          prioritas: level,
        });

        function buatTugasLengkap(judul, { tenggat, prioritas } = {}) {
          const dasar = new Tugas(judul);
          return Object.assign(
            dasar,
            tenggat ? bisaBertenggat(tenggat) : {},
            prioritas ? bisaBerprioritas(prioritas) : {},
          );
        }
        `,
      ),

      h2('3. Bandingkan dengan jujur'),
      table(
        ['Aspek', 'Fungsional (Bab 1)', 'Class (bab ini)'],
        [
          ['Aturan dijaga', 'Bergantung pemanggil', '**Dijaga tipe itu sendiri**'],
          ['Mutasi', 'Tidak ada', 'Ada, di dalam objek'],
          ['Cocok untuk React', '**Ya, langsung**', 'Perlu penyesuaian'],
          ['Menguji satu operasi', '**Panggil satu fungsi**', 'Bangun objek dulu'],
          ['Menambah operasi', 'Tambah fungsi', 'Edit class'],
          ['Jumlah kode', '**Lebih sedikit**', 'Lebih banyak'],
        ],
      ),
      callout(
        'info',
        'Kesimpulan yang jujur untuk kasus ini',
        'Untuk To-Do List di aplikasi React, **versi fungsional dari Bab 1 lebih tepat.** State React harus diperlakukan immutable, dan class yang bermutasi justru melawan arus itu. Versi class akan menang di tempat lain: objek berumur panjang dengan aturan ketat — sesi, koneksi, keranjang belanja di server.',
      ),
      p(
        'Ini pelajaran sesungguhnya dari bab ini. OOP bukan tingkat yang lebih tinggi dari fungsional — ia **alat lain** dengan trade-off berbeda. Bisa memilih dengan alasan lebih berharga daripada menguasai sintaksnya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Getter yang mengembalikan koleksi internal harus mengembalikan salinan.',
        'Composition menambah kemampuan tanpa memaksa hierarki baru.',
        'Untuk state React, pendekatan immutable menang; untuk objek berumur panjang, class menang.',
        'Yang dinilai bukan kemampuan menulis class, melainkan kemampuan memilih dengan alasan.',
      ),
      references(
        {
          label: 'JSON.stringify()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify',
          source: 'MDN',
          note: 'Bagian "toJSON() behavior" menjelaskan kenapa method itu wajib ada saat memakai private field.',
        },
        {
          label: 'Array.prototype.splice()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice',
          source: 'MDN',
          note: 'Method yang bermutasi — aman di sini justru karena arraynya privat.',
        },
        {
          label: 'Object.assign()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign',
          source: 'MDN',
          note: 'Dipakai mencampurkan mixin ke instance; menegaskan bahwa salinannya bersifat dangkal.',
        },
        {
          label: 'Updating Objects in State',
          href: 'https://react.dev/learn/updating-objects-in-state',
          source: 'React',
          note: 'Dasar kesimpulan sub-bab ini: state React harus diperlakukan immutable, dan class yang bermutasi melawan arus itu.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Alasan pendekatan fungsional Bab 1 lebih cocok untuk To-Do List di React.',
        },
      ),
    ],
  ),
];
