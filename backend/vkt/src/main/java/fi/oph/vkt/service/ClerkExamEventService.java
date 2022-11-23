package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventCreateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTOCommonFields;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventUpdateDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.ClerkExamEventProjection;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.DataIntegrityViolationExceptionUtil;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkExamEventService {

  private final ExamEventRepository examEventRepository;
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ClerkExamEventListDTO> list() {
    final List<ClerkExamEventProjection> examEventProjections = examEventRepository.listClerkExamEventProjections();

    final List<ClerkExamEventListDTO> examEventListDTOs = examEventProjections
      .stream()
      .map(e ->
        ClerkExamEventListDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .level(e.level())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .isHidden(e.isHidden())
          .build()
      )
      .sorted(Comparator.comparing(ClerkExamEventListDTO::date).thenComparing(ClerkExamEventListDTO::language))
      .toList();

    auditService.logOperation(VktOperation.LIST_EXAM_EVENTS);
    return examEventListDTOs;
  }

  @Transactional(readOnly = true)
  public ClerkExamEventDTO getExamEvent(final long examEventId) {
    final ClerkExamEventDTO examEventDTO = getExamEventWithoutAudit(examEventId);

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ClerkExamEventDTO getExamEventWithoutAudit(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final List<ClerkEnrollmentDTO> enrollmentDTOs = enrollments.stream().map(this::getEnrollmentDTO).toList();

    return ClerkExamEventDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .language(examEvent.getLanguage())
      .level(examEvent.getLevel())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .isHidden(examEvent.isHidden())
      .maxParticipants(examEvent.getMaxParticipants())
      .enrollments(enrollmentDTOs)
      .build();
  }

  private ClerkEnrollmentDTO getEnrollmentDTO(final Enrollment enrollment) {
    final ClerkPersonDTO personDTO = getClerkPersonDTO(enrollment.getPerson());
    final List<ClerkExamPaymentDTO> paymentDTOs = List.of(); // TODO implement

    return ClerkEnrollmentDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
      .enrollmentTime(enrollment.getCreatedAt())
      .person(personDTO)
      .oralSkill(enrollment.isOralSkill())
      .textualSkill(enrollment.isTextualSkill())
      .understandingSkill(enrollment.isUnderstandingSkill())
      .speakingPartialExam(enrollment.isSpeakingPartialExam())
      .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
      .writingPartialExam(enrollment.isWritingPartialExam())
      .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
      .status(enrollment.getStatus())
      .previousEnrollmentDate(enrollment.getPreviousEnrollmentDate())
      .digitalCertificateConsent(enrollment.isDigitalCertificateConsent())
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry())
      .payments(paymentDTOs)
      .build();
  }

  private ClerkPersonDTO getClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .id(person.getId())
      .version(person.getVersion())
      .identityNumber(person.getIdentityNumber())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();
  }

  @Transactional
  public ClerkExamEventDTO createExamEvent(final ClerkExamEventCreateDTO dto) {
    final ExamEvent examEvent = new ExamEvent();

    copyDtoFieldsToExamEvent(dto, examEvent);

    try {
      examEventRepository.saveAndFlush(examEvent);
    } catch (final DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isExamEventLanguageLevelDateUniquenessException(ex)) {
        throw new APIException(APIExceptionType.EXAM_EVENT_DUPLICATE);
      }
    }

    auditService.logById(VktOperation.CREATE_EXAM_EVENT, examEvent.getId());
    return getExamEventWithoutAudit(examEvent.getId());
  }

  @Transactional
  public ClerkExamEventDTO updateExamEvent(final ClerkExamEventUpdateDTO dto) {
    final Long id = dto.id();
    final ExamEvent examEvent = examEventRepository.getReferenceById(id);

    examEvent.assertVersion(dto.version());

    copyDtoFieldsToExamEvent(dto, examEvent);
    try {
      examEventRepository.flush();
    } catch (final DataIntegrityViolationException ex) {
      if (DataIntegrityViolationExceptionUtil.isExamEventLanguageLevelDateUniquenessException(ex)) {
        throw new APIException(APIExceptionType.EXAM_EVENT_DUPLICATE);
      }
    }

    auditService.logById(VktOperation.UPDATE_EXAM_EVENT, id);
    return getExamEventWithoutAudit(id);
  }

  private void copyDtoFieldsToExamEvent(final ClerkExamEventDTOCommonFields dto, final ExamEvent examEvent) {
    examEvent.setLanguage(dto.language());
    examEvent.setLevel(dto.level());
    examEvent.setDate(dto.date());
    examEvent.setRegistrationCloses(dto.registrationCloses());
    examEvent.setHidden(dto.isHidden());
    examEvent.setMaxParticipants(dto.maxParticipants());
  }
}
