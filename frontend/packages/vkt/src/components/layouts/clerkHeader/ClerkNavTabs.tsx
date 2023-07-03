import { Tab, Tabs } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useClerkTranslation } from 'configs/i18n';
import { AppRoutes, HeaderNavTab } from 'enums/app';

const getTabForPath = (path: string) => {
  if (path === AppRoutes.ClerkHomePage) {
    return HeaderNavTab.ExamEvents;
  } else {
    return false;
  }
};

export const ClerkNavTabs = (): JSX.Element => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navTabs',
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Tabs
      value={getTabForPath(pathname)}
      textColor={Color.Secondary}
      indicatorColor={Color.Secondary}
    >
      <Tab
        data-testid={'clerk-nav-tab__examEvents'}
        value={HeaderNavTab.ExamEvents}
        label={t(HeaderNavTab.ExamEvents)}
        onClick={() => navigate(AppRoutes.ClerkHomePage)}
      />
    </Tabs>
  );
};
