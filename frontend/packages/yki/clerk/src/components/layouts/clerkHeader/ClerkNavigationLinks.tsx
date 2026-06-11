import { useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { User } from 'interfaces/session';
import { userSelector } from 'redux/selectors/user';

const getTabForPath = (path: string, user: User) => {
  if (path.includes(AppRoutes.ClerkOrganizerRegister)) {
    return 'clerkOrganizerRegister';
  } else if (path.includes(AppRoutes.CustomerSearch)) {
    return 'customerSearch';
  } else if (path.includes(AppRoutes.ClerkQuarantine)) {
    return 'quarantine';
  } else if (
    path.includes(AppRoutes.ClerkExamSession.replace(':id', '')) ||
    path.includes(AppRoutes.ClerkExamDates)
  ) {
    return 'clerkExamSessions';
  } else if (path.includes(AppRoutes.ClerkPaymentReport)) {
    return 'paymentReport';
  } else if (
    path.includes(AppRoutes.OrganizerCustomerSearch.replace(':oid', user.oid))
  ) {
    return 'organizerCustomerSearch';
  } else if (path.includes(AppRoutes.Organizer)) {
    return 'organizerExamSessions';
  } else {
    return false;
  }
};

export const ClerkNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const { user } = useAppSelector(userSelector);

  if (!user) {
    return null;
  }

  const links = user?.isAdmin
    ? [
        {
          active: getTabForPath(pathname, user) === 'clerkExamSessions',
          href: AppRoutes.ClerkExamDates,
          label: translateCommon('clerkExamSessions'),
        },
        {
          active: getTabForPath(pathname, user) === 'clerkOrganizerRegister',
          href: AppRoutes.ClerkOrganizerRegister,
          label: translateCommon('clerkOrganizerRegister'),
        },
        {
          active: getTabForPath(pathname, user) === 'customerSearch',
          href: AppRoutes.CustomerSearch,
          label: translateCommon('customerSearch'),
        },
        {
          active: getTabForPath(pathname, user) === 'quarantine',
          href: AppRoutes.ClerkQuarantine,
          label: translateCommon('quarantine'),
        },
        {
          active: getTabForPath(pathname, user) === 'paymentReport',
          href: AppRoutes.ClerkPaymentReport,
          label: translateCommon('paymentReport'),
        },
      ]
    : [
        {
          active: getTabForPath(pathname, user) === 'organizerExamSessions',
          href: AppRoutes.OrganizerHome.replace(':oid', user.oid),
          label: translateCommon('clerkExamSessions'),
        },
        {
          active: getTabForPath(pathname, user) === 'organizerCustomerSearch',
          href: AppRoutes.OrganizerCustomerSearch.replace(':oid', user.oid),
          label: translateCommon('customerSearch'),
        },
      ];

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={links}
    />
  );
};
