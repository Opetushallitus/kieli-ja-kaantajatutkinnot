package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.EnrollmentGradeDTO;
import fi.oph.vkt.api.dto.MunicipalityDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerExamEventDTO;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.Municipality;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import java.util.List;

public class ExaminerUtil {

  public static MunicipalityDTO toMunicipalityDTO(final Municipality municipality) {
    return MunicipalityDTO.builder().code(municipality.getCode()).build();
  }

  public static ExaminerContactRequestDTO toContactRequestDTO(final EnrollmentAppointment enrollmentAppointment) {
    return ExaminerContactRequestDTO
      .builder()
      .id(enrollmentAppointment.getId())
      .firstName(enrollmentAppointment.getFirstName())
      .lastName(enrollmentAppointment.getLastName())
      .build();
  }

  public static ExaminerExamEventDTO toExaminerExamEventWithoutEnrollmentsDTO(
    final ExaminerExamEvent examinerExamEvent
  ) {
    return ExaminerExamEventDTO
      .builder()
      .id(examinerExamEvent.getId())
      .version(examinerExamEvent.getVersion())
      .date(examinerExamEvent.getDate())
      .language(examinerExamEvent.getLanguage())
      .isHidden(examinerExamEvent.isHidden())
      .municipality(toMunicipalityDTO(examinerExamEvent.getMunicipality()))
      .location(examinerExamEvent.getLocation())
      .examTime(examinerExamEvent.getExamTime())
      .otherInformation(examinerExamEvent.getOtherInformation())
      .registrationCloses(examinerExamEvent.getRegistrationCloses())
      .maxParticipants(examinerExamEvent.getMaxParticipants())
      .enrollments(List.of())
      .build();
  }

  public static ExaminerExamEventDTO toExaminerExamEventDTO(
    final ExaminerExamEvent examinerExamEvent,
    final String baseUrlAPI
  ) {
    return ExaminerExamEventDTO
      .builder()
      .id(examinerExamEvent.getId())
      .version(examinerExamEvent.getVersion())
      .date(examinerExamEvent.getDate())
      .language(examinerExamEvent.getLanguage())
      .isHidden(examinerExamEvent.isHidden())
      .municipality(toMunicipalityDTO(examinerExamEvent.getMunicipality()))
      .location(examinerExamEvent.getLocation())
      .examTime(examinerExamEvent.getExamTime())
      .otherInformation(examinerExamEvent.getOtherInformation())
      .registrationCloses(examinerExamEvent.getRegistrationCloses())
      .maxParticipants(examinerExamEvent.getMaxParticipants())
      .enrollments(
        examinerExamEvent
          .getEnrollments()
          .stream()
          .map(e -> ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(e, baseUrlAPI))
          .toList()
      )
      .build();
  }

  public static ExaminerDetailsDTO toExaminerDetailsDTO(
    final Examiner examiner,
    final List<EnrollmentAppointment> enrollmentAppointments,
    final String baseUrlAPI
  ) {
    return ExaminerDetailsDTO
      .builder()
      .id(examiner.getId())
      .version(examiner.getVersion())
      .oid(examiner.getOid())
      .lastName(examiner.getLastName())
      .firstName(examiner.getFirstName())
      .email(examiner.getEmail())
      .phoneNumber(examiner.getPhoneNumber())
      .municipalities(examiner.getMunicipalities().stream().map(ExaminerUtil::toMunicipalityDTO).toList())
      .isPublic(examiner.isPublic())
      .examLanguageFinnish(examiner.isExamLanguageFinnish())
      .examLanguageSwedish(examiner.isExamLanguageSwedish())
      .examEvents(examiner.getExamEvents().stream().map(e -> toExaminerExamEventDTO(e, baseUrlAPI)).toList())
      .contactRequests(enrollmentAppointments.stream().map(ExaminerUtil::toContactRequestDTO).toList())
      .build();
  }

  private static EnrollmentGradeDTO createGradeDTO(final EnrollmentGradeType grade, final String comment) {
    return grade == null ? null : EnrollmentGradeDTO.builder().grade(grade).comment(comment).build();
  }

  public static ExaminerEnrollmentGradesDTO createGradesDTO(final EnrollmentGrade enrollmentGrade) {
    return ExaminerEnrollmentGradesDTO
      .builder()
      .version(enrollmentGrade.getVersion())
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
}
