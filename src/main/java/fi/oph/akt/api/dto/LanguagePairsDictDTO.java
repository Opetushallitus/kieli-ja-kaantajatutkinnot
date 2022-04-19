package fi.oph.akt.api.dto;

import lombok.Builder;
import lombok.NonNull;

import java.util.List;

public record LanguagePairsDictDTO(@NonNull List<String> from, @NonNull List<String> to) {

	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public LanguagePairsDictDTO {
	}
}
