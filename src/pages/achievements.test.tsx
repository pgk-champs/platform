import { readFileSync } from 'fs';

test('рамка «выдано» не съедается правилом редкости', () => {
  // Правила .ach-card-rare / -epic задают border ШОРТКАТОМ и лежат ниже в
  // файле, поэтому перебивали border-color состояния «выдано»: у 17 редких и
  // 10 эпических из 43 рамка не появлялась никогда. Лечится специфичностью,
  // и это надо стеречь — оба правила легко разъедутся снова.
  const css = readFileSync('src/components/trainers.css', 'utf8');
  const on = /\.ach-card\.ach-card-on\s*\{/.test(css);
  expect(on).toBe(true);
  // и одноклассового варианта, который проигрывал, больше нет
  expect(/^\.ach-card-on\s*\{/m.test(css)).toBe(false);
});
