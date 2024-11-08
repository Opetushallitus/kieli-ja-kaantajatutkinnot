import { ToggleFilterGroup } from 'shared/components';

import { useExaminerTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamEventToggleFilter } from 'enums/app';
import { setExamEventToggleFilter } from 'redux/reducers/clerkListExamEvent';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';
import { ExamEventUtils } from 'utils/examEvent';

export const ExaminerExamEventToggleFilters = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventListing.toggleFilters',
  });

  const { examEvents, toggleFilter } = useAppSelector(
    clerkListExamEventsSelector,
  );
  const dispatch = useAppDispatch();

  const setToggleFilter = (status: ExamEventToggleFilter) => {
    dispatch(setExamEventToggleFilter(status));
  };

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
