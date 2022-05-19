package fi.oph.otr.onr.mock;

import fi.oph.otr.onr.model.Person;
import fi.oph.otr.util.CyclicIterable;
import java.util.Arrays;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicInteger;

public class PersonFactory {

  private final AtomicInteger phoneNumberCounter = new AtomicInteger();

  public Person createPerson(final String onrId) {
    final String firstName = firstNames.next();
    final String lastName = lastNames.next();
    final int phoneCounter = phoneNumberCounter.incrementAndGet();

    return Person
      .builder()
      .onrId(onrId)
      .firstName(firstName)
      .lastName(lastName)
      .identityNumber(identityNumbers.next())
      .email(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.invalid")
      .phoneNumber(phoneCounter % 10 != 0 ? "+35840" + (1000000 + phoneCounter) : null)
      .street(streets.next())
      .postalCode(postalCodes.next())
      .town(towns.next())
      .country(countries.next())
      .build();
  }

  private static Iterator<String> cyclicIterator(final String... values) {
    return new CyclicIterable<>(Arrays.asList(values)).iterator();
  }

  private final Iterator<String> firstNames = cyclicIterator(
    "Antti",
    "Eero",
    "Ilkka",
    "Anneli",
    "Ella",
    "Hanna",
    "Iiris",
    "Jari",
    "Juha",
    "Matti",
    "Pekka",
    "Liisa",
    "Maria",
    "Ninni",
    "Timo",
    "Iiro",
    "Jukka",
    "Viivi",
    "Anna",
    "Iida",
    "Kalle",
    "Kari",
    "Marko",
    "Mikko",
    "Kerttu",
    "Kristiina",
    "Marjatta",
    "Tapani",
    "Ville",
    "Ronja",
    "Sara"
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
