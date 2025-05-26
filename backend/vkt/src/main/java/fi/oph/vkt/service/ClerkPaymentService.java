package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.audit.dto.ClerkPaymentAuditDTO;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.ClerkPaymentUtil;
import fi.oph.vkt.view.PaymentReportView;
import fi.oph.vkt.view.PaymentReportXlsxDataRowUtil;
import fi.oph.vkt.view.PaymentReportXslxData;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@Service
@RequiredArgsConstructor
public class ClerkPaymentService {

  private final PaymentRepository paymentRepository;
  private final AuditService auditService;

  @Transactional
  public ClerkPaymentDTO setRefunded(final long paymentId) {
    final Payment payment = paymentRepository.getReferenceById(paymentId);
    final ClerkPaymentAuditDTO oldAuditDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment);

    payment.setRefundedAt(LocalDateTime.now());
    paymentRepository.saveAndFlush(payment);

    final ClerkPaymentAuditDTO newAuditDto = ClerkPaymentUtil.createClerkPaymentAuditDTO(payment);
    auditService.logUpdate(VktOperation.REFUND_PAYMENT, payment.getId(), oldAuditDto, newAuditDto);

    return ClerkPaymentUtil.createClerkPaymentDTO(payment);
  }

  @Transactional(readOnly = true)
  public AbstractXlsxView getPaymentReportExcel(final LocalDate from, final LocalDate to) {
    auditService.logOperation(VktOperation.GET_PAYMENT_REPORT_EXCEL);

    final List<Payment> paymentList = paymentRepository.findPaymentsReport(
      from.atStartOfDay(),
      to.atTime(LocalTime.MAX)
    );
    final List<PaymentReportXslxData> paymentReportXslxData = PaymentReportXlsxDataRowUtil.createExcelData(paymentList);

    return new PaymentReportView(paymentReportXslxData);
  }
}
