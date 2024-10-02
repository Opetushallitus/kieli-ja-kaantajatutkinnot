import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentAppointmentDesktopGrid } from 'components/publicEnrollmentAppointment/PublicEnrollmentAppointmentDesktopGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentAppointmentFormStep } from 'enums/publicEnrollment';
import { loadPublicEnrollmentAppointment } from 'redux/reducers/publicEnrollmentAppointment';
import { publicEnrollmentAppointmentSelector } from 'redux/selectors/publicEnrollmentAppointment';

export const PublicEnrollmentAppointmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentAppointmentFormStep;
}) => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { enrollment, loadEnrollmentStatus } = useAppSelector(
    publicEnrollmentAppointmentSelector,
  );
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const isAuthenticatePassed =
    activeStep > PublicEnrollmentAppointmentFormStep.Authenticate;

  useEffect(() => {
    if (
      isAuthenticatePassed &&
      loadEnrollmentStatus === APIResponseStatus.NotStarted &&
      params.enrollmentId
    ) {
      dispatch(loadPublicEnrollmentAppointment(+params.enrollmentId));
    }
  }, [
    dispatch,
    loadEnrollmentStatus,
    isAuthenticatePassed,
    params.enrollmentId,
  ]);

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentAppointmentDesktopGrid
        enrollment={enrollment}
        activeStep={activeStep}
        isStepValid={isStepValid}
        setIsStepValid={setIsStepValid}
        showValidation={showValidation}
        setShowValidation={setShowValidation}
      />
    </Grid>
  );
};
