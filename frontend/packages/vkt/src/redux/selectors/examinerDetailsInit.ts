import { RootState } from 'configs/redux';
import { ExaminerDetailsInitState } from 'interfaces/examinerDetails';

export const examinerDetailsInitSelector: (
  state: RootState,
) => ExaminerDetailsInitState = (state: RootState) => state.examinerDetailsInit;
