import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ModerationQueue from '../components/ModerationQueue';
import { isLoggedIn, login } from '../lib/account';
import '../components/trainers.css';

// Страница модератора. Очередь — тот же компонент, что стоит у наставника:
// ручки /moderate/* пускают обоих, поэтому списку незачем существовать дважды.

function Inner() {
  if (!isLoggedIn())
    return (
      <div className="ac-card">
        <p>Чтобы проверять материалы, войдите через GitHub.</p>
        <button className="button button--primary" onClick={() => login()}>
          Войти
        </button>
      </div>
    );
  // Без роли очередь приходит пустой — сервер отдаёт 403, клиент превращает его
  // в пустой список. Для человека разница между «нет доступа» и «нечего
  // проверять» тут несущественная, а лишнего запроса за ролью мы не делаем.
  return <ModerationQueue />;
}

export default function ModeratePage(): React.ReactElement {
  return (
    <Layout title="Проверка материалов" description="Очередь материалов, присланных студентами">
      <main className="container margin-vert--lg">
        <h1>Проверка материалов</h1>
        <p className="ac-muted">
          Ссылка проверена автоматически ещё при отправке — мёртвой тут быть не может.
          Остаётся решить по существу.
        </p>
        <BrowserOnly fallback={<p className="ac-muted">Загружаю…</p>}>{() => <Inner />}</BrowserOnly>
      </main>
    </Layout>
  );
}
