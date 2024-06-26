package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PublicEnrollmentService;

public class EnrollmentUtil {

  private static final int SKILL_FEE = 25700;
  public static final Integer FREE_ENROLLMENT_LIMIT = 3;

  public static int getTotalFee(final Enrollment enrollment, final FreeEnrollmentDetails freeEnrollmentDetails) {
    return (
      getTextualSkillFee(enrollment, freeEnrollmentDetails) +
      getOralSkillFee(enrollment, freeEnrollmentDetails) +
      getUnderstandingSkillFee(enrollment)
    );
  }

  public static int getTextualSkillFee(final Enrollment enrollment, final FreeEnrollmentDetails freeEnrollmentDetails) {
    if (!enrollment.isTextualSkill()) {
      return 0;
    }

    return (enrollment.hasApprovedFreeBasis() && freeEnrollmentDetails.textualSkillCount() < FREE_ENROLLMENT_LIMIT)
      ? 0
      : SKILL_FEE;
  }

  public static int getOralSkillFee(final Enrollment enrollment, final FreeEnrollmentDetails freeEnrollmentDetails) {
    if (!enrollment.isOralSkill()) {
      return 0;
    }

    return (enrollment.hasApprovedFreeBasis() && freeEnrollmentDetails.oralSkillCount() < FREE_ENROLLMENT_LIMIT)
      ? 0
      : SKILL_FEE;
  }

  public static int getUnderstandingSkillFee(final Enrollment enrollment) {
    if (enrollment.isTextualSkill() && enrollment.isOralSkill()) {
      return 0;
    }

    return enrollment.getExamEvent().getLevel() == ExamLevel.EXCELLENT ? 0 : SKILL_FEE;
  }
}
