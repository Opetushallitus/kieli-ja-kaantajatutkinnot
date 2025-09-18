import { useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const getTabForPath = (path: string) => {
  if (path === AppRoutes.ClerkOrganizerRegister) {
    return 'registration';
  } else if (path === AppRoutes.ClerkFreeEnrollment) {
    return 'freeEnrollment';
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
          active: getTabForPath(pathname) === 'registration',
          href: AppRoutes.ClerkOrganizerRegister,
          label: translateCommon('registration'),
        },
        {
          active: getTabForPath(pathname) === 'freeEnrollment',
          href: AppRoutes.ClerkFreeEnrollment,
          label: translateCommon('freeEnrollment'),
        },
      ]}
    />
  );
};
