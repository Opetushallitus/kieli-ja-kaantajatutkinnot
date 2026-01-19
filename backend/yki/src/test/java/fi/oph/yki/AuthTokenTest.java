package fi.oph.yki;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.yki.config.security.WebSecurityConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
public class AuthTokenTest {

  @Test
  public void testAuthTokenValidation() {
    final HttpServletRequest request = mock(HttpServletRequest.class);
    when(request.getHeader("Authorization"))
      .thenReturn("user:c234f5202b11f472eccc8e6b4f09f2333da50ab1f87522ae81cee79588e8ff91");

    assertTrue(WebSecurityConfig.validateToken(request, "foobar").isGranted());
  }
}
