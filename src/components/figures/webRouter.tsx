import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Навигация»: смена адреса без перезагрузки, таблица
 * маршрутов и что происходит при обновлении страницы. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webRouterSchemes: Schemes = {
  'wro-pushstate': (aria) => (
    <Panel id="fig-wro-push" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>АДРЕС МЕНЯЕТСЯ, ДОКУМЕНТ ОСТАЁТСЯ ТОТ ЖЕ</text>

      {[
        { y: 66, t: 'было', a: '/docs/blockchain/web-html/', c: FADE },
        { y: 106, t: 'pushState', a: '/ops?kind=deposit', c: ACCENT },
        { y: 146, t: 'pushState', a: '/ops/0xabc', c: ACCENT },
        { y: 186, t: 'кнопка «назад»', a: '/ops?kind=deposit', c: ACCENT },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={190} y={r.y} width={330} height={30} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={206} y={r.y + 20} fontSize={11} fontFamily={MONO} fill={r.c}>{r.a}</text>
        </g>
      ))}

      <rect x={550} y={66} width={240} height={150} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={568} y={92} fontSize={11.5} fill="#fff">что при этом не менялось</text>
      <text x={568} y={118} fontSize={11} fill={ACCENT}>объект, созданный до смены</text>
      <text x={568} y={140} fontSize={11} fill={ACCENT}>заголовок страницы</text>
      <text x={568} y={162} fontSize={11} fill={ACCENT}>ни одной загрузки с сервера</text>
      <text x={568} y={190} fontSize={10.5} fontFamily={MONO} fill={FADE}>popstate: /ops?kind=deposit</text>

      <text x={30} y={250} fontSize={12.5} fill="#fff">браузер умеет менять адрес и историю, не перезагружая страницу — на этом стоит вся навигация</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>вместе с адресом можно сохранить состояние шага: при возврате оно приходит обратно</text>
    </Panel>
  ),

  'wro-routes': (aria) => (
    <Panel id="fig-wro-routes" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>АДРЕС РЕШАЕТ, КАКОЙ КОМПОНЕНТ ПОКАЗАТЬ</text>

      {[
        { y: 66, p: '/', c: 'Balance', d: 'точное совпадение' },
        { y: 106, p: '/ops', c: 'OpsList', d: 'список; фильтр — в строке запроса' },
        { y: 146, p: '/ops/:hash', c: 'OpCard', d: 'двоеточие — переменная часть адреса' },
        { y: 186, p: '*', c: 'NotFound', d: 'всё остальное; без него экран пустой' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={190} height={30} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 20} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.p}</text>
          <Arrow x1={232} y1={r.y + 14} x2={268} y2={r.y + 14} color={ACCENT} w={1.8} />
          <rect x={282} y={r.y} width={150} height={30} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={298} y={r.y + 20} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.c}</text>
          <text x={452} y={r.y + 20} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={244} fontSize={12.5} fill="#fff">адрес становится частью состояния: его можно послать другому человеку, и он увидит то же самое</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>обычная ссылка перезагрузила бы страницу — для переходов внутри приложения берут особую</text>
    </Panel>
  ),

  'wro-refresh': (aria) => (
    <Panel id="fig-wro-refresh" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛЬЗОВАТЕЛЬ НАЖАЛ «ОБНОВИТЬ»</text>

      {[
        { y: 70, u: '/docs/blockchain/web-html/', s: 200, ok: true, d: 'такой файл на сервере есть' },
        { y: 112, u: '/ops', s: 404, ok: false, d: 'адрес существует только внутри приложения' },
        { y: 154, u: '/ops/0xabc', s: 404, ok: false, d: 'сервер о нём никогда не слышал' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={330} height={30} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 20} fontSize={11} fontFamily={MONO} fill="#fff">{r.u}</text>
          <rect x={378} y={r.y} width={80} height={30} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={418} y={r.y + 20} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.s}</text>
          <text x={476} y={r.y + 20} fontSize={11} fill={FADE}>{r.d}</text>
        </g>
      ))}

      <rect x={30} y={200} width={760} height={34} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={48} y={222} fontSize={11.5} fill={ACCENT}>лечение: сервер на любой неизвестный адрес отдаёт ту же главную страницу, дальше разбирается приложение</text>

      <text x={30} y={264} fontSize={12.5} fill="#fff">переходы внутри приложения работают, а обновление и ссылка из чата — нет: это ловят в последний момент</text>
    </Panel>
  ),
};
