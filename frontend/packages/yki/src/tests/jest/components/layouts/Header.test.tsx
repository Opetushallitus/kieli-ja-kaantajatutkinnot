import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';

import { Header } from 'components/layouts/Header';
import { SuomiFiAuthenticatedSession } from 'interfaces/session';
import { acceptSession } from 'redux/reducers/session';
import { acceptUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { setupStore } from 'redux/store';

describe('Header', () => {
  it('should render Header correctly', () => {
    const suomiFiAuthenticatedUser: SuomiFiAuthenticatedSession = {
      identity: {
        first_name: 'Susanna',
        ssn: '020502E902X',
        last_name: 'Uusivälimerkki',
      },
      'auth-method': 'SUOMIFI',
    };
    const openRegistrationsResponse = {
      'open-registrations': [
        {
          exam_session_id: 1,
          expires_at: '2200-01-01',
        },
      ],
    };

    const store = setupStore();
    store.dispatch(acceptSession(suomiFiAuthenticatedUser));
    store.dispatch(acceptUserOpenRegistrations(openRegistrationsResponse));
    const tree = renderer
      .create(
        <Provider store={store}>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </Provider>
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
