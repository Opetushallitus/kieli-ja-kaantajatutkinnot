package fi.oph.vkt.service.receipt;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ReceiptItem(@NonNull String name, @NonNull String value, @NonNull List<String> additionalInfos) {}
