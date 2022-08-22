import renderer from 'react-test-renderer';

import { TextFieldVariant } from '../../enums/common';
import { ComboBox } from './ComboBox';

describe('ComboBox', () => {
  it('should render ComboBox correctly', () => {
    const values = [
      { value: 'BN', label: 'bengali' },
      { value: 'FI', label: 'suomi' },
      { value: 'SV', label: 'ruotsi' },
    ];

    const tree = renderer
      .create(
        <ComboBox
          autoHighlight
          variant={TextFieldVariant.Outlined}
          values={values}
          value={null}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
