package fi.oph.yki.view;

import static fi.oph.yki.view.ExamSessionXlsxView.autoresizeExcelColumns;
import static fi.oph.yki.view.ExamSessionXlsxView.createExcelHeader;
import static fi.oph.yki.view.ExamSessionXlsxView.setFilenameHeader;
import static fi.oph.yki.view.ExamSessionXlsxView.setNullableValue;

import fi.oph.yki.api.dto.clerk.ClerkStatisticsRowDTO;
import fi.oph.yki.util.DateUtil;
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

public class StatisticsXlsxView extends AbstractXlsxView {

  private static final List<String> HEADERS = List.of(
    "Järjestäjä",
    "Koepäivä",
    "Kieli",
    "Taso",
    "Paikkakunta",
    "Tarjolla olevat paikat",
    "Ilmoittautuneet",
    "Enimmäismäärä ilmoittautuneita",
    "Paikat täynnä (pvm)",
    "Peruutuspaikasta kiinnostuneet enimmillään",
    "Jono suurimmillaan (pvm)"
  );

  private final List<ClerkStatisticsRowDTO> rows;
  private final LocalDate from;
  private final LocalDate to;

  public StatisticsXlsxView(final List<ClerkStatisticsRowDTO> rows, final LocalDate from, final LocalDate to) {
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
    setFilenameHeader(response, String.format("YKI_tilastot_%s_%s.xlsx", from, to));
    response.setHeader("Cache-Control", "no-cache, no-store, private, max-age=0, must-revalidate");
    writeExcel(workbook);
  }

  private void writeExcel(final Workbook workbook) {
    final Sheet sheet = workbook.createSheet("Tilastot");

    createExcelHeader((XSSFWorkbook) workbook, sheet, HEADERS);

    for (int i = 0; i < rows.size(); i++) {
      final Row row = sheet.createRow(i + 1);
      final ClerkStatisticsRowDTO data = rows.get(i);

      int ci = 0;
      setNullableValue(row.createCell(ci), data.organizer());
      setNullableValue(row.createCell(++ci), data.examDate() != null ? data.examDate().toString() : null);
      setNullableValue(row.createCell(++ci), data.examLanguage());
      setNullableValue(row.createCell(++ci), data.examLevel());
      setNullableValue(row.createCell(++ci), data.municipality());
      setNullableValue(row.createCell(++ci), data.availablePlaces() != null ? data.availablePlaces().toString() : null);
      setNullableValue(row.createCell(++ci), data.registeredCount() != null ? data.registeredCount().toString() : null);
      setNullableValue(
        row.createCell(++ci),
        data.peakParticipants() != null ? data.peakParticipants().toString() : null
      );
      setNullableValue(row.createCell(++ci), DateUtil.formatOptionalDateTime(data.filledAt()));
      setNullableValue(row.createCell(++ci), data.peakQueue() != null ? data.peakQueue().toString() : null);
      setNullableValue(row.createCell(++ci), DateUtil.formatOptionalDateTime(data.queuePeakAt()));
    }

    autoresizeExcelColumns(sheet, HEADERS);
  }
}
