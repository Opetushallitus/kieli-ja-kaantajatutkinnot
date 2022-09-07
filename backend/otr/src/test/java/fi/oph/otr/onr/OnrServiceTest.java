package fi.oph.otr.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import fi.oph.otr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@DataJpaTest
public class OnrServiceTest {

  private OnrService onrService;

  private final PersonalData personalData = PersonalData
    .builder()
    .lastName("Rajala")
    .firstName("Iiro Aapeli")
    .nickName("Iiro")
    .identityNumber("1")
    .email("iiro.rajala@example.invalid")
    .build();

  private PersonalData createUpdatedPersonalData(final String onrId) {
    return PersonalData
      .builder()
      .onrId(onrId)
      .individualised(true)
      .hasIndividualisedAddress(false)
      .lastName("Karjalainen")
      .firstName("Eero Aapeli")
      .nickName("Eero")
      .identityNumber("2")
      .email("eero.karjalainen@example.invalid")
      .build();
  }

  @MockBean
  private OnrOperationApi onrOperationApi;

  @BeforeEach
  public void setup() throws Exception {
    when(onrOperationApi.insertPersonalData(any())).thenReturn("onrId");
    onrService = new OnrService(onrOperationApi);
  }

  @Test
  public void testUpdateCacheOnSuccess() throws Exception {
    when(onrOperationApi.fetchPersonalDatas(List.of("1"))).thenReturn(Map.of("1", personalData));
    onrService.updateCache(List.of("1"));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(personalData, cachedPersonalDatas.get("1"));
  }

  @Test
  public void testUpdateCacheOnFailure() throws Exception {
    doThrow(new RuntimeException()).when(onrOperationApi).fetchPersonalDatas(List.of("1"));
    onrService.updateCache(List.of("1"));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(0, cachedPersonalDatas.size());
  }

  @Test
  public void testInsertPersonalData() throws Exception {
    final String onrId = onrService.insertPersonalData(personalData);

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());

    final PersonalData cached = cachedPersonalDatas.get(onrId);
    assertNotNull(cached);
    assertEquals(onrId, cached.getOnrId());
    assertEquals(false, cached.getIndividualised());
    assertEquals(personalData.getLastName(), cached.getLastName());
    assertEquals(personalData.getFirstName(), cached.getFirstName());
    assertEquals(personalData.getNickName(), cached.getNickName());

    verify(onrOperationApi).insertPersonalData(any());
  }

  @Test
  public void testInsertPersonalDataDoesntUpdateCacheIfExceptionAtApiOccurs() throws Exception {
    doThrow(new RuntimeException()).when(onrOperationApi).insertPersonalData(any());
    assertThrows(RuntimeException.class, () -> onrService.insertPersonalData(personalData));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(0, cachedPersonalDatas.size());
  }

  @Test
  public void testUpdatePersonalData() throws Exception {
    final String onrId = onrService.insertPersonalData(personalData);
    final PersonalData updatedPersonalData = createUpdatedPersonalData(onrId);

    onrService.updatePersonalData(updatedPersonalData);

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(updatedPersonalData, cachedPersonalDatas.get(onrId));

    verify(onrOperationApi).updatePersonalData(updatedPersonalData);
  }

  @Test
  public void testUpdatePersonalDataDoesntUpdateCacheIfExceptionAtApiOccurs() throws Exception {
    final String onrId = onrService.insertPersonalData(personalData);
    final PersonalData updatedPersonalData = createUpdatedPersonalData(onrId);

    doThrow(new RuntimeException()).when(onrOperationApi).updatePersonalData(updatedPersonalData);
    assertThrows(RuntimeException.class, () -> onrService.updatePersonalData(updatedPersonalData));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());

    final PersonalData cached = cachedPersonalDatas.get(onrId);
    assertNotNull(cached);
    assertEquals(onrId, cached.getOnrId());
    assertEquals(false, cached.getIndividualised());
    assertEquals(personalData.getLastName(), cached.getLastName());
    assertEquals(personalData.getFirstName(), cached.getFirstName());
    assertEquals(personalData.getNickName(), cached.getNickName());
  }

  @Test
  public void testUpdatePersonalDataThrowsExceptionForInvalidPersonalData() {
    assertThrows(IllegalArgumentException.class, () -> onrService.updatePersonalData(personalData));
  }
}
