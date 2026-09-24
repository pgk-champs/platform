import React from 'react';
import Layout from '@theme/Layout';
import CommunityBoard from '../components/CommunityBoard';
import CommunityCatalog from '../components/CommunityCatalog';
import MyMaterials from '../components/MyMaterials';
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
        <CommunityBoard />
        <MyMaterials />
      </main>
    </Layout>
  );
}
