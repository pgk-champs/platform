import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Корутины»: заблокированный поток против приостановленной
 * корутины, что возвращают launch и async, куда идёт падение ребёнка
 * в обычном scope и в supervisorScope, и три штатных диспетчера. */

export const kotlinCoroutinesSchemes: Schemes = {
  /* один и тот же промежуток времени: поток занят ожиданием или свободен */
  'kc-thread-blocked': (aria) => (
    <Panel id="fig-kc-blocked" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ПОТОК, ОДНО И ТО ЖЕ ВРЕМЯ, ДВА ИСХОДА</text>

      <text x={30} y={76} fontSize={12.5} fill="#fff">Thread.sleep — поток занят</text>
      <rect x={30} y={88} width={760} height={44} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <rect x={44} y={100} width={200} height={20} rx={6} fill={INK} />
      <text x={144} y={115} textAnchor="middle" fontSize={11} fill="#fff">кадр</text>
      <rect x={252} y={100} width={396} height={20} rx={6} fill="rgba(255,255,255,0.14)" />
      <text x={450} y={115} textAnchor="middle" fontSize={11} fill={FADE}>ожидание — кадры не рисуются</text>
      <rect x={656} y={100} width={120} height={20} rx={6} fill={INK} />
      <text x={716} y={115} textAnchor="middle" fontSize={11} fill="#fff">кадр</text>

      <text x={30} y={176} fontSize={12.5} fill={ACCENT}>delay — поток свободен</text>
      <rect x={30} y={188} width={760} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      {[44, 152, 260, 368, 476, 584, 692].map((x) => (
        <rect key={x} x={x} y={200} width={84} height={20} rx={6} fill={ACCENT} />
      ))}
      <text x={410} y={252} textAnchor="middle" fontSize={11.5} fill={ACCENT}>та же корутина ждёт, а поток всё это время рисует кадры</text>

      <text x={30} y={292} fontSize={12.5} fill="#fff">заблокировать поток — занять его ожиданием, во время которого он бесполезен</text>
      <text x={30} y={314} fontSize={12.5} fill={FADE}>приостановить корутину — запомнить место и отпустить поток другим</text>
    </Panel>
  ),

  /* что именно возвращают launch и async и когда начинается работа */
  'kc-launch-async': (aria) => (
    <Panel id="fig-kc-la" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>LAUNCH ОТДАЁТ УПРАВЛЕНИЕ, ASYNC — ЕЩЁ И ЗНАЧЕНИЕ</text>

      <rect x={30} y={66} width={350} height={172} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={96} fontSize={14} fontFamily={MONO} fill="#fff">launch &#123; ... &#125;</text>
      <Arrow x1={205} y1={110} x2={205} y2={144} color={INK} w={3} />
      <rect x={130} y={150} width={150} height={38} rx={10} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={205} y={174} textAnchor="middle" fontSize={13} fontFamily={MONO} fill="#fff">Job</text>
      <text x={52} y={216} fontSize={11.5} fill={FADE}>ждут через join(), результата нет</text>

      <rect x={440} y={66} width={350} height={172} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={462} y={96} fontSize={14} fontFamily={MONO} fill={ACCENT}>async &#123; ... &#125;</text>
      <Arrow x1={615} y1={110} x2={615} y2={144} color={ACCENT} w={3} />
      <rect x={540} y={150} width={150} height={38} rx={10} fill={ACCENT} />
      <text x={615} y={174} textAnchor="middle" fontSize={13} fontFamily={MONO} fontWeight={700} fill="#10243a">Deferred</text>
      <text x={462} y={216} fontSize={11.5} fill={ACCENT}>ждут через await(), значение есть</text>

      <rect x={30} y={258} width={760} height={48} rx={12} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={288} fontSize={12.5} fill="#fff">работа стартует в момент async, а не на await — иначе выигрыша по времени не будет</text>
    </Panel>
  ),

  /* куда идёт падение ребёнка: вверх или остаётся в своей ветке */
  'kc-scope-tree': (aria) => (
    <Panel id="fig-kc-tree" w={820} h={340} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КУДА УХОДИТ ПАДЕНИЕ РЕБЁНКА</text>

      <text x={30} y={74} fontSize={12.5} fill="#fff">coroutineScope</text>
      <rect x={122} y={86} width={186} height={40} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={215} y={112} textAnchor="middle" fontSize={12.5} fill={FADE}>родитель отменён</text>
      <path d="M215 126v30h-92v26M215 156h92v26" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={30} y={182} width={186} height={40} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={123} y={208} textAnchor="middle" fontSize={12.5} fill={FADE}>сосед отменён</text>
      <rect x={214} y={182} width={186} height={40} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={307} y={208} textAnchor="middle" fontSize={12.5} fill="#fff">упал</text>
      <Arrow x1={307} y1={180} x2={240} y2={132} color={INK} w={3} />
      <text x={30} y={252} fontSize={11.5} fill={FADE}>падение поднялось вверх и снесло всю ветку</text>

      <text x={440} y={74} fontSize={12.5} fill={ACCENT}>supervisorScope</text>
      <rect x={532} y={86} width={186} height={40} rx={10} fill={ACCENT} />
      <text x={625} y={112} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#10243a">родитель жив</text>
      <path d="M625 126v30h-92v26M625 156h92v26" stroke={ACCENT} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={440} y={182} width={186} height={40} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={533} y={208} textAnchor="middle" fontSize={12.5} fill={ACCENT}>сосед доработал</text>
      <rect x={624} y={182} width={166} height={40} rx={10} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={707} y={208} textAnchor="middle" fontSize={12.5} fill="#fff">упал</text>
      <text x={440} y={252} fontSize={11.5} fill={ACCENT}>падение осталось в своей ветке</text>

      <rect x={30} y={272} width={760} height={44} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={300} fontSize={12.5} fill="#fff">try/catch вокруг await ловит только путь к await — вверх исключение уходит всё равно</text>
    </Panel>
  ),

  /* три штатных диспетчера и переключение через withContext */
  'kc-dispatchers': (aria) => (
    <Panel id="fig-kc-disp" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ ДИСПЕТЧЕРА: КТО ДАЁТ ПОТОК</text>

      {[
        { x: 30, name: 'Main', note: 'один поток', use: 'только интерфейс', accent: true },
        { x: 296, name: 'IO', note: 'много потоков', use: 'сеть, файлы, база', accent: false },
        { x: 562, name: 'Default', note: 'потоков по числу ядер', use: 'вычисления', accent: false },
      ].map((d) => (
        <g key={d.name}>
          <rect x={d.x} y={64} width={228} height={112} rx={14} fill={d.accent ? ACCENT : SOFT} stroke={d.accent ? 'none' : INK} strokeWidth={2.5} />
          <text x={d.x + 114} y={98} textAnchor="middle" fontSize={16} fontFamily={MONO} fontWeight={700} fill={d.accent ? '#10243a' : '#fff'}>{d.name}</text>
          <text x={d.x + 114} y={124} textAnchor="middle" fontSize={11.5} fill={d.accent ? '#10243a' : FADE}>{d.note}</text>
          <text x={d.x + 114} y={152} textAnchor="middle" fontSize={12.5} fill={d.accent ? '#10243a' : '#fff'}>{d.use}</text>
        </g>
      ))}

      <rect x={30} y={202} width={760} height={54} rx={12} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={234} fontSize={13.5} fontFamily={MONO} fill="#fff">withContext(Dispatchers.IO) &#123; ... &#125;</text>
      <Arrow x1={430} y1={229} x2={488} y2={229} color={ACCENT} w={3} />
      <text x={500} y={234} fontSize={12.5} fill={ACCENT}>выполнит блок там и вернётся обратно само</text>

      <text x={30} y={288} fontSize={12.5} fill="#fff">IO и Default берут потоки из общего пула — переключение между ними дешёвое</text>
      <text x={30} y={312} fontSize={12.5} fill={FADE}>Main существует только на Android: в консольной программе его нет</text>
    </Panel>
  ),
};
