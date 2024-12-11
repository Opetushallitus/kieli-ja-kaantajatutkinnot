import { ToggleFilterGroup } from 'shared/components';

import { useExaminerTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamEventToggleFilter } from 'enums/app';
import { setExaminerExamEventToggleFilter } from 'redux/reducers/examinerDetails';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { ExamEventUtils } from 'utils/examEvent';

export const ExaminerExamEventToggleFilters = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventListing.toggleFilters',
  });

  const { toggleFilter } = useAppSelector(
    examinerDetailsSelector,
  ).examEventFilters;
  const { examiner } = useAppSelector(examinerDetailsSelector);
  const dispatch = useAppDispatch();

  const setToggleFilter = (status: ExamEventToggleFilter) => {
    dispatch(setExaminerExamEventToggleFilter(status));
  };
  const examEvents = examiner?.examEvents || [];

  const filterData = [
    {
      status: ExamEventToggleFilter.Upcoming,
      label: t(ExamEventToggleFilter.Upcoming),
      count: ExamEventUtils.getUpcomingExamEvents(examEvents).length,
      testId: `examiner-exam-event-toggle-filters__${ExamEventToggleFilter.Upcoming}-btn`,
    },
    {
      status: ExamEventToggleFilter.Passed,
      label: t(ExamEventToggleFilter.Passed),
      count: ExamEventUtils.getPassedExamEvents(examEvents).length,
      testId: `examiner-exam-event-toggle-filters__${ExamEventToggleFilter.Passed}-btn`,
    },
  ];

  return (
    <ToggleFilterGroup
      filters={filterData}
      activeStatus={toggleFilter}
      onButtonClick={setToggleFilter}
    />
  );
};
