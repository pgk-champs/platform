import React from 'react';
import { ACCENT, Arrow, FADE, INK, MONO, Panel, SOFT, type Schemes } from './kit';

/* Схемы главы «Корзина и заказ»: бедная запись корзины, сборка витрины
 * из двух запросов, чего сервер не проверяет. */

export const shopCartSchemes: Schemes = {
  'sk-thin-row': (aria) => (
    <Panel id="fig-sk-thin" w={820} h={300} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ЧТО ХРАНИТ СЕРВЕР И ЧТО НУЖНО ЭКРАНУ</text>

      <rect x={30} y={64} width={330} height={162} rx={12} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2.5} />
      <text x={50} y={92} fontSize={12} fill={FADE}>запись корзины на сервере</text>
      <text x={50} y={122} fontSize={12} fontFamily={MONO} fill="#fff">{'"user_id": "ned6nzkcrtqip6s"'}</text>
      <text x={50} y={148} fontSize={12} fontFamily={MONO} fill="#fff">{'"product_id": "8ezt4dmrek7plpz"'}</text>
      <text x={50} y={174} fontSize={12} fontFamily={MONO} fill="#fff">{'"count": 3'}</text>
      <text x={50} y={206} fontSize={11.5} fill={FADE}>три поля — и всё</text>

      <Arrow x1={372} y1={144} x2={420} y2={144} color={ACCENT} w={3} />

      <rect x={432} y={64} width={358} height={162} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={452} y={92} fontSize={12} fill={ACCENT}>строка на экране</text>
      <text x={452} y={122} fontSize={12} fill="#fff">Nike Air Max 270</text>
      <text x={452} y={148} fontSize={12} fill="#fff">картинка · 10 500 ₽ × 3</text>
      <text x={452} y={174} fontSize={12} fill={ACCENT}>= 31 500 ₽</text>
      <text x={452} y={206} fontSize={11.5} fill="#fff">названия, цены и суммы на сервере нет</text>

      <text x={30} y={266} fontSize={12.5} fill="#fff">итог корзины считает приложение — сервер про деньги не знает вообще</text>
    </Panel>
  ),

  'sk-join': (aria) => (
    <Panel id="fig-sk-join" w={820} h={320} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>ДВА ЗАПРОСА ВМЕСТО N+1</text>

      <rect x={30} y={64} width={230} height={80} rx={12} fill="rgba(0,0,0,0.28)" stroke={INK} strokeWidth={2.5} />
      <text x={145} y={94} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="#fff">GET /cart/records</text>
      <text x={145} y={120} textAnchor="middle" fontSize={11} fill={FADE}>3 строки, только id товаров</text>

      <Arrow x1={272} y1={104} x2={318} y2={104} color={INK} w={3} />

      <rect x={330} y={64} width={460} height={80} rx={12} fill={SOFT} stroke={ACCENT} strokeWidth={2.5} />
      <text x={560} y={92} textAnchor="middle" fontSize={11.5} fontFamily={MONO} fill={ACCENT}>GET /products/records?filter=(id=&apos;a&apos;||id=&apos;b&apos;||id=&apos;c&apos;)</text>
      <text x={560} y={120} textAnchor="middle" fontSize={11} fill="#fff">все нужные товары одним запросом</text>

      <rect x={30} y={172} width={760} height={56} rx={12} fill="rgba(0,0,0,0.25)" stroke={FADE} strokeWidth={2} />
      <text x={50} y={196} fontSize={12} fontFamily={MONO} fill="#fff">products.associateBy {'{'} it.id {'}'} → словарь</text>
      <text x={50} y={218} fontSize={12} fontFamily={MONO} fill={ACCENT}>rows.mapNotNull {'{'} r -&gt; products[r.productId]?.let {'{'} CartLine(...) {'}'} {'}'}</text>

      <text x={30} y={264} fontSize={12.5} fill={ACCENT}>expand здесь не поможет: product_id — обычная строка, а не связь между коллекциями</text>
      <text x={30} y={292} fontSize={12.5} fill="#fff">запрос на каждую строку корзины — это N+1: три товара, четыре похода в сеть</text>
    </Panel>
  ),

  'sk-no-checks': (aria) => (
    <Panel id="fig-sk-checks" w={820} h={310} aria={aria}>
      <text x={30} y={38} fontSize={13} letterSpacing={3} fontWeight={600} fill={FADE}>СЕРВЕР ПРИНЯЛ ВСЁ ЭТО С КОДОМ 200</text>

      {[
        { y: 66, t: 'тот же товар положили дважды', r: 'две отдельные строки, дубль не склеился' },
        { y: 118, t: 'count = 0', r: 'сохранено как 0' },
        { y: 170, t: 'count = −5', r: 'сохранено как −5' },
        { y: 222, t: 'product_id = "net-takogo-tovara"', r: 'сохранено, товара такого нет' },
      ].map((r) => (
        <g key={r.y}>
          <rect x={30} y={r.y} width={368} height={40} rx={9} fill="rgba(0,0,0,0.3)" stroke={INK} strokeWidth={2} />
          <text x={48} y={r.y + 25} fontSize={12} fontFamily={MONO} fill="#fff">{r.t}</text>
          <Arrow x1={408} y1={r.y + 20} x2={436} y2={r.y + 20} color={FADE} w={2.5} />
          <rect x={446} y={r.y} width={344} height={40} rx={9} fill={SOFT} stroke={ACCENT} strokeWidth={2} />
          <text x={464} y={r.y + 25} fontSize={11.5} fill={ACCENT}>{r.r}</text>
        </g>
      ))}

      <text x={30} y={290} fontSize={12.5} fill="#fff">проверки — забота приложения: сервер задания это хранилище строк, а не магазин</text>
    </Panel>
  ),
};
