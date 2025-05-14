package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

import java.util.List;

@Builder
public record RegisterEnrollmentDTO(
 @NonNull @NotNull String taitotaso,
 @NonNull @NotNull String kieli,
 @NonNull @NotNull String organisaatioOid,
 @NonNull @NotNull List<PartialExamsDTO> osakokeet,
 @NonNull @NotNull SourceDTO lahdejarjestelmanId,
 @NonNull @NotNull String tyyppi
) {

}
