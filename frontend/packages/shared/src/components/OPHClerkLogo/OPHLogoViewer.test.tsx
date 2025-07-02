import { render } from '@testing-library/react';

import { OPHClerkLogo } from './OPHClerkLogo';

describe('OPHClerkLogo', () => {
  it('should render OPHClerkLogo correctly', () => {
    const { container } = render(
      <OPHClerkLogo mainLabel="MainLabel" subLabel="SubLabel" alt="ImgAlt" />,
    );

    expect(container).toMatchSnapshot();
  });
});
