package fi.oph.otr.util;

import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.api.dto.clerk.ClerkQualificationDTO;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class QualificationUtil {

  public static List<ClerkQualificationDTO> filterEffectiveQualifications(
    final List<ClerkQualificationDTO> qualificationDTOS
  ) {
    return qualificationDTOS.stream().filter(q -> isBeforeOrEqualTo(LocalDate.now(), q.endDate())).toList();
  }

  public static List<ClerkQualificationDTO> filterExpiringQualifications(
    final List<ClerkQualificationDTO> qualificationDTOS
  ) {
    final LocalDate now = LocalDate.now();
    final LocalDate expiryThreshold = now.plusMonths(3);

    return qualificationDTOS
      .stream()
      .filter(q -> isBeforeOrEqualTo(now, q.endDate()) && isBeforeOrEqualTo(q.endDate(), expiryThreshold))
      .toList();
  }

  public static List<ClerkQualificationDTO> filterExpiredQualifications(
    final List<ClerkQualificationDTO> qualificationDTOS
  ) {
    return qualificationDTOS.stream().filter(q -> LocalDate.now().isAfter(q.endDate())).toList();
  }

  private static boolean isBeforeOrEqualTo(final LocalDate date1, final LocalDate date2) {
    return !date1.isAfter(date2);
  }

  public static List<ClerkQualificationDTO> filterExpiredDeduplicates(
    final List<ClerkQualificationDTO> expiredQualifications,
    final List<ClerkQualificationDTO> effectiveQualifications
  ) {
    final Set<LanguagePairDTO> effectiveLanguagePairs = effectiveQualifications
      .stream()
      .map(QualificationUtil::getQualificationLanguagePair)
      .collect(Collectors.toSet());

    final Map<LanguagePairDTO, ClerkQualificationDTO> deduplicated = new LinkedHashMap<>();

    expiredQualifications.forEach(qualificationDTO -> {
      final LanguagePairDTO key = QualificationUtil.getQualificationLanguagePair(qualificationDTO);

      if (!effectiveLanguagePairs.contains(key)) {
        if (deduplicated.containsKey(key)) {
          final LocalDate endDate = qualificationDTO.endDate();
          final LocalDate existingEndDate = deduplicated.get(key).endDate();

          if (endDate.isAfter(existingEndDate)) {
            deduplicated.put(key, qualificationDTO);
          }
        } else {
          deduplicated.put(key, qualificationDTO);
        }
      }
    });

    return List.copyOf(deduplicated.values());
  }

  private static LanguagePairDTO getQualificationLanguagePair(final ClerkQualificationDTO qualificationDTO) {
    return LanguagePairDTO.builder().from(qualificationDTO.fromLang()).to(qualificationDTO.toLang()).build();
  }
}
