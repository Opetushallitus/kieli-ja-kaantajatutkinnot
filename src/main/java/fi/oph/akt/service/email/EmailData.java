package fi.oph.akt.service.email;

import fi.oph.akt.model.Email;
import lombok.Builder;
import lombok.NonNull;

public record EmailData(@NonNull String sender, @NonNull String recipient, @NonNull String subject,
		@NonNull String body) {
	// Workaround for bug in IntelliJ lombok plugin
	// https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
	@Builder
	public EmailData {
	}

	public static EmailData createFromEmail(final Email email) {
		// @formatter:off
		return EmailData.builder()
				.sender(email.getSender())
				.recipient(email.getRecipient())
				.subject(email.getSubject())
				.body(email.getBody()).build();
        // @formatter:on
	}
}
