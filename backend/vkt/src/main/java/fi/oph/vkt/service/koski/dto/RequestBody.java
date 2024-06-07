package fi.oph.vkt.service.koski.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record RequestBody(@NonNull @NotNull String oid) {}
