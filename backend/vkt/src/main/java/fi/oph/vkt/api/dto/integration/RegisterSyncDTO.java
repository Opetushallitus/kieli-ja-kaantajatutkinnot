package fi.oph.vkt.api.dto.integration;

import fi.oph.vkt.api.dto.EnrollmentDTOSkillFields;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.type.EnrollmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegisterSyncDTO(
  @NonNull @NotNull RegisterPersonDTO henkilo,
  @NonNull @NotNull RegisterEnrollmentDTO suoritus
) {}
