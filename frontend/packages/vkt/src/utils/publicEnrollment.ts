import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicFreeEnrollmentDetails } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { EnrollmentUtils } from 'utils/enrollment';

export const ENROLLMENT_SKILL_PRICE = 257;

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

  static calculateExaminationPaymentSum(
    enrollment: PublicEnrollment,
    freeEnrollmentDetails?: PublicFreeEnrollmentDetails,
  ) {
    let selectedNonFreeSkillsCount = 0;

    if (EnrollmentUtils.hasFreeBasis(enrollment) && freeEnrollmentDetails) {
      if (
        enrollment.oralSkill &&
        freeEnrollmentDetails.freeOralSkillLeft <= 0
      ) {
        selectedNonFreeSkillsCount++;
      }

      if (
        enrollment.textualSkill &&
        freeEnrollmentDetails.freeTextualSkillLeft <= 0
      ) {
        selectedNonFreeSkillsCount++;
      }
    } else {
      selectedNonFreeSkillsCount = [
        enrollment.oralSkill,
        enrollment.textualSkill,
        enrollment.understandingSkill,
      ].filter((s) => s).length;
    }

    return ENROLLMENT_SKILL_PRICE * Math.min(selectedNonFreeSkillsCount, 2);
  }
}
