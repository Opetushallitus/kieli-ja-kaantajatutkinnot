import renderer from 'react-test-renderer';

import { CustomTextField } from './CustomTextField';

describe('CustomTextField', () => {
  it('should render correctly with text', () => {
    const tree = renderer
      .create(<CustomTextField label="test label" value="test value" />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const tree = renderer
      .create(
        <CustomTextField
          label="test label"
          value="wrong test value"
          error={true}
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
