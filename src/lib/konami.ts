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

/**
 * Возвращает обработчик нажатий: скармливай ему e.key, на полном совпадении
 * последовательности вызовется onMatch (и детектор начнёт сначала —
 * код можно вводить сколько угодно раз).
 */
export function makeKonamiDetector(onMatch: () => void): (key: string) => void {
  let pos = 0;
  return (key: string) => {
    const k = key.length === 1 ? key.toLowerCase() : key;
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
