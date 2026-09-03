// Детектор конами-кода: ↑↑↓↓←→←→BA. Чистая функция без DOM, чтобы её можно
// было тестировать; подключение к keydown живёт в clientModules/konami.ts.

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

// У первокурсников раскладка по умолчанию русская, и физические B и A дают
// e.key «и» и «ф» — код в ЙЦУКЕН был невводим вовсе. Поэтому нажатие
// приводим к «b»/«a» тремя путями: латиница как есть, кириллица с тех же
// клавиш и код клавиши (e.code: KeyB/KeyA) — детектору можно скармливать и
// e.key, и e.code. Стрелки в e.key и e.code называются одинаково.
const KEY_ALIASES: Record<string, string> = {
  KeyB: 'b',
  KeyA: 'a',
  и: 'b',
  ф: 'a',
};

/**
 * Возвращает обработчик нажатий: скармливай ему e.key (или e.code), на полном
 * совпадении последовательности вызовется onMatch (и детектор начнёт сначала —
 * код можно вводить сколько угодно раз).
 */
export function makeKonamiDetector(onMatch: () => void): (key: string) => void {
  let pos = 0;
  return (key: string) => {
    const low = key.length === 1 ? key.toLowerCase() : key;
    const k = KEY_ALIASES[low] ?? low;
    if (k === KONAMI_SEQUENCE[pos]) {
      pos += 1;
      if (pos === KONAMI_SEQUENCE.length) {
        pos = 0;
        onMatch();
      }
    } else if (k === KONAMI_SEQUENCE[0]) {
      // Сбой, но нажат ↑ — начало новой попытки. Единственный повторяющийся
      // префикс кода — ↑↑: после ↑↑↑ последние два нажатия всё ещё валидны.
      pos = pos === 2 ? 2 : 1;
    } else {
      pos = 0;
    }
  };
}
