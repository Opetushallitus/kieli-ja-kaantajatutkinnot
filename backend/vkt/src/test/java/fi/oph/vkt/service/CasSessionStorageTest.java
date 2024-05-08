package fi.oph.vkt.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.service.auth.CasSessionMappingStorage;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;

@WithMockUser
@DataJpaTest
public class CasSessionStorageTest {

  @Resource
  private CasTicketRepository casTicketRepository;

  @Test
  public void testAddAndRemoveSession() {
    final FindByIndexNameSessionRepository<? extends Session> sessions = mock(FindByIndexNameSessionRepository.class);
    final HttpSession httpSession = mock(HttpSession.class);
    final CasSessionMappingStorage casSessionMappingStorage = new CasSessionMappingStorage(
      sessions,
      casTicketRepository
    );

    when(httpSession.getId()).thenReturn("foo");

    casSessionMappingStorage.addSessionById("foobar", httpSession);

    assertTrue(casTicketRepository.findBySessionId("foo").isPresent());
    assertTrue(casTicketRepository.findByTicket("foobar").isPresent());
    assertEquals(casSessionMappingStorage.getSessionMappingId(httpSession), "foobar");

    casSessionMappingStorage.removeBySessionById("foo");

    assertFalse(casTicketRepository.findBySessionId("foo").isPresent());
    assertFalse(casTicketRepository.findByTicket("foobar").isPresent());
    assertNull(casSessionMappingStorage.getSessionMappingId(httpSession));
  }

  @Test
  public void testRemoveBySessionMappingId() {
    final FindByIndexNameSessionRepository<Session> sessions = (FindByIndexNameSessionRepository<Session>) mock(
      FindByIndexNameSessionRepository.class
    );
    final HttpSession httpSession = mock(HttpSession.class);
    final Session session = mock(Session.class);
    final CasSessionMappingStorage casSessionMappingStorage = new CasSessionMappingStorage(
      sessions,
      casTicketRepository
    );

    when(httpSession.getId()).thenReturn("foo");
    when(session.getId()).thenReturn("foo");
    when(sessions.findById(eq("foo"))).thenReturn(session);

    casSessionMappingStorage.addSessionById("foobar", httpSession);
    casSessionMappingStorage.removeSessionByMappingId("foobar");

    assertFalse(casTicketRepository.findBySessionId("foo").isPresent());
    assertFalse(casTicketRepository.findByTicket("foobar").isPresent());
    assertNull(casSessionMappingStorage.getSessionMappingId(httpSession));
  }
}
