package fi.oph.akt.api.dto;

import java.util.List;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

import lombok.Builder;

public record ContactRequestDTO(@NotEmpty @Size(max = 255) String firstName, @NotEmpty @Size(max = 255) String lastName,
		@NotEmpty @Email String email, @Size(max = 255) String phoneNumber, @NotEmpty @Size(max = 6000) String message,
		@NotEmpty @Size(max = 10) String fromLang, @NotEmpty @Size(max = 10) String toLang,
		@NotEmpty List<Long> translatorIds) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public ContactRequestDTO {
	}
}
