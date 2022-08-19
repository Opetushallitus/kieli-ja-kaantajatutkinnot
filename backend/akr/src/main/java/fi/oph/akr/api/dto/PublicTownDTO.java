package fi.oph.akr.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record PublicTownDTO(@NonNull String name, String country) {}
