import React from 'react';
import Layout from '@theme/Layout';
import CommunityCatalog from '../components/CommunityCatalog';
import '../components/trainers.css';

export default function Community() {
  return (
    <Layout
      title="Сообщество"
      description="Каталог материалов от студентов: пресеты тренажёров, репозитории и полезные ссылки"
    >
      <main className="container margin-vert--lg">
        <h1>Сообщество</h1>
        <CommunityCatalog />
      </main>
    </Layout>
  );
}
