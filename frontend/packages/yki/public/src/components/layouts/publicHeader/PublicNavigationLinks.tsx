import { matchPath, useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes, HeaderTabNav } from 'enums/app';
import { sessionSelector } from 'redux/selectors/session';

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
  } else if (
    path === AppRoutes.UserDetails ||
    path === AppRoutes.ModifyContactDetails ||
    matchPath(AppRoutes.ConfirmRegistration, path)
  ) {
    return HeaderTabNav.UserRegistrations;
  } else {
    return false;
  }
};

export const PublicNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const { loggedInSession } = useAppSelector(sessionSelector);

  const displayUserDetailsTab =
    loggedInSession &&
    loggedInSession['auth-method'] === 'SUOMIFI' &&
    !matchPath(AppRoutes.ExamSessionRegistration, pathname);

  const registrationTab = {
    active: getTabForPath(pathname) === HeaderTabNav.Registration,
    href: AppRoutes.Registration,
    label: translateCommon(HeaderTabNav.Registration),
  };

  const userRegistrationsTab = {
    active: getTabForPath(pathname) === HeaderTabNav.UserRegistrations,
    href: AppRoutes.UserDetails,
    label: translateCommon(HeaderTabNav.UserRegistrations),
  };

  const reassessmentTab = {
    active: getTabForPath(pathname) === HeaderTabNav.Reassessment,
    href: AppRoutes.Reassessment,
    label: translateCommon(HeaderTabNav.Reassessment),
  };

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={
        displayUserDetailsTab
          ? [registrationTab, userRegistrationsTab, reassessmentTab]
          : [registrationTab, reassessmentTab]
      }
    />
  );
};
