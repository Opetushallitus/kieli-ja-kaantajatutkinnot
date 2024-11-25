package fi.oph.vkt.api.examiner;

import static org.springframework.http.MediaType.ALL_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.service.ExaminerEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
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

  @DeleteMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Cancel enrollment appointment")
  public void cancelEnrollmentAppointment(
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
    examinerEnrollmentService.cancelEnrollmentAppointment(oid, enrollmentAppointmentId);
  }

  @GetMapping(path = "/contact/{enrollmentContactId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment contact request")
  public ClerkEnrollmentContactRequestDTO getEnrollmentContactRequest(
    @PathVariable final String oid,
    @PathVariable final long enrollmentContactId
  ) {
    return examinerEnrollmentService.getEnrollmentContactRequest(oid, enrollmentContactId);
  }

  @DeleteMapping(path = "/contact/{enrollmentContactId:\\d+}", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Delete enrollment contact request")
  public void deleteEnrollmentContactRequest(
    @PathVariable final String oid,
    @PathVariable final long enrollmentContactId
  ) {
    examinerEnrollmentService.deleteEnrollmentContactRequest(oid, enrollmentContactId);
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
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
    return examinerEnrollmentService.getEnrollmentAppointment(oid, enrollmentAppointmentId);
  }

  @GetMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/history", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment history for enrolled person")
  public List<ExaminerEnrollmentAppointmentHistoryDTO> getEnrollmentAppointmentHistory(
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
    return examinerEnrollmentService.getEnrollmentAppointmentHistory(oid, enrollmentAppointmentId);
  }

  @PostMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/sendAuthLink", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Send enrollment appointment auth link")
  public ExaminerEnrollmentAppointmentDTO sendEnrollmentAppointmentLink(
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId
  ) throws IOException, InterruptedException {
    return examinerEnrollmentService.sendEnrollmentAppointmentLink(oid, enrollmentAppointmentId);
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
