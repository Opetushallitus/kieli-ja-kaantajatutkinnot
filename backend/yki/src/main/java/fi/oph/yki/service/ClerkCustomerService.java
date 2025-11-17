package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.Person;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang.NotImplementedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final OnrService onrService;

  private ClerkCustomerPersonDTO getClerkCustomerPersonDTO(String oid) throws Exception {
    PersonalDataDTO onrPerson = onrService.getPersonalData(oid);
    Person person = personRepository.getByOid(oid);

    return new ClerkCustomerPersonDTO(
      person.getFirstName(),
      person.getLastName(),
      onrPerson.getIdentityNumber(),
      person.getOid(),
      person.getNationalityCode(),
      person.getPhoneNumber(),
      person.getAddress(),
      person.getEmail()
    );
  }

  private List<ClerkCustomerRegistrationDTO> getClerkCustomerRegistrationDTOs() {
    throw new NotImplementedException("Get registrations from the database is not implemented yet.");
  }

  private List<ClerkCustomerQueuedExamDTO> getClerkCustomerQueuedExamDTOs() {
    throw new NotImplementedException("Get queued exams from the database is not implemented yet.");
  }

  private List<ClerkCustomerPastExamDTO> getClerkCustomerPastExamDTOs() {
    throw new NotImplementedException("Get past exams from the database is not implemented yet.");
  }

  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) throws Exception {
    return new ClerkCustomerDetailsDTO(
      getClerkCustomerPersonDTO(oid),
      getClerkCustomerRegistrationDTOs(),
      getClerkCustomerQueuedExamDTOs(),
      getClerkCustomerPastExamDTOs()
    );
  }
}
