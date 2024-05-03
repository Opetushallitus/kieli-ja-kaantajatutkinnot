package fi.oph.vkt.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class CasSessionStorageTest {

  @Test
  public void testCreatePersonFromTicket() {
    // TODO
    //final HttpSession httpSession = mock(HttpSession.class);
    //final CasSessionMappingStorage casSessionMappingStorage = new CasSessionMappingStorage();

    //casSessionMappingStorage.addSessionById("foobar", httpSession);
  }
}
