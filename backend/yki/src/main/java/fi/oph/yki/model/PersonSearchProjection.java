package fi.oph.yki.model;

import jakarta.annotation.Nullable;

 public record PersonSearchProjection(
  String oid,
  String firstName,
  String lastName,
  @Nullable String email,
  @Nullable String phoneNumber,
  @Nullable String streetAddress,
  @Nullable String postOffice,
  @Nullable String zip,
  @Nullable String nationalityCode,
  @Nullable String gender,
  @Nullable Long registrationsCount
) {}
