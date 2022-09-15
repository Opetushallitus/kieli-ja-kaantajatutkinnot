package fi.oph.akr.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fi.oph.akr.api.dto.LanguagePairDTO;
import fi.oph.akr.api.dto.clerk.AuthorisationDTO;
import fi.oph.akr.model.AuthorisationBasis;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

public class AuthorisationUtilTest {

  // Contains duplicate FI-SV lang pair
  private final List<AuthorisationDTO> effectives = List.of(
    authorisationDTO("FI", "SV", LocalDate.now()),
    authorisationDTO("SV", "FI", LocalDate.now().plusDays(1)),
    authorisationDTO("FI", "EN", LocalDate.now().plusMonths(1)),
    authorisationDTO("FI", "RU", LocalDate.now().plusMonths(3)),
    authorisationDTO("FI", "SV", LocalDate.now().plusMonths(3).plusDays(1)),
    authorisationDTO("EN", "SV", null)
  );

  // FI-EN and FI-RU lang pairs also effective
  private final List<AuthorisationDTO> expired = List.of(
    authorisationDTO("FI", "EN", LocalDate.now().minusDays(1)),
    authorisationDTO("FI", "RU", LocalDate.now().minusMonths(1)),
    authorisationDTO("FI", "CS", LocalDate.now().minusYears(2)),
    authorisationDTO("FI", "CS", LocalDate.now().minusYears(1)),
    authorisationDTO("FI", "CS", LocalDate.now().minusYears(3))
  );

  private final List<AuthorisationDTO> authorisations = Stream.concat(effectives.stream(), expired.stream()).toList();

  @Test
  public void testFilterEffectiveAuthorisations() {
    final List<AuthorisationDTO> result = AuthorisationUtil.filterEffectiveAuthorisations(authorisations);
    assertEquals(effectives, result);
  }

  @Test
  public void testFilterExpiringAuthorisations() {
    final List<AuthorisationDTO> expiring = effectives.subList(0, 4);
    assertEquals(4, expiring.size());

    final List<AuthorisationDTO> result = AuthorisationUtil.filterExpiringAuthorisations(authorisations);
    assertEquals(expiring, result);
  }

  @Test
  public void testFilterExpiredAuthorisations() {
    final List<AuthorisationDTO> result = AuthorisationUtil.filterExpiredAuthorisations(authorisations);
    assertEquals(expired, result);
  }

  @Test
  public void filterExpiredDeduplicates() {
    final List<AuthorisationDTO> expiredDeduplicates = expired.subList(3, 4);
    assertEquals(1, expiredDeduplicates.size());

    final List<AuthorisationDTO> result = AuthorisationUtil.filterExpiredDeduplicates(expired, effectives);
    assertEquals(expiredDeduplicates, result);
  }

  private AuthorisationDTO authorisationDTO(final String from, final String to, final LocalDate endDate) {
    return AuthorisationDTO
      .builder()
      .id(0L)
      .version(0)
      .languagePair(LanguagePairDTO.builder().from(from).to(to).build())
      .basis(AuthorisationBasis.KKT)
      .termBeginDate(LocalDate.now().minusYears(5))
      .termEndDate(endDate)
      .permissionToPublish(true)
      .build();
  }
}
