import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Приватный блокчейн»: чем закрытая сеть отличается от открытой,
 * кто в ней кто и что поднимается на машине после одной команды. */

export const fabricIntroSchemes: Schemes = {
  'fi-open-vs-closed': (aria) => (
    <Panel id="fig-fi-ovc" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ ВОПРОС, ДВА РАЗНЫХ ОТВЕТА</text>

      <rect x={30} y={62} width={370} height={200} rx={12} fill="rgba(0,0,0,0.26)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={13} fontWeight={700} fill="#fff">Открытая сеть</text>
      <text x={50} y={112} fontSize={11} fontFamily={MONO} fill={FADE}>Ethereum, Waves</text>

      <rect x={430} y={62} width={360} height={200} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={450} y={92} fontSize={13} fontWeight={700} fill="#fff">Закрытая сеть</text>
      <text x={450} y={112} fontSize={11} fontFamily={MONO} fill={ACCENT}>Hyperledger Fabric</text>

      {[
        { y: 142, q: 'кто входит', a: 'любой с кошельком', b: 'только выданный сертификат' },
        { y: 172, q: 'кто видит', a: 'весь мир', b: 'участники канала' },
        { y: 202, q: 'кто подтверждает', a: 'неизвестные машины', b: 'названные организации' },
        { y: 232, q: 'плата за запись', a: 'газ в монете сети', b: 'нет, сеть своя' },
      ].map((r) => (
        <g key={r.y}>
          <text x={50} y={r.y} fontSize={10.5} fill={FADE}>{r.q}</text>
          <text x={190} y={r.y} fontSize={11.5} fill="#fff">{r.a}</text>
          <text x={450} y={r.y} fontSize={10.5} fill={FADE}>{r.q}</text>
          <text x={590} y={r.y} fontSize={11.5} fill={ACCENT}>{r.b}</text>
        </g>
      ))}

      <text x={30} y={292} fontSize={12.5} fill="#fff">закрытая сеть не «блокчейн попроще»: она отвечает на другой вопрос — не «как доверять незнакомцам»,</text>
      <text x={30} y={312} fontSize={12.5} fill={FADE}>а «как вести общий журнал организациям, которые знают друг друга, но друг другу не подчиняются»</text>
    </Panel>
  ),

  'fi-who-is-who': (aria) => (
    <Panel id="fig-fi-who" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕТЫРЕ РОЛИ, БЕЗ КОТОРЫХ СЕТЬ НЕ СОБИРАЕТСЯ</text>

      {[
        { x: 30, t: 'Организация', s: 'Org1MSP', d: ['участник сети:', 'колледж, банк,', 'поставщик'] },
        { x: 230, t: 'Пир', s: 'peer0.org1', d: ['хранит реестр,', 'исполняет код,', 'подписывает'] },
        { x: 430, t: 'Упорядочиватель', s: 'orderer', d: ['ставит сделки', 'в очередь и', 'режет на блоки'] },
        { x: 630, t: 'Удостоверяющий', s: 'ca.org1', d: ['выдаёт всем', 'сертификаты —', 'вместо кошелька'] },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={160} height={128} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
          <text x={c.x + 16} y={92} fontSize={12.5} fontWeight={700} fill="#fff">{c.t}</text>
          <text x={c.x + 16} y={110} fontSize={10} fontFamily={MONO} fill={ACCENT}>{c.s}</text>
          {c.d.map((line, i) => (
            <text key={i} x={c.x + 16} y={134 + i * 17} fontSize={10.5} fill={FADE}>{line}</text>
          ))}
        </g>
      ))}

      <rect x={30} y={214} width={760} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={242} fontSize={12} fill="#fff">Канал — отдельный реестр внутри сети: у каждого канала свой список организаций и своя история</text>

      <text x={30} y={288} fontSize={12.5} fill="#fff">в открытой сети роль одна — узел; здесь обязанности разведены, и каждую можно поручить другому</text>
      <text x={30} y={312} fontSize={12.5} fill={FADE}>удостоверяющий центр — то место, где «завести кошелёк» заменяется на «получить пропуск»</text>
    </Panel>
  ),

  'fi-after-up': (aria) => (
    <Panel id="fig-fi-up" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПОДНЯЛОСЬ ПОСЛЕ ./NETWORK.SH UP</text>

      {[
        { y: 66, n: 'orderer.example.com', p: '7050', o: 'упорядочиватель' },
        { y: 122, n: 'peer0.org1.example.com', p: '7051', o: 'пир первой организации' },
        { y: 178, n: 'peer0.org2.example.com', p: '9051', o: 'пир второй организации' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={300} height={42} rx={9} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={1.8} />
          <text x={48} y={r.y + 26} fontSize={11} fontFamily={MONO} fill="#fff">{r.n}</text>
          <rect x={348} y={r.y} width={96} height={42} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={396} y={r.y + 26} textAnchor="middle" fontSize={12} fontFamily={MONO} fill={ACCENT}>{r.p}</text>
          <text x={464} y={r.y + 26} fontSize={11.5} fill={FADE}>{r.o}</text>
        </g>
      ))}

      <Arrow x1={180} y1={110} x2={180} y2={62} color={ACCENT} w={2.2} />
      <Arrow x1={180} y1={166} x2={180} y2={118} color={ACCENT} w={2.2} />

      <text x={30} y={250} fontSize={12.5} fill="#fff">три контейнера — это ещё не сеть: реестра нет, пока не создан канал</text>
      <text x={30} y={274} fontSize={12.5} fill={FADE}>высота цепочки после создания канала — 1: в ней лежит один блок с настройками</text>
      <text x={30} y={296} fontSize={12.5} fill={ACCENT}>удостоверяющие центры в учебной сети заменены готовыми сертификатами из папки organizations</text>
    </Panel>
  ),
};
