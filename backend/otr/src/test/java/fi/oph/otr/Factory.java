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
    final Oikeustulkki o = new Oikeustulkki();
    o.setTulkki(interpreter);
    o.setTutkintoTyyppi(Oikeustulkki.TutkintoTyyppi.OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO);
    o.setJulkaisulupa(true);
    o.setJulkaisulupaEmail(true);
    o.setJulkaisulupaMuuYhteystieto(true);

    interpreter.getOikeustulkit().add(o);
    return o;
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
