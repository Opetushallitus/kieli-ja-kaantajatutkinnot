package fi.oph.yki;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
class YkiApplicationTests {

  @Test
  void contextLoads() {}
}
