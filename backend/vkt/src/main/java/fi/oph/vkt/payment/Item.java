package fi.oph.vkt.payment;

public record Item(
    int unitPrice,
    int units,
    int vatPercentage,
    String productCode
) { }
