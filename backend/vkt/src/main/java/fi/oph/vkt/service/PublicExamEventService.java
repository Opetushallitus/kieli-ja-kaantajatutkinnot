package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.PublicExamEventProjection;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicExamEventService {

  private final ExamEventRepository examEventRepository;
  private final ReservationRepository reservationRepository;

  @Transactional(readOnly = true)
  public PublicExamEventDTO getExamEvent(final long examEventId) {
    final ExamEvent examEvent = examEventRepository.getReferenceById(examEventId);

    if (examEvent.getRegistrationCloses().isBefore(LocalDateTime.now())) {
      throw new NotFoundException(String.format("Exam event (%d) enrollment is closed", examEvent.getId()));
    }

    return PublicExamEventDTO
      .builder()
      .id(examEvent.getId())
      .language(examEvent.getLanguage())
      .date(examEvent.getDate())
      .registrationCloses(examEvent.getRegistrationCloses().toLocalDate())
      .registrationOpens(examEvent.getRegistrationOpens().toLocalDate())
      .openings(ExamEventUtil.getOpenings(examEvent))
      .hasCongestion(ExamEventUtil.isCongested(examEvent))
      .isOpen(ExamEventUtil.isOpen(examEvent.getRegistrationCloses(), examEvent.getRegistrationOpens()))
      .build();
  }

  @Transactional(readOnly = true)
  public List<PublicExamEventDTO> listExamEvents(final ExamLevel level) {
    final List<PublicExamEventProjection> examEventProjections = examEventRepository.listPublicExamEventProjections(
      level
    );
    final Set<Long> examEventIdsHavingQueue = examEventRepository.listPublicExamEventIdsWithQueue(level);
    final Map<Long, Long> reservationsByExamEvent = reservationRepository.countActiveReservationsByExamEvent();

    return examEventProjections
      .stream()
      .map(e -> {
        final long openings = examEventIdsHavingQueue.contains(e.id()) ? 0L : e.maxParticipants() - e.participants();
        final long reservations = reservationsByExamEvent.getOrDefault(e.id(), 0L);

        final boolean hasCongestion = ExamEventUtil.isCongested(openings, reservations);

        return PublicExamEventDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .date(e.date())
          .registrationCloses(e.registrationCloses().toLocalDate())
          .registrationOpens(e.registrationOpens().toLocalDate())
          .openings(openings)
          .hasCongestion(hasCongestion)
          .isOpen(ExamEventUtil.isOpen(e.registrationCloses(), e.registrationOpens()))
          .build();
      })
      .sorted(Comparator.comparing(PublicExamEventDTO::date).thenComparing(PublicExamEventDTO::language))
      .toList();
  }
}
