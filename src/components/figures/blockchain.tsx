import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы глав трека «Блокчейн» и отдельных тем. */

export const blockchainSchemes: Schemes = {
  /* лавинный эффект: один изменённый символ входа — совсем другой хеш */
  'hash-avalanche': (aria) => (
    <Panel id="fig-bc-hash" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ХЕШ · ЛАВИННЫЙ ЭФФЕКТ</text>
      <text x={40} y={116} fontSize={20} fontWeight={700} fill="#fff" fontFamily={MONO}>{'Alice->Bob:'}<tspan fill={ACCENT}>5</tspan></text>
      <Arrow x1={248} y1={108} x2={316} y2={108} color={ACCENT} w={5} />
      <rect x={326} y={82} width={150} height={52} rx={12} fill={ACCENT} />
      <text x={401} y={115} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>SHA-256</text>
      <Arrow x1={476} y1={108} x2={544} y2={108} color={ACCENT} w={5} />
      <text x={554} y={115} fontSize={19} fontWeight={700} fill={ACCENT} fontFamily={MONO}>7c1366a3…</text>
      <text x={40} y={206} fontSize={20} fontWeight={700} fill="#fff" fontFamily={MONO}>{'Alice->Bob:'}<tspan fill={ACCENT}>6</tspan></text>
      <Arrow x1={248} y1={198} x2={316} y2={198} color={ACCENT} w={5} />
      <rect x={326} y={172} width={150} height={52} rx={12} fill={ACCENT} />
      <text x={401} y={205} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>SHA-256</text>
      <Arrow x1={476} y1={198} x2={544} y2={198} color={ACCENT} w={5} />
      <text x={554} y={205} fontSize={19} fontWeight={700} fill={ACCENT} fontFamily={MONO}>9f0ae72c…</text>
      <text x={400} y={254} textAnchor="middle" fontSize={14} fill={FADE}>один изменённый символ входа — и хеш не имеет ничего общего с прежним: половинчатых изменений не бывает</text>
    </Panel>
  ),
  /* подписать закрытым, проверить открытым */
  'signature-keys': (aria) => (
    <Panel id="fig-bc-sig" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЦИФРОВАЯ ПОДПИСЬ · ЗАКРЫТЫЙ И ОТКРЫТЫЙ КЛЮЧ</text>
      <text x={200} y={78} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">1. Alice подписывает</text>
      <rect x={60} y={92} width={280} height={54} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={200} y={124} textAnchor="middle" fontSize={17} fontWeight={700} fill="#fff" fontFamily={MONO}>закрытый ключ</text>
      <text x={200} y={166} textAnchor="middle" fontSize={12.5} fill={FADE}>секрет — знает только Alice</text>
      <Arrow x1={200} y1={180} x2={200} y2={212} color={ACCENT} w={5} />
      <rect x={100} y={218} width={200} height={46} rx={10} fill={ACCENT} />
      <text x={200} y={247} textAnchor="middle" fontSize={16} fontWeight={800} fill={DARK} fontFamily={MONO}>SIGN</text>
      <Arrow x1={310} y1={241} x2={490} y2={241} color={ACCENT} w={5} />
      <text x={400} y={228} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>подпись: MEYCIQ…</text>
      <text x={600} y={78} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">2. любой узел проверяет</text>
      <rect x={460} y={92} width={280} height={54} rx={12} fill={ACCENT} />
      <text x={600} y={124} textAnchor="middle" fontSize={17} fontWeight={700} fill={DARK} fontFamily={MONO}>открытый ключ</text>
      <text x={600} y={166} textAnchor="middle" fontSize={12.5} fill={FADE}>можно публиковать всем</text>
      <Arrow x1={600} y1={180} x2={600} y2={212} color={ACCENT} w={5} />
      <rect x={500} y={218} width={200} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x={600} y={247} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT} fontFamily={MONO}>VERIFY → OK</text>
      <text x={400} y={286} textAnchor="middle" fontSize={14} fill={FADE}>подписать может только владелец закрытого ключа; проверить подпись — кто угодно, открытым</text>
    </Panel>
  ),
  /* перебор nonce, пока хеш не начнётся с нужного числа нулей */
  'mining-nonce': (aria) => (
    <Panel id="fig-bc-nonce" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>МАЙНИНГ · ПОДБОР NONCE</text>
      {[
        { nonce: 41, hash: '8f3a7c1e…', ok: false },
        { nonce: 42, hash: 'c91e0af2…', ok: false },
        { nonce: 43, hash: '5b0d71aa…', ok: false },
        { nonce: 44, hash: '0000e7b4…', ok: true },
      ].map((row, i) => {
        const y = 76 + i * 50;
        return (
          <g key={row.nonce}>
            <rect x={40} y={y} width={720} height={38} rx={10} fill={row.ok ? ACCENT : 'rgba(0,0,0,0.18)'} stroke={row.ok ? 'none' : INK} strokeWidth={row.ok ? 0 : 2} />
            <text x={64} y={y + 25} fontSize={16} fontWeight={700} fontFamily={MONO} fill={row.ok ? DARK : '#fff'}>{`nonce: ${row.nonce}`}</text>
            <text x={230} y={y + 25} fontSize={16} fontFamily={MONO} fill={row.ok ? DARK : FADE}>
              {'hash: '}{row.ok ? <tspan fontWeight={800}>0000</tspan> : null}{row.ok ? row.hash.slice(4) : row.hash}
            </text>
            {row.ok ? (
              <path d={`M694 ${y + 12}L700 ${y + 24}L716 ${y + 6}`} stroke={DARK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d={`M696 ${y + 11}L710 ${y + 27}M696 ${y + 27}L710 ${y + 11}`} stroke={FADE} strokeWidth={3} strokeLinecap="round" />
            )}
          </g>
        );
      })}
      <text x={400} y={288} textAnchor="middle" fontSize={14} fill={FADE}>nonce перебирают по одному — как только хеш начинается с нужного числа нулей, блок найден</text>
    </Panel>
  ),
  /* три ноды сети, P2P разносит новый блок */
  'node-network': (aria) => (
    <Panel id="fig-bc-nodes" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>WAVES ENTERPRISE · СЕТЬ ИЗ ТРЁХ НОД</text>
      <path d="M240 275L560 275" stroke={FADE} strokeWidth={2.5} fill="none" />
      <Arrow x1={378} y1={168} x2={200} y2={222} color={ACCENT} w={4} />
      <Arrow x1={422} y1={168} x2={600} y2={222} color={ACCENT} w={4} />
      <rect x={310} y={70} width={180} height={90} rx={14} fill={ACCENT} />
      <text x={400} y={108} textAnchor="middle" fontSize={20} fontWeight={800} fill={DARK} fontFamily={MONO}>node-0</text>
      <text x={400} y={132} textAnchor="middle" fontSize={12} fontWeight={700} fill={DARK} fontFamily={MONO}>:6862 :6864 :6865</text>
      <rect x={60} y={230} width={180} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={150} y={268} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily={MONO}>node-1</text>
      <text x={150} y={292} textAnchor="middle" fontSize={13} fill={FADE}>своя копия цепочки</text>
      <rect x={560} y={230} width={180} height={90} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={650} y={268} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily={MONO}>node-2</text>
      <text x={650} y={292} textAnchor="middle" fontSize={13} fill={FADE}>своя копия цепочки</text>
      <text x={400} y={322} textAnchor="middle" fontSize={14} fill={FADE}>новый блок с node-0 разносится P2P-портом соседям; большинство — 2 из 3 — работает и при отказе одной ноды</text>
    </Panel>
  ),
  /* декораторы SDK: назначение каждого */
  'contract-anatomy': (aria) => (
    <Panel id="fig-bc-contract" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SMART-КОНТРАКТ · ДЕКОРАТОРЫ SDK</text>
      <rect x={40} y={64} width={410} height={230} rx={12} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2.5} />
      <g fontFamily={MONO} fontSize={14}>
        <text x={58} y={94} fill={ACCENT} fontWeight={800}>@Contract()</text>
        <text x={58} y={118} fill="#fff">{'class ScoreCounter {'}</text>
        <text x={74} y={144} fill={ACCENT} fontWeight={800}>@State()<tspan fill="#fff" fontWeight={400}> state</tspan></text>
        <text x={74} y={170} fill={ACCENT} fontWeight={800}>{"@Var({ key: 'SCORE' })"}</text>
        <text x={74} y={192} fill="#fff">score</text>
        <text x={74} y={218} fill={ACCENT} fontWeight={800}>{'@Action({ onInit: true })'}</text>
        <text x={90} y={240} fill="#fff">{'init() { ... }'}</text>
        <text x={74} y={264} fill={ACCENT} fontWeight={800}>@Action()<tspan fill="#fff" fontWeight={400}>{' increment() { ... }'}</tspan></text>
      </g>
      <g fontSize={13.5}>
        <text x={480} y={92} fill={ACCENT} fontWeight={700} fontFamily={MONO}>@Contract()</text>
        <text x={480} y={110} fill={FADE}>класс целиком = контракт</text>
        <text x={480} y={140} fill={ACCENT} fontWeight={700} fontFamily={MONO}>@State() / @Var</text>
        <text x={480} y={158} fill={FADE}>данные хранятся в блокчейне</text>
        <text x={480} y={188} fill={ACCENT} fontWeight={700} fontFamily={MONO}>{'@Action({ onInit })'}</text>
        <text x={480} y={206} fill={FADE}>выполнится один раз при создании</text>
        <text x={480} y={236} fill={ACCENT} fontWeight={700} fontFamily={MONO}>@Action()</text>
        <text x={480} y={254} fill={FADE}>обычное действие — вызывай снова и снова</text>
      </g>
      <text x={400} y={308} textAnchor="middle" fontSize={14} fill={FADE}>декораторы говорят платформе, как устроен контракт — это не код, а разметка над классом и методами</text>
    </Panel>
  ),
  /* CreateContractTx один раз, CallContractTx сколько угодно */
  'contract-tx-flow': (aria) => (
    <Panel id="fig-bc-tx" w={800} h={310} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SMART-КОНТРАКТ · CREATE И CALL</text>
      <text x={50} y={72} fontSize={13} fontWeight={700} fill={FADE}>происходит один раз</text>
      <rect x={50} y={84} width={230} height={64} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x={165} y={112} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>CreateContractTx</text>
      <text x={165} y={134} textAnchor="middle" fontSize={11.5} fill={FADE}>образ уже загружен в registry</text>
      <Arrow x1={290} y1={116} x2={368} y2={116} color={ACCENT} w={5} />
      <rect x={378} y={94} width={200} height={44} rx={10} fill={ACCENT} />
      <text x={478} y={122} textAnchor="middle" fontSize={14} fontWeight={800} fill={DARK} fontFamily={MONO}>contract id: abc123</text>
      <text x={50} y={182} fontSize={13} fontWeight={700} fill={FADE}>можно вызывать сколько угодно раз</text>
      <rect x={62} y={210} width={230} height={64} rx={14} fill={SOFT} opacity={0.4} />
      <rect x={56} y={202} width={230} height={64} rx={14} fill={SOFT} opacity={0.7} />
      <rect x={50} y={194} width={230} height={64} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={165} y={222} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily={MONO}>CallContractTx</text>
      <text x={165} y={244} textAnchor="middle" fontSize={13} fill={ACCENT} fontFamily={MONO} fontWeight={700}>increment()</text>
      <Arrow x1={300} y1={226} x2={368} y2={226} color={ACCENT} w={5} />
      <rect x={378} y={204} width={210} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={483} y={232} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>SCORE: 0 → 1 → 2…</text>
      <text x={400} y={290} textAnchor="middle" fontSize={14} fill={FADE}>Create разворачивает контракт один раз, Call вызывает его действия сколько угодно раз</text>
    </Panel>
  ),
};
