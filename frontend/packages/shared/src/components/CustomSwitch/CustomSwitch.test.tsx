import { render } from '@testing-library/react';

import { CustomSwitch } from './CustomSwitch';

describe('CustomSwitch', () => {
  it('should render correctly with an error label', () => {
    const { container } = render(
      <CustomSwitch
        dataTestId="just-a-test-id"
        leftLabel="leftLabel"
        rightLabel="rightLabel"
        errorLabel="test-error-label"
        value={true}
        disabled={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with just the minimal props', () => {
    const { container } = render(
      <CustomSwitch
        leftLabel="anotherLeftLabel"
        rightLabel="anotherRightLabel"
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
