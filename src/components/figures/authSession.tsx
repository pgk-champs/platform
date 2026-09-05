import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Авторизация»: что такое «вошёл», три исхода стартового экрана
 * и один полёт за обновлением токена вместо трёх. */

export const authSessionSchemes: Schemes = {
  'as-what-is-login': (aria) => (
    <Panel id="fig-as-login" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>«ВОШЁЛ» — ЭТО НЕ ЭКРАН, А ТОКЕН</text>

      <rect x={30} y={70} width={230} height={80} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={145} y={100} textAnchor="middle" fontSize={12.5} fill="#fff">POST /login</text>
      <text x={145} y={124} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>email + пароль</text>

      <Arrow x1={266} y1={110} x2={326} y2={110} color={ACCENT} w={3} />

      <rect x={336} y={70} width={230} height={80} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={451} y={100} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>token</text>
      <text x={451} y={124} textAnchor="middle" fontSize={11} fill="#fff">живёт ограниченное время</text>

      <Arrow x1={572} y1={110} x2={632} y2={110} color={INK} w={3} />

      <rect x={642} y={70} width={148} height={80} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={716} y={100} textAnchor="middle" fontSize={12.5} fill="#fff">DataStore</text>
      <text x={716} y={124} textAnchor="middle" fontSize={11} fill={FADE}>переживёт перезапуск</text>

      <rect x={30} y={178} width={760} height={48} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={208} fontSize={12.5} fill="#fff">пароль на устройстве не хранят никогда — только токен, который протухает и отзывается</text>

      <text x={30} y={264} fontSize={12.5} fill={ACCENT}>каждый следующий запрос несёт токен в заголовке — так сервер узнаёт, кто пришёл</text>
    </Panel>
  ),

  'as-start-screen': (aria) => (
    <Panel id="fig-as-start" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ИСХОДА ПРИ ЗАПУСКЕ, А НЕ ДВА</text>

      <rect x={300} y={64} width={220} height={54} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={410} y={97} textAnchor="middle" fontSize={12.5} fill="#fff">читаем токен из DataStore</text>

      {[
        { x: 30, t: 'ещё не прочитали', s: 'заставка', d: 'не мигать формой входа', c: FADE },
        { x: 288, t: 'токена нет', s: 'экран входа', d: 'первый запуск или вышли', c: INK },
        { x: 546, t: 'токен есть и не протух', s: 'главный экран', d: 'сессия жива', c: ACCENT },
      ].map((b) => (
        <g key={b.t}>
          <Arrow x1={410} y1={124} x2={b.x + 122} y2={158} color={b.c} w={2.5} />
          <rect x={b.x} y={164} width={244} height={82} rx={12}
            fill={b.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={b.c} strokeWidth={2.5} />
          <text x={b.x + 122} y={190} textAnchor="middle" fontSize={11.5} fill={FADE}>{b.t}</text>
          <text x={b.x + 122} y={214} textAnchor="middle" fontSize={13} fill={b.c === ACCENT ? ACCENT : '#fff'}>{b.s}</text>
          <text x={b.x + 122} y={236} textAnchor="middle" fontSize={10.5} fill={FADE}>{b.d}</text>
        </g>
      ))}

      <text x={30} y={284} fontSize={12.5} fill="#fff">токен есть, но протух — это «токена нет»: иначе главный экран откроется и первый же запрос вернёт 401</text>
      <text x={30} y={308} fontSize={12.5} fill={FADE}>третий исход нужен, потому что чтение с диска асинхронно — доля секунды, но её видно</text>
    </Panel>
  ),

  'as-refresh-lock': (aria) => (
    <Panel id="fig-as-refresh" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ЭКРАНА, ОДИН ПРОТУХШИЙ ТОКЕН</text>

      <text x={30} y={72} fontSize={12.5} fill="#fff">без защиты: каждый запрос обновляет сам</text>
      <rect x={30} y={84} width={760} height={70} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      {['/profile', '/cart', '/orders'].map((r, i) => (
        <g key={r}>
          <rect x={44 + i * 250} y={96} width={230} height={46} rx={9} fill={i === 0 ? SOFT : 'rgba(255,140,140,0.25)'} stroke={i === 0 ? INK : 'rgba(255,140,140,0.85)'} strokeWidth={2} />
          <text x={159 + i * 250} y={114} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{r}</text>
          <text x={159 + i * 250} y={133} textAnchor="middle" fontSize={10.5} fill={i === 0 ? FADE : 'rgba(255,170,170,0.95)'}>{i === 0 ? '/refresh → 200' : '/refresh → 401 · ВЫХОД'}</text>
        </g>
      ))}

      <text x={30} y={190} fontSize={12.5} fill={ACCENT}>под замком: первый обновляет, остальные ждут его результата</text>
      <rect x={30} y={202} width={760} height={70} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <rect x={44} y={214} width={230} height={46} rx={9} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2} />
      <text x={159} y={232} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>/profile → /refresh</text>
      <text x={159} y={251} textAnchor="middle" fontSize={10.5} fill={ACCENT}>один полёт</text>
      {['/cart', '/orders'].map((r, i) => (
        <g key={r}>
          <rect x={294 + i * 250} y={214} width={230} height={46} rx={9} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={409 + i * 250} y={232} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{r}</text>
          <text x={409 + i * 250} y={251} textAnchor="middle" fontSize={10.5} fill={FADE}>ждёт · повтор → 200</text>
        </g>
      ))}

      <text x={30} y={304} fontSize={12.5} fill="#fff">старый refresh-токен одноразовый: второй вызов с ним — уже отказ, и пользователя выкидывает на ровном месте</text>
    </Panel>
  ),
};
