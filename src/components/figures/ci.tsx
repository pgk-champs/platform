import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы про CI: анатомия workflow, чистый раннер, цепочка job-ов, красный лог. */

export const ciSchemes: Schemes = {
  /* какой ключ yml за что отвечает: name / on / jobs / runs-on / steps */
  'ci-workflow-anatomy': (aria) => (
    <Panel id="fig-ci-anatomy" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>WORKFLOW · ЧТО ЗА ЧТО ОТВЕЧАЕТ</text>
      <rect x={30} y={62} width={380} height={240} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={88} fontSize={12.5} fontFamily={MONO} fill={FADE}>.github/workflows/ci.yml</text>
      {[
        { t: 'name: ci', accent: false },
        { t: 'on: [push]', accent: true },
        { t: 'jobs:', accent: false },
        { t: '  test:', accent: false },
        { t: '    runs-on: ubuntu-latest', accent: true },
        { t: '    steps:', accent: false },
        { t: '      - uses: actions/checkout@v4', accent: true },
        { t: '      - run: npm test', accent: true },
      ].map((row, i) => (
        <text key={row.t} x={50} y={116 + i * 23} fontSize={12.5} fontFamily={MONO} fontWeight={row.accent ? 700 : 400} fill={row.accent ? ACCENT : '#fff'}>{row.t}</text>
      ))}
      {[
        { k: 'on', v: 'когда запускать' },
        { k: 'jobs', v: 'что запускать' },
        { k: 'runs-on', v: 'на какой машине' },
        { k: 'uses', v: 'готовый чужой шаг' },
        { k: 'run', v: 'своя команда в shell' },
      ].map((p, i) => (
        <g key={p.k}>
          <rect x={450} y={70 + i * 47} width={320} height={38} rx={9} fill={SOFT} stroke={i === 4 ? ACCENT : INK} strokeWidth={i === 4 ? 2.5 : 2} />
          <text x={468} y={95 + i * 47} fontSize={13} fontFamily={MONO} fontWeight={700} fill={ACCENT}>{p.k}</text>
          <text x={570} y={95 + i * 47} fontSize={12.5} fill="#fff">{p.v}</text>
        </g>
      ))}
      <text x={400} y={322} textAnchor="middle" fontSize={13} fill={FADE}>файл лежит только в .github/workflows — в другой папке GitHub его просто не увидит</text>
    </Panel>
  ),
  /* раннер стартует с пустой папкой: без checkout запускать нечего */
  'ci-checkout-empty': (aria) => (
    <Panel id="fig-ci-checkout" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ACTIONS/CHECKOUT · КОД НА РАННЕР НЕ ПОПАДАЕТ САМ</text>
      <rect x={30} y={64} width={350} height={180} rx={14} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={14} fontWeight={700} fill="#fff">без checkout</text>
      <text x={50} y={116} fontSize={12} fontFamily={MONO} fill={FADE}>рабочая папка раннера: пусто</text>
      <rect x={50} y={130} width={310} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} strokeDasharray="6 5" />
      <text x={205} y={158} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={FADE}>(нет файлов)</text>
      <text x={50} y={200} fontSize={12} fontFamily={MONO} fill="#fff">npm ci</text>
      <text x={50} y={222} fontSize={12} fontFamily={MONO} fill={ACCENT} fontWeight={700}>ENOENT: no such file package.json</text>
      <rect x={420} y={64} width={350} height={180} rx={14} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={14} fontWeight={700} fill="#fff">после actions/checkout@v4</text>
      <FileIcon x={444} y={106} accent />
      <text x={508} y={130} fontSize={13} fontFamily={MONO} fill="#fff">package.json</text>
      <text x={508} y={150} fontSize={13} fontFamily={MONO} fill="#fff">src/ · tests/</text>
      <text x={440} y={200} fontSize={12} fontFamily={MONO} fill="#fff">npm ci</text>
      <text x={440} y={222} fontSize={12} fontFamily={MONO} fill={ACCENT} fontWeight={700}>added 412 packages</text>
      <Arrow x1={385} y1={154} x2={415} y2={154} color={ACCENT} w={4} />
      <text x={400} y={276} textAnchor="middle" fontSize={13} fill={FADE}>раннер — чистая машина: без шага checkout репозиторий на неё не приезжает</text>
    </Panel>
  ),
  /* два job-а: артефакт из build уезжает в deploy, needs держит порядок */
  'ci-jobs-artifact': (aria) => (
    <Panel id="fig-ci-jobs" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>NEEDS И АРТЕФАКТЫ · ДВА JOB-А, РАЗНЫЕ МАШИНЫ</text>
      <rect x={40} y={70} width={260} height={150} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={170} y={100} textAnchor="middle" fontSize={15} fontWeight={700} fontFamily={MONO} fill="#fff">job: build</text>
      <text x={170} y={126} textAnchor="middle" fontSize={12} fill={FADE}>своя чистая машина</text>
      <text x={170} y={152} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">npm ci · npm test</text>
      <text x={170} y={174} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">npm run build → build/</text>
      <text x={170} y={200} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill={ACCENT}>upload-artifact</text>
      <rect x={330} y={110} width={140} height={70} rx={12} fill={ACCENT} />
      <text x={400} y={140} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK}>артефакт</text>
      <text x={400} y={162} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill={DARK}>site.zip</text>
      <Arrow x1={302} y1={145} x2={326} y2={145} color={ACCENT} w={4} />
      <Arrow x1={472} y1={145} x2={496} y2={145} color={ACCENT} w={4} />
      <rect x={500} y={70} width={260} height={150} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={630} y={100} textAnchor="middle" fontSize={15} fontWeight={700} fontFamily={MONO} fill="#fff">job: deploy</text>
      <text x={630} y={126} textAnchor="middle" fontSize={12} fontFamily={MONO} fontWeight={700} fill={ACCENT}>needs: build</text>
      <text x={630} y={152} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">download-artifact</text>
      <text x={630} y={178} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">rsync на сервер</text>
      <text x={630} y={202} textAnchor="middle" fontSize={12} fill={FADE}>тоже чистая машина</text>
      <text x={400} y={252} textAnchor="middle" fontSize={13} fill={FADE}>без needs job-ы стартуют одновременно; папка build/ из одного job-а во втором не существует</text>
      <text x={400} y={278} textAnchor="middle" fontSize={13} fill={FADE}>единственный мост между ними — артефакт</text>
    </Panel>
  ),
  /* красный лог: искать первую ошибку, а не последнюю строку */
  'ci-red-log': (aria) => (
    <Panel id="fig-ci-log" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КРАСНЫЙ ЛОГ · ЧИТАТЬ СВЕРХУ ВНИЗ</text>
      {[
        { t: 'Set up job', st: 'ok' },
        { t: 'actions/checkout@v4', st: 'ok' },
        { t: 'actions/setup-node@v4', st: 'ok' },
        { t: 'npm ci', st: 'ok' },
        { t: 'npm test', st: 'fail' },
        { t: 'npm run build', st: 'skip' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={40} y={70 + i * 40} width={330} height={32} rx={8} fill={row.st === 'fail' ? ACCENT : SOFT} stroke={row.st === 'fail' ? 'none' : INK} strokeWidth={2} opacity={row.st === 'skip' ? 0.4 : 1} />
          <text x={58} y={92 + i * 40} fontSize={12.5} fontFamily={MONO} fontWeight={row.st === 'fail' ? 700 : 400} fill={row.st === 'fail' ? DARK : '#fff'}>{row.t}</text>
          <text x={352} y={92 + i * 40} textAnchor="end" fontSize={12} fontWeight={700} fill={row.st === 'fail' ? DARK : FADE}>{row.st === 'ok' ? '✓' : row.st === 'fail' ? '✕' : '—'}</text>
        </g>
      ))}
      <text x={40} y={318} fontSize={12} fill={FADE}>шаги после упавшего не выполняются</text>
      <Arrow x1={380} y1={250} x2={430} y2={250} color={ACCENT} w={4} />
      <rect x={440} y={80} width={330} height={190} rx={12} fill="rgba(0,0,0,0.28)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={458} y={106} fontSize={12} fontFamily={MONO} fontWeight={700} fill={ACCENT}>FAIL tests/cart.test.js</text>
      <text x={458} y={128} fontSize={12} fontFamily={MONO} fill="#fff">expected 200, received 500</text>
      <text x={458} y={150} fontSize={12} fontFamily={MONO} fill={FADE}>at total (src/cart.js:42)</text>
      <text x={458} y={182} fontSize={12} fontFamily={MONO} fill={FADE}>Tests: 1 failed, 23 passed</text>
      <text x={458} y={204} fontSize={12} fontFamily={MONO} fill={FADE}>npm ERR! code ELIFECYCLE</text>
      <text x={458} y={226} fontSize={12} fontFamily={MONO} fill={FADE}>Error: Process exited with 1</text>
      <text x={458} y={256} fontSize={11.5} fontWeight={700} fill={ACCENT}>↑ последние строки — только эхо</text>
      <text x={605} y={296} textAnchor="middle" fontSize={13} fill={FADE}>причина — в первой красной строке</text>
    </Panel>
  ),
};
