package fi.oph.akr.util;

import fi.oph.akr.repository.AuthorisationProjection;
import java.util.Comparator;

public class AuthorisationProjectionComparator implements Comparator<AuthorisationProjection> {

  @Override
  public int compare(final AuthorisationProjection proj1, final AuthorisationProjection proj2) {
    if (proj1.termBeginDate() != null && proj2.termBeginDate() != null) {
      return proj1.termBeginDate().compareTo(proj2.termBeginDate());
    } else if (proj1.termBeginDate() != null) {
      return 1;
    }
    return -1;
  }
}
