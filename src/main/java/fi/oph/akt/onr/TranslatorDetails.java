package fi.oph.akt.onr;

import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDate;

public record TranslatorDetails(@NonNull String firstName, @NonNull String lastName, String email, String phone,
		String mobilePhone, String street, String postalCode, String town, String country, LocalDate birthDate,
		String identityNumber) {

	@Builder
	public TranslatorDetails {
	}
}
