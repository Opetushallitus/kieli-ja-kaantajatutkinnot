package fi.oph.akr.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.akr.service.email.EmailData;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException;
}
