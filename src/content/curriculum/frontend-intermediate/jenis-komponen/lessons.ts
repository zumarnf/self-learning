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
 * Frontend Intermediate — Chapter 6, all twelve lessons.
 *
 * Ordered oldest pattern to newest on purpose. Presentational/container and HOC come first not
 * because they are recommended, but because a reader will meet them in existing code long before
 * they meet Server Components — and a pattern you cannot name is a pattern you cannot replace.
 */
export const lessons: LessonDraft[] = [
  written(
    'presentational-container',
    'Presentational vs Container',
    18,
    'Pemisahan klasik antara tampilan dan logika.',
    [
      p(
        'Pola ini muncul sekitar 2015 dan mendominasi kode React selama bertahun-tahun. Idenya memisahkan komponen menjadi dua peran: **container** yang tahu dari mana data datang, dan **presentational** yang hanya tahu cara menampilkannya.',
      ),

      terms(
        {
          term: 'presentational',
          meaning:
            'Dibaca "prezenteisyenel", artinya **komponen penampil**. Ia tidak tahu apa pun tentang API, store, atau routing — hanya menerima props dan menghasilkan tampilan. Ciri yang bisa diuji: berikan props yang sama, ia selalu menghasilkan hasil yang sama.',
        },
        {
          term: 'container',
          meaning:
            'Artinya **wadah**. Kebalikan dari presentational: ia tahu dari mana data datang (query, store, router) tapi tidak tahu bentuk tampilannya. Ia mengambil data, lalu menyerahkannya sebagai props ke komponen penampil.',
        },
        {
          term: 'pattern (pola)',
          meaning:
            'Bentuk penyelesaian yang berulang dan sudah punya nama. Nilai sebuah nama bukan soal kerapian: **pola yang tidak bisa kamu sebut namanya adalah pola yang tidak bisa kamu ganti**. Itu alasan bab ini menaruh pola-pola lama di depan, bukan karena menganjurkannya.',
        },
        {
          term: 'Dan Abramov',
          meaning:
            'Salah satu tokoh yang mempopulerkan pola ini pada 2015, dan yang kemudian **menarik anjurannya sendiri** setelah hooks hadir. Ini konteks penting: kalau kamu menemukan artikel lama yang menganjurkannya sebagai aturan, penulisnya sendiri sudah tidak lagi.',
        },
        {
          term: 'hooks',
          meaning:
            'Alasan pola ini kehilangan tempatnya sebagai anjuran umum. Hooks sudah memisahkan **logika** dari **tampilan** tanpa memaksa membuat komponen kedua — jadi manfaat utama pemisahannya bisa didapat tanpa membayar lapisan prop tambahan.',
        },
        {
          term: 'Storybook',
          meaning:
            'Alat untuk menampilkan komponen satu per satu di luar aplikasi, supaya bisa dilihat dan diuji tanpa menjalankan seluruh sistem. Ini salah satu dari tiga situasi di mana pemisahan presentational/container masih benar-benar berbayar.',
        },
        {
          term: 'abstraksi prematur',
          meaning:
            'Membangun lapisan untuk pemanggil yang **belum ada**. Biayanya dibayar hari ini berupa satu file lagi untuk dibuka dan satu lapisan lagi untuk ditelusuri, demi manfaat yang mungkin tidak pernah datang. Aturan praktisnya, pisahkan saat pemakai kedua benar-benar muncul dan bukan sebelumnya.',
        },
        {
          term: 'custom hook',
          meaning:
            'Fungsi berawalan `use` yang membungkus logika supaya bisa dipakai ulang. Ia adalah pengganti langsung pola ini di React modern: logikanya tetap bisa dibagikan lewat `useProfil()`, tanpa komponen perantara.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        // Presentational — tidak tahu apa pun soal API atau store.
        // Berikan props yang sama, ia selalu menghasilkan tampilan yang sama.
        function DaftarProdukView({ produk, onPilih }: Props) {
          return (
            <ul>
              {produk.map((p) => (
                <li key={p.id}>
                  <button onClick={() => onPilih(p.id)}>{p.nama}</button>
                </li>
              ))}
            </ul>
          );
        }

        // Container — tahu dari mana datanya, tidak tahu bentuk tampilannya.
        function DaftarProdukContainer() {
          const { data } = useQuery({ queryKey: ['produk'], queryFn: ambilProduk });
          const router = useRouter();

          return <DaftarProdukView produk={data ?? []} onPilih={(id) => router.push(\`/produk/\${id}\`)} />;
        }
        `,
      ),
      p(
        'Perhatikan apa yang **tidak ada** di masing-masing. `DaftarProdukView` tidak memuat `useQuery`, `useRouter`, atau alamat API mana pun, sebab ia hanya menerima `produk` dan `onPilih`, dan itu membuatnya bisa diuji dengan mengoper array biasa tanpa memalsukan jaringan. Sebaliknya `DaftarProdukContainer` tidak memuat satu pun tag HTML, sebab ia hanya mengurus dari mana data datang dan apa yang terjadi saat sesuatu dipilih. Baris `data ?? []` menandai satu tanggung jawab container yang mudah terlewat, yaitu **menormalkan bentuk data** sebelum menyerahkannya, sehingga komponen tampilan tidak perlu menangani kemungkinan `undefined`. Perlu dicatat, contoh ini menunjukkan polanya bekerja, dan bagian berikutnya menjelaskan kenapa ia tidak lagi dianjurkan sebagai kebiasaan.',
      ),

      h2('Apa yang sebenarnya ia beli'),
      ul(
        'Komponen tampilan gampang diuji — cukup oper props, tidak perlu memalsukan jaringan atau store.',
        'Komponen tampilan gampang dipakai ulang dengan sumber data yang berbeda.',
        'Batasnya jelas: satu file tidak berisi campuran `fetch` dan JSX sekaligus.',
      ),

      h2('Kenapa ia tidak lagi jadi anjuran umum'),
      p(
        'Dan Abramov, yang mempopulerkannya, kemudian menarik anjurannya sendiri setelah hooks hadir. Alasannya: hooks sudah memisahkan logika dari tampilan **tanpa** memaksa membuat komponen kedua. Kalau kamu memisahkan hanya demi mengikuti pola, yang kamu dapat adalah dua file, satu lapisan prop tambahan, dan tidak satu pun manfaat di atas.',
      ),
      compare(
        {
          title: 'Pemisahan tanpa alasan',
          lang: 'tsx',
          code: `
          function ProfilContainer() {
            const { data } = useQuery(...);
            return <ProfilView user={data} />;
          }

          function ProfilView({ user }) {
            return <h1>{user.nama}</h1>;
          }
          `,
          notes: [
            'Dua file, satu lapisan prop, nol manfaat',
            'Tidak ada pemakai kedua untuk ProfilView',
          ],
        },
        {
          title: 'Satu komponen + custom hook',
          lang: 'tsx',
          code: `
          function Profil() {
            const { data } = useProfil();
            return <h1>{data.nama}</h1>;
          }
          `,
          notes: ['Logikanya tetap bisa dipakai ulang lewat useProfil', 'Tanpa komponen perantara'],
        },
      ),
      p(
        'Bandingkan dengan contoh `DaftarProduk` di atas, karena di sana pemisahan membeli sesuatu sedangkan di sini tidak. `ProfilView` hanya merender satu `<h1>` dan **tidak punya pemakai kedua**, jadi yang dihasilkan pemisahan itu cuma satu file tambahan dan satu lapisan prop yang harus ditelusuri pembaca. Kolom kanan menunjukkan bahwa tujuan aslinya tetap tercapai tanpa komponen perantara, sebab logika pengambilan data dipindah ke `useProfil`, sehingga ia tetap bisa dipakai ulang di komponen mana pun, sementara tampilannya tinggal satu fungsi. Inilah yang dimaksud "hooks sudah memisahkan logika dari tampilan tanpa memaksa membuat komponen kedua", sekaligus kenapa penulis polanya sendiri menarik anjurannya.',
      ),

      h2('Kapan ia masih relevan'),
      p(
        'Tiga situasi membuat pemisahan ini tetap berbayar. Pertama, komponen tampilannya **benar-benar** dipakai dengan lebih dari satu sumber data. Kedua, kamu memakai Storybook dan butuh komponen yang bisa dirender tanpa lingkungan apa pun. Ketiga, yang paling penting sekarang, batasnya kebetulan sama dengan batas Server/Client Component, yang dibahas dua sub-bab berikutnya.',
      ),
      callout(
        'tip',
        'Aturan praktisnya',
        'Jangan memisahkan lebih dulu lalu mencari alasannya. Pisahkan saat pemakai kedua benar-benar muncul. Ini penerapan langsung dari prinsip "jangan membangun abstraksi untuk pemanggil yang belum ada".',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `DaftarPesanan` mengambil data dari server, menyaringnya, mengurutkannya, dan menampilkannya dalam tabel. Panjangnya tiga ratus baris. Saat tim ingin menampilkan tabel yang sama di halaman cetak tanpa pengambilan data, tidak ada cara memakainya kembali. Saat tim ingin menguji tampilan tabelnya untuk daftar kosong, mereka harus memalsukan seluruh pemanggilan jaringan lebih dulu.',
      ),
      p(
        'Yang menyatu di sana adalah dua tanggung jawab yang berubah karena alasan berbeda, yaitu **dari mana datanya** dan **seperti apa tampilannya**. Memisahkannya membuat keduanya bisa berubah sendiri-sendiri.',
      ),
      code(
        'tsx',
        `
        // Lapisan tampilan: TIDAK tahu dari mana datanya berasal.
        // Bisa diuji tanpa jaringan, dipakai ulang di mana saja.
        type TabelProps = {
          pesanan: Pesanan[];
          urut: Urut;
          onUrut: (kunci: string) => void;
          onBatalkan?: (id: string) => void;   // opsional: halaman cetak tidak mengirimnya
        };

        export function TabelPesanan({ pesanan, urut, onUrut, onBatalkan }: TabelProps) {
          if (pesanan.length === 0) return <p className="kosong">Tidak ada pesanan</p>;

          return (
            <table>
              {/* ... */}
              {pesanan.map((p) => (
                <tr key={p.id}>
                  <td>{p.nomor}</td>
                  <td>{formatRupiah(p.totalSen)}</td>
                  {onBatalkan ? (
                    <td>
                      <button type="button" onClick={() => onBatalkan(p.id)}>Batalkan</button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </table>
          );
        }
        `,
        { filename: 'src/pesanan/TabelPesanan.tsx' },
      ),
      code(
        'tsx',
        `
        // Lapisan data: TIDAK tahu seperti apa tampilannya.
        export function DaftarPesanan({ filter }: { filter: Filter }) {
          const keadaan = usePesanan(filter);
          const [urut, setUrut] = useState<Urut>({ kunci: 'nomor', arah: 'naik' });

          if (keadaan.status === 'memuat') return <Skeleton baris={5} />;
          if (keadaan.status === 'gagal') return <PesanGagal galat={keadaan.galat} />;

          const terurut = keadaan.data.toSorted(bandingkan(urut));

          return (
            <TabelPesanan
              pesanan={terurut}
              urut={urut}
              onUrut={(kunci) => setUrut(putarArah(urut, kunci))}
              onBatalkan={batalkan}
            />
          );
        }

        // Halaman cetak memakai tabel yang SAMA, tanpa aksi dan tanpa pengambilan data.
        export function CetakPesanan({ pesanan }: { pesanan: Pesanan[] }) {
          return <TabelPesanan pesanan={pesanan} urut={URUT_TETAP} onUrut={() => {}} />;
        }
        `,
        { filename: 'src/pesanan/DaftarPesanan.tsx' },
      ),
      p(
        'Yang paling berharga dari pemisahan ini bukan jumlah barisnya melainkan **apa yang menjadi mungkin**. Menguji tampilan untuk daftar kosong kini cukup memanggil `TabelPesanan` dengan array kosong, tanpa memalsukan satu pun pemanggilan jaringan. Halaman cetak memakai komponen yang sama, sehingga perbaikan tampilan otomatis berlaku di kedua tempat.',
      ),
      p(
        'Prop `onBatalkan` dibuat opsional, dan itu keputusan yang layak diperhatikan. Halaman cetak tidak punya aksi apa pun, dan memaksanya mengirim fungsi kosong hanya untuk memenuhi kontrak adalah tanda kontraknya terlalu ketat. Dengan menjadikannya opsional, kolom aksinya tidak dirender sama sekali saat tidak diperlukan.',
      ),
      p(
        'Perlu jujur disebut bahwa pemisahan ini punya biaya, yaitu ada satu lapisan tambahan dan satu berkas tambahan. Untuk komponen yang hanya dipakai di satu tempat dan tidak pernah diuji terpisah, biaya itu tidak terbayar. Pisahkan saat ada tanda yang nyata, yaitu ada pemakai kedua, atau tampilannya perlu diuji tanpa datanya.',
      ),
      callout(
        'tip',
        'Pemisahan ini bukan aturan, melainkan jawaban atas kebutuhan',
        'Istilah presentational dan container berasal dari era sebelum hook, dan sebagian penulis aslinya kemudian menyarankan tidak memakainya sebagai aturan kaku. Yang bertahan adalah gagasannya, yaitu pisahkan yang berubah karena alasan berbeda. Hari ini pemisahan itu sering dilakukan lewat custom hook, bukan lewat dua komponen, dan itu dibahas di Sub-bab 6.7.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat memisahkan lapisan, dan sebagian besar berupa pemisahan yang bocor.',
      ),
      code(
        'text',
        `
        function TabelPesanan({ pesanan }) {
          const [data, setData] = useState([]);
          useEffect(() => { ambilPesanan().then(setData); }, []);   // masih mengambil sendiri
          // ...
        }

        // Pemisahannya bocor. Komponen tampilan tetap butuh jaringan untuk diuji.
        `,
        { caption: 'Lapisan tampilan masih mengambil datanya sendiri.' },
      ),
      p(
        'Tidak ada error, dan seluruh manfaat pemisahannya hilang. Tandanya jelas, yaitu kalau kamu tidak bisa merender komponen tampilan hanya dengan memberikan props, ia belum benar-benar terpisah. Uji cepatnya, coba tulis satu pemanggilan komponen itu di berkas terpisah tanpa penyedia apa pun. Kalau gagal, ada ketergantungan yang belum diangkat.',
      ),
      code(
        'text',
        `
        <TabelPesanan pesanan={pesanan} onUrut={() => {}} onBatalkan={() => {}} />

        // Halaman cetak terpaksa mengirim dua fungsi kosong
        // hanya untuk memenuhi kontrak.
        `,
        { caption: 'Prop wajib yang sebenarnya tidak selalu diperlukan.' },
      ),
      p(
        'Fungsi kosong yang dikirim hanya untuk memenuhi tipe adalah tanda kontraknya terlalu ketat. Selain berisik, ia menyembunyikan maksud sebenarnya, yaitu bahwa halaman ini memang tidak punya aksi. Jadikan opsional, lalu komponennya memutuskan tidak merender bagian itu. Tipe yang jujur tentang apa yang opsional membuat pemakaiannya lebih terbaca.',
      ),
      code(
        'text',
        `
        function TabelPesanan({ pesanan }) {
          const { pengguna } = useAuth();          // ketergantungan tersembunyi
          return <table>{pengguna.peran === 'admin' ? ... : ...}</table>;
        }

        // Menguji komponen ini butuh membungkusnya dengan penyedia auth.
        `,
        { caption: 'Ketergantungan pada konteks membuat komponen tidak berdiri sendiri.' },
      ),
      p(
        'Membaca konteks di dalam komponen tampilan menciptakan ketergantungan yang tidak terlihat dari tipe propsnya. Siapa pun yang memakainya harus tahu bahwa penyedia auth wajib ada di atasnya, dan tidak ada satu pun tanda tentang itu. Untuk komponen yang dimaksudkan dipakai ulang, terima nilainya lewat props supaya seluruh kebutuhannya tertulis di satu tempat.',
      ),
      code(
        'text',
        `
        // Dua komponen dipecah, dan yang satu hanya meneruskan props.
        function DaftarPesanan(props) {
          return <TabelPesanan {...props} />;
        }

        // Lapisan yang tidak melakukan apa pun.
        `,
        { caption: 'Pemisahan yang tidak menghasilkan pemisahan apa pun.' },
      ),
      p(
        'Komponen yang hanya meneruskan props tanpa menambah apa pun adalah lapisan kosong yang harus dibuka pembaca tanpa mendapat informasi. Ini terjadi saat pemisahan dilakukan karena aturan, bukan karena kebutuhan. Kalau lapisan datanya tidak punya state, tidak mengambil apa pun, dan tidak mengubah bentuk data, hapus saja lapisan itu.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Komponen tampilan tetap butuh jaringan untuk diuji',
            'Pengambilan data masih di dalamnya',
            'Angkat ke lapisan data, dan terima hasilnya lewat props',
          ],
          [
            'Pemanggil mengirim fungsi kosong',
            'Prop wajib padahal tidak selalu diperlukan',
            'Jadikan opsional, dan jangan render bagiannya kalau tidak ada',
          ],
          [
            'Komponen gagal saat dirender tanpa penyedia',
            'Ketergantungan tersembunyi pada konteks',
            'Terima nilainya lewat props',
          ],
          [
            'Ada lapisan yang hanya meneruskan props',
            'Pemisahan dilakukan karena aturan, bukan kebutuhan',
            'Hapus lapisannya',
          ],
          [
            'Perubahan tampilan menuntut menyunting lapisan data',
            'Bentuk data yang diterima terlalu terikat pada tampilan',
            'Kirim data dalam bentuk domainnya, biarkan tampilan yang memformat',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemisahan lapisan mudah dilakukan berlebihan, dan sebagian besar kesalahan di bawah berasal dari memperlakukannya sebagai aturan alih-alih sebagai jawaban atas kebutuhan.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memisahkan setiap komponen menjadi dua lapisan',
            'Katanya itu praktik yang baik',
            'Untuk komponen yang dipakai sekali dan tidak diuji terpisah, ia hanya menambah berkas dan lapisan tanpa manfaat',
          ],
          [
            'Membaca konteks di dalam komponen tampilan',
            'Nilainya kan tersedia',
            'Ketergantungan itu tidak terlihat dari tipe props, dan siapa pun yang memakainya harus tahu penyedianya wajib ada',
          ],
          [
            'Menjadikan seluruh prop wajib',
            'Supaya kontraknya jelas',
            'Pemanggil terpaksa mengirim nilai kosong untuk hal yang tidak berlaku di konteksnya',
          ],
          [
            'Mengirim data yang sudah diformat ke lapisan tampilan',
            'Supaya tampilan tinggal menampilkan',
            'Tampilan kehilangan kemampuan menampilkannya dengan cara lain, misalnya format berbeda per lokal. Kirim data mentahnya',
          ],
          [
            'Memakai istilah presentational dan container sebagai aturan kaku',
            'Namanya sudah baku',
            'Istilahnya berasal dari era sebelum hook, dan hari ini pemisahan sering lebih baik lewat custom hook. Yang bertahan gagasannya, bukan namanya',
          ],
          [
            'Memisahkan berdasarkan jumlah baris',
            'Komponennya sudah terlalu panjang',
            'Panjang bukan alasan memisahkan. Pisahkan yang berubah karena alasan berbeda',
          ],
        ],
      ),
      p(
        'Baris keempat sering terjadi tanpa disadari dan membatasi pemakaian ulang. Mengirim `totalTerformat: "Rp 1.800.000"` alih-alih `totalSen: 180000000` berarti lapisan tampilan tidak bisa lagi menampilkannya dalam mata uang lain, tidak bisa mengurutkannya secara numerik, dan tidak bisa menjumlahkannya. Kirim data dalam bentuk domainnya, dan biarkan tampilan yang memutuskan cara menampilkannya.',
      ),
      callout(
        'info',
        'Custom hook sering menggantikan lapisan container',
        'Sebelum hook ada, satu-satunya cara berbagi logika data adalah membungkusnya dengan komponen. Hari ini logika itu bisa tinggal di custom hook, dan komponennya tetap satu. Pola dua komponen tetap berguna saat tampilannya memang perlu dipakai ulang tanpa datanya, misalnya untuk halaman cetak atau untuk pengujian.',
      ),
      references(
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti pola ini di React modern — berbagi logika tanpa komponen perantara.',
        },
        {
          label: 'Keeping Components Pure',
          href: 'https://react.dev/learn/keeping-components-pure',
          source: 'React',
          note: 'Sifat "props sama → tampilan sama" yang membuat komponen penampil mudah diuji.',
        },
        {
          label: 'Extracting Components',
          href: 'https://react.dev/learn/your-first-component#nesting-and-organizing-components',
          source: 'React',
          note: 'Panduan resmi kapan sebuah komponen layak dipecah — dan kapan tidak.',
        },
        {
          label: 'Thinking in React',
          href: 'https://react.dev/learn/thinking-in-react',
          source: 'React',
          note: 'Cara memutuskan batas komponen dari bentuk datanya, bukan dari pola yang sedang populer.',
        },
      ),
    ],
  ),

  written(
    'server-vs-client-component',
    'Server Component vs Client Component',
    23,
    'Perbedaan paling penting di React modern.',
    [
      p(
        'React Server Component (RSC) adalah perubahan terbesar di React sejak hooks. Sebelumnya semua komponen berjalan di browser; sekarang sebagian bisa berjalan **hanya di server** dan tidak pernah mengirim satu byte JavaScript pun ke pengguna.',
      ),

      terms(
        {
          term: 'RSC',
          meaning:
            'Singkatan **React Server Component**. Perubahan terbesar di React sejak hooks. Sebelumnya semua komponen berjalan di browser; sekarang sebagian bisa berjalan **hanya di server** dan tidak pernah mengirim satu byte JavaScript pun ke pengguna.',
        },
        {
          term: 'Server Component',
          meaning:
            'Komponen yang dijalankan **hanya di server**. Ia boleh `async`/`await`, boleh menyentuh database dan rahasia, tapi tidak punya `useState`, `useEffect`, maupun event handler. Di App Router, ini adalah **default** — kamu tidak perlu menandainya.',
        },
        {
          term: 'Client Component',
          meaning:
            'Komponen yang filenya diawali `"use client"` dan kodenya ikut dikirim ke browser. Ia bisa memakai state, event handler, dan API browser — tapi tidak boleh menyentuh database atau rahasia, karena semua isinya bisa dibaca siapa pun.',
        },
        {
          term: '"use client"',
          meaning:
            'Direktif berupa string di baris paling atas sebuah file. Ia **bukan** penanda "komponen ini berjalan di browser" — ia penanda **batas**: mulai dari file ini ke bawah, semuanya masuk bundle klien. Dibahas tuntas di sub-bab berikutnya.',
        },
        {
          term: 'bundle',
          meaning:
            'Berkas JavaScript yang harus diunduh dan dijalankan browser. Angka "nol JavaScript" pada Server Component itu harfiah: kodenya tidak pernah ikut, jadi ia tidak menambah waktu unduh, waktu parse, maupun waktu eksekusi di perangkat pengguna.',
        },
        {
          term: 'notFound()',
          meaning:
            'Fungsi Next.js yang menghentikan render dan menampilkan halaman 404. Dipanggil langsung di badan Server Component — tidak perlu state error, tidak perlu `if` bercabang yang mengembalikan JSX berbeda.',
        },
        {
          term: 'children sebagai jalan keluar',
          meaning:
            'Client Component **tidak bisa mengimpor** Server Component. Tapi ia bisa **menerimanya sebagai `children`** — karena `children` sudah berupa hasil render, bukan referensi ke komponennya. Server yang mengerjakannya, klien hanya menempatkannya.',
        },
        {
          term: 'serialisasi',
          meaning:
            'Mengubah nilai menjadi format yang bisa dikirim lewat jaringan. Props dari server ke klien melewati batas itu, jadi isinya terbatas: string, angka, boolean, array, objek biasa, `Date`, `Map`, `Set` bisa. **Fungsi, class instance, dan `Symbol` tidak bisa.**',
        },
        {
          term: 'payload RSC',
          meaning:
            'Data yang dikirim server ke browser berisi hasil render Server Component beserta props untuk Client Component. Ini yang membuat peringatan keamanan di bawah nyata: satu `<Profil user={user} />` yang membawa `passwordHash` akan **mengirimkannya ke browser** meski tidak pernah tampil di layar.',
        },
      ),

      h2('Perbedaannya'),
      table(
        ['', 'Server Component', 'Client Component'],
        [
          ['Berjalan di', 'Server saja', 'Server (render awal) lalu browser'],
          ['JavaScript ke browser', '**Nol**', 'Ikut ke bundle'],
          ['`useState`, `useEffect`', 'Tidak bisa', 'Bisa'],
          ['Event handler (`onClick`)', 'Tidak bisa', 'Bisa'],
          ['`async`/`await` di komponen', 'Bisa', 'Tidak'],
          ['Akses database / rahasia', 'Bisa', '**Tidak boleh**'],
          ['Akses `window`, `localStorage`', 'Tidak', 'Bisa'],
          ['Default di App Router', '**Ya**', 'Perlu `"use client"`'],
        ],
      ),

      h2('Server Component: mengambil data langsung'),
      code(
        'tsx',
        `
        // Tanpa 'use client' -> ini Server Component.
        // Tidak ada useEffect, tidak ada state loading, tidak ada race condition.
        export default async function HalamanProduk({ params }: { params: Promise<{ id: string }> }) {
          const { id } = await params;
          const produk = await db.produk.findUnique({ where: { id } });

          if (!produk) notFound();

          return (
            <article>
              <h1>{produk.nama}</h1>
              <p>{produk.deskripsi}</p>
            </article>
          );
        }
        `,
      ),
      p(
        'Perhatikan yang **tidak** ada di sana: tidak ada `useState` untuk data, tidak ada `useState` untuk loading, tidak ada `useEffect`, tidak ada penanganan respons yang datang terlambat. Semua itu hilang karena datanya sudah ada sebelum HTML dibuat.',
      ),

      h2('Client Component: apa pun yang butuh browser'),
      code(
        'tsx',
        `
        'use client';

        import { useState } from 'react';

        export function TombolSuka({ awal }: { awal: number }) {
          const [jumlah, setJumlah] = useState(awal);
          return <button onClick={() => setJumlah((n) => n + 1)}>{jumlah} suka</button>;
        }
        `,
      ),

      h2('Aturan arah: server boleh memuat klien, tidak sebaliknya'),
      p(
        'Server Component boleh merender Client Component. Client Component **tidak bisa** mengimpor Server Component — karena saat komponen klien dijalankan di browser, tidak ada server di sana.',
      ),
      code(
        'tsx',
        `
        // BOLEH: server merender klien
        export default async function Halaman() {
          const data = await ambilData();
          return <TombolInteraktif data={data} />;   // TombolInteraktif punya 'use client'
        }

        // TIDAK BOLEH: klien mengimpor server
        'use client';
        import KomponenServer from './komponen-server';   // gagal
        `,
      ),
      p(
        'Arah yang boleh dan tidak boleh ini bukan aturan sewenang-wenang, sebab ia mengikuti **di mana kode itu benar-benar berjalan**. Blok pertama sah karena `Halaman` berjalan di server, menyelesaikan `await ambilData()` di sana, lalu mengirim hasilnya ke browser bersama instruksi untuk merender `TombolInteraktif`. Blok kedua gagal karena kebalikannya mustahil. Begitu kode berada di browser, tidak ada server untuk menjalankan komponen server itu, dan mengimpornya akan menyeret seluruh isinya, termasuk kredensial database dan kode yang tidak pernah boleh sampai ke klien. Perhatikan bahwa yang dilarang adalah **mengimpor** dan bukan merender, sebab perbedaan halus itulah yang membuka jalan keluar di bagian berikutnya.',
      ),
      p('Tapi ada jalan keluar yang sering dilupakan: **oper sebagai `children`**.'),
      code(
        'tsx',
        `
        // Server Component
        export default async function Halaman() {
          return (
            <PembungkusKlien>
              {/* Ini dirender di SERVER, lalu hasilnya dioper sebagai children. */}
              <KontenServer />
            </PembungkusKlien>
          );
        }

        // Client Component — menerima elemen jadi, bukan mengimpor komponennya.
        'use client';
        export function PembungkusKlien({ children }: { children: React.ReactNode }) {
          const [buka, setBuka] = useState(false);
          return <div>{buka && children}</div>;
        }
        `,
      ),
      p(
        'Kuncinya ada pada komentar di dalam `Halaman`, sebab `<KontenServer />` **dirender di server**, dan yang dioper ke `PembungkusKlien` bukan komponennya melainkan **hasilnya yang sudah jadi**. Karena itu larangan tadi tidak dilanggar, sebab `PembungkusKlien` tidak pernah mengimpor apa pun dari sisi server dan hanya menerima `children` seperti prop biasa. Ini persis pola komposisi dari Bab 2, dipakai untuk menyelesaikan batas yang sama sekali berbeda. Perhatikan `PembungkusKlien` bebas melakukan apa saja terhadap `children`, entah menyembunyikannya lewat `buka &&`, membungkusnya, atau menganimasikannya, tanpa perlu tahu isinya apa. Inilah cara membuat konten yang dirender server tetap bisa berada di dalam tab, modal, atau accordion yang interaktif.',
      ),
      callout(
        'info',
        'Kenapa itu bekerja',
        '`children` sudah berupa hasil render, bukan referensi ke komponennya. Server yang mengerjakannya, klien hanya menempatkannya. Pola ini penting: ia membuat komponen interaktif bisa membungkus konten server tanpa menyeret konten itu ke bundle browser.',
      ),

      h2('Yang dioper harus bisa diserialisasi'),
      p(
        'Props dari Server Component ke Client Component melewati batas jaringan, jadi ia harus bisa diubah menjadi format serial. String, angka, boolean, array, objek biasa, `Date`, `Map`, `Set` — semuanya bisa. Yang tidak bisa: **fungsi**, class instance, dan `Symbol`.',
      ),
      code(
        'tsx',
        `
        // GAGAL: fungsi tidak bisa diserialisasi
        <TombolKlien onKlik={() => console.log('halo')} />

        // BENAR: oper datanya, biarkan komponen klien yang membuat handlernya
        <TombolKlien id={produk.id} />
        `,
      ),
      p(
        'Batasan ini masuk akal begitu kamu ingat bahwa props dari Server ke Client Component harus **melewati jaringan**. Apa pun yang dioper diubah menjadi teks, dikirim ke browser, lalu disusun kembali, sedangkan fungsi tidak bisa diubah menjadi teks tanpa kehilangan seluruh isinya. Karena itu baris pertama gagal, dan pesannya menyebut kata "serializable" yang mudah membingungkan kalau kamu tidak tahu ada perjalanan jaringan di antaranya. Koreksinya membalik tanggung jawab, sebab server mengirim **data** (`id`) dan komponen klien yang membuat handler-nya sendiri, dan itu sah karena kode itu memang berjalan di browser. Kotak berikut menyebut sisi lain dari kenyataan yang sama, yaitu karena props benar-benar dikirim, apa pun yang kamu oper bisa dibaca siapa saja yang membuka payload halaman.',
      ),
      callout(
        'warning',
        'Bahaya keamanan yang nyata',
        'Karena props dikirim ke browser, jangan pernah mengoper objek utuh dari database ke Client Component. Satu `<Profil user={user} />` yang membawa `passwordHash` atau `email` internal akan mengirimkannya ke browser — terlihat di payload RSC meski tidak pernah dirender di layar. Pilih field yang benar-benar perlu.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman detail produk dipindahkan ke App Router. Bundel JavaScript yang dikirim ke pengguna turun dari 340 kilobyte menjadi 90 kilobyte hanya karena tiga komponen tidak lagi ikut terkirim. Ketiganya adalah pemformat tanggal, penyorot kode, dan pengurai markdown, yang seluruhnya hanya menghasilkan HTML dan tidak pernah menanggapi klik apa pun.',
      ),
      p(
        'Yang menentukan sebuah komponen boleh tetap di server bukan seberapa rumit ia melainkan **apakah ia butuh berinteraksi dengan pengguna**. Tabel di bawah adalah cara memutuskannya tanpa menebak.',
      ),
      table(
        ['Kalau komponen butuh ini', 'Ia harus Client Component', 'Alasannya'],
        [
          ['`useState` atau `useReducer`', '**Ya**', 'State hidup di peramban'],
          ['`useEffect`', '**Ya**', 'Efek berjalan setelah dipasang di DOM'],
          ['`onClick`, `onChange`, penangan apa pun', '**Ya**', 'Peristiwa terjadi di peramban'],
          ['API peramban: `window`, `localStorage`', '**Ya**', 'Tidak ada di server'],
          [
            'Membaca database langsung',
            'Tidak, justru harus server',
            'Kredensial tidak boleh ke klien',
          ],
          ['Memformat tanggal atau angka', 'Tidak', 'Hasilnya HTML statis'],
          ['Mengurai markdown', 'Tidak', 'Pustakanya berat dan hasilnya statis'],
        ],
        'Bawaannya Server Component. Naik ke klien hanya saat ada alasan dari kolom kiri.',
      ),
      code(
        'tsx',
        `
        // Server Component. Tidak ada 'use client', dan itu bawaannya.
        // Pustaka markdown TIDAK ikut ke bundel klien.
        import { uraiMarkdown } from 'pustaka-markdown-berat';

        export default async function HalamanProduk({ params }: { params: { id: string } }) {
          // Membaca database LANGSUNG. Kredensialnya tidak pernah ke peramban.
          const produk = await db.produk.findUnique({ where: { id: params.id } });
          if (!produk) notFound();

          return (
            <article>
              <h1>{produk.nama}</h1>

              {/* Diurai di server. Yang dikirim hanya HTML hasilnya. */}
              <div dangerouslySetInnerHTML={{ __html: uraiMarkdown(produk.deskripsi) }} />

              {/* Hanya BAGIAN INI yang butuh JavaScript di peramban. */}
              <TombolKeranjang produkId={produk.id} hargaSen={produk.hargaSen} />
            </article>
          );
        }
        `,
        { filename: 'src/app/produk/[id]/page.tsx' },
      ),
      code(
        'tsx',
        `
        'use client';

        // Client Component. Sekecil mungkin, dan hanya yang benar-benar interaktif.
        export function TombolKeranjang({ produkId, hargaSen }: Props) {
          const [menambah, setMenambah] = useState(false);

          async function tambah() {
            setMenambah(true);
            try {
              await tambahKeKeranjang(produkId);
            } finally {
              setMenambah(false);
            }
          }

          return (
            <button type="button" onClick={tambah} disabled={menambah} aria-busy={menambah}>
              {menambah ? 'Menambahkan…' : \`Tambah — \${formatRupiah(hargaSen)}\`}
            </button>
          );
        }
        `,
        { filename: 'src/app/produk/[id]/TombolKeranjang.tsx' },
      ),
      p(
        'Pola yang terbentuk di sini disebut mendorong klien ke bawah, yaitu batas `use client` diletakkan sedekat mungkin dengan bagian yang benar-benar interaktif. Kalau `use client` ditaruh di halaman, seluruh isinya termasuk pustaka markdown ikut terkirim ke peramban. Dengan menaruhnya hanya di tombol, yang terkirim hanya tombolnya.',
      ),
      p(
        'Perhatikan pustaka markdown diimpor di Server Component, dan itu yang membuat penghematan 250 kilobyte pada cerita di awal. Pustaka yang hanya dipakai untuk menghasilkan HTML tidak punya alasan berada di peramban. Ini keputusan yang tidak mungkin diambil tanpa pemisahan server dan klien, dan itulah manfaat terbesarnya.',
      ),
      p(
        'Bagian `db.produk.findUnique` yang dipanggil langsung di komponen adalah hal yang mustahil sebelumnya. Karena kodenya tidak pernah sampai ke peramban, kredensial database dan seluruh kueri tetap di server. Yang perlu diingat, ini juga berarti kesalahan menaruh kode server di Client Component menjadi kebocoran yang nyata, dan itu dibahas di bagian error.',
      ),
      callout(
        'danger',
        'Props yang dikirim ke Client Component ikut ke peramban',
        'Seluruh props yang kamu berikan ke Client Component diserialisasi dan dikirim ke browser, dan bisa dilihat siapa pun di tab Network. Jangan pernah mengoper object utuh dari database yang memuat field internal seperti harga modal, catatan admin, atau token. Pilih field yang memang perlu, dan kirim hanya itu.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat pertama kali memakai Server Component, dan pesannya cukup jelas menyebut penyebabnya.',
      ),
      code(
        'text',
        `
        export default function Halaman() {
          const [buka, setBuka] = useState(false);
          // ...
        }

        Error: useState only works in Client Components.
        Add the "use client" directive at the top of the file to use it.
        `,
        { caption: 'Hook dipakai di Server Component.' },
      ),
      p(
        'Pesannya menyebut perbaikannya secara langsung, dan justru di situ jebakannya. Menambahkan `use client` di puncak berkas memang menghilangkan errornya, dan sekaligus memindahkan seluruh isi berkas itu beserta seluruh yang diimpornya ke peramban. Sebelum menambahkannya, tanyakan apakah bagian yang butuh state itu bisa dipisah menjadi komponen kecil tersendiri.',
      ),
      code(
        'text',
        `
        'use client';
        import { db } from '@/lib/db';

        Error: You're importing a component that needs "server-only".
        That only works in a Server Component but one of its parents
        is marked with "use client", so it's a Client Component.
        `,
        { caption: 'Kode khusus server diimpor dari Client Component.' },
      ),
      p(
        'Error ini adalah penjaga yang sangat berharga, sebab tanpanya kredensial database bisa ikut terkirim ke peramban. Ia muncul kalau modul yang diimpor menandai dirinya dengan paket `server-only`. Kalau modulmu sendiri berisi rahasia, tambahkan impor itu supaya kesalahan seperti ini tertangkap saat membangun, bukan ditemukan lewat pemeriksaan bundel.',
      ),
      code(
        'text',
        `
        // Server Component mengirim fungsi sebagai prop
        <TombolKlien onKlik={() => hapus(id)} />

        Error: Functions cannot be passed directly to Client Components
        unless you explicitly expose it by marking it with "use server".
        `,
        { caption: 'Fungsi tidak bisa diserialisasi untuk dikirim ke peramban.' },
      ),
      p(
        'Props yang dikirim dari Server ke Client Component harus bisa diserialisasi, sehingga fungsi, kelas, `Date` pada sebagian kasus, dan `Symbol` semuanya ditolak. Ada dua jalan keluar. Kalau fungsinya memang harus berjalan di server, tandai dengan `use server` sehingga ia menjadi Server Action. Kalau logikanya milik klien, pindahkan fungsinya ke dalam Client Component itu sendiri.',
      ),
      code(
        'text',
        `
        export default function Halaman() {
          const lebar = window.innerWidth;
          // ...
        }

        ReferenceError: window is not defined
        `,
        { caption: 'API peramban dipakai di kode yang berjalan di server.' },
      ),
      p(
        'Ini error yang sama dengan yang dibahas di Bab 1 Frontend Basic tentang perbedaan runtime, muncul kembali dalam konteks baru. Server tidak punya `window`, `document`, maupun `localStorage`. Perbaikannya memindahkan pembacaan itu ke Client Component, dan lebih tepat lagi ke dalam `useEffect` sebab ukuran jendela baru bisa diketahui setelah komponennya terpasang.',
      ),
      table(
        ['Pesan error', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`useState only works in Client Components`',
            'Hook dipakai di Server Component',
            'Pisahkan bagian interaktifnya, lalu beri `use client` di sana saja',
          ],
          [
            '`You\\\'re importing a component that needs "server-only"`',
            'Kode server diimpor dari Client Component',
            'Pindahkan pemanggilannya ke Server Component, atau lewat Server Action',
          ],
          [
            '`Functions cannot be passed directly to Client Components`',
            'Props harus bisa diserialisasi',
            'Tandai dengan `use server`, atau pindahkan fungsinya ke klien',
          ],
          [
            '`window is not defined`',
            'API peramban dipakai di server',
            'Pindahkan ke Client Component, di dalam `useEffect`',
          ],
          [
            'Bundel klien jauh lebih besar dari perkiraan',
            '`use client` ditaruh terlalu tinggi',
            'Turunkan batasnya sedekat mungkin ke bagian interaktifnya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Pemisahan server dan klien mengubah kebiasaan yang sudah lama terbentuk, dan sebagian besar kesalahan di bawah berasal dari menyelesaikan error dengan cara termudah.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menambahkan `use client` di puncak halaman untuk menghilangkan error',
            'Errornya langsung hilang',
            'Seluruh isi berkas beserta yang diimpornya ikut ke peramban. Pisahkan bagian interaktifnya saja',
          ],
          [
            'Menaruh `use client` di berkas layout',
            'Supaya seluruh anaknya bisa interaktif',
            'Seluruh pohon di bawahnya menjadi Client Component. Ini cara tercepat membuat bundel membengkak',
          ],
          [
            'Mengoper object utuh dari database ke Client Component',
            'Datanya kan sudah ada',
            'Seluruhnya diserialisasi dan bisa dilihat di tab Network, termasuk field internal. Pilih field yang perlu saja',
          ],
          [
            'Mengira Server Component tidak bisa punya anak interaktif',
            'Ia kan tidak punya JavaScript',
            'Server Component bisa merender Client Component sebagai anaknya. Yang tidak bisa adalah kebalikannya lewat impor langsung',
          ],
          [
            'Memakai `useEffect` untuk mengambil data di Client Component',
            'Itu cara yang sudah dikuasai',
            'Di App Router, pengambilan data lebih tepat di Server Component. Efek untuk pengambilan data menambah satu perjalanan bolak-balik yang tidak perlu',
          ],
          [
            'Menandai seluruh komponen UI dengan `use client` berjaga-jaga',
            'Supaya tidak bertemu error',
            'Kehilangan seluruh manfaat Server Component. Bawaannya server, dan naik ke klien hanya saat ada alasan',
          ],
        ],
      ),
      p(
        'Baris keempat perlu diluruskan karena ia sering menghalangi pemakaian yang benar. Server Component **bisa** merender Client Component sebagai anak, dan itu justru pola yang dianjurkan. Yang tidak bisa adalah Client Component mengimpor Server Component secara langsung. Jalan keluarnya mengirim Server Component sebagai `children`, dan itu dibahas di sub-bab berikutnya.',
      ),
      callout(
        'tip',
        'Cara memeriksa apa yang benar-benar terkirim ke peramban',
        'Buka tab Network, saring berkas JavaScript, lalu cari nama pustaka yang kamu curigai. Kalau pustaka pengurai markdown muncul di sana, ia ikut terkirim padahal seharusnya tidak. Next.js juga menyediakan penganalisis bundel yang menampilkan ukuran tiap modul, dan itu cara paling cepat menemukan `use client` yang terlalu tinggi.',
      ),
      references(
        {
          label: 'Server Components',
          href: 'https://react.dev/reference/rsc/server-components',
          source: 'React',
          note: 'Rujukan resmi React untuk komponen yang berjalan hanya di server.',
        },
        {
          label: 'Server and Client Components',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Aturan arah impor dan pola `children` yang membuat konten server bisa dibungkus komponen klien.',
        },
        {
          label: '"use client"',
          href: 'https://react.dev/reference/rsc/use-client',
          source: 'React',
          note: 'Termasuk daftar tipe nilai yang boleh dan tidak boleh dioper melewati batas server–klien.',
        },
        {
          label: 'notFound()',
          href: 'https://nextjs.org/docs/app/api-reference/functions/not-found',
          source: 'Next.js',
          note: 'Menghentikan render dan menampilkan 404 langsung dari badan Server Component.',
        },
      ),
    ],
  ),

  written(
    'use-client-boundary',
    'Kapan `"use client"` & Di Mana Batasnya',
    22,
    'Menarik batas serapat mungkin ke daun.',
    [
      p(
        '`"use client"` bukan penanda "komponen ini berjalan di browser". Ia adalah **penanda batas**: begitu satu modul menyatakannya, seluruh modul yang ia impor ikut masuk ke bundle klien. Salah menaruhnya di satu tempat bisa menyeret setengah aplikasi ke browser.',
      ),

      terms(
        {
          term: 'batas (boundary)',
          meaning:
            'Garis pemisah antara bagian yang dikerjakan server dan bagian yang dikirim ke browser. `"use client"` menggambar garis itu. Yang sering disalahpahami: garisnya **menurun** — semua yang diimpor dari file bertanda itu ikut ke sisi klien, sedalam apa pun rantainya.',
        },
        {
          term: 'merambat',
          meaning:
            'Sifat batas ini yang membuatnya berbahaya. Satu `"use client"` di `layout.tsx` menyeret sidebar, lalu navigasi, lalu apa pun yang navigasi itu impor. Kamu tidak menandai satu komponen — kamu menandai satu **cabang pohon impor**.',
        },
        {
          term: 'leaf',
          meaning:
            'Komponen paling ujung yang tidak merender komponen lain — sebuah tombol, sebuah input. Aturan bab ini: **turunkan `"use client"` sedekat mungkin ke daun**, supaya yang ikut ke browser hanya bagian yang memang butuh browser.',
        },
        {
          term: 'tree-shaking',
          meaning:
            'Kemampuan bundler membuang kode yang tidak dipakai. Batasnya yang sering tidak disadari: ia bekerja pada **modul dan ekspor**, bukan pada **properti objek**. Mengimpor satu objek besar berarti seluruh isinya ikut, meski kamu cuma memakai satu field.',
        },
        {
          term: 'proyeksi ramping',
          meaning:
            'Versi ringkas sebuah data yang dibangun di Server Component lalu dioper sebagai prop. Sidebar tidak butuh isi pelajaran — ia hanya butuh slug, judul, dan nomor. Karena bundler tidak bisa membuang properti objek, **kamu** yang harus memilihnya lebih dulu.',
        },
        {
          term: 'import type',
          meaning:
            'Bentuk impor TypeScript yang hanya membawa **tipe**, bukan nilai. Ia dihapus saat kompilasi dan tidak punya biaya runtime sama sekali — jadi Client Component boleh menulis `import type { Lesson } from ...` tanpa menyeret apa pun ke bundle.',
        },
        {
          term: 'kebocoran bundle',
          meaning:
            'Kode yang ikut ke browser padahal tidak pernah dibutuhkan di sana. Yang membuatnya sulit ditangkap: **tampilannya tetap normal**. Tidak ada error, tidak ada peringatan, halaman tetap berfungsi — ia hanya jadi makin mahal untuk pembaca.',
        },
        {
          term: 'ditegakkan tes',
          meaning:
            'Karena kebocoran tidak menimbulkan gejala, aturannya tidak bisa dititipkan pada kedisiplinan. Website ini menegakkannya lewat `client-bundle-boundary.test.ts`: satu impor terlarang dari Client Component membuat suite merah.',
        },
      ),

      h2('Efek yang merambat'),
      code(
        'text',
        `
        app/layout.tsx          <- 'use client' di sini
          └─ Sidebar            ikut jadi klien
              └─ NavigasiUtama  ikut jadi klien
                  └─ data/kurikulum.ts  IKUT KE BUNDLE BROWSER
        `,
      ),
      p(
        'Itu bukan contoh karangan. Cacat persis seperti ini pernah ditemukan di website yang sedang kamu baca: komponen sidebar diberi `"use client"` karena butuh menandai menu aktif, dan karena ia mengimpor kurikulum, **seluruh prosa dan contoh kode setiap sub-bab** ikut terkirim ke browser. Ukurannya 86 KB saat baru 16 sub-bab, dan akan tumbuh linear seiring materi ditulis.',
      ),

      h2('Aturan: turunkan batasnya sedekat mungkin ke daun'),
      compare(
        {
          title: 'Batas terlalu tinggi',
          lang: 'tsx',
          code: `
          'use client';

          export function Artikel({ isi, judul }) {
            const [suka, setSuka] = useState(0);

            return (
              <article>
                <h1>{judul}</h1>
                {/* Seluruh isi artikel ikut ke bundle */}
                <div>{isi}</div>
                <button onClick={() => setSuka(suka + 1)}>
                  {suka}
                </button>
              </article>
            );
          }
          `,
          notes: ['Satu tombol memaksa seluruh artikel jadi Client Component'],
        },
        {
          title: 'Batas di daun',
          lang: 'tsx',
          code: `
          // Server Component — tidak ada 'use client'
          export function Artikel({ isi, judul }) {
            return (
              <article>
                <h1>{judul}</h1>
                <div>{isi}</div>
                <TombolSuka />
              </article>
            );
          }

          // File terpisah
          'use client';
          export function TombolSuka() {
            const [suka, setSuka] = useState(0);
            return <button onClick={() => setSuka(suka + 1)}>{suka}</button>;
          }
          `,
          notes: ['Hanya tombolnya yang jadi JavaScript di browser'],
        },
      ),
      p(
        'Kedua versi menampilkan artikel yang sama dengan tombol suka yang sama, tapi **jumlah JavaScript yang diunduh pembaca berbeda jauh**. Kuncinya ada pada kalimat di rujukan, yaitu `"use client"` menandai **batas modul** dan bukan satu komponen. Menaruhnya di atas `Artikel` berarti seluruh berkas itu beserta semua yang ia impor ikut dikirim ke browser, termasuk isi artikel yang tidak pernah interaktif. Versi kanan memindahkan direktifnya ke berkas terpisah yang hanya berisi tombolnya, sehingga `Artikel` tetap dirender di server dan yang menyeberang ke browser hanya beberapa baris. Perhatikan `Artikel` tetap **merender** `<TombolSuka />`, sebab sesuai aturan arah tadi server boleh merender klien. Aturan praktisnya, turunkan `"use client"` sedekat mungkin ke daun, dan letakkan pada berkas terkecil yang benar-benar membutuhkannya.',
      ),

      h2('Daftar pemicu yang benar-benar butuh `"use client"`'),
      ul(
        '`useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useRef` untuk DOM',
        'Event handler: `onClick`, `onChange`, `onSubmit`, `onScroll`',
        'API browser: `window`, `document`, `localStorage`, `navigator`, `IntersectionObserver`',
        'Context provider dan konsumennya',
        'Library pihak ketiga yang di dalamnya memakai salah satu di atas',
      ),
      p(
        'Yang **bukan** pemicu: menampilkan data, `map` atas array, kondisional, styling, dan menerima props. Semua itu bisa dikerjakan di server.',
      ),

      h2('Menegakkannya dengan mesin, bukan ingatan'),
      p(
        'Masalah dari kebocoran seperti ini: tampilannya tetap normal. Tidak ada error, tidak ada peringatan, halaman tetap berfungsi — ia hanya jadi makin mahal untuk pembaca. Karena itu aturannya harus dijaga tes, bukan kedisiplinan.',
      ),
      code(
        'ts',
        `
        // Tes yang dipakai website ini (disederhanakan)
        const TERLARANG_DI_KLIEN = [
          "from '@/content/curriculum",
          "from '@/lib/curriculum/queries'",
        ];

        it('tidak ada Client Component yang mengimpor kurikulum', () => {
          const pelanggar = fileKlien.filter((f) =>
            TERLARANG_DI_KLIEN.some((t) => bacaImpor(f).includes(t)),
          );
          expect(pelanggar).toEqual([]);
        });
        `,
      ),
      p(
        'Tes ini tidak menguji perilaku aplikasi sama sekali, melainkan menguji **struktur impor**, dan itu justru yang membuatnya tepat di sini. Kebocoran bundle tidak punya gejala yang bisa diamati dari luar, sebab halaman tetap benar dan tidak ada error, hanya berkas yang diunduh membengkak. Yang bisa dideteksi hanyalah polanya di kode sumber, jadi tesnya membaca daftar berkas berdirektif `"use client"` lalu memeriksa apakah ada yang mengimpor modul terlarang. `expect(pelanggar).toEqual([])` sengaja membandingkan dengan array kosong alih-alih memeriksa panjangnya, sehingga pesan gagalnya langsung **menyebutkan berkas mana** yang melanggar dan bukan sekadar "diharapkan 0 dapat 3". Ini contoh kecil dari prinsip yang berlaku umum, bahwa aturan yang hanya dijaga kedisiplinan akan dilanggar suatu hari.',
      ),
      callout(
        'tip',
        'Solusinya: proyeksi ramping',
        'Kalau komponen klien butuh sebagian data besar, bangun versi ringkasnya di Server Component lalu oper sebagai prop. Sidebar tidak butuh isi pelajaran — ia hanya butuh slug, judul, dan nomor. Bundler tidak bisa membuang properti objek yang tidak dipakai, jadi kamu yang harus memilihnya lebih dulu.',
      ),
      callout(
        'info',
        '`import type` tetap aman',
        "Impor tipe dihapus saat kompilasi dan tidak punya biaya runtime sama sekali. Client Component boleh menulis `import type { Lesson } from '@/lib/content/types'` tanpa menyeret apa pun ke bundle.",
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman dasbor punya bilah samping yang bisa dibuka tutup, dan di dalamnya ada daftar menu yang datanya diambil dari database. Karena bilah sampingnya butuh state, seseorang menambahkan `use client` di berkasnya. Bundel halaman itu naik 180 kilobyte, sebab seluruh komponen di dalamnya termasuk daftar menu ikut terkirim ke peramban beserta pustaka ikon yang dipakainya.',
      ),
      p(
        'Yang perlu dipahami, `use client` bukan penanda satu komponen melainkan **penanda batas**. Seluruh yang berada di bawahnya dalam pohon impor ikut menjadi kode klien.',
      ),
      code(
        'text',
        `
        Cara membaca batas 'use client':

        page.tsx                         <- Server Component
          └─ Sidebar.tsx  'use client'   <- BATAS. Mulai dari sini ke bawah:
               ├─ MenuItem.tsx           <- ikut jadi Client, walau tanpa 'use client'
               ├─ IkonPanah.tsx          <- ikut
               └─ pustaka-ikon           <- ikut, seluruh pustakanya

        Menambahkan 'use client' di satu berkas menarik SELURUH pohon impornya
        ke peramban, termasuk pustaka pihak ketiga.
        `,
        { caption: 'Batas menular ke bawah lewat impor, bukan lewat posisi di JSX.' },
      ),
      p(
        'Kalimat terakhir itu yang paling sering disalahpahami. Yang menular adalah hubungan **impor**, bukan hubungan induk dan anak di JSX. Komponen yang diimpor Client Component ikut menjadi klien, sedangkan komponen yang dikirim sebagai `children` **tidak**. Perbedaan itu yang membuka jalan keluar pada studi kasus di bawah.',
      ),
      code(
        'tsx',
        `
        // SEBELUM: seluruh isi bilah samping ikut ke peramban.
        'use client';
        import { DaftarMenu } from './DaftarMenu';   // ikut jadi Client

        export function Sidebar() {
          const [buka, setBuka] = useState(true);
          return (
            <aside data-buka={buka}>
              <button onClick={() => setBuka(!buka)}>Toggle</button>
              <DaftarMenu />
            </aside>
          );
        }
        `,
        { filename: 'Sebelum' },
      ),
      code(
        'tsx',
        `
        // SESUDAH: bilah samping menerima isinya sebagai children.
        'use client';

        export function Sidebar({ children }: { children: ReactNode }) {
          const [buka, setBuka] = useState(true);
          return (
            <aside data-buka={buka}>
              <button onClick={() => setBuka(!buka)}>Toggle</button>
              {children}
            </aside>
          );
        }

        // page.tsx tetap Server Component.
        // DaftarMenu dibuat DI SERVER, lalu dikirim sebagai children.
        export default async function Halaman() {
          const menu = await db.menu.findMany();
          return (
            <Sidebar>
              <DaftarMenu menu={menu} />   {/* tetap Server Component */}
            </Sidebar>
          );
        }
        `,
        { filename: 'Sesudah' },
      ),
      p(
        'Perbedaannya satu, yaitu `DaftarMenu` tidak lagi diimpor oleh `Sidebar` melainkan dikirim sebagai `children` dari Server Component. Karena elemennya dibuat di server, yang sampai ke peramban hanya hasil penggambarannya, bukan kodenya. Pustaka ikon yang dipakainya juga tidak ikut. Ini pola yang paling penting di seluruh sub-bab ini, dan namanya menyisipkan server ke dalam klien.',
      ),
      p(
        'Perlu ditegaskan `Sidebar` tetap Client Component dan tetap punya state. Yang berubah hanya dari mana isinya berasal. Ini juga berarti `children` yang diterimanya sudah berupa elemen jadi yang tidak bisa ia sentuh isinya, dan itu memang batas yang benar. Client Component tidak perlu tahu apa pun tentang isi yang ia bungkus.',
      ),
      callout(
        'info',
        'Satu berkas bisa punya banyak batas, dan itu justru dianjurkan',
        'Tidak ada aturan yang membatasi jumlah Client Component dalam satu halaman. Yang dianjurkan justru banyak batas kecil di dekat bagian interaktifnya, bukan satu batas besar di atas. Halaman dengan lima tombol interaktif lebih baik punya lima Client Component kecil daripada satu Client Component yang membungkus seluruh halaman.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat mengatur batas, dan dua di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        'use client';
        import HalamanServer from './HalamanServer';   // Server Component

        Error: You're importing a component that needs "server-only".
        `,
        { caption: 'Client Component mengimpor Server Component secara langsung.' },
      ),
      p(
        'Arah impornya hanya satu, yaitu Server boleh mengimpor Client, dan Client tidak boleh mengimpor Server. Jalan keluarnya bukan menghapus `use client` melainkan membalik cara penyusunannya, yaitu kirim Server Component sebagai `children` dari Server Component di atasnya. Ini persis pola pada studi kasus.',
      ),
      code(
        'text',
        `
        // layout.tsx
        'use client';

        // Tidak ada error. Seluruh aplikasi menjadi Client Component.
        // Bundel naik dari 90 KB menjadi 400 KB.
        `,
        { caption: 'Batas ditaruh di layout, dan menular ke seluruh halaman.' },
      ),
      p(
        'Tidak ada error, dan inilah kesalahan paling mahal di sub-bab ini. Layout berada di puncak pohon impor, sehingga menandainya membuat seluruh halaman di bawahnya ikut menjadi klien. Kalau layout memang butuh state, misalnya untuk menu yang bisa dibuka tutup, pisahkan bagian itu menjadi komponen kecil dan biarkan layoutnya tetap Server Component.',
      ),
      code(
        'text',
        `
        'use client';
        import { format } from 'pustaka-tanggal-berat';   // 90 KB

        // Tidak ada error. Pustaka 90 KB ikut ke peramban
        // untuk memformat satu tanggal.
        `,
        { caption: 'Pustaka berat ikut terbawa lewat impor di Client Component.' },
      ),
      p(
        'Tidak ada error dan tidak ada peringatan, dan satu-satunya cara menemukannya adalah memeriksa bundel. Kalau pemformatannya tidak bergantung pada interaksi, lakukan di Server Component lalu kirim hasilnya sebagai teks. Kalau memang harus di klien, misalnya karena bergantung pada zona waktu pengguna, cari pustaka yang lebih ringan atau pakai `Intl` bawaan peramban.',
      ),
      code(
        'text',
        `
        // Server Component
        <TombolKlien tanggal={new Date()} />

        // Pada sebagian versi:
        Error: Only plain objects, and a few built-ins, can be passed to
        Client Components from Server Components.
        `,
        { caption: 'Nilai yang tidak bisa diserialisasi dikirim sebagai props.' },
      ),
      p(
        'Aturan serialisasi berubah antar-versi, dan yang aman selalu berupa nilai sederhana, yaitu teks, angka, boolean, array, dan object biasa. Untuk tanggal, kirim sebagai teks ISO lalu ubah kembali di klien. Untuk fungsi, pakai Server Action. Untuk kelas dan `Map`, ubah menjadi bentuk sederhana lebih dulu.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`importing a component that needs "server-only"`',
            'Client mengimpor Server secara langsung',
            'Kirim sebagai `children` dari Server Component di atasnya',
          ],
          [
            'Bundel naik drastis tanpa error',
            '`use client` ditaruh di layout atau halaman',
            'Turunkan batasnya ke komponen interaktif terkecil',
          ],
          [
            'Pustaka berat ikut ke peramban',
            'Diimpor dari Client Component',
            'Pindahkan pemakaiannya ke server, atau cari yang lebih ringan',
          ],
          [
            '`Only plain objects ... can be passed to Client Components`',
            'Props tidak bisa diserialisasi',
            'Kirim bentuk sederhana, misalnya teks ISO untuk tanggal',
          ],
          [
            'Komponen anak ikut jadi klien padahal tidak perlu',
            'Ia diimpor, bukan dikirim sebagai `children`',
            'Balik penyusunannya lewat `children`',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Batas `use client` adalah keputusan yang dampaknya paling besar terhadap ukuran bundel, dan sebagian besar kesalahan di bawah tidak menghasilkan satu pun error.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menaruh `use client` di layout atau halaman',
            'Supaya seluruh isinya bisa interaktif',
            'Seluruh pohon di bawahnya ikut ke peramban. Ini cara tercepat membuat bundel membengkak',
          ],
          [
            'Mengira `use client` menandai satu komponen',
            'Ia ditulis di satu berkas',
            'Ia menandai batas. Seluruh yang diimpor dari sana ikut menjadi klien',
          ],
          [
            'Menyelesaikan error impor dengan menghapus `use client`',
            'Errornya soal batas',
            'Komponen yang butuh state jadi rusak. Jalan keluarnya membalik penyusunan lewat `children`',
          ],
          [
            'Mengimpor pustaka berat di Client Component',
            'Ia dibutuhkan komponen itu',
            'Seluruh pustakanya ikut ke peramban. Periksa apakah pemakaiannya bisa dipindah ke server',
          ],
          [
            'Membuat satu Client Component besar untuk seluruh bagian interaktif',
            'Lebih rapi dalam satu berkas',
            'Bagian yang tidak interaktif di dalamnya ikut terkirim. Banyak batas kecil lebih baik',
          ],
          [
            'Tidak pernah memeriksa ukuran bundel',
            'Halamannya terasa cepat di komputer sendiri',
            'Selisih 300 kilobyte tidak terasa di jaringan kantor dan sangat terasa di jaringan seluler',
          ],
        ],
      ),
      p(
        'Baris ketiga adalah jalan keluar yang paling sering keliru diambil. Saat bertemu error impor, godaan pertamanya menghapus `use client` dari komponen yang membutuhkannya, dan itu hanya memindahkan errornya. Jalan keluar yang benar hampir selalu membalik arah penyusunan, yaitu biarkan Server Component di atas yang membuat elemennya lalu mengirimkannya ke bawah sebagai `children`.',
      ),
      callout(
        'tip',
        'Cara menemukan batas yang terlalu tinggi',
        'Cari seluruh berkas yang memuat `use client` dengan `grep -rln "use client" src/`, lalu periksa apakah ada yang berupa layout atau halaman. Kalau ada, hampir pasti batasnya bisa diturunkan. Berkas `use client` yang sehat biasanya berupa komponen kecil dengan satu tanggung jawab interaktif.',
      ),
      references(
        {
          label: '"use client"',
          href: 'https://react.dev/reference/rsc/use-client',
          source: 'React',
          note: 'Penjelasan resmi bahwa direktif ini menandai batas modul, bukan satu komponen.',
        },
        {
          label: 'Server and Client Components — moving the boundary down',
          href: 'https://nextjs.org/docs/app/getting-started/server-and-client-components',
          source: 'Next.js',
          note: 'Anjuran resmi menurunkan `"use client"` sedekat mungkin ke daun.',
        },
        {
          label: 'Analyzing bundles',
          href: 'https://nextjs.org/docs/app/guides/package-bundling',
          source: 'Next.js',
          note: 'Cara mengukur apa yang benar-benar ikut ke bundle, bukan menebaknya.',
        },
        {
          label: 'Type-Only Imports and Export',
          href: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports',
          source: 'TypeScript',
          note: 'Kenapa `import type` dihapus saat kompilasi dan tidak berbiaya runtime.',
        },
      ),
    ],
  ),

  written(
    'compound-component',
    'Compound Component',
    24,
    'Beberapa komponen yang berbagi state lewat context.',
    [
      p(
        'Compound component adalah sekumpulan komponen yang dirancang untuk dipakai bersama dan berbagi state secara diam-diam. Kamu sudah memakainya di HTML biasa: `<select>` dan `<option>` tidak berguna sendiri-sendiri, tapi bersama mereka membentuk satu kontrol.',
      ),

      terms(
        {
          term: 'compound component',
          meaning:
            'Dibaca "kompaund", artinya **komponen majemuk**. Sekumpulan komponen yang dirancang untuk dipakai bersama dan berbagi state secara diam-diam. Kamu sudah memakainya di HTML biasa: `<select>` dan `<option>` tidak berguna sendiri-sendiri, tapi bersama membentuk satu kontrol.',
        },
        {
          term: 'API komponen',
          meaning:
            'Bentuk props dan susunan yang harus ditulis pemanggil untuk memakai sebuah komponen. Ia dinilai seperti API lain: apakah maksudnya terbaca, apakah kesalahan pemakaian bisa terjadi diam-diam, dan berapa banyak yang harus diingat.',
        },
        {
          term: 'prop proliferation',
          meaning:
            'Dibaca "prop proliferesyen", artinya **props yang beranak-pinak**. Gejala API berprop banyak, sebab setiap permintaan tampilan baru menambah satu prop baru seperti `ikonTerbuka`, `gayaJudul`, dan `bolehBanyakTerbuka`, sampai daftarnya lebih panjang daripada komponennya sendiri.',
        },
        {
          term: 'static property',
          meaning:
            'Menempelkan komponen anak ke komponen induknya sebagai properti: `Accordion.Item = ...`. Efeknya bukan teknis melainkan komunikatif — `<Accordion.Trigger>` langsung memberi tahu pembaca bahwa ia hanya bermakna di dalam `<Accordion>`.',
        },
        {
          term: 'aria-expanded',
          meaning:
            'Atribut ARIA yang memberitahu screen reader apakah bagian yang dikendalikan tombol ini sedang terbuka atau tertutup. Tanpa ini, pengguna screen reader menekan tombol tanpa tahu apa yang terjadi.',
        },
        {
          term: 'aria-controls',
          meaning:
            'Atribut yang menghubungkan tombol dengan `id` panel yang ia buka-tutup. Bersama `aria-expanded`, keduanya bukan tanggung jawab pemanggil — kalau diserahkan ke pemanggil, ia akan lupa. Komponen yang mengelolanya sendiri membuat kesalahan itu mustahil.',
        },
        {
          term: 'React.Children.map',
          meaning:
            'API lama untuk menelusuri `children` dan menyuntikkan props ke dalamnya. **Jangan dipakai untuk pola ini**: ia rusak begitu ada elemen pembungkus di antaranya, misalnya sebuah `<div>` atau `<hr />`. Context bekerja sedalam apa pun pohonnya.',
        },
        {
          term: 'role="region"',
          meaning:
            'Menandai sebuah area sebagai bagian penting yang bisa dituju langsung oleh pengguna screen reader. Dipasang di panel isi accordion supaya isinya bisa ditemukan, bukan sekadar muncul di bawah tombolnya.',
        },
      ),

      h2('Masalah yang ia selesaikan'),
      compare(
        {
          title: 'API berprop banyak',
          lang: 'tsx',
          code: `
          <Accordion
            items={[
              { judul: 'A', isi: 'satu' },
              { judul: 'B', isi: 'dua' },
            ]}
            ikonTerbuka={<ChevronUp />}
            ikonTertutup={<ChevronDown />}
            gayaJudul="tebal"
            bolehBanyakTerbuka
          />
          `,
          notes: [
            'Setiap permintaan tampilan baru = satu prop baru',
            'Tidak bisa menyisipkan apa pun di antara item',
          ],
        },
        {
          title: 'Compound component',
          lang: 'tsx',
          code: `
          <Accordion bolehBanyakTerbuka>
            <Accordion.Item nilai="a">
              <Accordion.Trigger>A</Accordion.Trigger>
              <Accordion.Content>satu</Accordion.Content>
            </Accordion.Item>

            <hr />

            <Accordion.Item nilai="b">
              <Accordion.Trigger>B</Accordion.Trigger>
              <Accordion.Content>dua</Accordion.Content>
            </Accordion.Item>
          </Accordion>
          `,
          notes: ['Susunannya milik pemanggil', 'Tidak perlu prop baru untuk tata letak baru'],
        },
      ),
      p(
        'Perhatikan `<hr />` di tengah kolom kanan, sebab elemen sederhana itu adalah bukti perbedaannya. Pada versi berprop, satu-satunya cara menyisipkan pemisah antar-item adalah menambah prop baru ke `Accordion` dan mengubah implementasinya, sedangkan pada versi compound pemanggil cukup menuliskannya karena **susunan isinya memang miliknya**. Pola yang sama berlaku untuk `ikonTerbuka` dan `gayaJudul`, sebab keduanya lahir karena pemanggil tidak punya kendali atas apa yang dirender, sehingga tiap kebutuhan tampilan baru harus dititipkan lewat prop. Yang tetap tinggal sebagai prop di kolom kanan hanyalah `bolehBanyakTerbuka`, dan itu tepat karena ia mengatur **perilaku** alih-alih tampilan. Aturan pembedanya, perilaku jadi prop dan susunan jadi `children`.',
      ),

      h2('Implementasinya'),
      code(
        'tsx',
        `
        'use client';

        import { createContext, useContext, useState } from 'react';

        type KonteksAccordion = {
          terbuka: string[];
          alihkan: (nilai: string) => void;
        };

        const Konteks = createContext<KonteksAccordion | null>(null);

        function pakaiAccordion(komponen: string) {
          const nilai = useContext(Konteks);
          if (nilai === null) {
            throw new Error(\`<Accordion.\${komponen}> harus berada di dalam <Accordion>\`);
          }
          return nilai;
        }

        export function Accordion({
          children,
          bolehBanyakTerbuka = false,
        }: {
          children: React.ReactNode;
          bolehBanyakTerbuka?: boolean;
        }) {
          const [terbuka, setTerbuka] = useState<string[]>([]);

          function alihkan(nilai: string) {
            setTerbuka((lama) => {
              if (lama.includes(nilai)) return lama.filter((v) => v !== nilai);
              return bolehBanyakTerbuka ? [...lama, nilai] : [nilai];
            });
          }

          return <Konteks value={{ terbuka, alihkan }}>{children}</Konteks>;
        }
        `,
        { filename: 'src/components/ui/accordion.tsx' },
      ),
      p(
        'Inilah yang membuat compound component bekerja, yaitu **Context dipakai secara lokal** dan bukan sebagai state global. `Accordion` menyimpan daftar panel yang terbuka lalu membagikannya ke seluruh keturunannya, sehingga `Accordion.Trigger` bisa mengetahui statusnya tanpa satu pun prop dioper, dan pemanggil bebas menyusun apa pun di antaranya. Perhatikan `bolehBanyakTerbuka` tidak disimpan di context melainkan **dibaca di dalam `alihkan`**, sebab baris `return bolehBanyakTerbuka ? [...lama, nilai] : [nilai]` adalah seluruh perbedaan antara accordion yang membuka banyak panel dan yang hanya satu. Fungsi `pakaiAccordion(komponen)` di atasnya menerapkan pola hook pembungkus dari Bab 5, dengan satu tambahan yang cerdas, yaitu ia menerima nama komponen sehingga pesan errornya menyebut persis bagian mana yang salah tempat.',
      ),
      code(
        'tsx',
        `
        const KonteksItem = createContext<string | null>(null);

        Accordion.Item = function Item({ nilai, children }: { nilai: string; children: React.ReactNode }) {
          return <KonteksItem value={nilai}>{children}</KonteksItem>;
        };

        Accordion.Trigger = function Trigger({ children }: { children: React.ReactNode }) {
          const { terbuka, alihkan } = pakaiAccordion('Trigger');
          const nilai = useContext(KonteksItem)!;
          const aktif = terbuka.includes(nilai);

          return (
            <button
              type="button"
              aria-expanded={aktif}
              aria-controls={\`panel-\${nilai}\`}
              onClick={() => alihkan(nilai)}
            >
              {children}
            </button>
          );
        };

        Accordion.Content = function Content({ children }: { children: React.ReactNode }) {
          const { terbuka } = pakaiAccordion('Content');
          const nilai = useContext(KonteksItem)!;
          if (!terbuka.includes(nilai)) return null;

          return (
            <div id={\`panel-\${nilai}\`} role="region">
              {children}
            </div>
          );
        };
        `,
      ),
      p(
        'Perhatikan bahwa ada **dua** context di sini, bukan satu, dan keduanya menjawab pertanyaan berbeda. `Konteks` (dari blok kode sebelumnya) menjawab "daftar id mana saja yang sedang terbuka, dan bagaimana mengubahnya", dan dibaca oleh `Accordion.Trigger` serta `Accordion.Content`. `KonteksItem` menjawab pertanyaan yang lebih sempit, yaitu "item **mana** yang sedang dibicarakan di titik pohon ini", dan nilainya cuma satu string, di-set oleh `Accordion.Item`, lalu dibaca `useContext(KonteksItem)!` oleh `Trigger` dan `Content` yang ada di dalamnya. Tanda seru setelah `useContext(KonteksItem)` adalah **non-null assertion** TypeScript, karena penulisnya menjamin nilainya tidak akan pernah `null` di sini, karena `Trigger` dan `Content` menurut definisi API selalu dipasang di dalam `Accordion.Item`. Fungsi `pakaiAccordion(\'Trigger\')` yang muncul di awal `Trigger` dan `Content` adalah pembungkus `useContext(Konteks)` yang sama seperti `useTabs()` di sub-bab compound component sebelumnya, dan parameter string di dalamnya dipakai untuk menyebut nama komponen yang benar dalam pesan error kalau Provider-nya lupa dipasang.',
      ),

      h2('Detail yang membedakan implementasi bagus dan asal jadi'),
      ol(
        '**Pesan error yang menyebut nama komponennya.** `<Accordion.Trigger> harus berada di dalam <Accordion>` jauh lebih menolong daripada `Cannot read property of null`.',
        '**Atribut ARIA ikut dikelola komponen.** `aria-expanded` dan `aria-controls` bukan tanggung jawab pemanggil — kalau diserahkan, ia akan lupa.',
        '**Jangan memakai `React.Children.map` untuk menyuntik props.** Cara itu rusak begitu ada elemen pembungkus di antaranya. Context bekerja sedalam apa pun pohonnya.',
      ),

      h2('Biayanya'),
      p(
        'Compound component menukar kesederhanaan dengan keluwesan. Untuk komponen yang dipakai di tiga tempat dengan bentuk yang sama, API berprop sederhana lebih baik. Pola ini berbayar saat komponennya benar-benar dipakai dalam banyak susunan berbeda — komponen overlay, menu, tab, dan tabel adalah kandidat klasiknya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Tab` menerima array berisi label dan isi. Setelah dipakai di enam tempat, permintaan mulai datang. Satu tab butuh lencana angka di sebelah labelnya. Satu tab butuh ikon. Satu tab butuh dinonaktifkan dengan alasan yang ditampilkan saat kursor diarahkan. Tiap permintaan menambah field baru di array, dan setelah setahun bentuk arraynya punya sebelas field yang tidak pernah dipakai bersamaan.',
      ),
      p(
        'Komponen majemuk membalik arah keputusannya, yaitu alih-alih komponen menebak seluruh kemungkinan isi label, pemakainya yang menyusunnya.',
      ),
      compare(
        {
          title: 'Konfigurasi lewat array',
          lang: 'tsx',
          code: `
          <Tab
            daftar={[
              { id: 'ringkasan', label: 'Ringkasan', isi: <Ringkasan /> },
              {
                id: 'pesan',
                label: 'Pesan',
                lencana: 3,
                ikon: <IkonSurat />,
                nonaktif: false,
                alasanNonaktif: undefined,
                // ...enam field lagi
              },
            ]}
          />
          `,
          notes: ['Tiap kebutuhan baru menambah field yang tidak pernah berkurang'],
        },
        {
          title: 'Komponen majemuk',
          lang: 'tsx',
          code: `
          <Tab nilaiAwal="ringkasan">
            <Tab.Daftar>
              <Tab.Tombol nilai="ringkasan">Ringkasan</Tab.Tombol>
              <Tab.Tombol nilai="pesan">
                <IkonSurat /> Pesan <Lencana>3</Lencana>
              </Tab.Tombol>
            </Tab.Daftar>

            <Tab.Panel nilai="ringkasan"><Ringkasan /></Tab.Panel>
            <Tab.Panel nilai="pesan"><Pesan /></Tab.Panel>
          </Tab>
          `,
          notes: ['Kebutuhan baru diselesaikan pemanggil, tanpa menyentuh Tab'],
        },
      ),
      code(
        'tsx',
        `
        // Konteks yang menghubungkan seluruh bagian, dan TIDAK diekspor.
        type KonteksTab = { aktif: string; setAktif: (v: string) => void; idDasar: string };
        const Konteks = createContext<KonteksTab | null>(null);

        // Satu fungsi pembaca, dengan pesan yang menyebut induknya.
        function pakaiKonteksTab(nama: string) {
          const konteks = useContext(Konteks);
          if (!konteks) {
            throw new Error(\`<Tab.\${nama}> harus berada di dalam <Tab>\`);
          }
          return konteks;
        }

        export function Tab({ nilaiAwal, children }: TabProps) {
          const [aktif, setAktif] = useState(nilaiAwal);
          const idDasar = useId();

          // Nilai konteks dibuat sekali per perubahan, bukan tiap render.
          const nilai = useMemo(() => ({ aktif, setAktif, idDasar }), [aktif, idDasar]);

          return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
        }

        Tab.Daftar = function Daftar({ children }: { children: ReactNode }) {
          pakaiKonteksTab('Daftar');
          return <div role="tablist">{children}</div>;
        };

        Tab.Tombol = function Tombol({ nilai, children }: TombolProps) {
          const { aktif, setAktif, idDasar } = pakaiKonteksTab('Tombol');
          const dipilih = aktif === nilai;

          return (
            <button
              type="button"
              role="tab"
              id={\`\${idDasar}-tab-\${nilai}\`}
              aria-selected={dipilih}
              aria-controls={\`\${idDasar}-panel-\${nilai}\`}
              tabIndex={dipilih ? 0 : -1}
              onClick={() => setAktif(nilai)}
            >
              {children}
            </button>
          );
        };

        Tab.Panel = function Panel({ nilai, children }: PanelProps) {
          const { aktif, idDasar } = pakaiKonteksTab('Panel');
          return (
            <div
              role="tabpanel"
              id={\`\${idDasar}-panel-\${nilai}\`}
              aria-labelledby={\`\${idDasar}-tab-\${nilai}\`}
              tabIndex={0}
              hidden={aktif !== nilai}
            >
              {children}
            </div>
          );
        };
        `,
        { filename: 'src/ui/Tab.tsx' },
      ),
      p(
        'Fungsi `pakaiKonteksTab` dengan pesan yang menyebut induknya adalah bagian yang paling menolong saat komponennya dipakai salah. Tanpa itu, memakai `Tab.Panel` di luar `Tab` menghasilkan `Cannot read properties of null`, yaitu pesan yang tidak memberi petunjuk apa pun. Dengan itu, pesannya langsung menyebut apa yang harus diperbaiki.',
      ),
      p(
        'Pembungkusan nilai konteks dengan `useMemo` diperlukan karena object literal baru dibuat pada tiap render. Tanpa itu, seluruh pembaca konteks digambar ulang setiap kali `Tab` digambar ulang, bahkan kalau `aktif` tidak berubah. Pada project yang mengaktifkan React Compiler, ini biasanya ditangani otomatis, dan menuliskannya tetap aman.',
      ),
      p(
        'Menempelkan bagian sebagai properti fungsi, yaitu `Tab.Daftar` dan seterusnya, membuat hubungannya terlihat di tempat pemakaian tanpa perlu mengimpor lima nama. Ini bukan keharusan teknis melainkan pilihan yang membuat kode pemanggil lebih terbaca, dan sekaligus mencegah `Panel` dipakai sendirian tanpa sengaja.',
      ),
      callout(
        'warning',
        'Komponen majemuk menukar kesederhanaan dengan keluwesan',
        'Versi array lebih pendek di tempat pemakaian dan lebih mudah dibuat dari data. Versi majemuk lebih panjang dan jauh lebih luwes. Untuk tab yang bentuknya selalu sama di tiga tempat, versi array justru lebih tepat. Pilih majemuk saat pemakaiannya memang beragam, atau saat labelnya perlu memuat elemen.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 sungguhan, dan seluruhnya berkaitan dengan konteks yang menghubungkan bagian-bagiannya.',
      ),
      code(
        'text',
        `
        <Tab.Panel nilai="x">isi</Tab.Panel>
        {/* dipakai di luar <Tab> */}

        Error: <Tab.Panel> harus berada di dalam <Tab>
        `,
        { caption: 'Diuji sungguhan. Pesan buatan sendiri jauh lebih menolong.' },
      ),
      p(
        "Bandingkan dengan pesan bawaan yang akan muncul tanpa penjaga itu, yaitu `Cannot read properties of null (reading 'aktif')`. Pesan bawaan menyebut properti yang gagal dibaca dan sama sekali tidak menyebut penyebabnya. Menulis penjaga satu baris di fungsi pembaca konteks mengubah pengalaman debugging secara nyata, dan itu berlaku untuk seluruh komponen majemuk.",
      ),
      code(
        'text',
        `
        const nilai = { aktif, setAktif, idDasar };   // tanpa useMemo
        <Konteks.Provider value={nilai}>

        // Object baru tiap render. Seluruh pembaca konteks
        // digambar ulang walaupun 'aktif' tidak berubah.
        `,
        { caption: 'Tidak ada error, dan penggambaran ulang menyebar tanpa perlu.' },
      ),
      p(
        'Konteks membandingkan nilainya dengan `Object.is`, dan object literal baru selalu berbeda dari yang lama. Untuk `Tab` dengan tiga panel, dampaknya kecil. Untuk konteks yang dibaca puluhan komponen, ini penyebab kelambatan yang sulit ditelusuri sebab tidak ada satu pun tanda. Bungkus dengan `useMemo`, atau andalkan React Compiler kalau project-mu mengaktifkannya.',
      ),
      code(
        'text',
        `
        <Tab nilaiAwal="ringkasan">
          <div className="pembungkus">
            <Tab.Tombol nilai="ringkasan">Ringkasan</Tab.Tombol>
          </div>
        </Tab>

        // Bekerja. Konteks menembus pembungkus apa pun.
        // Tapi role="tablist" sekarang hilang dari struktur.
        `,
        { caption: 'Konteks menembus, dan struktur ARIA tidak ikut.' },
      ),
      p(
        'Ini kelebihan sekaligus jebakan komponen majemuk. Konteks bekerja pada kedalaman berapa pun, sehingga pemakai bebas membungkus bagian-bagiannya. Yang tidak ikut bebas adalah struktur ARIA, sebab `role="tab"` menuntut induk langsung berperan `tablist`. Membungkus tombol dengan `div` biasa memutus hubungan itu, dan pembaca layar tidak lagi mengenalinya sebagai kelompok tab.',
      ),
      code(
        'text',
        `
        <Tab.Tombol nilai="pesan">Pesan</Tab.Tombol>
        <Tab.Panel nilai="pesann">isi</Tab.Panel>

        // Salah ketik pada nilai. Tidak ada error.
        // Panel tidak pernah tampil, dan tombolnya tidak melakukan apa-apa.
        `,
        { caption: 'Nilai penghubung berupa teks bebas, sehingga salah ketik lolos.' },
      ),
      p(
        'Tidak ada error karena `nilai` bertipe `string` dan keduanya sah. Gejalanya berupa tab yang diklik tapi tidak menampilkan apa pun. Untuk komponen yang dipakai luas, batasi tipenya menjadi union dari nilai yang sah lewat generik, sehingga salah ketik ditolak sebelum dijalankan. Untuk komponen internal, penjaga saat berjalan yang memeriksa apakah ada panel yang cocok juga menolong.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Cannot read properties of null`',
            'Bagian dipakai di luar induknya, tanpa penjaga',
            'Tulis penjaga di fungsi pembaca konteks, dengan pesan yang menyebut induknya',
          ],
          [
            'Seluruh pembaca konteks digambar ulang tanpa perlu',
            'Nilai konteks berupa object literal baru tiap render',
            'Bungkus dengan `useMemo`',
          ],
          [
            'Pembaca layar tidak mengenali kelompok tab',
            'Tombol dibungkus elemen lain, memutus hubungan ARIA',
            'Jaga `role="tab"` tetap menjadi anak langsung `role="tablist"`',
          ],
          [
            'Tab diklik tapi panel tidak tampil',
            'Salah ketik pada nilai penghubung',
            'Batasi tipenya lewat generik, atau tambahkan penjaga saat berjalan',
          ],
          [
            'Bagian dipakai tanpa saudaranya',
            'Tidak ada yang mencegah pemakaian sebagian',
            'Menempelkan sebagai properti membuat hubungannya terlihat, dan penjaga konteks menegakkannya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Komponen majemuk adalah pola yang sangat luwes dan sangat mudah dipakai di tempat yang tidak membutuhkannya.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai komponen majemuk untuk bentuk yang selalu sama',
            'Katanya lebih luwes',
            'Pemakainya menulis sepuluh baris untuk hal yang bisa satu prop. Untuk bentuk tetap, konfigurasi lebih tepat',
          ],
          [
            'Tidak menulis penjaga di pembaca konteks',
            'Bagiannya kan selalu dipakai di dalam induknya',
            'Sampai ada yang memakainya sendirian, dan pesan errornya tidak memberi petunjuk apa pun',
          ],
          [
            'Melupakan `useMemo` pada nilai konteks',
            'Objectnya kecil',
            'Seluruh pembaca digambar ulang tiap render induknya, walaupun nilainya tidak berubah',
          ],
          [
            'Memakai `cloneElement` untuk menyuntikkan props ke anak',
            'Lebih langsung daripada konteks',
            'Rapuh sebab bergantung pada bentuk anak yang tidak kamu kendalikan, dan rusak begitu ada pembungkus di antaranya. Pakai konteks',
          ],
          [
            'Mengekspor konteksnya',
            'Supaya bisa dipakai dari luar',
            'Kontraknya jadi terbuka dan sulit diubah. Biarkan konteksnya internal, dan ekspor hanya bagian-bagiannya',
          ],
          [
            'Membungkus bagian dengan elemen tambahan tanpa memikirkan ARIA',
            'Konteksnya kan tetap menembus',
            'Struktur ARIA menuntut hubungan induk dan anak tertentu. Konteks menembus, dan peran tidak',
          ],
        ],
      ),
      p(
        'Baris keempat layak ditegaskan karena `cloneElement` masih sering muncul di contoh lama. Ia bekerja untuk struktur yang persis seperti yang diharapkan penulisnya, dan rusak begitu pemakai membungkus salah satu bagiannya dengan `div` untuk keperluan tata letak. Konteks tidak punya masalah itu sebab ia menembus kedalaman berapa pun, dan itu alasan pola ini hampir selalu memakainya.',
      ),
      callout(
        'tip',
        'Sediakan keduanya kalau memang ada dua kebutuhan',
        'Tidak ada yang melarang mengekspor `Tab` yang majemuk sekaligus `TabSederhana` yang menerima array dan dibangun di atasnya. Yang pertama untuk pemakaian yang beragam, yang kedua untuk pola yang berulang. Ini pola berlapis yang sama dengan `Dialog` dan `DialogKonfirmasi` di bab sebelumnya.',
      ),
      references(
        {
          label: 'Passing Data Deeply with Context',
          href: 'https://react.dev/learn/passing-data-deeply-with-context',
          source: 'React',
          note: 'Mekanisme yang membuat komponen anak menemukan induknya sedalam apa pun pohonnya.',
        },
        {
          label: 'Children.map — dan kenapa dianjurkan menghindarinya',
          href: 'https://react.dev/reference/react/Children',
          source: 'React',
          note: 'Peringatan resmi bahwa menelusuri `children` rapuh, beserta alternatif yang dianjurkan.',
        },
        {
          label: 'ARIA: aria-expanded',
          href: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded',
          source: 'MDN Web Docs',
          note: 'Atribut yang wajib dikelola komponen, bukan diserahkan ke pemanggil.',
        },
        {
          label: 'ARIA: disclosure pattern',
          href: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
          source: 'W3C WAI-ARIA APG',
          note: 'Pola resmi buka-tutup konten — dasar perilaku accordion yang benar.',
        },
      ),
    ],
  ),

  written(
    'render-props',
    'Render Props & `children` sebagai fungsi',
    22,
    'Menyerahkan keputusan rendering ke pemanggil.',
    [
      p(
        'Render props adalah pola di mana sebuah komponen tidak menentukan tampilannya sendiri, melainkan menerima **fungsi** yang mengembalikan JSX. Komponen menyediakan datanya; pemanggil memutuskan bentuknya.',
      ),

      terms(
        {
          term: 'render props',
          meaning:
            'Pola di mana sebuah komponen tidak menentukan tampilannya sendiri, melainkan menerima **fungsi** yang mengembalikan JSX. Pembagian tugasnya jelas: komponen menyediakan datanya, pemanggil memutuskan bentuknya.',
        },
        {
          term: 'children sebagai fungsi',
          meaning:
            'Varian render props yang menaruh fungsinya di antara tag pembuka dan penutup, bukan sebagai prop bernama. Keduanya setara. Pakai `children` kalau hanya ada satu fungsi; pakai prop bernama kalau ada beberapa slot berbeda — nama membuat pemakaiannya terbaca.',
        },
        {
          term: 'generic `<T>`',
          meaning:
            'Notasi TypeScript untuk "tipe yang ditentukan saat dipakai". Pada `Daftar<T>`, ia berarti komponen ini bekerja untuk array apa pun — dan fungsi `render` yang kamu oper otomatis tahu tipe itemnya, tanpa kamu menuliskannya lagi.',
        },
        {
          term: 'slot',
          meaning:
            'Lubang di dalam sebuah komponen tempat pemanggil menyisipkan isinya sendiri. `renderHeader`, `renderRow`, `renderFooter` adalah tiga slot berbeda pada satu komponen tabel — dan itulah kasus di mana prop bernama mengalahkan `children`.',
        },
        {
          term: 'call site',
          meaning:
            'Baris tempat sebuah komponen atau fungsi **dipanggil**, bukan tempat ia didefinisikan. Ukuran keberhasilan sebuah API komponen ada di sini: apakah orang yang membaca `<Daftar ... />` bisa langsung paham tanpa membuka definisinya.',
        },
        {
          term: 'empty state',
          meaning:
            'Tampilan saat datanya nol. Prop `kosong` ada supaya keadaan ini punya jawaban yang jelas, bukan area kosong tanpa keterangan. Ini salah satu dari empat keadaan UI yang wajib ditangani setiap tampilan berdata.',
        },
        {
          term: 'HOC',
          meaning:
            'Singkatan *Higher-Order Component*. Pola lama untuk membungkus komponen secara massal, dibahas di sub-bab berikutnya. Disebut di tabel perbandingan supaya kamu bisa membedakannya dari render props — keduanya sering tertukar.',
        },
        {
          term: 'callback hell versi JSX',
          meaning:
            'Bentuk kode yang muncul saat tiga render props bersarang: indentasi terus menjorok dan alurnya sulit diikuti. Namanya meminjam dari masalah lama pada callback asinkron. Kalau sudah dua tingkat, pertimbangkan mengganti sebagiannya dengan custom hook.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        'use client';

        type Props<T> = {
          items: T[];
          render: (item: T, indeks: number) => React.ReactNode;
          kosong?: React.ReactNode;
        };

        export function Daftar<T>({ items, render, kosong }: Props<T>) {
          if (items.length === 0) return <>{kosong ?? <p>Belum ada data.</p>}</>;
          return <ul>{items.map((item, i) => render(item, i))}</ul>;
        }
        `,
      ),
      code(
        'tsx',
        `
        <Daftar
          items={produk}
          kosong={<KeadaanKosong aksi="Tambah produk pertama" />}
          render={(p) => (
            <li key={p.id}>
              {p.nama} — {formatRupiah(p.harga)}
            </li>
          )}
        />
        `,
      ),
      p(
        'Perhatikan bahwa `Daftar` sendiri **tidak tahu** bagaimana bentuk satu baris harus terlihat, sebab ia hanya tahu bagaimana menangani daftar kosong dan bagaimana melakukan perulangan. Bentuk visual tiap baris sepenuhnya ditentukan oleh fungsi `render` yang dioper pemanggil, yang dipanggil sekali untuk tiap `item` beserta `indeks`-nya. Generic `<T>` pada `Props<T>` dan `Daftar<T>` berarti tipe `item` di dalam `render` otomatis mengikuti tipe array yang dioper lewat `items`, sehingga mengoper `produk: Produk[]` membuat parameter `p` di `render={(p) => ...}` otomatis bertipe `Produk`, tanpa kamu menuliskan tipenya secara manual.',
      ),

      h2('Varian `children` sebagai fungsi'),
      code(
        'tsx',
        `
        <Daftar items={produk}>
          {(p) => <li key={p.id}>{p.nama}</li>}
        </Daftar>

        // Implementasinya cuma berubah tipe children:
        type Props<T> = {
          items: T[];
          children: (item: T, indeks: number) => React.ReactNode;
        };
        `,
      ),
      p(
        'Keduanya setara. Pakai `children` kalau hanya ada satu fungsi; pakai prop bernama kalau ada beberapa slot yang berbeda (`renderHeader`, `renderRow`, `renderFooter`) — karena nama membuat call site terbaca.',
      ),

      h2('Kapan render props masih menang atas custom hook'),
      p(
        'Sebagian besar kasus "berbagi logika" sekarang lebih baik ditulis sebagai custom hook. Tetapi render props tetap unggul untuk satu hal, yaitu ketika komponennya juga **merender sesuatu** seperti struktur, pembungkus, atau perilaku DOM, dan bukan sekadar menghitung nilai.',
      ),
      code(
        'tsx',
        `
        // Komponen ini merender elemen pengamat DAN memberi statusnya.
        // Custom hook tidak bisa merender apa pun.
        <SaatTerlihat>
          {(terlihat) => <img src={terlihat ? asli : placeholder} alt="" />}
        </SaatTerlihat>
        `,
      ),
      p(
        'Contoh ini tepat sasaran karena `SaatTerlihat` melakukan **dua** hal yang tidak bisa dipisahkan, sebab ia memasang `IntersectionObserver` sebagai logika sekaligus merender elemen yang diamati observer itu. Custom hook bisa mengerjakan bagian pertama, tapi tidak bisa merender elemen apa pun, sehingga pemakainya tetap harus menyiapkan ref dan elemennya sendiri. Dengan render props, keduanya datang sepaket, karena komponen menyediakan elemen dan pengamatnya lalu **menyerahkan hasilnya** ke fungsi yang kamu tulis. Perhatikan fungsi itu menerima `terlihat` sebagai argumen dan bebas memakainya untuk apa saja. Di sini ia memilih antara gambar asli dan placeholder, tetapi bisa juga menjalankan animasi atau memuat data. Komponen tidak pernah menentukan tampilannya, sebab ia hanya menyediakan informasi.',
      ),
      table(
        ['Kebutuhan', 'Pilihan'],
        [
          ['Berbagi logika murni (nilai, efek, state)', 'Custom hook'],
          ['Berbagi logika **dan** merender struktur', 'Render props / children sebagai fungsi'],
          ['Beberapa komponen yang berbagi state', 'Compound component'],
          ['Membungkus komponen lain secara massal', 'HOC (pola lama — lihat sub-bab berikutnya)'],
        ],
      ),

      h2('Jebakan: fungsi baru setiap render'),
      p(
        'Fungsi render adalah fungsi baru di setiap render induk, jadi `React.memo` pada komponen penerimanya tidak akan menolong. Dengan React Compiler aktif hal ini sering ditangani otomatis; tanpanya, sadari bahwa memo di sini biasanya sia-sia.',
      ),
      callout(
        'warning',
        'Jangan bersarang terlalu dalam',
        'Tiga render props bersarang menghasilkan bentuk kode yang dulu disebut "callback hell" versi JSX — indentasi terus menjorok dan alurnya sulit diikuti. Kalau sudah sampai dua tingkat, pertimbangkan mengganti sebagiannya dengan custom hook.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi punya empat tempat yang menampilkan daftar dengan pemilihan baris, yaitu daftar pesanan, daftar produk, daftar pengguna, dan daftar berkas. Logika pemilihannya sama persis di keempatnya, yaitu simpan kumpulan id yang terpilih, sediakan pilih satu, pilih semua, dan bersihkan. Tampilannya berbeda jauh. Menyalin logikanya empat kali berarti empat tempat yang harus diperbaiki setiap kali ada bug.',
      ),
      p(
        'Render props menyelesaikan itu dengan membagi **logikanya**, bukan tampilannya. Bentuk yang dipakai hari ini biasanya `children` berupa fungsi.',
      ),
      code(
        'tsx',
        `
        type PemilihProps<T> = {
          item: readonly T[];
          ambilId: (x: T) => string;
          children: (alat: {
            terpilih: ReadonlySet<string>;
            adaYangDipilih: boolean;
            semuaTerpilih: boolean;
            pilih: (id: string) => void;
            pilihSemua: () => void;
            bersihkan: () => void;
          }) => ReactNode;
        };

        export function Pemilih<T>({ item, ambilId, children }: PemilihProps<T>) {
          const [terpilih, setTerpilih] = useState<ReadonlySet<string>>(new Set());

          const semuaId = item.map(ambilId);
          const semuaTerpilih = semuaId.length > 0 && semuaId.every((id) => terpilih.has(id));

          function pilih(id: string) {
            setTerpilih((lama) => {
              // Set BARU, bukan mengubah yang lama.
              const baru = new Set(lama);
              if (baru.has(id)) baru.delete(id);
              else baru.add(id);
              return baru;
            });
          }

          return children({
            terpilih,
            adaYangDipilih: terpilih.size > 0,
            semuaTerpilih,
            pilih,
            pilihSemua: () => setTerpilih(semuaTerpilih ? new Set() : new Set(semuaId)),
            bersihkan: () => setTerpilih(new Set()),
          });
        }
        `,
        { filename: 'src/ui/Pemilih.tsx' },
      ),
      code(
        'tsx',
        `
        // Dipakai untuk tabel.
        <Pemilih item={pesanan} ambilId={(p) => p.id}>
          {({ terpilih, pilih, adaYangDipilih, bersihkan }) => (
            <>
              {adaYangDipilih ? (
                <BilahAksi jumlah={terpilih.size} onBersihkan={bersihkan} />
              ) : null}
              <table>
                {pesanan.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={terpilih.has(p.id)}
                        onChange={() => pilih(p.id)}
                        aria-label={\`Pilih pesanan \${p.nomor}\`}
                      />
                    </td>
                    <td>{p.nomor}</td>
                  </tr>
                ))}
              </table>
            </>
          )}
        </Pemilih>

        // Dipakai untuk grid kartu. Logika sama, tampilan berbeda jauh.
        <Pemilih item={berkas} ambilId={(b) => b.id}>
          {({ terpilih, pilih }) => (
            <div className="grid">
              {berkas.map((b) => (
                <KartuBerkas
                  key={b.id}
                  berkas={b}
                  terpilih={terpilih.has(b.id)}
                  onKlik={() => pilih(b.id)}
                />
              ))}
            </div>
          )}
        </Pemilih>
        `,
        { filename: 'Dua tampilan yang sangat berbeda, satu logika' },
      ),
      p(
        'Perhatikan `new Set(lama)` di dalam fungsi updater, bukan `lama.add(id)`. Ini pantangan mutasi dari Bab 1 Frontend Basic yang muncul lagi, dan `Set` termasuk yang sering terlewat sebab methodnya terlihat seperti mengembalikan nilai baru. Method `add` mengembalikan `Set` yang sama, sehingga React menyimpulkan tidak ada yang berubah dan tampilan tidak diperbarui.',
      ),
      p(
        'Yang perlu jujur disebut, hari ini kebutuhan seperti ini lebih sering diselesaikan dengan **custom hook** daripada render props. Bentuk `const alat = usePemilih(item, ambilId)` lebih pendek, tidak menambah satu tingkat bersarang, dan tidak menciptakan komponen tambahan di pohon. Render props tetap punya tempatnya, dan itu dibahas di bagian terakhir sub-bab ini.',
      ),
      p(
        'Render props masih menang pada satu hal, yaitu ketika yang dibagi bukan sekadar logika melainkan juga **struktur**. Komponen yang perlu membungkus anaknya dengan elemen tertentu, memasang pengamat ukuran pada pembungkus itu, lalu memberi tahu ukurannya ke anak, tidak bisa diganti custom hook begitu saja. Di situ render props masih bentuk yang paling langsung.',
      ),
      callout(
        'info',
        'Nama polanya berasal dari prop bernama `render`',
        'Bentuk aslinya menerima prop bernama `render` yang berisi fungsi, yaitu `<Pemilih render={(alat) => ...} />`. Memakai `children` sebagai fungsi menghasilkan hal yang sama dengan bentuk yang lebih enak dibaca, dan itu yang umum dipakai hari ini. Nama polanya bertahan walaupun propnya sudah jarang bernama `render`.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 sungguhan, dan dua di antaranya berupa peringatan yang mudah diabaikan.',
      ),
      code(
        'text',
        `
        <div>{({ data }) => <span>{data}</span>}</div>

        Warning: Functions are not valid as a React child. This may happen if
        you return Component instead of <Component /> from render. Or maybe you
        meant to call this function rather than return it.
        `,
        { caption: 'Diuji sungguhan. Fungsi diberikan ke elemen yang tidak memanggilnya.' },
      ),
      p(
        'Pesannya menyebut dua kemungkinan penyebab, dan yang kedua yang berlaku di sini. Elemen biasa seperti `div` tidak memanggil `children` yang berupa fungsi, sehingga fungsinya diperlakukan sebagai isi yang harus dirender dan diabaikan. Gejalanya berupa bagian halaman yang kosong tanpa error. Pastikan komponen penerimanya memang memanggil `children`.',
      ),
      code(
        'text',
        `
        setTerpilih((lama) => {
          lama.add(id);        // Set diubah di tempat
          return lama;
        });

        // Tidak ada error. Tampilan tidak berubah sama sekali.
        `,
        { caption: '`Set` yang sama dikembalikan, sehingga React melewati penggambaran.' },
      ),
      p(
        'Method `add` pada `Set` mengubah objectnya dan mengembalikan `Set` yang sama. Karena rujukannya identik, React menyimpulkan tidak ada perubahan. Hal yang sama berlaku untuk `delete`, `clear`, dan untuk `Map` dengan `set` dan `delete`. Selalu buat salinan baru dengan `new Set(lama)` atau `new Map(lama)` lebih dulu.',
      ),
      code(
        'text',
        `
        <Pemilih item={pesanan} ambilId={(p) => p.id}>
          {({ terpilih }) => (
            <Pemilih item={berkas} ambilId={(b) => b.id}>
              {({ terpilih }) => (      // menutupi 'terpilih' dari luar
                ...
              )}
            </Pemilih>
          )}
        </Pemilih>
        `,
        { caption: 'Bersarang dua tingkat, dan nama variabelnya bertabrakan.' },
      ),
      p(
        'Tidak ada error, dan bugnya berupa nilai yang diambil dari tingkat yang salah. Ini masalah yang disebut piramida render props, dan ia muncul begitu dua atau lebih dipakai bersamaan. Custom hook tidak punya masalah ini sebab hasilnya bisa diberi nama berbeda tanpa bersarang. Kalau kamu menemukan diri menyarangkan render props, itu tanda kuat untuk pindah ke hook.',
      ),
      code(
        'text',
        `
        <Pemilih item={item} ambilId={ambilId}>
          {(alat) => <Berat alat={alat} />}
        </Pemilih>

        // Fungsi children baru dibuat tiap render.
        // Berat dianggap menerima prop baru dan digambar ulang terus.
        `,
        { caption: 'Fungsi baru tiap render membuat pengoptimalan anak tidak berlaku.' },
      ),
      p(
        'Fungsi yang ditulis langsung di JSX adalah object baru pada tiap render, sehingga komponen anak yang dioptimalkan tetap menganggap propnya berubah. Pada project yang mengaktifkan React Compiler, ini biasanya ditangani otomatis. Tanpa compiler, kalau anaknya memang berat, ini salah satu alasan memilih custom hook yang tidak menciptakan fungsi pembungkus sama sekali.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`Functions are not valid as a React child`',
            'Fungsi diberikan ke elemen yang tidak memanggilnya',
            'Pastikan komponen penerimanya memanggil `children`',
          ],
          [
            'Pilihan tidak berubah di layar',
            '`Set` atau `Map` diubah di tempat',
            'Buat salinan baru dengan `new Set(lama)`',
          ],
          [
            'Nilai diambil dari tingkat bersarang yang salah',
            'Dua render props bersarang dengan nama variabel yang sama',
            'Beri nama berbeda, atau pindah ke custom hook',
          ],
          [
            'Komponen anak digambar ulang terus',
            'Fungsi `children` baru tiap render',
            'Andalkan React Compiler, atau pindah ke custom hook',
          ],
          [
            'Kode menjorok jauh ke kanan',
            'Beberapa render props dipakai bersamaan',
            'Pindah ke custom hook, yang bisa dipanggil berdampingan',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Render props adalah pola yang masih berguna dan sudah jarang menjadi pilihan pertama. Sebagian besar kesalahan di bawah berasal dari memakainya di tempat yang custom hook lebih tepat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai render props untuk berbagi logika murni',
            'Polanya sudah dikenal',
            'Custom hook lebih pendek, tidak menambah tingkat bersarang, dan bisa dipanggil berdampingan. Pakai render props saat strukturnya juga dibagi',
          ],
          [
            'Menyarangkan beberapa render props',
            'Tiap satu menyelesaikan satu kebutuhan',
            'Kode menjorok jauh dan nama variabelnya bertabrakan. Ini yang disebut piramida render props',
          ],
          [
            'Mengubah `Set` atau `Map` di dalam updater',
            'Methodnya terlihat mengembalikan nilai baru',
            '`add` dan `set` mengembalikan object yang sama. React melewati penggambaran',
          ],
          [
            'Memberikan seluruh state internal lewat argumen',
            'Supaya pemakainya bebas',
            'Kontraknya jadi terlalu terbuka dan sulit diubah. Berikan yang memang dibutuhkan, dan sembunyikan sisanya',
          ],
          [
            'Memakai nama prop `render` alih-alih `children`',
            'Itu nama aslinya',
            'Bentuk `children` lebih enak dibaca dan tidak memaksa menulis prop tambahan. Nama polanya tetap render props',
          ],
          [
            'Memakai render props untuk sesuatu yang cukup satu komponen',
            'Supaya bisa dipakai ulang nanti',
            'Menambah lapisan tanpa pemakai kedua. Tunggu sampai kebutuhannya nyata',
          ],
        ],
      ),
      p(
        'Baris pertama layak dijadikan aturan praktis. Kalau yang kamu bagi hanya nilai dan fungsi, custom hook hampir selalu lebih baik. Kalau yang kamu bagi juga mencakup elemen pembungkus, misalnya komponen yang mengukur lebarnya sendiri lalu memberi tahu anaknya, render props masih bentuk yang paling langsung sebab hook tidak bisa merender apa pun.',
      ),
      callout(
        'tip',
        'Sediakan keduanya kalau memang berguna',
        'Tidak ada yang melarang mengekspor `usePemilih` sebagai hook sekaligus `Pemilih` sebagai komponen yang dibangun di atasnya. Pemakai yang butuh logikanya saja memakai hook, dan yang butuh pembungkus memakai komponennya. Biayanya beberapa baris, dan pemakainya mendapat bentuk yang paling cocok untuk kasusnya.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Termasuk mengoper JSX dan fungsi sebagai prop — dasar teknis pola ini.',
        },
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti render props untuk kasus berbagi logika murni tanpa merender apa pun.',
        },
        {
          label: 'Generics',
          href: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
          source: 'TypeScript',
          note: 'Mekanisme di balik `Daftar<T>` yang membuat tipe item mengalir ke fungsi render.',
        },
        {
          label: 'memo',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Kenapa memo tidak menolong ketika prop-nya adalah fungsi yang dibuat ulang tiap render.',
        },
      ),
    ],
  ),

  written(
    'hoc',
    'Higher-Order Component',
    19,
    'Pola lama yang perlu dikenali saat membaca legacy code.',
    [
      p(
        'Higher-Order Component (HOC) adalah fungsi yang menerima komponen dan mengembalikan komponen baru yang sudah dibungkus. Namanya meminjam dari higher-order function di JavaScript. Sebelum hooks ada, ini adalah cara utama berbagi logika antar komponen.',
      ),

      terms(
        {
          term: 'Higher-Order Component (HOC)',
          meaning:
            'Fungsi yang **menerima komponen** dan **mengembalikan komponen baru** yang sudah dibungkus kemampuan tambahan. Namanya meminjam dari *higher-order function* di JavaScript — fungsi yang bekerja atas fungsi lain.',
        },
        {
          term: 'awalan `with`',
          meaning:
            'Konvensi penamaan HOC memakai bentuk `withAuth`, `withTheme`, dan `withRouter`. Ini tanda pengenal paling cepat saat membaca kode lama. Tanda keduanya, **komponen yang diekspor bukan komponen yang didefinisikan**, sebab yang diekspor adalah hasil pembungkusan.',
        },
        {
          term: 'legacy code',
          meaning:
            'Kode yang sudah ada dan masih berjalan, ditulis dengan cara yang tidak lagi dianjurkan. Kamu tidak akan sering **menulis** HOC baru, tapi kamu akan **membacanya** — kode React sebelum 2019 penuh pola ini, dan banyak library masih memakainya.',
        },
        {
          term: 'displayName',
          meaning:
            'Properti yang menentukan nama sebuah komponen di React DevTools. HOC yang tidak mengaturnya membuat pohon komponen berisi `Unknown` atau `Anonymous` — dan menelusuri masalah di pohon tanpa nama jauh lebih lambat.',
        },
        {
          term: 'tabrakan nama prop',
          meaning:
            'Dua HOC yang sama-sama menyuntikkan prop bernama `data` akan saling menimpa **tanpa peringatan apa pun**. Ini kelas bug yang tidak mungkin terjadi pada custom hook, karena di sana kamu sendiri yang menamai hasilnya.',
        },
        {
          term: 'wrapper hell',
          meaning:
            'Bentuk `withAuth(withTheme(withRouter(withData(Komponen))))`. Empat lapisan tambahan di pohon komponen dan di DevTools, dan urutannya diam-diam bermakna. Ini analog dari "callback hell" pada pola sebelumnya.',
        },
        {
          term: 'React.ComponentType<P>',
          meaning:
            'Tipe TypeScript untuk "apa pun yang bisa dipakai sebagai komponen React yang menerima props bertipe `P`". Dipakai HOC karena ia harus menerima komponen apa pun — dan justru keumuman inilah yang membuat tipenya sering berakhir sebagai `any`.',
        },
        {
          term: 'spread props (`{...props}`)',
          meaning:
            'Meneruskan seluruh props yang diterima pembungkus ke komponen di dalamnya. Praktis, tapi ia juga penyebab masalah "sumber prop tidak terlihat": membaca komponen anak, kamu tidak tahu sebuah prop datang dari mana tanpa menelusuri rantai pembungkusnya.',
        },
      ),

      h2('Bentuknya'),
      code(
        'tsx',
        `
        function withAuth<P extends object>(Komponen: React.ComponentType<P>) {
          return function KomponenTerlindungi(props: P) {
            const { user, memuat } = useSesi();

            if (memuat) return <Skeleton />;
            if (!user) return <Redirect ke="/masuk" />;

            return <Komponen {...props} />;
          };
        }

        const DasborTerlindungi = withAuth(Dasbor);
        `,
      ),
      p(
        'Baca `withAuth` sebagai fungsi biasa yang menerima satu komponen dan mengembalikan komponen baru, dan bukan sihir apa pun. `<P extends object>` adalah generic yang berarti "apa pun bentuk props komponen aslinya, pertahankan bentuk itu", sedangkan `React.ComponentType<P>` adalah tipe untuk "komponen React yang menerima props bertipe `P`". Fungsi `KomponenTerlindungi` yang dikembalikan **membungkus** `Komponen` asli, sebab ia memeriksa sesi lebih dulu lalu hanya merender `<Komponen {...props} />`, yang meneruskan seluruh props yang diterimanya apa adanya, kalau pemeriksaan itu lolos. `DasborTerlindungi` yang dihasilkan `withAuth(Dasbor)` bukan `Dasbor` itu sendiri, melainkan komponen baru yang **merender** `Dasbor` di dalamnya setelah pemeriksaan sesi selesai. Kalau kamu merender `<DasborTerlindungi />`, yang sebenarnya terjadi adalah `KomponenTerlindungi` dirender, dan ia baru merender `Dasbor` kalau `user` ada.',
      ),

      h2('Kenapa kamu tetap perlu mengenalinya'),
      p(
        'Kamu tidak akan sering menulis HOC baru, tapi kamu akan **membacanya**. Banyak library masih memakainya, dan kode React yang ditulis sebelum 2019 penuh dengan pola ini. Tanda pengenalnya: nama berawalan `with`, dan komponen yang diekspor bukan komponen yang didefinisikan.',
      ),

      h2('Masalah yang membuatnya ditinggalkan'),
      ol(
        '**Nama komponen hilang di React DevTools.** Pohon komponen berisi `Unknown` atau `Anonymous` kecuali kamu mengatur `displayName` sendiri.',
        '**Tabrakan nama prop.** Dua HOC yang sama-sama menyuntik prop `data` akan saling menimpa tanpa peringatan.',
        '**Sumber prop tidak terlihat.** Membaca komponen anak, kamu tidak tahu prop itu datang dari mana — harus menelusuri rantai pembungkusnya.',
        '**Wrapper hell.** `withAuth(withTheme(withRouter(withData(Komponen))))` menambah empat lapis di pohon DOM dan di DevTools.',
        '**Tipe TypeScript jadi rumit.** Menyimpulkan tipe melalui beberapa lapisan HOC sering berakhir dengan `any`.',
      ),

      h2('Penggantinya: custom hook'),
      compare(
        {
          title: 'HOC',
          lang: 'tsx',
          code: `
          const Dasbor = withAuth(function Dasbor({ user }) {
            return <h1>Halo {user.nama}</h1>;
          });

          // Dari mana 'user' datang?
          // Harus baca withAuth untuk tahu.
          `,
          notes: ['Satu lapisan tambahan di pohon', 'Asal prop tidak terlihat'],
        },
        {
          title: 'Custom hook',
          lang: 'tsx',
          code: `
          function Dasbor() {
            const { user, memuat } = useSesi();

            if (memuat) return <Skeleton />;
            if (!user) return <Redirect ke="/masuk" />;

            return <h1>Halo {user.nama}</h1>;
          }
          `,
          notes: ['Tidak ada lapisan tambahan', 'Sumber setiap nilai terbaca di tempat'],
        },
      ),
      p(
        'Komentar di kolom kiri menyebut keluhan yang paling nyata, yaitu `user` muncul sebagai prop **tanpa ada yang mengopernya di call site**. Untuk tahu dari mana ia datang, pembaca harus membuka `withAuth`, dan kalau ada dua HOC bertumpuk, ia harus membuka keduanya sambil menebak mana yang menyuntikkan prop yang mana. Masalahnya bertambah saat dua HOC kebetulan menyuntikkan prop bernama sama, sebab yang terluar menang secara diam-diam. Kolom kanan menghapus seluruh kelas masalah itu karena `useSesi()` **terlihat di dalam komponen**, tepat di baris yang memakainya. Perhatikan keuntungan kedua yang mudah terlewat, yaitu penanganan `memuat` dan `!user` kini berada di komponen itu sendiri sebagai early return biasa, alih-alih tersembunyi di dalam pembungkus yang perilakunya sama untuk semua komponen yang ia bungkus.',
      ),

      h2('Yang masih pantas jadi HOC'),
      p(
        'Ada satu kategori yang tidak bisa digantikan hook, karena hook tidak bisa merender apa pun di sekitar komponen: pembungkus yang benar-benar **menambah elemen**. `React.memo` sendiri adalah HOC. Begitu juga pembungkus error boundary dan beberapa integrasi analitik. Di luar itu, pilih custom hook.',
      ),
      callout(
        'tip',
        'Kalau harus menulis HOC',
        'Selalu set `displayName` (`KomponenTerlindungi.displayName = \\`withAuth(${Komponen.displayName ?? Komponen.name})\\`;`) dan teruskan `ref` dengan benar. Dua hal ini yang paling sering dilupakan, dan keduanya baru terasa saat kamu sedang men-debug sesuatu yang lain.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Aplikasi lama punya lima belas halaman yang harus memeriksa izin sebelum ditampilkan. Solusinya berupa pembungkus bernama `denganIzin` yang membungkus tiap halaman. Setahun kemudian ada halaman yang dibungkus tiga pembungkus sekaligus, yaitu izin, pelacakan analitik, dan tema. Saat ada bug, jejak errornya menampilkan tiga nama pembungkus dan tidak satu pun nama komponen aslinya.',
      ),
      p(
        'Higher-order component adalah fungsi yang menerima komponen lalu mengembalikan komponen baru. Ia masih ditemui di kode lama dan di beberapa pustaka, dan hampir selalu ada bentuk yang lebih baik untuk kode baru.',
      ),
      code(
        'tsx',
        `
        // Bentuknya: fungsi yang menerima komponen, mengembalikan komponen.
        export function denganIzin<P extends object>(
          Komponen: ComponentType<P>,
          izinDibutuhkan: string,
        ) {
          function Terbungkus(props: P) {
            const { izin, memuat } = useIzin();

            if (memuat) return <Skeleton />;
            if (!izin.includes(izinDibutuhkan)) return <TidakBerhak />;

            return <Komponen {...props} />;
          }

          // WAJIB. Tanpa ini, DevTools dan jejak error menampilkan "Terbungkus".
          Terbungkus.displayName = \`denganIzin(\${Komponen.displayName ?? Komponen.name ?? 'Komponen'})\`;

          return Terbungkus;
        }

        // Pemakaiannya:
        export default denganIzin(HalamanLaporan, 'laporan:baca');
        `,
        { filename: 'src/hoc/denganIzin.tsx' },
      ),
      p(
        'Baris `displayName` adalah yang paling sering dilupakan dan paling terasa saat menelusuri bug. Tanpa itu, seluruh komponen yang dibungkus muncul sebagai `Terbungkus` di React DevTools dan di jejak error, sehingga lima belas halaman terlihat identik. Dengan format yang menyertakan nama aslinya, pembungkusnya terlihat sekaligus komponen aslinya tetap terbaca.',
      ),
      code(
        'tsx',
        `
        // Bentuk yang lebih baik untuk kode baru: komponen penjaga.
        export function Penjaga({
          izinDibutuhkan,
          children,
        }: {
          izinDibutuhkan: string;
          children: ReactNode;
        }) {
          const { izin, memuat } = useIzin();

          if (memuat) return <Skeleton />;
          if (!izin.includes(izinDibutuhkan)) return <TidakBerhak />;

          return <>{children}</>;
        }

        // Pemakaiannya terlihat di tempat pemakaian, bukan tersembunyi di ekspor.
        export default function HalamanLaporan() {
          return (
            <Penjaga izinDibutuhkan="laporan:baca">
              <IsiLaporan />
            </Penjaga>
          );
        }
        `,
        { filename: 'src/auth/Penjaga.tsx' },
      ),
      p(
        'Perbedaan yang menentukan bukan jumlah baris melainkan **di mana keputusannya terlihat**. Pada versi HOC, fakta bahwa halaman ini butuh izin tersembunyi di baris ekspor paling bawah berkas, dan seseorang yang membaca komponennya dari atas tidak akan tahu. Pada versi komponen, ia tertulis di dalam JSX tempat ia berlaku.',
      ),
      p(
        'Keuntungan lain yang sering menentukan adalah tipe. HOC yang generik menuntut manipulasi tipe yang rumit supaya props aslinya tetap terbaca, dan tiga HOC bertumpuk sering membuat penyimpulan tipenya menyerah. Komponen penjaga tidak punya masalah itu sebab ia tidak menyentuh tipe apa pun milik anaknya.',
      ),
      p(
        'Perlu disebut bahwa HOC belum mati sepenuhnya. Ia masih tepat untuk hal yang benar-benar harus membungkus komponen dari luar tanpa mengubah kodenya, misalnya pembungkus pelacakan galat dari pustaka pihak ketiga, atau `memo` dan `forwardRef` yang memang berbentuk HOC. Yang sudah digantikan adalah pemakaiannya untuk berbagi logika, dan penggantinya custom hook.',
      ),
      callout(
        'warning',
        'HOC bertumpuk membuat penelusuran bug jauh lebih sulit',
        'Tiga pembungkus berarti tiga lapisan tambahan di pohon komponen, tiga nama di jejak error, dan tiga tempat props bisa berubah tanpa terlihat. Kalau kamu menemukan komponen yang dibungkus lebih dari satu HOC, hampir selalu ada bentuk yang lebih langsung, yaitu custom hook untuk logikanya dan komponen pembungkus untuk strukturnya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada HOC, dan tiga di antaranya tidak melempar apa pun.',
      ),
      code(
        'text',
        `
        // Tanpa displayName.
        // React DevTools menampilkan:

        <Terbungkus>
          <Terbungkus>
            <Terbungkus>
        `,
        { caption: 'Tiga pembungkus, dan tidak satu pun nama aslinya terlihat.' },
      ),
      p(
        'Tidak ada error, dan menelusuri bug menjadi jauh lebih lambat. Kamu tidak bisa tahu komponen mana yang sedang dilihat, dan jejak error pun sama tidak berguna. Menyetel `displayName` dengan format yang menyertakan nama aslinya adalah satu baris yang mengubah pengalaman debugging secara nyata.',
      ),
      code(
        'text',
        `
        function denganIzin(Komponen) {
          return function Terbungkus(props) {
            // ...
            return <Komponen {...props} />;
          };
        }

        // Dipanggil DI DALAM render:
        function Halaman() {
          const Aman = denganIzin(IsiLaporan);   // komponen BARU tiap render
          return <Aman />;
        }

        // Seluruh state di dalam IsiLaporan hilang pada tiap render.
        `,
        { caption: 'HOC dipanggil di dalam render, menghasilkan komponen baru tiap kali.' },
      ),
      p(
        'React membandingkan jenis komponen berdasarkan identitas fungsinya. Karena `denganIzin` mengembalikan fungsi baru pada tiap pemanggilan, React menyimpulkan komponennya berganti lalu membongkar seluruh pohonnya. Gejalanya berupa state yang hilang dan fokus yang lepas pada tiap ketikan. Panggil HOC sekali di tingkat modul, bukan di dalam render.',
      ),
      code(
        'text',
        `
        const HalamanAman = denganIzin(HalamanLaporan, 'laporan:baca');
        <HalamanAman idLaporan={7} />

        error TS2322: Property 'idLaporan' does not exist on type
        'IntrinsicAttributes'.
        `,
        { caption: 'Tipe props asli hilang setelah dibungkus.' },
      ),
      p(
        'Ini terjadi kalau HOC tidak menuliskan generiknya dengan benar. Bentuk `<P extends object>(Komponen: ComponentType<P>) => (props: P) => ...` pada studi kasus menjaga tipenya tetap mengalir. Tanpa itu, seluruh keamanan tipe hilang tepat di titik pemakaian, dan itu salah satu alasan terkuat memilih komponen pembungkus untuk kode baru.',
      ),
      code(
        'text',
        `
        const Tombol = denganTema(TombolDasar);
        const ref = useRef<HTMLButtonElement>(null);
        <Tombol ref={ref} />

        // ref tidak sampai ke tombol aslinya. Nilainya tetap null.
        `,
        { caption: '`ref` tidak diteruskan otomatis lewat pembungkus.' },
      ),
      p(
        'Atribut `ref` bukan prop biasa dan tidak ikut dalam `{...props}` pada React versi lama. Di React 19 `ref` sudah bisa diteruskan sebagai prop biasa untuk komponen fungsi, dan itu menghilangkan sebagian masalahnya. Untuk HOC yang harus mendukung versi lama, `forwardRef` diperlukan dan itu satu lapisan lagi yang mudah terlewat.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'DevTools menampilkan nama pembungkus, bukan komponen aslinya',
            '`displayName` tidak disetel',
            'Setel dengan format yang menyertakan nama aslinya',
          ],
          [
            'State hilang dan fokus lepas tiap render',
            'HOC dipanggil di dalam render',
            'Panggil sekali di tingkat modul',
          ],
          [
            "`Property 'x' does not exist on type 'IntrinsicAttributes'`",
            'Generik HOC tidak menjaga tipe props asli',
            'Tulis generiknya dengan benar, atau pakai komponen pembungkus',
          ],
          [
            '`ref` tidak sampai ke elemen aslinya',
            '`ref` tidak ikut dalam penyebaran props',
            'Teruskan secara eksplisit, dan periksa perilakunya di versi React yang dipakai',
          ],
          [
            'Jejak error memuat tiga lapisan tak dikenal',
            'Beberapa HOC bertumpuk',
            'Ganti dengan custom hook untuk logikanya dan komponen untuk strukturnya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'HOC adalah pola yang sebagian besar pemakaiannya sudah punya pengganti yang lebih baik, dan sebagian besar kesalahan di bawah berasal dari memakainya karena ditemukan di contoh lama.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memakai HOC untuk berbagi logika',
            'Banyak contoh lama memakainya',
            'Custom hook lebih pendek, menjaga tipe, dan tidak menambah lapisan di pohon. HOC untuk berbagi logika sudah digantikan',
          ],
          [
            'Melupakan `displayName`',
            'Komponennya kan tetap jalan',
            'Seluruh komponen yang dibungkus terlihat identik di DevTools dan di jejak error',
          ],
          [
            'Memanggil HOC di dalam render',
            'Supaya bisa memakai nilai dari render itu',
            'Komponen baru tiap render, sehingga seluruh state di dalamnya hilang. Panggil di tingkat modul',
          ],
          [
            'Menumpuk beberapa HOC',
            'Tiap satu menyelesaikan satu kebutuhan',
            'Jejak error dan pohon komponen jadi penuh lapisan tak dikenal, dan penyimpulan tipe sering menyerah',
          ],
          [
            'Menambahkan props baru di dalam HOC tanpa menuliskannya di tipe',
            'Pemakainya kan tahu',
            'Props yang muncul entah dari mana membuat komponennya sulit dipahami dan sulit diuji',
          ],
          [
            'Membuang HOC dari pustaka pihak ketiga yang memang berbentuk HOC',
            'Katanya HOC sudah usang',
            '`memo` dan `forwardRef` memang berbentuk HOC dan tetap tepat. Yang digantikan adalah pemakaiannya untuk berbagi logika',
          ],
        ],
      ),
      p(
        'Baris terakhir layak ditegaskan supaya nasihatnya tidak dibaca terlalu keras. Bentuk HOC tetap tepat untuk hal yang benar-benar harus membungkus dari luar, dan React sendiri menyediakan beberapa. Yang sudah digantikan adalah HOC yang dibuat sendiri untuk berbagi logika, misalnya `denganData`, `denganAuth`, dan `denganTema`. Ketiganya lebih baik menjadi custom hook.',
      ),
      callout(
        'info',
        'Cara memutuskan pengganti yang tepat',
        'Kalau HOC-mu hanya menyediakan nilai dan fungsi, ganti dengan custom hook. Kalau ia merender sesuatu di sekitar komponennya, misalnya penjaga izin atau pembungkus tata letak, ganti dengan komponen biasa yang menerima `children`. Kalau ia melakukan keduanya, pisahkan menjadi hook untuk logikanya dan komponen untuk strukturnya.',
      ),
      references(
        {
          label: 'memo — sebuah HOC bawaan React',
          href: 'https://react.dev/reference/react/memo',
          source: 'React',
          note: 'Contoh HOC yang masih relevan karena ia benar-benar membungkus, bukan sekadar berbagi logika.',
        },
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Pengganti resmi HOC untuk berbagi logika, tanpa lapisan tambahan di pohon komponen.',
        },
        {
          label: 'Manipulating the DOM with Refs',
          href: 'https://react.dev/learn/manipulating-the-dom-with-refs',
          source: 'React',
          note: 'Meneruskan `ref` melewati pembungkus — hal kedua yang paling sering dilupakan penulis HOC.',
        },
        {
          label: 'React Developer Tools',
          href: 'https://react.dev/learn/react-developer-tools',
          source: 'React',
          note: 'Alat tempat hilangnya nama komponen akibat `displayName` yang tidak diatur benar-benar terasa.',
        },
      ),
    ],
  ),

  written(
    'custom-hook-pengganti',
    'Custom Hook sebagai pengganti HOC & render props',
    22,
    'Berbagi logika tanpa membungkus pohon komponen.',
    [
      p(
        'Custom hook adalah fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain. Itu seluruh definisinya — tidak ada API khusus, tidak ada pendaftaran. Kesederhanaan itulah yang membuatnya menggantikan dua pola sebelumnya.',
      ),

      terms(
        {
          term: 'custom hook',
          meaning:
            'Fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain. Itu **seluruh** definisinya — tidak ada API khusus, tidak ada pendaftaran, tidak ada pembungkus. Kesederhanaan itulah yang membuatnya menggantikan HOC dan render props.',
        },
        {
          term: 'berbagi logika, bukan state',
          meaning:
            'Salah paham paling sering tentang custom hook. Dua komponen yang memanggil `useUkuranJendela()` **tidak** berbagi satu state — masing-masing punya salinannya sendiri. Custom hook membagikan **resep**, bukan **nilainya**.',
        },
        {
          term: 'nilai bersama',
          meaning:
            'Kalau kamu benar-benar butuh satu nilai yang sama dibaca banyak komponen, itu **bukan** tugas custom hook. Itu tugas Context (untuk yang jarang berubah) atau store global dengan selector (untuk yang sering) — dibahas di Bab 5.',
        },
        {
          term: 'debounce',
          meaning:
            'Menunggu jeda setelah masukan terakhir sebelum bertindak. Bagian yang membuatnya benar-benar bekerja ada di cleanup: `clearTimeout` membatalkan timer lama **setiap kali** nilainya berubah. Tanpa itu, ia cuma menunda semua ketikan, bukan menggabungkannya.',
        },
        {
          term: 'cleanup',
          meaning:
            'Fungsi yang di-`return` dari dalam Effect untuk membatalkan sinkronisasi sebelumnya — melepas listener, membatalkan timer, menutup koneksi. Setiap custom hook yang memasang sesuatu ke dunia luar wajib punya pasangannya.',
        },
        {
          term: 'resize listener',
          meaning:
            'Langganan ke event `resize` pada `window`, yang menyala tiap kali ukuran jendela berubah. Contoh klasik pekerjaan custom hook: satu langganan, satu pembatalan, dan komponen pemakainya tidak perlu tahu detail apa pun.',
        },
        {
          term: 'awalan `use`',
          meaning:
            'Bukan sekadar konvensi penamaan. Awalan inilah yang membuat `eslint-plugin-react-hooks` tahu bahwa aturan hooks berlaku di dalam fungsi itu. Fungsi yang memanggil hook tanpa awalan `use` tidak akan diperiksa — pelanggarannya lolos diam-diam.',
        },
        {
          term: 'generic `<T>`',
          meaning:
            'Pada `useDebounce<T>(nilai: T): T`, ia berarti "apa pun tipe yang kamu masukkan, itu juga yang keluar". String masuk, string keluar — tanpa perlu menulis satu versi hook per tipe, dan tanpa kehilangan tipe di sisi pemanggil.',
        },
      ),

      h2('Dari HOC ke hook'),
      code(
        'ts',
        `
        // Satu fungsi, tanpa komponen pembungkus.
        export function useUkuranJendela() {
          const [ukuran, setUkuran] = useState({ lebar: 0, tinggi: 0 });

          useEffect(() => {
            function ukur() {
              setUkuran({ lebar: window.innerWidth, tinggi: window.innerHeight });
            }

            ukur();                                   // ukur sekali saat pasang
            window.addEventListener('resize', ukur);
            return () => window.removeEventListener('resize', ukur);
          }, []);

          return ukuran;
        }
        `,
      ),
      p(
        'Bandingkan dengan `withAuth` di sub-bab sebelumnya, sebab HOC menghasilkan **komponen baru** yang membungkus komponen lain, sementara `useUkuranJendela` hanyalah fungsi yang mengembalikan **nilai**. Tidak ada lapisan tambahan di pohon komponen, dan tidak ada `props` yang perlu diteruskan lewat `{...props}`, sehingga komponen yang memakainya cukup memanggil `const { lebar } = useUkuranJendela()` seperti memanggil `useState`. Effect di dalamnya mengukur ulang setiap kali jendela berubah ukuran, dan fungsi yang dikembalikan (`() => window.removeEventListener(...)`) memastikan pendengar `resize` itu dilepas saat komponen yang memakai hook ini dilepas, yaitu pola cleanup yang sama dengan Bab 7. Karena logikanya berdiri sendiri di luar komponen mana pun, hook yang sama bisa dipanggil dari sepuluh komponen berbeda tanpa satu pun perlu tahu bagaimana ia bekerja di dalamnya.',
      ),

      h2('Yang dibagi adalah logika, bukan state'),
      p(
        'Ini salah paham paling sering. Dua komponen yang memanggil `useUkuranJendela()` **tidak** berbagi satu state — masing-masing punya salinannya sendiri. Custom hook membagikan **resep**, bukan **nilainya**.',
      ),
      code(
        'tsx',
        `
        function A() {
          const { lebar } = useUkuranJendela();  // state milik A
        }

        function B() {
          const { lebar } = useUkuranJendela();  // state milik B, terpisah
        }
        `,
      ),
      p(
        'Kalau kamu benar-benar butuh satu nilai bersama, itu bukan tugas custom hook — itu tugas Context atau store global (Bab 5).',
      ),

      h2('Contoh yang langsung berguna'),
      code(
        'ts',
        `
        // Menunda nilai sampai pengetikan berhenti.
        export function useDebounce<T>(nilai: T, jeda = 300): T {
          const [tertunda, setTertunda] = useState(nilai);

          useEffect(() => {
            const timer = setTimeout(() => setTertunda(nilai), jeda);
            // Cleanup membatalkan timer lama setiap kali nilai berubah —
            // inilah yang membuatnya benar-benar "debounce".
            return () => clearTimeout(timer);
          }, [nilai, jeda]);

          return tertunda;
        }
        `,
      ),
      code(
        'ts',
        `
        // Membaca dan menulis localStorage dengan aman.
        export function usePenyimpanan<T>(kunci: string, awal: T) {
          const [nilai, setNilai] = useState<T>(awal);
          const [terhidrasi, setTerhidrasi] = useState(false);

          // Server tidak punya localStorage, jadi pembacaan dilakukan setelah pasang.
          useEffect(() => {
            try {
              const tersimpan = window.localStorage.getItem(kunci);
              if (tersimpan !== null) setNilai(JSON.parse(tersimpan) as T);
            } catch {
              // Penyimpanan diblokir atau isinya rusak: pakai nilai awal, jangan gagalkan render.
            }
            setTerhidrasi(true);
          }, [kunci]);

          function simpan(baru: T) {
            setNilai(baru);
            try {
              window.localStorage.setItem(kunci, JSON.stringify(baru));
            } catch {
              // Kuota penuh atau mode privat — nilai di memori tetap benar.
            }
          }

          return { nilai, simpan, terhidrasi };
        }
        `,
      ),
      p(
        'Hook ini mengembalikan **objek tiga field**, sesuai aturan "tiga atau lebih pakai objek" dari Bab 5, dan ketiganya menjawab kebutuhan berbeda, yakni `nilai` untuk ditampilkan, `simpan` untuk mengubah, dan `terhidrasi` untuk mengetahui apakah nilainya sudah bisa dipercaya. Perhatikan pembacaan dari `localStorage` sengaja ditaruh di dalam `useEffect` dan bukan sebagai nilai awal `useState`, sebab di server tidak ada `localStorage` sama sekali, jadi membacanya saat render akan langsung melempar error. Kedua blok `catch` yang isinya hanya komentar juga disengaja, sebab kegagalan penyimpanan **tidak boleh menggagalkan render**, dan nilai di memori tetap benar meski tidak tersimpan. Yang tersisa adalah masalah waktu, dan itulah tugas `terhidrasi` yang dijelaskan di kotak berikut.',
      ),
      callout(
        'info',
        'Kenapa ada `terhidrasi`',
        'Di SSR, render pertama di server selalu memakai nilai awal karena `localStorage` tidak ada di sana. Kalau komponen langsung menampilkan data tersimpan, React akan melaporkan hydration mismatch. Bendera `terhidrasi` memberi komponen cara menampilkan skeleton sampai nilainya benar-benar tersedia — pola yang dipakai website ini.',
      ),

      h2('Aturan menulis custom hook yang baik'),
      ul(
        '**Nama harus diawali `use`.** Bukan gaya penulisan — linter memakainya untuk menegakkan aturan hooks.',
        '**Satu tanggung jawab.** `useAuthAndThemeAndCart` adalah tiga hook yang menyamar jadi satu.',
        '**Kembalikan objek kalau lebih dari dua nilai**, array kalau pemanggil perlu menamai ulang (seperti `useState`).',
        '**Jangan mengekstrak sesuatu yang hanya dipakai sekali.** Hook dengan satu pemanggil biasanya cuma memindahkan kode, bukan menyederhanakannya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Empat halaman punya kotak pencarian dengan perilaku yang sama, yaitu tunda pemanggilan sampai pengguna berhenti mengetik, batalkan permintaan sebelumnya, abaikan hasil yang sudah usang, dan tampilkan keadaan memuat. Logikanya empat puluh baris, disalin empat kali. Saat ditemukan bug pada penanganan pembatalan, tiga dari empat salinan diperbaiki dan yang keempat terlewat selama dua bulan.',
      ),
      p(
        'Custom hook adalah cara paling langsung membagi logika seperti ini. Ia hanya fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain.',
      ),
      code(
        'tsx',
        `
        export function usePencarian<T>(
          cari: (kata: string, sinyal: AbortSignal) => Promise<T[]>,
          { jedaMs = 400 } = {},
        ) {
          const [kata, setKata] = useState('');
          const [keadaan, setKeadaan] = useState<Keadaan<T[]>>({ status: 'kosong' });
          const idPermintaan = useRef(0);

          useEffect(() => {
            if (kata.trim() === '') {
              setKeadaan({ status: 'kosong' });
              return;
            }

            const kendali = new AbortController();
            const idSaya = ++idPermintaan.current;

            const timer = setTimeout(async () => {
              setKeadaan((lama) =>
                lama.status === 'sukses'
                  ? { status: 'memuat-ulang', data: lama.data }
                  : { status: 'memuat' },
              );

              try {
                const hasil = await cari(kata.trim(), kendali.signal);
                if (idSaya !== idPermintaan.current) return;      // sudah usang
                setKeadaan(hasil.length === 0 ? { status: 'kosong' } : { status: 'sukses', data: hasil });
              } catch (galat) {
                if ((galat as Error).name === 'AbortError') return;   // sengaja dibatalkan
                if (idSaya !== idPermintaan.current) return;
                setKeadaan({ status: 'gagal', galat: galat as Error });
              }
            }, jedaMs);

            // Dijalankan saat kata berubah, DAN saat komponen dilepas.
            return () => {
              clearTimeout(timer);
              kendali.abort();
            };
          }, [kata, cari, jedaMs]);

          return { kata, setKata, keadaan };
        }
        `,
        { filename: 'src/hook/usePencarian.ts' },
      ),
      p(
        'Fungsi pembersih yang mengembalikan `clearTimeout` dan `kendali.abort()` adalah bagian yang paling menentukan. Ia berjalan pada dua keadaan, yaitu saat `kata` berubah sehingga permintaan lama dibatalkan, dan saat komponennya dilepas sehingga tidak ada permintaan yang menggantung. Ini gabungan debounce dari Bab 1 Frontend Basic dan pembatalan dari Bab 3, dikemas menjadi satu.',
      ),
      p(
        'Penjaga `idSaya !== idPermintaan.current` muncul dua kali, yaitu di jalur sukses dan di jalur gagal. Keduanya diperlukan. Tanpa penjaga di jalur gagal, permintaan lama yang kehabisan waktu akan menimpa hasil permintaan baru yang sudah berhasil dengan pesan kesalahan. Ini bug yang sudah dibahas di Bab 5 Frontend Basic dan muncul kembali di sini.',
      ),
      code(
        'tsx',
        `
        // Pemakaiannya di empat halaman, masing-masing dengan tampilan sendiri.
        function CariProduk() {
          const { kata, setKata, keadaan } = usePencarian(cariProduk);

          return (
            <>
              <input value={kata} onChange={(e) => setKata(e.currentTarget.value)} />
              {keadaan.status === 'memuat' ? <Skeleton /> : null}
              {keadaan.status === 'gagal' ? <PesanGagal galat={keadaan.galat} /> : null}
              {keadaan.status === 'sukses' ? <DaftarProduk data={keadaan.data} /> : null}
            </>
          );
        }
        `,
        { caption: 'Empat puluh baris logika menjadi satu baris pemanggilan.' },
      ),
      p(
        'Yang perlu ditegaskan, custom hook membagi **logika**, bukan state. Empat halaman yang memanggil `usePencarian` masing-masing punya `kata` dan `keadaan` sendiri yang sepenuhnya terpisah. Ini sering disalahpahami, yaitu orang mengira memanggil hook yang sama berarti berbagi nilai yang sama. Untuk berbagi nilai antar-komponen, yang dibutuhkan konteks atau pustaka state, bukan custom hook.',
      ),
      p(
        'Aturan penamaan berawalan `use` bukan sekadar konvensi. Plugin lint React memakai nama itu untuk mengenali fungsi yang boleh memanggil hook dan untuk memeriksa aturan hook di dalamnya. Fungsi bernama `ambilPencarian` yang memanggil `useState` di dalamnya tidak akan diperiksa, sehingga pelanggaran aturan hook di sana lolos tanpa peringatan.',
      ),
      callout(
        'tip',
        'Custom hook adalah abstraksi, dan aturan tiga tetap berlaku',
        'Jangan membuat custom hook dari satu pemakaian. Tulis logikanya langsung di komponen lebih dulu, dan angkat menjadi hook setelah pemakai kedua atau ketiga muncul. Hook yang dirancang dari satu contoh hampir selalu salah bentuk, sebab kamu menebak apa yang akan berbeda.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada custom hook, dan dua di antaranya berupa peringatan yang mudah diabaikan.',
      ),
      code(
        'text',
        `
        function ambilPencarian() {          // nama tidak diawali 'use'
          const [kata, setKata] = useState('');
          return { kata, setKata };
        }

        error: React Hook "useState" is called in function "ambilPencarian"
        that is neither a React function component nor a custom React Hook function.
        `,
        { caption: 'Plugin lint mengenali custom hook dari namanya.' },
      ),
      p(
        'Aturan penamaan ditegakkan plugin lint, dan pada project yang mengaktifkan React Compiler sebagian menjadi error saat membangun. Yang lebih penting dari errornya, tanpa awalan `use` seluruh pemeriksaan aturan hook di dalam fungsi itu dilewati. Pelanggaran seperti memanggil hook di dalam kondisi tidak akan tertangkap.',
      ),
      code(
        'text',
        `
        useEffect(() => {
          const timer = setTimeout(cari, 400);
        }, [kata]);
        // tanpa fungsi pembersih

        // Pengguna mengetik 10 huruf. 10 timer berjalan.
        // Sepuluh permintaan dikirim, dan yang terakhir sampai belum tentu yang terbaru.
        `,
        { caption: 'Efek tidak membersihkan pekerjaan dari putaran sebelumnya.' },
      ),
      p(
        'Tidak ada error, dan gejalanya berupa hasil pencarian yang kadang menampilkan kata yang lama. Fungsi pembersih dijalankan sebelum efek berikutnya, dan itu tempat yang tepat untuk membatalkan timer dan permintaan. Ini pola yang berlaku untuk seluruh efek yang memulai sesuatu, yaitu timer, langganan, dan permintaan jaringan.',
      ),
      code(
        'text',
        `
        const { keadaan } = usePencarian(async (kata) => cariProduk(kata));

        // Fungsi baru tiap render, dan ia ada di dependensi efek.
        // Efek berjalan terus-menerus. Permintaan tidak pernah berhenti.
        `,
        { caption: 'Argumen berupa fungsi yang dibuat ulang tiap render.' },
      ),
      p(
        'Fungsi panah yang ditulis langsung di pemanggilan adalah object baru pada tiap render, sehingga dependensi `cari` selalu berubah dan efeknya berjalan lagi. Gejalanya berupa permintaan yang mengalir terus di tab Network. Perbaikannya mendefinisikan fungsinya di luar komponen kalau ia tidak bergantung pada apa pun, atau membungkusnya dengan `useCallback`. Pada project dengan React Compiler, ini biasanya ditangani otomatis.',
      ),
      code(
        'text',
        `
        function useIzin() {
          const { pengguna } = useAuth();
          if (!pengguna) return { izin: [] };      // return lebih awal
          const [cache, setCache] = useState([]);  // hook SETELAH return
        }

        error: React Hook "useState" is called conditionally.
        `,
        { caption: 'Aturan hook berlaku sama di custom hook.' },
      ),
      p(
        'Custom hook tunduk pada aturan yang sama dengan komponen, yaitu seluruh hook dipanggil di level teratas dan dalam urutan yang sama pada tiap pemanggilan. Ini sering terlupa sebab custom hook terlihat seperti fungsi biasa. Panggil seluruh hook lebih dulu, lalu lakukan percabangan pada nilai yang dikembalikan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`is neither a React function component nor a custom React Hook`',
            'Nama fungsi tidak diawali `use`',
            'Ganti namanya, supaya aturan hook ikut diperiksa',
          ],
          [
            'Hasil pencarian menampilkan kata yang lama',
            'Efek tidak membersihkan timer dan permintaan lama',
            'Kembalikan fungsi pembersih dari efeknya',
          ],
          [
            'Permintaan mengalir terus tanpa henti',
            'Argumen berupa fungsi yang dibuat ulang tiap render',
            'Definisikan di luar komponen, atau bungkus dengan `useCallback`',
          ],
          [
            '`React Hook is called conditionally`',
            'Hook dipanggil setelah `return` lebih awal',
            'Panggil seluruh hook di level teratas',
          ],
          [
            'Dua komponen mengira berbagi state lewat hook yang sama',
            'Custom hook membagi logika, bukan state',
            'Pakai konteks atau pustaka state untuk berbagi nilai',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Custom hook adalah pengganti yang tepat untuk sebagian besar pemakaian HOC dan render props, dan ia punya kesalahannya sendiri.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengira custom hook berbagi state antar-komponen',
            'Fungsinya kan sama',
            'Tiap pemanggilan punya state sendiri yang terpisah. Untuk berbagi nilai, pakai konteks',
          ],
          [
            'Membuat custom hook dari satu pemakaian',
            'Supaya rapi',
            'Bentuknya hampir selalu salah. Tulis di komponen dulu, angkat setelah ada pemakai kedua',
          ],
          [
            'Menamai fungsi tanpa awalan `use`',
            'Ia kan fungsi biasa',
            'Plugin lint tidak memeriksa aturan hook di dalamnya, sehingga pelanggaran lolos tanpa peringatan',
          ],
          [
            'Mengembalikan array untuk hook yang mengembalikan banyak nilai',
            'Seperti `useState`',
            'Array memaksa pemakainya mengingat urutan. Untuk lebih dari dua nilai, object dengan nama jauh lebih terbaca',
          ],
          [
            'Membuat satu hook raksasa untuk seluruh halaman',
            'Semua logika di satu tempat',
            'Menjadi ratusan baris dan sulit diuji. Pecah per tanggung jawab yang memang berbeda',
          ],
          [
            'Melupakan fungsi pembersih pada efek di dalam hook',
            'Komponennya jarang dilepas',
            'Di aplikasi satu halaman, komponen dilepas setiap kali pengguna berpindah. Timer dan permintaan menumpuk',
          ],
        ],
      ),
      p(
        'Baris pertama adalah kesalahpahaman yang paling sering dan paling mahal waktunya. Dua komponen yang sama-sama memanggil `useKeranjang` akan punya keranjang yang berbeda, dan itu bisa memakan waktu lama untuk disadari sebab kodenya terlihat benar. Custom hook adalah cara berbagi **cara kerja**, dan berbagi **nilai** menuntut alat yang berbeda.',
      ),
      callout(
        'info',
        'Custom hook bisa diuji tanpa merender komponen',
        'Pustaka pengujian React menyediakan cara memanggil hook di dalam lingkungan uji tanpa membuat komponen pembungkus. Karena logika di dalamnya terpisah dari tampilan, mengujinya jauh lebih cepat dan lebih sedikit yang perlu disiapkan. Ini salah satu keuntungan nyata memindahkan logika ke hook.',
      ),
      references(
        {
          label: 'Reusing Logic with Custom Hooks',
          href: 'https://react.dev/learn/reusing-logic-with-custom-hooks',
          source: 'React',
          note: 'Termasuk penegasan bahwa custom hook berbagi logika, bukan state.',
        },
        {
          label: 'Rules of Hooks',
          href: 'https://react.dev/reference/rules/rules-of-hooks',
          source: 'React',
          note: 'Alasan awalan `use` bukan sekadar gaya penulisan.',
        },
        {
          label: 'Window: resize event',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event',
          source: 'MDN Web Docs',
          note: 'Sumber data untuk contoh `useUkuranJendela`, beserta kewajiban melepas listener-nya.',
        },
        {
          label: 'Window.localStorage',
          href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
          source: 'MDN Web Docs',
          note: 'Termasuk kondisi yang membuatnya melempar error — kuota penuh dan mode privat.',
        },
      ),
    ],
  ),

  written(
    'controlled-uncontrolled-api',
    'Controlled vs Uncontrolled sebagai pola API',
    22,
    'Membiarkan pemanggil memilih siapa yang memegang state.',
    [
      p(
        'Kamu sudah mengenal controlled dan uncontrolled pada input form. Pola yang sama berlaku saat kamu **merancang komponen sendiri**: siapa yang memegang state — komponennya, atau yang memakainya?',
      ),

      terms(
        {
          term: 'controlled',
          meaning:
            'Artinya **terkendali**. Nilainya dipegang oleh **pemanggil**, dan komponen hanya menampilkan apa yang diberikan sambil melaporkan perubahan lewat callback. Konsekuensinya: pemanggil bisa mengubahnya dari mana saja, menyinkronkannya ke URL, atau menyimpannya.',
        },
        {
          term: 'uncontrolled',
          meaning:
            'Artinya **tak terkendali** — istilah teknis, bukan penilaian buruk. Nilainya dipegang **komponen itu sendiri**. Pemanggil cukup menyebut nilai awalnya lalu melepasnya. Paling ringkas untuk kasus biasa, tapi tidak bisa diubah dari luar.',
        },
        {
          term: 'defaultAktif / nilaiAwal',
          meaning:
            'Konvensi penamaan untuk prop yang hanya dibaca **sekali** saat komponen dipasang. Awalan `default` adalah sinyal ke pembaca: mengubahnya nanti tidak akan berpengaruh. React sendiri memakai konvensi ini pada `defaultValue` dan `defaultChecked`.',
        },
        {
          term: 'callback perubahan',
          meaning:
            'Prop bertipe fungsi seperti `onAktifChange` yang dipanggil komponen setiap kali nilainya seharusnya berubah. Dalam mode terkendali, ini **satu-satunya** cara komponen memengaruhi nilainya — ia melapor, pemanggil yang memutuskan.',
        },
        {
          term: 'mode ditentukan keberadaan prop',
          meaning:
            'Inti implementasinya: `const terkendali = nilai !== undefined`. Bukan sebuah prop `mode` terpisah, melainkan **ada-tidaknya** prop nilainya. Ini konvensi yang sama dengan `<input value>` vs `<input defaultValue>` di React.',
        },
        {
          term: 'as const',
          meaning:
            'Penanda TypeScript yang mengubah `[sekarang, ubah]` dari "array berisi dua hal" menjadi **tuple** dengan posisi bermakna. Tanpa ini, `const [nilai, ubah] = ...` akan kehilangan tipe masing-masing elemen.',
        },
        {
          term: 'optional call (`?.()`)',
          meaning:
            'Bentuk `onChange?.(baru)` berarti "panggil kalau ada, diam kalau tidak". Karena callback-nya opsional, ini yang mencegah error saat pemanggil memakai mode tak terkendali dan tidak mengoper apa pun.',
        },
        {
          term: 'komponen library',
          meaning:
            'Komponen yang dipakai banyak tempat dengan kebutuhan berbeda-beda — tab, dialog, select, date picker. Justru untuk kategori inilah mendukung **kedua mode** berbayar; untuk komponen sekali pakai, memilih satu mode sudah cukup.',
        },
      ),

      h2('Dua bentuknya'),
      compare(
        {
          title: 'Uncontrolled — komponen yang pegang',
          lang: 'tsx',
          code: `
          <Tabs defaultAktif="profil" />

          // Pemanggil tidak perlu state apa pun.
          // Tapi juga tidak bisa mengubahnya dari luar.
          `,
          notes: ['Paling ringkas untuk kasus biasa'],
        },
        {
          title: 'Controlled — pemanggil yang pegang',
          lang: 'tsx',
          code: `
          const [aktif, setAktif] = useState('profil');

          <Tabs aktif={aktif} onAktifChange={setAktif} />

          // Pemanggil bisa mengubahnya dari mana saja,
          // menyinkronkan ke URL, atau menyimpannya.
          `,
          notes: ['Perlu state di pemanggil, tapi bisa dikendalikan penuh'],
        },
      ),

      h2('Mendukung keduanya sekaligus'),
      p(
        'Komponen library yang baik mendukung dua-duanya. Polanya: kalau prop terkendali diberikan, pakai itu; kalau tidak, pakai state internal.',
      ),
      code(
        'ts',
        `
        'use client';

        export function useNilaiTerkendali<T>({
          nilai,
          nilaiAwal,
          onChange,
        }: {
          nilai?: T;
          nilaiAwal: T;
          onChange?: (baru: T) => void;
        }) {
          const [internal, setInternal] = useState(nilaiAwal);

          // Keberadaan prop 'nilai' yang menentukan modenya.
          const terkendali = nilai !== undefined;
          const sekarang = terkendali ? nilai : internal;

          function ubah(baru: T) {
            // Dalam mode terkendali, komponen TIDAK menyimpan apa pun sendiri —
            // ia hanya melapor. Pemanggil yang memutuskan.
            if (!terkendali) setInternal(baru);
            onChange?.(baru);
          }

          return [sekarang, ubah] as const;
        }
        `,
      ),
      p(
        'Baris `const terkendali = nilai !== undefined` adalah seluruh mekanismenya, yaitu **keberadaan prop yang menentukan mode** dan bukan sebuah flag terpisah. Itu penting karena pemanggil tidak perlu mengumumkan niatnya, sebab ia cukup mengoper `nilai` atau tidak. Dari situ `sekarang` memilih sumbernya, dan `ubah` berperilaku berbeda di tiap mode. Dalam mode tak terkendali ia memperbarui state internal **dan** melapor, sedangkan dalam mode terkendali ia **hanya melapor**, karena kalau ia ikut menyimpan sendiri akan ada dua source of truth yang bisa berbeda. `onChange?.()` dengan tanda tanya diperlukan karena prop itu opsional di kedua mode. Dan `as const` di akhir membuat TypeScript menyimpulkan tuple `[T, (baru: T) => void]` alih-alih array biasa, sehingga destructuring di pemanggil mendapat tipe yang tepat per posisi.',
      ),
      code(
        'tsx',
        `
        export function Tabs({ aktif, defaultAktif, onAktifChange, children }: Props) {
          const [sekarang, ubah] = useNilaiTerkendali({
            nilai: aktif,
            nilaiAwal: defaultAktif ?? 'pertama',
            onChange: onAktifChange,
          });

          return <KonteksTabs value={{ sekarang, ubah }}>{children}</KonteksTabs>;
        }
        `,
      ),

      h2('Konvensi penamaan yang sudah baku'),
      table(
        ['Prop', 'Arti'],
        [
          ['`nilai` / `value`', 'Mode terkendali — pemanggil pegang'],
          ['`defaultNilai` / `defaultValue`', 'Mode tak terkendali — nilai awal saja'],
          ['`onNilaiChange`', 'Dipanggil setiap kali nilainya berubah'],
        ],
        'Ikuti konvensi ini persis. Pemakai komponenmu sudah mengenalnya dari elemen HTML.',
      ),

      h2('Jebakan yang sering terjadi'),
      callout(
        'danger',
        'Jangan pernah beralih mode di tengah jalan',
        'Komponen yang awalnya menerima `nilai={undefined}` lalu berubah menjadi `nilai="a"` akan melompat dari tak terkendali ke terkendali. React memperingatkan ini pada input bawaan, dan pada komponen buatan sendiri akibatnya bisa lebih membingungkan. Penyebab tersering: nilai yang belum selesai dimuat. Solusinya jangan render komponennya sampai datanya siap, atau berikan nilai awal yang bukan `undefined`.',
      ),
      callout(
        'warning',
        'Mode terkendali tanpa handler = input yang beku',
        'Kalau pemanggil memberi `nilai` tapi lupa `onChange`, komponennya tidak akan pernah berubah — dan tidak ada error apa pun. Ini bug yang tampak seperti "komponennya rusak". Di mode pengembangan, pertimbangkan menuliskan peringatan eksplisit untuk kombinasi itu.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `PilihTanggal` dibuat menyimpan tanggal terpilihnya sendiri. Setelah dipakai di lima tempat, tiga permintaan datang. Halaman filter butuh membaca tanggalnya untuk menyusun alamat halaman. Halaman formulir butuh mengosongkannya setelah dikirim. Dan halaman laporan butuh menyetelnya dari tombol pintasan bulan ini. Ketiganya mustahil, sebab nilainya tersembunyi di dalam komponen.',
      ),
      p(
        'Yang perlu diputuskan bukan mana yang lebih baik melainkan **siapa yang memegang kebenaran**, dan jawaban terbaik sering keduanya sekaligus.',
      ),
      code(
        'tsx',
        `
        type PilihTanggalProps = {
          // Terkendali: pemanggil memegang nilainya.
          nilai?: string | null;
          // Tak terkendali: komponen memegangnya, pemanggil hanya memberi nilai awal.
          nilaiAwal?: string | null;
          // Selalu dipanggil, apa pun modenya.
          onUbah?: (nilai: string | null) => void;
          min?: string;
          max?: string;
        };

        export function PilihTanggal({
          nilai,
          nilaiAwal = null,
          onUbah,
          min,
          max,
        }: PilihTanggalProps) {
          // Mode ditentukan SEKALI, dari apakah 'nilai' diberikan.
          const terkendali = nilai !== undefined;

          const [nilaiDalam, setNilaiDalam] = useState<string | null>(nilaiAwal);
          const nilaiBerlaku = terkendali ? nilai : nilaiDalam;

          function ubah(baru: string | null) {
            // Hanya setel state internal kalau TIDAK terkendali.
            if (!terkendali) setNilaiDalam(baru);
            onUbah?.(baru);
          }

          return (
            <input
              type="date"
              value={nilaiBerlaku ?? ''}
              min={min}
              max={max}
              onChange={(e) => ubah(e.currentTarget.value || null)}
            />
          );
        }
        `,
        { filename: 'src/ui/PilihTanggal.tsx' },
      ),
      p(
        'Baris `const terkendali = nilai !== undefined` adalah inti polanya. Yang membedakan kedua mode bukan nilai `nilai` melainkan **apakah ia diberikan sama sekali**. Karena itu pemeriksaannya terhadap `undefined`, bukan terhadap `null`. Nilai `null` adalah tanggal yang sengaja dikosongkan, dan itu keadaan yang sah pada mode terkendali.',
      ),
      p(
        'Fungsi `ubah` memanggil `onUbah` pada **kedua** mode, dan itu sering keliru diterapkan. Sebagian orang hanya memanggilnya pada mode terkendali, sehingga pemakai mode tak terkendali kehilangan cara mengetahui nilainya berubah. Padahal kasus yang sangat umum adalah komponen memegang nilainya sendiri sementara pemanggil hanya ingin tahu saat berubah, misalnya untuk menyimpan draf.',
      ),
      p(
        "Bentuk `value={nilaiBerlaku ?? ''}` menutup peringatan React tentang nilai `null` pada kolom formulir yang sudah dibahas di bab tentang state. Tanda tanya ganda dipakai bukan `||` supaya teks kosong yang sah tidak ikut tergantikan, walaupun untuk kolom tanggal keduanya kebetulan sama.",
      ),
      code(
        'tsx',
        `
        // Mode tak terkendali: pemanggil tidak perlu state sama sekali.
        <PilihTanggal nilaiAwal="2026-09-01" onUbah={simpanDraf} />

        // Mode terkendali: pemanggil memegang nilainya.
        const [tanggal, setTanggal] = useState<string | null>(null);
        <PilihTanggal nilai={tanggal} onUbah={setTanggal} />
        <button onClick={() => setTanggal(awalBulanIni())}>Bulan ini</button>
        `,
        { caption: 'Satu komponen, dua cara pakai, dan pemanggil yang memilih.' },
      ),
      p(
        'Pola ini dipakai hampir seluruh pustaka komponen besar, dan alasannya sama, yaitu tidak mungkin menebak kebutuhan seluruh pemakai. Pemakai yang hanya butuh kolom tanggal biasa tidak perlu membuat state, dan pemakai yang butuh mengendalikannya bisa. Biayanya sekitar sepuluh baris di dalam komponen, dan itu terbayar begitu ada pemakai kedua dengan kebutuhan berbeda.',
      ),
      callout(
        'warning',
        'Mode tidak boleh berubah selama komponen hidup',
        'Berpindah dari tak terkendali ke terkendali di tengah jalan membuat React mengeluarkan peringatan dan perilakunya menjadi tidak terduga. Ini sering terjadi tanpa sengaja saat nilai awalnya `undefined` lalu diisi setelah data dari server tiba. Pastikan `nilai` sudah punya nilai sejak render pertama, atau jangan render komponennya sampai datanya ada.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering pada komponen dua mode, dan dua di antaranya berupa peringatan React yang jelas.',
      ),
      code(
        'text',
        `
        const [tanggal, setTanggal] = useState();   // undefined
        <PilihTanggal nilai={tanggal} onUbah={setTanggal} />
        // lalu data dari server tiba dan setTanggal('2026-09-01')

        Warning: A component is changing an uncontrolled input to be controlled.
        This is likely caused by the value changing from undefined to a defined
        value, which should not happen.
        `,
        { caption: 'Mode berubah di tengah hidup komponen.' },
      ),
      p(
        'Pesannya menyebut penyebabnya secara langsung, yaitu nilai berubah dari `undefined` menjadi ada. Perbaikannya memberi nilai awal yang bukan `undefined`, yaitu `useState<string | null>(null)`. Kalau datanya memang belum ada sampai server menjawab, pilihan lain adalah tidak merender komponennya sama sekali sampai datanya tiba.',
      ),
      code(
        'text',
        `
        function ubah(baru) {
          setNilaiDalam(baru);      // selalu setel, tanpa memeriksa mode
          onUbah?.(baru);
        }

        // Pada mode terkendali, ada DUA sumber kebenaran yang bisa berbeda.
        `,
        { caption: 'State internal tetap disetel walaupun sedang terkendali.' },
      ),
      p(
        'Tidak ada error, dan gejalanya muncul saat pemanggil menolak perubahan. Misalnya pemanggil memvalidasi tanggalnya lalu tidak menyetel state kalau tidak sah. Karena state internal sudah terlanjur berubah, komponennya menampilkan nilai yang berbeda dari yang dipegang pemanggil. Pemeriksaan `if (!terkendali)` menutupnya.',
      ),
      code(
        'text',
        `
        const terkendali = nilai !== null;      // memeriksa null, bukan undefined

        // Pemanggil mengosongkan tanggal dengan setTanggal(null).
        // Komponen tiba-tiba beralih ke mode tak terkendali.
        `,
        { caption: 'Pemeriksaan mode memakai nilai yang sah sebagai penanda.' },
      ),
      p(
        'Nilai `null` berarti tanggal sengaja dikosongkan, dan itu keadaan yang sah pada mode terkendali. Memakainya sebagai penanda mode membuat komponennya berpindah mode setiap kali pengguna mengosongkan kolomnya. Yang menandakan mode hanya `undefined`, yaitu prop yang benar-benar tidak diberikan.',
      ),
      code(
        'text',
        `
        <PilihTanggal nilai={tanggal} />
        // onUbah tidak diberikan

        Warning: You provided a \`value\` prop to a form field without an
        \`onChange\` handler. This will render a read-only field.
        `,
        { caption: 'Terkendali tanpa cara mengubahnya.' },
      ),
      p(
        'Ini peringatan React yang sudah dibahas di bab tentang state, muncul kembali lewat komponen pembungkus. Untuk komponen dua mode, ada pilihan desain yang bisa diambil, yaitu menandai `onUbah` sebagai wajib saat `nilai` diberikan. TypeScript bisa menegakkan itu lewat union tipe props, sehingga kesalahan ini ditolak sebelum dijalankan.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            '`changing an uncontrolled input to be controlled`',
            'Nilai berubah dari `undefined` menjadi ada',
            'Beri nilai awal `null`, atau jangan render sampai datanya ada',
          ],
          [
            'Komponen menampilkan nilai berbeda dari yang dipegang pemanggil',
            'State internal disetel walaupun sedang terkendali',
            'Periksa modenya sebelum menyetel state internal',
          ],
          [
            'Komponen berpindah mode saat dikosongkan',
            'Mode diperiksa terhadap `null`, bukan `undefined`',
            'Periksa `nilai !== undefined`',
          ],
          [
            '`You provided a \\`value\\` prop ... without an \\`onChange\\``',
            'Terkendali tanpa cara mengubahnya',
            'Wajibkan `onUbah` saat `nilai` diberikan, lewat union tipe props',
          ],
          [
            'Pemakai mode tak terkendali tidak tahu nilainya berubah',
            '`onUbah` hanya dipanggil pada mode terkendali',
            'Panggil pada kedua mode',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Merancang API komponen yang mendukung dua mode adalah keputusan yang biayanya kecil dan manfaatnya besar, asal beberapa detail di bawah tidak terlewat.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Hanya menyediakan mode tak terkendali',
            'Pemakainya jadi tidak perlu state',
            'Nilainya tidak bisa dibaca, dikosongkan, atau disetel dari luar. Tiga kebutuhan umum langsung tertutup',
          ],
          [
            'Hanya menyediakan mode terkendali',
            'Satu sumber kebenaran, lebih bersih',
            'Pemakai yang hanya butuh kolom biasa terpaksa membuat state dan penangan. Untuk komponen yang dipakai luas, ini beban yang nyata',
          ],
          [
            'Memakai `null` sebagai penanda mode',
            '`null` kan berarti kosong',
            '`null` adalah nilai yang sah pada mode terkendali. Hanya `undefined` yang menandakan prop tidak diberikan',
          ],
          [
            'Menyetel state internal pada kedua mode',
            'Supaya seragam',
            'Dua sumber kebenaran yang bisa berbeda saat pemanggil menolak perubahan',
          ],
          [
            'Membiarkan mode berubah di tengah hidup komponen',
            'Datanya memang baru tiba belakangan',
            'React mengeluarkan peringatan dan perilakunya tidak terduga. Beri nilai awal yang bukan `undefined`',
          ],
          [
            'Memanggil `onUbah` hanya saat terkendali',
            'Yang tak terkendali kan mengurus sendiri',
            'Pemakai kehilangan cara mengetahui nilainya berubah, misalnya untuk menyimpan draf',
          ],
        ],
      ),
      p(
        'Baris kedua sering luput dipertimbangkan karena mode terkendali terdengar lebih benar. Untuk komponen yang dipakai di dua puluh tempat, memaksa setiap pemakai membuat state dan penangan berarti empat puluh baris tambahan yang tersebar. Menyediakan mode tak terkendali sebagai bawaan membuat pemakaian termudah tetap satu baris.',
      ),
      callout(
        'tip',
        'TypeScript bisa menegakkan pasangan prop yang wajib bersama',
        'Dengan union tipe props, kamu bisa membuat `onUbah` wajib hanya saat `nilai` diberikan. Bentuknya berupa gabungan dua tipe, yaitu satu yang punya `nilai` dan `onUbah` wajib, dan satu lagi yang punya `nilaiAwal` dengan `onUbah` opsional. Pemanggil yang memberi `nilai` tanpa `onUbah` ditolak sebelum dijalankan.',
      ),
      references(
        {
          label: 'Controlled and uncontrolled components',
          href: 'https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components',
          source: 'React',
          note: 'Definisi resmi dua mode ini, dan kenapa keduanya sah untuk komponen buatan sendiri.',
        },
        {
          label: '<input> — value vs defaultValue',
          href: 'https://react.dev/reference/react-dom/components/input',
          source: 'React',
          note: 'Konvensi penamaan yang wajib diikuti komponenmu, termasuk peringatan saat mode berpindah.',
        },
        {
          label: 'You Might Not Need an Effect — controlling a component',
          href: 'https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes',
          source: 'React',
          note: 'Kenapa menyalin prop terkendali ke state internal lewat Effect adalah jalan yang salah.',
        },
        {
          label: 'const assertions (as const)',
          href: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions',
          source: 'TypeScript',
          note: 'Penanda yang membuat return value terbaca sebagai tuple, bukan array biasa.',
        },
      ),
    ],
  ),

  written(
    'polymorphic-component',
    'Polymorphic Component (`as` prop)',
    22,
    'Satu komponen, banyak elemen keluaran.',
    [
      p(
        'Polymorphic component adalah komponen yang membiarkan pemanggil menentukan **elemen HTML apa** yang akhirnya dirender, lewat prop `as`. Satu `<Teks>` bisa keluar sebagai `<p>`, `<span>`, `<h1>`, atau bahkan komponen lain.',
      ),

      terms(
        {
          term: 'polymorphic',
          meaning:
            'Dibaca "polimorfik", artinya **berbentuk banyak**. Komponen yang membiarkan pemanggil menentukan elemen HTML apa yang akhirnya dirender. Satu `<Teks>` bisa keluar sebagai `<p>`, `<span>`, `<h1>`, atau bahkan komponen lain.',
        },
        {
          term: 'prop `as`',
          meaning:
            'Prop yang membawa **elemen tujuan**: `as="a"`, `as="h1"`, atau `as={Link}`. Konvensi ini dipakai hampir semua design system modern, jadi pemakai komponenmu kemungkinan besar sudah mengenalnya.',
        },
        {
          term: 'ElementType',
          meaning:
            'Tipe React untuk "apa pun yang sah dirender sebagai elemen" — nama tag HTML seperti `\'a\'`, atau sebuah komponen. Generic `T extends ElementType` inilah yang membuat TypeScript tahu prop apa yang sah untuk elemen tujuannya.',
        },
        {
          term: 'ComponentPropsWithoutRef<T>',
          meaning:
            'Tipe React yang mengambil **seluruh props sah** milik elemen `T` — `href` untuk `<a>`, `type` dan `disabled` untuk `<button>`. Ini yang membuat `as="a" href="/x"` lolos type-check sementara `href` pada `<button>` ditolak.',
        },
        {
          term: 'Omit untuk mencegah tabrakan',
          meaning:
            "Bagian `Omit<ComponentPropsWithoutRef<T>, keyof PropsSendiri | 'as'>` menyingkirkan props bawaan elemen yang namanya bentrok dengan props milik komponenmu. Aturannya jelas: kalau namanya sama, **milik komponenmu yang menang**.",
        },
        {
          term: 'semantik',
          meaning:
            'Makna sebuah elemen bagi browser dan teknologi bantu, terlepas dari tampilannya. Inilah yang membuat `as` berbahaya kalau dipakai sembarangan: **ia mengubah semantik, bukan cuma tampilan**.',
        },
        {
          term: 'div yang bisa diklik',
          meaning:
            'Anti-pattern yang dimungkinkan prop `as`. `<Tombol as="div" onClick={...}>` terlihat seperti tombol tapi bukan tombol: tidak bisa difokus dengan Tab, tidak merespons Enter atau Spasi, dan dibaca screen reader sebagai teks biasa. Kalau bisa diklik, ia harus `<button>` atau `<a>`. Selalu.',
        },
        {
          term: 'button vs a',
          meaning:
            'Garis pemisahnya soal **perilaku**, bukan tampilan. Menjalankan aksi di halaman ini → `<button>`. Pindah ke alamat lain → `<a href>`, karena hanya `<a>` yang bisa dibuka di tab baru, disalin alamatnya, dan dibaca sebagai tautan.',
        },
      ),

      h2('Masalah yang ia selesaikan'),
      p(
        'Tombol yang menavigasi seharusnya berupa `<a>`, bukan `<button>` — karena hanya `<a>` yang bisa dibuka di tab baru, disalin alamatnya, dan dibaca screen reader sebagai tautan. Tapi kamu tetap ingin tampilan tombolmu. Tanpa `as`, kamu terpaksa menduplikasi seluruh style ke komponen kedua.',
      ),
      code(
        'tsx',
        `
        <Tombol>Simpan</Tombol>                          {/* <button> */}
        <Tombol as="a" href="/produk">Lihat produk</Tombol>  {/* <a> */}
        <Tombol as={Link} href="/kelas">Mulai belajar</Tombol> {/* <Link> Next.js */}
        `,
      ),

      h2('Mengetiknya dengan benar'),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

        type PropsSendiri = {
          variant?: 'primary' | 'ghost';
          size?: 'sm' | 'md';
          children: ReactNode;
        };

        type PropsPolimorfik<T extends ElementType> = PropsSendiri & {
          as?: T;
          // Omit mencegah tabrakan: kalau elemen tujuan punya prop bernama sama
          // dengan milik kita, milik kita yang menang.
        } & Omit<ComponentPropsWithoutRef<T>, keyof PropsSendiri | 'as'>;

        export function Tombol<T extends ElementType = 'button'>({
          as,
          variant = 'primary',
          size = 'md',
          children,
          ...sisa
        }: PropsPolimorfik<T>) {
          const Komponen = as ?? 'button';

          return (
            <Komponen className={kelas(variant, size)} {...sisa}>
              {children}
            </Komponen>
          );
        }
        `,
        { filename: 'src/components/ui/tombol.tsx' },
      ),
      p(
        'Generic `T extends ElementType` inilah yang membuat TypeScript tahu prop apa yang sah. Dengan `as="a"`, ia menerima `href`; dengan default `button`, ia menerima `type` dan `disabled` — dan menolak `href` sebagai error.',
      ),

      h2('Aksesibilitas: bagian yang paling sering salah'),
      callout(
        'danger',
        '`as` mengubah semantik, bukan cuma tampilan',
        'Menulis `<Tombol as="div" onClick={...}>` menghasilkan sesuatu yang **terlihat** seperti tombol tapi bukan tombol: tidak bisa difokus dengan Tab, tidak merespons Enter atau Spasi, dan dibaca screen reader sebagai teks biasa. Kalau ia bisa diklik, ia harus `<button>` atau `<a>`. Selalu.',
      ),
      table(
        ['Perilakunya', 'Elemen yang benar'],
        [
          ['Menjalankan aksi di halaman ini', '`<button>`'],
          ['Pindah ke alamat lain', '`<a href>` atau `<Link>`'],
          ['Membuka dialog / menu', '`<button>` dengan `aria-expanded`'],
          ['Tidak bisa diklik sama sekali', 'Elemen apa pun'],
        ],
      ),

      h2('Biaya yang perlu dipertimbangkan'),
      ul(
        'Tipenya rumit dan pesan errornya panjang — orang yang salah memakainya butuh waktu memahami keluhan TypeScript.',
        'Meneruskan `ref` pada komponen polimorfik menambah satu lapisan generic lagi.',
        'Terlalu banyak kebebasan bisa dipakai untuk melanggar semantik, seperti contoh `as="div"` di atas.',
      ),
      p(
        'Karena itu batasi pemakaiannya. Untuk kebanyakan project, dua atau tiga komponen dasar (`Tombol`, `Teks`, `Kotak`) sudah cukup — sisanya lebih baik jadi komponen terpisah yang jelas maksudnya.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Kotak` dibuat untuk menyeragamkan jarak dan warna. Setelah dipakai, permintaan mulai datang. Satu tempat butuh ia menjadi `section` supaya struktur halaman benar. Satu tempat butuh ia menjadi `a` supaya bisa diklik. Satu tempat butuh ia menjadi `li` di dalam daftar. Solusi cepatnya membuat `KotakSection`, `KotakLink`, dan `KotakItem`, dan sejak itu ada empat komponen dengan gaya yang harus dijaga tetap sama.',
      ),
      p(
        'Komponen polimorfik menyelesaikan itu dengan satu prop yang menentukan elemen apa yang dirender, dan tipe propsnya ikut menyesuaikan.',
      ),
      code(
        'tsx',
        `
        import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

        type KotakProps<T extends ElementType> = {
          as?: T;
          jarak?: 'kecil' | 'sedang' | 'besar';
          children?: ReactNode;
        } & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children'>;

        export function Kotak<T extends ElementType = 'div'>({
          as,
          jarak = 'sedang',
          className = '',
          children,
          ...sisa
        }: KotakProps<T>) {
          // Bawaan 'div' ditentukan di sini, bukan di tipe saja.
          const Elemen = as ?? 'div';

          return (
            <Elemen
              {...sisa}
              className={['kotak', \`kotak-jarak-\${jarak}\`, className].filter(Boolean).join(' ')}
            >
              {children}
            </Elemen>
          );
        }
        `,
        { filename: 'src/ui/Kotak.tsx' },
      ),
      p(
        'Bagian `Omit<ComponentPropsWithoutRef<T>, \'as\' | \'children\'>` adalah yang membuat tipenya benar. Ia mengambil seluruh atribut yang sah untuk elemen `T`, lalu membuang `as` dan `children` supaya tidak bentrok dengan yang sudah kamu definisikan sendiri. Hasilnya, `<Kotak as="a" href="/x" />` diterima sedangkan `<Kotak as="div" href="/x" />` ditolak.',
      ),
      code(
        'text',
        `
        # Diuji dengan tsc dan tipe React 19:

        const p1 = <Kotak as="a" href="/x">tautan</Kotak>;      # lolos
        const p2 = <Kotak as="div" href="/x">salah</Kotak>;     # ditolak

        error TS2322: Property 'href' does not exist on type
        'IntrinsicAttributes & { as?: "div" | undefined; children?: ReactNode; } &
        Omit<Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
        "ref">, "as" | "children">'.
        `,
        { caption: 'Pesannya panjang, dan baris terakhir yang menjelaskan.' },
      ),
      p(
        "Pesan error seperti ini adalah harga yang dibayar untuk tipe polimorfik. Ia panjang karena menampilkan seluruh tipe hasil gabungan, dan cara membacanya selalu sama, yaitu **baca baris paling bawah lebih dulu**. Di sana tertulis `Property 'href' does not exist`, dan itu seluruh informasinya. Kebiasaan membaca dari bawah membuat sebagian besar pesan TypeScript yang panjang menjadi mudah.",
      ),
      p(
        "Baris `const Elemen = as ?? 'div'` memakai variabel berhuruf kapital, dan itu wajib. JSX membedakan komponen dari tag HTML lewat huruf pertamanya, seperti dibahas di Bab 6 Frontend Basic. Menulis `const elemen = as ?? 'div'` lalu `<elemen />` akan menghasilkan tag HTML bernama `elemen`, dan tidak ada satu pun error.",
      ),
      p(
        'Perlu jujur disebut bahwa pola ini punya biaya nyata. Tipe generiknya rumit, pesan errornya panjang, penyimpulan tipe kadang gagal pada kasus yang bersarang, dan pelengkapan otomatis di editor bisa melambat pada berkas besar. Pakai untuk komponen tata letak dasar yang memang dipakai puluhan kali dengan elemen berbeda-beda, dan jangan untuk komponen yang elemennya selalu sama.',
      ),
      callout(
        'tip',
        'Kalau hanya perlu dua atau tiga elemen, prop biasa lebih sederhana',
        "Komponen yang hanya perlu menjadi `div` atau `section` tidak butuh generik sama sekali. Prop `sebagai?: 'div' | 'section'` beserta pemetaan sederhana sudah cukup, dan tipenya jauh lebih mudah dibaca. Naik ke polimorfik penuh hanya saat elemennya memang bisa apa saja.",
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan `tsc` dan tipe React 19, dan sebagian besarnya berupa pesan panjang yang perlu dibaca dari bawah.',
      ),
      code(
        'text',
        `
        <Kotak as="div" href="/x" />

        error TS2322: Type '{ children: string; as: "div"; href: string; }'
        is not assignable to type '...'
          Property 'href' does not exist on type '...'
        `,
        { caption: 'Diuji sungguhan. Atribut tidak sah untuk elemen yang dipilih.' },
      ),
      p(
        'Ini justru pesan yang diinginkan, sebab ia menangkap kesalahan yang tanpa tipe polimorfik akan lolos. Atribut `href` pada `div` tidak melakukan apa pun, dan tanpa penolakan ini seseorang bisa mengira ia membuat tautan padahal tidak. Baca baris terakhirnya, dan perbaikannya biasanya mengganti `as` menjadi elemen yang tepat.',
      ),
      code(
        'text',
        `
        const elemen = as ?? 'div';      // huruf kecil
        return <elemen {...sisa}>{children}</elemen>;

        // Tidak ada error. Hasilnya <elemen> di DOM.
        `,
        { caption: 'Variabel berhuruf kecil dianggap nama tag HTML.' },
      ),
      p(
        'Ini kesalahan satu huruf yang tidak menghasilkan error sama sekali. JSX mengirimkan nama berhuruf kecil sebagai nama tag apa adanya, dan peramban menerima tag apa pun tanpa protes. Gejalanya berupa elemen asing di DOM yang tidak punya gaya dan tidak punya perilaku. Selalu tampung ke variabel berhuruf kapital.',
      ),
      code(
        'text',
        `
        <Kotak as={Tautan} href="/x" prefetch />

        // Tipe props komponen kustom kadang tidak tersimpulkan.
        // Editor tidak melengkapi, dan salah ketik lolos.
        `,
        { caption: 'Penyimpulan tipe gagal pada komponen kustom yang generik.' },
      ),
      p(
        'Tipe polimorfik bekerja baik untuk elemen HTML dan bisa menyerah pada komponen kustom yang sendirinya generik. Gejalanya bukan error melainkan hilangnya bantuan, yaitu editor berhenti melengkapi dan salah ketik tidak lagi ditolak. Kalau itu terjadi, sebutkan tipenya secara manual dengan `<Kotak<typeof Tautan> ... />`, atau buat pembungkus khusus untuk komponen itu.',
      ),
      code(
        'text',
        `
        <Kotak as="button" onClick={simpan} />

        // Bekerja, dan tidak ada type="button".
        // Di dalam form, tombol ini MENGIRIM formulirnya.
        `,
        { caption: 'Bawaan elemen tidak ikut saat elemennya dipilih lewat prop.' },
      ),
      p(
        'Komponen polimorfik tidak tahu bawaan apa yang masuk akal untuk tiap elemen. Komponen tombol khusus bisa menyetel `type="button"` sebagai bawaan, sedangkan `Kotak` yang bisa menjadi apa saja tidak bisa. Ini salah satu batas nyata pola ini, yaitu ia menyeragamkan gaya dan tidak menyeragamkan perilaku. Untuk elemen yang butuh bawaan khusus, buat komponen tersendiri.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            "`Property 'href' does not exist on type ...`",
            'Atribut tidak sah untuk elemen yang dipilih',
            'Baca baris terakhir pesannya, lalu ganti `as` atau hapus atributnya',
          ],
          [
            'Tag asing muncul di DOM',
            'Variabel elemen berhuruf kecil',
            'Tampung ke variabel berhuruf kapital',
          ],
          [
            'Editor berhenti melengkapi props',
            'Penyimpulan tipe gagal pada komponen kustom generik',
            'Sebutkan tipenya manual, atau buat pembungkus khusus',
          ],
          [
            'Tombol mengirim formulir tanpa diminta',
            'Bawaan elemen tidak disediakan komponen polimorfik',
            'Buat komponen tersendiri untuk elemen yang butuh bawaan khusus',
          ],
          [
            'Pesan error sangat panjang dan sulit dibaca',
            'Tipe hasil gabungan ditampilkan seluruhnya',
            'Baca dari baris paling bawah, di situ letak informasinya',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Komponen polimorfik adalah pola yang biayanya nyata dan manfaatnya hanya terasa pada komponen yang benar-benar dipakai luas.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Menjadikan seluruh komponen polimorfik',
            'Supaya luwes',
            'Tipenya rumit, pesan errornya panjang, dan pelengkapan editor melambat. Pakai untuk komponen tata letak dasar saja',
          ],
          [
            'Memakai variabel berhuruf kecil untuk elemennya',
            'Ia kan variabel biasa',
            'JSX memperlakukannya sebagai nama tag HTML. Tidak ada error, dan hasilnya elemen asing di DOM',
          ],
          [
            'Melupakan `Omit` pada tipe atribut',
            'Atributnya kan sudah lengkap',
            'Prop `as` dan `children` bentrok dengan definisimu sendiri, dan tipenya menjadi tidak terduga',
          ],
          [
            'Mengira polimorfik juga menyeragamkan perilaku',
            'Elemennya kan bisa apa saja',
            'Ia hanya menyeragamkan gaya. Bawaan seperti `type="button"` tidak ikut, dan itu batas yang perlu disadari',
          ],
          [
            'Memakai polimorfik untuk komponen yang elemennya selalu sama',
            'Nanti mungkin berubah',
            'Menambah kerumitan tipe untuk keluwesan yang tidak pernah dipakai. Tambahkan saat kebutuhannya nyata',
          ],
          [
            'Membuat komponen terpisah untuk tiap elemen',
            'Lebih sederhana daripada generik',
            'Gaya harus dijaga tetap sama di beberapa tempat. Untuk dua atau tiga elemen, prop union sederhana lebih tepat daripada keduanya',
          ],
        ],
      ),
      p(
        "Baris terakhir menunjuk jalan tengah yang sering terlewat. Antara membuat empat komponen terpisah dan membuat tipe generik penuh, ada pilihan ketiga yang jauh lebih sederhana, yaitu prop `sebagai?: 'div' | 'section' | 'li'` dengan pemetaan biasa. Tipenya mudah dibaca, pesan errornya pendek, dan ia menutup sebagian besar kebutuhan nyata.",
      ),
      callout(
        'info',
        'Cara membaca pesan TypeScript yang panjang',
        'Pesan yang menampilkan tipe gabungan bisa mencapai sepuluh baris, dan hampir selalu informasinya ada di baris paling dalam yang menjorok paling jauh. Baca dari bawah ke atas, dan berhenti begitu menemukan kalimat yang menyebut nama properti atau tipe yang konkret. Sisanya hanya konteks.',
      ),
      references(
        {
          label: '<button>',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button',
          source: 'MDN Web Docs',
          note: 'Perilaku bawaan yang hilang saat kamu menggantinya dengan `<div>`: fokus, Enter, Spasi.',
        },
        {
          label: '<a>: The Anchor element',
          href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a',
          source: 'MDN Web Docs',
          note: 'Kenapa perpindahan alamat harus memakai tautan, bukan tombol yang memanggil router.',
        },
        {
          label: 'Common components — props bawaan tiap elemen',
          href: 'https://react.dev/reference/react-dom/components/common',
          source: 'React',
          note: 'Sumber tipe yang dibaca `ComponentPropsWithoutRef<T>` saat menentukan prop mana yang sah.',
        },
        {
          label: 'Omit<Type, Keys>',
          href: 'https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys',
          source: 'TypeScript',
          note: 'Cara menyingkirkan props elemen yang namanya bentrok dengan props milik komponenmu.',
        },
      ),
    ],
  ),

  written(
    'error-suspense-boundary',
    'Error Boundary & Suspense Boundary',
    22,
    'Membatasi dampak kegagalan dan penantian.',
    [
      p(
        'Keduanya adalah **boundary**: komponen yang menangkap sesuatu dari pohon di bawahnya. Error Boundary menangkap error saat render; Suspense Boundary menangkap penantian. Tanpa keduanya, satu komponen yang gagal atau lambat menjatuhkan seluruh halaman.',
      ),

      terms(
        {
          term: 'boundary',
          meaning:
            'Artinya **batas**. Komponen yang menangkap sesuatu dari pohon di bawahnya sehingga tidak merambat ke atas. Error Boundary menangkap **error saat render**; Suspense Boundary menangkap **penantian**. Tanpa keduanya, satu komponen yang gagal atau lambat menjatuhkan seluruh halaman.',
        },
        {
          term: 'class component',
          meaning:
            'Cara lama menulis komponen React, memakai `class ... extends Component`. Sampai hari ini Error Boundary **hanya** bisa ditulis begini — belum ada padanan hook-nya. Ini satu-satunya alasan tersisa untuk menulis class di React modern.',
        },
        {
          term: 'getDerivedStateFromError',
          meaning:
            'Metode statis yang React panggil saat render anak melempar error. Tugasnya satu: mengembalikan state baru sehingga komponen berpindah menampilkan fallback. Ia tidak boleh punya efek samping — pelaporan dikerjakan metode berikutnya.',
        },
        {
          term: 'componentDidCatch',
          meaning:
            'Metode tempat error **dilaporkan** ke layanan pemantauan. Ia menerima error beserta `componentStack` — jejak komponen yang menunjukkan di bagian pohon mana error itu terjadi, informasi yang tidak ada di stack trace biasa.',
        },
        {
          term: 'fallback',
          meaning:
            'Tampilan pengganti saat isi sebenarnya belum bisa ditampilkan — karena gagal (Error Boundary) atau karena masih ditunggu (Suspense). Ia bukan tempelan: fallback yang buruk merusak tata letak, dan itu dibahas tepat di bawah.',
        },
        {
          term: 'Suspense',
          meaning:
            'Komponen bawaan React yang menampilkan `fallback` selama anak-anaknya belum siap. Di Next.js App Router ia sekaligus mekanisme **streaming**: server mengirim HTML yang sudah siap lebih dulu, lalu menambal bagian yang lambat.',
        },
        {
          term: 'streaming',
          meaning:
            'Mengirim HTML secara bertahap, bukan menunggu semuanya selesai. Efeknya nyata bagi pengguna: header dan kerangka halaman muncul seketika, bukan layar kosong sampai query paling lambat selesai.',
        },
        {
          term: 'layout shift',
          meaning:
            'Konten yang melompat karena sesuatu muncul dan mendorongnya. Penyebab paling umum: fallback yang jauh lebih kecil daripada isi aslinya. Ini bukan urusan estetika — ia diukur sebagai **CLS**, metrik yang dinilai mesin pencari.',
        },
        {
          term: 'CLS',
          meaning:
            'Singkatan *Cumulative Layout Shift*, salah satu Core Web Vitals. Ia menjumlahkan seberapa banyak konten bergeser tanpa diminta pengguna. Ambang baiknya **< 0,1**. Skeleton yang kira-kira setinggi isi aslinya adalah cara paling murah menjaganya.',
        },
      ),

      h2('Error Boundary'),
      p(
        'Sampai hari ini, Error Boundary **hanya** bisa ditulis sebagai class component — belum ada padanan hook-nya. Ini satu-satunya alasan tersisa untuk menulis class di React modern.',
      ),
      code(
        'tsx',
        `
        'use client';

        import { Component, type ReactNode } from 'react';

        type Props = { children: ReactNode; fallback: (coba: () => void) => ReactNode };
        type State = { error: Error | null };

        export class BatasError extends Component<Props, State> {
          state: State = { error: null };

          // Dipanggil saat render anak melempar error -> ubah state jadi fallback.
          static getDerivedStateFromError(error: Error): State {
            return { error };
          }

          // Tempat melaporkan ke layanan pemantauan.
          componentDidCatch(error: Error, info: React.ErrorInfo) {
            laporkan(error, info.componentStack);
          }

          render() {
            if (this.state.error !== null) {
              return this.props.fallback(() => this.setState({ error: null }));
            }
            return this.props.children;
          }
        }
        `,
      ),
      p(
        'Dua method bernama panjang itu punya pembagian tugas yang jelas, dan komentarnya sudah menandainya. `getDerivedStateFromError` bersifat **murni**, sebab ia hanya mengubah error menjadi state tanpa boleh melakukan apa pun selain itu, dan hasilnya membuat `render()` berpindah ke cabang fallback. `componentDidCatch` adalah tempat efek samping, yaitu melaporkan ke layanan pemantauan, dan hanya di sinilah `componentStack` tersedia, yaitu jejak komponen mana yang bersarang di mana saat error terjadi. Perhatikan `static` pada method pertama, sebab ia dipanggil pada kelasnya dan bukan pada instance, justru karena React memanggilnya sebelum komponen dianggap dalam keadaan sehat. Dan `render()` di bawah hanya punya dua cabang, yaitu menampilkan fallback saat ada error dan menampilkan anaknya saat tidak ada, sehingga seluruh mekanismenya lebih sederhana daripada nama-nama methodnya.',
      ),
      code(
        'tsx',
        `
        <BatasError
          fallback={(coba) => (
            <div role="alert">
              <p>Bagian ini gagal dimuat.</p>
              <button onClick={coba}>Coba lagi</button>
            </div>
          )}
        >
          <GrafikPenjualan />
        </BatasError>
        `,
      ),
      p(
        'Prop `fallback` di sini adalah **render prop**, pola yang dibahas lebih dalam beberapa sub-bab lalu, berupa fungsi yang dipanggil `BatasError` sendiri alih-alih JSX statis. Fungsi itu menerima satu argumen, `coba`, yang saat dipanggil menjalankan `this.setState({ error: null })` untuk mengosongkan kembali state error, sehingga `render()` kembali ke cabang `this.props.children` dan React **mencoba melakukan re-render** `GrafikPenjualan` dari awal. Itulah mekanisme di balik tombol "Coba lagi", sebab ia tidak memuat ulang halaman atau memanggil API apa pun melainkan sekadar meminta `BatasError` melupakan error yang tersimpan dan memberi komponen anaknya kesempatan kedua.',
      ),
      callout(
        'warning',
        'Yang TIDAK ditangkap Error Boundary',
        'Error di dalam event handler, di dalam `setTimeout`, di kode asinkron, dan error saat rendering di server. Semuanya harus ditangani dengan `try/catch` biasa. Error Boundary hanya menangkap yang terjadi **saat React merender**.',
      ),

      h2('Letakkan boundary di beberapa tempat, bukan satu'),
      p(
        'Satu Error Boundary di root berarti satu widget yang gagal mengosongkan seluruh halaman. Pasang boundary di sekitar bagian yang bisa gagal secara independen: setiap widget dasbor, setiap panel, setiap area berdata.',
      ),
      code(
        'tsx',
        `
        <Dasbor>
          <BatasError fallback={...}><Pendapatan /></BatasError>
          <BatasError fallback={...}><Kunjungan /></BatasError>
          <BatasError fallback={...}><Aktivitas /></BatasError>
        </Dasbor>
        `,
        { caption: 'Grafik yang gagal tidak menghilangkan dua grafik lainnya.' },
      ),

      h2('Suspense Boundary'),
      code(
        'tsx',
        `
        import { Suspense } from 'react';

        export default function Halaman() {
          return (
            <>
              {/* Tampil segera */}
              <Header />

              {/* Halaman terkirim duluan; bagian ini menyusul saat datanya siap. */}
              <Suspense fallback={<SkeletonDaftar />}>
                <DaftarProduk />
              </Suspense>

              <Suspense fallback={<SkeletonUlasan />}>
                <Ulasan />
              </Suspense>
            </>
          );
        }
        `,
      ),
      p(
        'Perhatikan ada **dua** `Suspense` yang terpisah, dan bukan satu yang membungkus keduanya, dan itu keputusan yang menentukan. Dengan boundary terpisah, `DaftarProduk` bisa muncul begitu datanya siap tanpa menunggu `Ulasan` yang mungkin jauh lebih lambat, sedangkan satu boundary bersama akan membuat keduanya menunggu yang paling lambat. `<Header />` sengaja diletakkan di luar keduanya karena ia tidak mengambil data apa pun, sehingga bisa dikirim seketika. Aturan yang bisa dibawa, letakkan boundary di sekitar bagian yang **bisa selesai secara independen**, dan biarkan yang tidak butuh data berada di luar semuanya.',
      ),
      p(
        'Di Next.js App Router, `Suspense` adalah mekanisme **streaming**: server mengirim HTML yang sudah siap lebih dulu, lalu menambal bagian yang lambat begitu datanya selesai. Pengguna melihat header dan kerangka halaman seketika, bukan layar kosong sampai query paling lambat selesai.',
      ),

      h2('Fallback harus memesan ruang'),
      callout(
        'danger',
        'Spinner kecil adalah penyebab layout shift',
        'Fallback yang jauh lebih kecil daripada isi aslinya membuat konten melompat saat datanya tiba — dan itu langsung merusak Cumulative Layout Shift. Buat skeleton yang **kira-kira setinggi** isi aslinya. Ini bukan urusan estetika; CLS adalah metrik yang dinilai mesin pencari dan dirasakan pengguna sebagai kekacauan.',
      ),

      h2('Keduanya dipakai bersama'),
      code(
        'tsx',
        `
        <BatasError fallback={(coba) => <GagalMuat onCoba={coba} />}>
          <Suspense fallback={<SkeletonDaftar />}>
            <DaftarProduk />
          </Suspense>
        </BatasError>
        `,
      ),
      p(
        'Urutannya penting: Error Boundary **di luar** Suspense. Kalau terbalik, error yang terjadi setelah data tiba tidak akan tertangkap oleh boundary yang sudah "selesai" menunggu.',
      ),
      callout(
        'info',
        'Di Next.js, keduanya punya bentuk berbasis file',
        '`loading.tsx` otomatis menjadi Suspense boundary untuk segmen rute itu, dan `error.tsx` otomatis menjadi Error Boundary-nya. Keduanya dibahas di Bab 8.',
      ),
      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Halaman dasbor menampilkan enam widget, dan salah satunya memanggil API pihak ketiga yang sesekali mengirim bentuk data yang tidak diharapkan. Saat itu terjadi, seluruh dasbor menjadi layar putih. Pengguna kehilangan akses ke lima widget lain yang baik-baik saja, dan tidak ada satu pun pesan yang menjelaskan apa yang terjadi.',
      ),
      p(
        'Error boundary membatasi kerusakan pada bagian yang bermasalah. Berikut perilakunya, diukur dengan React 19 sungguhan di jsdom.',
      ),
      code(
        'text',
        `
        Komponen melempar saat render:
          componentDidCatch: gagal render
          render: Tertangkap: gagal render        <- fallback tampil

        Komponen melempar di dalam penangan onClick:
          setelah klik: batas TIDAK aktif         <- error LOLOS ke luar
        `,
        { caption: 'Diukur sungguhan. Error boundary hanya menangkap error saat render.' },
      ),
      p(
        'Baris kedua adalah batas yang paling sering disalahpahami. Error boundary menangkap error yang terjadi **selama render**, di dalam lifecycle, dan di dalam constructor. Ia **tidak** menangkap error dari penangan peristiwa, dari kode asinkron, dari `setTimeout`, maupun dari rendering di server. Untuk keempatnya, `try` biasa yang kamu tulis sendiri adalah satu-satunya jalan.',
      ),
      code(
        'tsx',
        `
        'use client';
        import { Component, type ErrorInfo, type ReactNode } from 'react';

        // Error boundary WAJIB berupa komponen kelas. Tidak ada padanan hook.
        type Props = { children: ReactNode; fallback: (galat: Error, ulang: () => void) => ReactNode };
        type State = { galat: Error | null };

        export class BatasGalat extends Component<Props, State> {
          state: State = { galat: null };

          // Dipanggil saat render untuk menentukan tampilan pengganti.
          static getDerivedStateFromError(galat: Error): State {
            return { galat };
          }

          // Dipanggil setelah commit. Tempat yang tepat untuk melapor.
          componentDidCatch(galat: Error, info: ErrorInfo) {
            laporkanKePemantauan(galat, { komponen: info.componentStack });
          }

          render() {
            if (this.state.galat) {
              return this.props.fallback(this.state.galat, () => this.setState({ galat: null }));
            }
            return this.props.children;
          }
        }
        `,
        { filename: 'src/ui/BatasGalat.tsx' },
      ),
      code(
        'tsx',
        `
        // Satu batas per widget. Satu yang rusak tidak menjatuhkan yang lain.
        <div className="grid">
          {widget.map((w) => (
            <BatasGalat
              key={w.id}
              fallback={(galat, ulang) => (
                <KartuGagal judul={w.judul} pesan="Widget ini gagal dimuat" onCobaLagi={ulang} />
              )}
            >
              <Suspense fallback={<KartuSkeleton />}>
                <Widget id={w.id} />
              </Suspense>
            </BatasGalat>
          ))}
        </div>
        `,
        { caption: 'Letak batasnya yang menentukan seberapa besar kerusakannya.' },
      ),
      p(
        'Menaruh satu batas per widget adalah keputusan yang paling menentukan. Satu batas di akar aplikasi memang menangkap segalanya, dan hasilnya seluruh halaman diganti pesan galat. Batas per bagian membuat kerusakan berhenti di bagian itu, dan lima widget lain tetap berguna. Aturan praktisnya, taruh batas di tiap tempat yang kegagalannya masih menyisakan halaman yang berguna.',
      ),
      p(
        'Pasangan `Suspense` dan `BatasGalat` menutup dua keadaan yang berbeda. `Suspense` menangani bagian yang **sedang** dimuat, dan `BatasGalat` menangani bagian yang **gagal**. Keduanya bekerja lewat mekanisme yang sama, yaitu komponen melempar sesuatu saat render, dan yang membedakan adalah apa yang dilempar. Janji ditangkap `Suspense`, dan error ditangkap batas galat.',
      ),
      p(
        'Fungsi `ulang` yang dikirim ke fallback memberi pengguna jalan keluar. Tanpa itu, satu kegagalan sementara membuat widget itu mati sampai halaman dimuat ulang. Menyetel `galat` kembali menjadi `null` membuat React mencoba merender anaknya lagi, dan untuk kegagalan jaringan sesaat itu sering langsung berhasil.',
      ),
      callout(
        'warning',
        'Di Next.js App Router, sudah ada berkas khusus untuk ini',
        'Berkas `error.tsx` di sebuah folder rute otomatis menjadi error boundary untuk rute itu, dan `loading.tsx` otomatis menjadi batas Suspense. Keduanya wajib Client Component. Memakai keduanya lebih tepat daripada memasang batas manual di tingkat halaman, sebab keduanya terhubung dengan sistem rutenya.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut diuji dengan React 19 sungguhan, dan sebagian besarnya berupa batas yang tidak menangkap apa yang diharapkan.',
      ),
      code(
        'text',
        `
        <BatasGalat fallback={...}>
          <button onClick={() => { throw new Error('gagal klik'); }}>klik</button>
        </BatasGalat>

        // Diukur: setelah klik, batas TIDAK aktif.
        // Error lolos sebagai unhandled error.
        `,
        { caption: 'Error boundary tidak menangkap error dari penangan peristiwa.' },
      ),
      p(
        'Ini batas yang paling sering menimbulkan kesalahpahaman, dan alasannya masuk akal. Error saat render membuat React tidak tahu apa yang harus digambar, sehingga ia butuh tampilan pengganti. Error di penangan peristiwa terjadi setelah semuanya tergambar, sehingga tidak ada yang perlu diganti. Bungkus isi penanganmu dengan `try`, lalu setel state galat sendiri.',
      ),
      code(
        'text',
        `
        <BatasGalat>
          <Widget />   {/* melempar di dalam useEffect */}
        </BatasGalat>

        // Tidak tertangkap. Error muncul di console sebagai unhandled.
        `,
        { caption: 'Error dari kode asinkron di dalam efek juga lolos.' },
      ),
      p(
        'Efek berjalan setelah commit, dan error yang dilempar dari dalam janji di sana tidak melewati jalur render. Untuk pengambilan data di dalam efek, tangkap errornya lalu simpan sebagai state, dan lempar saat render kalau kamu memang ingin batas galat yang menanganinya. Bentuk `if (galat) throw galat;` di badan komponen adalah pola yang dipakai sebagian pustaka untuk itu.',
      ),
      code(
        'text',
        `
        function BatasGalat({ children }) {      // komponen fungsi
          const [galat, setGalat] = useState(null);
          // ...tidak ada cara menangkap error dari children
        }

        // Tidak ada hook yang setara dengan getDerivedStateFromError.
        `,
        { caption: 'Error boundary wajib berupa komponen kelas.' },
      ),
      p(
        'Ini satu-satunya tempat di React modern yang masih mewajibkan komponen kelas. Tidak ada hook yang bisa menangkap error dari anaknya, dan itu keterbatasan yang disadari tim React. Jalan keluarnya menulis satu komponen kelas sekali lalu memakainya di mana-mana, atau memakai pustaka yang sudah menyediakannya.',
      ),
      code(
        'text',
        `
        // Satu batas di akar aplikasi.
        <BatasGalat><SeluruhAplikasi /></BatasGalat>

        // Satu widget gagal. Seluruh halaman diganti pesan galat.
        `,
        { caption: 'Batas terlalu tinggi, sehingga kerusakannya menyebar.' },
      ),
      p(
        'Tidak ada error, dan yang rusak adalah keputusan penempatannya. Batas di akar tetap diperlukan sebagai jaring pengaman terakhir, dan ia tidak boleh menjadi satu-satunya. Tambahkan batas di tiap bagian yang kegagalannya masih menyisakan halaman yang berguna, yaitu tiap widget, tiap panel, dan tiap bagian yang datanya dari sumber berbeda.',
      ),
      table(
        ['Gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Error dari penangan klik tidak tertangkap',
            'Error boundary hanya menangkap error saat render',
            'Bungkus isi penangan dengan `try`, lalu setel state galat',
          ],
          [
            'Error dari `useEffect` lolos ke console',
            'Efek berjalan setelah commit, di luar jalur render',
            'Tangkap lalu simpan sebagai state, dan lempar saat render bila perlu',
          ],
          [
            'Tidak bisa membuat batas dengan komponen fungsi',
            'Tidak ada hook yang setara',
            'Tulis satu komponen kelas, atau pakai pustaka',
          ],
          [
            'Satu kegagalan menjatuhkan seluruh halaman',
            'Hanya ada satu batas di akar',
            'Tambahkan batas per bagian yang berdiri sendiri',
          ],
          [
            'Pengguna tidak punya jalan keluar dari kegagalan',
            'Fallback tidak menyediakan cara mencoba lagi',
            'Kirim fungsi yang mengosongkan state galat ke fallback',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Error boundary sering dipasang sebagai formalitas di akar aplikasi, dan di situ ia memberi manfaat paling sedikit.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Memasang satu batas di akar dan menganggap selesai',
            'Semua error tertangkap',
            'Satu kegagalan kecil mengganti seluruh halaman. Tambahkan batas per bagian yang berdiri sendiri',
          ],
          [
            'Mengira batas menangkap error dari penangan peristiwa',
            'Ia kan menangkap error',
            'Hanya error saat render. Untuk penangan, pakai `try` yang kamu tulis sendiri',
          ],
          [
            'Menampilkan pesan teknis di fallback',
            'Supaya jelas apa yang salah',
            'Pesan teknis bisa memuat jalur berkas dan nama tabel. Tampilkan pesan yang kamu tulis, dan laporkan detailnya ke pemantauan',
          ],
          [
            'Tidak menyediakan cara mencoba lagi',
            'Pengguna bisa memuat ulang halaman',
            'Memuat ulang kehilangan seluruh keadaan halaman. Sediakan tombol yang hanya mengulang bagian yang gagal',
          ],
          [
            'Tidak melaporkan error ke pemantauan',
            'Fallbacknya sudah tampil',
            'Kamu tidak akan pernah tahu ada kegagalan. `componentDidCatch` adalah tempat yang tepat untuk melapor',
          ],
          [
            'Memakai batas galat untuk mengganti penanganan galat biasa',
            'Lebih sedikit kode',
            'Kegagalan yang bisa diperkirakan, misalnya 404 atau validasi, lebih baik ditangani sebagai keadaan biasa. Batas untuk yang tidak terduga',
          ],
        ],
      ),
      p(
        'Baris terakhir menunjuk pembedaan yang penting. Respons 404 dari server bukan hal yang tidak terduga melainkan keadaan yang wajar, dan menanganinya sebagai keadaan tampilan seperti dibahas di bab tentang state jauh lebih baik daripada melemparnya ke batas galat. Batas galat adalah jaring pengaman untuk hal yang **tidak** kamu perkirakan, dan kalau ia sering aktif itu tanda ada keadaan yang seharusnya ditangani secara eksplisit.',
      ),
      callout(
        'tip',
        'Uji batasmu dengan sengaja melempar',
        'Tambahkan tombol tersembunyi di mode pengembangan yang melempar error saat render, misalnya lewat state yang membuat komponennya melempar. Tekan, dan lihat apakah fallbacknya tampil dan apakah bagian lain halaman tetap berfungsi. Tanpa pengujian itu, kamu tidak tahu batasmu benar-benar bekerja sampai kegagalan sungguhan terjadi.',
      ),
      references(
        {
          label: 'Component — static getDerivedStateFromError',
          href: 'https://react.dev/reference/react/Component#static-getderivedstatefromerror',
          source: 'React',
          note: 'API resmi Error Boundary, termasuk daftar error yang justru TIDAK ia tangkap.',
        },
        {
          label: '<Suspense>',
          href: 'https://react.dev/reference/react/Suspense',
          source: 'React',
          note: 'Perilaku fallback dan aturan penempatan boundary.',
        },
        {
          label: 'Loading UI and Streaming',
          href: 'https://nextjs.org/docs/app/api-reference/file-conventions/loading',
          source: 'Next.js',
          note: 'Bentuk berbasis file dari Suspense boundary di App Router.',
        },
        {
          label: 'Cumulative Layout Shift (CLS)',
          href: 'https://web.dev/articles/cls',
          source: 'web.dev',
          note: 'Metrik yang langsung memburuk ketika fallback tidak memesan ruang yang cukup.',
        },
      ),
    ],
  ),

  written('portal-layering', 'Portal & Layering', 20, 'Merender di luar pohon DOM induknya.', [
    p(
      'Portal merender anak ke node DOM **di luar** hierarki induknya, sambil tetap mempertahankan posisinya di pohon React. Ini terdengar aneh sampai kamu menemui masalah yang ia selesaikan.',
    ),

    terms(
      {
        term: 'portal',
        meaning:
          'Mekanisme React untuk merender anak ke node DOM **di luar** hierarki induknya, sambil tetap mempertahankan posisinya di pohon React. Terdengar aneh sampai kamu menemui masalah yang ia selesaikan — dan masalah itu selalu berupa CSS yang memenjarakan.',
      },
      {
        term: 'containing block',
        meaning:
          'Kotak acuan yang dipakai browser untuk menghitung posisi sebuah elemen. Inti masalahnya ada di sini: `position: fixed` biasanya relatif terhadap viewport, **kecuali** ada induk ber-`transform` atau `filter` — yang membuat containing block baru dan menariknya ke situ.',
      },
      {
        term: 'overflow: hidden',
        meaning:
          'Properti CSS yang memotong apa pun yang keluar dari batas sebuah elemen. Salah satu dari tiga properti yang "memenjarakan" anak-anaknya — modal yang lahir di dalamnya akan terpotong tanpa ada yang salah di kode React-mu.',
      },
      {
        term: 'z-index',
        meaning:
          'Angka yang menentukan elemen mana tampil di atas mana. Ia adalah sumber frustrasi klasik karena bekerja **di dalam konteks penumpukan**, bukan secara global — `z-index: 9999` bisa kalah oleh elemen ber-`z-index: 1` di konteks yang berbeda.',
      },
      {
        term: 'createPortal',
        meaning:
          'Fungsi dari `react-dom` bertanda tangan `createPortal(anak, wadahDOM)`. Argumen keduanya adalah node DOM sungguhan, biasanya `document.body`, dan itulah sebabnya ia tidak bisa berjalan di server tempat `document` tidak ada.',
      },
      {
        term: 'event bubbling lewat pohon React',
        meaning:
          'Bagian yang paling sering mengejutkan: meski elemennya ada di `<body>`, secara React ia tetap anak dari komponen yang membuatnya. **Event tetap menggelembung ke induk React**, bukan ke induk DOM. Context juga tetap mengalir, dan Error Boundary di atasnya tetap menangkap.',
      },
      {
        term: 'focus trap',
        meaning:
          'Mengunci fokus keyboard di dalam dialog selama ia terbuka, sehingga Tab tidak menyasar ke halaman di belakangnya. Portal **tidak** memberimu ini — ia hanya memindahkan elemen. Kunci fokus, tutup dengan `Esc`, dan pengembalian fokus tetap tanggung jawabmu.',
      },
      {
        term: 'top layer',
        meaning:
          'Lapisan khusus browser di atas seluruh isi halaman, tempat `<dialog>` yang dibuka dengan `showModal()` dirender. Karena ia berada di luar aliran penumpukan biasa, ia **bebas dari seluruh masalah `z-index` dan `overflow`** yang jadi alasan portal dibuat.',
      },
      {
        term: 'aria-modal="true"',
        meaning:
          'Atribut yang memberitahu teknologi bantu bahwa isi di luar dialog ini sedang tidak relevan. Ia bekerja bersama `role="dialog"` — dan keduanya wajib ada, karena portal tidak menambahkannya untukmu.',
      },
    ),

    h2('Masalahnya: CSS yang memenjarakan'),
    p(
      'Modal yang dirender di dalam elemen ber-`overflow: hidden` akan terpotong. Yang ber-`position: relative` di induk akan salah posisi. Yang berada di dalam elemen dengan `transform` akan kehilangan `position: fixed` — karena `transform` membuat containing block baru, dan `fixed` jadi relatif terhadapnya, bukan terhadap viewport.',
    ),
    code(
      'css',
      `
        /* Tiga properti ini "memenjarakan" anak-anaknya */
        .kartu {
          overflow: hidden;   /* modal terpotong */
          transform: scale(1); /* position: fixed jadi relatif ke sini */
          filter: blur(0);     /* sama efeknya dengan transform */
        }
        `,
    ),

    h2('Solusinya'),
    code(
      'tsx',
      `
        'use client';

        import { createPortal } from 'react-dom';

        export function Modal({ anak, terbuka }: { anak: React.ReactNode; terbuka: boolean }) {
          if (!terbuka) return null;

          // Dirender ke <body>, tapi tetap "anak" komponen ini di pohon React.
          return createPortal(
            <div className="lapisan-modal" role="dialog" aria-modal="true">
              {anak}
            </div>,
            document.body,
          );
        }
        `,
    ),
    p(
      '`createPortal(anak, wadahDOM)` menerima dua argumen, yaitu apa yang mau dirender dan **ke mana** ia sungguhan diletakkan di DOM. Dipanggil di dalam `return` sebuah komponen dan bukan sebagai efek samping, sehingga React tetap menganggapnya sebagai hasil render biasa, hanya saja lokasinya di HTML akhir bukan di dalam `<div>` induk `Modal` melainkan langsung anak dari `document.body`. Komentar di kode di atas menegaskan inti seluruh sub-bab ini. Elemen `lapisan-modal` lolos dari `overflow: hidden` atau `transform` induknya secara **DOM**, tetapi secara **pohon React**, tempat `props`, `context`, dan `key` berlaku, ia tidak pernah pindah dari tempatnya semula.',
    ),

    h2('Yang tetap mengikuti pohon React'),
    p(
      'Ini bagian yang paling sering mengejutkan: meski elemennya ada di `<body>`, secara React ia tetap anak dari komponen yang membuatnya. Artinya **event tetap menggelembung ke induk React**, bukan ke induk DOM.',
    ),
    code(
      'tsx',
      `
        function Kartu() {
          // onClick ini TETAP terpanggil saat tombol di dalam modal diklik,
          // walaupun secara DOM modalnya ada di <body>.
          return (
            <div onClick={() => console.log('kartu diklik')}>
              <Modal terbuka anak={<button>Klik</button>} />
            </div>
          );
        }
        `,
    ),
    p(
      'Context juga tetap mengalir, dan Error Boundary di atasnya tetap menangkap error dari dalam portal.',
    ),

    h2('SSR: portal tidak bisa berjalan di server'),
    code(
      'tsx',
      `
        'use client';

        export function Modal({ anak }: { anak: React.ReactNode }) {
          const [terpasang, setTerpasang] = useState(false);

          // document belum ada saat render di server.
          useEffect(() => setTerpasang(true), []);

          if (!terpasang) return null;
          return createPortal(anak, document.body);
        }
        `,
    ),
    p(
      'Render pertama di server selalu menghasilkan `terpasang === false`, sehingga komponen mengembalikan `null` dan tidak pernah memanggil `createPortal` di server, sehingga mencegah crash karena `document` memang tidak ada di sana. Effect dengan dependency array kosong `[]` baru berjalan **setelah** React selesai memasang komponennya di browser, mengubah `terpasang` menjadi `true` dan memicu satu render tambahan yang akhirnya benar-benar merender portalnya. Konsekuensinya, modal ini muncul sepersekian detik **setelah** halaman selesai dimuat dan bukan bersamaan dengan HTML awal. Itu cukup singkat untuk tidak terasa mengganggu, tetapi berarti komponen ini tidak boleh dipakai untuk sesuatu yang harus terlihat sejak render pertama.',
    ),

    h2('Portal tidak menyelesaikan aksesibilitas'),
    callout(
      'warning',
      'Yang masih jadi tanggung jawabmu',
      'Portal hanya memindahkan elemen. Dialog tetap wajib: mengunci fokus di dalamnya selama terbuka, menutup dengan `Esc`, mengembalikan fokus ke elemen pemicunya setelah ditutup, memberi `role="dialog"` dan `aria-modal="true"`, dan mencegah halaman di belakangnya ikut ter-scroll.',
    ),

    h2('Alternatif modern: `<dialog>` dan popover'),
    code(
      'tsx',
      `
        // Elemen <dialog> bawaan browser sudah menangani banyak hal di atas:
        // focus trap, Esc, dan lapisan atas (top layer) tanpa z-index sama sekali.
        <dialog ref={ref}>
          <form method="dialog">
            <button>Tutup</button>
          </form>
        </dialog>

        // ref.current?.showModal();
        `,
    ),
    p(
      'Untuk dialog sederhana, `<dialog>` sering lebih baik daripada portal buatan sendiri — ia dirender di *top layer* browser sehingga bebas dari seluruh masalah `z-index` dan `overflow` di atas. Portal tetap diperlukan untuk hal yang bukan dialog: tooltip, dropdown, dan toast yang perlu keluar dari pembungkusnya.',
    ),
    divider,
    h2('Studi kasus di project nyata'),
    p(
      'Tabel produk punya menu aksi di tiap baris. Menunya terpotong di tepi bawah tabel, sebab wadah tabelnya memakai `overflow: auto` supaya bisa digulir mendatar. Solusi pertama menaikkan `z-index` menjadi 9999, dan menunya tetap terpotong. Solusi kedua menghapus `overflow`, dan tabelnya tidak lagi bisa digulir di ponsel.',
    ),
    p(
      'Menaikkan `z-index` tidak menolong karena masalahnya bukan urutan tumpukan melainkan **pemotongan oleh induk**. Elemen anak tidak bisa keluar dari wadah yang memotong isinya, berapa pun nilai `z-index`-nya.',
    ),
    code(
      'tsx',
      `
        import { createPortal } from 'react-dom';

        export function MenuAksi({ pemicuRef, terbuka, onTutup, children }: MenuProps) {
          const [posisi, setPosisi] = useState<{ atas: number; kiri: number } | null>(null);

          useEffect(() => {
            if (!terbuka || !pemicuRef.current) return;

            function hitung() {
              const kotak = pemicuRef.current!.getBoundingClientRect();
              setPosisi({ atas: kotak.bottom + window.scrollY, kiri: kotak.left + window.scrollX });
            }

            hitung();
            // Posisi harus ikut saat halaman digulir atau ukurannya berubah.
            window.addEventListener('scroll', hitung, { passive: true, capture: true });
            window.addEventListener('resize', hitung);
            return () => {
              window.removeEventListener('scroll', hitung, { capture: true });
              window.removeEventListener('resize', hitung);
            };
          }, [terbuka, pemicuRef]);

          if (!terbuka || !posisi) return null;

          // Dirender ke body, di luar wadah yang memotong.
          return createPortal(
            <div
              role="menu"
              className="menu"
              style={{ position: 'absolute', top: posisi.atas, left: posisi.kiri }}
            >
              {children}
            </div>,
            document.body,
          );
        }
        `,
      { filename: 'src/ui/MenuAksi.tsx' },
    ),
    p(
      'Portal memindahkan elemennya ke tempat lain di DOM, dan yang tetap adalah posisinya di pohon React. Ini pembedaan yang menentukan, sebab konteks tetap mengalir, peristiwa tetap merambat naik lewat pohon React, dan komponennya tetap menjadi anak dari induk aslinya. Yang berpindah hanya letaknya di DOM sungguhan.',
    ),
    p(
      'Karena posisinya kini absolut terhadap halaman, ia tidak lagi ikut bergerak saat wadahnya digulir. Itu sebabnya penangan `scroll` dipasang dengan opsi `capture: true`, yaitu supaya ia juga menangkap guliran dari wadah di dalam halaman bukan hanya guliran halaman. Tanpa itu, menunya akan tertinggal di tempat saat pengguna menggulir tabelnya.',
    ),
    p(
      'Perlu ditegaskan, untuk dialog modal kamu **tidak** membutuhkan portal sama sekali. Elemen `dialog` yang dibuka dengan `showModal` sudah naik ke lapisan teratas peramban, di luar seluruh konteks penumpukan dan di luar seluruh pemotongan. Portal diperlukan untuk hal yang bukan modal, yaitu menu, tooltip, dan popover yang harus menempel pada elemen tertentu.',
    ),
    code(
      'text',
      `
        Kapan portal DIBUTUHKAN, dan kapan tidak:

        Dialog modal              -> tidak. Pakai <dialog> dengan showModal.
        Menu yang menempel        -> ya, kalau induknya memotong isinya.
        Tooltip                   -> ya, dengan alasan yang sama.
        Toast di pojok layar      -> ya, atau taruh wadahnya di akar sejak awal.
        Dropdown di dalam form    -> ya, kalau formnya punya overflow.
        Elemen yang tidak dipotong -> tidak. Portal menambah kerumitan tanpa manfaat.
        `,
      { caption: 'Portal menyelesaikan pemotongan, bukan urutan tumpukan.' },
    ),
    callout(
      'warning',
      'Portal tidak menyelesaikan aksesibilitas dengan sendirinya',
      'Elemen yang dipindahkan ke `body` menjadi jauh dari pemicunya dalam urutan DOM, sehingga pengguna keyboard yang menekan Tab setelah pemicu akan melompat ke tempat yang tidak terduga. Untuk menu, kelola fokus secara eksplisit dan hubungkan dengan `aria-controls`. Untuk modal, elemen `dialog` sudah mengurusnya.',
    ),

    h2('Saat error-nya muncul'),
    p(
      'Empat kegagalan berikut adalah yang paling sering pada portal, dan dua di antaranya berupa error saat berjalan.',
    ),
    code(
      'text',
      `
        return createPortal(<Menu />, document.body);
        // dirender di server

        ReferenceError: document is not defined
        `,
      { caption: 'Portal memerlukan DOM, dan server tidak punya.' },
    ),
    p(
      'Ini error yang sama dengan yang dibahas di sub-bab Server Component, muncul dalam bentuk khas portal. Perbaikannya menandai komponennya dengan `use client` dan memastikan `createPortal` hanya dipanggil setelah komponennya terpasang. Pola yang umum adalah menyimpan state `sudahDipasang` yang disetel di dalam efek, lalu mengembalikan `null` sebelum itu.',
    ),
    code(
      'text',
      `
        createPortal(<Menu />, document.getElementById('portal-root'));

        Error: Target container is not a DOM element.
        `,
      { caption: 'Wadah tujuan tidak ditemukan.' },
    ),
    p(
      'Pesannya sama dengan yang muncul saat memasang React ke elemen yang tidak ada, dan penyebabnya juga sama. Elemen `#portal-root` belum ada di HTML, atau kodenya berjalan sebelum elemen itu dibaca. Memakai `document.body` menghindari seluruh masalah ini sebab ia selalu ada, dan itu pilihan yang cukup untuk sebagian besar kasus.',
    ),
    code(
      'text',
      `
        // Menu dirender lewat portal ke body.
        // Pengguna menggulir tabelnya.

        // Menu tetap di posisi lama, melayang di tengah layar.
        `,
      { caption: 'Posisi tidak diperbarui saat wadahnya digulir.' },
    ),
    p(
      'Karena elemennya tidak lagi berada di dalam wadah yang digulir, ia tidak ikut bergerak. Penangan `scroll` dengan `capture: true` menangkap guliran dari wadah mana pun di halaman, dan itu yang menutupnya. Pilihan lain yang lebih tahan adalah menutup menunya begitu ada guliran, dan itu perilaku yang dipakai banyak aplikasi karena lebih sederhana.',
    ),
    code(
      'text',
      `
        <div onClick={tutupMenu}>
          {createPortal(<Menu />, document.body)}
        </div>

        // Mengklik menu MENUTUP menu itu sendiri.
        // Peristiwa merambat lewat pohon React, bukan pohon DOM.
        `,
      { caption: 'Peristiwa dari portal tetap merambat ke induk React-nya.' },
    ),
    p(
      'Ini perilaku yang sering mengejutkan dan sebenarnya konsisten. Portal memindahkan elemennya di DOM dan tidak memindahkannya di pohon React, sehingga peristiwa tetap merambat ke induk React aslinya. Untuk penangan klik di luar, ini berarti pemeriksaan `contains` terhadap DOM tidak cukup, sebab menunya secara DOM berada di `body`. Periksa juga apakah targetnya berada di dalam elemen menunya sendiri.',
    ),
    table(
      ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
      [
        [
          '`document is not defined`',
          'Portal dipanggil saat rendering di server',
          'Tandai `use client`, dan panggil setelah komponennya terpasang',
        ],
        [
          '`Target container is not a DOM element`',
          'Elemen tujuan tidak ditemukan',
          'Pakai `document.body`, atau pastikan elemennya ada lebih dulu',
        ],
        [
          'Menu tertinggal saat halaman digulir',
          'Posisi absolut tidak ikut bergerak',
          'Hitung ulang pada `scroll` dengan `capture`, atau tutup menunya saat digulir',
        ],
        [
          'Klik di dalam menu menutup menunya',
          'Peristiwa merambat lewat pohon React, bukan DOM',
          'Periksa apakah target berada di dalam elemen menunya',
        ],
        [
          'Menu tetap terpotong walaupun `z-index` dinaikkan',
          'Masalahnya pemotongan oleh induk, bukan urutan tumpukan',
          'Pakai portal, atau hilangkan pemotongannya',
        ],
      ],
    ),

    h2('Kesalahan umum pemula'),
    p(
      'Portal adalah alat yang menyelesaikan satu masalah spesifik, dan sebagian besar kesalahan di bawah berasal dari memakainya untuk masalah yang lain.',
    ),
    table(
      ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
      [
        [
          'Menaikkan `z-index` untuk mengatasi elemen yang terpotong',
          'Ia soal lapisan',
          'Pemotongan oleh `overflow` induk tidak bisa diatasi `z-index` berapa pun. Yang dibutuhkan portal',
        ],
        [
          'Memakai portal untuk dialog modal',
          'Modal kan harus di atas semuanya',
          'Elemen `dialog` dengan `showModal` sudah naik ke lapisan teratas peramban. Portal menambah kerumitan tanpa manfaat',
        ],
        [
          'Mengira peristiwa tidak merambat dari portal',
          'Elemennya kan pindah ke body',
          'Ia berpindah di DOM, tidak di pohon React. Peristiwa tetap merambat ke induk React aslinya',
        ],
        [
          'Melupakan pengelolaan fokus',
          'Menunya sudah tampil',
          'Elemennya jauh dari pemicunya dalam urutan DOM, sehingga Tab melompat ke tempat yang tidak terduga',
        ],
        [
          'Memakai `z-index` yang terus dinaikkan',
          'Supaya pasti di atas',
          'Perang `z-index` tidak pernah selesai. Tetapkan skala lapisan sebagai token, misalnya dropdown 100 dan modal 200',
        ],
        [
          'Membuat elemen tujuan portal sendiri di HTML',
          'Lebih rapi daripada langsung ke body',
          'Menambah satu hal yang bisa tidak ada. `document.body` selalu ada dan cukup untuk sebagian besar kasus',
        ],
      ],
    ),
    p(
      'Baris kelima layak dijadikan keputusan tim sejak awal. Perang `z-index` terjadi karena tidak ada yang menetapkan skalanya, sehingga setiap orang menaikkan angkanya sedikit lebih tinggi dari yang sudah ada. Menetapkan tiga atau empat tingkat sebagai token, misalnya konten nol, dropdown seratus, modal dua ratus, dan pemberitahuan tiga ratus, menghentikan itu sepenuhnya.',
    ),
    callout(
      'info',
      'Konteks tetap mengalir lewat portal',
      'Komponen di dalam portal tetap bisa membaca konteks dari induk React-nya, termasuk tema, penyedia auth, dan penyedia rute. Ini konsekuensi langsung dari posisinya yang tidak berubah di pohon React, dan ia sering menjadi alasan memilih portal alih-alih merender ke `body` secara manual lewat DOM.',
    ),
    references(
      {
        label: 'createPortal',
        href: 'https://react.dev/reference/react-dom/createPortal',
        source: 'React',
        note: 'Termasuk penegasan bahwa event tetap menggelembung lewat pohon React, bukan pohon DOM.',
      },
      {
        label: 'Containing block',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Containing_block',
        source: 'MDN Web Docs',
        note: 'Kenapa `transform` dan `filter` membuat `position: fixed` berhenti mengacu ke viewport.',
      },
      {
        label: '<dialog>',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog',
        source: 'MDN Web Docs',
        note: 'Elemen bawaan yang sudah menangani focus trap, Esc, dan top layer tanpa `z-index`.',
      },
      {
        label: 'ARIA: dialog (modal) pattern',
        href: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
        source: 'W3C WAI-ARIA APG',
        note: 'Daftar kewajiban aksesibilitas yang tetap jadi tanggung jawabmu setelah portal dipasang.',
      },
    ),
  ]),

  written(
    'praktik-refactor-compound',
    'Praktik: Refactor komponen boolean-heavy',
    23,
    'Mengubah API yang sudah mulai rusak.',
    [
      p(
        'Latihan ini memakai bentuk yang muncul di hampir semua codebase yang berumur: komponen yang tumbuh satu prop pada satu waktu, masing-masing masuk akal saat ditambahkan, sampai keseluruhannya tidak bisa lagi dipahami.',
      ),

      terms(
        {
          term: 'boolean-heavy',
          meaning:
            'Komponen yang API-nya didominasi prop bernilai benar/salah. Bentuk ini muncul di hampir semua codebase yang berumur, dan cara munculnya selalu sama: satu prop pada satu waktu, masing-masing masuk akal saat ditambahkan, sampai keseluruhannya tidak bisa lagi dipahami.',
        },
        {
          term: 'prop berpasangan',
          meaning:
            'Dua prop yang selalu muncul bersama, seperti `adaGambar` + `gambar`. Salah satunya **selalu bisa disimpulkan** dari yang lain — jadi keduanya adalah dua source of truth untuk satu fakta. Obatnya: hapus yang boolean, biarkan keberadaan nilainya yang menjawab.',
        },
        {
          term: 'kombinasi mustahil',
          meaning:
            'Gabungan prop yang sah menurut tipe tapi tidak berarti apa-apa — `adaGambar={false} gambarDiAtas`. Delapan boolean berarti **256 kombinasi**, dan sebagian besarnya tidak valid. Tipe yang mengizinkan impossible state adalah tipe yang belum selesai.',
        },
        {
          term: 'variant (varian)',
          meaning:
            "Satu prop bernilai terbatas yang menggantikan beberapa boolean: `variant?: 'datar' | 'terangkat' | 'interaktif'`. Ia mengubah 8 kombinasi menjadi 3 keadaan yang memang ada, dan sekaligus memberi nama pada masing-masing.",
        },
        {
          term: 'discriminated union',
          meaning:
            "Gabungan beberapa bentuk tipe yang dibedakan satu properti penanda — di sini `variant`. Inilah yang membuat `'interaktif'` **wajib** punya `onClick` sementara varian lain **tidak boleh** punya, diperiksa saat type-check.",
        },
        {
          term: 'never',
          meaning:
            'Tipe TypeScript untuk "nilai yang tidak mungkin ada". `onClick?: never` berarti "prop ini tidak boleh diisi pada varian ini" — cara menyatakan larangan lewat tipe, bukan lewat komentar yang bisa diabaikan.',
        },
        {
          term: 'make illegal states unrepresentable',
          meaning:
            'Prinsip yang menutup latihan ini: kalau sebuah keadaan tidak valid, buat ia **tidak bisa dinyatakan** — bukan divalidasi saat runtime. Error saat type-check lebih murah daripada bug di produksi, dan tidak butuh siapa pun mengingat aturannya.',
        },
        {
          term: 'kapan berhenti',
          meaning:
            'Bagian yang sering dilewatkan dari sebuah refactor. Compound component lebih panjang ditulis dan menambah satu konsep untuk dipahami. Kalau komponennya dipakai di tiga tempat dengan bentuk sama persis, berhenti di Langkah 2 — melanjutkan berarti membayar tanpa membeli apa pun.',
        },
      ),

      h2('Titik awal'),
      code(
        'tsx',
        `
        type PropsKartu = {
          judul: string;
          isi: string;
          gambar?: string;
          adaGambar?: boolean;
          gambarDiAtas?: boolean;
          adaTombol?: boolean;
          labelTombol?: string;
          onTombolKlik?: () => void;
          adaBadge?: boolean;
          teksBadge?: string;
          warnaBadge?: 'merah' | 'hijau';
          kompak?: boolean;
          berbayang?: boolean;
          bisaDiklik?: boolean;
          onKartuKlik?: () => void;
        };

        export function Kartu(props: PropsKartu) {
          // ...sekitar 80 baris kondisional
        }
        `,
      ),
      p(
        'Tipe ini adalah gejala yang paling mudah dikenali, dan ia tumbuh perlahan, sebab tidak ada satu commit pun yang salah, hanya deretan permintaan wajar yang masing-masing menambah satu prop. Perhatikan polanya, yaitu **delapan boolean** (`adaGambar`, `gambarDiAtas`, `adaTombol`, `adaBadge`, `kompak`, `berbayang`, `bisaDiklik`, dan pasangannya) yang secara matematis menghasilkan 256 kombinasi, sementara mungkin hanya selusin yang masuk akal. Perhatikan juga hampir semuanya opsional dengan tanda `?`, sehingga TypeScript tidak bisa membantu, sebab tipe ini menerima `<Kartu judul="a" isi="b" />` maupun kombinasi yang tidak berarti apa-apa dengan sama sahnya. Komentar "sekitar 80 baris kondisional" adalah akibat langsungnya, sebab setiap boolean menambah percabangan di dalam.',
      ),

      h2('Diagnosisnya'),
      ol(
        '**Prop berpasangan.** `adaGambar` + `gambar`, `adaBadge` + `teksBadge`. Salah satunya selalu bisa disimpulkan dari yang lain — dua source of truth untuk satu fakta.',
        '**Kombinasi mustahil.** `adaGambar={false} gambarDiAtas` sah menurut tipenya, dan tidak berarti apa-apa. Delapan boolean berarti 256 kombinasi, sebagian besar tidak valid.',
        '**Susunan terkunci.** Tidak ada cara menaruh badge di bawah judul tanpa menambah prop baru lagi.',
        '**Call site tidak terbaca.** `<Kartu kompak berbayang bisaDiklik adaBadge />` tidak memberi tahu pembaca bentuk hasilnya.',
      ),

      h2('Langkah 1 — hapus boolean yang bisa disimpulkan'),
      compare(
        {
          title: 'Sebelum',
          lang: 'tsx',
          code: `
          <Kartu
            adaGambar
            gambar="/foto.jpg"
            adaBadge
            teksBadge="Baru"
          />
          `,
          notes: ['adaGambar={false} gambar="/foto.jpg" — apa artinya?'],
        },
        {
          title: 'Sesudah',
          lang: 'tsx',
          code: `
          <Kartu
            gambar="/foto.jpg"
            badge="Baru"
          />

          // Di dalam komponen:
          {gambar !== undefined && <img src={gambar} alt="" />}
          `,
          notes: ['Keberadaan nilainya sudah menjadi jawabannya'],
        },
      ),
      p(
        'Langkah pertama ini menghapus **empat prop menjadi dua** tanpa kehilangan satu pun kemampuan, dan prinsipnya bisa dipakai di mana saja, yaitu kalau sebuah boolean selalu bisa disimpulkan dari keberadaan nilai lain, ia tidak perlu ada. Catatan di kolom kiri menunjukkan alasannya, sebab `adaGambar={false}` bersama `gambar="/foto.jpg"` adalah kombinasi yang sah menurut tipenya tetapi tidak punya arti, dan setiap kombinasi tanpa arti adalah pertanyaan yang harus dijawab pembaca kode. Baris terakhir kolom kanan menunjukkan penerapannya di dalam komponen, sebab `gambar !== undefined` menggantikan pemeriksaan `adaGambar`, sehingga tidak ada lagi dua nilai yang bisa saling bertentangan. Perhatikan pemeriksaannya memakai `!== undefined` dan bukan `&&` polos, sebab string kosong adalah nilai yang sah dan tidak boleh diperlakukan sebagai "tidak ada".',
      ),

      h2('Langkah 2 — gabungkan boolean tampilan menjadi varian'),
      code(
        'tsx',
        `
        // Sebelum: kompak + berbayang + bisaDiklik = 8 kombinasi
        // Sesudah: hanya keadaan yang benar-benar ada
        type PropsKartu = {
          variant?: 'datar' | 'terangkat' | 'interaktif';
          size?: 'sm' | 'md';
        };
        `,
      ),
      p(
        'Ini juga menyelesaikan masalah tersembunyi: `bisaDiklik` tanpa `onKartuKlik` sebelumnya menghasilkan kartu yang terlihat bisa diklik tapi tidak melakukan apa-apa. Dengan varian `interaktif`, handler bisa dijadikan wajib lewat tipe.',
      ),

      h2('Langkah 3 — serahkan susunan lewat compound component'),
      code(
        'tsx',
        `
        <Kartu variant="terangkat">
          <Kartu.Media src="/foto.jpg" alt="" />
          <Kartu.Badge nada="hijau">Baru</Kartu.Badge>
          <Kartu.Judul>Belajar React</Kartu.Judul>
          <Kartu.Isi>Mulai dari komponen dan props.</Kartu.Isi>
          <Kartu.Aksi>
            <Tombol onClick={mulai}>Mulai</Tombol>
          </Kartu.Aksi>
        </Kartu>
        `,
      ),
      p(
        'Lima belas prop menyusut menjadi dua, dan setiap susunan baru sekarang tidak memerlukan perubahan apa pun pada komponennya.',
      ),

      h2('Langkah 4 — pastikan yang mustahil tidak bisa ditulis'),
      code(
        'ts',
        `
        // Discriminated union: 'interaktif' WAJIB punya handler,
        // varian lain TIDAK BOLEH punya.
        type PropsKartu =
          | { variant?: 'datar' | 'terangkat'; onClick?: never; children: ReactNode }
          | { variant: 'interaktif'; onClick: () => void; children: ReactNode };
        `,
      ),
      p(
        'Kuncinya ada pada `onClick?: never` di cabang pertama, yaitu bentuk yang mungkin terlihat aneh tetapi sangat berguna. `never` berarti "tidak ada nilai yang sah untuk ini", sehingga `<Kartu variant="datar" onClick={...} />` ditolak type-check, karena kartu yang tidak interaktif **tidak bisa** diberi handler klik. Cabang kedua melakukan kebalikannya, sebab `onClick` di sana wajib tanpa tanda tanya, sehingga `<Kartu variant="interaktif">` tanpa handler juga ditolak. Perhatikan `variant` di cabang pertama opsional sedangkan di cabang kedua wajib, dan itu yang memungkinkan TypeScript memilih cabang yang tepat berdasarkan nilainya, persis mekanisme diskriminan dari Bab 6. Hasilnya, dua kesalahan yang sebelumnya hanya bisa ditemukan dengan mencoba kini **tidak bisa dituliskan sama sekali**.',
      ),
      callout(
        'tip',
        'Prinsip yang berlaku umum',
        'Kalau sebuah keadaan tidak valid, buat ia **tidak bisa dinyatakan** — bukan divalidasi saat runtime. Error saat type-check lebih murah daripada bug di produksi, dan tidak butuh siapa pun mengingat aturannya.',
      ),

      h2('Kapan berhenti'),
      p(
        'Refactor ini punya biaya: compound component lebih panjang ditulis dan butuh satu konsep lagi untuk dipahami. Kalau komponennya dipakai di tiga tempat dengan bentuk yang sama persis, berhenti di Langkah 2. Lanjutkan ke Langkah 3 hanya kalau susunannya memang bervariasi di pemakaian nyata.',
      ),

      divider,

      checklist(
        'fi6-praktik',
        'Checklist praktik bab ini',
        'Cari satu komponen di kodemu yang punya lebih dari lima prop boolean',
        'Hapus setiap boolean yang bisa disimpulkan dari keberadaan prop lain',
        'Gabungkan boolean tampilan menjadi satu prop `variant`',
        'Ubah satu komponen berprop banyak menjadi compound component',
        'Pakai discriminated union supaya kombinasi mustahil ditolak type-check',
        'Periksa ulang setiap `"use client"`: bisakah batasnya diturunkan lebih dekat ke daun?',
        'Pastikan setiap elemen yang bisa diklik benar-benar `<button>` atau `<a>`',
        'Bungkus minimal satu widget berdata dengan Error Boundary dan Suspense',
      ),

      divider,
      h2('Studi kasus di project nyata'),
      p(
        'Komponen `Wisaya` dipakai untuk empat alur bertahap, yaitu pendaftaran, pengajuan cuti, unggah dokumen, dan pengaturan awal. Bentuknya menerima array langkah beserta belasan field konfigurasi. Setelah setahun, arraynya punya sembilan belas field, tiga di antaranya hanya dipakai satu alur, dan tidak ada yang berani menghapus apa pun sebab tidak jelas siapa yang memakainya.',
      ),
      p(
        'Praktik ini mengubahnya menjadi komponen majemuk, dan yang layak diperhatikan bukan hasil akhirnya melainkan **urutan langkahnya**, sebab mengubah komponen yang sudah dipakai di empat tempat menuntut kehati-hatian.',
      ),
      code(
        'text',
        `
        Urutan yang menjaga aplikasinya tetap jalan di tiap langkah:

        1. Tulis bentuk majemuk BARU di sebelah yang lama, jangan mengganti.
           Nama sementara boleh, misalnya WisayaBaru.

        2. Pindahkan SATU pemakai ke bentuk baru. Jalankan, dan periksa.

        3. Ulangi untuk pemakai berikutnya. Tiap satu bisa dihentikan
           kalau ada yang tidak cocok.

        4. Setelah seluruh pemakai pindah, hapus yang lama.
           Baru di sini nama sementara diganti.

        5. Jalankan seluruh check, dan periksa tidak ada rujukan tertinggal.

        Yang TIDAK dilakukan: mengubah komponen lama di tempat sambil
        berharap keempat pemakainya ikut benar.
        `,
        { caption: 'Tiap langkah menghasilkan keadaan yang bisa dijalankan.' },
      ),
      code(
        'tsx',
        `
        // Bentuk baru: konteks internal, bagian sebagai properti.
        type KonteksWisaya = {
          langkah: string;
          urutan: string[];
          selesai: ReadonlySet<string>;
          maju: () => void;
          mundur: () => void;
          lompat: (ke: string) => void;
        };

        const Konteks = createContext<KonteksWisaya | null>(null);

        function pakaiWisaya(nama: string) {
          const k = useContext(Konteks);
          if (!k) throw new Error(\`<Wisaya.\${nama}> harus berada di dalam <Wisaya>\`);
          return k;
        }

        export function Wisaya({ urutan, awal, children, onSelesai }: WisayaProps) {
          const [langkah, setLangkah] = useState(awal ?? urutan[0]);
          const [selesai, setSelesai] = useState<ReadonlySet<string>>(new Set());

          const nilai = useMemo<KonteksWisaya>(() => {
            const i = urutan.indexOf(langkah);
            return {
              langkah,
              urutan,
              selesai,
              maju() {
                setSelesai((lama) => new Set(lama).add(langkah));
                if (i >= urutan.length - 1) onSelesai?.();
                else setLangkah(urutan[i + 1]);
              },
              mundur() {
                if (i > 0) setLangkah(urutan[i - 1]);
              },
              lompat(ke) {
                // Hanya ke langkah yang SUDAH pernah diselesaikan.
                if (selesai.has(ke)) setLangkah(ke);
              },
            };
          }, [langkah, urutan, selesai, onSelesai]);

          return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
        }

        Wisaya.Penanda = function Penanda() {
          const { urutan, langkah, selesai, lompat } = pakaiWisaya('Penanda');
          return (
            <ol className="penanda">
              {urutan.map((id, i) => (
                <li key={id} aria-current={id === langkah ? 'step' : undefined}>
                  <button type="button" onClick={() => lompat(id)} disabled={!selesai.has(id)}>
                    {i + 1}
                  </button>
                </li>
              ))}
            </ol>
          );
        };

        Wisaya.Langkah = function Langkah({ id, children }: LangkahProps) {
          const { langkah } = pakaiWisaya('Langkah');
          if (id !== langkah) return null;
          return <section>{children}</section>;
        };

        Wisaya.Navigasi = function Navigasi() {
          const { maju, mundur, urutan, langkah } = pakaiWisaya('Navigasi');
          const pertama = urutan.indexOf(langkah) === 0;
          return (
            <div className="wisaya-navigasi">
              <button type="button" onClick={mundur} disabled={pertama}>Kembali</button>
              <button type="button" onClick={maju}>Lanjut</button>
            </div>
          );
        };
        `,
        { filename: 'src/ui/Wisaya.tsx' },
      ),
      p(
        'Seluruh aturan tentang langkah mana yang boleh dituju kini tinggal di satu tempat, yaitu di dalam `lompat`. Pada bentuk lama, aturan itu tersebar di tiap tombol yang bisa memindahkan langkah, dan salah satu selalu terlewat saat aturannya berubah. Ini keuntungan yang sama dengan reducer di bab tentang state, dan memang keduanya menyelesaikan masalah yang sama.',
      ),
      p(
        'Atribut `aria-current="step"` pada penanda langkah adalah detail kecil yang berdampak nyata. Ia memberi tahu pembaca layar langkah mana yang sedang aktif, dan tanpa itu pengguna mendengar deretan angka tanpa tahu ia berada di mana. Nilai `step` memang disediakan khusus untuk keperluan ini.',
      ),
      p(
        'Perhatikan `Wisaya.Langkah` mengembalikan `null` untuk langkah yang tidak aktif, bukan menyembunyikannya dengan CSS. Ini keputusan yang disengaja, sebab langkah yang tidak aktif sering berisi formulir dengan kolom yang tidak boleh ikut terkirim maupun ikut difokus Tab. Kalau isinya berat dan kamu ingin mempertahankan state di dalamnya, pertimbangkan atribut `hidden` sebagai gantinya.',
      ),
      callout(
        'tip',
        'Nama sementara adalah alat, bukan utang',
        'Menulis `WisayaBaru` di sebelah `Wisaya` terasa seperti membuat duplikat, dan itu justru yang membuat perpindahannya aman. Selama keduanya ada, tiap pemakai bisa dipindahkan sendiri-sendiri dan aplikasinya tetap jalan. Yang menjadi utang adalah membiarkan keduanya hidup berbulan-bulan, jadi selesaikan perpindahannya lalu hapus yang lama.',
      ),

      h2('Saat error-nya muncul'),
      p(
        'Empat kegagalan berikut adalah yang paling sering saat mengubah komponen yang sudah dipakai, dan dua di antaranya baru terlihat setelah perubahannya selesai.',
      ),
      code(
        'text',
        `
        <Wisaya.Langkah id="alamat">...</Wisaya.Langkah>
        {/* dipakai di luar <Wisaya> */}

        Error: <Wisaya.Langkah> harus berada di dalam <Wisaya>
        `,
        { caption: 'Penjaga konteks memberi pesan yang menyebut penyebabnya.' },
      ),
      p(
        "Tanpa penjaga itu, pesannya akan berbunyi `Cannot read properties of null (reading 'langkah')`, yaitu pesan yang tidak memberi petunjuk sama sekali. Saat memindahkan empat pemakai sekaligus, pesan yang jelas menghemat waktu yang nyata. Tulis penjaganya lebih dulu, sebelum memindahkan satu pun pemakai.",
      ),
      code(
        'text',
        `
        setSelesai((lama) => { lama.add(langkah); return lama; });

        // Tidak ada error. Penanda langkah tidak pernah berubah.
        `,
        { caption: '`Set` diubah di tempat, dan rujukannya tetap sama.' },
      ),
      p(
        'Method `add` mengembalikan `Set` yang sama, sehingga React menyimpulkan tidak ada perubahan dan melewati penggambaran ulang. Gejalanya khas, yaitu langkahnya maju sementara penandanya tidak ikut. Buat `Set` baru dengan `new Set(lama).add(...)`. Ini pantangan mutasi yang sudah muncul beberapa kali, dan `Set` termasuk yang paling sering terlewat.',
      ),
      code(
        'text',
        `
        # Setelah komponen lama dihapus:
        $ npm run build
        Module not found: Can't resolve './WisayaLama'

        # Ada satu berkas yang belum dipindahkan.
        `,
        { caption: 'Rujukan tertinggal setelah komponen lama dihapus.' },
      ),
      p(
        'Ini justru kegagalan yang diinginkan, sebab ia tertangkap saat membangun bukan saat berjalan. Cara mencegahnya lebih awal adalah mencari seluruh rujukan sebelum menghapus, dengan `grep -rn "WisayaLama" src/`. Kalau hasilnya kosong, penghapusannya aman. Ini langkah lima pada urutan di studi kasus, dan melewatkannya berarti build yang gagal.',
      ),
      code(
        'text',
        `
        # Perpindahan selesai. Seluruh check hijau.
        # Dua minggu kemudian, pengguna melaporkan tombol Kembali
        # di langkah terakhir tidak berfungsi.

        # Perilaku itu ada di komponen lama dan tidak ikut dipindahkan.
        `,
        { caption: 'Perilaku yang tidak tertulis di mana pun ikut hilang.' },
      ),
      p(
        'Ini risiko terbesar dari mengubah komponen yang sudah lama hidup, yaitu ada perilaku yang tidak tertulis di tipe, tidak tertulis di dokumentasi, dan hanya diketahui dari kodenya. Cara menguranginya adalah membaca komponen lama sampai habis sebelum menulis yang baru, dan menuliskan daftar perilakunya sebagai catatan. Kalau ada test, jalankan test lama terhadap komponen baru.',
      ),
      table(
        ['Pesan atau gejala', 'Penyebab sebenarnya', 'Perbaikannya'],
        [
          [
            'Pesan error tidak memberi petunjuk',
            'Tidak ada penjaga di pembaca konteks',
            'Tulis penjaga dengan pesan yang menyebut induknya',
          ],
          [
            'Penanda langkah tidak ikut berubah',
            '`Set` diubah di tempat',
            'Buat `Set` baru dengan `new Set(lama)`',
          ],
          [
            '`Module not found` setelah menghapus yang lama',
            'Masih ada rujukan yang tertinggal',
            'Cari seluruh rujukan dengan `grep` sebelum menghapus',
          ],
          [
            'Perilaku hilang tanpa disadari',
            'Ada perilaku yang tidak tertulis di mana pun',
            'Baca komponen lama sampai habis, dan jalankan test lamanya',
          ],
          [
            'Aplikasi rusak di tengah perpindahan',
            'Komponen lama diubah di tempat',
            'Tulis yang baru di sebelahnya, lalu pindahkan pemakai satu per satu',
          ],
        ],
      ),

      h2('Kesalahan umum pemula'),
      p(
        'Praktik penutup bab ini tentang mengubah kode yang sudah dipakai, dan sebagian besar kesalahan di bawah berasal dari mengubah terlalu banyak sekaligus.',
      ),
      table(
        ['Yang sering dilakukan', 'Kenapa terasa benar', 'Yang sebenarnya terjadi'],
        [
          [
            'Mengubah komponen lama di tempat',
            'Sekalian, tidak perlu duplikat',
            'Aplikasi rusak di tengah jalan, dan tidak ada titik aman untuk berhenti. Tulis yang baru di sebelahnya',
          ],
          [
            'Memindahkan seluruh pemakai dalam satu perubahan',
            'Sekalian selesai',
            'Diff-nya terlalu besar untuk ditinjau, dan kalau ada yang rusak sulit tahu bagian mana',
          ],
          [
            'Menghapus komponen lama sebelum memeriksa rujukan',
            'Semua sudah dipindahkan',
            'Selalu ada satu yang terlewat. Cari dengan `grep` lebih dulu',
          ],
          [
            'Tidak membaca komponen lama sampai habis',
            'Bentuk barunya sudah jelas',
            'Ada perilaku yang tidak tertulis di tipe maupun dokumentasi, dan ia ikut hilang tanpa disadari',
          ],
          [
            'Mengubah bentuk sekaligus memperbaiki bug',
            'Sekalian dibereskan',
            'Kalau ada yang rusak, tidak jelas apakah karena perubahan bentuk atau karena perbaikannya. Pisahkan menjadi dua perubahan',
          ],
          [
            'Membiarkan komponen lama dan baru hidup berbulan-bulan',
            'Nanti dihapus kalau sempat',
            'Dua komponen yang harus dirawat, dan orang baru tidak tahu mana yang benar. Selesaikan perpindahannya',
          ],
        ],
      ),
      p(
        'Baris kelima layak dijadikan aturan tetap. Menggabungkan perubahan bentuk dengan perbaikan bug membuat setiap kegagalan punya dua tersangka, dan menelusurinya jauh lebih lama. Pindahkan bentuknya lebih dulu sampai seluruh check hijau, baru perbaiki bugnya sebagai perubahan berikutnya. Urutan itu juga membuat tinjauan kodenya jauh lebih mudah.',
      ),
      callout(
        'info',
        'Yang kamu bawa dari bab ini ke bab berikutnya',
        'Komposisi menang atas konfigurasi saat pemakaiannya beragam, dan sebaliknya saat bentuknya tetap. Custom hook menggantikan sebagian besar pemakaian HOC dan render props. Batas `use client` menentukan apa yang terkirim ke peramban. Dan error boundary hanya menangkap error saat render. Bab berikutnya membahas hook secara mendalam, termasuk kenapa sebagian besar pemakaian `useEffect` yang beredar sebenarnya tidak diperlukan.',
      ),
      references(
        {
          label: 'Passing Props to a Component',
          href: 'https://react.dev/learn/passing-props-to-a-component',
          source: 'React',
          note: 'Dasar merancang bentuk props — termasuk mengoper JSX alih-alih menambah prop baru.',
        },
        {
          label: 'Discriminated unions',
          href: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions',
          source: 'TypeScript',
          note: 'Mekanisme Langkah 4 yang membuat kombinasi mustahil ditolak saat type-check.',
        },
        {
          label: 'The never type',
          href: 'https://www.typescriptlang.org/docs/handbook/2/functions.html#never',
          source: 'TypeScript',
          note: 'Cara menyatakan "prop ini tidak boleh ada di varian ini" lewat tipe.',
        },
        {
          label: 'Choosing the State Structure',
          href: 'https://react.dev/learn/choosing-the-state-structure',
          source: 'React',
          note: 'Prinsip yang sama diterapkan ke state: hindari nilai yang bisa disimpulkan dari nilai lain.',
        },
      ),
    ],
  ),
];
