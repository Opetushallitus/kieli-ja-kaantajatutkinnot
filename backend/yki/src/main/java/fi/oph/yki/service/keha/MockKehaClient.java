package fi.oph.yki.service.keha;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MockKehaClient implements KehaClient {

  private static final Logger LOG = LoggerFactory.getLogger(MockKehaClient.class);

  private final Set<String> eligibleSsns;
  private final Set<String> errorSsns;

  public MockKehaClient(
    @Value("${app.keha.mock.eligible-ssns}") final String eligibleSsns,
    @Value("${app.keha.mock.error-ssns}") final String errorSsns
  ) {
    this.eligibleSsns = parseSsns(eligibleSsns);
    this.errorSsns = parseSsns(errorSsns);
  }

  private static Set<String> parseSsns(final String ssns) {
    return Arrays.stream(ssns.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toSet());
  }

  @Override
  public KehaDecision checkEligibility(final String ssn, final UUID personUuid) {
    LOG.info("Mock KEHA eligibility check, personUuid: {}", personUuid);

    if (errorSsns.contains(ssn)) {
      throw new IllegalStateException("Mock KEHA failure, personUuid: " + personUuid);
    }

    return eligibleSsns.contains(ssn) ? KehaDecision.ELIGIBLE : KehaDecision.NOT_ELIGIBLE;
  }
}
