import { render } from '@testing-library/react';
import dayjs from 'dayjs';

import { CustomDatePicker } from './CustomDatePicker';

describe('DatePicker', () => {
  it('should render correctly', () => {
    const { container } = render(
      <CustomDatePicker
        label="test label"
        value={dayjs('2022-04-21')}
        setValue={jest.fn()}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
