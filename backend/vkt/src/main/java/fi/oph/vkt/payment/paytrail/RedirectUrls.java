package fi.oph.vkt.payment.paytrail;

import lombok.Builder;

@Builder
public record RedirectUrls(String successUrl, String cancelUrl) {}
