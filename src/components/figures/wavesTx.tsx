import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Транзакции Waves»: типы по номерам, путь от объекта
 * до блока и разбор отказа узла. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesTxSchemes: Schemes = {
  'wtx-types': (aria) => (
    <Panel id="fig-wtx-types" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>У КАЖДОГО ДЕЙСТВИЯ СВОЙ НОМЕР ТИПА</text>

      {[
        { x: 30, n: '3', t: 'Issue', d: 'выпустить токен', f: '1 WAVES' },
        { x: 230, n: '4', t: 'Transfer', d: 'перевести', f: '0,001' },
        { x: 430, n: '12', t: 'Data', d: 'записать в состояние', f: '0,001' },
        { x: 630, n: '16', t: 'InvokeScript', d: 'вызвать dApp', f: '0,005' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={112} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <circle cx={c.x + 30} cy={94} r={16} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={c.x + 30} y={100} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{c.n}</text>
          <text x={c.x + 56} y={100} fontSize={12} fontFamily={MONO} fill={ACCENT}>{c.t}</text>
          <text x={c.x + 16} y={134} fontSize={11} fill={FADE}>{c.d}</text>
          <text x={c.x + 16} y={162} fontSize={11.5} fontFamily={MONO} fill="#fff">{c.f}</text>
        </g>
      ))}

      <text x={30} y={216} fontSize={12.5} fill="#fff">тип задаёт и смысл, и цену: выпуск токена стоит в тысячу раз дороже перевода</text>
      <text x={30} y={240} fontSize={12.5} fill={FADE}>комиссия фиксированная — не аукцион, как в Ethereum, а число из таблицы</text>
      <text x={30} y={268} fontSize={12.5} fill={ACCENT}>всего типов около двадцати; в работе постоянно нужны эти четыре</text>
      <text x={30} y={292} fontSize={12.5} fill={FADE}>тип виден прямо в объекте транзакции, полем type — и в ответе узла тоже</text>
    </Panel>
  ),

  'wtx-flow': (aria) => (
    <Panel id="fig-wtx-flow" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТ ОБЪЕКТА ДО БЛОКА — ЧЕТЫРЕ ШАГА</text>

      {[
        { y: 66, n: '1', t: 'собрать', c: 'transfer({ amount, recipient })', d: 'обычный объект в памяти' },
        { y: 118, n: '2', t: 'подписать', c: 'вторым аргументом — сид', d: 'появляются id и proofs' },
        { y: 170, n: '3', t: 'отправить', c: 'POST /transactions/broadcast', d: 'узел проверяет и отвечает 200' },
        { y: 222, n: '4', t: 'дождаться', c: 'GET /transactions/info/<id>', d: 'пока не 200 — в блок не попала' },
      ].map((r) => (
        <g key={r.y}>
          <circle cx={50} cy={r.y + 18} r={15} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={50} y={r.y + 23} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{r.n}</text>
          <text x={80} y={r.y + 14} fontSize={12.5} fontWeight={700} fill="#fff">{r.t}</text>
          <text x={80} y={r.y + 32} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.c}</text>
          <text x={430} y={r.y + 24} fontSize={11.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={292} fontSize={12.5} fill="#fff">ответ 200 на отправку значит «принято в очередь», а не «записано»: ждать надо шаг 4</text>
    </Panel>
  ),

  'wtx-error': (aria) => (
    <Panel id="fig-wtx-err" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТКАЗ УЗЛА ЧИТАЕТСЯ ПО ТРЁМ ПОЛЯМ</text>

      <rect x={30} y={62} width={760} height={128} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={90} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>{'{'} "error": 112,</text>
      <text x={50} y={116} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>  "message": "State check failed. Reason: Fee for TransferTransaction</text>
      <text x={50} y={138} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>   (1000 in WAVES) does not exceed minimal value of 100000 WAVES.",</text>
      <text x={50} y={164} fontSize={11.5} fontFamily={MONO} fill={FADE}>  "transaction": {'{'} …целиком то, что вы отправили… {'}'} {'}'}</text>

      {[
        { y: 222, k: 'error', v: 'код: 112 — не прошла проверка состояния, 306 — упал скрипт dApp' },
        { y: 246, k: 'message', v: 'человеческая причина; в ней обычно есть и число, которого не хватило' },
        { y: 270, k: 'transaction', v: 'ваш же объект — удобно сверить, что ушло не то, что думали' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.k}</text>
          <text x={150} y={r.y} fontSize={12} fill={FADE}>{r.v}</text>
        </g>
      ))}
    </Panel>
  ),
};
