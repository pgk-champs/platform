import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Сдача работы»: что видит эксперт при клонировании,
 * почему секрет остаётся в истории и чек-лист перед сдачей. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const sdachaRepoSchemes: Schemes = {
  'sd-clean-clone': (aria) => (
    <Panel id="fig-sd-clone" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>У ВАС НА МАШИНЕ И В ЧИСТОМ КЛОНЕ — РАЗНЫЕ ПРОЕКТЫ</text>

      <rect x={30} y={64} width={370} height={158} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">У вас в папке</text>
      {['node_modules/', 'dist/', '.env', 'tsconfig.json', 'package-lock.json', 'src/'].map((f, i) => (
        <text key={f} x={50} y={120 + i * 20} fontSize={11} fontFamily={MONO} fill={FADE}>{f}</text>
      ))}

      <Arrow x1={414} y1={140} x2={466} y2={140} color={ACCENT} w={2.4} />
      <text x={440} y={128} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>clone</text>

      <rect x={480} y={64} width={310} height={158} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={500} y={92} fontSize={12} fontWeight={700} fill="#fff">У эксперта после клонирования</text>
      <text x={500} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>package.json</text>
      <text x={500} y={140} fontSize={11} fontFamily={MONO} fill={ACCENT}>src/</text>
      <text x={500} y={166} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>tsconfig.json — нет</text>
      <text x={500} y={186} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>package-lock.json — нет</text>
      <text x={500} y={206} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>README — нет</text>

      <text x={30} y={256} fontSize={12.5} fill="#fff">«у меня работает» ничего не значит: проверяют то, что в репозитории, а не то, что на диске</text>
      <text x={30} y={282} fontSize={12.5} fill={FADE}>единственная честная проверка — склонировать в новую папку и собрать с нуля</text>
    </Panel>
  ),

  'sd-secret-history': (aria) => (
    <Panel id="fig-sd-sec" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>УДАЛИТЬ ФАЙЛ НЕ ЗНАЧИТ УДАЛИТЬ СЕКРЕТ</text>

      <rect x={30} y={64} width={350} height={64} rx={10} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={90} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>коммит 1: .env с сид-фразой</text>
      <text x={50} y={114} fontSize={11} fill={FADE}>попал в историю навсегда</text>

      <Arrow x1={205} y1={134} x2={205} y2={160} color={INK} w={2.2} />

      <rect x={30} y={166} width={350} height={64} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={192} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>коммит 2: .gitignore, git rm --cached</text>
      <text x={50} y={216} fontSize={11} fill={FADE}>в рабочей копии чисто</text>

      <rect x={410} y={64} width={380} height={166} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={430} y={92} fontSize={12} fontWeight={700} fill={RED_TEXT}>А секрет достаётся одной командой</text>
      <text x={430} y={122} fontSize={11} fontFamily={MONO} fill="#fff">git show HEAD~1:.env</text>
      <text x={430} y={150} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>SEED=olegs test seed for pgk…</text>
      <text x={430} y={182} fontSize={11.5} fill="#fff">единственное лечение — сменить ключ,</text>
      <text x={430} y={204} fontSize={11.5} fill="#fff">а не переписать историю</text>

      <text x={30} y={266} fontSize={12.5} fill={ACCENT}>ключ считается скомпрометированным с момента попадания в историю, даже приватного репозитория</text>
    </Panel>
  ),

  'sd-checklist': (aria) => (
    <Panel id="fig-sd-check" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЕМЬ ПРОВЕРОК ПЕРЕД ТЕМ, КАК ПОДНЯТЬ РУКУ</text>

      {[
        { y: 62, n: '1', t: 'склонировал в новую папку и собрал с нуля' },
        { y: 98, n: '2', t: 'в репозитории нет node_modules, dist и .env' },
        { y: 134, n: '3', t: 'файл блокировки версий закоммичен' },
        { y: 170, n: '4', t: 'README: как запустить, три команды подряд' },
        { y: 206, n: '5', t: 'есть .env.example со списком переменных' },
        { y: 242, n: '6', t: 'грепнул историю и код на ключи и пароли' },
        { y: 278, n: '7', t: 'программа без настроек падает понятно, а не стеком' },
      ].map((r) => (
        <g key={r.y}>
          <circle cx={48} cy={r.y + 12} r={13} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={48} y={r.y + 17} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">{r.n}</text>
          <text x={78} y={r.y + 17} fontSize={12.5} fill="#fff">{r.t}</text>
        </g>
      ))}
    </Panel>
  ),
};
