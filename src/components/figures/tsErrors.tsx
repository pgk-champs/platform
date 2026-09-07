import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Ошибки в TypeScript»: откат против остановки процесса,
 * что прилетает в catch и исключение против результата. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsErrorsSchemes: Schemes = {
  'te-revert-vs-crash': (aria) => (
    <Panel id="fig-te-crash" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТКАТ ПРОТИВ ОСТАНОВКИ: РАЗНЫЕ ПОСЛЕДСТВИЯ</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">Solidity: revert</text>
      <text x={50} y={118} fontSize={11.5} fill={ACCENT}>все записи отменены</text>
      <text x={50} y={142} fontSize={11.5} fill={ACCENT}>состояние как до вызова</text>
      <text x={50} y={166} fontSize={11.5} fill={FADE}>наружу уходит причина</text>
      <text x={50} y={190} fontSize={11.5} fill={FADE}>газ за проделанное списан</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">Node: необработанная ошибка</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>«считаем комиссию» уже напечатано</text>
      <text x={440} y={142} fontSize={11.5} fill={RED_TEXT}>файлы записаны, запросы отправлены</text>
      <text x={440} y={166} fontSize={11.5} fill={RED_TEXT}>процесс завершается кодом 1</text>
      <text x={440} y={190} fontSize={11.5} fill={FADE}>отменять нечего и некому</text>

      <text x={30} y={246} fontSize={12.5} fill="#fff">скрипт, упавший на середине демонстрации, оставляет систему в половинчатом состоянии</text>
      <text x={30} y={272} fontSize={12.5} fill={FADE}>поэтому шаги, меняющие состояние сети, пишут так, чтобы их можно было повторить с любого места</text>
    </Panel>
  ),

  'te-catch-unknown': (aria) => (
    <Panel id="fig-te-catch" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО РЕАЛЬНО ПРИЛЕТАЕТ В CATCH</text>

      {[
        { y: 62, t: 'throw new Error(…)', a: 'есть message', b: 'есть стек с местом броска', ok: true },
        { y: 110, t: 'throw "строка"', a: 'поля message нет', b: 'стека нет', ok: false },
        { y: 158, t: 'throw { code: 42 }', a: 'читать нечего', b: 'стека нет', ok: false },
        { y: 206, t: 'throw undefined', a: 'читать нечего', b: 'стека нет', ok: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={230} height={36} rx={8} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={1.6} />
          <text x={46} y={r.y + 23} fontSize={11} fontFamily={MONO} fill="#fff">{r.t}</text>
          <rect x={274} y={r.y} width={240} height={36} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={290} y={r.y + 23} fontSize={11} fill={r.ok ? ACCENT : RED_TEXT}>{r.a}</text>
          <rect x={528} y={r.y} width={262} height={36} rx={8}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.6} />
          <text x={544} y={r.y + 23} fontSize={11} fill={r.ok ? ACCENT : RED_TEXT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={272} fontSize={12.5} fill="#fff">бросить можно что угодно — поэтому пойманное значение имеет тип «неизвестно» и требует проверки</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>пообещать компилятору тип пойманного нельзя: он отвечает отдельной ошибкой TS1196</text>
    </Panel>
  ),

  'te-throw-vs-result': (aria) => (
    <Panel id="fig-te-result" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАБЫТЬ ОБРАБОТКУ: ДВА СПОСОБА, ДВА ИСХОДА</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">функция бросает исключение</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>вызывающий нигде его не ловит</text>
      <text x={50} y={146} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>проверка типов: вывода нет, код 0</text>
      <text x={50} y={172} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>компилятор промолчал</text>
      <text x={50} y={194} fontSize={11} fill={RED_TEXT}>падение обнаружит пользователь</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">функция возвращает результат</text>
      <text x={440} y={118} fontSize={11.5} fill={FADE}>вызывающий читает данные без проверки</text>
      <text x={440} y={146} fontSize={11} fontFamily={MONO} fill={ACCENT}>TS2339: Property 'value' does not exist</text>
      <text x={440} y={172} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>код возврата компилятора: 2</text>
      <text x={440} y={194} fontSize={11} fill={ACCENT}>обработать заставили до запуска</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">про забытое исключение компилятор не скажет ничего — про необработанный результат скажет всегда</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>исключения оставляют для того, что действительно исключительно; ожидаемый отказ возвращают значением</text>
    </Panel>
  ),
};
