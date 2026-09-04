import React, { useEffect, useRef } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { coreSchemes } from './figures/core';
import { foundationSchemes } from './figures/foundation';
import { foundationBSchemes } from './figures/foundationB';
import { advancedSchemes } from './figures/advanced';
import { mobileSchemes } from './figures/mobile';
import { blockchainSchemes } from './figures/blockchain';
import { repoAnatomySchemes } from './figures/repoAnatomy';
import { ciSchemes } from './figures/ci';
import { reviewSchemes } from './figures/review';
import { finalSchemes } from './figures/final';
import { editorSchemes } from './figures/editor';
import { codeBasicsSchemes } from './figures/codeBasics';
import { oopSchemes } from './figures/oop';
import { kotlinJavaSchemes } from './figures/kotlinJava';
import { tsJsSchemes } from './figures/tsJs';
import './trainers.css';

/* Иллюстрация с подписью. Сами схемы живут в figures/ по трекам — так над
 * картинками разных глав можно работать параллельно, не толкаясь в одном файле. */

const SCHEMES = {
  ...coreSchemes,
  ...foundationSchemes,
  ...foundationBSchemes,
  ...advancedSchemes,
  ...mobileSchemes,
  ...blockchainSchemes,
  ...repoAnatomySchemes,
  ...ciSchemes,
  ...reviewSchemes,
  ...finalSchemes,
  ...editorSchemes,
  ...codeBasicsSchemes,
  ...oopSchemes,
  ...kotlinJavaSchemes,
  ...tsJsSchemes,
};

export const SCHEME_IDS = Object.keys(SCHEMES);

export default function Figure({
  scheme, img, alt, caption, source, children,
}: {
  /** id встроенной SVG-схемы (стиль обложек) */
  scheme?: string;
  /** путь к картинке в static, например /img/photos/typing.jpg */
  img?: string;
  alt?: string;
  caption: string;
  /** источник/лицензия для фото */
  source?: string;
  children?: React.ReactNode;
}) {
  const imgUrl = useBaseUrl(img ?? '/');
  const ref = useRef<HTMLElement | null>(null);

  // Появление иллюстрации при подходе к ней. Класс вешает JS, поэтому без
  // скриптов и при отключённой анимации картинка просто видна сразу —
  // прятать её css-ом «на всякий случай» нельзя, это скроет контент.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    el.classList.add('fig-hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('fig-shown');
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="fig" ref={ref}>
      <div className="fig-media">
        {scheme && SCHEMES[scheme] ? SCHEMES[scheme](caption) : null}
        {img ? <img src={imgUrl} alt={alt ?? caption} loading="lazy" /> : null}
        {children}
      </div>
      <figcaption className="fig-caption">
        {caption}
        {source ? <span className="fig-source">{source}</span> : null}
      </figcaption>
    </figure>
  );
}
