package fi.oph.yki.service.keha;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.UUID;
import org.junit.jupiter.api.Test;

public class MockKehaClientTest {

  @Test
  public void testDecisionFromConfiguredSsns() {
    final MockKehaClient client = new MockKehaClient(" 010170-999R , 020270-998P", "030370-997N");

    assertEquals(KehaDecision.ELIGIBLE, client.checkEligibility("010170-999R", UUID.randomUUID()));
    assertEquals(KehaDecision.ELIGIBLE, client.checkEligibility("020270-998P", UUID.randomUUID()));
    assertEquals(KehaDecision.NOT_ELIGIBLE, client.checkEligibility("040470-996M", UUID.randomUUID()));
    assertThrows(IllegalStateException.class, () -> client.checkEligibility("030370-997N", UUID.randomUUID()));
  }

  @Test
  public void testEmptyConfigIsNeverEligible() {
    final MockKehaClient client = new MockKehaClient("", "");

    assertEquals(KehaDecision.NOT_ELIGIBLE, client.checkEligibility("010170-999R", UUID.randomUUID()));
  }
}
