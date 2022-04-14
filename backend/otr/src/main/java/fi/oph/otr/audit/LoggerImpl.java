package fi.oph.otr.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggerImpl implements fi.vm.sade.auditlog.Logger {

  private static final Logger LOG = LoggerFactory.getLogger(LoggerImpl.class);

  @Override
  public void log(final String msg) {
    LOG.info(msg);
  }
}
