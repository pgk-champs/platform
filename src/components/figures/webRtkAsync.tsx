import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Асинхронность в Redux»: три действия на один запрос,
 * отказ значением против исключения и состояние запроса в хранилище. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webRtkAsyncSchemes: Schemes = {
  'wra-thunk-flow': (aria) => (
    <Panel id="fig-wra-flow" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЗАПРОС — ТРИ ДЕЙСТВИЯ, И НИ ОДНО НЕ НАПИСАНО РУКАМИ</text>

      <rect x={30} y={68} width={200} height={44} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={46} y={95} fontSize={11} fontFamily={MONO} fill="#fff">dispatch(loadBalance(a))</text>

      {[
        { y: 140, n: '…/pending', d: 'отправляется сразу', s: 'status: loading', ok: null },
        { y: 186, n: '…/fulfilled', d: 'запрос удался', s: 'status: ok, value: 1000.0', ok: true },
        { y: 232, n: '…/rejected', d: 'запрос не удался', s: 'status: error, error: …', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={210} height={34} rx={8}
            fill={r.ok === true ? SOFT : r.ok === false ? 'rgba(255,140,140,0.14)' : 'rgba(0,0,0,0.26)'}
            stroke={r.ok === true ? ACCENT : r.ok === false ? RED : INK} strokeWidth={1.8} />
          <text x={46} y={r.y + 22} fontSize={11} fontFamily={MONO}
            fill={r.ok === true ? ACCENT : r.ok === false ? RED_TEXT : FADE}>{r.n}</text>
          <text x={262} y={r.y + 22} fontSize={11} fill={FADE}>{r.d}</text>
          <text x={452} y={r.y + 22} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.s}</text>
        </g>
      ))}
      <Arrow x1={130} y1={116} x2={130} y2={134} color={ACCENT} w={2} />

      <text x={30} y={286} fontSize={12.5} fill="#fff">имена складываются из имени среза, имени запроса и исхода — их видно в списке действий при отладке</text>
    </Panel>
  ),

  'wra-reject': (aria) => (
    <Panel id="fig-wra-rej" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА СПОСОБА СООБЩИТЬ ОБ ОТКАЗЕ</text>

      <rect x={30} y={66} width={370} height={136} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">rejectWithValue(«…»)</text>
      <text x={50} y={118} fontSize={11} fill={FADE}>вы сами решаете, что попадёт в состояние</text>
      <text x={50} y={142} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>payload: «узел ответил: −32000»</text>
      <text x={50} y={166} fontSize={11} fill={ACCENT}>годится для ожидаемого отказа узла</text>
      <text x={50} y={190} fontSize={11} fill={FADE}>сообщение можно писать по-человечески</text>

      <rect x={420} y={66} width={370} height={136} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={11.5} fontFamily={MONO} fill="#fff">throw new Error(«…»)</text>
      <text x={440} y={118} fontSize={11} fill={FADE}>исключение поймано и превращено в действие</text>
      <text x={440} y={142} fontSize={10.5} fontFamily={MONO} fill={FADE}>payload: нет, error.message: «сеть недоступна»</text>
      <text x={440} y={166} fontSize={11} fill={FADE}>годится для неожиданного</text>
      <text x={440} y={190} fontSize={11} fill={RED_TEXT}>текст приходит как есть, часто непонятный</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">в обоих случаях отправка не бросает наружу: она возвращает значение, а не падает</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>поэтому обработчик отказа читает сначала свою нагрузку, а потом уже текст исключения</text>
    </Panel>
  ),

  'wra-status': (aria) => (
    <Panel id="fig-wra-st" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ЛЕЖИТ В ХРАНИЛИЩЕ ПОСЛЕ КАЖДОГО ИСХОДА</text>

      {[
        { y: 66, t: 'после успеха', s: '{ status: "ok", value: "1000.0", error: null }', ok: true },
        { y: 118, t: 'после отказа узла', s: '{ status: "error", value: "1000.0", error: "…-32000…" }', ok: false },
        { y: 170, t: 'после сетевой ошибки', s: '{ status: "error", value: "1000.0", error: "сеть недоступна" }', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 22} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={230} y={r.y} width={560} height={34} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={246} y={r.y + 22} fontSize={10.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={238} fontSize={12.5} fill="#fff">обратите внимание: после отказа старое значение осталось лежать в состоянии</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>это решение, а не случайность: показывать прежний баланс с пометкой «устарел» или очищать — выбираете вы</text>
    </Panel>
  ),
};
