import {
  callout,
  checklist,
  code,
  compare,
  divider,
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
 * Frontend Intermediate — Chapter 3, all eleven lessons.
 *
 * Eight component case studies built from scratch. The accessibility requirements in each are
 * not decoration: they are the difference between a component that works and one that only
 * looks like it works.
 */
export const lessons: LessonDraft[] = [
  written(
    'anatomi-komponen',
    'Anatomi Komponen yang Baik',
    11,
    'Ciri komponen yang enak dipakai ulang — dan tanda-tanda ia mulai rusak.',
    [
      p(
        'Membuat komponen itu mudah. Membuat komponen yang masih enak dipakai enam bulan kemudian, oleh orang yang tidak menulisnya, adalah keterampilan tersendiri. Bab ini menetapkan standarnya sebelum delapan studi kasus berikutnya.',
      ),

      terms(
        {
          term: 'API komponen',
          meaning:
            'Terjemahannya **antarmuka komponen**. Daftar props yang diterima sebuah komponen — inilah janji yang kamu berikan kepada siapa pun yang memakainya. Sama seperti API jaringan, mengubahnya berarti merusak semua pemakai yang sudah ada, jadi merancangnya dengan sadar sejak awal jauh lebih murah daripada memperbaikinya belakangan.',
        },
        {
          term: 'satu tanggung jawab',
          meaning:
            'Prinsip dari Sub-bab 2.11 Frontend Basic, diterapkan pada komponen. Ujinya tetap sama dan tetap tajam: **jelaskan komponen itu dalam satu kalimat**. Kalau kalimatnya butuh kata "dan", kemungkinan besar ia sudah menampung lebih dari satu tanggung jawab.',
        },
        {
          term: 'dapat dipakai ulang',
          meaning:
            'Terjemahan dari *reusable*. Sering disalahpahami sebagai "bisa dipakai untuk apa saja" — dan komponen yang berusaha begitu justru berakhir dengan dua puluh prop. Yang sebenarnya dimaksud: **bisa dipakai di beberapa tempat yang memang serupa**, tanpa perlu diubah.',
        },
        {
          term: 'komponen terkendali',
          meaning:
            'Terjemahan dari *controlled component*. Komponen yang nilainya **ditentukan sepenuhnya dari luar** lewat props, dan melaporkan perubahan lewat callback. Lawannya menyimpan nilainya sendiri di dalam. Pilihan ini menentukan siapa pemilik datanya, dan dibahas tuntas di Bab 4.',
        },
        {
          term: 'escape hatch',
          meaning:
            'Terjemahannya **pintu darurat**. Jalan keluar yang kamu sediakan untuk kasus yang tidak terpikirkan — biasanya prop `className` atau `...sisa` yang meneruskan atribut apa pun. Tanpa itu, satu kebutuhan kecil yang tidak tercakup memaksa orang menyalin seluruh komponenmu.',
        },
        {
          term: 'prop bocor',
          meaning:
            'Terjemahan bebas dari *leaky abstraction*. Props yang membocorkan **detail internal** komponen, misalnya `wrapperStyle` atau `innerDivClassName`. Tandanya jelas: pemakainya harus tahu struktur HTML di dalamnya untuk bisa memakainya — dan sejak itu, kamu tidak bisa lagi mengubah struktur itu.',
        },
        {
          term: 'accessible name',
          meaning:
            'Terjemahannya **nama yang terbaca teknologi bantu**. Setiap elemen interaktif wajib punya satu. Untuk tombol berteks, teksnya sendiri sudah cukup; untuk tombol ikon, ia harus datang dari `aria-label`. Komponen yang tidak menyediakan jalan untuk itu **memaksa** pemakainya membuat antarmuka yang tidak bisa diakses.',
        },
        {
          term: 'design system',
          meaning:
            'Kumpulan komponen dan token yang **konsisten satu sama lain**. Nilainya bukan pada jumlah komponennya, melainkan pada keseragaman: nama prop yang sama berarti hal yang sama di seluruh komponen, dan ukuran `sm` terlihat sepadan di mana pun.',
        },
      ),

      h2('Lima ciri'),
      table(
        ['Ciri', 'Artinya'],
        [
          ['**Satu tanggung jawab**', 'Bisa dijelaskan dalam satu kalimat tanpa kata "dan"'],
          ['**API kecil**', 'Prop sedikit, dan tiap prop punya alasan'],
          ['**Default masuk akal**', 'Bisa dipakai tanpa mengisi apa pun yang opsional'],
          ['**Meneruskan props sisa**', 'Pemanggil bisa menambah `aria-*`, `data-*`, `onFocus`'],
          ['**Tidak tahu konteksnya**', 'Tidak berasumsi ia ada di dalam halaman tertentu'],
        ],
      ),

      h2('Meneruskan props sisa dan `ref`'),
      code(
        'tsx',
        `
        import type { ComponentProps } from 'react';

        type Props = ComponentProps<'button'> & {
          varian?: 'utama' | 'sekunder';
        };

        export function Tombol({ varian = 'sekunder', className, ...sisa }: Props) {
          return <button className={cn(KELAS[varian], className)} {...sisa} />;
        }

        // Semua ini bekerja tanpa kamu memikirkannya satu per satu:
        <Tombol type="submit" disabled aria-label="Kirim" onFocus={...} data-testid="kirim" />
        `,
      ),
      callout(
        'warning',
        'Komponen yang tidak meneruskan props sisa akan menghambat pemakainya',
        'Cepat atau lambat seseorang butuh `aria-describedby`, `data-testid`, atau `onBlur`. Kalau komponenmu tidak meneruskannya, mereka harus mengubah komponenmu — atau membungkusnya dengan `<div>` tambahan yang merusak layout.',
      ),
      p(
        'Di React 19, `ref` sudah jadi prop biasa, jadi `...sisa` sekaligus meneruskannya tanpa `forwardRef`.',
      ),

      h2('Tanda komponen mulai rusak'),
      ol(
        '**Lebih dari lima boolean prop.** Kombinasinya tumbuh eksponensial, dan sebagian mustahil.',
        '**Prop bernama `mode`, `tipe`, atau `varian` yang mengubah struktur**, bukan hanya tampilan. Itu dua komponen yang menyamar jadi satu.',
        '**Prop yang hanya diteruskan ke satu anak.** Itu tanda `children` atau slot lebih tepat.',
        '**Kamu takut mengubahnya** karena tidak tahu siapa saja yang memakainya.',
      ),
      code(
        'tsx',
        `
        // Dua komponen yang menyamar jadi satu
        <Kartu tipe="produk" produk={p} />
        <Kartu tipe="artikel" artikel={a} />

        // Lebih jujur, dan masing-masing jadi lebih sederhana
        <KartuProduk produk={p} />
        <KartuArtikel artikel={a} />
        `,
      ),

      h2('Controlled, uncontrolled, atau keduanya'),
      code(
        'tsx',
        `
        // Uncontrolled — komponen memegang state-nya sendiri
        <Accordion defaultTerbuka="a" />

        // Controlled — pemanggil yang memegang
        <Accordion terbuka={aktif} onUbah={setAktif} />

        // Mendukung keduanya
        function Accordion({ terbuka, defaultTerbuka, onUbah }) {
          const [internal, setInternal] = useState(defaultTerbuka);
          const terkendali = terbuka !== undefined;
          const nilai = terkendali ? terbuka : internal;

          function ubah(baru) {
            if (!terkendali) setInternal(baru);
            onUbah?.(baru);
          }
          // ...
        }
        `,
      ),
      callout(
        'tip',
        'Mulai dari uncontrolled',
        'Sebagian besar pemakaian tidak butuh kendali dari luar. Tambahkan mode controlled saat ada kebutuhan nyata — misalnya menutup semua accordion dari tombol di luar.',
      ),

      h2('Di mana state seharusnya berada'),
      ul(
        '**Di dalam komponen** kalau tidak ada yang lain peduli (accordion terbuka/tertutup).',
        '**Di induk terdekat** kalau dua komponen bersaudara membutuhkannya.',
        '**Di URL** kalau harus bisa dibagikan lewat tautan (filter, halaman, tab aktif).',
        '**Di cache server** kalau sumber kebenarannya di server.',
      ),
      p(
        'Kesalahan paling umum: menaikkan state terlalu tinggi "untuk jaga-jaga". Itu membuat seluruh cabang render ulang untuk perubahan yang hanya dipedulikan satu komponen.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Satu tanggung jawab yang bisa disebut tanpa kata "dan".',
        'Selalu teruskan props sisa — pemakai akan membutuhkannya.',
        'Prop yang mengubah struktur berarti itu dua komponen berbeda.',
        'Mulai uncontrolled; tambahkan controlled saat ada kebutuhan nyata.',
        'Taruh state serendah mungkin, tapi setinggi yang diperlukan.',
      ),
      references(
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Dasar penyusunan komponen, termasuk kapan sebuah bagian layak dipecah.',
        },
        {
          label: 'Sharing State Between Components',
          href: 'https://react.dev/learn/sharing-state-between-components',
          source: 'React',
          note: 'Aturan "serendah mungkin, setinggi yang diperlukan" untuk penempatan state.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Pola meneruskan props sisa yang menjadi pintu darurat komponen.',
        },
        {
          label: 'ARIA: button role',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/button_role',
          source: 'MDN',
          note: 'Syarat accessible name yang wajib disediakan setiap komponen interaktif.',
        },
      ),
    ],
  ),

  written(
    'studi-button',
    'Studi Kasus: `Button`',
    13,
    'Komponen paling sering ditulis ulang, dan paling sering salah dirancang.',
    [
      terms(
        {
          term: 'boolean prop explosion',
          meaning:
            'Terjemahan bebasnya **ledakan prop boolean**. Enam prop `true`/`false` menghasilkan **64 kombinasi**, dan biasanya hanya sekitar delapan yang masuk akal. Sisanya bukan sekadar tidak berguna — ia kombinasi yang **tidak punya arti sama sekali**, seperti `isPrimary` dan `isDanger` sekaligus, tapi tetap bisa ditulis tanpa peringatan apa pun.',
        },
        {
          term: 'variant',
          meaning:
            'Prop bernilai **salah satu dari beberapa pilihan** — `variant="utama" | "hantu" | "bahaya"`. Menggantikan sekumpulan boolean sekaligus, dan keuntungannya langsung terasa: kombinasi mustahil menjadi **tidak bisa ditulis**, dan editor menawarkan pilihan yang sah saat kamu mengetik.',
        },
        {
          term: 'size',
          meaning:
            'Prop ukuran yang juga sebaiknya berupa pilihan terbatas — `"sm" | "md" | "lg"` — bukan angka bebas. Alasannya sama dengan skala spacing di Bab 1: membatasi pilihan **menjaga konsistensi tanpa perlu disiplin siapa pun**.',
        },
        {
          term: 'ComponentProps',
          meaning:
            'Pembantu TypeScript untuk **meminjam seluruh tipe atribut elemen bawaan**: `ComponentProps<"button">` memberimu `type`, `disabled`, `aria-label`, dan puluhan lainnya sekaligus. Tanpa itu, kamu harus mendaftarkan tiap atribut satu per satu dan pasti ada yang terlewat.',
        },
        {
          term: 'type="button"',
          meaning:
            'Nilai bawaan yang **wajib** kamu tetapkan pada komponen tombol. Alasannya: tombol di dalam `<form>` secara bawaan bertipe `submit`, sehingga tombol "Batal" yang lupa diberi tipe justru **mengirim formnya**. Ini bug yang sangat sering dan sangat membingungkan.',
        },
        {
          term: 'loading state',
          meaning:
            'Keadaan tombol saat aksinya sedang berjalan. Dua kewajibannya sering terlupakan: **nonaktifkan tombolnya** agar tidak terkirim dua kali, dan **umumkan perubahannya** lewat `aria-busy` atau teks — karena pemutar berputar tidak berarti apa-apa bagi pembaca layar.',
        },
        {
          term: 'asChild',
          meaning:
            'Pola yang membuat komponen **meminjamkan gayanya ke elemen lain**, misalnya agar sebuah tombol dirender sebagai `<a>`. Menyelesaikan kebutuhan nyata "terlihat seperti tombol tapi sebenarnya tautan" tanpa menduplikasi seluruh gayanya.',
        },
        {
          term: 'tombol vs tautan',
          meaning:
            'Pembedaan yang menentukan dan sering diabaikan: `<button>` untuk **melakukan sesuatu**, `<a>` untuk **pergi ke suatu tempat**. Bukan soal tampilan — keduanya berbeda perilaku keyboard, berbeda menu klik kanan, dan hanya tautan yang bisa dibuka di tab baru.',
        },
      ),

      h2('Bentuk yang salah dulu'),
      code(
        'tsx',
        `
        <Button isPrimary isLarge isDanger isLoading isFullWidth isOutline />
        // 6 boolean = 64 kombinasi. Berapa yang masuk akal? Sekitar delapan.
        // isPrimary + isDanger sekaligus artinya apa?
        `,
      ),

      h2('Bentuk yang benar'),
      code(
        'tsx',
        `
        import { cva, type VariantProps } from 'class-variance-authority';
        import type { ComponentProps } from 'react';

        const gaya = cva(
          [
            'inline-flex items-center justify-center gap-2 rounded-md font-medium',
            'transition-colors duration-150',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-50',
          ],
          {
            variants: {
              varian: {
                utama: 'bg-primary-fill text-on-primary-fill hover:brightness-95',
                sekunder: 'border border-border bg-surface text-text hover:bg-raised',
                hantu: 'text-muted hover:bg-raised hover:text-text',
                bahaya: 'border border-border bg-surface text-danger hover:bg-danger-fill',
              },
              ukuran: {
                sm: 'h-9 px-3 text-sm',
                md: 'h-11 px-4',
              },
              lebarPenuh: { true: 'w-full' },
            },
            defaultVariants: { varian: 'sekunder', ukuran: 'md' },
          },
        );

        type Props = ComponentProps<'button'> &
          VariantProps<typeof gaya> & {
            memuat?: boolean;
          };

        export function Button({
          varian,
          ukuran,
          lebarPenuh,
          memuat = false,
          disabled,
          children,
          className,
          ...sisa
        }: Props) {
          return (
            <button
              className={cn(gaya({ varian, ukuran, lebarPenuh }), className)}
              disabled={disabled || memuat}
              aria-busy={memuat || undefined}
              {...sisa}
            >
              {memuat && <Spinner aria-hidden="true" />}
              {children}
            </button>
          );
        }
        `,
      ),

      h2('Lima detail yang sering terlewat'),
      ol(
        '**`type="button"` sebagai default HTML adalah `submit`.** Tombol di dalam form yang lupa `type` akan mengirim form saat diklik. Ini bug yang muncul di hampir setiap aplikasi.',
        '**`disabled` saat memuat**, supaya tidak bisa diklik dua kali.',
        '**`aria-busy`**, supaya teknologi bantu tahu ada proses berjalan.',
        '**Spinner `aria-hidden`**, supaya tidak dibacakan sebagai konten.',
        '**Label tidak boleh hilang saat memuat** — mengganti teks dengan spinner membuat lebar tombol melompat dan pengguna kehilangan konteks.',
      ),
      code(
        'tsx',
        `
        // Perbaikan type default
        export function Button({ type = 'button', ...sisa }: Props) {
          return <button type={type} {...sisa} />;
        }
        `,
      ),
      callout(
        'danger',
        'Tombol yang lebarnya berubah saat memuat',
        'Kalau teks diganti dengan "Menyimpan…", tombolnya melebar dan elemen di sebelahnya bergeser. Pertahankan labelnya, tambahkan spinner di sebelahnya — atau kunci lebarnya.',
      ),

      h2('Merender sebagai elemen lain'),
      code(
        'tsx',
        `
        // Tautan yang tampil seperti tombol — TETAP harus <a>
        import Link from 'next/link';

        export function ButtonLink({ href, varian, ukuran, className, children }: LinkProps) {
          return (
            <Link href={href} className={cn(gaya({ varian, ukuran }), className)}>
              {children}
            </Link>
          );
        }
        `,
      ),
      callout(
        'danger',
        'Jangan pernah memakai `<button onClick={() => router.push(...)}>` untuk navigasi',
        'Tautan yang dibuat dari `<button>` tidak bisa dibuka di tab baru, tidak bisa disalin alamatnya, tidak muncul di daftar tautan screen reader, dan tidak dikenali mesin pencari. **Aksi pakai `<button>`, navigasi pakai `<a>`** — tidak ada pengecualian.',
      ),

      h2('Menguji sendiri'),
      ol(
        'Tab ke tombol — apakah focus ring terlihat?',
        'Tekan Enter dan Spasi — apakah keduanya memicu?',
        'Klik saat `memuat` — apakah benar-benar tidak bisa?',
        'Zoom 200% — apakah teksnya masih muat?',
        'Tombol berikon saja — apakah punya `aria-label`?',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`variant`/`size` mengalahkan boolean; `cva` memberi tipenya sekaligus.',
        'Default `type` HTML adalah `submit` — setel `button` sendiri.',
        'Saat memuat: `disabled`, `aria-busy`, dan label tetap ada.',
        'Navigasi memakai `<a>`, aksi memakai `<button>`.',
      ),
      references(
        {
          label: '<button>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button',
          source: 'MDN',
          note: 'Termasuk penegasan bahwa `type` bawaannya `submit` — sumber bug tombol Batal.',
        },
        {
          label: 'aria-busy',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy',
          source: 'MDN',
          note: 'Mengumumkan keadaan memuat kepada pembaca layar, karena spinner tidak terbaca.',
        },
        {
          label: 'Using TypeScript — typing props',
          href: 'https://react.dev/learn/typescript#typing-props',
          source: 'React',
          note: '`ComponentProps<"button">` untuk meminjam seluruh atribut elemen bawaan.',
        },
        {
          label: 'Links vs. Buttons',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
          source: 'W3C ARIA APG',
          note: 'Pola resmi tombol, termasuk perilaku keyboard yang membedakannya dari tautan.',
        },
      ),
    ],
  ),

  written(
    'studi-field',
    'Studi Kasus: Field Form',
    13,
    'Input, label, dan pesan error — beserta hubungan aksesibilitas yang mengikatnya.',
    [
      p(
        'Field form terlihat sepele dan hampir selalu salah. Yang menentukan bukan tampilannya, melainkan tiga hubungan yang harus ada di markup.',
      ),

      terms(
        {
          term: 'tiga hubungan wajib',
          meaning:
            'Yang menentukan benar-tidaknya sebuah field bukan tampilannya, melainkan tiga tautan di markup: **label ke input** (`htmlFor` ↔ `id`), **input ke pesan bantuan dan error** (`aria-describedby`), dan **penanda tidak valid** (`aria-invalid`). Ketiganya tidak terlihat mata, tapi tanpanya field itu praktis tidak bisa dipakai dengan pembaca layar.',
        },
        {
          term: 'useId',
          meaning:
            'Hook React untuk menghasilkan **id yang unik dan stabil**. Wajib dipakai di sini karena satu komponen field bisa dirender berkali-kali di satu halaman — dan id yang ditulis tetap akan bertabrakan. Ia juga aman untuk render di server, tidak seperti `Math.random()`.',
        },
        {
          term: 'htmlFor',
          meaning:
            'Padanan atribut `for` di JSX, karena `for` adalah kata kunci JavaScript. Menghubungkan `<label>` ke input yang `id`-nya cocok. Manfaatnya dua: pembaca layar tahu input itu untuk apa, **dan** area kliknya melebar mencakup labelnya.',
        },
        {
          term: 'aria-describedby',
          meaning:
            'Menghubungkan input ke **teks penjelas atau pesan error**, dengan menyebut `id`-nya. Boleh berisi beberapa id sekaligus dipisah spasi. Inilah yang membuat pesan error benar-benar dibacakan saat pengguna memfokuskan input yang gagal — tanpa itu, error hanya terlihat oleh yang bisa melihat.',
        },
        {
          term: 'aria-invalid',
          meaning:
            'Menandai bahwa isi sebuah input **tidak valid**. Dipasangkan dengan `aria-describedby` yang menunjuk pesannya. Perhatikan bahwa border merah saja tidak cukup — itu warna sebagai satu-satunya penanda, persis yang dilarang di Bab 1.',
        },
        {
          term: 'placeholder bukan label',
          meaning:
            'Kesalahan yang sangat umum. `placeholder` **hilang begitu pengguna mulai mengetik**, sehingga ia lupa field itu untuk apa; ia juga berkontras rendah dan tidak selalu terbaca pembaca layar. Placeholder untuk **contoh format**, label untuk **nama field** — keduanya, bukan salah satu.',
        },
        {
          term: 'pesan error',
          meaning:
            'Wajib memenuhi tiga hal: **di dekat fieldnya** (bukan menumpuk di atas form), **menjelaskan cara memperbaikinya** (bukan sekadar "tidak valid"), dan **terhubung `aria-describedby`**. Ketiganya bersama-sama, karena satu saja yang hilang sudah cukup membuatnya tidak berguna bagi sebagian orang.',
        },
        {
          term: 'required',
          meaning:
            'Atribut yang menandai field wajib diisi. Menandainya dengan tanda bintang saja tidak cukup — atributnya yang sebenarnya diumumkan pembaca layar. Dan seperti biasa: ini validasi klien, jadi **server tetap wajib memeriksanya ulang**.',
        },
      ),

      h2('Tiga hubungan wajib'),
      code(
        'tsx',
        `
        import { useId } from 'react';
        import type { ComponentProps } from 'react';

        type Props = ComponentProps<'input'> & {
          label: string;
          error?: string;
          petunjuk?: string;
        };

        export function Field({ label, error, petunjuk, id, ...sisa }: Props) {
          const otomatis = useId();
          const inputId = id ?? otomatis;
          const errorId = \`\${inputId}-error\`;
          const petunjukId = \`\${inputId}-petunjuk\`;

          const dijelaskanOleh = [petunjuk && petunjukId, error && errorId]
            .filter(Boolean)
            .join(' ') || undefined;

          return (
            <div className="space-y-1.5">
              {/* 1. label terhubung ke input lewat htmlFor/id */}
              <label htmlFor={inputId} className="text-text block text-sm font-medium">
                {label}
              </label>

              {petunjuk && (
                <p id={petunjukId} className="text-muted text-xs">
                  {petunjuk}
                </p>
              )}

              <input
                id={inputId}
                /* 2. aria-invalid memberi tahu keadaan gagal */
                aria-invalid={error ? true : undefined}
                /* 3. aria-describedby menghubungkan pesan error ke inputnya */
                aria-describedby={dijelaskanOleh}
                className={cn(
                  'border-border bg-surface text-text w-full rounded-md border px-3 py-2 text-sm',
                  'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-1',
                  error && 'border-danger',
                )}
                {...sisa}
              />

              {error && (
                <p id={errorId} className="text-danger text-xs">
                  {error}
                </p>
              )}
            </div>
          );
        }
        `,
      ),
      callout(
        'danger',
        'Tanpa ketiganya, field itu rusak — meski terlihat baik',
        'Tanpa `htmlFor`: mengklik label tidak memfokuskan input, dan screen reader tidak tahu namanya. Tanpa `aria-describedby`: pesan error **tidak pernah dibacakan** — pengguna hanya tahu formnya gagal, tanpa tahu kenapa. Tanpa `aria-invalid`: keadaan gagal tidak terdeteksi sama sekali.',
      ),

      h2('`useId`, bukan penghitung sendiri'),
      code(
        'tsx',
        `
        // SALAH: tidak cocok antara server dan klien -> peringatan hidrasi
        let counter = 0;
        const id = \`field-\${counter++}\`;

        // SALAH: berubah tiap render
        const id = Math.random();

        // BENAR
        const id = useId();
        `,
      ),

      h2('Kapan menampilkan error'),
      table(
        ['Waktu', 'Terasa'],
        [
          ['Setiap ketikan', 'Mengganggu — error muncul sebelum selesai mengetik'],
          ['Saat blur', 'Wajar untuk field tunggal'],
          ['Saat submit', '**Default yang tepat**'],
          ['Saat submit, lalu tiap ketikan', 'Terbaik — koreksi langsung terlihat'],
        ],
      ),
      callout(
        'tip',
        'Pola yang paling nyaman',
        'Diam sampai submit pertama. Setelah field itu pernah gagal, validasi ulang di tiap ketikan supaya pengguna melihat errornya hilang begitu diperbaiki — bukan menunggu submit lagi.',
      ),

      h2('Atribut HTML yang sering terlupa'),
      code(
        'tsx',
        `
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field label="Kata sandi" name="password" type="password" autoComplete="current-password" />
        <Field label="Kode OTP" name="otp" inputMode="numeric" autoComplete="one-time-code" />
        <Field label="Nama" name="nama" autoComplete="name" spellCheck={false} />
        `,
      ),
      ul(
        '`autoComplete` yang benar membuat pengisian otomatis bekerja — ini fitur aksesibilitas, bukan kenyamanan.',
        '`inputMode="numeric"` memunculkan papan tik angka di ponsel tanpa menolak karakter lain.',
        '`type="email"` memberi validasi bawaan dan papan tik yang tepat.',
        '**Jangan pernah blokir paste** — itu memaksa orang mengetik ulang kata sandi dari pengelola sandi.',
      ),

      h2('Fokus ke error pertama'),
      code(
        'tsx',
        `
        function onSubmit(e) {
          e.preventDefault();
          const errors = validasi(data);

          if (Object.keys(errors).length > 0) {
            setErrors(errors);
            const pertama = e.currentTarget.querySelector('[aria-invalid="true"]');
            pertama?.focus();     // arahkan pengguna ke masalahnya
            return;
          }

          kirim(data);
        }
        `,
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Tiga hubungan wajib: `htmlFor`/`id`, `aria-invalid`, `aria-describedby`.',
        'Tanpa `aria-describedby`, pesan error tidak pernah dibacakan.',
        '`useId` untuk id yang aman terhadap hidrasi.',
        'Diam sampai submit pertama, lalu validasi tiap ketikan.',
        '`autoComplete` yang benar adalah fitur aksesibilitas.',
      ),
      references(
        {
          label: 'useId',
          href: 'https://react.dev/reference/react/useId',
          source: 'React',
          note: 'Id unik yang aman terhadap hidrasi — pengganti `Math.random()` yang merusak SSR.',
        },
        {
          label: '<label>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label',
          source: 'MDN',
          note: 'Hubungan `htmlFor` ↔ `id` beserta manfaat melebarnya area klik.',
        },
        {
          label: 'aria-describedby',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby',
          source: 'MDN',
          note: 'Menghubungkan input ke pesan bantuan dan error agar benar-benar dibacakan.',
        },
        {
          label: 'Error Identification — WCAG 3.3.1',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html',
          source: 'W3C WCAG',
          note: 'Standar yang mewajibkan error dijelaskan dalam teks, bukan hanya warna.',
        },
        {
          label: 'HTML attribute: autocomplete',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete',
          source: 'MDN',
          note: 'Daftar nilai yang membuat pengisian otomatis benar-benar bekerja.',
        },
      ),
    ],
  ),

  written(
    'studi-card-skeleton',
    'Studi Kasus: `Card` & `Skeleton`',
    11,
    'Wadah konten yang fleksibel, dan placeholder yang tidak membuat layout melompat.',
    [
      terms(
        {
          term: 'Card',
          meaning:
            'Wadah untuk satu satuan konten yang **berdiri sendiri**. Ujinya sederhana: kalau kartunya dipindah ke halaman lain, apakah isinya masih masuk akal tanpa konteks di sekitarnya? Kalau tidak, itu bukan kartu melainkan sepotong tata letak.',
        },
        {
          term: 'Skeleton',
          meaning:
            'Terjemahannya **kerangka**. Bentuk abu-abu yang menyerupai isi sebenarnya, ditampilkan selama memuat. Syarat yang membuatnya berguna: ia harus **memesan ruang seukuran isi akhirnya** — kalau tidak, halaman tetap melompat saat data datang, dan seluruh gunanya hilang.',
        },
        {
          term: 'layout shift',
          meaning:
            'Terjemahannya **pergeseran tata letak**. Isi halaman yang melompat karena sesuatu muncul dan mendorong yang lain. Bukan sekadar tidak enak dilihat: pengguna bisa **salah menekan tombol** karena posisinya berubah tepat saat ia mengklik.',
        },
        {
          term: 'aspect-ratio',
          meaning:
            'Perbandingan lebar dan tinggi yang ditetapkan sejak awal, misalnya `aspect-video`. Ini cara mencegah gambar menggeser tata letak sebelum ia selesai dimuat — ruangnya sudah dipesan meski isinya belum ada.',
        },
        {
          term: 'animate-pulse',
          meaning:
            'Animasi denyut halus pada skeleton yang menandakan "sedang bekerja". Wajib dipasangkan dengan `motion-reduce:animate-none`, karena gerak berulang termasuk yang dikeluhkan pengguna yang meminta pengurangan gerak.',
        },
        {
          term: 'aria-hidden',
          meaning:
            'Menyembunyikan sebuah elemen dari **teknologi bantu** meski tetap terlihat mata. Tepat untuk skeleton: bentuk kotak abu-abu tidak punya arti apa pun untuk dibacakan, dan mengumumkannya justru mengganggu.',
        },
        {
          term: 'compound component',
          meaning:
            'Sekelompok komponen yang dipakai bersama: `<Card><Card.Header/><Card.Body/></Card>`. Untuk Card, ini jauh lebih baik daripada prop `judul`, `subjudul`, `gambar`, `badge` — karena kebutuhan baru cukup ditulis sebagai isi, tanpa menambah prop baru.',
        },
        {
          term: 'placeholder yang jujur',
          meaning:
            'Prinsip yang mengikat seluruh sub-bab ini: skeleton **tidak boleh berbohong** tentang berapa banyak isi yang akan datang. Menampilkan lima baris skeleton lalu hanya satu item muncul terasa seperti sesuatu yang gagal, meski sebenarnya semuanya berjalan benar.',
        },
      ),

      h2('Card: composition, bukan props'),
      compare(
        {
          title: 'Props yang meledak',
          lang: 'tsx',
          code: `
            <Card
              judul="A"
              subjudul="B"
              gambar="/x.png"
              badge="Baru"
              aksiKanan={<Menu />}
              footer={<Aksi />}
              adaBorder
              padat
            />
          `,
          notes: ['Tiap kebutuhan baru = satu prop baru'],
        },
        {
          title: 'Composition',
          lang: 'tsx',
          code: `
            <Card>
              <Card.Header>
                <h3>A</h3>
                <Menu />
              </Card.Header>
              <Card.Body>B</Card.Body>
              <Card.Footer><Aksi /></Card.Footer>
            </Card>
          `,
          notes: ['Struktur terbaca dari markup'],
        },
      ),
      code(
        'tsx',
        `
        import type { ComponentProps } from 'react';

        export function Card({ className, ...sisa }: ComponentProps<'div'>) {
          return (
            <div
              className={cn('border-border bg-surface rounded-lg border', className)}
              {...sisa}
            />
          );
        }

        Card.Header = function Header({ className, ...sisa }: ComponentProps<'div'>) {
          return (
            <div
              className={cn('border-border flex items-start justify-between gap-3 border-b p-4', className)}
              {...sisa}
            />
          );
        };

        Card.Body = function Body({ className, ...sisa }: ComponentProps<'div'>) {
          return <div className={cn('p-4', className)} {...sisa} />;
        };
        `,
      ),

      h2('Kartu yang seluruhnya bisa diklik'),
      code(
        'tsx',
        `
        // SALAH: seluruh kartu jadi tombol — tidak bisa dibuka di tab baru,
        // dan tautan di dalamnya jadi bersarang di dalam interaktif
        <div role="button" tabIndex={0} onClick={buka}>…</div>

        // BENAR: satu tautan asli, area kliknya diperluas dengan pseudo-element
        <article className="border-border relative rounded-lg border p-4">
          <h3>
            <a href={href} className="after:absolute after:inset-0 focus-visible:ring-2">
              {judul}
            </a>
          </h3>
          <p className="text-muted">{ringkasan}</p>

          {/* Tombol lain tetap bisa diklik karena z-index-nya di atas overlay */}
          <button className="relative z-10" onClick={simpan}>Simpan</button>
        </article>
        `,
      ),
      callout(
        'tip',
        'Teknik `after:absolute after:inset-0`',
        'Tautan asli tetap satu-satunya elemen interaktif utama — bisa dibuka di tab baru, alamatnya bisa disalin, dan muncul di daftar tautan screen reader. Overlay tak terlihat memperluas area kliknya ke seluruh kartu.',
      ),

      h2('Skeleton harus memesan ruang'),
      code(
        'tsx',
        `
        export function Skeleton({ className }: { className?: string }) {
          return (
            <div
              aria-hidden="true"
              className={cn('bg-raised animate-pulse rounded-md', className)}
            />
          );
        }

        // Dipakai dengan tinggi yang MENYAMAI hasil akhirnya
        export function SkeletonKartu() {
          return (
            <div className="border-border rounded-lg border p-4">
              <Skeleton className="h-5 w-2/3" />       {/* judul */}
              <Skeleton className="mt-2 h-4 w-full" /> {/* baris 1 */}
              <Skeleton className="mt-1 h-4 w-4/5" />  {/* baris 2 */}
            </div>
          );
        }
        `,
      ),
      callout(
        'danger',
        'Skeleton yang tingginya tidak sama justru memperburuk',
        'Spinner kecil lalu digantikan kartu setinggi 200px membuat seluruh halaman melompat — itu Cumulative Layout Shift, dan pengguna bisa salah klik karena tombol berpindah tepat saat ia menekan. Skeleton hanya berguna kalau tingginya mendekati hasil akhir.',
      ),

      h2('`aria-hidden` pada skeleton'),
      code(
        'tsx',
        `
        <div aria-busy="true" aria-live="polite">
          {memuat
            ? Array.from({ length: 3 }, (_, i) => <SkeletonKartu key={i} />)
            : items.map((i) => <Kartu key={i.id} {...i} />)}
        </div>
        `,
      ),
      p(
        'Skeleton diberi `aria-hidden` supaya tidak dibacakan sebagai konten kosong; wadahnya yang memakai `aria-busy` dan `aria-live` untuk mengumumkan perubahan.',
      ),

      h2('Kapan skeleton bukan jawabannya'),
      ul(
        'Operasi yang hampir selalu selesai di bawah 200ms — kedipannya terasa lebih lambat daripada tanpa indikator.',
        'Tindakan yang dipicu pengguna dan responsnya lokal — pakai keadaan pada tombolnya.',
        'Muat ulang data yang sudah tampil — tampilkan data lama sambil memuat, jangan diganti skeleton.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Card memakai composition; props yang meledak adalah tandanya salah rancang.',
        'Kartu yang bisa diklik: satu `<a>` asli + overlay `after:inset-0`.',
        'Skeleton wajib memesan tinggi yang menyamai hasil akhirnya.',
        'Skeleton `aria-hidden`; wadahnya yang memakai `aria-busy`.',
        'Jangan pakai skeleton untuk operasi yang hampir selalu instan.',
      ),
      references(
        {
          label: 'Passing JSX as children',
          href: 'https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children',
          source: 'React',
          note: 'Dasar pola compound component yang menggantikan props Card yang meledak.',
        },
        {
          label: 'aria-hidden',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden',
          source: 'MDN',
          note: 'Menyembunyikan skeleton dari pembaca layar karena bentuknya tidak punya arti.',
        },
        {
          label: 'Optimize Cumulative Layout Shift',
          href: 'https://web.dev/articles/optimize-cls',
          source: 'web.dev',
          note: 'Alasan skeleton wajib memesan tinggi akhirnya, beserta cara mengukur dampaknya.',
        },
        {
          label: 'aspect-ratio',
          href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio',
          source: 'MDN',
          note: 'Memesan ruang gambar sebelum ia dimuat, sehingga tata letak tidak bergeser.',
        },
      ),
    ],
  ),

  written(
    'studi-dialog',
    'Studi Kasus: `Dialog`',
    15,
    'Overlay yang benar: portal, focus trap, pengembalian fokus, dan `Esc`.',
    [
      p(
        'Dialog adalah komponen dengan jarak terbesar antara "terlihat berfungsi" dan "benar-benar berfungsi". Lima hal berikut wajib ada, dan empat di antaranya tidak terlihat sama sekali kalau kamu hanya memakai mouse.',
      ),

      terms(
        {
          term: 'dialog',
          meaning:
            'Jendela yang muncul di atas halaman dan **menuntut perhatian penuh** sebelum pengguna bisa melanjutkan. Komponen dengan jarak terbesar antara "terlihat berfungsi" dan "benar-benar berfungsi" — empat dari lima kewajibannya **tidak terlihat sama sekali** kalau kamu hanya menguji dengan tetikus.',
        },
        {
          term: 'portal',
          meaning:
            'Kemampuan React merender sebuah komponen **di tempat lain di DOM**, biasanya langsung di bawah `<body>`, meski di kode ia ditulis jauh di dalam. Dibutuhkan karena `overflow: hidden` atau `z-index` sebuah induk bisa memotong dialog — masalah yang tidak bisa diselesaikan dengan CSS dari dalam.',
        },
        {
          term: 'focus trap',
          meaning:
            'Terjemahannya **perangkap fokus**. Menahan Tab agar tidak keluar dari dialog selama ia terbuka. Tanpa itu, pengguna keyboard menekan Tab beberapa kali lalu **tersesat di halaman di belakangnya** — masih bisa mengklik tombol yang seharusnya tidak terjangkau, tanpa tahu di mana ia berada.',
        },
        {
          term: 'pengembalian fokus',
          meaning:
            'Terjemahan dari *focus restoration*. Saat dialog ditutup, fokus **wajib kembali ke elemen yang membukanya**. Kalau tidak, fokus melompat ke awal halaman dan pengguna keyboard harus menelusuri ulang dari nol untuk kembali ke tempatnya tadi.',
        },
        {
          term: 'inert',
          meaning:
            'Atribut yang membuat sebuah bagian halaman **benar-benar tidak bisa disentuh** — tidak bisa diklik, tidak bisa difokuskan, dan tidak dibacakan pembaca layar. Cara modern dan paling bersih untuk menonaktifkan latar belakang saat dialog terbuka.',
        },
        {
          term: 'scroll lock',
          meaning:
            'Terjemahannya **kunci gulir**. Mencegah halaman di belakang ikut bergulir saat dialog terbuka. Jebakannya: mengunci dengan `overflow: hidden` pada `<body>` membuat halaman **melompat** karena batang gulir menghilang — kompensasi lebarnya perlu ditambahkan.',
        },
        {
          term: 'role="dialog"',
          meaning:
            'Menandai elemen sebagai dialog bagi teknologi bantu, dipasangkan dengan `aria-modal="true"` dan `aria-labelledby` yang menunjuk judulnya. Tanpa judul yang tertaut, pembaca layar hanya mengumumkan "dialog" tanpa keterangan apa pun tentang isinya.',
        },
        {
          term: '<dialog> bawaan',
          meaning:
            'Elemen HTML asli yang **sudah menyediakan** focus trap, `Esc`, dan lapisan latar tanpa kode tambahan. Sekarang didukung semua browser modern, dan sebaiknya dipertimbangkan lebih dulu sebelum membangun sendiri — persis aturan pertama ARIA: pakai yang bawaan kalau ada.',
        },
        {
          term: 'aria-modal',
          meaning:
            'Memberi tahu pembaca layar bahwa isi **di luar dialog tidak relevan** selama ia terbuka. Perlu dicatat: atribut ini tidak melakukan apa pun secara teknis — ia hanya pemberitahuan, dan penonaktifan sungguhan tetap butuh `inert` atau focus trap.',
        },
      ),

      h2('Lima kewajiban'),
      ol(
        '**Portal** — dirender di luar pohon induknya, supaya `overflow: hidden` dan `z-index` induk tidak memotongnya.',
        '**Focus trap** — Tab tidak boleh keluar dari dialog selama ia terbuka.',
        '**Pengembalian fokus** — saat ditutup, fokus kembali ke elemen yang membukanya.',
        '**`Esc` menutup** — tanpa pengecualian.',
        '**Scroll halaman terkunci** — latar belakang tidak boleh ikut bergulir.',
      ),

      h2('Pakai `<dialog>` bawaan kalau bisa'),
      code(
        'tsx',
        `
        import { useEffect, useRef } from 'react';

        export function Dialog({ terbuka, onTutup, judul, children }) {
          const ref = useRef<HTMLDialogElement>(null);

          useEffect(() => {
            const el = ref.current;
            if (!el) return;

            if (terbuka && !el.open) el.showModal();      // focus trap + inert latar OTOMATIS
            if (!terbuka && el.open) el.close();
          }, [terbuka]);

          return (
            <dialog
              ref={ref}
              onClose={onTutup}                            // menangkap Esc juga
              onClick={(e) => {
                if (e.target === ref.current) onTutup();   // klik di backdrop
              }}
              className="bg-surface border-border max-w-md rounded-lg border p-0 backdrop:bg-black/40"
              aria-labelledby="judul-dialog"
            >
              <div className="p-5">
                <h2 id="judul-dialog" className="text-text text-lg font-semibold">
                  {judul}
                </h2>
                <div className="mt-3">{children}</div>
              </div>
            </dialog>
          );
        }
        `,
      ),
      callout(
        'tip',
        '`showModal()` memberimu empat dari lima kewajiban secara gratis',
        'Focus trap, `Esc`, backdrop, dan membuat latar belakang inert — semuanya sudah ditangani browser. Ini alasan terkuat memakai elemen bawaan daripada membangun sendiri dengan `<div>`.',
      ),
      callout(
        'warning',
        'Yang masih harus kamu tangani sendiri',
        'Pengembalian fokus (browser mengembalikan ke elemen pemicu **hanya** kalau ia masih ada di DOM), dan penguncian scroll di sebagian browser. Uji keduanya, jangan asumsikan.',
      ),

      h2('Versi manual, kalau memang perlu'),
      code(
        'tsx',
        `
        import { createPortal } from 'react-dom';
        import { useEffect, useRef } from 'react';

        export function Modal({ terbuka, onTutup, judul, children }) {
          const panelRef = useRef<HTMLDivElement>(null);
          const pemicuRef = useRef<HTMLElement | null>(null);

          useEffect(() => {
            if (!terbuka) return;

            pemicuRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';

            // Fokus ke elemen pertama yang bisa difokus
            const bisaFokus = panelRef.current?.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
            );
            bisaFokus?.[0]?.focus();

            function onKey(e: KeyboardEvent) {
              if (e.key === 'Escape') {
                onTutup();
                return;
              }

              if (e.key !== 'Tab' || !bisaFokus?.length) return;

              const pertama = bisaFokus[0];
              const terakhir = bisaFokus[bisaFokus.length - 1];

              if (e.shiftKey && document.activeElement === pertama) {
                e.preventDefault();
                terakhir.focus();
              } else if (!e.shiftKey && document.activeElement === terakhir) {
                e.preventDefault();
                pertama.focus();
              }
            }

            document.addEventListener('keydown', onKey);

            return () => {
              document.removeEventListener('keydown', onKey);
              document.body.style.overflow = '';
              pemicuRef.current?.focus();      // KEMBALIKAN FOKUS
            };
          }, [terbuka, onTutup]);

          if (!terbuka) return null;

          return createPortal(
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={onTutup} aria-hidden="true" />

              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="judul-modal"
                className="bg-surface border-border absolute top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5"
              >
                <h2 id="judul-modal">{judul}</h2>
                {children}
              </div>
            </div>,
            document.body,
          );
        }
        `,
      ),

      h2('Kesalahan yang paling sering'),
      table(
        ['Kesalahan', 'Akibatnya'],
        [
          ['Tidak mengembalikan fokus', 'Pengguna keyboard terlempar ke awal dokumen'],
          ['Tanpa `aria-modal="true"`', 'Screen reader tetap membacakan latar belakang'],
          ['Tanpa `aria-labelledby`', 'Dialog diumumkan tanpa nama'],
          ['Backdrop tanpa `aria-hidden`', 'Elemen kosong ikut dibacakan'],
          ['Tidak mengunci scroll', 'Latar belakang bergulir di belakang dialog'],
          ['Tidak dirender lewat portal', '`overflow: hidden` induk memotong dialog'],
        ],
      ),

      h2('Uji dengan keyboard saja'),
      ol(
        'Tab ke tombol pemicu, tekan Enter — apakah dialog terbuka dan fokus masuk ke dalamnya?',
        'Tab berulang — apakah fokus berputar di dalam dialog, tidak keluar?',
        'Shift+Tab dari elemen pertama — apakah lompat ke elemen terakhir?',
        'Tekan `Esc` — apakah tertutup?',
        'Setelah tertutup — apakah fokus kembali ke tombol pemicu?',
      ),
      callout(
        'danger',
        'Kalau salah satu dari lima gagal, dialog itu tidak bisa dipakai tanpa mouse',
        'Ini bukan penilaian subjektif. Pengguna keyboard akan benar-benar terjebak atau tersesat — dan tidak ada yang terlihat salah saat kamu mengujinya dengan mouse.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pakai `<dialog>` + `showModal()` — ia memberi empat dari lima kewajiban gratis.',
        'Pengembalian fokus tetap harus kamu pastikan sendiri.',
        'Portal mencegah `overflow: hidden` induk memotong dialog.',
        '`role="dialog"` + `aria-modal` + `aria-labelledby` adalah satu paket.',
        'Uji seluruhnya dengan keyboard saja — mouse menyembunyikan semua cacatnya.',
      ),
      references(
        {
          label: '<dialog>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog',
          source: 'MDN',
          note: 'Elemen bawaan yang sudah memberi focus trap, `Esc`, dan backdrop tanpa kode tambahan.',
        },
        {
          label: 'createPortal',
          href: 'https://react.dev/reference/react-dom/createPortal',
          source: 'React',
          note: 'Merender di luar pohon induk agar `overflow: hidden` tidak memotong dialog.',
        },
        {
          label: 'Dialog (Modal) Pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
          source: 'W3C ARIA APG',
          note: 'Pola resmi lengkap: peran, atribut, dan seluruh perilaku keyboard yang diharapkan.',
        },
        {
          label: 'inert',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inert',
          source: 'MDN',
          note: 'Cara modern menonaktifkan latar belakang secara menyeluruh, bukan hanya secara visual.',
        },
        {
          label: 'Focus Order — WCAG 2.4.3',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html',
          source: 'W3C WCAG',
          note: 'Dasar kewajiban mengembalikan fokus ke elemen pemicu setelah dialog ditutup.',
        },
      ),
    ],
  ),

  written(
    'studi-tabs',
    'Studi Kasus: `Tabs` sebagai compound component',
    14,
    'Beberapa komponen yang berbagi state lewat context — dan pola keyboard ARIA yang menyertainya.',
    [
      terms(
        {
          term: 'compound component',
          meaning:
            'Terjemahannya **komponen majemuk**. Sekelompok komponen yang **hanya bermakna kalau dipakai bersama**: `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`. Keunggulannya, struktur markup langsung menceritakan hubungan antar-bagiannya — tanpa satu pun prop yang menjelaskan hierarki.',
        },
        {
          term: 'Context',
          meaning:
            'Cara React mengalirkan nilai ke seluruh keturunan **tanpa mengopernya lewat props satu per satu**. Pada compound component inilah kegunaannya paling jelas: `<Tabs.Tab>` bisa berada berapa lapis pun di dalam, dan tetap tahu tab mana yang sedang aktif.',
        },
        {
          term: 'implicit state sharing',
          meaning:
            'Terjemahan bebasnya **berbagi keadaan secara tersirat**. Anak-anak compound component saling terhubung tanpa pemakainya perlu mengoper apa pun. Ini kelebihan sekaligus jebakannya — memakai `<Tabs.Tab>` di luar `<Tabs>` harus **gagal dengan pesan yang jelas**, bukan diam-diam menghasilkan `undefined`.',
        },
        {
          term: 'roving tabindex',
          meaning:
            'Terjemahan bebasnya **tabindex berpindah**. Pola di mana **hanya satu** tab yang bisa dijangkau Tab (`tabIndex={0}`), sisanya `-1`. Alasannya penting: tanpa itu, daftar berisi sepuluh tab memaksa pengguna keyboard menekan Tab sepuluh kali hanya untuk melewatinya. Perpindahan antar-tab memakai tombol panah, bukan Tab.',
        },
        {
          term: 'tombol panah',
          meaning:
            'Cara baku berpindah antar-item dalam satu kelompok: panah kiri-kanan untuk tab mendatar, ditambah `Home` dan `End` untuk melompat ke ujung. Ini bukan tambahan opsional — pengguna pembaca layar **mengharapkannya**, karena begitulah semua komponen tab lain berperilaku.',
        },
        {
          term: 'role="tablist"',
          meaning:
            'Trio peran yang wajib lengkap: `tablist` untuk wadahnya, `tab` untuk tiap tombol, `tabpanel` untuk isinya. Ketiganya diikat `aria-controls` dan `aria-labelledby` sehingga pembaca layar tahu tab mana mengendalikan panel mana.',
        },
        {
          term: 'aria-selected',
          meaning:
            'Menandai tab mana yang **sedang aktif**. Berbeda dari `aria-current` yang dipakai untuk navigasi halaman. Tanpa itu, pengguna pembaca layar mendengar empat tab tanpa tahu satu pun yang sedang terbuka.',
        },
        {
          term: 'displayName',
          meaning:
            'Nama yang muncul di React DevTools. Perlu disetel manual pada compound component, karena `Tabs.Tab` yang ditulis sebagai fungsi anonim akan muncul sebagai `Unknown` — dan menelusuri pohon komponen jadi jauh lebih sulit.',
        },
      ),

      h2('API yang dituju'),
      code(
        'tsx',
        `
        <Tabs default="profil">
          <Tabs.List label="Pengaturan akun">
            <Tabs.Tab value="profil">Profil</Tabs.Tab>
            <Tabs.Tab value="keamanan">Keamanan</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profil">…</Tabs.Panel>
          <Tabs.Panel value="keamanan">…</Tabs.Panel>
        </Tabs>
        `,
      ),
      p(
        'Strukturnya terbaca langsung dari markup, dan menambah tab tidak menyentuh komponen `Tabs` sama sekali.',
      ),

      h2('Context sebagai penghubung'),
      code(
        'tsx',
        `
        import { createContext, useContext, useId, useState } from 'react';

        type Ctx = {
          aktif: string;
          setAktif: (v: string) => void;
          baseId: string;
        };

        const TabsContext = createContext<Ctx | null>(null);

        function useTabs() {
          const ctx = useContext(TabsContext);
          if (!ctx) throw new Error('Tabs.* harus dipakai di dalam <Tabs>');
          return ctx;
        }
        `,
      ),
      callout(
        'tip',
        'Melempar error saat dipakai di luar induknya',
        'Tanpa ini, `Tabs.Tab` yang dipakai sendirian akan gagal dengan pesan "Cannot read properties of null" — yang tidak menjelaskan apa pun. Satu `throw` dengan kalimat jelas menghemat waktu penelusuran yang lama.',
      ),

      h2('Implementasi'),
      code(
        'tsx',
        `
        export function Tabs({
          default: awal,
          children,
        }: {
          default: string;
          children: React.ReactNode;
        }) {
          const [aktif, setAktif] = useState(awal);
          const baseId = useId();

          return (
            <TabsContext.Provider value={{ aktif, setAktif, baseId }}>
              {children}
            </TabsContext.Provider>
          );
        }

        Tabs.List = function List({ label, children }: { label: string; children: React.ReactNode }) {
          return (
            <div role="tablist" aria-label={label} className="border-border flex gap-1 border-b">
              {children}
            </div>
          );
        };

        Tabs.Tab = function Tab({ value, children }: { value: string; children: React.ReactNode }) {
          const { aktif, setAktif, baseId } = useTabs();
          const terpilih = aktif === value;

          return (
            <button
              type="button"
              role="tab"
              id={\`\${baseId}-tab-\${value}\`}
              aria-selected={terpilih}
              aria-controls={\`\${baseId}-panel-\${value}\`}
              /* Hanya tab aktif yang bisa di-Tab — sisanya lewat panah */
              tabIndex={terpilih ? 0 : -1}
              onClick={() => setAktif(value)}
              className={cn(
                'rounded-t-md px-4 py-2 text-sm transition-colors duration-150',
                terpilih ? 'text-text border-primary-fill border-b-2 font-medium' : 'text-muted hover:text-text',
              )}
            >
              {children}
            </button>
          );
        };

        Tabs.Panel = function Panel({ value, children }: { value: string; children: React.ReactNode }) {
          const { aktif, baseId } = useTabs();
          if (aktif !== value) return null;

          return (
            <div
              role="tabpanel"
              id={\`\${baseId}-panel-\${value}\`}
              aria-labelledby={\`\${baseId}-tab-\${value}\`}
              tabIndex={0}
              className="py-4"
            >
              {children}
            </div>
          );
        };
        `,
      ),

      h2('Navigasi keyboard — pola ARIA'),
      code(
        'tsx',
        `
        Tabs.List = function List({ label, children }) {
          function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
            const tabs = Array.from(
              e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
            );
            const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
            if (i === -1) return;

            const peta: Record<string, number> = {
              ArrowRight: (i + 1) % tabs.length,
              ArrowLeft: (i - 1 + tabs.length) % tabs.length,
              Home: 0,
              End: tabs.length - 1,
            };

            const tujuan = peta[e.key];
            if (tujuan === undefined) return;

            e.preventDefault();
            tabs[tujuan]?.focus();
            tabs[tujuan]?.click();
          }

          return (
            <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="…">
              {children}
            </div>
          );
        };
        `,
      ),
      callout(
        'warning',
        'Kenapa `tabIndex={-1}` pada tab yang tidak aktif',
        'Pola ARIA untuk tablist adalah **roving tabindex**: satu Tab masuk ke grup, lalu panah berpindah antar tab. Kalau semua tab bisa di-Tab, pengguna keyboard harus menekan Tab sepuluh kali untuk melewati sepuluh tab — melelahkan dan bukan yang diharapkan.',
      ),

      h2('Trade-off compound component'),
      table(
        ['Kelebihan', 'Kekurangan'],
        [
          ['Struktur terbaca dari markup', 'Lebih banyak bagian untuk dirakit'],
          ['Menambah tab tanpa mengubah `Tabs`', 'Context menambah satu lapisan'],
          ['Isi tab bebas sepenuhnya', 'Pemakai bisa merakitnya salah'],
        ],
      ),
      p(
        'Untuk dua tab tetap yang tidak akan berubah, komponen dengan props biasa lebih sederhana. Pola ini menang saat jumlah dan isi tab benar-benar bervariasi.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Compound component berbagi state lewat context, bukan lewat props berantai.',
        'Lempar error yang jelas kalau bagian dipakai di luar induknya.',
        'Roving tabindex: satu tab bisa di-Tab, sisanya lewat panah.',
        '`role`, `aria-selected`, `aria-controls`, `aria-labelledby` adalah satu paket.',
        'Pola ini menang saat isinya bervariasi; untuk dua tab tetap, props biasa lebih sederhana.',
      ),
      references(
        {
          label: 'Tabs Pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
          source: 'W3C ARIA APG',
          note: 'Pola resmi lengkap: peran, atribut, roving tabindex, dan seluruh perilaku tombol panah.',
        },
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Mekanisme berbagi state antar-bagian compound component tanpa props berantai.',
        },
        {
          label: 'useContext',
          href: 'https://react.dev/reference/react/useContext',
          source: 'React',
          note: 'Termasuk pola melempar error saat dipakai di luar provider-nya.',
        },
        {
          label: 'tabindex',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex',
          source: 'MDN',
          note: 'Dasar teknis roving tabindex — kenapa `-1` tetap bisa difokuskan lewat kode.',
        },
      ),
    ],
  ),

  written(
    'studi-accordion',
    'Studi Kasus: `Accordion`',
    12,
    'Buka-tutup konten dengan semantik yang benar — dan kapan HTML bawaan sudah cukup.',
    [
      terms(
        {
          term: 'accordion',
          meaning:
            'Terjemahannya **akordeon**, dinamai dari alat musik yang melipat dan mengembang. Kumpulan bagian yang bisa dibuka-tutup untuk menghemat ruang. Pertanyaan pertamanya bukan "bagaimana membuatnya", melainkan **"apakah aku benar-benar membutuhkannya"** — menyembunyikan konten juga berarti membuatnya lebih sulit ditemukan.',
        },
        {
          term: '<details> & <summary>',
          meaning:
            'Elemen HTML bawaan yang **sudah menyediakan seluruh perilaku akordeon tanpa satu baris JavaScript**: keyboard bekerja, keadaannya diumumkan pembaca layar, dan Chrome bahkan bisa menemukan teks di dalamnya yang tertutup lewat Ctrl+F. Kalau kebutuhanmu sesederhana FAQ, **berhenti di sini** — versi React justru lebih buruk.',
        },
        {
          term: 'progressive enhancement',
          meaning:
            'Prinsip yang mendasari urutan sub-bab ini: mulai dari yang bawaan, naik ke versi buatan sendiri **hanya kalau ada kebutuhan yang benar-benar tidak terpenuhi**. Empat kebutuhan itu disebutkan tegas di bawah, dan di luar itu HTML bawaan menang.',
        },
        {
          term: 'aria-expanded',
          meaning:
            'Menandai apakah bagian yang dikendalikan sebuah tombol sedang **terbuka atau tertutup**. Wajib pada versi buatan sendiri — inilah salah satu hal yang `<details>` berikan gratis dan sering terlupakan saat orang membangunnya ulang.',
        },
        {
          term: 'aria-controls',
          meaning:
            'Menghubungkan tombol pemicu ke **isi yang dikendalikannya**, dengan menyebut `id`-nya. Melengkapi `aria-expanded`: yang satu menyatakan keadaannya, yang lain menyatakan apa yang keadaannya berubah.',
        },
        {
          term: 'heading di dalam tombol',
          meaning:
            'Susunan yang benar dan sering terbalik: `<h3><button>…</button></h3>`, **bukan** `<button><h3>…</h3></button>`. Alasannya, pembaca layar memakai daftar heading untuk melompat antar-bagian — dan heading yang terkubur di dalam tombol tidak muncul di daftar itu.',
        },
        {
          term: 'animasi tinggi',
          meaning:
            'Alasan paling sering orang meninggalkan `<details>`. Menganimasikan `height` memicu reflow tiap frame, jadi pakai `grid-template-rows: 0fr → 1fr` atau ukur tingginya dulu lalu animasikan `transform`. Dan seperti biasa: hormati `prefers-reduced-motion`.',
        },
        {
          term: 'lazy content',
          meaning:
            'Terjemahannya **isi yang dimuat belakangan**. Isi bagian baru diambil saat pertama kali dibuka. Berguna untuk akordeon berisi data berat — tapi ingat menyediakan keadaan memuat, karena isi yang muncul terlambat tanpa penjelasan terasa seperti gagal.',
        },
      ),

      h2('Coba `<details>` lebih dulu'),
      code(
        'tsx',
        `
        <details className="border-border border-b">
          <summary className="cursor-pointer py-3 font-medium">
            Bagaimana cara mengekspor data?
          </summary>
          <div className="text-muted pb-3 text-sm">
            Buka Pengaturan lalu tekan Ekspor JSON.
          </div>
        </details>
        `,
      ),
      callout(
        'tip',
        'Keyboard, semantik, dan pencarian di halaman — semuanya sudah benar',
        'Enter dan Spasi bekerja, screen reader mengumumkan keadaannya, dan Chrome bahkan bisa menemukan teks di dalam `<details>` yang tertutup lewat Ctrl+F. Kalau kebutuhanmu sesederhana FAQ, berhenti di sini.',
      ),

      h2('Kapan butuh versi React'),
      ul(
        'Hanya satu boleh terbuka pada satu waktu.',
        'Keadaan terbuka harus dikendalikan dari luar.',
        'Butuh animasi tinggi yang mulus.',
        'Isinya baru dimuat saat dibuka.',
      ),

      h2('Implementasi'),
      code(
        'tsx',
        `
        import { useId, useState } from 'react';

        type Item = { id: string; judul: string; isi: React.ReactNode };

        export function Accordion({ items, tunggal = false }: { items: Item[]; tunggal?: boolean }) {
          const [terbuka, setTerbuka] = useState<string[]>([]);
          const baseId = useId();

          function toggle(id: string) {
            setTerbuka((sekarang) => {
              if (sekarang.includes(id)) return sekarang.filter((x) => x !== id);
              return tunggal ? [id] : [...sekarang, id];
            });
          }

          return (
            <div className="border-border divide-border divide-y rounded-lg border">
              {items.map((item) => {
                const aktif = terbuka.includes(item.id);
                const tombolId = \`\${baseId}-t-\${item.id}\`;
                const panelId = \`\${baseId}-p-\${item.id}\`;

                return (
                  <div key={item.id}>
                    {/* Heading asli, supaya struktur dokumen tetap benar */}
                    <h3>
                      <button
                        type="button"
                        id={tombolId}
                        aria-expanded={aktif}
                        aria-controls={panelId}
                        onClick={() => toggle(item.id)}
                        className="hover:bg-raised flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                      >
                        <span className="text-text text-sm font-medium">{item.judul}</span>
                        <ChevronIcon
                          aria-hidden="true"
                          className={cn('text-faint transition-transform duration-150', aktif && 'rotate-180')}
                        />
                      </button>
                    </h3>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={tombolId}
                      hidden={!aktif}
                      className="text-muted px-4 pb-3 text-sm"
                    >
                      {item.isi}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        `,
      ),
      callout(
        'warning',
        'Bungkus tombol dengan heading yang sesuai',
        'Screen reader punya pintasan untuk melompat antar heading. Accordion tanpa heading membuat daftar pertanyaan tidak bisa dilewati dengan cepat. Pilih level yang sesuai konteks — `h3` di dalam bagian ber-`h2`.',
      ),

      h2('Animasi tinggi'),
      code(
        'css',
        `
        /* height: auto tidak bisa dianimasikan. grid-template-rows bisa. */
        .panel {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 180ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .panel[data-terbuka='true'] {
          grid-template-rows: 1fr;
        }

        .panel > div {
          overflow: hidden;
        }
        `,
      ),
      callout(
        'danger',
        'Menganimasikan tinggi memicu layout di setiap frame',
        'Teknik `grid-template-rows` di atas tetap memicu layout — ia lebih baik daripada `max-height` yang menebak, tapi tidak sekelas `transform`. Untuk accordion yang jarang dibuka, ini dapat diterima. Untuk daftar panjang yang sering dibuka-tutup, pertimbangkan tanpa animasi sama sekali.',
      ),
      p(
        'Perhatikan juga: dengan animasi, kamu tidak bisa memakai `hidden` — karena elemen tersembunyi tidak bisa dianimasikan. Gunakan `inert` pada panel tertutup supaya isinya tetap tidak bisa di-Tab.',
      ),

      h2('Uji cepat'),
      ol(
        'Tab ke tombol — Enter dan Spasi keduanya membuka?',
        'Saat tertutup, apakah isi di dalamnya tidak bisa di-Tab?',
        'Apakah `aria-expanded` benar-benar berubah? (periksa di DevTools)',
        'Apakah ikon panah `aria-hidden`?',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`<details>`/`<summary>` sudah benar untuk kebanyakan kasus — pakai itu dulu.',
        'Versi React diperlukan untuk mode tunggal, kendali luar, atau animasi.',
        'Bungkus tombol dengan heading supaya bisa dilompati screen reader.',
        '`aria-expanded` + `aria-controls` + `role="region"` adalah satu paket.',
        'Panel tertutup harus `hidden` atau `inert` — kalau tidak, isinya tetap bisa di-Tab.',
      ),
      references(
        {
          label: '<details>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details',
          source: 'MDN',
          note: 'Seluruh perilaku akordeon tanpa JavaScript — coba ini lebih dulu.',
        },
        {
          label: 'Accordion Pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
          source: 'W3C ARIA APG',
          note: 'Pola resmi versi buatan sendiri, termasuk susunan heading yang membungkus tombol.',
        },
        {
          label: 'aria-controls',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-controls',
          source: 'MDN',
          note: 'Menghubungkan tombol pemicu ke panel yang dikendalikannya.',
        },
        {
          label: 'Animating height',
          href: 'https://web.dev/articles/animating-a-css-gradient-border',
          source: 'web.dev',
          note: 'Konteks kenapa menganimasikan tinggi memicu layout tiap frame, berbeda dari `transform`.',
        },
      ),
    ],
  ),

  written(
    'studi-toast',
    'Studi Kasus: `Toast`',
    13,
    'Notifikasi sementara yang tetap terbaca teknologi bantu — dan tidak menghilang terlalu cepat.',
    [
      terms(
        {
          term: 'toast',
          meaning:
            'Terjemahan harfiahnya **roti panggang** — dinamai dari cara pesannya "meloncat" muncul seperti roti dari pemanggang. Notifikasi singkat yang muncul lalu menghilang sendiri. Batas pemakaiannya tegas: **hanya untuk kabar yang boleh terlewat**. Sesuatu yang wajib dibaca pengguna tidak boleh ditaruh di sini.',
        },
        {
          term: 'aria-live',
          meaning:
            'Menandai area yang isinya berubah-ubah agar **diumumkan pembaca layar tanpa memindahkan fokus**. Inilah yang membuat toast terbaca sama sekali — tanpa itu, pengguna tunanetra tidak akan pernah tahu ada pesan yang muncul dan hilang.',
        },
        {
          term: 'polite vs assertive',
          meaning:
            'Dua tingkat kepentingan `aria-live`. **`polite`** menunggu pembaca layar selesai membaca hal lain — pilihan yang benar untuk hampir semua toast. **`assertive`** memotong apa pun yang sedang dibacakan, dan hanya pantas untuk kegagalan yang benar-benar mendesak. Memakai `assertive` sembarangan sama kasarnya dengan menyela orang bicara.',
        },
        {
          term: 'role="status"',
          meaning:
            'Peran yang sudah membawa `aria-live="polite"` di dalamnya. Pasangannya `role="alert"` yang setara dengan `assertive`. Memakai peran ini lebih ringkas daripada menulis atribut `aria-live` sendiri.',
        },
        {
          term: 'durasi',
          meaning:
            'Berapa lama toast bertahan. Aturan praktisnya: **minimal 5 detik**, dan lebih lama untuk pesan yang panjang — orang butuh waktu membaca, dan pembaca layar butuh waktu membacakan. Toast tiga detik yang berisi dua kalimat praktis mustahil ditangkap.',
        },
        {
          term: 'jeda saat hover',
          meaning:
            'Menghentikan hitungan mundur selama kursor berada di atas toast, atau selama ia difokuskan keyboard. Tanpa itu, pesan bisa menghilang **tepat saat pengguna hendak mengklik tombol aksinya** — dan itu termasuk kegagalan yang paling membuat frustrasi.',
        },
        {
          term: 'antrean toast',
          meaning:
            'Pembatasan berapa banyak toast boleh tampil bersamaan, biasanya tiga. Lebih dari itu menumpuk menutupi layar dan tidak ada yang sempat terbaca. Yang berlebih **diantrekan**, bukan ditampilkan sekaligus.',
        },
        {
          term: 'tombol tutup',
          meaning:
            'Wajib ada dan wajib punya nama yang terbaca. Alasannya bukan kenyamanan: toast yang hanya bisa hilang lewat waktu berarti pengguna keyboard **tidak punya cara apa pun** untuk membersihkan layarnya.',
        },
        {
          term: 'WCAG 2.2.1',
          meaning:
            'Standar bernama *Timing Adjustable*. Isinya: kalau ada batas waktu, pengguna harus bisa mematikan, menyesuaikan, atau memperpanjangnya. Inilah dasar formal dari kewajiban jeda-saat-hover dan tombol tutup di atas.',
        },
      ),

      h2('Arsitektur'),
      code(
        'tsx',
        `
        import { createContext, useCallback, useContext, useState } from 'react';

        type Toast = {
          id: string;
          pesan: string;
          nada: 'info' | 'sukses' | 'gagal';
          durasi: number;
        };

        const ToastContext = createContext<{ tampilkan: (t: Omit<Toast, 'id'>) => void } | null>(null);

        export function useToast() {
          const ctx = useContext(ToastContext);
          if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
          return ctx;
        }

        export function ToastProvider({ children }: { children: React.ReactNode }) {
          const [daftar, setDaftar] = useState<Toast[]>([]);

          const tampilkan = useCallback((t: Omit<Toast, 'id'>) => {
            const id = crypto.randomUUID();
            setDaftar((d) => [...d, { ...t, id }]);
            setTimeout(() => {
              setDaftar((d) => d.filter((x) => x.id !== id));
            }, t.durasi);
          }, []);

          return (
            <ToastContext.Provider value={{ tampilkan }}>
              {children}
              <Wilayah daftar={daftar} onTutup={(id) => setDaftar((d) => d.filter((x) => x.id !== id))} />
            </ToastContext.Provider>
          );
        }
        `,
      ),

      h2('`role` yang tepat menentukan apakah ia terdengar'),
      table(
        ['Nada', '`role`', 'Perilaku'],
        [
          ['Info, sukses', '`status`', 'Diumumkan setelah pembaca selesai kalimat berjalan'],
          ['Gagal, peringatan', '`alert`', '**Menyela** pembacaan yang sedang berlangsung'],
        ],
      ),
      code(
        'tsx',
        `
        function Wilayah({ daftar, onTutup }) {
          return (
            <div
              className="fixed right-4 bottom-4 z-50 flex flex-col gap-2"
              /* Wilayah live harus ADA di DOM sejak awal, meski kosong */
              aria-live="polite"
              aria-atomic="false"
            >
              {daftar.map((t) => (
                <div
                  key={t.id}
                  role={t.nada === 'gagal' ? 'alert' : 'status'}
                  className={cn(
                    'border-border bg-surface flex items-start gap-3 rounded-md border p-3 shadow-sm',
                    t.nada === 'gagal' && 'border-danger',
                  )}
                >
                  <IkonNada nada={t.nada} aria-hidden="true" />
                  <p className="text-text flex-1 text-sm">{t.pesan}</p>

                  <button
                    type="button"
                    onClick={() => onTutup(t.id)}
                    className="text-faint hover:text-text -m-1 p-1"
                  >
                    <CloseIcon aria-hidden="true" />
                    <span className="sr-only">Tutup notifikasi</span>
                  </button>
                </div>
              ))}
            </div>
          );
        }
        `,
      ),
      callout(
        'danger',
        'Wilayah live harus ada di DOM sebelum isinya muncul',
        'Kalau `aria-live` baru ditambahkan bersamaan dengan pesannya, sebagian screen reader **tidak mengumumkannya sama sekali** — mereka hanya memantau wilayah yang sudah ada. Render wadahnya sejak awal, meski kosong.',
      ),

      h2('Durasi dan kapan tidak boleh hilang'),
      table(
        ['Jenis pesan', 'Durasi'],
        [
          ['Konfirmasi singkat ("Tersimpan")', '3–4 detik'],
          ['Pesan lebih panjang', '5–7 detik'],
          ['Kegagalan yang perlu tindakan', '**Tidak hilang sendiri**'],
          ['Ada tombol "Batalkan"', '**Tidak hilang sendiri**'],
        ],
      ),
      callout(
        'warning',
        'Pesan yang menghilang sendiri tidak boleh membawa informasi penting',
        'Kalau toast berisi satu-satunya cara membatalkan tindakan, atau satu-satunya penjelasan kenapa sesuatu gagal, ia tidak boleh punya timer. Pengguna yang sedang melihat ke tempat lain akan kehilangannya selamanya.',
      ),

      h2('Jeda saat hover dan fokus'),
      code(
        'tsx',
        `
        // Timer harus berhenti saat pengguna sedang membaca atau berinteraksi
        <div
          onMouseEnter={jedaTimer}
          onMouseLeave={lanjutkanTimer}
          onFocus={jedaTimer}
          onBlur={lanjutkanTimer}
        >
        `,
      ),

      h2('Batasi jumlah yang tampil'),
      code(
        'tsx',
        `
        setDaftar((d) => [...d, baru].slice(-3));   // maksimal tiga sekaligus
        `,
      ),
      p(
        'Tanpa batas, satu operasi yang gagal berulang akan memenuhi layar dan menutupi antarmuka yang sedang dipakai.',
      ),

      h2('Kapan toast salah pilihan'),
      ul(
        '**Error validasi form** — tempatnya di dekat fieldnya, bukan melayang di sudut.',
        '**Konfirmasi tindakan merusak** — pakai dialog yang menuntut jawaban.',
        '**Informasi yang harus dibaca** — toast bisa terlewat sepenuhnya.',
        '**Progres yang berjalan lama** — pakai indikator di tempat aksinya.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        '`role="alert"` untuk kegagalan (menyela), `role="status"` untuk sisanya.',
        'Wadah `aria-live` harus ada di DOM sejak awal, meski kosong.',
        'Pesan yang membawa informasi penting tidak boleh hilang sendiri.',
        'Jeda timer saat hover dan fokus.',
        'Batasi jumlah yang tampil bersamaan.',
      ),
      references(
        {
          label: 'ARIA live regions',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions',
          source: 'MDN',
          note: 'Perbedaan `polite` dan `assertive`, dan kenapa wadahnya harus ada di DOM sejak awal.',
        },
        {
          label: 'role="status"',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role',
          source: 'MDN',
          note: 'Peran yang sudah membawa `aria-live="polite"` tanpa perlu menulisnya sendiri.',
        },
        {
          label: 'Timing Adjustable — WCAG 2.2.1',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html',
          source: 'W3C WCAG',
          note: 'Dasar formal kewajiban jeda saat hover dan tombol tutup pada toast.',
        },
        {
          label: 'Alert Pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/',
          source: 'W3C ARIA APG',
          note: 'Kapan sebuah pesan pantas menyela pembaca layar dan kapan tidak.',
        },
      ),
    ],
  ),

  written(
    'studi-data-table',
    'Studi Kasus: Data Table',
    15,
    'Tabel dengan sort, filter, dan paginasi — dan kenapa `<table>` asli tetap penting.',
    [
      terms(
        {
          term: 'data table',
          meaning:
            'Tabel berisi data yang bisa diurutkan, disaring, dan dibagi ke beberapa halaman. Yang wajib dipegang: sebanyak apa pun fiturnya, dasarnya tetap **`<table>` asli** — bukan `<div>` bergrid yang terlihat sama.',
        },
        {
          term: 'kenapa <table> asli',
          meaning:
            'Bukan soal tampilan. `<div>` bergrid **menghapus seluruh hubungan baris-kolom** dari sudut pandang pembaca layar: pengguna tidak bisa menanyakan "sel ini kolom apa", tidak bisa bernavigasi antar-sel dengan tombol khusus tabel, dan tidak mendengar nama kolom saat berpindah. Grid CSS bisa dipakai untuk tata letaknya, tapi elemennya harus tetap tabel.',
        },
        {
          term: 'scope',
          meaning:
            'Atribut pada `<th>` yang menyatakan apakah ia judul untuk **kolom** (`scope="col"`) atau untuk **baris** (`scope="row"`). Inilah yang membuat pembaca layar bisa mengumumkan "Email, a@b.c" alih-alih hanya "a@b.c" saat pengguna berpindah sel.',
        },
        {
          term: 'caption',
          meaning:
            'Elemen `<caption>` yang memberi **judul pada tabel**, ditulis sebagai anak pertama `<table>`. Sering dilewati karena terlihat seperti hiasan, padahal ia yang menjawab "tabel ini isinya apa" bagi pengguna yang tidak melihat konteks di sekitarnya.',
        },
        {
          term: 'aria-sort',
          meaning:
            'Menandai kolom mana yang sedang menjadi dasar pengurutan dan ke arah mana — `"ascending"`, `"descending"`, atau `"none"`. Ikon panah saja tidak cukup: itu warna dan bentuk sebagai satu-satunya penanda, persis yang dilarang di Bab 1.',
        },
        {
          term: 'paginasi',
          meaning:
            'Membagi data ke beberapa halaman. Dua kewajiban aksesibilitasnya sering terlupakan: **umumkan perubahan halaman** lewat area `aria-live`, dan **kembalikan fokus** ke awal tabel setelah berpindah — kalau tidak, pengguna keyboard tetap berada di tombol paginasi tanpa tahu isinya sudah berganti.',
        },
        {
          term: 'virtualisasi',
          meaning:
            'Hanya merender baris yang **benar-benar terlihat di layar**. Diperlukan untuk ribuan baris. Harganya nyata: pencarian bawaan browser (Ctrl+F) berhenti bekerja karena barisnya memang tidak ada di DOM — jadi jangan dipakai sebelum jumlah datanya benar-benar menuntutnya.',
        },
        {
          term: 'sort di klien vs server',
          meaning:
            'Mengurutkan di browser hanya benar kalau **seluruh data memang sudah ada di sana**. Begitu ada paginasi dari server, pengurutan di klien hanya mengurutkan halaman yang sedang tampil — dan itu **salah secara diam-diam**, karena hasilnya terlihat masuk akal.',
        },
        {
          term: 'responsif untuk tabel',
          meaning:
            'Tabel tidak bisa dibuat responsif dengan cara biasa. Dua pendekatan yang sah: **gulir mendatar** di dalam wadahnya sendiri (dengan `tabIndex={0}` agar bisa digulir keyboard), atau **berubah bentuk menjadi daftar kartu** di layar kecil.',
        },
      ),

      h2('Pakai `<table>`, bukan `<div>`'),
      code(
        'tsx',
        `
        // SALAH: terlihat sama, tapi hubungan baris-kolom hilang sepenuhnya
        <div className="grid grid-cols-3">
          <div>Nama</div><div>Email</div><div>Peran</div>
          <div>Zum</div><div>a@b.c</div><div>Admin</div>
        </div>

        // BENAR
        <table>
          <thead>
            <tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Peran</th></tr>
          </thead>
          <tbody>
            <tr><td>Zum</td><td>a@b.c</td><td>Admin</td></tr>
          </tbody>
        </table>
        `,
      ),
      callout(
        'danger',
        'Tabel dari `<div>` tidak bisa dinavigasi',
        'Screen reader punya mode tabel: pengguna bisa berpindah antar sel dengan panah dan mendengar **nama kolomnya** di setiap sel. Dengan `<div>`, mereka hanya mendengar deretan teks tanpa konteks — "Zum, a@b.c, Admin, Ani, c@d.e, Editor" tanpa tahu mana yang mana.',
      ),

      h2('Struktur lengkap'),
      code(
        'tsx',
        `
        <div className="border-border scroll-x rounded-lg border">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">Daftar pengguna, {total} baris</caption>

            <thead>
              <tr className="border-border bg-raised border-b">
                {kolom.map((k) => (
                  <th key={k.id} scope="col" aria-sort={ariaSort(k.id)} className="px-3 py-2">
                    {k.bisaSort ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(k.id)}
                        className="hover:text-text flex items-center gap-1"
                      >
                        {k.label}
                        <IkonSort arah={arahUntuk(k.id)} aria-hidden="true" />
                      </button>
                    ) : (
                      k.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {baris.map((b) => (
                <tr key={b.id} className="border-border border-b last:border-b-0">
                  {/* Sel pertama sebagai header baris — screen reader menyebutnya di tiap sel */}
                  <th scope="row" className="text-text px-3 py-2 font-normal">
                    {b.nama}
                  </th>
                  <td className="text-muted px-3 py-2">{b.email}</td>
                  <td className="text-muted px-3 py-2">{b.peran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        `,
      ),
      code(
        'tsx',
        `
        function ariaSort(id: string): 'ascending' | 'descending' | 'none' {
          if (sort.kolom !== id) return 'none';
          return sort.arah === 'asc' ? 'ascending' : 'descending';
        }
        `,
      ),

      h2('Memisahkan state tabel dari tampilannya'),
      code(
        'tsx',
        `
        // Fungsi murni — bisa diuji tanpa React sama sekali
        export function olahBaris<T>(
          data: T[],
          { cari, sortKolom, sortArah, halaman, perHalaman }: OpsiTabel<T>,
        ) {
          let hasil = data;

          if (cari) {
            const q = cari.toLowerCase();
            hasil = hasil.filter((b) =>
              Object.values(b as object).some((v) => String(v).toLowerCase().includes(q)),
            );
          }

          if (sortKolom) {
            hasil = hasil.toSorted((a, b) => {
              const x = String(a[sortKolom]);
              const y = String(b[sortKolom]);
              return sortArah === 'asc' ? x.localeCompare(y, 'id') : y.localeCompare(x, 'id');
            });
          }

          const total = hasil.length;
          const mulai = (halaman - 1) * perHalaman;

          return { baris: hasil.slice(mulai, mulai + perHalaman), total };
        }
        `,
      ),
      callout(
        'tip',
        'Kenapa `toSorted`, bukan `sort`',
        '`sort` mengubah array aslinya — dan array itu adalah state React. Memutasinya berarti React tidak melihat perubahan referensi, sehingga tampilan tidak diperbarui. `toSorted` mengembalikan array baru.',
      ),

      h2('Paginasi yang mengumumkan dirinya'),
      code(
        'tsx',
        `
        <nav aria-label="Paginasi" className="flex items-center justify-between px-3 py-2">
          <p className="tabular text-muted text-xs" aria-live="polite">
            Menampilkan {mulai + 1}–{Math.min(mulai + perHalaman, total)} dari {total}
          </p>

          <div className="flex gap-1">
            <Button size="sm" disabled={halaman === 1} onClick={() => setHalaman((h) => h - 1)}>
              Sebelumnya
            </Button>
            <Button size="sm" disabled={halaman >= totalHalaman} onClick={() => setHalaman((h) => h + 1)}>
              Berikutnya
            </Button>
          </div>
        </nav>
        `,
      ),

      h2('Empat keadaan — juga di tabel'),
      code(
        'tsx',
        `
        {memuat && <SkeletonBaris jumlah={perHalaman} />}
        {gagal && <BarisError pesan={pesan} onCobaLagi={muatUlang} />}
        {!memuat && !gagal && total === 0 && (
          <tr>
            <td colSpan={kolom.length} className="text-muted px-3 py-8 text-center">
              {cari ? \`Tidak ada hasil untuk "\${cari}".\` : 'Belum ada data.'}
            </td>
          </tr>
        )}
        `,
      ),

      h2('Di layar kecil'),
      ul(
        '**Scroll horizontal di dalam wadahnya** (`scroll-x` + `min-w-*`) — jangan biarkan halaman ikut bergeser.',
        'Atau ubah jadi daftar kartu di bawah `md:` — tiap baris jadi satu kartu dengan label kolom di dalamnya.',
        'Jangan menyembunyikan kolom penting tanpa cara melihatnya kembali.',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Pakai `<table>` asli — `<div>` menghapus navigasi tabel sepenuhnya.',
        '`scope="col"`, `scope="row"`, dan `<caption>` memberi konteks di tiap sel.',
        '`aria-sort` pada header yang bisa diurutkan.',
        'Logika sort/filter/paginasi sebagai fungsi murni yang bisa diuji.',
        '`toSorted`, bukan `sort` — jangan memutasi state.',
        'Tabel juga punya empat keadaan UI.',
      ),
      references(
        {
          label: '<table>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table',
          source: 'MDN',
          note: 'Struktur tabel yang benar beserta `<caption>`, `<thead>`, dan `<tbody>`.',
        },
        {
          label: 'HTML table accessibility',
          href: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility',
          source: 'MDN',
          note: 'Peran `scope` dan `<caption>` — alasan `<div>` bergrid menghapus seluruh navigasi tabel.',
        },
        {
          label: 'aria-sort',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort',
          source: 'MDN',
          note: 'Menandai kolom dan arah pengurutan bagi pengguna yang tidak melihat ikon panah.',
        },
        {
          label: 'Array.prototype.toSorted()',
          href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted',
          source: 'MDN',
          note: 'Pengurutan tanpa memutasi array asli — syarat agar React melihat perubahannya.',
        },
        {
          label: 'Table Pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/table/',
          source: 'W3C ARIA APG',
          note: 'Pola resmi tabel interaktif, termasuk perilaku keyboard yang diharapkan.',
        },
      ),
    ],
  ),

  written(
    'boolean-prop-explosion',
    'Menghindari Ledakan Boolean Props',
    12,
    'Tanda-tanda API komponen mulai rusak — dan empat cara memperbaikinya.',
    [
      terms(
        {
          term: 'ledakan boolean prop',
          meaning:
            'Yang perlu dipahami adalah **cara ia terjadi**: tidak pernah dalam satu keputusan besar. Minggu 1 satu prop, minggu 3 tambah `isError`, minggu 6 tambah `isDismissible`. Setiap langkahnya masuk akal sendiri-sendiri, dan tidak ada satu titik pun yang terasa seperti kesalahan — sampai suatu hari komponennya punya delapan boolean dan tidak ada yang berani menyentuhnya.',
        },
        {
          term: 'ledakan kombinasi',
          meaning:
            'Perhitungan yang membuat masalahnya terlihat: **n prop boolean menghasilkan 2ⁿ kombinasi**. Empat boolean sudah berarti 16, delapan berarti 256. Sebagian besar di antaranya tidak punya arti sama sekali, tapi semuanya **bisa ditulis** tanpa peringatan — dan tidak ada yang pernah mengujinya.',
        },
        {
          term: 'union prop',
          meaning:
            'Cara pertama memperbaikinya: ganti beberapa boolean yang **saling meniadakan** menjadi satu prop bernilai pilihan. `isError`, `isWarning`, `isSuccess` menjadi `nada: "error" | "peringatan" | "sukses"` — dan kombinasi mustahil langsung hilang.',
        },
        {
          term: 'discriminated union',
          meaning:
            'Cara kedua, untuk kasus di mana **prop lain ikut berubah** tergantung pilihannya. Menyatakan bahwa `sebagai: "tautan"` mensyaratkan `href`, sementara `sebagai: "tombol"` mensyaratkan `onClick` — sehingga menulis keduanya sekaligus menjadi error, bukan kebingungan.',
        },
        {
          term: 'composition',
          meaning:
            'Cara ketiga, dan biasanya yang paling ampuh: **oper komponennya, bukan bendera**. `withHeader` dan `headerTitle` digantikan `<Modal.Header>Judul</Modal.Header>`. Kebutuhan baru cukup ditulis sebagai isi, tanpa satu pun prop tambahan.',
        },
        {
          term: 'pecah jadi dua komponen',
          meaning:
            'Cara keempat, yang sering paling jujur. Kalau sebuah prop **mengubah struktur** komponennya secara mendasar, itu tanda bahwa yang kamu punya sebenarnya **dua komponen berbeda** yang dipaksa menjadi satu.',
        },
        {
          term: 'API surface',
          meaning:
            'Terjemahannya **luas permukaan antarmuka**. Seberapa banyak yang harus dipelajari seseorang sebelum bisa memakai komponenmu. Setiap prop menambahnya — dan yang bertambah bukan cuma prop itu, melainkan seluruh **interaksinya** dengan prop yang sudah ada.',
        },
        {
          term: 'tanda peringatan',
          meaning:
            'Empat gejala yang layak dijadikan pemicu untuk berhenti dan merancang ulang: lebih dari **tiga prop boolean**, nama prop yang mengandung "with" atau "show", dokumentasi yang harus menjelaskan **kombinasi mana yang sah**, dan prop yang hanya berarti kalau prop lain bernilai tertentu.',
        },
      ),

      h2('Bagaimana ia terjadi'),
      code(
        'tsx',
        `
        // Minggu 1
        <Alert pesan="…" />

        // Minggu 3
        <Alert pesan="…" isError />

        // Minggu 6
        <Alert pesan="…" isError isDismissible />

        // Bulan 3
        <Alert pesan="…" isError isDismissible isCompact hasIcon isInline showBorder />
        // 6 boolean = 64 kombinasi. Yang masuk akal mungkin sepuluh.
        // isCompact + isInline artinya apa? Tidak ada yang tahu.
        `,
      ),
      p(
        'Tidak ada satu pun langkah di atas yang terasa salah saat dilakukan. Itulah kenapa polanya terus terjadi.',
      ),

      h2('Empat tanda peringatan'),
      ol(
        'Lebih dari **tiga** boolean prop.',
        'Ada kombinasi yang **mustahil** atau tidak berarti.',
        'Nama prop diawali `is`, `has`, atau `show` dan **mengubah tampilan**, bukan keadaan data.',
        'Kamu harus membaca isi komponen untuk tahu apa yang terjadi kalau dua boolean dinyalakan bersamaan.',
      ),

      h2('Perbaikan 1 — union untuk yang saling eksklusif'),
      code(
        'tsx',
        `
        // Sebelum
        <Alert isInfo isError isWarning />       // tiga sekaligus?

        // Sesudah
        type Props = { nada: 'info' | 'gagal' | 'peringatan' };
        <Alert nada="gagal" />
        `,
      ),

      h2('Perbaikan 2 — discriminated union untuk prop yang bergantung'),
      code(
        'tsx',
        `
        // Sebelum: onTutup hanya berarti kalau bisaDitutup true
        type Buruk = { bisaDitutup?: boolean; onTutup?: () => void };

        // Sesudah: keduanya terikat, tidak bisa dipisah
        type Props =
          | { bisaDitutup: true; onTutup: () => void }
          | { bisaDitutup?: false; onTutup?: never };

        <Alert bisaDitutup />                        // Error: onTutup wajib
        <Alert bisaDitutup onTutup={tutup} />        // ok
        <Alert />                                    // ok
        `,
      ),

      h2('Perbaikan 3 — composition untuk bagian opsional'),
      code(
        'tsx',
        `
        // Sebelum
        <Alert pesan="…" hasIcon ikon={<Warning />} adaAksi aksi={<Button />} />

        // Sesudah
        <Alert nada="peringatan">
          <Alert.Ikon><Warning /></Alert.Ikon>
          <Alert.Pesan>…</Alert.Pesan>
          <Alert.Aksi><Button>Coba lagi</Button></Alert.Aksi>
        </Alert>
        `,
      ),

      h2('Perbaikan 4 — pecah jadi dua komponen'),
      code(
        'tsx',
        `
        // Kalau boolean mengubah STRUKTUR, itu dua komponen
        <Modal isDrawer />          // drawer dan modal punya animasi,
                                    // posisi, dan perilaku keyboard berbeda

        <Modal />
        <Drawer />                  // lebih jujur, dan masing-masing lebih sederhana
        `,
      ),

      h2('Boolean yang memang tepat'),
      code(
        'tsx',
        `
        <Button disabled />           // keadaan HTML asli
        <Input required />            // keadaan HTML asli
        <Dialog terbuka />            // keadaan biner yang jelas
        <Accordion tunggal />         // aturan perilaku, bukan tampilan
        `,
      ),
      callout(
        'tip',
        'Ujinya satu kalimat',
        'Apakah prop ini punya **tepat dua keadaan yang jelas dan tidak berhubungan dengan prop lain**? Kalau ya, boolean tepat. Kalau ia salah satu dari beberapa pilihan, atau menghidupkan prop lain — bukan boolean.',
      ),

      h2('Sebelum dan sesudah'),
      compare(
        {
          title: 'Sebelum',
          lang: 'tsx',
          code: `
            <Alert
              pesan="Gagal menyimpan"
              isError
              isDismissible
              onDismiss={x}
              hasIcon
              isCompact
            />
          `,
          notes: ['6 prop, 64 kombinasi', 'Sebagian mustahil'],
        },
        {
          title: 'Sesudah',
          lang: 'tsx',
          code: `
            <Alert nada="gagal" ukuran="padat" onTutup={x}>
              <Alert.Ikon />
              Gagal menyimpan
            </Alert>
          `,
          notes: ['Keadaan mustahil tidak bisa ditulis', 'Struktur terbaca'],
        },
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Lebih dari tiga boolean prop adalah tanda peringatan.',
        'Union untuk pilihan yang saling eksklusif.',
        'Discriminated union untuk prop yang saling bergantung.',
        'Composition untuk bagian opsional; pecah komponen kalau strukturnya berubah.',
        'Boolean tepat untuk keadaan biner yang berdiri sendiri.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dasar composition sebagai pengganti prop boolean yang terus bertambah.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Membuat kombinasi props yang saling bergantung menjadi tidak bisa ditulis.',
        },
        {
          label: 'Everyday Types — Union Types',
          href: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types',
          source: 'TypeScript',
          note: 'Mengganti beberapa boolean yang saling meniadakan dengan satu prop pilihan.',
        },
        {
          label: 'Your First Component',
          href: 'https://react.dev/learn/your-first-component',
          source: 'React',
          note: 'Tanda bahwa sebuah komponen sebenarnya sudah menjadi dua komponen berbeda.',
        },
      ),
    ],
  ),

  written(
    'praktik-design-system',
    'Praktik: Susun mini design system',
    16,
    'Menyatukan komponen bab ini jadi satu set yang konsisten — dan menguji konsistensinya.',
    [
      p(
        'Praktik penutup. Kamu akan merapikan delapan komponen menjadi satu set yang terasa berasal dari sistem yang sama, bukan dari delapan keputusan terpisah.',
      ),

      terms(
        {
          term: 'mini design system',
          meaning:
            'Sekumpulan komponen yang **terasa berasal dari satu sistem**, bukan dari delapan keputusan terpisah. Ukurannya bukan jumlah komponen melainkan **keseragamannya** — dan itulah yang dilatih praktik penutup ini.',
        },
        {
          term: 'kosakata varian',
          meaning:
            'Kesepakatan bahwa **nama yang sama berarti hal yang sama** di seluruh komponen. Kalau `size="sm"` pada Button berarti tinggi 32px, ia harus berarti hal yang sepadan pada Input dan Badge. Ketidakkonsistenan di sini tidak pernah terlihat saat menguji komponen satu per satu.',
        },
        {
          term: 'membatasi pilihan',
          meaning:
            'Keputusan yang terasa berlawanan dengan naluri: **sedikitkan pilihan sejak awal**. Dua ukuran, tiga radius, empat nada. Sistem dengan lima ukuran menghasilkan tampilan yang tidak konsisten justru karena tidak ada yang ingat kapan memakai yang mana.',
        },
        {
          term: 'halaman sandbox',
          meaning:
            'Terjemahan bebasnya **halaman uji coba**. Satu halaman yang menampilkan **seluruh komponen dalam seluruh variannya berdampingan**. Nilainya besar dan sering diremehkan: ketidakkonsistenan yang tidak terlihat saat komponen dilihat satu per satu langsung mencolok saat semuanya bersebelahan.',
        },
        {
          term: 'aturan yang mengikat',
          meaning:
            'Sekumpulan keputusan yang berlaku untuk **semua** komponen tanpa kecuali — cincin fokus yang sama, kosakata prop yang sama, cara menerima `className` yang sama. Inilah yang membuat sekumpulan komponen terasa satu set, bukan sekadar berada di folder yang sama.',
        },
        {
          term: 'dokumentasi "untuk X pakai Y"',
          meaning:
            'Bentuk dokumentasi yang paling berharga dan paling jarang ditulis. Bukan daftar prop — itu sudah dijawab tipe. Yang dibutuhkan pembaca adalah **kapan memilih yang mana**: "untuk aksi merusak pakai `variant=\'bahaya\'`", "untuk kabar yang boleh terlewat pakai Toast".',
        },
        {
          term: 'konsistensi',
          meaning:
            'Nilai yang **mengalahkan preferensi pribadi** dalam sebuah sistem. Komponen yang sedikit kurang ideal tapi seragam dengan tetangganya lebih baik daripada komponen sempurna yang berperilaku berbeda sendiri — karena yang kedua memaksa setiap pemakainya berhenti dan memeriksa.',
        },
        {
          term: 'uji konsistensi',
          meaning:
            'Memeriksa keseragaman dengan sengaja, bukan berharap ia terjadi sendiri. Tiga cara yang dipakai praktik ini: halaman sandbox untuk memeriksa mata, daftar aturan untuk memeriksa kode, dan **menekan Tab dari atas ke bawah** untuk memeriksa perilaku keyboardnya.',
        },
      ),

      h2('1. Token bersama'),
      code(
        'css',
        `
        @theme {
          /* Radius: kecil untuk badge, sedang untuk kontrol, besar untuk panel */
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 14px;

          /* Tinggi kontrol — hanya dua, supaya semua sejajar */
          --size-control-sm: 36px;
          --size-control-md: 44px;

          /* Motion */
          --ease-out-ui: cubic-bezier(0.23, 1, 0.32, 1);
          --duration-fast: 120ms;
          --duration-normal: 180ms;
        }
        `,
      ),
      callout(
        'tip',
        'Batasi jumlah pilihan sejak awal',
        'Dua ukuran kontrol, tiga radius, tiga durasi. Sistem dengan lima ukuran tombol akan selalu punya tombol yang tingginya tidak cocok dengan input di sebelahnya — dan tidak ada yang tahu mana yang benar.',
      ),

      h2('2. Penamaan varian yang konsisten'),
      table(
        ['Dimensi', 'Nilai yang dipakai SEMUA komponen'],
        [
          ['`varian`', '`utama` · `sekunder` · `hantu` · `bahaya`'],
          ['`ukuran`', '`sm` · `md`'],
          ['`nada`', '`info` · `sukses` · `peringatan` · `gagal`'],
        ],
      ),
      code(
        'tsx',
        `
        // SALAH: setiap komponen memakai kosakatanya sendiri
        <Button variant="primary" />
        <Badge type="main" />
        <Alert severity="danger" />

        // BENAR: satu kosakata di seluruh sistem
        <Button varian="utama" />
        <Badge varian="utama" />
        <Alert nada="gagal" />
        `,
      ),

      h2('3. Struktur berkas'),
      code(
        'text',
        `
        src/components/ui/
        ├── button.tsx
        ├── field.tsx
        ├── card.tsx
        ├── dialog.tsx
        ├── tabs.tsx
        ├── accordion.tsx
        ├── toast.tsx
        ├── table.tsx
        ├── skeleton.tsx
        └── index.ts        # re-export
        `,
      ),
      callout(
        'warning',
        'Berkas indeks tidak gratis',
        'Ia merapikan impor, tapi bisa menarik seluruh isi folder ke bundle meski kamu hanya memakai satu komponen. Untuk folder `ui/` yang komponennya kecil dan sering dipakai bersama, ini dapat diterima. Untuk folder besar, impor langsung.',
      ),

      h2('4. Aturan yang mengikat seluruh set'),
      ol(
        '**Semua komponen meneruskan props sisa** dan `className`.',
        '**Semua yang bisa difokus punya `focus-visible:ring`** yang sama persis.',
        '**Tidak ada nilai warna atau spacing mentah** — hanya token.',
        '**Tidak ada boolean prop yang mengubah tampilan** — pakai `varian`/`ukuran`.',
        '**Semua ikon `aria-hidden`**, dan tombol berikon punya `sr-only`.',
        '**Semua transisi memakai token durasi**, tidak ada `transition-all`.',
      ),

      h2('5. Dokumentasi minimum per komponen'),
      code(
        'tsx',
        `
        /**
         * Tombol aksi. Untuk navigasi pakai \`ButtonLink\` — navigasi harus berupa <a>.
         *
         * @example
         * <Button varian="utama" onClick={simpan}>Simpan</Button>
         * <Button varian="bahaya" memuat={sedangHapus}>Hapus</Button>
         */
        `,
      ),
      p(
        'Satu paragraf plus dua contoh sudah cukup. Yang paling berharga justru kalimat "untuk X pakai Y" — ia mencegah pemakaian yang salah sebelum terjadi.',
      ),

      h2('6. Menguji konsistensi'),
      code(
        'tsx',
        `
        // Halaman uji berisi SEMUA komponen dan SEMUA variannya berdampingan
        export function Sandbox() {
          return (
            <div className="space-y-8 p-8">
              <section className="flex flex-wrap items-center gap-2">
                {(['utama', 'sekunder', 'hantu', 'bahaya'] as const).map((v) => (
                  <Button key={v} varian={v}>{v}</Button>
                ))}
              </section>

              <section className="flex items-center gap-2">
                <Button ukuran="sm">Kecil</Button>
                <Field label="Sejajar?" className="w-40" />
                <Badge>Badge</Badge>
              </section>
            </div>
          );
        }
        `,
      ),
      callout(
        'tip',
        'Meletakkan semuanya berdampingan membongkar ketidakkonsistenan seketika',
        'Tombol setinggi 42px di sebelah input setinggi 44px terlihat "agak salah" tapi sulit ditunjuk — sampai keduanya diletakkan bersebelahan. Halaman sandbox seperti ini adalah alat paling murah untuk menjaga sistem tetap rapat.',
      ),

      checklist(
        'frontend-intermediate/pembuatan-komponen-react/praktik',
        'Checklist praktik 3.11',
        'Delapan komponen memakai kosakata varian yang sama',
        'Semua meneruskan props sisa dan `className`',
        'Semua elemen yang bisa difokus punya focus ring yang identik',
        'Tidak ada nilai warna atau spacing mentah di komponen mana pun',
        'Tidak ada boolean prop yang mengubah tampilan',
        'Tombol berikon punya `sr-only`; semua ikon `aria-hidden`',
        'Dialog: `Esc` menutup dan fokus kembali ke pemicu',
        'Tabs: panah kiri/kanan berpindah, hanya tab aktif yang bisa di-Tab',
        'Toast: `role="alert"` untuk gagal, wadah `aria-live` ada sejak awal',
        'Tabel memakai `<table>` asli dengan `scope` dan `<caption>`',
        'Halaman sandbox dibuat, dan tinggi kontrol benar-benar sejajar',
        'Seluruh set diuji dengan keyboard saja, tanpa menyentuh mouse',
      ),

      divider,
      h2('Rangkuman'),
      ul(
        'Batasi jumlah pilihan token sejak awal — dua ukuran, tiga radius.',
        'Satu kosakata varian untuk seluruh sistem.',
        'Enam aturan yang mengikat semua komponen membuatnya terasa satu set.',
        'Kalimat "untuk X pakai Y" adalah dokumentasi paling berharga.',
        'Halaman sandbox membongkar ketidakkonsistenan yang tidak terlihat satu per satu.',
      ),
      references(
        {
          label: 'Theme variables',
          href: 'https://tailwindcss.com/docs/theme',
          source: 'Tailwind CSS',
          note: 'Mengunci token bersama sebagai langkah pertama menyusun satu set komponen.',
        },
        {
          label: 'ARIA Authoring Practices Guide',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/',
          source: 'W3C ARIA APG',
          note: 'Daftar pola resmi untuk seluruh komponen di bab ini — acuan saat memeriksa konsistensi perilaku.',
        },
        {
          label: 'Keyboard — WCAG 2.1.1',
          href: 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html',
          source: 'W3C WCAG',
          note: 'Dasar uji "tekan Tab dari atas ke bawah" yang menutup praktik ini.',
        },
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Kosakata prop yang seragam — inti dari apa yang membuat komponen terasa satu set.',
        },
      ),
    ],
  ),
];
