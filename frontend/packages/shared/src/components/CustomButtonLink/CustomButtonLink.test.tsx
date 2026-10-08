import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { CustomButtonLink } from './CustomButtonLink';

describe('CustomButtonLink', () => {
  it('should render correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <CustomButtonLink to="/" />
      </BrowserRouter>,
    );

    expect(container).toMatchSnapshot();
  });
});
