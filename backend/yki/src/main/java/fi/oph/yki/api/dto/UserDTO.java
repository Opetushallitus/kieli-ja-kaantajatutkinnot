package fi.oph.yki.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record UserDTO(@NonNull String oid, @NonNull Boolean isAdmin, @NonNull Boolean isOrganizer) {}
