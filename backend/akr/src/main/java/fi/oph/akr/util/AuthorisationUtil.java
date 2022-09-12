package fi.oph.akr.util;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.clerk.AuthorisationDTO;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class AuthorisationUtil {

  public static List<AuthorisationDTO> filterEffectiveAuthorisations(final List<AuthorisationDTO> authorisationDTOS) {
    return authorisationDTOS
      .stream()
      .filter(a -> a.termEndDate() == null || isBeforeOrEqualTo(LocalDate.now(), a.termEndDate()))
      .toList();
  }

  public static List<AuthorisationDTO> filterExpiringAuthorisations(final List<AuthorisationDTO> authorisationDTOS) {
    final LocalDate now = LocalDate.now();
    final LocalDate expiryThreshold = now.plusMonths(3);

    return authorisationDTOS
      .stream()
      .filter(a ->
        a.termEndDate() != null &&
        isBeforeOrEqualTo(now, a.termEndDate()) &&
        isBeforeOrEqualTo(a.termEndDate(), expiryThreshold)
      )
      .toList();
  }

  public static List<AuthorisationDTO> filterExpiredAuthorisations(final List<AuthorisationDTO> authorisationDTOS) {
    return authorisationDTOS
      .stream()
      .filter(a -> a.termEndDate() != null && LocalDate.now().isAfter(a.termEndDate()))
      .toList();
  }

  private static boolean isBeforeOrEqualTo(final LocalDate date1, final LocalDate date2) {
    return !date1.isAfter(date2);
  }

  public static List<AuthorisationDTO> filterExpiredDeduplicates(
    final List<AuthorisationDTO> expiredAuthorisations,
    final List<AuthorisationDTO> effectiveAuthorisations
  ) {
    final Set<LanguagePairDTO> effectiveLanguagePairs = effectiveAuthorisations
      .stream()
      .map(AuthorisationDTO::languagePair)
      .collect(Collectors.toSet());

    final Map<LanguagePairDTO, AuthorisationDTO> deduplicated = new LinkedHashMap<>();

    expiredAuthorisations.forEach(authorisationDTO -> {
      final LanguagePairDTO key = authorisationDTO.languagePair();

      if (!effectiveLanguagePairs.contains(key)) {
        if (deduplicated.containsKey(key)) {
          final LocalDate existingEndDate = deduplicated.get(key).termEndDate();

          if (existingEndDate != null) {
            final LocalDate endDate = authorisationDTO.termEndDate();

            if (endDate == null || endDate.isAfter(existingEndDate)) {
              deduplicated.put(key, authorisationDTO);
            }
          }
        } else {
          deduplicated.put(key, authorisationDTO);
        }
      }
    });

    return List.copyOf(deduplicated.values());
  }
}
