package fi.oph.yki.view;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

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
    setFilenameHeader(response, String.format("YKI_tutkintotilaisuus_%s_%s.xlsx", data.date(), data.language()));
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  protected static void setFilenameHeader(final HttpServletResponse response, final String filename) {
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));
  }

  private void writeExcel(final Workbook workbook) {
    final List<String> headers = List.of(
      "OID",
      "Sukunimi",
      "Etunimi",
      "Tila",
      "Ilmoittautumisen tyyppi",
      "Alkuperäinen tutkintopäivä",
      "Sukupuoli",
      "Sähköposti",
      "Puhelinnumero",
      "Katuosoite",
      "Tehtäväkieli",
      "Todistuskieli",
      "Postinumero",
      "Postitoimipaikka",
      "Kansalaisuus"
    );
    final Sheet sheet = workbook.createSheet("Tilaisuuden tiedot");

    createExcelHeader((XSSFWorkbook) workbook, sheet, headers);

    for (int i = 0; i < data.rows().size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final ExamSessionXlsxDataRow dataRow = data.rows().get(i);

      int ci = 0;
      row.createCell(++ci).setCellValue(dataRow.oid());
      row.createCell(++ci).setCellValue(dataRow.lastName());
      row.createCell(++ci).setCellValue(dataRow.firstName());
      setNullableValue(row.createCell(++ci), dataRow.state());
      setNullableValue(row.createCell(++ci), dataRow.type());
      setNullableValue(row.createCell(++ci), dataRow.originalExamDate());
      setNullableValue(row.createCell(++ci), dataRow.gender() != null ? dataRow.gender().name() : null);
      setNullableValue(row.createCell(++ci), dataRow.email());
      setNullableValue(row.createCell(++ci), dataRow.phone());
      setNullableValue(row.createCell(++ci), dataRow.streetAddress());
      setNullableValue(row.createCell(++ci), dataRow.examLang());
      setNullableValue(row.createCell(++ci), dataRow.certificateLang());
      setNullableValue(row.createCell(++ci), dataRow.zip());
      setNullableValue(row.createCell(++ci), dataRow.postOffice());
      setNullableValue(row.createCell(++ci), dataRow.nationalityDesc());
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
