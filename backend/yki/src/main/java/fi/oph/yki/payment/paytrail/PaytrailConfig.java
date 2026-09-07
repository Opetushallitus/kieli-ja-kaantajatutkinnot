package fi.oph.yki.payment.paytrail;

import lombok.Builder;
import lombok.Getter;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Builder
@Getter
public class PaytrailConfig {

  public static final String HMAC_ALGORITHM = "sha256";
  public static final String CURRENCY = "EUR";
  public static final int VAT = 0;

  private final String secret;
  private final String account;
  private final String baseUrl;

  public String getSuccessUrl(final Long paymentId) {
    return String.format("%s/payment/%d/success", baseUrl, paymentId);
  }

  public String getCancelUrl(final Long paymentId) {
    return String.format("%s/payment/%d/cancel", baseUrl, paymentId);
  }

  // TODO: could be moved elsewhere, mocked in tests
  public String getTimestamp() {
    return ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
  }
}
