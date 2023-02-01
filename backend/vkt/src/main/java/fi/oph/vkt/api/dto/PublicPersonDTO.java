package fi.oph.vkt.api.dto;

import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicPersonDTO(
  @NonNull Long id,
  @NonNull @Size(min = 3, max = 12) String identityNumber,
  @NonNull @Size(min = 2, max = 255) String lastName,
  @NonNull @Size(min = 2, max = 255) String firstName
) {}
