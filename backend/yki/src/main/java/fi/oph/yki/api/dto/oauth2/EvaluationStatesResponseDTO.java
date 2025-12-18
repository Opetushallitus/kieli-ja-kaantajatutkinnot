package fi.oph.yki.api.dto.oauth2;

import java.util.List;
import lombok.Builder;

@Builder
public record EvaluationStatesResponseDTO(int hyvaksytyt, List<EvaluationStateErrorDTO> virheet) {}
