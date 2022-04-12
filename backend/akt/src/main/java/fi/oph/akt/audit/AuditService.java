package fi.oph.akt.audit;

import fi.oph.akt.model.Translator;
import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.Changes;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.auditlog.User;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuditService {

  private static final Logger LOG = LoggerFactory.getLogger(AuditService.class);

  @Resource
  private final Audit audit;

  @Value("${dev.web.security.off:false}")
  private Boolean devWebSecurityOff;

  public void logOperation(final AktOperation operation) {
    log(operation, new Target.Builder().build(), Changes.EMPTY);
  }

  public void logById(final AktOperation operation, final long id) {
    log(operation, new Target.Builder().setField("id", Long.toString(id)).build(), Changes.EMPTY);
  }

  public void logAuthorisation(final AktOperation operation, final Translator translator, final long authorisationId) {
    log(
      operation,
      new Target.Builder()
        .setField("translatorId", Long.toString(translator.getId()))
        .setField("authorisationId", Long.toString(authorisationId))
        .build(),
      Changes.EMPTY
    );
  }

  private void log(final AktOperation operation, final Target target, final Changes changes) {
    final User user = getUser();
    audit.log(user, operation, target, changes);
  }

  private User getUser() {
    if (devWebSecurityOff) {
      // AuditUtil expects username to be Oid, anonymousUser does not work.
      LOG.warn("dev.web.security.off is OFF, auditing only IP");
      return AuditUtil.getUserOnlyWithIp();
    }
    return AuditUtil.getUser();
  }
}
