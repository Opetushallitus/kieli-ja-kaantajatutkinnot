package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record GradeDTO(@NonNull String arvosana, @NonNull String paivamaara) {}
