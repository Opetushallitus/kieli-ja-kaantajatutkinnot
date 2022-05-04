package fi.oph.otr.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import fi.oph.otr.Factory;
import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Kielipari;
import fi.oph.otr.model.Oikeustulkki;
import fi.oph.otr.model.Tulkki;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.LanguagePairRepository;
import fi.oph.otr.repository.LegalInterpreterRepository;
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
  private LegalInterpreterRepository legalInterpreterRepository;

  @Resource
  private LanguagePairRepository languagePairRepository;

  @Resource
  private TestEntityManager entityManager;

  private PublicInterpreterService publicInterpreterService;

  @BeforeEach
  public void setup() {
    publicInterpreterService =
      new PublicInterpreterService(interpreterRepository, legalInterpreterRepository, languagePairRepository);
  }

  @Test
  public void testOnlyPublishingPermittedAreReturned() {
    final LocalDate today = LocalDate.now();
    final LocalDate tomorrow = LocalDate.now().plusDays(1);
    final LocalDate nextWeek = tomorrow.plusDays(7);
    final LocalDate previousWeek = today.minusDays(7);
    final LocalDate yesterday = today.minusDays(1);

    final Tulkki interpreter1 = createInterpreter();
    final Tulkki interpreter2 = createInterpreter();
    final Tulkki interpreter3 = createInterpreter();
    final Tulkki interpreter4 = createInterpreter();
    final Tulkki interpreter5 = createInterpreterDeleted();
    final Tulkki interpreter6 = createInterpreter();

    final Oikeustulkki legalInterpreter1 = createLegalInterpreter(interpreter1);
    final Oikeustulkki legalInterpreter2 = createLegalInterpreter(interpreter2);
    final Oikeustulkki legalInterpreter3 = createLegalInterpreter(interpreter3);
    final Oikeustulkki legalInterpreter4 = createLegalInterpreter(interpreter4);
    final Oikeustulkki legalInterpreter5 = createLegalInterpreter(interpreter5);
    final Oikeustulkki legalInterpreter6 = createLegalInterpreterDeleted(interpreter6);

    legalInterpreter1.setJulkaisulupaEmail(false);
    legalInterpreter1.setJulkaisulupaMuuYhteystieto(true);
    legalInterpreter1.setMuuYhteystieto("oikeustulkki.company@invalid");
    legalInterpreter2.setJulkaisulupaPuhelinnumero(false);
    legalInterpreter3.setJulkaisulupa(false);

    final Kielipari languagePair11 = createLanguagePair(legalInterpreter1, "FI", "EN", today, tomorrow);
    final Kielipari languagePair12 = createLanguagePair(legalInterpreter1, "NO", "FI", yesterday, today);
    final Kielipari languagePair21 = createLanguagePair(legalInterpreter2, "SE", "FI", yesterday, nextWeek);
    // Hidden, no publish permission
    createLanguagePair(legalInterpreter3, "FI", "RU", yesterday, nextWeek);
    // Hidden, in past
    createLanguagePair(legalInterpreter4, "FI", "IT", previousWeek, yesterday);
    // Hidden, in future
    createLanguagePair(legalInterpreter4, "FI", "DN", tomorrow, nextWeek);
    // Interpreter marked deleted
    createLanguagePair(legalInterpreter5, "DE", "FI", yesterday, nextWeek);
    // Legal interpreter marked deleted
    createLanguagePair(legalInterpreter6, "FR", "FI", yesterday, nextWeek);

    final List<InterpreterDTO> interpreters = publicInterpreterService.list();
    assertEquals(2, interpreters.size());

    final InterpreterDTO publishedInterpreter1 = interpreters.get(0);
    assertNull(publishedInterpreter1.email());
    assertNotNull(publishedInterpreter1.phoneNumber());
    assertEquals(legalInterpreter1.getMuuYhteystieto(), publishedInterpreter1.otherContactInfo());

    assertEquals(2, publishedInterpreter1.languages().size());
    assertLanguagePair(languagePair11, publishedInterpreter1.languages().get(0));
    assertLanguagePair(languagePair12, publishedInterpreter1.languages().get(1));

    final InterpreterDTO publishedInterpreter2 = interpreters.get(1);
    assertNotNull(publishedInterpreter2.email());
    assertNull(publishedInterpreter2.phoneNumber());
    assertNull(publishedInterpreter2.otherContactInfo());

    assertEquals(1, publishedInterpreter2.languages().size());
    assertLanguagePair(languagePair21, publishedInterpreter2.languages().get(0));
  }

  private void assertLanguagePair(final Kielipari expected, final LanguagePairDTO languagePairDTO) {
    assertEquals(expected.getKielesta().getKoodi(), languagePairDTO.from());
    assertEquals(expected.getKieleen().getKoodi(), languagePairDTO.to());
  }

  private Tulkki createInterpreter() {
    final Tulkki interpreter = Factory.interpreter();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Tulkki createInterpreterDeleted() {
    final Tulkki interpreter = Factory.interpreter();
    interpreter.markPoistettu();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Oikeustulkki createLegalInterpreter(final Tulkki interpreter) {
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    entityManager.persist(legalInterpreter);
    return legalInterpreter;
  }

  private Oikeustulkki createLegalInterpreterDeleted(final Tulkki interpreter) {
    final Oikeustulkki legalInterpreter = Factory.legalInterpreter(interpreter);
    legalInterpreter.markPoistettu();
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
