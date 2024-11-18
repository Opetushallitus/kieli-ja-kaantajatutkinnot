package fi.oph.vkt.api.examiner;

import static org.springframework.http.MediaType.ALL_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.clerk.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.service.ExaminerEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}/enrollment", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerEnrollmentController {

  @Resource
  private ExaminerEnrollmentService examinerEnrollmentService;

  private static final String TAG_ENROLLMENT = "Examiner enrollment API";

  @PutMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}")
  @Operation(tags = TAG_ENROLLMENT, summary = "Update enrollment appointment")
  public ExaminerEnrollmentAppointmentDTO updateEnrollmentAppointment(
    @PathVariable String oid,
    @PathVariable Long enrollmentAppointmentId,
    @RequestBody @Valid final ExaminerEnrollmentAppointmentUpdateDTO dto
  ) {
    return examinerEnrollmentService.updateAppointment(oid, enrollmentAppointmentId, dto);
  }

  @GetMapping(path = "/contact/{enrollmentContactId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment contact request")
  public ClerkEnrollmentContactRequestDTO getEnrollmentContactRequest(
    @PathVariable String oid,
    @PathVariable final long enrollmentContactId
  ) {
    return examinerEnrollmentService.getEnrollmentContactRequest(oid, enrollmentContactId);
  }

  @PostMapping(path = "/contact/{enrollmentContactId:\\d+}/convertToAppointment", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Convert enrollment contact request to enrollment appointment")
  public ExaminerEnrollmentAppointmentDTO enrollmentContactRequestToAppointment(
    @PathVariable String oid,
    @PathVariable final long enrollmentContactId
  ) {
    return examinerEnrollmentService.convertToAppointment(oid, enrollmentContactId);
  }

  @GetMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment appointment")
  public ExaminerEnrollmentAppointmentDTO getEnrollmentAppointment(
    @PathVariable String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
    return examinerEnrollmentService.getEnrollmentAppointment(oid, enrollmentAppointmentId);
  }

  @PutMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/grades")
  @Operation(tags = TAG_ENROLLMENT, summary = "Update enrollment appointment grades")
  public ExaminerEnrollmentGradesDTO upsertEnrollmentAppointmentGrades(
    @PathVariable String oid,
    @RequestBody @Valid final ExaminerEnrollmentGradesDTO dto,
    @PathVariable final long enrollmentAppointmentId
  ) {
    return examinerEnrollmentService.upsertAppointmentGrades(oid, enrollmentAppointmentId, dto);
  }

  @GetMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/grades")
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment appointment grades")
  public ExaminerEnrollmentGradesDTO getEnrollmentAppointmentGrades(
    @PathVariable String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
    return examinerEnrollmentService.getAppointmentGrades(oid, enrollmentAppointmentId);
  }
}
