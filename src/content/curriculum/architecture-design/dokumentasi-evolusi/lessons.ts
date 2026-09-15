import {
  callout,
  code,
  compare,
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
 * Architecture Design — Chapter 4, seven lessons.
 *
 * Everything that keeps a decision alive after the conversation that produced it ends. Placed
 * last because each artefact here documents something the earlier chapters taught the reader to
 * decide; documenting a decision you cannot yet make is an empty template.
 *
 * The closing lesson runs the whole category end to end on one system, so the reader sees the
 * four questions, the decision table, the diagrams, and the ADR produce one coherent result.
 */
export const lessons: LessonDraft[] = [
  written(
    'diagram-c4',
    'Menggambar dengan Model C4',
    20,
    'Empat tingkat kedalaman, supaya satu gambar berhenti berusaha menjelaskan segalanya.',
    [
      p(
        'Pikirkan bagaimana peta bekerja di aplikasi peta di ponselmu. Saat kamu menjauh, kamu melihat pulau dan nama kota. Saat kamu mendekat, kota berubah menjadi jalan besar. Mendekat lagi, jalan besar berubah menjadi gang dan nama toko.',
      ),
      p(
        'Perhatikan bahwa aplikasi peta tidak pernah menampilkan nama pulau, nama jalan, dan nama toko dalam satu tampilan sekaligus. Kalau ia melakukannya, hasilnya bukan peta yang lengkap melainkan gambar yang tidak terbaca. Tiap tingkat kedekatan punya isinya sendiri, dan punya pembacanya sendiri.',
      ),
      p(
        'Hampir semua diagram arsitektur yang pernah kamu lihat gagal justru karena melanggar aturan ini. Ia berisi kotak "Pengguna", kotak "PostgreSQL", dan kotak "OrderValidator" dalam satu gambar, tanpa keterangan tentang apa arti kotaknya, apa arti panahnya, dan untuk siapa gambar itu dibuat. Akibatnya dua orang membaca gambar yang sama lalu menyimpulkan hal yang berbeda.',
      ),
      p(
        '**Model C4** menyelesaikannya persis seperti aplikasi peta, yaitu satu gambar melayani satu tingkat kedalaman untuk satu jenis pembaca. Alih-alih satu gambar yang berusaha menjelaskan segalanya, ada beberapa gambar yang masing-masing menjawab satu pertanyaan.',
      ),

      terms(
        {
          term: 'C4 model',
          meaning:
            'Cara menggambar arsitektur dalam empat tingkat kedalaman, yaitu Context, Container, Component, dan Code. Dibaca "si-empat". Namanya diambil dari huruf C awal keempat tingkat itu, semacam singkatan yang mudah diingat. Satu hal yang melegakan bagi pemula, C4 **bukan notasi resmi** dengan bentuk kotak dan warna yang baku seperti UML. Ia hanya kesepakatan tentang apa yang boleh muncul di tiap tingkat, sehingga kamu bebas menggambarnya dengan alat apa pun, bahkan dengan kotak dan garis di kertas.',
        },
        {
          term: 'context diagram (tingkat 1)',
          meaning:
            'Gambar paling luar yang menempatkan sistemmu sebagai satu kotak, dikelilingi orang yang memakainya dan sistem lain yang berhubungan dengannya. Dibaca "kontekst daiagram". Isinya tidak boleh menyebut teknologi apa pun, karena pembacanya termasuk orang non-teknis.',
        },
        {
          term: 'container diagram (tingkat 2)',
          meaning:
            'Gambar yang membuka kotak sistemmu menjadi bagian-bagian yang berjalan sendiri, misalnya aplikasi web, API, database, dan antrean. Dibaca "konteiner daiagram". Peringatan penting supaya tidak salah paham sejak awal, kata container di sini **tidak ada hubungannya dengan Docker**. Istilah C4 ini lahir sebelum Docker populer, dan artinya adalah wadah yang menjalankan kode atau menyimpan data. Satu aplikasi Next.js adalah container. Satu database PostgreSQL adalah container. Keduanya tetap disebut container meskipun kamu menjalankannya tanpa Docker sama sekali.',
        },
        {
          term: 'component diagram (tingkat 3)',
          meaning:
            'Gambar yang membuka satu container menjadi bagian-bagian besar di dalamnya, yaitu modul beserta tanggung jawabnya. Dibaca "komponen daiagram". Tingkat ini yang paling sering menjadi basi lebih dulu, sehingga ia hanya dibuat untuk container yang benar-benar rumit.',
        },
        {
          term: 'code diagram (tingkat 4)',
          meaning:
            'Gambar yang membuka satu komponen menjadi kelas dan fungsi. Dibaca "kod daiagram". Tingkat ini hampir selalu **tidak perlu digambar manual**, karena editor dan alat pembaca kode sudah menunjukkannya, dan ia basi paling cepat.',
        },
        {
          term: 'legend (keterangan)',
          meaning:
            'Kotak kecil di gambar yang menjelaskan arti tiap bentuk, warna, dan jenis garis. Dibaca "lejend". Ini benda yang sama dengan keterangan di peta, yaitu bagian pojok yang memberi tahu garis biru berarti sungai dan garis merah berarti jalan tol. Gambar tanpa keterangan memaksa pembaca menebak, dan tebakannya sering keliru. Contoh yang sering terjadi, seseorang menggambar kotak putus-putus untuk menandai bagian yang belum dibangun, lalu pembaca mengiranya sudah ada.',
        },
        {
          term: 'diagram as code',
          meaning:
            'Menulis diagram sebagai teks lalu membiarkan alat menggambarnya. Dibaca "daiagram es kod", artinya diagram sebagai kode. Bentuknya kira-kira begini, kamu menulis baris teks seperti `Pembeli -> AplikasiWeb : memesan`, lalu alatnya yang menggambar kotak dan panahnya. Kelebihannya bukan soal keindahan hasilnya, melainkan soal **tempat tinggalnya**. Diagram berupa teks bisa masuk ke git, muncul di diff pull request, dan berubah di perubahan yang sama dengan kodenya, alih-alih menjadi berkas gambar yang tersimpan entah di mana dan tidak ada yang tahu sudah basi.',
        },
      ),

      h2('Kenapa satu gambar tidak pernah cukup'),
      p(
        'Sumber kekacauan diagram arsitektur adalah mencampur tingkat kedalaman dalam satu gambar. Begitu sebuah gambar memuat kotak bernama "Pengguna", kotak bernama "PostgreSQL", dan kotak bernama "OrderValidator", tidak ada pembaca yang bisa memakainya dengan nyaman.',
      ),
      table(
        ['Tingkat', 'Menjawab pertanyaan', 'Pembacanya', 'Seberapa sering berubah'],
        [
          [
            '1. Context',
            'Sistem ini untuk siapa dan berhubungan dengan apa',
            'Semua orang, termasuk non-teknis',
            'Jarang. Berbulan-bulan sekali',
          ],
          [
            '2. Container',
            'Sistem ini terdiri dari bagian apa yang berjalan sendiri',
            'Semua orang teknis',
            'Sesekali. Saat ada bagian baru',
          ],
          [
            '3. Component',
            'Satu bagian itu isinya modul apa saja',
            'Yang mengerjakan bagian itu',
            'Sering. Ini yang paling cepat basi',
          ],
          [
            '4. Code',
            'Satu modul itu kelasnya apa saja',
            'Nyaris tidak ada',
            'Terus-menerus. Jangan digambar manual',
          ],
        ],
        'Sebagian besar tim cukup membuat tingkat 1 dan 2, lalu tingkat 3 hanya untuk bagian yang rumit.',
      ),
      callout(
        'tip',
        'Dua gambar sudah menyelesaikan sebagian besar kebutuhan',
        'Kalau kamu hanya sempat membuat dua gambar, buat tingkat 1 dan tingkat 2. Keduanya jarang berubah, keduanya berguna bagi hampir semua orang, dan keduanya menjawab pertanyaan yang paling sering muncul dari orang baru, yaitu ini sistem apa dan isinya apa saja.',
      ),

      h2('Tingkat 1, konteks'),
      p(
        'Gambar pertama menempatkan seluruh sistemmu sebagai satu kotak. Yang digambar di sekelilingnya hanya dua jenis, yaitu orang yang memakainya dan sistem lain yang berhubungan dengannya.',
      ),
      code(
        'text',
        `
        ┌──────────┐              ┌──────────┐              ┌──────────┐
        │ Pembeli  │              │ Penjual  │              │  Admin   │
        │ (orang)  │              │ (orang)  │              │ (orang)  │
        └────┬─────┘              └────┬─────┘              └────┬─────┘
             │ menelusuri,             │ mengelola               │ memantau,
             │ memesan                 │ produk                  │ menangani laporan
             ▼                         ▼                         ▼
        ┌──────────────────────────────────────────────────────────────┐
        │                    Toko Online Nusantara                     │
        │  Tempat penjual memajang produk dan pembeli memesannya.       │
        └───────┬───────────────────┬──────────────────────┬───────────┘
                │ meminta           │ mengirim             │ meminta
                │ pembayaran        │ email                │ ongkos kirim
                ▼                   ▼                      ▼
        ┌───────────────┐   ┌───────────────┐     ┌──────────────────┐
        │ Gerbang       │   │ Penyedia      │     │ Layanan          │
        │ Pembayaran    │   │ Email         │     │ Ekspedisi        │
        │ (sistem luar) │   │ (sistem luar) │     │ (sistem luar)    │
        └───────────────┘   └───────────────┘     └──────────────────┘
        `,
        {
          caption:
            'Tidak ada satu pun nama teknologi. Gambar ini tetap benar meskipun seluruh stack diganti.',
        },
      ),
      p(
        'Perhatikan bahwa tiap panah punya keterangan berupa **kata kerja**, bukan sekadar garis. "Meminta pembayaran" memberi tahu arah dan maksudnya sekaligus. Panah tanpa keterangan adalah sumber salah paham paling umum di diagram arsitektur, karena pembaca tidak tahu apakah artinya memanggil, mengirim data, atau sekadar bergantung.',
      ),

      h2('Tingkat 2, container'),
      p(
        'Gambar kedua membuka kotak besar tadi. Di sinilah teknologi mulai boleh disebut, dan di sinilah keputusan bentuk dari Bab 2 menjadi terlihat.',
      ),
      code(
        'text',
        `
        Toko Online Nusantara

        ┌────────────────────┐        ┌────────────────────┐
        │  Aplikasi Web      │        │  Aplikasi Mobile   │
        │  [Next.js]         │        │  [React Native]    │
        └─────────┬──────────┘        └─────────┬──────────┘
                  │ HTTPS/JSON                  │ HTTPS/JSON
                  └──────────────┬──────────────┘
                                 ▼
                    ┌────────────────────────┐
                    │  API Toko              │  <- satu unit rilis,
                    │  [Express + TypeScript] │     modular monolith
                    └───┬────────────┬────────┘
                        │ SQL        │ menaruh pekerjaan
                        ▼            ▼
              ┌──────────────┐  ┌──────────────┐
              │  Basis Data  │  │   Antrean    │
              │ [PostgreSQL] │  │ [Redis+BullMQ]│
              └──────────────┘  └───────┬──────┘
                                        │ mengambil pekerjaan
                                        ▼
                              ┌────────────────────┐
                              │  Pekerja Latar     │  <- unit rilis kedua
                              │  [Node.js]         │     (email, laporan, PDF)
                              └────────────────────┘

        Keterangan: [ ] = teknologi.  ──> = arah ketergantungan.
        `,
        {
          caption:
            'Gambar ini yang memperlihatkan bahwa sistem ini modular monolith ditambah satu pekerja latar.',
        },
      ),
      p(
        'Tiga hal wajib ada di tiap kotak pada tingkat ini, yaitu **nama**, **teknologinya** dalam kurung siku, dan **tanggung jawabnya** dalam satu kalimat pendek. Kotak yang hanya berisi nama memaksa pembaca bertanya, dan gambar yang harus dijelaskan lisan bukan gambar yang berguna.',
      ),

      h2('Tingkat 3, hanya untuk yang rumit'),
      p(
        'Tingkat ketiga membuka satu container menjadi modul di dalamnya. Ia berguna sekali, tetapi ia juga yang paling cepat basi, sehingga dibuat hanya kalau container itu memang rumit.',
      ),
      code(
        'text',
        `
        API Toko  [Express]

        ┌──────────────────────────────────────────────────────────────┐
        │  ┌────────────┐   ┌────────────┐   ┌────────────┐            │
        │  │ Pendaftaran│   │  Katalog   │   │ Pemesanan  │            │
        │  │ aturan     │   │ produk dan │   │ keranjang  │            │
        │  │ pendaftaran│   │ pencarian  │   │ sampai     │            │
        │  │            │   │            │   │ pesanan    │            │
        │  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘            │
        │        │                │  ▲             │                   │
        │        │                │  └─────────────┘ ambil ringkasan   │
        │        │                │                  produk            │
        │  ┌─────▼────────────────▼──────────────────▼──────┐          │
        │  │  Lapisan penyimpanan, satu schema per modul     │          │
        │  └─────────────────────────────────────────────────┘         │
        └──────────────────────────────────────────────────────────────┘

        Panah antar modul HANYA lewat pintu masuk resmi masing-masing.
        `,
        {
          caption:
            'Kalimat di bawah gambar adalah aturan yang ditegakkan linter, bukan sekadar niat baik.',
        },
      ),
      callout(
        'warning',
        'Tingkat 3 yang basi lebih berbahaya daripada tidak ada',
        'Gambar yang menunjukkan enam modul padahal kodenya sudah punya sembilan akan dipercaya orang baru, lalu ia membangun pemahaman yang salah dan mengambil keputusan berdasarkan itu. Kalau kamu tidak yakin bisa memperbaruinya, jangan membuatnya. Tingkat 1 dan 2 yang benar jauh lebih berharga daripada tiga tingkat yang salah satunya berbohong.',
      ),

      h2('Menulis diagram sebagai teks'),
      p(
        'Diagram yang disimpan sebagai gambar akan basi, karena memperbaruinya berarti membuka alat gambar, mengubah, mengekspor, lalu mengunggah. Diagram yang ditulis sebagai teks berubah bersama kodenya di pull request yang sama.',
      ),
      compare(
        {
          title: 'Gambar terpisah',
          lang: 'text',
          code: `
            docs/
              arsitektur-v3-final-REVISI2.png

            Untuk mengubah:
              1. Cari berkas sumbernya, entah di mana
              2. Buka alat gambar
              3. Ubah, ekspor, unggah
              4. Ganti nama supaya tahu ini yang terbaru
          `,
          notes: [
            'Tidak terlihat di diff pull request',
            'Tidak ada yang tahu ia sudah basi',
            'Berkas sumbernya sering hilang bersama orangnya',
          ],
        },
        {
          title: 'Diagram sebagai teks',
          lang: 'text',
          code: `
            docs/arsitektur/
              01-konteks.md
              02-container.md

            Untuk mengubah:
              1. Ubah berkasnya
              2. Masuk pull request yang sama dengan kodenya
          `,
          notes: [
            'Perubahan terlihat di diff dan bisa direview',
            'Riwayatnya tersimpan di git',
            'Bisa diminta ikut diubah saat review kode',
          ],
        },
      ),
      p(
        'Alat yang dipakai untuk menerjemahkan teks menjadi gambar berganti-ganti seiring waktu, dan itu tidak apa-apa. Yang penting bukan alatnya melainkan sifatnya, yaitu diagram itu **berada di repositori yang sama dengan kodenya** dan berubah lewat proses yang sama.',
      ),

      h2('Kesalahan yang paling sering'),
      ol(
        '**Mencampur tingkat.** Satu gambar memuat orang, database, dan nama kelas sekaligus. Pisahkan menjadi beberapa gambar.',
        '**Panah tanpa keterangan.** Pembaca tidak tahu apakah artinya memanggil, mengirim data, atau bergantung. Beri kata kerja di tiap panah.',
        '**Menggambar yang diinginkan, bukan yang ada.** Kalau gambarnya menunjukkan bentuk yang belum dibangun, tandai dengan jelas mana yang sudah ada dan mana yang rencana.',
        '**Tidak ada keterangan bentuk dan warna.** Kalau kotak putus-putus berarti sesuatu, tuliskan artinya.',
        '**Menggambar semuanya.** Diagram yang memuat empat puluh kotak tidak dibaca siapa pun. Kalau terlalu ramai, itu tanda tingkatnya perlu dipecah.',
      ),

      h2('Rangkuman'),
      ul(
        'Satu gambar melayani satu tingkat kedalaman untuk satu jenis pembaca.',
        'Empat tingkatnya yaitu konteks, container, komponen, dan kode. Sebagian besar tim cukup dua yang pertama.',
        'Tingkat 1 tidak menyebut teknologi sama sekali, tingkat 2 wajib menyebutnya.',
        'Tiap kotak di tingkat 2 punya nama, teknologi, dan satu kalimat tanggung jawab.',
        'Tingkat 3 hanya untuk container yang rumit, karena ia paling cepat basi.',
        'Tulis diagram sebagai teks di repositori yang sama, supaya ia berubah lewat proses yang sama dengan kodenya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Model C4 berguna karena ia memisahkan empat tingkat kedalaman, dan hampir semua kebingungan pada diagram arsitektur berasal dari mencampur keempatnya dalam satu gambar.',
      ),
      code(
        'text',
        `
        Empat tingkat, dan satu pertanyaan yang dijawab masing-masing:

          1. CONTEXT   "Siapa memakai sistem ini, dan sistem ini
                        bicara dengan apa?"
                       Pembacanya: siapa saja, termasuk yang bukan
                       teknis.

          2. CONTAINER "Bagian apa saja yang BERJALAN, dan masing-masing
                        menyimpan apa?"
                       Satu kotak = satu hal yang bisa dijalankan
                       atau dimatikan sendiri.

          3. COMPONENT "Di dalam satu container, ada modul apa saja?"
                       Yang paling cepat basi.

          4. CODE      Kelas dan fungsi.
                       Hampir tidak pernah pantas digambar; kode
                       sudah menunjukkannya, dan alat bisa
                       menghasilkannya bila perlu.

        Untuk sebagian besar sistem, tingkat 1 dan 2 sudah cukup.
        `,
        {
          caption:
            'Tingkat 3 hanya digambar untuk container yang benar-benar rumit, dan hanya selama ia masih rumit.',
        },
      ),
      p(
        'Nilai tingkat kedua bisa dilihat pada project ini, sebab ia menjawab pertanyaan yang tidak bisa dijawab struktur direktori.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          116 berkas TypeScript, 337 sisi ketergantungan

          sisi antar lapisan:
            110  content -> lib
             40  app     -> lib
             36  app     -> components
             32  components -> lib
              1  lib     -> content        <- melawan arah

        Yang menarik: SELURUHNYA berjalan di satu container.
        Diagram tingkat 2 untuk project ini hanya punya beberapa
        kotak, dan itu memang gambaran yang jujur.

        Diagram yang menggambarkan empat "layanan" untuk sistem
        seperti ini akan menyesatkan pembacanya sepenuhnya.
        `,
      ),
      p(
        'Yang paling menentukan pada sebuah diagram bukan kotaknya melainkan panahnya, dan panah yang berguna selalu punya tiga hal.',
      ),
      code(
        'text',
        `
        Panah yang TIDAK berguna:
          [Web] ---------> [API]

        Panah yang berguna:
          [Web] --HTTPS/JSON, sinkron--> [API]
                 "mengambil daftar pelajaran"

        Tiga hal yang harus ada:
          1. ARAH    siapa yang memulai
          2. CARA    protokol, dan SINKRON atau ASINKRON
          3. KENAPA  apa yang sebenarnya diminta

        Nomor 2 yang paling sering hilang, dan ia yang paling
        menentukan. Diukur di bab Komunikasi:
          pemanggilan fungsi  puluhan nanodetik
          loopback            1,69 ms
          internet            p50 70,04 ms, p99 362,72 ms

        Panah tanpa keterangan cara membuat pembaca tidak bisa
        membedakan ketiga angka itu.
        `,
      ),

      h2('Saat error-nya muncul'),
      p('Diagram tidak menghasilkan error, dan cara ia gagal cukup konsisten.'),
      code(
        'text',
        `
        1. Diagram menunjukkan niat, bukan kenyataan

           Digambar: app -> lib -> content
           Diukur  : ada satu sisi lib -> content

           Diagram tidak pernah tahu bahwa satu impor menyelinap
           masuk. Yang tahu hanya alat yang menelusuri impor
           sesungguhnya.

        2. Diagram mencampur tingkat

           Satu gambar memuat pengguna, layanan, tabel basis data,
           dan nama kelas sekaligus. Tidak ada pembaca yang bisa
           memakainya: yang butuh gambaran besar tenggelam, yang
           butuh rincian tidak menemukan cukup.

        3. Diagram tidak punya tanggal dan tidak punya pemilik

           Tidak ada yang tahu apakah ia masih benar. Dan diagram
           yang tidak dipercaya sama tidak bergunanya dengan yang
           tidak ada — dengan tambahan bahwa ia masih menyesatkan.

        4. Diagram digambar dengan alat yang menyulitkan pembaruan

           Gambar yang harus dibuka di aplikasi khusus, diekspor,
           lalu diunggah ulang tidak akan pernah diperbarui.
        `,
      ),
      p(
        'Poin keempat punya penyelesaian yang praktis, yaitu menuliskan diagram sebagai teks sehingga ia ikut ke riwayat versi.',
      ),
      code(
        'text',
        `
        Diagram sebagai teks, disimpan bersama kodenya:

          - ikut ter-commit, jadi perubahannya terlihat di diff
          - bisa direview di pull request yang sama dengan kodenya
          - punya riwayat: kapan berubah, oleh siapa, dan kenapa

        Pada project ini, riwayat git bisa menjawab pertanyaan
        kesegaran dokumen secara langsung:

          README.md  terakhir diubah 2026-08-27, 4 commit
          src/       terakhir diubah 2026-08-27, 12 commit

        Dokumen yang tanggal perubahan terakhirnya jauh tertinggal
        dari kodenya adalah dokumen yang perlu diperiksa sebelum
        dipercaya.
        `,
        { caption: 'Kesegaran dokumen bisa diukur, dan tidak perlu ditebak.' },
      ),
      p(
        'Kegagalan terakhir bersifat cakupan, yaitu menggambar terlalu banyak sehingga tidak ada yang terjaga.',
      ),
      code(
        'text',
        `
        Berapa diagram yang PANTAS dijaga:

          1 diagram CONTEXT      untuk seluruh sistem
          1 diagram CONTAINER    untuk seluruh sistem
          0-2 diagram COMPONENT  hanya untuk yang benar-benar rumit

        Selebihnya digambar saat dibutuhkan, dipakai dalam
        percakapan itu, lalu DIBUANG.

        Diagram sekali pakai tidak perlu benar selamanya, dan itu
        yang membuatnya jauh lebih berguna daripada diagram yang
        harus dijaga dan tidak pernah dijaga.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Diagram mudah dibuat dan sulit dijaga, dan sebagian besar kesalahannya adalah membuat lebih banyak daripada yang bisa dijaga.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menggambar keempat tingkat C4',
            'Biar lengkap',
            'Tingkat 3 dan 4 paling cepat basi. Untuk sebagian besar sistem, tingkat 1 dan 2 sudah cukup',
          ],
          [
            'Mencampur beberapa tingkat dalam satu gambar',
            'Biar semuanya terlihat',
            'Yang butuh gambaran besar tenggelam, yang butuh rincian tidak menemukan cukup',
          ],
          [
            'Menggambar panah tanpa keterangan',
            'Arahnya kan sudah jelas',
            'Diukur, selisih sinkron dan asinkron adalah selisih antara nanodetik dan 70 ms. Panah harus menyebutnya',
          ],
          [
            'Memakai alat gambar yang sulit diperbarui',
            'Hasilnya lebih rapi',
            'Diagram yang menyulitkan pembaruan tidak akan diperbarui. Tulis sebagai teks yang ikut ter-commit',
          ],
          [
            'Mempercayai diagram tanpa memeriksanya',
            'Itu kan dokumen resmi',
            'Diukur pada project ini, satu sisi melawan arah ada di kode dan tidak ada di diagram mana pun',
          ],
          [
            'Menjaga semua diagram selamanya',
            'Sudah dibuat, sayang dibuang',
            'Diagram sekali pakai untuk satu percakapan jauh lebih berguna daripada diagram permanen yang basi',
          ],
        ],
      ),
      p(
        'Ada satu kebiasaan yang membuat diagram berhenti berbohong, dan ia memakan waktu tiga puluh baris kode. Hasilkan diagram tingkat komponen dari graf impor yang sesungguhnya, bukan dari ingatan. Diagram yang dihasilkan dari kode tidak akan pernah menyesatkan, dan selisih antara diagram itu dan diagram yang digambar tangan adalah daftar tempat yang perlu diperiksa.',
      ),
      references(
        {
          label: 'The C4 model',
          href: 'https://c4model.com/',
          source: 'c4model.com',
          note: 'Sumber utama model ini, ditulis oleh orang yang merumuskannya.',
        },
        {
          label: 'C4 abstractions',
          href: 'https://c4model.com/abstractions',
          source: 'c4model.com',
          note: 'Definisi resmi person, software system, container, dan component.',
        },
        {
          label: 'System Context diagram',
          href: 'https://c4model.com/diagrams/system-context',
          source: 'c4model.com',
          note: 'Aturan tingkat pertama beserta contoh yang dijalankan sampai selesai.',
        },
      ),
    ],
  ),

  written(
    'adr',
    'Architecture Decision Record',
    21,
    'Menyimpan alasan sebuah keputusan, supaya ia tidak diperdebatkan ulang setiap tahun.',
    [
      p(
        'Pernahkah kamu menemukan sesuatu yang aneh di kode lalu berpikir "kenapa dibuat begini, ini jelas lebih baik kalau begitu". Lalu kamu memperbaikinya, dan dua minggu kemudian muncul bug aneh yang ternyata dulu justru dicegah oleh kode aneh tadi.',
      ),
      p(
        'Kejadian itu sangat umum, dan penyebabnya bukan siapa-siapa. Penyebabnya adalah **kode hanya menyimpan apa, tidak pernah menyimpan kenapa**. Kamu bisa membaca seluruh baris di sebuah repositori dan tetap tidak tahu bahwa pilihan yang terlihat aneh itu sebenarnya sudah melewati tiga alternatif yang semuanya ditolak dengan alasan yang baik.',
      ),
      p(
        'Ada analogi yang pas untuk ini. Resep masakan memberi tahu kamu takaran garamnya satu sendok. Ia tidak memberi tahu bahwa dulu pernah dicoba setengah sendok dan hasilnya hambar, dan pernah dicoba dua sendok lalu ada yang sakit. Tanpa catatan itu, orang berikutnya pasti mencoba mengubahnya lagi.',
      ),
      p(
        '**ADR** adalah catatan yang menyimpan kenapa. Ia bukan dokumen besar dan bukan proses berat. Satu ADR biasanya muat dalam satu halaman, ditulis sekali saat keputusannya diambil, dan sesudah itu tidak pernah diubah lagi.',
      ),

      terms(
        {
          term: 'ADR',
          meaning:
            'Singkatan dari Architecture Decision Record, dibaca "ei-di-ar", artinya catatan keputusan arsitektur. Satu berkas berisi **satu** keputusan beserta keadaan yang melahirkannya, pilihan yang ditolak, dan akibat yang diterima. Wujudnya cuma berkas Markdown biasa bernomor, misalnya `docs/adr/0007-satu-pemilik-per-tabel.md`, dan disimpan di repositori bersama kodenya supaya ia ikut terbawa ke mana pun kode itu pergi.',
        },
        {
          term: 'context (konteks)',
          meaning:
            'Bagian ADR yang menjelaskan keadaan saat keputusan diambil, yaitu masalah apa yang dihadapi, batasan apa yang berlaku, dan apa yang sudah diketahui saat itu. Dibaca "kontekst". Ini bagian yang paling menentukan nilai sebuah ADR, dan sekaligus yang paling sering ditulis asal-asalan. Alasannya begini. Tanpa konteks, pembaca berikutnya menilai keputusan lama memakai informasi yang baru ia punya sekarang, dan itu selalu membuat keputusan lama terlihat bodoh. Dengan konteks, ia bisa melihat bahwa dengan informasi yang tersedia saat itu, keputusannya justru masuk akal.',
        },
        {
          term: 'consequences (akibat)',
          meaning:
            'Bagian ADR yang menyebutkan apa yang menjadi lebih mudah **dan** apa yang menjadi lebih sulit setelah keputusan ini. Dibaca "konsikuensis". Bagian "menjadi lebih sulit" itulah yang membuat sebuah ADR bisa dipercaya. ADR yang hanya menyebut keuntungan adalah iklan, bukan catatan keputusan, dan pembaca berikutnya akan langsung curiga bahwa penulisnya belum memikirkan harganya.',
        },
        {
          term: 'superseded (digantikan)',
          meaning:
            'Status sebuah ADR yang keputusannya sudah tidak berlaku karena ada ADR baru yang menggantikannya. Dibaca "supersided", artinya digantikan. Aturan yang penting di sini, ADR lama **tidak dihapus dan tidak diedit**, ia hanya ditandai. Alasannya sama seperti kenapa buku sejarah tidak dihapus ketika keadaan berubah, yaitu untuk memahami kenapa hari ini seperti ini, kamu perlu tahu apa yang terjadi kemarin beserta alasannya.',
        },
        {
          term: 'MADR',
          meaning:
            'Singkatan dari Markdown Architectural Decision Records, yaitu salah satu format ADR yang paling banyak dipakai. Dibaca "mader". Ia menyediakan templat baku sehingga tiap ADR punya bagian yang sama persis dan bisa dibaca cepat oleh siapa pun yang sudah terbiasa. Kamu tidak wajib memakainya, dan format buatan sendiri pun sah, asalkan empat bagian intinya ada yaitu konteks, keputusan, alternatif yang ditolak, dan akibat.',
        },
        {
          term: 'decision log',
          meaning:
            'Kumpulan seluruh ADR yang diurutkan, biasanya berupa satu berkas indeks berisi nomor, judul, dan status. Dibaca "disisyen log", artinya catatan keputusan. Kegunaannya paling terasa saat ada orang baru bergabung. Alih-alih bertanya berkali-kali "kenapa kita pakai ini", ia bisa membaca dua puluh judul dalam lima menit lalu membuka yang ia perlukan. Nomornya berurutan dan **tidak pernah dipakai ulang**, bahkan untuk ADR yang sudah digantikan, supaya rujukan antar ADR selalu menunjuk hal yang sama.',
        },
      ),

      h2('Kapan sesuatu pantas menjadi ADR'),
      p(
        'ADR yang terlalu banyak sama tidak bergunanya dengan ADR yang tidak ada, karena tidak ada yang membacanya. Ada tiga uji yang cukup untuk memilah.',
      ),
      ol(
        '**Uji pintu satu arah.** Kalau keputusan ini mahal dibatalkan seperti yang dibahas di sub-bab 1.2, ia pantas dicatat.',
        '**Uji perdebatan ulang.** Kalau kamu bisa membayangkan seseorang setahun lagi bertanya "kenapa tidak begini saja", ia pantas dicatat.',
        '**Uji alternatif nyata.** Kalau ada pilihan lain yang benar-benar dipertimbangkan dan ditolak, ia pantas dicatat. Keputusan tanpa alternatif biasanya bukan keputusan.',
      ),
      table(
        ['Contoh', 'Jadi ADR?', 'Alasan'],
        [
          [
            'Memakai PostgreSQL, bukan MongoDB',
            'Ya',
            'Mahal dibatalkan, alternatifnya nyata, pasti ditanyakan lagi',
          ],
          [
            'Memakai `camelCase` untuk nama fungsi',
            'Tidak',
            'Itu konvensi, tempatnya di panduan gaya atau di konfigurasi linter',
          ],
          [
            'Modul tidak boleh membaca tabel modul lain',
            'Ya',
            'Mengikat seluruh kode, dan pasti terasa membatasi sehingga akan ditanya',
          ],
          [
            'Memakai `zod` untuk validasi',
            'Mungkin',
            'Ya kalau pilihannya dipertimbangkan serius, tidak kalau ia sekadar yang sudah dipakai',
          ],
          [
            'Tidak memecah menjadi microservice sekarang',
            'Ya',
            'Justru keputusan untuk TIDAK melakukan sesuatu yang paling sering hilang',
          ],
          [
            'Menambah index pada kolom `email`',
            'Tidak',
            'Perubahan biasa, alasannya cukup di pesan commit',
          ],
        ],
        'Baris kelima paling sering terlewat, padahal keputusan menahan diri adalah yang paling sering dipertanyakan.',
      ),
      callout(
        'tip',
        'Keputusan untuk tidak melakukan sesuatu wajib dicatat',
        'Ketika sebuah tim memutuskan tidak memakai microservice, tidak memakai GraphQL, atau tidak memisahkan database, keputusan itu tidak meninggalkan jejak apa pun di kode. Enam bulan lagi seseorang akan mengusulkannya lagi, dan seluruh diskusi diulang dari nol. ADR adalah satu-satunya tempat keputusan seperti ini bisa hidup.',
      ),

      h2('Bentuknya'),
      p(
        'Format yang dipakai tidak terlalu penting selama ia punya empat bagian ini. Contoh berikut memakai bentuk yang ringkas dan cukup untuk sebagian besar kebutuhan.',
      ),
      code(
        'text',
        `
        # 0007. Modul tidak boleh membaca tabel milik modul lain

        Status: Diterima
        Tanggal: 2026-08-26
        Pengambil keputusan: tim backend

        ## Konteks

        Aplikasi tumbuh menjadi enam modul dalam satu unit rilis. Tiga bulan terakhir
        ada empat kejadian ketika perubahan bentuk tabel di satu modul merusak modul
        lain yang membacanya langsung, dan pemilik tabelnya tidak tahu ada yang membaca.

        Kami juga memperkirakan modul notifikasi akan ditarik keluar menjadi layanan
        sendiri dalam enam sampai dua belas bulan, dan pembacaan tabel lintas modul
        akan membuat pemisahan itu jauh lebih mahal.

        ## Keputusan

        Setiap tabel dimiliki tepat satu modul. Modul lain yang membutuhkan datanya
        memanggil fungsi resmi dari pintu masuk modul pemilik.

        Ditegakkan dengan schema PostgreSQL per modul, plus aturan ESLint yang melarang
        impor menembus pintu masuk. Keduanya gagal di CI, bukan sekadar disepakati.

        ## Pilihan yang ditolak

        - **Membiarkan pembacaan lintas modul dengan kesepakatan.** Ditolak karena inilah
          yang sudah berjalan selama ini, dan empat kejadian di atas terjadi meskipun
          kesepakatannya ada. Kesepakatan tanpa penegakan kalah oleh tenggat.
        - **Langsung memisahkan database per modul.** Ditolak karena kami kehilangan
          transaksi lintas modul yang masih dibutuhkan pesanan dan pembayaran, sementara
          manfaatnya belum dibutuhkan sekarang.
        - **View database sebagai permukaan baca.** Ditolak karena bentuk view tetap
          menjadi kontrak yang mengunci pemiliknya, hanya saja tidak terlihat di kode.

        ## Akibat

        Menjadi lebih mudah:
        - Pemilik tabel bebas mengubah bentuknya tanpa memberi tahu siapa pun.
        - Pemisahan modul notifikasi nanti berarti mengganti isi satu berkas.

        Menjadi lebih sulit:
        - Query yang tadinya satu join sekarang menjadi dua panggilan lalu digabung di kode.
        - Ada beberapa laporan lintas modul yang perlu ditulis ulang sebagai read model.

        Yang perlu dikerjakan:
        - Migrasi ke schema per modul, sekitar dua minggu.
        - Sembilan pembacaan lintas modul yang sudah ada harus diubah lebih dulu.
        `,
        {
          filename: 'docs/adr/0007-satu-pemilik-per-tabel.md',
          caption:
            'Bagian "menjadi lebih sulit" adalah yang membuat catatan ini jujur dan bisa dipercaya.',
        },
      ),
      p(
        'Perhatikan bagian pilihan yang ditolak. Tiap penolakan disertai **alasan yang spesifik untuk keadaan ini**, bukan alasan umum. "View ditolak karena tidak sesuai praktik terbaik" tidak berguna. "View ditolak karena bentuknya tetap menjadi kontrak yang tidak terlihat di kode" bisa dinilai, dibantah, dan ditinjau ulang kalau keadaannya berubah.',
      ),

      h2('Aturan yang menjaga ADR tetap berguna'),
      steps(
        {
          title: 'Ditulis saat keputusannya diambil, bukan sesudahnya',
          body: 'ADR yang ditulis tiga bulan kemudian berisi rasionalisasi, bukan alasan. Detail tentang apa yang belum diketahui saat itu sudah hilang, dan justru detail itu yang membuat keputusannya bisa dinilai adil.',
        },
        {
          title: 'Tidak pernah diubah setelah diterima',
          body: 'Kalau keputusannya berubah, tulis ADR baru yang menyebut nomor ADR lama, lalu tandai yang lama sebagai digantikan. Mengedit ADR lama menghapus sejarah, dan sejarah itulah isinya.',
        },
        {
          title: 'Disimpan di repositori yang sama dengan kodenya',
          body: 'ADR yang tinggal di alat dokumentasi terpisah akan terlupakan. Di repositori, ia muncul saat orang menjelajah kode, bisa ditautkan dari komentar, dan bisa direview di pull request yang sama dengan perubahannya.',
        },
        {
          title: 'Pendek, satu halaman, satu keputusan',
          body: 'ADR yang berisi tiga keputusan sekaligus tidak bisa digantikan sebagian. Satu berkas satu keputusan, sehingga tiap keputusan punya riwayat sendiri.',
        },
      ),
      code(
        'text',
        `
        docs/adr/
          README.md                              <- indeks, satu baris per ADR
          0001-nextjs-app-router.md              Diterima
          0002-tanpa-backend-penyimpanan-lokal.md Diterima
          0003-blok-konten-bertipe.md            Diterima
          0004-shiki-di-server.md                Diterima
          0005-design-token.md                   Diterima
          0006-istilah-dan-rujukan-resmi.md      Diterima
          0007-satu-pemilik-per-tabel.md         Diterima
        `,
        {
          caption:
            'Nomor berurutan dan tidak pernah dipakai ulang, sehingga rujukan antar ADR selalu jelas.',
        },
      ),

      h2('Menggantikan sebuah ADR'),
      p(
        'Keputusan berubah, dan itu wajar. Yang tidak boleh adalah perubahan yang menghapus jejak keputusan sebelumnya.',
      ),
      code(
        'text',
        `
        # 0012. Memisahkan database modul notifikasi

        Status: Diterima
        Menggantikan: 0007 (sebagian, hanya untuk modul notifikasi)
        Tanggal: 2027-03-14

        ## Konteks

        ADR 0007 menetapkan satu pemilik per tabel di dalam satu database. Keputusan itu
        tetap benar untuk lima modul lainnya dan tidak dicabut.

        Yang berubah sejak saat itu: modul notifikasi sekarang dirilis empat sampai enam
        kali seminggu sementara aplikasi utama dirilis mingguan, dan penundaan itu
        benar-benar merugikan. Tiga dari empat sebab pada tabel keputusan sudah terpenuhi.

        ...
        `,
        {
          filename: 'docs/adr/0012-database-terpisah-notifikasi.md',
          caption:
            'ADR 0007 ditandai "Sebagian digantikan oleh 0012", tetapi isinya tetap utuh dan tetap dibaca.',
        },
      ),
      p(
        'Kalimat "yang berubah sejak saat itu" adalah bagian terpenting dari sebuah ADR pengganti. Ia menunjukkan bahwa keputusan lama **tidak salah**, ia hanya sudah tidak cocok dengan keadaan sekarang. Perbedaan itu penting bagi kesehatan tim, karena tanpanya setiap perubahan arah terasa seperti menyalahkan orang sebelumnya.',
      ),

      h2('Rangkuman'),
      ul(
        'Kode menyimpan apa yang diputuskan. ADR menyimpan kenapa.',
        'Tiga uji kelayakannya yaitu pintu satu arah, akan diperdebatkan ulang, dan ada alternatif nyata.',
        'Keputusan untuk tidak melakukan sesuatu wajib dicatat, karena ia tidak meninggalkan jejak di kode.',
        'Empat bagiannya yaitu konteks, keputusan, pilihan yang ditolak, dan akibat termasuk yang menjadi lebih sulit.',
        'ADR ditulis saat keputusannya diambil, tidak pernah diubah, disimpan di repositori, dan berisi satu keputusan.',
        'Perubahan arah ditulis sebagai ADR baru yang menyebut yang lama, bukan dengan mengedit yang lama.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'ADR menyimpan satu hal yang tidak disimpan kode mana pun, yaitu **kenapa** sebuah keputusan diambil beserta alternatif yang ditolak. Kode menunjukkan hasilnya; ADR menunjukkan pilihannya.',
      ),
      code(
        'text',
        `
        Bentuk yang cukup, dan tidak perlu lebih:

          # ADR 0007: Memakai kolom penghitung alih-alih agregasi

          Status  : Diterima
          Tanggal : 2026-09-14

          ## Konteks
          Halaman "artikel terpopuler" dibuka pada setiap kunjungan
          beranda. Diukur pada PostgreSQL 16.15 dengan 1.000.000
          komentar: agregasi GROUP BY memakan 468,922 ms.

          ## Keputusan
          Menyimpan jumlah komentar sebagai kolom pada tabel artikel,
          diperbarui lewat trigger.
          Diukur: pembacaannya menjadi 0,068 ms.

          ## Alternatif yang ditolak
          - Cache hasil agregasi: DITOLAK karena cache yang kosong
            tetap membayar 468,922 ms, dan itu terjadi tepat saat
            lalu lintas tinggi.
          - Replika baca: DITOLAK karena diuji, saat beban tulis besar
            8 dari 8 pembacaan sesudah penulisan gagal menemukan datanya.

          ## Konsekuensi
          - Penulisan komentar menjadi 31 kali lebih lambat:
            diukur 0,0090 ms menjadi 0,2825 ms per operasi.
          - Penghitungnya BISA menyimpang. Diuji: satu penghapusan
            yang lewat jalur lain menghasilkan penghitung 3 sementara
            yang sebenarnya 2.
          - Karena itu diperlukan query pendamaian berkala.
        `,
        {
          caption:
            'Bagian "alternatif yang ditolak" adalah yang paling dicari pembaca berikutnya, dan paling sering dihapus demi ringkas.',
        },
      ),
      p(
        'Yang membuat ADR itu berguna bukan formatnya melainkan bahwa setiap klaimnya punya angka. Bandingkan dengan versi yang tidak.',
      ),
      code(
        'text',
        `
        VERSI TANPA ANGKA:

          ## Konteks
          Query halaman terpopuler lambat.

          ## Keputusan
          Memakai kolom penghitung.

          ## Konsekuensi
          Penulisan jadi sedikit lebih lambat.

        Enam bulan kemudian, tidak ada yang bisa menilai apakah
        keputusan ini masih tepat, sebab tidak ada satu pun angka
        yang bisa dibandingkan dengan keadaan sekarang.
        `,
      ),
      p(
        'ADR juga menjawab pertanyaan yang berulang, dan itu manfaat yang baru terasa setelah beberapa bulan.',
      ),
      code(
        'text',
        `
        Tanpa ADR:
          "Kenapa kita tidak pakai replika baca saja?"
          -> didiskusikan ulang dari nol, kadang dengan kesimpulan
             yang berbeda dari sebelumnya

        Dengan ADR:
          "Sudah dipertimbangkan di ADR 0007, ditolak karena
           read-after-write. Kalau keadaannya berubah, tulis ADR
           baru yang menggantikannya."

        Dan itu poin pentingnya: ADR TIDAK diedit. Keputusan yang
        berubah ditulis sebagai ADR BARU yang menyatakan ia
        menggantikan yang lama.

        Riwayat keputusannya sama berharganya dengan keputusan
        terakhirnya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'ADR gagal dengan beberapa cara yang khas, dan yang pertama adalah ditulis untuk hal yang tidak memerlukannya.',
      ),
      code(
        'text',
        `
        Uji yang cukup andal: berapa berkas yang harus berubah bila
        keputusan ini dibatalkan minggu depan?

          1 berkas       -> putuskan sendiri, tidak perlu ADR
          5-10 berkas    -> sebutkan di pull request
          > 50 berkas    -> tulis ADR

        Diukur pada project ini sebagai contoh keputusan yang PANTAS
        ber-ADR:
          src/lib/curriculum/authoring.ts
            58 berkas bergantung LANGSUNG
            82 dari 116 berkas (71%) secara TRANSITIF

        Bentuk fungsi di berkas itu adalah keputusan yang mahal
        dibatalkan, dan alasannya pantas ditulis.
        `,
      ),
      p(
        'Kegagalan kedua adalah ADR yang ditulis sesudah keputusannya diambil dan dijalankan, sehingga ia menjadi pembenaran.',
      ),
      code(
        'text',
        `
        Tanda ADR yang hanya pembenaran:

          - tidak ada satu pun alternatif yang ditulis
          - alternatif yang ditulis jelas-jelas buruk, sehingga
            pilihannya terlihat tidak terhindarkan
          - bagian konsekuensi hanya memuat hal yang baik
          - tidak ada angka, hanya kata sifat

        Bagian KONSEKUENSI yang memuat hal buruk adalah tanda paling
        jelas bahwa sebuah ADR jujur. Contoh di atas menulis bahwa
        penulisannya menjadi 31 kali lebih lambat dan penghitungnya
        bisa menyimpang — dan keduanya memang terjadi.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: ADR yang tidak bisa ditemukan.

        Disimpan di folder yang tidak dilihat siapa pun, atau di
        alat yang berbeda dari tempat kodenya.

        Yang bekerja:
          docs/adr/0001-nama-keputusan.md
          bernomor, di dalam repositori, ikut ter-commit

        Dan pada project ini, kesegarannya bisa diukur dari git:
          README.md  terakhir diubah 2026-08-27, 4 commit
          src/       terakhir diubah 2026-08-27, 12 commit

        Dokumen yang tanggal perubahannya jauh tertinggal dari
        kodenya adalah dokumen yang perlu diperiksa sebelum dipercaya.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEEMPAT: ADR yang diedit ketika keputusannya berubah.

        Riwayat keputusan ikut hilang, dan pertanyaan "kenapa dulu
        kita memilih yang itu" tidak lagi punya jawaban.

        Yang benar:
          ADR 0007  Status: Digantikan oleh ADR 0021
          ADR 0021  Status: Diterima
                    "Menggantikan ADR 0007. Keadaan berubah karena ..."

        Dengan begitu, pembaca bisa melihat bahwa pilihannya pernah
        berbeda, dan tahu apa yang berubah.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'ADR sering dianggap formalitas dokumen, padahal ia satu-satunya tempat alasan sebuah keputusan bertahan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis ADR tanpa alternatif yang ditolak',
            'Yang lain kan tidak dipakai',
            'Itu bagian yang paling dicari pembaca berikutnya, dan paling mahal direkonstruksi',
          ],
          [
            'Menulis konsekuensi yang hanya baik',
            'Keputusannya kan sudah tepat',
            'Setiap keputusan punya biaya. Diukur, kolom penghitung membuat penulisan 31 kali lebih lambat',
          ],
          [
            'Menulis tanpa angka',
            'Semua orang sudah tahu masalahnya',
            'Enam bulan kemudian tidak ada yang bisa menilai apakah keputusannya masih tepat',
          ],
          [
            'Mengedit ADR ketika keputusannya berubah',
            'Biar selalu terbaru',
            'Riwayat keputusan hilang. Tulis ADR baru yang menyatakan ia menggantikan yang lama',
          ],
          [
            'Menulis ADR untuk setiap keputusan',
            'Biar terdokumentasi',
            'Hitung berkas yang terpengaruh bila dibatalkan. Satu berkas tidak perlu ADR',
          ],
          [
            'Menyimpan ADR di luar repositori',
            'Alatnya lebih rapi',
            'Ia tidak ikut di-review bersama kodenya, dan kesegarannya tidak bisa diperiksa dari git',
          ],
        ],
      ),
      p(
        'Ujian yang paling ringkas untuk sebuah ADR adalah memberikannya kepada orang yang tidak ikut membuatnya, lalu meminta ia menyebutkan satu alternatif yang ditolak beserta alasannya dan satu biaya yang harus ditanggung karena keputusan ini. Bila ia bisa menjawab keduanya dalam lima menit, ADR itu bekerja. Bila tidak, yang kurang hampir selalu bagian alternatif atau bagian konsekuensi.',
      ),
      references(
        {
          label: 'Architectural Decision Records',
          href: 'https://adr.github.io/',
          source: 'ADR GitHub organization',
          note: 'Kumpulan format ADR beserta penjelasan kenapa keputusan perlu dicatat.',
        },
        {
          label: 'MADR',
          href: 'https://adr.github.io/madr/',
          source: 'ADR GitHub organization',
          note: 'Format ADR berbasis Markdown yang paling banyak dipakai, lengkap dengan templatnya.',
        },
        {
          label: 'ADR templates',
          href: 'https://adr.github.io/adr-templates/',
          source: 'ADR GitHub organization',
          note: 'Beberapa bentuk templat, dari yang sangat ringkas sampai yang lengkap.',
        },
      ),
    ],
  ),

  written(
    'dokumen-arsitektur',
    'Dokumen Arsitektur yang Tidak Basi',
    20,
    'Menulis sesedikit mungkin, supaya yang ditulis benar-benar bisa dijaga tetap benar.',
    [
      p(
        'Coba ingat pengalaman membeli barang elektronik. Di dalam kardusnya biasanya ada dua kertas. Yang satu tebal berisi seratus halaman dalam dua belas bahasa, yang tidak pernah kamu baca. Yang satu lagi selembar berisi gambar cara memasang dan tiga peringatan penting, yang selalu kamu baca.',
      ),
      p(
        'Yang selembar itu lebih berguna bukan karena isinya lebih pintar, melainkan karena ia **cukup pendek untuk dibaca** dan **cukup pendek untuk dijaga tetap benar**. Buku seratus halaman itu bahkan mungkin sudah tidak cocok dengan barang yang ada di kardusnya, dan tidak ada yang tahu.',
      ),
      p(
        'Dua sub-bab sebelumnya menghasilkan dua jenis catatan, yaitu diagram yang memperlihatkan bentuk dan ADR yang menyimpan alasan. Masih ada satu hal yang belum tertampung, yaitu penjelasan naratif yang membantu orang baru memahami sistem ini dalam setengah jam. Itulah kertas selembarnya.',
      ),
      p(
        'Dokumen seperti ini punya reputasi buruk, dan reputasi itu pantas. Hampir semua dokumen arsitektur yang pernah ditulis berakhir basi. Yang perlu kamu pahami sejak awal, dokumen basi **lebih berbahaya** daripada tidak ada dokumen, karena orang baru tidak punya cara membedakan yang basi dari yang benar, lalu ia mempercayainya dan mengambil keputusan berdasarkan itu.',
      ),

      terms(
        {
          term: 'arc42',
          meaning:
            'Kerangka dokumen arsitektur berisi dua belas bagian baku, mulai dari tujuan sampai risiko. Dibaca "ark empat dua". Perlu ditegaskan supaya kamu tidak merasa terbebani, kegunaannya **bukan** mengharuskan mengisi kedua belas bagian. Kegunaannya adalah menyediakan tempat yang sudah disepakati untuk tiap jenis informasi, mirip formulir yang sudah ada kolomnya, sehingga tidak ada yang bingung harus menaruh sesuatu di mana. Sub-bab ini hanya memakai lima bagian yang paling berguna, dan itu sah.',
        },
        {
          term: 'living documentation',
          meaning:
            'Dokumentasi yang berubah bersama kodenya karena ia berada di tempat dan proses yang sama. Dibaca "living dokyumenteisyen", artinya dokumentasi yang hidup. Yang membuatnya hidup bukan isinya melainkan **letaknya**. Dokumen di dalam repositori ikut muncul di diff pull request, sehingga pereview bisa berkata "kamu mengubah bentuk sistemnya tetapi dokumennya belum". Dokumen di alat terpisah tidak pernah muncul di mana pun saat orang bekerja, sehingga memperbaruinya selalu menjadi pekerjaan tambahan yang mudah ditunda sampai lupa.',
        },
        {
          term: 'onboarding',
          meaning:
            'Proses membuat orang baru bisa mulai bekerja dengan berguna. Dibaca "onbording". Ini pembaca utama dokumen arsitektur, dan menuliskan dokumen dengan pembaca ini di kepala menghasilkan isi yang jauh berbeda daripada menulis untuk diri sendiri.',
        },
        {
          term: 'single source of truth',
          meaning:
            'Prinsip bahwa satu fakta ditulis di tepat satu tempat, lalu tempat lain menautkannya. Dibaca "singgel sors of trut". Dua salinan sebuah fakta pasti berbeda cepat atau lambat, dan sejak saat itu tidak ada yang tahu mana yang benar.',
        },
        {
          term: 'staleness marker (penanda kebasian)',
          meaning:
            'Tanda yang memperlihatkan kapan sebuah dokumen terakhir diperiksa, sehingga pembaca bisa menilai sendiri seberapa jauh ia boleh percaya. Wujudnya cuma satu baris di bagian atas, misalnya "terakhir diperiksa 2026-08-27". Fungsinya mirip tanggal kedaluwarsa di kemasan makanan, yaitu ia tidak membuat isinya lebih segar, tetapi ia membuat kebasian menjadi **terlihat** alih-alih tersembunyi. Kurikulum yang sedang kamu baca memakainya sebagai tanggal tinjauan di tiap bab, dan alasannya sama persis.',
        },
      ),

      h2('Kenapa dokumen arsitektur selalu basi'),
      p(
        'Penyebabnya bukan kemalasan. Ada tiga sebab struktural, dan mengenalinya menunjukkan cara menghindarinya.',
      ),
      table(
        ['Sebab', 'Wujudnya', 'Penawarnya'],
        [
          [
            'Menulis hal yang sudah ada di kode',
            'Dokumen memuat daftar endpoint, nama tabel, dan bentuk respons',
            'Jangan tulis. Tautkan ke kodenya, atau hasilkan otomatis dari sumbernya',
          ],
          [
            'Menulis terlalu banyak',
            'Empat puluh halaman yang tidak mungkin diperiksa ulang tiap rilis',
            'Tulis sesedikit mungkin. Yang tidak ditulis tidak bisa basi',
          ],
          [
            'Menyimpan di tempat berbeda dari kodenya',
            'Dokumen di alat terpisah yang tidak muncul saat orang bekerja',
            'Simpan di repositori, ubah lewat pull request yang sama',
          ],
        ],
        'Ketiganya berujung pada satu aturan, yaitu tulis hanya yang tidak bisa disimpulkan dari kode.',
      ),
      p(
        'Aturan itu punya wujud yang sangat konkret. Bentuk respons sebuah endpoint tidak perlu ditulis karena skema Zod-nya sudah menyatakannya dan tidak mungkin berbohong. Sebaliknya, alasan modul pembayaran tidak boleh memanggil modul pengiriman **tidak bisa** disimpulkan dari kode mana pun, dan itulah yang pantas ditulis.',
      ),

      h2('Isi minimum yang benar-benar berguna'),
      p(
        'Dari dua belas bagian arc42, ada lima yang memberi hampir seluruh manfaatnya. Kalau kamu hanya sempat menulis lima bagian, tulis kelima ini.',
      ),
      steps(
        {
          title: '1. Untuk apa sistem ini ada',
          body: 'Satu paragraf tentang masalah apa yang diselesaikan dan untuk siapa. Terdengar sepele, tetapi ini yang paling sering hilang, dan tanpanya orang baru tidak punya cara menilai apakah sebuah usulan masuk akal.',
        },
        {
          title: '2. Batasan yang tidak bisa ditawar',
          body: 'Hal yang membatasi pilihan dan bukan hasil pilihan, misalnya wajib berjalan di dalam jaringan kantor, wajib menyimpan data di dalam negeri, atau anggaran server tetap. Batasan yang tidak tertulis akan dilanggar oleh orang yang tidak tahu itu batasan.',
        },
        {
          title: '3. Atribut kualitas penggeraknya',
          body: 'Tiga sampai empat atribut dari sub-bab 1.3, ditulis sebagai kalimat yang bisa diperiksa, beserta atribut yang sengaja tidak dikejar. Bagian kedua sama pentingnya dengan bagian pertama.',
        },
        {
          title: '4. Bentuk besarnya',
          body: 'Diagram konteks dan diagram container dari sub-bab 4.1, ditambah satu paragraf per container tentang tanggung jawabnya. Tidak lebih dalam dari itu.',
        },
        {
          title: '5. Tautan ke daftar keputusan',
          body: 'Satu tautan ke indeks ADR. Alasan tiap keputusan tinggal di ADR-nya masing-masing, bukan disalin ke sini, sehingga tidak ada dua versi yang bisa berbeda.',
        },
      ),
      code(
        'text',
        `
        # Arsitektur Toko Online Nusantara

        > Terakhir diperiksa: 2026-08-27
        > Diperiksa ulang setiap: rilis besar, atau tiga bulan sekali

        ## 1. Untuk apa sistem ini ada

        Tempat penjual kecil memajang produk dan pembeli memesannya, dengan pembayaran
        lewat gerbang pihak ketiga dan pengiriman lewat ekspedisi pihak ketiga. Bukan
        marketplace besar, melainkan alat bantu bagi sekitar 200 penjual yang sudah
        punya pembeli sendiri.

        ## 2. Batasan

        - Data pembeli wajib disimpan di server dalam negeri.
        - Anggaran infrastruktur tetap, sekitar dua server ukuran menengah.
        - Tim tiga orang, tanpa orang yang khusus mengurus infrastruktur.
        - Wajib bisa dijalankan penuh di laptop dengan satu perintah.

        ## 3. Atribut penggerak

        1. Maintainability. Satu orang baru bisa menambah jenis promo baru dalam
           satu hari tanpa menyentuh modul pesanan.
        2. Konsistensi stok. Stok yang ditampilkan tidak pernah menjual barang
           yang sudah habis.
        3. Operability. Tim tiga orang harus sanggup merawatnya tanpa orang infrastruktur.

        Sengaja TIDAK dikejar:
        - Ketersediaan 99,99 persen. Mati 30 menit di luar jam sibuk masih diterima.
        - Kemandirian rilis per modul. Satu tim, satu jadwal.
        - Skala di atas 500 pesanan per hari. Kalau tercapai, arsitekturnya ditinjau ulang.

        ## 4. Bentuk besarnya

        [diagram konteks](./01-konteks.md) · [diagram container](./02-container.md)

        - **API Toko** [Express]. Seluruh aturan bisnis, modular monolith enam modul.
        - **Pekerja Latar** [Node.js]. Email, laporan, dan PDF. Unit rilis terpisah
          karena pekerjaannya panjang dan tidak boleh menahan jalur permintaan.
        - **Basis Data** [PostgreSQL]. Satu database, satu schema per modul.
        - **Antrean** [Redis + BullMQ]. Penghubung API dan pekerja latar.

        ## 5. Keputusan

        Seluruh alasan ada di [daftar ADR](../adr/README.md). Yang paling menentukan
        bentuk sekarang: ADR 0007 (satu pemilik per tabel) dan ADR 0009 (menunda
        pemecahan layanan).
        `,
        {
          filename: 'docs/arsitektur/README.md',
          caption:
            'Sekitar satu halaman. Semua yang bisa disimpulkan dari kode sengaja tidak ada di sini.',
        },
      ),

      h2('Yang justru tidak boleh ditulis'),
      p(
        'Daftar ini sama pentingnya dengan daftar isi minimum, karena setiap butir di bawah adalah cara dokumen menjadi basi.',
      ),
      table(
        ['Jangan tulis', 'Karena', 'Sebagai gantinya'],
        [
          [
            'Daftar endpoint beserta bentuk permintaan dan responsnya',
            'Berubah tiap minggu dan kodenya sudah menyatakannya',
            'Tautkan ke berkas OpenAPI atau ke skema Zod-nya',
          ],
          [
            'Daftar tabel beserta kolomnya',
            'Migrasi sudah menjadi riwayat resminya',
            'Tautkan ke folder migrasi',
          ],
          [
            'Petunjuk memasang dan menjalankan',
            'Tempatnya di README utama, dan dua salinan pasti berbeda',
            'Tautkan ke README utama',
          ],
          [
            'Rencana yang belum diputuskan',
            'Rencana berubah lebih cepat daripada dokumen diperbarui',
            'Tulis sebagai isu, atau tulis ADR setelah diputuskan',
          ],
          [
            'Penjelasan cara kerja sebuah fungsi',
            'Itu tugas komentar di kodenya',
            'Tulis komentar kenapa di berkasnya',
          ],
        ],
        'Aturan tunggalnya, kalau sebuah fakta bisa berbeda antara dokumen dan kode, ia tidak boleh ada di dokumen.',
      ),
      callout(
        'warning',
        'Dokumen basi tetap dipercaya',
        'Orang baru tidak punya cara membedakan dokumen yang benar dari dokumen yang tertinggal enam bulan. Ia akan membangun pemahaman berdasarkan yang tertulis, lalu mengambil keputusan berdasarkan pemahaman itu. Karena itu menghapus bagian yang tidak sanggup kamu jaga bukan kemalasan, melainkan tindakan yang benar.',
      ),

      h2('Menjaganya tetap benar'),
      p(
        'Tiga kebiasaan berikut menutup sebagian besar jalan menuju kebasian, dan ketiganya murah.',
      ),
      ol(
        '**Tanggal pemeriksaan yang terlihat.** Tulis kapan terakhir diperiksa dan seberapa sering harus diperiksa. Pembaca jadi bisa menilai sendiri seberapa jauh ia percaya, dan pemeriksaan yang terlewat menjadi terlihat.',
        '**Masuk ke daftar periksa pull request.** Satu baris di templat pull request yang bertanya apakah perubahan ini menyentuh bentuk besar sistem. Kalau ya, dokumennya ikut diubah di pull request yang sama.',
        '**Diperiksa saat orang baru bergabung.** Orang baru adalah penguji terbaik, karena ia satu-satunya yang benar-benar membaca dari awal. Minta ia mencatat setiap kalimat yang ternyata tidak cocok dengan kenyataan, lalu perbaiki.',
      ),
      code(
        'text',
        `
        <!-- .github/pull_request_template.md -->

        ## Perubahan ini

        <!-- kenapa, bukan apa -->

        ## Daftar periksa

        - [ ] Test ditulis dan dijalankan, outputnya hijau
        - [ ] Perubahan menyentuh bentuk besar sistem? Kalau ya, docs/arsitektur ikut diubah
        - [ ] Ada keputusan yang mahal dibatalkan? Kalau ya, ADR ditambahkan
        - [ ] Ada batas modul baru atau berubah? Kalau ya, aturan linter ikut diperbarui
        `,
        {
          filename: '.github/pull_request_template.md',
          caption:
            'Pertanyaan berbentuk kondisi, bukan kewajiban, sehingga ia tidak menjadi centang otomatis.',
        },
      ),
      p(
        'Bentuk pertanyaan itu disengaja. Daftar periksa yang berbunyi "perbarui dokumentasi" akan dicentang tanpa dibaca, karena sebagian besar pull request memang tidak menyentuh dokumentasi. Daftar periksa yang berbunyi "kalau menyentuh bentuk besar, ikut ubah dokumennya" memaksa satu detik berpikir, dan satu detik itu yang menyelamatkan.',
      ),

      h2('Hubungannya dengan tiga catatan lain'),
      p(
        'Sekarang ada empat jenis catatan, dan masing-masing punya tempat yang jelas. Kalau tempatnya tidak jelas, isinya akan berpindah-pindah lalu terduplikasi.',
      ),
      table(
        ['Jenis', 'Isinya', 'Umurnya', 'Berubah ketika'],
        [
          [
            'Diagram C4',
            'Bentuk sistem sekarang',
            'Selama sistemnya hidup',
            'Ada container atau modul baru',
          ],
          [
            'ADR',
            'Alasan satu keputusan',
            'Permanen, tidak pernah diubah',
            'Tidak pernah. Yang baru menggantikan',
          ],
          [
            'Dokumen arsitektur',
            'Narasi pengantar dan tautan',
            'Selama sistemnya hidup',
            'Ada perubahan bentuk besar atau atribut penggerak',
          ],
          [
            'Rencana di `plans/`',
            'Catatan kerja satu tugas',
            'Selesai bersama tugasnya',
            'Selama tugas berjalan, lalu dibiarkan sebagai riwayat',
          ],
        ],
        'Keputusan yang lahir dari sebuah rencana dinaikkan menjadi ADR, bukan dibiarkan terkubur di berkas rencana.',
      ),

      h2('Rangkuman'),
      ul(
        'Dokumen arsitektur basi karena menulis hal yang sudah ada di kode, menulis terlalu banyak, dan disimpan terpisah dari kodenya.',
        'Tulis hanya yang tidak bisa disimpulkan dari kode. Yang tidak ditulis tidak bisa basi.',
        'Lima bagian yang memberi hampir seluruh manfaatnya yaitu untuk apa, batasan, atribut penggerak, bentuk besar, dan tautan ke ADR.',
        'Atribut yang sengaja tidak dikejar sama pentingnya dengan yang dikejar.',
        'Tanggal pemeriksaan yang terlihat membuat kebasian menjadi terlihat, bukan tersembunyi.',
        'Empat jenis catatan punya tempat masing-masing, dan keputusan dari sebuah rencana dinaikkan menjadi ADR.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Dokumen arsitektur menjadi basi karena ia menjelaskan hal yang sudah dijelaskan kode, dan karena tidak ada yang memeriksa apakah ia masih benar. Keduanya bisa diperbaiki.',
      ),
      code(
        'text',
        `
        Yang CEPAT basi, dan sebaiknya TIDAK ditulis:

          daftar berkas dan direktori
          tanda tangan fungsi
          nama tabel dan kolom
          langkah-langkah yang sudah ada di skrip
          diagram komponen yang digambar tangan

        Kelimanya sudah ada di kode, dan menyalinnya berarti
        menciptakan salinan kedua yang pasti akan menyimpang.

        Yang LAMBAT basi, dan hanya ada di dokumen:

          kenapa batasnya di situ, bukan di tempat lain
          alternatif yang pernah ditolak, dan alasannya
          atribut kualitas beserta angkanya
          batasan dari luar yang memaksa bentuk tertentu
          apa yang SENGAJA tidak dikerjakan sistem ini
        `,
        {
          caption:
            'Yang lambat basi adalah yang tidak bisa direkonstruksi dari kode, dan karena itu paling berharga.',
        },
      ),
      p(
        'Kesegaran dokumen bukan sesuatu yang harus ditebak, sebab riwayat versi sudah menyimpannya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          README.md   terakhir diubah 2026-08-27,  4 commit
          src/        terakhir diubah 2026-08-27, 12 commit

        Keduanya berubah pada hari yang sama, jadi dokumennya
        relatif segar.

        Yang perlu dicurigai adalah pola sebaliknya:
          dokumen terakhir diubah enam bulan lalu
          kode terakhir diubah kemarin

        Selisih itu bisa dihitung otomatis, dan dijadikan
        peringatan di pipeline — bukan sebagai kegagalan, melainkan
        sebagai daftar dokumen yang perlu diperiksa.
        `,
      ),
      p(
        'Cara paling andal membuat dokumen tidak basi adalah membuat sebagiannya dihasilkan dari kode, bukan ditulis tangan.',
      ),
      code(
        'text',
        `
        Yang bisa DIHASILKAN, dan karena itu tidak pernah basi:

          graf ketergantungan antar lapisan
          daftar endpoint beserta bentuk masukan dan keluarannya
          daftar tabel dan relasinya
          daftar variabel environment yang dibaca

        Diukur sungguhan pada project ini, graf yang dihasilkan dari
        seluruh pernyataan impor:

          116 berkas, 337 sisi
          110  content -> lib
           40  app     -> lib
           36  app     -> components
           32  components -> lib
            1  lib     -> content     <- melawan arah

        Baris terakhir tidak ada di dokumen mana pun, dan ia ada di
        kode. Dokumen yang dihasilkan akan selalu memuatnya.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Dokumen yang basi tidak menghasilkan error, dan ia lebih berbahaya daripada dokumen yang tidak ada, sebab ia tetap dipercaya.',
      ),
      code(
        'text',
        `
        Bentuk kerugiannya:

          orang baru mengikuti dokumen, lalu menemukan bahwa
          separuhnya tidak lagi benar
            -> ia berhenti mempercayai SELURUHNYA, termasuk bagian
               yang masih benar

          keputusan diambil berdasarkan dokumen yang sudah lewat
            -> pekerjaan dibangun di atas asumsi yang salah

          dokumen dipakai sebagai bukti bahwa sesuatu sudah dijamin
            -> "kan sudah ditulis di dokumen arsitektur"
               padahal diukur, satu sisi melawan arah ada di kode
               dan tidak ada di dokumen

        Yang terakhir itu bentuk kegagalan yang paling mahal.
        `,
      ),
      p(
        'Kegagalan kedua bersifat ukuran, yaitu dokumen yang terlalu panjang sehingga tidak dibaca.',
      ),
      code(
        'text',
        `
        Gejala dokumen yang terlalu panjang:

          - disetujui tanpa satu pun komentar substansial
          - yang dikomentari hanya format dan tata bahasa
          - orang bertanya hal yang jawabannya ada di halaman 7
          - versi keduanya tidak pernah ditulis

        Batas satu halaman untuk dokumen desain bukan gaya. Ia
        memaksa memilih, dan yang bertahan setelah dipaksa memilih
        biasanya memang yang menentukan.

        Rincian yang tidak muat bukan dihapus melainkan dipindah ke
        lampiran yang boleh tidak dibaca.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: dokumen tanpa pemilik dan tanpa tanggal.

        Tidak ada yang tahu apakah ia masih benar, dan tidak ada
        yang merasa bertanggung jawab memeriksanya.

        Tiga hal yang murah dan sangat berpengaruh:

          1. Tanggal terakhir diperiksa, bukan tanggal terakhir diubah
             "Diperiksa masih benar pada 2026-09-14"

          2. Satu nama pemilik

          3. Dokumen ada DI DALAM repositori, sehingga ia ikut
             di-review pada pull request yang sama dengan kodenya
        `,
        {
          caption:
            'Nomor 1 berbeda dari tanggal ubah: dokumen bisa masih benar tanpa perlu diubah, dan itu informasi.',
        },
      ),
      p(
        'Kegagalan terakhir adalah dokumen yang menjelaskan hal yang sudah dijelaskan kode, dan itu menciptakan dua sumber kebenaran.',
      ),
      code(
        'text',
        `
        Dua sumber kebenaran selalu menyimpang, dan yang menang
        selalu kode — sebab kode yang dijalankan.

        Karena itu aturannya:
          kode menjelaskan APA dan BAGAIMANA
          dokumen menjelaskan KENAPA

        Dan bila sesuatu harus dijelaskan di dua tempat, buatlah
        yang kedua DIHASILKAN dari yang pertama.

        Diukur pada project ini, contoh yang hanya bisa dihasilkan:
          src/lib/curriculum/authoring.ts
            58 berkas bergantung langsung
            82 dari 116 (71%) secara transitif

        Angka itu berubah setiap kali ada berkas baru, dan menulisnya
        tangan berarti ia salah sejak hari berikutnya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dokumen arsitektur sering ditulis sekali dengan sungguh-sungguh, lalu tidak pernah disentuh lagi.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis daftar berkas dan tanda tangan fungsi',
            'Biar lengkap',
            'Sudah ada di kode. Salinan kedua pasti menyimpang, dan yang menang selalu kode',
          ],
          [
            'Menulis dokumen tujuh halaman',
            'Biar tidak ada yang terlewat',
            'Disetujui tanpa komentar substansial. Pindahkan rincian ke lampiran yang boleh tidak dibaca',
          ],
          [
            'Tidak menulis tanggal dan pemilik',
            'Nanti kelihatan dari git',
            'Tanggal diubah berbeda dari tanggal DIPERIKSA. Dokumen bisa masih benar tanpa perlu diubah',
          ],
          [
            'Menyimpan dokumen di luar repositori',
            'Alatnya lebih rapi',
            'Ia tidak ikut di-review bersama kodenya, dan kesegarannya tidak bisa diperiksa',
          ],
          [
            'Menggambar diagram komponen dengan tangan',
            'Lebih mudah dipahami',
            'Diukur, satu sisi melawan arah ada di kode dan tidak ada di diagram. Hasilkan dari graf impor',
          ],
          [
            'Mempercayai dokumen sebagai jaminan',
            'Itu kan dokumen resmi',
            'Dokumen menyatakan niat. Yang menyatakan kenyataan adalah alat yang membaca kode',
          ],
        ],
      ),
      p(
        'Pembagian yang membuat dokumen bertahan bisa diringkas menjadi tiga kalimat. Yang bisa dihasilkan dari kode, hasilkan. Yang tidak bisa direkonstruksi dari kode, yaitu alasan dan alternatif yang ditolak, tulis dan jaga. Dan yang hanya dibutuhkan untuk satu percakapan, tulis di papan, pakai, lalu buang tanpa merasa bersalah.',
      ),
      references(
        {
          label: 'arc42 overview',
          href: 'https://arc42.org/overview',
          source: 'arc42',
          note: 'Dua belas bagian baku beserta pertanyaan yang dijawab masing-masing.',
        },
        {
          label: 'Why arc42',
          href: 'https://arc42.org/why',
          source: 'arc42',
          note: 'Alasan kerangka ini ada, termasuk pembahasan soal dokumen yang terlalu besar untuk dirawat.',
        },
        {
          label: 'Operational Excellence — Azure Well-Architected',
          href: 'https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/',
          source: 'Microsoft',
          note: 'Sisi proses yang menentukan apakah dokumentasi ikut berubah bersama sistemnya.',
        },
      ),
    ],
  ),

  written(
    'fitness-function',
    'Menjaga Arsitektur lewat Test',
    20,
    'Mengubah aturan arsitektur dari kesepakatan menjadi sesuatu yang gagal di CI.',
    [
      p(
        'Bayangkan sebuah taman kota dengan rumput yang indah. Pengelola memasang papan bertuliskan "dilarang menginjak rumput". Beberapa bulan kemudian, ada jalur tanah gundul melintasi rumput itu, tepat di jalur terpendek antara dua pintu.',
      ),
      p(
        'Tidak ada satu orang pun yang berniat merusak taman. Yang terjadi hanya satu hal, yaitu memotong lewat rumput lebih cepat daripada memutar lewat jalan setapak. Papan larangan kalah oleh kenyataan sederhana itu, setiap hari, sedikit demi sedikit.',
      ),
      p(
        'Taman yang berhasil menjaga rumputnya tidak memasang papan yang lebih besar. Ia memasang **pagar rendah**, atau justru membuat jalan setapak mengikuti jalur yang memang dilewati orang.',
      ),
      p(
        'Pola yang persis sama berulang di hampir setiap project perangkat lunak. Sebuah aturan arsitektur ditetapkan, semua orang setuju, ditulis di dokumen, lalu perlahan hilang. Bukan karena ada yang menolaknya, melainkan karena menembusnya selalu lebih cepat daripada mengikutinya, dan di bawah tenggat pilihan yang lebih cepat selalu menang.',
      ),
      p(
        'Penawarnya bukan papan yang lebih besar, yaitu bukan lebih banyak pengingat dan bukan dokumen yang lebih tegas. Penawarnya adalah pagar, yaitu **mengubah aturan menjadi sesuatu yang bisa gagal**. Aturan yang bisa gagal di CI akan bertahan bertahun-tahun. Aturan yang hanya tertulis akan bertahan beberapa bulan.',
      ),

      terms(
        {
          term: 'fitness function',
          meaning:
            'Pemeriksaan otomatis yang menilai apakah sistem masih memenuhi sifat arsitektur yang diinginkan. Dibaca "fitnes fangsyen", artinya fungsi penilai kebugaran. Istilahnya memang terdengar berat karena diambil dari algoritma evolusioner, tempat fungsi seperti ini menilai seberapa baik sebuah kandidat. Jangan terintimidasi namanya. Wujudnya di project biasa cukup berupa satu berkas test yang membaca kode lalu memeriksa bentuknya, dan contoh di sub-bab ini semuanya di bawah lima puluh baris.',
        },
        {
          term: 'architecture test (test arsitektur)',
          meaning:
            'Test yang memeriksa struktur kode, misalnya siapa boleh mengimpor siapa, apakah ada ketergantungan melingkar, atau apakah sebuah lapisan menyentuh teknologi yang dilarang. Berbeda dari test biasa yang menjalankan kode, test ini membaca kode sebagai data.',
        },
        {
          term: 'guardrail (pagar pengaman)',
          meaning:
            'Pemeriksaan yang menghentikan kesalahan sebelum menyebar, bukan yang memberi tahu setelah terlanjur. Dibaca "gardreil", yaitu pagar pembatas di pinggir jalan raya. Analoginya tepat sekali, karena pagar jalan tidak melarangmu menyetir ke arah jurang lewat papan peringatan, ia benar-benar menahan mobilmu. Pagar pengaman yang baik gagal **di tempat dan waktu kesalahan itu dibuat**, sehingga memperbaikinya masih semudah memindahkan satu baris impor.',
        },
        {
          term: 'drift (penyimpangan)',
          meaning:
            'Selisih yang tumbuh perlahan antara arsitektur yang dimaksudkan dan arsitektur yang benar-benar ada di kode. Dibaca "drift", artinya hanyut perlahan. Sifat yang membuatnya berbahaya, ia **tidak pernah menimbulkan error apa pun**. Aplikasinya tetap jalan, test tetap hijau, pengguna tetap senang. Yang berubah hanya satu, yaitu tiap perubahan berikutnya sedikit lebih lambat daripada sebelumnya, dan tidak ada satu hari pun yang bisa ditunjuk sebagai hari ketika masalahnya dimulai.',
        },
        {
          term: 'ratchet (roda gigi searah)',
          meaning:
            'Teknik menetapkan angka ambang yang hanya boleh membaik dan tidak boleh memburuk, misalnya jumlah pelanggaran yang tersisa. Dibaca "recet", yaitu mekanisme pada kunci pas yang hanya bisa diputar satu arah dan tidak bisa balik. Analoginya tepat karena sifatnya sama persis, yaitu maju boleh, mundur tidak. Berguna sekali untuk kode lama yang sudah terlanjur punya ratusan pelanggaran, karena tanpa teknik ini pilihanmu tinggal dua, yaitu memperbaiki semuanya sekaligus atau mematikan pemeriksaannya.',
        },
      ),

      h2('Empat aturan yang paling layak ditegakkan'),
      p(
        'Tidak semua aturan pantas dijadikan test. Yang pantas adalah yang **sering dilanggar tanpa sengaja** dan yang **mahal diperbaiki kalau terlambat ketahuan**. Empat berikut hampir selalu memenuhi keduanya.',
      ),
      table(
        ['Aturan', 'Kalau dilanggar', 'Cara memeriksanya'],
        [
          [
            'Modul hanya diimpor lewat pintu masuk resminya',
            'Batas modul hilang perlahan, pemecahan nanti menjadi mahal',
            'Aturan linter, atau test yang membaca impor',
          ],
          [
            'Lapisan aturan bisnis tidak menyentuh HTTP atau ORM',
            'Aturan terkunci pada satu cara pemanggilan dan sulit diuji',
            'Aturan linter per folder',
          ],
          [
            'Tidak ada ketergantungan melingkar antar modul',
            'Dua modul yang saling butuh sebenarnya satu modul yang belum diakui',
            'Test yang menelusuri graf impor',
          ],
          [
            'Satu tabel ditulis satu modul',
            'Aturan bisnis bisa dilewati, dan pemiliknya kehilangan kebebasan',
            'Test yang mencari nama tabel di luar modul pemiliknya',
          ],
        ],
        'Keempatnya menjaga hal yang tidak akan pernah muncul sebagai error saat aplikasi berjalan.',
      ),

      h2('Test yang menelusuri graf impor'),
      p(
        'Ketergantungan melingkar layak mendapat test sendiri karena ia sulit terlihat saat review. Melingkarnya sering lewat tiga atau empat berkas, dan tidak ada satu pun pull request yang terlihat salah sendirian.',
      ),
      code(
        'ts',
        `
        import { readFileSync } from 'node:fs';
        import { globSync } from 'node:fs';
        import { describe, expect, it } from 'vitest';

        /** Membaca modul mana saja yang diimpor sebuah modul, lewat pintu masuk resmi. */
        function petaKetergantungan(): Map<string, Set<string>> {
          const peta = new Map<string, Set<string>>();

          for (const berkas of globSync('src/*/**/*.ts')) {
            const pemilik = berkas.split('/')[1];
            if (pemilik === undefined) continue;

            const tujuan = peta.get(pemilik) ?? new Set<string>();
            for (const cocok of readFileSync(berkas, 'utf8').matchAll(/from '@\\/([a-z-]+)'/g)) {
              const modulTujuan = cocok[1];
              if (modulTujuan !== undefined && modulTujuan !== pemilik) tujuan.add(modulTujuan);
            }
            peta.set(pemilik, tujuan);
          }

          return peta;
        }

        /** Mencari satu lingkaran, kalau ada. Mengembalikan jalurnya supaya bisa dibaca. */
        function cariLingkaran(peta: Map<string, Set<string>>): string[] | null {
          const sedangDikunjungi = new Set<string>();
          const sudahSelesai = new Set<string>();
          const jalur: string[] = [];

          function telusuri(modul: string): string[] | null {
            if (sedangDikunjungi.has(modul)) return [...jalur, modul];
            if (sudahSelesai.has(modul)) return null;

            sedangDikunjungi.add(modul);
            jalur.push(modul);

            for (const tetangga of peta.get(modul) ?? []) {
              const ketemu = telusuri(tetangga);
              if (ketemu) return ketemu;
            }

            jalur.pop();
            sedangDikunjungi.delete(modul);
            sudahSelesai.add(modul);
            return null;
          }

          for (const modul of peta.keys()) {
            const ketemu = telusuri(modul);
            if (ketemu) return ketemu;
          }
          return null;
        }

        describe('bentuk ketergantungan', () => {
          it('tidak ada ketergantungan melingkar antar modul', () => {
            const lingkaran = cariLingkaran(petaKetergantungan());
            expect(lingkaran, \`lingkaran ditemukan: \${lingkaran?.join(' -> ')}\`).toBeNull();
          });
        });
        `,
        {
          filename: 'src/test/ketergantungan-modul.test.ts',
          caption:
            'Pesan kegagalannya menyebut jalur lengkapnya, sehingga yang membacanya langsung tahu harus melihat ke mana.',
        },
      ),
      callout(
        'tip',
        'Pesan kegagalan adalah setengah nilai sebuah test arsitektur',
        'Test yang gagal dengan pesan "expected null" memaksa orang menebak. Test yang gagal dengan pesan "lingkaran ditemukan: pesanan -> katalog -> promo -> pesanan" langsung menunjukkan tempat masalahnya. Karena test arsitektur biasanya gagal di tangan orang yang tidak menulisnya, kualitas pesannya menentukan apakah ia membantu atau sekadar menghalangi.',
      ),

      h2('Memeriksa kepemilikan tabel'),
      p(
        'Aturan satu pemilik per tabel dari sub-bab 3.4 tidak bisa dijaga linter, karena nama tabel muncul sebagai teks di dalam query. Test sederhana yang membaca berkas menutup celah itu.',
      ),
      code(
        'ts',
        `
        import { readFileSync, globSync } from 'node:fs';
        import { describe, expect, it } from 'vitest';

        // Pemilik tiap schema. Menambah schema baru wajib menambah barisnya di sini,
        // sehingga kepemilikan tidak pernah tersirat.
        const PEMILIK: Record<string, string> = {
          pesanan: 'pesanan',
          katalog: 'katalog',
          pembayaran: 'pembayaran',
          pengguna: 'pengguna',
        };

        describe('kepemilikan tabel', () => {
          it('hanya modul pemilik yang menyentuh schema-nya', () => {
            const pelanggaran: string[] = [];

            for (const berkas of globSync('src/*/**/*.ts')) {
              // Pemeliharaan dan migrasi memang boleh melintasi schema.
              if (berkas.includes('/pemeliharaan/')) continue;

              const pemilikBerkas = berkas.split('/')[1];
              const isi = readFileSync(berkas, 'utf8');

              for (const [schema, pemilikSchema] of Object.entries(PEMILIK)) {
                if (pemilikBerkas === pemilikSchema) continue;
                if (new RegExp(\`\\\\b\${schema}\\\\.[a-z_]+\`).test(isi)) {
                  pelanggaran.push(\`\${berkas} menyentuh schema \${schema}\`);
                }
              }
            }

            expect(pelanggaran, pelanggaran.join('\\n')).toEqual([]);
          });
        });
        `,
        {
          filename: 'src/test/kepemilikan-tabel.test.ts',
          caption:
            'Pengecualian folder pemeliharaan ditulis eksplisit, sehingga pengecualiannya terlihat dan bisa diperdebatkan.',
        },
      ),
      p(
        'Baris pengecualian itu penting untuk dibahas. Setiap test arsitektur pasti punya pengecualian yang sah, misalnya query rekonsiliasi dari sub-bab 3.4 yang memang melintasi batas. Yang membedakan pengecualian sehat dari lubang adalah pengecualian itu **ditulis di satu tempat dan terlihat di diff** ketika seseorang menambahnya.',
      ),

      h2('Kode lama yang sudah terlanjur melanggar'),
      p(
        'Menyalakan test arsitektur di kode yang sudah berjalan bertahun-tahun akan menghasilkan ratusan pelanggaran sekaligus. Menghadapinya dengan mematikan test-nya adalah reaksi yang wajar sekaligus yang salah. Teknik ratchet menyelesaikan ini.',
      ),
      compare(
        {
          title: 'Semua atau tidak sama sekali',
          lang: 'ts',
          code: `
            expect(pelanggaran).toEqual([]);

            // Di kode lama: 247 pelanggaran.
            // Reaksi yang pasti terjadi: test ini di-skip,
            // lalu tidak pernah dinyalakan lagi.
          `,
          notes: [
            'Terlalu jauh dari keadaan sekarang untuk bisa dikerjakan',
            'Ujungnya test dimatikan dan penyimpangan berlanjut',
          ],
        },
        {
          title: 'Ratchet, hanya boleh membaik',
          lang: 'ts',
          code: `
            // Angka ini HANYA boleh turun. Naik berarti ada pelanggaran baru.
            // Turun berarti ada yang diperbaiki, dan angkanya ikut diturunkan.
            const AMBANG = 247;

            expect(pelanggaran.length).toBeLessThanOrEqual(AMBANG);
          `,
          notes: [
            'Pelanggaran baru langsung gagal di CI',
            'Yang lama diperbaiki bertahap tanpa menghentikan pekerjaan lain',
            'Angkanya turun terlihat di diff, jadi kemajuannya kelihatan',
          ],
        },
      ),
      p(
        'Kurikulum yang sedang kamu baca memakai teknik yang persis sama. Test integritasnya menyimpan angka jumlah sub-bab yang punya blok rujukan resmi, dengan komentar bahwa angka itu hanya boleh naik. Prinsipnya identik, yaitu **mencegah kemunduran sambil memberi ruang perbaikan bertahap**.',
      ),

      h2('Sifat yang bisa diukur selain struktur'),
      p(
        'Fitness function tidak terbatas pada impor. Beberapa atribut kualitas dari sub-bab 1.3 juga bisa dijadikan pemeriksaan otomatis, dan itulah yang mengubahnya dari harapan menjadi syarat.',
      ),
      table(
        ['Sifat', 'Cara memeriksanya otomatis', 'Gagal ketika'],
        [
          [
            'Ukuran bundel klien tidak membengkak',
            'Bandingkan hasil build dengan ambang yang tercatat',
            'Melewati ambang, sehingga penambahan library berat menjadi keputusan sadar',
          ],
          [
            'Test unit tetap cepat',
            'Ukur waktu test yang tidak menyentuh database',
            'Melewati batas waktu, biasanya karena ada yang mulai menyentuh infrastruktur',
          ],
          [
            'Tidak ada rahasia yang ikut ter-commit',
            'Pemindai rahasia di pipeline',
            'Ada pola kunci atau token di diff',
          ],
          [
            'Setiap endpoint punya pemeriksaan otorisasi',
            'Test yang memanggil tiap rute tanpa token dan mengharapkan 401',
            'Ada rute baru yang lupa dipasangi pemeriksaan',
          ],
          [
            'Waktu tanggap jalur utama tetap di bawah target',
            'Test performa di pipeline dengan data seukuran produksi',
            'Melewati anggaran latensi yang ditetapkan',
          ],
        ],
        'Baris keempat adalah fitness function keamanan, dan ia menutup celah yang paling sering muncul saat menambah endpoint.',
      ),
      callout(
        'warning',
        'Test arsitektur menjaga bentuk, bukan kebenaran',
        'Kode yang lulus seluruh test arsitektur bisa saja tetap salah hasilnya, dan kode yang benar bisa saja melanggar sebuah aturan bentuk. Keduanya lapisan yang berbeda dan keduanya dibutuhkan. Jangan pernah menukar test perilaku dengan test bentuk, karena Feature Definition of Done tetap menuntut keduanya.',
      ),

      h2('Rangkuman'),
      ul(
        'Aturan yang hanya tertulis akan hilang. Aturan yang bisa gagal di CI bertahan bertahun-tahun.',
        'Yang pantas dijadikan test adalah aturan yang sering dilanggar tanpa sengaja dan mahal kalau terlambat ketahuan.',
        'Empat yang paling layak yaitu pintu masuk modul, lapisan yang tidak menyentuh teknologi, ketergantungan melingkar, dan kepemilikan tabel.',
        'Pesan kegagalan adalah setengah nilai sebuah test arsitektur, karena ia gagal di tangan orang yang tidak menulisnya.',
        'Untuk kode lama, pakai ratchet supaya pelanggaran baru gagal sementara yang lama diperbaiki bertahap.',
        'Fitness function juga berlaku untuk ukuran bundel, kecepatan test, rahasia, dan otorisasi endpoint.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Fitness function adalah test yang mengukur sifat arsitektur, bukan perilaku fitur. Yang membuatnya bekerja adalah ia berjalan otomatis, sebab aturan yang hanya hidup di kepala orang akan menyimpang.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan pada project ini, sekitar tiga puluh
        baris kode yang menelusuri seluruh pernyataan impor:

          GAGAL  lib tidak boleh bergantung pada content  (1 pelanggaran)
                   src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts
          LULUS  components tidak boleh bergantung pada app
          LULUS  content tidak boleh bergantung pada components
          GAGAL  tidak ada siklus ketergantungan  (3 pelanggaran)
                   src/app/dashboard-client.tsx -> src/app/page.tsx -> ...
                   src/app/latihan/latihan-client.tsx -> ...
                   src/app/roadmap/page.tsx -> ...
          LULUS  tidak ada berkas di atas 400 KB

          -> 3 aturan gagal
        `,
        {
          caption:
            'Tidak satu pun dari ketiga pelanggaran itu sengaja dibuat. Ketiganya menyelinap masuk karena tidak ada yang memeriksa.',
        },
      ),
      p(
        'Yang bisa diukur sebagai fitness function jauh lebih banyak daripada arah ketergantungan, dan sebagian besarnya murah.',
      ),
      table(
        ['Sifat yang diukur', 'Cara mengukurnya', 'Ambang yang lazim'],
        [
          ['Arah ketergantungan', 'Telusuri impor, kelompokkan per lapisan', 'Nol pelanggaran'],
          ['Siklus', 'Telusuri graf, cari simpul yang kembali', 'Nol'],
          ['Ukuran berkas', 'Baca ukuran berkas', 'Ambang yang disepakati'],
          ['Waktu pemeriksaan', 'Ukur durasi tiap langkah', 'Diukur: type-check 2.403 ms'],
          [
            'Ukuran bundel klien',
            'Jumlahkan berkas keluaran build',
            'Diukur: 1.823,4 KB, chunk terbesar 653,4 KB',
          ],
          [
            'Data bocor ke klien',
            'Cari string tertentu di keluaran build',
            'Diukur: 0 berkas di `.next/static`',
          ],
        ],
      ),
      p(
        'Baris terakhir pantas diperhatikan sebab ia fitness function keamanan yang bisa dijalankan pada setiap build.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada keluaran build project ini:

          string materi kurikulum di .next/static (KLIEN)  : 0 berkas
          string materi kurikulum di .next/server (SERVER) : 1.250 berkas

        Perintahnya satu baris:
          grep -rl "kata-yang-dicari" .next/static | wc -l

        Dijadikan aturan: nilai apa pun yang tidak boleh sampai ke
        peramban diperiksa dengan cara itu pada setiap build. Bila
        hasilnya bukan nol, build-nya gagal.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Fitness function punya satu cara gagal yang mematikan seluruh manfaatnya, yaitu menghasilkan terlalu banyak positif palsu.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini. Aturan "tidak ada import
        paket luar di src/content", ditulis dua cara:

          aturan NAIF  (cocokkan teks "import ... from" di mana saja)
            259 "pelanggaran"

          aturan BENAR (hanya blok impor di AWAL berkas)
            0 pelanggaran

        Selisihnya SELURUHNYA positif palsu: kata "import" yang
        muncul di dalam CONTOH KODE yang ditulis sebagai teks materi.

        Fitness function yang menghasilkan 259 positif palsu akan
        dimatikan dalam seminggu, dan seluruh manfaatnya hilang —
        termasuk untuk aturan-aturan lain yang sebenarnya benar.
        `,
        {
          caption:
            'Alat penegak harus lebih dipercaya daripada aturannya, atau ia yang akan diabaikan lebih dulu.',
        },
      ),
      p(
        'Kegagalan kedua adalah aturan yang ditambahkan ke codebase yang sudah punya banyak pelanggaran, sehingga ia merah sejak hari pertama.',
      ),
      code(
        'text',
        `
        Diukur pada project ini: 3 dari 5 aturan GAGAL saat pertama
        dijalankan.

        Bila aturan itu langsung dijadikan penggagal build, tidak
        ada yang bisa merilis apa pun sampai ketiganya diperbaiki.

        Yang bekerja: AMBANG YANG MENURUN.

          siklus ketergantungan: maksimal 3
          -> hari ini lulus dengan 3
          -> bila bertambah menjadi 4, build GAGAL
          -> setiap kali ada yang memperbaiki satu, ambangnya
             diturunkan menjadi 2

        Dengan begitu, keadaannya tidak pernah memburuk, dan
        perbaikannya bisa dilakukan bertahap.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: aturan yang tidak bisa ditindaklanjuti.

          GAGAL  coupling terlalu tinggi

        Berapa? Di berkas mana? Apa yang harus diubah?

        Bandingkan dengan bentuk yang bisa ditindaklanjuti:

          GAGAL  lib tidak boleh bergantung pada content (1 pelanggaran)
                   src/lib/curriculum/queries.ts -> src/content/curriculum/index.ts

        Baris kedua menyebut berkasnya, tujuannya, dan aturannya.
        Yang membacanya tahu persis apa yang harus dilakukan.
        `,
      ),
      p(
        'Kegagalan keempat menyangkut apa yang TIDAK bisa ditangkap fitness function berbasis impor, dan itu perlu dinyatakan dengan jujur.',
      ),
      code(
        'text',
        `
        Yang TIDAK muncul di graf impor sama sekali:

          - dua modul yang membaca tabel yang sama
          - JOIN lintas modul di dalam SQL
          - panggilan lewat HTTP antar bagian
          - ketergantungan lewat nama berkas atau konfigurasi

        Yang pertama paling sering, dan paling mahal. Menemukannya
        menuntut pemeriksaan yang berbeda: daftar tabel yang
        disentuh tiap modul, bukan daftar impor.

        Dan ada satu sumber lagi yang sering terlewat, yaitu riwayat
        perubahan. Diukur dari git project ini:

          3x bersama (50% dari perubahan yang lebih jarang)
              src/lib/content/types.ts
              src/test/curriculum-integrity.test.ts
          3x bersama (60%)
              src/content/glossary.ts
              src/test/curriculum-integrity.test.ts

        Dua berkas yang selalu berubah bersamaan punya coupling,
        terlepas dari apakah ada import di antara keduanya.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Fitness function mudah ditulis dan mudah ditulis dengan cara yang membuatnya diabaikan dalam seminggu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis aturan dengan pencocokan teks',
            'Lebih cepat ditulis',
            'Diukur, aturan naif menghasilkan 259 positif palsu melawan 0 pelanggaran sesungguhnya',
          ],
          [
            'Menjadikan aturan baru penggagal build seketika',
            'Aturannya kan memang benar',
            'Diukur, 3 dari 5 aturan gagal sejak hari pertama. Pakai ambang yang menurun',
          ],
          [
            'Menulis pesan gagal tanpa menyebut berkasnya',
            'Aturannya kan sudah jelas',
            '"Coupling terlalu tinggi" tidak bisa ditindaklanjuti. Sebutkan berkas, tujuan, dan aturannya',
          ],
          [
            'Mengandalkan graf impor untuk semua batas',
            'Itu kan ketergantungannya',
            'Tabel yang dibaca dua modul dan JOIN lintas modul tidak muncul di graf impor sama sekali',
          ],
          [
            'Menulis aturan arsitektur hanya di dokumen',
            'Timnya sudah sepakat',
            'Diukur, tiga aturan dilanggar tanpa ada yang sengaja melanggarnya',
          ],
          [
            'Menunda memasangnya sampai codebase besar',
            'Sekarang masih kecil',
            'Penyimpangan tumbuh diam-diam, dan memperbaikinya kemudian jauh lebih mahal',
          ],
        ],
      ),
      p(
        'Yang membuat fitness function berbeda dari dokumen arsitektur adalah bahwa ia berjalan. Aturan yang ditulis di dokumen menyatakan niat, dan aturan yang dijalankan pada setiap perubahan menyatakan kenyataan. Pengukuran pada project ini menunjukkan selisihnya dengan jelas: tiga pelanggaran yang tidak ada di dokumen mana pun, dan tidak satu pun sengaja dibuat.',
      ),
      references(
        {
          label: 'no-restricted-imports',
          href: 'https://eslint.org/docs/latest/rules/no-restricted-imports',
          source: 'ESLint',
          note: 'Penegakan batas impor yang paling murah dipasang dan paling cepat memberi umpan balik.',
        },
        {
          label: 'Vitest guide',
          href: 'https://vitest.dev/guide/',
          source: 'Vitest',
          note: 'Runner yang dipakai contoh test arsitektur di sub-bab ini.',
        },
        {
          label: 'Project references',
          href: 'https://www.typescriptlang.org/docs/handbook/project-references.html',
          source: 'TypeScript',
          note: 'Penegakan batas di tingkat compiler, satu tingkat lebih ketat daripada linter.',
        },
      ),
    ],
  ),

  written(
    'evolusi-arsitektur',
    'Arsitektur yang Berevolusi',
    22,
    'Mengenali kapan bentuk yang dulu benar sudah tidak cocok, tanpa membongkar semuanya.',
    [
      p(
        'Pikirkan sebuah warung yang tumbuh. Awalnya satu meja di teras rumah, dan itu bentuk yang tepat. Setelah ramai, terasnya diperluas. Setelah lebih ramai lagi, dapurnya dipindah ke belakang supaya asapnya tidak mengganggu pembeli.',
      ),
      p(
        'Tidak ada satu pun dari tiga bentuk itu yang salah. Yang pertama tepat untuk keadaannya, dan menjadi tidak tepat setelah keadaannya berubah. Yang sering dilupakan orang, warung yang sejak awal dibangun sebesar restoran akan bangkrut sebelum ramai, karena ia membayar sewa dan listrik untuk kursi yang kosong.',
      ),
      p(
        'Seluruh kategori ini berangkat dari asumsi yang sama, yaitu **keadaan berubah**. Jumlah pengguna berubah, jumlah orang yang mengerjakan berubah, kebutuhan bisnis berubah. Bentuk yang paling tepat pada tahun pertama sering bukan bentuk yang paling tepat pada tahun ketiga, dan itu bukan tanda ada yang salah di tahun pertama.',
      ),
      p(
        'Yang membedakan sistem sehat dari sistem yang mengeras bukan seberapa benar bentuk awalnya, melainkan seberapa mudah bentuk itu bisa **berubah tanpa dibongkar**. Sub-bab ini membahas cara mengenali kapan waktunya, dan cara menjalankannya bertahap.',
      ),

      terms(
        {
          term: 'evolutionary architecture',
          meaning:
            'Cara merancang yang mengasumsikan bentuknya akan berubah, sehingga yang dioptimalkan bukan ketepatan tebakan awal melainkan murahnya perubahan nanti. Dibaca "ivolusyonari arsitektur", artinya arsitektur yang berevolusi. Pergeseran pola pikirnya begini. Pertanyaan lama, "bentuk apa yang paling tepat untuk lima tahun ke depan". Pertanyaan baru, "bentuk apa yang tepat untuk sekarang, **dan** apa yang membuat kita tetap bisa berpindah nanti". Pertanyaan kedua jauh lebih mungkin dijawab benar, karena ia tidak menuntut siapa pun meramal masa depan.',
        },
        {
          term: 'architectural drift',
          meaning:
            'Selisih yang tumbuh perlahan antara bentuk yang dimaksudkan dan bentuk yang benar-benar ada di kode. Ini yang dijaga fitness function di sub-bab sebelumnya. Berbeda dari perubahan yang disengaja, drift terjadi tanpa ada yang memutuskan.',
        },
        {
          term: 'architectural erosion',
          meaning:
            'Tahap lanjut dari drift, yaitu ketika bentuk aslinya sudah tidak bisa dikenali lagi dan aturan lamanya sudah tidak ada yang mengikuti. Dibaca "arsitektural irosyen", artinya pengikisan arsitektur, seperti tebing yang terkikis ombak sedikit demi sedikit sampai bentuknya berubah total. Bedanya dengan drift adalah soal tingkat. Drift masih bisa dikoreksi kembali ke bentuk semula. Erosi sudah tidak, dan pada tahap ini memperbaikinya berarti **menetapkan bentuk baru** yang cocok dengan kenyataan sekarang, bukan berusaha mengembalikan yang lama.',
        },
        {
          term: 'technical debt (utang teknis)',
          meaning:
            'Kerumitan tambahan yang muncul karena keputusan cepat, dan harus dibayar setiap kali kode itu disentuh. Yang membedakan utang sehat dari utang berbahaya adalah apakah ia diambil sadar dan apakah ada rencana melunasinya.',
        },
        {
          term: 'sunk cost fallacy',
          meaning:
            'Kekeliruan berpikir yang mempertahankan sesuatu karena sudah banyak usaha ditanamkan di dalamnya, bukan karena ia masih berguna. Dibaca "sank kost falasi", artinya jebakan biaya yang sudah telanjur. Contoh sehari-harinya, tetap menonton film yang membosankan karena tiketnya sudah dibeli, padahal uang tiketnya tidak akan kembali entah kamu bertahan atau pulang. Di dunia arsitektur bunyinya begini, "kita sudah menghabiskan enam bulan membangun ini, sayang kalau diubah". Pertanyaan yang benar bukan berapa yang sudah dikeluarkan, melainkan mana yang lebih murah **mulai hari ini**.',
        },
        {
          term: 'big rewrite',
          meaning:
            'Menulis ulang sistem dari nol sambil sistem lama tetap berjalan. Dibaca "big rirait", artinya penulisan ulang besar-besaran. Kenapa ia hampir selalu memakan waktu jauh lebih lama daripada perkiraan. Karena sistem lama **tidak berhenti** selama penulisan ulang berjalan. Ia terus menerima permintaan fitur baru, dan tiap fitur baru harus dibangun dua kali, sekali di sistem lama supaya pengguna terlayani dan sekali di sistem baru supaya ia tidak tertinggal. Akibatnya jarak antara keduanya tidak pernah menutup, mirip mengejar bus yang terus berjalan.',
        },
      ),

      h2('Empat sinyal bahwa bentuknya sudah tidak cocok'),
      p(
        'Perubahan arsitektur sebaiknya dipicu bukti, bukan perasaan. Empat sinyal berikut bisa diukur, dan itulah yang membedakannya dari sekadar bosan dengan kode lama.',
      ),
      table(
        ['Sinyal', 'Cara mengukurnya', 'Kemungkinan artinya'],
        [
          [
            'Satu perubahan bisnis selalu menyentuh banyak wilayah',
            'Hitung berapa modul yang tersentuh untuk sepuluh perubahan terakhir',
            'Batas memotong sesuatu yang seharusnya utuh. Kembali ke sub-bab 2.4',
          ],
          [
            'Waktu dari kode selesai sampai rilis makin panjang',
            'Ukur jeda antara pull request digabung dan perubahannya sampai ke pengguna',
            'Ada pihak yang saling menunggu. Periksa pertanyaan pertama tabel keputusan',
          ],
          [
            'Test makin lama dan makin sering dilewati',
            'Ukur waktu test dan hitung berapa kali ada yang menandainya dilewati',
            'Aturan bisnis makin terikat pada infrastruktur. Kembali ke sub-bab 1.6',
          ],
          [
            'Waktu menemukan penyebab masalah makin panjang',
            'Catat waktu dari laporan sampai penyebabnya diketahui',
            'Alur makin tersebar tanpa penelusuran yang memadai',
          ],
        ],
        'Tanpa angka, semua ini terasa sebagai keluhan. Dengan angka, ia menjadi bukti yang bisa diperdebatkan.',
      ),
      callout(
        'warning',
        'Bosan dengan kode lama bukan sinyal',
        'Keinginan memakai teknologi baru atau bentuk yang lebih menarik adalah hal yang manusiawi dan tidak perlu disembunyikan. Yang tidak boleh adalah menyamarkannya menjadi alasan teknis. Kalau alasan sesungguhnya adalah ingin mencoba sesuatu, katakan begitu, lalu carikan tempat yang risikonya kecil. Anti-pola `resume-driven development` di sub-bab 1.8 lahir dari alasan yang tidak jujur, bukan dari keinginan belajar.',
      ),

      h2('Kenapa menulis ulang hampir selalu kalah'),
      p(
        'Ketika sebuah sistem terasa sudah tidak cocok, godaan pertama adalah menulis ulang dari nol. Godaan itu kuat karena bayangannya menyenangkan, yaitu kode bersih tanpa kompromi. Kenyataannya punya tiga masalah yang jarang diperhitungkan.',
      ),
      ol(
        '**Targetnya bergerak.** Sistem lama tidak berhenti selama penulisan ulang berjalan. Setiap fitur baru harus dibangun dua kali, dan jarak antara keduanya tidak pernah menutup.',
        '**Pengetahuan yang tidak tertulis ikut hilang.** Kode lama penuh perilaku aneh yang ternyata menyelesaikan kasus nyata. Sebagian besar tidak terdokumentasi, dan baru ketahuan setelah sistem baru dipakai lalu gagal pada kasus itu.',
        '**Tidak ada nilai yang sampai ke pengguna sampai selesai.** Selama enam sampai delapan belas bulan, seluruh usaha tidak menghasilkan apa pun yang bisa dipakai, dan risikonya menumpuk sampai akhir.',
      ),
      p(
        'Perbandingannya dengan pendekatan bertahap dari sub-bab 2.6 sangat timpang. Pemindahan bertahap memberi nilai sejak bagian pertama berpindah, bisa dihentikan kapan saja tanpa membuang seluruh usaha, dan setiap langkahnya bisa dibatalkan sendiri.',
      ),
      compare(
        {
          title: 'Menulis ulang',
          lang: 'text',
          code: `
            bulan 1-12   membangun sistem baru
                         sistem lama tetap berjalan dan tetap bertambah fitur
            bulan 13     pindah total dalam satu malam
            bulan 13-16  memperbaiki kasus yang tidak terpikir

            Nilai sampai ke pengguna: bulan ke-13
            Bisa dibatalkan: hanya sebelum bulan 13, dengan membuang semuanya
          `,
          notes: [
            'Seluruh risiko menumpuk di satu malam',
            'Pengetahuan tidak tertulis baru ketahuan setelah pindah',
          ],
        },
        {
          title: 'Berevolusi bertahap',
          lang: 'text',
          code: `
            bulan 1      tegakkan batas modul di kode yang ada
            bulan 2      pindahkan kepemilikan data
            bulan 3      bagian pertama berpindah, di belakang flag
            bulan 4      bagian kedua berpindah
            ...          berhenti kapan saja kalau ternyata sudah cukup

            Nilai sampai ke pengguna: bulan ke-1
            Bisa dibatalkan: setiap langkah, sendiri-sendiri
          `,
          notes: [
            'Risiko tersebar dan kecil di tiap langkah',
            'Kasus yang tidak terpikir muncul saat masih mudah dibatalkan',
          ],
        },
      ),

      h2('Kapan menulis ulang justru benar'),
      p(
        'Selalu ada pengecualian, dan menyebutkannya membuat nasihat di atas bisa dipercaya. Ada tiga keadaan ketika menulis ulang memang pilihan yang lebih baik.',
      ),
      ul(
        '**Sistemnya kecil.** Kalau seluruh sistem bisa ditulis ulang dalam beberapa minggu, seluruh keberatan di atas kehilangan bobotnya.',
        '**Platformnya sudah tidak didukung.** Runtime yang sudah tidak menerima perbaikan keamanan bukan soal selera, melainkan soal risiko yang tidak bisa ditawar.',
        '**Masalahnya ternyata dipahami keliru sejak awal.** Kalau model datanya salah secara mendasar, memindahkan bagian demi bagian hanya memindahkan kesalahan yang sama.',
      ),

      h2('Membuat perubahan tetap murah'),
      p(
        'Cara terbaik menghadapi perubahan bentuk adalah membuat perubahan itu murah sejak awal. Empat kebiasaan berikut sudah dibahas di kategori ini, dan di sini keempatnya berdiri sebagai satu strategi.',
      ),
      steps(
        {
          title: 'Batas yang jelas dan ditegakkan',
          body: 'Batas adalah tempat perubahan bisa berhenti. Tanpa batas, setiap perubahan menyebar sejauh yang bisa dicapai impor. Ini yang membuat sub-bab 2.2 dan 4.4 menjadi investasi, bukan formalitas.',
        },
        {
          title: 'Ketergantungan luar dibungkus',
          body: 'Setiap layanan pihak ketiga, setiap ORM, dan setiap penyedia disentuh lewat satu permukaan milikmu. Mengganti salah satunya jadi berarti menulis satu adapter baru, bukan menyentuh seratus tempat.',
        },
        {
          title: 'Keputusan satu arah ditunda dan dicatat',
          body: 'Keputusan yang belum harus diambil sekarang tidak diambil, dan yang sudah diambil dicatat beserta pemicu peninjauannya. Dengan begitu, meninjaunya nanti bukan pekerjaan arkeologi.',
        },
        {
          title: 'Ada cara mengalihkan bertahap',
          body: 'Feature flag dan kemampuan menjalankan dua jalur berdampingan adalah alat yang mengubah perubahan besar menjadi rangkaian perubahan kecil. Tanpanya, setiap perubahan bentuk menjadi peristiwa satu malam.',
        },
      ),
      code(
        'text',
        `
        Pemicu peninjauan yang ditulis di ADR, dan diperiksa tiap kuartal:

        ADR 0009 — menunda pemecahan layanan
          Ditinjau ulang kalau:
            [ ] ada tim kedua yang butuh jadwal rilis sendiri
            [x] jeda dari merge sampai rilis melewati 5 hari kerja       <- terpenuhi
            [ ] satu modul butuh mesin dengan memori 4x modul lain

        ADR 0011 — satu database untuk semua modul
          Ditinjau ulang kalau:
            [ ] ukuran satu schema melewati 500 GB
            [ ] ada modul yang butuh jenis penyimpanan berbeda
        `,
        {
          caption:
            'Daftar seperti ini mengubah peninjauan dari inisiatif seseorang menjadi rutinitas yang terjadwal.',
        },
      ),
      p(
        'Bentuk ini menyelesaikan masalah yang sangat nyata. Tanpa pemicu tertulis, meninjau ulang sebuah keputusan selalu terasa seperti menyerang pekerjaan orang lain, sehingga tidak ada yang memulainya sampai keadaannya sudah parah. Dengan pemicu tertulis, peninjauan menjadi sesuatu yang sudah disepakati sejak awal oleh orang yang membuat keputusannya sendiri.',
      ),

      h2('Menyimpan utang teknis supaya tetap terlihat'),
      p(
        'Sebagian kompromi memang harus diambil, dan itu wajar. Yang membedakan utang sehat dari utang yang berbahaya adalah apakah ia terlihat.',
      ),
      table(
        ['Utang yang sehat', 'Utang yang berbahaya'],
        [
          [
            'Diambil sadar, dengan alasan yang bisa disebutkan',
            'Terjadi tanpa ada yang memutuskan',
          ],
          ['Tercatat, misalnya sebagai isu atau ADR', 'Hanya diketahui orang yang membuatnya'],
          ['Punya pemicu pelunasan yang jelas', 'Tidak pernah dijadwalkan'],
          ['Terbatas wilayahnya', 'Menyebar karena ditiru orang berikutnya'],
          [
            'Bunganya diketahui, yaitu berapa lambat kerja karenanya',
            'Bunganya dibayar terus tanpa disadari',
          ],
        ],
        'Baris terakhir yang paling menentukan, karena utang yang bunganya tidak diketahui tidak akan pernah dilunasi.',
      ),
      callout(
        'tip',
        'Tulis komentar utang di tempat kejadiannya',
        'Sebuah komentar `TODO` tanpa alasan adalah kebisingan, dan aturan `documentation.md` di project ini menolaknya. Yang berguna adalah komentar yang menyebut apa yang dikompromikan, kenapa saat itu, dan apa yang harus terjadi sebelum ia dilunasi. Komentar seperti itu tetap benar bertahun-tahun kemudian, dan ia berada tepat di tempat orang berikutnya akan membacanya.',
      ),

      h2('Rangkuman'),
      ul(
        'Yang menentukan kesehatan sistem bukan ketepatan bentuk awalnya, melainkan murahnya perubahan bentuk nanti.',
        'Empat sinyal yang bisa diukur yaitu perubahan yang menyebar, rilis yang melambat, test yang makin lama, dan penelusuran yang makin sulit.',
        'Bosan dengan kode lama bukan sinyal. Kalau alasannya ingin mencoba sesuatu, katakan begitu dan carikan tempat berisiko kecil.',
        'Menulis ulang hampir selalu kalah karena targetnya bergerak, pengetahuan tak tertulis hilang, dan tidak ada nilai sampai selesai.',
        'Empat kebiasaan yang membuat perubahan murah yaitu batas yang ditegakkan, ketergantungan yang dibungkus, keputusan satu arah yang ditunda, dan pengalihan bertahap.',
        'Utang teknis yang sehat adalah yang diambil sadar, tercatat, punya pemicu pelunasan, dan diketahui bunganya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Arsitektur yang berevolusi berarti bentuknya bisa berubah tanpa harus ditulis ulang. Yang menentukan apakah itu mungkin bukan bentuk awalnya melainkan berapa mahal setiap perubahan bentuknya.',
      ),
      code(
        'text',
        `
        Biaya membatalkan tiap jenis keputusan, dihitung dan diukur:

          memindahkan batas DI DALAM satu proses
            ubah beberapa impor, jalankan test  -> sehari

          memindahkan batas ANTAR layanan
            pindahkan tabel, penulisan ganda, backfill, pindahkan
            pembacaan, hapus yang lama
            diukur, 283 byte/baris @ 100 juta/hari -> 10,3 TB setahun
            -> berminggu-minggu

          mengubah bentuk data yang sudah tersimpan
            diuji, rollback sesudah RENAME:
              ERROR: column "nama_lengkap" does not exist
            -> tidak bisa dibatalkan dengan rollback kode

          mengubah bentuk fungsi dengan fan-in tinggi
            diukur, authoring.ts menyentuh 82 dari 116 berkas (71%)
        `,
        {
          caption:
            'Arsitektur yang berevolusi adalah arsitektur yang keputusan mahalnya sedikit dan ditunda selama mungkin.',
        },
      ),
      p(
        'Karena itu strategi evolusinya bisa dinyatakan sebagai urutan, dan urutannya konsisten untuk hampir semua sistem.',
      ),
      code(
        'text',
        `
        1. Ambil keputusan MURAH dengan cepat, dan ubah bila salah.
        2. Tunda keputusan MAHAL sampai informasinya cukup.
        3. Buat keputusan mahal menjadi lebih murah, bila bisa.

        Langkah 3 yang paling sering dilewatkan, dan contohnya
        konkret:

          kontrak API  -> beri versi, sehingga bentuk lama bisa
                          hidup berdampingan
          skema data   -> expand-migrate-contract, sehingga rollback
                          kode tetap aman
          batas modul  -> tegakkan di dalam satu proses lebih dulu,
                          sehingga memecahnya nanti tinggal mengganti
                          pemanggilan fungsi menjadi panggilan jaringan
                          DI SATU TEMPAT
          fitur baru   -> saklar fitur, sehingga "dirilis" dan
                          "dinyalakan" menjadi dua peristiwa terpisah
        `,
      ),
      p(
        'Yang membuat evolusi mungkin secara praktis adalah kemampuan mengubah sesuatu tanpa memutus yang lama, dan bentuknya selalu sama.',
      ),
      code(
        'text',
        `
        EXPAND - MIGRATE - CONTRACT, berlaku untuk skema DAN kontrak:

          RILIS 1 — EXPAND
            tambahkan yang baru, pertahankan yang lama
            tulis ke KEDUANYA, baca dari yang lama
            rollback aman: yang baru diabaikan kode lama

          RILIS 2 — MIGRATE
            isi yang baru dari yang lama, dalam batch terpisah
            pindahkan pembacaan, masih menulis ke keduanya
            rollback aman: yang lama masih terisi

          RILIS 3 — CONTRACT
            berhenti menulis ke yang lama
            baru setelah itu, hapus

        Langkah 2 menuntut kemampuan MELIHAT siapa yang masih
        memakai yang lama, dan itu harus dipasang SEBELUM rilis 1.
        Tanpa itu, langkah 3 diambil dengan menebak.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan evolusi punya bentuk yang khas, dan yang paling umum adalah perubahan yang dibatalkan hanya sebagian.',
      ),
      code(
        'text',
        `
        Gejalanya:

          "Sudah ada tiga cara melakukan hal yang sama, dan
           ketiganya masih dipakai"
          "Kami sudah mulai migrasi ke bentuk baru dua tahun lalu"
          "Jangan pakai yang itu, tapi jangan dihapus juga"

        Penyebabnya selalu sama: langkah CONTRACT tidak pernah
        dijalankan, sebab tidak ada yang tahu siapa yang masih
        memakai yang lama.

        Yang menutupnya harus dipasang SEBELUM migrasinya dimulai:
          catat setiap pemakaian jalur lama, beserta pemanggilnya
          lalu langkah contract diambil ketika catatannya nol
          selama beberapa minggu
        `,
      ),
      p(
        'Kegagalan kedua adalah migrasi yang menghapus jalan mundurnya sendiri, dan itu bisa diuji.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan PostgreSQL 16.15:

          kode LAMA membaca nama_lengkap  -> berhasil
          -- migrasi RENAME dijalankan, kode BARU di-deploy --
          kode BARU membaca nama          -> berhasil
          -- ada bug, kode di-rollback ke versi LAMA --

          SELECT nama_lengkap FROM pengguna
            ERROR: column "nama_lengkap" does not exist

        Rollback kodenya BERHASIL, dan aplikasinya tetap rusak.

        Pertanyaan yang menutupnya, dan pantas diajukan pada setiap
        migrasi sebelum digabungkan:
          "Bila kode versi lama dan versi baru berjalan BERSAMAAN
           selama sepuluh menit, apakah keduanya masih bekerja
           dengan benar terhadap skema ini?"

        Keadaan itu bukan kemungkinan melainkan KEHARUSAN pada
        setiap rilis tanpa henti.
        `,
        {
          caption:
            'Migrasi yang tidak lolos pertanyaan itu harus dipecah, bukan dijalankan dengan hati-hati.',
        },
      ),
      p(
        'Kegagalan ketiga bersifat arah, yaitu evolusi yang tidak pernah terjadi karena tidak ada yang berani.',
      ),
      code(
        'text',
        `
        Gejalanya:

          "Tidak ada yang berani menyentuh modul itu"
          "Kita tidak tahu apa yang akan rusak"
          "Belum ada testnya, jadi jangan diubah"

        Ketiganya adalah gejala yang sama: tidak ada sinyal yang
        bisa memberi tahu apakah sebuah perubahan merusak sesuatu.

        Yang mengembalikannya:
          - test yang benar-benar bisa merah pada perilaku itu
          - fitness function untuk sifat arsitekturnya
          - dan diukur pada project ini, satu skrip tiga puluh baris
            sudah menemukan satu pelanggaran arah dan tiga siklus

        Arsitektur yang tidak bisa diubah bukan arsitektur yang
        stabil melainkan arsitektur yang membeku.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KEEMPAT: evolusi tanpa ambang yang menurun.

        Diukur pada project ini, 3 dari 5 fitness function GAGAL
        saat pertama dijalankan.

        Bila ketiganya langsung dijadikan penggagal build, tidak ada
        yang bisa merilis apa pun sampai semuanya diperbaiki — dan
        hasilnya biasanya aturannya yang dimatikan.

        Yang bekerja:
          siklus ketergantungan: maksimal 3
          -> hari ini lulus dengan 3
          -> bila bertambah menjadi 4, build GAGAL
          -> setiap kali ada yang memperbaiki satu, ambangnya
             diturunkan

        Keadaannya tidak pernah memburuk, dan perbaikannya bertahap.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Evolusi arsitektur gagal bukan karena arah yang salah melainkan karena tidak ada mekanisme yang membuat perubahan terasa aman.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengganti bentuk lama dengan bentuk baru sekaligus',
            'Satu perubahan, satu rilis',
            'Diuji, rollback sesudah `RENAME` menghasilkan `column does not exist`. Pakai expand-migrate-contract',
          ],
          [
            'Memulai migrasi tanpa mencatat siapa yang memakai yang lama',
            'Nanti kelihatan',
            'Langkah contract diambil dengan menebak, atau tidak pernah diambil sama sekali',
          ],
          [
            'Membiarkan dua bentuk hidup berdampingan selamanya',
            'Keduanya kan jalan',
            'Keduanya harus dijaga selamanya. Itu biaya permanen dari migrasi yang tidak diselesaikan',
          ],
          [
            'Menjadikan aturan baru penggagal build seketika',
            'Aturannya kan benar',
            'Diukur, 3 dari 5 gagal sejak hari pertama. Hasilnya biasanya aturannya yang dimatikan',
          ],
          [
            'Tidak menyentuh modul yang tidak ada testnya',
            'Terlalu berisiko',
            'Arsitektur yang tidak bisa diubah adalah arsitektur yang membeku. Bangun sinyalnya dulu',
          ],
          [
            'Merancang bentuk akhir di awal',
            'Biar tidak perlu berevolusi',
            'Informasinya paling sedikit tepat di awal. Ambil keputusan yang paling murah dibatalkan',
          ],
        ],
      ),
      p(
        'Kalimat yang paling ringkas untuk seluruh sub-bab ini adalah bahwa arsitektur yang baik bukan yang paling benar hari ini melainkan yang paling murah diubah besok. Setiap mekanisme di atas, yaitu versi kontrak, expand-migrate-contract, saklar fitur, dan ambang yang menurun, mengerjakan satu hal yang sama: membuat perubahan berikutnya lebih murah daripada perubahan sekarang.',
      ),
      references(
        {
          label: 'Design for evolution',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/design-for-evolution',
          source: 'Microsoft',
          note: 'Prinsip merancang dengan asumsi bentuknya akan berubah, beserta wujud praktisnya.',
        },
        {
          label: 'Strangler Fig pattern',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig',
          source: 'Microsoft',
          note: 'Alternatif bertahap untuk menulis ulang, dengan risiko yang tersebar di tiap langkah.',
        },
        {
          label: 'Performance antipatterns',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/antipatterns/',
          source: 'Microsoft',
          note: 'Bentuk yang menumpuk perlahan tanpa ada yang memutuskan, beserta gejalanya.',
        },
      ),
    ],
  ),

  written(
    'review-arsitektur',
    'Review Arsitektur dan Trade-off',
    20,
    'Cara menantang sebuah usulan dengan pertanyaan, bukan dengan pendapat.',
    [
      p(
        'Bayangkan dua orang berdebat tentang rencana membangun rumah. Yang satu berkata "menurutku dapurnya sebaiknya di belakang". Yang lain berkata "menurutku di depan lebih bagus". Perdebatan seperti itu tidak punya ujung, karena tidak ada cara membuktikan siapa yang benar.',
      ),
      p(
        'Sekarang bayangkan orang ketiga datang dan bertanya, "kalau dapurnya di depan, ke mana asapnya keluar, dan apakah tamu yang duduk di ruang depan akan terganggu". Pertanyaan itu tidak menyerang siapa-siapa, tetapi ia langsung memindahkan perdebatan dari selera ke sesuatu yang bisa dijawab.',
      ),
      p(
        'Perbedaan itulah inti sub-bab ini. Review kode sudah menjadi kebiasaan di hampir semua tim, karena ia punya pegangan yang jelas berupa apakah kodenya benar, terbaca, dan diuji. Review arsitektur jauh lebih jarang dilakukan padahal kesalahannya jauh lebih mahal, dan alasannya sederhana, yaitu tidak ada yang tahu harus memeriksa apa.',
      ),
      p(
        'Tanpa pegangan, review arsitektur berubah menjadi adu pendapat, dan yang menang biasanya yang paling percaya diri atau paling senior. Sub-bab ini memberi pegangan yang menggantikan pendapat dengan **pertanyaan**.',
      ),

      terms(
        {
          term: 'architecture review (review arsitektur)',
          meaning:
            'Pemeriksaan sebuah usulan bentuk sebelum ia dibangun, dengan tujuan menemukan risiko dan asumsi yang belum diuji. Yang perlu diluruskan sejak awal, tujuannya **bukan** menyetujui atau menolak seperti sidang. Tujuannya membuat pengusulnya melihat hal yang belum ia lihat. Karena itu review yang berhasil sering berakhir dengan pengusulnya sendiri yang mengubah rencananya, bukan dengan pereview yang menjatuhkan vonis.',
        },
        {
          term: 'trade-off analysis',
          meaning:
            'Pemeriksaan yang secara sengaja mencari apa yang menjadi lebih buruk akibat sebuah keputusan. Dibaca "treid of analisis", artinya analisis pertukaran. Kata "secara sengaja" itu penting, karena orang yang sedang bersemangat pada idenya sendiri memang tidak melihat sisi buruknya, dan itu manusiawi bukan tanda ia ceroboh. Karena setiap keputusan arsitektur menaikkan satu atribut dengan menurunkan yang lain, usulan yang tidak menyebut apa yang turun berarti belum selesai dipikirkan, bukan berarti usulannya kuat.',
        },
        {
          term: 'assumption (asumsi)',
          meaning:
            'Hal yang dianggap benar tanpa pernah diperiksa. Dibaca "asumsyen". Yang berbahaya dari asumsi bukan bahwa ia salah, melainkan bahwa ia **tidak pernah disebut**, sehingga tidak ada yang berkesempatan membantahnya. Contoh yang sering terjadi, sebuah rancangan dibuat dengan diam-diam menganggap pengguna akan tumbuh sepuluh kali lipat tahun depan, dan tidak ada seorang pun di ruangan yang menyadari bahwa angka itu tidak pernah datang dari mana-mana.',
        },
        {
          term: 'scenario (skenario)',
          meaning:
            'Kejadian konkret yang dipakai untuk menguji sebuah rancangan, misalnya "penjualan kilat membuat seribu pesanan dalam satu menit". Dibaca "skenario". Kenapa ia jauh lebih berguna daripada pertanyaan umum. Bandingkan dua pertanyaan ini. "Apakah rancangan ini sudah tahan beban" akan dijawab "sudah" oleh siapa pun, dan tidak menghasilkan apa-apa. "Kalau seribu pesanan masuk dalam satu menit, bagian mana yang patah lebih dulu" memaksa jawaban yang menyebut nama bagian, dan jawaban itu bisa salah sehingga bisa diperiksa.',
        },
        {
          term: 'risk (risiko)',
          meaning:
            'Sesuatu yang bisa terjadi dan merugikan, beserta perkiraan seberapa mungkin dan seberapa besar dampaknya. Dibaca "risk". Dua bagian itu wajib ada bersamaan, karena kemungkinan tanpa dampak tidak berguna dan sebaliknya. Contohnya, "penyedia pembayaran mati" adalah kemungkinan, sedangkan "penyedia pembayaran mati satu jam saat gajian, dan kita kehilangan sekitar dua ratus transaksi" adalah risiko yang bisa ditindaklanjuti. Risiko yang disebut terbuka bisa dikurangi. Risiko yang tidak disebut tetap ada, hanya saja tidak ada yang menyiapkan apa pun untuknya.',
        },
      ),

      h2('Yang diperiksa dalam review arsitektur'),
      p(
        'Berbeda dari review kode, review arsitektur memeriksa **keputusan dan alasannya**, bukan barisnya. Enam hal berikut sudah mencakup hampir seluruh kesalahan mahal yang dibahas di kategori ini.',
      ),
      table(
        ['Yang diperiksa', 'Pertanyaan pemeriksanya', 'Kalau jawabannya lemah'],
        [
          [
            'Masalahnya',
            'Masalah apa yang sedang diselesaikan, dan bagaimana kita tahu ia benar-benar ada?',
            'Kembali ke sini dulu. Rancangan sempurna untuk masalah yang keliru tetap nol nilainya',
          ],
          [
            'Bukti',
            'Angka apa yang mendukung ini, dan dari mana angkanya?',
            'Tunda sampai ada pengukuran. Sub-bab [estimasi kasar](/kelas/system-design/fondasi-sistem/estimasi-kasar) menyediakan caranya',
          ],
          [
            'Alternatif',
            'Apa dua pilihan lain yang dipertimbangkan, dan kenapa ditolak?',
            'Belum ada keputusan, baru ada preferensi',
          ],
          [
            'Harga',
            'Apa yang menjadi lebih sulit setelah ini?',
            'Usulan yang hanya menyebut keuntungan belum selesai dipikirkan',
          ],
          [
            'Pembatalan',
            'Kalau enam bulan lagi ini keliru, apa yang harus dilakukan?',
            'Kalau jawabannya berat, ini pintu satu arah dan pantas dilambatkan',
          ],
          [
            'Bagian tersulit',
            'Bagian mana yang paling mungkin gagal, dan bagaimana kita mengetahuinya lebih awal?',
            'Risiko terbesar biasanya bukan yang dibicarakan paling lama',
          ],
        ],
        'Keenamnya berbentuk pertanyaan, sehingga jawabannya datang dari pengusul, bukan dari pereview.',
      ),
      callout(
        'tip',
        'Bertanya lebih kuat daripada menyanggah',
        'Kalimat "menurutku ini terlalu rumit" mengundang pembelaan, dan diskusinya berubah menjadi siapa yang lebih meyakinkan. Kalimat "kalau enam bulan lagi kita ingin membatalkan ini, apa yang harus dilakukan" mengundang pemikiran. Pertanyaan yang baik membuat pengusul menemukan sendiri masalahnya, dan penemuan sendiri jauh lebih mudah diterima daripada penolakan.',
      ),

      h2('Menguji dengan skenario, bukan dengan pendapat'),
      p(
        'Cara paling efektif menguji sebuah rancangan adalah menjalankannya di kepala pada kejadian konkret. Skenario memaksa jawaban yang spesifik, dan kelemahan biasanya muncul sendiri tanpa perlu ada yang menyanggah.',
      ),
      code(
        'text',
        `
        Skenario yang hampir selalu berguna

        Beban
          "Penjualan kilat, seribu pesanan dalam satu menit. Apa yang patah lebih dulu?"
          "Jumlah data sepuluh kali lipat dalam setahun. Query mana yang mulai berat?"

        Kegagalan
          "Layanan pembayaran mati tiga puluh menit. Apa yang dilihat pengguna?"
          "Database utama gagal saat pesanan sedang diproses separuh. Datanya jadi apa?"
          "Satu pesan antrean dikirim dua kali. Apa akibatnya?"

        Perubahan
          "Menambah metode pembayaran baru. Berapa bagian yang disentuh?"
          "Mengganti penyedia email. Berapa berkas yang berubah?"
          "Menambah satu field ke respons pesanan. Siapa saja yang harus ikut rilis?"

        Operasional
          "Ada laporan pesanan tidak muncul. Berapa lama sampai kita tahu penyebabnya?"
          "Harus rollback rilis terakhir. Apa yang tidak bisa dibatalkan?"

        Orang
          "Orang baru bergabung minggu depan. Berapa lama sampai ia bisa mengubah sesuatu?"
          "Yang membangun ini pindah. Apa yang hilang bersamanya?"
        `,
        {
          caption:
            'Dipakai dengan memilih tiga atau empat yang paling relevan, bukan seluruhnya sekaligus.',
        },
      ),
      p(
        'Skenario terakhir sering menghasilkan temuan yang paling berharga sekaligus paling jarang dibahas. Rancangan yang hanya bisa dijalankan oleh orang yang merancangnya bukan rancangan yang selesai, dan jawaban jujur atas pertanyaan itu sering mengubah beberapa keputusan.',
      ),

      h2('Menyebut harganya dengan jujur'),
      p(
        'Bagian tersulit dari review arsitektur adalah membuat pengusul menyebut apa yang menjadi lebih buruk. Bukan karena ada yang menyembunyikan, melainkan karena orang yang sedang bersemangat pada sebuah ide memang cenderung tidak melihat sisi itu.',
      ),
      compare(
        {
          title: 'Usulan yang belum selesai',
          lang: 'text',
          code: `
            Usul: memecah modul notifikasi menjadi layanan sendiri.

            Manfaat:
            - Bisa dirilis sendiri
            - Bisa diskalakan sendiri
            - Batasnya jadi lebih tegas

            (tidak ada bagian lain)
          `,
          notes: [
            'Semua yang disebut adalah keuntungan',
            'Tidak ada cara menilai apakah ini sepadan',
            'Tidak ada yang bisa diperdebatkan secara spesifik',
          ],
        },
        {
          title: 'Usulan yang bisa dinilai',
          lang: 'text',
          code: `
            Usul: memecah modul notifikasi menjadi layanan sendiri.

            Manfaat:
            - Rilis notifikasi 4x seminggu tanpa menunggu rilis mingguan aplikasi

            Harga:
            - Satu pipeline, satu pemantauan, dan satu rotasi jaga tambahan
            - Kegagalan kirim jadi butuh trace lintas layanan untuk ditelusuri
            - Menjalankan di laptop butuh dua proses, bukan satu

            Bukti:
            - 6 dari 9 rilis darurat tiga bulan terakhir hanya menyentuh notifikasi
            - Jeda rata-rata dari kode siap sampai rilis: 4,5 hari kerja

            Kalau keliru:
            - Kembali menyatukan butuh sekitar 1 minggu selama datanya belum dipisah
          `,
          notes: [
            'Manfaatnya satu dan spesifik, bukan tiga yang umum',
            'Harganya disebut sehingga bisa ditimbang',
            'Ada angka, sehingga bisa dibantah dengan angka',
          ],
        },
      ),

      h2('Bentuk pertemuannya'),
      p(
        'Review arsitektur tidak butuh proses berat. Bentuk yang berjalan baik di tim kecil punya empat sifat.',
      ),
      ol(
        '**Dilakukan sebelum dibangun, bukan setelah.** Review setelah kode jadi hanya menghasilkan dua pilihan buruk, yaitu menerima yang sudah ada atau membuang pekerjaan.',
        '**Berdasarkan tulisan pendek, bukan presentasi.** Satu halaman yang dibaca semua orang lebih dulu jauh lebih efektif daripada satu jam penjelasan lisan yang tidak meninggalkan jejak.',
        '**Menghasilkan keputusan yang tercatat.** Kalau hasilnya diterima, ia langsung menjadi ADR. Kalau hasilnya ditunda, ditulis apa yang harus diketahui dulu sebelum diputuskan.',
        '**Melibatkan yang akan merawatnya.** Orang yang nanti dibangunkan tengah malam saat sistem bermasalah punya sudut pandang yang tidak dimiliki siapa pun yang lain.',
      ),
      code(
        'text',
        `
        Usulan bentuk — dibaca sebelum pertemuan, maksimal satu halaman

        1. Masalahnya apa, dan bukti bahwa ia ada
        2. Usulannya apa, dalam satu paragraf dan satu gambar kotak-panah
        3. Dua alternatif yang dipertimbangkan, dan kenapa ditolak
        4. Apa yang menjadi lebih sulit
        5. Bagian yang paling mungkin gagal, dan cara mengetahuinya lebih awal
        6. Kalau ternyata keliru, apa yang harus dilakukan

        Pertemuan: 30 menit, isinya pertanyaan atas keenam bagian di atas.
        Keluaran: ADR baru, ATAU daftar hal yang harus diketahui dulu.
        `,
        {
          caption:
            'Enam bagian ini sengaja sama dengan tabel pemeriksa di atas, sehingga tidak ada kejutan saat pertemuan.',
        },
      ),

      h2('Kesalahan yang membuat review menjadi tidak berguna'),
      table(
        ['Kesalahan', 'Akibatnya', 'Perbaikannya'],
        [
          [
            'Review dilakukan setelah kode selesai',
            'Pilihannya tinggal menerima atau membuang pekerjaan',
            'Review usulan, bukan hasil',
          ],
          [
            'Yang paling senior selalu yang memutuskan',
            'Orang lain berhenti menyiapkan pendapatnya',
            'Tanyakan pendapat yang paling junior lebih dulu',
          ],
          [
            'Diskusi berputar di detail teknologi',
            'Keputusan bentuknya sendiri tidak pernah diperiksa',
            'Tunda pemilihan library sampai bentuknya disepakati',
          ],
          [
            'Tidak ada yang tercatat',
            'Diulang enam bulan lagi dari nol',
            'Keluarannya wajib berupa ADR atau daftar yang harus diketahui',
          ],
          [
            'Semua usulan harus lewat review',
            'Review menjadi penghambat, lalu dihindari orang',
            'Hanya untuk keputusan pintu satu arah, sesuai tiga uji di sub-bab 4.2',
          ],
        ],
        'Baris terakhir yang paling sering merusak, karena review yang menghambat akan dihindari lalu mati sendiri.',
      ),

      h2('Rangkuman'),
      ul(
        'Review arsitektur memeriksa keputusan dan alasannya, bukan barisnya.',
        'Enam yang diperiksa yaitu masalahnya, buktinya, alternatifnya, harganya, cara membatalkannya, dan bagian tersulitnya.',
        'Bertanya lebih kuat daripada menyanggah, karena penemuan sendiri lebih mudah diterima.',
        'Skenario konkret memaksa jawaban spesifik, dan kelemahan muncul sendiri tanpa perlu disanggah.',
        'Usulan yang hanya menyebut keuntungan belum selesai dipikirkan.',
        'Review dilakukan sebelum dibangun, berdasarkan tulisan pendek, dan wajib menghasilkan catatan.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Review arsitektur berbeda dari review kode karena yang ditinjau bukan benar atau salahnya melainkan pertukarannya. Pertanyaan yang tepat hampir selalu berbentuk "apa yang dibayar untuk itu".',
      ),
      code(
        'text',
        `
        Enam pertanyaan yang menutup sebagian besar review:

          1. Angka mana yang membuat keputusan ini perlu?
          2. Alternatif apa yang ditolak, dan kenapa?
          3. Apa yang dibayar untuk keuntungan ini?
          4. Apa yang terjadi bila komponen X mati?
          5. Berapa mahal membatalkan keputusan ini enam bulan lagi?
          6. Bagaimana kita tahu keputusan ini berhasil?

        Pertanyaan 3 yang paling sering tidak terjawab, dan
        jawabannya hampir selalu ada bila dicari.
        `,
      ),
      p('Contoh pertukaran yang terukur menunjukkan bentuk jawaban yang berguna.'),
      code(
        'text',
        `
        "Kita pakai kolom penghitung supaya halaman terpopuler cepat."

        Pertanyaan 1 — angkanya:
          agregasi 1.000.000 baris   468,922 ms
          kolom berindeks              0,068 ms
          -> ~6.900 kali lebih cepat

        Pertanyaan 3 — yang dibayar:
          INSERT saja                0,0090 ms/operasi
          INSERT + UPDATE penghitung 0,2825 ms/operasi
          -> ~31 kali lebih lambat

          dan pertentangan pada baris panas:
          2.000 UPDATE baris sama    459 ms
          2.000 UPDATE baris berbeda  29 ms
          -> ~16 kali lebih lambat

          dan penghitungnya BISA menyimpang: diuji, satu penghapusan
          yang lewat jalur lain menghasilkan penghitung 3 sementara
          yang sebenarnya 2

        Dengan angka itu, keputusannya bisa dinilai. Tanpa angka itu,
        yang bisa dilakukan hanya setuju atau tidak setuju.
        `,
        {
          caption:
            'Review yang berguna menghasilkan angka yang belum ada, bukan pendapat tentang angka yang sudah ada.',
        },
      ),
      p(
        'Pertanyaan keempat punya bentuk jawaban yang bisa dihitung, dan itu sering mengubah kesimpulan.',
      ),
      code(
        'text',
        `
        "Apa yang terjadi bila komponen X mati?"

        Dihitung sungguhan, komponen BERANTAI:
           1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
           5 komponen @ 99,9% -> 99,5010%   ( 43,7 jam/tahun)
          10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
          30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

        Dan komponen PARALEL:
          2 salinan @ 99% -> 99,9900%
          3 salinan @ 99% -> 99,9999%

        Menambah komponen untuk "ketangguhan" sering menambah
        komponen BERANTAI, bukan paralel. Selisihnya yang menentukan
        apakah keputusannya menaikkan atau menurunkan ketersediaan.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Review arsitektur gagal dengan beberapa cara yang khas, dan yang pertama adalah terjadi terlalu terlambat.',
      ),
      code(
        'text',
        `
        Tanda review terjadi terlalu terlambat:

          - diskusi panjang tentang ARAH DASAR perubahannya
          - sudah ada 600 baris yang harus dibuang bila arahnya berubah
          - "sudah terlanjur begini, nanti saja diperbaiki"

        Diskusi arah terjadi SEBELUM kodenya ditulis. Setelah ada
        implementasi, biaya mengubah arah sudah tidak sebanding
        dengan manfaatnya, dan reviewer tahu itu — sehingga ia
        menyetujui sesuatu yang sebenarnya tidak ia setujui.

        Yang menutupnya: satu halaman dokumen desain SEBELUM
        implementasi, dengan enam pertanyaan di atas terjawab.
        `,
      ),
      p('Kegagalan kedua bersifat ukuran, dan ia bisa diukur.'),
      code(
        'text',
        `
        Yang terjadi seiring bertambahnya baris yang berubah:

          < 100 baris   reviewer membaca setiap baris
          200-400 baris reviewer membaca selektif
          > 400 baris   reviewer memindai, lalu menulis "LGTM"
          > 1000 baris  reviewer menyetujui tanpa membacanya

        Dan yang membuatnya berbahaya: perubahan yang terlalu besar
        TETAP DISETUJUI. Ia tidak ditolak, tidak memunculkan
        peringatan, dan tidak meninggalkan jejak bahwa reviewnya
        tidak sungguhan.

        Review yang tidak terjadi terlihat persis sama dengan review
        yang terjadi.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN KETIGA: review yang membahas hal yang bisa
        diperiksa mesin.

        Diukur sungguhan pada project ini:
          format:check     3.691 ms
          lint             6.021 ms
          type-check       2.403 ms
          test             7.184 ms

        Empat pemeriksaan itu selesai dalam 19,3 detik. Setiap
        komentar review tentang format, impor yang tidak terpakai,
        atau tipe yang salah adalah pekerjaan yang seharusnya
        diselesaikan dalam sembilan belas detik itu.

        Dan untuk sifat ARSITEKTUR, hal yang sama berlaku. Diukur:
          GAGAL  lib tidak boleh bergantung pada content (1)
          GAGAL  tidak ada siklus ketergantungan (3)

        Ketiga pelanggaran itu ditemukan mesin dalam sepersekian
        detik, dan tidak satu pun ditemukan oleh review manusia
        selama ini.
        `,
        {
          caption:
            'Waktu manusia dipakai untuk pertukaran dan alasan, bukan untuk hal yang bisa dihitung.',
        },
      ),
      p(
        'Kegagalan keempat menyangkut bentuk komentarnya, dan ia menentukan apakah review menghasilkan perubahan.',
      ),
      code(
        'text',
        `
        TIDAK BISA DITINDAKLANJUTI:
          "ini kurang bagus"
          "kayaknya ada cara yang lebih baik"
          "saya nggak suka pendekatan ini"

        BISA DITINDAKLANJUTI:
          "Keputusan ini menambah satu komponen berantai di depan
           seluruh sistem. Dihitung, 2 komponen @ 99,9% berarti
           17,5 jam mati per tahun melawan 8,8 jam. Apakah manfaatnya
           sebanding, dan apakah ada rencana salinan paralel?"

        Dan membedakan yang WAJIB dari yang SARAN:
          BLOKIR : "ini harus diubah sebelum digabung, karena ..."
          SARAN  : "nit: ini bisa disederhanakan, tidak menghalangi"

        Menandai keduanya dengan jelas menghemat satu putaran
        percakapan pada hampir setiap review.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Review arsitektur sering diperlakukan sebagai persetujuan, padahal gunanya membuat pertukarannya terlihat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mereview sesudah implementasinya jadi',
            'Biar jelas yang dibahas',
            'Sudah ada 600 baris yang harus dibuang bila arahnya berubah. Reviewer menyetujui yang tidak ia setujui',
          ],
          [
            'Mengirim perubahan besar sekaligus',
            'Perubahannya memang satu kesatuan',
            'Diamati, di atas 400 baris reviewer memindai lalu menyetujui. Review yang tidak terjadi terlihat sama',
          ],
          [
            'Membahas format dan tipe di review',
            'Memang itu yang terlihat',
            'Diukur, empat pemeriksaan mesin selesai dalam 19,3 detik. Jangan pakai waktu manusia untuk itu',
          ],
          [
            'Menulis komentar yang tidak bisa ditindaklanjuti',
            'Saya cuma merasa kurang pas',
            'Penulisnya tidak tahu harus mengubah apa. Sebutkan angkanya, akibatnya, dan alternatifnya',
          ],
          [
            'Tidak menanyakan apa yang dibayar',
            'Manfaatnya kan jelas',
            'Setiap keputusan punya biaya. Diukur, kolom penghitung membuat penulisan 31 kali lebih lambat',
          ],
          [
            'Tidak menanyakan bagaimana tahu ini berhasil',
            'Nanti kelihatan sendiri',
            'Tanpa metrik yang ditetapkan lebih dulu, "berhasil" menjadi soal perasaan',
          ],
        ],
      ),
      p(
        'Ada satu kebiasaan yang mengubah kualitas review lebih besar daripada aturan apa pun, dan ia dikerjakan oleh penulisnya sendiri. Sebelum meminta orang lain meninjau, jawab keenam pertanyaan di awal sub-bab ini dan tuliskan jawabannya. Sebagian besar kelemahan sebuah keputusan muncul saat menuliskan jawaban pertanyaan ketiga, yaitu apa yang dibayar, dan menemukannya sendiri jauh lebih murah daripada menemukannya lewat satu putaran percakapan.',
      ),
      references(
        {
          label: 'AWS Well-Architected Framework',
          href: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
          source: 'Amazon Web Services',
          note: 'Kerangka review berbasis pertanyaan, dengan daftar pertanyaan per pilar.',
        },
        {
          label: 'Azure Well-Architected Framework',
          href: 'https://learn.microsoft.com/en-us/azure/well-architected/',
          source: 'Microsoft',
          note: 'Versi Microsoft, termasuk pembahasan trade-off eksplisit di tiap pilar.',
        },
        {
          label: 'MADR decisions',
          href: 'https://adr.github.io/madr/decisions/',
          source: 'ADR GitHub organization',
          note: 'Contoh keputusan lengkap dengan alternatif dan alasan penolakannya.',
        },
      ),
    ],
  ),

  written(
    'studi-kasus',
    'Studi Kasus, Merancang dari Nol',
    21,
    'Seluruh isi kategori ini dijalankan sekali, dari brief kosong sampai ADR yang tercatat.',
    [
      p(
        'Sampai sini kamu sudah punya semua alatnya. Kamu tahu cara mengenali keputusan yang mahal, cara memilih atribut penggerak, cara menemukan batas, cara memakai tabel keputusan, cara menggambar, dan cara mencatat.',
      ),
      p(
        'Masalahnya, mengetahui alat satu per satu berbeda dari bisa memakainya berurutan pada satu pekerjaan nyata. Mirip orang yang sudah hafal fungsi obeng, gergaji, dan palu, tetapi belum pernah membuat satu pun rak buku dari awal sampai selesai.',
      ),
      p(
        'Sub-bab ini membuat rak bukunya. Seluruh isi kategori dijalankan sekali, berurutan, pada satu sistem, sehingga kamu bisa melihat bagaimana keputusan yang satu menentukan keputusan berikutnya. Yang paling berharga untuk diperhatikan bukan hasil akhirnya, melainkan **kenapa tiap langkah menghasilkan jawaban itu**.',
      ),
      p(
        'Sistemnya sengaja dipilih yang sedang, yaitu cukup besar untuk punya keputusan nyata dan cukup kecil untuk muat dalam satu sub-bab. Ikuti sampai akhir, lalu kerjakan latihan di penutup dengan sistemmu sendiri.',
      ),

      terms(
        {
          term: 'brief',
          meaning:
            'Keterangan awal tentang apa yang ingin dibangun, biasanya masih kasar dan penuh lubang. Dibaca "brif", artinya ringkasan permintaan. Yang penting dipahami, brief yang penuh lubang itu **normal dan bukan kesalahan siapa pun**. Orang yang memintanya memang belum tahu apa yang perlu kamu ketahui. Karena itu pekerjaan pertama seorang perancang bukan langsung merancang, melainkan menemukan lubangnya lalu menanyakannya.',
        },
        {
          term: 'functional requirement (kebutuhan fungsional)',
          meaning:
            'Apa yang harus bisa dilakukan sistem, misalnya "pengajar bisa membuat kelas". Dibaca "fangsyonal rikuairment". Cara membedakannya dari kebutuhan non-fungsional, kebutuhan fungsional selalu bisa ditulis sebagai kalimat "siapa bisa melakukan apa", sedangkan kebutuhan non-fungsional selalu berbentuk kata sifat seperti cepat, aman, atau mudah dirawat. Sub-bab [kebutuhan fungsional dan non-fungsional](/kelas/system-design/fondasi-sistem/kebutuhan-fungsional-nonfungsional) sudah membahas pemisahannya dari sisi System Design.',
        },
        {
          term: 'scope (cakupan)',
          meaning:
            'Batas tentang apa yang termasuk dan apa yang tidak. Dibaca "skop". Menuliskan apa yang **tidak** termasuk sama pentingnya dengan menuliskan yang termasuk, dan ini bagian yang paling sering dilewati. Alasannya praktis. Kalau di dokumen tertulis "pembayaran tidak termasuk versi pertama", maka ketika tiga bulan lagi ada yang bertanya kenapa belum ada pembayaran, jawabannya sudah tersedia dan tidak ada yang merasa pekerjaannya terlupakan. Cakupan yang tidak dibatasi akan melebar sendiri, dan pelebaran itu diam-diam membatalkan keputusan bentuk yang sudah diambil.',
        },
      ),

      h2('Langkah 1, brief dan lubangnya'),
      p(
        'Brief yang diterima biasanya terdengar seperti ini. Bacalah sekali, lalu perhatikan berapa banyak yang belum ia jawab.',
      ),
      code(
        'text',
        `
        "Kami ingin membangun platform kursus online untuk lembaga pelatihan kami.
         Pengajar bisa membuat kelas dan mengunggah materi berupa video dan PDF.
         Peserta mendaftar, mengikuti kelas, mengerjakan kuis, dan mendapat sertifikat.
         Admin bisa melihat laporan. Nanti mungkin ada pembayaran juga."
        `,
        {
          caption:
            'Brief seperti ini normal dan tidak apa-apa. Yang salah adalah langsung merancang tanpa menanyakan lubangnya.',
        },
      ),
      p(
        'Prinsip pertama di `engineering-judgment.md` berlaku penuh di sini, yaitu pahami masalahnya sebelum memilih solusinya. Empat pertanyaan berikut mengubah brief itu menjadi sesuatu yang bisa dirancang.',
      ),
      table(
        ['Pertanyaan', 'Jawaban yang didapat', 'Yang berubah karenanya'],
        [
          [
            'Berapa banyak peserta dan pengajar, sekarang dan setahun lagi?',
            'Sekitar 300 peserta aktif, 20 pengajar. Setahun lagi mungkin 1.000 peserta',
            'Seluruh beban jauh di bawah satu server. Penskalaan bukan penggerak',
          ],
          [
            'Videonya berapa besar dan berapa banyak?',
            'Sekitar 40 menit per materi, sekitar 500 MB, sekitar 600 berkas setahun',
            'Ini yang berat, bukan basis datanya. Penyimpanan berkas menjadi keputusan tersendiri',
          ],
          [
            'Sertifikatnya seperti apa?',
            'PDF dengan nama, nomor unik, dan tanda tangan digital lembaga',
            'Pembuatan PDF memakan prosesor dan berjalan lama. Tidak boleh di jalur permintaan',
          ],
          [
            'Pembayarannya kapan dibutuhkan?',
            'Belum tahu, mungkin tahun depan, mungkin tidak sama sekali',
            'Jangan dibangun sekarang. Cukup pastikan menambahkannya nanti tidak membongkar apa pun',
          ],
        ],
        'Perhatikan pertanyaan keempat. Jawabannya menghemat berminggu-minggu pekerjaan yang mungkin tidak pernah dipakai.',
      ),
      callout(
        'tip',
        'Pertanyaan kedua yang paling sering terlewat',
        'Naluri pertama saat mendengar "platform kursus" adalah memikirkan kelas, peserta, dan kuis, karena itu yang disebut brief. Padahal 600 berkas video setahun dengan ukuran 500 MB adalah 300 GB, dan itu satu-satunya angka di seluruh brief yang benar-benar besar. Bagian yang paling menentukan bentuk sering bukan bagian yang paling banyak dibicarakan.',
      ),

      h2('Langkah 2, atribut penggerak'),
      p(
        'Dengan jawaban di atas, atribut kualitas dari sub-bab 1.3 bisa dipilih. Ingat aturannya, yaitu tiga sampai empat, ditulis sebagai kalimat yang bisa diperiksa, ditambah daftar yang sengaja tidak dikejar.',
      ),
      code(
        'text',
        `
        Atribut penggerak — Platform Kursus Lembaga

        1. Maintainability   (menang atas semuanya)
           Diperiksa: satu orang baru bisa menambah jenis materi baru, misalnya kuis
           bentuk lain, dalam satu hari tanpa menyentuh modul sertifikat.

        2. Integritas hasil belajar   (menang atas performa)
           Diperiksa: nilai kuis yang sudah tersimpan tidak pernah berbeda antara
           halaman rapor, halaman detail, dan sertifikat yang sudah terbit.

        3. Operability   (menang atas kesederhanaan kode)
           Diperiksa: tim dua orang tanpa orang infrastruktur sanggup merilis,
           memantau, dan memulihkan sendiri.

        4. Biaya penyimpanan terkendali
           Diperiksa: biaya bulanan penyimpanan dan bandwidth video bisa diperkirakan
           dari jumlah materi, dan tidak melonjak karena pola akses.

        Sengaja TIDAK dikejar:
        - Ketersediaan 99,99 persen. Mati 30 menit di luar jam belajar diterima.
        - Kemandirian rilis per modul. Satu tim, satu jadwal.
        - Skala di atas 5.000 peserta. Kalau tercapai, seluruh rancangan ditinjau ulang.
        - Personalisasi dan rekomendasi. Di luar cakupan versi pertama.
        `,
        {
          caption:
            'Baris terakhir bagian bawah adalah pembatas cakupan, dan ia melindungi seluruh keputusan berikutnya.',
        },
      ),

      h2('Langkah 3, menemukan batas modul'),
      p(
        'Sekarang sub-bab 2.4 dijalankan. Ingat aturan yang paling penting, yaitu jangan membagi menurut tabel. Ikuti bahasa yang dipakai orang lembaga dan ikuti alur pekerjaannya.',
      ),
      p(
        'Percakapan dengan pihak lembaga memunculkan sesuatu yang menarik. Mereka membedakan dengan tegas antara **menyusun kelas** yang dikerjakan pengajar sebelum kelas dibuka, dan **menjalankan kelas** yang terjadi saat peserta belajar. Keduanya dikerjakan orang berbeda, pada waktu berbeda, dan berubah karena alasan berbeda.',
      ),
      table(
        ['Modul', 'Satu kalimat tanggung jawabnya', 'Berubah ketika'],
        [
          [
            '`identitas`',
            'Siapa pengguna ini dan ia boleh berperan sebagai apa',
            'Cara masuk berubah, atau ada peran baru',
          ],
          [
            '`penyusunan`',
            'Pengajar menyusun kelas beserta urutan materinya, sampai kelas dibuka',
            'Ada jenis materi baru, atau aturan penyusunan berubah',
          ],
          [
            '`media`',
            'Menyimpan dan menyajikan berkas besar dengan aman',
            'Penyedia penyimpanan berubah, atau format video berubah',
          ],
          [
            '`pembelajaran`',
            'Peserta mengikuti kelas dan kemajuannya dicatat',
            'Aturan kemajuan berubah, misalnya syarat minimal menonton',
          ],
          [
            '`penilaian`',
            'Kuis dikerjakan dan nilainya dihitung',
            'Ada bentuk soal baru, atau cara menghitung nilai berubah',
          ],
          [
            '`sertifikasi`',
            'Menerbitkan dan memverifikasi sertifikat',
            'Bentuk sertifikat berubah, atau syarat kelulusan berubah',
          ],
          [
            '`pelaporan`',
            'Menyusun angka untuk admin dan lembaga',
            'Ada laporan baru yang diminta',
          ],
        ],
        'Tujuh modul, masing-masing bisa dijelaskan satu kalimat tanpa kata "dan". Itu uji pertama dari sub-bab 2.4.',
      ),
      p('Dua keputusan batas layak dijelaskan karena keduanya tidak jelas dengan sendirinya.'),
      steps(
        {
          title: 'Kenapa penilaian terpisah dari pembelajaran',
          body: 'Keduanya terasa satu, karena peserta mengerjakan kuis sambil belajar. Yang memisahkannya adalah alasan berubah. Aturan kemajuan menonton berubah karena permintaan pengajar, sedangkan aturan penghitungan nilai berubah karena kebijakan lembaga. Selama setahun terakhir di lembaga itu, keduanya tidak pernah berubah bersamaan.',
        },
        {
          title: 'Kenapa media terpisah dari penyusunan',
          body: 'Materi memang diunggah saat menyusun kelas, sehingga keduanya terasa satu alur. Yang memisahkannya adalah sifat pekerjaannya. Media berurusan dengan berkas ratusan megabita, penyimpanan luar, dan penyajian aman, sementara penyusunan berurusan dengan urutan dan aturan. Keduanya juga akan berubah karena alasan yang sama sekali berbeda.',
        },
      ),

      h2('Langkah 4, tabel keputusan bentuk'),
      p(
        'Sekarang empat pertanyaan dari sub-bab 2.8 dijawab, dengan bahasa biasa dan berdasarkan kejadian nyata.',
      ),
      code(
        'text',
        `
        Keputusan bentuk — Platform Kursus Lembaga, 2026-08-27

        1. Kalau memperbaiki satu bagian, semuanya harus ikut dirilis, dan itu merugikan?
           TIDAK. Satu tim dua orang, rilis mingguan, tidak ada yang tertahan.

        2. Beberapa bulan terakhir, satu permintaan fitur memaksa mengubah beberapa
           wilayah sekaligus?
           BELUM BISA DIJAWAB. Sistemnya belum ada. Karena tidak bisa dijawab,
           ia diperlakukan sebagai "batas masih bergerak", yaitu jawaban yang
           paling berhati-hati.

        3. Kalau ada masalah di produksi, berapa lama sampai tahu bagian mana?
           BELUM MATANG. Belum ada trace, belum ada log terpusat.

        4. Ada bagian yang jauh lebih berat, atau butuh teknologi berbeda?
           ADA DUA:
             - penyajian video, berat di bandwidth dan penyimpanan, bukan di prosesor
             - pembuatan PDF sertifikat, berat di prosesor dan berjalan lama

        Kesimpulan: MODULAR MONOLITH, tujuh modul, satu unit rilis.

        Dua bagian berat TIDAK menjadi layanan terpisah:
          - Video diserahkan ke object storage dan CDN. Aplikasi hanya menerbitkan
            tautan bertanda tangan berumur pendek, tidak pernah menyalurkan bytes-nya.
            Beban bandwidth-nya keluar dari aplikasi tanpa memecah apa pun.
          - Pembuatan PDF dipindahkan ke pekerja antrean di dalam unit rilis yang sama.
            Ia keluar dari jalur permintaan tanpa menjadi layanan tersendiri.

        Runner-up: modular monolith plus satu layanan sertifikat.
        Yang memisahkan: pertanyaan 1 dijawab tidak, sehingga layanan terpisah hanya
        menambah pipeline dan pemantauan tanpa membeli kemandirian rilis yang dibutuhkan.

        Cara menjalankan: container, satu image untuk API, satu image untuk pekerja.
        Beban rata pada jam belajar, jadi serverless tidak menguntungkan.

        Ditinjau ulang kalau:
          [ ] ada tim kedua yang butuh jadwal rilis sendiri
          [ ] pembuatan PDF butuh mesin dengan memori 4x aplikasi utama
          [ ] peserta aktif melewati 5.000
        `,
        {
          caption:
            'Jawaban pertanyaan 2 adalah bagian yang paling jujur di dokumen ini, karena ia mengakui apa yang belum diketahui.',
        },
      ),
      callout(
        'info',
        'Dua bagian berat diselesaikan tanpa memecah apa pun',
        'Ini pelajaran yang paling sering terlewat. Pertanyaan keempat dijawab "ada dua", dan naluri pertama adalah menyimpulkan butuh dua layanan tambahan. Kenyataannya keduanya selesai dengan alat yang jauh lebih murah, yaitu object storage untuk yang berat di bandwidth dan antrean untuk yang berat di prosesor. Periksa selalu apakah beban timpang punya jawaban yang lebih murah sebelum memecah.',
      ),

      h2('Langkah 5, diagram'),
      p(
        'Dua tingkat pertama dari sub-bab 4.1 dibuat sekarang. Tingkat ketiga ditunda sampai ada modul yang benar-benar rumit.',
      ),
      code(
        'text',
        `
        Tingkat 1 — Konteks

        ┌───────────┐      ┌───────────┐      ┌───────────┐
        │ Pengajar  │      │  Peserta  │      │   Admin   │
        └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
              │ menyusun         │ belajar,         │ melihat
              │ kelas            │ mengerjakan kuis │ laporan
              ▼                  ▼                  ▼
        ┌──────────────────────────────────────────────────────┐
        │            Platform Kursus Lembaga                   │
        │  Tempat lembaga menyelenggarakan kursus daring        │
        │  beserta penilaian dan sertifikatnya.                 │
        └──────┬──────────────────────────────┬────────────────┘
               │ menyimpan dan                │ mengirim
               │ menyajikan berkas             │ pemberitahuan
               ▼                              ▼
        ┌──────────────────┐          ┌──────────────────┐
        │ Object Storage   │          │ Penyedia Email   │
        │ + CDN            │          │ (sistem luar)    │
        │ (sistem luar)    │          └──────────────────┘
        └──────────────────┘
        `,
        {
          caption:
            'Object storage muncul di tingkat 1 karena ia sistem luar yang berhubungan langsung dengan peserta saat menonton.',
        },
      ),
      code(
        'text',
        `
        Tingkat 2 — Container

        ┌──────────────────────────┐
        │  Aplikasi Web            │
        │  [Next.js]               │
        └────────────┬─────────────┘
                     │ HTTPS/JSON
                     ▼
        ┌──────────────────────────────────────┐
        │  API Kursus  [Express + TypeScript]   │
        │  Tujuh modul, satu unit rilis.        │
        └───┬──────────────┬───────────┬───────┘
            │ SQL          │ menaruh   │ menerbitkan tautan
            │              │ pekerjaan │ bertanda tangan
            ▼              ▼           ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
    │ Basis Data   │ │  Antrean     │ │ Object Storage   │
    │ [PostgreSQL] │ │ [Redis+      │ │ + CDN            │
    │ schema per   │ │  BullMQ]     │ │ (sistem luar)    │
    │ modul        │ └───────┬──────┘ └────────▲─────────┘
    └──────────────┘         │                 │
                             │ mengambil       │ peserta mengunduh
                             ▼ pekerjaan       │ LANGSUNG dari sini
                  ┌────────────────────┐       │
                  │ Pekerja Latar      │───────┘
                  │ [Node.js]          │  mengunggah hasil
                  │ PDF, email, laporan │
                  └────────────────────┘
        `,
        {
          caption:
            'Panah dari peserta langsung ke CDN adalah keputusan bentuk yang paling menentukan biaya di sistem ini.',
        },
      ),
      p(
        'Panah terakhir itu pantas dibaca dua kali. Bytes video **tidak pernah** melewati API. Aplikasi hanya menerbitkan tautan bertanda tangan yang berumur pendek, lalu peserta mengunduh langsung dari CDN. Tanpa keputusan ini, satu server aplikasi harus menyalurkan ratusan gigabita per bulan, dan seluruh perhitungan kapasitasnya berubah total.',
      ),

      h2('Langkah 6, keputusan yang dicatat sebagai ADR'),
      p(
        'Dari seluruh rancangan di atas, ada empat keputusan yang lolos tiga uji di sub-bab 4.2. Sisanya cukup dijelaskan di dokumen arsitektur.',
      ),
      table(
        ['ADR', 'Keputusan', 'Kenapa ia pintu satu arah'],
        [
          [
            '0001',
            'Modular monolith, bukan layanan terpisah',
            'Keputusan menahan diri yang tidak meninggalkan jejak di kode, dan pasti diusulkan ulang',
          ],
          [
            '0002',
            'Video tidak pernah melewati API, hanya tautan bertanda tangan',
            'Mengubahnya nanti berarti mengubah cara seluruh materi disajikan dan seluruh perhitungan biaya',
          ],
          [
            '0003',
            'Satu database, satu schema per modul, satu pemilik per tabel',
            'Mengikat seluruh kode, dan melonggarkannya nanti mustahil tanpa memisahkan data',
          ],
          [
            '0004',
            'Nilai kuis disimpan sebagai fakta, bukan dihitung ulang dari jawaban',
            'Menyangkut data yang sudah tersimpan, sehingga mengubahnya berarti migrasi data',
          ],
        ],
        'ADR 0004 adalah contoh keputusan yang terlihat teknis kecil tetapi menyentuh data, sehingga ia satu arah.',
      ),
      code(
        'text',
        `
        # 0004. Nilai kuis disimpan sebagai fakta, bukan dihitung ulang

        Status: Diterima
        Tanggal: 2026-08-27

        ## Konteks

        Nilai peserta bisa disimpan sebagai angka hasil, atau dihitung ulang dari
        jawaban mentah setiap kali dibutuhkan. Atribut penggerak nomor 2 menuntut
        nilai yang sudah tersimpan tidak pernah berbeda antara rapor, halaman detail,
        dan sertifikat yang sudah terbit.

        Aturan penilaian akan berubah, misalnya bobot soal atau kebijakan nilai minimal.
        Kalau nilai dihitung ulang, perubahan aturan akan mengubah nilai peserta yang
        sudah lulus tahun lalu, termasuk yang sertifikatnya sudah tercetak.

        ## Keputusan

        Nilai disimpan sebagai fakta pada saat kuis diselesaikan, bersama versi aturan
        penilaian yang berlaku saat itu. Jawaban mentah tetap disimpan untuk penelusuran,
        tetapi tidak pernah menjadi sumber nilai yang ditampilkan.

        ## Pilihan yang ditolak

        - **Menghitung ulang dari jawaban setiap kali.** Ditolak karena perubahan aturan
          akan mengubah nilai yang sudah terbit di sertifikat. Ini bukan soal performa,
          melainkan soal kebenaran.
        - **Menyimpan nilai tanpa versi aturan.** Ditolak karena saat ada sengketa nilai,
          tidak ada cara mengetahui aturan mana yang dipakai saat itu.

        ## Akibat

        Menjadi lebih mudah:
        - Nilai selalu sama di semua tempat, tanpa perlu menjaga cache apa pun.
        - Aturan penilaian bisa diubah kapan saja tanpa menyentuh data lama.

        Menjadi lebih sulit:
        - Kalau ada bug di penghitungan, memperbaikinya butuh perhitungan ulang
          yang dijalankan sengaja, beserta keputusan sadar peserta mana yang terpengaruh.
        - Ada satu kolom tambahan yaitu versi aturan, yang harus diisi setiap penilaian.
        `,
        {
          filename: 'docs/adr/0004-nilai-sebagai-fakta.md',
          caption:
            'Perhatikan kalimat "ini bukan soal performa, melainkan soal kebenaran". Itu yang membuat penolakannya bisa dinilai.',
        },
      ),

      h2('Langkah 7, menguji rancangan dengan skenario'),
      p(
        'Sebelum satu baris kode ditulis, rancangan di atas dijalankan pada skenario dari sub-bab 4.6. Dua di antaranya menemukan hal yang belum terpikir.',
      ),
      table(
        ['Skenario', 'Jawaban rancangan sekarang', 'Temuan'],
        [
          [
            'Tiga ratus peserta menonton video bersamaan',
            'Bytes-nya dari CDN, API hanya menerbitkan tautan. Beban API nyaris nol',
            'Aman. Inilah yang dibeli ADR 0002',
          ],
          [
            'Object storage mati satu jam',
            'Peserta tidak bisa menonton. Halaman lain tetap jalan',
            'Perlu tambahan, yaitu halaman materi harus menampilkan pesan yang jelas, bukan pemutar video yang gagal diam-diam',
          ],
          [
            'Pembuatan PDF gagal di tengah',
            'Pekerjaan diulang antrean. Aman diulang karena nomor sertifikat sudah ditetapkan saat kelulusan, bukan saat PDF dibuat',
            'Aman, tetapi hanya karena nomor ditetapkan lebih dulu. Kalau nomor dibuat saat PDF dibuat, pengulangan menghasilkan dua nomor',
          ],
          [
            'Menambah metode pembayaran nanti',
            'Modul baru `pembayaran`, memancarkan event yang didengarkan `pembelajaran` untuk membuka akses',
            'Aman. Tidak ada modul yang ada sekarang perlu berubah',
          ],
          [
            'Seorang pengajar menghapus materi yang sedang ditonton peserta',
            'Belum terpikir',
            'Temuan nyata. Perlu keputusan, yaitu menghapus berarti menyembunyikan dari kelas baru sementara peserta lama tetap bisa mengakses',
          ],
        ],
        'Baris ketiga dan kelima adalah alasan sesungguhnya langkah ini ada, karena keduanya baru terlihat saat diuji.',
      ),
      callout(
        'tip',
        'Temuan baris ketiga bukan kebetulan',
        'Nomor sertifikat yang ditetapkan saat kelulusan, bukan saat PDF dibuat, adalah persis penerapan sifat aman diulang dari sub-bab 3.1. Yang membedakan orang yang sudah membaca kategori ini dari yang belum bukan kemampuan menemukan masalah itu, melainkan kebiasaan menjalankan skenario "satu pesan dikirim dua kali" pada setiap pekerjaan latar.',
      ),

      h2('Latihan, jalankan pada sistemmu sendiri'),
      p(
        'Ambil satu sistem yang sedang kamu kerjakan atau satu ide yang ingin kamu bangun, lalu jalankan tujuh langkah yang sama. Sediakan waktu sekitar dua jam, dan tulis hasilnya.',
      ),
      ol(
        'Tulis brief-nya dalam satu paragraf, lalu daftar empat pertanyaan yang belum ia jawab. Cari jawabannya kalau bisa, atau tulis asumsimu kalau tidak.',
        'Pilih tiga sampai empat atribut penggerak, tulis sebagai kalimat yang bisa diperiksa, lalu tulis juga yang sengaja tidak dikejar.',
        'Daftar modulnya, masing-masing satu kalimat tanpa kata "dan", beserta alasan ia berubah.',
        'Jawab empat pertanyaan tabel keputusan berdasarkan kejadian nyata, lalu tulis kesimpulan beserta runner-up dan pemicu peninjauan.',
        'Gambar tingkat 1 dan tingkat 2. Cukup kotak dan panah berketerangan, tidak perlu alat khusus.',
        'Pilih dua sampai empat keputusan yang lolos tiga uji ADR, lalu tulis satu di antaranya lengkap, termasuk bagian yang menjadi lebih sulit.',
        'Uji dengan lima skenario, dan tulis temuannya apa adanya termasuk yang belum ada jawabannya.',
      ),
      callout(
        'warning',
        'Langkah tujuh adalah yang paling mudah dilewati dan paling banyak memberi',
        'Enam langkah pertama menghasilkan dokumen yang rapi, dan rasanya seperti sudah selesai. Langkah ketujuh yang membuktikan apakah kerapian itu benar. Kalau kamu hanya sempat mengerjakan sebagian, kerjakan langkah 4 dan langkah 7. Keduanya yang paling banyak mengubah keputusan.',
      ),

      h2('Rangkuman kategori'),
      p(
        'Kategori ini berisi tiga puluh sub-bab, dan seluruhnya bisa diringkas menjadi enam kalimat.',
      ),
      ul(
        'Arsitektur adalah kumpulan keputusan yang mahal dibatalkan, dan yang menariknya ke bentuk tertentu adalah atribut kualitas, bukan daftar fitur.',
        'Hampir semua keluhan tentang kode yang sulit diubah adalah keluhan tentang batas, dan batas adalah soal siapa boleh tahu apa.',
        'Bentuk paling tidak terdistribusi adalah pilihan bawaan, dan yang harus dibuktikan adalah alasan menyimpang darinya.',
        'Memecah tidak pernah menciptakan batas. Ia memindahkan batas yang sudah ada ke bentuk yang lebih mahal.',
        'Begitu sesuatu terpisah, yang menentukan adalah kontrak dan kepemilikan data, bukan teknologi yang dipakai.',
        'Keputusan yang tidak dicatat akan diperdebatkan ulang, dan aturan yang tidak bisa gagal di CI akan hilang.',
      ),
      p(
        'Kalau kamu hanya membawa satu hal dari kategori ini, bawa yang ini. **Bentuk yang benar adalah bentuk paling sederhana yang memenuhi kebutuhan yang benar-benar ada sekarang, ditambah batas yang membuat perubahan berikutnya tetap murah.** Sisanya adalah cara mengetahui kebutuhan mana yang benar-benar ada.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Merancang dari nol berguna hanya bila setiap keputusannya bisa ditelusuri kembali ke sebuah angka atau sebuah batasan. Tanpa itu, yang dihasilkan adalah diagram yang terlihat masuk akal dan tidak bisa diperiksa.',
      ),
      code(
        'text',
        `
        Urutan yang dipakai sepanjang kategori ini:

        1. BATASAN dan ATRIBUT KUALITAS, dengan angka
           berapa pengguna, berapa tulis, berapa baca, target latensi
           pada persentil berapa, target ketersediaan, dan APA YANG
           TIDAK dikerjakan

        2. KEPUTUSAN YANG MAHAL DIBATALKAN, diurutkan
           bentuk data yang tersimpan
           kontrak publik
           batas modul dan arah ketergantungan
           -> tunda selama mungkin, dan buat lebih murah bila bisa

        3. BENTUK, dan untuk tiap kotak: "angka mana yang
           membuatnya perlu ada?"

        4. PENEGAKAN: fitness function untuk sifat yang harus dijaga

        5. CARA MENGETAHUI INI BERHASIL: metrik yang ditetapkan
           SEBELUM dibangun
        `,
        {
          caption:
            'Langkah 4 dan 5 yang paling sering dilewati, dan keduanya yang membuat rancangannya bertahan.',
        },
      ),
      p(
        'Angka-angka yang diukur sepanjang kategori ini bisa dipakai langsung sebagai patokan, dan mengumpulkannya membuat perancangan jauh lebih cepat.',
      ),
      table(
        ['Pertanyaan', 'Angka yang diukur', 'Keputusan yang lahir darinya'],
        [
          [
            'Seberapa mahal panggilan lintas proses?',
            'fungsi puluhan ns, loopback 1,69 ms, internet p50 70,04 ms',
            'Kurangi JUMLAH panggilan, bukan percepat masing-masing',
          ],
          [
            'Berapa biaya menambah komponen?',
            '10 komponen berantai @ 99,9% -> 87,2 jam mati/tahun',
            'Tiap komponen baru harus punya jawaban saat ia mati',
          ],
          [
            'Seberapa mahal mengubah fungsi bersama?',
            'authoring.ts menyentuh 82 dari 116 berkas (71%)',
            'Bentuk fungsi bersama adalah keputusan arsitektur',
          ],
          [
            'Apa yang hilang saat menambah replika?',
            'saat beban tulis, 8 dari 8 read-after-write GAGAL',
            'Keputusan uang dan otorisasi dibaca dari sumber',
          ],
          [
            'Berapa untung-rugi denormalisasi?',
            'baca 468,9 ms -> 0,068 ms; tulis 0,0090 -> 0,2825 ms',
            'Hitung rasio baca terhadap tulis sebelum memutuskan',
          ],
          [
            'Apakah batasnya benar-benar ditegakkan?',
            '1 pelanggaran arah + 3 siklus, tidak ada yang sengaja',
            'Aturan yang tidak dijalankan mesin akan menyimpang',
          ],
        ],
      ),
      p(
        'Baris terakhir itu hasil pengukuran pada project ini sendiri, dan ia menunjukkan bahwa jarak antara niat dan kenyataan selalu ada.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Latihan merancang gagal dengan bentuk yang berulang, dan mengenalinya lebih cepat daripada menunggu koreksi orang lain.',
      ),
      code(
        'text',
        `
        1. Kotak yang tidak bisa menjawab "angka mana?"

           Itu kotak yang ada karena sudah terbayang sejak awal.
           Hapus, atau temukan angkanya.

        2. Tidak ada satu pun jawaban untuk "bagaimana kalau X mati?"

           Dihitung: bila tiap permintaan menyentuh 16 shard, satu
           shard mati berarti 100% permintaan gagal. Bila tiap
           permintaan menyentuh satu shard, 6,25%.
           Selisihnya ditentukan RANCANGAN, bukan keandalan shard-nya.

        3. Tidak menyebut apa yang TIDAK dikerjakan

           Tanpa batas, cakupannya melebar sampai tidak ada yang
           bisa dinilai selesai.

        4. Nama teknologi dipakai sebagai jawaban

           "Pakai Kafka" bukan keputusan sampai ada angka yang
           menjelaskan kenapa antrean dibutuhkan.

        5. Rancangan yang tidak punya cara diperiksa

           Tanpa fitness function, rancangannya menyimpang dan tidak
           ada yang tahu. Diukur pada project ini: 3 pelanggaran,
           tidak satu pun disengaja.
        `,
      ),
      p(
        'Kesalahan keenam bersifat arah, dan ia yang paling sering membuat latihan ini kehilangan gunanya.',
      ),
      code(
        'text',
        `
        Merancang untuk masalah yang tidak ada.

        Contoh nyata dari project ini, diukur sungguhan:

          Gejala : npm run build gagal, beberapa halaman melewati
                   batas 60 detik, termasuk yang tidak diubah
          Dugaan : bebannya terlalu besar untuk mesin ini

          Yang diukur:
            penyorotan kode seluruh 427 halaman : 5.785 ms total
            rata-rata per halaman               :    14 ms
            halaman yang GAGAL                  :    30 ms
            satu halaman yang gagal tidak punya blok kode sama sekali
            CPU 4, swap 0, memori tersisa ~1,1 GB
            load average saat gagal             : 12,84 pada 4 CPU

          Satu perubahan, satu variabel:
            CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik

        Dugaan pertamanya masuk akal dan salah. Yang membedakan
        hanya urutannya: ukur dulu, baru simpulkan.
        `,
        {
          caption:
            'Kebiasaan itu berlaku sama pada sistem berjuta pengguna dan pada build yang gagal di laptop sendiri.',
        },
      ),
      p('Kesalahan terakhir menyangkut kejujuran tentang apa yang belum diketahui.'),
      code(
        'text',
        `
        MENYATAKAN KEPASTIAN YANG TIDAK DIMILIKI:

          "Sistem ini akan menangani 50.000 QPS."

        Bentuk yang jujur:

          "Dengan asumsi rasio baca:tulis 10:1 dan puncak 3x
           rata-rata, kami memperkirakan 34.722 QPS baca pada
           puncaknya. Asumsi yang paling mungkin meleset adalah
           faktor puncak: kampanye bisa menghasilkan 20x dalam
           beberapa menit. Yang akan mempersempit perkiraan ini
           adalah data lalu lintas tiga bulan terakhir, yang belum
           kami miliki."

        Bentuk kedua bisa dikoreksi orang lain dalam satu kalimat.
        Bentuk pertama hanya bisa dipercaya atau tidak.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Latihan merancang mudah dikerjakan dengan cara yang menghasilkan diagram bagus tanpa satu pun keputusan yang bisa diperiksa.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Langsung menggambar bentuk arsitekturnya',
            'Itu yang ditunggu orang',
            'Tidak ada dasar menilai apakah tiap kotaknya perlu. Mulai dari batasan dan angka',
          ],
          [
            'Menyalin arsitektur perusahaan besar',
            'Mereka kan sudah teruji',
            'Arsitektur mereka menjawab masalah mereka, termasuk masalah organisasi yang tidak kamu punya',
          ],
          [
            'Menyebut nama teknologi sebagai keputusan',
            'Itu yang dipakai orang',
            'Nama pola dan nama alat bukan keputusan sampai jelas batas apa yang dipisahkan dan kenapa',
          ],
          [
            'Tidak menjawab "bagaimana kalau X mati?"',
            'Komponennya kan andal',
            'Dihitung, satu shard mati bisa berarti 6,25% atau 100% gagal, tergantung rancangannya',
          ],
          [
            'Tidak memasang cara memeriksa rancangannya',
            'Timnya sudah sepakat',
            'Diukur pada project ini, 3 pelanggaran menyelinap masuk tanpa ada yang sengaja melanggarnya',
          ],
          [
            'Menulis perkiraan sebagai kepastian',
            'Terdengar lebih meyakinkan',
            'Tanpa asumsi yang tertulis, tidak ada yang bisa dikoreksi orang lain',
          ],
        ],
      ),
      p(
        'Yang sebenarnya dilatih di seluruh kategori ini bukan kemampuan menggambar sistem melainkan kebiasaan menuntut angka sebelum mengambil keputusan, dan menuliskan apa yang dibayar untuk setiap keuntungan. Kebiasaan itu berlaku sama pada sistem berjuta pengguna dan pada satu berkas dengan fan-in 58, dan pada keduanya ia menghasilkan hal yang sama, yaitu keputusan yang bisa diperiksa orang lain dan diperbaiki ketika angkanya berubah.',
      ),
      references(
        {
          label: 'Azure Application Architecture Guide',
          href: 'https://learn.microsoft.com/en-us/azure/architecture/guide/',
          source: 'Microsoft',
          note: 'Peta lengkap dari gaya sampai pola, berguna sebagai rujukan lanjutan setelah kategori ini.',
        },
        {
          label: 'AWS Well-Architected Framework',
          href: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html',
          source: 'Amazon Web Services',
          note: 'Daftar pertanyaan per pilar yang bisa dipakai menguji hasil latihan di atas.',
        },
        {
          label: 'The C4 model — introduction',
          href: 'https://c4model.com/introduction',
          source: 'c4model.com',
          note: 'Pengantar singkat untuk mengulang cara menggambar hasil rancanganmu sendiri.',
        },
      ),
    ],
  ),
];
