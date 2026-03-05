package fi.oph.yki.view;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
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
      .filter(r -> r.getState() == RegistrationState.COMPLETED)
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
      .nationalityCode(person == null ? null : person.getNationalityCode())
      .streetAddress(person == null ? null : person.getSteetAddress())
      .zip(person == null ? null : person.getZip())
      .postOffice(person == null ? null : person.getPostOffice())
      .email(person == null ? null : person.getEmail())
      .partialExamType(registration.getPartialExamType() != null ? registration.getPartialExamType().name() : null)
      .build();
  }
}
