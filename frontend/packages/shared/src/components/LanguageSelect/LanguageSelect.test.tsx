import renderer from 'react-test-renderer';

import { TextFieldVariant } from '../../enums/app';
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
          excludedLanguage="BN"
          translateLanguage={jest.fn((l: string) => l)}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
