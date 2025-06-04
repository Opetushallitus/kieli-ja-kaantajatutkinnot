package fi.oph.vkt.service;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.api.dto.integration.PartialExamsDTO;
import fi.oph.vkt.api.dto.integration.RegisterEnrollmentDTO;
import fi.oph.vkt.api.dto.integration.RegisterPersonDTO;
import fi.oph.vkt.api.dto.integration.RegisterSyncDTO;
import fi.oph.vkt.api.dto.integration.SourceDTO;
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
import fi.oph.vkt.util.LocalisationUtil;
import fi.oph.vkt.util.PersonUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RegisterEnrollmentService {

  public static final String SPEAKING_PARTIAL_EXAM = "puhuminen";
  public static final String WRITING_PARTIAL_EXAM = "kirjoittaminen";
  public static final String READING_COMPREHENSION_PARTIAL_EXAM = "tekstinymmartaminen";
  public static final String SPEECH_COMPREHENSION_PARTIAL_EXAM = "puheenymmartaminen";

  private final WebClient registerClient;
  private final EnrollmentRepository enrollmentRepository;
  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;

  @Transactional(readOnly = true)
  public void sync() throws JsonProcessingException {
    final List<Enrollment> enrollments = enrollmentRepository.findEnrollmentsForSyncToRegister();
    final List<EnrollmentAppointment> enrollmentAppointments = enrollmentAppointmentRepository.findEnrollmentsForSyncToRegister();
    final List<EnrollmentCommon> enrollmentsCombined = new ArrayList<>();

    enrollmentsCombined.addAll(enrollments);
    enrollmentsCombined.addAll(enrollmentAppointments);

    final List<RegisterSyncDTO> registerSyncDTOS = enrollmentsCombined
      .stream()
      .map(enrollment -> {
        String examDate;
        String language;
        String id;
        String level;
        String examinerOid;
        Map<String, String> grades = new HashMap<>();
        if (enrollment instanceof Enrollment) {
          final ExamEvent examEvent = ((Enrollment) enrollment).getExamEvent();
          examDate = DateUtil.formatOptionalDate(examEvent.getDate());
          language = examEvent.getLanguage().toString();
          id = String.valueOf(((Enrollment) enrollment).getId());
          level = "erinomainen";
          examinerOid = null;
        } else {
          final ExaminerExamEvent examEvent = ((EnrollmentAppointment) enrollment).getExaminerExamEvent();
          id = String.valueOf(((EnrollmentAppointment) enrollment).getId());
          examDate = DateUtil.formatOptionalDate(examEvent.getDate());
          language = examEvent.getLanguage().toString();
          level = "hyva-ja-tyydyttava";
          examinerOid = examEvent.getExaminer().getOid();
          grades = getGrades((EnrollmentAppointment) enrollment);
        }

        final RegisterPersonDTO personDTO = PersonUtil.createRegistryPersonDTO(enrollment.getPerson());
        final SourceDTO sourceDTO = SourceDTO.builder().id(id).lahde("KIOS").build();
        final List<PartialExamsDTO> partialExamsDTOS = new ArrayList<>();

        if (enrollment.isSpeakingPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault(SPEAKING_PARTIAL_EXAM, null))
              .tutkintopaiva(examDate)
              .tyyppi(SPEAKING_PARTIAL_EXAM)
              .build()
          );
        }

        if (enrollment.isWritingPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault(WRITING_PARTIAL_EXAM, null))
              .tutkintopaiva(examDate)
              .tyyppi(WRITING_PARTIAL_EXAM)
              .build()
          );
        }

        if (enrollment.isReadingComprehensionPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault(READING_COMPREHENSION_PARTIAL_EXAM, null))
              .tutkintopaiva(examDate)
              .tyyppi(READING_COMPREHENSION_PARTIAL_EXAM)
              .build()
          );
        }

        if (enrollment.isSpeechComprehensionPartialExam()) {
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
          .organisaatioOid(examinerOid)
          .lahdejarjestelmanId(sourceDTO)
          .taitotaso(level)
          .osakokeet(partialExamsDTOS)
          .build();

        return RegisterSyncDTO.builder().henkilo(personDTO).suoritus(enrollmentDTO).build();
      })
      .toList();

    registerSyncDTOS.forEach(dto -> {
      final ObjectMapper objectMapper = new ObjectMapper();
      final String bodyJson;

      try {
        bodyJson = objectMapper.writeValueAsString(dto);
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }

      registerClient
        .post()
        .uri("/oid")
        .bodyValue(bodyJson)
        .exchangeToMono(clientResponse -> {
          if (clientResponse.statusCode().isError()) {
            return clientResponse.createException().flatMap(Mono::error);
          }
          return clientResponse.bodyToMono(String.class);
        })
        .block();
    });
  }

  private Map<String, String> getGrades(final EnrollmentAppointment enrollment) {
    final Map<String, String> grades = new HashMap<>();
    final EnrollmentGrade enrollmentGrade = enrollment.getGrade();

    if (enrollmentGrade.getReadingComprehensionPartialExamGrade() != null) {
      grades.put(
        READING_COMPREHENSION_PARTIAL_EXAM,
        translateGrade(enrollmentGrade.getReadingComprehensionPartialExamGrade())
      );
    }

    if (enrollmentGrade.getSpeechComprehensionPartialExamGrade() != null) {
      grades.put(
        SPEECH_COMPREHENSION_PARTIAL_EXAM,
        translateGrade(enrollmentGrade.getSpeechComprehensionPartialExamGrade())
      );
    }

    if (enrollmentGrade.getSpeakingPartialExamGrade() != null) {
      grades.put(SPEAKING_PARTIAL_EXAM, translateGrade(enrollmentGrade.getSpeakingPartialExamGrade()));
    }

    if (enrollmentGrade.getWritingPartialExamGrade() != null) {
      grades.put(WRITING_PARTIAL_EXAM, translateGrade(enrollmentGrade.getWritingPartialExamGrade()));
    }

    return grades;
  }

  private String translateGrade(final EnrollmentGradeType grade) {
    return LocalisationUtil.translate(localeFI, "grade." + grade.toString());
  }
}
