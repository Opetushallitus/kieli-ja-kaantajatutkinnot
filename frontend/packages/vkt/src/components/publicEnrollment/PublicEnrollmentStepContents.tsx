import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { Authenticate } from 'components/publicEnrollment/steps/Authenticate';
import { Done } from 'components/publicEnrollment/steps/Done';
import { EducationDetails } from 'components/publicEnrollment/steps/EducationDetails';
import { FillContactDetails } from 'components/publicEnrollment/steps/FillContactDetails';
import { PaymentFail } from 'components/publicEnrollment/steps/PaymentFail';
import { PaymentSuccess } from 'components/publicEnrollment/steps/PaymentSuccess';
import { Preview } from 'components/publicEnrollment/steps/Preview';
import { SelectExam } from 'components/publicEnrollment/steps/SelectExam';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const PublicEnrollmentStepContents = ({
  activeStep,
  enrollment,
  isRenewOrCancelLoading,
  isEnrollmentSubmitLoading,
  setIsStepValid,
  showValidation,
  examEvent,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isRenewOrCancelLoading: boolean;
  isEnrollmentSubmitLoading: boolean;
  setIsStepValid: (isValid: boolean) => void;
  showValidation: boolean;
  examEvent: PublicExamEvent;
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (activeStep >= PublicEnrollmentFormStep.Payment && !enrollment.id) {
      navigate(AppRoutes.PublicHomePage);
    }
  }, [activeStep, enrollment.id, navigate]);

  switch (activeStep) {
    case PublicEnrollmentFormStep.Authenticate:
      return <Authenticate examEvent={examEvent} />;
    case PublicEnrollmentFormStep.FillContactDetails:
      return (
        <FillContactDetails
          enrollment={enrollment}
          isLoading={isRenewOrCancelLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.EducationDetails:
      return (
        <EducationDetails
          enrollment={enrollment}
          isLoading={isRenewOrCancelLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.SelectExam:
      return (
        <SelectExam
          enrollment={enrollment}
          isLoading={isRenewOrCancelLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.Preview:
      return (
        <Preview
          enrollment={enrollment}
          isLoading={isRenewOrCancelLoading || isEnrollmentSubmitLoading}
          setIsStepValid={setIsStepValid}
          showValidation={showValidation}
        />
      );
    case PublicEnrollmentFormStep.Payment:
      return <PaymentFail enrollment={enrollment} />;
    case PublicEnrollmentFormStep.PaymentSuccess:
      return <PaymentSuccess enrollment={enrollment} />;
    case PublicEnrollmentFormStep.DoneQueued:
      return <Done enrollment={enrollment} isQueued={true} />;
    case PublicEnrollmentFormStep.Done:
      return <Done enrollment={enrollment} isQueued={false} />;
  }
};
