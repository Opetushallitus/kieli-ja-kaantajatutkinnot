import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { Header } from 'components/layouts/Header';

describe('Header', () => {
  it('should render Header correctly', () => {
    const { container } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );

    expect(container).toMatchSnapshot();
  });
});
