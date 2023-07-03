import { Tab, Tabs } from '@mui/material';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';
import { Color } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes, HeaderTabNav } from 'enums/app';

const getTabForPath = (path: string) => {
  if (
    path === AppRoutes.Registration ||
    matchPath(AppRoutes.ExamSession, path) ||
    matchPath(AppRoutes.ExamSessionRegistration, path)
  ) {
    return HeaderTabNav.Registration;
  } else if (
    path === AppRoutes.Reassessment ||
    matchPath(AppRoutes.ReassessmentOrder, path)
  ) {
    return HeaderTabNav.Reassessment;
  } else {
    return false;
  }
};

export const PublicNavTabs = (): JSX.Element => {
  const translateCommon = useCommonTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Tabs
      value={getTabForPath(pathname)}
      textColor={Color.Secondary}
      indicatorColor={Color.Secondary}
    >
      <Tab
        data-testid={'public-nav-tab__registration'}
        value={HeaderTabNav.Registration}
        label={translateCommon(HeaderTabNav.Registration)}
        onClick={() => navigate(AppRoutes.Registration)}
      />
      <Tab
        data-testid={'public-nav-tab__reassessment'}
        value={HeaderTabNav.Reassessment}
        label={translateCommon(HeaderTabNav.Reassessment)}
        onClick={() => navigate(AppRoutes.Reassessment)}
      />
    </Tabs>
  );
};
