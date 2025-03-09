package fi.oph.vkt.view;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.KoskiEducations;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.HetuUtils;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

public class ExamEventXlsxDataRowUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
  private static final DateTimeFormatter DATE_LOCAL_FORMAT = DateTimeFormatter.ofPattern("d.M.yyyy");

  private static ExamEventXlsxData createExamEventExcel(
    final ExamEvent examEvent,
    final List<ExamEventXlsxDataRow> excelDataRows
  ) {
    return ExamEventXlsxData
      .builder()
      .date(DATE_FORMAT.format(examEvent.getDate()))
      .language(examEvent.getLanguage().name())
      .rows(excelDataRows)
      .build();
  }

  private static ExaminerExamEventXlsxData createExamEventExcel(
    final ExaminerExamEvent examEvent,
    final List<ExaminerExamEventXlsxDataRow> excelDataRows
  ) {
    return ExaminerExamEventXlsxData
      .builder()
      .date(DATE_FORMAT.format(examEvent.getDate()))
      .language(examEvent.getLanguage().name())
      .rows(excelDataRows)
      .build();
  }

  public static ExamEventXlsxData createExcelData(
    final ExamEvent examEvent,
    final List<Enrollment> enrollments,
    final Map<String, PersonalData> personalDatas
  ) {
    final List<ExamEventXlsxDataRow> excelDataRows = enrollments
      .stream()
      .map(enrollment -> createDataRow(enrollment, enrollment.getPerson(), personalDatas))
      .toList();

    return ExamEventXlsxData
      .builder()
      .date(DATE_FORMAT.format(examEvent.getDate()))
      .language(examEvent.getLanguage().name())
      .rows(excelDataRows)
      .build();
  }

  public static ExaminerExamEventXlsxData createExcelData(
    final ExaminerExamEvent examEvent,
    final List<EnrollmentAppointment> enrollments
  ) {
    final List<ExaminerExamEventXlsxDataRow> excelDataRows = enrollments
      .stream()
      .map(enrollment -> createDataRow(enrollment, enrollment.getPerson()))
      .toList();

    return createExamEventExcel(examEvent, excelDataRows);
  }

  private static String parseBirthdate(final String ssn) {
    if (ssn.isEmpty() || !HetuUtils.hetuIsValid(ssn)) {
      return "";
    }

    final LocalDate birthdate = HetuUtils.dateFromHetu(ssn);

    return DATE_LOCAL_FORMAT.format(birthdate);
  }

  private static ExaminerExamEventXlsxDataRow createDataRow(
    final EnrollmentAppointment enrollment,
    final Person person
  ) {
    return ExaminerExamEventXlsxDataRow
      .builder()
      .enrollmentTime(DATETIME_FORMAT.format(enrollment.getCreatedAt()))
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .previousEnrollment(boolToInt(enrollment.isHasPreviousEnrollment()))
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

  private static ExamEventXlsxDataRow createDataRow(
    final Enrollment enrollment,
    final Person person,
    final Map<String, PersonalData> personalDatas
  ) {
    final String oid = person.getOid();
    final PersonalData personalData = personalDatas.get(oid);
    final String ssn = oid != null && personalData != null ? personalData.getSsn() : null;

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
      .birthdate(ssn != null ? parseBirthdate(ssn) : "")
      .ssn(ssn != null ? ssn : "")
      .digitalCertificateConsent(boolToInt(enrollment.isDigitalCertificateConsent()))
      .street(enrollment.getStreet())
      .postalCode(enrollment.getPostalCode())
      .town(enrollment.getTown())
      .country(enrollment.getCountry());

    if (enrollment.getFreeEnrollment() != null) {
      FreeEnrollment freeEnrollment = enrollment.getFreeEnrollment();
      FreeEnrollmentSource freeEnrollmentSource = freeEnrollment.getSource();
      builder = builder.freeEnrollmentSource(freeEnrollmentSource);
      if (freeEnrollmentSource == FreeEnrollmentSource.KOSKI) {
        builder = builder.isFree(boolToInt(true));
      } else {
        Boolean approved = freeEnrollment.getApproved();
        if (approved != null) {
          builder = builder.isFree(boolToInt(approved));
        }
      }
      if (freeEnrollment.getKoskiEducations() != null) {
        KoskiEducations koskiEducations = freeEnrollment.getKoskiEducations();
        builder =
          builder
            .matriculationExam(boolToInt(koskiEducations.getMatriculationExam()))
            .dia(boolToInt(koskiEducations.getDia()))
            .eb(boolToInt(koskiEducations.getEb()))
            .higherEducationConcluded(boolToInt(koskiEducations.getHigherEducationConcluded()))
            .higherEducationEnrolled(boolToInt(koskiEducations.getHigherEducationEnrolled()))
            .otherEducation(boolToInt(koskiEducations.getOther()));
      } else {
        FreeEnrollmentType type = freeEnrollment.getType();
        boolean matriculationExam = type == FreeEnrollmentType.MatriculationExam;
        boolean dia = type == FreeEnrollmentType.DIA;
        boolean eb = type == FreeEnrollmentType.EB;
        boolean higherEducationConcluded = type == FreeEnrollmentType.HigherEducationConcluded;
        boolean higherEducationEnrolled = type == FreeEnrollmentType.HigherEducationEnrolled;
        boolean otherEducation = type == FreeEnrollmentType.Other;
        builder =
          builder
            .matriculationExam(boolToInt(matriculationExam))
            .dia(boolToInt(dia))
            .eb(boolToInt(eb))
            .higherEducationConcluded(boolToInt(higherEducationConcluded))
            .higherEducationEnrolled(boolToInt(higherEducationEnrolled))
            .otherEducation(boolToInt(otherEducation));
      }
    } else {
      builder =
        builder
          .isFree(boolToInt(false))
          .matriculationExam(boolToInt(false))
          .dia(boolToInt(false))
          .eb(boolToInt(false))
          .higherEducationConcluded(boolToInt(false))
          .higherEducationEnrolled(boolToInt(false))
          .otherEducation(boolToInt(false));
    }
    return builder.build();
  }

  private static String statusToText(final EnrollmentAppointmentStatus status) {
    return switch (status) {
      case COMPLETED -> "Maksettu";
      case CANCELED -> "Peruttu";
      case EXPECTING_PAYMENT -> "Odottaa maksua";
      case WAITING_AUTHENTICATION -> "Odottaa tunnistautumista";
      case CANCELED_PAYMENT -> "Maksu peruutettu";
      case ENROLLMENT_CREATED -> "Ilmoittautuminen luotu (tunnistautumislinkkiä ei vielä lähetetty)";
      case CONTACT_CREATED -> "Yhteydenotto luotu";
    };
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
