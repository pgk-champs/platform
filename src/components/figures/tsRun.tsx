import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Как запустить код»: три пути от .ts к результату,
 * что остаётся после компиляции и три вида ошибок. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsRunSchemes: Schemes = {
  'tr-three-ways': (aria) => (
    <Panel id="fig-tr-ways" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ПУТИ ОТ ФАЙЛА .TS ДО РЕЗУЛЬТАТА</text>

      <rect x={30} y={70} width={120} height={44} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={90} y={97} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">app.ts</text>

      <Arrow x1={158} y1={78} x2={238} y2={78} color={ACCENT} w={2.5} />
      <text x={198} y={68} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={ACCENT}>tsc</text>
      <rect x={246} y={58} width={120} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={306} y={83} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>app.js · 601 Б</text>
      <Arrow x1={374} y1={78} x2={444} y2={78} color={ACCENT} w={2.5} />
      <rect x={452} y={58} width={338} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={83} fontSize={11.5} fill={ACCENT}>типы проверены, файл остался на диске</text>

      <Arrow x1={158} y1={130} x2={444} y2={130} color={FADE} w={2.5} />
      <text x={300} y={120} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>node app.ts</text>
      <rect x={452} y={110} width={338} height={40} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={470} y={135} fontSize={11.5} fill={FADE}>типы срезаны, но НИЧЕГО не проверено</text>

      <Arrow x1={158} y1={182} x2={444} y2={182} color={RED} w={2.5} />
      <text x={300} y={172} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={RED_TEXT}>без срезания типов</text>
      <rect x={452} y={162} width={338} height={40} rx={10} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={2.5} />
      <text x={470} y={187} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>ERR_UNKNOWN_FILE_EXTENSION ".ts"</text>

      <text x={30} y={238} fontSize={12.5} fill="#fff">сборка дороже запуска готового файла, а прямой запуск дороже запуска .js — на срезание типов</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>только первый путь оставляет артефакт на диске: после прямого запуска рядом не появляется ничего</text>
      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>и только первый проверяет типы: код возврата 0 у компилятора означает «типы сошлись»</text>
    </Panel>
  ),

  'tr-what-erases': (aria) => (
    <Panel id="fig-tr-erase" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ИСЧЕЗАЕТ ПРИ КОМПИЛЯЦИИ, А ЧТО ОСТАЁТСЯ</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">исчезает бесследно</text>
      {['псевдоним типа', 'интерфейс', 'аннотации типов у переменных', 'типы параметров и возврата'].map((t, i) => (
        <text key={t} x={50} y={120 + i * 24} fontSize={11.5} fill={FADE}>· {t}</text>
      ))}

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">остаётся настоящим кодом</text>
      {['class — становится функцией', 'enum — становится объектом', 'параметр-свойство — присваиванием', 'namespace — объектом с кодом'].map((t, i) => (
        <text key={t} x={440} y={120 + i * 24} fontSize={11.5} fill={ACCENT}>· {t}</text>
      ))}

      <text x={30} y={248} fontSize={12.5} fill="#fff">21 строка и 768 символов исходника превратились в 19 строк и 579 символов</text>
      <text x={30} y={272} fontSize={12.5} fill={RED_TEXT}>ровно то, что остаётся кодом, прямой запуск и не умеет: удалить это, не сгенерировав ничего, нельзя</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>проверка типа во время работы даёт «number», а не имя вашего типа: имени уже нет</text>
    </Panel>
  ),

  'tr-three-errors': (aria) => (
    <Panel id="fig-tr-errors" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ВИДА ОШИБОК — И КТО ИХ ЛОВИТ</text>

      {[
        { y: 64, t: 'несовместимый тип', a: 'поймал: TS2322', b: 'запустился, код 0', c: 'склеил строку с числом', ok: [true, false, false] },
        { y: 138, t: 'обращение к несуществующему', a: 'молчит', b: 'упал: TypeError', c: 'видно только в запуске', ok: [false, true, false] },
        { y: 212, t: 'неверное условие', a: 'молчит', b: 'отработал, код 0', c: 'напечатал неправду', ok: [false, false, false] },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 26} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={250} y={r.y + 6} width={165} height={30} rx={7}
            fill={r.ok[0] ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.ok[0] ? ACCENT : INK} strokeWidth={1.8} />
          <text x={332} y={r.y + 26} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={r.ok[0] ? ACCENT : FADE}>{r.a}</text>
          <rect x={425} y={r.y + 6} width={165} height={30} rx={7}
            fill={r.ok[1] ? 'rgba(255,140,140,0.16)' : 'rgba(0,0,0,0.28)'} stroke={r.ok[1] ? RED : INK} strokeWidth={1.8} />
          <text x={507} y={r.y + 26} textAnchor="middle" fontSize={10.5} fontFamily={MONO} fill={r.ok[1] ? RED_TEXT : FADE}>{r.b}</text>
          <text x={604} y={r.y + 26} fontSize={11} fill={FADE}>{r.c}</text>
        </g>
      ))}

      <text x={332} y={58} textAnchor="middle" fontSize={11} fill={FADE}>компилятор</text>
      <text x={507} y={58} textAnchor="middle" fontSize={11} fill={FADE}>запуск</text>

      <text x={30} y={276} fontSize={12.5} fill="#fff">компилятор поймал одну из трёх, запуск уронил одну — третью не поймал никто</text>
    </Panel>
  ),
};
