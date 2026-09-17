package fi.oph.yki.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;

public class PublicAuthServiceTest {

  private static final String TOKEN = "foobar";

  private static final String VALID_AUTHORIZATION =
    "user:c234f5202b11f472eccc8e6b4f09f2333da50ab1f87522ae81cee79588e8ff91";

  private static HttpServletRequest requestWithAuthorization(final String authorization) {
    final HttpServletRequest request = mock(HttpServletRequest.class);
    when(request.getHeader("Authorization")).thenReturn(authorization);

    return request;
  }

  @Test
  public void testConfiguredOidWinsOverHeader() {
    final PublicAuthService service = new PublicAuthService("1.2.3.4.5", TOKEN);

    assertEquals("1.2.3.4.5", service.getIdentity(requestWithAuthorization(VALID_AUTHORIZATION)).oid());
  }

  @Test
  public void testOidFromValidProxyHeader() {
    final PublicAuthService service = new PublicAuthService("", TOKEN);

    assertEquals("user", service.getIdentity(requestWithAuthorization(VALID_AUTHORIZATION)).oid());
  }

  @Test
  public void testNoOidWithInvalidProxyHeader() {
    final PublicAuthService service = new PublicAuthService("", TOKEN);

    assertNull(service.getIdentity(requestWithAuthorization("user:wronghash")).oid());
  }

  @Test
  public void testNoOidWithoutHeader() {
    final PublicAuthService service = new PublicAuthService("", TOKEN);

    assertNull(service.getIdentity(requestWithAuthorization(null)).oid());
  }
}
