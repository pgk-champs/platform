import React from 'react';
import './trainers.css';

export default function ToolCard({ name, url, desc }: { name: string; url: string; desc: string }) {
  return (
    <a className="tc" href={url} target="_blank" rel="noreferrer noopener">
      <div className="tc-name">{name}</div>
      <div className="tc-desc">{desc}</div>
    </a>
  );
}
