package fi.oph.vkt.util;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.type.ExamLevel;

public class EnrollmentUtil {

  public static boolean isUnderstandingSkillFree(final Enrollment enrollment) {
    if (enrollment.isTextualSkill() && enrollment.isOralSkill()) {
      return true;
    }

    return enrollment.getExamEvent().getLevel() == ExamLevel.EXCELLENT;
  }
}
