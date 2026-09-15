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
 * Keamanan Fullstack — Chapter 2, seven lessons.
 *
 * The seven identity and authority patterns from `.claude/rules/security-patterns.md`:
 * password hashing, brute-force protection, JWT, token expiry & rotation, MFA, OAuth 2.0,
 * and least privilege.
 *
 * `backend-basic/auth-dasar` already teaches how to make each of these work. This chapter
 * deliberately takes the other view: how to get them right, and which quiet mistake undoes
 * each one. Every lesson links back to its basic counterpart in the opening paragraph.
 */
export const lessons: LessonDraft[] = [
  written(
    'password-hashing',
    'Menyimpan Password dengan Benar',
    19,
    'Satu-satunya cara membuat database yang dicuri tetap tidak membocorkan password.',
    [
      p(
        'Cara memanggil bcrypt sudah dibahas di sub-bab [Hashing Password](/kelas/backend-basic/auth-dasar/hashing-password). Sub-bab ini menjawab pertanyaan yang berbeda, yaitu kenapa algoritmanya harus yang itu dan bukan yang lain, dan kesalahan apa yang membuat hashing yang terlihat benar sebenarnya sudah usang.',
      ),
      p(
        'Titik berangkatnya satu asumsi yang tidak nyaman, yaitu **anggap saja database-mu suatu hari akan dicuri**. Kalau asumsi itu diterima, pertanyaannya berubah dari bagaimana mencegah pencurian menjadi bagaimana membuat isi curian itu tidak berguna.',
      ),

      terms(
        {
          term: 'hash',
          meaning:
            'Fungsi satu arah yang mengubah teks apa pun menjadi nilai berukuran tetap. Disebut satu arah karena dari hasilnya tidak ada jalan matematis untuk kembali ke masukannya. Password disimpan sebagai hash supaya nilai aslinya tidak pernah ada di database.',
        },
        {
          term: 'salt',
          meaning:
            'Nilai acak yang berbeda untuk setiap password, dicampurkan sebelum di-hash. Gunanya membuat dua orang dengan password sama menghasilkan hash berbeda, sehingga penyerang tidak bisa menebak sekali lalu memakai hasilnya untuk banyak akun. Algoritma modern membuat dan menyimpan salt secara otomatis di dalam string hasilnya.',
        },
        {
          term: 'fungsi hash adaptif',
          meaning:
            'Fungsi hash yang **sengaja dibuat lambat**, dan tingkat kelambatannya bisa dinaikkan. Sifat ini terdengar aneh sampai kamu sadar bahwa penyerang menebak miliaran kali. Kelambatan yang tidak terasa bagi satu login sah menjadi penghalang besar bagi penebakan massal.',
        },
        {
          term: 'cost factor',
          meaning:
            'Angka yang menentukan seberapa berat kerja sebuah fungsi hash adaptif. Di bcrypt namanya rounds, dan menaikkannya satu angka berarti melipatduakan waktunya. Angka ini harus ditinjau berkala, karena perangkat keras terus menjadi lebih cepat sementara angka di kodemu diam saja.',
        },
        {
          term: 'argon2id',
          meaning:
            'Algoritma hashing password pemenang kompetisi Password Hashing Competition, dan pilihan pertama yang dianjurkan sekarang. Selain lambat, ia juga menuntut banyak memori, yang membuat serangan memakai kartu grafis atau perangkat khusus jauh lebih mahal.',
        },
        {
          term: 'rainbow table',
          meaning:
            'Tabel raksasa berisi pasangan password dan hash-nya yang sudah dihitung sebelumnya. Menjadikan pencarian password dari hash secepat mencari kata di kamus. Salt membuat tabel semacam ini tidak berguna, karena tabelnya harus dibuat ulang untuk setiap salt.',
        },
        {
          term: 'timing attack',
          meaning:
            'Serangan yang menyimpulkan isi rahasia dari **lama waktu** sebuah pemeriksaan, bukan dari hasilnya. Perbandingan string biasa berhenti pada karakter pertama yang berbeda, sehingga waktunya sedikit berbeda tergantung berapa karakter awal yang sudah benar.',
        },
        {
          term: 'rehash saat login',
          meaning:
            'Kebiasaan memeriksa apakah hash yang tersimpan masih memakai parameter terkini, lalu menghitung ulang dengan parameter baru bila ternyata sudah usang. Dilakukan tepat setelah login berhasil, karena hanya pada saat itulah password aslinya ada di tangan untuk sesaat.',
        },
        {
          term: 'pepper',
          meaning:
            'Nilai rahasia tambahan yang sama untuk seluruh pengguna, disimpan **di luar database**, misalnya di environment atau vault. Berbeda dari salt yang unik per pengguna dan boleh diketahui. Gunanya membuat database yang dicuri tanpa disertai bocornya server tetap tidak bisa ditebak isinya.',
        },
      ),

      h2('Kenapa hash biasa tidak cukup'),
      p(
        'Godaan pertama biasanya memakai SHA-256, karena namanya terdengar kuat dan memang benar kuat untuk tugas lain seperti memeriksa keutuhan berkas. Untuk password, justru kekuatannya yang salah tempat.',
      ),
      table(
        [
          'Algoritma',
          'Perkiraan tebakan per detik dengan perangkat khusus',
          'Layak untuk password?',
        ],
        [
          ['MD5', 'Puluhan miliar', 'Tidak, sudah lama dianggap rusak'],
          ['SHA-256 tanpa salt', 'Miliaran', 'Tidak'],
          ['SHA-256 dengan salt', 'Miliaran', 'Tidak, salt tidak membuatnya lambat'],
          ['bcrypt cost 12', 'Puluhan ribu', 'Ya'],
          ['argon2id parameter dianjurkan', 'Ribuan', 'Ya, pilihan pertama'],
        ],
        'Angkanya berubah seiring perangkat keras, tetapi jarak antar barisnya tetap sama besar.',
      ),
      p(
        'Perhatikan baris ketiga, karena di situlah salah paham paling umum berada. Menambahkan salt pada SHA-256 memang mematikan rainbow table, tetapi ia sama sekali tidak membuat perhitungannya lebih lambat. Penyerang yang sudah memegang salt bisa tetap menebak miliaran kali per detik, hanya sekarang ia harus melakukannya per akun.',
      ),
      p(
        'Selisihnya menjadi mudah dirasakan bila diubah menjadi waktu. Ambil satu password yang lumayan, yaitu delapan karakter campuran huruf besar kecil dan angka, yang punya sekitar dua ratus delapan belas triliun kemungkinan. Pada laju satu miliar tebakan per detik, seluruh kemungkinan itu habis dalam waktu sekitar dua setengah hari.',
      ),
      p(
        'Sekarang ganti fungsinya dengan bcrypt cost 12 yang menghasilkan sekitar sepuluh ribu tebakan per detik pada perangkat yang sama. Angka dua ratus delapan belas triliun tadi kini menuntut waktu ratusan ribu tahun. Password-nya tidak berubah sedikit pun, penyerangnya memakai perangkat yang sama, dan yang berbeda hanya nama fungsi yang dipanggil satu baris di kodemu.',
      ),
      p(
        'Perlu ditambahkan bahwa angka-angka itu berlaku untuk penebakan menyeluruh. Penyerang sungguhan hampir tidak pernah melakukannya, sebab ia mencoba daftar password yang paling sering dipakai lebih dulu. Di situlah fungsi lambat menolong sekali lagi, karena daftar sepuluh juta password umum yang habis dalam sepuluh detik pada SHA-256 menuntut waktu belasan hari pada bcrypt cost 12.',
      ),
      p(
        'Jarak antara baris ketiga dan kelima adalah inti seluruh sub-bab ini. Selisih dari miliaran ke ribuan berarti serangan yang tadinya selesai dalam hitungan jam berubah menjadi hitungan ratusan tahun, dan perubahan itu didapat hanya dengan mengganti nama fungsi yang dipanggil.',
      ),

      h2('Menulisnya dengan benar'),
      code(
        'ts',
        `
        import argon2 from 'argon2';

        // Parameter mengikuti anjuran OWASP, ditulis di satu tempat agar mudah ditinjau.
        const PARAMETER = {
          type: argon2.argon2id,
          memoryCost: 19456, // 19 MiB
          timeCost: 2,
          parallelism: 1,
        };

        export async function simpanPassword(teks: string): Promise<string> {
          return argon2.hash(teks, PARAMETER);
        }

        export async function periksaPassword(
          teks: string,
          tersimpan: string,
        ): Promise<{ cocok: boolean; perluRehash: boolean }> {
          const cocok = await argon2.verify(tersimpan, teks);
          return { cocok, perluRehash: cocok && argon2.needsRehash(tersimpan, PARAMETER) };
        }
        `,
        { filename: 'server/password.ts' },
      ),
      p(
        'Perhatikan tidak ada satu baris pun yang mengurus salt, padahal salt tetap dipakai. Library ini membuat salt acak sendiri lalu menyimpannya di dalam string hasil, bersama nama algoritma dan seluruh parameternya. Karena itu `argon2.verify` cukup diberi string tersimpan tanpa perlu kamu simpan salt di kolom terpisah.',
      ),
      p(
        'Objek `PARAMETER` sengaja diangkat menjadi konstanta di satu tempat, dan bentuk itu yang membuat langkah berikutnya mungkin. Fungsi `needsRehash` membandingkan parameter yang tertanam di string tersimpan dengan parameter yang berlaku sekarang, lalu memberitahumu apakah hash itu sudah ketinggalan zaman.',
      ),
      code(
        'text',
        `
        $argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG

        |--------| |----| |---------------| |--------| |---------------------------|
         algoritma  versi     parameter        salt              hash
        `,
        { caption: 'Satu string tersimpan, memuat lima informasi sekaligus.' },
      ),
      p(
        'Membaca string tersimpan ini menjelaskan kenapa kamu tidak perlu kolom salt terpisah dan tidak perlu mencatat parameter yang dipakai. Semuanya sudah ada di dalam string itu sendiri, dipisahkan tanda dolar. Bagian `m=19456,t=2,p=1` adalah parameter yang berlaku saat hash itu dibuat, dan bagian itulah yang dibandingkan `needsRehash` dengan parameter yang berlaku sekarang.',
      ),
      p(
        'Bentuk ini juga yang membuat perpindahan algoritma bisa berjalan bertahap tanpa memaksa siapa pun mengganti password. Baris yang diawali `$2b$` adalah bcrypt lama, dan baris yang diawali `$argon2id$` adalah yang baru. Fungsi verifikasi membaca awalannya lalu memilih sendiri cara memeriksanya, sehingga kedua bentuk bisa hidup berdampingan di satu tabel selama masa peralihan.',
      ),
      p(
        'Nilai `memoryCost: 19456` adalah yang membedakan argon2 dari bcrypt. Angka itu berarti setiap perhitungan menuntut sekitar 19 megabita memori. Penyerang yang ingin menjalankan ribuan perhitungan sekaligus di kartu grafis harus menyediakan memori sebanyak itu dikali ribuan, dan kebutuhan memori jauh lebih mahal dipenuhi daripada kebutuhan kecepatan.',
      ),

      h2('Rehash saat login, langkah yang paling sering dilupakan'),
      code(
        'ts',
        `
        const pengguna = await db.pengguna.findUnique({ where: { email } });

        // Selalu jalankan verifikasi meski penggunanya tidak ada, agar waktunya seragam.
        const acuan = pengguna?.hashPassword ?? HASH_UMPAN;
        const { cocok, perluRehash } = await periksaPassword(password, acuan);

        if (!pengguna || !cocok) {
          return res.status(401).json({ pesan: 'Email atau password salah' });
        }

        if (perluRehash) {
          await db.pengguna.update({
            where: { id: pengguna.id },
            data: { hashPassword: await simpanPassword(password) },
          });
        }
        `,
      ),
      p(
        'Blok `if (perluRehash)` menjawab masalah yang tidak terlihat sampai bertahun-tahun kemudian. Ketika kamu menaikkan cost factor, hash lama **tidak ikut berubah**, sehingga akun lama tetap terlindung dengan parameter zaman dulu. Menghitung ulang saat login adalah satu-satunya kesempatan melakukannya, sebab hanya pada saat itu password aslinya tersedia sesaat di memori.',
      ),
      p(
        'Bayangkan aplikasi yang mulai berjalan pada 2019 dengan bcrypt cost 10, lalu dinaikkan menjadi cost 12 pada 2023. Tanpa rehash saat login, akun yang dibuat pada 2019 dan tidak pernah mengganti password masih terlindung dengan parameter 2019 sampai hari ini. Justru akun lama seperti itu yang biasanya paling berharga, sebab ia sudah lama terkumpul datanya.',
      ),
      p(
        'Dengan rehash saat login, perbaikan itu menyebar sendiri tanpa satu pun pengguna menyadarinya. Setiap orang yang masuk akan otomatis naik ke parameter terbaru, dan sesudah beberapa bulan hampir seluruh basis pengguna sudah berpindah. Yang tersisa hanya akun yang benar-benar tidak pernah dipakai lagi, dan akun seperti itu memang layak ditinjau tersendiri.',
      ),
      p(
        'Baris `const acuan = pengguna?.hashPassword ?? HASH_UMPAN` menutup celah yang berbeda, yaitu enumerasi akun lewat waktu. Tanpa baris itu, permintaan dengan email tidak terdaftar akan dijawab seketika, sedangkan email terdaftar butuh waktu untuk verifikasi hash. Perbedaan waktu itu cukup untuk memetakan siapa saja yang punya akun di layananmu.',
      ),
      p(
        'Pesan `Email atau password salah` juga bagian dari pertahanan yang sama, bukan sekadar pilihan kata. Pesan yang membedakan email tidak terdaftar dari password salah memberi tahu penyerang bahwa ia sudah menemukan setengah jawabannya, dan tinggal menebak setengah sisanya.',
      ),

      h2('Kesalahan yang membatalkan hashing yang terlihat benar'),
      table(
        ['Kesalahan', 'Kenapa terjadi', 'Akibatnya'],
        [
          [
            'Membuat skema sendiri, misalnya SHA-256 tiga kali plus salt',
            'Terasa lebih pintar dan lebih terkendali',
            'Tetap cepat dihitung, jadi tetap mudah ditebak massal',
          ],
          [
            'Cost factor tidak pernah ditinjau ulang',
            'Diatur sekali saat proyek dimulai lalu dilupakan',
            'Perlindungannya menipis diam-diam seiring perangkat keras menjadi cepat',
          ],
          [
            'Membatasi panjang password secara berlebihan',
            'Meniru aturan lama atau menyesuaikan lebar kolom',
            'Menghapus keuntungan terbesar pengguna, yaitu passphrase panjang',
          ],
          [
            'Mengembalikan kolom hash di respons API',
            'Mengirim seluruh baris pengguna apa adanya',
            'Hash bocor sehingga penebakan bisa dilakukan tanpa menyentuh sistemmu lagi',
          ],
          [
            'Memakai perbandingan biasa untuk token',
            'Terlihat sama saja dengan perbandingan lain',
            'Membuka timing attack pada token reset dan kunci API',
          ],
        ],
      ),
      p(
        'Baris keempat sering lolos dari tinjauan karena bentuknya tidak terlihat seperti kebocoran. Endpoint yang mengembalikan `db.pengguna.findUnique(...)` apa adanya akan ikut mengirim kolom `hashPassword`, dan tidak ada pesan error apa pun yang muncul. Pilih kolom secara eksplisit dengan `select`, jangan mengandalkan ingatan untuk menghapus kolom sensitif satu per satu.',
      ),
      code(
        'diff',
        `
        - const pengguna = await db.pengguna.findUnique({ where: { id } });
        - res.json(pengguna);
        + const pengguna = await db.pengguna.findUnique({
        +   where: { id },
        +   select: { id: true, nama: true, email: true, peran: true },
        + });
        + res.json(pengguna);
        `,
      ),
      p(
        'Dua baris yang dihapus adalah bentuk yang paling sering ditulis karena paling ringkas, dan keduanya mengirim seluruh kolom tabel ke klien. Yang ikut terkirim biasanya `hashPassword`, penanda verifikasi email, rahasia TOTP, dan kolom internal apa pun yang ditambahkan migrasi berikutnya.',
      ),
      p(
        'Perhatikan bentuk penggantinya menyebut kolom yang boleh keluar, bukan menghapus kolom yang tidak boleh. Perbedaan arah itu penting, sebab kolom baru yang ditambahkan enam bulan lagi tidak akan otomatis ikut terkirim. Bentuk yang menghapus kolom terlarang satu per satu selalu tertinggal dari perubahan skema.',
      ),
      code(
        'ts',
        `
        import { timingSafeEqual } from 'node:crypto';

        export function bandingkanRahasia(a: string, b: string): boolean {
          const bufA = Buffer.from(a);
          const bufB = Buffer.from(b);
          if (bufA.length !== bufB.length) return false;
          return timingSafeEqual(bufA, bufB);
        }
        `,
      ),
      p(
        'Fungsi ini dipakai untuk token reset password, kunci API, dan token CSRF, yaitu rahasia yang disimpan apa adanya dan dibandingkan langsung. Password tidak memerlukannya karena `argon2.verify` sudah menangani sendiri urusan waktu ini di dalam library-nya.',
      ),
      callout(
        'warning',
        'Perbandingan biasa membocorkan informasi lewat waktu',
        'Operator sama dengan berhenti pada perbedaan pertama, sehingga token yang tiga karakter awalnya benar diperiksa sedikit lebih lama daripada yang salah sejak awal. Selisihnya sangat kecil, tetapi bisa diukur dengan pengulangan yang cukup banyak, dan token akhirnya bisa ditebak karakter demi karakter.',
      ),

      h2('Di Laravel'),
      code(
        'php',
        `
        // config/hashing.php memilih driver dan parameternya.
        'driver' => 'argon2id',

        // Menyimpan.
        $pengguna->password = Hash::make($request->password);

        // Memeriksa, lalu rehash bila parameternya sudah usang.
        if (Hash::check($request->password, $pengguna->password)) {
            if (Hash::needsRehash($pengguna->password)) {
                $pengguna->password = Hash::make($request->password);
                $pengguna->save();
            }
        }
        `,
      ),
      p(
        'Bentuknya sama persis dengan versi Node, hanya namanya berbeda. `Hash::needsRehash` membaca parameter yang tertanam di string tersimpan lalu membandingkannya dengan isi `config/hashing.php`. Karena itu menaikkan keamanan seluruh pengguna cukup dilakukan dengan mengubah satu berkas konfigurasi, dan sisanya berjalan sendiri saat pengguna login berikutnya.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Menyimpan sandi adalah satu-satunya bagian aplikasi yang harus dirancang dengan asumsi bahwa basis datanya **akan** bocor. Bila asumsi itu tidak dipakai, pilihan algoritmanya hampir pasti salah.',
      ),
      p(
        'Selisih antara pilihan yang salah dan yang benar bukan persentase melainkan kelipatan, dan itu bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan PHP 8.3.6 di mesin ini:

          sha256          : 2.395.136 tebakan / detik
          bcrypt cost=10  :        20,0 tebakan / detik
          bcrypt cost=12  :         5,0 tebakan / detik

        sha256 vs bcrypt cost=12 -> 479.027 kali lebih cepat.

        Artinya, bila basis datamu bocor dan penyerang mencoba daftar
        sepuluh juta sandi yang paling umum:
          dengan sha256          : selesai dalam sekitar 4 detik
          dengan bcrypt cost=12  : butuh sekitar 23 hari
        `,
        { caption: 'Angkanya mesin-spesifik. Yang tidak berubah adalah urutan besarannya.' },
      ),
      p(
        'Kecepatan adalah sifat yang diinginkan dari hash tujuan umum, dan persis itulah yang membuatnya salah untuk sandi. Algoritma sandi dirancang **lambat dengan sengaja**, dan biayanya bisa dinaikkan seiring perangkat keras menjadi lebih cepat.',
      ),
      p('Alasan kedua adalah garam, dan efeknya terlihat langsung.'),
      code(
        'text',
        `
        Dua pengguna berbeda dengan sandi yang sama persis:

          sha256("rahasia123") Ana  : bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2
          sha256("rahasia123") Budi : bee5688aea66a47460b19c76f8f199c6b9585eb726f8322b1429793863609ca2
                                      ^ IDENTIK

          bcrypt Ana  : $2y$08$VoQiCHaXFg/3QyxEurkYk.YsKSuSGBgtPaMV/Ic17y0q61isLCype
          bcrypt Budi : $2y$08$BU3zOAAsEpa8mKxdfpdEw.h18NVVR6W.w5oTMADJKW5VUw/.JoSW.
                              ^ garam berbeda, hash berbeda

        Hash identik memberi tahu penyerang bahwa keduanya memakai
        sandi yang sama, dan satu kali pecah membuka dua akun sekaligus.
        `,
      ),
      p(
        'Bentuk hash bcrypt sendiri layak dibaca, sebab ia menyimpan semua yang dibutuhkan untuk memverifikasi ulang.',
      ),
      code(
        'text',
        `
        $2y$12$VoQiCHaXFg/3QyxEurkYk.YsKSuSGBgtPaMV/Ic17y0q61isLCype
        └┬┘ └┬┘ └───────────┬──────────┘└──────────┬─────────────────┘
         │   │              │                      └ hash
         │   │              └ garam, 22 karakter
         │   └ cost, yaitu 2^12 putaran
         └ varian algoritma

        Karena cost dan garam ikut tersimpan, verifikasi tidak perlu
        kolom tambahan, dan menaikkan cost tidak merusak hash lama.
        `,
      ),
      code(
        'php',
        `
        // Saat login berhasil, naikkan biayanya bila perlu.
        if (password_verify($sandi, $baris['sandi_hash'])) {
            if (password_needs_rehash($baris['sandi_hash'], PASSWORD_BCRYPT, ['cost' => 12])) {
                // Ini satu-satunya momen sandi mentahnya ada di memori,
                // jadi satu-satunya momen ia bisa di-hash ulang tanpa
                // mengganggu pengguna sama sekali.
                simpanHash($baris['id'], password_hash($sandi, PASSWORD_BCRYPT, ['cost' => 12]));
            }
            masuk($baris['id']);
        }

        // Diuji sungguhan pada PHP 8.3.6:
        //   needs_rehash(hash cost=8,  target 12) -> true
        //   needs_rehash(hash cost=12, target 12) -> false
        //   algoritma tersedia: bcrypt, argon2i, argon2id (ketiganya ada)
        `,
      ),
      p(
        'Letak pemanggilannya yang menentukan, bukan fungsinya. Sandi mentah hanya ada di memori pada satu momen, yaitu tepat sesudah pengguna berhasil masuk, dan itulah satu-satunya kesempatan menaikkan biaya hash tanpa meminta apa pun dari pengguna. Melewatkan momen itu berarti akun lama tetap memakai biaya lama selamanya meski setelan barumu sudah lebih ketat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kesalahan di area ini hampir tidak pernah muncul sebagai error, dan beberapa di antaranya justru muncul sebagai fitur yang bekerja terlalu baik.',
      ),
      code(
        'text',
        `
        1. Batas panjang bcrypt

           bcrypt hanya memakai 72 BYTE pertama. Sandi yang lebih panjang
           dipotong diam-diam, sehingga dua sandi yang 72 byte pertamanya
           sama akan dianggap identik.

           Tandanya: pengguna dengan pengelola sandi melaporkan bahwa
           sandi yang salah pun diterima. Menutupnya: hash SHA-256 dulu
           menjadi panjang tetap, baru masukkan ke bcrypt — atau pakai
           argon2id yang tidak punya batas ini.

        2. Kolom terlalu pendek

           VARCHAR(50) untuk hash bcrypt yang panjangnya 60 karakter.
           Basis data memotongnya, dan SETIAP login gagal.

           MySQL mode longgar memotong tanpa error sama sekali.
           Gejalanya: pendaftaran berhasil, login selalu salah.

        3. Sandi dicatat di log

           {"jalur":"/v1/daftar","body":{"surel":"...","sandi":"RahasiaSaya123!"}}
           Hash-nya aman di basis data, dan sandi mentahnya ada di
           berkas log yang dibaca lebih banyak orang.
        `,
      ),
      p(
        'Kesalahan berikutnya berupa aturan sandi yang justru memperlemah keamanannya, dan ini bertentangan dengan kebiasaan lama yang masih banyak diajarkan.',
      ),
      code(
        'text',
        `
        Yang lama diajarkan, dan kini TIDAK direkomendasikan NIST:

          - wajib huruf besar, angka, dan simbol
            -> menghasilkan "Password1!" berulang kali
          - wajib ganti sandi tiap 90 hari
            -> menghasilkan "Password1!", "Password2!", "Password3!"
          - batas maksimal 16 karakter
            -> melarang frasa panjang yang justru jauh lebih kuat

        Yang direkomendasikan:
          - minimal 8 karakter, tanpa aturan komposisi
          - izinkan sampai 64 karakter atau lebih
          - izinkan spasi dan seluruh karakter Unicode
          - TOLAK sandi yang ada di daftar sandi bocor
          - ganti sandi hanya bila ada indikasi kebocoran
        `,
        {
          caption:
            'Aturan komposisi menggeser beban ke pengguna, dan pengguna menjawabnya dengan pola yang mudah ditebak.',
        },
      ),
      p(
        'Poin "tolak sandi yang ada di daftar bocor" adalah yang paling berpengaruh dari seluruh daftar itu, sebab serangan yang nyata hampir selalu memakai daftar sandi dari kebocoran sebelumnya, bukan menebak acak.',
      ),

      h2('Kesalahan umum pemula'),
      p('Kesalahan di sini berupa pilihan yang terlihat setara padahal berbeda ribuan kali lipat.'),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menyimpan sandi dengan `sha256` atau `md5`',
            'Itu kan hash juga',
            'Diukur, sha256 479.027 kali lebih cepat dicoba daripada bcrypt cost=12. Cepat adalah kelemahannya',
          ],
          [
            'Menambah garam sendiri lalu tetap memakai `sha256`',
            'Sudah bergaram, aman',
            'Garam menutup tabel pelangi, bukan kecepatan. Keduanya harus ada, dan `password_hash` memberi keduanya',
          ],
          [
            'Membuat skema hash sendiri',
            'Kombinasinya kan lebih rumit',
            'Kerumitan bukan kekuatan. Pakai `password_hash`, `bcrypt`, atau `argon2id` yang sudah diaudit bertahun-tahun',
          ],
          [
            'Mewajibkan huruf besar, angka, dan simbol',
            'Sandinya jadi lebih kuat',
            'Menghasilkan pola yang mudah ditebak. Yang berpengaruh adalah panjang dan penolakan sandi bocor',
          ],
          [
            'Memaksa ganti sandi berkala',
            'Praktik keamanan yang umum',
            'Menghasilkan urutan yang mudah ditebak. Ganti hanya bila ada indikasi kebocoran',
          ],
          [
            'Memakai `VARCHAR(50)` untuk kolom hash',
            'Hash-nya kan pendek',
            'Hash bcrypt 60 karakter. MySQL mode longgar memotongnya tanpa error, dan setiap login gagal',
          ],
        ],
      ),
      p(
        'Ada satu hal yang sering terlupa justru karena terlalu jelas. Sandi mentah tidak boleh pernah meninggalkan proses yang menerimanya, yang berarti tidak masuk ke log, tidak masuk ke pesan error, tidak masuk ke laporan kesalahan yang dikirim ke layanan pemantauan, dan tidak disimpan sementara di mana pun. Hash yang kuat tidak menolong sama sekali bila nilai aslinya tercatat di berkas lain.',
      ),
      references(
        {
          label: 'Password Storage Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Sumber parameter argon2id yang dipakai di sub-bab ini, beserta alasannya.',
        },
        {
          label: 'A02:2021 — Cryptographic Failures',
          href: 'https://owasp.org/Top10/A02_2021-Cryptographic_Failures/',
          source: 'OWASP',
          note: 'Kategori yang menaungi penyimpanan password yang salah.',
        },
        {
          label: 'crypto.timingSafeEqual()',
          href: 'https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b',
          source: 'Node.js',
          note: 'Perbandingan waktu-konstan bawaan beserta syarat panjang yang sama.',
        },
        {
          label: 'Hashing',
          href: 'https://laravel.com/docs/12.x/hashing',
          source: 'Laravel',
          note: 'Driver argon2id, `needsRehash`, dan konfigurasi parameternya.',
        },
      ),
    ],
  ),

  written(
    'menahan-penebakan',
    'Menahan Penebakan Password',
    19,
    'Hashing melindungi database yang dicuri, ini melindungi pintu depannya.',
    [
      p(
        'Hashing yang benar membuat database curian sulit dipakai. Ia sama sekali tidak menolong ketika penyerang menebak lewat pintu depan, yaitu form login yang memang kamu sediakan untuk umum. Untuk itu dibutuhkan kontrol yang berbeda, dan bentuk dasarnya sudah dibahas di sub-bab [Rate Limit Login](/kelas/backend-basic/auth-dasar/rate-limit-login).',
      ),
      p(
        'Yang ditambahkan di sini adalah bagian yang paling sering salah, yaitu kenapa mengunci akun begitu saja justru membuka celah baru, dan kenapa membatasi per alamat IP saja tidak lagi memadai.',
      ),

      terms(
        {
          term: 'brute force',
          meaning:
            'Menebak password satu per satu sampai ketemu, biasanya dibantu program. Bentuk paling kasar dan paling mudah dideteksi, karena ia menghasilkan banyak kegagalan pada satu akun dalam waktu singkat.',
        },
        {
          term: 'credential stuffing',
          meaning:
            'Memakai pasangan email dan password yang bocor dari layanan lain, lalu mencobanya di layananmu. Sangat efektif karena banyak orang memakai password yang sama di banyak tempat. Sulit dideteksi karena tiap akun mungkin hanya dicoba satu kali, jadi pola kegagalannya tidak menumpuk.',
        },
        {
          term: 'password spraying',
          meaning:
            'Kebalikan dari brute force. Satu password yang sangat umum dicoba ke ribuan akun berbeda. Dirancang khusus untuk lolos dari pembatasan per akun, karena tiap akun hanya menerima satu atau dua percobaan gagal.',
        },
        {
          term: 'rate limiting',
          meaning:
            'Membatasi jumlah permintaan yang diterima dalam satu rentang waktu. Bisa dihitung per alamat IP, per akun, per kunci API, atau kombinasinya. Melebihi batas dijawab dengan status `429 Too Many Requests`.',
        },
        {
          term: 'exponential backoff',
          meaning:
            'Menaikkan jeda tunggu secara berlipat setiap kali gagal, misalnya satu detik, lalu dua, lalu empat. Lebih ramah daripada penguncian karena pengguna sah yang salah ketik hanya menunggu sebentar, sedangkan penebak otomatis menjadi sangat lambat.',
        },
        {
          term: 'account lockout',
          meaning:
            'Mengunci akun sesudah sekian kali gagal. Terdengar paling aman, tetapi punya efek samping serius yang dibahas di bawah, yaitu penyerang bisa sengaja mengunci akun korban.',
        },
        {
          term: 'account enumeration',
          meaning:
            'Menyimpulkan email mana yang terdaftar dari perbedaan perilaku aplikasi, misalnya perbedaan pesan, perbedaan status code, atau perbedaan waktu jawab. Hasilnya adalah daftar sasaran yang valid untuk serangan berikutnya.',
        },
        {
          term: '`429 Too Many Requests`',
          meaning:
            'Status HTTP yang berarti pengirim melampaui batas. Sebaiknya disertai header `Retry-After` yang memberi tahu berapa lama harus menunggu, supaya klien yang jujur bisa mengatur diri alih-alih mencoba terus.',
        },
      ),

      h2('Tiga bentuk serangan yang menuntut jawaban berbeda'),
      table(
        ['Serangan', 'Pola yang terlihat', 'Kontrol yang mempan'],
        [
          ['Brute force', 'Banyak gagal pada satu akun', 'Batas per akun ditambah backoff'],
          [
            'Password spraying',
            'Satu gagal pada banyak akun, sering dari IP yang sama',
            'Batas per IP dan pemantauan kegagalan global',
          ],
          [
            'Credential stuffing',
            'Sedikit gagal, tersebar dari ribuan IP berbeda',
            'MFA, deteksi anomali, dan pemeriksaan password bocor',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah alasan rate limiting saja tidak lagi memadai. Serangan credential stuffing memakai jaringan komputer terinfeksi, sehingga setiap percobaan datang dari alamat IP yang berbeda dan setiap akun hanya dicoba sekali. Dari sudut pandang aturan pembatasan, semuanya terlihat seperti pengguna biasa yang salah ketik.',
      ),
      p(
        'Untuk merasakan skalanya, anggap penyerang memegang jaringan sepuluh ribu komputer terinfeksi dan satu daftar berisi satu juta pasangan email dan password yang bocor dari layanan lain. Ia menyebar percobaannya sehingga tiap komputer hanya mengirim seratus permintaan, dengan jeda beberapa detik di antaranya.',
      ),
      p(
        'Dari sudut pandang aturan pembatasan per IP, tidak satu pun dari sepuluh ribu alamat itu melewati batas. Dari sudut pandang aturan per akun, tiap akun hanya menerima satu percobaan, jadi tidak ada penghitung yang naik. Serangannya berjalan mulus persis karena ia dirancang agar setiap sinyal yang kamu pantau tetap terlihat normal.',
      ),
      p(
        'Sinyal yang tetap terlihat adalah sinyal **agregat**, yaitu jumlah kegagalan login di seluruh aplikasi per satuan waktu. Angka itu biasanya cukup stabil dari hari ke hari, sehingga lonjakan dua atau tiga kali lipat langsung terlihat meski tidak ada satu pun akun atau IP yang melewati batasnya sendiri. Inilah alasan pemantauan di sub-bab 3.5 disebut sebagai kontrol, bukan sekadar pencatatan.',
      ),
      p(
        'Yang benar-benar mempan untuk baris ketiga adalah faktor kedua, yang dibahas di sub-bab 2.5. Password yang benar tidak lagi cukup untuk masuk, sehingga daftar password bocor sebanyak apa pun tidak menolong penyerang.',
      ),

      h2('Kenapa penguncian polos berbahaya'),
      compare(
        {
          title: 'Lockout polos',
          lang: 'text',
          code: `
          5 kali gagal -> akun dikunci 30 menit
          `,
          notes: [
            'Penyerang bisa mengunci akun siapa pun dengan sengaja gagal lima kali.',
            'Berubah menjadi alat serangan penolakan layanan.',
            'Beban pindah ke tim dukungan yang harus membuka kunci.',
          ],
        },
        {
          title: 'Backoff plus batas ganda',
          lang: 'text',
          code: `
          gagal ke-1..3  -> tanpa jeda
          gagal ke-4     -> tunggu 2 detik
          gagal ke-5     -> tunggu 4 detik
          gagal ke-n     -> jeda berlipat, ada batas atas
          plus batas per IP untuk seluruh akun
          `,
          notes: [
            'Pengguna sah yang salah ketik hampir tidak terganggu.',
            'Penebak otomatis melambat sampai tidak berguna.',
            'Akun korban tidak pernah benar-benar terkunci.',
          ],
        },
      ),
      p(
        'Kolom kiri adalah bentuk yang paling sering ditemui, dan kelemahannya baru terasa ketika seseorang menyalahgunakannya. Penyerang yang tahu email seorang eksekutif bisa mengunci akunnya setiap tiga puluh menit tanpa henti, dan yang ia butuhkan hanyalah lima permintaan gagal secara berkala.',
      ),
      p(
        'Kolom kanan menyelesaikan hal yang sama tanpa efek samping itu. Jeda yang berlipat membuat seribu tebakan memakan waktu yang sangat lama, sementara pengguna sah yang salah ketik dua kali sama sekali tidak merasakan apa-apa. Batas atas pada jeda tetap diperlukan supaya angkanya tidak tumbuh menjadi berhari-hari.',
      ),

      h2('Menulisnya'),
      code(
        'ts',
        `
        import rateLimit from 'express-rate-limit';

        // Lapis pertama: batas kasar per alamat IP.
        const batasIp = rateLimit({
          windowMs: 15 * 60 * 1000,
          limit: 30,
          standardHeaders: true,
          legacyHeaders: false,
          message: { pesan: 'Terlalu banyak percobaan, coba lagi nanti' },
        });

        // Lapis kedua: jeda berlipat per akun, disimpan di Redis agar berlaku lintas instance.
        async function jedaPerAkun(email: string): Promise<number> {
          const gagal = Number(await redis.get(\`gagal:\${email}\`)) || 0;
          if (gagal < 3) return 0;
          return Math.min(2 ** (gagal - 2), 60) * 1000; // batas atas 60 detik
        }

        app.post('/login', batasIp, async (req, res) => {
          const { email, password } = SkemaLogin.parse(req.body);

          const jeda = await jedaPerAkun(email);
          if (jeda > 0) await new Promise((selesai) => setTimeout(selesai, jeda));

          const berhasil = await periksaKredensial(email, password);

          if (!berhasil) {
            await redis.incr(\`gagal:\${email}\`);
            await redis.expire(\`gagal:\${email}\`, 3600);
            catatPeristiwa('login.gagal', { email, ip: req.ip });
            return res.status(401).json({ pesan: 'Email atau password salah' });
          }

          await redis.del(\`gagal:\${email}\`);
          catatPeristiwa('login.berhasil', { email, ip: req.ip });
          // ... buat sesi
        });
        `,
        { filename: 'server/login.ts' },
      ),
      p(
        'Dua lapisnya menjawab dua serangan yang berbeda, dan itulah alasan keduanya ada. `batasIp` menahan satu sumber yang mencoba banyak akun sekaligus, yaitu pola password spraying. `jedaPerAkun` menahan banyak sumber yang mengeroyok satu akun, yaitu pola brute force. Satu lapis saja meninggalkan salah satu pintu terbuka.',
      ),
      p(
        'Telusuri satu per satu dengan angka di kode itu. Penyerang yang mengeroyok satu akun dari banyak IP akan lolos `batasIp`, karena tiap IP hanya mengirim sedikit permintaan. Ia berhenti di `jedaPerAkun`, sebab penghitung `gagal:email` naik terus tanpa peduli permintaannya datang dari mana. Pada kegagalan kesepuluh, jedanya sudah menyentuh batas atas enam puluh detik, sehingga satu jam hanya menghasilkan sekitar enam puluh tebakan.',
      ),
      p(
        'Sebaliknya, penyerang yang mencoba satu password ke ribuan akun tidak pernah menaikkan penghitung per akun mana pun. Ia berhenti di `batasIp`, karena tiga puluh permintaan dalam lima belas menit adalah batas yang cepat tersentuh bila ribuan akun dicoba dari satu tempat. Dua lapis itu memang tidak saling menggantikan, melainkan menutup sisi yang tidak bisa dilihat lapis lainnya.',
      ),
      p(
        'Penghitung disimpan di Redis, bukan di memori proses, dan pilihan itu bukan soal performa. Aplikasi produksi berjalan di beberapa instance sekaligus, sehingga penghitung yang hidup di memori satu proses bisa dilewati begitu saja dengan permintaan yang mendarat di instance lain.',
      ),
      p(
        'Baris `redis.expire` membuat penghitung kegagalan lupa dengan sendirinya sesudah satu jam. Tanpa baris ini, pengguna yang salah ketik lima kali hari ini akan tetap menanggung jedanya berbulan-bulan kemudian, dan itu perilaku yang salah.',
      ),
      p(
        'Panggilan `catatPeristiwa` ada di kedua cabang, bukan hanya di cabang gagal. Kegagalan beruntun memang sinyal serangan, tetapi **keberhasilan sesudah puluhan kegagalan** adalah sinyal yang jauh lebih penting, karena artinya tebakannya berhasil. Sinyal itu hanya bisa dilihat kalau keduanya tercatat, dan hal ini dibahas lengkap di sub-bab 3.5.',
      ),

      h2('Jangan lupakan endpoint lain'),
      p(
        'Pembatasan hampir selalu dipasang di `/login` lalu berhenti di situ. Padahal beberapa endpoint lain memberi penyerang jalan masuk yang sama mudahnya.',
      ),
      ul(
        '**Verifikasi OTP.** Kode enam digit hanya punya sejuta kemungkinan, dan tanpa pembatasan, program bisa menghabiskannya dalam hitungan menit.',
        '**Reset password.** Token reset yang bisa ditebak berulang kali sama saja dengan pintu belakang tanpa kunci.',
        '**Pendaftaran.** Tanpa batas, endpoint ini dipakai membuat ribuan akun sampah atau memastikan email mana yang sudah terdaftar.',
        '**Pencarian pengguna dan pemeriksaan ketersediaan nama.** Keduanya bisa dipakai memanen daftar akun.',
        '**Endpoint yang mahal**, misalnya ekspor data atau pembuatan laporan. Di sini masalahnya bukan penebakan, melainkan menghabiskan sumber daya server.',
      ),
      p(
        'Poin pertama layak ditegaskan karena akibatnya paling langsung. Kode OTP dirancang pendek supaya mudah diketik manusia, dan kependekan itu hanya aman selama percobaannya dibatasi. Tanpa batas, faktor kedua yang seharusnya menguatkan justru menjadi titik terlemah.',
      ),
      p(
        'Hitungannya begini. Kode enam digit punya satu juta kemungkinan, dan kode TOTP berlaku sekitar tiga puluh detik. Tanpa pembatasan, sebuah program yang mengirim seribu percobaan per detik menghabiskan seluruh ruang tebakan dalam sekitar tujuh belas menit, jauh melebihi umur satu kode. Karena itu penyerang tidak perlu menghabiskan seluruhnya, cukup mengirim sebanyak mungkin selama satu kode masih berlaku.',
      ),
      p(
        'Dengan batas lima percobaan per lima menit seperti di kode sebelumnya, peluang berhasil menebak satu kode turun menjadi lima per satu juta pada tiap jendela. Faktor kedua yang tadinya bisa ditembus dalam hitungan menit kini menuntut waktu yang tidak masuk akal, dan perubahan sebesar itu datang dari satu pemeriksaan sebelum kode diverifikasi.',
      ),
      callout(
        'warning',
        'Jawaban yang sama untuk semua kegagalan',
        'Pesan, status code, dan waktu jawab harus sama antara email tidak terdaftar dan password salah. Perbedaan sekecil apa pun di antara ketiganya berubah menjadi alat untuk memetakan siapa saja yang punya akun di layananmu.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Hash yang lambat sudah menjadi pembatas alami bagi penebakan, dan pertanyaannya adalah apakah itu cukup. Jawabannya bisa diukur.',
      ),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0, scrypt sebagai fungsi hash:

          tanpa pembatasan laju : ~350 tebakan / 10 detik
            (diukur 200 ms lalu diskalakan; yang membatasi di sini
             adalah biaya scrypt itu sendiri, bukan aturan apa pun)

        Terlihat kecil, dan 350 per sepuluh detik berarti 3.000 per menit.
        Daftar seribu sandi terpopuler habis dalam 20 detik.

          dengan 5 percobaan / 15 menit per akun:
            5 tebakan / 10 detik, sisanya 429
        `,
        { caption: 'Hash lambat memperlambat penyerang. Pembatasan laju yang menghentikannya.' },
      ),
      p(
        'Pembatasan harus dipasang di dua sumbu, sebab masing-masing menutup serangan yang berbeda.',
      ),
      code(
        'text',
        `
        PER AKUN   melindungi satu pengguna dari ditebak berulang
                   5 gagal -> tunda / kunci

        PER IP     melindungi dari satu penyerang yang mencoba BANYAK
                   akun sekaligus
                   100 percobaan / jam

        Keduanya diperlukan:
          hanya per akun -> penyerang mencoba SATU sandi populer ke
                            10.000 akun berbeda (credential stuffing)
          hanya per IP   -> penyerang memakai 10.000 IP berbeda untuk
                            menyerang SATU akun

        Dan ada jebakannya: penguncian keras per akun bisa dipakai untuk
        MENGUNCI pengguna lain dengan sengaja. Untuk akun biasa, pakai
        penundaan bertingkat; penguncian keras disimpan untuk akun admin.
        `,
      ),
      p(
        'Sumbu ketiga sering dilupakan meski paling efektif melawan serangan yang nyata, yaitu memeriksa apakah sandinya sudah pernah bocor.',
      ),
      code(
        'ts',
        `
        // Serangan sungguhan hampir selalu memakai daftar sandi dari
        // kebocoran sebelumnya, bukan menebak acak. Karena itu menolak
        // sandi yang ada di daftar itu lebih berpengaruh daripada
        // aturan komposisi apa pun.
        //
        // Pola k-anonymity: kirim 5 karakter pertama hash SHA-1 saja,
        // lalu cocokkan sisanya SECARA LOKAL. Sandi lengkapnya —
        // bahkan hash lengkapnya — tidak pernah meninggalkan servermu.

        async function pernahBocor(sandi: string) {
          const hash = crypto.createHash('sha1').update(sandi).digest('hex').toUpperCase();
          const awalan = hash.slice(0, 5);
          const sisa = hash.slice(5);

          const r = await fetch(\`https://api.pwnedpasswords.com/range/\${awalan}\`, {
            signal: AbortSignal.timeout(3000),
          });
          const teks = await r.text();
          return teks.split('\\n').some((baris) => baris.split(':')[0] === sisa);
        }
        `,
        {
          caption:
            'Contoh ini TIDAK dijalankan di materi karena memerlukan panggilan ke layanan luar. Mekanisme k-anonymity-nya dijelaskan apa adanya.',
        },
      ),
      p(
        'Dan ada saluran kebocoran yang tidak ditutup pembatasan laju sama sekali, yaitu pesan error yang membedakan email terdaftar dari yang tidak.',
      ),
      code(
        'text',
        `
        Diukur sungguhan:

          ana@contoh.id  -> {"status":401,"pesan":"Password salah"}
          budi@contoh.id -> {"status":404,"pesan":"Email tidak terdaftar"}

        Penyerang kini tahu ana@contoh.id TERDAFTAR tanpa menebak
        satu sandi pun, lalu memusatkan seluruh percobaannya ke sana.

        Pesan seragam:
          keduanya -> {"status":401,"pesan":"Email atau password salah"}
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Menyeragamkan pesannya belum cukup, sebab ada saluran kedua yang tidak terlihat di badan respons, yaitu berapa lama server menjawab.',
      ),
      code(
        'text',
        `
        Diukur, median dari 40 percobaan login yang GAGAL:

          pengguna ADA   : 28,05 ms
          pengguna TIADA :  0,00 ms

        Selisih 28 ms itu cukup untuk memisahkan email terdaftar dari
        yang tidak, meski pesannya identik. Sebabnya: bila penggunanya
        tidak ada, kodenya keluar lebih awal dan TIDAK PERNAH menjalankan hash.
        `,
      ),
      p(
        'Perbaikan yang tampak jelas adalah tetap menghitung hash meski penggunanya tidak ada. Perbaikan itu diukur, dan hasilnya **membuat kebocorannya lebih besar**.',
      ),
      code(
        'text',
        `
        Diukur, median dari 40 percobaan:

          patokan dihitung TIAP permintaan
            ada=27,96 ms   tiada=56,54 ms   selisih=28,58 ms

          patokan dihitung SEKALI saat boot
            ada=28,19 ms   tiada=27,82 ms   selisih= 0,37 ms

        Versi pertama menjalankan scrypt DUA KALI untuk pengguna yang
        tidak ada — sekali untuk patokan palsu, sekali untuk masukannya.
        Selisihnya justru lebih besar daripada tanpa perbaikan sama
        sekali, hanya arahnya terbalik.
        `,
        {
          caption:
            'Perbaikan yang benar secara penalaran bisa memperburuk keadaan. Itulah sebabnya diukur, bukan dikira.',
        },
      ),
      code(
        'ts',
        `
        // Patokan dihitung SEKALI saat proses dinyalakan.
        const HASH_PALSU = crypto.scryptSync('tidak-akan-pernah-cocok', GARAM, 32).toString('hex');

        function masuk(surel: string, sandi: string) {
          const u = cariPengguna(surel);
          const patokan = u?.hash ?? HASH_PALSU;          // konstanta, bukan kerja baru
          const h = crypto.scryptSync(sandi, GARAM, 32).toString('hex');
          const cocok = crypto.timingSafeEqual(Buffer.from(h), Buffer.from(patokan));
          return Boolean(u) && cocok;
        }

        // Kebenarannya tetap sama, diuji:
        //   masuk(ana, benar123) -> true
        //   masuk(ana, salah)    -> false
        //   masuk(budi, apa pun) -> false
        `,
      ),
      p(
        'Saluran enumerasi terakhir ada di tempat yang sering tidak dianggap bagian dari login, yaitu pendaftaran dan setel ulang sandi.',
      ),
      code(
        'text',
        `
        Pendaftaran:
          "Email sudah terdaftar"  -> enumerasi, persis seperti login

        Menutupnya: jawab dengan pesan yang sama untuk keduanya, lalu
        kirim surel yang ISINYA berbeda. Yang terdaftar menerima
        "seseorang mencoba mendaftar dengan emailmu"; yang belum
        menerima tautan pendaftaran.

        Setel ulang sandi:
          "Kami sudah mengirim tautan bila email itu terdaftar"
          -> sama untuk kedua kasus, dan waktunya juga harus sama,
             jadi pengiriman surelnya dilakukan di latar belakang.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kesalahan di sini hampir semuanya lahir dari niat baik, yaitu keinginan membuat pengalaman masuk terasa membantu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membedakan "email tidak terdaftar" dan "password salah"',
            'Pengguna jadi tahu masalahnya',
            'Diukur, itu memberi daftar email terdaftar tanpa menebak satu sandi pun',
          ],
          [
            'Menyeragamkan pesan lalu menganggap selesai',
            'Pesannya sudah sama',
            'Diukur, selisih waktunya 28 ms — cukup untuk membedakan keduanya',
          ],
          [
            'Menghitung hash palsu di setiap permintaan agar seragam',
            'Biar waktunya sama',
            'Diukur, itu menjalankan hash DUA KALI dan selisihnya naik jadi 28,58 ms. Hitung patokan sekali saat boot',
          ],
          [
            'Mengandalkan hash lambat sebagai pembatas',
            'Sudah lambat, cukup',
            'Diukur, tetap 3.000 tebakan per menit. Daftar seribu sandi terpopuler habis dalam 20 detik',
          ],
          [
            'Membatasi laju hanya per akun',
            'Yang diserang kan akunnya',
            'Credential stuffing mencoba satu sandi ke ribuan akun berbeda. Batasi per IP juga',
          ],
          [
            'Mengunci akun keras setelah beberapa kegagalan',
            'Menghentikan penyerang',
            'Penyerang bisa sengaja mengunci pengguna lain. Pakai penundaan bertingkat untuk akun biasa',
          ],
        ],
      ),
      p(
        'Hasil pengukuran di baris ketiga pantas diingat melampaui topiknya. Perbaikan itu benar secara penalaran, ditulis dengan niat yang tepat, dan membuat keadaannya lebih buruk. Satu-satunya yang menunjukkannya adalah pengukuran. Untuk kontrol keamanan, keyakinan bahwa sesuatu seharusnya bekerja tidak pernah setara dengan bukti bahwa ia bekerja.',
      ),
      references(
        {
          label: 'Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Anjuran soal pesan error generik, batas percobaan, dan penguncian akun.',
        },
        {
          label: 'Credential Stuffing Prevention Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Kenapa rate limiting per IP tidak cukup untuk serangan terdistribusi.',
        },
        {
          label: 'A07:2021 — Identification and Authentication Failures',
          href: 'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
          source: 'OWASP',
          note: 'Kategori yang menaungi penebakan kredensial dan enumerasi akun.',
        },
        {
          label: '429 Too Many Requests',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429',
          source: 'MDN',
          note: 'Status yang tepat untuk pembatasan, beserta header `Retry-After`.',
        },
      ),
    ],
  ),

  written(
    'jwt-dan-batasnya',
    'JWT dan Batas Kemampuannya',
    21,
    'Token yang bisa diverifikasi tanpa database, dengan harga yang harus kamu bayar sadar.',
    [
      p(
        'Bentuk dasar JWT sudah dibahas di sub-bab [JWT](/kelas/backend-basic/auth-dasar/jwt). Sub-bab ini membahas dua hal yang biasanya baru terasa jauh kemudian, yaitu cara memverifikasinya sehingga tidak bisa dipalsukan, dan harga yang kamu bayar karena memilihnya.',
      ),
      p(
        'Harga itu bisa dirumuskan dalam satu kalimat, yaitu **token yang sudah terbit sulit dicabut**. Kalimat itu bukan detail kecil, melainkan trade-off utamanya, dan sebagian besar penyesalan soal JWT berakar di sana.',
      ),

      terms(
        {
          term: 'JWT',
          meaning:
            'Singkatan dari **JSON Web Token**, sering dibaca "jot". Sebuah string berisi data JSON yang ditandatangani, sehingga penerimanya bisa memastikan isinya tidak diubah **tanpa** bertanya ke database. Kemampuan verifikasi tanpa query itulah alasan utama orang memilihnya.',
        },
        {
          term: 'header, payload, signature',
          meaning:
            'Tiga bagian JWT yang dipisahkan tanda titik. Header menyebut algoritma yang dipakai, payload berisi datanya, dan signature adalah tanda tangan atas dua bagian sebelumnya. Hanya bagian ketiga yang tidak bisa dibuat tanpa memegang kuncinya.',
        },
        {
          term: 'base64url',
          meaning:
            'Cara menuliskan data biner memakai huruf dan angka yang aman dipakai di URL. **Bukan enkripsi**, dan ini bagian yang paling sering disalahpahami. Siapa pun bisa membaca isi payload JWT hanya dengan menyalinnya ke pengurai mana pun.',
        },
        {
          term: 'claim',
          meaning:
            'Satu potong informasi di dalam payload, misalnya siapa penggunanya dan kapan tokennya kedaluwarsa. Ada claim baku yang namanya sudah disepakati standar, yaitu `sub` untuk subjek, `exp` untuk waktu kedaluwarsa, `iss` untuk penerbit, dan `aud` untuk audiens yang dituju.',
        },
        {
          term: '`alg: none`',
          meaning:
            'Nilai algoritma yang berarti token ini tidak ditandatangani. Ada di standar untuk kasus yang sangat khusus, tetapi bagi aplikasi biasa nilainya hanya berbahaya. Library lama pernah menerimanya begitu saja, sehingga siapa pun bisa mengarang token dan langsung diterima.',
        },
        {
          term: 'algorithm confusion',
          meaning:
            'Serangan yang mengubah nilai `alg` dari `RS256` menjadi `HS256`. Pada `RS256` server memverifikasi dengan kunci publik yang memang boleh diketahui siapa saja. Kalau server menuruti nilai `alg` dari token, kunci publik itu berubah peran menjadi kunci rahasia HMAC, dan penyerang bisa menandatangani token sendiri.',
        },
        {
          term: 'HS256 dan RS256',
          meaning:
            '`HS256` memakai satu kunci rahasia yang sama untuk menandatangani dan memverifikasi, cocok bila hanya satu layanan yang mengurusnya. `RS256` memakai sepasang kunci, yaitu kunci privat untuk menandatangani dan kunci publik untuk memverifikasi, cocok bila banyak layanan perlu memverifikasi tetapi tidak perlu bisa menerbitkan.',
        },
        {
          term: 'deny-list token',
          meaning:
            'Daftar token atau sesi yang dicabut, disimpan di server dan diperiksa pada setiap permintaan. Cara paling langsung mengembalikan kemampuan mencabut, dengan harga hilangnya sifat tanpa-database yang menjadi daya tarik awal JWT.',
        },
      ),

      h2('Yang bisa dan tidak bisa dilakukan tanda tangan'),
      code(
        'text',
        `
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInBlcmFuIjoiYWRtaW4ifQ.j3rT...
        |------------ header ------------|--------- payload ---------|-- signature --|

        Header  -> {"alg":"HS256","typ":"JWT"}
        Payload -> {"sub":"42","peran":"admin"}
        `,
      ),
      p(
        'Dua bagian pertama hanya dikodekan dengan base64url, jadi keduanya bisa dibaca siapa pun tanpa kunci apa pun. Yang dijamin tanda tangan bukan kerahasiaan isinya, melainkan **keutuhannya**. Mengubah satu huruf di payload akan membuat tanda tangannya tidak lagi cocok, dan itulah satu-satunya jaminan yang diberikan.',
      ),
      code(
        'bash',
        `
        # Siapa pun bisa membaca payload sebuah JWT, tanpa kunci apa pun.
        echo 'eyJzdWIiOiI0MiIsInBlcmFuIjoiYWRtaW4ifQ' | base64 -d
        # {"sub":"42","peran":"admin"}
        `,
      ),
      p(
        'Perintah satu baris itu adalah seluruh pembuktiannya. Tidak ada kunci yang dibutuhkan, tidak ada perkakas khusus, dan hasilnya langsung terbaca sebagai JSON biasa. Kalau kamu pernah ragu apakah payload JWT benar-benar terbuka, jalankan perintah ini pada token milikmu sendiri dan keraguannya selesai.',
      ),
      p(
        'Yang tetap terjaga adalah bagian ketiga. Cobalah mengubah bagian peran di payload menjadi nilai lain, kodekan ulang, lalu kirim tokennya ke server. Tanda tangannya tidak lagi cocok dengan isi yang baru, sehingga verifikasi gagal. Membaca bebas dan mengubah mustahil adalah dua sifat yang berbeda, dan JWT hanya menjanjikan yang kedua.',
      ),
      p(
        'Konsekuensinya langsung dan sering dilanggar. Jangan pernah menaruh data yang tidak boleh dibaca pemegang token di dalam payload, misalnya nomor identitas, alamat, atau catatan internal. Kalau kamu menaruhnya di sana, kamu sedang membagikannya.',
      ),
      p(
        'Perhatikan juga claim `"peran":"admin"` di payload contoh. Claim itu sah dipakai untuk memilih tampilan atau menghemat query, tetapi keputusan izin yang benar-benar penting tetap harus diperiksa di server dengan data terkini. Peran seseorang bisa dicabut satu menit sesudah tokennya terbit, sedangkan tokennya masih menyatakan admin sampai kedaluwarsa.',
      ),

      h2('Verifikasi yang benar'),
      code(
        'ts',
        `
        import jwt from 'jsonwebtoken';

        const RAHASIA = process.env.JWT_SECRET;
        if (!RAHASIA) throw new Error('JWT_SECRET belum diatur');

        export function bacaToken(token: string) {
          return jwt.verify(token, RAHASIA, {
            algorithms: ['HS256'],  // daftar algoritma yang diizinkan, wajib eksplisit
            issuer: 'toko-api',
            audience: 'toko-web',
            clockTolerance: 5,      // toleransi selisih jam antar server, dalam detik
          });
        }
        `,
        { filename: 'server/token.ts' },
      ),
      p(
        'Opsi `algorithms: ["HS256"]` adalah baris terpenting di seluruh potongan ini. Tanpanya, sebagian library akan membaca nilai `alg` **dari token itu sendiri** lalu menuruti apa pun yang tertulis di sana. Membiarkan token menentukan cara ia diperiksa sama saja dengan membiarkan tamu memilih sendiri apakah tiketnya perlu diperiksa.',
      ),
      p(
        'Serangan yang ditutup baris itu bekerja seperti berikut. Servermu memakai `RS256`, yaitu menandatangani dengan kunci privat dan memverifikasi dengan kunci publik. Kunci publik memang dirancang untuk dibagikan, sehingga penyerang bisa memperolehnya dengan mudah, misalnya dari endpoint JWKS yang memang menerbitkannya.',
      ),
      p(
        'Penyerang lalu menyusun token buatannya sendiri, mengubah nilai `alg` menjadi `HS256`, dan menandatanganinya memakai **kunci publik tadi** sebagai kunci rahasia HMAC. Bila library menuruti nilai `alg` dari token, ia akan memverifikasi dengan cara HMAC memakai kunci publik yang sama, dan tanda tangannya cocok. Kunci yang seharusnya terbuka baru saja berubah peran menjadi kunci penerbit token.',
      ),
      p(
        'Perhatikan seluruh serangan itu tidak menuntut penyerang menebak apa pun. Ia hanya memanfaatkan kesediaan server menerima instruksi dari token tentang bagaimana token itu harus diperiksa. Menuliskan daftar algoritma secara eksplisit menghapus kesediaan itu, dan bersamanya seluruh kelas serangan ini.',
      ),
      p(
        'Opsi `issuer` dan `audience` menutup penyalahgunaan token yang sah tetapi dari tempat lain. Kalau perusahaanmu punya beberapa layanan yang sama-sama menerbitkan JWT, token untuk layanan internal tidak boleh diterima oleh API publik. Kedua claim inilah yang membuat penolakan itu terjadi.',
      ),
      p(
        'Pemeriksaan `if (!RAHASIA)` di baris atas membuat aplikasi menolak berjalan ketika variabelnya tidak ada. Ini jauh lebih baik daripada berjalan dengan nilai `undefined`, yang pada beberapa library berakhir menjadi kunci kosong dan membuat setiap token dianggap sah. Kegagalan yang keras di awal selalu lebih murah daripada kegagalan diam di tengah jalan.',
      ),
      code(
        'ts',
        `
        // BERBAHAYA: decode tidak memeriksa tanda tangan sama sekali.
        const isi = jwt.decode(token);
        if (isi.peran === 'admin') { /* siapa pun bisa mengarang ini */ }

        // BENAR: verify melempar bila tanda tangannya tidak cocok.
        const isi = jwt.verify(token, RAHASIA, { algorithms: ['HS256'] });
        `,
      ),
      p(
        'Perbedaan `decode` dan `verify` hanya satu kata, tetapi akibatnya sejauh mungkin. `decode` hanya membongkar base64url dan mengembalikan isinya, tanpa memeriksa apa pun. Siapa pun bisa menyusun payload berisi `"peran":"admin"`, mengkodekannya, dan token itu akan lolos setiap pemeriksaan yang memakai `decode`.',
      ),
      p(
        'Fungsi `decode` tetap ada gunanya, misalnya membaca claim untuk keperluan log sesudah verifikasi berhasil. Aturan praktisnya sederhana, yaitu `decode` tidak boleh muncul di jalur mana pun yang mengambil keputusan izin.',
      ),

      h2('Masalah pencabutan'),
      p(
        'Karena verifikasi JWT tidak menyentuh database, server tidak punya kesempatan bertanya apakah token ini masih boleh dipakai. Akibatnya muncul di empat momen yang semuanya penting.',
      ),
      table(
        ['Kejadian', 'Yang diharapkan pengguna', 'Yang sebenarnya terjadi'],
        [
          [
            'Menekan tombol keluar',
            'Sesi berakhir seketika',
            'Token tetap sah sampai `exp` tercapai',
          ],
          [
            'Mengganti password karena akun disusupi',
            'Sesi penyerang terputus',
            'Token penyerang tetap berjalan',
          ],
          [
            'Peran diturunkan dari admin',
            'Aksesnya langsung menyempit',
            'Token lama tetap mengaku admin',
          ],
          [
            'Akun dinonaktifkan',
            'Tidak bisa masuk lagi',
            'Masih bisa memakai API sampai token habis',
          ],
        ],
      ),
      p(
        'Empat baris itu bukan bug library JWT, melainkan konsekuensi langsung dari rancangannya. Karena itu memilih JWT berarti memilih salah satu dari dua jawaban berikut, dan menundanya sampai insiden terjadi adalah pilihan yang paling mahal.',
      ),
      p(
        'Bayangkan urutan kejadian berikut, yang bukan skenario luar biasa. Pukul sepuluh seorang pengguna sadar akunnya dipakai orang lain lalu mengganti passwordnya. Pukul sepuluh lewat satu ia merasa aman. Pukul sepuluh lewat lima penyerang masih memanggil API-mu dengan access token yang terbit sebelum penggantian, dan setiap panggilannya diterima karena tanda tangannya sah dan waktu kedaluwarsanya belum lewat.',
      ),
      p(
        'Panjang jendela itu persis sama dengan umur access token yang kamu pilih. Pada umur lima belas menit, penyerang punya waktu paling lama lima belas menit sesudah korban bertindak. Pada umur tujuh hari yang sering dipilih supaya pengguna jarang login ulang, jendelanya menjadi seminggu penuh, dan penggantian password yang dilakukan korban praktis tidak berarti apa-apa.',
      ),
      ol(
        'Buat umur access token sangat pendek, misalnya lima sampai lima belas menit, lalu pakai refresh token yang memang diperiksa di database. Kerugiannya dibatasi selama jendela pendek itu.',
        'Simpan deny-list token yang dicabut lalu periksa pada setiap permintaan. Kemampuan mencabut kembali seketika, tetapi keuntungan tanpa-database hilang.',
      ),
      p(
        'Pilihan pertama adalah yang paling banyak dipakai, dan cara kerjanya dibahas tuntas di sub-bab berikutnya. Pilihan kedua masuk akal untuk sistem yang memang menuntut pencabutan seketika, misalnya aplikasi keuangan, dan bila itu kebutuhanmu, pertimbangkan lagi apakah sesi server biasa bukan jawaban yang lebih sederhana.',
      ),

      h2('JWT atau sesi server'),
      table(
        ['Pertimbangan', 'Sesi server', 'JWT'],
        [
          ['Mencabut seketika', 'Bisa, hapus satu baris', 'Sulit, butuh deny-list'],
          [
            'Beban tiap permintaan',
            'Satu pembacaan penyimpanan sesi',
            'Verifikasi tanda tangan saja',
          ],
          ['Banyak layanan memverifikasi', 'Perlu penyimpanan bersama', 'Cukup kunci publik'],
          [
            'Menyimpan data sensitif',
            'Aman, data ada di server',
            'Tidak, payload bisa dibaca siapa pun',
          ],
          ['Kerumitan awal', 'Rendah', 'Sedang, dan bertambah saat rotasi dipasang'],
        ],
      ),
      p(
        'Kolom sesi server menang pada hampir semua baris untuk aplikasi web biasa yang punya satu backend. JWT menjadi pilihan yang tepat ketika baris ketiga benar-benar berlaku, yaitu banyak layanan terpisah perlu memverifikasi identitas tanpa saling berbagi penyimpanan sesi.',
      ),
      callout(
        'info',
        'Pilih karena kebutuhannya, bukan karena populer',
        'Banyak aplikasi memakai JWT untuk kasus yang justru lebih cocok ditangani sesi server biasa, lalu menghabiskan waktu membangun ulang kemampuan mencabut yang sebenarnya sudah didapat gratis dari sesi. Kalau aplikasimu punya satu backend dan satu frontend, mulailah dari sesi.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'JWT sering dipilih karena terdengar seperti "sesi tanpa basis data". Ia memang bisa jadi itu, dan harga yang dibayar untuk kemudahan tersebut baru terasa pada hari kamu perlu mencabut sebuah token.',
      ),
      p('Sebelum itu, ada satu hal tentang isinya yang perlu dilihat langsung.'),
      code(
        'text',
        `
        Diukur sungguhan dengan Node 26.5.0:

          token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQyLCJwZXJhbiI...

          siapa pun bisa membaca isinya TANPA kunci apa pun:
            {"sub":42,"peran":"admin","surel":"ana@contoh.id","nik":"3273xxxxxxxx"}

          payload diubah jadi superadmin -> tanda tangan cocok? false
        `,
        {
          caption:
            'JWT DITANDATANGANI, bukan dienkripsi. Base64 adalah penyandian, bukan penyembunyian.',
        },
      ),
      p(
        'Tanda tangannya bekerja dengan baik, dan yang tidak ia lakukan adalah menyembunyikan isinya. Apa pun yang masuk ke payload dapat dibaca oleh siapa pun yang memegang tokennya, termasuk pemiliknya sendiri, termasuk skrip yang berjalan di halamanmu.',
      ),
      p('Kelemahan kedua berupa serangan pada proses verifikasinya.'),
      code(
        'text',
        `
        alg:none yang dibuat penyerang:

          eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOjQyLCJwZXJhbiI6InN1cGVyYWRtaW4ifQ.

        Perhatikan tanda titik terakhir: bagian tanda tangannya KOSONG.
        Verifier yang membaca alg DARI TOKEN akan menerimanya tanpa
        memeriksa apa pun.

        Serangan kedua, kebingungan algoritma:
          server memakai RS256 dengan kunci publik yang memang publik
          penyerang mengubah alg menjadi HS256, lalu menandatangani
          token dengan KUNCI PUBLIK itu sebagai rahasia HMAC
          -> verifier yang menuruti alg dari token akan menerimanya
        `,
      ),
      code(
        'ts',
        `
        // Algoritma DITENTUKAN SERVER, tidak pernah dibaca dari token.
        const muatan = jwt.verify(token, KUNCI, {
          algorithms: ['HS256'],        // daftar izin, wajib
          issuer: 'https://auth.contoh.id',
          audience: 'https://api.contoh.id',
          clockTolerance: 5,            // detik, untuk jam yang sedikit meleset
        });

        // issuer dan audience bukan hiasan: tanpa audience, token yang
        // sah untuk layanan A bisa dipakai di layanan B yang kebetulan
        // memakai kunci yang sama.
        `,
      ),
      p('Kelemahan ketiga adalah yang paling menentukan pilihan arsitektur, yaitu pencabutan.'),
      code(
        'text',
        `
        Yang terjadi antara "pengguna menekan keluar" dan "token kedaluwarsa":

          pengguna keluar         -> token masih sah
          sandi diganti           -> token lama masih sah
          peran diturunkan        -> token lama masih membawa peran lama
          akun dinonaktifkan      -> token masih sah
          token dicuri            -> tidak ada cara menghentikannya

        Panjang jendela itu = sisa masa berlaku token.

        Karena itu access token harus BERUMUR PENDEK, biasanya
        5 sampai 15 menit, dan pencabutan dilakukan lewat refresh token
        yang memang tersimpan di server.
        `,
      ),
      p(
        'Dengan begitu, pertanyaan "JWT atau sesi" punya jawaban yang bergantung pada bentuk sistemnya, bukan pada mana yang lebih modern.',
      ),
      table(
        ['', 'Sesi di server', 'JWT'],
        [
          ['Pencabutan seketika', 'Ya, hapus satu baris', 'Tidak, sampai kedaluwarsa'],
          ['Perlu penyimpanan bersama', 'Ya', 'Tidak untuk verifikasi'],
          [
            'Ukuran yang dikirim tiap permintaan',
            'Satu id pendek',
            'Seluruh payload, tiap permintaan',
          ],
          ['Perubahan peran berlaku', 'Permintaan berikutnya', 'Setelah token diperbarui'],
          ['Cocok untuk', 'Aplikasi web satu domain', 'Lintas layanan, klien pihak ketiga'],
        ],
      ),

      h2('Saat error-nya muncul'),
      p(
        'Error JWT umumnya jelas, dan yang perlu dikenali adalah yang menyamar sebagai masalah lain.',
      ),
      code(
        'text',
        `
        JsonWebTokenError: invalid signature
          Kunci berbeda, atau tokennya memang dipalsukan. Sering muncul
          setelah rotasi kunci yang tidak menyertakan masa tumpang tindih.

        TokenExpiredError: jwt expired
          Wajar. Klien harus memperbaruinya, bukan memaksa login ulang.

        JsonWebTokenError: jwt malformed
          Biasanya bukan tokennya yang rusak melainkan cara mengambilnya:
            const token = req.headers.authorization;
            // berisi "Bearer eyJ..." — kata Bearer-nya ikut terbawa
            const token = req.headers.authorization?.split(' ')[1];  // benar

        JsonWebTokenError: jwt audience invalid
          Token sah, untuk layanan lain. Ini pemeriksaan yang BEKERJA.

        NotBeforeError: jwt not active
          Jam antar server meleset. Sinkronkan waktunya, jangan besarkan
          toleransinya tanpa batas.
        `,
      ),
      p(
        'Yang jauh lebih berbahaya adalah kesalahan yang tidak menghasilkan error, dan bentuknya sangat spesifik.',
      ),
      code(
        'ts',
        `
        // 1. decode, bukan verify — TIDAK memeriksa tanda tangan sama sekali
        const muatan = jwt.decode(token);          // BAHAYA
        if (muatan.peran === 'admin') { /* ... */ }
        // Penyerang cukup menulis payload apa pun. Tidak ada error.

        // 2. Rahasia yang lemah untuk HS256
        const KUNCI = 'rahasia';                   // BAHAYA
        // Bisa ditebak dengan daftar kata dalam hitungan detik,
        // secara OFFLINE, tanpa satu pun permintaan ke servermu.

        // 3. Mempercayai peran dari token untuk keputusan penting
        if (muatan.peran === 'admin') hapusSemua();
        // Peran bisa berubah setelah token diterbitkan. Untuk aksi
        // berisiko tinggi, baca peran terbaru dari basis data.
        `,
      ),
      p(
        'Tempat menyimpan token di sisi klien juga merupakan keputusan keamanan, dan keduanya punya kelemahan yang berbeda.',
      ),
      code(
        'text',
        `
        localStorage
          rentan XSS: skrip apa pun di halamanmu bisa membacanya dan
          mengirimnya keluar. Tidak rentan CSRF.

        Cookie HttpOnly + Secure + SameSite=Lax
          tidak bisa dibaca skrip, jadi XSS tidak bisa MENCURINYA.
          Perlu perlindungan CSRF, dan diukur di bab batas aplikasi:
          SameSite=Lax sudah menutup form POST lintas situs.

        Untuk aplikasi web yang dibuka di peramban, cookie HttpOnly
        hampir selalu pilihan yang lebih baik.
        `,
      ),

      h2('Kesalahan umum pemula'),
      p('JWT mudah dipakai setengah benar, dan versi setengah benarnya terlihat bekerja sempurna.'),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh data sensitif di payload',
            'Tokennya kan ditandatangani',
            'Diukur, payload terbaca tanpa kunci apa pun. Ditandatangani tidak sama dengan dienkripsi',
          ],
          [
            'Memakai `jwt.decode` untuk membaca payload',
            'Isinya kan sama saja',
            '`decode` tidak memeriksa tanda tangan. Penyerang menulis payload apa pun tanpa satu pun error',
          ],
          [
            'Membaca `alg` dari token untuk verifikasi',
            'Tokennya yang tahu algoritmanya',
            'Itu membuka `alg:none` dan kebingungan algoritma. Tentukan daftar izin di server',
          ],
          [
            'Memberi access token masa berlaku panjang',
            'Supaya pengguna tidak sering login ulang',
            'Tidak ada cara mencabutnya. Token pendek plus refresh token adalah cara yang benar',
          ],
          [
            'Memakai rahasia HS256 yang pendek',
            'Yang penting acak',
            'Bisa ditebak offline dalam hitungan detik. Pakai minimal 32 byte acak kriptografis',
          ],
          [
            'Menyimpan token di `localStorage`',
            'Praktis dan bebas CSRF',
            'Skrip apa pun di halamanmu bisa membacanya. Cookie `HttpOnly` menutup pencurian itu',
          ],
        ],
      ),
      p(
        'Satu pertanyaan cukup untuk menilai apakah JWT dipakai dengan benar di sebuah sistem, yaitu berapa lama waktu yang dibutuhkan untuk membuat sebuah token berhenti berlaku setelah kamu memutuskan ia harus berhenti. Bila jawabannya "sampai kedaluwarsa" dan masa berlakunya berjam-jam, yang kamu punya bukan sistem autentikasi melainkan kartu akses yang tidak bisa ditarik kembali.',
      ),
      references(
        {
          label: 'RFC 7519: JSON Web Token (JWT)',
          href: 'https://www.rfc-editor.org/rfc/rfc7519',
          source: 'RFC Editor',
          note: 'Standar aslinya, termasuk daftar claim baku seperti `exp`, `iss`, dan `aud`.',
        },
        {
          label: 'JSON Web Tokens: Introduction',
          href: 'https://jwt.io/introduction',
          source: 'jwt.io',
          note: 'Anatomi tiga bagian JWT dan perbedaan HS256 dengan RS256.',
        },
        {
          label: 'JSON Web Token Cheat Sheet for Java',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Contohnya memakai Java, tetapi daftar seranganya berlaku untuk semua bahasa.',
        },
        {
          label: 'RFC 8725: JSON Web Token Best Current Practices',
          href: 'https://www.rfc-editor.org/rfc/rfc8725',
          source: 'RFC Editor',
          note: 'Sumber resmi anjuran allow-list algoritma dan penolakan `alg: none`.',
        },
      ),
    ],
  ),

  written(
    'rotasi-token',
    'Masa Berlaku dan Rotasi Token',
    20,
    'Membatasi berapa lama kredensial curian masih berguna.',
    [
      p(
        'Sub-bab sebelumnya berhenti pada satu masalah, yaitu token yang terbit sulit dicabut. Jawaban yang paling banyak dipakai adalah membuat masa berlakunya pendek. Kalau token hanya berlaku sepuluh menit, token yang dicuri hanya berguna sepuluh menit.',
      ),
      p(
        'Masalahnya, pengguna tidak mau login ulang setiap sepuluh menit. Pasangan access token dan refresh token adalah cara menyelesaikan keduanya sekaligus, dan bentuk dasarnya sudah dibahas di sub-bab [Refresh Token](/kelas/backend-basic/auth-dasar/refresh-token). Yang ditambahkan di sini adalah bagian yang membuat pola ini benar-benar aman, yaitu rotasi dan reuse detection.',
      ),

      terms(
        {
          term: 'access token',
          meaning:
            'Token berumur pendek yang dilampirkan pada setiap permintaan API. Umurnya biasanya lima sampai lima belas menit. Karena sering berpindah tangan dan tersimpan di banyak tempat, ia dianggap paling rawan tercuri, sehingga umurnya sengaja dibuat singkat.',
        },
        {
          term: 'refresh token',
          meaning:
            'Token berumur panjang yang **hanya** dipakai untuk meminta access token baru. Tidak pernah dikirim ke endpoint API biasa, sehingga permukaannya jauh lebih sempit. Disimpan di cookie `HttpOnly` supaya JavaScript tidak bisa membacanya.',
        },
        {
          term: 'rotasi',
          meaning:
            'Kebiasaan menerbitkan refresh token **baru** setiap kali yang lama dipakai, lalu membatalkan yang lama. Artinya satu refresh token hanya sah satu kali. Inilah yang mengubah pencurian refresh token dari bencana permanen menjadi kejadian yang bisa dideteksi.',
        },
        {
          term: 'reuse detection',
          meaning:
            'Aturan yang berbunyi: bila refresh token yang sudah dipakai muncul lagi, berarti ada dua pihak memegang token yang sama, dan salah satunya penyerang. Karena server tidak bisa tahu yang mana, jawabannya adalah membatalkan seluruh rangkaian token milik sesi itu.',
        },
        {
          term: 'token family',
          meaning:
            'Rangkaian token yang berasal dari satu login yang sama. Setiap rotasi menghasilkan anggota baru dalam keluarga itu. Ketika pemakaian ulang terdeteksi, yang dibatalkan adalah seluruh keluarganya, bukan satu token saja.',
        },
        {
          term: 'session fixation',
          meaning:
            'Serangan yang menanamkan id sesi pilihan penyerang ke browser korban **sebelum** korban login, sehingga sesudah korban login, penyerang sudah memegang id sesi yang sah. Dicegah dengan membuat ulang id sesi tepat sesudah login berhasil.',
        },
        {
          term: '`exp`',
          meaning:
            'Claim JWT yang menyebut waktu kedaluwarsa dalam detik sejak 1970. Token tanpa claim ini berlaku selamanya bagi library yang tidak memaksanya ada, dan itu adalah salah satu kesalahan paling berbahaya di seluruh sub-bab ini.',
        },
      ),

      h2('Alur lengkapnya'),
      steps(
        {
          title: 'Login berhasil',
          body: 'Server menerbitkan access token berumur sepuluh menit dan refresh token berumur tiga puluh hari. Refresh token disimpan di database beserta id keluarganya, lalu dikirim lewat cookie `HttpOnly`.',
        },
        {
          title: 'Memakai API',
          body: 'Klien melampirkan access token pada tiap permintaan. Server hanya memverifikasi tanda tangannya tanpa menyentuh database, dan inilah bagian yang membuat pola ini cepat.',
        },
        {
          title: 'Access token habis',
          body: 'Klien memanggil endpoint refresh. Server memeriksa refresh token ke database, menandainya terpakai, lalu menerbitkan pasangan baru. Refresh token lama tidak berlaku lagi sejak saat itu.',
        },
        {
          title: 'Token lama muncul lagi',
          body: 'Ini tanda pencurian. Server membatalkan seluruh token family itu, sehingga korban maupun penyerang sama-sama harus login ulang. Korban terganggu sebentar, penyerang kehilangan aksesnya.',
        },
      ),
      p(
        'Langkah keempat adalah yang membuat seluruh pola ini bekerja. Tanpa rotasi, refresh token yang dicuri berlaku selama tiga puluh hari penuh tanpa ada satu pun tanda. Dengan rotasi, penyerang dan korban akan berebut memakai token yang sama, dan perebutan itulah yang menghasilkan sinyal.',
      ),
      code(
        'text',
        `
        TANPA rotasi
        hari 1   penyerang mencuri refresh token
        hari 2   penyerang memakai token itu, berhasil
        hari 20  masih berhasil, token yang sama
        hari 30  token kedaluwarsa. Tidak ada satu pun sinyal selama 29 hari.

        DENGAN rotasi
        hari 1   penyerang mencuri refresh token R1
        hari 2   penyerang memakai R1, menerima R2. R1 ditandai terpakai.
        hari 2   korban membuka aplikasi, klien-nya masih memegang R1
        hari 2   R1 muncul lagi, pemakaian ulang terdeteksi
        hari 2   seluruh keluarga dicabut, alert terkirim
        `,
      ),
      p(
        'Perhatikan baris terakhir kolom pertama, yaitu ketiadaan sinyal selama dua puluh sembilan hari. Itulah yang sebenarnya diperbaiki rotasi. Tanpa rotasi, tidak ada satu pun peristiwa yang membedakan penyerang dari pengguna sah, sebab keduanya memakai token yang sama dengan cara yang sama.',
      ),
      p(
        'Dengan rotasi, siapa pun yang bergerak lebih dulu akan membuat token pihak lain menjadi basi, dan kemunculan token basi itulah sinyalnya. Perhatikan sinyal ini muncul pada **hari kedua**, bukan hari ketiga puluh, dan ia muncul tanpa perlu satu pun aturan deteksi yang pintar.',
      ),
      p(
        'Perlu diakui bahwa korban ikut terkena. Ia akan diminta login ulang tanpa merasa melakukan kesalahan. Itu pertukaran yang disengaja, sebab satu login ulang jauh lebih murah daripada akun yang diam-diam dikuasai orang lain selama sebulan.',
      ),

      h2('Menulisnya'),
      code(
        'ts',
        `
        export async function segarkanToken(refreshMentah: string) {
          const hash = hashToken(refreshMentah); // simpan hash, bukan nilai aslinya
          const tersimpan = await db.refreshToken.findUnique({ where: { hash } });

          if (!tersimpan) throw new TokenTidakSah();

          // Token yang sudah terpakai muncul lagi berarti ada dua pemegang.
          if (tersimpan.dipakaiPada) {
            await db.refreshToken.updateMany({
              where: { keluargaId: tersimpan.keluargaId },
              data: { dicabutPada: new Date() },
            });
            catatPeristiwa('token.pemakaian-ulang', { penggunaId: tersimpan.penggunaId });
            throw new TokenTidakSah();
          }

          if (tersimpan.dicabutPada || tersimpan.kedaluwarsaPada < new Date()) {
            throw new TokenTidakSah();
          }

          await db.refreshToken.update({
            where: { hash },
            data: { dipakaiPada: new Date() },
          });

          return terbitkanPasanganBaru(tersimpan.penggunaId, tersimpan.keluargaId);
        }
        `,
        { filename: 'server/refresh.ts' },
      ),
      p(
        'Baris pertama menyimpan **hash** dari refresh token, bukan nilai aslinya, dan alasannya sama persis dengan alasan password di-hash. Kalau tabel ini bocor, penyerang mendapat daftar hash yang tidak bisa dipakai sebagai token, karena yang diterima endpoint refresh adalah nilai aslinya.',
      ),
      p(
        'Perlu dibedakan dari hashing password, sebab pertimbangannya tidak sama persis. Password dibuat manusia sehingga bisa ditebak, dan karena itu ia menuntut fungsi lambat seperti argon2. Refresh token dihasilkan generator acak dengan entropi tinggi, sehingga menebaknya mustahil, dan fungsi hash cepat seperti SHA-256 sudah memadai untuk keperluan ini.',
      ),
      p(
        'Yang tetap berlaku sama adalah alasan dasarnya. Kalau tabel token bocor lewat pencadangan yang salah tempat atau lewat injeksi yang lolos, penyerang hanya memperoleh daftar hash. Endpoint refresh menuntut nilai asli, dan nilai asli tidak bisa dihitung mundur dari hash-nya, sehingga isi tabel itu tidak bisa langsung dipakai.',
      ),
      p(
        'Blok `if (tersimpan.dipakaiPada)` adalah inti reuse detection. Perhatikan yang dibatalkan adalah `keluargaId`, bukan satu baris token. Membatalkan satu token saja tidak menolong, sebab penyerang yang sudah sempat merotasi sekali sudah memegang anggota keluarga yang lebih baru.',
      ),
      p(
        'Panggilan `catatPeristiwa` di dalam blok itu bukan pelengkap. Pemakaian ulang refresh token adalah salah satu sinyal pencurian yang paling jelas yang bisa dihasilkan sebuah aplikasi, dan sinyal sejelas itu layak memicu peringatan, bukan sekadar tercatat lalu terlupakan.',
      ),
      p(
        'Perhatikan ketiga unhappy path melempar `TokenTidakSah` yang sama. Membedakan pesan antara token kedaluwarsa, token dicabut, dan token tidak dikenal akan memberi tahu penyerang di titik mana tebakannya berhenti, dan pengetahuan itu tidak ada gunanya bagi klien yang jujur.',
      ),

      h2('Kapan semua sesi harus dibatalkan'),
      p(
        'Umur pendek dan rotasi mengurangi kerusakan. Beberapa kejadian menuntut lebih dari itu, yaitu pemutusan seluruh sesi seketika.',
      ),
      table(
        ['Kejadian', 'Kenapa harus memutus semua sesi'],
        [
          [
            'Ganti password',
            'Alasan orang mengganti password biasanya karena curiga akunnya dipakai orang lain',
          ],
          ['Keluar dari semua perangkat', 'Fitur ini menjadi bohong bila token lama masih hidup'],
          ['Peran atau izin berubah', 'Token lama masih menyatakan izin yang lama'],
          [
            'Akun dinonaktifkan atau dihapus',
            'Akun mati yang masih bisa memanggil API adalah pintu belakang',
          ],
          ['Faktor kedua ditambah atau diubah', 'Sesi lama terbit sebelum faktor kedua berlaku'],
        ],
      ),
      p(
        'Baris kedua patut diperhatikan karena ia menyangkut janji yang kamu tampilkan sendiri. Tombol bertuliskan "Keluar dari semua perangkat" adalah pernyataan kepada pengguna, dan pengguna biasanya menekannya justru ketika ia curiga ada yang tidak beres. Kalau token lama masih hidup sesudah tombol itu ditekan, yang kamu berikan bukan keamanan melainkan rasa aman yang keliru.',
      ),
      p(
        'Baris terakhir sering terlewat karena terasa berlebihan. Alasannya begini, sesi yang terbit sebelum faktor kedua dinyalakan adalah sesi yang lolos tanpa pernah melewati faktor kedua. Membiarkannya hidup berarti penyerang yang sudah menguasai sesi lama tetap berada di dalam, dan penyalaan MFA yang dilakukan korban tidak mengusirnya sama sekali.',
      ),
      code(
        'ts',
        `
        export async function putuskanSemuaSesi(penggunaId: string, alasan: string) {
          await db.refreshToken.updateMany({
            where: { penggunaId, dicabutPada: null },
            data: { dicabutPada: new Date() },
          });
          await db.pengguna.update({
            where: { id: penggunaId },
            data: { tokenBerlakuSejak: new Date() },
          });
          catatPeristiwa('sesi.putus-semua', { penggunaId, alasan });
        }
        `,
      ),
      p(
        'Kolom `tokenBerlakuSejak` menyelesaikan masalah access token yang sudah terlanjur terbit. Verifikasi token membandingkan waktu penerbitannya dengan nilai kolom ini, lalu menolak token apa pun yang terbit lebih dulu. Pemeriksaannya memang satu pembacaan tambahan, tetapi hanya satu nilai per pengguna dan mudah disimpan di cache.',
      ),
      p(
        'Parameter `alasan` dicatat bersama peristiwanya supaya jejaknya bisa dibaca ulang kemudian. Ketika seseorang bertanya kenapa ia tiba-tiba diminta login ulang, catatan yang menyebut penyebabnya adalah selisih antara jawaban pasti dan tebakan.',
      ),
      callout(
        'danger',
        'Token tanpa masa berlaku adalah kredensial permanen',
        'Token tanpa claim `exp`, atau yang berumur bertahun-tahun agar pengguna tidak perlu login lagi, berubah menjadi password yang tidak pernah bisa diganti. Sekali bocor, ia berlaku selamanya, dan pemiliknya tidak akan pernah tahu.',
      ),

      h2('Membuat ulang id sesi sesudah login'),
      code(
        'ts',
        `
        app.post('/login', async (req, res) => {
          const pengguna = await periksaKredensial(req.body);
          if (!pengguna) return res.status(401).json({ pesan: 'Email atau password salah' });

          // Buang id sesi lama, buat yang baru, baru isi datanya.
          await new Promise((selesai) => req.session.regenerate(selesai));
          req.session.penggunaId = pengguna.id;

          res.json({ pesan: 'Berhasil masuk' });
        });
        `,
      ),
      p(
        'Panggilan `req.session.regenerate` menutup session fixation. Tanpanya, id sesi yang sudah ada sebelum login akan terus dipakai sesudah login, dan penyerang yang berhasil menanamkan id itu ke browser korban akan ikut memegang sesi yang kini sudah terautentikasi.',
      ),
      p(
        'Perhatikan urutannya, yaitu regenerasi dijalankan **sebelum** `penggunaId` diisi. Membalik urutan ini akan membuang data yang baru saja kamu simpan, karena regenerasi memang mengosongkan isi sesi lama.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Masa berlaku dan rotasi adalah jawaban atas satu kenyataan, yaitu bahwa token akan bocor. Lewat log, lewat tangkapan layar, lewat perangkat yang hilang, atau lewat satu celah XSS. Yang bisa dirancang bukan mencegahnya sepenuhnya, melainkan membatasi berapa lama kebocoran itu berguna dan apakah ia bisa terdeteksi.',
      ),
      p('Bentuknya adalah dua token dengan tugas yang berbeda.'),
      table(
        ['', 'Access token', 'Refresh token'],
        [
          ['Umur', '5 sampai 15 menit', 'Hari sampai minggu'],
          ['Dikirim ke', 'Setiap permintaan API', 'Hanya endpoint perbarui token'],
          ['Disimpan di server', 'Tidak perlu', 'Ya, supaya bisa dicabut'],
          ['Bila bocor', 'Berguna sebentar', 'Berguna lama, karena itu dirotasi'],
        ],
      ),
      p(
        'Rotasi berarti setiap pemakaian refresh token menghasilkan token baru dan mematikan yang lama. Yang membuatnya berharga bukan rotasinya, melainkan apa yang bisa dideteksi karenanya.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan Node 26.5.0:

          login       -> RhC0WiCAvQSa...
          segarkan #1 -> token baru diterbitkan 5uXcFBjTetc9...
          segarkan #2 -> token baru diterbitkan GW6C3xxCQ1I7...

          Penyerang memakai token LAMA yang sudah dirotasi:
            DITOLAK - PEMAKAIAN ULANG TERDETEKSI (3 token sekeluarga dicabut)

          Pengguna sah mencoba token terbarunya sesudah itu:
            DITOLAK - token tidak dikenal
        `,
        {
          caption:
            'Keduanya terlempar keluar, dan itu memang tujuannya: satu token dipakai dua kali berarti salah satunya dicuri.',
        },
      ),
      p(
        'Mekanismenya bersandar pada gagasan keluarga token. Setiap token yang lahir dari rotasi mewarisi id keluarga yang sama, sehingga ketika pemakaian ulang terdeteksi, seluruh keluarga bisa dicabut sekaligus tanpa perlu tahu mana yang asli dan mana yang curian.',
      ),
      code(
        'ts',
        `
        function segarkan(token: string) {
          const baris = cariToken(token);
          if (!baris) return { hasil: 'DITOLAK - token tidak dikenal' };

          if (baris.terpakai) {
            // Token yang sudah dirotasi dipakai lagi. Hanya ada dua
            // kemungkinan: tokennya dicuri, atau klien kehilangan
            // jawaban rotasi sebelumnya. Keduanya diperlakukan sebagai
            // pencurian, karena kita tidak bisa membedakannya.
            cabutSeluruhKeluarga(baris.idKeluarga);
            catatAudit('token.pemakaian-ulang', { keluarga: baris.idKeluarga });
            return { hasil: 'DITOLAK - PEMAKAIAN ULANG TERDETEKSI' };
          }

          baris.terpakai = true;
          return terbitkan(baris.idKeluarga);
        }
        `,
      ),
      p(
        'Kalimat di dalam komentar itu penting, sebab ia menyebut konsekuensi yang nyata. Klien yang kehilangan jaringan tepat setelah mengirim permintaan rotasi akan mencoba ulang dengan token lama, dan pengguna itu akan dikeluarkan meski tidak ada penyerang. Itu pertukaran yang memang dipilih, dan cara menguranginya adalah memberi jendela toleransi yang sangat pendek untuk permintaan identik yang tiba berdekatan.',
      ),
      p(
        'Selain rotasi, ada daftar kejadian yang harus mencabut token, dan daftar itu sering tidak lengkap.',
      ),
      code(
        'text',
        `
        Yang WAJIB mencabut token:
          keluar dari perangkat ini      -> cabut satu keluarga
          keluar dari semua perangkat    -> cabut semua keluarga
          sandi diubah                   -> cabut semua
          surel diubah                   -> cabut semua
          MFA diaktifkan atau dimatikan  -> cabut semua
          peran atau izin diturunkan     -> cabut semua
          akun dinonaktifkan             -> cabut semua
          pemakaian ulang terdeteksi     -> cabut keluarga itu

        Yang paling sering terlewat: mengubah sandi TIDAK mencabut
        sesi lain. Pengguna mengganti sandi justru karena curiga
        akunnya diakses orang lain, dan orang itu tetap masuk.
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan yang paling sering muncul di area ini bukan kebocoran melainkan pengguna yang keluar sendiri berulang kali, dan penyebabnya hampir selalu perlombaan antar permintaan.',
      ),
      code(
        'text',
        `
        Gejala: pengguna tiba-tiba keluar, acak, lebih sering di
        halaman yang memuat banyak data sekaligus.

        Penyebabnya:
          lima permintaan berjalan bersamaan
          access token kedaluwarsa
          KELIMANYA menerima 401 lalu KELIMANYA memanggil /refresh
          permintaan pertama merotasi token
          empat sisanya memakai token LAMA
          -> pemakaian ulang terdeteksi -> seluruh keluarga dicabut
          -> pengguna keluar
        `,
        {
          caption:
            'Deteksi pemakaian ulangnya bekerja dengan benar. Yang salah adalah klien yang merotasi lima kali.',
        },
      ),
      code(
        'ts',
        `
        // Menutupnya: satu permintaan rotasi pada satu waktu.
        let sedangMenyegarkan: Promise<string> | null = null;

        async function tokenSegar() {
          // Semua pemanggil menunggu promise YANG SAMA.
          sedangMenyegarkan ??= (async () => {
            try {
              const r = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });
              if (!r.ok) throw new GagalApi(await r.json(), r.status);
              return (await r.json()).accessToken;
            } finally {
              sedangMenyegarkan = null;
            }
          })();
          return sedangMenyegarkan;
        }
        `,
        {
          caption:
            'Pola ini disebut penggabungan permintaan, dan bentuknya sama dengan penutup cache stampede di bab Desain API.',
        },
      ),
      p('Kegagalan kedua bersifat perulangan tak berujung, dan gejalanya membebani server.'),
      code(
        'text',
        `
        401 -> refresh -> 401 -> refresh -> 401 -> ... selamanya

        Penyebabnya: refresh-nya BERHASIL tetapi tokennya tetap ditolak,
        misalnya karena audience salah atau jam server meleset.

        Menutupnya: batasi percobaan rotasi menjadi SATU kali per
        permintaan yang gagal. Bila permintaan ulangnya tetap 401,
        keluarkan penggunanya alih-alih mencoba lagi.
        `,
      ),
      code(
        'text',
        `
        KESALAHAN LAIN yang tidak bersuara:

          - refresh token disimpan apa adanya di basis data
            -> basis data bocor = seluruh token langsung bisa dipakai.
               Simpan hash-nya, persis seperti sandi.

          - token yang sudah kedaluwarsa tidak pernah dihapus
            -> tabelnya tumbuh selamanya dan pencariannya melambat

          - endpoint /refresh tidak dibatasi lajunya
            -> jalur yang paling menarik untuk penyerang, dan sering
               satu-satunya endpoint yang lupa dibatasi
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Rotasi token mudah dipasang dan mudah dipasang salah, dan versi yang salah biasanya terlihat bekerja sampai ada yang menekan tombol keluar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memberi access token umur berjam-jam',
            'Supaya pengguna tidak terganggu',
            'Tidak ada cara mencabutnya sebelum kedaluwarsa. Perpendek umurnya, pakai refresh token',
          ],
          [
            'Merotasi tanpa mendeteksi pemakaian ulang',
            'Yang penting tokennya berganti',
            'Rotasi tanpa deteksi hanya mempersulit, tidak memberi tahu. Diuji, deteksinya yang menemukan pencurian',
          ],
          [
            'Memanggil `/refresh` dari setiap permintaan yang 401',
            'Setiap permintaan kan perlu token baru',
            'Lima permintaan bersamaan merotasi lima kali, dan deteksi pemakaian ulang mengeluarkan penggunanya',
          ],
          [
            'Tidak mencabut token saat sandi diubah',
            'Sandinya kan sudah diganti',
            'Pengguna mengganti sandi justru karena curiga. Penyusupnya tetap masuk dengan token lama',
          ],
          [
            'Menyimpan refresh token apa adanya',
            'Nilainya kan sudah acak',
            'Basis data yang bocor langsung memberi token yang bisa dipakai. Simpan hash-nya',
          ],
          [
            'Tidak membatasi laju endpoint `/refresh`',
            'Yang dibatasi kan login',
            'Endpoint itu menukar token menjadi akses. Ia sama menariknya dengan login bagi penyerang',
          ],
        ],
      ),
      p(
        'Cara paling sederhana menguji apakah seluruh rangkaian ini benar adalah satu percobaan manual. Masuk di dua peramban berbeda, ubah sandi di salah satunya, lalu muat ulang halaman di peramban yang lain. Bila peramban kedua masih masuk, daftar pencabutan di sub-bab ini belum lengkap, dan itu adalah lubang yang akan dipakai persis pada saat seseorang paling membutuhkan perlindungannya.',
      ),
      references(
        {
          label: 'Session Management Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Umur sesi, regenerasi id sesudah login, dan pembatalan menyeluruh.',
        },
        {
          label: 'RFC 6819: OAuth 2.0 Threat Model',
          href: 'https://www.rfc-editor.org/rfc/rfc6819#section-5.2.2.3',
          source: 'RFC Editor',
          note: 'Bagian yang menjelaskan rotasi refresh token dan reuse detection.',
        },
        {
          label: 'RFC 9700: Best Current Practice for OAuth 2.0 Security',
          href: 'https://www.rfc-editor.org/rfc/rfc9700',
          source: 'RFC Editor',
          note: 'Anjuran terkini soal umur token dan kewajiban merotasi refresh token.',
        },
      ),
    ],
  ),

  written(
    'faktor-kedua',
    'Faktor Kedua dan Step-Up',
    20,
    'Password yang bocor saja tidak lagi cukup untuk masuk.',
    [
      p(
        'Password bocor adalah kejadian rutin, bukan pengecualian. Bocornya bisa lewat phishing, lewat pemakaian ulang password di layanan lain yang jebol, atau lewat perangkat yang disusupi. Semua kontrol di dua sub-bab sebelumnya menerima kenyataan itu, dan faktor kedua adalah jawaban yang paling langsung.',
      ),
      p(
        'Gagasannya sederhana, yaitu menuntut **sesuatu yang diketahui** ditambah **sesuatu yang dimiliki**. Penyerang yang memegang password korban tetap tidak bisa masuk, karena ia tidak memegang benda keduanya.',
      ),

      terms(
        {
          term: 'MFA dan 2FA',
          meaning:
            'Singkatan dari **Multi-Factor Authentication** dan **Two-Factor Authentication**. MFA berarti lebih dari satu faktor, sedangkan 2FA adalah bentuk paling umumnya yaitu tepat dua faktor. Dalam percakapan sehari-hari keduanya sering dipakai bergantian.',
        },
        {
          term: 'faktor',
          meaning:
            'Kategori bukti identitas. Ada tiga, yaitu sesuatu yang **diketahui** seperti password, sesuatu yang **dimiliki** seperti ponsel atau kunci fisik, dan sesuatu yang **melekat** seperti sidik jari. Dua bukti dari kategori yang sama tidak dihitung sebagai dua faktor.',
        },
        {
          term: 'TOTP',
          meaning:
            'Singkatan dari **Time-based One-Time Password**. Aplikasi pengautentikasi dan server sama-sama menyimpan satu rahasia, lalu keduanya menghitung kode enam digit dari rahasia itu ditambah waktu saat ini. Karena keduanya menghitung sendiri, tidak ada apa pun yang dikirim lewat jaringan.',
        },
        {
          term: 'WebAuthn dan passkey',
          meaning:
            'Standar yang memakai kunci kriptografi yang tersimpan di perangkat, dibuka dengan sidik jira atau wajah atau PIN perangkat. Paling kuat karena tanda tangannya terikat pada nama domain situsmu, sehingga halaman phishing yang mirip tetap gagal meski korban tertipu sepenuhnya.',
        },
        {
          term: 'SIM swap',
          meaning:
            'Penyerang membujuk operator seluler memindahkan nomor korban ke kartu SIM miliknya, biasanya dengan data pribadi yang dikumpulkan dari tempat lain. Sesudah berhasil, semua SMS termasuk kode OTP masuk ke ponsel penyerang. Inilah alasan utama SMS ditempatkan paling bawah.',
        },
        {
          term: 'step-up authentication',
          meaning:
            'Meminta faktor kedua lagi pada saat melakukan **aksi sensitif**, bukan hanya saat login. Contohnya mengganti email, menarik dana, atau memberi izin admin kepada orang lain. Gunanya menutup skenario sesi yang sudah terlanjur diambil alih.',
        },
        {
          term: 'recovery code',
          meaning:
            'Sekumpulan kode sekali pakai yang diberikan saat pengguna menyalakan MFA, untuk dipakai bila perangkatnya hilang. Harus diperlakukan seperti password, yaitu disimpan sebagai hash dan dicoret setelah dipakai.',
        },
        {
          term: 'replay',
          meaning:
            'Memakai ulang kode yang sudah pernah dipakai. Kode TOTP berlaku sekitar tiga puluh detik, jadi tanpa pencatatan kode yang sudah terpakai, kode yang tertangkap penyerang masih bisa dipakai lagi dalam jendela waktu itu.',
        },
      ),

      h2('Memilih faktor kedua'),
      table(
        ['Faktor', 'Tahan phishing?', 'Kemudahan', 'Anjuran'],
        [
          [
            'WebAuthn atau passkey',
            'Ya, terikat nama domain',
            'Sangat mudah sesudah terpasang',
            'Pilihan pertama',
          ],
          [
            'TOTP lewat aplikasi',
            'Tidak, kodenya bisa diminta halaman palsu',
            'Mudah, perlu memasang aplikasi',
            'Pilihan kedua yang solid',
          ],
          ['SMS', 'Tidak', 'Paling akrab bagi pengguna awam', 'Hanya bila tidak ada pilihan lain'],
          [
            'Email',
            'Tidak, dan email sering menjadi jalur reset password',
            'Mudah',
            'Hindari sebagai faktor kedua',
          ],
        ],
      ),
      p(
        'Kolom kedua menjelaskan kenapa WebAuthn berbeda kelas dari yang lain. Tanda tangan yang dihasilkan perangkat memuat nama domain yang sedang diakses, sehingga tanda tangan untuk `toko-palsu.id` tidak akan pernah diterima oleh `toko.com`. Korban yang tertipu sepenuhnya pun tetap gagal diserang, dan tidak ada faktor lain yang punya sifat ini.',
      ),
      p(
        'Jalannya serangan phishing pada TOTP layak ditelusuri supaya batasnya jelas. Korban membuka `t0ko.com` yang tampilannya identik, mengetik email dan password, lalu diminta kode pengautentikasi. Halaman palsu meneruskan ketiganya ke situs asli secara langsung, dan karena kode TOTP masih berlaku sekitar tiga puluh detik, penyerang berhasil masuk memakai kode yang baru saja diketik korban.',
      ),
      p(
        'Pada WebAuthn, langkah yang sama berhenti tanpa perlu korban curiga. Perangkat korban menghasilkan tanda tangan yang memuat nama domain yang sedang ia akses, yaitu `t0ko.com`, sehingga tanda tangan itu tidak akan pernah diterima `toko.com`. Penyerang tidak bisa meneruskannya, dan tidak ada cara membujuk perangkat menandatangani domain lain, sebab pemeriksaannya dilakukan browser dan perangkat, bukan manusia yang bisa tertipu.',
      ),
      p(
        'Baris terakhir sering dilanggar tanpa disadari. Email dijadikan faktor kedua padahal jalur reset password juga lewat email, sehingga keduanya sebenarnya bergantung pada satu hal yang sama. Ketika email korban dikuasai, kedua lapisan jatuh bersamaan, dan yang kamu punya hanyalah satu faktor yang diperiksa dua kali.',
      ),

      h2('Memverifikasi TOTP dengan benar'),
      code(
        'ts',
        `
        import { authenticator } from 'otplib';

        authenticator.options = { window: 1 }; // toleransi satu langkah waktu

        export async function periksaTotp(penggunaId: string, kode: string) {
          // Batasi percobaan, kode enam digit hanya punya sejuta kemungkinan.
          if (!(await bolehMencoba(\`totp:\${penggunaId}\`, { maks: 5, jendelaDetik: 300 }))) {
            throw new TerlaluBanyakPercobaan();
          }

          const rahasia = await ambilRahasiaTotp(penggunaId); // tersimpan terenkripsi
          if (!authenticator.verify({ token: kode, secret: rahasia })) {
            catatPeristiwa('mfa.gagal', { penggunaId });
            return false;
          }

          // Tolak kode yang sudah dipakai, meski masih di jendela waktunya.
          if (!(await tandaiKodeTerpakai(penggunaId, kode))) {
            catatPeristiwa('mfa.replay', { penggunaId });
            return false;
          }

          catatPeristiwa('mfa.berhasil', { penggunaId });
          return true;
        }
        `,
        { filename: 'server/totp.ts' },
      ),
      p(
        'Pembatasan percobaan di baris paling atas bukan pelengkap, melainkan syarat supaya faktor kedua benar-benar menguatkan. Kode enam digit hanya punya sejuta kemungkinan, dan tanpa batas, program bisa mencobanya sampai habis dalam waktu yang sangat singkat. Faktor yang seharusnya memperkuat justru menjadi titik terlemah.',
      ),
      p(
        'Opsi `window: 1` memberi toleransi satu langkah waktu ke depan dan ke belakang, yaitu sekitar tiga puluh detik di tiap arah. Toleransi ini diperlukan karena jam ponsel dan jam server tidak pernah persis sama. Menaikkannya menjadi angka besar memang mengurangi keluhan, tetapi sekaligus memperlebar jendela bagi kode yang tertangkap penyerang.',
      ),
      p(
        'Fungsi `tandaiKodeTerpakai` menutup replay. Tanpa langkah ini, kode yang berhasil dibaca penyerang lewat halaman phishing masih bisa dipakainya sendiri selama kode itu belum kedaluwarsa. Menyimpan kode terakhir yang dipakai per pengguna sudah cukup untuk menutupnya.',
      ),
      p(
        'Rahasia TOTP disimpan **terenkripsi**, bukan apa adanya, dan alasannya berbeda dari alasan password di-hash. Rahasia ini harus bisa dibaca kembali oleh server untuk menghitung kode, jadi hashing tidak mungkin dipakai. Enkripsi dengan kunci yang tersimpan di luar database membuat tabel yang bocor tidak langsung menyerahkan seluruh faktor kedua penggunamu.',
      ),

      h2('Step-up untuk aksi sensitif'),
      code(
        'ts',
        `
        // Faktor kedua diminta lagi untuk aksi bernilai tinggi.
        const AKSI_SENSITIF = new Set([
          'ganti-email',
          'ganti-password',
          'tarik-dana',
          'beri-izin-admin',
          'hapus-akun',
        ]);

        export function butuhStepUp(aksi: string, sesi: Sesi): boolean {
          if (!AKSI_SENSITIF.has(aksi)) return false;
          const menitSejakMfa = (Date.now() - sesi.mfaTerakhir) / 60000;
          return menitSejakMfa > 15;
        }
        `,
      ),
      p(
        'Ambang lima belas menit menyeimbangkan dua hal yang saling tarik-menarik. Cukup lama sehingga seseorang yang sedang mengurus beberapa pengaturan sekaligus tidak diminta kode berulang kali, tetapi cukup pendek sehingga sesi yang ditinggalkan terbuka di komputer bersama tidak bisa dipakai melakukan hal berbahaya.',
      ),
      p(
        'Nilai `sesi.mfaTerakhir` harus disimpan **di sisi server**, bukan dikirim klien. Kalau nilainya datang dari klien, penyerang cukup mengarang waktu yang baru saja lewat dan seluruh mekanisme step-up runtuh. Ini bentuk konkret dari aturan trust boundary di sub-bab pertama.',
      ),

      h2('Recovery code dan jalur pemulihan'),
      code(
        'ts',
        `
        import crypto from 'node:crypto';

        export async function buatRecoveryCode(penggunaId: string) {
          const kode = Array.from({ length: 10 }, () =>
            crypto.randomBytes(5).toString('hex'),
          );

          // Disimpan sebagai hash, sama seperti password.
          await db.recoveryCode.createMany({
            data: kode.map((satu) => ({ penggunaId, hash: hashKode(satu) })),
          });

          // Nilai aslinya hanya ditampilkan sekali, di sini.
          return kode;
        }
        `,
      ),
      p(
        'Komentar terakhir menandai keputusan yang sengaja dibuat tidak nyaman. Kode aslinya tidak pernah bisa ditampilkan lagi, karena yang tersimpan hanyalah hash-nya. Kalau pengguna kehilangan daftarnya, jalan satu-satunya adalah membuat daftar baru, dan itu memang perilaku yang benar.',
      ),
      p(
        'Ada satu bahaya yang tidak terlihat di kode ini, yaitu jalur pemulihan yang lebih longgar daripada MFA-nya sendiri. Kalau seseorang bisa mematikan MFA hanya dengan menjawab pertanyaan keamanan atau mengirim email ke dukungan, penyerang akan memilih jalur itu dan seluruh faktor kedua menjadi hiasan. Jalur pemulihan harus dirancang seketat pintu utamanya.',
      ),
      callout(
        'warning',
        'MFA di login saja tidak cukup',
        'Kalau endpoint API sensitif masih bisa dipanggil dengan token lama tanpa faktor kedua, penyerang yang berhasil mencuri token akan melewati MFA sepenuhnya. Verifikasi faktor kedua di server untuk aksi itu, dan jangan pernah percaya penanda dari klien yang mengaku MFA sudah lolos.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Faktor kedua menjawab satu kenyataan yang tidak bisa diperbaiki dengan hash sekuat apa pun, yaitu bahwa sandi pengguna bisa sudah bocor dari tempat lain. TOTP adalah bentuk yang paling banyak dipakai karena tidak memerlukan jaringan sama sekali saat dipakai.',
      ),
      p(
        'Cara kerjanya lebih sederhana daripada kesannya, dan bisa ditulis sendiri dalam belasan baris.',
      ),
      code(
        'ts',
        `
        // RFC 6238. Tidak ada jaringan, tidak ada penyimpanan bersama.
        // Yang dibagi hanya RAHASIA dan WAKTU.
        function totp(rahasia: Buffer, waktuDetik: number, langkah = 30, digit = 6) {
          const hitung = Math.floor(waktuDetik / langkah);
          const buf = Buffer.alloc(8);
          buf.writeBigUInt64BE(BigInt(hitung));
          const h = crypto.createHmac('sha1', rahasia).update(buf).digest();
          const o = h[h.length - 1] & 0x0f;                 // pemotongan dinamis
          const kode = ((h[o] & 0x7f) << 24 | h[o + 1] << 16 | h[o + 2] << 8 | h[o + 3]) % 10 ** digit;
          return String(kode).padStart(digit, '0');
        }
        `,
      ),
      code(
        'text',
        `
        Dijalankan sungguhan pada Node 26.5.0:

          t-60 detik -> 492328
          t-30 detik -> 685016
          t+0  detik -> 549321
          t+30 detik -> 222803
          t+60 detik -> 100135

        Jendela toleransi, supaya jam yang meleset beberapa detik
        tidak menolak pengguna yang sah:

          kode dari t-30  diuji pada t -> DITERIMA
          kode dari t-120 diuji pada t -> DITOLAK
        `,
        {
          caption:
            'Toleransi satu langkah ke belakang dan satu ke depan adalah pilihan yang lazim. Lebih lebar berarti jendela pencurian lebih panjang.',
        },
      ),
      p(
        'Jendela itu juga berarti satu kode berlaku sampai sembilan puluh detik, dan itu cukup bagi penyerang yang baru saja memperoleh kodenya lewat halaman tiruan. Yang menutupnya adalah mencatat kode yang sudah terpakai.',
      ),
      code(
        'text',
        `
        Diuji sungguhan:

          percobaan 1: diterima
          percobaan 2: DITOLAK (sudah dipakai)

        Tanpa daftar kode terpakai, penyerang yang mencuri kode punya
        jendela sampai 90 detik untuk memakainya ulang.
        `,
      ),
      p(
        'Selain verifikasinya, ada bagian yang justru lebih sering salah, yaitu kapan faktor kedua diminta.',
      ),
      code(
        'text',
        `
        Bukan hanya saat login. Yang juga perlu peneguhan ulang:

          mengubah sandi
          mengubah alamat surel
          mematikan MFA itu sendiri
          menambah metode MFA baru
          menambah rekening tujuan penarikan dana
          memberi izin ke aplikasi pihak ketiga
          mengekspor seluruh data
          mengubah peran pengguna lain

        Namanya step-up. Tanpa itu, satu sesi yang dicuri sesudah login
        bisa melakukan semuanya tanpa pernah bertemu faktor kedua.
        `,
      ),
      code(
        'ts',
        `
        // Peneguhan ulang dicatat pada SESI, dengan batas waktu sendiri.
        function wajibPeneguhanSegar(sesi: Sesi, maksimalDetik = 300) {
          const selisih = (Date.now() - sesi.diteguhkanPada) / 1000;
          if (selisih > maksimalDetik) {
            throw new GagalApi(
              { type: 'about:blank', title: 'Perlu peneguhan ulang', status: 403, perlu: 'mfa' },
              403,
            );
          }
        }

        // Dan peneguhannya diverifikasi DI SERVER untuk aksi itu.
        // Tanda dari klien seperti { sudahMfa: true } tidak berarti apa-apa.
        `,
      ),
      p(
        'Dua baris komentar terakhir yang menanggung seluruh beban keamanannya. Peneguhan yang dicatat pada sesi berarti server yang menyimpan faktanya, sementara tanda dari klien hanyalah nilai yang dikirim peramban dan bisa ditulis siapa saja. Batas waktu terpisah juga perlu, sebab sesi berumur panjang tidak boleh membuat peneguhan yang dilakukan pagi tadi masih dianggap segar pada malam harinya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan TOTP yang paling sering dilaporkan pengguna adalah kode yang selalu salah padahal aplikasinya menampilkan angka, dan penyebabnya hampir selalu sama.',
      ),
      code(
        'text',
        `
        "Kode saya selalu ditolak"

        Urutan pemeriksaan, dari yang paling sering:

        1. Jam server meleset
           Kode dibuat dari WAKTU. Selisih lebih dari satu langkah
           membuat semua kode salah. Periksa dengan: timedatectl status
           Jangan melebarkan toleransi untuk menutupi jam yang salah.

        2. Rahasia salah disandikan
           Aplikasi autentikator memakai Base32, BUKAN Base64 maupun hex.
           Salah sandi = rahasia berbeda = kode selalu salah.

        3. Rahasia disimpan sesudah diubah
           Rahasia yang dipakai membuat QR harus SAMA PERSIS dengan
           yang disimpan. Memangkas spasi atau mengubah huruf besar
           kecil sesudahnya akan memutusnya.

        4. Parameter tidak cocok
           Bawaannya SHA-1, 6 digit, 30 detik. Mengubah salah satunya
           tanpa menuliskannya di URI otpauth membuat aplikasinya
           memakai bawaan yang berbeda.
        `,
      ),
      p(
        'Bentuk URI-nya menentukan apakah aplikasi autentikator memakai parameter yang sama, dan menuliskannya secara eksplisit menghindari sebagian besar masalah di atas.',
      ),
      code(
        'text',
        `
        otpauth://totp/Contoh:ana%40contoh.id
          ?secret=JBSWY3DPEHPK3PXP
          &issuer=Contoh
          &algorithm=SHA1
          &digits=6
          &period=30

        Bagian issuer muncul sebagai nama layanan di aplikasi pengguna.
        Tanpa itu, pengguna dengan sepuluh akun melihat sepuluh baris
        yang tidak bisa dibedakan.
        `,
      ),
      p(
        'Kegagalan yang jauh lebih serius adalah pemulihan, sebab di sanalah seluruh perlindungan MFA paling sering dibatalkan.',
      ),
      code(
        'text',
        `
        Pengguna kehilangan ponselnya. Apa yang terjadi?

          BURUK  : dukungan pelanggan mematikan MFA setelah bertanya
                   tanggal lahir
                   -> faktor kedua kini hanya sekuat tanggal lahir,
                      dan itulah jalur yang dipakai penyerang

          BAIK   : kode pemulihan yang diberikan SEKALI saat MFA
                   diaktifkan, sekali pakai, disimpan sebagai HASH,
                   dan bisa dibuat ulang

        Kode pemulihan diperlakukan persis seperti sandi:
          - dibuat acak kriptografis
          - disimpan sebagai hash, bukan apa adanya
          - ditandai terpakai di dalam transaksi yang sama
          - dibuat ulang seluruhnya bila satu dipakai
        `,
        {
          caption:
            'Jalur pemulihan adalah jalur serangan. Ia harus sekuat jalur utamanya, bukan lebih lemah.',
        },
      ),

      h2('Kesalahan umum pemula'),
      p(
        'MFA mudah dipasang sebagai fitur dan sulit dipasang sebagai kontrol, dan selisihnya ada pada detail yang tidak terlihat dari antarmuka.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Tidak mencatat kode TOTP yang sudah terpakai',
            'Kodenya kan berganti tiap 30 detik',
            'Diuji, dengan toleransi satu langkah satu kode berlaku sampai 90 detik dan bisa dipakai ulang',
          ],
          [
            'Melebarkan toleransi agar pengguna tidak mengeluh',
            'Biar jam yang meleset tetap bisa masuk',
            'Itu memperpanjang jendela pencurian. Perbaiki jam servernya, jangan lebarkan jendelanya',
          ],
          [
            'Meminta MFA hanya saat login',
            'Kan sudah diteguhkan',
            'Sesi yang dicuri sesudah login bisa mengubah sandi dan mematikan MFA tanpa bertemu faktor kedua',
          ],
          [
            'Mempercayai tanda `sudahMfa` dari klien',
            'Klien kan tahu statusnya',
            'Nilai itu dikendalikan penyerang. Verifikasi di server untuk aksi itu, bukan sekali di awal',
          ],
          [
            'Menyimpan kode pemulihan apa adanya',
            'Kan cuma cadangan',
            'Basis data yang bocor langsung memberi jalan masuk yang melewati MFA. Simpan hash-nya',
          ],
          [
            'Membiarkan dukungan pelanggan mematikan MFA',
            'Pengguna kan butuh bantuan',
            'Itu membuat MFA hanya sekuat pertanyaan verifikasi. Pakai kode pemulihan yang sudah disiapkan',
          ],
        ],
      ),
      p(
        'Perlu ditambahkan bahwa SMS adalah faktor kedua yang paling lemah dari semua pilihan yang ada, sebab nomor telepon bisa dipindahkan ke kartu SIM lain lewat proses yang melibatkan manusia. Ia tetap jauh lebih baik daripada tidak ada faktor kedua sama sekali, dan bila hanya itu yang bisa dipakai penggunamu, pakailah, sambil menyediakan TOTP atau kunci keamanan bagi yang bisa.',
      ),
      references(
        {
          label: 'Multifactor Authentication Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Perbandingan faktor beserta anjuran menghindari SMS bila ada pilihan lain.',
        },
        {
          label: 'RFC 6238: TOTP',
          href: 'https://www.rfc-editor.org/rfc/rfc6238',
          source: 'RFC Editor',
          note: 'Standar yang mendefinisikan langkah waktu dan toleransi jendela.',
        },
        {
          label: 'Web Authentication API',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API',
          source: 'MDN',
          note: 'Cara memakai WebAuthn di browser beserta alasan ia tahan phishing.',
        },
        {
          label: 'Web Authentication Level 2',
          href: 'https://www.w3.org/TR/webauthn-2/',
          source: 'W3C',
          note: 'Spesifikasi resmi, termasuk keterikatan tanda tangan pada asal domain.',
        },
      ),
    ],
  ),

  written(
    'oauth-login-pihak-ketiga',
    'OAuth 2.0 dan Login Pihak Ketiga',
    21,
    'Memberi akses tanpa pernah menyerahkan password.',
    [
      p(
        'Tombol "Masuk dengan Google" terlihat seperti kemudahan, dan memang begitu bagi pengguna. Nilai sebenarnya ada di sisi lain, yaitu **password pengguna tidak pernah menyentuh aplikasimu**. Kamu tidak menyimpannya, tidak bisa membocorkannya, dan tidak perlu mengurus reset password.',
      ),
      p(
        'Sebagai gantinya kamu menerima tanggung jawab baru, yaitu menjalankan alurnya dengan benar. Alur OAuth punya beberapa varian, dan sebagian di antaranya sudah tidak dianjurkan lagi meski masih banyak ditemukan di tutorial lama.',
      ),

      terms(
        {
          term: 'OAuth 2.0',
          meaning:
            'Kerangka standar untuk memberi sebuah aplikasi akses terbatas atas nama pengguna, tanpa pengguna menyerahkan passwordnya. Dibaca "o-aut". Perlu ditegaskan bahwa OAuth aslinya dirancang untuk **otorisasi**, yaitu memberi izin, bukan untuk membuktikan identitas.',
        },
        {
          term: 'OpenID Connect',
          meaning:
            'Lapisan tipis di atas OAuth 2.0 yang menambahkan pembuktian identitas. Ia menghadirkan `id_token` berisi siapa penggunanya. Kalau yang kamu butuhkan adalah login, inilah yang sebenarnya kamu pakai, bukan OAuth polos.',
        },
        {
          term: 'Authorization Code flow',
          meaning:
            'Alur yang dianjurkan. Penyedia mengirimkan **kode singkat** ke aplikasimu lewat pengalihan browser, lalu servermu menukar kode itu dengan token lewat panggilan langsung ke penyedia. Tokennya tidak pernah melewati address bar, jadi tidak tercatat di riwayat browser maupun di log proxy.',
        },
        {
          term: 'PKCE',
          meaning:
            'Singkatan dari **Proof Key for Code Exchange**, dibaca "piksi". Aplikasimu membuat rahasia acak, mengirim sidik jarinya saat meminta kode, lalu mengirim rahasia aslinya saat menukar kode. Penyerang yang berhasil mencuri kodenya tetap gagal menukarnya karena ia tidak punya rahasia itu.',
        },
        {
          term: '`redirect_uri`',
          meaning:
            'Alamat tujuan pengalihan sesudah pengguna menyetujui izin. Harus didaftarkan di penyedia lebih dulu dan dicocokkan **sama persis**. Pencocokan yang longgar adalah cara paling sering dipakai untuk membelokkan kode otorisasi ke server penyerang.',
        },
        {
          term: '`state`',
          meaning:
            'Nilai acak yang kamu kirim saat memulai alur, lalu kamu periksa saat pengguna kembali. Gunanya memastikan kepulangan itu memang lanjutan dari permintaan yang kamu mulai, sehingga penyerang tidak bisa memaksa korban menyelesaikan alur milik penyerang.',
        },
        {
          term: 'scope',
          meaning:
            'Daftar izin yang kamu minta, misalnya membaca email atau membaca daftar kontak. Minta sesedikit mungkin. Selain lebih aman bila tokenmu bocor, permintaan izin yang panjang juga membuat sebagian pengguna membatalkan proses login.',
        },
        {
          term: '`email_verified`',
          meaning:
            'Penanda dari penyedia yang menyatakan bahwa alamat email itu sudah terbukti milik penggunanya. Wajib diperiksa, karena sebagian penyedia mengizinkan pengguna mencantumkan email yang belum terverifikasi, dan mempercayainya berarti siapa pun bisa mengaku sebagai pemilik email orang lain.',
        },
      ),

      h2('Alurnya, langkah demi langkah'),
      steps(
        {
          title: 'Aplikasimu menyiapkan rahasia',
          body: 'Buat `code_verifier` acak, hitung sidik jarinya menjadi `code_challenge`, buat nilai `state` acak. Simpan `code_verifier` dan `state` di sesi server, jangan di penyimpanan browser.',
        },
        {
          title: 'Pengguna diarahkan ke penyedia',
          body: 'Browser dibawa ke halaman login Google atau GitHub, membawa `client_id`, `redirect_uri`, `scope`, `state`, dan `code_challenge`. Password diketik di halaman penyedia, bukan di halamanmu.',
        },
        {
          title: 'Penyedia mengirim pengguna kembali',
          body: 'Kepulangannya membawa `code` dan `state`. Periksa `state` lebih dulu dan hentikan seluruh proses bila tidak cocok, sebelum menyentuh `code`.',
        },
        {
          title: 'Server menukar kode dengan token',
          body: 'Panggilan ini dilakukan dari server ke server, membawa `code`, `code_verifier`, dan rahasia klienmu. Browser tidak terlibat sama sekali di langkah ini.',
        },
        {
          title: 'Memverifikasi hasilnya',
          body: 'Periksa `id_token`, pastikan `iss` dan `aud` sesuai, lalu periksa `email_verified`. Baru sesudah itu buat sesi milik aplikasimu sendiri.',
        },
      ),
      p(
        'Langkah keempat adalah alasan alur ini disebut lebih aman daripada varian lama. Token tidak pernah muncul di address bar, sehingga ia tidak masuk riwayat browser, tidak tercatat di log server proxy, dan tidak ikut terkirim lewat header `Referer` ketika pengguna berpindah halaman.',
      ),
      p(
        'Untuk melihat bedanya, ingat bagaimana alur Implicit bekerja. Token dikirim kembali di dalam alamat pengalihan, sehingga ia muncul di address bar. Dari sana ia ikut tersimpan di riwayat browser, ikut tercatat di log setiap proxy yang dilewati, dan ikut terkirim di header `Referer` ketika pengguna mengeklik tautan ke situs lain dari halaman itu.',
      ),
      p(
        'Pada Authorization Code, yang muncul di address bar hanyalah `code`, dan nilai itu berumur sangat pendek serta hanya bisa ditukar sekali. Bahkan bila kode itu bocor lewat salah satu jalur di atas, ia sudah terpakai lebih dulu oleh servermu, atau sudah kedaluwarsa, atau tidak bisa ditukar karena penyerang tidak memegang `code_verifier` milik sesi korban.',
      ),
      p(
        'Langkah kelima sering dipotong dengan alasan penyedianya sudah tepercaya. Yang perlu diingat, tepercaya di sini berarti tepercaya untuk menyatakan siapa penggunanya, bukan berarti setiap respons yang tiba di endpoint-mu benar-benar berasal darinya. Pemeriksaan `iss` dan `aud` adalah yang membedakan keduanya.',
      ),

      h2('Menulisnya'),
      code(
        'ts',
        `
        import crypto from 'node:crypto';

        function acak(panjang = 32) {
          return crypto.randomBytes(panjang).toString('base64url');
        }

        app.get('/masuk/google', (req, res) => {
          const codeVerifier = acak();
          const codeChallenge = crypto
            .createHash('sha256')
            .update(codeVerifier)
            .digest('base64url');
          const state = acak(16);

          // Disimpan di SESI SERVER, bukan di localStorage.
          req.session.oauth = { codeVerifier, state, dibuatPada: Date.now() };

          const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
          url.searchParams.set('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
          url.searchParams.set('response_type', 'code');
          url.searchParams.set('scope', 'openid email profile');
          url.searchParams.set('state', state);
          url.searchParams.set('code_challenge', codeChallenge);
          url.searchParams.set('code_challenge_method', 'S256');

          res.redirect(url.toString());
        });
        `,
        { filename: 'server/oauth-mulai.ts' },
      ),
      p(
        'Nilai `codeVerifier` disimpan di sesi server dan **tidak pernah** dikirim ke browser pada tahap ini. Yang dikirim hanyalah sidik jarinya, yaitu `codeChallenge`. Pemisahan itulah inti PKCE, sebab penyerang yang berhasil mencuri kode otorisasi dari pengalihan tetap tidak bisa menukarnya tanpa nilai asli yang hanya ada di sesi milik korban.',
      ),
      code(
        'text',
        `
        Aplikasimu                     Penyedia                    Penyerang
        ----------                     --------                    ---------
        buat verifier V
        hitung challenge C = sha256(V)
        kirim C bersama permintaan --> simpan C
                                       terbitkan code K
        terima K <-------------------- kirim K lewat pengalihan --> berhasil mencuri K
        kirim K + V ----------------->
                                       sha256(V) == C, cocok
                                       terbitkan token
                                                              <-- kirim K saja
                                       V tidak ada, ditolak
        `,
      ),
      p(
        'Baris paling bawah adalah seluruh nilai PKCE. Penyerang memegang `K` yang sama persis dengan yang dipegang aplikasimu, tetapi penukaran menuntut `V` yang tidak pernah keluar dari sesi server korban. Karena `C` adalah hasil hash satu arah dari `V`, mengetahui `C` tidak menolongnya menghitung `V`.',
      ),
      p(
        'Perhatikan juga penyedia tidak perlu menyimpan apa pun tentang aplikasimu untuk ini bekerja. Ia hanya menyimpan `C` selama alur berlangsung lalu membandingkannya dengan hash dari `V` yang datang belakangan. Kesederhanaan itulah yang membuat PKCE bisa dianjurkan untuk semua jenis klien, bukan hanya aplikasi mobile seperti pada rancangan awalnya.',
      ),
      p(
        'Nilai `code_challenge_method` diisi `S256`, bukan `plain`. Nilai `plain` berarti sidik jarinya sama dengan rahasianya, sehingga perlindungannya hilang seluruhnya. Nilai ini ada di standar demi kompatibilitas dengan perangkat yang tidak bisa menghitung SHA-256, dan aplikasi web tidak termasuk di dalamnya.',
      ),
      p(
        'Scope diisi `openid email profile` saja, yang merupakan bentuk paling sempit untuk keperluan login. Setiap izin tambahan seperti akses kalender atau kontak harus punya alasan yang bisa disebutkan, karena izin yang diminta hari ini akan ikut terbawa pada token yang mungkin bocor besok.',
      ),
      code(
        'ts',
        `
        app.get('/masuk/google/kembali', async (req, res) => {
          const tersimpan = req.session.oauth;
          delete req.session.oauth; // sekali pakai, apa pun hasilnya

          if (!tersimpan) return res.status(400).send('Sesi tidak ditemukan');
          if (Date.now() - tersimpan.dibuatPada > 10 * 60 * 1000) {
            return res.status(400).send('Permintaan kedaluwarsa');
          }
          if (req.query.state !== tersimpan.state) {
            catatPeristiwa('oauth.state-tidak-cocok', { ip: req.ip });
            return res.status(400).send('Permintaan tidak sah');
          }

          const token = await tukarKode({
            code: String(req.query.code),
            codeVerifier: tersimpan.codeVerifier,
          });

          const profil = await verifikasiIdToken(token.id_token, {
            issuer: 'https://accounts.google.com',
            audience: process.env.GOOGLE_CLIENT_ID,
          });

          if (!profil.email_verified) {
            return res.status(400).send('Email belum diverifikasi penyedia');
          }

          const pengguna = await cariAtauBuatPengguna(profil);
          await new Promise((selesai) => req.session.regenerate(selesai));
          req.session.penggunaId = pengguna.id;
          res.redirect('/beranda');
        });
        `,
        { filename: 'server/oauth-kembali.ts' },
      ),
      p(
        'Baris `delete req.session.oauth` dijalankan paling awal dan berlaku untuk semua cabang, termasuk cabang gagal. Bentuk ini membuat satu permintaan OAuth hanya bisa diselesaikan satu kali, sehingga kode yang tertangkap tidak bisa dicoba berulang kali dengan `state` yang sama.',
      ),
      p(
        'Pemeriksaan `state` dilakukan **sebelum** kode ditukar, dan urutan itu disengaja. Menukar kode lebih dulu berarti kamu sudah bertindak atas permintaan yang belum terbukti berasal dari alur yang kamu mulai. Selain itu, penolakan ini dicatat karena `state` yang tidak cocok adalah sinyal serangan, bukan kesalahan pengguna biasa.',
      ),
      p(
        'Pemeriksaan `email_verified` menutup jalur pengambilalihan akun yang halus. Bila kamu mencocokkan akun berdasarkan email tanpa memeriksa penanda ini, seseorang bisa mendaftar di penyedia lain memakai email korban yang belum diverifikasi, lalu masuk ke akun korban di aplikasimu.',
      ),
      p(
        'Panggilan `req.session.regenerate` muncul lagi di sini, sama seperti pada login biasa. Alasannya sama persis, yaitu id sesi sebelum login tidak boleh berlanjut menjadi id sesi sesudah login.',
      ),

      h2('Alur yang tidak boleh dipakai lagi'),
      table(
        ['Alur', 'Kenapa dulu ada', 'Kenapa ditinggalkan'],
        [
          [
            'Implicit',
            'Dibuat untuk aplikasi browser sebelum CORS umum tersedia',
            'Token dikirim lewat address bar sehingga bocor ke riwayat dan log',
          ],
          [
            'Resource Owner Password Credentials',
            'Memudahkan migrasi aplikasi lama',
            'Aplikasi memegang password pengguna, persis yang ingin dihindari OAuth',
          ],
          [
            'Authorization Code tanpa PKCE',
            'Cukup pada zaman aplikasi hanya berupa server web',
            'Kode yang tercuri lewat pengalihan bisa ditukar penyerang',
          ],
        ],
      ),
      p(
        'Baris kedua patut diperhatikan karena ia membalik seluruh alasan OAuth diciptakan. Pada alur itu, pengguna mengetik password penyedia di halaman aplikasimu, sehingga aplikasimu kembali memegang password yang seharusnya tidak pernah ia lihat. Kalau sebuah tutorial menyuruhmu meminta password Google di form buatanmu sendiri, tutorial itu sudah usang.',
      ),
      callout(
        'warning',
        'Sudah masuk lewat Google bukan berarti berhak',
        'OAuth membuktikan siapa penggunanya, bukan apa yang boleh ia lakukan. Peran, izin, dan kepemilikan data tetap ditentukan aplikasimu sendiri. Jangan pernah menyimpulkan bahwa seseorang boleh mengakses sesuatu hanya karena ia berhasil melewati alur login pihak ketiga.',
      ),
      p(
        'Satu hal terakhir soal penyimpanan. Access token dan refresh token dari penyedia adalah rahasia, sama seperti kunci API. Simpan terenkripsi di server, jangan pernah dikirim ke browser, dan jangan disimpan di `localStorage`. Aturan lengkapnya ada di sub-bab 3.4.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'OAuth 2.0 sering disalahpahami sebagai protokol login. Ia sebenarnya protokol **delegasi izin**, yaitu cara pengguna mengizinkan aplikasimu mengakses sesuatu miliknya di layanan lain. Login lewat OAuth adalah pemakaian turunannya, dan bagian identitasnya sebenarnya milik OpenID Connect yang dibangun di atasnya.',
      ),
      p('Selisih itu punya akibat praktis yang sering menjadi kerentanan.'),
      code(
        'text',
        `
        access_token dari penyedia menjawab:
          "pemegang token ini boleh mengakses sumber daya X"

        Ia TIDAK menjawab:
          "pemegang token ini adalah orang bernama Ana"

        Karena itu access_token TIDAK BOLEH dipakai untuk membuktikan
        identitas. Yang membuktikan identitas adalah id_token, yaitu
        JWT dari OpenID Connect yang tanda tangannya kamu verifikasi
        sendiri terhadap kunci publik penyedia.
        `,
      ),
      p(
        'Alur yang benar untuk aplikasi yang dipakai pengguna adalah Authorization Code dengan PKCE, dan bagian PKCE-nya bisa dilihat bekerja.',
      ),
      code(
        'text',
        `
        Diuji sungguhan dengan Node 26.5.0:

          code_verifier          : JhYp0RiWrTpomwvfGIUzTppfkimzL7Qh-jgEUsmicm8
          code_challenge (S256)  : 4yz__Qp5mVRkLcDIfLlRYgrEakj8wGFpG16JvzyrxG4
          panjang verifier       : 43 (RFC 7636 minta 43-128)

          Penyerang mencegat kode otorisasi tapi TIDAK punya verifier:
            DITOLAK - verifier tidak cocok

          Klien sah menukar dengan verifier miliknya:
            TOKEN DITERBITKAN
        `,
        {
          caption:
            'Tanpa PKCE, kode otorisasi yang tercegat cukup untuk menukar token. Dengan PKCE, ia tidak berguna sendirian.',
        },
      ),
      p(
        'Yang membuat PKCE bekerja adalah arah fungsi hash-nya. Challenge dikirim lebih dulu lewat jalur yang bisa terlihat, sementara verifier dikirim kemudian lewat jalur langsung ke server penyedia. Siapa pun yang melihat challenge tidak bisa menghitung mundur verifier-nya.',
      ),
      code(
        'text',
        `
        Dan varian "plain" yang kadang masih ditawarkan:

          code_challenge_method=plain  ->  challenge = verifier

        Siapa pun yang mencegat permintaan otorisasi sudah memegang
        keduanya. Selalu pakai S256.
        `,
      ),
      p(
        'Parameter `state` menutup serangan yang berbeda, dan namanya sering membuatnya disangka sekadar tempat menitip data.',
      ),
      code(
        'ts',
        `
        // state menutup login CSRF: penyerang memancing korban
        // menyelesaikan alur otorisasi milik AKUN PENYERANG, sehingga
        // korban tanpa sadar masuk ke akun penyerang dan menyimpan
        // datanya di sana.
        const state = crypto.randomBytes(32).toString('base64url');
        const verifier = crypto.randomBytes(32).toString('base64url');

        // Keduanya disimpan di sesi SEBELUM pengguna dialihkan,
        // dan diperiksa saat ia kembali.
        sesi.oauth = { state, verifier, tujuanSetelahLogin: '/dasbor' };

        const url = new URL('https://penyedia.id/authorize');
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', env.OAUTH_CLIENT_ID);
        url.searchParams.set('redirect_uri', 'https://app.contoh.id/auth/callback');
        url.searchParams.set('scope', 'openid email profile');   // seminimal mungkin
        url.searchParams.set('state', state);
        url.searchParams.set('code_challenge', s256(verifier));
        url.searchParams.set('code_challenge_method', 'S256');
        `,
      ),

      h2('Saat error-nya muncul'),
      p(
        'Error OAuth punya bentuk yang sudah dibakukan, dan membacanya sampai ke `error_description` hampir selalu langsung menunjukkan penyebabnya.',
      ),
      code(
        'text',
        `
        redirect_uri_mismatch
          Paling sering. redirect_uri harus COCOK PERSIS dengan yang
          terdaftar, termasuk skema, port, dan garis miring di akhir.
            https://app.contoh.id/auth/callback
            https://app.contoh.id/auth/callback/     <- BERBEDA

        invalid_grant
          Kode otorisasi sudah dipakai, sudah kedaluwarsa (biasanya
          10 menit), atau verifier-nya tidak cocok. Kode otorisasi
          SEKALI PAKAI — dua permintaan dengan kode yang sama, yang
          kedua selalu gagal.

        invalid_client
          client_secret salah, atau dikirim di tempat yang salah
          (badan permintaan versus header Authorization Basic).

        access_denied
          Pengguna menolak di halaman izin. Ini BUKAN error sistem —
          tampilkan pesan yang wajar, jangan halaman error.

        invalid_scope
          Scope yang diminta tidak ada atau belum disetujui untuk
          aplikasimu oleh penyedia.
        `,
      ),
      p(
        'Yang jauh lebih berbahaya adalah kesalahan yang tidak menghasilkan error, dan di OAuth bentuknya sangat spesifik.',
      ),
      code(
        'ts',
        `
        // 1. redirect_uri dicocokkan dengan awalan, bukan persis
        if (redirectUri.startsWith('https://app.contoh.id')) { /* BAHAYA */ }
        // https://app.contoh.id.penyerang.id/  LOLOS.
        // Kode otorisasinya terkirim ke penyerang.

        // 2. state tidak diperiksa
        // Penyerang memancing korban menyelesaikan alur milik akunnya
        // sendiri. Korban masuk ke akun penyerang tanpa sadar.

        // 3. Akun ditautkan hanya berdasarkan alamat surel
        const pengguna = await cariPenggunaLewatSurel(profil.email);   // BAHAYA
        // Bila penyedia tidak memverifikasi surel, siapa pun bisa
        // mendaftar dengan surel korban lalu masuk sebagai korban.
        // Periksa email_verified, dan tautkan lewat (penyedia, subject),
        // bukan lewat surel.

        // 4. id_token dipercaya tanpa verifikasi tanda tangan
        const muatan = JSON.parse(atob(idToken.split('.')[1]));        // BAHAYA
        // Persis kesalahan jwt.decode. Verifikasi terhadap JWKS penyedia,
        // dan periksa iss, aud, exp, serta nonce.
        `,
      ),
      p(
        'Kesalahan ketiga pantas ditegaskan karena ia terlihat sangat wajar. Menautkan akun lewat alamat surel terasa alami, dan ia menggantungkan keamanan akunmu pada apakah penyedia benar-benar memverifikasi surel itu. Penautan yang benar memakai pasangan penyedia dan subject, yaitu pengenal yang dijamin stabil dan unik oleh penyedia itu sendiri.',
      ),

      h2('Kesalahan umum pemula'),
      p(
        'OAuth punya banyak bagian bergerak, dan kesalahan yang paling mahal selalu ada di bagian yang terlihat seperti detail administratif.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai alur implicit',
            'Ada di banyak tutorial lama',
            'Token muncul di URL, masuk ke riwayat peramban dan log. Sudah tidak direkomendasikan. Pakai code + PKCE',
          ],
          [
            'Mencocokkan `redirect_uri` dengan awalan',
            'Supaya subdomain ikut jalan',
            '`app.contoh.id.penyerang.id` lolos, dan kode otorisasinya terkirim ke penyerang. Cocokkan PERSIS',
          ],
          [
            'Melewatkan pemeriksaan `state`',
            'Alurnya kan tetap jalan',
            'Membuka login CSRF: korban masuk ke akun penyerang dan menyimpan datanya di sana',
          ],
          [
            'Memakai `plain` untuk `code_challenge_method`',
            'Lebih sederhana',
            'Diuji, dengan `plain` challenge sama dengan verifier. Siapa pun yang mencegat sudah memegang keduanya',
          ],
          [
            'Menautkan akun lewat alamat surel',
            'Surelnya kan unik',
            'Bergantung pada apakah penyedia memverifikasinya. Tautkan lewat pasangan penyedia dan subject',
          ],
          [
            'Meminta scope sebanyak mungkin sekaligus',
            'Biar tidak perlu minta izin lagi nanti',
            'Menurunkan tingkat persetujuan pengguna, dan memperbesar kerugian bila tokenmu bocor',
          ],
        ],
      ),
      p(
        'Satu hal terakhir yang mudah terlewat adalah bahwa token penyedia yang kamu simpan adalah rahasia milik orang lain. Ia memberi akses ke data pengguna di layanan pihak ketiga, sehingga aturan yang sama dengan rahasia lain berlaku penuh, yaitu disimpan terenkripsi di sisi server, tidak pernah dikirim ke peramban, dan dicabut ketika pengguna memutuskan tautan akunnya.',
      ),
      references(
        {
          label: 'RFC 6749: The OAuth 2.0 Authorization Framework',
          href: 'https://www.rfc-editor.org/rfc/rfc6749',
          source: 'RFC Editor',
          note: 'Standar dasarnya, termasuk definisi setiap parameter yang dipakai di sub-bab ini.',
        },
        {
          label: 'RFC 7636: Proof Key for Code Exchange',
          href: 'https://www.rfc-editor.org/rfc/rfc7636',
          source: 'RFC Editor',
          note: 'Cara kerja PKCE dan alasan `S256` dipilih daripada `plain`.',
        },
        {
          label: 'RFC 9700: Best Current Practice for OAuth 2.0 Security',
          href: 'https://www.rfc-editor.org/rfc/rfc9700',
          source: 'RFC Editor',
          note: 'Sumber resmi yang menyatakan Implicit dan ROPC tidak lagi dianjurkan.',
        },
        {
          label: 'OAuth 2.0 Protocol Cheatsheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Daftar periksa singkat untuk meninjau implementasi OAuth.',
        },
      ),
    ],
  ),

  written(
    'hak-seminimal-mungkin',
    'Hak Seminimal Mungkin',
    18,
    'Yang menentukan seberapa parah sebuah pembobolan, bukan apakah ia terjadi.',
    [
      p(
        'Enam sub-bab sebelumnya berusaha mencegah penyerang masuk. Sub-bab ini menerima bahwa suatu saat ada yang berhasil, lalu bertanya berapa besar kerusakan yang bisa ia lakukan sesudah masuk. Jawabannya ditentukan satu hal, yaitu hak yang menempel pada identitas yang ia kuasai.',
      ),
      p(
        'Kredensial bocor dengan hak sempit adalah insiden kecil yang bisa ditutup dalam sehari. Kredensial bocor dengan hak penuh adalah bencana yang menyentuh setiap tabel dan setiap berkas. Selisih di antara keduanya sepenuhnya ditentukan keputusan yang kamu ambil jauh sebelum insiden terjadi.',
      ),

      terms(
        {
          term: 'least privilege',
          meaning:
            'Prinsip yang berbunyi setiap identitas hanya diberi izin yang benar-benar dibutuhkan pekerjaannya, tidak lebih. Sering diterjemahkan sebagai hak seminimal mungkin. Berlaku untuk manusia, untuk layanan, dan untuk setiap kunci yang pernah kamu terbitkan.',
        },
        {
          term: 'identitas',
          meaning:
            'Apa pun yang bisa melakukan sesuatu di sistemmu. Bukan hanya akun pengguna, melainkan juga user database milik aplikasi, service account, kunci API, token CI/CD, dan peran di dalam aplikasi. Setiap identitas menjawab pertanyaan yang sama, yaitu apa saja yang boleh ia lakukan.',
        },
        {
          term: 'DDL dan DML',
          meaning:
            '**Data Definition Language** adalah perintah yang mengubah struktur, misalnya `CREATE`, `ALTER`, dan `DROP`. **Data Manipulation Language** adalah perintah yang mengubah isi, misalnya `SELECT`, `INSERT`, `UPDATE`, dan `DELETE`. Aplikasi web saat melayani permintaan hampir selalu hanya membutuhkan yang kedua.',
        },
        {
          term: 'service account',
          meaning:
            'Akun yang dipakai program, bukan manusia. Sering menjadi titik terlemah karena tidak ada yang merasa memilikinya, tidak pernah ditinjau, dan biasanya dibuat dengan hak berlebih agar cepat berjalan saat pertama kali dipasang.',
        },
        {
          term: 'privilege creep',
          meaning:
            'Penumpukan hak seiring waktu. Seseorang pindah tim, mendapat izin baru, tetapi izin lamanya tidak pernah dicabut. Setelah beberapa tahun ia memegang gabungan hak dari setiap peran yang pernah dijalaninya, dan tidak ada satu pun yang benar-benar ia butuhkan sekarang.',
        },
        {
          term: 'break-glass',
          meaning:
            'Akun berhak tinggi yang hanya dipakai dalam keadaan darurat, disimpan terkunci, dan setiap pemakaiannya memicu peringatan. Cara memberi jalan keluar untuk keadaan luar biasa tanpa membiarkan hak penuh menempel pada akun harian.',
        },
        {
          term: 'wildcard IAM',
          meaning:
            'Kebijakan izin yang memakai tanda bintang pada aksi atau sumber daya, misalnya mengizinkan semua aksi pada semua bucket. Cepat ditulis dan hampir selalu terlalu longgar, karena ia ikut mengizinkan hal yang belum ada saat kebijakannya ditulis.',
        },
      ),

      h2('Berlaku untuk setiap identitas'),
      table(
        ['Identitas', 'Yang biasanya diberikan', 'Yang sebenarnya dibutuhkan'],
        [
          [
            'User database aplikasi',
            'Pemilik skema, bisa `DROP TABLE`',
            'Hanya `SELECT`, `INSERT`, `UPDATE`, `DELETE` pada tabel tertentu',
          ],
          [
            'Job pelaporan',
            'Kredensial yang sama dengan aplikasi',
            'Kredensial khusus yang hanya bisa membaca',
          ],
          [
            'Kunci API untuk klien',
            'Satu kunci serba bisa dipakai semua klien',
            'Satu kunci per klien dengan scope masing-masing',
          ],
          [
            'Token CI/CD',
            'Akses penuh ke repositori dan server',
            'Hanya izin untuk pekerjaan yang memang dijalankan pipeline itu',
          ],
          [
            'Peran di dalam aplikasi',
            'Admin, karena paling cepat',
            'Peran spesifik sesuai tugasnya',
          ],
        ],
      ),
      p(
        'Baris pertama adalah yang paling mudah diperbaiki sekaligus paling sering dibiarkan. Aplikasi web tidak pernah mengubah struktur database saat melayani permintaan, karena perubahan struktur dilakukan lewat migrasi yang berjalan terpisah. Memberi kredensial aplikasi tanpa hak DDL tidak mengurangi kemampuannya sedikit pun, sekaligus menghapus skenario terburuk dari injeksi yang lolos.',
      ),
      p(
        'Alasan ia dibiarkan hampir selalu sama, yaitu kredensial pertama yang dibuat saat menyiapkan proyek adalah kredensial pemilik, karena kredensial itulah yang menjalankan migrasi pertama. Sesudah aplikasinya berjalan, tidak ada satu pun gejala yang mendorong siapa pun menggantinya, dan kredensial sementara itu berumur bertahun-tahun.',
      ),
      p(
        'Pemisahannya justru sederhana. Migrasi dijalankan terpisah dari aplikasi, biasanya sebagai langkah tersendiri saat rilis, sehingga ia boleh memakai kredensial pemilik skema. Aplikasi yang melayani permintaan memakai kredensial kedua yang hanya boleh membaca dan menulis baris. Keduanya menunjuk database yang sama, dan yang berbeda hanya kewenangannya.',
      ),
      p(
        'Baris ketiga menentukan apa yang bisa kamu lakukan saat insiden terjadi. Satu kunci yang dipakai bersama tidak bisa dicabut tanpa mematikan semua klien sekaligus, sehingga tim biasanya menunda pencabutan justru pada saat pencabutan paling dibutuhkan. Kunci per klien mengubah keputusan sulit itu menjadi tindakan rutin.',
      ),

      h2('Menerapkannya di database'),
      code(
        'sql',
        `
        -- Peran khusus untuk aplikasi, tanpa hak mengubah struktur.
        CREATE ROLE aplikasi_web LOGIN PASSWORD 'diambil-dari-vault';

        GRANT CONNECT ON DATABASE toko TO aplikasi_web;
        GRANT USAGE ON SCHEMA public TO aplikasi_web;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO aplikasi_web;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO aplikasi_web;

        -- Berlaku juga untuk tabel yang dibuat migrasi di kemudian hari.
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
          GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO aplikasi_web;

        -- Peran terpisah untuk pelaporan, hanya bisa membaca.
        CREATE ROLE pelaporan LOGIN PASSWORD 'diambil-dari-vault';
        GRANT CONNECT ON DATABASE toko TO pelaporan;
        GRANT USAGE ON SCHEMA public TO pelaporan;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO pelaporan;
        `,
      ),
      p(
        'Perhatikan daftar hak untuk `aplikasi_web` tidak memuat `CREATE`, `ALTER`, maupun `DROP`. Artinya injeksi SQL yang berhasil lolos tetap tidak bisa menghapus tabel atau menambah tabel baru. Kerusakan yang mungkin terjadi menyempit dari menghancurkan basis data menjadi mengubah baris pada tabel yang memang boleh diubah aplikasi.',
      ),
      p(
        'Yang terjadi ketika batas itu tersentuh juga layak diketahui, supaya kamu mengenali pesannya. Database menjawab dengan kesalahan izin seperti `permission denied for table pesanan`, dan aplikasimu melihatnya sebagai kegagalan query biasa. Kalau pesan itu muncul di produksi tanpa ada perubahan skema yang direncanakan, itu bukan gangguan yang perlu dilonggarkan izinnya, melainkan sinyal yang perlu diselidiki.',
      ),
      p(
        'Karena itu kesalahan izin database layak masuk ke daftar peristiwa yang dicatat di sub-bab 3.5. Aplikasi yang berjalan normal tidak pernah menyentuh batas yang memang tidak dibutuhkannya, sehingga setiap sentuhan pada batas itu berarti ada sesuatu yang berjalan di luar rancangan.',
      ),
      p(
        'Blok `ALTER DEFAULT PRIVILEGES` menutup masalah yang biasanya baru muncul beberapa bulan kemudian. Tanpanya, tabel yang dibuat migrasi berikutnya tidak akan bisa diakses aplikasi, dan orang yang sedang terburu-buru memperbaikinya cenderung mengambil jalan pintas dengan memberikan hak pemilik. Baris ini mencegah situasi itu lahir.',
      ),
      p(
        'Peran `pelaporan` memisahkan pekerjaan yang hanya membaca. Dashboard, ekspor data, dan query analitik tidak pernah perlu menulis, sehingga memberi mereka kredensial yang bisa menulis hanya menambah risiko tanpa menambah kemampuan. Pemisahan ini juga membuat query berat dari pelaporan lebih mudah dikenali di pemantauan.',
      ),

      h2('Kunci API dengan scope'),
      code(
        'ts',
        `
        type Scope = 'pesanan:baca' | 'pesanan:tulis' | 'produk:baca' | 'laporan:baca';

        export function butuhScope(...diperlukan: Scope[]) {
          return async (req, res, next) => {
            const kunci = await ambilKunciApi(req.get('X-Api-Key'));
            if (!kunci || kunci.dicabutPada) {
              return res.status(401).json({ pesan: 'Kunci tidak sah' });
            }

            const kurang = diperlukan.filter((satu) => !kunci.scope.includes(satu));
            if (kurang.length > 0) {
              catatPeristiwa('api.scope-kurang', { kunciId: kunci.id, kurang });
              return res.status(403).json({ pesan: 'Kunci tidak punya izin untuk aksi ini' });
            }

            req.kunci = kunci;
            next();
          };
        }

        app.get('/api/pesanan', butuhScope('pesanan:baca'), daftarPesanan);
        app.post('/api/pesanan', butuhScope('pesanan:tulis'), buatPesanan);
        `,
      ),
      p(
        'Tipe `Scope` yang berupa union membuat salah ketik menjadi error saat kompilasi, bukan lubang keamanan saat berjalan. Menulis `butuhScope("pesanan:bacaa")` dengan huruf berlebih akan ditolak TypeScript, sedangkan pada versi yang memakai string bebas kesalahan itu hanya membuat pemeriksaan selalu gagal atau, lebih buruk lagi, selalu lolos.',
      ),
      p(
        'Perhatikan status yang dikembalikan berbeda, yaitu `401` untuk kunci tidak sah dan `403` untuk kunci sah yang tidak berhak. Perbedaan ini membantu klien memahami apa yang harus mereka perbaiki, dan keduanya sama-sama tidak membocorkan apa pun tentang sumber daya yang diminta.',
      ),
      p(
        'Pencatatan pada cabang `403` layak dipasang karena polanya berarti. Satu kunci yang berulang kali meminta izin yang tidak dimilikinya menunjukkan salah satu dari dua hal, yaitu integrasi klien yang salah konfigurasi, atau kunci yang bocor lalu dicoba-coba orang lain. Keduanya perlu diketahui.',
      ),

      h2('Mencabut hak yang tidak lagi dibutuhkan'),
      p(
        'Memberi hak adalah pekerjaan yang selalu dilakukan karena ada yang meminta. Mencabutnya tidak pernah diminta siapa pun, dan karena itulah ia terlupakan.',
      ),
      ul(
        '**Beri hak dengan masa berlaku bila memungkinkan.** Akses sementara untuk menyelidiki satu masalah tidak perlu berumur selamanya.',
        '**Tinjau berkala.** Sekali dalam satu kuartal, cocokkan daftar identitas dengan daftar yang benar-benar masih dipakai.',
        '**Cabut saat orang berpindah peran**, bukan hanya saat ia keluar. Perpindahan tim adalah sumber utama penumpukan hak.',
        '**Catat siapa yang memberi hak dan kenapa.** Tanpa alasan yang tercatat, tidak akan ada yang berani mencabutnya nanti.',
        '**Pisahkan kredensial per lingkungan.** Kunci pengembangan tidak boleh bisa menyentuh data produksi.',
      ),
      p(
        'Poin terakhir menutup satu kejadian yang berulang di banyak tim. Seseorang menjalankan skrip perbaikan data di komputernya, mengira ia terhubung ke basis data pengembangan, padahal berkas konfigurasinya masih menunjuk produksi. Kredensial yang terpisah membuat kesalahan itu berakhir sebagai error koneksi, bukan sebagai kehilangan data.',
      ),
      callout(
        'tip',
        'Pertanyaan yang menutup sebagian besar kasus',
        'Setiap kali membuat kredensial baru, tanyakan satu hal, yaitu apa saja yang bisa dilakukan pemegangnya kalau kredensial ini bocor besok. Kalau jawabannya lebih luas dari tugas yang sedang dikerjakannya, haknya masih terlalu lebar.',
      ),

      h2('Studi kasus di project nyata'),
      p(
        'Hak seminimal mungkin adalah satu-satunya kontrol di bab ini yang bekerja **setelah** semua kontrol lain gagal. Ia tidak mencegah kerentanan, dan ia menentukan seberapa jauh kerusakan bisa menyebar ketika satu kerentanan berhasil dipakai.',
      ),
      p('Selisihnya bisa diukur, dan bentuknya sangat langsung.'),
      code(
        'text',
        `
        Diuji sungguhan dengan node:sqlite pada Node 26.5.0. Koneksi
        yang hanya perlu MEMBACA, dibuka sebagai hanya-baca:

          SELECT -> [{"id":1,"judul":"Satu"},{"id":2,"judul":"Dua"}]
          UPDATE -> DITOLAK: attempt to write a readonly database
          DELETE -> DITOLAK: attempt to write a readonly database
          DROP   -> DITOLAK: attempt to write a readonly database
          CREATE -> DITOLAK: attempt to write a readonly database

        Isi tabel sesudah keempat percobaan:
          [{"id":1,"judul":"Satu"},{"id":2,"judul":"Dua"}]
        `,
        {
          caption:
            'Keempatnya adalah injeksi SQL yang BERHASIL dirakit sepenuhnya. Yang menghentikannya bukan validasi, melainkan hak koneksi.',
        },
      ),
      p(
        'Prinsip yang sama berlaku di basis data sungguhan, dan menuliskannya hanya memerlukan beberapa baris yang dijalankan sekali.',
      ),
      code(
        'text',
        `
        PostgreSQL, untuk aplikasi yang hanya membaca dan menulis baris:

          REVOKE ALL ON SCHEMA public FROM app;
          GRANT USAGE ON SCHEMA public TO app;
          GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app;
          -- tidak ada DELETE (pakai penandaan terhapus)
          -- tidak ada DDL, dan app BUKAN pemilik skema

        Untuk job laporan, kredensial terpisah:
          GRANT SELECT ON ALL TABLES IN SCHEMA public TO pelapor;

        Untuk migrasi, kredensial terpisah lagi, yang HANYA dipakai
        saat menjalankan migrasi dan tidak pernah dipegang aplikasi.
        `,
      ),
      p(
        'Prinsip itu berlaku untuk setiap identitas di sistem, bukan hanya untuk peran pengguna di aplikasi. Menuliskan daftarnya membuat yang terlewat menjadi terlihat.',
      ),
      table(
        ['Identitas', 'Yang sering diberikan', 'Yang sebenarnya dibutuhkan'],
        [
          [
            'Pengguna basis data aplikasi',
            'Pemilik skema, semua hak',
            '`SELECT`, `INSERT`, `UPDATE` pada tabel yang memang dipakai',
          ],
          [
            'Kunci API ke layanan pihak ketiga',
            'Satu kunci penuh untuk semua fitur',
            'Kunci terpisah per fitur, dengan scope sekecil mungkin',
          ],
          [
            'Token CI/CD',
            'Akses tulis ke seluruh organisasi',
            'Akses ke satu repositori, dan hanya aksi yang memang dijalankan',
          ],
          [
            'Peran cloud untuk aplikasi',
            'Satu peran admin karena praktis',
            'Satu bucket, satu antrean, satu rahasia yang memang dibaca',
          ],
          [
            'Akun dukungan pelanggan',
            'Bisa melihat semua data pelanggan',
            'Akses berbatas waktu, dicatat, dan hanya untuk tiket yang aktif',
          ],
          [
            'Job latar',
            'Kredensial yang sama dengan aplikasi web',
            'Kredensialnya sendiri, dengan hak yang sesuai tugasnya',
          ],
        ],
      ),
      p(
        'Baris terakhir sering tidak dianggap penting sampai satu job yang mengirim surel ternyata juga punya hak menghapus tabel, hanya karena ia memakai kredensial yang sama dengan aplikasi.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Menerapkan hak minimal menghasilkan error, dan itu tanda yang benar. Yang perlu dikenali adalah bedanya antara error yang menandai hak kurang dan error yang menandai serangan.',
      ),
      code(
        'text',
        `
        HAK KURANG — muncul saat pengembangan, wajar dan mudah diperbaiki:

          error: permission denied for table artikel
          error: permission denied for schema public
          Error: attempt to write a readonly database
          AccessDenied: User is not authorized to perform s3:PutObject

        Perbaikannya: tambahkan hak yang MEMANG dibutuhkan operasi itu,
        satu per satu. Bukan memberi hak penuh lalu melanjutkan.

        SERANGAN — bentuk errornya SAMA, konteksnya berbeda:

          permission denied for table pengguna
            dari job yang tidak pernah menyentuh tabel pengguna
          AccessDenied: s3:DeleteObject
            dari layanan yang tugasnya hanya mengunggah

        Yang membedakan bukan pesannya melainkan SIAPA yang mengalaminya
        dan terhadap APA. Karena itu penolakan izin harus masuk audit log.
        `,
      ),
      p(
        'Kesalahan yang paling sering terjadi saat menerapkan hak minimal adalah memperbaikinya dengan cara yang membatalkan seluruh manfaatnya.',
      ),
      code(
        'text',
        `
        Ada error izin di staging, tenggat besok:

          BURUK : GRANT ALL PRIVILEGES ON ALL TABLES TO app;
                  -> error hilang, dan begitu juga seluruh batasnya

          BAIK  : baca pesannya, lihat tabel dan operasi apa yang
                  disebut, lalu berikan tepat itu:
                  GRANT SELECT, INSERT ON artikel TO app;

        Cara mencegah keadaan itu: jalankan pengembangan lokal dengan
        kredensial yang HAK-nya sama dengan produksi. Error izin yang
        muncul di laptop hari ini adalah error izin yang tidak muncul
        di produksi bulan depan.
        `,
      ),
      p(
        'Ada satu kelas kesalahan yang tidak menghasilkan error sama sekali, yaitu hak yang berlebihan tetapi tidak pernah dipakai. Ia diam sampai ada yang memakainya.',
      ),
      code(
        'text',
        `
        Cara menemukannya di PostgreSQL:

          SELECT grantee, table_name, privilege_type
          FROM information_schema.role_table_grants
          WHERE grantee = 'app'
          ORDER BY table_name;

        Lalu bandingkan dengan daftar operasi yang BENAR-BENAR
        dijalankan aplikasi. Hak yang tidak ada pasangannya di daftar
        itu adalah hak yang bisa dicabut hari ini tanpa akibat apa pun.

        Yang paling sering ditemukan berlebihan:
          - DELETE pada tabel yang memakai penandaan terhapus
          - hak pada tabel milik modul yang sudah dihapus
          - keanggotaan peran yang diwarisi tanpa disadari
        `,
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Hak minimal adalah kontrol yang paling sering ditunda karena manfaatnya baru terasa pada hari yang buruk, dan biayanya terasa setiap hari.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai pemilik skema sebagai pengguna aplikasi',
            'Migrasinya kan butuh hak itu',
            'Migrasi dijalankan terpisah dengan kredensialnya sendiri. Aplikasi tidak pernah butuh DDL',
          ],
          [
            'Memberi `GRANT ALL` saat ada error izin',
            'Biar cepat selesai',
            'Errornya hilang beserta seluruh batasnya. Baca pesannya, berikan tepat yang disebutkan',
          ],
          [
            'Satu kredensial untuk aplikasi, job, dan laporan',
            'Lebih gampang dikelola',
            'Job yang mengirim surel ikut punya hak menghapus tabel. Pisahkan per tugas',
          ],
          [
            'Memakai kredensial berbeda di lokal dan produksi',
            'Biar pengembangan tidak terhambat',
            'Error izin baru muncul di produksi. Samakan HAK-nya, meski datanya berbeda',
          ],
          [
            'Menganggap hak minimal hanya soal peran pengguna',
            'Yang dibatasi kan penggunanya',
            'Kunci API, token CI, peran cloud, dan job latar semuanya identitas yang perlu dibatasi',
          ],
          [
            'Tidak pernah meninjau ulang hak yang sudah diberikan',
            'Kan sudah diatur di awal',
            'Hak yang tidak dipakai tidak menghasilkan error. Ia diam sampai ada yang memakainya',
          ],
        ],
      ),
      p(
        'Cara menilai apakah hak minimal sudah benar-benar diterapkan hanya perlu satu pertanyaan yang diajukan untuk tiap identitas, yaitu apa hal terburuk yang bisa dilakukan pemegang kredensial ini bila ia sepenuhnya dikuasai penyerang. Bila jawabannya untuk pengguna basis data aplikasi adalah "menghapus seluruh tabel", maka satu kerentanan injeksi sekecil apa pun berarti kehilangan seluruh basis data. Bila jawabannya "membaca dan mengubah baris yang memang bisa diakses aplikasi", kerentanan yang sama tetap serius dan tidak lagi menghancurkan.',
      ),
      references(
        {
          label: 'A01:2021 — Broken Access Control',
          href: 'https://owasp.org/Top10/A01_2021-Broken_Access_Control/',
          source: 'OWASP',
          note: 'Kategori peringkat satu, dengan hak berlebih sebagai salah satu penyebabnya.',
        },
        {
          label: 'Authorization Cheat Sheet',
          href: 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
          source: 'OWASP',
          note: 'Anjuran menolak secara bawaan lalu memberi izin secara eksplisit.',
        },
        {
          label: 'GRANT',
          href: 'https://www.postgresql.org/docs/current/sql-grant.html',
          source: 'PostgreSQL',
          note: 'Rujukan resmi setiap hak yang bisa diberikan beserta cakupannya.',
        },
        {
          label: 'ALTER DEFAULT PRIVILEGES',
          href: 'https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html',
          source: 'PostgreSQL',
          note: 'Cara memastikan tabel yang dibuat kemudian ikut mewarisi hak yang benar.',
        },
      ),
    ],
  ),
];
