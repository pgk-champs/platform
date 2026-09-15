/** Русское склонение по числу: 1 глава, 2 главы, 5 глав.
 *  Нужно там, где число берётся из данных и растёт — на первом экране счётчик
 *  глав был вписан руками («22») и дожил до 137. */
export function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
