package fi.oph.vkt.service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.api.dto.integration.GradeDTO;
import fi.oph.vkt.api.dto.integration.PartialExamsDTO;
import fi.oph.vkt.api.dto.integration.RegisterEnrollmentDTO;
import fi.oph.vkt.api.dto.integration.RegisterPersonDTO;
import fi.oph.vkt.api.dto.integration.RegisterSyncDTO;
import fi.oph.vkt.api.dto.integration.SourceDTO;
import fi.oph.vkt.config.Constants;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.EnrollmentCommon;
import fi.oph.vkt.model.EnrollmentGrade;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.model.type.EnrollmentGradeType;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.DateUtil;
import fi.oph.vkt.util.PersonUtil;
import fi.vm.sade.javautils.nio.cas.CasClient;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import org.asynchttpclient.Request;
import org.asynchttpclient.RequestBuilder;
import org.asynchttpclient.Response;
import org.asynchttpclient.util.HttpConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegisterEnrollmentService {

  public static final String SPEAKING_PARTIAL_EXAM = "puhuminen";
  public static final String WRITING_PARTIAL_EXAM = "kirjoittaminen";
  public static final String READING_COMPREHENSION_PARTIAL_EXAM = "tekstinymmartaminen";
  public static final String SPEECH_COMPREHENSION_PARTIAL_EXAM = "puheenymmartaminen";
  public static final String LEVEL_EXCELLENT = "erinomainen";
  public static final String LEVEL_GOOD_AND_SATISFACTORY = "hyvajatyydyttava";

  private static final Logger LOG = LoggerFactory.getLogger(RegisterEnrollmentService.class);
  private final CasClient registerClient;
  private final EnrollmentRepository enrollmentRepository;
  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final Environment environment;

  @Transactional
  public void sync() throws JsonProcessingException {
    final List<Enrollment> enrollments = enrollmentRepository.findEnrollmentsForSyncToRegister();
    final List<EnrollmentAppointment> enrollmentAppointments = enrollmentAppointmentRepository.findEnrollmentsForSyncToRegister();
    final List<EnrollmentCommon> enrollmentsCombined = new ArrayList<>();
    final String registerUrl = environment.getRequiredProperty("app.register.url");

    enrollmentsCombined.addAll(enrollments);
    enrollmentsCombined.addAll(enrollmentAppointments);

    enrollmentsCombined.forEach(enrollment -> {
      final String examDate;
      final String language;
      final String id;
      final String level;
      final String examinerOid;
      final String examMunicipality;
      Map<String, GradeDTO> grades = new HashMap<>();

      if (enrollment instanceof Enrollment) {
        final ExamEvent examEvent = ((Enrollment) enrollment).getExamEvent();
        examDate = DateUtil.formatOptionalDate(examEvent.getDate());
        language = examEvent.getLanguage().toString();
        id = "ET-" + ((Enrollment) enrollment).getId();
        level = LEVEL_EXCELLENT;
        examinerOid = null;
        examMunicipality = null;
      } else {
        final ExaminerExamEvent examEvent = ((EnrollmentAppointment) enrollment).getExaminerExamEvent();
        id = "HTT-" + ((EnrollmentAppointment) enrollment).getId();
        examDate = DateUtil.formatOptionalDate(examEvent.getDate());
        language = examEvent.getLanguage().toString();
        level = LEVEL_GOOD_AND_SATISFACTORY;
        examinerOid = examEvent.getExaminer().getOid();
        grades = getGrades((EnrollmentAppointment) enrollment);
        examMunicipality = examEvent.getMunicipality() != null ? examEvent.getMunicipality().getCode() : null;

        if (grades.isEmpty()) {
          return;
        }
      }

      // Sanity check. In production there should always
      // be person associated with enrollment but not
      // in test due to faulty demo data
      if (enrollment.getPerson() == null) {
        LOG.error(String.format("Sync failed. No person for enrollment (%s)", id));
        return;
      }

      if (enrollment.getPerson().getOid() == null || enrollment.getPerson().getOid().isEmpty()) {
        LOG.error(String.format("Sync failed. No oid for person in enrollment (%s)", id));
        return;
      }

      final RegisterPersonDTO personDTO = PersonUtil.createRegistryPersonDTO(enrollment.getPerson());
      final SourceDTO sourceDTO = SourceDTO.builder().id(id).lahde("KIOS").build();
      final List<PartialExamsDTO> partialExamsDTOS = new ArrayList<>();

      if (
        enrollment.isSpeakingPartialExam() &&
        (enrollment instanceof Enrollment || grades.containsKey(SPEAKING_PARTIAL_EXAM))
      ) {
        partialExamsDTOS.add(
          PartialExamsDTO
            .builder()
            .arviointi(grades.getOrDefault(SPEAKING_PARTIAL_EXAM, null))
            .tutkintopaiva(examDate)
            .tyyppi(SPEAKING_PARTIAL_EXAM)
            .build()
        );
      }

      if (
        enrollment.isWritingPartialExam() &&
        (enrollment instanceof Enrollment || grades.containsKey(WRITING_PARTIAL_EXAM))
      ) {
        partialExamsDTOS.add(
          PartialExamsDTO
            .builder()
            .arviointi(grades.getOrDefault(WRITING_PARTIAL_EXAM, null))
            .tutkintopaiva(examDate)
            .tyyppi(WRITING_PARTIAL_EXAM)
            .build()
        );
      }

      if (
        enrollment.isReadingComprehensionPartialExam() &&
        (enrollment instanceof Enrollment || grades.containsKey(READING_COMPREHENSION_PARTIAL_EXAM))
      ) {
        partialExamsDTOS.add(
          PartialExamsDTO
            .builder()
            .arviointi(grades.getOrDefault(READING_COMPREHENSION_PARTIAL_EXAM, null))
            .tutkintopaiva(examDate)
            .tyyppi(READING_COMPREHENSION_PARTIAL_EXAM)
            .build()
        );
      }

      if (
        enrollment.isSpeechComprehensionPartialExam() &&
        (enrollment instanceof Enrollment || grades.containsKey(SPEECH_COMPREHENSION_PARTIAL_EXAM))
      ) {
        partialExamsDTOS.add(
          PartialExamsDTO
            .builder()
            .arviointi(grades.getOrDefault(SPEECH_COMPREHENSION_PARTIAL_EXAM, null))
            .tutkintopaiva(examDate)
            .tyyppi(SPEECH_COMPREHENSION_PARTIAL_EXAM)
            .build()
        );
      }

      final RegisterEnrollmentDTO enrollmentDTO = RegisterEnrollmentDTO
        .builder()
        .kieli(language)
        .tyyppi("valtionhallinnonkielitutkinto")
        .suorituksenVastaanottaja(examinerOid)
        .suorituspaikkakunta(examMunicipality)
        .lahdejarjestelmanId(sourceDTO)
        .taitotaso(level)
        .osakokeet(partialExamsDTOS)
        .build();

      final RegisterSyncDTO registerSyncDTO = RegisterSyncDTO
        .builder()
        .henkilo(personDTO)
        .suoritus(enrollmentDTO)
        .build();
      final ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
      final String bodyJson;

      try {
        bodyJson = objectMapper.writeValueAsString(registerSyncDTO);
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }

      final Request request = defaultRequestBuilder()
        .setUrl(registerUrl)
        .setMethod(HttpConstants.Methods.PUT)
        .setBody(bodyJson)
        .build();

      LOG.info(String.format("Starting register sync for (%s)", id));

      final Response response;
      try {
        response = registerClient.executeBlocking(request);
      } catch (final ExecutionException | InterruptedException e) {
        throw new RuntimeException(e);
      }

      // {"result":"OK"}
      final String responseBody = response.getResponseBody();

      if (response.getStatusCode() == HttpStatus.OK.value()) {
        // Must add 10 seconds to make sure last_sync is greater than modified_at
        enrollment.setLastSyncAt(LocalDateTime.now().plusSeconds(10));

        if (enrollment instanceof EnrollmentAppointment) {
          enrollmentAppointmentRepository.saveAndFlush((EnrollmentAppointment) enrollment);
        } else {
          enrollmentRepository.saveAndFlush((Enrollment) enrollment);
        }

        LOG.info(String.format("Register sync successful for (%s)", id));
      } else {
        LOG.error(
          String.format(
            "Register sync failed for (%s) with response (%s) and status (%d)",
            id,
            responseBody,
            response.getStatusCode()
          )
        );
      }
    });
  }

  private Map<String, GradeDTO> getGrades(final EnrollmentAppointment enrollment) {
    final Map<String, GradeDTO> grades = new HashMap<>();
    final EnrollmentGrade enrollmentGrade = enrollment.getGrade();

    if (enrollmentGrade == null) {
      return grades;
    }

    if (enrollmentGrade.getReadingComprehensionPartialExamGrade() != null) {
      grades.put(
        READING_COMPREHENSION_PARTIAL_EXAM,
        getGradeDto(
          enrollmentGrade.getReadingComprehensionPartialExamGrade(),
          enrollmentGrade.getModifiedAt().toLocalDate()
        )
      );
    }

    if (enrollmentGrade.getSpeechComprehensionPartialExamGrade() != null) {
      grades.put(
        SPEECH_COMPREHENSION_PARTIAL_EXAM,
        getGradeDto(
          enrollmentGrade.getSpeechComprehensionPartialExamGrade(),
          enrollmentGrade.getModifiedAt().toLocalDate()
        )
      );
    }

    if (enrollmentGrade.getSpeakingPartialExamGrade() != null) {
      grades.put(
        SPEAKING_PARTIAL_EXAM,
        getGradeDto(enrollmentGrade.getSpeakingPartialExamGrade(), enrollmentGrade.getModifiedAt().toLocalDate())
      );
    }

    if (enrollmentGrade.getWritingPartialExamGrade() != null) {
      grades.put(
        WRITING_PARTIAL_EXAM,
        getGradeDto(enrollmentGrade.getWritingPartialExamGrade(), enrollmentGrade.getModifiedAt().toLocalDate())
      );
    }

    return grades;
  }

  private RequestBuilder defaultRequestBuilder() {
    return new RequestBuilder()
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout(Duration.ofMinutes(2))
      .setFollowRedirect(true);
  }

  private GradeDTO getGradeDto(final EnrollmentGradeType grade, final LocalDate date) {
    final String koodiarvo =
      switch (grade) {
        case GOOD -> "hyva";
        case FAILED -> "hylatty";
        case SATISFACTORY -> "tyydyttava";
      };

    return GradeDTO.builder().arvosana(koodiarvo).paivamaara(DateUtil.formatOptionalDate(date)).build();
  }
}
