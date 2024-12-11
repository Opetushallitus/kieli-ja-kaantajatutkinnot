import { Divider, Grid } from '@mui/material';
import { LoadingProgressIndicator, Text } from 'shared/components';

import { PublicEnrollmentContactControlButtons } from 'components/publicEnrollmentContact/PublicEnrollmentContactControlButtons';
import { PublicEnrollmentContactExaminer } from 'components/publicEnrollmentContact/PublicEnrollmentContactExaminer';
import { PublicEnrollmentContactStepContents } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepContents';
import { PublicEnrollmentContactStepHeading } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepHeading';
import { PublicEnrollmentContactStepper } from 'components/publicEnrollmentContact/PublicEnrollmentContactStepper';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { PublicExaminer } from 'interfaces/publicExaminer';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';

export const PublicEnrollmentContactPhoneGrid = ({
  activeStep,
  enrollment,
  isStepValid,
  isLoading,
  showValidation,
  setIsStepValid,
  setShowValidation,
  examiner,
}: {
  activeStep: PublicEnrollmentContactFormStep;
  isStepValid: boolean;
  isLoading: boolean;
  enrollment: PublicEnrollmentContact;
  showValidation: boolean;
  setIsStepValid: (isValid: boolean) => void;
  setShowValidation: (showValidation: boolean) => void;
  examiner: PublicExaminer;
}) => {
  const translateCommon = useCommonTranslation();

  const { enrollmentSubmitStatus, contactDetailsNeedConfirmation } =
    useAppSelector(publicEnrollmentContactSelector);

  const showControlButtons = activeStep < PublicEnrollmentContactFormStep.Done;
  const hideRequiredFieldsInfoText =
    (activeStep === PublicEnrollmentContactFormStep.FillContactDetails &&
      contactDetailsNeedConfirmation) ||
    activeStep === PublicEnrollmentContactFormStep.Done;

  return (
    <>
      <Grid className="public-enrollment-contact__grid" item>
        <LoadingProgressIndicator
          isLoading={isLoading}
          translateCommon={translateCommon}
          displayBlock={true}
        >
          <div className="public-enrollment-contact__grid__form-container">
            <PublicEnrollmentContactStepper activeStep={activeStep} />
            <Divider />
            <PublicEnrollmentContactStepHeading activeStep={activeStep} />
            <PublicEnrollmentContactExaminer examiner={examiner} />
            {!hideRequiredFieldsInfoText && (
              <Text sx={{ margin: '1rem' }}>
                {translateCommon('requiredFieldsInfo')}
              </Text>
            )}
            <Grid className="public-enrollment-contact__grid__step-contents">
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
                  examinerId={examiner.id}
                />
              )}
            </Grid>
          </div>
        </LoadingProgressIndicator>
      </Grid>
    </>
  );
};
