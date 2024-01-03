package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import org.junit.jupiter.api.Test;

public class EnrollmentUtilTest {

  @Test
  public void testGetTextualSkillFee() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setTextualSkill(false);
    assertEquals(0, EnrollmentUtil.getTextualSkillFee(enrollment));

    enrollment.setTextualSkill(true);
    assertEquals(25700, EnrollmentUtil.getTextualSkillFee(enrollment));
  }

  @Test
  public void testGetOralSkillFee() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    enrollment.setOralSkill(false);
    assertEquals(0, EnrollmentUtil.getOralSkillFee(enrollment));

    enrollment.setOralSkill(true);
    assertEquals(25700, EnrollmentUtil.getOralSkillFee(enrollment));
  }

  @Test
  public void testGetUnderstandingSkillFee() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);

    assertEquals(0, EnrollmentUtil.getUnderstandingSkillFee(enrollment));
  }
}
