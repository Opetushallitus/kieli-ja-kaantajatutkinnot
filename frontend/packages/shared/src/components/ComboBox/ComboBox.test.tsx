import { render } from '@testing-library/react';

import { ComboBox } from './ComboBox';
import { TextFieldVariant } from '../../enums';

describe('ComboBox', () => {
  it('should render ComboBox correctly', () => {
    const values = [
      { value: 'BN', label: 'bengali' },
      { value: 'FI', label: 'suomi' },
      { value: 'SV', label: 'ruotsi' },
    ];

    const { container } = render(
      <ComboBox
        autoHighlight
        variant={TextFieldVariant.Outlined}
        values={values}
        value={null}
        onChange={jest.fn()}
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
