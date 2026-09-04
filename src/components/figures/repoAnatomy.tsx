import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Анатомия взрослого репозитория»: первое впечатление,
 * скелет README, git rm --cached и раскладка каталогов. */

export const repoAnatomySchemes: Schemes = {
  /* 30 секунд чужого взгляда: свалка в корне против собранного корня */
  'repo-first-impression': (aria) => (
    <Panel id="fig-repo-first" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЕРВЫЕ 30 СЕКУНД ЧУЖОГО ВЗГЛЯДА</text>
      <rect x={30} y={64} width={350} height={210} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={14} fontWeight={700} fill="#fff">свалка</text>
      {['new 1.py', 'проект_финал(2).py', 'test.py', 'venv/', '.env', 'скрин.png'].map((t, i) => (
        <text key={t} x={50} y={122 + i * 24} fontSize={13} fontFamily={MONO} fill={FADE}>{t}</text>
      ))}
      <text x={50} y={266} fontSize={12} fill={FADE}>ни README, ни .gitignore</text>
      <rect x={420} y={64} width={350} height={210} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={14} fontWeight={700} fill="#fff">собранный корень</text>
      {['README.md', 'LICENSE', '.gitignore', '.env.example', 'src/', 'tests/'].map((t, i) => (
        <text key={t} x={440} y={122 + i * 24} fontSize={13} fontFamily={MONO} fill={i < 4 ? ACCENT : '#fff'}>{t}</text>
      ))}
      <text x={440} y={266} fontSize={12} fill={FADE}>видно, что за проект и как запустить</text>
      <text x={205} y={302} textAnchor="middle" fontSize={13} fontWeight={700} fill={FADE}>«не буду разбираться»</text>
      <text x={595} y={302} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT}>«похоже на рабочий проект»</text>
    </Panel>
  ),
  /* порядок разделов README сверху вниз */
  'readme-skeleton': (aria) => (
    <Panel id="fig-repo-readme" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>README · ПОРЯДОК РАЗДЕЛОВ СВЕРХУ ВНИЗ</text>
      {[
        { t: '# Название + одна строка «что это»', n: 'читают всегда — даже когда дальше не листают' },
        { t: 'Зачем и для кого', n: 'какую задачу решает, кому пригодится' },
        { t: 'Скриншот или пример вывода', n: 'быстрее любого абзаца текста' },
        { t: 'Как запустить', n: 'команды подряд, копируются без правок' },
        { t: 'Стек и структура', n: 'на чём написано, где что лежит' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={40} y={62 + i * 50} width={640} height={42} rx={10} fill={i === 0 ? ACCENT : SOFT} stroke={i === 0 ? 'none' : INK} strokeWidth={2} />
          <text x={58} y={82 + i * 50} fontSize={13} fontWeight={700} fill={i === 0 ? DARK : '#fff'}>{row.t}</text>
          <text x={58} y={98 + i * 50} fontSize={11.5} fill={i === 0 ? DARK : FADE}>{row.n}</text>
        </g>
      ))}
      <Arrow x1={710} y1={72} x2={710} y2={294} color={ACCENT} w={4} />
      <text x={400} y={318} textAnchor="middle" fontSize={13} fill={FADE}>сверху то, что нужно чужому человеку в первую минуту; подробности — ниже</text>
    </Panel>
  ),
  /* git rm --cached убирает файл из индекса, но не из истории */
  'gitignore-already-tracked': (aria) => (
    <Panel id="fig-repo-cached" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>МУСОР УЖЕ ЗАКОММИЧЕН · GIT RM --CACHED</text>
      <rect x={30} y={70} width={210} height={120} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={135} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">рабочая папка</text>
      <FileIcon x={100} y={110} />
      <text x={135} y={182} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={FADE}>.env остаётся у тебя</text>
      <Arrow x1={250} y1={130} x2={310} y2={130} color={ACCENT} w={4} />
      <text x={280} y={112} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>rm --cached</text>
      <rect x={320} y={70} width={210} height={120} rx={14} fill="rgba(0,0,0,0.25)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={425} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">индекс git</text>
      <text x={425} y={140} textAnchor="middle" fontSize={26} fontWeight={800} fill={ACCENT}>пусто</text>
      <text x={425} y={182} textAnchor="middle" fontSize={12} fill={FADE}>файл больше не отслеживается</text>
      <rect x={570} y={70} width={200} height={120} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={670} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">история коммитов</text>
      <text x={670} y={136} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>.env всё ещё тут</text>
      <text x={670} y={162} textAnchor="middle" fontSize={11.5} fill={FADE}>любой старый коммит</text>
      <text x={670} y={178} textAnchor="middle" fontSize={11.5} fill={FADE}>отдаёт его целиком</text>
      <text x={400} y={244} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff">утёкший ключ спасает только отзыв ключа — не удаление файла и не приватность репозитория</text>
      <text x={400} y={286} textAnchor="middle" fontSize={13} fill={FADE}>git rm --cached снимает файл с учёта на будущее; прошлые коммиты остаются нетронутыми</text>
    </Panel>
  ),
  /* раскладка каталогов: корень-витрина, код и тесты по папкам */
  'repo-layout-tree': (aria) => (
    <Panel id="fig-repo-layout" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>РАСКЛАДКА КАТАЛОГОВ · КОРЕНЬ ЭТО ВИТРИНА</text>
      <rect x={40} y={64} width={300} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={58} y={90} fontSize={13} fontWeight={700} fill={ACCENT}>в корне — только «документы»</text>
      {['README.md', 'LICENSE', '.gitignore', '.editorconfig'].map((t, i) => (
        <text key={t} x={58} y={116 + i * 22} fontSize={13} fontFamily={MONO} fill="#fff">{t}</text>
      ))}
      <Arrow x1={190} y1={214} x2={190} y2={252} color={ACCENT} w={4} />
      {[
        { d: 'src/', n: 'весь код проекта' },
        { d: 'tests/', n: 'проверки, отдельно от кода' },
        { d: 'docs/', n: 'длинные тексты и картинки' },
      ].map((row, i) => (
        <g key={row.d}>
          <rect x={400} y={64 + i * 62} width={360} height={50} rx={12} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2} />
          <text x={422} y={86 + i * 62} fontSize={15} fontWeight={800} fontFamily={MONO} fill={ACCENT}>{row.d}</text>
          <text x={422} y={104 + i * 62} fontSize={12} fill={FADE}>{row.n}</text>
        </g>
      ))}
      <rect x={40} y={252} width={300} height={48} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2} strokeDasharray="6 5" />
      <text x={190} y={274} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">имена латиницей, без пробелов</text>
      <text x={190} y={292} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={FADE}>user_service.py, не «Новый 1.py»</text>
      <text x={580} y={300} textAnchor="middle" fontSize={13} fill={FADE}>по названию папки понятно, что внутри — без чтения файлов</text>
    </Panel>
  ),
};
