import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Чек-лист и отчёт»: разбор находок по корзинам, оценка
 * серьёзности и строение одной находки. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';
const WARN = 'rgba(255,205,140,0.9)';

export const auditReportSchemes: Schemes = {
  'ar-triage': (aria) => (
    <Panel id="fig-ar-tri" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЯТЬ НАХОДОК В СОБСТВЕННОМ КОНТРАКТЕ — И НИ ОДНОЙ КРАЖИ</text>

      {[
        { y: 62, n: 'setRate не сообщает о смене ставки', k: 'исправить', ok: true },
        { y: 106, n: 'owner можно сделать неизменяемым', k: 'исправить', ok: true },
        { y: 150, n: 'событие после внешнего вызова', k: 'исправить', ok: true },
        { y: 194, n: 'имя параметра с подчёркиванием', k: 'исправить', ok: true },
        { y: 238, n: 'низкоуровневый вызов', k: 'объяснить', ok: null },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={420} height={34} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 22} fontSize={11} fill="#fff">{r.n}</text>
          <rect x={468} y={r.y} width={130} height={34} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,205,140,0.14)'} stroke={r.ok ? ACCENT : WARN} strokeWidth={1.6} />
          <text x={533} y={r.y + 22} textAnchor="middle" fontSize={11} fill={r.ok ? ACCENT : WARN}>{r.k}</text>
        </g>
      ))}

      <text x={618} y={130} fontSize={12} fill="#fff">после правок:</text>
      <text x={618} y={156} fontSize={13} fontFamily={MONO} fill={ACCENT}>5 → 1 находка</text>
      <text x={618} y={182} fontSize={11} fill={FADE}>16 тестов по-прежнему</text>
      <text x={618} y={200} fontSize={11} fill={FADE}>проходят</text>

      <text x={30} y={290} fontSize={12.5} fill="#fff">разбор — не «исправить всё»: у части находок правильный ответ «так задумано, и вот почему»</text>
    </Panel>
  ),

  'ar-severity': (aria) => (
    <Panel id="fig-ar-sev" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЕРЬЁЗНОСТЬ — ЭТО УЩЕРБ, УМНОЖЕННЫЙ НА ДОСТУПНОСТЬ</text>

      <text x={30} y={70} fontSize={11} fill={FADE}>насколько легко это сделать →</text>
      <text x={640} y={94} fontSize={11} fill={FADE}>ущерб</text>

      {[
        { y: 84, l: 'деньги уходят', c: [RED, RED, WARN] },
        { y: 132, l: 'работа встаёт', c: [RED, WARN, ACCENT] },
        { y: 180, l: 'неудобно', c: [WARN, ACCENT, ACCENT] },
      ].map((row) => (
        <g key={row.y}>
          <text x={30} y={row.y + 26} fontSize={11.5} fill="#fff">{row.l}</text>
          {row.c.map((c, i) => (
            <g key={i}>
              <rect x={200 + i * 150} y={row.y} width={138} height={40} rx={9}
                fill={c === RED ? 'rgba(255,140,140,0.18)' : c === WARN ? 'rgba(255,205,140,0.16)' : SOFT}
                stroke={c} strokeWidth={2} />
              <text x={269 + i * 150} y={row.y + 25} textAnchor="middle" fontSize={11} fill={c}>
                {c === RED ? 'критично' : c === WARN ? 'средне' : 'мелочь'}
              </text>
            </g>
          ))}
        </g>
      ))}
      <text x={200} y={240} fontSize={10.5} fill={FADE}>кто угодно</text>
      <text x={350} y={240} fontSize={10.5} fill={FADE}>при стечении обстоятельств</text>
      <text x={560} y={240} fontSize={10.5} fill={FADE}>только владелец</text>

      <text x={30} y={276} fontSize={12.5} fill="#fff">«теоретически возможно, но только если владелец сам себе навредит» — это не критично</text>
    </Panel>
  ),

  'ar-finding': (aria) => (
    <Panel id="fig-ar-find" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИЗ ЧЕГО СОСТОИТ ОДНА НАХОДКА</text>

      {[
        { y: 62, k: 'где', v: 'Vault.sol:33, функция withdraw()' },
        { y: 100, k: 'что', v: 'событие отправляется после внешнего вызова' },
        { y: 138, k: 'чем грозит', v: 'при повторном входе порядок событий в журнале перепутается' },
        { y: 176, k: 'серьёзность', v: 'низкая: деньги не затрагиваются, но история становится неверной' },
        { y: 214, k: 'как чинить', v: 'перенести emit выше вызова; правка в одну строку' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={140} height={30} rx={8} fill={SOFT} stroke={ACCENT} strokeWidth={1.6} />
          <text x={46} y={r.y + 20} fontSize={11} fill={ACCENT}>{r.k}</text>
          <text x={188} y={r.y + 20} fontSize={11} fill="#fff">{r.v}</text>
        </g>
      ))}

      <text x={30} y={270} fontSize={12.5} fill="#fff">находка без «чем грозит» и «как чинить» — это не находка, а строчка из вывода инструмента</text>
    </Panel>
  ),
};
