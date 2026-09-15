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
    22,
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
      p(
        "Tiga bagian kecil di sini mengerjakan hampir seluruh pekerjaannya. `ComponentProps<'button'>` mewarisi **seluruh** prop `<button>` bawaan, mulai dari `type`, `disabled`, semua handler, sampai semua atribut ARIA, sehingga kelima prop di baris pemakaian bekerja tanpa satu pun ditulis di tipenya. Rest `...sisa` meneruskan semuanya ke elemen aslinya, jadi komponen ini tidak pernah menjadi penghalang seperti diperingatkan di kotak berikut. Dan `className` sengaja **dikeluarkan dari `...sisa`** lalu digabung lewat `cn(KELAS[varian], className)`. Kalau ia ikut tersebar, `className` dari pemanggil akan menimpa kelas varian sepenuhnya alih-alih menambahinya. Pola tiga langkah ini, yaitu warisi, keluarkan yang perlu digabung, lalu teruskan sisanya, berlaku untuk hampir semua komponen pembungkus elemen HTML.",
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
      p(
        'Petunjuk paling jelas ada di propsnya, sebab `produk` dan `artikel` **tidak pernah dipakai bersamaan**. Prop yang saling meniadakan seperti itu berarti tipenya harus dibuat opsional, sehingga TypeScript tidak bisa lagi menjamin salah satunya ada, dan di dalam komponen tiap pemakaian data harus dijaga percabangan `tipe`. Memecahnya menjadi dua komponen membuat masing-masing punya satu prop yang **wajib**, satu bentuk data yang pasti, dan tidak satu pun percabangan. Perhatikan ini kelanjutan dari tanda ketiga di daftar sebelumnya, sebab prop bernama `tipe` yang mengubah **struktur** dan bukan sekadar warna atau ukuran hampir selalu penanda dua komponen yang menyamar jadi satu.',
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
      p(
        'Perhatikan `terkendali = terbuka !== undefined`, karena inilah yang menentukan mode mana yang aktif. Kalau pemanggil mengoper prop `terbuka`, komponen memakainya sebagai satu-satunya source of truth dan mengabaikan `internal`, sedangkan kalau tidak, ia jatuh kembali ke state internalnya sendiri. Fungsi `ubah` memanggil `setInternal` **hanya** saat mode uncontrolled, tetapi selalu memanggil `onUbah` di kedua mode, sehingga pemanggil yang memang ingin tahu perubahannya tetap mendapat kabar, tanpa peduli siapa yang sedang memegang datanya.',
      ),
      callout(
        'tip',
        'Mulai dari uncontrolled',
        'Sebagian besar pemakaian tidak butuh kendali dari luar. Tambahkan mode controlled saat ada kebutuhan nyata — misalnya menutup semua accordion dari tombol di luar.',
      ),

      h2('Di mana state seharusnya berada'),
      ul(
        '**Di dalam komponen** kalau tidak ada yang lain peduli (accordion terbuka/tertutup).',
        '**Di induk terdekat** kalau dua sibling component membutuhkannya.',
        '**Di URL** kalau harus bisa dibagikan lewat tautan (filter, halaman, tab aktif).',
        '**Di cache server** kalau source of truth-nya di server.',
      ),
      p(
        'Kesalahan paling umum: menaikkan state terlalu tinggi "untuk jaga-jaga". Itu membuat seluruh cabang re-render untuk perubahan yang hanya dipedulikan satu komponen.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tim memutuskan membuat pustaka komponen internal. Enam bulan kemudian ada empat komponen kartu yang berbeda, tiga tombol, dan dua kotak input, semuanya karena orang tidak menemukan yang sudah ada atau menemukannya lalu merasa tidak cocok. Yang membedakan pustaka yang dipakai dari pustaka yang diabaikan bukan kelengkapannya melainkan apakah orang bisa memakainya tanpa membaca kodenya.',
      ),
      p(
        'Sebuah komponen yang layak dipakai ulang punya empat bagian yang bisa diperiksa satu per satu, dan bagian keempat adalah yang paling sering hilang.',
      ),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ReactNode } from 'react';

        // 1. KONTRAK — apa yang diterima, dan mana yang wajib.
        type KartuProps = ComponentPropsWithoutRef<'article'> & {
          judul: ReactNode;                        // wajib, dan boleh berupa elemen
          aksi?: ReactNode;                        // slot opsional di kanan atas
          padat?: boolean;
        };

        // 2. BAWAAN — nilai yang masuk akal supaya pemakaian termudah tetap pendek.
        export function Kartu({
          judul,
          aksi,
          padat = false,
          className = '',
          children,
          ...sisa
        }: KartuProps) {
          // 3. STRUKTUR — semantik HTML yang benar, bukan div bertumpuk.
          return (
            <article
              {...sisa}
              className={['kartu', padat ? 'kartu-padat' : '', className]
                .filter(Boolean)
                .join(' ')}
            >
              <header className="kartu-kepala">
                <h3 className="kartu-judul">{judul}</h3>
                {aksi ? <div className="kartu-aksi">{aksi}</div> : null}
              </header>
              <div className="kartu-isi">{children}</div>
            </article>
          );
        }

        // 4. JALAN KELUAR — pemakai bisa menembus tanpa mengubah komponennya.
        //    Di sini: {...sisa} meneruskan seluruh atribut article,
        //    dan className digabung bukan ditimpa.
        `,
        { filename: 'src/ui/Kartu.tsx' },
      ),
      p(
        'Bagian keempat itu yang menentukan apakah komponenmu akan dipakai atau disalin. Selalu ada satu kebutuhan yang tidak kamu duga, misalnya seseorang butuh `id` untuk menautkan, atau `data-testid` untuk pengujian, atau satu kelas tambahan untuk jarak. Tanpa jalan keluar, ia akan menyalin komponenmu dan mengubah salinannya, dan sejak itu ada dua kartu yang harus dirawat.',
      ),
      p(
        'Perhatikan `judul` bertipe `ReactNode`, bukan `string`. Ini keputusan kecil yang berdampak besar. Dengan `string`, seseorang yang butuh judul berisi ikon atau lencana harus menyalin komponennya. Dengan `ReactNode`, ia cukup mengirim elemen. Biayanya nol, dan ia menutup satu alasan menyalin.',
      ),
      p(
        'Penggabungan `className` di baris tengah juga bagian dari jalan keluar. Urutannya menentukan, yaitu kelas dari pemanggil ditaruh terakhir supaya ia bisa menimpa saat memang diinginkan. Sebaliknya `{...sisa}` ditaruh sebelum `className` supaya nilai yang kamu susun tidak tertimpa oleh `className` mentah dari `sisa`, dan itu jebakan yang sudah dibahas di bab sebelumnya.',
      ),
      code(
        'text',
        `
        Empat pertanyaan untuk memeriksa sebuah komponen sebelum dipakai bersama:

        1. Bisakah dipakai tanpa membaca kodenya, hanya dari tipe propsnya?
        2. Apakah pemakaian paling umum cukup satu atau dua prop?
        3. Apakah struktur HTML-nya semantik, atau hanya div bertumpuk?
        4. Kalau ada kebutuhan yang tidak terduga, adakah jalan keluarnya?

        Yang keempat paling sering hilang, dan itu yang membuat orang menyalin.
        `,
        { caption: 'Daftar periksa yang bisa dipakai saat meninjau komponen orang lain.' },
      ),
      callout(
        'tip',
        'Tulis pemakaiannya lebih dulu, baru komponennya',
        'Sebelum menulis satu baris implementasi, tulis dulu bagaimana komponen ini akan dipanggil di tiga tempat yang berbeda. Kalau salah satunya terasa berbelit, ubah bentuk propsnya sebelum ada yang memakainya. Mengubah kontrak komponen yang sudah dipakai di dua puluh tempat jauh lebih mahal.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan `tsc` dan tipe React 19 asli, dan seluruhnya menandai kontrak yang bocor.',
      ),
      code(
        'text',
        `
        type Props = { children: JSX.Element };

        error TS2503: Cannot find namespace 'JSX'.
        `,
        { caption: 'Diuji dengan tipe React 19. Namespace global `JSX` sudah tidak ada.' },
      ),
      p(
        'Ini perubahan pada React 19 yang sering menyandung saat memutakhirkan. Namespace `JSX` yang dulu global kini berada di dalam `React`, sehingga bentuk lamanya tidak dikenali lagi. Untuk `children`, jawabannya tetap sama seperti sebelumnya, yaitu pakai `ReactNode` yang diimpor dari `react`. Kalau kamu memang butuh tipe satu elemen, pakai `ReactElement`.',
      ),
      code(
        'text',
        `
        <Kartu judul="Ringkasan" className="mt-4" />

        // Hasil: <article class="mt-4">
        // Seluruh kelas kartu hilang.
        `,
        { caption: '`className` dari pemanggil menimpa yang disusun komponen.' },
      ),
      p(
        'Ini terjadi saat `className` dibiarkan berada di dalam `{...sisa}` yang ditulis setelah `className` milik komponen. Tidak ada error, dan gejalanya berupa komponen yang kehilangan seluruh gayanya begitu pemanggil menambahkan satu kelas untuk jarak. Bongkar `className` keluar dari `sisa` lalu gabungkan, seperti pada studi kasus.',
      ),
      code(
        'text',
        `
        <Kartu judul="x" onKlik={() => {}} />

        error TS2322: Property 'onKlik' does not exist on type 'KartuProps'.
        `,
        { caption: 'Prop asing ditolak, dan itu menangkap salah ketik.' },
      ),
      p(
        'Penolakan prop asing sangat berguna sebab ia menangkap nama yang salah ketik sebelum dijalankan. Yang perlu diketahui, pemeriksaan ini hanya berlaku untuk object literal yang ditulis langsung. Menyebarkan object variabel dengan spread melewatinya, sehingga `<Kartu {...data} />` bisa membawa field asing yang lalu ikut menjadi atribut HTML tidak dikenal.',
      ),
      code(
        'text',
        `
        <Kartu judul="x" data-produk-id={7} />

        // Lolos, dan menjadi atribut di DOM. Ini memang diinginkan.
        // Tapi prop khusus komponen yang lolos ke DOM tidak:
        // <article padat="true"> muncul di DOM kalau 'padat' lupa dibongkar.
        `,
        { caption: 'Prop khusus komponen yang lupa dibongkar ikut menjadi atribut HTML.' },
      ),
      p(
        'Kalau `padat` tidak dibongkar keluar dan ikut masuk ke `{...sisa}`, React akan mencoba menaruhnya sebagai atribut HTML. Untuk nama yang tidak dikenal, React meneruskannya apa adanya sehingga muncul atribut aneh di DOM. Gejalanya biasanya berupa peringatan di console pada versi lama, dan pada React modern ia hanya ikut terpasang diam-diam. Selalu bongkar seluruh prop khusus komponen sebelum menyebar sisanya.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Cannot find namespace 'JSX'`",
            'Namespace global `JSX` dihapus di React 19',
            'Pakai `ReactNode` dari `react`, atau `React.JSX.Element`',
          ],
          [
            'Gaya komponen hilang saat pemanggil memberi `className`',
            'Urutan spread membuat nilai pemanggil menimpa',
            'Bongkar `className` keluar lalu gabungkan, dan taruh milik pemanggil terakhir',
          ],
          [
            "`Property 'x' does not exist on type`",
            'Prop asing, sering karena salah ketik',
            'Periksa ejaannya, atau tambahkan ke tipe props',
          ],
          [
            'Atribut aneh muncul di DOM',
            'Prop khusus komponen ikut disebar ke elemen',
            'Bongkar seluruh prop khusus sebelum `{...sisa}`',
          ],
          [
            'Orang menyalin komponenmu alih-alih memakainya',
            'Tidak ada jalan keluar untuk kebutuhan yang tidak terduga',
            'Warisi atribut elemennya, dan gabungkan `className`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Komponen yang dipakai bersama punya biaya perubahan yang jauh lebih tinggi daripada komponen sekali pakai, dan sebagian besar kesalahan di bawah baru terasa setelah ada sepuluh pemakai.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat komponen bersama dari satu contoh pemakaian',
            'Nanti tinggal ditambah',
            'Bentuknya hampir selalu salah sebab kamu menebak apa yang akan berbeda. Tulis dua yang konkret dulu',
          ],
          [
            'Tidak menyediakan jalan keluar',
            'Supaya pemakaiannya seragam',
            'Selalu ada satu kebutuhan yang tidak terduga, dan tanpa jalan keluar orang akan menyalin komponenmu',
          ],
          [
            'Mengetik prop teks sebagai `string`',
            'Isinya kan teks',
            'Yang butuh ikon atau lencana di dalamnya harus menyalin. `ReactNode` menutup itu tanpa biaya',
          ],
          [
            'Membungkus segalanya dengan `div`',
            'Yang penting tampilannya benar',
            'Pembaca layar kehilangan struktur halaman. Pakai `article`, `section`, `header`, dan `nav` sesuai maknanya',
          ],
          [
            'Menaruh nilai warna dan jarak langsung di komponen',
            'Supaya tampilannya pasti',
            'Komponen menjadi terikat pada satu tema. Pakai token, dan biarkan pemakainya menyesuaikan lewat kelas',
          ],
          [
            'Menambahkan prop baru tiap ada permintaan',
            'Satu prop untuk satu kebutuhan',
            'Komponen tumbuh menjadi puluhan prop yang tidak pernah dipakai bersamaan. Pertimbangkan komposisi',
          ],
        ],
      ),
      p(
        'Baris kedua adalah pembeda antara pustaka komponen yang hidup dan yang mati. Komponen tanpa jalan keluar memaksa setiap kebutuhan baru melewati pemiliknya, dan pada tim yang sibuk itu berarti orang memilih menyalin. Meneruskan atribut elemen dengan `ComponentPropsWithoutRef` dan menggabungkan `className` adalah dua baris yang menutup sebagian besar alasan menyalin.',
      ),
      callout(
        'info',
        'Komponen bersama adalah kontrak, dan kontrak sulit diubah',
        'Begitu sebuah komponen dipakai di dua puluh tempat, mengubah nama prop berarti menyunting dua puluh berkas. Karena itu bentuk propsnya layak dipikirkan lebih lama daripada isinya. Isi komponen bisa ditulis ulang kapan saja tanpa mengganggu siapa pun, dan kontraknya tidak.',
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
    23,
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
            'Prop ukuran yang juga sebaiknya berupa pilihan terbatas seperti `"sm" | "md" | "lg"`, bukan angka bebas. Alasannya sama dengan skala spacing di Bab 1, sebab membatasi pilihan **menjaga konsistensi tanpa perlu disiplin siapa pun**.',
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
      p(
        'Dua komentar itu sudah memuat seluruh diagnosisnya, tapi perhatikan **kenapa** bentuk ini begitu mudah tumbuh, sebab tiap boolean masuk akal saat ditambahkan sendiri-sendiri. Yang tidak terlihat adalah kombinasinya. `isPrimary` dan `isDanger` sama-sama menentukan warna, jadi keduanya sekaligus tidak punya arti, tetapi tipe boolean tidak bisa menyatakan "pilih salah satu". Akibatnya komponen harus memutuskan sendiri mana yang menang, biasanya lewat urutan `if` yang tidak pernah didokumentasikan. Pola yang bisa dikenali adalah **boolean yang saling meniadakan sebenarnya satu prop bernilai pilihan**, dan itulah yang dikerjakan bentuk berikutnya.',
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
      p(
        'Perhatikan bagaimana `cva` menggantikan seluruh kombinasi boolean yang mustahil di atas. `varian` dan `ukuran` masing-masing hanya menerima satu nilai dari daftar terbatas, sehingga `isPrimary isDanger` yang tidak bermakna sekarang tidak bisa ditulis sama sekali, karena TypeScript menolaknya lewat `VariantProps<typeof gaya>`. `gaya({ varian, ukuran, lebarPenuh })` menghasilkan string class yang sesuai kombinasi yang dipilih, lalu `cn(...)` menggabungkannya dengan `className` dari pemanggil. Perhatikan juga `disabled={disabled || memuat}`, sebab tombol otomatis nonaktif saat sedang memuat, tanpa pemanggil perlu mengingat untuk menonaktifkannya sendiri setiap kali memakai prop `memuat`.',
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
      p(
        'Satu baris ini menutup bug yang muncul di hampir setiap aplikasi. Default `type` sebuah `<button>` di HTML adalah **`submit`** dan bukan `button`, jadi tombol apa pun di dalam `<form>` yang lupa menyebut tipenya akan mengirim form saat diklik, termasuk tombol "Hapus baris" atau "Tambah field". Gejalanya membingungkan karena halaman ikut dimuat ulang tanpa ada yang menyentuh tombol kirim. Dengan `type = \'button\'` sebagai nilai bawaan parameter, komponenmu membalik default itu ke pilihan yang aman, sementara pemanggil yang memang butuh tombol kirim tetap bisa menulis `type="submit"` secara eksplisit, dan keharusan menulisnya justru membuat maksudnya terbaca.',
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
      p(
        'Perhatikan `ButtonLink` memakai **fungsi `gaya` yang sama persis** dengan `Button`, hanya menempelkannya ke `<Link>` alih-alih `<button>`. Itu yang membuat keduanya terlihat identik tanpa satu baris CSS pun diduplikasi, sekaligus menjadi alasan `cva` dipisah sebagai konstanta alih-alih ditulis di dalam komponen. Yang berbeda hanyalah **elemen yang dihasilkan**, dan justru itu inti sub-babnya, karena tampilan boleh sama tetapi semantiknya tidak boleh dipaksakan. Perhatikan juga `ukuran` dan `varian` tetap diteruskan sementara prop khusus tombol seperti `memuat` tidak ada di sini, sebab tautan tidak punya keadaan memuat, dan menyediakannya hanya akan mengundang pemakaian yang keliru.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tombol Simpan pada formulir panjang harus mati selama permintaan berjalan, menampilkan indikator, tetap bisa difokus keyboard, dan mengumumkan perubahannya ke pembaca layar. Versi pertama memakai `div` dengan penangan klik supaya tampilannya bebas diatur. Pengguna keyboard melaporkan tombolnya tidak bisa ditekan sama sekali, dan pengguna pembaca layar tidak mendengar apa pun saat menekannya.',
      ),
      p('Berikut buktinya, diukur di Chromium sungguhan.'),
      code(
        'text',
        `
        <div id="divtombol" onclick="...">Tombol palsu</div>

        div tabIndex bawaan          :: -1
        div bisa difokus?            :: false
        `,
        { caption: 'Elemen `div` tidak bisa difokus, dan Enter tidak memicu apa pun.' },
      ),
      p(
        'Nilai `tabIndex` bernilai minus satu berarti elemen itu tidak ikut dalam urutan Tab, dan pemanggilan `focus()` pun tidak berhasil. Akibatnya pengguna yang tidak memakai tetikus tidak punya cara mencapai tombol itu. Membangunnya kembali menuntut `tabIndex={0}`, penangan `onKeyDown` untuk Enter dan spasi, `role="button"`, dan penanganan keadaan mati. Elemen `button` memberi keempatnya gratis.',
      ),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ReactNode } from 'react';

        type TombolProps = ComponentPropsWithoutRef<'button'> & {
          varian?: 'utama' | 'sekunder' | 'bahaya' | 'hantu';
          ukuran?: 'kecil' | 'sedang' | 'besar';
          memuat?: boolean;
          ikonKiri?: ReactNode;
        };

        export function Tombol({
          varian = 'utama',
          ukuran = 'sedang',
          memuat = false,
          ikonKiri,
          type = 'button',              // bawaan aman, bisa ditimpa jadi 'submit'
          disabled,
          className = '',
          children,
          ...sisa
        }: TombolProps) {
          const mati = memuat || disabled;

          return (
            <button
              type={type}
              {...sisa}
              disabled={mati}
              aria-busy={memuat || undefined}
              className={['tombol', \`tombol-\${varian}\`, \`tombol-\${ukuran}\`, className]
                .filter(Boolean)
                .join(' ')}
            >
              {memuat ? <Spinner aria-hidden="true" /> : ikonKiri}
              <span>{children}</span>
            </button>
          );
        }
        `,
        { filename: 'src/ui/Tombol.tsx' },
      ),
      p(
        'Atribut `type = \'button\'` sebagai bawaan menutup bug yang sangat sering. Tombol di dalam `form` bertipe `submit` secara bawaan menurut HTML, sehingga tombol Batal atau Tambah Baris akan mengirim formulirnya. Menjadikan `button` sebagai bawaan membalik itu, dan pemanggil yang memang ingin mengirim cukup menulis `type="submit"`. Perhatikan ia ditulis **sebelum** `{...sisa}` supaya bisa ditimpa.',
      ),
      p(
        'Sebaliknya `disabled` ditulis **setelah** spread, dan itu juga disengaja. Nilainya menggabungkan `memuat` dan `disabled` dari pemanggil, sehingga tombol tetap mati saat sedang memuat walaupun pemanggil tidak menyetel `disabled`. Kalau ia ditulis sebelum spread, `disabled` mentah dari `sisa` akan menimpanya dan tombolnya bisa diklik saat sedang mengirim.',
      ),
      p(
        'Spinner diberi `aria-hidden` sebab ia hiasan, dan yang mengumumkan keadaan sibuk adalah `aria-busy` pada tombolnya. Tanpa itu, pembaca layar akan membacakan sesuatu tentang gambar yang tidak berarti sekaligus tidak memberi tahu bahwa tombolnya sedang bekerja. Teks tombol sengaja tidak diganti menjadi Memuat, sebab mengganti nama aksesibel sebuah tombol di tengah interaksi membingungkan.',
      ),
      callout(
        'danger',
        'Tombol yang mati tidak bisa difokus, dan itu punya konsekuensi',
        'Elemen `button` yang `disabled` dikeluarkan dari urutan Tab, sehingga pengguna keyboard tidak bisa mencapainya untuk mengetahui kenapa ia mati. Untuk tombol yang mati karena syarat yang bisa dipenuhi pengguna, pertimbangkan membiarkannya aktif lalu menampilkan pesan saat ditekan, atau tambahkan `aria-describedby` yang menjelaskan syaratnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada komponen tombol, dan dua di antaranya hanya terlihat oleh pengguna keyboard.',
      ),
      code(
        'text',
        `
        <div onClick={simpan}>Simpan</div>

        div tabIndex bawaan :: -1
        div bisa difokus?   :: false
        `,
        { caption: 'Diukur di Chromium. Pengguna keyboard tidak punya cara mencapainya.' },
      ),
      p(
        'Tidak ada error dan tidak ada peringatan dari React. Plugin lint aksesibilitas menandainya dengan aturan `no-noninteractive-element-interactions`, dan itu satu-satunya tanda otomatis yang akan kamu dapat. Cara memeriksanya tanpa alat, tekan Tab berulang di halamanmu dan lihat apakah seluruh yang bisa diklik ikut terlewati.',
      ),
      code(
        'text',
        `
        <button><svg width="10" height="10"><rect /></svg></button>

        nama aksesibel tombol ikon :: "" (kosong)
        `,
        { caption: 'Diukur di Chromium. Tombol tanpa teks tidak punya nama.' },
      ),
      p(
        'Pembaca layar akan mengumumkannya sebagai tombol tanpa nama, dan pengguna tidak punya cara tahu apa fungsinya. Ini sangat sering pada tombol ikon seperti tutup, hapus, dan menu. Perbaikannya menambahkan `aria-label` pada tombolnya, atau menyertakan teks yang disembunyikan secara visual. Yang tidak cukup adalah `title`, sebab ia tidak selalu dibacakan dan tidak muncul di perangkat sentuh.',
      ),
      code(
        'text',
        `
        <form onSubmit={kirim}>
          <button onClick={tambahBaris}>Tambah baris</button>
        </form>

        // Mengklik "Tambah baris" MENGIRIM formulirnya.
        `,
        { caption: 'Tombol di dalam formulir bertipe `submit` secara bawaan.' },
      ),
      p(
        'Ini aturan HTML, bukan React, dan ia mengejutkan hampir semua orang sekali. Gejalanya berupa halaman yang memuat ulang atau formulir yang terkirim sebelum waktunya. Perbaikannya `type="button"` pada tombol yang bukan pengirim, dan menjadikannya bawaan di komponen tombolmu menutup seluruh kelas bug ini untuk seluruh aplikasi.',
      ),
      code(
        'text',
        `
        <Tombol memuat disabled={false}>Simpan</Tombol>

        // Kalau 'disabled' ditulis SEBELUM spread:
        // tombol tetap bisa diklik saat sedang memuat.
        `,
        { caption: 'Urutan spread menentukan siapa yang menang.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa pengiriman ganda saat jaringan lambat. Aturan yang bisa dipegang, taruh **sebelum** spread untuk nilai yang boleh ditimpa pemanggil, dan **setelah** spread untuk nilai yang komponenmu harus tentukan sendiri. Keadaan mati saat sedang memuat termasuk yang kedua.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Tombol tidak bisa dicapai dengan Tab',
            'Dibuat dari `div`, bukan `button`',
            'Pakai `button` lalu atur gayanya',
          ],
          [
            'Pembaca layar menyebut tombol tanpa nama',
            'Isinya hanya ikon',
            'Tambahkan `aria-label`, atau teks yang disembunyikan secara visual',
          ],
          [
            'Formulir terkirim saat tombol lain diklik',
            'Tombol di dalam `form` bertipe `submit` secara bawaan',
            'Jadikan `type="button"` sebagai bawaan komponenmu',
          ],
          [
            'Tombol bisa diklik saat sedang memuat',
            '`disabled` ditulis sebelum spread',
            'Taruh setelah spread, dan gabungkan dengan keadaan memuat',
          ],
          [
            'Pengguna tidak tahu kenapa tombol mati',
            'Tombol `disabled` tidak bisa difokus',
            'Tambahkan penjelasan, atau biarkan aktif lalu tampilkan pesan saat ditekan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Tombol adalah komponen yang paling banyak dipakai dan paling sering dibangun ulang dengan cara yang menghilangkan perilaku bawaannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai `div` atau `span` sebagai tombol',
            'Tampilannya lebih bebas diatur',
            'Kehilangan fokus keyboard, Enter dan spasi, serta pengumuman pembaca layar. Semuanya harus dibangun ulang dan hampir selalu ada yang terlewat',
          ],
          [
            'Tombol ikon tanpa nama aksesibel',
            'Ikonnya jelas maksudnya',
            'Hanya jelas bagi yang melihatnya. Pembaca layar mengumumkannya sebagai tombol tanpa nama',
          ],
          [
            'Melupakan `type="button"`',
            'Tombolnya kan bukan pengirim',
            'HTML menjadikan `submit` sebagai bawaan di dalam `form`. Jadikan `button` bawaan komponenmu',
          ],
          [
            'Mengganti teks tombol menjadi Memuat saat mengirim',
            'Supaya jelas sedang bekerja',
            'Nama aksesibel tombol berubah di tengah interaksi dan membingungkan. Pakai `aria-busy` dan spinner di sampingnya',
          ],
          [
            'Menambah boolean untuk tiap varian tampilan',
            'Satu prop satu kebutuhan',
            'Kombinasi yang tidak masuk akal menjadi mungkin. Pakai union, dan ini dibahas di Sub-bab 3.10',
          ],
          [
            'Menghapus indikator fokus karena dianggap jelek',
            'Garis biru mengganggu desain',
            'Pengguna keyboard kehilangan satu-satunya petunjuk posisi mereka. Ganti gayanya, jangan hilangkan',
          ],
        ],
      ),
      p(
        'Baris terakhir adalah pelanggaran aksesibilitas yang paling sering dilakukan atas nama desain. Aturan `outline: none` tanpa pengganti membuat pengguna keyboard benar-benar tidak tahu di mana fokus berada. Kalau garis bawaannya tidak cocok, ganti dengan gaya lain yang tetap terlihat jelas, misalnya cincin berwarna kontras. Pemilih `:focus-visible` bahkan membuatnya hanya muncul untuk pengguna keyboard, sehingga pengguna tetikus tidak melihatnya sama sekali.',
      ),
      callout(
        'tip',
        'Uji tiga menit yang menemukan sebagian besar masalah tombol',
        'Tekan Tab dari awal halaman dan pastikan seluruh yang bisa diklik ikut terkena giliran. Tekan Enter dan spasi pada tiap tombol dan pastikan keduanya bekerja. Perbesar halaman sampai dua ratus persen dan pastikan tombolnya masih terbaca. Ketiganya tidak butuh alat apa pun dan menemukan lebih banyak masalah daripada yang diduga.',
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
    23,
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
      p(
        'Baris `dijelaskanOleh` layak dibongkar karena bentuknya padat. `[petunjuk && petunjukId, error && errorId]` menghasilkan array berisi `id` yang **benar-benar ada**, sebab kalau `petunjuk` kosong, elemen pertamanya `false` dan bukan string. `.filter(Boolean)` membuang elemen `false` itu, menyisakan hanya `id` yang valid. `.join(\' \')` menyatukannya jadi satu string dipisah spasi, yaitu format yang memang diharapkan `aria-describedby` saat menunjuk lebih dari satu elemen sekaligus. Baris `|| undefined` di akhir menangani kasus kedua-duanya kosong. `join` pada array kosong menghasilkan string kosong `\'\'`, dan React tidak menghapus atribut HTML untuk string kosong seperti ia menghapusnya untuk `undefined`, sehingga tanpa baris ini elemen akan mendapat `aria-describedby=""` yang berarti "dijelaskan oleh elemen tak dikenal", lebih buruk daripada tidak punya atribut itu sama sekali.',
      ),
      callout(
        'danger',
        'Tanpa ketiganya, field itu rusak — meski terlihat baik',
        'Tanpa `htmlFor`, mengklik label tidak memfokuskan input dan screen reader tidak tahu namanya. Tanpa `aria-describedby`, pesan error **tidak pernah dibacakan**, sehingga pengguna hanya tahu formnya gagal tanpa tahu kenapa. Tanpa `aria-invalid`, keadaan gagal tidak terdeteksi sama sekali.',
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
      p(
        'Kedua bentuk SALAH gagal karena alasan yang berbeda, dan keduanya layak dikenali. Penghitung modul gagal pada **SSR**, sebab server memulai dari `0` dan menghasilkan `field-0`, lalu browser menjalankan modulnya lagi dari awal dan menghasilkan urutan yang bisa berbeda. Akibatnya atribut `id` dan `htmlFor` jadi tidak cocok, React melaporkan hydration mismatch, dan kaitan label putus. `Math.random()` lebih buruk lagi karena ia berada di badan komponen, sehingga nilainya berubah **setiap render**, sehingga `htmlFor` dan `id` sempat menunjuk nilai berbeda di antara render. `useId()` menyelesaikan keduanya karena React menghasilkannya dari **posisi komponen dalam pohon**, yang sama di server maupun browser dan stabil sepanjang umur komponennya.',
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
        <Field label="Password" name="password" type="password" autoComplete="current-password" />
        <Field label="Kode OTP" name="otp" inputMode="numeric" autoComplete="one-time-code" />
        <Field label="Nama" name="nama" autoComplete="name" spellCheck={false} />
        `,
      ),
      p(
        'Keempat baris ini bekerja karena `Field` meneruskan props sisa ke `<input>`, seperti pola di sub-bab anatomi, sehingga tidak satu pun atribut ini perlu ditambahkan ke tipe `Field`. Perhatikan nilai `autoComplete` berbeda-beda dan **bukan sekadar `"on"`**. Nilai `current-password` memberi tahu pengelola sandi bahwa ini kolom masuk dan bukan kolom membuat sandi baru, sedangkan `one-time-code` membuat ponsel menawarkan kode OTP yang baru saja tiba lewat SMS. Nilai yang tepat inilah yang membuat pengisian otomatis benar-benar berguna. `inputMode="numeric"` di baris ketiga hanya mengubah **papan tik yang muncul** tanpa menolak karakter lain, berbeda dari `type="number"` yang menambah tombol naik-turun dan menolak awalan nol, keduanya salah untuk kode OTP.',
      ),
      ul(
        '`autoComplete` yang benar membuat pengisian otomatis bekerja — ini fitur aksesibilitas, bukan kenyamanan.',
        '`inputMode="numeric"` memunculkan papan tik angka di ponsel tanpa menolak karakter lain.',
        '`type="email"` memberi validasi bawaan dan papan tik yang tepat.',
        '**Jangan pernah blokir paste** — itu memaksa orang mengetik ulang password dari pengelola sandi.',
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
      p(
        'Baris `e.currentTarget.querySelector(\'[aria-invalid="true"]\')` memanfaatkan atribut `aria-invalid` yang sudah dipasang komponen `Field` — bukan mencari lewat `id` atau `ref` yang harus didaftarkan manual untuk tiap field, melainkan mencari **elemen pertama di dalam form** yang punya atribut itu bernilai `true`. Karena urutan pencarian `querySelector` mengikuti urutan elemen di DOM, "pertama" di sini secara alami berarti field paling atas yang gagal validasi. Memindahkan fokus ke situ (`pertama?.focus()`) membuat pengguna keyboard maupun pembaca layar langsung diarahkan ke masalah pertama yang perlu diperbaiki, bukan dibiarkan menerka field mana yang salah dari sekian banyak yang mungkin ada di form panjang.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Formulir pengaturan akun punya dua belas kolom. Tiap kolom butuh label, teks bantuan, pesan galat, dan penanda wajib. Ditulis berulang di tiap kolom, hasilnya delapan baris markup per kolom dan sembilan puluh enam baris total, dengan tiga di antaranya lupa menghubungkan label ke kolomnya sehingga mengklik label tidak memfokuskan apa pun.',
      ),
      p(
        'Komponen kolom yang benar menyelesaikan itu sekaligus menjamin hubungan aksesibilitasnya tidak mungkin lupa dibuat.',
      ),
      code(
        'tsx',
        `
        import { useId } from 'react';
        import type { ComponentPropsWithoutRef, ReactNode } from 'react';

        type KolomProps = Omit<ComponentPropsWithoutRef<'input'>, 'id'> & {
          label: string;
          bantuan?: ReactNode;
          galat?: string;
        };

        export function Kolom({ label, bantuan, galat, required, ...sisa }: KolomProps) {
          // useId menghasilkan id unik dan stabil, aman untuk render di server.
          const id = useId();
          const idBantuan = \`\${id}-bantuan\`;
          const idGalat = \`\${id}-galat\`;

          // Hubungkan KEDUANYA kalau keduanya ada, dipisah spasi.
          const dijelaskanOleh = [bantuan ? idBantuan : null, galat ? idGalat : null]
            .filter(Boolean)
            .join(' ') || undefined;

          return (
            <div className="kolom">
              <label htmlFor={id}>
                {label}
                {required ? <span aria-hidden="true"> *</span> : null}
              </label>

              <input
                id={id}
                required={required}
                aria-invalid={galat ? true : undefined}
                aria-describedby={dijelaskanOleh}
                {...sisa}
              />

              {bantuan ? <p id={idBantuan} className="bantuan">{bantuan}</p> : null}
              {galat ? <p id={idGalat} className="galat" role="alert">{galat}</p> : null}
            </div>
          );
        }
        `,
        { filename: 'src/ui/Kolom.tsx' },
      ),
      p(
        "Bentuk `Omit<..., 'id'>` pada tipe props menutup satu kelas bug sekaligus. Karena komponen ini membuat `id` sendiri untuk menghubungkan label, membiarkan pemanggil menyetelnya akan memutus hubungan itu. Menghapusnya dari tipe berarti kesalahan itu ditolak sebelum dijalankan, bukan ditemukan lewat pengujian aksesibilitas.",
      ),
      p(
        'Penggabungan `aria-describedby` adalah bagian yang paling sering ditulis setengah benar. Atribut itu menerima **beberapa** id yang dipisah spasi, dan sebagian orang hanya menghubungkan salah satunya sehingga teks bantuan atau pesan galat tidak dibacakan. Menyusunnya dari array lalu menyaring yang kosong membuat kedua kasus tertangani, dan `|| undefined` di akhir menghapus atributnya kalau keduanya tidak ada.',
      ),
      p(
        'Tanda bintang penanda wajib diberi `aria-hidden`, dan itu disengaja. Atribut `required` pada kolomnya sudah diumumkan pembaca layar sebagai wajib, sehingga membiarkan bintangnya ikut dibacakan menghasilkan pengumuman ganda yang membingungkan. Bintang itu murni petunjuk visual bagi yang melihat.',
      ),
      p(
        'Hook `useId` dipakai bukan angka acak, dan alasannya teknis. Nilai acak menghasilkan id berbeda antara render di server dan di klien, sehingga terjadi ketidakcocokan hidrasi yang membuat React membuang seluruh hasil server. `useId` menghasilkan nilai yang sama di kedua sisi, dan ia memang dibuat untuk keperluan ini.',
      ),
      callout(
        'warning',
        'Placeholder bukan pengganti label',
        'Teks di dalam kolom hilang begitu pengguna mulai mengetik, sehingga ia tidak lagi tahu kolom itu untuk apa. Ia juga sering berkontras rendah dan tidak dibacakan sebagian pembaca layar. Placeholder berguna untuk contoh format, misalnya 08xxxxxxxxxx, dan tidak pernah menggantikan label.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada komponen kolom, dan tiga di antaranya hanya terlihat oleh pengguna pembaca layar.',
      ),
      code(
        'text',
        `
        <label>Email</label>
        <input type="email" />

        // Mengklik label tidak memfokuskan kolom.
        // Pembaca layar mengumumkan kolom tanpa nama.
        `,
        { caption: 'Label tidak terhubung ke kolomnya.' },
      ),
      p(
        'Ada dua cara menghubungkannya, yaitu `htmlFor` pada label yang menunjuk `id` kolom, atau membungkus kolomnya di dalam label. Keduanya sah. Yang tidak sah adalah membiarkan keduanya bersebelahan tanpa hubungan, dan itu yang paling sering terjadi sebab tampilannya terlihat benar. Plugin lint aksesibilitas menandainya dengan aturan `label-has-associated-control`.',
      ),
      code(
        'text',
        `
        <Kolom label="Email" id="email-pengguna" />

        error TS2322: Property 'id' does not exist on type 'KolomProps'.
        `,
        { caption: 'Diuji dengan `tsc`. Menyetel `id` sendiri akan memutus hubungan label.' },
      ),
      p(
        'Ini contoh tipe yang dipakai untuk menegakkan aturan, bukan sekadar mendeskripsikan bentuk. Karena `id` dihapus dari tipe props, pemanggil tidak bisa merusak hubungan yang komponen ini bangun. Kalau pemanggil memang butuh menunjuk kolomnya dari tempat lain, sediakan prop lain yang tidak bentrok, misalnya `idLuar` yang komponen gabungkan sendiri.',
      ),
      code(
        'text',
        `
        <input aria-describedby="bantuan" />
        <p id="bantuan">Minimal 8 karakter</p>
        <p id="galat">Kata sandi terlalu pendek</p>

        // Pesan galat TIDAK dibacakan, sebab tidak ikut dihubungkan.
        `,
        { caption: 'Hanya satu dari dua penjelasan yang terhubung.' },
      ),
      p(
        'Atribut `aria-describedby` menerima beberapa id yang dipisah spasi, dan menuliskan satu saja berarti sisanya tidak pernah sampai ke pengguna pembaca layar. Ini kesalahan yang tidak terlihat sama sekali secara visual, sebab kedua teks tetap tampil di layar. Satu-satunya cara menemukannya adalah menguji dengan pembaca layar atau memeriksa pohon aksesibilitas di DevTools.',
      ),
      code(
        'text',
        `
        <input value={nilai} />

        Warning: You provided a \`value\` prop to a form field without an
        \`onChange\` handler. This will render a read-only field.
        `,
        { caption: 'Peringatan React yang sudah dibahas, dan sering muncul pada komponen kolom.' },
      ),
      p(
        'Pada komponen kolom, penyebabnya biasanya `onChange` tidak ikut diteruskan lewat `{...sisa}` karena tidak sengaja dibongkar keluar lalu tidak dipakai. Periksa daftar prop yang kamu bongkar di parameter, dan pastikan seluruh yang tidak kamu pakai sendiri tetap masuk ke `sisa`. Ini kesalahan yang mudah terjadi saat komponennya diperluas.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Mengklik label tidak memfokuskan kolom',
            'Label tidak terhubung lewat `htmlFor` dan `id`',
            'Hubungkan keduanya, atau bungkus kolom di dalam label',
          ],
          [
            "`Property 'id' does not exist on type`",
            '`id` sengaja dihapus dari tipe props',
            'Biarkan komponen membuatnya, dan sediakan prop lain kalau memang butuh',
          ],
          [
            'Pesan galat tidak dibacakan pembaca layar',
            'Hanya satu id yang dihubungkan ke `aria-describedby`',
            'Gabungkan seluruh id yang relevan, dipisah spasi',
          ],
          [
            '`You provided a \\`value\\` prop ... without an \\`onChange\\``',
            '`onChange` tidak ikut diteruskan ke elemennya',
            'Pastikan prop yang tidak dipakai komponen tetap masuk ke `sisa`',
          ],
          [
            'Id bentrok saat komponen dipakai dua kali',
            'Id ditulis tetap, bukan dihasilkan',
            'Pakai `useId`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Kolom formulir adalah komponen dengan kebutuhan aksesibilitas terbanyak, dan sebagian besar kesalahan di bawah tidak terlihat sama sekali secara visual.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai placeholder sebagai pengganti label',
            'Tampilannya lebih bersih',
            'Teksnya hilang begitu pengguna mengetik, kontrasnya rendah, dan sebagian pembaca layar tidak membacakannya',
          ],
          [
            'Menaruh label sebagai `div` di atas kolom',
            'Tampilannya sama saja',
            'Tidak ada hubungan dengan kolomnya, sehingga mengklik tidak memfokuskan dan pembaca layar tidak menyebut namanya',
          ],
          [
            'Memakai `id` tetap pada komponen yang dipakai berulang',
            'Idnya kan sudah unik',
            'Dua kolom dengan id sama membuat label menunjuk kolom yang salah. Pakai `useId`',
          ],
          [
            'Menampilkan pesan galat tanpa `role="alert"`',
            'Pesannya kan sudah terlihat',
            'Pembaca layar tidak mengumumkan teks yang baru muncul kecuali diberi tahu. Pengguna tidak tahu ada yang salah',
          ],
          [
            'Menandai wajib hanya dengan tanda bintang',
            'Semua orang tahu artinya',
            'Bintang tanpa `required` tidak diumumkan sebagai wajib. Pakai atribut `required`, dan bintangnya sebagai petunjuk visual saja',
          ],
          [
            'Menyembunyikan pesan galat dengan `opacity: 0`',
            'Supaya tata letak tidak melompat',
            'Teksnya tetap dibacakan pembaca layar walaupun tidak terlihat. Pakai `hidden`, atau sediakan ruang kosong',
          ],
        ],
      ),
      p(
        'Baris terakhir menghasilkan pengalaman yang membingungkan bagi pengguna pembaca layar, yaitu mereka mendengar pesan galat untuk kolom yang tampak baik-baik saja. Cara menyediakan ruang tanpa menyembunyikan teks adalah memberi tinggi minimum pada wadah pesannya, sehingga tata letak tetap stabil dan pesannya benar-benar tidak ada saat tidak diperlukan.',
      ),
      callout(
        'tip',
        'Cara memeriksa hubungan aksesibilitas tanpa pembaca layar',
        'Buka tab Elements di DevTools, pilih kolomnya, lalu buka panel Accessibility. Di sana tertulis nama aksesibelnya dan dari mana nama itu berasal, beserta deskripsinya. Kalau namanya kosong atau bukan label yang kamu maksud, hubungannya belum benar. Pemeriksaan sepuluh detik ini menemukan sebagian besar masalah di sub-bab ini.',
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
    19,
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
      p(
        'Perhatikan tipe `ComponentProps<\'div\'>` pada tiap bagian: ia berarti "seluruh prop yang sah dipakai pada elemen `<div>` HTML asli", termasuk `onClick`, `id`, dan `data-*`, tanpa perlu menuliskan satu per satu. Pola `{...sisa}` di akhir meneruskan seluruh prop itu ke elemen sungguhan, sehingga `Card` tetap terasa seperti `<div>` biasa bagi pemanggilnya, hanya dengan style bawaan yang bisa ditimpa lewat `className` (`cn()` menggabungkan keduanya, dengan `className` milik pemanggil yang menang belakangan). Ini alasan `Card.Header`, `Card.Body`, dan `Card.Footer` tidak butuh Context sama sekali seperti `Tabs` di sub-bab sebelumnya, sebab ketiganya tidak berbagi state apa pun, jadi menempelkannya sebagai static property cukup untuk menyatakan "bagian ini hanya bermakna di dalam `Card`".',
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
      p(
        'Versi SALAH menempelkan `role="button"` dan `tabIndex` pada `<div>`, yaitu cara lama membuat sesuatu "terlihat bisa diklik". Masalahnya bukan tampilan melainkan **kemampuan yang hilang**, sebab ia tidak bisa dibuka di tab baru, alamatnya tidak bisa disalin, dan tidak muncul di daftar tautan pembaca layar. Belum lagi tombol "Simpan" di dalamnya jadi elemen interaktif bersarang di dalam interaktif, yang tidak sah menurut HTML. Versi BENAR membalik pendekatannya, karena yang interaktif tetap **satu tautan asli** di judul, dan `after:absolute after:inset-0` membuat pseudo-element tak terlihat yang membentang menutupi seluruh kartu, dan itulah yang memperluas area kliknya. `relative` pada `<article>` menjadi acuan posisinya. Dan `relative z-10` pada tombol menaikkannya di atas overlay itu, sehingga ia tetap bisa diklik sendiri.',
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
      p(
        'Komponen `Skeleton` sendiri sengaja dibuat **tanpa ukuran apa pun**, sebab ia hanya menyediakan warna, sudut membulat, dan animasi denyut, lalu menyerahkan tinggi dan lebar ke `className` dari pemanggil. Itu yang membuatnya bisa dipakai untuk apa saja. Perhatikan komentar di `SkeletonKartu`, karena tiap `Skeleton` diberi ukuran yang **menyamai elemen yang akan menggantikannya**, yaitu `h-5` untuk judul, `h-4` untuk baris teks, serta lebar `w-2/3` maupun `w-4/5` yang meniru panjang baris yang tidak rata. Kemiripan itu bukan soal estetika melainkan soal **tinggi total kartunya**, karena itulah yang menentukan ada tidaknya lompatan saat data tiba. `aria-hidden="true"` pada `Skeleton` melengkapi sisi aksesibilitasnya, sebab kotak-kotak kosong ini tidak punya makna untuk dibacakan.',
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
        'Operasi yang hampir selalu selesai di bawah 200ms — flicker-nya terasa lebih lambat daripada tanpa indikator.',
        'Tindakan yang dipicu pengguna dan responsnya lokal — pakai keadaan pada tombolnya.',
        'Muat ulang data yang sudah tampil — tampilkan data lama sambil memuat, jangan diganti skeleton.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman beranda menampilkan dua belas kartu produk yang datanya diambil dari server. Versi pertama menampilkan spinner tunggal di tengah layar selama pemuatan. Setelah diukur, skor Cumulative Layout Shift halaman itu buruk sebab seluruh isi melompat begitu data tiba, dan pengguna yang hendak mengklik menu justru mengklik kartu yang tiba-tiba muncul di bawah kursornya.',
      ),
      p(
        'Skeleton menyelesaikan dua hal sekaligus, yaitu memberi tahu bahwa sesuatu sedang dimuat, dan **menahan ruang** supaya tata letak tidak bergeser saat isinya tiba.',
      ),
      code(
        'tsx',
        `
        // Skeleton yang bentuknya MENGIKUTI kartu sungguhan.
        export function KartuSkeleton() {
          return (
            <article className="kartu" aria-hidden="true">
              {/* Ukuran gambar sama persis dengan kartu asli. */}
              <div className="skeleton" style={{ aspectRatio: '1 / 1' }} />
              <div className="kartu-isi">
                <div className="skeleton skeleton-baris" style={{ width: '70%' }} />
                <div className="skeleton skeleton-baris" style={{ width: '40%' }} />
              </div>
            </article>
          );
        }

        // Wadahnya yang mengumumkan keadaannya, bukan tiap skeleton.
        export function DaftarProduk({ keadaan }: { keadaan: Keadaan<Produk[]> }) {
          if (keadaan.status === 'memuat') {
            return (
              <div className="grid" role="status" aria-label="Memuat produk">
                {Array.from({ length: 12 }, (_, i) => <KartuSkeleton key={i} />)}
              </div>
            );
          }
          // ...
        }
        `,
        { filename: 'src/produk/KartuSkeleton.tsx' },
      ),
      p(
        'Atribut `aria-hidden` pada tiap skeleton dan `role="status"` pada wadahnya adalah pembagian yang penting. Tanpa `aria-hidden`, pembaca layar akan mengumumkan dua belas kotak kosong yang tidak berarti apa-apa. Dengan `role="status"` dan `aria-label` di wadahnya, ia mengumumkan satu kalimat yang berguna, yaitu sedang memuat produk. Satu pengumuman, bukan dua belas.',
      ),
      p(
        'Pemakaian `key={i}` di sini adalah salah satu dari sedikit kasus di mana indeks memang tepat. Daftar skeleton tidak pernah diurutkan, tidak pernah disaring, tidak pernah dihapus di tengah, dan tidak ada satu pun elemen di dalamnya yang menyimpan keadaan. Ketiga syarat dari Sub-bab 2.6 terpenuhi sekaligus, dan tidak ada id yang bisa dipakai sebab datanya memang belum ada.',
      ),
      p(
        'Bagian `aspectRatio` menutup masalah pergeseran tata letak sepenuhnya. Selama peramban tahu perbandingan sisi gambarnya, ia bisa menyediakan ruang yang tepat sebelum gambarnya terunduh. Kalau kartu aslinya memakai gambar dengan `width` dan `height`, skeleton harus memakai perbandingan yang sama persis. Skeleton yang ukurannya berbeda dari isi aslinya justru menambah pergeseran, bukan menguranginya.',
      ),
      code(
        'css',
        `
        .skeleton {
          background: linear-gradient(90deg,
            var(--abu-100) 25%, var(--abu-200) 50%, var(--abu-100) 75%);
          background-size: 200% 100%;
          animation: geser 1.5s linear infinite;
          border-radius: 4px;
        }

        @keyframes geser {
          to { background-position: -200% 0; }
        }

        /* Hormati pengaturan pengguna yang mengurangi gerakan. */
        @media (prefers-reduced-motion: reduce) {
          .skeleton { animation: none; }
        }
        `,
        { filename: 'src/gaya/skeleton.css' },
      ),
      p(
        'Blok `prefers-reduced-motion` bukan penyempurnaan melainkan bagian dari baseline aksesibilitas project ini. Sebagian pengguna menyetel sistemnya untuk mengurangi gerakan karena animasi berulang bisa memicu pusing atau mual. Animasi kilau yang berjalan terus-menerus pada dua belas kartu adalah persis jenis gerakan yang dimaksud. Mematikannya tetap menyisakan bentuk skeleton yang sudah cukup memberi tahu bahwa sesuatu sedang dimuat.',
      ),
      callout(
        'tip',
        'Skeleton hanya untuk pemuatan pertama, bukan untuk pemuatan ulang',
        'Kalau data lama masih ada dan pengguna hanya mengganti filter, mengganti daftar dengan skeleton membuat layar berkedip dan terasa lebih lambat. Pertahankan data lama sambil menandai `aria-busy`, seperti pola `memuat-ulang` yang dibahas di bab tentang state. Skeleton penuh hanya saat benar-benar belum ada apa pun untuk ditampilkan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Skeleton jarang melempar error. Yang muncul adalah pergeseran tata letak dan pengumuman yang mengganggu, dan keduanya baru terlihat kalau diuji dengan benar.',
      ),
      code(
        'text',
        `
        // Skeleton tinggi 120px, kartu asli tinggi 280px.
        // Saat data tiba, seluruh isi halaman melompat 160px x 12 baris.

        Cumulative Layout Shift: 0.42   (batas yang baik: di bawah 0.1)
        `,
        { caption: 'Skeleton yang ukurannya tidak sama dengan isi aslinya.' },
      ),
      p(
        'Skeleton yang ukurannya tidak cocok justru memperburuk keadaan dibandingkan tidak ada skeleton sama sekali, sebab pergeserannya terjadi setelah pengguna sempat mengarahkan kursor. Ukur kartu aslinya lalu samakan, dan cara paling andal adalah memakai kelas dan `aspectRatio` yang sama persis. Tab Performance di DevTools menampilkan skor pergeseran ini beserta elemen mana yang menyebabkannya.',
      ),
      code(
        'text',
        `
        {Array.from({ length: 12 }, (_, i) => <KartuSkeleton key={i} />)}
        // tanpa aria-hidden pada skeleton

        // Pembaca layar mengumumkan dua belas kali:
        // "artikel, artikel, artikel, ..."
        `,
        { caption: 'Skeleton ikut dibacakan sebagai isi yang berarti.' },
      ),
      p(
        'Tidak ada error, dan pengalamannya sangat mengganggu bagi pengguna pembaca layar. Yang mereka dengar adalah deretan elemen kosong tanpa penjelasan apa pun. Sembunyikan seluruh skeleton dari pohon aksesibilitas dengan `aria-hidden`, lalu sediakan satu pengumuman di wadahnya yang menjelaskan apa yang sedang terjadi.',
      ),
      code(
        'text',
        `
        // Data tiba dalam 80 ms.
        // Skeleton muncul lalu hilang dalam sekejap. Layar berkedip.
        `,
        { caption: 'Skeleton ditampilkan untuk pemuatan yang hampir seketika.' },
      ),
      p(
        'Kedipan terbaca lebih lambat daripada tidak ada indikator sama sekali, sebab mata menangkap dua perubahan besar. Ada dua pola yang menyelesaikannya. Pertama, tunda memunculkan skeleton sekitar dua ratus milidetik sehingga pemuatan cepat tidak sempat menampilkannya. Kedua, kalau sudah terlanjur muncul, tahan minimal beberapa ratus milidetik. Keduanya dibahas di Bab 5 Frontend Basic.',
      ),
      code(
        'text',
        `
        @keyframes geser { to { background-position: -200% 0; } }
        // tanpa blok prefers-reduced-motion

        // Dua belas animasi berjalan terus-menerus.
        // Sebagian pengguna mengalami pusing.
        `,
        { caption: 'Animasi berulang tanpa menghormati pengaturan pengguna.' },
      ),
      p(
        'Ini bukan preferensi estetika melainkan kebutuhan kesehatan bagi sebagian orang. Sistem operasi menyediakan pengaturan untuk mengurangi gerakan, dan CSS bisa membacanya lewat `prefers-reduced-motion`. Mematikan animasi di sana tidak menghilangkan fungsi skeleton sama sekali, sebab bentuk kotaknya sudah cukup menyampaikan bahwa sesuatu sedang dimuat.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Isi halaman melompat saat data tiba',
            'Ukuran skeleton tidak sama dengan isi aslinya',
            'Samakan ukurannya, dan pakai `aspectRatio` untuk gambar',
          ],
          [
            'Pembaca layar mengumumkan belasan elemen kosong',
            'Skeleton tidak disembunyikan dari pohon aksesibilitas',
            'Beri `aria-hidden`, dan satu `role="status"` di wadahnya',
          ],
          [
            'Layar berkedip pada pemuatan cepat',
            'Skeleton muncul lalu hilang dalam sekejap',
            'Tunda memunculkannya, atau tahan minimalnya',
          ],
          [
            'Sebagian pengguna melaporkan pusing',
            'Animasi berulang tanpa `prefers-reduced-motion`',
            'Matikan animasinya pada pengaturan itu',
          ],
          [
            'Skeleton muncul saat filter diganti',
            'Keadaan memuat ulang tidak dibedakan dari memuat pertama',
            'Pertahankan data lama, tandai dengan `aria-busy`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Skeleton terlihat sebagai detail visual, dan ia sebenarnya menyentuh performa terukur sekaligus aksesibilitas.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai spinner tunggal di tengah layar',
            'Paling sederhana',
            'Tidak menahan ruang, sehingga seluruh isi melompat saat data tiba. Skeleton yang seukuran isinya menutup itu',
          ],
          [
            'Membuat skeleton yang bentuknya asal kotak',
            'Yang penting ada tandanya',
            'Ukuran yang berbeda dari isi aslinya justru menambah pergeseran. Ikuti bentuk dan ukuran sungguhannya',
          ],
          [
            'Menampilkan skeleton pada setiap pemuatan',
            'Konsisten',
            'Untuk pemuatan ulang, layar berkedip dan terasa lebih lambat. Pertahankan data lama',
          ],
          [
            'Membiarkan skeleton dibacakan pembaca layar',
            'Ia kan bagian dari halaman',
            'Isinya tidak berarti apa-apa. Sembunyikan dengan `aria-hidden`, dan umumkan sekali di wadahnya',
          ],
          [
            'Menganimasikan `background-position` pada puluhan elemen',
            'Efeknya bagus',
            'Untuk daftar sangat panjang ini bisa memakan tenaga. Batasi jumlah skeleton yang ditampilkan, misalnya sebanyak yang muat di layar',
          ],
          [
            'Melupakan `prefers-reduced-motion`',
            'Animasinya kan halus',
            'Sebagian pengguna menyetel sistemnya untuk mengurangi gerakan karena alasan kesehatan. Ini bagian dari baseline, bukan penyempurnaan',
          ],
        ],
      ),
      p(
        'Baris pertama layak ditegaskan karena spinner tunggal masih sangat umum dan ia menyelesaikan hanya setengah masalah. Ia memberi tahu bahwa sesuatu sedang terjadi, dan sama sekali tidak menahan ruang. Skor pergeseran tata letak adalah salah satu metrik yang diukur baseline performa project ini, dan spinner tunggal hampir selalu membuatnya buruk pada halaman yang isinya banyak.',
      ),
      callout(
        'info',
        'Cara mengukur pergeseran tata letak sendiri',
        'Buka tab Performance di DevTools, centang Web Vitals, lalu rekam pemuatan halamannya. Skor Cumulative Layout Shift muncul di sana beserta elemen mana yang bergeser dan berapa banyak. Batas yang dianggap baik adalah di bawah 0,1, dan itu angka yang dipakai baseline performa project ini.',
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
    25,
    'Overlay yang benar: portal, focus trap, pengembalian fokus, dan `Esc`.',
    [
      p(
        'Dialog adalah komponen dengan jarak terbesar antara "terlihat berfungsi" dan "benar-benar berfungsi". Lima hal berikut wajib ada, dan empat di antaranya tidak terlihat sama sekali kalau kamu hanya memakai mouse.',
      ),

      terms(
        {
          term: 'dialog',
          meaning:
            'Jendela yang muncul di atas halaman dan **menuntut perhatian penuh** sebelum pengguna bisa melanjutkan. Komponen dengan jarak terbesar antara "terlihat berfungsi" dan "benar-benar berfungsi" — empat dari lima kewajibannya **tidak terlihat sama sekali** kalau kamu hanya menguji dengan mouse.',
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
      p(
        'Perhatikan `showModal()` yang dipanggil dan bukan `show()`, dan komentarnya menyebut alasannya. Hanya varian modal yang memberi focus trap dan membuat latar belakang *inert*, artinya elemen di belakangnya benar-benar tidak bisa difokus maupun diklik. Effect di atasnya memakai pola sinkronisasi, bukan pemicu: ia membandingkan prop `terbuka` dengan keadaan asli `el.open` lalu menyamakannya, sehingga aman dijalankan berulang. Dua handler di bawah menutup sisa kebutuhan. `onClose` menangkap semua cara dialog tertutup termasuk `Esc`, sehingga kamu tidak perlu mendengarkan tombol itu sendiri. Dan `e.target === ref.current` adalah cara memeriksa **klik pada backdrop**. Karena backdrop secara teknis bagian dari elemen `<dialog>` itu sendiri, klik di isinya akan punya `target` berupa elemen dalam, sedangkan klik di area gelap menghasilkan target dialognya langsung.',
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
      p(
        'Bagian yang paling mudah disalahpahami adalah blok `onKey` untuk Tab. Ia mencari elemen fokus **pertama** dan **terakhir** yang bisa difokus di dalam dialog (`bisaFokus[0]` dan elemen terakhir dari array itu), lalu memaksa lompatan manual di kedua ujungnya, sehingga Shift+Tab dari elemen pertama melompat ke elemen terakhir, dan Tab dari elemen terakhir melompat kembali ke elemen pertama. Tanpa `e.preventDefault()` di kedua cabang itu, browser tetap menjalankan perilaku Tab bawaannya dan fokus lolos keluar dialog. `pemicuRef.current = document.activeElement` di awal menyimpan elemen yang sedang fokus **sebelum** dialog dibuka, sehingga fungsi pembersihan di akhir bisa mengembalikan fokus ke situ persis. Polanya sama dengan `AbortController` di Bab 3 Frontend Basic, yaitu disiapkan di awal effect lalu dibersihkan di fungsi yang dikembalikan.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Dialog konfirmasi hapus dibangun dari `div` bertumpuk dengan latar gelap di belakangnya. Tiga laporan masuk. Pengguna keyboard bisa menekan Tab keluar dari dialog dan mengklik tombol di belakangnya. Menekan Escape tidak menutup apa pun. Dan setelah dialog ditutup, fokus keyboard hilang entah ke mana sehingga pengguna harus menekan Tab dari awal halaman.',
      ),
      p(
        'Ketiganya sudah diselesaikan peramban lewat elemen `dialog`. Berikut buktinya, diukur di Chromium sungguhan.',
      ),
      code(
        'text',
        `
        dialog sebelum dibuka: open      :: false
        setelah showModal: open          :: true
        fokus otomatis pindah ke         :: tutup
        elemen di luar dialog bisa difokus? :: tutup
        setelah close: open              :: false
        `,
        { caption: 'Baris keempat membuktikan fokus benar-benar terjebak di dalam dialog.' },
      ),
      p(
        'Baris ketiga menunjukkan fokus otomatis berpindah ke elemen pertama yang bisa difokus di dalam dialog, tanpa satu baris kode. Baris keempat adalah yang paling menentukan, yaitu percobaan memfokuskan tombol di **luar** dialog gagal dan fokusnya tetap di dalam. Peramban menjebak fokus secara bawaan pada `showModal`, dan itu menutup laporan pertama sepenuhnya.',
      ),
      code(
        'tsx',
        `
        import { useEffect, useRef } from 'react';

        type DialogProps = {
          terbuka: boolean;
          onTutup: () => void;
          judul: string;
          children: ReactNode;
          kaki?: ReactNode;
        };

        export function Dialog({ terbuka, onTutup, judul, children, kaki }: DialogProps) {
          const ref = useRef<HTMLDialogElement>(null);
          const idJudul = useId();

          useEffect(() => {
            const el = ref.current;
            if (!el) return;
            // showModal, bukan show. Yang kedua tidak menjebak fokus.
            if (terbuka && !el.open) el.showModal();
            if (!terbuka && el.open) el.close();
          }, [terbuka]);

          return (
            <dialog
              ref={ref}
              aria-labelledby={idJudul}
              // Escape memicu 'cancel', dan tanpa ini state kita tidak ikut berubah.
              onCancel={(e) => { e.preventDefault(); onTutup(); }}
              // 'close' dipicu oleh cara penutupan apa pun.
              onClose={onTutup}
              // Klik di area gelap: target adalah dialog itu sendiri.
              onClick={(e) => { if (e.target === ref.current) onTutup(); }}
            >
              <h2 id={idJudul}>{judul}</h2>
              <div className="dialog-isi">{children}</div>
              {kaki ? <footer className="dialog-kaki">{kaki}</footer> : null}
            </dialog>
          );
        }
        `,
        { filename: 'src/ui/Dialog.tsx' },
      ),
      p(
        'Perbedaan `showModal` dan `show` menentukan segalanya. Hanya `showModal` yang menjebak fokus, menampilkan latar gelap, dan membuat isi di belakangnya tidak bisa disentuh. Method `show` menampilkan dialog tanpa satu pun dari ketiganya, dan memakainya berarti membangun ulang seluruh perilaku itu sendiri. Kalau dialogmu terasa tidak menjebak fokus, hal pertama yang diperiksa adalah method mana yang dipanggil.',
      ),
      p(
        'Penangan `onCancel` menutup laporan kedua. Peramban sudah menutup dialog saat Escape ditekan, dan tanpa penangan itu state React tetap menganggapnya terbuka sehingga dialognya tidak bisa dibuka lagi. Memanggil `preventDefault` lalu menutup lewat state membuat satu jalur penutupan yang konsisten, dan `onClose` menangkap seluruh cara penutupan lainnya.',
      ),
      p(
        'Penangan klik pada area gelap memakai perbandingan `e.target === ref.current`, dan itu bekerja karena latar gelapnya secara teknis adalah bagian dari elemen dialog itu sendiri. Klik di dalam isi dialog menghasilkan target berupa elemen di dalamnya, sehingga perbandingannya salah dan dialognya tidak ikut tertutup. Ini pola yang lebih sederhana daripada memakai `contains`, dan hanya berlaku untuk elemen `dialog`.',
      ),
      callout(
        'info',
        'Fokus kembali ke pemicu secara otomatis',
        'Setelah `close`, peramban mengembalikan fokus ke elemen yang tadinya aktif sebelum dialog dibuka. Itu menutup laporan ketiga tanpa satu baris kode. Kalau kamu membangun dialog dari `div`, mengembalikan fokus adalah pekerjaan tambahan yang harus kamu tulis dan mudah terlewat.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada dialog, dan tiga di antaranya hanya terasa oleh pengguna keyboard.',
      ),
      code(
        'text',
        `
        el.show();      // bukan showModal

        // Dialog muncul. Fokus TIDAK terjebak, latar gelap tidak ada,
        // dan isi di belakangnya masih bisa diklik.
        `,
        { caption: 'Method yang salah dipanggil, dan seluruh perilaku modal hilang.' },
      ),
      p(
        'Tidak ada error, dan dialognya memang muncul sehingga sekilas terlihat benar. Perbedaannya hanya terlihat saat diuji dengan keyboard atau saat mencoba mengklik sesuatu di belakangnya. Kalau dialogmu terasa kurang menahan, periksa method yang dipanggil sebelum menambahkan kode penjebak fokus sendiri.',
      ),
      code(
        'text',
        `
        // Pengguna menekan Escape. Dialog tertutup.
        // Menekan tombol buka lagi tidak melakukan apa-apa.
        `,
        { caption: 'Peramban menutup dialog, dan state React masih menganggapnya terbuka.' },
      ),
      p(
        'Karena `terbuka` di state masih bernilai benar, efeknya menyimpulkan tidak ada yang perlu diubah dan `showModal` tidak dipanggil lagi. Dialognya seolah rusak. Penangan `onCancel` dan `onClose` menyinkronkan state dengan kenyataan, dan tanpa keduanya seluruh penutupan yang dilakukan peramban akan membuat state menyimpang.',
      ),
      code(
        'text',
        `
        <dialog ref={ref}>
          <h2>Hapus pesanan</h2>
        </dialog>

        // Pembaca layar mengumumkan: "dialog" tanpa nama.
        `,
        { caption: 'Dialog tanpa nama aksesibel.' },
      ),
      p(
        'Pengguna pembaca layar mendengar bahwa sebuah dialog terbuka dan tidak tahu dialog apa. Hubungkan judulnya dengan `aria-labelledby` yang menunjuk id judulnya, seperti pada studi kasus. Alternatifnya `aria-label` berisi teks langsung, dan itu dipakai kalau dialognya memang tidak punya judul yang terlihat.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          if (terbuka) ref.current?.showModal();
        }, [terbuka]);

        // Membuka dialog yang SUDAH terbuka:
        InvalidStateError: Failed to execute 'showModal' on 'HTMLDialogElement':
        The dialog is already open as a non-modal dialog, or has an open popover.
        `,
        { caption: 'Method dipanggil tanpa memeriksa keadaan saat ini.' },
      ),
      p(
        'Memanggil `showModal` pada dialog yang sudah terbuka melempar, dan itu bisa terjadi kalau efeknya berjalan dua kali seperti di `StrictMode`. Pemeriksaan `if (terbuka && !el.open)` pada studi kasus menutupnya. Ini contoh kenapa efek harus aman dijalankan berulang, dan `StrictMode` sengaja menemukan kasus seperti ini di pengembangan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Fokus bisa keluar dari dialog',
            '`show` dipakai, bukan `showModal`',
            'Panggil `showModal`',
          ],
          [
            'Dialog tidak bisa dibuka lagi setelah Escape',
            'State tidak ikut berubah saat peramban menutupnya',
            'Tangani `onCancel` dan `onClose`',
          ],
          [
            'Pembaca layar menyebut dialog tanpa nama',
            'Tidak ada `aria-labelledby` atau `aria-label`',
            'Hubungkan ke judulnya',
          ],
          [
            '`InvalidStateError` pada `showModal`',
            'Dipanggil saat dialog sudah terbuka',
            'Periksa `el.open` lebih dulu',
          ],
          [
            'Klik di dalam dialog ikut menutupnya',
            'Perbandingan target tidak dilakukan',
            'Bandingkan `e.target === ref.current`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Dialog adalah komponen dengan kebutuhan aksesibilitas paling banyak, dan hampir seluruhnya sudah diselesaikan peramban kalau elemen yang tepat dipakai.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membangun dialog dari `div` bertumpuk',
            'Tampilannya lebih bebas diatur',
            'Penjebakan fokus, Escape, latar gelap, dan pengembalian fokus semuanya harus dibangun ulang, dan hampir selalu ada yang terlewat',
          ],
          [
            'Memakai `show` alih-alih `showModal`',
            'Namanya lebih pendek',
            'Tidak menjebak fokus dan tidak menampilkan latar gelap. Seluruh keunggulan elemen `dialog` hilang',
          ],
          [
            'Melupakan penangan `onClose`',
            'State sudah diatur tombol tutup',
            'Escape dan penutupan lain dari peramban membuat state menyimpang, dan dialog tidak bisa dibuka lagi',
          ],
          [
            'Tidak mengunci gulir halaman di belakang',
            'Latar gelapnya sudah menutupi',
            'Menggulir di atas dialog menggulir halaman di belakangnya. Kunci gulir badan halaman selama dialog terbuka',
          ],
          [
            'Menaruh dialog jauh di dalam pohon komponen',
            'Dekat dengan yang memanggilnya',
            'Bisa terpotong oleh `overflow: hidden` induknya. Elemen `dialog` naik ke lapisan atas secara bawaan, dan itu salah satu keunggulannya',
          ],
          [
            'Membuka dialog tanpa memindahkan fokus ke dalamnya',
            'Penggunanya kan melihat dialognya',
            'Pengguna keyboard dan pembaca layar tetap berada di halaman belakang. `showModal` menyelesaikannya otomatis',
          ],
        ],
      ),
      p(
        'Baris kelima adalah keunggulan elemen `dialog` yang jarang disebut dan sangat berguna. Dialog yang dibuka dengan `showModal` dirender di lapisan teratas peramban, di luar seluruh konteks penumpukan CSS. Artinya ia tidak bisa terpotong oleh `overflow: hidden`, tidak butuh `z-index` yang terus dinaikkan, dan tidak perlu dipindahkan ke `body` dengan portal. Untuk dialog yang dibangun dari `div`, ketiganya adalah masalah yang harus diselesaikan sendiri.',
      ),
      callout(
        'tip',
        'Uji dialog dengan keyboard saja, tanpa menyentuh tetikus',
        'Buka dialognya dengan Enter pada tombol pemicu. Tekan Tab beberapa kali dan pastikan fokus berputar di dalam dialog saja. Tekan Escape dan pastikan ia tertutup. Lalu periksa apakah fokus kembali ke tombol pemicu. Empat langkah itu memakan dua puluh detik dan menemukan seluruh masalah di sub-bab ini.',
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
    25,
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
      p(
        'Tipe `Ctx` menyimpan tiga hal, dan yang ketiga paling mudah terlewat gunanya. `aktif` dan `setAktif` adalah state yang dibagikan seperti biasa, tapi `baseId` ada untuk **menghubungkan tab dengan panelnya** lewat `aria-controls` dan `aria-labelledby`. Karena satu halaman bisa memuat beberapa `Tabs`, id-nya harus unik per instance — itulah kenapa `useId` diimpor di baris pertama. Fungsi `useTabs()` di bawahnya menerapkan pola hook pembungkus yang sudah berulang di bab ini, dan `createContext<Ctx | null>(null)` dengan nilai awal `null` adalah pasangannya: nilai awal itu sengaja dibuat mustahil agar pemakaian di luar `<Tabs>` bisa dikenali dan dilaporkan dengan kalimat yang menyebutkan masalahnya.',
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
      p(
        'Perhatikan `baseId` yang dihasilkan sekali oleh `useId()` di `Tabs`, lalu dipakai ulang untuk membangun `id` setiap tab (`${baseId}-tab-${value}`) dan panel-nya (`${baseId}-panel-${value}`). Polanya memang disengaja. `aria-controls` pada tab menunjuk `id` panelnya, dan `aria-labelledby` pada panel menunjuk balik ke `id` tabnya, sehingga keduanya saling merujuk alih-alih satu arah. Kalau `id` ditulis manual tanpa `useId`, dua instance `<Tabs>` di halaman yang sama akan bertabrakan id-nya. `Tabs.Panel` juga melakukan hal yang gampang terlewat. Baris `if (aktif !== value) return null` berarti hanya **satu** panel yang benar-benar ada di DOM pada satu waktu, sehingga panel yang tidak aktif bukan disembunyikan dengan CSS, melainkan tidak dirender sama sekali.',
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
      p(
        'Fungsi `onKeyDown` ini memasang **pola keyboard baku ARIA untuk tablist**, dan cara penulisannya layak diperhatikan. Alih-alih rantai `if` untuk tiap tombol, ia memakai objek `peta` yang memetakan nama tombol ke indeks tujuan, pola yang sama dengan objek pencarian dari Frontend Basic. Perhatikan `(i - 1 + tabs.length) % tabs.length` pada `ArrowLeft`, karena penambahan `tabs.length` sebelum modulo diperlukan supaya menekan panah kiri di tab pertama berpindah ke tab **terakhir**, bukan menghasilkan indeks negatif. Baris `if (tujuan === undefined) return` memastikan tombol lain seperti huruf, Tab, dan Enter tidak ikut dicegat, dan itu sebabnya `preventDefault()` dipanggil **setelah** pemeriksaan itu, bukan sebelumnya. Terakhir, `focus()` diikuti `click()` karena keduanya memang dua hal berbeda, dengan yang pertama memindahkan fokus dan yang kedua benar-benar mengaktifkan tabnya.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail pesanan punya tiga tab, yaitu Ringkasan, Riwayat, dan Dokumen. Versi pertama dibangun dari tombol biasa dan tiga `div` yang disembunyikan bergantian. Penguji aksesibilitas melaporkan tiga hal. Pengguna keyboard harus menekan Tab tiga kali untuk melewati tab yang tidak ia pilih. Panah kiri dan kanan tidak melakukan apa pun. Dan pembaca layar tidak mengumumkan bahwa itu adalah tab, apalagi tab keberapa dari berapa.',
      ),
      p(
        'Tab punya pola interaksi yang sudah dibakukan, dan mengikutinya berarti pengguna yang sudah terbiasa langsung tahu cara memakainya tanpa belajar.',
      ),
      code(
        'tsx',
        `
        export function Tab({ daftar, aktif, onUbah }: TabProps) {
          const idDasar = useId();
          const refDaftar = useRef<HTMLDivElement>(null);

          function tanganiTombol(peristiwa: KeyboardEvent<HTMLDivElement>) {
            const i = daftar.findIndex((t) => t.id === aktif);
            let tujuan = i;

            if (peristiwa.key === 'ArrowRight') tujuan = (i + 1) % daftar.length;
            else if (peristiwa.key === 'ArrowLeft') tujuan = (i - 1 + daftar.length) % daftar.length;
            else if (peristiwa.key === 'Home') tujuan = 0;
            else if (peristiwa.key === 'End') tujuan = daftar.length - 1;
            else return;

            peristiwa.preventDefault();
            onUbah(daftar[tujuan].id);
            // Fokus harus IKUT berpindah, bukan hanya pilihannya.
            refDaftar.current
              ?.querySelector<HTMLButtonElement>(\`#\${idDasar}-tab-\${daftar[tujuan].id}\`)
              ?.focus();
          }

          return (
            <>
              <div role="tablist" ref={refDaftar} onKeyDown={tanganiTombol}>
                {daftar.map((t) => {
                  const dipilih = t.id === aktif;
                  return (
                    <button
                      key={t.id}
                      id={\`\${idDasar}-tab-\${t.id}\`}
                      role="tab"
                      type="button"
                      aria-selected={dipilih}
                      aria-controls={\`\${idDasar}-panel-\${t.id}\`}
                      // Hanya tab aktif yang ikut urutan Tab.
                      tabIndex={dipilih ? 0 : -1}
                      onClick={() => onUbah(t.id)}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {daftar.map((t) => (
                <div
                  key={t.id}
                  id={\`\${idDasar}-panel-\${t.id}\`}
                  role="tabpanel"
                  aria-labelledby={\`\${idDasar}-tab-\${t.id}\`}
                  tabIndex={0}
                  hidden={t.id !== aktif}
                >
                  {t.isi}
                </div>
              ))}
            </>
          );
        }
        `,
        { filename: 'src/ui/Tab.tsx' },
      ),
      p(
        'Bagian `tabIndex={dipilih ? 0 : -1}` menutup laporan pertama, dan polanya punya nama yaitu roving tabindex. Hanya satu tab yang ikut urutan Tab, sehingga menekan Tab sekali membawa pengguna masuk ke kelompok tab dan sekali lagi keluar ke isinya. Perpindahan antar-tab memakai panah, dan itu perilaku yang sudah dibakukan sehingga pengguna yang terbiasa tidak perlu menebak.',
      ),
      p(
        'Pemanggilan `focus()` setelah `onUbah` sering dilewatkan, dan tanpa itu polanya rusak. Kalau pilihannya berpindah sementara fokus tetap di tab lama, menekan panah sekali lagi akan menghitung dari posisi yang salah. Fokus dan pilihan harus bergerak bersama, dan itu yang membuat panah terasa benar.',
      ),
      p(
        'Atribut `hidden` pada panel yang tidak aktif lebih tepat daripada menyembunyikannya dengan CSS. Elemen yang disembunyikan dengan `hidden` benar-benar keluar dari pohon aksesibilitas dan tidak bisa difokus, sedangkan yang disembunyikan dengan `opacity` atau posisi di luar layar tetap bisa dicapai Tab. Pengguna keyboard akan menemukan fokusnya berpindah ke panel yang tidak terlihat.',
      ),
      p(
        'Atribut `tabIndex={0}` pada panelnya sengaja ada, dan alasannya sering ditanyakan. Panel yang isinya bisa digulir tapi tidak punya elemen yang bisa difokus di dalamnya tidak bisa digulir dengan keyboard. Menjadikannya bisa difokus menyelesaikan itu, dan ia juga memberi tempat berhenti yang wajar setelah pengguna keluar dari daftar tab.',
      ),
      callout(
        'tip',
        'Kalau kontennya berupa halaman terpisah, tab bukan jawabannya',
        'Tab cocok untuk beberapa tampilan atas **satu** hal yang sama. Kalau tiap tab sebenarnya halaman yang layak punya alamat sendiri, misalnya bisa dibagikan atau dibuka di tab baru, yang kamu butuhkan navigasi bukan tab. Tandanya jelas, yaitu kalau pengguna kesal karena menyegarkan halaman mengembalikannya ke tab pertama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut hampir seluruhnya tidak terlihat secara visual, dan hanya muncul saat diuji dengan keyboard atau pembaca layar.',
      ),
      code(
        'text',
        `
        <div role="tablist">
          <button role="tab">Ringkasan</button>
          <button role="tab">Riwayat</button>
        </div>
        // tanpa tabIndex

        // Pengguna harus menekan Tab untuk tiap tab.
        // Panah kiri dan kanan tidak melakukan apa pun.
        `,
        { caption: 'Peran ARIA dipasang tanpa perilaku keyboard yang menyertainya.' },
      ),
      p(
        'Ini kesalahan yang paling merugikan, sebab `role="tab"` memberi tahu pembaca layar bahwa ini adalah tab, dan pengguna yang mendengar itu akan mencoba memakai panah. Ketika panahnya tidak bekerja, mereka terjebak. Peran ARIA adalah **janji** tentang perilaku, dan memasangnya tanpa memenuhi janjinya lebih buruk daripada tidak memasangnya sama sekali.',
      ),
      code(
        'text',
        `
        <div role="tabpanel" style={{ display: t.id === aktif ? 'block' : 'none' }}>

        // Bekerja. Tapi kalau memakai opacity atau posisi di luar layar:
        // Tab membawa fokus ke panel yang tidak terlihat.
        `,
        { caption: 'Cara menyembunyikan menentukan apakah isinya masih bisa dicapai.' },
      ),
      p(
        'Menyembunyikan dengan `display: none` atau atribut `hidden` benar-benar mengeluarkan elemennya dari urutan Tab dan dari pohon aksesibilitas. Menyembunyikan dengan `opacity: 0`, `visibility` yang salah, atau memindahkannya ke luar layar tidak. Pengguna keyboard akan menekan Tab lalu fokusnya menghilang ke tempat yang tidak terlihat, dan itu salah satu pengalaman paling membingungkan.',
      ),
      code(
        'text',
        `
        onUbah(daftar[tujuan].id);
        // tanpa .focus()

        // Pilihan berpindah, fokus tetap di tab lama.
        // Menekan panah lagi menghitung dari posisi yang salah.
        `,
        { caption: 'Fokus dan pilihan berpisah.' },
      ),
      p(
        'Gejalanya khas dan membingungkan, yaitu menekan panah kanan dua kali hanya berpindah satu tab. Penyebabnya fokus masih berada di tab pertama sehingga perhitungan posisinya selalu dimulai dari sana. Pada pola roving tabindex, fokus dan pilihan wajib bergerak bersama.',
      ),
      code(
        'text',
        `
        <button role="tab" aria-selected={dipilih} />
        // tanpa aria-controls

        // Pembaca layar tidak tahu panel mana yang dikendalikan tab ini.
        `,
        { caption: 'Hubungan antara tab dan panelnya tidak dinyatakan.' },
      ),
      p(
        'Tanpa `aria-controls` dan `aria-labelledby` yang saling menunjuk, tab dan panelnya adalah dua hal terpisah di mata pembaca layar. Pengguna tidak punya cara berpindah cepat dari tab ke isinya. Kedua atribut itu memakai id, dan itu alasan `useId` dipakai untuk menghasilkan awalan yang unik supaya dua kelompok tab di satu halaman tidak bentrok.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Panah kiri dan kanan tidak bekerja',
            'Peran ARIA dipasang tanpa penangan keyboard',
            'Tambahkan `onKeyDown` dengan pola roving tabindex',
          ],
          [
            'Tab harus ditekan sekali untuk tiap tab',
            'Seluruh tab ikut urutan Tab',
            'Hanya tab aktif yang `tabIndex={0}`, sisanya `-1`',
          ],
          [
            'Fokus berpindah ke panel yang tidak terlihat',
            'Panel disembunyikan dengan cara yang tidak mengeluarkannya dari pohon',
            'Pakai atribut `hidden` atau `display: none`',
          ],
          [
            'Panah kanan dua kali hanya berpindah satu tab',
            'Fokus tidak ikut berpindah bersama pilihan',
            'Panggil `focus()` pada tab tujuan',
          ],
          [
            'Pembaca layar tidak menghubungkan tab dan panelnya',
            'Tidak ada `aria-controls` dan `aria-labelledby`',
            'Hubungkan keduanya lewat id yang dihasilkan `useId`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Tab terlihat sederhana dan punya pola interaksi yang cukup rinci. Sebagian besar kesalahan di bawah berasal dari memasang peran ARIA tanpa perilaku yang menyertainya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang `role="tab"` tanpa penangan panah',
            'Perannya sudah benar',
            'Peran adalah janji tentang perilaku. Pengguna yang mendengar tab akan mencoba panah dan terjebak',
          ],
          [
            'Membiarkan seluruh tab ikut urutan Tab',
            'Supaya semuanya bisa dicapai',
            'Pengguna harus menekan Tab berkali-kali untuk melewati kelompok tab. Pakai roving tabindex',
          ],
          [
            'Merender seluruh panel lalu menyembunyikan dengan CSS',
            'Berpindah tab jadi seketika',
            'Untuk panel yang isinya berat, seluruhnya tetap dibangun. Dan cara menyembunyikan yang salah membuat isinya masih bisa difokus',
          ],
          [
            'Memakai tab untuk konten yang seharusnya punya alamat sendiri',
            'Tampilannya lebih rapi',
            'Tidak bisa dibagikan, tombol kembali tidak bekerja, dan menyegarkan mengembalikan ke tab pertama. Pakai navigasi',
          ],
          [
            'Memakai `div` sebagai tab',
            'Tampilannya lebih bebas',
            'Kehilangan fokus keyboard dan Enter. Pakai `button` dengan `role="tab"`',
          ],
          [
            'Memakai id tetap untuk menghubungkan tab dan panel',
            'Idnya kan sudah unik',
            'Dua kelompok tab di satu halaman akan bentrok. Pakai `useId` sebagai awalan',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan aturan umum untuk seluruh ARIA, bukan hanya tab. Memasang peran memberi tahu teknologi bantu bahwa komponenmu berperilaku dengan cara tertentu, dan pengguna akan memakainya sesuai harapan itu. Peran yang dipasang tanpa perilakunya menciptakan janji palsu, dan itu lebih membingungkan daripada elemen biasa tanpa peran sama sekali.',
      ),
      callout(
        'info',
        'Pola interaksi ini sudah dibakukan, dan tidak perlu direka sendiri',
        'WAI-ARIA Authoring Practices menerbitkan pola untuk tab, accordion, menu, combobox, dan belasan lainnya, lengkap dengan tombol keyboard yang diharapkan. Mengikutinya berarti komponenmu berperilaku sama dengan yang sudah dikenal pengguna. Merekanya sendiri berarti pengguna harus belajar ulang untuk aplikasimu saja.',
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
    23,
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
      p(
        'Blok ini **tidak memuat satu baris JavaScript pun**, dan itulah intinya. Pasangan `<details>` dan `<summary>` adalah accordion bawaan HTML, dengan `<summary>` yang menjadi tombolnya, isi setelahnya menjadi panel, dan browser mengurus buka-tutupnya sendiri. Yang kamu dapat gratis bukan sekadar perilaku klik, melainkan seluruh daftar di kotak berikut, yaitu Enter dan Spasi, pengumuman keadaan ke pembaca layar, serta kemampuan Ctrl+F menemukan teks yang sedang tersembunyi. Yang terakhir itu mustahil ditiru dengan `<div>` yang disembunyikan. Sebelum menulis komponen React untuk pola apa pun, pertanyaan pertama yang layak diajukan memang apakah HTML sudah punya elemennya.',
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
      p(
        'State-nya sengaja disimpan sebagai `string[]`, yaitu daftar `id` yang sedang terbuka dan bukan `boolean` per item. Bentuk ini yang membuat satu fungsi `toggle` bisa melayani dua mode sekaligus lewat prop `tunggal`. Kalau `tunggal` bernilai `true`, membuka satu item mengganti seluruh array menjadi `[id]` itu saja, sehingga yang lain otomatis tertutup tanpa kode tambahan. Kalau `false`, item baru ditambahkan ke array yang sudah ada lewat `[...sekarang, id]`, sehingga beberapa panel bisa terbuka bersamaan. Baris pertama di dalam `toggle` (`if (sekarang.includes(id)) return sekarang.filter(...)`) menangani menutup-kembali panel yang sudah terbuka, dan itu dicek lebih dulu supaya klik kedua pada tombol yang sama selalu berarti "tutup", terlepas dari mode `tunggal` atau tidak. Perhatikan juga atribut `hidden={!aktif}` pada panel, karena ini bukan sekadar menyembunyikan secara visual. Atribut HTML `hidden` membuat elemen dan seluruh isinya **tidak bisa dijangkau Tab maupun dibaca screen reader**, sehingga tombol dan tautan yang tersembunyi di panel tertutup benar-benar tidak bisa diakses sampai panelnya dibuka.',
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
      p(
        'Teknik ini menyelesaikan masalah lama, yaitu **CSS tidak bisa menganimasikan `height` dari nol ke `auto`**, karena `auto` bukan angka yang bisa dihitung antaranya. Cara lama menebaknya dengan `max-height` yang dipasang lebih besar dari isi sebenarnya, dan tebakan itu selalu salah pada salah satu ujungnya. Terlalu kecil membuat isi terpotong, terlalu besar membuat animasinya terasa tertunda. Grid menghindarinya karena `grid-template-rows` **bisa** menganimasikan `0fr` ke `1fr`, dan `1fr` di sini berarti "setinggi isinya" tanpa kamu perlu tahu angkanya. `overflow: hidden` pada anaknya wajib ada, sebab tanpa itu isi panel tetap terlihat meluber saat barisnya menyusut ke nol.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Halaman bantuan berisi dua puluh pertanyaan yang sering diajukan, masing-masing bisa dibuka untuk melihat jawabannya. Versi pertama dibangun dari `div` dengan penangan klik dan state terbuka. Setelah dipasang, muncul tiga masalah. Pencarian bawaan peramban dengan Ctrl+F tidak menemukan teks di dalam jawaban yang tertutup. Pengguna keyboard tidak bisa membukanya. Dan mencetak halaman hanya menghasilkan daftar pertanyaan tanpa satu pun jawaban.',
      ),
      p(
        'Ketiganya diselesaikan elemen `details` yang sudah disediakan HTML, dan berikut buktinya di Chromium sungguhan.',
      ),
      code(
        'text',
        `
        <details id="det"><summary>Rincian</summary><p>isi</p></details>

        details open bawaan        :: false
        details setelah dibuka     :: true
        `,
        { caption: 'Keadaan buka dan tutup sudah dikelola peramban lewat properti `open`.' },
      ),
      p(
        'Elemen `details` memberi lima hal gratis, yaitu keadaan buka dan tutup, tombol pembuka yang bisa difokus keyboard, peran yang diumumkan pembaca layar, isi yang tetap ditemukan pencarian peramban, dan pencetakan yang menyertakan isinya. Membangunnya dari `div` berarti membangun ulang kelimanya, dan tiga di antaranya hampir selalu terlewat.',
      ),
      code(
        'tsx',
        `
        // Versi tanpa state React sama sekali. Peramban yang mengurusnya.
        export function Akordeon({ butir }: { butir: Butir[] }) {
          return (
            <div className="akordeon">
              {butir.map((b) => (
                <details key={b.id} className="akordeon-butir">
                  <summary className="akordeon-judul">{b.pertanyaan}</summary>
                  <div className="akordeon-isi">{b.jawaban}</div>
                </details>
              ))}
            </div>
          );
        }

        // Versi terkendali, dipakai HANYA kalau memang butuh
        // membatasi satu terbuka pada satu waktu.
        export function AkordeonTunggal({ butir }: { butir: Butir[] }) {
          const [terbuka, setTerbuka] = useState<string | null>(null);

          return (
            <div className="akordeon">
              {butir.map((b) => (
                <details
                  key={b.id}
                  open={terbuka === b.id}
                  onToggle={(e) => {
                    // onToggle dipicu peramban SETELAH keadaannya berubah.
                    if (e.currentTarget.open) setTerbuka(b.id);
                    else if (terbuka === b.id) setTerbuka(null);
                  }}
                >
                  <summary>{b.pertanyaan}</summary>
                  <div>{b.jawaban}</div>
                </details>
              ))}
            </div>
          );
        }
        `,
        { filename: 'src/ui/Akordeon.tsx' },
      ),
      p(
        'Versi pertama tidak punya satu pun state React, dan untuk sebagian besar kasus itu justru yang benar. Kalau tidak ada aturan yang menuntut hanya satu boleh terbuka, membiarkan peramban mengurusnya berarti nol kode dan nol bug. Kecenderungan menambahkan state untuk hal yang sudah diurus peramban adalah salah satu kebiasaan yang paling sering merugikan di React.',
      ),
      p(
        'Versi kedua dipakai hanya kalau aturan satu terbuka memang diperlukan. Perhatikan `onToggle` dipicu **setelah** peramban mengubah keadaannya, bukan sebelum, sehingga ia berbeda dari `onChange` pada kolom formulir. Membaca `e.currentTarget.open` memberi keadaan yang baru, dan menyetel state berdasarkan itu menjaga keduanya tetap sinkron.',
      ),
      p(
        'Perlu diketahui elemen `summary` sudah bisa difokus dan sudah menanggapi Enter serta spasi secara bawaan. Menambahkan `tabIndex` atau penangan keyboard sendiri padanya justru bisa merusak perilaku bawaannya. Ini pola yang berulang di seluruh bab ini, yaitu elemen bawaan memberi banyak hal gratis, dan menambahinya sering menghilangkan sebagian.',
      ),
      callout(
        'warning',
        'Menganimasikan `details` butuh pertimbangan tambahan',
        'Peramban tidak menganimasikan buka dan tutup `details` secara bawaan, dan menganimasikan `height` memicu perhitungan tata letak tiap bingkai seperti diukur di Bab 4 Frontend Basic. Properti CSS `interpolate-size` dan `content-visibility` mulai menyediakan jalan yang lebih baik, dan dukungannya masih berbeda antar-peramban. Periksa dukungannya sebelum mengandalkannya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada akordeon, dan tiga di antaranya berasal dari membangunnya sendiri padahal tidak perlu.',
      ),
      code(
        'text',
        `
        <div onClick={() => setBuka(!buka)}>{pertanyaan}</div>
        {buka ? <div>{jawaban}</div> : null}

        // Ctrl+F tidak menemukan teks jawaban yang tertutup.
        // Mencetak halaman tidak menyertakan jawaban.
        // Pengguna keyboard tidak bisa membukanya.
        `,
        { caption: 'Dibangun dari `div`, dan tiga perilaku bawaan hilang sekaligus.' },
      ),
      p(
        'Yang paling merugikan adalah pencarian peramban, sebab pengguna sering mencari kata kunci di halaman bantuan. Isi yang tidak dirender tidak akan pernah ditemukan. Elemen `details` menyelesaikan itu karena peramban modern membuka bagian yang cocok saat pencarian menemukannya di dalamnya, dan perilaku itu mustahil ditiru dengan `div`.',
      ),
      code(
        'text',
        `
        <details open={terbuka} />
        // tanpa onToggle

        // Pengguna mengklik. Peramban membukanya sesaat lalu React menutupnya lagi.
        // Akordeon terasa berkedip dan tidak bisa dibuka.
        `,
        { caption: 'Prop `open` dikendalikan React tanpa menyinkronkan balik.' },
      ),
      p(
        'Ini bentuk yang sama dengan kolom `value` tanpa `onChange` dari bab sebelumnya. Peramban mengubah keadaannya, React menggambar ulang dengan nilai lama, dan keadaannya kembali. Kalau kamu memakai `open` sebagai prop terkendali, `onToggle` wajib ada. Kalau tidak butuh mengendalikan, jangan setel `open` sama sekali dan biarkan peramban yang mengurusnya.',
      ),
      code(
        'text',
        `
        <summary tabIndex={0} onKeyDown={tanganiEnter}>{pertanyaan}</summary>

        // Enter memicu penangan DAN perilaku bawaan.
        // Akordeon terbuka lalu langsung tertutup lagi.
        `,
        { caption: 'Perilaku bawaan ditambahi, bukan digantikan.' },
      ),
      p(
        'Elemen `summary` sudah menanggapi Enter dan spasi, sehingga menambahkan penangan sendiri menghasilkan dua reaksi untuk satu penekanan. Gejalanya berupa akordeon yang berkedip terbuka lalu tertutup. Aturan yang bisa dipegang, jangan menambahkan perilaku keyboard pada elemen yang sudah punya, dan periksa dulu apa yang sudah disediakan sebelum menambah apa pun.',
      ),
      code(
        'text',
        `
        // Dua puluh akordeon, masing-masing berisi tabel besar.
        // Seluruhnya dirender walaupun tertutup.

        // Halaman butuh 1.8 detik untuk interaktif.
        `,
        { caption: 'Isi berat dirender walaupun tidak terlihat.' },
      ),
      p(
        'Elemen `details` merender isinya walaupun tertutup, dan itu justru yang membuat pencarian peramban bekerja. Untuk isi ringan seperti paragraf, itu tidak jadi masalah. Untuk isi berat seperti tabel besar atau grafik, kamu perlu menunda pembuatannya sampai dibuka. Ini pertukaran yang harus disadari, yaitu menunda isinya berarti kehilangan pencarian peramban di bagian itu.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Ctrl+F tidak menemukan isi yang tertutup',
            'Isi tidak dirender saat tertutup',
            'Pakai `details`, yang merender isinya',
          ],
          [
            'Akordeon berkedip dan tidak bisa dibuka',
            '`open` dikendalikan tanpa `onToggle`',
            'Tambahkan `onToggle`, atau jangan setel `open` sama sekali',
          ],
          [
            'Terbuka lalu langsung tertutup saat Enter',
            'Penangan keyboard ditambahkan pada `summary`',
            'Hapus penanganmu, sebab perilakunya sudah bawaan',
          ],
          [
            'Halaman lambat menjadi interaktif',
            'Isi berat dirender walaupun tertutup',
            'Tunda pembuatan isi berat sampai dibuka, dan sadari pertukarannya',
          ],
          [
            'Pengguna keyboard tidak bisa membuka',
            'Dibangun dari `div` tanpa `tabIndex` dan penangan',
            'Pakai `details` dan `summary`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Akordeon adalah contoh paling jelas dari kebiasaan membangun ulang sesuatu yang sudah disediakan peramban.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membangun akordeon dari `div` dan state',
            'Lebih bebas mengatur tampilannya',
            'Kehilangan pencarian peramban, pencetakan, fokus keyboard, dan peran ARIA. Keempatnya harus dibangun ulang',
          ],
          [
            'Menambahkan state React untuk `details` yang tidak butuh dikendalikan',
            'Semua keadaan harus di React',
            'Peramban sudah mengurusnya. Menambah state berarti menambah tempat yang bisa tidak sinkron tanpa manfaat apa pun',
          ],
          [
            'Menambahkan `tabIndex` dan penangan keyboard pada `summary`',
            'Supaya bisa dipakai keyboard',
            'Ia sudah bisa. Menambahinya menghasilkan reaksi ganda',
          ],
          [
            'Memakai akordeon untuk menyembunyikan informasi penting',
            'Supaya halaman terlihat ringkas',
            'Isi yang tertutup sering tidak pernah dibuka. Kalau informasinya penting bagi sebagian besar pengguna, tampilkan langsung',
          ],
          [
            'Memakai akordeon untuk formulir bertahap',
            'Tampilannya mirip',
            'Formulir bertahap butuh validasi per langkah dan urutan yang dipaksakan. Akordeon membiarkan pengguna membuka apa saja',
          ],
          [
            'Menganimasikan tinggi tanpa memikirkan biayanya',
            'Supaya terasa halus',
            'Menganimasikan `height` memicu perhitungan tata letak tiap bingkai. Untuk dua puluh butir sekaligus ini terasa',
          ],
        ],
      ),
      p(
        'Baris keempat adalah keputusan desain yang sering diambil untuk alasan yang salah. Akordeon dipilih supaya halaman terlihat ringkas, dan akibatnya informasi yang dibutuhkan sebagian besar pengguna menjadi tersembunyi di balik satu klik tambahan. Ukurannya sederhana, yaitu kalau lebih dari separuh pengguna akan membukanya, ia tidak layak ditutup sejak awal.',
      ),
      callout(
        'tip',
        'Periksa dulu apa yang sudah disediakan HTML',
        'Sebelum membangun komponen interaktif, cari apakah HTML sudah punya elemennya. `details` untuk akordeon, `dialog` untuk modal, `select` untuk pilihan, `input type="range"` untuk penggeser, dan `progress` untuk kemajuan. Semuanya membawa perilaku keyboard, peran ARIA, dan dukungan pembaca layar yang sudah teruji, dan semuanya gratis.',
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
    23,
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
      p(
        "Perhatikan `Omit<Toast, 'id'>` pada parameter `tampilkan`. Pemanggil mengirim pesan, nada, dan durasi, tetapi **tidak pernah** menentukan `id`-nya sendiri, karena itu dibuat provider lewat `crypto.randomUUID()` supaya dua toast yang tampil bersamaan tidak pernah bertabrakan `key`-nya di React. Pola `setTimeout` di dalam `tampilkan` adalah teknik yang sama dengan cleanup Effect di Bab 7, sebab sebuah timer dijadwalkan untuk menghapus toast itu sendiri dari `daftar` setelah `t.durasi` milidetik, tanpa komponen manapun perlu tahu bahwa penghapusan itu terjadi. Cukup panggil `tampilkan()`, dan toast akan membersihkan dirinya sendiri. `useCallback` dengan dependency array kosong `[]` menjaga identitas fungsi `tampilkan` tetap stabil antar-render, supaya komponen yang menerimanya lewat Context (misalnya tombol yang memanggil `useToast().tampilkan(...)` di `onClick`) tidak perlu re-render setiap kali `ToastProvider` sendiri dirender.",
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
      p(
        'Ada **dua tingkat pengumuman** di sini, dan keduanya perlu. Wadah luar memakai `aria-live="polite"` dan, sesuai komentarnya, harus sudah ada di DOM sejak awal meski daftarnya kosong, sebab pembaca layar hanya memantau wilayah yang sudah ia kenali. Tiap toast lalu diberi `role` sendiri sesuai nadanya, yaitu `status` untuk kabar biasa yang boleh menunggu dan `alert` untuk kegagalan yang **menyela** pembacaan berjalan. Perbedaan itu penting karena menyela pengguna untuk pesan "Tersimpan" sama menganggunya seperti tidak mengumumkan kegagalan sama sekali. `aria-atomic="false"` melengkapinya, sebab hanya toast yang baru muncul yang dibacakan, bukan seluruh isi wadah diulang dari awal. Perhatikan juga tombol tutupnya memakai ikon ber-`aria-hidden` berpasangan dengan `<span className="sr-only">`, karena ikon tidak punya nama yang bisa dibacakan, jadi namanya disediakan teks tersembunyi.',
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
      p(
        'Empat handler ini datang berpasangan karena mereka melayani **dua cara berinteraksi yang berbeda**, dan melupakan salah satunya membuat fiturnya setengah jalan. `onMouseEnter`/`onMouseLeave` menangani pengguna yang mengarahkan kursor untuk membaca pesan yang lebih panjang. `onFocus`/`onBlur` menangani pengguna keyboard yang menekan Tab ke tombol "Batalkan" di dalam toast — tanpa keduanya, toast bisa menghilang tepat saat ia hendak menekan Enter. Ini penerapan dari aturan yang lebih umum: apa pun yang bisa dilakukan dengan mouse harus punya padanan keyboard, dan itu termasuk hal yang tidak terlihat seperti menahan timer.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi menampilkan pemberitahuan kecil di pojok kanan bawah setiap kali sesuatu berhasil disimpan. Setelah dipakai, tiga laporan masuk. Pengguna pembaca layar tidak pernah tahu penyimpanannya berhasil. Pemberitahuan galat hilang setelah tiga detik sebelum sempat dibaca. Dan saat pengguna menyimpan sepuluh kali cepat, sepuluh kotak menumpuk sampai menutupi tombol yang sedang ia pakai.',
      ),
      p(
        'Ketiganya berasal dari memperlakukan seluruh pemberitahuan sama. Yang membedakan bukan tampilannya melainkan **seberapa mendesak** isinya, dan itu menentukan cara pengumumannya.',
      ),
      table(
        ['Jenis', 'Peran ARIA', 'Kapan diumumkan', 'Boleh hilang sendiri?'],
        [
          [
            'Berhasil disimpan',
            '`status`',
            'Setelah bacaan sekarang selesai',
            'Ya, sekitar 4 detik',
          ],
          [
            'Gagal menyimpan',
            '`alert`',
            '**Memotong** bacaan sekarang',
            '**Tidak.** Harus ditutup pengguna',
          ],
          ['Kemajuan unggahan', '`status`', 'Setelah bacaan sekarang selesai', 'Ya, saat selesai'],
          ['Konfirmasi hapus', 'Bukan toast', 'Dialog, bukan pemberitahuan', 'Tidak berlaku'],
        ],
        'Kegagalan yang menuntut tindakan tidak boleh hilang sendiri.',
      ),
      code(
        'tsx',
        `
        // Wadahnya dipasang SEKALI di akar aplikasi, dan tidak pernah dilepas.
        // Wilayah live harus SUDAH ADA di DOM sebelum isinya berubah,
        // kalau tidak, pembaca layar tidak mengumumkan apa pun.
        export function WadahToast({ daftar, onTutup }: WadahProps) {
          return (
            <>
              {/* Untuk pesan biasa. Diumumkan setelah bacaan sekarang selesai. */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="toast-wadah"
              >
                {daftar
                  .filter((t) => t.jenis !== 'galat')
                  .map((t) => (
                    <Toast key={t.id} toast={t} onTutup={() => onTutup(t.id)} />
                  ))}
              </div>

              {/* Untuk galat. Memotong bacaan yang sedang berlangsung. */}
              <div role="alert" aria-live="assertive" className="toast-wadah">
                {daftar
                  .filter((t) => t.jenis === 'galat')
                  .map((t) => (
                    <Toast key={t.id} toast={t} onTutup={() => onTutup(t.id)} />
                  ))}
              </div>
            </>
          );
        }
        `,
        { filename: 'src/ui/WadahToast.tsx' },
      ),
      p(
        'Dua wadah terpisah adalah bagian yang paling sering keliru. Nilai `aria-live` tidak bisa diubah setelah wilayahnya dibuat dan diharapkan langsung berlaku, sehingga satu wadah yang nilainya berganti-ganti tidak bekerja dengan andal. Memisahkan sejak awal membuat pesan biasa menunggu giliran, sedangkan galat memotong bacaan yang sedang berlangsung.',
      ),
      p(
        'Kalimat bahwa wadahnya harus sudah ada di DOM sebelum isinya berubah itu bukan detail kecil. Kalau kamu merender wadah `aria-live` **bersamaan** dengan pesan pertamanya, sebagian pembaca layar tidak mengumumkan apa pun sebab wilayah itu baru saja lahir. Pasang wadah kosongnya di akar aplikasi sejak awal, lalu isinya yang berubah.',
      ),
      code(
        'tsx',
        `
        function Toast({ toast, onTutup }: { toast: Toast; onTutup: () => void }) {
          const timerRef = useRef<number | null>(null);

          useEffect(() => {
            // Galat TIDAK hilang sendiri. Pengguna yang menutupnya.
            if (toast.jenis === 'galat') return;

            timerRef.current = window.setTimeout(onTutup, 4000);
            return () => {
              if (timerRef.current !== null) clearTimeout(timerRef.current);
            };
          }, [toast.jenis, onTutup]);

          function tahan() {
            if (timerRef.current !== null) clearTimeout(timerRef.current);
          }

          function lanjut() {
            if (toast.jenis === 'galat') return;
            timerRef.current = window.setTimeout(onTutup, 4000);
          }

          return (
            <div
              className={\`toast toast-\${toast.jenis}\`}
              // Hitung mundur berhenti saat pengguna mengarahkan kursor
              // atau memfokusnya dengan keyboard.
              onMouseEnter={tahan}
              onMouseLeave={lanjut}
              onFocus={tahan}
              onBlur={lanjut}
            >
              <p>{toast.pesan}</p>
              <button type="button" onClick={onTutup} aria-label="Tutup pemberitahuan">
                &times;
              </button>
            </div>
          );
        }
        `,
        { filename: 'src/ui/Toast.tsx' },
      ),
      p(
        'Penangan `onMouseEnter` dan `onFocus` yang menghentikan hitung mundur menutup masalah yang sangat nyata. Pengguna yang sedang membaca pemberitahuan panjang atau sedang mengarahkan kursor ke tombol di dalamnya akan kehilangan keduanya kalau waktunya habis. Ini termasuk kriteria WCAG tentang isi yang bergerak, yaitu pengguna harus bisa menghentikan atau memperpanjangnya.',
      ),
      p(
        'Tombol tutup diberi `aria-label` karena isinya hanya tanda silang, dan itu bukan teks yang berarti bagi pembaca layar. Ini bentuk yang sama dengan tombol ikon di sub-bab tombol, dan ia muncul lagi di sini karena tombol tutup adalah salah satu tombol ikon yang paling sering dipakai sekaligus paling sering lupa diberi nama.',
      ),
      callout(
        'danger',
        'Jangan pernah memakai toast untuk kegagalan yang menuntut tindakan',
        'Pesan yang hilang setelah empat detik tidak cocok untuk memberi tahu bahwa pembayaran gagal atau data tidak tersimpan. Pengguna yang sedang melihat ke tempat lain akan melewatkannya sepenuhnya, dan tidak ada cara mengulangnya. Untuk kegagalan yang penting, pakai pesan yang menetap di dekat tempat kejadiannya, bukan toast.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada pemberitahuan, dan tiga di antaranya hanya terasa oleh pengguna pembaca layar.',
      ),
      code(
        'text',
        `
        {toast ? <div role="status">{toast.pesan}</div> : null}

        // Wadah dan isinya muncul BERSAMAAN.
        // Sebagian pembaca layar tidak mengumumkan apa pun.
        `,
        { caption: 'Wilayah live baru lahir bersama isinya.' },
      ),
      p(
        'Pembaca layar mengamati perubahan **di dalam** wilayah live yang sudah ada. Kalau wilayahnya sendiri yang baru muncul, tidak ada perubahan yang teramati. Perbaikannya merender wadah kosongnya sejak awal di akar aplikasi, lalu hanya isinya yang berubah. Ini kesalahan yang tidak terlihat sama sekali secara visual, sebab kotaknya tetap muncul di layar.',
      ),
      code(
        'text',
        `
        <div role="alert">{pesan}</div>
        // dipakai untuk pesan "Tersimpan"

        // Pembaca layar MEMOTONG apa pun yang sedang dibaca pengguna.
        `,
        { caption: 'Peran yang terlalu mendesak untuk pesan biasa.' },
      ),
      p(
        'Peran `alert` memotong bacaan yang sedang berlangsung, dan itu tepat untuk kegagalan yang mendesak. Memakainya untuk pemberitahuan berhasil berarti setiap penyimpanan otomatis akan memotong pengguna yang sedang membaca isi halaman. Pakai `status` dengan `aria-live="polite"` untuk pesan yang bisa menunggu, dan sisakan `alert` untuk yang benar-benar mendesak.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          setTimeout(onTutup, 4000);
        }, []);

        // Pengguna menutup manual sebelum 4 detik.
        // Timer tetap jalan dan menutup toast BERIKUTNYA.
        `,
        { caption: 'Timer tidak dibersihkan saat komponen dilepas.' },
      ),
      p(
        'Gejalanya khas dan membingungkan, yaitu pemberitahuan berikutnya hilang jauh lebih cepat dari seharusnya. Penyebabnya timer dari toast yang sudah ditutup masih hidup dan memanggil penutupnya. Fungsi pembersih di `useEffect` yang memanggil `clearTimeout` menutupnya, dan ini pola yang berlaku untuk seluruh timer di React.',
      ),
      code(
        'text',
        `
        // Pengguna menyimpan 10 kali cepat.
        // 10 toast menumpuk dan menutupi tombol di pojok.
        `,
        { caption: 'Tidak ada batas jumlah dan tidak ada penggabungan.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah kegunaannya. Ada dua pola yang menyelesaikannya. Pertama, batasi jumlah yang ditampilkan misalnya tiga, dan buang yang paling lama saat ada yang baru. Kedua, gabungkan pesan yang sama, misalnya menampilkan tersimpan beserta angka berapa kali alih-alih sepuluh kotak terpisah.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Pembaca layar tidak mengumumkan apa pun',
            'Wilayah live lahir bersama isinya',
            'Render wadah kosongnya sejak awal di akar aplikasi',
          ],
          [
            'Bacaan pengguna terpotong untuk pesan biasa',
            'Peran `alert` dipakai untuk yang tidak mendesak',
            'Pakai `status` dengan `aria-live="polite"`',
          ],
          [
            'Pemberitahuan berikutnya hilang terlalu cepat',
            'Timer tidak dibersihkan saat dilepas',
            'Panggil `clearTimeout` di fungsi pembersih',
          ],
          [
            'Pemberitahuan menumpuk menutupi antarmuka',
            'Tidak ada batas jumlah',
            'Batasi jumlahnya, atau gabungkan pesan yang sama',
          ],
          [
            'Pengguna melewatkan pesan galat penting',
            'Galat memakai toast yang hilang sendiri',
            'Pakai pesan menetap di dekat tempat kejadiannya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Toast terlihat sebagai komponen sederhana dan justru punya kebutuhan aksesibilitas yang paling mudah salah, sebab kesalahannya tidak terlihat sama sekali di layar.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Merender wadah `aria-live` hanya saat ada pesan',
            'Tidak perlu elemen kosong di DOM',
            'Pembaca layar tidak mengumumkan apa pun sebab wilayahnya baru lahir. Render wadah kosongnya sejak awal',
          ],
          [
            'Memakai `role="alert"` untuk semua pemberitahuan',
            'Supaya pasti terdengar',
            'Ia memotong bacaan pengguna setiap kali. Sisakan untuk yang benar-benar mendesak',
          ],
          [
            'Membuat galat hilang sendiri setelah beberapa detik',
            'Konsisten dengan pesan lain',
            'Pengguna yang melihat ke tempat lain melewatkannya, dan tidak ada cara mengulangnya',
          ],
          [
            'Tidak menghentikan hitung mundur saat kursor diarahkan',
            'Waktunya sudah cukup untuk membaca',
            'Pengguna yang membaca lambat atau sedang mengarahkan kursor ke tombol di dalamnya kehilangan keduanya',
          ],
          [
            'Menaruh tombol aksi di dalam toast yang hilang sendiri',
            'Supaya bisa langsung urungkan',
            'Tombolnya hilang sebelum sempat ditekan. Kalau ada aksi, perpanjang waktunya jauh atau jangan hilangkan sendiri',
          ],
          [
            'Menampilkan toast di pojok yang menutupi tombol tetap',
            'Pojok kanan bawah kan standar',
            'Ia bisa menutupi tombol aksi mengambang atau bilah navigasi bawah di ponsel. Sesuaikan posisinya per lebar layar',
          ],
        ],
      ),
      p(
        'Baris kelima sering terjadi pada pola urungkan yang populer, yaitu menampilkan pesan terhapus beserta tombol urungkan yang hilang setelah lima detik. Kalau tombolnya memang ada, waktu tunggunya harus jauh lebih panjang dan hitung mundurnya harus berhenti saat pengguna mengarahkan kursor. Tanpa keduanya, fitur urungkan itu hanya berguna bagi orang yang kebetulan sedang melihat ke sana.',
      ),
      callout(
        'tip',
        'Uji dengan pembaca layar bawaan sistem, gratis dan sudah terpasang',
        'macOS punya VoiceOver dengan Cmd+F5, Windows punya Narrator dengan Ctrl+Windows+Enter, dan Android punya TalkBack. Nyalakan salah satunya lalu picu pemberitahuanmu. Sepuluh detik itu memberi tahu apakah pesannya benar-benar sampai, dan tidak ada cara lain memastikannya.',
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
    26,
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
      p(
        'Kedua versi bisa dibuat **terlihat sama persis** dengan CSS grid, dan itulah kenapa versi `<div>` begitu umum. Yang tidak ikut tersalin adalah **hubungan antar-selnya**. Pada versi tabel, `<th scope="col">` menyatakan bahwa "Email" adalah judul kolomnya, sehingga pembaca layar bisa mengumumkan nama kolom itu setiap kali penggunanya berpindah ke sel di bawahnya. Elemen `<thead>` dan `<tbody>` melengkapinya dengan memisahkan judul dari isi. Semua informasi itu tidak punya padanan di `<div>` — bukan karena atributnya kurang, tapi karena tidak ada struktur baris-kolom yang bisa dirujuk. Akibatnya seperti dijelaskan di kotak berikut: pengguna hanya mendengar deretan teks tanpa tahu nilai mana milik kolom mana.',
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
      p(
        'Dua detail struktural di atas mudah terlewat tapi menentukan seberapa terbaca tabel ini bagi pembaca layar. Pertama, `<caption>` diberi class `sr-only`, artinya tetap ada di DOM dan tetap dibacakan sebagai judul tabel, hanya tidak tampil secara visual, karena judul kolom di `<thead>` sudah cukup menjelaskan tabelnya secara visual. Kedua, sel pertama tiap baris ditulis sebagai `<th scope="row">` dan bukan `<td>`, sehingga ia berfungsi sebagai **header baris**. Saat pengguna screen reader berpindah ke sel `{b.email}` di baris "Zum", pembaca layar mengumumkan "Email, a@b.c, baris Zum" karena `scope="row"` menghubungkan nilai sel ke nama di headernya, persis seperti `scope="col"` menghubungkan sel ke judul kolomnya. Fungsi `ariaSort` sendiri menerjemahkan state pengurutan internal (`sort.kolom`, `sort.arah` bernilai `\'asc\'`/`\'desc\'`) ke tiga nilai yang dipahami `aria-sort`, dan kolom yang bukan dasar pengurutan saat ini selalu mendapat `\'none\'`, bukan ikut nilai `sort.arah` yang sebenarnya berlaku untuk kolom lain.',
      ),

      h2('Memisahkan state tabel dari tampilannya'),
      code(
        'tsx',
        `
        // Pure function — bisa diuji tanpa React sama sekali
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
      p(
        'Perhatikan urutan tiga operasi di dalam `olahBaris`, yaitu **cari dulu, baru urutkan, baru potong per halaman**, dan bukan urutan lain. Kalau paginasi dilakukan sebelum pencarian, hasil pencarian bisa "hilang" begitu saja karena ia berada di halaman yang sudah terpotong duluan. Fungsi filter-nya sendiri (`Object.values(b as object).some(...)`) mencari kata kunci di **semua** kolom sekaligus dan bukan satu kolom tertentu. Itu sebabnya ia mengubah tiap baris jadi array nilainya lebih dulu lewat `Object.values`, lalu memeriksa apakah ada satu nilai saja yang cocok lewat `.some()`. Karena `olahBaris` tidak menyentuh `useState` atau elemen DOM apa pun dan murni menerima data serta opsi lalu mengembalikan hasilnya, fungsi ini bisa diuji dengan array data biasa tanpa perlu merender komponen tabel sama sekali, persis seperti fungsi `saring` dan `reducer` yang dibahas di Bab 4 dan 5.',
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
      p(
        'Baris "Menampilkan 1–20 dari 143" diberi `aria-live="polite"` karena isinya berubah setiap kali tombol Sebelumnya/Berikutnya ditekan, tapi elemennya sendiri **tidak pernah berpindah posisi** — pengguna keyboard yang baru saja menekan "Berikutnya" tetap berada di tombol itu, dan `aria-live` yang mengabarkan bahwa isi tabel sudah berganti tanpa memaksa fokus berpindah kemana pun. Ini pola yang sama dengan wilayah `aria-live` pada Toast di sub-bab sebelumnya: elemen pengumumnya sudah ada di DOM sejak awal, hanya isinya yang berubah.',
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
      p(
        'Empat keadaan UI yang wajib ada di setiap tampilan berdata (Bab 4 Frontend Intermediate) berlaku sama persis di dalam sebuah tabel, dan bedanya hanya bentuknya menyesuaikan struktur `<table>`. Baris kosong ditulis sebagai satu `<tr>` berisi satu `<td colSpan={kolom.length}>` yang membentang selebar seluruh kolom dan bukan satu `<td>` kosong per kolom. Kalau tidak, pesan "Belum ada data" akan terpotong sempit di kolom pertama saja. Perhatikan juga pesan kosongnya dibedakan menjadi dua kasus, yaitu "Tidak ada hasil untuk ..." saat pengguna sedang mencari sesuatu, dan "Belum ada data" saat tabelnya memang kosong dari awal. Keduanya adalah situasi yang terasa sama bagi kode tapi berbeda maknanya bagi pengguna.',
      ),

      h2('Di layar kecil'),
      ul(
        '**Scroll horizontal di dalam wadahnya** (`scroll-x` + `min-w-*`) — jangan biarkan halaman ikut bergeser.',
        'Atau ubah jadi daftar kartu di bawah `md:` — tiap baris jadi satu kartu dengan label kolom di dalamnya.',
        'Jangan menyembunyikan kolom penting tanpa cara melihatnya kembali.',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Tabel pesanan di panel admin menampilkan tiga ribu baris dengan pengurutan, pemilihan baris, dan aksi per baris. Setelah dipasang, empat laporan masuk. Halaman butuh empat detik untuk bisa diklik. Mengurutkan kolom membuat centang pilihan berpindah ke baris yang salah. Pengguna pembaca layar tidak tahu kolom mana yang sedang diurutkan. Dan di ponsel, tabelnya terpotong tanpa cara menggulirnya.',
      ),
      p(
        'Keempatnya punya penyebab yang berbeda, dan yang pertama sering disalahartikan sebagai masalah React padahal bukan.',
      ),
      code(
        'tsx',
        `
        export function TabelPesanan({ data, urut, onUrut }: Props) {
          return (
            // Pembungkus yang bisa digulir, dan bisa difokus keyboard.
            <div className="tabel-gulir" tabIndex={0} role="region" aria-label="Tabel pesanan">
              <table>
                <caption className="sr-only">
                  Daftar pesanan, {data.length} baris
                </caption>

                <thead>
                  <tr>
                    <th scope="col">
                      <input type="checkbox" aria-label="Pilih semua baris" />
                    </th>

                    {KOLOM.map((k) => {
                      const aktif = urut.kunci === k.kunci;
                      return (
                        <th
                          key={k.kunci}
                          scope="col"
                          // Inilah yang memberi tahu pembaca layar arah pengurutan.
                          aria-sort={aktif ? (urut.arah === 'naik' ? 'ascending' : 'descending') : 'none'}
                        >
                          <button type="button" onClick={() => onUrut(k.kunci)}>
                            {k.judul}
                            <IkonUrut arah={aktif ? urut.arah : null} aria-hidden="true" />
                          </button>
                        </th>
                      );
                    })}

                    <th scope="col">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((p) => (
                    // key memakai id pesanan, BUKAN indeks.
                    <tr key={p.id}>
                      <td>
                        <input type="checkbox" aria-label={\`Pilih pesanan \${p.nomor}\`} />
                      </td>
                      <th scope="row">{p.nomor}</th>
                      <td>{p.pembeli}</td>
                      <td>{formatRupiah(p.totalSen)}</td>
                      <td>
                        <button type="button" data-aksi="batalkan" data-id={p.id}>
                          Batalkan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        `,
        { filename: 'src/admin/TabelPesanan.tsx' },
      ),
      p(
        'Atribut `aria-sort` pada kepala kolom menutup laporan ketiga, dan ia satu-satunya cara menyampaikan arah pengurutan ke pembaca layar. Ikon panah yang terlihat diberi `aria-hidden` sebab ia hiasan, dan yang membawa informasinya adalah atributnya. Perhatikan hanya **satu** kolom yang boleh bernilai selain `none` pada satu waktu.',
      ),
      p(
        'Elemen `th` dengan `scope="row"` pada nomor pesanan sering dilewatkan padahal sangat berpengaruh. Ia menandai kolom mana yang menjadi penanda tiap baris, sehingga pembaca layar bisa mengumumkan konteks saat pengguna berpindah sel. Tanpa itu, pengguna mendengar deretan angka tanpa tahu angka itu milik pesanan yang mana.',
      ),
      p(
        'Pembungkus yang bisa digulir diberi `tabIndex={0}` supaya pengguna keyboard bisa menggulirnya, dan itu menutup laporan keempat. Elemen yang bisa digulir tapi tidak punya isi yang bisa difokus tidak bisa digulir dengan panah keyboard. Atribut `role="region"` beserta namanya membuatnya juga muncul sebagai tempat yang bisa dituju pengguna pembaca layar.',
      ),
      code(
        'tsx',
        `
        // Laporan pertama: tiga ribu baris membuat halaman lambat.
        // Penyebabnya BUKAN React, melainkan tiga ribu x 5 = 15.000 elemen DOM.

        // Jalan keluar 1 — paginasi. Paling sederhana, dan hampir selalu cukup.
        const potongan = data.slice((halaman - 1) * 50, halaman * 50);

        // Jalan keluar 2 — virtualisasi. Hanya render yang terlihat di layar.
        // Dipakai kalau memang harus satu daftar panjang tanpa halaman.

        // Yang TIDAK menolong: membungkus baris dengan pengoptimalan React.
        // Biayanya ada di jumlah elemen DOM, bukan di jumlah render.
        `,
        { caption: 'Ukur dulu di tab Performance sebelum memilih jalan keluarnya.' },
      ),
      p(
        'Kalimat terakhir itu yang paling sering keliru. Orang menaburkan pembungkus pengoptimalan ke komponen baris lalu heran halamannya tetap lambat. Biaya membuat lima belas ribu elemen DOM tidak berkurang sedikit pun oleh pengoptimalan render. Yang menolong hanya mengurangi jumlah elemennya, dan paginasi adalah cara termudah yang juga lebih enak dipakai.',
      ),
      p(
        'Laporan kedua, yaitu centang yang berpindah saat diurutkan, adalah bug `key` yang sudah dibahas di Sub-bab 2.6. Kalau `key` memakai indeks, mengurutkan mengubah posisi sehingga React menyimpulkan baris di posisi nol berubah isinya dan mempertahankan elemennya beserta keadaan centangnya. Memakai id pesanan menutupnya sepenuhnya.',
      ),
      callout(
        'warning',
        'Jangan membangun tabel dari `div` dengan `role="table"`',
        'Sebagian pustaka menyarankan itu supaya tata letaknya lebih bebas. Konsekuensinya, seluruh perilaku navigasi tabel di pembaca layar harus dibangun ulang lewat `role` yang lengkap dan hampir selalu ada yang terlewat. Elemen `table` sungguhan memberi navigasi antar-sel, pengumuman kepala kolom, dan hitungan baris secara bawaan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada tabel data, dan dua di antaranya hanya terasa oleh pengguna pembaca layar.',
      ),
      code(
        'text',
        `
        {data.map((p, i) => <tr key={i}>...</tr>)}

        // Pengguna mencentang baris ke-3, lalu mengurutkan kolom.
        // Centangnya sekarang berada di baris yang berbeda.
        `,
        { caption: 'Indeks dipakai sebagai `key` pada daftar yang bisa diurutkan.' },
      ),
      p(
        'Tidak ada error, dan datanya sendiri benar. Yang salah adalah pencocokan elemen, sehingga keadaan yang hidup di dalam elemen DOM ikut tertinggal di posisi lama. Selain centang, hal yang sama terjadi pada kotak input di dalam baris, baris yang sedang disorot, dan animasi yang sedang berjalan. Pakai id yang melekat pada datanya.',
      ),
      code(
        'text',
        `
        <th onClick={() => onUrut('nomor')}>Nomor</th>

        // Pengguna keyboard tidak bisa mengurutkan.
        // Pembaca layar tidak tahu kolom ini bisa diklik.
        `,
        { caption: 'Penangan klik dipasang pada `th`, bukan pada tombol di dalamnya.' },
      ),
      p(
        'Elemen `th` bukan elemen interaktif, sehingga ia tidak bisa difokus dan tidak menanggapi Enter. Ini bentuk yang sama dengan memakai `div` sebagai tombol dari sub-bab tombol. Perbaikannya menaruh `button` di dalam `th`, dan itu juga yang membuat pembaca layar mengumumkannya sebagai tombol yang bisa ditekan.',
      ),
      code(
        'text',
        `
        <th aria-sort="ascending">Nomor</th>
        <th aria-sort="ascending">Total</th>

        // Dua kolom mengaku sedang diurutkan naik.
        // Pembaca layar mengumumkan keduanya, dan penggunanya bingung.
        `,
        { caption: 'Lebih dari satu kolom bernilai selain `none`.' },
      ),
      p(
        'Hanya satu kolom yang boleh punya nilai `aria-sort` selain `none` pada satu waktu, sebab tabel memang hanya bisa diurutkan berdasarkan satu kolom. Kesalahan ini terjadi saat nilainya disetel tetap di markup alih-alih dihitung dari state pengurutan. Bentuk pada studi kasus menghitungnya dari `urut.kunci`, sehingga hanya kolom aktif yang bernilai selain `none`.',
      ),
      code(
        'text',
        `
        // Tabel lebih lebar dari layar ponsel.
        // Pembungkusnya punya overflow-x: auto, tanpa tabIndex.

        // Pengguna keyboard tidak bisa menggulirnya ke kanan.
        `,
        { caption: 'Area yang bisa digulir tidak bisa difokus.' },
      ),
      p(
        'Peramban hanya menggulir area yang sedang mendapat fokus atau yang berisi elemen terfokus. Kalau seluruh isi tabelmu berupa teks tanpa elemen yang bisa difokus, tidak ada cara mencapai area gulirnya dengan keyboard. Menambahkan `tabIndex={0}` pada pembungkusnya menyelesaikannya, dan menambahkan `role="region"` beserta nama membuatnya juga bisa dituju pengguna pembaca layar.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Centang berpindah baris setelah diurutkan',
            'Indeks dipakai sebagai `key`',
            'Pakai id yang melekat pada datanya',
          ],
          [
            'Kolom tidak bisa diurutkan dengan keyboard',
            'Penangan klik dipasang pada `th`',
            'Taruh `button` di dalam `th`',
          ],
          [
            'Pembaca layar menyebut dua kolom sedang diurutkan',
            '`aria-sort` disetel tetap, bukan dihitung',
            'Hitung dari state pengurutan, dan hanya satu yang aktif',
          ],
          [
            'Tabel terpotong dan tidak bisa digulir keyboard',
            'Pembungkus gulir tidak bisa difokus',
            'Tambahkan `tabIndex={0}` dan `role="region"` beserta nama',
          ],
          [
            'Halaman lambat pada ribuan baris',
            'Jumlah elemen DOM, bukan jumlah render',
            'Paginasi, atau virtualisasi. Pengoptimalan render tidak menolong',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Tabel data adalah komponen paling rumit di bab ini, dan sebagian besar kesalahan di bawah berasal dari mengabaikan apa yang sudah diberikan elemen `table`.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membangun tabel dari `div`',
            'Tata letaknya lebih bebas dengan grid',
            'Kehilangan navigasi antar-sel, pengumuman kepala kolom, dan hitungan baris. Semuanya harus dibangun ulang lewat `role`',
          ],
          [
            'Memakai indeks sebagai `key` pada baris',
            'Barisnya kan berurutan',
            'Mengurutkan dan menyaring mengubah posisi, sehingga keadaan di dalam baris berpindah',
          ],
          [
            'Melupakan `scope` pada `th`',
            'Kepala kolomnya sudah jelas',
            'Pembaca layar tidak tahu sebuah `th` menjelaskan kolom atau baris. Tulis `scope="col"` dan `scope="row"`',
          ],
          [
            'Merender ribuan baris sekaligus',
            'Datanya memang sebanyak itu',
            'Peramban harus membuat puluhan ribu elemen. Paginasi hampir selalu cukup dan lebih enak dipakai',
          ],
          [
            'Menaburkan pengoptimalan React untuk memperbaiki kelambatan',
            'Rendernya kan yang lambat',
            'Biayanya ada di jumlah elemen DOM. Ukur di tab Performance sebelum mengubah apa pun',
          ],
          [
            'Menaruh aksi per baris tanpa nama yang membedakan',
            'Tombolnya sudah jelas di barisnya',
            'Pembaca layar mendengar dua puluh tombol bernama Batalkan tanpa tahu milik pesanan mana. Sertakan penandanya di `aria-label`',
          ],
        ],
      ),
      p(
        'Baris terakhir punya perbaikan yang murah dan sering dilewatkan. Tombol bernama Batalkan yang berulang dua puluh kali tidak berarti apa-apa saat pengguna menelusuri daftar tombol di halaman. Menambahkan nomor pesanannya ke `aria-label`, misalnya batalkan pesanan INV-0042, membuat tiap tombol punya identitas. Ini juga berlaku untuk centang pilihan per baris.',
      ),
      callout(
        'tip',
        'Urutan memperbaiki tabel yang lambat',
        'Rekam di tab Performance lebih dulu dan lihat ke mana waktunya habis. Kalau habis di pembuatan elemen, kurangi jumlah barisnya lewat paginasi. Kalau habis di perhitungan seperti pengurutan atau penyaringan, pindahkan ke server atau bungkus dengan `useMemo`. Kalau habis di penggambaran ulang berulang, barulah pengoptimalan render relevan. Menebak urutan ini hampir selalu salah.',
      ),
      divider,
      h2('Rangkuman'),
      ul(
        'Pakai `<table>` asli — `<div>` menghapus navigasi tabel sepenuhnya.',
        '`scope="col"`, `scope="row"`, dan `<caption>` memberi konteks di tiap sel.',
        '`aria-sort` pada header yang bisa diurutkan.',
        'Logika sort/filter/paginasi sebagai pure function yang bisa diuji.',
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
    22,
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
      p(
        'Ketiga boolean di baris pertama sebenarnya menjawab **satu pertanyaan yang sama**, yaitu alert ini nadanya apa. Karena jawabannya hanya boleh satu, menyatakannya sebagai tiga boolean terpisah membuka kombinasi yang tidak punya arti, dan komponennya terpaksa memilih pemenangnya lewat urutan `if` yang tidak pernah tertulis di mana pun. Union tipe literal menutup celah itu di tingkat tipe, sebab `nada` hanya menerima satu dari tiga nilai, sehingga dua nada sekaligus **tidak bisa dituliskan**. Keuntungan sampingannya sudah dibahas di Bab 6, sebab editor kini menampilkan ketiga pilihannya saat kamu mengetik, sesuatu yang tidak mungkin diberikan sekumpulan boolean.',
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
      p(
        'Perhatikan `onTutup?: never` di cabang kedua, karena inilah yang membuat kombinasi "bisaDitutup salah tapi onTutup tetap diisi" menjadi error. Kalau `bisaDitutup` bernilai `true`, TypeScript mewajibkan `onTutup` diisi, sedangkan kalau `bisaDitutup` tidak ada atau `false`, `onTutup` tidak boleh diisi sama sekali alih-alih sekadar diabaikan diam-diam. Pola ini memaksa kedua prop itu selalu konsisten, tanpa perlu validasi manual saat program berjalan.',
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
      p(
        'Perhatikan pola berpasangan di baris "Sebelum", yaitu `hasIcon` dengan `ikon`, dan `adaAksi` dengan `aksi`. Boolean-nya selalu bisa disimpulkan dari keberadaan pasangannya, jadi ia menambah kemungkinan salah tanpa menambah kemampuan. Composition menghapus keduanya sekaligus, sebab bagian yang ada ditulis dan yang tidak ada tidak ditulis, sehingga **keberadaannya sudah menjadi jawabannya**. Keuntungan yang lebih besar muncul belakangan, karena susunannya kini milik pemanggil, sehingga menaruh dua tombol aksi atau menyisipkan sesuatu di antara pesan dan aksi tidak menuntut prop baru maupun perubahan pada `Alert`.',
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
      p(
        'Ini perbaikan yang paling sering ditolak karena terasa seperti duplikasi, padahal yang sebenarnya terjadi kebalikannya. Komentar di baris kedua menyebutkan alasannya, sebab drawer dan modal berbeda pada animasi, posisi, **dan perilaku keyboard**, sehingga `Modal` dengan `isDrawer` sebenarnya berisi dua komponen yang bercampur di dalam satu fungsi, dipisahkan oleh percabangan di setiap tempat yang berbeda. Memecahnya membuat masing-masing lebih pendek dan lebih mudah dibaca daripada versi gabungannya. Cara mengenali kasus ini cukup sederhana. Kalau sebuah boolean mengubah **struktur** yang dirender dan bukan sekadar warna, ukuran, atau spasi, ia hampir selalu penanda dua komponen yang menyamar jadi satu.',
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
      p(
        'Keempatnya lolos uji satu kalimat di kotak berikut, dan komentarnya menandai kenapa. Dua yang pertama adalah **keadaan HTML asli**, sebab `disabled` dan `required` memang boolean di spesifikasi, jadi menirunya justru membuat komponenmu terasa seperti elemen bawaan. `terbuka` punya tepat dua keadaan yang tidak bergantung pada prop lain, yaitu dialog sedang tampil atau tidak, tidak ada kemungkinan ketiga. Dan `tunggal` mengatur **aturan perilaku** dan bukan tampilan, sebab ia menentukan apakah membuka satu panel menutup yang lain, dan itu memang pertanyaan ya-tidak. Bandingkan dengan `isDrawer` di perbaikan sebelumnya. Keduanya sama-sama boolean, tetapi yang satu mengubah aturan sedangkan yang lain mengubah struktur.',
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
          notes: ['Impossible state tidak bisa ditulis', 'Struktur terbaca'],
        },
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Peringatan` lahir dengan dua prop. Setahun kemudian ia menerima sebelas boolean, yaitu `info`, `sukses`, `galat`, `kecil`, `besar`, `garis`, `padat`, `bisaTutup`, `tanpaIkon`, `penuh`, dan `melayang`. Tim mencatat dua ribu empat puluh delapan kombinasi yang bisa ditulis, dan hanya sembilan yang pernah dipakai. Sisanya adalah keadaan yang tidak pernah dirancang dan tidak pernah diuji.',
      ),
      p(
        'Angka itu bukan retorika. Sebelas boolean berarti dua pangkat sebelas kombinasi, dan tiap satu boolean baru **menggandakan** jumlahnya.',
      ),
      table(
        ['Jumlah boolean', 'Kombinasi yang bisa ditulis', 'Yang biasanya berarti'],
        [
          ['3', '8', 'sekitar 4'],
          ['5', '32', 'sekitar 6'],
          ['8', '256', 'sekitar 8'],
          ['11', '**2.048**', '**9**'],
        ],
        'Yang tumbuh dua pangkat adalah ruang kesalahannya, bukan kemampuannya.',
      ),
      code(
        'tsx',
        `
        // SEBELUM: sebelas boolean, dua ribu kombinasi.
        type PeringatanProps = {
          info?: boolean; sukses?: boolean; galat?: boolean;
          kecil?: boolean; besar?: boolean;
          garis?: boolean; padat?: boolean;
          bisaTutup?: boolean; tanpaIkon?: boolean;
          penuh?: boolean; melayang?: boolean;
        };

        // Sah menurut tipe, dan tidak masuk akal:
        <Peringatan info sukses galat kecil besar />

        // SESUDAH: tiga union dan dua boolean yang benar-benar berdiri sendiri.
        type PeringatanProps = {
          nada?: 'info' | 'sukses' | 'galat' | 'peringatan';   // saling meniadakan
          ukuran?: 'kecil' | 'sedang' | 'besar';               // saling meniadakan
          gaya?: 'padat' | 'garis';                            // saling meniadakan
          bisaTutup?: boolean;                                 // berdiri sendiri, sah
          ikon?: ReactNode | false;                            // bawaan, atau matikan
        };

        // 4 x 3 x 2 x 2 = 48 kombinasi, dan SEMUANYA berarti.
        `,
        { caption: 'Dari 2.048 kombinasi menjadi 48, tanpa kehilangan satu pun kemampuan.' },
      ),
      p(
        'Aturan untuk memilih mana yang jadi union dan mana yang tetap boolean bisa dinyatakan satu kalimat, yaitu **kalau dua prop tidak boleh benar bersamaan, keduanya sebenarnya satu prop**. Nada tidak bisa info sekaligus galat. Ukuran tidak bisa kecil sekaligus besar. Sebaliknya `bisaTutup` tidak meniadakan apa pun, sehingga ia tetap boolean dan itu benar.',
      ),
      p(
        'Prop `ikon` menunjukkan pola ketiga yang sering berguna, yaitu mengganti boolean penolak dengan nilai yang bisa diisi. Prop bernama `tanpaIkon` hanya bisa menjawab ya atau tidak, sedangkan `ikon` bisa berarti tiga hal sekaligus, yaitu tidak diberikan berarti pakai ikon bawaan sesuai nada, diberi `false` berarti tanpa ikon, dan diberi elemen berarti pakai ikon itu. Satu prop menggantikan dua, dan kemampuannya justru bertambah.',
      ),
      code(
        'tsx',
        `
        // Nama berawalan "tanpa" atau "sembunyikan" hampir selalu tanda masalah.
        // Ia memaksa pembaca berpikir terbalik.

        <Peringatan tanpaIkon={false} />        // artinya... pakai ikon?
        <Kartu sembunyikanKepala={false} />     // artinya... tampilkan kepala?

        // Balik menjadi bentuk positif, dan bawaannya yang diatur.
        <Peringatan />                          // ikon bawaan
        <Peringatan ikon={false} />             // tanpa ikon
        <Kartu />                               // kepala tampil
        <Kartu kepala={null} />                 // tanpa kepala
        `,
        { caption: 'Prop bernama negatif menghasilkan penyangkalan ganda saat dibaca.' },
      ),
      p(
        'Bentuk `tanpaIkon={false}` menuntut pembaca menyangkal dua kali untuk sampai pada artinya, dan itu jenis kerumitan yang tidak perlu ada. Aturan praktisnya, namai prop dengan keadaan positif lalu atur bawaannya. Kalau bawaannya memang menampilkan sesuatu, sediakan cara mematikannya lewat nilai, bukan lewat boolean penolak.',
      ),
      callout(
        'tip',
        'Cara memeriksa komponen yang sudah lama hidup',
        'Hitung berapa boolean yang dimiliki komponenmu, lalu hitung dua pangkat sebanyak itu. Bandingkan dengan berapa tampilan yang sebenarnya kamu rancang. Kalau selisihnya besar, sebagian besar kombinasi itu tidak pernah diuji dan tidak ada yang tahu hasilnya seperti apa. Kelompokkan yang saling meniadakan menjadi union.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan `tsc` dan tipe React asli, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        type A = { kecil?: boolean; besar?: boolean };
        <TombolA kecil besar />

        // Diuji dengan tsc: TIDAK ADA ERROR.
        // Hasilnya bergantung pada urutan kelas CSS.
        `,
        { caption: 'Boolean bertumpuk tidak bisa saling meniadakan di tingkat tipe.' },
      ),
      p(
        'Tidak ada error, dan itu justru masalahnya. TypeScript tidak punya cara tahu bahwa `kecil` dan `besar` tidak boleh benar bersamaan, sebab keduanya prop terpisah yang sah. Hasil akhirnya ditentukan urutan kelas di berkas CSS, yaitu detail yang tidak seorang pun ingat. Dengan union, kombinasi itu tidak bisa ditulis sama sekali.',
      ),
      code(
        'text',
        `
        type B = { ukuran?: 'kecil' | 'besar' };
        <TombolB ukuran="sedang" />

        error TS2322: Type '"sedang"' is not assignable to type
        '"kecil" | "besar" | undefined'.
        `,
        { caption: 'Diuji dengan `tsc`. Union menolak nilai yang tidak dikenal.' },
      ),
      p(
        'Selain menolak, pesannya menyebut seluruh nilai yang sah sehingga perbaikannya tidak perlu membuka berkas tipenya. Manfaat lain yang terasa saat mengetik, editor akan menawarkan ketiga pilihannya begitu kamu mengetik `ukuran=`. Dengan boolean bertumpuk, tidak ada bantuan apa pun dan kamu harus mengingat nama-namanya.',
      ),
      code(
        'text',
        `
        <Peringatan info sukses />

        // Kelas yang dihasilkan: "peringatan-info peringatan-sukses"
        // Warna akhirnya ditentukan urutan di berkas CSS.
        // Mengubah urutan CSS mengubah tampilan komponen ini.
        `,
        { caption: 'Tidak ada error, dan hasilnya bergantung pada hal yang tidak berhubungan.' },
      ),
      p(
        'Ini bentuk ketergantungan yang paling sulit ditelusuri, sebab penyebabnya berada di berkas yang sama sekali berbeda. Seseorang merapikan urutan aturan CSS, dan tiba-tiba satu komponen di halaman lain berubah warna. Union menutupnya sepenuhnya sebab hanya satu kelas nada yang bisa dihasilkan.',
      ),
      code(
        'text',
        `
        <Peringatan tanpaIkon={false} bisaTutup={false} penuh={false} />

        // Tidak ada error. Tiga penyangkalan dalam satu baris,
        // dan pembaca berikutnya harus memikirkan artinya satu per satu.
        `,
        { caption: 'Prop bernama negatif menumpuk menjadi tidak terbaca.' },
      ),
      p(
        'Tidak ada error dan tidak ada bug, dan yang rusak adalah keterbacaannya. Kode seperti ini menuntut pembaca menyangkal tiga kali untuk memahami satu pemanggilan. Untuk komponen yang dipakai di dua puluh tempat, biaya itu dikalikan dua puluh setiap kali ada yang membacanya. Namai dengan bentuk positif, dan atur bawaannya.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Dua prop yang bertentangan diterima tanpa error',
            'Boolean terpisah tidak bisa saling meniadakan di tipe',
            'Kelompokkan menjadi satu union',
          ],
          [
            'Tampilan berubah setelah urutan CSS dirapikan',
            'Beberapa kelas nada aktif sekaligus',
            'Pastikan hanya satu kelas nada yang bisa dihasilkan',
          ],
          [
            'Salah ketik nama varian lolos tanpa peringatan',
            'Prop bertipe `string`, bukan union',
            'Pakai union teks',
          ],
          [
            'Pemanggilan sulit dibaca karena penyangkalan bertumpuk',
            'Prop dinamai dengan bentuk negatif',
            'Namai positif, lalu atur bawaannya',
          ],
          [
            'Komponen punya belasan prop yang tidak pernah dipakai bersama',
            'Prop ditambah tiap ada kebutuhan baru',
            'Kelompokkan yang saling meniadakan, dan pertimbangkan komposisi',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Ledakan prop boolean terjadi perlahan, satu prop pada satu waktu, sehingga tidak ada momen di mana keputusannya terasa salah. Baris di bawah adalah tanda-tandanya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambah satu boolean tiap ada varian tampilan baru',
            'Satu prop untuk satu kebutuhan, dan perubahannya kecil',
            'Jumlah kombinasi tumbuh dua pangkat. Sebelas boolean berarti dua ribu kombinasi yang sebagian besar tidak pernah diuji',
          ],
          [
            'Memakai `string` untuk varian supaya fleksibel',
            'Bisa menerima nilai apa pun nanti',
            'Salah ketik lolos tanpa peringatan dan menghasilkan kelas yang tidak ada. Pakai union',
          ],
          [
            'Menamai prop dengan bentuk negatif',
            'Bawaannya memang menampilkan, jadi propnya untuk mematikan',
            'Pembaca harus menyangkal dua kali. Namai positif dan atur bawaannya',
          ],
          [
            'Membiarkan kombinasi yang tidak masuk akal karena tidak pernah dipakai',
            'Tidak ada yang menulisnya',
            'Sampai ada yang menulisnya karena salah ketik atau salah paham, dan hasilnya tidak terduga',
          ],
          [
            'Mengelompokkan prop yang sebenarnya berdiri sendiri',
            'Katanya union lebih baik',
            '`bisaTutup` dan `penuh` tidak meniadakan apa pun. Memaksanya jadi union justru menghalangi kombinasi yang sah',
          ],
          [
            'Menyelesaikan ledakan prop dengan menambah komponen baru',
            'Supaya masing-masing sederhana',
            'Lahirlah `PeringatanKecil`, `PeringatanGalat`, dan seterusnya. Perbaikan pada satu tidak ikut ke yang lain',
          ],
        ],
      ),
      p(
        'Baris kelima layak diperhatikan supaya perbaikannya tidak berlebihan. Union hanya tepat untuk prop yang benar-benar **saling meniadakan**. Memaksa `bisaTutup` dan `penuh` menjadi satu union akan menghalangi kombinasi yang sah, yaitu peringatan yang bisa ditutup sekaligus selebar wadahnya. Ujinya sederhana, yaitu tanyakan apakah kedua nilai itu bisa benar bersamaan dan masuk akal.',
      ),
      callout(
        'info',
        'Ini penerapan gagasan yang sama dengan union bertanda pada state',
        'Membuat keadaan yang salah menjadi mustahil adalah pola yang sama dengan yang dipakai untuk empat keadaan tampilan di bab tentang state. Di sana ia mencegah keadaan sedang memuat sekaligus punya galat. Di sini ia mencegah tombol kecil sekaligus besar. Alat dan tempatnya berbeda, dan gagasannya satu.',
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
    26,
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
      p(
        'Perhatikan tiap kelompok token diberi komentar yang menyebut **kapan tiap nilai dipakai** alih-alih sekadar mendaftar angkanya, yakni "kecil untuk badge, sedang untuk kontrol, besar untuk panel". Tanpa keterangan itu, orang berikutnya akan menebak, dan sistemnya perlahan kehilangan keseragaman. Kelompok `--size-control-*` layak digarisbawahi karena hanya ada **dua** tinggi kontrol, dan komentarnya menyebut alasannya, yaitu supaya tombol, input, dan select yang bersebelahan pasti sejajar. Itu masalah yang tidak akan pernah selesai kalau tiap komponen menentukan tingginya sendiri. Kelompok motion pun ikut ditokenkan, sehingga semua transisi di seluruh sistem punya kurva dan durasi yang sama. Animasi yang terasa berbeda-beda antar komponen hampir selalu berasal dari nilai yang ditulis ad-hoc di tiap tempat.',
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
      p(
        'Versi SALAH tidak punya satu pun kesalahan teknis, sebab tiap baris masuk akal sendiri-sendiri, dan begitulah ketidakkonsistenan ini lahir. Tiga komponen ditulis pada waktu berbeda, masing-masing memilih nama yang terasa paling tepat saat itu. Ongkosnya baru terasa saat dipakai, sebab pemakainya harus mengingat bahwa "utama" disebut `variant="primary"` di tombol tapi `type="main"` di badge, dan setiap komponen baru berarti satu kosakata lagi untuk dihafal. Versi BENAR menyeragamkan **nama propnya dan nilainya sekaligus**, sehingga `varian="utama"` berarti hal yang sama di mana pun. Perhatikan `Alert` tetap memakai `nada` dan tidak dipaksa jadi `varian`, karena nada memang dimensi yang berbeda dari varian, dan menyeragamkan yang tidak sama justru menyesatkan.',
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
      p(
        "Struktur ini datar dengan sengaja, yaitu **satu berkas per komponen, tanpa folder per komponen**. Untuk primitif UI yang masing-masing berisi satu atau dua ekspor, folder bersarang hanya menambah langkah tanpa menambah kejelasan. Perhatikan nama berkasnya semuanya huruf kecil dan tunggal, sehingga impornya bisa ditebak tanpa membuka foldernya. Berkas `index.ts` di bawah adalah re-export yang membuat `import { Button, Badge } from '@/components/ui'` mungkin, dan seperti diperingatkan di kotak berikut, kemudahan itu ada harganya, sebab satu impor bisa menarik seluruh isi folder ke bundle. Untuk folder `ui/` yang komponennya kecil dan hampir selalu dipakai bersama, itu pertukaran yang wajar, sedangkan untuk folder besar impor langsung ke berkasnya lebih tepat.",
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
      p(
        'Perhatikan dua `<section>` yang isinya berbeda tujuan. Yang pertama merender **semua varian satu komponen** dengan `map` atas array `as const`, sehingga menambah varian baru di `cva` otomatis muncul di sandbox tanpa mengubah halaman ini, dan varian yang lupa didefinisikan langsung terlihat sebagai tombol tanpa gaya. Yang kedua justru menaruh **komponen berbeda bersebelahan**, yaitu `Button`, `Field`, dan `Badge` dalam satu baris `items-center`. Itu susunan yang sengaja dipilih, karena ketidakcocokan tinggi kontrol, masalah yang dijaga token `--size-control-*` tadi, hanya terlihat saat ketiganya benar-benar berdampingan. Halaman seperti ini murah dibuat dan tidak ikut ke produksi, tapi ia satu-satunya cara memeriksa keseragaman dengan mata alih-alih berharap.',
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
      h2('Studi kasus di project nyata'),
      p(
        'Tim sepakat membuat pustaka komponen internal. Enam bulan kemudian ada empat komponen kartu, tiga tombol, dan dua kotak input, semuanya karena orang tidak menemukan yang sudah ada atau menemukannya lalu merasa tidak cocok. Pustaka itu tidak gagal karena komponennya kurang bagus, melainkan karena tidak ada yang menjawab tiga pertanyaan dasar sebelum orang mulai memakainya.',
      ),
      table(
        ['Pertanyaan', 'Kalau tidak dijawab', 'Cara menjawabnya'],
        [
          [
            'Bagaimana saya tahu komponen ini ada?',
            'Orang membuat yang baru',
            'Satu halaman katalog yang menampilkan seluruhnya',
          ],
          [
            'Bagaimana saya tahu cara memakainya?',
            'Orang membaca kodenya, atau menyerah',
            'Tipe props yang jelas, plus satu contoh per komponen',
          ],
          [
            'Apa yang saya lakukan kalau tidak cocok?',
            'Orang menyalin lalu mengubah salinannya',
            'Jalan keluar yang disediakan, dan cara mengusulkan perubahan',
          ],
        ],
        'Yang ketiga paling sering diabaikan, dan itu yang paling sering menyebabkan penyalinan.',
      ),
      code(
        'tsx',
        `
        // Lapisan paling bawah: token. Nilai visual tinggal di SINI, sekali.
        // Tanpa lapisan ini, tema gelap dan pergantian merek jadi mustahil.
        :root {
          --warna-utama: oklch(0.55 0.18 258);
          --warna-bahaya: oklch(0.55 0.19 25);
          --jarak-1: 0.25rem;
          --jarak-2: 0.5rem;
          --jarak-3: 1rem;
          --radius: 0.375rem;
        }
        `,
        { filename: 'src/gaya/token.css' },
      ),
      code(
        'tsx',
        `
        // Lapisan tengah: primitif. Satu elemen, satu tanggung jawab.
        export function Tombol({ varian = 'utama', ...sisa }: TombolProps) { /* ... */ }
        export function Kolom({ label, galat, ...sisa }: KolomProps) { /* ... */ }
        export function Kartu({ judul, aksi, ...sisa }: KartuProps) { /* ... */ }

        // Lapisan atas: pola. Menggabungkan primitif untuk kebutuhan yang berulang.
        // Ini yang mencegah sepuluh orang menyusun dialog konfirmasi dengan cara berbeda.
        export function DialogKonfirmasi({
          terbuka,
          judul,
          pesan,
          labelSetuju = 'Ya, lanjutkan',
          nadaSetuju = 'bahaya',
          onSetuju,
          onBatal,
        }: KonfirmasiProps) {
          return (
            <Dialog terbuka={terbuka} onTutup={onBatal} judul={judul}
              kaki={
                <>
                  <Tombol varian="hantu" onClick={onBatal}>Batal</Tombol>
                  <Tombol varian={nadaSetuju} onClick={onSetuju}>{labelSetuju}</Tombol>
                </>
              }
            >
              <p>{pesan}</p>
            </Dialog>
          );
        }
        `,
        { filename: 'src/ui/index.ts' },
      ),
      p(
        'Tiga lapisan ini punya pembagian yang jelas. Token menyimpan nilai visual, primitif membungkus satu elemen, dan pola menggabungkan primitif untuk kebutuhan yang berulang. Lapisan pola sering dilewatkan, padahal ia yang mencegah sepuluh orang menyusun dialog konfirmasi dengan urutan tombol yang berbeda-beda. Pola dibuat **setelah** bentuk yang sama muncul tiga kali, bukan sebelum itu.',
      ),
      p(
        'Perhatikan `DialogKonfirmasi` dibangun **di atas** `Dialog`, bukan menggantikannya. Yang butuh dialog dengan isi khusus tetap memakai `Dialog` langsung. Ini pola berlapis yang membuat pustaka tetap luwes, yaitu ada jalan pintas untuk kebutuhan yang umum dan ada jalan penuh untuk yang tidak umum. Pustaka yang hanya menyediakan jalan pintas akan disalin begitu ada kebutuhan di luar dugaan.',
      ),
      code(
        'text',
        `
        Berkas yang membuat pustaka komponen dipakai, bukan diabaikan:

        src/ui/
          index.ts           <- satu titik impor, supaya mudah ditemukan
          token.css          <- seluruh nilai visual
          Tombol.tsx
          Kolom.tsx
          Dialog.tsx
          pola/
            DialogKonfirmasi.tsx
            FormPencarian.tsx

        docs/ui.md           <- katalog: apa yang ada, dan satu contoh per komponen
        `,
        { caption: 'Satu titik impor dan satu katalog menutup dua dari tiga pertanyaan di atas.' },
      ),
      p(
        "Satu titik impor lewat `index.ts` terlihat sepele dan sangat berpengaruh. Dengan itu, mengetik `from '@/ui'` lalu menekan pelengkapan otomatis di editor menampilkan seluruh komponen yang tersedia. Tanpa itu, orang harus tahu nama berkasnya lebih dulu, dan yang tidak tahu akan membuat sendiri.",
      ),
      p(
        'Katalog dalam bentuk satu berkas markdown sudah cukup untuk tim kecil, dan tidak perlu menunggu alat khusus. Yang penting isinya menjawab dua hal per komponen, yaitu untuk apa ia dipakai dan satu contoh pemanggilan yang bisa disalin. Katalog yang hanya mendaftar nama tanpa contoh tidak menjawab pertanyaan kedua, dan orang tetap harus membuka kodenya.',
      ),
      callout(
        'warning',
        'Pustaka komponen adalah kontrak, dan kontrak sulit diubah',
        'Begitu sebuah komponen dipakai di dua puluh tempat, mengubah nama prop berarti menyunting dua puluh berkas. Karena itu tahan diri membuat komponen bersama sampai ada dua pemakai nyata dengan kebutuhan yang benar-benar sama. Menyalin dua kali lalu menyatukan setelah perbedaannya terlihat hampir selalu menghasilkan bentuk yang lebih baik daripada merancangnya di depan.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Kegagalan pustaka komponen jarang berupa pesan error. Yang muncul adalah tanda-tanda bahwa orang berhenti memakainya.',
      ),
      code(
        'text',
        `
        $ grep -rln "className=\\"kartu" src/ | wc -l
        14

        $ grep -rln "from '@/ui'" src/ | wc -l
        3

        # Empat belas tempat menyusun kartu sendiri.
        # Tiga tempat memakai komponen bersama.
        `,
        { caption: 'Tanda paling jelas bahwa pustakanya tidak dipakai.' },
      ),
      p(
        'Perbandingan seperti ini bisa dijalankan kapan saja dan langsung memberi gambaran. Kalau jumlah tempat yang menyusun sendiri jauh lebih besar daripada yang memakai komponen bersama, ada satu dari tiga pertanyaan di awal yang belum terjawab. Yang paling sering adalah pertanyaan ketiga, yaitu tidak ada jalan keluar sehingga orang menyalin.',
      ),
      code(
        'text',
        `
        $ ls src/ui/
        Kartu.tsx  KartuBaru.tsx  KartuProduk.tsx  KartuV2.tsx

        # Empat komponen kartu, dan tidak ada yang tahu mana yang benar.
        `,
        { caption: 'Nama berakhiran Baru atau V2 adalah tanda kontrak yang gagal diubah.' },
      ),
      p(
        'Komponen bernama `KartuV2` lahir saat seseorang butuh mengubah kontrak `Kartu` tapi takut merusak dua puluh pemakainya. Itu keputusan yang bisa dipahami, dan akibatnya dua komponen yang harus dirawat selamanya. Jalan keluar yang lebih baik adalah menambah prop opsional dengan bawaan yang menjaga perilaku lama, atau melakukan perubahan bertahap dengan penandaan usang lebih dulu.',
      ),
      code(
        'text',
        `
        // Tema gelap ditambahkan. Setengah komponen ikut, setengah tidak.
        $ grep -rn "#[0-9a-fA-F]\\{6\\}" src/ui/ | wc -l
        37

        # Tiga puluh tujuh nilai warna ditulis langsung, bukan lewat token.
        `,
        { caption: 'Nilai visual yang tersebar membuat tema gelap mustahil.' },
      ),
      p(
        'Ini akibat langsung dari melewatkan lapisan token. Selama warna ditulis langsung di komponen, tidak ada satu tempat pun yang bisa diubah untuk mengganti tema. Perbaikannya bertahap, yaitu kumpulkan seluruh nilai yang berulang menjadi token lebih dulu, lalu ganti pemakaiannya satu berkas per satu berkas. Pencarian seperti di atas memberi daftar pekerjaannya.',
      ),
      code(
        'text',
        `
        <Tombol varian="utama" className="!bg-red-500" />

        # Tanda seru pada kelas Tailwind berarti memaksa menimpa.
        # Ini tanda komponennya tidak menyediakan yang dibutuhkan.
        `,
        { caption: 'Pemaksaan gaya adalah gejala, bukan penyakitnya.' },
      ),
      p(
        'Satu atau dua pemaksaan masih wajar. Kalau ia muncul di banyak tempat untuk hal yang sama, itu berarti ada varian yang seharusnya disediakan komponennya. Cara membacanya, pemaksaan gaya adalah permintaan fitur yang ditulis dalam bentuk akalan. Kumpulkan yang berulang, lalu tambahkan sebagai varian resmi.',
      ),
      table(
        ['Tanda', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Banyak tempat menyusun komponen sendiri',
            'Tidak ditemukan, atau tidak ada jalan keluar',
            'Satu titik impor, katalog, dan warisi atribut elemennya',
          ],
          [
            'Muncul komponen bernama Baru atau V2',
            'Kontrak lama sulit diubah tanpa merusak pemakainya',
            'Tambah prop opsional dengan bawaan yang menjaga perilaku lama',
          ],
          [
            'Tema gelap hanya berlaku sebagian',
            'Nilai warna ditulis langsung di komponen',
            'Kumpulkan menjadi token, lalu ganti bertahap',
          ],
          [
            'Banyak pemaksaan gaya di tempat pemakaian',
            'Ada varian yang belum disediakan',
            'Kumpulkan yang berulang, tambahkan sebagai varian resmi',
          ],
          [
            'Komponen dipakai dengan cara yang berbeda-beda',
            'Tidak ada lapisan pola untuk kebutuhan yang berulang',
            'Buat komponen pola setelah bentuk yang sama muncul tiga kali',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pustaka komponen gagal bukan karena teknisnya sulit melainkan karena keputusan yang diambil di awal, dan sebagian besar baris di bawah adalah keputusan itu.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Membuat komponen bersama dari satu contoh',
            'Nanti tinggal ditambah',
            'Bentuknya hampir selalu salah sebab kamu menebak apa yang akan berbeda. Tunggu sampai ada dua pemakai nyata',
          ],
          [
            'Melewatkan lapisan token',
            'Nilainya kan sudah ada di komponen',
            'Tema gelap dan pergantian merek menjadi mustahil tanpa menyisir puluhan berkas',
          ],
          [
            'Tidak menyediakan jalan keluar',
            'Supaya pemakaiannya seragam',
            'Selalu ada kebutuhan yang tidak terduga, dan tanpa jalan keluar orang akan menyalin komponenmu',
          ],
          [
            'Membuat katalog yang hanya mendaftar nama',
            'Setidaknya sudah terdokumentasi',
            'Tanpa contoh pemanggilan, orang tetap harus membuka kodenya. Satu contoh per komponen sudah cukup',
          ],
          [
            'Membuat komponen pola sebelum polanya terlihat',
            'Supaya seragam sejak awal',
            'Pola yang ditebak biasanya salah. Buat setelah bentuk yang sama muncul tiga kali',
          ],
          [
            'Melarang orang menyusun komponennya sendiri',
            'Supaya pustakanya dipakai',
            'Larangan tanpa jalan keluar hanya memindahkan penyalinan ke tempat yang lebih tersembunyi. Sediakan jalannya, dan sediakan cara mengusulkan perubahan',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan aturan tetap, dan ia sama dengan aturan tiga untuk abstraksi di Bab 2 Frontend Basic. Komponen bersama punya biaya perubahan yang jauh lebih tinggi daripada komponen sekali pakai, sehingga bentuknya layak dipikirkan lebih lama. Menyalin dua kali bukan kegagalan melainkan cara mengumpulkan bukti tentang apa yang benar-benar berbeda.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'Elemen bawaan memberi banyak hal gratis, yaitu fokus keyboard, peran ARIA, dan perilaku yang sudah dikenal pengguna. Prop yang saling meniadakan dikelompokkan menjadi union. Jalan keluar disediakan supaya tidak ada yang menyalin. Bab berikutnya membahas jenis komponen dan cara menyusunnya, termasuk kapan komposisi menang atas konfigurasi dan bagaimana batas antara Server Component dan Client Component mengubah keputusan itu.',
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
