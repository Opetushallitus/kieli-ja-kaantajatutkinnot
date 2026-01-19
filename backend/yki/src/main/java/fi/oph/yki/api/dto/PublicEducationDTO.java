package fi.oph.yki.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicEducationDTO(@NonNull String educationType, @NonNull Boolean isActive) {}
