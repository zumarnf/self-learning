'use client';

import { useState } from 'react';
import { PlaygroundBlock } from '@/components/learning/playground-block';
import { Eyebrow } from '@/components/ui/primitives';
import { cn } from '@/lib/utils/cn';

/**
 * Free-form playground.
 *
 * Two starting points rather than an empty editor: a blank page is a worse prompt than a small
 * working example you can delete. Everything runs inside Sandpack's sandboxed iframe, loaded
 * only after the reader asks for it (FR-7.2, FR-7.3).
 */

const VANILLA_FILES = {
  '/index.html': `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <title>Latihan</title>
  </head>
  <body>
    <h1>Latihan JavaScript</h1>
    <button id="tambah">Tambah</button>
    <p>Jumlah: <span id="jumlah">0</span></p>

    <script type="module" src="./index.js"></script>
  </body>
</html>
`,
  '/index.js': `const tombol = document.getElementById('tambah');
const keluaran = document.getElementById('jumlah');

let jumlah = 0;

tombol.addEventListener('click', () => {
  jumlah += 1;
  keluaran.textContent = String(jumlah);
});
`,
};

const REACT_FILES = {
  '/App.js': `import { useState } from 'react';

export default function App() {
  const [jumlah, setJumlah] = useState(0);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>Latihan React</h1>
      <button onClick={() => setJumlah((prev) => prev + 1)}>Tambah</button>
      <p>Jumlah: {jumlah}</p>
    </div>
  );
}
`,
};

export default function PlaygroundPage() {
  const [template, setTemplate] = useState<'vanilla' | 'react'>('vanilla');

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
      <header>
        <Eyebrow>Coret-coret</Eyebrow>
        <h1 className="text-text mt-3 font-sans text-2xl font-semibold tracking-tight md:text-3xl">
          Playground
        </h1>
        <p className="text-muted mt-3 max-w-prose">
          Tempat mencoba potongan kode tanpa menyiapkan project. Semuanya berjalan di browsermu
          sendiri — tidak ada yang dikirim ke mana pun, dan tidak ada yang tersimpan.
        </p>
      </header>

      <div className="mt-6 flex gap-1" role="group" aria-label="Pilih template">
        {(['vanilla', 'react'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTemplate(value)}
            aria-pressed={template === value}
            className={cn(
              'duration-fast rounded-md border px-3 py-1.5 text-xs transition-colors',
              template === value
                ? 'border-border-strong bg-raised text-text font-medium'
                : 'border-border text-muted hover:text-text',
            )}
          >
            {value === 'vanilla' ? 'JavaScript + DOM' : 'React'}
          </button>
        ))}
      </div>

      {/* Remounting on template change resets the editor rather than merging two file sets. */}
      <PlaygroundBlock
        key={template}
        template={template}
        files={template === 'vanilla' ? VANILLA_FILES : REACT_FILES}
        title={template === 'vanilla' ? 'JavaScript + DOM' : 'React'}
      />

      <p className="text-faint mt-6 text-xs">
        Catatan: perubahan di playground tidak tersimpan. Kalau ada yang ingin kamu ingat, salin ke
        catatan sub-bab terkait.
      </p>
    </div>
  );
}
