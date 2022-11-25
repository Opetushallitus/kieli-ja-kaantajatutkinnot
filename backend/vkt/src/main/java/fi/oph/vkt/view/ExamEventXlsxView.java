package fi.oph.vkt.view;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentDTO;
import fi.oph.vkt.api.dto.clerk.ClerkExamEventDTO;
import fi.oph.vkt.model.type.EnrollmentStatus;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
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
  private final ClerkExamEventDTO examEvent;

  public ExamEventXlsxView(final ClerkExamEventDTO examEvent) {
    this.examEvent = examEvent;
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
      String.format("VKT_tilaisuus_%s_%s.xlsx", DATE_FORMAT.format(examEvent.date()), examEvent.language().name())
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
      "Aiempi tutkintopäivä",
      "Tila",
      "ST", // Suullinen taito
      "KT", // Kirjallinen taito
      "YT", // Ymmärtämisen taito
      "TY", // Tekstin ymmärtäminen
      "PY", // Puheen ymmärtäminen
      "KI", // Kirjoittaminen
      "PU", // Puhuminen
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

    final List<ClerkEnrollmentDTO> enrollments = examEvent
      .enrollments()
      .stream()
      .sorted(enrollmentComparator())
      .toList();

    for (int i = 0; i < enrollments.size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final ClerkEnrollmentDTO enrollment = enrollments.get(i);
      int ci = 0;
      row.createCell(ci).setCellValue(DATE_FORMAT.format(examEvent.date()));
      row.createCell(++ci).setCellValue(examEvent.language().name());
      row.createCell(++ci).setCellValue(DATETIME_FORMAT.format(enrollment.enrollmentTime()));
      row.createCell(++ci).setCellValue(enrollment.person().lastName());
      row.createCell(++ci).setCellValue(enrollment.person().firstName());
      row.createCell(++ci).setCellValue(enrollment.person().identityNumber());
      formatNullableDate(row.createCell(++ci), enrollment.previousEnrollmentDate());

      row.createCell(++ci).setCellValue(statusToText(enrollment.status()));

      formatBoolean(row.createCell(++ci), enrollment.oralSkill());
      formatBoolean(row.createCell(++ci), enrollment.textualSkill());
      formatBoolean(row.createCell(++ci), enrollment.understandingSkill());

      formatBoolean(row.createCell(++ci), enrollment.readingComprehensionPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.speechComprehensionPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.writingPartialExam());
      formatBoolean(row.createCell(++ci), enrollment.speakingPartialExam());

      row.createCell(++ci).setCellValue(enrollment.email());
      row.createCell(++ci).setCellValue(enrollment.phoneNumber());

      formatBoolean(row.createCell(++ci), enrollment.digitalCertificateConsent());
      row.createCell(++ci).setCellValue(enrollment.street());
      row.createCell(++ci).setCellValue(enrollment.postalCode());
      row.createCell(++ci).setCellValue(enrollment.town());
      row.createCell(++ci).setCellValue(enrollment.country());
    }

    autoresizeExcelColumns(sheet, headers);
  }

  private static Comparator<ClerkEnrollmentDTO> enrollmentComparator() {
    final Comparator<ClerkEnrollmentDTO> byStatus = Comparator.comparing(ClerkEnrollmentDTO::status);
    final Comparator<ClerkEnrollmentDTO> byEnrollmentTime = Comparator.comparing(ClerkEnrollmentDTO::enrollmentTime);
    return byStatus.thenComparing(byEnrollmentTime);
  }

  private static void formatNullableDate(final Cell cell, final LocalDate localDate) {
    if (localDate != null) {
      cell.setCellValue(DATE_FORMAT.format(localDate));
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
