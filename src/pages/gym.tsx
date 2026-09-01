import React from 'react';
import Layout from '@theme/Layout';
import GymCatalog from '../components/GymCatalog';
import '../components/trainers.css';

export default function Gym() {
  return (
    <Layout title="Тренажёрный зал" description="Все тренажёры платформы — запускай отдельно от глав">
      <main className="container margin-vert--lg">
        <h1>Тренажёрный зал</h1>
        <p>
          Здесь собраны все механики платформы — их можно запускать отдельно от глав, сколько угодно
          раз. У каждой карточки есть ссылка на главу, где механика встречается по программе.
          Результаты отсюда не влияют на прогресс глав: зал — это чистая тренировка.
        </p>
        <GymCatalog />
      </main>
    </Layout>
  );
}
