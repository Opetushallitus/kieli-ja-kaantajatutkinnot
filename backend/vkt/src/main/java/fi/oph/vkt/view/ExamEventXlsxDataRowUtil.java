package fi.oph.vkt.view;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.KoskiEducations;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExamEventXlsxDataRowUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  public static ExamEventXlsxData createExcelData(final ExamEvent examEvent, final List<Enrollment> enrollments) {
    final List<ExamEventXlsxDataRow> excelDataRows = enrollments
      .stream()
      .map(enrollment -> createDataRow(enrollment, enrollment.getPerson()))
      .toList();

    return ExamEventXlsxData
      .builder()
      .date(DATE_FORMAT.format(examEvent.getDate()))
      .language(examEvent.getLanguage().name())
      .rows(excelDataRows)
      .build();
  }

  private static ExamEventXlsxDataRow createDataRow(final Enrollment enrollment, final Person person) {
    ExamEventXlsxDataRow.ExamEventXlsxDataRowBuilder builder = ExamEventXlsxDataRow
      .builder()
      .enrollmentTime(DATETIME_FORMAT.format(enrollment.getCreatedAt()))
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .previousEnrollment(enrollment.getPreviousEnrollment())
      .status(statusToText(enrollment.getStatus()))
      .textualSkill(boolToInt(enrollment.isTextualSkill()))
      .oralSkill(boolToInt(enrollment.isOralSkill()))
      .understandingSkill(boolToInt(enrollment.isUnderstandingSkill()))
      .writing(boolToInt(enrollment.isWritingPartialExam()))
      .readingComprehension(boolToInt(enrollment.isReadingComprehensionPartialExam()))
      .speaking(boolToInt(enrollment.isSpeakingPartialExam()))
      .speechComprehension(boolToInt(enrollment.isSpeechComprehensionPartialExam()))
      .email(enrollment.getEmail())
      .phoneNumber(enrollment.getPhoneNumber())
      .digitalCertificateConsent(boolToInt(enrollment.isDigitalCertificateConsent()))
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry());

    if (enrollment.getFreeEnrollment() != null) {
      FreeEnrollment freeEnrollment = enrollment.getFreeEnrollment();
      builder =
        builder
          .isFree(boolToInt(freeEnrollment.getSource() == FreeEnrollmentSource.KOSKI || freeEnrollment.getApproved()))
          .freeEnrollmentSource(freeEnrollment.getSource());
      if (freeEnrollment.getKoskiEducations() != null) {
        KoskiEducations koskiEducations = freeEnrollment.getKoskiEducations();
        builder =
          builder
            .matriculationExam(boolToInt(koskiEducations.getMatriculationExam()))
            .dia(boolToInt(koskiEducations.getDia()))
            .eb(boolToInt(koskiEducations.getEb()))
            .higherEducationConcluded(boolToInt(koskiEducations.getHigherEducationConcluded()))
            .higherEducationEnrolled(boolToInt(koskiEducations.getHigherEducationEnrolled()));
      } else {
        FreeEnrollmentType type = freeEnrollment.getType();
        boolean matriculationExam = type == FreeEnrollmentType.MatriculationExam;
        boolean dia = type == FreeEnrollmentType.DIA;
        boolean eb = type == FreeEnrollmentType.EB;
        boolean higherEducationConcluded = type == FreeEnrollmentType.HigherEducationConcluded;
        boolean higherEducationEnrolled = type == FreeEnrollmentType.HigherEducationEnrolled;
        builder =
          builder
            .matriculationExam(boolToInt(matriculationExam))
            .dia(boolToInt(dia))
            .eb(boolToInt(eb))
            .higherEducationConcluded(boolToInt(higherEducationConcluded))
            .higherEducationEnrolled(boolToInt(higherEducationEnrolled));
      }
    } else {
      builder =
        builder
          .isFree(boolToInt(false))
          .matriculationExam(boolToInt(false))
          .dia(boolToInt(false))
          .eb(boolToInt(false))
          .higherEducationConcluded(boolToInt(false))
          .higherEducationEnrolled(boolToInt(false));
    }
    return builder.build();
  }

  private static String statusToText(final EnrollmentStatus status) {
    return switch (status) {
      case COMPLETED -> "Maksettu";
      case AWAITING_PAYMENT -> "Siirretty jonosta tutkintoon tai maksuttomuus hylättiin";
      case AWAITING_APPROVAL -> "Odottaa maksuttomuuden hyväksyntää";
      case QUEUED -> "Jonossa";
      case CANCELED -> "Peruttu";
      case EXPECTING_PAYMENT_UNFINISHED_ENROLLMENT -> "Odottaa maksua (keskeneräinen ilmoittautuminen)";
      case CANCELED_UNFINISHED_ENROLLMENT -> "Keskeytetty (keskeneräinen ilmoittautuminen)";
    };
  }

  private static Integer boolToInt(final Boolean bool) {
    return bool ? 1 : 0;
  }
}
