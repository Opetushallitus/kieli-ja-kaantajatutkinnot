package fi.oph.yki.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.yki.api.dto.clerk.ClerkCustomerDetailsDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerPersonDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerRegistrationDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSearchRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkCustomerSummaryDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamDTO;
import fi.oph.yki.api.dto.clerk.ClerkExamLocationDTO;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.audit.YkiOperation;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.FreeRegistration;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.PersonSearchProjection;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.HetuUtils;
import fi.vm.sade.auditlog.Target;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
  private final AuditService auditService;
  private static final Logger LOG = LoggerFactory.getLogger(ClerkCustomerService.class);

  private ClerkCustomerRegistrationDTO registrationToDTO(final Registration registration) {
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

  private String getIdentityNumber(Person person) {
    try {
      return onrService.getPersonalData(person.getOid()).getIdentityNumber();
    } catch (final Exception e) {
      LOG.error("Unable to get identity number from ONR for oid: {}", person.getOid(), e);
      return null;
    }
  }

  @Transactional(readOnly = true)
  public ClerkCustomerDetailsDTO getClerkCustomerDetails(final String oid) {
    auditService.logClerkById(YkiOperation.GET_CUSTOMER_DETAILS, oid);
    final var person = personRepository.getByOid(oid);

    final var personDTO = ClerkCustomerPersonDTO
      .builder()
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .ssn(getIdentityNumber(person))
      .oid(person.getOid())
      .nationalityCode(person.getNationalityCode())
      .phoneNumber(person.getPhoneNumber())
      .streetAddress(person.getSteetAddress())
      .postOffice(person.getPostOffice())
      .zip(person.getZip())
      .email(person.getEmail())
      .build();

    final var registrationsDTOs = registrationRepository
      .getByPersonOid(oid)
      .stream()
      .map(this::registrationToDTO)
      .toList();

    return ClerkCustomerDetailsDTO.builder().person(personDTO).registrations(registrationsDTOs).build();
  }

  private Page<PersonSearchProjection> searchPersons(
    final Pageable pageable,
    final ClerkCustomerSearchRequestDTO request
  ) throws ExecutionException, InterruptedException, JsonProcessingException, RuntimeException {
    final var personQuery = request.personQuery() == null ? "" : request.personQuery();
    final var queries = personQuery.split(" ");

    final var possibleHetu = HetuUtils.findValidHetu(queries);
    if (possibleHetu.isPresent()) {
      final var hetu = possibleHetu.get();

      final var onrDtoOptional = onrService.findPersonalDataByIdentityNumber(hetu);
      if (onrDtoOptional.isEmpty()) {
        return new PageImpl<>(List.of());
      }

      return personRepository.searchPersons(
        pageable,
        onrDtoOptional.get().getOidHenkilo(),
        request.organizerId(),
        request.examDateId(),
        request.languageCode(),
        request.levelCode()
      );
    }

    // Normal query that has no SSN
    return personRepository.searchPersons(
      pageable,
      request.personQuery(),
      request.organizerId(),
      request.examDateId(),
      request.languageCode(),
      request.levelCode()
    );
  }

  private Map<String, String> getOidToHetuMap(List<String> oids) {
    try {
      return onrService
        .listPersonDetails(oids)
        .stream()
        .filter(dto -> dto.getIdentityNumber() != null)
        .collect(Collectors.toMap(PersonalDataDTO::getOidHenkilo, PersonalDataDTO::getIdentityNumber));
    } catch (final Exception e) {
      LOG.error("Unable to get identity numbers from ONR", e);
      return Map.of();
    }
  }

  private Target toTarget(final ClerkCustomerSearchRequestDTO request) {
    final var targetBuilder = new Target.Builder();
    final var personQuery = request.personQuery() == null ? "" : request.personQuery();
    final var containsHetu = HetuUtils.findValidHetu(personQuery.split(" ")).isPresent();

    targetBuilder.setField("containsHetu", Boolean.toString(containsHetu));

    if (!containsHetu && !personQuery.isEmpty()) {
      targetBuilder.setField("personQuery", personQuery);
    }
    if (request.organizerId() != null) {
      targetBuilder.setField("organizerId", Long.toString(request.organizerId()));
    }
    if (request.examDateId() != null) {
      targetBuilder.setField("examDateId", Long.toString(request.examDateId()));
    }
    if (request.languageCode() != null) {
      targetBuilder.setField("languageCode", request.languageCode());
    }
    if (request.levelCode() != null) {
      targetBuilder.setField("levelCode", request.levelCode());
    }

    return targetBuilder.build();
  }

  @Transactional(readOnly = true)
  public Page<ClerkCustomerSummaryDTO> searchClerkCustomers(
    final Pageable pageable,
    final ClerkCustomerSearchRequestDTO request
  ) throws ExecutionException, InterruptedException, JsonProcessingException, RuntimeException {
    auditService.logClerkWithTarget(YkiOperation.SEARCH_CUSTOMERS, toTarget(request));

    final var personsPage = searchPersons(pageable, request);
    final var oids = personsPage.getContent().stream().map(PersonSearchProjection::oid).toList();
    final var hetuByOid = getOidToHetuMap(oids);

    return personsPage.map(person ->
      ClerkCustomerSummaryDTO
        .builder()
        .person(
          ClerkCustomerPersonDTO
            .builder()
            .firstName(person.firstName())
            .lastName(person.lastName())
            .ssn(hetuByOid.get(person.oid()))
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
