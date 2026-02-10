package fi.oph.yki.view;

import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Registration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

public class ExamSessionXlsxDataRowUtil {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  public static ExamSessionXlsxData createExcelData(final ExamSession examSession) {
    final List<ExamSessionXlsxDataRow> excelDataRows = examSession
      .getRegistrations()
      .stream()
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
      .firstName(person == null ? "" : person.getFirstName())
      .lastName(person == null ? "" : person.getLastName())
      .build();
  }
}
