import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «ООП на TypeScript»: класс как чертёж, потеря this,
 * цепочка наследования и стирание типов при компиляции. */

export const tsOopSchemes: Schemes = {
  /* один класс — много объектов; поля свои, методы общие */
  'to-blueprint-instances': (aria) => (
    <Panel id="fig-to-blueprint" w={820} h={340} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ЧЕРТЁЖ — СКОЛЬКО УГОДНО ИЗДЕЛИЙ</text>

      <rect x={30} y={70} width={230} height={190} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={102} fontSize={15} fontFamily={MONO} fontWeight={700} fill={ACCENT}>class Tx</text>
      <text x={50} y={132} fontSize={12} fill={FADE}>поля (у каждого свои)</text>
      <text x={50} y={154} fontSize={12.5} fontFamily={MONO} fill="#fff">id, amount</text>
      <text x={50} y={186} fontSize={12} fill={FADE}>методы (общие на всех)</text>
      <text x={50} y={208} fontSize={12.5} fontFamily={MONO} fill="#fff">fee()</text>
      <text x={50} y={236} fontSize={12} fill={FADE}>это чертёж, не объект</text>

      <Arrow x1={260} y1={165} x2={318} y2={165} color={ACCENT} w={3} />
      <text x={266} y={150} fontSize={12} fontFamily={MONO} fill={ACCENT}>new</text>

      {[
        { x: 330, id: "'a1'", amount: '5000' },
        { x: 490, id: "'b7'", amount: '120' },
        { x: 650, id: "'c3'", amount: '48000' },
      ].map((o) => (
        <g key={o.id}>
          <rect x={o.x} y={92} width={140} height={110} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
          <text x={o.x + 16} y={120} fontSize={12} fill={FADE}>объект</text>
          <text x={o.x + 16} y={146} fontSize={13} fontFamily={MONO} fill="#fff">id = {o.id}</text>
          <text x={o.x + 16} y={172} fontSize={13} fontFamily={MONO} fill="#fff">amount</text>
          <text x={o.x + 16} y={190} fontSize={13} fontFamily={MONO} fill={ACCENT}>= {o.amount}</text>
          <path d={`M${o.x + 70} 202v34`} stroke={ACCENT} strokeWidth={2.5} strokeDasharray="5 5" />
        </g>
      ))}

      <rect x={330} y={236} width={460} height={44} rx={10} fill={ACCENT} />
      <text x={560} y={264} textAnchor="middle" fontSize={13} fontWeight={700} fill="#10243a">метод fee() один — лежит в прототипе класса</text>

      <text x={30} y={310} fontSize={12.5} fill="#fff">три объекта — три набора полей, но не три копии кода метода</text>
    </Panel>
  ),

  /* три способа вызвать метод и что происходит с this */
  'to-this-binding': (aria) => (
    <Panel id="fig-to-this" w={820} h={350} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>THIS ОПРЕДЕЛЯЕТСЯ В МОМЕНТ ВЫЗОВА</text>

      {[
        {
          x: 30,
          call: 't.fee()',
          note: 'слева от точки — t',
          got: 'this = t',
          ok: true,
        },
        {
          x: 296,
          call: 'const f = t.fee;\nf()',
          note: 'точки нет — связь потеряна',
          got: 'this = undefined',
          ok: false,
        },
        {
          x: 562,
          call: 'fee = () => …',
          note: 'стрелка в поле объекта',
          got: 'this приклеен навсегда',
          ok: true,
        },
      ].map((c) => (
        <g key={c.call}>
          <rect
            x={c.x}
            y={70}
            width={228}
            height={200}
            rx={14}
            fill={c.ok ? SOFT : 'rgba(0,0,0,0.32)'}
            stroke={c.ok ? ACCENT : INK}
            strokeWidth={2.5}
          />
          {c.call.split('\n').map((line, i) => (
            <text key={`${c.call}-${i}`} x={c.x + 18} y={104 + i * 22} fontSize={13.5} fontFamily={MONO} fill="#fff">{line}</text>
          ))}
          <text x={c.x + 18} y={162} fontSize={12} fill={FADE}>{c.note}</text>
          <rect x={c.x + 18} y={182} width={192} height={38} rx={9} fill={c.ok ? ACCENT : 'rgba(255,255,255,0.1)'} />
          <text x={c.x + 32} y={207} fontSize={12.5} fontFamily={MONO} fontWeight={700} fill={c.ok ? '#10243a' : '#fff'}>{c.got}</text>
          <text x={c.x + 18} y={246} fontSize={12.5} fontWeight={700} fill={c.ok ? ACCENT : '#fff'}>{c.ok ? 'работает' : 'TypeError при чтении поля'}</text>
        </g>
      ))}

      <text x={30} y={302} fontSize={12.5} fill="#fff">метод, переданный как коллбэк, — это средний случай: обёртка или стрелка</text>
      <text x={30} y={326} fontSize={12.5} fill={FADE}>t.fee.bind(t) и () =&gt; t.fee() чинят потерю так же надёжно</text>
    </Panel>
  ),

  /* что наследник берёт у родителя и что заменяет своим */
  'to-inheritance': (aria) => (
    <Panel id="fig-to-inherit" w={820} h={350} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>НАСЛЕДНИК БЕРЁТ ВСЁ, ЗАМЕНЯЕТ ВЫБОРОЧНО</text>

      <rect x={280} y={62} width={260} height={104} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={300} y={92} fontSize={15} fontFamily={MONO} fontWeight={700} fill="#fff">class Tx</text>
      <text x={300} y={118} fontSize={12.5} fontFamily={MONO} fill={FADE}>id, amount</text>
      <text x={300} y={142} fontSize={12.5} fontFamily={MONO} fill={FADE}>describe(), hash()</text>

      <Arrow x1={410} y1={166} x2={410} y2={202} color={ACCENT} w={3} />
      <text x={424} y={190} fontSize={12} fontFamily={MONO} fill={ACCENT}>extends</text>

      <rect x={140} y={206} width={264} height={116} rx={14} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={160} y={236} fontSize={14.5} fontFamily={MONO} fontWeight={700} fill={ACCENT}>class Transfer</text>
      <text x={160} y={262} fontSize={12} fill={FADE}>унаследовано без изменений</text>
      <text x={160} y={282} fontSize={12.5} fontFamily={MONO} fill="#fff">hash()</text>
      <text x={160} y={306} fontSize={12} fill="#fff">своё поле: to</text>

      <rect x={420} y={206} width={264} height={116} rx={14} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={236} fontSize={14.5} fontFamily={MONO} fontWeight={700} fill={ACCENT}>class Issue</text>
      <text x={440} y={262} fontSize={12} fill={FADE}>переопределено своим</text>
      <text x={440} y={282} fontSize={12.5} fontFamily={MONO} fill="#fff">describe()</text>
      <text x={440} y={306} fontSize={12} fill="#fff">внутри — super.describe()</text>

      <path d="M410 190h-270v16" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M410 190h142v16" stroke={ACCENT} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <rect x={700} y={62} width={90} height={104} rx={12} fill={ACCENT} />
      <text x={745} y={98} textAnchor="middle" fontSize={12} fontWeight={700} fill="#10243a">super()</text>
      <text x={745} y={120} textAnchor="middle" fontSize={11} fill="#10243a">строго</text>
      <text x={745} y={138} textAnchor="middle" fontSize={11} fill="#10243a">первым</text>
      <text x={745} y={156} textAnchor="middle" fontSize={11} fill="#10243a">до this</text>
    </Panel>
  ),

  /* что остаётся в JavaScript после компиляции, а что исчезает */
  'to-interface-erasure': (aria) => (
    <Panel id="fig-to-erase" w={820} h={330} aria={aria}>
      <text x={30} y={40} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ПЕРЕЖИВЁТ КОМПИЛЯЦИЮ</text>

      <rect x={30} y={62} width={300} height={216} rx={14} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={13} fontWeight={700} fill="#fff">файл .ts</text>
      {['interface Signer', 'type Level', 'implements Signer', 'private amount', 'readonly id', 'class Tx', 'static count', '#secret'].map((s, i) => (
        <text key={s} x={50} y={122 + i * 20} fontSize={12.5} fontFamily={MONO} fill={i < 5 ? FADE : '#fff'}>{s}</text>
      ))}

      <Arrow x1={330} y1={170} x2={396} y2={170} color={ACCENT} w={3} />
      <text x={338} y={156} fontSize={12} fontFamily={MONO} fill={ACCENT}>tsc</text>

      <rect x={404} y={62} width={300} height={216} rx={14} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={424} y={92} fontSize={13} fontWeight={700} fill={ACCENT}>файл .js</text>
      <text x={424} y={122} fontSize={12.5} fill={FADE}>исчезли без следа</text>
      <text x={424} y={148} fontSize={12.5} fontFamily={MONO} fill="#fff">class Tx</text>
      <text x={424} y={172} fontSize={12.5} fontFamily={MONO} fill="#fff">static count</text>
      <text x={424} y={196} fontSize={12.5} fontFamily={MONO} fill="#fff">#secret</text>
      <text x={424} y={224} fontSize={12} fill={FADE}>в итоге: id и amount стали</text>
      <text x={424} y={244} fontSize={12} fill={FADE}>обычными полями объекта</text>

      <text x={30} y={306} fontSize={12.5} fill="#fff">типы — леса на время стройки; # — настоящая стена, она остаётся</text>
    </Panel>
  ),
};
