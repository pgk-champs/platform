import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Redux»: протаскивание через уровни против чтения на месте,
 * круг «действие → обработчик → состояние» и неизменяемость. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webReduxSchemes: Schemes = {
  'wrx-prop-drilling': (aria) => (
    <Panel id="fig-wrx-drill" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО ЗНАЧЕНИЕ ИЗМЕНИЛОСЬ: СКОЛЬКО ФУНКЦИЙ ВЫЗВАНО ЗАНОВО</text>

      <text x={30} y={68} fontSize={11.5} fill={RED_TEXT}>значение идёт свойствами через пять уровней</text>
      {['App', 'Sidebar', 'L1', 'L2', 'L3', 'L4', 'L5'].map((n, i) => (
        <g key={n}>
          <rect x={30 + i * 100} y={82} width={88} height={32} rx={8} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={1.8} />
          <text x={74 + i * 100} y={103} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{n}</text>
        </g>
      ))}
      <text x={30} y={136} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>всего вызовов: 7 — включая меню, которому это значение не нужно вовсе</text>

      <text x={30} y={182} fontSize={11.5} fill={ACCENT}>значение берут из хранилища там, где оно нужно</text>
      {['App', 'Sidebar', 'L1', 'L2', 'L3', 'L4', 'L5'].map((n, i) => (
        <g key={n}>
          <rect x={30 + i * 100} y={196} width={88} height={32} rx={8}
            fill={i === 6 ? SOFT : 'rgba(0,0,0,0.2)'} stroke={i === 6 ? ACCENT : INK} strokeWidth={1.8}
            strokeDasharray={i === 6 ? undefined : '4 3'} />
          <text x={74 + i * 100} y={217} textAnchor="middle" fontSize={11} fontFamily={MONO}
            fill={i === 6 ? ACCENT : 'rgba(255,255,255,0.3)'}>{n}</text>
        </g>
      ))}
      <text x={30} y={250} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>всего вызовов: 1 — только тот компонент, который это значение читает</text>

      <text x={30} y={288} fontSize={12.5} fill="#fff">на экране в обоих случаях одно и то же; разница в том, сколько работы ради этого сделано</text>
    </Panel>
  ),

  'wrx-store-flow': (aria) => (
    <Panel id="fig-wrx-flow" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КРУГ, ПО КОТОРОМУ ХОДЯТ ВСЕ ИЗМЕНЕНИЯ</text>

      {[
        { x: 30, t: 'действие', d: 'объект с именем', m: '{ type: "vault/setAmount",' , m2: '  payload: "7" }' },
        { x: 228, t: 'обработчик', d: 'обычная функция', m: '(состояние, действие)', m2: '→ новое состояние' },
        { x: 426, t: 'хранилище', d: 'держит текущее', m: 'getState()', m2: 'dispatch()' },
        { x: 624, t: 'подписчики', d: 'узнают об изменении', m: 'subscribe()', m2: 'перерисовка' },
      ].map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={70} width={166} height={116} rx={11} fill={i === 1 ? SOFT : 'rgba(0,0,0,0.28)'} stroke={i === 1 ? ACCENT : INK} strokeWidth={2.2} />
          <text x={b.x + 16} y={96} fontSize={12} fill="#fff">{b.t}</text>
          <text x={b.x + 16} y={118} fontSize={10.5} fill={FADE}>{b.d}</text>
          <text x={b.x + 16} y={146} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>{b.m}</text>
          <text x={b.x + 16} y={164} fontSize={9.5} fontFamily={MONO} fill={ACCENT}>{b.m2}</text>
          {i < 3 && <Arrow x1={b.x + 174} y1={128} x2={b.x + 192} y2={128} color={ACCENT} w={2} />}
        </g>
      ))}

      <text x={30} y={234} fontSize={12.5} fill="#fff">состояние меняется только так: другого пути внутрь хранилища нет</text>
      <text x={30} y={258} fontSize={12.5} fill={FADE}>поэтому по списку отправленных действий видно всю историю того, что происходило в приложении</text>
      <text x={30} y={282} fontSize={12.5} fill={ACCENT}>React в этой схеме не участвует: хранилище работает и без него</text>
    </Panel>
  ),

  'wrx-immutable': (aria) => (
    <Panel id="fig-wrx-imm" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>В ОБРАБОТЧИКЕ НАПИСАНО ops.push — А СТАРОЕ СОСТОЯНИЕ ЦЕЛО</text>

      <rect x={30} y={66} width={360} height={128} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">состояние до трёх действий</text>
      <text x={48} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>{'{ amount: "0", ops: [], busy: false }'}</text>
      <text x={48} y={150} fontSize={11} fill={ACCENT}>после всех действий — ровно такое же</text>
      <text x={48} y={174} fontSize={11} fill={FADE}>объект не тронут, массив пуст</text>

      <rect x={420} y={66} width={370} height={128} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={438} y={92} fontSize={11.5} fill="#fff">состояние после</text>
      <text x={438} y={120} fontSize={10} fontFamily={MONO} fill={ACCENT}>{'{ amount: "2.5", ops: [{…}], busy: true }'}</text>
      <text x={438} y={150} fontSize={11} fontFamily={MONO} fill={ACCENT}>это тот же объект? false</text>
      <text x={438} y={174} fontSize={11} fontFamily={MONO} fill={ACCENT}>тот же массив ops? false</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">запись «изменяем на месте» — обман зрения: библиотека отдаёт черновик и собирает из него новый объект</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>благодаря этому сравнение по ссылке работает — и React видит, что изменилось, не сверяя поля</text>
    </Panel>
  ),
};
