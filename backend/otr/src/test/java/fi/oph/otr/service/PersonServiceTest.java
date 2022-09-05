package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import fi.oph.otr.api.dto.clerk.PersonDTO;
import fi.oph.otr.audit.AuditService;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class PersonServiceTest {

  @MockBean
  private OnrService onrService;

  @MockBean
  private AuditService auditService;

  private PersonService personService;

  @BeforeEach
  public void setup() {
    personService = new PersonService(onrService, auditService);
  }

  @Test
  public void test() throws Exception {
    final PersonalData onrAnswer = PersonalData
      .builder()
      .onrId("123.321")
      .individualised(true)
      .lastName("Esimerkki")
      .firstName("Erkki Eemeli")
      .nickName("Erkki")
      .identityNumber("xxx1")
      .street("Katu 1")
      .postalCode("999")
      .town("Kaupunki")
      .country("Maa")
      .build();
    when(onrService.findPersonalDataByIdentityNumber("xxx1")).thenReturn(Optional.of(onrAnswer));

    final Optional<PersonDTO> optionalPersonDTO = personService.findPersonByIdentityNumber("xxx1");

    assertTrue(optionalPersonDTO.isPresent());
    final PersonDTO personDTO = optionalPersonDTO.get();
    assertEquals("123.321", personDTO.onrId());
    assertTrue(personDTO.isIndividualised());
    assertEquals("Esimerkki", personDTO.lastName());
    assertEquals("Erkki Eemeli", personDTO.firstName());
    assertEquals("Erkki", personDTO.nickName());
    assertEquals("xxx1", personDTO.identityNumber());
    assertEquals("Katu 1", personDTO.street());
    assertEquals("999", personDTO.postalCode());
    assertEquals("Kaupunki", personDTO.town());
    assertEquals("Maa", personDTO.country());

    verify(auditService).logPersonSearchByIdentityNumber(eq("xxx1"));
    verifyNoMoreInteractions(auditService);
  }

  @Test
  public void testWhenOnrServiceThrowsExceptionThenAuditIsNotLogged() throws Exception {
    final RuntimeException onrException = new RuntimeException("A test when OnrService throws exception");
    when(onrService.findPersonalDataByIdentityNumber(any())).thenThrow(onrException);

    assertThrows(
      RuntimeException.class,
      () -> personService.findPersonByIdentityNumber("x"),
      onrException.getMessage()
    );
    verifyNoInteractions(auditService);
  }
}
