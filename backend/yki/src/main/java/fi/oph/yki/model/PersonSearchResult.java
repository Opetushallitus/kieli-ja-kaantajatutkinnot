package fi.oph.yki.model;

import jakarta.annotation.Nullable;
import java.time.Instant;

/** Holds data from PersonRepository.findAllPersons() query. */
public record PersonSearchResult(
  // Osallistujan tiedot
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
