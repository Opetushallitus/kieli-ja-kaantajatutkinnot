package fi.oph.vkt.service.onr.mock;

import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.CyclicIterable;
import java.util.Arrays;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class PersonalDataFactory {

  private final AtomicInteger counter = new AtomicInteger();

  public PersonalData create(final String onrId) {
    final int counterValue = counter.incrementAndGet();

    final String lastName = lastNames.next();
    final boolean isMale = counterValue % 2 == 0;
    final String nickname = isMale ? maleNicknames.next() : femaleNicknames.next();
    final String secondName = isMale ? maleSecondNames.next() : femaleSecondNames.next();

    return PersonalData
      .builder()
      .onrId(onrId)
      .lastName(lastName)
      .firstName(nickname + " " + secondName)
      .nickname(nickname)
      .build();
  }

  private static Iterator<String> cyclicIterator(final String... values) {
    return new CyclicIterable<>(Arrays.asList(values)).iterator();
  }

  private final Iterator<String> maleNicknames = cyclicIterator(
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

  private final Iterator<String> maleSecondNames = cyclicIterator(
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

  private final Iterator<String> femaleNicknames = cyclicIterator(
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

  private final Iterator<String> femaleSecondNames = cyclicIterator(
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
}
