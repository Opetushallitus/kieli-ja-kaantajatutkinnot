package fi.oph.akr.service;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO;
import fi.oph.akr.api.dto.clerk.EmailStatisticsDTO;
import fi.oph.akr.model.ContactRequest;
import fi.oph.akr.model.ContactRequestStatistic;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailStatistic;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.repository.ContactRequestRepository;
import fi.oph.akr.repository.ContactRequestStatisticRepository;
import fi.oph.akr.repository.EmailRepository;
import fi.oph.akr.repository.EmailStatisticRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StatisticsService {

  private final ContactRequestStatisticRepository contactRequestStatisticRepository;
  private final EmailStatisticRepository emailStatisticRepository;
  private final ContactRequestRepository contactRequestRepository;
  private final EmailRepository emailRepository;

  @Transactional
  public void generateContactRequestStatistics() {
    final Set<LocalDate> existingStatisticDates = contactRequestStatisticRepository
      .listExistingStatisticDates()
      .stream()
      .map(t -> LocalDate.of(t.getLeft(), t.getMiddle(), t.getRight()))
      .collect(Collectors.toSet());
    final Map<LocalDate, List<ContactRequest>> contactRequestsByDate = contactRequestRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(c -> c.getCreatedAt().toLocalDate()));

    contactRequestsByDate.forEach((date, contactRequests) -> {
      if (!existingStatisticDates.contains(date) && !LocalDate.now().isEqual(date)) {
        final List<ContactRequestStatistic> stats = generateContactRequestStatisticsForDate(date, contactRequests);
        contactRequestStatisticRepository.saveAll(stats);
      }
    });
  }

  private static List<ContactRequestStatistic> generateContactRequestStatisticsForDate(
    final LocalDate date,
    final List<ContactRequest> contactRequests
  ) {
    final Map<LanguagePairDTO, List<ContactRequest>> byLanguagePair = contactRequests
      .stream()
      .collect(Collectors.groupingBy(c -> LanguagePairDTO.builder().from(c.getFromLang()).to(c.getToLang()).build()));
    return byLanguagePair
      .entrySet()
      .stream()
      .map(e -> createContactRequestStatistic(date, e.getKey(), e.getValue()))
      .toList();
  }

  private static ContactRequestStatistic createContactRequestStatistic(
    final LocalDate date,
    final LanguagePairDTO langPair,
    final List<ContactRequest> contactRequests
  ) {
    final ContactRequestStatistic stat = new ContactRequestStatistic();
    stat.setYear(date.getYear());
    stat.setMonth(date.getMonthValue());
    stat.setDay(date.getDayOfMonth());
    stat.setFromLang(langPair.from());
    stat.setToLang(langPair.to());
    stat.setContactRequestCount(contactRequests.size());
    stat.setContactCount(contactRequests.stream().mapToInt(c -> c.getContactRequestTranslators().size()).sum());
    return stat;
  }

  @Transactional
  public void generateEmailStatistics() {
    final Set<LocalDate> existingStatisticDates = emailStatisticRepository
      .listExistingStatisticDates()
      .stream()
      .map(t -> LocalDate.of(t.getLeft(), t.getMiddle(), t.getRight()))
      .collect(Collectors.toSet());
    final Map<LocalDate, List<Email>> emailsByDate = emailRepository
      .findAll()
      .stream()
      .collect(Collectors.groupingBy(e -> e.getCreatedAt().toLocalDate()));

    emailsByDate.forEach((date, emails) -> {
      if (!existingStatisticDates.contains(date) && !LocalDate.now().isEqual(date)) {
        final List<EmailStatistic> stats = generateEmailStatisticsForDate(date, emails);
        emailStatisticRepository.saveAll(stats);
      }
    });
  }

  private static List<EmailStatistic> generateEmailStatisticsForDate(final LocalDate date, final List<Email> emails) {
    final Map<EmailType, List<Email>> byEmailType = emails.stream().collect(Collectors.groupingBy(Email::getEmailType));
    return byEmailType.entrySet().stream().map(e -> createEmailStatistic(date, e.getKey(), e.getValue())).toList();
  }

  private static EmailStatistic createEmailStatistic(
    final LocalDate date,
    final EmailType emailType,
    final List<Email> emails
  ) {
    final EmailStatistic stat = new EmailStatistic();
    stat.setYear(date.getYear());
    stat.setMonth(date.getMonthValue());
    stat.setDay(date.getDayOfMonth());
    stat.setEmailType(emailType);
    stat.setCount(emails.size());
    return stat;
  }

  @Transactional(readOnly = true)
  public List<ContactRequestStatisticsDTO> listContactRequestStatisticsByDay() {
    return contactRequestStatisticRepository.calculateByDay();
  }

  @Transactional(readOnly = true)
  public List<ContactRequestStatisticsDTO> listContactRequestStatisticsByMonth() {
    return contactRequestStatisticRepository.calculateByMonth();
  }

  @Transactional(readOnly = true)
  public List<ContactRequestStatisticsDTO> listContactRequestStatisticsByYear() {
    return contactRequestStatisticRepository.calculateByYear();
  }

  @Transactional(readOnly = true)
  public List<EmailStatisticsDTO> listEmailStatisticsByDay() {
    return emailStatisticRepository.calculateByDay();
  }

  @Transactional(readOnly = true)
  public List<EmailStatisticsDTO> listEmailStatisticsByMonth() {
    return emailStatisticRepository.calculateByMonth();
  }

  @Transactional(readOnly = true)
  public List<EmailStatisticsDTO> listEmailStatisticsByYear() {
    return emailStatisticRepository.calculateByYear();
  }
}
