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
              .arviointi(grades.getOrDefault("puhuminen", null))
              .tutkintopaiva(examDate)
              .tyyppi("puhuminen")
              .build()
          );
        }

        if (enrollment.isWritingPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault("kirjoittaminen", null))
              .tutkintopaiva(examDate)
              .tyyppi("kirjoittaminen")
              .build()
          );
        }

        if (enrollment.isReadingComprehensionPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault("tekstinymmartaminen", null))
              .tutkintopaiva(examDate)
              .tyyppi("tekstinymmartaminen")
              .build()
          );
        }

        if (enrollment.isSpeechComprehensionPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO
              .builder()
              .arviointi(grades.getOrDefault("puheenymmartaminen", null))
              .tutkintopaiva(examDate)
              .tyyppi("puheenymmartaminen")
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
      grades.put("tekstinymmartaminen", translateGrade(enrollmentGrade.getReadingComprehensionPartialExamGrade()));
    }

    if (enrollmentGrade.getSpeechComprehensionPartialExamGrade() != null) {
      grades.put("puheenymmartaminen", translateGrade(enrollmentGrade.getSpeechComprehensionPartialExamGrade()));
    }

    if (enrollmentGrade.getSpeakingPartialExamGrade() != null) {
      grades.put("puhuminen", translateGrade(enrollmentGrade.getSpeakingPartialExamGrade()));
    }

    if (enrollmentGrade.getWritingPartialExamGrade() != null) {
      grades.put("kirjoittaminen", translateGrade(enrollmentGrade.getWritingPartialExamGrade()));
    }

    return grades;
  }

  private String translateGrade(final EnrollmentGradeType grade) {
    return LocalisationUtil.translate(localeFI, "grade." + grade.toString());
  }
}
