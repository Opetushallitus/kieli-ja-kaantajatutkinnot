package fi.oph.akt.api.dto.clerk;

import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import lombok.Builder;
import lombok.NonNull;

import java.util.List;

public record ClerkTranslatorResponseDTO(@NonNull List<ClerkTranslatorDTO> translators,
		@NonNull LanguagePairsDictDTO langs, @NonNull List<String> towns) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public ClerkTranslatorResponseDTO {
	}
}
