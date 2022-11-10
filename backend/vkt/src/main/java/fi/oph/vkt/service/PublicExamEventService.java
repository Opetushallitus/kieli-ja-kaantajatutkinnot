package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PublicExamEventProjection;
import fi.oph.vkt.repository.ReservationRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicExamEventService {

  private final ExamEventRepository examEventRepository;
  private final ReservationRepository reservationRepository;

  @Transactional(readOnly = true)
  public List<PublicExamEventDTO> listExamEvents(final ExamLevel level) {
    final List<PublicExamEventProjection> examEventProjections = examEventRepository.listPublicExamEventProjections(
      level
    );
    final Map<Long, Integer> reservationsByExamEvent = reservationRepository.countActiveReservationsByExamEvent();

    return examEventProjections
      .stream()
      .map(e -> {
        final int reservationsCount = reservationsByExamEvent.getOrDefault(e.id(), 0);
        final boolean hasCongestion =
          e.participants() < e.maxParticipants() && e.participants() + reservationsCount >= e.maxParticipants();
        return PublicExamEventDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .hasCongestion(hasCongestion)
          .build();
      })
      .sorted(Comparator.comparing(PublicExamEventDTO::date).thenComparing(PublicExamEventDTO::language))
      .toList();
  }
}
