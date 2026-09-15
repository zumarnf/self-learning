import { defineCategory, defineChapter, q } from '@/lib/curriculum/authoring';
import { lessons as lessonsClaudeCode } from './prompt-engineering/claude-code/lessons';
import { lessons as lessonsCodex } from './prompt-engineering/codex/lessons';
import { lessons as lessonsFondasi } from './prompt-engineering/fondasi/lessons';
import { lessons as lessonsTeknikLanjutan } from './prompt-engineering/teknik-lanjutan/lessons';

/**
 * Prompt Engineering — 4 chapters, 30 lessons.
 *
 * Placed last (order 9) because almost every concrete example in it refers to something the
 * reader has already built: a React refactor, a security review, a migration, a deploy pipeline.
 * Put first, those examples would be names without meaning.
 *
 * Moved from order 8 to 9 when Architecture Design was added, since that category belongs
 * immediately after System Design — the two are one continuous argument about shape and load,
 * and slotting an unrelated category between them would break the cross-references.
 *
 * Chapters 1 and 2 are vendor-neutral on purpose. Feature names move faster than the reasons
 * behind them, so the transferable half is taught first and the tool-specific half is always
 * introduced by the problem it solves rather than by its label.
 */

const fondasi = defineChapter({
  slug: 'fondasi-prompt',
  number: 1,
  title: 'Fondasi Prompt Engineering',
  summary:
    'Cara model membaca permintaanmu, dan enam teknik yang menyelamatkan lebih banyak prompt daripada teknik lain mana pun.',
  objectives: [
    'Menjelaskan kenapa sebuah prompt gagal, dan mengenali kapan masalahnya bukan di prompt',
    'Menyusun prompt yang menjawab hasil, batas, batasan, dan cara verifikasi',
    'Memakai contoh, tag XML, dan peran pada tempat yang memang membutuhkannya',
    'Menetapkan kriteria sukses yang bisa dinilai orang lain tanpa bertanya kepadamu',
  ],
  prerequisites: [],
  stackVersions: [
    'Anthropic Prompting Best Practices',
    'OpenAI Prompt Engineering Guide',
    'Ditinjau 2026-09-15',
  ],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, mesin ini sendiri):
  //   - parsing keluaran model dengan zod terhadap 8 bentuk keluaran yang lazim:
  //     1/8 lolos JSON.parse mentah, 3/8 lolos sesudah blok JSON diekstrak; 5 sisanya
  //     gagal karena isinya, bukan karena pembungkusnya
  //   - harness eval sederhana, 5 keluaran tetap dinilai 6 penilai berbasis pola:
  //     6/6, 5/6, 4/6, 3/6, 3/6
  //   - ukuran berkas instruksi project ini dihitung: CLAUDE.md 1.803 token,
  //     9 berkas rules 33.130 token, total 34.933 token per sesi
  //
  // YANG SENGAJA TIDAK DILAKUKAN:
  //   - TIDAK ada satu pun pemanggilan API model. CLI `claude` memang ada di mesin ini
  //     dan satu variabel kunci API terbaca, tetapi memanggilnya berbiaya bagi user dan
  //     tidak diminta. Seluruh angka di bab ini berasal dari pengukuran lokal, dan tiap
  //     sub-bab menyatakan batas itu di dalam teksnya sendiri.
  reviewedAt: '2026-09-15',
  lessons: lessonsFondasi,
  quiz: [
    q(
      'pe1-q1',
      'Kenapa menambahkan alasan di balik sebuah aturan sering lebih efektif daripada menambah beberapa varian aturannya?',
      [
        'Karena kalimat yang lebih panjang lebih diperhatikan model',
        'Karena alasan memberi dasar untuk menyimpulkan sendiri pada kasus mirip yang tidak kamu sebutkan',
        'Karena aturan tanpa alasan selalu diabaikan',
        'Karena model memeriksa kebenaran alasannya lebih dulu',
      ],
      1,
      'Aturan tanpa alasan berlaku persis pada kasus yang kamu tulis. Aturan beserta alasannya menutup juga kasus mirip yang tidak sempat kamu sebutkan, dengan jumlah kata yang hampir sama.',
    ),
    q(
      'pe1-q2',
      'Sebuah percakapan sudah berjalan sepuluh giliran dan model mulai mengabaikan instruksi yang kamu berikan di pesan pertama. Apa penjelasan yang paling tepat?',
      [
        'Model melupakan instruksi lama karena ingatannya terbatas',
        'Instruksi itu masih terkirim, tetapi sekarang berada jauh di atas dan dikelilingi banyak teks yang lebih segar',
        'Instruksi di pesan pertama memang hanya berlaku satu giliran',
        'Model sengaja mengabaikan instruksi yang sudah lama',
      ],
      1,
      'Model bersifat stateless dan seluruh riwayat dikirim ulang tiap giliran. Aturan yang harus berlaku terus tempatnya di system prompt atau di berkas instruksi project, bukan di pesan pertama percakapan.',
    ),
    q(
      'pe1-q3',
      'Kamu memberi tiga contoh few-shot dan ketiganya berupa masukan yang rapi. Apa risiko yang paling mungkin?',
      [
        'Model akan menolak masukan yang rapi',
        'Model menyimpulkan bahwa masukan tak rapi tidak pernah terjadi, lalu memaksa mengarang jawaban untuknya',
        'Tiga contoh selalu terlalu sedikit',
        'Contoh yang rapi membuat keluarannya menjadi lebih panjang',
      ],
      1,
      'Contoh mengajarkan pola, termasuk pola yang tidak kamu maksudkan. Tanpa contoh berupa masukan yang harus ditolak, model belajar bahwa setiap masukan selalu menghasilkan jawaban.',
    ),
    q(
      'pe1-q4',
      'Kamu mengubah lima bagian prompt sekaligus lalu hasilnya membaik. Apa yang hilang dari cara itu?',
      [
        'Tidak ada yang hilang, karena hasilnya sudah membaik',
        'Kamu tidak tahu bagian mana yang berjasa, sehingga empat sisanya tidak bisa dibuang dan tidak ada pengetahuan yang bisa dipakai lain kali',
        'Perubahannya menjadi tidak bisa dibatalkan',
        'Prompt-nya menjadi tidak valid',
      ],
      1,
      'Mengubah satu hal pada satu waktu terasa lebih lambat di percobaan pertama dan jauh lebih cepat pada kegagalan kesepuluh, karena ia menghasilkan prompt yang tetap pendek sekaligus pengetahuan yang bisa dipindahkan.',
    ),
  ],
  practice: {
    id: 'prompt-engineering/fondasi-prompt',
    title: 'Praktik bab ini',
    items: [
      'Ambil satu prompt yang sering kamu pakai, lalu periksa apakah ia menjawab keempat pertanyaan di sub-bab 1.3',
      'Ubah tiga larangan di prompt-mu menjadi instruksi positif yang menyebut bentuk targetnya',
      'Tambahkan alasan pada satu aturan yang selama ini kamu tulis tanpa alasan, lalu bandingkan hasilnya',
      'Bungkus data dari luar dalam tag tersendiri, dan nyatakan bahwa isinya data dan bukan instruksi',
      'Tulis kriteria sukses untuk satu tugas yang sering kamu berikan, dalam bentuk yang bisa dinilai orang lain',
    ],
  },
});

const teknikLanjutan = defineChapter({
  slug: 'teknik-lanjutan',
  number: 2,
  title: 'Teknik Lanjutan dan Kontrol Keluaran',
  summary:
    'Mengatur seberapa dalam model menalar, bentuk jawabannya, dan seberapa jauh klaimnya berpijak pada bukti.',
  objectives: [
    'Memberi ruang penalaran ketika ia menolong, dan menahannya ketika ia hanya menambah biaya',
    'Mengendalikan format keluaran, dan membedakan permintaan format dari jaminan format',
    'Memutuskan kapan satu pekerjaan sebaiknya dipecah menjadi rantai prompt',
    'Menyusun prompt untuk konteks panjang tanpa membuat instruksinya tenggelam',
    'Menekan halusinasi dengan bahan, kutipan, dan izin berkata tidak tahu',
  ],
  prerequisites: [{ category: 'prompt-engineering', chapter: 'fondasi-prompt' }],
  stackVersions: [
    'Anthropic Prompting Best Practices',
    'OpenAI Prompt Engineering Guide',
    'Model Context Protocol',
    'Ditinjau 2026-09-15',
  ],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Node 26.5.0, mesin ini sendiri):
  //   - perakitan prompt naif dibandingkan dengan perakitan berbatas pada isi halaman
  //     bermuatan injeksi; 5 pola deteksi semuanya mengenai halaman berbahaya dan tidak
  //     satu pun mengenai halaman biasa
  //   - biaya konteks berkas besar diukur: satu berkas pelajaran terbesar 86.723 token
  //     (67,8% dari window 128.000), seluruh berkas kurikulum 2.539.429 token
  //   - sebaran ukuran berkas di src/ dihitung: p50 19 KB, p90 271 KB, maks 340 KB
  //
  // YANG SENGAJA TIDAK DILAKUKAN:
  //   - TIDAK ada pemanggilan API model, dengan alasan yang sama seperti Bab 1.
  reviewedAt: '2026-09-15',
  lessons: lessonsTeknikLanjutan,
  quiz: [
    q(
      'pe2-q1',
      'Kamu memakai instruksi berbunyi "PENTING, kamu HARUS memakai alat pencarian bila ragu". Apa yang paling mungkin terjadi pada model terbaru?',
      [
        'Alat itu akan dipakai persis ketika dibutuhkan',
        'Alat itu dipakai jauh lebih sering daripada perlu, karena penekanan yang berlebihan memicu pemakaian bahkan saat tidak relevan',
        'Instruksi dengan huruf kapital diabaikan',
        'Model akan meminta izin sebelum memakainya',
      ],
      1,
      'Instruksi yang dulu ditulis untuk melawan pemakaian alat yang kurang sekarang bisa menyebabkan pemakaian berlebihan. Perbaikannya adalah mengganti aturan menyeluruh dengan aturan bersyarat yang menyebut kapan alat itu memang berguna.',
    ),
    q(
      'pe2-q2',
      'Kodemu akan mem-parsing jawaban model menjadi JSON. Mana yang benar-benar menjamin bentuknya?',
      [
        'Kalimat "balas dengan JSON saja, tanpa penjelasan"',
        'Keluaran terstruktur dengan skema, atau pemanggilan alat dengan parameter bertipe',
        'Menaikkan tingkat penalaran model',
        'Memberi contoh JSON di dalam prompt',
      ],
      1,
      'Instruksi teks adalah permintaan yang hampir selalu dituruti, dan hampir selalu bukan selalu. Skema mengikat bentuknya. Isinya tetap harus divalidasi di sisi kodemu, karena bentuk benar tidak berarti isi benar.',
    ),
    q(
      'pe2-q3',
      'Kamu mengirim empat puluh ribu token dokumen beserta pertanyaanmu. Di mana sebaiknya pertanyaan itu diletakkan?',
      [
        'Di awal, supaya model tahu apa yang dicari sebelum membaca',
        'Di akhir, sesudah seluruh dokumennya, karena instruksi yang dibaca terakhir paling dekat dengan momen menjawab',
        'Di tengah dokumen',
        'Diulang di awal dan di akhir',
      ],
      1,
      'Pengujian yang disebut dokumentasi Anthropic menunjukkan pertanyaan di akhir bisa menaikkan kualitas jawaban sampai sekitar tiga puluh persen pada masukan rumit bersumber banyak dokumen.',
    ),
    q(
      'pe2-q4',
      'Kenapa jawaban yang mengarang justru sering terdengar sangat meyakinkan?',
      [
        'Karena model sengaja menyusun kalimat yang persuasif',
        'Karena yang dioptimalkan model adalah kewajaran kelanjutan teks, sehingga isian untuk kekosongan pun terdengar wajar',
        'Karena jawaban panjang selalu terdengar meyakinkan',
        'Karena model tidak pernah tahu ia salah',
      ],
      1,
      'Model menyusun kelanjutan teks yang paling masuk akal. Ketika bahannya tidak ada, tidak ada mekanisme bawaan yang berhenti dan berkata tidak tahu, sehingga izin berkata tidak tahu harus diminta secara eksplisit.',
    ),
  ],
  practice: {
    id: 'prompt-engineering/teknik-lanjutan',
    title: 'Praktik bab ini',
    items: [
      'Minta satu jawaban dengan penalarannya dibungkus tag terpisah, lalu ambil hanya bagian hasilnya',
      'Ubah satu prompt besar yang mengerjakan lima hal menjadi rantai draf, tinjau, lalu perbaiki',
      'Susun ulang satu prompt berkonteks panjang menjadi bahan di atas dan pertanyaan di bawah',
      'Tambahkan permintaan kutipan berkas dan nomor baris pada satu prompt yang klaimnya sering meleset',
      'Ambil satu prompt panjang milikmu, buang satu bagian, lalu uji apakah hasilnya benar-benar berubah',
    ],
  },
});

const claudeCode = defineChapter({
  slug: 'claude-code',
  number: 3,
  title: 'Prompt Engineering untuk Claude Code',
  summary:
    'Apa yang berubah ketika jawabannya bisa mengubah isi disk, dan cara mengelola sesi yang panjang.',
  objectives: [
    'Mengelola context window sebagai sumber daya yang menentukan kualitas sesi',
    'Memisahkan menelusuri dari mengerjakan lewat alur explore, plan, code, commit',
    'Menulis berkas instruksi project yang dipatuhi, bukan yang membengkak lalu diabaikan',
    'Memilih di antara berkas instruksi, skill, subagent, dan hook untuk tiap kebutuhan',
    'Memberi agent cara memverifikasi kerjanya sehingga selesai berarti lulus',
  ],
  prerequisites: [
    { category: 'prompt-engineering', chapter: 'teknik-lanjutan' },
    { category: 'deployment', chapter: 'git-alur-rilis' },
  ],
  stackVersions: ['Claude Code Docs', 'Anthropic Prompting Best Practices', 'Ditinjau 2026-09-15'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (mesin ini sendiri, 4 inti, tanpa swap):
  //   - empat perintah pemeriksaan project ini diukur waktunya dan dibaca kode keluarnya:
  //     type-check 1.910 ms exit=0, format:check 3.914 ms exit=1, lint 7.031 ms exit=0,
  //     test 8.025 ms exit=0 (6 berkas, 101 test)
  //   - hook guard-hard-rules.py dipanggil langsung dengan dua payload uji: "git push
  //     origin main" menghasilkan permissionDecision "ask", sedangkan "ls -la" lewat
  //     tanpa keluaran
  //   - lima skrip audit dijalankan: audit-parity, audit-routing (419/422 = 99,3% top-1),
  //     audit-coverage, audit-enforcement (33 gerbang, 24 mesin, 9 LAPIS-1), selftest
  //     (13/13)
  //   - ukuran 65 skill dihitung: 196.766 token bila seluruh isinya dimuat melawan
  //     9.572 token deskripsi yang benar-benar dimuat
  //   - kesalahan sintaks template literal direproduksi dengan tsc: satu kesalahan
  //     menghasilkan 6 error, dan yang terakhir menunjuk baris kosong
  //
  // SATU HASIL YANG SENGAJA DILAPORKAN:
  //   - `npm run format:check` keluar dengan kode 1 pada src/test/sidebar-nav.test.tsx,
  //     berkas yang terakhir diubah pada commit 2264a0a dan TIDAK disentuh pekerjaan ini.
  //     Temuan itu tidak diperbaiki diam-diam; ia dipakai sebagai contoh nyata bahwa
  //     pemeriksaan yang tidak pernah dijalankan bukan pemeriksaan. Belakangan, atas
  //     persetujuan pemilik project, berkas itu diformat sebagai perubahan TERPISAH, dan
  //     setiap sub-bab yang mengutip exit=1 diberi catatan lanjutan supaya pembaca yang
  //     menjalankan perintahnya hari ini tidak menyimpulkan materinya keliru.
  //
  // YANG SENGAJA TIDAK DILAKUKAN:
  //   - TIDAK ada pemanggilan API model. Perilaku model sebagai agent dijelaskan mengikuti
  //     dokumentasi resminya dan ditandai sebagai tidak diukur.
  reviewedAt: '2026-09-15',
  lessons: lessonsClaudeCode,
  quiz: [
    q(
      'pe3-q1',
      'Apa yang menentukan kapan sebuah agent berhenti bekerja, dan kenapa itu penting?',
      [
        'Batas waktu yang ditetapkan sistem, jadi kamu hanya perlu menunggu',
        'Model sendiri, ketika hasilnya terlihat selesai, sehingga tanpa pemeriksaan yang bisa ia jalankan kamu menjadi satu-satunya pemeriksa',
        'Jumlah berkas yang sudah diubah',
        'Habisnya context window',
      ],
      1,
      'Karena titik berhenti ditentukan model, menyediakan pemeriksaan yang menghasilkan lulus atau gagal adalah satu perubahan yang mengubah arti kata selesai dari terlihat beres menjadi terbukti benar.',
    ),
    q(
      'pe3-q2',
      'Kamu sudah dua kali mengoreksi hal yang sama dan hasilnya masih meleset. Apa langkah yang paling tepat?',
      [
        'Koreksi sekali lagi dengan kalimat yang lebih tegas',
        'Mulai sesi bersih dengan prompt yang sudah memuat apa yang kamu pelajari dari dua kegagalan itu',
        'Tambahkan seluruh berkas terkait supaya konteksnya lebih lengkap',
        'Naikkan tingkat penalaran modelnya',
      ],
      1,
      'Tiap koreksi yang gagal menambah satu pendekatan keliru ke dalam konteks, lengkap dengan alasan yang terdengar masuk akal, dan semuanya ikut terkirim tiap giliran. Yang dibutuhkan adalah membuang konteksnya, bukan menambahnya.',
    ),
    q(
      'pe3-q3',
      'Sebuah aturan jelas tertulis di berkas instruksi project tetapi terus dilanggar. Apa penyebab yang paling mungkin?',
      [
        'Berkasnya tidak terbaca sama sekali',
        'Berkasnya terlalu panjang, sehingga aturan itu tidak menonjol di antara puluhan aturan lain',
        'Aturannya perlu ditulis dengan huruf kapital',
        'Berkas instruksi project tidak berpengaruh pada perilaku',
      ],
      1,
      'Berkas yang membengkak membuat instruksi yang benar-benar penting tenggelam. Perbaikannya adalah memangkas, dan untuk aturan yang tidak boleh dilanggar sama sekali, mengubahnya menjadi penegakan lewat hook atau izin.',
    ),
    q(
      'pe3-q4',
      'Apa yang membedakan hook dari instruksi di berkas project?',
      [
        'Hook ditulis dalam bahasa yang berbeda',
        'Hook dijalankan sistem pada titik tertentu terlepas dari keputusan model, sedangkan instruksi hanya mengarahkan',
        'Hook hanya berjalan di lingkungan cloud',
        'Hook menggantikan kebutuhan menulis berkas instruksi',
      ],
      1,
      'Instruksi bernilai dan hampir selalu dituruti, tetapi ia bukan jaminan. Untuk hal yang harus terjadi setiap kali tanpa pengecualian, penegakannya harus berada di lapisan yang tidak bergantung pada apa yang diputuskan model.',
    ),
  ],
  practice: {
    id: 'prompt-engineering/claude-code',
    title: 'Praktik bab ini',
    items: [
      'Jalankan satu pekerjaan dengan alur telusur, rencana, kerjakan, lalu commit sebagai empat prompt terpisah',
      'Tambahkan satu instruksi yang meminta keluaran perintah panjang disaring lebih dulu, lalu rasakan bedanya pada sesi panjang',
      'Buka berkas instruksi project-mu, lalu jalankan pertanyaan penyaring pada tiap barisnya dan buang yang tidak lolos',
      'Pindahkan satu prosedur bernomor dari berkas instruksi menjadi skill tersendiri',
      'Serahkan satu penelusuran ke subagent dengan cakupan dan bentuk laporan yang kamu batasi',
      'Tambahkan cara memverifikasi ke dalam satu prompt yang selama ini kamu tulis tanpa itu',
    ],
  },
});

const codex = defineChapter({
  slug: 'codex-lintas-tool',
  number: 4,
  title: 'Codex dan Praktik Lintas Tool',
  summary:
    'Agent kedua, berkas instruksi yang dibaca banyak alat, lapisan izin yang benar-benar menegakkan, dan audit penutup.',
  objectives: [
    'Menjalankan Codex di permukaan yang tepat untuk bentuk pekerjaanmu',
    'Menyatukan AGENTS.md dan CLAUDE.md tanpa menciptakan dua sumber kebenaran',
    'Membedakan sandbox dari kebijakan persetujuan, dan memilih pengaturan yang sepadan risikonya',
    'Menyambungkan alat luar lewat MCP tanpa melanggar aturan keamanan yang sudah berlaku',
    'Menilai dan memilih alat berdasarkan kriteria tertulis, bukan kesan percobaan pertama',
  ],
  prerequisites: [
    { category: 'prompt-engineering', chapter: 'claude-code' },
    { category: 'keamanan-fullstack', chapter: 'identitas-kewenangan' },
  ],
  stackVersions: ['Codex Docs', 'AGENTS.md', 'Model Context Protocol', 'Ditinjau 2026-09-15'],
  // Yang BENAR-BENAR dieksekusi untuk bab ini (Docker 29.8.0, curl 8.5.0, mesin ini):
  //   - perilaku sandbox diuji dengan container, bukan dijelaskan dari ingatan:
  //     --network none membuat wget exit=1 sementara tanpa flag itu exit=0;
  //     --read-only menolak penulisan; --read-only --tmpfs /tmp membolehkannya;
  //     bind mount :ro membolehkan baca dan menolak tulis
  //   - biaya isi dari alat luar diukur dengan mengambil satu halaman dokumentasi publik:
  //     HTTP 200, 255.418 byte, ~63.836 token sebagai HTML mentah melawan ~20.307 token
  //     sesudah tag dibuang
  //   - audit-context-budget.py dan audit-obedience.py dijalankan; yang kedua melaporkan
  //     9 sesi dan 180 giliran dengan angka pelanggaran nyata, beserta pernyataan batas
  //     ukurnya sendiri yang ikut dikutip di materi
  //   - ketiadaan AGENTS.md dan .agents/ di repositori ini diperiksa dan dipakai sebagai
  //     contoh, bukan disamarkan
  //
  // YANG SENGAJA TIDAK DILAKUKAN:
  //   - Codex TIDAK dijalankan; `command -v codex` tidak menemukannya di mesin ini, dan
  //     tidak ada pemanggilan API model. Karena itu bab ini tidak mengklaim perbandingan
  //     mutu keluaran antar alat. Yang dibandingkan hanya mekanisme yang bisa diuji lokal.
  reviewedAt: '2026-09-15',
  lessons: lessonsCodex,
  quiz: [
    q(
      'pe4-q1',
      'Apa beda sandbox dari kebijakan persetujuan?',
      [
        'Keduanya nama berbeda untuk hal yang sama',
        'Sandbox menentukan apa yang secara teknis bisa dilakukan, sedangkan kebijakan persetujuan menentukan kapan agent harus berhenti dan bertanya',
        'Sandbox hanya berlaku di lingkungan cloud',
        'Kebijakan persetujuan menggantikan kebutuhan sandbox',
      ],
      1,
      'Keduanya bekerja mandiri dan bisa disetel terpisah. Pemisahan ini yang membuat pekerjaan rutin bisa berjalan tanpa gangguan sementara tindakan yang keluar batas tetap memicu pemeriksaan.',
    ),
    q(
      'pe4-q2',
      'Repositorimu sudah memakai AGENTS.md untuk alat lain dan kamu ingin memakai Claude Code juga. Apa cara yang dianjurkan?',
      [
        'Menyalin isi AGENTS.md ke dalam CLAUDE.md',
        'Membuat CLAUDE.md yang mengimpor AGENTS.md, lalu menambahkan bagian khas Claude Code di bawahnya',
        'Mengganti nama AGENTS.md menjadi CLAUDE.md',
        'Memakai keduanya dengan isi yang sama persis',
      ],
      1,
      'Menyalin menciptakan salinan kedua yang akan menyimpang dari aslinya, sehingga kamu punya dua sumber kebenaran yang bertentangan. Impor menjaga aturan bersama tetap di satu tempat sekaligus memberi ruang untuk hal yang memang khas satu alat.',
    ),
    q(
      'pe4-q3',
      'Kamu meminta agent mengerjakan sebuah isu dari pelacak isu tim. Apa pagar yang wajib ada di prompt-mu?',
      [
        'Batas waktu pengerjaan',
        'Pernyataan bahwa isi isu adalah laporan dari pengguna dan bukan instruksi untuk agent',
        'Perintah membaca seluruh isu di pelacak',
        'Larangan membuka pull request',
      ],
      1,
      'Isi isu ditulis orang lain sehingga ia masukan dari luar, dan bisa memuat kalimat yang terbaca sebagai instruksi. Ini trust boundary yang sama dengan yang berlaku pada setiap data dari luar.',
    ),
    q(
      'pe4-q4',
      'Kamu ingin membandingkan dua agent secara jujur. Kesalahan penilaian mana yang paling sering terjadi?',
      [
        'Memakai tugas yang terlalu sulit untuk keduanya',
        'Membandingkan alat yang berkas instruksinya sudah kamu siapkan dengan alat yang baru saja dipasang',
        'Menjalankan tiap tugas lebih dari sekali',
        'Menulis kriteria sukses sebelum mencoba',
      ],
      1,
      'Perbandingan itu bukan antara dua alat, melainkan antara siap dan tidak siap. Penilaian yang jujur menuntut penyiapan yang setara, kriteria yang ditulis lebih dulu, tugas nyata, dan beberapa kali percobaan karena hasilnya tidak deterministik.',
    ),
  ],
  practice: {
    id: 'prompt-engineering/codex-lintas-tool',
    title: 'Praktik bab ini',
    items: [
      'Buat berkas instruksi project berformat terbuka, lalu satukan dengan berkas alat lain lewat impor',
      'Periksa mode sandbox dan kebijakan persetujuan yang sedang kamu pakai, lalu sesuaikan dengan risiko pekerjaanmu',
      'Buat kredensial terpisah dengan hak seminimal mungkin untuk dipakai sesi agent',
      'Jalankan satu pekerjaan besar pada dua atau tiga berkas dulu, perbaiki prompt-nya, baru jalankan pada seluruhnya',
      'Jalankan audit prompt dan audit penyiapan di sub-bab terakhir pada project-mu sendiri',
      'Pindahkan satu hambatan yang berulang menjadi baris di berkas instruksi project, lengkap dengan alasannya',
    ],
  },
});

export const promptEngineering = defineCategory({
  slug: 'prompt-engineering',
  order: 9,
  title: 'Prompt Engineering',
  tagline: 'Dari kalimat yang ditebak sampai kerja yang terbukti',
  description:
    'Bekerja bersama model bahasa dan coding agent sebagai keterampilan, bukan keberuntungan. Dimulai dari teknik yang berlaku untuk model mana pun, lalu diikat ke dua alat yang kemungkinan besar ada di editormu, yaitu Claude Code dan Codex, dan ditutup dengan audit atas prompt serta penyiapanmu sendiri.',
  chapters: [fondasi, teknikLanjutan, claudeCode, codex],
});
