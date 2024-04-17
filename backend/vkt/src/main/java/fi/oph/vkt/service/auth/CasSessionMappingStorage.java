package fi.oph.vkt.service.auth;

import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import org.apereo.cas.client.session.SessionMappingStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class CasSessionMappingStorage implements SessionMappingStorage {

  private final Map<String, HttpSession> MANAGED_SESSIONS = new HashMap();
  private final Map<String, String> ID_TO_SESSION_KEY_MAPPING = new HashMap();
  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  public CasSessionMappingStorage() {}

  public synchronized HttpSession removeSessionByMappingId(String mappingId) {
    HttpSession session = (HttpSession) this.MANAGED_SESSIONS.get(mappingId);
    if (session != null) {
      this.removeBySessionById(session.getId());
    }

    return session;
  }

  public synchronized void removeBySessionById(String sessionId) {
    this.logger.debug("Attempting to remove Session=[{}]", sessionId);
    String key = (String) this.ID_TO_SESSION_KEY_MAPPING.get(sessionId);
    if (this.logger.isDebugEnabled()) {
      if (key != null) {
        this.logger.debug("Found mapping for session.  Session Removed.");
      } else {
        this.logger.debug("No mapping for session found.  Ignoring.");
      }
    }

    this.MANAGED_SESSIONS.remove(key);
    this.ID_TO_SESSION_KEY_MAPPING.remove(sessionId);
  }

  public synchronized void addSessionById(String mappingId, HttpSession session) {
    this.ID_TO_SESSION_KEY_MAPPING.put(session.getId(), mappingId);
    this.MANAGED_SESSIONS.put(mappingId, session);
  }

  public synchronized String getSessionMappingId(final HttpSession session) {
    return this.ID_TO_SESSION_KEY_MAPPING.get(session.getId());
  }
}
