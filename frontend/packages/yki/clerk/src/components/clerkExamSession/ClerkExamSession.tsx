import { Stack } from '@mui/material';
import { useEffect } from 'react';

import { ClerkExamSessionDetails } from 'components/clerkExamSession/ClerkExamSessionDetails';
import { ClerkExamSessionRegistrations } from 'components/clerkExamSession/ClerkExamSessionRegistrations';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RouteType } from 'interfaces/user';
import { resetClerkExamSession } from 'redux/reducers/clerkExamSession';
import { loadExamDates, loadOrganizerExamDates } from 'redux/reducers/examDate';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';
import { examDateSelector } from 'redux/selectors/examDate';

export const ClerkExamSession = ({
  route,
  oid,
}: {
  route: RouteType;
  oid: string;
}) => {
  const dispatch = useAppDispatch();
  const { clerkExamSession } = useAppSelector(clerkExamSessionDetailsSelector);
  const { examDates } = useAppSelector(examDateSelector);

  useEffect(() => {
    dispatch(
      route === 'clerk' ? loadExamDates(false) : loadOrganizerExamDates(oid),
    );

    return () => {
      dispatch(resetClerkExamSession());
    };
  }, [dispatch, route, oid]);

  if (!clerkExamSession) {
    return <></>;
  }

  return (
    <Stack rowGap={4}>
      <ClerkExamSessionDetails
        examSessionDetails={clerkExamSession}
        examDates={examDates}
        route={route}
      />
      <ClerkExamSessionRegistrations
        examSessionId={clerkExamSession.id}
        examRegistrations={clerkExamSession.registrations}
        language={clerkExamSession.language}
        level={clerkExamSession.level}
        route={route}
      />
    </Stack>
  );
};
