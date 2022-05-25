package fi.oph.otr;

import fi.oph.otr.model.Email;
import fi.oph.otr.model.EmailType;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.model.Qualification;
import fi.oph.otr.model.QualificationExaminationType;
import fi.oph.otr.model.QualificationReminder;
import fi.oph.otr.model.Region;
import java.time.LocalDate;
import java.util.UUID;

public class Factory {

  public static Interpreter interpreter() {
    final Interpreter interpreter = new Interpreter();
    interpreter.setOnrId(UUID.randomUUID().toString());
    interpreter.setPermissionToPublishEmail(true);
    interpreter.setPermissionToPublishPhone(true);
    interpreter.setPermissionToPublishOtherContactInfo(false);
    return interpreter;
  }

  public static Qualification qualification(final Interpreter interpreter) {
    final Qualification qualification = new Qualification();
    qualification.setInterpreter(interpreter);
    qualification.setFromLang("FI");
    qualification.setToLang("EN");
    qualification.setBeginDate(LocalDate.now());
    qualification.setEndDate(LocalDate.now().plusYears(1));
    qualification.setExaminationType(QualificationExaminationType.LEGAL_INTERPRETER_EXAM);
    qualification.setPermissionToPublish(true);

    interpreter.getQualifications().add(qualification);
    return qualification;
  }

  public static Region region(final Interpreter interpreter, final String code) {
    final Region region = new Region();
    region.setInterpreter(interpreter);
    region.setCode(code);
    interpreter.getRegions().add(region);
    return region;
  }

  public static Email email() {
    final Email email = new Email();
    email.setEmailType(EmailType.QUALIFICATION_EXPIRY);
    email.setRecipientName("Ville Vastaanottaja");
    email.setRecipientAddress("ville.vastaanottaja@invalid");
    email.setSubject("Otsikko");
    email.setBody("Sisältö on tässä");

    return email;
  }

  public static QualificationReminder qualificationReminder(final Qualification qualification, final Email email) {
    final QualificationReminder reminder = new QualificationReminder();
    reminder.setQualification(qualification);
    reminder.setEmail(email);
    qualification.getReminders().add(reminder);
    return reminder;
  }
}
