import { RootState } from 'configs/redux';
import { ExaminerDetailsState } from 'interfaces/examinerDetails';

export const examinerDetailsSelector: (
  state: RootState,
) => ExaminerDetailsState = (state: RootState) => state.examinerDetails;
