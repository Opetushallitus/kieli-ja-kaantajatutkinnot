package fi.oph.akt.api.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.List;

public record PublicTranslatorDTO(long id, @NonNull String firstName, @NonNull String lastName, String town,
		String country, @NonNull List<PublicLanguagePairDTO> languagePairs) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public PublicTranslatorDTO {
	}
}
