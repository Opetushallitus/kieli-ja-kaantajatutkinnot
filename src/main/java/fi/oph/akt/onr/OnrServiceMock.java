package fi.oph.akt.onr;

import fi.oph.akt.onr.model.HenkiloDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupDto;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupSource;
import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupType;
import fi.oph.akt.onr.model.contactDetails.YhteystietoTyyppi;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class OnrServiceMock extends OnrApi {

	@Override
	public List<HenkiloDto> getHenkiloDtos(List<String> oids) {
		final HenkiloDtoFactory henkiloDtoFactory = new HenkiloDtoFactory();
		return oids.stream().map(henkiloDtoFactory::createHenkiloDto).toList();
	}

}

class HenkiloDtoFactory {

	private static Iterator<String> cyclicIter(String... values) {
		return new CyclicIterable<String>(List.of(values)).iterator();
	}

	private final Iterator<String> menNames = cyclicIter("Antti", "Eero", "Ilkka", "Jari", "Juha", "Matti", "Pekka",
			"Timo", "Iiro", "Jukka", "Kalle", "Kari", "Marko", "Mikko", "Tapani", "Ville");

	private final Iterator<String> womenNames = cyclicIter("Anneli", "Ella", "Hanna", "Iiris", "Liisa", "Maria",
			"Ninni", "Viivi", "Anna", "Iida", "Kerttu", "Kristiina", "Marjatta", "Ronja", "Sara");

	private final Iterator<String> surnames = cyclicIter("Aaltonen", "Alanen", "Eskola", "Hakala", "Heikkinen",
			"Heinonen", "Hiltunen", "Hirvonen", "Hämäläinen", "Kallio", "Karjalainen", "Kinnunen", "Korhonen",
			"Koskinen", "Laakso", "Lahtinen", "Laine", "Lehtonen", "Leinonen", "Leppänen", "Manninen", "Mattila",
			"Mäkinen", "Nieminen", "Noronen", "Ojala", "Paavola", "Pitkänen", "Räsänen", "Saarinen", "Salo", "Salonen",
			"Toivonen", "Tuominen", "Turunen", "Valtonen", "Virtanen", "Väisänen");

	private final Iterator<String> identityNumbers = cyclicIter("060105A910A", "260875-9507", "040352-904K",
			"130208A919P", "240636-9187", "080716A957T", "120137-9646", "180720A968M", "020713A978U", "130730-960R",
			"151084-927A", "240714A9723", "290338-944C", "280554-9389");

	private final Iterator<String> streets = cyclicIter("Malminkatu 1", "Runebergintie 2", "Sibeliuksenkuja 3",
			"Veturitie 4", "Pirkkolantie 123");

	private final Iterator<String> postalCodes = cyclicIter("00100", "01200", "06100", "13500", "31600", "48600",
			"54460");

	private final Iterator<String> towns = cyclicIter("Helsinki", "Turku", "Hämeenlinna", "Kuopio", "Lahti", "Porvoo",
			"Vantaa", "Järvenpää", "Kouvola", "Tampere", "Oulu", "Rovaniemi", "Kajaani", "Joensuu", "Uusikaupunki",
			"Kuopio", "Kotka");

	private final Iterator<String> countries = cyclicIter("Suomi", "suomi", "SUOMI", "Finland", "", "Latvia");

	private boolean genderToggle = false;

	private final AtomicInteger phoneNumberCounter = new AtomicInteger();

	public HenkiloDto createHenkiloDto(String oid) {
		String firstName = genderToggle ? menNames.next() : womenNames.next();
		genderToggle = !genderToggle;

		//@formatter:off
		HenkiloDto henkiloDto = HenkiloDto.builder()
				.oidHenkilo(oid)
				.hetu(identityNumbers.next())
				.kutsumanimi(firstName)
				.sukunimi(surnames.next())
				.build();
		//@formatter:on

		henkiloDto.setSyntymaaika(getBirthDateByIdentityNumber(henkiloDto.getHetu()));

		henkiloDto.setYhteystiedotRyhma(Set.of(
				createAktContactDetails(henkiloDto, phoneNumberCounter.incrementAndGet()), createVtjContactDetails()));

		return henkiloDto;
	}

	private ContactDetailsGroupDto createAktContactDetails(HenkiloDto henkiloDto, int phoneCounter) {
		ContactDetailsGroupDto detailsGroup = new ContactDetailsGroupDto();

		String email = henkiloDto.getKutsumanimi().toLowerCase() + "." + henkiloDto.getSukunimi().toLowerCase()
				+ "@akt.fi";
		String phone = "+35840" + (1000000 + phoneCounter);

		Set<ContactDetailsDto> detailsSet = Set.of(
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_SAHKOPOSTI, email),
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_PUHELINNUMERO, phone));

		detailsGroup.setType(ContactDetailsGroupType.CONTACT_DETAILS_FILLED_FOR_APPLICATION);
		detailsGroup.setSource(ContactDetailsGroupSource.AKT);
		detailsGroup.setDetailsSet(detailsSet);

		return detailsGroup;
	}

	private ContactDetailsGroupDto createVtjContactDetails() {
		ContactDetailsGroupDto detailsGroup = new ContactDetailsGroupDto();

		String country = countries.next();
		boolean foreignCountry = country.equalsIgnoreCase("Latvia");

		Set<ContactDetailsDto> detailsSet = Set.of(
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_KATUOSOITE,
						reverseIf(foreignCountry, streets.next())),
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_POSTINUMERO,
						reverseIf(foreignCountry, postalCodes.next())),
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_KAUPUNKI, reverseIf(foreignCountry, towns.next())),
				new ContactDetailsDto(YhteystietoTyyppi.YHTEYSTIETO_MAA, country));

		detailsGroup.setType(ContactDetailsGroupType.VTJ_REGULAR_DOMESTIC_ADDRESS);
		detailsGroup.setSource(ContactDetailsGroupSource.VTJ);
		detailsGroup.setDetailsSet(detailsSet);

		return detailsGroup;
	}

	private static String reverseIf(boolean reverse, String str) {
		if (reverse) {
			return StringUtils.capitalize(new StringBuffer(str.toLowerCase()).reverse().toString());
		}
		return str;
	}

	private LocalDate getBirthDateByIdentityNumber(String identityNumber) {
		LocalDate date = LocalDate.parse(identityNumber.substring(0, 6), DateTimeFormatter.ofPattern("ddMMyy"));

		return identityNumber.charAt(6) == '-' ? date.minusYears(100) : date;
	}

}

class CyclicIterable<T> implements Iterable<T> {

	private final List<T> coll;

	private int index = 0;

	public CyclicIterable(List<T> coll) {
		this.coll = coll;
	}

	public Iterator<T> iterator() {
		return new Iterator<>() {
			@Override
			public boolean hasNext() {
				return true;
			}

			@Override
			public T next() {
				if (index >= coll.size()) {
					index = 0;
				}
				return coll.get(index++);
			}

			@Override
			public void remove() {
				throw new UnsupportedOperationException();
			}
		};
	}

}
