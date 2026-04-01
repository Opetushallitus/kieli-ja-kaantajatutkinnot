package fi.oph.yki.view;

import static fi.oph.yki.view.ExamSessionXlsxView.autoresizeExcelColumns;
import static fi.oph.yki.view.ExamSessionXlsxView.createExcelHeader;
import static fi.oph.yki.view.ExamSessionXlsxView.setFilenameHeader;
import static fi.oph.yki.view.ExamSessionXlsxView.setNullableValue;

import fi.oph.yki.api.dto.clerk.ClerkPaymentReportRowDTO;
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
import org.springframework.web.servlet.view.document.AbstractXlsxView;

public class PaymentReportXlsxView extends AbstractXlsxView {

  private static final List<String> HEADERS = List.of(
    "Järjestäjä",
    "Sukunimi",
    "Etunimet",
    "Sähköpostiosoite",
    "Maksun aikaleima",
    "Koepäivä",
    "Alkuperäinen koepäivä",
    "Kieli",
    "Taso",
    "Summa (€)",
    "Maksun yksilöintitunnus",
    "Maksuttomuuden lähde",
    "Ulkomainen tutkinto",
    "Ylioppilastutkinto",
    "EB-tutkinto",
    "DIA-tutkinto",
    "Korkeakoulututkinto",
    "Korkeakouluopinnot"
  );

  private final List<ClerkPaymentReportRowDTO> rows;
  private final LocalDate from;
  private final LocalDate to;

  public PaymentReportXlsxView(final List<ClerkPaymentReportRowDTO> rows, final LocalDate from, final LocalDate to) {
    this.rows = rows;
    this.from = from;
    this.to = to;
  }

  @Override
  protected void buildExcelDocument(
    final @NonNull Map<String, Object> model,
    final @NonNull Workbook workbook,
    final @NonNull HttpServletRequest request,
    final @NonNull HttpServletResponse response
  ) {
    setFilenameHeader(response, String.format("YKI_tutkintomaksut_%s_%s.xlsx", from, to));
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  private void writeExcel(final Workbook workbook) {
    final Sheet sheet = workbook.createSheet("Tutkintomaksut");

    createExcelHeader((XSSFWorkbook) workbook, sheet, HEADERS);

    for (int i = 0; i < rows.size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final ClerkPaymentReportRowDTO data = rows.get(i);

      int ci = 0;
      setNullableValue(row.createCell(ci), data.organizer());
      setNullableValue(row.createCell(++ci), data.lastName());
      setNullableValue(row.createCell(++ci), data.firstName());
      setNullableValue(row.createCell(++ci), data.email());
      setNullableValue(row.createCell(++ci), data.paidAt());
      setNullableValue(row.createCell(++ci), data.examDate() != null ? data.examDate().toString() : null);
      setNullableValue(
        row.createCell(++ci),
        data.originalExamDate() != null ? data.originalExamDate().toString() : null
      );
      setNullableValue(row.createCell(++ci), data.examLanguage());
      setNullableValue(row.createCell(++ci), data.examLevel());
      setNullableValue(row.createCell(++ci), data.amount());
      setNullableValue(row.createCell(++ci), data.reference());
      setNullableValue(row.createCell(++ci), data.frSource());
      setNullableValue(row.createCell(++ci), formatBoolean(data.frIsForeign()));
      setNullableValue(row.createCell(++ci), formatBoolean(data.frMatriculationExam()));
      setNullableValue(row.createCell(++ci), formatBoolean(data.frEb()));
      setNullableValue(row.createCell(++ci), formatBoolean(data.frDia()));
      setNullableValue(row.createCell(++ci), formatBoolean(data.frHigherEducationConcluded()));
      setNullableValue(row.createCell(++ci), formatBoolean(data.frHigherEducationEnrolled()));
    }

    autoresizeExcelColumns(sheet, HEADERS);
  }

  private static String formatBoolean(final Boolean value) {
    if (value == null) {
      return "-";
    }
    return value ? "Kyllä" : "Ei";
  }
}
