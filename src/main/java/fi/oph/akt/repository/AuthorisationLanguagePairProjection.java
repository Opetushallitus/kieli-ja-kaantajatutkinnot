package fi.oph.akt.repository;

public record AuthorisationLanguagePairProjection(long authorisationId, String fromLang, String toLang,
		boolean permissionToPublish) {
}
