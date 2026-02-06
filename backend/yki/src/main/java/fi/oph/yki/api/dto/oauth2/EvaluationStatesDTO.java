package fi.oph.yki.api.dto.oauth2;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.NonNull;

public record EvaluationStatesDTO(@NonNull @NotNull List<EvaluationStateDTO> tilat) {}
