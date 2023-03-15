package fi.oph.vkt.api.dto;

import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicPersonDTO(
  @NonNull Long id,
  @NonNull String identityNumber,
  @NonNull String lastName,
  @NonNull String firstName
) {}
