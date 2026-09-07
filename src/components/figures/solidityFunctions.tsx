import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Функции»: видимость и ABI, чтение против записи,
 * порядок модификаторов и два способа отправить эфир. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityFunctionsSchemes: Schemes = {
  'sfn-visibility': (aria) => (
    <Panel id="fig-sfn-vis" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПЯТЬ ФУНКЦИЙ В КОНТРАКТЕ, ТРИ — СНАРУЖИ</text>

      <rect x={30} y={66} width={300} height={200} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={180} y={92} textAnchor="middle" fontSize={12} fill="#fff">контракт</text>
      {[
        { y: 110, n: 'openForAll  public', out: true },
        { y: 140, n: 'onlyOutside external', out: true },
        { y: 170, n: 'callHidden  public', out: true },
        { y: 200, n: 'onlyInside  internal', out: false },
        { y: 230, n: 'onlyHere    private', out: false },
      ].map((f) => (
        <g key={f.y}>
          <rect x={48} y={f.y} width={264} height={24} rx={6}
            fill={f.out ? SOFT : 'rgba(255,140,140,0.12)'} stroke={f.out ? ACCENT : RED} strokeWidth={1.8} />
          <text x={62} y={f.y + 17} fontSize={11} fontFamily={MONO} fill={f.out ? ACCENT : RED_TEXT}>{f.n}</text>
        </g>
      ))}

      <Arrow x1={340} y1={140} x2={400} y2={140} color={ACCENT} w={2.5} />
      <text x={370} y={128} textAnchor="middle" fontSize={11} fill={FADE}>ABI</text>

      <rect x={410} y={66} width={380} height={110} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={430} y={92} fontSize={12} fill="#fff">что видит скрипт и кошелёк</text>
      <text x={430} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>openForAll() · onlyOutside() · callHidden()</text>
      <text x={430} y={144} fontSize={11.5} fill={FADE}>c.onlyHere → undefined</text>
      <text x={430} y={164} fontSize={11.5} fill={RED_TEXT}>c.onlyHere() → c.onlyHere is not a function</text>

      <text x={410} y={206} fontSize={12.5} fill="#fff">callHidden() вернул 84: внутренние функции отработали — просто внутри</text>
      <text x={410} y={232} fontSize={12.5} fill={FADE}>private не значит «секретно»: байткод публичен, скрыт только вход</text>
      <text x={410} y={258} fontSize={12.5} fill={FADE}>имени функции в цепи нет — только 4 байта селектора: 0xc9dc5bc6</text>
    </Panel>
  ),

  'sfn-view-vs-write': (aria) => (
    <Panel id="fig-sfn-view" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА И ТА ЖЕ АРИФМЕТИКА: 0 WEI ИЛИ 44 230 ГАЗА</text>

      <rect x={30} y={66} width={360} height={120} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">pure / view</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>узел считает у себя и отвечает</text>
      <text x={50} y={144} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>списано: 0 wei</text>
      <text x={50} y={168} fontSize={11.5} fill={FADE}>блоков не создаётся, ответ сразу</text>

      <rect x={430} y={66} width={360} height={120} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={450} y={92} fontSize={12} fontFamily={MONO} fill="#fff">функция без view — транзакция</text>
      <text x={450} y={118} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>1-я запись (0 → 5): 44 230 газа</text>
      <text x={450} y={144} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>2-я запись (5 → 10): 27 130 газа</text>
      <text x={450} y={168} fontSize={11.5} fill={FADE}>разница 17 100 — цена заполнения нуля</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">пишущая функция возвращает наружу не число, а объект транзакции: результат читают отдельным вызовом</text>
      <text x={30} y={250} fontSize={12.5} fill={FADE}>если бы то же чтение отправили транзакцией, оно стоило бы 24 138 газа — из них 21 000 базовая цена</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>view — обещание компилятору: запись внутри такой функции не соберётся</text>
    </Panel>
  ),

  'sfn-modifier-order': (aria) => (
    <Panel id="fig-sfn-mod" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>«_;» — ЭТО МЕСТО, КУДА ВСТАВЛЯЕТСЯ ТЕЛО ФУНКЦИИ</text>

      <rect x={30} y={66} width={470} height={150} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill={FADE}>modifier onlyRole(Role r) {'{'}</text>
      <text x={64} y={116} fontSize={11.5} fontFamily={MONO} fill="#fff">require(roles[msg.sender] == r, …);</text>
      <text x={64} y={140} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>шаг 1: до тела</text>
      <text x={64} y={164} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>_;   ← сюда встаёт шаг 2: тело функции</text>
      <text x={64} y={188} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>шаг 3: после тела</text>
      <text x={50} y={208} fontSize={11.5} fontFamily={MONO} fill={FADE}>{'}'}</text>

      <rect x={520} y={66} width={270} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={540} y={92} fontSize={12} fill="#fff">живая трасса вызова</text>
      <text x={540} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>шаг 1 · шаг 2 · шаг 3</text>
      <text x={540} y={148} fontSize={11.5} fill={FADE}>при неверной роли:</text>
      <text x={540} y={172} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>отказ, счётчик не сдвинулся</text>
      <text x={540} y={196} fontSize={11.5} fill={FADE}>require упал ДО «_;»</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">код после «_;» действительно выполняется — модификатор оборачивает функцию, а не только предваряет её</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>несколько модификаторов срабатывают слева направо; отказ в любом откатывает всю транзакцию</text>
    </Panel>
  ),

  'sfn-transfer-vs-call': (aria) => (
    <Panel id="fig-sfn-send" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПОЛУЧАТЕЛЬ, ОДИН WEI, ДВА СПОСОБА ОТПРАВИТЬ</text>

      <rect x={30} y={66} width={360} height={120} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fontFamily={MONO} fill="#fff">payable(to).transfer(1)</text>
      <text x={50} y={118} fontSize={11.5} fill={FADE}>получателю отдаётся ровно 2300 газа</text>
      <text x={50} y={144} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>contract call run out of gas</text>
      <text x={50} y={168} fontSize={11.5} fill={RED_TEXT}>вся транзакция откатилась</text>

      <rect x={430} y={66} width={360} height={120} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={450} y={92} fontSize={12} fontFamily={MONO} fill="#fff">to.call{'{'}value: 1{'}'}("")</text>
      <text x={450} y={118} fontSize={11.5} fill={FADE}>газ не ограничен искусственно</text>
      <text x={450} y={144} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>прошло за 53 842 газа</text>
      <text x={450} y={168} fontSize={11.5} fill={ACCENT}>получатель записал у себя count = 1</text>

      <text x={30} y={224} fontSize={12.5} fill="#fff">получатель — контракт, который при приёме пишет в хранилище: в 2300 газа такая запись не помещается</text>
      <text x={30} y={250} fontSize={12.5} fill={FADE}>по тексту двух функций разницы не видно — видно только по результату</text>
    </Panel>
  ),
};
