import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Списки»: Column строит все элементы, LazyColumn — только
 * видимые с запасом; из чего собран DSL списка; что ломается без key
 * при удалении элемента. */

export const lazyListsSchemes: Schemes = {
  /* один и тот же список данных, две стратегии построения */
  'll-eager-vs-lazy': (aria) => (
    <Panel id="fig-ll-eager" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДЕСЯТЬ ТЫСЯЧ ТОВАРОВ, ДВА СПОСОБА</text>

      <text x={30} y={74} fontSize={12.5} fontFamily={MONO} fill="#fff">Column — строит всё сразу</text>
      <rect x={30} y={86} width={760} height={72} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      {Array.from({ length: 38 }, (_, i) => 40 + i * 19.6).map((x) => (
        <rect key={x} x={x} y={100} width={15} height={44} rx={4} fill={INK} />
      ))}
      <text x={410} y={177} textAnchor="middle" fontSize={12} fill={FADE}>все 10 000 объектов созданы до первого кадра</text>

      <text x={30} y={216} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>LazyColumn — строит видимое</text>
      <rect x={30} y={228} width={760} height={72} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={36} y={234} width={190} height={60} rx={8} fill="rgba(0,0,0,0.35)" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
      {[44, 63, 82, 101, 120, 139, 158, 177, 196].map((x) => (
        <rect key={x} x={x} y={242} width={15} height={44} rx={4} fill={ACCENT} />
      ))}
      <text x={131} y={310} textAnchor="middle" fontSize={11.5} fill={ACCENT}>экран</text>
      <text x={250} y={266} fontSize={12} fill={FADE}>остальные 9 990 ещё не существуют — появятся при прокрутке</text>

      <text x={30} y={332} fontSize={12.5} fill="#fff">разница не в скорости отрисовки, а в том, сколько объектов вообще создано</text>
    </Panel>
  ),

  /* item и items — не обычные вызовы, а регистрация в области списка */
  'll-dsl-scope': (aria) => (
    <Panel id="fig-ll-dsl" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВНУТРИ ФИГУРНЫХ СКОБОК — НЕ ОБЫЧНЫЙ КОД</text>

      <rect x={30} y={64} width={760} height={150} rx={14} fill="rgba(0,0,0,0.28)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13.5} fontFamily={MONO} fill={ACCENT}>LazyColumn &#123;</text>
      <text x={640} y={94} fontSize={11.5} fill={FADE}>область списка</text>

      <rect x={72} y={108} width={330} height={38} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={92} y={132} fontSize={12.5} fontFamily={MONO} fill="#fff">item &#123; Header() &#125;</text>
      <Arrow x1={410} y1={127} x2={470} y2={127} color={FADE} w={3} />
      <text x={482} y={132} fontSize={12} fill={FADE}>регистрирует 1 элемент</text>

      <rect x={72} y={156} width={330} height={38} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={92} y={180} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>items(products) &#123; ... &#125;</text>
      <Arrow x1={410} y1={175} x2={470} y2={175} color={ACCENT} w={3} />
      <text x={482} y={180} fontSize={12} fill={ACCENT}>регистрирует N элементов</text>

      <text x={52} y={244} fontSize={12.5} fill="#fff">это описание того, что в списке есть — рисуется потом и только видимое</text>
      <text x={52} y={272} fontSize={12.5} fill={FADE}>поэтому обычный for внутри работать не будет: он ничего не регистрирует</text>
    </Panel>
  ),

  /* без key состояние привязано к позиции и съезжает при удалении */
  'll-key-shift': (aria) => (
    <Panel id="fig-ll-key" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>УДАЛИЛИ ПЕРВЫЙ — ЧТО СТАЛО С ОТМЕТКОЙ</text>

      <text x={30} y={72} fontSize={12} fill={FADE}>было</text>
      {[{ y: 84, t: 'молоко' }, { y: 122, t: 'хлеб' }, { y: 160, t: 'сыр', on: true }].map((r, i) => (
        <g key={r.t}>
          <rect x={30} y={r.y} width={230} height={30} rx={8} fill={r.on ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.on ? ACCENT : INK} strokeWidth={2} />
          <text x={44} y={r.y + 20} fontSize={12} fill="#fff">{`${i} · ${r.t}`}</text>
          {r.on && <text x={214} y={r.y + 20} fontSize={12} fill={ACCENT}>✓</text>}
        </g>
      ))}

      <Arrow x1={280} y1={130} x2={330} y2={130} color={INK} w={4} />
      <text x={305} y={118} textAnchor="middle" fontSize={11} fill={FADE}>удалили 0</text>

      <text x={350} y={72} fontSize={12} fill={FADE}>без key — отметка осталась на позиции</text>
      {[{ y: 84, t: 'хлеб' }, { y: 122, t: 'сыр' }].map((r, i) => (
        <g key={r.t}>
          <rect x={350} y={r.y} width={200} height={30} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={364} y={r.y + 20} fontSize={12} fill="#fff">{`${i} · ${r.t}`}</text>
        </g>
      ))}
      <rect x={350} y={160} width={200} height={30} rx={8} fill="rgba(0,0,0,0.18)" stroke={FADE} strokeWidth={2} strokeDasharray="5 4" />
      <text x={364} y={180} fontSize={12} fill={FADE}>2 · пусто, а ✓ была тут</text>

      <text x={588} y={72} fontSize={12} fill={ACCENT}>с key — отметка едет за сыром</text>
      {[{ y: 84, t: 'хлеб', id: 2 }, { y: 122, t: 'сыр', id: 3, on: true }].map((r) => (
        <g key={r.t}>
          <rect x={588} y={r.y} width={202} height={30} rx={8} fill={r.on ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.on ? ACCENT : INK} strokeWidth={2} />
          <text x={602} y={r.y + 20} fontSize={12} fill="#fff">{`id=${r.id} · ${r.t}`}</text>
          {r.on && <text x={764} y={r.y + 20} fontSize={12} fill={ACCENT}>✓</text>}
        </g>
      ))}

      <text x={30} y={232} fontSize={12.5} fill="#fff">без key элемент опознаётся по номеру места, а место при удалении занимает сосед</text>
      <text x={30} y={258} fontSize={12.5} fill={ACCENT}>key = id привязывает состояние к самим данным, а не к позиции в списке</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>то же касается анимации перестановки: без key список «моргает» вместо переезда</text>
    </Panel>
  ),
};
