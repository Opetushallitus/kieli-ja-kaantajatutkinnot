import { Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes, Color, HeaderTabNav } from 'enums/app';

export const ClerkNavTabs = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.header.clerk.navLinks',
  });
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [value, setValue] = useState<HeaderTabNav | boolean>(false);

  const handleChange = ({}, newValue: HeaderTabNav) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (pathname === AppRoutes.ClerkHomePage) {
      setValue(HeaderTabNav.Register);
    } else if (pathname === AppRoutes.MeetingDatesPage) {
      setValue(HeaderTabNav.MeetingDates);
    } else setValue(false);
  }, [pathname]);

  return (
    <Tabs
      value={value}
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
