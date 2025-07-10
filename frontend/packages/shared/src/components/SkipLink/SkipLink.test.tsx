import { render } from '@testing-library/react';

import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('should render correctly', () => {
    const { container } = render(
      <SkipLink
        text="Link that looks like text"
        href="http://example.invalid"
      />,
    );

    expect(container).toMatchSnapshot();
  });
});
