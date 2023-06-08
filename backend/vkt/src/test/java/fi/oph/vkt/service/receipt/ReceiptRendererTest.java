package fi.oph.vkt.service.receipt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.util.localisation.Language;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class ReceiptRendererTest {

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private TestEntityManager entityManager;

  private ReceiptRenderer receiptRenderer;

  @BeforeEach
  public void setup() {
    receiptRenderer = new ReceiptRenderer(enrollmentRepository, templateRenderer);
  }

  @Test
  public void testGetReceiptData() {
    final ExamEvent examEvent = Factory.examEvent();
    examEvent.setLanguage(ExamLanguage.SV);
    examEvent.setLevel(ExamLevel.EXCELLENT);
    examEvent.setDate(LocalDate.of(2024, 10, 7));

    final Person person = Factory.person();
    person.setFirstName("Foo");
    person.setLastName("Bar");

    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    enrollment.setTextualSkill(true);
    enrollment.setOralSkill(false);
    enrollment.setUnderstandingSkill(true);

    final Payment payment = Factory.payment(enrollment);
    payment.setAmount(22700);
    payment.setReference("RF-123");

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);
    entityManager.persist(payment);

    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId(), Language.FI);
    assertNotNull(receiptData);
    assertEquals("RF-123", receiptData.paymentReference());
    assertEquals("Ruotsi, erinomainen taito, 07.10.2024", receiptData.exam());
    assertEquals("Bar, Foo", receiptData.participant());
    assertEquals("227 €", receiptData.totalAmount());

    final ReceiptItem item1 = receiptData.items().get(0);
    assertEquals("Kirjallinen taito", item1.name());
    assertEquals("227 €", item1.amount());

    final ReceiptItem item2 = receiptData.items().get(1);
    assertEquals("Ymmärtämisen taito", item2.name());
    assertEquals("0 €", item2.amount());
  }
}
