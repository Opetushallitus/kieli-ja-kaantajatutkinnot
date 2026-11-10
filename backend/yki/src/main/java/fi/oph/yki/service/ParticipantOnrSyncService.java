package fi.oph.yki.service;

import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.repository.RuntimeFlagRepository;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParticipantOnrSyncService {

  private final ParticipantOnrRepository participantOnrRepository;
  private final RuntimeFlagRepository runtimeFlagRepository;

  /** Read without a lock, only to skip the ONR calls while the legacy backend owns the sync. */
  public boolean ownsSync() {
    return ownsSync(
      runtimeFlagRepository
        .findById(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)
        .map(RuntimeFlag::getValue)
        .orElse(RuntimeFlag.OWNER_LEGACY)
    );
  }

  @Transactional
  public boolean saveBatchIfOwner(
    final Map<String, PersonalDataDTO> onrPersons,
    final Map<String, Long> oidToParticipantId
  ) {
    final String owner = runtimeFlagRepository
      .findValueForShare(RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER)
      .orElse(RuntimeFlag.OWNER_LEGACY);
    if (!ownsSync(owner)) {
      return false;
    }

    final Map<String, ParticipantOnr> existing = participantOnrRepository
      .findAllById(onrPersons.values().stream().map(PersonalDataDTO::getOidHenkilo).toList())
      .stream()
      .collect(Collectors.toMap(ParticipantOnr::getOid, Function.identity()));

    for (final PersonalDataDTO person : onrPersons.values()) {
      final String oid = person.getOidHenkilo();
      ParticipantOnr participantOnr = existing.get(oid);
      if (participantOnr == null) {
        participantOnr = new ParticipantOnr();
        participantOnr.setOid(oid);
        participantOnr.setParticipantId(oidToParticipantId.get(oid));
      }
      participantOnr.setOppijanumero(person.getOppijanumero());

      participantOnr.setIndividualised(
        Boolean.TRUE.equals(person.getIndividualised()) ? Boolean.TRUE : person.getIndividualisedVtj()
      );
      participantOnr.setModifiedAt(LocalDateTime.now());

      participantOnrRepository.save(participantOnr);
    }
    return true;
  }

  private static boolean ownsSync(final String owner) {
    if (RuntimeFlag.OWNER_JAVA.equals(owner)) {
      return true;
    }

    if (RuntimeFlag.OWNER_LEGACY.equals(owner)) {
      return false;
    }

    throw new RuntimeException(
      String.format(
        "Unrecognised %s '%s', so neither backend syncs participant ONR data [ERROR_SCHEDULED_TASK]",
        RuntimeFlag.PARTICIPANT_ONR_SYNC_OWNER,
        owner
      )
    );
  }
}
