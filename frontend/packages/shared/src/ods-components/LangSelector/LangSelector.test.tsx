import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LangSelector } from './LangSelector';
import { AppLanguage } from '../../enums';

it('marks the current language and supports keyboard language changes', async () => {
  const user = userEvent.setup();
  const changeLang = jest.fn();
  render(
    <OphThemeProvider variant="opintopolku" lang="fi">
      <LangSelector
        changeLang={changeLang}
        getCurrentLang={() => AppLanguage.Finnish}
        langDict={
          new Map([
            ['Suomeksi', AppLanguage.Finnish],
            ['På svenska', AppLanguage.Swedish],
            ['In English', AppLanguage.English],
          ])
        }
        langSelectorAriaLabel="Language"
      />
    </OphThemeProvider>,
  );
  expect(screen.getByRole('button', { name: 'Suomeksi' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await user.tab();
  await user.tab();
  expect(screen.getByRole('button', { name: 'På svenska' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(changeLang).toHaveBeenCalledWith(AppLanguage.Swedish);
});
