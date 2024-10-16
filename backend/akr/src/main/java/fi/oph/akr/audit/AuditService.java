package fi.oph.akr.audit;

import fi.oph.akr.model.Translator;
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

  public void logOperation(final AkrOperation operation) {
    log(operation, new Target.Builder().build(), Changes.EMPTY);
  }

  public void logById(final AkrOperation operation, final long id) {
    log(operation, new Target.Builder().setField("id", Long.toString(id)).build(), Changes.EMPTY);
  }

  public void logPersonSearchByIdentityNumber(final String identityNumber) {
    log(
      AkrOperation.PERSON_SEARCH_BY_IDENTITY_NUMBER,
      new Target.Builder().setField("identityNumber", identityNumber).build(),
      Changes.EMPTY
    );
  }

  public <T> void logAuthorisation(
    final AkrOperation operation,
    final Translator translator,
    final long authorisationId
  ) {
    log(
      operation,
      new Target.Builder()
        .setField("translatorId", Long.toString(translator.getId()))
        .setField("authorisationId", Long.toString(authorisationId))
        .build(),
      Changes.EMPTY
    );
  }

  public <T> void logAuthorisation(
    final AkrOperation operation,
    final long translatorId,
    final long authorisationId,
    final T dto
  ) {
    log(
      operation,
      new Target.Builder()
        .setField("translatorId", Long.toString(translatorId))
        .setField("authorisationId", Long.toString(authorisationId))
        .build(),
      Changes.addedDto(dto)
    );
  }

  public <T> void logAuthorisation(
    final AkrOperation operation,
    final Translator translator,
    final long authorisationId,
    final T dtoBefore,
    final T dtoAfter
  ) {
    log(
      operation,
      new Target.Builder()
        .setField("translatorId", Long.toString(translator.getId()))
        .setField("authorisationId", Long.toString(authorisationId))
        .build(),
      Changes.updatedDto(dtoAfter, dtoBefore)
    );
  }

  public <T> void logUpdate(final AkrOperation operation, final long id, final T dtoBefore, final T dtoAfter) {
    log(
      operation,
      new Target.Builder().setField("id", Long.toString(id)).build(),
      Changes.updatedDto(dtoAfter, dtoBefore)
    );
  }

  public <T> void logCreate(final AkrOperation operation, final long id, final T dto) {
    log(operation, new Target.Builder().setField("id", Long.toString(id)).build(), Changes.addedDto(dto));
  }

  private void log(final AkrOperation operation, final Target target, final Changes changes) {
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
