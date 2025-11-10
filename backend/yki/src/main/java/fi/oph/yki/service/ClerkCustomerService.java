package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import fi.oph.yki.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang.NotImplementedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
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

  private List<ClerkCustomerRegistrationDTO> getClerkCustomerRegistrationDTOs(String oid) throws Exception {
    return registrationRepository.getByPersonOid(oid).stream().map(registration -> {
        final var session = registration.getExamSession();

        ExamSessionLocation location =  session.getLocations().get(0); // TODO: Which location to use, or all?
        final RegistrationState status = registration.getState(); // enum: COMPLETED, SUBMITTED,EXPIRED, CANCELLED,PAID_AND_CANCELLED

        // Use the latest payment information
        // TODO: What if the user did not pay all or paid too much totally?
        var paidAt = registration.getExamPayments()
                .stream()
                .max(Comparator.comparing(ExamPayment::getPaidAt));

        LocalDate registrationDate =  LocalDate.now();

        return new ClerkCustomerRegistrationDTO(
                session.getExamDate().getExamDate(),
                new ClerkExamDTO(
                        session.getLanguage(),
                        session.getLevel()
                ),
                new ClerkExamLocationDTO(
                        location.getName(),
                        location.getPostOffice()
                ),
                new ClerkRegistrationStatusDTO(
                        status.name(),
                        paidAt.map(ExamPayment::getPaidAt)
                ),
                registrationDate
        );
    }).toList();
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
      getClerkCustomerRegistrationDTOs(oid),
      getClerkCustomerQueuedExamDTOs(),
      getClerkCustomerPastExamDTOs()
    );
  }
}
