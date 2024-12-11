import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicEnrollmentContactDesktopGrid } from 'components/publicEnrollmentContact/PublicEnrollmentContactDesktopGrid';
import { PublicEnrollmentContactPhoneGrid } from 'components/publicEnrollmentContact/PublicEnrollmentContactPhoneGrid';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { loadPublicExaminer } from 'redux/reducers/publicEnrollmentContact';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

export const PublicEnrollmentContactGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentContactFormStep;
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const examinerId =
    params.examinerId !== undefined ? +params.examinerId : null;
  const dispatch = useAppDispatch();
  const { enrollment, examiner, loadExaminerStatus } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const [isStepValid, setIsStepValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const isLoading = loadExaminerStatus === APIResponseStatus.InProgress;

  if (!examinerId) {
    navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
  }

  useEffect(() => {
    if (loadExaminerStatus === APIResponseStatus.NotStarted && examinerId) {
      dispatch(loadPublicExaminer(examinerId));
    }
  }, [dispatch, loadExaminerStatus, examinerId]);

  const { isPhone } = useWindowProperties();

  if (!examiner) {
    return <></>;
  }

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment-contact"
    >
      {isPhone && (
        <PublicEnrollmentContactPhoneGrid
          examiner={examiner}
          enrollment={enrollment}
          activeStep={activeStep}
          isStepValid={isStepValid}
          setIsStepValid={setIsStepValid}
          isLoading={isLoading}
          showValidation={showValidation}
          setShowValidation={setShowValidation}
        />
      )}
      {!isPhone && (
        <PublicEnrollmentContactDesktopGrid
          examiner={examiner}
          enrollment={enrollment}
          activeStep={activeStep}
          isStepValid={isStepValid}
          setIsStepValid={setIsStepValid}
          isLoading={isLoading}
          showValidation={showValidation}
          setShowValidation={setShowValidation}
        />
      )}
    </Grid>
  );
};
