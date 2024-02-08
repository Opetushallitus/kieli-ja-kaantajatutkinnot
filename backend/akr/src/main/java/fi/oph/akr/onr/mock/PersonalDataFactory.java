package fi.oph.akr.onr.mock;

import fi.oph.akr.api.dto.clerk.ClerkTranslatorAddressDTO;
import fi.oph.akr.onr.model.PersonalData;
import fi.oph.akr.util.CyclicIterable;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class PersonalDataFactory {

  private final AtomicInteger counter = new AtomicInteger();

  public PersonalData create(final String onrId) {
    final int counterValue = counter.incrementAndGet();
    final boolean isIndividualised = counterValue % 3 != 0;
    final boolean hasIndividualisedAddress = isIndividualised && counterValue % 5 != 0;

    final String lastName = lastNames.next();
    final boolean isMale = counterValue % 2 == 0;
    final String nickName = isMale ? menNickNames.next() : womenNickNames.next();
    final String secondName = isMale ? menSecondNames.next() : womenSecondNames.next();

    return PersonalData
      .builder()
      .onrId(onrId)
      .individualised(isIndividualised)
      .hasIndividualisedAddress(hasIndividualisedAddress)
      .lastName(lastName)
      .firstName(nickName + " " + secondName)
      .nickName(nickName)
      .identityNumber(identityNumbers.next())
      .email(nickName.toLowerCase() + "." + lastName.toLowerCase() + "@example.invalid")
      .phoneNumber(counterValue % 10 != 0 ? "+35840" + (1000000 + counterValue) : null)
      .address(
        List.of(
          ClerkTranslatorAddressDTO
            .builder()
            .street(streets.next())
            .postalCode(postalCodes.next())
            .town(towns.next())
            .country(countries.next())
            .build()
        )
      )
      .build();
  }

  private static Iterator<String> cyclicIterator(final String... values) {
    return new CyclicIterable<>(Arrays.asList(values)).iterator();
  }

  private final Iterator<String> menNickNames = cyclicIterator(
    "Antti",
    "Eero",
    "Ilkka",
    "Jari",
    "Juha",
    "Matti",
    "Pekka",
    "Timo",
    "Iiro",
    "Jukka",
    "Hugo",
    "Jaakko",
    "Lasse",
    "Kyösti",
    "Markku",
    "Kristian",
    "Mikael",
    "Nooa",
    "Otto",
    "Olli",
    "Aapo"
  );

  private final Iterator<String> menSecondNames = cyclicIterator(
    "Kalle",
    "Kari",
    "Marko",
    "Mikko",
    "Tapani",
    "Ville",
    "Jesse",
    "Joose",
    "Sakari",
    "Tero",
    "Samu",
    "Roope",
    "Panu",
    "Matias",
    "Seppo",
    "Rauno",
    "Aapeli"
  );

  private final Iterator<String> womenNickNames = cyclicIterator(
    "Anneli",
    "Ella",
    "Hanna",
    "Iiris",
    "Liisa",
    "Maria",
    "Ninni",
    "Viivi",
    "Sointu",
    "Ulla",
    "Varpu",
    "Raili",
    "Neea",
    "Noora",
    "Mirka",
    "Oona",
    "Jonna",
    "Jaana",
    "Katja",
    "Jenni",
    "Reija"
  );

  private final Iterator<String> womenSecondNames = cyclicIterator(
    "Anna",
    "Iida",
    "Kerttu",
    "Kristiina",
    "Marjatta",
    "Ronja",
    "Sara",
    "Helena",
    "Aino",
    "Erika",
    "Emmi",
    "Aada",
    "Eveliina",
    "Nanna",
    "Olga",
    "Inkeri",
    "Petra"
  );

  private final Iterator<String> lastNames = cyclicIterator(
    "Aaltonen",
    "Alanen",
    "Eskola",
    "Hakala",
    "Heikkinen",
    "Heinonen",
    "Hiltunen",
    "Hirvonen",
    "Hämäläinen",
    "Kallio",
    "Karjalainen",
    "Kinnunen",
    "Korhonen",
    "Koskinen",
    "Laakso",
    "Lahtinen",
    "Laine",
    "Lehtonen",
    "Leinonen",
    "Leppänen",
    "Manninen",
    "Mattila",
    "Mäkinen",
    "Nieminen",
    "Noronen",
    "Ojala",
    "Paavola",
    "Pitkänen",
    "Räsänen",
    "Saarinen",
    "Salo",
    "Salonen",
    "Toivonen",
    "Tuominen",
    "Turunen",
    "Valtonen",
    "Virtanen",
    "Väisänen"
  );

  private final Iterator<String> identityNumbers = cyclicIterator(
    "060105A910A",
    "260875-9507",
    "040352-904K",
    "130208A919P",
    "240636-9187",
    "080716A957T",
    "120137-9646",
    "180720A968M",
    "020713A978U",
    "130730-960R",
    "151084-927A",
    "240714A9723",
    "290338-944C",
    "280554-9389"
  );

  private final Iterator<String> streets = cyclicIterator(
    "Malminkatu 1",
    "Runebergintie 2",
    "Sibeliuksenkuja 3",
    "Veturitie 4",
    "Pirkkolantie 123",
    "Mikonkatu 77",
    "Aleksanterinkatu 24",
    "Korkeavuorenkatu 53",
    "Sörnäisten rantatie 371",
    "Hietalahdenranta 8",
    "Pohjoinen Rautatiekatu 240",
    null
  );

  private final Iterator<String> postalCodes = cyclicIterator(
    "00100",
    "01200",
    "06100",
    "13500",
    "31600",
    "48600",
    "54460",
    "70200",
    "95400",
    null
  );

  private final Iterator<String> towns = cyclicIterator(
    "Helsinki",
    "Turku",
    "Hämeenlinna",
    "Kuopio",
    "Lahti",
    "Porvoo",
    "Vantaa",
    "Järvenpää",
    "Kouvola",
    "Tampere",
    "Oulu",
    "Rovaniemi",
    "Kajaani",
    "Joensuu",
    "Uusikaupunki",
    "Kuopio",
    "Kotka",
    null
  );

  private final Iterator<String> countries = cyclicIterator("Suomi", "suomi", "SUOMI", "Finland", "", null);
}
