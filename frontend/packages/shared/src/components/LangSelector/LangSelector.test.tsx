import { render, screen } from '@testing-library/react';

import { LangSelector } from './LangSelector';
import { AppLanguage } from '../../enums';

describe('LangSelector', () => {
  it('should render LangSelector correctly', () => {
    const { getCurrentLang, langDict, changeLang } = createLangSelectorMocks();
    const { container } = render(
      <LangSelector
        langDict={langDict}
        changeLang={changeLang}
        langSelectorAriaLabel="aria-label"
        getCurrentLang={getCurrentLang}
      />,
    );

    expect(container).toMatchSnapshot();
  });

  it('should show the Finnish language as a default language', () => {
    const { getCurrentLang, langDict, changeLang } = createLangSelectorMocks();

    render(
      <LangSelector
        langDict={langDict}
        changeLang={changeLang}
        langSelectorAriaLabel="aria-label"
        getCurrentLang={getCurrentLang}
      />,
    );

    expect(screen.getByText('lang.fi')).toBeInTheDocument();
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
