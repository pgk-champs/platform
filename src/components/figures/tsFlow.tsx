import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Условия и циклы»: развилка if/else, вход в switch и падение
 * вниз без break, анатомия заголовка for и четыре формы цикла. */

export const tsFlowSchemes: Schemes = {
  /* развилка: одна ветка из двух, потом пути сходятся */
  'tf-if-else-fork': (aria) => (
    <Panel id="fig-tf-fork" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНА ВЕТКА ИЗ ДВУХ, НИКОГДА ОБЕ</text>

      <rect x={30} y={140} width={130} height={48} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={95} y={170} textAnchor="middle" fontSize={13} fill="#fff">код выше</text>
      <Arrow x1={160} y1={164} x2={222} y2={164} color={INK} w={3} />

      <path d="M300 120L378 164L300 208L222 164Z" fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={300} y={160} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">balance</text>
      <text x={300} y={178} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">&gt;= price</text>

      <Arrow x1={300} y1={120} x2={300} y2={86} color={ACCENT} w={3} />
      <text x={316} y={104} fontSize={12} fontWeight={700} fill={ACCENT}>true</text>
      <rect x={396} y={62} width={190} height={48} rx={10} fill={ACCENT} />
      <text x={491} y={92} textAnchor="middle" fontSize={13} fontWeight={700} fill="#10243a">ветка if</text>
      <path d="M300 86h96" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" />

      <Arrow x1={300} y1={208} x2={300} y2={244} color={INK} w={3} />
      <text x={314} y={232} fontSize={12} fontWeight={700} fill={FADE}>false</text>
      <rect x={396} y={220} width={190} height={48} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={491} y={250} textAnchor="middle" fontSize={13} fill="#fff">ветка else</text>
      <path d="M300 244h96" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />

      <path d="M586 86h68v78" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M586 244h68v-78" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Arrow x1={654} y1={164} x2={700} y2={164} color={INK} w={3} />
      <rect x={700} y={140} width={90} height={48} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={745} y={170} textAnchor="middle" fontSize={13} fill="#fff">дальше</text>

      <text x={410} y={312} textAnchor="middle" fontSize={12.5} fill={FADE}>после развилки пути снова сходятся в одну дорогу</text>
    </Panel>
  ),

  /* switch ищет точку входа и падает вниз без break */
  'tf-switch-fallthrough': (aria) => (
    <Panel id="fig-tf-switch" w={820} h={350} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>SWITCH ИЩЕТ ТОЧКУ ВХОДА, А НЕ ВЫБИРАЕТ ВЕТКУ</text>

      <rect x={30} y={62} width={200} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={130} y={90} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill={ACCENT}>switch (status)</text>
      <text x={30} y={128} fontSize={12.5} fill={FADE}>status === 'pending'</text>

      {[
        { y: 150, label: "case 'new'", note: 'мимо: не совпало', hit: false },
        { y: 200, label: "case 'pending'", note: 'вход сюда', hit: true },
        { y: 250, label: "case 'mined'", note: 'выполнится тоже!', hit: true },
        { y: 300, label: 'default', note: 'сюда уже не дойдёт', hit: false },
      ].map((r) => (
        <g key={r.label}>
          <rect
            x={280}
            y={r.y - 22}
            width={230}
            height={40}
            rx={9}
            fill={r.hit ? ACCENT : SOFT}
            stroke={r.hit ? 'none' : INK}
            strokeWidth={2}
          />
          <text x={296} y={r.y + 4} fontSize={13} fontFamily={MONO} fontWeight={r.hit ? 700 : 400} fill={r.hit ? '#10243a' : '#fff'}>{r.label}</text>
          <text x={534} y={r.y + 4} fontSize={12.5} fill={r.hit ? '#fff' : FADE}>{r.note}</text>
        </g>
      ))}

      <Arrow x1={230} y1={84} x2={268} y2={192} color={ACCENT} w={3} />
      <path d="M258 200v50" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Arrow x1={258} y1={250} x2={276} y2={250} color={ACCENT} w={3} />

      <rect x={550} y={62} width={240} height={70} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={570} y={88} fontSize={12} fill={FADE}>в консоли две строки:</text>
      <text x={570} y={110} fontSize={12.5} fontFamily={MONO} fill="#fff">ждём подтверждения</text>
      <text x={570} y={128} fontSize={12.5} fontFamily={MONO} fill="#fff">записано в блок</text>

      <text x={30} y={336} fontSize={12.5} fill="#fff">break — это выход; без него выполнение течёт вниз</text>
    </Panel>
  ),

  /* три части заголовка for и порядок их работы */
  'tf-for-anatomy': (aria) => (
    <Panel id="fig-tf-for" w={820} h={360} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ЧАСТИ ЗАГОЛОВКА ЦИКЛА</text>

      <text x={40} y={92} fontSize={19} fontFamily={MONO} fill="#fff">for (let i = 0; i &lt; 3; i++)</text>
      <path d="M84 106h108" stroke={ACCENT} strokeWidth={3} strokeLinecap="round" />
      <path d="M206 106h74" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d="M294 106h44" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <text x={84} y={128} fontSize={12} fontWeight={700} fill={ACCENT}>начало</text>
      <text x={206} y={128} fontSize={12} fontWeight={700} fill={INK}>проверка</text>
      <text x={294} y={128} fontSize={12} fontWeight={700} fill={INK}>шаг</text>

      <rect x={30} y={170} width={150} height={46} rx={10} fill={ACCENT} />
      <text x={105} y={199} textAnchor="middle" fontSize={13} fontWeight={700} fill="#10243a">1. начало</text>
      <Arrow x1={180} y1={193} x2={202} y2={193} color={ACCENT} w={3} />

      <rect x={206} y={170} width={170} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={291} y={199} textAnchor="middle" fontSize={13} fill="#fff">2. проверка</text>
      <Arrow x1={376} y1={193} x2={398} y2={193} color={INK} w={3} />

      <rect x={402} y={170} width={170} height={46} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={487} y={199} textAnchor="middle" fontSize={13} fill="#fff">3. тело цикла</text>
      <Arrow x1={572} y1={193} x2={594} y2={193} color={INK} w={3} />

      <rect x={598} y={170} width={130} height={46} rx={10} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={663} y={199} textAnchor="middle" fontSize={13} fill="#fff">4. шаг</text>

      <Arrow x1={291} y1={216} x2={291} y2={256} color={ACCENT} w={3} />
      <text x={308} y={252} fontSize={12.5} fill={ACCENT}>условие ложно — выход из цикла</text>

      <path d="M728 216V312H250" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Arrow x1={250} y1={312} x2={250} y2={220} color={INK} w={3} />
      <text x={420} y={302} fontSize={12.5} fill={FADE}>кольцо: проверка — тело — шаг</text>

      <text x={30} y={344} fontSize={12.5} fill="#fff">забыли шаг — условие никогда не станет ложным, цикл вечный</text>
    </Panel>
  ),

  /* четыре формы цикла и что попадает в переменную */
  'tf-loop-kinds': (aria) => (
    <Panel id="fig-tf-kinds" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПОПАДАЕТ В ПЕРЕМЕННУЮ</text>

      <text x={30} y={72} fontSize={12.5} fontFamily={MONO} fill={FADE}>const coins = ['btc', 'eth', 'ton'];</text>

      {[
        { x: 30, name: 'for', v: 'i', got: '0, 1, 2', note: 'счётчик, индекс' },
        { x: 226, name: 'for..of', v: 'coin', got: "'btc', 'eth'…", note: 'сам элемент' },
        { x: 422, name: 'for..in', v: 'key', got: "'0', '1', '2'", note: 'ключ, СТРОКА' },
        { x: 618, name: 'while', v: '—', got: 'ничего', note: 'считаешь сам' },
      ].map((c, i) => (
        <g key={c.name}>
          <rect
            x={c.x}
            y={92}
            width={172}
            height={172}
            rx={14}
            fill={i === 1 ? SOFT : 'rgba(0,0,0,0.25)'}
            stroke={i === 1 ? ACCENT : INK}
            strokeWidth={2.5}
          />
          <text x={c.x + 20} y={124} fontSize={15} fontFamily={MONO} fontWeight={700} fill={i === 1 ? ACCENT : '#fff'}>{c.name}</text>
          <text x={c.x + 20} y={152} fontSize={12} fill={FADE}>переменная</text>
          <text x={c.x + 20} y={176} fontSize={13.5} fontFamily={MONO} fill="#fff">{c.v}</text>
          <text x={c.x + 20} y={206} fontSize={12} fill={FADE}>получает</text>
          <text x={c.x + 20} y={228} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>{c.got}</text>
          <text x={c.x + 20} y={252} fontSize={12} fill="#fff">{c.note}</text>
        </g>
      ))}

      <text x={30} y={296} fontSize={12.5} fill="#fff">нужен и индекс, и элемент — for..of вместе с .entries()</text>
      <text x={30} y={318} fontSize={12.5} fill={FADE}>по массиву for..in не ходят: ключи приходят строками</text>
    </Panel>
  ),
};
