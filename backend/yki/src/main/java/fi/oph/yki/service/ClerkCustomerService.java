package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.PaymentState;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import javax.swing.text.html.Option;
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
    return registrationRepository
      .getByPersonOid(oid)
      .stream()
      .filter(r -> r.getKind() != RegistrationKind.QUEUE)
      .map(registration -> {
        final var session = registration.getExamSession();

        // Use the latest payment information
        var latestExamPayment = registration
          .getExamPayments()
          .stream()
          .max(Comparator.comparing(ExamPayment::getPaidAt));

        var freeRegistrationCreatedAt = registration.getFreeRegistration().getCreatedAt().toLocalDate();
        var paidAt = latestExamPayment.map(ExamPayment::getPaidAt);

        var registrationDate = paidAt.orElse(freeRegistrationCreatedAt);

        return new ClerkCustomerRegistrationDTO(
          session.getExamDate().getExamDate(),
          new ClerkExamDTO(session.getLanguage(), session.getLanguage()),
          session.getLocations().stream().map(l -> new ClerkExamLocationDTO(l.getName(), l.getPostOffice())).toList(),
          new ClerkRegistrationStatusDTO(registration.getState().name(), paidAt),
          registrationDate
        );
      })
      .toList();
  }

  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) throws Exception {
    return new ClerkCustomerDetailsDTO(getClerkCustomerPersonDTO(oid), getClerkCustomerRegistrationDTOs(oid));
  }
}
