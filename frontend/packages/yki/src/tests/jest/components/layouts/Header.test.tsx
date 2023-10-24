import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { Header } from 'components/layouts/Header';
import { setupStore } from 'redux/store';

describe('Header', () => {
  it('should render Header correctly', () => {
    const tree = renderer
      .create(
        <Provider store={setupStore()}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </Provider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
