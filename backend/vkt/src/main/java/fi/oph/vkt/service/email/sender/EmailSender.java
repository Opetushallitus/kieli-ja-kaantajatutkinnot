package fi.oph.vkt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.service.email.EmailData;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException;
}
