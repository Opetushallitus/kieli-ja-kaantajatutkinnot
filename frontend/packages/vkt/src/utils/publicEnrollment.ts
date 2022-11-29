import { PublicEnrollment } from 'interfaces/publicEnrollment';

export class PublicEnrollmentUtils {
  static calculateExaminationPaymentSum(enrollment: PublicEnrollment) {
    const selectedSkillsCount = [
      enrollment.oralSkill,
      enrollment.textualSkill,
      enrollment.understandingSkill,
    ].filter((s) => s).length;

    return 227 * Math.min(selectedSkillsCount, 2);
  }
}
