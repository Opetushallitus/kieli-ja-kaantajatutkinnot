package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamPaymentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkPersonDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.ClerkExamEventProjection;
import fi.oph.vkt.repository.ExamEventRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
          .isHidden(!e.isVisible())
          .build()
      )
      .sorted(Comparator.comparing(ClerkExamEventListDTO::date).thenComparing(ClerkExamEventListDTO::language))
      .toList();

    auditService.logOperation(VktOperation.LIST_EXAM_EVENTS);
    return examEventListDTOs;
  }

  @Transactional(readOnly = true)
  public ClerkExamEventDTO getExamEvent(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    final List<ClerkEnrollmentDTO> enrollmentDTOs = enrollments.stream().map(this::getEnrollmentDTO).toList();

    final ClerkExamEventDTO examEventDTO = ClerkExamEventDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .language(examEvent.getLanguage())
      .level(examEvent.getLevel())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .isHidden(!examEvent.isVisible())
      .maxParticipants(examEvent.getMaxParticipants())
      .enrollments(enrollmentDTOs)
      .build();

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  private ClerkEnrollmentDTO getEnrollmentDTO(final Enrollment enrollment) {
    final ClerkPersonDTO personDTO = getClerkPersonDTO(enrollment.getPerson());
    final List<ClerkExamPaymentDTO> paymentDTOs = getClerkExamPaymentDTOs(enrollment);

    return ClerkEnrollmentDTO
      .builder()
      .id(enrollment.getId())
      .version(enrollment.getVersion())
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
      .email(person.getEmail())
      .phoneNumber(person.getPhoneNumber())
      .street(person.getStreet())
      .postalCode(person.getPostalCode())
      .town(person.getTown())
      .country(person.getCountry())
      .build();
  }

  // TODO: implement
  private List<ClerkExamPaymentDTO> getClerkExamPaymentDTOs(final Enrollment enrollment) {
    return List.of();
  }
}
