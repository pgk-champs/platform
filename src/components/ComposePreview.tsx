import React, { useEffect, useMemo, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Мини-превью Compose-вёрстки: телефон 360x640 рендерится настоящим HTML
// (flexbox) из декларативного JSON-дерева, а рядом — псевдокод Compose,
// сгенерированный из ТОГО ЖЕ дерева. Код и картинка не могут разойтись.
// В режиме editable — панель контролов: меняешь параметр, обновляются оба.

const GOAL = 3; // столько изменений = «поиграл» → цель трека выполнена
const XP = 10;

export type ComposeArrangement = 'start' | 'center' | 'end' | 'spaceBetween';
export type ComposeAlignment = 'start' | 'center' | 'end';

export type ComposeNode = {
  type: 'Column' | 'Row' | 'Box' | 'Text' | 'Button' | 'Spacer' | 'Image';
  text?: string;
  fontSize?: number; // sp
  color?: string; // css hex → Color(0xFF...)
  padding?: number; // dp
  arrangement?: ComposeArrangement; // главная ось Column/Row
  alignment?: ComposeAlignment; // поперечная ось / contentAlignment у Box
  weight?: number;
  width?: number; // dp
  height?: number; // dp
  fillMaxWidth?: boolean;
  fillMaxSize?: boolean;
  background?: string;
  cornerRadius?: number; // dp
  children?: ComposeNode[];
};

export type ComposeControlParam =
  | 'arrangement'
  | 'alignment'
  | 'padding'
  | 'fontSize'
  | 'cornerRadius'
  | 'weight'
  | 'width'
  | 'height';

// path — индексы children от корня через точку: '' = корень, '0', '1.2'.
export type ComposeControl = { path: string; param: ComposeControlParam; min?: number; max?: number };

export type ComposePreviewProps = {
  tree: ComposeNode;
  editable?: boolean;
  controls?: ComposeControl[];
  chapterId?: string;
  trainerId?: string;
};

// --- дерево ---

function getAt(node: ComposeNode, path: string): ComposeNode | undefined {
  if (path === '') return node;
  let cur: ComposeNode | undefined = node;
  for (const part of path.split('.')) cur = cur?.children?.[Number(part)];
  return cur;
}

function updateAt(node: ComposeNode, path: string, param: ComposeControlParam, value: string | number): ComposeNode {
  if (path === '') return { ...node, [param]: value } as ComposeNode;
  const [head, ...rest] = path.split('.');
  const i = Number(head);
  return {
    ...node,
    children: (node.children ?? []).map((c, idx) => (idx === i ? updateAt(c, rest.join('.'), param, value) : c)),
  };
}

// editable без явных controls: берём явно заданные в дереве arrangement /
// padding / fontSize (в порядке обхода), максимум 5 контролов.
function autoControls(tree: ComposeNode): ComposeControl[] {
  const out: ComposeControl[] = [];
  const walk = (n: ComposeNode, path: string) => {
    if (n.arrangement !== undefined) out.push({ path, param: 'arrangement' });
    if (n.padding !== undefined) out.push({ path, param: 'padding', min: 0, max: 48 });
    if (n.fontSize !== undefined) out.push({ path, param: 'fontSize', min: 10, max: 40 });
    n.children?.forEach((c, i) => walk(c, path ? `${path}.${i}` : String(i)));
  };
  walk(tree, '');
  return out.slice(0, 5);
}

// --- генерация псевдокода Compose ---

const ARR_COL: Record<ComposeArrangement, string> = {
  start: 'Arrangement.Top',
  center: 'Arrangement.Center',
  end: 'Arrangement.Bottom',
  spaceBetween: 'Arrangement.SpaceBetween',
};
const ARR_ROW: Record<ComposeArrangement, string> = {
  start: 'Arrangement.Start',
  center: 'Arrangement.Center',
  end: 'Arrangement.End',
  spaceBetween: 'Arrangement.SpaceBetween',
};
const ALIGN_COL: Record<ComposeAlignment, string> = {
  start: 'Alignment.Start',
  center: 'Alignment.CenterHorizontally',
  end: 'Alignment.End',
};
const ALIGN_ROW: Record<ComposeAlignment, string> = {
  start: 'Alignment.Top',
  center: 'Alignment.CenterVertically',
  end: 'Alignment.Bottom',
};
const ALIGN_BOX: Record<ComposeAlignment, string> = {
  start: 'Alignment.TopStart',
  center: 'Alignment.Center',
  end: 'Alignment.BottomEnd',
};

function kColor(c: string): string {
  const m6 = /^#([0-9a-fA-F]{6})$/.exec(c);
  if (m6) return `Color(0xFF${m6[1].toUpperCase()})`;
  const m3 = /^#([0-9a-fA-F]{3})$/.exec(c);
  if (m3) return `Color(0xFF${m3[1].split('').map((ch) => ch + ch).join('').toUpperCase()})`;
  return `Color.${c.charAt(0).toUpperCase()}${c.slice(1)}`;
}

function kModifier(n: ComposeNode): string {
  const parts: string[] = [];
  if (n.fillMaxSize) parts.push('fillMaxSize()');
  else {
    if (n.fillMaxWidth) parts.push('fillMaxWidth()');
    if (n.width !== undefined) parts.push(`width(${n.width}.dp)`);
    if (n.height !== undefined) parts.push(`height(${n.height}.dp)`);
  }
  if (n.weight !== undefined) parts.push(`weight(${n.weight}f)`);
  if (n.background) {
    parts.push(
      n.cornerRadius
        ? `background(${kColor(n.background)}, RoundedCornerShape(${n.cornerRadius}.dp))`
        : `background(${kColor(n.background)})`,
    );
  } else if (n.cornerRadius) {
    parts.push(`clip(RoundedCornerShape(${n.cornerRadius}.dp))`);
  }
  if (n.padding !== undefined) parts.push(`padding(${n.padding}.dp)`);
  return parts.length ? `Modifier.${parts.join('.')}` : '';
}

function genLines(n: ComposeNode, indent: string): string[] {
  const mod = kModifier(n);
  const modArg = mod ? `modifier = ${mod}` : '';
  switch (n.type) {
    case 'Text': {
      const args = [`"${n.text ?? ''}"`];
      if (n.fontSize !== undefined) args.push(`fontSize = ${n.fontSize}.sp`);
      if (n.color) args.push(`color = ${kColor(n.color)}`);
      if (modArg) args.push(modArg);
      return [`${indent}Text(${args.join(', ')})`];
    }
    case 'Spacer':
      return [`${indent}Spacer(${modArg || 'Modifier'})`];
    case 'Image': {
      const args = ['painterResource(R.drawable.pic)', 'contentDescription = null'];
      if (modArg) args.push(modArg);
      return [`${indent}Image(${args.join(', ')})`];
    }
    case 'Button': {
      const open = modArg ? `Button(onClick = { }, ${modArg})` : 'Button(onClick = { })';
      return [`${indent}${open} { Text("${n.text ?? ''}") }`];
    }
    default: {
      const args: string[] = [];
      if (modArg) args.push(modArg);
      if (n.arrangement && n.type === 'Column') args.push(`verticalArrangement = ${ARR_COL[n.arrangement]}`);
      if (n.arrangement && n.type === 'Row') args.push(`horizontalArrangement = ${ARR_ROW[n.arrangement]}`);
      if (n.alignment && n.type === 'Column') args.push(`horizontalAlignment = ${ALIGN_COL[n.alignment]}`);
      if (n.alignment && n.type === 'Row') args.push(`verticalAlignment = ${ALIGN_ROW[n.alignment]}`);
      if (n.alignment && n.type === 'Box') args.push(`contentAlignment = ${ALIGN_BOX[n.alignment]}`);
      const head = args.length ? `${n.type}(${args.join(', ')})` : n.type;
      const lines = [`${indent}${head} {`];
      for (const c of n.children ?? []) lines.push(...genLines(c, indent + '    '));
      lines.push(`${indent}}`);
      return lines;
    }
  }
}

// --- рендер мокапа (маппинг на flexbox, 1dp = 1px) ---

const FLEX: Record<ComposeArrangement, React.CSSProperties['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  spaceBetween: 'space-between',
};

function baseStyle(n: ComposeNode): React.CSSProperties {
  const s: React.CSSProperties = {};
  if (n.fillMaxSize) {
    s.width = '100%';
    s.height = '100%';
  } else {
    if (n.fillMaxWidth) s.width = '100%';
    if (n.width !== undefined) s.width = n.width;
    if (n.height !== undefined) s.height = n.height;
  }
  if (n.weight !== undefined) {
    s.flexGrow = n.weight;
    s.flexBasis = 0;
  }
  if (n.padding !== undefined) s.padding = n.padding;
  if (n.background) s.background = n.background;
  if (n.cornerRadius !== undefined) s.borderRadius = n.cornerRadius;
  if (n.color) s.color = n.color;
  if (n.fontSize !== undefined) s.fontSize = n.fontSize;
  return s;
}

function renderNode(n: ComposeNode, key: React.Key): React.ReactNode {
  const s = baseStyle(n);
  switch (n.type) {
    case 'Text':
      return (
        <span key={key} style={s}>
          {n.text}
        </span>
      );
    case 'Button':
      return (
        <span key={key} className="cpv-btn" style={s}>
          {n.text}
        </span>
      );
    case 'Spacer': {
      if (s.width === undefined && s.height === undefined && n.weight === undefined) s.height = 8;
      return <span key={key} aria-hidden style={s} />;
    }
    case 'Image':
      return (
        <span key={key} className="cpv-img" role="img" aria-label="изображение" style={{ width: 96, height: 96, ...s }}>
          🖼
        </span>
      );
    case 'Box':
      return (
        <div key={key} style={{ display: 'grid', placeItems: n.alignment ?? 'start', ...s }}>
          {(n.children ?? []).map((c, i) => (
            <div key={i} style={{ gridArea: '1 / 1' }}>
              {renderNode(c, i)}
            </div>
          ))}
        </div>
      );
    default:
      // Column / Row
      return (
        <div
          key={key}
          style={{
            display: 'flex',
            flexDirection: n.type === 'Column' ? 'column' : 'row',
            justifyContent: FLEX[n.arrangement ?? 'start'],
            alignItems: FLEX[n.alignment ?? 'start'],
            ...s,
          }}
        >
          {(n.children ?? []).map((c, i) => renderNode(c, i))}
        </div>
      );
  }
}

// --- контролы ---

const ARRANGEMENTS: ComposeArrangement[] = ['start', 'center', 'end', 'spaceBetween'];
const ALIGNMENTS: ComposeAlignment[] = ['start', 'center', 'end'];

function unit(param: ComposeControlParam): string {
  if (param === 'fontSize') return 'sp';
  if (param === 'weight') return '';
  return 'dp';
}

export default function ComposePreview({ tree, editable, controls, chapterId, trainerId }: ComposePreviewProps) {
  const [current, setCurrent] = useState(tree);
  const [changes, setChanges] = useState(0);
  const [done, setDone] = useState(false);
  const [awarded, setAwarded] = useState(false);

  useEffect(() => {
    if (chapterId && trainerId && store.getProgress().trainers[chapterId]?.[trainerId]) setDone(true);
  }, [chapterId, trainerId]);

  const resolvedControls = useMemo(
    () => controls ?? (editable ? autoControls(tree) : []),
    [controls, editable, tree],
  );
  const code = useMemo(() => genLines(current, '').join('\n'), [current]);

  const changeParam = (c: ComposeControl, value: string | number) => {
    setCurrent((t) => updateAt(t, c.path, c.param, value));
    const next = changes + 1;
    setChanges(next);
    if (next >= GOAL && chapterId && trainerId && !done) {
      store.markTrainerDone(chapterId, trainerId, { changes: next });
      store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
      setDone(true);
      setAwarded(true);
    }
  };

  const hasGoal = !!chapterId && !!trainerId && resolvedControls.length > 0;

  return (
    <div className="cpv">
      <div className="cpv-stage">
        <div className="cpv-phone">
          <div className="cpv-screen">{renderNode(current, 'root')}</div>
          <div className="cpv-notch" aria-hidden />
        </div>
        <pre className="cpv-code" aria-label="код Compose">
          <code>{code}</code>
        </pre>
      </div>

      {resolvedControls.length > 0 && (
        <div className="cpv-panel">
          <div className="cpv-panel-title">
            <span>Параметры — превью и код меняются вместе</span>
            <button type="button" className="cpv-reset" onClick={() => setCurrent(tree)}>
              Сбросить
            </button>
          </div>
          {resolvedControls.map((c, ci) => {
            const node = getAt(current, c.path);
            if (!node) return null;
            const name = `${node.type} · ${c.param}`;
            if (c.param === 'arrangement' || c.param === 'alignment') {
              const options = c.param === 'arrangement' ? ARRANGEMENTS : ALIGNMENTS;
              const value = (node[c.param] as string | undefined) ?? 'start';
              return (
                <div key={ci} className="cpv-ctl" role="group" aria-label={name}>
                  <span className="cpv-ctl-name">{name}</span>
                  <span className="cpv-seg">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={value === opt}
                        onClick={() => changeParam(c, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </span>
                </div>
              );
            }
            const num = Number(node[c.param] ?? c.min ?? 0);
            return (
              <label key={ci} className="cpv-ctl">
                <span className="cpv-ctl-name">{name}</span>
                <input
                  type="range"
                  min={c.min ?? 0}
                  max={c.max ?? 48}
                  value={num}
                  onChange={(e) => changeParam(c, Number(e.target.value))}
                />
                <span className="cpv-ctl-val">
                  {num}
                  {unit(c.param)}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {hasGoal && (
        <div className={'cpv-goal' + (done ? ' cpv-goal-done' : '')} aria-live="polite">
          {done
            ? `✓ Цель выполнена — ты увидел связь кода и вёрстки!${awarded ? ` +${XP} XP` : ''}`
            : `Измени параметры ${GOAL} раза и посмотри, как меняется код: ${Math.min(changes, GOAL)} из ${GOAL}`}
        </div>
      )}
    </div>
  );
}
