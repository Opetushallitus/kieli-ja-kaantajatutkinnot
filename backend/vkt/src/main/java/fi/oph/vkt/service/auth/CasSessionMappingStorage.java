package fi.oph.vkt.service.auth;

import fi.oph.vkt.model.CasTicket;
import fi.oph.vkt.repository.CasTicketRepository;
import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.Optional;
import org.apereo.cas.client.session.SessionMappingStorage;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.transaction.annotation.Transactional;

public class CasSessionMappingStorage implements SessionMappingStorage {

  private final FindByIndexNameSessionRepository<? extends Session> sessions;
  private final CasTicketRepository casTicketRepository;

  public CasSessionMappingStorage(
    final FindByIndexNameSessionRepository<? extends Session> sessions,
    final CasTicketRepository casTicketRepository
  ) {
    this.sessions = sessions;
    this.casTicketRepository = casTicketRepository;
  }

  @Transactional
  public HttpSession removeSessionByMappingId(final String mappingId) {
    final Optional<CasTicket> casTicket = casTicketRepository.findByTicket(mappingId);

    if (casTicket.isPresent()) {
      final HttpSession session = (HttpSession) sessions.findById(casTicket.get().getSessionId());
      if (session != null) {
        this.removeBySessionById(session.getId());
      }

      return session;
    }

    return null;
  }

  @Transactional
  public void removeBySessionById(final String sessionId) {
    casTicketRepository.deleteAllBySessionId(sessionId);
  }

  @Transactional
  public void addSessionById(final String mappingId, final HttpSession session) {
    final CasTicket casTicket = casTicketRepository.findBySessionId(session.getId()).orElse(new CasTicket());
    casTicket.setSessionId(session.getId());
    casTicket.setTicket(mappingId);
    casTicket.setCreatedAt(LocalDateTime.now());
    casTicketRepository.saveAndFlush(casTicket);
  }

  @Transactional(readOnly = true)
  public String getSessionMappingId(final HttpSession session) {
    return casTicketRepository.findBySessionId(session.getId()).map(CasTicket::getTicket).orElse(null);
  }
}
