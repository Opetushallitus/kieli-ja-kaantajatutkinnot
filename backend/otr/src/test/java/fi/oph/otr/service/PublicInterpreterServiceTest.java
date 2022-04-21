package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import java.time.LocalDate;
import java.util.List;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.security.test.context.support.WithMockUser;

@WithMockUser
@DataJpaTest
class PublicInterpreterServiceTest {

  @Resource
  private InterpreterRepository interpreterRepository;

  @Resource
  private LanguagePairRepository languagePairRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicInterpreterService publicInterpreterService;

  @BeforeEach
  public void setup() {
    publicInterpreterService = new PublicInterpreterService(interpreterRepository, languagePairRepository);
  }

  @Test
  public void testOnlyPublishingPermittedAreReturned() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate nextWeek = tomorrow.plusDays(7);
    final LocalDate previousWeek = today.minusDays(7);
    final LocalDate yesterday = today.minusDays(1);

    createLanguagePair(createLegalInterpreter(createInterpreter("not published"), false), "FI", "SE", today, tomorrow);
    final Kielipari expectedLanguagePair1 = createLanguagePair(
      createLegalInterpreter(createInterpreter("published1"), true),
      "FI",
      "EN",
      today,
      tomorrow
    );
    final Kielipari expectedLanguagePair2 = createLanguagePair(
      createLegalInterpreter(createInterpreter("published2"), true),
      "NO",
      "FI",
      yesterday,
      today
    );
    createLanguagePair(
      createLegalInterpreter(createInterpreterDeleted("deleted1"), true),
      "DE",
      "FI",
      yesterday,
      today
    );
    createLanguagePair(
      createLegalInterpreterDeleted(createInterpreter("deleted2"), true),
      "FI",
      "DE",
      yesterday,
      today
    );
    createLanguagePair(createLegalInterpreter(createInterpreter("in future"), true), "FI", "DN", tomorrow, nextWeek);
    createLanguagePair(createLegalInterpreter(createInterpreter("in past"), true), "FI", "IT", previousWeek, yesterday);

    final List<InterpreterDTO> published = publicInterpreterService.list();
    assertEquals(2, published.size());

    final InterpreterDTO publishedInterpreter1 = published.get(0);
    assertLanguagePair(expectedLanguagePair1, publishedInterpreter1);

    final InterpreterDTO publishedInterpreter2 = published.get(1);
    assertLanguagePair(expectedLanguagePair2, publishedInterpreter2);
  }

  private void assertLanguagePair(final Kielipari expected, final InterpreterDTO actualInterpreterDTO) {
    assertEquals(1, actualInterpreterDTO.languages().size());
    final LanguagePairDTO publishedLanguagePair1 = actualInterpreterDTO.languages().get(0);
    assertEquals(expected.getKielesta().getKoodi(), publishedLanguagePair1.from());
    assertEquals(expected.getKieleen().getKoodi(), publishedLanguagePair1.to());
  }

  private Tulkki createInterpreter(final String oid) {
    final Tulkki interpreter = Factory.interpreter(oid);
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Tulkki createInterpreterDeleted(final String oid) {
    final Tulkki interpreter = Factory.interpreter(oid);
    interpreter.markPoistettu();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Oikeustulkki createLegalInterpreter(final Tulkki interpreter, final boolean publish) {
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    legalInterpreter.setJulkaisulupa(publish);
    entityManager.persist(legalInterpreter);
    return legalInterpreter;
  }

  private Oikeustulkki createLegalInterpreterDeleted(final Tulkki interpreter, final boolean publish) {
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    legalInterpreter.markPoistettu();
    legalInterpreter.setJulkaisulupa(publish);
    entityManager.persist(legalInterpreter);
    return legalInterpreter;
  }

  private Kielipari createLanguagePair(
    final Oikeustulkki legalInterpreter,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    final Kielipari languagePair = Factory.languagePair(legalInterpreter, from, to, begin, end);
    entityManager.persist(languagePair);
    return languagePair;
  }
}
