package fi.oph.akt.api.dto.clerk;

import fi.oph.akt.model.AuthorisationBasis;
import lombok.Builder;
import lombok.NonNull;

import java.util.List;

public record ClerkTranslatorAuthorisationDTO(@NonNull AuthorisationBasis basis, AuthorisationTermDTO term,
		@NonNull List<ClerkLanguagePairDTO> languagePairs) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public ClerkTranslatorAuthorisationDTO {
	}
}
