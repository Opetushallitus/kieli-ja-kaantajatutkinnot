import renderer from 'react-test-renderer';

import { LanguageSelect } from 'components/elements/LanguageSelect';
import { TextFieldVariant } from 'enums/app';

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
          excludedLanguage="BN"
          translateLanguage={jest.fn((l: string) => l)}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
