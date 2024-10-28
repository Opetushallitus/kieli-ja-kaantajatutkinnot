import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentDetails } from 'components/clerkEnrollment/appointment/ClerkEnrollmentAppointmentDetails';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadClerkEnrollmentContactRequest } from 'redux/reducers/clerkEnrollmentContactRequest';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';

export const ClerkEnrollmentAppointmentOverviewPage: FC = () => {
  // Redux
  const { status } = useAppSelector(clerkEnrollmentContactRequestSelector);

  const dispatch = useAppDispatch();
  const params = useParams();

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.enrollmentAppointmentId
    ) {
      dispatch(
        loadClerkEnrollmentContactRequest(+params.enrollmentAppointmentId),
      );
    }
  }, [dispatch, status, params.enrollmentAppointmentId]);

  return (
    <Box className="clerk-enrollment-overview-page">
      <H1 data-testid="clerk-enrollment-overview-page__header"></H1>
      <Paper
        elevation={3}
        className="clerk-enrollment-overview-page__content-container rows"
      >
        <ClerkEnrollmentDetails />
      </Paper>
    </Box>
  );
};
