import { callout, code, compare, h2, ol, p, table, ul } from '@/lib/content/builders';
import { type LessonDraft, written } from '@/lib/curriculum/authoring';

/**
 * Deployment — Chapter 2, all five lessons.
 *
 * Git as a release discipline, not as a command reference. The reader has used git by now; what is
 * missing is the judgment around it — what belongs in one commit, what a message is for, and what
 * a review is actually looking at.
 */
export const lessons: LessonDraft[] = [
  written(
    'git-dasar',
    'Git Dasar yang Wajib',
    12,
    'Perintah yang dipakai tiap hari, dan yang bisa menghilangkan pekerjaan.',
    [
      h2('Alur harian'),
      code(
        'bash',
        `
        git status                       # SELALU sebelum melakukan apa pun
        git diff                         # yang belum di-stage
        git diff --staged                # yang akan ikut commit

        git add src/fitur.ts             # per berkas, BUKAN 'git add .'
        git commit -m "..."

        git log --oneline -10
        git log -p src/fitur.ts          # riwayat satu berkas
        `,
      ),
      p(
        'Komentar pada baris pertama menyatakan kebiasaan yang paling menghemat penyesalan: `git status` **sebelum melakukan apa pun**. Beberapa perintah git membuang pekerjaan yang belum di-commit secara permanen, dan satu-satunya yang berdiri di antaranya adalah kebiasaan melihat dulu apa yang ada.',
      ),
      p(
        'Dua bentuk `git diff` menunjukkan **tahap yang berbeda**. Tanpa argumen, ia memperlihatkan perubahan yang belum di-stage; dengan `--staged`, yang **akan ikut commit**. Keduanya perlu karena keduanya bisa berbeda — dan yang menentukan isi commit adalah yang kedua.',
      ),
      p(
        'Komentar `per berkas, BUKAN git add .` menandai aturan yang alasannya ada di peringatan berikut: `git add .` menyapu apa pun yang kebetulan ada di direktori, termasuk `.env` yang baru dibuat, dump database, atau berkas percobaan. Menyebut berkasnya satu per satu memaksamu melihat apa yang masuk — dan itu satu-satunya penjagaan yang bekerja sebelum rahasianya terlanjur masuk riwayat.',
      ),
      callout(
        'warning',
        'Hindari `git add .` dan `git add -A`',
        'Keduanya menyapu apa pun yang kebetulan ada di direktori — berkas `.env` yang baru dibuat, dump database, kunci pribadi, atau berkas percobaan. Menambahkan per berkas memaksamu melihat apa yang masuk. Dan setelah staging, **selalu** jalankan `git status` sekali lagi sebelum commit.',
      ),

      h2('Memeriksa sebelum commit'),
      code(
        'bash',
        `
        git status                       # apa yang akan ikut?
        git diff --staged                # baca diffnya

        # Cari yang tidak seharusnya ada
        git diff --staged --name-only | grep -iE "\\.env|\\.pem$|\\.key$|dump\\.sql"
        `,
      ),
      p(
        'Baris `grep` di akhir adalah pemeriksaan sepuluh detik yang menutup kelas kesalahan yang tidak bisa dibatalkan. `--name-only` mencetak **daftar nama berkas** yang akan ikut commit, dan pola di belakangnya menangkap empat jenis yang paling sering tidak sengaja masuk: berkas environment, sertifikat, kunci pribadi, dan dump database.',
      ),
      p(
        'Perhatikan ini pemeriksaan yang **berhasil kalau tidak menemukan apa pun** — keluaran kosong berarti aman. Dan ingat konsekuensi kalau ia menemukan sesuatu setelah terlanjur di-push: rahasia yang pernah masuk git ada di setiap clone dan fork, jadi menghapus commit-nya tidak menutup kebocoran. Yang tersisa hanya rotasi.',
      ),

      h2('Membatalkan — dari yang paling aman'),
      table(
        ['Situasi', 'Perintah', 'Berbahaya?'],
        [
          ['Batalkan stage', '`git restore --staged <berkas>`', 'Tidak'],
          ['Ubah pesan commit terakhir', '`git commit --amend`', 'Kalau sudah di-push'],
          ['Batalkan commit, simpan perubahan', '`git reset --soft HEAD~1`', 'Tidak'],
          ['Batalkan commit, kembalikan ke unstaged', '`git reset HEAD~1`', 'Tidak'],
          [
            '**Buang perubahan di berkas**',
            '`git restore <berkas>`',
            '**Ya — tidak bisa dibatalkan**',
          ],
          ['**Buang commit dan perubahannya**', '`git reset --hard HEAD~1`', '**Ya**'],
          ['Batalkan commit yang sudah di-push', '`git revert <sha>`', 'Tidak — ini yang benar'],
        ],
      ),
      callout(
        'danger',
        'Tiga perintah yang bisa menghilangkan pekerjaan permanen',
        '`git restore <berkas>`, `git reset --hard`, dan `git clean -fd` membuang perubahan yang **belum pernah di-commit** — dan git tidak menyimpan salinannya. Jalankan `git status` dulu, setiap kali. Kalau ragu, `git stash` lebih dulu: ia menyimpan, bukan membuang.',
      ),

      h2('`revert`, bukan `reset`, untuk yang sudah di-push'),
      code(
        'bash',
        `
        # BENAR — membuat commit baru yang membatalkan efeknya.
        # Riwayat orang lain tidak terganggu.
        git revert a1b2c3d

        # BERBAHAYA di branch bersama — menulis ulang riwayat.
        git reset --hard a1b2c3d
        git push --force
        `,
      ),
      p(
        'Perbedaan mendasarnya: `revert` **menambah** commit baru yang membatalkan efek commit lama, sedangkan `reset --hard` **menghapus** commit itu dari riwayat. Untuk commit yang sudah di-push, hanya yang pertama yang benar — karena riwayat yang sudah dimiliki orang lain tidak bisa kamu tarik kembali.',
      ),
      p(
        'Apa yang sebenarnya terjadi setelah force-push layak dibayangkan. Setiap orang yang sudah menarik commit itu kini punya riwayat yang bercabang dari remote. Cara "memperbaikinya" yang paling umum dicari orang, yaitu reset ke remote, justru **membuang pekerjaan lokal mereka** yang belum di-push. Satu force-push bisa menghapus pekerjaan setengah hari milik beberapa orang sekaligus.',
      ),
      p(
        'Kalau force-push benar-benar terpaksa, pakai `--force-with-lease` alih-alih `--force`. Bedanya: ia **menolak** kalau ada orang lain yang mendorong sesudah kamu terakhir menarik — sehingga kamu tidak menimpa pekerjaan yang belum sempat kamu lihat. Itu tetap berbahaya, hanya tidak buta.',
      ),
      callout(
        'danger',
        'Jangan pernah force-push ke branch bersama',
        'Setiap orang yang sudah menarik commit itu akan mengalami riwayat yang bercabang, dan cara "memperbaikinya" yang paling umum, yaitu reset ke remote, justru membuang pekerjaan lokal mereka. Kalau benar-benar terpaksa, pakai `--force-with-lease`, yang menolak kalau ada yang mendorong sesudahmu.',
      ),

      h2('`stash`'),
      code(
        'bash',
        `
        git stash push -m "eksperimen filter"
        git stash list
        git stash pop                    # ambil dan hapus dari stash
        git stash apply stash@{1}        # ambil tanpa menghapus

        git stash -u                     # sertakan berkas baru yang belum dilacak
        `,
      ),
      p(
        '`stash` **menyimpan** alih-alih membuang, dan itulah yang membuatnya jawaban yang tepat saat kamu ragu. Alih-alih `git restore` yang menghapus permanen, simpan dulu, sebab kalau ternyata perubahan itu masih dibutuhkan ia masih ada. Pesan lewat `-m` membuatnya bisa dikenali nanti, karena tanpa itu daftar stash berisi baris-baris yang semuanya terlihat sama.',
      ),
      p(
        'Beda `pop` dan `apply` adalah apakah stash-nya ikut terhapus. `pop` mengambil lalu **membuang** entrinya — praktis, tetapi kalau penerapannya bentrok dan kamu salah menyelesaikannya, tidak ada salinan yang tersisa. `apply` menyimpan entrinya, jadi ia lebih aman untuk perubahan yang penting.',
      ),
      p(
        'Opsi `-u` menutup jebakan yang sering mengejutkan: secara bawaan `stash` **tidak menyertakan berkas baru yang belum dilacak** git. Berkas yang baru kamu buat akan tetap tertinggal di direktori kerja — dan kalau kamu lalu berpindah branch dan menjalankan perintah yang membersihkan, berkas itu hilang tanpa pernah tersimpan di mana pun.',
      ),

      h2('Menemukan penyebab'),
      code(
        'bash',
        `
        # Siapa mengubah baris ini, dan di commit mana
        git blame -L 40,60 src/fitur.ts

        # Cari commit yang menyentuh sebuah string
        git log -S "hitungTotal" --oneline

        # Cari commit yang memperkenalkan bug, secara biner
        git bisect start
        git bisect bad                   # commit sekarang rusak
        git bisect good v1.2.0           # versi ini masih baik
        # git akan menawarkan commit di tengah; uji, lalu:
        git bisect good   # atau  git bisect bad
        git bisect reset
        `,
      ),
      p(
        'Ketiga perintah menjawab pertanyaan yang berbeda. `git blame -L 40,60` menjawab **siapa dan kapan** untuk baris tertentu — berguna saat kamu menemukan kode yang tidak jelas maksudnya dan ingin membaca pesan commit-nya. `git log -S "hitungTotal"` menjawab **di commit mana** sebuah string muncul atau hilang; ia menyisir isi diff, bukan pesan commit, jadi ia menemukan perubahan yang pesannya tidak menyebutnya.',
      ),
      p(
        '`git bisect` menjawab pertanyaan yang paling sulit: **commit mana yang memperkenalkan bug ini**, ketika kamu tidak punya petunjuk sama sekali. Cara kerjanya pencarian biner — kamu menandai satu commit rusak dan satu yang masih baik, git menawarkan commit di tengah, kamu mengujinya dan menjawab `good` atau `bad`. Untuk seribu commit, itu hanya sekitar sepuluh pengujian.',
      ),
      p(
        '`git bisect reset` di baris terakhir wajib dijalankan setelah selesai, sebab tanpanya kamu tertinggal di commit tengah dengan HEAD yang terlepas. Dan perhatikan syarat yang membuat bisect berguna, yaitu setiap commit harus **bisa dijalankan**. Itu alasan praktis di balik aturan "satu commit satu perubahan logis", sebab commit raksasa yang menggabungkan sepuluh hal membuat bisect hanya bisa menunjuk ke gumpalan itu, bukan ke penyebabnya.',
      ),
      callout(
        'tip',
        '`git bisect` menemukan penyebab dalam hitungan menit',
        'Untuk 1.000 commit, ia hanya butuh sekitar 10 pengujian. Ia sangat efektif justru ketika kamu tidak punya petunjuk sama sekali — asalkan commit-commitmu kecil dan masing-masing bisa dijalankan. Ini alasan praktis kenapa "satu commit satu perubahan logis" berbayar.',
      ),

      h2('`.gitignore`'),
      code(
        'text',
        `
        node_modules/
        vendor/
        .next/
        dist/

        .env
        .env.local
        .env.*.local
        *.pem
        *.key

        *.log
        .DS_Store
        `,
      ),
      p(
        'Ketiga kelompok di dalamnya diabaikan karena alasan yang berbeda. Kelompok pertama, yaitu `node_modules/`, `vendor/`, `.next/`, dan `dist/`, adalah hal yang **bisa dibangun ulang** dari lockfile dan kode sumber, sehingga menyimpannya di git hanya membengkakkan repo tanpa menambah informasi. Kelompok kedua adalah **rahasia**, dan itu yang paling penting. Kelompok ketiga sekadar sampah lokal.',
      ),
      p(
        'Perhatikan pola `.env.*.local` menangkap varian seperti `.env.production.local` yang mudah terlewat kalau kamu hanya menulis `.env`. Perhatikan pula `.env.example` **tidak** ada di daftar — berkas itu memang harus ikut di-commit, berisi nama variabel dengan nilai kosong, supaya orang baru tahu apa yang harus diisi.',
      ),
      p(
        'Peringatan berikutnya menyebut batas yang sering mengejutkan, yaitu **`.gitignore` tidak berlaku surut**. Berkas yang sudah terlanjur terlacak tetap terlacak meski kemudian ditambahkan ke daftar, dan mengeluarkannya butuh `git rm --cached <berkas>`. Dan kalau berkas itu memuat rahasia, mengeluarkannya sekarang **tidak cukup**, sebab rahasianya sudah ada di riwayat dan harus dirotasi.',
      ),
      callout(
        'warning',
        '`.gitignore` tidak berlaku surut',
        'Berkas yang sudah terlacak tetap terlacak meski kemudian masuk `.gitignore`. Untuk mengeluarkannya: `git rm --cached <berkas>`. Dan kalau berkas itu memuat rahasia, mengeluarkannya **tidak cukup** — rahasianya sudah ada di riwayat, jadi harus dirotasi.',
      ),
    ],
  ),

  written(
    'strategi-branch',
    'Strategi Branch: trunk-based vs git flow',
    10,
    'Dua model, dan kenapa yang sederhana biasanya menang.',
    [
      h2('Trunk-based'),
      code(
        'text',
        `
        main  ──●──●──●──●──●──●──>
                 \\    /  \\    /
                  ●──●    ●──●        branch pendek, 1-2 hari
        `,
      ),
      p(
        'Bacalah diagram itu dari bentuk cabangnya, sebab setiap cabang **pendek dan cepat kembali** ke `main`. Itulah inti trunk-based, yang bukan berarti "tidak pakai branch" melainkan branch yang umurnya diukur dalam jam atau hari. Perhatikan `main` tetap lurus dan tidak pernah putus, sebab ia selalu dalam keadaan bisa di-deploy, dan itulah yang membuat rilis kapan saja menjadi mungkin.',
      ),
      ul(
        'Satu branch utama yang selalu bisa di-deploy.',
        'Branch fitur berumur pendek — jam atau hari, bukan minggu.',
        'Digabung lewat pull request setelah CI hijau.',
        'Fitur yang belum siap disembunyikan di balik **feature flag**, bukan ditahan di branch.',
      ),

      h2('Git flow'),
      code(
        'text',
        `
        main     ──●─────────────●──────>   hanya rilis
        develop  ──●──●──●──●──●─●──────>
                     \\        /
        feature       ●──●──●             bisa berumur minggu
        `,
      ),
      p(
        'Lebih banyak branch, lebih banyak penggabungan, dan konflik yang lebih besar karena cabangnya berumur panjang.',
      ),

      h2('Memilih'),
      table(
        ['Trunk-based cocok kalau', 'Git flow cocok kalau'],
        [
          ['Rilis sering — harian atau lebih', 'Rilis terjadwal dengan versi'],
          ['Tim kecil sampai menengah', 'Perlu mendukung beberapa versi sekaligus'],
          ['Ada CI yang bisa diandalkan', 'Ada masa QA formal'],
          ['Feature flag tersedia', 'Software yang dipasang pelanggan'],
        ],
      ),
      callout(
        'tip',
        'Untuk hampir semua aplikasi web, trunk-based lebih tepat',
        'Git flow dirancang untuk software yang dirilis berversi dan dipasang pengguna — bukan aplikasi web yang bisa di-deploy sepuluh kali sehari. Memakainya di aplikasi web menghasilkan branch berumur panjang, konflik besar, dan penggabungan yang menakutkan.',
      ),

      h2('Kenapa branch panjang mahal'),
      code(
        'text',
        `
        Branch 2 hari:   10 berkas berubah, konflik kecil, review 20 menit
        Branch 3 minggu: 80 berkas berubah, konflik besar, review ditunda terus
                         -> makin lama ditunda, makin besar, makin ditunda lagi
        `,
      ),
      p(
        'Biaya penggabungan tumbuh lebih cepat daripada ukuran perubahannya. Branch yang berumur tiga minggu bukan tiga kali lebih sulit daripada yang seminggu — ia jauh lebih sulit.',
      ),

      h2('Feature flag'),
      code(
        'ts',
        `
        // Kode masuk main, tapi belum aktif untuk pengguna.
        // Ini yang membuat branch pendek tetap mungkin untuk fitur besar.
        if (fitur.aktif('editor-baru', pengguna)) {
          return <EditorBaru />;
        }
        return <EditorLama />;
        `,
      ),
      p(
        'Komentar di atasnya menyelesaikan pertanyaan yang wajar muncul dari bagian sebelumnya: **bagaimana fitur besar bisa dikerjakan dengan branch pendek?** Jawabannya, kodenya tetap digabung ke `main` setiap hari — hanya belum aktif untuk pengguna. Fitur yang butuh tiga minggu tidak lagi berarti branch tiga minggu.',
      ),
      p(
        "Perhatikan `fitur.aktif('editor-baru', pengguna)` menerima **penggunanya**, bukan hanya nama flag. Itu yang memungkinkan peluncuran bertahap: nyalakan dulu untuk tim internal, lalu satu persen pengguna, lalu semuanya — dan matikan seketika kalau ada masalah, **tanpa deploy**. Kemampuan mematikan tanpa rilis itu sering lebih berharga daripada kemampuan menyalakannya bertahap.",
      ),
      p(
        'Harganya disebut di peringatan berikut, dan ia nyata: setiap flag **melipatgandakan jalur kode** yang harus diuji dan dipahami. Tiga flag berarti delapan kombinasi. Beri tanggal kedaluwarsa saat membuatnya, dan hapus flag beserta cabang matinya begitu fiturnya permanen — flag yang tertinggal setahun adalah kode mati yang menyamar sebagai konfigurasi.',
      ),
      callout(
        'warning',
        'Flag yang tidak pernah dibersihkan menjadi utang',
        'Setiap flag melipatgandakan jalur kode yang harus diuji dan dipahami. Beri tanggal kedaluwarsa saat membuatnya, dan hapus flag beserta cabang matinya begitu fiturnya permanen.',
      ),

      h2('Perlindungan branch'),
      code(
        'text',
        `
        Untuk main:
          - Wajib lewat pull request
          - Wajib CI hijau
          - Wajib minimal satu review (kalau ada tim)
          - Larang force push
          - Larang penghapusan branch
        `,
      ),
      p(
        'Lima aturan itu menutup lima cara `main` bisa rusak. "Wajib lewat pull request" mematikan `git push` langsung ke `main`, sehingga setiap perubahan punya tempat untuk dibaca sebelum masuk. "Wajib CI hijau" adalah yang paling berharga: ia mengubah tes dari sesuatu yang **boleh** dijalankan menjadi sesuatu yang **harus** lulus.',
      ),
      p(
        'Dua larangan terakhir menjaga **riwayat**. `force push` menulis ulang commit yang sudah ada — kalau ia mengenai `main`, salinan orang lain (dan salinan server deploy) tiba-tiba tidak cocok lagi, dan commit yang tertimpa hilang tanpa jejak. Larangan penghapusan branch mencegah `main` lenyap karena satu klik yang salah. Keduanya melarang hal yang jarang dilakukan, tapi ketika terjadi, akibatnya paling sulit dipulihkan.',
      ),
      callout(
        'tip',
        'Untuk project satu orang, ini tetap berguna',
        'Bukan untuk mencegah orang lain, tapi untuk mencegah dirimu sendiri mendorong sesuatu yang tesnya merah pada jam dua pagi. Perlindungan branch yang paling berharga adalah "CI harus hijau".',
      ),

      h2('Penamaan branch'),
      code(
        'bash',
        `
        feat/ekspor-csv
        fix/paginasi-lompat-halaman
        chore/upgrade-next-16
        docs/panduan-deploy
        `,
      ),
    ],
  ),

  written(
    'pesan-commit',
    'Pesan Commit yang Menjelaskan *Kenapa*',
    10,
    'Diff sudah menunjukkan apa yang berubah; pesannya untuk yang lain.',
    [
      p(
        'Pesan commit yang mengulang isi diff tidak menambah apa pun. Yang hilang dan mahal untuk direkonstruksi adalah **alasannya** — kenapa perubahan ini perlu, dan apa yang sudah dicoba sebelumnya.',
      ),

      compare(
        {
          title: 'Tidak berguna',
          lang: 'text',
          code: `
          update kode
          fix bug
          perbaikan
          asdf
          wip
          ubah controller.ts
          `,
          notes: ['Tidak menjawab apa pun yang tidak terlihat di diff'],
        },
        {
          title: 'Berguna',
          lang: 'text',
          code: `
          fix(api): batasi per_hal ke 100

          Tanpa batas atas, ?per_hal=999999 memuat
          seluruh tabel ke memori dan membuat proses
          mati OOM. Ditemukan saat audit keamanan.

          Batas ditegakkan di skema, bukan di
          controller, supaya berlaku untuk semua
          endpoint daftar.
          `,
          notes: ['Menjelaskan sebab, dampak, dan alasan pilihannya'],
        },
      ),
      p(
        'Enam baris di kolom kiri punya satu kesamaan, yaitu **semuanya bisa disimpulkan dari diff**. "Ubah controller.ts" mengulang informasi yang sudah ada di daftar berkas, sedangkan "fix bug" tidak menyebut bug yang mana. Pesan seperti itu bukan sekadar malas, sebab ia membuat `git log` tidak berguna sebagai alat penelusuran, dan `git bisect` yang tadi menemukan commit penyebab jadi berhenti di pesan yang tidak menjelaskan apa-apa.',
      ),
      p(
        'Kolom kanan menjawab tiga hal yang **tidak terlihat di diff**. Paragraf pertama menyebut **sebabnya**: apa yang rusak dan bagaimana ditemukan. Paragraf kedua menyebut **alasan pilihannya** — batas ditegakkan di skema, bukan di controller, supaya berlaku untuk semua endpoint. Itu keputusan yang enam bulan lagi akan dipertanyakan orang lain, dan pesan inilah yang menjawabnya.',
      ),
      p(
        'Perhatikan struktur tiga bagiannya: baris pertama ringkas, baris kosong, lalu penjelasan. Baris kosong itu bukan kosmetik — git memperlakukan baris pertama sebagai **judul** dan sisanya sebagai badan, dan banyak perkakas hanya menampilkan judulnya. Menulis paragraf panjang tanpa baris kosong membuat seluruhnya menjadi satu judul raksasa yang terpotong di mana-mana.',
      ),

      h2('Conventional Commits'),
      code(
        'text',
        `
        <tipe>(<cakupan>): <ringkasan>

        <isi — kenapa, bukan apa>

        <catatan kaki>
        `,
      ),
      p(
        'Conventional Commits menambahkan **awalan bertipe** pada judul, dan nilainya bukan kerapian melainkan bahwa ia **bisa dibaca mesin**. Dari awalan itu, perkakas bisa menghasilkan changelog otomatis dan menentukan kenaikan versi semver — `fix` menaikkan patch, `feat` menaikkan minor, dan catatan kaki `BREAKING CHANGE` menaikkan mayor. Itu yang dibahas di sub-bab terakhir bab ini.',
      ),
      p(
        'Bagian `(<cakupan>)` bersifat opsional tetapi sangat menolong saat repo-mu punya beberapa area. `fix(api)` dan `fix(ui)` langsung memberi tahu pembaca bagian mana yang tersentuh, tanpa perlu membuka diff-nya. Dan `<isi>` diberi keterangan **kenapa, bukan apa** — mengulang kembali aturan dari bagian sebelumnya, di tempat yang paling mudah dilupakan.',
      ),
      table(
        ['Tipe', 'Untuk'],
        [
          ['`feat`', 'Fitur baru'],
          ['`fix`', 'Perbaikan bug'],
          ['`refactor`', 'Perubahan struktur tanpa perubahan perilaku'],
          ['`perf`', 'Perbaikan performa'],
          ['`test`', 'Menambah atau memperbaiki tes'],
          ['`docs`', 'Dokumentasi'],
          ['`chore`', 'Perkakas, dependency, konfigurasi'],
          ['`ci`', 'Pipeline'],
        ],
      ),
      code(
        'text',
        `
        feat(auth)!: wajibkan MFA untuk akun admin

        BREAKING CHANGE: admin yang belum mengaktifkan MFA
        tidak bisa masuk sampai mendaftarkan perangkatnya.
        Migrasi memberi tenggang 14 hari lewat kolom
        mfa_wajib_sejak.
        `,
      ),
      p(
        'Tanda `!` dan catatan `BREAKING CHANGE` inilah yang dibaca alat penghasil changelog dan penentu versi otomatis.',
      ),

      h2('Apa yang layak ditulis di isi pesan'),
      ol(
        '**Kenapa** perubahan ini perlu — masalah apa yang ia selesaikan.',
        '**Apa yang sudah dicoba** dan tidak berhasil, kalau relevan.',
        '**Trade-off** yang diambil dan alternatif yang ditolak.',
        '**Akibat** yang tidak terlihat di diff — perubahan perilaku, kebutuhan migrasi.',
        '**Rujukan** ke isu atau diskusi, kalau ada.',
      ),

      h2('Satu commit, satu perubahan logis'),
      compare(
        {
          title: 'Dicampur',
          lang: 'text',
          code: `
          feat: tambah ekspor CSV

          - tambah endpoint ekspor
          - perbaiki bug paginasi
          - upgrade prisma
          - rapikan format 40 berkas
          `,
          notes: [
            'Tidak bisa di-revert sebagian',
            'Review jadi sangat sulit',
            '`bisect` kehilangan gunanya',
          ],
        },
        {
          title: 'Dipisah',
          lang: 'text',
          code: `
          chore(deps): upgrade prisma ke 6.2
          style: jalankan formatter
          fix(api): paginasi lompat halaman
          feat(ekspor): endpoint ekspor CSV
          `,
          notes: ['Tiap commit bisa di-revert sendiri', 'Review per potongan'],
        },
      ),
      p(
        'Kolom kiri terlihat rapi karena isinya berupa daftar berpoin, tetapi keempat butir itu adalah **empat perubahan logis yang berbeda** dalam satu commit. Akibat terbesarnya disebut di catatan: ia **tidak bisa di-revert sebagian**. Kalau endpoint ekspornya bermasalah dan harus ditarik, `git revert` akan ikut membatalkan perbaikan paginasi dan upgrade Prisma.',
      ),
      p(
        'Catatan kedua sama nyatanya: "review jadi sangat sulit". Reviewer yang membuka diff itu melihat empat puluh berkas berubah karena formatter, dan perubahan yang benar-benar penting tenggelam di antaranya. Ini persis alasan aturan "jangan campur perubahan nyata dengan reformat" ada.',
      ),
      p(
        'Kolom kanan memecahnya menjadi empat commit dengan urutan yang juga masuk akal, yaitu dependency dulu, lalu format, lalu perbaikan, baru fitur. Perhatikan urutan itu membuat setiap commit **bisa dijalankan sendiri**, dan itulah syarat yang membuat `git bisect` dari sub-bab 2.1 berguna. Saat bisect menunjuk `feat(ekspor)` sebagai penyebab, kamu tahu persis bagian mana yang bersalah, sedangkan dengan commit gabungan ia hanya menunjuk ke gumpalan.',
      ),
      callout(
        'tip',
        'Ini yang membuat `git bisect` dan `git revert` benar-benar berguna',
        'Commit yang mencampur perbaikan bug dengan reformat 40 berkas tidak bisa di-revert tanpa membawa serta yang lain. Dan saat `bisect` menunjuk commit itu sebagai penyebab, kamu tetap tidak tahu bagian mana yang bersalah.',
      ),

      h2('Menegakkannya'),
      code(
        'bash',
        `
        npm install --save-dev @commitlint/cli @commitlint/config-conventional
        echo "export default { extends: ['@commitlint/config-conventional'] };" > commitlint.config.js

        npx husky add .husky/commit-msg 'npx commitlint --edit $1'
        `,
      ),
      p(
        'Konvensi yang hanya tertulis di dokumen akan luntur dalam beberapa minggu; yang **ditegakkan mesin** bertahan. `commitlint` memeriksa format pesan, dan hook `commit-msg` menjalankannya tepat sebelum commit dibuat — sehingga pesan yang tidak sesuai ditolak saat itu juga, bukan ditemukan saat review.',
      ),
      p(
        'Perhatikan hook yang dipakai adalah `commit-msg`, bukan `pre-commit`. Keduanya berjalan di waktu yang berbeda: `pre-commit` sebelum pesan ditulis (tempat linter dan secret scanner), `commit-msg` sesudahnya, saat pesannya sudah ada untuk diperiksa. Argumen `$1` yang dioper adalah jalur berkas sementara berisi pesan itu.',
      ),
      p(
        'Batasnya sama seperti hook lain: ia bisa dilewati dengan `--no-verify`, dan tidak ada di mesin yang belum menjalankan `npm install`. Untuk penegakan yang sungguh-sungguh, pasangkan dengan pemeriksaan yang sama di CI — di sana tidak ada yang bisa melewatinya.',
      ),
      callout(
        'warning',
        'Jangan sertakan referensi ke asisten AI di pesan commit',
        'Ini aturan project ini, dan alasannya praktis: pesan commit dibaca untuk memahami **kenapa** perubahan dibuat, bukan **dengan alat apa** ia diketik. Referensi semacam itu tidak menambah informasi bagi pembaca berikutnya.',
      ),
    ],
  ),

  written(
    'pull-request',
    'Pull Request & Code Review',
    11,
    'Gerbang terakhir sebelum kode menjadi tanggung jawab semua orang.',
    [
      h2('PR yang bisa direview'),
      table(
        ['Ukuran', 'Kualitas review'],
        [
          ['< 200 baris', 'Menyeluruh — bug ketemu'],
          ['200–500 baris', 'Cukup baik'],
          ['500–1000 baris', 'Dangkal'],
          ['> 1000 baris', '"LGTM" tanpa dibaca'],
        ],
      ),
      callout(
        'tip',
        'PR besar tidak mendapat review, ia mendapat persetujuan',
        'Ini bukan soal kemalasan — kapasitas manusia untuk memeriksa perubahan memang menurun tajam setelah beberapa ratus baris. PR 2.000 baris secara efektif tidak direview sama sekali, dan justru PR seperti itu yang paling berisiko.',
      ),

      h2('Deskripsi PR'),
      code(
        'text',
        `
        ## Apa
        Menambahkan ekspor CSV untuk daftar artikel.

        ## Kenapa
        Pengguna meminta cara memindahkan data ke spreadsheet.
        Sebelumnya harus menyalin manual dari layar.

        ## Bagaimana
        Ekspor berjalan sebagai job antrean (202 + job id) karena
        pengguna dengan >10.000 artikel membuat permintaan sinkron
        timeout di 30 detik.

        ## Yang diuji
        - [x] Ekspor 10 baris
        - [x] Ekspor 50.000 baris (selesai 12 detik)
        - [x] Pengguna lain tidak bisa membaca job milik orang lain
        - [x] Klik dua kali tidak membuat dua job

        ## Risiko
        Berkas ekspor memuat email pengguna. Disimpan di S3 privat
        dengan URL bertanda tangan 5 menit, dan dihapus setelah 24 jam.

        ## Yang TIDAK termasuk
        Ekspor format Excel — menunggu kebutuhan nyata.
        `,
      ),
      p(
        'Bagian **Kenapa** dan **Bagaimana** menjawab dua hal berbeda, dan yang kedua sering lebih berharga. "Ekspor berjalan sebagai job antrean karena pengguna dengan >10.000 artikel membuat permintaan sinkron timeout di 30 detik" menjelaskan sebuah keputusan desain beserta **angka yang mendasarinya** — dan itu menghindarkan reviewer bertanya "kenapa tidak sinkron saja", sekaligus menjawab orang yang membacanya setahun lagi.',
      ),
      p(
        'Bagian **Yang diuji** mencantumkan angka nyata (50.000 baris, 12 detik) dan **dua tes larangan**: pengguna lain tidak bisa membaca job orang lain, dan klik dua kali tidak membuat dua job. Keduanya adalah jenis pemeriksaan yang paling sering tidak dilakukan, dan menuliskannya di sini berarti reviewer tidak perlu menebak apakah ia sudah dipikirkan.',
      ),
      p(
        'Bagian **Risiko** menyatakan terus terang bahwa berkas ekspor memuat email pengguna, **beserta mitigasinya**. Menyembunyikan hal seperti itu tidak membuatnya hilang; menuliskannya membuat reviewer bisa menilai apakah mitigasinya memadai. Dan **Yang TIDAK termasuk** menutup pertanyaan yang pasti muncul — tanpa bagian itu, review sering melebar menjadi diskusi tentang fitur yang memang sengaja ditunda.',
      ),

      h2('Yang dicari saat review'),
      ol(
        '**Kebenaran** — apakah ia menyelesaikan masalahnya, dan apakah kasus tepinya tertangani?',
        '**Keamanan** — otorisasi, validasi, kebocoran data, injeksi.',
        '**Tes** — apakah ada tes untuk jalur yang **tidak** bahagia, bukan hanya yang sukses?',
        '**Keterbacaan** — apakah pembaca berikutnya bisa memahaminya tanpa bertanya?',
        '**Cakupan** — apakah ada yang tidak berhubungan ikut masuk?',
      ),
      callout(
        'danger',
        'Prioritaskan keamanan dan tes negatif',
        'Bug fungsional biasanya ketahuan cepat karena ada yang memakainya. Bug otorisasi tidak — aplikasinya berjalan normal sampai seseorang melihat. Saat mereview, tanyakan secara khusus: bisakah pengguna lain menyentuh data ini?',
      ),

      h2('Menulis komentar review'),
      compare(
        {
          title: 'Tidak menolong',
          lang: 'text',
          code: `
          "ini jelek"
          "kenapa begini?"
          "salah"
          "seharusnya pakai X"
          `,
          notes: ['Tidak bisa ditindaklanjuti', 'Terasa menyerang'],
        },
        {
          title: 'Menolong',
          lang: 'text',
          code: `
          "Query ini tidak di-scope ke pemiliknya —
          pengguna lain bisa membaca artikel ini.
          Tambahkan .where('penulis_id', $user->id)?"

          "Nit: nama 'data' agak umum di sini.
          'artikelTerbit' lebih terbaca. Tidak
          memblokir."
          `,
          notes: ['Menyebut masalahnya, dampaknya, dan usulannya', 'Menandai mana yang memblokir'],
        },
      ),
      p(
        'Empat komentar di kolom kiri punya masalah yang sama, yaitu **tidak bisa ditindaklanjuti**. "Seharusnya pakai X" tidak menyebutkan kenapa, sehingga penulisnya harus menebak, dan kalau ia tidak setuju tidak ada yang bisa didiskusikan selain selera. "Ini jelek" menambahkan masalah kedua, sebab ia menilai orangnya alih-alih kodenya.',
      ),
      p(
        'Komentar pertama di kolom kanan punya tiga bagian yang membuatnya berguna: **masalahnya** (query tidak di-scope), **dampaknya** (pengguna lain bisa membaca artikel ini), dan **usulan konkret** berupa kode yang bisa langsung dipakai. Perhatikan ia diakhiri tanda tanya — bentuk usulan, bukan perintah, yang menyisakan ruang kalau ternyata ada alasan yang belum kamu ketahui.',
      ),
      p(
        'Komentar kedua memakai awalan `Nit:` dan ditutup "tidak memblokir". Dua kata itu menghemat banyak waktu: tanpanya, penulis harus menebak apakah pendapat soal penamaan variabel menghalangi merge. Biasakan menandainya — `nit:` untuk yang kecil, `pertanyaan:` untuk yang butuh penjelasan, `blocking:` untuk yang harus diperbaiki sebelum merge.',
      ),
      callout(
        'tip',
        'Tandai mana yang memblokir dan mana yang tidak',
        'Awalan seperti `nit:` (kecil), `pertanyaan:`, dan `blocking:` menghemat banyak waktu. Tanpa itu, penulis harus menebak apakah pendapat soal penamaan variabel menghalangi merge atau tidak.',
      ),

      h2('Self-review lebih dulu'),
      p(
        'Baca diff-mu sendiri di antarmuka PR sebelum meminta orang lain. Kamu akan menemukan: `console.log` yang tertinggal, berkas yang tidak sengaja ikut, komentar `TODO` tanpa konteks, dan kode yang tidak lagi terpakai. Semua itu tidak layak menghabiskan waktu reviewer.',
      ),

      h2('Untuk project satu orang'),
      callout(
        'info',
        'Review sendiri tetap berharga',
        'Membuka PR dan membaca diff-nya sehari kemudian menemukan hal yang tidak terlihat saat menulisnya. Untuk perubahan besar atau yang menyentuh keamanan, pertimbangkan juga review terbantu alat — yang penting adalah **melihat diff-nya sebagai satu kesatuan**, bukan sebagai rangkaian suntingan.',
      ),

      h2('Checklist otomatis'),
      code(
        'text',
        `
        # .github/pull_request_template.md
        ## Sebelum minta review
        - [ ] \`npm run check\` hijau
        - [ ] Ada tes untuk unhappy path, bukan hanya sukses
        - [ ] Endpoint baru punya pemeriksaan otorisasi
        - [ ] Tidak ada rahasia, \`console.log\`, atau berkas yang tidak sengaja ikut
        - [ ] Dokumentasi diperbarui kalau perilakunya berubah
        `,
      ),
      p(
        'Berkas `.github/pull_request_template.md` diisikan otomatis ke setiap PR baru di GitHub, sehingga checklist ini muncul tanpa perlu diingat. Nilainya bukan pada kotak centangnya, sebab tidak ada yang memaksamu mencentang jujur, melainkan pada **daftar pertanyaan yang selalu terlihat**. Lima baris itu adalah lima hal yang paling sering terlupa, dan membacanya sekali sebelum minta review sudah menyaring sebagian besar temuan sepele.',
      ),
      p(
        'Perhatikan baris pertama dan kedua bekerja berpasangan: `npm run check` hijau membuktikan tes yang **ada** lulus, sedangkan "ada tes untuk unhappy path" menanyakan apakah tesnya memeriksa hal yang benar. Suite yang hanya menguji jalur sukses tetap hijau meskipun otorisasinya bocor — itulah sebabnya baris ketiga tentang pemeriksaan otorisasi berdiri sendiri, bukan dianggap tercakup oleh CI.',
      ),
    ],
  ),

  written(
    'semver-changelog',
    'Semantic Versioning & Changelog',
    9,
    'Memberi nomor yang berarti, dan catatan yang dibaca orang.',
    [
      h2('Semantic Versioning'),
      code(
        'text',
        `
        MAJOR . MINOR . PATCH
          │       │       └── perbaikan bug, kompatibel
          │       └────────── fitur baru, kompatibel
          └────────────────── perubahan yang MEMUTUS
        `,
      ),
      p(
        'Tiga angka itu bukan penomoran berurutan biasa — masing-masing adalah **janji kepada pemakai**. `PATCH` berjanji "perbaruilah, tidak ada yang berubah selain bug hilang". `MINOR` berjanji "ada tambahan, kode lamamu tetap jalan". `MAJOR` justru sebaliknya: ia adalah peringatan bahwa **kode yang tadinya bekerja bisa berhenti bekerja**, sehingga pembaca tahu harus membaca changelog sebelum memperbarui.',
      ),
      p(
        'Karena itu penentuan angkanya tidak diukur dari seberapa besar usaha yang kamu keluarkan, melainkan dari **dampaknya ke pemakai**. Menulis ulang seluruh isi modul selama perilakunya persis sama tetap `PATCH`; mengganti satu nama field dalam respons adalah `MAJOR` meski hanya sebaris. Tabel berikut menerjemahkan aturan itu ke kasus yang sering muncul.',
      ),
      table(
        ['Perubahan', 'Naikkan'],
        [
          ['Perbaikan bug', 'PATCH — `1.2.3` → `1.2.4`'],
          ['Fitur baru yang aditif', 'MINOR — `1.2.3` → `1.3.0`'],
          ['Menghapus atau mengganti nama field', 'MAJOR — `1.2.3` → `2.0.0`'],
          ['Menambah aturan validasi baru', '**MAJOR**'],
          ['Mengubah status code untuk kasus yang sama', '**MAJOR**'],
        ],
      ),
      callout(
        'danger',
        'Menambah validasi baru adalah perubahan yang memutus',
        'Ini yang paling sering salah dinilai sebagai `PATCH`. Menjadikan field opsional jadi wajib, atau menurunkan batas panjang, akan menolak permintaan yang sebelumnya berhasil. Klien lama tidak berubah — tapi tiba-tiba mendapat `422`.',
      ),

      h2('Rentang versi di dependency'),
      code(
        'json',
        `
        {
          "dependencies": {
            "express": "^5.1.0",     // >=5.1.0 <6.0.0  — minor & patch
            "zod": "~4.1.0",         // >=4.1.0 <4.2.0  — patch saja
            "next": "16.2.12"        // persis ini
          }
        }
        `,
      ),
      p(
        'Lockfile-lah yang menentukan versi sebenarnya. Rentang di `package.json` hanya menyatakan apa yang **boleh** dipasang saat lockfile diperbarui.',
      ),

      h2('Changelog'),
      code(
        'text',
        `
        # Changelog

        ## [2.0.0] - 2026-08-02

        ### Berubah (MEMUTUS)
        - Field \`nama\` diganti menjadi \`namaLengkap\` di semua respons pengguna.
          Migrasi: ganti pembacaan \`user.nama\` menjadi \`user.namaLengkap\`.
        - \`POST /api/artikel\` kini menolak field yang tidak dikenal (422).

        ### Ditambahkan
        - Ekspor CSV lewat \`POST /api/ekspor\` (202 + job id).
        - Header \`Idempotency-Key\` didukung pada endpoint pembayaran.

        ### Diperbaiki
        - Paginasi melewatkan item saat ada data baru selama penelusuran.
        - \`per_hal\` tidak dibatasi; kini maksimum 100.

        ### Keamanan
        - \`GET /api/artikel/{id}\` sebelumnya mengembalikan artikel milik
          pengguna lain. Diperbaiki dengan scope kepemilikan di query.
        `,
      ),
      p(
        'Perhatikan entri pertama tidak berhenti pada "field `nama` diganti menjadi `namaLengkap`" — ia menyertakan **baris migrasi**: ganti pembacaan `user.nama` menjadi `user.namaLengkap`. Itu perbedaan antara changelog yang memberi tahu ada masalah dan changelog yang ikut menyelesaikannya. Untuk setiap perubahan yang memutus, tulis apa yang harus dilakukan pembaca, bukan hanya apa yang kamu ubah.',
      ),
      p(
        'Judul bagian juga ditulis dari sudut pandang pembaca, bukan dari sudut pandang commit. `Ditambahkan`, `Diperbaiki`, `Berubah (MEMUTUS)`, dan `Keamanan` menjawab pertanyaan "apa artinya ini bagiku": bisa kulewati, perlu kubaca, atau harus segera kupasang. Perhatikan entri `POST /api/artikel` menyebut kode statusnya (`422`) — angka konkret seperti itu membuat pembaca bisa mencocokkan dengan error yang mereka lihat di log.',
      ),
      callout(
        'tip',
        'Bagian "Keamanan" perlu ditulis terpisah',
        'Pengguna yang membaca changelog perlu tahu mana yang menuntut mereka segera memperbarui. Menyembunyikan perbaikan keamanan di antara daftar bug biasa membuat sebagian orang menunda pembaruan yang mendesak.',
      ),

      h2('Menghasilkan otomatis'),
      code(
        'bash',
        `
        npm install --save-dev standard-version
        npx standard-version              # tentukan versi + tulis changelog dari commit
        `,
      ),
      p(
        'Ini bekerja **hanya kalau** pesan commit-mu konsisten memakai Conventional Commits. Itulah nilai praktis dari disiplin di sub-bab sebelumnya.',
      ),

      h2('Tag'),
      code(
        'bash',
        `
        git tag -a v2.0.0 -m "Rilis 2.0.0"
        git push origin v2.0.0

        # Deploy dari tag, bukan dari branch —
        # supaya yang di-deploy pasti persis yang diuji.
        git checkout v2.0.0
        `,
      ),
      p(
        'Flag `-a` membuat **annotated tag** — objek tersendiri di Git yang menyimpan pembuat, waktu, dan pesan. Tanpa `-a`, yang dibuat adalah tag ringan: sekadar penunjuk ke commit, tanpa keterangan siapa merilis dan kapan. Untuk rilis, selalu pakai `-a`. Baris `git push origin v2.0.0` perlu ditulis terpisah karena `git push` biasa **tidak** ikut mengirim tag.',
      ),
      p(
        'Alasan `git checkout v2.0.0` dipakai saat deploy ada di komentarnya: tag menunjuk ke satu commit yang tidak bergerak, sedangkan branch bergerak setiap kali ada yang di-merge. Deploy dari branch `main` berarti yang terpasang adalah "apa pun isi `main` saat perintah itu berjalan" — yang bisa saja beberapa commit lebih maju dari yang kamu uji sepuluh menit lalu.',
      ),
      callout(
        'warning',
        'Tag bisa dipindahkan; itu sebabnya deploy sebaiknya menyebut SHA',
        'Untuk rilis internal, catat SHA commit yang benar-benar di-deploy. Tag `v2.0.0` yang dipindahkan diam-diam berarti "versi 2.0.0" di produksi bukan lagi kode yang sama dengan yang kamu uji.',
      ),

      h2('Aplikasi web tidak selalu butuh versi formal'),
      p(
        'Untuk aplikasi yang di-deploy terus-menerus dan tidak punya klien eksternal, SemVer sering berlebihan. Yang tetap berguna adalah **changelog** yang bisa dibaca dan **catatan SHA** yang sedang berjalan di produksi. Yang tidak boleh dilewati adalah API publik dan library, sebab keduanya punya klien yang tidak bisa kamu deploy ulang.',
      ),
    ],
  ),
];
