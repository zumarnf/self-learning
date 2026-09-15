import {
  callout,
  code,
  compare,
  h2,
  ol,
  p,
  references,
  table,
  terms,
  ul,
} from '@/lib/content/builders';
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
    18,
    'Perintah yang dipakai tiap hari, dan yang bisa menghilangkan pekerjaan.',
    [
      terms(
        {
          term: 'repository (repo)',
          meaning:
            'Folder project beserta seluruh riwayat perubahannya, disimpan di subfolder tersembunyi `.git`. Menyalin folder itu berarti menyalin seluruh riwayatnya, sebab Git menyimpan semuanya secara lokal dan tidak bergantung pada server untuk membaca masa lalu.',
        },
        {
          term: 'commit',
          meaning:
            'Satu titik simpan berisi kumpulan perubahan beserta alasannya. Dibaca "komit". Tiap commit punya identitas berupa hash dan menunjuk commit sebelumnya, sehingga riwayatnya membentuk rantai. Yang membuat commit berharga bukan isinya melainkan pesannya, sebab diff sudah menunjukkan apa yang berubah sementara hanya pesan yang bisa menjelaskan kenapa.',
        },
        {
          term: 'staging area (index)',
          meaning:
            'Ruang antara berkas kerjamu dan commit berikutnya, tempat kamu memilih perubahan mana yang ikut. Diisi dengan `git add`. Keberadaannya yang memungkinkan satu perubahan besar dipecah menjadi beberapa commit yang masing-masing utuh.',
        },
        {
          term: 'working tree',
          meaning:
            'Berkas yang benar-benar ada di folder kerjamu sekarang, yaitu yang dibuka editor. Perubahan di sini belum tersimpan di riwayat, sehingga perintah yang mengembalikan keadaan seperti `git restore` atau `git reset --hard` bisa menghapusnya tanpa cara memulihkan.',
        },
        {
          term: 'hash (SHA)',
          meaning:
            'Deretan karakter heksadesimal yang menjadi nama sebuah commit, misalnya `2264a0a`. Dihitung dari isi commit itu sendiri, sehingga mengubah isinya mengubah namanya. Itulah sebabnya menulis ulang riwayat menghasilkan commit yang berbeda meski isinya terlihat sama.',
        },
        {
          term: 'remote',
          meaning:
            'Salinan repository yang berada di tempat lain, biasanya di layanan seperti GitHub, dengan nama panggilan `origin` sebagai konvensi. `git push` mengirim commit ke sana dan `git pull` mengambilnya.',
        },
        {
          term: '.gitignore',
          meaning:
            'Berkas berisi pola nama yang memberi tahu Git agar mengabaikan berkas tertentu, misalnya `node_modules/` dan `.env`. Batasnya penting dipahami, berkas yang sudah pernah ikut ter-commit tidak menjadi terabaikan hanya karena polanya kemudian ditambahkan.',
        },
        {
          term: 'HEAD',
          meaning:
            'Penunjuk ke commit yang sedang kamu tempati. Ditulis huruf besar semua. Sebagian besar perintah Git memakainya sebagai titik acuan, misalnya `HEAD~1` berarti satu commit sebelum posisi sekarang.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Sebagian besar kebingungan tentang git berasal dari tidak melihat bahwa ada **tiga tempat** yang berbeda, dan hampir setiap perintah memindahkan sesuatu di antara ketiganya.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan dengan git 2.43.0:

          git status --short
            M a.txt      <- berubah di direktori kerja, BELUM di-stage
           A  b.txt      <- sudah di-stage, siap masuk commit berikutnya

        Kolom pertama = staging area.  Kolom kedua = direktori kerja.
        Membaca dua kolom itu menjawab hampir semua pertanyaan
        "kenapa perubahan saya tidak ikut ter-commit".
        `,
      ),
      p(
        'Perbedaan ketiga bentuk `reset` juga paling mudah dipahami dari tempat mana yang ia sentuh, dan itu bisa diukur.',
      ),
      code(
        'text',
        `
        Diuji sungguhan. Keadaan awal: commit ketiga sudah dibuat,
        a.txt berisi "satu / dua / tiga".

          reset --soft   HEAD mundur, staging=a.txt,b.txt, isi=satu/dua/tiga
          reset --mixed  HEAD mundur, staging=kosong,      isi=satu/dua/tiga
          reset --hard   HEAD mundur, staging=kosong,      isi=satu/dua

        Hanya --hard yang MENGUBAH isi berkas. Baris "tiga" hilang,
        dan tidak ada perintah git yang bisa mengembalikannya bila ia
        belum pernah masuk commit mana pun.
        `,
        {
          caption:
            'Itulah satu-satunya perintah di daftar ini yang benar-benar bisa menghapus pekerjaan.',
        },
      ),
      p(
        'Untuk pekerjaan yang sudah pernah masuk commit, ada jaring pengaman yang jarang diketahui pemula.',
      ),
      code(
        'text',
        `
        Diuji sungguhan sesudah reset --hard:

          git reflog
            34792eb reset: moving to HEAD@{1}
            718e286 reset: moving to HEAD~1
            34792eb reset: moving to HEAD

        reflog mencatat SETIAP perpindahan HEAD di repositori lokalmu,
        termasuk yang tidak lagi terjangkau dari branch mana pun.

          git reset --hard HEAD@{1}     kembali ke keadaan sebelumnya
        `,
      ),
      p(
        'Dan untuk pekerjaan yang belum di-commit, jalannya bukan `reset` melainkan menyimpannya dulu.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          git stash        -> perubahan disimpan, direktori kerja bersih
          git stash pop    -> kembali:  M a.txt  A  b.txt

        Perhatikan kolom staging ikut pulih. Untuk berkas yang belum
        pernah dilacak git, tambahkan -u, atau ia akan tertinggal.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Error git umumnya jelas, dan yang perlu dikenali adalah beberapa yang namanya menakutkan padahal tidak berbahaya.',
      ),
      code(
        'text',
        `
        error: Your local changes to the following files would be
        overwritten by checkout: src/app.ts
        Please commit your changes or stash them before you switch branches.

          -> Git MENOLAK membuang pekerjaanmu. Ini perlindungan,
             bukan kegagalan. Commit atau stash dulu.

        You are in 'detached HEAD' state.

          -> Kamu sedang berada di sebuah commit, bukan di sebuah
             branch. Commit baru di sini tidak menempel ke branch mana
             pun. Buat branch dengan: git switch -c nama-branch

        fatal: refusing to merge unrelated histories

          -> Dua riwayat yang tidak punya nenek moyang bersama.
             Biasanya karena repo lokal dibuat dengan git init lalu
             remote-nya sudah punya commit sendiri.

        error: failed to push some refs
        hint: Updates were rejected because the remote contains work
        that you do not have locally.

          -> Ada commit di remote yang belum kamu punya. Tarik dulu.
             JANGAN menyelesaikannya dengan --force.
        `,
      ),
      p(
        'Perintah yang benar-benar perlu diwaspadai jumlahnya sedikit, dan semuanya punya satu kesamaan, yaitu tidak menanyakan konfirmasi.',
      ),
      code(
        'text',
        `
        BISA MENGHAPUS PEKERJAAN, tanpa bertanya:

          git reset --hard          membuang perubahan yang belum di-commit
          git checkout -- <berkas>  membuang perubahan pada berkas itu
          git clean -fd             MENGHAPUS berkas yang belum dilacak
          git push --force          menimpa riwayat di remote

        AMAN, bisa dibatalkan:

          git stash                 disimpan, bisa dikembalikan
          git revert <commit>       membuat commit BARU yang membatalkan
          git branch <nama>         hanya menandai, tidak mengubah apa pun

        git clean -fd yang paling sering menyesal, sebab yang dihapus
        justru berkas yang belum pernah masuk git sama sekali —
        termasuk .env lokal dan berkas yang baru dibuat.
        `,
        {
          caption:
            'Jalankan git clean -nd lebih dulu untuk melihat apa yang AKAN dihapus tanpa menghapusnya.',
        },
      ),
      p(
        'Ada satu lagi yang mengubah sesuatu secara diam-diam, dan akibatnya baru terasa ketika bekerja dengan orang lain.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          sebelum amend : 34792eb commit ketiga
          sesudah amend : 5b46a0f commit ketiga (diperbaiki)

        Hash-nya BERUBAH. Untuk git, itu commit yang sama sekali
        berbeda. Bila commit lama sudah di-push dan ditarik orang lain,
        amend berarti menulis ulang riwayat bersama, dan riwayat mereka
        kini bercabang dari riwayatmu.

        Aman: amend pada commit yang BELUM pernah di-push.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan git yang paling mahal hampir selalu berupa memakai perintah yang membuang pekerjaan untuk menyelesaikan masalah yang sebenarnya tidak menuntutnya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            '`git reset --hard` saat bingung',
            'Biar kembali bersih',
            'Diuji, hanya `--hard` yang mengubah isi berkas. Perubahan yang belum di-commit hilang permanen',
          ],
          [
            '`git clean -fd` untuk merapikan',
            'Cuma menghapus berkas sampah',
            'Ia menghapus berkas yang belum dilacak, termasuk `.env` lokal. Jalankan `-nd` dulu untuk melihatnya',
          ],
          [
            '`git push --force` saat push ditolak',
            'Biar versiku yang dipakai',
            'Itu menimpa commit orang lain di remote. Pakai `--force-with-lease`, dan hanya di branch milikmu',
          ],
          [
            '`git commit --amend` pada commit yang sudah di-push',
            'Cuma memperbaiki pesannya',
            'Diuji, hash-nya berubah. Riwayat orang lain kini bercabang dari riwayatmu',
          ],
          [
            'Menganggap `reflog` tidak ada',
            'Sudah ter-reset, ya hilang',
            'Diuji, `reflog` mencatat setiap perpindahan HEAD. Commit yang hilang biasanya masih bisa dikembalikan',
          ],
          [
            'Meng-commit berkas besar atau rahasia lalu menghapusnya',
            'Sudah dihapus di commit berikutnya',
            'Riwayatnya tetap menyimpannya. Untuk rahasia, rotasi nilainya. Untuk berkas besar, ukurannya tetap ikut',
          ],
        ],
      ),
      p(
        'Kebiasaan tunggal yang paling menurunkan risiko adalah menjalankan `git status` sebelum setiap perintah yang bisa membuang sesuatu. Dua kolom di keluarannya menjawab dua pertanyaan yang menentukan, yaitu apa yang akan ikut ter-commit dan apa yang akan hilang bila kamu membuang perubahan sekarang. Lima detik membaca itu jauh lebih murah daripada memulihkan pekerjaan setengah hari.',
      ),
      references(
        {
          label: 'Git Documentation',
          href: 'https://git-scm.com/doc',
          source: 'Git',
          note: 'Rujukan resmi beserta buku Pro Git lengkap dalam bahasa aslinya',
        },
        {
          label: 'Recording Changes to the Repository',
          href: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
          source: 'Pro Git',
          note: 'Alur berkas dari working tree ke staging area lalu ke commit',
        },
        {
          label: 'gitignore',
          href: 'https://git-scm.com/docs/gitignore',
          source: 'Git',
          note: 'Aturan pola lengkap beserta urutan prioritasnya',
        },
        {
          label: 'git-commit',
          href: 'https://git-scm.com/docs/git-commit',
          source: 'Git',
          note: 'Seluruh opsi perintahnya, termasuk yang menulis ulang commit terakhir',
        },
      ),
    ],
  ),

  written(
    'strategi-branch',
    'Strategi Branch: trunk-based vs git flow',
    17,
    'Dua model, dan kenapa yang sederhana biasanya menang.',
    [
      terms(
        {
          term: 'branch (cabang)',
          meaning:
            'Penunjuk bernama ke sebuah commit, yang ikut bergerak maju setiap kali kamu membuat commit baru di atasnya. Karena hanya berupa penunjuk, membuat branch di Git sangat murah, dan itulah yang membuat pola kerja berbasis branch praktis.',
        },
        {
          term: 'branch utama',
          meaning:
            'Branch yang menjadi sumber kebenaran project, bernama `main` pada konvensi sekarang dan `master` pada konvensi lama. Aturan yang berlaku di hampir semua tim, branch ini harus selalu dalam keadaan bisa dirilis.',
        },
        {
          term: 'feature branch',
          meaning:
            'Branch berumur pendek yang dibuat dari branch utama untuk mengerjakan satu perubahan, lalu digabungkan kembali dan dihapus. Semakin lama ia hidup, semakin besar kemungkinan bertabrakan dengan pekerjaan orang lain.',
        },
        {
          term: 'merge',
          meaning:
            'Menggabungkan isi satu branch ke branch lain. Bila keduanya menyentuh baris yang sama, Git berhenti dan meminta manusia memutuskan, dan itulah yang disebut konflik. Hasilnya berupa commit gabungan yang punya dua induk.',
        },
        {
          term: 'rebase',
          meaning:
            'Memindahkan serangkaian commit supaya seolah-olah dibuat di atas commit lain, menghasilkan riwayat yang lurus tanpa commit gabungan. Karena commit-nya ditulis ulang, hash-nya berubah, sehingga rebase tidak boleh dilakukan pada branch yang sudah dipakai orang lain.',
        },
        {
          term: 'fast-forward',
          meaning:
            'Penggabungan yang cukup dilakukan dengan menggeser penunjuk branch ke depan, karena tidak ada commit baru di sisi tujuan. Tidak menghasilkan commit gabungan sama sekali.',
        },
        {
          term: 'trunk-based development',
          meaning:
            'Pola kerja yang mempertahankan satu branch utama dan menggabungkan perubahan kecil ke sana sesering mungkin, seringkali beberapa kali sehari. Fitur yang belum siap disembunyikan di balik feature flag, bukan disimpan di branch terpisah berminggu-minggu.',
        },
        {
          term: 'GitHub Flow',
          meaning:
            'Pola kerja sederhana yang hanya mengenal branch utama dan feature branch berumur pendek, dengan pull request sebagai gerbang tinjauan dan deploy dilakukan dari branch utama. Cocok untuk aplikasi web yang dirilis sering.',
        },
        {
          term: 'feature flag',
          meaning:
            'Sakelar konfigurasi yang menyalakan atau mematikan sebuah fitur tanpa mengubah kode yang sudah dirilis. Memungkinkan kode yang belum selesai ikut digabungkan lebih awal dalam keadaan mati.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Strategi branch adalah keputusan tentang berapa lama sebuah perubahan boleh hidup terpisah dari kode utama. Semakin lama terpisah, semakin besar jarak yang harus dijembatani saat digabungkan, dan jarak itu berwujud konflik.',
      ),
      p('Bentuk konfliknya bisa dilihat langsung.'),
      code(
        'text',
        `
        Dijalankan sungguhan dengan git 2.43.0. Dua branch mengubah
        baris yang sama:

          Auto-merging harga.py
          CONFLICT (content): Merge conflict in harga.py
          Automatic merge failed; fix conflicts and then commit the result.

        Isi berkasnya saat konflik:

          harga = 1000
          <<<<<<< HEAD
          pajak = 0.12
          =======
          pajak = 0.11
          diskon = 0.15
          >>>>>>> fitur-diskon

        Dan status:
          UU harga.py      <- keduanya mengubah (Unmerged, Unmerged)
        `,
        {
          caption:
            'Bagian atas adalah milik branch tempat kamu berada, bagian bawah milik branch yang digabungkan.',
        },
      ),
      p(
        'Yang perlu dipahami adalah bahwa penanda itu **bukan sesuatu yang bisa dipilih salah satu begitu saja**. Pada contoh di atas, jawaban yang benar bukan `0.12` maupun `0.11 + diskon`, melainkan pajak yang baru **beserta** diskonnya. Menyelesaikan konflik adalah keputusan produk, bukan pekerjaan menyalin.',
      ),
      p(
        'Pilihan antara merge dan rebase menghasilkan bentuk riwayat yang berbeda, dan itu juga bisa dilihat.',
      ),
      code(
        'text',
        `
        Sesudah MERGE, dijalankan sungguhan:

          *   9d1ed45 gabung fitur diskon
          |\\
          | * 9b6608e tambah diskon
          * | d4a5c30 naikkan pajak
          |/
          * 1f19e02 awal

        Percabangannya TERLIHAT. Kamu bisa tahu bahwa dua pekerjaan
        berjalan bersamaan dan kapan keduanya bertemu.

        Sesudah REBASE, commit "tambah diskon" ditulis ulang di atas
        "naikkan pajak", sehingga riwayatnya menjadi satu garis lurus.
        Percabangannya hilang dari catatan.
        `,
      ),
      table(
        ['', 'Merge', 'Rebase'],
        [
          ['Bentuk riwayat', 'Bercabang, apa adanya', 'Satu garis, lebih mudah dibaca'],
          ['Hash commit', 'Tetap', 'Ditulis ulang, berubah'],
          ['Aman untuk branch bersama', 'Ya', 'TIDAK'],
          ['Konflik diselesaikan', 'Sekali', 'Bisa berulang per commit'],
          [
            'Cocok untuk',
            'Menggabungkan ke branch utama',
            'Merapikan branch sendiri sebelum digabung',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah satu-satunya aturan keras di tabel itu. Rebase menulis ulang hash, jadi melakukannya pada branch yang sudah ditarik orang lain membuat riwayat mereka bercabang dari riwayatmu tanpa mereka lakukan apa-apa.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Rebase yang berhenti di tengah adalah keadaan yang paling sering membuat panik, padahal git menuliskan jalan keluarnya.',
      ),
      code(
        'text',
        `
        Dijalankan sungguhan:

          Rebasing (1/1)Auto-merging harga.py
          CONFLICT (content): Merge conflict in harga.py
          error: could not apply 9b6608e... tambah diskon

        Tiga pilihan, dan semuanya aman:

          git rebase --continue   sesudah konflik diselesaikan dan di-stage
          git rebase --skip       lewati commit ini
          git rebase --abort      BATALKAN seluruhnya, kembali seperti semula

        --abort selalu tersedia selama rebase-nya belum selesai.
        Tidak ada yang hilang.
        `,
      ),
      code(
        'text',
        `
        KEADAAN LAIN yang terlihat menakutkan:

          You are in 'detached HEAD' state
            -> normal selama rebase berjalan. Ia akan kembali sendiri.

          fatal: Exiting because of an unresolved conflict
            -> masih ada berkas berstatus UU. Selesaikan, git add,
               lalu --continue.

          Automatic merge failed; fix conflicts
            -> pada MERGE, jalan keluarnya git merge --abort
        `,
      ),
      p(
        'Masalah yang jauh lebih mahal tidak menghasilkan error sama sekali, yaitu branch yang hidup terlalu lama.',
      ),
      code(
        'text',
        `
        Gejalanya bertingkat, dan makin lama makin buruk:

          minggu 1  : konflik kecil, lima menit
          minggu 3  : konflik di banyak berkas, setengah hari
          minggu 6  : perubahan di branch utama membuat pendekatannya
                      tidak lagi masuk akal, dan sebagian pekerjaan
                      harus ditulis ulang
          minggu 10 : tidak ada yang berani menggabungkannya

        Sebabnya bukan git. Sebabnya satuan kerja yang terlalu besar.
        Yang menutupnya: pecah pekerjaannya, dan pakai saklar fitur
        supaya kode yang belum siap bisa masuk lebih dulu dalam
        keadaan mati.
        `,
      ),
      code(
        'ts',
        `
        // Saklar fitur membuat "belum selesai" dan "belum digabung"
        // menjadi dua hal yang berbeda.
        export function checkoutBaru() {
          if (!env.FITUR_CHECKOUT_BARU) return checkoutLama();
          // ... implementasi baru, sudah ada di branch utama,
          //     berjalan hanya untuk yang diizinkan
        }

        // Dan saklarnya dibaca saat RUNTIME, bukan saat build, supaya
        // bisa dimatikan tanpa rilis ulang — ini alasan praktis kenapa
        // batas build/runtime di bab sebelumnya penting.
        `,
      ),
      p(
        'Baris pertama fungsi itulah yang membuat branch berumur pendek mungkin. Selama fitur yang belum siap bisa masuk branch utama dalam keadaan mati, tidak ada alasan menyimpan pekerjaan berminggu-minggu di tempat terpisah. Dan karena saklarnya dibaca saat runtime, mematikannya kembali tidak menuntut rilis baru, sehingga ia sekaligus menjadi jalur pembatalan yang lebih cepat daripada rollback.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Perdebatan merge versus rebase sering menyita perhatian yang sebenarnya milik pertanyaan yang jauh lebih menentukan, yaitu seberapa besar satu satuan pekerjaan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membiarkan branch fitur hidup berminggu-minggu',
            'Fiturnya memang besar',
            'Konfliknya tumbuh dari lima menit menjadi setengah hari. Pecah pekerjaannya, pakai saklar fitur',
          ],
          [
            'Me-rebase branch yang sudah ditarik orang lain',
            'Biar riwayatnya rapi',
            'Hash-nya ditulis ulang. Riwayat rekan kerja bercabang dari riwayatmu tanpa mereka berbuat apa-apa',
          ],
          [
            'Memilih salah satu sisi konflik tanpa membaca keduanya',
            'Yang punyaku yang benar',
            'Pada contoh terukur, jawaban benarnya adalah pajak baru BESERTA diskon. Bukan salah satunya',
          ],
          [
            'Panik saat rebase berhenti di tengah',
            'Riwayatnya sudah rusak',
            '`git rebase --abort` mengembalikan semuanya. Tidak ada yang hilang selama rebase belum selesai',
          ],
          [
            'Mematikan `main` untuk perbaikan besar',
            'Biar tidak mengganggu yang lain',
            'Branch utama yang tidak bisa dirilis membuat perbaikan darurat mustahil dikirim',
          ],
          [
            'Memakai git flow untuk project satu orang',
            'Katanya itu standar industri',
            'Lima jenis branch untuk satu orang adalah biaya tanpa manfaat. Trunk-based lebih cocok',
          ],
        ],
      ),
      p(
        'Cara memilih strateginya sebenarnya sederhana dan tidak bergantung pada selera. Bila kamu merilis kapan saja dan timnya kecil, pakai trunk-based dengan branch berumur pendek. Bila kamu punya beberapa versi yang harus didukung bersamaan, misalnya perangkat lunak yang dipasang pelanggan, barulah cabang rilis terpisah membayar dirinya. Selebihnya, umur branch adalah variabel yang paling menentukan, jauh melebihi pilihan antara merge dan rebase.',
      ),
      references(
        {
          label: 'Branches in a Nutshell',
          href: 'https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell',
          source: 'Pro Git',
          note: 'Kenapa branch di Git hanya berupa penunjuk, dan akibatnya pada biaya membuatnya',
        },
        {
          label: 'GitHub flow',
          href: 'https://docs.github.com/en/get-started/using-github/github-flow',
          source: 'GitHub Docs',
          note: 'Pola branch paling sederhana yang masih memberi gerbang tinjauan',
        },
        {
          label: 'git-tag',
          href: 'https://git-scm.com/docs/git-tag',
          source: 'Git',
          note: 'Menandai commit tertentu sebagai rilis, berbeda dari branch yang terus bergerak',
        },
      ),
    ],
  ),

  written(
    'pesan-commit',
    'Pesan Commit yang Menjelaskan *Kenapa*',
    17,
    'Diff sudah menunjukkan apa yang berubah; pesannya untuk yang lain.',
    [
      p(
        'Pesan commit yang mengulang isi diff tidak menambah apa pun. Yang hilang dan mahal untuk direkonstruksi adalah **alasannya** — kenapa perubahan ini perlu, dan apa yang sudah dicoba sebelumnya.',
      ),

      terms(
        {
          term: 'subject line',
          meaning:
            'Baris pertama pesan commit, yang muncul di `git log --oneline` dan di daftar commit. Dijaga pendek, lazimnya di bawah 50 sampai 72 karakter, sebab banyak alat memotongnya. Ditulis dalam bentuk perintah, misalnya "perbaiki" dan bukan "memperbaiki".',
        },
        {
          term: 'body',
          meaning:
            'Bagian pesan commit sesudah satu baris kosong di bawah subject. Di sinilah alasan perubahan ditulis, beserta alternatif yang ditolak dan batasan yang memaksa bentuknya. Bagian inilah yang paling dicari pembaca berikutnya dan paling sering kosong.',
        },
        {
          term: 'Conventional Commits',
          meaning:
            'Konvensi penulisan pesan commit berbentuk `tipe(cakupan): ringkasan`, misalnya `fix(auth): tolak token kedaluwarsa`. Tipe yang lazim antara lain `feat`, `fix`, `docs`, `refactor`, dan `test`. Manfaat utamanya bukan kerapian melainkan bahwa alat bisa membaca tipenya untuk menentukan kenaikan versi dan menyusun changelog.',
        },
        {
          term: 'breaking change',
          meaning:
            'Perubahan yang membuat pemakai lama berhenti bekerja tanpa mereka mengubah apa pun. Ditandai dengan tanda seru sesudah tipe, atau baris `BREAKING CHANGE:` di body. Penandaan inilah yang menentukan versi mayor naik.',
        },
        {
          term: 'atomic commit',
          meaning:
            'Satu commit yang memuat tepat satu perubahan logis, sehingga bisa dipahami sendirian dan dibatalkan tanpa merusak hal lain. Menggabungkan perbaikan kecil yang tidak berhubungan ke dalam commit fitur membuat pembatalannya mustahil tanpa kerusakan sampingan.',
        },
        {
          term: 'amend',
          meaning:
            'Menulis ulang commit terakhir, lewat `git commit --amend`. Berguna memperbaiki pesan atau menambahkan berkas yang lupa. Karena menghasilkan hash baru, perintah ini tidak aman dipakai pada commit yang sudah dikirim ke branch bersama.',
        },
        {
          term: 'squash',
          meaning:
            'Menggabungkan beberapa commit menjadi satu. Sering dipakai saat menggabungkan pull request supaya riwayat branch utama memuat satu commit bermakna per perubahan, bukan belasan commit perbaikan kecil.',
        },
        {
          term: 'co-author',
          meaning:
            'Baris `Co-Authored-By: Nama <email>` di akhir pesan commit yang mencatat kontributor tambahan. Dikenali layanan seperti GitHub dan ditampilkan sebagai penulis bersama.',
        },
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
      h2('Studi kasus di project nyata'),
      p(
        'Diff sudah menunjukkan apa yang berubah. Pesan commit yang mengulanginya tidak menambahkan apa pun, dan yang hilang justru bagian yang paling mahal direkonstruksi, yaitu alasannya.',
      ),
      p(
        'Selisihnya terlihat jelas ketika dibaca berbulan-bulan kemudian oleh orang yang tidak ada di percakapan saat itu.',
      ),
      code(
        'text',
        `
        TIDAK MENAMBAHKAN APA PUN:
          fix bug
          update
          perbaikan
          ubah kode
          wip
          ganti timeout jadi 30 detik

        Baris terakhir terlihat informatif, dan ia hanya mengulang diff.
        Pertanyaan yang tersisa: kenapa 30, kenapa bukan 10, apa yang
        terjadi kalau dikembalikan?

        MENJAWAB PERTANYAAN ITU:

          Naikkan timeout klien pembayaran dari 10 ke 30 detik

          Penyedia menjanjikan p99 sebesar 8 detik, dan pada jam sibuk
          kami mengukur 22 detik. Timeout 10 detik menolak transaksi
          yang sebenarnya berhasil di sisi mereka, sehingga pengguna
          tertagih tanpa pesanan.

          Dipilih 30 karena itu batas atas yang mereka jamin. Menaikkan
          lebih jauh akan melewati batas waktu proxy kami yang 60 detik
          dan menghasilkan 504.

          Bila ini dikembalikan, kegagalan transaksi ganda akan muncul
          lagi pada jam sibuk.
        `,
        {
          caption:
            'Tiga hal yang selalu berbayar: konteks, alternatif yang ditolak, dan akibat bila dibatalkan.',
        },
      ),
      p(
        'Bentuk yang lazim membaginya menjadi subjek dan badan, dan pembagian itu bukan formalitas sebab banyak alat hanya menampilkan barisnya yang pertama.',
      ),
      code(
        'text',
        `
        Aturan bentuk yang punya alasan teknis:

          baris 1   ringkas, di bawah ~50 karakter, kalimat perintah
          baris 2   KOSONG
          baris 3+  badan, dibungkus di ~72 karakter

        Kenapa baris kedua harus kosong: git memakai baris pertama
        sebagai subjek di git log --oneline, di daftar commit, dan di
        judul pull request. Tanpa baris kosong, seluruh pesan dianggap
        subjek.

        Kenapa kalimat perintah ("Naikkan", bukan "Menaikkan" atau
        "Sudah naikkan"): commit yang dihasilkan git sendiri memakai
        bentuk itu, misalnya "Merge branch ..." dan "Revert ...".
        `,
      ),
      p(
        'Untuk project yang merilis dengan penomoran otomatis, bentuk pesannya bisa sekaligus menjadi masukan bagi alat, dan itulah yang dilakukan Conventional Commits.',
      ),
      code(
        'text',
        `
          feat(checkout): terima pembayaran dengan QRIS
          fix(auth): cabut sesi lain saat sandi diubah
          perf(daftar): ganti OFFSET dengan keyset pagination
          docs(readme): jelaskan variabel environment yang wajib
          refactor(api): pisahkan validasi dari handler
          chore(deps): naikkan vitest ke 4.1.10

        Dan yang menentukan penomoran versi:

          fix:   -> menaikkan angka PATCH
          feat:  -> menaikkan angka MINOR
          BREAKING CHANGE: di badan, atau tanda ! sesudah tipe
                 -> menaikkan angka MAJOR

          feat(api)!: hapus field namaLengkap dari respons

          BREAKING CHANGE: field namaLengkap diganti nama dan namaBelakang.
          Klien yang membacanya harus diperbarui sebelum rilis ini.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Pesan commit tidak menghasilkan error runtime, dan biayanya muncul pada saat-saat tertentu yang bisa diperkirakan.',
      ),
      code(
        'text',
        `
        1. Saat mencari kapan sebuah perilaku berubah

           git log --oneline -- src/pembayaran/
             a1b2c3d update
             d4e5f6a fix
             7890abc perbaikan
             ...

           Tidak ada satu pun yang bisa dipakai memilih. Satu-satunya
           jalan tersisa adalah membaca diff satu per satu.

        2. Saat bisect menemukan commit penyebabnya

           git bisect run npm test
             a1b2c3d is the first bad commit
             commit message: "update"

           Git berhasil menemukan commitnya, dan commitnya tidak
           memberi tahu apa-apa.

        3. Saat sebuah perubahan mau dibatalkan

           Tidak ada catatan apa yang akan rusak bila dibatalkan,
           sehingga keputusannya diambil dengan menebak.
        `,
      ),
      p('Ada juga kesalahan bentuk yang menghasilkan gejala yang membingungkan pada alat.'),
      code(
        'text',
        `
        Seluruh pesan panjang ditulis di baris pertama:

          git log --oneline
            a1b2c3d Naikkan timeout klien pembayaran dari 10 ke 30 detik karena
            penyedia menjanjikan p99 8 detik sementara kami mengukur 22 detik
            pada jam sibuk sehingga transaksi yang berhasil ditolak

          Seluruhnya dianggap subjek. Daftar commit menjadi tidak
          terbaca, dan judul pull request ikut sepanjang itu.

        Dan pada alat penghasil changelog:

          fix : perbaiki sesuatu      <- ada spasi sebelum titik dua
          Fix: perbaiki sesuatu       <- huruf besar
          fixed: perbaiki sesuatu     <- tipe tidak dikenal

          Ketiganya tidak dikenali, dan commit-nya TIDAK MUNCUL di
          changelog. Tidak ada error, hanya hilang.
        `,
        {
          caption:
            'Alat yang gagal secara diam-diam paling sering ditemukan setelah rilis, saat ada yang bertanya kenapa perbaikannya tidak tercatat.',
        },
      ),
      p(
        'Satu kesalahan terakhir menyangkut isinya, bukan bentuknya, dan ini yang paling berbahaya.',
      ),
      code(
        'text',
        `
        JANGAN pernah menulis di pesan commit:

          - kredensial, token, atau kunci, meski hanya sebagai contoh
          - tautan ke sistem internal yang memuat token di URL-nya
          - data pribadi pelanggan, termasuk saat menjelaskan bug

        Pesan commit ikut ke setiap klon, tidak bisa diubah tanpa
        menulis ulang riwayat, dan sering ikut ke changelog publik.
        Berlaku aturan yang sama dengan berkas: yang pernah masuk
        riwayat dihitung bocor.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pesan commit terasa seperti formalitas ketika ditulis, dan berubah menjadi satu-satunya sumber informasi ketika dibaca.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menulis `fix`, `update`, atau `wip`',
            'Toh diff-nya bisa dibaca',
            'Saat `bisect` menemukan commit penyebabnya, pesannya tidak memberi tahu apa-apa',
          ],
          [
            'Mengulang isi diff di pesan',
            'Biar jelas apa yang berubah',
            'Diff sudah menunjukkan itu. Yang hilang dan mahal direkonstruksi adalah alasannya',
          ],
          [
            'Menulis seluruh pesan di baris pertama',
            'Isinya kan sama saja',
            'Git memakai baris pertama sebagai subjek. Daftar commit dan judul PR menjadi tidak terbaca',
          ],
          [
            'Memasukkan beberapa perubahan tak berhubungan ke satu commit',
            'Sekalian saja',
            'Membatalkan salah satunya berarti membatalkan semuanya. Satu commit = satu perubahan logis',
          ],
          [
            'Menulis tipe Conventional Commits dengan bentuk bebas',
            'Maksudnya kan sama',
            '`Fix:` atau `fix :` tidak dikenali. Commit-nya hilang dari changelog tanpa satu pun error',
          ],
          [
            'Menyalin pesan error berisi token ke badan commit',
            'Biar konteksnya lengkap',
            'Pesan commit ikut ke setiap klon dan tidak bisa dihapus tanpa menulis ulang riwayat',
          ],
        ],
      ),
      p(
        'Ada satu pertanyaan yang bisa diajukan sebelum menulis pesan, dan ia hampir selalu menghasilkan pesan yang berguna. Bayangkan seseorang menemukan commit ini enam bulan lagi karena ia menyebabkan masalah, dan orang itu sedang mempertimbangkan untuk membatalkannya. Apa yang perlu ia ketahui sebelum menekan tombol itu? Jawaban atas pertanyaan itulah badan pesan commit-nya.',
      ),
      references(
        {
          label: 'git-commit',
          href: 'https://git-scm.com/docs/git-commit',
          source: 'Git',
          note: 'Termasuk `--amend` beserta peringatan soal menulis ulang commit yang sudah dibagikan',
        },
        {
          label: 'Recording Changes to the Repository',
          href: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
          source: 'Pro Git',
          note: 'Alur memilih perubahan sebelum menulis pesannya',
        },
        {
          label: 'About pull requests',
          href: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests',
          source: 'GitHub Docs',
          note: 'Hubungan antara pesan commit dan deskripsi pull request saat digabungkan',
        },
      ),
    ],
  ),

  written(
    'pull-request',
    'Pull Request & Code Review',
    17,
    'Gerbang terakhir sebelum kode menjadi tanggung jawab semua orang.',
    [
      terms(
        {
          term: 'pull request (PR)',
          meaning:
            'Permintaan agar perubahan di satu branch digabungkan ke branch lain, disertai tempat untuk meninjau dan berdiskusi sebelum itu terjadi. Di GitLab namanya *merge request*. Fungsinya bukan sekadar menggabungkan, melainkan menjadi gerbang tempat pemeriksaan otomatis dan mata kedua bertemu.',
        },
        {
          term: 'diff',
          meaning:
            'Tampilan baris apa saja yang bertambah dan berkurang. Ukurannya menentukan mutu tinjauan. Diff yang terlalu besar dipindai lalu disetujui, dan tinjauan yang tidak benar-benar terjadi terlihat persis sama dengan tinjauan yang terjadi.',
        },
        {
          term: 'review (tinjauan)',
          meaning:
            'Pembacaan perubahan oleh orang lain sebelum digabungkan, menghasilkan persetujuan, komentar, atau permintaan perubahan. Nilainya terbesar pada hal yang tidak bisa diperiksa mesin, yaitu apakah pendekatannya tepat dan apakah ada kasus yang terlewat.',
        },
        {
          term: 'required check',
          meaning:
            'Pemeriksaan otomatis yang harus hijau sebelum tombol gabung bisa ditekan, misalnya lint, type-check, dan test. Inilah yang mengubah "seharusnya dijalankan" menjadi "tidak bisa dilewati".',
        },
        {
          term: 'branch protection',
          meaning:
            'Aturan pada branch utama yang melarang push langsung, mewajibkan pull request, mewajibkan pemeriksaan tertentu hijau, dan bisa mewajibkan sejumlah persetujuan. Tanpa ini, seluruh disiplin di atas bergantung pada ingatan orang.',
        },
        {
          term: 'draft PR',
          meaning:
            'Pull request yang sengaja ditandai belum siap digabungkan. Dipakai untuk meminta masukan awal atas arah pekerjaan, sebelum detailnya dirapikan.',
        },
        {
          term: 'CODEOWNERS',
          meaning:
            'Berkas yang memetakan path berkas ke orang atau tim yang otomatis diminta meninjau bila path itu tersentuh. Berguna supaya bagian yang sensitif tidak lolos tanpa dilihat orang yang paling paham.',
        },
        {
          term: 'merge queue',
          meaning:
            'Antrean yang menguji tiap pull request terhadap keadaan terbaru branch utama sebelum benar-benar menggabungkannya. Menutup kasus dua perubahan yang masing-masing hijau tetapi rusak ketika digabung bersamaan.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Pull request adalah dua hal sekaligus, yaitu permintaan untuk menggabungkan dan tempat sebuah keputusan dicatat. Bagian kedua sering diabaikan, padahal itulah yang bertahan lama setelah kodenya sendiri berubah.',
      ),
      p(
        'Ukuran PR menentukan kualitas review jauh lebih besar daripada pengalaman yang mereview, dan alasannya mekanis.',
      ),
      code(
        'text',
        `
        Yang terjadi seiring bertambahnya baris yang berubah:

          < 100 baris   reviewer membaca setiap baris
          200-400 baris reviewer membaca selektif
          > 400 baris   reviewer memindai, lalu menulis "LGTM"
          > 1000 baris  reviewer menyetujui tanpa membacanya

        Dan ini yang membuatnya berbahaya: PR yang terlalu besar
        TETAP DISETUJUI. Ia tidak ditolak, tidak memunculkan peringatan,
        dan tidak meninggalkan jejak bahwa reviewnya tidak sungguhan.
        `,
        { caption: 'Review yang tidak terjadi terlihat persis sama dengan review yang terjadi.' },
      ),
      p(
        'Karena itu pekerjaan terbesar dalam membuat PR bukan menulis deskripsinya melainkan memecah perubahannya. Beberapa cara memecah yang hampir selalu bisa dipakai.',
      ),
      code(
        'text',
        `
          1. Pisahkan perubahan MEKANIS dari yang SUBSTANTIF
             satu PR untuk ganti nama dan format, satu untuk logikanya.
             PR ganti nama 800 baris mudah direview, PR logika 80 baris
             juga mudah — gabungannya tidak.

          2. Pisahkan migrasi dari kode yang memakainya
             ini sekaligus yang membuat expand-contract mungkin.

          3. Pisahkan endpoint dari antarmukanya
             backend lebih dulu, ditutup saklar fitur, lalu frontend.

          4. Pisahkan perbaikan yang ditemukan di jalan
             catat, buat PR sendiri. Jangan diselipkan.
        `,
      ),
      p(
        'Deskripsi PR yang berguna menjawab pertanyaan reviewer sebelum ia bertanya, dan bentuknya cukup empat bagian.',
      ),
      code(
        'text',
        `
        ## Kenapa
        Pengguna yang mengganti sandi karena curiga akunnya diakses
        orang lain tetap membiarkan sesi penyusup hidup. Dilaporkan
        di tiket #482.

        ## Apa yang berubah
        Mengubah sandi kini mencabut seluruh keluarga refresh token
        milik pengguna itu, kecuali sesi yang sedang dipakai.

        ## Cara mengujinya
        1. Masuk di dua peramban berbeda
        2. Ubah sandi di peramban A
        3. Muat ulang di peramban B -> harus diminta login lagi

        ## Yang saya ragu
        Apakah sesi yang sedang dipakai memang harus dikecualikan?
        Saya memilih ya supaya penggunanya tidak ikut terlempar,
        tapi ini bisa diperdebatkan.
        `,
        {
          caption:
            'Bagian keempat yang paling sering dilewatkan, dan paling sering menghasilkan review yang berguna.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pada tahap ini tidak berupa pesan error melainkan berupa pola yang berulang, dan mengenalinya lebih cepat daripada menunggu akibatnya.',
      ),
      code(
        'text',
        `
        1. PR menggantung berhari-hari

           Setiap hari menambah jarak dengan branch utama, dan jarak
           itu berwujud konflik. PR yang menunggu tiga hari sering
           butuh setengah hari untuk digabungkan.

        2. Semua komentar hanya soal gaya penulisan

           Titik koma, nama variabel, urutan impor. Ini tanda bahwa
           formatter dan linter BELUM otomatis. Perbaiki di CI, bukan
           di kepala reviewer.

        3. "LGTM" dalam dua menit untuk PR 900 baris

           Itu bukan persetujuan, itu penyerahan. Pecah PR-nya.

        4. Diskusi panjang tentang arah dasar perubahannya

           Terlambat. Diskusi arah terjadi SEBELUM kodenya ditulis,
           bukan saat sudah ada 600 baris yang harus dibuang bila
           arahnya berubah.
        `,
      ),
      p(
        'Pemeriksaan otomatis menghapus seluruh kategori kedua, dan waktunya bisa diukur pada project ini sendiri.',
      ),
      code(
        'text',
        `
        Diukur sungguhan pada project ini:

          format:check    3.691 ms
          lint            6.021 ms
          type-check      2.403 ms
          test            7.184 ms
          build          64.834 ms

        Empat pemeriksaan pertama selesai dalam 19,3 detik. Setiap
        komentar review tentang format, impor yang tidak terpakai,
        atau tipe yang salah adalah pekerjaan yang seharusnya
        diselesaikan dalam sembilan belas detik itu, bukan oleh manusia.
        `,
      ),
      p(
        'Sisi reviewer juga punya kesalahan khas, dan yang paling merugikan adalah komentar yang tidak bisa ditindaklanjuti.',
      ),
      code(
        'text',
        `
        TIDAK BISA DITINDAKLANJUTI:
          "ini kurang bagus"
          "kayaknya ada cara yang lebih baik"
          "saya nggak suka pendekatan ini"

        BISA DITINDAKLANJUTI:
          "Query ini berjalan di dalam perulangan, jadi jumlahnya
           ikut jumlah pesanan. Bisa diganti satu query dengan
           WHERE id IN (...)?"

          "Kalau kolom ini null, baris 42 akan melempar. Perlu
           penjagaan, atau memang dijamin tidak pernah null?"

        Dan yang membedakan komentar wajib dari saran:
          BLOKIR : "ini harus diubah sebelum digabung, karena ..."
          SARAN  : "nit: ini bisa disederhanakan, tidak menghalangi"

        Menandai keduanya dengan jelas menghemat satu putaran
        percakapan pada hampir setiap PR.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pull request adalah tempat kebiasaan tim paling terlihat, dan kesalahannya jarang berupa satu keputusan besar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengirim PR berisi 900 baris sekaligus',
            'Fiturnya memang satu kesatuan',
            'Reviewer memindai lalu menyetujui. Review yang tidak terjadi terlihat sama dengan yang terjadi',
          ],
          [
            'Menyelipkan perbaikan lain yang ditemukan di jalan',
            'Sekalian, sudah terlanjur buka berkasnya',
            'Membatalkan fiturnya berarti membatalkan perbaikannya juga. Buat PR terpisah',
          ],
          [
            'Menulis deskripsi yang mengulang daftar berkas',
            'Biar reviewer tahu apa yang berubah',
            'Diff sudah menunjukkannya. Yang dibutuhkan adalah kenapa, dan cara mengujinya',
          ],
          [
            'Membiarkan review membahas format dan impor',
            'Memang itu yang terlihat',
            'Diukur, lint dan format selesai dalam 9,7 detik di CI. Jangan pakai waktu manusia untuk itu',
          ],
          [
            'Membiarkan PR menggantung menunggu review',
            'Reviewer-nya sedang sibuk',
            'Setiap hari menambah konflik. PR kecil yang direview cepat lebih murah daripada PR besar yang sempurna',
          ],
          [
            'Menulis komentar review yang tidak bisa ditindaklanjuti',
            'Saya cuma merasa kurang pas',
            'Penulisnya tidak tahu harus mengubah apa. Sebutkan barisnya, akibatnya, dan alternatifnya',
          ],
        ],
      ),
      p(
        'Satu kebiasaan mengubah kualitas review lebih besar daripada aturan apa pun, yaitu penulis PR mereview diff-nya sendiri lebih dulu, di antarmuka yang sama dengan yang akan dipakai reviewer. Membaca perubahan sendiri dalam bentuk diff hampir selalu memunculkan satu atau dua hal yang jelas keliru, dan memperbaikinya sebelum orang lain melihatnya menghemat satu putaran penuh percakapan.',
      ),
      references(
        {
          label: 'About pull requests',
          href: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests',
          source: 'GitHub Docs',
          note: 'Siklus hidup sebuah pull request dari dibuka sampai digabungkan',
        },
        {
          label: 'GitHub flow',
          href: 'https://docs.github.com/en/get-started/using-github/github-flow',
          source: 'GitHub Docs',
          note: 'Tempat pull request di dalam alur kerja secara keseluruhan',
        },
        {
          label: 'Workflow syntax for GitHub Actions',
          href: 'https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax',
          source: 'GitHub Docs',
          note: 'Cara pemeriksaan otomatis dipicu oleh peristiwa pull request',
        },
      ),
    ],
  ),

  written(
    'semver-changelog',
    'Semantic Versioning & Changelog',
    16,
    'Memberi nomor yang berarti, dan catatan yang dibaca orang.',
    [
      terms(
        {
          term: 'Semantic Versioning (SemVer)',
          meaning:
            'Aturan penomoran versi berbentuk `MAYOR.MINOR.PATCH`, misalnya `4.2.1`. Mayor naik saat ada perubahan yang merusak pemakai lama, minor saat ada tambahan yang tetap kompatibel, dan patch saat hanya ada perbaikan. Yang ia janjikan adalah makna, sehingga pembaca tahu risiko menaikkan versi tanpa membaca seluruh diff.',
        },
        {
          term: 'breaking change',
          meaning:
            'Perubahan yang membuat kode pemakai berhenti bekerja tanpa mereka mengubah apa pun, misalnya menghapus fungsi, mengganti nama opsi, atau mengubah bentuk nilai yang dikembalikan. Inilah satu-satunya alasan versi mayor naik.',
        },
        {
          term: 'pre-release',
          meaning:
            'Versi yang ditandai belum stabil dengan akhiran seperti `-alpha.1`, `-beta.2`, atau `-rc.1`. Menurut aturan SemVer, versi seperti ini berperingkat lebih rendah daripada versi rilis dengan angka yang sama, dan tidak ikut terpasang oleh rentang versi biasa.',
        },
        {
          term: 'rentang versi (version range)',
          meaning:
            'Cara menyatakan versi mana saja yang diterima, misalnya `^4.2.1` yang menerima pembaruan minor dan patch tetapi menolak mayor, dan `~4.2.1` yang hanya menerima patch. Tanda `^` dibaca *caret*.',
        },
        {
          term: 'lockfile',
          meaning:
            'Berkas yang mencatat versi persis setiap dependensi yang benar-benar terpasang, misalnya `package-lock.json`. Fungsinya memastikan semua orang dan semua mesin CI memasang pohon dependensi yang identik, sebab rentang versi saja bisa menghasilkan hasil berbeda pada waktu berbeda.',
        },
        {
          term: 'changelog',
          meaning:
            'Catatan perubahan per versi yang ditulis untuk manusia, bukan salinan `git log`. Isi yang berguna adalah yang menyebut apa yang berubah bagi pemakai, apa yang rusak, dan apa yang harus mereka lakukan.',
        },
        {
          term: 'tag',
          meaning:
            'Penanda permanen pada sebuah commit, biasanya bernama seperti `v4.2.1`, yang dipakai untuk menandai titik rilis. Berbeda dari branch, tag tidak bergerak maju.',
        },
        {
          term: 'deprecation',
          meaning:
            'Pengumuman bahwa sesuatu masih bekerja tetapi akan dihapus, disertai penggantinya dan tenggat kapan penghapusannya terjadi. Melewati tahap ini dan langsung menghapus adalah cara tercepat merusak kepercayaan pemakai.',
        },
      ),

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
      h2('Studi kasus di project nyata'),
      p(
        'Semantic Versioning adalah janji, bukan penomoran. Angkanya memberi tahu pemakai apa yang harus ia lakukan sebelum menaikkan versi, dan itulah seluruh nilainya.',
      ),
      table(
        ['Naik', 'Artinya', 'Yang harus dilakukan pemakai'],
        [
          [
            'PATCH  1.4.2 → 1.4.3',
            'Perbaikan yang tidak mengubah kontrak',
            'Naikkan, jalankan test',
          ],
          [
            'MINOR  1.4.3 → 1.5.0',
            'Kemampuan baru, yang lama tetap bekerja',
            'Naikkan, tidak ada yang perlu diubah',
          ],
          [
            'MAJOR  1.5.0 → 2.0.0',
            'Ada yang dibuang atau berubah bentuk',
            'Baca catatan migrasi, ubah kode, uji',
          ],
        ],
      ),
      p(
        'Yang menentukan bukan seberapa besar perubahan di dalam melainkan **apakah pemakai harus mengubah sesuatu**. Perbaikan satu karakter yang mengubah bentuk respons adalah MAJOR, sementara penulisan ulang seluruh modul yang kontraknya persis sama adalah PATCH.',
      ),
      code(
        'text',
        `
        Yang sering disalahkategorikan:

          menghapus satu field dari respons JSON
            -> MAJOR. Klien yang membacanya rusak.

          menambah field baru ke respons JSON
            -> MINOR. Klien lama mengabaikannya.

          mengubah tipe field dari number menjadi string
            -> MAJOR, meski nilainya "sama".
               Diukur di bab Desain API: klien uji sederhana TIDAK
               rusak, dan klien yang membandingkan id === 42 rusak
               seketika. "Tidak merusak klien uji saya" bukan bukti.

          memperketat validasi yang tadinya longgar
            -> MAJOR. Permintaan yang dulu diterima kini ditolak.

          memperbaiki bug yang perilakunya sudah diandalkan orang
            -> MAJOR, meski itu memang bug.
        `,
        {
          caption:
            'Baris terakhir yang paling sering diperdebatkan, dan pertanyaannya tetap sama: apakah pemakai harus mengubah sesuatu.',
        },
      ),
      p('Changelog adalah sisi manusia dari nomor itu, dan bedanya dengan `git log` sangat tegas.'),
      code(
        'text',
        `
        git log    = apa yang DILAKUKAN pengembang
        changelog  = apa yang BERUBAH bagi pemakai

        Yang masuk git log, TIDAK masuk changelog:
          refactor internal, perbaikan format, penyesuaian test,
          pembaruan dependency yang tidak terlihat pemakai

        Yang masuk changelog:
          kemampuan baru, perbaikan yang pernah dirasakan pemakai,
          perubahan yang menuntut tindakan, dan yang dihapus
        `,
      ),
      code(
        'text',
        `
        ## [2.0.0] - 2026-09-14

        ### Berubah dan menuntut tindakan
        - Respons \`GET /v1/pengguna\` tidak lagi memuat \`namaLengkap\`.
          Gantinya \`nama\` dan \`namaBelakang\`.
          Migrasi: ganti \`u.namaLengkap\` menjadi \`\${u.nama} \${u.namaBelakang}\`.
        - Batas unggahan turun dari 50 MB menjadi 10 MB.

        ### Ditambahkan
        - Endpoint \`POST /v1/pengguna/ekspor\` mengembalikan 202 dan
          id job yang bisa dipantau.

        ### Diperbaiki
        - Mengubah sandi kini mencabut sesi di perangkat lain (#482).

        ### Dihapus
        - Endpoint \`GET /v1/users\` yang sudah ditandai usang sejak 1.3.0.
        `,
        {
          caption:
            'Baris migrasi pada bagian pertama itu yang membedakan changelog yang berguna dari daftar perubahan.',
        },
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan penomoran versi menghasilkan gejala yang muncul di sisi pemakai, bukan di sisimu, dan itulah yang membuatnya terlambat diketahui.',
      ),
      code(
        'text',
        `
        1. Perubahan yang memutus dirilis sebagai PATCH

           Pemakai memasang ^1.4.0, jadi 1.4.3 terpasang OTOMATIS.
           Aplikasi mereka rusak tanpa ada yang mengubah apa pun.

           Bentuk yang terlihat di sisi mereka:
             TypeError: Cannot read properties of undefined (reading 'split')
             karena u.namaLengkap kini undefined

        2. Rentang versi yang terlalu longgar

           "paket": "*"        <- versi apa pun, termasuk MAJOR berikutnya
           "paket": "latest"   <- sama saja
           "paket": "^1.4.0"   <- sampai sebelum 2.0.0, ini yang lazim
           "paket": "1.4.0"    <- tepat itu saja

           Yang pertama dan kedua membuat build yang kemarin hijau
           menjadi merah hari ini tanpa satu baris pun berubah.

        3. Versi 0.x diperlakukan seperti 1.x

           Pada SemVer, 0.x TIDAK menjanjikan kestabilan apa pun.
           0.3.0 boleh memutus 0.2.0. Menaikkan ke 1.0.0 adalah
           pernyataan bahwa kontraknya kini dijaga.
        `,
      ),
      p('Pada changelog, kegagalannya berbeda bentuk, yaitu berhenti diperbarui.'),
      code(
        'text',
        `
        Changelog yang ditulis manual setelah rilis hampir selalu
        berhenti pada rilis keempat atau kelima. Sebabnya sederhana:
        menulisnya terjadi ketika orangnya sudah lelah dan ingin
        segera selesai.

        Yang menutupnya: hasilkan dari pesan commit, sehingga
        menulisnya terjadi saat commit dibuat, bukan saat rilis.

        Dan di situ bentuk pesan commit menjadi penting:

          feat(api)!: hapus field namaLengkap dari respons

          BREAKING CHANGE: field namaLengkap diganti nama dan
          namaBelakang. Klien yang membacanya harus diperbarui.

        Tanda ! dan blok BREAKING CHANGE itulah yang membuat alat
        menaikkan angka MAJOR dan menempatkannya di bagian yang benar.
        `,
      ),
      code(
        'text',
        `
        KEGAGALAN DIAM pada alat penghasil changelog:

          fix : perbaiki sesuatu      <- spasi sebelum titik dua
          Fix: perbaiki sesuatu       <- huruf besar
          fixed: perbaiki sesuatu     <- tipe tidak dikenal

        Ketiganya tidak dikenali, commit-nya TIDAK MUNCUL di changelog,
        dan tidak ada satu pun pesan error. Ketahuan setelah rilis,
        saat seseorang bertanya kenapa perbaikannya tidak tercatat.

        Yang menutupnya: pemeriksaan bentuk pesan commit di CI, atau
        hook commit-msg lokal.
        `,
      ),
      p('Satu hal terakhir menyangkut tag git, dan ia sering luput sampai dibutuhkan.'),
      code(
        'text',
        `
          git tag -a v2.0.0 -m "Rilis 2.0.0"     tag beranotasi
          git tag v2.0.0                          tag ringan

        Tag beranotasi menyimpan penulis, tanggal, dan pesan, serta
        bisa ditandatangani. Tag ringan hanya penunjuk. Untuk rilis,
        pakai yang beranotasi.

        Dan tag TIDAK ikut terkirim otomatis:
          git push                 <- tag tidak ikut
          git push --follow-tags   <- tag beranotasi ikut

        Rilis yang tag-nya tidak pernah di-push adalah rilis yang
        tidak bisa ditemukan siapa pun selain di mesinmu.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Penomoran versi terasa seperti urusan administratif sampai ada orang lain yang benar-benar memakai kodemu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaikkan MAJOR karena perubahannya besar',
            'Perubahannya memang besar',
            'Yang menentukan bukan besarnya melainkan apakah pemakai harus mengubah sesuatu',
          ],
          [
            'Merilis perubahan yang memutus sebagai PATCH',
            'Cuma satu field yang dihapus',
            'Pemakai dengan `^1.4.0` menerimanya otomatis. Aplikasi mereka rusak tanpa mereka mengubah apa pun',
          ],
          [
            'Memakai `*` atau `latest` untuk dependency',
            'Biar selalu terbaru',
            'Build yang kemarin hijau menjadi merah hari ini tanpa satu baris pun berubah',
          ],
          [
            'Menganggap `0.x` menjanjikan kestabilan',
            'Kan sudah dirilis',
            'SemVer menyatakan `0.x` tidak menjanjikan apa pun. `0.3.0` boleh memutus `0.2.0`',
          ],
          [
            'Menulis changelog manual setelah rilis',
            'Nanti ditulis sekalian',
            'Berhenti diperbarui pada rilis keempat atau kelima. Hasilkan dari pesan commit',
          ],
          [
            'Membuat tag tanpa mendorongnya',
            '`git push` kan sudah dijalankan',
            'Tag tidak ikut otomatis. Pakai `--follow-tags`, atau rilisnya tidak ada di mana pun selain mesinmu',
          ],
        ],
      ),
      p(
        'Nilai sesungguhnya dari seluruh disiplin ini baru terasa dari sisi sebaliknya. Ketika kamu yang menjadi pemakai sebuah pustaka dan harus memutuskan apakah aman menaikkan versinya, satu-satunya yang kamu punya adalah nomor versi dan changelog yang ditulis orang lain. Menulis keduanya dengan benar adalah hal yang kamu harap dilakukan setiap orang yang kodenya kamu pakai.',
      ),
      references(
        {
          label: 'About semantic versioning',
          href: 'https://docs.npmjs.com/about-semantic-versioning',
          source: 'npm Docs',
          note: 'Arti tiap bagian nomor versi beserta rentang yang lazim dipakai',
        },
        {
          label: 'npm version',
          href: 'https://docs.npmjs.com/cli/v11/commands/npm-version',
          source: 'npm Docs',
          note: 'Perintah yang menaikkan versi sekaligus membuat commit dan tag-nya',
        },
        {
          label: 'git-tag',
          href: 'https://git-scm.com/docs/git-tag',
          source: 'Git',
          note: 'Beda tag ringan dan tag beranotasi, serta kapan masing-masing dipakai',
        },
      ),
    ],
  ),
];
