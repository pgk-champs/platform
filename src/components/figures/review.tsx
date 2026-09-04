import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Ревью, коммиты, релизы»: атомарный коммит, анатомия PR,
 * защита main и путь от коммита к релизу. */

export const reviewSchemes: Schemes = {
  /* каша в одном коммите против трёх осмысленных, разложенных через git add -p */
  'commit-atom': (aria) => (
    <Panel id="fig-rev-atom" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОММИТ · ОДНА ЕДИНИЦА СМЫСЛА</text>
      <text x={40} y={78} fontSize={13} fontWeight={700} fill={FADE}>было: одна куча</text>
      <rect x={40} y={92} width={260} height={110} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={58} y={122} fontSize={14} fontFamily={MONO} fontWeight={700} fill="#fff">фикс</text>
      <text x={58} y={148} fontSize={11.5} fill={FADE}>парсер + вёрстка + README</text>
      <text x={58} y={168} fontSize={11.5} fill={FADE}>+ переименование класса</text>
      <text x={58} y={188} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>412 строк в 9 файлах</text>
      <Arrow x1={312} y1={147} x2={392} y2={147} color={ACCENT} w={4} />
      <text x={352} y={128} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>git add -p</text>
      <text x={430} y={78} fontSize={13} fontWeight={700} fill={FADE}>стало: три коммита</text>
      {[
        'fix(parser): пустая строка',
        'feat(ui): кнопка экспорта',
        'docs: раздел про запуск',
      ].map((t, i) => (
        <g key={t}>
          <rect x={410} y={92 + i * 40} width={350} height={32} rx={8} fill={i === 0 ? ACCENT : SOFT} stroke={i === 0 ? 'none' : INK} strokeWidth={2} />
          <text x={428} y={114 + i * 40} fontSize={12.5} fontFamily={MONO} fontWeight={i === 0 ? 700 : 400} fill={i === 0 ? DARK : '#fff'}>{t}</text>
        </g>
      ))}
      <text x={585} y={238} textAnchor="middle" fontSize={11.5} fill={FADE}>каждый можно отдельно понять, отменить и попасть с ним в changelog</text>
      <text x={400} y={286} textAnchor="middle" fontSize={13} fill={FADE}>git add -p раскладывает кучу правок по осмысленным коммитам: один коммит — одно изменение</text>
    </Panel>
  ),
  /* из чего состоит хороший pull request */
  'pr-anatomy': (aria) => (
    <Panel id="fig-rev-pr" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>PULL REQUEST · ЧТО ЧИТАЕТ РЕВЬЮЕР</text>
      <rect x={40} y={62} width={720} height={46} rx={10} fill={ACCENT} />
      <text x={60} y={92} fontSize={15} fontWeight={800} fontFamily={MONO} fill={DARK}>feat(export): выгрузка отчёта в CSV</text>
      <text x={640} y={92} fontSize={11.5} fontWeight={700} fill={DARK}>+186 −24</text>
      {[
        { h: 'Что', t: 'добавил кнопку «Скачать CSV» и сервис выгрузки' },
        { h: 'Зачем', t: 'по задаче #12: бухгалтерия просила выгрузку без ручного копирования' },
        { h: 'Как проверить', t: '1) открыть /reports 2) нажать «Скачать CSV» 3) в файле 3 строки и заголовок' },
      ].map((row, i) => (
        <g key={row.h}>
          <rect x={40} y={124 + i * 52} width={720} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={60} y={152 + i * 52} fontSize={13} fontWeight={800} fill={ACCENT}>{row.h}</text>
          <text x={190} y={152 + i * 52} fontSize={12.5} fill="#fff">{row.t}</text>
        </g>
      ))}
      <rect x={40} y={280} width={340} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={60} y={306} fontSize={13} fontFamily={MONO} fontWeight={700} fill={ACCENT}>Closes #12</text>
      <text x={180} y={306} fontSize={11.5} fill={FADE}>issue закроется сам</text>
      <rect x={400} y={280} width={360} height={40} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <FileIcon x={416} y={284} accent />
      <text x={484} y={306} fontSize={12} fill="#fff">скриншот, если менялся интерфейс</text>
    </Panel>
  ),
  /* прямой push в main отбит: путь только через PR с зелёными проверками */
  'main-protection': (aria) => (
    <Panel id="fig-rev-protect" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАЩИТА MAIN · ДВЕРЬ ОДНА</text>
      <rect x={40} y={70} width={150} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={115} y={101} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">git push main</text>
      <Arrow x1={200} y1={95} x2={296} y2={95} color={FADE} w={4} />
      <path d="M300 72L340 118M340 72L300 118" stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
      <text x={360} y={92} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>! [remote rejected]</text>
      <text x={360} y={112} fontSize={11.5} fill={FADE}>protected branch hook declined</text>
      <rect x={40} y={170} width={150} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={115} y={201} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">ветка → PR</text>
      <Arrow x1={200} y1={195} x2={266} y2={195} color={ACCENT} w={4} />
      <rect x={276} y={168} width={170} height={54} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={361} y={190} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">required checks</text>
      <text x={361} y={210} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>tests · lint · build</text>
      <Arrow x1={456} y1={195} x2={512} y2={195} color={ACCENT} w={4} />
      <rect x={522} y={168} width={130} height={54} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={587} y={190} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">approve</text>
      <text x={587} y={210} textAnchor="middle" fontSize={11.5} fill={FADE}>ревьюер</text>
      <Arrow x1={662} y1={195} x2={706} y2={195} color={ACCENT} w={4} />
      <rect x={700} y={168} width={70} height={54} rx={10} fill={ACCENT} />
      <text x={735} y={201} textAnchor="middle" fontSize={14} fontWeight={800} fontFamily={MONO} fill={DARK}>main</text>
      <text x={400} y={274} textAnchor="middle" fontSize={13} fill={FADE}>прямой push отбивает сервер; единственный путь в main — PR с зелёным CI и одобрением</text>
    </Panel>
  ),
  /* коммиты → changelog → номер версии → тег и release */
  'release-pipeline': (aria) => (
    <Panel id="fig-rev-release" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТ КОММИТА ДО РЕЛИЗА</text>
      <text x={40} y={78} fontSize={13} fontWeight={700} fill={FADE}>коммиты</text>
      {[
        { t: 'feat(export): CSV', k: 'Added' },
        { t: 'fix(auth): пустой токен', k: 'Fixed' },
        { t: 'BREAKING CHANGE', k: 'Changed' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={40} y={92 + i * 52} width={230} height={40} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={56} y={117 + i * 52} fontSize={12} fontFamily={MONO} fill="#fff">{row.t}</text>
          <Arrow x1={280} y1={112 + i * 52} x2={330} y2={112 + i * 52} color={ACCENT} w={3.5} />
          <rect x={340} y={92 + i * 52} width={150} height={40} rx={8} fill={i === 2 ? ACCENT : SOFT} stroke={i === 2 ? 'none' : INK} strokeWidth={2} />
          <text x={415} y={117 + i * 52} textAnchor="middle" fontSize={13} fontWeight={700} fill={i === 2 ? DARK : '#fff'}>{row.k}</text>
        </g>
      ))}
      <text x={415} y={78} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>CHANGELOG.md</text>
      <Arrow x1={500} y1={164} x2={556} y2={164} color={ACCENT} w={4} />
      <text x={640} y={78} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>версия и тег</text>
      <rect x={566} y={92} width={200} height={54} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={666} y={126} textAnchor="middle" fontSize={20} fontWeight={800} fontFamily={MONO} fill={ACCENT}>2.0.0</text>
      <text x={666} y={166} textAnchor="middle" fontSize={11.5} fill={FADE}>MAJOR подняли из-за BREAKING</text>
      <rect x={566} y={182} width={200} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={666} y={210} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">git tag -a v2.0.0</text>
      <rect x={566} y={236} width={200} height={44} rx={10} fill={ACCENT} />
      <text x={666} y={264} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fontWeight={700} fill={DARK}>GitHub Release</text>
      <text x={400} y={314} textAnchor="middle" fontSize={13} fill={FADE}>слова из коммитов становятся разделами changelog, changelog — номером версии, версия — тегом и релизом</text>
    </Panel>
  ),
};
