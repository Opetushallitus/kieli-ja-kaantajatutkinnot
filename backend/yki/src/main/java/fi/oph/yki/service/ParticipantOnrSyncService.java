package fi.oph.yki.service;

import fi.oph.yki.model.ParticipantOnr;
import fi.oph.yki.model.RuntimeFlag;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ParticipantOnrRepository;
import fi.oph.yki.repository.RuntimeFlagRepository;
import java.time.LocalDateTime;
import java.util.List;
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
      .findAllById(List.copyOf(onrPersons.keySet()))
      .stream()
      .collect(Collectors.toMap(ParticipantOnr::getOid, Function.identity()));

    // The key is the OID that was asked for. The person is the master person, and its own OID is
    // another one when the OID asked for is a linked duplicate.
    for (final Map.Entry<String, PersonalDataDTO> onrPerson : onrPersons.entrySet()) {
      final String oid = onrPerson.getKey();
      final PersonalDataDTO person = onrPerson.getValue();
      ParticipantOnr participantOnr = existing.get(oid);

      if (participantOnr == null) {
        // ONR has not been asked about this person before, so link the person to the participant.
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
