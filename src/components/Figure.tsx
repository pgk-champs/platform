import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { coreSchemes } from './figures/core';
import { foundationSchemes } from './figures/foundation';
import { mobileSchemes } from './figures/mobile';
import { blockchainSchemes } from './figures/blockchain';
import './trainers.css';

/* Иллюстрация с подписью. Сами схемы живут в figures/ по трекам — так над
 * картинками разных глав можно работать параллельно, не толкаясь в одном файле. */

const SCHEMES = {
  ...coreSchemes,
  ...foundationSchemes,
  ...mobileSchemes,
  ...blockchainSchemes,
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
  return (
    <figure className="fig">
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
