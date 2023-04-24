package fi.oph.vkt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class PaytrailService {
    private final Environment environment;
    private final WebClient webClient;

    public boolean createPayment() {
        return true;
    }
}
