package fi.oph.vkt.service.receipt;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ReceiptData(
  @NonNull String date,
  @NonNull String paymentDate,
  @NonNull String payer,
  @NonNull String exam,
  @NonNull String participant,
  @NonNull String totalAmount,
  @NonNull List<ReceiptItem> items
) {}
