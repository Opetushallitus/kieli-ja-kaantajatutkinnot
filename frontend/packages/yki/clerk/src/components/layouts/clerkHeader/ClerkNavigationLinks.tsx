import { useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const getTabForPath = (path: string) => {
  if (path.includes(AppRoutes.ClerkOrganizerRegister)) {
    return 'clerkOrganizerRegister';
  } else if (path.includes(AppRoutes.ClerkFreeRegistration)) {
    return 'freeRegistration';
  } else if (path.includes(AppRoutes.CustomerSearch)) {
    return 'customerSearch';
  } else if (
    path.includes(AppRoutes.ClerkExamSession) ||
    path.includes(AppRoutes.ClerkExamDates)
  ) {
    return 'clerkExamSessions';
  } else if (path.includes(AppRoutes.ClerkPaymentReport)) {
    return 'paymentReport';
  } else {
    return false;
  }
};

export const ClerkNavigationLinks = () => {
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={[
        {
          active: getTabForPath(pathname) === 'clerkExamSessions',
          href: AppRoutes.ClerkExamDates,
          label: translateCommon('clerkExamSessions'),
        },
        {
          active: getTabForPath(pathname) === 'clerkOrganizerRegister',
          href: AppRoutes.ClerkOrganizerRegister,
          label: translateCommon('clerkOrganizerRegister'),
        },
        {
          active: getTabForPath(pathname) === 'freeRegistration',
          href: AppRoutes.ClerkFreeRegistration,
          label: translateCommon('freeRegistration'),
        },
        {
          active: getTabForPath(pathname) === 'customerSearch',
          href: AppRoutes.CustomerSearch,
          label: translateCommon('customerSearch'),
        },
        {
          active: getTabForPath(pathname) === 'paymentReport',
          href: AppRoutes.ClerkPaymentReport,
          label: translateCommon('paymentReport'),
        },
      ]}
    />
  );
};
