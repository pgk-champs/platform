import React from 'react';
import Layout from '@theme/Layout';
import WordsTrainer from '../components/WordsTrainer';
import WordExport from '../components/WordExport';

export default function Words() {
  return (
    <Layout title="Слова" description="Тренировка слов: избранное и словари пройденных глав">
      <main className="container margin-vert--lg">
        <h1>Тренировка слов</h1>
        <p>
          Здесь собраны слова из избранного и словари всех пройденных глав. Отвечайте честно:
          слова с «не знал» будут показываться чаще.
        </p>
        <WordsTrainer />
        <WordExport />
      </main>
    </Layout>
  );
}
