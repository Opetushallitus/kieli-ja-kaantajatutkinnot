package fi.oph.yki.service.keha;

/**
 * Provides the Bearer token (TE-Digi B2C, claim yki.read) for the KIPA P81 API.
 */
public interface KehaTokenProvider {
  String getToken();
}
