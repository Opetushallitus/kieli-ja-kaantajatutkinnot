package fi.oph.otr;

import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.model.embeddable.Kieli;
import java.time.LocalDate;
import java.util.UUID;

public class Factory {

  public static Tulkki interpreter() {
    return new Tulkki(UUID.randomUUID().toString());
  }

  public static Oikeustulkki legalInterpreter(final Tulkki interpreter) {
    final Oikeustulkki legalInterpreter = new Oikeustulkki();
    legalInterpreter.setTulkki(interpreter);
    legalInterpreter.setTutkintoTyyppi(Oikeustulkki.TutkintoTyyppi.OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO);
    legalInterpreter.setJulkaisulupa(true);
    legalInterpreter.setJulkaisulupaEmail(true);
    legalInterpreter.setJulkaisulupaMuuYhteystieto(true);

    interpreter.getOikeustulkit().add(legalInterpreter);
    return legalInterpreter;
  }

  public static Kielipari languagePair(
    final Oikeustulkki legalInterpreter,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    final Kielipari languagePair = new Kielipari(legalInterpreter, new Kieli(from), new Kieli(to), begin, end);

    legalInterpreter.getKielet().add(languagePair);
    return languagePair;
  }
}
