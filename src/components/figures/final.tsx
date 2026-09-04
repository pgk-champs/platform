import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы заключительной главы Фундамента: день разработчика целиком,
 * анатомия английской ошибки, путь ssh-ключа и карта горячих клавиш. */

export const finalSchemes: Schemes = {
  /* один рабочий день: где какой навык включается */
  'final-day-timeline': (aria) => (
    <Panel id="fig-final-day" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ДЕНЬ · ГДЕ ВКЛЮЧАЕТСЯ КАЖДЫЙ НАВЫК</text>
      <path d="M60 300h680" stroke={SOFT} strokeWidth={4} strokeLinecap="round" />
      {[
        { t: '10:00', a: 'git pull', s: 'git' },
        { t: '10:20', a: 'читаю тикет', s: 'английский' },
        { t: '11:00', a: 'пишу код', s: 'клавиатура' },
        { t: '14:00', a: 'ssh на сервер', s: 'ssh' },
        { t: '16:00', a: 'смотрю логи', s: 'система' },
        { t: '17:30', a: 'git push', s: 'git' },
      ].map((row, i) => {
        const x = 70 + i * 116;
        return (
          <g key={row.t}>
            <circle cx={x + 40} cy={300} r={9} fill={ACCENT} />
            <rect x={x} y={90 + (i % 2) * 60} width={104} height={72} rx={12} fill={SOFT} stroke={INK} strokeWidth={2} />
            <text x={x + 52} y={114 + (i % 2) * 60} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>{row.t}</text>
            <text x={x + 52} y={134 + (i % 2) * 60} textAnchor="middle" fontSize={12} fill="#fff">{row.a}</text>
            <text x={x + 52} y={152 + (i % 2) * 60} textAnchor="middle" fontSize={11} fill={FADE}>{row.s}</text>
            <path d={`M${x + 40} ${162 + (i % 2) * 60}V291`} stroke={SOFT} strokeWidth={2} strokeDasharray="4 5" />
          </g>
        );
      })}
      <text x={60} y={326} fontSize={12} fill={FADE}>ни одного часа без навыков из Фундамента</text>
    </Panel>
  ),

  /* английская ошибка разбирается по частям */
  'final-error-anatomy': (aria) => (
    <Panel id="fig-final-error" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>АНГЛИЙСКАЯ ОШИБКА ПО ЧАСТЯМ</text>
      <rect x={30} y={62} width={740} height={64} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={14} fontFamily={MONO} fill="#fff">Permission denied (publickey).</text>
      <text x={50} y={114} fontSize={14} fontFamily={MONO} fill={FADE}>fatal: Could not read from remote repository.</text>
      {[
        { t: 'Permission denied', n: 'что случилось: доступ не дали' },
        { t: '(publickey)', n: 'почему: сервер ждал ssh-ключ' },
        { t: 'Could not read', n: 'следствие: git не дошёл до репозитория' },
        { t: 'remote repository', n: 'где: удалённая сторона, не твой диск' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={30 + i * 190} y={168} width={172} height={92} rx={12} fill={i === 1 ? ACCENT : SOFT} stroke={i === 1 ? 'none' : INK} strokeWidth={2} />
          <text x={116 + i * 190} y={198} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={i === 1 ? '#111' : '#fff'}>{row.t}</text>
          <text x={116 + i * 190} y={224} textAnchor="middle" fontSize={11} fill={i === 1 ? '#111' : FADE}>{row.n.slice(0, 22)}</text>
          <text x={116 + i * 190} y={242} textAnchor="middle" fontSize={11} fill={i === 1 ? '#111' : FADE}>{row.n.slice(22)}</text>
        </g>
      ))}
      <text x={400} y={300} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>ключ в скобках — там почти всегда причина</text>
    </Panel>
  ),

  /* путь ключа: от ssh-keygen до git push */
  'final-ssh-clone-push': (aria) => (
    <Panel id="fig-final-ssh" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПУТЬ КЛЮЧА: ОДИН РАЗ НАСТРОИЛ — ДАЛЬШЕ БЕЗ ПАРОЛЕЙ</text>
      {[
        { c: 'ssh-keygen', n: 'два файла в ~/.ssh' },
        { c: 'id_ed25519.pub', n: 'публичный — отдаёшь' },
        { c: 'GitHub · SSH keys', n: 'вставил в настройки' },
        { c: 'git clone git@…', n: 'сервер узнаёт тебя' },
      ].map((row, i) => (
        <g key={row.c}>
          <rect x={26 + i * 194} y={82} width={166} height={86} rx={12} fill={i === 1 ? ACCENT : SOFT} stroke={i === 1 ? 'none' : INK} strokeWidth={2} />
          <text x={109 + i * 194} y={118} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={i === 1 ? '#111' : '#fff'}>{row.c}</text>
          <text x={109 + i * 194} y={144} textAnchor="middle" fontSize={11} fill={i === 1 ? '#111' : FADE}>{row.n}</text>
          {i < 3 && <Arrow x1={196 + i * 194} y1={125} x2={216 + i * 194} y2={125} w={4} />}
        </g>
      ))}
      <rect x={26} y={196} width={360} height={88} rx={12} fill="rgba(0,0,0,0.24)" stroke={INK} strokeWidth={2} />
      <text x={46} y={224} fontSize={13} fontWeight={700} fill="#fff">приватный ключ</text>
      <text x={46} y={248} fontSize={12} fontFamily={MONO} fill={FADE}>id_ed25519</text>
      <text x={46} y={270} fontSize={12} fill={FADE}>никуда не копируется, не в репозиторий</text>
      <rect x={410} y={196} width={364} height={88} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={430} y={224} fontSize={13} fontWeight={700} fill="#fff">публичный ключ</text>
      <text x={430} y={248} fontSize={12} fontFamily={MONO} fill={ACCENT}>id_ed25519.pub</text>
      <text x={430} y={270} fontSize={12} fill={FADE}>можно показывать кому угодно</text>
    </Panel>
  ),

  /* карта сочетаний, которые экономят день */
  'final-hotkey-map': (aria) => (
    <Panel id="fig-final-hotkeys" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ЭКОНОМИТ ЧАС В ДЕНЬ</text>
      {[
        { k: 'Ctrl+C', n: 'остановить процесс' },
        { k: 'Ctrl+R', n: 'найти команду в истории' },
        { k: 'Tab', n: 'дописать путь' },
        { k: 'Ctrl+Shift+F', n: 'поиск по всему проекту' },
        { k: 'Ctrl+D', n: 'следующее вхождение' },
        { k: 'Ctrl+/', n: 'закомментировать' },
        { k: 'Alt+↑ / Alt+↓', n: 'переставить строку' },
        { k: 'Ctrl+P', n: 'открыть файл по имени' },
      ].map((row, i) => {
        const x = 34 + (i % 4) * 188;
        const y = 74 + Math.floor(i / 4) * 108;
        return (
          <g key={row.k}>
            <rect x={x} y={y} width={168} height={88} rx={12} fill={SOFT} stroke={INK} strokeWidth={2} />
            <text x={x + 84} y={y + 38} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>{row.k}</text>
            <text x={x + 84} y={y + 64} textAnchor="middle" fontSize={11} fill={FADE}>{row.n}</text>
          </g>
        );
      })}
      <text x={400} y={310} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">мышь — это пауза, сочетание — это движение</text>
    </Panel>
  ),
};
