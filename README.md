# pgk-champs/platform

Учебная платформа pgk-champs: сайт на Docusaurus с главами по трекам (мобилка,
блокчейн) — конспекты, интерактивные тренажёры, Kotlin-песочница прямо в браузере.

Живая версия: https://pgk-champs.github.io/platform/

## Команды

```bash
npm ci          # установка зависимостей (чистая, из package-lock.json)
npm test        # тесты scripts/*.test.mjs (в т.ч. knowledge-map)
npm run test:ui # тесты компонентов (vitest + jsdom)
npm run kmap    # пересобрать src/data/knowledge-map.json из docs/**
npm run build   # прод-сборка (сама вызывает kmap через prebuild)
npm run start   # локальный дев-сервер с горячей перезагрузкой
```

## Деплой

Автоматом через GitHub Actions (`.github/workflows/deploy.yml`) при каждом
пуше в `main`: сборка гоняет `npm test`, `npm run test:ui` и `npm run build`,
и только если всё зелёное — публикует на GitHub Pages.

`npm run deploy` (docusaurus deploy) **не используется** — раздача вручную
через него разойдётся с тем, что видит CI.

## Фронтматтер-контракт главы

Каждый файл в `docs/**` (кроме `index.md`) обязан иметь во фронтматтере:

| поле       | значения                                 |
|------------|-------------------------------------------|
| `title`    | любая строка                               |
| `audience` | `все` \| `мобилка` \| `блокчейн`           |
| `level`    | `база` \| `углубление` \| `челлендж`       |
| `order`    | число (порядок внутри трека/уровня)        |

`npm run kmap` (и, соответственно, `npm run build`) падает с ошибкой, если у
главы нет одного из полей или значение `audience`/`level` не входит в список
выше — так что без меток собраться просто не выйдет.

Мини-пример:

```md
---
title: Переменные и типы
audience: мобилка
level: база
order: 1
---

# Переменные и типы
...
```

## Как добавить главу

1. Создай `.md`/`.mdx` в нужной папке `docs/<трек>/` с фронтматтером выше.
   Смотри `docs/mobile/01-kotlin-vars.mdx` как образец — там же пример
   встроенной Kotlin-песочницы (`<KotlinPlay code={...} />`).
2. Прогони `npm run kmap && npm run test:ui && npm run build` локально.
3. Открой PR в `main` — CI пересоберёт карту знаний и прогонит тесты сам.

## Смежные репозитории

- [track-mobile-01-kotlin-basics](https://github.com/pgk-champs/track-mobile-01-kotlin-basics) —
  шаблон практикума (основы Kotlin), из которого студентам создаются приватные
  копии. Требует JDK 21, проверка через GitHub Actions внутри шаблона.
- [track-mobile-02-collections](https://github.com/pgk-champs/track-mobile-02-collections) —
  второй шаблон практикума (коллекции), тот же формат и та же проверка.
- [ide-course](https://github.com/pgk-champs/ide-course) — курс в формате
  JetBrains Academy: те же темы, что в главах `docs/mobile/01-03`, но задачами
  с автопроверкой прямо в IDE (плагин JetBrains Academy → Get from VCS).
- [leaderboard](https://github.com/pgk-champs/leaderboard) — **приватный**:
  приём результатов симулятора (`ChampSimulator` открывает там issue по
  шаблону `result.yml`) и заявок в каталог сообщества (`submit-content.yml`).
  Студенту доступ выдаёт наставник, см. `ops/provision.sh`.
- [community](https://github.com/pgk-champs/community) — публичный каталог
  материалов от студентов: страница `/community` и блок «Видео и источники»
  в главах читают из него `community.json` напрямую.
- [ops](https://github.com/pgk-champs/ops) — провижининг и очистка
  студенческих репозиториев в организации.
