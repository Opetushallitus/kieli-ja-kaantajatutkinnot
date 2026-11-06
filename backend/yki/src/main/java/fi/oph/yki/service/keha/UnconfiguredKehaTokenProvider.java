package fi.oph.yki.service.keha;

import org.springframework.stereotype.Component;

/**
 * Placeholder until KEHA delivers the authentication details (token endpoint, grant type, credentials).
 */
@Component
public class UnconfiguredKehaTokenProvider implements KehaTokenProvider {

  @Override
  public String getToken() {
    throw new IllegalStateException("KEHA token provider is not configured");
  }
}
