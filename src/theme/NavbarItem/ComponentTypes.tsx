import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import AccountNav from '@site/src/components/AccountNav';

// Штатная точка расширения навбара: свои типы пунктов добавляются сюда, и
// дальше в docusaurus.config.ts пишется {type: 'custom-account'}. Нужен именно
// компонент, а не ссылка: содержимое зависит от того, кто вошёл, а это видно
// только в браузере.
export default {
  ...ComponentTypes,
  'custom-account': AccountNav,
};
