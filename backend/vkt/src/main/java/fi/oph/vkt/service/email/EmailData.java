package fi.oph.vkt.service.email;

import fi.oph.vkt.model.Email;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EmailData(
  @NonNull String recipientName,
  @NonNull String recipientAddress,
  @NonNull String subject,
  @NonNull String body,
  List<EmailAttachmentData> attachments
) {
  public static EmailData createFromEmail(final Email email) {
    return EmailData
      .builder()
      .recipientName(email.getRecipientName())
      .recipientAddress(email.getRecipientAddress())
      .subject(email.getSubject())
      .body(email.getBody())
      .attachments(email.getAttachments().stream().map(EmailAttachmentData::createFromEmailAttachment).toList())
      .build();
  }
}
