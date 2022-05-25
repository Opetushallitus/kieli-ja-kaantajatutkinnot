package fi.oph.otr.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.otr.service.email.EmailData;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException;
}
