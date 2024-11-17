package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import fi.oph.vkt.api.dto.clerk.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentGradesRepository;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final EnrollmentGradesRepository enrollmentGradesRepository;
  private final ExaminerExamEventRepository examinerExamEventRepository;
  private final Environment environment;

  @Transactional
  public ExaminerEnrollmentAppointmentDTO updateAppointment(final ExaminerEnrollmentAppointmentUpdateDTO dto) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(dto.id());
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    enrollmentAppointment.assertVersion(dto.version());

    if (dto.examEvent() != null) {
      final ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.getReferenceById(dto.examEvent());
      enrollmentAppointment.setExaminerExamEvent(examinerExamEvent);
    }

    copyDtoFieldsToEnrollment(enrollmentAppointment, dto);
    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public ExaminerEnrollmentGradesDTO getAppointmentGrades(final long enrollmentAppointmentId) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    final Optional<EnrollmentGrade> enrollmentGradeOptional = enrollmentGradesRepository.findByEnrollmentAppointment(
      enrollmentAppointment
    );

    return enrollmentGradeOptional.map(this::createGradesDTO).orElse(null);
  }

  @Transactional
  public ExaminerEnrollmentGradesDTO upsertAppointmentGrades(
    final long enrollmentAppointmentId,
    final ExaminerEnrollmentGradesDTO dto
  ) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(
      enrollmentAppointmentId
    );
    final Optional<EnrollmentGrade> enrollmentGradeOptional = enrollmentGradesRepository.findByEnrollmentAppointment(
      enrollmentAppointment
    );
    final EnrollmentGrade enrollmentGrade = enrollmentGradeOptional.orElseGet(EnrollmentGrade::new);

    if (dto.speakingPartialExam() != null) {
      enrollmentGrade.setSpeakingPartialExamGrade(dto.speakingPartialExam().grade());
      enrollmentGrade.setSpeakingPartialExamComment(dto.speakingPartialExam().comment());
    } else {
      enrollmentGrade.setSpeakingPartialExamGrade(null);
      enrollmentGrade.setSpeakingPartialExamComment(null);
    }

    if (dto.writingPartialExam() != null) {
      enrollmentGrade.setWritingPartialExamGrade(dto.writingPartialExam().grade());
      enrollmentGrade.setWritingPartialExamComment(dto.writingPartialExam().comment());
    } else {
      enrollmentGrade.setWritingPartialExamGrade(null);
      enrollmentGrade.setWritingPartialExamComment(null);
    }

    if (dto.speechComprehensionPartialExam() != null) {
      enrollmentGrade.setSpeechComprehensionPartialExamGrade(dto.speechComprehensionPartialExam().grade());
      enrollmentGrade.setSpeechComprehensionPartialExamComment(dto.speechComprehensionPartialExam().comment());
    } else {
      enrollmentGrade.setSpeechComprehensionPartialExamGrade(null);
      enrollmentGrade.setSpeechComprehensionPartialExamComment(null);
    }

    if (dto.readingComprehensionPartialExam() != null) {
      enrollmentGrade.setReadingComprehensionPartialExamGrade(dto.readingComprehensionPartialExam().grade());
      enrollmentGrade.setReadingComprehensionPartialExamComment(dto.readingComprehensionPartialExam().comment());
    } else {
      enrollmentGrade.setReadingComprehensionPartialExamGrade(null);
      enrollmentGrade.setReadingComprehensionPartialExamComment(null);
    }

    enrollmentGradesRepository.saveAndFlush(enrollmentGrade);

    enrollmentAppointment.setGrade(enrollmentGrade);
    enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);

    return createGradesDTO(enrollmentGrade);
  }

  private ExaminerEnrollmentGradesDTO createGradesDTO(final EnrollmentGrade enrollmentGrade) {
    return ExaminerEnrollmentGradesDTO
      .builder()
      .writingPartialExam(
        createGradeDTO(enrollmentGrade.getWritingPartialExamGrade(), enrollmentGrade.getWritingPartialExamComment())
      )
      .readingComprehensionPartialExam(
        createGradeDTO(
          enrollmentGrade.getReadingComprehensionPartialExamGrade(),
          enrollmentGrade.getReadingComprehensionPartialExamComment()
        )
      )
      .speakingPartialExam(
        createGradeDTO(enrollmentGrade.getSpeakingPartialExamGrade(), enrollmentGrade.getSpeakingPartialExamComment())
      )
      .speechComprehensionPartialExam(
        createGradeDTO(
          enrollmentGrade.getSpeechComprehensionPartialExamGrade(),
          enrollmentGrade.getSpeechComprehensionPartialExamComment()
        )
      )
      .build();
  }

  private EnrollmentGradeDTO createGradeDTO(final EnrollmentGradeType grade, final String comment) {
    return grade == null ? null : EnrollmentGradeDTO.builder().grade(grade).comment(comment).build();
  }
}
