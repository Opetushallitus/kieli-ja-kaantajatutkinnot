package fi.oph.otr.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import fi.oph.otr.Factory;
import fi.oph.otr.model.Email;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.MeetingDate;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationReminder;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.service.email.ClerkEmailService;
import java.time.LocalDate;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ExpiringQualificationsEmailCreatorTest {

  private ExpiringQualificationsEmailCreator emailCreator;

  @Resource
  private QualificationRepository qualificationRepository;

  @MockBean
  private ClerkEmailService clerkEmailService;

  @Resource
  private TestEntityManager entityManager;

  @Captor
  private ArgumentCaptor<Long> longCaptor;

  @BeforeEach
  public void setup() {
    emailCreator = new ExpiringQualificationsEmailCreator(qualificationRepository, clerkEmailService);
  }

  @Test
  public void testCheckExpiringQualifications() {
    final LocalDate date = LocalDate.now();
    final MeetingDate meetingDate = Factory.meetingDate();
    entityManager.persist(meetingDate);

    final Qualification q1 = createQualification(meetingDate, date, false);
    final Qualification q2 = createQualification(meetingDate, date.plusDays(10), false);
    final Qualification q3 = createQualification(meetingDate, date.plusMonths(3), false);

    final Qualification deletedQ = createQualification(meetingDate, date.plusDays(10), true);
    final Qualification expiredQ = createQualification(meetingDate, date.minusDays(1), false);
    final Qualification qExpiringLater = createQualification(meetingDate, date.plusMonths(3).plusDays(1), false);

    final Qualification remindedQ1 = createQualification(meetingDate, date.plusMonths(1), false);
    createQualificationReminder(remindedQ1);

    final Qualification remindedQ2 = createQualification(meetingDate, date.plusMonths(2), false);
    createQualificationReminder(remindedQ2);
    createQualificationReminder(remindedQ2);

    emailCreator.checkExpiringQualifications();

    verify(clerkEmailService, times(3)).createQualificationExpiryEmail(longCaptor.capture());

    final List<Long> expiringQIds = longCaptor.getAllValues();

    assertEquals(3, expiringQIds.size());

    assertTrue(expiringQIds.contains(q1.getId()));
    assertTrue(expiringQIds.contains(q2.getId()));
    assertTrue(expiringQIds.contains(q3.getId()));
  }

  private Qualification createQualification(
    final MeetingDate meetingDate,
    final LocalDate endDate,
    final boolean isDeleted
  ) {
    final Interpreter interpreter = Factory.interpreter();
    entityManager.persist(interpreter);

    final Qualification qualification = Factory.qualification(interpreter, meetingDate);
    qualification.setBeginDate(endDate.minusYears(1));
    qualification.setEndDate(endDate);
    if (isDeleted) {
      qualification.markDeleted();
    }
    entityManager.persist(qualification);

    return qualification;
  }

  private void createQualificationReminder(final Qualification qualification) {
    final Email email = Factory.email();
    entityManager.persist(email);

    final QualificationReminder reminder = Factory.qualificationReminder(qualification, email);
    entityManager.persist(reminder);
  }
}
