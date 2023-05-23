package fi.oph.vkt.payment;

import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import java.util.List;
import lombok.NonNull;

public interface PaymentProvider {
  PaytrailResponseDTO createPayment(
    @NonNull final List<Item> itemList,
    final Long paymentId,
    final Customer customer,
    final int total
  );
}
