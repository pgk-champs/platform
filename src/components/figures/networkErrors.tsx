import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Ошибки сети»: три разных отказа под одним catch,
 * состояние экрана при отказе и повтор с нарастающей паузой. */

export const networkErrorsSchemes: Schemes = {
  'ne-three-kinds': (aria) => (
    <Panel id="fig-ne-kinds" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ РАЗНЫХ «НЕ ПОЛУЧИЛОСЬ»</text>

      {[
        { y: 70, t: 'нет интернета', d: 'запрос не ушёл', a: 'проверьте связь · повторить', can: true },
        { y: 136, t: 'сервер ответил 500', d: 'запрос дошёл, сервер сломался', a: 'попробуйте позже · повторить', can: true },
        { y: 202, t: 'сервер ответил 401', d: 'токен протух', a: 'войдите заново · без повтора', can: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={52} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={48} y={r.y + 24} fontSize={12.5} fill="#fff">{r.t}</text>
          <text x={48} y={r.y + 42} fontSize={11} fill={FADE}>{r.d}</text>
          <Arrow x1={288} y1={r.y + 26} x2={330} y2={r.y + 26} color={r.can ? ACCENT : INK} w={3} />
          <rect x={340} y={r.y} width={450} height={52} rx={10}
            fill={r.can ? SOFT : 'rgba(0,0,0,0.3)'} stroke={r.can ? ACCENT : INK} strokeWidth={2} />
          <text x={360} y={r.y + 32} fontSize={12} fill={r.can ? ACCENT : '#fff'}>{r.a}</text>
        </g>
      ))}

      <text x={30} y={288} fontSize={12.5} fill="#fff">один catch на всё выдаёт одинаковое «Ошибка загрузки» во всех трёх случаях</text>
      <text x={30} y={314} fontSize={12.5} fill={FADE}>а пользователю нужно знать, чинить ли ему связь, ждать или входить заново</text>
    </Panel>
  ),

  'ne-ui-states': (aria) => (
    <Panel id="fig-ne-ui" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ВИДИТ ПОЛЬЗОВАТЕЛЬ</text>

      {[
        { x: 30, t: 'Loading', b: 'крутится индикатор', c: INK },
        { x: 288, t: 'Content', b: 'список на экране', c: ACCENT },
        { x: 546, t: 'Error', b: 'текст и «Повторить»', c: INK },
      ].map((s) => (
        <g key={s.t}>
          <rect x={s.x} y={68} width={244} height={110} rx={12}
            fill={s.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={s.c} strokeWidth={2.5} />
          <text x={s.x + 122} y={102} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={s.c === ACCENT ? ACCENT : '#fff'}>{s.t}</text>
          <text x={s.x + 122} y={130} textAnchor="middle" fontSize={11.5} fill="#fff">{s.b}</text>
        </g>
      ))}

      <rect x={30} y={198} width={760} height={54} rx={12} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={222} fontSize={12.5} fill="#fff">пустой список и ошибка — разные экраны: «ничего не найдено» против «не удалось загрузить»</text>
      <text x={50} y={244} fontSize={12} fill={FADE}>третий случай — данные есть, но устарели: показываем их и сообщаем, что обновить не вышло</text>

      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>«отобразить экран, указанный в макете» — отдельный критерий в каждом спринте</text>
    </Panel>
  ),

  'ne-retry': (aria) => (
    <Panel id="fig-ne-retry" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОВТОР С НАРАСТАЮЩЕЙ ПАУЗОЙ</text>

      <text x={30} y={74} fontSize={12.5} fill="#fff">без паузы: три запроса за миллисекунды</text>
      <rect x={30} y={86} width={760} height={40} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      {[44, 60, 76, 92, 108, 124, 140, 156].map((x) => (
        <rect key={x} x={x} y={96} width={8} height={20} rx={3} fill="rgba(255,140,140,0.9)" />
      ))}
      <text x={200} y={111} fontSize={11.5} fill={FADE}>сервер и так лежит — добиваем его пачкой запросов</text>

      <text x={30} y={166} fontSize={12.5} fill={ACCENT}>с нарастающей паузой: 100 мс, 200 мс, 400 мс</text>
      <rect x={30} y={178} width={760} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <rect x={44} y={188} width={8} height={20} rx={3} fill={ACCENT} />
      <rect x={120} y={188} width={8} height={20} rx={3} fill={ACCENT} />
      <rect x={272} y={188} width={8} height={20} rx={3} fill={ACCENT} />
      <text x={330} y={203} fontSize={11.5} fill={ACCENT}>даём серверу время подняться, а сети — восстановиться</text>

      <text x={30} y={258} fontSize={12.5} fill="#fff">повторяют только то, что имеет смысл повторять: 401 повтором не лечится</text>
    </Panel>
  ),
};
