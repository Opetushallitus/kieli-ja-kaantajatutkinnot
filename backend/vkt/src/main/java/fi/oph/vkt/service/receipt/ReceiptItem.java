package fi.oph.vkt.service.receipt;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ReceiptItem(@NonNull String name, @NonNull String amount) {}
