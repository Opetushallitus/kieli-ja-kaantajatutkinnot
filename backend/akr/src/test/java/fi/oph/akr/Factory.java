package fi.oph.akr;

import fi.oph.akr.api.dto.translator.TranslatorAddressDTO;
import fi.oph.akr.model.Authorisation;
import fi.oph.akr.model.AuthorisationBasis;
import fi.oph.akr.model.AuthorisationTermReminder;
import fi.oph.akr.model.ContactRequest;
import fi.oph.akr.model.ContactRequestStatistic;
import fi.oph.akr.model.ContactRequestTranslator;
import fi.oph.akr.model.Email;
import fi.oph.akr.model.EmailStatistic;
import fi.oph.akr.model.EmailType;
import fi.oph.akr.model.ExaminationDate;
import fi.oph.akr.model.MeetingDate;
import fi.oph.akr.model.Translator;
import fi.oph.akr.onr.dto.ContactDetailsGroupSource;
import fi.oph.akr.onr.dto.ContactDetailsGroupType;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

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
    translator.setOnrId(UUID.randomUUID().toString());
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

  public static ContactRequestStatistic contactRequestStatistic(
    final LocalDate date,
    final String from,
    final String to,
    final int contactRequestCount,
    final int contactCount
  ) {
    final ContactRequestStatistic c = new ContactRequestStatistic();
    c.setYear(date.getYear());
    c.setMonth(date.getMonthValue());
    c.setDay(date.getDayOfMonth());
    c.setFromLang(from);
    c.setToLang(to);
    c.setContactRequestCount(contactRequestCount);
    c.setContactCount(contactCount);
    return c;
  }

  public static EmailStatistic emailStatistic(final LocalDate date, final EmailType emailType, final long count) {
    final EmailStatistic e = new EmailStatistic();
    e.setYear(date.getYear());
    e.setMonth(date.getMonthValue());
    e.setDay(date.getDayOfMonth());
    e.setEmailType(emailType);
    e.setCount(count);
    return e;
  }

  public static List<TranslatorAddressDTO> createAddress(
    final String street,
    final String postalCode,
    final String town,
    final String country
  ) {
    return List.of(
      TranslatorAddressDTO
        .builder()
        .street(street)
        .postalCode(postalCode)
        .town(town)
        .country(country)
        .source(ContactDetailsGroupSource.AKR)
        .type(ContactDetailsGroupType.AKR_OSOITE)
        .build()
    );
  }
}
