import { render } from '@testing-library/react';

import { Header } from 'components/layouts/Header';
import { SuomiFiAuthenticatedSession } from 'interfaces/session';
import { acceptSession } from 'redux/reducers/session';
import { acceptUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

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
      open_registrations: [
        {
          exam_session_id: 1,
          expires_at: '2200-01-01',
        },
      ],
    };

    const store = setupStore();
    store.dispatch(acceptSession(suomiFiAuthenticatedUser));
    store.dispatch(acceptUserOpenRegistrations(openRegistrationsResponse));
    const { container } = render(
      <DefaultProviders store={store}>
        <Header />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
