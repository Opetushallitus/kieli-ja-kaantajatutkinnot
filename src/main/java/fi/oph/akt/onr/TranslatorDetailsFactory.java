package fi.oph.akt.onr;

import fi.oph.akt.onr.model.HenkiloDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupSource;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupType;
import fi.oph.akt.onr.model.contactDetails.YhteystietoTyyppi;
import fi.oph.akt.util.CustomOrderComparator;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class TranslatorDetailsFactory {

	private static final Comparator<String> groupsComparator = new CustomOrderComparator<>(
			ContactDetailsGroupType.prioritisedOrdering);

	public static TranslatorDetails createByHenkiloDto(HenkiloDto henkiloDto) {
		// @formatter:off
		List<ContactDetailsGroupDto> groups = getOrderedContactDetailsGroups(henkiloDto);

		return TranslatorDetails.builder()
				.firstName(henkiloDto.getKutsumanimi())
				.lastName(henkiloDto.getSukunimi())
				.email(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI))
				.phone(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_PUHELINNUMERO))
				.mobilePhone(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_MATKAPUHELINNUMERO))
				.street(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE))
				.postalCode(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO))
				.town(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI))
				.country(getValue(groups, YhteystietoTyyppi.YHTEYSTIETO_MAA))
				.birthDate(henkiloDto.getSyntymaaika())
				.identityNumber(henkiloDto.getHetu())
				.build();
		// @formatter:on
	}

	private static List<ContactDetailsGroupDto> getOrderedContactDetailsGroups(HenkiloDto henkiloDto) {
		// @formatter:off
		List<ContactDetailsGroupDto> aktGroups = henkiloDto
				.getYhteystiedotRyhma()
				.stream()
				.filter(group -> group.getSource().equals(ContactDetailsGroupSource.AKT))
				.collect(Collectors.toList()); // mutable list

		List<ContactDetailsGroupDto> otherGroups = henkiloDto
				.getYhteystiedotRyhma()
				.stream()
				.sorted(Comparator.comparing(ContactDetailsGroupDto::getType, Comparator.nullsLast(groupsComparator.thenComparing(Comparator.naturalOrder()))))
				.filter(group -> !group.getType().equals(ContactDetailsGroupType.HOME_ADDRESS))
				.toList();

		aktGroups.addAll(otherGroups);
		return aktGroups;
		// @formatter:on
	}

	private static String getValue(List<ContactDetailsGroupDto> contactDetailsGroups,
			YhteystietoTyyppi yhteystietoTyyppi) {
		// @formatter:off
		return contactDetailsGroups
				.stream()
				.flatMap(group -> group.getDetailsSet().stream())
				.filter(details -> details.getYhteystietoTyyppi() == yhteystietoTyyppi)
				.filter(details -> details.getValue() != null && !details.getValue().isEmpty())
				.map(ContactDetailsDto::getValue)
				.findFirst()
				.orElse(null);
		// @formatter:on
	}

}
