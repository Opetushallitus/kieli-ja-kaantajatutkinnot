import { render } from '@testing-library/react';

import { ExtLink } from './ExtLink';

describe('ExtLink', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ExtLink text="Test link" href="https://someothersite.com" />,
    );
    expect(container).toMatchSnapshot();
  });
});
