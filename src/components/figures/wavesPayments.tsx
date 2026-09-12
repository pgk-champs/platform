import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Платежи в dApp»: что приложено к вызову, движение денег
 * через счёт приложения и обязательные проверки. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesPaymentsSchemes: Schemes = {
  'wpm-payments': (aria) => (
    <Panel id="fig-wpm-pay" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДЕНЬГИ ПРИКЛАДЫВАЮТ К ВЫЗОВУ, А НЕ ПЕРЕВОДЯТ ОТДЕЛЬНО</text>

      <rect x={30} y={66} width={330} height={140} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={94} fontSize={12} fontWeight={700} fill="#fff">Транзакция вызова</text>
      <text x={50} y={122} fontSize={10.5} fontFamily={MONO} fill={FADE}>dApp: 3MPa7P5SDzhdqE3gh1nAbRyc…</text>
      <text x={50} y={144} fontSize={10.5} fontFamily={MONO} fill={FADE}>call: {'{'} function: "polozhit" {'}'}</text>
      <text x={50} y={168} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>payment: [{'{'} amount: 300000000,</text>
      <text x={50} y={188} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>           assetId: null {'}'}]</text>

      <Arrow x1={374} y1={136} x2={430} y2={136} color={ACCENT} w={2.4} />

      <rect x={444} y={66} width={346} height={140} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={464} y={94} fontSize={12} fontWeight={700} fill="#fff">Внутри функции</text>
      <text x={464} y={124} fontSize={11} fontFamily={MONO} fill={ACCENT}>i.payments[0].amount</text>
      <text x={464} y={146} fontSize={11} fontFamily={MONO} fill={ACCENT}>i.payments[0].assetId</text>
      <text x={464} y={174} fontSize={11} fill={FADE}>assetId равен unit, если это WAVES</text>
      <text x={464} y={194} fontSize={11} fill={FADE}>до двух платежей в одном вызове</text>

      <text x={30} y={248} fontSize={12.5} fill="#fff">деньги уже на счёте приложения к моменту, когда функция начала считать</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>отдельного перевода не нужно — и отдельной транзакции, которую можно забыть, тоже</text>
    </Panel>
  ),

  'wpm-bank-flow': (aria) => (
    <Panel id="fig-wpm-flow" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛОЖИТЬ И ЗАБРАТЬ — ЖИВОЙ ПРОГОН</text>

      <rect x={30} y={64} width={760} height={90} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={90} fontSize={12} fontWeight={700} fill="#fff">polozhit() с платежом 3 WAVES</text>
      <text x={50} y={116} fontSize={11} fontFamily={MONO} fill={ACCENT}>IntegerEntry("vklad_3M57BFmz…", 300000000)</text>
      <text x={50} y={140} fontSize={11} fill={FADE}>баланс банка стал 2 299 900 000 — деньги физически на его счёте</text>

      <rect x={30} y={168} width={760} height={102} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={194} fontSize={12} fontWeight={700} fill="#fff">zabrat(100000000)</text>
      <text x={50} y={220} fontSize={11} fontFamily={MONO} fill={ACCENT}>IntegerEntry("vklad_3M57BFmz…", 200000000)</text>
      <text x={50} y={242} fontSize={11} fontFamily={MONO} fill={ACCENT}>ScriptTransfer(3M57BFmz…, 100000000, null)</text>
      <text x={50} y={264} fontSize={11} fill={FADE}>запись и перевод — два действия одного списка, применяются вместе</text>

      <text x={30} y={294} fontSize={12.5} fill="#fff">учёт в состоянии и деньги на счёте — разные вещи: расходятся при первой же ошибке в коде</text>
    </Panel>
  ),

  'wpm-checks': (aria) => (
    <Panel id="fig-wpm-ch" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ ПРОВЕРКИ, БЕЗ КОТОРЫХ ПРИЛОЖЕНИЕ ТЕРЯЕТ ДЕНЬГИ</text>

      {[
        { y: 64, k: 'платёж вообще есть?', c: 'i.payments.size() > 0', n: 'иначе обращение к [0] уронит скрипт' },
        { y: 112, k: 'та ли монета?', c: 'pay.assetId == unit', n: 'иначе за токен запишут вклад в WAVES' },
        { y: 160, k: 'сумма разумна?', c: 'pay.amount > 0', n: 'ноль и отрицательные отсекает сеть, но не логику' },
        { y: 208, k: 'хватает на счёте?', c: 'skolko > est', n: 'иначе выдадут чужие деньги' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 18} fontSize={12} fill="#fff">{r.k}</text>
          <rect x={240} y={r.y} width={230} height={32} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={256} y={r.y + 21} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.c}</text>
          <text x={492} y={r.y + 21} fontSize={11} fill={FADE}>{r.n}</text>
        </g>
      ))}

      <text x={30} y={268} fontSize={12.5} fill={RED_TEXT}>пропущенная проверка монеты — самая частая: токен приложили, вклад записали в WAVES</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>сеть проверяет только балансы; смысл операции проверяет ваш код и больше никто</text>
    </Panel>
  ),
};
