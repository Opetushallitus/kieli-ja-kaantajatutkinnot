import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import renderer from 'react-test-renderer';

import { AppLanguage } from '../../enums';
import { LangSelector } from './LangSelector';

describe('LangSelector', () => {
  it('should render LangSelector correctly', () => {
    const { getCurrentLang, langDict, changeLang } = createLangSelectorMocks();
    const tree = renderer
      .create(
        <LangSelector
          langDict={langDict}
          changeLang={changeLang}
          langSelectorAriaLabel="aria-label"
          getCurrentLang={getCurrentLang}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should show the Finnish language as a default language', () => {
    const { getCurrentLang, langDict, changeLang } = createLangSelectorMocks();

    render(
      <LangSelector
        langDict={langDict}
        changeLang={changeLang}
        langSelectorAriaLabel="aria-label"
        getCurrentLang={getCurrentLang}
      />
    );

    expect(screen.getByText('lang.fi')).toBeInTheDocument();
  });

  it('should show a list of all available languages', async () => {
    const { getCurrentLang, langDict, changeLang } = createLangSelectorMocks();

    render(
      <LangSelector
        langDict={langDict}
        changeLang={changeLang}
        langSelectorAriaLabel="aria-label"
        getCurrentLang={getCurrentLang}
      />
    );

    userEvent.click(screen.getByRole('button', { name: /lang.fi/i }));
    expect(await screen.findAllByRole('option')).toHaveLength(3);
  });

  // Helper
  const createLangSelectorMocks = () => {
    const getCurrentLang = jest.fn();
    const changeLang = jest.fn();
    const langDict = new Map<string, AppLanguage>([
      ['lang.fi', AppLanguage.Finnish],
      ['lang.sv', AppLanguage.Swedish],
      ['lang.en', AppLanguage.English],
    ]);

    getCurrentLang.mockReturnValue(AppLanguage.Finnish);

    return { getCurrentLang, langDict, changeLang };
  };
});
