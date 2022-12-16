package fi.oph.vkt.service.email;

import fi.oph.vkt.model.EmailAttachment;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record EmailAttachmentData(@NonNull String name, @NonNull String contentType, byte@NonNull[] data) {
  public static EmailAttachmentData createFromEmailAttachment(final EmailAttachment emailAttachment) {
    return EmailAttachmentData
      .builder()
      .name(emailAttachment.getName())
      .contentType(emailAttachment.getContentType())
      .data(emailAttachment.getData())
      .build();
  }
}
