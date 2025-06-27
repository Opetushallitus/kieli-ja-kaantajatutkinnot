import { useLocation } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useCommonTranslation } from 'configs/i18n';

const getTabForPath = (path: string) => {
  if (path === '/yki/v2/virkailija/jarjestajarekisteri') {
    return 'registration';
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
          href: '/yki/v2/jarjestajarekisteri',
          label: translateCommon('registration'),
        },
      ]}
    />
  );
};
