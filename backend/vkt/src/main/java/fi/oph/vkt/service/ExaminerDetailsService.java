package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerDetailsDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsInitDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerDetailsUpsertDTO;
import fi.oph.vkt.audit.AuditService;
import fi.oph.vkt.audit.VktOperation;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.type.EnrollmentAppointmentStatus;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
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
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerDetailsService {

  private final ExaminerRepository examinerRepository;
  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final MunicipalityService municipalityService;
  private final OnrService onrService;
  private final AuditService auditService;
  private final Environment environment;

  private PersonalData getOnrPersonalData(final String oid) {
    Map<String, PersonalData> oidToData = onrService.getOnrPersonalData(List.of(oid));
    return oidToData.get(oid);
  }

  @Transactional(readOnly = true)
  public ExaminerDetailsInitDTO getInitialExaminerPersonalData(final String oid) {
    if (examinerRepository.findByOid(oid).isPresent()) {
      throw new APIException(APIExceptionType.EXAMINER_ALREADY_INITIALIZED);
    }
    final PersonalData personalData = this.getOnrPersonalData(oid);
    if (personalData == null) {
      throw new APIException(APIExceptionType.EXAMINER_ONR_NOT_FOUND);
    }

    auditService.logById(VktOperation.GET_EXAMINER_INITIAL_DETAILS, oid);

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
    final Optional<Examiner> existing = examinerRepository.findByOid(oid);
    final Examiner examiner = existing.orElse(new Examiner());

    examiner.setOid(oid);

    final PersonalData personalData = this.getOnrPersonalData(oid);
    if (personalData == null) {
      throw new APIException(APIExceptionType.EXAMINER_ONR_NOT_FOUND);
    }

    examiner.setLastName(personalData.getLastName());
    examiner.setFirstName(personalData.getFirstName());
    examiner.setNickname(personalData.getNickname());
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
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    return ExaminerUtil.toExaminerDetailsDTO(examiner, List.of(), baseUrlAPI);
  }

  @Transactional(readOnly = true)
  public ExaminerDetailsDTO getExaminer(final String oid) {
    final Examiner examiner = examinerRepository.getByOid(oid);
    if (examiner == null) {
      throw new APIException(APIExceptionType.EXAMINER_NOT_FOUND);
    }

    auditService.logById(VktOperation.LIST_EXAMINER_DETAILS, oid);

    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");
    final List<EnrollmentAppointment> enrollmentAppointments = enrollmentAppointmentRepository.findExaminerContactRequests(
      examiner
    );

    return ExaminerUtil.toExaminerDetailsDTO(examiner, enrollmentAppointments, baseUrlAPI);
  }

  @Transactional
  public void updateStoredPersonalData() {
    final List<String> onrIds = examinerRepository.listExistingOnrIds();
    final Map<String, PersonalData> oidToPersonalData = onrService.getOnrPersonalData(onrIds);
    oidToPersonalData.forEach((k, v) -> {
      final Examiner examiner = examinerRepository.getByOid(k);
      examiner.setLastName(v.getLastName());
      examiner.setFirstName(v.getFirstName());
      examiner.setNickname(v.getNickname());
      examinerRepository.saveAndFlush(examiner);
    });
  }
}
