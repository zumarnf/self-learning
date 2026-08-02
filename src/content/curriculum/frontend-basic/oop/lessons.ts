import { callout, code, divider, h2, p, table, ul } from '@/lib/content/builders';
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
    ],
  ),
];
