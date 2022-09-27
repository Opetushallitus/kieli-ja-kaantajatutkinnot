import renderer from 'react-test-renderer';

import { TextFieldVariant } from '../../enums/common';
import { LanguageSelect } from './LanguageSelect';

describe('LanguageSelect', () => {
  it('should render correctly', () => {
    const languages = ['BN', 'FI', 'SV'];

    const tree = renderer
      .create(
        <LanguageSelect
          autoHighlight
          variant={TextFieldVariant.Outlined}
          languages={languages}
          value={null}
          excludedLanguage="FI"
          primaryLanguages={['SV']}
          translateLanguage={jest.fn((l: string) => l)}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
