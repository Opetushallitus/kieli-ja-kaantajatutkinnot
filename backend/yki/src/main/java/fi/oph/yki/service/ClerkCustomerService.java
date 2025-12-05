package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.Person;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  private ClerkCustomerPersonDTO getClerkCustomerPersonDTO(String oid) throws Exception {
    Person person = personRepository.getByOid(oid);
    if (person == null) {
      // throw 404, because the whole data of getClerkCustomerDetails is tied to a specific user.
      throw new NotFoundException(String.format("Person with oid '%s' not found from the person repository.", oid));
    }

    PersonalDataDTO onrPerson = onrService.getPersonalData(oid);
    if (onrPerson == null) {
      throw new RuntimeException(
        String.format("Person with oid '%s' was found in the person repository, ", oid) +
        "but not found from the oppijanumerorekisteri-service."
      );
    }
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
      .map(registration -> {
        final var session = registration.getExamSession();

        final var examDate = session.getExamDate().getExamDate();
        final var exam = new ClerkExamDTO(session.getLanguage(), session.getLevel());

        final var examLocation = session
          .getLocations()
          .stream()
          .map(l -> new ClerkExamLocationDTO(l.getName(), l.getPostOffice(), l.getLang()))
          .toList();

        final var latestExamPayment = registration
          .getExamPayments()
          .stream()
          .max(Comparator.comparing(ExamPayment::getPaidAt));

        final Optional<LocalDate> freeRegistrationCreatedAt = registration.getFreeRegistration() == null
          ? Optional.empty()
          : Optional.of(registration.getFreeRegistration().getCreatedAt().toLocalDate());

        final var paidAt = latestExamPayment.map(ExamPayment::getPaidAt).map(LocalDateTime::toLocalDate);
        final var registrationDate = paidAt.or(() -> freeRegistrationCreatedAt);

        final Optional<LocalDate> liftedFromQueueAt = registration.getLiftedFromQueueAt() == null
          ? Optional.empty()
          : Optional.of(registration.getLiftedFromQueueAt().toLocalDate());

        final Optional<LocalDate> expiresAt = registration.getExpiresAt() == null
          ? Optional.empty()
          : Optional.of(registration.getExpiresAt().toLocalDate());

        return new ClerkCustomerRegistrationDTO(
          examDate,
          exam,
          examLocation,
          registration.getState(),
          paidAt,
          registrationDate,
          registration.getKind(),
          liftedFromQueueAt,
          expiresAt
        );
      })
      .toList();
  }

  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) throws Exception {
    return new ClerkCustomerDetailsDTO(getClerkCustomerPersonDTO(oid), getClerkCustomerRegistrationDTOs(oid));
  }
}
