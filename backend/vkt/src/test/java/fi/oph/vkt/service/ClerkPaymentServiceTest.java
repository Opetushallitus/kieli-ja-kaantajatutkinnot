package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;

import fi.oph.vkt.Factory;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkPaymentAuditDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.ClerkPaymentUtil;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class ClerkPaymentServiceTest {

  @Resource
  private PaymentRepository paymentRepository;

  @MockBean
  private AuditService auditService;

  private ClerkPaymentService clerkPaymentService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    clerkPaymentService = new ClerkPaymentService(paymentRepository, auditService);
  }

  @Test
  public void testSetRefunded() {
    final ExamEvent examEvent = Factory.examEvent();
    final Person person = Factory.person();
    final Enrollment enrollment = Factory.enrollment(examEvent, person);
    final Payment payment1 = Factory.payment(enrollment);
    final Payment payment2 = Factory.payment(enrollment);

    entityManager.persist(examEvent);
    entityManager.persist(person);
    entityManager.persist(enrollment);
    entityManager.persist(payment1);
    entityManager.persist(payment2);

    final ClerkPaymentAuditDTO oldAuditDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment1);
    final ClerkPaymentDTO responseDTO = clerkPaymentService.setRefunded(payment1.getId());
    final ClerkPaymentAuditDTO newAuditDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment1);

    assertEquals(payment1.getId(), responseDTO.id());
    assertNotNull(responseDTO.refundedAt());
    assertNull(payment2.getRefundedAt());

    verify(auditService).logUpdate(VktOperation.REFUND_PAYMENT, payment1.getId(), oldAuditDto, newAuditDto);
  }
}
