import { AppBar, Toolbar } from '@mui/material';

import { ClerkNavigationLinks } from 'components/layouts/clerkHeader/ClerkNavigationLinks';

export const ClerkHeader = (): JSX.Element => {
  return (
    <>
      <AppBar className="clerk-header" position="static">
        <Toolbar className="clerk-header__toolbar">
          <div className="clerk-header__tabs">
            <ClerkNavigationLinks />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
