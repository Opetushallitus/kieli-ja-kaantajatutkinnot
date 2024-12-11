import { RootState } from 'configs/redux';
import { ExaminerExamEventOverviewState } from 'redux/reducers/examinerExamEventOverview';

export const examinerExamEventOverviewSelector = (
  state: RootState,
): ExaminerExamEventOverviewState => state.examinerExamEventOverview;
