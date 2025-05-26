package fi.oph.vkt.view;

import fi.oph.vkt.util.DateUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.NonNull;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class PaymentReportView extends CommonXlsxView {

  private final List<PaymentReportXslxData> rows;

  public PaymentReportView(final List<PaymentReportXslxData> rows) {
    this.rows = rows;
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
      String.format("VKT_maksuraportti_%s.xlsx", DateUtil.formatOptionalDate(LocalDate.now()))
    );
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  private void writeExcel(final Workbook workbook) {
    final List<String> headers = List.of(
      "Kauppiaan viite",
      "Paytrail viite",
      "Sukunimi",
      "Etunimi",
      "Tutkintopäivä",
      "Kieli",
      "Taso",
      "Vastaanottaja",
      "KT", // Kirjallinen taito
      "ST", // Suullinen taito
      "YT", // Ymmärtämisen taito
      "Summa",
      "Maksu luotu"
    );
    final Sheet sheet = workbook.createSheet("Maksuraportti");

    createExcelHeader((XSSFWorkbook) workbook, sheet, headers);

    for (int i = 0; i < rows.size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final PaymentReportXslxData dataRow = rows.get(i);

      int ci = 0;
      row.createCell(ci++).setCellValue(dataRow.merchantReference());
      row.createCell(ci++).setCellValue(dataRow.paytrailReference());
      row.createCell(ci++).setCellValue(dataRow.lastName());
      row.createCell(ci++).setCellValue(dataRow.firstName());
      row.createCell(ci++).setCellValue(dataRow.date());
      row.createCell(ci++).setCellValue(dataRow.language());
      row.createCell(ci++).setCellValue(dataRow.level());
      row.createCell(ci++).setCellValue(dataRow.examiner());
      row.createCell(ci++).setCellValue(dataRow.textualSkill());
      row.createCell(ci++).setCellValue(dataRow.oralSkill());
      row.createCell(ci++).setCellValue(dataRow.understandingSkill());
      row.createCell(ci++).setCellValue(dataRow.amount());
      row.createCell(ci++).setCellValue(dataRow.paymentCreatedAt());
    }

    autoresizeExcelColumns(sheet, headers);
  }
}
