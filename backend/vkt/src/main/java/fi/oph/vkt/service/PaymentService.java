package fi.oph.vkt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaytrailService paytrailService;

    public boolean createPayment() {
       return paytrailService.createPayment();
    }
}
