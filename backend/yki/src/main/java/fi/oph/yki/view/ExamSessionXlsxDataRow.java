package fi.oph.yki.view;

import fi.oph.yki.model.type.GenderCode;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExamSessionXlsxDataRow(
  @NonNull String oid,
  @NonNull String lastName,
  @NonNull String firstName,
  String state,
  String type,
  String email,
  String phone,
  GenderCode gender,
  String nationalityCode,
  String streetAddress,
  String zip,
  String postOffice,
  String originalExamDate,
  String examLang,
  String certificateLang,
  String nationalityDesc,
  String identityNumber,
  String birthdate
) {}
