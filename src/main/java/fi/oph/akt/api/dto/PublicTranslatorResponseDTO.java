package fi.oph.akt.api.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.List;

public record PublicTranslatorResponseDTO(@NonNull List<PublicTranslatorDTO> translators,
		@NonNull LanguagePairsDictDTO langs, @NonNull List<String> towns) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public PublicTranslatorResponseDTO {
	}
}
