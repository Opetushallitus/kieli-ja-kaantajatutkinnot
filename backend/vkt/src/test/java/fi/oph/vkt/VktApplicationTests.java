package fi.oph.vkt;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class VktApplicationTests {

  @MockBean
  private SessionRegistry sessionRegistry;

  @Test
  void contextLoads() {}
}
