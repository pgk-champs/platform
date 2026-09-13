import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Каталог»: конверт ответа PocketBase, путь одного запроса
 * от интерфейса до объекта, арифметика страниц. */

export const shopCatalogSchemes: Schemes = {
  'sc-envelope': (aria) => (
    <Panel id="fig-sc-env" w={820} h={330} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОТВЕТ ПРИХОДИТ НЕ СПИСКОМ, А КОНВЕРТОМ</text>

      <rect x={30} y={62} width={380} height={238} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={48} y={90} fontSize={12} fontFamily={MONO} fill={FADE}>{'{'}</text>
      <text x={64} y={114} fontSize={12} fontFamily={MONO} fill={ACCENT}>&quot;page&quot;: 1,</text>
      <text x={64} y={138} fontSize={12} fontFamily={MONO} fill={ACCENT}>&quot;perPage&quot;: 2,</text>
      <text x={64} y={162} fontSize={12} fontFamily={MONO} fill={ACCENT}>&quot;totalItems&quot;: 12,</text>
      <text x={64} y={186} fontSize={12} fontFamily={MONO} fill={ACCENT}>&quot;totalPages&quot;: 6,</text>
      <text x={64} y={210} fontSize={12} fontFamily={MONO} fill="#fff">&quot;items&quot;: [</text>
      <text x={80} y={234} fontSize={12} fontFamily={MONO} fill={FADE}>{'{ "id": "8ezt4dm…",'}</text>
      <text x={80} y={256} fontSize={12} fontFamily={MONO} fill={FADE}>{'  "title": "Nike Air Max 270" },'}</text>
      <text x={80} y={278} fontSize={12} fontFamily={MONO} fill={FADE}>…</text>
      <text x={64} y={298} fontSize={12} fontFamily={MONO} fill="#fff">]</text>

      <rect x={440} y={62} width={350} height={104} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={460} y={90} fontSize={12.5} fill={ACCENT}>четыре числа — для пагинации</text>
      <text x={460} y={116} fontSize={11.5} fill="#fff">totalPages говорит, когда останавливаться</text>
      <text x={460} y={140} fontSize={11.5} fill="#fff">totalItems — сколько всего, а не сколько пришло</text>

      <rect x={440} y={182} width={350} height={118} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={460} y={210} fontSize={12.5} fill="#fff">items — то, что рисует экран</text>
      <text x={460} y={236} fontSize={11.5} fill={FADE}>распарсить сразу в List&lt;Product&gt; нельзя:</text>
      <text x={460} y={258} fontSize={11.5} fill={FADE}>снаружи объект, а не массив</text>
      <text x={460} y={288} fontSize={11.5} fontFamily={MONO} fill={ACCENT}>PageResponse&lt;ProductDto&gt;</text>
    </Panel>
  ),

  'sc-request-path': (aria) => (
    <Panel id="fig-sc-path" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ОДИН ВЫЗОВ — ЧЕТЫРЕ ПРЕВРАЩЕНИЯ</text>

      {[
        { x: 30, w: 178, t: 'api.catalog(1, 30)', d: 'вызов метода', mono: true },
        { x: 236, w: 152, t: 'Retrofit', d: 'собирает URL', mono: false },
        { x: 416, w: 152, t: 'OkHttp', d: 'шлёт по сети', mono: false },
        { x: 596, w: 194, t: 'kotlinx', d: 'разбирает JSON', mono: false },
      ].map((b) => (
        <g key={b.x}>
          <rect x={b.x} y={78} width={b.w} height={72} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
          <text x={b.x + b.w / 2} y={110} textAnchor="middle" fontSize={12.5} fontFamily={b.mono ? MONO : undefined} fill="#fff">{b.t}</text>
          <text x={b.x + b.w / 2} y={132} textAnchor="middle" fontSize={11} fill={FADE}>{b.d}</text>
        </g>
      ))}
      <Arrow x1={214} y1={114} x2={230} y2={114} color={INK} w={3} />
      <Arrow x1={394} y1={114} x2={410} y2={114} color={INK} w={3} />
      <Arrow x1={574} y1={114} x2={590} y2={114} color={INK} w={3} />

      <rect x={30} y={178} width={760} height={44} rx={10} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
      <text x={50} y={206} fontSize={12} fontFamily={MONO} fill={ACCENT}>GET /api/collections/products/records?page=1&amp;perPage=30</text>

      <text x={30} y={252} fontSize={12.5} fill="#fff">весь этот путь описан аннотациями — руками не собирается ни строка адреса, ни разбор тела</text>
      <text x={30} y={278} fontSize={12.5} fill={FADE}>ошибка в имени поля DTO компилятор не поймает: она всплывёт при первом запуске</text>
    </Panel>
  ),

  'sc-paging': (aria) => (
    <Panel id="fig-sc-page" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>12 ТОВАРОВ ПРИ perPage = 5</text>

      {[
        { x: 30, p: 'page=1', n: 5, ok: true },
        { x: 226, p: 'page=2', n: 5, ok: true },
        { x: 422, p: 'page=3', n: 2, ok: true },
        { x: 618, p: 'page=9', n: 0, ok: false },
      ].map((c) => (
        <g key={c.x}>
          <rect x={c.x} y={72} width={172} height={110} rx={12} fill={c.ok ? SOFT : 'rgba(0,0,0,0.3)'} stroke={c.ok ? ACCENT : INK} strokeWidth={2.5} />
          <text x={c.x + 86} y={100} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill={c.ok ? ACCENT : FADE}>{c.p}</text>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={c.x + 16 + i * 29} y={118} width={22} height={30} rx={5}
              fill={i < c.n ? (c.ok ? ACCENT : INK) : 'transparent'}
              stroke={i < c.n ? 'none' : SOFT} strokeWidth={1.5} />
          ))}
          <text x={c.x + 86} y={170} textAnchor="middle" fontSize={11} fill={FADE}>items: {c.n}</text>
        </g>
      ))}

      <rect x={30} y={204} width={760} height={44} rx={10} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={232} fontSize={12} fontFamily={MONO} fill="#fff">page=9 → 200 OK · items: [] · totalItems: 12 · totalPages: 3</text>

      <text x={30} y={278} fontSize={12.5} fill={ACCENT}>страница за пределом — не ошибка: код 200 и пустой список, проверять нужно totalPages</text>
    </Panel>
  ),
};
