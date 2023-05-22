package fi.oph.vkt.api.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicPersonDTO(
  @NonNull Long id,
  String identityNumber,
  LocalDate dateOfBirth,
  @NonNull String lastName,
  @NonNull String firstName
) {}
