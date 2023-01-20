package fi.oph.vkt.util;

import fi.oph.vkt.model.Enrollment;

public class EnrollmentUtil {

  public static int calculateExaminationPaymentSum(final Enrollment enrollment) {
    final int baseValue = 227;
    final int count =
      (enrollment.isOralSkill() ? 1 : 0) +
      (enrollment.isTextualSkill() ? 1 : 0) +
      (enrollment.isUnderstandingSkill() ? 1 : 0);
    return baseValue * Math.min(count, 2);
  }
}
