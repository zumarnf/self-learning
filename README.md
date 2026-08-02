# Ruang Belajar Fullstack

Website belajar mandiri berisi kurikulum Fullstack Developer — 5 kategori, 31 bab, 330 sub-bab.
Dipakai satu pengguna di perangkatnya sendiri: tanpa database, tanpa backend, tanpa autentikasi.
Progres belajar disimpan di `localStorage`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript 5.9 (`strict`)
- Tailwind CSS 4 (CSS-first `@theme`) · Shiki · Sandpack
- Vitest · Node >= 20.9

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

## Perintah

| Keperluan          | Perintah                            |
| ------------------ | ----------------------------------- |
| Build              | `npm run build`                     |
| Test               | `npm run test`                      |
| Lint / format      | `npm run lint` · `npm run format`   |
| Type-check         | `npm run type-check`                |
| Semua sekaligus    | `npm run check`                     |

## Struktur

```
src/app/          rute App Router
src/components/   layout · content · learning · ui
src/content/      kurikulum, glosarium, cheatsheet (data, bukan UI)
src/lib/          content · curriculum · learning · utils
src/test/         Vitest
```
