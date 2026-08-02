import {
  callout,
  checklist,
  code,
  compare,
  divider,
  h2,
  ol,
  p,
  table,
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
    ],
  ),

  written(
    'studi-button',
    'Studi Kasus: `Button`',
    13,
    'Komponen paling sering ditulis ulang, dan paling sering salah dirancang.',
    [
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
    ],
  ),

  written(
    'studi-card-skeleton',
    'Studi Kasus: `Card` & `Skeleton`',
    11,
    'Wadah konten yang fleksibel, dan placeholder yang tidak membuat layout melompat.',
    [
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
    ],
  ),

  written(
    'studi-tabs',
    'Studi Kasus: `Tabs` sebagai compound component',
    14,
    'Beberapa komponen yang berbagi state lewat context — dan pola keyboard ARIA yang menyertainya.',
    [
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
    ],
  ),

  written(
    'studi-accordion',
    'Studi Kasus: `Accordion`',
    12,
    'Buka-tutup konten dengan semantik yang benar — dan kapan HTML bawaan sudah cukup.',
    [
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
    ],
  ),

  written(
    'studi-toast',
    'Studi Kasus: `Toast`',
    13,
    'Notifikasi sementara yang tetap terbaca teknologi bantu — dan tidak menghilang terlalu cepat.',
    [
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
    ],
  ),

  written(
    'studi-data-table',
    'Studi Kasus: Data Table',
    15,
    'Tabel dengan sort, filter, dan paginasi — dan kenapa `<table>` asli tetap penting.',
    [
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
    ],
  ),

  written(
    'boolean-prop-explosion',
    'Menghindari Ledakan Boolean Props',
    12,
    'Tanda-tanda API komponen mulai rusak — dan empat cara memperbaikinya.',
    [
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
    ],
  ),
];
