import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { Footer } from 'components/layouts/Footer';

describe('Footer', () => {
  it('should render Footer correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>,
    );

    expect(container).toMatchSnapshot();
  });
});
