package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.PersonSearchProjection;
import fi.oph.yki.repository.RegistrationRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

class ClerkCustomerBirthdateTest {

  @Test
  void searchIncludesBirthdateFromRegistrationWhenOnrPersonHasNoSsn() throws Exception {
    final var persons = mock(PersonRepository.class);
    final var onr = mock(OnrService.class);
    final var service = new ClerkCustomerService(
      persons,
      mock(OrganizerRepository.class),
      mock(RegistrationRepository.class),
      onr,
      mock(AuditService.class)
    );
    final var person = new PersonSearchProjection(
      "1.2.3",
      "Test",
      "Person",
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1L,
      "2002-05-02"
    );
    when(persons.searchPersons(any(), any(), any(), any(), any(), any())).thenReturn(new PageImpl<>(List.of(person)));
    final var data = new PersonalDataDTO();
    data.setOidHenkilo(person.oid());
    when(onr.listPersonDetails(List.of(person.oid()))).thenReturn(List.of(data));

    final var result = service
      .searchClerkCustomers(PageRequest.of(0, 10), ClerkCustomerSearchRequestDTO.builder().personQuery("Test").build())
      .getContent()
      .get(0)
      .person();

    assertNull(result.ssn());
    assertEquals("2002-05-02", result.birthdate());
  }
}
