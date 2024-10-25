//import { useNavigate } from 'react-router-dom';
import { NavigationLinks } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { clerkUserSelector } from 'redux/selectors/clerkUser';

/*const getTabForPath = (path: string) => {
  if (path === AppRoutes.ClerkHomePage) {
    return HeaderNavTab.ExamEvents;
  } else {
    return false;
  }
};*/

const AdminNavigationLinks = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navigationLinks',
  });
  const translateCommon = useCommonTranslation();
  //const navigate = useNavigate();
  const excellentLevelLink = {
    active: false,
    href: AppRoutes.ClerkExcellentLevelPage,
    label: t('excellentLevel'),
  };
  const goodAndSatisfactoryLevelLink = {
    active: true,
    href: AppRoutes.ClerkExcellentLevelPage,
    label: t('goodAndSatisfactoryLevel'),
  };

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={[excellentLevelLink, goodAndSatisfactoryLevelLink]}
    />
  );
};

export const ClerkNavigationLinks = (): JSX.Element => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navigationLinks',
  });
  const translateCommon = useCommonTranslation();
  //const navigate = useNavigate();
  const { isAdmin, isExaminer } = useAppSelector(clerkUserSelector);
  const excellentLevelLink = {
    active: false,
    href: AppRoutes.ClerkExcellentLevelPage,
    label: t('excellentLevel'),
  };
  // TODO Need to return different link for examiner and admin
  // For examiner, the link should go to their own details
  // For admin, the link should go to examiner listing
  const goodAndSatisfactoryLevelLink = {
    active: true,
    href: AppRoutes.ClerkExcellentLevelPage,
    label: t('goodAndSatisfactoryLevel'),
  };

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={
        isAdmin
          ? [excellentLevelLink, goodAndSatisfactoryLevelLink]
          : isExaminer
          ? [goodAndSatisfactoryLevelLink]
          : []
      }
    />
  );
};
