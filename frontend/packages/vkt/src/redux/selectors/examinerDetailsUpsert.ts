import { RootState } from 'configs/redux';
import { ExaminerDetailsUpsertState } from 'interfaces/examinerDetailsUpsert';

export const examinerDetailsUpsertSelector: (
  state: RootState,
) => ExaminerDetailsUpsertState = (state: RootState) =>
  state.examinerDetailsUpsert;
