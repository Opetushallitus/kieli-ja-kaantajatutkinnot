package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.clerk.ClerkExamEventListDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.repository.ClerkExamEventProjection;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.util.DateUtil;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import javax.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkExamEventService {

  @Resource
  private final ExamEventRepository examEventRepository;

  @Resource
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public List<ClerkExamEventListDTO> list() {
    final LocalDate now = LocalDate.now();
    final List<ClerkExamEventProjection> examEventProjections = examEventRepository.listClerkExamEventProjections();

    final List<ClerkExamEventListDTO> examEventListDTOs = examEventProjections
      .stream()
      .map(e -> {
        final boolean isPublic = e.isVisible() && DateUtil.isBeforeOrEqualTo(now, e.registrationCloses());

        return ClerkExamEventListDTO
          .builder()
          .id(e.id())
          .language(e.language())
          .level(e.level())
          .date(e.date())
          .registrationCloses(e.registrationCloses())
          .participants(e.participants())
          .maxParticipants(e.maxParticipants())
          .isPublic(isPublic)
          .build();
      })
      .sorted(Comparator.comparing(ClerkExamEventListDTO::date).thenComparing(ClerkExamEventListDTO::language))
      .toList();

    auditService.logOperation(VktOperation.LIST_EXAM_EVENTS);
    return examEventListDTOs;
  }
}
