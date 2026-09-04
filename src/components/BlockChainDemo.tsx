import React, { useEffect, useRef, useState } from 'react';
import { store } from '../lib/store';
import { sha256Hex } from '../lib/sha256';
import './trainers.css';

const XP = 15;
const GENESIS = '0'.repeat(64);
const INITIAL_DATA = [
  'Алиса → Боб: 50 монет',
  'Боб → Ира: 20 монет',
  'Ира → Олег: 5 монет',
  'Олег → Алиса: 12 монет',
];

type Status = 'pending' | 'ok' | 'tampered' | 'broken';

const STATUS_LABEL: Record<Status, string> = {
  pending: '…',
  ok: '✓ в порядке',
  tampered: '⚠ данные изменены',
  broken: '✗ цепь порвана',
};

const short = (h: string) => (h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '…');

// «Печать» цепи: hash каждого блока = SHA-256(data + prevHash),
// prevHash следующего блока = hash предыдущего.
async function sealChain(data: string[]): Promise<string[]> {
  const chain: string[] = [];
  let prev = GENESIS;
  for (const d of data) {
    prev = await sha256Hex(d + prev);
    chain.push(prev);
  }
  return chain;
}

/**
 * Цепочка из 4 блоков: правишь data в любом блоке — его hash пересчитывается
 * вживую, а все блоки после него краснеют, потому что их prevHash больше не
 * совпадает. Кнопка «Пересчитать цепь» (майнинг понарошку) чинит цепь и
 * объясняет, почему в настоящем блокчейне это так просто не выйдет.
 * Порвал и починил (при заданных chapterId/trainerId) — зачёт + XP.
 */
export default function BlockChainDemo({
  chapterId,
  trainerId,
}: {
  chapterId?: string;
  trainerId?: string;
}) {
  const [data, setData] = useState(INITIAL_DATA);
  // sealed — хеши, «записанные в цепь» при последнем майнинге; live — живой
  // пересчёт hash от текущих данных. Расхождение sealed/live и есть разрыв.
  const [sealed, setSealed] = useState<string[] | null>(null);
  const [live, setLive] = useState<string[]>([]);
  const [repaired, setRepaired] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const brokeRef = useRef(false);
  const rewardedRef = useRef(false);
  // Печать цепи асинхронная. На медленной машине первичный расчёт может
  // завершиться уже после того, как ученик испортил данные и нажал
  // «Пересчитать» — и затереть свежую цепь исходной. Тогда блоки выглядят
  // целыми, а объяснение и награда не появляются.
  const sealedRef = useRef(false);

  // Первичная печать цепи — только в браузере (WebCrypto нет на SSR).
  useEffect(() => {
    let cancelled = false;
    void sealChain(INITIAL_DATA).then((chain) => {
      if (cancelled || sealedRef.current) return;
      sealedRef.current = true;
      setSealed(chain);
      setLive(chain);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Живой пересчёт hash каждого блока от (data + prevHash из цепи).
  useEffect(() => {
    if (!sealed) return;
    let cancelled = false;
    void Promise.all(
      data.map((d, i) => sha256Hex(d + (i === 0 ? GENESIS : sealed[i - 1]))),
    ).then((hs) => {
      if (!cancelled) setLive(hs);
    });
    return () => {
      cancelled = true;
    };
  }, [data, sealed]);

  const ready = sealed !== null && live.length === data.length;
  const firstTampered = ready ? live.findIndex((h, i) => h !== sealed[i]) : -1;
  const broken = firstTampered !== -1;

  // Разрыв цепи отмечается там, где он рождается — в правке поля (см. onChange
  // ниже), а не эффектом по `broken`. Эффект зависел от асинхронного пересчёта
  // hash и на медленной машине мог погасить свежее объяснение уже после
  // «Пересчитать»: цепь целая, а плашки «Цепь пересчитана» нет.

  const statusOf = (i: number): Status => {
    if (!ready) return 'pending';
    if (!broken || i < firstTampered) return 'ok';
    return i === firstTampered ? 'tampered' : 'broken';
  };

  const mine = async () => {
    const chain = await sealChain(data);
    sealedRef.current = true;
    setSealed(chain);
    setLive(chain);
    if (brokeRef.current) {
      setRepaired(true);
      if (!rewardedRef.current && chapterId && trainerId) {
        rewardedRef.current = true;
        store.markTrainerDone(chapterId, trainerId, { repaired: true });
        store.addXp(XP, `trainer:${chapterId}:${trainerId}`);
        setRewarded(true);
      }
    }
    brokeRef.current = false;
  };

  return (
    <div className="bcd">
      <div className="bcd-hint">
        Измени данные в любом блоке — и посмотри, как рвётся цепь: hash блока пересчитается, а
        prevHash следующих блоков перестанет совпадать.
      </div>

      {data.map((d, i) => {
        const st = statusOf(i);
        const prevShown = i === 0 ? GENESIS : (sealed?.[i - 1] ?? '');
        return (
          <React.Fragment key={i}>
            {i > 0 ? (
              <div className={`bcd-arrow${st === 'broken' ? ' bcd-arrow-broken' : ''}`} aria-hidden="true">
                ↓ prevHash
              </div>
            ) : null}
            <div className={`bcd-block bcd-${st}`}>
              <div className="bcd-head">
                <span className="bcd-title">Блок {i + 1}</span>
                <span className={`bcd-status bcd-status-${st}`}>{STATUS_LABEL[st]}</span>
              </div>
              <label className="bcd-field">
                <span className="bcd-key">data</span>
                <input
                  className="bcd-input"
                  value={d}
                  onChange={(e) => {
                    const v = e.target.value;
                    brokeRef.current = true;
                    setRepaired(false);
                    setData((arr) => arr.map((x, j) => (j === i ? v : x)));
                  }}
                />
              </label>
              <div className="bcd-row">
                <span className="bcd-key">prevHash</span>
                <code className={st === 'broken' ? 'bcd-hash-bad' : undefined} title={prevShown}>
                  {short(prevShown)}
                </code>
              </div>
              <div className="bcd-row">
                <span className="bcd-key">hash</span>
                <code title={live[i] ?? ''}>{short(live[i] ?? '')}</code>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      <div className="bcd-controls">
        <button type="button" className="bcd-mine" disabled={!broken} onClick={() => void mine()}>
          ⛏ Пересчитать цепь
        </button>
        {ready && !broken && !repaired ? (
          <span className="bcd-note">Цепь цела. Испорти данные в любом блоке, чтобы увидеть разрыв.</span>
        ) : null}
        {broken ? (
          <span className="bcd-note bcd-note-broken">
            Цепь порвана: hash изменённого блока больше не совпадает с prevHash следующего.
          </span>
        ) : null}
      </div>

      {repaired ? (
        <div className="bcd-explain">
          Цепь пересчитана: каждый блок получил новый hash, а следующий блок — новый prevHash. В
          настоящем блокчейне такой «ремонт» потребовал бы заново намайнить все блоки после
          изменённого быстрее всей остальной сети — поэтому подменить данные незаметно практически
          невозможно.
        </div>
      ) : null}

      {rewarded ? (
        <div className="hc-reward">✓ Готово! +{XP} XP — ты порвал цепь и починил её майнингом</div>
      ) : null}
    </div>
  );
}
