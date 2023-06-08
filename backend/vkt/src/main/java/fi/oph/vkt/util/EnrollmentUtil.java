package fi.oph.vkt.util;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.type.ExamLevel;

public class EnrollmentUtil {

  private static final int SKILL_FEE = 22700;

  public static int getTotalFee(final Enrollment enrollment) {
    return getTextualSkillFee(enrollment) + getOralSkillFee(enrollment) + getUnderstandingSkillFee(enrollment);
  }

  public static int getTextualSkillFee(final Enrollment enrollment) {
    return enrollment.isTextualSkill() ? SKILL_FEE : 0;
  }

  public static int getOralSkillFee(final Enrollment enrollment) {
    return enrollment.isOralSkill() ? SKILL_FEE : 0;
  }

  public static int getUnderstandingSkillFee(final Enrollment enrollment) {
    if (enrollment.isTextualSkill() && enrollment.isOralSkill()) {
      return 0;
    }

    return enrollment.getExamEvent().getLevel() == ExamLevel.EXCELLENT ? 0 : SKILL_FEE;
  }
}
