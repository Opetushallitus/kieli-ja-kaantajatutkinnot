package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLevel;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    return (enrollment.hasApplicableFreeBasis() && freeEnrollmentDetails.textualSkillCount() < FREE_ENROLLMENT_LIMIT)
      ? 0
      : SKILL_FEE;
  }

  public static int getOralSkillFee(final Enrollment enrollment, final FreeEnrollmentDetails freeEnrollmentDetails) {
    if (!enrollment.isOralSkill()) {
      return 0;
    }

    return (enrollment.hasApplicableFreeBasis() && freeEnrollmentDetails.oralSkillCount() < FREE_ENROLLMENT_LIMIT)
      ? 0
      : SKILL_FEE;
  }

  public static boolean validateAttachmentId(final String attachmentId, final Person person, final long examEventId) {
    final Pattern attachmentIdPattern = Pattern.compile("^(\\d+)\\/([a-z0-9\\-]+)\\/.*");
    final Matcher matcher = attachmentIdPattern.matcher(attachmentId);
    if (!matcher.matches() || matcher.group(1) == null || matcher.group(2) == null) {
      return false;
    }

    final Long parsedExamEventId = Long.valueOf(matcher.group(1));

    return parsedExamEventId.equals(examEventId) && matcher.group(2).equals(person.getUuid().toString());
  }

  public static int getUnderstandingSkillFee(final Enrollment enrollment) {
    if (enrollment.isTextualSkill() && enrollment.isOralSkill()) {
      return 0;
    }

    return enrollment.getExamEvent().getLevel() == ExamLevel.EXCELLENT ? 0 : SKILL_FEE;
  }

  public static long getFreeExamsLeft(long used) {
    return Math.max(0, EnrollmentUtil.FREE_ENROLLMENT_LIMIT - used);
  }
}
