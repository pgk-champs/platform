// Вызов дня: 5 вопросов, детерминированно выбранных по дате из банка в 30
// вопросов по фактам глав (Kotlin, терминал, git, блокчейн). Проходится раз
// в день, серия подряд идущих дней отмечается огоньком, XP за верные ответы.
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { store } from '../lib/store';
import type { Question } from './SelfCheck';
import './trainers.css';

export const DAILY_SIZE = 5;
export const DAILY_XP_PER_CORRECT = 5;

export const DAILY_BANK: Question[] = [
  // --- Kotlin ---
  { q: 'Чем val отличается от var в Kotlin?', options: ['val — для чисел, var — для строк', 'val нельзя переприсвоить после первого значения, var — можно', 'val работает быстрее var', 'Ничем, это синонимы'], correct: 1, why: 'val — неизменяемая переменная, var — изменяемая. По умолчанию бери val.' },
  { q: 'Что делает знак = в строке val x = 5?', options: ['Проверяет, равны ли x и 5', 'Вычисляет правую часть и кладёт результат в переменную x', 'Объявляет тип переменной', 'Печатает x на экран'], correct: 1, why: '= — присваивание: сначала вычисляется правая часть, потом результат сохраняется в имя слева.' },
  { q: 'Почему в var score = 0 можно не писать тип?', options: ['Тип здесь вообще не нужен', 'Kotlin выведет Int сам по значению 0 — это вывод типов (type inference)', 'score всегда имеет тип Int по умолчанию', 'Потому что var, а с val тип обязателен'], correct: 1, why: 'Тип фиксируется при компиляции — компилятор определил его по правой части сам.' },
  { q: 'Чем 5 отличается от "5"?', options: ['Ничем, компилятор сам разберётся', '5 — число типа Int, а "5" — текст типа String', '"5" занимает меньше памяти', '5 нельзя напечатать через println'], correct: 1, why: 'Кавычки превращают запись в строку: это разные типы с разными операциями.' },
  { q: 'Что выведет println("Итог: $score"), если score = 42?', options: ['Итог: $score', 'Итог: 42', 'Итог: score', 'Ошибку компиляции'], correct: 1, why: '$ внутри двойных кавычек — строковый шаблон: подставляется значение переменной.' },
  { q: 'Что такое it в map { it * 2 }?', options: ['Специальный счётчик цикла', 'Неявное имя единственного параметра лямбды — очередной элемент списка', 'Сокращение от Int', 'Название метода'], correct: 1, why: 'Когда у лямбды один параметр, Kotlin даёт ему имя it автоматически.' },
  { q: 'Каким получается список из listOf(1, 2, 3)?', options: ['Изменяемым: можно добавлять элементы через add', 'Неизменяемым: читать можно, добавлять и менять — нет', 'Пустым, элементы добавляются позже', 'Это не список, а множество'], correct: 1, why: 'listOf создаёт read-only список. Для изменяемого есть mutableListOf.' },
  { q: 'Зачем в коде Kotlin две косые черты //?', options: ['Делят число нацело', 'Начинают комментарий: всё до конца строки компилятор пропускает', 'Объявляют сразу две переменные', 'Это ошибка синтаксиса'], correct: 1, why: 'Комментарий — заметка для людей, компилятор её не читает.' },
  { q: 'Что даёт слово data перед class в Kotlin?', options: ['Класс начинает хранить данные, обычный класс не может', 'Компилятор сам генерирует equals, hashCode, toString и copy по полям', 'Класс становится неизменяемым', 'Класс можно использовать только для базы данных'], correct: 1, why: 'data class — обычный класс, для которого компилятор пишет рутинные методы сравнения и печати за тебя.' },
  { q: 'С какого слова начинается объявление функции в Kotlin?', options: ['def', 'function', 'fun', 'void'], correct: 2, why: 'fun greet() { ... } — функции в Kotlin объявляются словом fun.' },
  // --- терминал / Linux ---
  { q: 'Что делает команда pwd?', options: ['Меняет пароль пользователя', 'Печатает путь к текущему каталогу', 'Показывает запущенные процессы', 'Удаляет каталог'], correct: 1, why: 'pwd — print working directory: где я сейчас нахожусь в файловой системе.' },
  { q: 'Что означает символ ~ (тильда) в пути?', options: ['Корень файловой системы', 'Короткое имя домашнего каталога текущего пользователя', 'Родительский каталог', 'Ошибку в пути'], correct: 1, why: '~ — псевдоним домашнего каталога, например /home/student.' },
  { q: 'Что покажет ls -a, чего не покажет ls без флагов?', options: ['Права доступа к файлам', 'Скрытые файлы — те, чьё имя начинается с точки', 'Только каталоги, без файлов', 'Размер файлов в байтах'], correct: 1, why: '-a (all) добавляет скрытые файлы: обычный ls их пропускает.' },
  { q: 'Куда переместит команда cd .. ?', options: ['В домашний каталог', 'В корень файловой системы', 'На один уровень вверх, в родительский каталог', 'Никуда: две точки — это ошибка'], correct: 2, why: '.. — родительский каталог, cd .. поднимает на уровень выше.' },
  { q: 'Чем отличаются --help и man?', options: ['--help показывает краткую справку прямо в терминале, man открывает полное руководство на весь экран', 'Это одна и та же команда с разным написанием', '--help работает только в Windows', 'man показывает только примеры, а --help — только флаги'], correct: 0, why: '--help — быстрая шпаргалка, man — полное руководство (закрывается клавишей q).' },
  { q: 'Что делает команда mkdir project?', options: ['Удаляет каталог project', 'Создаёт каталог с именем project', 'Переходит в каталог project', 'Показывает содержимое project'], correct: 1, why: 'mkdir — make directory: создать каталог.' },
  { q: 'Что делает вертикальная черта | между командами?', options: ['Выполняет команды по очереди, независимо друг от друга', 'Передаёт вывод левой команды на вход правой', 'Сравнивает выводы двух команд', 'Запускает обе команды параллельно'], correct: 1, why: 'Конвейер (pipe): вывод одной команды становится входом другой, например ls | wc -l.' },
  // --- git ---
  { q: 'Что показывает git status?', options: ['Историю всех коммитов', 'Состояние рабочего каталога: что изменено, что подготовлено к коммиту', 'Список веток на сервере', 'Автора репозитория'], correct: 1, why: 'git status — главная «приборная панель»: изменённые, добавленные и неотслеживаемые файлы.' },
  { q: 'Зачем нужен git add перед коммитом?', options: ['Он сразу отправляет файлы на сервер', 'Он кладёт изменения в индекс (staging) — черновик будущего коммита', 'Он создаёт новую ветку', 'Без него git commit работает так же'], correct: 1, why: 'add отбирает, что именно войдёт в коммит. Коммит фиксирует только то, что в индексе.' },
  { q: 'Что делает git commit -m "текст"?', options: ['Отправляет изменения на GitHub', 'Фиксирует снимок подготовленных изменений с сообщением в истории', 'Сохраняет файлы во временную папку', 'Проверяет код на ошибки'], correct: 1, why: 'Коммит — локальный снимок с описанием. На сервер его отправляет отдельная команда push.' },
  { q: 'Что такое ветка в git?', options: ['Полная копия всех файлов проекта', 'Лёгкий подвижный указатель на коммит', 'Отдельный репозиторий на сервере', 'Архив старых версий'], correct: 1, why: 'Ветка — просто указатель на коммит, поэтому создаётся мгновенно.' },
  { q: 'Что делает git clone?', options: ['Создаёт пустой репозиторий', 'Скачивает копию удалённого репозитория со всей историей', 'Копирует файлы без истории', 'Переименовывает репозиторий'], correct: 1, why: 'clone забирает и файлы, и всю историю коммитов удалённого репозитория.' },
  { q: 'Из каких двух действий состоит git pull?', options: ['add и commit', 'fetch (скачать изменения) и merge (влить их в свою ветку)', 'push и merge', 'clone и checkout'], correct: 1, why: 'pull = fetch + merge: сначала скачать чужие коммиты, потом влить их.' },
  { q: 'Для чего нужен файл .gitignore?', options: ['Хранит пароли от репозитория', 'Перечисляет файлы и папки, которые git не должен отслеживать', 'Игнорирует ошибки при коммите', 'Скрывает репозиторий от других'], correct: 1, why: 'Сборочный мусор и секреты не должны попадать в историю — их вносят в .gitignore.' },
  // --- блокчейн ---
  { q: 'Что произойдёт с хешем блока, если поменять в данных один символ?', options: ['Хеш не изменится', 'Хеш изменится на пару символов', 'Хеш изменится почти полностью — лавинный эффект', 'Хеш перестанет вычисляться'], correct: 2, why: 'Лавинный эффект: минимальное изменение входа даёт совершенно другой хеш.' },
  { q: 'Как блок связан с предыдущим блоком цепочки?', options: ['Хранит его полную копию', 'Хранит его порядковый номер', 'Хранит его хеш — компактный отпечаток', 'Хранит пароль от него'], correct: 2, why: 'Связь держится на хеше предыдущего блока: любая подмена мгновенно видна при пересчёте.' },
  { q: 'Можно ли по хешу восстановить исходные данные?', options: ['Да, это просто закодированный текст', 'Нет — хеш необратим, обратной операции не существует', 'Да, если знать секретный ключ', 'Да, если данные короче 64 символов'], correct: 1, why: 'Необратимость — ключевое свойство хеша; этим он отличается от шифрования.' },
  { q: 'Что означает «распределённый реестр» (distributed ledger)?', options: ['Реестр хранится в одном надёжном дата-центре', 'Полная копия реестра есть у каждого узла сети', 'Реестр разбит на части по узлам', 'Реестр существует только в оперативной памяти'], correct: 1, why: 'Распределённость — множество независимых полных копий, а не один хозяин.' },
  { q: 'Зачем нужна цифровая подпись под транзакцией?', options: ['Скрыть сумму перевода', 'Доказать, что перевод санкционировал владелец закрытого ключа и данные не менялись', 'Ускорить проверку блока', 'Это оформление записи'], correct: 1, why: 'Подпись даёт аутентификацию и целостность без банка-посредника.' },
  { q: 'Чем публичный блокчейн отличается от приватного (permissioned)?', options: ['Публичный работает быстрее по определению', 'В публичный может войти кто угодно, в приватный — только допущенные участники', 'В приватном нет хешей', 'Публичный не поддерживает смарт-контракты'], correct: 1, why: 'Ключевое различие — открытость доступа к сети, механика блоков одинаковая.' },
];

/** Ключ сегодняшнего дня; вызывать в обработчиках/эффектах (SSR-safe). */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// FNV-1a от строки даты — seed для перемешивания.
export function hashDate(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i += 1) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Детерминированный выбор DAILY_SIZE вопросов по дате: seeded Fisher–Yates. */
export function pickDaily(dateKey: string, bank: Question[] = DAILY_BANK): Question[] {
  let s = hashDate(dateKey);
  const rand = () => {
    // mulberry32
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = bank.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, DAILY_SIZE).map((i) => bank[i]);
}

/** Огонёк серии: 1+ 🔥, 3+ 🔥🔥, 7+ 🔥🔥🔥. */
export function streakFire(streak: number): string {
  if (streak >= 7) return '🔥🔥🔥';
  if (streak >= 3) return '🔥🔥';
  if (streak >= 1) return '🔥';
  return '';
}

export default function DailyChallenge() {
  useSyncExternalStore(store.subscribe, store.getVersion, () => 0);
  // Дата появляется только после маунта: на SSR и при гидрации рендерится
  // пустая плашка, поэтому серверная и клиентская разметка совпадают.
  const [today, setToday] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    setToday(todayKey());
  }, []);

  const questions = today ? pickDaily(today) : [];
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(
    ([qi, oi]) => oi === questions[Number(qi)]?.correct,
  ).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  useEffect(() => {
    if (!allAnswered) return;
    const key = todayKey();
    if (store.completeDaily(key, { correct: correctCount, total: questions.length })) {
      if (correctCount > 0) store.addXp(correctCount * DAILY_XP_PER_CORRECT, `daily:${key}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allAnswered]);

  if (!today) return <div className="dc" aria-hidden="true" />;

  const ds = store.dailyState(today);
  const fire = streakFire(ds.streak);

  return (
    <div className="dc">
      <div className="dc-plaque">
        <span className="dc-streak">
          {fire ? <span className="dc-fire">{fire}</span> : null} Серия: {ds.streak}{' '}
          {ds.streak === 1 ? 'день' : ds.streak >= 2 && ds.streak <= 4 ? 'дня' : 'дней'}
        </span>
        {ds.done ? (
          <span className="dc-done">
            Вызов дня пройден: {ds.today?.correct} из {ds.today?.total} — возвращайся завтра
          </span>
        ) : (
          <button type="button" className="button button--primary" onClick={() => setOpen((v) => !v)}>
            Вызов дня
          </button>
        )}
      </div>

      {/* allAnswered оставляет квиз на экране после записи дня — чтобы итог не исчез из-под курсора */}
      {open && (!ds.done || allAnswered) ? (
        <div className="dc-quiz">
          <div className="dc-intro">
            5 вопросов по пройденным темам. Ответ засчитывается с первой попытки — подумай, прежде чем жать.
          </div>
          {questions.map((item, qi) => {
            const picked = answers[qi];
            const solved = picked === item.correct;
            return (
              <div className="dc-question" key={qi}>
                <div className="dc-q">{item.q}</div>
                <div className="dc-options">
                  {item.options.map((opt, oi) => {
                    const isPicked = picked === oi;
                    const cls = isPicked ? (solved ? 'dc-right' : 'dc-wrong') : '';
                    return (
                      <button
                        key={oi}
                        type="button"
                        className={`dc-option ${cls}`.trim()}
                        disabled={picked !== undefined}
                        onClick={() =>
                          setAnswers((a) => (a[qi] !== undefined ? a : { ...a, [qi]: oi }))
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {picked !== undefined ? (
                  <div className={`dc-feedback ${solved ? 'dc-ok' : 'dc-no'}`}>
                    {solved ? 'Верно!' : `Неверно. Правильный ответ: ${item.options[item.correct]}.`}
                    {item.why ? <span className="dc-why"> {item.why}</span> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
          {allAnswered ? (
            <div className="dc-result">
              Итог: {correctCount} из {questions.length}
              {correctCount > 0 ? ` · +${correctCount * DAILY_XP_PER_CORRECT} XP` : ''}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
