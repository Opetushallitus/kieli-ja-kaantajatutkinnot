package fi.oph.vkt.view;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.NonNull;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

public class ExamEventXlsxView extends AbstractXlsxView {

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  private final ExamEvent examEvent;
  private final List<Enrollment> enrollments;

  public ExamEventXlsxView(final ExamEvent examEvent, final List<Enrollment> enrollments) {
    this.examEvent = examEvent;
    this.enrollments = enrollments;
  }

  @Override
  protected void buildExcelDocument(
    final @NonNull Map<String, Object> model,
    final @NonNull Workbook workbook,
    final @NonNull HttpServletRequest request,
    final @NonNull HttpServletResponse response
  ) {
    setFilenameHeader(
      response,
      String.format("VKT_tilaisuus_%s_%s.xlsx", DATE_FORMAT.format(examEvent.getDate()), examEvent.getLanguage().name())
    );

    writeExcel(workbook);
  }

  private static void setFilenameHeader(final HttpServletResponse response, final String filename) {
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));
  }

  private void writeExcel(final Workbook workbook) {
    final List<String> headers = List.of(
      "Päivä",
      "Kieli",
      "Ilmoittautumisaika",
      "Sukunimi",
      "Etunimi",
      "Henkilötunnus",
      "Syntymäaika",
      "Aiempi tutkintopäivä",
      "Tila",
      "KT", // Kirjallinen taito
      "ST", // Suullinen taito
      "YT", // Ymmärtämisen taito
      "KI", // Kirjoittaminen
      "TY", // Tekstin ymmärtäminen
      "PU", // Puhuminen
      "PY", // Puheen ymmärtäminen
      "Sähköposti",
      "Puhelin",
      "Sähk. Tod.",
      "Katu",
      "Postinumero",
      "Kaupunki",
      "Maa"
    );
    final Sheet sheet = workbook.createSheet("Tilaisuuden tiedot");

    createExcelHeader((XSSFWorkbook) workbook, sheet, headers);

    for (int i = 0; i < enrollments.size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final Enrollment enrollment = enrollments.get(i);
      final Person person = enrollment.getPerson();

      final String date = DATE_FORMAT.format(examEvent.getDate());
      final String language = examEvent.getLanguage().name();
      final String enrollmentTime = DATETIME_FORMAT.format(enrollment.getCreatedAt());
      final String dateOfBirth = person.getDateOfBirth() != null ? DATE_FORMAT.format(person.getDateOfBirth()) : null;
      final String status = statusToText(enrollment.getStatus());

      int ci = 0;
      row.createCell(ci).setCellValue(date);
      row.createCell(++ci).setCellValue(language);
      row.createCell(++ci).setCellValue(enrollmentTime);
      row.createCell(++ci).setCellValue(person.getLastName());
      row.createCell(++ci).setCellValue(person.getFirstName());
      setNullableValue(row.createCell(++ci), person.getIdentityNumber());
      setNullableValue(row.createCell(++ci), dateOfBirth);
      setNullableValue(row.createCell(++ci), enrollment.getPreviousEnrollment());
      row.createCell(++ci).setCellValue(status);
      formatBoolean(row.createCell(++ci), enrollment.isTextualSkill());
      formatBoolean(row.createCell(++ci), enrollment.isOralSkill());
      formatBoolean(row.createCell(++ci), enrollment.isUnderstandingSkill());
      formatBoolean(row.createCell(++ci), enrollment.isWritingPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.isReadingComprehensionPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.isSpeakingPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.isSpeechComprehensionPartialExam());
      row.createCell(++ci).setCellValue(enrollment.getEmail());
      row.createCell(++ci).setCellValue(enrollment.getPhoneNumber());
      formatBoolean(row.createCell(++ci), enrollment.isDigitalCertificateConsent());
      row.createCell(++ci).setCellValue(enrollment.getStreet());
      row.createCell(++ci).setCellValue(enrollment.getPostalCode());
      row.createCell(++ci).setCellValue(enrollment.getTown());
      row.createCell(++ci).setCellValue(enrollment.getCountry());
    }

    autoresizeExcelColumns(sheet, headers);
  }

  private static void setNullableValue(final Cell cell, final String string) {
    if (string != null) {
      cell.setCellValue(string);
    } else {
      cell.setBlank();
    }
  }

  private static void formatBoolean(final Cell cell, final boolean b) {
    if (b) {
      cell.setCellValue(1);
    } else {
      cell.setBlank();
    }
  }

  private static String statusToText(final EnrollmentStatus status) {
    return switch (status) {
      case PAID -> "Maksettu";
      case EXPECTING_PAYMENT -> "Odottaa maksua";
      case QUEUED -> "Jonossa";
      case CANCELED -> "Peruttu";
    };
  }

  private static void createExcelHeader(final XSSFWorkbook workbook, final Sheet sheet, final List<String> headers) {
    final Row header = sheet.createRow(0);
    final CellStyle headerStyle = workbook.createCellStyle();
    final XSSFFont font = workbook.createFont();
    font.setBold(true);
    headerStyle.setFont(font);
    for (int i = 0; i < headers.size(); i++) {
      final Cell cell = header.createCell(i);
      cell.setCellStyle(headerStyle);
      cell.setCellValue(headers.get(i));
    }
  }

  private static void autoresizeExcelColumns(final Sheet sheet, final List<String> headers) {
    for (int i = 0; i < headers.size(); i++) {
      sheet.autoSizeColumn(i);
    }
  }
}
