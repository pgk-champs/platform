import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Значения и переменные»: имя как ярлык на значении, один тип
 * number на всё, лестница falsy-значений и разница null/undefined. */

export const tsValuesSchemes: Schemes = {
  /* переменная — ярлык, а не коробка */
  'tv-value-vs-var': (aria) => (
    <Panel id="fig-tv-label" w={820} h={320} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИМЯ — ЯРЛЫК, А НЕ КОРОБКА</text>

      <rect x={30} y={64} width={360} height={210} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={52} y={92} fontSize={14} fontWeight={700} fill="#fff">как кажется</text>
      <rect x={52} y={112} width={130} height={70} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={117} y={140} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">height</text>
      <text x={117} y={166} textAnchor="middle" fontSize={18} fontWeight={800} fill="#fff">152340</text>
      <text x={52} y={214} fontSize={12.5} fill={FADE}>коробка с числом внутри</text>
      <text x={52} y={238} fontSize={12.5} fill={FADE}>присваивание меняет</text>
      <text x={52} y={256} fontSize={12.5} fill={FADE}>содержимое коробки</text>

      <rect x={430} y={64} width={360} height={210} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={92} fontSize={14} fontWeight={700} fill={ACCENT}>как на самом деле</text>

      <circle cx={700} cy={148} r={44} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={700} y={144} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff">152340</text>
      <text x={700} y={164} textAnchor="middle" fontSize={11} fill={FADE}>значение</text>

      <rect x={452} y={112} width={104} height={34} rx={8} fill={ACCENT} />
      <text x={504} y={135} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">height</text>
      <Arrow x1={560} y1={129} x2={650} y2={142} color={ACCENT} w={3} />

      <rect x={452} y={158} width={104} height={34} rx={8} fill="rgba(255,255,255,0.2)" stroke={INK} strokeWidth={2} />
      <text x={504} y={181} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">last</text>
      <Arrow x1={560} y1={175} x2={650} y2={158} color={INK} w={3} />

      <text x={452} y={224} fontSize={12.5} fill={FADE}>два ярлыка на одном значении</text>
      <text x={452} y={248} fontSize={12.5} fill="#fff">присваивание перевешивает ярлык,</text>
      <text x={452} y={266} fontSize={12.5} fill="#fff">а не трогает значение</text>

      <text x={410} y={306} textAnchor="middle" fontSize={13} fill={FADE}>= читается «получает», а не «равно»</text>
    </Panel>
  ),

  /* один number на всё: где точно, где теряется хвост, где прыгает через одно */
  'tv-number-precision': (aria) => (
    <Panel id="fig-tv-number" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ТИП NUMBER НА ВСЁ</text>

      <rect x={30} y={64} width={760} height={54} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={410} y={97} textAnchor="middle" fontSize={15} fontFamily={MONO} fontWeight={700} fill={ACCENT}>number = IEEE 754 double</text>

      <rect x={30} y={140} width={240} height={130} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={168} fontSize={13.5} fontWeight={700} fill="#fff">целые до 2^53</text>
      <text x={52} y={196} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>2 + 2 === 4</text>
      <text x={52} y={220} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>true</text>
      <text x={52} y={250} fontSize={12} fill={FADE}>арифметика точна</text>

      <rect x={290} y={140} width={240} height={130} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={312} y={168} fontSize={13.5} fontWeight={700} fill="#fff">дроби</text>
      <text x={312} y={196} fontSize={12.5} fontFamily={MONO} fill="#fff">0.1 + 0.2</text>
      <text x={312} y={220} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>0.30000000000000004</text>
      <text x={312} y={250} fontSize={12} fill={FADE}>хвост теряется</text>

      <rect x={550} y={140} width={240} height={130} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={572} y={168} fontSize={13.5} fontWeight={700} fill="#fff">за 2^53</text>
      <text x={572} y={196} fontSize={12.5} fontFamily={MONO} fill="#fff">9007199254740992</text>
      <text x={572} y={220} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>+ 1 === то же самое</text>
      <text x={572} y={250} fontSize={12} fill={FADE}>шаг через одно</text>

      <text x={410} y={302} textAnchor="middle" fontSize={13} fill="#fff">суммы монет считают в целых или через bigint, а не дробями</text>
    </Panel>
  ),

  /* восемь falsy и всё остальное */
  'tv-falsy-ladder': (aria) => (
    <Panel id="fig-tv-falsy" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВОСЕМЬ FALSY И ВСЁ ОСТАЛЬНОЕ</text>

      <rect x={30} y={64} width={360} height={240} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={52} y={92} fontSize={14} fontWeight={700} fill="#fff">falsy — условие ложно</text>
      {['false', '0', '-0', '0n', '""', 'null', 'undefined', 'NaN'].map((t, i) => (
        <text key={t} x={52 + (i % 2) * 170} y={126 + Math.floor(i / 2) * 34} fontSize={14} fontFamily={MONO} fill={ACCENT}>{t}</text>
      ))}
      <text x={52} y={286} fontSize={12} fill={FADE}>список закрытый: больше ничего нет</text>

      <rect x={430} y={64} width={360} height={240} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={92} fontSize={14} fontWeight={700} fill={ACCENT}>truthy — условие истинно</text>
      {['[]  пустой массив', '{}  пустой объект', '"0"  строка с нулём', '"false"  строка', '-1  любое число, кроме 0', 'function () {}'].map((t, i) => (
        <text key={t} x={452} y={126 + i * 28} fontSize={13} fontFamily={MONO} fill="#fff">{t}</text>
      ))}
      <text x={452} y={296} fontSize={12} fill={FADE}>здесь и ломается интуиция</text>

      <text x={410} y={330} textAnchor="middle" fontSize={12.5} fill={FADE}>?? проверяет только null и undefined, а два знака | подряд — всю левую колонку</text>
    </Panel>
  ),

  /* undefined появляется сам, null кладут руками */
  'tv-null-undefined': (aria) => (
    <Panel id="fig-tv-null" w={820} h={320} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВЕ РАЗНЫЕ ПУСТОТЫ</text>

      <rect x={30} y={64} width={360} height={190} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={92} fontSize={15} fontFamily={MONO} fontWeight={700} fill="#fff">undefined</text>
      <text x={52} y={116} fontSize={12.5} fill={FADE}>возникает само собой</text>
      {['объявили без значения', 'поля объекта нет', 'аргумент не передали', 'функция без return'].map((t, i) => (
        <text key={t} x={52} y={148 + i * 26} fontSize={12.5} fill="#fff">{t}</text>
      ))}

      <rect x={430} y={64} width={360} height={190} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={92} fontSize={15} fontFamily={MONO} fontWeight={700} fill={ACCENT}>null</text>
      <text x={452} y={116} fontSize={12.5} fill={FADE}>кладут руками</text>
      {['«значения нет намеренно»', 'ответ пришёл пустым', 'поле сброшено явно', 'сам собой не появится'].map((t, i) => (
        <text key={t} x={452} y={148 + i * 26} fontSize={12.5} fill="#fff">{t}</text>
      ))}

      <rect x={30} y={268} width={370} height={34} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={215} y={291} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">null === undefined → false</text>

      <rect x={420} y={268} width={370} height={34} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={605} y={291} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>null == undefined → true</text>
    </Panel>
  ),
};
