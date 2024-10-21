import { Grid, Paper } from '@mui/material';
import { LoadingProgressIndicator } from 'shared/components';

import { PublicEnrollmentContactControlButtons } from 'components/publicEnrollmentContact/PublicEnrollmentContactControlButtons';
import { PublicEnrollmentContactStepContents } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepContents';
import { PublicEnrollmentContactStepHeading } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepHeading';
import { PublicEnrollmentContactStepper } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepper';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

export const PublicEnrollmentContactDesktopGrid = ({
  activeStep,
  enrollment,
  isStepValid,
  showValidation,
  setIsStepValid,
  setShowValidation,
  examinerId,
}: {
  activeStep: PublicEnrollmentContactFormStep;
  isStepValid: boolean;
  enrollment: PublicEnrollmentContact;
  showValidation: boolean;
  setIsStepValid: (isValid: boolean) => void;
  setShowValidation: (showValidation: boolean) => void;
  examinerId: number;
}) => {
  const translateCommon = useCommonTranslation();

  const { enrollmentSubmitStatus } = useAppSelector(
    publicEnrollmentContactSelector,
  );

  const showControlButtons = activeStep <= PublicEnrollmentContactFormStep.Done;

  return (
    <>
      <Grid className="public-enrollment__grid" item>
        <Paper elevation={3}>
          <LoadingProgressIndicator
            isLoading={false}
            translateCommon={translateCommon}
            displayBlock={true}
          >
            <div className={'public-enrollment__grid__form-container'}>
              <PublicEnrollmentContactStepper activeStep={activeStep} />
              <PublicEnrollmentContactStepHeading activeStep={activeStep} />
              <PublicEnrollmentContactStepContents
                activeStep={activeStep}
                enrollment={enrollment}
                showValidation={showValidation}
                setIsStepValid={setIsStepValid}
              />
              {showControlButtons && (
                <PublicEnrollmentContactControlButtons
                  activeStep={activeStep}
                  enrollment={enrollment}
                  setShowValidation={setShowValidation}
                  isStepValid={isStepValid}
                  submitStatus={enrollmentSubmitStatus}
                  examinerId={examinerId}
                />
              )}
            </div>
          </LoadingProgressIndicator>
        </Paper>
      </Grid>
    </>
  );
};
