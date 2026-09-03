import { useEffect, useState } from 'react';
import { store, type OsId } from './store';

// Пока студент не выбрал ОС сам, показываем Windows: это машина почти всей
// аудитории, и она же — честный ответ, когда о платформе ничего не известно
// (сборка на сервере, старый браузер без navigator.platform).
export const OS_FALLBACK: OsId = 'win';

/** Определение ОС по браузеру. Зовётся ТОЛЬКО из useEffect — на сервере navigator нет. */
export function detectOs(): OsId {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const uaData = (nav as { userAgentData?: { platform?: string } } | undefined)?.userAgentData;
  const platform = String(uaData?.platform ?? nav?.platform ?? '').toLowerCase();
  if (!platform) return OS_FALLBACK;
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('linux') || platform.includes('x11')) return 'linux';
  if (platform.includes('win')) return 'win';
  return OS_FALLBACK;
}

/**
 * ОС для показа сочетаний клавиш. Читаем из store только после монтирования:
 * store на клиенте поднимает localStorage ещё при импорте, и чтение прямо в
 * рендере разошлось бы с серверной разметкой (hydration mismatch). Заодно —
 * одноразовое автоопределение платформы, чтобы Windows-студент не видел ⌘.
 */
export function useResolvedOs(): OsId {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (!store.prefs.getOs()) store.prefs.setOs(detectOs());
  }, []);
  return (mounted ? store.prefs.getOs() : undefined) ?? OS_FALLBACK;
}
