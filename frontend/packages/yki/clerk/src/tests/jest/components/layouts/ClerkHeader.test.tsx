import { render } from '@testing-library/react';

import { ClerkHeader } from 'components/layouts/clerkHeader/ClerkHeader';
import { CasAuthenticatedClerkSession } from 'interfaces/session';
import { acceptSession } from 'redux/reducers/session';
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
    const { container } = render(
      <DefaultProviders store={store}>
        <ClerkHeader />
      </DefaultProviders>,
    );
    expect(container).toMatchSnapshot();
  });
});
