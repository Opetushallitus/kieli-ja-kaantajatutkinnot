package fi.oph.vkt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.service.email.EmailData;
import java.util.concurrent.ExecutionException;

public interface EmailSender {
  String sendEmail(EmailData emailData) throws JsonProcessingException, ExecutionException, InterruptedException;
}
