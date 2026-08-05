import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { clerkUserSelector } from 'redux/selectors/clerkUser';

export const ExaminerRedirectPage = () => {
  const navigate = useNavigate();
  // Use OID from authentication details of logged in user to redirect to correct examiner pages.
  // Note that this might be misleading if this page is accessed by OPH clerk instead of examiner.
  // However, this should not ordinarily happen.
  const { oid, status } = useAppSelector(clerkUserSelector);
  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      navigate(AppRoutes.ExaminerHomePage.replace(/:oid/, oid));
    }
  });

  return <div />;
};
