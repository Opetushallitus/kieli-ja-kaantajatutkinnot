package fi.oph.vkt.util;

import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLevel;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class EnrollmentUtilTest {

  @Resource
  private TestEntityManager entityManager;

  @Test
  public void testIsUnderstandingSkillFree() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setLevel(ExamLevel.EXCELLENT);
    entityManager.persist(examEvent);

    assertTrue(EnrollmentUtil.isUnderstandingSkillFree(createEnrollment(examEvent, true, false)));
    assertTrue(EnrollmentUtil.isUnderstandingSkillFree(createEnrollment(examEvent, false, true)));
    assertTrue(EnrollmentUtil.isUnderstandingSkillFree(createEnrollment(examEvent, true, true)));
  }

  private Enrollment createEnrollment(final ExamEvent examEvent, final boolean textualSkill, final boolean oralSkill) {
    final Person person = Factory.person();
    entityManager.persist(person);

    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setTextualSkill(textualSkill);
    enrollment.setOralSkill(oralSkill);
    enrollment.setUnderstandingSkill(true);
    entityManager.persist(enrollment);

    return enrollment;
  }
}
