import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import CommunityCatalog from '../components/CommunityCatalog';
import SubmitCommunity from '../components/SubmitCommunity';
import '../components/trainers.css';

export default function Community() {
  return (
    <Layout
      title="Сообщество"
      description="Каталог материалов от студентов: пресеты тренажёров, репозитории и полезные ссылки"
    >
      <main className="container margin-vert--lg">
        <h1>Сообщество</h1>
        <p className="cg-teaser">
          Впервые здесь и слова «пресет» и «JSON» пугают? Есть{' '}
          <Link to="/community-guide">гайд «Как добавить своё: с нуля»</Link> — с разбором на пальцах
          и тренировкой формы без отправки.
        </p>
        <SubmitCommunity />
        <CommunityCatalog />
      </main>
    </Layout>
  );
}
