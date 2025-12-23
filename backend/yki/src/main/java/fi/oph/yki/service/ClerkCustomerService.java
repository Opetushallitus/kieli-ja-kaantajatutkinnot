package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkCustomerDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerRegistrationDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSummaryDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamLocationDTO;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.PersonSearchResult;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {

  private final PersonRepository personRepository;
  private final RegistrationRepository registrationRepository;
  private final OnrService onrService;

  private PersonalDataDTO getPersonalData(String oid) throws RuntimeException {
    try {
      return onrService.getPersonalData(oid);
    } catch (Exception e) {
      throw new RuntimeException("Unable to get personal data from ONR with oid '" + oid + "'.", e);
    }
  }

  private ClerkCustomerRegistrationDTO registrationToDTO(Registration registration) {
    final var session = registration.getExamSession();

    final var examDate = session.getExamDate().getExamDate();
    final var exam = ClerkExamDTO.builder().language(session.getLanguage()).level(session.getLevel()).build();

    final var examLocation = session
      .getLocations()
      .stream()
      .map(location ->
        ClerkExamLocationDTO
          .builder()
          .name(location.getName())
          .municipality(location.getPostOffice())
          .lang(location.getLang())
          .build()
      )
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

  @Transactional(readOnly = true)
  public ClerkCustomerDetailsDTO getClerkCustomerDetails(String oid) {
    var person = personRepository.getByOid(oid);
    var personDTO = ClerkCustomerPersonDTO
      .builder()
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .ssn(getPersonalData(person.getOid()).getIdentityNumber())
      .oid(person.getOid())
      .nationalityCode(person.getNationalityCode())
      .phoneNumber(person.getPhoneNumber())
      .streetAddress(person.getAddress())
      .email(person.getEmail())
      .build();

    var registrationsDTOs = registrationRepository.getByPersonOid(oid).stream().map(this::registrationToDTO).toList();

    return ClerkCustomerDetailsDTO.builder().person(personDTO).registrations(registrationsDTOs).build();
  }

  @Transactional(readOnly = true)
  public Page<ClerkCustomerSummaryDTO> searchClerkCustomers(Pageable pageable, ClerkCustomerSearchRequestDTO request) {
    final var personPage = personRepository.searchPersons(
      pageable,
      request.personQuery(),
      request.organizerId(),
      request.examDateId(),
      request.languageCode(),
      request.levelCode()
    );

    return personPage.map(person ->
      ClerkCustomerSummaryDTO
        .builder()
        .person(
          ClerkCustomerPersonDTO
            .builder()
            .firstName(person.firstName())
            .lastName(person.lastName())
            .ssn(getPersonalData(person.oid()).getIdentityNumber())
            .oid(person.oid())
            .nationalityCode(person.nationalityCode())
            .phoneNumber(person.phoneNumber())
            .streetAddress(person.streetAddress())
            .email(person.email())
            .build()
        )
        .registrationsCount(person.registrationsCount() == null ? 0 : person.registrationsCount())
        .build()
    );
  }
}
