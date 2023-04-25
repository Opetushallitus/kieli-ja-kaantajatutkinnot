package fi.oph.vkt.payment.paytrail;

import lombok.Builder;

@Builder
public record Customer(String email, String phone, String firstName, String lastName) {}
