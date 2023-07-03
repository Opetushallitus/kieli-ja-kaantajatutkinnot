package fi.oph.vkt.view;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
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
    return ExamEventXlsxDataRow
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
      .country(enrollment.getCountry())
      .build();
  }

  private static String statusToText(final EnrollmentStatus status) {
    return switch (status) {
      case PAID -> "Maksettu";
      case SHIFTED_FROM_QUEUE -> "Siirretty jonosta tutkintoon";
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
