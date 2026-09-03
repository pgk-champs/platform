import React from 'react';
import { ACCENT, Arrow, DARK, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы глав трека «Мобилка». */

export const mobileSchemes: Schemes = {
  /* 01-kotlin-vars — пять базовых типов, каждый принимает только своё */
  'kotlin-five-types': (aria) => (
    <Panel id="fig-m-types" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · ПЯТЬ БАЗОВЫХ ТИПОВ</text>
      {[
        { x: 30, name: 'Int', lit: '16', note: 'целое' },
        { x: 180, name: 'Double', lit: '1.75', note: 'дробное' },
        { x: 330, name: 'Char', lit: "'ф'", note: 'один символ' },
        { x: 480, name: 'Boolean', lit: 'true', note: 'true / false' },
        { x: 630, name: 'String', lit: '"ПГК"', note: 'текст' },
      ].map((t) => (
        <g key={t.name}>
          <rect x={t.x} y={68} width={140} height={150} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={t.x + 70} y={98} textAnchor="middle" fontSize={17} fontWeight={800} fill={ACCENT} fontFamily={MONO}>{t.name}</text>
          <text x={t.x + 70} y={152} textAnchor="middle" fontSize={18} fontWeight={700} fill="#fff" fontFamily={MONO}>{t.lit}</text>
          <text x={t.x + 70} y={200} textAnchor="middle" fontSize={12} fill={FADE}>{t.note}</text>
        </g>
      ))}
      <text x={400} y={254} textAnchor="middle" fontSize={14} fill={FADE}>каждый тип принимает только своё: 5 помещается в Int, но "5" — уже String</text>
    </Panel>
  ),
  /* 01-kotlin-vars — listOf(1,2).map{it*2}.sum(): данные текут по цепочке слева направо */
  'chain-pipeline': (aria) => (
    <Panel id="fig-m-chain" w={800} h={270} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>{'KOTLIN · ЦЕПОЧКА .map { }.sum()'}</text>
      <rect x={40} y={90} width={170} height={90} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={125} y={143} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>[1, 2]</text>
      <text x={125} y={196} textAnchor="middle" fontSize={12.5} fill={FADE} fontFamily={MONO}>listOf(1, 2)</text>
      <Arrow x1={218} y1={135} x2={300} y2={135} color={ACCENT} w={5} />
      <text x={259} y={116} textAnchor="middle" fontSize={13} fontWeight={700} fill={ACCENT} fontFamily={MONO}>{'.map { it * 2 }'}</text>
      <rect x={308} y={90} width={170} height={90} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={393} y={143} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>[2, 4]</text>
      <Arrow x1={486} y1={135} x2={568} y2={135} color={ACCENT} w={5} />
      <text x={527} y={116} textAnchor="middle" fontSize={15} fontWeight={700} fill={ACCENT} fontFamily={MONO}>.sum()</text>
      <rect x={576} y={78} width={190} height={114} rx={14} fill={ACCENT} />
      <text x={671} y={148} textAnchor="middle" fontSize={40} fontWeight={800} fill={DARK} fontFamily={MONO}>6</text>
      <text x={400} y={246} textAnchor="middle" fontSize={13.5} fill={FADE}>каждая точка — новый шаг: map меняет значения, sum сворачивает список в число</text>
    </Panel>
  ),
  /* 01-kotlin-vars — строковый шаблон: $name / ${expr} заменяются реальным значением */
  'string-template-fill': (aria) => (
    <Panel id="fig-m-template" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · ШАБЛОН $ ПОДСТАВЛЯЕТ ЗНАЧЕНИЕ</text>
      <rect x={40} y={72} width={330} height={64} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={58} y={112} fontSize={16} fontFamily={MONO} fill="#fff">"Привет, <tspan fill={ACCENT} fontWeight={800}>$name</tspan>!"</text>
      <Arrow x1={378} y1={104} x2={444} y2={104} color={ACCENT} w={5} />
      <rect x={452} y={72} width={310} height={64} rx={12} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={112} fontSize={16} fontFamily={MONO} fill="#fff">"Привет, <tspan fill={ACCENT} fontWeight={800}>Олег</tspan>!"</text>

      <rect x={40} y={172} width={330} height={64} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={58} y={212} fontSize={15} fontFamily={MONO} fill="#fff">"Будет <tspan fill={ACCENT} fontWeight={800}>{'${age + 1}'}</tspan>"</text>
      <Arrow x1={378} y1={204} x2={444} y2={204} color={ACCENT} w={5} />
      <rect x={452} y={172} width={310} height={64} rx={12} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={212} fontSize={16} fontFamily={MONO} fill="#fff">"Будет <tspan fill={ACCENT} fontWeight={800}>17</tspan>"</text>

      <text x={400} y={270} textAnchor="middle" fontSize={13.5} fill={FADE}>{'$name — имя переменной; ${выражение} — сначала считает, потом подставляет'}</text>
    </Panel>
  ),
  /* 02-functions-lambdas — fun square(x: Int): Int по трём частям сигнатуры */
  'function-signature-anatomy': (aria) => (
    <Panel id="fig-m-signature" w={800} h={260} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · СИГНАТУРА ФУНКЦИИ ПО ЧАСТЯМ</text>
      <text x={110} y={132} textAnchor="middle" fontSize={16} fontFamily={MONO} fill={FADE}>fun</text>
      <rect x={165} y={90} width={160} height={70} rx={12} fill={ACCENT} />
      <text x={245} y={132} textAnchor="middle" fontSize={20} fontWeight={800} fill={DARK} fontFamily={MONO}>square</text>
      <text x={165} y={182} fontSize={14} fontWeight={700} fill={ACCENT}>имя</text>
      <text x={355} y={132} textAnchor="middle" fontSize={22} fontWeight={800} fill={FADE} fontFamily={MONO}>(</text>
      <rect x={375} y={90} width={160} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={455} y={132} textAnchor="middle" fontSize={19} fontWeight={700} fill="#fff" fontFamily={MONO}>x: Int</text>
      <text x={375} y={182} fontSize={14} fontWeight={700} fill="#fff">параметры</text>
      <text x={548} y={132} textAnchor="middle" fontSize={22} fontWeight={800} fill={FADE} fontFamily={MONO}>{'):'}</text>
      <rect x={578} y={90} width={150} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={653} y={132} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily={MONO}>Int</text>
      <text x={578} y={182} fontSize={14} fontWeight={700} fill="#fff">тип возврата</text>
      <text x={400} y={234} textAnchor="middle" fontSize={13.5} fill={FADE}>{'имя — параметры со своими типами — тип возврата: три части между fun и {'}</text>
    </Panel>
  ),
  /* 02-functions-lambdas — лямбда-последний-параметр переезжает из скобок за скобки */
  'trailing-lambda-shift': (aria) => (
    <Panel id="fig-m-trailing" w={800} h={270} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · ТРЕЙЛИНГ-ЛЯМБДА — ТА ЖЕ ЛЯМБДА СНАРУЖИ</text>
      <text x={70} y={90} fontSize={13} fontWeight={700} fill="#fff">внутри скобок, третьим аргументом</text>
      <rect x={60} y={100} width={680} height={54} rx={12} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={80} y={134} fontSize={16} fontFamily={MONO} fill="#fff">calculate(6, 3, </text>
      <rect x={288} y={110} width={230} height={34} rx={8} fill={ACCENT} />
      <text x={403} y={133} textAnchor="middle" fontSize={14} fontWeight={800} fill={DARK} fontFamily={MONO}>{'{ a, b -> a - b }'}</text>
      <text x={524} y={134} fontSize={16} fontFamily={MONO} fill="#fff">)</text>

      <Arrow x1={400} y1={162} x2={400} y2={190} color={ACCENT} w={4} />

      <text x={70} y={200} fontSize={13} fontWeight={700} fill={ACCENT}>трейлинг: вынесена за круглые скобки</text>
      <rect x={60} y={210} width={680} height={40} rx={10} fill="rgba(0,0,0,0.2)" stroke={ACCENT} strokeWidth={2} />
      <text x={80} y={236} fontSize={16} fontFamily={MONO} fill="#fff">calculate(6, 3)</text>
      <rect x={288} y={216} width={230} height={28} rx={7} fill={ACCENT} />
      <text x={403} y={235} textAnchor="middle" fontSize={13} fontWeight={800} fill={DARK} fontFamily={MONO}>{'{ a, b -> a - b }'}</text>
    </Panel>
  ),
  /* 02-functions-lambdas — одна функция calculate, три разные лямбды-операции на входе */
  'higher-order-plug': (aria) => (
    <Panel id="fig-m-hof" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · calculate ПРИНИМАЕТ РАЗНЫЕ ЛЯМБДЫ</text>
      {[
        { y: 60, lam: '{ a, b -> a + b }', res: '9' },
        { y: 128, lam: '{ a, b -> a - b }', res: '3' },
        { y: 196, lam: '{ a, b -> a * b }', res: '18' },
      ].map((row) => (
        <g key={row.res}>
          <rect x={30} y={row.y} width={230} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={145} y={row.y + 32} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>{row.lam}</text>
          <Arrow x1={266} y1={row.y + 25} x2={320} y2={row.y + 25} color={ACCENT} w={4} />
          <rect x={328} y={row.y} width={220} height={50} rx={10} fill="rgba(0,0,0,0.2)" stroke={INK} strokeWidth={2} />
          <text x={438} y={row.y + 32} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>calculate(6, 3, op)</text>
          <Arrow x1={554} y1={row.y + 25} x2={608} y2={row.y + 25} color={ACCENT} w={4} />
          <rect x={616} y={row.y} width={140} height={50} rx={10} fill={ACCENT} />
          <text x={686} y={row.y + 33} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>{row.res}</text>
        </g>
      ))}
      <text x={400} y={276} textAnchor="middle" fontSize={13.5} fill={FADE}>одна и та же calculate — три разных результата: сама она не знает, что делает op</text>
    </Panel>
  ),
  /* 03-classes-collections — один чертёж класса, разные объекты со своими значениями */
  'class-blueprint-instances': (aria) => (
    <Panel id="fig-m-blueprint" w={800} h={310} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · КЛАСС — ЧЕРТЁЖ, ОБЪЕКТ — ВЕЩЬ ПО ЧЕРТЕЖУ</text>
      <rect x={260} y={64} width={280} height={64} rx={12} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="9 6" />
      <text x={400} y={102} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>class Competitor(name, score)</text>
      <Arrow x1={330} y1={130} x2={190} y2={186} color={ACCENT} w={4} />
      <Arrow x1={470} y1={130} x2={610} y2={186} color={ACCENT} w={4} />
      <rect x={60} y={192} width={260} height={82} rx={12} fill={ACCENT} />
      <text x={190} y={224} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>alice</text>
      <text x={190} y={250} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={DARK}>name="Алиса", score=82</text>
      <rect x={480} y={192} width={260} height={82} rx={12} fill={ACCENT} />
      <text x={610} y={224} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>bogdan</text>
      <text x={610} y={250} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={DARK}>name="Богдан", score=91</text>
      <text x={400} y={296} textAnchor="middle" fontSize={13.5} fill={FADE}>один чертёж — сколько угодно объектов, у каждого свои значения полей</text>
    </Panel>
  ),
  /* 03-classes-collections — data class дописывает пять методов сам */
  'data-class-codegen': (aria) => (
    <Panel id="fig-m-datagen" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · data class — ЧТО ДОПИСЫВАЕТ КОМПИЛЯТОР</text>
      <rect x={190} y={62} width={420} height={54} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={3} />
      <text x={400} y={96} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff" fontFamily={MONO}>data class Competitor(name, score)</text>
      {['toString()', 'equals()', 'hashCode()', 'copy()', 'componentN()'].map((fn, i) => {
        const x = 30 + i * 150;
        return (
          <g key={fn}>
            <Arrow x1={400} y1={122} x2={x + 70} y2={178} color={ACCENT} w={2.5} />
            <rect x={x} y={182} width={140} height={54} rx={10} fill={ACCENT} />
            <text x={x + 70} y={215} textAnchor="middle" fontSize={13.5} fontWeight={800} fill={DARK} fontFamily={MONO}>{fn}</text>
          </g>
        );
      })}
      <text x={400} y={272} textAnchor="middle" fontSize={13.5} fill={FADE}>одно слово data — пять сгенерированных методов, без единой строчки от тебя</text>
    </Panel>
  ),
  /* 03-classes-collections — scores["Алиса"] возвращает Int?, а не гарантированный Int */
  'nullable-box': (aria) => (
    <Panel id="fig-m-nullable" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · Map[ключ] ВОЗВРАЩАЕТ Int?, НЕ Int</text>
      <text x={220} y={72} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>Int</text>
      <rect x={110} y={86} width={220} height={110} rx={14} fill={ACCENT} />
      <text x={220} y={150} textAnchor="middle" fontSize={34} fontWeight={800} fill={DARK} fontFamily={MONO}>82</text>
      <text x={220} y={218} textAnchor="middle" fontSize={13} fill={FADE}>значение есть всегда</text>

      <text x={580} y={72} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>Int?</text>
      <rect x={470} y={86} width={220} height={110} rx={14} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="9 6" />
      <text x={580} y={150} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>82 <tspan fill={FADE} fontSize={16}>или</tspan> null</text>
      <text x={580} y={218} textAnchor="middle" fontSize={13} fill={FADE}>ключа могло не быть — тип честно предупреждает</text>

      <text x={400} y={258} textAnchor="middle" fontSize={13.5} fill={FADE}>компилятор не пустит Int? туда, где обещан гарантированный Int</text>
    </Panel>
  ),
  /* 04-first-compose-screen — WelcomeScreen -> Column -> Text/Text/Button -> Text */
  'composable-tree': (aria) => (
    <Panel id="fig-m-tree" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · ДЕРЕВО ВЫЗОВОВ WelcomeScreen</text>
      <path d="M400 96v36" stroke={FADE} strokeWidth={3} fill="none" />
      <path d="M400 168L230 196" stroke={FADE} strokeWidth={3} fill="none" />
      <path d="M400 168L400 196" stroke={FADE} strokeWidth={3} fill="none" />
      <path d="M400 168L570 196" stroke={FADE} strokeWidth={3} fill="none" />
      <path d="M570 232v28" stroke={FADE} strokeWidth={3} fill="none" />
      <rect x={300} y={56} width={200} height={40} rx={12} fill={ACCENT} />
      <text x={400} y={82} textAnchor="middle" fontSize={16} fontWeight={800} fill={DARK} fontFamily={MONO}>WelcomeScreen</text>
      <rect x={350} y={132} width={100} height={36} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={155} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>Column</text>
      <rect x={165} y={196} width={130} height={36} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={230} y={219} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>Text</text>
      <rect x={335} y={196} width={130} height={36} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={400} y={219} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>Text</text>
      <rect x={505} y={196} width={130} height={36} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={570} y={219} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>Button</text>
      <rect x={505} y={260} width={130} height={36} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={570} y={283} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>Text</text>
      <text x={400} y={306} textAnchor="middle" fontSize={13} fill={FADE}>каждый вызов в трейлинг-лямбде — ветка: Button сам вызывает свой Text</text>
    </Panel>
  ),
  /* 04-first-compose-screen — clickable до padding против clickable после padding */
  'modifier-order-matters': (aria) => (
    <Panel id="fig-m-modorder" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · ПОРЯДОК МОДИФИКАТОРОВ МЕНЯЕТ РЕЗУЛЬТАТ</text>
      <text x={200} y={70} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>.clickable().padding(16.dp)</text>
      <rect x={60} y={82} width={280} height={140} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={4} />
      <rect x={92} y={112} width={216} height={80} rx={10} fill="rgba(0,0,0,0.18)" stroke={INK} strokeWidth={2} />
      <text x={200} y={244} textAnchor="middle" fontSize={12.5} fill={FADE}>клик считается и на отступе — рамка целиком</text>

      <text x={600} y={70} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>.padding(16.dp).clickable()</text>
      <rect x={460} y={82} width={280} height={140} rx={14} fill={SOFT} stroke={INK} strokeWidth={2} />
      <rect x={492} y={112} width={216} height={80} rx={10} fill="rgba(0,0,0,0.18)" stroke={ACCENT} strokeWidth={4} />
      <text x={600} y={244} textAnchor="middle" fontSize={12.5} fill={FADE}>клик на отступе не срабатывает — рамка только внутри</text>
    </Panel>
  ),
  /* 05-state-events — состояние течёт вниз параметром, событие — вверх вызовом лямбды */
  'state-hoisting-updown': (aria) => (
    <Panel id="fig-m-hoist" w={800} h={310} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · СОСТОЯНИЕ ВНИЗ, СОБЫТИЯ ВВЕРХ</text>
      <rect x={260} y={64} width={280} height={60} rx={12} fill={ACCENT} />
      <text x={400} y={98} textAnchor="middle" fontSize={17} fontWeight={800} fill={DARK} fontFamily={MONO}>TrainingScreen</text>
      <text x={400} y={140} textAnchor="middle" fontSize={12.5} fill={FADE}>{'var count by remember { mutableStateOf(0) }'}</text>

      <Arrow x1={330} y1={168} x2={330} y2={222} color={INK} w={5} />
      <text x={272} y={198} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff" fontFamily={MONO}>count: Int</text>

      <Arrow x1={470} y1={222} x2={470} y2={168} color={ACCENT} w={5} />
      <text x={555} y={198} textAnchor="middle" fontSize={12} fontWeight={700} fill={ACCENT} fontFamily={MONO}>onIncrement()</text>

      <rect x={260} y={228} width={280} height={54} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={400} y={261} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>CounterDisplay</text>
      <text x={400} y={298} textAnchor="middle" fontSize={13} fill={FADE}>состояние течёт вниз параметром, событие — вверх вызовом лямбды</text>
    </Panel>
  ),
  /* 05-state-events — var внутри функции обнуляется, remember переживает пересборку */
  'remember-lifetime': (aria) => (
    <Panel id="fig-m-remember" w={800} h={320} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · var ПРОТИВ remember МЕЖДУ ВЫЗОВАМИ</text>
      <text x={40} y={76} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>var count = 0 внутри функции</text>
      {[0, 1, 2].map((i) => (
        <g key={`local-${i}`}>
          <rect x={110 + i * 210} y={90} width={150} height={56} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={185 + i * 210} y={126} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>1</text>
          {i < 2 && <text x={273 + i * 210} y={124} textAnchor="middle" fontSize={20} fontWeight={800} fill={FADE}>✕</text>}
        </g>
      ))}
      <text x={400} y={172} textAnchor="middle" fontSize={12.5} fill={FADE}>каждый вызов создаёт count заново — 1, 1, 1</text>

      <text x={40} y={214} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>{'var count by remember { mutableStateOf(0) }'}</text>
      {[0, 1, 2].map((i) => (
        <g key={`rem-${i}`}>
          <rect x={110 + i * 210} y={228} width={150} height={56} rx={10} fill={ACCENT} />
          <text x={185 + i * 210} y={264} textAnchor="middle" fontSize={22} fontWeight={800} fill={DARK} fontFamily={MONO}>{i + 1}</text>
          {i < 2 && <Arrow x1={264 + i * 210} y1={256} x2={306 + i * 210} y2={256} color={ACCENT} w={3} />}
        </g>
      ))}
      <text x={400} y={310} textAnchor="middle" fontSize={12.5} fill={FADE}>значение живёт снаружи — 1, 2, 3, растёт от вызова к вызову</text>
    </Panel>
  ),
  /* 05-state-events — count++ разворачивается в getValue()/setValue() делегата */
  'delegate-getset-flow': (aria) => (
    <Panel id="fig-m-delegate" w={800} h={230} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>KOTLIN · ДЕЛЕГАТ by: count++ ПОД КАПОТОМ</text>
      <rect x={30} y={80} width={150} height={80} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={105} y={126} textAnchor="middle" fontSize={20} fontWeight={800} fill="#fff" fontFamily={MONO}>count++</text>
      <Arrow x1={186} y1={120} x2={244} y2={120} color={ACCENT} w={4} />
      <text x={215} y={102} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>1 читать</text>
      <rect x={252} y={80} width={190} height={80} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={347} y={116} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>getValue()</text>
      <text x={347} y={140} textAnchor="middle" fontSize={12.5} fill={FADE} fontFamily={MONO}>вернёт 0</text>
      <Arrow x1={448} y1={120} x2={506} y2={120} color={ACCENT} w={4} />
      <text x={477} y={102} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>2 писать</text>
      <rect x={514} y={80} width={190} height={80} rx={12} fill={ACCENT} />
      <text x={609} y={116} textAnchor="middle" fontSize={15} fontWeight={800} fill={DARK} fontFamily={MONO}>setValue(1)</text>
      <text x={609} y={140} textAnchor="middle" fontSize={12.5} fill={DARK} fontFamily={MONO}>делегат хранит 1</text>
      <text x={400} y={206} textAnchor="middle" fontSize={13} fill={FADE}>count нигде не хранится сам — каждое чтение и запись уходит через делегат</text>
    </Panel>
  ),
  /* 06-layout-by-mockup — Color(0xFFE53935): alpha/red/green/blue по порядку */
  'argb-hex-channels': (aria) => (
    <Panel id="fig-m-argb" w={800} h={280} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>{'COMPOSE · Color(0xFFE53935) — ЧЕТЫРЕ КАНАЛА'}</text>
      <text x={400} y={82} textAnchor="middle" fontSize={24} fontWeight={800} fill="#fff" fontFamily={MONO}>0x FF E5 39 35</text>
      {[
        { x: 30, name: 'alpha', hex: 'FF', dec: '255' },
        { x: 220, name: 'red', hex: 'E5', dec: '229' },
        { x: 410, name: 'green', hex: '39', dec: '57' },
        { x: 600, name: 'blue', hex: '35', dec: '53' },
      ].map((c) => (
        <g key={c.name}>
          <path d={`M${c.x + 85} 92v20`} stroke={FADE} strokeWidth={2} />
          <rect x={c.x} y={112} width={170} height={110} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={c.x + 85} y={144} textAnchor="middle" fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO}>{c.name}</text>
          <text x={c.x + 85} y={180} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff" fontFamily={MONO}>{c.hex}</text>
          <text x={c.x + 85} y={206} textAnchor="middle" fontSize={12.5} fill={FADE} fontFamily={MONO}>{c.dec} из 255</text>
        </g>
      ))}
      <text x={400} y={252} textAnchor="middle" fontSize={13.5} fill={FADE}>каждая пара цифр после 0x — один канал: alpha, red, green, blue по порядку</text>
    </Panel>
  ),
  /* 06-layout-by-mockup — SpaceBetween/SpaceAround/SpaceEvenly: куда уходит свободное место */
  'arrangement-compare': (aria) => (
    <Panel id="fig-m-arrangement" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · Arrangement — КУДА ДЕВАЕТСЯ СВОБОДНОЕ МЕСТО</text>
      {[
        { y: 70, name: 'SpaceBetween', xs: [50, 330, 610], note: 'между элементами 60 · по краям 0' },
        { y: 160, name: 'SpaceAround', xs: [97, 330, 563], note: 'между элементами 40 · по краям 20' },
        { y: 250, name: 'SpaceEvenly', xs: [120, 330, 540], note: 'все промежутки одинаковые — по 30' },
      ].map((row) => (
        <g key={row.name}>
          <text x={50} y={row.y} fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO}>{row.name}</text>
          <rect x={50} y={row.y + 8} width={700} height={38} rx={8} fill="none" stroke={FADE} strokeWidth={2} strokeDasharray="6 5" />
          {row.xs.map((x) => (
            <rect key={x} x={x} y={row.y + 8} width={140} height={38} rx={8} fill={ACCENT} />
          ))}
          <text x={400} y={row.y + 66} textAnchor="middle" fontSize={12.5} fill={FADE}>{row.note}</text>
        </g>
      ))}
    </Panel>
  ),
  /* 06-layout-by-mockup — contentAlignment: 9 сочетаний = 3 позиции по горизонтали × 3 по вертикали */
  'box-alignment-grid': (aria) => (
    <Panel id="fig-m-boxalign" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>COMPOSE · contentAlignment — 9 ПОЗИЦИЙ В Box</text>
      <rect x={280} y={58} width={220} height={220} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={390} y={172} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">Box</text>
      <text x={390} y={190} textAnchor="middle" fontSize={11.5} fill={FADE}>100×100</text>
      <rect x={447} y={58} width={53} height={53} rx={8} fill={ACCENT} />
      <rect x={364} y={142} width={53} height={53} rx={8} fill={ACCENT} opacity={0.75} />
      <rect x={280} y={225} width={53} height={53} rx={8} fill={ACCENT} opacity={0.5} />
      <text x={560} y={78} fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO}>TopEnd</text>
      <text x={560} y={98} fontSize={12} fill={FADE}>x=76, y=0</text>
      <text x={560} y={168} fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO} opacity={0.85}>Center</text>
      <text x={560} y={188} fontSize={12} fill={FADE}>x=38, y=38</text>
      <text x={560} y={258} fontSize={14} fontWeight={700} fill={ACCENT} fontFamily={MONO} opacity={0.7}>BottomStart</text>
      <text x={560} y={278} fontSize={12} fill={FADE}>x=0, y=76</text>
      <text x={400} y={294} textAnchor="middle" fontSize={12.5} fill={FADE}>3 позиции по горизонтали × 3 по вертикали — все 9 сочетаний Alignment</text>
    </Panel>
  ),
  /* 07-ui-kit — api пробрасывает тип дальше по цепочке, implementation его останавливает */
  'api-vs-implementation-visibility': (aria) => (
    <Panel id="fig-m-apivis" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GRADLE · api ПРОТИВ implementation — ЧТО ВИДНО ДАЛЬШЕ</text>

      <text x={40} y={78} fontSize={13.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>{'ui-kit: api(project(":net"))'}</text>
      <rect x={40} y={90} width={130} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={105} y={121} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>:net</text>
      <Arrow x1={176} y1={115} x2={244} y2={115} color={ACCENT} w={4} />
      <rect x={252} y={90} width={130} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={317} y={121} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>:ui-kit</text>
      <Arrow x1={388} y1={115} x2={456} y2={115} color={ACCENT} w={4} />
      <rect x={464} y={90} width={130} height={50} rx={10} fill={ACCENT} />
      <text x={529} y={121} textAnchor="middle" fontSize={14} fontWeight={800} fill={DARK} fontFamily={MONO}>:app</text>
      <text x={630} y={121} fontSize={12.5} fill={ACCENT} fontFamily={MONO}>видит ApiResponse</text>

      <text x={40} y={192} fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>{'ui-kit: implementation(project(":net"))'}</text>
      <rect x={40} y={204} width={130} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={105} y={235} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>:net</text>
      <Arrow x1={176} y1={229} x2={244} y2={229} color={FADE} w={4} />
      <rect x={252} y={204} width={130} height={50} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={317} y={235} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" fontFamily={MONO}>:ui-kit</text>
      <path d="M400 204v50" stroke={FADE} strokeWidth={4} strokeDasharray="3 5" />
      <text x={400} y={196} textAnchor="middle" fontSize={18} fontWeight={800} fill={FADE}>✕</text>
      <rect x={464} y={204} width={130} height={50} rx={10} fill="rgba(0,0,0,0.2)" stroke={FADE} strokeWidth={2} />
      <text x={529} y={235} textAnchor="middle" fontSize={14} fontWeight={700} fill={FADE} fontFamily={MONO}>:app</text>
      <text x={630} y={235} fontSize={12.5} fill={FADE} fontFamily={MONO}>ApiResponse не виден</text>
    </Panel>
  ),
  /* 07-ui-kit — один application-модуль как точка входа, сколько угодно library-модулей вокруг */
  'app-vs-library-plugin': (aria) => (
    <Panel id="fig-m-pluginrole" w={800} h={300} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>GRADLE · com.android.application ПРОТИВ .library</text>

      <text x={190} y={72} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={ACCENT} fontFamily={MONO}>com.android.application</text>
      <rect x={80} y={86} width={220} height={80} rx={12} fill={ACCENT} />
      <text x={190} y={134} textAnchor="middle" fontSize={20} fontWeight={800} fill={DARK} fontFamily={MONO}>:app</text>
      <Arrow x1={190} y1={166} x2={190} y2={202} color={ACCENT} w={4} />
      <text x={190} y={224} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>.apk / .aab</text>
      <text x={190} y={248} textAnchor="middle" fontSize={12} fill={FADE}>точка входа — ставится на устройство</text>

      <text x={600} y={72} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff" fontFamily={MONO}>com.android.library</text>
      <rect x={490} y={82} width={220} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={600} y={110} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>:ui-kit</text>
      <rect x={490} y={132} width={220} height={44} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={600} y={160} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fff" fontFamily={MONO}>:net</text>
      <Arrow x1={600} y1={176} x2={600} y2={202} color={INK} w={4} />
      <text x={600} y={224} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff" fontFamily={MONO}>.aar</text>
      <text x={600} y={248} textAnchor="middle" fontSize={12} fill={FADE}>нельзя запустить — только подключить как зависимость</text>

      <text x={400} y={280} textAnchor="middle" fontSize={13} fill={FADE}>ровно один application-модуль, сколько угодно library-модулей вокруг</text>
    </Panel>
  ),
};
