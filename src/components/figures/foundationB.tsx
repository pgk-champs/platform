import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы глав Фундамента 04-08 (файлы/пакеты/SSH, git×3, Android Studio). */

export const foundationBSchemes: Schemes = {
  /* student → sudo + пароль → root на одну команду → снова student */
  'sudo-elevation': (aria) => (
    <Panel id="fig-b-sudo" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SUDO · ВРЕМЕННОЕ ПОВЫШЕНИЕ ПРАВ</text>
      <circle cx={130} cy={155} r={60} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={130} y={150} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>student</text>
      <text x={130} y={172} textAnchor="middle" fontSize={12.5} fill={FADE}>обычный пользователь</text>
      <Arrow x1={196} y1={140} x2={318} y2={110} color={ACCENT} w={5} />
      <text x={257} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>sudo + пароль</text>
      <circle cx={400} cy={155} r={68} fill={ACCENT} />
      <text x={400} y={150} textAnchor="middle" fontSize={18} fontWeight={800} fill={DARK} fontFamily={MONO}>root</text>
      <text x={400} y={173} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={DARK}>на одну команду</text>
      <Arrow x1={482} y1={140} x2={604} y2={110} color={INK} w={5} />
      <text x={543} y={96} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>команда выполнена</text>
      <circle cx={670} cy={155} r={60} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={670} y={150} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>student</text>
      <text x={670} y={172} textAnchor="middle" fontSize={12.5} fill={FADE}>снова обычный</text>
      <text x={400} y={250} textAnchor="middle" fontSize={14} fill={FADE}>root — не отдельный вход, а секунда одолженных прав внутри той же сессии</text>
    </Panel>
  ),
  /* репозиторий в интернете → apt update (только список) / apt install (пакет целиком) → твоя машина */
  'apt-repo-flow': (aria) => (
    <Panel id="fig-b-apt" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>APT · ОТКУДА БЕРУТСЯ ПАКЕТЫ</text>
      <rect x={80} y={130} width={210} height={115} rx={10} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={185} y={158} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">локальный список</text>
      <FileIcon x={130} y={172} />
      <FileIcon x={190} y={172} accent />
      <text x={185} y={282} textAnchor="middle" fontSize={16} fontWeight={600} fill="#fff">твоя машина</text>
      <g fill={ACCENT} opacity={0.92}>
        <rect x={520} y={72} width={190} height={50} rx={25} />
        <circle cx={580} cy={62} r={30} />
        <circle cx={636} cy={52} r={38} />
      </g>
      <text x={615} y={158} textAnchor="middle" fontSize={16} fontWeight={600} fill="#fff">репозиторий (сервер)</text>
      <Arrow x1={300} y1={150} x2={498} y2={104} color={FADE} w={4} />
      <text x={392} y={104} textAnchor="middle" fontSize={14} fontWeight={700} fill={FADE} fontFamily={MONO}>apt update</text>
      <text x={392} y={122} textAnchor="middle" fontSize={11.5} fill={FADE}>только сверить список</text>
      <Arrow x1={520} y1={180} x2={322} y2={226} color={ACCENT} w={6} />
      <text x={440} y={230} textAnchor="middle" fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO}>apt install tree</text>
      <text x={440} y={248} textAnchor="middle" fontSize={11.5} fill={FADE}>пакет целиком приезжает на диск</text>
    </Panel>
  ),
  /* закрытый ключ остаётся под замком дома (600), открытый уезжает на сервер в authorized_keys (644) */
  'ssh-keypair': (aria) => (
    <Panel id="fig-b-sshkey" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SSH · КЛЮЧЕВАЯ ПАРА</text>
      <rect x={60} y={80} width={260} height={160} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={190} y={110} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>id_ed25519</text>
      <text x={190} y={130} textAnchor="middle" fontSize={13} fill={FADE}>закрытый (private)</text>
      <circle cx={190} cy={178} r={22} fill="none" stroke={ACCENT} strokeWidth={5} />
      <rect x={172} y={186} width={36} height={26} rx={5} fill={ACCENT} />
      <text x={190} y={228} textAnchor="middle" fontSize={22} fontWeight={800} fill={ACCENT} fontFamily={MONO}>600</text>
      <text x={190} y={256} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">не покидает твой компьютер</text>
      <rect x={480} y={80} width={260} height={160} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={610} y={110} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>id_ed25519.pub</text>
      <text x={610} y={130} textAnchor="middle" fontSize={13} fill={FADE}>открытый (public)</text>
      <circle cx={610} cy={178} r={22} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="5 5" />
      <rect x={592} y={186} width={36} height={26} rx={5} fill="none" stroke="#fff" strokeWidth={3.5} />
      <text x={610} y={228} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>644</text>
      <text x={610} y={256} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">едет на сервер, в authorized_keys</text>
      <Arrow x1={330} y1={160} x2={470} y2={160} color={ACCENT} w={5} />
      <text x={400} y={144} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>отдавать можно смело</text>
    </Panel>
  ),
  /* HEAD не хранит коммит сам — смотрит на имя ветки, а та уже смотрит на коммит */
  'git-head-pointer': (aria) => (
    <Panel id="fig-b-head" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · КУДА СМОТРИТ HEAD</text>
      <rect x={60} y={90} width={170} height={80} rx={12} fill={ACCENT} />
      <text x={145} y={140} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>HEAD</text>
      <Arrow x1={230} y1={130} x2={358} y2={130} color={ACCENT} w={5} />
      <rect x={368} y={90} width={280} height={80} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={508} y={132} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>refs/heads/master</text>
      <text x={508} y={152} textAnchor="middle" fontSize={12} fill={FADE}>файл с одним hash внутри</text>
      <Arrow x1={648} y1={130} x2={706} y2={130} color={INK} w={5} />
      <circle cx={740} cy={130} r={30} fill="none" stroke={INK} strokeWidth={5} />
      <text x={400} y={210} textAnchor="middle" fontSize={14} fill={FADE}>ref: refs/heads/master — HEAD указывает на ветку, ветка указывает на коммит</text>
      <text x={400} y={232} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">новый коммит — сдвигается ветка, а вместе с ней и HEAD</text>
    </Panel>
  ),
  /* hash/author/date вычисляет Git сам; message — единственное поле, которое пишет человек */
  'commit-anatomy': (aria) => (
    <Panel id="fig-b-commitanatomy" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · ЧТО ВНУТРИ КОММИТА</text>
      {[
        { label: 'hash', value: '5ecfe79…', who: 'Git вычисляет сам' },
        { label: 'author', value: 'Ivan Petrov', who: 'из git config' },
        { label: 'date', value: '31 Aug 19:22', who: 'системные часы' },
      ].map((row, i) => (
        <g key={row.label}>
          <rect x={60} y={64 + i * 54} width={140} height={40} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={130} y={90 + i * 54} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>{row.label}</text>
          <text x={216} y={90 + i * 54} fontSize={14} fill={FADE} fontFamily={MONO}>{row.value}</text>
          <text x={620} y={90 + i * 54} textAnchor="end" fontSize={13} fill={FADE}>{row.who}</text>
        </g>
      ))}
      <rect x={60} y={226} width={140} height={44} rx={8} fill={ACCENT} />
      <text x={130} y={254} textAnchor="middle" fontSize={15} fontWeight={800} fill={DARK} fontFamily={MONO}>message</text>
      <text x={216} y={254} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>&quot;add main screen&quot;</text>
      <text x={620} y={254} textAnchor="end" fontSize={13} fontWeight={800} fill={ACCENT}>пишешь ты сам</text>
      <text x={400} y={292} textAnchor="middle" fontSize={13} fill={FADE}>из четырёх полей коммита руками задаётся только одно</text>
    </Panel>
  ),
  /* файлы просеиваются через .gitignore: совпавшие остаются на диске, но Git их больше не показывает */
  'gitignore-filter': (aria) => (
    <Panel id="fig-b-gitignore" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>.GITIGNORE · ЧТО ОТСЕИВАЕТСЯ</text>
      <text x={130} y={80} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">в папке на диске</text>
      <FileIcon x={70} y={96} />
      <text x={100} y={186} textAnchor="middle" fontSize={12} fill={FADE} fontFamily={MONO}>main.py</text>
      <FileIcon x={170} y={96} accent />
      <text x={200} y={186} textAnchor="middle" fontSize={12} fill={FADE} fontFamily={MONO}>draft.txt</text>
      <rect x={330} y={110} width={130} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={395} y={140} textAnchor="middle" fontSize={13} fontWeight={800} fill="#fff" fontFamily={MONO}>.gitignore</text>
      <text x={395} y={162} textAnchor="middle" fontSize={12} fill={FADE}>фильтр по шаблонам</text>
      <Arrow x1={250} y1={130} x2={320} y2={140} color={INK} w={4} />
      <Arrow x1={470} y1={135} x2={590} y2={110} color={INK} w={5} />
      <text x={650} y={104} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>git status</text>
      <text x={650} y={122} textAnchor="middle" fontSize={12} fill={FADE}>видит main.py</text>
      <Arrow x1={460} y1={170} x2={590} y2={220} color={ACCENT} w={5} />
      <text x={650} y={214} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>draft.txt</text>
      <text x={650} y={232} textAnchor="middle" fontSize={12} fill={FADE}>отфильтрован — Git молчит</text>
      <text x={400} y={276} textAnchor="middle" fontSize={13} fill={FADE}>сам файл никуда не делся с диска — просто Git перестал его показывать</text>
    </Panel>
  ),
  /* master стоит на месте, feature-scoreboard уезжает вперёд вместе с HEAD */
  'branch-pointer-move': (aria) => (
    <Panel id="fig-b-branchmove" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · MASTER НЕ ШЕВЕЛИТСЯ</text>
      <path d="M80 170h640" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={130} cy={170} r={12} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={300} cy={170} r={13} fill="none" stroke={INK} strokeWidth={5} />
      <circle cx={470} cy={170} r={12} fill="none" stroke={ACCENT} strokeWidth={5} />
      <circle cx={640} cy={170} r={16} fill={ACCENT} />
      <rect x={252} y={206} width={96} height={36} rx={8} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={300} y={230} textAnchor="middle" fontSize={14} fontWeight={800} fill="#fff" fontFamily={MONO}>master</text>
      <path d="M300 206v-23" stroke={INK} strokeWidth={3} />
      <rect x={540} y={86} width={200} height={36} rx={8} fill={ACCENT} />
      <text x={640} y={110} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK} fontFamily={MONO}>feature-scoreboard</text>
      <path d="M640 122v32" stroke={ACCENT} strokeWidth={3} />
      <text x={400} y={262} textAnchor="middle" fontSize={13} fill={FADE}>обе закладки стартовали в одной точке — feature-scoreboard уехала вперёд на два коммита, master ждёт на месте</text>
    </Panel>
  ),
  /* слева — перемотка (метка едет вперёд по прямой), справа — настоящее слияние (новый коммит с двумя родителями) */
  'fast-forward-vs-merge': (aria) => (
    <Panel id="fig-b-ffvsmerge" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT MERGE · ДВА СЦЕНАРИЯ</text>
      <text x={195} y={72} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT} fontFamily={MONO}>fast-forward</text>
      <path d="M60 170h270" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <circle cx={90} cy={170} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={195} cy={170} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <circle cx={300} cy={170} r={14} fill={ACCENT} />
      <Arrow x1={195} y1={210} x2={296} y2={210} color={ACCENT} w={4} />
      <text x={247} y={232} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>метка едет вперёд</text>
      <text x={195} y={256} textAnchor="middle" fontSize={12.5} fill={FADE}>новый коммит не создаётся</text>
      <path d="M400 20v260" stroke="rgba(255,255,255,0.18)" strokeWidth={2} strokeDasharray="6 6" />
      <text x={605} y={72} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT} fontFamily={MONO}>three-way merge</text>
      <circle cx={460} cy={200} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <path d="M460 200L560 140" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <circle cx={560} cy={140} r={11} fill="none" stroke={INK} strokeWidth={4} />
      <path d="M460 200L560 190" stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      <circle cx={560} cy={190} r={11} fill="none" stroke={ACCENT} strokeWidth={4} />
      <path d="M560 140L660 165" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M560 190L660 165" stroke={ACCENT} strokeWidth={4} strokeLinecap="round" />
      <circle cx={660} cy={165} r={15} fill={ACCENT} />
      <text x={585} y={232} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>merge-коммит: два родителя</text>
      <text x={585} y={252} textAnchor="middle" fontSize={12.5} fill={FADE}>обе ветки успели уйти вперёд</text>
    </Panel>
  ),
  /* один файл, две версии одной строки: маркеры <<<<<<< HEAD / ======= / >>>>>>> */
  'merge-conflict': (aria) => (
    <Panel id="fig-b-conflict" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT · РАЗМЕТКА КОНФЛИКТА</text>
      <rect x={80} y={64} width={640} height={210} rx={12} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={104} y={92} fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>main.py</text>
      <g fontFamily={MONO} fontSize={15}>
        <text x={104} y={124} fill={FADE} fontWeight={700}>{'<<<<<<< HEAD'}</text>
        <rect x={100} y={134} width={600} height={28} rx={6} fill="rgba(255,255,255,0.12)" />
        <text x={112} y={154} fill="#fff">print(&quot;Привет, чемпионы!&quot;)</text>
        <text x={104} y={190} fill={FADE} fontWeight={700}>{'======='}</text>
        <rect x={100} y={198} width={600} height={28} rx={6} fill={ACCENT} opacity={0.85} />
        <text x={112} y={218} fill={DARK} fontWeight={700}>print(&quot;Привет, финалисты!&quot;)</text>
        <text x={104} y={252} fill={FADE} fontWeight={700}>{'>>>>>>> feature-name-fix'}</text>
      </g>
      <text x={400} y={294} textAnchor="middle" fontSize={13} fill={FADE}>между маркерами — твоя версия (HEAD) сверху, версия вливаемой ветки снизу</text>
    </Panel>
  ),
  /* clone: прямая копия без прав на запись в оригинал. Fork → clone: сначала своя копия на GitHub */
  'clone-vs-fork': (aria) => (
    <Panel id="fig-b-clonefork" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT CLONE ПРОТИВ FORK</text>
      <text x={185} y={72} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff" fontFamily={MONO}>git clone</text>
      <rect x={110} y={92} width={150} height={56} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={185} y={126} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">чужой репозиторий</text>
      <Arrow x1={185} y1={148} x2={185} y2={206} color={INK} w={5} />
      <rect x={110} y={216} width={150} height={56} rx={10} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={185} y={250} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">твой диск</text>
      <text x={185} y={288} textAnchor="middle" fontSize={12} fill={FADE}>push только если есть право записи</text>
      <path d="M400 20v260" stroke="rgba(255,255,255,0.18)" strokeWidth={2} strokeDasharray="6 6" />
      <text x={615} y={72} textAnchor="middle" fontSize={15} fontWeight={800} fill={ACCENT} fontFamily={MONO}>Fork → git clone</text>
      <rect x={540} y={92} width={150} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={615} y={122} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">чужой репозиторий</text>
      <Arrow x1={615} y1={142} x2={615} y2={180} color={ACCENT} w={5} />
      <text x={690} y={166} fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>Fork</text>
      <rect x={540} y={188} width={150} height={50} rx={10} fill={ACCENT} />
      <text x={615} y={218} textAnchor="middle" fontSize={13} fontWeight={700} fill={DARK}>твой форк на GitHub</text>
      <Arrow x1={615} y1={238} x2={615} y2={276} color={INK} w={5} />
      <text x={615} y={294} textAnchor="middle" fontSize={12} fill={FADE}>push всегда — это твой репозиторий</text>
    </Panel>
  ),
  /* git fetch подтягивает origin/main, но рабочую копию не трогает; git merge переносит это в свою ветку */
  'fetch-then-merge': (aria) => (
    <Panel id="fig-b-fetchmerge" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GIT PULL = FETCH + MERGE</text>
      <g fill={ACCENT} opacity={0.92}>
        <rect x={330} y={54} width={170} height={40} rx={20} />
        <circle cx={375} cy={48} r={24} />
        <circle cx={420} cy={42} r={30} />
      </g>
      <text x={415} y={116} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">origin (сервер)</text>
      <Arrow x1={400} y1={128} x2={400} y2={166} color={INK} w={5} />
      <text x={470} y={152} fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>1 · git fetch</text>
      <rect x={260} y={176} width={280} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={203} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>origin/main обновилась</text>
      <text x={640} y={198} textAnchor="middle" fontSize={12} fill={FADE}>рабочие файлы</text>
      <text x={640} y={214} textAnchor="middle" fontSize={12} fill={FADE}>пока не тронуты</text>
      <Arrow x1={400} y1={220} x2={400} y2={256} color={ACCENT} w={6} />
      <text x={470} y={244} fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>2 · git merge</text>
      <rect x={260} y={266} width={280} height={44} rx={10} fill={ACCENT} />
      <text x={400} y={293} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK} fontFamily={MONO}>main и рабочие файлы обновились</text>
    </Panel>
  ),
  /* панель Project в режиме Android: manifests / kotlin+java (MainActivity.kt) / res / Gradle Scripts */
  'project-tree-structure': (aria) => (
    <Panel id="fig-b-projecttree" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>PROJECT · ГРУППИРОВКА ПО СМЫСЛУ</text>
      <rect x={340} y={64} width={140} height={40} rx={10} fill={ACCENT} />
      <text x={410} y={90} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>app</text>
      <g stroke={FADE} strokeWidth={2.5}>
        <path d="M410 104L115 186" />
        <path d="M410 104L325 186" />
        <path d="M410 104L535 186" />
        <path d="M410 104L705 186" />
      </g>
      {[
        { x: 40, label: 'manifests', file: 'AndroidManifest.xml' },
        { x: 250, label: 'kotlin+java', file: 'MainActivity.kt', accent: true },
        { x: 460, label: 'res', file: 'strings, картинки' },
        { x: 630, label: 'Gradle Scripts', file: 'build.gradle.kts' },
      ].map((n) => (
        <g key={n.label}>
          <rect x={n.x} y={186} width={150} height={38} rx={9} fill={n.accent ? ACCENT : SOFT} stroke={n.accent ? 'none' : INK} strokeWidth={2.5} />
          <text x={n.x + 75} y={210} textAnchor="middle" fontSize={13} fontWeight={800} fill={n.accent ? DARK : '#fff'} fontFamily={MONO}>{n.label}</text>
          <text x={n.x + 75} y={244} textAnchor="middle" fontSize={11.5} fill={FADE}>{n.file}</text>
        </g>
      ))}
      <text x={400} y={282} textAnchor="middle" fontSize={13} fill={FADE}>режим Android — не настоящие папки на диске, а удобная группировка по смыслу</text>
    </Panel>
  ),
  /* Kotlin-код + ресурсы + библиотеки → Gradle → compile/package/sign → APK/AAB */
  'gradle-build-pipeline': (aria) => (
    <Panel id="fig-b-gradlepipe" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ДЕЛАЕТ GRADLE</text>
      <g fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>
        <text x={40} y={92}>Kotlin-код</text>
        <text x={40} y={146}>ресурсы (res)</text>
        <text x={40} y={200}>библиотеки</text>
      </g>
      <Arrow x1={150} y1={86} x2={278} y2={130} color={FADE} w={3} />
      <Arrow x1={150} y1={140} x2={278} y2={140} color={FADE} w={3} />
      <Arrow x1={150} y1={194} x2={278} y2={150} color={FADE} w={3} />
      <rect x={288} y={90} width={220} height={100} rx={16} fill={ACCENT} />
      <text x={398} y={132} textAnchor="middle" fontSize={20} fontWeight={800} fill={DARK} fontFamily={MONO}>Gradle</text>
      <text x={398} y={156} textAnchor="middle" fontSize={12} fontWeight={700} fill={DARK}>build.gradle.kts</text>
      <text x={398} y={174} textAnchor="middle" fontSize={11.5} fill={DARK}>compile · package · sign</text>
      <Arrow x1={518} y1={140} x2={620} y2={140} color={ACCENT} w={6} />
      <rect x={630} y={100} width={130} height={80} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={695} y={135} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff" fontFamily={MONO}>APK</text>
      <text x={695} y={158} textAnchor="middle" fontSize={11} fill={FADE}>/ AAB</text>
      <text x={400} y={232} textAnchor="middle" fontSize={13} fill={FADE}>любое изменение build.gradle.kts или новая библиотека — и Gradle просит sync заново</text>
    </Panel>
  ),
  /* Select Hardware → System Image → Verify Configuration → Finish */
  'avd-wizard-flow': (aria) => (
    <Panel id="fig-b-avdwizard" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>DEVICE MANAGER · МАСТЕР AVD</text>
      {[
        { x: 40, n: 1, label: 'Select Hardware', note: 'модель телефона' },
        { x: 240, n: 2, label: 'System Image', note: 'версия Android' },
        { x: 440, n: 3, label: 'Verify Configuration', note: 'имя AVD' },
      ].map((s) => (
        <g key={s.n}>
          <rect x={s.x} y={90} width={170} height={90} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <circle cx={s.x + 26} cy={116} r={16} fill={ACCENT} />
          <text x={s.x + 26} y={121} textAnchor="middle" fontSize={15} fontWeight={800} fill={DARK} fontFamily={MONO}>{s.n}</text>
          <text x={s.x + 85} y={148} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{s.label}</text>
          <text x={s.x + 85} y={168} textAnchor="middle" fontSize={11.5} fill={FADE}>{s.note}</text>
        </g>
      ))}
      <Arrow x1={210} y1={135} x2={234} y2={135} color={ACCENT} w={4} />
      <Arrow x1={410} y1={135} x2={434} y2={135} color={ACCENT} w={4} />
      <Arrow x1={610} y1={135} x2={660} y2={135} color={ACCENT} w={5} />
      <circle cx={700} cy={135} r={36} fill={ACCENT} />
      <text x={700} y={130} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK} fontFamily={MONO}>Finish</text>
      <text x={700} y={148} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={DARK}>→ AVD готов</text>
      <text x={400} y={232} textAnchor="middle" fontSize={13} fill={FADE}>три экрана подряд — до Finish ничего не сохранено</text>
    </Panel>
  ),
};
