package fi.oph.otr;

import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.QualificationExaminationType;
import fi.oph.otr.model.Sijainti;
import fi.oph.otr.model.Tulkki;
import java.time.LocalDate;
import java.util.UUID;

public class Factory {

  public static Tulkki interpreter() {
    final Tulkki interpreter = new Tulkki();
    interpreter.setOnrId(UUID.randomUUID().toString());
    interpreter.setPermissionToPublishEmail(true);
    interpreter.setPermissionToPublishPhone(true);
    interpreter.setPermissionToPublishOtherContactInfo(false);
    return interpreter;
  }

  public static Oikeustulkki qualification(final Tulkki interpreter) {
    final Oikeustulkki qualification = new Oikeustulkki();
    qualification.setInterpreter(interpreter);
    qualification.setExaminationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM);
    qualification.setPermissionToPublish(true);

    interpreter.getQualifications().add(qualification);
    return qualification;
  }

  public static Kielipari languagePair(
    final Oikeustulkki qualification,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    final Kielipari languagePair = new Kielipari();
    languagePair.setQualification(qualification);
    languagePair.setFromLang(from);
    languagePair.setToLang(to);
    languagePair.setBeginDate(begin);
    languagePair.setEndDate(end);
    qualification.getLanguagePairs().add(languagePair);
    return languagePair;
  }

  public static Sijainti region(final Tulkki interpreter, final String code) {
    final Sijainti region = new Sijainti();
    region.setInterpreter(interpreter);
    region.setCode(code);
    interpreter.getRegions().add(region);
    return region;
  }
}
