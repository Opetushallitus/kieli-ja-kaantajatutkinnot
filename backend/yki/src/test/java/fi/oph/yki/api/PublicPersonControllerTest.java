package fi.oph.yki.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.api.dto.PublicExamSessionLocationDTO;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.api.dto.PublicPersonRegistrationDTO;
import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.RegistrationKind;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.service.PublicPersonService;
import fi.oph.yki.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicPersonController.class)
@Import(ControllerExceptionAdvice.class)
@TestPropertySource(properties = "app.customer-portal.enabled=true")
@WithMockUser(username = PublicPersonControllerTest.OID)
class PublicPersonControllerTest {

  private static final String BASE_URL = "/v2/api/public/person";

  static final String OID = "1.2.3.4.5";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PublicPersonService publicPersonService;

  @Test
  public void testGetPerson() throws Exception {
    final PublicPersonRegistrationDTO registration = PublicPersonRegistrationDTO
      .builder()
      .id(7L)
      .examSessionId(3L)
      .state(RegistrationState.SUBMITTED)
      .kind(RegistrationKind.QUEUE)
      .partialExamType(PartialExamType.ALL_PARTS)
      .examDate(LocalDate.of(2026, 10, 15))
      .languageCode("fin")
      .levelCode("PERUS")
      .type(ExamSessionType.FULL)
      .startTimeReadListen("09:00")
      .registrationStartDate(LocalDate.of(2026, 8, 1))
      .registrationEndDate(LocalDate.of(2026, 9, 30))
      .location(List.of(PublicExamSessionLocationDTO.builder().name("Testipaikka").lang("fi").build()))
      .expiresAt(LocalDate.of(2026, 10, 8))
      .examFee(140)
      .isTransferable(false)
      .isCancellable(true)
      .isTransfered(false)
      .liftedFromQueueAt(LocalDateTime.of(2026, 10, 1, 10, 0))
      .isFreeRegistration(false)
      .positionInQueue(2L)
      .build();
    final PublicPersonDTO person = PublicPersonDTO
      .builder()
      .oid(OID)
      .firstName("Testi")
      .lastName("Henkilö")
      .email("testi@example.com")
      .phoneNumber("0401234567")
      .streetAddress("Testikatu 1")
      .postOffice("Helsinki")
      .zip("00100")
      .countryCode("FIN")
      .registrations(List.of(registration))
      .build();

    when(publicPersonService.getPerson(OID)).thenReturn(person);

    mockMvc
      .perform(get(BASE_URL))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.oid").value(OID))
      .andExpect(jsonPath("$.first_name").value("Testi"))
      .andExpect(jsonPath("$.last_name").value("Henkilö"))
      .andExpect(jsonPath("$.email").value("testi@example.com"))
      .andExpect(jsonPath("$.phone_number").value("0401234567"))
      .andExpect(jsonPath("$.street_address").value("Testikatu 1"))
      .andExpect(jsonPath("$.post_office").value("Helsinki"))
      .andExpect(jsonPath("$.zip").value("00100"))
      .andExpect(jsonPath("$.country_code").value("FIN"))
      .andExpect(jsonPath("$.registrations[0].id").value(7))
      .andExpect(jsonPath("$.registrations[0].exam_session_id").value(3))
      .andExpect(jsonPath("$.registrations[0].state").value("SUBMITTED"))
      .andExpect(jsonPath("$.registrations[0].kind").value("QUEUE"))
      .andExpect(jsonPath("$.registrations[0].partial_exam_type").value("ALL_PARTS"))
      .andExpect(jsonPath("$.registrations[0].exam_date").value("2026-10-15"))
      .andExpect(jsonPath("$.registrations[0].language_code").value("fin"))
      .andExpect(jsonPath("$.registrations[0].level_code").value("PERUS"))
      .andExpect(jsonPath("$.registrations[0].type").value("FULL"))
      .andExpect(jsonPath("$.registrations[0].start_time_read_listen").value("09:00"))
      .andExpect(jsonPath("$.registrations[0].start_time_speak_write").isEmpty())
      .andExpect(jsonPath("$.registrations[0].registration_start_date").value("2026-08-01"))
      .andExpect(jsonPath("$.registrations[0].registration_end_date").value("2026-09-30"))
      .andExpect(jsonPath("$.registrations[0].evaluation_state").isEmpty())
      .andExpect(jsonPath("$.registrations[0].location[0].name").value("Testipaikka"))
      .andExpect(jsonPath("$.registrations[0].location[0].lang").value("fi"))
      .andExpect(jsonPath("$.registrations[0].paid_at").isEmpty())
      .andExpect(jsonPath("$.registrations[0].expires_at").value("2026-10-08"))
      .andExpect(jsonPath("$.registrations[0].exam_fee").value(140))
      .andExpect(jsonPath("$.registrations[0].is_transferable").value(false))
      .andExpect(jsonPath("$.registrations[0].is_cancellable").value(true))
      .andExpect(jsonPath("$.registrations[0].is_transfered").value(false))
      .andExpect(jsonPath("$.registrations[0].lifted_from_queue_at").value("2026-10-01T10:00:00"))
      .andExpect(jsonPath("$.registrations[0].is_free_registration").value(false))
      .andExpect(jsonPath("$.registrations[0].position_in_queue").value(2));
  }

  @Test
  public void testGetPersonNotFound() throws Exception {
    when(publicPersonService.getPerson(OID)).thenThrow(new NotFoundException("Person not found"));

    mockMvc.perform(get(BASE_URL)).andExpect(status().isNotFound());
  }
}
