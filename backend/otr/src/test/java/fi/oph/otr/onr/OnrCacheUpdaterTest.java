package fi.oph.otr.onr;

import static org.mockito.Mockito.verify;

import fi.oph.otr.Factory;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.repository.InterpreterRepository;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
public class OnrCacheUpdaterTest {

  private OnrCacheUpdater onrCacheUpdater;

  @Resource
  private InterpreterRepository interpreterRepository;

  @MockBean
  private OnrService onrService;

  @Resource
  private TestEntityManager entityManager;

  @BeforeEach
  public void setup() {
    onrCacheUpdater = new OnrCacheUpdater(interpreterRepository, onrService);
  }

  @Test
  public void testUpdateOnrCache() {
    final Interpreter interpreter1 = Factory.interpreter();
    entityManager.persist(interpreter1);

    final Interpreter interpreter2 = Factory.interpreter();
    entityManager.persist(interpreter2);

    onrCacheUpdater.updateOnrCache();

    final List<String> onrIds = List.of(interpreter1.getOnrId(), interpreter2.getOnrId());
    verify(onrService).updateCache(onrIds);
  }
}
