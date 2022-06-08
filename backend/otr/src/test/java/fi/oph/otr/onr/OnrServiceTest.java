package fi.oph.otr.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
    .firstName("Iiro")
    .lastName("Rajala")
    .identityNumber("1")
    .email("iiro.rajala@example.invalid")
    .build();

  private final PersonalData updatedPersonalData = PersonalData
    .builder()
    .firstName("Eero")
    .lastName("Karjalainen")
    .identityNumber("2")
    .email("eero.karjalainen@example.invalid")
    .build();

  @MockBean
  private OnrOperationApi onrOperationApi;

  @BeforeEach
  public void setup() {
    onrService = new OnrService(onrOperationApi);
  }

  @Test
  public void testUpdateCache() {
    when(onrOperationApi.fetchPersonalDatas(List.of("1"))).thenReturn(Map.of("1", personalData));
    onrService.updateCache(List.of("1"));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(personalData, cachedPersonalDatas.get("1"));
  }

  @Test
  public void testInsertPersonalData() {
    final String onrId = onrService.insertPersonalData(personalData);

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(personalData, cachedPersonalDatas.get(onrId));

    verify(onrOperationApi).insertPersonalData(personalData);
  }

  @Test
  public void testInsertPersonalDataDoesntUpdateCacheIfExceptionAtApiOccurs() {
    doThrow(new RuntimeException()).when(onrOperationApi).insertPersonalData(personalData);
    assertThrows(RuntimeException.class, () -> onrService.insertPersonalData(personalData));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(0, cachedPersonalDatas.size());
  }

  @Test
  public void testUpdatePersonalData() {
    final String onrId = onrService.insertPersonalData(personalData);

    onrService.updatePersonalData(onrId, updatedPersonalData);

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(updatedPersonalData, cachedPersonalDatas.get(onrId));

    verify(onrOperationApi).updatePersonalData(onrId, updatedPersonalData);
  }

  @Test
  public void testUpdatePersonalDataDoesntUpdateCacheIfExceptionAtApiOccurs() {
    final String onrId = onrService.insertPersonalData(personalData);

    doThrow(new RuntimeException()).when(onrOperationApi).updatePersonalData(onrId, updatedPersonalData);
    assertThrows(RuntimeException.class, () -> onrService.updatePersonalData(onrId, updatedPersonalData));

    final Map<String, PersonalData> cachedPersonalDatas = onrService.getCachedPersonalDatas();
    assertEquals(1, cachedPersonalDatas.size());
    assertEquals(personalData, cachedPersonalDatas.get(onrId));
  }
}
