package fi.oph.otr.scheduled;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import fi.oph.otr.Factory;
import fi.oph.otr.model.Email;
import fi.oph.otr.model.Interpreter;
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
  public void testCheckExpiringAuthorisations() {
    final LocalDate date = LocalDate.now();

    final Qualification q1 = createQualification(date);
    final Qualification q2 = createQualification(date.plusDays(10));
    final Qualification q3 = createQualification(date.plusMonths(3));

    final Qualification expiredQ = createQualification(date.minusDays(1));
    final Qualification qExpiringLater = createQualification(date.plusMonths(3).plusDays(1));

    final Qualification remindedQ1 = createQualification(date.plusMonths(1));
    createQualificationReminder(remindedQ1);

    final Qualification remindedQ2 = createQualification(date.plusMonths(2));
    createQualificationReminder(remindedQ2);
    createQualificationReminder(remindedQ2);

    emailCreator.checkExpiringAuthorisations();

    verify(clerkEmailService, times(3)).createQualificationExpiryEmail(longCaptor.capture());

    final List<Long> expiringQIds = longCaptor.getAllValues();

    assertEquals(3, expiringQIds.size());

    assertTrue(expiringQIds.contains(q1.getId()));
    assertTrue(expiringQIds.contains(q2.getId()));
    assertTrue(expiringQIds.contains(q3.getId()));
  }

  private Qualification createQualification(final LocalDate endDate) {
    final Interpreter interpreter = Factory.interpreter();
    entityManager.persist(interpreter);

    final Qualification qualification = Factory.qualification(interpreter);
    qualification.setBeginDate(endDate.minusYears(1));
    qualification.setEndDate(endDate);
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
