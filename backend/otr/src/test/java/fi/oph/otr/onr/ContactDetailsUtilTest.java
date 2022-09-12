package fi.oph.otr.onr;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fi.oph.otr.onr.dto.ContactDetailsDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupSource;
import fi.oph.otr.onr.dto.ContactDetailsGroupType;
import fi.oph.otr.onr.dto.ContactDetailsType;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class ContactDetailsUtilTest {

  @Test
  void testContainsCivilRegistryAddressField_ReturnsTrueIfGroupsSourceIsVTJAndContainsAddressField() {
    final List<ContactDetailsGroupDTO> groups = List.of(
      createContactDetailsGroupDTO(ContactDetailsGroupSource.VTJ, Set.of(ContactDetailsType.STREET))
    );

    assertTrue(ContactDetailsUtil.containsCivilRegistryAddressField(groups));
  }

  @Test
  void testContainsCivilRegistryAddressField_ReturnsTrueIfGroupsSourceIsVTJAndContainsSeveralAddressFields() {
    final List<ContactDetailsGroupDTO> groups = List.of(
      createContactDetailsGroupDTO(
        ContactDetailsGroupSource.VTJ,
        Set.of(ContactDetailsType.POSTAL_CODE, ContactDetailsType.TOWN, ContactDetailsType.COUNTRY)
      )
    );

    assertTrue(ContactDetailsUtil.containsCivilRegistryAddressField(groups));
  }

  @Test
  void testContainsCivilRegistryAddressField_ReturnsFalseIfGroupsSourceIsVTJAndDoesntContainAddressField() {
    final List<ContactDetailsGroupDTO> groups = List.of(
      createContactDetailsGroupDTO(ContactDetailsGroupSource.VTJ, Set.of(ContactDetailsType.EMAIL))
    );

    assertFalse(ContactDetailsUtil.containsCivilRegistryAddressField(groups));
  }

  @Test
  void testContainsCivilRegistryAddressField_ReturnsFalseIfGroupsSourceIsNotVTJAndContainsAddressField() {
    final List<ContactDetailsGroupDTO> groups = List.of(
      createContactDetailsGroupDTO(ContactDetailsGroupSource.OTR, Set.of(ContactDetailsType.STREET))
    );

    assertFalse(ContactDetailsUtil.containsCivilRegistryAddressField(groups));
  }

  private ContactDetailsGroupDTO createContactDetailsGroupDTO(
    final ContactDetailsGroupSource source,
    final Set<ContactDetailsType> contactDetailsTypes
  ) {
    final Set<ContactDetailsDTO> contactDetailsSet = contactDetailsTypes
      .stream()
      .map(contactDetailsType -> {
        final ContactDetailsDTO contactDetails = new ContactDetailsDTO();
        contactDetails.setType(contactDetailsType);
        contactDetails.setValue("value");
        return contactDetails;
      })
      .collect(Collectors.toSet());

    final ContactDetailsGroupDTO group = new ContactDetailsGroupDTO();
    group.setType(ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE);
    group.setSource(source);
    group.setContactDetailsSet(contactDetailsSet);
    return group;
  }
}
