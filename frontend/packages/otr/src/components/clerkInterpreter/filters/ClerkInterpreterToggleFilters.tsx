import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { addClerkInterpreterFilter } from 'redux/reducers/clerkInterpreter';
import {
  clerkInterpretersSelector,
  selectClerkInterpretersByQualificationStatus,
} from 'redux/selectors/clerkInterpreter';

export const ClerkInterpreterToggleFilters = () => {
  const { effective, expiring, expired } = useAppSelector(
    selectClerkInterpretersByQualificationStatus
  );
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterFilters.qualificationStatus',
  });

  const dispatch = useAppDispatch();
  const { filters } = useAppSelector(clerkInterpretersSelector);

  const filterByQualificationStatus = (
    qualificationStatus: QualificationStatus
  ) => {
    dispatch(addClerkInterpreterFilter({ qualificationStatus }));
  };

  const filterData = [
    {
      status: QualificationStatus.Effective,
      count: effective.length,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.Effective}`,
      label: t(QualificationStatus.Effective),
    },
    {
      status: QualificationStatus.Expiring,
      count: expiring.length,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.Expiring}`,
      label: t(QualificationStatus.Expiring),
    },
    {
      status: QualificationStatus.Expired,
      count: expired.length,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.Expired}`,
      label: t(QualificationStatus.Expired),
    },
  ];

  return (
    <ToggleFilterGroup
      filters={filterData}
      activeStatus={filters.qualificationStatus}
      onButtonClick={filterByQualificationStatus}
    />
  );
};
