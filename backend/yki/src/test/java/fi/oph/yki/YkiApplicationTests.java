package fi.oph.yki;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-hsql")
class YkiApplicationTests {

  @Test
  void contextLoads() {}
}
