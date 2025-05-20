package fi.oph.vkt.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.vkt.api.dto.integration.PartialExamsDTO;
import fi.oph.vkt.api.dto.integration.RegisterEnrollmentDTO;
import fi.oph.vkt.api.dto.integration.RegisterPersonDTO;
import fi.oph.vkt.api.dto.integration.RegisterSyncDTO;
import fi.oph.vkt.api.dto.integration.SourceDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.util.DateUtil;
import fi.oph.vkt.util.PersonUtil;
import java.util.ArrayList;
import java.util.List;
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

  @Transactional(readOnly = true)
  public void sync() throws JsonProcessingException {
    final List<Enrollment> enrollments = enrollmentRepository.findEnrollmentsForSyncToRegister();

    final List<RegisterSyncDTO> registerSyncDTOS = enrollments
      .stream()
      .map(enrollment -> {
        final ExamEvent examEvent = enrollment.getExamEvent();
        final RegisterPersonDTO personDTO = PersonUtil.createRegistryPersonDTO(enrollment.getPerson());
        final SourceDTO sourceDTO = SourceDTO.builder().id(String.valueOf(enrollment.getId())).lahde("KIOS").build();
        final List<PartialExamsDTO> partialExamsDTOS = new ArrayList<>();
        final String examDate = DateUtil.formatOptionalDate(examEvent.getDate());

        if (enrollment.isSpeakingPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO.builder().arviointi(null).tutkintopaiva(examDate).tyyppi("puhuminen").build()
          );
        }

        if (enrollment.isWritingPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO.builder().arviointi(null).tutkintopaiva(examDate).tyyppi("kirjoittaminen").build()
          );
        }

        if (enrollment.isReadingComprehensionPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO.builder().arviointi(null).tutkintopaiva(examDate).tyyppi("tekstinymmartaminen").build()
          );
        }

        if (enrollment.isSpeechComprehensionPartialExam()) {
          partialExamsDTOS.add(
            PartialExamsDTO.builder().arviointi(null).tutkintopaiva(examDate).tyyppi("puheenymmartaminen").build()
          );
        }

        final RegisterEnrollmentDTO enrollmentDTO = RegisterEnrollmentDTO
          .builder()
          .kieli(examEvent.getLanguage().toString())
          .tyyppi("valtionhallinnonkielitutkinto")
          .organisaatioOid(null)
          .lahdejarjestelmanId(sourceDTO)
          .taitotaso("erinomainen")
          .osakokeet(partialExamsDTOS)
          .build();

        return RegisterSyncDTO.builder().henkilo(personDTO).suoritus(enrollmentDTO).build();
      })
      .toList();

    final ObjectMapper objectMapper = new ObjectMapper();
    final String bodyJson = objectMapper.writeValueAsString(registerSyncDTOS);

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
  }
}
