import React, { useRef, useState } from 'react';
import './trainers.css';

export default function CodeTyping({ snippet }: { snippet: string }) {
  const [value, setValue] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const done = value.length >= snippet.length;

  const reset = () => {
    setValue('');
    setElapsed(0);
    startRef.current = null;
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    if (startRef.current === null && next.length > 0) {
      startRef.current = Date.now();
    }
    if (next.length >= snippet.length && startRef.current !== null) {
      setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    }
    setValue(next);
  };

  let correct = 0;
  for (let i = 0; i < value.length && i < snippet.length; i++) {
    if (value[i] === snippet[i]) correct++;
  }
  const accuracy = value.length > 0 ? Math.round((100 * correct) / snippet.length) : 0;

  return (
    <div className="ct">
      {done ? (
        <div className="ct-result">
          <p>Точность: {accuracy}%</p>
          <p>Время: {elapsed} сек.</p>
          <button onClick={reset}>Ещё раз</button>
        </div>
      ) : (
        <>
          <pre className="ct-code">
            {snippet.split('').map((ch, i) => {
              const cls = i >= value.length ? '' : value[i] === ch ? 'ct-ok' : 'ct-err';
              return (
                <span key={i} className={cls}>
                  {ch}
                </span>
              );
            })}
          </pre>
          <textarea
            aria-label="Печатай код здесь"
            spellCheck={false}
            value={value}
            onChange={onChange}
            onPaste={(e) => e.preventDefault()}
          />
        </>
      )}
    </div>
  );
}
