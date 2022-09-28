package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PublicExamEventProjection;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicExamEventService {

  @Resource
  private final ExamEventRepository examEventRepository;

  public List<PublicExamEventDTO> listExamEvents(final ExamLevel level) {
    final List<PublicExamEventProjection> projections = examEventRepository.listPublicExamEventProjections(level);
    final List<PublicExamEventProjection> examEventProjections = addRandomization(projections);

    return examEventProjections
      .stream()
      .map(e ->
        PublicExamEventDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .hasCongestion(e.hasCongestion())
          .build()
      )
      .sorted(Comparator.comparing(PublicExamEventDTO::date).thenComparing(PublicExamEventDTO::language))
      .toList();
  }

  // TODO: remove this, setting random participants and hasCongestion given that information is currently not available
  private List<PublicExamEventProjection> addRandomization(final List<PublicExamEventProjection> examEventProjections) {
    final Random random = new Random();

    return examEventProjections
      .stream()
      .map(e ->
        new PublicExamEventProjection(
          e.id(),
          e.language(),
          e.date(),
          e.registrationCloses(),
          random.nextInt(e.maxParticipants() + 1),
          e.maxParticipants(),
          random.nextInt(e.maxParticipants()) % 9 == 0
        )
      )
      .toList();
  }
}
