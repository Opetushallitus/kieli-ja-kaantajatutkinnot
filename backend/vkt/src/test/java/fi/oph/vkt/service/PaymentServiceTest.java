package fi.oph.vkt.service;

import org.junit.Test;
import org.springframework.core.env.Environment;
import org.springframework.web.reactive.function.client.WebClient;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class PaymentServiceTest {

    @Test
    public void testInitialiseEnrollmentToExamEventWithRoom() {
        final WebClient webClient = mock(WebClient.class);
        final Environment environment = mock(Environment.class);
        when(environment.getRequiredProperty("app.payment.paytrail.url")).thenReturn("");

        final PaytrailService paytrailService = new PaytrailService(environment, webClient);
        final PaymentService paymentService = new PaymentService(paytrailService);
        paymentService.createPayment();
    }
}
