package fi.oph.vkt.payment;

import lombok.Builder;

@Builder
public record Item(int unitPrice, int units, int vatPercentage, String productCode) {}
