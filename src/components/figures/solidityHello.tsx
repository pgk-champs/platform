import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Первый контракт»: текст → байты и ABI, чтение против
 * транзакции, анатомия сообщения компилятора. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityHelloSchemes: Schemes = {
  'sh-text-to-bytes': (aria) => (
    <Panel id="fig-sh-bytes" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОМПИЛЯТОР ДЕЛАЕТ ИЗ ТЕКСТА ДВА ПРОДУКТА</text>

      <rect x={30} y={70} width={220} height={150} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={140} y={96} textAnchor="middle" fontSize={12.5} fill="#fff">Counter.sol</text>
      {['contract Counter {', '  uint256 public count;', '  function inc() public {', '    count = count + 1;', '  }', '}'].map((l, i) => (
        <text key={i} x={46} y={120 + i * 16} fontSize={10} fontFamily={MONO} fill={FADE}>{l}</text>
      ))}
      <text x={140} y={240} textAnchor="middle" fontSize={11} fill={FADE}>10 строк · 656 байт с комментариями</text>

      <Arrow x1={258} y1={120} x2={330} y2={104} color={ACCENT} w={2.5} />
      <Arrow x1={258} y1={170} x2={330} y2={196} color={ACCENT} w={2.5} />
      <text x={294} y={152} textAnchor="middle" fontSize={11} fill={ACCENT}>solc</text>

      <rect x={340} y={70} width={450} height={70} rx={12} fill="rgba(0,0,0,0.28)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={360} y={96} fontSize={12.5} fill="#fff">байткод — для машины</text>
      <text x={360} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>364 байта на развёртывание · 333 останутся в сети</text>

      <rect x={340} y={160} width={450} height={70} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={360} y={186} fontSize={12.5} fill="#fff">ABI — для людей и кошельков</text>
      <text x={360} y={210} fontSize={11} fontFamily={MONO} fill={FADE}>count() view → uint256 · inc() nonpayable</text>

      <text x={30} y={272} fontSize={12.5} fill="#fff">имени inc в байткоде нет — вместо него 4 байта селектора 0x371303c0</text>
      <text x={30} y={298} fontSize={12.5} fill={FADE}>ни одна буква комментария в байткод не попадает</text>
    </Panel>
  ),

  'sh-view-vs-tx': (aria) => (
    <Panel id="fig-sh-viewtx" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТЕНИЕ БЕСПЛАТНО, ЗАПИСЬ СТОИТ ГАЗ</text>

      <rect x={30} y={70} width={370} height={140} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={98} fontSize={12.5} fill="#fff">count() — view</text>
      <text x={50} y={124} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>новых блоков: 0</text>
      <text x={50} y={146} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>списано wei: 0</text>
      <text x={50} y={172} fontSize={11.5} fill={FADE}>узел отвечает сам, в сеть ничего не уходит</text>
      <text x={50} y={194} fontSize={11.5} fill={FADE}>ответ мгновенный</text>

      <rect x={420} y={70} width={370} height={140} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={440} y={98} fontSize={12.5} fill="#fff">inc() — транзакция</text>
      <text x={440} y={124} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>блок: 2 · газ: 43 510</text>
      <text x={440} y={146} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>списано: 0,000077 ETH</text>
      <text x={440} y={172} fontSize={11.5} fill={FADE}>подпись → блок → wait() → результат</text>
      <text x={440} y={194} fontSize={11.5} fill={FADE}>второй inc(): 26 410 — ячейка уже занята</text>

      <rect x={30} y={232} width={760} height={40} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={257} textAnchor="middle" fontSize={11.5} fill="#fff">развёртывание — тоже транзакция: 124 749 газа, потому что 333 байта кода записываются навсегда</text>

      <text x={30} y={306} fontSize={12.5} fill={FADE}>запись в пустую ячейку (0→1) дороже записи в занятую (1→2) на 17 100 газа</text>
    </Panel>
  ),

  'sh-error-anatomy': (aria) => (
    <Panel id="fig-sh-error" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СООБЩЕНИЕ КОМПИЛЯТОРА — ТРИ СТРОКИ</text>

      <rect x={30} y={64} width={500} height={130} rx={12} fill="rgba(0,0,0,0.35)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>ParserError: Expected ';' but got 'function'</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}> --&gt; Counter.sol:7:5:</text>
      <text x={50} y={144} fontSize={11.5} fontFamily={MONO} fill="#fff">7 |     function inc() public {'{'}</text>
      <text x={50} y={168} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>  |     ^^^^^^^^</text>

      <Arrow x1={540} y1={88} x2={580} y2={88} color={FADE} w={2} />
      <text x={588} y={92} fontSize={11.5} fill="#fff">тип ошибки и что ждали</text>
      <Arrow x1={540} y1={114} x2={580} y2={114} color={FADE} w={2} />
      <text x={588} y={118} fontSize={11.5} fill="#fff">файл : строка : столбец</text>
      <Arrow x1={540} y1={156} x2={580} y2={156} color={FADE} w={2} />
      <text x={588} y={160} fontSize={11.5} fill="#fff">стрелки под виновником</text>

      <rect x={30} y={214} width={760} height={40} rx={9} fill="rgba(255,140,140,0.15)" stroke={RED} strokeWidth={2} strokeDasharray="6 4" />
      <text x={410} y={239} textAnchor="middle" fontSize={11.5} fill={RED_TEXT}>пропуск в строке 5, а ошибка указывает на строку 7 — компилятор показывает, где споткнулся</text>

      <text x={30} y={284} fontSize={12.5} fill="#fff">при двух опечатках показывается одна: чинить сверху вниз и компилировать после каждой правки</text>
      <text x={30} y={306} fontSize={12.5} fill={FADE}>ParserError → DeclarationError → TypeError: компилятор проверяет слоями</text>
    </Panel>
  ),
};
