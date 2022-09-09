import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { CookieBanner } from './CookieBanner';

describe('CookieBanner', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <BrowserRouter>
          <CookieBanner title="Test" buttonText="Ok" cookieTag="test">
            Testi Keksi
          </CookieBanner>
        </BrowserRouter>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
