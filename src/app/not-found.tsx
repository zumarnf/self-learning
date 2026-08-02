import { ButtonLink } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/primitives';

/** 404 — a wrong turn still gets a way forward, never a dead end. */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center md:px-8">
      <Eyebrow>404</Eyebrow>
      <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
        Halaman ini tidak ada
      </h1>
      <p className="text-muted mx-auto mt-3 max-w-prose">
        Mungkin tautannya salah ketik, atau sub-bab yang kamu tuju sudah disusun ulang. Daftar kelas
        selalu jadi titik aman untuk kembali.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <ButtonLink variant="primary" href="/kelas">
          Buka daftar kelas
        </ButtonLink>
        <ButtonLink href="/">Kembali ke dashboard</ButtonLink>
      </div>
    </div>
  );
}
