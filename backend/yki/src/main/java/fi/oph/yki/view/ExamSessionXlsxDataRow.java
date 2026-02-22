package fi.oph.yki.view;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxDataRow(
  @NonNull String oid,
  @NonNull String lastName,
  @NonNull String firstName,
  String nationalityCode,
  String streetAddress,
  String zip,
  String postOffice,
  String email
) {}
