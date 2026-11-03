package fi.oph.yki.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import fi.vm.sade.auditlog.Audit;
import fi.vm.sade.auditlog.Changes;
import fi.vm.sade.auditlog.Target;
import fi.vm.sade.auditlog.User;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class AuditServiceTest {

  private static final String OID = "1.2.3.4.5";

  private Audit audit;
  private AuditService auditService;

  @BeforeEach
  public void setup() {
    audit = mock(Audit.class);
    auditService = new AuditService(audit);

    RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));
    SecurityContextHolder.getContext().setAuthentication(new PreAuthenticatedAuthenticationToken(OID, null, List.of()));
  }

  @AfterEach
  public void tearDown() {
    SecurityContextHolder.clearContext();
    RequestContextHolder.resetRequestAttributes();
  }

  @Test
  public void testLogPublicByIdLogsSessionOid() {
    auditService.logPublicById(YkiOperation.UPDATE_PERSON_CONTACT_DETAILS, OID);

    final ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    final ArgumentCaptor<Target> target = ArgumentCaptor.forClass(Target.class);
    verify(audit)
      .log(user.capture(), eq(YkiOperation.UPDATE_PERSON_CONTACT_DETAILS), target.capture(), eq(Changes.EMPTY));

    assertEquals(OID, user.getValue().asJson().get("oid").getAsString());
    assertEquals(OID, target.getValue().asJson().get("id").getAsString());
  }

  @Test
  public void testLogPublicByIdWithoutLoginHasNoOid() {
    SecurityContextHolder.clearContext();

    auditService.logPublicById(YkiOperation.UPDATE_PERSON_CONTACT_DETAILS, OID);

    final ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
    verify(audit)
      .log(user.capture(), eq(YkiOperation.UPDATE_PERSON_CONTACT_DETAILS), any(Target.class), any(Changes.class));

    assertFalse(user.getValue().asJson().has("oid"));
  }
}
