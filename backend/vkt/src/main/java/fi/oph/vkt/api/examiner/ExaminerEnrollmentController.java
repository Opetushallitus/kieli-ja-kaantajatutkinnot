package fi.oph.vkt.api.examiner;

import static org.springframework.http.MediaType.ALL_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentMoveDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentHistoryDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentBirthdateOrSsnDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentContactRequestDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentExamEventDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentGradesDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerOnrBirthdateDTO;
import fi.oph.vkt.service.ExaminerEnrollmentService;
import fi.oph.vkt.service.ExaminerPersonService;
import fi.oph.vkt.service.aws.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}/enrollment", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerEnrollmentController {

  @Resource
  private ExaminerEnrollmentService examinerEnrollmentService;

  @Resource
  private ExaminerPersonService examinerPersonService;

  @Resource
  private S3Service s3Service;

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
  public ExaminerEnrollmentContactRequestDTO getEnrollmentContactRequest(
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
    @PathVariable final String oid,
    @PathVariable final long enrollmentContactId,
    @RequestBody @Valid final ExaminerEnrollmentExamEventDTO examEvent
  ) {
    return examinerEnrollmentService.convertToAppointment(oid, enrollmentContactId, examEvent);
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

  @PutMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/move")
  @Operation(tags = TAG_ENROLLMENT, summary = "Move enrollment to another exam event")
  public ExaminerEnrollmentAppointmentDTO move(
    @PathVariable final String oid,
    @RequestBody @Valid final ClerkEnrollmentMoveDTO dto
  ) {
    return examinerEnrollmentService.move(oid, dto);
  }

  @PostMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/sendAuthLink", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Send enrollment appointment auth link")
  public ExaminerEnrollmentAppointmentDTO sendEnrollmentAppointmentLink(
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId
  ) {
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

  @PostMapping(path = "/birthdate", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Get birthdate from ONR")
  public ExaminerOnrBirthdateDTO getOnrBirthdate(@PathVariable String oid, @RequestParam final String personOid) {
    return examinerPersonService.getOnrBirthdate(personOid, oid);
  }

  @PostMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/createPerson")
  @Operation(tags = TAG_ENROLLMENT, summary = "Get enrollment appointment grades")
  public ExaminerOnrBirthdateDTO createEnrollmentAppointmentPerson(
    @PathVariable String oid,
    @PathVariable final long enrollmentAppointmentId,
    @RequestBody @Valid final ExaminerEnrollmentBirthdateOrSsnDTO dto
  ) {
    return examinerEnrollmentService.createPersonForAppointment(oid, enrollmentAppointmentId, dto);
  }

  @GetMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}/attachment", consumes = ALL_VALUE)
  @Operation(tags = TAG_ENROLLMENT, summary = "Download enrollment appointment attachment")
  public void attachmentRedirect(
    @PathVariable final String oid,
    @PathVariable final long enrollmentAppointmentId,
    @RequestParam final String key,
    final HttpServletResponse response
  ) throws IOException {
    examinerEnrollmentService.verifyAttachmentAccess(oid, enrollmentAppointmentId, key);
    response.sendRedirect(s3Service.getPresignedUrl(key));
  }
}
