import { render } from '@testing-library/react';

import { CustomTextField } from './CustomTextField';

describe('CustomTextField', () => {
  it('should render correctly with text', () => {
    const { container } = render(
      <CustomTextField label="test label" value="test value" />,
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with error', () => {
    const { container } = render(
      <CustomTextField
        label="test label"
        value="wrong test value"
        error={true}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
