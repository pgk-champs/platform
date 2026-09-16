import React from 'react';
import Layout from '@theme/Layout';
import CommunityCatalog from '../components/CommunityCatalog';
import SubmitCommunity from '../components/SubmitCommunity';
import '../components/trainers.css';

export default function Community() {
  return (
    <Layout
      title="Сообщество"
      description="Каталог материалов от студентов: видео и источники по темам глав, пресеты тренажёров, репозитории и полезные ссылки"
    >
      <main className="container margin-vert--lg">
        <h1>Сообщество</h1>
        <SubmitCommunity />
        <CommunityCatalog />
      </main>
    </Layout>
  );
}
