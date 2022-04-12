package fi.oph.akt.service.email.sender;

import fi.oph.akt.service.email.EmailData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EmailSenderNoOp implements EmailSender {

  private static final Logger LOG = LoggerFactory.getLogger(EmailSenderNoOp.class);

  @Override
  public String sendEmail(final EmailData emailData) {
    LOG.info("{}", emailData);
    return "no-op";
  }
}
