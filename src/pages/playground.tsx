import React, { useState } from 'react';
import Layout from '@theme/Layout';
import KotlinPlay from '../components/KotlinPlay';
import '../components/trainers.css';

type Snippet = { id: string; label: string; code: string };

const SNIPPETS: Snippet[] = [
  {
    id: 'hello',
    label: 'Hello world',
    code: `fun main() {\n    println("Привет, мир!")\n}`,
  },
  {
    id: 'vars',
    label: 'Переменные',
    code: `fun main() {\n    val name = "Олег"\n    var score = 0\n    score += 10\n    println("$name набрал $score очков")\n}`,
  },
  {
    id: 'if',
    label: 'Условия',
    code: `fun main() {\n    val age = 16\n    if (age >= 18) {\n        println("Взрослый")\n    } else {\n        println("Подросток")\n    }\n}`,
  },
  {
    id: 'loop',
    label: 'Цикл',
    code: `fun main() {\n    for (i in 1..5) {\n        println("Шаг $i")\n    }\n}`,
  },
  {
    id: 'list',
    label: 'Список + map',
    code: `fun main() {\n    val numbers = listOf(1, 2, 3)\n    val doubled = numbers.map { it * 2 }\n    println(doubled)\n}`,
  },
  {
    id: 'fun',
    label: 'Функция',
    code: `fun square(x: Int): Int {\n    return x * x\n}\n\nfun main() {\n    println(square(5))\n}`,
  },
];

export default function Playground() {
  const [current, setCurrent] = useState<Snippet>(SNIPPETS[0]);

  return (
    <Layout title="Песочница" description="Песочница Kotlin — пробуй заготовки кода прямо в браузере">
      <main className="container margin-vert--lg">
        <h1>Песочница</h1>
        <p>
          Выбери заготовку ниже — её код подставится в редактор. Меняй его как хочешь и жми{' '}
          <strong>Run</strong>, чтобы увидеть результат. Это отдельная площадка: она не влияет на
          главы учебника, экспериментируй свободно.
        </p>
        <div className="pg-presets">
          {SNIPPETS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`button button--sm ${current.id === s.id ? 'button--primary' : 'button--secondary'}`}
              onClick={() => setCurrent(s)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <KotlinPlay key={current.id} code={current.code} />
      </main>
    </Layout>
  );
}
