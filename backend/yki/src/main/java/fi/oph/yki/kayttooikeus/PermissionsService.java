package fi.oph.yki.kayttooikeus;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusDTO;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.HashSet;
import java.util.List;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants.Methods;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PermissionsService {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper()
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
  public static final String YKI_PALVELU = "YKI";

  private final CasClient casPermissionsClient;
  private final RequestBuilder defaultRequestBuilder;
  private final String kayttooikeusServiceUrl;

  public PermissionsService(
    CasClient casPermissionsClient,
    @Qualifier("casRequestBuilder") RequestBuilder requestBuilder,
    @Value("${app.kayttooikeus-service.url}") String kayttooikeusServiceUrl
  ) {
    this.casPermissionsClient = casPermissionsClient;
    this.defaultRequestBuilder = requestBuilder;
    this.kayttooikeusServiceUrl = kayttooikeusServiceUrl;
  }

  //@Cacheable(CacheConfig.PERMISSIONS_CACHE)
  public KayttooikeusResponseDTO getPermissionForUsername(final String oid) {
    if (oid == null || oid.isEmpty()) {
      throw new RuntimeException("OID is not valid: " + oid);
    }

    final Request request = defaultRequestBuilder
      .setUrl(kayttooikeusServiceUrl + "/kayttooikeus/kayttaja?oidHenkilo=" + oid)
      .setMethod(Methods.GET)
      .build();

    try {
      final Response response = casPermissionsClient.executeAndRetryWithCleanSessionOnStatusCodesBlocking(
        request,
        new HashSet<>(List.of(302))
      );
      if (response.getStatusCode() != HttpStatus.OK.value()) {
        throw new RuntimeException("Could not get user by oid " + oid + ", status: " + response.getStatusCode());
      }

      final List<KayttooikeusResponseDTO> results = OBJECT_MAPPER.readValue(
        response.getResponseBody(),
        new TypeReference<>() {}
      );

      if (results.isEmpty()) {
        throw new RuntimeException("No user found by oid " + oid);
      }

      if (results.size() > 1) {
        throw new RuntimeException(
          "Response has multiple users, don't know what to do. Result size: " + results.size()
        );
      }

      final KayttooikeusResponseDTO kayttooikeusResponseDTO = results.get(0);
      if (!oid.equals(kayttooikeusResponseDTO.oidHenkilo())) {
        throw new RuntimeException(
          String.format("Response OID does not match %s != %s ", kayttooikeusResponseDTO.oidHenkilo(), oid)
        );
      }

      return kayttooikeusResponseDTO;
    } catch (final Exception e) {
      throw new RuntimeException("Fetching permissions failed for oid " + oid, e);
    }
  }

  private boolean hasOikeus(final List<KayttooikeusDTO> kayttooikeudet, final String oikeus) {
    return kayttooikeudet.stream().anyMatch(k -> YKI_PALVELU.equals(k.palvelu()) && oikeus.equals(k.oikeus()));
  }

  public boolean hasPermissionForOrganisation(
    final KayttooikeusResponseDTO kayttooikeusResponseDTO,
    final String organizationOid,
    final String role
  ) {
    return kayttooikeusResponseDTO
      .organisaatiot()
      .stream()
      .anyMatch(o -> organizationOid.equals(o.organisaatioOid()) && hasOikeus(o.kayttooikeudet(), role));
  }

  public boolean hasReadPermission(final KayttooikeusResponseDTO kayttooikeusResponseDTO) {
    return kayttooikeusResponseDTO
      .organisaatiot()
      .stream()
      .anyMatch(o -> hasOikeus(o.kayttooikeudet(), "ILMOITTAUTUMISET_R"));
  }

  public boolean hasAdminPermission(KayttooikeusResponseDTO kayttooikeusResponseDTO) {
    return kayttooikeusResponseDTO
      .organisaatiot()
      .stream()
      .anyMatch(o ->
        "1.2.246.562.10.00000000001".equals(o.organisaatioOid()) && hasOikeus(o.kayttooikeudet(), "YLLAPITAJA")
      );
  }
}
