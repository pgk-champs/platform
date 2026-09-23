// Кегль и спокойный режим ставятся ДО отрисовки маленьким скриптом в
// headTags: через Root.tsx (useEffect) атрибут появляется после гидратации, и
// каждая загрузка начиналась бы с перекладки всей страницы.
//
// Скрипт живёт в конфиге строкой, поэтому импортировать хранилище он не
// может: ключ и имена настроек там продублированы. Страж держит дубли
// вместе — разойдутся, и настройка будет молча применяться через раз.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const конфиг = fs.readFileSync('docusaurus.config.ts', 'utf8');
const стор = fs.readFileSync('src/lib/store.ts', 'utf8');

test('предотрисовочный скрипт читает тот же ключ хранилища', () => {
  const ключ = /const STORAGE_KEY = '([^']+)'/.exec(стор)[1];
  assert.match(конфиг, new RegExp(`localStorage\\.getItem\\('${ключ}'`), `ключ разошёлся: ${ключ}`);
});

test('он ставит те же атрибуты, что и Root после гидратации', () => {
  const root = fs.readFileSync('src/theme/Root.tsx', 'utf8');
  for (const attr of ['read', 'motion']) {
    assert.match(root, new RegExp(`dataset\\.${attr}`), `Root не ставит ${attr}`);
    assert.match(конфиг, new RegExp(`dataset\\.${attr}`), `предотрисовка не ставит ${attr}`);
  }
});

test('значения кегля из скрипта существуют в CSS', () => {
  const css = fs.readFileSync('src/css/custom.css', 'utf8');
  for (const v of ['l', 'xl']) {
    assert.match(css, new RegExp(`html\\[data-read='${v}'\\]`), `нет правила для кегля ${v}`);
  }
  assert.match(css, /html\[data-motion='calm'\]/);
});
