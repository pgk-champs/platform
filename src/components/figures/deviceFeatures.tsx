import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Возможности устройства»: машина состояний разрешения,
 * три способа отложить уведомление и виджет в чужом процессе. */

export const deviceFeaturesSchemes: Schemes = {
  'df-permission': (aria) => (
    <Panel id="fig-df-perm" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СИСТЕМА РАЗЛИЧАЕТ ДВА СОСТОЯНИЯ, А ИХ ЧЕТЫРЕ</text>

      {[
        { x: 30, t: 'не спрашивали', a: 'DENIED · false', c: INK },
        { x: 224, t: 'отказал раз', a: 'DENIED · true', c: INK },
        { x: 418, t: 'отказал навсегда', a: 'DENIED · false', c: 'rgba(255,140,140,0.9)' },
        { x: 612, t: 'разрешил', a: 'GRANTED', c: ACCENT },
      ].map((s) => (
        <g key={s.t}>
          <rect x={s.x} y={68} width={178} height={78} rx={12}
            fill={s.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={s.c} strokeWidth={2.5} />
          <text x={s.x + 89} y={96} textAnchor="middle" fontSize={12} fill="#fff">{s.t}</text>
          <text x={s.x + 89} y={124} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={s.c === ACCENT ? ACCENT : FADE}>{s.a}</text>
        </g>
      ))}
      <Arrow x1={212} y1={107} x2={220} y2={107} color={FADE} w={2.5} />
      <Arrow x1={406} y1={107} x2={414} y2={107} color={FADE} w={2.5} />

      <rect x={30} y={168} width={372} height={40} rx={9} fill="rgba(255,140,140,0.15)" stroke="rgba(255,140,140,0.7)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={216} y={193} textAnchor="middle" fontSize={11.5} fill="rgba(255,170,170,0.95)">первое и третье состояние для системы одинаковы</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">без своего флага «уже спрашивали» приложение зациклится: третье нажатие снова «просит», а диалог не появится</text>
      <text x={30} y={270} fontSize={12.5} fill={ACCENT}>с флагом — «разрешение выключено, открыть настройки» и запасной путь через галерею</text>
      <text x={30} y={300} fontSize={12.5} fill={FADE}>приложение обязано работать при любом отказе — это отдельный критерий</text>
    </Panel>
  ),

  'df-notify-minute': (aria) => (
    <Panel id="fig-df-notify" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>«ЧЕРЕЗ МИНУТУ, ОДИН РАЗ» — ТРИ РЕАЛИЗАЦИИ</text>

      {[
        { y: 66, t: 'периодическая работа, 60 с', r: '1 уведомление · в 15:00', d: 'WorkManager молча поднял период до 15 минут', c: 'rgba(255,140,140,0.85)' },
        { y: 146, t: 'отложенная, без отмены', r: '15 уведомлений', d: 'одно пришло при открытом приложении', c: 'rgba(255,140,140,0.85)' },
        { y: 226, t: 'отложенная, отмена при возврате', r: '2 уведомления · 02:30 и 07:50', d: 'ровно столько, сколько уходов в фон дольше минуты', c: ACCENT },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={64} rx={12}
            fill={r.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.c} strokeWidth={2.5} />
          <text x={50} y={r.y + 26} fontSize={12.5} fill="#fff">{r.t}</text>
          <text x={50} y={r.y + 48} fontSize={11.5} fill={FADE}>{r.d}</text>
          <text x={770} y={r.y + 38} textAnchor="end" fontSize={12.5} fontFamily={MONO} fill={r.c === ACCENT ? ACCENT : 'rgba(255,170,170,0.95)'}>{r.r}</text>
        </g>
      ))}

      <text x={30} y={316} fontSize={12.5} fill="#fff">три ухода в фон, один короче минуты — правильный ответ два; первые два варианта его не дают</text>
    </Panel>
  ),

  'df-widget-process': (aria) => (
    <Panel id="fig-df-widget" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВИДЖЕТ ЖИВЁТ В ЧУЖОМ ПРОЦЕССЕ</text>

      <rect x={30} y={68} width={330} height={150} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={96} fontSize={12.5} fill="#fff">процесс приложения</text>
      {['ViewModel', 'репозиторий в памяти', 'object-синглтон'].map((t, i) => (
        <text key={t} x={52} y={124 + i * 22} fontSize={11.5} fontFamily={MONO} fill={FADE}>· {t}</text>
      ))}
      <text x={52} y={200} fontSize={11} fill="rgba(255,170,170,0.95)">виджету это всё недоступно</text>

      <rect x={396} y={104} width={28} height={78} rx={8} fill={SOFT} stroke={FADE} strokeWidth={2} strokeDasharray="5 4" />
      <text x={410} y={148} textAnchor="middle" fontSize={10} fill={FADE} transform="rotate(-90 410 148)">граница</text>

      <rect x={460} y={68} width={330} height={150} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={482} y={96} fontSize={12.5} fill="#fff">процесс лаунчера</text>
      <text x={482} y={124} fontSize={11.5} fontFamily={MONO} fill={FADE}>· GlanceAppWidget</text>
      <text x={482} y={146} fontSize={11.5} fontFamily={MONO} fill={FADE}>· рисует то, что прочитал</text>
      <text x={482} y={200} fontSize={11} fill={ACCENT}>читает только с диска</text>

      <Arrow x1={195} y1={230} x2={195} y2={254} color={ACCENT} w={3} />
      <Arrow x1={625} y1={254} x2={625} y2={230} color={ACCENT} w={3} />
      <rect x={120} y={256} width={580} height={30} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={276} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>DataStore / Room — единственный мост</text>
    </Panel>
  ),
};
