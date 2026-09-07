import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Хранение данных»: дыра после delete, цена записи в ячейку
 * и журнал событий против истории в хранилище. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const solidityStorageSchemes: Schemes = {
  'ss-delete-hole': (aria) => (
    <Panel id="fig-ss-delete" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>DELETE НЕ УКОРАЧИВАЕТ МАССИВ — ОН ОБНУЛЯЕТ ЯЧЕЙКУ</text>

      <text x={30} y={68} fontSize={11.5} fill={FADE}>было: длина 3</text>
      {[
        { x: 30, t: 'anna' },
        { x: 190, t: 'boris' },
        { x: 350, t: 'vera' },
      ].map((c, i) => (
        <g key={c.t}>
          <rect x={c.x} y={78} width={150} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={c.x + 12} y={103} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>[{i}] {c.t}</text>
        </g>
      ))}

      <Arrow x1={255} y1={128} x2={255} y2={150} color={FADE} w={2.5} />
      <text x={278} y={146} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>delete requests[1]</text>

      <text x={30} y={178} fontSize={11.5} fill={FADE}>стало: длина по-прежнему 3</text>
      {[
        { x: 30, t: '[0] anna', ok: true },
        { x: 190, t: '[1] «» · 0x0000…0000', ok: false },
        { x: 350, t: '[2] vera', ok: true },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={188} width={150} height={40} rx={9}
            fill={c.ok ? SOFT : 'rgba(255,140,140,0.12)'} stroke={c.ok ? ACCENT : RED} strokeWidth={2} strokeDasharray={c.ok ? undefined : '5 4'} />
          <text x={c.x + 12} y={213} fontSize={10.5} fontFamily={MONO} fill={c.ok ? ACCENT : RED_TEXT}>{c.t}</text>
        </g>
      ))}

      <rect x={530} y={78} width={260} height={150} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={550} y={104} fontSize={12} fill="#fff">что видит цикл поиска</text>
      <text x={550} y={130} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>boris найден: false</text>
      <text x={550} y={154} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>нулевой адрес найден: true</text>
      <text x={550} y={182} fontSize={11.5} fill={FADE}>дыра выглядит как заявка</text>
      <text x={550} y={202} fontSize={11.5} fill={FADE}>от адреса 0x000…0000</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">swap-and-pop даёт длину 2, но переставляет последний элемент на место удалённого</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>и стоит дороже: 40 145 газа против 27 499 — за обнулённую ячейку сеть возвращает часть газа</text>
    </Panel>
  ),

  'ss-storage-cost': (aria) => (
    <Panel id="fig-ss-cost" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ SET() — ТРИ РАЗНЫЕ ЦЕНЫ</text>

      {[
        { y: 66, t: 'новая ячейка · 0 → 5', g: '43 746', w: 430, c: RED },
        { y: 116, t: 'перезапись · 5 → 7', g: '26 646', w: 262, c: INK },
        { y: 166, t: 'обнуление · 7 → 0', g: '21 834', w: 215, c: ACCENT },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 24} fontSize={11.5} fill="#fff">{r.t}</text>
          <rect x={250} y={r.y + 6} width={r.w} height={26} rx={7} fill={r.c === ACCENT ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.c} strokeWidth={2} />
          <text x={260 + r.w} y={r.y + 25} fontSize={11.5} fontFamily={MONO} fill={r.c === INK ? FADE : r.c}>{r.g}</text>
        </g>
      ))}

      <text x={30} y={228} fontSize={12.5} fill="#fff">новая ячейка дороже перезаписи на 17 100 — цена превращения нуля в не-ноль</text>
      <text x={30} y={252} fontSize={12.5} fill={ACCENT}>обнуление дешевле перезаписи на 4 812: сеть возвращает часть газа за освобождённую ячейку</text>

      <rect x={30} y={266} width={760} height={30} rx={8} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} strokeDasharray="6 4" />
      <text x={410} y={286} textAnchor="middle" fontSize={11.5} fill={FADE}>десять чисел: в memory — 28 284 газа, в storage — 276 926, в 9,8 раза дороже (≈24 864 за push)</text>
    </Panel>
  ),

  'ss-events-vs-history': (aria) => (
    <Panel id="fig-ss-events" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИТОГИ — В ХРАНИЛИЩЕ, ИСТОРИЯ — В ЖУРНАЛЕ</text>

      <rect x={30} y={66} width={360} height={130} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill="#fff">storage контракта</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>balance[anna] = 140</text>
      <text x={50} y={140} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>operations = 3</text>
      <text x={50} y={168} fontSize={11.5} fill={RED_TEXT}>кто, сколько и когда вносил —</text>
      <text x={50} y={188} fontSize={11.5} fill={RED_TEXT}>такой истории в нём нет</text>

      <rect x={430} y={66} width={360} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={450} y={92} fontSize={12} fill="#fff">журнал событий</text>
      <text x={450} y={118} fontSize={11} fontFamily={MONO} fill={ACCENT}>блок 2: anna внесла 100</text>
      <text x={450} y={140} fontSize={11} fontFamily={MONO} fill={ACCENT}>блок 3: boris внёс 250</text>
      <text x={450} y={162} fontSize={11} fontFamily={MONO} fill={ACCENT}>блок 4: anna внесла 40</text>
      <text x={450} y={188} fontSize={11.5} fill={FADE}>фильтр по indexed-адресу — только anna</text>

      <text x={30} y={234} fontSize={12.5} fill="#fff">пополнение с emit — 34 047 газа; то же пополнение с записью истории в массив — 120 833</text>
      <text x={30} y={260} fontSize={12.5} fill={ACCENT}>журнал дешевле хранилища на 86 786 газа за операцию</text>
      <text x={30} y={286} fontSize={12.5} fill={FADE}>но сам контракт свои события прочитать не может: журнал — для внешнего мира</text>
    </Panel>
  ),
};
