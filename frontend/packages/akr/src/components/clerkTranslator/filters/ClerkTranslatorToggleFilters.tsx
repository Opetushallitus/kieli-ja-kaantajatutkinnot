import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { addClerkTranslatorFilter } from 'redux/reducers/clerkTranslator';
import {
  clerkTranslatorsSelector,
  selectTranslatorsByAuthorisationStatus,
} from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorToggleFilters = () => {
  const { authorised, expiring, expired, formerVIR } = useAppSelector(
    selectTranslatorsByAuthorisationStatus
  );
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters.authorisationStatus',
  });

  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(clerkTranslatorsSelector);

  const filterByAuthorisationStatus = (status: AuthorisationStatus) => {
    dispatch(addClerkTranslatorFilter({ authorisationStatus: status }));
  };

  const filterData = [
    {
      status: AuthorisationStatus.Authorised,
      count: authorised.length,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.Authorised}`,
      label: t(AuthorisationStatus.Authorised),
    },
    {
      status: AuthorisationStatus.Expiring,
      count: expiring.length,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.Expiring}`,
      label: t(AuthorisationStatus.Expiring),
    },
    {
      status: AuthorisationStatus.Expired,
      count: expired.length,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.Expired}`,
      label: t(AuthorisationStatus.Expired),
    },
    {
      status: AuthorisationStatus.FormerVIR,
      count: formerVIR.length,
      testId: `clerk-translator-filters__btn--${AuthorisationStatus.FormerVIR}`,
      label: t(AuthorisationStatus.FormerVIR),
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
