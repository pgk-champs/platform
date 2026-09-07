import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Прокси и обновление логики»: call против delegatecall,
 * обновление без смены адреса и съехавшая раскладка хранилища. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const proxyUpgradeSchemes: Schemes = {
  'pu-call-vs-delegate': (aria) => (
    <Panel id="fig-pu-call" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ КОД, ДВА СПОСОБА ЕГО ПОЗВАТЬ</text>

      <text x={420} y={66} textAnchor="end" fontSize={11} fill={FADE}>обычный вызов</text>
      <text x={660} y={66} textAnchor="end" fontSize={11} fill={ACCENT}>delegatecall</text>

      {[
        { y: 76, t: 'чей код выполняется', a: 'чужой', b: 'чужой', same: true },
        { y: 118, t: 'чьё хранилище меняется', a: 'чужое', b: 'своё', same: false },
        { y: 160, t: 'чему равен address(this)', a: 'чужой адрес', b: 'свой адрес', same: false },
        { y: 202, t: 'кем оказывается msg.sender', a: 'вызывающий контракт', b: 'человек', same: false },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={760} height={32} rx={8} fill="rgba(0,0,0,0.24)" stroke={INK} strokeWidth={1.6} />
          <text x={48} y={r.y + 21} fontSize={11.5} fill="#fff">{r.t}</text>
          <text x={420} y={r.y + 21} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={FADE}>{r.a}</text>
          <text x={660} y={r.y + 21} textAnchor="end" fontSize={11.5} fontFamily={MONO} fill={r.same ? FADE : ACCENT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={264} fontSize={12.5} fill="#fff">delegatecall выполняет чужой код в своём хранилище — и эфир при этом никуда не уходит</text>
      <text x={30} y={288} fontSize={12.5} fill={FADE}>на этом и стоит прокси: код меняется, память остаётся</text>
    </Panel>
  ),

  'pu-proxy-upgrade': (aria) => (
    <Panel id="fig-pu-upgrade" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОБНОВЛЕНИЕ — ЭТО ОДНА ЗАПИСЬ В СПРЯТАННЫЙ СЛОТ</text>

      <rect x={30} y={70} width={260} height={150} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={96} fontSize={12} fill="#fff">прокси</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>0xe7f1…0512</text>
      <text x={50} y={148} fontSize={11} fontFamily={MONO} fill={FADE}>слот 0: владелец</text>
      <text x={50} y={168} fontSize={11} fontFamily={MONO} fill={FADE}>слот 1: ставка 10</text>
      <text x={50} y={188} fontSize={11} fontFamily={MONO} fill={FADE}>слот 2: вклады 1000</text>
      <text x={50} y={210} fontSize={10.5} fontFamily={MONO} fill={ACCENT}>слот 0x3608…2bbc: адрес кода</text>

      <Arrow x1={298} y1={116} x2={378} y2={116} color={FADE} w={2.5} />
      <text x={338} y={106} textAnchor="middle" fontSize={10} fill={FADE}>было</text>
      <Arrow x1={298} y1={176} x2={378} y2={176} color={ACCENT} w={2.5} />
      <text x={338} y={166} textAnchor="middle" fontSize={10} fill={ACCENT}>стало</text>

      <rect x={386} y={86} width={404} height={60} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={406} y={110} fontSize={11.5} fill="#fff">реализация V1</text>
      <text x={406} y={132} fontSize={11} fontFamily={MONO} fill={FADE}>проценты, вклады</text>

      <rect x={386} y={146} width={404} height={60} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={406} y={170} fontSize={11.5} fill="#fff">реализация V2</text>
      <text x={406} y={192} fontSize={11} fontFamily={MONO} fill={ACCENT}>то же плюс новая функция и другая ставка</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">адрес прокси до и после обновления один и тот же; ставка и вклады пережили подмену кода</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>у самой реализации владелец нулевой, а ставка 0: её конструктор в память прокси не попадает</text>
      <text x={30} y={302} fontSize={12.5} fill={ACCENT}>поэтому вместо конструктора — функция начальной настройки, вызываемая через прокси один раз</text>
    </Panel>
  ),

  'pu-storage-shift': (aria) => (
    <Panel id="fig-pu-shift" w={820} h={320} aria={aria}>
      <text x={30} y={34} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПРОКСИ ХРАНИТ БАЙТЫ, А НЕ СМЫСЛ</text>

      <text x={30} y={62} fontSize={11.5} fill={FADE}>байты в слотах не меняются — меняется то, как их читают</text>

      {[
        { y: 76, s: 'слот 0', v: '0x…70997970C518…79C8', a: 'казна: адрес anna', b: 'ставка: 642829559307850963…', ok: false },
        { y: 138, s: 'слот 1', v: '0x…0000000a', a: 'ставка: 10', b: 'казна: 0x000…00A', ok: false },
        { y: 200, s: 'слот 2', v: '0x…000001f4', a: 'долг: 500', b: 'долг: 500', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 20} fontSize={11} fontFamily={MONO} fill="#fff">{r.s}</text>
          <text x={30} y={r.y + 40} fontSize={10} fontFamily={MONO} fill={FADE}>{r.v}</text>
          <rect x={250} y={r.y} width={250} height={52} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={266} y={r.y + 31} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.a}</text>
          <Arrow x1={508} y1={r.y + 26} x2={534} y2={r.y + 26} color={FADE} w={2} />
          <rect x={542} y={r.y} width={248} height={52} rx={9}
            fill={r.ok ? SOFT : 'rgba(255,140,140,0.14)'} stroke={r.ok ? ACCENT : RED} strokeWidth={1.8} />
          <text x={558} y={r.y + 31} fontSize={10.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={278} fontSize={12.5} fill="#fff">у новой версии поля объявлены в другом порядке — адрес читается как число, число как адрес</text>
      <text x={30} y={302} fontSize={12.5} fill={ACCENT}>новые поля добавляют только в конец: вставка в середину сдвигает всё, что за ней</text>
    </Panel>
  ),
};
