import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Композиция классов»: что наружу отдаёт наследование и что
 * композиция, поверхностное копирование, кто владеет вложенным объектом. */

export const compositionSchemes: Schemes = {
  'cmp-surface': (aria) => (
    <Panel id="fig-cmp-surf" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ВИДНО СНАРУЖИ</text>

      <rect x={30} y={64} width={370} height={186} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12.5} fill="#fff">наследование от ArrayList</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>addTwice()</text>
      <text x={50} y={142} fontSize={11.5} fontFamily={MONO} fill={FADE}>add() · remove() · clear()</text>
      <text x={50} y={164} fontSize={11.5} fontFamily={MONO} fill={FADE}>add(0, …) · set() · sort()</text>
      <text x={50} y={186} fontSize={11.5} fontFamily={MONO} fill={FADE}>…и ещё три десятка</text>
      <rect x={50} y={202} width={330} height={32} rx={8} fill="rgba(255,140,140,0.16)" stroke="rgba(255,140,140,0.8)" strokeWidth={2} />
      <text x={66} y={223} fontSize={11.5} fill="#fff">корзину можно очистить мимо вашего кода</text>

      <rect x={420} y={64} width={370} height={186} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12.5} fill={ACCENT}>композиция: список внутри</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>addTwice()</text>
      <text x={440} y={142} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>add() · total() · list()</text>
      <text x={440} y={172} fontSize={11.5} fill="#fff">и больше ничего</text>
      <rect x={440} y={202} width={330} height={32} rx={8} fill="rgba(255,255,255,0.1)" stroke={ACCENT} strokeWidth={2} />
      <text x={456} y={223} fontSize={11.5} fill={ACCENT}>наружу отдано ровно то, что решили</text>

      <text x={30} y={288} fontSize={12.5} fill="#fff">наследование — это «я такой же»; композиция — «у меня внутри есть»</text>
    </Panel>
  ),

  'cmp-copy': (aria) => (
    <Panel id="fig-cmp-copy" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>copy() КОПИРУЕТ ССЫЛКУ, А НЕ СОДЕРЖИМОЕ</text>

      <rect x={30} y={66} width={220} height={64} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={140} y={92} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">a: Person</text>
      <text x={140} y={114} textAnchor="middle" fontSize={11} fill={FADE}>name = «Олег»</text>

      <rect x={30} y={162} width={220} height={64} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={140} y={188} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">b = a.copy(name = «Никита»)</text>
      <text x={140} y={210} textAnchor="middle" fontSize={11} fill={FADE}>name = «Никита»</text>

      <Arrow x1={256} y1={98} x2={352} y2={140} color={ACCENT} w={3} />
      <Arrow x1={256} y1={194} x2={352} y2={152} color={ACCENT} w={3} />

      <rect x={362} y={112} width={240} height={70} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={482} y={140} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>ОДИН Address</text>
      <text x={482} y={164} textAnchor="middle" fontSize={11} fill="#fff">city = «Москва»</text>

      <text x={622} y={130} fontSize={11.5} fill="#fff">b.address.city = «Москва»</text>
      <text x={622} y={154} fontSize={11.5} fill={ACCENT}>изменились ОБА</text>
      <text x={622} y={178} fontSize={11} fontFamily={MONO} fill={FADE}>a.address === b.address</text>
      <text x={622} y={198} fontSize={11} fontFamily={MONO} fill={FADE}>true</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">правка «копии» задела оригинал — в приложении это «изменил один товар, изменились все»</text>
      <text x={30} y={288} fontSize={12.5} fill={ACCENT}>лечится неизменяемостью вложенного: val вместо var, List вместо MutableList</text>
    </Panel>
  ),

  'cmp-ownership': (aria) => (
    <Panel id="fig-cmp-own" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КТО СОЗДАЁТ ВЛОЖЕННЫЙ ОБЪЕКТ</text>

      <rect x={30} y={64} width={370} height={160} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12.5} fill="#fff">создаёт внутри</text>
      <text x={50} y={118} fontSize={11.5} fontFamily={MONO} fill={FADE}>val basket = Basket()</text>
      <text x={50} y={146} fontSize={11.5} fill={ACCENT}>+ у каждого свой, поделить нельзя</text>
      <text x={50} y={172} fontSize={11.5} fill="#fff">− снаружи не подменить</text>
      <text x={50} y={198} fontSize={11.5} fill="#fff">− в тесте не подсунуть заготовку</text>

      <rect x={420} y={64} width={370} height={160} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={92} fontSize={12.5} fill={ACCENT}>принимает снаружи</text>
      <text x={440} y={118} fontSize={11.5} fontFamily={MONO} fill="#fff">class Order(val basket: Basket)</text>
      <text x={440} y={146} fontSize={11.5} fill={ACCENT}>+ подменяется в тесте</text>
      <text x={440} y={172} fontSize={11.5} fill="#fff">− можно случайно отдать один на двоих</text>
      <text x={440} y={198} fontSize={11.5} fontFamily={MONO} fill={FADE}>c.basket === d.basket → true</text>

      <text x={30} y={262} fontSize={12.5} fill="#fff">второй способ — начало внедрения зависимостей: объект не добывает себе части сам</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>но тогда за «каждому своё» отвечает тот, кто создаёт — а не сам класс</text>
    </Panel>
  ),
};
