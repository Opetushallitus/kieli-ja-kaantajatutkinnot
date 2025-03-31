package fi.oph.vkt.view;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExaminerExamEventXlsxView extends ExamEventCommonXlsxView {

  private final ExaminerExamEventXlsxData data;

  public ExaminerExamEventXlsxView(final ExaminerExamEventXlsxData data) {
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
      String.format("VKT_hyva_ja_tyydyttava_taito_tilaisuus_%s_%s.xlsx", data.date(), data.language())
    );
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  private void writeExcel(final Workbook workbook) {
    final List<String> headers = List.of(
      "Päivä",
      "Kieli",
      "Ilmoittautumisaika",
      "Sukunimi",
      "Etunimi",
      "Syntymäaika",
      "Aiempi tutkintopäivä",
      "Tila",
      "KT", // Kirjallinen taito
      "ST", // Suullinen taito
      "YT", // Ymmärtämisen taito
      "KI", // Kirjoittaminen
      "TY", // Tekstin ymmärtäminen
      "PU", // Puhuminen
      "PY", // Puheen ymmärtäminen,
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
      final ExaminerExamEventXlsxDataRow dataRow = data.rows().get(i);

      int ci = 0;
      row.createCell(ci).setCellValue(data.date());
      row.createCell(++ci).setCellValue(data.language());
      row.createCell(++ci).setCellValue(dataRow.enrollmentTime());
      row.createCell(++ci).setCellValue(dataRow.lastName());
      row.createCell(++ci).setCellValue(dataRow.firstName());
      row.createCell(++ci).setCellValue(dataRow.birthdate());
      row.createCell(++ci).setCellValue(dataRow.previousEnrollment());
      row.createCell(++ci).setCellValue(dataRow.status());
      row.createCell(++ci).setCellValue(dataRow.textualSkill());
      row.createCell(++ci).setCellValue(dataRow.oralSkill());
      row.createCell(++ci).setCellValue(dataRow.understandingSkill());
      row.createCell(++ci).setCellValue(dataRow.writing());
      row.createCell(++ci).setCellValue(dataRow.readingComprehension());
      row.createCell(++ci).setCellValue(dataRow.speaking());
      row.createCell(++ci).setCellValue(dataRow.speechComprehension());

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
}
