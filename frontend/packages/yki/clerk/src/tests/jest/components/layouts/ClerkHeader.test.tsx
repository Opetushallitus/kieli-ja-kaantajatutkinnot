import { render } from '@testing-library/react';

import { ClerkHeader } from 'components/layouts/clerkHeader/ClerkHeader';
import { CasAuthenticatedClerkSession } from 'interfaces/session';
import { acceptSession } from 'redux/reducers/session';
import { acceptUser } from 'redux/reducers/user';
import { setupStore } from 'redux/store';
import { DefaultProviders } from 'tests/jest/utils/DefaultProviders';

describe('ClerkHeader', () => {
  it('should render ClerkHeader correctly', () => {
    const casAuthenticatedUser: CasAuthenticatedClerkSession = {
      identity: {
        username: 'testuser',
      },
      'auth-method': 'CAS',
    };

    const store = setupStore();
    store.dispatch(acceptSession(casAuthenticatedUser));
    store.dispatch(
      acceptUser({
        oid: '1.2.246.562.24.98107285507',
        isAdmin: true,
        isOrganizer: true,
      }),
    );
    const { container } = render(
      <DefaultProviders store={store}>
        <ClerkHeader />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
