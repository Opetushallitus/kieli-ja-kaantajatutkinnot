package fi.oph.vkt.util;

import javax.servlet.http.HttpSession;

public class SessionUtil {

  private static final String PERSON_ID_SESSION_KEY = "person_id";

<<<<<<< HEAD
  public static final Long getPersonId(HttpSession session) {
    return (Long) session.getAttribute(PERSON_ID_SESSION_KEY);
  }

  public static final void setPersonId(HttpSession session, Long personId) {
=======
  public static Long getPersonId(final HttpSession session) {
    return (Long) session.getAttribute(PERSON_ID_SESSION_KEY);
  }

  public static void setPersonId(final HttpSession session, final Long personId) {
>>>>>>> dev
    session.setAttribute(PERSON_ID_SESSION_KEY, personId);
  }
}
