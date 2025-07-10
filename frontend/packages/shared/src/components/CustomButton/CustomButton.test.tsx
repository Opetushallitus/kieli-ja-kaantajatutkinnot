import { render } from '@testing-library/react';

import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('should render correctly', () => {
    const { container } = render(<CustomButton />);
    expect(container).toMatchSnapshot();
  });
});
