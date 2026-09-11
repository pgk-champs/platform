import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «HTML»: три языка страницы, как браузер чинит разметку
 * и стили по умолчанию у обычных тегов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const webHtmlSchemes: Schemes = {
  'wh-three-languages': (aria) => (
    <Panel id="fig-wh-three" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ЯЗЫКА СТРАНИЦЫ, ТРИ РАЗНЫХ ВОПРОСА</text>

      {[
        { x: 30, t: 'HTML', q: 'что здесь есть', d: 'заголовок, абзац, поле, кнопка', s: 'смысл и структура' },
        { x: 294, t: 'CSS', q: 'как это выглядит', d: 'размер, цвет, расположение', s: 'оформление' },
        { x: 558, t: 'JavaScript', q: 'что происходит', d: 'нажали — отправили запрос', s: 'поведение' },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={66} width={232} height={130} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.2} />
          <text x={c.x + 18} y={94} fontSize={13} fontFamily={MONO} fill={ACCENT}>{c.t}</text>
          <text x={c.x + 18} y={122} fontSize={12} fill="#fff">{c.q}</text>
          <text x={c.x + 18} y={148} fontSize={10.5} fill={FADE}>{c.d}</text>
          <text x={c.x + 18} y={176} fontSize={11} fill={ACCENT}>{c.s}</text>
        </g>
      ))}

      <text x={30} y={240} fontSize={12.5} fill="#fff">страница живёт и без второго, и без третьего: без оформления — некрасиво, без поведения — статично</text>
      <text x={30} y={264} fontSize={12.5} fill={FADE}>без первого не живёт вовсе: оформлять и оживлять нечего</text>
      <text x={30} y={286} fontSize={12.5} fill={ACCENT}>ваш интерфейс к контракту — это те же три языка плюс библиотека работы с сетью</text>
    </Panel>
  ),

  'wh-parser-fixes': (aria) => (
    <Panel id="fig-wh-parse" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>БРАУЗЕР НЕ ОТКАЗЫВАЕТСЯ, А ДОСТРАИВАЕТ</text>

      <rect x={30} y={66} width={340} height={150} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={92} fontSize={11.5} fill="#fff">написали</text>
      <text x={48} y={124} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'<p>снаружи'}</text>
      <text x={48} y={148} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'  <div>внутри</div>'}</text>
      <text x={48} y={172} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'  хвост'}</text>
      <text x={48} y={196} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'</p>'}</text>

      <Arrow x1={382} y1={140} x2={440} y2={140} color={ACCENT} w={2.5} />

      <rect x={454} y={66} width={336} height={150} rx={12} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2.5} />
      <text x={472} y={92} fontSize={11.5} fill="#fff">получилось</text>
      <text x={472} y={118} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{'<p> «снаружи»'}</text>
      <text x={472} y={140} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{'<div> «внутри»'}</text>
      <text x={472} y={162} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>текст «хвост» — сам по себе</text>
      <text x={472} y={184} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{'<p> пустой'}</text>
      <text x={472} y={206} fontSize={10.5} fill={FADE}>четыре узла вместо двух</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">блочный элемент внутри абзаца закрывает абзац: так устроены правила разбора, и ошибки не будет</text>
      <text x={30} y={276} fontSize={12.5} fill={FADE}>ни одного сообщения браузер при этом не выведет — расхождение видно только в дереве</text>
      <text x={30} y={298} fontSize={12.5} fill={ACCENT}>поэтому разметку проверяют инструментом, а не глазами: глазами она выглядит правильной</text>
    </Panel>
  ),

  'wh-defaults': (aria) => (
    <Panel id="fig-wh-def" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>У КАЖДОГО ТЕГА УЖЕ ЕСТЬ ОФОРМЛЕНИЕ</text>

      <text x={30} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>тег</text>
      <text x={130} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>размер</text>
      <text x={240} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>жирность</text>
      <text x={360} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>отступы</text>
      <text x={500} y={66} fontSize={11} fontFamily={MONO} fill={FADE}>поток</text>

      {[
        { y: 88, n: 'h1', s: '32px', w: '700', m: '21.44px', d: 'блочный', b: true },
        { y: 116, n: 'h2', s: '24px', w: '700', m: '19.92px', d: 'блочный', b: true },
        { y: 144, n: 'p', s: '16px', w: '400', m: '16px', d: 'блочный', b: true },
        { y: 172, n: 'a', s: '16px', w: '400', m: '0', d: 'строчный', b: false },
        { y: 200, n: 'code', s: '13px', w: '400', m: '0', d: 'строчный', b: false },
        { y: 228, n: 'button', s: '13.33px', w: '400', m: '0', d: 'строчно-блочный', b: false },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y} fontSize={11.5} fontFamily={MONO} fill="#fff">{r.n}</text>
          <text x={130} y={r.y} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.s}</text>
          <text x={240} y={r.y} fontSize={11} fontFamily={MONO} fill={ACCENT}>{r.w}</text>
          <text x={360} y={r.y} fontSize={11} fontFamily={MONO} fill={FADE}>{r.m}</text>
          <text x={500} y={r.y} fontSize={11} fill={r.b ? ACCENT : FADE}>{r.d}</text>
        </g>
      ))}

      <text x={30} y={266} fontSize={12.5} fill="#fff">блочный занимает всю ширину и начинается с новой строки; строчный — только своё место в строке</text>
      <text x={30} y={290} fontSize={12.5} fill={FADE}>отступы у заголовков и абзацев не ваши — их даёт браузер; поэтому оформление часто начинают со сброса</text>
    </Panel>
  ),
};
