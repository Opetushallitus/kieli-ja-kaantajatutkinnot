package fi.oph.vkt.service.email;

import fi.oph.vkt.model.Email;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EmailData(
  Long id,
  @NonNull @Size(max = 128) String recipientName,
  @NonNull @Size(max = 512) String recipientAddress,
  @NonNull @Size(max = 255) String subject,
  @NonNull @Size(max = 6291456) String body,
  @NonNull List<EmailAttachmentData> attachments
) {
  public static EmailData createFromEmail(final Email email) {
    return EmailData
      .builder()
      .id(email.getId())
      .recipientName(email.getRecipientName())
      .recipientAddress(email.getRecipientAddress())
      .subject(email.getSubject())
      .body(email.getBody())
      .attachments(email.getAttachments().stream().map(EmailAttachmentData::createFromEmailAttachment).toList())
      .build();
  }
}
