import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { SessionExpiredModal } from 'components/layouts/SessionExpiredModal';
import { PublicEnrollmentDesktopGrid } from 'components/publicEnrollment/PublicEnrollmentDesktopGrid';
import { PublicEnrollmentPhoneGrid } from 'components/publicEnrollment/PublicEnrollmentPhoneGrid';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, EnrollmentStatus } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useAuthentication } from 'hooks/useAuthentication';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  loadEnrollmentInitialisation,
  loadPublicExamEvent,
  resetPublicEnrollment,
  setPublicEnrollmentExamEventIdIfNotSet,
} from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

export const PublicEnrollmentAppointmentGrid = ({
  activeStep,
}: {
  activeStep: PublicEnrollmentFormStep;
}) => {
  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-enrollment"
    >
      <PublicEnrollmentDesktopGrid
        isStepValid={isStepValid}
        isShiftedFromQueue={!!isShiftedFromQueue}
        isExamEventDetailsAvailable={isExamEventDetailsAvailable}
        isPaymentSumAvailable={!!isPaymentSumAvailable}
        isPreviewStepActive={isPreviewStepActive}
        isPreviewPassed={isPreviewPassed}
        isEnrollmentToQueue={isEnrollmentToQueue}
        setShowValidation={setShowValidation}
        setIsStepValid={setIsStepValid}
        showValidation={showValidation}
        activeStep={activeStep}
        examEvent={examEvent}
      />
    </Grid>
  );
};
