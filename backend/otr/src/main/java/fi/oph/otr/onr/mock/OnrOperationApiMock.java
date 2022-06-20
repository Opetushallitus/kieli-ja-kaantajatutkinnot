package fi.oph.otr.onr.mock;

import fi.oph.otr.onr.OnrOperationApi;
import fi.oph.otr.onr.model.PersonalData;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public class OnrOperationApiMock implements OnrOperationApi {

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    final Map<String, PersonalData> personalDatas = new HashMap<>();
    final PersonalDataFactory personalDataFactory = new PersonalDataFactory();

    onrIds.forEach(onrId -> personalDatas.put(onrId, personalDataFactory.create()));
    return personalDatas;
  }

  @Override
  public Optional<PersonalData> findPersonalDataByIdentityNumber(final String identityNumber) {
    final String individualised1 = "090687-913J";
    final String individualised2 = "170378-966N";
    final String manuallyCreated1 = "170688-935N";
    final String manuallyCreated2 = "121094-917M";

    final PersonalData personalData =
      switch (identityNumber) {
        case individualised1 -> PersonalData
          .builder()
          .lastName("Lehtinen")
          .firstName("Matti Tauno")
          .nickName("Matti")
          .identityNumber(identityNumber)
          .email("matti.lehtinen@example.invalid")
          .street("Kajaanintie 123")
          .postalCode("93600")
          .town("Kuusamo")
          .country("FINLAND")
          .isIndividualised(true)
          .build();
        case individualised2 -> PersonalData
          .builder()
          .lastName("Mannonen")
          .firstName("Anna Maria")
          .nickName("Anna")
          .identityNumber(identityNumber)
          .email("anna.mannonen@example.invalid")
          .street("Tampereentie 234")
          .postalCode("20100")
          .town("Turku")
          .country("SUOMI")
          .isIndividualised(true)
          .build();
        case manuallyCreated1 -> PersonalData
          .builder()
          .lastName("Oppija")
          .firstName("Oona Inkeri")
          .nickName("Oona")
          .identityNumber(identityNumber)
          .email("oona.oppija@example.invalid")
          .street("Ristikontie 333")
          .town("Helsinki")
          .isIndividualised(false)
          .build();
        case manuallyCreated2 -> PersonalData
          .builder()
          .lastName("Oppija")
          .firstName("Olli Pekka")
          .nickName("Olli")
          .identityNumber(identityNumber)
          .email("olli.oppija@example.invalid")
          .isIndividualised(false)
          .build();
        default -> null;
      };

    return Optional.ofNullable(personalData);
  }

  @Override
  public String insertPersonalData(final PersonalData personalData) {
    return UUID.randomUUID().toString();
  }

  @Override
  public void updatePersonalData(final String onrId, final PersonalData personalData) {}
}
