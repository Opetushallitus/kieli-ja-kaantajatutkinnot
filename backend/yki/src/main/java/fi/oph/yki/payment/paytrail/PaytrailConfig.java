package fi.oph.yki.payment.paytrail;

import fi.oph.yki.model.type.AppLocale;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class PaytrailConfig {

  public static final String HMAC_ALGORITHM = "sha256";
  public static final String CURRENCY = "EUR";
  public static final int VAT = 0;

  private final String secret;
  private final String account;
  private final String baseUrl;

  // The language is in the URL so that the payment success email is sent in the language of the
  // payment, as in legacy
  public String getSuccessUrl(final Long paymentId, final AppLocale appLocale) {
    return String.format("%s/payment/%d/success?lang=%s", baseUrl, paymentId, appLocale.name().toLowerCase());
  }

  public String getCancelUrl(final Long paymentId, final AppLocale appLocale) {
    return String.format("%s/payment/%d/cancel?lang=%s", baseUrl, paymentId, appLocale.name().toLowerCase());
  }

  // TODO: could be moved elsewhere, mocked in tests
  public String getTimestamp() {
    return ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
  }
}
