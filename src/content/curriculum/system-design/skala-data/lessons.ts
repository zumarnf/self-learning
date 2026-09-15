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
 * System Design — Chapter 3, seven lessons.
 *
 * The database is the first thing to run out of room and the last thing anyone wants to change,
 * so this chapter walks the escape routes in the order they should actually be taken: bigger
 * machine, then replicas, then a deliberate consistency decision, and only then sharding.
 *
 * Builds directly on `backend-basic/database-sql` — indexes, normalisation, and transactions are
 * assumed, not re-taught.
 */
export const lessons: LessonDraft[] = [
  written(
    'sql-atau-nosql',
    'Memilih SQL atau NoSQL',
    20,
    'Bentuk pertanyaan yang akan diajukan ke data menentukan tempat data itu disimpan.',
    [
      p(
        'Pertanyaan "SQL atau NoSQL" sering diperlakukan seperti pemilihan aliran, padahal ia pertanyaan teknis yang punya jawaban dan jawabannya berasal dari satu hal, yaitu **bentuk pertanyaan yang akan paling sering diajukan ke data itu**.',
      ),
      p(
        'Sub-bab ini menyusun kerangka pemilihannya, menunjukkan empat keluarga NoSQL beserta kasus yang benar-benar cocok untuk masing-masing, dan menutup dengan kenyataan yang jarang disebut, yaitu sistem yang cukup besar hampir selalu memakai lebih dari satu jenis penyimpanan sekaligus.',
      ),

      terms(
        {
          term: 'relational (SQL)',
          meaning:
            'Model penyimpanan yang menata data sebagai tabel bertipe tetap dan menghubungkannya lewat kunci. Contohnya PostgreSQL dan MySQL. Kekuatannya ada pada kemampuan menjawab pertanyaan yang belum terpikir saat merancang skemanya, karena `JOIN` bisa merangkai tabel mana pun dengan tabel mana pun.',
        },
        {
          term: 'NoSQL',
          meaning:
            'Payung untuk basis data yang tidak memakai model relasional. Dibaca "no-sikuel", dan sering diartikan "not only SQL". Perlu diingat NoSQL bukan satu jenis melainkan **empat keluarga** yang sangat berbeda, sehingga membandingkan "SQL versus NoSQL" sebenarnya membandingkan satu hal dengan empat hal.',
        },
        {
          term: 'key-value',
          meaning:
            'Keluarga NoSQL paling sederhana, yaitu penyimpanan yang hanya bisa menyimpan dan mengambil nilai berdasarkan satu kunci. Contohnya Redis dan DynamoDB. Karena operasinya sesederhana itu, ia bisa sangat cepat dan sangat mudah dibagi ke banyak mesin.',
        },
        {
          term: 'document',
          meaning:
            'Keluarga yang menyimpan data sebagai dokumen mirip JSON, sehingga satu dokumen bisa memuat struktur bersarang. Contohnya MongoDB. Kekuatannya ketika seluruh data yang dibutuhkan satu tampilan bisa disimpan dalam satu dokumen, sehingga membacanya cukup satu operasi.',
        },
        {
          term: 'wide-column',
          meaning:
            'Keluarga yang dirancang untuk laju penulisan sangat tinggi dan data yang bersifat deret waktu. Contohnya Cassandra dan ScyllaDB. Data ditata berdasarkan kunci partisi dan kunci pengurutan, sehingga pembacaan sebuah rentang di dalam satu partisi menjadi sangat cepat.',
        },
        {
          term: 'graph',
          meaning:
            'Keluarga yang menyimpan simpul beserta hubungannya, dan dirancang untuk menelusuri hubungan itu. Contohnya Neo4j. Berguna ketika pertanyaannya berbentuk "siapa saja yang terhubung dengan siapa dalam tiga langkah", yang di SQL berarti join berlapis yang sangat mahal.',
        },
        {
          term: 'schema (skema)',
          meaning:
            'Aturan tentang bentuk data yang boleh disimpan. Basis data relasional menegakkannya, sehingga baris yang tidak sesuai bentuk ditolak. Basis data dokumen umumnya tidak, sehingga aturan bentuknya harus ditegakkan aplikasi. Perbedaan ini sering disebut schema-on-write dibanding schema-on-read.',
        },
        {
          term: 'polyglot persistence',
          meaning:
            'Pemakaian lebih dari satu jenis basis data dalam satu sistem, masing-masing untuk pola akses yang cocok dengannya. Dibaca "poliglot persistens". Ini keadaan normal pada sistem berskala besar, bukan tanda perancangan yang buruk.',
        },
        {
          term: 'ACID dan BASE',
          meaning:
            'Dua kumpulan sifat yang saling berlawanan. ACID menjanjikan transaksi yang atomik dan konsisten, dan sudah dibahas di sub-bab [transaksi dan ACID](/kelas/backend-basic/database-sql-dasar/transaksi-acid). BASE adalah pendekatan yang lebih longgar, yaitu tersedia hampir selalu dan konsisten pada akhirnya, ditukar dengan kemampuan tersebar yang lebih baik.',
        },
      ),

      h2('Mulai dari relasional, dan sadari kenapa'),
      p(
        'Untuk aplikasi baru, basis data relasional adalah pilihan bawaan yang benar, dan alasannya bukan kebiasaan.',
      ),
      ul(
        '**Pertanyaan di masa depan belum diketahui.** Saat merancang, kamu tahu tampilan yang ada hari ini. Setahun kemudian akan ada laporan, pencarian, dan tampilan baru yang tidak terpikir sekarang. `JOIN` menjawab pertanyaan yang belum dirancang, sedangkan penyimpanan yang ditata mengikuti satu pola akses tidak.',
        '**Aturan ditegakkan basis datanya.** Batasan `UNIQUE`, `FOREIGN KEY`, dan `NOT NULL` bekerja bahkan ketika ada dua permintaan yang saling menyela, sedangkan pemeriksaan di kode bisa lolos pada kondisi balapan.',
        '**Transaksi tersedia tanpa usaha tambahan.** Memindahkan saldo antar akun aman secara bawaan.',
        '**Batasnya jauh lebih tinggi daripada yang diduga.** Satu instance PostgreSQL yang disetel dengan benar melayani puluhan ribu operasi per detik.',
      ),
      p(
        'Beralih ke NoSQL sebaiknya dilakukan karena ada pola akses yang **benar-benar tidak cocok** dengan model relasional, bukan karena skalanya terdengar besar.',
      ),

      h2('Kerangka pemilihan'),
      table(
        ['Pertanyaan', 'Bila ya', 'Alasan'],
        [
          [
            'Butuh transaksi lintas beberapa entitas?',
            'Relasional',
            'Transaksi terdistribusi mahal dan rumit',
          ],
          [
            'Butuh menggabungkan banyak tabel dalam satu pertanyaan?',
            'Relasional',
            '`JOIN` adalah keunggulan utama model ini',
          ],
          [
            'Pertanyaannya akan berubah-ubah dan belum diketahui?',
            'Relasional',
            'SQL menjawab yang belum dirancang',
          ],
          [
            'Aksesnya selalu berupa ambil satu nilai dengan satu kunci?',
            'Key-value',
            'Operasi paling sederhana, jadi paling cepat dan paling mudah dibagi',
          ],
          [
            'Bentuk datanya sangat bervariasi antar baris?',
            'Dokumen',
            'Skema kaku justru menghalangi',
          ],
          [
            'Laju tulis sangat tinggi dan datanya deret waktu?',
            'Kolom lebar',
            'Dirancang untuk penulisan berurutan yang sangat banyak',
          ],
          [
            'Pertanyaannya menelusuri hubungan berlapis?',
            'Graf',
            'Join berlapis di SQL menjadi sangat mahal',
          ],
          [
            'Butuh pencarian teks penuh dengan peringkat?',
            'Mesin pencari',
            'Tambahan di samping basis data utama, bukan pengganti',
          ],
        ],
      ),
      callout(
        'tip',
        'Jawaban "skalanya besar" tidak ada di tabel itu, dan itu disengaja',
        'Skala besar bukan alasan memilih NoSQL. Basis data relasional bisa direplikasi dan di-shard juga, seperti yang dibahas di dua sub-bab berikutnya. Yang membuat NoSQL menang bukan angka penggunanya, melainkan **bentuk pola aksesnya** yang kebetulan sangat cocok dengan cara penyimpanan itu bekerja.',
      ),

      h2('Empat keluarga NoSQL beserta kasus yang cocok'),
      h2('Key-value'),
      p(
        'Modelnya sesederhana `Map`, yaitu simpan nilai dengan kunci, ambil nilai dengan kunci. Justru kesederhanaan itu yang membuatnya bisa sangat cepat dan sangat mudah dibagi, karena tidak ada operasi yang butuh melihat lebih dari satu kunci.',
      ),
      table(
        ['Cocok untuk', 'Tidak cocok untuk'],
        [
          ['Sesi pengguna', 'Apa pun yang butuh dicari berdasarkan isi'],
          ['Cache', 'Laporan dan agregasi'],
          ['Hitungan dan rate limiter', 'Data yang punya banyak hubungan'],
          ['Papan peringkat lewat sorted set', 'Source of truth yang tidak boleh hilang'],
        ],
      ),
      h2('Dokumen'),
      p(
        'Satu dokumen bisa memuat struktur bersarang, sehingga seluruh data untuk satu tampilan bisa berada dalam satu dokumen dan dibaca dengan satu operasi.',
      ),
      compare(
        {
          title: 'Relasional, empat tabel',
          lang: 'sql',
          code: `
            SELECT p.*, k.nama, t.nama AS tag
            FROM produk p
            JOIN kategori k ON k.id = p.kategori_id
            LEFT JOIN produk_tag pt ON pt.produk_id = p.id
            LEFT JOIN tag t ON t.id = pt.tag_id
            WHERE p.id = 42;
          `,
          notes: [
            'Bentuknya tetap dan ditegakkan basis data',
            'Bisa menjawab pertanyaan lain tanpa mengubah skema',
            'Butuh join untuk merakit satu tampilan',
          ],
        },
        {
          title: 'Dokumen, satu operasi',
          lang: 'json',
          code: `
            {
              "_id": 42,
              "nama": "Kursi Kerja",
              "kategori": { "id": 3, "nama": "Perabot" },
              "tag": ["ergonomis", "kayu"],
              "atribut": {
                "tinggi_cm": 110,
                "warna": ["hitam", "cokelat"],
                "garansi_bulan": 24
              }
            }
          `,
          notes: [
            'Satu pembacaan sudah lengkap',
            '`atribut` bisa berbeda antar produk tanpa mengubah apa pun',
            'Nama kategori tersalin, jadi harus dijaga bila berubah',
          ],
        },
      ),
      p(
        'Baris terakhir pada catatan kanan itu adalah pertukarannya. Menyalin nama kategori ke dalam tiap produk membuat pembacaan menjadi satu operasi, dan sekaligus berarti mengganti nama sebuah kategori harus memperbarui semua produk yang memuatnya. Ini denormalisasi, dan itu dibahas tuntas di sub-bab [denormalisasi dan summary table](/kelas/system-design/skala-data/denormalisasi).',
      ),
      h2('Kolom lebar'),
      p(
        'Dirancang untuk laju penulisan yang sangat tinggi pada data yang datang berurutan menurut waktu. Datanya ditata berdasarkan kunci partisi lalu diurutkan di dalam partisi itu, sehingga membaca sebuah rentang di dalam satu partisi menjadi sangat cepat.',
      ),
      code(
        'text',
        `
        Kunci partisi: percakapan_id
        Kunci urut   : dikirim_pada (menurun)

        percakapan_id=7  | dikirim_pada=10:03 | pengirim=A | isi="halo"
                         | dikirim_pada=10:02 | pengirim=B | isi="hai"
                         | dikirim_pada=10:01 | pengirim=A | isi="hei"

        "Ambil 50 pesan terakhir pada percakapan 7" adalah pembacaan berurutan
        pada satu partisi, dan itulah bentuk yang paling disukai model ini.
        `,
      ),
      p(
        'Harga yang dibayar sangat khas dan perlu dipahami, yaitu **kamu harus tahu pola pertanyaannya sebelum merancang tabelnya**. Pertanyaan yang tidak sesuai kunci partisi menjadi sangat mahal atau tidak didukung sama sekali, dan tidak ada `JOIN` yang bisa menyelamatkan.',
      ),
      h2('Graf'),
      p(
        'Berguna ketika hubungannya sendiri yang menjadi pertanyaan. "Teman dari temanku yang bekerja di kota ini" adalah penelusuran tiga langkah yang di SQL berarti tiga join berlapis atas tabel yang besar.',
      ),
      p(
        'Perlu kejujuran di sini, yaitu sebagian besar aplikasi **tidak** membutuhkannya. Kalau kedalaman penelusuranmu hanya satu atau dua langkah, tabel relasi biasa dengan index yang benar sudah lebih dari cukup, dan menambah satu jenis basis data hanya menambah beban operasional.',
      ),

      h2('Beberapa penyimpanan dalam satu sistem'),
      p(
        'Sistem yang cukup besar hampir selalu memakai lebih dari satu jenis penyimpanan, dan itu keadaan normal.',
      ),
      table(
        ['Data', 'Disimpan di', 'Alasan'],
        [
          [
            'Akun, pesanan, pembayaran',
            'PostgreSQL',
            'Butuh transaksi dan batasan yang ditegakkan',
          ],
          ['Sesi dan cache', 'Redis', 'Akses berdasarkan kunci, dan boleh hilang'],
          ['Berkas dan gambar', 'Object storage', 'Besar, dan tidak perlu ditanyai'],
          ['Indeks pencarian', 'Mesin pencari', 'Peringkat dan pencocokan teks'],
          ['Riwayat pesan', 'Kolom lebar', 'Tulis sangat banyak, baca per percakapan'],
          ['Peristiwa untuk analitik', 'Penyimpanan kolom', 'Agregasi atas data yang sangat besar'],
        ],
      ),
      callout(
        'warning',
        'Setiap penyimpanan tambahan punya biaya tetap yang tidak pernah hilang',
        'Satu jenis basis data baru berarti satu lagi hal yang harus dicadangkan, dipantau, diamankan, diperbarui, dan dipahami orang berikutnya. Tambahkan hanya ketika ada pola akses yang benar-benar tidak bisa dilayani dengan baik oleh yang sudah ada, dan periksa dulu apakah basis data yang sekarang punya fitur untuk itu.',
      ),
      p(
        'Pemeriksaan terakhir pada kalimat di atas sering menghemat banyak pekerjaan. PostgreSQL punya tipe `JSONB` untuk data dengan bentuk bervariasi, punya pencarian teks penuh bawaan, punya `LISTEN` dan `NOTIFY` untuk pemberitahuan sederhana, dan punya ekstensi untuk deret waktu maupun pencarian vektor. Banyak kebutuhan yang terlihat menuntut basis data baru ternyata sudah tersedia di tempat datanya sekarang.',
      ),
      code(
        'sql',
        `
        -- Bentuk bervariasi tanpa meninggalkan PostgreSQL.
        ALTER TABLE produk ADD COLUMN atribut JSONB NOT NULL DEFAULT '{}'::jsonb;

        -- Index GIN membuat pencarian di dalam JSONB tetap cepat.
        CREATE INDEX produk_atribut_idx ON produk USING GIN (atribut);

        -- Pertanyaan yang biasanya menjadi alasan orang pindah ke basis data dokumen.
        SELECT id, nama
        FROM produk
        WHERE atribut @> '{"warna": ["hitam"]}';
        `,
        { caption: 'Kolom JSONB menutup sebagian besar alasan berpindah ke penyimpanan dokumen.' },
      ),

      h2('Cara memilih dalam praktik'),
      steps(
        {
          title: 'Tulis pola aksesnya lebih dulu',
          body: 'Daftar pertanyaan yang akan diajukan ke data ini, beserta perkiraan seberapa sering masing-masing. Ini masukan utamanya, bukan nama teknologinya.',
        },
        {
          title: 'Periksa apakah relasional sudah cukup',
          body: 'Untuk sebagian besar pola akses, jawabannya ya. Termasuk pola yang butuh bentuk bervariasi, karena JSONB ada.',
        },
        {
          title: 'Cari pola yang benar-benar tidak cocok',
          body: 'Misalnya penulisan puluhan ribu per detik pada data deret waktu, atau penelusuran hubungan lebih dari tiga langkah.',
        },
        {
          title: 'Tambahkan satu penyimpanan untuk pola itu saja',
          body: 'Jangan memindahkan semuanya. Biarkan source of truth-nya tetap di tempatnya, dan tambahkan penyimpanan khusus untuk pola yang khusus.',
        },
        {
          title: 'Putuskan cara menjaga keduanya sejalan',
          body: 'Dua penyimpanan berarti data yang sama bisa berbeda. Tetapkan siapa source of truth-nya, dan bagaimana yang lain diperbarui.',
        },
      ),
      p(
        'Langkah terakhir yang paling sering dilupakan, dan langkah itulah yang menghasilkan bug paling membingungkan. Ketika indeks pencarian tidak sejalan dengan basis data, pengguna melihat hasil pencarian yang menunjuk ke barang yang sudah tidak ada. Tetapkan sejak awal bahwa basis data utama adalah source of truth, dan yang lain diperbarui lewat antrean sesudah penulisan berhasil.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Perdebatan SQL melawan NoSQL hampir selalu diajukan sebagai pertanyaan tentang performa, padahal keduanya lebih berbeda pada apa yang **dijamin** daripada pada seberapa cepat.',
      ),
      code(
        'text',
        `
        Yang diberikan basis data relasional secara gratis, dan
        diukur sungguhan pada PostgreSQL 16.15:

          INSERT INTO pesanan (pelanggan_id, total) VALUES (1, -500);
            ERROR: violates check constraint "pesanan_total_check"

          INSERT INTO pesanan (pelanggan_id, total) VALUES (999999, 100);
            ERROR: violates foreign key constraint
                   "pesanan_pelanggan_id_fkey"

        Dua aturan bisnis yang ditegakkan basis data, bukan aplikasi,
        dan karena itu tetap berlaku meski ada bug di aplikasi, ada
        skrip migrasi yang salah, atau ada orang yang mengubah data
        lewat konsol.
        `,
        {
          caption:
            'Pada basis data tanpa skema, kedua penjagaan itu harus ditulis ulang di setiap jalur penulisan.',
        },
      ),
      p(
        'Pertanyaan yang lebih berguna daripada "mana yang lebih cepat" adalah "apa yang saya lepaskan", dan jawabannya bisa ditulis berdampingan.',
      ),
      table(
        ['', 'Relasional', 'Dokumen / kunci-nilai'],
        [
          ['Bentuk data dijaga', 'Oleh basis data', 'Oleh aplikasi, di setiap jalur tulis'],
          ['Relasi antar entitas', 'Foreign key, JOIN', 'Disalin, atau digabung di aplikasi'],
          ['Transaksi lintas entitas', 'Ada, dan mudah', 'Terbatas, atau tidak ada'],
          [
            'Query yang belum terbayang',
            'Bisa, dengan indeks baru',
            'Sering menuntut menulis ulang datanya',
          ],
          ['Penskalaan tulis horizontal', 'Perlu sharding, dan itu pekerjaan', 'Sering bawaan'],
          [
            'Bentuk data yang berubah-ubah',
            'Perlu migrasi',
            'Bebas, dan bebannya pindah ke pembaca',
          ],
        ],
      ),
      p(
        'Baris keempat yang paling sering diremehkan, dan akibatnya baru terasa setelah datanya banyak.',
      ),
      code(
        'text',
        `
        Pada basis data relasional, pertanyaan baru dijawab dengan
        query baru:

          "berapa artikel per penulis bulan ini?"
          -> satu query, tambah satu indeks bila perlu

        Pada model dokumen yang dirancang untuk satu pola akses,
        pertanyaan baru sering menuntut MENULIS ULANG datanya,
        sebab bentuk penyimpanannya dipilih untuk menjawab
        pertanyaan yang lama.

        Karena itu aturan praktisnya:
          pola akses SUDAH diketahui dan tetap -> dokumen bisa menang
          pola akses BELUM diketahui           -> relasional jauh lebih aman
        `,
      ),
      p(
        'Dan satu hal yang jarang disebut adalah bahwa basis data relasional modern sudah menyediakan sebagian besar keluwesan yang dicari orang di basis data dokumen.',
      ),
      code(
        'text',
        `
        PostgreSQL:
          kolom JSONB dengan indeks GIN
          -> menyimpan dokumen bebas bentuk DI DALAM tabel yang
             kolom pentingnya tetap bertipe dan tetap dijaga

        Bentuk yang lazim dan sering paling tepat:
          kolom bertipe untuk yang dipakai memfilter dan menggabung
          satu kolom JSONB untuk atribut yang berubah-ubah

        Dengan begitu, foreign key dan constraint tetap bekerja
        untuk bagian yang memang harus dijaga.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang khas pada pilihan tanpa skema muncul jauh sesudah keputusannya diambil, dan bentuknya sangat konsisten.',
      ),
      code(
        'text',
        `
        1. Bentuk data menyimpang tanpa ada yang menyadarinya

           dokumen dari 2024: {"nama": "Ana"}
           dokumen dari 2025: {"nama": {"depan": "Ana", "belakang": "S"}}
           dokumen dari 2026: {"namaLengkap": "Ana S"}

           Ketiganya ada di koleksi yang sama, dan kode yang
           membacanya harus menangani ketiganya selamanya.

           Gejalanya di aplikasi:
             TypeError: Cannot read properties of undefined (reading 'depan')
           dan ia hanya muncul untuk sebagian data.

        2. Relasi yang disalin menjadi tidak sinkron

           Nama penulis disalin ke setiap artikel supaya tidak perlu
           menggabung. Penulis mengubah namanya. Sepuluh ribu artikel
           masih memuat nama lama.

           Diukur di sub-bab denormalisasi pada bab ini: penghitung
           yang tidak ikut diperbarui menyimpang dari 3 menjadi 2
           dalam satu operasi hapus.

        3. Transaksi yang dikira ada

           Dua penulisan ke dua dokumen berbeda, dan yang kedua gagal.
           Yang pertama TIDAK dibatalkan. Keadaannya setengah jadi,
           dan tidak ada yang memberi tahu.
        `,
      ),
      p(
        'Arah sebaliknya juga punya kegagalannya sendiri, yaitu memakai basis data relasional dengan cara yang membuang keunggulannya.',
      ),
      code(
        'text',
        `
        1. Skema tanpa satu pun constraint

           Kolom nullable semua, tanpa foreign key, tanpa CHECK,
           tanpa UNIQUE. Yang tersisa hanyalah tabel, dan seluruh
           penjagaan dikembalikan ke aplikasi.

           Diuji: tanpa PRIMARY KEY, pemulihan cadangan yang
           dijalankan dua kali melipatgandakan baris dari 1.000
           menjadi 2.000 TANPA satu pun error. Dengan primary key,
           ia gagal dan jumlahnya tetap.

        2. Seluruh data ditaruh di satu kolom JSON

           Foreign key tidak bisa menunjuk ke dalamnya, CHECK tidak
           bisa menjaganya, dan query yang memfilter isinya jauh
           lebih mahal daripada kolom bertipe.

        3. Menghindari JOIN karena "JOIN itu lambat"

           Diukur sungguhan pada PostgreSQL 16.15, tabel 200.000
           artikel dan 1.000.000 komentar:

             JOIN + subquery COUNT, 20 baris  : 0,963 ms
             JOIN + LEFT JOIN LATERAL         : 0,736 ms

           JOIN dengan indeks yang benar pada 20 baris memakan di
           bawah satu milidetik. Yang lambat bukan JOIN-nya,
           melainkan JOIN tanpa indeks, atau JOIN yang menyentuh
           jauh lebih banyak baris daripada yang dibutuhkan.
        `,
        {
          caption:
            'Menghindari JOIN dengan menyalin data berarti menukar biaya baca yang kecil dengan biaya konsistensi yang besar.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pilihan ini sering diambil berdasarkan apa yang sedang populer, dan akibatnya baru terasa satu atau dua tahun kemudian.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih berdasarkan performa yang dibaca di artikel',
            'Angkanya kan ada',
            'Keduanya berbeda pada apa yang DIJAMIN, bukan pada kecepatan. Ukur dengan data dan query-mu sendiri',
          ],
          [
            'Memilih tanpa skema karena bentuk datanya belum jelas',
            'Biar fleksibel',
            'Bebannya pindah ke setiap pembaca, selamanya. Tiga bentuk berbeda hidup berdampingan tanpa ada yang tahu',
          ],
          [
            'Menyalin data untuk menghindari JOIN',
            'JOIN kan lambat',
            'Diukur, JOIN berindeks pada 20 baris 0,736 ms. Yang disalin akan menyimpang',
          ],
          [
            'Memakai basis data relasional tanpa constraint',
            'Validasinya kan sudah di aplikasi',
            'Diuji, tanpa primary key pemulihan ganda melipatgandakan baris tanpa satu pun error',
          ],
          [
            'Menganggap dokumen selalu menskala lebih baik',
            'Katanya begitu',
            'Basis data relasional juga bisa di-shard. Yang berbeda adalah berapa banyak pekerjaannya',
          ],
          [
            'Memilih dua sekaligus untuk berjaga-jaga',
            'Ambil kelebihan keduanya',
            'Dua sistem berarti dua tempat yang bisa menyimpang, dan sinkronisasinya menjadi masalah tersendiri',
          ],
        ],
      ),
      p(
        'Untuk sebagian besar aplikasi yang baru dimulai, basis data relasional adalah pilihan yang lebih sulit disesali. Ia menjaga bentuk data sejak awal, menjawab pertanyaan yang belum terbayang tanpa menulis ulang apa pun, dan menskala jauh lebih tinggi daripada yang biasanya diperkirakan. Beralih darinya ketika suatu saat benar-benar diperlukan jauh lebih mudah daripada memulihkan konsistensi data yang sudah menyimpang selama dua tahun.',
      ),
      references(
        {
          label: 'PostgreSQL: JSON Types',
          href: 'https://www.postgresql.org/docs/current/datatype-json.html',
          source: 'PostgreSQL',
          note: 'Tipe JSONB beserta operator pencariannya, penutup sebagian besar alasan pindah ke dokumen.',
        },
        {
          label: 'PostgreSQL: Full Text Search',
          href: 'https://www.postgresql.org/docs/current/textsearch.html',
          source: 'PostgreSQL',
          note: 'Pencarian teks bawaan, sebelum menambah mesin pencari terpisah.',
        },
        {
          label: 'MongoDB: Data Modeling',
          href: 'https://www.mongodb.com/docs/manual/data-modeling/',
          source: 'MongoDB',
          note: 'Panduan resmi kapan menyematkan dan kapan merujuk pada model dokumen.',
        },
        {
          label: 'Cassandra: Data Modeling',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/data_modeling/index.html',
          source: 'Apache Cassandra',
          note: 'Alasan resmi kenapa pola pertanyaan harus diketahui sebelum tabelnya dirancang.',
        },
        {
          label: 'Redis: Data types',
          href: 'https://redis.io/docs/latest/develop/data-types/',
          source: 'Redis',
          note: 'Struktur yang tersedia di penyimpanan key-value, termasuk sorted set.',
        },
      ),
    ],
  ),

  written(
    'naik-kelas-atau-menambah-mesin',
    'Naik Kelas atau Menambah Mesin',
    19,
    'Kenapa memperbesar satu mesin hampir selalu dicoba lebih dulu, dan di mana batasnya.',
    [
      p(
        'Ada dua cara menambah kapasitas basis data, dan keduanya sangat berbeda ongkosnya. Cara pertama membuat satu mesin menjadi lebih besar. Cara kedua membagi pekerjaan ke banyak mesin. Cara pertama nyaris tidak menuntut apa pun dari kodemu, sedangkan cara kedua mengubah asumsi yang selama ini kamu andalkan tanpa sadar.',
      ),
      p(
        'Sub-bab ini membahas kapan cara pertama masih cukup, bagaimana mengetahui batasnya sedang didekati, dan apa saja yang bisa dikerjakan sebelum menyerah ke cara kedua.',
      ),

      terms(
        {
          term: 'vertical scaling (scale up)',
          meaning:
            'Menambah kapasitas dengan memperbesar satu mesin, yaitu menambah inti prosesor, memori, atau memakai disk yang lebih cepat. Tidak menuntut perubahan kode sama sekali, dan itulah keunggulan terbesarnya.',
        },
        {
          term: 'horizontal scaling (scale out)',
          meaning:
            'Menambah kapasitas dengan menambah jumlah mesin. Untuk pembacaan, bentuknya adalah replika. Untuk penulisan, bentuknya adalah sharding. Keduanya menuntut perubahan pada cara aplikasi berbicara dengan basis datanya.',
        },
        {
          term: 'connection pool',
          meaning:
            'Sekumpulan sambungan basis data yang dibuka sekali lalu dipakai bergantian oleh banyak permintaan. Dibaca "koneksyen pul". Tanpa kolam, tiap permintaan membuka sambungan baru, dan pembukaan sambungan jauh lebih mahal daripada query yang dijalankannya.',
        },
        {
          term: 'IOPS',
          meaning:
            'Jumlah operasi baca tulis disk per detik. Dibaca "ai-ops". Pada basis data, angka ini sering menjadi batas sesungguhnya, bukan prosesor. Disk jaringan pada layanan awan biasanya punya batas IOPS yang ditetapkan sesuai ukuran atau kelasnya.',
        },
        {
          term: 'buffer pool atau shared buffers',
          meaning:
            'Bagian memori yang dipakai basis data untuk menyimpan halaman data yang sedang aktif. Selama data yang dibutuhkan berada di sini, pembacaannya tidak menyentuh disk sama sekali. Inilah alasan menambah memori sering memberi hasil yang jauh lebih besar daripada menambah prosesor.',
        },
        {
          term: 'cache hit ratio database',
          meaning:
            'Persentase pembacaan yang bisa dilayani dari memori tanpa menyentuh disk. Nilai di atas 99 persen adalah tanda sehat pada beban baca. Nilai yang turun terus adalah tanda paling awal bahwa memorinya sudah tidak cukup untuk working set-nya.',
        },
        {
          term: 'bloat',
          meaning:
            'Ruang mati yang tertinggal di dalam tabel dan index karena baris yang diperbarui atau dihapus tidak langsung dilepas. Pada PostgreSQL, ruang itu dibersihkan proses `VACUUM`. Bloat yang dibiarkan membuat tabel jauh lebih besar daripada isinya, dan setiap pembacaan menjadi lebih mahal.',
        },
      ),

      h2('Kenapa vertikal dicoba lebih dulu'),
      table(
        ['', 'Naik kelas mesin', 'Menambah mesin'],
        [
          ['Perubahan kode', 'Tidak ada', 'Perlu, dan bisa besar'],
          ['Transaksi lintas data', 'Tetap seperti biasa', 'Menjadi sulit atau mustahil'],
          ['`JOIN`', 'Tetap seperti biasa', 'Terbatas pada satu bagian'],
          ['Batasan `UNIQUE`', 'Tetap ditegakkan', 'Tidak bisa lintas bagian'],
          ['Beban operasional', 'Nyaris tidak bertambah', 'Bertambah banyak'],
          ['Waktu penerapan', 'Jam, kadang menit', 'Minggu sampai bulan'],
          ['Batas atas', 'Ada, dan cukup tinggi', 'Praktis tidak ada'],
          ['Titik kegagalan', 'Masih satu', 'Bisa dikurangi'],
        ],
      ),
      p(
        'Empat baris pertama adalah alasan sesungguhnya. Naik kelas mesin tidak mengambil apa pun darimu, sedangkan menambah mesin mengambil transaksi, join, dan batasan basis data sekaligus. Ketiganya adalah hal yang selama ini kamu andalkan tanpa memikirkannya, dan kehilangan mereka berarti memindahkan tanggung jawabnya ke kode aplikasi.',
      ),

      h2('Mengetahui batasan mana yang sedang tercapai'),
      p(
        'Sebelum menambah apa pun, cari tahu sumber daya mana yang benar-benar habis. Menambah prosesor pada sistem yang sebenarnya kehabisan memori tidak akan mengubah apa pun.',
      ),
      table(
        ['Gejala', 'Yang habis', 'Jawaban yang tepat'],
        [
          [
            'Prosesor tinggi, disk santai',
            'Prosesor',
            'Query berat atau tanpa index, atau memang perlu inti lebih banyak',
          ],
          ['Rasio hit cache turun', 'Memori', 'Tambah memori, karena working set sudah tidak muat'],
          [
            'Waktu tunggu disk tinggi',
            'IOPS',
            'Disk lebih cepat, atau kurangi pembacaan lewat index dan cache',
          ],
          [
            'Sambungan sering penuh',
            'Connection pool',
            'Pooler seperti PgBouncer, bukan mesin lebih besar',
          ],
          [
            'Penguncian sering menunggu',
            'Perebutan kunci',
            'Perpendek transaksi, bukan tambah mesin',
          ],
          ['Tabel jauh lebih besar dari isinya', 'Bloat', 'Setel autovacuum, bukan tambah disk'],
        ],
      ),
      p(
        'Empat baris terakhir layak diperhatikan karena keempatnya **tidak** diselesaikan dengan mesin yang lebih besar. Ini kesalahan yang mahal dan sering terjadi, yaitu membayar mesin dua kali lipat untuk masalah yang sebenarnya berasal dari transaksi yang terlalu panjang atau autovacuum yang tidak pernah disetel.',
      ),
      code(
        'sql',
        `
        -- Rasio hit cache. Di bawah 0,99 pada beban baca berarti memori mulai kurang.
        SELECT
          sum(heap_blks_hit) AS dari_memori,
          sum(heap_blks_read) AS dari_disk,
          round(
            sum(heap_blks_hit)::numeric / nullif(sum(heap_blks_hit) + sum(heap_blks_read), 0),
            4
          ) AS rasio_hit
        FROM pg_statio_user_tables;

        -- Query yang paling banyak memakan waktu total, bukan yang paling lambat sekali jalan.
        SELECT
          calls,
          round(total_exec_time::numeric, 0) AS total_ms,
          round(mean_exec_time::numeric, 2) AS rata_ms,
          left(query, 80) AS potongan
        FROM pg_stat_statements
        ORDER BY total_exec_time DESC
        LIMIT 10;

        -- Sambungan yang sedang menunggu sesuatu.
        SELECT wait_event_type, wait_event, count(*)
        FROM pg_stat_activity
        WHERE wait_event IS NOT NULL
        GROUP BY 1, 2
        ORDER BY 3 DESC;
        `,
        {
          caption:
            'Query kedua sering mengejutkan: yang paling membebani biasanya query cepat yang dijalankan jutaan kali.',
        },
      ),
      callout(
        'tip',
        'Urutkan berdasarkan waktu total, bukan waktu rata-rata',
        'Query yang memakan dua detik dan dijalankan sepuluh kali sehari memakan dua puluh detik. Query yang memakan lima milidetik dan dijalankan sepuluh juta kali memakan empat belas jam. Yang kedua jauh lebih layak diperbaiki, dan yang kedua pula yang tidak pernah muncul di daftar query paling lambat.',
      ),

      h2('Yang bisa dikerjakan sebelum menambah mesin'),
      p(
        'Sebagian besar sistem yang terasa mentok sebenarnya belum kehabisan kapasitas, melainkan sedang memakainya dengan boros. Enam pekerjaan berikut hampir selalu memberi hasil yang lebih besar daripada menambah mesin, dan semuanya jauh lebih murah.',
      ),
      ol(
        '**Perbaiki query yang tidak memakai index.** Satu index yang tepat bisa mengubah beban sepuluh kali lipat, dan caranya sudah dibahas di sub-bab [key dan index](/kelas/backend-basic/database-sql-dasar/key-index).',
        '**Hilangkan masalah N+1.** Seratus query kecil per permintaan menjadi seribu query per detik pada sepuluh permintaan per detik.',
        '**Pasang connection pool yang benar.** Tanpa pooler, tiap proses aplikasi membuka sambungannya sendiri dan jumlahnya cepat melewati batas.',
        '**Pindahkan pembacaan panas ke cache.** Ini blok yang dibahas di sub-bab [lapisan cache](/kelas/system-design/blok-penyusun/lapisan-cache).',
        '**Perpendek transaksi.** Transaksi yang menunggu panggilan jaringan di dalamnya menahan kunci jauh lebih lama daripada perlunya.',
        '**Setel autovacuum.** Tabel yang membengkak membuat setiap pembacaan lebih mahal tanpa alasan.',
      ),
      code(
        'text',
        `
        # PgBouncer dalam mode transaksi, bentuk yang paling hemat sambungan.
        [databases]
        aplikasi = host=10.0.3.10 port=5432 dbname=aplikasi

        [pgbouncer]
        listen_port = 6432
        pool_mode = transaction
        max_client_conn = 2000
        default_pool_size = 40
        `,
        {
          filename: 'pgbouncer.ini',
          caption:
            'Dua ribu sambungan dari aplikasi dilayani empat puluh sambungan nyata ke basis data.',
        },
      ),
      p(
        'Angka pada contoh itu bukan keajaiban. Ia bekerja karena sebagian besar sambungan dari aplikasi sebenarnya menganggur, yaitu sedang menunggu pekerjaan lain di dalam permintaan yang sama. Mode transaksi mengembalikan sambungan ke kolam segera setelah transaksinya selesai, sehingga satu sambungan nyata bisa melayani banyak sambungan aplikasi bergantian.',
      ),
      callout(
        'warning',
        'Mode transaksi melarang beberapa hal yang mungkin dipakai kodemu',
        'Karena sambungan nyata berpindah-pindah antar klien, apa pun yang bergantung pada satu sambungan yang sama tidak bisa dipakai, yaitu prepared statement bernama, `LISTEN` dan `NOTIFY`, serta tabel sementara. Sebagian library basis data punya pengaturan untuk mematikan prepared statement, dan itu harus diaktifkan sebelum memasang pooler dalam mode ini.',
      ),

      h2('Di mana batas vertikalnya'),
      p(
        'Ada dua batas yang berbeda dan keduanya perlu dibedakan, yaitu batas teknis dan batas ekonomis.',
      ),
      table(
        ['Batas', 'Bentuknya', 'Kapan tercapai'],
        [
          [
            'Ukuran mesin terbesar',
            'Penyedia awan punya kelas terbesar',
            'Sangat jarang tercapai aplikasi biasa',
          ],
          [
            'Harga yang tidak masuk akal',
            'Harga naik lebih cepat daripada kapasitas',
            'Jauh lebih dulu daripada batas teknis',
          ],
          [
            'Waktu mati saat naik kelas',
            'Biasanya butuh restart',
            'Menjadi masalah pada SLO yang ketat',
          ],
          [
            'Tetap satu titik kegagalan',
            'Mesin sebesar apa pun tetap bisa mati',
            'Menjadi masalah begitu ketersediaan dijanjikan',
          ],
        ],
      ),
      p(
        'Baris keempat sering menjadi pemicu sesungguhnya, dan pemicu itu bukan soal kapasitas sama sekali. Banyak tim menambah replika bukan karena bacanya terlalu banyak, melainkan karena mereka butuh sesuatu yang bisa mengambil alih ketika mesin utamanya mati. Itu alasan yang sah, dan alasan itu mengubah pertanyaannya dari penskalaan menjadi ketersediaan.',
      ),

      h2('Urutan yang benar'),
      steps(
        {
          title: 'Ukur dulu, cari yang benar-benar habis',
          body: 'Pakai query pada sub-bab ini. Menambah sumber daya yang salah tidak mengubah apa pun selain tagihan.',
        },
        {
          title: 'Perbaiki query dan index',
          body: 'Termurah, dan hampir selalu masih ada yang bisa diperbaiki.',
        },
        {
          title: 'Pasang pooler dan cache',
          body: 'Keduanya mengurangi beban tanpa menyentuh bentuk data.',
        },
        {
          title: 'Naikkan kelas mesinnya',
          body: 'Nol perubahan kode. Lakukan sampai harganya tidak lagi masuk akal.',
        },
        {
          title: 'Tambahkan replika baca',
          body: 'Untuk kapasitas baca dan untuk cadangan sekaligus. Dibahas di sub-bab berikutnya.',
        },
        {
          title: 'Baru pertimbangkan sharding',
          body: 'Hanya ketika penulisannya sendiri yang tidak muat di satu mesin.',
        },
      ),
      p(
        'Sebagian besar sistem berhenti di langkah keempat atau kelima, dan berhenti di sana bukan kekurangan. Sharding adalah jawaban untuk masalah yang sangat khusus, yaitu laju penulisan atau ukuran data yang melampaui satu mesin, dan sebagian besar aplikasi tidak pernah mencapainya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Naik kelas berarti memberi satu mesin lebih banyak sumber daya, dan menambah mesin berarti membagi pekerjaan ke beberapa mesin. Yang pertama hampir selalu lebih murah daripada yang dikira, dan yang kedua hampir selalu lebih mahal.',
      ),
      code(
        'text',
        `
        Yang berubah saat naik kelas:
          satu angka di konfigurasi, satu restart

        Yang berubah saat menambah mesin, diukur di bab lain pada
        project yang sama:

          sesi di memori proses    -> pengguna keluar secara acak
          berkas di disk lokal     -> kadang tidak ditemukan
          job berkala              -> berjalan beberapa kali
          pembatasan laju          -> batasnya berlipat
          cache di memori          -> tidak pernah kena
          IP dan protokol          -> terbaca sebagai proxy dan http,
                                      sehingga cookie Secure tidak
                                      pernah terpasang

        Enam perubahan kode, dan tidak satu pun terlihat sebagai
        "pekerjaan penskalaan" di awal.
        `,
        {
          caption:
            'Itulah biaya sesungguhnya menambah mesin, dan ia dibayar sekali lalu dijaga selamanya.',
        },
      ),
      p(
        'Karena itu urutan yang hampir selalu benar dimulai dari yang paling murah, dan sebagian besar sistem berhenti di langkah pertama.',
      ),
      code(
        'text',
        `
        LANGKAH 0 — perbaiki pekerjaannya

        Diukur sungguhan pada PostgreSQL 16.15:
          agregasi GROUP BY 1.000.000 baris    468,922 ms
          dibaca dari kolom denormalisasi        0,068 ms

        Diukur di bab Desain API pada node:sqlite 200.000 baris:
          paginasi OFFSET di halaman jauh         1,51 ms
          keyset pagination                       0,01 ms

        Keduanya tanpa satu pun mesin tambahan.

        LANGKAH 1 — naik kelas
          Lebih banyak RAM sering yang paling berpengaruh, sebab ia
          membuat lebih banyak data muat di cache basis data.

        LANGKAH 2 — pisahkan peran
          Basis data pindah ke mesinnya sendiri. Pekerja antrean
          pindah ke mesinnya sendiri.

        LANGKAH 3 — tambah mesin untuk lapisan aplikasi
          Di sinilah enam perubahan di atas harus sudah selesai.

        LANGKAH 4 — replika baca, lalu sharding
        `,
      ),
      p('Batas naik kelas memang ada, dan mengenali bentuknya mencegah menunggu terlalu lama.'),
      code(
        'text',
        `
        Tanda bahwa naik kelas sudah tidak menolong:

          - menggandakan CPU hanya memperbaiki 10%
            -> penghambatnya bukan CPU
          - basis data sudah memakai mesin terbesar yang ditawarkan
          - satu tabel terlalu besar untuk muat di memori mana pun
          - kebutuhannya bukan kapasitas melainkan KETERSEDIAAN:
            satu mesin, sebesar apa pun, tetap satu titik kegagalan

        Baris terakhir itu yang paling sering menjadi alasan sungguhan
        untuk menambah mesin. Dihitung:
          1 salinan @ 99% -> 99,0000%
          2 salinan @ 99% -> 99,9900%
          3 salinan @ 99% -> 99,9999%
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan yang paling mahal di area ini adalah menambah mesin untuk masalah yang bukan masalah kapasitas.',
      ),
      code(
        'text',
        `
        Contoh nyata dari project ini, diukur sungguhan:

        Gejala : npm run build gagal, beberapa halaman melewati
                 batas 60 detik, termasuk yang tidak diubah.
        Dugaan : bebannya terlalu besar untuk mesin ini.
        Solusi yang terbayang: mesin yang lebih besar.

        Yang diukur:
          penyorotan kode seluruh 427 halaman : 5.785 ms total
          rata-rata per halaman               :    14 ms
          halaman yang GAGAL                  :    30 ms
          satu halaman yang gagal tidak punya blok kode sama sekali

          CPU 4, swap 0, memori tersisa ~1,1 GB
          Next menjalankan 3 worker, ditambah basis data, peramban,
          dan editor yang sudah berjalan
          load average saat gagal: 12,84 pada mesin 4 CPU

        Satu perubahan, satu variabel:
          CIRCLE_NODE_TOTAL=2 npm run build -> EXIT=0, 15,9 detik

        Yang dibutuhkan bukan mesin lebih besar, melainkan pekerjaan
        yang lebih sedikit berjalan bersamaan.
        `,
        {
          caption: 'Menambah sumber daya untuk masalah pertentangan sering justru memperburuknya.',
        },
      ),
      p(
        'Kesalahan kedua muncul setelah mesin ditambah, dan bentuknya adalah penghambat yang hanya berpindah.',
      ),
      code(
        'text',
        `
        Sepuluh instance aplikasi di depan SATU basis data.

          error: sorry, too many clients already
          Error: Timeout acquiring a connection from the pool

        Diukur aritmetikanya:
          10 instance x pool 10 = 100 koneksi
          + 4 pekerja antrean x pool 5 = 20
          = 120, sementara paket basis datanya mengizinkan 60

        Menambah instance aplikasi tidak menambah kapasitas basis
        data. Ia menambah tekanan padanya.

        Dan bila penghambatnya memang basis data, menambah instance
        aplikasi membuat keadaannya LEBIH BURUK, bukan lebih baik.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN KETIGA: menambah mesin tanpa menghitung akibatnya
        pada ketersediaan.

        Dihitung sungguhan, komponen BERANTAI yang semuanya harus hidup:

           1 komponen @ 99,9% -> 99,9000%   (  8,8 jam/tahun)
           5 komponen @ 99,9% -> 99,5010%   ( 43,7 jam/tahun)
          10 komponen @ 99,9% -> 99,0045%   ( 87,2 jam/tahun)
          30 komponen @ 99,9% -> 97,0431%   (259,0 jam/tahun)

        Menambah komponen menambah kapasitas DAN menambah tempat
        yang bisa mati. Keduanya harus dihitung bersamaan.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Menambah mesin terdengar seperti kemajuan, dan sering merupakan cara paling mahal menyelesaikan masalah yang lebih murah diselesaikan dengan cara lain.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah mesin sebelum mengukur di mana waktunya habis',
            'Sistemnya kan melambat',
            'Diukur, satu perubahan query mengubah 468,9 ms menjadi 0,068 ms tanpa mesin tambahan',
          ],
          [
            'Menganggap naik kelas selalu punya batas dekat',
            'Katanya tidak bisa menskala',
            'Mesin modern sangat besar. Sebagian besar aplikasi tidak pernah mendekati batasnya',
          ],
          [
            'Menambah instance aplikasi saat basis datanya yang penuh',
            'Menambah kapasitas kan selalu menolong',
            'Dihitung, 10 instance x pool 10 = 100 koneksi terhadap batas 60. Tekanannya bertambah',
          ],
          [
            'Menambah sumber daya saat masalahnya pertentangan',
            'Mesinnya kan kurang kuat',
            'Diukur pada project ini, mengurangi worker dari 3 menjadi 2 yang menyelesaikannya',
          ],
          [
            'Menambah mesin tanpa menyiapkan aplikasinya',
            'Tinggal dijalankan lebih banyak',
            'Enam kelas bug muncul bersamaan: sesi, berkas, job, pembatasan laju, cache, dan header teruskan',
          ],
          [
            'Tidak menghitung akibatnya pada ketersediaan',
            'Lebih banyak mesin kan lebih tangguh',
            'Dihitung, 10 komponen berantai @ 99,9% menghasilkan 99,0045%, yaitu 87,2 jam per tahun',
          ],
        ],
      ),
      p(
        'Satu pertanyaan memisahkan dua jalur itu dengan cukup tepat, dan ia bukan pertanyaan tentang beban. Apakah yang kamu butuhkan lebih banyak kapasitas, atau lebih sedikit titik kegagalan tunggal? Bila jawabannya kapasitas, naik kelas hampir selalu lebih murah sampai batasnya benar-benar tercapai. Bila jawabannya ketersediaan, tidak ada mesin sebesar apa pun yang bisa menggantikan dua mesin, dan pekerjaan menyiapkan aplikasinya harus dimulai sekarang.',
      ),
      references(
        {
          label: 'PostgreSQL: Resource Consumption',
          href: 'https://www.postgresql.org/docs/current/runtime-config-resource.html',
          source: 'PostgreSQL',
          note: 'Pengaturan memori termasuk `shared_buffers` dan `work_mem`.',
        },
        {
          label: 'PostgreSQL: The Statistics Collector',
          href: 'https://www.postgresql.org/docs/current/monitoring-stats.html',
          source: 'PostgreSQL',
          note: 'Tabel statistik yang dipakai pada query pemeriksaan di sub-bab ini.',
        },
        {
          label: 'PostgreSQL: Routine Vacuuming',
          href: 'https://www.postgresql.org/docs/current/routine-vacuuming.html',
          source: 'PostgreSQL',
          note: 'Cara kerja autovacuum dan akibat bloat bila tidak disetel.',
        },
        {
          label: 'PostgreSQL: pg_stat_statements',
          href: 'https://www.postgresql.org/docs/current/pgstatstatements.html',
          source: 'PostgreSQL',
          note: 'Ekstensi yang mencatat waktu total per bentuk query.',
        },
      ),
    ],
  ),
  written(
    'replikasi',
    'Replikasi dan Replika Baca',
    20,
    'Menambah kapasitas baca dan cadangan sekaligus, dengan harga bernama keterlambatan.',
    [
      p(
        'Replikasi adalah langkah pertama yang benar-benar membuat data hidup di lebih dari satu mesin. Ia menyelesaikan dua masalah sekaligus, yaitu kapasitas baca dan ketiadaan cadangan, dan ia memperkenalkan satu masalah baru yang tidak pernah ada sebelumnya, yaitu dua mesin bisa punya jawaban yang berbeda untuk pertanyaan yang sama.',
      ),
      p(
        'Masalah baru itu bukan bug melainkan sifat, dan seluruh sub-bab ini pada dasarnya membahas cara hidup dengannya.',
      ),

      terms(
        {
          term: 'leader dan follower',
          meaning:
            'Leader adalah salinan yang menerima seluruh penulisan, sedangkan follower adalah salinan yang menyalin perubahan dari leader dan hanya melayani pembacaan. Istilah lama untuk keduanya adalah master dan slave, dan istilah baru lebih disukai sekarang. Ada juga sebutan primary dan replica yang berarti sama.',
        },
        {
          term: 'WAL (write-ahead log)',
          meaning:
            'Catatan berurutan berisi setiap perubahan sebelum perubahan itu diterapkan ke berkas data. Dibaca "wal" atau dieja. Selain menjadi dasar pemulihan setelah mati mendadak, WAL adalah aliran yang dikirim ke follower, sehingga replikasi pada dasarnya adalah pengiriman WAL.',
        },
        {
          term: 'replication lag',
          meaning:
            'Selisih waktu antara sebuah perubahan diterapkan di leader dan diterapkan di follower. Biasanya beberapa milidetik, dan bisa melonjak menjadi detik atau menit ketika ada penulisan besar atau jaringan tersendat. Angka ini wajib dipantau, karena hampir semua kejutan pada sistem berreplika berasal darinya.',
        },
        {
          term: 'replikasi asynchronous dan synchronous',
          meaning:
            'Asinkron berarti leader menjawab sukses segera setelah menulis di dirinya sendiri, tanpa menunggu follower. Sinkron berarti leader menunggu setidaknya satu follower mengonfirmasi sebelum menjawab. Asinkron lebih cepat dan bisa kehilangan penulisan terakhir bila leader mati, sinkron sebaliknya.',
        },
        {
          term: 'read-your-writes',
          meaning:
            'Jaminan bahwa seorang pengguna selalu melihat hasil penulisannya sendiri. Ini jaminan yang paling terasa bila hilang, karena pengguna yang menyimpan perubahan lalu tidak melihatnya akan menganggap fiturnya rusak.',
        },
        {
          term: 'promotion',
          meaning:
            'Mengangkat sebuah follower menjadi leader baru, biasanya karena leader lama mati. Perpindahan ini tidak sederhana, karena harus dipastikan hanya ada satu leader pada satu waktu dan follower lain harus diarahkan ke leader yang baru.',
        },
        {
          term: 'split-brain',
          meaning:
            'Keadaan ketika dua mesin sama-sama menganggap dirinya leader, biasanya karena jaringan terputus di tengah dan keduanya tidak bisa saling melihat. Dibaca "split-brein". Akibatnya penulisan masuk ke dua tempat berbeda dan datanya menjadi bercabang, dan menyatukannya kembali hampir selalu berarti kehilangan sebagian.',
        },
        {
          term: 'multi-leader',
          meaning:
            'Susunan dengan lebih dari satu salinan yang menerima penulisan, biasanya satu per wilayah geografis. Menyelesaikan latensi tulis bagi pengguna yang jauh, dan menciptakan masalah konflik tulis yang harus diselesaikan aplikasi.',
        },
      ),

      h2('Bentuk yang paling umum'),
      code(
        'text',
        `
        TULIS                    BACA
          |                        |
          v                        v
        +--------+  WAL   +-------------+
        | LEADER | -----> | FOLLOWER 1  |
        |        | -----> | FOLLOWER 2  |
        +--------+        +-------------+

        Semua tulis ke leader. Baca boleh ke leader maupun follower.
        `,
      ),
      p('Susunan sesederhana ini sudah memberi tiga hal sekaligus.'),
      ul(
        '**Kapasitas baca bertambah** sebanyak jumlah follower yang ditambahkan',
        '**Ada cadangan** yang bisa diangkat menjadi leader bila leader lama mati',
        '**Pekerjaan berat bisa dipisahkan**, misalnya laporan dan pencadangan dijalankan di follower agar tidak mengganggu lalu lintas utama',
      ),
      p(
        'Yang **tidak** ia berikan adalah kapasitas tulis. Seluruh penulisan tetap melewati satu mesin, jadi replikasi tidak membantu sama sekali bila yang mentok adalah penulisannya. Untuk itu jawabannya sharding, dan itu dua sub-bab lagi.',
      ),

      h2('Keterlambatan, dan bentuk konkretnya'),
      p(
        'Karena penyalinan butuh waktu, ada jendela ketika leader sudah punya data baru dan follower belum. Jendela itu biasanya sangat pendek, dan justru karena pendek ia sering lolos dari pengujian dan baru muncul di produksi.',
      ),
      code(
        'text',
        `
        Waktu   Kejadian
        0 ms    Pengguna mengirim komentar. Aplikasi menulis ke LEADER. Sukses.
        5 ms    Aplikasi menjawab 201. Halaman dimuat ulang.
        7 ms    Permintaan baca mendarat di FOLLOWER 2.
        7 ms    FOLLOWER 2 belum menerima komentar itu.
                Pengguna melihat halaman TANPA komentarnya sendiri.
       40 ms    FOLLOWER 2 menerima perubahannya. Sudah terlambat.
        `,
      ),
      p(
        'Bagi pengguna, yang terjadi adalah komentarnya hilang. Ia akan mengirim ulang, dan sekarang ada dua komentar. Kelas kesalahan ini adalah yang paling sering muncul ketika sebuah aplikasi baru dipasangi replika baca.',
      ),
      p('Ada empat cara menanganinya, dengan tingkat ketepatan dan biaya yang berbeda.'),
      table(
        ['Cara', 'Bagaimana', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Baca dari leader sesudah menulis',
            'Selama beberapa detik sesudah menulis, arahkan pembacaan pengguna itu ke leader',
            'Sederhana dan efektif',
            'Sebagian beban baca kembali ke leader',
          ],
          [
            'Pakai hasil respons',
            'Tulis lalu kembalikan datanya, antarmuka memakai itu tanpa membaca ulang',
            'Nol pembacaan tambahan',
            'Hanya bekerja untuk tampilan yang datanya memang itu',
          ],
          [
            'Tunggu posisi WAL',
            'Catat posisi WAL sesudah menulis, dan hanya baca dari follower yang sudah melewatinya',
            'Tepat',
            'Perlu dukungan library dan menambah kerumitan',
          ],
          [
            'Terima saja',
            'Biarkan basi untuk data yang memang tidak menuntut kesegaran',
            'Gratis',
            'Hanya untuk data yang tidak dilihat penulisnya seketika',
          ],
        ],
      ),
      code(
        'js',
        `
        const JENDELA_LENGKET_MS = 5_000;

        // Setelah menulis, tandai pengguna ini agar membaca dari leader sebentar.
        async function tandaiBaruMenulis(penggunaId) {
          await redis.set('baru-tulis:' + penggunaId, '1', 'PX', JENDELA_LENGKET_MS);
        }

        async function pilihSambungan(penggunaId) {
          if (penggunaId === undefined) return dbReplika;
          const baruMenulis = await redis.get('baru-tulis:' + penggunaId);
          return baruMenulis === '1' ? dbLeader : dbReplika;
        }

        // Penulisan selalu ke leader, dan menandai penggunanya.
        app.post('/api/komentar', async (req, res) => {
          const { isi } = SkemaKomentar.parse(req.body);
          const penggunaId = req.session.penggunaId;

          const komentar = await dbLeader.komentar.buat({ isi, penulisId: penggunaId });
          await tandaiBaruMenulis(penggunaId);

          res.status(201).json(komentar);
        });

        // Pembacaan memilih sambungan sesuai penanda itu.
        app.get('/api/tulisan/:slug/komentar', async (req, res) => {
          const db = await pilihSambungan(req.session.penggunaId);
          res.json(await db.komentar.untukTulisan(req.params.slug));
        });
        `,
        {
          caption:
            'Lima detik cukup untuk hampir semua keterlambatan, dan hanya pengguna yang baru menulis yang membebani leader.',
        },
      ),
      callout(
        'warning',
        'Jangan mengarahkan seluruh lalu lintas pengguna yang login ke leader',
        'Jalan pintas yang menggoda adalah menyatakan bahwa semua pengguna yang login membaca dari leader. Pada aplikasi yang sebagian besar penggunanya login, itu berarti replikanya tidak melayani apa-apa dan kamu membayar mesin yang menganggur. Batasi jendela lengket pada beberapa detik sesudah penulisan, dan hanya untuk pengguna yang benar-benar baru menulis.',
      ),

      h2('Asinkron atau sinkron'),
      table(
        ['', 'Asinkron', 'Sinkron'],
        [
          [
            'Kapan leader menjawab sukses',
            'Segera setelah menulis di dirinya',
            'Sesudah follower mengonfirmasi',
          ],
          ['Latensi tulis', 'Rendah', 'Naik sebesar perjalanan ke follower'],
          ['Bila leader mati mendadak', 'Penulisan terakhir bisa hilang', 'Tidak hilang'],
          ['Bila follower lambat', 'Tidak berpengaruh', 'Penulisan ikut melambat'],
          ['Bila follower mati', 'Tidak berpengaruh', 'Penulisan bisa berhenti total'],
        ],
      ),
      p(
        'Dua baris terakhir adalah alasan replikasi sinkron penuh jarang dipakai, karena ia mengubah follower dari cadangan menjadi ketergantungan. PostgreSQL menyediakan jalan tengah yang biasanya paling tepat, yaitu meminta konfirmasi dari **sebagian** follower saja.',
      ),
      code(
        'text',
        `
        # Tunggu konfirmasi dari salah satu di antara tiga follower.
        # Bila satu follower mati, dua lainnya masih bisa mengonfirmasi.
        synchronous_standby_names = 'ANY 1 (follower1, follower2, follower3)'
        synchronous_commit = on
        `,
        {
          filename: 'postgresql.conf',
          caption:
            'Kata ANY 1 itulah yang menjaga penulisan tetap jalan ketika satu follower bermasalah.',
        },
      ),
      p(
        'Pilihan yang wajar untuk sebagian besar aplikasi adalah asinkron, dengan pemantauan keterlambatan yang ketat. Kalau kehilangan beberapa penulisan terakhir benar-benar tidak bisa diterima, misalnya pada data pembayaran, barulah bentuk sinkron sebagian menjadi sepadan dengan tambahan latensinya.',
      ),

      h2('Memantau keterlambatan'),
      code(
        'sql',
        `
        -- Dijalankan di LEADER: melihat sejauh mana tiap follower tertinggal.
        SELECT
          application_name,
          state,
          sync_state,
          pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS tertinggal_bita,
          replay_lag
        FROM pg_stat_replication;

        -- Dijalankan di FOLLOWER: berapa detik data yang dilihatnya tertinggal.
        SELECT
          CASE
            WHEN pg_last_wal_receive_lsn() = pg_last_wal_replay_lsn() THEN 0
            ELSE extract(epoch FROM now() - pg_last_xact_replay_timestamp())
          END AS tertinggal_detik;
        `,
      ),
      table(
        ['Keterlambatan', 'Artinya', 'Tindakan'],
        [
          ['Di bawah 100 ms', 'Sehat', 'Tidak ada'],
          [
            '100 ms sampai 1 detik',
            'Wajar saat penulisan besar',
            'Pantau, dan periksa apakah ada pekerjaan borongan',
          ],
          [
            '1 sampai 10 detik',
            'Mulai terasa pengguna',
            'Cari penulisan besar, atau query panjang di follower yang menahan penerapan',
          ],
          [
            'Di atas 10 detik',
            'Tidak layak melayani baca',
            'Keluarkan follower itu dari daftar sampai ia mengejar',
          ],
        ],
      ),
      p(
        'Baris ketiga menyebut penyebab yang sering tidak terduga, yaitu query panjang di follower itu sendiri. Sebuah laporan yang berjalan sepuluh menit di follower bisa menahan penerapan WAL, karena penerapan itu akan mengubah baris yang sedang dibaca laporan tersebut. Akibatnya follower semakin tertinggal justru karena dipakai, dan inilah alasan pekerjaan analitik yang berat sebaiknya diberi follower tersendiri.',
      ),

      h2('Ketika leader mati'),
      p(
        'Manfaat kedua replikasi adalah cadangan, dan manfaat itu hanya nyata bila perpindahannya benar-benar bisa dilakukan. Perpindahan yang tidak pernah diuji hampir selalu gagal saat pertama kali dibutuhkan.',
      ),
      steps(
        {
          title: 'Deteksi',
          body: 'Sesuatu harus memutuskan leader benar-benar mati, bukan sekadar lambat atau terputus sesaat. Salah menilai di sini menghasilkan split-brain.',
        },
        {
          title: 'Pilih follower yang paling maju',
          body: 'Follower yang paling sedikit tertinggal dipilih agar kehilangan datanya paling kecil.',
        },
        {
          title: 'Angkat menjadi leader',
          body: 'Follower itu berhenti menyalin dan mulai menerima penulisan.',
        },
        {
          title: 'Arahkan ulang semuanya',
          body: 'Follower lain diarahkan ke leader baru, dan aplikasi harus tahu alamat leader yang baru.',
        },
        {
          title: 'Pastikan leader lama tidak kembali menerima tulis',
          body: 'Kalau leader lama hidup lagi dan mengira dirinya masih leader, penulisan akan bercabang. Mekanisme yang mencegahnya sering disebut fencing.',
        },
      ),
      callout(
        'danger',
        'Split-brain adalah kegagalan yang paling mahal pada susunan berreplika',
        'Ketika dua mesin sama-sama menerima penulisan, tidak ada cara otomatis menggabungkannya kembali tanpa kehilangan sebagian. Karena itu perpindahan otomatis selalu memerlukan kesepakatan mayoritas, dan karena itu pula jumlah anggota yang ganjil lebih disukai. Perkakas seperti Patroni menangani seluruh urusan ini, dan menuliskannya sendiri jauh lebih sulit daripada yang terlihat.',
      ),
      p(
        'Bagi aplikasi, langkah keempat berarti alamat basis data tidak boleh ditulis mati di konfigurasi satu per satu. Yang lazim dipakai adalah satu alamat perantara yang selalu menunjuk leader yang sedang aktif, misalnya lewat pooler atau lewat catatan DNS internal yang diperbarui saat perpindahan.',
      ),

      h2('Multi-leader, dan kapan ia benar-benar dibutuhkan'),
      p(
        'Sampai sini semua penulisan menuju satu tempat. Multi-leader mengizinkan beberapa tempat menerima penulisan, dan ia biasanya dipakai ketika penggunanya tersebar di beberapa benua.',
      ),
      code(
        'text',
        `
        Pengguna Asia   -> LEADER Asia   <--replikasi dua arah-->  LEADER Eropa <- Pengguna Eropa

        Menulis dari Jakarta ke leader di Jakarta   : sekitar 5 ms
        Menulis dari Jakarta ke leader di Frankfurt : sekitar 160 ms
        `,
      ),
      p(
        'Manfaatnya jelas dan masalahnya juga jelas, yaitu **konflik tulis**. Dua orang bisa mengubah baris yang sama pada dua leader berbeda dalam waktu yang sangat berdekatan, dan ketika keduanya saling menyalin, tidak ada jawaban yang benar secara otomatis.',
      ),
      table(
        ['Cara menyelesaikan konflik', 'Bagaimana', 'Harganya'],
        [
          [
            'Tulisan terakhir menang',
            'Bandingkan stempel waktu, yang lebih baru menang',
            'Perubahan yang kalah hilang tanpa jejak',
          ],
          [
            'Penggabungan di aplikasi',
            'Kode menentukan cara menggabungkan',
            'Benar, tetapi harus ditulis per jenis data',
          ],
          [
            'Struktur bebas konflik',
            'Pakai tipe data yang penggabungannya selalu terdefinisi',
            'Hanya tersedia untuk sebagian bentuk data',
          ],
          [
            'Menghindari konflik',
            'Arahkan data yang sama selalu ke leader yang sama',
            'Sederhana, dan membatasi manfaat multi-leader',
          ],
        ],
      ),
      p(
        'Untuk sebagian besar aplikasi, jawaban yang tepat adalah **tidak memakai multi-leader**. Satu leader dengan follower di beberapa wilayah sudah memberi pembacaan yang cepat di mana-mana, dan penulisan yang lebih lambat bagi pengguna jauh biasanya masih jauh lebih baik daripada menghadapi konflik tulis.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Replika baca terlihat seperti keuntungan tanpa biaya, yaitu kapasitas baca bertambah tanpa mengubah kode. Biayanya nyata, dan bentuknya adalah satu jaminan yang tadinya gratis.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan dengan PostgreSQL 16.15 dan replika
        streaming yang benar-benar berjalan (pg_basebackup -R -X stream).

        Yang bekerja sebagaimana mestinya:

          replika menolak penulisan:
            ERROR: cannot execute INSERT in a read-only transaction

          status replikasi di primary:
            state=streaming, sync_state=async
        `,
      ),
      p(
        'Lalu bagian yang menentukan. Read-after-write diuji dua kali, dalam keadaan yang berbeda, dan hasilnya berlawanan.',
      ),
      code(
        'text',
        `
        SAAT SISTEM SEDANG DIAM:

          tulis id=2001 -> baca dari replika seketika -> "Uji 1"
          tulis id=2002 -> baca dari replika seketika -> "Uji 2"
          tulis id=2003 -> baca dari replika seketika -> "Uji 3"
          tulis id=2004 -> baca dari replika seketika -> "Uji 4"
          tulis id=2005 -> baca dari replika seketika -> "Uji 5"

          5 dari 5 BERHASIL.

        SAAT ADA BEBAN TULIS BESAR (600.000 baris disisipkan):

          id=2006 -> replika: BELUM ADA   (replika tertinggal 11 MB)
          id=2007 -> replika: BELUM ADA   (replika tertinggal 11 MB)
          id=2008 -> replika: BELUM ADA   (replika tertinggal 11 MB)
          id=2009 -> replika: BELUM ADA   (replika tertinggal 11 MB)
          id=2010 -> replika: BELUM ADA   (tertinggal 8.729 kB)
          id=2011 -> replika: BELUM ADA   (tertinggal 6.454 kB)
          id=2012 -> replika: BELUM ADA   (tertinggal 3.484 kB)
          id=2013 -> replika: BELUM ADA   (tertinggal 1.947 kB)

          8 dari 8 GAGAL.
        `,
        {
          caption:
            'Bug ini tidak muncul saat diuji di lingkungan yang sepi, dan muncul persis saat produksi sedang sibuk.',
        },
      ),
      p(
        'Itulah sifat paling berbahaya dari kelas bug ini. Ia lolos seluruh pengujian, berjalan berbulan-bulan tanpa keluhan, lalu muncul pada hari lalu lintas naik, yaitu hari yang paling tidak diinginkan.',
      ),
      code(
        'text',
        `
        Jeda replikasi selama beban berlangsung, diukur per detik:

          t+1s  lag: 0 ms tulis, 1 ms replay      tertinggal: 0 bytes
          t+2s  lag: 45 ms tulis, 104 ms replay   tertinggal: 11 MB
          t+3s  lag: 0 ms tulis, 202 ms replay    tertinggal: 24 bytes
          t+4s  lag: 1 ms tulis, 11 ms replay     tertinggal: 410 kB
          t+5s  lag: 1 ms tulis, 7 ms replay      tertinggal: 0 bytes

        Sesudah beban selesai:
          primary komentar: 1.300.000
          replika komentar: 1.300.000

        Replikanya AKHIRNYA menyusul. Itulah arti "eventual".
        Pertanyaannya bukan apakah ia menyusul, melainkan apa yang
        terjadi pada pengguna selama jeda itu.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Gejala jeda replikasi di sisi aplikasi jarang menyebut kata replika, dan itulah yang membuatnya sulit ditelusuri.',
      ),
      code(
        'text',
        `
        Bentuk keluhan yang sebenarnya berarti jeda replikasi:

          "Saya sudah simpan, tapi begitu kembali ke daftar,
           datanya belum ada."

          "Saya ubah profil, halamannya masih menampilkan yang lama.
           Kalau saya muat ulang lagi, baru muncul."

          "Pesanan saya hilang setelah checkout, lalu muncul lagi
           beberapa detik kemudian."

        Ketiganya terlihat seperti bug penyimpanan, dan tidak satu
        pun berhubungan dengan penyimpanan.
        `,
      ),
      p('Tiga bentuk penyelesaian yang lazim, masing-masing dengan pertukarannya.'),
      code(
        'ts',
        `
        // 1. BACA DARI PRIMARY untuk jalur yang menuntut kesegaran.
        //    Paling sederhana dan paling bisa diandalkan.
        const pesanan = await dbPrimary.pesanan.findUnique({ where: { id } });

        // 2. TEMPELKAN pembaca ke primary selama beberapa detik
        //    sesudah pengguna itu menulis.
        async function baca(penggunaId: number, query: Query) {
          const baruMenulis = await cache.get(\`tulis:\${penggunaId}\`);
          return (baruMenulis ? dbPrimary : dbReplika).jalankan(query);
        }
        // Setelah setiap penulisan: cache.set(\`tulis:\${id}\`, 1, 5)

        // 3. TUNGGU sampai replika mencapai posisi tertentu.
        //    Paling tepat, dan paling menambah latensi.
        //    Pada PostgreSQL, posisi itu adalah LSN.
        `,
        {
          caption:
            'Bentuk kedua yang paling sering dipakai: bebannya tetap pindah ke replika untuk mayoritas pembacaan.',
        },
      ),
      p(
        'Selain jeda, ada beberapa kegagalan lain yang khas pada replikasi dan perlu dikenali sebelum terjadi.',
      ),
      code(
        'text',
        `
        1. Replika jauh tertinggal dan tidak pernah menyusul

           Penyebab yang lazim:
             - satu transaksi sangat besar di primary
             - replika memakai mesin yang jauh lebih kecil
             - query panjang di replika menunda penerapan WAL

           Pantau jeda dalam BYTE, bukan hanya dalam detik:
             pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)

           Diukur di atas, angkanya bergerak 0 -> 11 MB -> 0 dalam
           hitungan detik.

        2. Replika penuh karena WAL menumpuk

           Slot replikasi yang tidak aktif membuat primary MENAHAN
           WAL selamanya, menunggu replika yang tidak pernah kembali.
           Disk primary penuh, dan primary-nya ikut mati.

           Ini salah satu cara replika menjatuhkan primary, dan
           berlawanan dengan dugaan bahwa replika hanya menambah
           ketersediaan.

        3. Failover yang kehilangan data

           Pada replikasi ASINKRON, transaksi yang sudah di-commit
           di primary bisa BELUM sampai ke replika saat primary mati.
           Diukur di atas: sampai 11 MB WAL belum sampai.

           Itulah yang dimaksud RPO bukan nol pada replikasi asinkron.
        `,
      ),
      code(
        'text',
        `
        DAN SATU LAGI: menulis ke replika secara tidak sengaja.

          ERROR: cannot execute INSERT in a read-only transaction

        Pesan ini BAIK. Ia muncul ketika kode yang seharusnya membaca
        ternyata menulis, misalnya karena pustaka ORM memperbarui
        waktu akses terakhir, atau karena satu jalur kode memakai
        koneksi yang salah.

        Yang berbahaya adalah bila pesan itu ditutup dengan mengarahkan
        seluruh lalu lintas kembali ke primary, sebab dengan begitu
        seluruh manfaat replikanya hilang tanpa ada yang menyadari.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Replika baca adalah perubahan infrastruktur yang menuntut perubahan cara berpikir di aplikasi, dan bagian kedua sering dilewatkan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengarahkan semua pembacaan ke replika',
            'Baca kan jauh lebih banyak',
            'Diukur, saat beban tulis besar 8 dari 8 pembacaan sesudah penulisan tidak menemukan datanya',
          ],
          [
            'Menguji read-after-write di lingkungan yang sepi',
            'Sudah dicoba dan berhasil',
            'Diukur, 5 dari 5 berhasil saat diam dan 8 dari 8 gagal saat ramai. Ujilah di bawah beban',
          ],
          [
            'Memantau jeda hanya dalam detik',
            'Itu yang dirasakan pengguna',
            'Jeda dalam BYTE menunjukkan seberapa jauh tertinggal. Diukur, 11 MB dalam satu lonjakan',
          ],
          [
            'Memakai mesin yang lebih kecil untuk replika',
            'Kan cuma membaca',
            'Replika harus menerapkan SELURUH penulisan primary. Mesin yang lebih kecil pasti tertinggal',
          ],
          [
            'Membiarkan slot replikasi yang tidak aktif',
            'Nanti replikanya kembali',
            'Primary menahan WAL selamanya. Disk primary penuh, dan primary-nya ikut mati',
          ],
          [
            'Menganggap failover asinkron tidak kehilangan data',
            'Kan sudah di-commit',
            'Diukur, sampai 11 MB WAL belum sampai ke replika. Itulah arti RPO bukan nol',
          ],
        ],
      ),
      p(
        'Hasil pengukuran di awal sub-bab ini pantas diingat melampaui topiknya. Percobaan pertama, yang dijalankan di sistem yang sepi, memberi hasil yang **salah** dan meyakinkan: lima dari lima berhasil. Bila pengujiannya berhenti di situ, kesimpulannya adalah bahwa read-after-write aman, dan kesimpulan itu akan bertahan sampai hari produksi sibuk. Menguji sesuatu dalam keadaan yang mirip keadaan sesungguhnya bukan kemewahan, melainkan satu-satunya cara pengujiannya berarti.',
      ),
      references(
        {
          label: 'PostgreSQL: High Availability, Load Balancing, and Replication',
          href: 'https://www.postgresql.org/docs/current/high-availability.html',
          source: 'PostgreSQL',
          note: 'Perbandingan resmi seluruh bentuk replikasi beserta jaminannya.',
        },
        {
          label: 'PostgreSQL: Hot Standby',
          href: 'https://www.postgresql.org/docs/current/hot-standby.html',
          source: 'PostgreSQL',
          note: 'Termasuk penjelasan kenapa query panjang di follower bisa menahan penerapan WAL.',
        },
        {
          label: 'PostgreSQL: Synchronous Replication',
          href: 'https://www.postgresql.org/docs/current/warm-standby.html#SYNCHRONOUS-REPLICATION',
          source: 'PostgreSQL',
          note: 'Pengaturan `synchronous_standby_names` termasuk bentuk ANY yang dipakai di sub-bab ini.',
        },
        {
          label: 'MySQL: Replication',
          href: 'https://dev.mysql.com/doc/refman/8.4/en/replication.html',
          source: 'MySQL',
          note: 'Padanan seluruh konsep di sub-bab ini pada MySQL.',
        },
      ),
    ],
  ),

  written(
    'konsistensi',
    'Strong Consistency dan Eventual Consistency',
    18,
    'Apa yang benar-benar hilang ketika data tersebar, dan cara memutuskan per data.',
    [
      p(
        'Begitu data hidup di lebih dari satu tempat, sebuah jaminan yang selama ini gratis tiba-tiba menjadi barang yang harus dibeli. Jaminan itu adalah keyakinan bahwa membaca sesudah menulis pasti melihat hasil penulisan itu.',
      ),
      p(
        'Sub-bab ini menjelaskan kenapa jaminan itu menjadi mahal, memperkenalkan pertukaran yang tidak bisa dihindari siapa pun, dan yang terpenting menunjukkan bahwa keputusannya diambil **per data**, bukan sekali untuk seluruh sistem.',
      ),

      terms(
        {
          term: 'strong consistency',
          meaning:
            'Setiap pembacaan sesudah sebuah penulisan yang berhasil pasti melihat hasil penulisan itu, dari mana pun dibaca. Ini perilaku bawaan satu basis data tunggal, dan itulah alasan ia terasa gratis selama datanya belum tersebar.',
        },
        {
          term: 'eventual consistency',
          meaning:
            'Semua salinan akan sama **pada akhirnya** bila tidak ada penulisan baru, tetapi untuk sementara pembaca bisa melihat versi lama. Kata "akhirnya" tidak menjanjikan berapa lama, sehingga sistem yang serius selalu memantau dan membatasi jendelanya.',
        },
        {
          term: 'teorema CAP',
          meaning:
            'Pernyataan bahwa sebuah sistem terdistribusi tidak bisa sekaligus menjamin konsistensi, ketersediaan, dan tahan terhadap jaringan yang terputus. Dibaca "kap". Karena jaringan pasti kadang terputus, pilihan sesungguhnya hanya dua, yaitu ketika terputus, apakah sistem menolak melayani demi kebenaran, atau tetap melayani dengan data yang mungkin usang.',
        },
        {
          term: 'network partition',
          meaning:
            'Keadaan ketika sebagian mesin tidak bisa berkomunikasi dengan sebagian lain karena jaringan, meskipun semuanya hidup. Inilah huruf P pada CAP, dan ia bukan kemungkinan yang bisa dihindari melainkan kepastian yang harus direncanakan.',
        },
        {
          term: 'quorum (kuorum)',
          meaning:
            'Jumlah minimum salinan yang harus menyetujui sebuah operasi agar operasi itu dianggap sah. Bila jumlah penulis dan pembaca yang disyaratkan lebih besar daripada jumlah salinan, pembacaan dijamin melihat penulisan terakhir. Aturan itu sering ditulis sebagai W tambah R lebih besar daripada N.',
        },
        {
          term: 'monotonic reads',
          meaning:
            'Jaminan bahwa seorang pembaca tidak akan pernah melihat data yang **mundur**. Tanpa jaminan ini, dua pembacaan berurutan yang kebetulan mendarat di dua replika berbeda bisa memperlihatkan data baru lalu data lama, dan itu jauh lebih membingungkan daripada sekadar data yang basi.',
        },
        {
          term: 'linearizability',
          meaning:
            'Bentuk konsistensi terkuat, yaitu seluruh sistem berperilaku seolah-olah hanya ada satu salinan yang dikerjakan satu per satu. Dibaca "linearizabiliti". Mahal karena menuntut koordinasi pada setiap operasi, dan hampir tidak pernah dibutuhkan untuk seluruh data pada satu aplikasi.',
        },
      ),

      h2('Kenapa jaminan itu menjadi mahal'),
      p(
        'Pada satu basis data, urutan kejadiannya tunggal dan tidak ada yang perlu disepakati. Begitu ada dua salinan, muncul pertanyaan yang tidak punya jawaban murah, yaitu apakah pembacaan harus menunggu sampai kedua salinan setuju.',
      ),
      code(
        'text',
        `
        SATU SALINAN
        tulis X=5  -> selesai
        baca X     -> 5. Selalu. Tanpa koordinasi apa pun.

        DUA SALINAN, PEMBACAAN TIDAK MENUNGGU
        tulis X=5 ke A  -> selesai, disalin ke B di latar
        baca X dari B   -> bisa 5, bisa nilai lama. Cepat, dan kadang usang.

        DUA SALINAN, PEMBACAAN MENUNGGU
        tulis X=5 ke A  -> tunggu B mengonfirmasi -> selesai
        baca X dari B   -> pasti 5. Benar, dan lebih lambat.
                           Bila B tidak terjangkau, penulisan berhenti total.
        `,
      ),
      p(
        'Baris terakhir itulah inti teorema CAP. Ketika jaringan ke B terputus, sistem harus memilih antara berhenti melayani penulisan demi menjaga kebenaran, atau tetap melayani dengan menerima bahwa B akan usang untuk sementara. Tidak ada pilihan ketiga.',
      ),

      h2('Yang sesungguhnya diputuskan'),
      p(
        'Karena itu pertanyaan yang berguna bukan "apakah sistem ini konsisten", melainkan pertanyaan yang jauh lebih konkret berikut ini, diajukan **untuk setiap jenis data**.',
      ),
      ol(
        'Apa yang terjadi bila pembaca melihat nilai yang terlambat beberapa detik?',
        'Siapa yang membacanya, penulisnya sendiri atau orang lain?',
        'Apakah nilai itu dipakai untuk mengambil keputusan, atau hanya ditampilkan?',
        'Bila jawabannya salah, apakah kerugiannya bisa dipulihkan?',
      ),
      table(
        ['Data', 'Boleh basi?', 'Alasan', 'Cara membacanya'],
        [
          [
            'Saldo saat penarikan',
            'Tidak',
            'Salah berarti uang',
            'Selalu dari leader, di dalam transaksi',
          ],
          [
            'Stok saat checkout',
            'Tidak',
            'Menjual barang yang habis',
            'Dari leader, dengan kunci baris',
          ],
          [
            'Hak akses dan peran',
            'Tidak',
            'Basi berarti lubang keamanan',
            'Dari leader, jangan di-cache',
          ],
          [
            'Profil pengguna',
            'Beberapa detik',
            'Tidak ada keputusan yang bergantung padanya',
            'Dari replika, dengan jendela lengket bagi pemiliknya',
          ],
          [
            'Daftar tulisan',
            'Beberapa detik',
            'Pembaca tidak tahu apa yang belum muncul',
            'Dari replika',
          ],
          ['Jumlah suka', 'Puluhan detik', 'Angka hiasan', 'Dari cache, dijumlahkan berkala'],
          ['Hasil pencarian', 'Menit', 'Indeks memang selalu tertinggal', 'Dari mesin pencari'],
          ['Laporan analitik', 'Jam', 'Dihitung berkala secara sengaja', 'Dari summary table'],
        ],
      ),
      p(
        'Tabel seperti ini layak ditulis sungguhan untuk aplikasimu, bukan disimpan di kepala. Ia menjadi rujukan ketika seseorang menambahkan cache pada endpoint hak akses, dan ia menjadi jawaban ketika ada yang bertanya kenapa jumlah suka kadang tidak langsung berubah.',
      ),
      callout(
        'danger',
        'Hak akses adalah baris yang paling sering dilanggar',
        'Menyimpan peran atau izin di cache selama lima menit berarti pengguna yang baru dicabut aksesnya masih bisa melakukan tindakan itu selama lima menit. Itu bukan pengoptimalan melainkan kerentanan, dan ia melanggar aturan pada sub-bab [hak seminimal mungkin](/kelas/keamanan-fullstack/identitas-kewenangan/hak-seminimal-mungkin). Bila pembacaan izin benar-benar menjadi beban, perpendek masa berlakunya menjadi hitungan detik dan hapus penandanya seketika saat izin berubah.',
      ),

      h2('Menegakkan yang harus kuat'),
      p(
        'Untuk data yang tidak boleh basi, dua alat sudah kamu kenal dari bab basis data, dan keduanya tetap menjadi jawaban utama.',
      ),
      compare(
        {
          title: 'Rapuh, memeriksa lalu menulis',
          lang: 'js',
          code: `
            const produk = await db.produk.cari(id);
            if (produk.stok < jumlah) {
              throw new Error('stok tidak cukup');
            }
            await db.produk.kurangiStok(id, jumlah);
          `,
          notes: [
            'Dua permintaan bisa sama-sama lolos pemeriksaan',
            'Keduanya lalu mengurangi stok',
            'Stok bisa menjadi negatif',
          ],
        },
        {
          title: 'Aman, basis data yang menegakkan',
          lang: 'sql',
          code: `
            -- Batasan ini yang benar-benar menjaga, bukan pemeriksaan di kode.
            ALTER TABLE produk ADD CONSTRAINT stok_tidak_negatif CHECK (stok >= 0);

            -- Pengurangan dan pemeriksaan menjadi satu operasi atomik.
            UPDATE produk
            SET stok = stok - $1
            WHERE id = $2 AND stok >= $1
            RETURNING stok;
          `,
          notes: [
            'Tidak ada jeda antara memeriksa dan menulis',
            'Nol baris kembali berarti stok tidak cukup',
            'Batasan `CHECK` menjadi jaring pengaman terakhir',
          ],
        },
      ),
      p(
        'Perhatikan panel kanan tidak membaca lebih dulu sama sekali. Syarat `stok >= $1` berada di dalam perintah yang sama dengan pengurangannya, sehingga basis data memeriksanya pada saat baris itu terkunci. Ini pola yang sama dengan yang dibahas di sub-bab [transaksi dan ACID](/kelas/backend-basic/database-sql-dasar/transaksi-acid), dan ia menjadi jauh lebih penting begitu ada beberapa mesin aplikasi yang berjalan bersamaan.',
      ),

      h2('Monotonic reads, kejutan yang kedua'),
      p(
        'Ada bentuk kebingungan yang lebih buruk daripada data basi, yaitu data yang mundur. Ini terjadi ketika dua pembacaan berurutan mendarat di dua replika dengan keterlambatan berbeda.',
      ),
      code(
        'text',
        `
        10:00:00  Pengguna membuka daftar. Dibaca dari REPLIKA 1 (tertinggal 50 ms).
                  Terlihat 12 komentar.
        10:00:03  Pengguna menyegarkan. Dibaca dari REPLIKA 2 (tertinggal 4 detik).
                  Terlihat 10 komentar.

        Bagi pengguna: dua komentar baru saja terhapus.
        `,
      ),
      p(
        'Penanganannya sederhana, yaitu buat satu pengguna cenderung membaca dari replika yang sama selama satu sesi. Ini bisa dilakukan dengan memilih replika berdasarkan hasil hitungan atas id penggunanya, sehingga pilihannya tetap konsisten tanpa perlu menyimpan apa pun.',
      ),
      code(
        'js',
        `
        // Pengguna yang sama diarahkan ke replika yang sama selama daftarnya tidak berubah.
        function pilihReplika(penggunaId, daftarReplika) {
          if (penggunaId === undefined) {
            return daftarReplika[Math.floor(Math.random() * daftarReplika.length)];
          }
          const posisi = hash32(String(penggunaId)) % daftarReplika.length;
          return daftarReplika[posisi];
        }
        `,
        {
          caption:
            'Untuk pembagian yang tetap stabil saat jumlah replika berubah, pakai hash ring dari sub-bab consistent hashing.',
        },
      ),

      h2('Kuorum, cara lain menjamin kebenaran'),
      p(
        'Basis data terdistribusi seperti Cassandra dan DynamoDB memakai pendekatan yang berbeda dari leader dan follower. Di sana semua salinan setara, dan jaminan diatur dengan menentukan berapa banyak salinan yang harus menjawab.',
      ),
      code(
        'text',
        `
        N = jumlah salinan
        W = jumlah salinan yang harus mengonfirmasi sebuah penulisan
        R = jumlah salinan yang harus menjawab sebuah pembacaan

        Bila W + R > N, pembacaan pasti melihat penulisan terakhir,
        karena himpunan penulis dan himpunan pembaca pasti beririsan.

        N=3, W=2, R=2  -> 2+2 > 3, terjamin. Pilihan paling umum.
        N=3, W=1, R=1  -> 1+1 < 3, tidak terjamin. Paling cepat.
        N=3, W=3, R=1  -> terjamin, baca sangat cepat, tulis rapuh.
        N=3, W=1, R=3  -> terjamin, tulis sangat cepat, baca rapuh.
        `,
      ),
      p(
        'Yang menarik dari model ini adalah jaminannya bisa dipilih **per operasi**. Pembacaan jumlah suka bisa memakai satu salinan agar cepat, sedangkan pembacaan saldo pada sistem yang sama bisa memakai kuorum. Fleksibilitas itu adalah kelebihan sesungguhnya dari keluarga basis data ini, dan sekaligus tanggung jawab tambahan karena setiap pemanggilan harus memilih dengan sadar.',
      ),

      h2('Menyampaikan ketidakpastian kepada pengguna'),
      p(
        'Sebagian besar masalah konsistensi terasa sebagai masalah karena antarmuka berpura-pura semuanya pasti. Antarmuka yang jujur menghilangkan sebagian besar kebingungannya tanpa mengubah apa pun di sisi server.',
      ),
      table(
        ['Situasi', 'Antarmuka yang membingungkan', 'Antarmuka yang jujur'],
        [
          [
            'Komentar baru dikirim',
            'Muat ulang daftar, komentarnya belum ada',
            'Tampilkan langsung dari respons, tandai sedang tersimpan',
          ],
          [
            'Jumlah suka tertinggal',
            'Angka tetap, terlihat rusak',
            'Naikkan angkanya di layar, samakan saat data berikutnya datang',
          ],
          [
            'Hasil pencarian belum ada',
            'Barang baru tidak ditemukan',
            'Sebutkan indeks pencarian diperbarui berkala',
          ],
          [
            'Laporan belum termutakhir',
            'Angka berbeda dari halaman utama',
            'Cantumkan waktu pembaruan terakhirnya',
          ],
        ],
      ),
      p(
        'Kolom kanan pada baris pertama dan kedua adalah pembaruan optimistik yang dibahas di sub-bab [optimistic update](/kelas/frontend-intermediate/state-management/optimistic-update). Menariknya, teknik yang di sana dipakai demi kecepatan yang dirasakan ternyata juga menutup sebagian besar gejala konsistensi akhir, karena pengguna melihat hasil tindakannya sendiri tanpa perlu menunggu data berkeliling.',
      ),

      h2('Ringkasan'),
      ul(
        '**Konsistensi kuat itu gratis pada satu basis data**, dan menjadi mahal begitu datanya tersebar',
        '**Keputusannya per data, bukan per sistem.** Satu aplikasi wajar punya keduanya sekaligus',
        '**Uang, stok, dan izin selalu kuat.** Sisanya hampir selalu boleh akhir',
        '**Data yang mundur lebih membingungkan daripada data yang basi.** Jaga satu pengguna pada satu replika',
        '**Antarmuka yang jujur menghilangkan sebagian besar gejalanya** tanpa mengubah apa pun di server',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Konsistensi kuat berarti setiap pembacaan melihat penulisan terakhir. Konsistensi akhir berarti ia akan melihatnya, suatu saat. Selisih di antara keduanya bukan teori, dan bisa diukur.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan dengan PostgreSQL 16.15 dan replika
        streaming asinkron.

        SAAT SISTEM SEDANG DIAM:
          5 dari 5 pembacaan sesudah penulisan BERHASIL menemukan
          datanya di replika.

        SAAT ADA BEBAN TULIS BESAR:
          8 dari 8 pembacaan sesudah penulisan TIDAK menemukan
          datanya. Replika tertinggal sampai 11 MB.

        Sesudah beban selesai, keduanya sama: 1.300.000 baris.
        `,
        {
          caption:
            'Itulah "akhirnya" dalam konsistensi akhir: ia datang, dan waktunya tidak dijanjikan.',
        },
      ),
      p(
        'Pertanyaan yang benar bukan "mana yang lebih baik" melainkan "bagian mana dari sistem ini yang menuntut yang mana", sebab satu aplikasi biasanya memerlukan keduanya di tempat yang berbeda.',
      ),
      table(
        ['Data', 'Perlu konsistensi kuat?', 'Alasannya'],
        [
          ['Saldo dan pembayaran', 'Ya', 'Dua pembacaan yang berbeda berarti uang yang berbeda'],
          ['Stok saat checkout', 'Ya', 'Menjual barang yang sudah habis tidak bisa dibatalkan'],
          [
            'Hak akses dan peran',
            'Ya',
            'Peran lama yang terbaca berarti akses yang seharusnya sudah dicabut',
          ],
          ['Jumlah suka dan penayangan', 'Tidak', 'Meleset beberapa detik tidak berarti apa-apa'],
          ['Linimasa dan daftar terbaru', 'Tidak', 'Terlambat beberapa detik tidak terasa'],
          ['Hasil pencarian', 'Tidak', 'Indeks pencarian memang selalu tertinggal'],
        ],
      ),
      p(
        'Baris ketiga sering dilupakan padahal akibatnya berupa lubang keamanan. Peran yang baru saja dicabut dan masih terbaca dari replika berarti akses yang seharusnya sudah hilang masih berlaku.',
      ),
      code(
        'ts',
        `
        // Aturan praktis yang menutup sebagian besar kasus:
        // keputusan OTORISASI dan keputusan UANG dibaca dari primary.
        async function bolehMenghapus(penggunaId: number, faktur: Faktur) {
          // BUKAN dari replika. Peran bisa baru saja diubah.
          const pengguna = await dbPrimary.pengguna.findUnique({
            where: { id: penggunaId },
            select: { peran: true, aktif: true },
          });
          return pengguna?.aktif === true && pengguna.peran === 'admin';
        }

        // Sisanya boleh dari replika.
        const daftar = await dbReplika.artikel.findMany({ take: 20 });
        `,
      ),
      p(
        'Selain kuat dan akhir, ada beberapa jaminan di antaranya yang sering cukup dan jauh lebih murah.',
      ),
      code(
        'text',
        `
          READ YOUR OWN WRITES
            Pengguna selalu melihat tulisannya SENDIRI. Pengguna lain
            boleh terlambat.
            -> ditutup dengan menempelkan pembaca ke primary selama
               beberapa detik sesudah ia menulis

          MONOTONIC READS
            Pembacaan berikutnya tidak pernah LEBIH LAMA daripada
            yang sebelumnya.
            -> ditutup dengan menempelkan satu pengguna ke satu
               replika, bukan ke replika mana pun

          CONSISTENT PREFIX
            Urutan yang terlihat sesuai urutan penulisannya, meski
            terlambat.
            -> penting untuk percakapan: jawaban tidak boleh muncul
               sebelum pertanyaannya

        Ketiganya jauh lebih murah daripada konsistensi kuat, dan
        untuk sebagian besar fitur, salah satunya sudah cukup.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Konsistensi akhir tidak menghasilkan error. Ia menghasilkan keluhan pengguna yang bentuknya sangat khas.',
      ),
      code(
        'text',
        `
        1. "Sudah saya simpan, tapi belum muncul"
           -> read-your-own-writes tidak terjamin

        2. "Tadi ada, sekarang hilang, lalu ada lagi"
           -> monotonic reads tidak terjamin. Permintaan mendarat di
              replika yang berbeda dengan jeda yang berbeda

        3. "Balasannya muncul sebelum pesannya"
           -> consistent prefix tidak terjamin

        4. "Stoknya bilang ada 1, tapi checkout gagal"
           -> keputusan yang menuntut konsistensi kuat dibaca dari
              sumber yang konsisten akhir

        Keempatnya terlihat seperti bug aplikasi, dan tidak satu pun
        akan ditemukan dengan membaca kode aplikasinya.
        `,
      ),
      p(
        'Kelas kesalahan kedua adalah menuntut konsistensi kuat di tempat yang tidak memerlukannya, dan biayanya dibayar dalam latensi.',
      ),
      code(
        'text',
        `
        Replikasi SINKRON: primary menunggu replika mengkonfirmasi
        sebelum commit dinyatakan selesai.

        Yang dibeli: RPO nol. Tidak ada transaksi yang hilang saat
        primary mati.

        Yang dibayar: setiap penulisan membayar round trip ke replika.
        Diukur di mesin ini sebagai patokan:
          round trip loopback     1,69 ms
          round trip internet    70,04 ms

        Replika di wilayah lain berarti SETIAP penulisan membayar
        puluhan milidetik. Untuk jumlah suka, itu harga yang tidak
        masuk akal.
        `,
        {
          caption:
            'Karena itu banyak sistem memakai sinkron untuk satu replika terdekat dan asinkron untuk sisanya.',
        },
      ),
      code(
        'text',
        `
        DAN SATU KESALAHAN yang lebih halus: mengira transaksi
        menjamin konsistensi LINTAS SISTEM.

          BEGIN;
            UPDATE saldo SET jumlah = jumlah - 100 WHERE id = 1;
            -- panggilan ke layanan pembayaran di sini
          COMMIT;

        Transaksi basis data TIDAK mencakup panggilan jaringan.
        Bila panggilannya berhasil dan COMMIT-nya gagal, uangnya
        sudah berpindah dan catatannya tidak ada.

        Aturannya: JANGAN pernah memanggil layanan luar di dalam
        transaksi. Tulis niatnya ke tabel, commit, lalu kerjakan
        panggilannya di luar dengan kunci idempotensi.

        Diuji di bab Desain API: satu kunci idempotensi, lima
        permintaan bersamaan -> satu pembayaran yang lahir.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Konsistensi adalah area tempat asumsi yang benar pada satu basis data tunggal berhenti berlaku tanpa ada yang memberi tahu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengarahkan semua pembacaan ke replika',
            'Baca kan jauh lebih banyak',
            'Diukur, saat beban tulis besar 8 dari 8 pembacaan sesudah penulisan gagal menemukan datanya',
          ],
          [
            'Membaca peran dan hak akses dari replika',
            'Itu kan cuma pembacaan',
            'Peran yang baru dicabut masih terbaca. Akses yang seharusnya hilang masih berlaku',
          ],
          [
            'Memakai replikasi sinkron untuk semuanya',
            'Biar aman',
            'Setiap penulisan membayar round trip. Untuk replika lintas wilayah itu puluhan milidetik per tulis',
          ],
          [
            'Menganggap "eventual" berarti sepersekian detik',
            'Biasanya kan cepat',
            'Diukur, jeda 202 ms dan 11 MB saat beban besar. Tidak ada batas atas yang dijanjikan',
          ],
          [
            'Menempelkan pengguna ke replika mana pun',
            'Semua replika kan sama',
            'Jeda tiap replika berbeda. Data terlihat muncul lalu hilang lalu muncul lagi',
          ],
          [
            'Memanggil layanan luar di dalam transaksi',
            'Biar atomik',
            'Transaksi tidak mencakup panggilan jaringan. Uang berpindah tanpa catatannya tersimpan',
          ],
        ],
      ),
      p(
        'Cara paling ringkas memutuskan di mana setiap jenis konsistensi dipakai adalah bertanya apa yang terjadi bila data yang terbaca terlambat lima detik. Untuk jumlah suka, jawabannya tidak ada yang terjadi. Untuk saldo, jawabannya seseorang bisa membelanjakan uang yang sudah tidak ada. Pertanyaan itu memisahkan dua kelompok dengan cukup tajam, dan hampir selalu menghasilkan daftar yang jauh lebih pendek daripada yang diduga untuk kelompok yang menuntut konsistensi kuat.',
      ),
      references(
        {
          label: 'PostgreSQL: Transaction Isolation',
          href: 'https://www.postgresql.org/docs/current/transaction-iso.html',
          source: 'PostgreSQL',
          note: 'Tingkat isolasi yang menentukan apa yang dilihat sebuah transaksi.',
        },
        {
          label: 'PostgreSQL: Explicit Locking',
          href: 'https://www.postgresql.org/docs/current/explicit-locking.html',
          source: 'PostgreSQL',
          note: 'Alat untuk menegakkan kebenaran ketika beberapa permintaan bersaing atas baris yang sama.',
        },
        {
          label: 'Cassandra: Dynamo-style architecture',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html',
          source: 'Apache Cassandra',
          note: 'Model kuorum beserta aturan W tambah R lebih besar daripada N.',
        },
        {
          label: 'MongoDB: Read Concern and Write Concern',
          href: 'https://www.mongodb.com/docs/manual/reference/read-concern/',
          source: 'MongoDB',
          note: 'Contoh jaminan konsistensi yang bisa dipilih per operasi.',
        },
      ),
    ],
  ),
  written(
    'sharding',
    'Sharding dan Memilih Shard Key',
    21,
    'Langkah terakhir, paling mahal, dan paling sulit dibatalkan.',
    [
      p(
        'Sharding adalah satu-satunya cara menambah kapasitas **tulis** setelah satu mesin tidak cukup. Ia juga langkah yang paling mahal dan paling sulit dibatalkan, sehingga ia diletakkan di urutan terakhir bukan karena kebetulan.',
      ),
      p(
        'Sub-bab ini membahas kapan sharding benar-benar dibutuhkan, tiga cara membagi, dan satu keputusan yang menentukan segalanya, yaitu pemilihan shard key. Keputusan itu diambil sekali dan mengikat selamanya, karena mengubahnya berarti memindahkan seluruh data.',
      ),

      terms(
        {
          term: 'sharding',
          meaning:
            'Membagi satu himpunan data ke beberapa basis data yang saling bebas, masing-masing memegang sebagian data. Dibaca "syarding". Setiap bagian disebut shard, dan tiap shard adalah basis data utuh yang tidak tahu keberadaan shard lain.',
        },
        {
          term: 'shard key',
          meaning:
            'Kolom yang nilainya menentukan sebuah baris berada di shard mana. Ini keputusan paling menentukan pada seluruh sharding, karena ia menentukan pertanyaan mana yang murah dan pertanyaan mana yang menjadi mahal.',
        },
        {
          term: 'partition (partisi)',
          meaning:
            'Istilah yang sering dipakai bergantian dengan shard, dengan satu beda penting. Partisi biasanya berarti pembagian tabel **di dalam satu basis data**, sedangkan shard berarti pembagian ke basis data yang berbeda. PostgreSQL menyediakan partisi bawaan, dan partisi sering cukup ketika masalahnya ukuran tabel, bukan kapasitas mesin.',
        },
        {
          term: 'scatter-gather',
          meaning:
            'Pola menjalankan satu pertanyaan ke semua shard lalu menggabungkan hasilnya. Dibaca "sketer-geder". Selalu lebih lambat daripada bertanya ke satu shard, dan latensinya ditentukan shard yang paling lambat menjawab, bukan yang rata-rata.',
        },
        {
          term: 'cardinality (kardinalitas)',
          meaning:
            'Banyaknya nilai berbeda pada sebuah kolom. Kolom `negara` punya kardinalitas rendah, sedangkan kolom `pengguna_id` punya kardinalitas tinggi. Shard key wajib berkardinalitas tinggi, karena kardinalitas rendah membuat jumlah shard terbatas dan pembagiannya timpang.',
        },
        {
          term: 'resharding',
          meaning:
            'Mengubah jumlah shard atau memindahkan data antar shard. Dibaca "risyarding". Ini operasi yang panjang dan berisiko karena harus dilakukan sambil sistem tetap melayani, sehingga rancangan yang baik berusaha membuatnya sejarang mungkin.',
        },
        {
          term: 'lookup service',
          meaning:
            'Layanan atau tabel yang menyimpan pemetaan dari kunci ke shard. Dipakai pada pembagian berbasis direktori. Fleksibel karena tiap kunci bisa dipindahkan sendiri, dan ia menjadi ketergantungan tambahan yang harus sangat andal.',
        },
      ),

      h2('Kapan sharding benar-benar dibutuhkan'),
      p(
        'Hanya ada tiga alasan yang sah, dan ketiganya harus muncul **sesudah** seluruh langkah sebelumnya habis.',
      ),
      ol(
        '**Laju tulis melampaui satu mesin.** Bacanya sudah ditangani cache dan replika, dan yang tersisa adalah penulisan yang tidak muat.',
        '**Ukuran data melampaui satu mesin.** Bukan sekadar disk penuh, melainkan working set-nya tidak muat di memori mesin terbesar yang wajar.',
        '**Pemisahan wajib.** Aturan hukum atau kontrak mengharuskan data pelanggan tertentu berada di wilayah atau mesin tersendiri.',
      ),
      table(
        ['Yang terlihat seperti alasan', 'Kenyataannya', 'Yang sebenarnya dibutuhkan'],
        [
          [
            '"Query kami lambat"',
            'Hampir selalu soal index atau bentuk query',
            'Perbaiki query, bukan bagi data',
          ],
          [
            '"Bacanya terlalu banyak"',
            'Sharding tidak dirancang untuk itu',
            'Cache lalu replika baca',
          ],
          [
            '"Tabel kami besar sekali"',
            'Besar tidak sama dengan tidak muat',
            'Partisi di dalam satu basis data',
          ],
          [
            '"Nanti pasti butuh"',
            'Membayar biaya sekarang untuk manfaat yang mungkin tidak datang',
            'Rancang agar mudah di-shard nanti',
          ],
        ],
      ),
      callout(
        'tip',
        'Partisi sering menjawab apa yang dikira butuh sharding',
        'PostgreSQL bisa memecah satu tabel besar menjadi beberapa potongan di dalam basis data yang sama. Pertanyaan yang menyebut kolom pembagi hanya menyentuh potongan yang relevan, dan penghapusan data lama menjadi operasi yang hampir seketika. Semua itu tanpa kehilangan `JOIN`, transaksi, maupun batasan. Kalau masalahmu adalah tabel yang membesar, coba ini dulu.',
      ),
      code(
        'sql',
        `
        -- Partisi per bulan di dalam SATU basis data.
        CREATE TABLE peristiwa (
          id          BIGSERIAL,
          pengguna_id BIGINT      NOT NULL,
          jenis       TEXT        NOT NULL,
          terjadi_pada TIMESTAMPTZ NOT NULL,
          PRIMARY KEY (id, terjadi_pada)
        ) PARTITION BY RANGE (terjadi_pada);

        CREATE TABLE peristiwa_2026_08 PARTITION OF peristiwa
          FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

        CREATE TABLE peristiwa_2026_09 PARTITION OF peristiwa
          FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

        -- Menghapus data setahun lalu menjadi satu perintah yang hampir seketika.
        DROP TABLE peristiwa_2025_08;
        `,
        {
          caption:
            'Baris terakhir adalah manfaat yang paling sering diremehkan: DELETE atas jutaan baris bisa memakan jam, DROP tidak.',
        },
      ),

      h2('Tiga cara membagi'),
      h2('Berbasis hash'),
      code(
        'text',
        `
        shard = hash(kunci_pembagi) % jumlah_shard

        pengguna_id 1001 -> shard 2
        pengguna_id 1002 -> shard 0
        pengguna_id 1003 -> shard 1
        `,
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Pembagian merata dengan sendirinya', 'Pertanyaan rentang menjadi scatter-gather'],
          ['Tidak ada hotspot alami', 'Menambah shard memindahkan hampir semua data'],
          ['Sangat sederhana untuk diterapkan', 'Tidak ada kedekatan data'],
        ],
      ),
      p(
        'Kekurangan kedua adalah masalah yang sudah punya jawaban, yaitu consistent hashing dari sub-bab [consistent hashing](/kelas/system-design/blok-penyusun/consistent-hashing). Dengan hash ring, menambah satu shard hanya memindahkan sekitar satu per jumlah shard bagian dari data, bukan hampir semuanya.',
      ),
      h2('Berbasis rentang'),
      code(
        'text',
        `
        shard 0 : pengguna_id      1 sampai 1.000.000
        shard 1 : pengguna_id 1.000.001 sampai 2.000.000
        shard 2 : pengguna_id 2.000.001 sampai 3.000.000
        `,
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Pertanyaan rentang murah karena datanya berdekatan', 'Pembagian mudah timpang'],
          ['Mudah dipahami dan mudah dilihat', 'Data baru bisa menumpuk di satu shard'],
          ['Menambah shard cukup menambah rentang baru', 'Rentangnya harus dikelola manusia'],
        ],
      ),
      p(
        'Bahaya utamanya muncul ketika rentangnya berdasarkan waktu atau id yang menaik. Seluruh penulisan baru akan jatuh ke shard terakhir, sehingga shard-shard sebelumnya menganggur sementara yang terakhir kewalahan. Ini persis kebalikan dari yang diinginkan sharding.',
      ),
      h2('Berbasis direktori'),
      code(
        'text',
        `
        Tabel pencari lokasi:
          penyewa_id 501 -> shard 3
          penyewa_id 502 -> shard 1
          penyewa_id 503 -> shard 3
        `,
      ),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Pemetaan bebas sepenuhnya', 'Satu lompatan tambahan pada setiap pertanyaan'],
          ['Satu penyewa besar bisa dipindahkan sendiri', 'Pencari lokasi menjadi titik kegagalan'],
          [
            'Rebalancing bisa bertahap dan terkendali',
            'Harus di-cache agar tidak menjadi bottleneck',
          ],
        ],
      ),
      p(
        'Cara ini paling cocok untuk aplikasi yang melayani banyak penyewa dengan ukuran yang sangat berbeda, misalnya perangkat lunak berlangganan yang pelanggannya ada yang beranggota lima orang dan ada yang lima ribu. Kemampuan memindahkan satu penyewa besar ke shard sendiri adalah manfaat yang tidak dimiliki dua cara lain.',
      ),

      h2('Memilih shard key'),
      p(
        'Ini keputusan yang paling menentukan. Kunci yang salah tidak menghasilkan sistem yang lambat, melainkan sistem yang harus dibongkar ulang.',
      ),
      table(
        ['Syarat', 'Kenapa', 'Contoh yang gagal'],
        [
          [
            'Kardinalitas tinggi',
            'Menentukan berapa banyak shard yang mungkin',
            '`negara` hanya memberi beberapa ratus nilai',
          ],
          [
            'Sebaran merata',
            'Mencegah satu shard menanggung sebagian besar beban',
            '`paket_langganan` membuat paket gratis menjadi raksasa',
          ],
          [
            'Muncul di hampir semua pertanyaan',
            'Agar pertanyaan hanya menyentuh satu shard',
            'Membagi menurut `kategori` padahal semua pertanyaan menyebut `pengguna_id`',
          ],
          [
            'Tidak pernah berubah',
            'Perubahan nilai berarti baris harus pindah shard',
            '`status` atau `wilayah` yang bisa diubah pengguna',
          ],
        ],
      ),
      p(
        'Cara paling andal memilihnya adalah dengan melihat daftar pertanyaan yang sudah kamu susun di sub-bab [memilih SQL atau NoSQL](/kelas/system-design/skala-data/sql-atau-nosql), lalu mencari kolom yang muncul di sebagian besar pertanyaan itu.',
      ),
      code(
        'text',
        `
        DAFTAR PERTANYAAN PADA APLIKASI BLOG

        Ambil tulisan berdasarkan slug                  <- tidak menyebut pengguna
        Ambil daftar tulisan milik seorang penulis      <- penulis_id
        Ambil komentar pada sebuah tulisan              <- tulisan_id
        Ambil komentar yang ditulis seorang pengguna    <- pengguna_id
        Ambil notifikasi seorang pengguna               <- pengguna_id
        Ambil tulisan terbaru dari semua penulis        <- tidak menyebut apa pun

        Kandidat: pengguna_id muncul paling sering.
        Konsekuensi: "tulisan terbaru dari semua penulis" menjadi scatter-gather,
        dan itu harus dijawab dengan cara lain, bukan dengan query biasa.
        `,
      ),
      p(
        'Baris terakhir adalah cara berpikir yang benar. Sharding tidak menghilangkan pertanyaan yang tidak cocok, ia memaksamu menjawab pertanyaan itu dengan cara lain, misalnya lewat summary table yang dijaga terpisah atau lewat indeks pencarian. Mengetahui pertanyaan mana yang akan menjadi mahal **sebelum** memilih kunci jauh lebih baik daripada menemukannya sesudahnya.',
      ),

      h2('Apa yang hilang begitu data terbagi'),
      p(
        'Tiga hal yang selama ini gratis akan hilang, dan ketiganya harus digantikan pekerjaan di sisi aplikasi.',
      ),
      table(
        ['Yang hilang', 'Kenapa', 'Penggantinya'],
        [
          [
            '`JOIN` lintas shard',
            'Shard tidak tahu keberadaan shard lain',
            'Denormalisasi, atau menggabungkan di aplikasi',
          ],
          [
            'Transaksi lintas shard',
            'Tidak ada transaksi tunggal yang melintasi basis data',
            'Rancang agar satu transaksi hanya menyentuh satu shard, atau pakai saga pattern',
          ],
          [
            '`UNIQUE` global',
            'Batasan hanya berlaku di dalam satu basis data',
            'Layanan penerbit id, atau id yang unik secara rancangan',
          ],
        ],
      ),
      compare(
        {
          title: 'Sebelum sharding',
          lang: 'sql',
          code: `
            SELECT k.*, p.nama, t.judul
            FROM komentar k
            JOIN pengguna p ON p.id = k.penulis_id
            JOIN tulisan  t ON t.id = k.tulisan_id
            WHERE t.slug = 'desain-sistem'
            ORDER BY k.dibuat_pada DESC
            LIMIT 50;
          `,
          notes: [
            'Satu perintah, dijamin konsisten',
            'Basis data yang mengurus urutan dan batasnya',
          ],
        },
        {
          title: 'Sesudah sharding',
          lang: 'js',
          code: `
            // 1. Cari tulisannya. Shard-nya ditentukan penulisnya.
            const tulisan = await shardUntuk(penulisId).tulisan.cariSlug(slug);

            // 2. Komentar berada di shard masing-masing penulisnya.
            //    Karena itu daftar komentar per tulisan didenormalisasi
            //    ke shard tulisan itu saat komentar dibuat.
            const komentar = await shardUntuk(penulisId).komentar.untukTulisan(tulisan.id, 50);

            // 3. Nama penulis komentar sudah disalin ke barisnya,
            //    supaya tidak perlu mengunjungi shard lain hanya untuk nama.
            return komentar; // sudah memuat penulis_nama
          `,
          notes: [
            'Nama penulis disalin ke baris komentar',
            'Mengganti nama berarti memperbarui salinannya',
            'Kebenarannya kini menjadi tanggung jawab aplikasi',
          ],
        },
      ),
      p(
        'Panel kanan memperlihatkan biaya sesungguhnya. Sebuah pertanyaan yang tadinya satu perintah SQL menjadi tiga keputusan rancangan, satu di antaranya menyalin data dan menciptakan kewajiban menjaganya tetap sejalan. Dikalikan ke seluruh pertanyaan pada aplikasi, inilah yang membuat sharding memakan waktu berbulan-bulan.',
      ),

      h2('Menerbitkan id yang unik tanpa satu penghitung'),
      p(
        'Kolom `BIGSERIAL` bekerja karena ada satu penghitung di satu basis data. Dengan beberapa shard, penghitung itu tidak lagi tunggal, sehingga dua shard bisa menerbitkan angka yang sama.',
      ),
      table(
        ['Cara', 'Bentuk', 'Kelebihan', 'Kekurangan'],
        [
          [
            'UUID acak',
            '128 bit acak',
            'Tanpa koordinasi sama sekali',
            'Besar, dan urutannya acak sehingga index memburuk',
          ],
          [
            'UUID versi 7',
            'Waktu di depan, acak di belakang',
            'Terurut menurut waktu, tanpa koordinasi',
            'Tetap 128 bit',
          ],
          [
            'Snowflake',
            '64 bit: waktu, mesin, urutan',
            'Kecil dan terurut waktu',
            'Butuh id mesin yang unik dan jam yang selaras',
          ],
          [
            'Rentang per shard',
            'Tiap shard diberi jatah angka',
            'Tetap berupa angka biasa',
            'Ada lompatan, dan jatah harus dibagikan',
          ],
        ],
      ),
      code(
        'text',
        `
        STRUKTUR SNOWFLAKE 64 BIT

        | 1 bit  | 41 bit         | 5 bit      | 5 bit  | 12 bit  |
        | kosong | waktu (ms)     | pusat data | mesin  | urutan  |

        41 bit waktu   : sekitar 69 tahun sejak titik awal yang kamu tentukan
        5 + 5 bit      : sampai 32 pusat data, 32 mesin per pusat data
        12 bit urutan  : sampai 4.096 id per milidetik per mesin
        Total kapasitas: sekitar 4 juta id per detik untuk seluruh sistem
        `,
      ),
      p(
        'Bagian waktu di depan itu penting dan sering luput. Id yang terurut menurut waktu membuat penyisipan ke index selalu terjadi di ujung, sedangkan id acak menyebar penyisipan ke seluruh index dan membuatnya jauh lebih mahal. Inilah alasan UUID versi 7 lebih disukai daripada versi 4 untuk kunci utama.',
      ),
      callout(
        'warning',
        'Snowflake bergantung pada jam yang tidak pernah mundur',
        'Bila jam mesin mundur karena penyelarasan waktu, id yang sama bisa diterbitkan dua kali. Penerapan yang benar mendeteksi jam yang mundur lalu menunggu atau menolak menerbitkan, bukan melanjutkan seolah tidak terjadi apa-apa. Kalau kamu tidak ingin memikirkan hal ini, UUID versi 7 memberi sifat yang mirip tanpa ketergantungan pada jam yang selaras antar mesin.',
      ),

      h2('Menyiapkan diri tanpa melakukannya sekarang'),
      p(
        'Cara paling bijak menghadapi sharding adalah membuat sistemmu mudah di-shard nanti, tanpa membayar biayanya hari ini. Empat kebiasaan berikut hampir gratis dan sangat berharga bila hari itu tiba.',
      ),
      ol(
        '**Sertakan calon shard key di setiap tabel.** Kolom `pengguna_id` di tabel komentar tidak memberatkan apa pun sekarang, dan ia adalah syarat mutlak nanti.',
        '**Pakai id yang unik secara global sejak awal.** UUID versi 7 sebagai kunci utama menghilangkan seluruh urusan penerbitan id di kemudian hari.',
        '**Hindari `JOIN` yang melintasi calon batas shard di jalur panas.** Kalau sebuah pertanyaan sudah sekarang menyeberang, ia akan menjadi masalah nanti.',
        '**Kumpulkan akses data di satu lapisan.** Ketika seluruh query melewati satu tempat, memasukkan pemilihan shard berarti mengubah satu lapisan, bukan seluruh kode.',
      ),
      p(
        'Kebiasaan keempat menyambung langsung ke arsitektur berlapis yang dibahas di sub-bab [arsitektur berlapis](/kelas/backend-intermediate/express-intermediate/arsitektur-berlapis). Aplikasi yang memanggil basis data dari mana saja akan sangat mahal di-shard, sedangkan aplikasi yang punya lapisan akses data yang jelas menjadi jauh lebih murah.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Sharding membagi satu tabel ke beberapa mesin, dan keputusan yang menentukan seluruh nasibnya diambil di awal, yaitu memilih shard key. Keputusan itu sangat mahal diubah setelah datanya besar.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, sebaran 100.000 baris ke 4 shard:

        SHARD KEY = kode negara (70% pengguna dari satu negara):
          shard 0: 70.000 baris
          shard 1: 10.000 baris
          shard 2: 10.000 baris
          shard 3: 10.000 baris

        SHARD KEY = id pengguna:
          shard 0: 24.946    shard 1: 24.893
          shard 2: 25.122    shard 3: 25.039

        Shard key yang pertama menghasilkan satu mesin yang menanggung
        tujuh kali lipat beban tiga lainnya, dan menambah mesin
        kelima tidak menolong sama sekali.
        `,
        {
          caption:
            'Sharding membagi data. Ia tidak membagi ketidakseimbangan yang sudah ada di dalam kuncinya.',
        },
      ),
      p(
        'Cara memetakan kunci ke shard juga menentukan apa yang terjadi saat jumlah shard berubah, dan selisihnya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, 100.000 kunci, dari 4 shard menjadi 5:

          modulo sederhana              : 80.229 kunci pindah (80,2%)
          consistent hashing, 200 vnode : 16.769 kunci pindah (16,8%)
          ideal secara teori            : 20.000 kunci pindah (20,0%)

        Dan seberapa rata sebarannya:
          modulo sederhana              : simpangan  0,9%
          consistent hashing, 200 vnode : simpangan  7,8%
          consistent hashing,   1 vnode : simpangan 49,8%

        Modulo memberi sebaran yang hampir sempurna dan redistribusi
        yang menghancurkan. Consistent hashing memberi kebalikannya,
        dan simpul virtual membeli kembali sebagian kerataannya.
        `,
      ),
      p(
        'Selain hash, ada dua cara lain membagi, dan masing-masing cocok untuk pola akses yang berbeda.',
      ),
      table(
        ['Cara', 'Bagaimana membagi', 'Cocok saat', 'Bahayanya'],
        [
          [
            'Hash',
            'hash(kunci) menentukan shard',
            'Akses per entitas, sebaran harus rata',
            'Query rentang menyentuh semua shard',
          ],
          [
            'Rentang',
            'Nilai kunci menentukan shard, misalnya per tanggal',
            'Query rentang sering dipakai',
            'Hotspot: shard terbaru menerima seluruh penulisan',
          ],
          [
            'Direktori',
            'Tabel pemetaan kunci ke shard',
            'Perlu memindahkan entitas tertentu',
            'Tabel pemetaannya menjadi titik kegagalan tunggal',
          ],
        ],
      ),
      p(
        'Baris kedua pantas ditegaskan karena ia jebakan yang sangat umum. Membagi per tanggal terlihat rapi dan membuat seluruh penulisan hari ini mendarat di satu shard yang sama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan sharding jarang berupa error dari basis data. Lebih sering ia berupa query yang tiba-tiba menjadi sangat mahal atau sangat rumit.',
      ),
      code(
        'text',
        `
        1. Query tanpa shard key

           SELECT * FROM pesanan WHERE status = 'menunggu';

           Shard key-nya pelanggan_id, dan query ini tidak memuatnya.
           Ia harus dikirim ke SEMUA shard, hasilnya dikumpulkan,
           lalu digabung di aplikasi.

           Akibatnya, dihitung dari angka latensi yang diukur:
             1 shard  -> 1 panggilan
             16 shard -> 16 panggilan
             dan p99-nya ditentukan shard yang PALING LAMBAT,
             bukan rata-ratanya

           Bila p99 tiap shard 1%, peluang setidaknya satu kena ekor:
             1 - 0,99^16 = 14,9%

        2. JOIN lintas shard

           Tidak ada. Dua tabel yang shard key-nya berbeda tidak bisa
           digabung di basis data. Penggabungannya pindah ke aplikasi,
           dan itu berarti N+1 lewat jaringan.

        3. Transaksi lintas shard

           Juga tidak ada, kecuali dengan protokol dua fase yang
           jauh lebih lambat dan punya mode kegagalannya sendiri.

           Karena itu shard key sering dipilih supaya entitas yang
           HARUS berubah bersamaan berada di shard yang sama.

        4. UNIQUE lintas shard

           UNIQUE(surel) hanya berlaku PER SHARD. Dua pengguna dengan
           surel yang sama bisa lahir di shard berbeda, dan tidak ada
           yang mencegahnya.
        `,
      ),
      p('Kegagalan kelima adalah yang paling mahal, yaitu memilih shard key yang ternyata salah.'),
      code(
        'text',
        `
        Mengubah shard key berarti MEMINDAHKAN SELURUH DATA.

        Dihitung dengan angka yang sudah diukur:
          283 byte per baris
          1 tahun @ 100 juta baris/hari -> 10,3 TB

        Memindahkan 10,3 TB sambil sistemnya tetap melayani adalah
        pekerjaan berminggu-minggu, dengan penulisan ganda, backfill
        bertahap, dan pembacaan yang bisa jatuh ke dua tempat.

        Karena itu pertanyaan sebelum memilih shard key:
          - apakah sebarannya rata? (diukur, bukan dikira)
          - apakah query yang paling sering MEMUAT kunci ini?
          - apakah entitas yang harus berubah bersamaan berada
            di shard yang sama?
          - apakah ada nilai yang jauh lebih sering muncul?
        `,
        {
          caption:
            'Pertanyaan terakhir yang paling sering dilewatkan, dan yang paling sering menjadi penyebab hotspot.',
        },
      ),
      code(
        'text',
        `
        DAN SATU LAGI yang sering dilupakan: sharding TIDAK
        menyelesaikan masalah yang bukan masalah ukuran.

        Diukur di bab lain pada project yang sama:
          agregasi GROUP BY 1.000.000 baris   468,922 ms
          kolom denormalisasi berindeks         0,068 ms

          paginasi OFFSET di halaman jauh        1,51 ms
          keyset pagination                      0,01 ms

        Bila query-nya lambat karena tidak berindeks, memecahnya ke
        empat mesin menghasilkan empat query lambat, bukan satu query
        cepat. Perbaiki query-nya dulu.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Sharding adalah keputusan yang paling sulit dibatalkan di seluruh daftar teknik penskalaan, dan paling sering diambil terlalu cepat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih shard key tanpa mengukur sebarannya',
            'Nilainya kan beragam',
            'Diukur, shard key kode negara menghasilkan 70.000 melawan 10.000 baris',
          ],
          [
            'Membagi per tanggal',
            'Rapi dan mudah dipahami',
            'Seluruh penulisan hari ini mendarat di satu shard. Shard lain menganggur',
          ],
          [
            'Memakai modulo untuk memetakan ke shard',
            'Sederhana dan sebarannya rata',
            'Diukur, 80,2% data harus pindah saat satu shard ditambah',
          ],
          [
            'Mengandalkan `UNIQUE` setelah sharding',
            'Constraint-nya kan ada',
            '`UNIQUE` hanya berlaku per shard. Dua surel yang sama bisa lahir di shard berbeda',
          ],
          [
            'Melakukan sharding untuk query yang lambat',
            'Bebannya kan terbagi',
            'Diukur, query yang lambat karena tidak berindeks tetap lambat, hanya menjadi empat query lambat',
          ],
          [
            'Melakukan sharding sebelum benar-benar perlu',
            'Nanti pasti dibutuhkan',
            'JOIN, transaksi, dan UNIQUE lintas shard hilang. Naik kelas dan replika baca dulu',
          ],
        ],
      ),
      p(
        'Ada satu tanda yang cukup andal bahwa sharding memang sudah saatnya, dan ia bukan tentang jumlah pengguna. Tandanya adalah satu tabel yang sudah tidak muat di mesin terbesar yang tersedia, atau laju penulisan yang melampaui kemampuan satu primary meski query-nya sudah diperbaiki. Sebelum salah satu dari keduanya benar-benar terjadi, hampir setiap masalah yang terlihat menuntut sharding sebenarnya menuntut indeks, denormalisasi, atau replika baca.',
      ),
      references(
        {
          label: 'PostgreSQL: Table Partitioning',
          href: 'https://www.postgresql.org/docs/current/ddl-partitioning.html',
          source: 'PostgreSQL',
          note: 'Alternatif yang harus dicoba sebelum sharding sungguhan.',
        },
        {
          label: 'MongoDB: Choose a Shard Key',
          href: 'https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/',
          source: 'MongoDB',
          note: 'Panduan resmi syarat shard key, termasuk kardinalitas dan sebaran.',
        },
        {
          label: 'Cassandra: Partition key and clustering key',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/data_modeling/data_modeling_conceptual.html',
          source: 'Apache Cassandra',
          note: 'Contoh model yang memaksa pola pertanyaan diputuskan sebelum tabelnya dibuat.',
        },
        {
          label: 'PostgreSQL: UUID Type',
          href: 'https://www.postgresql.org/docs/current/datatype-uuid.html',
          source: 'PostgreSQL',
          note: 'Tipe UUID sebagai kunci utama yang unik tanpa koordinasi.',
        },
      ),
    ],
  ),

  written(
    'hotspot-lintas-shard',
    'Hotspot dan Operasi Lintas Shard',
    19,
    'Dua masalah yang muncul sesudah sharding, dan tidak hilang dengan menambah shard.',
    [
      p(
        'Sharding yang dirancang dengan baik pun akan bertemu dua masalah yang tidak bisa diselesaikan dengan menambah shard. Masalah pertama, satu entitas bisa jauh lebih sibuk daripada yang lain. Masalah kedua, ada pertanyaan yang tidak bisa dijawab satu shard sendirian.',
      ),
      p(
        'Keduanya adalah harga yang dibayar sharding, dan keduanya punya jawaban yang sudah dikenal. Yang penting adalah mengenalinya sejak merancang, bukan menemukannya setelah datanya sudah terbagi.',
      ),

      terms(
        {
          term: 'hotspot',
          meaning:
            'Shard yang menerima porsi beban jauh lebih besar daripada shard lain. Bisa disebabkan pembagian yang timpang, atau oleh satu entitas yang memang sangat populer. Gejalanya khas, yaitu satu shard mendekati batasnya sementara shard lain menganggur.',
        },
        {
          term: 'celebrity problem',
          meaning:
            'Bentuk khusus hotspot ketika satu entitas punya popularitas yang jauh melampaui yang lain, misalnya akun dengan sepuluh juta pengikut. Setiap tindakan pada entitas itu menimbulkan beban besar pada shard yang memegangnya, dan tidak ada shard key yang bisa mencegahnya.',
        },
        {
          term: 'scatter-gather',
          meaning:
            'Menjalankan satu pertanyaan ke semua shard lalu menggabungkan hasilnya. Latensinya ditentukan shard paling lambat, bukan rata-rata, sehingga semakin banyak shard semakin besar peluang bertemu shard yang sedang tersendat.',
        },
        {
          term: 'saga pattern',
          meaning:
            'Cara menjalankan rangkaian operasi lintas beberapa penyimpanan tanpa transaksi tunggal, yaitu tiap langkah punya langkah pembatal. Bila langkah ketiga gagal, langkah dua dan satu dibatalkan dengan operasi kebalikannya. Hasilnya bukan atomik, melainkan konsisten pada akhirnya.',
        },
        {
          term: 'pre-aggregation',
          meaning:
            'Menyimpan hasil penjumlahan atau perhitungan lebih dulu sehingga pembacaannya tidak perlu menyentuh seluruh data. Ini jawaban utama untuk pertanyaan agregasi pada sistem yang di-shard, karena `COUNT` dan `SUM` lintas shard sangat mahal.',
        },
        {
          term: 'sub-partition',
          meaning:
            'Memecah data satu entitas panas menjadi beberapa bagian yang tersebar, misalnya dengan menambahkan angka acak ke shard key-nya. Menyebarkan bebannya, dengan harga pembacaan harus mengumpulkan kembali seluruh bagian itu.',
        },
      ),

      h2('Hotspot karena pembagian yang timpang'),
      p(
        'Bentuk paling mudah dikenali, dan biasanya berasal dari shard key yang kardinalitasnya rendah atau sebarannya tidak merata.',
      ),
      code(
        'text',
        `
        Shard key: paket_langganan

        shard 0 (gratis)     : 4.800.000 pengguna   96 persen beban
        shard 1 (pro)        :   180.000 pengguna
        shard 2 (bisnis)     :    20.000 pengguna

        Sharding sudah dilakukan, dan tidak ada yang terselesaikan.
        `,
      ),
      p(
        'Kesalahan ini terlihat jelas dari luar dan sangat mudah dilakukan dari dalam, karena membagi menurut paket terasa rapi secara organisasi. Pencegahannya adalah syarat pada sub-bab sebelumnya, yaitu shard key harus berkardinalitas tinggi dan sebarannya merata. Bila kamu ingin memisahkan pelanggan besar, jawabannya adalah pembagian berbasis direktori, bukan menjadikan paket sebagai kunci.',
      ),
      p(
        'Cara memeriksanya sebelum terlambat adalah dengan menghitung sebarannya pada data yang sudah ada.',
      ),
      code(
        'sql',
        `
        -- Simulasikan pembagian sebelum benar-benar membagi.
        SELECT
          abs(hashtext(pengguna_id::text)) % 8 AS calon_shard,
          count(*) AS jumlah_baris,
          round(100.0 * count(*) / sum(count(*)) OVER (), 2) AS persen
        FROM komentar
        GROUP BY 1
        ORDER BY 1;
        `,
        {
          caption:
            'Bila ada baris yang persennya jauh di atas yang lain, shard key-nya belum benar.',
        },
      ),

      h2('Hotspot karena satu entitas yang sangat populer'),
      p(
        'Bentuk kedua tidak bisa dicegah shard key mana pun. Kunci `pengguna_id` menyebar pengguna dengan sempurna, dan tetap saja akun dengan sepuluh juta pengikut akan membuat shard yang memegangnya jauh lebih sibuk.',
      ),
      table(
        ['Cara', 'Bagaimana', 'Cocok ketika'],
        [
          [
            'Cache di depan',
            'Data yang panas dilayani cache, bukan shard',
            'Bebannya membaca, dan datanya jarang berubah',
          ],
          [
            'Shard tersendiri',
            'Entitas panas dipindahkan ke shardnya sendiri',
            'Jumlah entitas panas sedikit dan bisa dikenali',
          ],
          [
            'Sub-partition',
            'Data satu entitas dipecah dengan akhiran acak',
            'Bebannya menulis, dan penulisannya sangat banyak',
          ],
          [
            'Jalur kode terpisah',
            'Entitas panas ditangani dengan cara berbeda',
            'Bila perbedaannya sangat besar, misalnya fanout linimasa',
          ],
        ],
      ),
      code(
        'js',
        `
        // Sub-partition: sebarkan penulisan satu entitas panas ke 16 bagian.
        const JUMLAH_BAGIAN = 16;

        function kunciTulis(entitasId) {
          const bagian = Math.floor(Math.random() * JUMLAH_BAGIAN);
          return entitasId + '#' + bagian;
        }

        // Membaca berarti mengumpulkan seluruh bagian dan menggabungkannya.
        async function bacaSeluruhBagian(entitasId) {
          const bagian = await Promise.all(
            Array.from({ length: JUMLAH_BAGIAN }, (_, i) =>
              shardUntuk(entitasId + '#' + i).ambil(entitasId + '#' + i),
            ),
          );
          return gabungkan(bagian);
        }
        `,
      ),
      p(
        'Pertukarannya terlihat jelas pada dua fungsi itu. Penulisan menjadi enam belas kali lebih tersebar, dan pembacaan menjadi enam belas kali lebih mahal. Karena itu sub-partition hanya masuk akal ketika bebannya memang menulis, misalnya penghitung yang dinaikkan sangat sering, dan tidak masuk akal untuk data yang lebih sering dibaca.',
      ),
      p(
        'Cara paling praktis mengenali entitas panas adalah dengan mencatat beban per entitas, lalu memberi jalur khusus pada yang melewati ambang tertentu. Pendekatan ini dipakai di sub-bab [studi kasus linimasa](/kelas/system-design/keandalan-studi-kasus/studi-kasus-linimasa), tempat akun dengan pengikut sangat banyak sengaja ditangani dengan cara yang berbeda dari akun biasa.',
      ),

      h2('Pertanyaan yang menyentuh semua shard'),
      p(
        'Sebagian pertanyaan tidak bisa dijawab satu shard karena jawabannya memang tersebar. Ketiga bentuk berikut yang paling sering muncul.',
      ),
      table(
        ['Pertanyaan', 'Kenapa mahal', 'Jawaban yang dipakai'],
        [
          [
            '"Tulisan terbaru dari semua orang"',
            'Harus bertanya ke semua shard lalu mengurutkan',
            'Summary table global, atau indeks pencarian',
          ],
          [
            '"Berapa jumlah pengguna aktif"',
            'Menjumlahkan seluruh shard',
            'Penghitung yang dijaga terpisah, diperbarui saat ada perubahan',
          ],
          [
            '"Cari pengguna dengan email ini"',
            'Emailnya bukan shard key',
            'Tabel pemetaan email ke shard',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah pola yang sangat umum dan layak dijelaskan. Ketika shard key-nya `pengguna_id`, pencarian berdasarkan email tidak tahu harus bertanya ke mana. Jawabannya adalah satu tabel kecil yang memetakan email ke id, dan tabel itu diletakkan di tempat yang bisa dijangkau semua shard.',
      ),
      code(
        'js',
        `
        // Tabel pemetaan kecil, dibaca sangat sering, sangat jarang berubah.
        // Sempurna untuk di-cache.
        async function cariPenggunaLewatEmail(email) {
          const kunci = 'email-ke-id:v1:' + email.toLowerCase();

          let penggunaId = await redis.get(kunci);
          if (penggunaId === null) {
            const baris = await dbGlobal.pemetaanEmail.cari(email.toLowerCase());
            if (baris === null) return null;
            penggunaId = String(baris.pengguna_id);
            await redis.set(kunci, penggunaId, 'EX', 3_600);
          }

          return shardUntuk(penggunaId).pengguna.cari(penggunaId);
        }
        `,
        { caption: 'Satu pembacaan cache menggantikan pertanyaan ke seluruh shard.' },
      ),
      p(
        'Tabel pemetaan ini sekaligus menjawab satu hal lain yang hilang saat sharding, yaitu batasan `UNIQUE` global. Karena email hanya boleh muncul sekali di tabel pemetaan, dan tabel itu berada di satu basis data, batasan `UNIQUE` di sana kembali menjadi jaminan yang sungguhan.',
      ),

      h2('Ketika scatter-gather tidak bisa dihindari'),
      p(
        'Kadang tidak ada jalan lain, misalnya pada halaman administrasi yang memang menjelajahi seluruh data. Bila terpaksa, tiga aturan berikut membuatnya tidak berubah menjadi sumber pemadaman.',
      ),
      ol(
        '**Jalankan serentak, bukan berurutan.** Bertanya ke delapan shard satu per satu berarti menjumlahkan delapan latensi.',
        '**Beri timeout per shard.** Satu shard yang tersendat tidak boleh menahan seluruh jawaban.',
        '**Sajikan hasil sebagian bila ada yang gagal**, dan katakan kepada pengguna bahwa hasilnya belum lengkap.',
      ),
      code(
        'js',
        `
        const BATAS_MS = 2_000;

        async function cariDiSemuaShard(pertanyaan) {
          const hasil = await Promise.allSettled(
            semuaShard.map((shard) =>
              Promise.race([
                shard.cari(pertanyaan),
                new Promise((_, tolak) =>
                  setTimeout(() => tolak(new Error('timeout shard')), BATAS_MS),
                ),
              ]),
            ),
          );

          const berhasil = hasil.filter((h) => h.status === 'fulfilled');
          const gagal = hasil.length - berhasil.length;

          if (gagal > 0) {
            metrics.increment('scatter.shard_gagal', { jumlah: gagal });
            logger.warn({ gagal, total: hasil.length }, 'sebagian shard tidak menjawab');
          }

          return {
            data: berhasil.flatMap((h) => h.value),
            lengkap: gagal === 0,
            shardTidakMenjawab: gagal,
          };
        }
        `,
        {
          caption:
            'Bidang `lengkap` pada hasil membuat antarmuka bisa jujur ketika datanya belum utuh.',
        },
      ),
      p(
        'Pemakaian `Promise.allSettled` alih-alih `Promise.all` adalah keputusan yang menentukan. Dengan `Promise.all`, satu shard yang gagal membatalkan seluruhnya, sehingga tujuh shard yang berhasil menjawab menjadi sia-sia. Dengan `allSettled`, kegagalan sebagian tetap menghasilkan sesuatu yang berguna.',
      ),

      h2('Transaksi yang menyentuh dua shard'),
      p(
        'Pemindahan saldo antar dua pengguna yang berada di shard berbeda tidak bisa dilakukan dalam satu transaksi. Ada tiga pendekatan, dan yang pertama hampir selalu paling baik.',
      ),
      table(
        ['Pendekatan', 'Bagaimana', 'Catatan'],
        [
          [
            'Hindari sejak rancangan',
            'Letakkan data yang selalu berubah bersama pada shard yang sama',
            'Selalu coba ini dulu',
          ],
          [
            'Saga pattern',
            'Rangkaian langkah, masing-masing punya pembatal',
            'Tidak atomik, dan ada jendela ketika keadaannya setengah jalan',
          ],
          [
            'Komit dua fase',
            'Semua peserta bersiap, lalu semua komit',
            'Lambat, dan menggantung bila koordinatornya mati',
          ],
        ],
      ),
      code(
        'text',
        `
        SAGA PEMINDAHAN SALDO

        1. Kurangi saldo A, catat "pemindahan #123 tahap potong"   -> berhasil
        2. Tambah saldo B, catat "pemindahan #123 tahap tambah"    -> GAGAL
        3. Jalankan pembatal langkah 1: kembalikan saldo A
        4. Tandai pemindahan #123 sebagai gagal

        Ada jendela di antara langkah 1 dan 3 ketika uangnya seolah hilang.
        Karena itu setiap langkah dicatat, sehingga keadaannya selalu bisa dijelaskan
        dan pemulihannya bisa dijalankan ulang bila prosesnya mati di tengah.
        `,
      ),
      callout(
        'tip',
        'Pilihan pertama hampir selalu yang terbaik',
        'Sebagian besar kebutuhan transaksi lintas shard sebenarnya bisa dihilangkan lewat rancangan. Bila dua entitas selalu berubah bersama, keduanya sebaiknya berbagi shard key sehingga berada di shard yang sama. Menempatkan seluruh akun dalam satu penyewa pada shard yang sama menghilangkan hampir semua transaksi lintas shard pada aplikasi berlangganan.',
      ),

      h2('Ringkasan'),
      table(
        ['Masalah', 'Gejalanya', 'Jawaban utamanya'],
        [
          [
            'Pembagian timpang',
            'Satu shard jauh lebih besar sejak awal',
            'Ganti shard key, atau pakai direktori',
          ],
          [
            'Entitas selebritas',
            'Satu shard sibuk padahal pembagiannya merata',
            'Cache, shard tersendiri, atau jalur kode terpisah',
          ],
          [
            'Pertanyaan lintas shard',
            'Halaman tertentu jauh lebih lambat',
            'Summary table, indeks pencarian, atau tabel pemetaan',
          ],
          ['Agregasi', '`COUNT` dan `SUM` menjadi sangat mahal', 'Penghitung yang dijaga terpisah'],
          [
            'Transaksi lintas shard',
            'Data bisa setengah jalan',
            'Rancang agar sebaris shard, atau pakai saga yang tercatat',
          ],
        ],
      ),
      p(
        'Perhatikan bahwa hampir semua jawabannya melibatkan menyimpan data lebih dari sekali dalam bentuk yang berbeda. Itu bukan kebetulan, melainkan pola utama yang muncul begitu data terbagi, dan pola itu punya nama serta aturannya sendiri. Sub-bab penutup bab ini membahasnya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Hotspot adalah keadaan ketika sebagian kecil data menerima sebagian besar lalu lintas. Sharding membagi data, dan ia tidak membagi ketimpangan yang sudah ada di dalam kuncinya.',
      ),
      code(
        'text',
        `
        Diukur sungguhan, sebaran 100.000 baris ke 4 shard:

        SHARD KEY = kode negara (70% pengguna dari satu negara):
          shard 0: 70.000    shard 1: 10.000
          shard 2: 10.000    shard 3: 10.000

        SHARD KEY = id pengguna:
          shard 0: 24.946    shard 1: 24.893
          shard 2: 25.122    shard 3: 25.039

        Menambah shard kelima pada kasus pertama TIDAK menolong:
        70.000 baris itu tetap mendarat di satu tempat, sebab
        kuncinya memang hanya punya satu nilai untuk semuanya.
        `,
      ),
      p(
        'Selain hotspot data, ada hotspot **akses**, dan itu lebih sulit ditutup sebab ia tidak terlihat dari sebaran barisnya.',
      ),
      code(
        'text',
        `
        Sebaran barisnya rata sempurna:
          shard 0: 25.000   shard 1: 25.000
          shard 2: 25.000   shard 3: 25.000

        Dan lalu lintasnya tidak:
          satu akun selebritas dengan 40 juta pengikut berada di
          shard 2. Setiap unggahannya menghasilkan jutaan pembacaan
          ke satu baris di satu shard.

        Tidak ada shard key yang menyelesaikannya, sebab masalahnya
        bukan pembagian melainkan bahwa satu baris memang jauh lebih
        populer daripada yang lain.

        Yang menolong:
          - cache di depan shard itu, dengan penggabungan permintaan
          - SALIN data panas itu ke beberapa tempat
          - pisahkan baris yang sangat panas ke penanganan khusus
        `,
        {
          caption:
            'Diukur di bab Desain API: 50 permintaan bersamaan untuk satu kunci menghasilkan 50 perhitungan tanpa penggabungan, 1 dengan.',
        },
      ),
      p(
        'Hotspot penulisan punya bentuknya sendiri, dan biayanya bisa diukur bahkan pada satu mesin.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada PostgreSQL 16.15:

          2.000 UPDATE ke BARIS YANG SAMA    : 459 ms
          2.000 UPDATE ke baris BERBEDA      :  29 ms

        Selisihnya ~16 kali, pada satu mesin, tanpa jaringan sama
        sekali. Penyebabnya pertentangan pada baris itu: setiap
        penulisan harus menunggu yang sebelumnya, dan setiap versi
        baris yang lama harus dibersihkan.

        Pada penghitung yang sangat panas, bentuk yang lazim adalah
        memecahnya:
          alih-alih satu baris penghitung,
          pakai 100 baris "pecahan" yang dipilih acak saat menulis,
          dan jumlahkan saat membaca.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Operasi lintas shard adalah tempat kerumitan sharding benar-benar terasa, dan biayanya bisa dihitung dari angka latensi.',
      ),
      code(
        'text',
        `
        1. Query tanpa shard key harus menyentuh SEMUA shard

           SELECT * FROM pesanan WHERE status = 'menunggu' LIMIT 20;

           Dengan 16 shard, itu 16 panggilan. Dan p99-nya ditentukan
           shard PALING LAMBAT, bukan rata-ratanya.

           Dihitung: bila p99 tiap shard 1%, peluang setidaknya satu
           kena ekor adalah 1 - 0,99^16 = 14,9%.

           Artinya hampir 1 dari 7 permintaan merasakan latensi ekor,
           meski tiap shard hanya 1%.

        2. Paginasi lintas shard

           "20 pesanan terbaru dari seluruh sistem"

           Tidak bisa meminta 20 dari tiap shard lalu ambil 20 teratas
           — itu benar hanya untuk halaman pertama. Untuk halaman ke-50,
           setiap shard harus mengirim 1.000 baris, dan 15.980 di
           antaranya dibuang.

           Diukur di bab Desain API pada satu basis data saja, OFFSET
           di halaman jauh sudah 1,51 ms melawan 0,01 ms untuk keyset.
           Lintas shard, biayanya dikalikan jumlah shard.

        3. Agregasi lintas shard

           COUNT, SUM, dan AVG harus dihitung per shard lalu digabung.
           Untuk AVG, menggabungkan rata-rata dari tiap shard SALAH
           kecuali jumlah barisnya sama — yang harus dikirim adalah
           jumlah dan hitungannya, lalu dibagi di akhir.

        4. Transaksi lintas shard

           Tidak ada, kecuali dengan protokol dua fase. Dan protokol
           itu punya keadaan tergantung sendiri: bila koordinatornya
           mati sesudah fase pertama, shard-nya menahan kunci sampai
           ada yang memutuskan.
        `,
      ),
      p(
        'Kegagalan kelima menyangkut apa yang terjadi ketika satu shard mati, dan ini yang paling sering tidak dirancang.',
      ),
      code(
        'text',
        `
        Satu dari 16 shard mati.

          Bila setiap permintaan menyentuh SEMUA shard:
            -> 100% permintaan gagal

          Bila setiap permintaan menyentuh SATU shard:
            -> 6,25% permintaan gagal, sisanya baik-baik saja

        Selisih itu ditentukan oleh shard key dan pola query, bukan
        oleh keandalan shard-nya.

        Dan bentuk yang lebih baik lagi: permintaan yang menyentuh
        semua shard bisa menjawab SEBAGIAN, dengan menyatakan bahwa
        hasilnya tidak lengkap, alih-alih gagal seluruhnya.
        `,
        {
          caption:
            'Kemampuan menjawab sebagian adalah keputusan rancangan, dan ia harus ada sejak awal di bentuk responsnya.',
        },
      ),
      code(
        'text',
        `
        DAN SATU LAGI: penyeimbangan ulang yang dilakukan saat sibuk.

        Memindahkan data antar shard memakai kapasitas jaringan dan
        disk yang sama dengan yang dipakai melayani permintaan.
        Menjalankannya saat jam puncak berarti memperburuk keadaan
        yang justru ingin diperbaiki.

        Yang menutupnya: pemindahan bertahap dengan batas laju, dan
        dijadwalkan pada jam sepi — bukan dijalankan sebagai reaksi
        terhadap beban yang sedang tinggi.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hotspot dan operasi lintas shard adalah dua biaya yang baru terasa setelah sharding-nya berjalan, dan keduanya ditentukan oleh keputusan yang diambil sebelum itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memilih shard key tanpa memeriksa nilai yang dominan',
            'Nilainya kan beragam',
            'Diukur, 70% baris mendarat di satu shard. Menambah shard tidak menolong sama sekali',
          ],
          [
            'Menganggap sebaran baris yang rata berarti beban rata',
            'Barisnya kan terbagi sama',
            'Hotspot AKSES tidak terlihat dari sebaran baris. Satu baris populer tetap di satu shard',
          ],
          [
            'Memakai satu baris sebagai penghitung yang sangat panas',
            'Satu baris, satu angka',
            'Diukur, 2.000 UPDATE ke baris sama 459 ms melawan 29 ms ke baris berbeda',
          ],
          [
            'Menjalankan query tanpa shard key',
            'Query-nya kan valid',
            'Ia menyentuh semua shard, dan p99-nya ditentukan yang paling lambat. Dihitung, 14,9% kena ekor pada 16 shard',
          ],
          [
            'Menggabungkan rata-rata dari tiap shard',
            'Rata-rata dari rata-rata kan sama',
            'Salah kecuali jumlah barisnya sama. Kirim jumlah dan hitungannya, bagi di akhir',
          ],
          [
            'Tidak merancang perilaku saat satu shard mati',
            'Shard-nya kan andal',
            'Bila tiap permintaan menyentuh semua shard, satu shard mati berarti 100% permintaan gagal',
          ],
        ],
      ),
      p(
        'Perhitungan yang paling mengubah cara pandang di sub-bab ini adalah yang terakhir. Satu shard dari enam belas yang mati bisa berarti 6,25% permintaan gagal atau 100% permintaan gagal, dan yang menentukan bukan keandalan shard-nya melainkan apakah query-mu memuat shard key. Keputusan yang terlihat sebagai urusan performa itu ternyata adalah keputusan ketersediaan, dan ia diambil pada hari shard key dipilih.',
      ),
      references(
        {
          label: 'MongoDB: Sharded Cluster Query Router',
          href: 'https://www.mongodb.com/docs/manual/core/sharded-cluster-query-router/',
          source: 'MongoDB',
          note: 'Cara pertanyaan diarahkan ke satu shard atau disebar ke semuanya.',
        },
        {
          label: 'MongoDB: Troubleshoot Shard Keys',
          href: 'https://www.mongodb.com/docs/manual/core/sharding-troubleshooting/',
          source: 'MongoDB',
          note: 'Gejala pembagian timpang beserta cara mengenalinya.',
        },
        {
          label: 'PostgreSQL: Aggregate Functions',
          href: 'https://www.postgresql.org/docs/current/functions-aggregate.html',
          source: 'PostgreSQL',
          note: 'Fungsi agregasi yang menjadi mahal begitu datanya tersebar.',
        },
        {
          label: 'Cassandra: Data modeling for queries',
          href: 'https://cassandra.apache.org/doc/stable/cassandra/data_modeling/data_modeling_queries.html',
          source: 'Apache Cassandra',
          note: 'Contoh sistem yang memang mengharuskan tabel dibuat per bentuk pertanyaan.',
        },
      ),
    ],
  ),

  written(
    'denormalisasi',
    'Denormalisasi dan Summary Table',
    19,
    'Menyimpan data lebih dari sekali dengan sengaja, dan kewajiban yang menyertainya.',
    [
      p(
        'Bab basis data mengajarkan normalisasi, yaitu menyimpan setiap fakta tepat satu kali agar tidak mungkin ada dua versi yang berbeda. Sub-bab ini membahas kebalikannya, dan bukan untuk membatalkan pelajaran itu.',
      ),
      p(
        'Normalisasi adalah bentuk bawaan yang benar. Denormalisasi adalah **pengecualian yang diambil dengan sadar** ketika biaya membaca sudah tidak bisa diterima, dan setiap pengecualian membawa kewajiban baru, yaitu menjaga salinan-salinannya tetap sejalan.',
      ),

      terms(
        {
          term: 'denormalisasi',
          meaning:
            'Menyimpan data yang sama di lebih dari satu tempat dengan sengaja, agar pembacaan tidak perlu menggabungkan banyak tabel. Kebalikan dari normalisasi yang dibahas di sub-bab [normalisasi](/kelas/backend-basic/database-sql-dasar/normalisasi). Ditukar dengan penulisan yang lebih rumit dan risiko data yang tidak sejalan.',
        },
        {
          term: 'counter cache',
          meaning:
            'Kolom yang menyimpan hasil hitungan yang seharusnya dihitung dengan `COUNT`, misalnya kolom `jumlah_komentar` pada tabel tulisan. Bentuk denormalisasi yang paling sering dipakai karena `COUNT` atas tabel besar sangat mahal bila dijalankan pada setiap pembacaan.',
        },
        {
          term: 'summary table',
          meaning:
            'Tabel yang berisi hasil perhitungan yang sudah dijumlahkan lebih dulu, misalnya pendapatan per hari. Diisi pekerjaan berkala, dan dibaca sebagai tabel biasa sehingga halaman laporan menjadi ringan.',
        },
        {
          term: 'materialized view',
          meaning:
            'Hasil sebuah query yang benar-benar disimpan sebagai tabel oleh basis data, dan disegarkan atas perintah. Dibaca "materialaized viu". Bedanya dengan view biasa, view biasa menjalankan querynya setiap kali dibaca sedangkan yang ini membaca hasil yang sudah tersimpan.',
        },
        {
          term: 'data drift',
          meaning:
            'Keadaan ketika salinan sebuah data tidak lagi sama dengan aslinya, biasanya karena satu jalur penulisan lupa memperbarui salinannya. Ini risiko utama denormalisasi, dan ia berbahaya karena tidak menimbulkan error, hanya angka yang salah.',
        },
        {
          term: 'reconciliation (rekonsiliasi)',
          meaning:
            'Pekerjaan berkala yang menghitung ulang nilai yang didenormalisasi dari sumber aslinya lalu memperbaiki yang menyimpang. Ini jaring pengaman yang membuat denormalisasi bisa dipercaya dalam jangka panjang.',
        },
      ),

      h2('Kapan denormalisasi dibenarkan'),
      table(
        ['Tanda', 'Contoh', 'Bentuk denormalisasi yang cocok'],
        [
          [
            'Baca jauh lebih banyak daripada tulis',
            'Katalog produk, artikel',
            'Menyalin nilai yang jarang berubah',
          ],
          [
            '`COUNT` dijalankan pada tiap pembacaan',
            'Jumlah komentar di daftar tulisan',
            'Counter cache',
          ],
          ['Join lebih dari empat tabel di jalur panas', 'Dasbor', 'Summary table'],
          [
            'Data sudah di-shard',
            'Nama penulis pada baris komentar',
            'Menyalin agar tidak menyeberang shard',
          ],
          [
            'Nilainya hampir tidak pernah berubah',
            'Nama kategori',
            'Menyalin dengan pekerjaan pembaruan bila berubah',
          ],
        ],
      ),
      p(
        'Perhatikan tidak ada baris yang berbunyi "karena lebih praktis". Denormalisasi selalu membeli kecepatan baca dengan kerumitan tulis, dan pembelian itu hanya masuk akal bila bacanya memang jauh lebih banyak.',
      ),
      callout(
        'danger',
        'Jangan pernah mendenormalisasi data yang menentukan keputusan',
        'Salinan saldo, salinan stok, atau salinan hak akses akan menyimpang cepat atau lambat, dan ketika menyimpang, keputusannya menjadi salah. Untuk data seperti itu, hitung dari sumbernya setiap kali. Denormalisasi hanya untuk yang ditampilkan, bukan untuk yang menentukan.',
      ),

      h2('Bentuk pertama, counter cache'),
      p(
        'Halaman daftar tulisan yang menampilkan jumlah komentar adalah contoh klasiknya. Tanpa penghitung, satu halaman berisi dua puluh tulisan berarti dua puluh `COUNT` atas tabel komentar yang bisa berisi jutaan baris.',
      ),
      compare(
        {
          title: 'Menghitung setiap kali',
          lang: 'sql',
          code: `
            SELECT
              t.id,
              t.judul,
              (SELECT count(*) FROM komentar k WHERE k.tulisan_id = t.id) AS jumlah_komentar
            FROM tulisan t
            ORDER BY t.dibuat_pada DESC
            LIMIT 20;
          `,
          notes: [
            'Selalu tepat',
            '20 penghitungan per pembacaan halaman',
            'Melambat seiring tabel komentar membesar',
          ],
        },
        {
          title: 'Counter cache',
          lang: 'sql',
          code: `
            ALTER TABLE tulisan
              ADD COLUMN jumlah_komentar INTEGER NOT NULL DEFAULT 0;

            SELECT id, judul, jumlah_komentar
            FROM tulisan
            ORDER BY dibuat_pada DESC
            LIMIT 20;
          `,
          notes: [
            'Satu pembacaan sederhana',
            'Kecepatannya tidak berubah seiring data bertambah',
            'Kolomnya harus dijaga oleh setiap jalur yang mengubah komentar',
          ],
        },
      ),
      p(
        'Kewajiban pada catatan terakhir itu yang menentukan berhasil tidaknya. Ada tiga cara menjaganya, dan yang kedua paling tahan terhadap kelalaian.',
      ),
      table(
        ['Cara', 'Bagaimana', 'Kelebihan', 'Kekurangan'],
        [
          [
            'Di kode aplikasi',
            'Setiap tempat yang menyentuh komentar ikut memperbarui kolomnya',
            'Terlihat jelas di kode',
            'Satu jalur yang lupa berarti angka salah selamanya',
          ],
          [
            'Trigger basis data',
            'Basis data yang memperbaruinya otomatis',
            'Tidak mungkin terlewat, termasuk oleh perbaikan manual',
            'Logika tersembunyi dari kode',
          ],
          [
            'Pekerjaan berkala',
            'Hitung ulang seluruhnya secara berkala',
            'Sederhana dan memperbaiki penyimpangan',
            'Angkanya selalu tertinggal',
          ],
        ],
      ),
      code(
        'sql',
        `
        CREATE OR REPLACE FUNCTION jaga_jumlah_komentar() RETURNS TRIGGER AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            UPDATE tulisan SET jumlah_komentar = jumlah_komentar + 1
            WHERE id = NEW.tulisan_id;
          ELSIF TG_OP = 'DELETE' THEN
            UPDATE tulisan SET jumlah_komentar = jumlah_komentar - 1
            WHERE id = OLD.tulisan_id;
          ELSIF TG_OP = 'UPDATE' AND NEW.tulisan_id IS DISTINCT FROM OLD.tulisan_id THEN
            UPDATE tulisan SET jumlah_komentar = jumlah_komentar - 1 WHERE id = OLD.tulisan_id;
            UPDATE tulisan SET jumlah_komentar = jumlah_komentar + 1 WHERE id = NEW.tulisan_id;
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER komentar_jaga_jumlah
        AFTER INSERT OR DELETE OR UPDATE ON komentar
        FOR EACH ROW EXECUTE FUNCTION jaga_jumlah_komentar();
        `,
        {
          caption:
            'Cabang UPDATE menangani kasus yang paling sering dilupakan, yaitu komentar yang dipindahkan.',
        },
      ),
      p(
        'Trigger punya satu kelebihan yang sulit ditandingi, yaitu ia tetap bekerja ketika seseorang menghapus baris lewat perkakas basis data secara langsung. Kelemahannya, logika itu tidak terlihat oleh pembaca kode aplikasi, sehingga keberadaannya harus dicatat di tempat yang dibaca orang.',
      ),
      p(
        'Apa pun cara yang dipilih, sediakan rekonsiliasi. Penyimpangan akan terjadi cepat atau lambat, dan tanpa mekanisme perbaikan angkanya akan salah selamanya.',
      ),
      code(
        'sql',
        `
        -- Rekonsiliasi: hitung ulang dari sumbernya, perbaiki yang menyimpang.
        WITH benar AS (
          SELECT tulisan_id, count(*) AS jumlah
          FROM komentar
          GROUP BY tulisan_id
        )
        UPDATE tulisan t
        SET jumlah_komentar = coalesce(b.jumlah, 0)
        FROM (SELECT id FROM tulisan) semua
        LEFT JOIN benar b ON b.tulisan_id = semua.id
        WHERE t.id = semua.id
          AND t.jumlah_komentar IS DISTINCT FROM coalesce(b.jumlah, 0);
        `,
        {
          caption:
            'Syarat IS DISTINCT FROM membuat perintah ini hanya menyentuh baris yang benar-benar salah.',
        },
      ),

      h2('Bentuk kedua, menyalin nilai yang jarang berubah'),
      p(
        'Menyalin nama penulis ke dalam baris komentar menghilangkan satu join pada setiap pembacaan. Ini pilihan yang wajar ketika nama jarang berubah, dan ia menciptakan kewajiban baru ketika nama itu benar-benar berubah.',
      ),
      code(
        'sql',
        `
        ALTER TABLE komentar
          ADD COLUMN penulis_nama TEXT,
          ADD COLUMN penulis_avatar TEXT;

        -- Isi sekali untuk data yang sudah ada.
        UPDATE komentar k
        SET penulis_nama = p.nama, penulis_avatar = p.avatar
        FROM pengguna p
        WHERE p.id = k.penulis_id;
        `,
      ),
      p('Ketika pengguna mengubah namanya, ada dua pilihan yang keduanya sah tergantung maknanya.'),
      table(
        ['Pilihan', 'Artinya', 'Cocok untuk'],
        [
          [
            'Perbarui seluruh salinan',
            'Nama yang tampil selalu nama terkini',
            'Komentar, tulisan, dan hampir semua tampilan',
          ],
          [
            'Biarkan salinan lama',
            'Salinan itu adalah catatan sejarah',
            'Faktur, kuitansi, dan catatan audit',
          ],
        ],
      ),
      p(
        'Baris kedua sering dilupakan dan justru sangat penting. Nama dan alamat pada sebuah faktur **harus** tetap seperti saat faktur itu terbit, karena faktur adalah catatan tentang apa yang terjadi waktu itu. Menyegarkannya justru merusak maknanya. Pada kasus seperti ini, apa yang terlihat seperti denormalisasi sebenarnya adalah penyimpanan yang benar.',
      ),
      code(
        'js',
        `
        // Perbaruan salinan dijalankan lewat antrean, bukan di jalur permintaan.
        async function ubahNama(penggunaId, namaBaru) {
          await db.pengguna.perbarui(penggunaId, { nama: namaBaru });

          // Bisa menyentuh puluhan ribu baris, jadi tidak boleh menahan respons.
          await antrean.add('segarkan-nama-tersalin', { penggunaId, namaBaru });

          return { berhasil: true };
        }

        worker.process('segarkan-nama-tersalin', async (job) => {
          const { penggunaId, namaBaru } = job.data;

          // Dikerjakan bertahap agar tidak mengunci tabel terlalu lama.
          let tersentuh;
          do {
            tersentuh = await db.raw(
              \`UPDATE komentar SET penulis_nama = $1
                WHERE id IN (
                  SELECT id FROM komentar
                  WHERE penulis_id = $2 AND penulis_nama IS DISTINCT FROM $1
                  LIMIT 1000
                )\`,
              [namaBaru, penggunaId],
            );
          } while (tersentuh > 0);
        });
        `,
        {
          caption:
            'Perulangan seribu baris sekali jalan mencegah satu perintah mengunci tabel selama berjam-jam.',
        },
      ),

      h2('Bentuk ketiga, summary table'),
      p(
        'Halaman laporan yang menjumlahkan jutaan baris tidak boleh menjalankan penjumlahan itu setiap kali dibuka. Jawabannya adalah menyimpan hasilnya lebih dulu.',
      ),
      code(
        'sql',
        `
        CREATE TABLE ringkasan_penjualan_harian (
          tanggal        DATE    PRIMARY KEY,
          jumlah_pesanan INTEGER NOT NULL,
          total_nilai    BIGINT  NOT NULL,
          diperbarui     TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        -- Dijalankan tiap jam. Menghitung ulang hari ini dan kemarin,
        -- karena pesanan kemarin masih bisa berubah statusnya pagi ini.
        INSERT INTO ringkasan_penjualan_harian (tanggal, jumlah_pesanan, total_nilai)
        SELECT
          date_trunc('day', dibuat_pada)::date,
          count(*),
          sum(total)
        FROM pesanan
        WHERE dibuat_pada >= current_date - INTERVAL '1 day'
          AND status = 'lunas'
        GROUP BY 1
        ON CONFLICT (tanggal) DO UPDATE SET
          jumlah_pesanan = excluded.jumlah_pesanan,
          total_nilai    = excluded.total_nilai,
          diperbarui     = now();
        `,
        {
          caption:
            'Menghitung ulang dua hari terakhir, bukan hanya hari ini, menutup perubahan yang datang terlambat.',
        },
      ),
      p(
        'PostgreSQL juga menyediakan bentuk yang lebih ringkas untuk keperluan ini, yaitu materialized view. Perintah penyegarannya bisa dijalankan tanpa mengunci pembaca, sehingga laporan tetap bisa dibuka selama penyegaran berlangsung.',
      ),
      code(
        'sql',
        `
        CREATE MATERIALIZED VIEW ringkasan_penulis AS
        SELECT
          p.id AS penulis_id,
          p.nama,
          count(t.id) AS jumlah_tulisan,
          coalesce(sum(t.jumlah_komentar), 0) AS total_komentar,
          max(t.dibuat_pada) AS tulisan_terakhir
        FROM pengguna p
        LEFT JOIN tulisan t ON t.penulis_id = p.id
        GROUP BY p.id, p.nama;

        -- Index unik ini adalah SYARAT agar penyegaran bisa CONCURRENTLY.
        CREATE UNIQUE INDEX ringkasan_penulis_idx ON ringkasan_penulis (penulis_id);

        -- Menyegarkan tanpa mengunci pembaca.
        REFRESH MATERIALIZED VIEW CONCURRENTLY ringkasan_penulis;
        `,
      ),
      callout(
        'warning',
        'Selalu cantumkan kapan angkanya terakhir dihitung',
        'Halaman laporan yang menampilkan angka tanpa menyebut waktunya akan dibandingkan dengan halaman lain yang menghitung langsung, lalu selisihnya dilaporkan sebagai bug. Satu baris "diperbarui pukul 14.00" menghilangkan seluruh kelas kebingungan itu, dan sekaligus jujur tentang sifat datanya.',
      ),

      h2('Menjaga denormalisasi tetap bisa dipercaya'),
      p(
        'Setiap nilai yang didenormalisasi butuh empat hal ini. Tanpa keempatnya, ia akan menyimpang dan tidak ada yang menyadarinya.',
      ),
      ol(
        '**Satu jalur penulisan yang jelas.** Semua perubahan melewati satu fungsi, bukan tersebar di banyak tempat.',
        '**Rekonsiliasi berkala.** Pekerjaan yang menghitung ulang dari sumbernya dan memperbaiki yang menyimpang.',
        '**Alert atas penyimpangan.** Bila rekonsiliasi menemukan banyak baris yang salah, itu berarti ada jalur penulisan yang bocor.',
        '**Catatan tertulis.** Sebutkan di dekat kodenya bahwa nilai ini adalah salinan, dan sebutkan apa source of truth-nya.',
      ),
      code(
        'js',
        `
        // Rekonsiliasi yang tidak hanya memperbaiki, tetapi juga melapor.
        async function rekonsiliasiJumlahKomentar() {
          const menyimpang = await db.raw(\`
            SELECT t.id, t.jumlah_komentar AS tersimpan, coalesce(b.jumlah, 0) AS benar
            FROM tulisan t
            LEFT JOIN (SELECT tulisan_id, count(*) AS jumlah FROM komentar GROUP BY 1) b
              ON b.tulisan_id = t.id
            WHERE t.jumlah_komentar IS DISTINCT FROM coalesce(b.jumlah, 0)
          \`);

          if (menyimpang.length > 0) {
            metrics.gauge('denormalisasi.menyimpang', menyimpang.length, { kolom: 'jumlah_komentar' });
            logger.warn(
              { jumlah: menyimpang.length, contoh: menyimpang.slice(0, 5) },
              'jumlah_komentar menyimpang, ada jalur tulis yang tidak menjaganya',
            );
          }

          await perbaiki(menyimpang);
          return menyimpang.length;
        }
        `,
      ),
      p(
        'Baris `metrics.gauge` mengubah rekonsiliasi dari sekadar pembersih menjadi **alat deteksi**. Selama angkanya nol, semua jalur penulisan bekerja. Begitu ia melonjak, kamu tahu ada jalur baru yang lupa menjaga salinannya, dan kamu mengetahuinya sebelum ada pengguna yang melaporkan angka yang aneh.',
      ),

      h2('Menutup Bab 3'),
      p(
        'Bab ini menelusuri jalan keluar lapisan data dalam urutan yang benar, yaitu memilih penyimpanan yang cocok dengan pola aksesnya, memperbesar satu mesin sampai batasnya, menambah replika untuk baca dan cadangan, memutuskan konsistensi per data, lalu membagi data hanya ketika penulisannya sendiri sudah tidak muat.',
      ),
      p(
        'Satu benang merah menghubungkan seluruhnya, yaitu setiap langkah menukar sesuatu yang selama ini gratis dengan kapasitas yang lebih besar. Replika menukar kesegaran, sharding menukar join dan transaksi, dan denormalisasi menukar kepastian bahwa sebuah fakta hanya punya satu versi.',
      ),
      p(
        'Bab 4 menutup kategori ini dengan dua hal, yaitu apa yang dibutuhkan agar susunan seperti ini benar-benar bertahan hidup di produksi, dan tiga studi kasus yang memakai seluruh isi tiga bab sebelumnya sekaligus.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Denormalisasi adalah menukar konsistensi otomatis dengan kecepatan baca. Kedua sisi pertukarannya bisa diukur, dan angkanya tajam ke dua arah.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada PostgreSQL 16.15, 200.000 artikel
        dan 1.000.000 komentar.

        SISI YANG DIBELI — sepuluh artikel paling banyak dikomentari:

          dihitung dari tabel komentar (GROUP BY + ORDER)  468,922 ms
          dibaca dari kolom denormalisasi (berindeks)        0,068 ms

          ~6.900 kali lebih cepat.

        SISI YANG DIBAYAR — biaya tiap penulisan komentar,
        2.000 kali masing-masing:

          INSERT komentar SAJA         : 18 ms total, 0,0090 ms/operasi
          INSERT + UPDATE penghitung   : 565 ms total, 0,2825 ms/operasi

          ~31 kali lebih lambat.
        `,
        {
          caption:
            'Baca 6.900 kali lebih cepat, tulis 31 kali lebih lambat. Yang menentukan adalah rasio baca terhadap tulis.',
        },
      ),
      p(
        'Karena itu keputusannya bisa dihitung, bukan dirasakan. Bila satu artikel dibaca seribu kali untuk setiap satu komentar yang masuk, pertukarannya sangat menguntungkan. Bila rasionya satu banding satu, ia merugikan.',
      ),
      p(
        'Ada biaya ketiga yang sering tidak dihitung, yaitu pertentangan pada baris yang sering diperbarui.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          2.000 UPDATE ke BARIS YANG SAMA    : 459 ms
          2.000 UPDATE ke baris BERBEDA      :  29 ms

        ~16 kali lebih lambat, pada satu mesin, tanpa jaringan.

        Artinya kolom penghitung pada artikel yang sangat populer
        menjadi titik pertentangan tersendiri, dan itu terjadi
        justru pada artikel yang paling penting.
        `,
      ),
      p(
        'Dan satu hal yang perlu diperiksa sebelum memutuskan, yaitu apakah query aslinya memang lambat.',
      ),
      code(
        'text',
        `
        Diukur pada tabel yang sama, halaman daftar 20 artikel
        beserta nama penulis dan jumlah komentarnya:

          JOIN + subquery COUNT      0,963 ms
          JOIN + LEFT JOIN LATERAL   0,736 ms

        Di bawah satu milidetik, dengan indeks yang benar, tanpa
        denormalisasi sama sekali.

        Yang mahal bukan JOIN-nya melainkan AGREGASI atas seluruh
        tabel. Untuk 20 baris, indeks sudah menyelesaikannya.

        Denormalisasi berbayar untuk yang KEDUA, bukan yang pertama.
        `,
        {
          caption:
            'Mendenormalisasi query yang sudah 0,7 ms adalah membayar biaya tulis 31 kali lipat tanpa membeli apa pun.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Biaya sesungguhnya dari denormalisasi bukan kecepatan tulis melainkan penyimpangan, dan itu bisa dibuktikan dalam satu operasi.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          penghitung  = 3
          sebenarnya  = 4        <- sudah menyimpang

          -- 2 komentar dihapus TANPA memperbarui penghitung --

          penghitung  = 3
          sebenarnya  = 2        <- menyimpang ke arah sebaliknya

        Satu jalur penghapusan yang lupa memperbarui penghitung sudah
        cukup. Dan tidak ada satu pun error yang muncul.
        `,
      ),
      p('Jalur yang membuatnya menyimpang lebih banyak daripada yang biasanya diduga.'),
      code(
        'text',
        `
        Yang bisa mengubah data tanpa melewati kode aplikasimu:

          - penghapusan lewat ON DELETE CASCADE
          - skrip migrasi dan backfill
          - perbaikan data lewat konsol basis data
          - jalur kode lain yang lupa memperbaruinya
          - transaksi yang gagal SETELAH penghitung diperbarui
          - pemulihan cadangan sebagian

        Yang terakhir sudah diukur di bab Deployment: pg_restore
        --data-only ke tabel TANPA primary key melipatgandakan baris
        dari 1.000 menjadi 2.000 tanpa satu pun error. Penghitungnya
        tentu saja tidak ikut berlipat.
        `,
      ),
      p(
        'Karena itu denormalisasi menuntut dua hal yang harus ada sejak awal, dan keduanya sering ditunda.',
      ),
      code(
        'sql',
        `
        -- 1. Diperbarui di TEMPAT YANG SAMA dengan perubahannya,
        --    di dalam transaksi yang sama, atau lewat trigger
        --    supaya jalur apa pun ikut terhitung.
        CREATE FUNCTION perbarui_jumlah_komentar() RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            UPDATE artikel SET jumlah_komentar = jumlah_komentar + 1
            WHERE id = NEW.artikel_id;
          ELSIF TG_OP = 'DELETE' THEN
            UPDATE artikel SET jumlah_komentar = jumlah_komentar - 1
            WHERE id = OLD.artikel_id;
          END IF;
          RETURN NULL;
        END $$ LANGUAGE plpgsql;

        CREATE TRIGGER trg_jumlah_komentar
        AFTER INSERT OR DELETE ON komentar
        FOR EACH ROW EXECUTE FUNCTION perbarui_jumlah_komentar();

        -- 2. Ada yang MENDAMAIKANNYA secara berkala, dan melaporkan
        --    bila selisihnya ditemukan.
        SELECT a.id, a.jumlah_komentar, count(k.id) AS sebenarnya
        FROM artikel a LEFT JOIN komentar k ON k.artikel_id = a.id
        GROUP BY a.id, a.jumlah_komentar
        HAVING a.jumlah_komentar <> count(k.id);
        `,
        {
          caption:
            'Query kedua itu yang membedakan denormalisasi yang dijaga dari penghitung yang perlahan menjadi fiksi.',
        },
      ),
      p(
        'Trigger menyelesaikan sebagian besar jalur dan menambah biayanya sendiri, dan itu harus dinyatakan dengan jujur.',
      ),
      code(
        'text',
        `
        Yang diselesaikan trigger:
          jalur kode mana pun, skrip mana pun, dan CASCADE ikut
          terhitung

        Yang dibayar:
          setiap penulisan membayar UPDATE tambahan — diukur,
          0,0090 ms menjadi 0,2825 ms per operasi
          dan pada baris yang panas, pertentangannya 16 kali lipat

        Yang TIDAK diselesaikan trigger:
          pemulihan cadangan sebagian, dan penulisan langsung yang
          sengaja mematikan trigger

        Karena itu langkah kedua, yaitu pendamaian berkala, tetap
        diperlukan meski trigger sudah ada.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Denormalisasi memberi perbaikan yang sangat terlihat dengan cepat, dan biayanya dibayar perlahan di tempat yang tidak diperhatikan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mendenormalisasi sebelum mengukur query aslinya',
            'Pasti lebih cepat',
            'Diukur, JOIN berindeks untuk 20 baris sudah 0,736 ms. Yang mahal adalah agregasi seluruh tabel',
          ],
          [
            'Memperbarui penghitung hanya di satu jalur kode',
            'Cuma di situ datanya berubah',
            'Diuji, satu penghapusan yang lewat jalur lain membuat penghitung menyimpang dari 2 menjadi 3',
          ],
          [
            'Tidak memasang pendamaian berkala',
            'Kodenya kan sudah benar',
            'CASCADE, migrasi, dan perbaikan manual tidak lewat kodemu. Jalankan query pembanding berkala',
          ],
          [
            'Mengabaikan biaya tulisnya',
            'Cuma satu UPDATE tambahan',
            'Diukur, 0,0090 ms menjadi 0,2825 ms per operasi, yaitu 31 kali lebih lambat',
          ],
          [
            'Memakai satu baris penghitung untuk entitas yang sangat panas',
            'Satu baris, satu angka',
            'Diukur, 2.000 UPDATE ke baris yang sama 459 ms melawan 29 ms ke baris berbeda',
          ],
          [
            'Menyalin data yang sering berubah',
            'Biar tidak perlu JOIN',
            'Nama penulis yang disalin ke sepuluh ribu artikel harus diperbarui di sepuluh ribu tempat',
          ],
        ],
      ),
      p(
        'Urutan yang hampir selalu benar sebelum mendenormalisasi ada tiga langkah, dan dua yang pertama gratis. Pertama jalankan `EXPLAIN ANALYZE` pada query yang dicurigai lambat, kedua periksa apakah indeks yang tepat sudah ada, dan ketiga barulah pertimbangkan menyimpan hasilnya. Pengukuran di awal sub-bab ini menunjukkan kenapa: satu query terlihat sangat mahal pada 468,9 ms, dan query lain di tabel yang sama sudah selesai dalam 0,736 ms tanpa perlakuan khusus apa pun.',
      ),
      references(
        {
          label: 'PostgreSQL: Materialized Views',
          href: 'https://www.postgresql.org/docs/current/rules-materializedviews.html',
          source: 'PostgreSQL',
          note: 'Termasuk syarat index unik agar penyegaran bisa berjalan tanpa mengunci pembaca.',
        },
        {
          label: 'PostgreSQL: Triggers',
          href: 'https://www.postgresql.org/docs/current/trigger-definition.html',
          source: 'PostgreSQL',
          note: 'Mekanisme yang menjaga counter cache tanpa bisa terlewat.',
        },
        {
          label: 'PostgreSQL: INSERT ... ON CONFLICT',
          href: 'https://www.postgresql.org/docs/current/sql-insert.html',
          source: 'PostgreSQL',
          note: 'Bentuk yang dipakai untuk mengisi ulang summary table secara idempoten.',
        },
        {
          label: 'MongoDB: Model Data for Atomic Operations',
          href: 'https://www.mongodb.com/docs/manual/tutorial/model-data-for-atomic-operations/',
          source: 'MongoDB',
          note: 'Alasan penyematan data pada model dokumen, yaitu bentuk denormalisasi yang disengaja.',
        },
      ),
    ],
  ),
];
