package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.integration.RegisterEnrollmentDTO;
import fi.oph.vkt.api.dto.integration.RegistryPersonDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.PersonUtil;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterEnrollmentService {

  private final EnrollmentRepository enrollmentRepository;

  @Transactional(readOnly = true)
  public List<RegisterEnrollmentDTO> list() {
    final List<Enrollment> enrollments = enrollmentRepository.findAllByStatusInAndDeletedAtIsNull(
      List.of(EnrollmentStatus.CANCELED, EnrollmentStatus.COMPLETED)
    );

    return enrollments
      .stream()
      .map(enrollment -> {
        final ExamEvent examEvent = enrollment.getExamEvent();
        final long openings = ExamEventUtil.getOpenings(examEvent);
        final RegistryPersonDTO personDTO = PersonUtil.createRegistryPersonDTO(enrollment.getPerson());
        final PublicExamEventDTO examEventDTO = PublicExamEventDTO
          .builder()
          .id(examEvent.getId())
          .language(examEvent.getLanguage())
          .date(examEvent.getDate())
          .registrationCloses(examEvent.getRegistrationCloses().toLocalDate())
          .registrationOpens(examEvent.getRegistrationOpens().toLocalDate())
          .openings(openings)
          .hasCongestion(false)
          .isOpen(ExamEventUtil.isOpen(examEvent))
          .build();

        return RegisterEnrollmentDTO
          .builder()
          .id(enrollment.getId())
          .oralSkill(enrollment.isOralSkill())
          .textualSkill(enrollment.isTextualSkill())
          .understandingSkill(enrollment.isUnderstandingSkill())
          .speakingPartialExam(enrollment.isSpeakingPartialExam())
          .speechComprehensionPartialExam(enrollment.isSpeechComprehensionPartialExam())
          .writingPartialExam(enrollment.isWritingPartialExam())
          .readingComprehensionPartialExam(enrollment.isReadingComprehensionPartialExam())
          .status(enrollment.getStatus())
          .email(enrollment.getEmail())
          .phoneNumber(enrollment.getPhoneNumber())
          .person(personDTO)
          .examEvent(examEventDTO)
          .build();
      })
      .toList();
  }
}
