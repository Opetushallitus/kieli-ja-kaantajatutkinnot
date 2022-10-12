import { Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useClerkTranslation } from 'configs/i18n';
import { AppRoutes, HeaderNavTab } from 'enums/app';

export const ClerkNavTabs = (): JSX.Element => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navTabs',
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedTab, setSelectedTab] = useState<HeaderNavTab | boolean>(false);

  const handleChange = ({}, newTab: HeaderNavTab) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    if (pathname === AppRoutes.ClerkHomePage) {
      setSelectedTab(HeaderNavTab.ExamEvents);
    } else setSelectedTab(false);
  }, [pathname]);

  return (
    <Tabs
      value={selectedTab}
      onChange={handleChange}
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
