package fi.oph.akr.api.clerk;

import fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO;
import fi.oph.akr.api.dto.clerk.EmailStatisticsDTO;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.service.StatisticsService;
import fi.oph.akr.service.koodisto.LanguageService;
import fi.oph.akr.util.localisation.Language;
import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.ClientAnchor;
import org.apache.poi.ss.usermodel.Comment;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Drawing;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
public class StatisticsController {

  private static final String MEDIA_TYPE_XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
  private static final DateTimeFormatter YEAR_FORMAT = DateTimeFormatter.ofPattern("yyyy");

  @Resource
  private StatisticsService statisticsService;

  @Resource
  private LanguageService languageService;

  @GetMapping(value = "/contact-requests/daily")
  public void getContactRequestStatisticsByDay(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("yhteydenottopyynnot_paivittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now())));

    writeContactRequestStatisticsExcel(
      "Yhteydenottopyynnöt päivittäin",
      DAY_FORMAT,
      "päivä",
      response.getOutputStream(),
      statisticsService.listContactRequestStatisticsByDay()
    );
  }

  @GetMapping(value = "/contact-requests/monthly")
  public void getContactRequestStatisticsByMonth(final HttpServletResponse response) throws IOException {
    writeHeaders(
      response,
      String.format("yhteydenottopyynnot_kuukausittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now()))
    );

    writeContactRequestStatisticsExcel(
      "Yhteydenottopyynnöt kuukausittain",
      MONTH_FORMAT,
      "kuukausi",
      response.getOutputStream(),
      statisticsService.listContactRequestStatisticsByMonth()
    );
  }

  @GetMapping(value = "/contact-requests/yearly")
  public void getContactRequestStatisticsByYear(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("yhteydenottopyynnot_vuosittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now())));

    writeContactRequestStatisticsExcel(
      "Yhteydenottopyynnöt vuosittain",
      YEAR_FORMAT,
      "vuosi",
      response.getOutputStream(),
      statisticsService.listContactRequestStatisticsByYear()
    );
  }

  @GetMapping(value = "/emails/daily")
  public void getEmailStatisticsByDay(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_paivittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsExcel(
      "Sähköpostit päivittäin",
      DAY_FORMAT,
      "päivä",
      response.getOutputStream(),
      statisticsService.listEmailStatisticsByDay()
    );
  }

  @GetMapping(value = "/emails/monthly")
  public void getEmailStatisticsByMonth(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_kuukausittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsExcel(
      "Sähköpostit kuukausittain",
      MONTH_FORMAT,
      "kuukausi",
      response.getOutputStream(),
      statisticsService.listEmailStatisticsByMonth()
    );
  }

  @GetMapping(value = "/emails/yearly")
  public void getEmailStatisticsByYear(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_vuosittain_%s.xlsx", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsExcel(
      "Sähköpostit vuosittain",
      YEAR_FORMAT,
      "vuosi",
      response.getOutputStream(),
      statisticsService.listEmailStatisticsByYear()
    );
  }

  private static void writeHeaders(final HttpServletResponse response, final String filename) {
    response.setContentType(MEDIA_TYPE_XLSX);
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));
  }

  private void writeContactRequestStatisticsExcel(
    final String sheetName,
    final DateTimeFormatter dateFormatter,
    final String dateColumnName,
    final OutputStream outputStream,
    final List<ContactRequestStatisticsDTO> stats
  ) throws IOException {
    final List<String> headers = List.of(
      dateColumnName,
      "mistä",
      "mihin",
      "yhteydenottopyyntöjen määrä",
      "kääntäjien määrä"
    );

    try (final XSSFWorkbook workbook = new XSSFWorkbook()) {
      final Sheet sheet = workbook.createSheet(sheetName);

      createExcelHeader(workbook, sheet, headers);
      createCellNote(
        sheet.getRow(0).getCell(4),
        "Yhteydenottopyyntöihin valittujen kääntäjien määrä summana, EI uniikkien kääntäjien määrä.",
        "AKR"
      );

      for (int i = 0; i < stats.size(); i++) {
        final Row row = sheet.createRow(i + 1);
        final ContactRequestStatisticsDTO stat = stats.get(i);
        row.createCell(0).setCellValue(dateFormatter.format(LocalDate.of(stat.year(), stat.month(), stat.day())));
        row.createCell(1).setCellValue(translateLanguageCode(stat.fromLang()));
        row.createCell(2).setCellValue(translateLanguageCode(stat.toLang()));
        row.createCell(3).setCellValue(stat.contactRequestCount());
        row.createCell(4).setCellValue(stat.contactCount());
      }

      autoresizeExcelColumns(sheet, headers);

      workbook.write(outputStream);
    }
  }

  private String translateLanguageCode(final String code) {
    return languageService.getLocalisationValue(code, Language.FI).orElse(code);
  }

  private void writeEmailStatisticsExcel(
    final String sheetName,
    final DateTimeFormatter dateFormatter,
    final String dateColumnName,
    final OutputStream outputStream,
    final List<EmailStatisticsDTO> stats
  ) throws IOException {
    final List<String> headers = List.of(dateColumnName, "sähköpostin tyyppi", "määrä");

    try (final XSSFWorkbook workbook = new XSSFWorkbook()) {
      final Sheet sheet = workbook.createSheet(sheetName);

      createExcelHeader(workbook, sheet, headers);

      for (int i = 0; i < stats.size(); i++) {
        final Row row = sheet.createRow(i + 1);
        final EmailStatisticsDTO stat = stats.get(i);
        row.createCell(0).setCellValue(dateFormatter.format(LocalDate.of(stat.year(), stat.month(), stat.day())));
        row.createCell(1).setCellValue(convertEmailTypeToString(stat.emailType()));
        row.createCell(2).setCellValue(stat.count());
      }

      autoresizeExcelColumns(sheet, headers);

      workbook.write(outputStream);
    }
  }

  private String convertEmailTypeToString(final EmailType emailType) {
    return switch (emailType) {
      case AUTHORISATION_EXPIRY -> "Auktorisoinnin vanheneminen";
      case CONTACT_REQUEST_CLERK -> "Yhteydenottopyyntö virkailijalle";
      case CONTACT_REQUEST_REQUESTER -> "Yhteydenottopyyntö pyytäjälle";
      case CONTACT_REQUEST_TRANSLATOR -> "Yhteydenottopyyntö kääntäjälle";
      case INFORMAL -> "Virkailijan vapaamuotoinen";
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

  private static void createCellNote(final Cell cell, final String commentText, final String commentAuthor) {
    final CreationHelper factory = cell.getSheet().getWorkbook().getCreationHelper();
    final Drawing<?> drawing = cell.getSheet().createDrawingPatriarch();
    final ClientAnchor anchor = factory.createClientAnchor();
    final Comment comment = drawing.createCellComment(anchor);
    comment.setString(factory.createRichTextString(commentText));
    comment.setAuthor(commentAuthor);
    cell.setCellComment(comment);
  }

  private static void autoresizeExcelColumns(final Sheet sheet, final List<String> headers) {
    for (int i = 0; i < headers.size(); i++) {
      sheet.autoSizeColumn(i);
    }
  }
}
