import { render, screen } from '@testing-library/react';
import Figure, { SCHEME_IDS } from './Figure';
import { coreSchemes } from './figures/core';
import { foundationSchemes } from './figures/foundation';
import { foundationBSchemes } from './figures/foundationB';
import { mobileSchemes } from './figures/mobile';
import { blockchainSchemes } from './figures/blockchain';
import { advancedSchemes } from './figures/advanced';
import { repoAnatomySchemes } from './figures/repoAnatomy';
import { ciSchemes } from './figures/ci';
import { reviewSchemes } from './figures/review';
import { finalSchemes } from './figures/final';
import { editorSchemes } from './figures/editor';
import { codeBasicsSchemes } from './figures/codeBasics';
import { oopSchemes } from './figures/oop';
import { kotlinJavaSchemes } from './figures/kotlinJava';
import { kotlinFlowSchemes } from './figures/kotlinFlow';
import { kotlinOopSchemes } from './figures/kotlinOop';
import { kotlinHistorySchemes } from './figures/kotlinHistory';
import { kotlinCoroutinesSchemes } from './figures/kotlinCoroutines';
import { flowStreamsSchemes } from './figures/flowStreams';
import { lazyListsSchemes } from './figures/lazyLists';
import { materialThemeSchemes } from './figures/materialTheme';
import { scaffoldBarsSchemes } from './figures/scaffoldBars';
import { viewModelStateSchemes } from './figures/viewModelState';
import { appLayersSchemes } from './figures/appLayers';
import { networkLayerSchemes } from './figures/networkLayer';
import { kotlinNullSchemes } from './figures/kotlinNull';
import { tsJsSchemes } from './figures/tsJs';
import { tsValuesSchemes } from './figures/tsValues';
import { tsFlowSchemes } from './figures/tsFlow';
import { tsFunctionsSchemes } from './figures/tsFunctions';
import { tsCollectionsSchemes } from './figures/tsCollections';
import { tsOopSchemes } from './figures/tsOop';
import { tsHistorySchemes } from './figures/tsHistory';
import { tsAsyncSchemes } from './figures/tsAsync';

// jsdom не считает реальный layout (getBBox недоступен), поэтому ширина
// текста здесь — оценка с запасом, откалиброванная по трём случаям
// обрезания, пойманным живым браузером (getBBox): ~0.51 px на символ на
// единицу fontSize, здесь взято 0.55 — с запасом, чтобы не пропустить.
const centeredTextOverflow = (text: string, x: number, fontSize: number, viewBoxWidth: number) => {
  const half = (text.length * fontSize * 0.55) / 2;
  return Math.max(0, half - x) + Math.max(0, x + half - viewBoxWidth);
};

test('renders caption and source line', () => {
  render(
    <Figure
      scheme="git-three-zones"
      caption="Три зоны Git"
      source="Фото: Pexels — свободная лицензия"
    />,
  );
  expect(screen.getByText(/Три зоны Git/)).toBeTruthy();
  expect(screen.getByText('Фото: Pexels — свободная лицензия')).toBeTruthy();
});

test('каждая схема рисует svg, доступное имя которого — подпись', () => {
  expect(SCHEME_IDS.length).toBeGreaterThan(0);
  for (const id of SCHEME_IDS) {
    const { unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('имена схем не повторяются между модулями треков', () => {
  // Модули пишутся параллельно; одинаковый id молча затирал бы чужую схему.
  const all = [
    ...Object.keys(coreSchemes),
    ...Object.keys(foundationSchemes),
    ...Object.keys(foundationBSchemes),
    ...Object.keys(mobileSchemes),
    ...Object.keys(blockchainSchemes),
    ...Object.keys(advancedSchemes),
    ...Object.keys(repoAnatomySchemes),
    ...Object.keys(ciSchemes),
    ...Object.keys(reviewSchemes),
    ...Object.keys(finalSchemes),
    ...Object.keys(editorSchemes),
    ...Object.keys(codeBasicsSchemes),
    ...Object.keys(oopSchemes),
    ...Object.keys(kotlinJavaSchemes),
    ...Object.keys(kotlinFlowSchemes),
    ...Object.keys(kotlinOopSchemes),
    ...Object.keys(kotlinHistorySchemes),
    ...Object.keys(kotlinCoroutinesSchemes),
    ...Object.keys(flowStreamsSchemes),
    ...Object.keys(lazyListsSchemes),
    ...Object.keys(materialThemeSchemes),
    ...Object.keys(scaffoldBarsSchemes),
    ...Object.keys(viewModelStateSchemes),
    ...Object.keys(appLayersSchemes),
    ...Object.keys(networkLayerSchemes),
    ...Object.keys(kotlinNullSchemes),
    ...Object.keys(tsJsSchemes),
    ...Object.keys(tsValuesSchemes),
    ...Object.keys(tsFlowSchemes),
    ...Object.keys(tsFunctionsSchemes),
    ...Object.keys(tsCollectionsSchemes),
    ...Object.keys(tsOopSchemes),
    ...Object.keys(tsHistorySchemes),
    ...Object.keys(tsAsyncSchemes),
  ];
  const duplicates = all.filter((id, i) => all.indexOf(id) !== i);
  expect(duplicates).toEqual([]);
  expect(SCHEME_IDS.length).toBe(all.length);
});

test('новые схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'branch-tree': ['master', 'feature'],
    'rwx-bits': ['Владелец', 'Группа', 'Остальные'],
    'memory-boxes': ['val x', 'var y'],
    'lambda-box': ['square(x)', 'x -> x * x'],
    'collections-shelf': ['List', 'Map', 'Set'],
    'state-flow': ['Event', 'State', 'Recomposition'],
    'error-anatomy': ['источник', 'виновник', 'суть'],
    'android-studio-panels': ['Project', 'Редактор', 'Gradle', 'Terminal', 'Logcat'],
    'compose-preview': ['GreetingPreview', '@Preview'],
    'dp-vs-sp': ['16.dp', '16.sp'],
    'aar-vs-jar': ['.aar', '.jar'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    for (const label of labels) {
      expect(container.textContent).toContain(label);
    }
    unmount();
  }
});

test('collections-shelf и compose-preview: центрированные подписи умещаются в viewBox (было 810px и 879px при ширине 800)', () => {
  for (const id of ['collections-shelf', 'compose-preview']) {
    const { container, unmount } = render(<Figure scheme={id} caption={`схема ${id}`} />);
    const svg = container.querySelector('svg')!;
    const viewBoxWidth = Number(svg.getAttribute('viewBox')!.split(' ')[2]);
    const texts = [...container.querySelectorAll('text[text-anchor="middle"]')];
    expect(texts.length).toBeGreaterThan(0);
    for (const t of texts) {
      const overflow = centeredTextOverflow(
        t.textContent || '',
        Number(t.getAttribute('x')),
        Number(t.getAttribute('font-size')),
        viewBoxWidth,
      );
      expect(overflow).toBe(0);
    }
    unmount();
  }
});

test('renders a photo with alt and lazy loading', () => {
  render(
    <Figure
      img="/img/photos/typing-keyboard.jpg"
      alt="Руки на клавиатуре"
      caption="Слепая печать"
    />,
  );
  const img = screen.getByAltText('Руки на клавиатуре') as HTMLImageElement;
  expect(img.getAttribute('src')).toBe('/img/photos/typing-keyboard.jpg');
  expect(img.getAttribute('loading')).toBe('lazy');
});

test('unknown scheme renders nothing but keeps the caption', () => {
  const { container } = render(<Figure scheme="nope" caption="подпись" />);
  expect(container.querySelector('.fig-media svg')).toBeNull();
  expect(screen.getByText('подпись')).toBeTruthy();
});
