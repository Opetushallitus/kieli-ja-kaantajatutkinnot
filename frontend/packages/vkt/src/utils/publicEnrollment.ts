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
          PublicEnrollmentFormStep.Done,
        ]
      : [
          PublicEnrollmentFormStep.Authenticate,
          PublicEnrollmentFormStep.FillContactDetails,
          PublicEnrollmentFormStep.SelectExam,
          PublicEnrollmentFormStep.Preview,
          PublicEnrollmentFormStep.Done,
        ];
  }

  static calculateExaminationPaymentSum(enrollment: PublicEnrollment) {
    const selectedSkillsCount = [
      enrollment.oralSkill,
      enrollment.textualSkill,
      enrollment.understandingSkill,
    ].filter((s) => s).length;

    return 227 * Math.min(selectedSkillsCount, 2);
  }
}
