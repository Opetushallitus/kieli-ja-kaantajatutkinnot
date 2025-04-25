import { ToggleFilterGroup } from 'shared/components';

import { useClerkTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamEventToggleFilter } from 'enums/app';
import { setClerkListExaminerExamEventFilters } from 'redux/reducers/clerkListExaminer';
import { clerkListExaminerSelector } from 'redux/selectors/clerkListExaminer';
import { ExamEventUtils } from 'utils/examEvent';

export const ClerkExaminerExamEventToggleFilters = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing.toggleFilters',
  });

  const { examiners, filters } = useAppSelector(clerkListExaminerSelector);
  const examEvents = examiners.flatMap(({ examEvents }) => examEvents);
  const dispatch = useAppDispatch();

  const setToggleFilter = (status: ExamEventToggleFilter) => {
    dispatch(setClerkListExaminerExamEventFilters({ toggleFilters: status }));
  };

  const filterData = [
    {
      status: ExamEventToggleFilter.Upcoming,
      label: t(ExamEventToggleFilter.Upcoming),
      count: ExamEventUtils.getUpcomingExamEvents(examEvents).length,
      testId: `clerk-exam-event-toggle-filters__${ExamEventToggleFilter.Upcoming}-btn`,
    },
    {
      status: ExamEventToggleFilter.Passed,
      label: t(ExamEventToggleFilter.Passed),
      count: ExamEventUtils.getPassedExamEvents(examEvents).length,
      testId: `clerk-exam-event-toggle-filters__${ExamEventToggleFilter.Passed}-btn`,
    },
  ];

  return (
    <ToggleFilterGroup
      filters={filterData}
      activeStatus={filters.examEvents.toggleFilters}
      onButtonClick={setToggleFilter}
    />
  );
};
