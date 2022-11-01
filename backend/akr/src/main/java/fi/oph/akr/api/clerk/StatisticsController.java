package fi.oph.akr.api.clerk;

import fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO;
import fi.oph.akr.api.dto.clerk.EmailStatisticsDTO;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.service.StatisticsService;
import fi.oph.akr.service.koodisto.LanguageService;
import fi.oph.akr.util.localisation.Language;
import java.io.IOException;
import java.io.Writer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import liquibase.util.csv.CSVWriter;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/statistics", produces = MediaType.APPLICATION_JSON_VALUE)
public class StatisticsController {

  private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");
  private static final DateTimeFormatter YEAR_FORMAT = DateTimeFormatter.ofPattern("yyyy");

  @Resource
  private StatisticsService statisticsService;

  @Resource
  private LanguageService languageService;

  @GetMapping(value = "/contact-requests/daily")
  public void getContactRequestStatisticsByDay(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("yhteydenottopyynnot_paivittain_%s.csv", DAY_FORMAT.format(LocalDate.now())));

    writeContactRequestStatisticsCSV(
      DAY_FORMAT,
      "päivä",
      response.getWriter(),
      statisticsService.listContactRequestStatisticsByDay()
    );
  }

  @GetMapping(value = "/contact-requests/monthly")
  public void getContactRequestStatisticsByMonth(final HttpServletResponse response) throws IOException {
    writeHeaders(
      response,
      String.format("yhteydenottopyynnot_kuukausittain_%s.csv", DAY_FORMAT.format(LocalDate.now()))
    );

    writeContactRequestStatisticsCSV(
      MONTH_FORMAT,
      "kuukausi",
      response.getWriter(),
      statisticsService.listContactRequestStatisticsByMonth()
    );
  }

  @GetMapping(value = "/contact-requests/yearly")
  public void getContactRequestStatisticsByYear(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("yhteydenottopyynnot_vuosittain_%s.csv", DAY_FORMAT.format(LocalDate.now())));

    writeContactRequestStatisticsCSV(
      YEAR_FORMAT,
      "vuosi",
      response.getWriter(),
      statisticsService.listContactRequestStatisticsByYear()
    );
  }

  @GetMapping(value = "/emails/daily")
  public void getEmailStatisticsByDay(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_paivittain_%s.csv", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsCSV(DAY_FORMAT, "päivä", response.getWriter(), statisticsService.listEmailStatisticsByDay());
  }

  @GetMapping(value = "/emails/monthly")
  public void getEmailStatisticsByMonth(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_kuukausittain_%s.csv", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsCSV(
      MONTH_FORMAT,
      "kuukausi",
      response.getWriter(),
      statisticsService.listEmailStatisticsByMonth()
    );
  }

  @GetMapping(value = "/emails/yearly")
  public void getEmailStatisticsByYear(final HttpServletResponse response) throws IOException {
    writeHeaders(response, String.format("sahkopostit_vuosittain_%s.csv", DAY_FORMAT.format(LocalDate.now())));

    writeEmailStatisticsCSV(YEAR_FORMAT, "vuosi", response.getWriter(), statisticsService.listEmailStatisticsByYear());
  }

  private static void writeHeaders(final HttpServletResponse response, final String filename) {
    response.setCharacterEncoding("UTF-8");
    response.setContentType("text/csv");
    response.addHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", filename));
  }

  private void writeContactRequestStatisticsCSV(
    final DateTimeFormatter dateFormatter,
    final String dateColumnName,
    final Writer writer,
    final List<ContactRequestStatisticsDTO> stats
  ) {
    final CSVWriter csvWriter = new CSVWriter(writer);
    // header
    csvWriter.writeNext(
      new String[] {
        dateColumnName,
        "mistä",
        "mihin",
        "yhteydenottopyyntöjen määrä",
        "kääntäjille tehtyjen yhteydenottojen määrä",
      }
    );
    // data
    stats.forEach(stat -> {
      final String[] line = new String[] {
        dateFormatter.format(LocalDate.of(stat.year(), stat.month(), stat.day())),
        languageService.getLocalisationValue(stat.fromLang(), Language.FI).orElse(stat.fromLang()),
        languageService.getLocalisationValue(stat.toLang(), Language.FI).orElse(stat.toLang()),
        stat.contactRequestCount().toString(),
        stat.contactCount().toString(),
      };
      csvWriter.writeNext(line);
    });
  }

  private void writeEmailStatisticsCSV(
    final DateTimeFormatter dateFormatter,
    final String dateColumnName,
    final Writer writer,
    final List<EmailStatisticsDTO> stats
  ) {
    final CSVWriter csvWriter = new CSVWriter(writer);
    // header
    csvWriter.writeNext(new String[] { dateColumnName, "sähköpostin tyyppi", "määrä" });
    // data
    stats.forEach(stat -> {
      final String[] line = new String[] {
        dateFormatter.format(LocalDate.of(stat.year(), stat.month(), stat.day())),
        convertEmailTypeToString(stat.emailType()),
        stat.count().toString(),
      };
      csvWriter.writeNext(line);
    });
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
}
