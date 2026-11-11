package fi.oph.yki.payment;

import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.payment.paytrail.Customer;
import fi.oph.yki.payment.paytrail.Item;
import fi.oph.yki.payment.paytrail.PaytrailResponseDTO;
import java.util.List;
import java.util.Map;

public interface PaymentProvider {
  PaytrailResponseDTO createPayment(
    final List<Item> itemList,
    final Long paymentId,
    final String paymentReference,
    final Customer customer,
    final int amount,
    final AppLocale appLocale
  );

  boolean validate(final Map<String, String> paymentParams);
}
