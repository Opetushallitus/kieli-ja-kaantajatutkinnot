import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';

export class PublicEnrollmentUtils {
  static getEnrollmentSteps(includePaymentStep: boolean) {
    return includePaymentStep
      ? [
          PublicEnrollmentFormStep.Authenticate,
          PublicEnrollmentFormStep.FillContactDetails,
          PublicEnrollmentFormStep.SelectExam,
          PublicEnrollmentFormStep.Preview,
          PublicEnrollmentFormStep.Payment,
          PublicEnrollmentFormStep.PaymentSuccess,
        ]
      : [
          PublicEnrollmentFormStep.Authenticate,
          PublicEnrollmentFormStep.FillContactDetails,
          PublicEnrollmentFormStep.SelectExam,
          PublicEnrollmentFormStep.Preview,
          PublicEnrollmentFormStep.Done,
        ];
  }

  static getEnrollmentNextStep(
    activeStep: PublicEnrollmentFormStep,
    includePaymentStep: boolean,
  ) {
    const steps = PublicEnrollmentUtils.getEnrollmentSteps(includePaymentStep);
    const currentIndex = steps.findIndex((step) => step === activeStep);

    return steps[currentIndex + 1];
  }

  static calculateExaminationPaymentSum(enrollment: PublicEnrollment) {
    const selectedSkillsCount = [
      enrollment.oralSkill,
      enrollment.textualSkill,
      enrollment.understandingSkill,
    ].filter((s) => s).length;

    return 257 * Math.min(selectedSkillsCount, 2);
  }
}
