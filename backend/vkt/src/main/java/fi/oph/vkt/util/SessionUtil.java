package fi.oph.vkt.util;

import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.servlet.http.HttpSession;

public class SessionUtil {

  private static final String PERSON_ID_SESSION_KEY = "person_id";

  public static boolean hasPersonId(final HttpSession session) {
    return session.getAttribute(PERSON_ID_SESSION_KEY) != null;
  }

  public static Long getPersonId(final HttpSession session) {
    final Long personId = (Long) session.getAttribute(PERSON_ID_SESSION_KEY);

    if (personId == null) {
      throw new APIException(APIExceptionType.SESSION_MISSING_PERSON_ID);
    }

    return personId;
  }

  public static void setPersonId(final HttpSession session, final Long personId) {
    session.setAttribute(PERSON_ID_SESSION_KEY, personId);
  }
}
