import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentAppointmentDetails } from 'components/clerkEnrollment/appointment/ClerkEnrollmentAppointmentDetails';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadClerkEnrollmentAppointment } from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';

export const ClerkEnrollmentAppointmentOverviewPage: FC = () => {
  // Redux
  const { status, enrollment } = useAppSelector(
    clerkEnrollmentAppointmentSelector,
  );

  const dispatch = useAppDispatch();
  const params = useParams();

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.enrollmentAppointmentId
    ) {
      dispatch(loadClerkEnrollmentAppointment(+params.enrollmentAppointmentId));
    }
  }, [dispatch, status, params.enrollmentAppointmentId]);

  return (
    <Box className="clerk-enrollment-overview-page">
      <H1 data-testid="clerk-enrollment-overview-page__header"></H1>
      <Paper
        elevation={3}
        className="clerk-enrollment-overview-page__content-container rows"
      >
        {enrollment && (
          <ClerkEnrollmentAppointmentDetails
            editMode={true}
            enrollment={enrollment}
          />
        )}
      </Paper>
    </Box>
  );
};
