package fi.oph.yki.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.yki.service.email.EmailData;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException;
}
