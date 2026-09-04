import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы про редактор кода: WebStorm и VS Code. */

export const editorSchemes: Schemes = {
  /* блокнот видит буквы, редактор видит код: подсветка, ошибка, автодополнение */
  'ed-notepad-vs-editor': (aria) => (
    <Panel id="fig-ed-vs" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>БЛОКНОТ ПРОТИВ РЕДАКТОРА КОДА</text>
      <text x={40} y={76} fontSize={15} fontWeight={700} fill="#fff">блокнот</text>
      <rect x={40} y={88} width={340} height={180} rx={12} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={58} y={118} fontSize={12.5} fontFamily={MONO} fill={FADE}>const node = require(&apos;./node&apos;)</text>
      <text x={58} y={142} fontSize={12.5} fontFamily={MONO} fill={FADE}>node.balanse(addr)</text>
      <text x={58} y={166} fontSize={12.5} fontFamily={MONO} fill={FADE}>console.log(res</text>
      <text x={58} y={216} fontSize={13} fill={FADE}>одинаковый серый текст:</text>
      <text x={58} y={236} fontSize={13} fill={FADE}>опечатка balanse и незакрытая</text>
      <text x={58} y={256} fontSize={13} fill={FADE}>скобка найдутся только при запуске</text>
      <text x={420} y={76} fontSize={15} fontWeight={700} fill="#fff">редактор кода</text>
      <rect x={420} y={88} width={340} height={180} rx={12} fill="rgba(0,0,0,0.22)" stroke={ACCENT} strokeWidth={3} />
      <text x={438} y={118} fontSize={12.5} fontFamily={MONO} fill="#fff"><tspan fill={ACCENT}>const</tspan> node = require(&apos;./node&apos;)</text>
      <text x={438} y={142} fontSize={12.5} fontFamily={MONO} fill="#fff">node.balanse(addr)</text>
      <path d="M470 148h58" stroke={ACCENT} strokeWidth={2.5} strokeDasharray="4 3" />
      <text x={438} y={166} fontSize={12.5} fontFamily={MONO} fill="#fff">console.log(res</text>
      <rect x={520} y={152} width={150} height={26} rx={6} fill={ACCENT} />
      <text x={532} y={170} fontSize={11.5} fontFamily={MONO} fontWeight={700} fill={DARK}>ожидается )</text>
      <text x={438} y={216} fontSize={13} fill={ACCENT} fontWeight={600}>подсветка · подчёркнутая опечатка ·</text>
      <text x={438} y={236} fontSize={13} fill={ACCENT} fontWeight={600}>автодополнение · переход к определению</text>
      <text x={438} y={256} fontSize={13} fill={FADE}>всё это — до запуска программы</text>
      <text x={400} y={300} textAnchor="middle" fontSize={13.5} fill={FADE}>редактор кода разбирает текст как код и знает весь проект целиком, а не одну открытую страницу</text>
    </Panel>
  ),
  /* карта окна: пять зон, которые нужны в первый же день */
  'ed-window-map': (aria) => (
    <Panel id="fig-ed-map" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КАРТА ОКНА · WEBSTORM И VS CODE</text>
      <rect x={40} y={64} width={170} height={180} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={56} y={90} fontSize={13} fontWeight={700} fill="#fff">дерево файлов</text>
      <text x={56} y={110} fontSize={11.5} fontFamily={MONO} fill={FADE}>Project / Explorer</text>
      <text x={56} y={138} fontSize={11.5} fontFamily={MONO} fill={FADE}>src/</text>
      <text x={70} y={158} fontSize={11.5} fontFamily={MONO} fill="#fff">contract.ts</text>
      <text x={56} y={178} fontSize={11.5} fontFamily={MONO} fill={FADE}>package.json</text>
      <text x={56} y={198} fontSize={11.5} fontFamily={MONO} fill={FADE}>docker-compose.yml</text>
      <text x={56} y={218} fontSize={11.5} fontFamily={MONO} fill={FADE}>.gitignore</text>
      <rect x={222} y={64} width={340} height={180} rx={10} fill="rgba(0,0,0,0.22)" stroke={ACCENT} strokeWidth={3} />
      <text x={240} y={90} fontSize={13} fontWeight={700} fill="#fff">редактор — центр окна</text>
      <text x={240} y={120} fontSize={12} fontFamily={MONO} fill={ACCENT}>@Action()</text>
      <text x={240} y={142} fontSize={12} fontFamily={MONO} fill="#fff">increment() &#123; ... &#125;</text>
      <text x={240} y={176} fontSize={12} fill={FADE}>вкладки открытых файлов сверху,</text>
      <text x={240} y={196} fontSize={12} fill={FADE}>карта прокрутки справа</text>
      <rect x={574} y={64} width={186} height={180} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={590} y={90} fontSize={13} fontWeight={700} fill="#fff">git / Version Control</text>
      <text x={590} y={114} fontSize={11.5} fill={FADE}>изменённые файлы,</text>
      <text x={590} y={134} fontSize={11.5} fill={FADE}>diff, commit, история</text>
      <text x={590} y={168} fontSize={13} fontWeight={700} fill="#fff">панель проблем</text>
      <text x={590} y={192} fontSize={11.5} fill={FADE}>ошибки и предупреждения</text>
      <text x={590} y={212} fontSize={11.5} fill={FADE}>по всему проекту сразу</text>
      <rect x={40} y={256} width={720} height={54} rx={10} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={58} y={280} fontSize={13} fontWeight={700} fill="#fff">встроенный терминал</text>
      <text x={58} y={300} fontSize={12} fontFamily={MONO} fill={ACCENT}>npm run deploy · docker compose up -d · git status</text>
      <text x={520} y={290} fontSize={12.5} fill={FADE}>тот же терминал системы, только внутри окна</text>
    </Panel>
  ),
  /* открыть папку, а не файл: индексация, поиск и git появляются только у папки */
  'ed-project-vs-file': (aria) => (
    <Panel id="fig-ed-folder" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТКРЫТЬ ПАПКУ, А НЕ ОТДЕЛЬНЫЙ ФАЙЛ</text>
      <text x={40} y={78} fontSize={15} fontWeight={700} fill="#fff">открыт один файл</text>
      <rect x={40} y={92} width={330} height={170} rx={12} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} strokeDasharray="8 6" />
      <FileIcon x={64} y={112} />
      <text x={150} y={140} fontSize={12.5} fontFamily={MONO} fill="#fff">contract.ts</text>
      <text x={64} y={210} fontSize={12.5} fill={FADE}>нет поиска по проекту</text>
      <text x={64} y={230} fontSize={12.5} fill={FADE}>нет перехода к определению</text>
      <text x={64} y={250} fontSize={12.5} fill={FADE}>нет панели git</text>
      <Arrow x1={380} y1={176} x2={424} y2={176} color={ACCENT} w={4} />
      <text x={430} y={78} fontSize={15} fontWeight={700} fill="#fff">открыта папка проекта</text>
      <rect x={430} y={92} width={330} height={170} rx={12} fill="rgba(0,0,0,0.22)" stroke={ACCENT} strokeWidth={3} />
      <FileIcon x={452} y={112} accent />
      <text x={538} y={128} fontSize={12.5} fontFamily={MONO} fill="#fff">package.json</text>
      <text x={538} y={148} fontSize={12.5} fontFamily={MONO} fill="#fff">src/, .git/, .gitignore</text>
      <text x={452} y={196} fontSize={12.5} fill={ACCENT} fontWeight={600}>индексация: редактор знает все файлы</text>
      <text x={452} y={218} fontSize={12.5} fill={ACCENT} fontWeight={600}>поиск и замена по всему проекту</text>
      <text x={452} y={240} fontSize={12.5} fill={ACCENT} fontWeight={600}>git виден: ветка, diff, история</text>
      <text x={400} y={296} textAnchor="middle" fontSize={13.5} fill={FADE}>корень проекта — папка, где лежат package.json и .git: её и открывают, а не отдельный файл</text>
    </Panel>
  ),
  /* граница секретов: ключ и seed-фраза не пересекают линию репозитория */
  'ed-secrets-boundary': (aria) => (
    <Panel id="fig-ed-secrets" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КЛЮЧИ И SEED-ФРАЗА · ГРАНИЦА РЕПОЗИТОРИЯ</text>
      <rect x={40} y={70} width={330} height={200} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={58} y={98} fontSize={14} fontWeight={700} fill="#fff">попадает в git</text>
      <text x={58} y={128} fontSize={12.5} fontFamily={MONO} fill="#fff">src/contract.ts</text>
      <text x={58} y={152} fontSize={12.5} fontFamily={MONO} fill="#fff">package.json</text>
      <text x={58} y={176} fontSize={12.5} fontFamily={MONO} fill="#fff">.env.example</text>
      <text x={58} y={200} fontSize={12.5} fontFamily={MONO} fill="#fff">.gitignore</text>
      <text x={58} y={240} fontSize={12} fill={FADE}>только имена переменных,</text>
      <text x={58} y={258} fontSize={12} fill={FADE}>без единого значения</text>
      <path d="M400 60V286" stroke={ACCENT} strokeWidth={4} strokeDasharray="10 8" strokeLinecap="round" />
      <text x={400} y={54} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={ACCENT}>граница</text>
      <rect x={430} y={70} width={330} height={200} rx={12} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={3} />
      <text x={448} y={98} fontSize={14} fontWeight={700} fill={ACCENT}>остаётся только на твоей машине</text>
      <text x={448} y={128} fontSize={12.5} fontFamily={MONO} fill="#fff">.env</text>
      <text x={448} y={152} fontSize={12.5} fontFamily={MONO} fill="#fff">keystore ноды</text>
      <text x={448} y={176} fontSize={12.5} fontFamily={MONO} fill="#fff">seed-фраза</text>
      <text x={448} y={200} fontSize={12.5} fontFamily={MONO} fill="#fff">приватный ключ</text>
      <text x={448} y={240} fontSize={12} fill={FADE}>не в проекте, не в облачном</text>
      <text x={448} y={258} fontSize={12} fill={FADE}>помощнике, не в скриншоте</text>
      <text x={400} y={306} textAnchor="middle" fontSize={13.5} fill={FADE}>утёкший ключ отзывают, а не «удаляют коммит»: в истории git он останется</text>
    </Panel>
  ),
};
