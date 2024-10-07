import { matchPath, useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes, HeaderTabNav } from 'enums/app';

const getTabForPath = (path: string) => {
  if (
    path === AppRoutes.Registration ||
    matchPath(AppRoutes.ExamSession, path) ||
    matchPath(AppRoutes.ExamSessionRegistration, path) ||
    matchPath(AppRoutes.RegistrationPaymentStatus, path)
  ) {
    return HeaderTabNav.Registration;
  } else if (
    path === AppRoutes.Reassessment ||
    matchPath(AppRoutes.ReassessmentOrder, path) ||
    matchPath(AppRoutes.ReassessmentOrderStatus, path)
  ) {
    return HeaderTabNav.Reassessment;
  } else {
    return false;
  }
};

export const PublicNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={[
        {
          active: getTabForPath(pathname) === HeaderTabNav.Registration,
          href: AppRoutes.Registration,
          label: translateCommon(HeaderTabNav.Registration),
        },
        {
          active: getTabForPath(pathname) === HeaderTabNav.Reassessment,
          href: AppRoutes.Reassessment,
          label: translateCommon(HeaderTabNav.Reassessment),
        },
      ]}
    />
  );
};
