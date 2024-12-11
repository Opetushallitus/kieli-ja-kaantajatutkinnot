import { RootState } from 'configs/redux';
import { ExaminerExamEventUpsertState } from 'interfaces/examinerExamEvent';

export const examinerExamEventUpsertSelector: (
  state: RootState,
) => ExaminerExamEventUpsertState = (state: RootState) =>
  state.examinerExamEventUpsert;
