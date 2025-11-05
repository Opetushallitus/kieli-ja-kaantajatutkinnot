package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;

public record ClerkCustomerPastExamDTO(
  LocalDate examinationDate,
  ClerkExamDTO exam,
  ClerkExamLocationDTO examLocation,
  String state
) {}
