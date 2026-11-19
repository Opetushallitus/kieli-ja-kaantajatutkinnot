package fi.oph.yki.api.clerk;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.Factory;
import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.ExamDate;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Organizer;
import fi.oph.yki.model.Participant;
import fi.oph.yki.model.Person;
import fi.oph.yki.model.Registration;
import fi.oph.yki.onr.OnrService;
import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/**
 * The clerk customer search from the database to the JSON. The clerk UI's Cypress tests use MSW
 * fixtures with the same field names (frontend/packages/yki/clerk/src/tests/msw/fixtures/
 * customersSearch.ts), so together the two cover the whole path. Each test runs in a transaction
 * that is rolled back.
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestEntityManager
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
@Transactional
// The audit log reads the clerk's OID from the user name (AuditUtil.getOptionalClerkOid), so the
// name must be an OID.
@WithMockUser(username = "1.2.246.562.24.00000000099", roles = "APP_YKI_YLLAPITAJA")
class ClerkCustomerControllerIntegrationTest {

  private static final String NOT_INDIVIDUALISED_OID = "1.2.246.562.24.00000000001";
  private static final String INDIVIDUALISED_OID = "1.2.246.562.24.00000000002";
  // Not checked in ONR, because the person has no registration.
  private static final String NO_REGISTRATION_OID = "1.2.246.562.24.00000000003";

  @Resource
  private MockMvc mockMvc;

  @Resource
  private TestEntityManager entityManager;

  // The search reads the SSNs from ONR. With no answer, the search shows no SSNs.
  @MockitoBean
  private OnrService onrService;

  @BeforeEach
  public void setup() {
    final Organizer organizer = Factory.organizer();
    final ExamDate examDate = Factory.examDate();
    final ExamSession examSession = Factory.examSession(examDate);
    examSession.setOrganizer(organizer);
    final Participant participant = Factory.participant("test@example.com");

    entityManager.persist(organizer);
    entityManager.persist(examDate);
    entityManager.persist(examSession);
    entityManager.persist(participant);
    persistPerson(NOT_INDIVIDUALISED_OID, false, participant, examSession);
    persistPerson(INDIVIDUALISED_OID, true, participant, examSession);
    persistPerson(NO_REGISTRATION_OID, null, null, null);
    entityManager.flush();
    entityManager.clear();
  }

  private void persistPerson(
    final String oid,
    final Boolean individualised,
    final Participant participant,
    final ExamSession examSession
  ) {
    final Person person = Factory.person();
    person.setOid(oid);
    person.setIndividualised(individualised);
    person.setOnrLastSyncAt(individualised == null ? null : LocalDateTime.now());
    entityManager.persist(person);

    if (participant != null) {
      final Registration registration = Factory.registration(person);
      registration.setParticipant(participant);
      registration.setExamSession(examSession);
      entityManager.persist(registration);
    }
  }

  private ResultActions search(final String body) throws Exception {
    return mockMvc.perform(
      post("/v2/api/clerk/customer/search").with(csrf()).contentType(MediaType.APPLICATION_JSON).content(body)
    );
  }

  private static String individualisedOf(final String oid) {
    return String.format("$.content[?(@.person.oid == '%s')].person.individualised", oid);
  }

  @Test
  public void testSearchReturnsIndividualisedStatus() throws Exception {
    search("{}")
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.totalElements").value(3))
      .andExpect(jsonPath(individualisedOf(NOT_INDIVIDUALISED_OID)).value(false))
      .andExpect(jsonPath(individualisedOf(INDIVIDUALISED_OID)).value(true));
  }

  @Test
  public void testOnlyNotIndividualisedReturnsPersonsWithRegistrationWhoAreNotIndividualised() throws Exception {
    search("{\"onlyNotIndividualised\": true}")
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.totalElements").value(1))
      .andExpect(jsonPath("$.content[0].person.oid").value(NOT_INDIVIDUALISED_OID))
      .andExpect(jsonPath("$.content[0].person.individualised").value(false))
      // application.yaml: app.henkilo-ui.url is untuva unless henkilo-ui-url is set.
      .andExpect(
        jsonPath("$.content[0].person.onrUrl")
          .value(
            "https://virkailija.untuvaopintopolku.fi/henkilo-ui/oppija/" +
            NOT_INDIVIDUALISED_OID +
            "?permissionCheckService=YKI"
          )
      );
  }

  @Test
  public void testOnlyNotIndividualisedFalseReturnsEveryPerson() throws Exception {
    search("{\"onlyNotIndividualised\": false}")
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.totalElements").value(3));
  }
}
