package fi.oph.yki.service;

import fi.oph.yki.api.dto.PublicExamSessionLocationDTO;
import fi.oph.yki.api.dto.PublicPersonContactUpdateDTO;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.api.dto.PublicPersonRegistrationDTO;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamPayment;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.ExamSessionLocation;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationEvaluation;
import fi.oph.yki.model.type.PaymentState;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.repository.PersonRegistrationStatusProjection;
import fi.oph.yki.repository.PersonRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class PublicPersonService {

  private final PersonRepository personRepository;

  private final RegistrationRepository registrationRepository;

  private final PersonService personService;

  private static PublicExamSessionLocationDTO toDTO(final ExamSessionLocation location) {
    return PublicExamSessionLocationDTO
      .builder()
      .name(location.getName())
      .streetAddress(location.getStreetAddress())
      .postOffice(location.getPostOffice())
      .zip(location.getZip())
      .otherLocationInfo(location.getOtherLocationInfo())
      .extraInformation(location.getExtraInformation())
      .lang(location.getLang())
      .build();
  }

  private static PublicPersonRegistrationDTO toDTO(
    final Registration registration,
    final PersonRegistrationStatusProjection status
  ) {
    final ExamSession examSession = registration.getExamSession();
    final ExamDate examDate = examSession.getExamDate();
    final LocalDateTime paidAt = registration
      .getExamPayments()
      .stream()
      .filter(p -> p.getState() == PaymentState.PAID)
      .map(ExamPayment::getPaidAt)
      .findFirst()
      .orElse(null);
    final Long positionInQueue = registration.getKind() == RegistrationKind.QUEUE ? status.getPositionInQueue() : null;

    return PublicPersonRegistrationDTO
      .builder()
      .id(registration.getId())
      .examSessionId(examSession.getId())
      .state(registration.getState())
      .kind(registration.getKind())
      .partialExamType(registration.getPartialExamType())
      .examDate(examDate.getExamDate())
      .languageCode(examSession.getLanguage())
      .levelCode(examSession.getLevel())
      .type(examSession.getType())
      .startTimeReadListen(examSession.getStartTimeReadListen())
      .startTimeSpeakWrite(examSession.getStartTimeSpeakWrite())
      .registrationStartDate(examDate.getRegistrationStartDate())
      .registrationEndDate(examDate.getRegistrationEndDate())
      .evaluationState(
        Optional.ofNullable(registration.getEvaluation()).map(RegistrationEvaluation::getState).orElse(null)
      )
      .location(examSession.getLocations().stream().map(PublicPersonService::toDTO).toList())
      .paidAt(paidAt)
      .expiresAt(Optional.ofNullable(registration.getExpiresAt()).map(LocalDateTime::toLocalDate).orElse(null))
      .examFee(registration.getExamFee())
      .isTransferable(status.getTransferable())
      .isCancellable(status.getCancellable())
      .isTransfered(registration.getIsTransfered())
      .liftedFromQueueAt(registration.getLiftedFromQueueAt())
      .isFreeRegistration(registration.getFreeRegistration() != null)
      .positionInQueue(positionInQueue)
      .build();
  }

  private List<PublicPersonRegistrationDTO> getRegistrations(final String oid) {
    final LocalDate examDateFrom = LocalDate.now(ZoneId.of("Europe/Helsinki")).minusYears(1);
    final List<Registration> registrations = registrationRepository.getByPersonOidAndExamDateFrom(oid, examDateFrom);
    if (registrations.isEmpty()) {
      return List.of();
    }

    final Map<Long, PersonRegistrationStatusProjection> statuses = registrationRepository
      .getPersonRegistrationStatuses(registrations.stream().map(Registration::getId).toList())
      .stream()
      .collect(Collectors.toMap(PersonRegistrationStatusProjection::getId, Function.identity()));

    return registrations.stream().map(r -> toDTO(r, statuses.get(r.getId()))).toList();
  }

  @Transactional(readOnly = true)
  public PublicPersonDTO getPerson(final String oid) {
    final Person person = personRepository.getByOid(oid);
    if (person == null || person.getEmail() == null) {
      throw new NotFoundException(String.format("Person not found or has no email, oid: %s", oid));
    }

    return PublicPersonDTO
      .builder()
      .oid(person.getOid())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .email(person.getEmail())
      .phoneNumber(person.getPhoneNumber())
      .streetAddress(person.getSteetAddress())
      .postOffice(person.getPostOffice())
      .zip(person.getZip())
      .countryCode(person.getCountryCode())
      .registrations(getRegistrations(oid))
      .build();
  }

  @Transactional
  public void updateContactDetails(final String oid, final PublicPersonContactUpdateDTO dto) {
    personService.updateContactDetails(oid, dto);
  }
}
