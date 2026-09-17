import React from 'react';
import './trainers.css';

// Объёмный разбор экрана Compose. Объём здесь объясняет, а не украшает:
// вложенность видна только в перспективе, плоской картинкой её не показать.
// Только CSS 3D — ни WebGL, ни библиотек.
//
// ГЛАВНОЕ РЕШЕНИЕ: глубина плоскости равна глубине узла в дереве Compose, и
// братья лежат на ОДНОЙ глубине. Линейная стопка из шести планов (как её
// описывал план переоформления) читалась бы как цепочка «TopAppBar → внутри
// него LazyColumn», а это неправда: оба — дети Scaffold. Первокурснику такая
// картинка врёт ровно в том месте, ради которого разбор и делается.

type Part = { cls: string; style: React.CSSProperties };

// Геометрия частей экрана задана ОДИН раз в процентах и переиспользуется
// всеми плоскостями. Поэтому каркас физически не может разъехаться с
// собранным экраном — это не аккуратность, а устройство.
const BAR: Part = { cls: 'cl-bar', style: { left: '6%', top: '5%', width: '88%', height: '9%' } };
const VIEWPORT: Part = {
  cls: 'cl-view',
  style: { left: '6%', top: '18%', width: '88%', height: '74%' },
};
const CARD_TOP = [21, 46, 71];
const CARDS: Part[] = CARD_TOP.map((t) => ({
  cls: 'cl-card',
  style: { left: '10%', top: `${t}%`, width: '80%', height: '20%' },
}));
const AVATARS: Part[] = CARD_TOP.map((t) => ({
  cls: 'cl-avatar',
  style: { left: '15%', top: `${t + 5}%`, width: '11%', height: '10%' },
}));
const LINES: Part[] = CARD_TOP.flatMap((t) => [
  { cls: 'cl-line', style: { left: '30%', top: `${t + 6}%`, width: '46%', height: '3.5%' } },
  { cls: 'cl-line cl-line--short', style: { left: '30%', top: `${t + 12}%`, width: '28%', height: '3.5%' } },
]);

// Дерево Compose. depth — настоящая вложенность: у TopAppBar и LazyColumn она
// одна и та же, потому что это братья.
type Layer = {
  id: string;
  name: string;
  depth: number;
  note: string;
  parts: Part[];
  solid?: boolean;
  slots?: boolean;
};

const LAYERS: Layer[] = [
  {
    id: 'scaffold',
    name: 'Scaffold',
    depth: 0,
    note: 'держит весь экран',
    parts: [BAR, VIEWPORT, ...CARDS, ...AVATARS, ...LINES],
    solid: true,
  },
  { id: 'topbar', name: 'TopAppBar', depth: 1, note: 'шапка', parts: [BAR] },
  {
    id: 'lazy',
    name: 'LazyColumn',
    depth: 1,
    note: 'список — брат шапки, не её содержимое',
    parts: [VIEWPORT],
    slots: true,
  },
  { id: 'card', name: 'Card', depth: 2, note: 'карточка списка', parts: CARDS },
  { id: 'row', name: 'Row', depth: 3, note: 'строка внутри карточки', parts: [...AVATARS, ...LINES] },
  { id: 'text', name: 'Text', depth: 4, note: 'самый глубокий узел', parts: LINES },
];

function Plane({ layer, index }: { layer: Layer; index: number }) {
  return (
    <div
      className={`cl-layer${layer.solid ? ' cl-layer--solid' : ''}`}
      style={{ ['--d' as string]: layer.depth }}
      data-layer={layer.id}
    >
      <span className="cl-num" aria-hidden="true">
        {index + 1}
      </span>
      {layer.parts.map((p, i) => (
        <span key={i} className={p.cls} style={p.style} />
      ))}
      {/* Пунктирные слоты: место, куда карточку ещё не положили. Это
          единственная деталь, которая учит самой природе LazyColumn. */}
      {layer.slots &&
        CARDS.map((c, i) => <span key={`s${i}`} className="cl-slot" style={c.style} />)}
    </div>
  );
}

export default function ComposeLayers(): React.ReactElement {
  return (
    <div className="cl">
      <div className="cl-stage">
        <div className="cl-deck">
          {LAYERS.map((l, i) => (
            <Plane key={l.id} layer={l} index={i} />
          ))}
        </div>
      </div>
      {/* Подписи живут рядом со сценой, а не на плоскостях: на наклонённой
          стопке бирки налезают на каркасы, и это ловилось на разборе. Отступ
          в дереве показывает вложенность словами — то, что объём показывает
          глубиной. */}
      <ol className="cl-tree">
        {LAYERS.map((l, i) => (
          <li key={l.id} className="cl-tree-item" style={{ ['--d' as string]: l.depth }}>
            <span className="cl-tree-num">{i + 1}</span>
            <code className="cl-tree-name">{l.name}</code>
            <span className="cl-tree-note">{l.note}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
