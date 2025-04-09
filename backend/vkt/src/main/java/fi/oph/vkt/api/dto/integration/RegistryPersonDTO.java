package fi.oph.vkt.api.dto.integration;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegistryPersonDTO(@NonNull Long id, @NonNull String lastName, @NonNull String firstName, String oid) {}
