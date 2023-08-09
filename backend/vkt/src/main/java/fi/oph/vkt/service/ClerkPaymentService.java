package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkPaymentAuditDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.ClerkPaymentUtil;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkPaymentService {

  private final PaymentRepository paymentRepository;
  private final AuditService auditService;

  @Transactional
  public ClerkPaymentDTO setRefunded(final long paymentId) {
    final Payment payment = paymentRepository.getReferenceById(paymentId);
    final ClerkPaymentAuditDTO oldPaymentDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment);

    payment.setRefundedAt(LocalDateTime.now());
    paymentRepository.saveAndFlush(payment);

    final ClerkPaymentAuditDTO newPaymentDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment);
    auditService.logUpdate(VktOperation.REFUND_PAYMENT, payment.getId(), oldPaymentDto, newPaymentDto);

    return ClerkPaymentUtil.createClerkPaymentDTO(payment);
  }
}
