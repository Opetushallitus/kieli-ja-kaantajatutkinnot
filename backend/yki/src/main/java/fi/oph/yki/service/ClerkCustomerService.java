package fi.oph.yki.service;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  private ClerkCustomerPersonDTO PersonToDTO(Person person) throws RuntimeException {
    final var oid = person.getOid();
    if (oid == null) {
      throw new NotFoundException("Person oid is null in the repository.");
    }

    final PersonalDataDTO onrPerson;
    try {
      onrPerson = onrService.getPersonalData(oid);
    } catch (Exception e) {
      throw new RuntimeException("Unable to get personal data from ONR with oid '" + oid + "'.", e);
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
      .filter(p -> p.getPaidAt() != null)
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

  public Page<ClerkCustomerSummaryDTO> searchClerkCustomers(Pageable pageable) throws Exception {
    final Page<Person> personPage = personRepository.findAll(pageable);

    final List<ClerkCustomerSummaryDTO> content = personPage
      .getContent()
      .stream()
      .map(person ->
        new ClerkCustomerSummaryDTO(PersonToDTO(person), registrationRepository.getByPersonOid(person.getOid()).size())
      )
      .toList();

    return new PageImpl<>(content, pageable, personPage.getTotalElements());
  }
}
