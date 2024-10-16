import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentContactDesktopGrid } from 'components/publicEnrollmentContact/PublicEnrollmentContactDesktopGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { loadPublicExamEvent } from 'redux/reducers/publicEnrollmentContact';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

export const PublicEnrollmentContactGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { enrollment, loadExamEventStatus } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (
      loadExamEventStatus === APIResponseStatus.NotStarted &&
      params.enrollmentId
    ) {
      dispatch(loadPublicExamEvent(+params.enrollmentId));
    }
  }, [dispatch, loadExamEventStatus, params.enrollmentId]);

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentContactDesktopGrid
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
