package fi.oph.akt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.akt.service.email.EmailData;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException;
}
