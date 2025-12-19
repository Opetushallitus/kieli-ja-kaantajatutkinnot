package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  private ClerkCustomerPersonDTO PersonToDTO(Person person) throws RuntimeException {
    final var oid = person.getOid();

    final PersonalDataDTO onrPerson;
    try {
      onrPerson = onrService.getPersonalData(oid);
    } catch (Exception e) {
      throw new RuntimeException("Unable to get personal data from ONR with oid '" + oid + "'.", e);
    }

    return ClerkCustomerPersonDTO
      .builder()
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .ssn(onrPerson.getIdentityNumber())
      .oid(person.getOid())
      .nationalityCode(person.getNationalityCode())
      .phoneNumber(person.getPhoneNumber())
      .streetAddress(person.getAddress())
      .email(person.getEmail())
      .build();
  }

  private ClerkCustomerRegistrationDTO RegistrationToDTO(Registration registration) {
    final var session = registration.getExamSession();

    final var examDate = session.getExamDate().getExamDate();
    final var exam = ClerkExamDTO.builder().language(session.getLanguage()).level(session.getLevel()).build();

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

    final var freeRegistrationCreatedAt = Optional
      .ofNullable(registration.getFreeRegistration())
      .map(FreeRegistration::getCreatedAt);

    final var paidAt = latestExamPayment.map(ExamPayment::getPaidAt);
    final var registrationDate = paidAt.or(() -> freeRegistrationCreatedAt);

    return ClerkCustomerRegistrationDTO
      .builder()
      .examDate(examDate)
      .exam(exam)
      .examLocation(examLocation)
      .registrationState(registration.getState())
      .examPaymentPaidAt(paidAt)
      .registrationDate(registrationDate)
      .kind(registration.getKind())
      .liftedFromQueueAt(Optional.ofNullable(registration.getLiftedFromQueueAt()))
      .expiresAt(Optional.ofNullable(registration.getExpiresAt()))
      .build();
  }

  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) {
    var personDTO = PersonToDTO(personRepository.getByOid(oid));
    var registrationsDTOs = registrationRepository.getByPersonOid(oid).stream().map(this::RegistrationToDTO).toList();
    return ClerkCustomerDetailsDTO.builder().person(personDTO).registrations(registrationsDTOs).build();
  }

  @Transactional(readOnly = true)
  public Page<ClerkCustomerSummaryDTO> searchClerkCustomers(Pageable pageable) {
    final Page<Person> personPage = personRepository.findAll(pageable);

    final List<ClerkCustomerSummaryDTO> content = personPage
      .getContent()
      .stream()
      .map(person ->
        ClerkCustomerSummaryDTO
          .builder()
          .person(PersonToDTO(person))
          .registrationsCount(registrationRepository.getByPersonOid(person.getOid()).size())
          .build()
      )
      .toList();

    return new PageImpl<>(content, pageable, personPage.getTotalElements());
  }
}
