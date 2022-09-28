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
import fi.oph.vkt.util.DateUtil;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkExamEventService {

  @Resource
  private final ExamEventRepository examEventRepository;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ClerkExamEventListDTO> list() {
    final LocalDate now = LocalDate.now();
    final List<ClerkExamEventProjection> examEventProjections = examEventRepository.listClerkExamEventProjections();

    final List<ClerkExamEventListDTO> examEventListDTOs = examEventProjections
      .stream()
      .map(e -> {
        final boolean isPublic = e.isVisible() && DateUtil.isBeforeOrEqualTo(now, e.registrationCloses());

        return ClerkExamEventListDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .level(e.level())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .isPublic(isPublic)
          .build();
      })
      .sorted(Comparator.comparing(ClerkExamEventListDTO::date).thenComparing(ClerkExamEventListDTO::language))
      .toList();

    auditService.logOperation(VktOperation.LIST_EXAM_EVENTS);
    return examEventListDTOs;
  }

  @Transactional(readOnly = true)
  public ClerkExamEventDTO getExamEvent(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);
    final List<Enrollment> enrollments = examEvent.getEnrollments();

    // TODO: fetch personal datas by onrIds
    final List<String> personOnrIds = enrollments.stream().map(Enrollment::getPerson).map(Person::getOnrId).toList();
    final List<ClerkEnrollmentDTO> enrollmentDTOs = enrollments.stream().map(this::getEnrollmentDTO).toList();

    final ClerkExamEventDTO examEventDTO = ClerkExamEventDTO
      .builder()
      .id(examEvent.getId())
      .version(examEvent.getVersion())
      .language(examEvent.getLanguage())
      .level(examEvent.getLevel())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses())
      .isVisible(examEvent.isVisible())
      .maxParticipants(examEvent.getMaxParticipants())
      .enrollments(enrollmentDTOs)
      .build();

    auditService.logById(VktOperation.GET_EXAM_EVENT, examEventId);
    return examEventDTO;
  }

  // TODO: personalData as second parameter
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

  // TODO: personalData as second parameter
  private ClerkPersonDTO getClerkPersonDTO(final Person person) {
    return ClerkPersonDTO
      .builder()
      .id(person.getId())
      .version(person.getVersion())
      .identityNumber("000000-0000")
      .lastName("Tester")
      .firstName("Foo Bar")
      .nickName("Foo")
      .email("foo.tester@vkt.invalid")
      .phoneNumber("+358401234567")
      .street(null)
      .postalCode(null)
      .town(null)
      .country(null)
      .build();
  }

  // TODO: implement
  private List<ClerkExamPaymentDTO> getClerkExamPaymentDTOs(final Enrollment enrollment) {
    return List.of();
  }
}
