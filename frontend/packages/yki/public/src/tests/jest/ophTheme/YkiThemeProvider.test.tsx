import { Autocomplete, TextField } from '@mui/material';
import { act, render, screen } from '@testing-library/react';
import { changeLanguage } from 'i18next';

import { initI18nForTests } from 'configs/i18n';
import { YkiThemeProvider } from 'ophTheme/YkiThemeProvider';

jest.unmock('configs/i18n');

it('updates built-in dropdown messages when the page language changes', async () => {
  await initI18nForTests();
  await changeLanguage('fi-FI');
  render(
    <YkiThemeProvider>
      <Autocomplete
        open
        disablePortal
        options={[] as Array<string>}
        renderInput={(params) => <TextField {...params} label="Language" />}
      />
    </YkiThemeProvider>,
  );

  expect(screen.getByText('Ei valintoja')).toBeInTheDocument();
  await act(() => changeLanguage('sv-SE'));
  expect(screen.getByText('Inga alternativ')).toBeInTheDocument();
  await act(() => changeLanguage('en-GB'));
  expect(screen.getByText('No options')).toBeInTheDocument();
});
