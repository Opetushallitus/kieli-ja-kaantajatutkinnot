package fi.oph.otr.service.email.sender;

import fi.oph.otr.service.email.EmailData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EmailSenderNoOp implements EmailSender {

  private static final Logger LOG = LoggerFactory.getLogger(EmailSenderNoOp.class);

  @Override
  public String sendEmail(final EmailData emailData) {
    LOG.debug("{}", emailData);
    return "no-op";
  }
}
