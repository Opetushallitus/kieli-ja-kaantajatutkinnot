import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import {
  addClerkTranslatorFilter,
  deselectAllClerkTranslators,
  setPage,
} from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorToggleFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters.authorisationStatus',
  });

  const { translators, filters } = useAppSelector(clerkTranslatorsSelector);
  const dispatch = useAppDispatch();

  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    if (filters.authorisationStatus !== status) {
      dispatch(addClerkTranslatorFilter({ authorisationStatus: status }));
      dispatch(deselectAllClerkTranslators());
      dispatch(setPage(0));
    }
  };

  const effectiveCount = translators.filter(
    (t) => t.authorisations.effective.length > 0,
  ).length;
  const expiringCount = translators.filter(
    (t) => t.authorisations.expiring.length > 0,
  ).length;
  const expiredDeduplicatedCount = translators.filter(
    (t) => t.authorisations.expiredDeduplicated.length > 0,
  ).length;
  const formerVirCount = translators.filter(
    (t) => t.authorisations.formerVir.length > 0,
  ).length;

  const filterData = [
    {
      status: AuthorisationStatus.Effective,
      count: effectiveCount,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.Effective}`,
      label: t(AuthorisationStatus.Effective),
    },
    {
      status: AuthorisationStatus.Expiring,
      count: expiringCount,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.Expiring}`,
      label: t(AuthorisationStatus.Expiring),
    },
    {
      status: AuthorisationStatus.ExpiredDeduplicated,
      count: expiredDeduplicatedCount,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.ExpiredDeduplicated}`,
      label: t(AuthorisationStatus.ExpiredDeduplicated),
    },
    {
      status: AuthorisationStatus.FormerVir,
      count: formerVirCount,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.FormerVir}`,
      label: t(AuthorisationStatus.FormerVir),
    },
  ];

  return (
    <ToggleFilterGroup
      filters={filterData}
      activeStatus={filters.authorisationStatus}
      onButtonClick={filterByAuthorisationStatus}
    />
  );
};
