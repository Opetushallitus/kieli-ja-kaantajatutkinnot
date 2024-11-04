package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsInitDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.service.onr.OnrService;
import fi.oph.vkt.service.onr.PersonalData;
import fi.oph.vkt.util.ExaminerUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerDetailsService {

  private final ExaminerRepository examinerRepository;
  private final MunicipalityService municipalityService;
  private final OnrService onrService;
  private final AuditService auditService;

  private PersonalData getOnrPersonalData(final String oid) {
    Map<String, PersonalData> oidToData = onrService.getOnrPersonalData(List.of(oid));
    return oidToData.get(oid);
  }

  @Transactional(readOnly = true)
  public ExaminerDetailsInitDTO getInitialExaminerPersonalData(final String oid) {
    // TODO Audit log entry
    if (examinerRepository.findByOid(oid).isPresent()) {
      throw new APIException(APIExceptionType.EXAMINER_ALREADY_INITIALIZED);
    }
    PersonalData personalData = this.getOnrPersonalData(oid);
    if (personalData == null) {
      throw new APIException(APIExceptionType.EXAMINER_ONR_NOT_FOUND);
    }
    return ExaminerDetailsInitDTO
      .builder()
      .oid(oid)
      .lastName(personalData.getLastName())
      .firstName(personalData.getFirstName())
      .build();
  }

  @Transactional
  public ExaminerDetailsDTO upsertExaminer(final String oid, ExaminerDetailsUpsertDTO examinerDetailsUpsertDTO) {
    // TODO Audit log entry
    Optional<Examiner> existing = examinerRepository.findByOid(oid);
    Examiner examiner;
    if (existing.isPresent()) {
      examiner = existing.get();
    } else {
      examiner = new Examiner();
      examiner.setOid(oid);
      PersonalData personalData = this.getOnrPersonalData(oid);
      if (personalData == null) {
        throw new APIException(APIExceptionType.EXAMINER_ONR_NOT_FOUND);
      }
      examiner.setLastName(personalData.getLastName());
      examiner.setFirstName(personalData.getFirstName());
      examiner.setNickname(personalData.getNickname());
    }
    examiner.setEmail(examinerDetailsUpsertDTO.email());
    examiner.setPhoneNumber(examinerDetailsUpsertDTO.phoneNumber());
    examiner.setMunicipalities(
      examinerDetailsUpsertDTO
        .municipalities()
        .stream()
        .map(municipality -> municipalityService.getOrCreateByCode(municipality.code()))
        .collect(Collectors.toList())
    );
    examiner.setExamLanguageFinnish(examinerDetailsUpsertDTO.examLanguageFinnish());
    examiner.setExamLanguageSwedish(examinerDetailsUpsertDTO.examLanguageSwedish());
    examiner.setPublic(examinerDetailsUpsertDTO.isPublic());
    examinerRepository.saveAndFlush(examiner);

    return ExaminerUtil.toExaminerDetailsDTO(examiner);
  }

  @Transactional(readOnly = true)
  public ExaminerDetailsDTO getExaminer(final String oid) {
    // TODO Audit log entry
    Examiner examiner = examinerRepository.getByOid(oid);
    if (examiner == null) {
      throw new APIException(APIExceptionType.EXAMINER_NOT_FOUND);
    }
    return ExaminerUtil.toExaminerDetailsDTO(examiner);
  }

  @Transactional
  public void updateStoredPersonalData() {
    final List<String> onrIds = examinerRepository.listExistingOnrIds();
    final Map<String, PersonalData> oidToPersonalData = onrService.getOnrPersonalData(onrIds);
    oidToPersonalData.forEach((k, v) -> {
      Examiner examiner = examinerRepository.getByOid(k);
      examiner.setLastName(v.getLastName());
      examiner.setFirstName(v.getFirstName());
      examiner.setNickname(v.getNickname());
      examinerRepository.saveAndFlush(examiner);
    });
  }
}
