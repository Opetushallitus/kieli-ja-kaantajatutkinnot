package fi.oph.otr.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import fi.oph.otr.model.ExaminationType;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

public class QualificationUtilTest {

  // Contains duplicate FI-SV lang pair
  private final List<ClerkQualificationDTO> effectives = List.of(
    qualificationDTO("FI", "SV", LocalDate.now()),
    qualificationDTO("SV", "FI", LocalDate.now().plusDays(1)),
    qualificationDTO("FI", "EN", LocalDate.now().plusMonths(1)),
    qualificationDTO("FI", "RU", LocalDate.now().plusMonths(3)),
    qualificationDTO("FI", "SV", LocalDate.now().plusMonths(3).plusDays(1))
  );

  // FI-EN and FI-RU lang pairs also effective
  private final List<ClerkQualificationDTO> expired = List.of(
    qualificationDTO("FI", "EN", LocalDate.now().minusDays(1)),
    qualificationDTO("FI", "RU", LocalDate.now().minusMonths(1)),
    qualificationDTO("FI", "CS", LocalDate.now().minusYears(2)),
    qualificationDTO("FI", "CS", LocalDate.now().minusYears(1)),
    qualificationDTO("FI", "CS", LocalDate.now().minusYears(3))
  );

  private final List<ClerkQualificationDTO> qualifications = Stream
    .concat(effectives.stream(), expired.stream())
    .toList();

  @Test
  public void testFilterEffectiveQualifications() {
    final List<ClerkQualificationDTO> result = QualificationUtil.filterEffectiveQualifications(qualifications);
    assertEquals(effectives, result);
  }

  @Test
  public void testFilterExpiringQualifications() {
    final List<ClerkQualificationDTO> expiring = effectives.subList(0, 4);

    final List<ClerkQualificationDTO> result = QualificationUtil.filterExpiringQualifications(qualifications);
    assertEquals(expiring, result);
  }

  @Test
  public void testFilterExpiredQualifications() {
    final List<ClerkQualificationDTO> result = QualificationUtil.filterExpiredQualifications(qualifications);
    assertEquals(expired, result);
  }

  @Test
  public void filterExpiredDeduplicates() {
    final List<ClerkQualificationDTO> expiredDeduplicates = expired.subList(3, 4);

    final List<ClerkQualificationDTO> result = QualificationUtil.filterExpiredDeduplicates(expired, effectives);
    assertEquals(expiredDeduplicates, result);
  }

  private ClerkQualificationDTO qualificationDTO(final String from, final String to, final LocalDate endDate) {
    return ClerkQualificationDTO
      .builder()
      .id(0L)
      .version(0)
      .fromLang(from)
      .toLang(to)
      .beginDate(LocalDate.now().minusYears(5))
      .endDate(endDate)
      .permissionToPublish(true)
      .examinationType(ExaminationType.EAT)
      .build();
  }
}
