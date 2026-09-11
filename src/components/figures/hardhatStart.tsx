import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Hardhat: пакет, npx и структура проекта»: где живёт команда,
 * что появляется в папке и чем диапазон версий отличается от замка. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const hardhatStartSchemes: Schemes = {
  'hs-where-is-command': (aria) => (
    <Panel id="fig-hs-where" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА КОМАНДА, ТРИ РАЗНЫХ ОТВЕТА</text>

      {[
        { y: 66, t: 'папка нового проекта', r: '3.16.0', s: 'взято из node_modules/.bin', ok: true },
        { y: 128, t: 'папка старого проекта', r: '2.29.1', s: 'рядом, но версия другая', ok: true },
        { y: 190, t: 'папка без проекта', r: '?', s: 'npx уходит в интернет за последней', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={44} rx={9} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 28} fontSize={11.5} fill="#fff">{r.t}</text>
          <Arrow x1={292} y1={r.y + 22} x2={356} y2={r.y + 22} color={r.ok ? ACCENT : RED} w={2} />
          <rect x={368} y={r.y} width={120} height={44} rx={9}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.8} />
          <text x={428} y={r.y + 28} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.r}</text>
          <text x={504} y={r.y + 28} fontSize={11} fill={r.ok ? FADE : RED_TEXT}>{r.s}</text>
        </g>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">npx ищет команду в node_modules/.bin текущей папки, потом выше — и только потом в сети</text>
      <text x={30} y={290} fontSize={12.5} fill={FADE}>поэтому версия инструмента — свойство папки, а не компьютера: два проекта рядом живут на разных</text>
    </Panel>
  ),

  'hs-project-tree': (aria) => (
    <Panel id="fig-hs-tree" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПОЯВЛЯЕТСЯ В ПАПКЕ И ЗАЧЕМ ОНО</text>

      {[
        { y: 62, n: 'hardhat.config.ts', d: 'версия компилятора, сети, подключаемые части', keep: true },
        { y: 100, n: 'contracts/', d: 'исходники на Solidity — и обычные, и тестовые', keep: true },
        { y: 138, n: 'test/', d: 'тесты на TypeScript', keep: true },
        { y: 176, n: 'ignition/modules/', d: 'описания развёртывания', keep: true },
        { y: 214, n: 'package.json + lock', d: 'список зависимостей и их точные версии', keep: true },
        { y: 252, n: 'node_modules/', d: '188 МБ, 293 пакета — восстанавливается одной командой', keep: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={216} height={30} rx={8}
            fill={r.keep ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.keep ? ACCENT : RED} strokeWidth={1.6} />
          <text x={46} y={r.y + 20} fontSize={11} fontFamily={MONO} fill={r.keep ? ACCENT : RED_TEXT}>{r.n}</text>
          <text x={264} y={r.y + 20} fontSize={11} fill={FADE}>{r.d}</text>
          <text x={724} y={r.y + 20} fontSize={11} fontWeight={600} fill={r.keep ? ACCENT : RED_TEXT}>{r.keep ? 'в репозиторий' : 'не класть'}</text>
        </g>
      ))}

      <text x={30} y={300} fontSize={12.5} fill="#fff">всё, что человек написал, весит 204 КБ; всё, что скачано, — 188 МБ</text>
    </Panel>
  ),

  'hs-lock-vs-range': (aria) => (
    <Panel id="fig-hs-lock" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДИАПАЗОН, ЗАМОК И ТО, ЧТО РЕАЛЬНО НА ДИСКЕ</text>

      <rect x={30} y={66} width={240} height={124} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">package.json</text>
      <text x={48} y={120} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>"hardhat": "^3.16.0"</text>
      <text x={48} y={146} fontSize={11} fill={FADE}>это диапазон: годится любая</text>
      <text x={48} y={168} fontSize={11} fill={FADE}>версия 3.x не ниже 3.16.0</text>

      <rect x={290} y={66} width={240} height={124} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={308} y={92} fontSize={11.5} fill="#fff">package-lock.json</text>
      <text x={308} y={120} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>"version": "3.16.0"</text>
      <text x={308} y={146} fontSize={11} fill={FADE}>это ровно одна версия —</text>
      <text x={308} y={168} fontSize={11} fill={FADE}>и так для всех 293 пакетов</text>

      <rect x={550} y={66} width={240} height={124} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={568} y={92} fontSize={11.5} fill="#fff">node_modules</text>
      <text x={568} y={120} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>3.16.0</text>
      <text x={568} y={146} fontSize={11} fontFamily={MONO} fill={FADE}>npm i  — можно новее</text>
      <text x={568} y={168} fontSize={11} fontFamily={MONO} fill={ACCENT}>npm ci — строго по замку</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">на чужой машине проект ставят через npm ci: он не пересобирает замок и не подсунет другую версию</text>
      <text x={30} y={252} fontSize={12.5} fontFamily={MONO} fill={RED_TEXT}>npm error EUSAGE: package.json и package-lock.json разошлись</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>эта ошибка означает, что кто-то правил список зависимостей руками и не обновил замок</text>
    </Panel>
  ),
};
