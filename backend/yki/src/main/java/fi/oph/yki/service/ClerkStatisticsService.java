package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.ClerkStatisticsRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkStatisticsRowDTO;
import fi.oph.yki.model.type.LanguageCode;
import fi.oph.yki.model.type.LevelCode;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.repository.StatisticsProjection;
import fi.oph.yki.util.CodeNameMapper;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClerkStatisticsService {

  private final RegistrationRepository registrationRepository;
  private final OrganizationService organizationService;

  @Transactional(readOnly = true)
  public List<ClerkStatisticsRowDTO> getStatistics(final ClerkStatisticsRequestDTO request) {
    final List<String> languageCodes = request.languages() == null || request.languages().isEmpty()
      ? Arrays.stream(LanguageCode.values()).map(Enum::name).toList()
      : toNames(request.languages(), LanguageCode::name);

    final List<String> levelCodes = request.levels() == null || request.levels().isEmpty()
      ? Arrays.stream(LevelCode.values()).map(Enum::name).toList()
      : toNames(request.levels(), LevelCode::name);

    final List<String> stateCodes = request.states() == null || request.states().isEmpty()
      ? Arrays.stream(RegistrationState.values()).map(Enum::name).toList()
      : toNames(request.states(), RegistrationState::name);

    final List<StatisticsProjection> rows = registrationRepository.findStatisticsRows(
      request.from(),
      request.to(),
      languageCodes,
      levelCodes,
      stateCodes,
      request.municipality()
    );

    final List<StatisticsProjection> filtered = request.organizers() == null
      ? rows
      : rows.stream().filter(row -> request.organizers().contains(row.getOrganizerOid())).toList();

    if (filtered.isEmpty()) {
      throw new APIException(APIExceptionType.STATISTICS_EMPTY_RESULT);
    }

    final Map<String, String> organizerNames = organizationService.getOrganizationNames(
      filtered.stream().map(StatisticsProjection::getOrganizerOid).distinct().toList()
    );

    return filtered
      .stream()
      .map(row ->
        ClerkStatisticsRowDTO
          .builder()
          .organizer(organizerNames.getOrDefault(row.getOrganizerOid(), row.getOrganizerOid()))
          .examDate(row.getExamDate())
          .examLanguage(CodeNameMapper.languageName(row.getLanguageCode()))
          .examLevel(CodeNameMapper.levelName(row.getLevelCode()))
          .registrationState(row.getState())
          .municipality(row.getMunicipality())
          .availablePlaces(row.getMaxParticipants())
          .build()
      )
      .toList();
  }

  private static <T> List<String> toNames(final List<T> values, final Function<T, String> nameMapper) {
    return values == null ? null : values.stream().map(nameMapper).toList();
  }
}
