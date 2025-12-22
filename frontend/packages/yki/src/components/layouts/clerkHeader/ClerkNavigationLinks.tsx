import { useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const getTabForPath = (path: string) => {
  if (path === AppRoutes.ClerkOrganizerRegister) {
    return 'registration';
  } else if (path.includes(AppRoutes.ClerkFreeRegistration)) {
    return 'freeRegistration';
  } else if (path.includes(AppRoutes.CustomerSearch)) {
    return 'customerSearch';
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
          active: getTabForPath(pathname) === 'organizerRegister',
          href: AppRoutes.ClerkExamSession,
          label: translateCommon('organizerRegister'),
        },
        {
          active: getTabForPath(pathname) === 'registration',
          href: AppRoutes.ClerkOrganizerRegister,
          label: translateCommon('registration'),
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
      ]}
    />
  );
};
