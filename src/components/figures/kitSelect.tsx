import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Селект и шторка»: почему на мобильном не выпадающий список,
 * кто владеет состоянием открытия и почему закрытие асинхронное. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const kitSelectSchemes: Schemes = {
  'ks-dropdown-vs-sheet': (aria) => (
    <Panel id="fig-ks-dd" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>НА ТЕЛЕФОНЕ СЕЛЕКТ — ЭТО НЕ ВЫПАДАЮЩИЙ СПИСОК</text>

      <rect x={30} y={64} width={190} height={190} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <rect x={46} y={84} width={158} height={26} rx={6} fill="rgba(255,255,255,0.1)" />
      <rect x={46} y={116} width={158} height={92} rx={6} fill="rgba(255,140,140,0.14)" stroke={RED} strokeWidth={1.6} />
      <text x={125} y={148} textAnchor="middle" fontSize={10} fill={RED_TEXT}>список висит</text>
      <text x={125} y={166} textAnchor="middle" fontSize={10} fill={RED_TEXT}>под пальцем</text>
      <text x={125} y={186} textAnchor="middle" fontSize={10} fill={RED_TEXT}>и перекрыт рукой</text>
      <text x={30} y={276} fontSize={11.5} fill={FADE}>выпадающий список</text>

      <Arrow x1={238} y1={160} x2={296} y2={160} color={ACCENT} w={2.4} />

      <rect x={320} y={64} width={190} height={190} rx={14} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
      <rect x={336} y={84} width={158} height={26} rx={6} fill="rgba(255,255,255,0.1)" />
      <rect x={320} y={150} width={190} height={104} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <rect x={398} y={160} width={34} height={4} rx={2} fill={ACCENT} />
      <text x={415} y={192} textAnchor="middle" fontSize={10.5} fill={ACCENT}>вариант 1</text>
      <text x={415} y={214} textAnchor="middle" fontSize={10.5} fill={ACCENT}>вариант 2</text>
      <text x={415} y={236} textAnchor="middle" fontSize={10.5} fill={ACCENT}>вариант 3</text>
      <text x={320} y={276} fontSize={11.5} fill={ACCENT}>нижняя шторка</text>

      <text x={556} y={96} fontSize={12} fontWeight={700} fill="#fff">Почему так</text>
      <text x={556} y={124} fontSize={11} fill={FADE}>варианты у большого пальца,</text>
      <text x={556} y={142} fontSize={11} fill={FADE}>а не под ним</text>
      <text x={556} y={170} fontSize={11} fill={FADE}>строки крупные: попасть легко</text>
      <text x={556} y={198} fontSize={11} fill={FADE}>помещается длинный текст</text>
      <text x={556} y={226} fontSize={11} fill={FADE}>закрывается смахиванием вниз</text>
    </Panel>
  ),

  'ks-who-owns': (aria) => (
    <Panel id="fig-ks-own" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА СОСТОЯНИЯ, И ЖИВУТ ОНИ В РАЗНЫХ МЕСТАХ</text>

      <rect x={30} y={64} width={370} height={140} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Внутри компонента</text>
      <text x={50} y={120} fontSize={11} fontFamily={MONO} fill={ACCENT}>var open by remember</text>
      <text x={50} y={146} fontSize={11} fill={FADE}>открыта ли шторка — дело самого</text>
      <text x={50} y={164} fontSize={11} fill={FADE}>селекта, наружу это не нужно</text>
      <text x={50} y={190} fontSize={11} fill={FADE}>вызывающий про шторку не знает вовсе</text>

      <rect x={420} y={64} width={370} height={140} rx={11} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">Снаружи</text>
      <text x={440} y={120} fontSize={11} fontFamily={MONO} fill="#fff">value: T?</text>
      <text x={440} y={142} fontSize={11} fontFamily={MONO} fill="#fff">onSelect: (T) -&gt; Unit</text>
      <text x={440} y={168} fontSize={11} fill={FADE}>выбранное значение нужно экрану:</text>
      <text x={440} y={186} fontSize={11} fill={FADE}>его отправляют, проверяют, сохраняют</text>

      <text x={30} y={240} fontSize={12.5} fill="#fff">правило: наружу выносят то, что нужно экрану, а не всё подряд</text>
      <text x={30} y={266} fontSize={12.5} fill={FADE}>вынесли бы open — каждый экран обязан был бы держать лишнее состояние ни за чем</text>
    </Panel>
  ),

  'ks-hide-async': (aria) => (
    <Panel id="fig-ks-hide" w={820} h={280} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАКРЫТЬ ШТОРКУ — ЭТО АНИМАЦИЯ, А ЗНАЧИТ ОЖИДАНИЕ</text>

      <rect x={30} y={64} width={370} height={128} rx={11} fill="rgba(255,140,140,0.12)" stroke={RED} strokeWidth={2} />
      <text x={50} y={92} fontSize={12} fontWeight={700} fill="#fff">Рывком</text>
      <text x={50} y={120} fontSize={10.5} fontFamily={MONO} fill={RED_TEXT}>open = false</text>
      <text x={50} y={148} fontSize={11} fill={FADE}>шторка исчезает мгновенно,</text>
      <text x={50} y={168} fontSize={11} fill={FADE}>без съезда вниз — заметно и дёшево</text>

      <rect x={420} y={64} width={370} height={128} rx={11} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={440} y={92} fontSize={12} fontWeight={700} fill="#fff">С анимацией</text>
      <text x={440} y={116} fontSize={10} fontFamily={MONO} fill={ACCENT}>scope.launch {'{ state.hide() }'}</text>
      <text x={440} y={136} fontSize={10} fontFamily={MONO} fill={ACCENT}>  .invokeOnCompletion {'{ … }'}</text>
      <text x={440} y={164} fontSize={11} fill={FADE}>сначала доигрывает съезд,</text>
      <text x={440} y={182} fontSize={11} fill={FADE}>потом убирает шторку из разметки</text>

      <text x={30} y={228} fontSize={12.5} fill="#fff">hide() приостанавливаемая — вызвать её прямо в разметке компилятор не даст</text>
      <text x={30} y={254} fontSize={12.5} fill={FADE}>Suspend function &apos;suspend fun hide(): Unit&apos; should be called only from a coroutine</text>
      <text x={30} y={276} fontSize={12.5} fill={ACCENT}>отсюда и rememberCoroutineScope: место, откуда анимацию запускают</text>
    </Panel>
  ),
};
