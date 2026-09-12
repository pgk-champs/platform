import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Fabric и Ethereum»: одна задача двумя способами,
 * сравнение по осям и правило выбора. */

export const fabricVsEthSchemes: Schemes = {
  'fve-same-task': (aria) => (
    <Panel id="fig-fve-task" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ЗАЧЁТКА, ДВЕ РЕАЛИЗАЦИИ — ЖИВОЙ ПРОГОН</text>

      <text x={300} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">Solidity + geth</text>
      <text x={620} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ACCENT}>Чейнкод + Fabric</text>

      {[
        { y: 84, k: 'развернуть', a: '994 183 газа', b: 'пять шагов, газа нет' },
        { y: 116, k: 'завести зачётку', a: '95 512 газа', b: 'газа нет' },
        { y: 148, k: 'поставить оценку', a: '96 830 газа', b: 'газа нет' },
        { y: 180, k: 'запись, время', a: 'блок сети', b: '2,1 с (таймаут пачки)' },
        { y: 212, k: 'чтение, время', a: 'бесплатно, мгновенно', b: '0,06 с' },
        { y: 244, k: 'история поля', a: 'только через события', b: 'getHistoryForKey' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11} fill={FADE}>{r.k}</text>
          <text x={190} y={r.y} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.a}</text>
          <text x={470} y={r.y} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={288} fontSize={12.5} fill="#fff">одинаковые проверки, одинаковые отказы — разная цена и разные встроенные возможности</text>
    </Panel>
  ),

  'fve-axes': (aria) => (
    <Panel id="fig-fve-axes" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ВОСЕМЬ ОТЛИЧИЙ, КОТОРЫЕ РЕШАЮТ ВСЁ ОСТАЛЬНОЕ</text>

      <text x={300} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#fff">Ethereum</text>
      <text x={620} y={64} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={ACCENT}>Fabric</text>

      {[
        { y: 88, k: 'личность', a: 'ключ, придуманный самим', b: 'выданный сертификат' },
        { y: 118, k: 'кто читает', a: 'весь мир', b: 'участники канала' },
        { y: 148, k: 'язык', a: 'Solidity', b: 'TypeScript, Go, Java' },
        { y: 178, k: 'порядок работы', a: 'упорядочить → исполнить', b: 'исполнить → упорядочить' },
        { y: 208, k: 'окончательность', a: 'через подтверждения', b: 'сразу' },
        { y: 238, k: 'плата', a: 'газ в монете сети', b: 'нет' },
        { y: 268, k: 'обновление кода', a: 'новый адрес или прокси', b: 'номер правки +1' },
        { y: 298, k: 'состояние', a: 'поля контракта', b: 'общее хранилище ключ-значение' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11} fill={FADE}>{r.k}</text>
          <text x={190} y={r.y} fontSize={11.5} fill="#fff">{r.a}</text>
          <text x={470} y={r.y} fontSize={11.5} fill={ACCENT}>{r.b}</text>
        </g>
      ))}
    </Panel>
  ),

  'fve-choose': (aria) => (
    <Panel id="fig-fve-choose" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ВОПРОС РЕШАЕТ ВЫБОР</text>

      <rect x={180} y={62} width={460} height={48} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={410} y={92} textAnchor="middle" fontSize={13} fill="#fff">Участники известны заранее и связаны договором?</text>

      <Arrow x1={300} y1={114} x2={200} y2={150} color={INK} w={2.2} />
      <Arrow x1={520} y1={114} x2={620} y2={150} color={ACCENT} w={2.2} />

      <rect x={30} y={154} width={340} height={100} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={180} fontSize={12} fontWeight={700} fill="#fff">Нет — открытая сеть</text>
      <text x={50} y={204} fontSize={11} fill={FADE}>токены, публичные рынки, кошелёк у любого</text>
      <text x={50} y={226} fontSize={11} fill={FADE}>цена: газ, публичность, чужая скорость</text>

      <rect x={450} y={154} width={340} height={100} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={470} y={180} fontSize={12} fontWeight={700} fill="#fff">Да — закрытая сеть</text>
      <text x={470} y={204} fontSize={11} fill={FADE}>журналы, поставки, дипломы, документы</text>
      <text x={470} y={226} fontSize={11} fill={FADE}>цена: своя инфраструктура и договор</text>

      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>если участников нельзя назвать по именам — закрытая сеть не подойдёт, как бы ни хотелось</text>
    </Panel>
  ),
};
