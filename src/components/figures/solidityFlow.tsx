import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Условия, циклы и время»: границы фаз, рост газа в цикле
 * и поиск в массиве против отображения. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityFlowSchemes: Schemes = {
  'sf-phase-boundary': (aria) => (
    <Panel id="fig-sf-phase" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ФАЗА МЕНЯЕТСЯ НЕ НА 300-Й СЕКУНДЕ, А НА 301-Й</text>

      <rect x={30} y={72} width={250} height={54} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={155} y={96} textAnchor="middle" fontSize={12} fill="#fff">seed · 0…300 с</text>
      <text x={155} y={116} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>цена 0 — покупать нельзя</text>

      <rect x={290} y={72} width={250} height={54} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={415} y={96} textAnchor="middle" fontSize={12} fill="#fff">private · 301…900 с</text>
      <text x={415} y={116} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>0.00075 ETH</text>

      <rect x={550} y={72} width={240} height={54} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={670} y={96} textAnchor="middle" fontSize={12} fill="#fff">public · с 901 с</text>
      <text x={670} y={116} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>0.001 ETH</text>

      <text x={285} y={148} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={RED_TEXT}>300 → ещё seed</text>
      <text x={545} y={148} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={RED_TEXT}>900 → ещё private</text>

      <rect x={30} y={176} width={760} height={44} rx={9} fill="rgba(255,140,140,0.15)" stroke={RED} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={203} textAnchor="middle" fontSize={11.5} fill={RED_TEXT}>ветки переставлены — и через час цена 0.00075 вместо 0.001: ветка public недостижима, компилятор молчит</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">часы контракта — метка блока: её пишет тот, кто собирает блок</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>два блока подряд без паузы получили метки 1800100000 и 1800100001 — разница в секунду при нулевом реальном времени</text>
    </Panel>
  ),

  'sf-loop-gas': (aria) => (
    <Panel id="fig-sf-loop" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЦИКЛ ПО РАСТУЩЕМУ СПИСКУ УБИВАЕТ ФУНКЦИЮ</text>

      {[
        { y: 68, n: '10 адресов', g: '73 766', w: 40, ok: true },
        { y: 116, n: '100 адресов', g: '300 026', w: 110, ok: true },
        { y: 164, n: '1000 адресов', g: '2 562 626', w: 330, ok: true },
        { y: 212, n: '6 754 адреса', g: 'Transaction ran out of gas', w: 620, ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 22} fontSize={11.5} fill="#fff">{r.n}</text>
          <rect x={170} y={r.y + 6} width={r.w} height={24} rx={6} fill={r.ok ? SOFT : 'rgba(255,140,140,0.2)'} stroke={r.ok ? ACCENT : RED} strokeWidth={2} />
          <text x={180 + r.w} y={r.y + 23} fontSize={11.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.g}</text>
        </g>
      ))}

      <text x={30} y={272} fontSize={12.5} fill="#fff">газ ≈ 48 626 + 2 514 × длина очереди — прямая, а не «немного медленнее»</text>
      <text x={30} y={298} fontSize={12.5} fill={RED_TEXT}>потолок одной транзакции 16 777 216 газа кончается на 6 654 адресах: очередь никто не чистит — функция мертва навсегда</text>
    </Panel>
  ),

  'sf-array-vs-mapping': (aria) => (
    <Panel id="fig-sf-lookup" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ВОПРОС «ЕСТЬ ЛИ АДРЕС?» — ДВА СПОСОБА</text>

      <text x={430} y={62} textAnchor="end" fontSize={11} fill={FADE}>массив с циклом</text>
      <text x={640} y={62} textAnchor="end" fontSize={11} fill={ACCENT}>mapping</text>

      {[
        { y: 74, t: 'адрес первый в списке', a: '26 436', b: '24 065' },
        { y: 120, t: 'адрес последний из 1000', a: '2 538 933', b: '24 077' },
        { y: 166, t: 'адреса нет вовсе', a: '2 539 088', b: '24 077' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={36} rx={9} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 24} fontSize={11.5} fill="#fff">{r.t}</text>
          <text x={430} y={r.y + 24} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>{r.a}</text>
          <text x={640} y={r.y + 24} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.b}</text>
          <text x={772} y={r.y + 24} textAnchor="end" fontSize={11} fill={FADE}>газа</text>
        </g>
      ))}

      <text x={30} y={236} fontSize={12.5} fill="#fff">в худшем случае разница в 105 раз — а ответ обе функции дают одинаковый</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>у массива цена зависит от места адреса в списке, у отображения — не зависит от длины вообще</text>
      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>отображение — для вопроса «есть ли», массив — только чтобы показать список на экране</text>
    </Panel>
  ),
};
