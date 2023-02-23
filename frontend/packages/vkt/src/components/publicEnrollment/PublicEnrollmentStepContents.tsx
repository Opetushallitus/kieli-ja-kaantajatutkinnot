import { useDispatch } from 'react-redux';
import { CustomButton, H3 } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { Done } from 'components/publicEnrollment/steps/Done';
import { FillContactDetails } from 'components/publicEnrollment/steps/FillContactDetails';
import { Preview } from 'components/publicEnrollment/steps/Preview';
import { SelectExam } from 'components/publicEnrollment/steps/SelectExam';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { initialisePublicEnrollment } from 'redux/reducers/publicEnrollment';

export const PublicEnrollmentStepContents = ({
  examEvent,
  activeStep,
  enrollment,
  isLoading,
  disableNext,
  showValidation,
}: {
  examEvent: PublicExamEvent;
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  disableNext: (disabled: boolean) => void;
  showValidation: boolean;
}) => {
  const dispatch = useDispatch();

  switch (activeStep) {
    case PublicEnrollmentFormStep.Identify:
      return (
        <div className="margin-top-xxl gapped rows">
          <H3>Tunnistaudu ilmoittautumista varten</H3>
          <CustomButton
            sx={{ width: '168px' }}
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={() => {
              dispatch(initialisePublicEnrollment(examEvent));
            }}
            data-testid="public-enrollment__identiy"
            disabled={isLoading}
          >
            TUNNISTAUDU SUOMI.FI:N KAUTTA
          </CustomButton>
        </div>
      );
    case PublicEnrollmentFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.Preview:
      return (
        <Preview
          enrollment={enrollment}
          isLoading={isLoading}
          disableNext={disableNext}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.Payment:
      return <></>;
    case PublicEnrollmentFormStep.Done:
      return <Done enrollment={enrollment} />;
    default:
      return <> </>;
  }
};
