package fi.oph.vkt.payment;

import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import java.util.List;
import java.util.Map;

public interface PaymentProvider {
  PaytrailResponseDTO createPayment(
    final List<Item> itemList,
    final Long paymentId,
    final Customer customer,
    final int amount,
    final AppLocale appLocale
  );

  boolean validate(final Map<String, String> paymentParams);
}
