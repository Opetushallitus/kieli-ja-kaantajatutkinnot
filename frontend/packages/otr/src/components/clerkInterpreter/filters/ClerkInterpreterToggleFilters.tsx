import { ToggleFilterGroup } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { addClerkInterpreterFilter } from 'redux/reducers/clerkInterpreter';
import { clerkInterpretersSelector } from 'redux/selectors/clerkInterpreter';

export const ClerkInterpreterToggleFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterFilters.qualificationStatus',
  });

  const { interpreters, filters } = useAppSelector(clerkInterpretersSelector);
  const dispatch = useAppDispatch();

  const filterByQualificationStatus = (
    qualificationStatus: QualificationStatus
  ) => {
    dispatch(addClerkInterpreterFilter({ qualificationStatus }));
  };

  const effectiveCount = interpreters.filter(
    (i) => i.qualifications.effective.length > 0
  ).length;
  const expiringCount = interpreters.filter(
    (i) => i.qualifications.expiring.length > 0
  ).length;
  const expiredDeduplicatedCount = interpreters.filter(
    (i) => i.qualifications.expiredDeduplicated.length > 0
  ).length;

  const filterData = [
    {
      status: QualificationStatus.Effective,
      count: effectiveCount,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.Effective}`,
      label: t(QualificationStatus.Effective),
    },
    {
      status: QualificationStatus.Expiring,
      count: expiringCount,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.Expiring}`,
      label: t(QualificationStatus.Expiring),
    },
    {
      status: QualificationStatus.ExpiredDeduplicated,
      count: expiredDeduplicatedCount,
      testId: `clerk-interpreter-filters__btn--${QualificationStatus.ExpiredDeduplicated}`,
      label: t(QualificationStatus.ExpiredDeduplicated),
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
