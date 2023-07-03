import { Tab, Tabs } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes, HeaderTabNav } from 'enums/app';

const getTabForPath = (path: string) => {
  if (path === AppRoutes.ClerkHomePage) {
    return HeaderTabNav.Register;
  } else if (path === AppRoutes.MeetingDatesPage) {
    return HeaderTabNav.MeetingDates;
  } else {
    return false;
  }
};

export const ClerkNavTabs = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.header.clerk.navLinks',
  });
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Tabs
      value={getTabForPath(pathname)}
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
