package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  private ClerkCustomerPersonDTO PersonToDTO(Person person) throws NotFoundException {
    try {
      final var oid = person.getOid();
      final var onrPerson = Objects.requireNonNull(
        onrService.getPersonalData(oid),
        String.format("Person with oid '%s' was found in the person repository, ", oid) +
        "but not found from the oppijanumerorekisteri-service."
      );

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
    } catch (Exception e) {
      throw new NotFoundException(e.getMessage());
    }
  }

  private ClerkCustomerRegistrationDTO RegistrationToDTO(Registration registration) {
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
  }

  private ClerkCustomerPersonDTO getClerkCustomerPersonDTO(String oid) throws Exception {
    return PersonToDTO(
      Objects.requireNonNull(
        personRepository.getByOid(oid),
        // throw 404, because the whole data of getClerkCustomerDetails is tied to a specific user.
        String.format("Person with oid '%s' not found from the person repository.", oid)
      )
    );
  }

  private List<ClerkCustomerRegistrationDTO> getClerkCustomerRegistrationDTOs(String oid) {
    return registrationRepository.getByPersonOid(oid).stream().map(this::RegistrationToDTO).toList();
  }

  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) throws Exception {
    return new ClerkCustomerDetailsDTO(getClerkCustomerPersonDTO(oid), getClerkCustomerRegistrationDTOs(oid));
  }

  public List<ClerkCustomerDetailsDTO> searchClerkCustomers() throws Exception {
    final var persons = personRepository.findAll();
    return persons
      .stream()
      .map(person -> {
        var registrations = registrationRepository.getByPersonOid(person.getOid());
        return new ClerkCustomerDetailsDTO(
          PersonToDTO(person),
          registrations.stream().map(this::RegistrationToDTO).toList()
        );
      })
      .toList();
  }
}
