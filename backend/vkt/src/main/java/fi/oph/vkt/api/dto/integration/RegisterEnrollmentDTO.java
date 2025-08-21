package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegisterEnrollmentDTO(
  @NonNull @NotNull String taitotaso,
  @NonNull @NotNull String kieli,
  String suorituksenVastaanottaja,
  String suorituspaikkakunta,
  @NonNull @NotNull List<PartialExamsDTO> osakokeet,
  @NonNull @NotNull SourceDTO lahdejarjestelmanId,
  @NonNull @NotNull String tyyppi
) {}
