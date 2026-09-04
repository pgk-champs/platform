import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ООП на Kotlin»: устройство класса в одну строку, замок final
 * по умолчанию, что дописывает слово data и почему when по sealed знает всё. */

export const kotlinOopSchemes: Schemes = {
  /* заголовок класса содержит и конструктор, и объявление свойств */
  'ko-class-anatomy': (aria) => (
    <Panel id="fig-ko-anatomy" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАГОЛОВОК КЛАССА — ЭТО СРАЗУ И КОНСТРУКТОР, И СВОЙСТВА</text>

      <rect x={30} y={62} width={760} height={58} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={99} fontSize={16} fontFamily={MONO} fill="#fff">class Wallet(val owner: String, var balance: Int = 0) &#123;</text>

      {[
        { x: 44, w: 92, label: 'class', note: 'ключевое слово' },
        { x: 152, w: 100, label: 'Wallet', note: 'имя с большой буквы' },
        { x: 256, w: 180, label: 'val owner: String', note: 'свойство и параметр сразу' },
        { x: 444, w: 210, label: 'var balance: Int = 0', note: 'значение по умолчанию' },
      ].map((c) => (
        <g key={c.label}>
          <path d={`M${c.x + c.w / 2} 122v22`} stroke={ACCENT} strokeWidth={2} />
          <rect x={c.x} y={146} width={c.w} height={30} rx={8} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={c.x + c.w / 2} y={166} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill="#fff">{c.label}</text>
          <text x={c.x + c.w / 2} y={196} textAnchor="middle" fontSize={11} fill={FADE}>{c.note}</text>
        </g>
      ))}

      <rect x={30} y={224} width={370} height={86} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={250} fontSize={12} fill={FADE}>тело класса:</text>
      <text x={50} y={274} fontSize={13} fontFamily={MONO} fill="#fff">init &#123; ... &#125;</text>
      <text x={50} y={298} fontSize={13} fontFamily={MONO} fill="#fff">fun deposit(amount: Int)</text>

      <text x={430} y={252} fontSize={12.5} fill="#fff">init выполняется при создании объекта</text>
      <text x={430} y={278} fontSize={12.5} fill={FADE}>метод — обычная функция, живущая внутри класса</text>
      <text x={430} y={304} fontSize={12.5} fill={ACCENT}>в Java на то же самое ушло бы 30 строк</text>
    </Panel>
  ),

  /* по умолчанию класс закрыт: наследование надо разрешить словом open */
  'ko-open-final': (aria) => (
    <Panel id="fig-ko-open" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>В KOTLIN КЛАСС ЗАКРЫТ, ПОКА НЕ НАПИСАЛИ OPEN</text>

      <rect x={30} y={70} width={340} height={210} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={100} fontSize={13} fontFamily={MONO} fill="#fff">class Animal</text>
      <rect x={52} y={118} width={120} height={30} rx={8} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={112} y={138} textAnchor="middle" fontSize={12} fill={FADE}>замок закрыт</text>
      <path d="M120 176v-14a24 24 0 0148 0v14" stroke={INK} strokeWidth={3} fill="none" />
      <rect x={106} y={176} width={76} height={54} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={52} y={262} fontSize={12} fill={FADE}>наследоваться нельзя: This type is final</text>

      <rect x={450} y={70} width={340} height={210} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={472} y={100} fontSize={13} fontFamily={MONO} fill={ACCENT}>open class Animal</text>
      <rect x={472} y={118} width={140} height={30} rx={8} fill={ACCENT} />
      <text x={542} y={138} textAnchor="middle" fontSize={12} fontWeight={700} fill="#10243a">замок открыт</text>
      <path d="M540 176v-14a24 24 0 0148 0" stroke={ACCENT} strokeWidth={3} fill="none" />
      <rect x={526} y={176} width={76} height={54} rx={10} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={472} y={262} fontSize={12} fill={ACCENT}>наследники разрешены, метод — тоже через open</text>

      <Arrow x1={372} y1={175} x2={446} y2={175} color={ACCENT} w={3} />
      <text x={30} y={312} fontSize={12.5} fill="#fff">то же и с методом: без open его нельзя переопределить, а без override — нельзя спрятать</text>
    </Panel>
  ),

  /* одно слово data дописывает четыре метода и copy */
  'ko-data-class': (aria) => (
    <Panel id="fig-ko-data" w={820} h={350} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО СЛОВО DATA — ПЯТЬ ГОТОВЫХ ВОЗМОЖНОСТЕЙ</text>

      <rect x={30} y={66} width={340} height={110} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={13} fontFamily={MONO} fill="#fff">class Coin(val t: String)</text>
      <text x={50} y={120} fontSize={12} fill={FADE}>println(c1) → Coin@5ca881b5</text>
      <text x={50} y={144} fontSize={12} fill={FADE}>c1 == c2 → false</text>
      <text x={50} y={166} fontSize={12} fill={FADE}>copy() нет вообще</text>

      <rect x={450} y={66} width={340} height={110} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={470} y={92} fontSize={13} fontFamily={MONO} fill={ACCENT}>data class Coin(val t: String)</text>
      <text x={470} y={120} fontSize={12} fill="#fff">println(c1) → Coin(t=TON)</text>
      <text x={470} y={144} fontSize={12} fill="#fff">c1 == c2 → true</text>
      <text x={470} y={166} fontSize={12} fill="#fff">copy(t = "BTC") работает</text>

      <Arrow x1={372} y1={120} x2={446} y2={120} color={ACCENT} w={3} />

      <text x={30} y={214} fontSize={12} fill={FADE}>что компилятор дописывает сам:</text>
      {[
        { x: 30, name: 'toString()', note: 'печать по полям' },
        { x: 190, name: 'equals()', note: 'сравнение по содержимому' },
        { x: 350, name: 'hashCode()', note: 'работа в Set и Map' },
        { x: 510, name: 'copy()', note: 'клон с заменой поля' },
        { x: 660, name: 'component1()', note: 'разбор на переменные' },
      ].map((f) => (
        <g key={f.name}>
          <rect x={f.x} y={228} width={f.x === 660 ? 130 : 146} height={40} rx={10} fill={ACCENT} />
          <text x={f.x + (f.x === 660 ? 65 : 73)} y={253} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fontWeight={700} fill="#10243a">{f.name}</text>
          <text x={f.x + (f.x === 660 ? 65 : 73)} y={288} textAnchor="middle" fontSize={11} fill={FADE}>{f.note}</text>
        </g>
      ))}

      <text x={30} y={330} fontSize={12.5} fill="#fff">данные без поведения — data class; поведение и состояние — обычный класс</text>
    </Panel>
  ),

  /* закрытая иерархия: список наследников известен компилятору целиком */
  'ko-sealed-when': (aria) => (
    <Panel id="fig-ko-sealed" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SEALED: КОМПИЛЯТОР ЗНАЕТ ВСЕХ НАСЛЕДНИКОВ ПОИМЁННО</text>

      <rect x={274} y={64} width={230} height={48} rx={12} fill={ACCENT} />
      <text x={389} y={94} textAnchor="middle" fontSize={14} fontFamily={MONO} fontWeight={700} fill="#10243a">sealed class Result</text>

      {[
        { x: 30, label: 'Ok(value)' },
        { x: 274, label: 'Fail(message)' },
        { x: 518, label: 'Loading' },
      ].map((h) => (
        <g key={h.label}>
          <path d={`M389 112v26H${h.x + 115}v26`} stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x={h.x} y={164} width={230} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
          <text x={h.x + 115} y={192} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">{h.label}</text>
        </g>
      ))}

      <rect x={762} y={164} width={28} height={44} rx={10} fill="none" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={776} y={193} textAnchor="middle" fontSize={16} fill={FADE}>?</text>
      <text x={790} y={232} textAnchor="end" fontSize={11.5} fill={FADE}>снаружи файла новых не добавить</text>

      <rect x={30} y={252} width={474} height={62} rx={12} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={278} fontSize={13} fontFamily={MONO} fill="#fff">when (r) &#123; is Ok -&gt; ... is Fail -&gt; ... &#125;</text>
      <text x={50} y={302} fontSize={12} fill={ACCENT}>ветка else не нужна: все случаи уже перечислены</text>

      <text x={528} y={278} fontSize={12.5} fill="#fff">добавили нового наследника —</text>
      <text x={528} y={302} fontSize={12.5} fill={ACCENT}>компилятор сам покажет этот when</text>
    </Panel>
  ),
};
