import { useLocation } from 'react-router';
import { NavigationLinks } from 'shared/components';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { clerkUserSelector } from 'redux/selectors/clerkUser';

const ExaminerNavigationLinks = () => {
  const { oid } = useAppSelector(clerkUserSelector);

  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navigationLinks',
  });
  const translateCommon = useCommonTranslation();
  const goodAndSatisfactoryLevelLink = {
    active: true,
    href: AppRoutes.ExaminerHomePage.replace(/:oid/, oid),
    label: t('goodAndSatisfactoryLevel'),
  };

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={[goodAndSatisfactoryLevelLink]}
    />
  );
};

const AdminNavigationLinks = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.header.navigationLinks',
  });
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();
  const excellentLevelLink = {
    active: pathname.startsWith(AppRoutes.ClerkExcellentLevelPage),
    href: AppRoutes.ClerkExcellentLevelPage,
    label: t('excellentLevel'),
  };
  const goodAndSatisfactoryLevelLink = {
    active:
      pathname.startsWith(AppRoutes.ClerkGoodAndSatisfactoryLevelPage) ||
      pathname.startsWith(AppRoutes.ExaminerRoot),
    href: AppRoutes.ClerkGoodAndSatisfactoryLevelPage,
    label: t('goodAndSatisfactoryLevel'),
  };
  const paymentReportLink = {
    active: pathname.startsWith(AppRoutes.ClerkPaymentReportPage),
    href: AppRoutes.ClerkPaymentReportPage,
    label: t('paymentReport'),
  };

  return (
    <NavigationLinks
      navigationAriaLabel={translateCommon(
        'header.accessibility.mainNavigation',
      )}
      links={[
        excellentLevelLink,
        goodAndSatisfactoryLevelLink,
        paymentReportLink,
      ]}
    />
  );
};

export const ClerkNavigationLinks = (): JSX.Element => {
  const { isAdmin, isExaminer } = useAppSelector(clerkUserSelector);

  if (isAdmin) {
    return <AdminNavigationLinks />;
  } else if (isExaminer) {
    return <ExaminerNavigationLinks />;
  }

  return <></>;
};
