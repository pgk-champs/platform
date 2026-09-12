import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Язык RIDE»: три директивы, ленивый let против strict
 * и список того, чего в языке нет. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const wavesRideSchemes: Schemes = {
  'rid-directives': (aria) => (
    <Panel id="fig-rid-dir" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ СТРОКИ В ШАПКЕ РЕШАЮТ, ЧТО ЭТО ВООБЩЕ ЗА СКРИПТ</text>

      {[
        { y: 66, d: 'STDLIB_VERSION 6', v: 'какие функции доступны', n: 'в версии 3 тот же sigVerify стоит 102, в шестой — 182' },
        { y: 128, d: 'CONTENT_TYPE DAPP', v: 'выражение или приложение', n: 'EXPRESSION возвращает да/нет, DAPP содержит вызываемые функции' },
        { y: 190, d: 'SCRIPT_TYPE ACCOUNT', v: 'на что вешают', n: 'ACCOUNT на аккаунт, ASSET на токен' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={290} height={44} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={1.8} />
          <text x={48} y={r.y + 28} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>{'{-# ' + r.d + ' #-}'}</text>
          <text x={340} y={r.y + 18} fontSize={12} fill="#fff">{r.v}</text>
          <text x={340} y={r.y + 38} fontSize={11} fill={FADE}>{r.n}</text>
        </g>
      ))}

      <text x={30} y={262} fontSize={12.5} fill="#fff">директивы обязательны: без них компилятор не знает, по каким правилам читать текст</text>
      <text x={30} y={284} fontSize={12.5} fill={FADE}>их пишут первыми тремя строками и почти никогда потом не трогают</text>
    </Panel>
  ),

  'rid-let-strict': (aria) => (
    <Panel id="fig-rid-ls" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН И ТОТ ЖЕ КОД, РАЗНЫЕ СЛОВА — РАЗНАЯ ЦЕНА</text>

      <rect x={30} y={64} width={370} height={130} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">let — ленивый</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>let dorogo = sigVerify(…)</text>
      <text x={50} y={142} fontSize={10.5} fontFamily={MONO} fill={FADE}>[ IntegerEntry("x", 1) ]</text>
      <text x={50} y={172} fontSize={15} fontWeight={700} fill={ACCENT}>сложность 3</text>

      <rect x={420} y={64} width={370} height={130} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">strict — считается сразу</text>
      <text x={440} y={120} fontSize={10.5} fontFamily={MONO} fill={FADE}>strict dorogo = sigVerify(…)</text>
      <text x={440} y={142} fontSize={10.5} fontFamily={MONO} fill={FADE}>[ IntegerEntry("x", 1) ]</text>
      <text x={440} y={172} fontSize={15} fontWeight={700} fill={ACCENT}>сложность 184</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">значение под let вычисляется только если его кто-то спросил — не спросили, не заплатили</text>
      <text x={30} y={252} fontSize={12.5} fill={FADE}>strict нужен там, где важен сам факт вычисления: проверка, которая должна упасть</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>проверку под let легко «потерять»: она молча не выполнится, и никто этого не заметит</text>
    </Panel>
  ),

  'rid-no': (aria) => (
    <Panel id="fig-rid-no" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧЕГО В RIDE НЕТ — И ПОЧЕМУ ЭТО СДЕЛАНО НАРОЧНО</text>

      {[
        { y: 66, k: 'циклов', p: 'нельзя написать бесконечный скрипт' },
        { y: 102, k: 'своих типов и классов', p: 'структура известна заранее' },
        { y: 138, k: 'изменяемых переменных', p: 'значение, объявленное один раз, не меняется' },
        { y: 174, k: 'дробных чисел', p: 'деньги считают целыми: 7 / 2 даёт 3' },
        { y: 210, k: 'обращений наружу', p: 'скрипт не ходит в сеть и не читает файлы' },
      ].map((r) => (
        <g key={r.y}>
          <text x={30} y={r.y + 16} fontSize={12.5} fontFamily={MONO} fill={RED_TEXT}>нет {r.k}</text>
          <text x={330} y={r.y + 16} fontSize={12} fill={FADE}>{r.p}</text>
        </g>
      ))}

      <rect x={30} y={240} width={760} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={268} fontSize={12.5} fill="#fff">итог: стоимость любого скрипта известна до запуска — её считает компилятор</text>
    </Panel>
  ),
};
