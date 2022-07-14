package fi.oph.akr.api.dto;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record LanguagePairDTO(@NonNull String from, @NonNull String to) {}
