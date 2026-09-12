import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Хэдер и TabBar»: каркас против компонента библиотеки,
 * слоты шапки и владение выбранной вкладкой. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitBarsSchemes: Schemes = {
  'kbr-scaffold-vs-kit': (aria) => (
    <Panel id="fig-kbr-sc" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАРКАС ЭКРАНА И КОМПОНЕНТ БИБЛИОТЕКИ — РАЗНЫЕ ВЕЩИ</text>

      <rect x={30} y={64} width={230} height={190} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={145} y={88} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={FADE}>Scaffold</text>
      <rect x={46} y={100} width={198} height={30} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={145} y={120} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={ACCENT}>topBar = { '{ KitHeader(…) }' }</text>
      <rect x={46} y={138} width={198} height={52} rx={7} fill="rgba(255,255,255,0.06)" />
      <text x={145} y={168} textAnchor="middle" fontSize={10.5} fill={FADE}>содержимое экрана</text>
      <rect x={46} y={198} width={198} height={30} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={145} y={218} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={ACCENT}>bottomBar = { '{ KitTabBar(…) }' }</text>

      <text x={296} y={96} fontSize={12} fontWeight={700} fill="#fff">Scaffold — каркас</text>
      <text x={296} y={120} fontSize={11} fill={FADE}>раскладывает четыре слота и считает</text>
      <text x={296} y={138} fontSize={11} fill={FADE}>отступы, чтобы содержимое не уехало</text>
      <text x={296} y={156} fontSize={11} fill={FADE}>под шапку и под панель</text>

      <text x={296} y={192} fontSize={12} fontWeight={700} fill={ACCENT}>KitHeader и KitTabBar — компоненты</text>
      <text x={296} y={216} fontSize={11} fill={FADE}>ваши, переиспользуемые, с одинаковым видом</text>
      <text x={296} y={234} fontSize={11} fill={FADE}>на всех экранах — это и есть пункт критериев</text>

      <text x={30} y={282} fontSize={12.5} fill="#fff">каркас берут готовый, компоненты пишут свои и вставляют в его слоты</text>
    </Panel>
  ),

  'kbr-header-slots': (aria) => (
    <Panel id="fig-kbr-hs" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ШАПКА — ЭТО ТРИ МЕСТА, А НЕ ОДНА СТРОКА</text>

      <rect x={30} y={64} width={760} height={54} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <rect x={44} y={76} width={70} height={30} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={79} y={96} textAnchor="middle" fontSize={9.5} fontFamily={MONO} fill={ACCENT}>navigation</text>
      <text x={300} y={97} textAnchor="middle" fontSize={12} fill="#fff">Каталог</text>
      <rect x={640} y={76} width={136} height={30} rx={7} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
      <text x={708} y={96} textAnchor="middle" fontSize={9.5} fontFamily={MONO} fill={ACCENT}>actions</text>

      {[
        { y: 142, k: 'navigation', v: 'назад, закрыть, меню — то, что уводит с экрана' },
        { y: 172, k: 'title', v: 'куда человек попал; на главной может отсутствовать' },
        { y: 202, k: 'actions', v: 'действия над содержимым: поиск, фильтр, корзина' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.k}</text>
          <text x={180} y={r.y} fontSize={12} fill={FADE}>{r.v}</text>
        </g>
      ))}

      <text x={30} y={248} fontSize={12.5} fill="#fff">параметр centered меняет только положение заголовка — это два разных вида шапки в Material</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>слоты необязательные: на главной нет «назад», на экране без действий пуст правый край</text>
    </Panel>
  ),

  'kbr-tab-state': (aria) => (
    <Panel id="fig-kbr-tab" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПАНЕЛЬ НЕ ПОМНИТ, ЧТО ВЫБРАНО</text>

      <rect x={30} y={64} width={370} height={130} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Помнит сама</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>var selected by remember { '{ … }' }</text>
      <text x={50} y={146} fontSize={11} fill={FADE}>вернулись на экран — вкладка сбросилась</text>
      <text x={50} y={166} fontSize={11} fill={FADE}>перешли по ссылке извне — панель не знает</text>
      <text x={50} y={186} fontSize={11} fill={FADE}>навигация и панель разошлись</text>

      <rect x={420} y={64} width={370} height={130} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Получает снаружи</text>
      <text x={440} y={120} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>selectedId: String</text>
      <text x={440} y={142} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>onSelect: (String) -&gt; Unit</text>
      <text x={440} y={168} fontSize={11} fill={FADE}>источник истины один — текущий маршрут</text>
      <text x={440} y={188} fontSize={11} fill={FADE}>панель всегда согласована с экраном</text>

      <text x={30} y={234} fontSize={12.5} fill="#fff">то же правило, что у поля ввода: компонент показывает и сообщает, а помнит вызывающий</text>
      <text x={30} y={260} fontSize={12.5} fill={FADE}>выбранную вкладку вычисляют из текущего маршрута навигации, а не хранят отдельно</text>
      <text x={30} y={284} fontSize={12.5} fill={ACCENT}>два источника истины всегда расходятся — вопрос только в том, когда это заметят</text>
    </Panel>
  ),
};
