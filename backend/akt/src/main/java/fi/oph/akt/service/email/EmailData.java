package fi.oph.akt.service.email;

import fi.oph.akt.model.Email;
import lombok.Builder;
import lombok.NonNull;

public record EmailData(
  @NonNull String recipientName,
  @NonNull String recipientAddress,
  @NonNull String subject,
  @NonNull String body
) {
  // Workaround for bug in IntelliJ lombok plugin
  // https://github.com/mplushnikov/lombok-intellij-plugin/issues/764
  @Builder
  public EmailData {}

  public static EmailData createFromEmail(final Email email) {
    return EmailData
      .builder()
      .recipientName(email.getRecipientName())
      .recipientAddress(email.getRecipientAddress())
      .subject(email.getSubject())
      .body(email.getBody())
      .build();
  }
}
