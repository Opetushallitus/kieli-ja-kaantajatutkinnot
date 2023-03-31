package fi.oph.vkt.util;

import javax.servlet.http.HttpSession;

public class SessionUtil {

  private static final String PERSON_ID_SESSION_KEY = "person_id";

  public static Long getPersonId(HttpSession session) {
    return (Long) session.getAttribute(PERSON_ID_SESSION_KEY);
  }

  public static void setPersonId(HttpSession session, Long personId) {
    session.setAttribute(PERSON_ID_SESSION_KEY, personId);
  }
}
