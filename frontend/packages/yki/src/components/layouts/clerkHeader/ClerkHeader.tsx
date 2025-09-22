import { AppBar, Toolbar } from '@mui/material';

import { ClerkNavigationLinks } from 'components/layouts/clerkHeader/ClerkNavigationLinks';

export const ClerkHeader = () => {
  return (
    <AppBar className="header" position="static">
      <Toolbar className="header__toolbar">
        <div className="header__tabs">
          <ClerkNavigationLinks />
        </div>
      </Toolbar>
    </AppBar>
  );
};
