package fi.oph.vkt.api.dto.integration;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record SourceDTO(@NonNull @NotNull String id, @NonNull @NotNull String lahde) {}
