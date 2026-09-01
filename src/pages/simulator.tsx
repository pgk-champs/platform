import React from 'react';
import Layout from '@theme/Layout';
import ChampSimulator from '../components/ChampSimulator';
import '../components/trainers.css';

export default function Simulator() {
  return (
    <Layout
      title="Симулятор чемпионата"
      description="Тренировка по официальным критериям оценки чемпионата «Профессионалы»: модуль, таймер, чек-лист, итоговый балл"
    >
      <main className="container margin-vert--lg">
        <h1>Симулятор чемпионата</h1>
        <p>
          Официальные критерии оценки компетенции «Разработка мобильных приложений»: выбери модуль,
          запусти таймер на время, отведённое на модуль по регламенту, и отмечай выполненные критерии —
          измеримые чек-боксом, судейские ползунком. По завершении — итоговый балл, оценка и сравнение с
          прошлыми попытками.
        </p>
        <ChampSimulator />
      </main>
    </Layout>
  );
}
