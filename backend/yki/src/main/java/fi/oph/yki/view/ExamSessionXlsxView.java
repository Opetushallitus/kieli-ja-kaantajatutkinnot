package fi.oph.yki.view;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.springframework.web.servlet.view.document.AbstractXlsxView;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExamSessionXlsxView extends AbstractXlsxView {

  private final ExamSessionXlsxData data;

  public ExamSessionXlsxView(final ExamSessionXlsxData data) {
    this.data = data;
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
            String.format("VKT_erinomainen_taito_tilaisuus_%s_%s.xlsx", data.date(), data.language())
    );
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  protected static void setFilenameHeader(final HttpServletResponse response, final String filename) {
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));
  }

  private void writeExcel(final Workbook workbook) {
    final List<String> headers = List.of(
            "Päivä",
            "Kieli",
            "Ilmoittautumisaika",
            "Sukunimi",
            "Etunimi",
            "Syntymäaika",
            "Henkilötunnus",
            "Aiempi tutkintopäivä",
            "Tila",
            "KT", // Kirjallinen taito
            "ST", // Suullinen taito
            "YT", // Ymmärtämisen taito
            "KI", // Kirjoittaminen
            "TY", // Tekstin ymmärtäminen
            "PU", // Puhuminen
            "PY", // Puheen ymmärtäminen,
            "Maksuton",
            "Koulutustiedon lähde",
            "Ylioppilastutkinto",
            "DIA-tutkinto",
            "EB-tutkinto",
            "Korkeakoulututkinto",
            "Korkeakouluopinnot käynnissä",
            "Muu tutkinto",
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

    for (int i = 0; i < data.rows().size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final ExamSessionXlsxDataRow dataRow = data.rows().get(i);

      int ci = 0;
      row.createCell(ci).setCellValue(data.date());
      row.createCell(++ci).setCellValue(data.language());
      row.createCell(++ci).setCellValue(dataRow.enrollmentTime());
      row.createCell(++ci).setCellValue(dataRow.lastName());
      row.createCell(++ci).setCellValue(dataRow.firstName());
      row.createCell(++ci).setCellValue(dataRow.birthdate());
      row.createCell(++ci).setCellValue(dataRow.ssn());
      setNullableValue(row.createCell(++ci), dataRow.previousEnrollment());
      row.createCell(++ci).setCellValue(dataRow.status());
      row.createCell(++ci).setCellValue(dataRow.textualSkill());
      row.createCell(++ci).setCellValue(dataRow.oralSkill());
      row.createCell(++ci).setCellValue(dataRow.understandingSkill());
      row.createCell(++ci).setCellValue(dataRow.writing());
      row.createCell(++ci).setCellValue(dataRow.readingComprehension());
      row.createCell(++ci).setCellValue(dataRow.speaking());
      row.createCell(++ci).setCellValue(dataRow.speechComprehension());

      if (dataRow.isFree() != null) {
        row.createCell(++ci).setCellValue(dataRow.isFree());
      } else {
        row.createCell(++ci);
      }

      row.createCell(++ci).setCellValue(dataRow.matriculationExam());
      row.createCell(++ci).setCellValue(dataRow.dia());
      row.createCell(++ci).setCellValue(dataRow.eb());
      row.createCell(++ci).setCellValue(dataRow.higherEducationConcluded());
      row.createCell(++ci).setCellValue(dataRow.higherEducationEnrolled());
      row.createCell(++ci).setCellValue(dataRow.otherEducation());

      row.createCell(++ci).setCellValue(dataRow.email());
      row.createCell(++ci).setCellValue(dataRow.phoneNumber());
      row.createCell(++ci).setCellValue(dataRow.digitalCertificateConsent());
      row.createCell(++ci).setCellValue(dataRow.street());
      row.createCell(++ci).setCellValue(dataRow.postalCode());
      row.createCell(++ci).setCellValue(dataRow.town());
      row.createCell(++ci).setCellValue(dataRow.country());
    }

    autoresizeExcelColumns(sheet, headers);
  }

  protected static void setNullableValue(final Cell cell, final String string) {
    if (string != null) {
      cell.setCellValue(string);
    } else {
      cell.setBlank();
    }
  }

  protected static void autoresizeExcelColumns(final Sheet sheet, final List<String> headers) {
    for (int i = 0; i < headers.size(); i++) {
      sheet.autoSizeColumn(i);
    }
  }

  protected static void createExcelHeader(final XSSFWorkbook workbook, final Sheet sheet, final List<String> headers) {
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
}
