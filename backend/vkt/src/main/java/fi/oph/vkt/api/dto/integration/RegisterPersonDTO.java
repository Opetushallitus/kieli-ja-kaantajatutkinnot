package fi.oph.vkt.api.dto.integration;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record RegisterPersonDTO(@NonNull String etunimet, @NonNull String sukunimi, String oid) {}
