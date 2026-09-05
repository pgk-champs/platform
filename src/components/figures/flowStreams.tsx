import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Flow»: одно значение против потока значений, конвейер
 * операторов, который стоит без collect, и разница между StateFlow
 * и SharedFlow — состоянием и событием. */

export const flowStreamsSchemes: Schemes = {
  /* suspend отдаёт один ответ, Flow — последовательность во времени */
  'fs-one-vs-many': (aria) => (
    <Panel id="fig-fs-one" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ОТВЕТ И ПОСЛЕДОВАТЕЛЬНОСТЬ ОТВЕТОВ</text>

      <text x={30} y={76} fontSize={12.5} fontFamily={MONO} fill="#fff">suspend fun getBalance(): Int</text>
      <rect x={30} y={88} width={760} height={46} rx={10} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={52} y={116} fontSize={12} fill={FADE}>запрос</text>
      <Arrow x1={110} y1={111} x2={360} y2={111} color={INK} w={3} />
      <text x={235} y={105} textAnchor="middle" fontSize={11} fill={FADE}>ожидание</text>
      <rect x={368} y={99} width={110} height={24} rx={6} fill={INK} />
      <text x={423} y={116} textAnchor="middle" fontSize={11.5} fill="#fff">1 значение</text>
      <text x={500} y={116} fontSize={12} fill={FADE}>и корутина закончилась</text>

      <text x={30} y={176} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>fun prices(): Flow&lt;Int&gt;</text>
      <rect x={30} y={188} width={760} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      {[52, 172, 292, 412, 532].map((x, i) => (
        <g key={x}>
          <rect x={x} y={199} width={86} height={24} rx={6} fill={ACCENT} />
          <text x={x + 43} y={216} textAnchor="middle" fontSize={11.5} fill="#fff">{`значение ${i + 1}`}</text>
        </g>
      ))}
      <text x={668} y={216} fontSize={12} fill={ACCENT}>…и дальше</text>

      <text x={30} y={272} fontSize={12.5} fill="#fff">баланс спросили один раз — получили число и забыли</text>
      <text x={30} y={294} fontSize={12.5} fill={FADE}>цену подписали — она приходит снова и снова, пока подписка жива</text>
    </Panel>
  ),

  /* операторы описывают работу, но не выполняют её: запускает только collect */
  'fs-cold-pipeline': (aria) => (
    <Panel id="fig-fs-cold" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>КОНВЕЙЕР СОБРАН, НО ВЫКЛЮЧЕН</text>

      <rect x={30} y={64} width={760} height={104} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} strokeDasharray="7 5" />
      <text x={50} y={92} fontSize={12} fill={FADE}>пока collect не вызван — ни одна строка внутри не выполнилась</text>
      <rect x={50} y={104} width={150} height={40} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={125} y={129} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">flow &#123; &#125;</text>
      <Arrow x1={206} y1={124} x2={252} y2={124} color={FADE} w={3} />
      <rect x={258} y={104} width={150} height={40} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={333} y={129} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">filter</text>
      <Arrow x1={414} y1={124} x2={460} y2={124} color={FADE} w={3} />
      <rect x={466} y={104} width={150} height={40} rx={9} fill={SOFT} stroke={INK} strokeWidth={2} />
      <text x={541} y={129} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">map</text>
      <text x={640} y={129} fontSize={12} fill={FADE}>описание</text>

      <Arrow x1={410} y1={180} x2={410} y2={214} color={ACCENT} w={4} />
      <text x={424} y={202} fontSize={12.5} fill={ACCENT}>collect включает конвейер</text>

      <rect x={30} y={222} width={760} height={54} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={50} y={254} fontSize={12.5} fontFamily={MONO} fill={ACCENT}>collect</text>
      <Arrow x1={130} y1={249} x2={196} y2={249} color={ACCENT} w={3} />
      <text x={210} y={254} fontSize={12.5} fill="#fff">теперь flow исполняется, значения идут через filter и map до collect</text>

      <text x={30} y={310} fontSize={12.5} fill={FADE}>холодный поток: у каждого collect своя отдельная работа с самого начала</text>
    </Panel>
  ),

  /* состояние всегда имеет значение, событие происходит один раз */
  'fs-state-vs-shared': (aria) => (
    <Panel id="fig-fs-state" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СОСТОЯНИЕ ХРАНИТСЯ, СОБЫТИЕ ПРОИСХОДИТ</text>

      <rect x={30} y={64} width={370} height={198} rx={14} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={52} y={94} fontSize={13.5} fontFamily={MONO} fill={ACCENT}>StateFlow</text>
      <text x={52} y={120} fontSize={12} fill="#fff">всегда есть значение прямо сейчас</text>
      <rect x={52} y={132} width={326} height={34} rx={8} fill="rgba(0,0,0,0.3)" stroke={ACCENT} strokeWidth={2} />
      <text x={215} y={154} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#fff">.value = &quot;готово&quot;</text>
      <text x={52} y={190} fontSize={12} fill={FADE}>подписался позже — получишь текущее</text>
      <text x={52} y={212} fontSize={12} fill={FADE}>то же значение подряд не повторится</text>
      <text x={52} y={240} fontSize={12} fill={ACCENT}>для экрана: загрузка, список, ошибка</text>

      <rect x={430} y={64} width={360} height={198} rx={14} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={452} y={94} fontSize={13.5} fontFamily={MONO} fill="#fff">SharedFlow</text>
      <text x={452} y={120} fontSize={12} fill="#fff">значения нет, есть только моменты</text>
      {[452, 546, 640].map((x) => (
        <g key={x}>
          <rect x={x} y={134} width={78} height={30} rx={8} fill={INK} />
          <text x={x + 39} y={154} textAnchor="middle" fontSize={11} fill="#fff">событие</text>
        </g>
      ))}
      <text x={452} y={190} fontSize={12} fill={FADE}>подписался позже — прошлое не увидишь</text>
      <text x={452} y={212} fontSize={12} fill={FADE}>одинаковые подряд придут оба</text>
      <text x={452} y={240} fontSize={12} fill="#fff">для разового: показать снекбар, уйти</text>

      <text x={30} y={296} fontSize={12.5} fill="#fff">спрашивай себя: это «как сейчас выглядит экран» или «что только что случилось»</text>
    </Panel>
  ),
};
