package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkPaymentReportRowDTO;
import fi.oph.yki.repository.ExamPaymentRepository;
import fi.oph.yki.repository.PaymentReportProjection;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkPaymentReportService {

  private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  private static final Map<String, String> LANGUAGE_NAMES_FI = Map.of(
    "fin",
    "suomi",
    "swe",
    "ruotsi",
    "eng",
    "englanti",
    "spa",
    "espanja",
    "ita",
    "italia",
    "fra",
    "ranska",
    "sme",
    "saame",
    "deu",
    "saksa",
    "rus",
    "venäjä"
  );

  private static final Map<String, String> LEVEL_NAMES_FI = Map.of(
    "PERUS",
    "Perustaso",
    "KESKI",
    "Keskitaso",
    "YLIN",
    "Ylin taso"
  );

  private final ExamPaymentRepository examPaymentRepository;
  private final OrganizationService organizationService;

  @Transactional(readOnly = true)
  public List<ClerkPaymentReportRowDTO> getPaymentReport(final LocalDate from, final LocalDate to) {
    final LocalDate toExclusive = to.plusDays(1);

    final List<PaymentReportProjection> paidPayments = examPaymentRepository.findCompletedPaymentsForTimeRange(
      from,
      toExclusive
    );
    final List<PaymentReportProjection> freeRegistrations = examPaymentRepository.findFreeRegistrationsForTimeRange(
      from,
      toExclusive
    );

    final List<PaymentReportProjection> allRows = Stream
      .concat(paidPayments.stream(), freeRegistrations.stream())
      .toList();

    final Map<String, String> organizerNames = organizationService.getOrganizationNames(
      allRows.stream().map(PaymentReportProjection::getOrganizerOid).distinct().toList()
    );

    return allRows
      .stream()
      .map(row -> toDTO(row, organizerNames))
      .sorted(
        Comparator
          .comparing(ClerkPaymentReportRowDTO::organizer, Comparator.nullsLast(String::compareToIgnoreCase))
          .thenComparing(ClerkPaymentReportRowDTO::lastName, Comparator.nullsLast(String::compareToIgnoreCase))
          .thenComparing(ClerkPaymentReportRowDTO::firstName, Comparator.nullsLast(String::compareToIgnoreCase))
      )
      .toList();
  }

  private static ClerkPaymentReportRowDTO toDTO(
    final PaymentReportProjection row,
    final Map<String, String> organizerNames
  ) {
    return ClerkPaymentReportRowDTO
      .builder()
      .organizer(organizerNames.getOrDefault(row.getOrganizerOid(), row.getOrganizerOid()))
      .lastName(row.getLastName())
      .firstName(row.getFirstName())
      .email(row.getEmail())
      .paidAt(formatPaidAt(row.getPaidAt()))
      .examDate(row.getExamDate())
      .originalExamDate(row.getOriginalExamDate())
      .examLanguage(LANGUAGE_NAMES_FI.getOrDefault(row.getLanguageCode(), row.getLanguageCode()))
      .examLevel(LEVEL_NAMES_FI.getOrDefault(row.getLevelCode(), row.getLevelCode()))
      .amount(formatAmount(row.getAmount()))
      .reference(row.getReference())
      .frSource(formatFrSource(row.getFrSource()))
      .frIsForeign(row.getFrIsForeign())
      .frMatriculationExam(row.getFrMatriculationExam())
      .frEb(row.getFrEb())
      .frDia(row.getFrDia())
      .frHigherEducationConcluded(row.getFrHigherEducationConcluded())
      .frHigherEducationEnrolled(row.getFrHigherEducationEnrolled())
      .build();
  }

  private static String formatPaidAt(final LocalDateTime paidAt) {
    if (paidAt == null) {
      return null;
    }
    return paidAt.format(DATETIME_FORMATTER);
  }

  private static String formatAmount(final BigDecimal amount) {
    if (amount == null) {
      return "0,00";
    }
    final BigDecimal amountInEur = amount.divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    return String.format("%.2f", amountInEur.doubleValue()).replace('.', ',');
  }

  private static String formatFrSource(final String source) {
    if (source == null) {
      return null;
    }
    return switch (source) {
      case "KOSKI" -> "KOSKI";
      case "USER" -> "Asiakas";
      default -> source;
    };
  }
}
