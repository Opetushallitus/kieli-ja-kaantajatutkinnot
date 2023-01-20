package fi.oph.vkt.service.receipt;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ReceiptData(
  @NonNull String dateOfReceipt,
  @NonNull String payerName,
  @NonNull String paymentDate,
  @NonNull String totalAmount,
  @NonNull ReceiptItem item
) {}
