package fi.oph.yki.repository;

import fi.oph.yki.model.EmailType;
import java.time.LocalDateTime;

public interface EmailListProjection {
  Long getId();

  EmailType getEmailType();

  String getRecipientName();

  String getRecipientAddress();

  String getSubject();

  LocalDateTime getCreatedAt();

  LocalDateTime getSentAt();

  String getError();
}
