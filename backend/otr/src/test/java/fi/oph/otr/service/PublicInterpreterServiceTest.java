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

    final Tulkki interpreter1 = createInterpreter();
    final Tulkki interpreter2 = createInterpreter();
    final Tulkki interpreter3 = createInterpreter();
    final Tulkki interpreter4 = createInterpreter();
    final Tulkki interpreter5 = createInterpreterDeleted();
    final Tulkki interpreter6 = createInterpreter();

    final Oikeustulkki qualification1 = createQualification(interpreter1);
    final Oikeustulkki qualification2 = createQualification(interpreter2);
    final Oikeustulkki qualification3 = createQualification(interpreter3);
    final Oikeustulkki qualification4 = createQualification(interpreter4);
    final Oikeustulkki qualification5 = createQualification(interpreter5);
    final Oikeustulkki qualification6 = createQualificationDeleted(interpreter6);

    interpreter1.setPermissionToPublishEmail(false);
    interpreter1.setPermissionToPublishOtherContactInfo(true);
    interpreter1.setOtherContactInformation("oikeustulkki.company@invalid");
    interpreter2.setPermissionToPublishPhone(false);
    qualification3.setPermissionToPublish(false);

    final Kielipari languagePair11 = createLanguagePair(qualification1, "FI", "EN", today, tomorrow);
    final Kielipari languagePair12 = createLanguagePair(qualification1, "NO", "FI", yesterday, today);
    final Kielipari languagePair21 = createLanguagePair(qualification2, "SE", "FI", yesterday, nextWeek);
    // Hidden, no publish permission
    createLanguagePair(qualification3, "FI", "RU", yesterday, nextWeek);
    // Hidden, in past
    createLanguagePair(qualification4, "FI", "IT", previousWeek, yesterday);
    // Hidden, in future
    createLanguagePair(qualification4, "FI", "DN", tomorrow, nextWeek);
    // Interpreter marked deleted
    createLanguagePair(qualification5, "DE", "FI", yesterday, nextWeek);
    // Legal interpreter marked deleted
    createLanguagePair(qualification6, "FR", "FI", yesterday, nextWeek);

    final List<InterpreterDTO> interpreters = publicInterpreterService.list();
    assertEquals(2, interpreters.size());

    final InterpreterDTO publishedInterpreter1 = interpreters.get(0);
    assertNull(publishedInterpreter1.email());
    assertNotNull(publishedInterpreter1.phoneNumber());
    assertEquals(interpreter1.getOtherContactInformation(), publishedInterpreter1.otherContactInfo());

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
    assertEquals(expected.getFromLang(), languagePairDTO.from());
    assertEquals(expected.getToLang(), languagePairDTO.to());
  }

  private Tulkki createInterpreter() {
    final Tulkki interpreter = Factory.interpreter();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Tulkki createInterpreterDeleted() {
    final Tulkki interpreter = Factory.interpreter();
    interpreter.markDeleted();
    entityManager.persist(interpreter);
    return interpreter;
  }

  private Oikeustulkki createQualification(final Tulkki interpreter) {
    final Oikeustulkki qualification = Factory.qualification(interpreter);
    entityManager.persist(qualification);
    return qualification;
  }

  private Oikeustulkki createQualificationDeleted(final Tulkki interpreter) {
    final Oikeustulkki qualification = Factory.qualification(interpreter);
    qualification.markDeleted();
    entityManager.persist(qualification);
    return qualification;
  }

  private Kielipari createLanguagePair(
    final Oikeustulkki qualification,
    final String from,
    final String to,
    final LocalDate begin,
    final LocalDate end
  ) {
    final Kielipari languagePair = Factory.languagePair(qualification, from, to, begin, end);
    entityManager.persist(languagePair);
    return languagePair;
  }
}
