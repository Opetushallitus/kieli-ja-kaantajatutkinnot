package fi.oph.vkt.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicPersonDTO(
  @NonNull Long id,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName
) {}
