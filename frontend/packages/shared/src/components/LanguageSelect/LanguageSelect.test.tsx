import { render } from '@testing-library/react';

import { LanguageSelect } from './LanguageSelect';
import { TextFieldVariant } from '../../enums/common';

describe('LanguageSelect', () => {
  it('should render correctly', () => {
    const languages = ['BN', 'FI', 'SV'];

    const { container } = render(
      <LanguageSelect
        autoHighlight
        variant={TextFieldVariant.Outlined}
        languages={languages}
        value={null}
        excludedLanguage="FI"
        primaryLanguages={['SV']}
        translateLanguage={jest.fn((l: string) => l)}
        onLanguageChange={jest.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
