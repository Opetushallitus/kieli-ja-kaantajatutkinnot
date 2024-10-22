import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';

import { PublicEnrollmentContactDesktopGrid } from 'components/publicEnrollmentContact/PublicEnrollmentContactDesktopGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { loadPublicExaminer } from 'redux/reducers/publicEnrollmentContact';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

export const PublicEnrollmentContactGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const params = useParams();
  const examinerId =
    params.examinerId !== undefined ? +params.examinerId : null;
  const dispatch = useAppDispatch();
  const { enrollment, examiner, loadExaminerStatus } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (loadExaminerStatus === APIResponseStatus.NotStarted && examinerId) {
      dispatch(loadPublicExaminer(examinerId));
    }
  }, [dispatch, loadExaminerStatus, examinerId]);

  if (!examiner) {
    return <></>;
  }

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentContactDesktopGrid
        examiner={examiner}
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
