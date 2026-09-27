import {
  larangStruktur,
  mesinStruktur,
  soal,
  urutStruktur,
  wajibStruktur,
} from '@/lib/taman-bermain/builders';
import type { Exercise } from '@/lib/taman-bermain/types';

/**
 * React — reusing a component from another file.
 *
 * Every exercise here shows a finished component and asks for the CALL SITE, which is the half
 * that decides whether a component is actually reusable. A component can be beautifully written
 * and still be unusable because its props are wrong, and that only becomes visible at the place
 * where someone tries to use it a second time.
 *
 * Graded by the structural engine: there is no bundler here, so JSX cannot be executed. What is
 * checked is the shape of the call — the import, the props, the key, the composition.
 *
 * Patterns that look inside braces use a lookahead — `\{(?=[^}]*?X)[^}]*\}` — instead of
 * `\{[^}]*X[^}]*\}`. The two match the same text, but the second backtracks cubically when the
 * closing brace never comes, and froze the grader for five seconds on 20,000 characters.
 */

export const exercises: Exercise[] = [
  soal({
    slug: 'pakai-komponen-di-file-lain',
    title: 'Pakai komponen dari file lain',
    topic: 'reuse-komponen',
    level: 'basic',
    realWorldUse:
      'Hal pertama yang dilakukan setiap orang dengan komponen bersama, yaitu mengimpornya lalu memanggilnya dari halaman lain. Salah di langkah ini dan komponennya tidak pernah benar-benar dipakai ulang.',
    source: { category: 'frontend-intermediate', chapter: 'pembuatan-komponen-react' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Tim kamu sudah membuat komponen `Button` yang dipakai di seluruh aplikasi, supaya semua tombol punya tampilan yang sama. Komponen itu ada di file `src/components/ui/button.tsx`. Sekarang kamu membuat halaman produk dan butuh tombol "Simpan produk". Daripada membuat tombol baru, kamu memakai `Button` yang sudah ada.',
      tasks: [
        'Tulis isi file `src/app/produk/page.tsx`.',
        'Import `Button` dari `@/components/ui/button`.',
        'Pakai `<Button>` satu kali dengan `variant="primary"`.',
        'Kirim `onClick` yang menjalankan fungsi `simpan`.',
        'Teks tombolnya **Simpan produk**, ditulis di antara tag pembuka dan penutup `<Button>`.',
      ],
      given: {
        file: 'src/components/ui/button.tsx',
        lang: 'tsx',
        code: `
          export function Button({ variant = 'secondary', onClick, children }) {
            return (
              <button type="button" className={variant} onClick={onClick}>
                {children}
              </button>
            );
          }
        `,
      },
      pitfalls: [
        '`Button` adalah **named export**, karena ditulis `export function Button`. Cara import-nya memakai kurung kurawal. Salah bentuk import adalah kesalahan paling sering di langkah ini, dan pesan error-nya menunjuk ke tempat yang salah.',
        'Kirim fungsinya dengan `onClick={simpan}`, bukan `onClick={simpan()}`. Yang kedua memanggil `simpan` saat halaman digambar, sehingga aksinya jalan tanpa ada yang mengklik.',
        'Jangan membuat `<button>` baru sendiri. Tombol buatan sendiri tampilannya akan menyimpang dari tombol lain di aplikasi.',
      ],
      terms: [
        {
          term: 'named export',
          meaning:
            'Cara mengekspor dengan menyebut namanya, misalnya `export function Button`. Satu file bisa punya banyak named export. Cara import-nya wajib memakai kurung kurawal dan nama yang sama, yaitu `import { Button } from "..."`.',
        },
        {
          term: 'default export',
          meaning:
            'Cara mengekspor satu hal utama dari sebuah file, misalnya `export default function Halaman`. Cara import-nya tanpa kurung kurawal, yaitu `import Halaman from "..."`. Kalau kamu meng-import named export dengan cara default, hasilnya `undefined`.',
        },
        {
          term: 'props',
          meaning:
            'Singkatan dari properties, yaitu data yang dikirim ke komponen, mirip argumen pada fungsi. Pada `<Button variant="primary">`, `variant` adalah prop. Komponen menerimanya sebagai objek di parameter pertamanya.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus yang isinya apa pun yang kamu tulis di antara tag pembuka dan penutup komponen. Pada `<Button>Simpan</Button>`, `children` bernilai `"Simpan"`. Komponen `Button` menampilkannya lewat `{children}`.',
        },
      ],
    },
    rules: [
      'Import `Button` sebagai named import dari `@/components/ui/button`.',
      'Memakai `<Button>` dengan `variant="primary"`.',
      'Mengirim `onClick` yang memanggil `simpan`.',
      'Teks tombol dikirim sebagai `children`, bukan sebagai prop.',
    ],
    starter: `
      function simpan() {
        // sudah ada, tidak perlu diubah
      }

      export default function HalamanProduk() {
        return (
          <main>
            {/* import Button di atas, lalu pakai di sini */}
          </main>
        );
      }
    `,
    hints: [
      'Named export di-import dengan kurung kurawal, sedangkan default export tanpa kurung kurawal.',
      'Teks di antara tag pembuka dan penutup komponen otomatis masuk sebagai `children`.',
      'Bentuknya `import { Button } from "@/components/ui/button";` lalu `<Button variant="primary" onClick={simpan}>Simpan produk</Button>`.',
    ],
    solution: {
      code: `
        // Button adalah named export, jadi import-nya memakai kurung kurawal.
        import { Button } from '@/components/ui/button';

        function simpan() {
          // sudah ada, tidak perlu diubah
        }

        export default function HalamanProduk() {
          return (
            <main>
              {/* onClick={simpan} mengirim fungsinya, bukan memanggilnya sekarang */}
              <Button variant="primary" onClick={simpan}>
                Simpan produk
              </Button>
            </main>
          );
        }
      `,
      steps: [
        '`import { Button } from "@/components/ui/button"` mengambil komponen `Button` dari file lain. Kurung kurawal wajib karena `Button` adalah named export.',
        '`<Button ...>` memakai komponen itu seperti tag HTML, dan setiap atribut yang ditulis dikirim sebagai prop.',
        '`variant="primary"` mengirim teks `"primary"`, sehingga tombolnya memakai tampilan utama.',
        '`onClick={simpan}` mengirim fungsi `simpan` apa adanya. `Button` nanti memanggilnya ketika tombol benar-benar diklik.',
        'Teks "Simpan produk" di antara tag pembuka dan penutup menjadi `children`, lalu `Button` menampilkannya di dalam tombol.',
      ],
      explanation:
        '`onClick={simpan}` mengirim fungsinya, sedangkan `onClick={simpan()}` memanggilnya saat halaman digambar lalu mengirim hasilnya. Yang kedua menjalankan aksi tanpa ada yang mengklik apa pun, dan bug itu sulit terlihat karena keduanya hanya berbeda dua karakter.',
    },
    alternativeSolutions: [
      `
        import { Button } from '@/components/ui/button';

        function simpan() {}

        export default function HalamanProduk() {
          return (
            <main>
              <Button onClick={() => simpan()} variant="primary">
                Simpan produk
              </Button>
            </main>
          );
        }
      `,
      `
        import { Button } from "@/components/ui/button";

        function simpan() {}

        export default function HalamanProduk() {
          return (
            <main>
              <section>
                <Button variant="primary" onClick={simpan}>Simpan produk</Button>
              </section>
            </main>
          );
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          import Button from '@/components/ui/button';

          function simpan() {}

          export default function HalamanProduk() {
            return (
              <main>
                <Button variant="primary" onClick={simpan}>Simpan produk</Button>
              </main>
            );
          }
        `,
        reason:
          'Memakai default import, padahal `Button` adalah named export. Nilainya menjadi `undefined` dan halaman gagal digambar.',
      },
      {
        code: `
          import { Button } from '@/components/ui/button';

          function simpan() {}

          export default function HalamanProduk() {
            return (
              <main>
                <Button variant="primary" onClick={simpan} label="Simpan produk" />
              </main>
            );
          }
        `,
        reason:
          'Teks dikirim sebagai prop `label`, padahal `Button` membacanya dari `children`, sehingga tombolnya kosong.',
      },
      {
        code: `
          function simpan() {}

          export default function HalamanProduk() {
            return (
              <main>
                <button type="button" onClick={simpan}>Simpan produk</button>
              </main>
            );
          }
        `,
        reason: 'Menulis ulang tombol sendiri alih-alih memakai komponen `Button` yang sudah ada.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'named-import',
        'Import `Button` sebagai named import',
        '`Button` adalah named export, jadi import-nya memakai kurung kurawal, yaitu `import { Button } from "@/components/ui/button"`. Default import menghasilkan `undefined`.',
        'import\\s*\\{(?=[^}]*?\\bButton\\b)[^}]*\\}\\s*from\\s*[\'"]@/components/ui/button[\'"]',
      ),
      wajibStruktur(
        'pakai-komponen',
        'Memakai `<Button>` di JSX',
        'Belum ada elemen `<Button>` yang ditampilkan.',
        '<Button[\\s>]',
      ),
      wajibStruktur(
        'prop-variant',
        'Mengirim `variant="primary"`',
        'Prop `variant` belum diisi `"primary"`, sehingga tombolnya memakai tampilan bawaan.',
        'variant\\s*=\\s*[\'"]primary[\'"]',
      ),
      wajibStruktur(
        'prop-onclick',
        'Mengirim `onClick` yang memanggil `simpan`',
        'Belum ada `onClick` yang menunjuk fungsi `simpan`. Ingat, `onClick={simpan}` mengirim fungsinya, sedangkan `onClick={simpan()}` memanggilnya saat halaman digambar.',
        'onClick\\s*=\\s*\\{\\s*(simpan|\\(\\)\\s*=>\\s*simpan\\s*\\(\\s*\\))\\s*\\}',
      ),
      wajibStruktur(
        'teks-children',
        'Teks tombol dikirim sebagai `children`',
        'Teks "Simpan produk" harus berada di antara `<Button>` dan `</Button>`, bukan sebagai prop.',
        '<Button[^>]*>(?=(?:(?!</Button>)[\\s\\S])*?Simpan produk)(?=[\\s\\S]*?</Button>)',
      ),
      larangStruktur(
        'tanpa-tombol-mentah',
        'Tidak menulis ulang `<button>` sendiri',
        'Soal ini tentang memakai komponen yang sudah ada. Membuat tombol sendiri menghasilkan tombol kedua yang tampilannya akan menyimpang.',
        '<button[\\s>]',
      ),
    ]),
  }),

  soal({
    slug: 'komponen-dalam-daftar',
    title: 'Pakai komponen di dalam daftar',
    topic: 'reuse-komponen',
    level: 'basic',
    realWorldUse:
      'Menampilkan daftar produk, baris tabel, atau kumpulan kartu. Ini bentuk paling sering sebuah komponen dipakai ulang, dan tempat `key` paling sering dipilih dengan salah.',
    source: { category: 'frontend-intermediate', chapter: 'pembuatan-komponen-react' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Kamu punya komponen `KartuProduk` yang menampilkan satu produk. Halaman katalog perlu menampilkan puluhan produk sekaligus, dan jumlahnya berubah-ubah tergantung data dari server. Kamu tidak mungkin menulis `<KartuProduk>` satu per satu secara manual, jadi kartu-kartu itu dibuat dari array produk.',
      tasks: [
        'Tulis isi komponen `DaftarProduk`, yang menerima prop `produk` berupa array.',
        'Import `KartuProduk` dari `@/components/kartu-produk`.',
        'Tampilkan satu `KartuProduk` untuk setiap item di array, masing-masing dibungkus `<li>`.',
        'Kirim item itu ke `KartuProduk` lewat prop bernama `produk`.',
        'Pasang `key` yang diambil dari `id` produk.',
      ],
      given: {
        file: 'src/components/kartu-produk.tsx',
        lang: 'tsx',
        code: `
          export function KartuProduk({ produk }) {
            return (
              <article className="kartu">
                <h3>{produk.nama}</h3>
                <p>{produk.harga}</p>
              </article>
            );
          }
        `,
      },
      pitfalls: [
        '`key` harus memakai `produk.id`, bukan index array. Index terlihat bekerja sampai ada item yang dihapus atau daftarnya diurutkan ulang. Setelah itu React mencocokkan elemen dengan data yang salah, dan isian form di dalam kartu bisa berpindah ke kartu lain.',
        '`key` dipasang di elemen terluar yang dihasilkan `.map()`, yaitu `<li>`, bukan di `<KartuProduk>` yang ada di dalamnya.',
      ],
      terms: [
        {
          term: 'key',
          meaning:
            'Prop khusus yang dipakai React untuk mengenali setiap elemen di dalam daftar. Nilainya harus unik dan tetap, misalnya id dari database. Dengan `key`, React tahu elemen mana yang ditambah, dihapus, atau dipindah tanpa perlu menggambar ulang semuanya.',
        },
        {
          term: '.map() di JSX',
          meaning:
            'Cara menampilkan daftar di React. `{produk.map((item) => <li key={item.id}>...</li>)}` mengubah setiap item menjadi satu elemen. Tanda kurung kurawal di luar diperlukan karena itu kode JavaScript yang disisipkan ke dalam JSX.',
        },
        {
          term: 'index sebagai key',
          meaning:
            'Memakai posisi item di array sebagai key, misalnya `key={index}`. Ini bermasalah karena posisi berubah ketika item dihapus atau diurutkan. Item yang sama mendapat key yang berbeda, dan React salah mencocokkan elemen lama dengan data baru.',
        },
      ],
    },
    rules: [
      'Import `KartuProduk`.',
      'Memakai `.map()` untuk menampilkan satu kartu per item.',
      '`key` memakai `id`, bukan index.',
    ],
    starter: `
      export function DaftarProduk({ produk }) {
        return (
          <ul>
            {/* tampilkan satu KartuProduk untuk setiap item */}
          </ul>
        );
      }
    `,
    hints: [
      'Satu item masuk, satu elemen keluar. Itu `.map()`.',
      '`key` dipasang di elemen terluar yang dihasilkan `.map()`, bukan di dalamnya.',
      'Bentuknya `{produk.map((item) => <li key={item.id}><KartuProduk produk={item} /></li>)}`.',
    ],
    solution: {
      code: `
        import { KartuProduk } from '@/components/kartu-produk';

        export function DaftarProduk({ produk }) {
          return (
            <ul>
              {produk.map((item) => (
                // key di elemen TERLUAR yang dihasilkan map, dan diambil dari id, bukan index
                <li key={item.id}>
                  <KartuProduk produk={item} />
                </li>
              ))}
            </ul>
          );
        }
      `,
      steps: [
        '`import { KartuProduk } from "@/components/kartu-produk"` mengambil komponen kartu dari file lain.',
        '`produk.map((item) => ...)` membuat satu elemen untuk setiap item di array.',
        'Setiap elemen berupa `<li>`, dan `key={item.id}` dipasang di situ karena `<li>` adalah elemen terluar yang dihasilkan `.map()`.',
        '`<KartuProduk produk={item} />` mengirim item itu ke komponen kartu lewat prop bernama `produk`, sesuai yang dibaca `KartuProduk`.',
      ],
      explanation:
        '`key` dipasang di `<li>`, elemen terluar yang dihasilkan `.map()`, bukan di `<KartuProduk>` di dalamnya. React membaca key dari elemen yang langsung berada di dalam array. Memasangnya satu tingkat lebih dalam berarti React tidak melihatnya sama sekali.',
    },
    alternativeSolutions: [
      `
        import { KartuProduk } from '@/components/kartu-produk';

        export function DaftarProduk({ produk }) {
          return (
            <ul>
              {produk.map(function (item) {
                return (
                  <li key={item.id}>
                    <KartuProduk produk={item} />
                  </li>
                );
              })}
            </ul>
          );
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          import { KartuProduk } from '@/components/kartu-produk';

          export function DaftarProduk({ produk }) {
            return (
              <ul>
                {produk.map((item, index) => (
                  <li key={index}>
                    <KartuProduk produk={item} />
                  </li>
                ))}
              </ul>
            );
          }
        `,
        reason:
          'Memakai index sebagai key, yang rusak begitu daftarnya diurutkan atau ada item yang dihapus.',
      },
      {
        code: `
          import { KartuProduk } from '@/components/kartu-produk';

          export function DaftarProduk({ produk }) {
            return (
              <ul>
                <li>
                  <KartuProduk produk={produk[0]} />
                </li>
              </ul>
            );
          }
        `,
        reason: 'Hanya menampilkan item pertama, bukan seluruh isi array.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'impor-kartu',
        'Import `KartuProduk`',
        'Belum ada `import` untuk `KartuProduk`.',
        'import\\s*\\{(?=[^}]*?\\bKartuProduk\\b)[^}]*\\}\\s*from',
      ),
      wajibStruktur(
        'pakai-map',
        'Memakai `.map()` untuk menampilkan daftar',
        'Belum ada `.map()`. Menampilkan satu elemen per item dilakukan dengan `.map()`, bukan ditulis satu per satu.',
        '\\.map\\s*\\(',
      ),
      wajibStruktur(
        'key-dari-id',
        '`key` memakai `id`',
        '`key` harus diambil dari id item, misalnya `key={item.id}`.',
        'key\\s*=\\s*\\{(?=[^}]*?\\.id)[^}]*\\}',
      ),
      larangStruktur(
        'key-bukan-indeks',
        '`key` tidak memakai index array',
        '`key={index}` terlihat bekerja sampai ada item yang dihapus atau daftarnya diurutkan ulang. Setelah itu React mencocokkan elemen dengan data yang salah.',
        'key\\s*=\\s*\\{\\s*(i|idx|index)\\s*\\}',
      ),
      wajibStruktur(
        'kirim-prop-produk',
        'Mengirim prop `produk` ke kartunya',
        '`KartuProduk` membaca satu prop bernama `produk`, tapi belum ada yang dikirim.',
        '<KartuProduk[^>]*produk\\s*=\\s*\\{',
      ),
    ]),
  }),

  soal({
    slug: 'angkat-jadi-props',
    title: 'Ubah komponen hardcoded menjadi bisa dipakai ulang',
    topic: 'reuse-komponen',
    level: 'intermediate',
    realWorldUse:
      'Momen ketika sebuah komponen dibutuhkan untuk kedua kalinya. Nilai yang tadinya ditulis langsung harus dipindah menjadi props. Kalau tidak, orang akan menyalin seluruh file dan kamu punya dua komponen yang harus diperbaiki dua kali.',
    source: { category: 'frontend-intermediate', chapter: 'pembuatan-komponen-react' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Dashboard toko punya komponen `KartuStatistik` yang menampilkan total pesanan. Isinya ditulis langsung di dalam komponen, yaitu judul "Total Pesanan", angka 1.248, dan satuan "pesanan". Sekarang dashboard butuh kartu yang sama untuk total pelanggan dan total pendapatan. Supaya komponen ini bisa dipakai ulang, isinya harus datang dari luar lewat props.',
      tasks: [
        'Ubah `KartuStatistik` yang ada di editor supaya menerima tiga props, yaitu `judul`, `nilai`, dan `satuan`.',
        'Tampilkan ketiga props itu di tempat teks yang tadinya ditulis langsung.',
        'Beri `satuan` nilai bawaan `"item"`, supaya pemanggil yang tidak peduli satuan tidak wajib menuliskannya.',
        'Struktur JSX-nya tidak berubah. Yang berubah hanya asal isinya.',
      ],
      pitfalls: [
        'Tulis nilai bawaan di tempat destructuring, yaitu `{ satuan = "item" }`, bukan dengan `satuan || "item"` di dalam fungsi. Bentuk `||` ikut menimpa string kosong yang sengaja dikirim pemanggil.',
        'Pastikan TIDAK ada lagi teks yang ditulis langsung. Satu judul yang tertinggal membuat komponennya tetap hanya cocok untuk satu keperluan.',
      ],
      terms: [
        {
          term: 'hardcoded',
          meaning:
            'Nilai yang ditulis langsung di dalam kode, sehingga tidak bisa diubah tanpa menyunting kode itu. Pada `<p>Total Pesanan</p>`, teks "Total Pesanan" adalah hardcoded. Kebalikannya nilai yang datang dari luar, misalnya lewat props.',
        },
        {
          term: 'destructuring',
          meaning:
            'Cara membongkar isi objek langsung ke variabel. `function Kartu({ judul, nilai })` mengambil `judul` dan `nilai` dari objek props yang diterima. Tanpa destructuring kamu harus menulis `props.judul` dan `props.nilai` setiap kali.',
        },
        {
          term: 'nilai bawaan (default value)',
          meaning:
            'Nilai yang dipakai kalau sebuah parameter tidak dikirim. Pada `{ satuan = "item" }`, `satuan` bernilai `"item"` kalau pemanggil tidak menyebutnya. Nilai bawaan hanya berlaku kalau nilainya `undefined`, bukan kalau nilainya string kosong.',
        },
      ],
    },
    rules: [
      'Menerima `judul`, `nilai`, dan `satuan` sebagai props.',
      '`satuan` punya nilai bawaan `"item"`.',
      'Tidak ada lagi teks yang ditulis langsung di JSX.',
    ],
    starter: `
      export function KartuStatistik() {
        return (
          <div className="kartu">
            <p>Total Pesanan</p>
            <strong>1.248</strong>
            <span>pesanan</span>
          </div>
        );
      }
    `,
    hints: [
      'Props bisa langsung di-destructure di daftar parameter fungsi.',
      'Nilai bawaan ditulis di tempat destructuring, yaitu `{ satuan = "item" }`.',
      'Bentuknya `export function KartuStatistik({ judul, nilai, satuan = "item" })`.',
    ],
    solution: {
      code: `
        // Isi kartu kini datang dari luar. satuan punya nilai bawaan "item".
        export function KartuStatistik({ judul, nilai, satuan = 'item' }) {
          return (
            <div className="kartu">
              <p>{judul}</p>
              <strong>{nilai}</strong>
              <span>{satuan}</span>
            </div>
          );
        }
      `,
      steps: [
        '`{ judul, nilai, satuan = "item" }` membongkar objek props menjadi tiga variabel dengan destructuring.',
        '`satuan = "item"` memberi nilai bawaan yang dipakai kalau pemanggil tidak mengirim `satuan`.',
        'Teks yang tadinya ditulis langsung diganti dengan `{judul}`, `{nilai}`, dan `{satuan}`.',
        'Sekarang komponen yang sama bisa dipakai untuk apa saja, misalnya `<KartuStatistik judul="Pelanggan" nilai={320} />`.',
      ],
      explanation:
        'Nilai bawaan ditulis di tempat destructuring, bukan lewat `satuan || "item"` di dalam badan fungsi. Bedanya terasa ketika pemanggil sengaja mengirim string kosong. Bentuk `||` akan menimpanya menjadi `"item"`, sedangkan nilai bawaan hanya berlaku kalau propnya benar-benar `undefined`.',
    },
    alternativeSolutions: [
      `
        export function KartuStatistik(props) {
          const { judul, nilai } = props;
          const satuan = props.satuan === undefined ? 'item' : props.satuan;

          return (
            <div className="kartu">
              <p>{judul}</p>
              <strong>{nilai}</strong>
              <span>{satuan}</span>
            </div>
          );
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          export function KartuStatistik({ judul, nilai, satuan }) {
            return (
              <div className="kartu">
                <p>{judul}</p>
                <strong>{nilai}</strong>
                <span>{satuan}</span>
              </div>
            );
          }
        `,
        reason:
          'Tanpa nilai bawaan, `satuan` menjadi `undefined` kalau pemanggil tidak mengirimnya.',
      },
      {
        code: `
          export function KartuStatistik({ nilai, satuan = 'item' }) {
            return (
              <div className="kartu">
                <p>Total Pesanan</p>
                <strong>{nilai}</strong>
                <span>{satuan}</span>
              </div>
            );
          }
        `,
        reason:
          'Judulnya masih hardcoded, sehingga komponennya tetap hanya cocok untuk total pesanan.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'props-dibongkar',
        'Menerima `judul` dan `nilai` sebagai props',
        'Belum ada `judul` dan `nilai` di daftar parameter atau di destructuring props.',
        'judul[\\s\\S]{0,120}nilai',
      ),
      wajibStruktur(
        'satuan-bawaan',
        '`satuan` punya nilai bawaan `"item"`',
        'Belum ada nilai bawaan. Tulis di tempat destructuring, yaitu `{ satuan = "item" }`, bukan `satuan || "item"` yang juga menimpa string kosong yang sengaja dikirim.',
        'satuan\\s*=\\s*[\'"]item[\'"]|satuan\\s*===\\s*undefined',
      ),
      larangStruktur(
        'tanpa-judul-hardcoded',
        'Judul tidak lagi hardcoded di JSX',
        'Teks "Total Pesanan" masih ada di JSX, sehingga komponennya tetap hanya cocok untuk satu keperluan.',
        '>\\s*Total Pesanan\\s*<',
      ),
      larangStruktur(
        'tanpa-angka-hardcoded',
        'Angka tidak lagi hardcoded di JSX',
        'Angka 1.248 masih tertulis langsung di JSX.',
        '>\\s*1\\.248\\s*<',
      ),
      wajibStruktur(
        'judul-dirender',
        'Prop `judul` benar-benar ditampilkan',
        'Prop `judul` sudah diterima tapi belum dipakai di JSX. Tulis `{judul}` di tempat teksnya tadi.',
        '\\{\\s*judul\\s*\\}',
      ),
    ]),
  }),

  soal({
    slug: 'children-bukan-boolean',
    title: 'Ganti tumpukan boolean props dengan `children`',
    topic: 'reuse-komponen',
    level: 'intermediate',
    realWorldUse:
      'Komponen yang tumbuh lewat penambahan boolean seperti `adaIkon`, `adaBadge`, dan `adaAksi`, sampai tidak ada yang bisa menebak apa yang akan muncul. Jalan keluarnya hampir selalu composition.',
    source: { category: 'frontend-intermediate', chapter: 'jenis-komponen-react' },
    codeLang: 'jsx',
    brief: {
      situation:
        'Komponen `Panel` awalnya sederhana. Lalu ada yang butuh ikon, jadi ditambah prop `adaIkon`. Lalu ada yang butuh badge, jadi ditambah `adaBadge`. Sekarang ada empat boolean, dan setiap fitur baru menambah satu lagi. Tidak ada yang tahu kombinasi mana yang benar-benar dipakai, dan setiap perubahan kecil berarti menyunting `Panel`.',
      tasks: [
        'Tulis ulang `Panel` yang ada di editor supaya hanya menerima dua props, yaitu `judul` dan `children`.',
        'Hapus semua prop boolean yang berawalan `ada`.',
        'Tampilkan `judul` di dalam `<h2>`, lalu tampilkan `children` di bawahnya.',
      ],
      pitfalls: [
        'Empat boolean menghasilkan enam belas kombinasi, dan sebagian besar kombinasi itu tidak pernah dipakai maupun diuji. Dengan `children`, jumlah kemungkinan berhenti bertambah dan pemanggil tidak perlu membaca dokumentasi untuk tahu apa yang boleh ia masukkan.',
        'Menyisakan satu boolean saja sudah cukup untuk membuat pola yang sama tumbuh lagi dari situ.',
        'Nama prop-nya harus tepat `children`. Nama lain seperti `isi` memaksa pemanggil menulis `isi={<Ikon />}` dan kehilangan cara penulisan bersarang yang wajar.',
      ],
      terms: [
        {
          term: 'composition',
          meaning:
            'Cara membangun komponen dengan menyusun komponen lain di dalamnya, alih-alih menambah pengaturan lewat props. `<Panel judul="Profil"><Ikon /><Badge /></Panel>` membiarkan pemanggil memutuskan isinya. React menyarankan cara ini dibandingkan tumpukan boolean.',
        },
        {
          term: 'children',
          meaning:
            'Prop khusus yang berisi apa pun yang ditulis di antara tag pembuka dan penutup komponen. Ia bisa berisi teks, satu elemen, atau banyak elemen sekaligus. Komponen menampilkannya cukup dengan `{children}`.',
        },
        {
          term: 'boolean prop explosion',
          meaning:
            'Sebutan untuk komponen yang propnya terus bertambah berupa boolean seperti `isLarge`, `hasIcon`, dan `showFooter`. Setiap boolean baru menggandakan jumlah kombinasi yang mungkin. Tanda awalnya adalah prop yang namanya diawali `is`, `has`, `show`, atau `ada`.',
        },
      ],
    },
    rules: [
      'Hanya menerima `judul` dan `children`.',
      'Tidak ada lagi prop boolean berawalan `ada`.',
      '`children` benar-benar ditampilkan.',
    ],
    starter: `
      export function Panel({ judul, adaIkon, adaBadge, adaAksi, adaFooter }) {
        return (
          <section>
            <h2>{judul}</h2>
            {adaIkon ? <Ikon /> : null}
            {adaBadge ? <Badge /> : null}
            {adaAksi ? <Aksi /> : null}
            {adaFooter ? <Footer /> : null}
          </section>
        );
      }
    `,
    hints: [
      '`children` adalah prop biasa, hanya namanya saja yang istimewa.',
      'Apa pun yang ditulis pemanggil di antara tag pembuka dan penutup masuk ke `children`.',
      'Bentuknya `export function Panel({ judul, children })` lalu tampilkan `{children}`.',
    ],
    solution: {
      code: `
        // Panel tidak lagi perlu tahu apa saja yang bisa muncul di dalamnya.
        // Pemanggil yang menentukan isinya lewat children.
        export function Panel({ judul, children }) {
          return (
            <section>
              <h2>{judul}</h2>
              {children}
            </section>
          );
        }
      `,
      steps: [
        'Daftar props diringkas menjadi `{ judul, children }`, dan keempat boolean dihapus.',
        '`<h2>{judul}</h2>` tetap menampilkan judul di bagian atas panel.',
        '`{children}` menampilkan apa pun yang dikirim pemanggil di antara tag pembuka dan penutup.',
        'Pemanggil kini menulis `<Panel judul="Profil"><Ikon /><Badge /></Panel>`, dan menambah isi baru tidak lagi berarti menyunting `Panel`.',
      ],
      explanation:
        'Yang hilang bukan hanya empat boolean, tapi juga enam belas kombinasi yang harus dipikirkan. Komponennya juga berhenti perlu tahu apa saja yang bisa muncul di dalamnya. Pemanggil yang memutuskan, sehingga menambah sesuatu yang baru tidak lagi berarti menyunting `Panel`.',
    },
    alternativeSolutions: [
      `
        export function Panel(props) {
          return (
            <section>
              <h2>{props.judul}</h2>
              {props.children}
            </section>
          );
        }
      `,
    ],
    rejectedSolutions: [
      {
        code: `
          export function Panel({ judul, children, adaFooter }) {
            return (
              <section>
                <h2>{judul}</h2>
                {children}
                {adaFooter ? <Footer /> : null}
              </section>
            );
          }
        `,
        reason: 'Masih menyisakan satu boolean, dan pola yang sama akan tumbuh lagi dari situ.',
      },
      {
        code: `
          export function Panel({ judul, isi }) {
            return (
              <section>
                <h2>{judul}</h2>
                {isi}
              </section>
            );
          }
        `,
        reason:
          'Memakai prop bernama `isi`, bukan `children`, sehingga pemanggil tidak bisa menulis isi di antara tag.',
      },
    ],
    check: mesinStruktur('js', [
      wajibStruktur(
        'terima-children',
        'Menerima `children`',
        'Belum ada `children` di daftar props. Namanya harus tepat `children` supaya pemanggil bisa menulis isi di antara tag pembuka dan penutup.',
        '\\bchildren\\b',
      ),
      wajibStruktur(
        'render-children',
        '`children` benar-benar ditampilkan',
        '`children` sudah diterima tapi belum ditampilkan. Tulis `{children}` di dalam JSX.',
        '\\{\\s*(props\\.)?children\\s*\\}',
      ),
      larangStruktur(
        'tanpa-boolean-ada',
        'Tidak ada lagi prop boolean berawalan `ada`',
        'Masih ada prop seperti `adaIkon` atau `adaFooter`. Empat boolean berarti enam belas kombinasi, dan sebagian besarnya tidak pernah diuji.',
        '\\bada[A-Z]\\w*',
      ),
      urutStruktur(
        'judul-sebelum-children',
        'Judul ditampilkan sebelum `children`',
        'Urutannya harus judul dulu, baru `children`, supaya heading panel tetap berada di atas isinya.',
        ['\\{\\s*(props\\.)?judul\\s*\\}', '\\{\\s*(props\\.)?children\\s*\\}'],
      ),
    ]),
  }),
];
