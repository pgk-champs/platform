import React, { useState } from 'react';
import { buildIcs, downloadFile } from '../lib/integrations';
import './trainers.css';

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Генератор расписания тренировок: дни недели + время + длительность курса →
// .ics с повторяющимся событием «Тренировка PGK Champs», который открывается
// любым календарём (Google, Apple, Outlook).
export default function TrainingSchedule() {
  const [days, setDays] = useState<boolean[]>(Array(7).fill(false));
  const [time, setTime] = useState('19:00');
  const [sessionMinutes, setSessionMinutes] = useState(45);
  const [weeks, setWeeks] = useState(4);

  const selected = days.flatMap((on, i) => (on ? [i] : []));

  const toggleDay = (i: number) => {
    setDays((prev) => prev.map((on, j) => (j === i ? !on : on)));
  };

  const download = () => {
    const ics = buildIcs({ days: selected, time, sessionMinutes, weeks, start: new Date() });
    if (ics) downloadFile('pgk-training.ics', 'text/calendar;charset=utf-8', ics);
  };

  return (
    <section className="intg-schedule">
      <h2>Расписание тренировок</h2>
      <p className="intg-note">
        Выберите дни и время — получите файл календаря с повторяющейся тренировкой. Регулярность важнее
        длительности: три коротких занятия в неделю дают больше, чем одно длинное.
      </p>
      <div className="intg-days" role="group" aria-label="Дни недели">
        {DAY_LABELS.map((label, i) => (
          <label key={label} className={`intg-day ${days[i] ? 'intg-day-on' : ''}`.trim()}>
            <input type="checkbox" checked={days[i]} onChange={() => toggleDay(i)} />
            {label}
          </label>
        ))}
      </div>
      <div className="intg-row">
        <label className="intg-field">
          Время{' '}
          <input type="time" value={time} onChange={(e) => setTime(e.target.value || '19:00')} />
        </label>
        <label className="intg-field">
          Минут за раз{' '}
          <input
            type="number"
            min={15}
            max={180}
            step={15}
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(Math.max(15, Number(e.target.value) || 45))}
          />
        </label>
        <label className="intg-field">
          Недель{' '}
          <input
            type="number"
            min={1}
            max={52}
            value={weeks}
            onChange={(e) => setWeeks(Math.max(1, Number(e.target.value) || 4))}
          />
        </label>
      </div>
      <button
        type="button"
        className="button button--primary"
        onClick={download}
        disabled={selected.length === 0}
      >
        В календарь (.ics)
      </button>
      {selected.length === 0 ? <span className="intg-note"> Отметьте хотя бы один день</span> : null}
    </section>
  );
}
