package fi.oph.otr.service;

import fi.oph.otr.api.dto.InterpreterDTO;
import fi.oph.otr.api.dto.LanguagePairDTO;
import fi.oph.otr.model.Interpreter;
import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.model.PersonalData;
import fi.oph.otr.repository.InterpreterQualificationProjection;
import fi.oph.otr.repository.InterpreterRegionProjection;
import fi.oph.otr.repository.InterpreterRepository;
import fi.oph.otr.repository.QualificationRepository;
import fi.oph.otr.repository.RegionRepository;
import jakarta.annotation.Resource;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicInterpreterService {

  @Resource
  private final InterpreterRepository interpreterRepository;

  @Resource
  private final QualificationRepository qualificationRepository;

  @Resource
  private final RegionRepository regionRepository;

  @Resource
  private final OnrService onrService;

  private static final Logger LOG = LoggerFactory.getLogger(PublicInterpreterService.class);

  @Transactional(readOnly = true)
  public List<InterpreterDTO> list() {
    final Map<Long, List<InterpreterRegionProjection>> interpreterRegionProjections = regionRepository
      .listInterpreterRegionProjections()
      .stream()
      .collect(Collectors.groupingBy(InterpreterRegionProjection::interpreterId));

    final Map<Long, List<InterpreterQualificationProjection>> interpreterQualifications = qualificationRepository
      .findQualificationsForPublicListing()
      .stream()
      .collect(Collectors.groupingBy(InterpreterQualificationProjection::interpreterId));

    final List<Interpreter> interpreters = interpreterRepository.findAllById(interpreterQualifications.keySet());
    final Map<String, PersonalData> personalDatas = onrService.getCachedPersonalDatas();

    final List<InterpreterDTO> interpreterDTOS = interpreters
      .stream()
      .map(interpreter -> {
        final PersonalData personalData = personalDatas.get(interpreter.getOnrId());
        final List<InterpreterRegionProjection> regionProjections = interpreterRegionProjections.getOrDefault(
          interpreter.getId(),
          Collections.emptyList()
        );
        final List<InterpreterQualificationProjection> qualificationProjections = interpreterQualifications.get(
          interpreter.getId()
        );

        return toDTO(interpreter, personalData, regionProjections, qualificationProjections);
      })
      .filter(Optional::isPresent)
      .map(Optional::get)
      .collect(Collectors.toCollection(ArrayList::new));

    Collections.shuffle(interpreterDTOS);
    return interpreterDTOS;
  }

  private Optional<InterpreterDTO> toDTO(
    final Interpreter interpreter,
    final PersonalData personalData,
    final List<InterpreterRegionProjection> regionProjections,
    final List<InterpreterQualificationProjection> qualificationProjections
  ) {
    if (personalData == null) {
      LOG.error("Personal data by onr id {} not found", interpreter.getOnrId());
      return Optional.empty();
    }
    final List<String> regions = regionProjections.stream().map(InterpreterRegionProjection::code).toList();

    final List<LanguagePairDTO> languagePairs = qualificationProjections
      .stream()
      .map(qp -> LanguagePairDTO.builder().from(qp.fromLang()).to(qp.toLang()).build())
      .toList();

    return Optional.of(
      InterpreterDTO
        .builder()
        .id(interpreter.getId())
        .firstName(personalData.getNickName())
        .lastName(personalData.getLastName())
        .email(interpreter.isPermissionToPublishEmail() ? personalData.getEmail() : null)
        .phoneNumber(interpreter.isPermissionToPublishPhone() ? personalData.getPhoneNumber() : null)
        .otherContactInfo(
          interpreter.isPermissionToPublishOtherContactInfo() ? interpreter.getOtherContactInformation() : null
        )
        .regions(regions)
        .languages(languagePairs)
        .build()
    );
  }
}
