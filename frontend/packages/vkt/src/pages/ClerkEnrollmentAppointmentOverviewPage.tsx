import { Box, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router';
import { H1 } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { ClerkEnrollmentAppointmentDetails } from 'components/clerkEnrollment/appointment/ClerkEnrollmentAppointmentDetails';
import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  loadClerkEnrollmentAppointment,
  loadClerkEnrollmentAppointmentGrades,
  loadExaminerExamEvents,
} from 'redux/reducers/clerkEnrollmentAppointment';
import { clerkEnrollmentAppointmentSelector } from 'redux/selectors/clerkEnrollmentAppointment';

interface ClerkEnrollmentAppointmentOverviewPageProps {
  editMode: boolean;
}

export const ClerkEnrollmentAppointmentOverviewPage: FC<
  ClerkEnrollmentAppointmentOverviewPageProps
> = ({ editMode }) => {
  // Redux
  const { status, gradesStatus, examEventsStatus, examEvents, enrollment } =
    useAppSelector(clerkEnrollmentAppointmentSelector);

  const dispatch = useAppDispatch();
  const params = useParams();
  const backTo = enrollment?.examEvent?.id
    ? AppRoutes.ExaminerExamEventPage.replace(':oid', params.oid || '').replace(
        ':examEventId',
        enrollment?.examEvent?.id,
      )
    : AppRoutes.ExaminerHomePage.replace(':oid', params.oid || '');

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.enrollmentAppointmentId
    ) {
      dispatch(
        loadClerkEnrollmentAppointment({
          id: +params.enrollmentAppointmentId,
          oid: params.oid || '',
        }),
      );
    }
  }, [dispatch, status, params.enrollmentAppointmentId, params.oid]);

  useEffect(() => {
    if (examEventsStatus === APIResponseStatus.NotStarted && params.oid) {
      dispatch(loadExaminerExamEvents(params.oid));
    }
  }, [dispatch, examEventsStatus, params.oid]);

  useEffect(() => {
    if (
      gradesStatus === APIResponseStatus.NotStarted &&
      enrollment?.id &&
      params.oid
    ) {
      dispatch(
        loadClerkEnrollmentAppointmentGrades({
          enrollmentId: enrollment.id,
          oid: params.oid,
        }),
      );
    }
  }, [dispatch, enrollment?.id, gradesStatus, params.oid]);

  return (
    <Box className="clerk-enrollment-overview-page">
      <TopControls backTo={backTo} />
      <H1 data-testid="clerk-enrollment-overview-page__header"></H1>
      <Paper
        elevation={3}
        className="clerk-enrollment-overview-page__content-container rows"
      >
        {enrollment && params.oid && (
          <ClerkEnrollmentAppointmentDetails
            editMode={editMode}
            enrollment={enrollment}
            examEvents={examEvents}
            oid={params.oid}
          />
        )}
      </Paper>
    </Box>
  );
};
