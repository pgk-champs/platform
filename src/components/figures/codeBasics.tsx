import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Из чего состоит код»: разбор строки на части, смысл точки,
 * три вида скобок и чтение сообщения об ошибке. */

export const codeBasicsSchemes: Schemes = {
  /* одна строка кода, разобранная на слова-кирпичики */
  'cb-tokens': (aria) => (
    <Panel id="fig-cb-tokens" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА СТРОКА КОДА · ИЗ ЧЕГО ОНА СОБРАНА</text>
      <rect x={30} y={62} width={740} height={58} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={54} y={99} fontSize={22} fontFamily={MONO} fill="#fff">val</text>
      <text x={110} y={99} fontSize={22} fontFamily={MONO} fill={ACCENT}>score</text>
      <text x={196} y={99} fontSize={22} fontFamily={MONO} fill="#fff">=</text>
      <text x={228} y={99} fontSize={22} fontFamily={MONO} fill={ACCENT}>10</text>
      {[
        { x: 54, t: 'ключевое слово', n: 'слово языка: «заводим значение»' },
        { x: 240, t: 'имя', n: 'придумал ты: как обращаться дальше' },
        { x: 440, t: 'оператор =', n: 'положить справа в то, что слева' },
        { x: 630, t: 'литерал', n: 'значение прямо в тексте: 10' },
      ].map((c, i) => (
        <g key={c.t}>
          <Arrow x1={[70, 130, 202, 236][i]} y1={124} x2={[70, 130, 202, 236][i]} y2={158} color={ACCENT} w={3} />
          <rect x={c.x - 24} y={162 + (i % 2) * 78} width={168} height={62} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={c.x - 8} y={186 + (i % 2) * 78} fontSize={13} fontWeight={700} fill={ACCENT}>{c.t}</text>
          <text x={c.x - 8} y={206 + (i % 2) * 78} fontSize={11} fill={FADE}>{c.n}</text>
        </g>
      ))}
      <text x={400} y={326} textAnchor="middle" fontSize={13} fill={FADE}>читать код — значит видеть эти куски по отдельности, а не сплошную строку символов</text>
    </Panel>
  ),
  /* точка: обращение к содержимому объекта */
  'cb-dot': (aria) => (
    <Panel id="fig-cb-dot" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТОЧКА · «ВОЗЬМИ ВНУТРИ ЭТОГО ВОТ ЭТО»</text>
      <rect x={30} y={66} width={250} height={190} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={155} y={94} textAnchor="middle" fontSize={15} fontWeight={800} fontFamily={MONO} fill={ACCENT}>player</text>
      <text x={155} y={114} textAnchor="middle" fontSize={11.5} fill={FADE}>коробка со всем про игрока</text>
      {['name = "Аня"', 'level = 3', 'hp = 100'].map((t, i) => (
        <text key={t} x={56} y={148 + i * 26} fontSize={13} fontFamily={MONO} fill="#fff">{t}</text>
      ))}
      <text x={56} y={232} fontSize={13} fontFamily={MONO} fill={ACCENT}>attack()</text>
      <Arrow x1={292} y1={160} x2={352} y2={160} color={ACCENT} w={4} />
      <text x={322} y={142} textAnchor="middle" fontSize={22} fontWeight={800} fill={ACCENT}>.</text>
      <rect x={366} y={80} width={404} height={72} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={392} y={116} fontSize={19} fontFamily={MONO} fill="#fff">player<tspan fill={ACCENT}>.</tspan>name</text>
      <text x={392} y={138} fontSize={12} fill={FADE}>свойство: то, что у игрока есть — вернёт «Аня»</text>
      <rect x={366} y={168} width={404} height={72} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={392} y={204} fontSize={19} fontFamily={MONO} fill="#fff">player<tspan fill={ACCENT}>.</tspan>attack()</text>
      <text x={392} y={226} fontSize={12} fill={FADE}>действие: скобки говорят «выполни», без них — не выполнится</text>
      <text x={400} y={286} textAnchor="middle" fontSize={13.5} fontWeight={700} fill="#fff">точка одинаково читается в Kotlin и в TypeScript: слева целое, справа его часть</text>
      <text x={400} y={312} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={FADE}>player.team.city.length — цепочка читается слева направо</text>
    </Panel>
  ),
  /* три вида скобок и их роли */
  'cb-brackets': (aria) => (
    <Panel id="fig-cb-brackets" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ВИДА СКОБОК · РАЗНЫЕ РАБОТЫ</text>
      {[
        { s: '( )', t: 'круглые — вызов и группировка', k: 'println("привет")', n: 'что передаём в действие; (2 + 2) * 3 — порядок' },
        { s: '{ }', t: 'фигурные — блок кода', k: 'if (hp > 0) { ... }', n: 'кусок программы целиком: тело функции, ветка условия' },
        { s: '[ ]', t: 'квадратные — список и номер', k: 'names[0]', n: 'элемент по номеру; нумерация с нуля' },
      ].map((row, i) => (
        <g key={row.s}>
          <rect x={30} y={64 + i * 88} width={740} height={74} rx={13} fill={i === 0 ? SOFT : 'rgba(0,0,0,0.22)'} stroke={i === 0 ? ACCENT : INK} strokeWidth={2.5} />
          <text x={70} y={112 + i * 88} textAnchor="middle" fontSize={30} fontWeight={800} fontFamily={MONO} fill={ACCENT}>{row.s}</text>
          <text x={124} y={94 + i * 88} fontSize={14} fontWeight={700} fill="#fff">{row.t}</text>
          <text x={124} y={116 + i * 88} fontSize={12} fill={FADE}>{row.n}</text>
          <text x={520} y={108 + i * 88} fontSize={15} fontFamily={MONO} fill={ACCENT}>{row.k}</text>
        </g>
      ))}
      <text x={400} y={324} textAnchor="middle" fontSize={13} fill={FADE}>каждая открытая скобка обязана закрыться — незакрытая даёт ошибку в СЛЕДУЮЩЕЙ строке</text>
    </Panel>
  ),
  /* как читается сообщение об ошибке */
  'cb-error-message': (aria) => (
    <Panel id="fig-cb-error" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СООБЩЕНИЕ ОБ ОШИБКЕ · ЭТО АДРЕС, А НЕ РУГАНЬ</text>
      <FileIcon x={40} y={70} />
      <rect x={130} y={64} width={640} height={96} rx={12} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={152} y={98} fontSize={14} fontFamily={MONO} fill="#fff">Main.kt:7:24: error: expecting &apos;)&apos;</text>
      <text x={152} y={126} fontSize={14} fontFamily={MONO} fill={FADE}>    println(&quot;счёт: &quot; + score</text>
      <text x={152} y={148} fontSize={14} fontFamily={MONO} fill={ACCENT}>                           ^</text>
      {[
        { t: 'Main.kt', n: 'файл — где искать' },
        { t: '7', n: 'строка — с неё начинать' },
        { t: '24', n: 'позиция в строке' },
        { t: 'expecting )', n: 'чего компилятору не хватило' },
      ].map((c, i) => (
        <g key={c.t}>
          <rect x={40 + i * 186} y={196 + 0} width={166} height={64} rx={11} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={123 + i * 186} y={222} textAnchor="middle" fontSize={14} fontWeight={800} fontFamily={MONO} fill={ACCENT}>{c.t}</text>
          <text x={123 + i * 186} y={244} textAnchor="middle" fontSize={11.5} fill={FADE}>{c.n}</text>
        </g>
      ))}
      <rect x={40} y={276} width={720} height={44} rx={11} fill={ACCENT} />
      <text x={400} y={304} textAnchor="middle" fontSize={13.5} fontWeight={800} fill={DARK}>ошибка часто на строку ВЫШЕ указанной: там забыли закрыть скобку или кавычку</text>
    </Panel>
  ),
};
