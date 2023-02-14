package fi.oph.vkt.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicSessionDTO(@NonNull Long id, @NonNull String sessionHash) {}
