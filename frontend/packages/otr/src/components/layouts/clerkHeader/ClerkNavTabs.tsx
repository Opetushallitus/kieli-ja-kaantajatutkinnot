import { Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes, HeaderTabNav } from 'enums/app';

export const ClerkNavTabs = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.header.clerk.navLinks',
  });
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [selectedTab, setSelectedTab] = useState<HeaderTabNav | boolean>(false);

  const handleChange = ({}, newTab: HeaderTabNav) => {
    setSelectedTab(newTab);
  };

  useEffect(() => {
    if (pathname === AppRoutes.ClerkHomePage) {
      setSelectedTab(HeaderTabNav.Register);
    } else if (pathname === AppRoutes.MeetingDatesPage) {
      setSelectedTab(HeaderTabNav.MeetingDates);
    } else setSelectedTab(false);
  }, [pathname]);

  return (
    <Tabs
      value={selectedTab}
      onChange={handleChange}
      textColor={Color.Secondary}
      indicatorColor={Color.Secondary}
      aria-label={t('tabsLabel')}
    >
      <Tab
        data-testid={'clerk-nav-tab__register'}
        value={HeaderTabNav.Register}
        label={translateCommon(HeaderTabNav.Register)}
        onClick={() => navigate(AppRoutes.ClerkHomePage)}
      />
      <Tab
        data-testid={'clerk-nav-tab__meeting-dates'}
        value={HeaderTabNav.MeetingDates}
        label={translateCommon(HeaderTabNav.MeetingDates)}
        onClick={() => navigate(AppRoutes.MeetingDatesPage)}
      />
    </Tabs>
  );
};
