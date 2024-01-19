import renderer from 'react-test-renderer';

import { CustomSwitch } from './CustomSwitch';

describe('CustomSwitch', () => {
  it('should render correctly with an error label', () => {
    const tree = renderer
      .create(
        <CustomSwitch
          dataTestId="just-a-test-id"
          leftLabel="leftLabel"
          rightLabel="rightLabel"
          errorLabel="test-error-label"
          value={true}
          disabled={true}
        ></CustomSwitch>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render correctly with just the minimal props', () => {
    const tree = renderer
      .create(
        <CustomSwitch
          leftLabel="anotherLeftLabel"
          rightLabel="anotherRightLabel"
        />,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
