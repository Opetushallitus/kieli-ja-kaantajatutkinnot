import { ToggleFilterGroup } from 'components/elements/ToggleFilterGroup';
import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExaminationDateStatus } from 'enums/examinationDate';
import { setExaminationDateFilter } from 'redux/actions/examinationDate';
import {
  examinationDatesSelector,
  selectExaminationDatesByStatus,
} from 'redux/selectors/examinationDate';

export const ExaminationDatesToggleFilters = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.examinationDatesToggleFilters',
  });

  const { upcoming, passed } = useAppSelector(selectExaminationDatesByStatus);

  const dispatch = useAppDispatch();
  const selectedStatus = useAppSelector(examinationDatesSelector).filter
    .examinationDateStatus;

  const filterByDate = (status: ExaminationDateStatus) => {
    dispatch(
      setExaminationDateFilter({
        examinationDateStatus: status,
      })
    );
  };

  const toggleFilters = [
    {
      status: ExaminationDateStatus.Upcoming,
      label: t(ExaminationDateStatus.Upcoming),
      count: upcoming.length,
      testId: `examination-dates-filters__btn--${ExaminationDateStatus.Upcoming}`,
    },
    {
      status: ExaminationDateStatus.Passed,
      label: t(ExaminationDateStatus.Passed),
      count: passed.length,
      testId: `examination-dates-filters__btn--${ExaminationDateStatus.Passed}`,
    },
  ];

  return (
    <ToggleFilterGroup
      filters={toggleFilters}
      activeStatus={selectedStatus}
      onButtonClick={filterByDate}
    />
  );
};
