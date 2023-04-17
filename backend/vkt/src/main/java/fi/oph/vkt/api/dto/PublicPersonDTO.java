package fi.oph.vkt.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicPersonDTO(
  @NonNull Long id,
  String identityNumber,
  String dateOfBirth,
  String lastName,
  @NonNull String firstName
) {}
