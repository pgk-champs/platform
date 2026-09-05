import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Тестирование»: ручная проверка против набора кейсов,
 * фейк вместо настоящей реализации и заглушка сервера с журналом запросов. */

const RED = 'rgba(255,140,140,0.85)';
const RED_TEXT = 'rgba(255,170,170,0.95)';

export const testingMobileSchemes: Schemes = {
  'tm-coverage': (aria) => (
    <Panel id="fig-tm-coverage" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ТРИ РЕАЛИЗАЦИИ ОДНОЙ ПРОВЕРКИ</text>

      <text x={30} y={72} fontSize={12} fill="#fff">3 кейса, набранных руками</text>
      <text x={470} y={72} fontSize={12} fill="#fff">те же реализации против 14 кейсов</text>

      {[
        { y: 90, t: 'contains("@")', a: '3/3', b: '6/14', ok: false },
        { y: 150, t: 'containsMatchIn', a: '3/3', b: '10/14', ok: false },
        { y: 210, t: 'matches', a: '3/3', b: '14/14', ok: true },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={400} height={46} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={50} y={r.y + 29} fontSize={12.5} fontFamily={MONO} fill="#fff">{r.t}</text>
          <text x={410} y={r.y + 29} textAnchor="end" fontSize={12.5} fontFamily={MONO} fill={ACCENT}>{r.a} · ЗЕЛЁНЫЙ</text>

          <Arrow x1={438} y1={r.y + 23} x2={462} y2={r.y + 23} color={FADE} w={2.5} />

          <rect x={470} y={r.y} width={320} height={46} rx={10}
            fill={r.ok ? SOFT : 'rgba(0,0,0,0.28)'} stroke={r.ok ? ACCENT : RED} strokeWidth={2} />
          <text x={770} y={r.y + 29} textAnchor="end" fontSize={12.5} fontFamily={MONO} fill={r.ok ? ACCENT : RED_TEXT}>
            {r.b} · {r.ok ? 'ЗЕЛЁНЫЙ' : 'КРАСНЫЙ'}
          </text>
        </g>
      ))}

      <text x={30} y={286} fontSize={12.5} fill="#fff">руками все три неразличимы — разницу показал только набор кейсов</text>
      <text x={30} y={310} fontSize={12.5} fill={FADE}>руками проверено 3 из 14 = 21% покрытия</text>
    </Panel>
  ),

  'tm-fake-vs-real': (aria) => (
    <Panel id="fig-tm-fake" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ТЕСТ, ДВЕ РЕАЛИЗАЦИИ ЗАВИСИМОСТИ</text>

      <rect x={300} y={62} width={220} height={50} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={410} y={84} textAnchor="middle" fontSize={12.5} fill="#fff">ProductRepository</text>
      <text x={410} y={102} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={FADE}>api: ProductApi</text>

      <Arrow x1={350} y1={116} x2={200} y2={162} color={RED} w={2.5} />
      <Arrow x1={470} y1={116} x2={620} y2={162} color={ACCENT} w={2.5} />

      <rect x={40} y={166} width={320} height={96} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={60} y={192} fontSize={12.5} fill="#fff">RealProductApi — настоящая сеть</text>
      <text x={60} y={216} fontSize={11.5} fontFamily={MONO} fill={RED_TEXT}>20 прогонов: 6099 мс</text>
      <text x={60} y={240} fontSize={11.5} fill={RED_TEXT}>упало 2 из 20 — код не менялся, моргнула сеть</text>

      <rect x={460} y={166} width={320} height={96} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={480} y={192} fontSize={12.5} fill="#fff">FakeProductApi — обычный класс</text>
      <text x={480} y={216} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>20 прогонов: 183 мкс</text>
      <text x={480} y={240} fontSize={11.5} fill={ACCENT}>упало 0 из 20 · умеет «нет сети» на заказ</text>

      <text x={30} y={300} fontSize={12.5} fill="#fff">подмена — дефолтным параметром конструктора: в приложении Repository(), в тесте Repository(FakeApi())</text>
    </Panel>
  ),

  'tm-mockwebserver': (aria) => (
    <Panel id="fig-tm-mws" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЗАГЛУШКА ОТВЕЧАЕТ НА ЧТО УГОДНО</text>

      <rect x={30} y={70} width={230} height={70} rx={12} fill={SOFT} stroke={INK} strokeWidth={2.5} />
      <text x={145} y={98} textAnchor="middle" fontSize={12.5} fill="#fff">клиент</text>
      <text x={145} y={122} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={RED_TEXT}>{'{"login":…,"pass":…}'}</text>

      <Arrow x1={266} y1={96} x2={334} y2={96} color={INK} w={2.5} />
      <Arrow x1={334} y1={116} x2={266} y2={116} color={ACCENT} w={2.5} />

      <rect x={340} y={62} width={450} height={92} rx={12} fill="rgba(0,0,0,0.28)" stroke={ACCENT} strokeWidth={2.5} />
      <text x={360} y={88} fontSize={12.5} fill="#fff">MockWebServer</text>
      <text x={360} y={110} fontSize={11} fontFamily={MONO} fill={ACCENT}>{'очередь ответов: {"id":7,"name":"Иван"}'}</text>
      <text x={360} y={132} fontSize={11} fontFamily={MONO} fill={FADE}>журнал запросов: POST /api/auth + тело</text>

      <rect x={30} y={176} width={370} height={64} rx={12} fill="rgba(0,0,0,0.28)" stroke={RED} strokeWidth={2.5} />
      <text x={50} y={202} fontSize={12.5} fill="#fff">тест №1: проверил только ответ</text>
      <text x={50} y={226} fontSize={11.5} fill={RED_TEXT}>ЗЕЛЁНЫЙ — а на живом сервере это 400</text>

      <rect x={420} y={176} width={370} height={64} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={440} y={202} fontSize={12.5} fill="#fff">тест №2: плюс takeRequest() и сверка тела</text>
      <text x={440} y={226} fontSize={11.5} fill={ACCENT}>КРАСНЫЙ — ошибка найдена до сдачи</text>

      <text x={30} y={278} fontSize={12.5} fill="#fff">заглушка отдаёт заготовку на любой запрос — проверять надо и ответ, и то, что ушло</text>
      <text x={30} y={304} fontSize={12.5} fill={FADE}>метод, путь, тело, заголовок Authorization</text>
    </Panel>
  ),
};
