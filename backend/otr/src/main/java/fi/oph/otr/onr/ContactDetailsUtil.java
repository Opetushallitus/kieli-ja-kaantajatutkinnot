package fi.oph.otr.onr;

import static java.util.Comparator.comparing;
import static java.util.Comparator.naturalOrder;
import static java.util.Comparator.nullsLast;

import fi.oph.otr.onr.dto.ContactDetailsDTO;
import fi.oph.otr.onr.dto.ContactDetailsGroupDTO;
import fi.oph.otr.onr.dto.ContactDetailsType;
import fi.oph.otr.util.CustomOrderComparator;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

public class ContactDetailsUtil {

  private static final String KOTIOSOITE = "yhteystietotyyppi1";
  private static final String VAKINAINEN_KOTIMAAN_OSOITE = "yhteystietotyyppi4";
  private static final String VAKINAINEN_ULKOMAAN_OSOITE = "yhteystietotyyppi5";
  private static final String SAHKOINEN_OSOITE = "yhteystietotyyppi8";
  private static final String TILAPAINEN_KOTIMAAN_OSOITE = "yhteystietotyyppi9";
  private static final String TILAPAINEN_ULKOMAAN_OSOITE = "yhteystietotyyppi10";
  private static final String KOTIMAINEN_POSTIOSOITE = "yhteystietotyyppi11";
  private static final String ULKOMAINEN_POSTIOSOITE = "yhteystietotyyppi12";
  private static final String OTR_OSOITE = "yhteystietotyyppi13";

  public static final Stream<String> civilRegistryOrdering = Stream.of(
    TILAPAINEN_KOTIMAAN_OSOITE,
    TILAPAINEN_ULKOMAAN_OSOITE,
    VAKINAINEN_KOTIMAAN_OSOITE,
    VAKINAINEN_ULKOMAAN_OSOITE,
    KOTIMAINEN_POSTIOSOITE,
    ULKOMAINEN_POSTIOSOITE,
    SAHKOINEN_OSOITE
  );

  private static final CustomOrderComparator<String> primaryOtrComparator = new CustomOrderComparator<>(
    Stream.concat(Stream.of(OTR_OSOITE), civilRegistryOrdering).toList()
  );

  private static final CustomOrderComparator<String> primaryCrComparator = new CustomOrderComparator<>(
    Stream.concat(civilRegistryOrdering, Stream.of(OTR_OSOITE)).toList()
  );

  public static String getPrimaryEmail(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.EMAIL, primaryOtrComparator);
  }

  public static String getPrimaryPhoneNumber(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.PHONE_NUMBER, primaryOtrComparator);
  }

  public static String getPrimaryStreet(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.STREET, primaryCrComparator);
  }

  public static String getPrimaryPostalCode(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.POSTAL_CODE, primaryCrComparator);
  }

  public static String getPrimaryTown(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.TOWN, primaryCrComparator);
  }

  public static String getPrimaryCountry(final List<ContactDetailsGroupDTO> groups) {
    return getPrimaryValue(groups, ContactDetailsType.COUNTRY, primaryCrComparator);
  }

  public static String getPrimaryValue(
    final List<ContactDetailsGroupDTO> contactDetailsGroups,
    final String contactDetailsType,
    final Comparator<String> comparator
  ) {
    if (ContactDetailsType.values.contains(contactDetailsType)) {
      return contactDetailsGroups
        .stream()
        .sorted(comparing(ContactDetailsGroupDTO::type, nullsLast(comparator.thenComparing(naturalOrder()))))
        .filter(group -> !group.type().equals(KOTIOSOITE))
        .flatMap(group -> group.contactDetailsSet().stream())
        .filter(details -> details.type().equals(contactDetailsType))
        .filter(details -> details.value() != null && !details.value().isBlank())
        .map(ContactDetailsDTO::value)
        .findFirst()
        .orElse(null);
    }

    throw new IllegalArgumentException("Invalid contact details type " + contactDetailsType);
  }
}
