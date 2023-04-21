import { AppBar, Toolbar } from '@mui/material';
import { ReactNode } from 'react';

interface MobileAppBarProps {
  children: ReactNode;
}

export const MobileAppBar = ({ children }: MobileAppBarProps) => {
  return (
    <div className="mobile">
      <AppBar className="mobile-app-bar">
        <Toolbar className="mobile-app-bar__tool-bar">{children}</Toolbar>
      </AppBar>
    </div>
  );
};
