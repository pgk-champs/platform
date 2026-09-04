import React from 'react';
import { ACCENT, Arrow, DARK, FADE, FileIcon, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ООП простыми словами»: класс против экземпляра,
 * инкапсуляция, дерево наследования и интерфейс как договор. */

export const oopSchemes: Schemes = {
  /* один чертёж — много изделий с разными значениями полей */
  'oop-class-vs-instance': (aria) => (
    <Panel id="fig-oop-class" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КЛАСС ЭТО ЧЕРТЁЖ · ЭКЗЕМПЛЯР ЭТО ИЗДЕЛИЕ</text>
      <rect x={30} y={64} width={250} height={210} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={14} fontWeight={700} fill={ACCENT}>class Student</text>
      <FileIcon x={50} y={104} accent />
      <text x={50} y={200} fontSize={13} fontFamily={MONO} fill="#fff">name: String</text>
      <text x={50} y={222} fontSize={13} fontFamily={MONO} fill="#fff">group: String</text>
      <text x={50} y={244} fontSize={13} fontFamily={MONO} fill="#fff">fun greet()</text>
      <text x={50} y={266} fontSize={11.5} fill={FADE}>полей нет — есть только их описание</text>
      <Arrow x1={292} y1={168} x2={352} y2={168} color={ACCENT} w={4} />
      <text x={322} y={150} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={ACCENT}>new / Student()</text>
      {[
        { n: 'Аня', g: 'ИС-31' },
        { n: 'Марат', g: 'ИС-31' },
        { n: 'Лена', g: 'ПКС-12' },
      ].map((row, i) => (
        <g key={row.n}>
          <rect x={370} y={64 + i * 72} width={400} height={60} rx={12} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2} />
          <text x={392} y={90 + i * 72} fontSize={13} fontWeight={700} fill="#fff">экземпляр #{i + 1}</text>
          <text x={392} y={110 + i * 72} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>name = &quot;{row.n}&quot;, group = &quot;{row.g}&quot;</text>
        </g>
      ))}
      <text x={400} y={306} textAnchor="middle" fontSize={13} fill={FADE}>чертёж один, изделий сколько угодно; методы общие, значения полей у каждого свои</text>
    </Panel>
  ),
  /* инкапсуляция: поле спрятано, снаружи только методы-двери */
  'oop-encapsulation': (aria) => (
    <Panel id="fig-oop-encaps" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИНКАПСУЛЯЦИЯ · ПОЛЕ ЗАКРЫТО, ДВЕРИ ОТКРЫТЫ</text>
      <rect x={250} y={70} width={300} height={190} rx={16} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={400} y={100} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">объект Wallet</text>
      <rect x={296} y={116} width={208} height={54} rx={10} fill="rgba(0,0,0,0.35)" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 5" />
      <text x={400} y={140} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={ACCENT}>private balance</text>
      <text x={400} y={158} textAnchor="middle" fontSize={11.5} fill={FADE}>снаружи не видно и не изменить</text>
      <text x={400} y={196} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">deposit(sum)</text>
      <text x={400} y={218} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">withdraw(sum)</text>
      <text x={400} y={244} textAnchor="middle" fontSize={11.5} fill={FADE}>внутри методов живёт проверка</text>
      <Arrow x1={60} y1={150} x2={240} y2={150} color={ACCENT} w={4} />
      <text x={60} y={132} fontSize={12.5} fontWeight={700} fill="#fff">deposit(500)</text>
      <text x={60} y={172} fontSize={11.5} fill={FADE}>проходит: сумма проверена</text>
      <rect x={30} y={214} width={200} height={60} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2} />
      <text x={48} y={238} fontSize={12.5} fontWeight={700} fill="#fff">balance = -900</text>
      <text x={48} y={258} fontSize={11.5} fill={FADE}>невозможно: поля нет снаружи</text>
      <Arrow x1={560} y1={150} x2={700} y2={150} color={ACCENT} w={4} />
      <text x={570} y={132} fontSize={12.5} fontWeight={700} fill="#fff">balance() → 1500</text>
      <text x={570} y={172} fontSize={11.5} fill={FADE}>читать можно, менять — нет</text>
      <text x={400} y={302} textAnchor="middle" fontSize={13} fill={FADE}>прячут не от врагов, а чтобы список мест, где поле меняется, помещался в голове</text>
    </Panel>
  ),
  /* глубокое дерево наследования против плоского с композицией */
  'oop-inheritance-tree': (aria) => (
    <Panel id="fig-oop-tree" w={800} h={340} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ГЛУБОКОЕ ДЕРЕВО ПРОТИВ КОМПОЗИЦИИ</text>
      <rect x={30} y={64} width={340} height={230} rx={14} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={90} fontSize={13} fontWeight={700} fill="#fff">наследование в глубину</text>
      {['Animal', 'Pet', 'Dog', 'RobotDog'].map((t, i) => (
        <g key={t}>
          <rect x={70 + i * 12} y={102 + i * 46} width={180} height={34} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
          <text x={86 + i * 12} y={124 + i * 46} fontSize={13} fontFamily={MONO} fill="#fff">{t}</text>
        </g>
      ))}
      <text x={200} y={284} textAnchor="middle" fontSize={11.5} fill={FADE}>RobotDog не ест — а метод eat() унаследован</text>
      <rect x={410} y={64} width={360} height={230} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={430} y={90} fontSize={13} fontWeight={700} fill={ACCENT}>композиция: «имеет», а не «является»</text>
      <rect x={430} y={104} width={320} height={44} rx={10} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2} />
      <text x={450} y={132} fontSize={14} fontFamily={MONO} fontWeight={700} fill={ACCENT}>class RobotDog</text>
      {[
        { t: 'val barker: Barker', n: 'умеет лаять' },
        { t: 'val walker: Walker', n: 'умеет ходить' },
        { t: 'val battery: Battery', n: 'умеет заряжаться' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={452} y={160 + i * 44} width={298} height={36} rx={9} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2} />
          <text x={470} y={183 + i * 44} fontSize={12.5} fontFamily={MONO} fill="#fff">{row.t}</text>
          <text x={690} y={183 + i * 44} fontSize={11} fill={FADE}>{row.n}</text>
        </g>
      ))}
      <Arrow x1={440} y1={148} x2={440} y2={268} color={ACCENT} w={3} />
      <text x={400} y={320} textAnchor="middle" fontSize={13} fill={FADE}>лишнее поведение не наследуется случайно: берут только те детали, которые нужны</text>
    </Panel>
  ),
  /* интерфейс как договор между вызывающим кодом и реализациями */
  'oop-interface-contract': (aria) => (
    <Panel id="fig-oop-iface" w={800} h={330} aria={aria}>
      <text x={30} y={42} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ИНТЕРФЕЙС ЭТО ДОГОВОР · ПОЛИМОРФИЗМ</text>
      <rect x={40} y={110} width={200} height={90} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={140} y={142} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">код оплаты заказа</text>
      <text x={140} y={168} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>pay(1000)</text>
      <text x={140} y={188} textAnchor="middle" fontSize={11} fill={FADE}>не знает, кто исполнитель</text>
      <Arrow x1={252} y1={155} x2={312} y2={155} color={ACCENT} w={4} />
      <rect x={320} y={100} width={170} height={110} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={405} y={130} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={ACCENT}>interface Payment</text>
      <text x={405} y={158} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">pay(sum): Boolean</text>
      <text x={405} y={186} textAnchor="middle" fontSize={11} fill={FADE}>только обещание, ни строчки тела</text>
      {[
        { t: 'CardPayment', n: 'списывает с карты' },
        { t: 'CryptoPayment', n: 'шлёт транзакцию' },
        { t: 'FakePayment', n: 'для тестов, ничего не шлёт' },
      ].map((row, i) => (
        <g key={row.t}>
          <rect x={540} y={68 + i * 74} width={230} height={58} rx={11} fill="rgba(0,0,0,0.22)" stroke={INK} strokeWidth={2} />
          <text x={560} y={94 + i * 74} fontSize={13} fontFamily={MONO} fontWeight={700} fill={ACCENT}>{row.t}</text>
          <text x={560} y={113 + i * 74} fontSize={11.5} fill={FADE}>{row.n}</text>
          <Arrow x1={500} y1={155} x2={532} y2={97 + i * 74} color={INK} w={2.5} />
        </g>
      ))}
      <text x={400} y={300} textAnchor="middle" fontSize={13} fill={FADE}>добавить четвёртый способ оплаты — значит написать новый класс, а не править код оплаты</text>
    </Panel>
  ),
};
