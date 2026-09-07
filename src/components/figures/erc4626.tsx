import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ERC4626»: цена доли растёт от дохода, атака на первого
 * вкладчика и округление в пользу хранилища. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const erc4626Schemes: Schemes = {
  'ev-share-price': (aria) => (
    <Panel id="fig-ev-price" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ВКЛАД, РАЗНАЯ ПРИБЫЛЬ</text>

      {[
        { x: 30, who: 'anna', price: '1.000000', shares: '1000.000000', out: '1592.028986', gain: '+592', w: 300 },
        { x: 290, who: 'boris', price: '1.300000', shares: '769.230769', out: '1224.637681', gain: '+225', w: 220 },
        { x: 550, who: 'vera', price: '1.469565', shares: '680.473372', out: '1083.333333', gain: '+83', w: 150 },
      ].map((c) => (
        <g key={c.who}>
          <rect x={c.x} y={64} width={240} height={128} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
          <text x={c.x + 18} y={90} fontSize={12} fill="#fff">{c.who} внесла 1000 USDC</text>
          <text x={c.x + 18} y={114} fontSize={11} fontFamily={MONO} fill={FADE}>цена доли: {c.price}</text>
          <text x={c.x + 18} y={136} fontSize={11} fontFamily={MONO} fill={FADE}>долей: {c.shares}</text>
          <text x={c.x + 18} y={160} fontSize={11} fontFamily={MONO} fill={ACCENT}>заберёт: {c.out}</text>
          <text x={c.x + 18} y={182} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>прибыль {c.gain} USDC</text>
        </g>
      ))}

      <text x={30} y={228} fontSize={12.5} fill="#fff">число долей у вкладчика не меняется — меняется их цена: 1.000000 → 1.300000 → 1.469565 → 1.592028</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>доход не раздают: он поднимает общий объём активов, а долей остаётся столько же</text>
      <text x={30} y={280} fontSize={12.5} fill={ACCENT}>после вывода всех троих в хранилище остаётся ровно 0 — сумма долей сходится</text>
      <text x={30} y={304} fontSize={12.5} fill={FADE}>первый вкладчик получает доли один к одному: делить ещё не на что</text>
    </Panel>
  ),

  'ev-inflation-attack': (aria) => (
    <Panel id="fig-ev-attack" w={820} h={320} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>АТАКА НА ПЕРВОГО ВКЛАДЧИКА: 1 ЕДИНИЦА И ОДИН ПЕРЕВОД</text>

      {[
        { y: 56, n: '1', t: 'злоумышленник вносит 1 единицу в пустое хранилище', r: 'у него 1 доля' },
        { y: 110, n: '2', t: 'переводит 1000 USDC прямо на адрес контракта, мимо вклада', r: 'цена доли: 1000.000001' },
        { y: 164, n: '3', t: 'жертва вносит 1000 USDC', r: 'получает 0 долей' },
        { y: 218, n: '4', t: 'злоумышленник сжигает свою единственную долю', r: 'забирает 1000.000000 USDC' },
      ].map((s) => (
        <g key={s.n}>
          <rect x={30} y={s.y} width={470} height={40} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={s.y + 25} fontSize={11.5} fill="#fff">{s.n}. {s.t}</text>
          <rect x={514} y={s.y} width={276} height={40} rx={9} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={1.8} />
          <text x={530} y={s.y + 25} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{s.r}</text>
        </g>
      ))}

      <rect x={30} y={268} width={760} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={293} textAnchor="middle" fontSize={11.5} fill={ACCENT}>с виртуальными долями жертва получает 1 999 999 долей и теряет 0.000249 USDC вместо тысячи</text>
    </Panel>
  ),

  'ev-rounding': (aria) => (
    <Panel id="fig-ev-round" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОКРУГЛЕНИЕ ВСЕГДА В ПОЛЬЗУ ХРАНИЛИЩА</text>

      {[
        { y: 64, t: 'deposit(1000.000000 USDC)', r: '769.230769 долей', d: 'вниз' },
        { y: 106, t: 'mint(769.230769 долей)', r: '1000.000000 USDC', d: 'вверх' },
        { y: 148, t: 'withdraw(1000.000000 USDC)', r: 'сожжёт 769.230770 долей', d: 'вверх' },
        { y: 190, t: 'redeem(769.230769 долей)', r: '999.999999 USDC', d: 'вниз' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={32} rx={8} fill="rgba(0,0,0,0.24)" stroke={INK} strokeWidth={1.6} />
          <text x={48} y={r.y + 21} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.t}</text>
          <text x={420} y={r.y + 21} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.r}</text>
          <text x={772} y={r.y + 21} textAnchor="end" fontSize={11} fill={FADE}>округление {r.d}</text>
        </g>
      ))}

      <text x={30} y={252} fontSize={12.5} fill="#fff">круговой рейс без паузы: внесли 1000.000000, забрали 999.999999 — минус одна единица</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>200 таких рейсов оставили в хранилище 200 единиц: цена доли выросла без всякого дохода</text>
    </Panel>
  ),
};
