import { slugify, nextNumber, template, checkPage } from '../lib/pageDraft';

test('заголовок превращается в адрес латиницей', () => {
  expect(slugify('Корзина и заказ')).toBe('korzina-i-zakaz');
  expect(slugify('Поиск ошибок: читать след')).toBe('poisk-oshibok-chitat-sled');
  expect(slugify('  Ёлка  ')).toBe('elka');
  expect(slugify('C# и .NET')).toBe('c-i-net');
  expect(slugify('!!!')).toBe('');
});

test('номер берётся следующим за наибольшим в треке', () => {
  const files = [
    'docs/mobile/00-android-studio.mdx',
    'docs/mobile/07-composition.mdx',
    'docs/mobile/38-shop-cart.mdx',
    'docs/blockchain/09-sol-contracts-oop.mdx',
  ];
  expect(nextNumber(files, 'mobile')).toBe('39');
  expect(nextNumber(files, 'blockchain')).toBe('10');
  // в пустом треке начинаем с нуля
  expect(nextNumber(files, 'newtrack')).toBe('00');
});

test('заготовка простой страницы проходит проверку', () => {
  const t = template({ kind: 'page', title: 'Памятка', slug: 'pamyatka', track: 'advanced', num: '09', audience: 'все' });
  expect(t).toContain("kind: 'page'");
  expect(t).toContain('# Памятка');
  expect(checkPage(t, 'page')).toEqual([]);
});

test('заготовка главы проходит проверку, кроме схем', () => {
  const t = template({ kind: 'chapter', title: 'Новая глава', slug: 'novaya-glava', track: 'mobile', num: '39', audience: 'мобилка' });
  expect(t).toContain('<ChapterCover chapterId="novaya-glava"');
  expect(t).toContain('<ChapterExam');
  // схем в заготовке нет — автор добавляет их сам, и проверка об этом говорит
  expect(checkPage(t, 'chapter')).toEqual(['Схем должно быть от 2 до 5, сейчас 0']);
});

test('проверка ловит то же, что и гейты сборки', () => {
  expect(checkPage('просто текст', 'page')).toContain('Нет шапки со свойствами (--- в начале файла)');

  const badHint = `---
title: 'X'
audience: 'все'
level: 'база'
order: 1
---

<Hint type="warning">нет такого типа</Hint>
`;
  expect(checkPage(badHint, 'page')).toContain('Подсказка с типом «warning» — бывают только tip, important, fact');

  const noExam = `---
title: 'X'
audience: 'все'
level: 'база'
order: 1
---

<Figure scheme="a" /><Figure scheme="b" />
<ChapterCover chapterId="x" />
`;
  expect(checkPage(noExam, 'chapter')).toContain('У главы должен быть экзамен (<ChapterExam>)');
});

test('у простой страницы канон не требуется', () => {
  const page = `---
title: 'X'
audience: 'все'
level: 'база'
order: 1
kind: 'page'
---

# X

Текст без экзамена, схем и обложки.
`;
  expect(checkPage(page, 'page')).toEqual([]);
});
