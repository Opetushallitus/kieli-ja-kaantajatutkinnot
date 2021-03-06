package fi.oph.otr.onr;

import static fi.oph.otr.onr.dto.ContactDetailsGroupType.KOTIMAINEN_POSTIOSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.KOTIOSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.OTR_OSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.SAHKOINEN_OSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.TILAPAINEN_KOTIMAAN_OSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.TILAPAINEN_ULKOMAAN_OSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.ULKOMAINEN_POSTIOSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE;
import static fi.oph.otr.onr.dto.ContactDetailsGroupType.VAKINAINEN_ULKOMAAN_OSOITE;
import static java.util.Comparator.comparing;
import static java.util.Comparator.naturalOrder;
import static java.util.Comparator.nullsLast;

import fi.oph.otr.onr.dto.ContactDetailsDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupSource;
import fi.oph.otr.onr.dto.ContactDetailsGroupType;
import fi.oph.otr.onr.dto.ContactDetailsType;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.util.CustomOrderComparator;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class ContactDetailsUtil {

  private static final List<ContactDetailsGroupType> CIVIL_REGISTRY_ORDERING = List.of(
    TILAPAINEN_KOTIMAAN_OSOITE,
    TILAPAINEN_ULKOMAAN_OSOITE,
    VAKINAINEN_KOTIMAAN_OSOITE,
    VAKINAINEN_ULKOMAAN_OSOITE,
    KOTIMAINEN_POSTIOSOITE,
    ULKOMAINEN_POSTIOSOITE,
    SAHKOINEN_OSOITE
  );

  private static final CustomOrderComparator<ContactDetailsGroupType> OTR_FIRST = new CustomOrderComparator<>(
    Stream.concat(Stream.of(OTR_OSOITE), CIVIL_REGISTRY_ORDERING.stream()).toList()
  );

  private static final CustomOrderComparator<ContactDetailsGroupType> OTR_LAST = new CustomOrderComparator<>(
    Stream.concat(CIVIL_REGISTRY_ORDERING.stream(), Stream.of(OTR_OSOITE)).toList()
  );

  public static String getPrimaryEmail(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.EMAIL, OTR_FIRST);
  }

  public static String getPrimaryPhoneNumber(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.PHONE_NUMBER, OTR_FIRST);
  }

  public static String getPrimaryStreet(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.STREET, OTR_LAST);
  }

  public static String getPrimaryPostalCode(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.POSTAL_CODE, OTR_LAST);
  }

  public static String getPrimaryTown(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.TOWN, OTR_LAST);
  }

  public static String getPrimaryCountry(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.COUNTRY, OTR_LAST);
  }

  private static String getPrimaryValue(
    final List<ContactDetailsGroupDTO> contactDetailsGroups,
    final ContactDetailsType contactDetailsType,
    final Comparator<ContactDetailsGroupType> comparator
  ) {
    return contactDetailsGroups
      .stream()
      .sorted(comparing(ContactDetailsGroupDTO::getType, nullsLast(comparator.thenComparing(naturalOrder()))))
      .filter(group -> !group.getType().equals(KOTIOSOITE))
      .flatMap(group -> group.getContactDetailsSet().stream())
      .filter(details -> details.getType().equals(contactDetailsType))
      .filter(details -> details.getValue() != null && !details.getValue().isBlank())
      .map(ContactDetailsDTO::getValue)
      .findFirst()
      .orElse(null);
  }

  public static ContactDetailsGroupDTO createOtrContactDetailsGroup(final PersonalData personalData) {
    final Set<ContactDetailsType> otrContactDetailsTypes = Set.of(
      ContactDetailsType.EMAIL,
      ContactDetailsType.PHONE_NUMBER
    );

    final Set<ContactDetailsDTO> contactDetailsSet = Stream
      .of(
        createContactDetailsDTO(ContactDetailsType.EMAIL, personalData.getEmail()),
        createContactDetailsDTO(ContactDetailsType.PHONE_NUMBER, personalData.getPhoneNumber()),
        createContactDetailsDTO(ContactDetailsType.STREET, personalData.getStreet()),
        createContactDetailsDTO(ContactDetailsType.POSTAL_CODE, personalData.getPostalCode()),
        createContactDetailsDTO(ContactDetailsType.TOWN, personalData.getTown()),
        createContactDetailsDTO(ContactDetailsType.COUNTRY, personalData.getCountry())
      )
      .filter(dto -> !personalData.getIndividualised() || otrContactDetailsTypes.contains(dto.getType()))
      .collect(Collectors.toSet());

    final ContactDetailsGroupDTO contactDetailsGroupDTO = new ContactDetailsGroupDTO();
    contactDetailsGroupDTO.setType(ContactDetailsGroupType.OTR_OSOITE);
    contactDetailsGroupDTO.setSource(ContactDetailsGroupSource.OTR);
    contactDetailsGroupDTO.setContactDetailsSet(contactDetailsSet);
    return contactDetailsGroupDTO;
  }

  private static ContactDetailsDTO createContactDetailsDTO(final ContactDetailsType type, final String value) {
    final ContactDetailsDTO contactDetailsDTO = new ContactDetailsDTO();
    contactDetailsDTO.setType(type);
    contactDetailsDTO.setValue(value);
    return contactDetailsDTO;
  }
}
