package fi.oph.akt.util;

import fi.oph.akt.repository.AuthorisationTermProjection;

import java.util.Comparator;

public class AuthorisationTermProjectionComparator implements Comparator<AuthorisationTermProjection> {

	@Override
	public int compare(final AuthorisationTermProjection proj1, final AuthorisationTermProjection proj2) {
		return proj1.beginDate().compareTo(proj2.beginDate());
	}

}
