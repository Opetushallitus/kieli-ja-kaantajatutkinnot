package fi.oph.akr.onr;

import static fi.oph.akr.onr.dto.ContactDetailsGroupType.AKR_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.KOTIMAINEN_POSTIOSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.KOTIOSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.OTR_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.SAHKOINEN_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.TILAPAINEN_KOTIMAAN_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.TILAPAINEN_ULKOMAAN_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.ULKOMAINEN_POSTIOSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.VAKINAINEN_KOTIMAAN_OSOITE;
import static fi.oph.akr.onr.dto.ContactDetailsGroupType.VAKINAINEN_ULKOMAAN_OSOITE;
import static java.util.Comparator.comparing;
import static java.util.Comparator.naturalOrder;
import static java.util.Comparator.nullsLast;

import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.dto.ContactDetailsDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import fi.oph.akr.onr.dto.ContactDetailsType;
import fi.oph.akr.onr.dto.PersonalDataDTO;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.util.CustomOrderComparator;
import java.util.Collection;
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

  private static final CustomOrderComparator<ContactDetailsGroupType> AKR_FIRST = new CustomOrderComparator<>(
    Stream.concat(Stream.of(AKR_OSOITE), CIVIL_REGISTRY_ORDERING.stream()).toList()
  );

  private static final CustomOrderComparator<ContactDetailsGroupType> AKR_LAST = new CustomOrderComparator<>(
    Stream.concat(CIVIL_REGISTRY_ORDERING.stream(), Stream.of(AKR_OSOITE)).toList()
  );

  /**
   * Returns true if the source of `groups` is VTJ, and the `groups` contains at least one contact details field
   * which represents an address.
   */
  public static boolean containsCivilRegistryAddressField(final List<ContactDetailsGroupDTO> groups) {
    final Set<ContactDetailsType> addressTypes = Set.of(
      ContactDetailsType.STREET,
      ContactDetailsType.POSTAL_CODE,
      ContactDetailsType.TOWN,
      ContactDetailsType.COUNTRY
    );

    return groups
      .stream()
      .filter(group -> group.getSource() == ContactDetailsGroupSource.VTJ)
      .flatMap(group -> group.contactDetailsSet.stream())
      .map(ContactDetailsDTO::getType)
      .anyMatch(addressTypes::contains);
  }

  public static String getPrimaryEmail(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.EMAIL, AKR_FIRST);
  }

  public static String getPrimaryPhoneNumber(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.PHONE_NUMBER, AKR_FIRST);
  }

  public static String getPrimaryStreet(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.STREET, AKR_LAST);
  }

  public static String getPrimaryPostalCode(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.POSTAL_CODE, AKR_LAST);
  }

  public static String getPrimaryTown(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.TOWN, AKR_LAST);
  }

  public static String getPrimaryCountry(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.COUNTRY, AKR_LAST);
  }

  private static String getValue(
    final ContactDetailsGroupDTO contactDetailsGroup,
    final ContactDetailsType contactDetailsType
  ) {
    return contactDetailsGroup
      .getContactDetailsSet()
      .stream()
      .filter(details -> details.getType().equals(contactDetailsType))
      .filter(details -> details.getValue() != null && !details.getValue().isBlank())
      .map(ContactDetailsDTO::getValue)
      .findFirst()
      .orElse(null);
  }

  private static String getPrimaryValue(
    final List<ContactDetailsGroupDTO> contactDetailsGroups,
    final ContactDetailsType contactDetailsType,
    final Comparator<ContactDetailsGroupType> comparator
  ) {
    return contactDetailsGroups
      .stream()
      .sorted(comparing(ContactDetailsGroupDTO::getType, nullsLast(comparator.thenComparing(naturalOrder()))))
      .filter(group -> !group.getType().equals(KOTIOSOITE) && !group.getType().equals(OTR_OSOITE))
      .flatMap(group -> group.getContactDetailsSet().stream())
      .filter(details -> details.getType().equals(contactDetailsType))
      .filter(details -> details.getValue() != null && !details.getValue().isBlank())
      .map(ContactDetailsDTO::getValue)
      .findFirst()
      .orElse(null);
  }

  public static ContactDetailsGroupDTO createAkrContactDetailsGroup(final PersonalData personalData) {
    final Set<ContactDetailsType> akrContactDetailsTypes = Set.of(
      ContactDetailsType.EMAIL,
      ContactDetailsType.PHONE_NUMBER
    );

    final TranslatorAddressDTO address = findAkrAddressDetails(personalData);
    final Set<ContactDetailsDTO> contactDetailsSet = Stream
      .of(
        createContactDetailsDTO(ContactDetailsType.EMAIL, personalData.getEmail()),
        createContactDetailsDTO(ContactDetailsType.PHONE_NUMBER, personalData.getPhoneNumber()),
        createContactDetailsDTO(ContactDetailsType.STREET, address.street()),
        createContactDetailsDTO(ContactDetailsType.POSTAL_CODE, address.postalCode()),
        createContactDetailsDTO(ContactDetailsType.TOWN, address.town()),
        createContactDetailsDTO(ContactDetailsType.COUNTRY, address.country())
      )
      .filter(dto -> !personalData.getHasIndividualisedAddress() || akrContactDetailsTypes.contains(dto.getType()))
      .collect(Collectors.toSet());

    final ContactDetailsGroupDTO contactDetailsGroupDTO = new ContactDetailsGroupDTO();
    contactDetailsGroupDTO.setType(ContactDetailsGroupType.AKR_OSOITE);
    contactDetailsGroupDTO.setSource(ContactDetailsGroupSource.AKR);
    contactDetailsGroupDTO.setContactDetailsSet(contactDetailsSet);
    return contactDetailsGroupDTO;
  }

  private static TranslatorAddressDTO findAkrAddressDetails(final PersonalData personalData) {
    return personalData
      .getAddress()
      .stream()
      .filter(addr ->
        addr.source().equals(ContactDetailsGroupSource.AKR) && addr.type().equals(ContactDetailsGroupType.AKR_OSOITE)
      )
      .findFirst()
      .orElse(null);
  }

  private static ContactDetailsDTO createContactDetailsDTO(final ContactDetailsType type, final String value) {
    final ContactDetailsDTO contactDetailsDTO = new ContactDetailsDTO();
    contactDetailsDTO.setType(type);
    contactDetailsDTO.setValue(value);
    return contactDetailsDTO;
  }

  private static List<ContactDetailsGroupDTO> getNonAkrAndNonReadOnlyContactDetails(
    final List<ContactDetailsGroupDTO> latestContactDetails
  ) {
    return latestContactDetails
      .stream()
      .filter(cd -> cd.getSource() != ContactDetailsGroupSource.AKR && !cd.getIsReadOnly())
      .collect(Collectors.toList());
  }

  static PersonalDataDTO combineContactDetails(
    final PersonalDataDTO personalDataDTO,
    final List<ContactDetailsGroupDTO> latestContactDetails
  ) {
    final List<ContactDetailsGroupDTO> latestNonOtrContactDetails = getNonAkrAndNonReadOnlyContactDetails(
      latestContactDetails
    );
    final List<ContactDetailsGroupDTO> combinedContactDetails = Stream
      .of(latestNonOtrContactDetails, personalDataDTO.getContactDetailsGroups())
      .flatMap(Collection::stream)
      .collect(Collectors.toList());
    personalDataDTO.setContactDetailsGroups(combinedContactDetails);
    return personalDataDTO;
  }

  public static TranslatorAddressDTO getPrimaryAddress(final PersonalData personalData, final Translator translator) {
    return personalData
      .getAddress()
      .stream()
      .filter(addr ->
        addr.source().toString().equals(translator.getSelectedSource()) &&
        addr.type().toString().equals(translator.getSelectedType())
      )
      .findFirst()
      .orElse(personalData.getAddress().get(0));
  }

  public static List<TranslatorAddressDTO> getAddresses(final List<ContactDetailsGroupDTO> contactDetailGroups) {
    return contactDetailGroups
      .stream()
      .map(group ->
        TranslatorAddressDTO
          .builder()
          .street(getValue(group, ContactDetailsType.STREET))
          .postalCode(getValue(group, ContactDetailsType.POSTAL_CODE))
          .town(getValue(group, ContactDetailsType.TOWN))
          .country(getValue(group, ContactDetailsType.COUNTRY))
          .source(group.getSource())
          .type(group.getType())
          .build()
      )
      .toList();
  }
}
