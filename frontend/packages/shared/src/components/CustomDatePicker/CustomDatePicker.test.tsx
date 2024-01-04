import dayjs from 'dayjs';
import renderer from 'react-test-renderer';

import { CustomDatePicker } from './CustomDatePicker';

describe('DatePicker', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <CustomDatePicker
          label="test label"
          value={dayjs('2022-04-21')}
          setValue={jest.fn()}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
