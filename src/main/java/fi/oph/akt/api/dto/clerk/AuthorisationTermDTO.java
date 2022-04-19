package fi.oph.akt.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

import java.time.LocalDate;

public record AuthorisationTermDTO(@NonNull LocalDate beginDate, LocalDate endDate) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public AuthorisationTermDTO {
	}
}
