package fi.oph.akr.onr.mock;

import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.onr.OnrOperationApi;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.model.PersonalData;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

public class OnrOperationApiMock implements OnrOperationApi {

  @Override
  public Map<String, PersonalData> fetchPersonalDatas(final List<String> onrIds) {
    final PersonalDataFactory personalDataFactory = new PersonalDataFactory();
    return onrIds.stream().collect(Collectors.toMap(Function.identity(), personalDataFactory::create));
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
          .onrId("1.246.562.24.A00000000001")
          .individualised(true)
          .hasIndividualisedAddress(true)
          .lastName("Lehtinen")
          .firstName("Matti Tauno")
          .nickName("Matti")
          .identityNumber(identityNumber)
          .address(
            List.of(
              TranslatorAddressDTO
                .builder()
                .street("Kajaanintie 123")
                .postalCode("93600")
                .town("Kuusamo")
                .country("FINLAND")
                .source(ContactDetailsGroupSource.AKR)
                .type(ContactDetailsGroupType.AKR_OSOITE)
                .build()
            )
          )
          .build();
        case individualised2 -> PersonalData
          .builder()
          .onrId("1.246.562.24.B00000000002")
          .individualised(true)
          .hasIndividualisedAddress(false)
          .lastName("Mannonen")
          .firstName("Anna Maria")
          .nickName("Anna")
          .identityNumber(identityNumber)
          .address(
            List.of(
              TranslatorAddressDTO
                .builder()
                .street("Tampereentie 234")
                .postalCode("20100")
                .town("Turku")
                .country("SUOMI")
                .source(ContactDetailsGroupSource.AKR)
                .type(ContactDetailsGroupType.AKR_OSOITE)
                .build()
            )
          )
          .build();
        case manuallyCreated1 -> PersonalData
          .builder()
          .onrId("1.246.562.24.C00000000003")
          .individualised(false)
          .hasIndividualisedAddress(false)
          .lastName("Oppija")
          .firstName("Oona Inkeri")
          .nickName("Oona")
          .identityNumber(identityNumber)
          .address(
            List.of(
              TranslatorAddressDTO
                .builder()
                .street("Ristikontie 333")
                .town("Helsinki")
                .source(ContactDetailsGroupSource.AKR)
                .type(ContactDetailsGroupType.AKR_OSOITE)
                .build()
            )
          )
          .build();
        case manuallyCreated2 -> PersonalData
          .builder()
          .onrId("1.246.562.24.D00000000004")
          .individualised(false)
          .hasIndividualisedAddress(false)
          .lastName("Oppija")
          .firstName("Olli Pekka")
          .nickName("Olli Pekka") // ONR doesn't validate nickname
          .identityNumber(identityNumber)
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
  public void updatePersonalData(final PersonalData personalData) {}
}
