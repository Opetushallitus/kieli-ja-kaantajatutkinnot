package fi.oph.vkt.payment;

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
    final int amount
  );

  boolean validate(final Map<String, String> paymentParams);
}
