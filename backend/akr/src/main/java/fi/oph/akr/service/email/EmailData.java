package fi.oph.akr.service.email;

import fi.oph.akr.model.Email;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EmailData(
  Long id,
  @NonNull @Size(max = 128) String recipientName,
  @NonNull @Size(max = 512) String recipientAddress,
  @NonNull @Size(max = 255) String subject,
  @NonNull @Size(max = 6291456) String body
) {
  public static EmailData createFromEmail(final Email email) {
    return EmailData
      .builder()
      .id(email.getId())
      .recipientName(email.getRecipientName())
      .recipientAddress(email.getRecipientAddress())
      .subject(email.getSubject())
      .body(email.getBody())
      .build();
  }
}
