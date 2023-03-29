package fi.oph.vkt.service.receipt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import fi.oph.vkt.Factory;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.TemplateRenderer;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class ReceiptRendererTest {

  @MockBean
  private TemplateRenderer templateRenderer;

  @Resource
  private EnrollmentRepository enrollmentRepository;

  @Resource
  private TestEntityManager entityManager;

  private ReceiptRenderer receiptRenderer;

  @BeforeEach
  public void setup() {
    receiptRenderer = new ReceiptRenderer(templateRenderer, enrollmentRepository);
  }

  @Test
  public void testGetReceiptData() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);

    final ReceiptData receiptData = receiptRenderer.getReceiptData(enrollment.getId());
    assertNotNull(receiptData);
    assertEquals("454 €", receiptData.totalAmount());
  }
}
