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
      callout(
        'danger',
        'Jangan pernah force-push ke branch bersama',
        'Setiap orang yang sudah menarik commit itu akan mengalami riwayat yang bercabang, dan cara "memperbaikinya" yang paling umum — reset ke remote — justru membuang pekerjaan lokal mereka. Kalau benar-benar terpaksa, pakai `--force-with-lease`, yang menolak kalau ada yang mendorong sesudahmu.',
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

      h2('Conventional Commits'),
      code(
        'text',
        `
        <tipe>(<cakupan>): <ringkasan>

        <isi — kenapa, bukan apa>

        <catatan kaki>
        `,
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
        - [ ] Ada tes untuk jalur gagal, bukan hanya sukses
        - [ ] Endpoint baru punya pemeriksaan otorisasi
        - [ ] Tidak ada rahasia, \`console.log\`, atau berkas yang tidak sengaja ikut
        - [ ] Dokumentasi diperbarui kalau perilakunya berubah
        `,
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
      callout(
        'warning',
        'Tag bisa dipindahkan; itu sebabnya deploy sebaiknya menyebut SHA',
        'Untuk rilis internal, catat SHA commit yang benar-benar di-deploy. Tag `v2.0.0` yang dipindahkan diam-diam berarti "versi 2.0.0" di produksi bukan lagi kode yang sama dengan yang kamu uji.',
      ),

      h2('Aplikasi web tidak selalu butuh versi formal'),
      p(
        'Untuk aplikasi yang di-deploy terus-menerus dan tidak punya klien eksternal, SemVer sering berlebihan. Yang tetap berguna: **changelog** yang bisa dibaca, dan **catatan SHA** yang sedang berjalan di produksi. Yang tidak boleh dilewati: API publik dan library — keduanya punya klien yang tidak bisa kamu deploy ulang.',
      ),
    ],
  ),
];
