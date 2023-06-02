package fi.oph.akr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import fi.oph.akr.Factory;
import fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO;
import fi.oph.akr.api.dto.clerk.EmailStatisticsDTO;
import fi.oph.akr.model.ContactRequest;
import fi.oph.akr.model.ContactRequestStatistic;
import fi.oph.akr.model.ContactRequestTranslator;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailStatistic;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.Translator;
import fi.oph.akr.repository.ContactRequestRepository;
import fi.oph.akr.repository.ContactRequestStatisticRepository;
import fi.oph.akr.repository.EmailRepository;
import fi.oph.akr.repository.EmailStatisticRepository;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class StatisticsServiceTest {

  public static final String FI = "FI";
  public static final String SV = "SV";
  public static final String EN = "EN";

  @Resource
  private ContactRequestStatisticRepository contactRequestStatisticRepository;

  @Resource
  private EmailStatisticRepository emailStatisticRepository;

  @Resource
  private ContactRequestRepository contactRequestRepository;

  @Resource
  private EmailRepository emailRepository;

  private StatisticsService statisticsService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    statisticsService =
      new StatisticsService(
        contactRequestStatisticRepository,
        emailStatisticRepository,
        contactRequestRepository,
        emailRepository
      );
  }

  @Test
  public void testGenerateContactRequestStatistics() {
    createContactRequests(10, FI, SV);
    createContactRequests(10, FI, SV);
    createContactRequests(11, SV, FI);
    createContactRequests(11, SV, FI);
    createContactRequests(11, SV, FI);

    statisticsService.generateContactRequestStatistics();
    // Another call ensures that dates containing existing statistics are listed correctly.
    statisticsService.generateContactRequestStatistics();

    final List<ContactRequestStatistic> stats = contactRequestStatisticRepository.findAll();
    assertEquals(21, stats.size());
    stats.forEach(stat -> {
      assertNotEquals(
        LocalDate.now(),
        LocalDate.of(stat.getYear(), stat.getMonth(), stat.getDay()),
        "Current day should not exist in statistics"
      );
      if (stat.getFromLang().equals(FI)) {
        assertEquals(2, stat.getContactRequestCount());
        assertEquals(4, stat.getContactCount());
      } else {
        assertEquals(3, stat.getContactRequestCount());
        assertEquals(6, stat.getContactCount());
      }
    });
  }

  private void createContactRequests(final int forHowManyDaysBackwards, final String from, final String to) {
    // Create contact requests for given number of days backwards, and for today, altogether for forHowManyDaysBackwards + 1 days.
    // Statistics should not be generated for current day, therefore we create for contact requests for today also and
    // expect today not to be found in statistics.
    for (int i = 0; i <= forHowManyDaysBackwards; i++) {
      final Translator t1 = Factory.translator();
      final Translator t2 = Factory.translator();
      final ContactRequest cr = Factory.contactRequest();
      cr.setFromLang(from);
      cr.setToLang(to);
      final ContactRequestTranslator crt1 = Factory.contactRequestTranslator(t1, cr);
      final ContactRequestTranslator crt2 = Factory.contactRequestTranslator(t2, cr);
      entityManager.persist(t1);
      entityManager.persist(t2);
      entityManager.persist(cr);
      entityManager.persist(crt1);
      entityManager.persist(crt2);
      cr.setCreatedAt(cr.getCreatedAt().minusDays(i));
      entityManager.persistAndFlush(cr);
    }
  }

  @Test
  public void testListContactRequestStatisticsByDay() {
    final LocalDate beginOfMonth = LocalDate.now().withDayOfMonth(1);
    final LocalDate previousMonth = beginOfMonth.minusMonths(1);

    final LocalDate previousMonthDate1 = previousMonth.plusDays(0);
    final LocalDate previousMonthDate2 = previousMonth.plusDays(1);
    final LocalDate previousMonthDate3 = previousMonth.plusDays(2);

    createContactRequestStat(previousMonthDate1, FI, SV, 2, 8);
    createContactRequestStat(previousMonthDate3, FI, EN, 3, 8);
    createContactRequestStat(previousMonthDate2, FI, EN, 2, 4);
    createContactRequestStat(previousMonthDate1, FI, EN, 1, 2);

    final LocalDate currentMonthDate3 = beginOfMonth.plusDays(2);
    final LocalDate currentMonthDate2 = beginOfMonth.plusDays(1);
    final LocalDate currentMonthDate1 = beginOfMonth.plusDays(0);

    createContactRequestStat(currentMonthDate3, FI, SV, 3, 8);
    createContactRequestStat(currentMonthDate2, FI, SV, 2, 4);
    createContactRequestStat(currentMonthDate1, FI, SV, 1, 2);
    createContactRequestStat(currentMonthDate1, EN, FI, 4, 4);
    createContactRequestStat(currentMonthDate2, EN, FI, 5, 5);

    final List<ContactRequestStatisticsDTO> result = statisticsService.listContactRequestStatisticsByDay();

    assertEquals(9, result.size());
    assertDto(previousMonthDate1, FI, EN, 1, 2, result.get(0));
    assertDto(previousMonthDate1, FI, SV, 2, 8, result.get(1));
    assertDto(previousMonthDate2, FI, EN, 2, 4, result.get(2));
    assertDto(previousMonthDate3, FI, EN, 3, 8, result.get(3));
    assertDto(currentMonthDate1, EN, FI, 4, 4, result.get(4));
    assertDto(currentMonthDate1, FI, SV, 1, 2, result.get(5));
    assertDto(currentMonthDate2, EN, FI, 5, 5, result.get(6));
    assertDto(currentMonthDate2, FI, SV, 2, 4, result.get(7));
    assertDto(currentMonthDate3, FI, SV, 3, 8, result.get(8));
  }

  @Test
  public void testListContactRequestStatisticsByMonth() {
    final LocalDate beginOfMonth = LocalDate.now().withDayOfMonth(1);
    final LocalDate previousMonth = beginOfMonth.minusMonths(1);

    createContactRequestStat(previousMonth.plusDays(0), FI, EN, 1, 11);
    createContactRequestStat(previousMonth.plusDays(1), FI, EN, 1, 11);
    createContactRequestStat(previousMonth.plusDays(2), FI, EN, 1, 11);
    createContactRequestStat(previousMonth.plusDays(0), FI, SV, 1, 2);

    createContactRequestStat(beginOfMonth.plusDays(0), FI, SV, 1, 3);
    createContactRequestStat(beginOfMonth.plusDays(1), FI, SV, 1, 3);
    createContactRequestStat(beginOfMonth.plusDays(2), FI, SV, 1, 3);
    createContactRequestStat(beginOfMonth.plusDays(0), FI, EN, 1, 2);
    createContactRequestStat(beginOfMonth.plusDays(1), FI, EN, 1, 2);

    final List<ContactRequestStatisticsDTO> result = statisticsService.listContactRequestStatisticsByMonth();

    assertEquals(4, result.size());
    assertDto(previousMonth, FI, EN, 3, 33, result.get(0));
    assertDto(previousMonth, FI, SV, 1, 2, result.get(1));
    assertDto(beginOfMonth, FI, EN, 2, 4, result.get(2));
    assertDto(beginOfMonth, FI, SV, 3, 9, result.get(3));
  }

  @Test
  public void testListContactRequestStatisticsByYear() {
    final LocalDate beginOfYear = LocalDate.now().withMonth(1).withDayOfMonth(1);
    final LocalDate previousYear = beginOfYear.minusYears(1);

    createContactRequestStat(previousYear.plusDays(0), FI, EN, 1, 11);
    createContactRequestStat(previousYear.plusDays(1), FI, EN, 1, 11);
    createContactRequestStat(previousYear.plusDays(2), FI, EN, 1, 11);
    createContactRequestStat(previousYear.plusDays(0), FI, SV, 1, 2);

    createContactRequestStat(beginOfYear.plusDays(0), FI, SV, 1, 3);
    createContactRequestStat(beginOfYear.plusDays(1), FI, SV, 1, 3);
    createContactRequestStat(beginOfYear.plusDays(2), FI, SV, 1, 3);
    createContactRequestStat(beginOfYear.plusDays(0), FI, EN, 1, 2);
    createContactRequestStat(beginOfYear.plusDays(1), FI, EN, 1, 2);

    final List<ContactRequestStatisticsDTO> result = statisticsService.listContactRequestStatisticsByYear();

    assertEquals(4, result.size());
    assertDto(previousYear, FI, EN, 3, 33, result.get(0));
    assertDto(previousYear, FI, SV, 1, 2, result.get(1));
    assertDto(beginOfYear, FI, EN, 2, 4, result.get(2));
    assertDto(beginOfYear, FI, SV, 3, 9, result.get(3));
  }

  private void assertDto(
    final LocalDate expectedDate,
    final String expectedFrom,
    final String expectedTo,
    final int expectedContactRequestCount,
    final int expectedContactCount,
    final ContactRequestStatisticsDTO dto
  ) {
    assertEquals(expectedDate.getYear(), dto.year(), "year mismatch");
    assertEquals(expectedDate.getMonthValue(), dto.month(), "month mismatch");
    assertEquals(expectedDate.getDayOfMonth(), dto.day(), "day mismatch");
    assertEquals(expectedFrom, dto.fromLang());
    assertEquals(expectedTo, dto.toLang());
    assertEquals(expectedContactRequestCount, dto.contactRequestCount(), "contactRequestCount mismatch");
    assertEquals(expectedContactCount, dto.contactCount(), "contactCount mismatch");
  }

  private void createContactRequestStat(
    final LocalDate date,
    final String from,
    final String to,
    final int contactRequestCount,
    final int contactCount
  ) {
    entityManager.persist(Factory.contactRequestStatistic(date, from, to, contactRequestCount, contactCount));
  }

  @Test
  public void testGenerateEmailStatistics() {
    generateEmails(10, EmailType.AUTHORISATION_EXPIRY);
    generateEmails(10, EmailType.CONTACT_REQUEST_CLERK);
    generateEmails(11, EmailType.CONTACT_REQUEST_REQUESTER);
    generateEmails(12, EmailType.CONTACT_REQUEST_TRANSLATOR);
    generateEmails(13, EmailType.INFORMAL);
    generateEmails(14, EmailType.CONTACT_REQUEST_CLERK);
    generateEmails(15, EmailType.CONTACT_REQUEST_TRANSLATOR);

    statisticsService.generateEmailStatistics();
    // Another call ensures that dates containing existing statistics are listed correctly.
    statisticsService.generateEmailStatistics();

    final List<EmailStatistic> stats = emailStatisticRepository.findAll();
    assertEquals(10 + 10 + 11 + 12 + 13 + 4 + 3, stats.size());
    stats.forEach(stat ->
      assertNotEquals(
        LocalDate.now(),
        LocalDate.of(stat.getYear(), stat.getMonth(), stat.getDay()),
        "Current day should not exist in statistics"
      )
    );

    assertEmailStats(EmailType.AUTHORISATION_EXPIRY, 10, 10, stats);
    assertEmailStats(EmailType.CONTACT_REQUEST_CLERK, 14, 10 + 14, stats);
    assertEmailStats(EmailType.CONTACT_REQUEST_REQUESTER, 11, 11, stats);
    assertEmailStats(EmailType.CONTACT_REQUEST_TRANSLATOR, 15, 12 + 15, stats);
    assertEmailStats(EmailType.INFORMAL, 13, 13, stats);
  }

  private static void assertEmailStats(
    final EmailType expectedType,
    final int expectedNumberOfDays,
    final int expectedTotalSum,
    final List<EmailStatistic> stats
  ) {
    assertEquals(expectedNumberOfDays, stats.stream().filter(s -> s.getEmailType() == expectedType).count());
    assertEquals(
      expectedTotalSum,
      stats.stream().filter(s -> s.getEmailType() == expectedType).mapToLong(EmailStatistic::getCount).sum()
    );
  }

  private void generateEmails(final int forHowManyDaysBackwards, final EmailType emailType) {
    // Create emails for given number of days backwards, and for today, altogether for forHowManyDaysBackwards + 1 days.
    // Statistics should not be generated for current day, therefore we create for emails for today also and
    // expect today not to be found in statistics.
    for (int i = 0; i <= forHowManyDaysBackwards; i++) {
      final Email email = Factory.email(emailType);
      entityManager.persist(email);
      email.setCreatedAt(email.getCreatedAt().minusDays(i));
      entityManager.persistAndFlush(email);
    }
  }

  @Test
  public void testEmailStatisticsByDay() {
    final EmailStatisticsDTO dto1 = createEmailStatAndDTO(2022, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 1L);
    final EmailStatisticsDTO dto2 = createEmailStatAndDTO(2021, 3, 4, EmailType.CONTACT_REQUEST_REQUESTER, 32L);
    final EmailStatisticsDTO dto3 = createEmailStatAndDTO(2022, 1, 2, EmailType.CONTACT_REQUEST_REQUESTER, 2L);
    final EmailStatisticsDTO dto4 = createEmailStatAndDTO(2022, 1, 1, EmailType.INFORMAL, 4L);
    final EmailStatisticsDTO dto5 = createEmailStatAndDTO(2022, 2, 3, EmailType.CONTACT_REQUEST_REQUESTER, 8L);
    final EmailStatisticsDTO dto6 = createEmailStatAndDTO(2022, 2, 1, EmailType.INFORMAL, 16L);

    final List<EmailStatisticsDTO> results = statisticsService.listEmailStatisticsByDay();

    assertEquals(List.of(dto2, dto1, dto4, dto3, dto6, dto5), results);
  }

  @Test
  public void testEmailStatisticsByMonth() {
    createEmailStat(2022, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 1L);
    createEmailStat(2021, 3, 4, EmailType.CONTACT_REQUEST_REQUESTER, 32L);
    createEmailStat(2022, 1, 2, EmailType.CONTACT_REQUEST_REQUESTER, 2L);
    createEmailStat(2022, 1, 1, EmailType.INFORMAL, 4L);
    createEmailStat(2022, 2, 3, EmailType.CONTACT_REQUEST_REQUESTER, 8L);
    createEmailStat(2022, 2, 1, EmailType.INFORMAL, 16L);

    final List<EmailStatisticsDTO> results = statisticsService.listEmailStatisticsByMonth();

    assertEquals(
      List.of(
        createDTO(2021, 3, 1, EmailType.CONTACT_REQUEST_REQUESTER, 32),
        createDTO(2022, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 3),
        createDTO(2022, 1, 1, EmailType.INFORMAL, 4),
        createDTO(2022, 2, 1, EmailType.CONTACT_REQUEST_REQUESTER, 8),
        createDTO(2022, 2, 1, EmailType.INFORMAL, 16)
      ),
      results
    );
  }

  @Test
  public void testEmailStatisticsByYear() {
    createEmailStat(2022, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 1L);
    createEmailStat(2021, 3, 4, EmailType.CONTACT_REQUEST_REQUESTER, 64L);
    createEmailStat(2022, 1, 2, EmailType.CONTACT_REQUEST_REQUESTER, 2L);
    createEmailStat(2022, 1, 1, EmailType.INFORMAL, 4L);
    createEmailStat(2022, 2, 3, EmailType.CONTACT_REQUEST_REQUESTER, 8L);
    createEmailStat(2022, 2, 1, EmailType.INFORMAL, 16L);
    createEmailStat(2021, 2, 1, EmailType.INFORMAL, 32L);

    final List<EmailStatisticsDTO> results = statisticsService.listEmailStatisticsByYear();

    assertEquals(
      List.of(
        createDTO(2021, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 64),
        createDTO(2021, 1, 1, EmailType.INFORMAL, 32),
        createDTO(2022, 1, 1, EmailType.CONTACT_REQUEST_REQUESTER, 11),
        createDTO(2022, 1, 1, EmailType.INFORMAL, 20)
      ),
      results
    );
  }

  private EmailStatisticsDTO createEmailStatAndDTO(
    final int year,
    final int month,
    final int day,
    final EmailType emailType,
    final long count
  ) {
    createEmailStat(year, month, day, emailType, count);
    return createDTO(year, month, day, emailType, count);
  }

  private void createEmailStat(
    final int year,
    final int month,
    final int day,
    final EmailType emailType,
    final long count
  ) {
    entityManager.persist(Factory.emailStatistic(LocalDate.of(year, month, day), emailType, count));
  }

  private static EmailStatisticsDTO createDTO(
    final int year,
    final int month,
    final int day,
    final EmailType emailType,
    final long count
  ) {
    return EmailStatisticsDTO.builder().year(year).month(month).day(day).emailType(emailType).count(count).build();
  }
}
