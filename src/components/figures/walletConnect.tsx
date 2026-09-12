import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Кошелёк в браузере»: объект-провайдер, порядок подключения
 * и обнаружение нескольких кошельков. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const walletConnectSchemes: Schemes = {
  'wlc-provider': (aria) => (
    <Panel id="fig-wlc-prov" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОШЕЛЁК ДЛЯ СТРАНИЦЫ — ЭТО ОБЪЕКТ С ОДНИМ МЕТОДОМ</text>

      <rect x={30} y={66} width={230} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">window.ethereum</text>
      <text x={48} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>request({'{'} method, params {'}'})</text>
      <text x={48} y={146} fontSize={11} fontFamily={MONO} fill={ACCENT}>on(«accountsChanged», …)</text>
      <text x={48} y={172} fontSize={11} fontFamily={MONO} fill={ACCENT}>on(«chainChanged», …)</text>
      <text x={48} y={198} fontSize={10.5} fill={FADE}>больше ничего и не нужно</text>

      <Arrow x1={272} y1={140} x2={318} y2={140} color={ACCENT} w={2.5} />

      {[
        { y: 66, m: 'eth_accounts', d: 'кто пользователь — если уже разрешил' },
        { y: 116, m: 'eth_requestAccounts', d: 'спросить разрешение (откроет окно)' },
        { y: 166, m: 'eth_chainId', d: 'в какой сети кошелёк сейчас' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={332} y={r.y} width={230} height={40} rx={9} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={348} y={r.y + 25} fontSize={11} fontFamily={MONO} fill="#fff">{r.m}</text>
          <text x={578} y={r.y + 25} fontSize={10.5} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={252} fontSize={12.5} fill="#fff">приватный ключ не покидает кошелёк: страница может только просить, а подписывает человек</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>библиотеке всё равно, кто перед ней — важен только этот интерфейс</text>
    </Panel>
  ),

  'wlc-connect-flow': (aria) => (
    <Panel id="fig-wlc-flow" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ОТВЕЧАЕТ КОШЕЛЁК НА КАЖДОМ ШАГЕ</text>

      {[
        { y: 62, t: 'до подключения', m: 'eth_accounts', r: '[]', d: 'страница не знает, кто пользователь', ok: null },
        { y: 110, t: 'пользователь отказался', m: 'eth_requestAccounts', r: 'код 4001', d: 'это решение человека, а не ошибка', ok: false },
        { y: 158, t: 'пользователь разрешил', m: 'eth_requestAccounts', r: '[0xf39F…]', d: 'дальше eth_accounts тоже отвечает', ok: true },
        { y: 206, t: 'просим чужую сеть', m: 'wallet_switch…', r: 'код 4902', d: 'такой сети у кошелька нет — сначала добавить', ok: false },
        { y: 254, t: 'просим свою сеть', m: 'wallet_switch…', r: '0x539 = 1337', d: 'плюс событие chainChanged', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={11.5} fill="#fff">{r.t}</text>
          <text x={216} y={r.y + 20} fontSize={10.5} fontFamily={MONO} fill={FADE}>{r.m}</text>
          <rect x={378} y={r.y} width={124} height={30} rx={8}
            fill={r.ok === true ? SOFT : r.ok === false ? 'rgba(255,140,140,0.14)' : 'rgba(0,0,0,0.26)'}
            stroke={r.ok === true ? ACCENT : r.ok === false ? RED : INK} strokeWidth={1.6} />
          <text x={440} y={r.y + 20} textAnchor="middle" fontSize={10.5} fontFamily={MONO}
            fill={r.ok === true ? ACCENT : r.ok === false ? RED_TEXT : FADE}>{r.r}</text>
          <text x={518} y={r.y + 20} fontSize={10.5} fill={FADE}>{r.d}</text>
        </g>
      ))}
    </Panel>
  ),

  'wlc-discovery': (aria) => (
    <Panel id="fig-wlc-disc" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА КОШЕЛЬКА В ОДНОМ БРАУЗЕРЕ</text>

      <rect x={30} y={66} width={370} height={136} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">одно поле на всех</text>
      <text x={50} y={118} fontSize={11} fill={FADE}>все расширения пишут в одно и то же место</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>кто последний записал — того и видно</text>
      <text x={50} y={170} fontSize={11} fill={RED_TEXT}>пользователь не выбирает, выбирает случай</text>

      <rect x={420} y={66} width={370} height={136} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">расширения объявляют о себе</text>
      <text x={440} y={118} fontSize={11} fill={FADE}>страница спросила один раз — получила все</text>
      <text x={440} y={144} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>MetaMask · io.metamask</text>
      <text x={440} y={166} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>Rabby Wallet · io.rabby</text>
      <text x={440} y={190} fontSize={11} fill={ACCENT}>выбор показывают пользователю</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">у каждого кошелька есть имя, значок и обратное доменное имя — по нему их и различают</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>старое поле никуда не делось и работает: новый способ добавили рядом, не ломая прежний</text>
    </Panel>
  ),
};
