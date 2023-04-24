package fi.oph.vkt.service;

import fi.oph.vkt.payment.Item;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaytrailService paytrailService;

  public boolean createPayment(List<Item> itemList) {
    return paytrailService.createPayment(itemList);
  }
}
