package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.clerk.ClerkPaymentDTO;
import fi.oph.vkt.audit.dto.ClerkPaymentAuditDTO;
import fi.oph.vkt.model.Payment;

public class ClerkPaymentUtil {

  public static ClerkPaymentAuditDTO createClerkPaymentAuditDTO(final Payment payment) {
    return ClerkPaymentAuditDTO
      .builder()
      .id(payment.getId())
      .version(payment.getVersion())
      .transactionId(payment.getTransactionId())
      .amount(payment.getAmount())
      .status(payment.getPaymentStatus())
      .reference(payment.getReference())
      .paymentUrl(payment.getPaymentUrl())
      .modifiedAt(DateUtil.formatOptionalDatetime(payment.getModifiedAt()))
      .refundedAt(DateUtil.formatOptionalDatetime(payment.getRefundedAt()))
      .build();
  }

  public static ClerkPaymentDTO createClerkPaymentDTO(final Payment payment) {
    return ClerkPaymentDTO
      .builder()
      .id(payment.getId())
      .version(payment.getVersion())
      .transactionId(payment.getTransactionId())
      .amount(payment.getAmount())
      .status(payment.getPaymentStatus())
      .modifiedAt(payment.getModifiedAt())
      .refundedAt(payment.getRefundedAt())
      .build();
  }
}
