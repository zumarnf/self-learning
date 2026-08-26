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
 * Prompt Engineering — Chapter 2, seven lessons.
 *
 * Control rather than clarity. Chapter 1 makes the request understandable; this chapter decides
 * how much the model thinks, what shape the answer takes, where a task should be split, and how
 * a claim gets tied to evidence.
 *
 * Written against vendor documentation and deliberately light on feature names: the mechanisms
 * outlive the product labels, and the reader has to be able to carry them elsewhere.
 */
export const lessons: LessonDraft[] = [
  written(
    'berpikir-sebelum-menjawab',
    'Berpikir Sebelum Menjawab',
    13,
    'Chain of thought, extended thinking, dan kapan menyuruh model berpikir justru merugikan.',
    [
      p(
        'Ada satu jenis kegagalan yang bentuknya sangat khas. Kamu meminta sesuatu yang butuh beberapa langkah penalaran, misalnya menghitung dampak sebuah perubahan atau memilih di antara tiga pendekatan, lalu model langsung memberi kesimpulan tanpa memperlihatkan bagaimana ia sampai ke sana. Kesimpulan itu terdengar meyakinkan, dan sepertiga waktu ia salah.',
      ),
      p(
        'Penyelesaiannya adalah memberi ruang bagi model untuk menalar sebelum menjawab. Sub-bab ini membahas tiga bentuk ruang itu, dari yang paling sederhana sampai yang sudah dibangun ke dalam model, sekaligus membahas kapan justru sebaiknya kamu menahannya.',
      ),

      terms(
        {
          term: 'chain of thought (CoT)',
          meaning:
            'Teknik meminta model menuliskan langkah penalarannya sebelum memberi kesimpulan. Dibaca "cein of tot", disingkat CoT. Bentuk paling sederhananya cuma satu kalimat tambahan seperti "jelaskan langkahmu sebelum menjawab". Alasannya bekerja berpijak pada sub-bab 1.2, yaitu model menyusun jawaban berdasarkan teks yang sudah ada, sehingga langkah yang sudah tertulis menjadi bahan untuk langkah berikutnya.',
        },
        {
          term: 'extended thinking',
          meaning:
            'Fitur di model Claude yang memberi ruang penalaran terpisah sebelum jawabannya, dengan jatah token yang bisa diatur lewat `budget_tokens`. Dokumentasi Anthropic menyatakan bentuk ini sudah usang pada model terbaru, dan pada model Claude 4.7 ke atas pemakaian `budget_tokens` justru mengembalikan error. Penggantinya adaptive thinking.',
        },
        {
          term: 'adaptive thinking',
          meaning:
            'Bentuk penalaran di mana model sendiri yang memutuskan kapan perlu berpikir dan seberapa dalam, berdasarkan tingkat kerumitan permintaan. Pada model Claude terbaru inilah satu-satunya mode yang tersedia dan ia selalu aktif. Untuk pertanyaan mudah, model menjawab langsung tanpa menghabiskan token penalaran.',
        },
        {
          term: 'effort',
          meaning:
            'Parameter yang mengatur seberapa banyak usaha yang dikeluarkan model, termasuk seberapa banyak ia menalar. Menaikkannya menghasilkan penalaran lebih dalam dengan biaya waktu dan token, menurunkannya membuat model lebih cepat memutuskan. Ini pengganti yang dianjurkan untuk pembatasan lewat `budget_tokens`.',
        },
        {
          term: 'interleaved thinking',
          meaning:
            'Penalaran yang terjadi di sela-sela pemanggilan alat, bukan hanya sekali di awal. Berguna untuk pekerjaan agentik, karena hasil sebuah perintah sering mengubah rencana. Tanpa ini, model menyusun rencana di awal lalu menjalankannya tanpa menimbang hasil di tengah jalan.',
        },
        {
          term: 'overthinking',
          meaning:
            'Keadaan model menalar jauh lebih banyak daripada yang dibutuhkan tugasnya, sehingga jawabannya lambat dan token terbuang. Dokumentasi Anthropic menyebutnya secara langsung sebagai perilaku yang perlu diredam pada sebagian model, dan menyediakan contoh prompt untuk menahannya.',
        },
        {
          term: 'scratchpad',
          meaning:
            'Ruang kerja sementara tempat model menuliskan hitungan atau catatan yang tidak dimaksudkan sebagai jawaban akhir. Bisa kamu buat sendiri dengan meminta jawabannya dibungkus tag, misalnya penalaran di dalam `<analisis>` dan kesimpulan di dalam `<jawaban>`, sehingga kamu bisa mengambil bagian yang kamu perlukan saja.',
        },
      ),

      h2('Bentuk paling sederhana yang bisa kamu pakai hari ini'),
      p(
        'Sebelum menyentuh fitur apa pun, teknik dasarnya cuma satu kalimat tambahan. Perbedaan hasilnya paling terasa pada tugas yang punya beberapa langkah bergantungan.',
      ),
      compare(
        {
          title: 'Langsung menyimpulkan',
          lang: 'text',
          code: `
          Endpoint ini dipanggil 200 kali per detik dan tiap
          panggilan melakukan 3 query. Cukup satu instance
          PostgreSQL dengan 100 koneksi?
          `,
          notes: [
            'Jawabannya biasanya berupa ya atau tidak yang terdengar yakin.',
            'Kamu tidak punya cara memeriksa asumsi yang dipakainya.',
            'Kalau asumsinya keliru, kesalahannya tidak terlihat sama sekali.',
          ],
        },
        {
          title: 'Menalar dulu',
          lang: 'text',
          code: `
          Endpoint ini dipanggil 200 kali per detik dan tiap
          panggilan melakukan 3 query. Cukup satu instance
          PostgreSQL dengan 100 koneksi?

          Tuliskan dulu hitunganmu langkah demi langkah, sebutkan
          setiap asumsi yang kamu pakai, baru simpulkan. Kalau ada
          angka yang kamu tidak tahu, sebutkan sebagai asumsi
          alih-alih menebaknya diam-diam.
          `,
          notes: [
            'Asumsi soal lama tiap query sekarang tertulis dan bisa kamu koreksi.',
            'Hitungannya bisa kamu periksa tanpa mengulang seluruh percakapan.',
            'Kalimat terakhir mencegah angka karangan menyelinap sebagai fakta.',
          ],
        },
      ),
      p(
        'Kalimat terakhir di kolom kanan adalah tambahan yang paling sering menyelamatkan. Tanpa itu, model akan mengisi angka yang tidak ia ketahui dengan nilai yang masuk akal, dan nilai masuk akal yang tidak diberi label asumsi akan terbaca sebagai fakta oleh siapa pun yang membaca jawabannya nanti.',
      ),
      p(
        'Perhatikan juga contoh itu memakai perhitungan yang sudah kamu kenal dari sub-bab [Estimasi di balik amplop](/kelas/system-design/fondasi-sistem/estimasi-kasar). Model bisa membantu menyusun hitungan semacam itu, tetapi ia tidak bisa tahu berapa lama query di database-mu berjalan. Angka itu datang darimu.',
      ),

      h2('Memisahkan penalaran dari jawabannya'),
      p(
        'Kadang kamu butuh model menalar tetapi tidak ingin penalarannya ikut tampil ke pengguna akhir. Untuk itu, mintalah penalarannya dibungkus tag tersendiri.',
      ),
      code(
        'text',
        `
        Tentukan tingkat urgensi tiket dukungan berikut.

        <tiket>
        [ isi tiketnya ]
        </tiket>

        Tuliskan pertimbanganmu di dalam tag <analisis>, lalu
        tuliskan hasil akhirnya saja di dalam tag <hasil> berupa
        salah satu dari rendah, sedang, atau tinggi.
        `,
        {
          caption:
            'Kodemu mengambil isi tag hasil, sedangkan isi tag analisis dipakai saat kamu perlu menelusuri kenapa keputusannya begitu.',
        },
      ),
      p(
        'Pola ini punya nilai tambahan yang tidak langsung terlihat. Ketika suatu hari keputusannya terasa aneh, kamu punya jejak penalaran yang bisa dibaca, dan dari situ kamu biasanya menemukan kriteria yang belum kamu nyatakan dengan jelas. Ini menjadikan penalarannya bukan hanya alat bantu jawaban, melainkan alat bantu memperbaiki prompt.',
      ),
      callout(
        'info',
        'Jangan pakai isi penalarannya sebagai data',
        'Teks penalaran bukan keluaran resmi dan bentuknya bisa berubah kapan saja. Pakai ia untuk dibaca manusia saat menelusuri masalah, bukan sebagai sumber yang di-parsing kodemu. Kalau kodemu butuh nilai terstruktur, ambil dari bagian jawaban yang memang kamu tentukan bentuknya.',
      ),

      h2('Yang berubah pada model terbaru'),
      p(
        'Bagian ini penting karena banyak panduan lama masih mengajarkan cara yang sudah tidak berlaku. Dokumentasi Anthropic menyatakan perubahannya secara langsung.',
      ),
      table(
        ['Cara lama', 'Keadaan sekarang', 'Yang sebaiknya dipakai'],
        [
          [
            'Menyalakan extended thinking dengan `budget_tokens`',
            'Sudah usang, dan pada Claude 4.7 ke atas justru mengembalikan error',
            'Adaptive thinking, dengan `effort` untuk mengatur kedalamannya',
          ],
          [
            'Menambah kalimat "berpikirlah langkah demi langkah" pada setiap prompt',
            'Model terbaru sudah menalar sendiri saat memang perlu',
            'Sertakan hanya bila kamu memang ingin penalarannya terlihat atau strukturnya diatur',
          ],
          [
            'Mengisi prompt dengan penekanan supaya model lebih teliti',
            'Bisa berbalik menjadi terlalu banyak menalar dan terlalu banyak memanggil alat',
            'Turunkan penekanannya, atau turunkan `effort`',
          ],
          [
            'Memakai prefill untuk memaksa bentuk jawaban',
            'Tidak lagi didukung pada model 4.6 ke atas, dan mengembalikan error 400',
            'Keluaran terstruktur, pemanggilan alat, atau instruksi format yang tegas',
          ],
        ],
        'Empat perubahan yang membuat panduan lama bisa menyesatkan.',
      ),
      p(
        'Baris ketiga adalah yang paling relevan untuk pemakaian sehari-hari, dan arahnya berlawanan dengan naluri. Prompt yang dulu ditulis untuk mendorong model lebih rajin memakai alat sekarang bisa membuatnya terlalu sering memakai alat. Dokumentasi Anthropic menyarankan bahasa yang lebih biasa, yaitu ganti "PENTING, kamu HARUS memakai alat ini ketika" menjadi "pakai alat ini ketika".',
      ),

      h2('Kapan menahan penalaran justru benar'),
      p(
        'Berpikir tidak gratis. Ia menambah waktu tunggu dan token, dan untuk sebagian tugas ia tidak memperbaiki apa pun. Berikut tanda-tanda kamu sedang membayar untuk sesuatu yang tidak kamu butuhkan.',
      ),
      table(
        ['Tanda', 'Kemungkinan penyebab', 'Perbaikannya'],
        [
          [
            'Pertanyaan sederhana dijawab lama',
            'Prompt sistemmu panjang dan rumit, sehingga memicu penalaran',
            'Ringkaskan prompt sistemnya, atau turunkan `effort`',
          ],
          [
            'Model menimbang ulang keputusan yang sudah diambilnya',
            'Tidak ada instruksi untuk berkomitmen pada satu pendekatan',
            'Minta ia memilih satu pendekatan dan menjalankannya sampai selesai',
          ],
          [
            'Eksplorasi awal jauh lebih panjang daripada pekerjaannya',
            'Instruksi lama yang mendorong ketelitian ekstra',
            'Ganti aturan menyeluruh dengan aturan bersyarat',
          ],
          [
            'Model memanggil banyak alat untuk hal yang bisa dijawab langsung',
            'Penekanan berlebihan di instruksi pemakaian alat',
            'Kurangi penekanannya, sebutkan kapan alat itu memang berguna',
          ],
        ],
        'Semua barisnya adalah bentuk lain dari satu masalah, yaitu prompt yang menyuruh terlalu keras.',
      ),
      p(
        'Untuk baris kedua, dokumentasi Anthropic menyediakan bentuk prompt yang bisa kamu pakai langsung. Isinya kira-kira begini, yaitu ketika memutuskan pendekatan, pilih satu lalu jalankan, dan jangan meninjau ulang keputusan itu kecuali ada informasi baru yang benar-benar bertentangan dengan alasan awalmu.',
      ),
      callout(
        'tip',
        'Penekanan itu sumber daya langka',
        'Kata seperti PENTING dan HARUS bekerja karena ia jarang. Kalau kamu menandai sepuluh aturan dengan kata itu, kamu bukan membuat sepuluh aturan menonjol, melainkan membuat tidak satu pun menonjol. Simpan penekanan untuk satu atau dua hal yang benar-benar tidak boleh dilanggar.',
      ),

      h2('Penalaran di sela pemanggilan alat'),
      p(
        'Untuk pekerjaan agentik, tempat penalaran yang paling berjasa bukan di awal melainkan di tengah, tepat setelah sebuah perintah memberi hasil. Alasannya sederhana, yaitu hasil sebuah perintah sering mengubah rencana yang tadinya masuk akal.',
      ),
      code(
        'text',
        `
        Sesudah menerima hasil dari sebuah perintah, timbang dulu
        kualitas hasilnya dan tentukan langkah terbaik berikutnya
        sebelum melanjutkan. Pakai penalaranmu untuk menyesuaikan
        rencana berdasarkan informasi baru itu, bukan meneruskan
        rencana awal begitu saja.
        `,
        {
          caption:
            'Bentuk yang dianjurkan dokumentasi Anthropic untuk pekerjaan yang melibatkan banyak langkah alat.',
        },
      ),
      p(
        'Kamu akan bertemu bentuk ini lagi di Bab 3 dalam wujud yang lebih konkret. Ketika sebuah test gagal, yang kamu inginkan bukan agent yang langsung menambal supaya hijau, melainkan agent yang membaca pesan gagalnya lalu memutuskan apakah rencananya masih benar. Selisih antara keduanya persis selisih antara menambal gejala dan mencari akar masalah.',
      ),

      h2('Rangkuman'),
      ul(
        'Chain of thought berarti meminta langkah penalaran ditulis sebelum kesimpulan, dan bentuk dasarnya cuma satu kalimat tambahan.',
        'Minta asumsi disebutkan sebagai asumsi, supaya angka karangan tidak terbaca sebagai fakta.',
        'Bungkus penalaran dan jawaban di tag berbeda bila kodemu hanya butuh jawabannya.',
        'Pada model terbaru, adaptive thinking sudah bawaan, sedangkan `budget_tokens` dan prefill sudah usang.',
        'Berpikir berbiaya, jadi kenali tanda model menalar lebih banyak daripada yang dibutuhkan.',
        'Penalaran di sela pemanggilan alat lebih berjasa daripada penalaran sekali di awal.',
      ),

      references(
        {
          label: 'Thinking and reasoning',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber pembahasan adaptive thinking, overthinking, dan contoh prompt untuk berkomitmen pada satu pendekatan.',
        },
        {
          label: 'Adaptive thinking',
          href: 'https://platform.claude.com/docs/en/build-with-claude/thinking',
          source: 'Anthropic',
          note: 'Penjelasan resmi mode penalaran beserta status usangnya budget_tokens.',
        },
        {
          label: 'Prompting reasoning models',
          href: 'https://developers.openai.com/api/docs/guides/prompt-engineering',
          source: 'OpenAI',
          note: 'Menyebut bahwa model penalar bekerja lebih baik dengan arahan tingkat tinggi daripada instruksi rinci.',
        },
      ),
    ],
  ),

  written(
    'mengatur-format-keluaran',
    'Mengatur Format Keluaran',
    12,
    'Empat cara mengendalikan bentuk jawaban, dan mana yang benar-benar menjamin.',
    [
      p(
        'Sampai di sini kamu sudah bisa membuat model memahami permintaan dan menalar sebelum menjawab. Yang belum dikendalikan adalah bentuk jawabannya. Ini terdengar seperti urusan estetika, padahal ia menjadi urusan teknis begitu jawabannya masuk ke kode, ke berkas, atau ke tampilan yang dilihat pengguna.',
      ),
      p(
        'Sub-bab ini membahas empat cara mengendalikan format, disusun dari yang paling ringan sampai yang paling mengikat, sekaligus menjelaskan mana yang sebenarnya cuma permintaan dan mana yang benar-benar menjamin.',
      ),

      terms(
        {
          term: 'output format (format keluaran)',
          meaning:
            'Bentuk fisik jawaban, misalnya prosa mengalir, daftar berpoin, tabel, JSON, atau potongan kode. Berbeda dari isi jawabannya. Dua jawaban dengan isi yang sama persis bisa punya nilai pakai yang sangat berbeda hanya karena formatnya, terutama ketika ia akan dibaca program dan bukan manusia.',
        },
        {
          term: 'structured outputs (keluaran terstruktur)',
          meaning:
            'Fitur yang mengikat jawaban model pada sebuah skema yang kamu tentukan, sehingga bentuknya dijamin oleh sistem alih-alih diminta lewat kalimat. Inilah pengganti yang dianjurkan Anthropic untuk cara lama memakai prefill. Bedanya besar, yaitu instruksi teks bisa dilanggar sedangkan skema tidak.',
        },
        {
          term: 'prefill',
          meaning:
            'Cara lama memaksa bentuk jawaban dengan mengisikan awal jawabannya sendiri, misalnya menuliskan kurung kurawal pembuka supaya model melanjutkan sebagai JSON. Dokumentasi Anthropic menyatakan cara ini tidak lagi didukung pada model Claude 4.6 ke atas, dan permintaan yang memakainya mengembalikan error 400.',
        },
        {
          term: 'preamble (pembuka)',
          meaning:
            'Kalimat basa-basi di awal jawaban seperti "Tentu, berikut ringkasan yang Anda minta". Tidak berbahaya bagi manusia, tetapi merepotkan bagi program yang mem-parsing jawabannya. Cara menghilangkannya adalah instruksi langsung untuk menjawab tanpa pembuka, atau membungkus jawaban di dalam tag.',
        },
        {
          term: 'verbosity (tingkat kerincian)',
          meaning:
            'Seberapa panjang dan rinci jawabannya. Model terbaru cenderung lebih ringkas daripada model lama, sehingga kadang justru kamu yang perlu meminta ringkasan tambahan sesudah pemakaian alat. Ini kebalikan dari kebiasaan lama yang selalu meminta model lebih singkat.',
        },
        {
          term: 'schema (skema)',
          meaning:
            'Deskripsi formal bentuk data, misalnya JSON Schema atau skema Zod, yang menyatakan field apa saja yang ada, tipe tiap field, dan mana yang wajib. Kamu sudah memakainya di sub-bab [Validasi Input](/kelas/keamanan-fullstack/data-rahasia-jejak/validasi-input), dan perannya di sini sama persis.',
        },
      ),

      h2('Cara pertama, katakan bentuk yang kamu mau'),
      p(
        'Ini penerapan langsung dari aturan instruksi positif di sub-bab 1.3. Untuk urusan format, dokumentasi Anthropic menyebutkannya sebagai cara paling efektif yang pertama.',
      ),
      compare(
        {
          title: 'Melarang',
          lang: 'text',
          code: `
          Jangan pakai markdown di jawabanmu.
          `,
          notes: [
            'Menutup satu bentuk tanpa menunjuk bentuk penggantinya.',
            'Model tetap harus menebak apakah maksudmu daftar biasa, prosa, atau teks polos.',
          ],
        },
        {
          title: 'Menunjuk',
          lang: 'text',
          code: `
          Tulis jawabanmu sebagai paragraf prosa yang utuh
          dan mengalir, dengan pemisah paragraf biasa.
          `,
          notes: [
            'Bentuk targetnya jelas, jadi tidak ada yang perlu ditebak.',
            'Kalimat ini juga menyiratkan larangan yang tadi, tanpa perlu menyebutnya.',
          ],
        },
      ),
      p(
        'Ada satu tambahan yang jarang disebut dan efeknya nyata. Gaya penulisan prompt-mu sendiri ikut mempengaruhi gaya jawabannya. Kalau prompt-mu penuh daftar berpoin dan penebalan, jawabannya cenderung ikut begitu. Menulis prompt dalam prosa biasa adalah salah satu cara termurah mendapat jawaban dalam prosa biasa.',
      ),

      h2('Cara kedua, bungkus bagian yang kamu perlukan'),
      p(
        'Kalau kodemu akan mengambil sebagian jawaban, jangan menyuruh model menjawab hanya bagian itu. Biarkan ia menulis apa pun yang perlu, lalu minta bagian yang kamu perlukan dibungkus tag tersendiri.',
      ),
      code(
        'text',
        `
        Tinjau diff berikut lalu jawab dengan struktur ini.

        <ringkasan>
        Dua kalimat tentang apa yang diubah diff ini.
        </ringkasan>

        <temuan>
        Satu baris per temuan, dengan bentuk
        berkas:baris | tingkat | penjelasan singkat
        Tulis kata BERSIH bila tidak ada temuan.
        </temuan>
        `,
        {
          caption:
            'Kata BERSIH pada tag temuan mencegah ambiguitas antara tidak ada temuan dan gagal menjawab.',
        },
      ),
      p(
        'Instruksi menulis kata BERSIH itu bukan detail sepele. Tanpa itu, tag temuan yang kosong punya dua arti yang sangat berbeda, yaitu kode memang bersih atau model gagal menyelesaikan bagian itu. Kodemu tidak bisa membedakan keduanya, sedangkan sebuah penanda eksplisit membuat perbedaannya terlihat.',
      ),
      p(
        'Cara ini juga menyelesaikan masalah pembuka. Kalimat basa-basi apa pun yang muncul sebelum tag pertama tidak mengganggu, karena kodemu mengambil isi tag dan bukan seluruh jawaban.',
      ),

      h2('Cara ketiga, skema yang mengikat'),
      p(
        'Dua cara sebelumnya adalah permintaan. Ia dituruti hampir selalu, dan hampir selalu bukan selalu. Ketika jawabannya masuk ke sistem yang akan rusak bila bentuknya meleset, kamu butuh sesuatu yang tidak bergantung pada kepatuhan.',
      ),
      table(
        ['Pendekatan', 'Yang dijamin', 'Yang tetap harus kamu lakukan'],
        [
          [
            'Instruksi teks saja',
            'Tidak ada jaminan, hanya kecenderungan yang tinggi',
            'Validasi hasilnya, siapkan jalur bila bentuknya meleset',
          ],
          [
            'Keluaran terstruktur dengan skema',
            'Bentuk dan tipenya sesuai skema',
            'Validasi isinya, karena bentuk benar tidak berarti isi benar',
          ],
          [
            'Pemanggilan alat dengan parameter bertipe',
            'Argumen mengikuti definisi alatnya',
            'Perlakukan argumen sebagai input tak tepercaya di sisi kodemu',
          ],
        ],
        'Perhatikan kolom kanan tidak pernah kosong, apa pun pendekatannya.',
      ),
      p(
        'Kolom kanan adalah bagian yang paling sering dilewati. Skema menjamin bahwa field `jumlah` ada dan bertipe angka. Ia tidak menjamin bahwa angkanya masuk akal, tidak negatif, atau merujuk pesanan yang benar-benar milik pengguna itu. Seluruh aturan validasi dan otorisasi dari kategori Keamanan Fullstack tetap berlaku di sisi kodemu.',
      ),
      callout(
        'danger',
        'Keluaran model tetap input tak tepercaya',
        'OWASP mendaftarkan penanganan keluaran yang tidak aman sebagai salah satu risiko utama aplikasi berbasis model bahasa, dan alasannya persis sama dengan yang kamu pelajari di kategori Keamanan Fullstack. Kalau keluaran model masuk ke query, ke perintah shell, ke HTML, atau ke pemanggilan API, ia harus melewati pemeriksaan yang sama seperti data dari pengguna. Skema tidak menggantikan pemeriksaan itu.',
      ),

      h2('Cara keempat, aturan format yang rinci di system prompt'),
      p(
        'Untuk hal yang berlaku pada semua jawaban, aturan format sebaiknya tinggal di system prompt atau berkas instruksi project alih-alih diulang tiap permintaan. Dokumentasi Anthropic menyediakan contoh yang cukup panjang untuk menekan pemakaian markdown berlebihan, dan bentuknya layak diperhatikan.',
      ),
      code(
        'text',
        `
        <hindari_markdown_berlebihan>
        Untuk laporan, dokumen, penjelasan teknis, dan tulisan
        panjang lainnya, tulislah dalam prosa yang mengalir dengan
        kalimat dan paragraf utuh. Pakai pemisah paragraf biasa
        untuk mengatur susunannya, dan simpan markdown terutama
        untuk inline code, blok kode, serta judul sederhana.

        Jangan memakai daftar bernomor atau berpoin kecuali
        isinya memang berupa butir yang benar-benar terpisah,
        atau ketika saya memintanya secara langsung.

        Alih-alih memecah gagasan menjadi butir pendek, rangkai
        gagasan itu ke dalam kalimat. Tujuannya teks yang enak
        dibaca dan menuntun pembaca, bukan potongan informasi
        yang terserak.
        </hindari_markdown_berlebihan>
        `,
        {
          caption:
            'Perhatikan aturannya menyebut pengecualian, sehingga daftar tetap boleh dipakai ketika ia memang bentuk yang tepat.',
        },
      ),
      p(
        'Bagian yang membuat aturan itu bekerja adalah pengecualiannya. Larangan mutlak terhadap daftar akan memaksa model merangkai hal yang memang lebih jelas sebagai daftar, misalnya langkah instalasi, menjadi paragraf yang justru sulit diikuti. Pengecualian memberi jalan keluar yang benar, persis seperti yang dibahas di sub-bab 1.3.',
      ),

      h2('Ketika model justru terlalu ringkas'),
      p(
        'Kebiasaan lama menganggap tugas kita selalu meredam kecerewetan model. Untuk model terbaru, arahnya bisa berbalik. Dokumentasi Anthropic mencatat bahwa model terbaru lebih ringkas dan lebih langsung, sehingga kadang ia melewati ringkasan setelah memakai alat dan langsung melompat ke tindakan berikutnya.',
      ),
      p(
        'Untuk pekerjaan agentik ini bisa merepotkan, karena kamu kehilangan pandangan atas apa yang sedang terjadi. Perbaikannya sederhana, yaitu minta ringkasan singkat sesudah rangkaian pemakaian alat selesai.',
      ),
      code(
        'text',
        `
        Sesudah menyelesaikan tugas yang melibatkan pemakaian alat,
        berikan ringkasan singkat tentang apa yang sudah kamu
        kerjakan, perintah apa yang kamu jalankan, dan apa hasilnya.
        `,
        {
          caption:
            'Berguna terutama untuk sesi yang kamu tinggal, karena ringkasan inilah yang kamu baca saat kembali.',
        },
      ),

      h2('Rangkuman'),
      ul(
        'Katakan bentuk yang kamu mau, bukan bentuk yang kamu larang.',
        'Gaya penulisan prompt-mu ikut mempengaruhi gaya jawabannya.',
        'Bungkus bagian yang akan diambil kodemu di dalam tag, dan sediakan penanda untuk hasil yang kosong.',
        'Instruksi teks adalah permintaan, sedangkan skema dan pemanggilan alat adalah ikatan.',
        'Bentuk yang dijamin tidak berarti isi yang benar, jadi validasi tetap wajib di sisi kodemu.',
        'Aturan format yang berlaku selalu tempatnya di system prompt, lengkap dengan pengecualiannya.',
      ),

      references(
        {
          label: 'Control the format of responses',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber empat cara mengatur format, contoh aturan markdown, dan status usangnya prefill.',
        },
        {
          label: 'Structured outputs',
          href: 'https://platform.claude.com/docs/en/build-with-claude/structured-outputs',
          source: 'Anthropic',
          note: 'Cara mengikat jawaban pada skema alih-alih memintanya lewat kalimat.',
        },
        {
          label: 'Top 10 for Large Language Model Applications',
          href: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
          source: 'OWASP',
          note: 'Memuat penanganan keluaran yang tidak aman sebagai risiko tersendiri.',
        },
      ),
    ],
  ),

  written(
    'memecah-jadi-rantai',
    'Memecah Pekerjaan Menjadi Rantai',
    12,
    'Kapan satu prompt besar sebaiknya menjadi beberapa prompt kecil yang berurutan.',
    [
      p(
        'Ada titik di mana menambah kalimat ke prompt berhenti membantu. Gejalanya khas. Prompt-mu sudah memuat lima tugas berbeda, model mengerjakan tiga dengan baik dan dua sisanya asal-asalan, lalu setiap kali kamu memperbaiki satu bagian, bagian lain justru memburuk.',
      ),
      p(
        'Itu tanda pekerjaannya perlu dipecah, bukan prompt-nya perlu diperpanjang. Sub-bab ini membahas kapan pemecahan itu sepadan, bentuk-bentuknya, dan kapan justru tidak perlu karena model sudah menangani sendiri di dalam.',
      ),

      terms(
        {
          term: 'prompt chaining',
          meaning:
            'Memecah satu pekerjaan besar menjadi beberapa panggilan berurutan, di mana keluaran satu langkah menjadi masukan langkah berikutnya. Dibaca "prompt ceining". Nilainya bukan hanya hasil yang lebih baik, melainkan kemampuan memeriksa dan mencegat di setiap sambungan.',
        },
        {
          term: 'self-correction (koreksi diri)',
          meaning:
            'Pola rantai yang paling sering dipakai, yaitu buat draf, tinjau draf itu terhadap kriteria, lalu perbaiki berdasarkan hasil tinjauan. Dokumentasi Anthropic menyebut pola ini sebagai bentuk chaining yang paling umum. Kunci keberhasilannya ada pada langkah tinjauan yang memakai kriteria tertulis, bukan penilaian umum.',
        },
        {
          term: 'intermediate output (keluaran antara)',
          meaning:
            'Hasil dari langkah di tengah rantai yang belum menjadi jawaban akhir. Keberadaannya adalah alasan utama memilih rantai, karena kamu bisa mencatatnya, memeriksanya, atau memutuskan jalur berbeda berdasarkan isinya.',
        },
        {
          term: 'fan-out',
          meaning:
            'Pola menjalankan satu prompt yang sama pada banyak masukan sekaligus, misalnya memeriksa dua ratus berkas satu per satu. Berbeda dari rantai yang berurutan, karena tiap pekerjaan di sini berdiri sendiri dan bisa berjalan bersamaan. Bab 3 membahas wujud konkretnya di Claude Code.',
        },
        {
          term: 'subagent',
          meaning:
            'Pekerjaan yang didelegasikan ke sesi terpisah dengan context window-nya sendiri, lalu hasilnya dilaporkan kembali sebagai ringkasan. Ini bentuk rantai yang dijalankan agent secara otomatis. Manfaat utamanya menjaga context window utama tetap bersih, karena penelusuran yang memakan banyak berkas terjadi di tempat lain.',
        },
        {
          term: 'checkpoint',
          meaning:
            'Titik simpan di antara dua langkah, tempat kamu bisa berhenti, memeriksa, dan mengulang dari sana tanpa mengulang seluruhnya. Pada pekerjaan kode, commit git adalah checkpoint yang paling andal karena ia menyimpan keadaan berkas, bukan hanya keadaan percakapan.',
        },
      ),

      h2('Tanda sebuah pekerjaan perlu dipecah'),
      table(
        ['Gejala', 'Kenapa itu terjadi', 'Bentuk pemecahan yang cocok'],
        [
          [
            'Beberapa bagian dikerjakan baik, sisanya asal',
            'Satu jawaban harus memenuhi terlalu banyak tujuan sekaligus',
            'Pecah per tujuan, satu panggilan per tujuan',
          ],
          [
            'Memperbaiki satu bagian merusak bagian lain',
            'Instruksinya saling menarik ke arah berbeda',
            'Pisahkan instruksi yang bertabrakan ke langkah berbeda',
          ],
          [
            'Kamu butuh memeriksa hasil setengah jalan',
            'Rantai memang satu-satunya cara mendapat titik periksa',
            'Rantai dengan keluaran antara yang kamu simpan',
          ],
          [
            'Pekerjaannya sama untuk banyak berkas',
            'Ini bukan satu pekerjaan besar melainkan banyak pekerjaan kecil',
            'Fan-out, satu panggilan per berkas',
          ],
          [
            'Penelusurannya memakan banyak berkas dan mengotori konteks',
            'Bahan penelusuran menumpuk padahal yang kamu butuhkan cuma kesimpulannya',
            'Subagent yang menelusuri lalu melaporkan ringkasannya',
          ],
        ],
        'Baris terakhir hanya berlaku untuk agent, dan dibahas penuh di Bab 3.',
      ),
      p(
        'Baris kedua paling sering muncul pada pekerjaan menulis. Satu prompt yang meminta tulisan sekaligus ringkas, lengkap, ramah pemula, dan tepat secara teknis sedang meminta empat hal yang saling menarik. Memecahnya menjadi menulis dulu lalu memadatkan menghasilkan hasil yang lebih baik daripada mencari kalimat ajaib yang menyeimbangkan keempatnya sekaligus.',
      ),

      h2('Pola koreksi diri'),
      p('Ini pola rantai yang paling sering terbukti, dan bentuknya tiga langkah.'),
      steps(
        {
          title: 'Draf',
          body: 'Minta hasil pertamanya tanpa menuntut kesempurnaan. Tujuannya mendapat bahan yang bisa ditinjau, bukan hasil akhir.',
        },
        {
          title: 'Tinjau terhadap kriteria',
          body: 'Panggilan terpisah yang menerima draf tadi beserta daftar kriteria tertulis, lalu menghasilkan daftar temuan. Kriterianya harus yang bisa diperiksa, seperti yang kamu susun di sub-bab 1.8.',
        },
        {
          title: 'Perbaiki',
          body: 'Panggilan ketiga yang menerima draf dan daftar temuan, lalu menghasilkan versi perbaikan. Sertakan instruksi untuk hanya memperbaiki yang disebut di temuan, supaya ia tidak menulis ulang bagian yang sudah benar.',
        },
      ),
      p(
        'Yang membuat pola ini bekerja adalah langkah kedua berjalan tanpa membawa penalaran yang menghasilkan draf. Peninjau yang tidak tahu alasan di balik sebuah pilihan akan menilai hasilnya apa adanya, sedangkan peninjau yang baru saja menulisnya cenderung membenarkan pilihannya sendiri.',
      ),
      code(
        'text',
        `
        # Langkah 2, dijalankan sebagai panggilan terpisah
        Berikut sebuah dokumen dan daftar kriteria.

        <dokumen>
        [ hasil langkah 1 ]
        </dokumen>

        <kriteria>
        1. Tiap istilah asing dijelaskan saat pertama muncul
        2. Tidak ada klaim angka tanpa sumber
        3. Maksimal tiga paragraf per bagian
        4. Tidak memakai tanda pisah di tengah kalimat
        </kriteria>

        Untuk tiap kriteria, sebutkan lulus atau tidak beserta
        kutipan bagian yang melanggar. Kalau semuanya lulus,
        tulis LULUS SEMUA. Jangan mengusulkan perbaikan gaya
        di luar keempat kriteria itu.
        `,
        { caption: 'Kalimat terakhir mencegah peninjau melebar menjadi penulis ulang.' },
      ),
      p(
        'Kalimat terakhir menutup masalah yang sudah disinggung di sub-bab 1.8, yaitu peninjau yang diminta mencari kekurangan akan selalu menemukan kekurangan. Membatasinya pada kriteria tertulis mengubah tinjauan dari opini menjadi pemeriksaan.',
      ),

      h2('Kapan rantai tidak diperlukan'),
      p(
        'Bagian ini penting karena arah anjurannya sudah berubah. Dokumentasi Anthropic menyatakan bahwa dengan adaptive thinking dan kemampuan mengorkestrasi subagent, model sekarang menangani sebagian besar penalaran bertahap di dalam satu giliran. Chaining eksplisit tetap berguna, tetapi bukan lagi untuk alasan yang dulu.',
      ),
      table(
        ['Alasan memakai rantai', 'Masih berlaku?'],
        [
          [
            'Supaya model tidak kewalahan menalar banyak langkah',
            'Sebagian besar sudah ditangani di dalam',
          ],
          ['Supaya kamu bisa memeriksa hasil di tengah', 'Ya, ini alasan yang tetap kuat'],
          ['Supaya bisa mencatat atau mengukur tiap tahap', 'Ya, dan tidak ada penggantinya'],
          ['Supaya bisa bercabang berdasarkan hasil antara', 'Ya, terutama untuk alur otomatis'],
          ['Supaya konteks tetap bersih saat menelusuri banyak berkas', 'Ya, lewat subagent'],
          [
            'Supaya tiap langkah punya izin yang berbeda',
            'Ya, dan ini alasan keamanan bukan kualitas',
          ],
        ],
        'Alasan yang bertahan hampir semuanya soal kendali dan pengamatan, bukan soal kemampuan.',
      ),
      p(
        'Baris terakhir layak diperhatikan karena ia jarang disebut. Memisahkan langkah penelusuran dari langkah pengubahan memungkinkanmu memberi izin baca saja pada langkah pertama. Ini penerapan langsung prinsip hak seminimal mungkin dari [Identitas dan Kewenangan](/kelas/keamanan-fullstack/identitas-kewenangan), dipindahkan ke alur kerja dengan agent.',
      ),
      callout(
        'tip',
        'Mulai dari satu prompt, pecah ketika terbukti perlu',
        'Membangun rantai tiga langkah untuk pekerjaan yang sebenarnya selesai dalam satu panggilan menambah tiga tempat untuk rusak dan tiga kali biaya. Tulis satu prompt lebih dulu, jalankan pada kasus ujimu, lalu pecah bagian yang memang terbukti gagal. Ini prinsip yang sama dengan larangan membuat abstraksi sebelum ada pemakai keduanya.',
      ),

      h2('Menjaga sambungan antar langkah'),
      p(
        'Rantai punya titik rapuh yang khas, yaitu sambungan antar langkah. Tiga hal berikut menutup sebagian besar masalah di sana.',
      ),
      ol(
        'Tentukan bentuk keluaran tiap langkah, karena langkah berikutnya akan membacanya. Bentuk yang berubah-ubah membuat rantai patah di tempat yang sulit ditelusuri.',
        'Sediakan penanda untuk hasil kosong dan hasil gagal, supaya langkah berikutnya bisa membedakan tidak ada temuan dari tidak berhasil menilai.',
        'Simpan keluaran antara, minimal saat sedang membangun rantainya. Tanpa itu, kegagalan di langkah ketiga tidak bisa kamu telusuri sampai ke sumbernya.',
      ),
      p(
        'Poin ketiga sering dilewati karena terasa merepotkan, padahal ia justru yang membuat rantai lebih berharga daripada satu prompt besar. Kalau kamu tidak menyimpan keluaran antaranya, kamu membayar biaya rantai tanpa mendapat manfaat utamanya.',
      ),

      h2('Rangkuman'),
      ul(
        'Tanda perlu dipecah adalah sebagian tugas dikerjakan baik dan sisanya asal, atau perbaikan satu bagian merusak bagian lain.',
        'Pola rantai yang paling sering terbukti adalah draf, tinjau terhadap kriteria, lalu perbaiki.',
        'Peninjau bekerja lebih baik ketika ia tidak membawa penalaran yang menghasilkan drafnya.',
        'Model terbaru sudah menangani penalaran bertahap di dalam, sehingga alasan memakai rantai bergeser ke kendali dan pengamatan.',
        'Memisahkan langkah juga memungkinkan izin yang berbeda per langkah.',
        'Mulai dari satu prompt, dan pecah hanya bagian yang terbukti gagal.',
      ),

      references(
        {
          label: 'Chain complex prompts',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Menyebut pola koreksi diri dan menjelaskan kapan chaining eksplisit masih diperlukan.',
        },
        {
          label: 'Use subagents for investigation',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Wujud rantai yang dijalankan agent untuk menjaga context window utama tetap bersih.',
        },
      ),
    ],
  ),

  written(
    'prompt-konteks-panjang',
    'Prompt untuk Konteks Panjang',
    12,
    'Menyusun prompt yang memuat puluhan ribu token bahan tanpa membuat instruksimu tenggelam.',
    [
      p(
        'Begitu bahan yang kamu kirim melampaui beberapa puluh ribu token, aturan mainnya berubah. Prompt yang bekerja baik untuk satu berkas bisa gagal untuk dua puluh berkas, bukan karena instruksinya salah melainkan karena instruksinya sekarang berada di antara terlalu banyak hal.',
      ),
      p(
        'Sub-bab ini mengumpulkan teknik yang khusus untuk keadaan itu. Sebagiannya sudah kamu temui sepintas di Bab 1, dan di sini dibahas lengkap beserta alasannya.',
      ),

      terms(
        {
          term: 'long context',
          meaning:
            'Sebutan untuk prompt yang memuat bahan sangat banyak, biasanya dipatok mulai sekitar dua puluh ribu token ke atas. Dibaca "long kontek". Di angka itu, teknik penyusunan mulai berpengaruh nyata pada hasil, sedangkan di bawahnya urutan dan struktur relatif tidak terlalu menentukan.',
        },
        {
          term: 'lost in the middle',
          meaning:
            'Gejala menurunnya perhatian model terhadap bahan yang berada di tengah masukan yang sangat panjang, dibanding bahan di awal dan di akhir. Inilah alasan bahan yang paling menentukan sebaiknya tidak diselipkan di tengah tumpukan, dan alasan meminta kutipan lebih dulu sering menolong.',
        },
        {
          term: 'quote extraction (pengambilan kutipan)',
          meaning:
            'Teknik meminta model mengutip bagian bahan yang relevan lebih dulu, sebelum menjawab pertanyaannya. Dokumentasi Anthropic menganjurkannya khusus untuk dokumen panjang. Gunanya memaksa potongan yang benar-benar relevan berada tepat di hadapan model saat ia menyusun kesimpulan.',
        },
        {
          term: 'metadata',
          meaning:
            'Keterangan tentang sebuah bahan, bukan isinya, misalnya nama berkas, tanggal, penulis, atau versi. Menyertakannya membuat jawaban bisa menunjuk sumber dengan tepat. Tanpa metadata, jawaban hanya bisa berkata "di dokumen ketiga" dan kamu yang harus menerjemahkannya.',
        },
        {
          term: 'prompt caching',
          meaning:
            'Mekanisme yang menyimpan hasil pemrosesan bagian awal prompt yang tidak berubah, sehingga permintaan berikutnya dengan awalan yang sama diproses lebih cepat dan lebih murah. Konsekuensinya untuk penyusunan prompt, yaitu bagian yang tetap sebaiknya diletakkan di depan dan bagian yang berubah di belakang.',
        },
        {
          term: 'chunking',
          meaning:
            'Memecah bahan yang sangat besar menjadi potongan-potongan yang diproses terpisah, lalu menggabungkan hasilnya. Dipakai ketika bahannya memang tidak muat sama sekali. Harganya nyata, yaitu tiap potongan kehilangan pandangan atas potongan lain, sehingga kesimpulan yang butuh melihat keseluruhan bisa meleset.',
        },
      ),

      h2('Empat aturan penyusunan'),
      p('Keempatnya datang dari dokumentasi Anthropic dan bisa kamu pakai apa adanya.'),
      steps(
        {
          title: 'Bahan panjang di atas, pertanyaan di bawah',
          body: 'Ini yang paling berpengaruh. Pengujian yang disebut Anthropic menunjukkan pertanyaan yang ditaruh di akhir bisa menaikkan kualitas jawaban sampai sekitar tiga puluh persen pada masukan rumit bersumber banyak dokumen.',
        },
        {
          title: 'Bungkus tiap dokumen beserta sumbernya',
          body: 'Pakai tag `<document>` yang memuat `<source>` dan `<document_content>`. Ini yang membuat jawabannya bisa menyebut nama berkas alih-alih nomor urut.',
        },
        {
          title: 'Minta kutipan sebelum kesimpulan',
          body: 'Suruh model mengumpulkan potongan yang relevan di dalam tag tersendiri, baru menyusun jawabannya dari potongan itu. Selain menaikkan ketepatan, ini memberi kamu jejak untuk memeriksa.',
        },
        {
          title: 'Taruh bagian yang tetap di depan',
          body: 'Instruksi sistem dan bahan yang tidak berubah antar permintaan sebaiknya berada di awal, supaya mekanisme caching bisa memanfaatkannya. Bagian yang berbeda tiap permintaan diletakkan sesudahnya.',
        },
      ),
      p(
        'Aturan pertama dan keempat terlihat bertabrakan, dan sebenarnya tidak. Yang diminta aturan pertama adalah pertanyaan berada sesudah bahan, sedangkan aturan keempat mengurutkan bahan itu sendiri. Susunan yang memenuhi keduanya adalah instruksi tetap, lalu bahan tetap, lalu bahan yang berubah, lalu pertanyaan hari ini.',
      ),

      h2('Bentuk lengkapnya'),
      code(
        'text',
        `
        <instruksi>
        Kamu meninjau perubahan kode. Untuk tiap temuan, sebutkan
        nama berkas dan nomor barisnya. Jangan menilai gaya penulisan.
        </instruksi>

        <documents>
          <document index="1">
            <source>src/auth/token.ts</source>
            <document_content>
            [ isi berkas ]
            </document_content>
          </document>
          <document index="2">
            <source>src/auth/token.test.ts</source>
            <document_content>
            [ isi berkas ]
            </document_content>
          </document>
          <document index="3">
            <source>docs/adr/0004-rotasi-refresh-token.md</source>
            <document_content>
            [ isi dokumen keputusan ]
            </document_content>
          </document>
        </documents>

        Kumpulkan dulu potongan yang relevan ke dalam tag <kutipan>,
        sebutkan sumber tiap potongan. Sesudah itu, dari kutipan tadi
        saja, tuliskan temuanmu di dalam tag <temuan>. Kalau tidak
        ada yang melanggar keputusan di dokumen ketiga, tulis BERSIH.
        `,
        {
          caption:
            'Frasa "dari kutipan tadi saja" adalah pagar yang mencegah jawabannya melebar ke pengetahuan umum.',
        },
      ),
      p(
        'Frasa "dari kutipan tadi saja" mengerjakan dua hal sekaligus. Ia mempersempit bahan yang dipakai menyimpulkan, dan ia membuat kesalahan mudah ketahuan, karena temuan yang tidak berpijak pada kutipan mana pun langsung terlihat ganjil saat kamu membacanya.',
      ),

      h2('Yang sebaiknya tidak ikut masuk'),
      p(
        'Godaan terbesar pada konteks panjang adalah menyertakan segalanya karena ruangnya masih ada. Ruang yang tersedia bukan alasan untuk mengisinya.',
      ),
      table(
        ['Bahan', 'Sertakan?', 'Alasannya'],
        [
          ['Berkas yang jelas berhubungan dengan tugasnya', 'Ya', 'Ini inti bahannya'],
          [
            'Berkas yang mungkin berhubungan',
            'Cukup sebutkan namanya',
            'Biarkan agent membacanya sendiri bila memang perlu',
          ],
          [
            'Seluruh isi folder',
            'Tidak',
            'Menurunkan mencoloknya instruksi dan bahan yang benar-benar penting',
          ],
          [
            'Keluaran perintah yang sangat panjang',
            'Saring dulu',
            'Stack trace lengkap sering menyimpan hanya beberapa baris yang berguna',
          ],
          [
            'Riwayat percakapan lama yang sudah selesai',
            'Tidak',
            'Mulai percakapan baru lebih murah daripada membawa semuanya',
          ],
          [
            'Data asli pengguna',
            'Tidak, ganti dengan data karangan',
            'Bahan ikut terkirim dan bisa ikut tersimpan di riwayat',
          ],
        ],
        'Baris kedua dan keempat adalah yang paling sering menghemat ruang tanpa mengurangi hasil.',
      ),
      p(
        'Baris keempat pantas dijelaskan dengan contoh. Sebuah test yang gagal bisa mencetak ratusan baris, dan yang benar-benar menentukan biasanya cuma nama test-nya, pesan gagalnya, dan beberapa baris stack trace pertama yang menyebut kodemu sendiri. Menyaring dulu sebelum menempel adalah kebiasaan yang menghemat ruang besar tanpa kehilangan apa pun.',
      ),
      callout(
        'tip',
        'Pada agent, menunjuk lebih hemat daripada menempel',
        'Kalau kamu memakai Claude Code atau Codex, kamu jarang perlu menempel isi berkas. Menulis nama berkasnya sudah cukup, dan agent akan membaca bagian yang ia butuhkan. Kebiasaan menempel semuanya terbawa dari memakai chatbot biasa, dan di agent ia justru memenuhi context window lebih cepat daripada perlu.',
      ),

      h2('Ketika bahannya memang tidak muat'),
      p(
        'Kadang bahanmu benar-benar melampaui kapasitas, misalnya seluruh log seminggu atau seluruh isi repositori besar. Di titik itu pilihannya bukan menyusun prompt lebih baik, melainkan mengubah pendekatannya.',
      ),
      table(
        ['Pendekatan', 'Cocok untuk', 'Harganya'],
        [
          [
            'Saring dulu di luar model',
            'Log dan data yang bisa disaring dengan `grep` atau query',
            'Kamu harus tahu apa yang dicari',
          ],
          [
            'Chunking, proses per potongan lalu gabungkan',
            'Ringkasan dan ekstraksi yang tidak butuh melihat keseluruhan',
            'Kesimpulan lintas potongan bisa terlewat',
          ],
          [
            'Dua tahap, cari dulu lalu baca yang relevan',
            'Codebase besar dan kumpulan dokumen',
            'Butuh langkah pencarian yang bisa diandalkan',
          ],
          [
            'Serahkan penelusurannya ke agent',
            'Repositori kode, karena agent bisa mencari sendiri',
            'Hasilnya bergantung pada seberapa baik kamu mengarahkan pencariannya',
          ],
        ],
        'Baris pertama paling sering terlupakan padahal paling murah.',
      ),
      p(
        'Baris pertama layak dicoba lebih dulu hampir selalu. Menyaring log dengan `grep` sebelum menempelkannya mengubah empat puluh ribu token menjadi dua ratus token, dan dua ratus token yang tepat hampir selalu mengalahkan empat puluh ribu token yang bercampur.',
      ),

      h2('Rangkuman'),
      ul(
        'Aturan penyusunan mulai berpengaruh nyata ketika bahannya melewati sekitar dua puluh ribu token.',
        'Bahan panjang di atas, pertanyaan di bawah, dan ini yang paling besar pengaruhnya.',
        'Bungkus tiap dokumen beserta sumbernya supaya jawabannya bisa menunjuk berkas.',
        'Minta kutipan lebih dulu, lalu batasi kesimpulan pada kutipan itu saja.',
        'Ruang yang tersedia bukan alasan mengisinya. Saring keluaran panjang sebelum menempel.',
        'Pada agent, menyebut nama berkas lebih hemat daripada menempel isinya.',
      ),

      references(
        {
          label: 'Long context prompting',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber empat aturan penyusunan beserta bentuk documents dan pengambilan kutipan.',
        },
        {
          label: 'Prompt caching',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
          source: 'Anthropic',
          note: 'Menjelaskan kenapa bagian prompt yang tetap sebaiknya berada di depan.',
        },
      ),
    ],
  ),

  written(
    'prompt-untuk-tool-use',
    'Prompt untuk Tool Use',
    13,
    'Bagaimana model memutuskan memakai alat, dan bagaimana kamu mengatur keputusan itu.',
    [
      p(
        'Sampai di sini semua yang dibahas adalah teks masuk dan teks keluar. Sub-bab ini membahas hal yang mengubah sifat percakapan, yaitu kemampuan model memanggil alat yang benar-benar melakukan sesuatu, mulai dari membaca berkas sampai menjalankan perintah.',
      ),
      p(
        'Ini jembatan menuju Bab 3 dan 4. Claude Code dan Codex pada dasarnya adalah model bahasa yang diberi seperangkat alat, dan hampir semua perilaku yang akan kamu atur di sana adalah perilaku pemakaian alat.',
      ),

      terms(
        {
          term: 'tool use',
          meaning:
            'Kemampuan model memanggil fungsi yang kamu sediakan, dengan argumen yang ia susun sendiri, lalu menerima hasilnya sebagai bahan untuk langkah berikutnya. Dibaca "tul yus". Sering disebut juga function calling. Yang perlu kamu pegang, model tidak menjalankan apa pun sendiri, ia hanya menyatakan niat memanggil dan sistem di sekelilingnya yang benar-benar menjalankan.',
        },
        {
          term: 'tool definition (definisi alat)',
          meaning:
            'Keterangan tentang sebuah alat yang dibaca model, berisi nama, penjelasan kegunaannya, dan bentuk parameternya. Inilah satu-satunya bahan yang dipakai model untuk memutuskan kapan alat itu layak dipanggil, sehingga penjelasan yang kabur di sini menghasilkan pemakaian yang keliru di sana.',
        },
        {
          term: 'overtriggering',
          meaning:
            'Keadaan model memanggil alat lebih sering daripada yang dibutuhkan, misalnya menjalankan pencarian untuk hal yang bisa ia jawab langsung. Dokumentasi Anthropic menyebut ini sebagai akibat langsung dari instruksi yang terlalu memaksa, dan obatnya adalah melunakkan bahasanya.',
        },
        {
          term: 'undertriggering',
          meaning:
            'Kebalikannya, yaitu model tidak memakai alat padahal seharusnya, misalnya menjawab pertanyaan tentang isi berkas tanpa membuka berkasnya. Kesalahan ini lebih berbahaya daripada overtriggering karena hasilnya terdengar meyakinkan sementara pijakannya tidak ada.',
        },
        {
          term: 'parallel tool calling',
          meaning:
            'Memanggil beberapa alat sekaligus dalam satu giliran ketika panggilan itu tidak saling bergantung, misalnya membaca tiga berkas bersamaan. Model terbaru melakukannya sendiri dengan tingkat keberhasilan tinggi, dan perilakunya bisa kamu dorong atau kamu redam lewat prompt.',
        },
        {
          term: 'tool result (hasil alat)',
          meaning:
            'Keluaran yang dikembalikan sistem setelah menjalankan alat, lalu dimasukkan kembali ke percakapan sebagai bahan. Ini yang menempati context window, dan ini pula sebabnya perintah yang mencetak keluaran sangat panjang bisa memenuhi konteks lebih cepat daripada yang kamu duga.',
        },
        {
          term: 'agentic loop',
          meaning:
            'Siklus berulang yang menjadi inti kerja agent, yaitu model memutuskan langkah, sistem menjalankannya, hasilnya kembali ke model, lalu model memutuskan langkah berikutnya. Siklus itu berhenti ketika model menganggap pekerjaannya selesai. Bab 3 membahas kenapa titik berhenti itu adalah hal terpenting yang harus kamu kendalikan.',
        },
      ),

      h2('Menyuruh bertindak, bukan menyarankan'),
      p(
        'Ini masalah paling umum pada model yang punya alat, dan sudah disinggung di sub-bab 1.3. Di sini kita lihat sebabnya. Model terbaru mengikuti instruksi dengan lebih presisi, sehingga permintaan yang secara harfiah berbunyi seperti pertanyaan akan dijawab sebagai pertanyaan.',
      ),
      compare(
        {
          title: 'Dibaca sebagai permintaan pendapat',
          lang: 'text',
          code: `
          Bisakah kamu menyarankan beberapa perubahan
          untuk memperbaiki fungsi ini?
          `,
          notes: [
            'Model menjawab dengan daftar saran.',
            'Tidak ada berkas yang berubah, dan itu memang yang diminta secara harfiah.',
          ],
        },
        {
          title: 'Dibaca sebagai permintaan tindakan',
          lang: 'text',
          code: `
          Ubah fungsi ini supaya lebih cepat.
          `,
          notes: [
            'Kalimat perintah, jadi model memakai alat untuk benar-benar mengubahnya.',
            'Lebih pendek, dan justru lebih tegas.',
          ],
        },
      ),
      p(
        'Kalau kamu ingin mengatur perilaku bawaannya alih-alih menulis ulang tiap kalimat, dokumentasi Anthropic menyediakan dua bentuk instruksi sistem yang saling berlawanan. Yang satu membuat model condong bertindak, yang lain membuatnya condong menahan diri. Keduanya sah, dan pilihannya bergantung pada seberapa besar biaya kesalahan di pekerjaanmu.',
      ),
      code(
        'text',
        `
        # Condong bertindak
        <default_bertindak>
        Secara bawaan, terapkan perubahan alih-alih hanya
        menyarankannya. Kalau maksud saya belum jelas, simpulkan
        tindakan yang paling mungkin berguna lalu jalankan, dan
        pakai alat untuk mencari detail yang kurang alih-alih
        menebaknya.
        </default_bertindak>

        # Condong menahan diri
        <jangan_bertindak_sebelum_diminta>
        Jangan langsung mengubah berkas kecuali saya memintanya
        dengan jelas. Kalau maksud saya belum jelas, kerjakan
        penelusuran dan berikan rekomendasi lebih dulu alih-alih
        mengambil tindakan.
        </jangan_bertindak_sebelum_diminta>
        `,
        {
          caption:
            'Pilih satu sesuai risiko pekerjaanmu. Memasang keduanya sekaligus hanya membuat perilakunya sulit ditebak.',
        },
      ),
      p(
        'Untuk project yang punya test lengkap dan riwayat git yang rapi, bentuk pertama biasanya lebih produktif karena kesalahan mudah dibatalkan. Untuk pekerjaan yang menyentuh sistem bersama atau data yang sulit dipulihkan, bentuk kedua lebih tepat. Ini keputusan yang sama dengan memilih antara bergerak cepat dan bergerak hati-hati, dan jawabannya memang bergantung konteks.',
      ),

      h2('Mengatur seberapa agresif alat dipakai'),
      p(
        'Instruksi yang terlalu memaksa punya efek samping yang berlawanan dengan maksudnya. Dokumentasi Anthropic menyatakan bahwa prompt yang dulu ditulis untuk melawan undertriggering sekarang bisa menyebabkan overtriggering pada model terbaru.',
      ),
      table(
        ['Bentuk lama', 'Masalahnya sekarang', 'Bentuk yang dianjurkan'],
        [
          [
            'PENTING, kamu HARUS memakai alat ini ketika ...',
            'Memicu pemakaian bahkan saat tidak relevan',
            'Pakai alat ini ketika ...',
          ],
          [
            'Kalau ragu, pakai alat ini',
            'Model sering ragu, sehingga alatnya hampir selalu dipakai',
            'Pakai alat ini ketika ia benar-benar menambah pemahaman soal masalahnya',
          ],
          [
            'Selalu telusuri dulu sebelum menjawab apa pun',
            'Pertanyaan sederhana ikut menghabiskan waktu dan token',
            'Telusuri sebelum menjawab pertanyaan tentang isi kode di project ini',
          ],
        ],
        'Ketiganya adalah bentuk yang sama, yaitu mengganti aturan menyeluruh dengan aturan bersyarat.',
      ),
      p(
        'Pola perbaikannya seragam. Aturan menyeluruh berbunyi "selalu" dan "harus", sedangkan aturan bersyarat menyebutkan keadaan yang membuat alat itu berguna. Aturan bersyarat memberi model dasar untuk memutuskan, sedangkan aturan menyeluruh menghapus keputusan itu sama sekali.',
      ),

      h2('Panggilan sejajar dan kapan meredamnya'),
      p(
        'Model terbaru menjalankan panggilan yang tidak saling bergantung secara bersamaan. Ini mempercepat pekerjaan, terutama saat menelusuri codebase yang butuh membaca banyak berkas. Perilakunya bisa kamu dorong sampai hampir selalu, atau kamu redam.',
      ),
      code(
        'text',
        `
        <pakai_panggilan_sejajar>
        Kalau kamu berniat memanggil beberapa alat dan tidak ada
        ketergantungan di antara panggilan itu, lakukan semuanya
        sekaligus. Contohnya saat membaca tiga berkas, jalankan
        tiga panggilan bersamaan alih-alih berurutan. Tetapi kalau
        sebuah panggilan membutuhkan hasil panggilan sebelumnya
        untuk menentukan parameternya, jalankan berurutan dan
        jangan pernah menebak parameter yang belum diketahui.
        </pakai_panggilan_sejajar>
        `,
        {
          caption:
            'Kalimat terakhir adalah pagarnya. Tanpa itu, dorongan bekerja sejajar bisa berubah menjadi menebak parameter supaya bisa berjalan bersamaan.',
        },
      ),
      p(
        'Ada satu keadaan di mana kamu justru ingin meredamnya. Perintah yang berat, misalnya beberapa proses build sekaligus, bisa membebani mesinmu bila dijalankan bersamaan. Dokumentasi Anthropic menyebut hal ini secara langsung, dan penyelesaiannya berupa instruksi untuk menjalankan operasi secara berurutan.',
      ),

      h2('Menjaga hasil alat tetap ramping'),
      p(
        'Hasil alat masuk ke context window, dan hasil yang panjang menghabiskannya cepat. Ini masalah yang jarang terpikirkan sampai kamu menghadapinya, dan penyelesaiannya justru berada di prompt.',
      ),
      code(
        'text',
        `
        Saat menjalankan perintah yang mungkin mencetak keluaran
        panjang, batasi keluarannya lebih dulu. Contohnya pakai
        penyaringan atau pembatasan jumlah baris, dan hanya
        tampilkan bagian yang menentukan. Untuk test yang gagal,
        cukup tampilkan nama test-nya, pesan gagalnya, dan
        beberapa baris pertama yang menyebut kode project ini.
        `,
        { caption: 'Satu instruksi ini bisa memperpanjang umur sebuah sesi secara mencolok.' },
      ),
      p(
        'Ini bentuk lain dari aturan yang sudah kamu temui di sub-bab 2.4, yaitu menyaring sebelum menempel. Bedanya, di sini yang menyaring adalah agent-nya sendiri, dan yang perlu kamu lakukan hanya memberitahunya bahwa kamu peduli soal itu.',
      ),

      h2('Batas yang tidak boleh kamu serahkan ke prompt'),
      p(
        'Sub-bab ini menutup dengan peringatan yang akan diulang di Bab 4 dalam bentuk yang lebih konkret. Instruksi adalah arahan, bukan penegakan.',
      ),
      table(
        ['Yang kamu inginkan', 'Lewat prompt', 'Penegakan sebenarnya'],
        [
          [
            'Jangan menghapus berkas',
            'Bisa diminta, dan hampir selalu dituruti',
            'Batas izin alat, atau sandbox yang memang tidak mengizinkan',
          ],
          [
            'Jangan menyentuh produksi',
            'Bisa diminta',
            'Kredensial yang memang tidak punya akses ke produksi',
          ],
          ['Jangan mengirim data keluar', 'Bisa diminta', 'Sandbox tanpa akses jaringan'],
          [
            'Selalu jalankan test sebelum menyatakan selesai',
            'Bisa diminta',
            'Hook yang menjalankannya secara otomatis',
          ],
        ],
        'Kolom tengah bernilai, tetapi ia tidak pernah menjadi jaminan.',
      ),
      p(
        'Kolom tengah bukan sia-sia, dan menuliskannya tetap layak. Yang keliru adalah memperlakukannya sebagai pengaman. Ketika akibat kesalahannya sulit dibalik, pengamannya harus berada di lapisan yang tidak bergantung pada keputusan model. Prinsipnya sama persis dengan yang sudah kamu pelajari di [Batas Aplikasi Web](/kelas/keamanan-fullstack/batas-aplikasi-web), yaitu pemeriksaan di sisi yang kamu kendalikan.',
      ),

      h2('Rangkuman'),
      ul(
        'Model tidak menjalankan alat sendiri, ia menyatakan niat memanggil dan sistem yang menjalankan.',
        'Kalimat perintah membuat model bertindak, kalimat bertanya membuatnya menyarankan.',
        'Instruksi yang terlalu memaksa menyebabkan alat dipakai berlebihan, dan obatnya adalah aturan bersyarat.',
        'Panggilan sejajar mempercepat penelusuran, dan pagarnya adalah larangan menebak parameter.',
        'Hasil alat menempati context window, jadi minta agent menyaring keluaran yang panjang.',
        'Instruksi adalah arahan, sedangkan penegakan berada di izin, sandbox, dan hook.',
      ),

      references(
        {
          label: 'Tool use',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber contoh prompt bertindak, menahan diri, dan pengaturan panggilan sejajar.',
        },
        {
          label: 'Tool use with Claude',
          href: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
          source: 'Anthropic',
          note: 'Cara mendefinisikan alat dan menelusuri kenapa sebuah alat tidak terpicu.',
        },
        {
          label: 'Model Context Protocol',
          href: 'https://modelcontextprotocol.io/docs/getting-started/intro',
          source: 'MCP',
          note: 'Standar terbuka untuk menyambungkan model ke alat dan sumber data di luar dirinya.',
        },
      ),
    ],
  ),

  written(
    'mengurangi-halusinasi',
    'Mengurangi Halusinasi dan Klaim Tanpa Bukti',
    13,
    'Kenapa model mengarang, dan tujuh cara menekannya pada pekerjaan kode.',
    [
      p(
        'Ini kegagalan yang paling mahal, dan sekaligus paling sulit dilihat. Kegagalan lain memberi gejala. Jawaban yang salah formatnya terlihat salah, jawaban yang melenceng terasa melenceng. Jawaban yang mengarang justru terlihat sempurna, karena satu-satunya yang salah adalah isinya.',
      ),
      p(
        'Sub-bab ini menjelaskan kenapa hal itu terjadi, lalu mengumpulkan cara menekannya. Perhatikan kata menekan, bukan menghilangkan. Tidak ada teknik prompt yang menghapus kemungkinan ini, dan siapa pun yang menjanjikannya sedang menjual sesuatu.',
      ),

      terms(
        {
          term: 'hallucination (halusinasi)',
          meaning:
            'Keluaran yang disajikan sebagai fakta padahal tidak berdasar, misalnya nama fungsi yang tidak ada, opsi konfigurasi yang tidak pernah ditulis siapa pun, atau kutipan dokumentasi yang tidak pernah terbit. Istilahnya agak menyesatkan karena terdengar seperti kesalahan langka. Ia sebenarnya akibat wajar dari cara kerja model, yaitu menyusun kelanjutan teks yang paling masuk akal, bukan mengambil fakta dari basis data.',
        },
        {
          term: 'confabulation',
          meaning:
            'Istilah yang sebagian orang anggap lebih tepat daripada halusinasi, karena yang terjadi lebih mirip mengisi kekosongan dengan hal yang terdengar wajar daripada melihat sesuatu yang tidak ada. Kamu akan menemuinya di sebagian tulisan, dan artinya sama.',
        },
        {
          term: 'grounding',
          meaning:
            'Menempelkan jawaban pada bahan nyata yang bisa diperiksa. Ini penangkal paling ampuh, dan wujud paling konkretnya pada pekerjaan kode adalah menyuruh model membuka berkasnya sebelum berbicara tentang isinya.',
        },
        {
          term: 'citation (kutipan sumber)',
          meaning:
            'Menyebut dari mana sebuah klaim berasal, misalnya nama berkas dan nomor baris. Nilainya ganda. Ia menaikkan ketepatan karena memaksa model menempatkan bahannya di hadapan sendiri, dan ia membuat kesalahan bisa kamu periksa dalam hitungan detik.',
        },
        {
          term: 'knowledge cutoff',
          meaning:
            'Batas waktu bahan pelatihan sebuah model. Segala sesuatu yang terbit sesudah batas itu tidak diketahuinya, kecuali kamu menyertakannya di dalam prompt atau ia mencarinya lewat alat. Inilah sebab paling sering munculnya nama opsi yang sudah berganti dan API yang sudah berubah.',
        },
        {
          term: 'sycophancy',
          meaning:
            'Kecenderungan menyetujui pernyataan pengguna meski pernyataan itu keliru. Dibaca "sikofansi". Wujudnya di pekerjaan kode berupa jawaban "benar sekali" ketika kamu menyebut nama fungsi yang sebenarnya tidak ada. Cara memancingnya keluar sederhana, yaitu jangan menyisipkan kesimpulanmu sendiri ke dalam pertanyaan.',
        },
      ),

      h2('Kenapa mengarang adalah perilaku wajar'),
      p(
        'Model menyusun kelanjutan teks yang paling masuk akal berdasarkan yang sudah ada. Ketika kamu bertanya tentang sesuatu yang tidak ia ketahui, tidak ada mekanisme bawaan yang berhenti dan berkata tidak tahu. Yang ada adalah mekanisme yang menyusun kelanjutan, dan kelanjutan yang paling masuk akal untuk pertanyaan tentang opsi konfigurasi adalah sebuah nama opsi yang terdengar wajar.',
      ),
      p(
        'Dari penjelasan itu lahir tiga akibat praktis. Pertama, mengarang paling sering muncul di area yang jarang, karena di sana bahan yang benar-benar ada paling sedikit. Kedua, hasil karangan justru terdengar sangat meyakinkan, karena kewajarannya memang yang sedang dioptimalkan. Ketiga, jawaban tidak tahu harus diminta, karena ia bukan bawaan.',
      ),
      callout(
        'warning',
        'Yang paling sering dikarang pada pekerjaan kode',
        'Nama opsi konfigurasi, nama flag pada CLI, nama method pada library yang jarang dipakai, nomor versi yang menyebut kapan sebuah fitur muncul, dan tautan dokumentasi. Kelimanya punya ciri sama, yaitu terlihat sangat wajar dan sangat mudah diperiksa. Kebiasaan memeriksa kelimanya sebelum memakai adalah kebiasaan yang paling banyak menghemat waktu.',
      ),

      h2('Tujuh cara menekannya'),
      p(
        'Diurutkan dari yang paling besar pengaruhnya. Empat pertama berlaku untuk pekerjaan apa pun, tiga terakhir khusus untuk agent yang bisa membaca berkas.',
      ),
      steps(
        {
          title: 'Beri bahannya, jangan mengandalkan ingatannya',
          body: 'Pertanyaan tentang perilaku sebuah fungsi yang disertai isi fungsinya punya peluang salah yang jauh lebih kecil daripada pertanyaan yang sama tanpa bahan. Ini penerapan grounding yang sudah dibahas di sub-bab 1.4.',
        },
        {
          title: 'Minta kutipan untuk tiap klaim',
          body: 'Suruh setiap pernyataan tentang kode menyebut berkas dan nomor barisnya. Klaim yang tidak bisa ditunjuk sumbernya biasanya memang tidak punya sumber, dan itu langsung terlihat saat kamu membacanya.',
        },
        {
          title: 'Beri izin berkata tidak tahu',
          body: 'Nyatakan dengan jelas bahwa jawaban tidak tahu adalah jawaban yang benar ketika bahannya memang tidak ada. Tanpa itu, model menganggap tugasnya selalu menghasilkan jawaban.',
        },
        {
          title: 'Jangan menyisipkan kesimpulanmu ke dalam pertanyaan',
          body: 'Pertanyaan "kenapa fungsi cacheUser lambat" mengandaikan fungsi itu ada dan memang lambat. Bentuk yang lebih aman adalah "apakah ada fungsi yang menangani cache pengguna, dan bagaimana perilakunya".',
        },
        {
          title: 'Suruh membaca sebelum menjawab',
          body: 'Pada agent, ini penangkal yang paling langsung. Instruksi berupa larangan berspekulasi tentang kode yang belum dibuka mengubah jawaban dari tebakan menjadi laporan.',
        },
        {
          title: 'Minta pemeriksaan, bukan pernyataan',
          body: 'Alih-alih bertanya apakah sebuah perintah benar, minta ia menjalankan perintah itu lalu melaporkan hasilnya. Perintah yang benar-benar berjalan adalah bukti, sedangkan keyakinan bukan.',
        },
        {
          title: 'Verifikasi klaim yang mudah diperiksa',
          body: 'Nama flag, nama opsi, dan tautan dokumentasi bisa diperiksa dalam beberapa detik. Biasakan memeriksanya, terutama ketika ia menjadi dasar keputusan yang lebih besar.',
        },
      ),

      h2('Bentuk instruksi yang bisa kamu pakai langsung'),
      p(
        'Dokumentasi Anthropic menyediakan bentuk yang khusus ditujukan untuk pekerjaan kode agentik, dan isinya menggabungkan cara kelima dan keenam di atas.',
      ),
      code(
        'text',
        `
        <telusuri_sebelum_menjawab>
        Jangan pernah berspekulasi tentang kode yang belum kamu buka.
        Kalau saya menyebut sebuah berkas, kamu harus membacanya
        sebelum menjawab. Telusuri dan baca berkas yang relevan
        sebelum menjawab pertanyaan tentang codebase ini. Jangan
        membuat klaim apa pun tentang kode sebelum memeriksanya,
        kecuali kamu benar-benar yakin jawabannya benar.
        </telusuri_sebelum_menjawab>
        `,
        {
          caption:
            'Cocok ditaruh di berkas instruksi project, karena aturannya berlaku untuk semua pekerjaan di sana.',
        },
      ),
      p(
        'Untuk pekerjaan non-kode, bentuk yang setara berbunyi lebih pendek. Isinya kira-kira begini, yaitu jawab hanya berdasarkan bahan yang saya berikan, dan kalau bahannya tidak memuat jawabannya, tulis bahwa informasinya tidak ada di bahan yang diberikan alih-alih menyimpulkan dari pengetahuan umum.',
      ),

      h2('Bentuk mengarang yang khas pada pekerjaan kode'),
      p(
        'Selain mengarang fakta, ada beberapa bentuk yang lebih halus dan lebih merepotkan karena kodenya benar-benar berjalan.',
      ),
      table(
        ['Bentuk', 'Gejalanya', 'Instruksi penangkalnya'],
        [
          [
            'Menyesuaikan kode agar test lulus',
            'Nilai yang ditulis langsung supaya cocok dengan test, bukan logika yang benar',
            'Minta solusi umum yang benar untuk semua masukan sah, bukan hanya untuk kasus di test',
          ],
          [
            'Mengubah atau menghapus test yang menghalangi',
            'Test yang tadinya gagal menghilang tanpa penjelasan',
            'Nyatakan bahwa menghapus atau melonggarkan test tidak diperbolehkan',
          ],
          [
            'Menambal gejala dengan penanganan error',
            'Blok penangkap error yang muncul tepat di sekitar bagian yang gagal',
            'Larang menambah penangkapan error sebelum akar masalahnya dijelaskan',
          ],
          [
            'Membuat skrip pembantu sebagai jalan pintas',
            'Berkas baru yang mengerjakan hal yang seharusnya dikerjakan alat standar',
            'Minta pemakaian alat standar project, tanpa skrip pembantu',
          ],
          [
            'Melaporkan selesai tanpa menjalankan pemeriksaan',
            'Klaim hijau tanpa keluaran perintah yang menyertainya',
            'Minta bukti berupa perintah yang dijalankan beserta keluarannya',
          ],
        ],
        'Kelimanya menghasilkan kode yang berjalan, dan itulah yang membuatnya sulit terdeteksi.',
      ),
      p(
        'Baris pertama dan kedua punya bentuk instruksi resmi di dokumentasi Anthropic, dan isinya cukup panjang karena ia menutup beberapa jalan keluar sekaligus. Intinya begini, yaitu tulis solusi umum yang berkualitas dengan alat standar yang tersedia, jangan membuat skrip pembantu atau jalan pintas, jangan menuliskan nilai secara langsung supaya cocok dengan test, dan kalau ada test yang menurutmu keliru maka beri tahu saya alih-alih mengakalinya.',
      ),
      p(
        'Baris terakhir bersambung langsung dengan kebiasaan yang sudah kamu bangun sepanjang kurikulum ini. Klaim tanpa keluaran perintah bukan verifikasi, dan aturan itu berlaku sama untuk pekerjaan yang dikerjakan agent. Bab 3 membahas cara memasang pemeriksaan yang tidak bergantung pada kepatuhan.',
      ),

      h2('Yang tidak bisa diselesaikan prompt'),
      p(
        'Ada satu kelas kesalahan yang tidak akan hilang berapa pun bagusnya prompt-mu, yaitu pengetahuan yang memang tidak dimiliki model.',
      ),
      table(
        ['Situasi', 'Kenapa prompt tidak cukup', 'Yang bekerja'],
        [
          [
            'Library berubah sesudah batas pengetahuan model',
            'Bahannya memang tidak pernah ada',
            'Sertakan dokumentasinya, atau biarkan ia mencarinya lewat alat',
          ],
          [
            'Konvensi internal tim yang tidak tertulis',
            'Tidak ada di kode dan tidak ada di mana pun',
            'Tuliskan di berkas instruksi project',
          ],
          [
            'Keadaan sistem saat ini, misalnya isi database',
            'Berubah setiap saat',
            'Beri akses lewat alat, atau sertakan hasil query-nya',
          ],
          [
            'Angka yang hanya kamu yang tahu',
            'Model akan mengisi dengan nilai yang wajar',
            'Sebutkan angkanya, dan minta asumsi ditandai sebagai asumsi',
          ],
        ],
        'Keempatnya adalah bentuk berbeda dari satu hal, yaitu bahan yang belum pernah sampai ke hadapannya.',
      ),
      p(
        'Baris pertama layak diberi perhatian khusus karena ia mengenai pekerjaan sehari-hari. Dokumentasi library berubah, nama opsi berganti, dan sebuah cara yang dulu benar bisa menjadi usang. Kebiasaan memeriksa terhadap dokumentasi resmi, persis yang dilakukan setiap sub-bab di kurikulum ini lewat blok rujukan, adalah penangkal yang tidak tergantikan.',
      ),

      h2('Rangkuman'),
      ul(
        'Mengarang adalah akibat wajar dari cara kerja model, bukan kerusakan langka.',
        'Hasil karangan terdengar meyakinkan justru karena kewajarannya yang sedang dioptimalkan.',
        'Penangkal terkuat adalah menyertakan bahannya dan meminta kutipan untuk tiap klaim.',
        'Jawaban tidak tahu harus diminta secara eksplisit, karena ia bukan bawaan.',
        'Pada pekerjaan kode, bentuk yang paling merepotkan adalah kode yang berjalan tetapi mengakali test.',
        'Klaim tanpa keluaran perintah bukan verifikasi, dan aturan itu berlaku sama untuk agent.',
      ),

      references(
        {
          label: 'Minimizing hallucinations in agentic coding',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber instruksi telusuri sebelum menjawab dan larangan mengakali test.',
        },
        {
          label: 'Reduce hallucinations',
          href: 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations',
          source: 'Anthropic',
          note: 'Kumpulan teknik resmi, termasuk memberi izin berkata tidak tahu dan meminta kutipan.',
        },
        {
          label: 'Give Claude a way to verify its work',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Menyatakan bahwa bukti berupa keluaran perintah lebih cepat ditinjau daripada mengulang verifikasinya sendiri.',
        },
      ),
    ],
  ),

  written(
    'iterasi-dan-anti-pola',
    'Iterasi dan Anti-Pola',
    12,
    'Cara memperbaiki prompt yang gagal, dan sepuluh kebiasaan yang justru memperburuk.',
    [
      p(
        'Bab ini ditutup dengan hal yang paling sering kamu lakukan tetapi paling jarang dipikirkan, yaitu apa yang kamu kerjakan tepat setelah sebuah prompt gagal. Keputusan di detik itu menentukan apakah kamu akan selesai dalam dua percobaan atau dalam dua puluh.',
      ),
      p(
        'Bagian kedua sub-bab ini berisi kebiasaan yang terlihat masuk akal tetapi hasilnya berlawanan. Sebagiannya adalah nasihat yang dulu benar dan sekarang tidak lagi, sebagiannya lagi tidak pernah benar tetapi tersebar luas.',
      ),

      terms(
        {
          term: 'iteration (iterasi)',
          meaning:
            'Putaran memperbaiki berdasarkan hasil, bukan berdasarkan dugaan. Satu iterasi yang sehat punya tiga bagian, yaitu mengamati kegagalannya secara spesifik, menduga sebabnya, lalu mengubah satu hal untuk menguji dugaan itu. Yang tidak punya tiga bagian itu bukan iterasi melainkan mengaduk.',
        },
        {
          term: 'failure mode (bentuk kegagalan)',
          meaning:
            'Cara khas sebuah prompt gagal, misalnya selalu terlalu panjang, selalu melewatkan kasus kosong, atau selalu mengarang nama opsi. Mengenali bentuknya jauh lebih berguna daripada menilai jawabannya buruk, karena tiap bentuk punya perbaikan yang berbeda.',
        },
        {
          term: 'prompt bloat',
          meaning:
            'Keadaan prompt membengkak karena tiap kegagalan dijawab dengan menambah kalimat, tanpa ada yang pernah dihapus. Akibatnya berlawanan dengan maksudnya, yaitu instruksi yang benar-benar penting menjadi tidak menonjol di antara puluhan aturan lain.',
        },
        {
          term: 'cargo cult prompting',
          meaning:
            'Menyalin bentuk prompt yang katanya bekerja tanpa memahami kenapa ia bekerja, lalu menempelkannya ke keadaan yang berbeda. Ciri khasnya berupa kalimat pemanis seperti janji hadiah atau ancaman, yang bertahan sebagai kebiasaan meski tidak ada dasarnya pada model masa kini.',
        },
        {
          term: 'ablation',
          meaning:
            'Menguji sebuah bagian dengan cara menghapusnya lalu melihat apakah hasilnya berubah. Dibaca "ablasyen". Ini cara paling jujur menemukan bagian prompt yang sebenarnya tidak berjasa, dan ia satu-satunya obat untuk prompt bloat.',
        },
      ),

      h2('Empat pertanyaan sesudah sebuah prompt gagal'),
      p(
        'Sebelum mengetik perbaikan, jawab keempat ini. Urutannya menentukan, karena pertanyaan pertama sering membuat tiga sisanya tidak perlu.',
      ),
      steps(
        {
          title: 'Apakah ini benar-benar soal prompt?',
          body: 'Kalau yang kurang adalah bahan yang memang tidak pernah dikirim, atau pengetahuan yang memang tidak dimiliki model, memperbaiki kalimat tidak akan mengubah apa pun. Ini pertanyaan yang sudah dibahas di sub-bab 1.1 dan tetap yang pertama.',
        },
        {
          title: 'Gagalnya dalam bentuk apa?',
          body: 'Sebutkan sespesifik mungkin. Bukan "jawabannya jelek", melainkan "ia melewatkan kasus data kosong" atau "ia mengubah berkas di luar folder yang saya sebut". Bentuk yang spesifik langsung menunjuk perbaikannya.',
        },
        {
          title: 'Gagalnya selalu atau kadang?',
          body: 'Jalankan ulang dua kali. Kegagalan yang selalu terjadi biasanya berarti ada satu hal yang jelas kurang. Kegagalan yang kadang terjadi berarti prompt-mu berada di batas, dan yang perlu ditambah adalah ketegasan, bukan panjang.',
        },
        {
          title: 'Apa satu perubahan terkecil yang menguji dugaanku?',
          body: 'Satu, bukan lima. Kalau dugaanmu adalah instruksinya tenggelam, pindahkan posisinya tanpa mengubah kata-katanya. Kalau dugaanmu adalah bentuknya belum jelas, tambahkan satu contoh tanpa menyentuh yang lain.',
        },
      ),
      p(
        'Pertanyaan ketiga adalah yang paling sering dilewati dan paling banyak menghemat waktu. Memperbaiki prompt berdasarkan satu kali kegagalan berisiko memperbaiki sesuatu yang sebenarnya tidak rusak, karena sifat model yang tidak deterministik membuat satu percobaan bukan bukti.',
      ),

      h2('Perbaikan yang cocok untuk tiap bentuk kegagalan'),
      table(
        ['Bentuk kegagalan', 'Perbaikan yang biasanya tepat', 'Yang biasanya tidak menolong'],
        [
          [
            'Melewatkan kasus tepi',
            'Tambah satu contoh berisi kasus tepi itu',
            'Menambah kalimat "perhatikan semua kasus"',
          ],
          [
            'Bentuk keluarannya berubah-ubah',
            'Bungkus bagian yang kamu perlukan di tag, atau pakai skema',
            'Mengulang permintaan format dengan kata lain',
          ],
          [
            'Jawabannya melebar keluar cakupan',
            'Sebutkan batasnya dan apa yang tidak boleh disentuh',
            'Menambah penekanan pada instruksi yang sudah ada',
          ],
          [
            'Klaimnya tidak berdasar',
            'Minta kutipan berkas dan nomor baris untuk tiap klaim',
            'Menambahkan peran seperti "kamu ahli"',
          ],
          [
            'Instruksi awal mulai diabaikan',
            'Pindahkan ke system prompt, atau mulai percakapan baru',
            'Mengulang instruksinya di pesan terbaru',
          ],
          [
            'Terlalu banyak menalar untuk hal sederhana',
            'Ringkaskan prompt sistemnya, atau turunkan effort',
            'Menyuruhnya lebih cepat',
          ],
        ],
        'Kolom kanan berisi kebiasaan yang menambah panjang tanpa menambah kejelasan.',
      ),
      p(
        'Perhatikan pola di kolom tengah. Hampir semuanya berupa mengubah struktur atau menambah bahan, bukan menambah tekanan. Menambah tekanan pada instruksi yang sudah ada adalah perbaikan yang paling sering dicoba dan paling jarang berhasil.',
      ),

      h2('Membuang bagian yang tidak berjasa'),
      p(
        'Prompt yang dipakai berulang cenderung tumbuh dan hampir tidak pernah menyusut. Setiap kegagalan meninggalkan satu kalimat baru, dan tidak ada yang pernah memeriksa apakah kalimat lama masih diperlukan.',
      ),
      p(
        'Obatnya adalah membuang satu bagian lalu menjalankan kasus ujimu. Kalau hasilnya tidak berubah, bagian itu memang tidak berjasa. Pekerjaan ini terasa aneh karena kamu sengaja mencoba merusak sesuatu yang sedang bekerja, dan justru di situ nilainya.',
      ),
      compare(
        {
          title: 'Prompt yang tumbuh tanpa dipangkas',
          lang: 'text',
          code: `
          Kamu adalah reviewer kode senior yang sangat teliti.
          PENTING: baca kodenya dengan sangat hati-hati.
          PENTING: jangan melewatkan apa pun.
          Pikirkan langkah demi langkah dengan sangat mendalam.
          Kamu HARUS memakai alat pencarian bila ragu sedikit pun.
          Berikan jawaban terbaikmu, ini sangat penting bagi saya.
          Sebutkan berkas dan nomor baris untuk tiap temuan.
          Jangan menilai gaya penulisan.
          `,
          notes: [
            'Dua baris terakhir yang benar-benar mengubah hasil.',
            'Enam baris sebelumnya menambah panjang dan meredam keduanya.',
            'Baris kelima justru memicu pencarian yang tidak perlu.',
          ],
        },
        {
          title: 'Sesudah dipangkas',
          lang: 'text',
          code: `
          Tinjau kode ini sebagai reviewer keamanan.
          Sebutkan berkas dan nomor baris untuk tiap temuan.
          Jangan menilai gaya penulisan.
          Tulis BERSIH bila tidak ada temuan.
          `,
          notes: [
            'Tiga baris asli yang berjasa, ditambah satu penanda hasil kosong.',
            'Perannya tetap ada tetapi tidak dibesar-besarkan.',
            'Diuji dengan kasus uji yang sama, hasilnya setara atau lebih baik.',
          ],
        },
      ),
      callout(
        'tip',
        'Pangkas ketika prompt-nya sudah bekerja, bukan ketika sedang rusak',
        'Waktu terbaik memangkas adalah saat kasus ujimu sedang hijau semua, karena kamu punya patokan untuk membandingkan. Memangkas saat prompt sedang gagal mencampur dua perubahan sekaligus dan membuat hasilnya tidak bisa disimpulkan.',
      ),

      h2('Sepuluh anti-pola'),
      p(
        'Sebagian dari daftar ini pernah menjadi nasihat yang benar. Yang membuatnya menjadi anti-pola adalah perubahan pada model, bukan kesalahan orang yang dulu menganjurkannya.',
      ),
      ol(
        'Menandai semua aturan sebagai penting. Penekanan bekerja karena ia jarang, dan menekankan segalanya sama dengan tidak menekankan apa pun.',
        'Menjanjikan hadiah atau memberi ancaman. Tidak ada dasarnya pada model masa kini, dan ia hanya menambah token sambil membuat prompt-mu sulit dipelihara.',
        'Menempelkan seluruh folder supaya aman. Menurunkan mencoloknya instruksi penting dan menghabiskan context window lebih cepat daripada perlu.',
        'Mengoreksi berulang di percakapan yang sama. Sesudah dua kali gagal, konteksnya sudah berisi dua pendekatan yang keliru, dan itu ikut terkirim tiap giliran.',
        'Menambah "berpikirlah langkah demi langkah" ke setiap prompt. Model terbaru sudah menalar sendiri saat perlu, dan tambahan ini justru bisa memicu penalaran untuk hal sederhana.',
        'Memakai prefill untuk memaksa bentuk. Sudah tidak didukung pada model Claude 4.6 ke atas dan mengembalikan error.',
        'Menganggap peran menaikkan ketepatan. Peran mempersempit sudut pandang, sedangkan ketepatan datang dari bahan dan pemeriksaan.',
        'Melarang tanpa memberi jalan keluar. Model dipaksa memilih antara melanggar instruksimu atau menyerahkan pekerjaan setengah jadi tanpa memberitahumu.',
        'Menyalin prompt panjang dari internet tanpa memangkasnya. Kamu mewarisi seluruh biayanya sekaligus seluruh anti-pola yang ada di dalamnya.',
        'Menilai perbaikan dari satu percobaan. Sifatnya tidak deterministik, jadi satu percobaan tidak membedakan prompt yang membaik dari prompt yang kebetulan beruntung.',
      ),
      p(
        'Nomor dua sering memancing perdebatan karena banyak orang merasa pernah melihatnya bekerja. Penjelasan yang paling masuk akal adalah kalimat semacam itu biasanya ditambahkan bersamaan dengan perbaikan lain yang benar-benar berjasa, dan kredit jatuh ke bagian yang paling mencolok. Cara membuktikannya persis ablation, yaitu buang kalimat itu saja lalu jalankan kasus ujimu.',
      ),

      h2('Menutup Bab 2'),
      p(
        'Dua bab pertama memberimu teknik yang berlaku di mana pun, yaitu kejelasan, konteks, contoh, struktur, peran, kriteria sukses, penalaran, format, pemecahan pekerjaan, konteks panjang, pemakaian alat, penekanan halusinasi, dan cara beriterasi. Semuanya tetap berlaku ketika nama produk berganti.',
      ),
      p(
        'Bab 3 memindahkan semuanya ke Claude Code, dan Bab 4 ke Codex. Yang berubah di sana bukan tekniknya, melainkan kenyataan bahwa jawabannya sekarang bisa mengubah isi disk-mu. Kenyataan itu menambahkan dua hal yang belum pernah kita bahas, yaitu pengelolaan context window sepanjang sesi panjang, dan batas izin yang tidak bergantung pada kepatuhan.',
      ),

      h2('Rangkuman'),
      ul(
        'Sebelum memperbaiki, pastikan dulu ini memang soal prompt dan bukan soal bahan yang kurang.',
        'Sebutkan bentuk kegagalannya secara spesifik, karena tiap bentuk punya perbaikan yang berbeda.',
        'Jalankan ulang dua kali sebelum menyimpulkan, karena satu percobaan bukan bukti.',
        'Perbaikan yang berhasil biasanya mengubah struktur atau menambah bahan, bukan menambah tekanan.',
        'Pangkas bagian yang tidak berjasa saat kasus ujimu sedang hijau, dengan cara membuangnya lalu menguji.',
        'Sebagian nasihat lama sudah tidak berlaku, termasuk prefill dan dorongan berpikir langkah demi langkah.',
      ),

      references(
        {
          label: 'Migration considerations',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Menyebut nasihat lama mana yang perlu disesuaikan untuk model terbaru.',
        },
        {
          label: 'Avoid common failure patterns',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Daftar kegagalan khas beserta perbaikannya, termasuk pola mengoreksi berulang.',
        },
        {
          label: 'Version prompts in code',
          href: 'https://developers.openai.com/api/docs/guides/prompt-engineering',
          source: 'OpenAI',
          note: 'Anjuran menyimpan prompt di dalam kode supaya bisa diversikan dan diuji seperti kode.',
        },
      ),
    ],
  ),
];
