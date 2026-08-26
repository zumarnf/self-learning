import {
  callout,
  checklist,
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
 * Prompt Engineering — Chapter 3, eight lessons.
 *
 * Claude Code as the first concrete agent. Every lesson names the problem before it names the
 * feature, because feature names move faster than the reasons behind them and the reader has to
 * be able to follow the material after a rename.
 *
 * The chapter deliberately assumes Chapters 1 and 2. Nothing general is re-taught here; what is
 * added is the part that only exists once the answer can change files on disk.
 */
export const lessons: LessonDraft[] = [
  written(
    'dari-chatbot-ke-agent',
    'Dari Chatbot ke Coding Agent',
    12,
    'Apa yang berubah ketika jawabannya bisa mengubah isi disk-mu.',
    [
      p(
        'Dua bab pertama membahas percakapan, yaitu teks masuk dan teks keluar. Bab ini membahas hal yang bentuknya mirip tetapi sifatnya berbeda, yaitu program yang memakai model bahasa untuk memutuskan langkah, lalu benar-benar menjalankan langkah itu di komputermu.',
      ),
      p(
        'Perbedaannya bukan pada kepintaran modelnya. Model yang sama bisa menjalankan keduanya. Yang berbeda adalah apa yang terjadi sesudah ia memutuskan, dan konsekuensi dari perbedaan itu jauh lebih besar daripada yang terlihat.',
      ),

      terms(
        {
          term: 'coding agent',
          meaning:
            'Program yang memakai model bahasa untuk mengerjakan tugas pemrograman lewat alat yang ia punya, seperti membaca berkas, menulis berkas, menjalankan perintah, dan memanggil layanan luar. Claude Code dan Codex adalah dua contohnya. Ciri pembedanya dari chatbot bukan mutu jawabannya, melainkan kenyataan bahwa keluarannya berupa perubahan nyata dan bukan hanya teks.',
        },
        {
          term: 'agentic loop',
          meaning:
            'Siklus yang menjadi inti kerja agent, yaitu model memutuskan langkah, sistem menjalankannya, hasilnya kembali ke model, lalu model memutuskan langkah berikutnya. Siklus berhenti ketika model menganggap pekerjaannya selesai. Karena titik berhenti itu ditentukan model, memberinya cara memeriksa hasil adalah hal terpenting yang bisa kamu lakukan.',
        },
        {
          term: 'harness',
          meaning:
            'Program di sekeliling model yang menyediakan alat, menjalankan panggilan, mengelola context window, dan menegakkan izin. Dibaca "harnes". Claude Code adalah harness, dan yang membedakan satu agent dari agent lain sebagian besar justru harness-nya, bukan modelnya.',
        },
        {
          term: 'surface (permukaan)',
          meaning:
            'Tempat kamu memakai agent, misalnya terminal, ekstensi editor, aplikasi desktop, atau peramban. Claude Code memakai istilah ini di dokumentasinya. Yang perlu kamu tahu, seluruh permukaan itu memakai mesin yang sama, sehingga berkas instruksi project dan pengaturanmu berlaku di semuanya.',
        },
        {
          term: 'permission mode (mode izin)',
          meaning:
            'Pengaturan yang menentukan tindakan apa saja yang boleh berjalan tanpa bertanya kepadamu lebih dulu. Inilah lapisan yang benar-benar menegakkan batas, berbeda dari instruksi di prompt yang sifatnya arahan. Dibahas penuh di Bab 4 bersama padanannya di Codex.',
        },
        {
          term: 'checkpoint',
          meaning:
            'Titik simpan yang dibuat otomatis sebelum agent mengubah berkas, sehingga kamu bisa mengembalikan keadaan percakapan, keadaan berkas, atau keduanya. Berguna sebagai jaring pengaman cepat, tetapi ia bukan pengganti git karena hanya melacak perubahan lewat alat penyunting berkas milik agent.',
        },
        {
          term: 'headless mode',
          meaning:
            'Menjalankan agent tanpa antarmuka percakapan, biasanya lewat satu perintah yang menerima prompt dan mencetak hasilnya. Dipakai di CI, di hook sebelum commit, atau di skrip. Bentuknya di Claude Code adalah `claude -p "prompt"`.',
        },
      ),

      h2('Tiga hal yang berubah'),
      p(
        'Semua yang akan kamu pelajari di bab ini turun dari tiga perubahan ini. Kalau kamu memahami ketiganya, sisanya menjadi masuk akal dengan sendirinya.',
      ),
      table(
        ['Aspek', 'Chatbot', 'Coding agent'],
        [
          [
            'Keluarannya',
            'Teks yang kamu salin sendiri kalau mau dipakai',
            'Perubahan berkas dan perintah yang benar-benar berjalan',
          ],
          [
            'Bahan yang dipakainya',
            'Yang kamu tempel',
            'Yang ia cari dan baca sendiri, sehingga kamu tidak sepenuhnya tahu isinya',
          ],
          [
            'Panjang satu pekerjaan',
            'Satu atau beberapa giliran',
            'Puluhan langkah, dan context window bisa penuh di tengah jalan',
          ],
          [
            'Akibat kesalahan',
            'Kamu membacanya lalu membuangnya',
            'Berkas sudah berubah, perintah sudah berjalan',
          ],
          [
            'Yang menghentikan pekerjaan',
            'Kamu, karena kamu yang mengetik giliran berikutnya',
            'Model, ketika ia menganggap hasilnya sudah terlihat selesai',
          ],
        ],
        'Baris terakhir adalah yang paling menentukan, dan sub-bab 3.7 seluruhnya membahasnya.',
      ),
      p(
        'Baris terakhir pantas dibaca dua kali. Pada chatbot, kamu adalah pemeriksa hasil karena kamu membaca setiap jawaban sebelum memakainya. Pada agent yang bekerja puluhan langkah, kamu tidak membaca setiap langkah, sehingga pemeriksaan harus datang dari tempat lain. Kalau tidak ada, satu-satunya sinyal yang tersedia adalah kesan bahwa pekerjaannya terlihat selesai.',
      ),

      h2('Apa yang bisa dikerjakannya'),
      p(
        'Sebelum masuk ke teknik, ada baiknya kamu punya gambaran konkret. Berikut bentuk pekerjaan yang cocok, dengan contoh yang memakai project di kurikulum ini.',
      ),
      table(
        ['Bentuk pekerjaan', 'Kenapa cocok', 'Contoh'],
        [
          [
            'Pekerjaan berulang yang membosankan',
            'Langkahnya jelas dan hasilnya mudah diperiksa',
            'Menulis test untuk modul yang belum punya test',
          ],
          [
            'Menelusuri codebase asing',
            'Ia bisa membaca banyak berkas lebih cepat daripada kamu',
            'Menjawab bagaimana autentikasi bekerja di project ini',
          ],
          [
            'Bug dengan gejala yang jelas',
            'Ada sinyal yang bisa merah, yaitu test atau pesan error',
            'Login gagal sesudah sesi kedaluwarsa',
          ],
          [
            'Perubahan yang menyentuh banyak berkas',
            'Melelahkan bagi manusia dan mudah bagi agent',
            'Mengganti nama sebuah fungsi beserta seluruh pemanggilnya',
          ],
          [
            'Pekerjaan git yang rutin',
            'Bentuk keluarannya sangat baku',
            'Membuat commit dan membuka pull request',
          ],
        ],
        'Ciri bersama kelimanya adalah adanya cara memeriksa hasilnya tanpa membaca seluruh perubahannya.',
      ),
      p(
        'Ciri bersama itu bukan kebetulan. Pekerjaan yang cocok untuk agent adalah pekerjaan yang punya pemeriksaan, dan pekerjaan yang tidak punya pemeriksaan bukan berarti tidak boleh dikerjakan agent, melainkan berarti kamu yang harus menjadi pemeriksanya. Menyadari perbedaan itu sebelum mulai jauh lebih murah daripada menyadarinya sesudah tiga puluh berkas berubah.',
      ),

      h2('Cara memulai yang tidak membuat kapok'),
      p(
        'Kalau ini pertama kalinya kamu memakai coding agent, urutan berikut menghemat banyak kekecewaan. Tiga langkah pertama tidak mengubah satu berkas pun.',
      ),
      steps(
        {
          title: 'Pakai untuk bertanya dulu',
          body: 'Buka project yang kamu kenal, lalu tanyakan hal yang kamu sudah tahu jawabannya. Ini memberimu gambaran seberapa dalam ia membaca dan seberapa dapat dipercaya jawabannya, tanpa risiko apa pun.',
        },
        {
          title: 'Lalu untuk menelusuri yang belum kamu tahu',
          body: 'Tanyakan hal yang kamu memang belum paham di project itu. Ini kegunaan yang sering diremehkan, dan dokumentasi Claude Code menyebutnya sebagai cara masuk yang efektif ke codebase asing.',
        },
        {
          title: 'Lalu minta rencana, bukan perubahan',
          body: 'Minta ia menyusun rencana untuk sebuah perubahan tanpa mengerjakannya. Kamu bisa menilai apakah pemahamannya benar sebelum satu baris pun berubah.',
        },
        {
          title: 'Baru minta perubahan kecil yang bisa diverifikasi',
          body: 'Pilih pekerjaan yang punya test atau punya cara diperiksa cepat. Pastikan pekerjaanmu sudah tersimpan di git lebih dulu, karena itu jaring pengaman yang sebenarnya.',
        },
      ),
      callout(
        'warning',
        'Simpan pekerjaanmu ke git sebelum menyerahkan sesuatu ke agent',
        'Ini bukan soal ketidakpercayaan, melainkan soal kemampuan membatalkan. Perubahan yang belum tersimpan di git tidak punya cara dikembalikan kalau ternyata arah kerjanya salah. Checkpoint bawaan agent membantu, tetapi ia hanya melacak perubahan yang dibuat lewat alat penyuntingnya sendiri dan tidak menangkap perubahan lewat perintah shell.',
      ),

      h2('Yang tetap menjadi tugasmu'),
      p(
        'Ada beberapa hal yang tidak berpindah ke agent, dan menyadarinya sejak awal mencegah kekecewaan yang bentuknya khas.',
      ),
      ul(
        'Memutuskan **apa** yang layak dibangun. Agent bisa menyusun rencana, tetapi ia tidak tahu prioritas produkmu.',
        'Menyediakan **domain knowledge** yang tidak ada di kode, seperti kesepakatan tim dan alasan di balik keputusan lama.',
        'Menentukan **apa artinya selesai**, dan menyediakan cara memeriksanya.',
        'Meninjau perubahan yang **sulit dibalik**, terutama yang menyentuh data atau sistem bersama.',
        'Menanggung **keputusan akhir**. Kode yang masuk ke repositorimu adalah tanggung jawabmu, siapa pun yang mengetiknya.',
      ),
      p(
        'Butir terakhir bukan formalitas hukum. Ia punya akibat praktis pada cara kamu bekerja, yaitu kamu tidak boleh menyetujui perubahan yang tidak kamu pahami. Kalau sebuah diff terlalu besar untuk kamu tinjau, itu tanda pekerjaannya perlu dipecah, bukan tanda kamu perlu meninjaunya lebih cepat.',
      ),

      h2('Peta bab ini'),
      p(
        'Tujuh sub-bab berikutnya disusun mengikuti urutan yang akan kamu temui di pemakaian nyata.',
      ),
      table(
        ['Sub-bab', 'Masalah yang diselesaikan'],
        [
          ['3.2 Context window sebagai anggaran', 'Kualitas menurun ketika konteks penuh'],
          ['3.3 Explore, plan, code, commit', 'Agent mengerjakan masalah yang salah'],
          ['3.4 Prompt spesifik di agent', 'Hasilnya melenceng dari yang kamu maksud'],
          ['3.5 CLAUDE.md', 'Kamu mengetik penjelasan yang sama tiap sesi'],
          ['3.6 Skills, subagent, dan hooks', 'Prosedur panjang dan aturan yang harus dijamin'],
          ['3.7 Verifikasi kerja agent', 'Selesai berarti terlihat selesai'],
          ['3.8 Pola kegagalan', 'Sesi yang berputar tanpa maju'],
        ],
        'Tiap barisnya menyebut masalah lebih dulu, karena nama fiturnya bisa berubah sedangkan masalahnya tidak.',
      ),

      h2('Rangkuman'),
      ul(
        'Agent berbeda dari chatbot bukan karena modelnya, melainkan karena keluarannya berupa perubahan nyata.',
        'Yang menghentikan pekerjaan adalah model, ketika hasilnya terlihat selesai, sehingga pemeriksaan harus datang dari tempat lain.',
        'Pekerjaan yang cocok adalah yang punya cara diperiksa tanpa membaca seluruh perubahannya.',
        'Mulailah dari bertanya dan menelusuri, karena keduanya tidak mengubah apa pun.',
        'Simpan pekerjaanmu ke git sebelum menyerahkan sesuatu ke agent.',
        'Keputusan akhir tetap milikmu, sehingga perubahan yang tidak kamu pahami tidak boleh kamu setujui.',
      ),

      references(
        {
          label: 'Claude Code overview',
          href: 'https://code.claude.com/docs/en/overview',
          source: 'Anthropic',
          note: 'Gambaran resmi tentang apa yang bisa dikerjakan dan di permukaan mana ia berjalan.',
        },
        {
          label: 'Ask codebase questions',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Menyebut penelusuran codebase sebagai cara masuk yang efektif, tanpa perlu prompt khusus.',
        },
        {
          label: 'Checkpointing',
          href: 'https://code.claude.com/docs/en/checkpointing',
          source: 'Anthropic',
          note: 'Menyatakan sendiri bahwa checkpoint hanya melacak perubahan lewat alat penyuntingnya dan bukan pengganti git.',
        },
      ),
    ],
  ),

  written(
    'context-window-anggaran',
    'Context Window sebagai Anggaran',
    13,
    'Sumber daya paling menentukan dalam satu sesi, dan cara membelanjakannya.',
    [
      p(
        'Dokumentasi Claude Code menyatakan sesuatu yang tidak biasa untuk sebuah panduan produk. Ia berkata bahwa hampir semua praktik terbaiknya berdiri di atas satu batasan, yaitu context window terisi cepat dan kualitas menurun seiring ia terisi.',
      ),
      p(
        'Kalimat itu layak dijadikan pegangan. Kalau kamu memahami satu hal saja dari bab ini, pahami bahwa context window adalah sumber daya yang kamu belanjakan, dan hampir setiap keputusan dalam sesi adalah keputusan belanja.',
      ),

      terms(
        {
          term: 'context window',
          meaning:
            'Ruang tempat seluruh percakapan berada, mencakup instruksi sistem, berkas instruksi project, tiap berkas yang dibaca, tiap keluaran perintah, dan seluruh pesan. Sudah dibahas di sub-bab 1.2, dan di sini ia berubah dari konsep menjadi hal yang kamu kelola aktif sepanjang sesi.',
        },
        {
          term: 'context rot',
          meaning:
            'Gejala menurunnya kualitas seiring context window terisi. Wujudnya berupa instruksi awal yang mulai diabaikan, kesalahan yang berulang, dan jawaban yang melenceng. Yang membuatnya menipu adalah kemunculannya bertahap, sehingga mudah disangka model sedang tidak bisa diandalkan padahal ruangnya yang sudah penuh.',
        },
        {
          term: 'compaction',
          meaning:
            'Peringkasan otomatis percakapan lama ketika ruang hampir habis, sehingga sesi bisa berlanjut. Menyelamatkan sesi dari berhenti, tetapi selalu membuang detail. Bisa kamu arahkan dengan menyebutkan apa yang wajib dipertahankan.',
        },
        {
          term: 'clear',
          meaning:
            'Perintah untuk mengosongkan context window dan memulai dari bersih di sesi yang sama. Berbeda dari compaction yang meringkas, ini membuang. Dipakai ketika kamu berpindah ke tugas yang tidak berhubungan, atau ketika konteksnya sudah tercampur kegagalan.',
        },
        {
          term: 'subagent',
          meaning:
            'Pekerjaan yang didelegasikan ke sesi terpisah dengan ruangnya sendiri, lalu hasilnya kembali sebagai ringkasan. Inilah alat paling ampuh untuk menjaga ruang utama tetap bersih, karena penelusuran yang membaca puluhan berkas terjadi di tempat lain dan hanya kesimpulannya yang masuk.',
        },
        {
          term: 'auto memory',
          meaning:
            'Catatan yang ditulis agent sendiri berdasarkan koreksi dan preferensi yang kamu berikan, tersimpan di luar percakapan dan dimuat lagi di sesi berikutnya. Berbeda dari berkas instruksi project yang kamu tulis sendiri. Isinya berupa hal yang tidak bisa disimpulkan dari kode, misalnya cara kerja yang kamu sukai.',
        },
      ),

      h2('Apa saja yang membelanjakan ruang'),
      p(
        'Sebelum bisa berhemat, kamu perlu tahu ke mana perginya. Urutan berikut disusun dari yang paling sering mengejutkan orang.',
      ),
      table(
        ['Pengeluaran', 'Besarannya', 'Catatan'],
        [
          [
            'Keluaran perintah yang panjang',
            'Bisa puluhan ribu token sekaligus',
            'Test yang gagal dengan stack trace panjang adalah penyebab tersering',
          ],
          [
            'Berkas yang dibaca',
            'Sekitar 4.000 token per 300 baris kode',
            'Termasuk berkas yang ternyata tidak relevan',
          ],
          [
            'Penelusuran yang tidak dibatasi',
            'Tidak terbatas',
            'Permintaan menelusuri tanpa cakupan bisa membaca ratusan berkas',
          ],
          [
            'Berkas instruksi project',
            'Ratusan sampai ribuan token',
            'Berbiaya tetap karena terbaca tiap sesi',
          ],
          ['Riwayat percakapan', 'Tumbuh terus', 'Termasuk jawaban agent, bukan hanya pesanmu'],
          [
            'Percobaan yang gagal',
            'Sama besarnya dengan yang berhasil',
            'Pendekatan keliru tetap menempati ruang sesudah dibatalkan',
          ],
        ],
        'Baris terakhir menjelaskan kenapa mengoreksi berulang justru memperburuk keadaan.',
      ),
      p(
        'Baris pertama punya perbaikan yang murah dan langsung terasa. Minta agent membatasi keluaran perintahnya sejak awal, misalnya menyaring baris yang penting saja. Satu kalimat di berkas instruksi project bisa memperpanjang umur sesimu secara mencolok.',
      ),
      code(
        'text',
        `
        # Contoh instruksi yang menghemat banyak ruang
        Saat menjalankan perintah yang mungkin mencetak keluaran
        panjang, batasi dulu keluarannya. Untuk test yang gagal,
        cukup tampilkan nama test-nya, pesan gagalnya, dan
        beberapa baris pertama yang menyebut kode project ini.
        `,
        { caption: 'Ditaruh sekali di berkas instruksi project, berlaku untuk seluruh sesi.' },
      ),

      h2('Empat cara membelanjakan dengan lebih baik'),
      steps(
        {
          title: 'Mulai bersih untuk tugas yang tidak berhubungan',
          body: 'Ini yang paling sering menolong dan paling sering dilupakan. Sesi yang berisi satu tugas, lalu pertanyaan tak berhubungan, lalu kembali ke tugas pertama, punya konteks yang penuh hal tidak relevan. Kosongkan di antara tugas.',
        },
        {
          title: 'Serahkan penelusuran ke subagent',
          body: 'Ketika kamu perlu tahu bagaimana sesuatu bekerja sebelum mengubahnya, minta penelusurannya dilakukan terpisah. Berkas yang dibaca selama penelusuran menempati ruang subagent, sedangkan yang masuk ke ruangmu hanya kesimpulannya.',
        },
        {
          title: 'Batasi cakupan penelusuran',
          body: 'Permintaan menelusuri tanpa batas adalah cara tercepat memenuhi context window. Sebutkan folder, sebutkan pertanyaan yang harus dijawab, dan sebutkan kapan penelusurannya sudah cukup.',
        },
        {
          title: 'Arahkan compaction sebelum ia terjadi',
          body: 'Kamu bisa menyebutkan apa yang wajib bertahan sesudah peringkasan, misalnya daftar berkas yang sudah diubah dan perintah yang dipakai memverifikasi. Tanpa arahan, yang bertahan adalah apa pun yang dianggap paling penting saat itu.',
        },
      ),
      code(
        'text',
        `
        # Penelusuran tanpa batas
        Telusuri bagaimana project ini menangani autentikasi.

        # Penelusuran yang dibatasi
        Pakai subagent untuk menelusuri bagaimana refresh token
        ditangani di src/auth/, dan apakah sudah ada utilitas OAuth
        yang bisa saya pakai ulang. Laporkan sebagai daftar berkas
        beserta perannya, maksimal sepuluh baris. Jangan membaca
        di luar src/auth/ kecuali ada berkas lain yang benar-benar
        dipanggil dari sana.
        `,
        {
          caption:
            'Bentuk bawah menyebut cakupan, pertanyaan yang harus dijawab, dan bentuk laporannya.',
        },
      ),
      p(
        'Pembatasan bentuk laporan pada contoh itu bukan soal kerapian. Laporan sepuluh baris menempati ruangmu sepuluh baris, sedangkan laporan yang menyalin potongan kode dari dua puluh berkas menempati ruang seperti kamu membaca sendiri dua puluh berkas itu.',
      ),

      h2('Kapan mulai bersih lebih baik daripada meringkas'),
      p(
        'Keduanya membuat ruang, tetapi dengan cara yang berbeda dan cocok untuk keadaan yang berbeda.',
      ),
      compare(
        {
          title: 'Meringkas',
          lang: 'text',
          code: `
          Konteks penuh
                 |
                 v
          Diringkas menjadi catatan pendek
                 |
                 v
          Lanjut dengan ringkasan itu
          `,
          notes: [
            'Cocok ketika kamu masih di tengah satu pekerjaan yang sama.',
            'Detail hilang, sehingga sebutkan apa yang wajib bertahan.',
            'Riwayat keputusan tetap terbawa dalam bentuk singkat.',
          ],
        },
        {
          title: 'Mulai bersih',
          lang: 'text',
          code: `
          Konteks penuh
                 |
                 v
          Dikosongkan
                 |
                 v
          Prompt baru yang menyebut keadaan
          dan tempat menemukannya
          `,
          notes: [
            'Cocok ketika kamu berpindah tugas, atau sesudah beberapa kegagalan.',
            'Agent menemukan kembali keadaan dari berkas dan riwayat git.',
            'Kegagalan yang lalu tidak ikut terbawa sebagai contoh keliru.',
          ],
        },
      ),
      p(
        'Dokumentasi Anthropic menyebut sesuatu yang berlawanan dengan naluri di sini, yaitu untuk sebagian keadaan memulai dari context window yang benar-benar baru lebih baik daripada meringkas, karena model masa kini sangat efektif menemukan kembali keadaan dari berkas di disk. Syaratnya kamu harus tegas soal cara memulainya.',
      ),
      code(
        'text',
        `
        # Prompt pembuka sesudah mulai bersih
        Kita melanjutkan pekerjaan rotasi refresh token.
        Baca dulu tiga hal ini sebelum melakukan apa pun.

        1. PROGRESS.md untuk keadaan terakhir
        2. git log -5 untuk melihat apa yang sudah masuk
        3. npm test untuk melihat mana yang masih merah

        Sesudah itu, laporkan apa yang tersisa sebelum mulai bekerja.
        `,
        {
          caption:
            'Sesi baru yang dibuka begini biasanya lebih tajam daripada sesi lama yang sudah diringkas dua kali.',
        },
      ),

      h2('Bekerja lintas beberapa sesi'),
      p(
        'Untuk pekerjaan yang tidak selesai dalam satu duduk, kuncinya adalah menyimpan keadaan di tempat yang bertahan, yaitu di disk dan bukan di percakapan. Dokumentasi Anthropic menyebut beberapa bentuk yang terbukti.',
      ),
      table(
        ['Bentuk penyimpanan', 'Untuk apa', 'Kenapa bentuk ini'],
        [
          [
            'Berkas catatan bebas, misalnya `PROGRESS.md`',
            'Kemajuan, keputusan, dan langkah berikutnya',
            'Teks bebas cocok untuk hal yang tidak berstruktur',
          ],
          [
            'Berkas terstruktur, misalnya `tests.json`',
            'Daftar test beserta statusnya',
            'Bentuk terstruktur membuat statusnya mudah dibaca ulang dan diperbarui',
          ],
          [
            'Riwayat git',
            'Apa yang sudah benar-benar masuk',
            'Menyimpan keadaan berkas, bukan hanya catatan tentangnya',
          ],
          [
            'Skrip penyiapan, misalnya `init.sh`',
            'Menjalankan server, test, dan linter',
            'Mencegah pekerjaan penyiapan diulang tiap sesi baru',
          ],
        ],
        'Keempatnya berada di disk, sehingga sesi baru bisa membacanya tanpa kamu jelaskan ulang.',
      ),
      p(
        'Baris kedua punya alasan tambahan yang jarang disebut. Daftar test dalam bentuk terstruktur membuat kecurangan menjadi terlihat, karena test yang hilang dari daftar meninggalkan jejak. Dokumentasi Anthropic bahkan menganjurkan menyertakan kalimat tegas bahwa menghapus atau menyunting test tidak diperbolehkan karena bisa menyembunyikan fungsi yang rusak.',
      ),
      callout(
        'tip',
        'Satu berkas catatan mengalahkan sepuluh kali penjelasan ulang',
        'Kebiasaan paling murah untuk pekerjaan panjang adalah meminta agent memperbarui satu berkas catatan setiap kali sebuah langkah selesai. Isinya cukup apa yang sudah beres, apa yang berikutnya, dan hal apa yang perlu diingat. Berkas itu yang kamu tunjuk di prompt pembuka sesi berikutnya.',
      ),

      h2('Tanda ruangmu sudah terlalu penuh'),
      p('Gejalanya muncul bertahap, dan mengenalinya lebih awal menghemat banyak waktu.'),
      ul(
        'Instruksi yang kamu berikan di awal sesi mulai diabaikan.',
        'Kesalahan yang sudah diperbaiki muncul kembali.',
        'Agent membaca ulang berkas yang sudah ia baca di sesi yang sama.',
        'Jawabannya mulai umum, seolah ia tidak lagi memakai bahan yang ada.',
        'Kamu sudah dua kali mengoreksi hal yang sama tanpa hasil.',
      ),
      p(
        'Kalau dua atau lebih dari tanda itu muncul, obatnya hampir selalu sama, yaitu bersihkan lalu mulai lagi dengan prompt yang sudah memuat apa yang kamu pelajari. Menambah penjelasan ke sesi yang sudah penuh adalah menambah beban ke tempat yang sedang kelebihan beban.',
      ),

      h2('Rangkuman'),
      ul(
        'Context window adalah sumber daya yang kamu belanjakan, dan hampir tiap keputusan dalam sesi adalah keputusan belanja.',
        'Pengeluaran terbesar yang sering terlewat adalah keluaran perintah yang panjang.',
        'Serahkan penelusuran ke subagent supaya hanya kesimpulannya yang masuk ke ruangmu.',
        'Batasi cakupan penelusuran dan bentuk laporannya.',
        'Untuk berpindah tugas atau sesudah beberapa kegagalan, mulai bersih lebih baik daripada meringkas.',
        'Simpan keadaan di disk lewat berkas catatan, berkas terstruktur, dan riwayat git.',
      ),

      references(
        {
          label: 'Manage context aggressively',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Menyatakan bahwa hampir semua praktik terbaiknya berdiri di atas batasan context window.',
        },
        {
          label: 'Long-horizon reasoning and state tracking',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Sumber anjuran menyimpan keadaan di berkas dan memulai bersih alih-alih meringkas.',
        },
        {
          label: 'Context window',
          href: 'https://code.claude.com/docs/en/context-window',
          source: 'Anthropic',
          note: 'Rincian apa yang dimuat saat sesi dimulai dan berapa biaya tiap pembacaan berkas.',
        },
      ),
    ],
  ),

  written(
    'explore-plan-code-commit',
    'Explore, Plan, Code, Commit',
    13,
    'Empat fase yang mencegah agent menyelesaikan masalah yang salah.',
    [
      p(
        'Kegagalan paling mahal pada coding agent bukan kode yang salah, melainkan kode yang benar untuk masalah yang keliru. Ia mahal karena tidak menimbulkan gejala apa pun. Test-nya lulus, kodenya rapi, dan barulah saat kamu memakainya kamu sadar bahwa yang dibangun bukan yang kamu maksud.',
      ),
      p(
        'Penyebabnya hampir selalu sama, yaitu agent mulai menulis sebelum ia cukup memahami keadaan. Alur empat fase di sub-bab ini adalah penangkalnya, dan ia adalah alur yang dianjurkan dokumentasi Claude Code sendiri.',
      ),

      terms(
        {
          term: 'plan mode',
          meaning:
            'Mode di mana agent boleh membaca dan menelusuri tetapi tidak boleh mengubah berkas, sampai kamu menyetujui rencananya. Di terminal, mode ini dimasuki dengan menekan `Shift+Tab` sampai penanda mode rencana muncul, atau dengan memulai sesi memakai `claude --permission-mode plan`. Gunanya memisahkan penelusuran dari pengerjaan.',
        },
        {
          term: 'permission mode (mode izin)',
          meaning:
            'Pengaturan yang menentukan tindakan apa saja yang berjalan tanpa bertanya. Claude Code punya beberapa, di antaranya mode manual yang bertanya untuk hampir semua tindakan, mode rencana yang hanya membaca, dan mode otomatis yang membiarkan pekerjaan berjalan dengan pemeriksaan latar.',
        },
        {
          term: 'spec',
          meaning:
            'Dokumen yang menyatakan apa yang akan dibangun, berkas dan antarmuka apa yang terlibat, apa yang berada di luar cakupan, dan bagaimana membuktikan fiturnya bekerja. Berbeda dari rencana teknis karena ia menyatakan hasil yang diinginkan, bukan langkah pengerjaannya. Kamu sudah mengenal bentuknya lewat dokumen di `plans/` pada project ini.',
        },
        {
          term: 'course correction (koreksi arah)',
          meaning:
            'Menghentikan agent di tengah pekerjaan lalu mengarahkannya ulang, alih-alih menunggu sampai selesai baru memperbaiki. Karena konteks tetap terjaga saat kamu menghentikannya, koreksi lebih awal hampir selalu lebih murah daripada koreksi di akhir.',
        },
        {
          term: 'rewind',
          meaning:
            'Mengembalikan keadaan percakapan, keadaan berkas, atau keduanya ke titik sebelumnya. Berguna untuk mencoba pendekatan berisiko tanpa takut, karena kamu bisa kembali bila ternyata tidak berhasil. Batasnya adalah ia hanya menangkap perubahan lewat alat penyunting agent, bukan lewat perintah shell.',
        },
      ),

      h2('Empat fase dan apa yang dikerjakan di masing-masing'),
      steps(
        {
          title: 'Explore, yaitu menelusuri tanpa mengubah',
          body: 'Minta agent membaca bagian yang relevan dan menjawab pertanyaan, tanpa menulis apa pun. Di fase ini kamu sedang membangun pemahaman bersama, dan kamu bisa langsung tahu kalau pemahamannya keliru.',
        },
        {
          title: 'Plan, yaitu menyusun rencana yang bisa kamu tinjau',
          body: 'Minta rencana yang menyebut berkas apa yang berubah, apa alurnya, dan apa yang berada di luar cakupan. Ini titik termurah untuk menemukan kesalahpahaman, karena belum ada satu baris pun yang ditulis.',
        },
        {
          title: 'Code, yaitu mengerjakan sambil memverifikasi',
          body: 'Sesudah rencananya kamu setujui, minta ia mengerjakan sambil menjalankan pemeriksaan. Sertakan cara memverifikasinya di dalam permintaan yang sama, bukan sesudahnya.',
        },
        {
          title: 'Commit, yaitu menyimpan hasil beserta alasannya',
          body: 'Minta commit dengan pesan yang menjelaskan kenapa, bukan mengulang daftar berkas. Ini juga menjadi checkpoint yang andal untuk pekerjaan berikutnya.',
        },
      ),
      p(
        'Perhatikan fase pertama dan kedua sama sekali tidak mengubah berkas. Ini bukan kehati-hatian berlebihan, melainkan pemanfaatan fakta bahwa penelusuran dan penulisan adalah dua pekerjaan berbeda yang lebih baik dikerjakan terpisah. Agent yang boleh langsung menulis cenderung berhenti menelusuri begitu ia merasa cukup tahu.',
      ),

      h2('Bentuk konkretnya'),
      code(
        'text',
        `
        # Fase 1, di mode rencana
        Baca src/auth/ dan pahami bagaimana kita menangani sesi
        dan login. Lihat juga bagaimana kita mengelola variabel
        environment untuk rahasia. Jangan mengubah apa pun,
        cukup laporkan apa yang kamu temukan.

        # Fase 2, masih di mode rencana
        Saya ingin menambahkan login lewat Google. Berkas apa saja
        yang perlu berubah, bagaimana alur sesinya, dan apa yang
        sebaiknya TIDAK disentuh. Susun rencananya.

        # Fase 3, sesudah rencananya disetujui
        Kerjakan alur OAuth sesuai rencanamu. Tulis test untuk
        handler callback-nya, jalankan seluruh test, dan perbaiki
        yang gagal. Jangan ubah berkas di luar yang ada di rencana.

        # Fase 4
        Buat commit dengan pesan yang menjelaskan alasannya,
        lalu buka pull request.
        `,
        {
          caption:
            'Empat prompt terpisah. Menggabungkan fase satu sampai tiga menjadi satu prompt menghapus titik periksanya.',
        },
      ),
      p(
        'Bagian "apa yang sebaiknya tidak disentuh" pada fase kedua sering menghasilkan informasi paling berguna. Jawabannya memperlihatkan apa yang agent anggap berada di luar cakupan, dan kalau anggapannya berbeda dari anggapanmu, kamu baru saja mencegah sebuah perubahan yang tidak kamu inginkan.',
      ),

      h2('Kapan melewati fase rencana'),
      p(
        'Perencanaan punya biaya, yaitu waktu dan token. Dokumentasi Claude Code menyatakan hal ini secara terbuka dan menyediakan patokan yang mudah dipakai.',
      ),
      table(
        ['Situasi', 'Rencana dulu?', 'Alasannya'],
        [
          [
            'Perbaikan satu baris atau ganti nama variabel',
            'Tidak',
            'Cakupannya jelas dan perbaikannya kecil',
          ],
          [
            'Kamu bisa menjelaskan diff-nya dalam satu kalimat',
            'Tidak',
            'Ini patokan resmi yang dipakai dokumentasinya',
          ],
          [
            'Perubahan menyentuh beberapa berkas',
            'Ya',
            'Kesalahpahaman jadi mahal begitu tersebar',
          ],
          ['Kamu belum yakin pendekatan mana yang benar', 'Ya', 'Inilah gunanya fase rencana'],
          [
            'Kamu belum mengenal kode yang akan diubah',
            'Ya',
            'Fase telusur mengisi kekosongan itu lebih dulu',
          ],
          [
            'Perubahannya sulit dibalik',
            'Ya, dan tinjau rencananya dengan teliti',
            'Biaya kesalahan tidak simetris',
          ],
        ],
        'Patokan singkatnya, kalau diff-nya bisa kamu jelaskan dalam satu kalimat, langsung kerjakan saja.',
      ),

      h2('Meminta agent mewawancarai kamu'),
      p(
        'Untuk fitur yang lebih besar, ada bentuk yang lebih kuat daripada meminta rencana, yaitu meminta agent bertanya lebih dulu. Ini membalik arah percakapan, dan yang berharga darinya adalah pertanyaan yang tidak terpikir olehmu.',
      ),
      code(
        'text',
        `
        Saya ingin membangun [deskripsi singkat fitur].
        Wawancarai saya secara mendalam sebelum menulis apa pun.

        Tanyakan soal implementasi teknis, tampilan dan alur
        pemakaian, kasus tepi, kekhawatiran, dan pertukaran yang
        harus diambil. Jangan menanyakan hal yang sudah jelas,
        gali bagian sulit yang mungkin belum saya pikirkan.

        Lanjutkan bertanya sampai semuanya tercakup, lalu tulis
        spesifikasinya ke SPEC.md.
        `,
        { caption: 'Bentuk yang dianjurkan dokumentasi Claude Code untuk fitur berukuran besar.' },
      ),
      p(
        'Sesudah spesifikasinya jadi, jalankan pengerjaannya di sesi baru. Alasannya berpijak pada sub-bab sebelumnya, yaitu sesi wawancara sudah memuat banyak diskusi yang tidak dibutuhkan saat mengerjakan, sedangkan spesifikasi tertulis membawa seluruh kesimpulannya dengan biaya ruang yang jauh lebih kecil.',
      ),
      p(
        'Spesifikasi yang paling berguna punya tiga ciri, yaitu ia menyebut berkas dan antarmuka yang terlibat, menyatakan apa yang berada di luar cakupan, dan ditutup dengan satu langkah verifikasi dari ujung ke ujung yang membuktikan fiturnya bekerja. Waktu yang kamu habiskan menajamkan spesifikasi terbayar lebih besar daripada waktu menonton pengerjaannya.',
      ),
      callout(
        'info',
        'Ini alur yang sudah dipakai project ini',
        'Aturan project ini mewajibkan dokumen rencana di `plans/` sebelum membangun apa pun, lengkap dengan analisis kesenjangan, keputusan beserta alasannya, dan daftar berkas yang akan disentuh. Alur empat fase di sini adalah bentuk harian dari aturan yang sama, dan dokumen di `plans/` adalah wujud tertulisnya yang bertahan sesudah sesinya berakhir.',
      ),

      h2('Menghentikan lebih awal, bukan memperbaiki di akhir'),
      p(
        'Fase pengerjaan bukan waktu untuk menunggu diam. Dokumentasi Claude Code menyatakan bahwa hasil terbaik datang dari putaran umpan balik yang rapat, dan mengoreksi cepat umumnya menghasilkan solusi yang lebih baik dalam waktu lebih singkat.',
      ),
      table(
        ['Yang kamu lihat', 'Tindakan yang tepat'],
        [
          [
            'Ia membaca berkas yang jelas tidak relevan',
            'Hentikan, sebutkan di mana seharusnya mencari',
          ],
          ['Ia mulai mengubah berkas di luar rencana', 'Hentikan, tegaskan batasnya'],
          [
            'Ia menambah dependency yang tidak kamu inginkan',
            'Hentikan, sebutkan larangannya beserta alasannya',
          ],
          [
            'Pendekatannya jelas berbeda dari rencana yang disetujui',
            'Hentikan, tanyakan kenapa sebelum melanjutkan',
          ],
          [
            'Sudah dua kali gagal pada hal yang sama',
            'Mulai bersih dengan prompt yang memuat pelajaran dari dua kegagalan itu',
          ],
        ],
        'Menghentikan menjaga konteks, sehingga kamu bisa mengarahkan ulang tanpa kehilangan pemahaman yang sudah terbangun.',
      ),
      p(
        'Baris keempat layak dijelaskan. Pendekatan yang menyimpang dari rencana tidak selalu berarti salah, karena agent bisa saja menemukan sesuatu di tengah jalan yang membuat rencana awal tidak lagi masuk akal. Yang keliru adalah penyimpangan yang tidak diberitahukan. Menanyakan kenapa sering menghasilkan informasi yang justru memperbaiki rencanamu.',
      ),

      h2('Menutup dengan commit yang berarti'),
      p(
        'Fase keempat sering diperlakukan sebagai formalitas, padahal ia mengerjakan dua hal sekaligus. Ia menyimpan hasil, dan ia menciptakan titik aman untuk pekerjaan berikutnya.',
      ),
      ul(
        'Minta pesan commit menjelaskan **kenapa**, karena diff sudah memperlihatkan apa yang berubah.',
        'Satu commit untuk satu perubahan logis, supaya bisa dibatalkan tanpa membawa hal lain.',
        'Periksa dulu apa yang akan masuk, terutama berkas rahasia dan berkas sementara.',
        'Di project ini, jangan pernah commit atau push tanpa kamu minta, dan aturan itu berlaku sama untuk agent.',
      ),
      p(
        'Butir terakhir adalah aturan project ini, dan ia adalah contoh bagus untuk hal yang layak ditulis di berkas instruksi project. Sub-bab berikutnya membahas kenapa aturan semacam itu jauh lebih efektif ketika tinggal permanen daripada diulang tiap sesi.',
      ),

      h2('Rangkuman'),
      ul(
        'Kegagalan termahal adalah kode yang benar untuk masalah yang keliru, dan alur empat fase adalah penangkalnya.',
        'Fase telusur dan fase rencana sama sekali tidak mengubah berkas, dan di situlah nilainya.',
        'Kalau diff-nya bisa kamu jelaskan dalam satu kalimat, langsung kerjakan tanpa rencana.',
        'Untuk fitur besar, minta agent mewawancarai kamu lalu menulis spesifikasi, dan kerjakan di sesi baru.',
        'Hentikan lebih awal ketika arahnya melenceng, karena konteks tetap terjaga saat kamu menghentikan.',
        'Commit menyimpan hasil sekaligus menciptakan titik aman untuk pekerjaan berikutnya.',
      ),

      references(
        {
          label: 'Explore first, then plan, then code',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Sumber alur empat fase, patokan melewati rencana, dan bentuk prompt wawancara.',
        },
        {
          label: 'Choose a permission mode',
          href: 'https://code.claude.com/docs/en/permission-modes',
          source: 'Anthropic',
          note: 'Daftar mode izin beserta apa yang berjalan tanpa bertanya di masing-masing.',
        },
        {
          label: 'Common workflows',
          href: 'https://code.claude.com/docs/en/common-workflows',
          source: 'Anthropic',
          note: 'Resep langkah demi langkah untuk penelusuran, perbaikan bug, test, dan pull request.',
        },
      ),
    ],
  ),

  written(
    'prompt-spesifik-di-agent',
    'Menulis Prompt yang Spesifik di Agent',
    12,
    'Empat cara memberi konteks yang tidak tersedia di chatbot biasa.',
    [
      p(
        'Teknik kejelasan dari sub-bab 1.3 berlaku penuh di sini, jadi sub-bab ini tidak mengulanginya. Yang dibahas adalah tambahan yang hanya ada ketika lawan bicaramu bisa membaca berkas dan menjalankan perintah sendiri.',
      ),
      p(
        'Tambahan itu mengubah bentuk prompt yang baik secara mendasar. Di chatbot, prompt yang baik memuat semua bahan. Di agent, prompt yang baik memuat semua **petunjuk menuju** bahan, dan itu bentuk yang berbeda.',
      ),

      terms(
        {
          term: 'file reference (rujukan berkas)',
          meaning:
            'Menyebut berkas dengan penanda khusus supaya agent membacanya sebelum menjawab. Di Claude Code penandanya `@`, misalnya `@src/auth/token.ts`. Bedanya dengan menyebut nama berkas biasa adalah pembacaannya dijamin terjadi lebih dulu, bukan diserahkan pada keputusan agent.',
        },
        {
          term: 'pattern reference (rujukan pola)',
          meaning:
            'Menunjuk kode yang sudah ada sebagai contoh bentuk yang kamu inginkan, misalnya "ikuti pola di `HotDogWidget.php`". Ini bentuk few-shot dari sub-bab 1.5 yang dipindahkan ke agent, dengan keuntungan tambahan yaitu contohnya tidak menempati context window sampai ia benar-benar dibaca.',
        },
        {
          term: 'reproduction step (langkah reproduksi)',
          meaning:
            'Urutan tindakan yang memunculkan sebuah bug. Untuk agent, ini bahan paling berharga yang bisa kamu berikan pada perbaikan bug, karena darinya ia bisa membuat test yang gagal dan dengan begitu punya sinyal yang bisa merah.',
        },
        {
          term: 'CLI tool',
          meaning:
            'Program baris perintah seperti `gh`, `docker`, atau `psql` yang bisa dipanggil agent. Dokumentasi Claude Code menyebutnya cara paling hemat konteks untuk berhubungan dengan layanan luar, karena keluarannya ringkas dibandingkan memuat seluruh respons API mentah.',
        },
        {
          term: 'allowlist domain',
          meaning:
            'Daftar alamat yang boleh diambil agent tanpa bertanya setiap kali. Berguna ketika kamu sering merujuk dokumentasi resmi sebuah library. Ini juga contoh penerapan prinsip allow-list yang sudah kamu pelajari di [Batas Aplikasi Web](/kelas/keamanan-fullstack/batas-aplikasi-web).',
        },
      ),

      h2('Empat cara memberi bahan'),
      p('Keempatnya bisa kamu campur dalam satu prompt, dan biasanya memang begitu.'),
      table(
        ['Cara', 'Bentuknya', 'Paling berguna untuk'],
        [
          [
            'Rujukan berkas',
            'Sebut berkasnya dengan penanda `@`',
            'Ketika kamu tahu persis berkas mana yang menentukan',
          ],
          [
            'Rujukan pola',
            'Sebut berkas yang menjadi contoh bentuk yang benar',
            'Ketika hasilnya harus sepola dengan yang sudah ada',
          ],
          [
            'Gambar',
            'Tempel atau seret gambarnya ke prompt',
            'Desain, tampilan yang salah, dan grafik yang perlu dibaca',
          ],
          [
            'Pipa data',
            'Salurkan keluaran perintah langsung sebagai masukan',
            'Log dan keluaran perintah yang sudah kamu saring sendiri',
          ],
        ],
        'Cara keempat berguna justru karena kamu yang menyaring, sehingga yang masuk hanya bagian yang menentukan.',
      ),
      p(
        'Ada cara kelima yang sering dilupakan padahal paling hemat, yaitu menyuruh agent mengambil sendiri bahan yang ia butuhkan. Alih-alih menempelkan keluaran perintah, minta ia menjalankan perintahnya. Alih-alih menempelkan isi berkas, sebut nama berkasnya. Bedanya terasa pada sesi panjang, karena bahan yang tidak jadi dipakai tidak pernah masuk ke ruangmu.',
      ),

      h2('Sebelum dan sesudah pada pekerjaan nyata'),
      p(
        'Empat contoh berikut mengambil bentuk dari dokumentasi Claude Code dan memakai kasus yang ada di project kurikulum ini.',
      ),
      compare(
        {
          title: 'Menulis test',
          lang: 'text',
          code: `
          # Sebelum
          tambahkan test untuk parse-inline

          # Sesudah
          Tulis test untuk @src/lib/content/parse-inline.tsx
          yang menutup kasus teks yang memuat backtick tidak
          berpasangan dan tautan tanpa teks. Ikuti pola pada
          @src/test/parse-inline.test.tsx. Jangan pakai mock,
          dan jalankan npm run test sesudah selesai.
          `,
          notes: [
            'Berkasnya ditunjuk, jadi tidak ada yang perlu dicari-cari.',
            'Kasus tepinya disebut, karena itu yang biasanya terlewat.',
            'Pola diikuti dari test yang sudah ada, sehingga hasilnya konsisten.',
          ],
        },
        {
          title: 'Memperbaiki bug',
          lang: 'text',
          code: `
          # Sebelum
          perbaiki bug di sidebar

          # Sesudah
          Sidebar tidak membuka cabang yang sedang aktif ketika
          halaman dibuka langsung lewat URL, tetapi benar ketika
          dinavigasi dari halaman lain. Lihat
          @src/components/layout/sidebar-nav.tsx.

          Tulis dulu test yang gagal dan mereproduksi masalahnya,
          baru perbaiki. Cari akar masalahnya, jangan tambahkan
          penanganan khusus untuk kasus ini saja.
          `,
          notes: [
            'Gejalanya disebut lengkap dengan keadaan yang membedakan.',
            'Perbedaan antara dua keadaan itu sering langsung menunjuk penyebabnya.',
            'Test yang gagal lebih dulu memberi sinyal yang bisa merah.',
          ],
        },
      ),
      p(
        'Perhatikan kedua kolom sesudah memuat cara memverifikasi di dalam permintaan yang sama. Ini bukan sekadar kerapian. Permintaan yang menyertakan pemeriksaannya mengubah titik berhenti agent dari terlihat selesai menjadi pemeriksaannya lulus, dan itulah perubahan terbesar yang bisa kamu buat dalam satu kalimat.',
      ),

      h2('Menunjuk pola alih-alih menjelaskannya'),
      p(
        'Ini bentuk paling hemat dari few-shot pada agent. Alih-alih menempelkan contoh, kamu menunjuk berkas yang sudah menjadi contoh.',
      ),
      code(
        'text',
        `
        Tambahkan kategori baru ke kurikulum.

        Lihat dulu bagaimana kategori yang sudah ada disusun,
        misalnya @src/content/curriculum/keamanan-fullstack.ts
        dan berkas lessons.ts di dalam foldernya. Ikuti pola yang
        sama, termasuk urutan blok di tiap sub-bab dan bentuk
        blok istilah serta rujukannya.

        Jangan membuat bentuk baru. Kalau ada sesuatu yang menurutmu
        perlu bentuk berbeda, sebutkan dulu alasannya sebelum
        mengerjakannya.
        `,
        {
          caption:
            'Kalimat terakhir memberi jalan keluar, sehingga larangan tidak memaksa hasil setengah jadi.',
        },
      ),
      p(
        'Cara ini punya keuntungan yang tidak dimiliki few-shot biasa, yaitu contohnya selalu mutakhir. Kalau pola di project berubah, prompt ini tetap benar tanpa kamu sunting, karena yang ia tunjuk adalah keadaan berkas saat itu dan bukan salinan yang kamu tempel bulan lalu.',
      ),

      h2('Kapan prompt yang longgar justru lebih baik'),
      p(
        'Sub-bab 1.3 sudah menyebut ini, dan di agent ia punya bentuk yang khas. Ketika kamu belum tahu apa yang kamu cari, prompt yang terlalu sempit justru menutup temuan yang berharga.',
      ),
      table(
        ['Tujuanmu', 'Bentuk prompt', 'Contoh'],
        [
          [
            'Mengerjakan hal yang sudah kamu tahu',
            'Sempit dan lengkap',
            'Ubah fungsi ini supaya menolak angka negatif',
          ],
          [
            'Memahami kode asing',
            'Terbuka',
            'Jelaskan bagaimana progres belajar disimpan di project ini',
          ],
          [
            'Mencari yang kamu lewatkan',
            'Sengaja longgar',
            'Apa yang akan kamu perbaiki dari berkas ini',
          ],
          [
            'Menelusuri sebab',
            'Berhipotesis',
            'Sebutkan tiga penyebab paling mungkin, urutkan dari yang paling mungkin, sebutkan cara mengujinya',
          ],
        ],
        'Baris terakhir adalah bentuk yang paling sering menolong pada bug yang belum jelas sebabnya.',
      ),
      p(
        'Baris terakhir memindahkan disiplin dari kategori sebelumnya ke prompt. Meminta beberapa hipotesis berperingkat beserta cara mengujinya mencegah agent langsung menempel pada dugaan pertama, dan itu persis kebiasaan yang membedakan menelusuri dari menebak.',
      ),
      callout(
        'tip',
        'Pertanyaan yang kamu ajukan ke rekan kerja juga berlaku di sini',
        'Dokumentasi Claude Code menyebutkan bahwa masuk ke codebase asing dengan bertanya adalah alur yang efektif dan tidak butuh prompt khusus. Pertanyaan seperti bagaimana logging bekerja di sini, kenapa baris ini memanggil fungsi yang satu dan bukan yang lain, atau kasus tepi apa yang ditangani modul ini, semuanya bisa kamu ajukan apa adanya.',
      ),

      h2('Menyebut apa yang tidak boleh disentuh'),
      p(
        'Satu kalimat yang paling sering menghemat waktu di agent adalah kalimat yang menyatakan batas. Alasannya, agent yang tidak tahu batasnya akan memperbaiki hal-hal yang menurutnya perlu diperbaiki di sepanjang jalan.',
      ),
      code(
        'text',
        `
        # Batas berkas
        Ubah hanya berkas di src/content/curriculum/prompt-engineering/.

        # Batas jenis perubahan
        Jangan memformat ulang baris yang tidak berhubungan dengan
        perubahan ini, supaya diff-nya tetap mudah ditinjau.

        # Batas dependency
        Jangan menambah paket baru. Kalau menurutmu ada yang perlu,
        sebutkan dulu alasannya dan tunggu jawaban saya.

        # Batas tindakan
        Jangan commit, jangan push, dan jangan menjalankan migrasi.
        `,
        {
          caption:
            'Keempatnya pendek, dan tiga di antaranya lebih baik tinggal permanen di berkas instruksi project.',
        },
      ),
      p(
        'Batas keempat adalah yang paling penting dan sekaligus yang paling perlu kamu pahami batasnya sendiri. Menuliskannya menurunkan peluang terjadi, dan tidak menjaminnya. Penjaminan datang dari mode izin dan dari hook, dan keduanya dibahas di sub-bab 3.6 serta Bab 4.',
      ),

      h2('Rangkuman'),
      ul(
        'Di agent, prompt yang baik memuat petunjuk menuju bahan, bukan seluruh bahannya.',
        'Rujuk berkas dengan penanda supaya pembacaannya dijamin terjadi lebih dulu.',
        'Menunjuk pola yang sudah ada mengalahkan menempelkan contoh, karena contohnya selalu mutakhir.',
        'Sertakan cara memverifikasi di permintaan yang sama, karena itu mengubah titik berhenti agent.',
        'Prompt longgar tetap berguna untuk memahami dan menemukan, bukan untuk mengerjakan.',
        'Sebutkan batasnya, karena agent yang tidak tahu batas akan memperbaiki hal yang tidak kamu minta.',
      ),

      references(
        {
          label: 'Provide specific context in your prompts',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Sumber tabel sebelum dan sesudah beserta empat cara memberi bahan.',
        },
        {
          label: 'Common workflows',
          href: 'https://code.claude.com/docs/en/common-workflows',
          source: 'Anthropic',
          note: 'Resep untuk penelusuran, perbaikan bug, penulisan test, dan pekerjaan git.',
        },
      ),
    ],
  ),

  written(
    'claude-md',
    'CLAUDE.md dan Ingatan Project',
    14,
    'Tempat menaruh hal yang kamu tidak mau jelaskan ulang setiap sesi.',
    [
      p(
        'Setiap sesi dimulai dari context window yang kosong. Konsekuensinya sudah kamu pahami dari sub-bab 1.2, dan konsekuensi praktisnya begini. Kalau kamu tidak menuliskannya di suatu tempat, kamu akan menjelaskan perintah test project ini, konvensi penamaannya, dan larangan commit tanpa diminta, berulang kali sampai kamu bosan.',
      ),
      p(
        'Berkas instruksi project menyelesaikan itu. Di Claude Code namanya `CLAUDE.md`, dan project yang sedang kamu pelajari ini punya satu di akarnya. Sub-bab ini membahas apa yang layak masuk, apa yang justru merusak, dan kenapa berkas yang terlalu panjang menghasilkan hasil yang lebih buruk daripada berkas yang pendek.',
      ),

      terms(
        {
          term: 'CLAUDE.md',
          meaning:
            'Berkas markdown yang dibaca Claude Code di awal setiap sesi, berisi instruksi permanen untuk project itu. Tidak ada format yang diwajibkan. Isinya diperlakukan sebagai konteks, bukan sebagai konfigurasi yang ditegakkan, sehingga ia mengarahkan perilaku dan tidak menjaminnya.',
        },
        {
          term: 'AGENTS.md',
          meaning:
            'Berkas dengan tujuan sama yang dipakai banyak alat lain, termasuk Codex. Claude Code membaca `CLAUDE.md` dan bukan `AGENTS.md`, tetapi keduanya bisa disatukan dengan membuat `CLAUDE.md` yang mengimpor `AGENTS.md`. Dibahas penuh di sub-bab 4.2.',
        },
        {
          term: 'import',
          meaning:
            'Cara memasukkan isi berkas lain ke dalam `CLAUDE.md` dengan menulis `@path/ke/berkas`. Berkas yang diimpor ikut dimuat saat sesi dimulai, sehingga ia menolong kerapian tetapi tidak menghemat ruang. Untuk menyebut sebuah path tanpa mengimpornya, bungkus dalam backtick.',
        },
        {
          term: 'rules directory',
          meaning:
            'Folder `.claude/rules/` berisi berkas markdown terpisah per topik, dipakai supaya instruksi tidak menumpuk dalam satu berkas raksasa. Project ini memakainya, dan berkas seperti `security.md` serta `frontend.md` yang mengatur pekerjaanmu berada di sana.',
        },
        {
          term: 'path-scoped rule',
          meaning:
            'Aturan yang hanya dimuat ketika agent menyentuh berkas yang cocok dengan pola tertentu, ditandai lewat field `paths` di frontmatter. Inilah cara menghemat ruang untuk aturan yang hanya berlaku di sebagian codebase, misalnya aturan API yang hanya perlu saat menyentuh folder API.',
        },
        {
          term: 'auto memory',
          meaning:
            'Catatan yang ditulis agent sendiri berdasarkan koreksi dan preferensi yang kamu berikan, tersimpan di luar repositori dan dimuat lagi di sesi berikutnya. Berbeda dari `CLAUDE.md` yang kamu tulis. Isinya berupa hal yang tidak bisa disimpulkan dari kode, dan ia berupa berkas markdown biasa yang bisa kamu baca, sunting, atau hapus.',
        },
        {
          term: 'managed policy',
          meaning:
            'Berkas instruksi tingkat organisasi yang dipasang di lokasi sistem dan tidak bisa dikecualikan oleh pengaturan pengguna. Dipakai perusahaan untuk menegakkan standar dan aturan kepatuhan di seluruh mesin developer-nya.',
        },
      ),

      h2('Di mana berkasnya bisa tinggal'),
      p(
        'Ada beberapa lokasi, masing-masing dengan cakupan berbeda. Susunan berikut berurutan dari yang paling luas ke yang paling sempit, dan yang lebih sempit dibaca belakangan.',
      ),
      table(
        ['Cakupan', 'Lokasi', 'Untuk apa', 'Dibagikan ke'],
        [
          [
            'Organisasi',
            'Lokasi sistem yang dikelola IT',
            'Standar perusahaan dan aturan kepatuhan',
            'Semua pengguna di organisasi',
          ],
          [
            'Pengguna',
            '`~/.claude/CLAUDE.md`',
            'Preferensi pribadimu di semua project',
            'Hanya kamu',
          ],
          [
            'Project',
            '`./CLAUDE.md` atau `./.claude/CLAUDE.md`',
            'Konvensi dan alur kerja project',
            'Tim, lewat version control',
          ],
          [
            'Pribadi per project',
            '`./CLAUDE.local.md`',
            'Preferensi pribadimu di project ini saja',
            'Hanya kamu, dan wajib masuk `.gitignore`',
          ],
        ],
        'Seluruh berkas yang ditemukan digabungkan, bukan saling menimpa.',
      ),
      p(
        'Baris keempat punya jebakan yang layak disebut. Berkas pribadi per project yang di-gitignore hanya ada di tempat kamu membuatnya, sehingga ia tidak ikut ke worktree lain dari repositori yang sama. Kalau kamu bekerja di beberapa worktree sekaligus, impor berkas dari direktori home-mu adalah cara yang lebih tahan.',
      ),
      p(
        'Project ini memakai baris ketiga, dan kamu bisa membuka `CLAUDE.md` di akar repositorinya untuk melihat bentuk nyatanya. Perhatikan bahwa ia sengaja tipis dan justru menunjuk ke `.claude/rules/` untuk aturan lengkapnya, dengan alasan yang tertulis di dalamnya sendiri.',
      ),

      h2('Apa yang layak masuk'),
      p(
        'Karena berkas ini dimuat di setiap sesi, panjangnya berbiaya tetap. Dokumentasi Claude Code menyediakan pembagian yang tegas.',
      ),
      table(
        ['Masukkan', 'Jangan masukkan'],
        [
          [
            'Perintah yang tidak bisa ditebak agent',
            'Apa pun yang bisa ia simpulkan dengan membaca kode',
          ],
          [
            'Aturan gaya kode yang berbeda dari bawaan',
            'Konvensi bahasa yang sudah umum diketahui',
          ],
          [
            'Cara menjalankan test dan runner yang dipakai',
            'Dokumentasi API yang rinci, cukup tautkan',
          ],
          [
            'Etiket repositori seperti penamaan branch dan aturan PR',
            'Informasi yang sering berubah',
          ],
          ['Keputusan arsitektur khas project ini', 'Penjelasan panjang atau tutorial'],
          [
            'Keanehan lingkungan, misalnya variabel yang wajib ada',
            'Deskripsi berkas satu per satu',
          ],
          [
            'Jebakan yang mudah terlewat',
            'Nasihat yang sudah jelas seperti tulis kode yang bersih',
          ],
        ],
        'Pertanyaan penyaringnya satu, yaitu apakah menghapus baris ini akan membuat agent melakukan kesalahan.',
      ),
      p(
        'Pertanyaan penyaring di catatan tabel itu adalah alat yang paling berguna dari seluruh sub-bab ini. Jalankan pada setiap baris berkasmu. Kalau jawabannya tidak, hapus barisnya. Berkas yang lolos penyaringan ini biasanya jauh lebih pendek daripada yang kamu duga, dan justru lebih dipatuhi.',
      ),

      h2('Kenapa berkas panjang justru diabaikan'),
      p(
        'Ini bagian yang paling berlawanan dengan naluri. Dokumentasi Claude Code menyatakannya secara langsung, yaitu berkas yang membengkak membuat agent mengabaikan instruksimu yang sebenarnya.',
      ),
      p(
        'Mekanismenya sudah kamu temui di sub-bab 1.7. Ketika ada empat puluh aturan yang semuanya ditulis dengan nada sama mendesak, tidak ada satu pun yang menonjol. Menambahkan aturan keempat puluh satu untuk memperbaiki masalah yang muncul justru memperparah penyebabnya.',
      ),
      table(
        ['Gejala', 'Kemungkinan penyebab', 'Perbaikannya'],
        [
          [
            'Agent terus melakukan hal yang sudah kamu larang',
            'Berkasnya terlalu panjang dan aturannya tenggelam',
            'Pangkas sampai tersisa yang benar-benar mengubah perilaku',
          ],
          [
            'Agent menanyakan hal yang sudah dijawab di berkasnya',
            'Kalimatnya ambigu',
            'Ganti dengan kalimat yang lebih konkret dan bisa diperiksa',
          ],
          [
            'Sebagian aturan dipatuhi dan sebagian tidak',
            'Ada aturan yang saling bertentangan',
            'Periksa seluruh berkas instruksi, termasuk yang di folder aturan',
          ],
          [
            'Satu aturan penting terus terlewat',
            'Semua baris ditekankan sama',
            'Beri penekanan hanya pada baris itu, dan cabut dari yang lain',
          ],
        ],
        'Tiga dari empat perbaikannya berupa mengurangi, bukan menambah.',
      ),
      callout(
        'tip',
        'Perlakukan berkas ini seperti kode',
        'Tinjau ketika ada yang salah, pangkas secara berkala, dan uji perubahannya dengan mengamati apakah perilaku agent benar-benar berubah. Ukuran yang dianjurkan dokumentasinya adalah di bawah dua ratus baris per berkas, dan berkas yang lebih panjang menghabiskan lebih banyak ruang sekaligus menurunkan kepatuhan.',
      ),

      h2('Memecah menjadi beberapa berkas'),
      p(
        'Untuk project yang instruksinya memang banyak, ada dua cara memecah, dan keduanya menyelesaikan masalah yang berbeda.',
      ),
      compare(
        {
          title: 'Impor',
          lang: 'text',
          code: `
          # CLAUDE.md
          Lihat @README untuk gambaran project.

          # Instruksi tambahan
          - alur git @docs/git-instructions.md
          `,
          notes: [
            'Menolong kerapian dan pemeliharaan.',
            'Tidak menghemat ruang, karena berkas yang diimpor ikut dimuat di awal sesi.',
            'Untuk menyebut path tanpa mengimpornya, bungkus dalam backtick.',
          ],
        },
        {
          title: 'Aturan bercakupan path',
          lang: 'text',
          code: `
          ---
          paths:
            - "src/api/**/*.ts"
          ---

          # Aturan API

          - Setiap endpoint wajib memvalidasi input
          - Pakai bentuk respons error yang baku
          `,
          notes: [
            'Baru dimuat ketika agent menyentuh berkas yang cocok.',
            'Ini yang benar-benar menghemat ruang.',
            'Aturan tanpa field paths dimuat di awal seperti biasa.',
          ],
        },
      ),
      p(
        'Perbedaan keduanya sering disalahpahami, jadi layak dinyatakan sekali lagi. Impor mengatur berkasmu supaya rapi, sedangkan aturan bercakupan path mengatur kapan sesuatu masuk ke context window. Kalau masalahmu adalah ruang, hanya yang kedua yang menolong.',
      ),
      p(
        'Project ini memakai folder `.claude/rules/` dengan berkas terpisah per topik, yaitu `core.md`, `security.md`, `frontend.md`, `backend.md`, dan seterusnya. Bentuk itu membuat aturan keamanan bisa dipelihara tanpa menyentuh aturan frontend, dan membuat pertanyaan aturan mana yang mengikat bisa dijawab dengan menunjuk satu berkas.',
      ),

      h2('Catatan yang ditulis agent sendiri'),
      p(
        'Selain berkas yang kamu tulis, ada mekanisme kedua yang mengisi dirinya sendiri. Agent menyimpan catatan berdasarkan koreksi yang kamu berikan dan preferensi yang kamu nyatakan, lalu memuatnya lagi di sesi berikutnya.',
      ),
      table(
        ['', 'CLAUDE.md', 'Catatan otomatis'],
        [
          ['Siapa yang menulis', 'Kamu', 'Agent'],
          ['Isinya', 'Instruksi dan aturan', 'Pelajaran dan pola'],
          [
            'Cakupannya',
            'Project, pengguna, atau organisasi',
            'Per repositori, di luar version control',
          ],
          [
            'Cocok untuk',
            'Standar kode, alur kerja, arsitektur',
            'Preferensimu, koreksi yang kamu berikan, konteks project',
          ],
        ],
        'Keduanya dimuat di awal sesi, dan keduanya diperlakukan sebagai konteks dan bukan konfigurasi yang ditegakkan.',
      ),
      p(
        'Yang membuat mekanisme ini berguna adalah kamu tidak perlu memutuskan apa yang layak diingat di saat kamu sedang sibuk mengerjakan sesuatu. Yang perlu kamu lakukan hanya memberi koreksi seperti biasa, dan koreksi yang berulang akan tersimpan sendiri.',
      ),
      callout(
        'info',
        'Isinya bisa kamu baca dan kamu hapus',
        'Catatan itu berupa berkas markdown biasa di direktori tersendiri, bukan sesuatu yang tersembunyi. Kamu bisa membukanya, menyuntingnya, atau menghapus yang sudah tidak benar. Ini penting karena catatan mencerminkan keadaan saat ia ditulis, sehingga catatan lama bisa menyesatkan ketika projectmu sudah berubah.',
      ),

      h2('Membangunnya secara bertahap'),
      p(
        'Kamu tidak perlu menulis berkas yang lengkap di hari pertama. Justru sebaliknya, berkas yang paling berguna tumbuh dari kejadian nyata.',
      ),
      ol(
        'Mulai dari perintah yang tidak bisa ditebak, yaitu cara menjalankan build, test, dan linter.',
        'Tambahkan sebuah aturan ketika agent melakukan kesalahan yang sama untuk kedua kalinya.',
        'Tambahkan sebuah aturan ketika kamu mengetik koreksi yang sama seperti sesi sebelumnya.',
        'Pindahkan prosedur panjang ke skill, karena prosedur bukan fakta dan tidak perlu dimuat tiap sesi.',
        'Pangkas berkala, dengan menjalankan pertanyaan penyaring pada tiap baris.',
      ),
      p(
        'Langkah kedua dan ketiga adalah sumber terbaik isi berkas ini, karena keduanya berasal dari kegagalan nyata dan bukan dari bayangan tentang kegagalan yang mungkin terjadi. Langkah keempat menunjuk ke sub-bab berikutnya, yang membahas kapan sesuatu sebaiknya menjadi skill alih-alih menjadi baris di sini.',
      ),

      h2('Rangkuman'),
      ul(
        'Berkas instruksi project menghapus kebutuhan menjelaskan hal yang sama tiap sesi.',
        'Ia dimuat setiap sesi, sehingga panjangnya berbiaya tetap dan berkas yang membengkak justru diabaikan.',
        'Pertanyaan penyaringnya adalah apakah menghapus baris ini akan membuat agent melakukan kesalahan.',
        'Impor menolong kerapian, sedangkan aturan bercakupan path yang benar-benar menghemat ruang.',
        'Catatan otomatis melengkapi berkas yang kamu tulis, dan isinya bisa kamu baca serta hapus.',
        'Bangun bertahap dari kegagalan nyata, dan pangkas berkala.',
      ),

      references(
        {
          label: 'How Claude remembers your project',
          href: 'https://code.claude.com/docs/en/memory',
          source: 'Anthropic',
          note: 'Sumber lokasi berkas, aturan impor, aturan bercakupan path, dan catatan otomatis.',
        },
        {
          label: 'Write an effective CLAUDE.md',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Tabel apa yang layak masuk dan tidak, beserta peringatan soal berkas yang membengkak.',
        },
        {
          label: 'AGENTS.md',
          href: 'https://agents.md/',
          source: 'Agentic AI Foundation',
          note: 'Format berkas instruksi yang dipakai banyak alat lain, dibahas di sub-bab 4.2.',
        },
      ),
    ],
  ),

  written(
    'skills-subagent-hooks',
    'Skills, Subagent, dan Hooks',
    14,
    'Tiga mekanisme perluasan, dan cara memilih di antara ketiganya.',
    [
      p(
        'Sub-bab sebelumnya menutup dengan satu pertanyaan yang menggantung, yaitu ke mana prosedur panjang harus pergi kalau ia tidak layak tinggal di berkas instruksi project. Sub-bab ini menjawabnya, sekaligus membahas dua mekanisme lain yang sering tertukar dengannya.',
      ),
      p(
        'Ketiganya menyelesaikan masalah yang berbeda, dan memilih yang keliru menghasilkan hal yang berjalan setengah baik. Cara membedakannya cukup satu pertanyaan per mekanisme, dan pertanyaan itulah yang akan kita bangun di sini.',
      ),

      terms(
        {
          term: 'skill',
          meaning:
            'Berkas `SKILL.md` berisi pengetahuan atau prosedur, yang dimuat hanya ketika ia relevan atau ketika kamu memanggilnya. Inilah bedanya dari berkas instruksi project yang dimuat selalu. Isinya bisa berupa pengetahuan domain, misalnya konvensi API tim, atau berupa alur kerja yang bisa kamu panggil dengan garis miring diikuti namanya.',
        },
        {
          term: 'frontmatter',
          meaning:
            'Blok metadata di awal berkas markdown, ditulis di antara dua baris tiga tanda hubung. Untuk skill, ia memuat nama dan deskripsi. Deskripsinya yang paling menentukan, karena itulah satu-satunya bahan yang dipakai agent untuk memutuskan apakah skill itu relevan dengan permintaanmu.',
        },
        {
          term: 'progressive disclosure',
          meaning:
            'Prinsip memuat isi secara bertahap sesuai kebutuhan. Untuk skill, agent hanya menerima daftar nama dan deskripsi saat sesi dimulai, lalu memuat isi lengkapnya ketika skill itu benar-benar dipakai. Inilah sebabnya bahan rujukan yang panjang hampir tidak berbiaya sampai ia dibutuhkan.',
        },
        {
          term: 'subagent',
          meaning:
            'Sesi terpisah dengan context window-nya sendiri dan seperangkat alat yang bisa kamu batasi, dipakai untuk pekerjaan yang membaca banyak berkas atau butuh sudut pandang mandiri. Hasilnya kembali ke sesi utama sebagai ringkasan, sehingga berkas yang dibacanya tidak menempati ruangmu.',
        },
        {
          term: 'hook',
          meaning:
            'Perintah shell yang dijalankan otomatis pada titik tertentu dalam alur kerja agent, misalnya sesudah tiap penyuntingan berkas atau sebelum sebuah giliran berakhir. Bedanya dari instruksi bersifat menentukan, yaitu instruksi mengarahkan sedangkan hook menjamin karena ia dijalankan sistem dan bukan diputuskan model.',
        },
        {
          term: 'plugin',
          meaning:
            'Paket yang membundel skill, hook, subagent, dan sambungan alat luar menjadi satu unit yang bisa dipasang sekaligus. Berguna untuk berbagi kumpulan konfigurasi ke satu tim atau ke publik, tanpa tiap orang menyusun ulang bagian-bagiannya.',
        },
      ),

      h2('Satu pertanyaan untuk memilih'),
      p(
        'Sebelum masuk ke rinciannya, inilah cara memilih. Tiap mekanisme punya satu pertanyaan penentu, dan biasanya hanya satu yang jawabannya ya.',
      ),
      table(
        ['Mekanisme', 'Pertanyaan penentu', 'Contoh'],
        [
          [
            'Berkas instruksi project',
            'Apakah ini fakta yang harus agent pegang di **setiap** sesi?',
            'Perintah menjalankan test, larangan commit tanpa diminta',
          ],
          [
            'Skill',
            'Apakah ini prosedur atau pengetahuan yang hanya **kadang** dipakai?',
            'Langkah audit keamanan, konvensi penulisan materi kurikulum',
          ],
          [
            'Subagent',
            'Apakah pekerjaan ini membaca banyak berkas, atau butuh **sudut pandang mandiri**?',
            'Menelusuri modul asing, meninjau diff dengan konteks bersih',
          ],
          [
            'Hook',
            'Apakah ini harus terjadi **setiap kali tanpa pengecualian**?',
            'Format otomatis sesudah penyuntingan, blokir penulisan ke folder migrasi',
          ],
        ],
        'Kalau dua pertanyaan sama-sama berjawab ya, pekerjaannya kemungkinan besar perlu dipecah.',
      ),
      p(
        'Baris keempat punya kata kunci yang membedakannya dari tiga baris lain, yaitu tanpa pengecualian. Ketiga mekanisme pertama adalah konteks yang mempengaruhi keputusan model, sedangkan hook adalah perintah yang dijalankan sistem terlepas dari apa yang diputuskan model. Perbedaan itu menentukan mana yang boleh kamu andalkan untuk hal yang tidak boleh gagal.',
      ),

      h2('Skill, yaitu prosedur yang dimuat saat dibutuhkan'),
      p(
        'Buat skill ketika kamu mendapati dirimu menempelkan instruksi, daftar periksa, atau prosedur yang sama berulang kali, atau ketika sebuah bagian di berkas instruksi project sudah tumbuh menjadi prosedur alih-alih fakta.',
      ),
      code(
        'text',
        `
        .claude/skills/audit-materi/SKILL.md
        ---
        name: audit-materi
        description: Memeriksa satu sub-bab kurikulum terhadap aturan
          project, yaitu urutan blok, kelengkapan istilah, rujukan
          resmi, dan aturan tanda baca prosa.
        ---

        # Audit satu sub-bab

        1. Baca sub-bab yang disebut pengguna
        2. Periksa urutannya, yaitu pembuka, istilah, materi,
           rangkuman, lalu rujukan
        3. Pastikan tiap istilah asing punya entri di blok istilah
        4. Pastikan tiap rujukan memakai host yang ada di allow-list
        5. Jalankan pemeriksa tanda baca prosa
        6. Laporkan temuan sebagai daftar berkas dan nomor baris
        `,
        { caption: 'Isi ini tidak menempati ruang sampai skill-nya benar-benar dipakai.' },
      ),
      p(
        'Bagian yang paling menentukan di berkas itu bukan langkah-langkahnya, melainkan deskripsinya. Deskripsi adalah satu-satunya bahan yang dipakai agent untuk memutuskan apakah skill ini cocok dengan permintaanmu, jadi ia harus menyebut kapan skill ini dipakai dan bukan sekadar apa namanya.',
      ),
      p(
        'Kamu juga bisa memanggilnya langsung dengan mengetik garis miring diikuti namanya. Untuk alur kerja yang punya efek samping dan sebaiknya tidak dipicu sendiri oleh agent, ada pengaturan frontmatter yang membuatnya hanya bisa dipanggil manual. Project yang sedang kamu pelajari ini memakai kumpulan skill semacam itu, dan kamu bisa melihat bentuknya di folder `.claude/skills/`.',
      ),
      callout(
        'tip',
        'Tanda sesuatu sebaiknya menjadi skill',
        'Kalau sebuah bagian di berkas instruksi project berbentuk langkah bernomor, ia hampir pasti lebih baik menjadi skill. Fakta layak dimuat selalu, sedangkan prosedur hanya perlu hadir ketika prosedurnya sedang dijalankan. Memindahkannya menghemat ruang di setiap sesi yang tidak memerlukannya.',
      ),

      h2('Subagent, yaitu ruang kerja terpisah'),
      p(
        'Subagent menyelesaikan dua masalah yang tampak berbeda tetapi berakar sama, yaitu ruang yang terbatas dan sudut pandang yang tidak netral.',
      ),
      compare(
        {
          title: 'Menelusuri di ruang utama',
          lang: 'text',
          code: `
          Ruang utama
          ├── instruksi project
          ├── berkas 1 dibaca
          ├── berkas 2 dibaca
          ├── ... 18 berkas lagi
          └── kesimpulan
          `,
          notes: [
            'Dua puluh berkas menempati ruangmu sesudah selesai.',
            'Sembilan belas di antaranya mungkin tidak lagi relevan.',
            'Pengerjaan berikutnya berjalan di ruang yang sudah sempit.',
          ],
        },
        {
          title: 'Menelusuri di subagent',
          lang: 'text',
          code: `
          Ruang utama            Ruang subagent
          ├── instruksi          ├── 20 berkas dibaca
          └── ringkasan  <-------└── ringkasan
          `,
          notes: [
            'Yang masuk ke ruangmu hanya ringkasannya.',
            'Ruang subagent dibuang sesudah selesai.',
            'Kamu tetap bisa memintanya membaca ulang bila perlu.',
          ],
        },
      ),
      p(
        'Masalah kedua yang diselesaikannya lebih halus. Agent yang baru saja menulis sebuah perubahan cenderung membenarkan pilihannya sendiri ketika diminta meninjau. Peninjau yang berjalan di ruang terpisah hanya melihat hasilnya beserta kriteria yang kamu berikan, tanpa penalaran yang menghasilkan perubahan itu, sehingga ia menilai apa adanya.',
      ),
      code(
        'text',
        `
        # Untuk penelusuran
        Pakai subagent untuk menelusuri bagaimana project ini
        menangani rotasi refresh token, dan apakah sudah ada
        utilitas yang bisa saya pakai ulang. Laporkan sebagai
        daftar berkas beserta perannya.

        # Untuk peninjauan
        Pakai subagent untuk meninjau diff ini terhadap PLAN.md.
        Periksa apakah tiap kebutuhan sudah terpasang, apakah
        kasus tepi yang disebut sudah punya test, dan apakah ada
        yang berubah di luar cakupan. Laporkan kekurangan yang
        mempengaruhi kebenaran, bukan selera gaya penulisan.
        `,
        {
          caption:
            'Kalimat terakhir pada contoh peninjauan adalah pagar yang mencegah temuan yang mengada-ada.',
        },
      ),
      p(
        'Kamu juga bisa mendefinisikan subagent tetap sebagai berkas di folder `.claude/agents/`, lengkap dengan perannya, alat yang boleh ia pakai, dan model yang menjalankannya. Pembatasan alat di situ punya nilai keamanan, yaitu peninjau yang hanya boleh membaca memang tidak bisa mengubah apa pun, dan itu jaminan yang tidak bergantung pada instruksi.',
      ),

      h2('Hook, yaitu hal yang dijamin terjadi'),
      p(
        'Hook adalah satu-satunya dari tiga mekanisme ini yang tidak bergantung pada keputusan model. Ia berupa perintah shell yang dijalankan sistem pada titik tertentu.',
      ),
      table(
        ['Kebutuhan', 'Lewat instruksi', 'Lewat hook'],
        [
          [
            'Format kode sesudah tiap penyuntingan',
            'Biasanya dituruti, kadang terlewat saat sesi panjang',
            'Selalu berjalan',
          ],
          ['Jangan menulis ke folder migrasi', 'Biasanya dituruti', 'Ditolak sistem'],
          [
            'Jalankan test sebelum giliran berakhir',
            'Biasanya dituruti',
            'Giliran tidak bisa berakhir sebelum test lulus',
          ],
          [
            'Catat berkas apa saja yang disentuh',
            'Bergantung pada ingatan agent',
            'Tercatat semuanya',
          ],
        ],
        'Kolom tengah bukan tidak berguna, ia hanya bukan jaminan.',
      ),
      p(
        'Baris ketiga adalah bentuk paling kuat dari seluruh sub-bab ini, dan sekaligus yang paling perlu kamu pakai dengan hati-hati. Pemeriksaan yang menahan berakhirnya giliran mengubah selesai dari penilaian model menjadi hasil sebuah perintah. Konsekuensinya, pemeriksaan yang salah tulis bisa membuat pekerjaan berputar tanpa henti, jadi ia perlu punya batas dan perlu kamu uji sendiri lebih dulu.',
      ),
      p(
        'Kabar baiknya, kamu tidak perlu menulis hook dengan tangan. Agent bisa menuliskannya untukmu, misalnya dengan permintaan berupa buatkan hook yang menjalankan linter sesudah tiap penyuntingan berkas, atau buatkan hook yang memblokir penulisan ke folder migrasi.',
      ),

      h2('Menyusun ketiganya untuk satu project'),
      p(
        'Bentuk yang matang biasanya memakai keempat lapisan sekaligus, masing-masing untuk perannya sendiri. Berikut susunan yang dipakai project kurikulum ini, sebagai contoh nyata.',
      ),
      code(
        'text',
        `
        CLAUDE.md              fakta yang berlaku selalu, sengaja tipis
        .claude/rules/         aturan mengikat per topik
        .claude/skills/        prosedur yang dipanggil saat dibutuhkan
        .claude/scripts/       pemeriksa yang dijalankan aturan tertentu
        .claude/settings.json  perilaku sesi, termasuk hook
        `,
        { caption: 'Perhatikan pemisahannya mengikuti umur pakai, bukan mengikuti topik.' },
      ),
      p(
        'Pemisahan berdasarkan umur pakai itu yang membuat susunannya bertahan. Fakta yang berlaku selalu ada di lapisan paling atas, prosedur yang kadang dipakai ada di lapisan yang dimuat sesuai kebutuhan, dan hal yang tidak boleh bergantung pada kepatuhan ada di lapisan yang ditegakkan sistem.',
      ),
      callout(
        'warning',
        'Jangan mengulang aturan yang sama di dua tempat',
        'Aturan yang ditulis di berkas instruksi project sekaligus di skill akan menyimpang seiring waktu, dan ketika itu terjadi kamu punya dua sumber kebenaran yang bertentangan. Pilih satu tempat, lalu tunjuk ke sana dari tempat lain. Ini prinsip yang sama dengan larangan menduplikasi dokumentasi yang sudah kamu pelajari sebelumnya.',
      ),

      h2('Rangkuman'),
      ul(
        'Berkas instruksi project untuk fakta yang berlaku selalu, skill untuk prosedur yang kadang dipakai.',
        'Deskripsi skill adalah bagian terpenting, karena itulah bahan yang menentukan kapan ia dipilih.',
        'Skill hanya memuat isinya saat dipakai, sehingga bahan rujukan panjang hampir tidak berbiaya.',
        'Subagent menjaga ruang utama tetap bersih sekaligus memberi sudut pandang yang tidak membenarkan diri sendiri.',
        'Hook adalah satu-satunya yang menjamin, karena ia dijalankan sistem dan bukan diputuskan model.',
        'Pisahkan berdasarkan umur pakai, dan jangan menulis aturan yang sama di dua tempat.',
      ),

      references(
        {
          label: 'Extend Claude with skills',
          href: 'https://code.claude.com/docs/en/skills',
          source: 'Anthropic',
          note: 'Bentuk berkas SKILL.md, tempat penyimpanannya, dan cara agent memutuskan memakainya.',
        },
        {
          label: 'Subagents',
          href: 'https://code.claude.com/docs/en/sub-agents',
          source: 'Anthropic',
          note: 'Cara mendefinisikan subagent beserta pembatasan alat dan modelnya.',
        },
        {
          label: 'Hooks',
          href: 'https://code.claude.com/docs/en/hooks-guide',
          source: 'Anthropic',
          note: 'Titik siklus tempat hook berjalan, dan kenapa ia bersifat menentukan sedangkan instruksi tidak.',
        },
      ),
    ],
  ),

  written(
    'verifikasi-kerja-agent',
    'Memberi Agent Cara Memverifikasi Kerjanya',
    14,
    'Teknik terpenting di seluruh bab ini, karena ia mengubah arti kata selesai.',
    [
      p(
        'Kalau kamu hanya sanggup menerapkan satu hal dari bab ini, terapkan yang ini. Dokumentasi Claude Code menempatkannya sebagai butir pertama di panduan praktik terbaiknya, dan alasannya sudah kita siapkan sejak sub-bab 3.1.',
      ),
      p(
        'Agent berhenti ketika pekerjaannya terlihat selesai. Tanpa pemeriksaan yang bisa ia jalankan sendiri, terlihat selesai adalah satu-satunya sinyal yang tersedia, dan kamu menjadi satu-satunya pemeriksa. Artinya setiap kesalahan menunggu kamu menyadarinya. Beri ia sesuatu yang menghasilkan lulus atau gagal, dan putarannya menutup sendiri.',
      ),

      terms(
        {
          term: 'verification (verifikasi)',
          meaning:
            'Pemeriksaan yang menghasilkan sinyal yang bisa dibaca agent di dalam percakapan, misalnya hasil test, kode keluar sebuah build, keluaran linter, atau perbandingan tangkapan layar terhadap desain. Yang membedakannya dari sekadar melihat hasil adalah ia menghasilkan lulus atau gagal, bukan kesan.',
        },
        {
          term: 'feedback loop (putaran umpan balik)',
          meaning:
            'Siklus kerjakan, periksa, baca hasilnya, perbaiki, periksa lagi. Ketika pemeriksaannya bisa dijalankan agent sendiri, putaran ini berjalan tanpa kamu. Ketika tidak ada, kamu yang menjadi bagian dari putarannya, dan kecepatannya menjadi kecepatanmu membaca.',
        },
        {
          term: 'red-capable',
          meaning:
            'Sifat sebuah pemeriksaan yang benar-benar bisa gagal pada masalah yang sedang dikerjakan. Test yang selalu lulus bukan pemeriksaan, ia hanya upacara. Cara memastikannya sederhana, yaitu jalankan test-nya sebelum perbaikan dan pastikan ia memang merah.',
        },
        {
          term: 'evidence (bukti)',
          meaning:
            'Keluaran nyata dari perintah yang benar-benar dijalankan, bukan pernyataan bahwa perintahnya lulus. Dokumentasi Claude Code menganjurkan meminta bukti alih-alih menerima klaim, dengan alasan praktis, yaitu membaca bukti lebih cepat daripada menjalankan ulang verifikasinya sendiri.',
        },
        {
          term: 'stop hook',
          meaning:
            'Hook yang berjalan tepat sebelum sebuah giliran berakhir, dan bisa menahan giliran itu sampai pemeriksaannya lulus. Ini bentuk penegakan paling kuat untuk verifikasi, karena ia mengubah selesai dari penilaian model menjadi hasil sebuah perintah.',
        },
        {
          term: 'adversarial review (tinjauan lawan)',
          meaning:
            'Langkah peninjauan yang dijalankan pihak lain dengan konteks bersih, bertugas mencari kekurangan dan bukan membenarkan. Dijalankan lewat subagent supaya peninjau tidak membawa penalaran yang menghasilkan perubahannya. Perlu pagar, karena peninjau yang diminta mencari kekurangan akan selalu menemukan sesuatu.',
        },
      ),

      h2('Bentuk pemeriksaan yang bisa dijalankan agent'),
      p(
        'Pemeriksaan tidak harus berupa test. Yang dibutuhkan hanyalah sesuatu yang menghasilkan sinyal yang bisa dibacanya di dalam percakapan.',
      ),
      table(
        ['Bentuk', 'Cocok untuk', 'Contoh di project ini'],
        [
          ['Test otomatis', 'Logika dan perilaku', '`npm run test`'],
          ['Type checker', 'Kesalahan tipe dan kontrak antar modul', '`npm run type-check`'],
          ['Linter dan formatter', 'Konsistensi gaya', '`npm run lint`'],
          ['Build', 'Kesalahan yang hanya muncul saat dirakit', '`npm run build`'],
          [
            'Skrip pemeriksa buatan sendiri',
            'Aturan khas project yang tidak ada tooling-nya',
            'Pemeriksa tanda baca prosa dan pemeriksa rasio kontras',
          ],
          [
            'Tangkapan layar dibandingkan desain',
            'Perubahan tampilan',
            'Membuka halaman lalu membandingkan hasilnya',
          ],
        ],
        'Baris kelima layak diperhatikan, karena aturan khas project sering tidak punya perkakas siap pakai.',
      ),
      p(
        'Baris kelima adalah pola yang dipakai project kurikulum ini dan patut ditiru. Ketika sebuah aturan penting tidak punya perkakas yang memeriksanya, aturan itu akan dilanggar cepat atau lambat, dan pelanggarannya tidak akan terlihat. Menulis skrip pendek yang memeriksanya mengubah aturan dari niat menjadi gerbang.',
      ),
      p(
        'Baris keenam menyelesaikan masalah yang dulu terasa mustahil, yaitu memverifikasi tampilan. Agent yang bisa membuka halaman lalu mengambil tangkapan layar punya sinyal yang bisa ia baca sendiri, sehingga ia bisa membandingkan hasilnya dengan desain lalu memperbaiki selisihnya tanpa menunggumu.',
      ),

      h2('Empat tingkat pengikatan'),
      p(
        'Sesudah pemeriksaannya ada, tinggal memutuskan seberapa keras ia mengikat titik berhenti. Dokumentasi Claude Code menyusunnya sebagai empat pilihan yang menukar penyiapan dengan perhatian.',
      ),
      steps(
        {
          title: 'Di dalam satu prompt',
          body: 'Minta agent menjalankan pemeriksaannya dan mengulang sampai lulus, di pesan yang sama dengan permintaan kerjanya. Tidak butuh penyiapan apa pun dan bisa kamu pakai hari ini juga.',
        },
        {
          title: 'Sebagai syarat sepanjang sesi',
          body: 'Tetapkan pemeriksaan sebagai syarat yang diperiksa ulang sesudah tiap giliran, sehingga agent terus bekerja sampai syaratnya terpenuhi. Berguna untuk pekerjaan panjang yang kamu tinggal.',
        },
        {
          title: 'Sebagai gerbang yang menentukan',
          body: 'Pasang hook yang menjalankan pemeriksaanmu sebagai skrip dan menahan giliran berakhir sampai ia lulus. Inilah yang membuat sesi tanpa pengawasan bisa berakhir dengan benar.',
        },
        {
          title: 'Sebagai pendapat kedua',
          body: 'Jalankan peninjau di konteks bersih yang mencoba membantah hasilnya, sehingga yang mengerjakan bukan yang menilai. Dipakai bersama tiga tingkat di atas, bukan menggantikannya.',
        },
      ),
      p(
        'Tingkat pertama sudah memberi sebagian besar manfaatnya, dan itu penting untuk disadari supaya kamu tidak menunda memakainya sampai punya waktu menyiapkan hook. Satu kalimat tambahan di prompt hari ini lebih berharga daripada gerbang sempurna minggu depan.',
      ),

      h2('Bentuk konkretnya dalam prompt'),
      compare(
        {
          title: 'Tanpa pemeriksaan',
          lang: 'text',
          code: `
          Buat fungsi yang memvalidasi alamat email.
          `,
          notes: [
            'Selesai berarti fungsinya sudah ditulis.',
            'Apakah ia benar tidak pernah diuji.',
            'Kamu yang menemukan kasus yang terlewat, mungkin beberapa hari kemudian.',
          ],
        },
        {
          title: 'Dengan pemeriksaan',
          lang: 'text',
          code: `
          Buat fungsi validateEmail. Contoh kasus ujinya,
          user@example.com bernilai benar, invalid bernilai salah,
          dan user@.com bernilai salah. Tulis test-nya, jalankan,
          lalu perbaiki sampai seluruhnya lulus.
          `,
          notes: [
            'Selesai berarti test-nya lulus.',
            'Kasus tepinya sudah ditentukan olehmu, bukan ditebak.',
            'Putaran perbaikannya berjalan tanpa kamu.',
          ],
        },
      ),
      p(
        'Pola yang sama berlaku untuk perbaikan bug, dan bentuknya sedikit berbeda karena di sana pemeriksaannya harus merah lebih dulu.',
      ),
      code(
        'text',
        `
        Build gagal dengan pesan berikut.

        [ tempel pesan errornya ]

        Perbaiki dan pastikan build-nya berhasil. Cari akar
        masalahnya, jangan menyembunyikan errornya. Sebelum
        memperbaiki, tunjukkan dulu perintah apa yang membuat
        kegagalan ini muncul, supaya saya tahu kita punya sinyal
        yang benar-benar bisa merah.
        `,
        {
          caption:
            'Kalimat terakhir memindahkan disiplin membangun sinyal merah dari kategori sebelumnya ke prompt.',
        },
      ),

      h2('Minta bukti, bukan klaim'),
      p(
        'Ada perbedaan yang tampak sepele antara agent yang berkata test-nya lulus dan agent yang menunjukkan keluaran perintahnya. Perbedaannya bukan sepele, dan project ini sudah menjadikannya aturan tertulis.',
      ),
      table(
        ['Yang kamu terima', 'Nilainya', 'Yang sebaiknya kamu minta'],
        [
          [
            'Semua test lulus',
            'Klaim, tidak bisa diperiksa',
            'Keluaran perintah test beserta jumlah yang lulus',
          ],
          ['Sudah saya perbaiki', 'Klaim', 'Perintah yang dijalankan dan hasilnya'],
          [
            'Seharusnya sekarang bekerja',
            'Dugaan yang menyamar sebagai laporan',
            'Jalankan dan tunjukkan hasilnya',
          ],
          ['Tampilannya sudah benar', 'Penilaian', 'Tangkapan layar hasilnya'],
        ],
        'Kolom kanan tidak menuntut kepercayaan, karena ia bisa kamu periksa dalam hitungan detik.',
      ),
      p(
        'Alasan praktis di balik anjuran ini, seperti disebut dokumentasi Claude Code, adalah meninjau bukti lebih cepat daripada menjalankan ulang verifikasinya sendiri. Ini terutama berlaku untuk sesi yang tidak kamu tonton, karena bukti yang tercatat di percakapan adalah satu-satunya yang bisa kamu baca ketika kembali.',
      ),
      callout(
        'danger',
        'Waspadai kelulusan yang dicapai dengan mengubah test',
        'Pemeriksaan otomatis punya jalan pintas yang khas, yaitu mengubah atau menghapus test yang menghalangi. Hasilnya hijau dan masalahnya tetap ada. Nyatakan dengan tegas bahwa menghapus atau melonggarkan test tidak diperbolehkan, dan periksa diff test-nya bersamaan dengan diff kodenya. Ini kelas kegagalan yang tidak akan pernah dilaporkan sebagai kegagalan.',
      ),

      h2('Menambahkan langkah tinjauan'),
      p(
        'Semakin lama agent bekerja tanpa pengawasan, semakin berharga sebuah pemeriksaan mandiri sebelum kamu menganggap pekerjaannya beres. Peninjau yang berjalan di konteks bersih hanya melihat hasilnya beserta kriteria yang kamu berikan.',
      ),
      code(
        'text',
        `
        Pakai subagent untuk meninjau diff ini terhadap PLAN.md.
        Periksa tiga hal, yaitu apakah tiap kebutuhan sudah
        terpasang, apakah kasus tepi yang tercantum sudah punya
        test, dan apakah ada yang berubah di luar cakupan tugas.

        Laporkan kekurangan yang mempengaruhi kebenaran atau
        kebutuhan yang tertulis. Jangan melaporkan selera gaya
        penulisan.
        `,
        {
          caption:
            'Dua kalimat terakhir adalah pagarnya, dan tanpa pagar itu tinjauan berubah menjadi daftar keinginan.',
        },
      ),
      p(
        'Pagarnya penting karena alasan yang sudah disebut di sub-bab 1.8. Peninjau yang diminta mencari kekurangan akan melaporkan sesuatu meski pekerjaannya sudah benar, karena itulah yang diminta darinya. Mengejar setiap temuan berujung pada lapisan abstraksi tambahan, kode penjagaan berlebihan, dan test untuk kasus yang tidak mungkin terjadi.',
      ),

      h2('Ketika pemeriksaannya belum ada'),
      p(
        'Sebagian pekerjaan memang belum punya cara diperiksa, misalnya modul lama yang tidak punya test sama sekali. Itu bukan alasan melewati sub-bab ini, melainkan pekerjaan pertama yang layak dikerjakan.',
      ),
      ol(
        'Minta agent menulis test untuk perilaku yang **sudah ada** lebih dulu, tanpa mengubah kodenya. Test itu menjadi jaring pengaman sebelum apa pun disentuh.',
        'Jalankan test itu dan pastikan ia lulus, karena test yang salah tulis akan menyesatkan seluruh pekerjaan berikutnya.',
        'Baru minta perubahan yang kamu inginkan, dengan test tadi sebagai pemeriksaannya.',
        'Kalau menulis test terasa terlalu mahal, minimal siapkan satu perintah yang membuktikan alur utamanya masih bekerja.',
      ),
      p(
        'Urutan itu terasa lambat di awal dan hampir selalu lebih cepat pada akhirnya. Tanpa jaring pengaman, tiap perubahan menuntut pemeriksaan manual, dan pemeriksaan manual yang diulang sepuluh kali jauh lebih mahal daripada menulis test sekali.',
      ),

      h2('Rangkuman'),
      ul(
        'Agent berhenti ketika hasilnya terlihat selesai, sehingga pemeriksaan yang bisa ia jalankan mengubah arti selesai.',
        'Pemeriksaan tidak harus berupa test, yang penting ia menghasilkan lulus atau gagal.',
        'Aturan khas project yang tidak punya perkakas pemeriksa akan dilanggar tanpa terlihat.',
        'Tingkat pengikatan paling ringan sudah memberi sebagian besar manfaatnya, jadi jangan menundanya.',
        'Minta bukti berupa keluaran perintah, bukan klaim bahwa perintahnya lulus.',
        'Waspadai kelulusan yang dicapai dengan mengubah test, karena ia tidak akan pernah dilaporkan sebagai kegagalan.',
      ),

      references(
        {
          label: 'Give Claude a way to verify its work',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Sumber empat tingkat pengikatan, anjuran meminta bukti, dan pagar untuk langkah tinjauan.',
        },
        {
          label: 'Avoid focusing on passing tests and hardcoding',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Bentuk instruksi untuk mencegah solusi yang hanya cocok dengan kasus di test.',
        },
        {
          label: 'Hooks reference',
          href: 'https://code.claude.com/docs/en/hooks',
          source: 'Anthropic',
          note: 'Titik siklus tempat pemeriksaan bisa dipasang sebagai gerbang yang menentukan.',
        },
      ),
    ],
  ),

  written(
    'pola-kegagalan-claude-code',
    'Pola Kegagalan dan Cara Keluar',
    13,
    'Lima sesi yang berputar tanpa maju, dan cara mengenali masing-masing sejak awal.',
    [
      p(
        'Sub-bab ini menutup Bab 3 dengan kumpulan kegagalan yang bentuknya khas dan berulang. Nilainya bukan pada daftar kegagalannya, melainkan pada kemampuan mengenali sebuah sesi sedang masuk ke salah satunya sebelum kamu menghabiskan satu jam di dalamnya.',
      ),
      p(
        'Lima yang pertama datang dari dokumentasi Claude Code sendiri, dan sisanya adalah bentuk yang muncul dari penerapan aturan project ini. Semuanya punya ciri sama, yaitu terasa seperti masalah kepintaran padahal sebenarnya masalah proses.',
      ),

      terms(
        {
          term: 'kitchen sink session',
          meaning:
            'Sesi yang berisi banyak tugas tidak berhubungan, sehingga context window-nya penuh hal yang tidak relevan. Namanya diambil dari ungkapan Inggris yang berarti memasukkan segala hal sekaligus. Gejalanya berupa jawaban yang mulai melenceng padahal permintaanmu sudah jelas.',
        },
        {
          term: 'correction spiral',
          meaning:
            'Putaran mengoreksi hal yang sama berulang kali tanpa hasil. Yang membuatnya memburuk, tiap koreksi yang gagal menambah satu pendekatan keliru ke dalam konteks, lengkap dengan alasan yang terdengar masuk akal, dan semuanya ikut terkirim di giliran berikutnya.',
        },
        {
          term: 'trust-then-verify gap',
          meaning:
            'Jarak antara hasil yang terlihat masuk akal dan hasil yang benar-benar diperiksa. Muncul ketika kamu menerima pekerjaan berdasarkan kesan, lalu menemukan kasus tepi yang tidak tertangani beberapa hari kemudian.',
        },
        {
          term: 'infinite exploration',
          meaning:
            'Penelusuran yang tidak dibatasi cakupannya, sehingga agent membaca ratusan berkas dan memenuhi context window sebelum sempat mengerjakan apa pun. Gejalanya berupa sesi yang sudah lama berjalan tanpa satu berkas pun berubah.',
        },
        {
          term: 'overengineering',
          meaning:
            'Kecenderungan menambahkan berkas, lapisan abstraksi, dan keluwesan yang tidak diminta. Dokumentasi Anthropic menyebutnya sebagai perilaku yang perlu diredam pada sebagian model, dan menyediakan bentuk instruksi khusus untuk itu.',
        },
      ),

      h2('Lima pola kegagalan dan obatnya'),
      table(
        ['Pola', 'Gejala yang kamu lihat', 'Obatnya'],
        [
          [
            'Sesi campur aduk',
            'Kamu mengerjakan satu hal, bertanya hal lain, lalu kembali. Jawabannya mulai melenceng',
            'Bersihkan konteks di antara tugas yang tidak berhubungan',
          ],
          [
            'Koreksi berputar',
            'Kamu mengoreksi hal yang sama untuk ketiga kalinya',
            'Sesudah dua kegagalan, mulai bersih dengan prompt yang memuat pelajaran dari keduanya',
          ],
          [
            'Berkas instruksi terlalu panjang',
            'Aturan yang jelas tertulis terus dilanggar',
            'Pangkas tanpa ampun, dan ubah yang harus dijamin menjadi hook',
          ],
          [
            'Percaya tanpa memeriksa',
            'Hasilnya terlihat masuk akal, lalu kasus tepinya rusak',
            'Selalu sediakan pemeriksaan, dan jangan kirim yang tidak bisa kamu periksa',
          ],
          [
            'Penelusuran tanpa ujung',
            'Sesi sudah lama berjalan dan belum satu pun berkas berubah',
            'Batasi cakupan penelusuran, atau serahkan ke subagent',
          ],
        ],
        'Empat dari lima obatnya berupa mengurangi sesuatu, bukan menambahkan.',
      ),
      p(
        'Baris ketiga adalah yang paling menipu karena ia tampak seperti kebalikannya. Ketika sebuah aturan terus dilanggar, naluri pertama adalah menuliskannya lebih tegas atau menambahkan penekanan. Pada berkas yang memang sudah terlalu panjang, tambahan itu memperparah penyebabnya, karena ia menambah satu baris lagi ke tumpukan yang sudah membuat semua baris tidak menonjol.',
      ),

      h2('Membaca gejala dengan benar'),
      p(
        'Beberapa gejala punya lebih dari satu penyebab, dan salah membaca berarti mencoba obat yang keliru. Tabel berikut membantu membedakannya.',
      ),
      table(
        ['Gejala', 'Kemungkinan A', 'Kemungkinan B', 'Cara membedakan'],
        [
          [
            'Instruksi diabaikan',
            'Konteks sudah penuh',
            'Berkas instruksi terlalu panjang',
            'Mulai sesi baru. Kalau langsung membaik, penyebabnya konteks',
          ],
          [
            'Jawabannya umum dan tidak menyentuh kodemu',
            'Ia belum membaca berkasnya',
            'Ruang sudah penuh sehingga bahan lama tergeser',
            'Minta ia menyebut nomor baris. Kalau tidak bisa, ia memang belum membaca',
          ],
          [
            'Perubahannya melebar keluar permintaan',
            'Batasnya tidak kamu sebutkan',
            'Kecenderungan menambah keluwesan yang tidak diminta',
            'Kalau tambahannya berupa abstraksi dan opsi, ini kemungkinan B',
          ],
          [
            'Test hijau tetapi bug-nya masih ada',
            'Test-nya tidak red-capable sejak awal',
            'Test-nya diubah supaya lulus',
            'Periksa diff berkas test-nya',
          ],
        ],
        'Kolom terakhir adalah pemeriksaan yang bisa kamu jalankan dalam beberapa detik.',
      ),
      p(
        'Baris terakhir layak dijadikan kebiasaan tetap. Ketika sebuah perbaikan membuat test menjadi hijau, lihat juga apakah berkas test-nya ikut berubah. Perubahan pada berkas test yang tidak kamu minta adalah tanda paling langsung dari kelulusan yang dicapai lewat jalan pintas.',
      ),

      h2('Meredam kecenderungan menambah yang tidak diminta'),
      p(
        'Ini bentuk kegagalan yang hasilnya berupa kode yang berjalan dan lulus test, sehingga tidak ada satu pun gerbang yang menangkapnya. Yang bertambah adalah hal yang harus dibaca dan dipelihara orang lain.',
      ),
      code(
        'text',
        `
        Hindari membangun berlebihan. Kerjakan hanya perubahan yang
        saya minta atau yang jelas diperlukan. Jaga solusinya tetap
        sederhana dan terfokus.

        Cakupan. Jangan menambah fitur, merapikan kode, atau membuat
        perbaikan di luar yang diminta. Perbaikan bug tidak perlu
        disertai pembersihan kode di sekitarnya, dan fitur sederhana
        tidak perlu dibuat serba bisa diatur.

        Dokumentasi. Jangan menambah komentar atau anotasi tipe pada
        kode yang tidak kamu ubah. Beri komentar hanya di tempat
        yang logikanya memang tidak terbaca sendiri.

        Penjagaan. Jangan menambah penanganan error atau validasi
        untuk keadaan yang tidak mungkin terjadi. Percayai kode
        internal dan jaminan framework. Validasi hanya di batas
        sistem, yaitu input pengguna dan API luar.

        Abstraksi. Jangan membuat helper atau lapisan untuk operasi
        yang cuma dipakai sekali. Jangan merancang untuk kebutuhan
        yang belum ada. Kerumitan yang tepat adalah yang paling
        sedikit untuk tugas sekarang.
        `,
        {
          caption:
            'Bentuk yang disediakan dokumentasi Anthropic. Cocok tinggal permanen di berkas instruksi project.',
        },
      ),
      p(
        'Bagian penjagaan pada instruksi itu bersinggungan dengan aturan keamanan yang sudah kamu pelajari, jadi perlu dibaca dengan tepat. Yang dilarang adalah penanganan error untuk keadaan yang memang tidak mungkin terjadi di dalam sistemmu sendiri, bukan validasi di batas kepercayaan. Validasi input di gerbang tetap wajib, dan aturan di `security.md` tetap mengikat.',
      ),

      h2('Ketika agent bersikeras pada pendekatan yang salah'),
      p(
        'Ada keadaan khusus yang tidak masuk ke lima pola di atas, yaitu ketika agent terus kembali ke pendekatan yang sudah kamu tolak. Ini biasanya bukan keras kepala, melainkan tanda bahwa penolakanmu belum menyertakan alasan.',
      ),
      compare(
        {
          title: 'Penolakan tanpa alasan',
          lang: 'text',
          code: `
          Jangan pakai library itu.
          `,
          notes: [
            'Agent menuruti untuk giliran ini.',
            'Beberapa giliran kemudian, alternatif yang ia pilih punya masalah yang sama.',
            'Ia tidak punya dasar untuk mengenali masalah itu.',
          ],
        },
        {
          title: 'Penolakan beserta alasannya',
          lang: 'text',
          code: `
          Jangan menambah library baru untuk ini. Project ini
          diaudit rantai pasoknya tiap rilis, jadi tiap paket
          baru menambah pekerjaan review. Pakai yang sudah ada
          di package.json, atau tulis fungsi kecil sendiri.
          `,
          notes: [
            'Alasannya berlaku juga untuk alternatif yang belum kamu sebutkan.',
            'Jalan keluarnya disebutkan, sehingga larangannya tidak buntu.',
            'Ini penerapan langsung dari sub-bab 1.4.',
          ],
        },
      ),
      p(
        'Kalau alasannya sudah kamu sebutkan dan pendekatan yang sama tetap kembali, itu tanda konteksnya sudah penuh dan penolakanmu sudah tergeser jauh ke atas. Obatnya sama seperti pola kedua, yaitu mulai bersih dengan prompt yang sudah memuat alasan itu sejak awal.',
      ),

      h2('Daftar periksa saat sesi terasa buntu'),
      p(
        'Ketika sebuah sesi terasa tidak maju, jalankan daftar ini dari atas. Tiga butir pertama menyelesaikan sebagian besar kasus.',
      ),
      checklist(
        'prompt-engineering/claude-code/sesi-buntu',
        'Pemeriksaan cepat saat sesi tidak maju',
        'Sudah berapa lama sesi ini berjalan, dan apakah gejalanya muncul bertahap',
        'Apakah aku sudah mengoreksi hal yang sama lebih dari dua kali',
        'Apakah sesi ini berisi lebih dari satu tugas yang tidak berhubungan',
        'Apakah agent punya cara memeriksa hasilnya sendiri di tugas ini',
        'Apakah aku sudah menyebutkan batas berkas dan batas jenis perubahan',
        'Apakah aku menyebutkan alasan di balik larangan yang aku berikan',
        'Apakah yang kurang sebenarnya bahan, bukan kejelasan instruksi',
        'Apakah pekerjaan ini terlalu besar untuk satu sesi dan perlu dipecah',
      ),
      p(
        'Butir terakhir adalah yang paling sering menjadi jawabannya pada pekerjaan besar. Sebuah tugas yang menyentuh dua puluh berkas dan menuntut tiga keputusan desain bukan tugas yang gagal karena prompt-nya kurang baik, melainkan tugas yang seharusnya menjadi empat tugas.',
      ),

      h2('Menutup Bab 3'),
      p(
        'Delapan sub-bab, dan semuanya bermuara pada tiga hal. Jaga context window karena ia sumber daya yang menentukan. Pisahkan menelusuri dari mengerjakan supaya kesalahpahaman ketahuan saat masih murah. Sediakan pemeriksaan supaya selesai berarti lulus dan bukan berarti terlihat beres.',
      ),
      p(
        'Bab 4 memindahkan ketiganya ke Codex, membahas `AGENTS.md` yang dibaca banyak alat sekaligus, membahas model izin dan sandbox yang menjadi lapisan penegakan sebenarnya, lalu menutup dengan perbandingan jujur dan satu praktik audit atas prompt-mu sendiri.',
      ),

      h2('Rangkuman'),
      ul(
        'Kegagalan yang berulang biasanya masalah proses, bukan masalah kepintaran model.',
        'Empat dari lima obatnya berupa mengurangi, yaitu membersihkan konteks, memangkas instruksi, atau membatasi cakupan.',
        'Ketika sebuah aturan terus dilanggar, menuliskannya lebih tegas sering memperparah penyebabnya.',
        'Periksa diff berkas test bersamaan dengan diff kode, karena di situ jalan pintas meninggalkan jejak.',
        'Penolakan tanpa alasan hanya berlaku untuk kasus yang kamu sebutkan.',
        'Sesi yang buntu pada pekerjaan besar biasanya menandakan pekerjaannya perlu dipecah.',
      ),

      references(
        {
          label: 'Avoid common failure patterns',
          href: 'https://code.claude.com/docs/en/best-practices',
          source: 'Anthropic',
          note: 'Sumber lima pola kegagalan beserta obat yang dianjurkan untuk masing-masing.',
        },
        {
          label: 'Overeagerness',
          href: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
          source: 'Anthropic',
          note: 'Bentuk instruksi lengkap untuk meredam penambahan yang tidak diminta.',
        },
        {
          label: 'Troubleshoot memory issues',
          href: 'https://code.claude.com/docs/en/memory',
          source: 'Anthropic',
          note: 'Cara menelusuri kenapa sebuah instruksi di berkas project tidak diikuti.',
        },
      ),
    ],
  ),
];
