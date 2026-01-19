package fi.oph.yki.api.dto;

import fi.oph.yki.model.type.FreeRegistrationSource;
import fi.oph.yki.model.type.FreeRegistrationType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEducationBasisDTO(
  @NotNull @NonNull FreeRegistrationSource source,
  @NotNull @NonNull FreeRegistrationType educationType,
  String countryOfEducation
) {}
