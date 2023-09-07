package fi.oph.vkt.audit;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.Changes;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.auditlog.User;
import jakarta.annotation.Resource;
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

  public void logOperation(final VktOperation operation) {
    log(operation, new Target.Builder().build(), Changes.EMPTY);
  }

  public void logById(final VktOperation operation, final long id) {
    log(operation, new Target.Builder().setField("id", Long.toString(id)).build(), Changes.EMPTY);
  }

  public <T> void logUpdate(final VktOperation operation, final long id, final T dtoBefore, final T dtoAfter) {
    log(
      operation,
      new Target.Builder().setField("id", Long.toString(id)).build(),
      Changes.updatedDto(dtoAfter, dtoBefore)
    );
  }

  private void log(final VktOperation operation, final Target target, final Changes changes) {
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
