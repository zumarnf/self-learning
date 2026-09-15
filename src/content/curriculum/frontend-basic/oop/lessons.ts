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
 * Frontend Basic — Chapter 2, all twelve lessons.
 *
 * Every code sample was executed before being written down.
 */
export const lessons: LessonDraft[] = [
  written(
    'kenapa-oop',
    'Kenapa OOP — dan kapan justru tidak perlu',
    18,
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
      p(
        'Perhatikan `#item`, karena awalan pagar menandai **private field**, sintaks yang membuat properti itu hanya bisa diakses dari dalam tubuh class `Keranjang` sendiri. Kode di luar class, sekalipun sudah punya instance-nya, tidak bisa menulis `keranjang.#item.push(...)` untuk melewati pengecekan di `tambah()`, sebab mencobanya menghasilkan `SyntaxError` alih-alih sekadar konvensi penamaan yang bisa dilanggar diam-diam seperti awalan `_` di kode lama. Justru di situlah nilai encapsulation terlihat konkret, karena aturan "jumlah harus lebih dari nol" dijamin oleh bahasa itu sendiri alih-alih oleh disiplin setiap pemanggil untuk selalu lewat `tambah()`.',
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
      p(
        'Class `Kalkulator` di atas tidak menyimpan keadaan apa pun, sebab tiap pemanggilan `jumlah()` atau `kali()` berdiri sendiri dan tidak bergantung pada apa pun yang terjadi sebelumnya. Membungkusnya sebagai class berarti setiap pemanggil harus membuat instance dulu (`new Kalkulator()`) sebelum bisa memakai satu method saja, dan bundler tidak bisa membuang `kali()` seandainya kode hanya pernah memanggil `jumlah()`, karena keduanya berada di objek yang sama sehingga ikut terbawa utuh. Fungsi lepas yang diekspor satu per satu tidak punya masalah itu, sebab masing-masing berdiri sendiri, langsung dipakai tanpa `new`, dan bisa di-tree-shake terpisah sesuai istilah yang sudah dijelaskan di kotak istilah di atas.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Toko yang kamu kerjakan mulanya hanya menerima transfer bank. Fungsi pembayarannya satu, isinya sepuluh baris, dan semuanya jelas. Enam bulan kemudian ada kartu kredit, lalu dompet digital, lalu bayar di tempat. Fungsi yang tadinya sepuluh baris kini dua ratus baris berisi rantai `if` yang memeriksa jenis pembayaran, dan tiap penambahan metode baru berarti menyunting fungsi yang sama sekaligus berdoa tidak merusak tiga metode lain.',
      ),
      p(
        'Bentuk seperti ini yang membuat orang mulai mencari cara lain, dan gejalanya selalu sama. Data pembayaran tersebar di satu tempat, aturan biayanya di tempat lain, dan cara memvalidasinya di tempat ketiga. Untuk menambah satu metode, kamu harus ingat menyentuh ketiganya.',
      ),
      code(
        'js',
        `
        // Semua aturan bercampur dalam satu fungsi, dan tiap metode baru
        // menambah satu cabang di SETIAP fungsi seperti ini.
        function hitungBiaya(jenis, jumlah) {
          if (jenis === 'transfer') return 0;
          if (jenis === 'kartu') return Math.round(jumlah * 0.029);
          if (jenis === 'dompet') return Math.round(jumlah * 0.015);
          if (jenis === 'cod') return 5000;
          throw new Error('Metode tidak dikenal');
        }

        function labelMetode(jenis) {
          if (jenis === 'transfer') return 'Transfer Bank';
          if (jenis === 'kartu') return 'Kartu Kredit';
          // ... dan seterusnya, rantai yang sama diulang
        }

        function butuhVerifikasi(jenis) {
          if (jenis === 'kartu') return true;
          // ... rantai yang sama lagi
        }
        `,
        { filename: 'Sebelum, tiga rantai if yang harus dijaga tetap sinkron' },
      ),
      p(
        'Masalahnya bukan panjangnya melainkan penyebarannya. Pengetahuan tentang satu metode pembayaran tersebar di tiga fungsi berbeda, sehingga menambah metode kelima berarti mengingat tiga tempat. Yang lebih berbahaya, kalau kamu lupa satu tempat, tidak ada yang memberi tahu. Program tetap berjalan, dan label pembayaran barunya muncul kosong.',
      ),
      code(
        'js',
        `
        // Satu metode pembayaran = satu object yang membawa datanya
        // SEKALIGUS aturannya. Menambah metode berarti menambah satu object.
        const metode = {
          transfer: {
            label: 'Transfer Bank',
            butuhVerifikasi: false,
            biaya: () => 0,
          },
          kartu: {
            label: 'Kartu Kredit',
            butuhVerifikasi: true,
            biaya: (jumlah) => Math.round(jumlah * 0.029),
          },
          cod: {
            label: 'Bayar di Tempat',
            butuhVerifikasi: false,
            biaya: () => 5000,
          },
        };

        const pilihan = metode[jenis];
        if (!pilihan) throw new Error(\`Metode \${jenis} tidak dikenal\`);

        pilihan.label;            // tidak perlu rantai if
        pilihan.biaya(507000);
        `,
        { filename: 'Sesudah, data dan perilaku berkumpul di satu tempat' },
      ),
      p(
        'Inilah gagasan inti pemrograman berorientasi object, dan ia sudah bekerja bahkan sebelum kata `class` muncul. Yang berubah bukan jumlah baris melainkan **letak pengetahuan**. Seluruh yang perlu diketahui tentang kartu kredit ada di satu blok, sehingga menambah metode kelima berarti menambah satu blok baru dan tidak menyentuh satu pun kode lama. Aturan praktisnya, kalau menambah satu hal baru memaksamu menyunting lima tempat, struktur datamu belum sesuai dengan bentuk masalahnya.',
      ),
      callout(
        'info',
        'Object literal sudah cukup untuk banyak kasus',
        'Contoh di atas belum memakai `class` sama sekali, dan untuk tabel pengaturan seperti ini object literal memang sudah cukup. `class` mulai berguna saat tiap object perlu menyimpan keadaannya sendiri yang berubah, misalnya saldo dompet atau isi keranjang. Jangan memakai `class` hanya karena materinya sedang membahas `class`.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Bagian ini agak berbeda dari sub-bab lain, sebab kesalahan struktur jarang melempar error. Yang muncul justru gejala, dan tiga di bawah ini adalah tanda paling jelas bahwa struktur datanya perlu diubah.',
      ),
      code(
        'text',
        `
        const pilihan = metode[jenisDariForm];
        pilihan.biaya(507000);
                ^

        TypeError: Cannot read properties of undefined (reading 'biaya')
        `,
        { caption: 'Kunci yang dicari tidak ada di tabel metode.' },
      ),
      p(
        'Error ini justru bagian yang baik dari pendekatan tabel, sebab ia muncul di satu tempat saja dan langsung menunjuk penyebabnya. Bandingkan dengan rantai `if` yang cabang terakhirnya lupa diberi `throw`, di mana fungsi diam-diam mengembalikan `undefined` dan bugnya baru terlihat jauh di hilir. Pemeriksaan `if (!pilihan) throw ...` pada contoh di atas mengubah kegagalan senyap menjadi kegagalan yang menyebut nama metodenya.',
      ),
      code(
        'text',
        `
        // Metode baru 'qris' ditambahkan ke hitungBiaya,
        // tapi lupa ditambahkan ke labelMetode.

        Label pembayaran tampil kosong di halaman faktur.
        Tidak ada error di console.
        `,
        { caption: 'Satu dari tiga rantai `if` lupa diperbarui.' },
      ),
      p(
        'Inilah kerugian sebenarnya dari pengetahuan yang tersebar, dan ia tidak pernah muncul sebagai error. Fungsi `labelMetode` jatuh sampai ke bawah tanpa menemukan cabang yang cocok, lalu mengembalikan `undefined`, dan `undefined` yang ditaruh ke halaman menghasilkan teks kosong. Dengan bentuk tabel, kelalaian yang sama tidak mungkin terjadi, sebab menambah metode berarti menambah satu object yang ketiga fieldnya harus diisi.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Menambah satu fitur memaksa menyunting lima berkas',
            'Pengetahuan tentang satu hal tersebar di banyak tempat',
            'Kumpulkan data dan perilakunya ke satu object atau satu kelas',
          ],
          [
            'Rantai `if` yang sama muncul di beberapa fungsi',
            'Percabangan dipakai untuk hal yang sebenarnya perbedaan jenis',
            'Ubah menjadi tabel object, atau kelas dengan method yang sama',
          ],
          [
            'Fungsi mengembalikan `undefined` tanpa peringatan',
            'Rantai `if` tanpa cabang terakhir',
            'Selalu tutup dengan `throw` atau nilai bawaan yang jelas',
          ],
          [
            'Dua bagian aplikasi menampilkan aturan yang berbeda untuk hal yang sama',
            'Aturannya disalin, bukan dipakai bersama',
            'Satu sumber kebenaran, lalu keduanya membaca dari sana',
          ],
          [
            'Sulit menulis test karena harus menyiapkan banyak hal',
            'Fungsinya bergantung pada banyak nilai luar',
            'Kirim yang dibutuhkan lewat parameter, atau bungkus dalam object yang bisa dibuat sendiri di test',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan terbesar seputar OOP bukan salah menulis `class` melainkan memakainya di tempat yang tidak membutuhkannya. Empat baris pertama di bawah semuanya bentuk dari itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat kelas untuk sesuatu yang tidak menyimpan keadaan',
            'Terlihat lebih terstruktur dan profesional',
            'Kelas berisi hanya method statis adalah fungsi yang dibungkus tanpa alasan. Ekspor fungsinya langsung',
          ],
          [
            'Membuat kelas `Manager`, `Helper`, atau `Utils`',
            'Namanya terdengar seperti tempat yang tepat untuk apa pun',
            'Nama itu tidak menyatakan tanggung jawab, sehingga ia menjadi tempat pembuangan. Isinya tumbuh sampai tidak ada yang berani menyentuhnya',
          ],
          [
            'Menyalin struktur kelas dari Java atau PHP apa adanya',
            'Konsepnya memang sama',
            'JavaScript punya object literal, closure, dan modul yang sering lebih cocok. Getter dan setter untuk setiap field adalah pola yang jarang berguna di sini',
          ],
          [
            'Membuat kelas dasar lebih dulu sebelum ada dua turunan nyata',
            'Supaya nanti tinggal diturunkan',
            'Kelas dasar yang dirancang tanpa dua contoh nyata hampir selalu salah bentuk. Tulis dua yang konkret dulu, baru cari kesamaannya',
          ],
          [
            'Menyimpan seluruh data aplikasi di satu object besar',
            'Semuanya jadi mudah dijangkau dari mana saja',
            'Siapa pun bisa mengubah apa pun, dan menelusuri siapa yang mengubah menjadi mustahil. Pecah sesuai batas tanggung jawabnya',
          ],
          [
            'Menganggap OOP dan fungsi adalah dua kubu yang harus dipilih salah satu',
            'Materinya memang diajarkan terpisah',
            'Kode nyata memakai keduanya. Fungsi murni untuk perhitungan, object untuk hal yang punya keadaan dan identitas',
          ],
        ],
      ),
      p(
        'Baris keempat layak dipegang sebagai aturan tetap, dan namanya aturan tiga. Jangan membuat abstraksi sampai kamu punya minimal dua contoh konkret, dan lebih baik tiga. Abstraksi yang dibuat dari satu contoh hanyalah contoh itu yang diberi nama lebih umum, dan begitu contoh kedua datang, bentuknya hampir selalu tidak cocok.',
      ),
      callout(
        'tip',
        'Pertanyaan yang memutuskan apakah sesuatu layak jadi object',
        'Tanyakan apakah hal ini punya keadaan yang berubah seiring waktu, dan apakah ada beberapa hal sejenis yang perlu diperlakukan sama. Kalau kedua jawabannya ya, object atau kelas biasanya tepat. Kalau ia hanya mengubah masukan menjadi keluaran, fungsi sudah cukup dan lebih mudah diuji.',
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
    23,
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
            'Terjemahan bebas dari *losing `this`*. Keadaan ketika sebuah method dipisahkan dari objeknya, misalnya `const s = a.sapa;` lalu `s()`, sehingga `this` di dalamnya tidak lagi menunjuk objek asal. Ini penyebab bug yang sangat sering muncul pada event handler, dan Sub-bab 2.4 membahas keempat aturannya secara lengkap.',
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
      p(
        'Bedanya dengan object literal cuma satu, yaitu bentuk objeknya ditulis **sekali** di dalam fungsi lalu dicetak sebanyak yang kamu butuhkan. `a` dan `b` adalah dua objek yang benar-benar terpisah dengan bentuk identik, dan kalau suatu hari kamu perlu menambahkan property baru, cukup mengubah satu tempat. Perhatikan komentar pada `sapa`, karena ia memakai `nama` yang merupakan parameter fungsinya, bukan `this.nama`. Itu bukan detail penulisan, melainkan pilihan yang menentukan. Karena `nama` diambil dari closure, ia terikat pada pemanggilan `buatPengguna(\'Zum\')` yang melahirkannya dan tidak bergantung sama sekali pada cara method itu nanti dipanggil. Konsekuensinya baru terasa di sub-bab tentang `this`, sebab method seperti ini tidak bisa "kehilangan konteks".',
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
      p(
        'Bandingkan strukturnya dengan factory di atas, karena `this.nama = nama` menempel properti `nama` ke objek yang sedang dibuat, dan `new`-lah yang menyediakan objek kosong itu alih-alih fungsi `Pengguna` yang membuatnya sendiri. Method `sapa` sengaja ditaruh di `Pengguna.prototype` dan **bukan** ditulis langsung di dalam `function Pengguna(...)` seperti gaya factory. Kalau ditulis di dalam, setiap pemanggilan `new Pengguna(...)` akan membuat fungsi `sapa` yang baru di memori, persis masalah yang diukur konkret di "Perbandingan memori" di bawah. Menaruhnya di `.prototype` membuat semua instance berbagi **satu** fungsi yang sama persis.',
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
      p(
        'Empat langkah di komentar itu menjelaskan kenapa `function Pengguna` bisa "membuat objek" padahal tidak ada satu pun `return` di dalamnya, yaitu karena objeknya disediakan `new` dan bukan oleh fungsinya. Langkah kedua yang paling mudah terlewat, sebab `new` juga menyambungkan objek baru itu ke `Pengguna.prototype`, dan sambungan itulah yang membuat `c.sapa()` bisa menemukan method yang tidak pernah ditulis di dalam objeknya sendiri. Bagian bawah menunjukkan apa yang terjadi bila `new` lupa ditulis. Fungsinya tetap berjalan, tapi tidak ada objek yang dibuat sehingga hasilnya `undefined`. Yang berbahaya adalah nasib `this`-nya, karena di mode non-strict ia menunjuk objek global, jadi `this.nama = nama` diam-diam membuat variabel global bernama `nama` tanpa satu pun peringatan. Di dalam modul ES yang otomatis strict, `this` bernilai `undefined` dan kamu langsung mendapat `TypeError`, yaitu kegagalan yang berisik, dan itu jauh lebih baik.',
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
      p(
        'Perbandingan `===` di sini memakai aturan yang sudah kamu kenal dari sub-bab tipe data, yaitu fungsi adalah nilai reference sehingga yang dibandingkan alamatnya dan bukan isinya. `x.sapa === y.sapa` bernilai `false` walaupun kedua fungsi itu ditulis dari baris kode yang sama persis, karena setiap pemanggilan `buatPengguna(...)` menjalankan ulang baris itu dan melahirkan fungsi baru di alamat baru. Sepuluh ribu objek berarti sepuluh ribu salinan `sapa` di memori. Pada versi constructor, `sapa` hanya ditulis sekali ke `Pengguna.prototype`, dan instance-nya tidak menyimpan fungsi apa pun melainkan hanya **menunjuk** ke sana, sehingga `p1.sapa === p2.sapa` bernilai `true`. Perlu ditegaskan bahwa untuk aplikasi biasa perbedaan ini jarang terasa. Pilihlah berdasarkan perilaku `this` yang kamu inginkan, dan anggap efisiensi memori sebagai bonus alih-alih alasan utama.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi yang kamu kerjakan memanggil dua API berbeda, yaitu API internal milik tim sendiri dan API pihak ketiga untuk ongkos kirim. Keduanya butuh alamat dasar yang berbeda, token yang berbeda, dan batas waktu yang berbeda. Menulis dua berkas terpisah yang isinya hampir sama jelas mubazir, dan menaruh keduanya di satu berkas dengan sekumpulan `if` justru mengulang masalah sub-bab sebelumnya.',
      ),
      p(
        'Yang dibutuhkan adalah satu cetakan yang bisa dipakai membuat dua klien dengan pengaturan berbeda. Ada dua cara membuat cetakan itu, dan keduanya sah. Perbandingan di bawah memperlihatkan kapan masing-masing lebih cocok.',
      ),
      compare(
        {
          title: 'Factory function',
          lang: 'js',
          code: `
          function buatKlien({ dasar, token, batasMs = 5000 }) {
            // Nilai ini benar-benar tersembunyi.
            const kepala = { Authorization: \`Bearer \${token}\` };

            async function minta(jalur, opsi = {}) {
              const kendali = AbortSignal.timeout(batasMs);
              const r = await fetch(dasar + jalur, {
                ...opsi,
                headers: { ...kepala, ...opsi.headers },
                signal: kendali,
              });
              if (!r.ok) throw new Error(\`\${r.status} pada \${jalur}\`);
              return r.json();
            }

            return {
              ambil: (jalur) => minta(jalur),
              kirim: (jalur, isi) =>
                minta(jalur, { method: 'POST', body: JSON.stringify(isi) }),
            };
          }

          const internal = buatKlien({ dasar: '/api', token: t1 });
          `,
          notes: [
            'Tidak butuh `new`, jadi tidak bisa lupa menulisnya',
            '`token` benar-benar tidak bisa dibaca dari luar',
          ],
        },
        {
          title: 'Constructor / class',
          lang: 'js',
          code: `
          class Klien {
            #kepala;

            constructor({ dasar, token, batasMs = 5000 }) {
              this.dasar = dasar;
              this.batasMs = batasMs;
              this.#kepala = { Authorization: \`Bearer \${token}\` };
            }

            async #minta(jalur, opsi = {}) {
              const r = await fetch(this.dasar + jalur, {
                ...opsi,
                headers: { ...this.#kepala, ...opsi.headers },
                signal: AbortSignal.timeout(this.batasMs),
              });
              if (!r.ok) throw new Error(\`\${r.status} pada \${jalur}\`);
              return r.json();
            }

            ambil(jalur) { return this.#minta(jalur); }
            kirim(jalur, isi) {
              return this.#minta(jalur, { method: 'POST', body: JSON.stringify(isi) });
            }
          }

          const internal = new Klien({ dasar: '/api', token: t1 });
          `,
          notes: [
            'Method dibagi lewat prototype, jadi lebih hemat untuk ribuan instance',
            '`instanceof Klien` bekerja, dan itu berguna saat memeriksa jenis',
          ],
        },
      ),
      p(
        "Keduanya menghasilkan objek yang dipakai dengan cara yang sama persis, yaitu `internal.ambil('/pesanan')`. Perbedaannya baru terasa pada tiga hal. Pertama, versi factory tidak butuh `new`, sehingga satu kelas kesalahan hilang sama sekali. Kedua, `token` di versi factory disimpan di closure dan benar-benar tidak bisa dijangkau dari luar dengan cara apa pun. Ketiga, versi kelas membagi method lewat prototype, sehingga seribu instance tetap memakai satu salinan tiap method.",
      ),
      p(
        'Untuk kasus ini, di mana klien yang dibuat hanya dua atau tiga sepanjang umur aplikasi, penghematan memori tidak berarti apa-apa dan factory lebih unggul karena tokennya benar-benar tertutup. Kalau yang dibuat adalah ribuan object kecil, misalnya satu object per baris tabel, kelas menang telak. Ukuran itulah yang memutuskan, bukan selera.',
      ),
      p(
        'Perhatikan `AbortSignal.timeout(batasMs)` di kedua sisi. Tanpa batas waktu, satu permintaan yang menggantung akan menahan indikator memuat selamanya, dan pengguna tidak punya cara tahu apakah ia harus menunggu atau mencoba lagi. Batas waktu bukan penyempurnaan melainkan bagian dari perilaku yang benar, dan pembahasan penuhnya ada di Bab 6.',
      ),
      callout(
        'tip',
        'Aturan memilih yang jarang meleset',
        'Pakai factory kalau jumlah object-nya sedikit dan ada nilai yang benar-benar harus tersembunyi. Pakai kelas kalau object-nya banyak, atau kalau kamu butuh `instanceof`, atau kalau nanti akan ada turunan. Di antara keduanya, pilih yang membuat kode pemakainya paling enak dibaca.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Tiga error di bawah semuanya berkaitan dengan `new`, dan itu memang perbedaan paling praktis antara dua pendekatan di atas.',
      ),
      code(
        'text',
        `
        const klien = Klien({ dasar: '/api' });
                      ^

        TypeError: Class constructor Klien cannot be invoked without 'new'
        `,
        { caption: '`new` lupa ditulis saat membuat instance kelas.' },
      ),
      p(
        'Kelas sengaja menolak dipanggil tanpa `new`, dan itu perbaikan besar dibandingkan `function` biasa yang dipakai sebagai constructor. Dengan `function`, lupa menulis `new` tidak melempar apa pun. Di dalam module yang otomatis mode strict, `this` menjadi `undefined` sehingga penugasan `this.dasar = ...` melempar error di baris yang membingungkan. Di luar mode strict, ia justru menulis ke object global dan bugnya jauh lebih sulit ditemukan.',
      ),
      code(
        'text',
        `
        const buat = (opsi) => ({ ...opsi });
        const k = new buat({ dasar: '/api' });
                  ^

        TypeError: buat is not a constructor
        `,
        { caption: '`new` dipakai pada fungsi panah.' },
      ),
      p(
        'Fungsi panah tidak bisa dipakai dengan `new`, dan itu keputusan desain bukan kelalaian. Fungsi panah dirancang sebagai fungsi ringkas tanpa `this` sendiri, sehingga ia juga tidak punya perilaku constructor. Kalau kamu menulis factory dengan fungsi panah, panggil tanpa `new`, sebab factory memang mengembalikan objectnya sendiri.',
      ),
      code(
        'text',
        `
        const k = new Klien({ dasar: '/api', token: t });
        console.log(k.token);        // undefined
        console.log(k['#kepala']);   // undefined

        // Bukan error, tapi juga bukan cara membaca field privat.
        `,
        {
          caption:
            'Field privat tidak bisa dijangkau, dan usaha membacanya menghasilkan `undefined`.',
        },
      ),
      p(
        'Ini justru perilaku yang benar, dan ditampilkan di sini karena sering disalahpahami sebagai bug. Field berawalan pagar hanya bisa dibaca dari dalam kelas yang mendeklarasikannya. Menuliskannya sebagai teks di dalam kurung siku tidak bekerja karena ia bukan properti biasa. Kalau kamu memang perlu membacanya dari luar, itu tanda bahwa nilainya seharusnya tidak privat, atau perlu ada method yang menyediakannya secara terkendali.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Class constructor X cannot be invoked without 'new'`",
            '`new` lupa ditulis',
            'Tambahkan `new`, atau ubah menjadi factory kalau lupa `new` sering terjadi',
          ],
          [
            '`X is not a constructor`',
            '`new` dipakai pada fungsi panah atau pada nilai yang bukan fungsi',
            'Panggil tanpa `new`, atau ubah ke `function` bila memang perlu jadi constructor',
          ],
          [
            'Field privat terbaca `undefined` dari luar',
            'Itu memang perilaku yang benar untuk field berawalan pagar',
            'Sediakan getter kalau nilainya memang perlu dibaca dari luar',
          ],
          [
            'Semua instance berbagi nilai yang sama',
            'Nilainya dideklarasikan di luar constructor sebagai object bersama',
            'Buat nilainya di dalam constructor supaya tiap instance punya sendiri',
          ],
          [
            'Aplikasi berat setelah membuat ribuan object dari factory',
            'Tiap object membawa salinan sendiri untuk tiap method',
            'Ubah ke kelas supaya method dibagi lewat prototype',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bawah muncul pada dua pendekatan sekaligus, dan yang paling merugikan justru yang tidak melempar error sama sekali.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh array atau object sebagai nilai bawaan di luar constructor',
            'Terlihat lebih rapi dan hemat',
            'Seluruh instance berbagi array yang sama, sehingga menambah ke satu object menambah ke semuanya. Buat isinya di dalam constructor',
          ],
          [
            'Memberi constructor lima parameter berurutan',
            'Semua nilai itu memang dibutuhkan',
            'Pemanggilnya harus mengingat urutannya, dan menukar dua argumen bertipe sama tidak melempar apa pun. Terima satu object berparameter bernama',
          ],
          [
            'Melakukan pekerjaan berat di dalam constructor',
            'Sekalian saja supaya objectnya langsung siap',
            'Constructor yang memanggil jaringan atau membaca berkas membuat object itu mustahil dibuat di test. Pisahkan pembuatan dari penyiapan',
          ],
          [
            'Menyimpan token atau kunci rahasia sebagai properti biasa',
            'Toh hanya dipakai di dalam',
            'Properti biasa terbaca siapa pun yang memegang objectnya, dan ikut tercetak saat object di-`console.log`. Pakai closure atau field berawalan pagar',
          ],
          [
            'Memakai `this` di dalam factory function',
            'Bentuknya mirip dengan kelas',
            'Factory mengembalikan object literal, jadi `this` di dalamnya tidak menunjuk object itu. Rujuk variabelnya langsung dari closure',
          ],
          [
            'Menambahkan method ke object satu per satu di dalam factory',
            'Terlihat jelas mana method milik siapa',
            'Tiap object membawa salinannya sendiri. Untuk object yang jumlahnya banyak, ini beban memori yang nyata',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahan yang paling sering luput karena ia tidak melempar apa pun. Kalau kamu menulis `const bawaan = []` di badan modul lalu memakainya sebagai nilai awal untuk setiap object yang dibuat, ketiga object itu menunjuk array yang sama. Menambah satu item ke keranjang pengguna pertama akan terlihat juga di keranjang pengguna kedua. Ini akibat langsung dari perbedaan primitif dan reference di Sub-bab 1.3, muncul kembali dalam bentuk yang lebih berbahaya.',
      ),
      callout(
        'warning',
        'Rahasia di sisi klien tetap bukan rahasia',
        'Field berawalan pagar dan closure mencegah kode lain di halaman yang sama membacanya, dan itu berguna untuk kerapian. Keduanya tidak melindungi apa pun dari pengguna, sebab siapa pun bisa membuka DevTools dan membaca seluruh berkas. Token yang benar-benar rahasia tidak pernah boleh sampai ke peramban, dan aturan itu dibahas di Kategori Keamanan Fullstack.',
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
    25,
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
            'Terjemahan bebasnya **menambal seenaknya**. Praktik menambah atau mengubah method pada prototype bawaan seperti `Array.prototype`. Terlihat praktis karena semua array langsung punya method barumu, tapi berbahaya: **seluruh** array di aplikasi ikut berubah, termasuk milik library pihak ketiga. Contoh nyatanya ada di bawah, dan akibatnya sampai mengubah nama sebuah method di standar ECMAScript.',
        },
        {
          term: 'MooTools',
          meaning:
            'Nama library JavaScript populer di sekitar tahun 2007–2012. Disebut di sini karena ia menambahkan `Array.prototype.flatten` dengan perilaku yang berbeda dari rencana standar. Karena masih ada situs lama yang memakainya, komite standar terpaksa menamai method resminya `flat` — bukti nyata bahwa monkey patching bisa berdampak sampai ke tingkat spesifikasi bahasa.',
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
      p(
        '`Object.create(hewan)` membuat objek `kucing` baru yang `[[Prototype]]`-nya langsung diarahkan ke `hewan`. Ia bukan menyalin isi `hewan` ke `kucing`, melainkan menyambungkan sebuah tautan ke sana. Saat `kucing.bernapas()` dipanggil, JavaScript mencari `bernapas` di `kucing` sendiri dulu (tidak ada), lalu naik ke `hewan` lewat tautan itu (ketemu). Itulah pencarian rantai prototype yang dijelaskan di kotak istilah, sehingga hanya method `mengeong` yang benar-benar "milik sendiri" `kucing`, sedangkan `bernapas` sepenuhnya dipinjam dari `hewan`.',
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
      p(
        '`Object.create(induk)` membuat objek kosong yang **prototype-nya** adalah `induk`, jadi `anak` sebenarnya tidak punya property `a` sama sekali dan hanya bisa menemukannya dengan naik satu tingkat. Empat pemeriksaan berikutnya menunjukkan bahwa alat-alat JavaScript terbelah dua dalam menyikapi hal itu. `in` dan `for...in` **ikut menelusuri rantai**, sehingga keduanya melaporkan `a` seolah-olah milik `anak`. `Object.hasOwn` dan `Object.keys` **berhenti di objeknya sendiri**, sehingga keduanya tidak menyebut `a` sama sekali. Tidak ada yang salah di antara keduanya, dan yang salah adalah memakai kelompok pertama saat maksudmu kelompok kedua. Aturan praktisnya, kalau kamu sedang menelusuri data kamu hampir selalu memaksudkan "milik sendiri", jadi pilih `Object.keys` atau `Object.entries`.',
      ),
      callout(
        'warning',
        'Inilah alasan `for...in` berbahaya pada objek',
        'Ia menelusuri seluruh rantai. Kalau ada library yang menambah sesuatu ke `Object.prototype`, ia akan muncul di setiap `for...in` di seluruh aplikasimu. Pakai `Object.entries()` atau `Object.keys()`.',
      ),

      h2('Jangan mengubah prototype bawaan'),
      code(
        'js',
        `
        // JANGAN PERNAH:
        Array.prototype.terakhir = function () { return this[this.length - 1]; };

        // Sekarang SETIAP array di seluruh aplikasi punya method ini —
        // termasuk array milik library pihak ketiga. Kalau standar ECMAScript
        // kelak menambahkan nama yang sama dengan perilaku berbeda, semuanya rusak.
        // Ini pernah benar-benar terjadi: Array.prototype.flatten milik MooTools
        // memaksa standar menamai methodnya 'flat'.
        `,
      ),
      p(
        'Bahayanya bukan cuma teori. Contoh nyatanya sudah disinggung di kotak istilah, yaitu library **MooTools** yang pernah menambahkan `Array.prototype.flatten` sekitar tahun 2007–2012. Situs yang memakainya jadi bergantung method itu ada di **setiap** array, termasuk array yang sama sekali tidak dibuat lewat MooTools. Bertahun-tahun kemudian, saat komite ECMAScript ingin menstandarkan method perata array, mereka **tidak bisa** memakai nama `flatten`, sebab situs lama yang masih memuat MooTools akan rusak seandainya perilaku standarnya berbeda sedikit saja. Solusinya, method resminya dinamai `flat`. Satu baris `Array.prototype.terakhir = ...` di atas berpotensi punya dampak yang sama luasnya, karena ia bukan cuma memengaruhi file tempat ia ditulis melainkan setiap array di seluruh aplikasi, bahkan yang dipakai library lain.',
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
      p(
        '"Gula sintaks" (*syntactic sugar*) artinya `class` tidak menambahkan mekanisme baru ke JavaScript, sebab ia hanya cara penulisan yang lebih rapi untuk sesuatu yang sebetulnya sudah bisa dilakukan sebelumnya lewat `Object.create` dan constructor function. Baris `typeof Hewan === \'function\'` di atas membuktikannya langsung, karena di balik kata kunci `class` `Hewan` tetap sebuah fungsi biasa, dan `bernapas` tetap ditaruh di `Hewan.prototype`. Polanya persis sama dengan constructor function di sub-bab sebelumnya, hanya dengan sintaks yang lebih enak dibaca dan pengaman tambahan seperti error otomatis kalau dipanggil tanpa `new`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman daftar transaksi menampilkan lima ribu baris, dan tiap baris dibungkus satu object supaya punya method seperti `format()` dan `bolehDibatalkan()`. Halaman terasa berat, dan panel Memory di DevTools menunjukkan pemakaian yang jauh lebih besar daripada ukuran datanya sendiri. Datanya hanya beberapa ratus kilobyte, tapi objectnya memakan belasan megabyte.',
      ),
      p(
        'Penyebabnya adalah tiap object membawa salinan sendiri untuk tiap method. Lima ribu object dikali tiga method berarti lima belas ribu fungsi di memori, padahal isinya identik. Inilah masalah yang prototype selesaikan, dan perbandingan di bawah menunjukkan selisihnya secara langsung.',
      ),
      compare(
        {
          title: 'Tiap object punya salinan method',
          lang: 'js',
          code: `
          function buatTransaksi(data) {
            return {
              ...data,
              format() { /* ... */ },
              bolehDibatalkan() { /* ... */ },
              ringkas() { /* ... */ },
            };
          }

          const daftar = baris.map(buatTransaksi);

          // 5.000 object x 3 fungsi = 15.000 fungsi di memori
          console.log(daftar[0].format === daftar[1].format);
          // false, keduanya fungsi yang berbeda
          `,
          notes: ['Boros untuk jumlah besar, dan tiap object bisa berbeda diam-diam'],
        },
        {
          title: 'Method dibagi lewat prototype',
          lang: 'js',
          code: `
          class Transaksi {
            constructor(data) { Object.assign(this, data); }
            format() { /* ... */ }
            bolehDibatalkan() { /* ... */ }
            ringkas() { /* ... */ }
          }

          const daftar = baris.map((b) => new Transaksi(b));

          // 5.000 object, tetap hanya 3 fungsi di memori
          console.log(daftar[0].format === daftar[1].format);
          // true, keduanya menunjuk fungsi yang sama
          `,
          notes: ['Method disimpan sekali di `Transaksi.prototype`, dipakai bersama'],
        },
      ),
      p(
        'Baris perbandingan di bagian bawah kedua kolom adalah bukti yang paling langsung. Di kiri, `daftar[0].format` dan `daftar[1].format` adalah dua fungsi berbeda yang isinya kebetulan sama. Di kanan, keduanya benar-benar fungsi yang sama, sebab keduanya tidak menyimpan `format` pada dirinya sendiri melainkan menemukannya lewat rantai prototype. Untuk lima objek, perbedaan ini tidak berarti apa-apa. Untuk lima ribu, ia berarti belasan megabyte.',
      ),
      p(
        'Yang perlu diingat, penghematan itu hanya berlaku untuk **method**, bukan untuk data. `Object.assign(this, data)` tetap menyalin seluruh field ke tiap object, dan memang harus begitu karena tiap transaksi punya nilai yang berbeda. Prototype menyelesaikan pengulangan perilaku, bukan pengulangan data.',
      ),
      code(
        'js',
        `
        const t = new Transaksi({ id: 9, jumlah: 50000 });

        // Bagaimana JavaScript mencari 'format':
        // 1. Apakah ada di object 't' sendiri?          -> tidak
        // 2. Apakah ada di Transaksi.prototype?          -> YA, dipakai
        //
        // Bagaimana ia mencari 'toString':
        // 1. Di 't' sendiri?                             -> tidak
        // 2. Di Transaksi.prototype?                     -> tidak
        // 3. Di Object.prototype?                        -> YA, dipakai
        //
        // Bagaimana ia mencari 'tidakAda':
        // 1, 2, 3 semuanya tidak -> hasilnya undefined, BUKAN error

        console.log(Object.hasOwn(t, 'jumlah'));   // true,  data milik object ini
        console.log(Object.hasOwn(t, 'format'));   // false, milik prototype
        `,
        { caption: 'Pencarian naik satu tingkat setiap kali tidak ditemukan.' },
      ),
      p(
        'Tiga penelusuran itu menjelaskan sekaligus kenapa membaca properti yang tidak ada menghasilkan `undefined` alih-alih error. JavaScript memang mencari sampai ujung rantai, dan ujung rantai adalah `null`. Setelah itu ia menyerah dan mengembalikan `undefined`. Perbedaan `Object.hasOwn` dan operator `in` yang dibahas di Bab 1 juga baru masuk akal sekarang, sebab `in` ikut menelusuri rantai sedangkan `Object.hasOwn` hanya memeriksa object itu sendiri.',
      ),
      callout(
        'danger',
        'Jangan pernah menambah properti ke prototype bawaan',
        'Menulis `Array.prototype.terakhir = function () { ... }` terasa menggoda karena semua array langsung mendapatnya. Akibatnya, seluruh `for...in` di aplikasi ikut menemukan `terakhir`, library yang memeriksa keberadaan properti bisa salah menyimpulkan, dan kalau nanti standar menambahkan nama yang sama dengan perilaku berbeda, aplikasimu rusak tanpa satu barisnya diubah. Buat fungsi biasa, atau kelas turunan bila memang perlu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Rantai prototype jarang melempar error secara langsung. Yang muncul biasanya berupa method yang tiba-tiba hilang, dan tiga bentuk di bawah adalah penyebab yang paling sering.',
      ),
      code(
        'text',
        `
        const salinan = { ...transaksi };
        salinan.format();
                ^

        TypeError: salinan.format is not a function
        `,
        { caption: 'Spread menyalin data, tapi tidak menyalin rantai prototype.' },
      ),
      p(
        'Ini konsekuensi langsung dari cara prototype bekerja, dan ia sangat sering mengejutkan. Tiga titik menyalin properti yang dimiliki object itu **sendiri**, sedangkan `format` bukan miliknya melainkan milik `Transaksi.prototype`. Hasilnya object biasa berisi data yang sama tanpa satu pun method. Hal yang sama terjadi pada `JSON.parse(JSON.stringify(t))` dan pada data yang datang kembali dari server. Kalau kamu butuh objectnya utuh, buat ulang dengan `new Transaksi(salinan)`.',
      ),
      code(
        'text',
        `
        new Transaksi({ id: 1 });
        ^

        ReferenceError: Cannot access 'Transaksi' before initialization
        `,
        { caption: 'Kelas dipakai sebelum baris deklarasinya dijalankan.' },
      ),
      p(
        'Berbeda dari `function` yang bisa dipanggil dari baris mana pun di berkas yang sama, deklarasi `class` punya Temporal Dead Zone persis seperti `let` dan `const`. Ini sengaja, sebab kelas bisa `extends` kelas lain dan urutan pembuatannya harus pasti. Perbaikannya menaruh deklarasi kelas di atas pemakaiannya, dan itu memang kebiasaan yang lebih baik untuk dibaca juga.',
      ),
      code(
        'text',
        `
        for (const kunci in transaksi) {
          console.log(kunci);
        }

        id
        jumlah
        format          <- ikut muncul karena ada di prototype
        `,
        { caption: '`for...in` menelusuri rantai prototype, bukan hanya object itu.' },
      ),
      p(
        'Contoh di atas memakai object yang prototypenya diisi manual, sebab method kelas sengaja ditandai tidak terhitung sehingga tidak muncul di `for...in`. Yang perlu dipegang, `for...in` memang menelusuri ke atas, jadi begitu ada library yang menempelkan sesuatu ke prototype bawaan, seluruh `for...in` di aplikasimu ikut terpengaruh. Untuk menelusuri milik object itu saja, pakai `Object.keys` atau `Object.entries`.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`x.method is not a function` setelah disalin',
            'Spread dan `JSON` hanya menyalin data, bukan prototype',
            'Buat ulang instance-nya, atau pindahkan logikanya ke fungsi biasa',
          ],
          [
            "`Cannot access 'X' before initialization`",
            'Kelas dipakai sebelum baris deklarasinya',
            'Pindahkan deklarasi kelas ke atas pemakaiannya',
          ],
          [
            '`for...in` memunculkan nama yang tidak kamu tulis',
            'Ia ikut menelusuri rantai prototype',
            'Pakai `Object.keys`, atau saring dengan `Object.hasOwn`',
          ],
          [
            'Method hilang setelah data melewati jaringan',
            'Yang dikirim hanya data, sedangkan prototype tidak ikut',
            'Bangun ulang objectnya di sisi penerima',
          ],
          [
            'Perilaku aneh di seluruh aplikasi setelah menambah library',
            'Ada yang menambah properti ke prototype bawaan',
            'Cari dengan `Object.getOwnPropertyNames(Array.prototype)`, lalu ganti library-nya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Prototype adalah bagian JavaScript yang paling sering dipelajari lalu langsung disalahgunakan. Tiga baris pertama di bawah adalah bentuk penyalahgunaan yang paling umum.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah method ke `Array.prototype` atau `String.prototype`',
            'Semua array langsung mendapatnya, terasa sangat praktis',
            'Mempengaruhi seluruh kode di halaman termasuk library, dan bisa bentrok dengan standar baru. Ini disebut monkey patching dan hampir selalu keputusan buruk',
          ],
          [
            'Mengubah `__proto__` sebuah object setelah dibuat',
            'Terlihat seperti cara langsung mengganti perilaku',
            'Mesin JavaScript mengoptimalkan berdasarkan bentuk object, dan mengubah prototype membatalkan optimasi itu untuk seluruh object sejenis',
          ],
          [
            'Menyimpan data yang bisa berubah di prototype',
            'Hemat karena hanya satu salinan',
            'Satu salinan itu dibagi seluruh instance, jadi mengubahnya lewat satu object mengubahnya untuk semua. Prototype untuk perilaku, constructor untuk data',
          ],
          [
            'Mengira `class` adalah hal yang berbeda dari prototype',
            'Sintaksnya memang terlihat seperti bahasa lain',
            '`class` adalah cara penulisan yang lebih rapi untuk mekanisme prototype yang sama. Memahami ini membuat error prototype menjadi masuk akal',
          ],
          [
            'Memakai `for...in` untuk menelusuri object hasil kelas',
            'Ia memang menelusuri properti',
            'Ia ikut naik ke prototype. Pakai `Object.keys` atau `Object.entries`',
          ],
          [
            'Memakai object biasa sebagai penampung dengan kunci dari pengguna',
            'Object memang penampung pasangan kunci dan nilai',
            'Kunci `__proto__` bisa mengubah rantai prototype object itu. Pakai `Map`, atau `Object.create(null)` yang tidak punya prototype sama sekali',
          ],
        ],
      ),
      p(
        'Baris keempat adalah yang paling menentukan untuk pemahaman jangka panjang. Kata `class` di JavaScript tidak memperkenalkan mekanisme baru, ia hanya menyediakan cara menulis yang lebih rapi untuk hal yang sudah ada sejak awal. Begitu itu dipegang, error seperti method yang hilang setelah spread berhenti terasa aneh, sebab kamu tahu method itu memang tidak pernah ada di object-nya.',
      ),
      callout(
        'tip',
        'Cara cepat melihat rantai prototype sebuah object',
        'Ketik `Object.getPrototypeOf(obj)` di console, lalu ulangi pada hasilnya sampai mendapat `null`. Itulah seluruh rantai yang ditelusuri JavaScript setiap kali kamu membaca sebuah properti. Di DevTools, rantai yang sama muncul sebagai baris `[[Prototype]]` saat kamu membuka sebuah object.',
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
    25,
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
            'Terjemahannya **pengikatan tersirat**. Aturan ini berlaku saat fungsi dipanggil sebagai method, misalnya `o.sapa()`. Nilai `this` menjadi apa pun yang berada **sebelum titik**, yang dalam hal ini adalah `o`. Disebut tersirat karena kamu tidak menyebutkannya secara khusus, melainkan ia tersimpul dari cara penulisannya.',
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
            'Terjemahan dari *losing `this`*. Terjadi ketika sebuah method dipisahkan dari objeknya, misalnya `const lepas = pengguna.sapa;`, sehingga saat dipanggil ia tidak lagi punya apa pun sebelum titik. Ini penyebab bug paling sering pada `setTimeout` dan event handler, dan `bind` atau arrow function adalah dua obatnya.',
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
      p(
        'Perhatikan fungsi `sapa` yang **sama persis** dipakai di tiga aturan berbeda dan menghasilkan `this` yang berlainan setiap kali. Itulah pesan utama blok ini, bahwa `this` tidak ditentukan oleh tempat fungsi ditulis melainkan oleh **cara ia dipanggil**. Keempat aturannya berlaku menurut prioritas, dari atas ke bawah. `new` menang paling kuat karena ia menciptakan objek barunya sendiri. Berikutnya penetapan eksplisit lewat `call`, `apply`, atau `bind`, dan ketiganya menyerahkan konteks secara langsung. Bedanya hanya pada cara argumen dikirim, serta pada `bind` yang mengembalikan fungsi baru yang **terikat permanen** alih-alih langsung menjalankannya. Lalu ada penetapan implisit, yaitu objek yang berada tepat sebelum tanda titik. Terakhir, bila tidak ada satu pun yang berlaku, `this` bernilai `undefined` di dalam modul ES, dan `this.nama` pada `undefined` melempar `TypeError`.',
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
      p(
        '`lepas()` gagal karena begitu `pengguna.sapa` dipisahkan dari `pengguna` dan disimpan ke variabel `lepas`, yang tersisa hanyalah fungsinya saja tanpa objek yang tadinya berada di depan titik. Saat `lepas()` dipanggil, tidak ada apa pun sebelum tanda kurung, sehingga aturan **default binding** yang berlaku. `this` menjadi `undefined`, dan `this.nama` di dalamnya meledak dengan `TypeError`. `setTimeout(pengguna.sapa, 100)` melakukan persis hal yang sama secara diam-diam, karena ia hanya menerima **referensi fungsinya** dan bukan `pengguna` beserta fungsinya, sehingga saat browser akhirnya memanggil fungsi itu nanti `this` sudah terlepas dari `pengguna`.',
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
      p(
        'Kuncinya ada di kata **scope tempat ia ditulis**, bukan tempat ia dipanggil. Pada `mulaiSalah`, `function () { this.detik++ }` adalah fungsi biasa yang dipanggil `setInterval` sebagai pemanggilan telanjang, persis pola `sapa()` yang gagal di atas, sehingga default binding berlaku dan `this` bukan `timer`. Pada `mulaiBenar`, arrow function `() => { this.detik++ }` sama sekali tidak punya `this` miliknya sendiri, melainkan meminjam `this` dari method `mulaiBenar` yang membungkusnya. Di situ `this` memang `timer`, karena `mulaiBenar` sendiri dipanggil sebagai `timer.mulaiBenar()`.',
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
      p(
        'Ambil satu contoh. `const { push } = router;` mengeluarkan fungsi `push` dari objek `router`, persis seperti `const lepas = pengguna.sapa` di atas. Kalau `push` di dalamnya memakai `this` untuk membaca state internal `router`, memanggilnya sebagai `push(...)` yang sudah lepas akan gagal dengan cara yang sama seperti `lepas()` gagal. Itulah sebabnya destructuring method dari sebuah objek, pola yang sangat umum dipakai bersama React Router atau `ref`, tetap butuh kewaspadaan yang sama meski kamu sendiri tidak pernah menulis kata kunci `this`.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kamu membuat komponen penghitung keranjang yang tombol tambahnya dipasang lewat `addEventListener`. Kodenya terlihat benar, kelasnya rapi, method-nya jelas. Begitu tombolnya diklik, muncul error yang menyebut `Cannot read properties of undefined`, padahal object-nya jelas ada dan barusan dipakai di baris sebelumnya. Inilah `this` yang lepas dari objectnya, dan ia salah satu kebingungan terbesar saat pertama kali memakai kelas di peramban.',
      ),
      code(
        'js',
        `
        class Keranjang {
          jumlah = 0;

          tambahRusak() {
            this.jumlah += 1;              // 'this' di sini bergantung pada CARA memanggil
            this.render();
          }

          tambahAman = () => {             // field kelas berupa fungsi panah
            this.jumlah += 1;
            this.render();
          };

          render() { /* ... */ }
        }

        const k = new Keranjang();

        tombol.addEventListener('click', k.tambahRusak);   // 'this' hilang
        tombol.addEventListener('click', k.tambahAman);    // aman
        tombol.addEventListener('click', () => k.tambahRusak());  // juga aman
        tombol.addEventListener('click', k.tambahRusak.bind(k));  // juga aman
        `,
        { filename: 'src/keranjang.js' },
      ),
      p(
        'Empat baris `addEventListener` di bawah adalah inti seluruh sub-bab ini. Baris pertama gagal karena `k.tambahRusak` hanya mengambil **fungsinya**, bukan hubungannya dengan `k`. Fungsi itu lalu dipanggil peramban tanpa object pemilik, sehingga `this` menjadi `undefined` di dalam module yang berjalan mode strict. Tiga baris sesudahnya sama-sama berhasil, dan ketiganya menyelesaikan masalah yang sama dengan cara berbeda.',
      ),
      p(
        'Bentuk `tambahAman = () => { ... }` adalah field kelas berisi fungsi panah, dan ia bekerja karena fungsi panah tidak punya `this` sendiri melainkan memakai `this` dari tempat ia ditulis, yaitu dari dalam constructor tiap instance. Bentuk pembungkus `() => k.tambahRusak()` bekerja karena yang diberikan ke peramban adalah fungsi baru yang di dalamnya pemanggilan tetap memakai titik. Bentuk `.bind(k)` menghasilkan fungsi baru yang `this`-nya dikunci selamanya ke `k`.',
      ),
      p(
        'Ketiganya benar, dan pilihannya punya konsekuensi. Field panah dibuat ulang untuk tiap instance sehingga ia tidak dibagi lewat prototype, dan untuk ribuan object itu berarti ribuan fungsi. Bentuk pembungkus paling fleksibel tapi menciptakan fungsi baru tiap kali dipasang, sehingga melepasnya dengan `removeEventListener` butuh menyimpan rujukannya. Bentuk `bind` juga menghasilkan fungsi baru, jadi berlaku catatan yang sama.',
      ),
      code(
        'js',
        `
        // Kalau listener perlu dilepas nanti, simpan rujukan fungsinya.
        class Keranjang {
          #terpasang = null;

          pasang(tombol) {
            this.#terpasang = () => this.tambah();     // simpan yang PERSIS ini
            tombol.addEventListener('click', this.#terpasang);
          }

          lepas(tombol) {
            tombol.removeEventListener('click', this.#terpasang);
          }
        }
        `,
        { caption: '`removeEventListener` hanya bekerja pada fungsi yang sama persis.' },
      ),
      p(
        "Kalau kamu menulis `tombol.removeEventListener('click', () => this.tambah())`, tidak ada yang terlepas dan juga tidak ada error. Fungsi panah yang baru saja kamu tulis adalah fungsi yang berbeda dari yang dipasang, dan peramban membandingkan rujukan bukan isi. Ini penyebab kebocoran listener yang sangat sering di aplikasi satu halaman, dan gejalanya berupa handler yang berjalan dua atau tiga kali setelah pengguna bolak-balik antar-halaman.",
      ),
      callout(
        'tip',
        'Aturan satu kalimat untuk `this`',
        'Untuk `function` dan method biasa, `this` ditentukan oleh **apa yang ada di kiri titik saat dipanggil**. Untuk fungsi panah, `this` ditentukan oleh **tempat ia ditulis** dan tidak pernah berubah. Hampir seluruh kebingungan soal `this` selesai begitu dua kalimat itu bisa dipakai untuk membaca kode.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Tiga bentuk di bawah semuanya berasal dari satu sebab, yaitu fungsi dilepas dari object pemiliknya. Yang berbeda hanya cara ia terlepas.',
      ),
      code(
        'text',
        `
        const f = k.tambah;
        f();
               ^

        TypeError: Cannot read properties of undefined (reading 'jumlah')
        `,
        { caption: 'Method disimpan ke variabel lalu dipanggil sendiri.' },
      ),
      p(
        'Pesannya menyebut `jumlah` padahal yang bermasalah `this`, dan itu yang menyesatkan. Bacalah sebagai berikut, yaitu ada sesuatu yang `undefined` dan kode mencoba membaca `jumlah` darinya. Sesuatu itu adalah `this`. Di dalam module, `this` pada fungsi yang dipanggil tanpa pemilik bernilai `undefined`, dan itu justru bagus karena errornya jelas. Di luar mode strict, `this` menjadi object global dan `this.jumlah += 1` diam-diam membuat variabel global.',
      ),
      code(
        'text',
        `
        setTimeout(k.render, 100);

        TypeError: Cannot read properties of undefined (reading 'elemen')
        `,
        { caption: 'Method diberikan sebagai callback ke fungsi lain.' },
      ),
      p(
        'Bentuk ini identik dengan yang di atas, hanya saja yang melepaskannya adalah `setTimeout` bukan penugasan ke variabel. Semua fungsi yang menerima callback punya masalah yang sama, termasuk `map`, `forEach`, `addEventListener`, dan `then`. Kalau kamu memberikan `objek.method` sebagai callback, hampir selalu kamu perlu membungkusnya menjadi `() => objek.method()`.',
      ),
      code(
        'text',
        `
        class A {
          nama = 'A';
          jalan() {
            [1, 2].forEach(function (n) {
              console.log(this.nama);
            });
          }
        }
        new A().jalan();

        TypeError: Cannot read properties of undefined (reading 'nama')
        `,
        { caption: '`function` biasa di dalam method punya `this` sendiri.' },
      ),
      p(
        'Ini bentuk yang paling membingungkan karena fungsinya jelas ditulis di dalam method. Yang menentukan tetap cara memanggilnya, dan `forEach` memanggil fungsi itu tanpa pemilik. Perbaikannya mengganti `function (n)` menjadi `(n) =>`, sebab fungsi panah memakai `this` dari tempat ia ditulis, yaitu dari method `jalan`. Inilah alasan paling praktis kenapa fungsi panah begitu banyak dipakai di dalam kelas.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of undefined` di dalam method',
            '`this` lepas karena fungsinya dipanggil tanpa pemilik',
            'Bungkus menjadi `() => obj.method()`, atau pakai field panah',
          ],
          [
            'Handler bekerja saat diklik tapi gagal saat dijadwalkan',
            '`setTimeout` memanggil fungsinya tanpa pemilik',
            'Berikan pembungkus, bukan rujukan methodnya',
          ],
          [
            '`this` bernilai `undefined` di dalam `forEach`',
            '`function` biasa punya `this` sendiri yang ditentukan pemanggilnya',
            'Ganti menjadi fungsi panah',
          ],
          [
            '`removeEventListener` tidak melepas apa pun',
            'Fungsi yang diberikan bukan rujukan yang sama dengan yang dipasang',
            'Simpan rujukannya saat memasang, lalu pakai rujukan itu saat melepas',
          ],
          [
            'Handler berjalan dua kali setelah bolak-balik halaman',
            'Listener lama tidak pernah dilepas',
            'Lepas listener saat komponennya ditutup',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan seputar `this` hampir semuanya berasal dari satu asumsi yang salah, yaitu mengira `this` ditentukan oleh tempat fungsi ditulis. Untuk `function`, ia ditentukan oleh cara pemanggilan, dan itu berbeda setiap kali.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memberikan `obj.method` langsung sebagai callback',
            'Method itu jelas milik `obj`, jadi seharusnya ingat pemiliknya',
            'Yang diambil hanya fungsinya, tanpa hubungan ke `obj`. Bungkus menjadi fungsi panah',
          ],
          [
            'Memakai fungsi panah sebagai method di object literal',
            'Bentuknya lebih pendek dan konsisten',
            'Fungsi panah memakai `this` dari luar object itu, jadi `this` tidak menunjuk object-nya. Untuk method object literal, pakai bentuk singkat `method() {}`',
          ],
          [
            'Menulis `const self = this` lalu memakai `self` di mana-mana',
            'Cara ini beredar luas dan memang bekerja',
            'Itu solusi era sebelum fungsi panah ada. Sekarang fungsi panah menyelesaikan hal yang sama tanpa variabel tambahan',
          ],
          [
            'Memakai field panah untuk semua method di kelas',
            'Aman dari masalah `this` untuk semuanya',
            'Field panah dibuat ulang tiap instance dan tidak dibagi lewat prototype. Pakai hanya untuk method yang memang akan dilepas dari objectnya',
          ],
          [
            'Memakai `bind` berulang kali di tempat pemasangan',
            'Satu panggilan `bind` sudah menyelesaikannya',
            'Tiap `bind` menghasilkan fungsi baru, jadi memasang dan melepas tidak akan cocok. Bind sekali di constructor lalu simpan hasilnya',
          ],
          [
            'Mengira `this` di dalam fungsi panah bisa diubah dengan `call` atau `apply`',
            'Keduanya memang mengubah `this`',
            'Fungsi panah tidak punya `this` sendiri, jadi `call` dan `apply` tidak berpengaruh padanya',
          ],
        ],
      ),
      p(
        'Baris kedua sering luput karena bentuknya terlihat rapi. Kalau kamu menulis object literal berisi `sapa: () => this.nama`, `this` di situ adalah `this` dari berkas modulnya, yaitu `undefined`. Bentuk yang benar untuk method di object literal adalah `sapa() { return this.nama; }`, dan bentuk singkat itu memang tersedia justru untuk keperluan ini.',
      ),
      callout(
        'info',
        'Di React kamu jarang bertemu masalah ini',
        'Komponen React modern ditulis sebagai fungsi, bukan kelas, sehingga `this` tidak dipakai sama sekali. Materi ini tetap penting karena kamu akan menemuinya di kode lama, di library, dan di kode peramban seperti `addEventListener`. Memahami `this` juga membuat kamu paham kenapa React memilih meninggalkannya.',
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
    20,
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
      p(
        'Perhatikan urutannya: `peran = \'anggota\'` (instance field) dan `static jumlahDibuat = 0` (static field) dijalankan **sebelum** badan `constructor`, sehingga saat baris `Pengguna.jumlahDibuat++` di dalamnya berjalan, `jumlahDibuat` sudah pasti bernilai `0`, bukan `undefined`. `u.peran` bekerja karena instance field disalin ke tiap objek baru, sementara `u.sapa()` bekerja lewat pencarian rantai prototype dari sub-bab sebelumnya — method tidak pernah disalin ke `u`, hanya "dipinjam" dari `Pengguna.prototype`.',
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
      p(
        "Lima pemeriksaan ini membuktikan bahwa `class` **tidak memperkenalkan mekanisme baru**, karena ia hanya cara penulisan yang lebih rapi untuk constructor function dan prototype yang sudah kamu pelajari. Baris pertama sudah cukup mengejutkan, sebab `typeof Pengguna` menjawab `'function'` dan bukan `'class'`, karena di balik layar sebuah class memang sebuah fungsi. Dua baris berikutnya menunjukkan letak `sapa` yang sebenarnya, yaitu bukan di objek `u` melainkan di `Pengguna.prototype`, persis seperti saat kamu menulis `Pengguna.prototype.sapa = ...` dengan tangan di sub-bab sebelumnya. Baris `getPrototypeOf` menegaskan sambungannya. Baris terakhir memperlihatkan satu-satunya hal yang diperlakukan berbeda, yaitu **instance field** seperti `peran` yang benar-benar milik tiap objek, sehingga `Object.hasOwn(u, 'peran')` bernilai `true`.",
      ),
      callout(
        'info',
        'Kenapa field milik instance, tapi method milik prototype',
        'Field adalah **data**, sehingga tiap objek butuh salinannya sendiri. Method adalah **perilaku**, sehingga satu salinan cukup untuk semua. Kalau kamu menulis `sapa = () => ...` sebagai field arrow, ia jadi milik instance, sehingga `this` terikat aman tapi ada satu fungsi per objek.',
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
      p(
        'Keempat perbedaan ini bukan sekadar aturan sintaks yang harus dihafal, sebab masing-masing adalah pengaman yang sengaja ditambahkan supaya class lebih sulit dipakai keliru. Poin 1 mencegah bug lama constructor function yang lupa `new` dan gagal diam-diam (dibahas di Sub-bab 2.2), karena sekarang error-nya selalu meledak jelas dengan pesan yang menyebut sebabnya. Poin 2 berarti kamu tidak bisa memanggil sebuah class sebelum baris deklarasinya tercapai, berbeda dari `function` biasa yang tetap bisa dipanggil sebelum deklarasinya karena di-*hoist* penuh. Poin 3 menutup celah bug mode longgar, seperti `this` yang diam-diam menjadi `window` sebagaimana dibahas di sub-bab sebelumnya, sehingga badan class selalu berperilaku ketat apa pun mode berkas tempat ia ditulis.',
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
      p(
        "`buatTipe('Buku')` di atas mengembalikan sebuah **class baru** dan bukan instance, sebab perhatikan tidak ada `new` di dalamnya, hanya kata kunci `class` tanpa nama diikuti `return`. Getter `label` di dalam class hasil itu memakai closure untuk mengingat parameter `label` yang dioper ke `buatTipe`, mekanisme closure yang sama seperti pada factory function di Sub-bab 2.2. Bedanya, di sini closure-nya membungkus **cetakan class** alih-alih objek langsung, dan itu berguna kalau kamu perlu membuat beberapa class yang mirip tapi masing-masing punya satu detail berbeda, tanpa menulis ulang seluruh class-nya.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Sepanjang Bab 1 kamu sudah bertemu dua kali dengan masalah uang, yaitu pecahan yang menyimpan selisih dan format rupiah yang harus sama di seluruh aplikasi. Selama uang disimpan sebagai angka biasa, kedua masalah itu akan terus muncul, sebab tidak ada yang mencegah siapa pun menulis `total = harga * 0.11` di berkas mana pun. Kelas menyelesaikannya dengan cara yang berbeda, yaitu membuat uang menjadi jenis nilai tersendiri yang punya aturannya sendiri.',
      ),
      code(
        'js',
        `
        export class Uang {
          #sen;   // selalu bilangan bulat, tidak pernah pecahan

          constructor(sen) {
            if (!Number.isInteger(sen)) {
              throw new TypeError(\`Uang butuh bilangan bulat sen, dapat \${sen}\`);
            }
            this.#sen = sen;
          }

          static dariRupiah(rp) { return new Uang(Math.round(rp * 100)); }
          static nol() { return new Uang(0); }

          get sen() { return this.#sen; }

          // Setiap operasi menghasilkan Uang BARU, tidak pernah mengubah yang lama.
          tambah(lain) { return new Uang(this.#sen + lain.sen); }
          kali(n) { return new Uang(Math.round(this.#sen * n)); }

          toString() {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
            }).format(this.#sen / 100);
          }

          toJSON() { return { sen: this.#sen, tampil: this.toString() }; }
        }
        `,
        { filename: 'src/uang.js' },
      ),
      code(
        'js',
        `
        const kaos = Uang.dariRupiah(89000);
        const total = kaos.kali(3).tambah(Uang.dariRupiah(240000));

        String(total);                       // 'Rp 507.000'
        JSON.stringify({ total });           // {"total":{"sen":50700000,"tampil":"Rp 507.000"}}

        new Uang(1.5);
        // TypeError: Uang butuh bilangan bulat sen, dapat 1.5
        `,
        { caption: 'Aturan uang berlaku otomatis di mana pun nilainya dipakai.' },
      ),
      p(
        'Lima bagian kelas ini masing-masing menutup satu masalah nyata. Field `#sen` menyimpan satuan terkecil sebagai bilangan bulat, sehingga pecahan tidak pernah masuk. Pemeriksaan di constructor menolak nilai yang salah **di tempat nilainya dibuat**, bukan nanti di tempat hasilnya terlihat aneh. `tambah` dan `kali` mengembalikan `Uang` baru, sehingga tidak ada bagian aplikasi yang bisa mengubah nilai yang sudah dibuat. `toString` membuat seluruh aplikasi memformat dengan cara yang sama. `toJSON` mengatur bentuknya saat dikirim ke server.',
      ),
      p(
        'Method `toString` bekerja otomatis di banyak tempat tanpa kamu memanggilnya. Ia dipakai saat object masuk ke template literal, saat digabung dengan teks, dan saat diberikan ke `textContent`. Ini contoh method dengan nama khusus yang sudah dikenali JavaScript, dan memanfaatkannya membuat pemakai kelasmu tidak perlu mengingat nama method pemformat.',
      ),
      p(
        'Method `toJSON` sama pentingnya dan jauh lebih sering dilupakan. `JSON.stringify` memanggilnya kalau ada, dan hasilnyalah yang dikirim. Tanpa `toJSON`, kelas yang seluruh datanya berupa field privat akan menghasilkan `{}` kosong, sebab field privat memang bukan properti biasa. Bagian error di bawah menunjukkan bentuk kegagalannya.',
      ),
      callout(
        'tip',
        'Pola ini bernama value object, dan ia bukan hanya untuk uang',
        'Bentuk yang sama cocok untuk apa pun yang punya aturan sendiri dan tidak berubah setelah dibuat, misalnya alamat email yang harus valid, rentang tanggal yang awalnya tidak boleh melewati akhir, atau berat kiriman yang harus positif. Cirinya, ia dibandingkan berdasarkan nilai bukan identitas, dan setiap operasi menghasilkan nilai baru.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering ditemui saat kelas mulai dipakai lintas berkas dan lintas jaringan.',
      ),
      code(
        'text',
        `
        class Polos { #x = 1; get x() { return this.#x; } }

        console.log(JSON.stringify(new Polos()));

        {}
        `,
        { caption: 'Tidak ada error, tapi seluruh datanya hilang saat dikirim.' },
      ),
      p(
        'Ini penyebab bug yang sangat mahal, sebab kegagalannya baru terlihat di sisi server. `JSON.stringify` hanya menyertakan properti biasa yang terhitung, sedangkan field privat dan getter tidak termasuk. Aplikasi mengirim `{}` ke server, server menyimpan baris kosong, dan tidak ada satu pun error di jalan. Perbaikannya menulis `toJSON` yang menyebut sendiri bentuk yang ingin dikirim.',
      ),
      code(
        'text',
        `
        const u = Uang.dariRupiah(89000);
        const total = u + 1000;
        console.log(total);

        Rp 89.0001000
        `,
        { caption: 'Object digabung dengan angka lewat operator tambah.' },
      ),
      p(
        'Operator tambah mengubah object menjadi teks lebih dulu lewat `toString`, lalu menggabungkannya dengan angka sebagai teks. Hasilnya teks yang terlihat seperti angka tapi bukan angka, dan ia akan merambat ke seluruh perhitungan berikutnya. Inilah alasan kelas seperti ini menyediakan method `tambah` sendiri, dan alasan seluruh aplikasi harus memakai method itu bukan operator.',
      ),
      code(
        'text',
        `
        const a = Uang.dariRupiah(1000);
        const b = Uang.dariRupiah(1000);

        console.log(a === b);         // false
        console.log(a.sen === b.sen); // true
        `,
        { caption: 'Dua object dengan nilai sama tetap dianggap berbeda.' },
      ),
      p(
        'Operator perbandingan pada object membandingkan **identitas**, yaitu apakah keduanya benar-benar object yang sama di memori, bukan apakah isinya sama. Untuk value object, ini hampir selalu bukan yang kamu inginkan. Sediakan method pembanding sendiri, misalnya `samaDengan(lain) { return this.#sen === lain.sen; }`, dan biasakan memakainya. Hal yang sama berlaku untuk `includes` pada array berisi object, seperti yang sudah dibahas di Bab 1.',
      ),
      code(
        'text',
        `
        class A { set nilai(v) { this.nilai = v; } }
        new A().nilai = 1;
              ^

        RangeError: Maximum call stack size exceeded
        `,
        { caption: 'Setter menulis ke nama yang memicu setter itu sendiri.' },
      ),
      p(
        'Penugasan `this.nilai = v` di dalam setter bernama `nilai` memanggil setter yang sama lagi, dan seterusnya sampai tumpukan pemanggilan habis. Ini kesalahan klasik yang selalu muncul saat orang pertama kali menulis getter dan setter. Perbaikannya menyimpan nilainya di field yang **berbeda nama**, biasanya field privat seperti `#nilai`, dan itulah kenapa hampir semua contoh setter memakai nama berbeda antara field dan aksesornya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`JSON.stringify` menghasilkan `{}`',
            'Field privat dan getter tidak ikut disertakan',
            'Tulis method `toJSON` yang menyebut bentuk yang ingin dikirim',
          ],
          [
            'Hasil perhitungan berubah menjadi teks aneh',
            'Object dipakai dengan operator tambah',
            'Sediakan dan pakai method operasi sendiri, jangan operator',
          ],
          [
            'Dua nilai yang sama dianggap berbeda',
            'Perbandingan object memakai identitas bukan isi',
            'Sediakan method pembanding, lalu pakai itu',
          ],
          [
            '`Maximum call stack size exceeded` pada setter',
            'Setter menulis ke nama yang memicu dirinya sendiri',
            'Simpan di field privat dengan nama berbeda',
          ],
          [
            'Method hilang setelah data diambil dari server',
            'Yang dikirim hanya data, prototype tidak ikut',
            'Bangun ulang dengan constructor atau method statis pembuat',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di bawah muncul justru setelah kelasnya bekerja, yaitu saat ia mulai dipakai berbagai bagian aplikasi dengan cara yang tidak kamu duga.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat getter dan setter untuk setiap field',
            'Itu yang diajarkan di bahasa lain',
            'Getter yang hanya mengembalikan field dan setter yang hanya menugaskan tidak menambah apa pun. Buat aksesor hanya kalau ia benar-benar menghitung atau menjaga aturan',
          ],
          [
            'Membuat method yang mengubah objectnya sendiri',
            'Terasa lebih hemat daripada membuat object baru',
            'Nilai yang bisa berubah membuat penelusuran bug jauh lebih sulit, dan merusak pola seperti riwayat urungkan. Untuk value object, kembalikan yang baru',
          ],
          [
            'Menaruh pemanggilan jaringan di dalam constructor',
            'Supaya object langsung berisi data lengkap',
            'Object jadi mustahil dibuat di test tanpa jaringan. Pisahkan pembuatan dari pengambilan data',
          ],
          [
            'Memakai kelas hanya sebagai wadah data tanpa method',
            'Lebih terstruktur daripada object biasa',
            'Kalau tidak ada aturan yang dijaga, object literal lebih ringan dan langsung bisa di-`JSON.stringify`',
          ],
          [
            'Membiarkan constructor menerima nilai apa pun',
            'Pemanggilnya toh sudah tahu bentuk yang benar',
            'Constructor adalah satu-satunya pintu masuk, jadi pemeriksaan di sana melindungi seluruh pemakaian. Melewatkannya membuang keuntungan terbesar kelas',
          ],
          [
            'Menyimpan nilai yang sudah diformat sebagai teks di dalam object',
            'Supaya tidak perlu memformat berulang',
            'Teks tidak bisa dihitung, dan formatnya jadi terkunci pada satu bahasa. Simpan nilai mentah, format saat menampilkan',
          ],
        ],
      ),
      p(
        'Baris kelima adalah alasan utama kelas seperti `Uang` layak dibuat sama sekali. Kalau constructor menerima apa saja, kelas itu hanya object biasa yang ditulis dengan cara lebih panjang. Nilai sesungguhnya muncul dari jaminan bahwa setiap `Uang` yang ada di aplikasi pasti sah, sebab tidak ada jalan lain membuatnya selain lewat constructor yang memeriksa.',
      ),
      callout(
        'info',
        'Bidang yang berulang di berbagai bahasa',
        'Pola menolak nilai yang tidak sah di titik pembuatan dikenal luas dengan sebutan membuat keadaan yang salah menjadi mustahil. Ia bukan khas JavaScript, dan kamu akan menemuinya lagi saat memakai skema validasi di sisi server pada kategori Backend.',
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
    18,
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
            'Method yang ditulis dengan awalan `get` dan **dibaca seperti property biasa**, tanpa tanda kurung: `d.saldo`, bukan `d.saldo()`. Gunanya menyediakan jalan baca yang aman ke data internal, atau menghitung derived value setiap kali diminta.',
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
      p(
        'Tanda `#` bukan sekadar awalan nama, melainkan bagian dari nama field itu sendiri, dan itu sebabnya penulisannya wajib `this.#saldo` dan bukan `this.saldo`. Nilai sesungguhnya baru terlihat di empat baris terakhir. `d.saldo` bekerja karena ada getter yang sengaja dibuka, sedangkan `d.#saldo` bahkan **tidak bisa dijalankan sama sekali**. Errornya `SyntaxError` yang muncul sebelum program sempat berjalan, bukan `undefined` yang diam-diam mengalir. Dua baris paling bawah menunjukkan efek samping yang sering tidak diduga, yaitu field privat tidak ikut muncul di `Object.keys` maupun `JSON.stringify`. Itu menguntungkan untuk data sensitif yang tidak boleh bocor ke log, tapi perlu diingat kalau kamu bermaksud mengirim objek ini ke server, karena kamu harus menyediakan method sendiri yang menyusun bentuk kirimnya.',
      ),
      p(
        'Perhatikan juga kedua method pengubahnya memeriksa dulu sebelum menyentuh `#saldo`: `setor` menolak angka nol atau negatif, `tarik` menolak penarikan melebihi saldo. Karena `#saldo` mustahil disentuh dari luar, kedua pemeriksaan itu **tidak bisa dilewati siapa pun** — dan di situlah letak jaminan "saldo tidak pernah negatif". Bandingkan dengan property biasa, di mana satu baris `d.saldo = -999` dari bagian lain aplikasi sudah cukup untuk membatalkan seluruh aturan yang susah payah kamu tulis.',
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

          // Derived value — dihitung, tidak disimpan
          get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
        }

        const s = new Suhu();
        s.celsius = 25;    // memanggil setter
        s.fahrenheit;      // 77
        s.celsius = -300;  // RangeError
        `,
      ),
      p(
        'Yang membuat getter dan setter berbeda dari method biasa adalah **cara memakainya**, karena `s.celsius = 25` ditulis persis seperti menugaskan property biasa padahal di baliknya ada fungsi lengkap yang dijalankan beserta seluruh pemeriksaannya. Itu keunggulan sekaligus jebakannya, sebab kode pemanggil tetap sederhana tapi pembaca tidak melihat bahwa ada aturan yang sedang ditegakkan. Perhatikan setternya memeriksa dua hal berbeda dan melempar error yang berbeda pula, yaitu `TypeError` untuk jenis nilai yang salah dan `RangeError` untuk nilai yang jenisnya benar tapi mustahil secara fisika. Membedakan keduanya membantu pemanggil menangani tiap kasus dengan tepat. Sementara itu `fahrenheit` hanya punya getter tanpa setter, dan nilainya **dihitung** setiap kali dibaca alih-alih disimpan, sehingga ia mustahil basi. Mengubah `celsius` otomatis membuat `fahrenheit` ikut benar tanpa satu baris pun kode penyelaras.',
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
      p(
        'Class `A` di atas menambah dua method hanya untuk membungkus satu property tanpa aturan tambahan apa pun, karena `get n()` sekadar mengembalikan `#n` apa adanya dan `set n(v)` sekadar menyimpannya apa adanya. Ini menambah kode tanpa menambah jaminan apa pun, sehingga `class B` yang memakai property biasa lebih sederhana dan berperilaku identik dari sudut pandang pemanggil, sebab `b.n = 5` bekerja sama saja di keduanya. Keuntungannya baru muncul nanti. Kalau suatu hari `n` butuh aturan, misalnya "tidak boleh negatif", mengubah `class B` menjadi punya getter dan setter **tidak mengubah cara pemanggilnya menulis kode**, karena `b.n = 5` tetap `b.n = 5`. Getter dan setter memang sengaja dirancang agar terlihat identik dengan property biasa.',
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
      p(
        '`#penuh()` di atas adalah **private method**, dan sama seperti private field ia hanya bisa dipanggil dari dalam class `Antrean` sendiri. Mencoba `antrean.#penuh()` dari luar gagal dengan `SyntaxError`, persis seperti mengakses `#saldo` langsung di contoh pertama sub-bab ini. Gunanya untuk menyembunyikan langkah perantara, sebab pemanggil `tambah()` hanya perlu tahu "menambah bisa gagal kalau antreannya penuh" tanpa perlu tahu bagaimana caranya "penuh" itu dihitung. `static #maksimum` menggabungkan dua konsep sekaligus, yaitu **static** yang berarti milik class `Antrean` itu sendiri dan dibagi semua instance alih-alih disalin ke tiap objek, serta **private** yang berarti tidak bisa dibaca atau diubah dari luar. Kombinasi itu cocok untuk konstanta bersama yang memang tidak seharusnya pernah diubah oleh siapa pun yang memakai class ini.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi dompet digital menyimpan saldo pengguna. Aturannya dua, yaitu saldo tidak boleh negatif dan setiap perubahan harus tercatat. Selama saldo hanya berupa properti biasa, dua aturan itu bergantung pada disiplin setiap orang yang menyentuhnya. Cukup satu berkas yang menulis `dompet.saldo -= jumlah` tanpa memeriksa, dan aplikasi punya pengguna dengan saldo minus yang tidak pernah tercatat asalnya.',
      ),
      p(
        'Enkapsulasi menyelesaikan ini bukan dengan menyembunyikan demi kerapian, melainkan dengan membuat pelanggaran aturan menjadi **mustahil ditulis**, bukan sekadar dilarang.',
      ),
      code(
        'js',
        `
        export class Dompet {
          #saldoSen = 0;
          #mutasi = [];

          get saldo() { return new Uang(this.#saldoSen); }
          get mutasi() { return [...this.#mutasi]; }   // salinan, bukan aslinya

          isi(uang, keterangan) {
            if (uang.sen <= 0) throw new RangeError('Pengisian harus lebih dari nol');
            this.#saldoSen += uang.sen;
            this.#catat('isi', uang.sen, keterangan);
          }

          tarik(uang, keterangan) {
            if (uang.sen <= 0) throw new RangeError('Penarikan harus lebih dari nol');
            if (uang.sen > this.#saldoSen) {
              throw new RangeError(\`Saldo kurang, tersedia \${new Uang(this.#saldoSen)}\`);
            }
            this.#saldoSen -= uang.sen;
            this.#catat('tarik', -uang.sen, keterangan);
          }

          #catat(jenis, delta, keterangan) {
            this.#mutasi.push({ jenis, delta, keterangan, pada: new Date().toISOString() });
          }
        }
        `,
        { filename: 'src/dompet.js' },
      ),
      p(
        'Tidak ada satu pun cara mengubah `#saldoSen` dari luar kelas ini. Dua method publik yang mengubahnya, yaitu `isi` dan `tarik`, keduanya memeriksa aturannya lebih dulu dan keduanya memanggil `#catat`. Artinya jaminan saldo tidak negatif dan jaminan setiap perubahan tercatat bukan lagi bergantung pada ingatan penulis kode, melainkan pada bentuk kelasnya sendiri.',
      ),
      p(
        'Getter `mutasi` mengembalikan `[...this.#mutasi]` dan bukan array aslinya, dan itu bagian yang paling sering dilupakan. Kalau ia mengembalikan array aslinya, siapa pun yang memanggil `dompet.mutasi` bisa menulis `.push(...)` ke dalamnya dan menambahkan mutasi palsu tanpa melewati satu pun pemeriksaan. Pagar yang bocor di satu titik sama saja dengan tidak ada pagar.',
      ),
      p(
        'Method `#catat` juga privat, dan alasannya sama. Kalau ia publik, ada yang bisa mencatat mutasi tanpa mengubah saldo, dan riwayatnya berhenti mencerminkan kenyataan. Aturan praktisnya, buat privat semua yang bukan bagian dari cara kelas ini dipakai, lalu buka satu per satu hanya kalau ada pemakai nyata yang membutuhkannya.',
      ),
      callout(
        'warning',
        'Enkapsulasi di klien bukan kontrol keamanan',
        'Kelas ini menjaga kebenaran data di dalam satu program, dan itu berguna. Ia tidak menghalangi siapa pun mengirim permintaan penarikan langsung ke server tanpa lewat halamanmu. Server wajib memeriksa aturan yang sama, dan pemeriksaan di klien hanya untuk memberi tahu pengguna lebih cepat. Aturan ini dibahas penuh di Kategori Keamanan Fullstack.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Field privat punya beberapa pesan error yang khas, dan mengenalinya membuat penyebabnya langsung jelas.',
      ),
      code(
        'text',
        `
        class B { baca(o) { return o.#y; } }
                                  ^^

        SyntaxError: Private field '#y' must be declared in an enclosing class
        `,
        { caption: 'Field privat dipakai di kelas yang tidak mendeklarasikannya.' },
      ),
      p(
        'Ini `SyntaxError`, jadi seluruh berkas gagal dimuat. Field privat bukan properti biasa yang bisa dijangkau dari mana pun, melainkan bagian dari kelas tempat ia ditulis. Kalau kamu perlu membacanya dari kelas lain, itu tanda bahwa nilainya bukan urusan privat kelas itu, atau kedua kelas itu sebenarnya satu tanggung jawab yang dipisah terlalu jauh.',
      ),
      code(
        'text',
        `
        class Dompet { #saldoSen = 0; static baca(o) { return o.#saldoSen; } }
        Dompet.baca({});
                     ^

        TypeError: Cannot read private member #saldoSen from an object
        whose class did not declare it
        `,
        { caption: 'Object yang diberikan bukan instance kelas itu.' },
      ),
      p(
        'Pesan ini muncul saat sintaksnya benar tapi objectnya salah, misalnya object biasa hasil `JSON.parse` diberikan ke method yang mengharapkan instance sungguhan. Ini justru cara paling andal memeriksa apakah sebuah object benar-benar dibuat oleh kelasmu, dan sebagian pustaka memakainya sengaja. Untuk pemeriksaan yang tidak melempar, bentuk `#saldoSen in obj` tersedia dan mengembalikan boolean.',
      ),
      code(
        'text',
        `
        const d = new Dompet();
        d.tarik(Uang.dariRupiah(500000));

        RangeError: Saldo kurang, tersedia Rp 0
        `,
        { caption: 'Aturan bisnis ditolak dengan pesan yang menyebut angkanya.' },
      ),
      p(
        'Error ini bukan bug melainkan hasil kerja yang diinginkan. Yang layak dicontoh adalah pesannya menyebut saldo yang tersedia, sehingga penanganan di lapisan tampilan bisa langsung memberi tahu pengguna angka yang benar tanpa memanggil ulang apa pun. Pilih `RangeError` untuk nilai di luar batas dan `TypeError` untuk tipe yang salah, sebab jenis error yang tepat membantu penanganan di hulu memutuskan tanpa membaca teks pesannya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Private field '#x' must be declared in an enclosing class`",
            'Field privat dipakai di luar kelas yang mendeklarasikannya',
            'Sediakan getter, atau tinjau ulang pembagian tanggung jawabnya',
          ],
          [
            '`Cannot read private member #x from an object whose class did not declare it`',
            'Objectnya bukan instance kelas itu, biasanya hasil `JSON.parse`',
            'Bangun ulang instance-nya sebelum dipakai',
          ],
          [
            'Data internal ikut berubah dari luar',
            'Getter mengembalikan array atau object aslinya',
            'Kembalikan salinan, misalnya `[...this.#daftar]`',
          ],
          [
            'Aturan dilanggar lewat jalur yang tidak terduga',
            'Ada method publik yang mengubah keadaan tanpa memeriksa',
            'Kumpulkan seluruh perubahan keadaan ke satu atau dua method yang memeriksa',
          ],
          [
            'Field privat tidak muncul saat object dicetak',
            'Itu memang perilaku yang benar',
            'Sediakan `toJSON` atau method ringkasan bila memang perlu dilihat',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Enkapsulasi sering dipahami sebagai menyembunyikan sebanyak mungkin. Yang sebenarnya dijaga adalah **aturan**, dan beberapa baris di bawah adalah bentuk salah paham itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat semua field privat lalu menambahkan getter dan setter untuk semuanya',
            'Terlihat seperti enkapsulasi yang benar',
            'Setter publik untuk setiap field mengembalikan keadaan seperti properti biasa, hanya lebih panjang. Yang menjaga aturan adalah method bermakna seperti `tarik`, bukan `setSaldo`',
          ],
          [
            'Memakai awalan garis bawah seperti `_saldo` sebagai privat',
            'Sudah lama jadi kebiasaan dan mudah dibaca',
            'Itu hanya kesepakatan, dan siapa pun tetap bisa menulis ke sana. Pakai pagar kalau memang harus dijaga',
          ],
          [
            'Mengembalikan array internal apa adanya lewat getter',
            'Pemanggilnya kan hanya ingin membacanya',
            'Ia bisa diubah lewat `push` dan `splice`. Kembalikan salinan, atau kembalikan bentuk yang memang tidak bisa diubah',
          ],
          [
            'Membuka field privat karena satu test butuh membacanya',
            'Test juga bagian dari kode kita sendiri',
            'Test sebaiknya memeriksa perilaku lewat method publik, bukan isi dalamnya. Test yang membaca isi dalam akan rusak setiap kali strukturnya berubah',
          ],
          [
            'Menaruh aturan bisnis di lapisan tampilan',
            'Di sanalah pesan kesalahannya perlu muncul',
            'Aturan yang sama harus diulang di tiap tampilan, dan cepat atau lambat ada yang berbeda. Taruh aturan di kelasnya, dan biarkan tampilan hanya menampilkan pesannya',
          ],
          [
            'Menyimpan data mentah dan data turunan sekaligus sebagai field',
            'Supaya tidak dihitung ulang',
            'Dua sumber kebenaran yang harus dijaga tetap sinkron, dan itu selalu gagal. Simpan yang mentah, hitung turunannya di getter',
          ],
        ],
      ),
      p(
        'Baris pertama adalah pembeda antara enkapsulasi sungguhan dan enkapsulasi bergaya. Perhatikan kelas `Dompet` di atas tidak punya satu pun setter. Yang ia sediakan adalah `isi` dan `tarik`, dua kata kerja yang menyatakan kejadian dalam bahasa domainnya. Nama seperti itu memberi tempat alami bagi pemeriksaan dan pencatatan, sedangkan `setSaldo` tidak memberi tempat apa pun karena ia tidak menyatakan apa yang sedang terjadi.',
      ),
      callout(
        'tip',
        'Uji cepat apakah enkapsulasimu sungguhan',
        'Coba tulis satu baris dari luar kelas yang membuat keadaannya menjadi salah. Kalau kamu bisa menemukannya, pagarmu bocor di titik itu. Kalau kamu tidak bisa menemukan satu pun, aturan itu benar-benar dijaga bentuk kelasnya.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        '`#field` benar-benar privat; `_field` hanya kesepakatan.',
        'Private field tidak muncul di `Object.keys` maupun `JSON.stringify`.',
        'Setter adalah tempat yang tepat untuk validasi; getter untuk derived value.',
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
    22,
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
      p(
        "`super.perkenalan()` di dalam `Anjing` memanggil versi `perkenalan()` milik `Hewan` apa adanya, lalu hasilnya disambung dengan `' dengan riang'`. Ini beda penting dari overriding biasa: overriding (seperti `bersuara()` di `Kucing` sebelumnya) **mengganti total** perilaku induk, sementara `super.method()` di sini **memakai ulang** perilaku induk sebagai bahan, lalu menambahkan sesuatu di atasnya. Kalau logika `perkenalan()` di `Hewan` berubah di kemudian hari, `Anjing` otomatis ikut memakai versi terbarunya — karena ia memanggil `super.perkenalan()`, bukan menyalin ulang isinya sendiri.",
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
      p(
        'Hierarki ini terlihat wajar saat ditulis, sebab pinguin memang burung sehingga `Pinguin extends Burung` terasa benar. Masalahnya baru muncul karena `Burung` sudah terlanjur menjanjikan `terbang()` kepada **semua** turunannya, dan `Pinguin` mewarisi janji yang tidak bisa ia tepati. `Pinguin2` mencoba memperbaikinya dengan menimpa method itu, tapi perhatikan apa yang sebenarnya terjadi. Kemampuan yang diwariskan tidak hilang, melainkan hanya diganti dengan sesuatu yang **pasti gagal saat dipanggil**. Jadi bugnya tidak hilang melainkan hanya berpindah, dari "pinguin bisa terbang" yang salah secara logika menjadi kegagalan runtime yang muncul di tempat yang jauh dari sini.',
      ),
      callout(
        'warning',
        'Masalah "base class yang rapuh"',
        'Semakin dalam hierarki, semakin besar kemungkinan perubahan kecil di induk merusak turunan yang jauh — dan kamu tidak melihatnya saat mengedit induk. Aturan praktis: **maksimal satu tingkat**, dan berhenti kalau kamu mulai menimpa method dengan error.',
      ),
      p(
        'Inilah bentuk konkret pelanggaran **LSP** (*Liskov Substitution Principle*) yang disebut di kotak istilah. Kode mana pun yang menerima parameter bertipe `Burung` dan berasumsi bisa memanggil `.terbang()` akan bekerja untuk elang tapi meledak untuk `Pinguin2`, padahal keduanya sama-sama "burung" secara hierarki. `Pinguin2` gagal **menggantikan** `Burung` tanpa merusak sesuatu, walau ia memang secara teknis turunannya. Tandanya paling jelas terlihat di kode, yaitu sebuah method di class turunan yang isinya cuma `throw new Error(...)` untuk membatalkan kemampuan yang justru diwariskan.',
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
      p(
        'Bandingkan dengan `Pinguin2` di atas, karena `ValidasiError extends Error` justru kasus inheritance yang **tepat**. `ValidasiError` benar-benar "adalah sebuah" `Error`, sebab ia tidak membatalkan atau mengganti kemampuan apa pun milik `Error` dan hanya menambah `field` untuk menyebut input mana yang bermasalah. `super(pesan)` meneruskan pesan errornya ke constructor `Error` bawaan, yang salah satu tugasnya mengisi `e.stack`, yaitu jejak tumpukan pemanggilan yang berguna saat debugging. Itulah sebabnya `e.stack` tetap ada di `ValidasiError`, karena ia mewarisi tanggung jawab itu utuh dari `Error` tanpa perlu membuatnya sendiri dari nol.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi mengirim tiga jenis pemberitahuan, yaitu email, pesan WhatsApp, dan pemberitahuan di dalam aplikasi. Ketiganya punya bagian yang benar-benar sama, yaitu mencatat percobaan pengiriman, mencoba ulang saat gagal, dan menolak mengirim ke penerima yang sudah berhenti berlangganan. Yang berbeda hanya cara pengirimannya dan bentuk pesannya.',
      ),
      p(
        'Ini salah satu dari sedikit situasi di mana pewarisan memang bentuk yang tepat, sebab ketiganya benar-benar jenis dari satu hal yang sama dan bukan sekadar kebetulan punya kode mirip.',
      ),
      code(
        'js',
        `
        export class Notifikasi {
          #percobaan = 0;

          constructor({ penerima, maksPercobaan = 3 }) {
            if (new.target === Notifikasi) {
              throw new TypeError('Notifikasi adalah kelas dasar, turunkan dulu');
            }
            this.penerima = penerima;
            this.maksPercobaan = maksPercobaan;
          }

          // Wajib ditulis ulang oleh tiap turunan.
          async kirimSekali() {
            throw new Error(\`\${this.constructor.name} wajib menulis kirimSekali()\`);
          }

          // Alur yang sama untuk semua jenis. Turunan tidak menulis ulang ini.
          async kirim() {
            if (await sudahBerhentiLangganan(this.penerima)) {
              return { status: 'dilewati', alasan: 'berhenti langganan' };
            }
            while (this.#percobaan < this.maksPercobaan) {
              this.#percobaan += 1;
              try {
                await this.kirimSekali();
                return { status: 'terkirim', percobaan: this.#percobaan };
              } catch (e) {
                if (this.#percobaan >= this.maksPercobaan) {
                  return { status: 'gagal', percobaan: this.#percobaan, pesan: e.message };
                }
                await tunggu(2 ** this.#percobaan * 1000);
              }
            }
          }
        }
        `,
        { filename: 'src/notifikasi/dasar.js' },
      ),
      code(
        'js',
        `
        export class NotifEmail extends Notifikasi {
          constructor({ penerima, subjek, isi }) {
            super({ penerima });          // WAJIB dipanggil sebelum menyentuh this
            this.subjek = subjek;
            this.isi = isi;
          }
          async kirimSekali() {
            await smtp.send({ to: this.penerima, subject: this.subjek, html: this.isi });
          }
        }

        export class NotifWhatsApp extends Notifikasi {
          constructor({ penerima, teks }) {
            super({ penerima, maksPercobaan: 5 });   // penyedia ini lebih sering gagal
            this.teks = teks;
          }
          async kirimSekali() {
            await wa.kirim(this.penerima, this.teks.slice(0, 1024));
          }
        }
        `,
        { filename: 'src/notifikasi/jenis.js' },
      ),
      p(
        'Yang membuat pembagian ini bekerja adalah letak alurnya. Method `kirim` berisi seluruh urutan yang sama untuk semua jenis, yaitu memeriksa langganan, mencoba, menunggu dengan jeda yang membesar, lalu menyerah. Turunan tidak pernah menulis ulang `kirim`, dan itu justru intinya. Kalau nanti aturan percobaan ulang berubah, satu berkas yang disunting dan ketiga jenis ikut berubah.',
      ),
      p(
        'Pemeriksaan `new.target === Notifikasi` di constructor mencegah kelas dasar dibuat langsung. Tanpa itu, `new Notifikasi({ penerima })` menghasilkan object yang `kirimSekali`-nya selalu melempar, dan kegagalannya baru muncul jauh kemudian. `new.target` bernilai kelas yang benar-benar dipanggil dengan `new`, sehingga ia bernilai `NotifEmail` saat turunan yang dibuat.',
      ),
      p(
        'Baris `super({ penerima, maksPercobaan: 5 })` pada `NotifWhatsApp` memperlihatkan sisi berguna lain dari pewarisan, yaitu turunan boleh mengubah pengaturan bawaan tanpa menulis ulang perilakunya. Penyedia WhatsApp yang lebih sering gagal cukup meminta lima percobaan, dan seluruh logika percobaan ulang tetap dipakai apa adanya.',
      ),
      callout(
        'warning',
        'Pewarisan hanya tepat kalau hubungannya benar-benar adalah sejenis',
        'Email memang sejenis notifikasi, jadi bentuk ini sesuai. Yang sering salah adalah menurunkan sesuatu hanya karena ada kode yang ingin dipakai bersama, misalnya `Pesanan extends BasisData`. Pesanan bukan jenis basis data. Kalau hubungannya adalah memakai bukan adalah, gunakan komposisi seperti dibahas di Sub-bab 2.10.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pewarisan punya beberapa error yang bentuknya sangat khas, dan hampir semuanya berkaitan dengan `super`.',
      ),
      code(
        'text',
        `
        class B extends A {
          constructor() { this.x = 1; super(); }
                          ^

        ReferenceError: Must call super constructor in derived class before
        accessing 'this' or returning from derived constructor
        `,
        { caption: '`this` disentuh sebelum `super()` dipanggil.' },
      ),
      p(
        'Aturannya bukan kesewenangan. Di kelas turunan, object-nya baru benar-benar terbentuk setelah constructor induk selesai, jadi sebelum `super()` dipanggil memang belum ada `this` untuk disentuh. Perbaikannya selalu sama, yaitu jadikan `super(...)` baris pertama constructor. Kalau kamu butuh menghitung sesuatu sebelum memanggil `super`, hitung dalam variabel lokal, bukan lewat `this`.',
      ),
      code(
        'text',
        `
        class B extends A {
          constructor(opsi) { this.opsi = opsi; }
        }
        new B({});

        ReferenceError: Must call super constructor in derived class before
        accessing 'this'
        `,
        { caption: '`super()` sama sekali tidak ditulis.' },
      ),
      p(
        'Kalau kelas turunan punya constructor sendiri, `super()` wajib dipanggil. Kalau kamu tidak menulis constructor sama sekali, JavaScript membuatkan yang meneruskan seluruh argumen ke induknya, dan itu sering justru yang kamu inginkan. Menghapus constructor yang hanya memanggil `super(...)` dengan argumen yang sama adalah penyederhanaan yang aman.',
      ),
      code(
        'text',
        `
        const n = new Notifikasi({ penerima: 'a@x.id' });
                  ^

        TypeError: Notifikasi adalah kelas dasar, turunkan dulu
        `,
        { caption: 'Kelas dasar dibuat langsung, dan penjaga di constructor menolaknya.' },
      ),
      p(
        'Error ini kamu tulis sendiri, dan itulah gunanya. JavaScript tidak punya kelas abstrak bawaan seperti sebagian bahasa lain, jadi pemeriksaan `new.target` adalah cara yang tersedia. Pesannya sengaja menyebut apa yang harus dilakukan, bukan sekadar menyatakan larangan.',
      ),
      code(
        'text',
        `
        await new NotifSms({ penerima }).kirim();

        Error: NotifSms wajib menulis kirimSekali()
        `,
        { caption: 'Turunan baru lupa menulis method yang wajib.' },
      ),
      p(
        'Ini jaring pengaman untuk method yang wajib ditulis ulang. Karena JavaScript tidak memaksa turunan menulis ulang apa pun, kelas dasar yang melempar di method itu adalah cara membuat kelalaian menjadi terlihat. Perhatikan pesannya memakai `this.constructor.name`, sehingga ia menyebut nama kelas turunan yang bermasalah, bukan nama kelas dasarnya.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Must call super constructor ... before accessing 'this'`",
            '`super()` belum dipanggil, atau tidak ditulis sama sekali',
            'Jadikan `super(...)` baris pertama, atau hapus constructornya bila hanya meneruskan',
          ],
          [
            '`Class extends value undefined is not a constructor or null`',
            'Kelas induk belum diimpor, atau impornya salah bentuk',
            'Periksa bentuk ekspor dan impornya, serta kemungkinan impor melingkar',
          ],
          [
            '`X wajib menulis kirimSekali()`',
            'Turunan tidak menulis ulang method yang wajib',
            'Tulis method itu di turunannya',
          ],
          [
            'Perubahan di kelas dasar merusak satu turunan',
            'Turunan bergantung pada detail dalam kelas dasar',
            'Batasi hubungan ke method yang memang dimaksudkan untuk ditulis ulang',
          ],
          [
            'Rantai pewarisan sudah empat tingkat dan sulit ditelusuri',
            'Pewarisan dipakai untuk berbagi kode, bukan untuk menyatakan jenis',
            'Ubah menjadi komposisi, lihat Sub-bab 2.10',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pewarisan adalah alat yang paling sering dipakai berlebihan di seluruh materi OOP. Empat baris pertama di bawah adalah tanda paling jelas bahwa ia dipakai di tempat yang salah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menurunkan kelas hanya untuk memakai ulang beberapa method',
            'Kodenya jadi tidak diulang',
            'Turunan ikut membawa seluruh isi induknya, termasuk yang tidak relevan. Kalau hubungannya bukan adalah sejenis, pakai komposisi',
          ],
          [
            'Membuat rantai pewarisan tiga tingkat atau lebih',
            'Tiap tingkat menambah kekhususan yang masuk akal',
            'Untuk membaca satu method, pembaca harus membuka empat berkas. Ratakan menjadi satu tingkat, dan pindahkan sisanya ke komposisi',
          ],
          [
            'Menulis ulang method induk lalu lupa memanggil `super.method()`',
            'Method barunya sudah lengkap',
            'Bagian penting dari induk ikut hilang, misalnya pencatatan atau pembersihan. Kalau kamu memang mengganti seluruhnya, itu tanda pewarisannya tidak cocok',
          ],
          [
            'Menaruh field yang hanya dipakai satu turunan di kelas dasar',
            'Nanti mungkin turunan lain memakainya juga',
            'Semua turunan ikut membawanya, dan kelas dasar berhenti mewakili hal yang benar-benar sama. Taruh di turunan yang memakainya',
          ],
          [
            'Memakai `instanceof` di rantai `if` untuk membedakan perilaku',
            'Cara langsung untuk memilih penanganan',
            'Itu mengembalikan rantai `if` yang justru ingin dihilangkan pewarisan. Jadikan perbedaan itu method yang ditulis ulang, lihat Sub-bab 2.8',
          ],
          [
            'Mengubah tanda tangan method saat menulis ulang di turunan',
            'Turunan butuh parameter tambahan',
            'Pemanggil yang memegang kelas dasar akan memanggilnya dengan cara lama dan gagal. Turunan harus tetap bisa dipakai di tempat induknya dipakai',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah bentuk sederhana dari prinsip substitusi Liskov yang akan dibahas di Sub-bab 2.11. Intinya satu kalimat, yaitu kode yang bekerja dengan kelas dasar harus tetap bekerja kalau diberi turunan mana pun tanpa tahu turunan yang mana. Begitu sebuah turunan menuntut perlakuan khusus, keuntungan terbesar pewarisan sudah hilang.',
      ),
      callout(
        'tip',
        'Uji satu kalimat sebelum memakai `extends`',
        'Ucapkan hubungannya dengan kata adalah. Email **adalah** notifikasi, dan itu terdengar benar. Pesanan **adalah** basis data, dan itu terdengar salah. Kalau kalimatnya terdengar aneh, yang kamu butuhkan hampir pasti komposisi.',
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
    18,
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
      p(
        'Masalah pada versi ini bukan soal salah secara teknis — kodenya berjalan dengan benar. Masalahnya baru terasa enam bulan kemudian, saat metode pembayaran keenam ditambahkan: satu-satunya cara menambahkannya adalah membuka fungsi `bayar()` yang sudah dipakai di produksi, menyisipkan `if` baru di antara yang lama, lalu berharap tidak ada baris lain yang ikut rusak. Ini persis yang dimaksud istilah **rantai if** di kotak istilah di atas.',
      ),
      p(
        'Risikonya konkret, bukan sekadar teori: karena tiap `if` di atas langsung `return` begitu cocok, urutannya ikut menentukan hasil. Andaikan seseorang menyisipkan `if (metode.tipe === undefined) return prosesKartu(jumlah);` di baris paling atas sebagai "penanganan default" — semua metode lain jadi tidak pernah tercapai, tapi kodenya tetap terlihat rapi dan lolos review sekilas, karena tidak ada tanda kesalahan sintaks apa pun.',
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
      p(
        'Begini urutan kejadian saat `bayar(new Kartu(), 50000)` dijalankan. `metode` berisi instance `Kartu`, lalu `metode.proses(jumlah)` membuat JavaScript mencari method bernama `proses`, pertama di objeknya sendiri lalu di `Kartu.prototype` lewat rantai prototype dari sub-bab sebelumnya. Begitu ketemu, ia dipanggil dengan `this` terikat ke instance itu. Fungsi `bayar()` sendiri **tidak pernah tahu** apakah yang dipanggilnya `Kartu` atau `Transfer`, dan itulah polymorphism, yaitu satu baris pemanggilan dengan banyak kemungkinan implementasi, dan pemanggilnya tidak perlu bercabang untuk memilih salah satunya. Konsekuensi praktisnya, menambah `class Ewallet { proses(jumlah) { ... } }` besok tidak mengubah satu baris pun di `bayar()`, persis prinsip **open–closed** yang disebut di kotak istilah di atas.',
      ),
      p(
        'Pencarian method inilah yang disebut ***dynamic dispatch***, karena JavaScript memutuskan implementasi mana yang benar-benar dijalankan **saat baris itu dieksekusi** dan bukan saat kode ditulis. Bandingkan dengan kasus gagalnya. Kalau `metode` adalah objek kosong `{}`, maka `metode.proses` bernilai `undefined`, dan memanggilnya sebagai fungsi lewat `undefined(jumlah)` gagal dengan `TypeError: metode.proses is not a function`. Pesan error itu sendiri sebenarnya sudah menunjukkan mekanismenya, sebab JavaScript memang benar-benar mencari properti bernama `proses` di objeknya alih-alih memeriksa "apakah ini `Kartu`?".',
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

        function buatDompetPoin(kurs) {
          // Factory: fungsi biasa yang mengembalikan objek, tanpa "class" maupun "new"
          return { proses: (n) => \`Poin (kurs \${kurs}x): \${n * kurs}\` };
        }
        const poin = buatDompetPoin(2);

        // Class instance, object literal, dan hasil factory — dicampur dalam array yang sama
        const daftarMetode = [new Kartu(), new Transfer(), tunai, poin];
        for (const metode of daftarMetode) {
          console.log(bayar(metode, 10000));
        }
        // Keempatnya lolos lewat kode bayar() yang persis sama, tanpa tahu asalnya
        `,
      ),
      p(
        '`bayar()` di atas tidak pernah bertanya "kamu instance dari class apa?" — ia hanya mengakses `metode.proses` dan memanggilnya kalau properti itu ada dan berupa fungsi. Karena itu `tunai` (object literal), `poin` (hasil pemanggilan factory `buatDompetPoin`), dan `new Kartu()` (instance class) semuanya lolos lewat jalur pemanggilan yang sama persis di dalam satu `for...of`. Inilah yang dimaksud duck typing: JavaScript memeriksa **bentuk** objeknya (apakah ada method `proses`), bukan **asal-usulnya** (apakah dibuat lewat `class`, lewat fungsi factory, atau ditulis langsung sebagai objek literal).',
      ),
      p(
        'Bandingkan dengan Java, bahasa yang dipakai sebagai contoh tipe nominal di kotak istilah, sebab di sana `Kartu` harus eksplisit menulis `implements MetodeBayar` sebelum compiler mengizinkannya dipakai di tempat yang mengharapkan `MetodeBayar`, sekalipun bentuk method-nya sudah identik. JavaScript tidak punya syarat administratif seperti itu. Ini bukan berarti duck typing "lebih baik", sebab ia menukar jaminan yang diperiksa lebih awal di Java dengan kebebasan menulis lebih cepat di JavaScript, dan bagian berikutnya menunjukkan harga dari kebebasan itu.',
      ),
      callout(
        'tip',
        'Konsekuensinya untuk pengujian',
        'Karena tidak ada tipe formal yang harus dicocokkan, membuat objek palsu untuk test jadi sangat murah: `{ proses: () => "dipanggil" }` sudah cukup. Ini keunggulan nyata duck typing dibanding sistem tipe nominal.',
      ),

      h2('Batasnya, dan apa yang TypeScript tambahkan'),
      p(
        'Fleksibilitas duck typing ada harganya, sebab JavaScript tidak memverifikasi bentuk objek sebelum program berjalan. Kalau `proses` salah ketik jadi `prosess` saat memanggil `bayar()`, kodenya **tetap lolos ditulis dan di-*commit***, sebab errornya baru muncul saat baris itu benar-benar dieksekusi, yang bisa jadi saat pengguna sungguhan sedang membayar, bukan saat development. Kalau kebetulan tidak ada test otomatis yang memanggil baris itu dengan data yang tepat, bug seperti ini bisa lolos sampai production tanpa pernah ketahuan, sampai suatu hari jalur itu benar-benar dilewati pengguna nyata.',
      ),
      code(
        'js',
        `
        bayar({ prosess: () => 1 }, 100);   // salah ketik -> TypeError saat berjalan
        `,
      ),
      p(
        'Satu huruf `s` berlebih pada `prosess` sudah cukup untuk memperlihatkan batas *duck typing*. JavaScript murni tidak punya cara memeriksa bahwa objek yang dikirim benar-benar memenuhi bentuk yang diharapkan, sebab ia baru sadar ada yang salah **pada saat `metode.proses(...)` benar-benar dipanggil**, dan pesannya `TypeError: metode.proses is not a function`. Kalau baris itu berada di jalur yang jarang dilewati, misalnya hanya berjalan saat pengguna memilih metode pembayaran tertentu, bugnya bisa lolos ke production tanpa satu pun pengujian yang menangkapnya. Kebebasan duck typing dan risiko ini adalah dua sisi dari koin yang sama.',
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
      p(
        "Bedanya terasa di sini, karena `bayar({ prosess: () => '' }, 100)` pada versi TypeScript ditolak **sebelum** program pernah dijalankan sekali pun. Errornya muncul di editor, saat `npm run build`, atau di CI, bukan di production. Praktiknya, editor akan langsung menggarisbawahi merah properti `prosess` begitu diketik, jauh sebelum baris itu bahkan disimpan, dan itu jauh lebih cepat ditemukan dibanding menunggu laporan bug dari pengguna. TypeScript melakukan ini tanpa memaksa `Kartu` atau `Transfer` mewarisi (`extends`) apa pun, sebab ia hanya memeriksa apakah bentuk objeknya cocok dengan `interface MetodeBayar`. Inilah yang dimaksud istilah **tipe struktural** di kotak istilah di atas, yaitu pemeriksaan berdasarkan bentuk objek, hanya saja dipindah dari saat program berjalan ke saat program ditulis.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman checkout harus mendukung tiga cara bayar, dan tiap cara punya biaya layanan, aturan verifikasi, dan alur penyelesaian yang berbeda. Di Sub-bab 2.1 kamu sudah melihat bentuk buruknya, yaitu rantai `if` yang sama diulang di beberapa fungsi. Sekarang bentuk yang benar, di mana rantai itu hilang sama sekali dan digantikan satu pemanggilan.',
      ),
      code(
        'js',
        `
        class Pembayaran {
          get label() { throw new Error(\`\${this.constructor.name} wajib punya label\`); }
          biaya(_sen) { return 0; }
          async proses(_pesanan) {
            throw new Error(\`\${this.constructor.name} wajib menulis proses()\`);
          }
        }

        class Transfer extends Pembayaran {
          get label() { return 'Transfer Bank'; }
          async proses(pesanan) {
            return { status: 'menunggu', instruksi: await buatVirtualAccount(pesanan) };
          }
        }

        class KartuKredit extends Pembayaran {
          get label() { return 'Kartu Kredit'; }
          biaya(sen) { return Math.round(sen * 0.029); }
          async proses(pesanan) {
            return { status: 'lunas', bukti: await gesek(pesanan) };
          }
        }

        class BayarDiTempat extends Pembayaran {
          get label() { return 'Bayar di Tempat'; }
          biaya() { return 500000; }   // 5.000 rupiah dalam sen
          async proses() {
            return { status: 'menunggu', instruksi: 'Siapkan uang pas saat kurir tiba' };
          }
        }
        `,
        { filename: 'src/pembayaran.js' },
      ),
      code(
        'js',
        `
        const metode = {
          transfer: new Transfer(),
          kartu: new KartuKredit(),
          cod: new BayarDiTempat(),
        };

        // Tidak ada satu pun 'if' yang memeriksa jenis pembayaran.
        function ringkasan(jenis, subtotalSen) {
          const m = metode[jenis];
          if (!m) throw new Error(\`Metode \${jenis} tidak dikenal\`);

          const biaya = m.biaya(subtotalSen);
          return { label: m.label, biaya, total: subtotalSen + biaya };
        }

        async function selesaikan(jenis, pesanan) {
          return metode[jenis].proses(pesanan);   // tiap kelas tahu caranya sendiri
        }
        `,
        { filename: 'src/checkout.js' },
      ),
      p(
        'Perhatikan `ringkasan` dan `selesaikan` sama sekali tidak menyebut nama metode pembayaran mana pun. Keduanya hanya tahu bahwa apa pun yang mereka pegang punya `label`, `biaya`, dan `proses`. Inilah polimorfisme dalam bentuk paling langsung, yaitu satu pemanggilan yang berperilaku berbeda tergantung object apa yang sedang dipegang.',
      ),
      p(
        'Keuntungan nyatanya baru terasa saat metode keempat datang. Menambah QRIS berarti menambah satu kelas dan satu baris di object `metode`. Tidak ada satu pun baris di `ringkasan` maupun `selesaikan` yang perlu disentuh, dan itu berarti tidak ada risiko merusak tiga metode yang sudah bekerja. Bandingkan dengan rantai `if` yang menuntut kamu menyunting tiap fungsi yang memeriksa jenis.',
      ),
      p(
        'Method `biaya` di kelas dasar sengaja memberi nilai bawaan nol alih-alih melempar, sedangkan `proses` melempar. Perbedaan itu disengaja. Biaya nol adalah perilaku bawaan yang masuk akal untuk metode yang tidak memungut apa pun, sehingga `Transfer` tidak perlu menulisnya. `proses` tidak punya bawaan yang masuk akal, sehingga lupa menulisnya harus menjadi kegagalan yang terlihat.',
      ),
      callout(
        'tip',
        'Tabel object lebih ringan daripada `switch` yang mengembalikan instance',
        'Object `metode` di atas dibuat sekali dan dipakai bersama, sebab ketiga kelas ini tidak menyimpan keadaan per pesanan. Kalau tiap pembayaran perlu membawa keadaannya sendiri, ganti nilainya menjadi fungsi pembuat, misalnya `transfer: () => new Transfer(pesanan)`, dan panggil saat dibutuhkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Polimorfisme di JavaScript tidak dijaga compiler, sehingga kesalahan bentuk baru ketahuan saat dijalankan. Tiga bentuk di bawah adalah yang paling sering.',
      ),
      code(
        'text',
        `
        await metode.qris.proses(pesanan);

        Error: Qris wajib menulis proses()
        `,
        { caption: 'Kelas baru dibuat tapi method wajibnya belum ditulis.' },
      ),
      p(
        'Kegagalan ini datang dari penjaga yang kamu pasang sendiri di kelas dasar, dan tanpa penjaga itu yang terjadi jauh lebih membingungkan. Method yang tidak ditulis ulang akan mewarisi versi kelas dasar, dan kalau versi itu diam saja, pesanan akan dianggap selesai tanpa satu pun pembayaran diproses. Penjaga yang melempar mengubah kegagalan senyap menjadi kegagalan yang menyebut nama kelasnya.',
      ),
      code(
        'text',
        `
        const m = metode[jenisDariForm];
        m.biaya(507000);
          ^

        TypeError: Cannot read properties of undefined (reading 'biaya')
        `,
        { caption: 'Kunci dari formulir tidak ada di tabel metode.' },
      ),
      p(
        'Ini alasan pemeriksaan `if (!m) throw ...` ada di `ringkasan`. Nilai dari formulir tidak kamu kendalikan, dan pengguna atau penyerang bisa mengirim apa saja. Pesan error yang menyebut jenis yang diminta jauh lebih berguna daripada `Cannot read properties of undefined`, baik bagimu saat menelusuri maupun bagi log server.',
      ),
      code(
        'text',
        `
        class Qris extends Pembayaran {
          async proses(pesanan, kodeUnik) { /* ... */ }
        }

        await metode.qris.proses(pesanan);   // kodeUnik undefined
        // Tidak ada error, tapi kode QR yang dibuat tidak sah.
        `,
        { caption: 'Turunan menuntut parameter tambahan yang tidak diberikan pemanggil.' },
      ),
      p(
        'Ini pelanggaran terhadap kesepakatan bentuk, dan JavaScript tidak akan menghentikanmu. Pemanggil hanya tahu bentuk kelas dasar, jadi ia memanggil dengan satu argumen. Kalau sebuah turunan butuh informasi tambahan, ambil dari `pesanan` atau simpan saat objectnya dibuat, jangan menambah parameter yang tidak dikenal pemanggil.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`X wajib menulis proses()`',
            'Turunan tidak menulis ulang method wajib',
            'Tulis methodnya di turunan itu',
          ],
          [
            "`Cannot read properties of undefined (reading 'biaya')`",
            'Kunci dari luar tidak ada di tabel',
            'Periksa keberadaannya dan lempar error yang menyebut nilainya',
          ],
          [
            'Turunan berperilaku benar sendiri tapi salah lewat pemanggil umum',
            'Tanda tangan methodnya berbeda dari kelas dasar',
            'Samakan bentuknya, dan ambil kebutuhan tambahan dari argumen yang sudah ada',
          ],
          [
            'Masih ada `if` yang memeriksa `instanceof` di beberapa tempat',
            'Ada perilaku yang belum dipindahkan menjadi method',
            'Pindahkan perbedaan itu menjadi method yang ditulis ulang tiap turunan',
          ],
          [
            'Semua turunan menulis ulang method yang sama persis',
            'Perilaku itu sebenarnya sama untuk semuanya',
            'Naikkan ke kelas dasar supaya tidak diulang',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Polimorfisme sering dipahami sebagai keharusan memakai `class` dan `extends`. Di JavaScript, yang benar-benar dibutuhkan hanya kesamaan bentuk, dan beberapa baris di bawah menyangkut salah paham itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira polimorfisme wajib memakai pewarisan',
            'Contoh-contohnya memang selalu memakai `extends`',
            'JavaScript hanya peduli apakah methodnya ada. Tiga object literal dengan method bernama sama sudah polimorfik tanpa satu pun kelas',
          ],
          [
            'Menyisakan satu `if (x instanceof A)` untuk kasus khusus',
            'Hanya satu kasus, jadi tidak apa-apa',
            'Kasus khusus itu akan bertambah, dan tiap penambahan mengembalikan rantai yang ingin dihilangkan. Jadikan ia method yang ditulis ulang',
          ],
          [
            'Membuat kelas dasar yang methodnya mengembalikan `null` diam-diam',
            'Supaya turunan tidak wajib menulisnya',
            'Turunan yang lupa akan gagal diam-diam. Untuk method yang memang wajib, melempar jauh lebih baik daripada mengembalikan nilai kosong',
          ],
          [
            'Menamai method berbeda-beda di tiap kelas',
            'Nama yang spesifik lebih deskriptif',
            'Polimorfisme bekerja karena namanya sama. `kirimEmail` dan `kirimWa` memaksa pemanggil tahu jenisnya, sedangkan `kirim` tidak',
          ],
          [
            'Menaruh seluruh kelas turunan di satu berkas raksasa',
            'Semuanya berkaitan jadi enak dibaca bersama',
            'Berkas itu tumbuh tiap ada jenis baru, dan menjadi titik bentrok saat beberapa orang bekerja bersamaan. Satu jenis satu berkas',
          ],
          [
            'Menambahkan method baru ke kelas dasar tanpa memberi bawaan',
            'Semua turunan pasti akan diperbarui juga',
            'Turunan yang belum diperbarui langsung rusak. Beri bawaan yang aman, atau perbarui seluruh turunan dalam perubahan yang sama',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan karena ia membebaskan banyak pilihan. Contoh checkout di atas bisa ditulis tanpa satu pun kelas, cukup dengan tiga object literal yang masing-masing punya `label`, `biaya`, dan `proses`. JavaScript tidak memeriksa jenis sebelum memanggil, ia hanya mencari methodnya. Pilih kelas kalau kamu butuh berbagi implementasi seperti alur percobaan ulang di sub-bab sebelumnya, dan pilih object literal kalau yang dibutuhkan hanya kesamaan bentuk.',
      ),
      callout(
        'info',
        'Di TypeScript, kesamaan bentuk ini bisa dipaksakan',
        'TypeScript menyediakan `interface` yang menyatakan bentuk yang wajib dipenuhi, dan pelanggarannya menjadi error sebelum kode dijalankan. Itu menutup persis celah yang dibahas di bagian error di atas. Materinya ada di Bab 4 tentang JSX dan TypeScript.',
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
    19,
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
      p(
        '`Suhu.bandingkan` di atas adalah **comparator**, sebab `sort` memanggilnya berulang kali dengan dua elemen array sekaligus, lalu memakai tanda hasilnya (negatif, nol, atau positif) untuk memutuskan urutan, sehingga hasil negatif berarti elemen pertama harus ditempatkan lebih dulu. Menaruhnya sebagai `static bandingkan(a, b)`, alih-alih fungsi lepas di suatu tempat, membuatnya mudah ditemukan, sebab siapa pun yang membaca class `Suhu` langsung tahu di mana cara mengurutkan sekumpulan `Suhu` berada, tanpa perlu mencarinya di file lain.',
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
      p(
        'Dua baris "SEBELUM" menunjukkan gejalanya dengan jelas, yaitu deretan `null` yang harus dihitung posisinya, dan tidak ada satu pun petunjuk tentang **untuk apa** tiap pemanggilan itu. Pemanggil harus tahu bahwa argumen ketiga bermakna "buat dari JSON", pengetahuan yang hanya ada di kepala penulis aslinya. Versi "SESUDAH" memindahkan pengetahuan itu ke dalam **nama**. `Pengguna.dariForm(fd)` menjelaskan dirinya sendiri tanpa dokumentasi, dan tiap jalur pembuatan bebas melakukan persiapan yang berbeda-beda, sebab `dariJSON` mem-parse teks lebih dulu sedangkan `tamu` mengisi nilai bawaan. Perhatikan ketiganya berakhir memanggil `new Pengguna(nama, email)` yang sama, sehingga constructornya tetap satu dan tetap sederhana, sedangkan keragaman cara membuat dipindahkan ke method `static` yang bisa ditambah kapan saja tanpa mengubah constructor sama sekali.',
      ),
      callout(
        'tip',
        'Factory method bisa mengembalikan objek yang sudah ada',
        'Constructor **selalu** membuat objek baru. Factory method boleh mengembalikan instance yang di-cache, atau bahkan subclass yang berbeda — fleksibilitas yang tidak dimiliki `new`.',
      ),

      h2('Anti-pattern: `static` sebagai gudang global'),
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
      p(
        "`Konfigurasi.data` bermasalah bukan karena `static`-nya, melainkan karena ia menyimpan **data yang berubah** dan bisa diakses dari mana saja, persis seperti definisi keadaan global di kotak istilah, hanya dibungkus sintaks class. Dua test yang sama-sama memanggil `Konfigurasi.set('mode', 'gelap')` akan saling memengaruhi meski ditulis di file yang berbeda, karena keduanya menulis ke `data` yang persis sama. `Konfigurasi2` memperbaikinya bukan dengan membuang `class`, melainkan dengan memindahkan `#data` dari `static`, yang dimiliki class dan satu untuk semua, menjadi instance field yang dimiliki tiap objek. Sekarang dua `new Konfigurasi2()` benar-benar independen satu sama lain, dan setiap test bisa membuat instance-nya sendiri tanpa mengganggu test yang lain.",
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Kelas `Uang` dari Sub-bab 2.5 menyimpan sen, sedangkan hampir semua tempat di aplikasi bekerja dengan rupiah. Kalau satu-satunya cara membuatnya adalah `new Uang(89000 * 100)`, cepat atau lambat ada yang lupa mengalikan seratus dan aplikasi mengirim tagihan seharga delapan ratus sembilan puluh rupiah. Constructor hanya satu dan namanya terkunci pada nama kelas, sehingga ia tidak bisa menjelaskan satuan apa yang ia terima.',
      ),
      p(
        'Method statis pembuat menyelesaikan itu dengan memberi nama pada tiap cara pembuatan, dan namanya bisa menyebut satuannya.',
      ),
      code(
        'js',
        `
        export class Uang {
          #sen;

          // Constructor dijaga supaya tidak dipakai langsung dari luar.
          constructor(sen, kunci) {
            if (kunci !== Uang.#kunci) {
              throw new TypeError('Pakai Uang.dariRupiah() atau Uang.dariSen()');
            }
            this.#sen = sen;
          }
          static #kunci = Symbol('uang');

          static dariRupiah(rp) {
            if (!Number.isFinite(rp)) throw new TypeError(\`Bukan angka, dapat \${rp}\`);
            return new Uang(Math.round(rp * 100), Uang.#kunci);
          }

          static dariSen(sen) {
            if (!Number.isInteger(sen)) throw new TypeError('Sen harus bilangan bulat');
            return new Uang(sen, Uang.#kunci);
          }

          static dariBarisDb(baris) { return Uang.dariSen(baris.harga_sen); }

          static nol() { return Uang.dariSen(0); }

          get sen() { return this.#sen; }
        }
        `,
        { filename: 'src/uang.js' },
      ),
      code(
        'js',
        `
        Uang.dariRupiah(89000);        // jelas, satuannya disebut namanya
        Uang.dariSen(8900000);         // sama jelasnya, satuan berbeda
        Uang.dariBarisDb(baris);       // menyembunyikan nama kolom database
        Uang.nol();                    // lebih terbaca daripada Uang.dariSen(0)

        new Uang(8900000);
        // TypeError: Pakai Uang.dariRupiah() atau Uang.dariSen()
        `,
        { caption: 'Empat cara membuat, masing-masing dengan nama yang menjelaskan dirinya.' },
      ),
      p(
        'Empat method statis itu semuanya menghasilkan `Uang`, dan yang berbeda hanya bentuk masukannya. Keuntungan pertamanya keterbacaan, sebab `Uang.dariRupiah(89000)` tidak bisa disalahpahami sedangkan `new Uang(89000)` bisa. Keuntungan kedua lebih dalam, yaitu tiap pembuat bisa punya pemeriksaan sendiri yang sesuai bentuk masukannya. `dariRupiah` menerima pecahan lalu membulatkannya, sedangkan `dariSen` menolak pecahan sama sekali.',
      ),
      p(
        "Bagian `static #kunci = Symbol('uang')` adalah cara menutup constructor supaya benar-benar hanya bisa dipanggil dari dalam kelas ini. Nilai `Symbol` selalu unik dan tidak bisa ditebak, sehingga kode di luar tidak punya cara memberikan kunci yang benar. Ini teknik yang layak dipakai kalau memang penting semua pembuatan lewat pintu bernama, dan bisa dilewati kalau kesepakatan tim sudah cukup.",
      ),
      p(
        '`dariBarisDb` menunjukkan gunanya yang paling sering dilupakan, yaitu menyembunyikan bentuk data luar. Nama kolom `harga_sen` hanya disebut di satu tempat, sehingga kalau nanti kolomnya diganti nama, satu berkas yang disunting. Tanpa method itu, nama kolom database akan tersebar ke seluruh berkas yang membaca baris.',
      ),
      callout(
        'tip',
        'Cara membedakan method statis dari method biasa',
        'Method statis milik kelasnya, bukan milik object hasil kelas itu, jadi ia dipanggil dengan `Uang.dariRupiah(...)` bukan `sebuahUang.dariRupiah(...)`. Aturan praktisnya, kalau method itu belum butuh sebuah instance untuk bekerja, ia layak statis. Pembuat, pengurai, dan pembanding biasanya masuk kategori itu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Method statis menghasilkan beberapa kekeliruan yang khas, terutama seputar apa yang ada dan tidak ada di dalamnya.',
      ),
      code(
        'text',
        `
        const u = Uang.dariRupiah(1000);
        u.dariRupiah(2000);
          ^

        TypeError: u.dariRupiah is not a function
        `,
        { caption: 'Method statis dipanggil lewat instance.' },
      ),
      p(
        'Method statis disimpan pada kelasnya, bukan pada `prototype`, sehingga instance tidak menemukannya saat menelusuri rantai. Ini konsekuensi langsung dari materi Sub-bab 2.3, dan mengingat letaknya membuat error ini langsung jelas. Panggil lewat nama kelasnya, atau lewat `u.constructor.dariRupiah(...)` kalau kamu memang perlu memanggil versi milik kelas turunan.',
      ),
      code(
        'text',
        `
        class Uang {
          static bawaan() { return this.dariSen(0); }
        }
        const f = Uang.bawaan;
        f();
             ^

        TypeError: Cannot read properties of undefined (reading 'dariSen')
        `,
        { caption: '`this` di dalam method statis juga bisa lepas.' },
      ),
      p(
        'Di dalam method statis, `this` menunjuk kelasnya, dan itu berguna karena membuat method statis ikut bekerja untuk kelas turunan. Tapi ia tetap tunduk pada aturan `this` dari Sub-bab 2.4, yaitu ia lepas begitu methodnya dipisahkan dari kelasnya. Kalau kamu perlu memberikan method statis sebagai callback, bungkus dengan fungsi panah.',
      ),
      code(
        'text',
        `
        Uang.dariRupiah('89000');

        TypeError: Bukan angka, dapat 89000
        `,
        { caption: 'Masukan berupa teks ditolak oleh pemeriksaan di pembuat.' },
      ),
      p(
        'Pesan ini agak menjebak saat dibaca sepintas, sebab angka yang disebutnya terlihat benar. Yang salah adalah tipenya, dan tanda kutipnya hilang saat teks disisipkan ke pesan. Kalau kamu menulis pesan error yang menyebut nilai, pertimbangkan menyertakan tipenya juga, misalnya dengan `\${typeof rp}`, sebab nilai yang terlihat benar dengan tipe yang salah adalah kasus yang paling sering.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`u.metodeStatis is not a function`',
            'Method statis dipanggil lewat instance',
            'Panggil lewat nama kelasnya',
          ],
          [
            '`Cannot read properties of undefined` di dalam method statis',
            '`this` lepas karena methodnya dipisahkan dari kelasnya',
            'Bungkus dengan fungsi panah, atau sebut nama kelasnya langsung',
          ],
          [
            'Pesan error menyebut nilai yang terlihat benar',
            'Yang salah tipenya, bukan nilainya',
            'Sertakan `typeof` di pesan errornya',
          ],
          [
            'Field statis dibagi seluruh turunan tanpa disengaja',
            'Field statis milik kelas, dan turunan menelusuri ke induknya',
            'Deklarasikan ulang di turunan bila tiap turunan perlu nilainya sendiri',
          ],
          [
            'Method statis pembuat tidak bekerja untuk kelas turunan',
            'Nama kelas ditulis langsung alih-alih memakai `this`',
            'Pakai `new this(...)` di dalam method statis supaya turunan mendapat jenisnya sendiri',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Method statis mudah disalahgunakan menjadi tempat menaruh apa pun yang tidak jelas rumahnya. Beberapa baris di bawah adalah bentuk penyalahgunaan itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat kelas yang isinya hanya method statis',
            'Terlihat lebih rapi daripada sekumpulan fungsi lepas',
            'Itu modul yang ditulis dengan cara lebih panjang. Ekspor fungsinya langsung dari berkas, dan alat pembangun bisa membuang yang tidak dipakai',
          ],
          [
            'Menyimpan keadaan yang berubah di field statis',
            'Satu tempat yang mudah dijangkau dari mana saja',
            'Itu variabel global dengan nama lain. Nilainya dibagi seluruh aplikasi termasuk antar-test, sehingga test bisa saling mempengaruhi',
          ],
          [
            'Menulis `new Uang(...)` di dalam method statis kelas yang bisa diturunkan',
            'Nama kelasnya memang itu',
            'Kelas turunan akan mendapat instance kelas induk, bukan dirinya sendiri. Pakai `new this(...)`',
          ],
          [
            'Membuat method statis untuk hal yang butuh data instance',
            'Terasa seperti fungsi bantu yang berkaitan',
            'Ia jadi menerima instance sebagai parameter, dan itu tanda ia seharusnya method biasa',
          ],
          [
            'Memberi nama pembuat dengan awalan `get`',
            'Konsisten dengan penamaan lain',
            '`get` menyiratkan membaca sesuatu yang sudah ada, sedangkan pembuat menghasilkan yang baru. Pakai `dari`, `buat`, atau `parse`',
          ],
          [
            'Menaruh pemanggilan jaringan di method statis pembuat',
            'Sekalian mengambil datanya saat membuat',
            'Pembuat jadi asinkron dan mustahil dipakai di test tanpa jaringan. Pisahkan pengambilan data dari pembuatan object',
          ],
        ],
      ),
      p(
        'Baris kedua adalah yang paling berbahaya karena akibatnya baru terasa saat aplikasi sudah besar. Field statis yang berubah nilainya adalah variabel global yang disamarkan sebagai bagian kelas. Ia dibagi seluruh aplikasi, tidak ada yang tahu siapa mengubahnya kapan, dan di lingkungan test ia bertahan antar-berkas sehingga urutan test menentukan hasilnya. Kalau sebuah nilai harus dibagi, buat satu instance yang jelas pemiliknya dan berikan lewat parameter.',
      ),
      callout(
        'info',
        'Konstanta statis justru berguna',
        'Yang bermasalah adalah field statis yang **berubah**. Konstanta statis seperti `static MAKS_ITEM = 50` atau `static NOL = Uang.dariSen(0)` sangat berguna, sebab ia memberi nama pada nilai ajaib dan meletakkannya tepat di kelas yang memakainya.',
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
    23,
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
            'Cara cepat memilih antara keduanya dengan mengucapkan hubungannya keras-keras. Kalau **"X adalah Y"** terdengar benar, misalnya `ValidasiError` adalah `Error`, maka inheritance masuk akal. Kalau **"X punya Y"** yang benar, misalnya `Mobil` punya `Mesin`, maka pakai composition. Sederhana, tapi menyelesaikan sebagian besar perdebatan sebelum kodenya sempat ditulis.',
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
      p(
        'Ini bukan masalah buatan. `Manajer` dan `Programmer` sama-sama mewarisi dari `Karyawan`, tapi keduanya butuh kemampuan berbeda — lalu datang kasus yang butuh **keduanya sekaligus**. Karena JavaScript tidak mendukung multiple inheritance, `Manajer` tidak bisa sekaligus `extends Karyawan` dan `extends Programmer`. Hierarki tunggal seperti ini memaksa memilih satu dari tiga opsi buruk yang disebut di komentar, dan ketiganya sama-sama membuat kode makin sulit dirawat seiring bertambahnya kombinasi peran baru di kemudian hari.',
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
      p(
        'Setiap fungsi seperti `bisaBekerja`, `bisaMemimpin`, dan `bisaKoding` adalah **factory function** dari sub-bab sebelumnya, dan masing-masing berdiri sendiri lalu mengembalikan objek kecil berisi satu kemampuan saja. `buatManajerTeknis` merakit ketiganya jadi satu objek memakai spread `...`, yang menyalin seluruh property tiap objek kecil ke objek besar hasil akhirnya. Inilah yang disebut **mixin** di kotak istilah, sebab tidak ada hierarki class sama sekali, dan menambah kemampuan keempat besok cukup dengan menambah satu baris `...bisaSesuatu(nama)`, tanpa perlu mengubah `bisaBekerja`, `bisaMemimpin`, atau `bisaKoding` sedikit pun.',
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
      p(
        '`Mobil` di sini tidak mewarisi `Mesin` lewat `extends`, melainkan menyimpan sebuah instance `Mesin` di `#mesin`, lalu method `nyalakan()` miliknya sendiri sekadar **meneruskan** pemanggilan itu ke `#mesin.nyalakan()`. Inilah **delegasi**, sebab `Mobil` tidak *menjadi* mesin melainkan hanya *punya* mesin dan menyuruhnya bekerja. Bedanya penting secara praktis, karena kalau besok `Mobil` perlu berganti jenis mesin (misalnya ke `MesinListrik`), cukup mengubah apa yang disimpan di `#mesin`, tanpa menyentuh hierarki class apa pun.',
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
      p(
        'Prinsip yang sama dari `Mobil` dan `Mesin` berlaku di sini tanpa satu pun `class`. `Modal` tidak mewarisi `Header`, `Body`, atau `Footer`, melainkan **menyusun** ketiganya sebagai children yang dioper lewat JSX. `<Modal withHeader withFooter closable />` di komentar adalah versi "inheritance yang menyamar", yaitu tiga boolean prop yang menyalakan-matikan bagian, dan jumlahnya cenderung terus bertambah sampai komponennya sulit dipahami, persis pola **boolean prop** yang disebut di kotak istilah di atas. Menyusun `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>` sebagai children memberi fleksibilitas yang sama seperti mixin, sebab bagian mana pun bisa disertakan, dilewati, atau disusun ulang tanpa mengubah `Modal` itu sendiri.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi berisi beberapa jenis dokumen, yaitu faktur, penawaran, dan surat jalan. Awalnya faktur butuh disimpan dan dicetak, jadi lahir `Dokumen` yang bisa menyimpan, lalu `DokumenCetak extends Dokumen`, lalu `Faktur extends DokumenCetak`. Enam bulan kemudian penawaran butuh dicetak tapi tidak butuh nomor urut resmi, surat jalan butuh nomor urut tapi tidak pernah dicetak, dan ada dokumen internal yang butuh ditandatangani digital tapi tidak keduanya.',
      ),
      p(
        'Di titik ini rantai pewarisan berhenti bisa mewakili kenyataan. Kemampuan seperti bisa dicetak, punya nomor urut, dan bisa ditandatangani datang dalam kombinasi yang tidak membentuk satu garis lurus, sedangkan pewarisan hanya bisa membentuk garis. Setiap kombinasi baru memaksa lahirnya satu kelas perantara.',
      ),
      compare(
        {
          title: 'Rantai pewarisan yang tidak bisa mengikuti',
          lang: 'text',
          code: `
          Dokumen
            └─ DokumenCetak
                 └─ DokumenBernomor
                      └─ Faktur

          Lalu datang:
          - Penawaran   -> cetak, TANPA nomor
          - SuratJalan   -> nomor, TANPA cetak
          - Memo         -> tanda tangan saja

          Tiga kombinasi baru
          -> butuh tiga kelas perantara lagi
          -> dan itu belum termasuk kombinasi berikutnya
          `,
          notes: ['Jumlah kelas tumbuh mengikuti jumlah kombinasi, bukan jumlah kemampuan'],
        },
        {
          title: 'Kemampuan sebagai bagian yang dirakit',
          lang: 'text',
          code: `
          Dokumen  (data + identitas)
            ├─ punya PencetakPdf?
            ├─ punya PemberiNomor?
            └─ punya PenandaTangan?

          Faktur      = Dokumen + cetak + nomor
          Penawaran   = Dokumen + cetak
          SuratJalan  = Dokumen + nomor
          Memo        = Dokumen + tanda tangan

          Kombinasi baru
          -> tidak butuh kelas baru sama sekali
          `,
          notes: ['Jumlah bagian tumbuh mengikuti jumlah kemampuan, bukan kombinasinya'],
        },
      ),
      code(
        'js',
        `
        // Tiap kemampuan berdiri sendiri dan bisa diuji sendiri.
        class PencetakPdf {
          async cetak(dokumen) { return renderPdf(dokumen.isi); }
        }

        class PemberiNomor {
          constructor(awalan) { this.awalan = awalan; }
          async berikutnya() { return \`\${this.awalan}-\${await ambilUrutan(this.awalan)}\`; }
        }

        class Dokumen {
          // Kemampuannya DIBERIKAN, bukan diwarisi.
          constructor({ isi, pencetak = null, penomor = null }) {
            this.isi = isi;
            this.pencetak = pencetak;
            this.penomor = penomor;
          }

          async cetak() {
            if (!this.pencetak) throw new Error('Dokumen ini tidak untuk dicetak');
            return this.pencetak.cetak(this);
          }

          async beriNomor() {
            if (!this.penomor) throw new Error('Dokumen ini tidak bernomor');
            this.nomor = await this.penomor.berikutnya();
          }
        }

        const faktur = new Dokumen({
          isi, pencetak: new PencetakPdf(), penomor: new PemberiNomor('INV'),
        });
        const penawaran = new Dokumen({ isi, pencetak: new PencetakPdf() });
        `,
        { filename: 'src/dokumen.js' },
      ),
      p(
        'Yang berubah bukan jumlah kode melainkan **arah ketergantungannya**. Pada versi pewarisan, `Faktur` terikat pada seluruh rantai di atasnya dan tidak bisa memilih. Pada versi komposisi, `Dokumen` hanya tahu bahwa ia mungkin punya pencetak dan mungkin punya penomor, dan yang memutuskan adalah tempat pembuatannya. Kombinasi baru tidak menambah satu kelas pun.',
      ),
      p(
        'Keuntungan besar kedua muncul di pengujian. `PencetakPdf` bisa diuji sendiri tanpa dokumen, dan `Dokumen` bisa diuji dengan pencetak tiruan yang hanya mencatat bahwa ia dipanggil. Pada versi pewarisan, menguji faktur berarti ikut menjalankan seluruh rantai induknya, termasuk bagian yang tidak ada hubungannya dengan yang sedang diuji.',
      ),
      p(
        'Perhatikan `pencetak = null` sebagai nilai bawaan dan pemeriksaan di dalam `cetak`. Ini pilihan yang disengaja, yaitu dokumen tanpa kemampuan cetak menolak dengan pesan yang jelas alih-alih diam. Alternatifnya menyediakan pencetak kosong yang tidak melakukan apa-apa, dan itu lebih cocok kalau tidak mencetak memang perilaku yang sah. Pilih sesuai apakah ketiadaan kemampuan itu kesalahan atau bukan.',
      ),
      callout(
        'tip',
        'Tanda paling jelas bahwa pewarisan sudah harus diganti',
        'Kalau kamu mulai membuat kelas yang namanya menggabungkan dua kemampuan, seperti `DokumenCetakBernomor`, itu bukan penamaan yang buruk melainkan gejala bahwa strukturnya sudah tidak muat. Nama seperti itu lahir karena pewarisan memaksa kombinasi menjadi kelas.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Komposisi memindahkan kesalahan dari waktu penulisan ke waktu perakitan, dan tiga bentuk di bawah adalah wajah barunya.',
      ),
      code(
        'text',
        `
        await penawaran.beriNomor();

        Error: Dokumen ini tidak bernomor
        `,
        { caption: 'Kemampuan yang tidak dirakit dipanggil.' },
      ),
      p(
        'Inilah harga yang dibayar komposisi. Pada pewarisan, kelas yang tidak punya kemampuan itu memang tidak punya methodnya sehingga kesalahannya berupa `is not a function`. Pada komposisi, methodnya selalu ada dan yang tidak ada adalah bagiannya. Pesan yang kamu tulis sendiri jauh lebih menolong daripada `Cannot read properties of null`, jadi pemeriksaan eksplisit seperti di atas layak ditulis untuk tiap kemampuan opsional.',
      ),
      code(
        'text',
        `
        const d = new Dokumen({ isi });
        await d.cetak();
                 ^

        TypeError: Cannot read properties of null (reading 'cetak')
        `,
        { caption: 'Pemeriksaan lupa ditulis, dan pesannya jadi tidak menjelaskan apa pun.' },
      ),
      p(
        'Bandingkan pesan ini dengan yang sebelumnya. Keduanya menandakan hal yang sama persis, tapi yang ini memaksa pembacanya membuka kode untuk tahu apa yang kosong dan kenapa. Setiap kemampuan opsional layak punya penjaga dengan pesan yang menyebut nama kemampuannya, dan itu satu baris yang menghemat banyak waktu.',
      ),
      code(
        'text',
        `
        const bersama = new PemberiNomor('INV');
        const a = new Dokumen({ isi: i1, penomor: bersama });
        const b = new Dokumen({ isi: i2, penomor: bersama });

        // Keduanya memakai penomor yang SAMA.
        // Kalau PemberiNomor menyimpan penghitung di dalam dirinya,
        // nomor dokumen b terpengaruh oleh dokumen a.
        `,
        { caption: 'Bagian yang menyimpan keadaan dipakai bersama tanpa disadari.' },
      ),
      p(
        'Ini kesalahan yang khas komposisi dan tidak ada padanannya di pewarisan. Object yang diberikan sebagai bagian adalah rujukan, jadi memberikan satu object ke dua pemilik berarti keduanya berbagi keadaannya. Kadang itu memang yang kamu inginkan, misalnya satu pencetak dipakai bersama karena ia tidak menyimpan apa pun. Kadang justru bug. Aturan praktisnya, bagian yang tidak menyimpan keadaan boleh dibagi, dan bagian yang menyimpan keadaan dibuat satu per pemilik.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Dokumen ini tidak bernomor`',
            'Kemampuan opsional dipanggil padahal tidak dirakit',
            'Rakit kemampuannya, atau periksa keberadaannya sebelum memanggil',
          ],
          [
            "`Cannot read properties of null (reading 'cetak')`",
            'Penjaga untuk kemampuan opsional tidak ditulis',
            'Tambahkan pemeriksaan yang melempar pesan bernama',
          ],
          [
            'Dua object saling mempengaruhi tanpa hubungan yang jelas',
            'Bagian yang menyimpan keadaan dipakai bersama',
            'Buat bagian itu satu per pemilik',
          ],
          [
            'Constructor menerima delapan bagian sekaligus',
            'Terlalu banyak kemampuan ditumpuk ke satu kelas',
            'Itu tanda kelasnya punya lebih dari satu tanggung jawab, pecah menjadi beberapa',
          ],
          [
            'Sulit tahu kemampuan apa yang dimiliki sebuah object',
            'Kemampuannya ditentukan saat perakitan, bukan dari namanya',
            'Sediakan fungsi pembuat bernama seperti `buatFaktur()` yang merakit kombinasi bakunya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Komposisi sering diterima sebagai aturan lalu diterapkan tanpa melihat kasusnya. Beberapa baris di bawah adalah bentuk penerapan yang justru merugikan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuang pewarisan sama sekali karena membaca bahwa komposisi lebih baik',
            'Nasihatnya memang berbunyi begitu',
            'Untuk hubungan yang benar-benar adalah sejenis dengan alur bersama, pewarisan satu tingkat lebih sederhana. Nasihatnya menentang pewarisan yang dalam, bukan pewarisan itu sendiri',
          ],
          [
            'Memecah setiap fungsi kecil menjadi kelas bagiannya sendiri',
            'Semakin banyak bagian semakin fleksibel',
            'Merakit sepuluh bagian untuk membuat satu object membuat kode pemakainya jauh lebih sulit dibaca. Bagi berdasarkan alasan berubahnya, bukan berdasarkan ukuran',
          ],
          [
            'Menyimpan bagian sebagai properti publik',
            'Supaya pemakainya bisa mengaturnya kapan saja',
            'Siapa pun bisa menukar bagian di tengah jalan, dan objectnya berhenti bisa diprediksi. Terima di constructor lalu simpan sebagai field privat',
          ],
          [
            'Meneruskan setiap method bagian lewat method pembungkus',
            'Supaya pemakainya tidak perlu tahu bagiannya',
            'Kalau seluruh method hanya meneruskan, kelas pembungkusnya tidak menambah apa pun. Sediakan bagiannya langsung, atau bungkus hanya yang memang menambah aturan',
          ],
          [
            'Membuat bagian yang saling membutuhkan',
            'Keduanya memang bekerja bersama',
            'Itu mengembalikan keterikatan yang ingin dihindari, dan bisa berujung impor melingkar. Bagian sebaiknya tidak saling kenal, dan yang menghubungkan adalah pemiliknya',
          ],
          [
            'Merakit bagian di banyak tempat berbeda',
            'Tiap tempat tahu kebutuhannya sendiri',
            'Kombinasi yang seharusnya sama jadi berbeda di tiap tempat. Sediakan satu fungsi pembuat per kombinasi baku',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan karena nasihat pilih komposisi sering dibaca terlalu keras. Contoh `Notifikasi` di Sub-bab 2.7 memakai pewarisan dan memang tepat, sebab ketiga jenisnya benar-benar sejenis dan berbagi satu alur yang sama. Yang jadi masalah adalah rantai yang dalam dan pewarisan yang dipakai hanya untuk berbagi kode. Satu tingkat dengan hubungan adalah sejenis yang jelas hampir selalu aman.',
      ),
      callout(
        'tip',
        'Uji penghapusan untuk memutuskan sebuah bagian layak ada',
        'Bayangkan bagian itu dihapus dan isinya dipindahkan ke pemiliknya. Kalau kerumitannya hilang, bagian itu memang tidak perlu ada. Kalau kerumitannya justru menyebar ke banyak tempat, bagian itu memang menanggung beban dan layak dipertahankan.',
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
    23,
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
            'Dari *dependency*, artinya **sesuatu yang dibutuhkan** sebuah bagian kode agar bisa bekerja — sebuah library, sebuah layanan jaringan, atau sekadar fungsi lain. Ia menjadi masalah ketika diambil diam-diam dari dalam, karena saat itulah ia tidak bisa diganti dari luar.',
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
      p(
        'Versi SALAH memaksa fungsi `ekspor` diedit setiap kali format baru ditambahkan, persis pola rantai `if` yang sudah dibahas di sub-bab Polymorphism. Versi BENAR memindahkan pemetaan format-ke-fungsi menjadi sebuah objek biasa bernama `eksporter`, sehingga menambah format `xml` cukup dengan menambah satu entri baru ke objek itu, dan baris `function ekspor(data, format) { ... }` tidak pernah disentuh lagi. Bandingkan dengan solusi Polymorphism sebelumnya yang memakai class dan `metode.proses()`, karena masalah yang sama di sini diselesaikan memakai objek dan fungsi biasa, dan itu bukti bahwa Open/Closed bukan milik OOP semata.',
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
      p(
        'Contoh `Pinguin extends Burung` ini bentuk singkat dari kasus yang sudah dibahas tuntas di sub-bab Inheritance: kode yang menerima `Burung` lalu memanggil `.terbang()` akan bekerja untuk sebagian turunan tetapi meledak untuk `Pinguin`, padahal keduanya sama-sama lolos `instanceof Burung`. Prinsip Liskov memberi nama formal untuk masalah itu, dan solusinya tetap sama seperti yang sudah kamu pelajari, yaitu composition alih-alih hierarki yang dipaksakan.',
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
      p(
        "`LayananPengguna` mengambil sendiri `fetch` dari dalam method `simpan()`, sehingga kalau kamu ingin mengujinya tanpa jaringan sungguhan, satu-satunya cara adalah menambal (*mock*) `fetch` global yang memengaruhi seluruh berkas test. `LayananPengguna2` membalik arah kebergantungan itu, karena `#repo` **diserahkan dari luar** lewat constructor alih-alih diambil sendiri dari dalam. Di produksi ia menerima `repoAPI` yang sungguhan memanggil jaringan, sedangkan di test ia menerima objek sederhana `{ simpan: async () => 'ok' }` yang sama sekali tidak menyentuh jaringan. Class-nya sendiri tidak tahu dan tidak peduli mana yang sedang dipakai, dan itulah **Dependency Inversion**, yaitu bagian penting bergantung pada kemampuan yang diserahkan dari luar alih-alih implementasi konkret yang ia ambil sendiri.",
      ),

      h2('Kapan SOLID justru berlebihan'),
      callout(
        'warning',
        'Prinsip adalah obat, bukan vitamin',
        'Menerapkan kelimanya pada skrip 50 baris menghasilkan lima berkas dan satu lapisan abstraksi untuk pemanggil yang belum ada. `code-style.md` melarang itu terang-terangan: **jangan membangun abstraksi untuk pemanggil yang belum eksis.** Terapkan saat rasa sakitnya sudah terasa — biasanya pada perubahan kedua atau ketiga di tempat yang sama.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Fungsi pembuatan pesanan di aplikasi tokomu panjangnya seratus lima puluh baris. Isinya memvalidasi keranjang, menghitung total, memotong stok, menyimpan ke database, mengirim email, dan mencatat ke sistem analitik. Semuanya bekerja. Masalahnya baru terasa saat ada tiga permintaan berbeda datang dalam satu bulan, yaitu ganti penyedia email, tambahkan pesanan yang dibuat admin tanpa email, dan tulis test untuk perhitungan totalnya.',
      ),
      p(
        'Ketiganya menyentuh fungsi yang sama, dan ketiganya berisiko merusak bagian yang tidak ada hubungannya. Test untuk perhitungan total pun mustahil ditulis tanpa mengirim email sungguhan. Dua prinsip pertama SOLID menjelaskan kenapa, dan perbaikannya tidak menambah kerumitan melainkan memindahkannya.',
      ),
      code(
        'js',
        `
        // SEBELUM: satu fungsi tahu segalanya dan bergantung pada segalanya.
        import { kirimEmailSendgrid } from './sendgrid.js';
        import { db } from './db.js';

        export async function buatPesanan(keranjang, pengguna) {
          if (keranjang.item.length === 0) throw new Error('Keranjang kosong');

          let total = 0;
          for (const i of keranjang.item) total += i.harga * i.jumlah;
          if (pengguna.tingkat === 'emas') total = Math.round(total * 0.95);

          for (const i of keranjang.item) {
            await db.query('UPDATE produk SET stok = stok - $1 WHERE id = $2', [i.jumlah, i.id]);
          }
          const pesanan = await db.query('INSERT INTO pesanan ...');

          await kirimEmailSendgrid(pengguna.email, 'Pesanan diterima', \`Total \${total}\`);
          await analitik.catat('pesanan_dibuat', { total });

          return pesanan;
        }
        `,
        { filename: 'src/pesanan.js — sebelum' },
      ),
      p(
        'Fungsi ini melanggar dua prinsip sekaligus, dan keduanya bisa dilihat langsung dari kodenya. Ia punya lebih dari satu alasan untuk berubah, yaitu aturan diskon berubah, skema database berubah, atau penyedia email berganti. Itu pelanggaran tanggung jawab tunggal. Ia juga menyebut `kirimEmailSendgrid` secara langsung di baris impor, sehingga ia terikat pada satu penyedia tertentu. Itu pelanggaran pembalikan ketergantungan.',
      ),
      code(
        'js',
        `
        // SESUDAH: perhitungan dipisah, dan yang di luar diberikan dari luar.

        // 1. Fungsi murni. Tidak menyentuh database, tidak mengirim apa pun.
        export function hitungTotal(item, tingkat) {
          if (item.length === 0) throw new Error('Keranjang kosong');
          const subtotal = item.reduce((j, i) => j + i.harga * i.jumlah, 0);
          return tingkat === 'emas' ? Math.round(subtotal * 0.95) : subtotal;
        }

        // 2. Yang bergantung pada dunia luar DITERIMA, bukan diimpor.
        export function buatLayananPesanan({ repo, pengirim, pencatat }) {
          return {
            async buat(keranjang, pengguna) {
              const total = hitungTotal(keranjang.item, pengguna.tingkat);

              const pesanan = await repo.simpan({ keranjang, pengguna, total });

              await pengirim.kirim(pengguna.email, 'Pesanan diterima', \`Total \${total}\`);
              await pencatat.catat('pesanan_dibuat', { total });

              return pesanan;
            },
          };
        }
        `,
        { filename: 'src/pesanan.js — sesudah' },
      ),
      p(
        'Perubahan pertama memisahkan `hitungTotal` menjadi fungsi murni. Ia menerima dua nilai dan mengembalikan satu angka, tanpa menyentuh apa pun di luar. Menguji seluruh aturan diskon kini cukup memanggilnya dengan berbagai masukan, tanpa database dan tanpa email. Ini persis alasan pemisahan fungsi murni yang dibahas di Bab 1, muncul kembali sebagai keputusan arsitektur.',
      ),
      p(
        'Perubahan kedua mengubah arah ketergantungan. `buatLayananPesanan` tidak lagi menyebut Sendgrid, PostgreSQL, atau penyedia analitik mana pun. Ia hanya tahu bahwa ia diberi sesuatu yang punya `simpan`, sesuatu yang punya `kirim`, dan sesuatu yang punya `catat`. Mengganti penyedia email berarti memberikan object lain saat merakit, dan satu baris pun di berkas ini tidak berubah.',
      ),
      code(
        'js',
        `
        // Di titik masuk aplikasi, barulah penyedia sungguhan dipilih.
        const layanan = buatLayananPesanan({
          repo: new RepoPesananPostgres(db),
          pengirim: new PengirimSendgrid(kunci),
          pencatat: new PencatatAnalitik(),
        });

        // Di test, tiruan yang sederhana sudah cukup.
        const terkirim = [];
        const layananUji = buatLayananPesanan({
          repo: { simpan: async (x) => ({ id: 1, ...x }) },
          pengirim: { kirim: async (...a) => terkirim.push(a) },
          pencatat: { catat: async () => {} },
        });
        `,
        { caption: 'Perakitan terjadi di satu tempat, dan test merakit versinya sendiri.' },
      ),
      p(
        'Bagian test itu yang paling langsung membuktikan nilai perubahannya. Tiruan yang diberikan hanyalah object literal berisi fungsi, tanpa library apa pun, sebab yang dibutuhkan hanya kesamaan bentuk seperti dibahas di Sub-bab 2.8. Test bisa memeriksa bahwa email dikirim dengan isi yang benar tanpa satu pun email sungguhan terkirim.',
      ),
      callout(
        'info',
        'Prinsip lain menyusul dengan sendirinya',
        'Setelah tanggung jawab dipisah dan ketergantungan dibalik, tiga prinsip sisanya jadi jauh lebih mudah dipenuhi. Menambah penyedia email baru tidak menyunting kode lama, itu terbuka untuk perluasan. Tiap pengirim bisa dipakai di tempat pengirim lain dipakai, itu substitusi. Dan kontrak `pengirim` hanya berisi `kirim`, itu antarmuka yang tidak memaksa pemakainya bergantung pada hal yang tidak ia butuhkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pelanggaran prinsip jarang melempar error. Yang muncul adalah gejala saat kode diubah atau diuji, dan tiga bentuk di bawah adalah yang paling sering ditemui.',
      ),
      code(
        'text',
        `
        npm test

        Error: Sendgrid API key tidak ditemukan
            at kirimEmailSendgrid (src/sendgrid.js:4:11)
            at buatPesanan (src/pesanan.js:18:9)
            at Object.<anonymous> (src/pesanan.test.js:6:3)
        `,
        { caption: 'Test untuk perhitungan total ikut memanggil penyedia email sungguhan.' },
      ),
      p(
        'Jejak tumpukan ini adalah bukti pelanggaran yang paling langsung. Test yang niatnya memeriksa satu perhitungan ternyata menyentuh jaringan, dan itu hanya mungkin kalau perhitungannya tidak bisa dipanggil tanpa segala hal lain di sekitarnya. Kalau kamu perlu memasang variabel lingkungan supaya test perhitungan bisa jalan, itu tanda pemisahan tanggung jawabnya belum ada.',
      ),
      code(
        'text',
        `
        const layanan = buatLayananPesanan({ repo, pengirim });
        await layanan.buat(keranjang, pengguna);
                                            ^

        TypeError: Cannot read properties of undefined (reading 'catat')
        `,
        { caption: 'Satu bagian lupa diberikan saat perakitan.' },
      ),
      p(
        'Ini kelemahan nyata dari pembalikan ketergantungan, yaitu kesalahan berpindah dari waktu impor ke waktu perakitan. Ada dua cara menutupnya. Yang paling sederhana adalah memeriksa di awal fungsi pembuat dan melempar pesan yang menyebut bagian mana yang kurang. Yang lebih kuat adalah memakai TypeScript, sehingga bagian yang kurang menjadi error sebelum kode dijalankan.',
      ),
      code(
        'text',
        `
        // Mengganti penyedia email seharusnya satu berkas.
        $ grep -rl "kirimEmailSendgrid" src/

        src/pesanan.js
        src/pendaftaran.js
        src/reset-sandi.js
        src/pengingat.js
        src/laporan-bulanan.js
        `,
        { caption: 'Satu penyedia disebut langsung di lima berkas.' },
      ),
      p(
        'Perintah `grep` di atas adalah cara termurah mengukur seberapa terikat kodemu pada satu hal. Kalau nama penyedia muncul di lima berkas, mengganti penyedia berarti menyunting lima berkas dan menguji lima alur. Kalau ia hanya muncul di satu berkas perakitan, penggantiannya satu baris. Angka dari `grep` ini layak dipakai sebagai ukuran sebelum dan sesudah refactor.',
      ),
      table(
        ['Gejala', 'Prinsip yang dilanggar', 'Perbaikannya'],
        [
          [
            'Test butuh database atau jaringan untuk memeriksa perhitungan',
            'Tanggung jawab tunggal',
            'Pisahkan perhitungannya menjadi fungsi murni',
          ],
          [
            'Satu berkas berubah karena tiga alasan yang tidak berhubungan',
            'Tanggung jawab tunggal',
            'Pecah berdasarkan alasan berubahnya, bukan berdasarkan ukuran',
          ],
          [
            'Nama penyedia muncul di banyak berkas',
            'Pembalikan ketergantungan',
            'Terima lewat parameter, dan pilih penyedianya di satu titik perakitan',
          ],
          [
            'Menambah satu jenis baru memaksa menyunting `switch` yang sudah ada',
            'Terbuka untuk perluasan',
            'Ubah percabangan menjadi method yang ditulis ulang, lihat Sub-bab 2.8',
          ],
          [
            'Sebuah turunan melempar error pada method yang diwarisi',
            'Substitusi Liskov',
            'Turunan itu bukan jenis dari induknya, pisahkan atau pakai komposisi',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'SOLID paling sering merugikan bukan karena diabaikan melainkan karena diterapkan terlalu dini dan terlalu harfiah. Empat baris pertama di bawah adalah bentuk itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memecah tiap fungsi menjadi kelasnya sendiri demi tanggung jawab tunggal',
            'Tiap kelas jadi punya satu tugas',
            'Tanggung jawab tunggal berbicara tentang satu alasan untuk berubah, bukan satu fungsi. Puluhan kelas satu method membuat alur mustahil diikuti',
          ],
          [
            'Membuat antarmuka dan lapisan abstraksi untuk semua hal sejak awal',
            'Supaya nanti mudah diganti',
            'Sebagian besar hal itu tidak pernah diganti, dan lapisannya harus dibaca selamanya. Balik ketergantungan pada hal yang memang berbatas dengan dunia luar',
          ],
          [
            'Menambahkan lapisan repositori di atas satu tabel dengan tiga query',
            'Itu yang dianjurkan arsitektur berlapis',
            'Untuk kasus sekecil itu, lapisannya hanya meneruskan. Tambahkan saat sudah ada alasan nyata, misalnya kebutuhan menguji tanpa database',
          ],
          [
            'Mengejar kelima huruf SOLID sebagai daftar centang',
            'Semakin banyak yang dipenuhi semakin baik',
            'Kelimanya adalah alat untuk mengurangi biaya perubahan. Kalau penerapannya justru menambah biaya membaca, ia sedang dipakai di tempat yang salah',
          ],
          [
            'Menaruh seluruh perakitan di berkas yang mengimpor hampir semuanya',
            'Memang harus ada satu tempat yang tahu semuanya',
            'Itu benar, tapi berkas itu harus hanya merakit dan tidak berisi logika. Begitu ia mulai memutuskan sesuatu, ia menjadi titik pusat yang selalu bentrok',
          ],
          [
            'Menyalin struktur berlapis dari project besar ke project kecil',
            'Struktur itu terbukti bekerja',
            'Struktur itu menyelesaikan masalah yang belum kamu punya. Mulai sederhana, dan tambahkan lapisan saat rasa sakitnya sudah nyata',
          ],
        ],
      ),
      p(
        'Baris keempat adalah cara paling sehat membaca seluruh sub-bab ini. Kelima prinsip itu bukan tujuan melainkan alat untuk membuat perubahan berikutnya lebih murah. Ukurannya konkret, yaitu berapa banyak berkas yang harus disunting untuk satu permintaan yang wajar, dan apakah satu bagian bisa diuji tanpa menyalakan seluruh aplikasi. Kalau kedua jawabannya sudah baik, kodenya sudah cukup baik tanpa perlu ditambah lapisan.',
      ),
      callout(
        'tip',
        'Terapkan saat rasa sakitnya muncul, bukan sebelum',
        'Cara paling andal memakai prinsip ini adalah menunggu sampai ada permintaan perubahan nyata yang terasa mahal, lalu bertanya prinsip mana yang sedang dilanggar. Refactor yang lahir dari rasa sakit nyata hampir selalu tepat sasaran, sedangkan refactor yang lahir dari bacaan sering menyelesaikan masalah yang tidak ada.',
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
    27,
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
            'Method dengan nama khusus yang **dicari otomatis oleh `JSON.stringify()`**. Kalau sebuah objek punya method ini, `stringify` memakai return value-nya alih-alih membaca property objeknya langsung. Di sini ia wajib ada, karena private field `#judul` tidak pernah ikut ter-serialize dengan sendirinya.',
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
      p(
        "Bandingkan class ini dengan fungsi `buatTugas` dari Bab 1, karena datanya sama persis dan yang berubah hanya cara menjaganya. Ketiga field dibuat privat, sehingga satu-satunya jalan mengubah `#selesai` adalah lewat `toggle()`, dan satu-satunya jalan mengubah `#judul` adalah lewat `ubahJudul()` yang mengulang validasi yang sama seperti di constructor. Ketiga getter membuka data itu untuk **dibaca** tanpa membuka jalan untuk ditulis, dan itu perbedaan yang mustahil dicapai dengan property biasa. Perhatikan `return this` di akhir `toggle` dan `ubahJudul`, karena ia memungkinkan pemanggilan dirangkai seperti `tugas.toggle().ubahJudul('Baru')`. Yang terakhir, `toJSON` ada karena alasan yang sudah disinggung di sub-bab encapsulation, yaitu field privat tidak ikut ter-*serialize* sehingga tanpa method ini `JSON.stringify(tugas)` akan menghasilkan `{}` kosong. Ada satu perbedaan penting yang perlu disadari sejak sekarang. Berbeda dari versi Bab 1, `toggle()` **mengubah objeknya sendiri** alih-alih menghasilkan objek baru.",
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
      p(
        'Perhatikan beberapa keputusan kecil yang menentukan di `Tugas`. Constructor memvalidasi `judul` **sebelum** mengisi apa pun, sehingga tidak mungkin ada instance `Tugas` dengan judul kosong, dan aturan itu dijaga tipe itu sendiri alih-alih oleh disiplin setiap pemanggil. `toggle()` dan `ubahJudul()` sama-sama diakhiri `return this;` sehingga pemanggilannya bisa dirangkai seperti `tugas.toggle().ubahJudul(\'Judul baru\')`, dan inilah **method chaining** yang disebut di kotak istilah. Di `DaftarTugas`, `hapus()` memakai `findIndex` untuk mencari posisi tugasnya lebih dulu alih-alih langsung `filter`, karena `splice` butuh **posisi** dan bukan nilainya. `findIndex` juga mengembalikan `-1` yang eksplisit kalau tidak ketemu, sehingga `hapus()` bisa membedakan "berhasil dihapus" dari "id tidak ada" lewat return value boolean-nya.',
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
      p(
        '`buatTugasLengkap` merakit sebuah `Tugas` dasar dengan kemampuan tambahan secara **kondisional** — kalau `tenggat` tidak diberikan, `bisaBertenggat(tenggat)` tidak pernah dipanggil, dan `Object.assign` menerima objek kosong `{}` yang tidak menambah apa pun. Ini composition yang sama seperti sub-bab sebelumnya, hanya kali ini kemampuannya dicampurkan ke **instance yang sudah jadi** (`dasar`) memakai `Object.assign`, bukan dirakit dari nol lewat spread di dalam satu factory function. Komentar di baris atas menjelaskan alasan menghindari `extends` di sini: begitu muncul kombinasi kedua (tenggat **dan** prioritas, lalu nanti kebutuhan lain lagi), inheritance tunggal JavaScript langsung mentok di masalah yang sama seperti `Manajer`/`Programmer` di sub-bab Composition over Inheritance.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Logika todo dari Bab 1 sudah dipakai di dua tempat, yaitu di halaman utama dan di widget kecil pada bilah sisi. Sekarang datang tiga permintaan sekaligus. Datanya harus tersimpan supaya tidak hilang saat halaman ditutup, harus bisa disaring per label, dan nanti akan dipindahkan ke server. Permintaan ketiga itu yang menentukan bentuk refactornya, sebab ia berarti tempat penyimpanan harus bisa diganti tanpa menyentuh logikanya.',
      ),
      code(
        'js',
        `
        // 1. Satu tugas sebagai value object. Aturannya dijaga di sini.
        export class Tugas {
          #selesai;

          constructor({ id = crypto.randomUUID(), judul, label = [], selesai = false }) {
            const bersih = judul?.trim() ?? '';
            if (bersih.length === 0) throw new RangeError('Judul tugas tidak boleh kosong');
            if (bersih.length > 200) throw new RangeError('Judul maksimal 200 karakter');

            this.id = id;
            this.judul = bersih;
            this.label = [...label];
            this.#selesai = selesai;
          }

          get selesai() { return this.#selesai; }

          // Mengembalikan Tugas BARU, tidak mengubah yang lama.
          dengan(perubahan) {
            return new Tugas({ ...this.toJSON(), ...perubahan });
          }

          toJSON() {
            return { id: this.id, judul: this.judul, label: this.label, selesai: this.#selesai };
          }
        }
        `,
        { filename: 'src/todo/tugas.js' },
      ),
      code(
        'js',
        `
        // 2. Logikanya. Tidak tahu apa pun tentang localStorage maupun server.
        export class DaftarTugas {
          #tugas;

          constructor(tugas = []) { this.#tugas = tugas; }

          get semua() { return [...this.#tugas]; }

          tambah(data) { return new DaftarTugas([...this.#tugas, new Tugas(data)]); }

          ubah(id, perubahan) {
            return new DaftarTugas(
              this.#tugas.map((t) => (t.id === id ? t.dengan(perubahan) : t)),
            );
          }

          hapusSelesai() {
            return new DaftarTugas(this.#tugas.filter((t) => !t.selesai));
          }

          saring({ label = null, selesai = null } = {}) {
            return this.#tugas.filter(
              (t) =>
                (label === null || t.label.includes(label)) &&
                (selesai === null || t.selesai === selesai),
            );
          }

          get ringkasan() {
            const selesai = this.#tugas.filter((t) => t.selesai).length;
            return { total: this.#tugas.length, selesai, aktif: this.#tugas.length - selesai };
          }
        }
        `,
        { filename: 'src/todo/daftar.js' },
      ),
      code(
        'js',
        `
        // 3. Penyimpanan. Bentuknya sama, isinya bisa apa saja.
        export class PenyimpanLokal {
          constructor(kunci = 'todo') { this.kunci = kunci; }
          async muat() {
            try {
              const teks = localStorage.getItem(this.kunci);
              return new DaftarTugas((JSON.parse(teks) ?? []).map((d) => new Tugas(d)));
            } catch {
              return new DaftarTugas();   // isi rusak diperlakukan seperti kosong
            }
          }
          async simpan(daftar) {
            localStorage.setItem(this.kunci, JSON.stringify(daftar.semua));
          }
        }

        export class PenyimpanApi {
          constructor(klien) { this.klien = klien; }
          async muat() {
            const data = await this.klien.ambil('/tugas');
            return new DaftarTugas(data.map((d) => new Tugas(d)));
          }
          async simpan(daftar) { await this.klien.kirim('/tugas', daftar.semua); }
        }
        `,
        { filename: 'src/todo/penyimpan.js' },
      ),
      p(
        'Tiga berkas ini memakai hampir seluruh materi bab. `Tugas` adalah value object dari Sub-bab 2.5 lengkap dengan enkapsulasi dari Sub-bab 2.6, dan aturan judulnya dijaga di constructor sehingga tidak mungkin ada tugas berjudul kosong di mana pun. `DaftarTugas` menyimpan koleksinya dan setiap methodnya mengembalikan daftar baru, sehingga fitur urungkan dari Bab 1 tetap mungkin. Dua kelas penyimpan punya bentuk yang sama persis, dan itu polimorfisme dari Sub-bab 2.8 tanpa satu pun `extends`.',
      ),
      p(
        'Method `dengan` pada `Tugas` layak diperhatikan. Ia membuat tugas baru dari gabungan isi lama dan perubahan, dan ia memakai `toJSON()` untuk membaca isinya sendiri karena `#selesai` privat. Pola ini menghindari lahirnya sekumpulan method seperti `tandaiSelesai`, `ubahJudul`, dan `tambahLabel` yang isinya hampir sama. Yang tetap dijaga adalah seluruh perubahan lewat constructor, sehingga aturan judul berlaku juga saat diubah bukan hanya saat dibuat.',
      ),
      p(
        'Blok `catch` kosong pada `PenyimpanLokal.muat` adalah satu-satunya `catch` kosong yang boleh, dan alasannya perlu ditulis. Isi penyimpanan bisa rusak karena versi lama aplikasi, karena pengguna menyuntingnya sendiri, atau karena penyimpanan penuh. Untuk daftar tugas, memperlakukan isi rusak sebagai daftar kosong lebih baik daripada halaman yang gagal dimuat. Kalau datanya lebih berharga, pilihannya berbeda dan pengguna harus diberi tahu.',
      ),
      callout(
        'tip',
        'Urutan refactor yang jarang gagal',
        'Mulai dari yang paling dalam. Buat value object-nya dulu beserta aturannya, lalu koleksinya, baru lapisan luar seperti penyimpanan dan tampilan. Kalau dimulai dari luar, kamu akan menulis lapisan yang bentuknya menyesuaikan kode lama, dan itu justru membekukan bentuk yang ingin kamu ubah.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering muncul saat refactor seperti ini dijalankan pertama kali.',
      ),
      code(
        'text',
        `
        const d = await penyimpan.muat();
        d.semua[0].dengan({ selesai: true });
                   ^

        TypeError: d.semua[0].dengan is not a function
        `,
        { caption: 'Data dari penyimpanan belum diubah kembali menjadi instance.' },
      ),
      p(
        'Ini persis masalah prototype yang hilang dari Sub-bab 2.3. `JSON.parse` menghasilkan object biasa yang isinya sama tapi tanpa satu pun method. Itulah kenapa `PenyimpanLokal.muat` menulis `.map((d) => new Tugas(d))` dan tidak langsung memberikan hasil `JSON.parse`. Setiap kali data melintasi batas penyimpanan atau jaringan, ia harus dibangun ulang di sisi penerima.',
      ),
      code(
        'text',
        `
        new Tugas({ judul: '   ' });

        RangeError: Judul tugas tidak boleh kosong
        `,
        { caption: 'Aturan berlaku juga untuk judul yang isinya hanya spasi.' },
      ),
      p(
        "Pemeriksaan memakai `judul?.trim()` sebelum mengukur panjangnya, dan itu disengaja. Tanpa `trim`, judul berisi tiga spasi akan lolos dan muncul sebagai baris kosong di daftar. Tanda tanya pada `judul?.trim()` menangani kasus `judul` tidak dikirim sama sekali, dan `?? ''` sesudahnya mengubah hasilnya menjadi teks kosong supaya `length` bisa dibaca. Tiga penjaga kecil di satu baris, dan ketiganya menutup kasus yang berbeda.",
      ),
      code(
        'text',
        `
        localStorage.setItem('todo', teksBesar);
                     ^

        QuotaExceededError: Failed to execute 'setItem' on 'Storage':
        Setting the value of 'todo' exceeded the quota.
        `,
        { caption: 'Penyimpanan peramban penuh.' },
      ),
      p(
        'Batas penyimpanan peramban umumnya sekitar lima megabyte per asal, dan ia dibagi seluruh data yang disimpan halaman itu. Untuk daftar tugas biasa ini tidak akan tercapai, tapi ia sangat mungkin tercapai kalau kamu menyimpan riwayat urungkan atau menyertakan lampiran. Method `simpan` yang benar-benar siap produksi perlu menangkap error ini dan memberi tahu pengguna, bukan gagal diam-diam.',
      ),
      code(
        'text',
        `
        const d1 = daftar.tambah({ judul: 'A' });
        console.log(daftar.semua.length);   // 0
        console.log(d1.semua.length);       // 1
        `,
        { caption: 'Bukan error, tapi sering mengejutkan saat pertama memakai bentuk ini.' },
      ),
      p(
        "Karena `tambah` mengembalikan daftar baru dan tidak mengubah yang lama, hasilnya harus ditampung. Menulis `daftar.tambah({ judul: 'A' })` sendirian tidak melakukan apa-apa yang terlihat, sama seperti `judul.trim()` yang berdiri sendiri di Bab 1. Ini konsekuensi yang disengaja dari pilihan tidak mengubah data, dan ia yang membuat fitur urungkan serta pemakaian di React menjadi mudah.",
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`x.dengan is not a function`',
            'Data dari penyimpanan atau jaringan belum dibangun ulang',
            'Petakan hasilnya menjadi instance sebelum dipakai',
          ],
          [
            '`Judul tugas tidak boleh kosong`',
            'Aturan bekerja sebagaimana mestinya',
            'Tangkap di lapisan tampilan lalu sorot kolomnya',
          ],
          [
            '`QuotaExceededError`',
            'Penyimpanan peramban penuh',
            'Tangkap errornya, beri tahu pengguna, dan pertimbangkan memangkas data lama',
          ],
          [
            'Perubahan tidak terlihat setelah memanggil method',
            'Methodnya mengembalikan daftar baru dan hasilnya tidak ditampung',
            'Tampung hasilnya, misalnya `daftar = daftar.tambah(...)`',
          ],
          [
            'Dua bagian halaman menampilkan jumlah tugas yang berbeda',
            'Keduanya memegang daftar hasil pembaruan yang berbeda',
            'Satu sumber kebenaran, dan keduanya membaca dari sana',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Refactor besar punya kesalahan khasnya sendiri, dan hampir semuanya berupa mengubah terlalu banyak sekaligus tanpa jaring pengaman.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis ulang seluruh modul sekaligus lalu menguji di akhir',
            'Lebih cepat daripada bertahap',
            'Kalau ada yang rusak, kamu tidak tahu perubahan mana penyebabnya. Ubah satu bagian, jalankan test, lanjut',
          ],
          [
            'Melakukan refactor tanpa test yang sudah hijau lebih dulu',
            'Kodenya sudah bekerja, jadi tidak akan rusak',
            'Refactor artinya mengubah bentuk tanpa mengubah perilaku, dan tanpa test tidak ada yang membuktikan perilakunya tidak berubah',
          ],
          [
            'Mencampur perbaikan bug dan perubahan bentuk dalam satu langkah',
            'Sekalian, karena bagiannya memang sedang dibuka',
            'Kalau hasilnya rusak, kamu tidak tahu itu karena bentuk barunya atau karena perbaikan bugnya. Pisahkan menjadi dua langkah',
          ],
          [
            'Membuat kelas untuk setiap hal yang disebut di kebutuhan',
            'Tiap kata benda terdengar seperti kelas',
            'Sebagian kata benda hanyalah nilai, dan sebagian lagi hanya operasi. Buat kelas untuk yang punya aturan atau keadaan',
          ],
          [
            'Menyimpan hasil penyaringan sebagai field',
            'Supaya tidak dihitung ulang tiap render',
            'Ia jadi sumber kebenaran kedua yang harus dijaga sinkron. Hitung di getter, dan optimalkan hanya kalau pengukuran membuktikan perlunya',
          ],
          [
            'Menaruh pemanggilan penyimpanan di dalam `DaftarTugas`',
            'Supaya setiap perubahan otomatis tersimpan',
            'Logikanya jadi tidak bisa diuji tanpa penyimpanan, dan pemindahan ke server nanti akan menyentuh berkas yang salah. Biarkan lapisan luar yang memutuskan kapan menyimpan',
          ],
        ],
      ),
      p(
        'Baris kedua adalah syarat yang tidak bisa ditawar. Refactor didefinisikan sebagai mengubah bentuk tanpa mengubah perilaku, dan satu-satunya cara membuktikan perilakunya tidak berubah adalah test yang sudah hijau sebelum kamu mulai. Kalau belum ada test, tulis dulu beberapa yang menguji perilaku lewat antarmuka publiknya, baru mulai mengubah. Waktu yang dipakai menulis test itu selalu lebih pendek daripada waktu menelusuri bug yang lahir dari refactor buta.',
      ),
      callout(
        'info',
        'Bentuk ini akan langsung berguna di Bab 6 dan 7',
        'Daftar yang tidak diubah di tempat, satu sumber kebenaran, dan perubahan yang selalu menghasilkan nilai baru adalah persis yang dibutuhkan `useState`. Kalau kamu membawa `DaftarTugas` ini ke React, yang perlu ditambahkan hanya satu baris `setDaftar(daftar.tambah(...))`, dan seluruh logikanya tetap bisa diuji tanpa merender apa pun.',
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
