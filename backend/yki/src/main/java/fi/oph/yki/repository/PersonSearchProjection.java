package fi.oph.yki.repository;

import jakarta.annotation.Nullable;
import lombok.NonNull;

public record PersonSearchProjection(
  @NonNull String oid,
  @NonNull String firstName,
  @NonNull String lastName,
  @Nullable String email,
  @Nullable String phoneNumber,
  @Nullable String streetAddress,
  @Nullable String postOffice,
  @Nullable String zip,
  @Nullable String nationalityCode,
  @Nullable String gender,
  @Nullable String countryCode,
  @Nullable Long registrationsCount
) {}
