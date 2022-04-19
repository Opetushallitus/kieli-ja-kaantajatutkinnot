package fi.oph.akt;

import fi.oph.akt.model.Authorisation;
import fi.oph.akt.model.AuthorisationBasis;
import fi.oph.akt.model.AuthorisationTerm;
import fi.oph.akt.model.Email;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.LanguagePair;
import fi.oph.akt.model.MeetingDate;
import fi.oph.akt.model.Translator;

import java.time.LocalDate;
import java.util.UUID;

public class Factory {

	public static MeetingDate meetingDate() {
		final MeetingDate meetingDate = new MeetingDate();
		meetingDate.setDate(LocalDate.now());

		return meetingDate;
	}

	public static Translator translator() {
		final Translator translator = new Translator();
		translator.setOnrOid(UUID.randomUUID().toString());

		return translator;
	}

	public static Authorisation authorisation(Translator translator, MeetingDate meetingDate) {
		final Authorisation authorisation = new Authorisation();
		authorisation.setTranslator(translator);
		authorisation.setMeetingDate(meetingDate);
		authorisation.setBasis(AuthorisationBasis.AUT);
		authorisation.setAutDate(LocalDate.now());
		authorisation.setAssuranceDate(LocalDate.now());

		return authorisation;
	}

	public static LanguagePair languagePair(Authorisation authorisation) {
		final LanguagePair languagePair = new LanguagePair();
		languagePair.setAuthorisation(authorisation);
		languagePair.setFromLang("FI");
		languagePair.setToLang("EN");
		languagePair.setPermissionToPublish(true);

		return languagePair;
	}

	public static AuthorisationTerm authorisationTerm(Authorisation authorisation) {
		final AuthorisationTerm authorisationTerm = new AuthorisationTerm();
		authorisationTerm.setAuthorisation(authorisation);
		authorisationTerm.setBeginDate(LocalDate.now());
		authorisationTerm.setEndDate(LocalDate.now().plusYears(1));

		return authorisationTerm;
	}

	public static Email email(final EmailType emailType) {
		final Email email = new Email();
		email.setEmailType(emailType);
		email.setSender("Lasse Lähettäjä");
		email.setRecipient("ville.vastaanottaja@invalid");
		email.setSubject("Spostin otsikko");
		email.setBody("Sisältö on tässä");
		return email;
	}

}
