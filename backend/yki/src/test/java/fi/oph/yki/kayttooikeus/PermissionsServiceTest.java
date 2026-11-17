package fi.oph.yki.kayttooikeus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import fi.oph.yki.TestUtil;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusDTO;
import fi.oph.yki.kayttooikeus.dto.KayttooikeusResponseDTO;
import fi.oph.yki.kayttooikeus.dto.OrganisaatioDTO;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.util.List;
import java.util.Set;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PermissionsServiceTest {

  private static final String KAYTTOOIKEUS_URL = "http://localhost/kayttooikeus-service";
  private static final String USER_OID = "1.2.246.562.24.32388211111";
  private static final String ORGANIZER_OID = "1.2.246.562.10.12345678901";

  private CasClient casClient;
  private PermissionsService permissionsService;

  @BeforeEach
  public void setup() {
    casClient = mock(CasClient.class);
    permissionsService = new PermissionsService(casClient, new RequestBuilder(), KAYTTOOIKEUS_URL);
  }

  @Test
  public void testGetPermissionForUser() throws Exception {
    mockResponse(200, TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    final KayttooikeusResponseDTO kayttooikeusResponseDTO = permissionsService.getPermissionForUser(USER_OID);

    assertEquals(USER_OID, kayttooikeusResponseDTO.oidHenkilo());
    assertEquals("foo", kayttooikeusResponseDTO.username());
    assertEquals("VIRKAILIJA", kayttooikeusResponseDTO.kayttajaTyyppi());
    assertEquals(3, kayttooikeusResponseDTO.organisaatiot().size());
    final OrganisaatioDTO organisaatioDTO = kayttooikeusResponseDTO.organisaatiot().get(1);
    assertEquals(PermissionsService.OPH_OID, organisaatioDTO.organisaatioOid());
    assertEquals(34, organisaatioDTO.kayttooikeudet().size());
    assertTrue(organisaatioDTO.kayttooikeudet().contains(new KayttooikeusDTO("YKI", "JARJESTAJA")));
    assertTrue(organisaatioDTO.kayttooikeudet().contains(new KayttooikeusDTO("YKI", "YLLAPITAJA")));

    final ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(casClient).executeAndRetryWithCleanSessionOnStatusCodesBlocking(requestCaptor.capture(), eq(Set.of(302)));
    assertEquals("GET", requestCaptor.getValue().getMethod());
    assertEquals(KAYTTOOIKEUS_URL + "/kayttooikeus/kayttaja?oidHenkilo=" + USER_OID, requestCaptor.getValue().getUrl());
  }

  @Test
  public void testGetPermissionForUserWithInvalidOidThrows() {
    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser(null));
    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser(""));
    verifyNoInteractions(casClient);
  }

  @Test
  public void testGetPermissionForUserWithErrorStatusThrows() throws Exception {
    mockResponse(500, "");

    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser(USER_OID));
  }

  @Test
  public void testGetPermissionForUserWithNoUsersThrows() throws Exception {
    mockResponse(200, "[]");

    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser(USER_OID));
  }

  @Test
  public void testGetPermissionForUserWithMultipleUsersThrows() throws Exception {
    final String user = TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json").trim();
    final String userObject = user.substring(1, user.length() - 1);
    mockResponse(200, "[" + userObject + "," + userObject + "]");

    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser(USER_OID));
  }

  @Test
  public void testGetPermissionForUserWithDifferentOidThrows() throws Exception {
    mockResponse(200, TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    assertThrows(RuntimeException.class, () -> permissionsService.getPermissionForUser("1.2.246.562.24.99999999999"));
  }

  @Test
  public void testFindFirstWithYKIPermission() throws Exception {
    final List<OrganisaatioDTO> organisaatiot = readMockResponse().organisaatiot();

    final OrganisaatioDTO organisaatioDTO = permissionsService.findFirstWithYKIPermission(organisaatiot, "JARJESTAJA");

    assertEquals(PermissionsService.OPH_OID, organisaatioDTO.organisaatioOid());
  }

  @Test
  public void testFindFirstWithYKIPermissionReturnsNullWithoutMatch() throws Exception {
    final List<OrganisaatioDTO> organisaatiot = readMockResponse().organisaatiot();

    assertNull(permissionsService.findFirstWithYKIPermission(organisaatiot, "ILMOITTAUTUMISET_R"));
    assertNull(permissionsService.findFirstWithYKIPermission(organisaatiot, "PAAKAYTTAJA"));
    assertNull(permissionsService.findFirstWithYKIPermission(List.of(), "JARJESTAJA"));
  }

  @Test
  public void testHasPermissionForOrganisation() throws Exception {
    final KayttooikeusResponseDTO kayttooikeusResponseDTO = readMockResponse();

    assertTrue(
      permissionsService.hasPermissionForOrganisation(kayttooikeusResponseDTO, PermissionsService.OPH_OID, "JARJESTAJA")
    );
    assertTrue(
      permissionsService.hasPermissionForOrganisation(kayttooikeusResponseDTO, PermissionsService.OPH_OID, "YLLAPITAJA")
    );
  }

  @Test
  public void testHasPermissionForOrganisationWithOtherServiceOrOrganisationIsFalse() throws Exception {
    final KayttooikeusResponseDTO kayttooikeusResponseDTO = readMockResponse();

    assertFalse(
      permissionsService.hasPermissionForOrganisation(
        kayttooikeusResponseDTO,
        PermissionsService.OPH_OID,
        "PAAKAYTTAJA"
      )
    );
    assertFalse(permissionsService.hasPermissionForOrganisation(kayttooikeusResponseDTO, ORGANIZER_OID, "JARJESTAJA"));
  }

  @Test
  public void testHasAdminPermission() throws Exception {
    assertTrue(permissionsService.hasAdminPermission(readMockResponse()));
  }

  @Test
  public void testHasAdminPermissionOutsideOphIsFalse() {
    final KayttooikeusResponseDTO kayttooikeusResponseDTO = new KayttooikeusResponseDTO(
      USER_OID,
      "foo",
      "VIRKAILIJA",
      List.of(
        organisaatio(ORGANIZER_OID, new KayttooikeusDTO("YKI", "YLLAPITAJA")),
        organisaatio(PermissionsService.OPH_OID, new KayttooikeusDTO("YKI", "JARJESTAJA"))
      )
    );

    assertFalse(permissionsService.hasAdminPermission(kayttooikeusResponseDTO));
  }

  private KayttooikeusResponseDTO readMockResponse() throws Exception {
    mockResponse(200, TestUtil.readResourceAsString("kayttooikeus/kayttooikeus-response.json"));

    return permissionsService.getPermissionForUser(USER_OID);
  }

  private void mockResponse(final int statusCode, final String body) throws Exception {
    final Response response = mock(Response.class);
    when(response.getStatusCode()).thenReturn(statusCode);
    when(response.getResponseBody()).thenReturn(body);
    when(casClient.executeAndRetryWithCleanSessionOnStatusCodesBlocking(any(), any())).thenReturn(response);
  }

  private static OrganisaatioDTO organisaatio(final String oid, final KayttooikeusDTO... kayttooikeudet) {
    return new OrganisaatioDTO(oid, List.of(kayttooikeudet));
  }
}
