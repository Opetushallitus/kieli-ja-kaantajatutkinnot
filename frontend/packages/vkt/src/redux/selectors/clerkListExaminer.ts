import { RootState } from 'configs/redux';
import { ClerkListExaminerState } from 'interfaces/clerkListExaminer';

export const clerkListExaminerSelector = (
  state: RootState,
): ClerkListExaminerState => state.clerkListExaminer;
