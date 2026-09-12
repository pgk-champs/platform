import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Поля ввода»: управляемое поле, его состояния
 * и момент показа ошибки. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitInputsSchemes: Schemes = {
  'ki-controlled': (aria) => (
    <Panel id="fig-ki-ctl" w={820} h={290} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ПОЛЕ НЕ ХРАНИТ ТЕКСТ — ОНО ЕГО ПОКАЗЫВАЕТ</text>

      <rect x={30} y={70} width={220} height={94} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={98} fontSize={12} fontWeight={700} fill="#fff">Состояние экрана</text>
      <text x={50} y={126} fontSize={11} fontFamily={MONO} fill={ACCENT}>var email by remember</text>
      <text x={50} y={148} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'{ mutableStateOf("") }'}</text>

      <Arrow x1={264} y1={100} x2={330} y2={100} color={ACCENT} w={2.2} />
      <text x={297} y={90} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>value</text>

      <Arrow x1={330} y1={140} x2={264} y2={140} color={ACCENT} w={2.2} />
      <text x={297} y={162} textAnchor="middle" fontSize={10} fontFamily={MONO} fill={FADE}>onValueChange</text>

      <rect x={344} y={70} width={220} height={94} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={364} y={98} fontSize={12} fontWeight={700} fill="#fff">KitTextField</text>
      <text x={364} y={126} fontSize={11} fill={FADE}>рисует то, что дали</text>
      <text x={364} y={148} fontSize={11} fill={FADE}>сообщает о нажатиях</text>

      <rect x={590} y={70} width={200} height={94} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={610} y={98} fontSize={12} fontWeight={700} fill={RED_TEXT}>Разомкнули кольцо</text>
      <text x={610} y={124} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>value = "текст"</text>
      <text x={610} y={146} fontSize={11} fill={FADE}>поле просто не печатается</text>

      <text x={30} y={214} fontSize={12.5} fill="#fff">текст живёт снаружи; поле получает его сверху и отдаёт изменения обратно</text>
      <text x={30} y={240} fontSize={12.5} fill={FADE}>разорвать кольцо легко, и компилятор про это ничего не скажет — код законный</text>
      <text x={30} y={266} fontSize={12.5} fill={ACCENT}>«не печатается» почти всегда значит: onValueChange не меняет то, что уходит в value</text>
    </Panel>
  ),

  'ki-states': (aria) => (
    <Panel id="fig-ki-st" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДНО ПОЛЕ, ЧЕТЫРЕ СОСТОЯНИЯ НА МАКЕТЕ</text>

      {[
        { y: 66, n: 'Пустое', hint: 'подпись наверху, подсказка внутри', c: ACCENT, b: 'ivan@mail.ru' },
        { y: 124, n: 'Заполненное', hint: 'подпись уехала наверх и уменьшилась', c: ACCENT, b: 'oleg@pgk63.ru' },
        { y: 182, n: 'С ошибкой', hint: 'рамка и подпись красные, текст под полем', c: RED, b: 'oleg@' },
        { y: 240, n: 'Отключённое', hint: 'приглушённое, не принимает ввод', c: FADE, b: 'нельзя менять' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={250} height={40} rx={8} fill="rgba(0,0,0,0.24)" stroke={r.c} strokeWidth={1.8} />
          <text x={46} y={r.y + 25} fontSize={11} fontFamily={MONO} fill={r.c === FADE ? FADE : '#fff'}>{r.b}</text>
          <text x={302} y={r.y + 17} fontSize={12} fontWeight={700} fill="#fff">{r.n}</text>
          <text x={302} y={r.y + 34} fontSize={11} fill={FADE}>{r.hint}</text>
        </g>
      ))}

      <text x={30} y={296} fontSize={12.5} fill="#fff">все четыре — один компонент с разными параметрами, а не четыре разных</text>
    </Panel>
  ),

  'ki-when-validate': (aria) => (
    <Panel id="fig-ki-val" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОГДА ПОКАЗЫВАТЬ ОШИБКУ</text>

      <rect x={30} y={64} width={370} height={140} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Сразу при вводе</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>o → «неверная почта»</text>
      <text x={50} y={142} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>ol → «неверная почта»</text>
      <text x={50} y={164} fontSize={11} fontFamily={MONO} fill={RED_TEXT}>ole → «неверная почта»</text>
      <text x={50} y={190} fontSize={11} fill={FADE}>человек ещё печатает, а его уже ругают</text>

      <rect x={420} y={64} width={370} height={140} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">После первого ухода из поля</text>
      <text x={440} y={120} fontSize={11} fontFamily={MONO} fill={FADE}>o, ol, ole… — тихо</text>
      <text x={440} y={142} fontSize={11} fontFamily={MONO} fill={ACCENT}>ушёл из поля → проверили</text>
      <text x={440} y={164} fontSize={11} fontFamily={MONO} fill={ACCENT}>дальше — на каждый символ</text>
      <text x={440} y={190} fontSize={11} fill={FADE}>ошибка появляется вовремя и исчезает сразу</text>

      <text x={30} y={242} fontSize={12.5} fill="#fff">правило: первый раз проверяем при уходе из поля, дальше — на каждое изменение</text>
      <text x={30} y={268} fontSize={12.5} fill={FADE}>иначе либо ругань на первую букву, либо ошибка, которая не уходит после починки</text>
    </Panel>
  ),
};
