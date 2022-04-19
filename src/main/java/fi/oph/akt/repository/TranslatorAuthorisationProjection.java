package fi.oph.akt.repository;

import fi.oph.akt.model.AuthorisationBasis;

public record TranslatorAuthorisationProjection(long translatorId, long authorisationId,
		AuthorisationBasis authorisationBasis) {
}
