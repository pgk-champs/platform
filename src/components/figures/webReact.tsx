import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «React»: во что превращается JSX, куда текут данные
 * и чем перерисовка библиотекой отличается от ручной. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webReactSchemes: Schemes = {
  'wr-jsx-compile': (aria) => (
    <Panel id="fig-wr-jsx" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>JSX — НЕ ЯЗЫК РАЗМЕТКИ, А ЗАПИСЬ ВЫЗОВОВ</text>

      <rect x={30} y={66} width={340} height={130} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11} fill="#fff">пишем</text>
      <text x={48} y={120} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'<b>{amount} ETH</b>'}</text>
      <text x={48} y={148} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'<button onClick={f}'}</text>
      <text x={48} y={168} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'        disabled={n === 0}>ok'}</text>
      <text x={48} y={188} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{'</button>'}</text>

      <Arrow x1={382} y1={130} x2={438} y2={130} color={ACCENT} w={2.5} />
      <text x={410} y={120} textAnchor="middle" fontSize={9.5} fontFamily={MONO} fill={FADE}>сборка</text>

      <rect x={452} y={66} width={338} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={92} fontSize={11} fill="#fff">получается</text>
      <text x={470} y={120} fontSize={10} fontFamily={MONO} fill={ACCENT}>{'_jsxs("b", {'}</text>
      <text x={470} y={140} fontSize={10} fontFamily={MONO} fill={ACCENT}>{'  children: [amount, " ETH"] })'}</text>
      <text x={470} y={164} fontSize={10} fontFamily={MONO} fill={ACCENT}>{'_jsx("button", {'}</text>
      <text x={470} y={184} fontSize={10} fontFamily={MONO} fill={ACCENT}>{'  onClick: f, disabled: n === 0 })'}</text>

      <text x={30} y={238} fontSize={12.5} fill="#fff">в браузер уезжают обычные вызовы функций: никакой разметки в готовом коде нет</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>отсюда и правила записи: className вместо class, фигурные скобки для любого значения из кода</text>
      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>результат вызова — обычный объект-описание, а не элемент страницы</text>
    </Panel>
  ),

  'wr-props-flow': (aria) => (
    <Panel id="fig-wr-props" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДАННЫЕ ВНИЗ, СОБЫТИЯ ВВЕРХ</text>

      <rect x={310} y={62} width={200} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={89} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>Vault</text>

      {[{ x: 130, t: 'Balance' }, { x: 330, t: 'DepositForm' }, { x: 530, t: 'OpsList' }].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={158} width={160} height={44} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.2} />
          <text x={c.x + 80} y={185} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{c.t}</text>
          <Arrow x1={c.x + 62} y1={110} x2={c.x + 62} y2={152} color={ACCENT} w={2} />
          <Arrow x1={c.x + 98} y1={152} x2={c.x + 98} y2={110} color={RED} w={2} />
        </g>
      ))}

      <text x={30} y={130} fontSize={11} fill={ACCENT}>свойства</text>
      <text x={30} y={148} fontSize={11} fill={RED_TEXT}>обработчики</text>

      <text x={30} y={238} fontSize={12.5} fill="#fff">потомок получает данные свойствами и не может их менять — только позвать функцию, которую ему дали</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>поэтому по нарисованному интерфейсу всегда видно, откуда взялось каждое число</text>
    </Panel>
  ),

  'wr-react-vs-manual': (aria) => (
    <Panel id="fig-wr-cmp" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СПИСОК 200 СТРОК, ИЗМЕНИЛОСЬ ОДНО ЧИСЛО</text>

      <rect x={30} y={66} width={370} height={160} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">руками, через innerHTML</text>
      <text x={50} y={120} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>33.27 мс</text>
      <text x={50} y={146} fontSize={11} fill={RED_TEXT}>все узлы созданы заново</text>
      <text x={50} y={170} fontSize={11} fill={RED_TEXT}>фокус потерян, текст в поле стёрт</text>
      <text x={50} y={194} fontSize={11} fill={RED_TEXT}>подсветка из кода исчезла</text>
      <text x={50} y={216} fontSize={10.5} fill={FADE}>зато никаких зависимостей</text>

      <rect x={420} y={66} width={370} height={160} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">React</text>
      <text x={440} y={120} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>2.10 мс (медиана)</text>
      <text x={440} y={146} fontSize={11} fill={ACCENT}>узлы li, b и input — те же самые</text>
      <text x={440} y={170} fontSize={11} fill={ACCENT}>фокус на месте, текст «моя заметка» цел</text>
      <text x={440} y={194} fontSize={11} fill={FADE}>функции строк вызваны заново: 200 из 200</text>
      <text x={440} y={216} fontSize={10.5} fill={FADE}>но страница изменена в одном месте</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">«перерисовка» в React — это пересчёт описания, а не пересоздание страницы</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>библиотека сравнивает новое описание со старым и трогает только то, что действительно изменилось</text>
    </Panel>
  ),
};
