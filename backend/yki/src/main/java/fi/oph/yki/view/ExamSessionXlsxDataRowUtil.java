package fi.oph.yki.view;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ExamSessionXlsxDataRowUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  public static ExamSessionXlsxData createExcelData(final ExamSession examSession) {
    final List<ExamSessionXlsxDataRow> excelDataRows = examSession
      .getRegistrations()
      .stream()
      .filter(r -> !(r.getState().equals(RegistrationState.EXPIRED) && r.getPerson() == null))
      .map(ExamSessionXlsxDataRowUtil::createDataRow)
      .toList();

    return ExamSessionXlsxData
      .builder()
      .date(DATE_FORMAT.format(examSession.getExamDate().getExamDate()))
      .language(examSession.getLanguage())
      .rows(excelDataRows)
      .build();
  }

  private static ExamSessionXlsxDataRow createDataRow(final Registration registration) {
    final var person = registration.getPerson();

    return ExamSessionXlsxDataRow
      .builder()
      .oid(person == null ? "" : person.getOid())
      .lastName(person == null ? "" : person.getLastName())
      .firstName(person == null ? "" : person.getFirstName())
      .state(stateToText(registration))
      .type(kindToText(registration.getKind()))
      .email(person == null ? null : person.getEmail())
      .phone(person == null ? null : person.getPhoneNumber())
      .gender(person == null ? null : person.getGender())
      .nationalityCode(person == null ? null : person.getNationalityCode())
      .streetAddress(person == null ? null : person.getSteetAddress())
      .zip(person == null ? null : person.getZip())
      .postOffice(person == null ? null : person.getPostOffice())
      .originalExamDate(
        registration.getOriginalExamSession() != null
          ? DATE_FORMAT.format(registration.getOriginalExamSession().getExamDate().getExamDate())
          : null
      )
      .build();
  }

  static String kindToText(final RegistrationKind kind) {
    if (kind == null) {
      return "-";
    }

    return switch (kind) {
      case ADMISSION -> "Varsinainen ilmoittautuminen";
      case POST_ADMISSION -> "Jälki-ilmoittautuminen";
      case QUEUE -> "Jonoilmoittautuminen";
    };
  }

  static String stateToText(final Registration registration) {
    final RegistrationState state = registration.getState();
    final boolean isFreeRegistration = registration.getFreeRegistration() != null;

    if (state == null) {
      return "-";
    }

    return switch (state) {
      case COMPLETED -> isFreeRegistration ? "Maksuton" : "Maksanut";
      case PAID_AND_CANCELLED -> isFreeRegistration ? "Maksuton ja peruttu" : "Maksanut ja peruttu";
      case SUBMITTED -> "Ei maksanut";
      case CANCELLED -> "Peruttu";
      case EXPIRED -> "Erääntynyt";
      default -> "-";
    };
  }
}
