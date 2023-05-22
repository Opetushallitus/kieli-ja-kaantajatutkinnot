import dayjs from 'dayjs';
import { CustomSkeleton } from 'shared/components';
import { SkeletonVariant } from 'shared/enums';

import { PublicEnrollmentExamEventDetails } from 'components/publicEnrollment/PublicEnrollmentExamEventDetails';
import { PublicEnrollmentStepContents } from 'components/publicEnrollment/PublicEnrollmentStepContents';
import { PublicEnrollmentStepper } from 'components/publicEnrollment/PublicEnrollmentStepper';
import { useCommonTranslation } from 'configs/i18n';
import { ExamLanguage } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { PublicExamEvent } from 'interfaces/publicExamEvent';

export const PublicAuthGridSkeleton = () => {
  const translateCommon = useCommonTranslation();
  const ariaLabel = translateCommon('loadingContent');
  const examEvent: PublicExamEvent = {
    date: dayjs(),
    hasCongestion: false,
    id: 123,
    language: ExamLanguage.FI,
    openings: 10,
    registrationCloses: dayjs(),
  };

  const enrollment: PublicEnrollment = {
    email: '',
    emailConfirmation: '',
    phoneNumber: '',
    privacyStatementConfirmation: false,
    oralSkill: false,
    textualSkill: false,
    understandingSkill: false,
    speakingPartialExam: false,
    speechComprehensionPartialExam: false,
    writingPartialExam: false,
    readingComprehensionPartialExam: false,
    digitalCertificateConsent: false,
  };

  return (
    <>
      <CustomSkeleton
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
      >
        <PublicEnrollmentStepper
          activeStep={PublicEnrollmentFormStep.Authenticate}
          includePaymentStep={false}
        />
      </CustomSkeleton>
      <CustomSkeleton
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
        className="full-max-width"
      >
        <PublicEnrollmentExamEventDetails
          showOpenings={true}
          examEvent={examEvent}
        />
      </CustomSkeleton>
      <CustomSkeleton
        variant={SkeletonVariant.Rectangular}
        ariaLabel={ariaLabel}
        className="full-max-width"
      >
        <PublicEnrollmentStepContents
          activeStep={PublicEnrollmentFormStep.FillContactDetails}
          enrollment={enrollment}
          isLoading={true}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          setIsStepValid={() => {}}
          showValidation={false}
        />
      </CustomSkeleton>
    </>
  );
};
