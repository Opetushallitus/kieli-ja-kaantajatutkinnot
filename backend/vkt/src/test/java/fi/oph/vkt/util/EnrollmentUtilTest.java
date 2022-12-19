package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.model.Enrollment;
import lombok.NonNull;
import org.junit.jupiter.api.Test;

class EnrollmentUtilTest {

  @Test
  public void testCalculateExaminationPaymentSum() {
    assertEquals(0, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(false, false, false)));
    assertEquals(227, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(true, false, false)));
    assertEquals(454, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(true, true, false)));
    assertEquals(454, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(true, false, true)));
    assertEquals(227, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(false, true, false)));
    assertEquals(227, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(false, false, true)));
    assertEquals(454, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(false, true, true)));
    assertEquals(454, EnrollmentUtil.calculateExaminationPaymentSum(createEnrollment(true, true, true)));
  }

  @NonNull
  private static Enrollment createEnrollment(
    final boolean oralSkill,
    final boolean textualSkill,
    final boolean understandingSkill
  ) {
    final Enrollment enrollment = new Enrollment();
    enrollment.setOralSkill(oralSkill);
    enrollment.setTextualSkill(textualSkill);
    enrollment.setUnderstandingSkill(understandingSkill);
    return enrollment;
  }
}
