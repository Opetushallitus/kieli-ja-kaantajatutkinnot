package fi.oph.vkt.service.receipt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.TemplateRenderer;
import fi.oph.vkt.util.localisation.Language;
import java.time.LocalDate;
import javax.annotation.Resource;
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

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId(), Language.FI);
    assertNotNull(receiptData);
    assertEquals("Bar, Foo", receiptData.payerName());
    assertEquals("454 €", receiptData.totalAmount());

    final ReceiptItem receiptItem = receiptData.item();
    assertEquals("Valtionhallinnon kielitutkinnot (VKT), tutkintomaksu", receiptItem.name());
    assertEquals("454 €", receiptItem.value());

    assertEquals(2, receiptItem.additionalInfos().size());
    assertEquals("Ruotsi, erinomainen, 07.10.2024", receiptItem.additionalInfos().get(0));
    assertEquals("Osallistuja: Bar, Foo", receiptData.item().additionalInfos().get(1));
  }
}
