import React, { useRef, useState } from 'react';
import { store } from '../lib/store';
import './trainers.css';

// Конструктор data class: имя класса + 2–4 поля (имя + тип из выпадашки) →
// живьём генерируется код и примеры того, что дадут сгенерированные
// toString()/equals()/copy() — тексты по образцу главы.

export type DcbFieldType = 'String' | 'Int' | 'Boolean' | 'Double';

const TYPES: DcbFieldType[] = ['String', 'Int', 'Boolean', 'Double'];

// Примеры значений по типам: i-е поле этого типа получает i-е значение,
// чтобы у двух полей одного типа значения различались.
const SAMPLES: Record<DcbFieldType, string[]> = {
  String: ['"Богдан"', '"Алиса"', '"Соня"', '"Самара"'],
  Int: ['91', '82', '77', '66'],
  Boolean: ['true', 'false', 'true', 'false'],
  Double: ['9.5', '8.0', '7.5', '6.5'],
};

const ALT: Record<DcbFieldType, string> = {
  String: '"Николай"',
  Int: '96',
  Boolean: 'true',
  Double: '10.0',
};

const MIN_FIELDS = 2;
const MAX_FIELDS = 4;
const XP = 25;

type Field = { name: string; type: DcbFieldType };

const CLASS_RE = /^[A-Z][A-Za-z0-9]*$/;
const FIELD_RE = /^[a-z][A-Za-z0-9]*$/;

/** Убирает кавычки для вывода toString(): "Богдан" → Богдан, как в главе. */
function plain(v: string): string {
  return v.replace(/^"|"$/g, '');
}

function sampleFor(fields: Field[], i: number): string {
  const nth = fields.slice(0, i).filter((f) => f.type === fields[i].type).length;
  return SAMPLES[fields[i].type][nth];
}

function altFor(fields: Field[], i: number): string {
  const t = fields[i].type;
  // Для Boolean берём противоположное примеру значение, иначе copy «ничего не поменяет».
  if (t === 'Boolean') return sampleFor(fields, i) === 'true' ? 'false' : 'true';
  return ALT[t];
}

export default function DataClassBuilder({
  chapterId,
  trainerId,
}: {
  /** Опциональны: без них конструктор работает без записи прогресса. */
  chapterId?: string;
  trainerId?: string;
}) {
  const [className, setClassName] = useState('');
  const [fields, setFields] = useState<Field[]>([
    { name: '', type: 'String' },
    { name: '', type: 'Int' },
  ]);
  const [done, setDone] = useState(false);
  const rewardedRef = useRef(false);

  const rules = [
    {
      ok: CLASS_RE.test(className),
      text: 'Имя класса — с заглавной латинской буквы, например Competitor',
    },
    {
      ok: fields.every((f) => FIELD_RE.test(f.name)),
      text: 'Каждое поле названо с маленькой латинской буквы, например score',
    },
    {
      ok: new Set(fields.map((f) => f.name)).size === fields.length,
      text: 'Имена полей не повторяются',
    },
  ];
  const valid = rules.every((r) => r.ok);

  const code = `data class ${className || '___'}(${fields
    .map((f) => `val ${f.name || '___'}: ${f.type}`)
    .join(', ')})`;

  const setField = (i: number, patch: Partial<Field>) => {
    setFields(fields.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  };

  const addField = () => {
    if (fields.length < MAX_FIELDS) setFields([...fields, { name: '', type: 'String' }]);
  };

  const removeField = (i: number) => {
    if (fields.length > MIN_FIELDS) setFields(fields.filter((_, j) => j !== i));
  };

  const check = () => {
    if (!valid) return;
    setDone(true);
    if (chapterId && trainerId && !rewardedRef.current) {
      rewardedRef.current = true;
      store.markTrainerDone(chapterId, trainerId, { className, fields: fields.length });
      store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
    }
  };

  // Примеры для сгенерированных методов — считаются только когда класс валиден.
  const args = fields.map((_, i) => sampleFor(fields, i));
  const last = fields.length - 1;
  const alt = valid ? altFor(fields, last) : '';
  const toStringOf = (values: string[]) =>
    `${className}(${fields.map((f, i) => `${f.name}=${plain(values[i])}`).join(', ')})`;
  const copiedArgs = args.map((v, i) => (i === last ? alt : v));

  return (
    <div className="dcb">
      <div className="dcb-form">
        <div className="dcb-row">
          <span className="dcb-label">Имя класса</span>
          <input
            className="dcb-input"
            type="text"
            placeholder="Competitor"
            aria-label="имя класса"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>
        {fields.map((f, i) => (
          <div className="dcb-row" key={i}>
            <span className="dcb-label">Поле {i + 1}</span>
            <input
              className="dcb-input"
              type="text"
              placeholder="имя поля"
              aria-label={`имя поля ${i + 1}`}
              value={f.name}
              onChange={(e) => setField(i, { name: e.target.value })}
            />
            <select
              className="dcb-select"
              aria-label={`тип поля ${i + 1}`}
              value={f.type}
              onChange={(e) => setField(i, { type: e.target.value as DcbFieldType })}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="dcb-remove"
              aria-label={`убрать поле ${i + 1}`}
              disabled={fields.length <= MIN_FIELDS}
              onClick={() => removeField(i)}
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" className="dcb-add" disabled={fields.length >= MAX_FIELDS} onClick={addField}>
          + поле
        </button>
      </div>

      <ul className="dcb-rules">
        {rules.map((r, i) => (
          <li key={i} className={`dcb-rule ${r.ok ? 'dcb-rule-ok' : ''}`.trim()}>
            {r.ok ? '✓' : '·'} {r.text}
          </li>
        ))}
      </ul>

      <code className="dcb-code" data-testid="dcb-code">
        {code}
      </code>

      {valid ? (
        <div className="dcb-demo" data-testid="dcb-demo">
          <div className="dcb-demo-row">
            <code>val a = {className}({args.join(', ')})</code>
          </div>
          <div className="dcb-demo-row">
            <code>println(a)</code>
            <span className="dcb-demo-note">— сгенерированный toString():</span>
            <code>{toStringOf(args)}</code>
          </div>
          <div className="dcb-demo-row">
            <code>
              a == {className}({args.join(', ')})
            </code>
            <span className="dcb-demo-note">— сгенерированный equals() сравнивает по содержимому:</span>
            <code>true</code>
            <span className="dcb-demo-note">(у обычного класса было бы false — сравнение по ссылке)</span>
          </div>
          <div className="dcb-demo-row">
            <code>
              a.copy({fields[last].name} = {alt})
            </code>
            <span className="dcb-demo-note">— новый объект, a не меняется:</span>
            <code>{toStringOf(copiedArgs)}</code>
          </div>
        </div>
      ) : (
        <div className="dcb-hint">Заполни имя класса и поля по правилам выше — примеры появятся здесь.</div>
      )}

      {done ? (
        <div className="dcb-done">
          ✓ Выполнено! Класс собран{chapterId && trainerId ? ` +${XP} XP` : ''}
        </div>
      ) : (
        <button type="button" className="dcb-check" disabled={!valid} onClick={check}>
          Проверить класс
        </button>
      )}
    </div>
  );
}
