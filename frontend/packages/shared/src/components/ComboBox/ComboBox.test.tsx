import renderer from 'react-test-renderer';

import { ComboBox } from './ComboBox';
import { TextFieldVariant } from '../../enums';

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
          onChange={jest.fn()}
        />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
