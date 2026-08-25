import { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router';

import { useAppDispatch } from 'configs/redux';
import { setExaminerOid } from 'redux/reducers/examinerDetails';

export const ExaminerRootPage = ({ children }: { children: ReactNode }) => {
  const { oid } = useParams();

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (oid) {
      dispatch(setExaminerOid(oid));
    }
  }, [oid, dispatch]);

  return children;
};
