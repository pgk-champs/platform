import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Свои типы»: any против unknown, объединение с меткой
 * против наивного описания и что даёт обобщение. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const tsTypesSchemes: Schemes = {
  'tt-any-vs-unknown': (aria) => (
    <Panel id="fig-tt-any" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН РАЗБОР ОТВЕТА, ДВА ТИПА — И РАЗНЫЙ МОМЕНТ ПАДЕНИЯ</text>

      <rect x={30} y={66} width={370} height={140} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">any — «не смотри сюда»</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>проверка типов: 0 ошибок</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>запуск: TypeError</text>
      <text x={50} y={166} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>Cannot read properties of undefined</text>
      <text x={50} y={190} fontSize={11} fill={RED_TEXT}>падение увидит пользователь</text>

      <rect x={420} y={66} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">unknown — «сначала проверь»</text>
      <text x={440} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>TS18046: 'tx' is of type 'unknown'</text>
      <text x={440} y={144} fontSize={11.5} fill={ACCENT}>до запуска дело не дошло</text>
      <text x={440} y={168} fontSize={11.5} fill={FADE}>после проверки формы:</text>
      <text x={440} y={190} fontSize={11} fontFamily={MONO} fill={ACCENT}>id = 0xabc | amount = 100</text>

      <text x={30} y={244} fontSize={12.5} fill="#fff">разбор ответа из сети всегда начинают с unknown: что придёт на самом деле, программа не знает</text>
      <text x={30} y={270} fontSize={12.5} fill={FADE}>обещание вида «здесь точно такой тип» ничего не проверяет — оно только затыкает компилятор</text>
    </Panel>
  ),

  'tt-tagged-union': (aria) => (
    <Panel id="fig-tt-tagged" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО ПОЛЕ-МЕТКА ПРЕВРАЩАЕТ ПАДЕНИЕ В ОШИБКУ СБОРКИ</text>

      <rect x={30} y={66} width={370} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">наивно: всё необязательное</text>
      <text x={50} y={116} fontSize={10.5} fontFamily={MONO} fill={FADE}>{'{ ok: boolean; data?; error? }'}</text>
      <text x={50} y={144} fontSize={11.5} fill={FADE}>компилятор: 0 ошибок</text>
      <text x={50} y={168} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>запуск: TypeError</text>
      <text x={50} y={194} fontSize={11} fill={RED_TEXT}>связи между ok и data в типе нет</text>

      <rect x={420} y={66} width={370} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fill="#fff">объединение с меткой</text>
      <text x={440} y={116} fontSize={10} fontFamily={MONO} fill={FADE}>{'{ ok: true; data } | { ok: false; error }'}</text>
      <text x={440} y={144} fontSize={11} fontFamily={MONO} fill={ACCENT}>TS2339: Property 'data' does not exist</text>
      <text x={440} y={168} fontSize={11.5} fill={ACCENT}>до запуска дело не дошло</text>
      <text x={440} y={194} fontSize={11} fill={ACCENT}>после проверки метки — обе ветки работают</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">компилятор сам сужает тип после проверки метки: в успешной ветке есть данные, в другой — причина</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>наивный вариант пишется быстрее и потому опаснее: он выглядит рабочим ровно до первой ошибки узла</text>
      <text x={30} y={302} fontSize={12.5} fill={ACCENT}>это тот же приём, что «результат вместо исключения», только записанный в типе</text>
    </Panel>
  ),

  'tt-generics': (aria) => (
    <Panel id="fig-tt-gen" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ТЕРЯЕТСЯ БЕЗ ОБОБЩЕНИЙ</text>

      <rect x={30} y={66} width={370} height={132} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">группировка по any[] и строке</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>компилятор: 0 ошибок</text>
      <text x={50} y={144} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>ключи группировки: [ 'undefined' ]</text>
      <text x={50} y={168} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>сумма: undefined</text>
      <text x={50} y={190} fontSize={11} fill={RED_TEXT}>опечатка в имени поля прошла молча</text>

      <rect x={420} y={66} width={370} height={132} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12} fontFamily={MONO} fill="#fff">та же функция с обобщением</text>
      <text x={440} y={118} fontSize={10} fontFamily={MONO} fill={ACCENT}>TS2345: "statuss" is not assignable</text>
      <text x={440} y={140} fontSize={10} fontFamily={MONO} fill={ACCENT}>TS2551: Did you mean 'amount'?</text>
      <text x={440} y={166} fontSize={11} fontFamily={MONO} fill={ACCENT}>ключи: confirmed, pending · сумма 140</text>
      <text x={440} y={190} fontSize={11} fill={ACCENT}>компилятор подсказал верное имя сам</text>

      <text x={30} y={236} fontSize={12.5} fill="#fff">обобщение — это параметр не для значения, а для типа: чем накормили, то и вернётся</text>
      <text x={30} y={262} fontSize={12.5} fill={FADE}>ограничение «только ключ этого типа» и превращает опечатку в ошибку сборки</text>
    </Panel>
  ),
};
