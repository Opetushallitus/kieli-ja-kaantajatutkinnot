package fi.oph.otr.audit;

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

  public void logOperation(final OtrOperation operation) {
    log(operation, new Target.Builder().build(), Changes.EMPTY);
  }

  public void logById(final OtrOperation operation, final long id) {
    log(operation, new Target.Builder().setField("id", Long.toString(id)).build(), Changes.EMPTY);
  }

  private void log(final OtrOperation operation, final Target target, final Changes changes) {
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
