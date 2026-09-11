import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Свой узел»: из чего состоит узел, как genesis.json
 * превращается в блок 0 и кто подписывает транзакцию. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const gethNetworkSchemes: Schemes = {
  'gn-node-parts': (aria) => (
    <Panel id="fig-gn-parts" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ПРОГРАММА, ПЯТЬ РАЗНЫХ ХРАНИЛИЩ</text>

      {[
        { x: 30, t: 'цепочка блоков', d: 'заголовки и транзакции', s: 'растёт и не переписывается' },
        { x: 224, t: 'состояние', d: 'балансы, код, память', s: 'пересчитывается каждым блоком' },
        { x: 418, t: 'очередь', d: 'принятые, но не в блоке', s: 'живёт только в памяти' },
        { x: 612, t: 'keystore', d: 'зашифрованные ключи', s: 'файлы на диске' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={178} height={104} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={c.x + 18} y={92} fontSize={12} fill="#fff">{c.t}</text>
          <text x={c.x + 18} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{c.d}</text>
          <text x={c.x + 18} y={144} fontSize={10.5} fill={FADE}>{c.s}</text>
        </g>
      ))}

      <rect x={30} y={192} width={760} height={44} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={48} y={219} fontSize={12} fontFamily={MONO} fill={ACCENT}>порт 8545 — единственная дверь снаружи: вопрос по HTTP, ответ в JSON</text>

      <text x={30} y={266} fontSize={12.5} fill="#fff">папка datadir — это и есть вся сеть: удалили её — удалили цепочку, счета и историю</text>
      <text x={30} y={290} fontSize={12.5} fill={FADE}>программа одна, а сетей на машине может быть сколько угодно: у каждой свой datadir и свой порт</text>
    </Panel>
  ),

  'gn-genesis-to-block': (aria) => (
    <Panel id="fig-gn-genesis" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ИЗ GENESIS.JSON ВО ЧТО ПРЕВРАЩАЕТСЯ</text>

      <rect x={30} y={66} width={300} height={168} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">genesis.json</text>
      {[
        { y: 118, t: 'chainId: 1337' },
        { y: 142, t: 'gasLimit: 0x1c9c380' },
        { y: 166, t: 'difficulty: 0x0' },
        { y: 190, t: 'alloc: { A: 1000 ETH }' },
        { y: 214, t: 'blobSchedule: { … }' },
      ].map((r) => (
        <text key={r.y} x={48} y={r.y} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.t}</text>
      ))}

      <Arrow x1={342} y1={150} x2={430} y2={150} color={ACCENT} w={2.5} />
      <text x={386} y={140} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>geth init</text>

      <rect x={444} y={66} width={346} height={168} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={462} y={92} fontSize={11.5} fill="#fff">блок 0 в базе узла</text>
      {[
        { y: 118, t: 'eth_chainId → 0x539' },
        { y: 142, t: 'gasLimit → 30000000' },
        { y: 166, t: 'difficulty → 0' },
        { y: 190, t: 'eth_getBalance(A) → 1000 ETH' },
        { y: 214, t: 'hash → 0x8d15024c…b73a92' },
      ].map((r) => (
        <text key={r.y} x={462} y={r.y} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>{r.t}</text>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">хеш блока 0 — отпечаток всего файла: изменили одну цифру в alloc — получили другую сеть</text>
      <text x={30} y={290} fontSize={12.5} fill={FADE}>поэтому узлы с разным genesis не договорятся никогда, даже если chainId у них совпал</text>
    </Panel>
  ),

  'gn-who-signs': (aria) => (
    <Panel id="fig-gn-signs" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА СПОСОБА ОТПРАВИТЬ ТРАНЗАКЦИЮ</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">подписывает узел</text>
      <text x={50} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>eth_sendTransaction</text>
      <text x={50} y={142} fontSize={11} fill={FADE}>ключ лежит в keystore узла</text>
      <text x={50} y={166} fontSize={11} fill={FADE}>счёт должен быть разблокирован</text>
      <text x={50} y={192} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>иначе: authentication needed</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">подписываем сами</text>
      <text x={440} y={118} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>eth_sendRawTransaction</text>
      <text x={440} y={142} fontSize={11} fill={FADE}>ключ у нас, узел его не видит</text>
      <text x={440} y={166} fontSize={11} fill={FADE}>узел получает готовые байты</text>
      <text x={440} y={192} fontSize={11} fill={ACCENT}>так работают все библиотеки</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">в подпись входит chainId: та же транзакция для другой сети не годится</text>
      <text x={30} y={276} fontSize={12.5} fontFamily={MONO} fill={RED_TEXT}>invalid sender: invalid chain id for signer: have 7777 want 1337</text>
      <text x={30} y={298} fontSize={12.5} fill={FADE}>это и есть защита от переноса подписанной транзакции в чужую сеть</text>
    </Panel>
  ),
};
