package fi.oph.akt.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

public record ClerkTranslatorContactDetailsDTO(@NonNull String firstName, @NonNull String lastName, String email,
		String phoneNumber, String identityNumber, String street, String postalCode, String town, String country) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public ClerkTranslatorContactDetailsDTO {
	}
}
