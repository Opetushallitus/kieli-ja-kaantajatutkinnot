package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import java.util.Map;
import org.junit.jupiter.api.Test;

class RegistrationUtilTest {

  @Test
  void includesBirthdateFromTheMatchingRegistrationFormWithoutOnrData() {
    final var person = Factory.person();
    final var first = Factory.registration(person);
    first.setId(1L);
    first.setForm(new ObjectMapper().createObjectNode().put("birthdate", "2002-05-02"));
    final var second = Factory.registration(person);
    second.setId(2L);
    second.setForm(new ObjectMapper().createObjectNode().put("birthdate", "2002-05-03"));

    final var result = RegistrationUtil.createClerkRegistrationDTO(first, null, Map.of()).person();
    assertEquals("2002-05-02", result.birthdate());
    assertNull(result.socialSecurityNumber());
    assertEquals(
      "2002-05-03",
      RegistrationUtil.createClerkRegistrationDTO(second, null, Map.of()).person().birthdate()
    );
  }

  @Test
  void preservesSsnAndHandlesMissingBirthday() {
    final var person = Factory.person();
    final var registration = Factory.registration(person);
    registration.setId(1L);
    final var identityNumbers = Map.of(person.getOid(), "020502E902X");
    final var result = RegistrationUtil.createClerkRegistrationDTO(registration, null, identityNumbers).person();
    assertEquals("020502E902X", result.socialSecurityNumber());
    assertNull(result.birthdate());
    registration.setForm(new ObjectMapper().createObjectNode().putNull("birthdate"));
    assertNull(RegistrationUtil.createClerkRegistrationDTO(registration, null, Map.of()).person().birthdate());
  }
}
