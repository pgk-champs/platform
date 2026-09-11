import { render, screen } from '@testing-library/react';
import { hardhatDeploySchemes } from './hardhatDeploy';

test('every hardhatDeploy scheme renders an accessible svg', () => {
  expect(Object.keys(hardhatDeploySchemes)).toEqual(['hd-deploy-tx', 'hd-script-vs-ignition', 'hd-four-refusals']);
  for (const id of Object.keys(hardhatDeploySchemes)) {
    const { unmount } = render(<>{hardhatDeploySchemes[id](`схема ${id}`)}</>);
    expect(screen.getByRole('img', { name: `схема ${id}` })).toBeTruthy();
    unmount();
  }
});

test('схемы несут осмысленный текст, а не только рамку', () => {
  const expectedLabels: Record<string, string[]> = {
    'hd-deploy-tx': ['адрес не случайный: он считается из адреса отправителя и номера его транзакции', 'значит, адрес будущего контракта можно узнать до того, как он появится'],
    'hd-script-vs-ignition': ['одиночный контракт удобнее скриптом; связку из нескольких — описанием', 'файл с адресами лежит рядом и читается следующими скриптами: адрес больше не переписывают руками'],
    'hd-four-refusals': ['все четыре — про сеть, а не про контракт: код при этом верен и собирается'],
  };
  for (const [id, labels] of Object.entries(expectedLabels)) {
    const { container, unmount } = render(<>{hardhatDeploySchemes[id](`схема ${id}`)}</>);
    for (const label of labels) expect(container.textContent).toContain(label);
    unmount();
  }
});
