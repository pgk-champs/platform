import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import SuggestEdit from '../../../components/SuggestEdit';
import Comments from '../../../components/Comments';
import ChapterSources from '../../../components/ChapterSources';

// Swizzle-safe обёртка футера главы: авто-блок «Видео и источники по теме»
// (пакет sources) + оригинальный футер (с «Редактировать страницу» от editUrl)
// + кнопка «Предложить правку» + комментарии giscus (пакет wiki-flow).
// Одно место вместо правки 19 mdx руками.
export default function FooterWrapper(props: Record<string, unknown>) {
  const { metadata } = useDoc();
  const brokenLinks = useBrokenLinks();
  // id документа 'foundation/typing' → chapterId 'typing' — тот же id, каким
  // глава называет себя в <ChapterCover chapterId=...> и knowledge-map.json.
  // Страницы без записей в каталоге (index и т.п.) блока не получают.
  const chapterId = metadata.id.split('/').pop() ?? metadata.id;
  // Якорь регистрируем через useBrokenLinks — тот же паблик-хук, которым
  // @theme/Heading регистрирует id заголовков (node_modules/@docusaurus/
  // theme-classic/src/theme/Heading). Без явного collectAnchor Docusaurus
  // не узнаёт про id из theme-компонентов (только из MDX-контента) и
  // предупреждает onBrokenAnchors на ссылку из «Куда дальше», хотя якорь
  // реальный и рабочий — честный фикс самого предупреждения, onBrokenAnchors
  // по сайту остаётся включённым как есть.
  brokenLinks.collectAnchor('community-sources');
  return (
    <>
      {/* Якорь для «видео и материалы сообщества — ниже» в конце статичного
          блока «Куда дальше» (цикл 5). Рендерится всегда, в том числе на
          сервере — ChapterSources сама секция клиентская (пусто до fetch),
          и без этого якоря Docusaurus считает ссылку на неё битой. */}
      <span id="community-sources" />
      <ChapterSources chapterId={chapterId} />
      <Footer {...props} />
      <div className="se-row">
        <SuggestEdit />
      </div>
      <Comments />
    </>
  );
}
