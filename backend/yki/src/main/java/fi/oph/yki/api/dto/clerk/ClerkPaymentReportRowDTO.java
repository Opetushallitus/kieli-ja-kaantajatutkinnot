package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkPaymentReportRowDTO(
  String organizer,
  String lastName,
  String firstName,
  String email,
  String paidAt,
  LocalDate examDate,
  LocalDate originalExamDate,
  String examLanguage,
  String examLevel,
  String amount,
  String reference,
  String frSource,
  Boolean frIsForeign,
  Boolean frMatriculationExam,
  Boolean frEb,
  Boolean frDia,
  Boolean frHigherEducationConcluded,
  Boolean frHigherEducationEnrolled
) {}
