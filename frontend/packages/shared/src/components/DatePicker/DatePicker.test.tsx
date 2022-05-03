import renderer from 'react-test-renderer';

import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <DatePicker
          label="test label"
          value="2022-04-21"
          setValue={jest.fn()}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
