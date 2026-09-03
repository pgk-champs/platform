// Инициализация кабинета при загрузке любой страницы:
// 1) если вернулись с сервера с токеном в адресе — забираем его;
// 2) если вошли — один раз синхронизируем прогресс с аккаунтом;
// 3) включаем автосинхронизацию после изменений.
import { captureTokenFromUrl, isLoggedIn, startAutoSync, sync } from '../lib/account';

export function onRouteDidUpdate(): void {
  // captureToken на каждый переход дёшево и ловит возврат с сервера,
  // на какую бы страницу он ни вернул.
  if (captureTokenFromUrl()) void sync();
}

if (typeof window !== 'undefined') {
  const captured = captureTokenFromUrl();
  if (captured || isLoggedIn()) void sync();
  startAutoSync();
}
