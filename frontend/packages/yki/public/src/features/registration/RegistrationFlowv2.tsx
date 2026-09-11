import { useState } from 'react';
import { Provider } from 'react-redux';
import { Outlet } from 'react-router';

import { setupStore } from 'features/registration/redux/store/indexv2';

// A separate store lets the original and copied registration flows coexist.
export const RegistrationFlow = () => {
  const [store] = useState(setupStore);

  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  );
};
