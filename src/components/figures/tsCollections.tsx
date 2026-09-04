import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Массивы и объекты»: нумерация с нуля, ссылка против копии,
 * поверхностная и глубокая копия, устройство объекта. */

export const tsCollectionsSchemes: Schemes = {
  /* индексы с нуля, последний = длина минус один */
  'tcl-array-index': (aria) => (
    <Panel id="fig-tcl-index" w={820} h={310} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЧЁТ НАЧИНАЕТСЯ С НУЛЯ</text>

      <text x={30} y={78} fontSize={13} fontFamily={MONO} fill={FADE}>const coins = ['btc', 'eth', 'ton'];</text>

      {[
        { x: 60, i: 0, v: "'btc'" },
        { x: 250, i: 1, v: "'eth'" },
        { x: 440, i: 2, v: "'ton'" },
      ].map((c) => (
        <g key={c.i}>
          <rect x={c.x} y={104} width={170} height={78} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
          <text x={c.x + 85} y={152} textAnchor="middle" fontSize={17} fontFamily={MONO} fill="#fff">{c.v}</text>
          <text x={c.x + 85} y={208} textAnchor="middle" fontSize={19} fontFamily={MONO} fontWeight={800} fill={ACCENT}>{c.i}</text>
          <text x={c.x + 85} y={230} textAnchor="middle" fontSize={11} fill={FADE}>индекс</text>
        </g>
      ))}

      <rect x={630} y={104} width={160} height={78} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={710} y={140} textAnchor="middle" fontSize={13} fontFamily={MONO} fill={FADE}>coins[3]</text>
      <text x={710} y={166} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">undefined</text>
      <text x={710} y={208} textAnchor="middle" fontSize={12} fill={FADE}>за границей —</text>
      <text x={710} y={226} textAnchor="middle" fontSize={12} fill={FADE}>не ошибка, а пустота</text>

      <rect x={30} y={256} width={370} height={36} rx={9} fill={ACCENT} />
      <text x={215} y={280} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fontWeight={700} fill="#10243a">coins.length === 3</text>

      <rect x={420} y={256} width={370} height={36} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={605} y={280} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">последний индекс = length - 1</text>
    </Panel>
  ),

  /* присваивание копирует ссылку, распространение создаёт новый массив */
  'tcl-reference-vs-copy': (aria) => (
    <Panel id="fig-tcl-ref" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ССЫЛКА ПРОТИВ КОПИИ</text>

      <rect x={30} y={64} width={370} height={244} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13.5} fontWeight={700} fill="#fff">const b = a</text>
      <text x={52} y={116} fontSize={12} fill={FADE}>скопировали ссылку</text>

      <rect x={52} y={136} width={92} height={34} rx={8} fill={ACCENT} />
      <text x={98} y={159} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">a</text>
      <rect x={52} y={186} width={92} height={34} rx={8} fill={ACCENT} />
      <text x={98} y={209} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">b</text>

      <Arrow x1={148} y1={153} x2={236} y2={172} color={ACCENT} w={3} />
      <Arrow x1={148} y1={203} x2={236} y2={184} color={ACCENT} w={3} />

      <rect x={240} y={148} width={136} height={60} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={308} y={184} textAnchor="middle" fontSize={14} fontFamily={MONO} fill="#fff">[1, 2, 3]</text>

      <text x={52} y={252} fontSize={12.5} fontFamily={MONO} fill="#fff">b.push(4)</text>
      <text x={52} y={276} fontSize={12.5} fill={ACCENT}>a тоже стал [1, 2, 3, 4]</text>
      <text x={52} y={298} fontSize={12.5} fontFamily={MONO} fill={FADE}>a === b → true</text>

      <rect x={420} y={64} width={370} height={244} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={442} y={94} fontSize={13.5} fontWeight={700} fill={ACCENT}>const c = [...a]</text>
      <text x={442} y={116} fontSize={12} fill={FADE}>создали новый массив</text>

      <rect x={442} y={136} width={92} height={34} rx={8} fill={ACCENT} />
      <text x={488} y={159} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">a</text>
      <rect x={442} y={186} width={92} height={34} rx={8} fill="rgba(255,255,255,0.2)" stroke={INK} strokeWidth={2} />
      <text x={488} y={209} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">c</text>

      <Arrow x1={538} y1={153} x2={626} y2={153} color={ACCENT} w={3} />
      <Arrow x1={538} y1={203} x2={626} y2={203} color={INK} w={3} />

      <rect x={630} y={130} width={136} height={46} rx={11} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={698} y={159} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">[1, 2, 3]</text>
      <rect x={630} y={180} width={136} height={46} rx={11} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={698} y={209} textAnchor="middle" fontSize={13.5} fontFamily={MONO} fill="#fff">[1, 2, 3]</text>

      <text x={442} y={252} fontSize={12.5} fontFamily={MONO} fill="#fff">c.push(4)</text>
      <text x={442} y={276} fontSize={12.5} fill={ACCENT}>a остался прежним</text>
      <text x={442} y={298} fontSize={12.5} fontFamily={MONO} fill={FADE}>a === c → false</text>
    </Panel>
  ),

  /* поверхностная копия делит вложенное, глубокая — нет */
  'tcl-shallow-deep': (aria) => (
    <Panel id="fig-tcl-deep" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОВЕРХНОСТНАЯ И ГЛУБОКАЯ КОПИЯ</text>

      <rect x={30} y={64} width={370} height={240} rx={14} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13} fontFamily={MONO} fill="#fff">{'{ ...wallet }'}</text>
      <text x={52} y={116} fontSize={12} fill={FADE}>дублируется только верхний уровень</text>

      <rect x={52} y={134} width={140} height={40} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={122} y={159} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">wallet</text>
      <rect x={238} y={134} width={140} height={40} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={308} y={159} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">copy</text>

      <rect x={140} y={222} width={160} height={48} rx={11} fill={ACCENT} />
      <text x={220} y={252} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">limits: {'{ … }'}</text>

      <Arrow x1={122} y1={174} x2={186} y2={218} color={ACCENT} w={3} />
      <Arrow x1={308} y1={174} x2={252} y2={218} color={ACCENT} w={3} />
      <text x={52} y={296} fontSize={12.5} fill={ACCENT}>вложенный объект — общий на двоих</text>

      <rect x={420} y={64} width={370} height={240} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={442} y={94} fontSize={13} fontFamily={MONO} fill={ACCENT}>structuredClone(wallet)</text>
      <text x={442} y={116} fontSize={12} fill={FADE}>повторяется вся структура целиком</text>

      <rect x={442} y={134} width={140} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={512} y={159} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">wallet</text>
      <rect x={628} y={134} width={140} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <text x={698} y={159} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">deep</text>

      <rect x={442} y={222} width={140} height={48} rx={11} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={512} y={252} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">limits</text>
      <rect x={628} y={222} width={140} height={48} rx={11} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={698} y={252} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">limits</text>

      <Arrow x1={512} y1={174} x2={512} y2={218} color={INK} w={3} />
      <Arrow x1={698} y1={174} x2={698} y2={218} color={INK} w={3} />
      <text x={442} y={296} fontSize={12.5} fill="#fff">у каждого свой вложенный объект</text>
    </Panel>
  ),

  /* объект — пары «имя — значение», точка и скобки ведут к одному полю */
  'tcl-object-shape': (aria) => (
    <Panel id="fig-tcl-shape" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПАРЫ «ИМЯ — ЗНАЧЕНИЕ»</text>

      <rect x={30} y={64} width={400} height={196} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13} fontFamily={MONO} fill={ACCENT}>const wallet = {'{'}</text>
      {[
        { k: 'owner', v: "'Олег'" },
        { k: 'balance', v: '152340' },
        { k: 'currency', v: "'RUB'" },
        { k: 'active', v: 'true' },
      ].map((r, i) => (
        <g key={r.k}>
          <rect x={52} y={106 + i * 34} width={150} height={28} rx={7} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={1.5} />
          <text x={64} y={126 + i * 34} fontSize={12.5} fontFamily={MONO} fill="#fff">{r.k}</text>
          <text x={212} y={126 + i * 34} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>{r.v}</text>
        </g>
      ))}
      <text x={52} y={248} fontSize={13} fontFamily={MONO} fill={ACCENT}>{'}'}</text>

      <rect x={460} y={64} width={330} height={90} rx={12} fill="rgba(0,0,0,0.25)" stroke={INK} strokeWidth={2.5} />
      <text x={482} y={94} fontSize={13} fontFamily={MONO} fill="#fff">wallet.balance</text>
      <text x={482} y={120} fontSize={12} fill={FADE}>точка: имя известно заранее</text>
      <text x={482} y={142} fontSize={12} fill={FADE}>пишется без кавычек</text>

      <rect x={460} y={170} width={330} height={90} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={482} y={200} fontSize={13} fontFamily={MONO} fill={ACCENT}>wallet['balance']</text>
      <text x={482} y={226} fontSize={12} fill={FADE}>скобки: имя вычисляется</text>
      <text x={482} y={248} fontSize={12} fill="#fff">внутри — строка или переменная</text>

      <Arrow x1={434} y1={140} x2={456} y2={110} color={INK} w={3} />
      <Arrow x1={434} y1={182} x2={456} y2={212} color={ACCENT} w={3} />

      <text x={30} y={296} fontSize={12.5} fill="#fff">опечатка в имени не ошибка: чтение даст undefined, запись создаст новое поле</text>
      <text x={30} y={318} fontSize={12.5} fill={FADE}>обе записи ведут к одному и тому же полю объекта</text>
    </Panel>
  ),
};
