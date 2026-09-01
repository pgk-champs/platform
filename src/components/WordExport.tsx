import React, { useState } from 'react';
import { buildPool } from './WordsTrainer';
import { buildAnkiCsv, buildQuizletTsv, downloadFile } from '../lib/integrations';
import './trainers.css';

// Экспорт слов (избранные + словари пройденных глав) в файл для Anki (CSV)
// или Quizlet (TSV). Пул собирается в момент клика — buildPool читает
// localStorage, чего при SSR-рендере не происходит.
export default function WordExport() {
  const [empty, setEmpty] = useState(false);

  const exportAs = (kind: 'anki' | 'quizlet') => {
    const pool = buildPool();
    if (pool.length === 0) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    if (kind === 'anki') {
      downloadFile('pgk-words-anki.csv', 'text/csv;charset=utf-8', buildAnkiCsv(pool));
    } else {
      downloadFile('pgk-words-quizlet.tsv', 'text/tab-separated-values;charset=utf-8', buildQuizletTsv(pool));
    }
  };

  return (
    <div className="intg-export">
      <div className="intg-row">
        <button type="button" className="button button--secondary" onClick={() => exportAs('anki')}>
          Экспорт в Anki (CSV)
        </button>
        <button type="button" className="button button--secondary" onClick={() => exportAs('quizlet')}>
          Quizlet (TSV)
        </button>
      </div>
      {empty ? (
        <p className="intg-note">
          Пока нечего экспортировать: отметьте слова звёздочкой ★ или пройдите главу целиком — её словарь
          добавится в набор.
        </p>
      ) : (
        <p className="intg-note">
          В файл попадут избранные слова и словари пройденных глав. В Anki: Файл → Импортировать; в Quizlet:
          «Импортировать» при создании модуля.
        </p>
      )}
    </div>
  );
}
