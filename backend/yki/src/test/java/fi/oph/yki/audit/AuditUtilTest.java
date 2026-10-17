package fi.oph.yki.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.google.gson.JsonObject;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class AuditUtilTest {

  private static final String OID = "1.2.3.4.5";

  @AfterEach
  public void tearDown() {
    SecurityContextHolder.clearContext();
    RequestContextHolder.resetRequestAttributes();
  }

  private static void setRequest() {
    final MockHttpServletRequest request = new MockHttpServletRequest();
    request.setRemoteAddr("10.0.0.1");
    request.addHeader("User-Agent", "test-agent");
    RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
  }

  @Test
  public void testGetPublicUserWithSessionOid() {
    setRequest();
    SecurityContextHolder.getContext().setAuthentication(new PreAuthenticatedAuthenticationToken(OID, null, List.of()));

    final JsonObject user = AuditUtil.getPublicUser().asJson();

    assertEquals(OID, user.get("oid").getAsString());
    assertEquals("10.0.0.1", user.get("ip").getAsString());
    assertEquals("test-agent", user.get("userAgent").getAsString());
  }

  @Test
  public void testGetPublicUserWithAnonymousAuthenticationHasNoOid() {
    setRequest();
    SecurityContextHolder
      .getContext()
      .setAuthentication(
        new AnonymousAuthenticationToken("key", "anonymousUser", AuthorityUtils.createAuthorityList("ROLE_ANONYMOUS"))
      );

    final JsonObject user = AuditUtil.getPublicUser().asJson();

    assertFalse(user.has("oid"));
    assertEquals("10.0.0.1", user.get("ip").getAsString());
  }

  @Test
  public void testGetPublicUserWithoutAuthenticationHasNoOid() {
    setRequest();

    final JsonObject user = AuditUtil.getPublicUser().asJson();

    assertFalse(user.has("oid"));
    assertEquals("10.0.0.1", user.get("ip").getAsString());
  }

  @Test
  public void testGetPublicUserWithoutRequestHasNoOid() {
    SecurityContextHolder.getContext().setAuthentication(new PreAuthenticatedAuthenticationToken(OID, null, List.of()));

    final JsonObject user = AuditUtil.getPublicUser().asJson();

    assertFalse(user.has("oid"));
  }
}
