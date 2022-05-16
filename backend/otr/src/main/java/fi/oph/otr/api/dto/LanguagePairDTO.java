package fi.oph.otr.api.dto;

import javax.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record LanguagePairDTO(@NonNull @NotBlank String from, @NonNull @NotBlank String to) {}
