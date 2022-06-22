package fi.oph.akt;

import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationBasis;
import fi.oph.akt.model.AuthorisationTermReminder;
import fi.oph.akt.model.ContactRequest;
import fi.oph.akt.model.ContactRequestTranslator;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.ExaminationDate;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;
import java.time.LocalDate;

public class Factory {

  public static MeetingDate meetingDate() {
    return meetingDate(LocalDate.now());
  }

  public static MeetingDate meetingDate(final LocalDate date) {
    final MeetingDate meetingDate = new MeetingDate();
    meetingDate.setDate(date);

    return meetingDate;
  }

  public static ExaminationDate examinationDate() {
    return examinationDate(LocalDate.now());
  }

  public static ExaminationDate examinationDate(final LocalDate date) {
    final ExaminationDate examinationDate = new ExaminationDate();
    examinationDate.setDate(date);

    return examinationDate;
  }

  public static Translator translator() {
    final Translator translator = new Translator();
    translator.setFirstName("Foo");
    translator.setLastName("Bar");
    translator.setAssuranceGiven(true);

    return translator;
  }

  public static Authorisation autAuthorisation(
    final Translator translator,
    final MeetingDate meetingDate,
    final ExaminationDate examinationDate
  ) {
    final Authorisation authorisation = authorisation(AuthorisationBasis.AUT, translator, meetingDate);
    examinationDate.getAuthorisations().add(authorisation);
    authorisation.setExaminationDate(examinationDate);

    return authorisation;
  }

  public static Authorisation kktAuthorisation(final Translator translator, final MeetingDate meetingDate) {
    return authorisation(AuthorisationBasis.KKT, translator, meetingDate);
  }

  public static Authorisation virAuthorisation(final Translator translator, final MeetingDate meetingDate) {
    return authorisation(AuthorisationBasis.VIR, translator, meetingDate);
  }

  public static Authorisation formerVirAuthorisation(final Translator translator) {
    return authorisation(AuthorisationBasis.VIR, translator, null);
  }

  private static Authorisation authorisation(
    final AuthorisationBasis basis,
    final Translator translator,
    final MeetingDate meetingDate
  ) {
    final Authorisation authorisation = new Authorisation();
    translator.getAuthorisations().add(authorisation);
    authorisation.setTranslator(translator);

    if (meetingDate != null) {
      meetingDate.getAuthorisations().add(authorisation);
      authorisation.setMeetingDate(meetingDate);
      authorisation.setTermBeginDate(meetingDate.getDate());

      if (basis != AuthorisationBasis.VIR) {
        authorisation.setTermEndDate(meetingDate.getDate().plusYears(1));
      }
    }
    authorisation.setBasis(basis);
    authorisation.setFromLang("FI");
    authorisation.setToLang("EN");
    authorisation.setPermissionToPublish(true);
    authorisation.setDiaryNumber("12345");

    return authorisation;
  }

  public static Email email(final EmailType emailType) {
    final Email email = new Email();
    email.setEmailType(emailType);
    email.setRecipientName("Ville Vastaanottaja");
    email.setRecipientAddress("ville.vastaanottaja@invalid");
    email.setSubject("Otsikko");
    email.setBody("Sisältö on tässä");

    return email;
  }

  public static AuthorisationTermReminder authorisationTermReminder(
    final Authorisation authorisation,
    final Email email
  ) {
    final AuthorisationTermReminder reminder = new AuthorisationTermReminder();
    authorisation.getReminders().add(reminder);

    reminder.setAuthorisation(authorisation);
    reminder.setEmail(email);

    return reminder;
  }

  public static ContactRequest contactRequest() {
    final ContactRequest contactRequest = new ContactRequest();
    contactRequest.setFirstName("Anne");
    contactRequest.setLastName("Aardvark");
    contactRequest.setEmail("anne.aardvark@example.invalid");
    contactRequest.setMessage("Test message");
    contactRequest.setFromLang("FI");
    contactRequest.setToLang("EN");

    return contactRequest;
  }

  public static ContactRequestTranslator contactRequestTranslator(
    final Translator translator,
    final ContactRequest contactRequest
  ) {
    final ContactRequestTranslator contactRequestTranslator = new ContactRequestTranslator();
    translator.getContactRequestTranslators().add(contactRequestTranslator);
    contactRequest.getContactRequestTranslators().add(contactRequestTranslator);

    contactRequestTranslator.setTranslator(translator);
    contactRequestTranslator.setContactRequest(contactRequest);

    return contactRequestTranslator;
  }
}
