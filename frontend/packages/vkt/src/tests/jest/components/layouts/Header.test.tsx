import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { Header } from 'components/layouts/Header';

describe('Header', () => {
  it('should render Header correctly', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <Header />
        </BrowserRouter>,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
