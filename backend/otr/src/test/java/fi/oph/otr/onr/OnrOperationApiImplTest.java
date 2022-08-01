package fi.oph.otr.onr;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.otr.onr.dto.ContactDetailsDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupSource;
import fi.oph.otr.onr.dto.ContactDetailsGroupType;
import fi.oph.otr.onr.dto.ContactDetailsType;
import fi.oph.otr.onr.dto.PersonalDataDTO;
import fi.oph.otr.onr.model.PersonalData;
import java.util.Set;
import org.junit.jupiter.api.Test;

class OnrOperationApiImplTest {

  @Test
  void testCreatePersonalDataDTO_IndividualisedNoPhone() {
    final PersonalData personalData = defaultData().email("e@mail").individualised(true).build();

    final PersonalDataDTO dto = OnrOperationApiImpl.createPersonalDataDTO(personalData);

    assertDtoMatchesDefaultData(dto);
    assertTrue(dto.getIndividualised());

    final Set<ContactDetailsDTO> contactDetailsSet = assertGroupGettingContactDetailsDTOS(dto);
    assertEquals(2, contactDetailsSet.size());
    assertEquals("e@mail", findValueByType(contactDetailsSet, ContactDetailsType.EMAIL));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.PHONE_NUMBER));
  }

  @Test
  void testCreatePersonalDataDTO_IndividualisedWithPhone() {
    final PersonalData personalData = defaultData().email("e@mail").individualised(true).phoneNumber("040404").build();

    final PersonalDataDTO dto = OnrOperationApiImpl.createPersonalDataDTO(personalData);

    assertDtoMatchesDefaultData(dto);
    assertTrue(dto.getIndividualised());

    final Set<ContactDetailsDTO> contactDetailsSet = assertGroupGettingContactDetailsDTOS(dto);
    assertEquals(2, contactDetailsSet.size());
    assertEquals("e@mail", findValueByType(contactDetailsSet, ContactDetailsType.EMAIL));
    assertEquals("040404", findValueByType(contactDetailsSet, ContactDetailsType.PHONE_NUMBER));
  }

  @Test
  void testCreatePersonalDataDTO_IndividualisedAllOtherDetails() {
    final PersonalData personalData = defaultData()
      .email("e@mail")
      .individualised(true)
      .phoneNumber("040404")
      .street("Katu 1")
      .postalCode("12321")
      .town("Taajama")
      .country("Maa")
      .build();
    final PersonalDataDTO dto = OnrOperationApiImpl.createPersonalDataDTO(personalData);

    assertDtoMatchesDefaultData(dto);
    assertTrue(dto.getIndividualised());

    final Set<ContactDetailsDTO> contactDetailsSet = assertGroupGettingContactDetailsDTOS(dto);
    assertEquals(2, contactDetailsSet.size());
    assertEquals("e@mail", findValueByType(contactDetailsSet, ContactDetailsType.EMAIL));
    assertEquals("040404", findValueByType(contactDetailsSet, ContactDetailsType.PHONE_NUMBER));
  }

  @Test
  void testCreatePersonalDataDTO_NotIndividualisedNoOtherDetails() {
    final PersonalData personalData = defaultData().email("e@mail").individualised(false).build();

    final PersonalDataDTO dto = OnrOperationApiImpl.createPersonalDataDTO(personalData);

    assertDtoMatchesDefaultData(dto);
    assertFalse(dto.getIndividualised());

    final Set<ContactDetailsDTO> contactDetailsSet = assertGroupGettingContactDetailsDTOS(dto);
    assertEquals(6, contactDetailsSet.size());
    assertEquals("e@mail", findValueByType(contactDetailsSet, ContactDetailsType.EMAIL));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.PHONE_NUMBER));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.STREET));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.POSTAL_CODE));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.TOWN));
    assertNull(findValueByType(contactDetailsSet, ContactDetailsType.COUNTRY));
  }

  @Test
  void testCreatePersonalDataDTO_NotIndividualisedWithAllOtherDetails() {
    final PersonalData personalData = defaultData()
      .email("e@mail")
      .individualised(false)
      .phoneNumber("040404")
      .street("Katu 1")
      .postalCode("12321")
      .town("Taajama")
      .country("Maa")
      .build();
    final PersonalDataDTO dto = OnrOperationApiImpl.createPersonalDataDTO(personalData);

    assertDtoMatchesDefaultData(dto);
    assertFalse(dto.getIndividualised());

    final Set<ContactDetailsDTO> contactDetailsSet = assertGroupGettingContactDetailsDTOS(dto);
    assertEquals(6, contactDetailsSet.size());
    assertEquals("e@mail", findValueByType(contactDetailsSet, ContactDetailsType.EMAIL));
    assertEquals("040404", findValueByType(contactDetailsSet, ContactDetailsType.PHONE_NUMBER));
    assertEquals("Katu 1", findValueByType(contactDetailsSet, ContactDetailsType.STREET));
    assertEquals("12321", findValueByType(contactDetailsSet, ContactDetailsType.POSTAL_CODE));
    assertEquals("Taajama", findValueByType(contactDetailsSet, ContactDetailsType.TOWN));
    assertEquals("Maa", findValueByType(contactDetailsSet, ContactDetailsType.COUNTRY));
  }

  private Set<ContactDetailsDTO> assertGroupGettingContactDetailsDTOS(final PersonalDataDTO dto) {
    assertEquals(1, dto.getContactDetailsGroups().size());
    final ContactDetailsGroupDTO contactDetailsGroupDTO = dto.getContactDetailsGroups().get(0);
    assertEquals(ContactDetailsGroupType.OTR_OSOITE, contactDetailsGroupDTO.getType());
    assertEquals(ContactDetailsGroupSource.OTR, contactDetailsGroupDTO.getSource());
    return contactDetailsGroupDTO.getContactDetailsSet();
  }

  private String findValueByType(final Set<ContactDetailsDTO> dtos, final ContactDetailsType type) {
    for (final ContactDetailsDTO dto : dtos) {
      if (dto.getType() == type) {
        return dto.getValue();
      }
    }
    throw new RuntimeException("DTO not found for type:" + type);
  }

  private PersonalData.PersonalDataBuilder defaultData() {
    return PersonalData
      .builder()
      .onrId("onrID0101")
      .lastName("Sukunimi")
      .firstName("Etunimi")
      .nickName("Kutsumanimi")
      .identityNumber("id111222");
  }

  private void assertDtoMatchesDefaultData(final PersonalDataDTO dto) {
    assertEquals("onrID0101", dto.getOnrId());
    assertEquals("Sukunimi", dto.getLastName());
    assertEquals("Etunimi", dto.getFirstName());
    assertEquals("Kutsumanimi", dto.getNickName());
    assertEquals("id111222", dto.getIdentityNumber());
  }
}
